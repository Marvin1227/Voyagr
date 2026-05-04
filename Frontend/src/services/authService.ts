import api from './api';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

export const login = (_data: LoginRequest): Promise<AuthResponse> => {
  // TODO: POST /api/auth/login with data, return the response body
  throw new Error('Not implemented');
};

export const register = (_data: RegisterRequest): Promise<AuthResponse> => {
  // TODO: POST /api/auth/register with data, return the response body
  throw new Error('Not implemented');
};

export const refresh = (): Promise<{ accessToken: string }> => {
  // TODO: POST /api/auth/refresh (cookie sent automatically), return { accessToken }
  throw new Error('Not implemented');
};

export const logout = (): Promise<void> => {
  // TODO: POST /api/auth/logout
  throw new Error('Not implemented');
};

// silence unused import warning until implemented
void api;
