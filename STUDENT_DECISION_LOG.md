# Bitácora de decisiones del estudiante

> **Idioma:** Español (pedagógico).  
> **Ubicación:** raíz del repo `STUDENT_DECISION_LOG.md`.

**Última actualización:** 2026-08-22  
**Changes relacionados:** `openspec/changes/react-task-manager/`, `openspec/changes/whatsapp-agents/`, `openspec/changes/whatsapp-agents-evolution/`, `openspec/changes/whatsapp-agents-waha/`, `openspec/changes/whatsapp-agents-baileys/`, `openspec/changes/whatsapp-agents-whatsmeow/`

---

## 1. Resumen de la decisión

Se implementó el **repo académico #1** `react-task-manager` en `apps/react-task-manager/`: React + Vite + TypeScript + Tailwind + Zod, con firma de autor en cada `.ts`/`.tsx` creado. Demuestra frontend de curso tradicional (sin API/IA).

En paralelo (sin reemplazar la prioridad académica) se abrió el track **WhatsApp Agents** en `WhatsApp-agents/`: catálogo de cinco motores + plantillas ejecutables **Meta Cloud API**, **Evolution API**, **Waha**, **Baileys** y **WhatsMeow** (Level 1: texto, menú nativo o fallback de texto, PDF/imagen cupón). Evolution, Waha, Baileys y WhatsMeow añaden humanización C (presence/typing + delay 20–45s, sin Redis/BullMQ). Baileys y WhatsMeow son **librerías socket** (adaptador inyectable + simulador HTTP `/webhook`). El catálogo Level 1 está completo.

---

## 2. Mapa de flujo de datos

### 2.1 Repo académico 1

```text
UI (components/)
  → useTasks (features/tasks/)
    → taskOperations (validación Zod + mutaciones)
      → tasksStorage → localStorage
```

| Flecha | Dato | Quién valida |
|---|---|---|
| Form → hook | título string | `taskTitleSchema` (Zod) |
| Hook → storage | `Task[]` | schema al cargar JSON corrupto |

### 2.2 Meta Cloud API (WhatsApp Agents)

```text
Meta (GET/POST /webhook)
  → presentation/webhookRoutes
    → services (verifyWebhook | inboundHandler + demoFlow + outboundBuilders)
      → infrastructure/metaGraphClient
        → Graph API v21.0 /{phone-number-id}/messages
```

| Flecha | Dato | Quién valida |
|---|---|---|
| GET verify | `hub.*` | `verifyWebhookChallenge` + token de env |
| POST inbound | envelope Meta | Zod `webhookBodySchema` → `InboundEvent` |
| Outbound | text / interactive / media | Zod + builders |
| Startup | secrets | Zod `envSchema` (fail fast) |

### 2.3 Evolution API (WhatsApp Agents)

```text
Evolution (POST /webhook)
  → presentation/webhookRoutes
    → services (inboundHandler + demoFlow + outboundBuilders)
      → services/humanizedDispatch (presence → delay → send)
        → infrastructure/evolutionClient
          → /chat/sendPresence/{instance}
          → /message/sendText|sendButtons|sendList|sendMedia/{instance}
```

| Flecha | Dato | Quién valida |
|---|---|---|
| POST inbound | envelope Evolution | Rutas: secreto opcional `x-webhook-secret`; Zod webhook → `InboundEvent` solo si `fromMe === false` |
| Humanize | presence + delay ms | `HUMANIZE_MIN_MS`/`HUMANIZE_MAX_MS` + sleep inyectable |
| Outbound | text / buttons / list / media | Zod + builders |
| Startup | secrets | Zod `envSchema` (fail fast) |

### 2.4 Waha (WhatsApp Agents)

```text
Waha (POST /webhook)
  → presentation/webhookRoutes
    → services (inboundHandler + demoFlow + outboundBuilders)
      → services/humanizedDispatch (startTyping → delay → send)
        → infrastructure/wahaClient
          → /api/startTyping
          → /api/sendText | sendFile | sendImage | sendButtons | sendList
```

| Flecha | Dato | Quién valida |
|---|---|---|
| POST inbound | envelope Waha | Rutas: secreto opcional `x-webhook-secret`; Zod webhook → `InboundEvent` solo si `fromMe === false` |
| Humanize | typing + delay ms | `HUMANIZE_MIN_MS`/`HUMANIZE_MAX_MS` + sleep inyectable |
| Outbound | text / buttons / list / media | Zod + builders |
| Startup | secrets | Zod `envSchema` (fail fast) |

