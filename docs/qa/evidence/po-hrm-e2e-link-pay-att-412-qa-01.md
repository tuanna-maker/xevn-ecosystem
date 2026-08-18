# Evidence — PO-HRM-E2E-LINK-PAY-ATT-412-QA-01

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-ATT-412-QA-01` |
| from_role | qa |
| to_role | pm |
| ack_status | **`PASS_TO_PM`** |
| verdict | **PASS** |
| date | 2026-08-06 |
| persona / URL | `ceo@xe.vn` / `Xevn@2026` · http://127.0.0.1:5173/hr · `company_id=main` |
| u65 | zero-seed · browser-only · cấm seed |
| honesty | `payroll_e2e_ready` **narrow** (prior AC-04∧05 + this ATT-412 browser) · **module UAT DENIED** · product GO **DENIED** |
| parent | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QC-01` GWC — CONDITION `R-PAY-HIRE-ATT-412-BROWSER` OPEN |
| prior_refs | [`po-hrm-e2e-link-pay-att-close-qc-01.md`](po-hrm-e2e-link-pay-att-close-qc-01.md) · [`po-hrm-e2e-link-pay-att-close-qa-03.md`](po-hrm-e2e-link-pay-att-close-qa-03.md) · hire ATT-412 API baseline |
| env | portal=http://127.0.0.1:5173 · hrm=http://127.0.0.1:28001 · xbos=http://127.0.0.1:28002 · commit=dc930c5 |
| period | `dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8` (Jan 2026) |
| machine | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-att-412-qa-01-browser.json` |
| screenshots | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-412-qa-01/` |
| harness | `scripts/qa/_tmp-po-hrm-e2e-link-pay-att-412-qa-01.mjs` |

## L0 stack

| Service | Status |
|---------|--------|
| hrm-api | 200 |
| xbos-api | 200 |
| portal | 200 (`:5173` — `:5175` not required; same as QA-03) |

`pnpm run qc:fe-be-health` → **ALL PASS**.

## Executive summary

U65 browser exercised **Khóa bảng lương** on Jan draft with closed attendance + enrolled **UAT-0100**. Path A deep-link → emp count=1 + Khóa visible → confirm dialog → **POST `/process` → 201 `HRM-PAY-202`** («Payroll period processed»). FE badge **Đã khóa**; Khóa btn gone; **F5** keeps **Đã khóa** + UAT-0100. Recommend **close** residual `R-PAY-HIRE-ATT-412-BROWSER`. **NOT** payroll module UAT / production GO.

Observed chain after Khóa: process **201** then POST `/close` → **201 `HRM-PAY-203`** (network; FE lock mutation calls `processPayrollPeriod` — close may be BE/follow-on; documented, not fail).

## UF / Journey

| ID | Click path | Result |
|----|------------|--------|
| **Path A** | `/hr/payroll?pay_period_month=1&pay_period_year=2026&pay_batch_id=dffbb1fe…` | **PASS** |
| **Pre-lock** | UAT-0100 · Số NV=1 · Khóa visible · badge Bản nháp | **PASS** |
| **ATT-412-BROWSER** | Khóa → dialog → confirm → POST process | **PASS** (201, not 412) |
| **FE after + F5** | Đã khóa · no Khóa btn · UAT-0100 persists | **PASS** |
| Optional negative (no closed sheet → 412) | NOT RUN | OBS — positive path sufficient; prior hire API 412 retained |

## FE click path

1. L0 PASS · login `ceo@xe.vn`
2. **Path A** deep-link Jan 2026 batch `dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8`
3. Assert row **UAT-0100**, count=1, button **Khóa bảng lương** (`01-path-a-detail.png`)
4. Click **Khóa bảng lương** → dialog title/confirm (`02-lock-dialog.png`)
5. Confirm **Khóa bảng lương**
6. Network POST process **201** · FE **Đã khóa** (`03-after-process.png`)
7. Navigate/F5 Path A again → **Đã khóa** + UAT-0100 (`04-after-f5.png`)

## Pre-lock state

```json
{
  "uatRow": true,
  "emptyHint": false,
  "empCount": 1,
  "empCountText": "Số nhân viên\n\n1",
  "lockVisible": true,
  "statusUi": "Bản nháp"
}
```

## Lock / process Network

| Field | Value |
|-------|-------|
| POST `/api/hrm/payroll/periods/dffbb1fe…/process` | **201** |
| code | `HRM-PAY-202` |
| message | Payroll period processed |
| body (snippet) | `status":"processed"` · `company_id":"holding"` · `processed_at":"2026-08-06T13:09:37.125Z"` |
| POST `/…/close` (follow-on observed) | **201** `HRM-PAY-203` Payroll period closed |
| ATT-412? | **No** — gate cleared with closed Jan att sheet |

```json
{
  "process": [
    {
      "method": "POST",
      "status": 201,
      "url": "http://127.0.0.1:5173/api/hrm/payroll/periods/dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8/process",
      "code": "HRM-PAY-202",
      "message": "Payroll period processed"
    }
  ],
  "processBody": "{}",
  "closeObserved": {
    "status": 201,
    "code": "HRM-PAY-203",
    "message": "Payroll period closed"
  }
}
```

