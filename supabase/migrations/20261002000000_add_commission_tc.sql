-- Add TC commission field to transactions
alter table public.transactions
  add column if not exists commission_tc numeric(12, 2);
