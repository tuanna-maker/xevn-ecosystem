# Evidence — W1-B-01-TC-LEAVE

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-01-TC-LEAVE` |
| **slice** | `docs/program/slices/DOC-ENT-P0-HRM-LEAVE.md` |
| **executor** | Cursor Lead backup (dev-be) — Team Claude NIM 429 |
| **date** | 2026-08-03 |
| **change_mode** | UPGRADE / FIX |
| **draft_ready_for_cursor_review** | `true` |
| **ack_status** | `READY_FOR_QA` |

## spec_read_ack

- srs: `docs/brand-new-documents-20270801/SRS_NEW.md` · FR-UC-H03 · Diễn biến #2–#5
- api_contract: `docs/brand-new-documents-20270801/API_CONTRACT_NEW.md` §4.1–4.5
- db_design: `docs/brand-new-documents-20270801/DB_DESIGN_NEW.md` · `leave_requests` · `employee_leave_balances`
- os: FE/BE display-ready SoC (OS 28 doctrine) · SOLID (OS 25)
- sponsor_confirm: W1-B packet `TEAM_CLAUDE_ACTIVE_PACKET.md` 2026-08-03

## Audit vs API_CONTRACT §4

| Endpoint | Contract | Before | After |
|----------|----------|--------|-------|
| GET leave-balance | BAL-200 · source tag · entitled/used/pending | OK + source | + `leave_type_label` display-ready |
| POST leave-requests | 201 · pending lock · sick≥3 attachment · overlap/balance | create OK; **no pending lock**; sick attach path-only | + `lockPendingLeaveBalance`; sick≥3 require attach; display-ready row |
| GET leave-requests | 200 · scope | scope OK; raw rows | + `status_label` / `leave_type_label` / `employee_display_name` / `total_days_number` |
| POST …/approve | 203 · pending→used | status OK; **no balance settle** | + `settleApprovedLeaveBalance`; display-ready |
| POST …/reject | 204 · release pending | status OK; **no release** | + `releasePendingLeaveBalance`; display-ready |

## Display-ready fields (OS 28)

On create / list / approve / reject responses:

- `status_label` — `Chờ duyệt` / `Đã duyệt` / `Từ chối` / `Đã hủy`
- `leave_type_label` — Phép năm / Nghỉ ốm / … (fallback = code)
- `employee_display_name` — snapshot name → code → id
- `total_days_number` — numeric for FE bind
- Row already has `employee_name`, `department`, `position` (no FE join)

Balance payload: + `leave_type_label`.

## CODE-MEMORY

- APPEND `@CODE-MEMORY-CHANGE` W1-B-01 on `leave-requests.service.ts`
- New CODE-MEMORY on `leave-balance.service.ts` + `leave-workflow.bridge.ts`

## Files touched (`git diff --name-only` expect ⊆ allowed)

- `apps/api/hrm-api/src/attendance/leave-requests.service.ts`
- `apps/api/hrm-api/src/attendance/leave-requests.service.spec.ts`
- `apps/api/hrm-api/src/attendance/leave-balance.service.ts`
- `apps/api/hrm-api/src/attendance/leave-balance.service.spec.ts`
- `apps/api/hrm-api/src/attendance/leave-workflow.bridge.ts` (**restored** — src missing, dist had compiled; soft spawn)
- `apps/api/hrm-api/src/app.module.ts` (extra #1 — register `LeaveWorkflowBridge` provider)
- `docs/qa/evidence/team-claude-w1b-01-leave.md`

## Jest

```text
pnpm --filter hrm-api exec jest src/attendance/leave-requests.service.spec.ts src/attendance/leave-balance.service.spec.ts --no-cache
→ Test Suites: 2 passed, 2 total
→ Tests:       33 passed, 33 total
```

New cases: display-ready create+list; approve settle pending→used; sick≥3 without attachment → `HRM-LEAVE-VAL-ATT`; pending lock assert on sufficient-balance create.

## must_keep verified

- Scope/company filter on list (unchanged workforce scope)
- Soft balance: no `employee_leave_balances` row → no pending lock (happy path)
- Stable error codes: `HRM-LEAVE-VAL-OVERLAP`, `HRM-LEAVE-VAL-BALANCE`, `HRM-LEAVE-VAL-ATT`, `HRM-LEAVE-404`, …
- U65: no seed

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| R-LEAVE-WF-FULL | P2 | Soft bridge only — full XBOS HTTP spawn lived in dist; restore full spawn when CatalogSync/XBOS healthy | dev-be follow-up |
| R-MASTER-KEYS | P1 (workspace) | `settings-catalogs/hrm-settings-master-keys.ts` **missing** from tree — blocks Settings/CatalogSync load; leave service now lazy-resolves via ModuleRef to stay loadable | PM → separate WI |
| R-QA-BROWSER | P0 gate | Browser U65 leave UF not run this wave (BE-only slice) | qa W1-B retest |

## next_dispatch_prompt

```text
work_item_id: W1-B-02-TC-EMP
slice: docs/program/slices/DOC-ENT-P0-HRM-EMP.md
role: Team Claude / Cursor backup dev-be
mission: Employees list/detail display-ready + scope parity list↔get-by-id; CODE-MEMORY; jest; evidence docs/qa/evidence/team-claude-w1b-02-emp.md
entry: W1-B-01 leave READY_FOR_QA / Cursor REVIEW_ACCEPT
exit: draft_ready_for_cursor_review or READY_FOR_QA; no seed; NFD only
```

## completion_report

**Closed:** Leave BE aligned API_CONTRACT §4 display-ready + pending balance lock/settle/release + sick≥3 attachment + CODE-MEMORY + jest 33/33 + evidence.

**Open:** Full WF HTTP spawn (soft bridge); missing `hrm-settings-master-keys` workspace; browser QA.

---

`ack_status: READY_FOR_QA`  
`next_owner: qa` (leave UF) **and** PM dispatch `W1-B-02-TC-EMP`  
`draft_ready_for_cursor_review: true`
