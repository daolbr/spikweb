import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { TipoAtividade } from '../atividade.enums';

export class CriarAtividadeDto {
  @IsString()
  @MinLength(2)
  titulo: string;

  @IsEnum(TipoAtividade)
  tipo: TipoAtividade;

  @IsUUID()
  empresaId: string;

  @IsOptional()
  @IsUUID()
  contatoId?: string;

  @IsOptional()
  @IsUUID()
  oportunidadeId?: string;

  @IsOptional()
  @IsUUID()
  responsavelId?: string;

  @IsISO8601()
  dataInicio: string;

  @IsOptional()
  @IsISO8601()
  dataFim?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class AtualizarAtividadeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  titulo?: string;

  @IsOptional()
  @IsEnum(TipoAtividade)
  tipo?: TipoAtividade;

  @IsOptional()
  @IsISO8601()
  dataInicio?: string;

  @IsOptional()
  @IsISO8601()
  dataFim?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
