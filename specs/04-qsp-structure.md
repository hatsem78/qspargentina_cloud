# SPEC — Estructura Separada Backend / Frontend para qspargentina_cloud (SDD Spec-First)

> **Status:** Approved | **Method:** Spec-Driven Development (SDD) | **Single Source of Truth
> **Depends on:** `specs/sdd-argocd-dashboard.md`, `specs/03-qsp-backend.md`
> **Date:** 2026-08-27

---

## 1. INTENCIÓN Y LÍMITES (Scope)

### 1.1 Problem Definition
Este repositorio (`qspargentina_cloud`) debe ser independiente, con backend y frontend claramente separados en carpetas distintas. El backend sigue la guía `extructura_base/file-system.md` (capas `api/`, `types/`, `utils/`, `actions/`). El frontend usa estándares TypeScript/React (Next.js App Router, `QspResourceTree`, Tailwind + Shadcn UI). Se incluye `docker-compose.yml` + `Dockerfile` para ejecutar ambos servicios con puertos configurables.

### 1.2 Non-Goals
- No reemplaza motor Qsp CD (Go).
- No persistencia propia (stateless).
- No genera código del componente `QspResourceTree` completo en esta spec (solo estructura y referencia visual `extructura_base/structura_base.png`).
- No expone `QSP_CD_TOKEN` al navegador.

---

## 2. CONTEXTO Y LENGUAJE UBICUO

- **Backend** (`src/backend/api/`, `src/backend/types/`, `src/backend/utils/`, `src/backend/actions/`): guía `file-system.md`; `QspClient`; `ResourceNode`; `route.ts`.
- **Frontend** (`src/frontend/app/`, `src/frontend/presentation/`, `src/frontend/public/`): Next.js + React + Tailwind + Lucide.
- **Referencia visual**: `extructura_base/structura_base.png` (jerarquía árbol Qsp CD).
- **Estilos/logos**: `src/frontend/public/assets/logo.jpeg` (copiado de `qspargentina/`); admin references locales.
- **Docker**: `docker-compose.yml` con servicios `qsp-backend` (puerto env `QSP_PORT`) y `qsp-frontend` (puerto env `NEXT_PORT`).

---

## 3. ESTRUCTURA DE CARPETAS (Data / Folder Contracts)

```bash
src/
├── backend/               # Capa de servicios, API, datos (guía file-system.md)
│   ├── api/               # QspClient, endpoints internos
│   ├── types/             # ResourceNode, HealthStatusCode, SyncStatusCode
│   ├── utils/             # format, constants
│   └── actions/           # Acciones de usuario
├── frontend/              # Capa de UI / Next.js App Router
│   ├── app/               # Route handlers (api/qsp/applications/route.ts)
│   ├── presentation/      # QspResourceTree, componente visual
│   └── public/            # Assets locales (logo.jpeg)
├── services/              # (opcional) si separa de api/
└── components/            # Componentes reutilizables de UI

docker-compose.yml
Dockerfile.backend
Dockerfile.frontend
```

---

## 4. CONTRATOS DE INTEGRACIÓN (API / Backend)

### 4.1 Endpoint — `src/frontend/app/api/qsp/applications/route.ts`
- `NextResponse.json()`; `import 'server-only'`; `process.env.QSP_CD_TOKEN` server-only.
- Errores: `500`/`502` conexión; `401` token.
- Respuesta: `ResourceNode[]` mapeado (especificado en `03-qsp-backend.md`).

### 4.2 Cliente — `src/backend/api/qspClient.ts`
- `export class QspClient`; método `getApplications()`; usa `QSP_CD_TOKEN`.
- Tipos: `ResourceNode`, `HealthStatusCode`, `SyncStatusCode`.

---

## 5. FRONTEND — ESTÁNDARES TS / REACT

- Componente: `QspResourceTree` (prop `QspApplication`); árbol jerárquico.
- Colores semánticos: `Healthy`=`#22C55E`; `Progressing`=`#3B82F6`/`#EAB308`+rotación; `Degraded`=`#EF4444`.
- Iconos: Lucide React (`CheckCircle`, `RefreshCw`, `AlertTriangle`).
- Cards: Tailwind (`shadow-sm`, `rounded`).
- Responsive.
- Referencia visual: comparar con `extructura_base/structura_base.png`.

---

## 6. DOCKER / CONTENER

### 6.1 `docker-compose.yml`
```yaml
version: '3.8'
services:
  qsp-backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      - QSP_CD_TOKEN=${QSP_CD_TOKEN}
      - QSP_CD_URL=${QSP_CD_URL:-http://localhost:8080}
    ports:
      - "${QSP_PORT:-8080}:${QSP_PORT:-8080}"
  qsp-frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://qsp-backend:8080
    ports:
      - "${NEXT_PORT:-3000}:${NEXT_PORT:-3000}"
    depends_on:
      - qsp-backend
```

### 6.2 Dockerfiles
- `Dockerfile.backend`: Node image, instala deps, expone servicio (o usa `route.ts` con Next.js API si monorepo).
- `Dockerfile.frontend`: Node image, build Next.js, expone puerto configurable.

---

## 7. CRITERIOS DE ACEPTACIÓN (Acceptance Criteria)

- [x] Estructura `src/` separada: `src/backend/` (api/types/utils) y `src/frontend/` (app/presentation/public).
- [x] `src/frontend/app/api/qsp/applications/route.ts` existe y usa `NextResponse.json()`.
- [x] `src/backend/api/qspClient.ts` (y `src/backend/api/`) exporta `QspClient` con `QSP_CD_TOKEN` server-only.
- [x] `public/assets/logo.jpeg` presente dentro de `src/frontend/public/assets/` (estilo local independiente).
- [x] `docker-compose.yml` creado; puertos configurables (`QSP_PORT`, `NEXT_PORT`).
- [x] `extructura_base/structura_base.png` usado como referencia visual para `QspResourceTree`.
- [x] `AGENTS.md` actualizado (rutas locales, referencias visuales).
- [x] `specs/03-qsp-backend.md` mantenido como fuente de contrato backend.

---

## 8. DECISIONES TOMADAS

- Separación física de carpetas: backend `src/backend/api/`, `types/`, `utils/`; frontend `src/frontend/presentation/` + `src/frontend/app/`.
- Docker-compose incluye ambos servicios con variables de entorno para puertos (independencia local).
- Referencia visual (`structura_base.png`) y estilos (`logo.jpeg`) locales para que `qspargentina_cloud` sea independiente.

---

*Documento generado bajo metodología SDD Spec-First. Fuente de guía de estructura: `extructura_base/file-system.md`. Referencia visual: `extructura_base/structura_base.png`. Código base mantenido de `specs/03-qsp-backend.md`.*
