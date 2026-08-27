# Guía MVP: Backend + Frontend (Referencia: inventario-qsp)

Referencia de estructura: `/home/ramiro/CURSOS/proyecto/nuevas_ideas/inventario-qsp` (`specs/`, `src/`, `tests/`, `docs/`, `AGENTS.md`, `config/`, `deploy/`).

## Mejor camino: Backend primero

1. Spec (`specs/sdd-argocd-dashboard.md`) — fuente única.
2. Branch `feature/spec-argocd-dashboard`.
3. Plan — validar API Argo CD / límites Floci.
4. Confirmar → Build:
   a. Backend: `qspargentina/src/services/argoClient.ts` + `src/app/api/argo/applications/route.ts`
   b. Frontend: `qspargentina/src/components/ArgoResourceTree.tsx`
5. Verificación (`.agents/verify/acceptance-agent.md`): Context7 (`/vercel/next.js`) + Playwright + visión vs `extructura_base/`
6. Refinar: si falta check, volver al paso 1; nunca inventar fuera de spec.

## Propuestas de mejora (basado en inventario-qsp)

- Agregar `tests/` al proyecto `qspargentina` (como `tests/test_argo_client.py` / `.tsx`).
- Crear `docs/` para referencias visuales y contratos.
- Usar `config/` para variables de entorno local.
- Documentar `deploy/` si se requiere clúster local.
- Mantener `AGENTS.md` actualizado con modos Plan/Build.
