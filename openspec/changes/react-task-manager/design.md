## Context

Academic profiles approved. First implementation change for Student Journey academic track. Code lives in this hub monorepo under `apps/react-task-manager/`; GitHub remote name remains `react-task-manager` when published separately.

## Goals / Non-Goals

**Goals:**

- Working task manager MVP matching `docs/ACADEMIC_PORTFOLIO.md` §1
- Clear separation: presentational components vs task feature logic
- TypeScript strict; Tailwind for layout; Vitest for domain logic
- Documented defense of Vite, state placement, and validation

**Non-Goals:**

- Backend, auth, DB, AI, routing libraries, drag-and-drop, sync/multiplayer

## Decisions

1. **Vite + React 18 + TypeScript** — academic modern default; faster than CRA.
2. **State in `features/tasks/`** — reducer or small store module; `App.tsx` stays thin.
3. **Persistence via `localStorage`** behind a tiny repository-like helper (`tasksStorage.ts`) so the UI does not touch storage APIs directly.
4. **Validation** — Zod or simple pure function rejecting blank titles before mutate (prefer Zod if already adding it; else pure validateTitle — prefer Zod for consistency with later academic repos).
5. **Tests** — Vitest unit tests on add/toggle/filter/persist helpers, not full Playwright in MVP.
6. **UI** — clean functional layout; no card-heavy dashboard aesthetic; single composition for the main view.

## Conceptual layer mapping

| Conceptual layer | Paths in this change | Notes |
|---|---|---|
| Presentation | `apps/react-task-manager/src/components/`, `App.tsx` | Props in, events out |
| Application / services | `apps/react-task-manager/src/features/tasks/` | Mutations, filters, validation |
| Infrastructure / repositories | `apps/react-task-manager/src/features/tasks/tasksStorage.ts` | localStorage adapter |
| Contracts / schemas | `apps/react-task-manager/src/types/`, optional `schemas/task.ts` | Task type + title validation |

## Schema contracts

- `Task`: `{ id: string; title: string; completed: boolean; createdAt: string }`
- `CreateTaskInput`: `{ title: string }` — title trimmed, min length 1
- Filter: `'all' | 'active' | 'completed'`

## Risks / Trade-offs

- **localStorage only** — fine for academic frontend demo; document limitation
- **No backend** — intentional for repo #1 sequencing
- **Zod vs hand validation** — Zod preferred for portfolio consistency with Express repos later
