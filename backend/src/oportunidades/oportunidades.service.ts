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

@Injectable()
export class OportunidadesService {
  constructor(
    @InjectRepository(Oportunidade)
    private readonly oportunidadesRepo: Repository<Oportunidade>,
    @InjectRepository(HistoricoOportunidade)
    private readonly historicoRepo: Repository<HistoricoOportunidade>,
  ) {}

  // Retorna as oportunidades agrupadas por estágio — formato pronto para o Kanban do frontend.
  async listarFunil(empresaId?: string) {
    const oportunidades = await this.oportunidadesRepo.find({
      where: empresaId ? { empresaId } : {},
      relations: { empresa: true, contato: true },
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
      relations: { empresa: true, contato: true, historico: true },
      order: { historico: { criadoEm: 'DESC' } },
    });
    if (!oportunidade) throw new NotFoundException('Oportunidade não encontrada.');
    return oportunidade;
  }

  async criar(dto: CriarOportunidadeDto): Promise<Oportunidade> {
    const oportunidade = this.oportunidadesRepo.create(dto);
    const salva = await this.oportunidadesRepo.save(oportunidade);
    await this.historicoRepo.save(
      this.historicoRepo.create({
        oportunidadeId: salva.id,
        anotacao: 'Oportunidade criada.',
        estagioNoMomento: salva.estagio,
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
      }),
    );

    return salva;
  }

  async adicionarHistorico(id: string, dto: CriarHistoricoDto): Promise<HistoricoOportunidade> {
    const oportunidade = await this.buscarPorId(id);
    return this.historicoRepo.save(
      this.historicoRepo.create({
        oportunidadeId: id,
        anotacao: dto.anotacao,
        estagioNoMomento: oportunidade.estagio,
      }),
    );
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.oportunidadesRepo.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException('Oportunidade não encontrada.');
    }
  }
}
