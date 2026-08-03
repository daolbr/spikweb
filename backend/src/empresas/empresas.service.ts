import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Empresa } from './empresa.entity';
import { CriarEmpresaDto, AtualizarEmpresaDto } from './dto/empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresasRepo: Repository<Empresa>,
  ) {}

  async listar(busca?: string, pagina = 1, tamanhoPagina = 20) {
    const [dados, total] = await this.empresasRepo.findAndCount({
      where: busca ? { nome: ILike(`%${busca}%`) } : {},
      order: { nome: 'ASC' },
      skip: (pagina - 1) * tamanhoPagina,
      take: tamanhoPagina,
    });
    return { dados, total, pagina, tamanhoPagina };
  }

  async buscarPorId(id: string): Promise<Empresa> {
    const empresa = await this.empresasRepo.findOne({
      where: { id },
      relations: { contatos: true },
    });
    if (!empresa) throw new NotFoundException('Empresa não encontrada.');
    return empresa;
  }

  async criar(dto: CriarEmpresaDto): Promise<Empresa> {
    const empresa = this.empresasRepo.create(dto);
    return this.empresasRepo.save(empresa);
  }

  async atualizar(id: string, dto: AtualizarEmpresaDto): Promise<Empresa> {
    const empresa = await this.buscarPorId(id);
    Object.assign(empresa, dto);
    return this.empresasRepo.save(empresa);
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.empresasRepo.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException('Empresa não encontrada.');
    }
  }
}
