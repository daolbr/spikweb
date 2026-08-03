import { Controller, Get, UseGuards } from '@nestjs/common';
import { IndicadoresService } from './indicadores.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('indicadores')
export class IndicadoresController {
  constructor(private readonly indicadoresService: IndicadoresService) {}

  @Get('resumo')
  resumo() {
    return this.indicadoresService.resumo();
  }
}
