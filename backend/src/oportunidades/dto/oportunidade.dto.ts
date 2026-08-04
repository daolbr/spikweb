import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { EstagioFunil, ClasseProspect } from '../estagio-funil.enum';

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
  @IsInt()
  @Min(0)
  @Max(100)
  confiabilidade?: number;

  @IsOptional()
  @IsISO8601()
  previsaoFechamento?: string;

  @IsOptional()
  @IsEnum(ClasseProspect)
  classificacao?: ClasseProspect;

  @IsOptional()
  @IsUUID()
  vendedorId?: string;

  @IsOptional()
  @IsUUID()
  especialistaId?: string;

  @IsOptional()
  @IsString()
  vertical?: string;

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
  @IsUUID()
  vendedorId?: string;

  @IsOptional()
  @IsUUID()
  especialistaId?: string;

  @IsOptional()
  @IsString()
  vertical?: string;

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

// Registrar um acompanhamento é o mecanismo central do legado para
// reavaliar a oportunidade: além da anotação, pode atualizar valor,
// confiabilidade, previsão de fechamento e classificação — que passam
// a ser os novos valores "atuais" da oportunidade (ver nota na entidade).
export class CriarHistoricoDto {
  @IsString()
  @MinLength(2)
  anotacao: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  confiabilidade?: number;

  @IsOptional()
  @IsISO8601()
  previsaoFechamento?: string;

  @IsOptional()
  @IsEnum(ClasseProspect)
  classificacao?: ClasseProspect;
}
