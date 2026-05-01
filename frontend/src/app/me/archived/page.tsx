'use client';
/**
 * /me/archived — Posts arquivados.
 */
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Archive } from 'lucide-react';
import { api } from '@/lib/api';
import { SessionGate } from '@/components/layout/session-gate';

interface OwnPosts {
  items: Array<{
    id: string;
    caption: string | null;
    thumbnailUrl: string | null;
  }>;
}

export default function ArchivedPage() {
  return <SessionGate><ArchivedView /></SessionGate>;
}

function ArchivedView() {
  const { data, isLoading } = useQuery<OwnPosts>({
    queryKey: ['me-posts', 'archived'],
    queryFn: () => api<OwnPosts>('/users/me/posts?status=archived'),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/me" className="p-2 -m-2 hover:bg-surface2 rounded-full"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold">Arquivados</h1>
      </header>

      {isLoading && <div className="h-32 bg-surface1 rounded-2xl animate-pulse" />}

      {!isLoading && data?.items.length === 0 && (
        <div className="rounded-2xl bg-surface1 border border-border p-8 text-center space-y-3">
          <Archive className="w-10 h-10 text-muted mx-auto" />
          <p className="text-text font-semibold">Nada arquivado</p>
          <p className="text-sm text-muted">Posts removidos do feed mas mantidos por 90 dias aparecem aqui.</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1">
        {data?.items.map((p) => (
          <div key={p.id} className="aspect-square bg-surface2 rounded-md overflow-hidden relative opacity-60">
            {p.thumbnailUrl && <Image src={p.thumbnailUrl} alt={p.caption ?? ''} fill className="object-cover" sizes="200px" />}
          </div>
        ))}
      </div>
    </div>
  );
}
