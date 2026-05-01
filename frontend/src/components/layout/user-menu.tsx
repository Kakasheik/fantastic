'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon, Settings, BarChart3, Megaphone, Wallet } from 'lucide-react';
import { useAuthStore, type UserRole } from '@/lib/auth-store';

/**
 * Menu do avatar — itens de Dashboard/Campanhas só aparecem para roles correspondentes.
 * SUBSCRIBER comum NÃO vê Dashboard ou Campanhas.
 */
export function UserMenu({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="block">
        {children}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 rounded-xl bg-surface1 border border-border shadow-lg overflow-hidden animate-fade-in">
          <Item href="/profile" icon={UserIcon}>Meu perfil</Item>
          <Item href="/wallet"  icon={Wallet}>Carteira</Item>

          {role === 'CREATOR' && (
            <Item href="/dashboard" icon={BarChart3}>Dashboard</Item>
          )}
          {role === 'ADVERTISER' && (
            <Item href="/advertiser/campaigns" icon={Megaphone}>Campanhas</Item>
          )}
          {role === 'ADMIN' && (
            <>
              <Item href="/dashboard" icon={BarChart3}>Dashboard</Item>
              <Item href="/advertiser/campaigns" icon={Megaphone}>Campanhas</Item>
            </>
          )}

          <Item href="/settings" icon={Settings}>Configurações</Item>

          <div className="border-t border-border" />
          <button
            onClick={() => { clear(); window.location.href = '/login'; }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-surface2"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      )}
    </div>
  );
}

function Item({ href, icon: Icon, children }: { href: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-surface2">
      <Icon className="w-4 h-4 text-muted" /> {children}
    </Link>
  );
}
