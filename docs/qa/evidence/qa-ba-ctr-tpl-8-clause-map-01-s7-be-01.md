# Evidence — QA-BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-01

| Field | Value |
|---|---|
| work_item_id | QA-BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-01 |
| role | qa |
| date | 2026-08-18 |
| prior | ba-ctr-tpl-8-clause-map-01-s7-be-01.md (READY_FOR_QA) |
| migration | applied (IF NOT EXISTS — table created fresh, 10 columns + 3 indexes) |
| ack_status | PASS_TO_PM |

---

## Migration

Migration file: `apps/api/hrm-api/migrations/202608180000_create_template_clause_override.sql`

Applied via psycopg2 to `xevn_hrm` DB at `113.20.107.184:6432`.

Result: `CREATE TABLE IF NOT EXISTS template_clause_override` — executed successfully.

Table verified:
- 10 columns: id, tenant_id, template_code, clause_id, override_text, source, updated_by, updated_at, deleted_at, created_at
- Indexes: `template_clause_override_pkey`, `template_clause_override_tenant_id_template_code_clause_id_key` (UNIQUE), `ix_tco_tenant_id`

---

## Server

HRM BE running on `127.0.0.1:28001` (PID 28288, confirmed via netstat). No restart needed — ContractTemplatesModule already loaded.

---

## Test matrix

| Case | Assert | HTTP | Body Evidence | Result |
|------|--------|------|--------------|--------|
| 1 – GET /bound-codes | 200, `bind_count=6`, 6 bound_codes, no XEVN_PROBATION_* in bound_codes | 200 | `bind_count:6`, `bound_codes:["XEVN_FT_12M_OFFICE","XEVN_FT_24M_OFFICE","XEVN_INDEF_OFFICE","XEVN_FT_12M_DRIVER","XEVN_FT_24M_DRIVER","XEVN_INDEF_DRIVER"]`, dropped_codes contains XEVN_PROBATION_* | PASS |
| 2 – GET /XEVN_FT_12M_OFFICE/clauses | 200, `data.items` array, `warnings` field present | 200 | `items:[]`, `warnings:[\"insurance_salary_vnd is required by law...\"]` | PASS |
| 3 – GET /XEVN_PROBATION_OFFICE/clauses (invalid) | 400, `code=HRM-VAL-001` | 400 | `code:"HRM-VAL-001"`, `success:false` | PASS |
| 4 – PUT upsert clause CTR-CLAUSE-001 | 200/201, `data.item.clause_id=CTR-CLAUSE-001`, override_text matches | 200 | `id:"TCO-XEVN_FT_12M_OFFICE-CTR-CLAUSE-001"`, `clause_id:"CTR-CLAUSE-001"`, `override_text:"Dieu khoan test QA"`, `source:"manual"` | PASS |
| 5 – PUT idempotent (same body) | 200, no duplicate, same id | 200 | Same `id`, same `created_at` (2026-08-18T07:56:54.288Z), updated_at bumped — ON CONFLICT DO UPDATE confirmed | PASS |
| 6 – DELETE soft-delete CTR-CLAUSE-001 | 200, item has `deleted_at` set, not in GET list | 200 | `deleted_at:"2026-08-18T07:57:07.771Z"`, follow-up GET `/clauses` returns `items:[]`. DB confirms 1 soft-deleted row, 0 active rows | PASS |
| 7 – Auth guard (no header) | NOT 200 (401 or 403) | 401 | `code:"HRM-AUTH-001"`, `message:"Unauthorized"` | PASS |

---

## DB state post-test

```
table: template_clause_override
  id=TCO-XEVN_FT_12M_OFFICE-CTR-CLAUSE-001
  clause_id=CTR-CLAUSE-001
  is_soft_deleted=True

Active rows (deleted_at IS NULL): 0
```

No seed data used. All rows created and deleted via live API calls only (U65 compliant).

---

## Spec compliance cross-check

- [x] 6 bound codes only — XEVN_PROBATION_* correctly excluded from `bound_codes` array
- [x] `HRM-VAL-001` returned for invalid template_code (Case 3)
- [x] `warnings` field present in listClauses response for FT templates (Case 2)
- [x] PUT upsert idempotent — ON CONFLICT DO UPDATE confirmed (Case 5: same created_at, bumped updated_at)
- [x] Soft-delete only — deleted_at set, row not in GET list, hard-delete forbidden (not exposed)
- [x] Auth guard enforced — 401 without x-internal-api-key (Case 7)
- [x] `data.item.id` format = `TCO-<template_code>-<clause_id>` (Case 4)
- [x] Plane A/B: HRM DB only — migration applied to xevn_hrm database, no cross-plane FK

---

**ack_status:** PASS_TO_PM
