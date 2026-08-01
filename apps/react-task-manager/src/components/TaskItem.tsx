//Mariano Montini ('bosque', 'bosquestudio')
import { useState, type FormEvent } from 'react'
import type { Task } from '../types/task'

// Task row props - entity plus toggle/delete/edit callbacks from parent.
type TaskItemProps = {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, title: string) => boolean
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  // Edit UI state - whether the row is editing and the draft title value.
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)

  // Save handler - sends draft title to parent and exits edit mode on success.
  function handleSave(event: FormEvent) {
    event.preventDefault()
    const ok = onEdit(task.id, draft)
    if (ok) {
      setEditing(false)
    }
  }

  return (
    <li className="flex flex-col gap-2 border-b border-stone-200 py-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Main row - checkbox plus title view or inline edit form. */}
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'active' : 'completed'}`}
          className="mt-1"
        />
        {editing ? (
          <form onSubmit={handleSave} className="flex min-w-0 flex-1 flex-wrap gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-w-0 flex-1 border border-stone-300 px-2 py-1 text-stone-900"
              aria-label="Edit task title"
            />
            <button type="submit" className="text-sm text-stone-900 underline">
              Save
            </button>
            <button
              type="button"
              className="text-sm text-stone-500 underline"
              onClick={() => {
                setDraft(task.title)
                setEditing(false)
              }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <p className={task.completed ? 'text-stone-400 line-through' : 'text-stone-900'}>
            {task.title}
          </p>
        )}
      </div>

      {/* Row actions - enter edit mode or delete the task. */}
      {!editing ? (
        <div className="flex gap-3 pl-7 sm:pl-0">
          <button type="button" className="text-sm text-stone-700 underline" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button type="button" className="text-sm text-red-700 underline" onClick={() => onDelete(task.id)}>
            Delete
          </button>
        </div>
      ) : null}
    </li>
  )
}
