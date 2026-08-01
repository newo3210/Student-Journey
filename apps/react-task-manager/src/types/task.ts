//Mariano Montini ('bosque', 'bosquestudio')
import { z } from 'zod'

// Task entity fields - identity, title, completion flag, and creation timestamp.
export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  completed: z.boolean(),
  createdAt: z.string().min(1),
})

export type Task = z.infer<typeof taskSchema>

// Title input contract - trim whitespace and reject empty titles from the UI.
export const taskTitleSchema = z
  .string()
  .trim()
  .min(1, 'Title cannot be empty')

// List visibility options - which subset of tasks the UI should show.
export type TaskFilter = 'all' | 'active' | 'completed'

// Title parser - validates raw input and returns title or error message.
export function parseTaskTitle(raw: string): { ok: true; title: string } | { ok: false; error: string } {
  const result = taskTitleSchema.safeParse(raw)
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? 'Invalid title' }
  }
  return { ok: true, title: result.data }
}
