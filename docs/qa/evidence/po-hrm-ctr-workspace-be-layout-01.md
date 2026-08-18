# PO-HRM-CTR-WORKSPACE-BE-LAYOUT-01 — GET contract detail clause layout EXPAND

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-BE-LAYOUT-01` |
| **role** | dev-be |
| **date** | 2026-08-11 |
| **spec_ref** | `docs/program/specs/PO-HRM-CTR-WORKSPACE-SA-01.md` §4.1 · `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` §13 |
| **ack_status** | **READY_FOR_QA** |

## Summary

EXPAND `GET /api/hrm/contracts-insurance/contracts/:contractId` to return ContractWorkspace view-shell fields in one round-trip:

- `clause_ids` — effective order (overlay → template junction default)
- `print_overlay_clause_ids` — RETAIN persisted column
- `clause_layout[]` — read-only Settings library snapshot (`id`, `code`, `title_vi`, `body_vi`, `clause_group`, `mandatory`, `sort_order`)
- `can_issue` — same predicate as `previewContract` (`missing_fields` + `missing_clauses` empty)
- `preview_summary` — `pack_code`, `template_code`, missing arrays for disabled In/PDF tooltip

## Files changed

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.ts` | ADD `resolveContractDetailLayout`, `ClauseLayoutItem`, read-only clause loader |
| `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts` | `getContractById` merges layout enrichment; scope parity RETAIN |
| `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.spec.ts` | +2 jest (layout merge + fallback) |
| `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.spec.ts` | +1 jest (overlay order → clause_layout) |

## spec_read_ack

- **srs:** `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · FR-UC-BP-CORE-09a W1/W5
- **tech_spec:** `docs/program/specs/PO-HRM-CTR-WORKSPACE-SA-01.md` §4
- **db_design:** `employee_contracts.print_overlay_clause_ids` JSONB · `hrm_contract_clauses` library
- **api_design:** `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` §13.1 EXPAND GET detail

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest contracts-insurance.service.spec.ts -t "PO-HRM-CTR-WORKSPACE-BE-LAYOUT-01"
pnpm exec jest contract-legal-print.service.spec.ts -t "PO-HRM-CTR-WORKSPACE-BE-LAYOUT-01"
pnpm exec jest contracts-insurance.service.spec.ts
pnpm run build
```

| Check | Result |
|-------|--------|
| Layout jest (service) | PASS 2/2 |
| Layout jest (print) | PASS 1/1 |
| Full `contracts-insurance.service.spec.ts` | PASS 31/31 |
| `pnpm run build` | PASS |

## must_keep

- List ↔ get scope parity (`resolveContractsListScope`, employee UV branch)
- POST/PATCH registry **cấm** `body_vi` / inline clause text — print-overlay only
- `contracts_printable_ready=false` — `can_issue` is lightweight gate, not module UAT
- U65 — no seed in evidence

## Residual

- FE `PO-HRM-CTR-WORKSPACE-FE-01` must bind `clause_layout` on view step 2
- UV-only contracts: `can_issue=false` until `employee_id` set (preview requires employee row)
- Full printable module / issue-version QA deferred (honesty HOLD)

## next_owner

**qa** — browser retest J-HRM-CTR-VIEW-* after FE binds GET layout; **dev-fe** can proceed with partial overlay using GET fields now.