### 2.5 Baileys (WhatsApp Agents)

```text
Live: QR en terminal (connection.update) + messages.upsert → inboundHandler
HTTP POST /webhook: solo simulador TDD
  → services (inboundHandler + demoFlow + outboundBuilders)
    → services/humanizedDispatch (composing → delay → send)
      → infrastructure/baileysAdapter
        → sock.sendPresenceUpdate('composing', jid)
        → sock.sendMessage(jid, content)
```

| Flecha | Dato | Quién valida |
|---|---|---|
| POST inbound | envelope simulador | Rutas: secreto opcional `x-webhook-secret`; Zod webhook → `InboundEvent` solo si `fromMe === false` |
| Humanize | composing + delay ms | `HUMANIZE_MIN_MS`/`HUMANIZE_MAX_MS` + sleep inyectable |
| Outbound | text / media (botones → texto) | Zod + builders + adaptador fake en Vitest |
| Startup | auth dir + delays | Zod `envSchema` (fail fast; piso en production) |

### 2.6 WhatsMeow (WhatsApp Agents)

```text
Live: QR en terminal + eventos de texto → inboundHandler
HTTP POST /webhook: solo simulador TDD
  → services (inboundHandler + demoFlow + outboundBuilders)
    → humanizedDispatch (composing → delay → send)
      → infrastructure.Client (fake en tests)
```

| Flecha | Dato | Quién valida |
|---|---|---|
| POST inbound | envelope simulador | Rutas: secreto opcional `x-webhook-secret`; contrato inbound solo si `fromMe === false` |
| Humanize | composing + delay ms | `HUMANIZE_MIN_MS`/`HUMANIZE_MAX_MS` + sleep inyectable |
| Outbound | text / media (botones → texto) | contratos + adaptador fake en `go test` |
| Startup | store dir + delays | `ParseEnv` (fail fast; piso en production) |

---

## 3. Justificación de Clean Architecture

**Task manager:** componentes presentacionales no tocan `localStorage`. La lógica vive en `features/tasks/`; el storage es un adaptador.

**WhatsApp Meta:** las rutas Express solo validan y delegan. La orquestación del demo está en `services/`; el HTTP a Graph queda en `infrastructure/`.

**WhatsApp Waha:** misma separación. El cliente HTTP de Waha aísla paths REST (`/api/sendText`, `/api/startTyping`, etc.) para absorber churn. Menú por defecto = texto numerado (CORE no garantiza botones/listas). Humanización C en `humanizedDispatch` sin Redis.

**WhatsApp Baileys:** no es un gateway REST. El adaptador aísla `sendPresenceUpdate` / `sendMessage`. Los tests fingen `ev.on` (QR + upsert) y nunca llaman `makeWASocket`. El QR se imprime en la terminal; el chat real entra por `messages.upsert`. HTTP `/webhook` es simulador para TDD.

**WhatsApp WhatsMeow:** mismo patrón en **Go**. El `Client` inyectable aísla presence/send. `go test` usa fakes y no importa `go.mau.fi/whatsmeow` (build tag `live`). HTTP `/webhook` es simulador; el QR live se imprime en terminal.

---

## 4. Control de salida

- Task manager: Zod rechaza títulos vacíos; storage corrupto → `[]`.
- Meta: env incompleto aborta el arranque; verify incorrecto → 403; Graph mockeado en Vitest; HMAC opcional documentado.
- Evolution: env incompleto aborta; `EVOLUTION_WEBHOOK_SECRET` opcional (header `x-webhook-secret`; sin secreto un túnel público es un send-oracle); envíos pasan por presence+delay (en production no se acepta delay 0); sleep mockeado / delays en 0 solo fuera de production; HTTP Evolution mockeado; non-2xx no cuenta como `sent`; disclaimer de gateway no oficial en README.
- Waha: el mismo patrón con `WAHA_WEBHOOK_SECRET`, `fromMe === false`, piso de delay en production, HTTP Waha mockeado, disclaimer no oficial, y fallback de menú de texto en CORE.
- Baileys: el mismo patrón con `BAILEYS_WEBHOOK_SECRET`, `fromMe === false`, piso de delay en production, **adaptador fake** (nunca socket real en CI), disclaimer no oficial, menú de texto numerado, carpeta de auth gitignoreada.
- WhatsMeow: el mismo patrón con `WHATSMEOW_WEBHOOK_SECRET`, `fromMe === false`, piso de delay en production, **cliente fake** (`go test` sin dispositivo), disclaimer no oficial, menú de texto numerado, store gitignoreado.

