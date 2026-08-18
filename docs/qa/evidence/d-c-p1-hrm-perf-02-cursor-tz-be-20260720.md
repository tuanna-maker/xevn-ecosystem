# D-C-P1-HRM-PERF-02-CURSOR-TZ — Employee list cursor ISO / TZ fix

| Field | Value |
|-------|--------|
| **work_item_id** | `D-C-P1-HRM-PERF-02-CURSOR-TZ` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **change_mode** | FIX |
| **date** | `2026-07-20` |
| **ack_status** | **READY_FOR_QA** |
| **parent FAIL** | `docs/qa/evidence/c-p1-hrm-perf-02-qa-20260720.md` |
| **next** | `C-P1-HRM-PERF-02-QA-R2` |
| **U65** | zero-seed · no Phase1/PROD claim |

---

## spec_read_ack

- **srs:** `docs/hrm/SRS.md` §Employees list (UC-HRM-20 / UC-HRM-21)
- **tech_spec:** `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §5.4 Cursor
- **qa_fail:** `docs/qa/evidence/c-p1-hrm-perf-02-qa-20260720.md` — page-2 `cursor=` → 500 `HRM-SYS-001` `time zone "gmt+0700" not recognized`
- **must_keep:** OFFSET when no cursor · `GET /employees/summary` · leave WF · recruitment WF

---

## Root cause

1. **Primary (QA):** `encodeEmployeeListCursor(last.created_at, last.id)` stringified node-pg `Date` via `Date.toString()` → `Fri Jun 05 2026 … GMT+0700 (Indochina Time)`. `Date.parse` accepted it; PostgreSQL `$n::timestamptz` rejected → **HTTP 500**.
2. **Secondary (live after ISO-only):** JS `Date` only has **millisecond** precision; encoding truncated PG microseconds → keyset `(created_at, id) < cursor` **skipped** same-ms rows (walk stopped ~200/1108 with page-2+ still 200).

---

## Fix

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/employees/employee-list-cursor.ts` | `toEmployeeListCursorIso` — always ISO-8601 Z; preserve fractional seconds on ISO strings; normalize legacy GMT+0700; `encodeEmployeeListCursorFromRow` prefers SQL cursor text |
| `apps/api/hrm-api/src/employees/employees.service.ts` | SELECT `to_char(created_at AT TIME ZONE 'UTC', '…SS.US"Z"') AS created_at_cursor`; encode from that; `@CODE-MEMORY-CHANGE` |
| `apps/api/hrm-api/src/employees/cd-fb-05-perf-be.spec.ts` | Date / legacy GMT+0700 / microsecond preserve + page1→page2 bind ISO |

---

## Verification

### Jest (must_keep)

```text
pnpm --filter hrm-api exec jest --testPathPatterns=cd-fb-05-perf-be \
  --testPathPatterns=p1-hrm-perf-be-01 \
  --testPathPatterns=leave-workflow.bridge \
  --testPathPatterns=recruitment-workflow.bridge --no-coverage
```

| Suite | Result |
|-------|--------|
| cd-fb-05-perf-be + p1-hrm-perf-be-01 + leave + recruitment bridges | **4 suites · 39 tests PASS** |

### Live (ceo@xe.vn, zero-seed, `:28001`)

| Step | Result |
|------|--------|
| Page 1 `page_size=100` | **200** · `total=1108` · `next_cursor` ISO with micros (`…993886Z`) · **no** `GMT+` |
| Page 2+ cursor walk | **200** each page |
| Exhaust | **12 pages** · `seen=1108` · `total=1108` · `exhausted=true` |
| Cursor p2 first === OFFSET p2 first | **true** |

Seed: **none**.

---

## Residual

- None for this defect class.
- QA R2: browser Export/Archive Network walk (U65) + dashboard summary must_keep.

---

## Handoff

**ack_status:** READY_FOR_QA  
**next_owner:** qa  
**next_dispatch_prompt:** see completion packet below  
**evidence_path:** `docs/qa/evidence/d-c-p1-hrm-perf-02-cursor-tz-be-20260720.md`
