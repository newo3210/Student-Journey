# Learning Roadmap — Student Journey

> **Idioma:** Español (guía de estudio).  
> **Changes:** `study-roadmap-docs`, `academic-portfolio-5-repos`  
> **Última actualización:** 2026-08-21

Este documento es la **búsqueda profesional consolidada**: qué estudiar, con qué recursos, y en paralelo **qué construir** en el portfolio.

**Prioridad actual (academia + mercado tradicional):** los **5 repos Full Stack Moderno sin IA** están perfilados en [`docs/ACADEMIC_PORTFOLIO.md`](./ACADEMIC_PORTFOLIO.md). El track Advanced (AI SDK / RAG) queda **posterior** y opcional.

**Track paralelo (no reemplaza Academic):** **WhatsApp Agents** en [`WhatsApp-agents/`](../WhatsApp-agents/README.md) — demos de bots (Meta Cloud API Level 1 primero). Útil para clientes/portfolio, pero **no** demota la prioridad de los 5 repos académicos.

---

## 0. Tres vías (no las mezcles en la cabeza)

| Vía | Pregunta que responde | Entregable |
|---|---|---|
| **Study** | ¿Qué skill practico esta semana? | Notas, ejercicios, cursos |
| **Academic Build** | ¿Qué 5 repos tradicionales subo a GitHub? | Ver `ACADEMIC_PORTFOLIO.md` |
| **WhatsApp Agents** (paralelo) | ¿Demo de bot WhatsApp para cliente? | Hub `WhatsApp-agents/` (Meta primero) |
| **Advanced Build** | ¿Template con AI / colas? | Track opcional (más abajo) |

**Orden recomendado:** cerrar Academic (5 repos) como prioridad. WhatsApp Agents puede avanzar en paralelo para demos urgentes **sin** sustituir el pack académico. Advanced (IA) sigue posterior.

```text
Study Etapa 1–2  ──►  Academic repos 1–5 (React → Express → CRUD → Auth → Next)
Study Etapa 3–4  ──►  Advanced (AI / system design) solo si el pack académico ya está sólido
```

---

## 0.1 Academic Build (prioridad) — 5 repos

| # | Repo | Demuestra |
|---|---|---|
| 1 | `react-task-manager` | Frontend React + estado + forms |
| 2 | `express-api-boilerplate` | REST + capas + Zod + `.env` |
| 3 | `fullstack-blog-crud` | CRUD + PostgreSQL + Prisma |
| 4 | `auth-jwt-dashboard` | JWT, roles, rutas protegidas |
| 5 | `nextjs-booking-app` | Next.js full stack moderno |

Detalle, rúbricas y defensa: **[`docs/ACADEMIC_PORTFOLIO.md`](./ACADEMIC_PORTFOLIO.md)**  
**Siguiente change de código:** `react-task-manager`

---

## 0.2 WhatsApp Agents (paralelo, demos)

Hub: [`WhatsApp-agents/README.md`](../WhatsApp-agents/README.md). OpenSpec: `whatsapp-agents`.

| Entregable | Estado |
|---|---|
| Catálogo motores + niveles 1–4 + anti-ban (docs only) | Hecho |
| `meta-cloud-api` Level 1 (webhook, texto, interactive, media) | Hecho |
| Evolution / Waha / Baileys / WhatsMeow | Stubs — un change por motor |

**Regla de foco:** si hay conflicto de tiempo, gana Academic. WhatsApp es vía de demo, no el camino principal de aprendizaje Full Stack.

---

## 1. Advanced Build track (opcional, post-académico)

Secuencia acordada para el repo:

```text
[Fase 1: El Esqueleto]     [Fase 2: Calidad y DB]    [Fase 3: Escalabilidad]   [Fase 4: Simulacro]
Next.js + AI SDK     ──►   Clean Arch + ORM    ──►   Queues + Caching   ──►   Ensayar Argumentación
(API básica y UI)          (Separación de capas)       (Redis / Upstash)         (Defensa del Challenge)
```

| Fase | Objetivo demostrable | Qué “controlás” |
|---|---|---|
| **1 Esqueleto** | Next.js App Router, UI simple, API route, `.env` secrets, Vercel AI SDK (streaming básico) | Request → API → modelo → respuesta; claves fuera del cliente |
| **2 Calidad y DB** | Capas (presentation / services / repositories), Zod, Supabase Auth + Postgres (+ pgvector cuando toque RAG) | Persistencia, schemas, IA fuera de la UI |
| **3 Escalabilidad** | Rate limit / cache / jobs (Upstash Redis, BullMQ o equivalente) | Costos, colas, tráfico |
| **4 Simulacro** | Template master forkeable + README de decisiones + defensa oral | Por qué elegiste X; cómo fluye la info |

