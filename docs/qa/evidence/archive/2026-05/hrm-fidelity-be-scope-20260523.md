# HRM-FIDELITY-BE-SCOPE — Dev-BE evidence

**work_item_id:** `HRM-FIDELITY-BE-SCOPE`  
**Date:** 2026-05-23  
**from_role:** dev-be  
**to_role:** qa  
**ack_status:** `READY_FOR_QA`

## Problem (QA retest FAIL)

- DB gate **7/7 PASS** (`contracts=1037` globally).
- Portal JWT `companyId=main` + `company_id=main` on list APIs returned **total=0** for contracts/attendance/requisitions (satellite rows keyed by UAT slugs `holding`, `finance`, … per `seed-hrm-satellite-from-workforce.mjs`).

## Decision (ADR-HRM-RBAC-SCOPE-LADDER)

**Option A (accepted):** Align list APIs — group CEO on master tenant with JWT/query `main` rolls up `GROUP_MEMBER_SLUGS` (`holding`, `trsport`, `logistics`, `finance`, `services`) without changing JWT or causing 409.

**Option B (rejected for this cycle):** Duplicate all satellite rows under `company_id=main` (would break per-slug CARD-* seed rules).

## Implementation

| Artifact | Path |
|----------|------|
| List scope resolver | `apps/api/hrm-api/src/common/hrm-list-scope.ts` |
| Unit tests | `apps/api/hrm-api/src/common/hrm-list-scope.spec.ts` |
| Wired services | `employees`, `contracts-insurance`, `attendance`, `payroll`, `recruitment`, `leave-requests` |
| Persona probe script | `scripts/verify-hrm-persona-scope-probes.mjs` |

**Rules:**

- `group_ceo` + `tenantId=xevn` + JWT/query `main` → SQL `company_id = ANY(group slugs)` + employee `tenant_id=xevn` partition.
- `subsidiary_ceo` + member tenant + `main` → `company_id=main` + `custom_fields.tenant_id` match.
- Attendance/leave: workforce scoped via `employee_id IN (...)` (UUID `company_id` on rows).

## Verification

### Unit tests

```text
npx jest (hrm-api) — 27 suites, 114 tests PASS
```

### DB density (unchanged)

```bash
pnpm run verify:hrm:menu-density
```

**7/7 PASS** — contracts ratio 0.939, insurance 1037/1104.

### Persona probes (`ceo@xe.vn` / `Xevn@2026`, portal proxy)

```bash
node scripts/verify-hrm-persona-scope-probes.mjs
```

| Menu | HTTP | total (group CEO, `company_id=main`) |
|------|------|--------------------------------------:|
| employees | 200 | **1100** |
| contracts | 200 | **1036** |
| insurance-expiring | 200 | 0 (seed expiry 2027 — no rows in 30-day window) |
| requisitions | 200 | **10** |
| attendance | 200 | **2649** |

**Scope probe:** `holding` / `finance` as query `company_id` with JWT `main` → **409** (unchanged, correct).

### Residual / out of scope

- Member CEO (`du-lich.ceo@xe.vn`) lists still depend on tourism/member seed (`company_id=main` partition) — separate work item.
- `insurance-expiring` empty at 30-day window is data cardinality, not scope mismatch.

## Handoff

- **QA:** Re-run persona matrix §4 (`hrm-fidelity-qa-retest` scenarios); expect FID-D-03..05 **closed** for group CEO on `main`.
- **FE:** No change required for embed query `company_id=main` when portal JWT uses `main`.
