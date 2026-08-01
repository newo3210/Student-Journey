//Mariano Montini ('bosque', 'bosquestudio')
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Task, TaskFilter } from '../../types/task'
import { addTask, filterTasks, removeTask, toggleTask, updateTaskTitle } from './taskOperations'
import { loadTasks, saveTasks } from './tasksStorage'

export function useTasks() {
  // UI state - task list, active filter, and last validation error.
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [error, setError] = useState<string | null>(null)

  // Persist effect - write tasks to localStorage whenever the list changes.
  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  // Visible list - tasks after applying the current filter.
  const visibleTasks = useMemo(() => filterTasks(tasks, filter), [tasks, filter])

  // Create handler - validates title, appends task, clears or sets error.
  const create = useCallback((title: string) => {
    const result = addTask(tasks, title)
    if ('error' in result) {
      setError(result.error)
      return false
    }
    setError(null)
    setTasks(result.tasks)
    return true
  }, [tasks])

  // Edit handler - validates new title and updates the matching task.
  const edit = useCallback((id: string, title: string) => {
    const result = updateTaskTitle(tasks, id, title)
    if ('error' in result) {
      setError(result.error)
      return false
    }
    setError(null)
    setTasks(result)
    return true
  }, [tasks])

  // Toggle handler - flips completed for one task id.
  const toggle = useCallback((id: string) => {
    setTasks((current) => toggleTask(current, id))
  }, [])

  // Remove handler - deletes one task id from the list.
  const remove = useCallback((id: string) => {
    setTasks((current) => removeTask(current, id))
  }, [])

  // Public API - values and actions exposed to presentational components.
  return {
    tasks: visibleTasks,
    filter,
    setFilter,
    error,
    create,
    edit,
    toggle,
    remove,
  }
}
