import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampoCustomizado } from './campo-customizado.entity';
import { PermissaoCampo } from './permissao-campo.entity';
import { ValorCampoCustomizado } from './valor-campo-customizado.entity';
import { CamposCustomizadosService } from './campos-customizados.service';
import { CamposCustomizadosController } from './campos-customizados.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CampoCustomizado, PermissaoCampo, ValorCampoCustomizado])],
  providers: [CamposCustomizadosService],
  controllers: [CamposCustomizadosController],
})
export class CamposCustomizadosModule {}
