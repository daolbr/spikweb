import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseInstalada } from './base-instalada.entity';
import { CriarBaseInstaladaDto, AtualizarBaseInstaladaDto } from './dto/base-instalada.dto';

@Injectable()
export class BaseInstaladaService {
  constructor(
    @InjectRepository(BaseInstalada)
    private readonly repo: Repository<BaseInstalada>,
  ) {}

  listar(empresaId?: string): Promise<BaseInstalada[]> {
    return this.repo.find({
      where: empresaId ? { empresaId } : {},
      relations: { empresa: true, oportunidade: true },
      order: { dataVenda: 'DESC' },
    });
  }

  async buscarPorId(id: string): Promise<BaseInstalada> {
    const item = await this.repo.findOne({ where: { id }, relations: { empresa: true, oportunidade: true } });
    if (!item) throw new NotFoundException('Item de base instalada não encontrado.');
    return item;
  }

  criar(dto: CriarBaseInstaladaDto): Promise<BaseInstalada> {
    return this.repo.save(this.repo.create(dto));
  }

  async atualizar(id: string, dto: AtualizarBaseInstaladaDto): Promise<BaseInstalada> {
    const item = await this.buscarPorId(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.repo.delete(id);
    if (resultado.affected === 0) throw new NotFoundException('Item de base instalada não encontrado.');
  }

  // Itens com renovação vencendo nos próximos N dias — útil pro time
  // comercial saber quem procurar para renovar contrato.
  async proximasRenovacoes(dias: number): Promise<BaseInstalada[]> {
    const hoje = new Date().toISOString().slice(0, 10);
    const limite = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return this.repo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.empresa', 'empresa')
      .where('b.data_renovacao IS NOT NULL')
      .andWhere('b.data_renovacao >= :hoje', { hoje })
      .andWhere('b.data_renovacao <= :limite', { limite })
      .orderBy('b.data_renovacao', 'ASC')
      .getMany();
  }
}
