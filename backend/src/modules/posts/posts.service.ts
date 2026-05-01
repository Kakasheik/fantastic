/**
 * PostsService — versão SQLite/dev.
 * Em prod, integraria com Mux + Watermark + S3 signed URLs.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SubscriptionStatus } from '../../types/enums';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(viewerId?: string, opts: { creatorUsername?: string; cursor?: string; limit?: number } = {}) {
    const limit = opts.limit ?? 20;
    let creatorIds: string[] | undefined;

    if (opts.creatorUsername) {
      const creator = await this.prisma.user.findUnique({
        where: { username: opts.creatorUsername.toLowerCase() },
      });
      if (!creator) throw new NotFoundException();
      creatorIds = [creator.id];
    } else if (viewerId) {
      const subs = await this.prisma.subscription.findMany({
        where:  { subscriberId: viewerId, status: SubscriptionStatus.ACTIVE },
        select: { creatorId: true },
      });
      const subscribedIds = subs.map((s) => s.creatorId);
      if (subscribedIds.length > 0) creatorIds = subscribedIds;
    }

    const posts = await this.prisma.post.findMany({
      where: {
        deletedAt: null,
        publishedAt: { lte: new Date() },
        ...(creatorIds ? { creatorId: { in: creatorIds } } : {}),
      },
      take: limit + 1,
      ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
      orderBy: { publishedAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true, username: true, profilePicture: true, isVerified: true,
            creatorProfile: { select: { displayName: true } },
          },
        },
      },
    });

    const hasMore = posts.length > limit;
    const sliced = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? sliced[sliced.length - 1].id : null;

    let subscribedSet = new Set<string>();
    if (viewerId) {
      const subs = await this.prisma.subscription.findMany({
        where:  { subscriberId: viewerId, status: SubscriptionStatus.ACTIVE },
        select: { creatorId: true },
      });
      subscribedSet = new Set(subs.map((s) => s.creatorId));
    }

    const data = sliced.map((p) => {
      const isCreator    = p.creatorId === viewerId;
      const isSubscriber = subscribedSet.has(p.creatorId);
      const canSee       = isCreator || (p.isLocked ? false : (isSubscriber || !p.ppvPrice));

      return {
        id:           p.id,
        type:         p.type,
        caption:      p.caption,
        imageUrl:     canSee ? p.imageUrl : null,
        thumbnailUrl: p.thumbnailUrl,
        isLocked:     p.isLocked,
        ppvPrice:     p.ppvPrice,
        publishedAt:  p.publishedAt,
        likeCount:    p.likeCount,
        commentCount: p.commentCount,
        creator: {
          id:             p.creator.id,
          username:       p.creator.username,
          displayName:    p.creator.creatorProfile?.displayName ?? p.creator.username,
          profilePicture: p.creator.profilePicture,
          verified:       p.creator.isVerified,
        },
        access: { canSee, isSubscriber, isLocked: p.isLocked },
      };
    });

    return { data, nextCursor };
  }
}
