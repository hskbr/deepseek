export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  isStreaming?: boolean;
  error?: string | null;
}

export interface ApiStatus {
  configured: boolean;
  defaultModel: string;
  provider: string;
  endpoint: string;
}
