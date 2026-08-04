import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oportunidade } from '../oportunidades/oportunidade.entity';
import { HistoricoOportunidade } from '../oportunidades/historico-oportunidade.entity';
import { Atividade } from '../atividades/atividade.entity';
import { Empresa } from '../empresas/empresa.entity';
import { BaseInstalada } from '../base-instalada/base-instalada.entity';
import { AutomacoesService } from './automacoes.service';
import { AutomacoesController } from './automacoes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Oportunidade, HistoricoOportunidade, Atividade, Empresa, BaseInstalada])],
  providers: [AutomacoesService],
  controllers: [AutomacoesController],
  exports: [AutomacoesService],
})
export class AutomacoesModule {}
