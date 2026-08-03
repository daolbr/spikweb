import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Oportunidade } from '../oportunidades/oportunidade.entity';
import { EstagioFunil } from '../oportunidades/estagio-funil.enum';
import { Atividade } from '../atividades/atividade.entity';
import { StatusAtividade } from '../atividades/atividade.enums';
import { Proposta } from '../propostas/proposta.entity';
import { StatusProposta } from '../propostas/status-proposta.enum';

@Injectable()
export class IndicadoresService {
  constructor(
    @InjectRepository(Oportunidade)
    private readonly oportunidadesRepo: Repository<Oportunidade>,
    @InjectRepository(Atividade)
    private readonly atividadesRepo: Repository<Atividade>,
    @InjectRepository(Proposta)
    private readonly propostasRepo: Repository<Proposta>,
  ) {}

  async resumo() {
    const [
      valorPorEstagio,
      contagemGanhaPerdida,
      contagemAtividades,
      propostasAprovadas,
      pipelineAtivo,
    ] = await Promise.all([
      this.valorPorEstagio(),
      this.contagemGanhaPerdida(),
      this.contagemAtividades(),
      this.propostasRepo
        .createQueryBuilder('p')
        .select('COALESCE(SUM(p.valor_total), 0)', 'total')
        .addSelect('COUNT(*)', 'quantidade')
        .where('p.status = :status', { status: StatusProposta.APROVADA })
        .getRawOne<{ total: string; quantidade: string }>(),
      this.oportunidadesRepo
        .createQueryBuilder('o')
        .select('COALESCE(SUM(o.valor), 0)', 'total')
        .addSelect('COUNT(*)', 'quantidade')
        .where('o.estagio NOT IN (:...terminais)', {
          terminais: [EstagioFunil.GANHA, EstagioFunil.PERDIDA],
        })
        .getRawOne<{ total: string; quantidade: string }>(),
    ]);

    const ganhas = Number(contagemGanhaPerdida.ganhas);
    const perdidas = Number(contagemGanhaPerdida.perdidas);
    const totalFechadas = ganhas + perdidas;
    const taxaConversao = totalFechadas > 0 ? ganhas / totalFechadas : null;

    return {
      pipeline: {
        valorAtivo: Number(pipelineAtivo?.total ?? 0),
        quantidadeAtiva: Number(pipelineAtivo?.quantidade ?? 0),
        porEstagio: valorPorEstagio,
      },
      conversao: {
        ganhas,
        perdidas,
        taxa: taxaConversao,
      },
      atividades: contagemAtividades,
      receita: {
        propostasAprovadas: Number(propostasAprovadas?.quantidade ?? 0),
        valorAprovado: Number(propostasAprovadas?.total ?? 0),
      },
    };
  }

  private async valorPorEstagio() {
    const linhas = await this.oportunidadesRepo
      .createQueryBuilder('o')
      .select('o.estagio', 'estagio')
      .addSelect('COALESCE(SUM(o.valor), 0)', 'total')
      .addSelect('COUNT(*)', 'quantidade')
      .groupBy('o.estagio')
      .getRawMany<{ estagio: EstagioFunil; total: string; quantidade: string }>();

    const base = Object.fromEntries(
      Object.values(EstagioFunil).map((estagio) => [estagio, { total: 0, quantidade: 0 }]),
    ) as Record<EstagioFunil, { total: number; quantidade: number }>;

    for (const linha of linhas) {
      base[linha.estagio] = { total: Number(linha.total), quantidade: Number(linha.quantidade) };
    }
    return base;
  }

  private async contagemGanhaPerdida() {
    const [ganhas, perdidas] = await Promise.all([
      this.oportunidadesRepo.count({ where: { estagio: EstagioFunil.GANHA } }),
      this.oportunidadesRepo.count({ where: { estagio: EstagioFunil.PERDIDA } }),
    ]);
    return { ganhas, perdidas };
  }

  private async contagemAtividades() {
    const [pendentes, concluidas, atrasadas] = await Promise.all([
      this.atividadesRepo.count({ where: { status: StatusAtividade.PENDENTE } }),
      this.atividadesRepo.count({ where: { status: StatusAtividade.CONCLUIDA } }),
      this.atividadesRepo
        .createQueryBuilder('a')
        .where('a.status = :status', { status: StatusAtividade.PENDENTE })
        .andWhere('a.data_inicio < :agora', { agora: new Date() })
        .getCount(),
    ]);
    return { pendentes, concluidas, atrasadas };
  }
}
