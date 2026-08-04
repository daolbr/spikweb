import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AutomacoesService } from './automacoes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CronSecretGuard } from './cron-secret.guard';

@Controller('automacoes')
export class AutomacoesController {
  constructor(private readonly service: AutomacoesService) {}

  @Get('perfil-ideal')
  @UseGuards(JwtAuthGuard)
  perfilIdeal() {
    return this.service.perfilIdeal();
  }

  @Get('prospects-sugeridos')
  @UseGuards(JwtAuthGuard)
  prospectsSugeridos(@Query('limite') limite?: string) {
    return this.service.prospectsSugeridos(limite ? Number(limite) : 20);
  }

  // Disparo manual, por um usuário logado (ex.: botão "Gerar agora" na tela).
  @Post('gerar-renovacoes')
  @UseGuards(JwtAuthGuard)
  gerarRenovacoesManual() {
    return this.service.gerarRenovacoes();
  }

  // Disparo automático diário pelo Vercel Cron (ver "crons" no vercel.json).
  // Vercel Cron sempre chama via GET e envia o header Authorization com o
  // CRON_SECRET configurado nas variáveis de ambiente do projeto.
  @Get('cron/gerar-renovacoes')
  @UseGuards(CronSecretGuard)
  gerarRenovacoesCron() {
    return this.service.gerarRenovacoes();
  }
}
