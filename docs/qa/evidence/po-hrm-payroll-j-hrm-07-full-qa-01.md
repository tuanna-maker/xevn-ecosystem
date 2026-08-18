# Evidence — `PO-HRM-PAYROLL-J-HRM-07-FULL-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-J-HRM-07-FULL-QA-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | execution — **full browser U65 J-HRM-07 spine** (ATT → period bind → enroll → process → cards/payslip) — **not** slice-only |
| **priority** | P0 |
| **parent** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **program** | `PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01` |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll` · HRM `:28001` · XBOS `:28002` · portal `:5173` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **journey_l25** | **J-HRM-07** — full spine browser prove |
| **stamp** | **`PAYJ07FULL-MSIYSHHY`** |
| **machine** | [`_tmp-po-hrm-payroll-j-hrm-07-full-qa-01.json`](_tmp-po-hrm-payroll-j-hrm-07-full-qa-01.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-payroll-j-hrm-07-full-qa-01/` (`01`…`15`) |
| **harness** | `scripts/qa/_tmp-po-hrm-payroll-j-hrm-07-full-qa-01.mjs` |
| **U65** | zero-seed · browser-only · **no** `pnpm seed:*` |
| **Verdict** | **PASS** — full spine on fresh Feb/2027 draft (**≠** `d92d3bbb`) |
| **ack_status** | **`PASS_TO_PM`** |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | **LOCKED** in process body + warnings `PAYROLL_E2E_READY_FALSE` · **QA seat must not invent flip** |
| **Formula LIVE / customer UAT** | **DENIED** | Non-zero line/cards observed — **no** AC promote to LIVE |
| **J-HRM-07 DONE / e2e-ready** | **DENIED** | Full spine PASS this seat ≠ flag flip / program DONE (QC decides GWC vs residual) |
| **Module payroll UAT / AMIS DONE** | **DENIED** | Explicit |
| **Seed** | **DENIED** | U65 |
| **Prior process-post / period-bind / summary-cards GWC** | **RETAINED** | **must_keep · not demoted** |

---

## Executive summary

U65 **full** browser J-HRM-07 spine (not slice-only) on **fresh** period **`95d0a627`** · month **2/2027** — **NOT** processed Sep `d92d3bbb`. Path: Settings active mẫu → FE **create ATT** `f76649bc` → EMP/DM/HR sign → **Chốt** closed → **Lập bảng lương** POST **201** `HRM-PAY-201` with `paySheetTemplateId` + snapshot → enroll **UAT-0100** POST **201** → **Khóa** POST **201** `HRM-PAY-202` · `payroll_e2e_ready=false` · period **processed** → header cards Gross/Net **12.345.000 ₫** (`data-totals-source=line_aggregate` after F5) + payslip line **12.345.000 ₫** · F5 persist. First attempt `PAYJ07FULL-MSIYP9VH` (Jan/2027) proved ATT+period create then harness filter timeout — fixed and re-ran full spine. **DENY** ready flip / module UAT / J-HRM-07 DONE invent.

---

## Command table

| Command / check | Result | Exit / note |
|-----------------|--------|-------------|
| `pnpm run qc:dev-stack` | hrm/xbos/portal **200** | L0 (UV assertion noise on Windows exit ≠ health) |
| `pnpm run qc:fe-be-health` | **ALL PASS** | PASS |
| `node scripts/qa/_tmp-po-hrm-payroll-j-hrm-07-full-qa-01.mjs` | stamp **`PAYJ07FULL-MSIYSHHY`** | exit **0** |
| Prior attempt `PAYJ07FULL-MSIYP9VH` | ATT+period create PASS · filter timeout | superseded by MSIYSHHY |
| Seed | none | U65 |

---

## Target selection (fresh draft)

