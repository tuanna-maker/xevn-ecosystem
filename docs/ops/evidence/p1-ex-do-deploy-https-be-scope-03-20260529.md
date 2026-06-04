# P1-EX-DO-DEPLOY-HTTPS-BE-SCOPE-03 — hrm-api scope-context main→xevn alias

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-DEPLOY-HTTPS-BE-SCOPE-03` |
| from_role | `devops` |
| to_role | `qa` |
| date | `2026-05-29` |
| pilot_url | `https://14-225-217-232.nip.io` |
| entry_be | `docs/ops/evidence/p1-ex-be-https-j-hrm-06-scope-parity-03-20260529.md` |
| commit | `none` (pscp sync, no git commit) |

---

## Build / deploy timestamps

| Marker | Timestamp (UTC) | Notes |
|---|---|---|
| Source sync (`scope-context.ts` + `hrm-list-scope.ts`) | `2026-05-29T02:37:24Z` (approx) | `pscp` to `/opt/xevn-ecosystem` |
| `xevn-hrm-be-dev` container recreated | `2026-05-29T02:37:41.538324595Z` | `docker inspect` |
| Nest metrics smoke | `~2026-05-29T02:38:26Z` | `metrics_http=200` |

---

## Steps executed

1. Read runbooks + dev-be handoff (`SCOPE_CONTEXT_MISMATCH` on `x-tenant-id: main`).
2. VPS audit: `xevn-hrm-be-dev` Up prior to deploy.
3. Synced BE scope parity files local → VPS via `pscp` (2 files).
4. VPS disk verification:
   - `grep -c normalizePortalScopeRequest` → **2** in `scope-context.ts`
   - `MASTER_TENANT_ID` references in `hrm-list-scope.ts` present
5. Recreated `hrm-be` only: `docker compose --env-file .env up -d --build --force-recreate hrm-be` (no `compose down`).
6. Waited 45s; L0 metrics **200**.
7. HTTPS API smoke with `ceo@xe.vn` — portal embed header case `x-tenant-id: main`.

### Files synced

```
apps/api/hrm-api/src/common/scope-context.ts
apps/api/hrm-api/src/common/hrm-list-scope.ts
```

---

## Gate results

| Gate | Result | Evidence |
|---|---|---|
| VPS safety (no compose down) | **PASS** | Targeted `--force-recreate hrm-be` only |
| `normalizePortalScopeRequest` on VPS disk | **PASS** | grep count **2** |
| L0 `http://127.0.0.1:3001/api/hrm/metrics` | **PASS** | HTTP **200** |
| L0 HTTPS `/hr/`, attendance embed, `/api/hrm/` | **PASS** | HTTP **200** each |
| **GET employees/:id + x-tenant-id: main** | **PASS** | **200** `HRM-EMP-200` (was **409** pre-fix) |
| GET employees/:id + x-tenant-id: xevn (baseline) | **PASS** | **200** `HRM-EMP-200` |
| Prometheus metrics | **PASS** | **200**, contains `http_requests_total` |
| **J-HRM-06 L2.5 UI** | **NOT RUN** (QA owner) | Browser list→detail + CC iframe |

---

## Smoke outputs

```text
VPS: normalizePortalScopeRequest count=2
container_started: 2026-05-29T02:37:41.538324595Z
metrics_http=200
LOGIN_STATUS=201 tenant=xevn
CASE=x-tenant-id-main (portal embed) STATUS=200 CODE=HRM-EMP-200 PASS
CASE=x-tenant-id-xevn (baseline) STATUS=200 CODE=HRM-EMP-200 PASS
METRICS_STATUS=200 has_http_requests_total=true
L0: /hr/ -> 200; /hr/attendance?portal=1&companyId=main -> 200; /api/hrm/ -> 200
```

Target employee: `00000000-0000-4000-8000-000000000002?company_id=main` (QA R5 repro id).

---

## completion_report

- **Closed:** Deployed `scope-context` main→`xevn` tenant alias fix to HTTPS pilot; recreated `xevn-hrm-be-dev`; verified `GET /api/hrm/employees/{id}?company_id=main` returns **200** `HRM-EMP-200` with portal-style `x-tenant-id: main` (no **409** `SCOPE_CONTEXT_MISMATCH`). L0 HTTPS routes green.
- **Residual:** J-HRM-06 L2.5 browser journey (attendance list → employee profile, CC iframe) — QA R6 with hard refresh; unrelated probe failures (J-CC-03, P-CC-04c) out of scope.

---

## Handoff packet

```yaml
work_item_id: P1-EX-DO-DEPLOY-HTTPS-BE-SCOPE-03
from_role: devops
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/ops/evidence/p1-ex-do-deploy-https-be-scope-03-20260529.md
next_owner: qa
```

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R6
from_role: devops
to_role: qa
entry_criteria: docs/ops/evidence/p1-ex-do-deploy-https-be-scope-03-20260529.md — hrm-api recreated 2026-05-29T02:37:41Z; HTTPS GET employees/:id with x-tenant-id main returns 200 HRM-EMP-200 (DevOps API smoke PASS)
exit_criteria: J-HRM-06 L2.5 PASS — attendance list click → employee profile (no «Không tìm thấy nhân viên») on /hr and CC iframe for ceo@xe.vn; P-CC-07 still PASS; hard refresh first pass
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r6-20260529.md
ack_status: PASS_TO_PM
```
