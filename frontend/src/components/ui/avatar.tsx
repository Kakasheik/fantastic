import { cn } from '@/lib/utils';
import Image from 'next/image';

interface AvatarProps {
  src?:   string | null;
  alt:    string;
  size?:  'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  verified?: boolean;
  online?: boolean;
}

const sizes = {
  sm:  'w-9 h-9 text-xs',
  md:  'w-12 h-12 text-sm',
  lg:  'w-20 h-20 text-2xl',
  xl:  'w-24 h-24 text-2xl',
  '2xl': 'w-32 h-32 text-3xl',
};

const dotSize = {
  sm:  'w-2.5 h-2.5',
  md:  'w-3 h-3',
  lg:  'w-4 h-4',
  xl:  'w-4 h-4',
  '2xl': 'w-5 h-5',
};

export function Avatar({ src, alt, size = 'md', className, verified = false, online = false }: AvatarProps) {
  const initials = alt.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || '··';
  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden grid place-items-center bg-brand-100 text-brand-700 font-semibold border border-border',
          sizes[size],
        )}
      >
        {src ? (
          <Image src={src} alt={alt} width={256} height={256} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand grid place-items-center text-white text-[9px] border-2 border-bg">
          ✓
        </span>
      )}
      {online && (
        <span
          className={cn(
            'absolute bottom-0.5 right-0.5 rounded-full bg-emerald-500 ring-2 ring-surface1',
            dotSize[size],
          )}
          aria-label="Online"
        />
      )}
    </div>
  );
}