| Criterion | Result |
|-----------|--------|
| NOT `d92d3bbb` | **PASS** — period `95d0a627-8031-4004-8ef3-b1ffe92b9957` |
| Fresh create ATT + period same month | **PASS** — Feb **2027** · sheet `f76649bc` · period `95d0a627` |
| Template bind on create | **PASS** — `paySheetTemplateId=38d61fda…` · snapshot `Mẫu J07 PAYJ07FULL-MSIYSHHY` |
| Reuse prior processed Aug `cf38deac` / Sep `d92d3bbb` | **DENIED** as proof target |

---

## UF / J-HRM-07 full spine matrix

| Step | Click path | Verdict | Evidence |
|------|------------|---------|----------|
| L0 / TDZ | load calc-list | **PASS** | `tdzErrors=[]` |
| Settings active mẫu | Settings → pay-sheet-tpl → create active | **PASS** | `01-settings-tpl.png` · `tpl_active=PASS` |
| ATT create | Sheets → Thêm → Lưu | **PASS** | POST **201** `HRM-AS-201` · `02`…`04` |
| ATT submit + sign | Submit → EMP → DM → HR | **PASS** | `05`/`06` · `can_close=true` |
| ATT close | Chốt | **PASS** | close enabled · sheet **closed** · `07` |
| Create period + tpl bind | Lập bảng lương → month/year → mẫu → Lưu | **PASS** | POST **201** `HRM-PAY-201` · `08`/`09` |
| Open fresh draft | filter 2/2027 → row | **PASS** | `10-detail-before-enroll.png` |
| Enroll ≥1 | Thêm NV → UAT-0100 → Thêm | **PASS** | enroll POST **201** · `11`/`12` |
| Process | Khóa → confirm | **PASS** | POST **201** `HRM-PAY-202` · `13`/`14` |
| Header cards | Gross/Net visible | **PASS** | after process **12.345.000 ₫** · source `period` then F5 `line_aggregate` |
| Payslip/lines UI | table row | **PASS** | UAT-0100 · **12.345.000 ₫** |
| F5 | reload → re-open | **PASS** | `15-after-f5.png` · cards+line persist |
| Honesty | ready / LIVE / DONE | **LOCKED false / DENIED** | process `payroll_e2e_ready=false` |

---

## Acceptance criteria

| AC | Verdict | Notes |
|----|---------|-------|
| AC-ATT create + sign + close (same month as period) | **PASS** | Feb/2027 · sheet closed |
| AC-Period create with `paySheetTemplateId` bind | **PASS** | 201 + snapshot name |
| AC-Fresh draft ≠ `d92d3bbb` | **PASS** | `95d0a627` |
| AC-Enroll browser ≥1 | **PASS** | `UAT-0100` · 201 |
| AC-Process POST **2xx** Network + machine | **PASS** | **201** `HRM-PAY-202` |
| AC-Header cards Gross/Net visible non-zero | **PASS** | **12.345.000 ₫** · F5 `line_aggregate` |
| AC-Payslip/lines UI after process + F5 | **PASS** | row + non-zero |
| Honesty `payroll_e2e_ready=false` | **PASS** | body + warnings · no flip |
| must_keep prior GWC (process-post / bind / cards) | **PASS** | not demoted |
| DENY J-HRM-07 DONE / module UAT / AMIS invent | **PASS** | locked |

---

## Network (mutate)

| Method | URL | Status | Code |
|--------|-----|--------|------|
| **POST** | `/api/hrm/attendance/attendance-sheets` | **201** | `HRM-AS-201` |
| **POST** | `/api/hrm/attendance/attendance-sheets/{id}/signatures` (×3 roles) | **2xx** | (sign chain) |
| **POST** | `/api/hrm/attendance/attendance-sheets/{id}/close` | **2xx** | close |
| **POST** | `/api/hrm/payroll/pay-sheet-templates` | **201** | active mẫu |
| **POST** | `/api/hrm/payroll/periods` | **201** | **`HRM-PAY-201`** + `paySheetTemplateId` |
| **POST** | `/api/hrm/payroll/periods/95d0a627-…/enroll` | **201** | `HRM-PAY-ENROLL-200` |
| **POST** | `/api/hrm/payroll/periods/95d0a627-…/process` | **201** | **`HRM-PAY-202`** |

