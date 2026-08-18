# D-CD-FB-08-ACTIVE-COLD-500 — Dev-BE evidence (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-CD-FB-08-ACTIVE-COLD-500` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **closes** | QC condition **C-CD-FB-08-01** / residual **R-CD-FB-08-ACTIVE-COLD-500** |
| **spec_ref** | `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` §5 · UC-HRM-25 · QC `cd-fb-08-contract-qc-20260719.md` |
| **date** | `2026-07-19` |
| **seed** | **None** (U65) |

---

## Root cause

Cold open of tab **Đãi ngộ** fires parallel `GET …/compensation-packages` + `GET …/compensation-packages/active`. Both called `ensureCompensationSchema()` → concurrent `CREATE TABLE IF NOT EXISTS` → PostgreSQL race on composite type insert → **500** `duplicate key … pg_type_typname_nsp_index` (`HRM-SYS-001`). After first successful create, tables exist → `/active` stays **200**.

`getActivePackage` already awaited ensure; ensure itself was not single-flight / race-tolerant.

---

## Fix

File: `apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.ts`

1. **Single-flight** `compensationSchemaReady` promise — concurrent list+/active share one DDL run.
2. **`runCompensationDdl`** swallows ignorable schema races: `23505` + `pg_type_typname_nsp_index`, `42P07`, `42710`.
3. **`@CODE-MEMORY-CHANGE`** documents fix; **must_keep** F5 create/revise/history/active window/scope parity unchanged.

---

## Jest

```bash
pnpm --filter hrm-api exec jest --testPathPatterns="contracts-insurance|employee-compensation" --no-coverage
# Test Suites: 3 passed, 3 total
# Tests:       36 passed, 36 total
```

New cases in `employee-compensation.service.spec.ts`:

| Test | Assert |
|------|--------|
| `D-CD-FB-08 cold getActivePackage returns null (no 500) before first create` | empty → `null`; ensure DDL invoked |
| `D-CD-FB-08 ensureCompensationSchema swallows pg_type_typname_nsp_index race` | `23505` on packages CREATE → still `null` (no throw) |
| `D-CD-FB-08 concurrent list+/active single-flights ensureCompensationSchema` | packages CREATE count/max in-flight = **1** |

Prior F5 cases (create/revise/as_of/scope) remain green.

---

## must_keep (regression)

| AC / behavior | Status |
|---------------|--------|
| AC-CD-F5-01..04 / F5-07 create·revise·history | Untouched service paths |
| BR-CD-F5-07 active `as_of` window | Existing jest PASS |
| Scope parity `company_id=main` | Existing jest PASS |
| Contract `salary` deprecated / no overwrite | Untouched |

---

## QA retest (copy-ready)

- Persona: `ceo@xe.vn` · JWT `companyId=main`
- Cold: open employee with **no** compensation package yet → tab Đãi ngộ
- Expect: `GET …/compensation-packages/active` → **200** (`data: null` / empty) — **not** 500 / `pg_type_typname_nsp_index`
- Optional: create package → `/active` still **200**; F5 ACs already PASS — smoke only
- No seed

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Cold `/active` 500 closed via idempotent single-flight `ensureCompensationSchema` + pg_type race swallow; jest 36 PASS; F5 must_keep intact; no seed; no Phase1/PROD |
| **next_owner** | `qa` |
| **ack_status** | `READY_FOR_QA` |
| **evidence_path** | `docs/qa/evidence/d-cd-fb-08-active-cold-500-be-20260719.md` |
| **pm_dispatch_hint** | `D-CD-FB-08-ACTIVE-COLD-500-QA` — cold `/active` 200 then optional QC close C-01 |

### next_dispatch_prompt

```text
work_item_id: D-CD-FB-08-ACTIVE-COLD-500-QA
from_role: pm
to_role: qa
lane: execution
entry_criteria: BE READY_FOR_QA docs/qa/evidence/d-cd-fb-08-active-cold-500-be-20260719.md; U65 zero-seed; stack L0
exit_criteria: Cold GET compensation-packages/active before first create returns 200 (null/empty) — not 500 pg_type; optional smoke create still 201; evidence docs/qa/evidence/d-cd-fb-08-active-cold-500-qa-20260719.md; PASS_TO_PM (or FAIL); residual C-CD-FB-08-01 closable for QC
cấm: seed; claim Phase1/PROD
```
