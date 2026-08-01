## Why

The Student Journey repo needs a single professional study-and-build roadmap before any application code. Without written phases, resources, and architecture intent, portfolio work and interview defense stay fragmented.

## What Changes

- Add pedagogical learning roadmap document mapping Study track ↔ Build track
- Add root `ARCHITECTURE_SDD.md` describing the **intended** greenfield target architecture (honest: no app code yet)
- Add root `STUDENT_DECISION_LOG.md` in Spanish for oral defense of the learning plan and future technical decisions
- Align `docs/base-standards.md` project phases with the Skeleton → Quality → Scale → Mock sequence
- Capture curated professional learning resources (midudev, freeCodeCamp, Next.js Learn, DeepLearning.AI, Scrimba, ByteByteGo, NeetCode, etc.) with “why it serves this path”

## Capabilities

### New Capabilities

- `learning-roadmap`: Requirements for dual-track study/build documentation and root architecture / decision-log artefacts for the Student Journey portfolio lab

### Modified Capabilities

- *(none — greenfield)*

## Impact

- Documentation only: `docs/`, repo root markdown, `docs/base-standards.md` §0
- No production runtime, dependencies, or API surface
- Unblocks the next OpenSpec change: Build Fase 1 skeleton (`nextjs-ai-skeleton` or equivalent)
