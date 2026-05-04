import api from './api';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';
import { setAccessToken } from './tokenManager';

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/register', data);
  return response.data;
};

export const refresh = async (): Promise<{ accessToken: string }> => {
  const response = await api.post<{ accessToken: string }>('/api/auth/refresh');
  setAccessToken(response.data.accessToken);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout');
  setAccessToken(null);
};
