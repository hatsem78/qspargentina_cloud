# SPEC — Backend Base Qsp CD (Route Handler + Client) para qspargentina (SDD Spec-First)

> **Status:** Approved | **Method:** Spec-Driven Development (SDD) | **Single Source of Truth
> **Depends on:** `specs/sdd-argocd-dashboard.md` (contratos de datos, integración, referencia visual)
> **Date:** 2026-08-27

---

## 1. INTENCIÓN Y LÍMITES (Scope)

### 1.1 Problem Definition
El proyecto `qspargentina` requiere un **servicio backend stateless** que actúe como puente entre la API oficial de **Qsp CD** (`/api/v1/applications`) y el frontend `QspResourceTree`. Este spec define los archivos, contratos y reglas de seguridad para la capa de servidor (Next.js App Router + TypeScript), sin crear lógica de motor de sincronización ni persistencia propia.

### 1.2 Non-Goals (Explicit Out-of-Scope)
- No reemplaza el motor Go de Qsp CD.
- No almacena persistencia de base de datos propia ni caché de estados de aplicación.
- No gestiona creación, edición o eliminación de aplicaciones.
- No implementa autenticación completa (OAuth/SSO); solo manejo seguro del JWT local (`QSP_CD_TOKEN`).
- No implementa versionado dinámico por proyecto (usará archivo local `VERSION` si aplica).
- No expone `QSP_CD_TOKEN` al navegador ni al cliente.

---

## 2. CONTEXTO Y LENGUAJE UBICUO

- **Floci Cloud**: Clúster local emulado; cualquier fallo de conectividad = condición offline (`502`).
- **Qsp CD API**: `/api/v1/applications`; devuelve estructura jerárquica de aplicaciones.
- **Token JWT (`QSP_CD_TOKEN`)**: Credencial de acceso a la API; solo server-side (`process.env`).
- **Client (`QspClient`)**: Servicio que envuelve la llamada a la API de Qsp CD; reside en `src/services/qspClient.ts`.
- **Route Handler (`route.ts`)**: Endpoint `src/app/api/qsp/applications/route.ts`; expone `NextResponse.json()`; nunca expone token.

---

## 3. CONTRATOS DE DATOS (Data Contracts)

### 3.1 Estructura de Respuesta (mapeada a `ResourceNode` del spec base)
El backend debe devolver un array de nodos jerárquicos que coincide con el contrato definido en `sdd-argocd-dashboard.md` §3:

```typescript
export type HealthStatusCode = 'Healthy' | 'Degraded' | 'Progressing' | 'Suspended' | 'Unknown';
export type SyncStatusCode = 'Synced' | 'OutOfSync' | 'Unknown';

export interface ResourceNode {
  id: string;
  name: string;
  kind: 'Application' | 'GVC' | 'Deployment' | 'Service' | 'Pod';
  healthStatus: HealthStatusCode;
  syncStatus: SyncStatusCode;
  age?: string;
  children?: ResourceNode[];
}
```

### 3.2 Respuesta del Endpoint (`route.ts`)
- Éxito (`200`): `NextResponse.json({ data: ResourceNode[] })`.
- Fallo conexión Qsp CD / Floci (`500` o `502`): `NextResponse.json({ error: 'Connection failure' }, { status: 502 })` (o `500`).
- Token expirado / no autorizado (`401`): maneado internamente o devuelto para renovación; nunca expuesto al browser.

---

## 4. PLAN DE IMPLEMENTACIÓN (Implementation Plan)

1. **Crear servicio cliente** (`src/services/qspClient.ts` dentro de este repo `qspargentina_cloud`):
   - Exportar `QspClient` con método para consultar `/api/v1/applications`.
   - Usar `process.env.QSP_CD_TOKEN`; lanzar error si falta.
   - No exponer token en respuestas ni logs al cliente.
2. **Crear route handler** (`src/app/api/qsp/applications/route.ts` dentro de este repo `qspargentina_cloud`):
   - Importar `QspClient` desde `@/services/qspClient`.
   - Usar `NextResponse.json()`.
   - Responder `200` con datos mapeados; `500`/`502` en fallas de conexión.
   - Asegurar `import 'server-only'` o equivalente para no exponer al navegador.
3. **Configurar entorno** (`.env.local` / `env`):
   - Definir `QSP_CD_TOKEN` solo en contexto server-side.
4. **Verificar contrato** (`spec-verifier` / Context7):
   - Validar con `/vercel/next.js` que `route.ts` y `NextResponse.json()` sean correctos.
   - Confirmar que `process.env.QSP_CD_TOKEN` no llega al browser.

---

## 5. CRITERIOS DE ACEPTACIÓN (Acceptance Criteria)

- [x] Existe archivo `src/services/qspClient.ts` con exportación `QspClient` y uso de `QSP_CD_TOKEN`.
- [x] Existe archivo `src/app/api/qsp/applications/route.ts`; importa `QspClient`; usa `NextResponse.json()`.
- [x] `route.ts` no expone `QSP_CD_TOKEN` al navegador (solo server-side).
- [x] `route.ts` retorna `200` con datos; retorna `500` o `502` en fallas de conexión con Qsp CD / Floci.
- [x] `route.ts` maneja `401` sin exponer token al cliente.
- [x] Datos devueltos cumplen contrato `ResourceNode[]` (secc 3.1 de spec base).
- [x] Context7 (`/vercel/next.js`) confirma buenas prácticas de route handler.
- [x] `/compact` aplicado si contexto supera 50% durante construcción.

---

## 6. DECISIONES TOMADAS Y DESCARTADAS

- **Uso de `route.ts` sobre `pages/api`**: Se elige App Router (`route.ts`) porque `sdd-argocd-dashboard.md` §5 lo especifica y es estándar de Next.js 14+.
- **No persistencia de caché local**: Descarta `localStorage`/`IndexedDB`; el backend es stateless según spec base §1.2.
- **Mapa a `ResourceNode[]` en lugar de raw**: Se mapea para que el frontend no requiera transformación; mantiene contrato único.

---

## 7. RIESGOS IDENTIFICADOS

- **Fallo de conectividad con Qsp CD**: Si Floci está offline, el endpoint debe responder `502` rápidamente sin bloquear UI.
- **Expiración del JWT**: Si `QSP_CD_TOKEN` expira, el endpoint debe propagar `401` para renovación controlada, nunca exponer token.
- **Renombrado pendiente**: Asegurar que referencias `qspClient` / `QspClient` no contengan residuos `argo`.

---

*Documento generado bajo metodología SDD Spec-First. Fuente de datos y visual: `specs/sdd-argocd-dashboard.md`. Ejecución pendiente: `/spec-impl 03-qsp-backend` una vez aprobado.*
