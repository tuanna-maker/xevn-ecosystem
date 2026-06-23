# QA Runtime Evidence — P1-EX-QA-HTTPS-J-HRM-06-01-R6

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-J-HRM-06-01-R6` |
| from_role | `qa` |
| to_role | `pm` |
| execution_time_utc | `2026-05-29` |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| entry_evidence | `docs/ops/evidence/p1-ex-do-deploy-https-be-scope-03-20260529.md` (hrm-be `2026-05-29T02:37:41Z`; `x-tenant-id: main` → **200** `HRM-EMP-200`) |
| ack_status | **PASS_TO_PM** |

## Scope

1. **J-HRM-06 (L2.5):** attendance overview late-list → employee profile (direct `/hr` + CC iframe).
2. **P-CC-07 (L2):** attendance UI mount, `fallback54321=0`, HRM API Sync CONNECTED, `GET attendance/records` **200**.

## Runtime checks executed

### A) Deploy / module precondition

```text
GET /hr/src/App.tsx → 200 len=74586
GET /hr/attendance?portal=1&companyId=main → 200 len=1400
```

Verdict: **PASS** — R4/R5 `vite_app_tsx_500` remains closed.

### B) API probe (`scripts/tmp-p1-ex-qa-https-01-probe.mjs`)

```text
PASS  P-CC-07 HTTP 200 HRM-ATT-200
PASS  J-HRM-06
=== L2.5 journeys: 7/7 PASS ===
```

Out-of-scope probe residuals (PM visibility only): `J-CC-03`, `P-CC-04c`, `P-CC-01-jwt` — not in this work item exit gate.

### C) Direct `/hr` — L2.5 list → detail

| Step | URL / action | Observed | Verdict |
|------|----------------|----------|---------|
| 1 | `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main&_cb=r6dir` | `#root` children **4**, `bodyLen=1206`, sync **CONNECTED**, `fallback54321=0` | **PASS** |
| 2 | `GET /api/hrm/attendance/records` | **200** | **PASS** |
| 3 | Click late-list row `00000000-0000-4000-8000-000000000002` | Navigated to `/hr/employees/…0002?portal=1&tenantId=main&companyId=main` | **PASS** |
| 4 | Profile render | **Nguyen NhanSu0002**, NV0002; **no** «Không tìm thấy nhân viên» | **PASS** |
| 5 | `GET /api/hrm/employees/…0002?company_id=main` | **200** `HRM-EMP-200` | **PASS** |

Runtime capture:

```text
rootChildren=4 fallback54321=0 attApi=200
click-path: late-list row → employees/…0002
hasNotFound=false hasNguyen=true empApiStatus=200
```

### D) Command Center iframe — L2.5 list → detail

| Step | URL / action | Observed | Verdict |
|------|----------------|----------|---------|
| 1 | `https://14-225-217-232.nip.io/command-center/hrm/attendance?companyId=main&_cb=r6cc2` | iframe `src` → `/hr/attendance?portal=1&tenantId=xevn&companyId=main`; `#root` children **4**; `fallback54321=0` (parent) | **PASS** |
| 2 | Click `[role=button]` late-list row `…0002` inside iframe | iframe navigates to `/hr/employees/…0002?portal=1&tenantId=main&companyId=main` | **PASS** |
| 3 | Profile in iframe | **Nguyen NhanSu0002**; **no** «Không tìm thấy nhân viên» | **PASS** |

Runtime capture:

```text
CC iframe: roleBtnCount=1 clicked=true
iframeUrl after click: …/hr/employees/00000000-0000-4000-8000-000000000002?portal=1&tenantId=main&companyId=main
hasNguyen=true hasNotFound=false
```

### E) Regression vs prior rounds

| Prior defect | R6 status |
|--------------|-----------|
| R5 `scope_parity` — employee GET **409** + UI not-found | **CLOSED** (API **200**, profile renders) |
| R4 `vite_app_tsx_500` | **CLOSED** (App.tsx **200**) |
| R3 `attendance_route_blank` | **CLOSED** (attendance `#root` mounts both paths) |
| R5 `attendance_route_blank` / list→detail not executable | **CLOSED** (click-path PASS direct + CC iframe) |

---

## Gate verdict

| Gate | Result |
|---|---|
| Entry (DevOps BE scope-03 API smoke) | **PASS** |
| P-CC-07 API (`HRM-ATT-200`) | **PASS** |
| P-CC-07 UI mount + CONNECTED + `fallback54321=0` | **PASS** |
| **J-HRM-06 L2.5 direct `/hr` list→detail** | **PASS** |
| **J-HRM-06 L2.5 CC iframe list→detail** | **PASS** |
| J-HRM-06 detail API (`employees/:id` + `company_id=main`) | **PASS** (**200**) |

## completion_report

- **Closed:** After `P1-EX-DO-DEPLOY-HTTPS-BE-SCOPE-03` / `P1-EX-BE-HTTPS-J-HRM-06-SCOPE-PARITY-03`, **J-HRM-06** and **P-CC-07** pass on HTTPS pilot for `ceo@xe.vn` / `companyId=main` — API probe, direct embed, and CC iframe list→profile click-paths all green; R5 **409** `SCOPE_CONTEXT_MISMATCH` on employee detail no longer reproduces.
- **Residual (non-blocking, out of scope):** Probe script still reports `J-CC-03` / `P-CC-04c` **409** on KPI rollup paths; `P-CC-01-jwt` expiry field mismatch — track under separate work items if PM wants HTTPS matrix fully green.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-QC-HTTPS-J-HRM-06-01-R6
from_role: pm
to_role: qc
entry_criteria: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r6-20260529.md — QA PASS_TO_PM; J-HRM-06 L2.5 + P-CC-07 PASS on https://14-225-217-232.nip.io ceo@xe.vn (direct /hr + CC iframe list→profile; employees/:id 200).
exit_criteria: QC GO or GO WITH CONDITIONS for HTTPS pilot J-HRM-06 / P-CC-07 wave; cite evidence path; note any waiver for J-CC-03 / P-CC-04c if still open program-wide.
evidence_path: docs/qa/evidence/qc-https-j-hrm-06-01-r6-20260529.md
ack_status: PASS_TO_PM
```

## ack_status

**PASS_TO_PM**
