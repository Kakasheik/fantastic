/**
 * RootLayout — tema claro, sem sidebar.
 * Header fixo no topo + bottom-nav fixo no rodapé (estilo Privacy).
 */
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { QueryProvider } from '@/components/providers/query-provider';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Fantastic — Conteúdo exclusivo de criadores',
  description: 'Plataforma +18 para criadores e fãs.',
  applicationName: 'Fantastic',
  robots: { index: false, follow: false },
  other: { Rating: 'RTA-5042-1996-1400-1577-RTA' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f7f3ec',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className="bg-bg text-text antialiased min-h-dvh">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <QueryProvider>
            <div className="flex flex-col min-h-dvh">
              <Header />
              <main className="flex-1 pb-20">
                {children}
              </main>
              <BottomNav />
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
