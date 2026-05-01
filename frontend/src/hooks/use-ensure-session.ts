'use client';
/**
 * useEnsureSession — Garante que existe um access token antes de renderizar
 * páginas autenticadas.
 *
 * Estratégia:
 *  1. Se já há `user` no store, marca pronto.
 *  2. Senão, tenta /auth/refresh (cookie HttpOnly).
 *  3. Senão, cria guest user automaticamente (dev/MVP — em prod, redirecionaria para /login).
 *
 * SECURITY: Em produção, substitua o "guest auto-register" por redirect a /login
 * para que o usuário se autentique formalmente. Aqui usamos para o flow ser
 * frictionless durante o MVP.
 */
import { useEffect, useRef, useState } from 'react';
import { useAuthStore, type UserRole } from '@/lib/auth-store';
import { api } from '@/lib/api';

interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; username: string; role: UserRole };
}

export function useEnsureSession(): { ready: boolean; error: string | null } {
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const [ready, setReady] = useState<boolean>(() => !!user);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (user) { setReady(true); return; }
    if (initRef.current) return;
    initRef.current = true;

    void (async () => {
      // 1. Tenta refresh
      try {
        const data = await api<AuthResponse>('/auth/refresh', { method: 'POST', skipAuth: true });
        setSession(data.accessToken, data.user);
        setReady(true);
        return;
      } catch {
        // segue para guest
      }

      // 2. Cria guest user
      try {
        const random = Math.random().toString(36).slice(2, 10);
        const data = await api<AuthResponse>('/auth/register', {
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify({
            email:    `guest-${random}@fantastic.local`,
            username: `guest_${random}`,
            password: 'GuestPass#Dev2026',
            role:     'SUBSCRIBER',
          }),
        });
        setSession(data.accessToken, data.user);
        setReady(true);
      } catch (err) {
        setError((err as Error).message ?? 'Não foi possível iniciar sessão.');
      }
    })();
  }, [user, setSession]);

  return { ready, error };
}
