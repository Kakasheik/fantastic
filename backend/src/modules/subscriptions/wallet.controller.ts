/**
 * WalletController — recarga da carteira via Pix (mesmo gateway dev).
 */
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsNumber, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PixService } from './pix.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { TransactionStatus, TransactionType } from '../../types/enums';

class RechargeDto {
  @IsNumber()
  @Min(5, { message: 'Recarga mínima de R$ 5,00' })
  amount!: number;
}

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly pix: PixService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('recharge')
  async recharge(@CurrentUser() user: AuthenticatedUser, @Body() dto: RechargeDto) {
    const transaction = await this.prisma.transaction.create({
      data: {
        payerId:        user.id,
        type:           TransactionType.AD_CREDIT, // crédito de carteira
        amount:         dto.amount,
        platformFee:    0,
        netAmount:      dto.amount,
        status:         TransactionStatus.PENDING,
        paymentMethod:  'PIX',
        metadata:       JSON.stringify({ kind: 'wallet_recharge' }),
      },
    });

    const pix = await this.pix.generatePix({
      amount:      dto.amount,
      description: `Recarga carteira Fantastic`,
      txid:        transaction.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25),
    });

    return {
      transactionId: transaction.id,
      amount:        dto.amount,
      pixCode:       pix.payload,
      pixQrCodeUrl:  pix.qrCodeDataUrl,
      txid:          pix.txid,
    };
  }
}
