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

  // Equivalente ao "quadrototais" do legado — pipeline segmentado por classe.
  @Get('quadro-totais')
  quadroTotais(
    @Query('vendedorId') vendedorId?: string,
    @Query('especialistaId') especialistaId?: string,
    @Query('vertical') vertical?: string,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
  ) {
    return this.oportunidadesService.quadroTotais({ vendedorId, especialistaId, vertical, de, ate });
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
