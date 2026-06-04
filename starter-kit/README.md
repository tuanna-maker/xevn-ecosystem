# Delivery Starter Kit

This folder is a reusable bootstrap package for new projects.

## Contents

- `.cursor/agents/*`: role directives for PM, Dev, QA, BA, SA, QC.
- `.cursor/hooks.json`: baseline hook wiring.
- `docs/templates/*`: release and operations templates.

## Platform NFR (copy from xevn-ecosystem for new API projects)

Also copy when bootstrapping a monorepo with `apps/api/*`:

- `packages/platform-core/`
- `.cursor/skills/platform-nfr-bootstrap/`, `.cursor/skills/devops-deploy/`
- `.cursor/agents/devops.md`, `.cursor/rules/platform-nfr-bootstrap.mdc`
- `.cursor/knowledge-base/platform-nfr-bootstrap.md`
- `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md`, `docs/ops/OBSERVABILITY_RUNBOOK.md`, `deploy/observability/`, `deploy/docker-compose.observability.yml`
- Root scripts: `build:platform-core`, `verify:production-env`, `verify:tenant-isolation`, `test:e2e:security`, `ops:synthetic-checks`

## How to Use

1. Copy `starter-kit/.cursor` to `<new-project>/.cursor`.
2. Copy `starter-kit/docs/templates` to `<new-project>/docs/templates`.
3. Follow `docs/PROJECT_BOOTSTRAP_CHECKLIST.md`.

## Notes

- Keep role order strict: `PM -> Dev -> QA -> BA -> SA -> QC`.
- Do not mark task done without evidence.
- Always write handoff packet fields into the message bus.
