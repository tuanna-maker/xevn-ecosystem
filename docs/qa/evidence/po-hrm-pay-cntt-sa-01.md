# Evidence — PO-HRM-PAY-CNTT-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-SA-01` |
| **parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-08-11 |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **Honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** · intake ≠ UAT · no `apps/**` · U65 |

---

## 1. read_first ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `PO_HRM_AMIS_PARITY_RESEARCH_01.md` | AMIS 7-step spine · Step 3 override |
| 2 | `PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01.md` | Customer-ready · formula gap |
| 3 | `po-hrm-amis-parity-sa-01.md` | Layer map · Option B storage · SRC |
| 4 | `po-hrm-payroll-formula-run-gap-sa-01.md` | Unlock checklist · Q-PAY-FORMULA locked |
| 5 | `PO_HRM_PAY_XEVN_CUSTOMER_CNTT_INTAKE_01.md` | 6 models · 67 files |
| 6 | `PO-HRM-AMIS-PARITY-PAY-TPL-API-01` | TPL CONFIRMED — cite |
| 7 | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01` | Input pack CONFIRMED — cite |

---

## 2. Deliverables

| Deliverable | Path | Status |
|-------------|------|--------|
| Multi-template ADR | `docs/architecture/ADR-HRM-PAY-MULTI-TEMPLATE-01.md` | **CONFIRMED** |
| Customer CNTT ADR | `docs/architecture/ADR-HRM-PAY-XEVN-CUSTOMER-CNTT-01.md` | **CONFIRMED** |
| SA spec pack | `docs/program/specs/PO-HRM-PAY-CNTT-SA-01.md` | **CONFIRMED** |
| This evidence | `docs/qa/evidence/po-hrm-pay-cntt-sa-01.md` | **PASS_TO_PM** |

---

## 3. Reconciliation summary

| Layer | AMIS | XeVN today | Customer need | Decision |
|-------|------|------------|---------------|----------|
| Policy setup | Step 1 | Partial | QĐ/PDF per BP | **ADD** `pay_policy_pack` |
| Components | Step 2 | Catalog LIVE | Per-model columns | Open catalog |
| Multi mẫu | Step 3 | TPL LIVE | 6+ Excel | **Multi template** + OV-C FK |
| Input packs | Step 4 | API CONFIRMED | KPI/DT/CPSC | **ADD** `pay_input_pack_profile` |
| Process | Step 5 | 0₫ stub | done.xlsx | Evaluator **HOLD** |

**must_keep:** `salary_templates` enroll ≠ mẫu · SRC BR-AMIS-PAY-SRC-01..05 · ATT-412 · no FE net · Platform Option B.

---

## 4. Architecture decisions (locked)

| # | Decision |
|---|----------|
| D1 | **Thiết lập lương** = logical module L1–L6 (catalog · formula · template · policy · input profile · applicability) |
| D2 | Customer 6 models = **metadata codes** — **cấm** Nest hardcode |
| D3 | Formula override = FK to **published** `pay_formula_definitions` only (Option B) |
| D4 | **ADD** `pay_policy_pack` + `pay_input_pack_profile` bound via template + period snapshot |
| D5 | API_DESIGN: **no REWRITE** · **APPEND** 7 F-ids · **EXPAND** 5 existing F-ids |
| D6 | Formula **evaluator HOLD** until `expression_json` inner schema physical CONFIRMED |
| D7 | Cite Q-PAY-FORMULA A + R-PAY-DD-01 — **no** reopen |

---

## 5. API unlock list (quick reference)

### REWRITE: **none**

### APPEND (new F.1 — after ba-data)

- F-PAY-POLICY-PACK-LIST/UPSERT/ARCHIVE-01
- F-PAY-INPUT-PROFILE-LIST/UPSERT/ARCHIVE-01
- F-PAY-SETUP-RESOLVE-01

### EXPAND (existing)

- F-PAY-SHEET-TPL-UPSERT/LIST-01 — policy/profile FKs · business_line_tag
- F-PAY-PERIOD-01 — snapshot versions
- F-PAY-PERIOD-INPUT-01 — profile validation
- F-PAY-PROCESS-01 — cite only until eval LIVE

### HOLD

- F-PAY-FORMULA eval / full PREVIEW UAT · XLSX import

Detail: `docs/program/specs/PO-HRM-PAY-CNTT-SA-01.md` §3.

---

## 6. Non-claims

- No `apps/**` / migrations
- No `payroll_e2e_ready=true` / parity DONE / Phase1 DONE
- No formula evaluator LIVE claim
- No customer XLSX import API GĐ1
- No wipe F-PAY-FORMULA / F-PAY-SHEET-TPL CONFIRMED sections

---

## 7. completion_report

**Closed**

1. Reconciled AMIS vs XeVN vs P.CNTT 6-model reality.
2. Architecture for **Thiết lập lương**: multi template · catalog · per-template formula FK · input profile per BP · policy pack.
3. Two ADD-only ADRs published.
4. API_DESIGN unlock list (rewrite vs append vs hold).
5. Formula engine honesty: **HOLD** until physical schema confirmed.

**Residual**

| ID | Owner |
|----|-------|
| `PO-HRM-PAY-CNTT-BA-PROCESS-01` | ba-process — 6×AC + UC Thiết lập lương |
| `PO-HRM-PAY-CNTT-BA-DATA-01` | ba-data — Excel map + ADD DDL |
| `PO-HRM-PAY-CNTT-API-01` | sa — F.1 APPEND after DATA |
| `PO-HRM-PAYROLL-FORMULA-EVAL-BE-01` | dev-be — after expression_json CONFIRMED |
| `PO-HRM-PAY-CNTT-LINKAGE-QA-01` | qa — menu linkage inventory |

---

## 8. Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/po-hrm-pay-cntt-sa-01.md`

### next_dispatch_prompt (primary — BA process)

```text
work_item_id: PO-HRM-PAY-CNTT-BA-PROCESS-01
from_role: pm
to_role: ba-process
lane: governance
priority: P0
parent: PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01

read_first:
- docs/program/PO_HRM_PAY_XEVN_CUSTOMER_CNTT_INTAKE_01.md
- docs/architecture/ADR-HRM-PAY-XEVN-CUSTOMER-CNTT-01.md
- docs/architecture/ADR-HRM-PAY-MULTI-TEMPLATE-01.md
- docs/program/specs/PO-HRM-PAY-CNTT-SA-01.md
- docs/qa/evidence/po-hrm-pay-cntt-sa-01.md

## Mission
Ma trận 6 mô hình khách × FR PAY × AC; đề xuất UC **Thiết lập lương** (ADD-only SRS delta).
Lock: multi pay_sheet_template · policy_pack · input_pack_profile · SRC unchanged · cấm hardcode 6 model Nest.
Propose AC-CNTT-SETUP-01..04 + AC-CNTT-MODEL-01..06 browser paths.

## Deliver
1. docs/qa/evidence/po-hrm-pay-cntt-ba-process-01.md
2. BR/AC pack traceable to ADR §8
3. next_dispatch_prompt → ba-data PO-HRM-PAY-CNTT-BA-DATA-01

## Exit
PASS_TO_PM · payroll_e2e_ready=false · no apps/** · no UAT flip
```

### next_dispatch_prompt (parallel — BA data)

```text
work_item_id: PO-HRM-PAY-CNTT-BA-DATA-01
from_role: pm
to_role: ba-data
lane: governance
priority: P0
parent: PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01
entry_criteria: read SA spec §2 + ADR-HRM-PAY-MULTI-TEMPLATE-01 §4

## Mission
Map cột Excel mẫu khách (docs/từ khách hàng/Gửi P.CNTT/) → salary_components · pay_sheet_template_lines · pay_input_pack_profile fields.
Physicalize ADD: pay_policy_pack · pay_input_pack_profile · EXPAND pay_sheet_templates FKs per SA §4.
Cite existing pay_sheet_templates / pay_period_input_lines — no wipe.

## Deliver
docs/qa/evidence/po-hrm-pay-cntt-ba-data-01.md
PASS_TO_PM · next sa PO-HRM-PAY-CNTT-API-01 F.1 APPEND

## Exit
cấm apps/** · expression_json inner schema cite formula DATA-01 — do not invent AST · payroll_e2e_ready=false
```

### Serial gate (formula — unchanged)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-EVAL-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P0
entry_criteria: expression_json inner schema CONFIRMED in formula DATA evidence — NOT from CNTT intake alone
spec_ref: po-hrm-pay-cntt-sa-01.md §4 HOLD · po-hrm-amis-parity-sa-01.md SRC
cấm: claim payroll_e2e_ready · invent pay_sheet_template HTTP (already LIVE)
```

---

## Files touched

- `docs/architecture/ADR-HRM-PAY-MULTI-TEMPLATE-01.md` (new)
- `docs/architecture/ADR-HRM-PAY-XEVN-CUSTOMER-CNTT-01.md` (new)
- `docs/program/specs/PO-HRM-PAY-CNTT-SA-01.md` (new)
- `docs/qa/evidence/po-hrm-pay-cntt-sa-01.md` (this file)
