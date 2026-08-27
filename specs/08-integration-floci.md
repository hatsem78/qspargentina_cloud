# SPEC 08 — Integración Frontend-Backend con Floci (Online/Offline)

> **Status:** Draft
> **Depends on:** SPEC 01 (`argocd-dashboard.md`) y SPEC 07 (`07-visual-check.md`)
> **Date:** 2026-08-27
> **Objective:** Validar que el dashboard `qsp-frontend` se integra con `qsp-backend` a través del clúster Floci, cubriendo estados online, offline, expiración JWT (`401`) y errores de conectividad (`502`).

## 1. Por qué existe este spec

Tras construir `QspResourceTree`, `route.ts` y el chequeo visual, falta verificar que todo el flujo funciona de extremo a extremo con el emulador local. Este spec fija los contratos de integración y estados degradados.

## 2. Alcance (Scope)

**In:**
- Flujo completo: `page.tsx` → `/api/qsp/applications` → `qspClient` → Qsp CD (`/api/v1/applications`) sobre Floci.
- Estados: Floci online (`200` + datos), offline (`502` + banner), JWT expirado (`401` + renovación).
- Componente `FlociOfflineBanner` y mensaje `401` en `page.tsx`.
- Servicio `qsp-verify-visual` y workflow `verify-visual.yml` como parte de CI.

**Out of scope:**
- Modificación del motor Go de Qsp CD.
- Persistencia de datos fuera de la API.
- Creación/edición de aplicaciones.

## 3. Modelo de datos / Integración

```typescript
export interface IntegrationState {
  flociStatus: 'online' | 'offline';
  apiStatus: 'synced' | 'outOfSync' | 'unknown';
  jwtValid: boolean;
  lastCheck: string;
}
```

## 4. Plan de implementación

1. Ejecutar `docker-compose up qsp-backend floci qsp-frontend` con variables `QSP_CD_TOKEN` y `QSP_CD_URL`.
2. Verificar `route.ts` retorna `200` con `NextResponse.json({ data })` cuando Floci responde.
3. Simular `offline`: detener `qsp-backend`; confirmar banner y `502`.
4. Simular `401`: usar token inválido; confirmar mensaje de renovación.
5. Marcar `[x]` en `acceptance-agent.md` para integración.

## 5. Criterios de aceptación

- [ ] `docker-compose` levanta `qsp-frontend` → `qsp-backend` sin errores.
- [ ] Estado online: `page.tsx` muestra árbol con datos reales.
- [ ] Estado offline: aparece banner `FlociOfflineBanner`; endpoint retorna `502`.
- [ ] Estado `401`: UI muestra renovación; endpoint retorna `401`.
- [ ] `test:visual` pasa dentro del contenedor.
- [ ] No se expone `QSP_CD_TOKEN` al navegador.

## 6. Decisiones tomadas y descartadas

- **Sí:** Integración vía `docker-compose` con dependencias explícitas.
- **No:** Automatizar reparación automática de JWT (requiere flujo de login completo, fuera de scope).
- **Sí:** Uso de `demoData` como fallback cuando la API falla.

## 7. Riesgos identificados

| Riesgo | Mitigación |
|--------|-----------|
| Floci no inicia | Verificar `docker-compose` con `depends_on` y volúmenes |
| Token expira en CI | Inyectar `QSP_CD_TOKEN` en secrets/variables de entorno |
| Datos de API cambian | Contrato `ResourceNode` fijo; cambios requieren nuevo spec |
