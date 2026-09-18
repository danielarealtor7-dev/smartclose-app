-- Migration: Excel Importer Tables

CREATE TABLE public.import_batches (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    filename text NOT NULL,
    worksheet text NOT NULL,
    total_rows integer NOT NULL DEFAULT 0,
    imported_rows integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'COMPLETED', -- 'COMPLETED', 'UNDONE'
    created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add metadata columns to transactions
ALTER TABLE public.transactions
ADD COLUMN import_batch_id uuid REFERENCES public.import_batches(id) ON DELETE SET NULL,
ADD COLUMN import_row_number integer;

-- Enable RLS
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage import_batches in their org"
ON public.import_batches FOR ALL
USING (org_id = (SELECT org_id FROM public.users WHERE auth_id = auth.uid() LIMIT 1));
