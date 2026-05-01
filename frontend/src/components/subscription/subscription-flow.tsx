'use client';
/**
 * SubscriptionFlow — orquestra etapas do checkout (Privacy-style).
 *
 *   1) Cadastro completo (Apelido, Celular, CPF, E-mail, Nome Completo, DOB)
 *   2) Pagamento — Pix QR + alternativas (Cartão, Google Pay, PicPay, Carteira)
 *
 * Em dev cria um usuário "convidado" automaticamente se ainda não houver sessão.
 */
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { CompleteProfileStep } from './complete-profile-step';
import { PaymentStep } from './payment-step';

export interface SubscriptionFlowProps {
  creator: {
    id: string;
    username: string;
    displayName: string;
    profilePicture: string | null;
    coverImage: string | null;
  };
  plan: {
    id: string;
    name: string;
    intervalMonths: number;
    price: number;
  };
  onClose: () => void;
}

export function SubscriptionFlow(props: SubscriptionFlowProps) {
  const [step, setStep] = useState<'profile' | 'payment'>('profile');
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    /**
     * SECURITY: Em prod, este modal só abre para usuários autenticados.
     * Em dev, criamos um usuário convidado automaticamente para que o fluxo
     * funcione sem login manual.
     */
    if (!user) {
      void (async () => {
        const random = Math.random().toString(36).slice(2, 10);
        try {
          const data = await api<{ accessToken: string; user: { id: string; email: string; username: string; role: 'SUBSCRIBER' | 'CREATOR' | 'ADVERTISER' | 'ADMIN' } }>(
            '/auth/register',
            {
              method: 'POST',
              skipAuth: true,
              body: JSON.stringify({
                email:    `guest-${random}@fantastic.local`,
                username: `guest_${random}`,
                password: 'guestPassDev1',
                role:     'SUBSCRIBER',
              }),
            },
          );
          setSession(data.accessToken, data.user);
        } catch (err) {
          console.error('Falha ao criar guest:', err);
        }
      })();
    }
  }, [user, setSession]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 animate-fade-in">
      <div className="relative bg-surface1 rounded-2xl border border-border w-full max-w-md max-h-[92dvh] overflow-y-auto">
        {/* Cover de fundo */}
        <div className="relative h-32">
          {props.creator.coverImage && (
            <Image src={props.creator.coverImage} alt="" fill className="object-cover" sizes="500px" />
          )}
          <button
            onClick={props.onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-bg/80 backdrop-blur grid place-items-center hover:bg-bg"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + nome */}
          <div className="flex items-center gap-3 -mt-8 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-surface1 bg-surface2 relative flex-shrink-0">
              {props.creator.profilePicture && (
                <Image src={props.creator.profilePicture} alt={props.creator.displayName} fill className="object-cover" sizes="80px" />
              )}
            </div>
            <div className="pt-7">
              <p className="font-semibold text-sm">{props.creator.displayName}</p>
              <p className="text-xs text-muted">@{props.creator.username}</p>
            </div>
          </div>

          {/* Benefícios */}
          <Benefits />

          {step === 'profile' && (
            <CompleteProfileStep
              onContinue={() => setStep('payment')}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              creator={props.creator}
              plan={props.plan}
              onClose={props.onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Benefits() {
  const items = ['Acesso ao conteúdo', 'Chat exclusivo com a criadora', 'Cancele a qualquer hora'];
  return (
    <section className="mb-5">
      <h3 className="font-semibold mb-2">Benefícios exclusivos</h3>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it} className="flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded-full bg-brand grid place-items-center text-white text-[10px]">✓</span>
            {it}
          </li>
        ))}
      </ul>
    </section>
  );
}
