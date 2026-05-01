'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatBRL } from '@/lib/utils';

export function EarningsChart({ data }: { data: Array<{ date: string; earnings: number }> }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id="earnGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="#a1a1aa"
            tickFormatter={(d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          />
          <YAxis stroke="#a1a1aa" tickFormatter={(v: number) => formatBRL(v)} width={80} />
          <Tooltip
            contentStyle={{ backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 8 }}
            formatter={(v: number) => [formatBRL(v), 'Ganhos']}
            labelFormatter={(l: string) => new Date(l).toLocaleDateString('pt-BR')}
          />
          <Line type="monotone" dataKey="earnings" stroke="url(#earnGradient)" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
