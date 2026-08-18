# QA Evidence — BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-01

| Field | Value |
|---|---|
| work_item_id | BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-01 |
| ack_status | READY_FOR_QA |
| coded_by | dev-be agent (Claude Sonnet 4.6) |
| date | 2026-08-18 |

---

## Files created / modified

| File | Lines | Action |
|---|---|---|
| `apps/api/hrm-api/migrations/202608180000_create_template_clause_override.sql` | 19 | CREATED |
| `apps/api/hrm-api/src/contract-templates/dto/clause-override.dto.ts` | 36 | CREATED |
| `apps/api/hrm-api/src/contract-templates/contract-templates.service.ts` | 188 | CREATED |
| `apps/api/hrm-api/src/contract-templates/contract-templates.controller.ts` | 94 | CREATED |
| `apps/api/hrm-api/src/contract-templates/contract-templates.module.ts` | 15 | CREATED |
| `apps/api/hrm-api/src/app.module.ts` | — | MODIFIED (added ContractTemplatesModule import) |

---

## tsc --noEmit output

```
contract-templates errors: 0
Total errors (all modules): 272 (pre-existing, not in contract-templates)
Return code: 2 (due to pre-existing spec file errors in attendance/be-erp)
```

**Conclusion:** 0 errors in contract-templates module. All 272 errors are pre-existing in other modules (attendance/*.service.spec.ts, be-erp-e*.spec.ts etc.) unrelated to this work item.

---

## 5 endpoints registered

| Method | Path | Handler |
|---|---|---|
| GET | `/api/hrm/contract-templates/bound-codes` | `getBoundCodes` |
| GET | `/api/hrm/contract-templates/:template_code/clauses` | `listClauses` |
| GET | `/api/hrm/contract-templates/:template_code/clauses/:clause_id` | `getClause` |
| PUT | `/api/hrm/contract-templates/:template_code/clauses/:clause_id` | `upsertClause` |
| DELETE | `/api/hrm/contract-templates/:template_code/clauses/:clause_id` | `softDeleteClause` |

---

## Spec compliance checklist

- [x] `template_clause_override` table created with all columns per spec §1.1
- [x] Unique constraint `(tenant_id, template_code, clause_id)`
- [x] Index on `tenant_id`
- [x] `id` format: `TCO-<template_code>-<clause_id>` (per spec)
- [x] `tenant_id` = TEXT DEFAULT, no cross-plane FK (Plane A/B doctrine)
- [x] 6 bound codes, 2 dropped codes (config-driven via `BOUND_TEMPLATE_CODES` constant)
- [x] `template_code` validation → `HRM-VAL-001` if invalid
- [x] `clause_id` format validation (must start with `CTR-CLAUSE-`) → `HRM-VAL-001`
- [x] `source` validation (template_file|company_specific|manual) → `HRM-VAL-001`
- [x] `override_text` empty string = valid first-class state (not rejected)
- [x] PUT = upsert (ON CONFLICT … DO UPDATE), idempotent
- [x] DELETE = soft-delete only (deleted_at = now()), hard-delete forbidden
- [x] `insurance_salary_vnd` missing on ft_* → soft warning in response (HTTP 200, `warnings: [...]`)
- [x] Error codes: HRM-VAL-001, HRM-AUTH-001, HRM-NF-001 (no new family)
- [x] Auth: `isAuthorizedInternalRequest` (JWT or internal-key)
- [x] `@CODE-MEMORY` in service file per spec
- [x] SOLID: Controller/Service/Module split, 1 file = 1 responsibility
- [x] No import from `apps/web/**`
- [x] No touch of Cursor-held paths

---

## Plane A/B compliance
- HRM DB only — no cross-plane FK
- `tenant_id` is TEXT NOT NULL (not UUID FK)
- No references to XBOS DB

## U65
- No seed data — DB rows created only via API calls
- QA must verify against live server, not seeded rows

---

ack_status: READY_FOR_QA
