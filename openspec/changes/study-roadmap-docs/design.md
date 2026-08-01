## Context

Greenfield repo with SDD scaffolding only. The learner follows a Full Stack + AI Engineer path and wants forkable Next.js templates later. This change freezes the **study curriculum and build sequence** in writing.

## Goals / Non-Goals

**Goals:**

- Dual-track documentation: Study (skills/resources) and Build (portfolio template phases)
- Honest architecture snapshot (intended paths, not invented APIs)
- Spanish decision log suitable for oral defense of *why this order*
- Clear pointer to the next implementation change

**Non-Goals:**

- Implementing Next.js, Supabase, AI SDK, Redis, or auth
- Rewriting legacy LTI `backend-standards.md` / `frontend-standards.md` in full
- Solving algorithm drill sets inside the repo

## Decisions

1. **Dual track over single timeline** — Study Etapa 1 (JS/async) can overlap early Build Fase 1 UI work; AI persistence waits until Study Etapa 3 concepts are started.
2. **Build Fase 1 includes AI SDK early** (per user’s Skeleton track) but with a **thin vertical slice** (one chat/completion path) so fundamentals are not skipped — JS/async practice is mandatory Study Etapa 1.
3. **Docs languages** — OpenSpec + `ARCHITECTURE_SDD.md` in English; `STUDENT_DECISION_LOG.md` + `docs/LEARNING_ROADMAP.md` in Spanish (pedagogical).
4. **Target stack locked for planning** — Next.js App Router, Tailwind, Supabase, Vercel AI SDK, Zod; Upstash/BullMQ deferred to Build Fase 3.

## Conceptual layer mapping (this change)

| Conceptual layer | Paths touched now | Notes |
|---|---|---|
| Presentation | *(none)* | No UI yet |
| Application / services | *(none)* | No AI services yet |
| Infrastructure | *(none)* | No DB adapters yet |
| Contracts | OpenSpec specs under `openspec/changes/study-roadmap-docs/specs/` | Documentation requirements only |
| Pedagogy / architecture docs | `docs/LEARNING_ROADMAP.md`, `ARCHITECTURE_SDD.md`, `STUDENT_DECISION_LOG.md`, `docs/base-standards.md` | Source of truth for learning plan |

## Schema contracts

Not applicable (no API/LLM runtime in this change).

## Risks / Trade-offs

- **Risk:** Starting Build Fase 1 with AI SDK before solid JS/async → mitigated by explicit Study Etapa 1 gate in the roadmap.
- **Trade-off:** Documenting intended architecture before code can drift → change log + next build change must update root docs.
- **Risk:** Resource links rot → roadmap stores *why* + names; URLs noted as official entry points.

## Migration plan

None (docs-only).
