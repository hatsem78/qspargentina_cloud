# SKILL — Dashboard de Argo CD para qspargentina (Floci Cloud)

> Source spec: `specs/sdd-argocd-dashboard.md`
> Visual ref: `extructura_base/structura_base.png`
> Domain code: `qspargentina/src/services/argoClient.ts`, `qspargentina/src/components/ArgoResourceTree.tsx`

---

## 1. Intención del Sistema y Límites (Scope)

**Objetivo:** Crear una interfaz de usuario personalizada (Custom Dashboard) en Next.js 14+ (App Router) para visualizar el estado de las aplicaciones desplegadas en el emulador local Floci Cloud a través de la API de Argo CD.

**Fuentes Visuales:** Replicar de manera limpia la topología de árbol jerárquico de Argo CD (Application -> Recursos intermedios [gvc, deploy, ing] -> Pods).

**Límites (Non-Goals):**
- Este dashboard NO reemplaza el motor de sincronización de Argo CD (escrito en Go).
- NO maneja persistencia de base de datos propia (es un cliente stateless de la API de Argo CD).

---

## 2. Lenguaje Ubicuo y Glosario de Dominio

- **Aplicación (Argo Application):** La entidad raíz que gestiona el despliegue (ej. `dataspace-demo`).
- **Entorno Floci:** Clúster de Kubernetes local que emula entornos Cloud (AWS/GCP/Azure).
- **Estado de Sincronización (Sync Status):** Condición de GitOps del recurso. Valores válidos: `Synced`, `OutOfSync`.
- **Estado de Salud (Health Status):** Condición operativa del recurso en el clúster Floci. Valores válidos: `Healthy`, `Degraded`, `Progressing`, `Suspended`.
- **Nodo de Recurso:** Elementos intermedios del árbol (ej. `gvc datos`, `web deploy`, `web service`).

---

## 3. Contratos de Datos (API Integration Contracts)

El cliente consumirá el endpoint oficial de Argo CD `/api/v1/applications`. La estructura simplificada del dominio en TypeScript para el árbol debe ser:

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

---

## 4. Gestión de Errores y Casos de Borde

1. **Desconexión de Floci:** Si el clúster emulado local no responde, el dashboard debe mostrar un banner global de alerta: `"Error de comunicación con el clúster local (Floci Offline)"`.
2. **Expiración de Token JWT:** Si la API de Argo CD devuelve un error `401 Unauthorized`, redirigir o solicitar la renovación del token de acceso local.
3. **Recurso en Estado Degraded:** Cualquier nodo hijo (como un Pod) con `healthStatus: 'Degraded'` debe pintar su borde y tipografía en rojo semántico `#EF4444` y propagar visualmente una alerta al nodo padre.
