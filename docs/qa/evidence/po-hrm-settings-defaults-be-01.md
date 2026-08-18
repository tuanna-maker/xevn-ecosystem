# Evidence — PO-HRM-SETTINGS-DEFAULTS-BE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-SETTINGS-DEFAULTS-BE-01` |
| **parent** | `PO-HRM-SETTINGS-DEFAULTS-API-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P1 |
| **change_mode** | ADD |
| **date** | 2026-08-07 |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · U65 zero-seed · no FE this seat · no AMIS parity DONE |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md` F-SET-TAX/SI/POS-* | Paths · DTO · errors · SRC-02 · SI-412 |
| 2 | `docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md` §2–§4 | Physical DDL · VAL matrix |
| 3 | `docs/qa/evidence/po-hrm-settings-defaults-api-01.md` | Unlock BE · residual R1 |
| 4 | Peer ALLOW-CAT (`resolveHrmSettingsCatalogCompanyId` · `HRM-ALLOW-CAT-ORPHAN-CODE`) | Scope + orphan |
| 5 | Peer CTR `hrm_company_settings` ensureSchema | Shared KV table |

---

## 2. Deliverable (apps)

| Path | Cap |
|------|-----|
| `settings/settings-defaults.constants.ts` | Error taxonomy · open keys |
| `settings/dto/settings-defaults.dto.ts` | Wire DTOs |
| `settings/settings-tax-params.service.ts` | F-SET-TAX-01 + process TAX-412 |
| `settings/settings-company-settings.controller.ts` | `GET/PUT /settings/company-settings` |
| `settings/insurance-rate-cfg.service.ts` | F-SET-SI-01..03 + `pickActiveRateForPeriod` → SI-412 |
| `settings/insurance-rate-cfg.controller.ts` | CRUD + retire + DELETE→409 |
| `settings/position-compensation-policy.service.ts` | F-SET-POS-01..05 resolve read-only |
| `settings/position-compensation-policy.controller.ts` | CRUD + `/resolve` before `:id` |
| `settings/settings-defaults.service.spec.ts` | VAL-SET-TAX/SI/POS · scope · SRC-02 spy |
| `app.module.ts` | Controllers + providers wired |
| Peer fix: `allowance-catalog-sync.service.ts` `countActivePolicyLines` | Align to lines schema (no `status` col) |

---

## 3. ensureSchema

| Table | Action |
|-------|--------|
| `hrm_company_settings` | **EXPAND** usage (CREATE IF NOT EXISTS shared) — `pay_tax_*` keys only on Settings mount |
| `pay_insurance_rate_cfg` | **ADD** + CHK status/rates/dates · **no** closed `insurance_type_key IN` |
| `hrm_position_compensation_policy` | **ADD** + UQ active + CHK |
| `hrm_position_compensation_policy_lines` | **ADD** + UQ line code · FK header |

Soft-delete only (retire / `archived_at`).

---

## 4. Live paths

| F-id | METHOD / path |
|------|---------------|
| F-SET-TAX-01 | `GET/PUT /api/hrm/settings/company-settings` |
| F-SET-SI-01..03 | `GET/POST/PATCH /api/hrm/settings/insurance-rate-cfg` · `POST …/{id}/retire` · `DELETE`→409 |
| F-SET-POS-01..04 | `GET/POST/PATCH …/position-compensation-policies` · retire |
| F-SET-POS-05 | `GET …/position-compensation-policies/resolve` — draft only |

Scope: `resolveHrmSettingsCatalogCompanyId` (main→holding) on list/get/mutate/resolve.

---

## 5. Verification

```text
pnpm exec jest --testPathPatterns=settings-defaults.service.spec --no-coverage
→ Test Suites: 1 passed · Tests: 17 passed

pnpm exec tsc -p tsconfig.build.json --noEmit
→ exit 0
```

