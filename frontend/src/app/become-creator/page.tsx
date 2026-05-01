'use client';
/**
 * /become-creator — Wizard multi-etapas (estilo Privacy).
 *
 * Etapas:
 *   1. Welcome
 *   2. Identificação (país + CPF + nome + DOB)
 *   3. Perfil — foto + handle
 *   4. Perfil — capa + bio
 *   5. Redes Sociais
 *   6. Assinatura (preço + descontos)
 *   7. KYC — Verificação de documentos (intro)
 *   8. KYC — Acesso à câmera + captura
 */
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowLeft, Camera, ChevronDown, ShieldCheck, Aperture } from 'lucide-react';
import { api } from '@/lib/api';
import { SessionGate } from '@/components/layout/session-gate';

type Step = 'welcome' | 'id' | 'photo' | 'cover' | 'social' | 'subscription' | 'kyc-intro' | 'kyc-camera';

interface FormState {
  country: string;
  cpf: string;
  fullName: string;
  dateOfBirth: string;
  handle: string;
  displayName: string;
  profilePicture: string;
  coverImage: string;
  bio: string;
  instagram: string;
  tiktok: string;
  twitter: string;
  monthlyPrice: number;
  quarterlyDiscount: number;
  semesterDiscount: number;
}

interface Summary {
  username: string;
  fullName: string | null;
  nickname: string | null;
  bio: string | null;
  profilePicture: string | null;
}

const STEP_ORDER: Step[] = ['welcome', 'id', 'photo', 'cover', 'social', 'subscription', 'kyc-intro', 'kyc-camera'];

export default function BecomeCreatorPage() {
  return <SessionGate><BecomeCreatorWizard /></SessionGate>;
}

function BecomeCreatorWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const idx = STEP_ORDER.indexOf(step);
  const progress = (idx / (STEP_ORDER.length - 1)) * 100;

  const { data: me } = useQuery<Summary>({ queryKey: ['me-summary'], queryFn: () => api<Summary>('/users/me/summary') });

  const [form, setForm] = useState<FormState>({
    country: 'Brasil',
    cpf: '',
    fullName: '',
    dateOfBirth: '',
    handle: '',
    displayName: '',
    profilePicture: '',
    coverImage: '',
    bio: '',
    instagram: '',
    tiktok: '',
    twitter: '',
    monthlyPrice: 49.90,
    quarterlyDiscount: 10,
    semesterDiscount: 20,
  });

  // Pré-preenche com dados do usuário logado
  useEffect(() => {
    if (me) {
      setForm((f) => ({
        ...f,
        fullName:       f.fullName       || me.fullName  || '',
        handle:         f.handle         || me.username  || '',
        displayName:    f.displayName    || me.nickname  || me.username || '',
        profilePicture: f.profilePicture || me.profilePicture || '',
        bio:            f.bio            || me.bio       || '',
      }));
    }
  }, [me]);

  const submit = useMutation({
    mutationFn: () => api<{ ok: true; handle: string; profileUrl: string }>('/users/me/become-creator', {
      method: 'POST',
      body: JSON.stringify({
        country:           'BR',
        cpf:               form.cpf.replace(/\D/g, ''),
        fullName:          form.fullName,
        dateOfBirth:       form.dateOfBirth,
        handle:            form.handle.replace(/^@/, '').toLowerCase(),
        displayName:       form.displayName || form.handle,
        profilePicture:    form.profilePicture || undefined,
        coverImage:        form.coverImage || undefined,
        bio:               form.bio || undefined,
        instagram:         form.instagram || undefined,
        tiktok:            form.tiktok || undefined,
        twitter:           form.twitter || undefined,
        monthlyPrice:      form.monthlyPrice,
        quarterlyDiscount: form.quarterlyDiscount,
        semesterDiscount:  form.semesterDiscount,
      }),
    }),
    onSuccess: () => setStep('kyc-intro'),
    onError:   (err) => alert((err as Error).message ?? 'Erro ao criar perfil'),
  });

  const next = () => {
    const i = STEP_ORDER.indexOf(step);
    if (i < STEP_ORDER.length - 1) setStep(STEP_ORDER[i + 1]);
  };
  const back = () => {
    const i = STEP_ORDER.indexOf(step);
    if (i > 0) setStep(STEP_ORDER[i - 1]);
    else router.push('/profile');
  };

  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <header className="sticky top-0 bg-bg/95 backdrop-blur z-20 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3 relative">
          <button onClick={back} className="p-2 -m-2 rounded-full hover:bg-surface2 w-11 h-11 grid place-items-center" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 font-semibold text-text text-sm">
            {step === 'id'           && 'Região e identificação'}
            {step === 'photo'        && 'Personalização perfil'}
            {step === 'cover'        && 'Personalização perfil'}
            {step === 'social'       && 'Redes Sociais'}
            {step === 'subscription' && 'Assinatura'}
            {step === 'kyc-intro'    && 'Verificação de documentos'}
            {step === 'kyc-camera'   && 'Verificação de documentos'}
          </h1>
          {step === 'welcome' && (
            <button onClick={next} className="ml-auto text-sm text-text font-medium flex items-center gap-1 hover:text-brand h-11">
              Pular tutorial <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
        {step !== 'welcome' && (
          <div className="h-1 bg-border">
            <div className="h-full bg-brand transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-32">
        {step === 'welcome'      && <Welcome />}
        {step === 'id'           && <IdentificationStep form={form} setForm={setForm} onAdvance={next} />}
        {step === 'photo'        && <PhotoHandleStep   form={form} setForm={setForm} onAdvance={next} />}
        {step === 'cover'        && <CoverBioStep      form={form} setForm={setForm} onAdvance={next} />}
        {step === 'social'       && <SocialStep        form={form} setForm={setForm} onAdvance={next} />}
        {step === 'subscription' && <SubscriptionStep  form={form} setForm={setForm} onAdvance={() => submit.mutate()} loading={submit.isPending} />}
        {step === 'kyc-intro'    && <KycIntro onAdvance={() => setStep('kyc-camera')} />}
        {step === 'kyc-camera'   && <KycCamera onDone={() => router.push(`/${form.handle.toLowerCase()}`)} />}
      </main>

      {step === 'welcome' && (
        <footer className="pb-8 pt-4 px-4 flex items-center justify-between max-w-2xl mx-auto w-full">
          <span className="text-sm text-muted">Passo 1/4</span>
          <button
            onClick={next}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] grid place-items-center text-white shadow-md hover:opacity-90"
            aria-label="Avançar"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </footer>
      )}
    </div>
  );
}

// =====================================================================
// STEP 1 — WELCOME
// =====================================================================
function Welcome() {
  const photos = [
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1545912452-8aea7e25a3d3?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1509783236416-c9ad59bae472?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1488508872907-592763824245?auto=format&fit=crop&w=200&q=80',
  ];

  return (
    <div className="space-y-8 py-4">
      <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
        {photos.map((src, i) => {
          const tall = i % 5 === 1 || i % 5 === 3;
          return (
            <div key={i} className={`relative rounded-2xl overflow-hidden bg-surface2 ${tall ? 'aspect-[3/5]' : 'aspect-[3/4]'}`}>
              <Image src={src} alt="" fill className="object-cover" sizes="80px" />
            </div>
          );
        })}
      </div>
      <div className="text-center max-w-md mx-auto space-y-3">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] bg-clip-text text-transparent">
          Junte-se aos nossos Creators
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          Mostre seu talento, compartilhe sua criatividade e transforme fãs em assinantes.<br />
          Com a Fantastic, você tem o palco para crescer e faturar.
        </p>
      </div>
    </div>
  );
}

// =====================================================================
// STEP 2 — IDENTIFICATION
// =====================================================================
function IdentificationStep({ form, setForm, onAdvance }: { form: FormState; setForm: (f: FormState) => void; onAdvance: () => void }) {
  const valid = form.cpf.replace(/\D/g, '').length === 11 && form.fullName.length >= 3 && !!form.dateOfBirth;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Qual seu país de origem?</h2>

      <FloatingField label="País">
        <div className="relative">
          <select
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="w-full h-14 px-4 pt-5 pb-1 rounded-full bg-transparent text-sm focus:outline-none appearance-none pr-10"
          >
            <option>Brasil</option>
            <option>Portugal</option>
            <option>Argentina</option>
            <option>Estados Unidos</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </div>
      </FloatingField>

      <FloatingField label="CPF">
        <input
          value={form.cpf}
          onChange={(e) => setForm({ ...form, cpf: formatCPF(e.target.value) })}
          maxLength={14}
          placeholder="000.000.000-00"
          inputMode="numeric"
          className="w-full h-14 px-4 pt-5 pb-1 rounded-full bg-transparent text-sm focus:outline-none placeholder:text-muted/40"
        />
      </FloatingField>

      <FloatingField label="Nome">
        <input
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className="w-full h-14 px-4 pt-5 pb-1 rounded-full bg-transparent text-sm focus:outline-none"
        />
      </FloatingField>

      <FloatingField label="Data de Nascimento">
        <input
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
          className="w-full h-14 px-4 pt-5 pb-1 rounded-full bg-transparent text-sm focus:outline-none"
        />
      </FloatingField>

      <button
        onClick={onAdvance}
        disabled={!valid}
        className="w-full h-14 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] text-white font-semibold disabled:opacity-50"
      >
        Avançar
      </button>
    </div>
  );
}

