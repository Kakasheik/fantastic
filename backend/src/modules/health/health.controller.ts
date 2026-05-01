/**
 * /health — endpoint de healthcheck pra Fly.io/Render/k8s.
 * Retorna 200 + uptime + status do banco.
 */
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Controller('health')
export class HealthController {
  private readonly startedAt = Date.now();
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    let dbOk = false;
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      dbOk = true;
    } catch {
      dbOk = false;
    }
    return {
      ok: dbOk,
      uptime: Math.floor((Date.now() - this.startedAt) / 1000),
      timestamp: new Date().toISOString(),
      db: dbOk ? 'connected' : 'down',
      version: '1.0.0',
    };
  }
}
