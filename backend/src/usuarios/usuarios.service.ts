import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  async criar(dto: CriarUsuarioDto): Promise<Usuario> {
    const existente = await this.usuariosRepo.findOne({
      where: { email: dto.email },
    });
    if (existente) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }
    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const usuario = this.usuariosRepo.create({
      nome: dto.nome,
      email: dto.email,
      senhaHash,
      papel: dto.papel,
    });
    return this.usuariosRepo.save(usuario);
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepo.findOne({ where: { email } });
  }

  async buscarPorId(id: string): Promise<Usuario> {
    const usuario = await this.usuariosRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado.');
    return usuario;
  }
}
