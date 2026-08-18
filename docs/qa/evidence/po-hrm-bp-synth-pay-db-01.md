# Evidence — PO-HRM-BP-SYNTH-PAY-DB-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-SYNTH-PAY-DB-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-04 |
| **priority** | P0 |
| **ack_status** | `PASS_TO_PM` |

---

## Mission

CORRECTION: PAY meeting complete. Upgrade `DB_DESIGN_HRM_ENTERPRISE.md` — replace «họp lương chưa xong» stubs with logical PAY tables for SYNTHESIS P1–P6 + existing FR PAY. Ensure ATT `leave_type` catalog supports annual / seniority / OT-comp / carry-over / advance + sick insurance flags. Fold align residual if open.

## read_first (ack)

| # | Artifact | Result |
|---|----------|--------|
| 1 | `SYNTHESIS_MASTER_HRM_ENTERPRISE.md` §2.4 P1–P6 · A3–A4 | Meeting **COMPLETE**; cấm «họp lương chưa xong» |
| 2 | `DB_DESIGN_HRM_ENTERPRISE.md` v0.2 | §5 stub only + HOLD «họp chưa xong» — **replaced** |
| 3 | `API_DESIGN_HRM_ENTERPRISE.md` §4 PAY | Still says meeting unfinished on F-PAY-FORMULA — residual for SA |
| 4 | `DATA_OWNERSHIP_MATRIX.md` | timesheet_closed SoT · payslip · insurance_rate · REC↛PAY preserved |
| 5 | `po-hrm-bp-meet-db-align-01.md` | **CLOSED** PASS_TO_PM — folded (no reopen); PAY column intent ready for API §7 delta |

---

## completion_report

### Closed

1. **CORRECTION wording** — DB header / §1.2 / §5 / risks / exit: meeting PAY **đã chốt**; DRAFT = chờ khách ký giấy **D7** (≠ unfinished meeting).

2. **ATT leave_type catalog (§4.4)**  
   - Keys: `annual`, `seniority`, `ot_comp`, `carry_over`, `advance`, `sick`.  
   - Flags: `allows_carry_over`, `allows_advance`, `insurance_regime_flag`, `company_topup_flag`, `counts_toward_timesheet`.  
   - Balance: `carried_in`, `advanced`; policy `carry_over_expire_rule`.  
   - Leave request optional `insurance_branch` for sick — **no PAY FK**.

3. **PAY logical §5 (P1–P6)**  

| P | Coverage |
|---|----------|
| P1 | `pay_period_timesheet_bind` + `pay_payslip.timesheet_header_id` NOT NULL + closed assert |
| P2 | Read-path CORE C&B documented — no C&B columns on PAY |
| P3 | `hrm_reward_discipline.payroll_period_id` + optional `pay_reward_link` |
| P4 | `pay_formula_definition` versioned pointer — `expression_json` opaque (**Q-PAY-FORMULA**) |
| P5 | `pay_*` ownership / forbidden FK |
| P6 | `pay_payslip_split_segment` + `pay_termination_settlement` + `hrm_termination.final_settlement_id` |

   Also: `pay_payroll_period`, `pay_insurance_rate_cfg` (ceiling), `pay_payroll_group` (PAY-09), `pay_payslip_line`, lifecycle §5.11, DV-13..20.

4. **Align fold** — `PO-HRM-BP-MEET-DB-ALIGN-01` already CLOSED; no column reopen. DOC-DELTA notes stubs superseded.

5. **Boundaries preserved** — no REC→PAY; no payslip→leave/OT/punch; no shadow hours; no `apps/**` / migrate; no customer-signed / Dev unlock claim.

### Residual (not this seat)

| ID | Item | Owner |
|----|------|-------|
| R-BP-API-PAY-DELTA | API_DESIGN §4/§7 still «meeting unfinished» / stub HOLD — align to DB v0.3 | sa |
| R-BP-FORMULA-CONFIRM | Q-PAY-FORMULA Option A unsigned — expression inner schema HOLD | pm + partner |
| R-BP-SRS-LEAVE-A3 | Confirm SRS FR text has A3–A4 leave keys if not yet | ba-process |
| R-BP-CUSTOMER-SIGN | D7 paper | pm |
| Dev coding | Locked until TechSpec unlock + paper | — |

### Explicit non-claims

- Not customer-signed.  
- Not Dev unlock / no migrations.  
- Did **not** invent formula engine / drag-drop DDL.  
- Did **not** edit `apps/**`.

---

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-SYNTH-PAY-API-01
from_role: pm
to_role: sa
lane: governance
priority: P0

## Mission
UPGRADE API_DESIGN_HRM_ENTERPRISE.md §4 PAY + §7 aliases to match DB_DESIGN v0.3.0-DRAFT (PO-HRM-BP-SYNTH-PAY-DB-01). Replace «họp lương chưa xong» / PAY stub HOLD wording with: meeting complete; DRAFT awaiting customer paper D7; F-PAY-FORMULA-* remains Q-PAY-FORMULA pointer (expression opaque) — not «meeting unfinished». Add F.1 outlines for period/bind/process/payslip/settlement consistent with DB §5; keep F-PAY-ATT-CLOSED-01. Optional one-line TechSpec residual pointer.

## read_first
1. docs/qa/evidence/po-hrm-bp-synth-pay-db-01.md
2. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §5 + DOC-DELTA SYNTH-PAY-DB-01
3. docs/client-delivery/hrm-enterprise-blueprint/SYNTHESIS_MASTER_HRM_ENTERPRISE.md §2.4
4. docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md §4 · §7
5. docs/client-delivery/hrm-enterprise-blueprint/DATA_OWNERSHIP_MATRIX.md (payslip · timesheet_closed)

## Exit
- API §4/§7 aligned to DB v0.3; no «họp lương chưa xong»
- evidence docs/qa/evidence/po-hrm-bp-synth-pay-api-01.md · PASS_TO_PM
- cấm: apps/** · invent unsigned formula OpenAPI · claim customer-signed / Dev unlock
```

---

## evidence_path

- This file: `docs/qa/evidence/po-hrm-bp-synth-pay-db-01.md`
- DB: `docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md` (**v0.3.0-DRAFT**)

## ack_status

`PASS_TO_PM`
