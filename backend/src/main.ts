/**
 * Bootstrap NestJS — versão dev.
 * SECURITY (prod): habilitar Helmet com CSP estrita e HSTS.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bufferLogs: true, cors: false });

  app.use(cookieParser(process.env.COOKIE_SECRET));

  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',').map((s) => s.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api/v1');

  // SECURITY: trust proxy ativo p/ obter IP real atrás do load balancer (Fly/Render).
  app.getHttpAdapter().getInstance().set?.('trust proxy', 1);

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
  logger.log(`Fantastic API rodando em http://0.0.0.0:${port}`);
}

void bootstrap();
