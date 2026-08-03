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
import { AtividadesService } from './atividades.service';
import { CriarAtividadeDto, AtualizarAtividadeDto } from './dto/atividade.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('atividades')
export class AtividadesController {
  constructor(private readonly atividadesService: AtividadesService) {}

  @Get()
  listar(
    @Query('empresaId') empresaId?: string,
    @Query('oportunidadeId') oportunidadeId?: string,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
  ) {
    return this.atividadesService.listar({ empresaId, oportunidadeId, de, ate });
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.atividadesService.buscarPorId(id);
  }

  @Post()
  criar(@Body() dto: CriarAtividadeDto) {
    return this.atividadesService.criar(dto);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarAtividadeDto) {
    return this.atividadesService.atualizar(id, dto);
  }

  @Patch(':id/concluir')
  concluir(@Param('id') id: string) {
    return this.atividadesService.concluir(id);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.atividadesService.cancelar(id);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.atividadesService.remover(id);
  }
}
