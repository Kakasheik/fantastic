'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Smartphone, TrendingUp, MessageCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Bottom navigation estilo Privacy: 4 itens fixos.
 * Visível em desktop e mobile.
 */
const items = [
  { href: '/',         label: 'Feed',     icon: Smartphone },
  { href: '/em-alta',  label: 'Em alta',  icon: TrendingUp },
  { href: '/chat',     label: 'Chat',     icon: MessageCircle },
  { href: '/busca',    label: 'Busca',    icon: Search },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-bg/95 backdrop-blur-xl border-t border-border">
      <ul className="max-w-6xl mx-auto grid grid-cols-4 h-16">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/' ? pathname === '/' : pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'h-full flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  active ? 'text-brand' : 'text-text/70 hover:text-text',
                )}
              >
                <Icon className={cn('w-5 h-5', active && 'fill-brand/15')} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
