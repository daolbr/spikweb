import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campanha } from './campanha.entity';
import { CampanhasService } from './campanhas.service';
import { CampanhasController } from './campanhas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Campanha])],
  providers: [CampanhasService],
  controllers: [CampanhasController],
})
export class CampanhasModule {}
