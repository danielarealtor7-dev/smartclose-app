-- Migration: Enhance tasks and task_templates
-- Adds priority, notes, related_document_id, completed_at, completed_by to tasks
-- Adds conditional rules to task_templates

-- 1. Alter tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'MEDIUM',
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS related_document_id uuid, -- could refer to a documents table later
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS completed_by uuid references public.users(id) ON DELETE SET NULL;

-- 2. Alter task_templates table for conditional rules
ALTER TABLE public.task_templates
ADD COLUMN IF NOT EXISTS condition_property_type text, -- e.g. 'CONDO', 'MANUFACTURED', 'NEW_CONSTRUCTION'
ADD COLUMN IF NOT EXISTS condition_financing_type text; -- e.g. 'FHA', 'VA', 'CASH'

-- 3. Alter task_template_items table to include priority if needed
ALTER TABLE public.task_template_items
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'MEDIUM';
