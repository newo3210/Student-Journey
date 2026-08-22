# Bitácora de decisiones del estudiante

> **Idioma:** Español (pedagógico).  
> **Ubicación:** raíz del repo `STUDENT_DECISION_LOG.md`.

**Última actualización:** 2026-08-21  
**Changes relacionados:** `openspec/changes/react-task-manager/`, `openspec/changes/whatsapp-agents/`, `openspec/changes/whatsapp-agents-evolution/`

---

## 1. Resumen de la decisión

Se implementó el **repo académico #1** `react-task-manager` en `apps/react-task-manager/`: React + Vite + TypeScript + Tailwind + Zod, con firma de autor en cada `.ts`/`.tsx` creado. Demuestra frontend de curso tradicional (sin API/IA).

En paralelo (sin reemplazar la prioridad académica) se abrió el track **WhatsApp Agents** en `WhatsApp-agents/`: catálogo de motores + plantillas ejecutables **Meta Cloud API** y **Evolution API** (Level 1: webhook, texto, botones/listas, PDF/imagen cupón). Evolution añade Compose + humanización C (presence `composing` + delay 20–45s, sin Redis/BullMQ). Waha / Baileys / WhatsMeow siguen como stubs.

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

---

## 3. Justificación de Clean Architecture

**Task manager:** componentes presentacionales no tocan `localStorage`. La lógica vive en `features/tasks/`; el storage es un adaptador.

**WhatsApp Meta:** las rutas Express solo validan y delegan. La orquestación del demo está en `services/`; el HTTP a Graph queda en `infrastructure/`.

**WhatsApp Evolution:** misma separación. El cliente HTTP de Evolution está aislado (paths v2 documentados en README) para absorber churn de la API. La humanización C vive en `humanizedDispatch` (inyectable en tests) sin colas Redis.

---

## 4. Control de salida

- Task manager: Zod rechaza títulos vacíos; storage corrupto → `[]`.
- Meta: env incompleto aborta el arranque; verify incorrecto → 403; Graph mockeado en Vitest; HMAC opcional documentado.
- Evolution: env incompleto aborta; `EVOLUTION_WEBHOOK_SECRET` opcional (header `x-webhook-secret`; sin secreto un túnel público es un send-oracle); envíos pasan por presence+delay (en production no se acepta delay 0); sleep mockeado / delays en 0 solo fuera de production; HTTP Evolution mockeado; non-2xx no cuenta como `sent`; disclaimer de gateway no oficial en README.

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
| Humanized dispatch | Presence + delay 20–45s | `humanizedDispatch.ts` |
| Demo flow | Keywords / botones → respuestas | `demoFlow.ts` |
| Anti-ban | Docs + Evolution C runtime | `WhatsApp-agents/docs/anti-ban-strategy.md` |
| Author signature | Primera línea en TS/JS nuevos | `//Mariano Montini ('bosque', 'bosquestudio')` |

---

## 6. Qué defendería en una oral

- Vite por DX moderna vs CRA
- Estado fuera de `App.tsx`
- Validación Zod antes de mutar
- Firma de autor como convención de ownership en el portfolio
- **Meta primero** (API oficial) y **Evolution segundo** (Compose + humanización C simple)
- Capas presentation / services / infrastructure / contracts en ambos bots
- Humanización C sin Redis: suficiente para demo educativo; riesgo de ban / ToS explícito
- Track WhatsApp **paralelo** al académico

---

## 7. Auditoría

| Hallazgo | Severidad | Nota |
|---|---|---|
| Repo 1 implementado y tests verdes | OK | 5 tests |
| Meta Cloud API Level 1 + tests | OK | Vitest (Graph mock) |
| Evolution API Level 1 + Compose + humanización C | OK | Vitest 31 tests (Evolution mock, sleep inyectado) |
| Waha / Baileys / WhatsMeow | — | Stubs README only |
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
