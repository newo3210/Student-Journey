//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import { loadTasks, saveTasks, TASKS_STORAGE_KEY } from './tasksStorage'
import type { Task } from '../../types/task'

// In-memory Storage stub - fakes localStorage for isolated tests.
function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => [...map.keys()][index] ?? null,
    removeItem: (key: string) => {
      map.delete(key)
    },
    setItem: (key: string, value: string) => {
      map.set(key, value)
    },
  }
}

describe('tasksStorage', () => {
  // Happy path - save then load returns the same valid tasks.
  it('round-trips valid tasks', () => {
    const storage = memoryStorage()
    const tasks: Task[] = [
      { id: '1', title: 'Hello', completed: false, createdAt: '2026-01-01T00:00:00.000Z' },
    ]
    saveTasks(tasks, storage)
    expect(storage.getItem(TASKS_STORAGE_KEY)).toContain('Hello')
    expect(loadTasks(storage)).toEqual(tasks)
  })

  // Corrupt payload - invalid JSON yields an empty list.
  it('returns empty list for corrupt payload', () => {
    const storage = memoryStorage()
    storage.setItem(TASKS_STORAGE_KEY, '{not-json')
    expect(loadTasks(storage)).toEqual([])
  })
})
