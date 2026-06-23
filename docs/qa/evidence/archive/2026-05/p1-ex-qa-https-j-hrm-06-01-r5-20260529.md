# QA Runtime Evidence — P1-EX-QA-HTTPS-J-HRM-06-01-R5

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-J-HRM-06-01-R5` |
| from_role | `qa` |
| to_role | `pm` |
| execution_time_utc | `2026-05-29` |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| entry_evidence | `docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-app-500-01-20260529.md` |
| ack_status | **FAIL_TO_PM** |

## Scope

1. **J-HRM-06 (L2.5):** attendance list → employee detail (direct `/hr` and CC iframe context).
2. **P-CC-07 (L2):** attendance UI load, no localhost fallback, API/sync surface healthy.

## Runtime checks executed

### A) Deploy precondition and module smoke

```text
src/App.tsx:200 LEN:74586
pages/AttendanceEntry.tsx:200 LEN:7969
hr/attendance?portal=1&companyId=main:200 LEN:1358
```

Verdict: **PASS** — R4 blocker `vite_app_tsx_500` is closed (App.tsx now 200).

### B) API probe (system script)

Command: `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs`

Relevant lines:

```text
PASS  P-CC-07 HTTP 200 HRM-ATT-200
PASS  J-HRM-06
=== L2.5 journeys: 7/7 PASS ===
```

Probe residual outside this scope:

```text
FAIL  J-CC-03 HTTP 409 SCOPE_CONTEXT_MISMATCH
FAIL  P-CC-04c HTTP 409 SCOPE_CONTEXT_MISMATCH
```

Note: those two failures are not part of this work item exit gate; they are recorded here for PM visibility only. This work item verdict is based on **J-HRM-06 + P-CC-07**.

### C) Browser L2/L2.5 validation (live click path)

1. Navigated to `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main&_cb=r5dir`.
2. Attendance page mounted (`#root` children 4, text length 1203), no 54321 fallback.
3. Clicked attendance row entry: `00000000-0000-4000-8000-000000000002`.
4. Redirected to employee detail URL:
   `https://14-225-217-232.nip.io/hr/employees/00000000-0000-4000-8000-000000000002?portal=1&tenantId=main&companyId=main`.
5. Observed UI message: **"Không tìm thấy nhân viên"**.
6. Captured employee detail API resource status from browser runtime:
   `GET /api/hrm/employees/00000000-0000-4000-8000-000000000002?company_id=main` → **409**.

Runtime capture:

```text
rootChildren=4 bodyLen=213
employee API responseStatus=409
UI text: "Không tìm thấy nhân viên"
```

### D) Command Center embedding surface

From `https://14-225-217-232.nip.io/command-center/hrm/attendance?...`:

- iframe src resolved to
  `https://14-225-217-232.nip.io/hr/attendance?portal=1&tenantId=xevn&companyId=main`
- `fallback54321=0`

Verdict: CC route/iframe loads, but downstream list→detail parity still fails.

---

## Gate verdict

| Gate | Result |
|---|---|
| Entry precondition (App.tsx 200) | **PASS** |
| P-CC-07 route + attendance UI mount | **PASS** |
| P-CC-07 no localhost fallback (54321) | **PASS** |
| **J-HRM-06 list → detail (UI click-path)** | **FAIL** |
| J-HRM-06 detail API status | **FAIL** (`409 SCOPE_CONTEXT_MISMATCH`) |

## Defect classification

- `scope_parity`
- `hrm-attendance-to-profile-409`

## completion_report

- **Closed:** App.tsx 500 regression is closed; attendance UI now mounts and P-CC-07 L2 base checks pass on HTTPS pilot.
- **Residual (blocking):** J-HRM-06 L2.5 remains failing. Real UI click-path from attendance list to employee detail returns API 409 and renders "Không tìm thấy nhân viên". This is a release-blocking parity defect for this journey.

## next_owner

`dev-be`

## next_dispatch_prompt

```text
work_item_id: P1-EX-BE-HTTPS-J-HRM-06-SCOPE-PARITY-03
from_role: pm
to_role: dev-be
entry_criteria: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r5-20260529.md shows J-HRM-06 list->detail fail on HTTPS pilot; attendance list click to employee 00000000-0000-4000-8000-000000000002 returns GET /api/hrm/employees/:id?company_id=main = 409 and UI "Không tìm thấy nhân viên".
exit_criteria: J-HRM-06 list->detail returns employee API 200 for company_id=main with ceo@xe.vn and UI profile renders (no not-found) on both direct /hr and CC iframe context; include regression checks for other employee IDs from attendance list.
evidence_path: docs/ops/evidence/p1-ex-be-https-j-hrm-06-scope-parity-03-20260529.md
ack_status: READY_FOR_QA
```

## ack_status

**FAIL_TO_PM**
