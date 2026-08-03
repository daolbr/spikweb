import { IsISO8601, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CriarProjetoDto {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsUUID()
  empresaId: string;

  @IsOptional()
  @IsISO8601()
  dataInicio?: string;

  @IsOptional()
  @IsISO8601()
  dataFim?: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}

export class AtualizarProjetoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @IsOptional()
  @IsISO8601()
  dataInicio?: string;

  @IsOptional()
  @IsISO8601()
  dataFim?: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}
