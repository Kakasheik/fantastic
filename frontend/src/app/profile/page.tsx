'use client';
/**
 * /profile — "Meu Perfil" (hub do usuário, estilo Privacy).
 *
 * Estrutura:
 *  1. Avatar + nickname + toggle modo escuro
 *  2. "Fique por dentro" — banner de afiliados
 *  3. CTA "Seja creator agora"
 *  4. Grid Área do Assinante (Chat, Assinaturas, Carteira, Atividades, Definições, Ajuda, Sair)
 */
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import {
  MessageCircle, UserPlus, Wallet, Bookmark, Settings, HelpCircle, ArrowLeft,
  Moon,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Toggle } from '@/components/ui/toggle';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { SessionGate } from '@/components/layout/session-gate';

interface MeData {
  id: string;
  email: string;
  username: string;
  role: string;
  fullName: string | null;
  walletBalance: number;
  profilePicture: string | null;
}

export default function ProfilePage() {
  return <SessionGate><ProfileHub /></SessionGate>;
}

function ProfileHub() {
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);

  const { data: me } = useQuery<MeData>({
    queryKey: ['me'],
    queryFn: () => api<MeData>('/auth/me'),
    enabled: !!user,
  });

  const nickname = me?.fullName?.split(' ')[0]?.toLowerCase() ?? me?.username ?? user?.username ?? 'guest';
  const initials = (nickname.slice(0, 2)).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Avatar + nickname + dark mode */}
      <section className="rounded-2xl border border-border bg-surface1 p-5 space-y-4">
        <Link href="/me" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Avatar src={me?.profilePicture ?? null} alt={initials} size="lg" online />
          <div>
            <p className="text-xl font-bold text-text">{nickname}</p>
            {me?.fullName && <p className="text-sm text-muted">{me.fullName}</p>}
            <p className="text-xs text-brand mt-0.5">Ver meu perfil →</p>
          </div>
        </Link>

        <div className="border-t border-border pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-text" />
            <span className="text-sm text-text">Modo escuro</span>
          </div>
          <Toggle
            on={theme === 'dark'}
            onChange={(next) => setTheme(next ? 'dark' : 'light')}
            ariaLabel="Alternar modo escuro"
          />
        </div>
      </section>

      {/* Fique por dentro — afiliados */}
      <section>
        <h2 className="text-sm font-semibold text-text mb-2">Fique por dentro</h2>
        <Link
          href="/afiliados"
          className="block rounded-2xl bg-brand-100 p-4 hover:bg-brand-100/80 transition-colors relative"
        >
          <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-bg text-brand border border-brand">
            novo
          </span>
          <div className="flex items-center gap-4">
            <span className="brand-logo text-lg font-bold tracking-tight text-text leading-tight">
              fantastic<br />afiliados
            </span>
            <p className="text-sm text-text leading-relaxed">
              Ganhe <span className="text-brand font-semibold">comissões</span><br />
              <span className="text-brand font-semibold">indicando criadoras</span> que você já acompanha.
            </p>
          </div>
        </Link>
      </section>

      {/* CTA Seja creator */}
      <section>
        <div className="rounded-2xl bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] p-5 text-center space-y-3">
          <div className="flex items-center justify-center -space-x-2 mb-2">
            {[
              'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=80&q=80',
              'https://images.unsplash.com/photo-1545912452-8aea7e25a3d3?auto=format&fit=crop&w=80&q=80',
              'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=80&q=80',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80',
            ].map((src, i) => (
              <div key={i} className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white">
                <Image src={src} alt="" fill className="object-cover" sizes="40px" />
              </div>
            ))}
            <div className="relative w-12 h-10 rounded-full bg-white grid place-items-center text-brand font-bold text-xs ring-2 ring-white ml-1 px-2">
              Você!
            </div>
          </div>
          <p className="font-semibold text-text">Quer faturar de onde estiver com a Fantastic?</p>
          <Link
            href="/become-creator"
            className="inline-block px-6 py-2 rounded-full bg-bg text-text font-semibold text-sm hover:bg-bg/90"
          >
            Seja creator agora
          </Link>
        </div>
      </section>

      {/* Área do Assinante */}
      <section>
        <h2 className="text-sm font-semibold text-text mb-3">Área do Assinante</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <HubCard href="/chat"        icon={MessageCircle} title="Chat"         subtitle="Converse com criadoras agora" />
          <HubCard href="/assinaturas" icon={UserPlus}      title="Assinaturas"  subtitle="Veja as criadoras que você assina" />
          <HubCard href="/carteira"    icon={Wallet}        title="Carteira"     subtitle="Escolha como paga e veja seus gastos" />
          <HubCard href="/atividades"  icon={Bookmark}      title="Atividades"   subtitle="Acesse suas mídias favoritas salvas" />
          <HubCard href="/definicoes"  icon={Settings}      title="Definições"   subtitle="Personalize sua experiência" />
          <HubCard href="/ajuda"       icon={HelpCircle}    title="Ajuda"        subtitle="Precisa de suporte ou tem dúvidas?" />
        </div>

        <div className="mt-3">
          <button
            onClick={() => { useAuthStore.getState().clear(); window.location.href = '/login'; }}
            className="w-full text-left rounded-2xl border border-border bg-surface1 p-4 hover:bg-surface2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ArrowLeft className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-600">Sair</p>
                <p className="text-xs text-muted">Sair da plataforma</p>
              </div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

function HubCard({ href, icon: Icon, title, subtitle }: { href: string; icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-surface1 p-4 hover:border-brand transition-colors block"
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-text mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text">{title}</p>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}
