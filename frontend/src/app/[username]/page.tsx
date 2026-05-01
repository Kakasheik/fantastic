'use client';
/**
 * /[username] — Página de perfil da criadora (estilo Privacy).
 * Cover + avatar circular + stats + bio + planos (Assinaturas/Promoções).
 */
import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Image as ImgIcon, Film, Lock, Heart, MoreVertical, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { formatBRL } from '@/lib/utils';
import { SubscriptionFlow } from '@/components/subscription/subscription-flow';

interface CreatorProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  profilePicture: string | null;
  coverImage: string | null;
  verified: boolean;
  socialLinks: { twitter?: string; tiktok?: string; instagram?: string } | null;
  stats: { photos: number; videos: number; locked: number; likes: number; subscribers: number };
  plans: Array<{
    id: string;
    name: string;
    intervalMonths: number;
    price: number;
    discountPercent: number;
    isPromo: boolean;
  }>;
  isSubscribed: boolean;
}

function fmtCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace('.0', '') + 'K';
  return String(n);
}

export default function CreatorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [showPromos, setShowPromos] = useState(true);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CreatorProfile['plans'][0] | null>(null);

  const { data, isLoading, error } = useQuery<CreatorProfile>({
    queryKey: ['creator', username],
    queryFn: () => api<CreatorProfile>(`/users/${username}`),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="h-72 rounded-2xl bg-surface2 animate-pulse" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center text-muted py-20">
        Criadora não encontrada.
      </div>
    );
  }

  const main = data.plans.find((p) => !p.isPromo) ?? data.plans[0];
  const promos = data.plans.filter((p) => p.isPromo);
  const bioLong = (data.bio?.length ?? 0) > 220;
  const bioVisible = bioExpanded || !bioLong ? data.bio : data.bio?.slice(0, 220) + '…';

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-12 protected">
      {/* Header com nome centralizado */}
      <header className="flex items-center justify-between py-2 mb-2">
        <div className="w-6" />
        <h1 className="font-semibold text-text">{data.displayName}</h1>
        <button className="w-11 h-11 grid place-items-center text-muted hover:text-text hover:bg-surface2 rounded-full" aria-label="Mais opções">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Card principal */}
      <article className="rounded-2xl bg-surface1 border border-border overflow-hidden animate-fade-in">
        {/* Cover */}
        <div className="relative h-44 bg-surface2" data-protected="true">
          {data.coverImage && (
            <Image src={data.coverImage} alt="" fill className="object-cover" priority sizes="700px" />
          )}
        </div>

        {/* Avatar + stats */}
        <div className="px-5 pt-3 pb-4 relative">
          <div className="absolute -top-12 left-5">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface1 bg-surface2 relative">
              {data.profilePicture && (
                <Image src={data.profilePicture} alt={data.displayName} fill className="object-cover" sizes="100px" />
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-end items-center gap-3 sm:gap-5 text-sm text-muted mt-1 pl-28 min-h-[2.5rem]">
            <Stat icon={ImgIcon} value={data.stats.photos} />
            <Stat icon={Film}    value={data.stats.videos} />
            <Stat icon={Lock}    value={data.stats.locked} />
            <Stat icon={Heart}   value={fmtCount(data.stats.likes)} />
          </div>

          {/* Display name + verificado */}
          <div className="mt-6 flex items-center gap-1.5">
            <h2 className="text-xl font-bold tracking-tight">{data.displayName}</h2>
            {data.verified && (
              <span className="inline-flex w-5 h-5 rounded-full bg-brand items-center justify-center text-white text-xs">✓</span>
            )}
          </div>
          <p className="text-sm text-muted">@{data.username}</p>

          {/* Bio */}
          {data.bio && (
            <div className="mt-3 text-sm leading-relaxed">
              <p className={bioExpanded ? 'whitespace-pre-wrap' : 'whitespace-pre-wrap'}>
                <span className="text-brand">@{data.username}</span> {bioVisible}
              </p>
              {bioLong && (
                <button
                  onClick={() => setBioExpanded((v) => !v)}
                  className="text-brand text-sm mt-1 font-medium"
                >
                  {bioExpanded ? 'Ler menos' : 'Ler mais'}
                </button>
              )}
            </div>
          )}

          {/* Social */}
          {data.socialLinks && (
            <div className="mt-4 flex items-center gap-2">
              {data.socialLinks.twitter && (
                <SocialIcon href={`https://x.com/${data.socialLinks.twitter}`} aria-label="X (Twitter)">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-text"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </SocialIcon>
              )}
              {data.socialLinks.tiktok && (
                <SocialIcon href={`https://tiktok.com/@${data.socialLinks.tiktok}`} aria-label="TikTok">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-text"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/></svg>
                </SocialIcon>
              )}
              {data.socialLinks.instagram && (
                <SocialIcon href={`https://instagram.com/${data.socialLinks.instagram}`} aria-label="Instagram">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-text"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.81-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.81-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07S4.9.31 4.14.6a5.93 5.93 0 0 0-2.13 1.4A5.93 5.93 0 0 0 .6 4.14C.31 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95.24 2.14.53 2.91a5.93 5.93 0 0 0 1.4 2.13A5.93 5.93 0 0 0 4.14 23.4c.76.29 1.64.47 2.91.53C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07 2.14-.24 2.91-.53a5.93 5.93 0 0 0 2.13-1.4 5.93 5.93 0 0 0 1.4-2.13c.29-.77.47-1.65.53-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95-.24-2.14-.53-2.91a5.93 5.93 0 0 0-1.4-2.13A5.93 5.93 0 0 0 19.86.6c-.77-.29-1.65-.47-2.91-.53C15.67.01 15.26 0 12 0m0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88"/></svg>
                </SocialIcon>
              )}
            </div>
          )}

          {/* Assinaturas */}
          {!data.isSubscribed && main && (
            <section className="mt-6">
              <h3 className="text-sm font-semibold text-text mb-2">Assinaturas</h3>
              <button
                onClick={() => setSelectedPlan(main)}
                className="w-full h-14 px-5 rounded-full bg-gradient-to-r from-[#ff8a3d] via-[#ff6b35] to-[#ffb380] text-white font-semibold flex items-center justify-between shadow-sm hover:opacity-95 transition-opacity"
              >
                <span>{main.name}</span>
                <span>{formatBRL(main.price)}</span>
              </button>
            </section>
          )}

          {data.isSubscribed && (
            <section className="mt-6">
              <div className="flex items-center justify-center gap-2 px-4 h-14 rounded-full bg-surface2 border border-border text-sm font-medium">
                <Check className="w-4 h-4 text-brand" /> Você assina @{data.username}
              </div>
            </section>
          )}

          {/* Promoções */}
          {!data.isSubscribed && promos.length > 0 && (
            <section className="mt-6">
              <button
                onClick={() => setShowPromos((v) => !v)}
                className="w-full flex items-center justify-between mb-2"
              >
                <h3 className="text-sm font-semibold text-text">Promoções</h3>
                {showPromos ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
              </button>

              {showPromos && (
                <div className="space-y-2 animate-fade-in">
                  {promos.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlan(p)}
                      className="w-full h-14 px-5 rounded-full bg-gradient-to-r from-[#ff9d5c] via-[#ffb380] to-[#ffd5b3] text-text font-semibold flex items-center justify-between hover:opacity-95 transition-opacity"
                    >
                      <span>{p.name} {p.discountPercent > 0 && <span className="font-normal text-text/80">({p.discountPercent}% off)</span>}</span>
                      <span>{formatBRL(p.price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </article>

      {/* Modal de cadastro/pagamento */}
      {selectedPlan && (
        <SubscriptionFlow
          creator={{
            id:             data.id,
            username:       data.username,
            displayName:    data.displayName,
            profilePicture: data.profilePicture,
            coverImage:     data.coverImage,
          }}
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}

function Stat({ icon: Icon, value }: { icon: React.ComponentType<{ className?: string }>; value: number | string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="w-4 h-4" />
      <span className="font-semibold text-text">{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</span>
    </span>
  );
}

function SocialIcon({ href, children, ...rest }: { href: string; children: React.ReactNode; 'aria-label': string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="w-9 h-9 rounded-full bg-surface2 grid place-items-center hover:bg-border transition-colors"
      {...rest}
    >
      {children}
    </Link>
  );
}
