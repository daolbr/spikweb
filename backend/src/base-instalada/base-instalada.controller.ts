import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { BaseInstaladaService } from './base-instalada.service';
import { CriarBaseInstaladaDto, AtualizarBaseInstaladaDto } from './dto/base-instalada.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('base-instalada')
export class BaseInstaladaController {
  constructor(private readonly service: BaseInstaladaService) {}

  @Get()
  listar(@Query('empresaId') empresaId?: string) {
    return this.service.listar(empresaId);
  }

  @Get('proximas-renovacoes')
  proximasRenovacoes(@Query('dias') dias?: string) {
    return this.service.proximasRenovacoes(dias ? Number(dias) : 60);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }

  @Post()
  criar(@Body() dto: CriarBaseInstaladaDto) {
    return this.service.criar(dto);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarBaseInstaladaDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.service.remover(id);
  }
}
