## ADDED Requirements

### Requirement: Dual-track learning roadmap document
The project SHALL provide `docs/LEARNING_ROADMAP.md` documenting a Study track and a Build track, including phase goals, recommended resources with rationale, and a mapping between study stages and build phases.

#### Scenario: Roadmap file exists with both tracks
- **WHEN** a reader opens `docs/LEARNING_ROADMAP.md`
- **THEN** the document contains named Study stages and Build phases and explains how they relate

#### Scenario: Professional resources include rationale
- **WHEN** a reader reviews the Study track resource list
- **THEN** each listed resource (or resource group) includes a short “why it serves this path” rationale

#### Scenario: Next build change is named
- **WHEN** a reader finishes the current-phase section
- **THEN** the document names the recommended next OpenSpec build change (or states that docs-only is complete and Build Fase 1 is next)

### Requirement: Root architecture contract for intended system
The project SHALL provide root `ARCHITECTURE_SDD.md` in English describing the intended Clean Architecture layer mapping and target stack without claiming unimplemented APIs as live.

#### Scenario: Honest greenfield architecture snapshot
- **WHEN** a reader opens `ARCHITECTURE_SDD.md` before any app scaffold
- **THEN** the document states that application code is not implemented yet and lists intended paths and stack only

#### Scenario: Layer mapping table present
- **WHEN** a reader checks the layer mapping section
- **THEN** presentation, application/services, infrastructure/repositories, and contracts/schemas are listed with intended concrete paths

### Requirement: Spanish student decision log for oral defense
The project SHALL provide root `STUDENT_DECISION_LOG.md` in Spanish covering data-flow intent, why phases are ordered this way, output-control learning goals, glossary, and oral-defense bullets.

#### Scenario: Decision log supports interview argumentation
- **WHEN** a student prepares an oral defense using `STUDENT_DECISION_LOG.md`
- **THEN** the file includes flow intent, phase justification, output-control goals, a short glossary, and defendable talking points

#### Scenario: History entry for this change
- **WHEN** this OpenSpec change is completed
- **THEN** `STUDENT_DECISION_LOG.md` includes a history row referencing `study-roadmap-docs`
