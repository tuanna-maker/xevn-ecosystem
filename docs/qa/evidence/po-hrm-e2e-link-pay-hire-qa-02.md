# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-QA-02

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-QA-02` |
| from_role | qa |
| to_role | pm |
| ack_status | **`FAIL_TO_PM`** |
| verdict | **FAIL** |
| date | 2026-08-06 |
| persona / URL | `ceo@xe.vn` / `Xevn@2026` · `http://127.0.0.1:5175/hr/payroll?portal=1&tenantId=xevn&companyId=main` |
| u65 | zero-seed · browser-only (no seed / no DB mutate) |
| honesty | `payroll_e2e_ready=false` |
| supersedes | `po-hrm-e2e-link-pay-hire-qa-01.md` |
| hdsd_align | HRM → **Tiền lương** → **Tính lương** → Danh sách bảng lương → Lập bảng → Thêm NV → Khóa |
| env | portal `:5175` (hrm-standalone) · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| machine evidence | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-hire-qa-02-browser.json` |
| screenshots | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-hire-qa-02/` |

## L0 stack — PASS

| Service | Status |
|---------|--------|
| hrm-api | 200 |
| xbos-api | 200 |
| portal (5175) | 200 |

## UF / Journey

| ID | Click path | Result |
|----|------------|--------|
| **UF-HRM-06** / **J-HRM-07** | Login → `/hr/payroll` → Tính lương calc-list | 🟡 **PARTIAL** — batches surface visible; create/enroll blocked |
| **AC-PAY-HIRE-04** | Lập bảng → Thêm NV → POST enroll 2xx → list refresh | 🔴 **FAIL** — create dialog crash |
| **AC-PAY-HIRE-05** | F5 persistence | 🟢 **PASS** (partial — existing UAT payslip row) |

## Acceptance criteria

| AC / Check | Verdict | Evidence |
|------------|---------|----------|
| **PayrollBatchesTab** visible (`Lập bảng` + batches KPI) when global payslip ≥ 1 | **PASS** | `surface.mode=batches`, `batchesTab=true`, `createBtn=true`, payslip probe count=1 — FE-02 decouple confirmed |
| **AC-PAY-HIRE-04** enroll POST 2xx → FE list updates | **FAIL** | Click **Lập bảng lương** → React crash — dialog never mounts; **0** browser `POST …/enroll` |
| **AC-PAY-HIRE-05** F5 persistence | **PASS** (partial) | Existing payslip `HLD-0001` / GET payslips **200** before+after reload (inherits QA-01 + this run probe) |
| GET **eligibility** `reasons[]` (BE) | **PASS** | Direct `:28001` probe **200** `HRM-PAY-200` · 53 ineligible · sample `NO_CLOSED_SHEET` on HLD-0001/NV002 — **not 404** |
| Eligibility **reasons[]** (FE UI) | **NOT RUN** | Blocked — no draft batch reachable (create dialog crash) |
| **HRM-PAY-ATT-412** process without closed sheet | **NOT RUN** | No draft period creatable from FE; only processed period in DB |
| Network eligibility/enroll **not 404** on `:28001` | **PASS** | GET eligibility **200**; POST enroll route **400** `HRM-VAL-001` (not 404) |

## QA-01 regressions closed

| QA-01 residual | QA-02 result |
|----------------|--------------|
| **R-PAY-HIRE-BATCHES-HIDDEN** | **CLOSED** — `PayrollBatchesTab` mounts with payslip count=1 |
| **R-PAY-HIRE-BE-STALE** | **CLOSED** — eligibility **200**, enroll route live (BE-02) |
| **R-PAY-HIRE-ELIGIBILITY-FE** | **NOT RUN** — blocked by create-dialog crash before add-employee dialog |

## Root cause (new P0)

### **R-PAY-HIRE-CREATE-DIALOG-CRASH** — dev-fe

Click **Lập bảng lương** sets `showAddDialog=true` but dialog **crashes on mount**:

```
Error: A <Select.Item /> must have a value prop that is not an empty string.
```

**Source:** `PayrollBatchesTab.tsx` create dialog — template picker:

