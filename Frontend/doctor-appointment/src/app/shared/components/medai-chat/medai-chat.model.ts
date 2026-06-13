export interface MedAiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isEmergency?: boolean;
  isLoading?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
}

export interface MedAiChatRequest {
  message: string;
  conversationId?: string;
  history?: { role: string; content: string; timestamp: string }[];
}

export interface MedAiChatResponse {
  reply: string;
  conversationId: string;
  timestamp: string;
  isEmergency: boolean;
}

export interface SendMessageResponse {
  userMessage: { id: string; sender: string; message: string; createdAt: string; isEmergency: boolean };
  aiMessage: { id: string; sender: string; message: string; createdAt: string; isEmergency: boolean };
  conversationTitle: string;
}

export interface MedAiQuickAction {
  label: string;
  icon: string;
  prompt: string;
}

export type ChatMode = 'minimized' | 'expanded' | 'fullscreen';
