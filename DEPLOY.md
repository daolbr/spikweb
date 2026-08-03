# Deploy — Supabase (banco) + Vercel (backend + frontend)

Roteiro testado e validado. Leva uns 15-20 minutos.

## 1. Banco de dados no Supabase

1. Em [supabase.com/dashboard](https://supabase.com/dashboard), crie um novo projeto.
2. Vá em **Database → SQL Editor → New query**, cole o conteúdo de `backend/schema-supabase.sql` e clique em **Run**.
3. Confirme em **Table Editor** que apareceram 10 tabelas (`usuarios`, `empresas`, `contatos`, `oportunidades`, `historico_oportunidades`, `atividades`, `propostas`, `itens_proposta`, `campanhas`, `projetos`).

## 2. Pegar a connection string (pooler, para uso serverless)

1. Na página do projeto, clique no botão **Connect** (topo da tela).
2. Escolha a aba **Transaction pooler** (porta `6543`) — importante: não é a "Direct connection". Funções serverless do Vercel abrem/fecham conexões o tempo todo, e a conexão direta do Postgres esgota rápido nesse padrão de uso; o pooler foi feito pra isso.
3. Copie a string, algo como:
   ```
   postgresql://postgres.xxxxxxxxxxxx:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

## 3. Publicar o backend no Vercel

1. Suba o código para um repositório no GitHub, se ainda não tiver um.
2. No painel do Vercel, **Add New → Project**, importe o repositório.
3. Em **Root Directory**, aponte para a pasta `backend`.
4. O Vercel detecta automaticamente a função serverless em `api/index.ts` — o `vercel.json` usa só `rewrites` (formato moderno). Se você criou o projeto antes desta correção, confirme que `backend/vercel.json` tem apenas `{ "rewrites": [...] }`, sem a chave `builds` (o formato antigo causava um 404 silencioso).
5. Configure as variáveis de ambiente (**Settings → Environment Variables**):
   ```
   DATABASE_URL = postgresql://postgres.xxxxxxxxxxxx:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   DB_SSL = true
   DB_SYNCHRONIZE = false
   JWT_SECRET = (gere um segredo forte e aleatório)
   JWT_EXPIRES_IN = 8h
   ```
6. Deploy. Anote a URL gerada (ex.: `https://spikcrm-backend.vercel.app`).
7. Teste: `curl https://spikcrm-backend.vercel.app/api/empresas` deve devolver `{"message":"Unauthorized","statusCode":401}` — sinal de que a API está no ar (o 401 é esperado, é uma rota protegida).

## 4. Publicar o frontend no Vercel

1. **Add New → Project** de novo, mesmo repositório, **Root Directory** = `frontend`.
2. Vercel detecta Vite automaticamente.
3. Variável de ambiente:
   ```
   VITE_API_URL = https://spikcrm-backend.vercel.app/api
   ```
   (troque pela URL real do backend do passo 3)
4. Deploy.

## 5. Criar o primeiro usuário

```bash
curl -X POST https://spikcrm-backend.vercel.app/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin","email":"voce@empresa.com","senha":"escolha-uma-senha","papel":"ADMIN"}'
```

Depois é só acessar a URL do frontend e logar.

## Observações

- O endpoint `/auth/registrar` continua aberto mesmo em produção — depois de criar seu usuário admin, considere proteger esse endpoint (ver `README.md`, seção "Pendências").
- Cold starts: a primeira requisição depois de um tempo ocioso pode demorar 1-2s a mais (instância do Nest é criada na hora). Normal.
- Se você colou a senha do banco em algum lugar exposto (ex. chat, commit público), troque-a em **Database Settings → Reset database password** no Supabase.
