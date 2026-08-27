# Plan de Validacion de Diseno — QspResourceTree

> Nivel proyecto (`qspargentina_cloud` + `qspargentina`). No global.
> Fuente de verdad: `specs/sdd-qspcd-dashboard.md` / `specs/argocd-dashboard.md`.
> Estado: Plan confirmado; ejecucion pendiente a creacion de `QspResourceTree`.

---

## 1. Referencia visual
- `extructura_base/structura_base.png` (topologia jerarquica de Argo CD).
- Componente objetivo: `QspResourceTree`; prop `QspApplication`.

## 2. Contratos a validar (de spec secc 3 / 6 / 3.1)
- [ ] Jerarquia: `Application` → `GVC` / `Deployment` / `Service` → `Pod`.
- [ ] Colores semanticos: `Healthy`=#22C55E, `Progressing`=#3B82F6/#EAB308+rotacion, `Degraded`=#EF4444.
- [ ] Iconos Lucide (`CheckCircle`, `RefreshCw`, `AlertTriangle`).
- [ ] Cards Tailwind (`shadow-sm`, `rounded`).
- [ ] Propagacion visual `Degraded` al nodo padre (borde + tipografia rojo).
- [ ] Banner global: `"Error de comunicacion con el clustre local (Floci Offline)"`.
- [ ] Estados de error: `500`/`502` conexion; `401` token JWT.

## 3. Herramientas de verificacion
- **Context7** (`/vercel/next.js`): validar que `route.ts` use `NextResponse.json`, `import 'server-only'`, `process.env.QSP_CD_TOKEN` server-only.
- **Playwright MCP**: capturar pantalla de componente `QspResourceTree` en `qspargentina/` (pendiente creacion).
- **Modelo con vision (`Qwen3.6 Plus` o equivalente)**: comparar screenshot renderizado vs `extructura_base/structura_base.png`; validar jerarquia, colores y propagacion `Degraded`.
- **Agent checklist**: `.agents/verify/acceptance-agent.md` (checks `[x]` / `[ ]`).

## 4. Regla de compactacion
Si el contexto de verificacion excede 50%, ejecutar `/compact` para resumir sin perder esta plan fuente.

---
*Confirmado para ejecucion por spec-verifier cuando el componente y ruta existan.*
