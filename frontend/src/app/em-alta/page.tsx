'use client';
/**
 * /em-alta — Top criadoras (estilo Privacy).
 *
 * 8 seções horizontais:
 *  1. Banner hero
 *  2. Top do mês — large cards com rank
 *  3. Perfis gratuitos
 *  4. As mais mimadas (rank 1° a 7°)
 *  5. Rumo ao topo (com stats fotos/vídeos)
 *  6. Em alta nos posts
 *  7. Bombando no chat (lista vertical)
 *  8. Chamada Um a Um (com promo badge)
 *  9. Live nas alturas (com AO VIVO)
 */
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Sparkles, Image as ImgIcon, Film, Radio } from 'lucide-react';
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

interface ChatItem extends Item { status: string }
interface LiveItem extends Item { livesCount: number; isLive: boolean }

interface EmAltaResponse {
  topMonth:      Item[];
  freeProfiles:  Item[];
  topPampered:   Item[];
  rising:        Item[];
  trendingPosts: Item[];
  chatHot:       ChatItem[];
  oneOnOne:      Item[];
  livesHot:      LiveItem[];
}

export default function EmAltaPage() {
  const { data, isLoading } = useQuery<EmAltaResponse>({
    queryKey: ['em-alta'],
    queryFn: () => api<EmAltaResponse>('/users/em-alta'),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12 protected">
      {/* Banner Hero */}
      <section className="relative h-44 md:h-56 rounded-2xl overflow-hidden mt-4 bg-gradient-to-br from-brand-100 via-brand-50 to-bg">
        {data?.topMonth[0]?.coverImage && (
          <Image src={data.topMonth[0].coverImage} alt="" fill className="object-cover" priority sizes="100vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-end p-6 md:p-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow">Em alta.</h1>
        </div>
      </section>

      {isLoading && <SkeletonRow count={6} h="h-60" w="w-44" />}

      {/* Top do mês */}
      {data && (
        <Section title="Top do mês">
          <HScroll>
            {data.topMonth.map((c, i) => <RankCard key={c.id} c={c} rank={i + 1} size="md" />)}
          </HScroll>
        </Section>
      )}

      {/* Perfis gratuitos */}
      {data && (
        <Section title="Perfis gratuitos">
          <HScroll>
            {data.freeProfiles.map((c, i) => <RankCard key={c.id} c={c} rank={i + 1} size="lg" showAvatar />)}
          </HScroll>
        </Section>
      )}

      {/* As mais mimadas */}
      {data && (
        <Section title="As mais mimadas">
          <HScroll gap="gap-2">
            {data.topPampered.map((c, i) => <RankCard key={c.id} c={c} rank={i + 1} size="sm" />)}
          </HScroll>
        </Section>
      )}

      {/* Rumo ao topo */}
      {data && (
        <Section title="Rumo ao topo">
          <HScroll>
            {data.rising.map((c, i) => <RankCard key={c.id} c={c} rank={i + 1} size="md" showStats showAvatar />)}
          </HScroll>
        </Section>
      )}

      {/* Em alta nos posts */}
      {data && (
        <Section title="Em alta nos posts">
          <HScroll>
            {data.trendingPosts.map((c, i) => <RankCard key={c.id} c={c} rank={i + 1} size="lg" showAvatar />)}
          </HScroll>
        </Section>
      )}

      {/* Bombando no chat */}
      {data && (
        <Section title="Bombando no chat">
          <div className="grid md:grid-cols-2 gap-3">
            {data.chatHot.map((c, i) => <ChatRow key={c.id} c={c} rank={i + 1} />)}
          </div>
        </Section>
      )}

      {/* Chamada Um a Um */}
      {data && data.oneOnOne.length > 0 && (
        <Section title="Chamada Um a Um" icon={<Sparkles className="w-4 h-4 text-brand" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.oneOnOne.map((c, i) => <OneOnOneCard key={c.id} c={c} rank={i + 1} />)}
          </div>
        </Section>
      )}

      {/* Live nas alturas */}
      {data && (
        <Section title="Live nas alturas" icon={<Radio className="w-4 h-4 text-brand" />}>
          <HScroll>
            {data.livesHot.map((c, i) => <LiveCard key={c.id} c={c} rank={i + 1} />)}
          </HScroll>
        </Section>
      )}

      {/* Categorias */}
      <Section title="Categorias">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Fitness', 'Lifestyle', 'Modelo', 'Música', 'Beleza', 'Travel', 'Cosplay', 'Bastidores'].map((cat) => (
            <button key={cat} className="px-4 py-3 rounded-xl bg-surface1 border border-border text-sm font-medium hover:border-brand hover:text-brand transition-colors">
              {cat}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

// =====================================================================
// LAYOUT HELPERS
// =====================================================================

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-text flex items-center gap-2">
          {icon} {title}
        </h2>
        <button className="p-1 text-muted hover:text-text" aria-label="Ver mais">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      {children}
    </section>
  );
}

function HScroll({ children, gap = 'gap-3' }: { children: React.ReactNode; gap?: string }) {
  return (
    <div className={`flex ${gap} overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-hide`}>
      {children}
    </div>
  );
}

function SkeletonRow({ count = 5, w = 'w-44', h = 'h-60' }: { count?: number; w?: string; h?: string }) {
  return (
    <div className="flex gap-3 mt-4 overflow-x-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${w} ${h} rounded-2xl bg-surface1 animate-pulse flex-shrink-0`} />
      ))}
    </div>
  );
}

