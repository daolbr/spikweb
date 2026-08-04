import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { EntidadeCustomizavel, TipoCampoCustomizado } from './campos-customizados.enums';
import { PermissaoCampo } from './permissao-campo.entity';

@Entity('campos_customizados')
export class CampoCustomizado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: EntidadeCustomizavel })
  entidade: EntidadeCustomizavel;

  // Chave interna estável (usada em integrações futuras); o rótulo é o
  // texto exibido na tela e pode ser renomeado sem quebrar nada.
  @Column({ length: 60 })
  nome: string;

  @Column({ length: 100 })
  rotulo: string;

  @Column({ type: 'enum', enum: TipoCampoCustomizado })
  tipo: TipoCampoCustomizado;

  // Para tipo=LISTA: opções separadas por vírgula (ex.: "Frio,Morno,Quente")
  @Column({ type: 'text', nullable: true })
  opcoesLista: string | null;

  @Column({ default: false })
  obrigatorio: boolean;

  @Column({ default: 0 })
  ordem: number;

  @Column({ default: true })
  ativo: boolean;

  @OneToMany(() => PermissaoCampo, (p) => p.campo, { cascade: true })
  permissoes: PermissaoCampo[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
