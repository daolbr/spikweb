# Deploy — Supabase (banco) + Vercel (backend + frontend)

Este guia assume que você já conectou Supabase e Vercel nas suas contas. Leva uns 10-15 minutos.

## 1. Banco de dados no Supabase

1. Em [supabase.com/dashboard](https://supabase.com/dashboard), crie um novo projeto (região mais próxima de você, senha forte do banco).
2. Depois de criado, vá em **Project Settings → Database → Connection string** e copie a string no formato **URI** (não a "Session pooler" nem a "Transaction pooler" — use a conexão direta para este passo). Vai parecer com:
   ```
   postgresql://postgres:[SUA-SENHA]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```

## 2. Criar as tabelas (uma vez, localmente)

O projeto usa TypeORM com `synchronize` — a forma mais simples de criar o schema é rodar o backend **uma vez, localmente**, apontando para o Supabase:

```bash
cd backend
npm install
```

Edite `backend/.env` temporariamente:
```
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.xxxxxxxxxxxx.supabase.co:5432/postgres"
DB_SSL=true
DB_SYNCHRONIZE=true
JWT_SECRET="gere-um-segredo-forte-aqui"
JWT_EXPIRES_IN=8h
PORT=3001
```

Rode:
```bash
npm run start:dev
```

Ao subir, o TypeORM cria todas as tabelas no Supabase automaticamente. Depois que aparecer "Nest application successfully started", pode parar o processo (Ctrl+C) — as tabelas já existem. Confirme no Supabase em **Table Editor** que as tabelas apareceram (`empresas`, `contatos`, `oportunidades`, etc.).

**Importante**: depois deste passo, mude `DB_SYNCHRONIZE=false` nas variáveis de ambiente de produção (passo 4) — deixar `true` em produção é arriscado (o TypeORM pode tentar alterar o schema a cada novo deploy).

## 3. Publicar o backend no Vercel

1. Suba o código para um repositório no GitHub (se ainda não tiver um).
2. No painel do Vercel, **Add New → Project**, importe o repositório.
3. Em **Root Directory**, aponte para a pasta `backend`.
4. Vercel deve detectar o `vercel.json` automaticamente (já está no projeto, configurando a função serverless em `api/index.ts`).
5. Configure as variáveis de ambiente do projeto (**Settings → Environment Variables**):
   ```
   DATABASE_URL = postgresql://postgres:[SUA-SENHA]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   DB_SSL = true
   DB_SYNCHRONIZE = false
   JWT_SECRET = (o mesmo segredo forte do passo 2, ou gere outro)
   JWT_EXPIRES_IN = 8h
   ```
6. Deploy. Anote a URL gerada (algo como `https://spikcrm-backend.vercel.app`).
7. Teste: `curl https://spikcrm-backend.vercel.app/api/empresas` deve retornar `{"message":"Unauthorized","statusCode":401}` — sinal de que a API está no ar.

## 4. Publicar o frontend no Vercel

1. **Add New → Project** de novo, mesmo repositório, mas com **Root Directory** = `frontend`.
2. O Vercel detecta Vite automaticamente (build command `npm run build`, output `dist`).
3. Variável de ambiente:
   ```
   VITE_API_URL = https://spikcrm-backend.vercel.app/api
   ```
   (troque pela URL real do backend do passo 3)
4. Deploy.

## 5. Criar o primeiro usuário

Com o backend no ar:
```bash
curl -X POST https://spikcrm-backend.vercel.app/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin","email":"voce@empresa.com","senha":"escolha-uma-senha","papel":"ADMIN"}'
```

Depois é só acessar a URL do frontend e logar.

## Observações

- O endpoint `/auth/registrar` continua aberto (sem autenticação) mesmo em produção — depois de criar seu usuário admin, considere proteger esse endpoint (ver `README.md`, seção "Pendências").
- Cold starts: como o backend roda como função serverless, a primeira requisição depois de um tempo ocioso pode demorar 1-2 segundos a mais (a instância do Nest é criada na hora). É normal e não indica erro.
- Se quiser evitar cold starts e ter mais controle sobre o backend (WebSockets, conexões persistentes, etc.), Railway ou Render — que rodam o backend como um servidor sempre ligado, não serverless — são alternativas mais simples para esse tipo de app. O `docker-compose.yml` do projeto já serve para isso sem adaptação nenhuma.
