/**
 * AppModule simplificado para o ambiente SQLite/dev.
 * Os módulos Chat/Ads/Watermark/Privacy ficam disponíveis no código mas
 * não são carregados aqui — depende de PostgreSQL/Mux/CCBill em prod.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './infrastructure/prisma/prisma.module';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    SubscriptionsModule,
    HealthModule,
  ],
})
export class AppModule {}
