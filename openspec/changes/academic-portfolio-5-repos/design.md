## Context

Student Journey already has an AI-oriented study roadmap. The learner now prioritizes an **Academic Portfolio** that matches traditional Full Stack Modern standards (market + course rubrics) with zero AI/blockchain scope.

## Goals / Non-Goals

**Goals:**

- Profile exactly five GitHub-ready project definitions
- Define stack, features, layers, acceptance rubric, and oral-defense bullets per repo
- Define implementation order and how repos build on each other
- Keep Academic track clearly separated from any future AI track

**Non-Goals:**

- Implementing code, Docker, or CI in this change
- Creating GitHub remotes
- AI SDK, RAG, agents, crypto, Web3

## Decisions

1. **Five fixed repo names** (kebab-case for GitHub):
   - `react-task-manager`
   - `express-api-boilerplate`
   - `fullstack-blog-crud`
   - `auth-jwt-dashboard`
   - `nextjs-booking-app` (booking domain avoids payment/crypto complexity; still full CRUD + auth patterns)
2. **Monorepo vs multi-repo:** Profile as **five separate GitHub repos** for recruiter clarity; this Student Journey repo remains the **spec/docs hub** until each build change scaffolds code (optionally under `apps/` later — deferred).
3. **Stack baseline (academic traditional modern):**
   - Front: React + TypeScript + Vite (repos 1, 3, 4) or Next.js App Router (repo 5)
   - Back: Node.js + Express + TypeScript (repos 2–4)
   - DB: PostgreSQL + Prisma (or Drizzle) for repos 3–5
   - Auth: JWT + httpOnly cookie or Bearer (repo 4; reused in 5)
   - Validation: Zod; styling: Tailwind CSS
4. **Build order:** 1 → 2 → 3 → 4 → 5 (each reuses skills from the previous).
5. **No AI** in Academic track READMEs, dependencies, or features.

## Conceptual layer mapping (documentation change)

| Conceptual layer | Paths now | Later (per app repo) |
|---|---|---|
| Presentation | `docs/ACADEMIC_PORTFOLIO.md` profiles | `src/pages` / `app/` / Express routers |
| Application | — | `services/` |
| Infrastructure | — | `repositories/` + Prisma |
| Contracts | OpenSpec specs | `schemas/` (Zod) |

## Risks / Trade-offs

- **Risk:** Scope creep into AI track → mitigated by explicit non-goals per profile  
- **Trade-off:** Five remotes later vs one monorepo → separate remotes win for academic portfolio browsing  
- **Risk:** `nextjs-booking-app` too large → profile caps MVP (rooms/listings + bookings + auth), no payments gateway required
