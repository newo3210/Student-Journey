# whatsapp-agents-catalog

## Purpose

Hub catalog for the WhatsApp Agents portfolio track. All five engines are Implemented at Level 1.

## Requirements

### Requirement: Hub catalog documents engines and complexity levels
The hub README SHALL list Meta Cloud API, Evolution API, Waha, Baileys, and WhatsMeow as Implemented at Level 1, with folder pointers. Unofficial engines use presence + 20–45s delay (no BullMQ/Redis). Waha CORE, Baileys, and WhatsMeow default to numbered text menus.

#### Scenario: Reader finds engine comparison
- **WHEN** a reader opens `WhatsApp-agents/README.md`
- **THEN** they see a comparison of the five engines and a pointer to each engine folder

#### Scenario: Reader finds WhatsMeow implemented
- **WHEN** a reader opens `WhatsApp-agents/README.md`
- **THEN** the WhatsMeow row status is Implemented and points to `whatsmeow/`

#### Scenario: Humanization scope visible in catalog
- **WHEN** a reader opens the hub README or linked anti-ban docs
- **THEN** they see unofficial Level 1 engines use presence + delay only (no BullMQ/Redis)

### Requirement: Anti-ban strategy is documentation only
Meta SHALL not ship runtime anti-ban. Evolution, Waha, Baileys, and WhatsMeow Level 1 MAY implement presence + delay only.

#### Scenario: Anti-ban is not executable in Meta template
- **WHEN** a developer inspects `WhatsApp-agents/meta-cloud-api/`
- **THEN** there is no delay/presence/queue dispatcher module required for sending messages via Meta Cloud API

### Requirement: Root docs updated for WhatsApp Agents track
Root `ARCHITECTURE_SDD.md` and `STUDENT_DECISION_LOG.md` SHALL describe the hub and all five Level 1 templates.
