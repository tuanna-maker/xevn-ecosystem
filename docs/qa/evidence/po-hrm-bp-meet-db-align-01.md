# Evidence — PO-HRM-BP-MEET-DB-ALIGN-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-MEET-DB-ALIGN-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-04 |
| **priority** | P0 |
| **ack_status** | `PASS_TO_PM` |

---

## Mission

Column-level spot-check: mọi F-* Request/Response trong `API_DESIGN_HRM_ENTERPRISE.md` ↔ cột `DB_DESIGN_HRM_ENTERPRISE.md`. Fix name drift (`att_attendance_rule`, `rec_mail_outbox`). Preserve boundaries; **không** invent PAY formula DDL; **không** claim customer-signed / Dev unlock.

## read_first (ack)

| # | Artifact | Result |
|---|----------|--------|
| 1 | API_DESIGN §7 + F-* | v0.2.0 had table alias hedges; F.* used short names |
| 2 | DB_DESIGN | v0.1 logical — **missing** mail outbox table; late penalty only on `att_shift` (no `att_attendance_rule`) |
| 3 | TechSpec §10–§11 | Residual R-BP-DB-ALIGN open — this wave closes column spot-check (no full TechSpec redo) |
| 4 | `po-hrm-bp-meet-tech-api-01.md` | Residual R-BP-DB-ALIGN owner ba-data+sa |
| 5 | `po-hrm-bp-meet-db-01.md` | Prior logical DB draft |

---

## completion_report

### Closed

1. **Name drift FIXED (ADD DB)**  
   - Added **`rec_mail_outbox`** + **`rec_mail_log`** (DB §2.9) — locks API `mail_outbox` alias.  
   - Added **`att_attendance_rule`** (DB §4.1b) — locks API `attendance_rules`; `att_shift.late_penalty_*` kept as **fallback default** only.

2. **Column gaps FIXED (ADD cols)**  
   - Plan: `submit_comment`, `approved_by`/`approved_at`, `rejected_reason`.  
   - YCTD: `out_of_plan_reason`, `approved_*`, pipeline JSON key contract.  
   - Employee: `activated_at`.  
   - Timesheet header: `reopen_reason` / `reopened_at` / `reopened_by`.

3. **API_DESIGN §7 UPGRADE → v0.2.1-DRAFT**  
   - §7.1 table alias confirmed (removed “confirm ba-data” hedges).  
   - §7.2 field alias map (DTO → column).  
   - §7.3 F-id → table.column **PASS** matrix (PAY formula **HOLD**).  
   - §7.4 D-I-2 / D-I-3 / D-I-3b / Campaign GĐ2 / C&B ring checklist **PASS**.  
   - Critical F.* Request→DB lines corrected: MAIL, HIRE (employee_id on **candidate**), RULE, YCTD-04 flags.

4. **Hire link SoT**  
   - Application does **not** own `employee_id`; SoT = `rec_candidate.employee_id` + `hrm_employee.candidate_id`.

5. **Boundaries preserved**  
   - No REC→PAY FK; no payslip→leave/OT/punch; PAY formula stubs unchanged; Campaign GĐ2; no `apps/**`.

### F-* matrix summary

| Pillar | PASS | HOLD |
|--------|------|------|
| REC | JD, HC, YCTD, APP, MAIL, HIRE, DASH | CAMPAIGN GĐ2 |
| CORE | EMP public/C&B, history, contract, SI, RD, AST, TERM, ACT | — |
| ATT | shift, hol, **rule**, punch, leave, sheet | LEAVE-04 accrual outline (Q open) |
| PAY | F-PAY-ATT-CLOSED-01 boundary | **F-PAY-FORMULA-*** |

Full rows: API_DESIGN §7.3.

### Residual (open — not this wave)

| ID | Item | Owner |
|----|------|-------|
| R-BP-PAY-MEETING | Họp lương + PAY depth | PM |
| R-BP-FORMULA-CONFIRM | Q-PAY-FORMULA Option A | PM + partner |
| R-BP-CAMPAIGN-GĐ2 | Campaign hub | PM / ba-docs |
| R-BP-Q-* | Q-LEAVE-ACCRUAL/UNIT · Q-SI-SUSPEND · Q-REC-HEADCOUNT | ba-process |
| R-BP-CUSTOMER-SIGN | Khách chốt | PM |
| R-BP-DB-ALIGN | **CLOSED** by this evidence (column spot-check) | — |
| Dev coding | Forbidden until TechSpec §12 unlock | — |

### Explicit non-claims

- Not customer-signed.  
- Not production-ready / no Dev unlock.  
- No PAY formula DDL invent.  
- No migrations / `apps/**`.  
- TechSpec full redo **not** done (only residual note for PM).

---

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-MEET-ALIGN-ACK-01
from_role: pm
to_role: sa (optional ack) then pm program
lane: governance
priority: P1

## Mission
Ack API_DESIGN §7.1–7.4 + DB_DESIGN DOC-DELTA align-01. Mark TechSpec §11 R-BP-DB-ALIGN CLOSED (one-line DOC-DELTA only — no full TechSpec rewrite). Parallel: schedule PAY meeting + Q-PAY-FORMULA workshop. Keep Dev locked.

## read_first
1. docs/qa/evidence/po-hrm-bp-meet-db-align-01.md
2. docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md §7
3. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md DOC-DELTA align-01
4. docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md §11–§12

## Exit
- R-BP-DB-ALIGN closed on TechSpec residual table (pointer only)
- PAY meeting scheduled / Q-PAY-FORMULA track open
- evidence short ack path; PASS_TO_PM
- cấm: apps/** · invent PAY formula · claim customer-signed / Dev unlock
```

---

## evidence_path

- This file: `docs/qa/evidence/po-hrm-bp-meet-db-align-01.md`
- DB: `docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md` (v0.2.0-DRAFT + DOC-DELTA)
- API: `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` (v0.2.1-DRAFT §7)

## ack_status

`PASS_TO_PM`
