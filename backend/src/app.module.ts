import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { EmpresasModule } from './empresas/empresas.module';
import { ContatosModule } from './contatos/contatos.module';
import { OportunidadesModule } from './oportunidades/oportunidades.module';
import { AtividadesModule } from './atividades/atividades.module';
import { PropostasModule } from './propostas/propostas.module';
import { CampanhasModule } from './campanhas/campanhas.module';
import { ProjetosModule } from './projetos/projetos.module';
import { IndicadoresModule } from './indicadores/indicadores.module';
import { CamposCustomizadosModule } from './campos-customizados/campos-customizados.module';
import { Usuario } from './usuarios/usuario.entity';
import { Empresa } from './empresas/empresa.entity';
import { Contato } from './contatos/contato.entity';
import { Oportunidade } from './oportunidades/oportunidade.entity';
import { HistoricoOportunidade } from './oportunidades/historico-oportunidade.entity';
import { Atividade } from './atividades/atividade.entity';
import { Proposta } from './propostas/proposta.entity';
import { ItemProposta } from './propostas/item-proposta.entity';
import { Campanha } from './campanhas/campanha.entity';
import { Projeto } from './projetos/projeto.entity';
import { CampoCustomizado } from './campos-customizados/campo-customizado.entity';
import { PermissaoCampo } from './campos-customizados/permissao-campo.entity';
import { ValorCampoCustomizado } from './campos-customizados/valor-campo-customizado.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [
          Usuario,
          Empresa,
          Contato,
          Oportunidade,
          HistoricoOportunidade,
          Atividade,
          Proposta,
          ItemProposta,
          Campanha,
          Projeto,
          CampoCustomizado,
          PermissaoCampo,
          ValorCampoCustomizado,
        ],
        // synchronize=true é aceitável em desenvolvimento inicial deste MVP.
        // Antes de produção, trocar para migrations versionadas do TypeORM.
        synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
        ssl: config.get<string>('DB_SSL') === 'false' ? false : { rejectUnauthorized: false },
        logging: false,
      }),
    }),
    AuthModule,
    UsuariosModule,
    EmpresasModule,
    ContatosModule,
    OportunidadesModule,
    AtividadesModule,
    PropostasModule,
    CampanhasModule,
    ProjetosModule,
    IndicadoresModule,
    CamposCustomizadosModule,
  ],
})
export class AppModule {}
