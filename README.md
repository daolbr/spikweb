# Spik CRM — Web (fundação do MVP)

Reescrita do CRM Spik (originalmente VB6 + SQL Server) como aplicação web moderna. Este pacote contém o **primeiro módulo funcional ponta a ponta**: autenticação + Empresas + Contatos, já testado contra um PostgreSQL real.

Stack: **NestJS + TypeORM + PostgreSQL** (backend) · **React + Vite + TypeScript + TailwindCSS** (frontend).

---

## Rodando com Docker (recomendado)

```bash
docker compose up --build
```

- Backend: http://localhost:3001/api
- Frontend: http://localhost:5173
- Postgres: localhost:5432 (usuário/senha: `postgres`/`postgres`, banco `spikcrm`)

Na primeira subida, o TypeORM cria as tabelas automaticamente (`synchronize: true` — ver nota sobre produção abaixo).

## Rodando manualmente (sem Docker)

### 1. Banco de dados
Suba um PostgreSQL 16 local e crie o banco `spikcrm`. Ajuste `backend/.env` se as credenciais forem diferentes de `postgres`/`postgres`.

### 2. Backend
```bash
cd backend
npm install
npm run start:dev
```
API sobe em `http://localhost:3001/api`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
App sobe em `http://localhost:5173`.

---

## Criando o primeiro usuário

Ainda não há tela de "criar conta" no frontend (decisão consciente: cadastro de usuário é uma ação administrativa, não self-service). Crie o primeiro usuário via API:

```bash
curl -X POST http://localhost:3001/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin","email":"admin@spik.com","senha":"senha123","papel":"ADMIN"}'
```

Depois faça login normalmente pela tela em `/login`. Você cai direto no Dashboard de indicadores — comece cadastrando uma Empresa, depois uma Oportunidade vinculada a ela, para ver os números do dashboard mudarem.

⚠️ O endpoint `/auth/registrar` está aberto (sem autenticação) para facilitar o bootstrap deste MVP. **Antes de ir para produção, proteja esse endpoint** para exigir um usuário ADMIN autenticado (ver seção "Pendências" abaixo).

---

## O que está implementado

- **Autenticação JWT** (`/auth/login`, `/auth/registrar`)
- **Autorização por papel** (ADMIN / GESTOR / VENDEDOR) via guards reutilizáveis (`@Papeis(...)`)
- **Empresas**: listar (com busca e paginação), buscar por id, criar, atualizar, remover
- **Contatos**: listar por empresa, buscar por id, criar, atualizar, remover
- **Oportunidades / Funil de vendas**: CRUD completo, endpoint `/oportunidades/funil` agrupado por estágio (pronto para Kanban), mudança de estágio com log automático de histórico, anotações manuais de acompanhamento
- **Atividades / Agenda**: CRUD, vínculo opcional com contato e oportunidade, marcar como concluída/cancelada, filtro por empresa e por intervalo de datas
- **Propostas / Itens**: CRUD de propostas, itens com recálculo automático do valor total, mudança de status (rascunho → enviada → aprovada/recusada)
- **Campanhas**: CRUD simples com orçamento e status
- **Projetos**: CRUD simples vinculado a empresa, com status
- **Indicadores (BI)**: endpoint `/indicadores/resumo` agregando valor de pipeline por estágio, taxa de conversão, atividades pendentes/atrasadas e receita aprovada — tudo calculado com queries reais, não hardcoded
- **Frontend**: login · **Dashboard de indicadores** · **Kanban do funil de vendas com drag-and-drop** · **Agenda** agrupada por dia · Empresas com CRUD de contatos · **Propostas com gestão de itens e total recalculado ao vivo** · Campanhas · Projetos

## Estrutura de pastas

```
backend/
  src/
    auth/          # login, JWT strategy, guards
    usuarios/       # entidade e serviço de usuários
    empresas/       # entidade, serviço, controller de Empresas
    contatos/       # entidade, serviço, controller de Contatos
    oportunidades/  # entidade, histórico, serviço, controller do funil de vendas
    atividades/     # entidade, serviço, controller de atividades/agenda
    propostas/      # entidade, itens, serviço, controller de propostas
    campanhas/      # entidade, serviço, controller de campanhas
    projetos/       # entidade, serviço, controller de projetos
    indicadores/    # serviço/controller de BI (queries agregadas)
    common/         # guards e decorators reutilizáveis (autorização por papel)
frontend/
  src/
    api/            # cliente axios + tipos compartilhados
    auth/           # contexto de autenticação + rota protegida
    components/     # layout com navegação lateral, drawer de detalhe da oportunidade
    pages/          # Dashboard, Login, Empresas, EmpresaDetalhe, Oportunidades (Kanban),
                     # Agenda, Propostas, PropostaDetalhe, Campanhas, Projetos
```

## Pendências antes de produção

1. **Trocar `synchronize: true` por migrations versionadas do TypeORM** (`typeorm migration:generate`) — sincronização automática de schema é perigosa em produção.
2. **Proteger `/auth/registrar`** para exigir papel ADMIN autenticado.
3. **Restaurar o `SpikMatriz.bak` (SQL Server de produção do legado)** para confirmar se o schema demo (Access) usado como base está completo — ver `plano_migracao_spik_crm.md`.
4. **Motor de metadados**: este MVP usa papéis fixos (ADMIN/GESTOR/VENDEDOR) como aproximação simplificada do motor de regras dinâmicas do legado (`SPM_REGRA`/`SPM_RESTRITAB`). Se a configurabilidade por campo/cliente for um requisito real de negócio, é o próximo item de arquitetura a evoluir (ver plano de migração, seção 5).
5. **Módulos ainda fora do escopo deste MVP** (não fazem parte do sistema legado analisado com a mesma profundidade, ou foram conscientemente simplificados): Central de Atendimento/Chamados, integração com o ERP externo (dados `XTR_*`), Pesquisas de satisfação, e a administração visual do dicionário de dados (hoje só existe como conceito documentado, não como tela).
6. **Testes automatizados**: este MVP foi validado manualmente via curl em cada módulo (ver histórico da conversa de construção) mas não tem suite de testes automatizados ainda — é o próximo investimento de qualidade antes de crescer o time.
