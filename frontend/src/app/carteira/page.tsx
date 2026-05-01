'use client';
/**
 * /carteira — Saldo + histórico + recarga via Pix.
 */
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowUp, ChevronLeft, Plus, Copy, Check, X } from 'lucide-react';
import { api } from '@/lib/api';
import { formatBRL, formatRelative } from '@/lib/utils';
import { SessionGate } from '@/components/layout/session-gate';

interface Wallet {
  balance: number;
  recent: Array<{ id: string; type: string; amount: number; direction: 'IN' | 'OUT'; status: string; createdAt: string }>;
}

interface Tx {
  id: string;
  type: string;
  amount: number;
  netAmount: number;
  status: string;
  paymentMethod: string | null;
  direction: 'IN' | 'OUT';
  counterpart: { username: string; profilePicture: string | null } | null;
  createdAt: string;
}

interface Recharge {
  transactionId: string;
  amount: number;
  pixCode: string;
  pixQrCodeUrl: string;
}

export default function CarteiraPage() {
  return <SessionGate><CarteiraView /></SessionGate>;
}

function CarteiraView() {
  const [showRecharge, setShowRecharge] = useState(false);

  const { data: wallet } = useQuery<Wallet>({ queryKey: ['wallet'], queryFn: () => api<Wallet>('/users/me/wallet') });
  const { data: txs } = useQuery<Tx[]>({ queryKey: ['transactions'], queryFn: () => api<Tx[]>('/users/me/transactions?limit=30') });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/profile" className="p-2 -m-2 hover:bg-surface2 rounded-full"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold">Carteira</h1>
      </header>

      <section className="rounded-2xl bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] p-6 text-text space-y-3">
        <p className="text-sm font-medium opacity-80">Saldo disponível</p>
        <p className="text-4xl font-bold">{wallet ? formatBRL(wallet.balance) : 'R$ —'}</p>
        <button
          onClick={() => setShowRecharge(true)}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-bg text-text font-semibold text-sm hover:bg-bg/90"
        >
          <Plus className="w-4 h-4" /> Recarregar
        </button>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Transações</h2>
        <div className="rounded-2xl border border-border bg-surface1 divide-y divide-border">
          {txs?.length === 0 && <p className="p-6 text-center text-muted text-sm">Sem transações.</p>}
          {txs?.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-4">
              <div className={`w-10 h-10 rounded-full grid place-items-center ${t.direction === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {t.direction === 'IN' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {t.type === 'SUBSCRIPTION' ? 'Assinatura' : t.type === 'PPV' ? 'Pay-per-view' : t.type === 'TIP' ? 'Gorjeta' : t.type === 'AD_CREDIT' ? 'Recarga' : t.type}
                  {t.counterpart && <span className="text-muted font-normal"> · @{t.counterpart.username}</span>}
                </p>
                <p className="text-xs text-muted">{formatRelative(t.createdAt)} · {t.status === 'COMPLETED' ? 'Concluída' : t.status === 'PENDING' ? 'Pendente' : t.status}</p>
              </div>
              <p className={`text-sm font-semibold whitespace-nowrap ${t.direction === 'IN' ? 'text-emerald-600' : 'text-text'}`}>
                {t.direction === 'IN' ? '+' : '-'}{formatBRL(t.amount)}
              </p>
            </div>
          ))}
          {!txs && (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-surface2 rounded animate-pulse" />)}
            </div>
          )}
        </div>
      </section>

      {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} />}
    </div>
  );
}

function RechargeModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState(50);
  const [copied, setCopied] = useState(false);

  const recharge = useMutation<Recharge, Error, number>({
    mutationFn: (amt) => api<Recharge>('/wallet/recharge', { method: 'POST', body: JSON.stringify({ amount: amt }) }),
  });

  async function copy() {
    if (!recharge.data) return;
    await navigator.clipboard.writeText(recharge.data.pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4">
      <div className="bg-surface1 rounded-2xl border border-border w-full max-w-md p-6 space-y-5">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Recarregar carteira</h2>
          <button onClick={onClose} className="w-9 h-9 grid place-items-center rounded-full hover:bg-surface2 text-muted" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </header>

        {!recharge.data ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              {[20, 50, 100, 200, 500, 1000].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className={`h-12 rounded-full font-semibold text-sm transition-colors ${
                    amount === v ? 'bg-brand text-white' : 'bg-surface2 text-text hover:bg-border'
                  }`}
                >
                  {formatBRL(v)}
                </button>
              ))}
            </div>
            <button
              onClick={() => recharge.mutate(amount)}
              disabled={recharge.isPending}
              className="w-full h-12 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] text-white font-semibold disabled:opacity-60"
            >
              {recharge.isPending ? 'Gerando Pix...' : `Gerar Pix de ${formatBRL(amount)}`}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted text-center">Escaneie o QR ou copie o código:</p>
            <div className="flex justify-center">
              <div className="rounded-xl border border-border p-3 bg-white">
                <Image src={recharge.data.pixQrCodeUrl} alt="QR Pix" width={240} height={240} unoptimized />
              </div>
            </div>
            <div className="rounded-full border border-border bg-surface2 px-4 h-10 flex items-center text-xs text-muted">
              <span className="truncate">{recharge.data.pixCode}</span>
            </div>
            <button
              onClick={copy}
              className="w-full h-12 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] text-white font-semibold flex items-center justify-center gap-2"
            >
              {copied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar chave Pix</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
