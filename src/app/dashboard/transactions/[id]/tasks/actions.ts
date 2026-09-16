'use server'

import { revalidatePath } from 'next/cache'
import { TaskSchema, TaskStatusSchema, type Task } from '@/types'

// MOCK actions for Tasks and Checklists

export async function createTask(data: Record<string, unknown>) {
  const parsed = TaskSchema.parse(data)
  // In a real app: insert into tasks table via Supabase
  console.log('Created task:', parsed)
  revalidatePath(`/dashboard/transactions/${parsed.transaction_id}/tasks`)
  return { success: true, task: parsed }
}

export async function updateTaskStatus(taskId: string, status: string, transactionId: string) {
  const parsedStatus = TaskStatusSchema.parse(status)
  // In a real app: update tasks table via Supabase
  console.log(`Updated task ${taskId} to ${parsedStatus}`)
  revalidatePath(`/dashboard/transactions/${transactionId}/tasks`)
  return { success: true }
}

export async function applyTemplateToTransaction(templateId: string, transactionId: string, referenceDates: Record<string, string>) {
  // 1. Fetch template items
  // 2. Map over items:
  //    if reference_date_type exists and is in referenceDates map:
  //       calculate due_date = referenceDate + item.relative_due_days using addCalendarDays or addBusinessDays
  //    else:
  //       due_date = null
  // 3. Insert into tasks table
  console.log(`Applied template ${templateId} to tx ${transactionId}`)
  revalidatePath(`/dashboard/transactions/${transactionId}/tasks`)
  return { success: true }
}
