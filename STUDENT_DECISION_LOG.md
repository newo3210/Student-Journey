# Bitácora de decisiones del estudiante

> **Idioma:** Español (pedagógico).  
> **Ubicación:** raíz del repo `STUDENT_DECISION_LOG.md`.

**Última actualización:** 2026-08-20  
**Change relacionado:** `openspec/changes/web3-login-eth/` (también vigente: `react-task-manager`)

---

## 1. Resumen de la decisión

Se mantiene el **pack académico** (5 repos tradicionales sin blockchain) y se agrega un **proyecto alterno de portfolio Web3**: `apps/web3-login-ETH/` (GitHub: `web3-login-ETH`). Demuestra connect en **Base**, identidad (Basename/ENS + avatar), balances (ETH + ERC-20 opcional) y **SIWE** (challenge → firma → sesión), con capas limpias para reusar como template.

---

## 2. Mapa de flujo de datos

### Académico #1 (sigue vigente)

```text
UI → useTasks → taskOperations → tasksStorage → localStorage
```

### Web3 template

```text
Connect (Thirdweb / Base)
  → address
    → identity (Basename → ENS → address truncada + avatar)
    → balances (ETH nativo + ERC-20 si hay env)
  → Sign in
    → challenge JWT
    → personal_sign
    → cookie de sesión
```

| Flecha | Dato | Quién valida |
|---|---|---|
| Challenge / login | address, message, signature | Zod + `viem.verifyMessage` |
| Token env | address / symbol / decimals | `tokenEnvSchema` |
| Identidad | name + avatar | timeouts + fallback |

---

## 3. Justificación de Clean Architecture

La UI no arma JWT ni habla con el RPC a mano: eso vive en `features/` + `server/authPlugin.ts` + `lib/chains.ts`. Los schemas Zod marcan el borde de auth y de configuración de token. Así el template se puede copiar a otro dapp cambiando chain/token sin reescribir la pantalla.

---

## 4. Control de salida

- Challenge expirado / firma inválida → 401, sin cookie.
- Sin Basename/ENS → address truncada; avatar roto se oculta.
- Fallo de RPC de balance → mensaje de error, no inventar montos.
- Secretos solo en `.env` (nunca en git).

---

## 5. Glosario técnico

| Concepto | Aquí | Dónde |
|---|---|---|
| Connect | Vínculo wallet ↔ dapp | `ConnectWallet.tsx` |
| SIWE | Prueba de ownership para API | `sessionClient.ts` + `authPlugin.ts` |
| Basename | Nombre en Base | `resolveIdentity.ts` |
| ENS | Nombre en Ethereum | mismo módulo + ensideas fallback |
| Auth stub | Middleware Vite pedagógico | `server/authPlugin.ts` |

---

## 6. Qué defendería en una oral

- Por qué **Connect ≠ login** para backends
- Por qué Base mainnet y balances **solo lectura**
- Dónde viven Zod y por qué el stub no es producción
- Cómo retargetear chain o ERC-20 con `.env` / `chains.ts`

---

## 7. Auditoría de modularidad (Web3)

| Hallazgo | Severidad | Nota |
|---|---|---|
| Presentation delgada | OK | Componentes orquestan hooks/features |
| Auth en infra local | OK | Stub explícitamente no productivo |
| Mezcla Academic + Web3 en el hub | Suggestion | Documentado como tracks separados |

---

## 8. Historial breve

| Fecha | Qué |
|---|---|
| 2026-07-31 | Academic #1 task manager |
| 2026-08-20 | Template Web3 Base `web3-login-ETH` |
