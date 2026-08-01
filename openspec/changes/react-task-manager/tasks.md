## 1. Workspace & scaffold

- [x] 1.1 Create git repo/worktree branch `feature/react-task-manager` if git is initialized
- [x] 1.2 Scaffold Vite React-TS app at `apps/react-task-manager/`
- [x] 1.3 Add Tailwind CSS and Vitest (+ Testing Library as needed)
- [x] 1.4 Add Zod for title validation schema

## 2. Domain & persistence (TDD)

- [x] 2.1 Define `Task` types and Zod create/edit schemas
- [x] 2.2 Implement task operations (add/update/toggle/remove/filter) with failing tests first
- [x] 2.3 Implement `tasksStorage` load/save against localStorage (test with mock)
- [x] 2.4 Wire feature hook or reducer used by the UI

## 3. UI

- [x] 3.1 Build presentational components: TaskForm, TaskList, TaskItem, FilterBar
- [x] 3.2 Compose main view in `App.tsx` (thin)
- [x] 3.3 Responsive layout + accessible labels for inputs/buttons
- [x] 3.4 Show validation error for empty title

## 4. Documentation & root artefacts

- [x] 4.1 Write app `README.md` (setup, scripts, decisions, defense bullets)
- [x] 4.2 Update `ARCHITECTURE_SDD.md` for this app’s paths and flow
- [x] 4.3 Update `STUDENT_DECISION_LOG.md` (Spanish) with history row
- [x] 4.4 Mark MVP checkboxes in `docs/ACADEMIC_PORTFOLIO.md` §1 when done

## 5. Verify

- [x] 5.1 Run unit tests green
- [ ] 5.2 Manual acceptance: CRUD + filters + reload persistence
- [x] 5.3 Author signature on all hand-written `.ts`/`.tsx` (line 1)
