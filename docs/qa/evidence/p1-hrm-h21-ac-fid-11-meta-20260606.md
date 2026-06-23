# P1-HRM-H21-AC-FID-11-META — metadata change requests density

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H21-AC-FID-11-META` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-06-06 |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-11 · metadata queue (UC-HRM-26) |

## Summary

Added idempotent `seed-hrm-metadata-density.mjs` (+ `pnpm run seed:hrm:metadata-density`) to backfill `employee_metadata_change_requests` linked to real employees until **AC-FID-11** passes: group **≥ 20** requests (pending + historical). Fixed metadata list scope filter (`pushCompanyIdUuidFilter` — aligns with `hrm_tasks` / `operations` UUID columns). Enhanced `verify-hrm-menu-data-density.mjs` with `metadata-fidelity` check (**11/11** gate).

## Code change

| File | Change |
|------|--------|
| `scripts/seed-hrm-metadata-density.mjs` | New — batch upsert 20+ change requests on active employees across UAT slugs; `metadataFidelityStats` export |
| `scripts/verify-hrm-menu-data-density.mjs` | Added `metadata-fidelity` check (linked ≥ 20, pending ≥ 8) |
| `apps/api/hrm-api/src/employee-metadata/employee-metadata.repository.ts` | List scope: `pushCompanyIdUuidFilter` (was slug text filter on UUID column — empty list for seeded rows) |
| `package.json` | `seed:hrm:metadata-density` npm script |
| `scripts/lib/pm-backlog-scan.mjs` | AC-FID-11 `seedScript: seed:hrm:metadata-density` |

## Commands

```bash
pnpm run seed:hrm:metadata-density
pnpm run verify:hrm:menu-density
pnpm --filter hrm-api test -- employee-metadata
```

## AC-FID-11 group

Formula: `linked_total` = `COUNT(*)` from `employee_metadata_change_requests cr INNER JOIN employees e ON e.id = cr.employee_id`; target **≥ 20** (pending or approved/rejected historical).

| Metric | before | after | PASS |
|--------|--------|-------|------|
| **linked total** | 0 | **20** | ✓ |
| **pending** | 0 | **12** | ✓ (H-META ≥ 1) |
| **historical** | 0 | **8** | ✓ |
| **inserted (session)** | — | **20** | — |
| **idempotent re-run** | — | inserted **0** | ✓ |

Prior baseline: zero metadata change requests — decisions embed / Settings Metadata tab showed empty queue despite API mode.

## Scope fix (list API)

`employee_metadata_change_requests.company_id` stores pilot UUIDs (`10000000-0000-4000-8000-…`). Group CEO list with `company_id=main` must use `pushCompanyIdUuidFilter` (same as `operations.service` for `hrm_tasks`). Without fix, seeded rows were invisible to `GET /employee-metadata/change-requests?company_id=main`.

## Global density gate

```text
verify-hrm-menu-data-density — xevn_hrm

PASS  employees
PASS  contracts-ratio
PASS  insurance-ratio
PASS  attendance-scale
PASS  payroll-fidelity
PASS  recruitment-pipeline
PASS  leave-requests
PASS  catalog-fidelity
PASS  metadata-fidelity  metadata_change_requests linked=20 pending=12 historical=8 need total>=20
PASS  operations-fidelity
PASS  performance-fidelity

=== Summary: 11/11 PASS ===
exit 0
```

## Unit tests

`pnpm --filter hrm-api test -- employee-metadata` — **4/4** PASS

## QA retest matrix

| Journey / gate | Account | Click path |
|----------------|---------|------------|
| **H-META** | `ceo@xe.vn` | Portal decisions embed or HRM Settings → Metadata → pending queue ≥ 1 row |
| **AC-FID-11** | SQL / API | `GET /api/hrm/employee-metadata/change-requests?company_id=main&status=pending` total ≥ 1; all statuses total ≥ 20 |
| **L1** | — | `pnpm run verify:hrm:menu-density` exit 0 |

## Residual

| ID | Owner | Issue |
|----|-------|-------|
| R-H10-02 | dev-be | Density seed modules run `main()` on import when loaded by verify script — noisy stdout; defer guard refactor |
| AC-FID-12+ | backlog | Operations/performance already PASS in parallel waves — no blocker for this item |

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | AC-FID-11 closed: **20** metadata change requests linked to real employees (12 pending, 8 historical); list scope UUID filter fixed; `verify:hrm:menu-density` **11/11 PASS** exit 0; idempotent re-run inserted 0. |
| **next_owner** | qa |
| **next_dispatch_prompt** | QA retest P1-HRM-H21-AC-FID-11-META: run `pnpm run verify:hrm:menu-density` (expect metadata-fidelity PASS); L2 portal `ceo@xe.vn` → decisions/metadata queue shows pending rows; L2.5 approve one pending → historical; evidence `docs/qa/evidence/p1-hrm-h21-ac-fid-11-meta-20260606-qa.md`. |
| **evidence_path** | `docs/qa/evidence/p1-hrm-h21-ac-fid-11-meta-20260606.md` |
| **ack_status** | `READY_FOR_QA` |
