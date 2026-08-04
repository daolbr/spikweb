import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampoCustomizado } from './campo-customizado.entity';
import { PermissaoCampo } from './permissao-campo.entity';
import { ValorCampoCustomizado } from './valor-campo-customizado.entity';
import { EntidadeCustomizavel } from './campos-customizados.enums';
import { PapelUsuario } from '../usuarios/usuario.entity';
import {
  CriarCampoCustomizadoDto,
  AtualizarCampoCustomizadoDto,
  AtualizarPermissoesDto,
  SalvarValoresDto,
} from './dto/campos-customizados.dto';

export interface CampoComValor {
  id: string;
  nome: string;
  rotulo: string;
  tipo: string;
  opcoesLista: string | null;
  obrigatorio: boolean;
  ordem: number;
  podeEditar: boolean;
  valor: string | null;
}

@Injectable()
export class CamposCustomizadosService {
  constructor(
    @InjectRepository(CampoCustomizado)
    private readonly camposRepo: Repository<CampoCustomizado>,
    @InjectRepository(PermissaoCampo)
    private readonly permissoesRepo: Repository<PermissaoCampo>,
    @InjectRepository(ValorCampoCustomizado)
    private readonly valoresRepo: Repository<ValorCampoCustomizado>,
  ) {}

  // ---------- Administração dos campos (uso restrito a ADMIN) ----------

  async listarPorEntidade(entidade: EntidadeCustomizavel): Promise<CampoCustomizado[]> {
    return this.camposRepo.find({
      where: { entidade },
      relations: { permissoes: true },
      order: { ordem: 'ASC', criadoEm: 'ASC' },
    });
  }

  async criar(dto: CriarCampoCustomizadoDto): Promise<CampoCustomizado> {
    const nome = this.gerarNomeInterno(dto.rotulo);
    const maiorOrdem = await this.camposRepo
      .createQueryBuilder('c')
      .select('COALESCE(MAX(c.ordem), -1)', 'max')
      .where('c.entidade = :entidade', { entidade: dto.entidade })
      .getRawOne<{ max: number }>();

    const campo = this.camposRepo.create({
      ...dto,
      nome,
      ordem: (maiorOrdem?.max ?? -1) + 1,
    });
    return this.camposRepo.save(campo);
  }

  async atualizar(id: string, dto: AtualizarCampoCustomizadoDto): Promise<CampoCustomizado> {
    const campo = await this.camposRepo.findOne({ where: { id } });
    if (!campo) throw new NotFoundException('Campo customizado não encontrado.');
    Object.assign(campo, dto);
    return this.camposRepo.save(campo);
  }

  async remover(id: string): Promise<void> {
    const resultado = await this.camposRepo.delete(id);
    if (resultado.affected === 0) throw new NotFoundException('Campo customizado não encontrado.');
  }

  async atualizarPermissoes(id: string, dto: AtualizarPermissoesDto): Promise<CampoCustomizado> {
    const campo = await this.camposRepo.findOne({ where: { id } });
    if (!campo) throw new NotFoundException('Campo customizado não encontrado.');

    await this.permissoesRepo.delete({ campoId: id });
    const novas = dto.permissoes.map((p) =>
      this.permissoesRepo.create({ campoId: id, papel: p.papel, podeVer: p.podeVer, podeEditar: p.podeEditar }),
    );
    await this.permissoesRepo.save(novas);

    return this.camposRepo.findOneOrFail({ where: { id }, relations: { permissoes: true } });
  }

  // ---------- Leitura/escrita de valores (uso de qualquer usuário autenticado) ----------

  async buscarValoresParaEntidade(
    entidade: EntidadeCustomizavel,
    entidadeId: string,
    papel: PapelUsuario,
  ): Promise<CampoComValor[]> {
    const campos = await this.camposRepo.find({
      where: { entidade, ativo: true },
      relations: { permissoes: true },
      order: { ordem: 'ASC' },
    });

    const visiveis = campos.filter((c) => this.permissao(c, papel).podeVer);
    if (visiveis.length === 0) return [];

    const valores = await this.valoresRepo.find({
      where: { entidadeId },
    });
    const valorPorCampo = new Map(valores.filter((v) => visiveis.some((c) => c.id === v.campoId)).map((v) => [v.campoId, v.valor]));

    return visiveis.map((campo) => ({
      id: campo.id,
      nome: campo.nome,
      rotulo: campo.rotulo,
      tipo: campo.tipo,
      opcoesLista: campo.opcoesLista,
      obrigatorio: campo.obrigatorio,
      ordem: campo.ordem,
      podeEditar: this.permissao(campo, papel).podeEditar,
      valor: valorPorCampo.get(campo.id) ?? null,
    }));
  }

  async salvarValores(dto: SalvarValoresDto, papel: PapelUsuario): Promise<CampoComValor[]> {
    const campos = await this.camposRepo.find({
      where: { entidade: dto.entidade, ativo: true },
      relations: { permissoes: true },
    });

    const camposPorId = new Map(campos.map((c) => [c.id, c]));

    for (const item of dto.valores) {
      const campo = camposPorId.get(item.campoId);
      if (!campo) continue; // campo inexistente/inativo: ignora silenciosamente
      if (!this.permissao(campo, papel).podeEditar) continue; // sem permissão: ignora, não quebra o request

      if (campo.obrigatorio && (item.valor === null || item.valor === undefined || item.valor === '')) {
        throw new BadRequestException(`O campo "${campo.rotulo}" é obrigatório.`);
      }

      const existente = await this.valoresRepo.findOne({
        where: { campoId: item.campoId, entidadeId: dto.entidadeId },
      });
      if (existente) {
        existente.valor = item.valor ?? null;
        await this.valoresRepo.save(existente);
      } else {
        await this.valoresRepo.save(
          this.valoresRepo.create({ campoId: item.campoId, entidadeId: dto.entidadeId, valor: item.valor ?? null }),
        );
      }
    }

    return this.buscarValoresParaEntidade(dto.entidade, dto.entidadeId, papel);
  }

  // ---------- Helpers ----------

  // Ausência de regra explícita = permissivo (ver + editar). Isso segue o
  // mesmo racional documentado no plano de migração: preservamos a
  // capacidade de restringir por papel, mas com padrão seguro (não quebra
  // nada até alguém deliberadamente restringir um campo).
  private permissao(campo: CampoCustomizado, papel: PapelUsuario): { podeVer: boolean; podeEditar: boolean } {
    const regra = campo.permissoes?.find((p) => p.papel === papel);
    if (!regra) return { podeVer: true, podeEditar: true };
    return { podeVer: regra.podeVer, podeEditar: regra.podeEditar };
  }

  private gerarNomeInterno(rotulo: string): string {
    const base = rotulo
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return `${base}_${Date.now().toString(36)}`;
  }
}
