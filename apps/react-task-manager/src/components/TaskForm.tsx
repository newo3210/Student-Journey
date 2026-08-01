//Mariano Montini ('bosque', 'bosquestudio')
import { useState, type FormEvent } from 'react'

// Form props - submit callback and validation error from the feature hook.
type TaskFormProps = {
  onSubmit: (title: string) => boolean
  error: string | null
}

export function TaskForm({ onSubmit, error }: TaskFormProps) {
  // Local field state - controlled title input before submit.
  const [title, setTitle] = useState('')

  // Submit handler - forwards title to parent and clears input on success.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const ok = onSubmit(title)
    if (ok) {
      setTitle('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {/* Label + controls - title field, add button, and error message. */}
      <label htmlFor="task-title" className="text-sm font-medium text-stone-700">
        New task
      </label>
      <div className="flex gap-2">
        <input
          id="task-title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs doing?"
          className="min-w-0 flex-1 border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-stone-600"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'task-title-error' : undefined}
        />
        <button
          type="submit"
          className="bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          Add
        </button>
      </div>
      {error ? (
        <p id="task-title-error" className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
