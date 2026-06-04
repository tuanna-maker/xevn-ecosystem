# VPS-DEPLOY-SCOPE-01 — Public HTTP smoke (QA, 2026-05-22)

| Field | Value |
|-------|--------|
| **work_item_id** | `VPS-DEPLOY-SCOPE-01` |
| **from_role** | QA |
| **to_role** | PM |
| **target** | `14.225.217.232` (public VPS) |
| **runner** | Cursor QA agent shell (Windows) |
| **upstream** | `docs/ops/evidence/vps-deploy-scope-20260522-retry.md` |

## Verdict

**`NOT_DEPLOYED_YET`** — All probed HTTP endpoints **connection-timed out** (~12–15s). No HTTP status received; services not confirmed listening on public ports from this runner. Aligns with DevOps **BLOCKED-NETWORK** on SSH/deploy from agent; does **not** prove VPS is down globally (operator network may differ).

## Preconditions read

| Artifact | Status |
|----------|--------|
| `docs/ops/evidence/vps-deploy-scope-20260522-retry.md` | Read — cred `deploy/.vps-ssh.env` **PASS**; deploy **NOT RUN** from agent |
| `scripts/verify-openapi-contract.mjs` | **Skipped** — URLs hardcoded to `127.0.0.1`; no public-host override |

## HTTP smoke matrix

| Endpoint | Method | Timeout | Result | HTTP code |
|----------|--------|---------|--------|-----------|
| `http://14.225.217.232:3001/api/hrm/` | GET | 15s | **TIMEOUT** | — |
| `http://14.225.217.232:3001/api/hrm/metrics?format=prometheus` | GET | 15s | **TIMEOUT** | — |
| `http://14.225.217.232:28002/api/xbos/` | GET | 15s | **TIMEOUT** | — |
| `http://14.225.217.232:28002/api/xbos/metrics?format=prometheus` | GET | 15s | **TIMEOUT** | — |
| `http://14.225.217.232:8088/` | GET | 15s | **TIMEOUT** | — |
| `http://14.225.217.232:8088/command-center` | GET | 15s | **TIMEOUT** | — |

### Secondary probe (curl.exe, 12s)

| Endpoint | curl exit | http_code | errormsg |
|----------|-----------|-----------|----------|
| `:3001/api/hrm/` | 28 | 000 | Connection timed out after 12001 ms |
| `:28002/api/xbos/` | 28 | 000 | Connection timed out after 12005 ms |
| `:8088/` | 28 | 000 | Connection timed out after 12004 ms |

Prometheus body check (`http_requests_total`): **not executed** (no response).

## Commands executed (no secrets)

```powershell
# Invoke-WebRequest, TimeoutSec 15, six URLs (see matrix)
# curl.exe -m 12 -w http_code=... on three representative URLs
```

## OpenAPI / mobile smoke

| Check | Status | Notes |
|-------|--------|-------|
| `HRM_BE_PORT=3001 XBOS_BE_PORT=28002 node scripts/verify-openapi-contract.mjs` vs public host | **N/A** | Script targets `127.0.0.1` only |
| Mobile login smoke | **Deferred** | Requires live `:3001` HRM API |

## Operator action (required before QA re-run)

From a host with **working SSH/HTTP** to the VPS (external PowerShell per DevOps path A):

```powershell
cd "<repo-root>"
pnpm run deploy:dev-server -- -SkipCommit -SkipPush
```

**PASS criteria** (from ops evidence): deploy log smoke `:3001/` and `:8088/` HTTP 200; then re-dispatch QA for public URL matrix + optional `verify:openapi-contract` on operator machine against localhost tunnel or extend script for public base URL.

## QA gate

| Gate | Result |
|------|--------|
| Public API health | **FAIL** (timeout) |
| Public metrics | **FAIL** (timeout) |
| Portal `:8088` | **FAIL** (timeout) |
| Release / VPS scope signoff | **NOT READY** |

## Handoff

- **ack_status:** `PASS_TO_PM`
- **deployment_state:** `NOT_DEPLOYED_YET`
- **next_owner:** PM — confirm operator ran `pnpm run deploy:dev-server -- -SkipCommit -SkipPush`; then `QA` re-smoke public URLs
- **blockers:** (1) Deploy not evidenced on VPS public ports from QA runner; (2) Agent egress to VPS app ports may be blocked (same class as DevOps SSH timeout)

## References

- `docs/ops/evidence/vps-deploy-scope-20260522-retry.md`
- `docs/ops/VPS_POST_SCOPE_DEPLOY_NOTE.md`
- `docs/ops/DEPLOY_GUIDE.md`
