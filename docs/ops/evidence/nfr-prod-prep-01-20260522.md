# NFR-PROD-PREP-01 — DevOps evidence (2026-05-22)

| Gate | Result | Notes |
|------|--------|-------|
| `pnpm verify:production-env` (dry-run) | **FAIL** (expected) | Exit 1 — dev secrets in `deploy/xevn-ecosystem/.env` |
| `node scripts/verify-openapi-contract.mjs` | **PASS** | Exit 0 — local `28001` / `28002` |
| VPS SSH audit | **SKIPPED** | `deploy/.vps-ssh.env` missing |
| VPS operator note | **WRITTEN** | `docs/ops/VPS_POST_SCOPE_DEPLOY_NOTE.md` |

## verify:production-env (dry-run)

```
[hrm-api] ok=false
  ERROR: hrm-api: SERVICE_JWT_SECRET required
  ERROR: hrm-api: INTERNAL_API_KEY is dev default
  ERROR: hrm-api: CORS_ALLOWED_ORIGINS required
[xbos-api] ok=false
  ERROR: xbos-api: SERVICE_JWT_SECRET required
  ERROR: xbos-api: INTERNAL_API_KEY is dev default
  ERROR: xbos-api: CORS_ALLOWED_ORIGINS required
```

Aligns with runbook Phase A expectation before VPS production secrets.

## verify-openapi-contract

```
PASS hrm-health
PASS hrm-metrics-prom
PASS xbos-health
PASS xbos-metrics-prom
```

## Next owner (PM)

- Enable `deploy/.vps-ssh.env` **or** have operator run VPS note §2–4.
- Phase B–C production enable per `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md` after VPS APIs smoke 200 on **3001** / **28002**.
