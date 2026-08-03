import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CriarContatoDto {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  celular?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsUUID()
  empresaId: string;
}

export class AtualizarContatoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  celular?: string;

  @IsOptional()
  @IsString()
  cargo?: string;
}
