# P1-HRM-INC-LEAVE-REF-01 — Dev-FE evidence (2026-06-07)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-INC-LEAVE-REF-01` |
| **defect_id** | `D-HRM-LEAVE-QUERY-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **ack_status** | `READY_FOR_QA` |

## Defect closed

| ID | Symptom | Root cause | Fix |
|----|---------|------------|-----|
| **D-HRM-LEAVE-QUERY-01** | Dashboard console `ReferenceError: query is not defined` (`useLeaveRequestsData.ts` → `Dashboard.tsx:119`) | Broken Supabase stub referenced undefined `query` | Wire `useLeaveRequestsData` to `listLeaveRequests` from `hrmApi.ts` |
| **D-HRM-LEAVE-STUB-01** | Attendance Leave tab fetch/create broken (`setRequests(data)` with undefined `data`) | Incomplete migration stub in `useLeaveRequests.ts` | Wire list/create/approve/reject to Nest attendance leave-requests API |

## Files changed

- `apps/web/hrm/src/hooks/useLeaveRequestsData.ts` — `buildLeaveRequestsQuery`, `mapApiLeaveRequestToDashboardRow`, `listLeaveRequests`
- `apps/web/hrm/src/hooks/useLeaveRequests.ts` — `mapApiLeaveRequestToUi`, Nest CRUD (list/create/approve/reject)
- `apps/web/hrm/src/hooks/useLeaveRequestsData.test.ts` — portal mode regression (new)
- `apps/web/hrm/src/hooks/useLeaveRequests.test.ts` — portal mode + mapper tests

## Verification

```bash
cd apps/web/hrm
pnpm exec vitest run src/hooks/useLeaveRequestsData.test.ts src/hooks/useLeaveRequests.test.ts  # 5/5 PASS
pnpm exec vitest run                                                                           # 149/149 PASS
pnpm run build                                                                                 # exit 0
```

## QA retest (L2 + L2.5)

**Account:** `ceo@xe.vn` / `Xevn@2026` · hrm-api `:28001` + portal embed

1. **Dashboard** (`/command-center/hrm` or HRM dashboard route) — load without console `ReferenceError`; pending-leave widgets populate from API (not blank due to JS crash).
2. Network: `GET /api/hrm/attendance/leave-requests?company_id=main` → **200** on dashboard load.
3. **Attendance → Leave tab** — list loads; create leave request → **201/200** POST `/attendance/leave-requests`; approve/reject pending row → POST approve/reject endpoints **200**.
4. Console: no Supabase `54321` on pilot path when `VITE_HRM_USE_API=true`.

**J-* hint:** J-HRM dashboard aggregate + attendance leave list→detail if in matrix for active sprint.

## Residual

- **Delete leave request:** Nest API has no DELETE endpoint; `deleteRequest` fail-closed with toast (`hk.leave.deleteError`) — UI trash button still visible; document as known gap if QA needs delete parity.

## Handoff

- **next_owner:** `qa`
- **pm_dispatch_hint:** Retest Dashboard load (no `query is not defined`) + Attendance Leave tab list/create/approve with `ceo@xe.vn` / main scope

---

**completion_report:** Closed Supabase stub ReferenceError on dashboard; attendance leave hook now uses Nest list/create/approve/reject. Delete remains unsupported by API (fail-closed toast).

**next_dispatch_prompt:** QA retest `P1-HRM-INC-LEAVE-REF-01` — L0 stack up; login `ceo@xe.vn`; open HRM Dashboard embed and confirm no console `ReferenceError: query is not defined`; verify `GET /api/hrm/attendance/leave-requests?company_id=main` 200; open Attendance Leave tab — list loads, create one leave request, approve or reject a pending row; evidence `docs/qa/evidence/p1-hrm-inc-leave-ref-qa-20260607.md`; note delete button residual if still shown.

**evidence_path:** `docs/qa/evidence/p1-hrm-inc-leave-ref-fe-20260607.md`

**ack_status:** `READY_FOR_QA`
