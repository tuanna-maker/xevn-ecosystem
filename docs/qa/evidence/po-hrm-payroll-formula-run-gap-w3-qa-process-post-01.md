# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-PROCESS-POST-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-PROCESS-POST-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | execution — W3 browser **enroll → POST /process** proof (residual `R-PAY-W3-PROCESS-POST-UNPROVEN`) |
| **priority** | P1 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-W3-J-HRM-07-01` (GWC) |
| **prior** | QA R2 `PAYW3J07-R2-MSIRLK3I` · QC GWC `po-hrm-payroll-formula-run-gap-qc-w3-j-hrm-07-01.md` |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll` · HRM `:28001` · XBOS `:28002` · persona `ceo@xe.vn` · `company_id=main` |
| **journey_l25** | **J-HRM-07** — enroll/process mutate slice · **FAIL** process 2xx |
| **stamp** | **`PAYW3PROC-MSISALZ0`** (R1 dialog flake superseded by this stamp) |
| **machine** | [`_tmp-po-hrm-payroll-formula-run-gap-w3-qa-process-post-01.json`](_tmp-po-hrm-payroll-formula-run-gap-w3-qa-process-post-01.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-process-post-01/` (`01`…`07`) |
| **harness** | `scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-process-post-01.mjs` |
| **U65** | zero-seed · browser-only · **no** `pnpm seed:*` |
| **Verdict** | **FAIL** — POST `/process` captured but **412** (not 2xx) |
| **ack_status** | **`FAIL_TO_PM`** |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | **LOCKED** — DENIED promote |
| **Formula LIVE / customer UAT** | **DENIED** | amounts **0 ₫** · process not 2xx |
| **Module payroll UAT** | **DENIED** | slice FAIL ≠ module |
| **Seed** | **DENIED** | U65 |
| **R-PAY-BATCHES-SHOWADD-TDZ** | **CLOSED retained** | `tdzErrors=[]` · **not reopened** |

---

## Executive summary

Browser U65 process-post wave on **draft Sep 2026** period `d92d3bbb-…` (NOT Jan `dffbb1fe` closed) with **ATT closed same month** (`ae71f0b0` sheet). Enroll path: **53 NV already on batch** · add-dialog checkboxes all ineligible (`PASS_PREEXISTING_53_NO_ENABLED_CB`). **Khóa bảng lương** confirm reached · Network **POST** `/api/hrm/payroll/periods/d92d3bbb-…/process` → **412** `HRM-PAY-FORMULA-412-VARS` (*Required formula variables missing: `base_salary`*) · warnings `CB_PACKAGE_ABSENT`, `CATALOG_FORMULA_TEXT_FORBIDDEN` · `payroll_e2e_ready=false` in error body. Period remains **draft**. Payslip/lines UI **53 rows / 0 ₫** before and after F5 (draft display persist — **not** processed payslip). Residual **`R-PAY-W3-PROCESS-POST-UNPROVEN` SUPERSEDED** (POST now proven). New P1 **`R-PAY-W3-PROCESS-FORMULA-412-VARS`** → **dev-be**.

---

## Command table

| Command / check | Result | Exit / note |
|-----------------|--------|-------------|
| `pnpm run qc:dev-stack` | hrm/xbos/portal **200** | PASS L0 |
| `pnpm run qc:fe-be-health` | **ALL PASS** | PASS |
| `node scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-process-post-01.mjs` | stamp **`PAYW3PROC-MSISALZ0`** | exit **1** |
| Seed | none | U65 |

---

## Target period selection

| Criterion | Result |
|-----------|--------|
| Not Jan `dffbb1fe` (already closed) | **PASS** — used Sep `d92d3bbb-f53a-4151-9b12-0ebe9dd27d25` |
| Status draft | **PASS** (`status=draft`, `employee_count=53`) |
| ATT closed same month | **PASS** — sheet `ae71f0b0` closed `09/2026` |
| Other draft+ATT candidates | Jul `9a5ec612` ATT closed but **elig=0 / emp=0** — enroll blocked; no alternate with formula bind + emp |

---

## UF / J-HRM-07 matrix (this seat)

| Step | Click path | Verdict | Evidence |
|------|------------|---------|----------|
| L0 / TDZ | load calc-list | **PASS** | `tdzErrors=[]` · `01-pay-list.png` |
| Filter Sep | `pay-batch-period-option-9-2026` | **PASS** | |
| Open draft | `pay-batch-row-d92d3bbb` | **PASS** | `02-sep-detail-before.png` · 53 NV · Bản nháp · Khóa visible |
| Enroll | Thêm NV dialog | **PASS_PREEXISTING** | all CB disabled / ineligible · `03`/`04` · no new POST enroll needed |
| Process | Khóa → confirm | **FAIL** | POST **412** `HRM-PAY-FORMULA-412-VARS` · `05`/`06` |
| Payslip/lines UI | table after attempt | **PASS (draft UI)** | 53 rows · component cols · **0 ₫** |
| F5 | reload → re-open | **PASS (draft persist)** | `07-after-f5.png` · still draft · 53 × 0 ₫ |
| Honesty | ready / LIVE | **LOCKED false / DENIED** | |

---

## Acceptance criteria

| AC | Verdict | Notes |
|----|---------|-------|
| AC-ATT draft + ATT closed same month (≠ Jan closed) | **PASS** | Sep |
| AC-Enroll browser (or preexisting enrolled) | **PASS_PREEXISTING** | 53 on batch |
| AC-Process POST **2xx** in Network + machine | **FAIL** | POST captured · **412** not 2xx |
| AC-Payslip/lines UI after process + F5 | **PARTIAL** | UI rows persist · period **not** processed · 0 ₫ |
| Honesty `payroll_e2e_ready=false` | **PASS** | locked |
| DENY formula LIVE | **PASS** | 0 ₫ · no 2xx process |
| Cấm reopen TDZ without crash | **PASS** | no TDZ |

---

## Network (payroll mutate)

| Method | URL | Status | Code |
|--------|-----|--------|------|
| **POST** | `/api/hrm/payroll/periods/d92d3bbb-f53a-4151-9b12-0ebe9dd27d25/process` | **412** | **`HRM-PAY-FORMULA-412-VARS`** |

### Process error detail (API corroboration)

```json
{
  "code": "HRM-PAY-FORMULA-412-VARS",
  "message": "Required formula variables missing: base_salary",
  "formulaDefinitionId": "5d9f0964-62f1-4a64-b791-15e6ffa5613d",
  "missingVars": ["base_salary"],
  "warnings": ["CB_PACKAGE_ABSENT", "CATALOG_FORMULA_TEXT_FORBIDDEN"],
  "formulaSource": "company_active",
  "componentCode": "base",
  "payroll_e2e_ready": false
}
```

Console (FE): `ApiClientError: Required formula variables missing: base_salary` (captured in machine `consoleErrors`).

---

## FE click path

1. **P0** — Login inject → `/hr/payroll` → Tính lương → Danh sách
2. **filter** — `Tháng 9/2026`
3. **open** — row `d92d3bbb-…`
4. **enroll** — Thêm nhân viên → dialog (no enabled CB) → Hủy
5. **process** — Khóa bảng lương → confirm Khóa → **412**
6. **f5** — reload → filter Sep → re-open row → lines still 53 × 0 ₫ draft

---

## Residuals

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-W3-PROCESS-POST-UNPROVEN** | was P1 | qa | **SUPERSEDED** | POST `/process` now in Network + machine (412) |
| **R-PAY-W3-PROCESS-FORMULA-412-VARS** | **P1** | **dev-be** | **OPEN** | `base_salary` missing · `CB_PACKAGE_ABSENT` · `CATALOG_FORMULA_TEXT_FORBIDDEN` on company_active formula for Sep draft process |
| **R-PAY-BATCHES-SHOWADD-TDZ** | — | — | **CLOSED** | retained · not reopened |
| **`payroll_e2e_ready`** | honesty | pm | **LOCKED false** | |
| **`C-SLICE-≠-MODULE`** | governance | pm/qc | **CONDITION** | |

---

## Not promoted

- Process POST 2xx / period `processed`
- Formula LIVE / non-zero payslip amounts
- `payroll_e2e_ready=true`
- Module payroll UAT / full J-HRM-07 DoD
- Phase 1 DONE

---

## Classification

| Signal | Class |
|--------|-------|
| POST `/process` captured | **PRODUCT gate** (412 VARS) — not harness/UI missing |
| Enroll preexisting 53 | **OK** for this env |
| 0 ₫ amounts | **HONESTY OK** — DENY LIVE |
| TDZ | **OK** — CLOSED retained |

---

## completion_report

- **Closed:** L0 + fe-be PASS; U65 browser on Sep draft + ATT closed; enroll preexisting proven; **POST `/process` Network capture** (closes unproven residual); payslip/lines UI + F5 draft persist; honesty false; TDZ not reopened; machine + screens.
- **FAIL:** AC process **2xx** — **412** `HRM-PAY-FORMULA-412-VARS` (`base_salary` / CB_PACKAGE_ABSENT).
- **Open:** `R-PAY-W3-PROCESS-FORMULA-412-VARS` → dev-be; then QA retest process 2xx.
- **Not claimed:** LIVE · ready=true · module UAT.

## next_owner

**dev-be** (P1 formula vars / CB bag bind for process path) → **qa** retest process-post

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-BE-PROCESS-FORMULA-412-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
parent: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-PROCESS-POST-01

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-process-post-01.md
- docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-process-post-01.json

entry_criteria: QA FAIL_TO_PM stamp PAYW3PROC-MSISALZ0 — browser POST /process 412 HRM-PAY-FORMULA-412-VARS on Sep draft d92d3bbb (ATT closed; 53 enrolled)
exit_criteria:
- Diagnose missingVars base_salary + warnings CB_PACKAGE_ABSENT / CATALOG_FORMULA_TEXT_FORBIDDEN for formulaSource=company_active on process
- Product path so browser Khóa → POST /process returns 2xx for a draft period with ATT closed same month (U65; no seed); OR document deterministic precondition FE must satisfy (CB bag bind) with AC
- Regression: retain payroll_e2e_ready=false in responses; do not invent LIVE
- ack_status: READY_FOR_QA
- evidence_path: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-be-process-formula-412-01.md

must_keep: U65 zero-seed · TDZ CLOSED · payslip GET / ATT-LINE / CB-BAG prior GWC seats
forbidden: seed · flip payroll_e2e_ready=true · reopen showAddDialog TDZ
```

## ack_status

**`FAIL_TO_PM`**
