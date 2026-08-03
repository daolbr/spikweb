import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { PapelUsuario } from '../usuario.entity';

export class CriarUsuarioDto {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsOptional()
  @IsEnum(PapelUsuario)
  papel?: PapelUsuario;
}
