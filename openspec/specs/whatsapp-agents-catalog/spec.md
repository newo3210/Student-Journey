# whatsapp-agents-catalog

## Purpose

Hub catalog for the WhatsApp Agents portfolio track: five engines, levels 1–4, humanization policy. WhatsMeow remains the last planned stub until its dedicated change.

## Requirements

### Requirement: Hub catalog documents engines and complexity levels
The system SHALL document Meta, Evolution, Waha, and **Baileys** as Implemented at Level 1. **WhatsMeow** remains a planned stub until implemented. Baileys default menu is numbered text; live path prints QR and handles `messages.upsert`.

#### Scenario: Reader finds engine comparison
- **WHEN** a reader opens `WhatsApp-agents/README.md`
- **THEN** they see a comparison of the five engines and a pointer to each engine folder

#### Scenario: Reader finds Baileys implemented
- **WHEN** a reader opens `WhatsApp-agents/README.md`
- **THEN** the Baileys row status is Implemented and points to `baileys/`

#### Scenario: Humanization scope visible in catalog
- **WHEN** a reader opens the hub README or linked anti-ban docs
- **THEN** they see that unofficial Level 1 engines (Evolution, Waha, Baileys) use presence + 20–45s delay only (no BullMQ/Redis)

### Requirement: Anti-ban strategy is documentation only
Meta SHALL not ship runtime anti-ban. Evolution, Waha, and Baileys Level 1 MAY implement presence + delay only.

#### Scenario: Anti-ban is not executable in Meta template
- **WHEN** a developer inspects `WhatsApp-agents/meta-cloud-api/`
- **THEN** there is no delay/presence/queue dispatcher module required for sending messages via Meta Cloud API

### Requirement: Placeholder folders for remaining unofficial engines
The hub SHALL include a stub folder for WhatsMeow until that template is implemented.

#### Scenario: Stub README prevents false claims
- **WHEN** a reader opens the WhatsMeow folder README while it is still a stub
- **THEN** the README states the engine is planned and points back to the hub catalog

### Requirement: Root docs updated for WhatsApp Agents track
Root docs SHALL describe the hub and implemented engine templates including Baileys.
