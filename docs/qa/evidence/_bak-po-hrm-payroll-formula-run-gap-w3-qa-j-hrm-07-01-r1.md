# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **`FAIL_TO_PM`** |
| **verdict** | **FAIL** — P0 FE crash blocks entire J-HRM-07 W3 browser chain |
| **date** | 2026-08-07 |
| **persona / URL** | `ceo@xe.vn` / `Xevn@2026` · http://127.0.0.1:5173/hr/payroll · `company_id=main` |
| **U65** | zero-seed · browser-only · cấm seed |
| **honesty** | `payroll_e2e_ready=false` · formula LIVE **DENIED** · module UAT **DENIED** |
| **journey_l25** | **J-HRM-07** — Lương → phiếu lương + dòng thành phần (browser) |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **stamp** | `PAYW3J07-MSIR59EJ` (Jan retest) · prior `PAYW3J07-MSIR45HS` (Aug) |
| **machine** | `docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-browser.json` |
| **prior QC baselines** | ATT-LINE-03 GWC · CB-BAG GWC · PAYSLIP-LINES-GET GWC · PAY-TPL-02 GWC — **RETAINED · do not reopen L1 alone** |

## L0 stack — PASS

| Service | Status |
|---------|--------|
| hrm-api | 200 |
| xbos-api | 200 |
| portal | 200 |

## Executive summary

Browser U65 W3 **J-HRM-07** could not execute enroll → process → payslip UI because **`PayrollBatchesTab` crashes on mount** with `ReferenceError: Cannot access 'showAddDialog' before initialization` — `usePaySheetTemplates({ enabled: showAddDialog })` at line 193 references state declared at line 203 (TDZ). Console repeats ×3; `[data-testid="pay-batches-precision"]` never renders → **P-CC-08 / payroll_load FAIL**.

**API corroboration (Jan 2026 — data OK, FE blocked):** closed attendance sheets **4** · period `dffbb1fe…` eligibility **`eligible_count=53`** · BE-01 same-month gate satisfied. Failure is **FE P0**, not missing seed or API.

**Aug 2026 run (stamp MSIR45HS):** additionally `closedSameMonth=0` → enroll blocked by U65 (no closed sheet that month). Jan run has ATT prereq **PASS** but same FE crash.

**Honesty:** `payroll_e2e_ready=false` — no LIVE / no module UAT claim. L1 formula slices (ATT/CB/payslip GET) remain GWC only.

## Root cause (P0)

| Layer | Finding |
|-------|---------|
| **FE** | `PayrollBatchesTab.tsx` — `showAddDialog` used in hook before `useState` declaration → React error boundary / blank calc-list |
| **File** | `apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx` ~L191–203 |
| **Symptom** | Tiền lương → Tính lương → Danh sách: white/error; no `pay-batch-add-emp-btn`; harness timeout on «Lập bảng lương» |

## UF / J-HRM-07 matrix

| Step | Click path | Aug 8/2026 | Jan 1/2026 | Notes |
|------|------------|------------|------------|-------|
| ATT prerequisite | Closed sheet same month | **FAIL** (0) | **PASS** (1+) | API `closedSheets=4` Jan |
| P-CC-08 load | `/hr/payroll` → Tính lương → Danh sách | **FAIL** | **FAIL** | FE TDZ crash |
| Create/select kỳ | Filter + Lập bảng | PARTIAL | BLOCKED | Dialog unreachable after crash |
| Enroll NV | Thêm NV → POST enroll 2xx | **NOT RUN** | **NOT RUN** | |
| Process | Khóa → POST `/process` 2xx | **NOT RUN** | **NOT RUN** | |
| UI phiếu + dòng | Batch cols / payslip dialog | **NOT RUN** | **NOT RUN** | |
| F5 persist | Reload | **NOT RUN** | **NOT RUN** | |

## Acceptance criteria

| AC | Verdict | Evidence |
|----|---------|----------|
| AC-W3-01 ATT closed same month | **PARTIAL** | Jan PASS API · Aug FAIL |
| AC-W3-02 Period create/open | **BLOCKED** | FE crash before list stable |
| AC-W3-03 Enroll browser 2xx | **NOT RUN** | |
| AC-W3-04 Process browser 2xx | **NOT RUN** | |
| AC-W3-05 Payslip + lines on UI | **NOT RUN** | |
| AC-W3-06 F5 persistence | **NOT RUN** | |
| Honesty `payroll_e2e_ready` | **false** | Mandatory |

## FE click path (Jan retest — 3 clicks before crash)

1. **P0** — Login inject → `http://127.0.0.1:5173/hr/payroll`
2. **P-filter** — `pay-batch-period-option-1-2026`
3. **P-create** — attempted «Lập bảng lương» → **timeout** (button not in DOM — tab crashed)

## Console excerpt

```
ReferenceError: Cannot access 'showAddDialog' before initialization
  at PayrollBatchesTab (PayrollBatchesTab.tsx:119)
```

## API corroboration (observe-only · not UF PASS)

| Probe | Result |
|-------|--------|
| Jan period `dffbb1fe…` GET eligibility | **200** · `eligible_count=53` |
| Closed attendance sheets (main) | **4** |
| GET payslips (mount attempt) | **200** `HRM-PAY-200` |

## Network (payroll — partial)

| Method | URL pattern | Status |
|--------|-------------|--------|
| GET | `/api/hrm/payroll/payslips?company_id=main` | **200** |

No enroll/process POST captured — FE never reached detail view.

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-PAY-BATCHES-SHOWADD-TDZ** | **P0** | **dev-fe** | Move `showAddDialog` state above `usePaySheetTemplates` or use `useState` before hook |
| R-PAY-PERIOD-ROW-NAV | P1 | dev-fe | Downstream of TDZ — retest after fix |
| R-PAY-ATT-AUG-NO-CLOSE | P2 | qa/pm | Aug month has 0 closed sheet — use Jan or FE att-close before Aug W3 |

## Not promoted

- J-HRM-07 browser W3 UF
- `payroll_e2e_ready=true`
- Formula LIVE / module payroll UAT
- L1 slices re-open (ATT/CB/payslip GET remain GWC)

## completion_report

- **Closed:** L0 PASS · U65 browser harness executed (Aug + Jan) · evidence + machine JSON · API Jan eligibility corroboration.
- **FAIL:** P0 `PayrollBatchesTab` TDZ prevents calc-list render — entire W3 chain blocked before enroll/process/payslip UI.
- **Open:** Fix FE → QA retest full chain (Jan 2026: att closed + eligible 53 → enroll → Khóa/process → phiếu+dòng → F5).
- **Honesty:** `payroll_e2e_ready=false` locked.

## next_owner

**dev-fe** (P0 TDZ fix) → **qa** retest W3

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SHOWADD-TDZ-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
parent: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01.md
- apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx L191-203

entry_criteria: QA FAIL R-PAY-BATCHES-SHOWADD-TDZ — ReferenceError on payroll calc-list load
exit_criteria:
- Reorder state: declare showAddDialog useState BEFORE usePaySheetTemplates({ enabled: showAddDialog })
- /hr/payroll → Tính lương → Danh sách renders pay-batches-precision without console ReferenceError
- pay-batch-add-emp-btn reachable on draft period row click (Jan 2026 period dffbb1fe…)
- ack_status: READY_FOR_QA
- evidence_path: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-fe-showadd-tdz-01.md

must_keep: usePaySheetTemplates lazy load on dialog open only
forbidden_paths: unrelated payroll formula engine / seed
```

## ack_status

**`FAIL_TO_PM`**
