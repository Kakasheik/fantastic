'use client';
/**
 * /afiliados — Programa de afiliados (landing).
 */
import Link from 'next/link';
import { ChevronLeft, Share2, Wallet, Users, BarChart3 } from 'lucide-react';

export default function AfiliadosPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/profile" className="p-2 -m-2 hover:bg-surface2 rounded-full"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold">Afiliados</h1>
      </header>

      <section className="rounded-2xl bg-brand-100 p-6 text-center space-y-3">
        <span className="brand-logo text-2xl font-bold tracking-tight text-text">fantastic</span>
        <p className="text-sm text-text">
          Ganhe <span className="text-brand font-semibold">comissões</span> indicando criadoras que você já acompanha.
        </p>
        <button className="px-6 py-3 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-600">
          Quero participar
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Stat icon={Users}     label="Indicações" value="0" />
        <Stat icon={Wallet}    label="Recebido" value="R$ 0,00" />
        <Stat icon={Share2}    label="Cliques" value="0" />
        <Stat icon={BarChart3} label="Conversão" value="0%" />
      </section>

      <section>
        <h2 className="font-semibold mb-2">Como funciona</h2>
        <ol className="rounded-2xl bg-surface1 border border-border p-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-brand text-white grid place-items-center text-xs font-bold flex-shrink-0">1</span>
            <p>Compartilhe seu link único para criadoras que você assina.</p>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-brand text-white grid place-items-center text-xs font-bold flex-shrink-0">2</span>
            <p>Toda nova assinatura via seu link gera comissão de <strong>10%</strong> recorrente.</p>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-brand text-white grid place-items-center text-xs font-bold flex-shrink-0">3</span>
            <p>Receba na sua carteira automaticamente assim que o pagamento for confirmado.</p>
          </li>
        </ol>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface1 border border-border p-4">
      <Icon className="w-5 h-5 text-brand mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
