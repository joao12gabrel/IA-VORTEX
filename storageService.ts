
import { ChatSession, Message, UserProfile, Persona, Language, UserLearningProfile } from '../types';

const KEYS = {
  USER: 'devmind_user_v1',
  SESSIONS: 'devmind_sessions_v1',
  MESSAGES_PREFIX: 'devmind_msg_',
  LANGUAGE: 'neuralsync_lang_v1',
  LEARNING_PROFILE: 'scyno_learning_v1'
};

// Helper: Check if error is QuotaExceeded
const isQuotaError = (e: any) => {
  return e && (
    e.name === 'QuotaExceededError' ||
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.code === 22 ||
    e.code === 1014
  );
};

// Helper: Attempt to free space by deleting oldest OTHER session
const pruneOldestSession = (excludeKey: string): boolean => {
  try {
    const sessionsStr = localStorage.getItem(KEYS.SESSIONS);
    if (!sessionsStr) return false;

    const sessions: ChatSession[] = JSON.parse(sessionsStr);
    if (sessions.length === 0) return false;

    // Sort by lastMessageAt ascending (Oldest first)
    sessions.sort((a, b) => a.lastMessageAt - b.lastMessageAt);

    // Identify current session ID from the key being saved (if applicable)
    const excludeId = excludeKey.startsWith(KEYS.MESSAGES_PREFIX) 
      ? excludeKey.replace(KEYS.MESSAGES_PREFIX, '') 
      : null;

    // Find a candidate that is NOT the current session
    const candidate = sessions.find(s => s.id !== excludeId);

    if (candidate) {
      console.warn(`[Storage] Quota exceeded. Auto-pruning session: ${candidate.title} (${candidate.id})`);
      localStorage.removeItem(KEYS.MESSAGES_PREFIX + candidate.id);
      
      const newSessions = sessions.filter(s => s.id !== candidate.id);
      localStorage.setItem(KEYS.SESSIONS, JSON.stringify(newSessions));
      return true; // Successfully freed space
    }
    
    return false; // No other sessions to delete (User has only one huge session)
  } catch (e) {
    console.error("[Storage] Pruning failed", e);
    return false;
  }
};

// Helper: Emergency truncation for the current session (Strip attachments from old messages)
const truncateCurrentSessionMessages = (messages: Message[]): Message[] => {
  // We want to keep the last 10 messages intact to preserve recent context.
  // For older messages, we will remove attachments (heavy base64) to save space.
  
  const PRESERVE_COUNT = 10;
  if (messages.length <= PRESERVE_COUNT) return messages;

  const recentMessages = messages.slice(-PRESERVE_COUNT);
  const olderMessages = messages.slice(0, -PRESERVE_COUNT);

  const optimizedOlderMessages = olderMessages.map(msg => {
    // If message has attachments, strip the data but keep the record
    if (msg.attachments && msg.attachments.length > 0) {
      return {
        ...msg,
        attachments: [], // Clear attachments
        content: msg.content + "\n\n[SYSTEM: Attachments removed to save local storage space]"
      };
    }
    return msg;
  });

  return [...optimizedOlderMessages, ...recentMessages];
};

// Core: Safe SetItem wrapper
const setItemSafe = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    if (isQuotaError(e)) {
      // 1. Try to delete other old sessions
      if (pruneOldestSession(key)) {
        setItemSafe(key, value); // Retry recursively
        return;
      }
      // 2. If we couldn't delete other sessions, prompt the caller (or just throw)
      // The caller (saveMessages) handles the single-session truncation case.
      throw e;
    }
    throw e;
  }
};

