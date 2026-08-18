# Evidence — `PO-HRM-AMIS-PARITY-PAY-ESS-FE-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-ESS-FE-02` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution — FE-only ESS scope fix (L1 SEAL) |
| **date** | 2026-08-07 |
| **priority** | P1 |
| **parent** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-ESS-QA-02` `FAIL_TO_PM` (stamp `PAYESSQA2-IYX8SJ`) |
| **defect** | **`D-PAY-ESS-FE-SCOPE-COERCE`** — **CLOSED** (FE) |
| **ack_status** | **`READY_FOR_QA`** |
| **spec_ref** | API_DESIGN **F-PAY-PAYSLIP-01** · SRS **FR-UC-BP-PAY-08** · QA `po-hrm-amis-parity-pay-ess-qa-02.md` |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll?portal=1` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** flip |
| **AMIS DONE / J-HRM-07 / module UAT** | **DENIED** | Scope coerce fix only |
| **Seed** | **DENIED** | U65 — keep pending slip `e1ac365a-…` |
| **L1 API contract** | **SEALED** | No BE rewrite |
| **Invent rows for CEO** | **DENIED** | CEO still 403 ESS |

---

## Root cause (QA proven) → fix

| Layer | Before (FAIL) | After (FE-02) |
|-------|---------------|---------------|
| JWT `uat.nv0001` | `companyId=holding` | unchanged |
| AuthContext list coerce | `holding` → `main` (rollup) | unchanged for admin lists |
| `useMyEssPayslips` | `coerceHrmListCompanyId` → `main` | **`resolveEssPayslipCompanyId`** prefers JWT via **`normalizeHrmApiListCompanyId`** → **`holding`** |
| `listMyPayslips` query | `company_id=main` → **409** | `company_id=holding` + `x-company-id=holding` |
| CEO JWT `main` | `company_id=main` → **403** ESS | JWT preferred → still **`main`** (must_keep) |

---

## Files changed

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/essPayslipUi.ts` | ADD `resolveEssPayslipCompanyId` · `shouldShowEssOwnOnlyHint` |
| `apps/web/hrm/src/lib/essPayslipUi.test.ts` | +2 vitest (holding preserve · 409 hint hide) |
| `apps/web/hrm/src/lib/hrmSpreadsheetScope.ts` | ADD `getPortalJwtEssCompanyId` (holding + main) |
| `apps/web/hrm/src/lib/hrmSpreadsheetScope.test.ts` | +2 vitest ESS JWT |
| `apps/web/hrm/src/hooks/useMyEssPayslips.ts` | Stop `coerceHrmListCompanyId`; JWT → query → auth |
| `apps/web/hrm/src/integrations/hrmApi.ts` | ESS list/get/confirm: normalize + aligned `x-company-id` scope |
| `apps/web/hrm/src/components/payroll/EssPayslipsPanel.tsx` | Hide CEO-403 hint on scope mismatch |

### must_keep verified (code)

- No `coerceHrmListCompanyId` on ESS `me/payslips*` path
- CEO JWT `main` → query `main` (403 `HRM-PAY-403-ESS`, no invent rows)
- L1 ESS APIs SEALED · `payroll_e2e_ready=false` · no seed

---

## Unit evidence

```text
pnpm exec vitest run src/lib/essPayslipUi.test.ts src/lib/hrmSpreadsheetScope.test.ts src/lib/hrmListScope.test.ts
→ Test Files: 3 passed · Tests: 20 passed
```

---

## QA retest click path (same AC1–AC5)

**Persona happy:** `uat.nv0001@xe.vn` / `xevn-uat-2026` · JWT `companyId=holding`  
**URL:** portal → HRM → **Tiền lương** → tab **Phiếu của tôi** (`hdsd-pay-ess-tab`)

| AC | Expect |
|----|--------|
| **AC1** | Network **GET** `…/me/payslips?company_id=**holding**` → **200** · rows ≥1 (pending `e1ac365a` if still open) |
| **AC2** | Open detail → **GET** by id **200** · `ess_confirmed` present |
| **AC3** | Confirm CTA → **POST** 2xx `HRM-PAY-204-ESS` · badge Đã xác nhận |
| **AC4** | F5 → still confirmed · CTA hidden |
| **AC5** | `ceo@xe.vn` → **GET** `company_id=main` → **403** `HRM-PAY-403-ESS` · 0 rows · honest banner |

**cấm:** seed · flip `payroll_e2e_ready` · claim AMIS DONE / J-HRM-07 / module UAT

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| Browser UF AC1–AC5 retest | P1 | `qa` | **OPEN** | This handoff → QA-02 retest |
| AuthContext holding→main for non-ESS lists | — | — | **KEEP** | Intentional group rollup; ESS bypasses via JWT |
| `payroll_e2e_ready` | honesty | `pm` | **LOCKED false** | |
| AMIS / J-HRM-07 / module UAT | — | — | **DENIED** | |

---

## completion_report

### Closed
1. Fixed `D-PAY-ESS-FE-SCOPE-COERCE`: ESS sends `company_id=holding` for holding JWT (normalize + JWT claim), not coerce→main.  
2. Aligned ESS `x-company-id` header with query company_id.  
3. CEO path keeps `main` → 403 ESS messaging; 409 no longer shows CEO-403 hint.  
4. Vitest **20/20 PASS** (ess + spreadsheet scope + list scope).  
5. L1 SEAL / honesty locks retained.

### Residual
- QA must re-run U65 browser `PO-HRM-AMIS-PARITY-PAY-ESS-QA-02` AC1–AC5 (zero-seed).

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-ess-fe-02.md` |
| **ack_status** | **`READY_FOR_QA`** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-ESS-QA-02
from_role: pm
to_role: qa
lane: execution
priority: P1
parent: PO-HRM-CONTINUOUS-W7-20260807
prior: PO-HRM-AMIS-PARITY-PAY-ESS-FE-02 READY_FOR_QA
closes_defect: D-PAY-ESS-FE-SCOPE-COERCE
retest_of: PAYESSQA2-IYX8SJ

## Mission
U65 browser-only retest ESS payslip confirm (zero-seed · no API-only PASS) — same AC1–AC5:

Persona happy: uat.nv0001@xe.vn / xevn-uat-2026 (JWT companyId=holding)
URL: portal → HRM → Tiền lương → tab Phiếu của tôi (hdsd-pay-ess-tab)

AC1 GET me/payslips?company_id=holding → 200 · list rows (NOT company_id=main / NOT 409)
AC2 open detail GET me/payslips/:id 200 · ess_confirmed present
AC3 POST confirm (hdsd-pay-ess-confirm) 2xx HRM-PAY-204-ESS · FE badge Đã xác nhận
AC4 F5 → still confirmed · CTA hidden
AC5 ceo@xe.vn same tab → GET 403 HRM-PAY-403-ESS · honest banner (no invent rows)

entry_criteria: FE-02 evidence READY; L0 stack; U65; payroll_e2e_ready=false; L1 SEAL
exit_criteria: evidence MD + Network proof company_id=holding on AC1; ack PASS_TO_PM or FAIL_TO_PM
cấm: seed · flip payroll_e2e_ready · claim AMIS DONE / J-HRM-07 / module UAT
evidence: docs/qa/evidence/po-hrm-amis-parity-pay-ess-qa-02.md (append retest stamp)
fe_ref: docs/qa/evidence/po-hrm-amis-parity-pay-ess-fe-02.md
```
