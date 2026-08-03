import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contato } from './contato.entity';
import { ContatosService } from './contatos.service';
import { ContatosController } from './contatos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contato])],
  providers: [ContatosService],
  controllers: [ContatosController],
})
export class ContatosModule {}
