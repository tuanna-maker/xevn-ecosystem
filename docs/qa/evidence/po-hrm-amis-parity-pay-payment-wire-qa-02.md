# Evidence — `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-02` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-02` READY · R-PAY-WIRE-DEPT-COL fix |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-01` FAIL stamp `PAYWIRE-MSIRGZEZ` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **L1 API U65** (FE wire button OOS) |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** — wire spine AC1–AC5 after dept-col fix |
| **artifact_json** | [`_tmp-po-hrm-amis-parity-pay-payment-wire-qa-02.FINAL.json`](./_tmp-po-hrm-amis-parity-pay-payment-wire-qa-02.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-payment-wire-qa-02.mjs` |
| **stamp** | `PAYWIRE-MSIRV99D` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | Slice ≠ module UAT · **DENIED** flip |
| **AMIS parity DONE** | **DENIED** | Step7 L1 API PASS ≠ full AMIS / browser UF |
| **Seed** | **DENIED** | U65 zero-seed · fixture period from prior QA-CB-BAG |
| **Browser UF Chi trả** | **DENIED / OOS** | FE wire button residual |

---

## Environment

| Check | Result |
|-------|--------|
| L0 HRM `:28001/api/hrm` | **200** |
| L0 XBOS `:28002/api/xbos` | **200** |
| L0 portal `:5173` | **200** |
| Dist fix | `custom_fields->>'department'` present · **no** bare `e.department` · mtime 2026-08-07 16:52 |
| Unauth probe | `POST …/wire-payment-batch` → **401** `HRM-AUTH-001` |
| Auth | XBOS login · Bearer · `x-tenant-id=xevn` · `x-company-id=main` |
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Fixture period | `38674cc1-…` · `QA-CB-BAG-VARS2 PAYFECB-MSII9VYY` · `status=processed` → after AC5 **`closed`** |
| Batch | `aa4e704c-…` (created by BE-02 live smoke; QA-02 reused + process) |

---

## AC matrix (L1 exit criteria)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **1** Processed → POST wire → **201** `HRM-PAY-WIRE-201` (not 500 `e.department`) | Batch + records from processed payslips | **201** `HRM-PAY-WIRE-201` · `payslip_count=1` · `records_skipped=1` / `records_added=0` (idempotent reuse after BE-02 first-add) · `payroll_e2e_ready=false` · **no** dept column error | **PASS** |
| **2** Re-wire idempotent | `records_skipped>0`, `records_added=0`, same batch | **201** · `records_skipped=1` · `records_added=0` · same `aa4e704c-…` | **PASS** |
| **3** POST `payment-batches/:id/process` → payslips `paid` | `HRM-PB-202` | **201** `HRM-PB-202` · `processed_records=1` · payslips paid=1 / processed=0 | **PASS** |
| **4** Close before pay → `HRM-PAY-005` | Unpaid gate | **412** `HRM-PAY-005` · `unpaid_payslip_count=1` · `payroll_e2e_ready=false` | **PASS** |
| **5** Close after all paid → `HRM-PAY-203` | Period `closed` | **201** `HRM-PAY-203` · `status=closed` | **PASS** |
| **Honesty** | no ready / no seed / no UAT claim | Held | **PASS** |

### Defect closure

| ID | Prior | Retest |
|----|-------|--------|
| **R-PAY-WIRE-DEPT-COL** | QA-01 **500** `column e.department does not exist` | **CLOSED** — live wire 201; dist uses `NULLIF(TRIM(e.custom_fields->>'department'), '')` |

### Harness note (not product defect)

First process attempt with body `{ company_id, transaction_ref }` → **400** `HRM-VAL-001` `property company_id should not exist` (`ProcessPaymentDto` = `transaction_ref`/`notes` only; scope via query/header). Corrected harness → AC3/AC5 PASS. Not filed as product residual.

---

## Residual / not promoted

| ID | Item | Owner |
|----|------|-------|
| R-PAY-WIRE-FE | FE Chi trả wire button / browser UF | **dev-fe** (later) |
| — | Fresh first-add `records_added>0` on *new* period | Covered by BE-02 live smoke (`records_added=1`); QA-02 exercised skip path on same fixture |
| — | `payroll_e2e_ready=true` / module UAT / AMIS step7 DONE | **DENIED** |

### Explicit non-claims

- Did **not** claim AMIS step7 / payroll e2e ready / module UAT.
- Did **not** seed.
- Did **not** run browser Chi trả UF.
- L1 API PASS ≠ FE wire LIVE.

---

## completion_report

### Closed

1. L0 + dist dept-col fix probe + persona login.  
2. **AC1 PASS** — wire 201 `HRM-PAY-WIRE-201`, no `e.department` 500 (R-PAY-WIRE-DEPT-COL **CLOSED**).  
3. **AC2 PASS** — re-wire idempotent skip.  
4. **AC4 PASS** — close-before-pay `HRM-PAY-005`.  
5. **AC3 PASS** — process `HRM-PB-202` → payslip paid.  
6. **AC5 PASS** — close-after-paid `HRM-PAY-203` period closed.  
7. Honesty `payroll_e2e_ready=false` retained.

### Residual / open

- FE wire button (OOS).  
- Module UAT / ready flip **DENIED**.

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **qc** (GWC slice) then **pm** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qa-02.md` |
| **payroll_e2e_ready** | **false** |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-02
priority: P1

## Mission
QC gate L1 wire-payment-batch spine after R-PAY-WIRE-DEPT-COL CLOSED.

## read_first
- docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qa-02.md
- docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-be-02.md
- docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-payment-wire-qa-02.FINAL.json

## entry_criteria
- QA-02 PASS stamp PAYWIRE-MSIRV99D · AC1–AC5 PASS · payroll_e2e_ready=false

## exit_criteria
- GO WITH CONDITIONS (or GO) for L1 wire slice only
- CLOSE R-PAY-WIRE-DEPT-COL / R-PAY-WIRE-IDEMP / R-PAY-WIRE-PROCESS-CLOSE as L1
- Retain CONDITION: FE wire OOS · C-SLICE-≠-MODULE · DENY payroll_e2e_ready=true / AMIS DONE / browser UF
- evidence: docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qc-01.md

## cấm
flip payroll_e2e_ready · claim AMIS step7 DONE · claim module UAT
```
