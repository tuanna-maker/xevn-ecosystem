# verify:production-env — findings (P1-EX-DO-01)

**Date:** 2026-05-26  
**Work item:** P1-EX-DO-01 · Condition **C-EXQC2-07**  
**Runbook:** `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md` Phase A → C → H

---

## Summary

| Environment | Command | Exit | Verdict |
|-------------|---------|------|---------|
| **Workstation** (repo root, `deploy/xevn-ecosystem/.env`) | `pnpm run verify:production-env` | **1** | **FAIL (expected)** — dev `INTERNAL_API_KEY`, missing `SERVICE_JWT_SECRET` / `CORS_ALLOWED_ORIGINS` |
| **VPS prod-like** (`14.225.217.232`, `/opt/xevn-ecosystem`) | `node scripts/verify-production-env.mjs` | **0** | **PASS** — after Phase C secret rotation + script sync |

**T6 (Excellence Program)** remains **NOT MET** for sponsor “Production DONE” until QC prod **GO**, TLS, and `SERVICE_READINESS` PROD column lift — this packet closes **env gate evidence** only.

---

## Workstation findings (dry-run / default `.env`)

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

**Root cause:** Local `.env` optimized for UAT/dev stack (`qc:dev-stack`), not production guard (`NODE_ENV=production` simulation in script).

**Operator action (no secret in git):** Mirror VPS keys locally only on secure machines, or keep workstation dry-run **FAIL** until cutover.

---

## VPS prod-like findings (PASS)

### Phase C applied (2026-05-26)

| Key | Before | After (audit only) |
|-----|--------|-------------------|
| `NODE_ENV` | missing | `production` |
| `SERVICE_JWT_SECRET` | missing | strong (64 hex) |
| `INTERNAL_API_KEY` | dev default | strong (48 hex) |
| `CORS_ALLOWED_ORIGINS` | missing | whitelist: VPS portal `:8088`, HRM FE `:8080`, loopback `:8088` |
| `LOG_LEVEL` | — | `info` |

Backup: `deploy/xevn-ecosystem/.env.bak.<timestamp>` on VPS.

**Side effect:** Existing JWT sessions on VPS invalidated until users re-login (expected after secret rotation).

### Verify output (PASS)

```
[hrm-api] ok=true
[xbos-api] ok=true
verify_exit=0
```

### Deploy / smoke

- `git reset --hard origin/main` on VPS (commit `5106a0c` at audit time).
- `verify-production-env.mjs` synced to VPS via SCP (not yet on remote `main` at pull — track merge to `main` for repeatability).
- `docker compose up -d --build --remove-orphans hrm-be xbos-be` — containers `xevn-hrm-be-dev`, `xevn-xbos-be-dev` **Started**.
- Portal `http://127.0.0.1:8088/` → **200**.

---

## Strict gate (repo root)

```bash
pnpm phase1:gate --strict
# exit 0 — matrix e2e_pass 243 + waived 2; verify:capabilities fail=0
```

Report: `docs/qa/PHASE1_GATE_REPORT.md` (regenerated 2026-05-25).

---

## Residual / blockers (PM → QC)

| ID | Item | Owner |
|----|------|-------|
| DO-R1 | Merge `scripts/verify-production-env.mjs` to `origin/main` so VPS `git pull` suffices | Dev-BE / PM |
| DO-R2 | TLS + nginx Phase G not executed | DevOps |
| DO-R3 | `test:e2e:security` + observability profile `obs` not in this wave | QA / DevOps |
| DO-R4 | PROD-READY column still 🔴 in `SERVICE_READINESS` | QC prod gate |

---

## Evidence index

| Path | Purpose |
|------|---------|
| This file | verify:production-env findings |
| `docs/qa/evidence/p1-ex-do-01-20260526.md` | Handoff PASS_TO_PM |
| `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md` | SoT procedure |

*No secrets logged. No commit per dispatch.*
