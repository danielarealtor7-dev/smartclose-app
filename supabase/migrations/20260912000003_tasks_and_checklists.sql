-- Migration: Tasks and Checklists enhancements

-- 1. Create Task Templates Table
create table public.task_templates (
    id uuid default uuid_generate_v4() primary key,
    org_id uuid references public.organizations(id) on delete cascade not null,
    name text not null,
    description text,
    transaction_side text, -- 'BUYER', 'SELLER', 'DUAL', etc.
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Task Template Items
create table public.task_template_items (
    id uuid default uuid_generate_v4() primary key,
    template_id uuid references public.task_templates(id) on delete cascade not null,
    title text not null,
    description text,
    category text,
    relative_due_days integer,
    reference_date_type text, -- e.g., 'EFFECTIVE_DATE', 'CLOSING_DATE'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enhance existing tasks table
alter table public.tasks 
add column description text,
add column waiting_on text,
add column category text,
add column related_date_id uuid references public.transaction_dates(id) on delete set null;

-- NOTE: existing tasks table already has: id, transaction_id, title, due_date, status, assigned_to, created_at

-- 4. Enable RLS
alter table public.task_templates enable row level security;
alter table public.task_template_items enable row level security;

-- 5. RLS Policies
create policy "Users can manage task templates in their org"
on public.task_templates for all
using (org_id = (select org_id from public.users where auth_id = auth.uid() limit 1));

create policy "Users can manage task template items in their org"
on public.task_template_items for all
using (exists (
    select 1 from public.task_templates t 
    where t.id = template_id and t.org_id = (select org_id from public.users where auth_id = auth.uid() limit 1)
));
