import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PostsService } from './posts.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('feed')
  @UseGuards(OptionalJwtAuthGuard)
  async feed(
    @Req() req: Request,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('creatorUsername') creatorUsername?: string,
  ) {
    const viewerId = (req.user as AuthenticatedUser | undefined)?.id;
    return this.postsService.getFeed(viewerId, {
      cursor,
      limit: limit ? Number(limit) : 20,
      creatorUsername,
    });
  }
}
