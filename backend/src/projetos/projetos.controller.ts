import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { ProjetosService } from './projetos.service';
import { CriarProjetoDto, AtualizarProjetoDto } from './dto/projeto.dto';
import { StatusProjeto } from './projeto.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

class MudarStatusProjetoDto {
  @IsEnum(StatusProjeto)
  status: StatusProjeto;
}

@UseGuards(JwtAuthGuard)
@Controller('projetos')
export class ProjetosController {
  constructor(private readonly projetosService: ProjetosService) {}

  @Get()
  listar(@Query('empresaId') empresaId?: string) {
    return this.projetosService.listar(empresaId);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.projetosService.buscarPorId(id);
  }

  @Post()
  criar(@Body() dto: CriarProjetoDto) {
    return this.projetosService.criar(dto);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarProjetoDto) {
    return this.projetosService.atualizar(id, dto);
  }

  @Patch(':id/status')
  mudarStatus(@Param('id') id: string, @Body() dto: MudarStatusProjetoDto) {
    return this.projetosService.mudarStatus(id, dto.status);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.projetosService.remover(id);
  }
}
