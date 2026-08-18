# Evidence — PO-HRM-AMIS-PARITY-PAY-TPL-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-TPL-API-01` |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-DATA-01` PASS · SA-01 · formula API-01 CONFIRMED (do **not** reopen) |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **change_mode** | ADD / EXPAND · docs-only · **no** `apps/**` · **no** seed |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** invent LIVE engine · **cấm** merge pack into mẫu SoT |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `po-hrm-amis-parity-pay-data-01.md` | ADD-plan §2 templates/lines · OV-C §3 · SRC §4 · soft-delete/scope/open-catalog §6 · VAL matrix |
| 2 | `po-hrm-amis-parity-sa-01.md` §3.2–3.3 · §6 | Layer map · Option B FK override · BETTER preserve |
| 3 | `po-hrm-payroll-formula-run-gap-data-01.md` | Formula PAPER cite — no redefine |
| 4 | `po-hrm-payroll-formula-run-gap-api-01.md` | F-PAY-FORMULA-* CONFIRMED — **do not reopen HOLD** · COMP/EVAL stay there |
| 5 | `PO_HRM_AMIS_PARITY_RESEARCH_01.md` §3 | Spine bước 3–5 · priority nguồn · cấu trúc từ mẫu |
| 6 | `po-hrm-amis-parity-pay-depth-01.md` | **AC-PAY-TPL-01..06** · **AC-PAY-SRC-*** · FR-UC-BP-PAY-02/06 |
| 7 | Nest payroll (read-only) | Pack paths `/salary-templates*` LIVE ≠ mẫu |

---

