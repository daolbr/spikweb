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
import { Oportunidade } from '../oportunidades/oportunidade.entity';

// Registro do que foi efetivamente vendido/instalado no cliente — o que
// o legado tratava em SPM_PROADQUIRIDO ("Produtos Adquiridos"). Cada item
// pode apontar para a oportunidade que deu origem à venda, e carrega data
// de venda + data de renovação (para acompanhar contratos recorrentes).
@Entity('base_instalada')
export class BaseInstalada {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150, name: 'produto_servico' })
  produtoServico: string;

  @Column({ name: 'empresa_id' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'oportunidade_id', nullable: true })
  oportunidadeId: string | null;

  @ManyToOne(() => Oportunidade, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'oportunidade_id' })
  oportunidade: Oportunidade | null;

  @Column({ type: 'date', name: 'data_venda' })
  dataVenda: string;

  @Column({ type: 'date', name: 'data_renovacao', nullable: true })
  dataRenovacao: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  valor: number | null;

  @Column({ type: 'text', nullable: true })
  observacoes: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
