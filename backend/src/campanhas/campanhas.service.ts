import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campanha, StatusCampanha } from './campanha.entity';
import { CriarCampanhaDto, AtualizarCampanhaDto } from './dto/campanha.dto';

@Injectable()
export class CampanhasService {
  constructor(
    @InjectRepository(Campanha)
    private readonly campanhasRepo: Repository<Campanha>,
  ) {}

  listar(): Promise<Campanha[]> {
    return this.campanhasRepo.find({ order: { criadoEm: 'DESC' } });
  }

  async buscarPorId(id: string): Promise<Campanha> {
    const campanha = await this.campanhasRepo.findOne({ where: { id } });
    if (!campanha) throw new NotFoundException('Campanha não encontrada.');
    return campanha;
  }

  criar(dto: CriarCampanhaDto): Promise<Campanha> {
    return this.campanhasRepo.save(this.campanhasRepo.create(dto));
  }

  async atualizar(id: string, dto: AtualizarCampanhaDto): Promise<Campanha> {
    const campanha = await this.buscarPorId(id);
    Object.assign(campanha, dto);
    return this.campanhasRepo.save(campanha);
  }

  async mudarStatus(id: string, status: StatusCampanha): Promise<Campanha> {
    const campanha = await this.buscarPorId(id);
    campanha.status = status;
    return this.campanhasRepo.save(campanha);
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.campanhasRepo.delete(id);
    if (resultado.affected === 0) throw new NotFoundException('Campanha não encontrada.');
  }
}
