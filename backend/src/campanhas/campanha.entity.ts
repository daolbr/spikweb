import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum StatusCampanha {
  PLANEJADA = 'PLANEJADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

// Corresponde à antiga SPM_CAMPANHA. Não modelamos como filha obrigatória
// de Empresa aqui: campanhas de marketing tipicamente atingem múltiplas
// empresas/contatos, diferente do padrão do restante do sistema.
@Entity('campanhas')
export class Campanha {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nome: string;

  @Column({ type: 'enum', enum: StatusCampanha, default: StatusCampanha.PLANEJADA })
  status: StatusCampanha;

  @Column({ type: 'date', name: 'data_inicio', nullable: true })
  dataInicio: string | null;

  @Column({ type: 'date', name: 'data_fim', nullable: true })
  dataFim: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  orcamento: number | null;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
