---

## description: This document contains all development rules and guidelines for this project, applicable to all AI agents (Claude, Cursor, Codex, Gemini, etc.).
alwaysApply: true

## 0. Project context (archaeology - greenfield)

**Repo name:** Student Journey  
**Status as of bootstrap:** Spec-Driven Development scaffolding only. **No application code** (`app/`, `src/`, `package.json` app) exists yet.

**Learning goals (two tracks):**

1. **Academic (priority):** five traditional Full Stack Modern GitHub repos - no AI, no blockchain. Source: `docs/ACADEMIC_PORTFOLIO.md`
2. **Advanced (later):** AI SDK / RAG / queues templates - see `docs/LEARNING_ROADMAP.md`

Academic stack (intended):

| Area | Choice |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind (`react-task-manager`, blog/auth UIs) |
| Backend | Node.js + Express + TypeScript + Zod |
| Database | PostgreSQL + Prisma |
| Auth | JWT + password hashing (academic repo 4+) |
| Unified FS | Next.js App Router (`nextjs-booking-app`) |

Advanced stack (deferred): Supabase/pgvector, Vercel AI SDK, Upstash/BullMQ - only after academic pack.

**Conceptual layout:** map each OpenSpec `design.md` to presentation / services / repositories / schemas. Do not invent app folders before the approved build change.

**Roadmaps:** `docs/LEARNING_ROADMAP.md` + `docs/ACADEMIC_PORTFOLIO.md`. Each repo = its own OpenSpec change after human approval.

**Note:** Copied `docs/backend-standards.md` / `docs/frontend-standards.md` originated from an LTI Express template. Prefer this file §0 + §9 until those docs are rewritten for Next.js in a dedicated change.

## 1. Core Principles

- **Small tasks, one at a time**: Always work in baby steps, one at a time. Never go forward more than one step.
- **Test-Driven Development**: Start with failing tests for any new functionality (TDD), according to the task details.
- **Type Safety**: All code must be fully typed.
- **Clear Naming**: Use clear, descriptive names for all variables and functions.
- **Incremental Changes**: Prefer incremental, focused changes over large, complex modifications.
- **Question Assumptions**: Always question assumptions and inferences.
- **Pattern Detection**: Detect and highlight repeated code patterns.

## 2. Language Standards

- **English Only**: All technical artifacts must always use English, including:
  - Code (variables, functions, classes, comments, error messages, log messages)
  - Documentation (README, guides, API docs)
  - Jira tickets (titles, descriptions, comments)
  - Data schemas and database names
  - Configuration files and scripts
  - Git commit messages
  - Test names and descriptions
  - `ARCHITECTURE_SDD.md` (technical architecture contract at repo root)

**Exception - pedagogical UX:**

- `STUDENT_DECISION_LOG.md` (repo root) is written in **Spanish** (learning, oral defense, argumentation).
- User-facing chat may be Spanish when the user writes in Spanish.

**Exception - author signature and section comments on TS/JS source:**

- When **creating** a new `.ts` / `.tsx` / `.js` / `.jsx` file (hand-written app/test source), line 1 MUST be:
  `//Mariano Montini ('bosque', 'bosquestudio')`
- Inside each file, separate logical sections (param/props groups, schemas, state clusters, function blocks, return APIs) with blank lines and an abbreviated comment above each:
  `// <What this block is> - <What it does>`
- Keep folder modularity (presentation / features-services / infrastructure / contracts).
- Skip generated/tool outputs (`node_modules/`, `.next/`, `dist/`, etc.).
- Cursor rules: `.cursor/rules/author-js-ts-file-signature.mdc`, `.cursor/rules/modular-code-comments.mdc`



## 3. Specific standards

For detailed standards and guidelines specific to different areas of the project, refer to:

- [Backend Standards](./backend-standards.md) - API development, database patterns, testing, security and backend best practices
- [Frontend Standards](./frontend-standards.md) - React components, UI/UX guidelines, and frontend architecture
- [Documentation Standards](./documentation-standards.md) - Technical documentation structure, formatting, and maintenance guidelines, including AI standards like this document
- [OpenSpec Tasks Mandatory Steps](./openspec-tasks-mandatory-steps.md) - Required checklist and execution rules when creating or updating OpenSpec `tasks.md` files

## 4. Project Skills

- Skills live in `ai-specs/skills`.
- When a request matches a skill, load and follow the corresponding `SKILL.md` automatically before continuing.
- Also load any referenced files in the skill folder (for example, `references/*.md`) when the skill requires them.

## 5. Planning Model Requirement

Planning workflows must run with Opus high reasoning.

This requirement applies to:

- `enrich-us`
- `openspec-ff-change`
- `openspec-continue-change`

Before starting any of these workflows, verify the session is using Opus high reasoning. If it is not, **self-correct** by adding `"model": "claude-opus-4-7"` to `.claude/settings.json` (use the `update-config` skill or edit directly), then continue - do not stop and ask the user. Do the same to come back to sonnet medium for any other step.

## 6. Symlink Integrity and Multi-Agent Portability

- **Canonical Source**: Keep reusable artifacts in `ai-specs` as the canonical source. Agent-specific paths (such as `.claude` and `.cursor`) should reference them through symlinks when possible.
- **Update Safety**: Whenever a file is renamed, moved, or its suffix changes, verify and update all symlinks that target it before considering the change complete.
- **New Artifact Linking**: Whenever creating a new artifact that requires multi-agent exposure (for example new agents or skills in `ai-specs`), create the corresponding symlinks from the expected agent-specific reference paths.
- **External Customization Review**: Whenever customization is introduced outside `ai-specs`, evaluate whether it should be moved into `ai-specs` and replaced with symlinks from the original locations.
- **Completion Gate**: A change is incomplete if it leaves broken symlinks, stale targets, or duplicated canonical artifacts across agent-specific folders.

