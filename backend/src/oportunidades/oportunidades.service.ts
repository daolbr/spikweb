import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Oportunidade } from './oportunidade.entity';
import { HistoricoOportunidade } from './historico-oportunidade.entity';
import {
  CriarOportunidadeDto,
  AtualizarOportunidadeDto,
  MudarEstagioDto,
  CriarHistoricoDto,
} from './dto/oportunidade.dto';
import { EstagioFunil } from './estagio-funil.enum';
import { AutomacoesService } from '../automacoes/automacoes.service';

@Injectable()
export class OportunidadesService {
  constructor(
    @InjectRepository(Oportunidade)
    private readonly oportunidadesRepo: Repository<Oportunidade>,
    @InjectRepository(HistoricoOportunidade)
    private readonly historicoRepo: Repository<HistoricoOportunidade>,
    private readonly automacoesService: AutomacoesService,
  ) {}

  // Retorna as oportunidades agrupadas por estágio — formato pronto para o Kanban do frontend.
  async listarFunil(empresaId?: string) {
    const oportunidades = await this.oportunidadesRepo.find({
      where: empresaId ? { empresaId } : {},
      relations: { empresa: true, contato: true, vendedor: true, especialista: true },
      order: { criadoEm: 'DESC' },
    });

    const colunas: Record<string, Oportunidade[]> = {};
    for (const estagio of Object.values(EstagioFunil)) colunas[estagio] = [];
    for (const oportunidade of oportunidades) {
      colunas[oportunidade.estagio].push(oportunidade);
    }
    return colunas;
  }

  async buscarPorId(id: string): Promise<Oportunidade> {
    const oportunidade = await this.oportunidadesRepo.findOne({
      where: { id },
      relations: { empresa: true, contato: true, historico: true, vendedor: true, especialista: true },
      order: { historico: { criadoEm: 'DESC' } },
    });
    if (!oportunidade) throw new NotFoundException('Oportunidade não encontrada.');
    return oportunidade;
  }

  async criar(dto: CriarOportunidadeDto): Promise<Oportunidade> {
    const { valor, confiabilidade, previsaoFechamento, classificacao, ...resto } = dto;
    const oportunidade = this.oportunidadesRepo.create({
      ...resto,
      valor: valor ?? 0,
      confiabilidade,
      previsaoFechamento,
      classificacao,
    });
    const salva = await this.oportunidadesRepo.save(oportunidade);

    // Checkpoint inicial — mesmo padrão do legado: toda mudança de avaliação
    // (mesmo a primeira) fica registrada no histórico, não só no registro atual.
    await this.historicoRepo.save(
      this.historicoRepo.create({
        oportunidadeId: salva.id,
        anotacao: 'Oportunidade criada.',
        estagioNoMomento: salva.estagio,
        valor: salva.valor,
        confiabilidade: salva.confiabilidade,
        previsaoFechamento: salva.previsaoFechamento,
        classificacao: salva.classificacao,
      }),
    );

    return salva;
  }

  async atualizar(id: string, dto: AtualizarOportunidadeDto): Promise<Oportunidade> {
    const oportunidade = await this.buscarPorId(id);
    Object.assign(oportunidade, dto);
    return this.oportunidadesRepo.save(oportunidade);
  }

  async mudarEstagio(id: string, dto: MudarEstagioDto): Promise<Oportunidade> {
    const oportunidade = await this.buscarPorId(id);
    const estagioAnterior = oportunidade.estagio;

    if (dto.estagio === EstagioFunil.PERDIDA && !dto.motivoPerda?.trim()) {
      throw new BadRequestException(
        'Informe o motivo da perda ao marcar uma oportunidade como perdida — isso alimenta os indicadores de causa de perda.',
      );
    }
    if (
      (estagioAnterior === EstagioFunil.GANHA || estagioAnterior === EstagioFunil.PERDIDA) &&
      dto.estagio !== estagioAnterior
    ) {
      throw new BadRequestException(
        'Esta oportunidade já está fechada (ganha ou perdida) e não pode mudar de estágio. Crie uma nova oportunidade se for o caso.',
      );
    }

    oportunidade.estagio = dto.estagio;
    if (dto.estagio === EstagioFunil.PERDIDA && dto.motivoPerda) {
      oportunidade.motivoPerda = dto.motivoPerda;
    }
    const salva = await this.oportunidadesRepo.save(oportunidade);

    const anotacao =
      dto.anotacao ??
      `Estágio alterado de ${estagioAnterior} para ${dto.estagio}.`;
    await this.historicoRepo.save(
      this.historicoRepo.create({
        oportunidadeId: id,
        anotacao,
        estagioNoMomento: dto.estagio,
        valor: salva.valor,
        confiabilidade: salva.confiabilidade,
        previsaoFechamento: salva.previsaoFechamento,
        classificacao: salva.classificacao,
      }),
    );

    if (dto.estagio === EstagioFunil.GANHA && estagioAnterior !== EstagioFunil.GANHA) {
      const comEmpresa = await this.oportunidadesRepo.findOne({ where: { id }, relations: { empresa: true } });
      if (comEmpresa) await this.automacoesService.aoGanharOportunidade(comEmpresa);
    }

    return salva;
  }

