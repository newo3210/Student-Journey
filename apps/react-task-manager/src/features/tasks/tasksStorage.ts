//Mariano Montini ('bosque', 'bosquestudio')
import { taskSchema, type Task } from '../../types/task'

// Storage key - namespaced localStorage entry for this app's task list.
export const TASKS_STORAGE_KEY = 'react-task-manager:tasks'

// Load tasks - read JSON from storage and keep only schema-valid items.
export function loadTasks(storage: Storage = localStorage): Task[] {
  const raw = storage.getItem(TASKS_STORAGE_KEY)
  if (!raw) {
    return []
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.flatMap((item) => {
      const result = taskSchema.safeParse(item)
      return result.success ? [result.data] : []
    })
  } catch {
    return []
  }
}

// Save tasks - persist the full task array as JSON in storage.
export function saveTasks(tasks: Task[], storage: Storage = localStorage): void {
  storage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
}
