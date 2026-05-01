'use client';
/**
 * /advertiser/campaigns — listagem + criação de campanhas.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CampaignForm } from '@/components/advertiser/campaign-form';
import { api } from '@/lib/api';
import { formatBRL } from '@/lib/utils';

interface Campaign {
  id: string;
  name: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PAUSED' | 'FINISHED' | 'REJECTED';
  budget: string;
  spent: string;
  impressions: number;
  clicks: number;
  ctr: number;
  startDate: string;
  endDate: string;
}

export default function CampaignsPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const { data, refetch } = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: () => api<Campaign[]>('/ads/campaigns'),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Campanhas</h1>
          <p className="text-muted text-sm mt-1">Targeting preciso e inventário premium para o público +18.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}><Plus className="w-4 h-4" /> Nova campanha</Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted">
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Orçamento</th>
                <th className="text-right p-3 font-medium">Gasto</th>
                <th className="text-right p-3 font-medium">Impressões</th>
                <th className="text-right p-3 font-medium">CTR</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3"><StatusBadge status={c.status} /></td>
                  <td className="p-3 text-right">{formatBRL(c.budget)}</td>
                  <td className="p-3 text-right">{formatBRL(c.spent)}</td>
                  <td className="p-3 text-right">{c.impressions.toLocaleString('pt-BR')}</td>
                  <td className="p-3 text-right">{c.ctr.toFixed(2)}%</td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-muted">Você ainda não tem campanhas.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {isFormOpen && (
        <CampaignForm onClose={() => setFormOpen(false)} onCreated={() => { setFormOpen(false); refetch(); }} />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Campaign['status'] }) {
  const map = {
    DRAFT:           { label: 'Rascunho',     cls: 'bg-zinc-500/20 text-zinc-300' },
    PENDING_REVIEW:  { label: 'Em análise',   cls: 'bg-amber-500/20 text-amber-300' },
    ACTIVE:          { label: 'Ativa',        cls: 'bg-emerald-500/20 text-emerald-300' },
    PAUSED:          { label: 'Pausada',      cls: 'bg-zinc-500/20 text-zinc-300' },
    FINISHED:        { label: 'Finalizada',   cls: 'bg-blue-500/20 text-blue-300' },
    REJECTED:        { label: 'Rejeitada',    cls: 'bg-red-500/20 text-red-300' },
  };
  const m = map[status];
  return <span className={`px-2 py-1 rounded text-xs ${m.cls}`}>{m.label}</span>;
}
