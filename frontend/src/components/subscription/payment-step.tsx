'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { Copy, Check, Wallet, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatBRL } from '@/lib/utils';
import { extractApiMessage } from '@/lib/api-error';

interface CheckoutResult {
  method: 'PIX' | 'CREDIT_CARD' | 'GOOGLE_PAY' | 'PICPAY' | 'WALLET';
  amount: number;
  currency: string;
  pixCode?: string;
  pixQrCodeUrl?: string;
  txid?: string;
  checkoutUrl?: string;
  subscriptionId: string;
  transactionId: string;
}

interface Props {
  creator: { id: string; username: string; displayName: string; profilePicture: string | null; coverImage: string | null };
  plan:    { id: string; name: string; intervalMonths: number; price: number };
  onClose: () => void;
}

type Method = 'PIX' | 'CREDIT_CARD' | 'GOOGLE_PAY' | 'PICPAY' | 'WALLET';

export function PaymentStep({ creator, plan, onClose: _ }: Props) {
  const [copied, setCopied] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);

  const checkout = useMutation<CheckoutResult, Error, Method>({
    mutationFn: (method) =>
      api<CheckoutResult>('/subscriptions/checkout', {
        method: 'POST',
        body: JSON.stringify({ creatorId: creator.id, planId: plan.id, paymentMethod: method }),
      }),
  });

  // Inicia automaticamente com Pix uma vez (sem loop em render).
  useEffect(() => {
    if (!autoStarted) {
      setAutoStarted(true);
      checkout.mutate('PIX');
    }
  }, [autoStarted, checkout]);

  async function copyPix() {
    if (!checkout.data?.pixCode) return;
    try {
      await navigator.clipboard.writeText(checkout.data.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  // Loading inicial OU sem dados ainda (cobre o gap entre useEffect e mutate).
  if (!checkout.data && !checkout.error) {
    return (
      <div className="py-10 flex flex-col items-center gap-3 text-muted text-sm">
        <Loader2 className="w-6 h-6 animate-spin" />
        Gerando pagamento...
      </div>
    );
  }

  if (checkout.error && !checkout.data) {
    return (
      <div className="py-6 text-center space-y-3">
        <p className="text-red-600 text-sm">
          {extractApiMessage(checkout.error, 'Não foi possível gerar o pagamento.')}
        </p>
        <button
          onClick={() => { setAutoStarted(false); checkout.reset(); }}
          className="text-brand text-sm underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const data = checkout.data!;
  const isPix = data.method === 'PIX';

  return (
    <div className="space-y-4">
      <section>
        <h3 className="font-semibold mb-1">Formas de pagamento</h3>
        <p className="text-xs text-muted">Valor</p>
        <p className="text-2xl font-bold">{formatBRL(data.amount)}</p>
      </section>

      {isPix && data.pixQrCodeUrl && (
        <>
          <div className="flex justify-center">
            <div className="rounded-xl border border-border p-3 bg-white">
              <Image
                src={data.pixQrCodeUrl}
                alt="QR Code Pix"
                width={260}
                height={260}
                className="block"
                unoptimized
              />
            </div>
          </div>

          <div className="rounded-full border border-border bg-surface2 px-4 h-11 flex items-center text-xs text-muted">
            <span className="truncate">{data.pixCode}</span>
          </div>

          <button
            onClick={copyPix}
            className="w-full h-12 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-95"
          >
            {copied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar chave Pix</>}
          </button>
        </>
      )}

      {!isPix && (
        <div className="rounded-2xl bg-surface2 border border-border p-4 text-center text-sm">
          <p className="font-semibold">Pagamento via {data.method.replace('_', ' ').toLowerCase()}</p>
          <p className="text-muted text-xs mt-1">Em produção, redirecionaria para o checkout do gateway.</p>
        </div>
      )}

      <div className="border-t border-border pt-4 space-y-2">
        <button
          onClick={() => checkout.mutate('GOOGLE_PAY')}
          disabled={checkout.isPending}
          className="w-full h-12 rounded-full bg-text text-bg font-medium flex items-center justify-center gap-2 hover:bg-text/90 disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M21.4 11.5c0-.7-.1-1.4-.2-2H12v3.8h5.2c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.7 2.9-4.1 2.9-7.1z"/><path fill="#34A853" d="M12 22c2.6 0 4.7-.9 6.3-2.4l-3.1-2.4c-.9.6-2 1-3.2 1-2.4 0-4.5-1.6-5.2-3.8H3.6v2.4C5.2 19.9 8.4 22 12 22z"/><path fill="#FBBC05" d="M6.8 13.4c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.2H3.6C2.9 8.6 2.5 10.2 2.5 12s.4 3.4 1.1 4.8l3.2-3.4z"/><path fill="#EA4335" d="M12 6.4c1.4 0 2.6.5 3.5 1.4l2.7-2.7C16.6 3.5 14.5 2.5 12 2.5 8.4 2.5 5.2 4.6 3.6 7.7l3.2 2.4C7.5 8 9.6 6.4 12 6.4z"/></svg>
          <span className="font-semibold tracking-wide">Pay</span>
        </button>

        <button
          onClick={() => alert('Pagamento por cartão será aberto em uma nova janela em produção.')}
          className="w-full h-12 rounded-full bg-surface2 hover:bg-border text-text font-medium"
        >
          Pagar com cartão de crédito
        </button>

        <button
          onClick={() => checkout.mutate('PICPAY')}
          disabled={checkout.isPending}
          className="w-full h-12 rounded-full bg-surface2 hover:bg-border text-text font-medium flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          Pagar com <span className="font-bold text-[#21C25E]">PicPay</span>
        </button>

        <div className="relative pt-2">
          <span className="absolute -top-1.5 left-3 px-2 text-[10px] bg-surface1 text-brand font-semibold border border-brand-100 rounded-full">Carteira</span>
          <button
            onClick={() => checkout.mutate('WALLET')}
            disabled={checkout.isPending}
            className="w-full h-12 rounded-full bg-text text-bg font-medium flex items-center justify-center gap-2 hover:bg-text/90 disabled:opacity-60"
          >
            Recarregar <Wallet className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
