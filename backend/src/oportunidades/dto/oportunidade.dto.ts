import {
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { EstagioFunil } from '../estagio-funil.enum';

export class CriarOportunidadeDto {
  @IsString()
  @MinLength(2)
  titulo: string;

  @IsUUID()
  empresaId: string;

  @IsOptional()
  @IsUUID()
  contatoId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;

  @IsOptional()
  @IsISO8601()
  previsaoFechamento?: string;

  @IsOptional()
  @IsString()
  origem?: string;
}

export class AtualizarOportunidadeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  titulo?: string;

  @IsOptional()
  @IsUUID()
  contatoId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;

  @IsOptional()
  @IsISO8601()
  previsaoFechamento?: string;

  @IsOptional()
  @IsString()
  origem?: string;
}

export class MudarEstagioDto {
  @IsEnum(EstagioFunil)
  estagio: EstagioFunil;

  @IsOptional()
  @IsString()
  motivoPerda?: string;

  @IsOptional()
  @IsString()
  anotacao?: string;
}

export class CriarHistoricoDto {
  @IsString()
  @MinLength(2)
  anotacao: string;
}
