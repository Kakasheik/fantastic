/**
 * Auth store — Zustand. Apenas acesso em memória.
 * SECURITY: Access token NUNCA persiste; recarregar a página = silent refresh.
 */
import { create } from 'zustand';

export type UserRole = 'SUBSCRIBER' | 'CREATOR' | 'ADVERTISER' | 'ADMIN';

interface User {
  id:       string;
  email:    string;
  username: string;
  role:     UserRole;
}

interface AuthState {
  accessToken: string | null;
  user:        User | null;
  setSession:  (token: string, user: User) => void;
  clear:       () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user:        null,
  setSession:  (accessToken, user) => set({ accessToken, user }),
  clear:       () => set({ accessToken: null, user: null }),
}));
