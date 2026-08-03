import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Projeto } from './projeto.entity';
import { ProjetosService } from './projetos.service';
import { ProjetosController } from './projetos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Projeto])],
  providers: [ProjetosService],
  controllers: [ProjetosController],
})
export class ProjetosModule {}
