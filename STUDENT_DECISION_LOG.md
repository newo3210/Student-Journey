# Bitácora de decisiones del estudiante

> **Idioma:** Español (pedagógico).  
> **Ubicación:** raíz del repo `STUDENT_DECISION_LOG.md`.

**Última actualización:** 2026-07-31  
**Change relacionado:** `openspec/changes/react-task-manager/`

---

## 1. Resumen de la decisión

Se implementó el **repo académico #1** `react-task-manager` en `apps/react-task-manager/`: React + Vite + TypeScript + Tailwind + Zod, con firma de autor en cada `.ts`/`.tsx` creado. Demuestra frontend de curso tradicional (sin API/IA).

---

## 2. Mapa de flujo de datos (repo 1)

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

---

## 3. Justificación de Clean Architecture

Componentes presentacionales no tocan `localStorage`. La lógica vive en `features/tasks/`; el storage es un adaptador. Así el mismo dominio se puede reusar mañana contra una API (repo 3).

---

## 4. Control de salida

Zod rechaza títulos vacíos/whitespace antes de mutar. Payload inválido en storage → lista vacía (fail soft).

---

## 5. Glosario técnico

| Concepto | Aquí | Dónde |
|---|---|---|
| Feature module | Estado + reglas de tareas | `features/tasks/` |
| localStorage adapter | Persistencia aislada | `tasksStorage.ts` |
| Presentational component | Solo UI + callbacks | `components/` |
| Author signature | Primera línea en TS/JS nuevos | `//Mariano Montini ('bosque', 'bosquestudio')` |

---

## 6. Qué defendería en una oral

- Vite por DX moderna vs CRA
- Estado fuera de `App.tsx`
- Validación Zod antes de mutar
- Firma de autor como convención de ownership en el portfolio

---

## 7. Auditoría

| Hallazgo | Severidad | Nota |
|---|---|---|
| Repo 1 implementado y tests verdes | OK | 5 tests |
| Repos 2–5 sin código | — | Siguiente: express-api-boilerplate |

---

## 8. Historial de entradas

| Fecha | Change | Qué se agregó a esta bitácora |
|---|---|---|
| 2026-07-31 | `study-roadmap-docs` | Roadmap Study↔Build, recursos |
| 2026-07-31 | `academic-portfolio-5-repos` | Prioridad: 5 repos tradicionales |
| 2026-07-31 | *(human OK)* | Perfiles académicos aprobados |
| 2026-07-31 | `react-task-manager` | MVP en `apps/react-task-manager` + firmas |
