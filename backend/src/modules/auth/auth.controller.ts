import {
  Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

const REFRESH_COOKIE = 'fantastic_refresh';
const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path:     '/api/v1/auth',
  maxAge:   30 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const meta = { ip: req.ip, userAgent: req.get('user-agent') };
    const result = await this.authService.register(dto, meta);
    res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTS);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const meta = { ip: req.ip, userAgent: req.get('user-agent') };
    const result = await this.authService.login(dto, meta);
    res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTS);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) throw new UnauthorizedException('Refresh token ausente');
    const meta = { ip: req.ip, userAgent: req.get('user-agent') };
    const result = await this.authService.refresh(refreshToken, meta);
    res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTS);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (refreshToken) await this.authService.logout(refreshToken, user.id);
    res.clearCookie(REFRESH_COOKIE, { ...COOKIE_OPTS, maxAge: 0 });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.id);
  }

  /** Completa cadastro durante o checkout. */
  @Post('complete-profile')
  @UseGuards(JwtAuthGuard)
  async completeProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: CompleteProfileDto) {
    await this.authService.completeProfile(user.id, dto);
    return { ok: true };
  }
}
