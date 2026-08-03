import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CriarUsuarioDto } from '../usuarios/dto/criar-usuario.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.senha);
  }

  // Endpoint de cadastro aberto apenas para bootstrap do primeiro usuário/demo.
  // Em produção, criação de usuário deve exigir papel ADMIN autenticado.
  @Post('registrar')
  async registrar(@Body() dto: CriarUsuarioDto) {
    const usuario = await this.usuariosService.criar(dto);
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
    };
  }
}
