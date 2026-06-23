# P1-EX-QA-HTTPS-BROWSER-01-R5 - HTTPS browser retest (post R5 pack)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-BROWSER-01-R5` |
| from_role | `pm` |
| to_role | `qa` |
| date | `2026-05-28` |
| base_url | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` |
| prerequisite deploy evidence | `docs/ops/evidence/p1-ex-do-deploy-https-r5-pack-20260528.md` (**MISSING ON DISK**) |
| references | `docs/qa/evidence/p1-ex-be-https-catalog-sync-10-20260528.md`, `docs/qa/evidence/p1-ex-fe-https-emp-profile-10-20260528.md`, `docs/qa/evidence/p1-ex-qa-https-browser-01-r4-20260528.md` |
| ack_status | **FAIL_TO_PM** |

## Executive verdict

Browser functional checks requested for `P-CC-03..08` and `J-HRM-02` are now **PASS** on HTTPS pilot:

- no `Sync ERROR` observed on `P-CC-03..08`
- `GET /api/hrm/catalog-sync/status?company_id=main` returns **200** with code `HRM-SYNC-203`
- iframe `src` includes `companyId=main`
- `J-HRM-02` list -> profile is **PASS** (no false banner, detail API 200)

However, QA gate for this work item remains **FAIL_TO_PM** because the dispatch-mandated entry artifact does not exist on disk:

- `docs/ops/evidence/p1-ex-do-deploy-https-r5-pack-20260528.md` -> **File not found**

Per dispatch note "Run only after deploy evidence exists", this precondition failure blocks `PASS_TO_PM`.

## Mandatory checks

### 1) `P-CC-03..08`: no Sync ERROR

| Route ID | Route | Result |
|---|---|---|
| P-CC-03 | `/command-center/hrm/employees` | PASS - `HRM API Sync CONNECTED`, no Sync ERROR |
| P-CC-04 | `/command-center/hrm/contracts` | PASS - `HRM API Sync CONNECTED`, no Sync ERROR |
| P-CC-05 | `/command-center/hrm/insurance` | PASS - `HRM API Sync CONNECTED`, no Sync ERROR |
| P-CC-06 | `/command-center/hrm/recruitment` | PASS - `HRM API Sync CONNECTED`, no Sync ERROR |
| P-CC-07 | `/command-center/hrm/attendance` | PASS (for Sync gate) - `HRM API Sync CONNECTED`, no Sync ERROR |
| P-CC-08 | `/command-center/hrm/payroll` | PASS - `HRM API Sync CONNECTED`, no Sync ERROR |

Note: `P-CC-07` still shows non-sync message "Lỗi - Không thể tải quy định chấm công" (residual outside the requested sync check).

### 2) iframe `/api/hrm/catalog-sync/status` => `200 HRM-SYNC-203`

- Retest with portal bearer token on `P-CC-03..08`: **PASS**
- sample response:
  - `status: 200`
  - `code: HRM-SYNC-203`
  - `message: Catalog sync status fetched`

### 3) iframe `src` has `companyId=main`

All sampled iframe routes include `companyId=main`:

- `/hr/employees?portal=1&tenantId=xevn&companyId=main`
- `/hr/contracts?portal=1&tenantId=xevn&companyId=main`
- `/hr/insurance?portal=1&tenantId=xevn&companyId=main`
- `/hr/recruitment?portal=1&tenantId=xevn&companyId=main`
- `/hr/attendance?portal=1&tenantId=xevn&companyId=main`
- `/hr/payroll?portal=1&tenantId=xevn&companyId=main`

### 4) `J-HRM-02` list -> profile PASS (no false error banner)

**PASS**

- from: `/command-center/hrm/employees`
- click path: first employee row in iframe list (`NV0001`) -> profile route
- iframe final URL: `/hr/employees/00000000-0000-4000-8000-000000000001`
- UI check: no "Không thể tải thông tin nhân viên" banner
- API check: `GET /api/hrm/employees/00000000-0000-4000-8000-000000000001?company_id=main` -> **200** (`HRM-EMP-200`)

### 5) Reconfirm key browser list->detail paths where rows exist

- Employees (`J-HRM-02`): rows exist and list->detail PASS (above)
- Contracts/Insurance/Recruitment/Attendance/Payroll: no deterministic list rows available in this run for additional list->detail execution (dashboards/empty states)

## completion_report

- Closed:
  - Revalidated browser-level HTTPS checks for `P-CC-03..08`.
  - Confirmed catalog-sync status endpoint contract now returns `200 HRM-SYNC-203`.
  - Confirmed `J-HRM-02` false-error regression is closed (profile loads, detail API 200).
- Residual / blocker:
  - Mandatory deploy evidence artifact for this wave is missing (`docs/ops/evidence/p1-ex-do-deploy-https-r5-pack-20260528.md`), violating dispatch entry condition.
  - Attendance still shows non-sync runtime message: "Không thể tải quy định chấm công" (follow-up recommended).

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-QA-HTTPS-BROWSER-01-R5A
from_role: pm
to_role: devops
ack_status target: PASS_TO_PM

Please publish the missing deploy evidence artifact for this exact wave:
- docs/ops/evidence/p1-ex-do-deploy-https-r5-pack-20260528.md

Include:
1) deploy commands/logs for BE catalog-sync + FE employee-profile fixes,
2) smoke proof on https://14-225-217-232.nip.io showing /api/hrm/catalog-sync/status => 200 HRM-SYNC-203,
3) explicit ack_status PASS_TO_PM in the deploy evidence.

After artifact is present, PM can accept QA R5 functional PASS without re-running full browser sweep.
```

