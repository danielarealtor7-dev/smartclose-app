
-- Seed default templates for the first organization
DO $$ 
DECLARE
    org_id_var uuid;
    fha_template_id uuid;
    va_template_id uuid;
    condo_template_id uuid;
BEGIN
    SELECT id INTO org_id_var FROM public.organizations LIMIT 1;
    
    IF org_id_var IS NOT NULL THEN
        -- 1. FHA Template
        INSERT INTO public.task_templates (org_id, name, description, condition_financing_type)
        VALUES (org_id_var, 'FHA Required Items', 'Tasks required specifically for FHA loans', 'FHA')
        RETURNING id INTO fha_template_id;
        
        INSERT INTO public.task_template_items (template_id, title, category, priority)
        VALUES 
        (fha_template_id, 'FHA Amendatory Clause Signed', 'FINANCING', 'HIGH'),
        (fha_template_id, 'Real Estate Certification Signed', 'FINANCING', 'HIGH'),
        (fha_template_id, 'FHA Appraisal Ordered', 'APPRAISAL', 'HIGH');
        
        -- 2. VA Template
        INSERT INTO public.task_templates (org_id, name, description, condition_financing_type)
        VALUES (org_id_var, 'VA Required Items', 'Tasks required specifically for VA loans', 'VA')
        RETURNING id INTO va_template_id;
        
        INSERT INTO public.task_template_items (template_id, title, category, priority)
        VALUES 
        (va_template_id, 'VA Escape Clause Signed', 'FINANCING', 'HIGH'),
        (va_template_id, 'Pest Inspection Complete', 'INSPECTION', 'HIGH'),
        (va_template_id, 'VA Appraisal Ordered', 'APPRAISAL', 'HIGH');

        -- 3. Condo Template
        INSERT INTO public.task_templates (org_id, name, description, condition_property_type)
        VALUES (org_id_var, 'Condo / HOA Required Items', 'Tasks required specifically for Condos', 'CONDO')
        RETURNING id INTO condo_template_id;
        
        INSERT INTO public.task_template_items (template_id, title, category, priority)
        VALUES 
        (condo_template_id, 'Request HOA Docs', 'HOA/Condo', 'HIGH'),
        (condo_template_id, 'HOA Application Submitted', 'HOA/Condo', 'HIGH'),
        (condo_template_id, 'HOA Approval Received', 'HOA/Condo', 'HIGH');
        
        -- 4. General Buyer Tasks
        INSERT INTO public.task_templates (org_id, name, description, transaction_side)
        VALUES (org_id_var, 'General Buyer Tasks', 'Default tasks for buyer side', 'BUYER');
        
    END IF;
END $$;
