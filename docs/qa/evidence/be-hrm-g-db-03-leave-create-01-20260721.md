# BE-HRM-G-DB-03-LEAVE-CREATE-01 — leave_requests CREATE in Nest ensureSchema

| Field | Value |
|-------|-------|
| **work_item_id** | `BE-HRM-G-DB-03-LEAVE-CREATE-01` |
| **from_role** | pm |
| **to_role** | dev-be |
| **lane** | execution |
| **priority** | P1 |
| **date** | 2026-07-21 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD-only |
| **spec_ref** | SA `docs/qa/evidence/sa-hrm-db-api-map-w3-db-01-20260721.md` · TechSpec `docs/hrm/TECHSPEC.md` §17.3 **G-DB-03** · §14.5 FR-HRM-AT-10 |
| **cấm tuân thủ** | seed · Phase1/PROD claim · recruitment headcount · bulk ADD FK (G-DB-02) |

---

## 1. Entry / gap (SA)

| Finding | Action |
|---------|--------|
| G-DB-03: `leave_requests` **không** có `CREATE TABLE` trong Nest — chỉ `ALTER` (`attachment_url`, `workflow_instance_id`) | ADD `CREATE TABLE IF NOT EXISTS public.leave_requests` trước ALTER |

---

## 2. Implementation (narrow)

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/attendance/leave-requests.service.ts` | `ensureSchema`: CREATE (company_id **TEXT**, soft `employee_id`, full insert columns + `workflow_instance_id`) → index → ALTER ADD IF NOT EXISTS → ALTER `company_id` TYPE TEXT (G-AT10-01 upgrade) |
| `apps/api/hrm-api/src/attendance/leave-workflow.bridge.ts` | `ensureSchema`: **CREATE** same table before ALTER `workflow_instance_id` (cold callback/spawn path) |
| `docs/hrm/TECHSPEC.md` §17.3 | G-DB-03 marked **CLOSED 2026-07-21** (CREATE ensure); residual G-AT10-01 TEXT persist = separate WI |

**Not touched:** G-DB-01/02/04–08 · recruitment headcount · hard `REFERENCES employees` · seed.

---

## 3. Verification

```bash
pnpm exec jest --clearCache
pnpm exec jest --testPathPatterns=leave-requests.service.spec --no-coverage --runInBand
# → 1 suite · 14 passed
pnpm exec jest --testPathPatterns=leave-workflow.bridge.spec --no-coverage --runInBand
# → 1 suite · 7 passed (incl. G-DB-03 CREATE before ALTER on terminal callback)
```

| Assert | Result |
|--------|--------|
| CREATE before ALTER (`attachment_url` / `workflow_instance_id`) | PASS |
| `company_id TEXT NOT NULL` in CREATE | PASS |
| Soft `employee_id UUID NOT NULL` (no REFERENCES) | PASS |
| Bridge cold callback CREATE then ALTER | PASS |

---

## 4. completion_report

**Closed:**
- Nest ensureSchema emits `CREATE TABLE IF NOT EXISTS public.leave_requests` on leave create/list and leave-workflow bridge paths (G-DB-03).
- Jest coverage for CREATE-before-ALTER; TechSpec §17.3 G-DB-03 CLOSED note.
- Evidence this file.

**Residual (out of narrow scope):**
- G-AT10-01 company_id TEXT persist / DTO slug — separate WI (already partially in tree).
- G-DB-02 hard FK spine — **not** this wave.
- G-DB-01 hire employee link — separate.
- Browser U65 leave create/F5 — **QA**.

**Not claimed:** Phase 1 DONE · PROD · seed · other G-DB-*.

---

## 5. Handoff

- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/be-hrm-g-db-03-leave-create-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-G-DB-03-LEAVE-CREATE-01
from_role: pm
to_role: qa
lane: execution
priority: P1

## Entry
BE READY_FOR_QA: docs/qa/evidence/be-hrm-g-db-03-leave-create-01-20260721.md
TechSpec §17.3 G-DB-03 CLOSED (CREATE ensure)
U65 zero-seed · browser-only

## Job
1. Cold or empty leave path: login → Chấm công → Đơn nghỉ → tạo đơn (FE) → Network POST leave-requests 2xx
2. Confirm no 42P01 / relation "leave_requests" does not exist
3. FE sau 2xx: row pending; F5 còn data
4. Do NOT seed; do NOT expand to G-DB-01/02/04
5. Evidence: docs/qa/evidence/qa-hrm-g-db-03-leave-create-01-20260721.md
6. ack_status PASS_TO_PM or FAIL_TO_PM

entry_criteria: hrm-api up; BE evidence PASS
exit_criteria: UF leave create browser evidence; no relation-missing error
```
