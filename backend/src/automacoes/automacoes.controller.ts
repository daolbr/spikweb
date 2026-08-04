import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AutomacoesService } from './automacoes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('automacoes')
export class AutomacoesController {
  constructor(private readonly service: AutomacoesService) {}

  @Get('perfil-ideal')
  perfilIdeal() {
    return this.service.perfilIdeal();
  }

  @Get('prospects-sugeridos')
  prospectsSugeridos(@Query('limite') limite?: string) {
    return this.service.prospectsSugeridos(limite ? Number(limite) : 20);
  }

  // Pensado para ser chamado por um Vercel Cron diário (ver vercel.json do
  // backend). Também pode ser disparado manualmente por um ADMIN.
  @Post('gerar-renovacoes')
  gerarRenovacoes() {
    return this.service.gerarRenovacoes();
  }
}