export const StorageService = {
  // --- Language Settings ---
  saveLanguage: (lang: Language) => {
    setItemSafe(KEYS.LANGUAGE, lang);
  },

  getLanguage: (): Language => {
    const lang = localStorage.getItem(KEYS.LANGUAGE);
    return (lang as Language) || 'pt-PT';
  },

  // --- User Profile ---
  saveUser: (user: UserProfile) => {
    setItemSafe(KEYS.USER, JSON.stringify(user));
  },

  getUser: (): UserProfile | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  clearUser: () => {
    localStorage.removeItem(KEYS.USER);
  },

  // --- Learning Profile ---
  getLearningProfile: (): UserLearningProfile => {
    const data = localStorage.getItem(KEYS.LEARNING_PROFILE);
    return data ? JSON.parse(data) : { preferences: [], dislikes: [], lastUpdated: Date.now() };
  },

  updateLearningProfile: (feedbackText: string, type: 'positive' | 'negative') => {
    const profile = StorageService.getLearningProfile();
    
    if (type === 'positive') {
      if (!profile.preferences.includes(feedbackText)) {
        profile.preferences.push(feedbackText);
      }
    } else {
      if (!profile.dislikes.includes(feedbackText)) {
        profile.dislikes.push(feedbackText);
      }
    }
    
    profile.lastUpdated = Date.now();
    setItemSafe(KEYS.LEARNING_PROFILE, JSON.stringify(profile));
    return profile;
  },

  // --- Sessions ---
  getSessions: (): ChatSession[] => {
    const data = localStorage.getItem(KEYS.SESSIONS);
    return data ? JSON.parse(data).sort((a: ChatSession, b: ChatSession) => b.lastMessageAt - a.lastMessageAt) : [];
  },

  saveSession: (session: ChatSession) => {
    const sessions = StorageService.getSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }
    
    setItemSafe(KEYS.SESSIONS, JSON.stringify(sessions));
  },

  deleteSession: (sessionId: string) => {
    const sessions = StorageService.getSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(filtered));
    localStorage.removeItem(KEYS.MESSAGES_PREFIX + sessionId);
  },

  // --- Clear All Chats ---
  clearChatHistory: () => {
    const sessions = StorageService.getSessions();
    // Delete all message keys
    sessions.forEach(s => {
      localStorage.removeItem(KEYS.MESSAGES_PREFIX + s.id);
    });
    // Delete sessions key
    localStorage.removeItem(KEYS.SESSIONS);
  },

  // --- Messages ---
  getMessages: (sessionId: string): Message[] => {
    const data = localStorage.getItem(KEYS.MESSAGES_PREFIX + sessionId);
    return data ? JSON.parse(data) : [];
  },

  saveMessages: (sessionId: string, messages: Message[]) => {
    const key = KEYS.MESSAGES_PREFIX + sessionId;
    const value = JSON.stringify(messages);
    
    try {
      setItemSafe(key, value);
    } catch (e) {
      if (isQuotaError(e)) {
        console.warn("[Storage] Quota critical. Optimizing current session...");
        // If we are here, it means we pruned all other sessions and it's still full.
        // We must optimize the CURRENT session (Emergency Mode).
        const optimizedMessages = truncateCurrentSessionMessages(messages);
        
        try {
           localStorage.setItem(key, JSON.stringify(optimizedMessages));
        } catch (finalErr) {
           console.error("[Storage] CRITICAL: Unable to save message even after optimization.", finalErr);
           // Final fallback: Alert user (UI should handle this ideally, but here we just log)
        }
      } else {
        console.error("[Storage] Unexpected error saving messages", e);
      }
    }
  },

  // --- Utilities ---
  createSession: (persona: Persona, defaultTitle: string = 'Nova Conversa'): ChatSession => {
    return {
      id: Date.now().toString(),
      title: defaultTitle,
      lastMessageAt: Date.now(),
      preview: '',
      persona
    };
  },

  // --- Backup System (Export/Import) ---
  exportAllData: async () => {
    const exportData: any = {};
    
    // 1. Get User
    const user = localStorage.getItem(KEYS.USER);
    if (user) exportData[KEYS.USER] = user;

    // 2. Get Learning
    const learning = localStorage.getItem(KEYS.LEARNING_PROFILE);
    if (learning) exportData[KEYS.LEARNING_PROFILE] = learning;

    // 3. Get Language
    const lang = localStorage.getItem(KEYS.LANGUAGE);
    if (lang) exportData[KEYS.LANGUAGE] = lang;

    // 4. Get Sessions
    const sessionsStr = localStorage.getItem(KEYS.SESSIONS);
    if (sessionsStr) {
      exportData[KEYS.SESSIONS] = sessionsStr;
      const sessions = JSON.parse(sessionsStr);
      // 5. Get All Messages for each session
      sessions.forEach((s: any) => {
        const msgKey = KEYS.MESSAGES_PREFIX + s.id;
        const msgs = localStorage.getItem(msgKey);
        if (msgs) exportData[msgKey] = msgs;
      });
    }

    const blob = new Blob([JSON.stringify(exportData)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scyno_backup_${new Date().toISOString().slice(0, 10)}.scyno`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importAllData: async (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          // Basic validation
          if (!data[KEYS.SESSIONS] && !data[KEYS.USER]) {
            reject("Invalid SCYNO backup file.");
            return;
          }

          // Restore
          Object.keys(data).forEach(key => {
            localStorage.setItem(key, data[key]);
          });
          
          resolve(true);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }
};
