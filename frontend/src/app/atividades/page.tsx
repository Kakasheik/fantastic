'use client';
/**
 * /atividades — Atividade do usuário (curtidas, comentários).
 */
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Heart, MessageCircle, Bookmark } from 'lucide-react';
import { api } from '@/lib/api';
import { formatRelative } from '@/lib/utils';
import { SessionGate } from '@/components/layout/session-gate';

interface Activity {
  likes: Array<{ postId: string; caption: string | null; thumbnail: string | null; creator: { username: string; profilePicture: string | null }; likedAt: string }>;
  comments: Array<{ postId: string; caption: string | null; content: string; createdAt: string }>;
  transactions: number;
}

interface Saved {
  items: Array<unknown>;
  message?: string;
}

export default function AtividadesPage() {
  return <SessionGate><AtividadesView /></SessionGate>;
}

function AtividadesView() {
  const { data: activity } = useQuery<Activity>({ queryKey: ['activity'], queryFn: () => api<Activity>('/users/me/activity') });
  const { data: saved } = useQuery<Saved>({ queryKey: ['saved'], queryFn: () => api<Saved>('/users/me/saved') });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/profile" className="p-2 -m-2 hover:bg-surface2 rounded-full"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold">Atividades</h1>
      </header>

      {/* Salvos */}
      <section>
        <h2 className="font-semibold mb-2 flex items-center gap-2"><Bookmark className="w-4 h-4 text-brand" /> Salvos</h2>
        <div className="rounded-2xl bg-surface1 border border-border p-6 text-center text-sm text-muted">
          {!saved ? <span className="inline-block w-32 h-4 bg-surface2 rounded animate-pulse" /> : saved.message}
        </div>
      </section>

      {/* Curtidas */}
      <section>
        <h2 className="font-semibold mb-2 flex items-center gap-2"><Heart className="w-4 h-4 text-brand" /> Curtidas recentes</h2>
        <div className="rounded-2xl bg-surface1 border border-border divide-y divide-border">
          {!activity && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 flex gap-3"><div className="w-12 h-12 rounded-lg bg-surface2 animate-pulse" /><div className="flex-1 space-y-2"><div className="h-3 bg-surface2 rounded animate-pulse w-1/3" /><div className="h-3 bg-surface2 rounded animate-pulse w-2/3" /></div></div>
          ))}
          {activity?.likes.length === 0 && <p className="p-6 text-center text-muted text-sm">Você ainda não curtiu nenhum post.</p>}
          {activity?.likes.map((l) => (
            <Link key={l.postId} href={`/${l.creator.username}`} className="flex items-center gap-3 p-4 hover:bg-surface2 transition-colors">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface2 relative flex-shrink-0">
                {l.thumbnail && <Image src={l.thumbnail} alt="" fill className="object-cover" sizes="48px" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">@{l.creator.username}</p>
                {l.caption && <p className="text-xs text-muted truncate">{l.caption}</p>}
              </div>
              <p className="text-xs text-muted whitespace-nowrap">{formatRelative(l.likedAt)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Comentários */}
      <section>
        <h2 className="font-semibold mb-2 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-brand" /> Comentários recentes</h2>
        <div className="rounded-2xl bg-surface1 border border-border divide-y divide-border">
          {!activity && Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-4 space-y-2"><div className="h-3 bg-surface2 rounded animate-pulse w-3/4" /><div className="h-3 bg-surface2 rounded animate-pulse w-1/2" /></div>
          ))}
          {activity?.comments.length === 0 && <p className="p-6 text-center text-muted text-sm">Você ainda não comentou.</p>}
          {activity?.comments.map((c, i) => (
            <Link key={i} href={`/post/${c.postId}`} className="block p-4 hover:bg-surface2 transition-colors">
              <p className="text-sm">{c.content}</p>
              {c.caption && <p className="text-xs text-muted truncate mt-1">em "{c.caption}"</p>}
              <p className="text-xs text-muted mt-1">{formatRelative(c.createdAt)}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
