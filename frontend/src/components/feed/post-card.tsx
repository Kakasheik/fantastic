'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, MoreHorizontal, Send, Bookmark, Lock } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatBRL, formatRelative, cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { SubscriptionFlow } from '@/components/subscription/subscription-flow';

export interface FeedPost {
  id: string;
  type: string;
  caption: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  isLocked: boolean;
  ppvPrice: number | null;
  publishedAt: string | null;
  likeCount: number;
  commentCount: number;
  creator: {
    id: string;
    username: string;
    displayName: string;
    profilePicture: string | null;
    verified: boolean;
  };
  access: { canSee: boolean; isSubscriber: boolean; isLocked: boolean };
}

export function PostCard({ post }: { post: FeedPost }) {
  const [showFull, setShowFull] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [unlockPlan, setUnlockPlan] = useState<{
    id: string; name: string; intervalMonths: number; price: number;
  } | null>(null);
  const qc = useQueryClient();

  const captionTxt = post.caption ?? '';
  const truncated = captionTxt.length > 200 && !showFull;
  const visible = truncated ? captionTxt.slice(0, 200) + '…' : captionTxt;
  const canSee = post.access.canSee;

  // Toggle like
  const likeMutation = useMutation({
    mutationFn: () => api(`/users/me/like/${post.id}`, { method: 'POST' }),
    onMutate: () => { setLiked((v) => !v); },
    onError:  () => { setLiked((v) => !v); },                  // rollback se falhar
    onSettled: () => { qc.invalidateQueries({ queryKey: ['feed'] }); },
  });

  /** Abre o modal de assinatura/desbloqueio. */
  async function handleUnlock() {
    try {
      // Pega plano principal da criadora pra abrir o flow
      const profile = await api<{ id: string; plans: Array<{ id: string; name: string; intervalMonths: number; price: number; isPromo: boolean }> }>(
        `/users/${post.creator.username}`,
      );
      const main = profile.plans.find((p) => !p.isPromo) ?? profile.plans[0];
      if (main) {
        setUnlockPlan({ id: main.id, name: main.name, intervalMonths: main.intervalMonths, price: main.price });
        setUnlockOpen(true);
      }
    } catch (err) {
      console.error('unlock error', err);
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/${post.creator.username}`;
    if (navigator.share) {
      navigator.share({ title: post.creator.displayName, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).then(() => {
        alert('Link copiado!');
      }).catch(() => {});
    }
  }

  return (
    <>
      <article className="rounded-2xl bg-surface1 border border-border overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-start gap-3 p-4">
          <Link href={`/${post.creator.username}`}>
            <Avatar
              src={post.creator.profilePicture}
              alt={post.creator.displayName}
              size="md"
              verified={post.creator.verified}
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/${post.creator.username}`} className="font-semibold text-text hover:underline flex items-center gap-1">
              {post.creator.displayName}
              {post.creator.verified && (
                <span className="inline-block w-4 h-4 rounded-full bg-brand grid place-items-center text-white text-[10px]">✓</span>
              )}
            </Link>
            <p className="text-xs text-muted">@{post.creator.username}</p>
          </div>
          {post.publishedAt && (
            <div className="text-xs text-muted whitespace-nowrap">{formatRelative(post.publishedAt)}</div>
          )}
          <button className="p-2 -m-2 w-11 h-11 grid place-items-center text-muted hover:text-text hover:bg-surface2 rounded-full" aria-label="Mais opções">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Caption (acima da foto, como Instagram/Privacy) */}
        {captionTxt && (
          <div className="px-4 pb-3 text-sm text-text leading-relaxed">
            <span className="text-brand font-medium">@{post.creator.username}</span>{' '}
            {visible}
            {truncated && (
              <button onClick={() => setShowFull(true)} className="ml-1 text-muted hover:text-text">
                mostrar mais
              </button>
            )}
          </div>
        )}

        {/* Imagem */}
        <div className="relative aspect-[4/5] max-h-[80dvh] bg-surface2 protected overflow-hidden" data-protected="true">
          {canSee && post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : post.thumbnailUrl ? (
            <BlurredCenterImage src={post.thumbnailUrl} />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface2 to-bg" />
          )}

          {post.isLocked && (
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center text-white drop-shadow-lg space-y-3 p-6">
                <Lock className="w-10 h-10 mx-auto" />
                {post.ppvPrice ? (
                  <>
                    <p className="font-semibold">Conteúdo exclusivo</p>
                    <button
                      data-interactive="true"
                      onClick={handleUnlock}
                      className="pointer-events-auto inline-flex items-center justify-center h-11 px-6 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-600 shadow-md"
                    >
                      Desbloquear por {formatBRL(post.ppvPrice)}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">Apenas para assinantes</p>
                    <button
                      data-interactive="true"
                      onClick={handleUnlock}
                      className="pointer-events-auto inline-flex items-center justify-center h-11 px-6 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-600 shadow-md"
                    >
                      Assinar agora
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => likeMutation.mutate()}
              className={cn(
                'p-2 -m-2 hover:bg-surface2 rounded-full transition-colors',
                liked && 'text-red-500',
              )}
              aria-label="Curtir"
              aria-pressed={liked}
            >
              <Heart className={cn('w-6 h-6', liked ? 'fill-red-500 text-red-500' : 'text-text')} />
            </button>
            <button
              onClick={handleUnlock}
              className="p-2 -m-2 hover:bg-surface2 rounded-full transition-colors"
              aria-label="Comentar"
            >
              <MessageCircle className="w-6 h-6 text-text" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 -m-2 hover:bg-surface2 rounded-full transition-colors"
              aria-label="Compartilhar"
            >
              <Send className="w-6 h-6 text-text" />
            </button>
            <button
              onClick={() => setSaved((v) => !v)}
              className="ml-auto p-2 -m-2 hover:bg-surface2 rounded-full transition-colors"
              aria-label="Salvar"
              aria-pressed={saved}
            >
              <Bookmark className={cn('w-6 h-6', saved ? 'fill-text text-text' : 'text-text')} />
            </button>
          </div>

          <p className="text-sm font-semibold">
            {(post.likeCount + (liked ? 1 : 0)).toLocaleString('pt-BR')} curtidas
          </p>
          {post.commentCount > 0 && (
            <button
              onClick={handleUnlock}
              className="block text-sm text-muted hover:text-text"
            >
              Ver todos os {post.commentCount} comentários
            </button>
          )}
        </div>
      </article>

      {/* Modal de checkout — abre quando clica em desbloquear/assinar */}
      {unlockOpen && unlockPlan && (
        <SubscriptionFlow
          creator={{
            id:             post.creator.id,
            username:       post.creator.username,
            displayName:    post.creator.displayName,
            profilePicture: post.creator.profilePicture,
            coverImage:     null,
          }}
          plan={unlockPlan}
          onClose={() => setUnlockOpen(false)}
        />
      )}
    </>
  );
}

/**
 * Foto inteira borrada (sem corte) — paywall mais limpo.
 * scale-110 evita ver as bordas brancas que o blur cria.
 */
function BlurredCenterImage({ src }: { src: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110"
        draggable={false}
      />
      {/* leve gradiente escuro pra dar contraste no overlay branco do cadeado */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/40" />
    </div>
  );
}
