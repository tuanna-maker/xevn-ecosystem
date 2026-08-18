# Evidence — `PO-HRM-AMIS-PARITY-PAY-ESS-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-ESS-QA-01` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-ESS-BE-01` READY_FOR_QA |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-ESS-BE-01` / `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **L1 API smoke only** (not browser UF · not mobile device · not module UAT) |
| **date** | 2026-08-07 |
| **priority** | P2 |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** — AC1–AC6 L1 ESS payslip |
| **artifact_json** | [`_tmp-po-hrm-amis-parity-pay-ess-qa-01.FINAL.json`](./_tmp-po-hrm-amis-parity-pay-ess-qa-01.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-ess-qa-01.mjs` |
| **stamp** | `PAYESS-MSIRE93Q` |
| **spec_ref** | API_DESIGN F-PAY-PAYSLIP-01 · SRS FR-UC-BP-PAY-08 · BE `po-hrm-amis-parity-pay-ess-be-01.md` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | ESS L1 slice ≠ process/pay LIVE |
| **AMIS parity DONE** | **DENIED** | Step6 GĐ1 API only |
| **Browser UF / J-HRM-07 / mobile UI** | **DENIED** | L1 API only |
| **Seed / `payroll_e2e_ready` flip** | **DENIED** | U65 — used existing processed payslip of `uat.nv0001` |
| **Module UAT / Phase1** | **DENIED** | Slice PASS ≠ module UAT |

---

## Environment

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | HRM / XBOS **200** (portal optional down — L1 API only) |
| Pre-test probe | First run `GET …/me/payslips` → **404** `HRM-DATA-404` *Cannot GET* (stale Node PID **29420** loaded pre-ESS dist) |
| QA recovery (R-PAY-F-STALE-DIST) | Kill `:28001` → `node dist/main` (hrm-api) → PID **19280** · health **200** · routes live |
| Dist marker | `listMyPayslips` / `HRM-PAY-403-ESS` / `employee_confirmed_at` in `dist/payroll/*` |
| ESS persona | `uat.nv0001@xe.vn` / `xevn-uat-2026` · mobile `POST /auth/mobile/login` **201** `HRM-AUTH-200` |
| ESS JWT | `employee_id=3796d949-4513-45c0-88fa-33030a062b17` · `companyId=holding` · `tenantId=xevn` |
| CEO persona | `ceo@xe.vn` / `Xevn@2026` · XBOS login · `employee_id=null` · `roleCode=group_ceo` |

---

## AC matrix (L1 AMIS step6 ESS)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **AC1** Mobile ESS login with `employee_id` | 2xx + JWT employee | **201** `HRM-AUTH-200` · `employee_id=3796d949-…` · `companyId=holding` | **PASS** |
| **AC2** `GET /payroll/me/payslips?company_id=holding` | 200 own rows only | **200** `HRM-PAY-200` · `total=2` · all `employee_id` match token | **PASS** |
| **AC3** `GET /me/payslips/:id` | 200 · components/lines · `ess_confirmed` | **200** `HRM-PAY-200` · id `7c78b34e-…` status=`processed` · `components=[]` · `lines=[]` · `ess_confirmed` boolean present | **PASS** |
| **AC4** `POST …/confirm` + F5 GET | 200 confirm · `ess_confirmed=true` | **201** `HRM-PAY-204-ESS` · F5 **200** `ess_confirmed=true` · `employee_confirmed_at=2026-08-07 09:44:14…+00` (idempotent retest) | **PASS** *(OBS Nest 201)* |
| **AC5** CEO no `employee_id` | 403 `HRM-PAY-403-ESS` | **403** `HRM-PAY-403-ESS` · *«ESS phiếu lương yêu cầu token gắn nhân viên»* | **PASS** |
| **AC6** Cross-employee id | 403 | Foreign `8ca0679c-…` emp `22222222-…` → **403** `HRM-PAY-403-ESS` · *«ESS chỉ được xem hoặc xác nhận phiếu lương của chính mình»* | **PASS** |

---

## Key runtime excerpts

```text
POST /auth/mobile/login {uat.nv0001@xe.vn}
→ 201 HRM-AUTH-200 employee_id=3796d949-4513-45c0-88fa-33030a062b17 companyId=holding

GET /payroll/me/payslips?company_id=holding
→ 200 HRM-PAY-200 total=2 ownOnly=true
  pick processed 7c78b34e-046a-48ef-89bc-be389cb7156b

GET /payroll/me/payslips/7c78b34e-…?company_id=holding
→ 200 HRM-PAY-200 components=0 lines=0 ess_confirmed (bool)

POST /payroll/me/payslips/7c78b34e-…/confirm?company_id=holding
→ 201 HRM-PAY-204-ESS ess_confirmed=true
F5 GET → 200 ess_confirmed=true employee_confirmed_at set

GET /payroll/me/payslips (ceo@xe.vn)
→ 403 HRM-PAY-403-ESS

GET /payroll/me/payslips/8ca0679c-… (ESS token, foreign emp)
→ 403 HRM-PAY-403-ESS
```

---

## Residual

| ID | Sev | Status | Note |
|----|-----|--------|------|
| **OBS-NEST-POST-201** | P3 | OPEN | Confirm returns Nest default **201**; paper/BE claim **200**. Business code `HRM-PAY-204-ESS` + F5 PASS. Optional BE `@HttpCode(200)`. |
| **OBS-OWN-LINES-EMPTY** | P3 | OPEN | Own processed payslip has `components/lines` length **0** (arrays present). Not AC fail — structure OK. |
| **Draft confirm 409** | P2 | NOT RETESTED | BE jest covers `HRM-PAY-409-ESS` on draft; this seat confirmed `processed` only. |
| **`payroll_e2e_ready`** | honesty | **LOCKED false** | — |
| FE/mobile ESS bind | P2 | OUT | After L1 — not this seat |
| Stale-dist | ops | **CLOSED** this seat | Restarted PID 19280 |

---

## completion_report

### Closed
1. L1 ESS list/get/confirm smoke with `uat.nv0001` mobile JWT (`employee_id` bound).
2. CEO without `employee_id` → **403** `HRM-PAY-403-ESS`.
3. Cross-employee payslip → **403** `HRM-PAY-403-ESS`.
4. Confirm + F5 persistence of `ess_confirmed` / `employee_confirmed_at`.
5. Honesty: **`payroll_e2e_ready=false`** · zero-seed · no AMIS DONE claim.
6. Stale-dist recovery documented (first probe 404 route miss).

### Residual
- OBS Nest POST **201** vs paper **200** (P3).
- Own payslip empty lines (P3).
- Draft **409** path not re-probed live.

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **pm** |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-ess-qa-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-ESS-QC-01
from_role: pm
to_role: qc
lane: governance
prior: PO-HRM-AMIS-PARITY-PAY-ESS-QA-01 PASS_TO_PM
parent: PO-HRM-AMIS-PARITY-RESEARCH-01
priority: P2

## Mission
QC delta gate L1 ESS payslip AMIS step6 GĐ1:
- Audit evidence docs/qa/evidence/po-hrm-amis-parity-pay-ess-qa-01.md + FINAL JSON stamp PAYESS-MSIRE93Q
- Confirm AC1–AC6 PASS; honesty payroll_e2e_ready=false; U65 zero-seed
- Conditions: OBS-NEST-POST-201 (optional BE HttpCode 200); OBS-OWN-LINES-EMPTY; draft 409 not live-retested
- DENY: AMIS parity DONE · module UAT · J-HRM-07 · payroll_e2e_ready flip · FE/mobile ESS claim
exit: docs/qa/evidence/po-hrm-amis-parity-pay-ess-qc-01.md · GO WITH CONDITIONS or NO-GO
```
