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
import { EmpresasService } from './empresas.service';
import { CriarEmpresaDto, AtualizarEmpresaDto } from './dto/empresa.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PapeisGuard } from '../common/guards/papeis.guard';
import { Papeis } from '../common/decorators/papeis.decorator';
import { PapelUsuario } from '../usuarios/usuario.entity';

@UseGuards(JwtAuthGuard, PapeisGuard)
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get()
  listar(
    @Query('busca') busca?: string,
    @Query('pagina') pagina?: string,
    @Query('tamanhoPagina') tamanhoPagina?: string,
  ) {
    return this.empresasService.listar(
      busca,
      pagina ? Number(pagina) : 1,
      tamanhoPagina ? Number(tamanhoPagina) : 20,
    );
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.empresasService.buscarPorId(id);
  }

  @Post()
  criar(@Body() dto: CriarEmpresaDto) {
    return this.empresasService.criar(dto);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarEmpresaDto) {
    return this.empresasService.atualizar(id, dto);
  }

  @Delete(':id')
  @Papeis(PapelUsuario.ADMIN, PapelUsuario.GESTOR)
  remover(@Param('id') id: string) {
    return this.empresasService.remover(id);
  }
}
