'use client';
/**
 * / — Home/Feed.
 * Consome /posts/feed da API. Sem mocks.
 */
import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PostCard, type FeedPost } from '@/components/feed/post-card';
import { useContentProtection } from '@/hooks/use-content-protection';

interface FeedResponse {
  data: FeedPost[];
  nextCursor: string | null;
}

export default function HomePage() {
  useContentProtection();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery<FeedResponse>({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => {
      const url = pageParam ? `/posts/feed?cursor=${pageParam}&limit=20` : '/posts/feed?limit=20';
      return api<FeedResponse>(url);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, fetchNextPage]);

  return (
    <div className="protected max-w-2xl mx-auto px-4 py-6 space-y-6">
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-surface1 border border-border h-96 animate-pulse" />
          ))}
        </div>
      )}

      {data?.pages.flatMap((p) => p.data).map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      <div ref={sentinelRef} className="h-1" />

      {!hasNextPage && !isLoading && (
        <p className="text-center text-muted text-sm py-8">Você chegou ao fim do feed. ✨</p>
      )}
    </div>
  );
}