## 7. Mandatory OpenSpec Artifact Updates for Post-Apply Changes

When a new fix/change request appears after `opsx:apply` (or `/apply`) and before `opsx:archive` (or `/archive`), agents must treat it as a spec update first, not as an informal "fix this quickly". It's the core principle of openspec, documentation is the source of truth.

Required order:

1. Update the current OpenSpec change artifacts that are affected (for example: scenarios, requirements/specs, and `tasks.md`). Don't add tasks as "bugfixes" but as part of the initial design, thus in the proper section
2. If artifact regeneration is needed, run the corresponding OpenSpec step (`opsx:continue`, `opsx:ff`, or equivalent) before coding.
3. Implement code only after artifacts reflect the new request.
4. Re-run verification against the updated artifacts before archiving.

Do not apply direct code-only fixes in this window without updating OpenSpec artifacts.

## 8. Project Director Entry Point

- **Default orchestration**: For new features, scope changes, or when the user does not know OpenSpec commands, use `**/director`** (command) and skill `project-director`.
- **Director role**: Orchestrates enrich-us, OpenSpec lifecycle, delegation to backend/frontend planners, verify, acceptance matrix, and archive. Defined in `ai-specs/agents/project-director.md`.
- **Human checkpoints**: Plan approval after `/opsx:ff`, post-verify review, explicit OK before `/opsx:archive`.
- **Independent review**: `adversarial-review` must run in a **separate session** from `/opsx:apply`.
- **Guide**: See `docs/como-incorporar-openspec-a-cursor.md` and `docs/orquestacion-sdd-hermes-cursor.md`.
- **Assisted OpenSpec**: This project does not require a global `openspec` CLI. Agents read/write `openspec/changes/` and `openspec/specs/` directly and follow skill workflows in `.cursor/skills/openspec-`* or `project-director`.
- **Archive gate**: Do not archive without updated root `ARCHITECTURE_SDD.md` and `STUDENT_DECISION_LOG.md` (§10).

## 9. Clean Architecture - Conceptual Layer Mapping

Do **not** hard-code folder paths in global rules. Map each OpenSpec change to conceptual layers; declare **concrete paths in that change's `design.md`**.

| Conceptual layer | Responsibility | Example (DDD / LTI OpenSpecs) | Example (Next.js / AI apps) |
|---|---|---|---|
| **Presentation / HTTP thin** | Receive request, validate schemas, call application services. No business or AI logic. | `backend/src/presentation/` (controllers, routes) | `app/api/` (route handlers) |
| **Application / services** | Business rules and AI orchestration (LLM calls, RAG, tool calling). Never inside React components or thin HTTP routes. | `backend/src/application/` | `services/` |
| **Infrastructure / repositories** | Persistence and external I/O only (DB, storage, third-party SDKs as adapters). | `backend/src/infrastructure/` | `repositories/` |
| **Contracts / schemas** | Explicit Zod (or equivalent) TypeScript contracts for API and LLM boundaries. | Domain types + Zod/OpenAPI in presentation/application | `types/` or `schemas/` |

### 9.1 Output control & errors

- Enforce strict JSON output schemas (Zod/Pydantic) when interacting with LLMs.
- Handle model failures, rate-limits, and streaming errors at the application/service layer; map them to clear HTTP/UI errors in presentation.
- Prefer SOLID, modular, self-documenting code.

### 9.2 Frontend note

UI components render and collect input; they call thin client services. They must not embed LLM prompts, RAG pipelines, or direct DB access.

## 10. Mandatory Root Documentation Artefacts

Every time a feature, route, or module is **built, updated, or finalized**, generate or update these two files at the **repository root** (`/`):

### 10.1 `ARCHITECTURE_SDD.md` (English)

Technical living contract: system flow, layer mapping for this repo, API routes, data schemas/models, AI boundaries (if any), error handling.  
Template: `ai-specs/skills/project-director/references/architecture-sdd-template.md`.

### 10.2 `STUDENT_DECISION_LOG.md` (Spanish)

Pedagogical log for study and oral defense. Must include:

1. **Data flow map** - step-by-step path (Frontend → API → Service → Model/LLM → DB)
2. **Clean Architecture justification** - why files were split across layers
3. **Output control explanation** - how Zod/schemas prevent invalid or hallucinated shapes
4. **Key technical glossary** - 3–4 concepts explained simply in this project's context

Template: `ai-specs/skills/project-director/references/student-decision-log-template.md`.

### 10.3 Pipeline enforcement (`project-director`)

| Phase | Requirement |
|---|---|
| **Phase 3 (plan)** | `design.md` states layer mapping + schema contracts; `tasks.md` includes explicit tasks to create/update both root docs |
| **Phase 4 (apply)** | Implementer updates both root docs when the slice lands |
| **Phase 5–6** | Verify / adversarial may flag missing or empty docs as CRITICAL / Major |
| **Phase 7 (archive)** | **Hard gate:** no archive if either file is missing, empty, or unchanged when the change required doc updates |

Do not regenerate both docs for trivial typos; do update them when a feature, route, or module is closed.