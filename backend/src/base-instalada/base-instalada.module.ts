import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseInstalada } from './base-instalada.entity';
import { BaseInstaladaService } from './base-instalada.service';
import { BaseInstaladaController } from './base-instalada.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BaseInstalada])],
  providers: [BaseInstaladaService],
  controllers: [BaseInstaladaController],
})
export class BaseInstaladaModule {}
