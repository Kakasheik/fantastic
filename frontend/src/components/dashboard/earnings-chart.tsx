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
              <stop offset="0%"   stopColor="#ff8a3d" />
              <stop offset="100%" stopColor="#ff5722" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#ece6da" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="#8b8b8b"
            tickFormatter={(d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          />
          <YAxis stroke="#8b8b8b" tickFormatter={(v: number) => formatBRL(v)} width={80} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #ece6da', borderRadius: 12, color: '#111111' }}
            formatter={(v: number) => [formatBRL(v), 'Ganhos']}
            labelFormatter={(l: string) => new Date(l).toLocaleDateString('pt-BR')}
            labelStyle={{ color: '#8b8b8b' }}
          />
          <Line type="monotone" dataKey="earnings" stroke="url(#earnGradient)" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
