import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Empresa } from '../empresas/empresa.entity';
import { Contato } from '../contatos/contato.entity';
import { Oportunidade } from '../oportunidades/oportunidade.entity';
import { StatusProposta } from './status-proposta.enum';
import { ItemProposta } from './item-proposta.entity';

// Corresponde à antiga SPM_PROPOSTA. valorTotal é denormalizado e
// recalculado a cada alteração de item (ver PropostasService.recalcularTotal).
@Entity('propostas')
export class Proposta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  titulo: string;

  @Column({ name: 'empresa_id' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'contato_id', nullable: true })
  contatoId: string | null;

  @ManyToOne(() => Contato, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'contato_id' })
  contato: Contato | null;

  @Column({ name: 'oportunidade_id', nullable: true })
  oportunidadeId: string | null;

  @ManyToOne(() => Oportunidade, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'oportunidade_id' })
  oportunidade: Oportunidade | null;

  @Column({ type: 'enum', enum: StatusProposta, default: StatusProposta.RASCUNHO })
  status: StatusProposta;

  @Column({ type: 'date', nullable: true })
  validade: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0, name: 'valor_total' })
  valorTotal: number;

  @Column({ type: 'text', nullable: true })
  observacoes: string | null;

  @OneToMany(() => ItemProposta, (item) => item.proposta, { cascade: true })
  itens: ItemProposta[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
