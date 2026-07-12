-- Sample transactions for manual testing of the dashboard and filters.
-- Run this in the Supabase SQL Editor AFTER creating an account in the app
-- (so the account exists in auth.users). Replace the email below first.

do $$
declare
  target_user_id uuid;
begin
  select id into target_user_id from auth.users where email = 'voce@exemplo.com';

  if target_user_id is null then
    raise exception 'Nenhum usuário encontrado com esse e-mail. Crie uma conta no app primeiro e ajuste o e-mail neste script.';
  end if;

  insert into public.transactions
    (user_id, description, amount, transaction_date, type, category)
  values
    (target_user_id, 'Salário', 5000.00, date_trunc('month', current_date)::date + 4, 'income', 'Salário'),
    (target_user_id, 'Freelance', 800.00, date_trunc('month', current_date)::date + 9, 'income', 'Freelance'),
    (target_user_id, 'Aluguel', 1800.00, date_trunc('month', current_date)::date + 4, 'expense', 'Moradia'),
    (target_user_id, 'Supermercado', 420.50, date_trunc('month', current_date)::date + 7, 'expense', 'Alimentação'),
    (target_user_id, 'Uber', 32.90, date_trunc('month', current_date)::date + 9, 'expense', 'Transporte'),
    (target_user_id, 'Cinema', 60.00, date_trunc('month', current_date)::date + 12, 'expense', 'Lazer'),
    (target_user_id, 'Farmácia', 89.90, date_trunc('month', current_date)::date + 14, 'expense', 'Saúde'),
    (target_user_id, 'Curso online', 120.00, date_trunc('month', current_date)::date + 15, 'expense', 'Educação'),
    (target_user_id, 'Presente', 75.00, date_trunc('month', current_date)::date + 18, 'expense', 'Outros');
end $$;