| VAL | Evidence in jest |
|-----|------------------|
| VAL-SET-TAX-01/02 | 400 `HRM-SET-TAX-400-SHAPE` |
| VAL-SET-TAX-03 | GET missing → value null + meta.cta |
| VAL-SET-TAX-04 | `readRequiredTaxValue` → 412 |
| VAL-SET-SI-01 | overlap → 409 |
| VAL-SET-SI-03 | `pickActiveRateForPeriod` → **412** `HRM-SET-SI-412-MISSING` |
| VAL-SET-SI-05 | hard DELETE → 409 |
| VAL-SET-SI-04 / scope | list↔get holding · member OOS |
| VAL-SET-POS-01 | 400 `HRM-SET-POS-400-KEY` |
| VAL-SET-POS-02 | 400 `HRM-ALLOW-CAT-ORPHAN-CODE` |
| VAL-SET-POS-03 | 409 active dup |
| VAL-SET-POS-04 | resolve spy — **no** emp INSERT/UPDATE |
| NO_POLICY | resolve empty 200 + warning (not 412) |

---

## 6. Locks honored

| Lock | Status |
|------|--------|
| SRC-02 resolve ≠ emp write | PASS (spy) |
| SI missing → 412 not silent 0% | PASS (helper exported) |
| soft-delete only | PASS |
| scope_parity | PASS |
| open catalogs | PASS (no key IN CHECK) |
| ORPHAN-CODE when PC ≠ ∅ | PASS |
| `payroll_e2e_ready=false` | unchanged |
| U65 zero-seed | no seed |

---

## 7. Residual

| # | Item | Owner |
|---|------|-------|
| R1 | QA L1 API smoke Settings defaults paths | **qa** |
| R2 | FE Settings tax/SI/position U65 | dev-fe (after QA) |
| R3 | PAY process wire tax KV + SI snapshot/412 live | PAY wave |
| R4 | Optional browser UF after FE | qa |

---

## completion_report

### Closed

1. ensureSchema for tax KV (shared) + `pay_insurance_rate_cfg` + position policy(+lines).
2. Nest controllers under `/api/hrm/settings/*` for TAX / SI / POS + resolve.
3. Process helpers: `readRequiredTaxValue` → TAX-412; `pickActiveRateForPeriod` → SI-412.
4. POS-05 resolve read-only (SRC-02) — jest spy no emp mutate.
5. Orphan assert `HRM-ALLOW-CAT-ORPHAN-CODE` when PC/SC catalog ≠ ∅.
6. `@CODE-MEMORY` on new modules; jest 17 PASS; tsc noEmit PASS.

### Residual

- QA smoke L1; FE + PAY process wire deferred.

### Explicit non-claims

- Not AMIS Step1 DONE · not `payroll_e2e_ready=true` · not Settings UI · no UF seed.

---

## next_owner

**qa** (`PO-HRM-SETTINGS-DEFAULTS-QA-01`)

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-DEFAULTS-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-SETTINGS-DEFAULTS-BE-01
priority: P1

## Goal
L1 API smoke Settings defaults BE (U65 zero-seed — probe OK as L1 secondary; not UF 🟢):
- GET/PUT /api/hrm/settings/company-settings?company_id=main&key|prefix=pay_tax_
- CRUD /api/hrm/settings/insurance-rate-cfg + retire; DELETE → 409; pick helper SI-412 unit already green
- CRUD position-compensation-policies + GET …/resolve (empty NO_POLICY 200; no emp write)
Cite: docs/qa/evidence/po-hrm-settings-defaults-be-01.md · API-01 F.1

## Locks
- payroll_e2e_ready=false · no seed for UF · SRC-02 · SI-412 honesty
- scope_parity main→holding group CEO

## exit_criteria
- evidence docs/qa/evidence/po-hrm-settings-defaults-qa-01.md
- ack_status PASS_TO_PM (or FAIL with residual work_item)
```

---

## evidence_path

`docs/qa/evidence/po-hrm-settings-defaults-be-01.md`

## ack_status

**READY_FOR_QA**
