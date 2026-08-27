# AGENTS.md — QSP_CLOUD (design/prompts repo)

- This repo is documentation + visual references only. No package.json, no build/test/lint commands; do not try `npm run` or `pytest` here.
- Actual dashboard code lives at `/home/ramiro/CURSOS/qspargentina` (referenced in README and .idea/workspace.xml). This repo only holds architecture notes and AI prompts.
- Visual reference: `extructura_base/structura_base.png` (tree-structure screenshot) — use when implementing `QspResourceTree`.

## Architecture (3-layer, from README)

- Experience: Next.js 14 App Router + React + Tailwind + Shadcn UI (frontend dashboard).
- Orchestration: Qsp CD official (Go, GitOps core); API REST/gRPC.
- Infrastructure: Floci Cloud local K8s emulation (AWS/GCP/Azure simulation).
- Flow order when setting up locally: Floci cluster → install Qsp CD in `qspcd` namespace → generate Qsp JWT → develop Next.js on localhost.

## Prompt-derived specs (verify against README if generating code)

- Route handler file path: `src/app/api/qsp/applications/route.ts`; import `QspClient` from `@/services/qspClient`; use `NextResponse.json()`; server-only env `process.env.QSP_CD_TOKEN`; never expose token to browser; return 500/502 on connection failure.
- UI component: `QspResourceTree`; prop `QspApplication`; nodes: root (app, git repo, branch/revision), children (Sync state, Health state); colors: Healthy=green/check-circle, Progressing=blue/yellow+rotate, Degraded=red/alert; use Lucide React icons; Tailwind cards (`shadow-sm`, rounded); responsive.
- Style source: `public/assets/logo.jpeg` y referencias de admin (`qspargentina/` copiado a este repo); `extructura_base/structura_base.png` local.

## Agents / SDD Mode (OpenCode)

- **Plan Mode (Spec Architect)**: Valida arquitectura, API de Qsp CD (`/api/v1/applications`), límites de Floci y datos de dominio (`ResourceNode`). No toca código; fuente única de verdad = `specs/sdd-qspcd-dashboard.md`. Si el contexto de trabajo llega al 50%, ejecutar `/compact` para resumir/agrupar sin perder la spec fuente.
- **Build Mode (Software Engineer)**: Lee la Spec como ancla estricta. Escribe servicios (`qspClient.ts`) y componentes (`QspResourceTree.tsx`) en `/home/ramiro/CURSOS/qspargentina`; nunca expone `QSP_CD_TOKEN` al navegador; retorna `500`/`502` en fallos. Usar `/compact` cuando el contexto excede 50% para mantener el control del agente verificador (`spec-verifier`) y el checklist (`.agents/verify/acceptance-agent.md`).
- **Verify Mode (spec-verifier)**: Revisa criterios de aceptación de la spec (`specs/sdd-qspcd-dashboard.md` / `specs/argocd-dashboard.md`). Usa `Context7` (`/vercel/next.js`) para validar recomendaciones Next.js (route handlers, `NextResponse.json`, env server-side); usa `Playwright MCP` + modelo con visión (`Qwen3.6 Plus`) para comparar screenshots del componente `QspResourceTree` vs `extructura_base/structura_base.png`; corrige código/spec si falla y marca checks en `.agents/verify/acceptance-agent.md`. Aplicable a backend (`qspClient.ts`, `route.ts`) y frontend (`QspResourceTree`).
- **Commands / Skills**: `/spec` (crear spec), `/spec-impl` (implementar), `/verify-spec` o `.agents/verify/acceptance-agent.md` (verificar criterios), `/compact` (resumir cuando uso > 50%).

## Verification in this repo

- Read `README.md` for exact prompt wording; do not invent file paths or env names.
- No automated tests exist here. If you need to verify code, test in `qspargentina` or against a local Floci/Qsp CD cluster.

## Reglas de código
- Usar código limpio, nombres, funciones, variables, etc. en inglés.