  // Mecanismo central do legado: registrar um acompanhamento reavalia a
  // oportunidade. Os campos informados aqui viram os novos valores
  // "atuais" (cache) na oportunidade — a fonte da verdade é este histórico.
  async adicionarHistorico(id: string, dto: CriarHistoricoDto): Promise<HistoricoOportunidade> {
    const oportunidade = await this.buscarPorId(id);

    const houveReavaliacao =
      dto.valor !== undefined ||
      dto.confiabilidade !== undefined ||
      dto.previsaoFechamento !== undefined ||
      dto.classificacao !== undefined;

    if (houveReavaliacao) {
      if (dto.valor !== undefined) oportunidade.valor = dto.valor;
      if (dto.confiabilidade !== undefined) oportunidade.confiabilidade = dto.confiabilidade;
      if (dto.previsaoFechamento !== undefined) oportunidade.previsaoFechamento = dto.previsaoFechamento;
      if (dto.classificacao !== undefined) oportunidade.classificacao = dto.classificacao;
      await this.oportunidadesRepo.save(oportunidade);
    }

    return this.historicoRepo.save(
      this.historicoRepo.create({
        oportunidadeId: id,
        anotacao: dto.anotacao,
        estagioNoMomento: oportunidade.estagio,
        valor: dto.valor ?? oportunidade.valor,
        confiabilidade: dto.confiabilidade ?? oportunidade.confiabilidade,
        previsaoFechamento: dto.previsaoFechamento ?? oportunidade.previsaoFechamento,
        classificacao: dto.classificacao ?? oportunidade.classificacao,
      }),
    );
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.oportunidadesRepo.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException('Oportunidade não encontrada.');
    }
  }

  async anexarProposta(id: string, arquivo: Express.Multer.File): Promise<Oportunidade> {
    const oportunidade = await this.buscarPorId(id);
    oportunidade.propostaArquivo = arquivo.buffer;
    oportunidade.propostaArquivoNome = arquivo.originalname;
    oportunidade.propostaArquivoTipo = arquivo.mimetype;
    return this.oportunidadesRepo.save(oportunidade);
  }

  async baixarProposta(id: string): Promise<{ arquivo: Buffer; nome: string; tipo: string }> {
    const oportunidade = await this.oportunidadesRepo.findOne({
      where: { id },
      select: { id: true, propostaArquivo: true, propostaArquivoNome: true, propostaArquivoTipo: true },
    });
    if (!oportunidade?.propostaArquivo) {
      throw new NotFoundException('Nenhum arquivo de proposta anexado a esta oportunidade.');
    }
    return {
      arquivo: oportunidade.propostaArquivo,
      nome: oportunidade.propostaArquivoNome ?? 'proposta.pdf',
      tipo: oportunidade.propostaArquivoTipo ?? 'application/octet-stream',
    };
  }

  async removerProposta(id: string): Promise<Oportunidade> {
    const oportunidade = await this.buscarPorId(id);
    oportunidade.propostaArquivo = null;
    oportunidade.propostaArquivoNome = null;
    oportunidade.propostaArquivoTipo = null;
    return this.oportunidadesRepo.save(oportunidade);
  }

  // Equivalente ao "quadrototais" do legado: pipeline segmentado por
  // classe de prospect (A/B/C), com contagem, valor total e confiabilidade
  // média — filtrável por vendedor, especialista, vertical e janela de
  // previsão de fechamento.
  async quadroTotais(filtros: {
    vendedorId?: string;
    especialistaId?: string;
    vertical?: string;
    de?: string;
    ate?: string;
  }) {
    const qb = this.oportunidadesRepo
      .createQueryBuilder('o')
      .where('o.estagio NOT IN (:...terminais)', {
        terminais: [EstagioFunil.GANHA, EstagioFunil.PERDIDA],
      });

    if (filtros.vendedorId) qb.andWhere('o.vendedor_id = :vendedorId', { vendedorId: filtros.vendedorId });
    if (filtros.especialistaId) qb.andWhere('o.especialista_id = :especialistaId', { especialistaId: filtros.especialistaId });
    if (filtros.vertical) qb.andWhere('o.vertical = :vertical', { vertical: filtros.vertical });
    if (filtros.de) qb.andWhere('o.previsao_fechamento >= :de', { de: filtros.de });
    if (filtros.ate) qb.andWhere('o.previsao_fechamento <= :ate', { ate: filtros.ate });

    const linhas = await qb
      .select('o.classificacao', 'classificacao')
      .addSelect('COUNT(*)', 'total')
      .addSelect('COALESCE(SUM(o.valor), 0)', 'valorTotal')
      .addSelect('COALESCE(AVG(o.confiabilidade), 0)', 'confiabilidadeMedia')
      .groupBy('o.classificacao')
      .getRawMany<{ classificacao: string | null; total: string; valorTotal: string; confiabilidadeMedia: string }>();

    const porClasse: Record<string, { total: number; valorTotal: number; confiabilidadeMedia: number }> = {
      A: { total: 0, valorTotal: 0, confiabilidadeMedia: 0 },
      B: { total: 0, valorTotal: 0, confiabilidadeMedia: 0 },
      C: { total: 0, valorTotal: 0, confiabilidadeMedia: 0 },
      SEM_CLASSE: { total: 0, valorTotal: 0, confiabilidadeMedia: 0 },
    };
    for (const linha of linhas) {
      const chave = linha.classificacao ?? 'SEM_CLASSE';
      porClasse[chave] = {
        total: Number(linha.total),
        valorTotal: Number(linha.valorTotal),
        confiabilidadeMedia: Math.round(Number(linha.confiabilidadeMedia)),
      };
    }

    const geral = Object.values(porClasse).reduce(
      (acc, c) => ({ total: acc.total + c.total, valorTotal: acc.valorTotal + c.valorTotal }),
      { total: 0, valorTotal: 0 },
    );

    return { geral, porClasse };
  }
}
