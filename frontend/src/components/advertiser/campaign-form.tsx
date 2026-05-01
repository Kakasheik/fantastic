'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

const schema = z.object({
  name:        z.string().min(3).max(120),
  budget:      z.coerce.number().positive(),
  bidCpm:      z.coerce.number().min(0.05),
  startDate:   z.string(),
  endDate:     z.string(),
  creativeType: z.enum(['BANNER_728x90', 'BANNER_300x250', 'BANNER_160x600', 'NATIVE', 'POPUNDER']),
  creativeUrl:    z.string().url(),
  destinationUrl: z.string().url(),
  countries: z.string().optional(),
  devices:   z.array(z.enum(['DESKTOP', 'MOBILE', 'TABLET'])).optional(),
});

type FormData = z.infer<typeof schema>;

export function CampaignForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { creativeType: 'BANNER_300x250', bidCpm: 0.5 },
  });

  async function onSubmit(values: FormData) {
    await api('/ads/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        ...values,
        targetingRules: {
          countries: values.countries?.split(',').map((s) => s.trim()).filter(Boolean),
          devices:   values.devices,
        },
      }),
    });
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="bg-surface1 rounded-xl border border-border w-full max-w-2xl max-h-[90dvh] overflow-y-auto">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-lg">Nova campanha</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface2 rounded"><X className="w-5 h-5" /></button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <Field label="Nome da campanha" error={errors.name?.message}>
            <input {...register('name')} className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Orçamento total (R$)" error={errors.budget?.message}>
              <input type="number" step="0.01" {...register('budget')} className={inputCls} />
            </Field>
            <Field label="Lance CPM (R$)" error={errors.bidCpm?.message}>
              <input type="number" step="0.05" {...register('bidCpm')} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Início" error={errors.startDate?.message}>
              <input type="date" {...register('startDate')} className={inputCls} />
            </Field>
            <Field label="Fim" error={errors.endDate?.message}>
              <input type="date" {...register('endDate')} className={inputCls} />
            </Field>
          </div>

          <Field label="Tipo de anúncio" error={errors.creativeType?.message}>
            <select {...register('creativeType')} className={inputCls}>
              <option value="BANNER_728x90">Banner 728×90 (Leaderboard)</option>
              <option value="BANNER_300x250">Banner 300×250 (Medium)</option>
              <option value="BANNER_160x600">Banner 160×600 (Skyscraper)</option>
              <option value="NATIVE">Native</option>
              <option value="POPUNDER">Pop-under</option>
            </select>
          </Field>

          <Field label="URL do criativo (imagem hospedada)" error={errors.creativeUrl?.message}>
            <input type="url" placeholder="https://..." {...register('creativeUrl')} className={inputCls} />
          </Field>

          <Field label="URL de destino (clique)" error={errors.destinationUrl?.message}>
            <input type="url" placeholder="https://..." {...register('destinationUrl')} className={inputCls} />
          </Field>

          <Field label="Países (ISO-2, separados por vírgula)" error={errors.countries?.message}>
            <input placeholder="BR, PT, US" {...register('countries')} className={inputCls} />
          </Field>

          <Field label="Dispositivos">
            <div className="flex gap-3">
              {(['DESKTOP', 'MOBILE', 'TABLET'] as const).map((d) => (
                <label key={d} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" value={d} {...register('devices')} /> {d}
                </label>
              ))}
            </div>
          </Field>

          <footer className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar campanha'}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  'w-full h-10 px-3 rounded-lg bg-surface2 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-muted">{label}</span>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  );
}
