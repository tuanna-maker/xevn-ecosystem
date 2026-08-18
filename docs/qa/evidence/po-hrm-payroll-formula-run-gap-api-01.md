# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-01` PASS_TO_PM |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **change_mode** | ADD / EXPAND · docs-only · **no** `apps/**` · **no** seed |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** invent LIVE · **cấm** GĐ1 DnD as API requirement |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `po-hrm-payroll-formula-run-gap-data-01.md` | Dual-control columns §2.1 · G-PAY-F-01..09 · Nest aliases · scope_parity |
| 2 | `po-hrm-payroll-formula-run-gap-sa-01.md` | Unlock checklist §3.4 · PROCESS must_keep §4 · R-PAY-DD-01 |
| 3 | `po-hrm-payroll-formula-run-gap-ba-01.md` | **AC-PAY-FORMULA-01..08** · AC-PAY-RUN-* |
| 4 | `DECISION_PACKET_Q_PAY_FORMULA.md` · ADR §10 | Option **A** ANSWERED · dual-control · Form GĐ1 |
| 5 | `PO_HRM_AMIS_PARITY_RESEARCH_01.md` §3 | Thành phần · Mẫu · precedence (bind > template override > catalog) |
| 6 | Client `API_DESIGN_HRM_ENTERPRISE.md` §4 | Prior HOLD → lift via DOC-DELTA |
| 7 | Nest `payroll.controller` (read-only) | Path prefix `/api/hrm/payroll` · salary-components EXISTING |

---

