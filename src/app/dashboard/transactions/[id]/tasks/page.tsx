import { createClient } from '@/utils/supabase/server'
import { TasksClient } from '@/components/tasks/TasksClient'

export default async function TasksPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('transaction_id', resolvedParams.id)
    .order('due_date', { ascending: true })

  if (error) {
    return <div className="p-4 text-red-500">Error loading tasks: {error.message}</div>
  }

  return <TasksClient transactionId={resolvedParams.id} initialTasks={tasks || []} />
}

