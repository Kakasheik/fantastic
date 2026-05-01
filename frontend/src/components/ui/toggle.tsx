'use client';
import { cn } from '@/lib/utils';

/**
 * Toggle pílula — animação ALINHADA dentro do botão (fix do bug Privacy-like).
 *
 * Dimensões: container 44×24, knob 20×20, padding interno 2px.
 * Knob varia de translate-x-0 (off) a translate-x-5 (20px), sempre dentro do limite.
 */
export function Toggle({
  on,
  onChange,
  ariaLabel,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={() => onChange(!on)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full p-0.5 transition-colors',
        on ? 'bg-brand' : 'bg-border',
      )}
    >
      <span
        className={cn(
          'block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform',
          on ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}
