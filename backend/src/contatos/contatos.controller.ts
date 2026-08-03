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
import { ContatosService } from './contatos.service';
import { CriarContatoDto, AtualizarContatoDto } from './dto/contato.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('contatos')
export class ContatosController {
  constructor(private readonly contatosService: ContatosService) {}

  @Get()
  listarPorEmpresa(@Query('empresaId') empresaId: string) {
    return this.contatosService.listarPorEmpresa(empresaId);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.contatosService.buscarPorId(id);
  }

  @Post()
  criar(@Body() dto: CriarContatoDto) {
    return this.contatosService.criar(dto);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarContatoDto) {
    return this.contatosService.atualizar(id, dto);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.contatosService.remover(id);
  }
}
