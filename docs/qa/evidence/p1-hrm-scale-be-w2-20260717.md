# P1-HRM-SCALE-BE-W2 — List/summary query-count remediation + tenant covering index

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-SCALE-BE-W2` |
| **from_role** | `dev-be` |
| **to_role** | `qa` / `pm` (re-probe after DO-W2) |
| **date** | 2026-07-17 |
| **change_mode** | **ADD** — indexes + query remediation (no API contract break) |
| **u65** | no seed · no fake DB acceptance · **does not claim T-CONC PASS** |
| **ack_status** | **READY_FOR_QA** |

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` | §5.4 COUNT strategy + covering indexes; §6 W2 BE |
| `docs/hrm/TECHSPEC.md` | §2–4 employees list / embed data path |
| `docs/qa/evidence/qc-p1-hrm-scale-w3-20260717.md` | T-CONC NO-GO; residual BE-W2 |
| `docs/qa/evidence/p1-hrm-scale-w3-t-conc-20260717.md` | Hot path = `GET /employees?page=1&page_size=50` + `GET /employees/summary` |
| `docs/qa/evidence/p1-hrm-scale-be-w1-20260717.md` | W1 covering indexes already shipped |
| `apps/api/hrm-api/src/employees/employees.service.ts` | `listEmployees` / `getEmployeesSummary` / `buildEmployeeListFilters` |

**spec says:** Keep `ORDER BY created_at DESC, id DESC`; reduce double-COUNT / query pressure; add covering indexes aligned to filter+sort; scope parity list↔get-by-id↔summary.

**code does:** Window `COUNT(*) OVER()` merges list COUNT+SELECT (1 round-trip); summary bundled into one CTE (was 3); migration `0016` adds tenant expression covering index; `resolveHrmListScope` / `pushEmployeeListScopeFilters` / ORDER BY **unchanged**.

**must_keep (verified):**

- Scope parity list ↔ get-by-id ↔ summary (same `buildEmployeeListFilters`)
- Stable `ORDER BY created_at DESC, id DESC` (list) / `full_name, employee_code, id` (directory)
- W1/W2 FE paged contracts (`total`, `page`, `page_size`, `data`) unchanged

## Problem (from T-CONC)

| Observation | Implication for BE |
|-------------|-------------------|
| Failures = timeouts (0% 429) | Pool + query cost under concurrent list+summary |
| Probe alternates list page=1 + summary | Each VU burned **2 + 3 = 5** SQL round-trips per think cycle before this wave |
| W1 indexes already present | W2 focus = **query-count** + rollup tenant predicate index |

## Changes

### 1) List / directory — single round-trip

```sql
SELECT …, COUNT(*) OVER()::text AS list_total
FROM public.employees
WHERE <same scope filters>
ORDER BY created_at DESC, id DESC   -- list (unchanged)
LIMIT $n OFFSET $m;
```

- Page>1 empty result still falls back to exact `COUNT(*)` (pagination edge).
- Response shape unchanged: `{ total, page, page_size, data }`.

### 2) Summary — one CTE (was 3 scans)

`WITH scoped AS (…) , agg AS (…) , dept AS (…) , recent AS (…)` → single `row_to_json` / `json_agg` payload.

Round-trips per summary call: **3 → 1**.

### 3) Migration `0016` — tenant expression covering index

File: `migrations/hrm/0016_employees_tenant_list_covering_index.sql`

```sql
CREATE INDEX IF NOT EXISTS idx_employees_tenant_co_arch_created_id
  ON public.employees (
    (COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn')),
    company_id,
    archived_at,
    created_at DESC,
    id DESC
  );
```

Also mirrored in `EmployeesService.ensureSchema` for local/dev boot parity.

**Rollback:**

```sql
DROP INDEX IF EXISTS public.idx_employees_tenant_co_arch_created_id;
```

Safe / reversible; no table rewrite; `IF NOT EXISTS` / `ANALYZE`.

## EXPLAIN / equivalent proof

### Live EXPLAIN status

Agent host: `DATABASE_URL_HRM` empty; Docker daemon down; Postgres `:5432` unreachable (local + VPS 5432). **Live EXPLAIN not executed in this session.**

### Before (W1 baseline + pre-W2 query shape) — cite `p1-hrm-scale-be-w1-20260717.md`

| Path | Shape | Cost class |
|------|-------|------------|
| List page 1 | Separate `COUNT(*)` + `SELECT … ORDER BY … LIMIT` = **2** round-trips | Rollup Sort ~1.6 ms @ N≈1107 (W1) — wall OK; concurrency multiplies round-trips |
| Member single company | Index Only Scan on W1 `idx_employees_company_archived_created_id` ~0.2 ms | Good |
| Summary | **3** independent scans of scoped subquery | 3× pool checkout under T-CONC |

### After (this wave) — SQL shape proof (jest) + expected planner note

