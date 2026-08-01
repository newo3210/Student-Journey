# Architecture SDD

> **Language:** English (technical contract).  
> **Location:** repository root `ARCHITECTURE_SDD.md`.  
> **Last updated:** 2026-07-31  
> **Related OpenSpec change:** `openspec/changes/react-task-manager/`

---

## 1. System overview

**Student Journey** is the documentation and OpenSpec hub for a Full Stack student portfolio.

**Priority track — Academic:** five traditional Full Stack Modern repositories (no AI). Repo **#1** `react-task-manager` is implemented at `apps/react-task-manager/`. Repos 2–5 remain profiled in `docs/ACADEMIC_PORTFOLIO.md`.

## 2. Layer mapping

### 2.1 `apps/react-task-manager` (implemented)

| Conceptual layer | Paths | Notes |
|---|---|---|
| Presentation | `src/components/`, `src/App.tsx` | No localStorage in components |
| Application | `src/features/tasks/taskOperations.ts`, `useTasks.ts` | Mutations, filters, validation |
| Infrastructure | `src/features/tasks/tasksStorage.ts` | localStorage adapter |
| Contracts | `src/types/task.ts` | Zod schemas |

Author signature (line 1 on hand-written `.ts`/`.tsx`): `//Mariano Montini ('bosque', 'bosquestudio')`

### 2.2 Remaining academic apps (intended)

| Conceptual layer | Typical paths |
|---|---|
| Presentation | Express routes/controllers; Next `app/` |
| Application | `services/` |
| Infrastructure | `repositories/`, Prisma |
| Contracts | `schemas/` (Zod) |

## 3. Data & control flow (repo 1)

```text
UI components → useTasks → taskOperations → tasksStorage → localStorage
```

## 4. API routes

None in repo 1 (client-only).

| # | Path / name | Status |
|---|---|---|
| 1 | `apps/react-task-manager` | Implemented |
| 2–5 | see academic portfolio | Profiled only |

## 5. Schemas (repo 1)

- `Task`: `{ id, title, completed, createdAt }`
- `taskTitleSchema`: trimmed non-empty string

## 6. AI / LLM boundaries

Not applicable on the Academic track.

## 7. Error handling

Invalid titles → inline UI errors. Corrupt localStorage → `[]`.

## 8. Non-goals

Backend, auth, DB, AI in repo 1.

## 9. Milestones

| Order | Repo | Status |
|---|---|---|
| 1 | `react-task-manager` | Done |
| 2 | `express-api-boilerplate` | Next |
| 3–5 | blog / auth / booking | Pending |

## 10. Change log

| Date | Change | OpenSpec |
|---|---|---|
| 2026-07-31 | Learning + academic profiles | `study-roadmap-docs`, `academic-portfolio-5-repos` |
| 2026-07-31 | Task manager MVP + author signatures | `react-task-manager` |
