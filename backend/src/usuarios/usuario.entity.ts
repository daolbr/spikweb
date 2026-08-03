import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

// Corresponde à antiga SPM_USERS. Papéis substituem, de forma simplificada,
// o motor de regras/permissões dinâmicas do legado (SPM_REGRA + SPM_RESTRITAB).
// Ver plano_migracao_spik_crm.md, seção 5, para o racional dessa decisão.
export enum PapelUsuario {
  ADMIN = 'ADMIN',
  GESTOR = 'GESTOR',
  VENDEDOR = 'VENDEDOR',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  nome: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ name: 'senha_hash' })
  senhaHash: string;

  @Column({
    type: 'enum',
    enum: PapelUsuario,
    default: PapelUsuario.VENDEDOR,
  })
  papel: PapelUsuario;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
