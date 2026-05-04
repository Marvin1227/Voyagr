import { create } from 'zustand';
import type { Message, MayaResponse } from '../types/ai';

interface ChatStore {
  messages: Message[];
  lastResponse: MayaResponse | null;
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>(() => ({
  messages: [],
  lastResponse: null,
  isLoading: false,

  sendMessage: async (_text) => {
    // TODO:
    // 1. Append a { role: 'user', content: text } message to messages
    // 2. Set isLoading: true
    // 3. Call chatService.send(messages)
    // 4. Append Maya's reply to messages, set lastResponse, set isLoading: false
    // 5. Handle errors by resetting isLoading
  },

  clearMessages: () => {
    // TODO: reset messages to [] and lastResponse to null
  },
}));
