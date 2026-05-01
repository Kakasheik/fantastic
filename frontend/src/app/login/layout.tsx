/**
 * Layout dedicado às rotas de login/register: SEM header e bottom nav.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-bg">{children}</div>;
}
