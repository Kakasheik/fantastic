/**
 * MeController — endpoints "/users/me/*" para o usuário logado.
 * Cobre: carteira, atividade, preferências, posts salvos, transações.
 */
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { MeService } from './me.service';

class EditProfileDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(80)  displayName?: string;
  @IsOptional() @IsString() @MaxLength(280)               bio?: string;
  @IsOptional() @IsString() @MaxLength(500)               profilePicture?: string;
  @IsOptional() @IsString() @MaxLength(500)               coverImage?: string;
  @IsOptional() @IsString() @MaxLength(60)                nickname?: string;
}

class VerifyRequestDto {
  @IsString() @MaxLength(60)   documentType!: string; // RG | CNH | PASSPORT
  @IsString() @MaxLength(500)  frontImageKey!: string;
  @IsOptional() @IsString() @MaxLength(500) backImageKey?: string;
  @IsString() @MaxLength(500)  selfieKey!: string;
}

class BecomeCreatorDto {
  // Identificação
  @IsString() @MaxLength(2)    country!: string;       // BR
  @IsString() @MaxLength(20)   cpf!: string;
  @IsString() @MinLength(3) @MaxLength(120) fullName!: string;
  @IsString() @MaxLength(40)   dateOfBirth!: string;

  // Perfil
  @IsString() @MinLength(3) @MaxLength(60)
  handle!: string; // username público (será url privacy.com.br/@handle)
  @IsOptional() @IsString() @MaxLength(80)  displayName?: string;
  @IsOptional() @IsString() @MaxLength(500) profilePicture?: string;
  @IsOptional() @IsString() @MaxLength(500) coverImage?: string;
  @IsOptional() @IsString() @MaxLength(3000) bio?: string;

  // Redes
  @IsOptional() @IsString() @MaxLength(60) instagram?: string;
  @IsOptional() @IsString() @MaxLength(60) tiktok?: string;
  @IsOptional() @IsString() @MaxLength(60) twitter?: string;

  // Assinatura
  @IsOptional()
  monthlyPrice?: number;
  @IsOptional()
  quarterlyDiscount?: number;
  @IsOptional()
  semesterDiscount?: number;
}

@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get('wallet')
  async wallet(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getWallet(user.id);
  }

  @Get('transactions')
  async transactions(@CurrentUser() user: AuthenticatedUser, @Query('limit') limit?: string) {
    return this.meService.getTransactions(user.id, limit ? Number(limit) : 30);
  }

  @Get('subscriptions')
  async subscriptions(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getMySubscriptions(user.id);
  }

  @Get('activity')
  async activity(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getActivity(user.id);
  }

  @Get('saved')
  async saved(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getSavedPosts(user.id);
  }

  @Get('preferences')
  async preferences(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getPreferences(user.id);
  }

  @Post('preferences')
  async setPreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: { theme?: 'light' | 'dark'; language?: string; emailNotifications?: boolean; pushNotifications?: boolean },
  ) {
    return this.meService.setPreferences(user.id, dto);
  }

  @Post('like/:postId')
  async like(@CurrentUser() user: AuthenticatedUser, @Param('postId') postId: string) {
    return this.meService.toggleLike(user.id, postId);
  }

  @Get('summary')
  async summary(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getSummary(user.id);
  }

  @Get('posts')
  async ownPosts(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: 'published' | 'scheduled' | 'archived',
    @Query('type') type?: 'post' | 'media',
  ) {
    return this.meService.getOwnPosts(user.id, status ?? 'published', type ?? 'post');
  }

  @Patch('edit')
  async edit(@CurrentUser() user: AuthenticatedUser, @Body() dto: EditProfileDto) {
    return this.meService.editProfile(user.id, dto);
  }

  @Post('verify-request')
  async verifyRequest(@CurrentUser() user: AuthenticatedUser, @Body() dto: VerifyRequestDto) {
    return this.meService.requestVerification(user.id, dto);
  }

  @Get('verify-status')
  async verifyStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getVerificationStatus(user.id);
  }

  @Post('become-creator')
  async becomeCreator(@CurrentUser() user: AuthenticatedUser, @Body() dto: BecomeCreatorDto) {
    return this.meService.becomeCreator(user.id, dto);
  }
}
