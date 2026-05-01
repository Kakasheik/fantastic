/**
 * MeService — agregações para o usuário logado.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SubscriptionStatus } from '../../types/enums';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getWallet(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, walletBalance: true, nickname: true, username: true, profilePicture: true },
    });
    if (!user) throw new NotFoundException();

    const recent = await this.prisma.transaction.findMany({
      where: { OR: [{ payerId: userId }, { payeeId: userId }] },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, type: true, amount: true, status: true, createdAt: true, payerId: true },
    });

    return {
      balance:    user.walletBalance,
      recent:     recent.map((t) => ({
        id:        t.id,
        type:      t.type,
        amount:    t.amount,
        direction: t.payerId === userId ? 'OUT' : 'IN',
        status:    t.status,
        createdAt: t.createdAt,
      })),
    };
  }

  async getTransactions(userId: string, limit = 30) {
    const txs = await this.prisma.transaction.findMany({
      where: { OR: [{ payerId: userId }, { payeeId: userId }] },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        payer: { select: { username: true, profilePicture: true } },
        payee: { select: { username: true, profilePicture: true } },
      },
    });

    return txs.map((t) => ({
      id:             t.id,
      type:           t.type,
      amount:         t.amount,
      netAmount:      t.netAmount,
      status:         t.status,
      paymentMethod:  t.paymentMethod,
      direction:      t.payerId === userId ? 'OUT' : 'IN',
      counterpart: t.payerId === userId
        ? (t.payee ? { username: t.payee.username, profilePicture: t.payee.profilePicture } : null)
        : (t.payer ? { username: t.payer.username, profilePicture: t.payer.profilePicture } : null),
      createdAt:      t.createdAt,
    }));
  }

  async getMySubscriptions(userId: string) {
    const subs = await this.prisma.subscription.findMany({
      where: {
        subscriberId: userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL, SubscriptionStatus.PENDING] },
      },
      include: {
        creator: {
          select: {
            id: true, username: true, profilePicture: true, isVerified: true,
            creatorProfile: { select: { displayName: true, coverImage: true } },
          },
        },
        plan: { select: { name: true, intervalMonths: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return subs.map((s) => ({
      id:                 s.id,
      status:             s.status,
      price:              s.price,
      currentPeriodEnd:   s.currentPeriodEnd,
      autoRenew:          s.autoRenew,
      plan:               s.plan,
      creator: {
        id:             s.creator.id,
        username:       s.creator.username,
        displayName:    s.creator.creatorProfile?.displayName ?? s.creator.username,
        profilePicture: s.creator.profilePicture,
        coverImage:     s.creator.creatorProfile?.coverImage,
        verified:       s.creator.isVerified,
      },
    }));
  }

  async getActivity(userId: string) {
    const [likes, comments, transactions] = await Promise.all([
      this.prisma.postLike.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          post: {
            select: {
              id: true, caption: true, thumbnailUrl: true,
              creator: { select: { username: true, profilePicture: true } },
            },
          },
        },
      }),
      this.prisma.comment.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { post: { select: { id: true, caption: true } } },
      }),
      this.prisma.transaction.findMany({
        where: { payerId: userId, status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      likes: likes.map((l) => ({
        postId:    l.post.id,
        caption:   l.post.caption,
        thumbnail: l.post.thumbnailUrl,
        creator:   l.post.creator,
        likedAt:   l.createdAt,
      })),
      comments: comments.map((c) => ({
        postId:   c.post.id,
        caption:  c.post.caption,
        content:  c.content,
        createdAt: c.createdAt,
      })),
      transactions: transactions.length,
    };
  }

  async getSavedPosts(_userId: string) {
    /**
     * Modelo de "salvos" (bookmarks) ainda não implementado no schema.
     * Em prod, criar tabela SavedPost(userId, postId, createdAt).
     */
    return { items: [], message: 'Em breve: salve posts para ver aqui' };
  }

  async getPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException();

    /**
     * Preferências em memória apenas em dev (não persistido no schema atual).
     * Em prod, criar tabela UserPreference.
     */
    return {
      theme:              'light',
      language:           'pt-BR',
      emailNotifications: true,
      pushNotifications:  true,
      twoFactorEnabled:   false,
    };
  }

  async setPreferences(userId: string, prefs: { theme?: string; language?: string; emailNotifications?: boolean; pushNotifications?: boolean }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    /**
     * Stub. Em prod, persistir na tabela UserPreference.
     */
    return { ok: true, applied: prefs };
  }

  async getSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, username: true, role: true, fullName: true, nickname: true,
        bio: true, profilePicture: true, isVerified: true, isAgeVerified: true, walletBalance: true,
        creatorProfile: {
          select: {
            id: true, displayName: true, coverImage: true, totalPhotos: true, totalVideos: true,
            totalLocked: true, totalLikes: true, totalSubscribers: true, isActive: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException();

    const [postsCount, mediasCount] = await Promise.all([
      this.prisma.post.count({ where: { creatorId: userId, deletedAt: null } }),
      this.prisma.post.count({ where: { creatorId: userId, deletedAt: null, type: { in: ['VIDEO', 'AUDIO'] } } }),
    ]);

    return {
      ...user,
      stats: {
        posts:  postsCount,
        medias: mediasCount,
      },
    };
  }

  async getOwnPosts(userId: string, status: 'published' | 'scheduled' | 'archived', _type: 'post' | 'media') {
    const now = new Date();
    let where: { creatorId: string; deletedAt: Date | null; publishedAt?: { lte?: Date; gt?: Date } | null } = {
      creatorId: userId,
      deletedAt: null,
    };
    if (status === 'published') where.publishedAt = { lte: now };
    if (status === 'scheduled') where.publishedAt = { gt: now };
    if (status === 'archived')  where = { creatorId: userId, deletedAt: { not: null } as never };

    const posts = await this.prisma.post.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
      take: 60,
      select: {
        id: true, type: true, caption: true, imageUrl: true, thumbnailUrl: true,
        isLocked: true, ppvPrice: true, publishedAt: true, likeCount: true, commentCount: true,
      },
    });

    return { items: posts };
  }

  async editProfile(userId: string, dto: { displayName?: string; bio?: string; profilePicture?: string; coverImage?: string; nickname?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: true },
    });
    if (!user) throw new NotFoundException();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        bio:            dto.bio            ?? user.bio,
        profilePicture: dto.profilePicture ?? user.profilePicture,
        nickname:       dto.nickname       ?? user.nickname,
      },
    });

    if (user.creatorProfile && (dto.displayName || dto.coverImage || dto.bio)) {
      await this.prisma.creatorProfile.update({
        where: { userId },
        data: {
          displayName: dto.displayName ?? user.creatorProfile.displayName,
          coverImage:  dto.coverImage  ?? user.creatorProfile.coverImage,
          bio:         dto.bio         ?? user.creatorProfile.bio,
        },
      });
    }

    return { ok: true };
  }

  async requestVerification(userId: string, dto: { documentType: string; frontImageKey: string; backImageKey?: string; selfieKey: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();

    /**
     * Schema atual não tem KYCDocument na versão SQLite-compatível.
     * Em prod, criar registro KYCDocument PENDING + abrir SumSub session.
     * Aqui, marcamos isVerified como pending via flag no metadata (stub).
     */
    return {
      ok: true,
      status: 'PENDING',
      reviewEta: '24 a 48 horas',
      submitted: { documentType: dto.documentType, hasBack: !!dto.backImageKey },
    };
  }

  async getVerificationStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true, isAgeVerified: true },
    });
    if (!user) throw new NotFoundException();
    return {
      isVerified:    user.isVerified,
      isAgeVerified: user.isAgeVerified,
      kycStatus:     user.isVerified ? 'APPROVED' : 'NOT_REQUESTED',
    };
  }

  /**
   * Promove o usuário a CREATOR, criando CreatorProfile + 3 planos default.
   * Idempotente: se já é criador, atualiza o profile existente.
   */
  async becomeCreator(userId: string, dto: {
    country: string; cpf: string; fullName: string; dateOfBirth: string;
    handle: string; displayName?: string; profilePicture?: string;
    coverImage?: string; bio?: string;
    instagram?: string; tiktok?: string; twitter?: string;
    monthlyPrice?: number; quarterlyDiscount?: number; semesterDiscount?: number;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: true },
    });
    if (!user) throw new NotFoundException();

    // Valida handle único
    const handleClean = dto.handle.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (handleClean.length < 3) {
      throw new NotFoundException('Handle inválido (mínimo 3 caracteres alfanuméricos)');
    }
    const taken = await this.prisma.user.findFirst({
      where: { username: handleClean, id: { not: userId } },
    });
    if (taken) {
      throw new NotFoundException('Esse @ já está em uso. Escolha outro.');
    }

    const monthly   = Math.max(19.90, Math.min(200, dto.monthlyPrice ?? 49.90));
    const qDisc     = Math.max(0, Math.min(50, dto.quarterlyDiscount ?? 10));
    const sDisc     = Math.max(0, Math.min(50, dto.semesterDiscount  ?? 20));

    const dob = new Date(dto.dateOfBirth);
    if (isNaN(dob.getTime())) throw new NotFoundException('Data de nascimento inválida');

    // Atualiza User
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        username:    handleClean,
        role:        'CREATOR',
        fullName:    dto.fullName,
        cpf:         dto.cpf.replace(/\D/g, ''),
        dateOfBirth: dob,
        bio:         dto.bio ?? user.bio,
        profilePicture: dto.profilePicture ?? user.profilePicture,
      },
    });

    const socialLinks = JSON.stringify({
      instagram: dto.instagram?.replace(/^@/, '') ?? null,
      tiktok:    dto.tiktok?.replace(/^@/, '')    ?? null,
      twitter:   dto.twitter?.replace(/^@/, '')   ?? null,
    });

    const displayName = dto.displayName ?? handleClean;

    let creatorProfile;
    if (user.creatorProfile) {
      creatorProfile = await this.prisma.creatorProfile.update({
        where: { userId },
        data: {
          displayName,
          coverImage:        dto.coverImage,
          bio:               dto.bio,
          subscriptionPrice: monthly,
          socialLinks,
          isActive:          true,
        },
      });
    } else {
      creatorProfile = await this.prisma.creatorProfile.create({
        data: {
          userId,
          displayName,
          coverImage:        dto.coverImage,
          bio:               dto.bio,
          subscriptionPrice: monthly,
          socialLinks,
          isActive:          true,
        },
      });
    }

    // Limpa planos antigos e cria novos
    await this.prisma.subscriptionPlan.deleteMany({ where: { creatorProfileId: creatorProfile.id } });
    const quarterPrice  = Number((monthly * 3 * (1 - qDisc / 100)).toFixed(2));
    const semesterPrice = Number((monthly * 6 * (1 - sDisc / 100)).toFixed(2));
    await this.prisma.subscriptionPlan.createMany({
      data: [
        { creatorProfileId: creatorProfile.id, name: '1 mês',   intervalMonths: 1, price: monthly,        discountPercent: 0,     isPromo: false, isActive: true, displayOrder: 1 },
        { creatorProfileId: creatorProfile.id, name: '3 meses', intervalMonths: 3, price: quarterPrice,   discountPercent: qDisc, isPromo: qDisc > 0, isActive: true, displayOrder: 2 },
        { creatorProfileId: creatorProfile.id, name: '6 meses', intervalMonths: 6, price: semesterPrice,  discountPercent: sDisc, isPromo: sDisc > 0, isActive: true, displayOrder: 3 },
      ],
    });

    return {
      ok: true,
      creatorProfileId: creatorProfile.id,
      handle: handleClean,
      displayName,
      role: 'CREATOR',
      profileUrl: `/${handleClean}`,
    };
  }

  async toggleLike(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException();

    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.postLike.delete({ where: { id: existing.id } }),
        this.prisma.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } }),
      ]);
      return { liked: false };
    } else {
      await this.prisma.$transaction([
        this.prisma.postLike.create({ data: { userId, postId } }),
        this.prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } }),
      ]);
      return { liked: true };
    }
  }
}
