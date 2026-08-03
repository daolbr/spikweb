import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Projeto, StatusProjeto } from './projeto.entity';
import { CriarProjetoDto, AtualizarProjetoDto } from './dto/projeto.dto';

@Injectable()
export class ProjetosService {
  constructor(
    @InjectRepository(Projeto)
    private readonly projetosRepo: Repository<Projeto>,
  ) {}

  listar(empresaId?: string): Promise<Projeto[]> {
    return this.projetosRepo.find({
      where: empresaId ? { empresaId } : {},
      relations: { empresa: true },
      order: { criadoEm: 'DESC' },
    });
  }

  async buscarPorId(id: string): Promise<Projeto> {
    const projeto = await this.projetosRepo.findOne({ where: { id }, relations: { empresa: true } });
    if (!projeto) throw new NotFoundException('Projeto não encontrado.');
    return projeto;
  }

  criar(dto: CriarProjetoDto): Promise<Projeto> {
    return this.projetosRepo.save(this.projetosRepo.create(dto));
  }

  async atualizar(id: string, dto: AtualizarProjetoDto): Promise<Projeto> {
    const projeto = await this.buscarPorId(id);
    Object.assign(projeto, dto);
    return this.projetosRepo.save(projeto);
  }

  async mudarStatus(id: string, status: StatusProjeto): Promise<Projeto> {
    const projeto = await this.buscarPorId(id);
    projeto.status = status;
    return this.projetosRepo.save(projeto);
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.projetosRepo.delete(id);
    if (resultado.affected === 0) throw new NotFoundException('Projeto não encontrado.');
  }
}
