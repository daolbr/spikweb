import { IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CriarBaseInstaladaDto {
  @IsString()
  @MinLength(2)
  produtoServico: string;

  @IsUUID()
  empresaId: string;

  @IsOptional()
  @IsUUID()
  oportunidadeId?: string;

  @IsISO8601()
  dataVenda: string;

  @IsOptional()
  @IsISO8601()
  dataRenovacao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class AtualizarBaseInstaladaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  produtoServico?: string;

  @IsOptional()
  @IsUUID()
  oportunidadeId?: string;

  @IsOptional()
  @IsISO8601()
  dataVenda?: string;

  @IsOptional()
  @IsISO8601()
  dataRenovacao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
