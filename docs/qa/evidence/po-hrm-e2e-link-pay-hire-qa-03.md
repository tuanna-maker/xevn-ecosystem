# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-QA-03

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-QA-03` |
| from_role | qa |
| to_role | pm |
| ack_status | **`FAIL_TO_PM`** |
| verdict | **FAIL** |
| date | 2026-08-06 |
| persona / URL | `ceo@xe.vn` / `Xevn@2026` · `http://127.0.0.1:5175/hr/payroll?portal=1&tenantId=xevn&companyId=main` |
| u65 | zero-seed · browser-only (no seed / no DB mutate) |
| honesty | `payroll_e2e_ready=false` |
| supersedes | `po-hrm-e2e-link-pay-hire-qa-02.md` |
| hdsd_align | HRM → **Tiền lương** → **Tính lương** → Danh sách bảng lương → Lập bảng → Thêm NV → Khóa |
| env | portal `:5175` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| machine evidence | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-hire-qa-03-browser.json` |
| screenshots | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-hire-qa-03/` |

## L0 stack — PASS

| Service | Status |
|---------|--------|
| hrm-api | 200 |
| xbos-api | 200 |
| portal (5175) | 200 |

Command: `pnpm run qc:fe-be-health` → ALL PASS

## UF / Journey

| ID | Click path | Result |
|----|------------|--------|
| **UF-HRM-06** / **J-HRM-07** | Login → `/hr/payroll` → Tính lương calc-list → Lập bảng → Thêm NV → Khóa | 🟡 **PARTIAL** — dialog+create OK; enroll/412 blocked |

## Acceptance criteria

| AC / Check | Verdict | Evidence |
|------------|---------|----------|
| **Create dialog opens** (no SelectItem crash) | **PASS** | `[data-testid="pay-batch-create-dialog-precision"]` visible; title «Lập bảng lương mới»; **0** `Select.Item empty string` console/page errors — FE-03 **CLOSED** |
| PayrollBatchesTab visible (`Lập bảng` + batches KPI) | **PASS** | `pay-batches-precision` + create button with payslip count=1 |
| **AC-PAY-HIRE-04** enroll POST 2xx → list refresh | **FAIL** | Draft POST **201** in browser; **0** enroll POST 2xx; add-employee: **0** enabled checkboxes (53/53 `NO_CLOSED_SHEET`); new-draft eligibility **404** (scope parity) |
| **AC-PAY-HIRE-05** F5 persistence | **NOT RUN** | Blocked — enroll never 2xx |
| GET **eligibility** `reasons[]` (BE) | **PARTIAL** | Legacy processed period `d8a3c74f…` GET **200** `HRM-PAY-200` · 53× `NO_CLOSED_SHEET`; **new** draft `f12909dd…` GET eligibility **404** `HRM-PAY-404` |
| Eligibility **reasons[]** (FE UI) | **NOT RUN** | Blocked opening add-employee on persisted draft (list filter / scope) |
| **HRM-PAY-ATT-412** process without closed sheet | **FAIL** | POST `/process` on new draft `company_id=main` → **404** `HRM-PAY-404` (same scope bug); legacy period processed — not exercisable |
| Network eligibility/enroll **not 404** on `:28001` | **FAIL** | After create **201**, GET eligibility + POST process/enroll on **same period id** → **404** — not merely stale dist |

## QA-02 regressions closed

| QA-02 residual | QA-03 result |
|----------------|--------------|
| **R-PAY-HIRE-CREATE-DIALOG-CRASH** | **CLOSED** — FE-03 sentinel; dialog mounts (screenshot `debug-02-after-click.png`) |
| **R-PAY-HIRE-BATCHES-HIDDEN** | **CLOSED** — batches tab with payslip≥1 |
| **R-PAY-HIRE-BE-STALE** | **PARTIAL** — routes mapped; **new-draft scope 404** remains |

## Root cause (new P0)

### **R-PAY-HIRE-SCOPE-PARITY-MAIN** — dev-be

Browser/API create draft with `company_id=main` returns **201** (`HRM-PAY-201`), but subsequent operations on the **same period id** fail scope lookup:

