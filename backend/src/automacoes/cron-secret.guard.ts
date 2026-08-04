import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

// O Vercel Cron Jobs envia automaticamente o header
// "Authorization: Bearer <CRON_SECRET>" em toda chamada agendada, desde
// que a variável de ambiente CRON_SECRET esteja configurada no projeto.
// Este guard confere isso em vez do JWT normal de usuário — não existe
// usuário logado quando o cron dispara.
@Injectable()
export class CronSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const segredo = process.env.CRON_SECRET;
    if (!segredo) {
      // Sem segredo configurado, recusa por padrão — mais seguro do que
      // deixar um endpoint de automação aberto sem querer.
      throw new UnauthorizedException('CRON_SECRET não configurado no servidor.');
    }

    const req = context.switchToHttp().getRequest();
    const cabecalho = req.headers['authorization'];
    if (cabecalho !== `Bearer ${segredo}`) {
      throw new UnauthorizedException('Segredo de cron inválido.');
    }
    return true;
  }
}
