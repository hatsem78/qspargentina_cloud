# Ejemplo paso a paso: Spec → Skill → Código → Verificación

> Caso real: `specs/sdd-argocd-dashboard.md` en este repo.

1. Spec (`specs/sdd-argocd-dashboard.md`): Intención + Data model (`ResourceNode`) + Casos (`#EF4444`, `401`, Floci offline).
2. Branch: `feature/spec-argocd-dashboard`.
3. Plan: validar API `/api/v1/applications`, límites Floci, no escribir código.
4. Confirmar → Build.
5. Skill (`.agents/skills/argocd-dashboard/SKILL.md`) referencia la spec.
6. Código: `qspargentina/src/services/argoClient.ts` + `qspargentina/src/components/ArgoResourceTree.tsx`.
7. Verificar (agente): `.agents/verify/acceptance-agent.md` con Context7 (`/vercel/next.js`), Playwright, visión vs `extructura_base/structura_base.png`.
8. Refinar: si falta check, volver al paso 1 de la spec y corregir; nunca inventar fuera del documento.
