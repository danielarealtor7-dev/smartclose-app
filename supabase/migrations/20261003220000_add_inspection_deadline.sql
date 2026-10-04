-- Add inspection_deadline to transactions table
alter table public.transactions
  add column if not exists inspection_deadline date;
