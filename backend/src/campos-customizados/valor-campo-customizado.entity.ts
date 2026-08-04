import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { CampoCustomizado } from './campo-customizado.entity';

// Um registro por (campo, entidadeId). O valor é sempre guardado como
// texto e convertido no momento da leitura conforme o `tipo` do campo —
// isso evita ter que alterar o schema toda vez que alguém cria um campo novo.
@Entity('valores_campos_customizados')
@Unique(['campoId', 'entidadeId'])
export class ValorCampoCustomizado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'campo_id' })
  campoId: string;

  @ManyToOne(() => CampoCustomizado, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campo_id' })
  campo: CampoCustomizado;

  // id do registro real (empresa.id, oportunidade.id, etc.) — sem FK
  // formal porque aponta para tabelas diferentes dependendo da entidade.
  @Column({ name: 'entidade_id' })
  entidadeId: string;

  @Column({ type: 'text', nullable: true })
  valor: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
