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
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { PropostasService } from './propostas.service';
import { PropostaPdfService } from './proposta-pdf.service';
import {
  CriarPropostaDto,
  AtualizarPropostaDto,
  MudarStatusPropostaDto,
  CriarItemPropostaDto,
} from './dto/proposta.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('propostas')
export class PropostasController {
  constructor(
    private readonly propostasService: PropostasService,
    private readonly propostaPdfService: PropostaPdfService,
  ) {}

  @Get()
  listar(@Query('empresaId') empresaId?: string) {
    return this.propostasService.listarPorEmpresa(empresaId);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.propostasService.buscarPorId(id);
  }

  @Get(':id/pdf')
  async baixarPdf(@Param('id') id: string, @Res() res: Response) {
    const proposta = await this.propostasService.buscarPorId(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="proposta-${proposta.id.slice(0, 8)}.pdf"`,
    );
    const doc = this.propostaPdfService.gerar(proposta);
    doc.pipe(res);
  }

  @Post()
  criar(@Body() dto: CriarPropostaDto) {
    return this.propostasService.criar(dto);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarPropostaDto) {
    return this.propostasService.atualizar(id, dto);
  }

  @Patch(':id/status')
  mudarStatus(@Param('id') id: string, @Body() dto: MudarStatusPropostaDto) {
    return this.propostasService.mudarStatus(id, dto);
  }

  @Post(':id/itens')
  adicionarItem(@Param('id') id: string, @Body() dto: CriarItemPropostaDto) {
    return this.propostasService.adicionarItem(id, dto);
  }

  @Delete(':id/itens/:itemId')
  removerItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.propostasService.removerItem(id, itemId);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.propostasService.remover(id);
  }
}
