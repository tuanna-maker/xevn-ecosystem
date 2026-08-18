# Evidence — `PO-UC-TC-W4-FE-AT12-L1-APPROVE-SCOPE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-FE-AT12-L1-APPROVE-SCOPE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | FIX |
| **U65** | honored — no seed · no invent Leave L2 · no ceo@ Duyệt wire |
| **prior** | [`po-uc-tc-w4-qa-e2-hrm-at-r3-at12.md`](po-uc-tc-w4-qa-e2-hrm-at-r3-at12.md) · residual `R-W4-AT12-L1-APPROVE-SCOPE` |
| **BA lock** | EXPECTED_NO_CTA for `ceo@` as L1 — **stands** (not touched) |
| **uat_done** | **false** |

---

## Root cause

| Layer | Behavior |
|-------|----------|
| `requestHrm` default | `inferRuntimeScope()` → `resolveHrmSpreadsheetScope` |
| Spreadsheet scope | Portal + JWT tenant `xevn` early-return → `x-company-id: main` |
| Leave list | Query `company_id=trsport` → OK |
| Leave approve/reject (before) | No `resolveHrmMutateCompanyScope` → header `main` → **409** `HRM-LEAVE-409` |
| ATT update approve (U78-U84) | Already wired mutate scope → pattern to mirror |

---

## Fix (preserve_default)

| File | Change |
|------|--------|
| `apps/web/hrm/src/integrations/hrmApi.ts` | Shared `hrmOuMutateOpts` → leave `approveLeaveRequest` / `rejectLeaveRequest` (+ ATT update mutate reuse) |
| `apps/web/hrm/src/hooks/useLeaveRequests.ts` | Pass `currentCompanyId` into approve/reject; guard when missing |
| `apps/web/hrm/src/components/dashboard/HrmApiReminders.tsx` | Dashboard Duyệt passes `currentCompanyId` |
| `apps/web/hrm/src/lib/hrmSpreadsheetScope.ts` | CODE-MEMORY APPEND (leave consumers now use mutate helper) |
| Tests | `hrmApi.approveLeaveRequest.test.ts` + hook source gate |

**must_keep:** leave list `company_id` query · Chờ duyệt CTA · ATT-07 · catalog spreadsheet `main` early-return · U65 no seed · no Leave L2 invent · no Group CEO Duyệt wire

---

## Verify

```text
pnpm --filter vite_react_shadcn_ts test -- \
  src/integrations/hrmApi.approveLeaveRequest.test.ts \
  src/hooks/useLeaveRequests.test.ts \
  src/lib/hrmSpreadsheetScope.test.ts \
  src/hooks/useAttendanceUpdateRequests.test.ts
→ 4 files · 22 tests PASS
```

| Assertion | Result |
|-----------|--------|
| mgr JWT `companyId=trsport` → leave approve `x-company-id=trsport` (not `main`) | ✅ |
| leave reject same header | ✅ |
| hook passes `currentCompanyId` to approve/reject | ✅ |
| ATT mutate + spreadsheet scope regression | ✅ |

---

## Non-claims

| Claim | Status |
|-------|--------|
| AT-12 L1 browser PASS | **No** — QA R4 required |
| Leave L2 PASS | **No** — SPEC_GAP HOLD |
| AT-07 reopened | **No** |
| Duyệt for `ceo@` | **No** |
| UAT DONE | **false** |

---

## completion_report

**Closed:** Leave approve/reject FE client sends operating-unit `x-company-id` via `resolveHrmMutateCompanyScope` (mirror ATT update approve); hook + dashboard remind wired with `currentCompanyId`; vitest 22/22; CODE-MEMORY APPEND.  
**Open:** Browser R4 AT-12 L1 (mgr Duyệt → POST 2xx → FE Đã duyệt → F5); leave_types catalog empty on trsport (create precond residual — out of this WI); Leave L2 SPEC_GAP.

**ack_status:** READY_FOR_QA  
**next_owner:** qa  
**evidence_path:** `docs/qa/evidence/po-uc-tc-w4-fe-at12-l1-approve-scope-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R4-AT12-L1
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true
ack_status_target: PASS_TO_PM

entry_criteria:
- FE READY_FOR_QA: docs/qa/evidence/po-uc-tc-w4-fe-at12-l1-approve-scope-01.md
- prior FAIL: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r3-at12.md
- BA: EXPECTED_NO_CTA for ceo@ as L1 — do NOT use ceo@; do NOT invent Leave L2 PASS; do NOT reopen AT-07

MISSION (browser U65):
- Persona: uat.nv0002@xe.vn (manager) · company trsport
- Path: /hr/attendance?portal=1&companyId=trsport → Nghỉ phép → Chờ duyệt (n) → Duyệt
- Network: POST /api/hrm/attendance/leave-requests/:id/approve → 2xx
- Assert request header x-company-id=trsport (not main)
- FE status Đã duyệt · F5 still Đã duyệt
- evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r4-at12.md
- cấm: seed · PASS without FE click · invent L2 · wire ceo@
```
