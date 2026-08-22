## MODIFIED Requirements

### Requirement: Hub catalog documents engines and complexity levels
The hub README SHALL mark **Evolution API** as **Implemented** (Level 1) and keep Waha, Baileys, and WhatsMeow as planned stubs. It SHALL note that Evolution uses simple presence + delay humanization (no Redis queues in this change).

#### Scenario: Reader finds Evolution implemented
- **WHEN** a reader opens `WhatsApp-agents/README.md`
- **THEN** the Evolution row status is Implemented and points to `evolution-api/`

#### Scenario: Humanization scope visible in catalog
- **WHEN** a reader opens the hub README or linked anti-ban docs
- **THEN** they see that Evolution Level 1 uses presence + 20–45s delay only (no BullMQ/Redis yet)
