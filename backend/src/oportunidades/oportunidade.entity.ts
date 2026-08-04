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
import { Usuario } from '../usuarios/usuario.entity';
import { EstagioFunil, ClasseProspect } from './estagio-funil.enum';
import { HistoricoOportunidade } from './historico-oportunidade.entity';

// Corresponde à antiga SPM_OPORTUNIDADE. Sempre filha de uma Empresa;
// contato é opcional (pode não haver ainda um interlocutor definido).
//
// IMPORTANTE: valor, confiabilidade, previsaoFechamento e classificacao
// são campos "cache" — sempre espelham o checkpoint (HistoricoOportunidade)
// mais recente, replicando o padrão spm_lasthistopor do sistema legado.
// A fonte da verdade é o histórico; esses campos existem na oportunidade
// só para leitura rápida (listagem, Kanban) sem precisar de JOIN.
// Toda escrita neles deve passar por OportunidadesService.adicionarHistorico.
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

  // --- campos "cache" do checkpoint mais recente (ver nota acima) ---

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  valor: number;

  @Column({ type: 'int', nullable: true })
  confiabilidade: number | null;

  @Column({ type: 'date', name: 'previsao_fechamento', nullable: true })
  previsaoFechamento: string | null;

  @Column({ type: 'enum', enum: ClasseProspect, nullable: true })
  classificacao: ClasseProspect | null;

  // --- responsáveis (o legado tinha vendedor + especialista, dois papéis) ---

  @Column({ name: 'vendedor_id', nullable: true })
  vendedorId: string | null;

  @ManyToOne(() => Usuario, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'vendedor_id' })
  vendedor: Usuario | null;

  @Column({ name: 'especialista_id', nullable: true })
  especialistaId: string | null;

  @ManyToOne(() => Usuario, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'especialista_id' })
  especialista: Usuario | null;

  @Column({ length: 80, nullable: true })
  vertical: string | null;

  @Column({ length: 80, nullable: true })
  origem: string | null;

  @Column({ type: 'text', nullable: true, name: 'motivo_perda' })
  motivoPerda: string | null;

  @OneToMany(() => HistoricoOportunidade, (h) => h.oportunidade)
  historico: HistoricoOportunidade[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
