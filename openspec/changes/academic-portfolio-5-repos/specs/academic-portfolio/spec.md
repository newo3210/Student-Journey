## ADDED Requirements

### Requirement: Academic portfolio catalog document
The project SHALL provide `docs/ACADEMIC_PORTFOLIO.md` that profiles exactly five traditional Full Stack repositories with no AI or blockchain features.

#### Scenario: Five named repositories are profiled
- **WHEN** a reader opens `docs/ACADEMIC_PORTFOLIO.md`
- **THEN** the document includes sections for `react-task-manager`, `express-api-boilerplate`, `fullstack-blog-crud`, `auth-jwt-dashboard`, and `nextjs-booking-app`

#### Scenario: Each profile includes academic essentials
- **WHEN** a reader reviews any of the five profiles
- **THEN** that profile includes purpose, target stack, MVP features, layer/folder intent, acceptance rubric, oral-defense bullets, and an explicit out-of-scope list that excludes AI and blockchain

#### Scenario: Build order is defined
- **WHEN** a reader checks the portfolio build sequence
- **THEN** repositories are ordered 1→5 with dependencies explained and the next implementation change named as `react-task-manager`

### Requirement: Academic track linked from learning docs
The project SHALL link the Academic Portfolio track from the learning roadmap and record the decision in root student/architecture docs without claiming the five apps are already implemented.

#### Scenario: Honest status
- **WHEN** a reader opens root architecture or decision-log docs after this change
- **THEN** the academic five-repo plan is described as documented/profiled and not yet coded
