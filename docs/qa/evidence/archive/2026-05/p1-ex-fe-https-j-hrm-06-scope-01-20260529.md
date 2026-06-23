# P1-EX-FE-HTTPS-J-HRM-06-SCOPE-01 — Embed employee profile scope parity

| Field | Value |
|---|---|
| work_item_id | `P1-EX-FE-HTTPS-J-HRM-06-SCOPE-01` |
| from_role | `dev-fe` |
| to_role | `qa` |
| date | `2026-05-29` |
| source QA fail | `docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-20260529.md` (J-HRM-06 `scope_parity`) |
| ack_status | **READY_FOR_QA** |

## Problem diagnosed

- HTTPS pilot: `GET /api/hrm/employees/:id?company_id=main` returned **200** (`HRM-EMP-200`) while embed UI showed **«Không tìm thấy nhân viên»**.
- Root cause: profile loader (`loadEmployee` / `useEmployee`) could run with **empty auth scope** when portal query was stripped or memberships not hydrated, returning `{ employee: null, error: null }` → UI treated as not-found.
- Secondary: attendance list had **no row → profile** navigation; overview late list lacked `employee_id` link.

## Implemented fixes

1. **`resolveEmployeeFetchCompanyIds`** (`useEmployee.ts`) — fallback scope from URL/storage/JWT via `resolveHrmSpreadsheetScope`, then portal default `main` when embed/session active.
2. **`getEmployeeById`** (`hrmApi.ts`) — case-insensitive UUID match; try **`main` scope first** in multi-scope iteration.
3. **`AuthContext`** — keep portal membership when `getHrmPortalMode` active even if `portal=1` query drops; read `companyId` from storage.
4. **`hrmEmbedNavigation.ts`** — `hrmPathWithEmbedSearch` preserves `?portal=1&companyId=main` on in-app navigations.
5. **Attendance UX** — records table row click + overview late/early list navigate to `/employees/:id` with embed query.

## Verification evidence

### Test command

```bash
pnpm --dir apps/web/hrm test -- src/hooks/useEmployee.test.ts src/integrations/hrmApi.getEmployeeById.test.ts src/lib/hrmEmbedNavigation.test.ts
pnpm --dir apps/web/hrm run build
```

### Result

- vitest **15/15** PASS (3 files)
- `vite build` **PASS**

## QA retest scope (J-HRM-06)

| Path | Steps |
|------|--------|
| CC embed | `…/command-center/hrm/attendance?companyId=main` → **Dữ liệu chấm công** → click table row **or** overview late list → profile shows name (not not-found) |
| Direct embed | `…/hr/attendance?portal=1&companyId=main` → same; deep link `…/hr/employees/{id}?portal=1&companyId=main` must render profile |
| API | `GET …/employees/{id}?company_id=main` **200** + UI profile match |

Sample employee id from QA: `00000000-0000-4000-8000-000000000021`

## completion_report

- **Closed:** Embed profile scope resolution for J-HRM-06; attendance list→profile navigation with preserved portal query; regression tests + build PASS.
- **Residual:** None in FE scope for this item.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R1
from_role: dev-fe
to_role: qa
entry_criteria: docs/qa/evidence/p1-ex-fe-https-j-hrm-06-scope-01-20260529.md — FE scope_parity fix deployed on HTTPS pilot
exit_criteria: J-HRM-06 L2.5 PASS on CC iframe + /hr/attendance (list/row or late list → profile, no «Không tìm thấy nhân viên» when GET employees/:id 200); P-CC-07 still PASS (fallback54321=0)
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r1-YYYYMMDD.md
ack_status: PASS_TO_PM
```

## evidence_path

- `docs/qa/evidence/p1-ex-fe-https-j-hrm-06-scope-01-20260529.md`
