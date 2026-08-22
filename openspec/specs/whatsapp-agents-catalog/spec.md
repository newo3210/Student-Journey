# whatsapp-agents-catalog

## Purpose

Hub catalog for the WhatsApp Agents portfolio track: engine comparison, complexity levels 1–4, humanization policy (docs-only for Meta; presence+delay for Evolution), and stub placeholders for remaining unofficial engines.

## Requirements

### Requirement: Hub catalog documents engines and complexity levels
The system SHALL provide a `WhatsApp-agents/` hub README that documents the five engines (Meta Cloud API, Evolution API, Waha, Baileys, WhatsMeow), the four progressive complexity levels, and which folder holds each engine template. **Evolution API** SHALL be marked Implemented (Level 1 + presence/delay humanization C). Waha, Baileys, and WhatsMeow remain planned stubs.

#### Scenario: Reader finds engine comparison
- **WHEN** a reader opens `WhatsApp-agents/README.md`
- **THEN** they see a comparison of the five engines and a pointer to each engine folder

#### Scenario: Reader finds levels 1–4
- **WHEN** a reader opens the hub README (or linked docs under `WhatsApp-agents/docs/`)
- **THEN** they see Level 1 (menus/templates), Level 2–3 (IA + DB), and Level 4 (voice) described with status (implemented vs planned) for the Meta and Evolution templates

#### Scenario: Reader finds Evolution implemented
- **WHEN** a reader opens `WhatsApp-agents/README.md`
- **THEN** the Evolution row status is Implemented and points to `evolution-api/`

#### Scenario: Humanization scope visible in catalog
- **WHEN** a reader opens the hub README or linked anti-ban docs
- **THEN** they see that Evolution Level 1 uses presence + 20–45s delay only (no BullMQ/Redis yet)

### Requirement: Anti-ban strategy is documentation only
The hub SHALL document the humanization strategy (presence, stochastic delay 20–45s, per-recipient queues). Meta Cloud API SHALL not ship runtime anti-ban code. Evolution Level 1 MAY implement presence + delay only (no Redis/BullMQ).

#### Scenario: Anti-ban is not executable in Meta template
- **WHEN** a developer inspects `WhatsApp-agents/meta-cloud-api/`
- **THEN** there is no delay/presence/queue dispatcher module required for sending messages via Meta Cloud API

#### Scenario: Anti-ban docs exist for future unofficial engines
- **WHEN** a reader opens the anti-ban documentation under the hub
- **THEN** they see the presence + jitter + queue rules, with Evolution limited to presence+delay and queues still deferred

### Requirement: Placeholder folders for remaining unofficial engines
The hub SHALL include stub folders for Waha, Baileys, and WhatsMeow that clearly state they are not implemented yet.

#### Scenario: Stub README prevents false claims
- **WHEN** a reader opens any remaining non-implemented engine folder README
- **THEN** the README states the engine is planned and points back to the hub catalog

### Requirement: Root docs updated for WhatsApp Agents track
Root `ARCHITECTURE_SDD.md` (English) and `STUDENT_DECISION_LOG.md` (Spanish) SHALL describe the WhatsApp Agents hub, Meta template, and Evolution template flows.
