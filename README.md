# Finanças — Gestão Financeira Pessoal

App web de finanças pessoais: registre receitas e despesas, categorize-as e acompanhe um dashboard mensal com gráfico por categoria. Feito com Next.js (App Router), Tailwind CSS, shadcn/ui e Supabase (Postgres + Auth + Row Level Security).

## Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript, Tailwind CSS v4, shadcn/ui (Base UI)
- **Gráficos**: Recharts
- **Backend**: Supabase (Postgres, Auth, Row Level Security) — sem servidor próprio
- **Deploy**: Vercel

## Pré-requisitos

- Node.js 20+
- Uma conta gratuita no [Supabase](https://supabase.com)

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um projeto no Supabase e rode a migration. Siga o passo a passo em [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).
3. Copie `.env.local.example` para `.env.local` e preencha com as credenciais do seu projeto Supabase:
   ```bash
   cp .env.local.example .env.local
   ```
4. (Opcional) Rode `supabase/seed.sql` no SQL Editor do Supabase, com um usuário já criado, para popular algumas transações de exemplo e testar o dashboard/filtros mais rápido.
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
6. Abra [http://localhost:3000](http://localhost:3000). Crie uma conta em `/signup` para começar a usar.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Roda o build de produção localmente |
| `npm run lint` | Roda o ESLint |

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase (Project Settings > API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon) do projeto Supabase |

## Estrutura do projeto

```
app/
  (marketing)/        # Landing page pública ("/")
  (auth)/              # Login e cadastro
  auth/callback/        # Callback de confirmação de e-mail do Supabase
  (dashboard)/          # Área autenticada (dashboard, transações)
lib/
  supabase/             # Clientes Supabase (browser, server, middleware) e queries
  constants/            # Categorias fixas, cores do gráfico, opções de filtro
  validations/          # Schemas de validação (zod)
supabase/
  migrations/           # SQL: schema da tabela transactions + RLS
docs/
  SUPABASE_SETUP.md     # Passo a passo de configuração do Supabase
```

## Funcionalidades

- Autenticação por e-mail/senha (Supabase Auth), com rotas protegidas
- CRUD de transações (receita/despesa), com categorias fixas
- Dashboard com cards de receita, despesa e saldo do mês, e gráfico de despesas por categoria
- Filtros por mês/ano, categoria e busca por descrição (refletidos na URL)
- Exportação das transações filtradas em CSV
- Layout responsivo (mobile e desktop)
- Row Level Security: cada usuário só acessa suas próprias transações

## Deploy

O projeto está pronto para deploy na [Vercel](https://vercel.com): conecte o repositório e configure as mesmas variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) no painel do projeto. Depois do deploy, atualize a **Site URL** e as **Redirect URLs** em Supabase Authentication > URL Configuration para o domínio de produção.
