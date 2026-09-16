-- Drop old date tables if they exist to replace them with the comprehensive system
drop table if exists public.date_audit_logs;
drop table if exists public.dates_and_contingencies;

-- Create transaction_dates table
create table public.transaction_dates (
    id uuid default uuid_generate_v4() primary key,
    transaction_id uuid references public.transactions(id) on delete cascade not null,
    name text not null,
    type text not null,
    due_date date not null,
    due_time time without time zone,
    original_date date not null,
    responsible_id uuid references public.contacts(id) on delete set null,
    contractual_source text,
    related_document_id uuid references public.documents(id) on delete set null,
    status text not null check (status in ('PENDING', 'COMPLETED', 'WAIVED', 'EXTENDED')),
    reminders jsonb default '[]'::jsonb,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create deadline_changes table for tracking extensions
create table public.deadline_changes (
    id uuid default uuid_generate_v4() primary key,
    transaction_date_id uuid references public.transaction_dates(id) on delete cascade not null,
    old_date date not null,
    new_date date not null,
    reason text not null,
    addendum_url text,
    changed_by uuid references public.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_transaction_dates_tx_id on public.transaction_dates(transaction_id);
create index idx_transaction_dates_due_date on public.transaction_dates(due_date);
create index idx_deadline_changes_date_id on public.deadline_changes(transaction_date_id);

-- Row Level Security
alter table public.transaction_dates enable row level security;
alter table public.deadline_changes enable row level security;

create policy "Users can manage transaction dates"
on public.transaction_dates for all
using (exists (select 1 from public.transactions t where t.id = transaction_id));

create policy "Users can manage deadline changes"
on public.deadline_changes for all
using (exists (
    select 1 from public.transaction_dates d 
    join public.transactions t on d.transaction_id = t.id 
    where d.id = transaction_date_id
));
