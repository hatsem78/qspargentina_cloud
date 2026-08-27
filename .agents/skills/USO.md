# Cómo usar Skills con Specs (SDD en OpenCode)

## Flujo obligatorio

1. **Leer la Skill** (`.agents/skills/<nombre>/SKILL.md`) para conocer el dominio, contratos y límites.
2. **Leer la Spec** (`specs/sdd-<nombre>.md`) como fuente única de verdad; validar que la skill y la spec coincidan.
3. **Plan (Spec Architect)** — usar modo Plan de OpenCode:
   - Verificar arquitectura (`AGENTS.md`), API (`/api/v1/applications`), límites de Floci.
   - Confirmar datos (`ResourceNode`, `HealthStatusCode`, `SyncStatusCode`).
   - No escribir código.
4. **Aprobar / Confirmar** con el usuario.
5. **Build (Software Engineer)** — cambiar a modo Build:
   - Leer la Spec como ancla estricta.
   - Escribir código solo en `qspargentina/` (nunca en este repo de docs).
   - No exponer `ARGO_CD_TOKEN`; usar `process.env.ARGO_CD_TOKEN` solo server-side.
   - Retornar `500`/`502` en fallos de conexión con Floci.
   - Usar `VERSION` local + `.github/workflows/release.yml` para tags.

## Ejemplo real en este repo

- Skill: `.agents/skills/argocd-dashboard/SKILL.md`
- Spec: `specs/sdd-argocd-dashboard.md`
- Código generado: `qspargentina/src/services/argoClient.ts`, `qspargentina/src/components/ArgoResourceTree.tsx`
- Verificación: consultar `AGENTS.md` y `extructura_base/structura_base.png`
