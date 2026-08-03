import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Oportunidade } from './oportunidade.entity';

// Corresponde à antiga SPM_HISTOPOR: registro de acompanhamento/interação
// ao longo da vida de uma oportunidade (ligação, reunião, e-mail, etc).
@Entity('historico_oportunidades')
export class HistoricoOportunidade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'oportunidade_id' })
  oportunidadeId: string;

  @ManyToOne(() => Oportunidade, (o) => o.historico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'oportunidade_id' })
  oportunidade: Oportunidade;

  @Column({ type: 'text' })
  anotacao: string;

  @Column({ name: 'estagio_no_momento', nullable: true })
  estagioNoMomento: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
