'use server'

import { createClient } from '@/utils/supabase/server'
import type { Task, TaskTemplateSchema, TaskTemplateItemSchema } from '@/types'
import { z } from 'zod'

export async function generateTransactionTasks(
  transactionId: string, 
  transactionSide: string | null,
  propertyType: string | null,
  financingType: string | null
) {
  const supabase = await createClient()
  
  // 1. Get org_id for current user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase.from('users').select('org_id').eq('auth_id', userData.user.id).single()
  if (!profile?.org_id) throw new Error('Organization not found')
    
  // 2. Fetch all templates for the org
  const { data: templates, error: templatesError } = await supabase.from('task_templates')
    .select('id, name, transaction_side, condition_property_type, condition_financing_type')
    .eq('org_id', profile.org_id)
    
  if (templatesError) throw new Error(templatesError.message)
    
  // 3. Filter templates based on transaction properties
  const validTemplates = templates.filter(t => {
    // Check transaction side (if specified, must match)
    if (t.transaction_side && t.transaction_side !== 'DUAL' && t.transaction_side !== transactionSide) return false
    
    // Check property type (if specified, must match)
    if (t.condition_property_type && t.condition_property_type !== propertyType) return false
    
    // Check financing type (if specified, must match)
    if (t.condition_financing_type && t.condition_financing_type !== financingType) return false
      
    return true
  })
  
  const templateIds = validTemplates.map(t => t.id)
  
  if (templateIds.length === 0) return [] // No templates match
    
  // 4. Fetch all items for valid templates
  const { data: templateItems, error: itemsError } = await (await supabase).from('task_template_items')
    .select('*')
    .in('template_id', templateIds)
    
  if (itemsError) throw new Error(itemsError.message)
    
  // 5. Build new tasks payload
  const newTasks = templateItems.map(item => ({
    transaction_id: transactionId,
    title: item.title,
    description: item.description,
    category: item.category,
    status: 'PENDING',
    priority: item.priority || 'MEDIUM',
    // Note: Due Date calculation will need to be done on the client or later in the backend 
    // by comparing `relative_due_days` against the actual `transaction_dates`
  }))
  
  return newTasks
}

export async function diffTransactionTasks(
  transactionId: string, 
  transactionSide: string | null,
  propertyType: string | null,
  financingType: string | null
) {
  const supabase = createClient()
  
  // 1. Get generated tasks based on NEW conditions
  const newTasks = await generateTransactionTasks(transactionId, transactionSide, propertyType, financingType)
  
  // 2. Get current active tasks in DB
  // We ignore COMPLETED or WAIVED tasks for the sake of the diff, or maybe we include them?
  // The rule is "No borrar tareas existentes" and "Las tareas completadas no deben reabrirse".
  const { data: currentTasks, error: currentTasksError } = await (await supabase).from('tasks')
    .select('*')
    .eq('transaction_id', transactionId)
    
  if (currentTasksError) throw new Error(currentTasksError.message)
    
  const currentTaskTitles = new Set(currentTasks.map(t => t.title))
  const newTaskTitles = new Set(newTasks.map(t => t.title))
  
  const diff = {
    added: newTasks.filter(t => !currentTaskTitles.has(t.title)),
    unchanged: currentTasks.filter(t => newTaskTitles.has(t.title)),
    removed: currentTasks.filter(t => !newTaskTitles.has(t.title) && t.status !== 'COMPLETED' && t.status !== 'WAIVED') 
    // "removed" means no longer applicable. We don't mark completed tasks as removed, they are just historical.
  }
  
  return diff
}

export async function applyTransactionTasksDiff(transactionId: string, addedTasks: any[], removedTaskIds: string[]) {
  const supabase = createClient()
  
  // 1. Insert added tasks
  if (addedTasks.length > 0) {
    const { error: insertError } = await (await supabase).from('tasks').insert(addedTasks)
    if (insertError) throw new Error(insertError.message)
  }
  
  // 2. Mark removed tasks as WAIVED (Rule: No borrar tareas)
  if (removedTaskIds.length > 0) {
    const { error: updateError } = await (await supabase).from('tasks')
      .update({ status: 'WAIVED', notes: 'Automatically waived due to transaction property changes.' })
      .in('id', removedTaskIds)
    if (updateError) throw new Error(updateError.message)
  }
  
  return { success: true }
}
