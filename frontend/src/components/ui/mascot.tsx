/**
 * Mascote Fantastic — forma orgânica amarela com dobra interna (estilo Privacy).
 */
export function Mascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 320" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mascot-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#FFD93D" />
          <stop offset="100%" stopColor="#FFA929" />
        </linearGradient>
        <linearGradient id="mascot-fold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#FFB347" />
          <stop offset="100%" stopColor="#F7931E" />
        </linearGradient>
      </defs>
      {/* Corpo principal — círculo com mordida */}
      <path
        d="M 160 30
           A 130 130 0 1 1 90 290
           L 160 160
           Z"
        fill="url(#mascot-grad)"
      />
      {/* Dobra interna */}
      <path
        d="M 160 160
           L 90 290
           A 130 130 0 0 0 250 230
           Z"
        fill="url(#mascot-fold)"
      />
      {/* Reflexo */}
      <ellipse cx="120" cy="100" rx="22" ry="14" fill="rgba(255,255,255,0.35)" transform="rotate(-25 120 100)" />
    </svg>
  );
}
