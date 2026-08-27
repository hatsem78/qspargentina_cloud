# SPEC 07 — Verificación Visual con Playwright para QspResourceTree

> **Status:** Approved
> **Depends on:** SPEC 01 (`specs/argocd-dashboard.md` / `sdd-argocd-dashboard.md`)
> **Date:** 2026-08-27
> **Objective:** Crear un test de comparación visual con Playwright que valide que `QspResourceTree` coincide con la referencia `extructura_base/structura_base.png` y que los estados `Degraded` (`#EF4444`) y `Healthy` se renderizan correctamente.

## 1. Por qué existe este spec

Tras implementar `QspResourceTree` y el endpoint (`route.ts`) según `argocd-dashboard.md`, falta validación visual confiable antes de considerar el dashboard completo. Este spec fija el contrato del chequeo manual/automatizado con visión de modelo y Playwright.

## 2. Alcance (Scope)

**In:**
- Test Playwright (`tests/visual/test-tree.spec.ts`) que renderiza `QspResourceTree` con datos de ejemplo (`demoData` de `page.tsx`).
- Comparación de screenshot del componente versus baseline `tests/visual/baseline-structura.png` (copiado de `extructura_base/structura_base.png`).
- Verificación de colores semánticos: `Healthy`=verde/check, `Progressing`=amarillo+rotate, `Degraded`=rojo/`#EF4444` con propagación al padre.
- Ajustes mínimos al componente (`QspResourceTree.tsx`) si el diff supera umbral; no se cambia la arquitectura.
- Documentación del resultado en `.agents/verify/acceptance-agent.md`.

**Out of scope:**
- Reemplazo de `extructura_base/structura_base.png` como fuente de verdad (ya existe).
- Tests de rendimiento o carga; solo funcional/visual.
- Creación de nuevos componentes de UI distintos a `QspResourceTree`.

## 3. Modelo de datos / Referencias visuales

```typescript
export interface VisualBaseline {
  referencePath: string; // extructura_base/structura_base.png
  testPath: string;      // tests/visual/baseline-structura.png
  componentPath: string; // src/components/QspResourceTree.tsx
  threshold: number;     // 0.05 (5%)
}
```

## 4. Plan de implementación

1. Copiar `extructura_base/structura_base.png` → `tests/visual/baseline-structura.png`.
2. Crear `tests/visual/test-tree.spec.ts` (Playwright): monta página `src/app/page.tsx`; captura `QspResourceTree`; compara con `baseline-structura.png`.
3. Configurar `playwright.config.ts` (o `package.json` script) con umbral; usar `expect(screenshot).toMatchSnapshot()` o `toHaveScreenshot()`.
4. Ejecutar en CI / contenedor (`qsp-test-frontend`) para validar `lucide-react` + renderizado.
5. Si hay diferencias mayores a 5%: corregir `QspResourceTree.tsx`; si no: marcar `[x]` en `acceptance-agent.md`.

## 5. Criterios de aceptación

- [x] `tests/visual/test-tree.spec.ts` existe y corre sin errores.
- [x] Screenshot de `QspResourceTree` se compara con `baseline-structura.png`.
- [x] Estado `Degraded` (`healthStatus: 'Degraded'`) renderiza borde/texto `#EF4444` y propaga al padre.
- [x] Estado `Healthy` usa icono verde/check-circle.
- [x] Resultado documentado en `.agents/verify/acceptance-agent.md` con check `[x]`.
- [x] No se modifica `QSP_CD_TOKEN` ni el endpoint; solo test visual.

## 6. Decisiones tomadas y descartadas

- **Sí:** Playwright + baseline copiado; mantiene referencia visual fija.
- **No:** Automatizar detección dinámica de estilos por carpeta (desestimado en `argocd-dashboard.md` §9).
- **Sí:** Umbral de 5% para evitar falsos positivos por renderizado de fuente.

## 7. Riesgos identificados

| Riesgo | Mitigación |
|--------|-----------|
| Diferencias por fuente o renderizado de navegador | Baseline generado en mismo entorno (node 20 + Playwright) |
| `lucide-react` no renderiza iconos | Chequeo funcional `test-lucide.sh` antes de test visual |
| Componente cambia sin actualizar baseline | Regla: actualizar `baseline-structura.png` solo tras aprobación de `acceptance-agent.md` |
