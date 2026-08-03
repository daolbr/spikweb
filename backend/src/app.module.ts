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
        ],
        // O Supabase (como a maioria dos Postgres gerenciados) exige SSL.
        ssl: config.get<string>('DB_SSL') === 'false' ? false : { rejectUnauthorized: false },
        // Em produção, synchronize fica desligado por padrão — rode a
        // sincronização uma vez manualmente (ver DEPLOY.md) e depois
        // trate mudanças de schema via migration, não em cada boot.
        synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
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
  ],
})
export class AppModule {}
