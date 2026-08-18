# BE-HRM-G-AT10-02-LEAVE-OVERLAP-01 — leave create overlap + balance rejects

| Field | Value |
|-------|-------|
| **work_item_id** | `BE-HRM-G-AT10-02-LEAVE-OVERLAP-01` |
| **from_role** | pm |
| **to_role** | dev-be |
| **lane** | execution |
| **priority** | P1 |
| **date** | 2026-07-21 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD-only |
| **spec_ref** | TM C4 `docs/qa/evidence/tm-hrm-code-spec-convention-01-20260721.md` · SRS khách §3.5 FR-HRM-AT-10 Diễn biến #5/#6 · TechSpec `docs/hrm/TECHSPEC.md` §14.5 / §14.9 **G-AT10-02** |
| **cấm tuân thủ** | seed · hard FK G-DB-02 · Phase1/PROD · change attendance sheet DTO |

---

## 1. spec_read_ack

| Item | Value |
|------|-------|
| **srs** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.5 **FR-HRM-AT-10** — Diễn biến #5 chồng lịch · #6 hết phép · #7 gửi thành công |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §14.5 · §14.9 **G-AT10-02** (`ref_srs`: FR-HRM-AT-10) |
| **tm** | Condition **C4** — overlap + balance deterministic codes |
| **uc_ids** | UC-HRM-10 / HRM-AT-10 |
| **change_mode** | ADD |
| **must_keep** | G-DB-03 leave CREATE ensure · G-AT10-01 TEXT slug persist · leave-workflow bridge · happy create when balance **not** tracked |
| **forbidden** | seed · G-DB-02 hard FK · attendance-sheets DTO · Phase1/PROD claim |

**spec says / code does (before):** validate date order + attachment only; no overlap query; no balance reject on create.  
**spec says / code does (after):** overlap → `HRM-LEAVE-VAL-OVERLAP` 409; insufficient tracked balance → `HRM-LEAVE-VAL-BALANCE` 400; untracked balance → allow create (SRS «nếu theo dõi số dư»).

---

## 2. Implementation (narrow)

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/attendance/leave-requests.service.ts` | `assertNoLeaveOverlap` (pending\|approved + inclusive daterange); `assertSufficientLeaveBalance` (row or `custom_fields.leave_balance_{type}`); codes exported; CODE-MEMORY CHANGE |
| `apps/api/hrm-api/src/attendance/leave-requests.service.spec.ts` | Branched create mock; 3 G-AT10-02 cases + happy still inserts |
| `apps/api/hrm-api/src/attendance/dto/create-leave-request.dto.ts` | CODE-MEMORY note only (shape unchanged) |
| `docs/hrm/TECHSPEC.md` §14.5 | Reject codes row + G-AT10-02 **CLOSED** |

**Reject contract**

| Case | HTTP | code | details |
|------|------|------|---------|
| Overlap pending/approved | **409** | `HRM-LEAVE-VAL-OVERLAP` | `conflicting_id`, `conflicting_status` |
| Tracked balance & `total_days` > available | **400** | `HRM-LEAVE-VAL-BALANCE` | `available_days`, `requested_days`, `leave_type`, `balance_year`, `source` |
| No balance row / no custom_fields | — | — | create proceeds (must_keep happy path) |

**Not touched:** attendance sheet DTO · G-DB-02 · seed · approve/reject path · leave-workflow bridge logic.

---

## 3. Verification

```bash
pnpm exec jest --testPathPatterns=leave-requests.service.spec --no-coverage --runInBand
# → 1 suite · 17 passed (was 14; +3 G-AT10-02)
```

| Assert | Result |
|--------|--------|
| Overlap → `HRM-LEAVE-VAL-OVERLAP` + 409; no INSERT | PASS |
| Insufficient balance → `HRM-LEAVE-VAL-BALANCE` + 400; no INSERT | PASS |
| Sufficient / untracked balance → insert + fanout | PASS |
| G-AT10-01 slug + G-DB-03 CREATE must_keep | PASS |

---

## 4. completion_report

**Closed:**
- G-AT10-02 / TM C4: leave create enforces Diễn biến #5/#6 with stable 4xx codes.
- Jest 17/17 including overlap, balance reject, happy create.
- TechSpec §14.5 G-AT10-02 marked CLOSED (QA verify remaining).
- Evidence this file.

**Residual:**
- Browser U65 leave create overlap/balance paths — **QA**.
- FE toast map for new codes — optional FE follow if UI shows raw code.
- G-AT10-03 `@IsDateString` — P2 out of scope.

**Not claimed:** Phase 1 DONE · PROD · seed · sheet DTO.

---

## 5. Handoff

- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/be-hrm-g-at10-02-leave-overlap-01-20260721.md`
- **pm_dispatch_hint:** `QA-HRM-G-AT10-02-LEAVE-OVERLAP-01` — browser create: non-overlap 201; second overlapping range expect Network **409** `HRM-LEAVE-VAL-OVERLAP`; if employee has balance row, over-request expect **400** `HRM-LEAVE-VAL-BALANCE`; U65 zero-seed

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-G-AT10-02-LEAVE-OVERLAP-01
from_role: pm
to_role: qa
lane: execution
priority: P1

## Entry
BE READY_FOR_QA: docs/qa/evidence/be-hrm-g-at10-02-leave-overlap-01-20260721.md
SRS FR-HRM-AT-10 Diễn biến #5/#6 · TechSpec §14.5 G-AT10-02 CLOSED (BE)
U65 zero-seed · browser-only
must_keep: leave CREATE happy path (G-DB-03 / G-AT10-01) still 201 when no overlap / no tracked balance shortfall

## Job
1. Login persona with leave create → Chấm công → Đơn nghỉ → Tạo đơn non-overlap → Network POST 2xx / HRM-LEAVE-201; FE list row; F5 còn
2. Same employee overlapping dates (pending/approved) → Network **409** code **HRM-LEAVE-VAL-OVERLAP**; no duplicate row
3. If environment has tracked leave balance for type: request total_days > available → **400** **HRM-LEAVE-VAL-BALANCE**; if no tracked balance, document skip (BE by design)
4. Do NOT seed; do NOT touch attendance sheets
5. Evidence: docs/qa/evidence/qa-hrm-g-at10-02-leave-overlap-01-20260721.md
6. ack_status PASS_TO_PM or FAIL_TO_PM

entry_criteria: BE evidence + stack L0
exit_criteria: UF evidence blocks for #5/#6; matrix note; PASS_TO_PM
```
