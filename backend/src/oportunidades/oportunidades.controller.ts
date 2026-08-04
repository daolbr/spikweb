import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
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

  @Post(':id/proposta-arquivo')
  @UseInterceptors(FileInterceptor('arquivo', { limits: { fileSize: 10 * 1024 * 1024 } }))
  anexarProposta(@Param('id') id: string, @UploadedFile() arquivo: Express.Multer.File) {
    return this.oportunidadesService.anexarProposta(id, arquivo);
  }

  @Get(':id/proposta-arquivo')
  async baixarProposta(@Param('id') id: string, @Res() res: Response) {
    const { arquivo, nome, tipo } = await this.oportunidadesService.baixarProposta(id);
    res.setHeader('Content-Type', tipo);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(nome)}"`);
    res.send(arquivo);
  }

  @Delete(':id/proposta-arquivo')
  removerProposta(@Param('id') id: string) {
    return this.oportunidadesService.removerProposta(id);
  }
}
