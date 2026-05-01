import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('checkout')
  async checkout(@CurrentUser() user: AuthenticatedUser, @Body() dto: CheckoutDto) {
    return this.subscriptionsService.checkout({
      subscriberId:  user.id,
      creatorId:     dto.creatorId,
      planId:        dto.planId,
      paymentMethod: dto.paymentMethod,
    });
  }

  @Get('my')
  async my(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.findMySubscriptions(user.id);
  }
}
