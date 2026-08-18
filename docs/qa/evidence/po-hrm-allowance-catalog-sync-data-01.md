# Evidence — PO-HRM-ALLOWANCE-CATALOG-SYNC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-01` |
| **parent** | `PO-HRM-AMIS-PARITY-SETTINGS-DEFAULTS-BA-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P0 |
| **change_mode** | ADD |
| **date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** AMIS parity DONE · **cấm** invent LIVE · **cấm** `apps/**` · U65 zero-seed |

---

## 0. Read ack (ordered)

| # | Artifact | Used |
|---|----------|------|
| 1 | `po-hrm-amis-parity-settings-defaults-ba-01.md` §5 BR-AMIS-SET-DEF-03 · §7 entity delta · AC-AMIS-SET-PC-CAT-01 | P0 orphan blocker · dual bind requirement |
| 2 | `po-hrm-amis-parity-ba-01.md` §1 EMP PC/KT **GAP P0** | AMIS catalog + position policy dependency |
| 3 | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` Option B L1/L3/L6 | ICatalogRow + MergeToken + soft-delete |
| 4 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` §3 `hrm_merge_tokens` | Token physical + VAL-PLT-TOK-* |
| 5 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md` | AS-IS `salary_components` columns + F-PLT-PAY-COMP-* |
| 6 | `payroll-catalog.service.ts` ensureSchema | LIVE SC columns: nature, is_taxable, is_insurance_base, default_formula_definition_id, archived_at |
| 7 | `settings-catalogs.service.ts` extension schema | Generic extension **insufficient** for PC typed flags — dedicated table justified |
| 8 | `po-hrm-amis-parity-emp-salary-history-data-01.md` | `component_code` soft bind → `salary_components.code` |

---

## 1. Gap closed (design)

| Before | After (CONFIRMED paper) |
|--------|-------------------------|
| PC/KT Settings catalog paper-only | **ADD** `hrm_allowance_deduction_types` physical ICatalogRow |
| `salary_components` orphan from Settings | **Sync TX** on PC save → mirror SC same `code` |
| No merge token for PC on HĐ | **Register** `cb.allowance_{code}` / `cb.deduction_{code}` on save (BR-PLT-01) |
| Policy/C&B blocked on missing code | **Unblocks** `PO-HRM-SETTINGS-DEFAULTS-DATA-01` position policy lines |

---

## 2. Dual SoT decision record

| Question | Decision | Rationale |
|----------|----------|-----------|
| Which side writes? | **Settings PC catalog primary** | AMIS HCNS admin surface; UC-SET-DEF-03 |
| PAY direct POST for allowance? | **Reject dual-write GĐ1** (`HRM-ALLOW-CAT-409-DUAL-WRITE`) | Prevents new orphans |
| Link key | **`code` + `salary_component_id`** | U19 list/get parity + audit |
| Generic extension items? | **Not SoT** for typed PC | tax/SI/nature need columns |
| Closed code enum? | **FORBIDDEN** | BR-PLT-05 / CORR lesson |

---

## 3. Physical summary

**Table ADD:** `public.hrm_allowance_deduction_types` — 22 columns · UQ `(company_id, lower(code))` active · CHK on kind/nature/calc_mode/status only.

**Sync map:** §4 spec — 15 field mappings PC → `salary_components`.

**MergeToken:** `cb.allowance_{code_lower}` · `cb.deduction_{code_lower}` · domain `SET` · origin `allowance_catalog`.

**Master key ADD:** `allowance_deduction_types` (+ aliases).

---

## 4. Validation matrix (extract)

| ID | PASS when | FAIL when |
|----|-----------|-----------|
| VAL-ALLOW-01 | Unique active code per company | Duplicate → 409 |
| VAL-ALLOW-06 | get-by-id same scope as list | 404 scope under group CEO |
| VAL-ALLOW-08 | Catalog ≠ ∅ → picker only | Free-text component_code |
| VAL-ALLOW-09 | Sync TX atomic | Half mirror |
| VAL-ALLOW-11 | Linked SC cannot hard DELETE | Orphan break audit |

Full matrix: `docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md` §8.

---

## 5. Traceability (acceptance targets)

| AC / BR | Evidence expectation (QA later) |
|---------|----------------------------------|
| **AC-AMIS-SET-PC-CAT-01** | Settings Tạo `PC_DIEU_XE` → 2xx → F5 → Lương picker **same code** |
| **AC-PLT-PAY-01** | Template/policy picker from catalog when rows exist |
| **BR-AMIS-SET-DEF-03** | No policy line referencing absent SC code |
| **BR-PLT-01** | Token appears in merge list after PC save + F5 |
| **J-HRM-SET-DEF-01** | Browser CRUD path (after FE/API LIVE) |

---

## 6. scope_parity (U19)

| API pair | Rule |
|----------|------|
| `F-ALLOW-CAT-01` list ↔ get | Same `resolveHrmListScope` as `F-PLT-PAY-COMP-01` |
| Deep link | Settings PC id visible in holding rollup iff SC id would be |
| Member CEO | Own `company_id` slug only — no 409 on Settings load |

---

## 7. Explicit non-claims

- No DDL migration executed.
- No `apps/**` changes.
- No Settings UI LIVE.
- No position policy table (next WI).
- No backfill of existing orphan SC rows (residual R5 — ops waiver).
- **`payroll_e2e_ready=false`**.

---

## completion_report

### Closed

1. **CONFIRMED ADD** physical `hrm_allowance_deduction_types` with full column/FK/CHK/index spec.
2. **Dual SoT** write path: Settings PC → mirror `salary_components` + MergeToken register in single TX.
3. **Field sync matrix** nature · tax · SI · formula FK · soft-delete parity.
4. **Validation matrix** VAL-ALLOW-01..12 with deterministic HTTP codes.
5. **API F.1 hints** F-ALLOW-CAT-01..05 for SA deepen.
6. **Traceability** to BR-AMIS-SET-DEF-03 · AC-AMIS-SET-PC-CAT-01 · AC-PLT-PAY-01 · BR-PLT-01/02/04.
7. **Unblocks** `PO-HRM-SETTINGS-DEFAULTS-DATA-01` (position policy consumes `component_code`).

### Residual

- SA API F.1 full DTO (R1).
- BE ensureSchema + sync service (R2).
- Orphan SC backfill script — sponsor waiver only (R5).
- Direct PAY POST policy for allowance kinds — SA confirm reject path in F.1.

---

## next_owner

**pm** (dispatch) → **sa** (API F.1) parallel **ba-data** (`PO-HRM-SETTINGS-DEFAULTS-DATA-01` after sponsor CONFIRM)

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01
from_role: pm
to_role: sa
lane: governance
parent: PO-HRM-ALLOWANCE-CATALOG-SYNC-01
priority: P0
change_mode: ADD

## Goal
API_DESIGN F.1: F-ALLOW-CAT-01..05 — Settings PC/KT CRUD with dual-write sync to salary_components + hrm_merge_tokens register on save. Cite docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md §9 + PAY-CATALOG F-PLT-PAY-COMP peer paths.

## read_first
1. docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md
2. docs/qa/evidence/po-hrm-allowance-catalog-sync-data-01.md
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md
4. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md §3 merge tokens

## entry_criteria
- ba-data PASS_TO_PM this evidence
- payroll_e2e_ready=false · no apps/**

## exit_criteria
- evidence docs/qa/evidence/po-hrm-allowance-catalog-sync-api-01.md
- F.1 each function: Mục đích · Nghiệp vụ · bước SRS · DTO↔column · errors
- ack_status PASS_TO_PM → dev-be ALLOW-CAT-BE-01
- GĐ1 lock: reject direct PAY POST for allowance/deduction unless waiver (VAL-ALLOW dual-write)
```

**Parallel after API CONFIRM:**

```text
work_item_id: PO-HRM-SETTINGS-DEFAULTS-DATA-01
from_role: pm
to_role: ba-data
lane: governance
parent: PO-HRM-AMIS-PARITY-SETTINGS-DEFAULTS-BA-01
priority: P1
change_mode: ADD

## Goal
Physical delta: pay_insurance_rate_cfg CRUD · hrm_company_settings pay_tax_* registry · hrm_position_compensation_policy (+ lines) consuming component_code from ALLOWANCE-CATALOG-SYNC dual SoT.

## read_first
1. docs/qa/evidence/po-hrm-amis-parity-settings-defaults-ba-01.md §5–§7
2. docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md §10 traceability

## entry_criteria
- PO-HRM-ALLOWANCE-CATALOG-SYNC-01 CONFIRMED (this evidence)

## exit_criteria
- docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md
- evidence docs/qa/evidence/po-hrm-settings-defaults-data-01.md
- ack_status PASS_TO_PM · no apps/**
```

---

## evidence_path

- Spec: `docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md`
- Evidence: `docs/qa/evidence/po-hrm-allowance-catalog-sync-data-01.md`

## ack_status

**PASS_TO_PM**
