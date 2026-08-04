import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Atividade } from './atividade.entity';
import { StatusAtividade } from './atividade.enums';
import { CriarAtividadeDto, AtualizarAtividadeDto } from './dto/atividade.dto';
import { EstagioFunil } from '../oportunidades/estagio-funil.enum';
import { AutomacoesService } from '../automacoes/automacoes.service';

interface FiltrosAgenda {
  empresaId?: string;
  oportunidadeId?: string;
  de?: string;
  ate?: string;
}

// Prioridade de avanço no funil — usada para ordenar atividades pendentes
// priorizando negócios mais avançados primeiro, terminando na prospecção.
const PRIORIDADE_ESTAGIO: Record<string, number> = {
  [EstagioFunil.NEGOCIACAO]: 4,
  [EstagioFunil.PROPOSTA]: 3,
  [EstagioFunil.QUALIFICACAO]: 2,
  [EstagioFunil.PROSPECCAO]: 1,
};

@Injectable()
export class AtividadesService {
  constructor(
    @InjectRepository(Atividade)
    private readonly atividadesRepo: Repository<Atividade>,
    private readonly automacoesService: AutomacoesService,
  ) {}

  async listar(filtros: FiltrosAgenda): Promise<Atividade[]> {
    const where: Record<string, unknown> = {};
    if (filtros.empresaId) where.empresaId = filtros.empresaId;
    if (filtros.oportunidadeId) where.oportunidadeId = filtros.oportunidadeId;
    if (filtros.de && filtros.ate) {
      where.dataInicio = Between(new Date(filtros.de), new Date(filtros.ate));
    }
    return this.atividadesRepo.find({
      where,
      relations: { empresa: true, contato: true, oportunidade: true },
      order: { dataInicio: 'ASC' },
    });
  }

  // Item 4 das automações: atividades pendentes ordenadas priorizando
  // negócios mais avançados no funil, depois os sem oportunidade vinculada,
  // e por último as tarefas de prospecção — dentro de cada grupo, por data.
  async listarPriorizadas(): Promise<Atividade[]> {
    const atividades = await this.atividadesRepo.find({
      where: { status: StatusAtividade.PENDENTE },
      relations: { empresa: true, contato: true, oportunidade: true },
      order: { dataInicio: 'ASC' },
    });

    return atividades.sort((a, b) => {
      const prioridadeA = a.oportunidade ? PRIORIDADE_ESTAGIO[a.oportunidade.estagio] ?? 0 : 0;
      const prioridadeB = b.oportunidade ? PRIORIDADE_ESTAGIO[b.oportunidade.estagio] ?? 0 : 0;
      if (prioridadeA !== prioridadeB) return prioridadeB - prioridadeA;
      return new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime();
    });
  }

  async buscarPorId(id: string): Promise<Atividade> {
    const atividade = await this.atividadesRepo.findOne({
      where: { id },
      relations: { empresa: true, contato: true, oportunidade: true },
    });
    if (!atividade) throw new NotFoundException('Atividade não encontrada.');
    return atividade;
  }

  async criar(dto: CriarAtividadeDto): Promise<Atividade> {
    const atividade = this.atividadesRepo.create({
      ...dto,
      dataInicio: new Date(dto.dataInicio),
      dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
    });
    return this.atividadesRepo.save(atividade);
  }

  async atualizar(id: string, dto: AtualizarAtividadeDto): Promise<Atividade> {
    const atividade = await this.buscarPorId(id);
    Object.assign(atividade, {
      ...dto,
      dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : atividade.dataInicio,
      dataFim: dto.dataFim ? new Date(dto.dataFim) : atividade.dataFim,
    });
    return this.atividadesRepo.save(atividade);
  }

  async concluir(id: string): Promise<Atividade> {
    const atividade = await this.buscarPorId(id);
    atividade.status = StatusAtividade.CONCLUIDA;
    atividade.dataConclusao = new Date();
    const salva = await this.atividadesRepo.save(atividade);
    await this.automacoesService.aoConcluirFidelizacao(salva);
    return salva;
  }

  async cancelar(id: string): Promise<Atividade> {
    const atividade = await this.buscarPorId(id);
    atividade.status = StatusAtividade.CANCELADA;
    return this.atividadesRepo.save(atividade);
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.atividadesRepo.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException('Atividade não encontrada.');
    }
  }
}
