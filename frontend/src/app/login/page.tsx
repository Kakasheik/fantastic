'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mascot } from '@/components/ui/mascot';

const schema = z.object({
  email:    z.string().min(1, 'Informe seu e-mail ou CPF'),
  password: z.string().min(1, 'Informe sua senha'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  function onSubmit(values: FormData) {
    // Mock: sem backend, segue para o feed
    void values;
    router.push('/');
  }

  return (
    <div className="min-h-dvh grid place-items-center px-4 py-6">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6 items-stretch">
        {/* Coluna do formulário */}
        <div className="bg-surface1 md:bg-transparent rounded-3xl p-6 md:p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <Link href="/" className="brand-logo block text-3xl font-bold tracking-tight mb-12 text-center">
              fantastic
            </Link>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="E-mail/CPF"
                  autoComplete="email"
                  {...register('email')}
                  className="w-full h-14 px-5 rounded-full bg-surface2 border border-border text-base focus:outline-none focus:border-brand placeholder:text-muted"
                />
                {errors.email && <p className="px-5 mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Senha"
                  autoComplete="current-password"
                  {...register('password')}
                  className="w-full h-14 px-5 rounded-full bg-surface2 border border-border text-base focus:outline-none focus:border-brand placeholder:text-muted"
                />
                {errors.password && <p className="px-5 mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-brand hover:underline">
                  Esqueceu sua senha?
                </Link>
              </div>

              <Button type="submit" size="lg" variant="dark" className="w-full">
                Entrar
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-muted">
              <span className="flex-1 h-px bg-border" />
              ou entrar com
              <span className="flex-1 h-px bg-border" />
            </div>

            <div className="flex items-center justify-center gap-4">
              <SocialButton label="Google">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.62 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.7 3.97 14.55 3 12 3 6.95 3 2.85 7.07 2.85 12.05S6.95 21.1 12 21.1c6.92 0 9.5-4.85 9.5-9.05 0-.61-.07-1.07-.15-1.95z"/>
                </svg>
              </SocialButton>
              <SocialButton label="X (Twitter)">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-text">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </SocialButton>
              <SocialButton label="Apple">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-text">
                  <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12-1.16.46-2.31 1.13-3.08.74-.85 2.05-1.50 3.034-1.57zM20.5 17.27c-.534 1.21-.794 1.76-1.487 2.83-.967 1.5-2.33 3.36-4.02 3.37-1.5.01-1.886-.97-3.92-.96-2.034.01-2.46.97-3.96.96-1.69-.02-2.98-1.71-3.95-3.21-2.71-4.21-2.99-9.16-1.32-11.78 1.18-1.86 3.05-2.95 4.81-2.95 1.79 0 2.92.97 4.4.97 1.43 0 2.31-.97 4.39-.97 1.57 0 3.24.85 4.43 2.32-3.89 2.13-3.26 7.69 1.17 9.43z"/>
                </svg>
              </SocialButton>
            </div>

            <p className="mt-8 text-sm text-center text-muted">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-brand font-semibold hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>

        {/* Coluna do mascote */}
        <div className="hidden md:flex bg-brand-100 rounded-3xl p-12 items-end overflow-hidden relative">
          <div className="absolute inset-0 grid place-items-center">
            <Mascot className="w-80 h-80" />
          </div>
          <h2 className="relative text-4xl font-bold text-text">Monetize, do seu jeito!</h2>
        </div>
      </div>
    </div>
  );
}

function SocialButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      aria-label={`Entrar com ${label}`}
      className="w-12 h-12 rounded-full bg-surface1 border border-border grid place-items-center hover:bg-surface2 transition-colors"
    >
      {children}
    </button>
  );
}
