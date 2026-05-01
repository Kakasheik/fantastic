/**
 * Cliente HTTP para a API NestJS — versão dev.
 * SECURITY: Access token em memória (Zustand). Refresh token em cookie HttpOnly do backend.
 */
import { useAuthStore } from './auth-store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function api<T = unknown>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { skipAuth, headers, ...rest } = opts;
  const token = skipAuth ? null : useAuthStore.getState().accessToken;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: 'include',
  });

  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      finalHeaders.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
      const retry = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders, credentials: 'include' });
      if (!retry.ok) throw await buildError(retry);
      if (retry.status === 204) return undefined as T;
      return retry.json() as Promise<T>;
    }
    useAuthStore.getState().clear();
  }

  if (!res.ok) throw await buildError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) return false;
    const data = (await res.json()) as { accessToken: string; user: { id: string; email: string; username: string; role: 'SUBSCRIBER' | 'CREATOR' | 'ADVERTISER' | 'ADMIN' } };
    useAuthStore.getState().setSession(data.accessToken, data.user);
    return true;
  } catch {
    return false;
  }
}

async function buildError(res: Response): Promise<Error> {
  let body: unknown;
  try { body = await res.json(); } catch { body = await res.text(); }
  const err = new Error(`HTTP ${res.status}`) as Error & { status: number; body: unknown };
  err.status = res.status;
  err.body = body;
  return err;
}
