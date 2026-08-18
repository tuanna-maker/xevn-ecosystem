# Evidence — `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-01` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-01` READY_FOR_QA |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` · BA §2.1 step7 Chi trả |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **L1 API U65** (FE wire button OOS per BE residual) |
| **date** | 2026-08-07 |
| **priority** | P2 |
| **ack_status** | **`FAIL_TO_PM`** |
| **verdict** | **FAIL** — wire spine blocked by live SQL `e.department` |
| **artifact_json** | [`_tmp-po-hrm-amis-parity-pay-payment-wire-qa-01.FINAL.json`](./_tmp-po-hrm-amis-parity-pay-payment-wire-qa-01.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-payment-wire-qa-01.mjs` |
| **stamp** | `PAYWIRE-MSIRGZEZ` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | Slice ≠ module UAT · **DENIED** flip |
| **AMIS parity DONE** | **DENIED** | Step7 wire not LIVE on product API |
| **Seed** | **DENIED** | U65 zero-seed · used existing processed periods only |
| **Browser UF Chi trả** | **DENIED / OOS** | BE residual: FE wire button not in scope |

---

## Environment

| Check | Result |
|-------|--------|
| L0 HRM `:28001/api/hrm` | **200** |
| L0 XBOS `:28002/api/xbos` | **200** |
| L0 portal `:5173` | **200** (`:5175`/`:8088` down — L1 API via portal proxy login OK) |
| Dist wire route | `dist/payroll/payroll.controller.js` has `wire-payment-batch` · catalog `LastWriteTime` 2026-08-07 16:39 |
| Unauth probe | `POST …/wire-payment-batch` → **401** `HRM-AUTH-001` (route live, not 404) |
| Auth | Portal `POST /api/xbos/auth/login` · Bearer · `x-tenant-id=xevn` · `x-company-id=main` |
| Account | `ceo@xe.vn` / `Xevn@2026` (JWT `sub=ceo@xe.vn`) |
| Fixture period | `38674cc1-…` · `QA-CB-BAG-VARS2 PAYFECB-MSII9VYY` · `status=processed` · 1 payslip `processed` · persist `company_id=holding` |
| Jest (unit) | `wirePaymentBatchFromPeriod` **2 passed** (mock) — **does not catch live schema** |

---

## AC matrix (L1 exit criteria)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **1** Processed → POST wire → **201** `HRM-PAY-WIRE-201` · records = processed payslips | Wire creates/reuses batch + payment_records | **500** `HRM-SYS-001` `column e.department does not exist` (both eligible processed periods) | **FAIL** |
| **2** Re-wire idempotent (`records_skipped>0`, no dup `payroll_record_id`) | Second POST skip | Same **500** — cannot exercise | **FAIL** |
| **3** POST `payment-batches/:id/process` → payslips `paid` | `HRM-PB-202` + payslip status paid | **BLOCKED** — no `batchId` | **BLOCKED** |
| **4** Close before pay → `HRM-PAY-005` | Unpaid gate | **412** `HRM-PAY-005` · `unpaid_payslip_count=1` · `payroll_e2e_ready=false` | **PASS** |
| **5** Close after all paid → `HRM-PAY-203` | Period `closed` | **BLOCKED** — process not reached | **BLOCKED** |
| **Neg** Draft wire | `HRM-PAY-WIRE-409` | Draft `5f739175-…` → **409** `HRM-PAY-WIRE-409` | **PASS** (supporting) |
| **Honesty** | no ready / no seed / no UAT claim | Held | **PASS** |

---

## Defect (P0 for step7 spine)

| ID | Severity | Layer | Detail |
|----|----------|-------|--------|
| **R-PAY-WIRE-DEPT-COL** | **P0** | `dev-be` | `wirePaymentBatchFromPeriod` SQL `LEFT JOIN employees e` selects **`e.department`** but live `public.employees` has **no** `department` column (directory uses display/`custom_fields` — see `employee-directory.ts` `readDepartment`). Blocks all wire 201 paths. |

**spec says / code does:** BA step7 + BE handoff require wire 201 from processed payslips. Code path exists and unit-mocked PASS; **product API 500** on join.

**Reproduce (U65):**

```http
POST /api/hrm/payroll/periods/38674cc1-2e7e-43a7-a244-8d30e069208b/wire-payment-batch?company_id=main
Authorization: Bearer <ceo@xe.vn>
{"company_id":"main"}
→ 500 HRM-SYS-001 column e.department does not exist
```

Also confirmed on `d8a3c74f-…` (05/2026 UAT-MOB-PILOT).

---

## Residual / not promoted

| ID | Item | Owner |
|----|------|-------|
| **R-PAY-WIRE-DEPT-COL** | Fix wire SELECT department (null / custom_fields / display join) + live retest | **dev-be** |
| R-PAY-WIRE-IDEMP | Re-wire idempotent after fix | qa |
| R-PAY-WIRE-PROCESS-CLOSE | process → paid → close 203 chain | qa |
| R-PAY-WIRE-FE | FE Chi trả wire button | dev-fe (later) |
| — | `payroll_e2e_ready=true` / module UAT / AMIS parity DONE | **DENIED** |

### Explicit non-claims

- Did **not** claim AMIS step7 / payroll e2e ready.
- Did **not** seed / mutate DB outside product APIs.
- Did **not** run browser Chi trả UF (FE wire OOS).
- Jest green ≠ product PASS.

---

## completion_report

### Closed

1. L0 + live-dist route probe (401) + persona login.  
2. Located eligible processed periods with processed payslips (U65, no seed).  
3. **AC4 PASS** — close before pay → `HRM-PAY-005`.  
4. Draft → `HRM-PAY-WIRE-409` confirmed.  
5. Root-caused wire **500** to missing `employees.department` column.

### Residual / open

- **AC1/AC2 FAIL**, **AC3/AC5 BLOCKED** until BE fixes department join.  
- Honesty `payroll_e2e_ready=false` retained.

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **dev-be** (then qa retest) |
| **ack_status** | **FAIL_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qa-01.md` |
| **payroll_e2e_ready** | **false** |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-02
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-01
priority: P0

## Mission
Fix live wire-payment-batch 500 — column e.department does not exist.

## read_first
- docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qa-01.md (R-PAY-WIRE-DEPT-COL)
- apps/api/hrm-api/src/payroll/payroll-catalog.service.ts wirePaymentBatchFromPeriod JOIN
- apps/api/hrm-api/src/employees/employee-directory.ts readDepartment

## entry_criteria
- QA FAIL stamp PAYWIRE-MSIRGZEZ · POST wire 500 HRM-SYS-001

## exit_criteria
- POST …/periods/:id/wire-payment-batch on processed period → 201 HRM-PAY-WIRE-201
- department field null-safe (no invent column) OR resolve via existing display/custom_fields pattern
- Jest updated for schema reality; no silent 0 records
- READY_FOR_QA → retest PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-02
- payroll_e2e_ready=false

## cấm
seed · claim module UAT · overwrite close gate HRM-PAY-005
```
