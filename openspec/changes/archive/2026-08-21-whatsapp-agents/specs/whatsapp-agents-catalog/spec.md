## ADDED Requirements

### Requirement: Hub catalog documents engines and complexity levels
The system SHALL provide a `WhatsApp-agents/` hub README that documents the five engines (Meta Cloud API, Evolution API, Waha, Baileys, WhatsMeow), the four progressive complexity levels, and which folder holds each engine template.

#### Scenario: Reader finds engine comparison
- **WHEN** a reader opens `WhatsApp-agents/README.md`
- **THEN** they see a comparison of the five engines and a pointer to each engine folder

#### Scenario: Reader finds levels 1–4
- **WHEN** a reader opens the hub README (or linked docs under `WhatsApp-agents/docs/`)
- **THEN** they see Level 1 (menus/templates), Level 2–3 (IA + DB), and Level 4 (voice) described with status (implemented vs planned) for the Meta template

### Requirement: Anti-ban strategy is documentation only
The hub SHALL document the humanization strategy (presence, stochastic delay 20–45s, per-recipient queues) without shipping runtime anti-ban code in this change.

#### Scenario: Anti-ban is not executable in Meta template
- **WHEN** a developer inspects `WhatsApp-agents/meta-cloud-api/`
- **THEN** there is no delay/presence/queue dispatcher module required for sending messages via Meta Cloud API

#### Scenario: Anti-ban docs exist for future unofficial engines
- **WHEN** a reader opens the anti-ban documentation under the hub
- **THEN** they see the presence + jitter + queue rules labeled as planned for unofficial gateways and deferred until a later change

### Requirement: Placeholder folders for non-Meta engines
The hub SHALL include stub folders for Evolution API, Waha, Baileys, and WhatsMeow that clearly state they are not implemented yet.

#### Scenario: Stub README prevents false claims
- **WHEN** a reader opens any non-Meta engine folder README
- **THEN** the README states the engine is planned and points back to the hub catalog

### Requirement: Root docs updated for WhatsApp Agents track
The change SHALL update root `ARCHITECTURE_SDD.md` (English) and `STUDENT_DECISION_LOG.md` (Spanish) to describe the WhatsApp Agents hub and Meta template flow.