## FE after mutate + F5 (sponsor AC)

| Checkpoint | Evidence |
|------------|----------|
| Trước Khóa | Bản nháp · UAT-0100 · Khóa visible · `01-path-a-detail.png` |
| Action | Khóa → confirm |
| Network | POST process **201** `HRM-PAY-202` |
| FE sau 2xx | Badge **Đã khóa** · Khóa btn **hidden** · success path · `03-after-process.png` |
| F5 | Path A reload · **Đã khóa** · UAT-0100 still present · Khóa still hidden · `04-after-f5.png` |

## Acceptance criteria

| AC / Check | Verdict | Notes |
|------------|---------|-------|
| L0 stack | **PASS** | HRM/XBOS/5173 200 · fe-be-health ALL PASS |
| Path A detail open | **PASS** | batch id in URL + detail surface |
| Emp row ≥1 + Khóa visible | **PASS** | UAT-0100 · count=1 |
| Click Khóa → confirm → POST process | **PASS** | dialog+confirm captured |
| Process **2xx** (closed att sheet) | **PASS** | **201** not 412 |
| FE after + F5 | **PASS** | Đã khóa persists |
| U65 zero-seed | **PASS** | no seed in path |
| Module UAT / prod GO | **DENIED** | honesty |

## Residual

| Id | Status | Sev | Owner | Note |
|----|--------|-----|-------|------|
| **R-PAY-HIRE-ATT-412-BROWSER** | **CLOSED** | P2 | qa → qc | Browser Khóa → process 201; recommend QC delta close CONDITION from QC-01 GWC |
| Payslip amounts 0 ₫ after process | **OBS** | P3 | ba/dev optional | Gross/Net 0 on UAT-0100 — out of ATT-412 scope; not module seal |
| Optional negative 412 without closed sheet | **DEFERRED** | P3 | qa | Prior hire API 412 proof retained |
| Portal `:5175` vs `:5173` | ENV OBS | P3 | devops | same as prior seats |

## not promoted

| Item | Reason |
|------|--------|
| Payroll **module** UAT-ready | `C-SLICE-≠-MODULE` |
| Production GO / product GO | Out of scope |
| Phase 1 DONE | Program gates open |
| Full hire-to-pay matrix stamp | ATT-412 browser residual only |
| Payslip formula / non-zero net | OBS only — not this seat |

**Promoted (narrow):**

| Item | Status |
|------|--------|
| Browser Khóa → process 2xx with closed att | 🟢 closes `R-PAY-HIRE-ATT-412-BROWSER` |
| FE Đã khóa + F5 | 🟢 |

## Screenshots

| File | Meaning |
|------|---------|
| `01-path-a-detail.png` | Draft 01/2026 · UAT-0100 · Khóa visible |
| `02-lock-dialog.png` | Confirm dialog |
| `03-after-process.png` | Đã khóa after process 201 |
| `04-after-f5.png` | F5 · Đã khóa + UAT-0100 |

## Commands

```bash
pnpm run qc:dev-stack
pnpm run qc:fe-be-health
node scripts/qa/_tmp-po-hrm-e2e-link-pay-att-412-qa-01.mjs
```

| Check | Result |
|-------|--------|
| L0 | PASS |
| Browser Khóa path | PASS (201 HRM-PAY-202) |
| Seed used | none |

## completion_report

- **Closed:** U65 browser Path A Jan draft → UAT-0100 enrolled → **Khóa bảng lương** → confirm → POST `/process` **201 `HRM-PAY-202`** → FE **Đã khóa** → F5 persist. Residual **`R-PAY-HIRE-ATT-412-BROWSER` CLOSED** (recommend QC delta vs att-close QC-01 GWC CONDITION).
- **Observed:** follow-on POST `/close` **201 `HRM-PAY-203`**; payslip amounts remain 0 ₫ (OBS P3, not ATT-412 fail).
- **NOT claimed / cấm:** payroll module UAT · recruitment_uat_ready · production GO · Phase 1 DONE.
- **Honesty:** `payroll_e2e_ready` remains **narrow** (AC-04∧05 + ATT-412 browser) — **≠** module UAT.

## next_owner

**qc**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-ATT-412-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-E2E-LINK-PAY-ATT-412-QA-01 PASS_TO_PM
residual_auto_fix: true
read_first:
  - docs/qa/evidence/po-hrm-e2e-link-pay-att-412-qa-01.md
  - docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qc-01.md (§ R-PAY-HIRE-ATT-412-BROWSER OPEN)
  - docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-att-412-qa-01-browser.json
entry: browser Khóa → POST process 201 HRM-PAY-202 on period dffbb1fe… (closed att + UAT-0100); FE Đã khóa + F5
exit: GWC/GO delta — close CONDITION R-PAY-HIRE-ATT-412-BROWSER; retain C-SLICE-≠-MODULE; cấm payroll module UAT / production GO
evidence_path: docs/qa/evidence/po-hrm-e2e-link-pay-att-412-qc-01.md
screens: docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-412-qa-01/
```

## ack_status

**PASS_TO_PM**
