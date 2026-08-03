import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contato } from './contato.entity';
import { CriarContatoDto, AtualizarContatoDto } from './dto/contato.dto';

@Injectable()
export class ContatosService {
  constructor(
    @InjectRepository(Contato)
    private readonly contatosRepo: Repository<Contato>,
  ) {}

  async listarPorEmpresa(empresaId: string): Promise<Contato[]> {
    return this.contatosRepo.find({
      where: { empresaId },
      order: { nome: 'ASC' },
    });
  }

  async buscarPorId(id: string): Promise<Contato> {
    const contato = await this.contatosRepo.findOne({ where: { id } });
    if (!contato) throw new NotFoundException('Contato não encontrado.');
    return contato;
  }

  async criar(dto: CriarContatoDto): Promise<Contato> {
    const contato = this.contatosRepo.create(dto);
    return this.contatosRepo.save(contato);
  }

  async atualizar(id: string, dto: AtualizarContatoDto): Promise<Contato> {
    const contato = await this.buscarPorId(id);
    Object.assign(contato, dto);
    return this.contatosRepo.save(contato);
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.contatosRepo.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException('Contato não encontrado.');
    }
  }
}
