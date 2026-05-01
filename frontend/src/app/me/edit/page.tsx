'use client';
/**
 * /me/edit — Editar perfil (nome, bio, foto, capa).
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { ChevronLeft, Camera, Loader2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { SessionGate } from '@/components/layout/session-gate';

interface Summary {
  username: string;
  nickname: string | null;
  bio: string | null;
  profilePicture: string | null;
  creatorProfile: { displayName: string; coverImage: string | null } | null;
}

interface FormData {
  displayName: string;
  bio: string;
  profilePicture: string;
  coverImage: string;
  nickname: string;
}

export default function EditProfilePage() {
  return <SessionGate><EditProfileForm /></SessionGate>;
}

function EditProfileForm() {
  const { data, isLoading, refetch } = useQuery<Summary>({
    queryKey: ['me-summary'],
    queryFn: () => api<Summary>('/users/me/summary'),
  });

  const [savedFlash, setSavedFlash] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { isSubmitting, errors } } = useForm<FormData>();

  useEffect(() => {
    if (data) {
      reset({
        displayName:    data.creatorProfile?.displayName ?? data.nickname ?? data.username,
        bio:            data.bio ?? '',
        profilePicture: data.profilePicture ?? '',
        coverImage:     data.creatorProfile?.coverImage ?? '',
        nickname:       data.nickname ?? '',
      });
    }
  }, [data, reset]);

  const update = useMutation({
    mutationFn: (values: FormData) => api('/users/me/edit', {
      method: 'PATCH',
      body: JSON.stringify(values),
    }),
    onSuccess: () => {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
      refetch();
    },
  });

  const previewAvatar = watch('profilePicture');
  const previewCover  = watch('coverImage');

  if (isLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-6"><div className="h-64 bg-surface1 rounded-2xl animate-pulse" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/me" className="p-2 -m-2 hover:bg-surface2 rounded-full"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold">Editar perfil</h1>
      </header>

      <form onSubmit={handleSubmit((v) => update.mutate(v))} className="space-y-4">
        {/* Cover preview */}
        <div className="rounded-2xl bg-surface1 border border-border overflow-hidden">
          <div
            className="relative h-32 bg-surface2 grid place-items-center text-muted text-sm"
            style={previewCover ? { backgroundImage: `url(${previewCover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            {!previewCover && <Camera className="w-6 h-6" />}
          </div>
          <div className="p-4">
            <label className="block text-sm font-medium mb-1">URL da imagem de capa</label>
            <input
              {...register('coverImage')}
              placeholder="https://..."
              className="w-full h-11 px-4 rounded-full bg-surface2 border border-border text-sm focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* Avatar preview */}
        <div className="rounded-2xl bg-surface1 border border-border p-4 flex items-center gap-4">
          <Avatar src={previewAvatar || data?.profilePicture || null} alt={data?.username ?? '?'} size="lg" />
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">URL da foto de perfil</label>
            <input
              {...register('profilePicture')}
              placeholder="https://..."
              className="w-full h-11 px-4 rounded-full bg-surface2 border border-border text-sm focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* Campos */}
        <Field label="Nome de exibição" {...register('displayName', { maxLength: 80 })} error={errors.displayName?.message} />
        <Field label="Apelido (privado)" {...register('nickname', { maxLength: 60 })} error={errors.nickname?.message} />

        <div>
          <label className="block text-sm font-medium mb-1 px-1">Bio</label>
          <textarea
            {...register('bio', { maxLength: 280 })}
            rows={4}
            className="w-full px-4 py-3 rounded-2xl bg-surface1 border border-border text-sm focus:outline-none focus:border-brand resize-none"
            placeholder="Conte um pouco sobre você..."
          />
          <p className="text-xs text-muted mt-1 px-1">{(watch('bio')?.length ?? 0)}/280</p>
        </div>

        {/* Save bar */}
        <div className="sticky bottom-20 md:bottom-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || update.isPending}
            className="w-full h-12 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] text-white font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {update.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {update.isPending ? 'Salvando...' : savedFlash ? '✓ Salvo!' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Field = (() => {
  const Comp = ({ label, error, ...rest }: FieldProps) => (
    <div>
      <label className="block text-sm font-medium mb-1 px-1">{label}</label>
      <input
        {...rest}
        className="w-full h-11 px-4 rounded-full bg-surface1 border border-border text-sm focus:outline-none focus:border-brand"
      />
      {error && <span className="text-xs text-red-500 mt-0.5 ml-3">{error}</span>}
    </div>
  );
  Comp.displayName = 'Field';
  return Comp;
})();
