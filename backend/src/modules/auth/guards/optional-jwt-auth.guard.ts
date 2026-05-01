/**
 * Guard que tenta autenticar via JWT mas NÃO falha se o token estiver ausente.
 * Permite que rotas públicas (feed, em-alta) sejam personalizadas para o usuário
 * quando ele estiver logado.
 */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<T = unknown>(err: unknown, user: T): T {
    return user;
  }
}
