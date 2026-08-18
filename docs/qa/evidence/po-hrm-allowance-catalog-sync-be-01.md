# Evidence — PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-01` (`ALLOW-CAT-BE-01`) |
| **parent** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P0 |
| **change_mode** | ADD |
| **date** | 2026-08-07 |
| **sponsor_confirm** | ALLOWANCE-CATALOG-SYNC-API-01 CONFIRMED 2026-08-07 |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · U65 zero-seed · no UF claim |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md` F-ALLOW-CAT-01..05 + §4 PAY guard | Paths · DTO · errors · dual-write |
| 2 | `docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md` §3–§5 | Physical DDL · mirror map · MergeToken |
| 3 | `docs/qa/evidence/po-hrm-allowance-catalog-sync-api-01.md` | Unlock checklist R1–R5 |
| 4 | `apps/api/hrm-api/src/payroll/payroll-catalog.service.ts` | EXPAND guard (merge, no fork) |
| 5 | `apps/api/hrm-api/src/settings-catalogs/` | `resolveHrmSettingsCatalogCompanyId` · overview · CATALOG_FAMILIES |

---

## 2. Delivered

| Cap | Implementation |
|-----|----------------|
| **DDL** | `ensureSchema` ADD `public.hrm_allowance_deduction_types` + UQ/IX/CHK (entry_kind/nature/calc_mode/status/code format) — **no** closed `code IN (...)` |
| **MergeToken origin** | EXPAND `MERGE_TOKEN_ORIGINS` + `chk_hrm_merge_tok_origin` → `allowance_catalog` |
| **F-ALLOW-CAT-01..05** | `GET\|POST\|PATCH /settings/allowance-deduction-types` · `POST …/:id/retire` · `GET …/:id/merge-tokens` |
| **Sync TX** | `AllowanceCatalogSyncService` — single `withTransaction`: PC → SC UPSERT → token UPSERT → `salary_component_id` back-ref |
| **Scope** | `resolveHrmSettingsCatalogCompanyId` + `resolveHrmListScope` list↔get parity |
| **PAY guard** | POST/PATCH/DELETE `salary-components` → `HRM-ALLOW-CAT-409-DUAL-WRITE` / `409-LINKED` for `phu_cap`\|`khau_tru` / linked PC |
| **CATALOG_FAMILIES** | `allowance_deduction` → `allowance_deduction_types` (+ aliases) |
| **Overview** | Settings overview synthesizes PC/KT row (count+sample); empty honest |

### Files

- `apps/api/hrm-api/src/settings/allowance-catalog.constants.ts`
- `apps/api/hrm-api/src/settings/allowance-catalog-sync.service.ts`
- `apps/api/hrm-api/src/settings/allowance-catalog.controller.ts`
- `apps/api/hrm-api/src/settings/dto/allowance-deduction-type.dto.ts`
- `apps/api/hrm-api/src/settings/allowance-catalog-sync.service.spec.ts`
- EXPAND: `payroll-catalog.service.ts` · `merge-token.constants.ts` · `merge-tokens.service.ts` · `hrm-settings-master-keys.ts` · `settings-catalogs.service.ts` · `app.module.ts`

---

## 3. Jest evidence

```text
npx jest src/settings/allowance-catalog-sync.service.spec.ts \
  src/payroll/payroll-catalog.service.spec.ts \
  src/merge-tokens/merge-tokens.scope-parity.spec.ts \
  --no-coverage --forceExit

Test Suites: 3 passed, 3 total
Tests:       33 passed, 33 total
```

Covered: VAL-ALLOW-01..07, 09/10 rollback, 11/13 PAY guard, 12/06 scope_parity, 14/15 sync+token, ensureSchema open catalog, CATALOG_FAMILIES, origin EXPAND, PAY-native `luong` not blocked.

---

## 4. Non-claims / residual

| Item | Status |
|------|--------|
| `payroll_e2e_ready` | **false** |
| FE Settings PC/KT UI | not this seat |
| VAL-ALLOW-08 orphan consumer (policy write) | downstream SETTINGS-DEFAULTS |
| Orphan SC → PC backfill | ops waiver R5 — not U65 seed |
| Browser UF | QA after FE or L1 API smoke |

---

## completion_report

### Closed

1. Physical PC catalog + MergeToken `allowance_catalog` origin EXPAND.
2. F-ALLOW-CAT-01..05 Nest surface under Settings prefix with single-TX sync.
3. PAY dual-write guard locked for PC/KT class; PAY-native create kept.
4. CATALOG_FAMILIES + overview synthesis.
5. Jest 33 PASS touched modules; `@CODE-MEMORY` APPEND on touched services.

### Residual

- QA L1 smoke on `/api/hrm/settings/allowance-deduction-types` + PAY POST `phu_cap` → 409.
- FE Settings screen after QA smoke.
- Downstream policy orphan assert VAL-ALLOW-08.

---

## next_owner

**qa**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ALLOWANCE-CATALOG-SYNC-QA-01
alias: ALLOW-CAT-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-ALLOWANCE-CATALOG-SYNC-01
priority: P0
change_mode: ADD
sponsor_confirm: ALLOWANCE-CATALOG-SYNC-API-01 CONFIRMED · BE-01 READY_FOR_QA 2026-08-07

## read_first
1. docs/qa/evidence/po-hrm-allowance-catalog-sync-be-01.md
2. docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md F-ALLOW-CAT-01..05 + VAL-ALLOW-*
3. docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md §3–§5

## task
L1 API smoke (U65 zero-seed): POST Settings allowance-deduction-types create PC_DIEU_XE → 201 + salaryComponentId + merge token;
GET list/get scope_parity main→holding; GET …/merge-tokens; POST PAY salary-components phu_cap → 409 HRM-ALLOW-CAT-409-DUAL-WRITE;
GET PAY salary-components includes mirrored code; retire soft; empty list honest 200 [].
No browser UF required if FE absent — mark FE deferred. Evidence docs/qa/evidence/po-hrm-allowance-catalog-sync-qa-01.md.
ack_status PASS_TO_PM; payroll_e2e_ready=false.

## must_keep
U65 no seed · soft-delete · open N+1 · PAY-native LUONG_CO_BAN not forced via PC
```

---

## evidence_path

`docs/qa/evidence/po-hrm-allowance-catalog-sync-be-01.md`

## ack_status

**READY_FOR_QA**
