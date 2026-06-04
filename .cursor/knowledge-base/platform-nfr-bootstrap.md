# Platform NFR Bootstrap — Reusable Knowledge (xevn-ecosystem)

> **Mục đích:** Mọi dự án API monorepo trên Cursor phải **dựng sẵn** observability + security baseline; user không cần hỏi lại.
>
> **Sao chép sang dự án mới:** Copy `packages/platform-core`, `deploy/observability/*`, `docs/ops/*` NFR, `.cursor/rules/platform-nfr-bootstrap.mdc`, `.cursor/skills/platform-nfr-bootstrap`, agent snippets.

## Context

XeVN đã implement NFR P0–P2: `@xevn/platform-core`, Prometheus `/metrics?format=prometheus`, Pino JSON + `requestId`, production env guard, Redis rate limit, OTel optional, audit `platform_audit_events`, migrations `company_slug_map`, scripts verify.

## Action (bootstrap checklist cho SA / Tech Lead / Dev-BE khi **khởi tạo** repo hoặc module API mới)

1. Add workspace package `packages/platform-core` (logger, metrics, cors, rate-limit, tracing, pool env).
2. Wire `main.ts`: `startPlatformTracing` → `assertProductionEnvOrExit` → CORS → platform middleware → rate limit.
3. Exception filter: `logHttpException` + `x-api-code` header.
4. DB service: `readPgPoolEnv` + `recordDbQueryMetrics`.
5. Deliverables: `docs/ecosystem/NFR_OBSERVABILITY_SECURITY_BASELINE.md`, ops runbooks, `deploy/docker-compose.observability.yml`.
6. Scripts in root `package.json`: `build:platform-core`, `verify:production-env`, `verify:tenant-isolation`, `test:e2e:security`, `ops:synthetic-checks`.
7. Dispatch **devops** sub-agent for VPS production — `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md`.

## Outcome

- Pilot → production: one runbook, autonomous DevOps lane.
- PM gates release on `verify:production-env` + smoke evidence.
- SA signs off RLS only via `PLATFORM_RLS_ENABLED` + migration `0010_tenant_rls_policies.sql`.

## Evidence (this repo)

| Artifact | Path |
|----------|------|
| Platform lib | `packages/platform-core/` |
| Baseline doc | `docs/ecosystem/NFR_OBSERVABILITY_SECURITY_BASELINE.md` |
| Production runbook | `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md` |
| DevOps agent | `.cursor/agents/devops.md` |
| Plan reference | `.cursor/plans/nfr_observability_security_p0-p2_*.plan.md` (do not edit) |

## Reuse-tag

`platform-nfr-p0-p2`, `production-enable`, `devops-autonomous-ops`

## Lessons (append after each program cycle)

- **2026-05:** Production guard intentionally fails `verify-production-env` until VPS `.env` has non-dev secrets — not a code defect.
- **2026-05:** XBOS binds `XBOS_BE_PORT`; compose must map same port host:container.
- **2026-05:** Portal proxy `VITE_DEV_PROXY_XBOS_API` must match container listen port.
- **2026-05:** On VPS bind-mounted FE apps, partial SCP sync can leave Vite with unresolved imports after restart; always tail `xevn-hrm-fe-dev` logs and sync all newly imported files before final smoke.
- **2026-05:** If `deploy:dev-server` fails from quoting/transport glitches, follow direct SSH fallback (`git pull` + canonical env merge + targeted `docker compose up -d --build`) to keep production-enable path deterministic and unblock QA.
- **2026-05:** For auth-boundary readiness, smoke must include both positive auth-header flow (`Authorization` + `x-access-token` + `x-portal-access-token`) and negative no-header probe (`401`) on the same HTTPS endpoint.
- **2026-05:** For bind-mounted FE apps on VPS, partial `pscp` can pass route HTTP smoke but still fail Vite transform (`/hr/src/App.tsx` 500). Always tail `xevn-hrm-fe-dev` logs, resolve missing import chain, and sync full `apps/web/hrm/src/*` before final `READY_FOR_QA`.
- **2026-06 / P1-P100-W13-DO-PROD-R2:** Context: needed XBOS Prometheus readiness for production gate (`/api/xbos/metrics?format=prometheus` must start with `# HELP`). Action: targeted compose rebuild using service key `xbos-be`, then validated both direct port `28002` and HTTPS nip.io perimeter. Outcome: `HTTP 200` and Prometheus text header confirmed; production env gate returned `[hrm-api] ok=true` and `[xbos-api] ok=true`. Evidence: `docs/ops/evidence/p1-p100-w13-do-prod-r2-20260601.md`. Reuse-tag: p1-p100-w13-do-prod-r2, xbos-prometheus-text, production-enable