| Step | Method | Status | Code |
|------|--------|--------|------|
| Create | POST `/api/hrm/payroll/periods` | **201** | `HRM-PAY-201` · `company_id: "main"` |
| Eligibility | GET `…/periods/{id}/eligibility?company_id=main` | **404** | `HRM-PAY-404` |
| Process | POST `…/periods/{id}/process` | **404** | `HRM-PAY-404` |
| Enroll | POST `…/periods/{id}/enroll` | **404** | `HRM-PAY-404` |
| List | GET `…/periods?company_id=main` | **200** | total=1 (only legacy `holding` processed — **0 drafts**) |

Probe script: `scripts/qa/_tmp-probe-pay-api.mjs` · sample id `f12909dd-ce2f-4eee-947e-5318afb532b6`

**Impact:** AC-PAY-HIRE-04/05 and ATT-412 browser matrix **not promotable** after create — FE shows 201 toast but cannot enroll/process new drafts under Group CEO `main` token.

### **R-PAY-HIRE-NO-ELIGIBLE-U65** — data / cross-module (secondary)

Even on legacy period eligibility **200**: `eligible_count=0`, `ineligible_count=53`, all sample reasons `NO_CLOSED_SHEET`. U65 zero-seed cannot enroll without prior attendance sheet close from FE.

## Browser evidence (U65)

### Dialog — PASS (FE-03)

- Click **Lập bảng lương** → dialog visible, template select «Không sử dụng mẫu» (sentinel `__none__`), no Radix crash.
- Screenshot: `docs/qa/evidence/screens/po-hrm-e2e-link-pay-hire-qa-03/debug-02-after-click.png`

### Create draft — PASS (HTTP) / FAIL (scope follow-up)

- POST `/api/hrm/payroll/periods` via FE → **201** `HRM-PAY-201` (browser network log).
- List month filter (Aug 2026 default) does not show Oct/Nov drafts without filter change; list API omits `main` drafts entirely.

### Eligibility BE — PARTIAL

| Context | GET eligibility | Sample reasons |
|---------|-----------------|----------------|
| Legacy processed `d8a3c74f…` | **200** | `HLD-0001` → `["NO_CLOSED_SHEET"]` |
| New draft `f12909dd…` (`company_id=main`) | **404** | Period not found |

## Residuals (PM dispatch)

| ID | Sev | Owner | Action |
|----|-----|-------|--------|
| **R-PAY-HIRE-SCOPE-PARITY-MAIN** | P0 | dev-be | Fix `queryPeriodInScope` / list filter so `company_id=main` create ↔ get eligibility/enroll/process ↔ list parity |
| **R-PAY-HIRE-NO-ELIGIBLE-U65** | P1 | pm | After scope fix: QA path attendance close-sheet → enroll OR document pilot waiver |
| **AC-PAY-HIRE-04/05** | P1 | qa | Re-run QA-04 after BE scope fix + eligible NV path |

## completion_report

- **Closed:** L0 PASS; **FE-03** create dialog crash **CLOSED**; batches surface PASS; legacy eligibility reasons[] BE verified; create POST 201 from browser.
- **Open:** **AC-PAY-HIRE-04 FAIL** (no enroll 2xx); **AC-PAY-HIRE-05 NOT RUN**; **ATT-412 FAIL** on new drafts; **eligibility/enroll 404** on new `main` drafts (**scope parity P0**); all NV ineligible `NO_CLOSED_SHEET` under U65.
- **Honesty:** `payroll_e2e_ready=false` — unchanged.

## next_owner

`dev-be` (P0 scope parity) → then `qa` QA-04

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-BE-03
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-E2E-LINK-PAY-HIRE-QA-03 FAIL

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-03.md (R-PAY-HIRE-SCOPE-PARITY-MAIN)
- apps/api/hrm-api/src/payroll/payroll.service.ts queryPeriodInScope + listPayrollPeriods

task:
- Reproduce: POST periods company_id=main → 201; GET eligibility/process/enroll same id + company_id=main → must NOT 404
- listPayrollPeriods?company_id=main must include new drafts for group CEO token
- Regression: payroll.service.spec.ts scope parity list↔get-by-id

exit: READY_FOR_QA · evidence po-hrm-e2e-link-pay-hire-be-03.md

---

work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QA-04
from_role: pm
to_role: qa
entry: BE-03 READY + FE-03 already PASS
exit: full AC-PAY-HIRE-04/05 + eligibility FE + ATT-412 browser
forbidden: seed; payroll_e2e_ready=true
```

## ack_status

**`FAIL_TO_PM`**
