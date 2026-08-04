import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CampoCustomizado } from './campo-customizado.entity';
import { PapelUsuario } from '../usuarios/usuario.entity';

// Corresponde à antiga SPM_RESTRITAB/SPM_RESTRICPO do legado: regra de
// visibilidade/edição de um campo específico, por papel de usuário.
// Ausência de linha para um (campo, papel) = permissivo por padrão
// (ver CamposCustomizadosService.padraoPermissao).
@Entity('permissoes_campo')
export class PermissaoCampo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'campo_id' })
  campoId: string;

  @ManyToOne(() => CampoCustomizado, (c) => c.permissoes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campo_id' })
  campo: CampoCustomizado;

  @Column({ type: 'enum', enum: PapelUsuario })
  papel: PapelUsuario;

  @Column({ name: 'pode_ver', default: true })
  podeVer: boolean;

  @Column({ name: 'pode_editar', default: true })
  podeEditar: boolean;
}