```903:903:apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx
<SelectItem value="">Không sử dụng mẫu</SelectItem>
```

Radix Select forbids `value=""`. React error boundary unmounts dialog → enroll/process/412 matrix **not exercisable from FE** despite surface fix.

## Browser evidence (U65)

### Surface — PASS (FE-02)

- **Before:** QA-01 forced `PayrollPayslipsApiTab` when `livePayslips.length >= 1`.
- **After:** With payslip count=1, page shows `data-testid="pay-batches-precision"`, month filter **Tháng 8/2026**, button text **Lập bảng lương** visible.
- **Console:** clean on list load (no payslip 500 after stack stable).

### Create batch — FAIL

- **Action:** Click **Lập bảng lương** (Playwright + DOM click).
- **Expected:** `[data-testid="pay-batch-create-dialog-precision"]` visible.
- **Actual:** Dialog count **0**; console **Select.Item empty value** React fatal error.
- **Verdict:** 🔴 blocks AC-PAY-HIRE-04/05 full path + ATT-412 browser proof.

### Eligibility BE — PASS (API session, same JWT)

| Field | Value |
|-------|-------|
| GET | `/api/hrm/payroll/periods/d8a3c74f-…/eligibility?company_id=main` |
| Status | **200** `HRM-PAY-200` |
| ineligible_count | 53 |
| sample reasons | `HLD-0001` → `["NO_CLOSED_SHEET"]` |

### Enroll route — PASS (not 404)

| POST | `/api/hrm/payroll/periods/{id}/enroll` |
| Status | **400** `HRM-VAL-001` (probe body included extra field) — confirms route mapped, **not 404** |

### F5 — PASS (partial)

- Existing processed payslip row persists across reload (GET payslips **200**).

## Residuals (PM dispatch)

| ID | Sev | Owner | Action |
|----|-----|-------|--------|
| **R-PAY-HIRE-CREATE-DIALOG-CRASH** | P0 | dev-fe | Replace `SelectItem value=""` with sentinel (e.g. `__none__`) + map in form submit; retest create → enroll → lock |
| **R-PAY-HIRE-ELIGIBILITY-FE** | P1 | dev-fe | After dialog fix: verify badges in **Thêm nhân viên** dialog (`NO_CLOSED_SHEET` vi-VN) |
| **R-PAY-HIRE-ATT-412-BROWSER** | P1 | qa | Re-run process/412 after draft batch creatable from FE (Dec/2027 no sheet path) |

## completion_report

- **Closed:** L0 PASS; FE-02 surface gate **promoted** (batches tab with existing payslip); BE-02 eligibility/enroll routes **not 404**; BE `reasons[]` verified; AC-PAY-HIRE-05 partial F5 on legacy payslip.
- **Open:** AC-PAY-HIRE-04 **FAIL** (create dialog Radix crash); eligibility FE UI not run; ATT-412 browser not run; full hire→enroll→process chain **not promotable**.
- **Honesty:** `payroll_e2e_ready=false` — unchanged.

## next_owner

`dev-fe` (P0 dialog crash) → then `qa` re-run QA-03.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-FE-03
from_role: pm
to_role: dev-fe
lane: execution
parent: PO-HRM-E2E-LINK-PAY-HIRE-QA-02
ack_target: READY_FOR_QA

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-02.md (R-PAY-HIRE-CREATE-DIALOG-CRASH)
- apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx ~903 SelectItem value=""

task:
- Fix create-batch dialog: Radix SelectItem must not use value="" — use sentinel __none__ or omit optional template row pattern.
- Verify Lập bảng lương opens dialog on :5175 with ceo@xe.vn.
- Preserve FE-02 calc-list batches surface + eligibility wire.

exit: dialog opens · no React Select.Item console error

---

work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QA-03
from_role: pm
to_role: qa
entry: FE-03 READY_FOR_QA
exit: full AC-PAY-HIRE-04/05 + eligibility FE + ATT-412 browser · evidence po-hrm-e2e-link-pay-hire-qa-03.md
forbidden: seed; payroll_e2e_ready=true
```
