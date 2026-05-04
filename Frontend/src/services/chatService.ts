import api from './api';
import type { Message, MayaResponse } from '../types/ai';


export const send = async (messages: Message[]): Promise<MayaResponse> => {
  // TODO: POST /api/chat with { messages, userLocale: navigator.language }
  // Tip: only send the last 20 messages to keep the payload small

  const response = await api.post<MayaResponse>('/api/chat', {
    messages: messages.slice(-20),
    userLocale: navigator.language,
  });
  return response.data;
};