## evidence_path

`docs/qa/evidence/p1-ex-qa-https-browser-01-r5-20260528.md`
# QA Evidence — INVALID-HANDOFF Recovery

- work_item_id: `P1-EX-QA-HTTPS-BROWSER-01-R5-R1`
- from_role: `pm`
- to_role: `qa`
- date: `2026-05-28`
- purpose: Reconstruct mandatory QA evidence packet after INVALID-HANDOFF detection.

## Scope and method

This artifact is a recovery packet only. At intake time, no reproducible browser-run evidence bundle was attached for formal PM bus promotion of `P1-EX-QA-HTTPS-BROWSER-01-R5-R1`.

Therefore QA cannot certify `PASS_TO_PM` for this work item in this cycle.

## Mandatory verdict table

| Checkpoint | Requirement | Observed in recovery cycle | Verdict |
|---|---|---|---|
| Evidence presence | QA packet must include reproducible runtime/browser evidence | Missing at intake; file recreated now as recovery artifact | FAIL |
| L2 routes (`P-CC-*`) | Route-level outcomes with browser traces | Not attached in intake bundle | FAIL |
| L2.5 journeys (`J-*`) | List -> detail -> back/deep-link with URL/status/console | Not attached in intake bundle | FAIL |
| Handoff contract | completion_report + next_owner + next_dispatch_prompt + evidence_path + ack_status | Previously incomplete; now repaired in this file + chat packet | PARTIAL |

## QA conclusion

- `ack_status`: **FAIL_TO_PM**
- reason: Missing reproducible browser L2/L2.5 execution evidence for this specific work item cycle prevents safe promotion.

## Not promoted

- `P1-EX-QA-HTTPS-BROWSER-01-R5-R1` remains **not promoted** in this recovery cycle.

## Required retest inputs (for next cycle)

1. Browser execution logs/snapshots for in-scope `P-CC-*`.
2. L2.5 `J-*` click-path evidence (final URL, HTTP status, console excerpt).
3. Explicit pass/fail map per journey with blocker classification (`scope_parity`, `data_gap`, or infra).

## PM dispatch hint

- `pm_dispatch_hint`: `P1-EX-QA-HTTPS-BROWSER-01-R5-R2 — dispatch QA retest with full browser L2 + L2.5 evidence capture and re-submit for promotion.`

