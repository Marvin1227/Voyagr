import type { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  // Auth is bypassed for now — just render children
  // TODO: read isAuthenticated from useAuthStore
  //       return <LoginForm /> when the user is not authenticated
  return <>{children}</>;
}
