'use client';
/**
 * /busca — Pesquisa de criadoras (estilo Privacy "Mais buscados").
 * Mostra grade 2 colunas de cards com cover + avatar circular + nome.
 */
import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Item {
  id: string;
  username: string;
  displayName: string;
  profilePicture: string | null;
  coverImage: string | null;
  verified: boolean;
  subscribers: number;
  photos: number;
  videos: number;
  likes: number;
  monthlyPrice: number;
  promo: { discount: number; months: number; price: number } | null;
}

interface EmAltaResponse {
  topMonth:      Item[];
  freeProfiles:  Item[];
  topPampered:   Item[];
  rising:        Item[];
  trendingPosts: Item[];
}

export default function BuscaPage() {
  const [q, setQ] = useState('');

  const { data } = useQuery<EmAltaResponse>({
    queryKey: ['em-alta-search'],
    queryFn: () => api<EmAltaResponse>('/users/em-alta'),
  });

  // Achata todas as seções e deduplica por id
  const allCreators = useMemo<Item[]>(() => {
    if (!data) return [];
    const seen = new Set<string>();
    const flat: Item[] = [];
    for (const arr of [data.topMonth, data.freeProfiles, data.topPampered, data.rising, data.trendingPosts]) {
      for (const c of arr) {
        if (!seen.has(c.id)) { seen.add(c.id); flat.push(c); }
      }
    }
    return flat;
  }, [data]);

  const filtered = q
    ? allCreators.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q.toLowerCase()) ||
          c.username.toLowerCase().includes(q.toLowerCase()),
      )
    : allCreators;

  return (
    <div className="max-w-5xl mx-auto px-4 pt-4 pb-12">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por creators ou tópicos"
          className="w-full pl-14 pr-5 h-14 rounded-full bg-surface1 border border-border text-base focus:outline-none focus:border-brand transition-colors"
        />
      </div>

      <h2 className="text-base font-semibold text-text mt-6 mb-3">
        {q ? `Resultados para "${q}"` : 'Mais buscados'}
      </h2>

      {!data && <SkeletonGrid />}

      {data && filtered.length === 0 && (
        <p className="text-center text-muted py-12">Nenhuma criadora encontrada para "{q}".</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((c, i) => <SearchCard key={c.id} c={c} isFree={i % 5 === 2 /* alguns marcados como Gratuito (visual) */} />)}
      </div>
    </div>
  );
}

function SearchCard({ c, isFree }: { c: Item; isFree?: boolean }) {
  return (
    <Link
      href={`/${c.username}`}
      className="rounded-2xl bg-surface1 border border-border overflow-hidden hover:border-brand transition-colors group flex"
    >
      {/* Lado esquerdo: cover */}
      <div className="relative w-2/5 aspect-[4/3] flex-shrink-0 bg-surface2">
        {c.coverImage && (
          <Image src={c.coverImage} alt="" fill className="object-cover transition-transform group-hover:scale-105" sizes="200px" />
        )}
        {isFree && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-text text-bg text-[10px] font-bold">
            Gratuito
          </span>
        )}
      </div>

      {/* Lado direito: avatar + nome */}
      <div className="flex-1 min-w-0 flex items-center gap-3 p-3 relative">
        <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-surface1 -ml-9 z-10 bg-surface2">
          {c.profilePicture && (
            <Image src={c.profilePicture} alt={c.displayName} fill className="object-cover" sizes="56px" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm flex items-center gap-1 truncate">
            {c.displayName}
            {c.verified && (
              <span className="inline-block w-4 h-4 rounded-full bg-brand grid place-items-center text-white text-[9px] flex-shrink-0">✓</span>
            )}
          </p>
          <p className="text-xs text-muted truncate">@{c.username}</p>
        </div>
      </div>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[100px] rounded-2xl bg-surface1 border border-border animate-pulse" />
      ))}
    </div>
  );
}
