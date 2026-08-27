# SPEC — Prueba de Conectividad / Smoke Test (SDD)

> **Status:** Draft | **Depends on:** `specs/05-qsp-backend-test.md`, `specs/03-qsp-backend.md`
> **Date:** 2026-08-27

## Scope
- Script: `tests/backend/smoke.ts` (smoke `route.ts`; verifica `200`/`502`; contrato `ResourceNode[]`).
- Floci Docker + AWS env ya configurado en `docker-compose.yml`.
- No reemplaza integration completa; es punto de entrada para validar backend.

## Acceptance
- [ ] `tests/backend/smoke.ts` existe y corre sin errores.
- [ ] `route.ts` retorna `200` con datos cuando `Floci` online.
- [ ] `route.ts` retorna `502` cuando `Floci` offline.
- [ ] Datos cumplen `ResourceNode[]`.
