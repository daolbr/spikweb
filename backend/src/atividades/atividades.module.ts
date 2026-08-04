import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Atividade } from './atividade.entity';
import { AtividadesService } from './atividades.service';
import { AtividadesController } from './atividades.controller';
import { AutomacoesModule } from '../automacoes/automacoes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Atividade]), AutomacoesModule],
  providers: [AtividadesService],
  controllers: [AtividadesController],
})
export class AtividadesModule {}
