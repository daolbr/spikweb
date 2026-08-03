import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empresa } from '../empresas/empresa.entity';

export enum StatusProjeto {
  PLANEJADO = 'PLANEJADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

// Corresponde à antiga SPM_PROJETO (e cobre também o papel de SPM_JOB
// do legado, tratado aqui como o mesmo conceito simplificado).
@Entity('projetos')
export class Projeto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nome: string;

  @Column({ name: 'empresa_id' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ type: 'enum', enum: StatusProjeto, default: StatusProjeto.PLANEJADO })
  status: StatusProjeto;

  @Column({ type: 'date', name: 'data_inicio', nullable: true })
  dataInicio: string | null;

  @Column({ type: 'date', name: 'data_fim', nullable: true })
  dataFim: string | null;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
