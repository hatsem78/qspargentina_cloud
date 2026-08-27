# SPEC 09 — Aceptación Funcional Completa (Dashboard + API + Visual)

> **Status:** Draft
> **Depends on:** SPEC 01 (`argocd-dashboard.md`), SPEC 07 (`07-visual-check.md`), SPEC 08 (`08-integration-floci.md`)
> **Date:** 2026-08-27
> **Objective:** Confirmar que el sistema completo (Next.js dashboard + Qsp CD API + Floci + Playwright visual) cumple todos los criterios de aceptación y está listo para tag/release.

## 1. Por qué existe este spec

Con los componentes individuales verificados (`QspResourceTree`, `route.ts`, visual, integración), falta un paso final que unifique criterios, valide el tag automático (`VERSION` + workflow) y cierre el ciclo de verificación (`acceptance-agent.md`).

## 2. Alcance (Scope)

**In:**
- Revisión completa de `acceptance-agent.md` con todos los checks `[x]`.
- Ejecución de `npm run test:visual` exitoso dentro del contenedor.
- Creación de tag `v0.1.0` tras merge a `main` (workflow `.github/workflows/release.yml`).
- Confirmación de que `QSP_CD_TOKEN` nunca llega al navegador (`server-only`, env server).

**Out of scope:**
- Documentación de usuario final.
- Pruebas de carga o estrés.
- Automatización de creación de aplicaciones.

## 3. Modelo de datos / Checklist

```typescript
export interface AcceptanceResult {
  specStatus: 'Draft' | 'Approved';
  treeVerified: boolean;
  endpointVerified: boolean;
  visualVerified: boolean;
  tokenHidden: boolean;
  releaseTagCreated: boolean;
}
```

## 4. Plan de implementación

1. Revisar `.agents/verify/acceptance-agent.md`; marcar todos los criterios.
2. Ejecutar `docker-compose run --rm qsp-verify-visual`; confirmar `TEST VISUAL PASSED`.
3. Merge a `main`; verificar que `.github/workflows/release.yml` crea tag `v0.1.0`.
4. Actualizar `specs/09-functional-acceptance.md` a `Approved`.

## 5. Criterios de aceptación

- [ ] Todos los criterios de `argocd-dashboard.md` marcados `[x]`.
- [ ] `test:visual` pasa sin errores.
- [ ] `VERSION` es `0.1.0`; workflow de release funciona.
- [ ] `QSP_CD_TOKEN` no expuesta.
- [ ] No quedan `TODO` ni `FIXME` en código de implementación.

## 6. Decisiones tomadas y descartadas

- **Sí:** Espec `09` como cierre de ciclo; no se reemplaza `08`.
- **No:** Automatizar creación de aplicaciones (fuera de scope desde `argocd-dashboard.md` §9).
- **Sí:** Uso de `spec-impl` + `spec-verify` como flujo estándar.

## 7. Riesgos identificados

| Riesgo | Mitigación |
|--------|-----------|
| Workflow no crea tag | Verificar `VERSION` actualizado antes de merge |
| Visual falla tras cambio | Regenerar `baseline-structura.png` solo con aprobación |
