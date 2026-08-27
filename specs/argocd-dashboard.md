# SPEC 01 — Dashboard de Qsp CD para qspargentina (Floci Cloud)

> **Status:** Draft
> **Depends on:** SPEC 00 (AGENTS.md arquitectura base)
> **Date:** 2026-08-27
> **Objective:** Crear un dashboard personalizado en Next.js 14+ App Router que visualice jerárquicamente las aplicaciones de Qsp CD sobre el clúster emulado Floci Cloud.

## 1. Por qué existe este spec

El proyecto `qspargentina` requiere una interfaz de referencia (custom dashboard) para validar el flujo de datos entre Qsp CD y el entorno local Floci. Este documento fija los contratos, colores semánticos y límites antes de escribir código en `qspargentina`.

## 2. Alcance (Scope)

**In:**
- Cliente stateless que consume `/api/v1/applications` de Qsp CD.
- Representación de árbol jerárquico: `Application` → recursos intermedios (`GVC`, `Deployment`, `Service`) → `Pod`.
- Estados de sincronización (`Synced`, `OutOfSync`) y salud (`Healthy`, `Degraded`, `Progressing`, `Suspended`).
- Manejo de errores: banner global si Floci está offline, redirect/renovación si JWT expira (`401`), propagación visual de `Degraded` (`#EF4444`) al nodo padre.
- Componentes UI: cards con `shadow-sm`, `rounded`, iconos de Lucide React, responsive.

**Out of scope (para futuros specs):**
- Motor de sincronización de Qsp CD (Go, GitOps core).
- Persistencia de base de datos propia (solo cliente de API).
- Edición o creación de aplicaciones desde el dashboard.
- Autenticación completa (solo manejo de token JWT local).

## 3. Modelo de datos

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

## 4. Lenguaje ubicuo y glosario de dominio

- **Aplicación (Qsp Application):** Entidad raíz que gestiona el despliegue (ej. `dataspace-demo`).
- **Entorno Floci:** Clúster Kubernetes local que emula entornos Cloud (AWS/GCP/Azure).
- **Estado de Sincronización (Sync Status):** Condición GitOps. Valores válidos: `Synced`, `OutOfSync`.
- **Estado de Salud (Health Status):** Condición operativa. Valores válidos: `Healthy`, `Degraded`, `Progressing`, `Suspended`.
- **Nodo de Recurso:** Elementos intermedios del árbol (ej. `gvc datos`, `web deploy`, `web service`).

## 5. Plan de implementación

1. Crear archivo `VERSION` local (`0.1.0`) y workflow `.github/workflows/release.yml` (ya existente en repo base).
2. En `qspargentina`, implementar `QspClient` (`@/services/qspClient`) para consumir `process.env.QSP_CD_TOKEN` (nunca expuesto al navegador) y usar `NextResponse.json()`; devolver `500`/`502` en fallos de conexión.
3. Crear componente `QspResourceTree`; prop `QspApplication`; renderizar nodos raíz (`app`, git repo, branch/revision) y hijos (`Sync state`, `Health state`); usar colores: `Healthy`=verde/check-circle, `Progressing`=azul/amarillo+rotate, `Degraded`=rojo/alert; iconos Lucide; cards Tailwind (`shadow-sm`, rounded).
4. Implementar árbol jerárquico con los `ResourceNode`; propagar visualmente `Degraded` (`#EF4444`) al padre.
5. Agregar banner global: "Error de comunicación con el clúster local (Floci Offline)" cuando no responde.
6. Manejar `401 Unauthorized`: redirigir o solicitar renovación de token JWT local.

## 6. Criterios de aceptación

- [ ] El componente `QspResourceTree` se renderiza sin errores con datos de ejemplo.
- [ ] El nodo con `healthStatus: 'Degraded'` pinta borde y tipografía en `#EF4444` y propaga alerta al padre.
- [ ] El banner "Floci Offline" aparece si el clúster no responde.
- [ ] El endpoint `src/app/api/qsp/applications/route.ts` usa `QspClient`, `NextResponse.json()`, lee `process.env.QSP_CD_TOKEN`, y retorna `500`/`502` en fallos.
- [ ] El tag/release automático (`VERSION` + workflow) funciona al merge a `main`.
- [ ] No se expone `QSP_CD_TOKEN` al navegador.

## 7. Decisiones tomadas y descartadas

- **Sí:** Especificación de árbol con `ResourceNode`; mantiene contratos claros entre API y UI.
- **No:** Persistencia local de estado de aplicación; es stateless.
- **Sí:** Uso de `VERSION` local + GitHub Action para tags; evita depender del `package.json` externo.
- **No:** Automatizar detección dinámica por carpeta/branch para este spec; se desestimó ese requisito.

## 8. Riesgos identificados

| Riesgo | Mitigación |
|--------|-----------|
| Token JWT expirado (`401`) | Manejo explícito en acción y UI; renovar según flujo interno. |
| Clúster Floci no responde | Banner global y estados de carga; no bloquear UI completamente. |
| Datos de API cambian sin aviso | Contrato `ResourceNode` fijado; cambios requieren nuevo spec. |

## 9. Lo que NO está en este spec

- Reemplazo del motor de sincronización de Qsp CD (Go).
- Base de datos propia o persistencia de sesiones.
- Creación/edición de aplicaciones desde el dashboard.
- Autenticación completa (solo manejo de token JWT local, no OAuth completo).
- Lógica dinámica por proyecto para determinar versión (desestimado).