## 2. Deliverables

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md`](../../program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md) | **CONFIRMED** F.1 SoT — LIST/UPSERT/LINES/ARCHIVE · PERIOD snapshot · PROCESS SRC · alias pack · errors · Dev unlock |
| `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` | DOC-DELTA ADD — F-PAY-SHEET-TPL-* · EXPAND PERIOD/PROCESS · §7.1/§7.3 |

**Không đụng:** `apps/**` · seed · invent LIVE evaluator · reopen formula HOLD · merge `salary_templates` into mẫu.

---

## 3. F.1 coverage checklist

| F-id | Mục đích · Nghiệp vụ · bước SRS · DTO↔DATA | Verdict |
|------|---------------------------------------------|---------|
| **F-PAY-SHEET-TPL-LIST-01** | List/GET scope_parity · soft-delete hide · optional lines | **PASS** |
| **F-PAY-SHEET-TPL-UPSERT-01** | Header create/patch · open catalog code · 409 duplicate | **PASS** |
| **F-PAY-SHEET-TPL-LINES-01** | Replace-set columns · OV-C FK preferred · sort/label · component soft assert | **PASS** |
| **F-PAY-SHEET-TPL-ARCHIVE-01** | `archived_at` — no hard DELETE | **PASS** |
| **F-PAY-PERIOD-01** EXPAND | `pay_sheet_template_id` + immutable snapshot | **PASS** |
| **F-PAY-PROCESS-01** EXPAND | SRC 1→4 resolver · OV-C process gate · cite formula EVAL | **PASS** (outline deepen) |
| **F-PAY-SALARY-PACK-01** alias | EXISTING enroll pack ≠ mẫu | **PASS** |
| Soft-delete / open catalog / scope_parity | DATA §6 | **PASS** |
| COMP/EVAL | Stay on F-PAY-FORMULA-* | **PASS** (explicit non-touch) |

---

## 4. Path & table locks

| Item | Lock |
|------|------|
| Nest tables | `pay_sheet_templates` · `pay_sheet_template_lines` (DATA ADD-plan) |
| Period EXPAND | `payroll_periods.pay_sheet_template_id` · `sheet_template_snapshot_json` |
| Nest HTTP (mẫu) | `/api/hrm/payroll/pay-sheet-templates*` |
| Nest HTTP (pack — keep) | `/api/hrm/payroll/salary-templates*` |
| Override | OV-C: `formula_override_definition_id` preferred → `pay_formula_definitions` |
| Engine SoT | **≠** `salary_components.formula` TEXT · **≠** jsonb-only on PROCESS |
| SRC | Resolver algorithm — **not** FE invent · **not** DB priority enum |

---

## 5. Staging honesty

| Capability | Docs | LIVE / UAT |
|------------|------|------------|
| TPL LIST/UPSERT/LINES/ARCHIVE F.1 | **CONFIRMED** | Unlocked for **dev-be** ensureSchema+CRUD |
| Period snapshot bind | Contract EXPAND | After TPL BE + period cols |
| PROCESS SRC full fidelity | Contract EXPAND | After formula EVAL + optional period-input / ATT line |
| Formula AUTHOR/PUBLISH/EVAL | Already CONFIRMED peer | Separate BE-01 — **do not** invent here |
| `payroll_e2e_ready` | — | Remains **false** |

---

## 6. completion_report

### Closed

1. **F-PAY-SHEET-TPL-*** F.1 CONFIRMED (LIST / UPSERT / LINES / ARCHIVE) with Mục đích · Nghiệp vụ · Tham chiếu bước SRS · DTO↔`pay_sheet_templates`/`_lines`.  
2. **Alias lock:** enroll `salary_templates` pack ≠ mẫu SoT; separate Nest paths.  
3. **OV-C** documented for API: definition_id preferred; jsonb preview-only; PROCESS → FORMULA-412 if unpublished.  
4. **SRC** as BE resolver (tiers 1–4) on PROCESS EXPAND — not invent FE; COMP/EVAL remain formula wave.  
5. **Period** create/bind snapshot contract + immutability after process.  
6. Soft-delete `archived_at` · scope_parity list↔get · open catalog no CHK IN N.  
7. Client API_DESIGN DOC-DELTA ADD-only; program SoT path documented.  
8. Honesty: `payroll_e2e_ready=false`; no `apps/**`; no LIVE engine invent.

### Residual

| ID | Item | Owner |
|----|------|-------|
| **R-PAY-TPL-BE-01** | ensureSchema ADD templates/lines + period snapshot cols + Nest CRUD under `/pay-sheet-templates*` + scope_parity jest | **dev-be** |
| R-PAY-F-BE-01 | Formula ensureSchema+CRUD/EVAL (peer — may still run) | **dev-be** separate |
| R-PAY-SRC-2 | Period input pack APIs after TPL | ba-data/sa later |
| R-PAY-ATT-LINE | Hour vars | ATT lane |
| R-PAY-FE-TPL | Settings mẫu form GĐ1 (no formula DnD) | **dev-fe** after TPL BE |
| Honesty | Module UAT | **qa→qc** — deny ready flip |

### Explicit non-claims

- No LIVE pay sheet template / SRC engine.  
- No apps/**.  
- No merge pack into mẫu.  
- No reopen formula HOLD.

---

## 7. next_owner / next_dispatch_prompt

**next_owner:** **pm** → dispatch **dev-be** TPL BE (**separate** from formula BE-01 if still running)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-TPL-BE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-AMIS-PARITY-RESEARCH-01
priority: P0
change_mode: ADD
depends_on: PO-HRM-AMIS-PARITY-PAY-DATA-01 PASS · PO-HRM-AMIS-PARITY-PAY-TPL-API-01 CONFIRMED
sponsor_confirm: SA F.1 2026-08-07 · OV-C · pack≠mẫu
parallel_ok: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01 (do not merge workstreams)

## read_first
1. docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md (F.1 paths · DTO↔columns · errors · OV-C · SRC notes)
2. docs/qa/evidence/po-hrm-amis-parity-pay-data-01.md §2–§3 columns · indexes · soft-delete
3. docs/qa/evidence/po-hrm-amis-parity-pay-tpl-api-01.md
4. Nest payroll.controller salary-templates pattern (read) — cấm deepen pack into mẫu
5. ADR-HRM-DYNAMIC-CONFIG-PLATFORM Option B · U19 scope_parity

## task
ensureSchema ADD public.pay_sheet_templates + pay_sheet_template_lines (DATA §2.1–2.2 UQ/IX/archived_at);
EXPAND payroll_periods nullable pay_sheet_template_id + sheet_template_snapshot_json;
Nest CRUD under /api/hrm/payroll/pay-sheet-templates:
- LIST/GET scope_parity (same resolveHrmListScope as periods/salary-templates)
- UPSERT header (open catalog code; 409 duplicate active code)
- PUT lines replace-set (component soft assert; OV-C definition_id + optional jsonb; sort_order/display_label)
- ARCHIVE soft-delete (archived_at) — FORBIDDEN hard DELETE
- Period create/bind accepts paySheetTemplateId → snapshot columns
FORBIDDEN: treat salary_templates as mẫu; salary_components.formula as engine; invent evaluator; FE net; closed CHK IN (N)
Jest: scope_parity list↔get; duplicate code/line; archive hide; snapshot immutability after process flag
@CODE-MEMORY; U65 no seed for UF evidence
Evidence: docs/qa/evidence/po-hrm-amis-parity-pay-tpl-be-01.md
Honesty: payroll_e2e_ready=false · no claim mẫu LIVE / parity DONE

## exit
READY_FOR_QA (L1 schema+CRUD) · next qa smoke list/create/lines/archive · PROCESS SRC full may remain staged until formula EVAL
must_keep: pack salary-templates enroll · formula F.1 peer · closed-sheet ATT-412 contract · open catalog · soft-delete
```

---

## 8. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §6 |
| **next_owner** | **pm** → **dev-be** `PO-HRM-AMIS-PARITY-PAY-TPL-BE-01` |
| **next_dispatch_prompt** | §7 copy-ready |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-tpl-api-01.md` |
| **ack_status** | `PASS_TO_PM` |
