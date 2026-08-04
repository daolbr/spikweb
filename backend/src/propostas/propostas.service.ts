import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposta } from './proposta.entity';
import { ItemProposta } from './item-proposta.entity';
import {
  CriarPropostaDto,
  AtualizarPropostaDto,
  MudarStatusPropostaDto,
  CriarItemPropostaDto,
} from './dto/proposta.dto';

@Injectable()
export class PropostasService {
  constructor(
    @InjectRepository(Proposta)
    private readonly propostasRepo: Repository<Proposta>,
    @InjectRepository(ItemProposta)
    private readonly itensRepo: Repository<ItemProposta>,
  ) {}

  async listarPorEmpresa(empresaId?: string): Promise<Proposta[]> {
    return this.propostasRepo.find({
      where: empresaId ? { empresaId } : {},
      relations: { empresa: true },
      order: { criadoEm: 'DESC' },
    });
  }

  async buscarPorId(id: string): Promise<Proposta> {
    const proposta = await this.propostasRepo.findOne({
      where: { id },
      relations: { empresa: true, contato: true, oportunidade: true, itens: true },
    });
    if (!proposta) throw new NotFoundException('Proposta não encontrada.');
    return proposta;
  }

  async criar(dto: CriarPropostaDto): Promise<Proposta> {
    const proposta = this.propostasRepo.create(dto);
    return this.propostasRepo.save(proposta);
  }

  async atualizar(id: string, dto: AtualizarPropostaDto): Promise<Proposta> {
    const proposta = await this.buscarPorId(id);
    Object.assign(proposta, dto);
    return this.propostasRepo.save(proposta);
  }

  async mudarStatus(id: string, dto: MudarStatusPropostaDto): Promise<Proposta> {
    const proposta = await this.buscarPorId(id);
    if (dto.status === 'APROVADA' && (!proposta.itens || proposta.itens.length === 0)) {
      throw new BadRequestException(
        'Não é possível aprovar uma proposta sem itens. Adicione ao menos um item antes de aprovar.',
      );
    }
    proposta.status = dto.status;
    return this.propostasRepo.save(proposta);
  }

  async adicionarItem(propostaId: string, dto: CriarItemPropostaDto): Promise<Proposta> {
    const proposta = await this.buscarPorId(propostaId);
    if (proposta.status === 'APROVADA' || proposta.status === 'RECUSADA') {
      throw new BadRequestException(
        'Não é possível alterar itens de uma proposta já aprovada ou recusada.',
      );
    }
    await this.itensRepo.save(this.itensRepo.create({ ...dto, propostaId }));
    return this.recalcularTotal(propostaId);
  }

  async removerItem(propostaId: string, itemId: string): Promise<Proposta> {
    const proposta = await this.buscarPorId(propostaId);
    if (proposta.status === 'APROVADA' || proposta.status === 'RECUSADA') {
      throw new BadRequestException(
        'Não é possível alterar itens de uma proposta já aprovada ou recusada.',
      );
    }
    const resultado = await this.itensRepo.delete({ id: itemId, propostaId });
    if (resultado.affected === 0) throw new NotFoundException('Item não encontrado.');
    return this.recalcularTotal(propostaId);
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.propostasRepo.delete(id);
    if (resultado.affected === 0) throw new NotFoundException('Proposta não encontrada.');
  }

  private async recalcularTotal(propostaId: string): Promise<Proposta> {
    const itens = await this.itensRepo.find({ where: { propostaId } });
    const total = itens.reduce((soma, item) => soma + Number(item.quantidade) * Number(item.valorUnitario), 0);
    await this.propostasRepo.update(propostaId, { valorTotal: total });
    return this.buscarPorId(propostaId);
  }
}