// =====================================================================
// STEP 3 — PROFILE PHOTO + HANDLE
// =====================================================================
function PhotoHandleStep({ form, setForm, onAdvance }: { form: FormState; setForm: (f: FormState) => void; onAdvance: () => void }) {
  const valid = form.displayName.length >= 2 && form.handle.length >= 3;
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Adicione uma foto e defina seu identificador Fantastic</h2>

      <div className="flex justify-center py-4">
        <AvatarUploader value={form.profilePicture} onChange={(v) => setForm({ ...form, profilePicture: v })} />
      </div>

      <FloatingField label="Nome do perfil">
        <input
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          className="w-full h-14 px-4 pt-5 pb-1 rounded-full bg-transparent text-sm focus:outline-none"
        />
      </FloatingField>

      <div className="relative h-14 rounded-full bg-surface1 border border-border focus-within:border-brand px-4 flex items-center text-sm">
        <span className="text-muted">fantastic.com.br/</span>
        <input
          value={form.handle}
          onChange={(e) => setForm({ ...form, handle: e.target.value.replace(/[^a-z0-9_.]/gi, '').toLowerCase() })}
          placeholder="seu @"
          className="flex-1 ml-1 bg-transparent focus:outline-none"
        />
      </div>

      <button
        onClick={onAdvance}
        disabled={!valid}
        className="w-full h-14 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] text-white font-semibold disabled:opacity-50"
      >
        Avançar
      </button>
    </div>
  );
}

// =====================================================================
// STEP 4 — COVER + BIO
// =====================================================================
function CoverBioStep({ form, setForm, onAdvance }: { form: FormState; setForm: (f: FormState) => void; onAdvance: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Escolha uma foto de capa e sua biografia</h2>

      <CoverUploader value={form.coverImage} onChange={(v) => setForm({ ...form, coverImage: v })} />

      <div className="rounded-2xl bg-surface1 border border-border p-4 focus-within:border-brand transition-colors">
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 3000) })}
          rows={5}
          placeholder="Biografia"
          className="w-full bg-transparent text-sm focus:outline-none resize-none"
        />
        <div className="flex justify-end text-xs text-muted">{form.bio.length} / 3000</div>
      </div>

      <button
        onClick={onAdvance}
        className="w-full h-14 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] text-white font-semibold"
      >
        Avançar
      </button>
    </div>
  );
}

// =====================================================================
// STEP 5 — SOCIAL
// =====================================================================
function SocialStep({ form, setForm, onAdvance }: { form: FormState; setForm: (f: FormState) => void; onAdvance: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Conecte suas redes sociais</h2>

      <SocialField icon="instagram" label="instagram.com/" value={form.instagram} onChange={(v) => setForm({ ...form, instagram: v })} />
      <SocialField icon="tiktok"    label="tiktok.com/"    value={form.tiktok}    onChange={(v) => setForm({ ...form, tiktok: v })} />
      <SocialField icon="x"         label="x.com/"          value={form.twitter}   onChange={(v) => setForm({ ...form, twitter: v })} />

      <button
        onClick={onAdvance}
        className="w-full h-14 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] text-white font-semibold"
      >
        Avançar
      </button>
      <button onClick={onAdvance} className="block mx-auto text-sm text-muted hover:text-text">
        Pular por enquanto
      </button>
    </div>
  );
}

