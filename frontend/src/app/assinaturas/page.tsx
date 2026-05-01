'use client';
/**
 * /assinaturas — Lista de assinaturas ativas do usuário.
 */
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { formatBRL } from '@/lib/utils';
import { SessionGate } from '@/components/layout/session-gate';

interface Sub {
  id: string;
  status: 'ACTIVE' | 'TRIAL' | 'PENDING' | 'CANCELLED' | 'EXPIRED';
  price: number;
  currentPeriodEnd: string | null;
  autoRenew: boolean;
  plan: { name: string; intervalMonths: number } | null;
  creator: {
    id: string;
    username: string;
    displayName: string;
    profilePicture: string | null;
    coverImage: string | null;
    verified: boolean;
  };
}

const statusInfo: Record<string, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
  ACTIVE:    { label: 'Ativa',     cls: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 },
  TRIAL:     { label: 'Trial',     cls: 'text-blue-600 bg-blue-50',       icon: Clock },
  PENDING:   { label: 'Pendente',  cls: 'text-amber-600 bg-amber-50',     icon: Clock },
  CANCELLED: { label: 'Cancelada', cls: 'text-red-600 bg-red-50',         icon: XCircle },
  EXPIRED:   { label: 'Expirada',  cls: 'text-muted bg-surface2',         icon: XCircle },
};

export default function AssinaturasPage() {
  return <SessionGate><AssinaturasView /></SessionGate>;
}

function AssinaturasView() {
  const { data, isLoading } = useQuery<Sub[]>({
    queryKey: ['my-subscriptions'],
    queryFn: () => api<Sub[]>('/users/me/subscriptions'),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/profile" className="p-2 -m-2 hover:bg-surface2 rounded-full"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold">Minhas Assinaturas</h1>
      </header>

      {isLoading && (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-surface1 rounded-2xl animate-pulse" />)}</div>
      )}

      {data?.length === 0 && (
        <div className="rounded-2xl bg-surface1 border border-border p-8 text-center space-y-3">
          <p className="text-text font-semibold">Você ainda não assina ninguém</p>
          <p className="text-sm text-muted">Explore criadoras e comece a receber conteúdo exclusivo.</p>
          <Link href="/em-alta" className="inline-block mt-2 px-5 py-2 rounded-full bg-brand text-white text-sm font-semibold">Explorar Em alta</Link>
        </div>
      )}

      <div className="space-y-3">
        {data?.map((s) => {
          const info = statusInfo[s.status] ?? statusInfo.ACTIVE;
          const Icon = info.icon;
          return (
            <Link key={s.id} href={`/${s.creator.username}`} className="block rounded-2xl bg-surface1 border border-border overflow-hidden hover:border-brand transition-colors">
              <div className="relative h-24 bg-surface2">
                {s.creator.coverImage && <Image src={s.creator.coverImage} alt="" fill className="object-cover" sizes="600px" />}
              </div>
              <div className="p-4 -mt-10 relative">
                <div className="flex items-end gap-3">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-surface1 bg-surface2 flex-shrink-0">
                    {s.creator.profilePicture && <Image src={s.creator.profilePicture} alt={s.creator.displayName} fill className="object-cover" sizes="64px" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold flex items-center gap-1 truncate">
                      {s.creator.displayName}
                      {s.creator.verified && <span className="inline-block w-4 h-4 rounded-full bg-brand grid place-items-center text-white text-[9px]">✓</span>}
                    </p>
                    <p className="text-xs text-muted">@{s.creator.username}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${info.cls}`}>
                    <Icon className="w-3 h-3" /> {info.label}
                  </span>
                  {s.currentPeriodEnd && (
                    <span className="inline-flex items-center gap-1 text-muted">
                      <Calendar className="w-3 h-3" />
                      Renova em {new Date(s.currentPeriodEnd).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                  <span className="font-semibold">{formatBRL(s.price)}{s.plan && ` / ${s.plan.intervalMonths}m`}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
