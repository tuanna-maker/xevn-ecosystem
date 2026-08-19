# BA-Process — implementation spec for sponsor-locked §7.3 / §7.4 / §7.5

| Meta | Value |
|---|---|
| work_item_id | BA-CTR-TPL-8-CLAUSE-MAP-01-S7-IMPL-01 |
| status | **READY_FOR_DEV** |
| source | `docs/program/specs/BA-CTR-TPL-8-CLAUSE-MAP-01.md` §7.1–§7.6 (sponsor-locked) |
| written_by | pm (docs-only, no `apps/**` changes) |
| plane_rule | Plane A/B: XBOS DB = master data; HRM DB has **no cross-plane FK**. `tenant_id` / `company_id` are `TEXT DEFAULT`, NOT UUID FK. |

This spec is a **handoff to dev**, not a claim of shipped code. Nothing here is implemented yet.

---

## 1. Data model

### 1.1 `template_clause_override` (new table, HRM DB)

| column | type | nullable | notes |
|---|---|---|---|
| `id` | `TEXT` (PK) | no | e.g. `TCO-<template_code>-<clause_id>` |
| `tenant_id` | `TEXT` | no | `DEFAULT` per tenant; indexed |
| `template_code` | `TEXT` | no | one of the 6 bound codes in §1.2 |
| `clause_id` | `TEXT` | no | canonical clause id, e.g. `CTR-CLAUSE-009` |
| `override_text` | `TEXT` | **yes** | **empty = manual fill** (sponsor option, §7.5). Empty is a first-class state, not a NULL-sentinel-for-missing. |
| `source` | `TEXT` | no | enum `template_file` / `company_specific` / `manual` |
| `updated_by` | `TEXT` | yes | admin user id |
| `updated_at` | `TIMESTAMP` | no | `DEFAULT now()` |
| `deleted_at` | `TIMESTAMP` | yes | **soft-delete only. Hard-delete forbidden.** |
| `created_at` | `TIMESTAMP` | no | `DEFAULT now()` |

- Unique key: `(tenant_id, template_code, clause_id)` — one override row per (tenant, template, clause).
- Tenants may insert/update/soft-delete their own rows. **Platform catalog rows cannot be hard-deleted by tenants** (existing rule; this table has no platform rows).

### 1.2 The 6 bound template codes (sponsor Q2, §7.3)

| template_code | pack | term |
|---|---|---|
| `XEVN_FT_12M_OFFICE` | IT_OFFICE | +12 |
| `XEVN_FT_24M_OFFICE` | IT_OFFICE | +24 |
| `XEVN_INDEF_OFFICE` | IT_OFFICE | KXĐ |
| `XEVN_FT_12M_DRIVER` | DRIVER | +12 |
| `XEVN_FT_24M_DRIVER` | DRIVER | +24 |
| `XEVN_INDEF_DRIVER` | DRIVER | KXĐ |

### 1.3 The 2 dropped TV codes (sponsor Q2 — do NOT bind)

| template_code | reason |
|---|---|
| `XEVN_PROBATION_OFFICE` | TV = probation contract; BLLĐ 2019 **Đ.24 khoản 3** governs it separately |
| `XEVN_PROBATION_DRIVER` | same |

Composer UI hides the TV tab when `bind_count=6` is active. Re-enable by flipping a config flag — no code change needed to add them back.

### 1.4 `insurance_salary_vnd` (sponsor Q1 + Q3, §7.2 / §7.4)

- **SoT**: the C&B compensation pack line (`employee_compensation_packages/lines`). Per Plane A/B this lives in the C&B plane; HRM reads it, does not own it, and makes **no cross-plane FK**.
- **Column**: `insurance_salary_vnd` (BIGINT/NUMERIC, nullable) on the compensation line.
- **Default**: `base_salary_vnd` at write time. **Editable** — admin may override.
- **Bootstrap (sponsor Q3 = OPTIONAL)**: if no C&B pack exists, the field is left blank / filled by hand. `required_by_law=true` for `ft_*` template rows stays true as a *legal* requirement, but the **system does not block creation** on it. UI shows a **soft warning**, not a hard error. No auto-derivation, no seed data.
- **Cap hint (NOT YET VERIFIED — §7.6 row 2/4)**: 2× regional minimum wage, per province. Display-only, computed, **not user-editable**. If research (deferred, §7.6 row 1) shows it is "just a number", drop the hint and take the simpler "one more salary catalog entry + fill the number" path.

