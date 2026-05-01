'use client';
/**
 * /me — Visão do próprio perfil (idêntica à do Privacy).
 * Mostra cover + avatar + username + tabs (Postagens / Mídias) + 3-dot menu.
 */
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, MoreVertical, CalendarDays, Archive, Settings as SettingsIcon, ShieldCheck, Smartphone, Film } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { SessionGate } from '@/components/layout/session-gate';

interface Summary {
  id: string;
  email: string;
  username: string;
  role: string;
  fullName: string | null;
  nickname: string | null;
  bio: string | null;
  profilePicture: string | null;
  isVerified: boolean;
  isAgeVerified: boolean;
  walletBalance: number;
  creatorProfile: {
    id: string;
    displayName: string;
    coverImage: string | null;
    totalSubscribers: number;
    totalLikes: number;
  } | null;
  stats: { posts: number; medias: number };
}

interface OwnPosts {
  items: Array<{
    id: string;
    type: string;
    caption: string | null;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    isLocked: boolean;
    publishedAt: string | null;
    likeCount: number;
  }>;
}

export default function MePage() {
  return <SessionGate><MeView /></SessionGate>;
}

function MeView() {
  const [tab, setTab] = useState<'posts' | 'media'>('posts');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: me } = useQuery<Summary>({ queryKey: ['me-summary'], queryFn: () => api<Summary>('/users/me/summary') });
  const { data: posts } = useQuery<OwnPosts>({
    queryKey: ['me-posts', tab],
    queryFn: () => api<OwnPosts>(`/users/me/posts?status=published&type=${tab === 'posts' ? 'post' : 'media'}`),
    enabled: !!me,
  });

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const username = me?.username ?? '...';
  const displayName = me?.creatorProfile?.displayName ?? me?.nickname ?? username;
  const itemsToShow = posts?.items.filter((p) => tab === 'media' ? p.type !== 'PHOTO' && p.type !== 'TEXT' : true) ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-3 pb-12 protected">
      {/* Header centralizado com back e 3-dot */}
      <header className="flex items-center justify-between mb-3 relative">
        <Link href="/profile" className="p-2 -m-2 hover:bg-surface2 rounded-full" aria-label="Voltar">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-semibold text-text">Meu perfil</h1>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 -m-2 hover:bg-surface2 rounded-full"
            aria-label="Mais opções"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 w-56 rounded-xl bg-surface1 border border-border shadow-lg overflow-hidden z-20 animate-fade-in">
              <MenuItem href="/me/scheduled"  icon={CalendarDays}>Posts agendados</MenuItem>
              <MenuItem href="/me/archived"   icon={Archive}>Arquivados</MenuItem>
              <MenuItem href="/me/edit"       icon={SettingsIcon}>Editar perfil</MenuItem>
              <MenuItem href="/me/verify"     icon={ShieldCheck}>Solicitar verificação</MenuItem>
            </div>
          )}
        </div>
      </header>

      {/* Card do perfil */}
      <article className="rounded-2xl bg-surface1 border border-border overflow-hidden">
        {/* Cover */}
        <div className="relative h-32 bg-surface2 overflow-hidden">
          {me?.creatorProfile?.coverImage ? (
            <Image src={me.creatorProfile.coverImage} alt="" fill className="object-cover" sizes="700px" />
          ) : (
            <CoverPattern />
          )}
        </div>

        {/* Avatar + nome */}
        <div className="px-5 pb-5 -mt-10 relative">
          <Avatar
            src={me?.profilePicture ?? null}
            alt={username}
            size="xl"
            className="ring-4 ring-surface1 rounded-full"
            online={true}
            verified={me?.isVerified}
          />

          <h2 className="mt-3 text-xl font-bold">{displayName}</h2>
          {me?.nickname && me.nickname !== displayName && (
            <p className="text-sm text-muted">@{username}</p>
          )}
          {me?.bio && <p className="mt-2 text-sm text-text leading-relaxed">{me.bio}</p>}

          <Link
            href="/me/edit"
            className="mt-4 block w-full h-12 rounded-full bg-surface2 hover:bg-border text-text font-semibold text-sm grid place-items-center transition-colors"
          >
            Editar perfil
          </Link>
        </div>
      </article>

      {/* Tabs */}
      <div className="mt-4 rounded-2xl bg-surface1 border border-border overflow-hidden">
        <div className="grid grid-cols-2 border-b border-border">
          <Tab active={tab === 'posts'} onClick={() => setTab('posts')} icon={Smartphone} label={`${me?.stats.posts ?? 0} Postagens`} />
          <Tab active={tab === 'media'} onClick={() => setTab('media')} icon={Film}      label={`${me?.stats.medias ?? 0} Mídias`} />
        </div>

        <div className="p-4">
          {itemsToShow.length === 0 ? (
            <p className="text-center text-muted text-sm py-12">Nenhum resultado encontrado</p>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {itemsToShow.map((p) => (
                <div key={p.id} className="aspect-square bg-surface2 rounded-md overflow-hidden relative">
                  {p.thumbnailUrl && <Image src={p.thumbnailUrl} alt={p.caption ?? ''} fill className="object-cover" sizes="200px" />}
                  {p.isLocked && (
                    <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-md">
                      <span className="text-white text-xs font-semibold">PPV</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuItem({ href, icon: Icon, children }: { href: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-surface2 transition-colors">
      <Icon className="w-4 h-4 text-muted" /> {children}
    </Link>
  );
}

function Tab({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-12 flex items-center justify-center gap-2 text-sm font-semibold transition-colors relative',
        active ? 'text-brand' : 'text-muted hover:text-text',
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />}
    </button>
  );
}

/** Padrão visual de cover quando o usuário ainda não enviou um. */
function CoverPattern() {
  return (
    <div className="absolute inset-0 bg-brand-100 grid grid-cols-12 gap-1 p-2 opacity-60">
      {Array.from({ length: 60 }).map((_, i) => (
        <span key={i} className="text-brand text-2xl font-extrabold opacity-40 select-none">
          f
        </span>
      ))}
    </div>
  );
}
