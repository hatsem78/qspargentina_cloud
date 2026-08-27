# SPEC — Prueba de Conectividad / Smoke Test (SDD)

> **Status:** Approved | **Depends on:** `specs/05-qsp-backend-test.md`, `specs/03-qsp-backend.md`
> **Date:** 2026-08-27

## Scope
- Script: `tests/backend/smoke-run.sh` (ejecutable, curl 200/502), `tests/backend/smoke.ts` (TypeScript smoke), `tests/backend/contract-test.js` (validación contrato `ResourceNode[]`), `tests/backend/test-full.sh` (integración completa: Floci + AWS + smoke + contrato + token).
- Floci Docker + AWS env ya configurado en `docker-compose.yml`.
- No reemplaza integration completa; es punto de entrada para validar backend.

## Acceptance
- [x] `tests/backend/smoke-run.sh` (ejecutable) + `tests/backend/smoke.ts` + `tests/backend/contract-test.js` + `tests/backend/test-full.sh` creados.
- [x] `route.ts` retorna `200` con datos `ResourceNode[]` cuando Floci online.
- [x] `route.ts` retorna `502` cuando Floci no responde.
- [x] `qspClient.ts` usa `QSP_CD_TOKEN` sin exponerlo.
- [x] Datos cumplen contrato exacto (`id`, `name`, `kind`, `healthStatus`, `syncStatus`, `children?`).
- [x] `.agents/verify/acceptance-agent.md` actualizado (checks `[x]`).
- [x] Branch creado (`feature/spec-06-qsp-backend-test`); `AutoCreateBranch: true`.

### 5.1 Gherkin — Smoke (Backend)
```gherkin
Given el servicio qsp-backend está corriendo con Floci online
When se envía GET /api/qsp/applications
Then retorna 200 con datos ResourceNode[]
And QSP_CD_TOKEN no está expuesto
```

### 5.2 Gherkin — Fallo de conectividad
```gherkin
Given Floci está offline (QSP_CD_URL inaccesible)
When se envía GET /api/qsp/applications
Then retorna 502 con mensaje de error
```

### 5.3 Gherkin — Contrato
```gherkin
Given route.ts devuelve un array
When se compara con ResourceNode
Then todos los campos (id, name, kind, healthStatus, syncStatus, children?) están presentes
```
