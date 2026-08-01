//Mariano Montini ('bosque', 'bosquestudio')
import { FilterBar } from './components/FilterBar'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { useTasks } from './features/tasks/useTasks'

export default function App() {
  // Feature wiring - state and actions from the tasks hook.
  const { tasks, filter, setFilter, error, create, edit, toggle, remove } = useTasks()

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-12">
        {/* Page header - portfolio context and short description. */}
        <header className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Academic portfolio</p>
          <h1 className="text-3xl font-semibold tracking-tight">Task Manager</h1>
          <p className="text-stone-600">
            React + TypeScript demo: components, state, forms, filters, and localStorage.
          </p>
        </header>

        {/* Create section - new task form with validation feedback. */}
        <TaskForm onSubmit={create} error={error} />

        {/* Filter section - switch visible task subset. */}
        <FilterBar value={filter} onChange={setFilter} />

        {/* List section - filtered tasks with row actions. */}
        <TaskList tasks={tasks} onToggle={toggle} onDelete={remove} onEdit={edit} />
      </main>
    </div>
  )
}
