//Mariano Montini ('bosque', 'bosquestudio')
import type { TaskFilter } from '../types/task'

// Filter bar props - current filter value and change callback.
type FilterBarProps = {
  value: TaskFilter
  onChange: (filter: TaskFilter) => void
}

// Filter options - labels and ids for all/active/completed buttons.
const FILTERS: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
]

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Task filters">
      {/* Filter buttons - switch which task subset is visible. */}
      {FILTERS.map((filter) => {
        const active = value === filter.id
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            aria-pressed={active}
            className={
              active
                ? 'border border-stone-900 bg-stone-900 px-3 py-1 text-sm text-white'
                : 'border border-stone-300 bg-transparent px-3 py-1 text-sm text-stone-700 hover:border-stone-500'
            }
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}
