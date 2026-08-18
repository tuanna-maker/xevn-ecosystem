# P1-HRM-EMP-DUP-KEY-FE — Employees duplicate-key guard

## Scope

- Work item: `P1-HRM-EMP-DUP-KEY-FE`
- Layer / blast radius: UI integration / R1
- Changed:
  - `apps/web/hrm/src/hooks/useEmployees.ts`
  - `apps/web/hrm/src/hooks/useEmployees.dedupe.test.ts`
- Kept unchanged: `Employees.tsx`, shared `DataTable`, API pagination, API response totals.

## spec_read_ack

- srs: `docs/hrm/SRS.md` §15.2, §15.5
- tech_spec: `docs/hrm/TECHSPEC.md` §11.2, §12
- uc_ids: `UC-HRM-SCOPE-03`, `J-HRM-02`
- br_ids: `BR-INT-05`
- sponsor_confirm: PM dispatch `P1-HRM-EMP-DUP-KEY-FE`, 2026-07-16
- change_mode: `ADD`
- must_keep: stable API order, employee list/detail scope, archived split, existing mutations
- forbidden_paths: backend implementation and unrelated Command Center request mounts

## Before

`useEmployees` flattened all `listAllEmployees` responses and passed every row to list consumers. If the API returned the same employee in multiple pages or company-scope responses, React received duplicate row keys because the table identity is `employee.id`.

## After

- The merged list is normalized once with `dedupeEmployeesById`.
- Deduplication is stable and first-wins: the first API occurrence keeps its position and payload.
- Active and archived collections are split after deduplication, so neither list can receive duplicate employee IDs.
- The input collection is not mutated.
- No UI warning was added; React duplicate-key warnings are prevented at the list source.

## Pagination and backend ownership

This FE guard changes only the rendered row collection. It does not alter page requests, `page_size`, API pagination traversal, or backend `total` values. If the backend returns duplicate rows or inflated totals, `P1-HRM-EMP-DUP-KEY-BE` must still remove the root cause and correct count semantics; FE deduplication must not be treated as the count fix.

## Verification

```text
node node_modules/vitest/vitest.mjs run src/hooks/useEmployees.dedupe.test.ts src/hooks/useEmployees.pageSize.test.ts
Test Files  2 passed (2)
Tests       4 passed (4)
```

```text
node node_modules/vite/bin/vite.js build
4134 modules transformed
build exit 0
```

```text
git diff --check -- apps/web/hrm/src/hooks/useEmployees.ts apps/web/hrm/src/hooks/useEmployees.dedupe.test.ts
exit 0
```

IDE diagnostics: no linter errors in changed source/test files.

Dependency note: initial `pnpm install` populated packages but exited with Windows/OneDrive `EPERM` while creating `.bin` shims. Tests and build were therefore executed through the installed package entrypoints directly and both passed.

Runtime smoke precheck:

```text
pnpm run qc:dev-stack
FAIL — hrm-api :28001, xbos-api :28002, and web portal were not running.
```

No browser claim is made from this dev handoff. QA must start/verify L0 and execute the FE-only browser path below; no seed is permitted.

## QA focus

1. Login from FE as Group CEO and open `/command-center/hrm/employees`.
2. Confirm the employee table renders without React duplicate-key warnings.
3. Verify visible employee IDs are unique while order remains stable.
4. Execute `J-HRM-02`: employee list → employee profile; confirm detail loads under `company_id=main`.
5. F5 the list and repeat the warning/uniqueness check.
6. Record API `total` separately; any duplicate rows or count mismatch remains assigned to `P1-HRM-EMP-DUP-KEY-BE`.

## Handoff

- ack_status: `READY_FOR_QA`
- completion_report: FE stable first-wins employee deduplication, focused unit regression, and production build are complete. Backend duplicate/count root cause and secondary Command Center duplicate request mounts remain outside this FE scope.
- next_owner: `qa`
- evidence_path: `docs/qa/evidence/p1-hrm-emp-dup-key-fe-20260716.md`
- next_dispatch_prompt: `QA P1-HRM-EMP-DUP-KEY-FE: browser-only, zero-seed. Login as Group CEO, open /command-center/hrm/employees, verify the table renders with no React duplicate-key warning, visible employee IDs are unique and stable after F5, then execute J-HRM-02 list → profile with company_id=main. Capture URL, click path, console/network evidence, and report API total/count discrepancies to P1-HRM-EMP-DUP-KEY-BE; do not treat FE dedupe as the backend count fix.`