## 2. Deliverables

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md`](../../program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md) | **CONFIRMED** F.1 SoT — AUTHOR/PUBLISH/LIST/PREVIEW · PROCESS EXPAND · AMIS precedence · errors · Dev unlock |
| `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` | DOC-DELTA ADD — lift HOLD · ADD four F.* blocks · EXPAND PROCESS · §7.1/§7.3 UPGRADE |

**Không đụng:** `apps/**` · seed · invent AST/DnD/LIVE · flip `payroll_e2e_ready`.

---

## 3. F.1 coverage checklist

| F-id | Mục đích · Nghiệp vụ · bước SRS · DTO↔DATA | Verdict |
|------|---------------------------------------------|---------|
| **F-PAY-FORMULA-AUTHOR-01** | Draft upsert → `pay_formula_definitions` · FR-UC-BP-PAY-02 soạn · AC-01 | **PASS** |
| **F-PAY-FORMULA-PUBLISH-01** | Dual-control · `authored_by ≠ published_by` · AC-02/03/05 | **PASS** |
| **F-PAY-FORMULA-LIST-01** | List/GET scope_parity · soft-delete hide | **PASS** |
| **F-PAY-FORMULA-PREVIEW-01** | Optional dry-run · BE-only · staged ATT line honesty | **PASS** (outline) |
| **F-PAY-PROCESS-01** EXPAND | Published version + closed sheet vars · FORMULA-412 | **PASS** |
| Soft-delete / immutability after publish | `archived_at` + `409-IMMUTABLE` | **PASS** |
| Open catalog | No CHK IN (N); deprecate `salary_components.formula` as engine | **PASS** |
| AMIS precedence | Catalog · formula · template override pointer | **PASS** (cite §3) |

---

## 4. Path & table locks

| Item | Lock |
|------|------|
| Nest table | `pay_formula_definitions` (DATA ADD-plan) |
| Nest HTTP | `/api/hrm/payroll/formulas*` |
| Paper alias | `/api/hrm/pay/formulas*` · logical `pay_formula_definition` |
| Expression | `expression_json` **opaque** |
| Engine SoT | **≠** `salary_components.formula` TEXT |

---

## 5. Staging honesty

| Capability | Docs | LIVE / UAT |
|------------|------|------------|
| AUTHOR/PUBLISH/LIST F.1 | **CONFIRMED** | Unlocked for **dev-be** ensureSchema+CRUD |
| PREVIEW hours fidelity | Outline + stub codes | **BLOCKED** until `att_timesheet_line` (G-PAY-F-06) |
| PROCESS evaluate + lines | Contract EXPAND | After evaluator + lines DDL |
| Template formula override | Precedence pointer only | Prefer wait **AMIS parity SA** |
| `payroll_e2e_ready` | — | Remains **false** |

---

## 6. completion_report

### Closed

1. Lifted `F-PAY-FORMULA-*` HOLD with full F.1 AUTHOR / PUBLISH / LIST / PREVIEW (optional) citing DATA-01 dual-control columns.  
2. EXPAND `F-PAY-PROCESS-01`: evaluate **published** version + **closed timesheet** vars only; FORMULA-412; no zero-stub UAT.  
3. Soft-delete / version immutability / dual-control deny codes locked.  
4. Open catalog lock — no closed component CHK IN (N); deprecate SC.formula as engine SoT.  
5. AMIS §3 precedence aligned (component catalog · formula engine · template override residual).  
6. Client API_DESIGN DOC-DELTA ADD-only; program SoT path documented.  
7. Honesty: `payroll_e2e_ready=false`; no `apps/**`; no GĐ1 DnD invent.

### Residual

| ID | Item | Owner |
|----|------|-------|
| R-PAY-F-BE-01 | ensureSchema `pay_formula_definitions` + AUTHOR/PUBLISH/LIST CRUD + jest dual-control | **dev-be** |
| R-PAY-F-EVAL | Evaluator + PROCESS lines + PREVIEW (after ATT line or stub honesty) | **dev-be** (staged) |
| R-PAY-AMIS-TPL | Template formula override / `pay_sheet_template` | **Already mapped** in `po-hrm-amis-parity-sa-01.md` — BE-01 **cấm** invent template HTTP; depth via AMIS DATA/API if GAP |
| R-PAY-ATT-LINE | `att_timesheet_line` for hours vars | ATT / ba-data + BE |
| R-PAY-FE-FORM | GĐ1 form author UI (no DnD) | **dev-fe** after BE |
| Honesty | Module UAT | **qa→qc** — deny invent ready flag |

---

## 7. next_owner / next_dispatch_prompt

**next_owner:** **pm** → dispatch **dev-be** (prefer wait AMIS parity SA if template layer added same wave)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
priority: P0
change_mode: ADD
sponsor_confirm: Q-PAY-FORMULA Option A ANSWERED · DATA-01 CONFIRMED · API-01 CONFIRMED 2026-08-07

## read_first
1. docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md (F.1 AUTHOR/PUBLISH/LIST · errors · paths)
2. docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md §2.1 columns · indexes
3. docs/qa/evidence/po-hrm-payroll-formula-run-gap-api-01.md
4. Nest payroll.service / payroll-catalog ensureSchema pattern (read)
5. ADR-HRM-4-PILLAR §10 Option A · R-PAY-DD-01 (Form GĐ1 — cấm DnD)

## task
ensureSchema ADD public.pay_formula_definitions (DATA §2.1 columns + UQ/IX); Nest CRUD under /api/hrm/payroll/formulas:
- AUTHOR draft upsert + new version
- submit-publish / publish with authored_by ≠ published_by (403-DUAL)
- LIST/GET scope_parity (same resolveHrmListScope as periods)
- soft-delete retire (archived_at) — no hard-delete
- FORBIDDEN: treat salary_components.formula as engine; closed CHK IN (N); invent evaluator AST; FE net
Optional nullable formula_definition_id on payroll_periods/payslips.
Jest: SM draft→pending_publish→active; dual-control deny; immutable active; scope_parity list↔get.
@CODE-MEMORY; U65 no seed for UF evidence.
Evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-01.md
Honesty: payroll_e2e_ready=false · no claim formula LIVE

## exit
READY_FOR_QA (L1 schema+CRUD) · next qa smoke list/create/publish deny · PREVIEW/PROCESS evaluate may remain staged
must_keep: closed-sheet process bind contract · open catalog · dual-control · opaque expression_json
```

**If PM adds template override same wave — dispatch first:**

```text
work_item_id: PO-HRM-AMIS-PARITY-SA-01 (or PO-HRM-AMIS-PARITY-PAY-DEPTH-01)
from_role: pm
to_role: sa
lane: governance
## Mission
Lock pay sheet template formula-override precedence vs pay_formula_definitions before BE expands template HTTP — cite API-01 §2 AMIS precedence. payroll_e2e_ready=false. no apps/**.
```

---

## 8. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §6 |
| **next_owner** | **pm** → **dev-be** `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01` |
| **next_dispatch_prompt** | §7 copy-ready |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-api-01.md` |
| **ack_status** | `PASS_TO_PM` |
