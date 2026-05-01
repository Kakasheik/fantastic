import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('top')
  async top(@Query('limit') limit?: string) {
    return this.usersService.topCreators(limit ? Number(limit) : 6);
  }

  @Get('offers')
  async offers(@Query('limit') limit?: string) {
    return this.usersService.subscriptionOffers(limit ? Number(limit) : 12);
  }

  /** /em-alta — agrega 7 seções (top, gratuitos, mimadas, rising, posts, chat, lives). */
  @Get('em-alta')
  async emAlta() {
    return this.usersService.emAlta();
  }

  @Get(':username')
  @UseGuards(OptionalJwtAuthGuard)
  async profile(@Param('username') username: string, @Req() req: Request) {
    const viewerId = (req.user as AuthenticatedUser | undefined)?.id;
    return this.usersService.findCreatorByUsername(username, viewerId);
  }
}
