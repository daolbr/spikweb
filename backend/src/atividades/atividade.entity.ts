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
import { Contato } from '../contatos/contato.entity';
import { Oportunidade } from '../oportunidades/oportunidade.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { TipoAtividade, StatusAtividade } from './atividade.enums';

// Corresponde à antiga SPM_ATIVIDADE. Sempre filha de uma Empresa;
// contato, oportunidade e responsável são opcionais.
@Entity('atividades')
export class Atividade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  titulo: string;

  @Column({ type: 'enum', enum: TipoAtividade, default: TipoAtividade.TAREFA })
  tipo: TipoAtividade;

  @Column({ type: 'enum', enum: StatusAtividade, default: StatusAtividade.PENDENTE })
  status: StatusAtividade;

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

  @Column({ name: 'responsavel_id', nullable: true })
  responsavelId: string | null;

  @ManyToOne(() => Usuario, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: Usuario | null;

  @Column({ name: 'data_inicio', type: 'timestamptz' })
  dataInicio: Date;

  @Column({ name: 'data_fim', type: 'timestamptz', nullable: true })
  dataFim: Date | null;

  @Column({ name: 'data_conclusao', type: 'timestamptz', nullable: true })
  dataConclusao: Date | null;

  @Column({ type: 'text', nullable: true })
  notas: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
