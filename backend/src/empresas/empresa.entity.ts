import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Contato } from '../contatos/contato.entity';

// Corresponde à antiga SPM_EMPRESA do sistema legado (VB6).
// Entidade raiz do modelo de dados: contatos, oportunidades, propostas
// e atividades são todas filhas de uma empresa.
export enum PorteEmpresa {
  MEI = 'MEI',
  MICRO = 'MICRO',
  PEQUENA = 'PEQUENA',
  MEDIA = 'MEDIA',
  GRANDE = 'GRANDE',
}

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nome: string;

  @Column({ length: 20, nullable: true, unique: true })
  cnpj: string | null;

  @Column({ length: 80, nullable: true })
  segmento: string | null;

  @Column({ type: 'enum', enum: PorteEmpresa, nullable: true })
  porte: PorteEmpresa | null;

  @Column({ length: 80, nullable: true })
  cidade: string | null;

  @Column({ length: 2, nullable: true })
  uf: string | null;

  @Column({ length: 20, nullable: true })
  telefone: string | null;

  @Column({ length: 120, nullable: true })
  site: string | null;

  @Column({ type: 'text', nullable: true })
  observacoes: string | null;

  @OneToMany(() => Contato, (contato) => contato.empresa, { cascade: false })
  contatos: Contato[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
