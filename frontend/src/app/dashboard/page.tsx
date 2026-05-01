'use client';
/**
 * /dashboard — Painel do Criador.
 */
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, Eye, DollarSign, Plus } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatBRL, formatRelative } from '@/lib/utils';
import { EarningsChart } from '@/components/dashboard/earnings-chart';

interface DashboardData {
  monthEarnings: number;
  monthEarningsDelta: number;
  newSubscribers: number;
  totalViews: number;
  totalEarnings: number;
  earningsByDay: Array<{ date: string; earnings: number }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: string;
    netAmount: string;
    payerUsername: string | null;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api<DashboardData>('/creators/dashboard'),
  });

  if (isLoading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface1 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <Link href="/dashboard/new-post">
          <Button><Plus className="w-4 h-4" /> Novo Post</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Ganhos do mês" value={formatBRL(data.monthEarnings)} delta={data.monthEarningsDelta} icon={DollarSign} />
        <MetricCard label="Novos assinantes" value={data.newSubscribers.toLocaleString('pt-BR')} icon={Users} />
        <MetricCard label="Visualizações" value={data.totalViews.toLocaleString('pt-BR')} icon={Eye} />
        <MetricCard label="Total acumulado" value={formatBRL(data.totalEarnings)} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Ganhos — últimos 30 dias</h2>
        </CardHeader>
        <CardContent>
          <EarningsChart data={data.earningsByDay} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Últimas transações</h2>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="text-muted">
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium">Tipo</th>
                <th className="text-left p-3 font-medium">De</th>
                <th className="text-right p-3 font-medium">Bruto</th>
                <th className="text-right p-3 font-medium">Líquido</th>
                <th className="text-right p-3 font-medium">Quando</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="p-3"><span className="px-2 py-1 rounded bg-surface2 text-xs">{t.type}</span></td>
                  <td className="p-3">{t.payerUsername ? `@${t.payerUsername}` : '—'}</td>
                  <td className="p-3 text-right">{formatBRL(t.amount)}</td>
                  <td className="p-3 text-right text-emerald-400 font-medium">{formatBRL(t.netAmount)}</td>
                  <td className="p-3 text-right text-muted">{formatRelative(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label, value, delta, icon: Icon,
}: { label: string; value: string; delta?: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">{label}</span>
          <Icon className="w-4 h-4 text-muted" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {typeof delta === 'number' && (
          <div className={`text-xs ${delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}% vs mês anterior
          </div>
        )}
      </CardContent>
    </Card>
  );
}