---

## 2. BE contract

All endpoints under global prefix `api/hrm`, internal-key or JWT auth per existing HRM convention.

| method | path | purpose | auth |
|---|---|---|---|
| GET | `/contract-templates/:template_code/clauses` | list canonical clauses for a template, with per-template override merged in | internal / JWT |
| GET | `/contract-templates/:template_code/clauses/:clause_id` | single clause + its override | internal / JWT |
| PUT | `/contract-templates/:template_code/clauses/:clause_id` | upsert override (`override_text`, `source`). Idempotent. | admin |
| GET | `/contract-templates/bound-codes` | returns the 6 bound codes (+ `bind_count`). Config-driven, no hard-code. | internal / JWT |
| DELETE | `/contract-templates/:template_code/clauses/:clause_id` | **soft-delete only** (`deleted_at = now()`). Hard-delete forbidden. | admin |

**Validation rules:**
- `template_code` must be one of the 6 bound codes (or the TV codes if the config flag is flipped). Unknown code -> `HRM-VAL-001`.
- `clause_id` must be a known canonical clause. Unknown -> `HRM-VAL-001`.
- `source` must be in `template_file` / `company_specific` / `manual`.
- `override_text` may be empty (explicitly allowed).
- `insurance_salary_vnd` missing on an `ft_*` row -> **soft warning in the response payload** (`warnings: [...]`), **not** a rejection. HTTP 200.

**Error codes:** reuse `HRM-VAL-001` (validation), `HRM-AUTH-001` (unauthorized), `HRM-NF-001` (not found). Do not invent a new family.

**Idempotency:** `PUT` is upsert — repeat with the same body returns the same row, no duplicate.

---

## 3. FE contract (composer)

- **TV tab hidden** when `bind_count=6` (config from `GET /contract-templates/bound-codes`). Re-enable by flipping the flag.
- **Per-template clause list resolved at render time** — no hard-coded mapping. Fetch `GET /contract-templates/:template_code/clauses`, merge override, render.
- **Empty `override_text` -> free-text manual-fill area** (sponsor Q4 option). First-class, not a fallback hack. Label it clearly ("Điền tay").
- **`insurance_salary_vnd` soft warning badge** — shown when the field is blank on an `ft_*` row; does not block save.
- **Cap hint** — read-only computed line under the salary field. Marked "Chưa xác định luật" until research verifies it.
- Empty / error states: list empty -> "Chưa có điều khoản nào"; API error -> banner + retry, never a silent blank.

---

## 4. Scope parity — IN vs OUT

**IN scope for the dev WI that follows this spec:**
- `template_clause_override` table + migration
- the 6 bound / 2 dropped template_codes config
- the BE endpoints in §2
- the composer FE changes in §3

**OUT of scope (do NOT touch — Cursor-held or other lane):**
- `apps/web/hrm/src/components/payroll/policy-pack/**` — `D-PAY-CNTT-FE-POLICY-PACK-RESTORE-01`
- `ContractCreateStep1GeneralGrid.tsx`, `ContractCbReadOnlyCard.tsx`, `ContractCreateWizardDialog.tsx` — `D-FE-CTR-CB-BOOT-01`
- `apps/api/hrm-api/src/contracts-insurance/**` — `D-BE-CTR-CB-BOOT-01`
- `apps/api/hrm-api/src/payroll/**` — `PO-HRM-PAY-CNTT-BE-02`
- `apps/web/x-bos-core/**` — XBOS lane
- `policy-pack/**` generally

---

## 5. Exit criteria for the dev WI

- All §2 endpoints wired; `tsc --noEmit` exit 0; relevant jest/vitest suites pass.
- Live curl evidence against **:28001** (HRM BE) for each endpoint: 200 + real JSON for the happy path, `HRM-VAL-001` for the malformed path, soft-warning payload (not rejection) for missing `insurance_salary_vnd`.
- Evidence file `docs/qa/evidence/<wi>.md` with `ack_status` in `READY_FOR_QA` / `PASS_TO_PM` / `PASS_WITH_HOLD` / `FAIL_TO_PM` / `BLOCKED`.
- U65: no seed data. Verification from FE, not from a seeded DB row.