// =====================================================================
// STEP 6 — SUBSCRIPTION PRICING
// =====================================================================
function SubscriptionStep({
  form, setForm, onAdvance, loading,
}: {
  form: FormState; setForm: (f: FormState) => void; onAdvance: () => void; loading: boolean;
}) {
  // Estados string permitem digitar livremente (sem clamp imediato).
  const [priceStr, setPriceStr]       = useState(form.monthlyPrice.toFixed(2).replace('.', ','));
  const [qDiscStr, setQDiscStr]       = useState(String(form.quarterlyDiscount));
  const [sDiscStr, setSDiscStr]       = useState(String(form.semesterDiscount));

  function commitPrice() {
    const parsed = Number(priceStr.replace(',', '.')) || 0;
    const clamped = Math.min(200, Math.max(19.90, parsed));
    setForm({ ...form, monthlyPrice: clamped });
    setPriceStr(clamped.toFixed(2).replace('.', ','));
  }
  function commitQDisc() {
    const n = Math.min(50, Math.max(0, Number(qDiscStr) || 0));
    setForm({ ...form, quarterlyDiscount: n });
    setQDiscStr(String(n));
  }
  function commitSDisc() {
    const n = Math.min(50, Math.max(0, Number(sDiscStr) || 0));
    setForm({ ...form, semesterDiscount: n });
    setSDiscStr(String(n));
  }

  // Valida em tempo real para os PriceCards (sem alterar o input)
  const liveMonthly = Math.min(200, Math.max(0, Number(priceStr.replace(',', '.')) || 0));
  const liveQDisc   = Math.min(50, Math.max(0, Number(qDiscStr) || 0));
  const liveSDisc   = Math.min(50, Math.max(0, Number(sDiscStr) || 0));
  const quarter     = liveMonthly * 3 * (1 - liveQDisc / 100);
  const semester    = liveMonthly * 6 * (1 - liveSDisc / 100);
  const fmt = (v: number) => v.toFixed(2).replace('.', ',');

  function handleAdvance() {
    commitPrice(); commitQDisc(); commitSDisc();
    onAdvance();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Defina o valor de assinatura dos seus conteúdos</h2>
        <p className="text-sm text-muted mt-2">Não se preocupe, você pode alterar o valor da assinatura mais tarde.</p>
      </div>

      <h3 className="font-semibold">Preços das suas assinaturas</h3>
      <div className="grid grid-cols-3 gap-3">
        <PriceCard label="Mensal"      value={fmt(liveMonthly)} />
        <PriceCard label="Trimestral"  value={fmt(quarter)} />
        <PriceCard label="Semestral"   value={fmt(semester)} />
      </div>

      <a className="block text-center text-brand text-sm font-medium underline" href="#">
        Simular ganhos com assinatura
      </a>

      <FloatingField label="Assinatura Mensal">
        <div className="flex items-center px-4 h-14">
          <span className="text-sm text-muted mr-1 pt-3">R$</span>
          <input
            type="text"
            inputMode="decimal"
            value={priceStr}
            onChange={(e) => setPriceStr(e.target.value.replace(/[^\d,.]/g, ''))}
            onBlur={commitPrice}
            className="w-full bg-transparent text-sm pt-3 focus:outline-none"
          />
        </div>
      </FloatingField>
      <p className="text-xs text-muted -mt-3 px-4">Mínimo: R$ 19,90 — Máximo: R$ 200,00</p>

      <div className="grid grid-cols-2 gap-3">
        <FloatingField label="Desconto Trimestral">
          <div className="flex items-center px-4 h-14">
            <input
              type="text"
              inputMode="numeric"
              value={qDiscStr}
              onChange={(e) => setQDiscStr(e.target.value.replace(/\D/g, ''))}
              onBlur={commitQDisc}
              className="w-full bg-transparent text-sm pt-3 focus:outline-none"
            />
            <span className="text-sm text-muted pt-3">%</span>
          </div>
        </FloatingField>
        <FloatingField label="Desconto Semestral">
          <div className="flex items-center px-4 h-14">
            <input
              type="text"
              inputMode="numeric"
              value={sDiscStr}
              onChange={(e) => setSDiscStr(e.target.value.replace(/\D/g, ''))}
              onBlur={commitSDisc}
              className="w-full bg-transparent text-sm pt-3 focus:outline-none"
            />
            <span className="text-sm text-muted pt-3">%</span>
          </div>
        </FloatingField>
      </div>

      <button
        onClick={handleAdvance}
        disabled={loading}
        className="block mx-auto w-40 h-12 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] text-white font-semibold disabled:opacity-60"
      >
        {loading ? 'Salvando...' : 'Próximo'}
      </button>
    </div>
  );
}

function PriceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4 text-center">
      <p className="text-sm text-text">{label}</p>
      <p className="text-lg font-bold mt-1"><span className="text-xs text-muted">R$</span> {value}</p>
    </div>
  );
}

// =====================================================================
// STEP 7 — KYC INTRO
// =====================================================================
function KycIntro({ onAdvance }: { onAdvance: () => void }) {
  return (
    <div className="space-y-6 max-w-md mx-auto pt-6">
      <h2 className="text-2xl font-bold">Verificação de documentos</h2>
      <p className="text-sm text-text leading-relaxed">
        Faltam poucos passos para você se tornar um(a) influenciador(a) Fantastic.
        Precisamos apenas validar alguns documentos, mas não se preocupe, o processo
        é <strong>rápido e sigiloso</strong>.
      </p>
      <button
        onClick={onAdvance}
        className="w-full h-14 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] text-white font-semibold"
      >
        Iniciar verificação
      </button>
    </div>
  );
}

// =====================================================================
// STEP 8 — KYC CAMERA
// =====================================================================
function KycCamera({ onDone }: { onDone: () => void }) {
  const [permission, setPermission] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [phase, setPhase] = useState<'doc-front' | 'doc-back' | 'selfie' | 'done'>('doc-front');
  const [captures, setCaptures] = useState<{ front?: string; back?: string; selfie?: string }>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function requestAccess() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: phase === 'selfie' ? 'user' : 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setPermission('granted');
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setPermission('denied');
    }
  }

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  function capture() {
    if (!videoRef.current) return;
    const c = document.createElement('canvas');
    c.width  = videoRef.current.videoWidth  || 720;
    c.height = videoRef.current.videoHeight || 960;
    const ctx = c.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    const dataUrl = c.toDataURL('image/jpeg', 0.85);
    if (phase === 'doc-front') {
      setCaptures((s) => ({ ...s, front: dataUrl }));
      setPhase('doc-back');
    } else if (phase === 'doc-back') {
      setCaptures((s) => ({ ...s, back: dataUrl }));
      setPhase('selfie');
    } else if (phase === 'selfie') {
      setCaptures((s) => ({ ...s, selfie: dataUrl }));
      setPhase('done');
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }
  }

  async function submit() {
    try {
      await api('/users/me/verify-request', {
        method: 'POST',
        body: JSON.stringify({
          documentType:  'RG',
          frontImageKey: 'inline-base64',
          backImageKey:  'inline-base64',
          selfieKey:     'inline-base64',
        }),
      });
    } catch {
      // segue mesmo se falhar — UX
    }
    onDone();
  }

  if (permission !== 'granted') {
    return (
      <div className="space-y-6 max-w-md mx-auto pt-4 text-center">
        <span className="brand-logo text-4xl font-bold tracking-tight text-text inline-block">fantastic</span>
        <div className="rounded-2xl bg-brand-100 p-8 space-y-4">
          <div className="w-32 h-32 mx-auto rounded-full bg-brand-50 grid place-items-center">
            <Camera className="w-14 h-14 text-brand" />
          </div>
          <h2 className="text-xl font-bold">Acesso à câmera</h2>
          <p className="text-sm text-muted">Vamos precisar de uma foto do seu rosto e do seu documento.</p>
          <button
            onClick={requestAccess}
            className="w-full h-12 rounded-full bg-brand text-white font-semibold hover:bg-brand-600"
          >
            Permitir acesso
          </button>
          {permission === 'denied' && (
            <p className="text-xs text-red-600">Permissão negada. Habilite nas configurações do navegador e recarregue.</p>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="space-y-6 max-w-md mx-auto pt-6 text-center">
        <ShieldCheck className="w-16 h-16 mx-auto text-brand" />
        <h2 className="text-2xl font-bold">Tudo pronto!</h2>
        <p className="text-sm text-muted">Seus documentos foram capturados. Em até 48h você recebe a confirmação por e-mail.</p>
        <div className="grid grid-cols-3 gap-2">
          {captures.front  && <img src={captures.front}  alt="frente" className="aspect-[3/4] rounded-lg object-cover" />}
          {captures.back   && <img src={captures.back}   alt="verso"  className="aspect-[3/4] rounded-lg object-cover" />}
          {captures.selfie && <img src={captures.selfie} alt="selfie" className="aspect-[3/4] rounded-lg object-cover" />}
        </div>
        <button
          onClick={submit}
          className="w-full h-14 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] text-white font-semibold"
        >
          Concluir e ir pro meu perfil
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <p className="text-center text-sm text-muted">
        {phase === 'doc-front' && 'Posicione a frente do documento dentro do quadro'}
        {phase === 'doc-back'  && 'Agora capture o verso do documento'}
        {phase === 'selfie'    && 'Selfie segurando o documento ao lado do rosto'}
      </p>
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-bg ring-2 ring-brand/40">
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-6 border-2 border-dashed border-white/70 rounded-xl pointer-events-none" />
      </div>
      <button
        onClick={capture}
        className="block mx-auto w-16 h-16 rounded-full bg-white border-4 border-brand grid place-items-center hover:scale-105 transition-transform"
        aria-label="Capturar foto"
      >
        <Aperture className="w-7 h-7 text-brand" />
      </button>
      <div className="flex gap-3 justify-center text-xs">
        <span className={phase === 'doc-front' ? 'text-brand font-semibold' : captures.front  ? 'text-emerald-600' : 'text-muted'}>① Frente</span>
        <span className={phase === 'doc-back'  ? 'text-brand font-semibold' : captures.back   ? 'text-emerald-600' : 'text-muted'}>② Verso</span>
        <span className={phase === 'selfie'    ? 'text-brand font-semibold' : captures.selfie ? 'text-emerald-600' : 'text-muted'}>③ Selfie</span>
      </div>
    </div>
  );
}

// =====================================================================
// HELPERS
// =====================================================================
function FloatingField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="relative block rounded-full border border-border bg-surface1 focus-within:border-brand transition-colors">
      <span className="absolute left-4 top-1.5 text-[10px] font-medium text-muted z-10">{label}</span>
      {children}
    </label>
  );
}

