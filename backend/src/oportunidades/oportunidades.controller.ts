import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OportunidadesService } from './oportunidades.service';
import {
  CriarOportunidadeDto,
  AtualizarOportunidadeDto,
  MudarEstagioDto,
  CriarHistoricoDto,
} from './dto/oportunidade.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('oportunidades')
export class OportunidadesController {
  constructor(private readonly oportunidadesService: OportunidadesService) {}

  // Formato agrupado por estágio, pronto para renderizar o Kanban.
  @Get('funil')
  listarFunil(@Query('empresaId') empresaId?: string) {
    return this.oportunidadesService.listarFunil(empresaId);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.oportunidadesService.buscarPorId(id);
  }

  @Post()
  criar(@Body() dto: CriarOportunidadeDto) {
    return this.oportunidadesService.criar(dto);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarOportunidadeDto) {
    return this.oportunidadesService.atualizar(id, dto);
  }

  @Patch(':id/estagio')
  mudarEstagio(@Param('id') id: string, @Body() dto: MudarEstagioDto) {
    return this.oportunidadesService.mudarEstagio(id, dto);
  }

  @Post(':id/historico')
  adicionarHistorico(@Param('id') id: string, @Body() dto: CriarHistoricoDto) {
    return this.oportunidadesService.adicionarHistorico(id, dto);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.oportunidadesService.remover(id);
  }
}
