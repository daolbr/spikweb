import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EntidadeCustomizavel, TipoCampoCustomizado } from '../campos-customizados.enums';
import { PapelUsuario } from '../../usuarios/usuario.entity';

export class CriarCampoCustomizadoDto {
  @IsEnum(EntidadeCustomizavel)
  entidade: EntidadeCustomizavel;

  @IsString()
  @MinLength(2)
  rotulo: string;

  @IsEnum(TipoCampoCustomizado)
  tipo: TipoCampoCustomizado;

  @IsOptional()
  @IsString()
  opcoesLista?: string;

  @IsOptional()
  @IsBoolean()
  obrigatorio?: boolean;
}

export class AtualizarCampoCustomizadoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  rotulo?: string;

  @IsOptional()
  @IsString()
  opcoesLista?: string;

  @IsOptional()
  @IsBoolean()
  obrigatorio?: boolean;

  @IsOptional()
  @IsInt()
  ordem?: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class PermissaoCampoDto {
  @IsEnum(PapelUsuario)
  papel: PapelUsuario;

  @IsBoolean()
  podeVer: boolean;

  @IsBoolean()
  podeEditar: boolean;
}

export class AtualizarPermissoesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissaoCampoDto)
  permissoes: PermissaoCampoDto[];
}

export class ValorCampoDto {
  @IsUUID()
  campoId: string;

  @IsOptional()
  @IsString()
  valor?: string | null;
}

export class SalvarValoresDto {
  @IsEnum(EntidadeCustomizavel)
  entidade: EntidadeCustomizavel;

  @IsUUID()
  entidadeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValorCampoDto)
  valores: ValorCampoDto[];
}