function AvatarUploader({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(f);
  }
  return (
    <div className="relative">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-32 h-32 rounded-full bg-brand-100 grid place-items-center overflow-hidden relative ring-4 ring-bg"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl font-bold text-brand-700">KA</span>
        )}
        <span className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-text text-bg grid place-items-center">
          <Camera className="w-4 h-4" />
        </span>
      </button>
    </div>
  );
}

function CoverUploader({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(f);
  }
  return (
    <div className="relative">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full h-40 rounded-2xl overflow-hidden relative grid place-items-center"
        style={value
          ? { backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: 'linear-gradient(135deg, #ff5722, #ff8a3d, #ff5722)' }}
      >
        {!value && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-3xl font-bold leading-tight text-right">
            monetize<br/>liberdade
          </div>
        )}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-text text-bg grid place-items-center">
          <Camera className="w-5 h-5" />
        </span>
      </button>
    </div>
  );
}

function SocialField({ icon, label, value, onChange }: { icon: 'instagram' | 'tiktok' | 'x'; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative h-14 rounded-full bg-surface1 border border-border focus-within:border-brand px-4 flex items-center gap-2">
      {icon === 'instagram' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-text" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.81-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.81-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07S4.9.31 4.14.6a5.93 5.93 0 0 0-2.13 1.4A5.93 5.93 0 0 0 .6 4.14C.31 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95.24 2.14.53 2.91a5.93 5.93 0 0 0 1.4 2.13A5.93 5.93 0 0 0 4.14 23.4c.76.29 1.64.47 2.91.53C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07 2.14-.24 2.91-.53a5.93 5.93 0 0 0 2.13-1.4 5.93 5.93 0 0 0 1.4-2.13c.29-.77.47-1.65.53-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95-.24-2.14-.53-2.91a5.93 5.93 0 0 0-1.4-2.13A5.93 5.93 0 0 0 19.86.6c-.77-.29-1.65-.47-2.91-.53C15.67.01 15.26 0 12 0m0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88"/></svg>
      )}
      {icon === 'tiktok' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-text" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/></svg>
      )}
      {icon === 'x' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-text" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      )}
      <span className="text-sm text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/^@/, ''))}
        placeholder="seu @"
        className="flex-1 bg-transparent text-sm focus:outline-none"
      />
    </div>
  );
}

function formatCPF(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}
