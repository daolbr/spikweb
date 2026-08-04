import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Oportunidade } from '../oportunidades/oportunidade.entity';
import { HistoricoOportunidade } from '../oportunidades/historico-oportunidade.entity';
import { EstagioFunil } from '../oportunidades/estagio-funil.enum';
import { Atividade } from '../atividades/atividade.entity';
import { TipoAtividade, StatusAtividade } from '../atividades/atividade.enums';
import { Empresa } from '../empresas/empresa.entity';
import { BaseInstalada } from '../base-instalada/base-instalada.entity';

// Este serviço concentra as 5 automações de inteligência comercial que
// tornam o sistema mais que um CRUD: (1) ranking de perfil ideal de
// cliente + sugestão automática de prospecção, (2) cross-sell automático
// na base ao fechar negócio, (3) renovação automática de produtos
// vendidos, (4) priorização de atividades por avanço no funil, e
// (5) cadência de fidelização pós-venda (10 → 30 → a cada 120 dias).
@Injectable()
export class AutomacoesService {
  constructor(
    @InjectRepository(Oportunidade)
    private readonly oportunidadesRepo: Repository<Oportunidade>,
    @InjectRepository(HistoricoOportunidade)
    private readonly historicoRepo: Repository<HistoricoOportunidade>,
    @InjectRepository(Atividade)
    private readonly atividadesRepo: Repository<Atividade>,
    @InjectRepository(Empresa)
    private readonly empresasRepo: Repository<Empresa>,
    @InjectRepository(BaseInstalada)
    private readonly baseInstaladaRepo: Repository<BaseInstalada>,
  ) {}

  // ========== 1. Ranking de perfil ideal + prospecção sugerida ==========

  async perfilIdeal() {
    const [porPorte, porSegmento, porUf] = await Promise.all([
      this.rankingPorAtributo('porte'),
      this.rankingPorAtributo('segmento'),
      this.rankingPorAtributo('uf'),
    ]);
    return { porPorte, porSegmento, porUf };
  }

  private async rankingPorAtributo(atributo: 'porte' | 'segmento' | 'uf') {
    return this.oportunidadesRepo
      .createQueryBuilder('o')
      .innerJoin('o.empresa', 'e')
      .select(`e.${atributo}`, 'valor')
      .addSelect('COUNT(*)', 'vitorias')
      .addSelect('COALESCE(SUM(o.valor), 0)', 'valorTotal')
      .where('o.estagio = :ganha', { ganha: EstagioFunil.GANHA })
      .andWhere(`e.${atributo} IS NOT NULL`)
      .groupBy(`e.${atributo}`)
      .orderBy('vitorias', 'DESC')
      .getRawMany<{ valor: string; vitorias: string; valorTotal: string }>()
      .then((linhas) =>
        linhas.map((l) => ({ valor: l.valor, vitorias: Number(l.vitorias), valorTotal: Number(l.valorTotal) })),
      );
  }

  // Empresas que ainda não têm nenhuma oportunidade, ranqueadas por quantos
  // atributos batem com o perfil de clientes que já fecharam negócio.
  async prospectsSugeridos(limite = 20) {
    const perfil = await this.perfilIdeal();
    const topPorte = perfil.porPorte[0]?.valor;
    const topSegmento = perfil.porSegmento[0]?.valor;
    const topUf = perfil.porUf[0]?.valor;

    if (!topPorte && !topSegmento && !topUf) {
      return { perfil, prospects: [] };
    }

    const candidatas = await this.empresasRepo
      .createQueryBuilder('e')
      .where(
        'NOT EXISTS (SELECT 1 FROM oportunidades o WHERE o.empresa_id = e.id)',
      )
      .getMany();

    const prospects = candidatas
      .map((empresa) => {
        let pontuacao = 0;
        const atributosCompativeis: string[] = [];
        if (topPorte && empresa.porte === topPorte) { pontuacao++; atributosCompativeis.push('porte'); }
        if (topSegmento && empresa.segmento === topSegmento) { pontuacao++; atributosCompativeis.push('segmento'); }
        if (topUf && empresa.uf === topUf) { pontuacao++; atributosCompativeis.push('uf'); }
        return { empresa, pontuacao, atributosCompativeis };
      })
      .filter((p) => p.pontuacao > 0)
      .sort((a, b) => b.pontuacao - a.pontuacao)
      .slice(0, limite);

    return { perfil, prospects };
  }

  // ========== 2 + 5. Ao ganhar uma oportunidade: cross-sell + fidelização ==========

