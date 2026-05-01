import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-60 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:    'bg-brand text-white hover:bg-brand-600',
        secondary:  'bg-surface1 text-text border border-border hover:bg-surface2',
        outline:    'border border-text/15 bg-transparent text-text hover:bg-surface2',
        ghost:      'text-text hover:bg-surface2',
        destructive:'bg-red-600 text-white hover:bg-red-700',
        dark:       'bg-text text-bg hover:bg-text/85',
      },
      size: {
        sm:   'h-9 px-4',
        md:   'h-11 px-5',
        lg:   'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';
