alter table public.transactions
  add column inspector_id uuid references public.contacts(id) on delete set null;
