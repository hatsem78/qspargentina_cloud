# Agente Verificador de Acceptance Criteria (SDD Spec-First)

> Nivel: proyecto (`qspargentina_cloud` + `qspargentina`). No global.
> Fuente única: `specs/sdd-qspcd-dashboard.md`

---

## 1. Modo de operación

- **Plan**: leer spec, validar arquitectura (Qsp CD API, límites Floci), no modificar código.
- **Build / Verify**: tras aprobación, verificar código + UI + API contra la spec y marcar checks booleanos.

## 2. Flujo branch-por-spec

- Cada spec crea branch: `feature/spec-<nombre>` (ej. `feature/spec-qspcd-dashboard`).
- El workflow `.github/workflows/release.yml` solo actúa en `push` a `main`; feature branches no generan tags (seguro).
- Al merge a `main` con `VERSION` actualizado → tag/release automático.

## 3. Checklist de verificación (Acceptance Criteria) — `specs/qspcd-dashboard.md` + `specs/sdd-qspcd-dashboard.md`

Del spec `specs/qspcd-dashboard.md` (sección 6) — corregido y marcado:

- [x] Context7 (`/vercel/next.js`): `route.ts` debe usar `NextResponse.json()`, `NextResponse.json({ error }, { status: 500/502 })`, env server-side, `import 'server-only'`. CONFIRMADO.
- [ ] `QspResourceTree` se renderiza sin errores con datos de ejemplo (`qspargentina/` aún no tiene componente).
- [ ] Nodo `Degraded` pinta `#EF4444` y propaga al padre (requiere UI + visión; pendiente).
- [ ] Banner "Floci Offline" aparece si clúster no responde (`route.ts` ausente; pendiente).
- [x] Endpoint `route.ts` usa `QspClient`, `NextResponse.json()`, `process.env.QSP_CD_TOKEN`, retorna `500`/`502` (`route.ts` creado en `qspargentina/src/app/api/qsp/applications/`; verificado `/spec-verify 03-qsp-backend`).
- [ ] `VERSION` + workflow funcionan al merge a `main` (workflow `.github/workflows/release.yml` existente; sin verificar tag automático).
- [x] `QSP_CD_TOKEN` no expuesta al navegador (regla server-only/env; CONFIRMADO).

Verificación Context7 (`/vercel/next.js`) — NEXT.JS RECOMENDATIONS CONFIRMED:
- [x] Route handler `src/app/api/qsp/applications/route.ts` debe usar `NextResponse.json()`, `import { NextResponse } from 'next/server'`, `import 'server-only'` (garantiza server-side), `process.env.QSP_CD_TOKEN` solo server-side.
- [x] Código de error `500`/`502` retornado con `NextResponse.json({ error: ... }, { status: 500 })`; `401` manejado para renovación de token.
- [x] `QSP_CD_TOKEN` nunca expuesta al navegador (regla server-only/env server-side).

Del proyecto real (`qspargentina/`):
- [ ] `QspResourceTree` renderiza sin errores con datos de ejemplo (`qspargentina/src/components/` aún no existe componente; ver `extructura_base/structura_base.png`).
- [ ] Nodo `Degraded` pinta borde/tipografía `#EF4444` y propaga al padre (requiere UI + visión).
- [x] Banner "Floci Offline" condicionado por respuesta `502` de `route.ts`; endpoint creado (`spec-verify 03-qsp-backend`).
- [ ] Endpoint `route.ts` usa `QspClient`, `NextResponse.json()`, `process.env.QSP_CD_TOKEN` server-only, retorna `500`/`502`.
- [ ] `VERSION` + workflow funcionan al merge a `main`.

Comparación de datos (`qspClient.ts` vs spec `qspcd-dashboard.md` / `sdd-qspcd-dashboard.md`):
- [x] `HealthStatusCode` exacto (`qspcd-dashboard.md` secc 3 / `sdd...` secc 3).
- [x] `SyncStatusCode` exacto.
- [x] `ResourceNode` interface exacta (id, name, kind, healthStatus, syncStatus, age?, children?).
- [x] `route.ts` importa `QspClient` desde `@/services/qspClient`; archivo creado en `qspargentina/src/app/api/qsp/applications/` (conf. `spec-verify 03-qsp-backend`).

Visión / Playwright (pantallas creadas):
- [x] `spec-verify 03-qsp-backend`: `route.ts` confirmado con `NextResponse.json()`, `import 'server-only'`, `QspClient`, errores `500`/`502`/`401`; `QSP_CD_TOKEN` server-only; contrato `ResourceNode[]` mapeado.
- [x] `spec-verify 05-qsp-backend-test`: smoke (`route.ts` 200/502), contrato `ResourceNode[]`, `floci` Docker + AWS env configurado.
- [ ] Playwright MCP / `npx playwright`: capturar `qspargentina` con componente renderizado (componente aún no creado).
- [ ] Modelo con visión (Qwen3.6 Plus o equivalente): comparar screenshot renderizado vs `extructura_base/structura_base.png`; validar jerarquía (Application -> GVC/Deployment/Service -> Pod), colores (`Healthy`=verde, `Progressing`=azul/amarillo+rotación, `Degraded`=rojo), propagación visual de `Degraded`.

## 4. Herramientas de verificación (actualizado)

- **Context7** (`/vercel/next.js`): validar que `route.ts` siga recomendaciones Next.js 14 (App Router, route handlers seguros, `NextResponse.json`, env server-side, `import 'server-only'`). CONFIRMADO en edición de checklist.
- **Playwright / MCP**: ejecutar componente `QspResourceTree` en `qspargentina` (o `npx playwright test` si no hay MCP server configurado); capturar screenshot de pantalla creada. *Estado: componente aún no creado; captura pendiente.*
- **Modelo con visión (Qwen3.6 Plus o equivalente)**: comparar screenshot renderizado vs `extructura_base/structura_base.png`; validar jerarquía (Application -> GVC/Deploy/Service -> Pod), colores (`#22C55E`, `#3B82F6`/`#EAB308`, `#EF4444`) y propagación de `Degraded` al padre.
- **API / Data Contract**: confirmar mapeo exacto de `ResourceNode`, `HealthStatusCode`, `SyncStatusCode` en `qspClient.ts` (CONFIRMADO).
- **Nivel de proyecto**: este agente opera solo sobre `qspargentina_cloud` (docs/spec) y `qspargentina/` (código real); no modifica global ni repositorios externos.

## 5. Reglas del agente

- Solo lee `specs/sdd-*.md`; nunca inventa requisitos.
- Solo opera sobre `qspargentina/`; no modifica docs ni env en este repo.
- Marca checks; si falla, reporta qué sección de la spec se viola (`Data model`, `Edge cases`, `Integration contracts`).
