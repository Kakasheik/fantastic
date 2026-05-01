'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mascot } from '@/components/ui/mascot';

const schema = z.object({
  email:    z.string().email('E-mail inválido'),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_.]+$/i, 'Use apenas letras, números, _ e .'),
  password: z.string()
    .min(12, 'Mínimo 12 caracteres')
    .regex(/[A-Z]/, 'Precisa de letra maiúscula')
    .regex(/[a-z]/, 'Precisa de letra minúscula')
    .regex(/\d/,    'Precisa de número')
    .regex(/[^\w\s]/, 'Precisa de símbolo'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  function onSubmit(values: FormData) {
    // Mock — em produção dispara KYC SumSub
    void values;
    router.push('/');
  }

  return (
    <div className="min-h-dvh grid place-items-center px-4 py-6">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6 items-stretch">
        <div className="bg-surface1 md:bg-transparent rounded-3xl p-6 md:p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <Link href="/" className="brand-logo block text-3xl font-bold tracking-tight mb-10 text-center">
              fantastic
            </Link>

            <h1 className="text-xl font-semibold mb-1 text-center">Criar conta</h1>
            <p className="text-sm text-muted text-center mb-8">
              Para acessar +18 confirmaremos sua identidade na próxima etapa.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <Field placeholder="E-mail" type="email" {...register('email')} error={errors.email?.message} />
              <Field placeholder="Nome de usuário" {...register('username')} error={errors.username?.message} />
              <Field placeholder="Senha (mín. 12 caracteres)" type="password" {...register('password')} error={errors.password?.message} />

              <Button type="submit" size="lg" variant="dark" className="w-full" disabled={isSubmitting}>
                Continuar
              </Button>
            </form>

            <p className="mt-6 text-xs text-muted text-center leading-relaxed">
              Ao continuar, você aceita os{' '}
              <Link href="/legal/terms" className="underline">Termos</Link>,{' '}
              a <Link href="/legal/privacy" className="underline">Política de Privacidade</Link> e
              a <Link href="/legal/content" className="underline">Política de Conteúdo</Link>.
              <br />
              Verificação de idade exigida pela <strong>Lei 15.211/2025</strong>.
            </p>

            <p className="mt-8 text-sm text-center text-muted">
              Já tem conta?{' '}
              <Link href="/login" className="text-brand font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden md:flex bg-brand-100 rounded-3xl p-12 items-end overflow-hidden relative">
          <div className="absolute inset-0 grid place-items-center">
            <Mascot className="w-80 h-80" />
          </div>
          <h2 className="relative text-4xl font-bold text-text">Sua plataforma.<br/>Suas regras.</h2>
        </div>
      </div>
    </div>
  );
}

const Field = (() => {
  const Component = ({
    placeholder, type = 'text', error, ...rest
  }: { placeholder: string; type?: string; error?: string } & Record<string, unknown>) => (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full h-14 px-5 rounded-full bg-surface2 border border-border text-base focus:outline-none focus:border-brand placeholder:text-muted"
        {...rest}
      />
      {error && <p className="px-5 mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
  Component.displayName = 'Field';
  return Component;
})();
