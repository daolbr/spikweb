import { SetMetadata } from '@nestjs/common';
import { PapelUsuario } from '../../usuarios/usuario.entity';

export const PAPEIS_KEY = 'papeis';
export const Papeis = (...papeis: PapelUsuario[]) =>
  SetMetadata(PAPEIS_KEY, papeis);
