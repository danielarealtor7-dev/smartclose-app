-- 1. Expand Transactions Table
alter table public.transactions
  add column transaction_side text check (transaction_side in ('BUYER', 'LISTING', 'DUAL')),
  add column city text,
  add column state text,
  add column zip_code text,
  add column buyer_names text,
  add column seller_names text,
  add column effective_date date,
  add column financing_type text check (financing_type in ('FHA', 'VA', 'CONVENTIONAL', 'CASH', 'OTHER')),
  add column property_type text check (property_type in ('SINGLE_FAMILY', 'CONDO', 'MANUFACTURED', 'NEW_CONSTRUCTION', 'OTHER')),
  add column emd_amount numeric(12, 2),
  add column buyer_agent_id uuid references public.contacts(id) on delete set null,
  add column listing_agent_id uuid references public.contacts(id) on delete set null,
  add column escrow_agent_id uuid references public.contacts(id) on delete set null,
  add column lender_id uuid references public.contacts(id) on delete set null,
  add column title_company_id uuid references public.contacts(id) on delete set null,
  add column assigned_tc_id uuid references public.users(id) on delete set null,
  add column notes text,
  add column is_archived boolean default false not null;

-- 2. Indexes for search and filter performance
create index idx_transactions_org_id on public.transactions(org_id);
create index idx_transactions_status on public.transactions(status);
create index idx_transactions_is_archived on public.transactions(is_archived);
create index idx_transactions_closing_date on public.transactions(closing_date);

-- We'll use ILIKE for search, but GIN indexes are better for text search if needed in the future.