  async aoGanharOportunidade(oportunidade: Oportunidade): Promise<void> {
    const empresa = oportunidade.empresa ?? (await this.empresasRepo.findOne({ where: { id: oportunidade.empresaId } }));
    if (!empresa) return;

    // (1) Sugestão de prospecção com o perfil do cliente que acabou de fechar.
    const descricaoPerfil = [
      empresa.porte ? `porte ${empresa.porte}` : null,
      empresa.segmento ? `segmento "${empresa.segmento}"` : null,
      empresa.uf ? `estado ${empresa.uf}` : null,
    ].filter(Boolean).join(', ');

    await this.atividadesRepo.save(
      this.atividadesRepo.create({
        titulo: `Buscar novos clientes com perfil semelhante a ${empresa.nome}`,
        tipo: TipoAtividade.PROSPECCAO,
        empresaId: empresa.id,
        dataInicio: new Date(),
        notas: descricaoPerfil
          ? `Gerado automaticamente ao fechar negócio. Perfil de referência: ${descricaoPerfil}.`
          : 'Gerado automaticamente ao fechar negócio.',
      }),
    );

    // (2) Cross-sell automático: nova oportunidade planejada na mesma base.
    const crossSell = await this.oportunidadesRepo.save(
      this.oportunidadesRepo.create({
        titulo: `Cross-sell — outros produtos para ${empresa.nome}`,
        empresaId: empresa.id,
        estagio: EstagioFunil.PROSPECCAO,
        valor: 0,
        origem: 'Cross-sell automático',
      }),
    );
    await this.historicoRepo.save(
      this.historicoRepo.create({
        oportunidadeId: crossSell.id,
        anotacao: `Gerado automaticamente após o fechamento de "${oportunidade.titulo}" — avaliar outros produtos/serviços para este cliente.`,
        estagioNoMomento: EstagioFunil.PROSPECCAO,
      }),
    );

    // (5) Primeiro passo da cadência de fidelização: +10 dias.
    await this.atividadesRepo.save(
      this.atividadesRepo.create({
        titulo: `Follow-up de fidelização — ${empresa.nome}`,
        tipo: TipoAtividade.FIDELIZACAO,
        empresaId: empresa.id,
        oportunidadeId: oportunidade.id,
        dataInicio: this.somarDias(new Date(), 10),
        notas: 'Cadência automática de fidelização (10 → 30 → a cada 120 dias).',
      }),
    );
  }

  // ========== 5 (continuação). Encadeamento da cadência de fidelização ==========

  async aoConcluirFidelizacao(atividade: Atividade): Promise<void> {
    if (atividade.tipo !== TipoAtividade.FIDELIZACAO || !atividade.oportunidadeId) return;

    const anteriores = await this.atividadesRepo.count({
      where: {
        oportunidadeId: atividade.oportunidadeId,
        tipo: TipoAtividade.FIDELIZACAO,
        status: StatusAtividade.CONCLUIDA,
      },
    });

    // 1ª concluída (10 dias) → próxima em 30 dias. Da 2ª em diante → a cada 120 dias.
    const dias = anteriores <= 1 ? 30 : 120;

    await this.atividadesRepo.save(
      this.atividadesRepo.create({
        titulo: atividade.titulo,
        tipo: TipoAtividade.FIDELIZACAO,
        empresaId: atividade.empresaId,
        oportunidadeId: atividade.oportunidadeId,
        dataInicio: this.somarDias(new Date(), dias),
        notas: `Cadência automática de fidelização (próximo em ${dias} dias).`,
      }),
    );
  }

  // ========== 3. Renovação automática de produtos vendidos ==========

  async gerarRenovacoes(): Promise<{ geradas: number; itens: { produtoServico: string; empresa: string }[] }> {
    const hoje = new Date().toISOString().slice(0, 10);
    const pendentes = await this.baseInstaladaRepo.find({
      where: { dataRenovacao: LessThanOrEqual(hoje), renovacaoGerada: false },
      relations: { empresa: true },
    });

    const itens: { produtoServico: string; empresa: string }[] = [];
    for (const item of pendentes) {
      const oportunidade = await this.oportunidadesRepo.save(
        this.oportunidadesRepo.create({
          titulo: `Renovação — ${item.produtoServico}`,
          empresaId: item.empresaId,
          estagio: EstagioFunil.PROSPECCAO,
          valor: item.valor ?? 0,
          origem: 'Renovação automática',
        }),
      );
      await this.historicoRepo.save(
        this.historicoRepo.create({
          oportunidadeId: oportunidade.id,
          anotacao: `Gerado automaticamente — "${item.produtoServico}" venceu em ${item.dataRenovacao}.`,
          estagioNoMomento: EstagioFunil.PROSPECCAO,
        }),
      );
      item.renovacaoGerada = true;
      await this.baseInstaladaRepo.save(item);
      itens.push({ produtoServico: item.produtoServico, empresa: item.empresa?.nome ?? '' });
    }

    return { geradas: itens.length, itens };
  }

  private somarDias(data: Date, dias: number): Date {
    const nova = new Date(data);
    nova.setDate(nova.getDate() + dias);
    return nova;
  }
}