### Process success excerpt

```json
{
  "code": "HRM-PAY-202",
  "status": "processed",
  "employee_count": 1,
  "payslip_summary": { "total_gross": 12345000, "total_net": 12345000 },
  "formula_bind": {
    "code": "qa_src02_ovr_srcsrc02isbdzw",
    "source": "company_active"
  },
  "warnings": ["SRC_RESOLVER_GD1", "PAYROLL_E2E_READY_FALSE"],
  "payroll_e2e_ready": false
}
```

---

## Cards / payslip (F5)

| Surface | After process | After F5 |
|---------|---------------|----------|
| Gross card | 12.345.000 ₫ · `data-totals-source=period` | 12.345.000 ₫ · **`line_aggregate`** |
| Net card | 12.345.000 ₫ | 12.345.000 ₫ |
| Emp count | 1 | 1 |
| Payslip line UAT-0100 | base/net 12.345.000 ₫ | same |

---

## must_keep prior GWC (do not demote)

| Prior seat | Stamp / verdict | This seat |
|------------|-----------------|-----------|
| W3 process-post QC | `PAYW3PROC2-MSIT867S` GWC | **RETAINED** |
| Period-bind QC | `PAYBINDQA2-IT9Y27` GWC | **RETAINED** |
| Summary-cards QC | `PAYW3SUMQA-MSIWD3MS` GWC | **RETAINED** (re-proven on fresh period) |

---

## OBS / residuals

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| `OBS-PAYSLIPS-LIST-GET-400` | idle-ok | Harness `GET /payroll/payslips?payroll_period_id=` returned **400** while UI lines + process body prove payslip; optional BE query DTO align | `dev-be` (optional) |
| `OBS-FIRST-ATTEMPT-FILTER` | closed | `PAYJ07FULL-MSIYP9VH` filter timeout after create — harness fixed; Jan/2027 draft `e2a7b234` left as unused draft | n/a |
| **Forced residual this seat** | **none** | Full spine PASS · honesty locked | — |

---

## Explicit DENY claims

- `payroll_e2e_ready=true` — **NO**
- Formula LIVE / customer UAT — **NO**
- J-HRM-07 DONE / e2e-ready program flag — **NO** (QC gate next)
- Module payroll UAT / AMIS DONE / Phase1 DONE — **NO**
- Seed in evidence — **NO**

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `qc` |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-j-hrm-07-full-qa-01.md` |
| **completion_report** | Closed: full U65 J-HRM-07 browser spine ATT create/sign/close → period template bind → enroll → process 201 → cards+payslip F5 on fresh `95d0a627` (≠ `d92d3bbb`). Honesty `payroll_e2e_ready=false` LOCKED. Prior slice GWC must_keep retained. Open: QC gate only — no invent ready flip. |
| **next_dispatch_prompt** | See below |

### `next_dispatch_prompt` (copy-ready → QC)

```text
work_item_id: PO-HRM-PAYROLL-J-HRM-07-FULL-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P0
parent: PO-HRM-CONTINUOUS-W7-20260807
program: PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01

Mission: QC gate full-spine QA stamp PAYJ07FULL-MSIYSHHY — ATT→period bind→enroll→process→cards/payslip on fresh period 95d0a627 (NOT d92d3bbb). Decide GWC vs residual. Honesty payroll_e2e_ready=false LOCKED — do NOT invent flip. must_keep prior process-post / period-bind / summary-cards GWC.

read_first:
- docs/qa/evidence/po-hrm-payroll-j-hrm-07-full-qa-01.md
- docs/qa/evidence/_tmp-po-hrm-payroll-j-hrm-07-full-qa-01.json
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md
- docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qc-02.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qc-summary-cards-01.md

exit: PASS_TO_PM with GO | GO WITH CONDITIONS | NO-GO
evidence: docs/qa/evidence/po-hrm-payroll-j-hrm-07-full-qc-01.md
cấm: seed · invent payroll_e2e_ready=true · claim module UAT / AMIS DONE / J-HRM-07 DONE without sponsor
```
