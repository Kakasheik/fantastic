'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { api } from '@/lib/api';

const schema = z.object({
  nickname:    z.string().min(2, 'Campo obrigatório').max(60),
  phone:       z.string().min(10, 'Campo obrigatório'),
  cpf:         z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'Campo obrigatório'),
  email:       z.string().email('E-mail inválido'),
  fullName:    z.string().min(3, 'Campo obrigatório').max(120),
  dateOfBirth: z.string().min(1, 'Campo obrigatório'),
});

type FormData = z.infer<typeof schema>;

export function CompleteProfileStep({ onContinue }: { onContinue: () => void }) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormData) {
    setSubmitError(null);
    try {
      await api('/auth/complete-profile', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      onContinue();
    } catch (err) {
      console.error(err);
      setSubmitError('Não foi possível salvar seus dados. Verifique e tente novamente.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <p className="text-xs text-muted text-center mb-1">
        É necessário concluir o cadastro antes de efetuar uma compra.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <Field placeholder="Apelido" {...register('nickname')} error={errors.nickname?.message} />
        <Field placeholder="Celular" {...register('phone')} error={errors.phone?.message} />
        <Field placeholder="CPF" {...register('cpf')} error={errors.cpf?.message} />
        <Field placeholder="E-mail" type="email" {...register('email')} error={errors.email?.message} />
        <Field placeholder="Nome Completo" {...register('fullName')} error={errors.fullName?.message} containerClass="col-span-2 md:col-span-1" />
        <Field placeholder="Data de Nascimento" type="date" {...register('dateOfBirth')} error={errors.dateOfBirth?.message} containerClass="col-span-2 md:col-span-1" />
      </div>

      {submitError && (
        <p className="text-xs text-red-600 text-center">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 mt-3 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] text-white font-semibold disabled:opacity-60"
      >
        {isSubmitting ? 'Salvando...' : 'Finalizar cadastro'}
      </button>
    </form>
  );
}

interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  placeholder: string;
  error?: string;
  containerClass?: string;
}

const Field = (() => {
  const Component = ({ placeholder, error, containerClass = '', ...rest }: FieldProps) => (
    <div className={`flex flex-col ${containerClass}`}>
      <label className={`relative block rounded-full border ${error ? 'border-red-500' : 'border-brand-100'} bg-brand-50/50 focus-within:border-brand transition-colors`}>
        <span className={`absolute left-4 top-1.5 text-[10px] font-medium ${error ? 'text-red-500' : 'text-muted'}`}>{placeholder}</span>
        <input
          {...rest}
          placeholder=""
          className="w-full h-14 px-4 pt-5 pb-1 rounded-full bg-transparent text-sm focus:outline-none"
        />
      </label>
      {error && <span className="text-[11px] text-red-500 mt-0.5 ml-3">{error}</span>}
    </div>
  );
  Component.displayName = 'Field';
  return Component;
})();
