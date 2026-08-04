import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Oportunidade } from './oportunidade.entity';
import { ClasseProspect } from './estagio-funil.enum';

// Corresponde à antiga SPM_HISTOPOR: registro de acompanhamento/interação
// ao longo da vida de uma oportunidade. No sistema legado, cada
// acompanhamento é o momento em que o vendedor reavalia a oportunidade —
// por isso carrega sua própria "fotografia" de valor, confiabilidade e
// previsão de fechamento, não é só uma anotação de texto.
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

  // --- fotografia da avaliação neste acompanhamento ---

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  valor: number | null;

  @Column({ type: 'int', nullable: true })
  confiabilidade: number | null;

  @Column({ type: 'date', name: 'previsao_fechamento', nullable: true })
  previsaoFechamento: string | null;

  @Column({ type: 'enum', enum: ClasseProspect, nullable: true })
  classificacao: ClasseProspect | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
