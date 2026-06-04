# QA Runtime Evidence — P1-EX-QA-HTTPS-J-HRM-06-01-R2

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-J-HRM-06-01-R2` |
| from_role | `devops` |
| to_role | `qa` → `pm` |
| execution_time_utc | `2026-05-29T00:13Z` |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| entry_evidence | `docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-scope-01-20260529.md` |
| prior_fail | `docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r1-20260529.md` (`deploy_gap` — missing `resolveEmployeeFetchCompanyIds`) |
| ack_status | **FAIL_TO_PM** |

## Scope

1. **J-HRM-06** — L2.5 attendance list → employee profile on HTTPS pilot (`company_id=main`), **CC iframe** + **direct embed** + deep link.
2. **P-CC-07** — L2 regression: zero `127.0.0.1:54321`, sync CONNECTED, attendance list API **200**.

---

## Deploy precondition (R1 gap closed)

| Check | R1 (pre-deploy) | R2 (post-deploy) | Verdict |
|-------|-----------------|------------------|---------|
| `GET /hr/src/hooks/useEmployee.ts` len | **6010** | **20815** | **PASS** |
| `resolveEmployeeFetchCompanyIds` count | **0** | **2** | **PASS** |
| Container recreate | — | `2026-05-28T17:01:24Z` (DevOps) | **PASS** |

**R1 `deploy_gap` for `useEmployee.ts` is closed.**

---

## New blocker — partial deploy (`deploy_partial`)

Playwright headless + Cursor browser CDP both show **HRM SPA never mounts** (`#root` child count **0**, body text empty).

| Signal | Value |
|--------|-------|
| **Page error** | `The requested module '/hr/src/lib/portalAuthBridge.ts' does not provide an export named 'waitForPortalAccessToken'` |
| Synced file | `hrmApi.ts` imports `waitForPortalAccessToken` |
| **Not synced** | `apps/web/hrm/src/lib/portalAuthBridge.ts` (defines export locally) |
| Pilot `portalAuthBridge.ts` | len **11018**, `waitForPortalAccessToken` count **0** |
| Local `portalAuthBridge.ts` | len **4312**, `waitForPortalAccessToken` count **1** |

**Impact:** Entire HRM embed is **down** (worse than R0/R1 scope_parity UX). J-HRM-06 L2.5 UI **not executable** until `portalAuthBridge.ts` (and dependent set) synced to pilot.

---

## P-CC-07 — L2 matrix (attendance)

| Check | Direct embed `/hr/attendance?portal=1&companyId=main` | CC iframe `/command-center/hrm/attendance?companyId=main` | Verdict |
|-------|--------------------------------------------------------|-----------------------------------------------------------|---------|
| Route HTTP | **200** | Parent **200**; iframe src present | **PASS** |
| HRM sync banner | **N/A** — SPA boot fail | **N/A** — iframe blank | **FAIL** (UI) |
| `GET /api/hrm/attendance/records?company_id=main` | **200** `HRM-ATT-200`, `total=299` (portal session fetch) | Same class via API probe | **PASS** (API) |
| `localhost:54321` (`fallback54321`) | **0** | **0** | **PASS** |
| `tmp-p1-ex-qa-https-01-probe.mjs` **P-CC-07** | **PASS** | — | **PASS** (API) |

**P-CC-07:** API + fallback gate **PASS**; **UI sync CONNECTED not observable** because HRM SPA fails module load.

---

## J-HRM-06 — L2.5 list → detail

### API layer (portal transport)

| Probe | Result |
|-------|--------|
| `GET /api/hrm/employees/00000000-0000-4000-8000-000000000021?company_id=main` | **200** `HRM-EMP-200`, `Nguyen NhanSu0021` |
| `tmp-p1-ex-qa-https-01-probe.mjs` **J-HRM-06** | **PASS** (list + GET by id **200**) |

### UI layer (blocked)

