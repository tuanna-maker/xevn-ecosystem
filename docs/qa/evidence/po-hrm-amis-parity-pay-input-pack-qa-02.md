# Evidence — PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-02` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-02` READY_FOR_QA |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-01` FAIL `PAYINPQA-MSIRS9L7` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution — **L1 API smoke** (not browser UF · not module UAT) |
| **date** | 2026-08-07 |
| **stamp** | `PAYINPQA2-MSISF85U` (FINAL) |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** — 3/3 exit AC |
| **artifact_json** | [`_tmp-po-hrm-amis-parity-pay-input-pack-qa-02.FINAL.json`](./_tmp-po-hrm-amis-parity-pay-input-pack-qa-02.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-input-pack-qa-02.mjs` |
| **account** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | L1 slice ≠ module UAT |
| **Seed** | **DENIED** | U65 zero-seed · no `pnpm seed:*` |
| **Browser Step4 UF / J-HRM-07** | **DENIED** | FE packs residual |
| **AMIS DONE / ready flip** | **DENIED** | |

---

## Environment

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | HRM / XBOS / portal **200** (Windows UV assert noise after PASS) |
| Dist BE-02 markers | `NULL::text AS timesheet_code` present · `createAdvanceRequestEmployee` in controller · `expandPayrollAttendanceSheetCompanyIds` in eligibility |
| Stale-dist probe | unauth timesheet-binds / POST employees → **401** (routes live) |
| Auth | XBOS/portal login · Bearer · `x-tenant-id=xevn` · `x-company-id=main` · JWT `sub=ceo@xe.vn` |

### Fixture IDs (FINAL)

| Key | Value |
|-----|--------|
| periodId | `d92d3bbb-f53a-4151-9b12-0ebe9dd27d25` (Sep 2026 draft) |
| closedSheetId | `ae71f0b0-a3cb-43ab-9f5f-f42004add657` (Sep closed · holding · name `QA-BP-ATT-SIGN-DRAFT-SUBMIT-01`) |
| bindId | `067c7f8a-7f20-4944-93c0-b3d65b3bea27` |
| advanceRequestId | `fab80cac-1681-4430-a4a6-cf56e562088c` |
| advanceEmployeeId | `2136b995-ce1f-4e8c-8488-b0ef54167014` |
| preferredEmp | `HLD-0001` / `3796d949-4513-45c0-88fa-33030a062b17` |

> **Period pick note:** Jul closed sheets exist but Jul payroll periods are `processed`/`closed` (immutable). Harness selects closed sheet with **strict date-overlap** draft/open period (Sep). R1 false FAIL was Jul sheet + Aug period fuzzy match — fixed in FINAL harness.

---

## AC matrix (L1)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **AC-AMIS-ATT-XFER-01** | closed bind → LIST/GET 200 display-ready (name label, status=closed) — no 500 `s.code` | Open bind → **412** `HRM-PAY-ATT-412` ✅ · Closed bind INSERT/DUP ok · LIST **200** · GET **200** · `timesheetDisplayLabel=QA-BP-ATT-SIGN-DRAFT-SUBMIT-01` · `timesheetStatus=closed` · **no** `column s.code` | **PASS** |
| **AC-PAY-ELIG-ENROLL** | after bind: eligibility `items[]` not empty; enroll HLD-0001 succeeds OR honest ineligible | GET eligibility **200** · `items=53` · `eligible_count=53` · HLD-0001 `eligible=true` · POST enroll explicit → **201** `HRM-PAY-ENROLL-200` | **PASS** |
| **VAL-INP-ADV-01** | POST …/employees → approve → mark-paid+`payrollPeriodId` → `source_kind=advance` | POST employees **201** `HRM-ADV-201` · approve **201** `HRM-ADV-203` · mark-paid without period → **400** (requires `payrollPeriodId`) · mark-paid+period → **201** `HRM-ADV-205` · `bridgedInputLineIds.length=1` · input-lines `source_kind=advance` + `source_ref=advance_request_employee:…` | **PASS** |
| Honesty | no ready flip / no seed | locked | **PASS** |

---

## Residuals CLOSED (from QA-01)

| ID | Prior | Retest |
|----|-------|--------|
| **R-PAY-INP-BIND-SHEET-CODE-COL** | LIST/GET 500 `s.code` | **CLOSED** — LIST/GET 200 name label |
| **R-PAY-SRC-03-PROCESS** (eligibility empty / main≠holding) | `eligible_count=0` after bind | **CLOSED** — `eligible_count=53` includes HLD-0001; enroll 201 |
| **R-PAY-ADV-EMP-API-ABSENT** | no POST employees | **CLOSED** — `HRM-ADV-201` product path |
| **R-VAL-INP-ADV-01-NO-EMP-ROWS** | empty bridge | **CLOSED** — bridged=1 advance line |

---

## Residual / not promoted

| Item | Owner |
|------|-------|
| FE wire `POST …/employees` (remove throw in `useAdvanceRequests`) | **dev-fe** |
| Browser Step4 UF packs | **dev-fe** + QA browser |
| Module UAT / `payroll_e2e_ready` flip | **DENIED** |

### Explicit non-claims

- Did **not** claim AMIS parity DONE / payroll e2e ready / J-HRM-07 process UAT.
- Did **not** use seed or flip `payroll_e2e_ready`.
- Did **not** run browser UF (FE Step4 residual).

---

## completion_report

### Closed

1. L0 + live-dist BE-02 markers (`NULL timesheet_code` · POST advance employees · eligibility OU expand).
2. L1 retest of three exit ACs — all **PASS** (`PAYINPQA2-MSISF85U`).
3. Closed QA-01 P0 residuals: bind display, eligibility/enroll, advance emp API + bridge.

### Residual

- FE must wire POST employees (BE ready) — not L1 blocker.
- Browser UF / module UAT / ready flip — **DENIED**.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** → dispatch **dev-fe** (advance POST wire) then QC optional GWC for L1 slice |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01` — wire FE POST advance employees; **cấm** flip `payroll_e2e_ready` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
prior: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-02 PASS_TO_PM stamp PAYINPQA2-MSISF85U

entry_criteria:
- evidence: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-02.md
- Nest POST /payroll/advance-requests/:requestId/employees live (HRM-ADV-201) — remove FE throw «API thêm NV chưa có»
- U65 zero-seed · payroll_e2e_ready must stay false

exit_criteria:
1) FE useAdvanceRequests (or equivalent) calls POST employees with DTO employee_code/name/advance_amount
2) After save: list employees on advance request refreshes; no throw
3) Optional: approve → mark-paid with payrollPeriodId still works from UI if already wired
4) evidence: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-fe-01.md
5) ack_status READY_FOR_QA

cấm: pnpm seed:* · payroll_e2e_ready flip · claim module UAT
```
