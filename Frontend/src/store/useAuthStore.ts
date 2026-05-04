import { create } from 'zustand';
import type { User } from '../types/auth';

interface AuthStore {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>(() => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  login: async (_email, _password) => {
    // TODO: call authService.login, store the accessToken in tokenManager,
    // then update the store with set({ accessToken, user, isAuthenticated: true })
  },

  register: async (_email, _password) => {
    // TODO: call authService.register, same as login
  },

  logout: async () => {
    // TODO: call authService.logout, clear token from tokenManager,
    // reset store to initial state
  },

  refreshToken: async () => {
    // TODO: call authService.refresh, update the accessToken in store + tokenManager
  },
}));
