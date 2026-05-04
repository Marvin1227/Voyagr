import { create } from 'zustand';
import type { Message, MayaResponse } from '../types/ai';
import * as chatService from '../services/chatService'

interface ChatStore {
  messages: Message[];
  lastResponse: MayaResponse | null;
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  lastResponse: null,
  isLoading: false,

  sendMessage: async (text) => {

    // 1. Append a { role: 'user', content: text } message to messages
    // 2. Set isLoading: true
    // 3. Call chatService.send(messages)
    // 4. Append Maya's reply to messages, set lastResponse, set isLoading: false
    // 5. Handle errors by resetting isLoading

    const userMessage: Message = { role: 'user', content: text };
    set(state => ({ messages: [...state.messages, userMessage], isLoading: true }));


    try {
      const response = await chatService.send(get().messages);
      const mayaMessage: Message = { role: 'assistant', content: response.text };
      set(state => ({
        messages: [...state.messages, mayaMessage],
        lastResponse: response,
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  clearMessages: () => {
    set({ messages: [], lastResponse: null });
  },
}));
