
import { GoogleGenAI, Chat, Content, Part } from "@google/genai";
import { Persona, Message, Attachment, Language, UserLearningProfile } from '../types';
import { PERSONA_CONFIGS } from '../constants';

let aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
      throw new Error("API Key not found");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

// Convert our internal Message format to Gemini SDK Content format
const convertToHistory = (messages: Message[]): Content[] => {
  return messages.map(m => {
    const parts: Part[] = [];
    
    // Add attachments if any (Restoring history with images)
    if (m.attachments && m.attachments.length > 0) {
      m.attachments.forEach(att => {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });
    }

    // Add text content
    if (m.content) {
      parts.push({ text: m.content });
    }

    return {
      role: m.role,
      parts: parts
    };
  });
};

export const createChatSession = (
  persona: Persona, 
  previousHistory: Message[] = [], 
  language: Language = 'pt-PT',
  learningProfile?: UserLearningProfile
): Chat => {
  const ai = getAiClient();
  const config = PERSONA_CONFIGS[persona];
  
  // --- SMART MEMORY MANAGEMENT (Sliding Window) ---
  // Goal: Keep initial context + Recent context. Forget the "middle" noise.
  let historyToProcess = previousHistory.filter(m => !m.isError); // Remove errors
  
  const MAX_HISTORY_LENGTH = 30; // Keep roughly last 15 turns
  const PRESERVE_START = 2; // Keep first user message and model response (context)

  if (historyToProcess.length > MAX_HISTORY_LENGTH) {
    // Keep the start (Context setting)
    const start = historyToProcess.slice(0, PRESERVE_START);
    // Keep the end (Recent problem solving)
    const end = historyToProcess.slice(-(MAX_HISTORY_LENGTH - PRESERVE_START));
    
    // IMPORTANT: Ensure we don't break the role alternation (User -> Model -> User)
    // If the slice makes us start with Model, remove one more to start with User
    if (end.length > 0 && end[0].role === 'model') {
       end.shift();
    }

    historyToProcess = [...start, ...end];
  }

  const history = convertToHistory(historyToProcess);

  // Inject Language Instruction
  const langInstruction = language === 'pt-PT' 
    ? "\nIMPORTANT: You MUST respond in Portuguese (Portugal - pt-PT). Use rigorous technical Portuguese from Portugal." 
    : "\nIMPORTANT: Respond in English (US).";

  // Inject Learning Profile (The "Brain")
  let memoryInstruction = "";
  if (learningProfile) {
    const prefs = learningProfile.preferences.length > 0 ? `\nUSER PREFERENCES (ADAPT TO THESE): ${learningProfile.preferences.join(', ')}` : "";
    const dislikes = learningProfile.dislikes.length > 0 ? `\nUSER DISLIKES (AVOID THESE): ${learningProfile.dislikes.join(', ')}` : "";
    memoryInstruction = prefs + dislikes;
  }

  const requestConfig: any = {
    systemInstruction: config.systemInstruction + langInstruction + memoryInstruction,
    // 0.7 offers a good balance for the 4x1 confluence
    temperature: 0.7, 
  };

  if (config.useSearch) {
    requestConfig.tools = [{ googleSearch: {} }];
  }
  
  return ai.chats.create({
    model: config.model,
    history: history,
    config: requestConfig,
  });
};

export const sendMessageWithAttachments = async (
  chat: Chat, 
  text: string, 
  attachments: Attachment[]
) => {
  const parts: Part[] = [];

  // Add attachments first
  attachments.forEach(att => {
    parts.push({
      inlineData: {
        mimeType: att.mimeType,
        data: att.data
      }
    });
  });

  // Add text if present
  if (text) {
    parts.push({ text: text });
  }

  // Optimize: If only text and no attachments, send as string to avoid 403 on some models
  if (parts.length === 1 && parts[0].text && !parts[0].inlineData) {
     return await chat.sendMessageStream({ message: parts[0].text });
  }

  if (parts.length > 0) {
    return await chat.sendMessageStream({ message: parts });
  } else {
    // Fallback for empty message to prevent API error
    return await chat.sendMessageStream({ message: " " });
  }
};

export const isApiKeyAvailable = (): boolean => {
  return !!process.env.API_KEY;
};
