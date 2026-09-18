-- Migration: Communication Logs and Email Templates

-- 1. Create email_templates table
CREATE TABLE public.email_templates (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    subject_template text NOT NULL,
    body_template text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create communication_logs table
CREATE TABLE public.communication_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL, -- 'Email Draft', 'Email Sent', 'Call', 'SMS', 'Note', 'Follow-Up'
    contact_id uuid, -- Reference to a future contacts table if applicable
    method text,
    subject text,
    summary text NOT NULL,
    follow_up_date timestamp with time zone,
    waiting_on text,
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    related_document_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can manage email templates in their org"
ON public.email_templates FOR ALL
USING (org_id = (SELECT org_id FROM public.users WHERE auth_id = auth.uid() LIMIT 1));

CREATE POLICY "Users can manage communication logs in their org"
ON public.communication_logs FOR ALL
USING (
    transaction_id IN (
        SELECT t.id FROM public.transactions t
        WHERE t.org_id = (SELECT org_id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
    )
);
