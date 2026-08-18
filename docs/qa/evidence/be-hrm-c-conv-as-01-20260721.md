# BE-HRM-C-CONV-AS-01 — Attendance sheets DTO at edge

| Field | Value |
|-------|-------|
| **work_item_id** | `BE-HRM-C-CONV-AS-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` (via pm) |
| **lane** | execution |
| **priority** | P1 |
| **date** | 2026-07-21 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD DTO + wire — **no** sheet auto-fill / leave overlap / seed / Phase1 |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/hrm/SRS.md` AC-ATT-SHEET-01..06 · BR-ATT-SHEET-01..07 · FR-HRM-AT-14 / UC-HRM-23 |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §12.1 create body · §14.4 · **§15.1** DTO at edge |
| **tm** | `docs/qa/evidence/tm-hrm-code-spec-convention-01-20260721.md` Condition **C3** / gap **C-CONV-AS-01** |
| **sponsor_confirm** | TM GWC C3 · PM dispatch `BE-HRM-C-CONV-AS-01` |
| **change_mode** | ADD |
| **must_keep** | AC-ATT-SHEET-01..06 empty honesty — create = **header only**; **no** auto-seed roster / `attendance_records` |
| **forbidden** | sheet business auto-fill · G-AT10-02 leave overlap · seed · Phase1/PROD claim |

**spec says / code did:** §15.1 requires class-validator DTO on W1 POST/PATCH; sheets used `Record<string, unknown>` → ValidationPipe whitelist inactive.  
**spec says / code does now:** `CreateAttendanceSheetDto` + `UpdateAttendanceSheetDto` on controller + catalog service.

---

## Closed

1. **DTO**
   - `apps/api/hrm-api/src/attendance/dto/create-attendance-sheet.dto.ts` — `company_id`, `name`, `start_date`/`end_date` (`@IsDateString`), optional type/dept/positions/notes (+ `@CODE-MEMORY`)
   - `apps/api/hrm-api/src/attendance/dto/update-attendance-sheet.dto.ts` — `PartialType(CreateAttendanceSheetDto)`
2. **Wire**
   - `attendance.controller.ts` POST/PATCH `@Body()` typed DTOs
   - `attendance-catalog.service.ts` create/update signatures use DTOs (SQL unchanged — header INSERT only)
3. **Jest** `src/attendance/be-hrm-c-conv-as-01.spec.ts` — **10/10 PASS**
   - validateSync: missing required · non-ISO date · forbidNonWhitelisted
   - Nest `ValidationPipe` HTTP: POST/PATCH invalid → **400**; catalog **not** called
   - valid POST → **201** `HRM-AS-201`
   - must_keep: create SQL = `INSERT INTO public.attendance_sheets` only (no `attendance_records`)

```text
pnpm --filter hrm-api exec jest src/attendance/be-hrm-c-conv-as-01.spec.ts --no-coverage
# Test Suites: 1 passed · Tests: 10 passed
```

---

## Residual

| ID | Note |
|----|------|
| G-AT10-02 | Leave overlap — **out of scope** this item |
| BR-ATT-SHEET-04 date order | Still service/FE; DTO does not add start≤end business reject (narrow convention only) |
| Work shifts | Still `Record<string, unknown>` — not C-CONV-AS-01 |

---

## completion_report

**Closed:** C-CONV-AS-01 — sheets POST/PATCH DTO + ValidationPipe 400 + empty-honesty must_keep jest.  
**Residual:** G-AT10-02 / BR date-order service (separate).  
**Not claimed:** Phase 1 DONE · PROD · UF browser PASS.

---

## Handoff

- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/be-hrm-c-conv-as-01-20260721.md`
- **pm_dispatch_hint:** `QA-HRM-C-CONV-AS-01` — smoke create sheet U65 AC-ATT-SHEET-01/05; invalid body Network 400; no seed

### next_dispatch_prompt

```text
work_item_id: QA-HRM-C-CONV-AS-01
from_role: pm
to_role: qa
lane: execution
priority: P1
entry_criteria: BE READY_FOR_QA docs/qa/evidence/be-hrm-c-conv-as-01-20260721.md; L0 stack; U65 zero-seed
exit_criteria:
  - Browser: login → HRM Chấm công → tạo bảng kỳ 01/07/2026–31/07/2026 Công chuẩn → POST 201 HRM-AS-201 → list row (AC-ATT-SHEET-01) + F5 (AC-ATT-SHEET-05)
  - Open sheet: empty honesty OK if no records (AC-ATT-SHEET-02/06) — no auto roster invent
  - Optional probe: POST missing name/dates or unknown field → 400
  - cấm seed · không claim Phase1
evidence_path: docs/qa/evidence/qa-hrm-c-conv-as-01-YYYYMMDD.md
ack_status: PASS_TO_PM
```
