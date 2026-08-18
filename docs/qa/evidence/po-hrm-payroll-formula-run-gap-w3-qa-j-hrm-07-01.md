# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01

> **Latest (R2 2026-08-07):** `ack_status=PASS_TO_PM` · stamp `PAYW3J07-R2-MSIRLK3I` · residual **R-PAY-BATCHES-SHOWADD-TDZ CLOSED** · honesty `payroll_e2e_ready=false` · full W3 mutate enroll→process **not promoted** (Jan period already closed). R1 FAIL history retained below.

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status (latest)** | **`PASS_TO_PM`** (R2) — R1 was `FAIL_TO_PM` |
| **verdict (latest)** | **PASS** TDZ retest · **PARTIAL** enroll→process (data-blocked Jan) |
| **date** | 2026-08-07 |
| **persona / URL** | `ceo@xe.vn` / `Xevn@2026` · http://127.0.0.1:5173/hr/payroll · `company_id=main` |
| **U65** | zero-seed · browser-only · cấm seed |
| **honesty** | `payroll_e2e_ready=false` · formula LIVE **DENIED** · module UAT **DENIED** |
| **journey_l25** | **J-HRM-07** — Lương → phiếu lương + dòng thành phần (browser) |
| **parent** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SHOWADD-TDZ-01` (R2) · program `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **stamp** | R2 `PAYW3J07-R2-MSIRLK3I` · R1 `PAYW3J07-MSIR59EJ` / `PAYW3J07-MSIR45HS` |
| **machine** | R2 `docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-r2-browser.json` · R1 `_tmp-…-browser.json` |
| **screenshots R2** | `docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-r2/` |
| **prior QC baselines** | ATT-LINE-03 GWC · CB-BAG GWC · PAYSLIP-LINES-GET GWC · PAY-TPL-02 GWC — **RETAINED · do not reopen L1 alone** |

---

## Round R1 — FAIL history (retained)

| Field | Value |
|-------|-------|
| **ack_status** | **`FAIL_TO_PM`** |
| **verdict** | **FAIL** — P0 FE crash blocks entire J-HRM-07 W3 browser chain |
| **stamp** | `PAYW3J07-MSIR59EJ` (Jan retest) · prior `PAYW3J07-MSIR45HS` (Aug) |
| **machine** | `docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-browser.json` |

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

## ack_status (R1)

**`FAIL_TO_PM`**

---

## Round R2 — 2026-08-07 (after FE-SHOWADD-TDZ)

