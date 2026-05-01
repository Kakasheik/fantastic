'use client';
/**
 * /em-alta — Top creators + ofertas. Consome /users/top e /users/offers.
 */
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

interface TopCreator {
  id: string;
  username: string;
  displayName: string;
  profilePicture: string | null;
  coverImage: string | null;
  verified: boolean;
  monthlyPrice: number;
  subscribers: number;
}

interface OfferCreator extends TopCreator {
  promo: { discount: number; original: number; promo: number; months: number } | null;
}

export default function EmAltaPage() {
  const { data: top } = useQuery<TopCreator[]>({
    queryKey: ['top-creators'],
    queryFn: () => api<TopCreator[]>('/users/top?limit=6'),
  });
  const { data: offers } = useQuery<OfferCreator[]>({
    queryKey: ['offers'],
    queryFn: () => api<OfferCreator[]>('/users/offers?limit=12'),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12">
      <section className="relative h-56 md:h-64 rounded-2xl overflow-hidden mt-4">
        {top?.[0]?.coverImage && (
          <Image src={top[0].coverImage} alt="" fill className="object-cover" priority sizes="100vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-end p-6 md:p-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Em alta.</h1>
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader title="Top creators" />
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {top?.map((c, idx) => (
            <Link
              key={c.id}
              href={`/${c.username}`}
              className="relative flex-shrink-0 w-44 h-60 rounded-2xl overflow-hidden group"
            >
              {c.profilePicture && (
                <Image src={c.profilePicture} alt={c.displayName} fill className="object-cover transition-transform group-hover:scale-105" sizes="200px" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <span className="absolute top-3 left-3 text-6xl font-black text-white/95 leading-none drop-shadow">
                {idx + 1}
              </span>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="flex items-center gap-1 font-bold truncate">
                  {c.displayName}
                  {c.verified && (
                    <span className="inline-block w-4 h-4 rounded-full bg-brand grid place-items-center text-[9px]">✓</span>
                  )}
                </div>
                <p className="text-xs opacity-80 truncate">@{c.username}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader title="Ofertas de assinatura" icon={<Sparkles className="w-4 h-4 text-brand" />} />
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {offers?.map((c) => (
            <Link
              key={c.id}
              href={`/${c.username}`}
              className="relative flex-shrink-0 w-40 h-52 rounded-2xl overflow-hidden group"
            >
              {c.profilePicture && (
                <Image src={c.profilePicture} alt={c.displayName} fill className="object-cover transition-transform group-hover:scale-105" sizes="200px" />
              )}
              {c.promo && (
                <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-red-600 text-white text-xs font-bold">
                  {c.promo.discount}% OFF
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-white text-xs">
                <div className="font-bold truncate">{c.displayName}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader title="Categorias" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Fitness', 'Lifestyle', 'Modelo', 'Música', 'Beleza', 'Travel', 'Cosplay', 'Bastidores'].map((cat) => (
            <button key={cat} className="px-4 py-3 rounded-xl bg-surface1 border border-border text-sm font-medium hover:border-brand hover:text-brand transition-colors">
              {cat}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-text flex items-center gap-2">
        {icon} {title}
      </h2>
      <button className="p-1 text-muted hover:text-text">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
