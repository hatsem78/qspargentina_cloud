# SPEC — Dashboard Personalizado de Qsp CD para qspargentina (SDD Spec-First)

> **Status:** Draft | **Method:** Spec-Driven Development (SDD) | **Single Source of Truth**

---

## 1. INTENCIÓN Y LÍMITES (Scope)

### 1.1 Problem Definition
El proyecto `qspargentina` requiere una interfaz de usuario personalizada (Custom Dashboard) en Next.js 14+ (App Router) para visualizar, de forma simplificada y jerárquica, el estado de sincronización y salud de las aplicaciones desplegadas en el emulador local **Floci Cloud** mediante la API oficial de **Qsp CD** (`/api/v1/applications`).

El objetivo es replicar la topología de árbol jerárquico capturada de Qsp CD —raíz `Application`, recursos intermedios (`gvc datos`, `web deploy`, `web service`), y nodos terminales (`Pod`)— en un componente visual limpio (`QspResourceTree`) que sirva como referencia de integración entre el frontend (Next.js + React + Tailwind + Shadcn UI) y el clúster emulado.

### 1.2 Non-Goals (Explicit Out-of-Scope)
- **No reemplaza el motor de sincronización de Qsp CD** (escrito en Go; núcleo GitOps independiente).
- **No maneja persistencia de base de datos propia**: el dashboard es un cliente stateless de la API de Qsp CD; no almacena estados de aplicación, históricos de sincronización ni cachés locales persistentes.
- **No gestiona creación, edición o eliminación de aplicaciones**: solo visualización de estado de lectura.
- **No implementa autenticación completa**: se limita al manejo seguro del token JWT local (`QSP_CD_TOKEN`) sin exponerlo al navegador.
- **No implementa lógica dinámica por proyecto para versionado**: el tag/release automático usa archivo `VERSION` local, no detección de carpeta/branch.

---

## 2. CONTEXTO Y LENGUAJE UBICUO (Ubiquitous Language)

### 2.1 Entorno de Ejecución
- **Floci Cloud**: Clúster de Kubernetes local que emula entornos Cloud (AWS / GCP / Azure). Es el destino operativo de las aplicaciones gestionadas por Qsp CD.
- **Entorno Floci**: Contexto de ejecución del clúster emulado; cualquier fallo de conectividad debe ser tratado como condición de "offline".
- **Repo de Referencia (qspargentina)**: Código real del dashboard vive en `/home/ramiro/CURSOS/qspargentina`; este repositorio (`qspargentina_cloud`) es el repositorio de documentación, prompts y especificaciones.

### 2.2 Glosario de Dominio
| Término | Definición Exacta | Valores / Notas |
|---|---|---|
| **Aplicación (Qsp Application)** | Entidad raíz que gestiona un despliegue GitOps. Ejemplo: `dataspace-demo`. | Propiedad de referencia en árbol. |
| **Estado de Sincronización (Sync Status)** | Condición GitOps del recurso respecto al repositorio. | `Synced` \| `OutOfSync` \| `Unknown` |
| **Estado de Salud (Health Status)** | Condición operativa real del recurso dentro del clúster Floci. | `Healthy` \| `Degraded` \| `Progressing` \| `Suspended` \| `Unknown` |
| **Nodo de Recurso** | Elementos intermedios del árbol jerárquico. | `GVC` (ej. `gvc datos`), `Deployment` (ej. `web deploy`), `Service` (ej. `web service`). |
| **Repositorio Git** | Fuente de verdad de la definición de la aplicación. | Referenciado en nodo raíz (branch / revision). |
| **Token JWT (Qsp CD)** | Credencial de acceso a la API de Qsp CD. | `process.env.QSP_CD_TOKEN`; nunca expuesto al navegador; debe renovarse si expira. |

---

## 3. CONTRATOS DE DATOS (Data Contracts)

El cliente consume el endpoint oficial de Qsp CD: `/api/v1/applications`. La estructura simplificada del dominio en TypeScript —usada para construir el árbol visual `QspResourceTree`— debe ser exactamente la siguiente:

```typescript
export type HealthStatusCode = 'Healthy' | 'Degraded' | 'Progressing' | 'Suspended' | 'Unknown';
export type SyncStatusCode = 'Synced' | 'OutOfSync' | 'Unknown';

export interface ResourceNode {
  id: string;                  // Identificador único del recurso en Qsp
  name: string;                // Nombre legible (ej. "web deploy")
  kind: 'Application' | 'GVC' | 'Deployment' | 'Service' | 'Pod';
  healthStatus: HealthStatusCode;
  syncStatus: SyncStatusCode;
  age?: string;                // Tiempo relativo de creación (opcional, para UI)
  children?: ResourceNode[];   // Sub-recursos jerárquicos
}
```

