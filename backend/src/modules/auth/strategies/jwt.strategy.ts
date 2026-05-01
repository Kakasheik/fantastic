import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../types/enums';

interface RawPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest:    ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration:  false,
      secretOrKey:       process.env.JWT_ACCESS_SECRET!,
    });
  }

  async validate(payload: RawPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true, email: true, username: true, role: true, isAgeVerified: true, isVerified: true },
    });
    if (!user) throw new UnauthorizedException();
    return { ...user, role: user.role as UserRole };
  }
}
