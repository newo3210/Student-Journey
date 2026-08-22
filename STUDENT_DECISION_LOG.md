# Bitácora de decisiones del estudiante

> **Idioma:** Español (pedagógico).  
> **Ubicación:** raíz del repo `STUDENT_DECISION_LOG.md`.

**Última actualización:** 2026-08-21  
**Changes relacionados:** `openspec/changes/react-task-manager/`, `openspec/changes/whatsapp-agents/`

---

## 1. Resumen de la decisión

Se implementó el **repo académico #1** `react-task-manager` en `apps/react-task-manager/`: React + Vite + TypeScript + Tailwind + Zod, con firma de autor en cada `.ts`/`.tsx` creado. Demuestra frontend de curso tradicional (sin API/IA).

En paralelo (sin reemplazar la prioridad académica) se abrió el track **WhatsApp Agents** en `WhatsApp-agents/`: catálogo de motores + plantilla ejecutable **Meta Cloud API** (webhook, texto, botones interactivos, PDF/imagen cupón). Los demás motores quedan como stubs. Anti-ban solo documentado.

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

---

## 3. Justificación de Clean Architecture

**Task manager:** componentes presentacionales no tocan `localStorage`. La lógica vive en `features/tasks/`; el storage es un adaptador.

**WhatsApp Meta:** las rutas Express solo validan y delegan. La orquestación del demo (keywords → menú → media) está en `services/`; el HTTP a Graph queda en `infrastructure/`. Así se puede mockear Graph en tests sin ensuciar presentation.

---

## 4. Control de salida

- Task manager: Zod rechaza títulos vacíos; storage corrupto → `[]`.
- Meta: env incompleto aborta el arranque; verify incorrecto → 403 sin eco del challenge; payloads outbound tipados; Graph mockeado en Vitest.
- Post adversarial: si hay `WHATSAPP_APP_SECRET`, el POST valida `X-Hub-Signature-256` (HMAC sobre raw body); Graph non-2xx se loguea y no cuenta como `sent`. Túnel público sin secret sigue siendo inseguro (documentado). Ack 200 temprano puede perder mensajes si Graph falla.

---

## 5. Glosario técnico

| Concepto | Aquí | Dónde |
|---|---|---|
| Feature module | Estado + reglas de tareas | `features/tasks/` |
| localStorage adapter | Persistencia aislada | `tasksStorage.ts` |
| Presentational component | Solo UI + callbacks | `components/` |
| Webhook verify | Challenge Meta | `verifyWebhook.ts` |
| Graph client | Adapter HTTP Cloud API | `metaGraphClient.ts` |
| Demo flow | Keywords / botones → respuestas | `demoFlow.ts` |
| Anti-ban (docs) | Presence + jitter + colas (futuro) | `WhatsApp-agents/docs/anti-ban-strategy.md` |
| Author signature | Primera línea en TS/JS nuevos | `//Mariano Montini ('bosque', 'bosquestudio')` |

---

## 6. Qué defendería en una oral

- Vite por DX moderna vs CRA
- Estado fuera de `App.tsx`
- Validación Zod antes de mutar
- Firma de autor como convención de ownership en el portfolio
- **Meta primero** porque es API oficial: no hace falta anti-ban runtime para el demo
- Capas presentation / services / infrastructure / contracts en el bot
- Track WhatsApp **paralelo** al académico: demos de cliente sin bajar la prioridad de los 5 repos Full Stack

---

## 7. Auditoría

| Hallazgo | Severidad | Nota |
|---|---|---|
| Repo 1 implementado y tests verdes | OK | 5 tests |
| Meta Cloud API Level 1 + tests | OK | Vitest (Graph mock) |
| Evolution / Waha / Baileys / WhatsMeow | — | Stubs README only |
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
