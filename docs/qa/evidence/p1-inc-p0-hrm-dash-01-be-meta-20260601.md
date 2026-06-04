# P1-INC-P0-HRM-DASH-01-BE-META — workspace-meta asOf fix (xbos-api)

| Field | Value |
|-------|-------|
| **work_item_id** | P1-INC-P0-HRM-DASH-01-BE-META |
| **parent** | P1-INC-P0-HRM-DASH-01 |
| **owner** | dev-be |
| **date** | 2026-06-01 |
| **qa trigger** | `docs/qa/evidence/p1-inc-p0-hrm-dash-01-qa-20260601.md` |
| **ack_status** | **READY_FOR_QA** |

## Problem

`GET /api/xbos/command-center/workspace-meta?tenantId=xevn&companyId=main` (group CEO JWT) returned **`asOf: 1970-01-01T00:00:00.000Z`** when XBOS tables had no `updated_at` for partition `holding`. SQL used `COALESCE(..., 'epoch'::timestamptz)` so `GREATEST` collapsed to epoch → UI **01/01/1970** (instant-fail per `business-flow-zero-defect-gate.mdc`).

## Root cause

`CommandCenterService.getWorkspaceMeta`:

1. Epoch fallback in SQL when subqueries returned NULL.
2. Group CEO scope maps `main` → `holding` only; freshness ignored rows under `main` partition.

## Fix

| Change | File |
|--------|------|
| Remove `'epoch'::timestamptz` COALESCE; NULL-safe `GREATEST` | `apps/api/xbos-api/src/command-center/command-center.service.ts` |
| `resolveWorkspaceAsOf()` — reject null / pre-2000 / epoch; default **now** ISO | same |
| `workspaceMetaCompanyIds()` — `main` + `holding` rollup (`ANY($2::text[])`) | same |
| Unit tests (epoch guard, rollup, DB max) | `command-center.service.spec.ts` |

Controller scope (`main`→`holding` for group CEO) unchanged — `command-center.controller.spec.ts`.

## Verification

### Jest (local)

```text
pnpm --filter xbos-api test -- command-center
→ Test Suites: 2 passed, Tests: 10 passed
```

Key cases:

- `resolveWorkspaceAsOf('1970-01-01T00:00:00.000Z')` ≠ epoch; year ≥ 2020.
- `getWorkspaceMeta('xevn','holding')` with DB row epoch → non-epoch `asOf`.
- DB max `2026-05-30T08:15:00.000Z` preserved.

### Curl (post-deploy / stack up)

```bash
# Portal JWT (ceo@xe.vn) or internal key + service JWT
curl -sS "http://127.0.0.1:28002/api/xbos/command-center/workspace-meta?tenantId=xevn&companyId=main" \
  -H "Authorization: Bearer <token>" \
  -H "x-internal-api-key: ${INTERNAL_API_KEY:-}" | jq '.data.asOf'
```

**PASS:** `asOf` is ISO-8601, **not** `1970-01-01T00:00:00.000Z`, year ≥ 2000.

**Pilot (nip.io):** QA re-run same probe as `p1-inc-p0-hrm-dash-01-qa-20260601.md` §4 after xbos-api image/deploy.

Local stack was **down** at evidence time (`ECONNREFUSED :28002`); jest + code review are BE gate; live curl is QA on pilot.

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| Pilot deploy xbos-api with this commit | devops / PM | Required for nip.io PASS |
| FE «Không tải workspace-meta» banner on first paint | dev-fe | QA noted possible token race; separate if 1970 fixed but banner persists |
| `XBOS_CC_DATA_SYNC_NOTE` env | devops | Optional copy for sync note |

## Handoff

- **next_owner:** qa
- **retest:** `/command-center/hrm/dashboard` + API `workspace-meta?companyId=main` — no **01/01/1970**; console clean per parent QA doc.
