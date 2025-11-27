
export enum Persona {
  SCYNO_CORE = 'SCYNO_CORE' // The 4x1 Unified Intelligence
}

export type Language = 'pt-PT' | 'en-US';

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
  previewUri: string; // For UI display
}

export interface Feedback {
  rating: 'positive' | 'negative';
  text?: string;
  timestamp: number;
}

export interface UserLearningProfile {
  preferences: string[];
  dislikes: string[];
  lastUpdated: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isError?: boolean;
  groundingSources?: GroundingSource[];
  attachments?: Attachment[];
  feedback?: Feedback;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessageAt: number;
  preview: string;
  persona: Persona;
}

export interface ChatState {
  currentSessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  persona: Persona;
  user: UserProfile | null;
  sessions: ChatSession[]; // List of historical sessions
  learningProfile: UserLearningProfile; // New: System memory
}

export interface PersonaConfig {
  id: Persona;
  name: string;
  shortName: string;
  descriptionKey: string;
  systemInstruction: string;
  icon: string;
  model: string;
  color: string;
  useSearch?: boolean;
}
