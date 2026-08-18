# Evidence — PO-HRM-SETTINGS-DEFAULTS-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-DEFAULTS-DATA-01` |
| **parent** | `PO-HRM-AMIS-PARITY-SETTINGS-DEFAULTS-BA-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P1 |
| **change_mode** | ADD · CONFIRMED physical |
| **date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** AMIS parity DONE · **cấm** invent LIVE · **cấm** `apps/**` · U65 zero-seed |
| **spec_path** | `docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md` |

---

## 0. Read ack (ordered)

| # | Artifact | Used |
|---|----------|------|
| 1 | `po-hrm-amis-parity-settings-defaults-ba-01.md` | BR-AMIS-SET-DEF-01..08 · UC-SET-DEF-01..06 · AC-AMIS-SET-* · §7 entity delta · Q1 prefill |
| 2 | `PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md` | Dual SoT CONFIRMED · `component_code` · VAL-ALLOW-08 · unblocks policy lines |
| 3 | `PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md` | F.1 CONFIRMED · scope resolver peer |
| 4 | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` | Option B Catalog/KV · L1/L6 open + soft-delete |
| 5 | `DB_DESIGN_HRM_ENTERPRISE.md` §5.4 | Logical `pay_insurance_rate_cfg` columns |
| 6 | Nest `hrm_company_settings` ensureSchema (CTR) | LIVE KV table — EXPAND keys only |
| 7 | `PO-HRM-E2E-LINK-EMP-DB-01.md` | `hrm_insurance_rate_period` ≠ company master |
| 8 | Emp salary history DATA | SRC-02 emp C&B wins — policy prefill-only |

---

## 1. Verdict — CONFIRMED

| Topic | Stamp |
|-------|--------|
| Tax | **EXPAND** `hrm_company_settings` keys `pay_tax_*` (typed `value_json`) |
| SI company rates | **ADD** `pay_insurance_rate_cfg` (Nest ABSENT → physical from §5.4 + OU/version) |
| Position × PC | **ADD** `hrm_position_compensation_policy` + `_lines` |
| `component_code` | Soft FK to dual SoT PC/SC — **BR-AMIS-SET-DEF-03/08** |
| SRC-02 | **Still wins** — GĐ1 **prefill-only**; **FORBIDDEN** PROCESS runtime policy override |
| SI ≠ enrollment | Master CFG **≠** `hrm_insurance_rate_period` |
| Unlock | **sa** `PO-HRM-SETTINGS-DEFAULTS-API-01` |

---

## 2. Physical summary

### 2.1 Tax KV (EXPAND LIVE)

| Key (starter) | Shape |
|---------------|-------|
| `pay_tax_personal_deduction_vnd` | `{ amount, currency }` |
| `pay_tax_dependent_deduction_vnd` | `{ amount, currency }` |
| `pay_tax_regime` | `{ code, note? }` |
| `pay_tax_flags` | `{ apply_personal_deduction, apply_dependent_deduction }` |

Open registry — no closed CHECK on key set.

### 2.2 `pay_insurance_rate_cfg` (ADD)

Columns: `company_id`, optional `ou_id`, open `insurance_type_key`, `employee_rate_pct`, `employer_rate_pct`, `ceiling_amount`, `effective_from/to`, `status`, soft `archived_at`, versioning via new row + `supersedes_id`.

**Process:** missing active row → **412** `HRM-SET-SI-412-MISSING` — **cấm** silent 0% (V-13).

### 2.3 Position policy (ADD)

- Header: `(company_id, ou_id?, position_key, effective_*)` — catalog `position_key` only.
- Lines: `component_code` + `amount` + `calc_mode` — orphan code rejected when PC catalog ≠ ∅.
- Consumer: **F-SET-POS-05 resolve** → C&B draft → confirm save → emp packages.

---

## 3. Validation extract

| ID | PASS | FAIL |
|----|------|------|
| VAL-SET-TAX-01..04 | Typed KV · no Nest const | Magic FE/Nest GTGC |
| VAL-SET-SI-01/03 | No overlap · missing→412 | Silent 0% · overlap |
| VAL-SET-POS-01/02 | Catalog position + dual SoT code | Free-text SoT |
| VAL-SET-POS-04/05 | Prefill + SRC-02 emp wins | Auto-save / policy overwrite process |

Full: spec §6.

---

## 4. Traceability (acceptance targets)

| BR / AC / UC | Evidence expectation (QA later) |
|--------------|----------------------------------|
| **BR-AMIS-SET-DEF-01** · **AC-AMIS-SET-TAX-01** | Settings đổi `pay_tax_*` → 2xx → F5 → process var reflects |
| **BR-AMIS-SET-DEF-02** · **AC-AMIS-SET-SI-01** | BHXH row % + ceiling → F5 → process snapshot ≠ silent 0 |
| **BR-AMIS-SET-DEF-04** · **AC-AMIS-SET-POS-01** | Map DRIVER→PC → hire C&B **prefill** → confirm Lưu |
| **BR-AMIS-SET-DEF-05** · **AC-AMIS-SET-POS-02** · **SRC-02** | Emp Y vs policy X → process **Y** |
| **BR-AMIS-SET-DEF-06** · **AC-AMIS-SET-SCOPE-01** | Member vs holding scope_parity · no 409 banner |
| **UC-SET-DEF-01..06** | Mapped to F-SET-TAX/SI/POS hints |
| **J-HRM-SET-DEF-01/02** | Browser after FE mount |

---

## 5. scope_parity (U19)

| Pair | Rule |
|------|------|
| SI list ↔ get-by-id | Same `resolveHrmListScope` / settings company resolve |
| Policy list ↔ get ↔ resolve | Same; OU filter when `ou_id` set |
| Tax GET/PUT | Same company partition as CTR CFG / ALLOW-CAT |
| Deep link | Holding rollup iff peer Settings catalogs allow |

---

## 6. Explicit non-claims

- No DDL / `ensureSchema` executed this seat.
- No `apps/**` changes.
- No Settings UI LIVE / UF PASS.
- No PROCESS SI/tax apply LIVE (PAY wave residual).
- No runtime policy fallback (P2 / sponsor only).
- **`payroll_e2e_ready=false`**.

---

## completion_report

### Closed

1. **CONFIRMED EXPAND** `hrm_company_settings` `pay_tax_*` registry (shapes + VAL) — cite LIVE Nest table.
2. **CONFIRMED ADD** `pay_insurance_rate_cfg` physical (≠ enrollment `hrm_insurance_rate_period`) with overlap + missing→412.
3. **CONFIRMED ADD** `hrm_position_compensation_policy` + `_lines` with dual-SoT `component_code` and catalog `position_key`.
4. **SRC-02 lock:** prefill-only GĐ1; process never silent-overwrite emp C&B.
5. Validation **VAL-SET-TAX/SI/POS-*** + API F.1 hints **F-SET-*** for SA.
6. Traceability to **BR-AMIS-SET-DEF-01..08** · **UC-SET-DEF-01..06** · **AC-AMIS-SET-***.
7. Spec SoT published; unlock SA/BE settings defaults — **no apps/**.

### Residual

- SA API F.1 full DTO (R1).
- BE ensureSchema + jest (R2).
- FE Settings U65 (R3).
- PAY process snapshot wire (R4).
- Group publish GĐ2 (R5).

---

## next_owner

**pm** → **sa** (`PO-HRM-SETTINGS-DEFAULTS-API-01`)

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-DEFAULTS-API-01
from_role: pm
to_role: sa
lane: governance
parent: PO-HRM-SETTINGS-DEFAULTS-DATA-01
priority: P1
change_mode: ADD

## Goal
API_DESIGN F.1: F-SET-TAX-01 · F-SET-SI-01..03 · F-SET-POS-01..05 — Settings defaults CRUD + resolve prefill (read-only). Cite docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md §7. Lock SRC-02: resolve ≠ process write; SI missing → 412 not silent 0%.

## read_first
1. docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md
2. docs/qa/evidence/po-hrm-settings-defaults-data-01.md
3. docs/qa/evidence/po-hrm-amis-parity-settings-defaults-ba-01.md §4–§6
4. docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md (scope + orphan code peer)

## entry_criteria
- ba-data PASS_TO_PM this evidence · ALLOW-CAT DATA+API CONFIRMED
- payroll_e2e_ready=false · no apps/**

## exit_criteria
- evidence docs/qa/evidence/po-hrm-settings-defaults-api-01.md
- Each F-id: Mục đích · Nghiệp vụ · bước SRS (UC-SET-DEF-*) · DTO↔column · errors VAL-SET-*
- ack_status PASS_TO_PM → unlock dev-be SETTINGS-DEFAULTS-BE-01
- must_keep: SRC-02 prefill-only · soft-delete · scope_parity U19 · open catalogs
```

---

## evidence_path

`docs/qa/evidence/po-hrm-settings-defaults-data-01.md`

## ack_status

**PASS_TO_PM**
