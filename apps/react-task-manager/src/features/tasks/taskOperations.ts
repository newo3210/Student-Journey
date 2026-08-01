//Mariano Montini ('bosque', 'bosquestudio')
import type { Task, TaskFilter } from '../../types/task'
import { parseTaskTitle } from '../../types/task'

// Create-task inputs - raw title from UI plus optional id factory for tests.
export function createTask(titleInput: string, idFactory: () => string = () => crypto.randomUUID()): Task | { error: string } {
  const parsed = parseTaskTitle(titleInput)
  if (!parsed.ok) {
    return { error: parsed.error }
  }
  return {
    id: idFactory(),
    title: parsed.title,
    completed: false,
    createdAt: new Date().toISOString(),
  }
}

// Update-title inputs - current list, target id, and new raw title from the editor.
export function updateTaskTitle(tasks: Task[], id: string, titleInput: string): Task[] | { error: string } {
  const parsed = parseTaskTitle(titleInput)
  if (!parsed.ok) {
    return { error: parsed.error }
  }
  return tasks.map((task) => (task.id === id ? { ...task, title: parsed.title } : task))
}

// Toggle-completed inputs - current list and task id to flip.
export function toggleTask(tasks: Task[], id: string): Task[] {
  return tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
}

// Remove-task inputs - current list and task id to delete.
export function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id)
}

// Filter inputs - full list plus visibility mode (all/active/completed).
export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  if (filter === 'active') {
    return tasks.filter((task) => !task.completed)
  }
  if (filter === 'completed') {
    return tasks.filter((task) => task.completed)
  }
  return tasks
}

// Add-task inputs - current list, raw title, optional id factory; appends a new task.
export function addTask(tasks: Task[], titleInput: string, idFactory?: () => string): { tasks: Task[] } | { error: string } {
  const created = createTask(titleInput, idFactory)
  if ('error' in created) {
    return created
  }
  return { tasks: [...tasks, created] }
}