| Field | Value |
|-------|-------|
| **parent** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SHOWADD-TDZ-01` `READY_FOR_QA` |
| **stamp** | `PAYW3J07-R2-MSIRLK3I` |
| **machine** | `docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-r2-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-r2/` |
| **ack_status** | **`PASS_TO_PM`** |
| **honesty** | `payroll_e2e_ready=false` (locked) |

### L0 / FE-BE

| Check | Result |
|-------|--------|
| `qc:dev-stack` | hrm/xbos/portal **200** (portal briefly restarted mid-wave after REFUSED) |
| `qc:fe-be-health` | **ALL PASS** (pre-R2) |
| Seed | **none** (U65) |

### Mission assertions

| # | Assertion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | NO `showAddDialog` ReferenceError | **PASS** | `pageErrors=[]` · `tdzErrors=[]` · console clean of TDZ |
| 2 | `pay-batches-precision` renders | **PASS** | screen `01-pay-list.png` · criteria.payroll_load=PASS |
| 3 | «Lập bảng lương» reachable | **PASS** | dialog `pay-batch-create-dialog-precision` opens · templates GET `HRM-PAY-TPL-200` · screen `02-create-dialog.png` |
| 4 | Jan ATT closed + eligibility | **PASS** (API) | closedJanCount=1 · eligible_count=**53** · period `dffbb1fe…` |
| 5 | Jan enroll → process | **BLOCKED** | period status **`closed`/`Đã khóa`** · `pay-batch-add-emp-btn` **hidden** (correct) · cannot mutate closed period without reopen |
| 6 | Jan payslip / lines UI | **PASS** (slice) | detail open · table 1 row UAT-0100 · component cols present · amounts **0 ₫** · API processed payslip=1 · lines total=0 |
| 7 | Sep alternate process (53 already enrolled) | **PARTIAL / NOT CONFIRMED** | detail shows 53 NV · Khóa confirm dialog reached (`15-sep-after-process.png`) · harness timeout on F5 re-filter — **no proven process POST 2xx** this stamp |

### UF / J-HRM-07 matrix (R2)

| Step | Result | Notes |
|------|--------|-------|
| ATT prerequisite Jan | **PASS** | closed sheet same month |
| P-CC-08 load | **PASS** | TDZ cleared vs R1 FAIL |
| Lập bảng lương dialog | **PASS** | reachable |
| Enroll NV Jan | **BLOCKED** | period already closed |
| Process Jan | **NOT RUN** | blocked by closed |
| Payslip/lines UI Jan | **PASS** | locked batch detail + API corroboration |
| F5 Jan | **NOT RUN** | mutate chain blocked |
| Honesty payroll_e2e_ready | **false** | mandatory |

### Acceptance criteria (R2)

| AC | Verdict | Notes |
|----|---------|-------|
| AC-W3-TDZ (R2 primary) | **PASS** | residual R-PAY-BATCHES-SHOWADD-TDZ **CLOSED** |
| AC-W3-01 ATT closed same month | **PASS** | Jan |
| AC-W3-02 Period create/open | **PARTIAL** | Jan existing closed period opened; new Jan create N/A (overlap) |
| AC-W3-03 Enroll browser 2xx | **BLOCKED** | Jan closed · Sep add-dialog all «Không thuộc phạm vi công ty» (53 already on batch) |
| AC-W3-04 Process browser 2xx | **NOT PROVEN** | confirm UI reached Sep; POST 2xx not captured |
| AC-W3-05 Payslip + lines on UI | **PASS** (Jan locked view) | 0 ₫ honesty — formula LIVE DENIED |
| AC-W3-06 F5 persistence | **NOT RUN** | |
| Honesty | **false** | |

### FE click path (R2)

1. **R2-P0** — Login inject → `/hr/payroll`
2. **R2-P0b** — menu Danh sách bảng lương
3. **R2-create** — Lập bảng lương → dialog OK → Escape
4. **R2-filter** — `pay-batch-period-option-1-2026`
5. **R2-open** — `pay-batch-row-dffbb1fe` → locked detail + lines table
6. **R2-filter** — Sep `7` then Sep draft `9a5ec612` / Sep `d92d3bbb` explore enroll/process

### Console / page errors (R2)

- none P0 · **no** `showAddDialog` TDZ

### Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-PAY-BATCHES-SHOWADD-TDZ** | — | — | **CLOSED** by FE-SHOWADD-TDZ-01 · R2 verified |
| **R-PAY-JAN-PERIOD-ALREADY-CLOSED** | P2 | qa/pm | Jan `dffbb1fe` already closed + 1 processed payslip — enroll/process mutate N/A without reopen/new month draft with ATT closed |
| **R-PAY-W3-PROCESS-POST-UNPROVEN** | P1 | qa | Sep Khóa confirm shown; need retest capture POST `/process` 2xx + F5 (portal flap mid-wave) |
| R-PAY-ATT-AUG-NO-CLOSE | P2 | qa/pm | retained from R1 — Aug still 0 closed |

### Not promoted

- Full W3 browser enroll→process→F5 mutate chain as module DoD
- `payroll_e2e_ready=true`
- Formula LIVE / payroll module UAT
- Claiming non-zero payslip amounts (0 ₫ observed)

### completion_report

- **Closed:** R1 P0 TDZ retest — **PASS**; `pay-batches-precision` + Lập bảng lương dialog; Jan ATT+elig API; Jan locked payslip/lines UI visible; U65 zero-seed; R1 FAIL history retained.
- **Open / residual:** Jan enroll→process blocked by closed period; Sep process POST 2xx not proven this stamp (`R-PAY-W3-PROCESS-POST-UNPROVEN`).
- **Honesty:** `payroll_e2e_ready=false` · slice ≠ module UAT.

### next_owner

**qc**

### next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-W3-J-HRM-07-01
from_role: pm
to_role: qc
lane: governance
priority: P1
parent: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01.md (R2 PASS_TO_PM + R1 FAIL retained)
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-fe-showadd-tdz-01.md
- docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01-r2-browser.json

entry_criteria: QA R2 PASS_TO_PM — TDZ cleared; pay-batches-precision; Lập bảng reachable; Jan payslip UI on locked period
exit_criteria:
- GWC audit R2 evidence honesty
- retain payroll_e2e_ready=false · C-SLICE-≠-MODULE
- condition or waive R-PAY-W3-PROCESS-POST-UNPROVEN (P1) + R-PAY-JAN-PERIOD-ALREADY-CLOSED (P2)
- ack_status GO WITH CONDITIONS or NO-GO with residual owner
- evidence_path: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-w3-j-hrm-07-01.md
```

### ack_status (R2 / latest)

**`PASS_TO_PM`**
