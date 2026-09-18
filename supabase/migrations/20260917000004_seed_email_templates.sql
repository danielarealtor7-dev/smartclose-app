-- Seed Email Templates

DO $$ 
DECLARE
    org_id_var uuid;
BEGIN
    SELECT id INTO org_id_var FROM public.organizations LIMIT 1;
    
    IF org_id_var IS NOT NULL THEN
        -- 1. Open Title Order
        INSERT INTO public.email_templates (org_id, name, subject_template, body_template)
        VALUES (org_id_var, 'Open Title Order', 'New Title Order: {{property_address}}', 'Hello {{title_contact}},\n\nPlease open a new title order for the property located at {{property_address}}.\n\nBuyer: {{buyer_name}}\nSeller: {{seller_name}}\nClosing Date: {{closing_date}}\n\nPlease let me know what else you need from our end.\n\nThanks,\n{{tc_name}}');
        
        -- 2. EMD Instructions and Fraud Warning
        INSERT INTO public.email_templates (org_id, name, subject_template, body_template)
        VALUES (org_id_var, 'EMD Instructions and Fraud Warning', 'IMPORTANT: Earnest Money Instructions for {{property_address}}', 'Hello {{buyer_name}},\n\nCongratulations on getting your offer accepted for {{property_address}}!\n\nPlease find the attached instructions for sending your Earnest Money Deposit (EMD). \n\nFRAUD WARNING: Always verify wire instructions over a phone call to a known number before sending any funds. We will never email you updated wire instructions.\n\nThanks,\n{{tc_name}}');
        
        -- 3. EMD Receipt Follow-Up
        INSERT INTO public.email_templates (org_id, name, subject_template, body_template)
        VALUES (org_id_var, 'EMD Receipt Follow-Up', 'EMD Status Update: {{property_address}}', 'Hello {{title_contact}},\n\nCould you please confirm if the EMD for {{property_address}} has been received from {{buyer_name}}?\n\nThanks,\n{{tc_name}}');

        -- 4. Inspection Reminder
        INSERT INTO public.email_templates (org_id, name, subject_template, body_template)
        VALUES (org_id_var, 'Inspection Reminder', 'Reminder: Inspection Deadline Approaching for {{property_address}}', 'Hello {{buyer_name}},\n\nThis is a friendly reminder that the inspection deadline for {{property_address}} is approaching on {{inspection_deadline}}.\n\nPlease ensure all inspections are completed by this date.\n\nThanks,\n{{tc_name}}');
        
        -- 5. Request Seller Disclosure
        INSERT INTO public.email_templates (org_id, name, subject_template, body_template)
        VALUES (org_id_var, 'Request Seller Disclosure', 'Request: Seller Disclosure for {{property_address}}', 'Hello,\n\nPlease provide the Seller Disclosure documents for {{property_address}}.\n\nThanks,\n{{tc_name}}');

        -- 6. Request Title Commitment
        INSERT INTO public.email_templates (org_id, name, subject_template, body_template)
        VALUES (org_id_var, 'Request Title Commitment', 'Request: Title Commitment for {{property_address}}', 'Hello {{title_contact}},\n\nPlease provide the Title Commitment for {{property_address}} as soon as it is available.\n\nThanks,\n{{tc_name}}');

        -- 7. Lender Status Follow-Up
        INSERT INTO public.email_templates (org_id, name, subject_template, body_template)
        VALUES (org_id_var, 'Lender Status Follow-Up', 'Loan Status Update: {{property_address}}', 'Hello {{lender_name}},\n\nCould you please provide a status update on the loan for {{buyer_name}} at {{property_address}}?\n\nThanks,\n{{tc_name}}');

        -- 8. Insurance Follow-Up
        INSERT INTO public.email_templates (org_id, name, subject_template, body_template)
        VALUES (org_id_var, 'Insurance Follow-Up', 'Insurance Binder Needed: {{property_address}}', 'Hello {{buyer_name}},\n\nPlease provide the insurance binder for {{property_address}} as soon as possible so the lender can finalize the loan.\n\nThanks,\n{{tc_name}}');

        -- 9. Closing Confirmation
        INSERT INTO public.email_templates (org_id, name, subject_template, body_template)
        VALUES (org_id_var, 'Closing Confirmation', 'Closing Confirmed: {{property_address}}', 'Hello Everyone,\n\nThe closing for {{property_address}} has been confirmed for {{closing_date}} at {{title_company}}.\n\nThanks,\n{{tc_name}}');

        -- 10. Final Walk-Through Reminder
        INSERT INTO public.email_templates (org_id, name, subject_template, body_template)
        VALUES (org_id_var, 'Final Walk-Through Reminder', 'Reminder: Final Walk-Through for {{property_address}}', 'Hello {{buyer_name}},\n\nThis is a reminder to schedule and complete your final walk-through for {{property_address}} before closing on {{closing_date}}.\n\nThanks,\n{{tc_name}}');

        -- 11. Post-Closing Confirmation
        INSERT INTO public.email_templates (org_id, name, subject_template, body_template)
        VALUES (org_id_var, 'Post-Closing Confirmation', 'Congratulations! Closing Complete for {{property_address}}', 'Hello {{buyer_name}},\n\nCongratulations on the successful closing of {{property_address}}! It was a pleasure working with you.\n\nThanks,\n{{tc_name}}');
        
    END IF;
END $$;
