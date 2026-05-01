'use client';
/**
 * /ajuda — FAQ + canais de suporte.
 */
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, ChevronUp, Mail, MessageSquare, Shield } from 'lucide-react';

const faqs = [
  {
    q: 'Como funciona a verificação de idade?',
    a: 'Para acessar a plataforma, exigimos verificação de identidade através do nosso parceiro SumSub, conforme a Lei 15.211/2025 (Digital ECA Brasil). Não aceitamos autodeclaração.',
  },
  {
    q: 'Como pago uma assinatura?',
    a: 'Aceitamos Pix (BR), cartão de crédito, Google Pay, PicPay e saldo da carteira. O Pix é o método mais rápido e sem taxas adicionais.',
  },
  {
    q: 'Como cancelo uma assinatura?',
    a: 'Acesse Meu Perfil → Assinaturas, escolha a criadora e clique em "Cancelar". O acesso permanece ativo até o fim do ciclo já pago.',
  },
  {
    q: 'Por que vejo conteúdo bloqueado?',
    a: 'Posts marcados com cadeado são exclusivos para assinantes ou conteúdo Pay-Per-View (PPV). Para desbloquear, assine a criadora ou pague o valor do PPV.',
  },
  {
    q: 'Como recarrego minha carteira?',
    a: 'Vá em Meu Perfil → Carteira → Recarregar. Escolha o valor e gere um Pix instantâneo. O saldo aparece em até 1 minuto após o pagamento.',
  },
  {
    q: 'Como me torno criador(a)?',
    a: 'Em Meu Perfil, clique em "Seja creator agora". O processo leva 24-48h para validação do cadastro, KYC e configuração da conta de pagamento.',
  },
  {
    q: 'Como é tratada minha privacidade?',
    a: 'Seus dados são protegidos conforme a LGPD. Você pode exportar ou anonimizar seus dados a qualquer momento em Definições. Saiba mais na nossa Política de Privacidade.',
  },
  {
    q: 'O que fazer em caso de conteúdo ilegal?',
    a: 'Use o botão "Reportar" em qualquer post ou perfil. Conteúdos como CSAM ou material não consensual são removidos em até 1h e reportados às autoridades.',
  },
];

export default function AjudaPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/profile" className="p-2 -m-2 hover:bg-surface2 rounded-full"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold">Central de Ajuda</h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ContactCard icon={Mail} href="mailto:suporte@fantastic.com.br" title="E-mail" subtitle="suporte@fantastic.com.br" />
        <ContactCard icon={MessageSquare} href="/chat" title="Chat ao vivo" subtitle="Resposta em até 1h" />
        <ContactCard icon={Shield} href="mailto:abuse@fantastic.com.br" title="Reportar abuso" subtitle="Resposta em 24h" />
      </section>

      <section>
        <h2 className="font-semibold mb-3">Perguntas frequentes</h2>
        <div className="space-y-2">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-2xl bg-surface1 border border-border overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-surface2 transition-colors"
                >
                  <span className="text-sm font-medium pr-4">{f.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />}
                </button>
                {isOpen && <div className="px-4 pb-4 text-sm text-muted leading-relaxed">{f.a}</div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ContactCard({ icon: Icon, href, title, subtitle }: { icon: React.ComponentType<{ className?: string }>; href: string; title: string; subtitle: string }) {
  return (
    <Link href={href} className="block rounded-2xl bg-surface1 border border-border p-4 hover:border-brand transition-colors text-center">
      <Icon className="w-6 h-6 mx-auto mb-2 text-brand" />
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted truncate">{subtitle}</p>
    </Link>
  );
}
