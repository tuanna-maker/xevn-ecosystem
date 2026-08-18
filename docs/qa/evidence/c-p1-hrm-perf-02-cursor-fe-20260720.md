# C-P1-HRM-PERF-02-CURSOR-FE — listAllEmployees next_cursor walk

| Field | Value |
|-------|--------|
| **work_item_id** | `C-P1-HRM-PERF-02-CURSOR-FE` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **date** | `2026-07-20` |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | UPGRADE |
| **closes** | QC GWC condition **C-P1-HRM-PERF-02** (P3 cursor FE) |
| **BE READY** | `docs/qa/evidence/cd-fb-05-perf-be-20260719.md` |
| **QA prior** | `docs/qa/evidence/p1-hrm-perf-qa-01-20260719.md` |
| **QC prior** | `docs/qa/evidence/p1-hrm-perf-qc-01-20260719.md` |
| **U65** | zero-seed |
| **NOT claimed** | Phase 1 DONE · PROD-READY · F-DELIVERY |

---

## spec_read_ack

- **srs:** `docs/hrm/SRS.md` §Employees list / export (UC-HRM-20 / UC-HRM-21)
- **tech_spec:** `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §5.4 Cursor · BE contract CD-FB-05
- **sponsor_confirm:** PM dispatch `C-P1-HRM-PERF-02-CURSOR-FE` (residual_auto_fix)
- **must_keep:** Dashboard `getEmployeesSummary` / FE-04 · mount ≤8 · soft-nav · F3–F6 product ACs · picker capped (no listAllEmployees)

---

## Problem → solution

| Consumer | Before | After |
|----------|--------|-------|
| Export / archive (`listAllEmployees`) | OFFSET `page += 1` deep walk (`page=2..N`) | Keyset `cursor` + `next_cursor` walk |
| Dashboard tiles | Already `useEmployeesSummary` (FE-04) | **Unchanged** (must_keep) |
| Employees table | `listEmployees` single page | **Unchanged** |

---

## Files

| Path | Change |
|------|--------|
| `apps/web/hrm/src/integrations/hrmApi.ts` | `HrmEmployeeListPage` + `cursor?` on `listEmployees`; `listAllEmployees` cursor walk; `@CODE-MEMORY` + CHANGE |
| `apps/web/hrm/src/pages/Employees.tsx` | `@CODE-MEMORY-CHANGE` (export still calls listAllEmployees) |
| `apps/web/hrm/src/hooks/c-p1-hrm-perf-02-cursor-fe.test.ts` | **NEW** source + runtime cursor asserts + FE-04 must_keep |

---

## Verification

```text
apps/web/hrm:
  pnpm exec vitest run \
    src/hooks/c-p1-hrm-perf-02-cursor-fe.test.ts \
    src/hooks/p1-hrm-perf-fe-02.test.ts \
    src/hooks/p1-hrm-perf-fe-03.test.ts \
    src/hooks/p1-hrm-perf-fe-04.test.ts \
    src/hooks/useEmployeePicker.test.ts \
    src/hooks/useEmployees.pageSize.test.ts \
    src/hooks/useEmployeesPage.test.ts
  → 7 files · 29 tests PASS
```

Runtime mock: 3 pages (100+100+50) → URLs use `cursor=cur-a` / `cur-b`; **no** `page=2+`.

U65: **no seed**.

---

## QA retest (browser — narrow)

1. L0: `pnpm run qc:fe-be-health` (hrm `:28001` up).
2. Login `ceo@xe.vn` → Command Center HRM → **Nhân sự**.
3. Open **Export** dialog → Network: `GET /api/hrm/employees?…&page_size=100` then subsequent with **`cursor=`** (opaque); **no** `page=6+` / deep OFFSET storm.
4. Open **Đã xóa / Archive** dialog → same cursor walk pattern.
5. **must_keep FE-04:** Dashboard remount → still **1×** `employees/summary`; **0×** `employees?page=` storm; mount HRM APIs **≤8**.
6. Smoke: soft-nav + F3–F6 green paths — no product AC reopen.

---

## Residual

| ID | Note | Owner |
|----|------|-------|
| C-P1-HRM-PERF-01 | First catalogs 2× Strict Mode (P2) — out of this slice | optional dev-fe |
| Directory `view=directory` | BE OFFSET-only (cursor 400) — FE table default path OK | standing |

---

## completion_report

Closed **C-P1-HRM-PERF-02-CURSOR-FE**: wired `listAllEmployees` / export-archive walk to BE `next_cursor`; Dashboard summary must_keep FE-04 intact; CODE-MEMORY + CHANGE; vitest 29 PASS. U65 no seed. No Phase1/PROD claim.

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: C-P1-HRM-PERF-02-QA
from_role: pm
to_role: qa
lane: execution
entry_criteria: FE READY docs/qa/evidence/c-p1-hrm-perf-02-cursor-fe-20260720.md; BE cursor READY cd-fb-05-perf-be; U65 browser-only zero-seed
exit_criteria: Export/archive Network shows cursor= walk (no deep OFFSET page=N>5); Dashboard still summary 1× + mount ≤8; F3–F6 smoke green; evidence docs/qa/evidence/c-p1-hrm-perf-02-qa-20260720.md; PASS_TO_PM or FAIL with residual
cấm: seed · Phase1/PROD claim · reopen F3–F6 product ACs
```

## ack_status

**READY_FOR_QA**
