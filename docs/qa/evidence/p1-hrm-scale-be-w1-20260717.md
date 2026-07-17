# P1-HRM-SCALE-BE-W1 — Employees list covering index + EXPLAIN

**Date:** 2026-07-17  
**work_item_id:** P1-HRM-SCALE-BE-W1  
**Owner:** Dev-BE  
**Environment:** `xevn_hrm` (deploy DB) — ~1190 employees; group CEO rollup scope  
**U65:** no seed used  

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` | §5.4 (stable ORDER BY + covering indexes); §6 W1 BE |
| `apps/api/hrm-api/src/employees/employees.service.ts` | `listEmployees` / `buildEmployeeListFilters` / `ensureSchema` |
| `docs/qa/evidence/p1-hrm-emp-dup-key-be-20260716.md` | ORDER BY `created_at DESC, id DESC` — **keep** (no regression) |
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` | employees list linkage (N_EMP ≥ 1000) |
| `migrations/hrm/0002_business_modules.sql` | legacy `idx_employees_company_archived` (3-col) |

**spec says:** Keep `ORDER BY created_at DESC, id DESC`; add covering index aligned to filter+sort `(company_id, archived_at, created_at DESC, id DESC)` (+ directory name/code/id).  
**code does:** Same ORDER BY unchanged; scope via `resolveHrmListScope` / `pushEmployeeListScopeFilters` unchanged; new indexes via migration `0015` + `ensureSchema`.

## Hot-path SQL (group CEO)

Equivalent to Nest `listEmployees` under JWT tenant `xevn` + `company_id=main` → `company_id = ANY(holding,trsport,logistics,finance,services)` + master tenant partition + `archived_at IS NULL`:

```sql
SELECT … FROM public.employees
WHERE company_id = ANY($1::text[])
  AND COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn') = 'xevn'
  AND archived_at IS NULL
ORDER BY created_at DESC, id DESC
LIMIT 50 OFFSET 0;
```

## EXPLAIN — before (legacy 3-col index present)

Indexes then: `idx_employees_company_archived (company_id, archived_at, created_at DESC)`, email unique partial, PK.

| Query | Plan summary | Actual |
|-------|----------------|--------|
| Group CEO page 1 | Bitmap Index Scan on **`uq_employees_company_email_active`** → Bitmap Heap → **Sort** (`created_at DESC, id DESC`) top-N heapsort → Limit | ~**2.7 ms**; 1107 rows scanned |
| Group CEO OFFSET 1000 | Same bitmap path → **Sort** quicksort (~1119 kB) → Limit | ~**3.2 ms** |
| COUNT same filter | Bitmap Heap (email unique) | ~**1.4 ms** |

**Finding:** Legacy index did **not** satisfy `id` tie-breaker; planner preferred email unique for `company_id ANY`; explicit Sort remained. Not a full-table seq scan, but Sort on full matching set every page.

## Change

| Artifact | Change |
|----------|--------|
| `migrations/hrm/0015_employees_list_order_covering_index.sql` | Add `idx_employees_company_archived_created_id` + `idx_employees_company_archived_name_code_id`; drop legacy 3-col; `ANALYZE` |
| `employees.service.ts` `ensureSchema` | Same DDL on Nest boot (local/dev parity) |
| `list-employees.query.dto.ts` | Comment only: UI prefer page_size 30–50; **@Max(100) unchanged** |
| API contract / scope | **No** semantic change; ORDER BY + `resolveHrmListScope` preserved |

DDL (normative):

```sql
CREATE INDEX IF NOT EXISTS idx_employees_company_archived_created_id
  ON public.employees (company_id, archived_at, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_employees_company_archived_name_code_id
  ON public.employees (company_id, archived_at, full_name ASC, employee_code ASC, id ASC);

DROP INDEX IF EXISTS public.idx_employees_company_archived;
```

Applied to deploy `xevn_hrm` during this wave (re-runnable via migration / `ensureSchema`).

## EXPLAIN — after

| Query | Plan summary | Actual |
|-------|----------------|--------|
| Group CEO rollup page 1 | **Seq Scan** + Filter + **Sort** top-N (stats estimate rows≈6 vs actual 1107; table ~1.2k → seq is cheap) | ~**1.6 ms** |
| Member single `company_id=holding` | **Index Only Scan** on `idx_employees_company_archived_created_id` + top-N Sort | ~**0.2 ms** |

**Interpretation:**

- Covering index **wins** for single-company / member CEO list (Index Only Scan).
- Group rollup `ANY(...)` + JSONB tenant predicate still ends in Sort at N≈1.1k; wall time **&lt; 3 ms** — within ADR T-P95-LIST (&lt;2s) by large margin.
- Cursor/keyset (ADR W3) only if p95 fails under 1k concurrent load — not required for W1.

## Verification

```text
pnpm --filter @xevn/platform-core build
pnpm --filter hrm-api exec jest src/employees/p1-hrm-emp-dup-key-be.spec.ts src/employees/employees.service.spec.ts src/employees/p1-phase1-be-emp-create-parity.spec.ts --no-coverage
```

**Result:** 3 suites / **24/24 PASS** (dup-key **3/3** — ORDER BY `created_at DESC, id DESC` + multi-page uniqueness).

## Residual

- Group rollup still Sort at pilot cardinality; W2 COUNT strategy / W3 keyset only if load proof fails.
- FE W1 must stop `listAllEmployees` fan-out on Employees table (parallel `P1-HRM-SCALE-FE-W1`).
- VPS `:8088` Nest containers need migrate/`ensureSchema` on recreate if not sharing this DB already updated.

## Handoff

- `ack_status`: **READY_FOR_QA**
- `next_owner`: **qa**
- `evidence_path`: `docs/qa/evidence/p1-hrm-scale-be-w1-20260717.md`
