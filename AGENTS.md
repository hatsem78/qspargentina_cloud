# AGENTS.md — ARGO_CLOUD (design/prompts repo)

- This repo is documentation + visual references only. No package.json, no build/test/lint commands; do not try `npm run` or `pytest` here.
- Actual dashboard code lives at `/home/ramiro/CURSOS/qspargentina` (referenced in README and .idea/workspace.xml). This repo only holds architecture notes and AI prompts.
- Visual reference: `extructura_base/structura_base.png` (tree-structure screenshot) — use when implementing `ArgoResourceTree`.

## Architecture (3-layer, from README)

- Experience: Next.js 14 App Router + React + Tailwind + Shadcn UI (frontend dashboard).
- Orchestration: Argo CD official (Go, GitOps core); API REST/gRPC.
- Infrastructure: Floci Cloud local K8s emulation (AWS/GCP/Azure simulation).
- Flow order when setting up locally: Floci cluster → install Argo CD in `argocd` namespace → generate Argo JWT → develop Next.js on localhost.

## Prompt-derived specs (verify against README if generating code)

- Route handler file path: `src/app/api/argo/applications/route.ts`; import `ArgoClient` from `@/services/argoClient`; use `NextResponse.json()`; server-only env `process.env.ARGO_CD_TOKEN`; never expose token to browser; return 500/502 on connection failure.
- UI component: `ArgoResourceTree`; prop `ArgoApplication`; nodes: root (app, git repo, branch/revision), children (Sync state, Health state); colors: Healthy=green/check-circle, Progressing=blue/yellow+rotate, Degraded=red/alert; use Lucide React icons; Tailwind cards (`shadow-sm`, rounded); responsive.
- Style source: `/home/ramiro/CURSOS/qspargentina` (admin styles/logos).

## Agents / SDD Mode (OpenCode)

- **Plan Mode (Spec Architect)**: Valida arquitectura, API de Argo CD (`/api/v1/applications`), límites de Floci y datos de dominio (`ResourceNode`). No toca código; fuente única de verdad = `specs/sdd-argocd-dashboard.md`.
- **Build Mode (Software Engineer)**: Lee la Spec como ancla estricta. Escribe servicios (`argoClient.ts`) y componentes (`ArgoResourceTree.tsx`) en `/home/ramiro/CURSOS/qspargentina`; nunca expone `ARGO_CD_TOKEN` al navegador; retorna `500`/`502` en fallos.

## Verification in this repo

- Read `README.md` for exact prompt wording; do not invent file paths or env names.
- No automated tests exist here. If you need to verify code, test in `qspargentina` or against a local Floci/Argo CD cluster.
