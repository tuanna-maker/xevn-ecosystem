# P1-HRM-EMP-DUP-KEY-BE — Employees list duplicate React keys

**Date:** 2026-07-16  
**work_item_id:** P1-HRM-EMP-DUP-KEY-BE  
**Owner:** Dev-BE  
**Environment (symptom):** http://14.225.217.232:8088 — group CEO `ceo@xe.vn` — HRM Employees DataTable  
**spec_ref:** CD-FB-03 / HRM employees list scope parity  
**U65:** no seed used for this BE fix/evidence

## Symptom

React warning: `Encountered two children with the same key, '<uuid>'` — dozens of employee UUIDs appear twice.  
Stack: `DataTable` → `Employees.tsx` `keyExtractor={(emp) => emp.id}`.

## Root cause (confirmed)

Not a JOIN multiplying rows, and not duplicate PK rows in `public.employees`.

`GET /api/hrm/employees` used:

```sql
ORDER BY created_at DESC
LIMIT $n OFFSET $m
```

Bulk workforce rows often share the same `created_at`. Without a unique tiebreaker, PostgreSQL OFFSET pagination is **unstable across pages**. FE `listAllEmployees` walks page 1..N (`page_size` ≤ 100) and concatenates → the same `id` can appear on adjacent pages → React duplicate keys.

Group rollup (`company_id=main` + `group_ceo`) only increases page count (~1100 NV), which makes overlap more visible.

## Fix

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/employees/employees.service.ts` | `listEmployees`: `ORDER BY created_at DESC, id DESC` |
| same | `listEmployeeDirectory`: `ORDER BY full_name ASC, employee_code ASC, id ASC` |
| `p1-hrm-emp-dup-key-be.spec.ts` | Regression: stable ORDER BY + multi-page unique ids under main/group scope |
| `p1-phase1-be-emp-create-parity.spec.ts` | Match new ORDER BY; fix INSERT mock `custom_fields` at `$9` (avatar at `$8`) |

No FE-only patch. Scope filters (`resolveHrmListScope` / `pushEmployeeListScopeFilters`) unchanged.

## Verification

```text
pnpm --filter @xevn/platform-core build
pnpm --filter hrm-api exec jest src/employees/p1-hrm-emp-dup-key-be.spec.ts src/employees/employees.service.spec.ts src/employees/p1-phase1-be-emp-create-parity.spec.ts --no-coverage
```

**Result:** 3 suites / **24/24 PASS** (including `P1-HRM-EMP-DUP-KEY-BE` **3/3**).

## QA retest (browser, U65)

1. Login `ceo@xe.vn` / `Xevn@2026` → HRM → Nhân viên (`companyId=main`).
2. Open DevTools console — no duplicate key warnings for employee UUIDs.
3. Network: multiple `GET /api/hrm/employees?page=…` if FE still paginates; concatenated ids unique.
4. Optional: F5 — list still unique keys.

## Residual

- VPS `:8088` needs hrm-api deploy/recreate for prod symptom clear (devops).
- FE may still call multi-page `listAllEmployees`; stable BE sort is sufficient for uniqueness.

## Handoff

- `ack_status`: **READY_FOR_QA**
- `next_owner`: qa
