# SKILL: Platform NFR Bootstrap (P0/P1/P2)

Use when starting a **new API-backed project** or when user asks for enterprise logging, metrics, tracing, production hardening.

## Trigger

- New monorepo with `apps/api/*`
- User mentions: production, Prometheus, OpenTelemetry, tenant isolation, rate limit Redis, observability stack
- PM/SA/TM requests "enterprise NFR baseline"

## Do first (read-only scan)

1. `packages/platform-core` exists? If not — scaffold per xevn-ecosystem pattern.
2. APIs import `@xevn/platform-core` in `main.ts`?
3. `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md` exists?
4. Root scripts: `build:platform-core`, `verify:production-env`, `test:e2e:security`

## Implementation order (same as plan, do not skip P0)

| Step | Deliverable |
|------|-------------|
| P0.1 | `platform-core` + Pino middleware + exception logging |
| P0.2 | `validateProductionEnv`, CORS whitelist, DEPLOY_GUIDE TLS |
| P0.3 | prom-client, `/metrics?format=prometheus`, `prometheus.yml` |
| P0.4 | `docker-compose.observability.yml`, OBSERVABILITY_RUNBOOK, Grafana JSON |
| P0.5 | tenant e2e + `verify-tenant-isolation.mjs` |
| P0.6 | `audit-company-id-types.mjs` + migration map table |
| P0.7 | `verify-production-env.mjs` + NFR baseline doc |
| P1+ | OTel, OpenAPI contract, SLO alerts, Redis rate limit, audit events, synthetic checks, pool env |
| P2+ | nginx replicas, DR, WAF doc, RLS template, k6, BullMQ + idempotency |

## Roles

| Role | Responsibility |
|------|----------------|
| **SA** | NFR in TechSpec §10–13; RLS sign-off; boundary `@xevn/platform-core` |
| **Tech Lead (TM)** | Enforce bootstrap on new services; block release without ops evidence |
| **PM** | Dispatch `devops` for production enable; gate on `verify:production-env` |
| **Dev-BE** | Wire APIs, migrations, audit emit |
| **DevOps** | `PRODUCTION_ENABLE_RUNBOOK.md` phases A–H autonomous |

## DevOps dispatch (copy to Task tool)

```
Subagent: devops (or generalPurpose with devops skill)
Task: Execute docs/ops/PRODUCTION_ENABLE_RUNBOOK.md phases A–H.
Constraints: shared VPS rules in devops-deploy SKILL.
Return: gate table PASS/FAIL + evidence paths + ack_status for QC.
```

## Knowledge update (mandatory after completion)

Append to:

- Repo: `.cursor/knowledge-base/platform-nfr-bootstrap.md` (Lessons section)
- Global: `C:\Users\ADMIN\.cursor\knowledge-base\{sa,pm,technical-manager,dev-be,devops}.md`

Use fields: Context, Action, Outcome, Evidence, Reuse-tag (`knowledge-quality.mdc`).

## Do not

- Edit `.cursor/plans/nfr_observability_security_*.plan.md`
- Commit production secrets
- Enable RLS without SA sign-off
