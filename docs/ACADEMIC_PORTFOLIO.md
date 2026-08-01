# Academic Portfolio — 5 Repositories

> **Track:** Full Stack Moderno **tradicional** (estándar académico + mercado junior/mid)  
> **Sin:** IA, RAG, agents, blockchain, Web3  
> **Change:** `openspec/changes/academic-portfolio-5-repos/`  
> **Última actualización:** 2026-07-31  
> **Estado:** Perfilados / documentados — **aún no implementados**

Este documento fija los **5 repos de GitHub** que demuestran el conocimiento de un curso Full Stack Moderno clásico. Cada perfil sirve como rúbrica de TP + briefing para el README de defensa.

---

## Vista rápida

| # | Repo GitHub | Rol académico | Stack núcleo |
|---|---|---|---|
| 1 | `react-task-manager` | Frontend + estado | React, TypeScript, Vite, Tailwind |
| 2 | `express-api-boilerplate` | Backend REST | Node, Express, TypeScript, Zod |
| 3 | `fullstack-blog-crud` | Full stack CRUD + DB | React + Express + PostgreSQL + Prisma |
| 4 | `auth-jwt-dashboard` | Auth, roles, rutas protegidas | React + Express + Postgres + JWT |
| 5 | `nextjs-booking-app` | Full stack moderno unificado | Next.js App Router + Postgres + Auth |

**Orden de construcción:** `1 → 2 → 3 → 4 → 5`  
**Próximo change de código:** `react-task-manager`

**Estrategia de publicación:** 5 repositorios **separados** en GitHub (claridad para recruiters). Este monorepo `Student Journey` actúa como hub de specs/docs hasta que cada change scaffoldée el código.

---

## Rúbrica global (lo que el mercado/academia mira)

Cada repo debe mostrar, en su nivel:

1. README claro (qué es, cómo correr, decisiones técnicas)
2. TypeScript tipado
3. Validación de inputs (Zod o equivalente en el backend)
4. Separación razonable de responsabilidades
5. Git con historial legible
6. Sin secretos en el repo (`.env.example` sí; `.env` no)

Extra valorado (repos 3–5): tests mínimos, deploy, diagrama de flujo Frontend → API → DB.

---

## 1. `react-task-manager`

### Propósito
Demostrar **frontend React moderno**: componentes, estado, formularios, listas y UI mantenible **sin backend**.

### Stack
- React 18+ + TypeScript
- Vite
- Tailwind CSS
- (Opcional) React Router si hay más de una vista

### MVP features
- [x] Crear / editar / completar / eliminar tareas
- [x] Filtros: todas / activas / completadas
- [x] Persistencia local (`localStorage`) para no perder datos al recargar
- [x] Formulario controlado con validación básica en cliente
- [x] UI responsive

> **Implementación:** `apps/react-task-manager/` (hub monorepo). Remoto GitHub sugerido: `react-task-manager`.

### Capas / carpetas (intención)
```text
src/
  components/     # UI presentational
  features/tasks/ # estado + lógica de tareas
  hooks/
  types/
  App.tsx
```

### Rúbrica académica
| Criterio | Peso |
|---|---|
| Componentes reutilizables y props claras | Alto |
| Estado predecible (sin spaghetti) | Alto |
| UX de formularios y listas | Medio |
| TypeScript estricto | Medio |

### Bullets de defensa (oral / README)
- Por qué Vite frente a CRA
- Dónde vive el estado y por qué no “todo en App.tsx”
- Cómo validás el input antes de mutar la lista

### Fuera de alcance
API, base de datos, auth, IA, PWA compleja

---

## 2. `express-api-boilerplate`

### Propósito
Demostrar **backend REST** profesional: rutas delgadas, servicios, validación, errores HTTP, variables de entorno.

### Stack
- Node.js + Express + TypeScript
- Zod (request validation)
- dotenv + `.env.example`
- Vitest o Jest (smoke tests de rutas)
- Sin DB todavía (datos en memoria) **o** stub de repository — preferible in-memory para foco en HTTP

