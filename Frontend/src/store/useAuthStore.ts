import { create } from 'zustand';
import type { User } from '../types/auth';
import { setAccessToken } from '../services/tokenManager';
import * as authService from '../services/authService';

interface AuthStore {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const response = await authService.login({ email, password });
    setAccessToken(response.accessToken);
    set({ accessToken: response.accessToken, user: response.user, isAuthenticated: true });

  },

  register: async (email, password) => {
    const response = await authService.register({ email, password });
    setAccessToken(response.accessToken);
    set({ accessToken: response.accessToken, user: response.user, isAuthenticated: true });
  },

  logout: async () => {
    await authService.logout();
    set({ accessToken: null, user: null, isAuthenticated: false });
  },

  refreshToken: async () => {
    const response = await authService.refresh();
    set({ accessToken: response.accessToken });
  },
}));
