import { z } from 'zod'

export const TransactionSideSchema = z.enum(['BUYER', 'LISTING', 'DUAL'])
export const FinancingTypeSchema = z.enum(['FHA', 'VA', 'CONVENTIONAL', 'CASH', 'OTHER'])
export const PropertyTypeSchema = z.enum(['SINGLE_FAMILY', 'CONDO', 'MANUFACTURED', 'NEW_CONSTRUCTION', 'OTHER'])
export const TransactionStatusSchema = z.enum(['ACTIVE', 'PENDING', 'CLOSED', 'CANCELLED'])

export const TransactionSchema = z.object({
  id: z.string().uuid().optional(),
  org_id: z.string().uuid().optional(),
  
  // Property Info
  property_address: z.string().min(1, 'Property address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip_code: z.string().min(5, 'ZIP is required'),
  property_type: PropertyTypeSchema.default('SINGLE_FAMILY'),
  
  // Transaction Details
  transaction_side: TransactionSideSchema,
  status: TransactionStatusSchema.default('ACTIVE'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  emd_amount: z.coerce.number().min(0, 'EMD must be positive').optional(),
  financing_type: FinancingTypeSchema.default('CONVENTIONAL'),
  
  // People (Names)
  buyer_names: z.string().optional(),
  seller_names: z.string().optional(),
  
  // Contacts (IDs)
  buyer_agent_id: z.string().uuid().nullable().optional(),
  listing_agent_id: z.string().uuid().nullable().optional(),
  escrow_agent_id: z.string().uuid().nullable().optional(),
  lender_id: z.string().uuid().nullable().optional(),
  title_company_id: z.string().uuid().nullable().optional(),
  assigned_tc_id: z.string().uuid().nullable().optional(),
  
  // Dates
  effective_date: z.string().optional().nullable(),
  closing_date: z.string().optional().nullable(),
  
  // Misc
  notes: z.string().optional(),
  is_archived: z.boolean().default(false),
})

export type Transaction = z.infer<typeof TransactionSchema>

export const DateStatusSchema = z.enum(['PENDING', 'COMPLETED', 'WAIVED', 'EXTENDED'])

export const TransactionDateSchema = z.object({
  id: z.string().uuid().optional(),
  transaction_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  due_time: z.string().optional().nullable(),
  original_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  responsible_id: z.string().uuid().optional().nullable(),
  contractual_source: z.string().optional().nullable(),
  related_document_id: z.string().uuid().optional().nullable(),
  status: DateStatusSchema.default('PENDING'),
  reminders: z.any().optional(),
  notes: z.string().optional().nullable(),
})

export type TransactionDate = z.infer<typeof TransactionDateSchema>

export const DeadlineChangeSchema = z.object({
  id: z.string().uuid().optional(),
  transaction_date_id: z.string().uuid(),
  old_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  new_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  reason: z.string().min(1, 'Reason is required'),
  addendum_url: z.string().optional().nullable(),
  changed_by: z.string().uuid().optional().nullable(),
})

export type DeadlineChange = z.infer<typeof DeadlineChangeSchema>

export const TaskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE'])

export const TaskSchema = z.object({
  id: z.string().uuid().optional(),
  transaction_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional().nullable(),
  status: TaskStatusSchema.default('TODO'),
  assigned_to: z.string().uuid().optional().nullable(),
  waiting_on: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  related_date_id: z.string().uuid().optional().nullable(),
})

export type Task = z.infer<typeof TaskSchema>

export const TaskTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  org_id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  transaction_side: z.string().optional().nullable(),
})

export type TaskTemplate = z.infer<typeof TaskTemplateSchema>

export const TaskTemplateItemSchema = z.object({
  id: z.string().uuid().optional(),
  template_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  relative_due_days: z.coerce.number().optional().nullable(),
  reference_date_type: z.string().optional().nullable(),
})

export type TaskTemplateItem = z.infer<typeof TaskTemplateItemSchema>
