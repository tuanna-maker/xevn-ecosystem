# Evidence — `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution — browser Chi trả → L1 wire API |
| **date** | 2026-08-07 |
| **priority** | P2 |
| **resume_chunk** | K6.4 |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QC-01` |
| **closes** | **R-PAY-WIRE-FE** (FE wire CTA) — **not** module UAT / AMIS Step7 DONE / J-HRM-07 |
| **ack_status** | **`READY_FOR_QA`** |
| **qc_ref** | [`po-hrm-amis-parity-pay-payment-wire-qc-01.md`](po-hrm-amis-parity-pay-payment-wire-qc-01.md) GWC · CONDITION R-PAY-WIRE-FE |
| **qa_ref** | [`po-hrm-amis-parity-pay-payment-wire-qa-02.md`](po-hrm-amis-parity-pay-payment-wire-qa-02.md) stamp `PAYWIRE-MSIRV99D` |
| **be_ref** | [`po-hrm-amis-parity-pay-payment-wire-be-02.md`](po-hrm-amis-parity-pay-payment-wire-be-02.md) |
| **spec_ref** | AMIS Step7 Chi trả · `POST /payroll/periods/:id/wire-payment-batch` · HDSD tab Chi trả (`SCR-TOP-PAYMENT`) |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** flip — FE wire ≠ module UAT |
| **AMIS Step7 DONE** | **DENIED** | Slice FE wire CTA only |
| **J-HRM-07 DONE** | **DENIED** | Not claimed |
| **Seed** | **DENIED** | U65 zero-seed |
| **Payment formulas on FE** | **DENIED** | Display-ready amounts from BE payslip net |

---

## Mission closed

Wire browser **Chi trả** button on Payroll → tab **Chi trả lương** to existing L1 API:

`POST /api/hrm/payroll/periods/:periodId/wire-payment-batch` → **201** `HRM-PAY-WIRE-201`

Then FE list refresh + auto-open batch detail (records from processed payslips). Process-all remains on existing `POST …/payment-batches/:id/process`.

L1 API spine **SEALED** — no BE rewrite.

---

## Files changed

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/wirePaymentBatchRequest.ts` | NEW — `buildWirePaymentBatchBody` (company_id **in body** per DTO) |
| `apps/web/hrm/src/lib/wirePaymentBatchRequest.test.ts` | NEW — 3 vitest |
| `apps/web/hrm/src/integrations/hrmApi.ts` | ADD `wirePaymentBatchFromPeriod` + CODE-MEMORY |
| `apps/web/hrm/src/hooks/usePaymentBatches.ts` | ADD `wireFromPeriod` mutation + invalidate |
| `apps/web/hrm/src/components/payroll/PaymentBatchesTab.tsx` | CTA **Chi trả** → wire dialog → POST → open detail |
| `apps/web/hrm/src/i18n/locales/vi.json` | Wire copy keys |
| `apps/web/hrm/src/i18n/locales/en.json` | Promote `payment` to top-level (was nested under `salary`) + wire keys |

### must_keep verified

- process → paid → close flow (FE process-all unchanged; BE close gate untouched)
- department custom_fields fix = BE sealed
- soft-delete pending batches retained
- no invent payment formulas on FE

---

## Click path (HDSD-aligned · U65)

**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**URL:** portal HRM embed → **Tiền lương** → top tab **Chi trả lương**

| Step | UI | Expect Network / FE |
|------|-----|---------------------|
| 1 | Tab **Chi trả lương** | GET `…/payment-batches?company_id=…` **200** |
| 2 | Click **Chi trả** (`hdsd-pay-wire-btn`) | Dialog `pay-payment-wire-dialog-precision` |
| 3 | Chọn **Kỳ lương đã xử lý** (`hdsd-pay-wire-period-select`) — only UI status `approved` (= API `processed`) | Picker lists processed periods only |
| 4 | (Optional) tên / hình thức | Body fields optional |
| 5 | Click **Chi trả** (`hdsd-pay-wire-submit`) | **POST** `…/payroll/periods/{periodId}/wire-payment-batch` · body `{ company_id, name?, payment_method? }` → **201** `HRM-PAY-WIRE-201` |
| 6 | FE sau 2xx | Toast success · list invalidate · **auto-open** batch detail · records table filled (or idempotent skip toast) |
| 7 | F5 → tab Chi trả → open same batch | Batch + records còn |
| 8 | (Optional) **Thanh toán tất cả** (`hdsd-pay-wire-process-all`) | **POST** `…/payment-batches/{id}/process` · body **no** `company_id` → **201** `HRM-PB-202` |

### Preconditions / honesty for QA

- Need ≥1 period with API status **`processed`** (UI badge approved). Closed (`locked`) periods are **excluded** from picker (would 409 `HRM-PAY-WIRE-409`).
- QA-02 fixture period was **closed** after AC5 — may need another processed period already on env (U65: **no seed**; if none → **BLOCKED** env / Path B process another period via FE first — still no seed).
- Empty picker → warning copy `noProcessedPeriods` — **not** invent rows.

### Network contract notes

| Call | Scope | Body |
|------|-------|------|
| Wire | JWT + body `company_id` (WirePaymentBatchDto) | Optional `name`, `payment_method`, `bank_name`, `require_ess_confirm` |
| Process batch | Query/header company — **not** body `company_id` | `{ notes? }` only |

---

## Unit evidence

```text
pnpm test -- src/lib/wirePaymentBatchRequest.test.ts
→ 3 passed
```

---

## Residual / not promoted

| ID | Status |
|----|--------|
| R-PAY-WIRE-FE | **CLOSED FE** — ready for browser QA |
| `payroll_e2e_ready=true` | **DENIED** |
| AMIS Step7 DONE / module payroll UAT / J-HRM-07 / Phase1 | **DENIED** |
| `C-SLICE-≠-MODULE` | Retained |

---

## completion_report

### Closed

1. FE client `wirePaymentBatchFromPeriod` aligned to L1 POST wire.  
2. Chi trả tab CTA + dialog → Network 2xx path + refresh/open detail.  
3. Vitest body builder PASS (company_id in body).  
4. Honesty `payroll_e2e_ready=false` retained; no formulas invent; U65.

### Residual

- Browser U65 QA must exercise click path (this seat unit-only).  
- Module UAT / AMIS DONE / J-HRM-07 still **DENIED**.

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **qa** |
| **ack_status** | **`READY_FOR_QA`** |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-fe-01.md` |
| **payroll_e2e_ready** | **false** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-03
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-FE-01
priority: P2
residual: R-PAY-WIRE-FE browser

## Mission
U65 browser retest Chi trả wire CTA after FE-01.

## read_first
- docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-fe-01.md
- docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qc-01.md

## entry_criteria
- FE-01 READY_FOR_QA · L0 stack up · U65 zero-seed
- ≥1 processed (not closed) payroll period in env OR BLOCKED honest if none

## exit_criteria
- Click path: Tiền lương → Chi trả lương → Chi trả (hdsd-pay-wire-btn) → chọn kỳ processed → submit
- Network POST …/periods/:id/wire-payment-batch → 201 HRM-PAY-WIRE-201 (or idempotent 201 skip)
- FE sau 2xx: list/detail records · F5 giữ batch
- Optional: Thanh toán tất cả → POST process 201 HRM-PB-202 (body no company_id)
- payroll_e2e_ready=false · DENY AMIS Step7 DONE / J-HRM-07 / module UAT
- evidence: docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qa-03.md

## cấm
seed · flip payroll_e2e_ready · claim AMIS DONE / J-HRM-07 / module UAT
```
