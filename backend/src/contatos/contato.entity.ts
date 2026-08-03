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

// Corresponde à antiga SPM_CONTATO. Sempre filha de uma Empresa.
@Entity('contatos')
export class Contato {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  nome: string;

  @Column({ length: 120, nullable: true })
  email: string | null;

  @Column({ length: 20, nullable: true })
  telefone: string | null;

  @Column({ length: 20, nullable: true })
  celular: string | null;

  @Column({ length: 80, nullable: true })
  cargo: string | null;

  @Column({ name: 'empresa_id' })
  empresaId: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.contatos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
