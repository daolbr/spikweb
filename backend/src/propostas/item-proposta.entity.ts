import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Proposta } from './proposta.entity';

// Corresponde à antiga SPM_ITEM.
@Entity('itens_proposta')
export class ItemProposta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'proposta_id' })
  propostaId: string;

  @ManyToOne(() => Proposta, (proposta) => proposta.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proposta_id' })
  proposta: Proposta;

  @Column({ length: 150 })
  descricao: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 1 })
  quantidade: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'valor_unitario' })
  valorUnitario: number;
}
