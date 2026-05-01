'use client';
import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Creator {
  id: string;
  username: string;
  displayName: string;
  profilePicture: string | null;
  verified: boolean;
  monthlyPrice: number;
  subscribers: number;
}

export default function BuscaPage() {
  const [q, setQ] = useState('');
  const { data } = useQuery<Creator[]>({
    queryKey: ['top-creators-search'],
    queryFn: () => api<Creator[]>('/users/top?limit=12'),
  });

  const filtered = q && data
    ? data.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q.toLowerCase()) ||
          c.username.toLowerCase().includes(q.toLowerCase()),
      )
    : data ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar criadoras..."
          className="w-full pl-12 pr-4 h-12 rounded-full bg-surface1 border border-border text-base focus:outline-none focus:border-brand"
        />
      </div>

      <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Sugeridas</h2>

      <div className="space-y-2">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/${c.username}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface1 border border-border hover:border-brand transition-colors"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              {c.profilePicture && (
                <Image src={c.profilePicture} alt={c.displayName} fill className="object-cover" sizes="50px" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 font-semibold truncate">
                {c.displayName}
                {c.verified && (
                  <span className="inline-block w-4 h-4 rounded-full bg-brand grid place-items-center text-white text-[9px]">✓</span>
                )}
              </div>
              <p className="text-xs text-muted truncate">@{c.username} · {c.subscribers.toLocaleString('pt-BR')} assinantes</p>
            </div>
            <span className="text-xs text-brand font-semibold">R$ {c.monthlyPrice.toFixed(2)}/mês</span>
          </Link>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-muted py-12">Nenhum resultado.</p>
        )}
      </div>
    </div>
  );
}
