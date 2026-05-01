'use client';
/**
 * /definicoes — Configurações do usuário.
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Bell, Mail, Shield, Globe, Moon, FileText } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { api } from '@/lib/api';
import { SessionGate } from '@/components/layout/session-gate';

interface Prefs {
  theme: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  twoFactorEnabled: boolean;
}

export default function DefinicoesPage() {
  return <SessionGate><DefinicoesView /></SessionGate>;
}

function DefinicoesView() {
  const { theme, setTheme } = useTheme();
  const { data, refetch } = useQuery<Prefs>({ queryKey: ['prefs'], queryFn: () => api<Prefs>('/users/me/preferences') });
  const update = useMutation({
    mutationFn: (patch: Partial<Prefs>) => api('/users/me/preferences', { method: 'POST', body: JSON.stringify(patch) }),
    onSuccess: () => refetch(),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/profile" className="p-2 -m-2 hover:bg-surface2 rounded-full"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold">Definições</h1>
      </header>

      <section className="rounded-2xl bg-surface1 border border-border divide-y divide-border">
        <SettingRow icon={Globe} label="Idioma" value={data?.language ?? 'pt-BR'}>
          <select
            value={data?.language ?? 'pt-BR'}
            onChange={(e) => update.mutate({ language: e.target.value })}
            className="text-sm bg-surface2 border border-border rounded-full h-10 px-3 focus:outline-none focus:border-brand"
          >
            <option value="pt-BR">Português (BR)</option>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español</option>
          </select>
        </SettingRow>

        <SettingRow icon={Bell} label="Notificações push">
          <Toggle
            on={data?.pushNotifications ?? true}
            onChange={(v) => update.mutate({ pushNotifications: v })}
          />
        </SettingRow>

        <SettingRow icon={Mail} label="Notificações por e-mail">
          <Toggle
            on={data?.emailNotifications ?? true}
            onChange={(v) => update.mutate({ emailNotifications: v })}
          />
        </SettingRow>

        <SettingRow icon={Shield} label="Autenticação 2FA">
          <Toggle
            on={data?.twoFactorEnabled ?? false}
            onChange={() => alert('2FA estará disponível em breve.')}
          />
        </SettingRow>
      </section>

      <section className="rounded-2xl bg-surface1 border border-border divide-y divide-border">
        <SettingRow icon={Moon} label="Tema escuro">
          <Toggle on={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} />
        </SettingRow>
      </section>

      <section className="rounded-2xl bg-surface1 border border-border divide-y divide-border">
        <LinkRow icon={FileText} href="/legal/terms"   label="Termos de Uso" />
        <LinkRow icon={FileText} href="/legal/privacy" label="Política de Privacidade" />
        <LinkRow icon={FileText} href="/legal/content" label="Política de Conteúdo" />
        <LinkRow icon={FileText} href="/legal/refund"  label="Política de Reembolso" />
      </section>

      <section>
        <button
          onClick={() => alert('Para excluir sua conta, abra um chamado em /ajuda. Conforme LGPD art. 18, IV, processamos em até 15 dias.')}
          className="w-full text-left rounded-2xl bg-surface1 border border-border p-4 text-red-600 font-semibold hover:bg-red-50"
        >
          Excluir minha conta
        </button>
      </section>
    </div>
  );
}

function SettingRow({ icon: Icon, label, value, children }: { icon: React.ComponentType<{ className?: string }>; label: string; value?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Icon className="w-5 h-5 text-muted flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {value && <p className="text-xs text-muted">{value}</p>}
      </div>
      {children}
    </div>
  );
}

function LinkRow({ icon: Icon, href, label }: { icon: React.ComponentType<{ className?: string }>; href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-4 hover:bg-surface2 transition-colors">
      <Icon className="w-5 h-5 text-muted" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="w-4 h-4 text-muted" />
    </Link>
  );
}
