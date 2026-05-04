import api from './api';
import type { Message, MayaResponse } from '../types/ai';

export const send = (_messages: Message[]): Promise<MayaResponse> => {
  // TODO: POST /api/chat with { messages, userLocale: navigator.language }
  // Tip: only send the last 20 messages to keep the payload small
  throw new Error('Not implemented');

  // silence unused import warning until implemented
  void api;
};
