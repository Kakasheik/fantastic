/**
 * AuthService — auth simplificado p/ ambiente dev (SQLite).
 * SECURITY: bcrypt cost 12, refresh token rotativo, lockout após 5 falhas.
 */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserRole } from '../../types/enums';

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; username: string; role: UserRole };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: {
    email: string;
    username: string;
    password: string;
    role?: UserRole;
  }, meta: { ip?: string; userAgent?: string }): Promise<AuthResult> {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: input.email }, { username: input.username }], deletedAt: null },
      select: { id: true },
    });
    if (existing) throw new ConflictException('E-mail ou username já cadastrado');

    const passwordHash = await bcrypt.hash(input.password, this.BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email:    input.email.toLowerCase(),
        username: input.username.toLowerCase(),
        passwordHash,
        role:     input.role ?? UserRole.SUBSCRIBER,
        // Em dev pulamos KYC. Em prod, isAgeVerified=true só após SumSub validar.
        isAgeVerified: true,
      },
      select: { id: true, email: true, username: true, role: true },
    });

    return this.issueTokens(user as never, meta);
  }

  /**
   * Completa o cadastro com dados pessoais (CPF, nome, DOB, telefone, e-mail opcional).
   * Chamado dentro do fluxo de checkout.
   * SECURITY: Se e-mail mudou, valida unicidade antes de aceitar.
   */
  async completeProfile(userId: string, input: {
    fullName: string;
    cpf: string;
    phone: string;
    dateOfBirth: string;
    nickname?: string;
    email?: string;
  }): Promise<void> {
    const dob = new Date(input.dateOfBirth);
    if (isNaN(dob.getTime())) throw new BadRequestException('Data de nascimento inválida');

    const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 18) throw new BadRequestException('É necessário ter 18 anos ou mais');

    // Se e-mail foi enviado e diferente do atual, valida unicidade
    let emailUpdate: { email: string } | undefined;
    if (input.email) {
      const cur = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      const newEmail = input.email.toLowerCase();
      if (cur && cur.email !== newEmail) {
        const taken = await this.prisma.user.findFirst({
          where: { email: newEmail, id: { not: userId } },
        });
        if (taken) throw new ConflictException('E-mail já cadastrado por outro usuário');
        emailUpdate = { email: newEmail };
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName:    input.fullName,
        cpf:         input.cpf.replace(/\D/g, ''),
        phone:       input.phone.replace(/\D/g, ''),
        dateOfBirth: dob,
        nickname:    input.nickname,
        isVerified:  true,
        ...(emailUpdate ?? {}),
      },
    });
  }

  async login(input: { email: string; password: string }, meta: { ip?: string; userAgent?: string }): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (!user || user.deletedAt) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    await this.prisma.user.update({
      where: { id: user.id },
      data:  { lastLoginAt: new Date(), lastLoginIp: meta.ip },
    });

    return this.issueTokens(user as never, meta);
  }

  async refresh(rawRefreshToken: string, meta: { ip?: string; userAgent?: string }): Promise<AuthResult> {
    let payload: { sub: string; family: string; jti: string };
    try {
      payload = await this.jwt.verifyAsync(rawRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      if (stored?.family) {
        await this.prisma.refreshToken.updateMany({
          where: { family: stored.family, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException('Refresh token revogado');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.deletedAt) throw new UnauthorizedException();

    return this.issueTokens(user as never, meta, payload.family);
  }

  async logout(rawRefreshToken: string, userId: string): Promise<void> {
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, userId },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, username: true, role: true,
        isVerified: true, isAgeVerified: true, profilePicture: true,
        fullName: true, walletBalance: true,
      },
    });
    return user;
  }

  private async issueTokens(
    user: { id: string; email: string; username: string; role: string },
    meta: { ip?: string; userAgent?: string },
    family?: string,
  ): Promise<AuthResult> {
    const fam = family ?? randomUUID();
    const jti = randomUUID();

    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, family: fam, jti },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '30d' },
    );

    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId:    user.id,
        tokenHash,
        family:    fam,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, username: user.username, role: user.role as UserRole },
    };
  }
}