### MVP features
- [ ] `GET /health`
- [ ] CRUD de un recurso de ejemplo (`/api/items`)
- [ ] Validación Zod → `400` con cuerpo estable
- [ ] Manejo centralizado de errores → `404` / `500`
- [ ] Estructura: `routes` → `controllers` → `services` → (memory) `repository`
- [ ] README con tabla de endpoints

### Capas / carpetas (intención)
```text
src/
  routes/
  controllers/   # presentation HTTP
  services/      # application
  repositories/  # infrastructure (memory)
  schemas/       # Zod contracts
  app.ts
  server.ts
```

### Rúbrica académica
| Criterio | Peso |
|---|---|
| REST + status codes correctos | Alto |
| Validación y errores consistentes | Alto |
| Capas (no lógica gorda en la ruta) | Alto |
| `.env` / secretos | Medio |

### Bullets de defensa
- Qué va en controller vs service
- Por qué Zod en el borde HTTP
- Cómo devolverías el mismo contrato si mañana hay Postgres

### Fuera de alcance
Frontend, JWT completo (eso es repo 4), ORM, IA

---

## 3. `fullstack-blog-crud`

### Propósito
El TP estrella: **CRUD punta a punta** con base de datos relacional (posts, autores, comentarios).

### Stack
- Frontend: React + TypeScript + Vite + Tailwind
- Backend: Express + TypeScript (reutilizar patrones del boilerplate)
- DB: PostgreSQL + Prisma
- Docker Compose opcional para Postgres local

### MVP features
- [ ] Modelo: `User` (simple), `Post`, `Comment` (1:N)
- [ ] CRUD posts (listado, detalle, crear, editar, borrar)
- [ ] Comentarios en un post
- [ ] Front consume API con `fetch`/`axios`
- [ ] Migraciones Prisma documentadas
- [ ] Seed mínimo de datos

### Capas / carpetas (intención)
```text
apps/web/          # o /frontend
apps/api/          # o /backend
  prisma/
  src/... (capas como en #2)
```
*(Monorepo interno del repo 3 está OK; sigue siendo un solo remoto GitHub.)*

### Flujo de datos
```text
React UI → Express routes → services → Prisma repository → PostgreSQL
```

### Rúbrica académica
| Criterio | Peso |
|---|---|
| Modelo relacional coherente | Alto |
| CRUD completo y sin fugas de secretos | Alto |
| Separación front/back | Alto |
| README con setup DB | Medio |

### Bullets de defensa
- Por qué Prisma (DX + migraciones) vs SQL crudo
- Integridad referencial posts/comentarios
- Qué pasa en un `404` de post inexistente

### Fuera de alcance
OAuth social, AI summaries, CMS headless complejo, blockchain

---

## 4. `auth-jwt-dashboard`

### Propósito
Demostrar **autenticación, autorización y rutas protegidas** (lo que más piden en rúbricas de curso y en juniors).

### Stack
- React + TypeScript + Vite
- Express + TypeScript + PostgreSQL + Prisma
- Auth: registro/login, password hash (bcrypt/argon2), JWT (Bearer o cookie httpOnly)
- Roles: `user` | `admin`

### MVP features
- [ ] Register / Login / Logout
- [ ] Hash de passwords (nunca texto plano)
- [ ] Middleware `requireAuth` y `requireRole('admin')`
- [ ] Rutas front públicas vs privadas
- [ ] Dashboard: perfil del usuario autenticado
- [ ] Vista admin: listado de usuarios (solo admin)
- [ ] `.env.example` con `JWT_SECRET` (nunca commitear el real)

### Capas / carpetas (intención)
```text
# API
controllers/auth.controller.ts
services/auth.service.ts
middleware/auth.ts
schemas/auth.schemas.ts

# Web
pages/Login, Register, Dashboard, AdminUsers
auth/ context o store de sesión
```

