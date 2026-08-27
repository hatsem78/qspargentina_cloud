# SPEC — Prueba Lógica / Smoke Test del Backend Qsp CD (SDD Spec-First)

> **Status:** Approved | **Method:** SDD | **Single Source of Truth
> **Depends on:** `specs/03-qsp-backend.md`, `specs/04-qsp-structure.md`
> **Date:** 2026-08-27

---

## 1. INTENCIÓN Y LÍMITES (Scope)

Verificar que el backend (`src/backend/api/qspClient.ts` + `src/frontend/app/api/qsp/applications/route.ts`) funciona correctamente contra un **Floci Cloud** corriendo en Docker, con credenciales AWS configuradas. Solo smoke + contrato; no reemplaza motor Qsp CD.

### Non-Goals
- No genera componente UI completo.
- No reemplaza prueba de integración completa de Qsp CD.
- No expone `QSP_CD_TOKEN` ni AWS secrets al navegador.

---

## 2. CONTEXTO Y LENGUAJE UBICUO

- **Floci Cloud**: Clúster local emulado (K8s); debe estar online para `200`; si no, `502`.
- **AWS Credenciales**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (env `.env` / `docker-compose.yml`).
- **Smoke test**: `GET /api/qsp/applications` retorna `200` con `ResourceNode[]` o error `502`/`401`/`500`.

---

## 3. CONTRATOS DE PRUEBA (Test Contracts)

### 3.1 Smoke — Endpoint sano
- Condición: `Floci` corriendo; `QSP_CD_TOKEN` válido; `AWS` creds presentes.
- Resultado: `NextResponse.json({ data: ResourceNode[] })` con `200`.
- Tiempo: < 5s.

### 3.2 Contrato de datos
- `ResourceNode[]` debe cumplir `HealthStatusCode`, `SyncStatusCode`, `kind`, `children?` (secc 3.1 `03-qsp-backend.md`).

### 3.3 Fallo de conectividad (Floci offline)
- Condición: `Floci` detenido o `QSP_CD_URL` inaccesible.
- Resultado: `NextResponse.json({ error: ... }, { status: 502 })`.

### 3.4 AWS / Entorno
- Variables requeridas: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `QSP_CD_TOKEN`, `QSP_CD_URL`.
- Configuración: `.env.local` o `docker-compose.yml` env.

---

## 4. PLAN DE PRUEBA (Implementation / Test Plan)

1. **Configurar entorno local / Docker** (`docker-compose.yml` actualizado con `floci` + env AWS).
2. **Verificar Floci corriendo** (`floci` service up; o local `kubectl` / `docker ps`).
3. **Ejecutar smoke** (`curl` o Playwright / script): `GET` al endpoint.
4. **Validar contrato** (comparar respuesta con `ResourceNode` exacto).
5. **Marcar checklist** (`.agents/verify/acceptance-agent.md`).

---

## 5. CRITERIOS DE ACEPTACIÓN (Acceptance Criteria)

- [x] `docker-compose.yml` incluye servicio `floci` + env AWS configurado.
- [x] Variables AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) presentes en env/docker.
- [x] `route.ts` retorna `200` con datos `ResourceNode[]` cuando Floci online; `502` cuando offline.
- [x] `qspClient.ts` usa `QSP_CD_TOKEN` sin exponerlo.
- [x] Datos cumplen contrato exacto (`id`, `name`, `kind`, `healthStatus`, `syncStatus`, `children?`).
- [x] `.agents/verify/acceptance-agent.md` actualizado (checks `[x]`).

---

## 6. DECISIONES TOMADAS Y DESCARTADAS

- **Floci en Docker vs local**: Recomendación Docker (`docker-compose.yml`) para reproducibilidad; si falla, usar instalación local conforme `AGENTS.md`.
- **AWS creds en `.env`**: No se exponen al navegador; solo server-side/env.
- **No se incluye UI completa**: Este spec es solo prueba lógica del backend.

---

## 7. RIESGOS

- `Floci` no inicia → smoke falla `502`; debe distinguirse de error `500` de código.
- `AWS` creds faltantes → conectividad a Qsp CD puede fallar indirectamente; se valida por env, no por API.

---

*Documento generado bajo SDD. Fuente: `specs/03-qsp-backend.md`, `specs/04-qsp-structure.md`, `AGENTS.md` (Floci → Qsp CD → JWT).*
