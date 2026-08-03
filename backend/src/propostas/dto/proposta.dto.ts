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
import { StatusProposta } from '../status-proposta.enum';

export class CriarPropostaDto {
  @IsString()
  @MinLength(2)
  titulo: string;

  @IsUUID()
  empresaId: string;

  @IsOptional()
  @IsUUID()
  contatoId?: string;

  @IsOptional()
  @IsUUID()
  oportunidadeId?: string;

  @IsOptional()
  @IsISO8601()
  validade?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class AtualizarPropostaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  titulo?: string;

  @IsOptional()
  @IsISO8601()
  validade?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class MudarStatusPropostaDto {
  @IsEnum(StatusProposta)
  status: StatusProposta;
}

export class CriarItemPropostaDto {
  @IsString()
  @MinLength(1)
  descricao: string;

  @IsNumber()
  @Min(0.01)
  quantidade: number;

  @IsNumber()
  @Min(0)
  valorUnitario: number;
}
