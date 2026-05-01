import { IsEnum, IsString } from 'class-validator';
import { PaymentMethod } from '../../../types/enums';

export class CheckoutDto {
  @IsString()
  creatorId!: string;

  @IsString()
  planId!: string;

  @IsEnum([PaymentMethod.PIX, PaymentMethod.CREDIT_CARD, PaymentMethod.GOOGLE_PAY, PaymentMethod.PICPAY, PaymentMethod.WALLET])
  paymentMethod!: PaymentMethod;
}
