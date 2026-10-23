@AGENTS.md

## Proyecto

Portafolio de Kener Avila (Next.js 16 + Tailwind v4 + Velite, deploy en Vercel). El plan aprobado está en `docs/PLAN.md` y lo diferido en `TODOS.md`.

- `npm run dev`: Velite en modo watch + `next dev`.
- `npm run build`: `velite build --strict --clean && next build`. Un error de esquema en `content/` hace fallar el build.
- `npm run content`: solo valida y genera el contenido en `.velite/` (importable como `#site/content`).

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. Route only to skills in the session's available-skills list; answer directly for quick questions or small scoped edits.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
