/**
 * UsersService — perfil de criadora + listagem "Em alta".
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SubscriptionStatus } from '../../types/enums';

export interface PublicCreatorProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  profilePicture: string | null;
  coverImage: string | null;
  verified: boolean;
  socialLinks: { twitter?: string; tiktok?: string; instagram?: string } | null;
  stats: {
    photos:      number;
    videos:      number;
    locked:      number;
    likes:       number;
    subscribers: number;
  };
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

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findCreatorByUsername(username: string, viewerId?: string): Promise<PublicCreatorProfile> {
    const user = await this.prisma.user.findFirst({
      where: { username: username.toLowerCase(), deletedAt: null },
      include: {
        creatorProfile: {
          include: {
            subscriptionPlans: {
              where: { isActive: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!user || !user.creatorProfile) {
      throw new NotFoundException('Criadora não encontrada');
    }

    let isSubscribed = false;
    if (viewerId) {
      const sub = await this.prisma.subscription.findUnique({
        where: { subscriberId_creatorId: { subscriberId: viewerId, creatorId: user.id } },
      });
      isSubscribed = sub?.status === SubscriptionStatus.ACTIVE || sub?.status === SubscriptionStatus.TRIAL;
    }

    return {
      id:             user.id,
      username:       user.username,
      displayName:    user.creatorProfile.displayName,
      bio:            user.creatorProfile.bio,
      profilePicture: user.profilePicture,
      coverImage:     user.creatorProfile.coverImage,
      verified:       user.isVerified,
      socialLinks:    safeJson(user.creatorProfile.socialLinks),
      stats: {
        photos:      user.creatorProfile.totalPhotos,
        videos:      user.creatorProfile.totalVideos,
        locked:      user.creatorProfile.totalLocked,
        likes:       user.creatorProfile.totalLikes,
        subscribers: user.creatorProfile.totalSubscribers,
      },
      plans: user.creatorProfile.subscriptionPlans.map((p) => ({
        id:               p.id,
        name:             p.name,
        intervalMonths:   p.intervalMonths,
        price:            p.price,
        discountPercent:  p.discountPercent,
        isPromo:          p.isPromo,
      })),
      isSubscribed,
    };
  }

  /** Top creators ordenados por número de assinantes. */
  async topCreators(limit = 6) {
    const profiles = await this.prisma.creatorProfile.findMany({
      where: { isActive: true },
      include: { user: { select: { id: true, username: true, profilePicture: true, isVerified: true } } },
      orderBy: { totalSubscribers: 'desc' },
      take: limit,
    });

    return profiles.map((p) => ({
      id:             p.user.id,
      username:       p.user.username,
      displayName:    p.displayName,
      profilePicture: p.user.profilePicture,
      coverImage:     p.coverImage,
      verified:       p.user.isVerified,
      monthlyPrice:   p.subscriptionPrice,
      subscribers:    p.totalSubscribers,
    }));
  }

  /**
   * Agrega múltiplas seções para a página /em-alta (estilo Privacy "Top Criadores").
   * Reutiliza o mesmo pool de criadoras com diferentes orderings.
   */
  async emAlta() {
    const profiles = await this.prisma.creatorProfile.findMany({
      where: { isActive: true },
      include: {
        user:              { select: { id: true, username: true, profilePicture: true, isVerified: true } },
        subscriptionPlans: { where: { isPromo: true, isActive: true }, orderBy: { discountPercent: 'desc' }, take: 1 },
      },
    });

    const items = profiles.map((c) => ({
      id:             c.user.id,
      username:       c.user.username,
      displayName:    c.displayName,
      profilePicture: c.user.profilePicture,
      coverImage:     c.coverImage,
      verified:       c.user.isVerified,
      subscribers:    c.totalSubscribers,
      photos:         c.totalPhotos,
      videos:         c.totalVideos,
      likes:          c.totalLikes,
      monthlyPrice:   c.subscriptionPrice,
      promo: c.subscriptionPlans[0]
        ? {
            discount: c.subscriptionPlans[0].discountPercent,
            months:   c.subscriptionPlans[0].intervalMonths,
            price:    c.subscriptionPlans[0].price,
          }
        : null,
    }));

    if (items.length === 0) {
      return {
        topMonth: [], freeProfiles: [], topPampered: [], rising: [],
        trendingPosts: [], chatHot: [], oneOnOne: [], livesHot: [],
      };
    }

    // Ordenações distintas — em prod, viriam de signals reais (likes recentes, online status, etc.)
    const byPrice    = [...items].sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    const bySubs     = [...items].sort((a, b) => b.subscribers - a.subscribers);
    const byPosts    = [...items].sort((a, b) => (b.photos + b.videos) - (a.photos + a.videos));
    const byLikes    = [...items].sort((a, b) => b.likes - a.likes);
    const promosOnly = items.filter((c) => c.promo);
    const shuffled   = [...items].sort(() => Math.random() - 0.5);

    return {
      topMonth:      bySubs.slice(0, 6),
      freeProfiles:  byPrice.slice(0, 6),
      topPampered:   bySubs.slice(0, 7),
      rising:        byPosts.slice(0, 6),
      trendingPosts: byLikes.slice(0, 6),
      chatHot:       shuffled.slice(0, 6).map((c) => ({ ...c, status: 'Responde em instantes' })),
      oneOnOne:      promosOnly.slice(0, 3),
      livesHot:      shuffled.slice(0, 4).map((c) => ({
        ...c,
        livesCount: Math.floor(Math.random() * 30) + 1,
        isLive:     Math.random() > 0.5,
      })),
    };
  }

  async subscriptionOffers(limit = 12) {
    const profiles = await this.prisma.creatorProfile.findMany({
      where: { isActive: true },
      include: {
        user: { select: { id: true, username: true, profilePicture: true, isVerified: true } },
        subscriptionPlans: {
          where: { isPromo: true, isActive: true },
          orderBy: { discountPercent: 'desc' },
          take: 1,
        },
      },
      orderBy: { totalSubscribers: 'desc' },
      take: limit,
    });

    return profiles.map((p) => ({
      id:             p.user.id,
      username:       p.user.username,
      displayName:    p.displayName,
      profilePicture: p.user.profilePicture,
      coverImage:     p.coverImage,
      verified:       p.user.isVerified,
      monthlyPrice:   p.subscriptionPrice,
      promo:          p.subscriptionPlans[0]
        ? {
            discount: p.subscriptionPlans[0].discountPercent,
            original: p.subscriptionPrice * p.subscriptionPlans[0].intervalMonths,
            promo:    p.subscriptionPlans[0].price,
            months:   p.subscriptionPlans[0].intervalMonths,
          }
        : null,
    }));
  }
}

function safeJson<T>(value: string | null): T | null {
  if (!value) return null;
  try { return JSON.parse(value) as T; } catch { return null; }
}
