import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposta } from './proposta.entity';
import { ItemProposta } from './item-proposta.entity';
import { PropostasService } from './propostas.service';
import { PropostasController } from './propostas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Proposta, ItemProposta])],
  providers: [PropostasService],
  controllers: [PropostasController],
})
export class PropostasModule {}
