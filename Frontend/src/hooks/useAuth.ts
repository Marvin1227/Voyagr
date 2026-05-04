import type { User } from '../types/auth';
import { useAuthStore } from '../store/useAuthStore';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  // TODO: select the fields above from useAuthStore and return them
  void useAuthStore;
  throw new Error('Not implemented');
}
