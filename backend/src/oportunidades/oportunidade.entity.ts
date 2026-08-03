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
import { EstagioFunil } from './estagio-funil.enum';
import { HistoricoOportunidade } from './historico-oportunidade.entity';

// Corresponde à antiga SPM_OPORTUNIDADE. Sempre filha de uma Empresa;
// contato é opcional (pode não haver ainda um interlocutor definido).
@Entity('oportunidades')
export class Oportunidade {
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

  @Column({
    type: 'enum',
    enum: EstagioFunil,
    default: EstagioFunil.PROSPECCAO,
  })
  estagio: EstagioFunil;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  valor: number;

  @Column({ type: 'date', name: 'previsao_fechamento', nullable: true })
  previsaoFechamento: string | null;

  @Column({ length: 80, nullable: true })
  origem: string | null;

  @Column({ type: 'text', nullable: true })
  motivoPerda: string | null;

  @OneToMany(() => HistoricoOportunidade, (h) => h.oportunidade)
  historico: HistoricoOportunidade[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
