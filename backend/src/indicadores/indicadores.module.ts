import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oportunidade } from '../oportunidades/oportunidade.entity';
import { Atividade } from '../atividades/atividade.entity';
import { Proposta } from '../propostas/proposta.entity';
import { IndicadoresService } from './indicadores.service';
import { IndicadoresController } from './indicadores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Oportunidade, Atividade, Proposta])],
  providers: [IndicadoresService],
  controllers: [IndicadoresController],
})
export class IndicadoresModule {}
