import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CamposCustomizadosService } from './campos-customizados.service';
import {
  CriarCampoCustomizadoDto,
  AtualizarCampoCustomizadoDto,
  AtualizarPermissoesDto,
  SalvarValoresDto,
} from './dto/campos-customizados.dto';
import { EntidadeCustomizavel } from './campos-customizados.enums';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PapeisGuard } from '../common/guards/papeis.guard';
import { Papeis } from '../common/decorators/papeis.decorator';
import { PapelUsuario } from '../usuarios/usuario.entity';

@UseGuards(JwtAuthGuard, PapeisGuard)
@Controller('campos-customizados')
export class CamposCustomizadosController {
  constructor(private readonly service: CamposCustomizadosService) {}

  // --- Administração (só ADMIN pode criar/editar a definição dos campos) ---

  @Get()
  @Papeis(PapelUsuario.ADMIN)
  listar(@Query('entidade') entidade: EntidadeCustomizavel) {
    return this.service.listarPorEntidade(entidade);
  }

  @Post()
  @Papeis(PapelUsuario.ADMIN)
  criar(@Body() dto: CriarCampoCustomizadoDto) {
    return this.service.criar(dto);
  }

  @Patch(':id')
  @Papeis(PapelUsuario.ADMIN)
  atualizar(@Param('id') id: string, @Body() dto: AtualizarCampoCustomizadoDto) {
    return this.service.atualizar(id, dto);
  }

  @Put(':id/permissoes')
  @Papeis(PapelUsuario.ADMIN)
  atualizarPermissoes(@Param('id') id: string, @Body() dto: AtualizarPermissoesDto) {
    return this.service.atualizarPermissoes(id, dto);
  }

  @Delete(':id')
  @Papeis(PapelUsuario.ADMIN)
  remover(@Param('id') id: string) {
    return this.service.remover(id);
  }

  // --- Uso operacional (qualquer usuário autenticado, filtrado por permissão) ---

  @Get('valores')
  buscarValores(
    @Query('entidade') entidade: EntidadeCustomizavel,
    @Query('entidadeId') entidadeId: string,
    @Req() req: any,
  ) {
    return this.service.buscarValoresParaEntidade(entidade, entidadeId, req.user.papel);
  }

  @Put('valores')
  salvarValores(@Body() dto: SalvarValoresDto, @Req() req: any) {
    return this.service.salvarValores(dto, req.user.papel);
  }
}
