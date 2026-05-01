import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../types/enums';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isAgeVerified: boolean;
  isVerified: boolean;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthenticatedUser;
  },
);
