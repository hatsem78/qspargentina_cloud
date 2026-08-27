## Herramienta de Desarrollo: Seguimiento y Control de Despliegues

Es totalmente viable integrar estas tecnologías. Cada componente cumplirá un rol específico
para garantizar una arquitectura eficiente.

```
    💡 Nota clave: Reescribir Argo CD desde cero con React o Next.js no es viable. 
    Su núcleo de sincronización (Git a Kubernetes) requiere el rendimiento y concurrencia de Go (Golang). 
    El enfoque correcto es construir un Panel Personalizado (Custom Dashboard) en React/Next.js que consuma la API oficial de Argo CD.
```
Esta estrategia de construcción para QSPARGENTINA utiliza el emulador cloud Floci y metodologías de Diseño Guiado por Dominio (DDD) asistidas por IA.

---

### 🏗️ 1. Arquitectura del Sistema Local

El entorno local se divide en tres capas bien definidas:
```
[ Capa de Experiencia ]     -->   Next.js + React (Interfaz creada con IA)
          │
          ▼ (API REST / gRPC)
[ Capa de Orquestación ]    -->   Argo CD Oficial (Gestiona el GitOps real)
          │
          ▼ (Manifiestos K8s)
[ Capa de Infraestructura ] -->   Floci Cloud / K8s (Simulador local de AWS/GCP)
```
---

### 🤖 2. Estrategia de Desarrollo Asistido por IA

#### Paso 1: Definición del Dominio (DDD)

Pide a la IA que defina el modelo de dominio antes de escribir código.

```
    "Actúa como arquitecto de software experto en DDD. Necesito definir el modelo de dominio para un dashboard en Next.js que controle Argo CD.
     Mis entidades principales son: Aplicación, Entorno (simulado en Floci), Estado de Sincronización y Repositorio Git."
```

### Paso 2: Generación del Cliente de API

Argo CD expone una API REST y gRPC completa. Usa la IA para generar el cliente de consumo.

- **Prompt sugerido:**
```
    "Genera un servicio en TypeScript para Next.js 14 (App Router) que consuma la API de Argo CD. 
  Necesito la lógica para autenticarse, listar todas las aplicaciones y obtener su estado de salud (Healthy, Degraded)."
```

### Paso 3: Componentes de Interfaz de Usuario

Diseña vistas limpias y modernas que superen la interfaz nativa.

- **Prompt sugerido:**
```
"Crea un componente de React con Tailwind CSS y Shadcn UI que replique la vista de árbol de componentes de Argo CD. 
Debe ser interactivo, responsivo y mostrar alertas visuales si un recurso falla."
```

---

### 🚀 3. Flujo de Trabajo Local Recomendado

- **Levantar el Entorno:** Inicia el emulador Floci y verifica el acceso al clúster local mediante kubectl.
- **Instalar Argo CD:** Despliega los manifiestos oficiales de Argo CD en un namespace dedicado del clúster.
- **Habilitar la API:** Genera un token de autenticación (JWT) en Argo CD para asegurar las consultas desde Next.js.
- **Desarrollar el Dashboard:** Levanta el proyecto Next.js en localhost:3000 consumiendo los datos reales de Argo CD.

--- 

### 📝 Prompt 1: Generación de Endpoints Seguros (Route Handlers en Next.js)

```
Actúa como un Desarrollador Backend Senior experto en Next.js (App Router) y TypeScript. 
Necesito crear los Route Handlers (endpoints internos de la API de Next.js) para mi frontend, actuando como un proxy seguro hacia la API oficial de Argo CD que corre localmente sobre el emulador Floci.

Requisitos técnicos del código:
1. Crea el archivo `src/app/api/argo/applications/route.ts`.
2. Debe importar e instanciar la clase `ArgoClient` (asume que está en `@/services/argoClient`).
3. El endpoint debe ser un método GET que llame a `argoClient.getApplications()`.
4. Implementa manejo de errores estricto: si falla la conexión con Argo CD, debe retornar un JSON con el mensaje de error y un código de estado HTTP adecuado (ej. 500 o 502 Bad Gateway).
5. Asegura que el token de autenticación de Argo CD se maneje de forma segura en el servidor leyendo las variables de entorno (`process.env.ARGO_CD_TOKEN`), protegiendo que el cliente/navegador nunca vea este secreto.
6. Devuelve la respuesta utilizando `NextResponse.json()`.

Entrega únicamente el código TypeScript limpio, modular, bien tipado y listo para producción, con comentarios breves donde sea necesario.
```

---

### 🎨 Prompt 2: Creación de la Interfaz Visual (Vista de Árbol con Tailwind y Shadcn UI)

