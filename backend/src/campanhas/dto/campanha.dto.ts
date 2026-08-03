import { IsISO8601, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CriarCampanhaDto {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsOptional()
  @IsISO8601()
  dataInicio?: string;

  @IsOptional()
  @IsISO8601()
  dataFim?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  orcamento?: number;

  @IsOptional()
  @IsString()
  descricao?: string;
}

export class AtualizarCampanhaDto {
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
  @IsNumber()
  @Min(0)
  orcamento?: number;

  @IsOptional()
  @IsString()
  descricao?: string;
}
