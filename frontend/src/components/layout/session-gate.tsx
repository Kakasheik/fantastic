'use client';
/**
 * SessionGate — wrapper que mostra spinner enquanto sessão é estabelecida.
 * Use em volta de páginas que dependem de /users/me/*.
 */
import { Loader2 } from 'lucide-react';
import { useEnsureSession } from '@/hooks/use-ensure-session';

export function SessionGate({ children }: { children: React.ReactNode }) {
  const { ready, error } = useEnsureSession();

  if (error) {
    return (
      <div className="min-h-[60dvh] grid place-items-center px-4">
        <div className="text-center space-y-3 max-w-md">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-full bg-brand text-white text-sm font-semibold hover:bg-brand-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-[60dvh] grid place-items-center">
        <Loader2 className="w-7 h-7 animate-spin text-brand" />
      </div>
    );
  }

  return <>{children}</>;
}
