# P1-HRM-EMP-DUP-KEY-DEPLOY — VPS hrm-be recreate (2026-07-16)

| Field | Value |
|-------|-------|
| work_item_id | `P1-HRM-EMP-DUP-KEY-DEPLOY` |
| from_role | pm |
| to_role | devops |
| host | `14.225.217.232` (:8088 portal / :3001 hrm-api) |
| commit | `e4087ea` — `fix(hrm-api): stable employees pagination ORDER BY created_at DESC, id DESC` |
| seed | **none** (U65) |

## Why

QA FAIL on Employees embed: React duplicate keys (107 colliding UUIDs). Root cause = OFFSET pagination with unstable `ORDER BY created_at DESC` when many rows share the same timestamp. Live stack was still on old hrm-api until recreate.

## Steps executed

1. Local regression: `pnpm --dir apps/api/hrm-api exec jest src/employees/p1-hrm-emp-dup-key-be.spec.ts` → **3/3 PASS**
2. Surgical commit + push `e4087ea` to `origin/main` (employees.service + summary support files required to compile; controller/FE left out of this slice)
3. VPS audit (pre):
   - `xevn-hrm-be-dev` Up 3 weeks (healthy) `:3001`
   - portal `:8088` Up
   - git HEAD was `68ec457` (pre-fix)
4. Deploy path (minimal):
   - SCP hotfixed files under `/opt/xevn-ecosystem/apps/api/hrm-api/src/employees/`
   - Recreate **only** `hrm-be`:

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose --env-file .env up -d --force-recreate --no-deps hrm-be
```

5. Sync VPS git to `e4087ea` via `git fetch` + `git pull origin main` so bind-mount matches remote (prevents future pull overwrite of SCP hotfix)
6. No `docker compose down`; non-xevn containers left untouched

## Health / smoke proof

| Check | Result |
|-------|--------|
| `GET http://127.0.0.1:3001/api/hrm/` | **200** |
| `GET http://127.0.0.1:3001/api/hrm/metrics` | **200** |
| `GET http://127.0.0.1:8088/` | **200** |
| `docker inspect` health `xevn-hrm-be-dev` | **healthy** |
| Disk proof | `employees.service.ts:478 ORDER BY created_at DESC, id DESC` |
| `GET /api/hrm/employees?page={1,2,3}&page_size=100&company_id=main` (internal key, no seed) | **200 / 200 / 200** |
| Concatenate 3 pages | `total=1107`, `concat_ids=300`, **`unique=300`, `dups=0`** |

Unauthenticated employees call returns **400** `HRM-VAL-001` (`company_id must be a string`) — expected validation, not 500.

## Out of scope / residual

- **HRM FE / portal FE** not recreated this wave (BE-only). FE client-side dedupe lands separately; browser console audit still needs FE READY + QA retest.
- Summary controller route (`GET /employees/summary`) not required for this deploy slice; list sort fix is live.
- U65: no seed scripts run.

## Gate table

| Gate | Verdict |
|------|---------|
| hrm-be recreate | **PASS** |
| Health :3001 / :8088 | **PASS** |
| Stable pagination smoke (0 dups across pages) | **PASS** |
| FE embed console audit | **DEFER → QA** after FE READY |

## Handoff

- `ack_status`: **READY_FOR_QA** (BE deploy live; full console audit waits FE if still pending)
- `next_owner`: **qa**
- `next_dispatch_prompt`: see completion packet below
