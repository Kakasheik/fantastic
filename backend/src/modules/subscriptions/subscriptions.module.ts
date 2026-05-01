import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { WalletController } from './wallet.controller';
import { PixService } from './pix.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SubscriptionsController, WalletController],
  providers: [SubscriptionsService, PixService],
  exports: [PixService],
})
export class SubscriptionsModule {}
