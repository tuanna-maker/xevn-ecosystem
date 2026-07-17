# P1-HRM-MENU-COMPANY-DEPT-STUB — Phòng ban tab real API

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-COMPANY-DEPT-STUB` |
| **date** | 2026-07-17 |
| **owner** | dev-fe |
| **parent_evidence** | `docs/qa/evidence/p1-hrm-menu-company-20260717.md` (R1 P1 residual) |
| **spec_ref** | UC-HRM-03 · HRM-SC-01 · org DM §1–6 |
| **ack_status** | **READY_FOR_QA** |

---

## Problem (closed)

`DepartmentManagement.fetchDepartments` referenced undeclared `data` and never called an API — tab always showed «Chưa có phòng ban nào» even when settings-catalogs / HRM departments existed.

---

## Fix

| Area | Change |
|------|--------|
| `apps/web/hrm/src/lib/hrmDepartmentCatalog.ts` | Added `loadCompanyDepartments`: `GET /api/hrm/departments` first; fallback to XBOS-synced `settings-catalogs` department catalog when HRM table empty or unavailable |
| `apps/web/hrm/src/components/company/DepartmentManagement.tsx` | Wired fetch to `loadCompanyDepartments`; `HrmListLoadBanner` + **Thử lại** on non-2xx; no silent empty via `isListFetchFailureEmpty` |
| `apps/web/hrm/src/lib/hrmDepartmentCatalog.test.ts` | 5 vitest cases: HRM prefer, catalog fallback, RATE-429 error surface, catalog rescue on HRM fail |

**SoT policy:** HRM `departments` table when populated; else settings catalog (`departments` / `department_catalog` keys) — no fake rows.

---

## Verification (dev-fe)

```bash
pnpm --filter hrm exec vitest run src/lib/hrmDepartmentCatalog.test.ts
```

| Check | Result |
|-------|--------|
| vitest `hrmDepartmentCatalog.test.ts` | **5/5 PASS** |
| TypeScript / lint touched files | clean |

---

## QA retest (U65 browser)

| Step | Expected |
|------|----------|
| Login `ceo@xe.vn` → **Phòng/Ban & Công ty** → tab **Phòng ban** | Network: `GET /api/hrm/departments?company_id=main` and/or settings-catalogs path; not silent stub |
| If catalog/HRM has departments | Rows visible (list + org chart tabs) |
| If API 429/5xx and zero rows | Amber banner + **Thử lại** — not «Chưa có phòng ban» alone |
| F5 | Same behavior persists |

**Residual (out of scope):** create/update/delete dialogs still toast-only (no POST/PATCH yet) — separate CRUD wave if required by SRS mutate AC.

---

## Handoff

```text
work_item_id: P1-HRM-MENU-COMPANY-DEPT-STUB
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/p1-hrm-menu-company-dept-stub-20260717.md
completion_report: DepartmentManagement wired to loadCompanyDepartments (HRM API + settings-catalog fallback); error banner/retry on non-2xx; 5 vitest PASS. CRUD mutate still stub — not in scope.
next_owner: qa
next_dispatch_prompt: QA retest P1-HRM-MENU-COMPANY-DEPT-STUB on :8088 — ceo@xe.vn → Phòng/Ban & Công ty → tab Phòng ban (U65 zero-seed). Assert Network departments and/or catalog; rows if data exists; RATE-429 shows banner+retry not fake empty. Update p1-hrm-menu-company-dept-stub-20260717.md verdict. spec_ref UC-HRM-03 org DM §1–6.
```