| Path | Expected | Observed |
|------|----------|----------|
| Direct deep link `/hr/employees/{id}?portal=1&companyId=main` | Profile name visible; no «Không tìm thấy nhân viên» | **Blank SPA** — module export error |
| CC iframe attendance → profile | List→detail or deep link profile | **Blank iframe** — same boot error |
| Direct `/hr/attendance` list→detail | Click employee → profile | **Not executable** — no rendered table |

**J-HRM-06 L2.5:** **FAIL** — tag **`deploy_partial`** (not prior `scope_parity`; UI never reaches employee loader).

---

## Console / network excerpt (sanitized)

```text
PAGEERROR: The requested module '/hr/src/lib/portalAuthBridge.ts' does not provide an export named 'waitForPortalAccessToken'
PILOT_SRC useEmployee.ts: len=20815 hasResolve=2
PILOT_SRC portalAuthBridge.ts: len=11018 hasWaitForPortalAccessToken=0
API: GET attendance/records?company_id=main → 200 HRM-ATT-200 total=299
API: GET employees/…0021?company_id=main → 200 HRM-EMP-200
fallback54321=0 (parent + direct paths)
CONSOLE: tenant-scope.accessible HTTP 401 (non-blocking vs boot PAGEERROR)
```

---

## Verdict summary

| Gate | Result |
|------|--------|
| Deploy precondition (`useEmployee` fix on pilot) | **PASS** |
| P-CC-07 API + fallback54321 | **PASS** |
| P-CC-07 UI sync CONNECTED | **FAIL** (SPA boot) |
| J-HRM-06 L2.5 UI | **FAIL** (`deploy_partial`) |
| **Overall** | **FAIL_TO_PM** |

---

## completion_report

- **Closed scope:** Verified DevOps closed R1 `deploy_gap` — pilot Vite source now includes `resolveEmployeeFetchCompanyIds` (len 20815, count 2). Re-ran HTTPS API probe: **P-CC-07** and **J-HRM-06** API journeys **PASS**; `fallback54321=0`.
- **Open / FAIL:** Partial deploy — synced `hrmApi.ts` references `waitForPortalAccessToken` but pilot `portalAuthBridge.ts` lacks export → **HRM SPA boot failure** on all `/hr/*` routes. J-HRM-06 L2.5 UI not re-testable for scope fix until DevOps syncs missing module(s).

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-SCOPE-02
from_role: qa
to_role: devops
entry_criteria: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r2-20260529.md — R2 FAIL deploy_partial: pilot PAGEERROR missing export waitForPortalAccessToken (hrmApi.ts synced, portalAuthBridge.ts stale len=11018 vs local 4312 with export). useEmployee resolveEmployeeFetchCompanyIds deploy PASS.
exit_criteria: pscp sync apps/web/hrm/src/lib/portalAuthBridge.ts (+ verify full FE handoff file set from docs/qa/evidence/p1-ex-fe-https-j-hrm-06-scope-01-20260529.md) to VPS; recreate hrm-fe; pilot GET /hr/src/lib/portalAuthBridge.ts contains waitForPortalAccessToken; L0 /hr/attendance 200; HRM #root mounts (non-zero children). Then PM re-dispatch P1-EX-QA-HTTPS-J-HRM-06-01-R3 for J-HRM-06 L2.5 + P-CC-07 UI sync.
evidence_path: docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-scope-02-20260529.md
ack_status: READY_FOR_QA
```

## Handoff packet

```yaml
work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R2
from_role: qa
to_role: pm
ack_status: FAIL_TO_PM
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r2-20260529.md
summary: R1 useEmployee deploy_gap closed; new deploy_partial blocks all HRM UI (missing waitForPortalAccessToken export on pilot portalAuthBridge.ts). API P-CC-07/J-HRM-06 PASS; L2.5 UI FAIL.
pm_dispatch_hint: P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-SCOPE-02 — sync portalAuthBridge.ts then R3 QA
residual_auto_fix: true
```