---

## 5. Glosario técnico

| Concepto | Aquí | Dónde |
|---|---|---|
| Feature module | Estado + reglas de tareas | `features/tasks/` |
| localStorage adapter | Persistencia aislada | `tasksStorage.ts` |
| Presentational component | Solo UI + callbacks | `components/` |
| Webhook verify | Challenge Meta | `verifyWebhook.ts` |
| Graph client | Adapter HTTP Cloud API | `metaGraphClient.ts` |
| Evolution client | Adapter HTTP gateway v2 | `evolutionClient.ts` |
| Waha client | Adapter HTTP CORE/PLUS | `wahaClient.ts` |
| Baileys adapter | Socket `sendPresenceUpdate` / `sendMessage` | `baileysAdapter.ts` |
| WhatsMeow client | Interface `SendPresence` / `SendMessage` | `internal/infrastructure/client.go` |
| Humanized dispatch | Presence + delay 20–45s | `humanizedDispatch.ts` / `humanized.go` |
| Demo flow | Keywords / botones → respuestas | `demoFlow.ts` |
| Anti-ban | Docs + Evolution/Waha/Baileys/WhatsMeow C runtime | `WhatsApp-agents/docs/anti-ban-strategy.md` |
| Author signature | Primera línea en TS/JS nuevos | `//Mariano Montini ('bosque', 'bosquestudio')` |

---

## 6. Qué defendería en una oral

- Vite por DX moderna vs CRA
- Estado fuera de `App.tsx`
- Validación Zod antes de mutar
- Firma de autor como convención de ownership en el portfolio
- **Meta primero**, **Evolution segundo**, **Waha tercero**, **Baileys cuarto**, **WhatsMeow quinto** (Go + simulador HTTP; menú texto)
- Capas presentation / services / infrastructure / contracts en los bots implementados
- Humanización C sin Redis: suficiente para demo educativo; riesgo de ban / ToS explícito
- Track WhatsApp **paralelo** al académico

---

## 7. Auditoría

| Hallazgo | Severidad | Nota |
|---|---|---|
| Repo 1 implementado y tests verdes | OK | 5 tests |
| Meta Cloud API Level 1 + tests | OK | Vitest (Graph mock) |
| Evolution API Level 1 + Compose + humanización C | OK | Vitest 31 tests (Evolution mock, sleep inyectado) |
| Waha Level 1 + Compose + humanización C | OK | Vitest 40 tests (Waha mock, sleep inyectado); `docker compose config` OK; live `up` no reclamado |
| Baileys Level 1 + humanización C | OK | Vitest 40 tests (adaptador fake, sleep inyectado); QR live no reclamado en CI |
| WhatsMeow Level 1 + humanización C | OK | `go test ./...` 27 tests (cliente fake, sleep inyectado); librería real detrás de `-tags live` |
| Repos académicos 2–5 sin código | — | Siguiente académico: express-api-boilerplate |

---

## 8. Historial de entradas

| Fecha | Change | Qué se agregó a esta bitácora |
|---|---|---|
| 2026-07-31 | `study-roadmap-docs` | Roadmap Study↔Build, recursos |
| 2026-07-31 | `academic-portfolio-5-repos` | Prioridad: 5 repos tradicionales |
| 2026-07-31 | *(human OK)* | Perfiles académicos aprobados |
| 2026-07-31 | `react-task-manager` | MVP en `apps/react-task-manager` + firmas |
| 2026-08-21 | `whatsapp-agents` | Hub WhatsApp + Meta Cloud API Level 1 (paralelo) |
| 2026-08-21 | `whatsapp-agents` §7 | HMAC webhook + Graph failures honestos (re-audit PASS WITH GAPS) |
| 2026-08-21 | `whatsapp-agents-evolution` | Evolution Level 1 + Compose + humanización C |
| 2026-08-22 | `whatsapp-agents-waha` | Waha Level 1 + Compose + humanización C + fallback de menú texto |
| 2026-08-22 | `whatsapp-agents-baileys` | Baileys Level 1 + adaptador fake + humanización C + menú texto |
| 2026-08-22 | `whatsapp-agents-whatsmeow` | WhatsMeow Level 1 en Go + cliente fake + humanización C + menú texto |
