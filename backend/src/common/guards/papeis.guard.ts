import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PAPEIS_KEY } from '../decorators/papeis.decorator';
import { PapelUsuario } from '../../usuarios/usuario.entity';

@Injectable()
export class PapeisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const papeisPermitidos = this.reflector.getAllAndOverride<PapelUsuario[]>(
      PAPEIS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!papeisPermitidos || papeisPermitidos.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !papeisPermitidos.includes(user.papel)) {
      throw new ForbiddenException('Você não tem permissão para esta ação.');
    }
    return true;
  }
}
