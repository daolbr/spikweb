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
import { PropostasService } from './propostas.service';
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
  constructor(private readonly propostasService: PropostasService) {}

  @Get()
  listar(@Query('empresaId') empresaId?: string) {
    return this.propostasService.listarPorEmpresa(empresaId);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.propostasService.buscarPorId(id);
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
