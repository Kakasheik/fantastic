'use client';
/**
 * /me/scheduled — Posts agendados.
 */
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, CalendarDays, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { SessionGate } from '@/components/layout/session-gate';

interface OwnPosts {
  items: Array<{
    id: string;
    type: string;
    caption: string | null;
    thumbnailUrl: string | null;
    isLocked: boolean;
    publishedAt: string | null;
  }>;
}

export default function ScheduledPage() {
  return <SessionGate><ScheduledView /></SessionGate>;
}

function ScheduledView() {
  const { data, isLoading } = useQuery<OwnPosts>({
    queryKey: ['me-posts', 'scheduled'],
    queryFn: () => api<OwnPosts>('/users/me/posts?status=scheduled'),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/me" className="p-2 -m-2 hover:bg-surface2 rounded-full"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold">Posts agendados</h1>
      </header>

      {isLoading && <div className="h-32 bg-surface1 rounded-2xl animate-pulse" />}

      {!isLoading && data?.items.length === 0 && (
        <div className="rounded-2xl bg-surface1 border border-border p-8 text-center space-y-3">
          <CalendarDays className="w-10 h-10 text-muted mx-auto" />
          <p className="text-text font-semibold">Nenhum post agendado</p>
          <p className="text-sm text-muted">Posts agendados aparecem aqui antes da hora de publicação.</p>
        </div>
      )}

      <div className="space-y-3">
        {data?.items.map((p) => (
          <div key={p.id} className="rounded-2xl bg-surface1 border border-border p-4 flex gap-3">
            <div className="w-20 h-20 rounded-lg bg-surface2 relative overflow-hidden flex-shrink-0">
              {p.thumbnailUrl && <Image src={p.thumbnailUrl} alt="" fill className="object-cover" sizes="80px" />}
              {p.isLocked && (
                <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-md">
                  <Lock className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {p.caption && <p className="text-sm line-clamp-2">{p.caption}</p>}
              <p className="text-xs text-brand mt-1 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {p.publishedAt ? new Date(p.publishedAt).toLocaleString('pt-BR') : 'Sem data'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
