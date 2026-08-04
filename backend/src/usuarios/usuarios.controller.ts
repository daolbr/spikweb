import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  async listar() {
    const usuarios = await this.usuariosService.listar();
    // Nunca devolve o hash de senha, mesmo internamente sendo só para seletores.
    return usuarios.map(({ senhaHash, ...resto }) => resto);
  }
}