```
Actúa como un Diseñador de UI y Desarrollador Frontend Senior experto en React, Tailwind CSS y componentes de Shadcn UI. 
Necesito que construyas un componente visual interactivo para mi dashboard en Next.js 14/15 que represente el estado de despliegue de las aplicaciones en Argo CD (conectado al clúster local de Floci).

El componente debe emular o mejorar la clásica "vista de árbol de recursos" de Argo CD basada en la captura original.

Requisitos del diseño y funcionalidad:
1. El componente principal debe llamarse `ArgoResourceTree` y recibir como prop los datos de una aplicación (usa el tipado `ArgoApplication`).
2. Debe mostrar de forma jerárquica y limpia los nodos principales: 
   - Nodo Raíz: La Aplicación (nombre, repositorio git, rama/revisión).
   - Nodos Hijos: El estado de Sincronización (Synced / OutOfSync) y el estado de Salud (Healthy, Progressing, Degraded, Missing).
3. Usa Tailwind CSS para crear conectores visuales (líneas finas discontinuas o continuas) que unan los nodos, simulando la estructura de árbol o red de Kubernetes.
4. Implementa un sistema de colores e íconos dinámicos claros (puedes usar Lucide React):
   - Healthy = Verde (check-circle)
   - Progressing = Azul/Amarillo con animación de rotación (refresh-cw)
   - Degraded = Rojo (x-circle / alert-triangle)
5. Estiliza los contenedores de cada nodo simulando tarjetas minimalistas usando clases tipo tarjeta de Shadcn UI (bordes redondeados finos, fondos sutiles, sombras leves `shadow-sm`).
6. El componente debe ser completamente responsivo y adaptarse a pantallas de dashboard.

Entrega el código TypeScript completo del componente React utilizando la sintaxis moderna de componentes funcionales ("use client" si requiere interactividad) y Tailwind CSS.
```

--- 

## Propuesta Técnica: Panel de Control GitOps para QSPARGENTINA

### 🎯 Objetivo

Desarrollar una interfaz de usuario personalizada (Custom Dashboard) utilizando Next.js, React e Inteligencia Artificial,
basada en la metodología de Diseño Guiado por el Dominio (DDD). Esta solución actuará como la capa de experiencia del usuario, 
consumiendo la API oficial de Argo CD y visualizando la infraestructura local emulada por Floci Cloud.

---

### 🏗️ 1. Arquitectura de Tres Capas (Local)

Para garantizar un sistema escalable y eficiente, el entorno local se divide en tres niveles desacoplados:

```
┌────────────────────────────────────────────────────────┐
│ 1. CAPA DE EXPERIENCIA (Frontend)                      │
│    Next.js + React + Tailwind CSS (Diseñado con IA)    │
└───────────────────────────┬────────────────────────────┘
                            │ (API REST / gRPC)
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. CAPA DE ORQUESTACIÓN (Core)                         │
│    Argo CD Oficial (Motor GitOps en Go)                │
└───────────────────────────┬────────────────────────────┘
                            │ (Manifiestos K8s)
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. CAPA DE INFRAESTRUCTURA (Emulación)                 │
│    Floci Cloud (Entorno K8s local: AWS, GCP, Azure)    │
└────────────────────────────────────────────────────────┘
```

### Descripción de Componentes

- **Capa de Experiencia:** Interfaz a medida basada en la estructura visual de referencia. Permite visualizar sincronizaciones,
consultar logs y lanzar despliegues con una experiencia de usuario (UX) simplificada.

- **Capa de Orquestación:** Instancia estándar de Argo CD. Se encarga del procesamiento pesado: conectar con Git, 
analizar manifiestos y reconciliar el estado en el clúster.

- **Capa de Infraestructura:** Motor de Kubernetes local provisto por Floci, encargado de simular el comportamiento 
de nubes públicas de forma eficiente y sin costos de nube real.


---

### 🚀 3. Flujo de Trabajo para el Despliegue Local

```
┌──────────────┐      ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│ 1. Levantar  │ ───> │ 2. Instalar    │ ───> │ 3. Habilitar   │ ───> │ 4. Desarrollar │
│    Floci     │      │    Argo CD     │      │    API JWT     │      │    Dashboard   │
└──────────────┘      └────────────────┘      └────────────────┘      └────────────────┘
```

- **Inicializar Entorno:** Levantar el emulador Floci y verificar la conectividad del clúster local mediante kubectl.

- **Desplegar Orquestador:** Instalar Argo CD oficial en un namespace dedicado (argocd) dentro del clúster local.

- **Configurar Seguridad:** Generar un token de acceso seguro (JWT) en Argo CD para autorizar las peticiones del frontend.

- **Ejecutar Frontend:** Iniciar el proyecto Next.js en entorno de desarrollo (localhost:XXXX) 
para visualizar el estado de la infraestructura simulada en tiempo real. El frontend se base en el admin
de QSPARGENTINA que se encuentra en el path /home/ramiro/CURSOS/qspargentina, manteniendo estilos y logos.