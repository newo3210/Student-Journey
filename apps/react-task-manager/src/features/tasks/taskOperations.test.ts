//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import { addTask, createTask, filterTasks, removeTask, toggleTask, updateTaskTitle } from './taskOperations'

describe('taskOperations', () => {
  // Create cases - valid trimmed title vs empty rejection.
  it('creates a task with trimmed title', () => {
    const task = createTask('  Buy milk  ', () => 'id-1')
    expect(task).toEqual({
      id: 'id-1',
      title: 'Buy milk',
      completed: false,
      createdAt: expect.any(String),
    })
  })

  it('rejects empty title', () => {
    expect(createTask('   ')).toEqual({ error: 'Title cannot be empty' })
  })

  // Lifecycle case - add, toggle, edit, filter, then remove.
  it('adds, toggles, edits, removes, and filters', () => {
    const added = addTask([], 'One', () => 'a')
    expect('tasks' in added).toBe(true)
    if (!('tasks' in added)) return

    let tasks = added.tasks
    tasks = toggleTask(tasks, 'a')
    expect(tasks[0]?.completed).toBe(true)

    const edited = updateTaskTitle(tasks, 'a', 'One edited')
    expect(Array.isArray(edited)).toBe(true)
    if (!Array.isArray(edited)) return
    tasks = edited
    expect(tasks[0]?.title).toBe('One edited')

    expect(filterTasks(tasks, 'completed')).toHaveLength(1)
    expect(filterTasks(tasks, 'active')).toHaveLength(0)

    tasks = removeTask(tasks, 'a')
    expect(tasks).toHaveLength(0)
  })
})