### 3.1 Regla de Propagación Visual
- Si cualquier nodo hijo (incluido `Pod`) declara `healthStatus: 'Degraded'`, su **borde y tipografía** deben pintar en rojo semántico `#EF4444`.
- La alerta debe **propagarse visualmente al nodo padre** (ej. el `Deployment` o `Service` padre debe reflejar el estado degradado, aunque sea indirecto).

### 3.2 Reglas de Color Semántico (UI Contract)
| Estado / Rol | Color / Estilo | Icono Lucide (sugerido) |
|---|---|---|
| `Healthy` | Verde `#22C55E` / check-circle | `CheckCircle` |
| `Progressing` | Azul `#3B82F6` o Amarillo `#EAB308` + rotación | `RefreshCw` (animado) |
| `Degraded` | Rojo `#EF4444` / alert | `AlertTriangle` |
| `Synced` | Verde / sincronizado | `GitBranch` (o indicador visual) |
| `OutOfSync` | Amarillo / desincronizado | `AlertCircle` |

---

## 4. CASOS DE BORDE Y GESTIÓN DE ERRORES (Edge Cases & Error Handling)

### 4.1 Desconexión del Clúster Floci (Floci Offline)
- **Condición**: El clúster emulado local no responde a la petición de la API de Qsp CD.
- **Comportamiento**: El dashboard debe mostrar un **banner global de alerta** con mensaje exacto:
  > "Error de comunicación con el clúster local (Floci Offline)"
- **Restricción**: No debe bloqueando completamente la UI; debe permitir revisión de datos previos si existen, o mostrar estado de carga con mensaje claro.

### 4.2 Expiración del Token JWT (401 Unauthorized)
- **Condición**: La API de Qsp CD devuelve error `401 Unauthorized`.
- **Comportamiento**: El sistema debe **redireccionar o solicitar la renovación del token de acceso local** (`QSP_CD_TOKEN`). No debe intentar reintentar indefinidamente sin intervención.
- **Seguridad**: El token nunca debe ser expuesto al navegador; la renovación debe ocurrir en el contexto del servidor (Route Handler) o mediante flujo de autenticación controlado.

### 4.3 Nodo del Árbol con Estado Degradado / Error
- **Condición**: Un elemento intermedio del árbol (ej. `gvc datos`, `web deploy`, `web service`) o su nodo terminal (`Pod`) devuelve `healthStatus: 'Degraded'` o un error de lectura.
- **Comportamiento**:
  1. El nodo afectado debe pintar su borde y tipografía en `#EF4444`.
  2. La alerta debe **propagarse visualmente al nodo padre** (árbol reactivo).
  3. Si es un error de conexión parcial (no total), debe distinguirse del caso `Floci Offline`; preferentemente con mensaje contextual en el nodo, no solo global.

---

## 5. ESPECIFICACIONES DE INTEGRACIÓN (API Integration Contracts)

- **Archivo de ruta (Route Handler)**: `src/app/api/qsp/applications/route.ts`
- **Importación**: `QspClient` desde `@/services/qspClient`
- **Respuesta**: Usar `NextResponse.json()`
- ** Variables de entorno**: `process.env.QSP_CD_TOKEN` (solo server-side; nunca expuesta al browser)
- **Códigos de error a devolver**:
  - `500` o `502` en caso de falla de conexión con Qsp CD / Floci.
  - `401` debe ser manejado internamente o propagar para renovación de token.

---

## 6. REFERENCIA VISUAL Y ESTILO (Visual Reference)

- **Estilo base**: Admin styles y logos del proyecto `qspargentina` (referenciado en `AGENTS.md` y `README.md` de este repo).
- **Componente UI**: `QspResourceTree`; prop `QspApplication`; estructura de árbol con cards (`shadow-sm`, `rounded`); responsive.
- **Iconografía**: React Lucide icons.
- **Fuente visual de referencia**: `extructura_base/structura_base.png` (topología jerárquica del árbol de Qsp CD).

---

## 7. LO QUE NO ESTÁ EN ESTE SPEC (Reinforcement)

- El motor de sincronización de Qsp CD (Go).
- Persistencia de datos propia (base de datos, caché local persistente, session storage de estados).
- Creación, edición o eliminación de aplicaciones.
- Autenticación completa (OAuth / SSO); solo manejo de token JWT local.
- Lógica dinámica por proyecto o detección automática de carpeta para versionado.
- Reemplazo de la interfaz de administración oficial de Qsp CD.
- Automatización completa de CI/CD fuera del workflow `release.yml` ya definido (`VERSION` + tag automático).

---

*Documento generado bajo metodología SDD Spec-First. No se ha generado código de implementación. Este documento es la única fuente de verdad hasta que se apruebe para construcción en `qspargentina`.*
