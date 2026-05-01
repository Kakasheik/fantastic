'use client';
/**
 * /me/verify — Solicitar verificação (KYC).
 */
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { SessionGate } from '@/components/layout/session-gate';

interface VerifyStatus {
  isVerified: boolean;
  isAgeVerified: boolean;
  kycStatus: string;
}

export default function VerifyPage() {
  return <SessionGate><VerifyView /></SessionGate>;
}

function VerifyView() {
  const { data: status } = useQuery<VerifyStatus>({
    queryKey: ['verify-status'],
    queryFn: () => api<VerifyStatus>('/users/me/verify-status'),
  });

  const [docType, setDocType]   = useState<'RG' | 'CNH' | 'PASSPORT'>('RG');
  const [submitted, setSubmitted] = useState(false);

  const submit = useMutation({
    mutationFn: () => api<{ ok: true; status: string; reviewEta: string }>('/users/me/verify-request', {
      method: 'POST',
      body: JSON.stringify({
        documentType:  docType,
        frontImageKey: `pending_front_${Date.now()}`,
        backImageKey:  docType !== 'PASSPORT' ? `pending_back_${Date.now()}` : undefined,
        selfieKey:     `pending_selfie_${Date.now()}`,
      }),
    }),
    onSuccess: () => setSubmitted(true),
  });

  const isApproved = status?.isVerified;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/me" className="p-2 -m-2 hover:bg-surface2 rounded-full"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold">Solicitar verificação</h1>
      </header>

      <section className="rounded-2xl bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] p-6 text-text space-y-2">
        <ShieldCheck className="w-8 h-8" />
        <h2 className="text-xl font-bold">Selo de verificação Fantastic</h2>
        <p className="text-sm">Mostre que você é uma pessoa real, ganhe um selo azul e desbloqueie recursos premium.</p>
      </section>

      {/* Status atual */}
      <section className="rounded-2xl bg-surface1 border border-border p-5">
        <p className="text-xs text-muted mb-2">STATUS</p>
        {isApproved ? (
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <p className="font-semibold">Verificado</p>
              <p className="text-xs text-muted">Selo ativo no seu perfil</p>
            </div>
          </div>
        ) : submitted ? (
          <div className="flex items-center gap-3 text-amber-700">
            <Clock className="w-5 h-5" />
            <div>
              <p className="font-semibold">Em análise</p>
              <p className="text-xs text-muted">Resposta em 24 a 48 horas no seu e-mail</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold text-text">Não solicitado</p>
              <p className="text-xs">Envie os documentos abaixo</p>
            </div>
          </div>
        )}
      </section>

      {!isApproved && !submitted && (
        <section className="rounded-2xl bg-surface1 border border-border p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de documento</label>
            <div className="grid grid-cols-3 gap-2">
              {(['RG', 'CNH', 'PASSPORT'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDocType(t)}
                  className={`h-11 rounded-full text-sm font-semibold transition-colors ${
                    docType === t ? 'bg-brand text-white' : 'bg-surface2 text-text hover:bg-border'
                  }`}
                >
                  {t === 'PASSPORT' ? 'Passaporte' : t}
                </button>
              ))}
            </div>
          </div>

          <UploadSlot label="Foto frente do documento" icon={Upload} />
          {docType !== 'PASSPORT' && <UploadSlot label="Foto verso do documento" icon={Upload} />}
          <UploadSlot label="Selfie segurando documento" icon={Upload} />

          <button
            onClick={() => submit.mutate()}
            disabled={submit.isPending}
            className="w-full h-12 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] text-white font-semibold disabled:opacity-60"
          >
            {submit.isPending ? 'Enviando...' : 'Enviar para análise'}
          </button>

          <p className="text-xs text-muted text-center leading-relaxed">
            Seus documentos são processados por parceiro KYC certificado conforme LGPD e Lei 15.211/2025.
            Mantidos por 5 anos (Lei 9.613/98) e nunca usados para outras finalidades.
          </p>
        </section>
      )}
    </div>
  );
}

function UploadSlot({ label, icon: Icon }: { label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <button
      type="button"
      className="w-full h-24 rounded-2xl border-2 border-dashed border-border bg-surface2 hover:border-brand hover:bg-brand-50 transition-colors flex flex-col items-center justify-center gap-2 text-muted hover:text-brand"
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
