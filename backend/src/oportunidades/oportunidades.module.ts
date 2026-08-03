import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oportunidade } from './oportunidade.entity';
import { HistoricoOportunidade } from './historico-oportunidade.entity';
import { OportunidadesService } from './oportunidades.service';
import { OportunidadesController } from './oportunidades.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Oportunidade, HistoricoOportunidade])],
  providers: [OportunidadesService],
  controllers: [OportunidadesController],
})
export class OportunidadesModule {}