**Siguiente change Advanced (solo después del pack académico):** `nextjs-ai-skeleton`  
**Ahora:** implementar Academic repo `#1` → change `react-task-manager`.

---

## 2. Study track (skills + recursos)

### Etapa 1 — Fundamentos Web y JavaScript (De 0 a 1)

**Skills:** Cliente ↔ servidor ↔ DB/API; variables, funciones, objetos; **async/await** y `fetch`; ejercicios simples de arrays/strings.

| Recurso | Por qué sirve en este camino |
|---|---|
| **midudev** — JS desde cero + Node/Express | Explicación en español, directa, ecosistema web moderno; ancla mental antes de Next |
| **freeCodeCamp** — JavaScript Algorithms and Data Structures | Gimnasia de arrays/objetos/funciones en el navegador; prepara filtros teóricos |

**Gate personal:** podés explicar con tus palabras qué pasa en una petición HTTP y escribir un `async function` que consuma un JSON sin copiar/pegar a ciegas.

### Etapa 2 — React, Next.js y Full Stack moderno

**Skills:** Componentes, forms, estado simple; API Routes GET/POST; secretos en `.env`.

| Recurso | Por qué sirve en este camino |
|---|---|
| **Platzi / Fernando Herrera (DevTalles)** — React Pro + Next.js App Router | Pedagogía fuerte en español: viaje de datos entre componentes y estructura limpia |
| **Next.js Learn** — [nextjs.org/learn](https://nextjs.org/learn) | Tutorial oficial Vercel: app full stack, DB, auth y deploy con la fuente de verdad del framework |

**Gate personal:** una página con input + `POST` a `/api/...` que no exponga API keys en el cliente.

### Etapa 3 — IA, RAG y agentes (núcleo del perfil)

**Skills:** Streaming (efecto typing); historial en Postgres; embeddings + pgvector; Zod structured output; tool calling.

| Recurso | Por qué sirve en este camino |
|---|---|
| **DeepLearning.AI (Andrew Ng)** — short courses (vector DBs, JS RAG, LangChain intro) | Cortos, enfocados, alineados a herramientas reales del mercado |
| **Scrimba — AI Engineer Path** | Edición de código sobre el video; práctica de OpenAI, vectores e UI de chat |

**Gate personal:** podés dibujar Frontend → API → Service → LLM → Repository → DB y señalar **dónde** validás con Zod.

### Etapa 4 — Arquitectura, clean code y entrevistas

**Skills:** System design (colas, cache, DB); DSA para filtros; argumentación del README.

| Recurso | Por qué sirve en este camino |
|---|---|
| **ByteByteGo (Alex Xu)** | Estándar visual de system design: colas, DB, escalabilidad |
| **NeetCode.io** (NeetCode 150) | Lista filtrada de ejercicios típicos de entrevista |

**Gate personal:** 5 minutos defendiendo por qué Supabase + capas + Zod sin mirar apuntes.

---

## 3. Temas “clásicos” vs Build (referencia)

El plan largo (fundamentos → UI/API → capa IA → template/defensa) **no se tira**: se reparte así:

| Bloque clásico | Dónde vive ahora |
|---|---|
| Arquitectura web + JS + algoritmos básicos | Study Etapa 1 (+ NeetCode en Etapa 4) |
| React + API routes Next + `.env` | Study Etapa 2 + Build Fase 1 |
| LLM streaming + Supabase/pgvector + Zod/tools | Study Etapa 3 + Build Fase 2 |
| Template master + Clean Arch + Redis/colas + README defensa | Build Fase 2–4 + Study Etapa 4 |

---

## 4. Evidencia de portfolio (qué debe verse en GitHub)

1. **Flujo de información** documentado (`ARCHITECTURE_SDD.md` + diagramas en README)
2. **Control de output** (schemas Zod en fronteras API y LLM)
3. **Modularidad** (UI sin prompts ni SQL; services con orquestación)
4. **Argumentación** (`STUDENT_DECISION_LOG.md` + README “Why we chose X”)
5. **Template forkeable** (al cerrar Fase 4): Auth, DB, Tailwind, AI SDK listos

---

## 5. Cómo usar esto con `/director`

1. Estudiá el gate de la etapa actual  
2. Pedí el change de **Build** correspondiente (`/director <idea>`)  
3. No pases de fase de build sin actualizar bitácora y architecture docs  

**Ahora:** perfiles académicos listos → pedir **`react-task-manager`** cuando apruebes `docs/ACADEMIC_PORTFOLIO.md`.
