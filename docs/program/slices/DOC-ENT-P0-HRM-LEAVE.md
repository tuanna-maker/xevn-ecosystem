# Slice — DOC-ENT-P0-HRM-LEAVE

| Field | Value |
|-------|--------|
| **StoryID** | `DOC-ENT-P0-HRM-LEAVE` |
| **work_item_id** | `W1-B-01-TC-LEAVE` |
| **ref_srs** | `SRS_NEW.md` FR-UC-H03 · FR-UC-M03 · AC-HRM-MOB-J03/J05 |
| **ref_api** | `API_CONTRACT_NEW.md` §4 |
| **ref_db** | `DB_DESIGN_NEW.md` — `leave_requests` · `employee_leave_balances` |
| **change_mode** | UPGRADE / FIX (display-ready + CODE-MEMORY) |
| **Team Claude** | Draft OK → Cursor `REVIEW_ACCEPT` trước QA |

## Goal (W1-B-01)

Align **hrm-api leave** with API_CONTRACT §4 + OS **28** display-ready:

1. Audit `GET/POST leave-requests`, balance, approve/reject vs contract.
2. Ensure list/detail responses include fields FE can bind without join (employee display name, department/position labels if already on row; status labels if contract requires).
3. Add/refresh `@CODE-MEMORY` (+ CHANGE) on touched services/controllers.
4. Jest: at least one regression for create + approve happy path OR document existing covering test.
5. Evidence: `docs/qa/evidence/team-claude-w1b-01-leave.md`

## allowed_paths

- `apps/api/hrm-api/src/attendance/leave-requests.service.ts`
- `apps/api/hrm-api/src/attendance/leave-requests.service.spec.ts`
- `apps/api/hrm-api/src/attendance/leave-balance.service.ts`
- `apps/api/hrm-api/src/attendance/leave-balance.service.spec.ts`
- `apps/api/hrm-api/src/attendance/*leave*` (controller/module if needed — max 2 extra files)
- `docs/qa/evidence/team-claude-w1b-01-leave.md`
- `@CODE-MEMORY` only in above

## forbidden_paths

- `apps/web/**` · `apps/mobile/**` · other Nest modules
- `docs/brand-new-documents-20270801/**` (except read)
- Prisma migration (unless blocker — then STOP + peer ASK)
- Seed scripts (U65)

## must_keep

- Scope/company filter on list
- Soft business rules: BR-WF-SELF / balance pending lock if already present
- Stable error codes if already used

## DoD

- `git diff --name-only` ⊆ allowed_paths  
- Evidence + `draft_ready_for_cursor_review: true`  
- No claim READY_FOR_QA / Phase 1 DONE  
