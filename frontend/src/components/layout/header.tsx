'use client';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/lib/auth-store';

/**
 * Header minimalista estilo Privacy.
 * Logo à esquerda, sino + avatar à direita.
 * Avatar leva direto para /profile (que é o hub do usuário).
 */
export function Header() {
  const user = useAuthStore((s) => s.user);
  const display = user ?? { username: 'KA', role: 'SUBSCRIBER' as const };
  const initials = (display.username.slice(0, 2) || 'KA').toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 h-16">
        <Link href="/" className="brand-logo text-2xl font-bold tracking-tight text-text">
          fantastic
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/atividades"
            className="w-10 h-10 grid place-items-center rounded-full hover:bg-surface2 transition-colors"
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5 text-text" />
          </Link>
          <Link href="/profile" aria-label="Meu perfil">
            <Avatar alt={initials} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  );
}
