//Mariano Montini ('bosque', 'bosquestudio')
import type { Task } from '../types/task'
import { TaskItem } from './TaskItem'

// Task list props - visible tasks and row action callbacks.
type TaskListProps = {
  tasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, title: string) => boolean
}

export function TaskList({ tasks, onToggle, onDelete, onEdit }: TaskListProps) {
  // Empty state - no tasks match the current filter.
  if (tasks.length === 0) {
    return <p className="py-8 text-sm text-stone-500">No tasks in this filter.</p>
  }

  // Task rows - map each task to a presentational TaskItem.
  return (
    <ul className="list-none p-0">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  )
}
