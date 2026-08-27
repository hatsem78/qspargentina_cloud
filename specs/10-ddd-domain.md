# SPEC 10 — Modelo de Dominio DDD para Qsp CD Dashboard (Floci / Argo)

> **Status:** Draft
> **Depends on:** SPEC 01 (`argocd-dashboard.md`), SPEC 07 (`07-visual-check.md`), SPEC 08 (`08-integration-flci.md`), SPEC 09 (`09-functional-acceptance.md`)
> **Date:** 2026-08-27
> **Objective:** Definir el modelo de dominio (DDD) para el dashboard: Aplicación, Entorno (Floci), Estado de Sincronización y Repositorio Git; incluir codificación, tests y verificación.

## 1. Por qué existe este spec

Tras implementar `QspResourceTree`, `route.ts`, visual y aceptación, falta formalizar el contrato de dominio (`ResourceNode`, `QspApplication`) y asegurar que todos los servicios (`qspClient.ts`, `qsp-backend`) respeten los límites de Floci y nunca expongan `QSP_CD_TOKEN`.

## 2. Alcance (Scope)

**In:**
- Modelo de dominio formalizado: `Application`, `FlociEnvironment`, `SyncStatus`, `GitRepo`, `ResourceNode`.
- Código en `src/services/` (y actualización de `qspClient.ts` / `route.ts`) reflejando el modelo.
- Tests `tests/visual/test-tree.spec.ts` y `tests/frontend/test-lucide.sh` como verificación de contrato.
- Actualización de `.agents/verify/acceptance-agent.md` con criterios DDD.
- Verificación con `docker-compose` (Floci `floci/floci:latest`) sin `npm`/`python` externo.

**Out of scope:**
- Reemplazo del motor Go de Qsp CD.
- Persistencia independiente (stateless).
- Creación/edición de aplicaciones desde UI.
- Autenticación completa (solo JWT local).

## 3. Modelo de datos / Domain Model

```typescript
export interface Application {
  id: string;            // metadata.name
  name: string;
  namespace: string;
  source: GitRepo;        // repoURL + targetRevision
  status?: SyncStatus;
  health?: HealthStatus;
}

export interface FlociEnvironment {
  clusterName: string;    // desplegado local
  endpoint: string;       // QSP_CD_URL
  status: 'online' | 'offline';
  tokenRef: 'env';        // server-only, nunca browser
}

export interface SyncStatus {
  status: 'Synced' | 'OutOfSync' | 'Unknown';
  revision: string;       // main / c38739b / etc.
  lastSync?: string;
}

export interface HealthStatus {
  status: 'Healthy' | 'Degraded' | 'Progressing' | 'Suspended';
  lastCheck?: string;
}

export interface GitRepo {
  repoURL: string;
  targetRevision: string;
}

export interface ResourceNode {
  id: string;
  name: string;
  kind: 'Application' | 'GVC' | 'Deployment' | 'Service' | 'Pod';
  healthStatus: HealthStatus;
  syncStatus: SyncStatus;
  age?: string;
  children?: ResourceNode[];
}
```

## 4. Plan de implementación

1. Validar `qspClient.ts` con modelo DDD (`ResourceNode`, `QspApplication`).
2. Confirmar `route.ts` usa `QspClient`, `NextResponse.json()`, env `QSP_CD_TOKEN`, retorna `500`/`502`.
3. Confirmar componente `QspResourceTree` renderiza `ResourceNode` jerárquicamente con colores semánticos (`Healthy`/`Progressing`/`Degraded`/`Suspended`).
4. Ejecutar `tests/visual/test-tree.spec.ts` (Playwright) con `baseline-structura.png`; validar colores/proyección.
5. Ejecutar `tests/frontend/test-lucide.sh` (chequeo funcional).
6. Actualizar `.agents/verify/acceptance-agent.md` con checks DDD.
7. Marcar `VERSION` (`0.1.0`) y workflow `.github/workflows/release.yml`.

## 5. Criterios de aceptación

- [ ] `ResourceNode` y tipos DDD (`Application`, `FlociEnvironment`, `SyncStatus`, `GitRepo`) definidos y usados.
- [ ] `QspResourceTree` consume `ResourceNode`; propaga `Degraded` (`#EF4444`) al padre.
- [ ] `route.ts` no expone `QSP_CD_TOKEN`; usa `NextResponse.json()`; retorna `500`/`502`.
- [ ] `docker-compose` con `floci/floci:latest` levanta sin errores; `test-lucide.sh` pasa.
- [ ] Visual `baseline-structura.png` coincide con `QspResourceTree`.
- [ ] `acceptance-agent.md` actualizado; `VERSION` + workflow operativos.

## 6. Decisiones tomadas y descartadas

- **Sí:** Modelo DDD fijo (`ResourceNode` como contrato único entre API y UI).
- **No:** Persistencia fuera de API; es stateless.
- **Sí:** Uso de `VERSION` + workflow para control de release; no dependencia de `package.json` externo.

## 7. Riesgos identificados

| Riesgo | Mitigación |
|--------|-----------|
| Datos de API cambian sin aviso | Contrato `ResourceNode` fijado; cambios requieren nuevo spec |
| `QSP_CD_TOKEN` expuesto | Regla `server-only` + env nunca al navegador; verificado en `route.ts` y `page.tsx` |
| Floci no responde | Banner global + `502`; no bloquea UI |
