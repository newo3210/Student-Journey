# whatsapp-agents-catalog

## Purpose

Hub catalog for the WhatsApp Agents portfolio track: engine comparison, complexity levels 1–4, humanization policy, and stub placeholders for remaining unofficial engines.

## Requirements

### Requirement: Hub catalog documents engines and complexity levels
The system SHALL provide a `WhatsApp-agents/` hub README that documents the five engines (Meta Cloud API, Evolution API, Waha, Baileys, WhatsMeow). **Meta**, **Evolution**, and **Waha** SHALL be marked Implemented at Level 1. Baileys and WhatsMeow remain planned stubs. Waha CORE default menu MAY be numbered text (buttons/list optional).

#### Scenario: Reader finds engine comparison
- **WHEN** a reader opens `WhatsApp-agents/README.md`
- **THEN** they see a comparison of the five engines and a pointer to each engine folder

#### Scenario: Reader finds Waha implemented
- **WHEN** a reader opens `WhatsApp-agents/README.md`
- **THEN** the Waha row status is Implemented and points to `waha/`

#### Scenario: Humanization scope visible in catalog
- **WHEN** a reader opens the hub README or linked anti-ban docs
- **THEN** they see that Evolution and Waha Level 1 use presence + 20–45s delay only (no BullMQ/Redis yet)

### Requirement: Anti-ban strategy is documentation only
The hub SHALL document the humanization strategy. Meta SHALL not ship runtime anti-ban. Evolution and Waha Level 1 MAY implement presence + delay only.

#### Scenario: Anti-ban is not executable in Meta template
- **WHEN** a developer inspects `WhatsApp-agents/meta-cloud-api/`
- **THEN** there is no delay/presence/queue dispatcher module required for sending messages via Meta Cloud API

### Requirement: Placeholder folders for remaining unofficial engines
The hub SHALL include stub folders for Baileys and WhatsMeow that clearly state they are not implemented yet.

#### Scenario: Stub README prevents false claims
- **WHEN** a reader opens any remaining non-implemented engine folder README
- **THEN** the README states the engine is planned and points back to the hub catalog

### Requirement: Root docs updated for WhatsApp Agents track
Root `ARCHITECTURE_SDD.md` (English) and `STUDENT_DECISION_LOG.md` (Spanish) SHALL describe the hub, Meta, Evolution, and Waha template flows.
