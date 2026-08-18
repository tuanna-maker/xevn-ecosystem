# Evidence — `PO-HRM-ATT-LEAVE-CANCEL-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ATT-LEAVE-CANCEL-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution · FIX |
| **parent** | `PO-HRM-ATT-LEAVE-FUNNEL-QC-01` GWC · CONDITION AC-02 |
| **residual** | `R-ATT-LV-SHEET-02-FE-CANCEL-STUB` P2 |
| **ack_status** | `READY_FOR_QA` |
| **U65** | zero-seed · no `pnpm seed:*` |
| **honesty** | `attendance_uat_ready=false` · no Option C · WAIVE_L2 not reopened |

### spec_read_ack

- **srs / funnel SPEC:** `docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md` §7 **AC-ATT-LV-SHEET-02** · F-ATT-LEAVE-FUNNEL-02 (reject/cancel sau approve → reverse markers khi sheet không `closed`)
- **tech_spec:** same SPEC § F-ATT-LEAVE-FUNNEL-02 · HTTP cancel path = Nest `POST …/leave-requests/:id/cancel`
- **BE contract (existing):** `apps/api/hrm-api` `attendance.controller.ts` `@Post('leave-requests/:requestId/cancel')` → `HRM-LEAVE-205`; approved→reverse via `reverseLeaveMarkers`; closed sheet → `409 HRM-ATT-SHEET-LOCKED`
- **QC entry:** `docs/qa/evidence/po-hrm-att-leave-funnel-qc-01.md` CONDITION AC-02
- **QA R2:** `docs/qa/evidence/po-hrm-att-leave-funnel-qa-01-r2.md` AC-02 SKIP stub

---

## Closed

| Item | Change |
|------|--------|
| API client | `cancelLeaveRequest` → `POST /api/hrm/attendance/leave-requests/:id/cancel` + `hrmOuMutateOpts` (parity approve/reject scope) |
| Hook | `useLeaveRequests.cancelRequest` replaces stub `deleteRequest` toast-only; on 2xx invalidate leave list + weekly attendance + leave-balance/panel |
| LeaveTab UI | **Hủy đơn** CTA for `pending` \| `approved`; confirm dialog `att-leave-cancel-dialog-precision`; hide cancel on terminal statuses |
| HDSD | `hdsd-leave-list-cancel-{id}` · `hdsd-leave-cancel-confirm` |
| Status | `cancelled` chip + filter option + i18n VI/EN |
| CODE-MEMORY | APPEND on LeaveTab · useLeaveRequests · hrmApi `hrmOuMutateOpts` · hdsdMutateTestIds |
| must_keep | Approve → materialize path untouched; 409 LOCKED surfaced via `toErrorMessage` on cancel fail |

## Unit evidence

```text
apps/web/hrm — vitest
✓ src/lib/hdsdMutateTestIds.test.ts (6)
✓ src/integrations/hrmApi.approveLeaveRequest.test.ts (3) — includes cancel scope
✓ src/hooks/useLeaveRequests.test.ts (11) — cancelLeaveRequest wired
Tests 20 passed
```

## QA retest (AC-02) — copy path

1. Login U65 persona (same as FUNNEL-QA-01 R2).
2. Attendance → Nghỉ phép → create leave → **Duyệt** (open sheet period) → Bản ghi / weekly shows `status=leave` (AC-01 retain).
3. Same approved row → `[data-testid^=hdsd-leave-list-cancel-]` → confirm `[data-testid=hdsd-leave-cancel-confirm]`.
4. Network: `POST …/leave-requests/:id/cancel` → **2xx** `HRM-LEAVE-205`.
5. **FE after 2xx:** leave status **Đã hủy**; weekly/records leave markers for that `leave_request_id` gone (or after F5).
6. Optional LOCKED regress: cancel overlapping **closed** sheet → **409** `HRM-ATT-SHEET-LOCKED` toast (must_keep AC-03 class).
7. Storm J-HRM-06b ≤2 GET/10s; **no seed**; do **not** claim `attendance_uat_ready`.

### HDSD inventory

| testid | Role |
|--------|------|
| `hdsd-leave-list-approve` / `hdsd-leave-list-approve-{id}` | must_keep Duyệt |
| `hdsd-leave-list-cancel-{id}` | AC-02 open cancel |
| `hdsd-leave-cancel-confirm` | confirm mutate |
| `att-leave-cancel-dialog-precision` | dialog chrome |

---

## Residual

| ID | Severity | Notes |
|----|----------|-------|
| `R-ATT-SHEET-NAV-CTA` | soft (parent QC) | out of this seat |
| Browser AC-02 | pending QA | unit-only here |

## Honesty

- `attendance_uat_ready=false`
- Option C leave-join **not** introduced
- WAIVE_L2 / LV-02 **not** reopened

---

## completion_report

Wired FE cancel/reverse for approved (and pending) leave to existing BE `POST …/cancel`. Stub `deleteRequest` removed. HDSD cancel testids + RQ invalidation for sheet/weekly leave clear after 2xx. Unit 20/20 PASS. Browser AC-02 retest owned by QA.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-LEAVE-CANCEL-QA-01
from_role: pm
to_role: qa
parent: PO-HRM-ATT-LEAVE-CANCEL-FE-01 READY_FOR_QA
entry: docs/qa/evidence/po-hrm-att-leave-cancel-fe-01.md
AC: AC-ATT-LV-SHEET-02 (SPEC §7) — approve materialize then Hủy đơn → POST cancel 2xx → FE + F5 leave markers cleared; must_keep AC-01/03 + J-HRM-06b
U65: zero-seed · browser-only · HDSD hdsd-leave-list-cancel-* + hdsd-leave-cancel-confirm
honesty: attendance_uat_ready=false · no Option C · no WAIVE_L2 reopen
exit: PASS_TO_PM or FAIL · evidence docs/qa/evidence/po-hrm-att-leave-cancel-qa-01.md
```

## ack_status

`READY_FOR_QA`