// =====================================================================
// CARDS
// =====================================================================

const sizeMap = {
  sm: { wrap: 'w-32 h-44', rankFont: 'text-4xl', overlay: 'p-2' },
  md: { wrap: 'w-44 h-60', rankFont: 'text-5xl', overlay: 'p-3' },
  lg: { wrap: 'w-72 h-72', rankFont: 'text-6xl', overlay: 'p-4' },
};

function RankCard({
  c, rank, size = 'md', showAvatar, showStats,
}: {
  c: Item; rank: number; size?: 'sm' | 'md' | 'lg'; showAvatar?: boolean; showStats?: boolean;
}) {
  const s = sizeMap[size];
  const bgImage = c.coverImage ?? c.profilePicture;
  return (
    <Link
      href={`/${c.username}`}
      className={`relative ${s.wrap} flex-shrink-0 snap-start rounded-2xl overflow-hidden group bg-surface2`}
    >
      {bgImage && (
        <Image src={bgImage} alt={c.displayName} fill className="object-cover transition-transform group-hover:scale-105" sizes="288px" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <span className={`absolute top-2 right-3 ${s.rankFont} font-black text-white/95 leading-none drop-shadow`}>
        {rank}º
      </span>

      {showStats && (
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 text-white text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur">
            <ImgIcon className="w-3 h-3" /> {c.photos}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur">
            <Film className="w-3 h-3" /> {c.videos}
          </span>
        </div>
      )}

      {showAvatar && (
        <div className="absolute left-3 bottom-12 w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-surface2 relative">
          {c.profilePicture && <Image src={c.profilePicture} alt={c.displayName} fill className="object-cover" sizes="40px" />}
        </div>
      )}

      <div className={`absolute bottom-0 left-0 right-0 ${s.overlay} text-white`}>
        <div className="flex items-center gap-1 font-bold truncate">
          {c.displayName}
          {c.verified && (
            <span className="inline-block w-4 h-4 rounded-full bg-brand grid place-items-center text-white text-[9px]">✓</span>
          )}
        </div>
        <p className="text-xs opacity-80 truncate">@{c.username}</p>
      </div>
    </Link>
  );
}

function ChatRow({ c, rank }: { c: ChatItem; rank: number }) {
  return (
    <div className="rounded-2xl bg-surface1 border border-border p-3 flex items-center gap-3">
      <span className="text-xs font-bold text-brand w-6 text-center">{rank}º</span>
      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-surface2">
        {c.profilePicture && <Image src={c.profilePicture} alt={c.displayName} fill className="object-cover" sizes="48px" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate flex items-center gap-1">
          {c.displayName}
          {c.verified && <span className="inline-block w-3.5 h-3.5 rounded-full bg-brand grid place-items-center text-white text-[8px]">✓</span>}
        </p>
        <p className="text-xs text-muted truncate">{c.status}</p>
      </div>
      <Link
        href={`/${c.username}`}
        className="px-3 h-9 rounded-full border border-brand text-brand text-xs font-semibold grid place-items-center hover:bg-brand hover:text-white transition-colors"
      >
        Ver perfil
      </Link>
    </div>
  );
}

function OneOnOneCard({ c, rank }: { c: Item; rank: number }) {
  return (
    <div className="rounded-2xl bg-surface1 border border-border overflow-hidden">
      <div className="relative aspect-[4/3]">
        {(c.coverImage || c.profilePicture) && (
          <Image src={(c.coverImage || c.profilePicture)!} alt={c.displayName} fill className="object-cover" sizes="400px" />
        )}
        <span className="absolute top-2 right-3 text-3xl font-black text-white/95 drop-shadow">{rank}º</span>
        {c.promo && (
          <span className="absolute bottom-2 right-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
            {c.promo.discount}% OFF
          </span>
        )}
      </div>
      <div className="p-4 text-center">
        <p className="font-semibold flex items-center justify-center gap-1">
          {c.displayName}
          {c.verified && <span className="inline-block w-4 h-4 rounded-full bg-brand grid place-items-center text-white text-[9px]">✓</span>}
        </p>
        <p className="text-xs text-muted">@{c.username}</p>
        <Link
          href={`/${c.username}`}
          className="mt-3 inline-block w-full h-9 rounded-full border border-brand text-brand text-xs font-semibold grid place-items-center hover:bg-brand hover:text-white transition-colors"
        >
          Ver perfil
        </Link>
      </div>
    </div>
  );
}

function LiveCard({ c, rank }: { c: LiveItem; rank: number }) {
  return (
    <Link href={`/${c.username}`} className="relative w-44 h-60 flex-shrink-0 snap-start rounded-2xl overflow-hidden group bg-surface2">
      {c.coverImage && <Image src={c.coverImage} alt={c.displayName} fill className="object-cover" sizes="200px" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <span className="absolute top-2 right-3 text-5xl font-black text-white/95 leading-none drop-shadow">{rank}º</span>
      {c.isLive && (
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> AO VIVO
        </span>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-center">
        <div className="font-bold truncate flex items-center justify-center gap-1">
          {c.displayName}
          {c.verified && <span className="inline-block w-3.5 h-3.5 rounded-full bg-brand grid place-items-center text-white text-[8px]">✓</span>}
        </div>
        <p className="text-[11px] opacity-80 mt-0.5 inline-flex items-center gap-1">
          <Radio className="w-3 h-3" /> {c.livesCount} {c.livesCount === 1 ? 'live' : 'lives'} · 7 dias
        </p>
      </div>
    </Link>
  );
}