| Path | Shape | Expected under concurrency |
|------|-------|----------------------------|
| List page 1 | **1** query with `COUNT(*) OVER()` + same ORDER BY | Halves list DB chats per VU |
| Summary | **1** CTE bundling agg+dept+recent | Cuts summary chats **3→1** |
| Hot-path per VU think cycle | **5 → 2** SQL round-trips | Direct relief for pool wait (pairs with DO-W2) |
| Rollup filter | Expression index matches `COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn')` | Planner may prefer index over email-unique bitmap for tenant+ANY; confirm on deploy DB |

**Deploy EXPLAIN entry (devops / QA after migrate):**

```bash
# After applying 0016 on xevn_hrm:
EXPLAIN (ANALYZE, BUFFERS)
SELECT …, COUNT(*) OVER()::text AS list_total
FROM public.employees
WHERE company_id = ANY(ARRAY['holding','trsport','logistics','finance','services']::text[])
  AND COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn') = 'xevn'
  AND archived_at IS NULL
ORDER BY created_at DESC, id DESC
LIMIT 50;
```

Expect: Index path involving `idx_employees_tenant_co_arch_created_id` and/or W1 covering index; no full-table seq scan at pilot N unless stats prefer seq for tiny table.

## Verification

```text
pnpm --filter hrm-api exec jest \
  src/employees/p1-hrm-scale-be-w2.spec.ts \
  src/employees/p1-hrm-emp-dup-key-be.spec.ts \
  src/employees/p1-hrm-perf-be-01.spec.ts \
  src/employees/employees.service.spec.ts \
  src/employees/p1-phase1-be-emp-create-parity.spec.ts \
  --no-coverage
```

**Result:** 5 suites / **32/32 PASS**

| Suite | Asserts |
|-------|---------|
| `p1-hrm-scale-be-w2.spec.ts` | 1 RT list + window COUNT; multi-page unique ids; 1 RT summary CTE + rollup `ANY` |
| `p1-hrm-emp-dup-key-be.spec.ts` | ORDER BY `created_at DESC, id DESC` + pagination uniqueness |
| `p1-hrm-perf-be-01.spec.ts` | Summary aggregates + scope parity |
| `employees.service.spec.ts` | Directory / avatar regression |
| `p1-phase1-be-emp-create-parity.spec.ts` | Create + list parity |

`tsc -p tsconfig.build.json --noEmit` — exit **0**.

## Residual

| ID | Owner | Note |
|----|-------|------|
| `P1-HRM-SCALE-DO-W2` | devops | Pool / `pg_pool_waiting_count` — still required; BE alone does not claim T-CONC |
| Live EXPLAIN on deploy DB | devops after migrate | Confirm index used under rollup |
| `P1-HRM-SCALE-W3-T-CONC-RERUN` | devops+qa+qc | Stages `50,100,200,400,600,800,1000` after DO-W2+BE-W2 deploy |
| Keyset cursor (BE-W3) | deferred | Only if list p95 still fails post re-probe |

## Re-probe entry notes (after DO-W2)

1. Deploy/recreate hrm-api so `ensureSchema` or run migration `0016`.
2. Confirm DO-W2 pool evidence present.
3. Re-run `node scripts/load/hrm-t-conc-load.mjs` with ADR hold; **do not** treat this BE evidence as T-CONC PASS.
4. QC re-gate `P1-HRM-SCALE-QC-W3` only on new raw JSON.

## Handoff packet

- **completion_report:** Closed BE-W2 query-count remediation: list/directory window COUNT (2→1 RT), summary CTE (3→1 RT), migration `0016` tenant covering index + ensureSchema. Jest **32/32** PASS; ORDER BY + scope parity preserved. Live EXPLAIN blocked (no DB URL on agent host). **Does not claim T-CONC PASS.** Residual: DO-W2 pool + deploy EXPLAIN + W3 re-probe.
- **next_owner:** `devops` (deploy BE + finish DO-W2) → `qa`/`qc` T-CONC re-run
- **evidence_path:** `docs/qa/evidence/p1-hrm-scale-be-w2-20260717.md`
- **ack_status:** **READY_FOR_QA**

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-DO-W2-DEPLOY-BE-W2
from_role: pm
to_role: devops
subagent_type: devops
entry_criteria: P1-HRM-SCALE-BE-W2 READY_FOR_QA — migration 0016 + list/summary RT reduction; DO-W2 pool tuning in-flight or complete; QC W3 T-CONC NO-GO (max 50 VU)
read_first: docs/qa/evidence/p1-hrm-scale-be-w2-20260717.md; docs/qa/evidence/p1-hrm-scale-w3-t-conc-20260717.md; docs/ops/PRODUCTION_ENABLE_RUNBOOK.md
exit_criteria: Apply migrations/hrm/0016 (or recreate hrm-api ensureSchema) on VPS xevn_hrm; optional EXPLAIN prove idx_employees_tenant_co_arch_created_id; complete DO-W2 pool visibility; then re-run T-CONC stages 50,100,200,400,600,800,1000 with ADR hold; evidence for re-probe — do NOT claim T-CONC PASS in BE alone
evidence_path: docs/qa/evidence/p1-hrm-scale-do-w2-20260717.md (or deploy+t-conc re-run md)
cấm: seed; claim T-CONC PASS without new raw JSON; disturb non-xevn stacks
```