### Rúbrica académica
| Criterio | Peso |
|---|---|
| Seguridad básica de passwords + JWT | Crítico |
| Rutas protegidas front y back | Alto |
| Roles funcionando de verdad | Alto |
| Mensajes de error 401/403 claros | Medio |

### Bullets de defensa
- Cookie httpOnly vs localStorage (trade-off XSS/CSRF)
- Diferencia autenticación vs autorización
- Por qué el front **no** es la única guarda (el API también valida)

### Fuera de alcance
OAuth Google/GitHub (opcional post-MVP), 2FA, IA, refresh-token rotation avanzada (mencionar como mejora)

---

## 5. `nextjs-booking-app`

### Propósito
Cerrar el pack académico con el **estándar full stack moderno del mercado**: Next.js App Router + DB + auth + dominio realista simple (**reservas**), sin pasarela de pagos ni crypto.

### Stack
- Next.js (App Router) + TypeScript + Tailwind
- PostgreSQL + Prisma
- Auth: sesión (NextAuth/Auth.js **o** JWT propio reutilizando ideas del repo 4)
- Validación Zod en Server Actions o Route Handlers

### MVP features
- [ ] Listado de recursos reservables (habitaciones / espacios / turnos)
- [ ] Detalle + crear reserva (fecha/hora o rango)
- [ ] Usuario autenticado ve “mis reservas”
- [ ] Admin puede crear/editar recursos
- [ ] Validación: no solapar reservas (regla de negocio en service)
- [ ] Deploy documentado (Vercel + DB cloud) — meta del README

### Capas / carpetas (intención)
```text
app/                 # UI + route handlers (presentation delgada)
services/            # reglas de booking
repositories/        # Prisma
schemas/             # Zod
prisma/
```

### Flujo de datos
```text
UI (app/) → Route Handler / Server Action → service → repository → PostgreSQL
```

### Rúbrica académica
| Criterio | Peso |
|---|---|
| App Router usado con criterio (server/client) | Alto |
| Regla de negocio de reservas en service (no en el JSX) | Alto |
| Auth + ownership de reservas | Alto |
| Deploy / README profesional | Medio |

### Bullets de defensa
- Por qué Next unificado vs React+Express separados (y cuándo preferirías separados — referenciás repos 3–4)
- Dónde vive la regla “no double booking”
- Cómo ocultás secretos de DB en Vercel

### Fuera de alcance
Stripe/pagos, mapas, IA de recomendaciones, blockchain, multi-tenant enterprise

---

## Orden de build y dependencias

```text
react-task-manager
        │  (componentes, estado, forms)
        ▼
express-api-boilerplate
        │  (REST, capas, Zod, errores)
        ▼
fullstack-blog-crud
        │  (une #1+#2 + Postgres)
        ▼
auth-jwt-dashboard
        │  (seguridad sobre el full stack)
        ▼
nextjs-booking-app
           (mismo conocimiento, stack unificado moderno)
```

| Paso | OpenSpec change sugerido | Repo |
|---|---|---|
| 1 | `react-task-manager` | Frontend |
| 2 | `express-api-boilerplate` | API |
| 3 | `fullstack-blog-crud` | CRUD |
| 4 | `auth-jwt-dashboard` | Auth |
| 5 | `nextjs-booking-app` | Next full stack |

---

## Checklist por repo (antes de decir “listo para GitHub”)

- [ ] README: qué / por qué / setup / stack / decisiones
- [ ] `.env.example` (si aplica)
- [ ] Sin IA ni dependencias de LLM
- [ ] Al menos un diagrama de flujo en README (repos 3–5)
- [ ] Licencia MIT (u otra) si es público
- [ ] Captura o GIF corto de la UI (opcional pero ayuda)

---

## Relación con el track Advanced (IA)

El track con AI SDK / RAG documentado en `docs/LEARNING_ROADMAP.md` es **opcional y posterior**.  
**Este Academic Portfolio es el requisito base** alineado a curso Full Stack Moderno tradicional y a filtros laborales clásicos.
