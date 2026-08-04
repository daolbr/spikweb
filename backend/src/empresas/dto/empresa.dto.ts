import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { PorteEmpresa } from '../empresa.entity';

const REGEX_CNPJ = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/;

export class CriarEmpresaDto {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsOptional()
  @IsString()
  @Matches(REGEX_CNPJ, { message: 'CNPJ em formato inválido. Use XX.XXX.XXX/XXXX-XX ou só números.' })
  cnpj?: string;

  @IsOptional()
  @IsString()
  segmento?: string;

  @IsOptional()
  @IsEnum(PorteEmpresa)
  porte?: PorteEmpresa;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  uf?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  site?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class AtualizarEmpresaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @IsOptional()
  @IsString()
  @Matches(REGEX_CNPJ, { message: 'CNPJ em formato inválido. Use XX.XXX.XXX/XXXX-XX ou só números.' })
  cnpj?: string;

  @IsOptional()
  @IsString()
  segmento?: string;

  @IsOptional()
  @IsEnum(PorteEmpresa)
  porte?: PorteEmpresa;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  uf?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  site?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
