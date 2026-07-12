# Configurando o Supabase

Este projeto usa o Supabase como backend (banco de dados Postgres + autenticação). Siga os passos abaixo para conectar o app a um projeto Supabase real.

## 1. Criar o projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta (ou faça login).
2. Clique em **New Project**, escolha uma organização, dê um nome (ex.: `gestao-financeira`) e uma senha para o banco de dados.
3. Escolha a região mais próxima de você e aguarde a criação do projeto (leva cerca de 1-2 minutos).

## 2. Copiar as credenciais

1. No painel do projeto, vá em **Project Settings > API**.
2. Copie o **Project URL** e a chave **anon public**.
3. Na raiz do projeto, copie `.env.local.example` para `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Preencha as variáveis:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
   ```

## 3. Rodar a migration

1. No painel do Supabase, vá em **SQL Editor**.
2. Abra o arquivo `supabase/migrations/0001_init.sql` deste repositório, copie todo o conteúdo e cole no editor.
3. Clique em **Run**.
4. Confirme em **Table Editor** que a tabela `transactions` foi criada, com Row Level Security habilitado (ícone de cadeado).

## 4. Configurar autenticação

1. Vá em **Authentication > URL Configuration** e defina o **Site URL** como `http://localhost:3000` (ajuste depois para a URL de produção quando fizer o deploy).
2. (Opcional, recomendado para testes locais) Em **Authentication > Providers > Email**, desative **Confirm email** para poder testar login logo após o cadastro, sem precisar confirmar por e-mail.

## 5. Testar a conexão

Com `.env.local` preenchido, rode:

```bash
npm run dev
```

O app deve iniciar sem erros. As telas de login/cadastro (implementadas na próxima etapa) usarão essas credenciais para autenticar via Supabase Auth, e cada usuário só verá suas próprias transações graças às políticas de Row Level Security definidas na migration.
