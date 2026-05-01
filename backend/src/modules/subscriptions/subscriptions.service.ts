/**
 * SubscriptionsService — checkout com Pix QR Code real.
 *
 * Fluxo:
 *  1. Usuário escolhe plano e método na página de perfil.
 *  2. Sistema cria Subscription PENDING + Transaction PENDING.
 *  3. Para Pix: gera payload BR Code via PixService e retorna QR data URL.
 *  4. Para outros métodos: retorna URL de checkout (mockada em dev).
 *  5. (em prod) webhook do gateway ativa subscription após confirmação.
 *
 * SECURITY: Comissão de 20% calculada server-side.
 */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PixService } from './pix.service';
import {
  PaymentMethod, SubscriptionStatus, TransactionStatus, TransactionType, UserRole,
} from '../../types/enums';

const PLATFORM_COMMISSION = 0.20;

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pix: PixService,
  ) {}

  /**
   * Cria subscription pending + transaction pending + retorna dados do método de pagamento.
   */
  async checkout(input: {
    subscriberId: string;
    creatorId: string;
    planId: string;
    paymentMethod: PaymentMethod;
  }) {
    if (input.subscriberId === input.creatorId) {
      throw new BadRequestException('Não é possível assinar a si mesmo');
    }

    const creator = await this.prisma.user.findFirst({
      where: { id: input.creatorId, role: UserRole.CREATOR, deletedAt: null },
      include: { creatorProfile: true },
    });
    if (!creator?.creatorProfile?.isActive) {
      throw new NotFoundException('Criadora não encontrada');
    }

    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: { id: input.planId, creatorProfileId: creator.creatorProfile.id, isActive: true },
    });
    if (!plan) throw new NotFoundException('Plano não disponível');

    // Bloqueia criar nova subscription se já houver ativa.
    const existing = await this.prisma.subscription.findUnique({
      where: { subscriberId_creatorId: { subscriberId: input.subscriberId, creatorId: input.creatorId } },
    });
    if (existing && existing.status === SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Você já assina esta criadora.');
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + plan.intervalMonths);

    const subscription = await this.prisma.subscription.upsert({
      where:  { subscriberId_creatorId: { subscriberId: input.subscriberId, creatorId: input.creatorId } },
      create: {
        subscriberId:       input.subscriberId,
        creatorId:          input.creatorId,
        planId:             plan.id,
        status:             SubscriptionStatus.PENDING,
        currentPeriodStart: now,
        currentPeriodEnd:   periodEnd,
        price:              plan.price,
      },
      update: {
        planId:             plan.id,
        status:             SubscriptionStatus.PENDING,
        currentPeriodStart: now,
        currentPeriodEnd:   periodEnd,
        price:              plan.price,
      },
    });

    const platformFee = Number((plan.price * PLATFORM_COMMISSION).toFixed(2));
    const netAmount   = Number((plan.price - platformFee).toFixed(2));

    const transaction = await this.prisma.transaction.create({
      data: {
        payerId:        input.subscriberId,
        payeeId:        input.creatorId,
        subscriptionId: subscription.id,
        type:           TransactionType.SUBSCRIPTION,
        amount:         plan.price,
        platformFee,
        netAmount,
        status:         TransactionStatus.PENDING,
        paymentMethod:  input.paymentMethod,
        metadata:       JSON.stringify({ planId: plan.id, intervalMonths: plan.intervalMonths }),
      },
    });

    const benefits = [
      'Acesso ao conteúdo',
      'Chat exclusivo com a criadora',
      'Cancele a qualquer hora',
    ];

    if (input.paymentMethod === PaymentMethod.PIX) {
      const pix = await this.pix.generatePix({
        amount: plan.price,
        description: `Assinatura ${creator.creatorProfile.displayName} - ${plan.name}`,
        txid: subscription.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25),
      });

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { pixCode: pix.payload, pixQrCodeUrl: pix.qrCodeDataUrl },
      });

      return {
        method:        'PIX',
        amount:        plan.price,
        currency:      'BRL',
        pixCode:       pix.payload,
        pixQrCodeUrl:  pix.qrCodeDataUrl,
        txid:          pix.txid,
        subscriptionId: subscription.id,
        transactionId: transaction.id,
        benefits,
        creator: {
          username:       creator.username,
          displayName:    creator.creatorProfile.displayName,
          profilePicture: creator.profilePicture,
          coverImage:     creator.creatorProfile.coverImage,
        },
        plan: { name: plan.name, intervalMonths: plan.intervalMonths },
      };
    }

    // Outros métodos: stub. Em prod redireciona para gateway.
    return {
      method:         input.paymentMethod,
      amount:         plan.price,
      currency:       'BRL',
      checkoutUrl:    `/checkout/${input.paymentMethod.toLowerCase()}/${subscription.id}`,
      subscriptionId: subscription.id,
      transactionId:  transaction.id,
      benefits,
      creator: {
        username:       creator.username,
        displayName:    creator.creatorProfile.displayName,
        profilePicture: creator.profilePicture,
        coverImage:     creator.creatorProfile.coverImage,
      },
      plan: { name: plan.name, intervalMonths: plan.intervalMonths },
    };
  }

  async findMySubscriptions(subscriberId: string) {
    return this.prisma.subscription.findMany({
      where: {
        subscriberId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
      },
      include: {
        creator: {
          select: {
            id: true, username: true, profilePicture: true, isVerified: true,
            creatorProfile: { select: { displayName: true, coverImage: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
