-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Organizations
create table public.organizations (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Users
create table public.users (
    id uuid default uuid_generate_v4() primary key,
    org_id uuid references public.organizations(id) on delete cascade not null,
    auth_id uuid references auth.users(id) on delete cascade not null,
    email text not null,
    role text not null check (role in ('SUPER_ADMIN', 'ADMIN', 'AGENT', 'ASSISTANT')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (auth_id)
);

-- 3. Transactions
create table public.transactions (
    id uuid default uuid_generate_v4() primary key,
    org_id uuid references public.organizations(id) on delete cascade not null,
    property_address text not null,
    status text not null check (status in ('ACTIVE', 'PENDING', 'CLOSED', 'CANCELLED')),
    price numeric(12, 2),
    closing_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Contacts
create table public.contacts (
    id uuid default uuid_generate_v4() primary key,
    org_id uuid references public.organizations(id) on delete cascade not null,
    first_name text not null,
    last_name text not null,
    role_type text not null,
    email text,
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Transaction Contacts (Many to Many)
create table public.transaction_contacts (
    transaction_id uuid references public.transactions(id) on delete cascade not null,
    contact_id uuid references public.contacts(id) on delete cascade not null,
    role_in_transaction text not null,
    primary key (transaction_id, contact_id)
);

-- 6. Dates and Contingencies
create table public.dates_and_contingencies (
    id uuid default uuid_generate_v4() primary key,
    transaction_id uuid references public.transactions(id) on delete cascade not null,
    title text not null,
    date_value_est date,
    date_value_actual date,
    is_completed boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Date Audit Logs
create table public.date_audit_logs (
    id uuid default uuid_generate_v4() primary key,
    contingency_id uuid references public.dates_and_contingencies(id) on delete cascade not null,
    old_date date,
    new_date date,
    changed_by uuid references public.users(id) on delete set null,
    changed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Tasks
create table public.tasks (
    id uuid default uuid_generate_v4() primary key,
    transaction_id uuid references public.transactions(id) on delete cascade not null,
    title text not null,
    due_date date,
    status text not null check (status in ('TODO', 'IN_PROGRESS', 'DONE')),
    assigned_to uuid references public.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Documents
create table public.documents (
    id uuid default uuid_generate_v4() primary key,
    transaction_id uuid references public.transactions(id) on delete cascade not null,
    file_path text not null,
    file_name text not null,
    uploaded_by uuid references public.users(id) on delete set null,
    uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.transactions enable row level security;
alter table public.contacts enable row level security;
alter table public.transaction_contacts enable row level security;
alter table public.dates_and_contingencies enable row level security;
alter table public.date_audit_logs enable row level security;
alter table public.tasks enable row level security;
alter table public.documents enable row level security;

-- Function to get the current user's org_id
create or replace function get_current_org_id()
returns uuid
language sql security definer
as $$
  select org_id from public.users where auth_id = auth.uid() limit 1;
$$;

-- Policies for Organizations (Users can only read their own org)
create policy "Users can view their own organization"
on public.organizations for select
using (id = get_current_org_id());

-- Policies for Users (Users can read users in their org)
create policy "Users can view users in same org"
on public.users for select
using (org_id = get_current_org_id());

-- Policies for Transactions
create policy "Users can view transactions in their org"
on public.transactions for select
using (org_id = get_current_org_id());

create policy "Users can insert transactions in their org"
on public.transactions for insert
with check (org_id = get_current_org_id());

create policy "Users can update transactions in their org"
on public.transactions for update
using (org_id = get_current_org_id());

create policy "Users can delete transactions in their org"
on public.transactions for delete
using (org_id = get_current_org_id());

-- Policies for Contacts
create policy "Users can manage contacts in their org"
on public.contacts for all
using (org_id = get_current_org_id());

-- Policies for related tables (Transaction Contacts, Dates, Tasks, Documents)
-- These rely on the transaction's org_id via a subquery or join, 
-- but for simplicity and performance in RLS, we check if the transaction is visible to the user.
-- Since transactions has RLS, if they can see the transaction, they can see its related records.

create policy "Users can manage transaction contacts"
on public.transaction_contacts for all
using (exists (select 1 from public.transactions t where t.id = transaction_id));

create policy "Users can manage dates and contingencies"
on public.dates_and_contingencies for all
using (exists (select 1 from public.transactions t where t.id = transaction_id));

create policy "Users can view date audit logs"
on public.date_audit_logs for select
using (exists (
    select 1 from public.dates_and_contingencies d 
    join public.transactions t on d.transaction_id = t.id 
    where d.id = contingency_id
));

create policy "Users can manage tasks"
on public.tasks for all
using (exists (select 1 from public.transactions t where t.id = transaction_id));

create policy "Users can manage documents"
on public.documents for all
using (exists (select 1 from public.transactions t where t.id = transaction_id));
