'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, MoreHorizontal, Send, Bookmark, Lock } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatBRL, formatRelative } from '@/lib/utils';

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
  const captionTxt = post.caption ?? '';
  const truncated = captionTxt.length > 200 && !showFull;
  const visible = truncated ? captionTxt.slice(0, 200) + '…' : captionTxt;
  const canSee = post.access.canSee;

  return (
    <article className="rounded-2xl bg-surface1 border border-border overflow-hidden animate-fade-in">
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
        <button className="p-1 -m-1 text-muted hover:text-text" aria-label="Mais opções">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

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

      <div className="relative aspect-[4/5] bg-surface2 protected" data-protected="true">
        {canSee && post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={post.caption ?? 'Post'}
            fill
            className="object-cover"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            sizes="(max-width: 768px) 100vw, 600px"
          />
        ) : post.thumbnailUrl ? (
          <BlurredCenterImage src={post.thumbnailUrl} alt={post.caption ?? ''} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface2 to-bg" />
        )}

        {post.isLocked && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center text-white drop-shadow-lg space-y-3 p-6">
              <Lock className="w-10 h-10 mx-auto" />
              {post.ppvPrice ? (
                <>
                  <p className="font-semibold">Conteúdo exclusivo</p>
                  <Button data-interactive="true" variant="primary">
                    Desbloquear por {formatBRL(post.ppvPrice)}
                  </Button>
                </>
              ) : (
                <>
                  <p className="font-semibold">Apenas para assinantes</p>
                  <Link href={`/${post.creator.username}`} data-interactive="true">
                    <Button variant="primary">Assinar agora</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center gap-1">
          <button className="p-2 -m-2 hover:bg-surface2 rounded-full transition-colors" aria-label="Curtir">
            <Heart className="w-6 h-6 text-text" />
          </button>
          <button className="p-2 -m-2 hover:bg-surface2 rounded-full transition-colors" aria-label="Comentar">
            <MessageCircle className="w-6 h-6 text-text" />
          </button>
          <button className="p-2 -m-2 hover:bg-surface2 rounded-full transition-colors" aria-label="Compartilhar">
            <Send className="w-6 h-6 text-text" />
          </button>
          <button className="ml-auto p-2 -m-2 hover:bg-surface2 rounded-full transition-colors" aria-label="Salvar">
            <Bookmark className="w-6 h-6 text-text" />
          </button>
        </div>

        <p className="text-sm font-semibold">{post.likeCount.toLocaleString('pt-BR')} curtidas</p>
        {post.commentCount > 0 && (
          <button className="block text-sm text-muted hover:text-text">
            Ver todos os {post.commentCount} comentários
          </button>
        )}
      </div>
    </article>
  );
}

function BlurredCenterImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="absolute inset-0 grid grid-cols-3">
      <div className="relative overflow-hidden">
        <Image src={src} alt="" fill className="object-cover blur-2xl scale-110" sizes="200px" />
      </div>
      <div className="relative overflow-hidden">
        <Image src={src} alt={alt} fill className="object-cover" sizes="400px" draggable={false} />
      </div>
      <div className="relative overflow-hidden">
        <Image src={src} alt="" fill className="object-cover blur-2xl scale-110" sizes="200px" />
      </div>
    </div>
  );
}
