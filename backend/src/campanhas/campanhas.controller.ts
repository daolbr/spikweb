import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { CampanhasService } from './campanhas.service';
import { CriarCampanhaDto, AtualizarCampanhaDto } from './dto/campanha.dto';
import { StatusCampanha } from './campanha.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

class MudarStatusCampanhaDto {
  @IsEnum(StatusCampanha)
  status: StatusCampanha;
}

@UseGuards(JwtAuthGuard)
@Controller('campanhas')
export class CampanhasController {
  constructor(private readonly campanhasService: CampanhasService) {}

  @Get()
  listar() {
    return this.campanhasService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.campanhasService.buscarPorId(id);
  }

  @Post()
  criar(@Body() dto: CriarCampanhaDto) {
    return this.campanhasService.criar(dto);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarCampanhaDto) {
    return this.campanhasService.atualizar(id, dto);
  }

  @Patch(':id/status')
  mudarStatus(@Param('id') id: string, @Body() dto: MudarStatusCampanhaDto) {
    return this.campanhasService.mudarStatus(id, dto.status);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.campanhasService.remover(id);
  }
}
