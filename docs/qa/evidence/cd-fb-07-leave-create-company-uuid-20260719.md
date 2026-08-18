# CD-FB-07-LEAVE-CREATE-COMPANY-UUID — FE leave create UUID company_id

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-07-LEAVE-CREATE-COMPANY-UUID` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **parent** | QC residual `R-CD-FB-07-LEAVE-CREATE-COMPANY-UUID` · QA `cd-fb-07-fe-leave-picker-qa-20260719.md` |
| **executed_at** | `2026-07-19` |
| **ack_status** | **READY_FOR_QA** |
| **U65** | no seed · no Phase1/PROD claim · TEXT/`::uuid` workflow resolver **not reopened** |

---

## Executive summary

Leave create POST under Group CEO portal scope `companyId=main` sent slug `main` → Nest `@IsUUID()` → **400 HRM-VAL-001**. FE now resolves **employee/OU company** (prefer `employee.company_id`, e.g. `holding`) or portal scope slug → UUID via existing `resolveHrmMetadataCompanyUuid` before `createLeaveRequest`. Picker typeahead (C-01 / HLD-0006) and soft-nav **unchanged**.

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| SRS | `docs/hrm/SRS.md` § attendance leave requests |
| TechSpec | `docs/hrm/TECHSPEC.md` attendance leave-requests |
| BE DTO | `CreateLeaveRequestDto.company_id` `@IsUUID()` |
| Residual | QA evidence POST 400 `company_id must be a UUID` when FE sent `main` |
| change_mode | **FIX** |
| must_keep | soft-nav Att↔Rec · typeahead HLD-0006 · no reopen `D-CD-FB-07-RESOLVER-COMPANY-TEXT` |

---

## Changes

| File | Change |
|------|--------|
| `apps/web/hrm/src/hooks/useLeaveRequests.ts` | `buildLeaveCreatePayload` + resolve slug→UUID; optional form `company_id` |
| `apps/web/hrm/src/components/attendance/LeaveTab.tsx` | Pass `company_id: employee.company_id` on submit; CODE-MEMORY-CHANGE |
| `apps/web/hrm/src/hooks/useLeaveRequests.test.ts` | 4 UUID mapping cases (holding/main/UUID/unknown) |
| `apps/web/hrm/src/hooks/useEmployeePicker.test.ts` | Assert LeaveTab still typeahead + passes employee company |
| `apps/web/hrm/src/lib/hrmMetadataCompany.ts` | Comment: reuse for leave mutate `@IsUUID()` |

**Resolution order:** `employee.company_id` → portal `currentCompanyId` → `resolveHrmMetadataCompanyUuid` (`main`/`holding` → `10000000-0000-4000-8000-000000000001`).

---

## Verify (agent)

```text
pnpm exec vitest run \
  src/hooks/useLeaveRequests.test.ts \
  src/hooks/useEmployeePicker.test.ts \
  src/lib/hrmMetadataCompany.test.ts \
  src/lib/portalEmbedSoftNavigate.test.ts
→ 4 files · 22 tests PASS
```

---

## QA next (U65 browser)

| # | Step | Expect |
|---|------|--------|
| 1 | Login `ceo@xe.vn` → HRM Attendance → Nghỉ phép | tab load |
| 2 | Tạo yêu cầu nghỉ → keyword `HLD-0006` → select | typeahead still works (must_keep C-01) |
| 3 | Dates + reason → Gửi | `POST /api/hrm/attendance/leave-requests` **2xx** · body `company_id` = UUID not `main` |
| 4 | FE after 2xx | row appears in list |
| 5 | F5 | row still present |
| 6 | Soft-nav Att↔Rec spot | SPA, no hard reload regression |

**cấm:** seed · Phase1/PROD · reopen TEXT/uuid workflow P0

---

## completion_report

### Closed
- Leave create payload maps slug → UUID; prefer employee OU company; vitest 22 PASS; picker/soft-nav must_keep asserted.

### Residual
- Browser create 2xx+F5 under `main` scope — **QA** (this handoff).
- Member-slug companies outside FE map (e.g. `xe-du-lich`) still return null until slug map extended — out of this residual (holding/main path covers QC fail).

### next_owner
`qa`

### next_dispatch_prompt

```text
work_item_id: CD-FB-07-LEAVE-CREATE-COMPANY-UUID-QA
from_role: pm
to_role: qa
lane: execution
entry_criteria: Dev READY_FOR_QA docs/qa/evidence/cd-fb-07-leave-create-company-uuid-20260719.md — leave create maps company slug→UUID; vitest 22 PASS; typeahead/soft-nav must_keep
exit_criteria: U65 browser ceo@xe.vn — Tạo yêu cầu nghỉ HLD-0006 → POST leave-requests 2xx with UUID company_id (not main) → FE list + F5; typeahead still finds HLD-0006; soft-nav Att↔Rec spot PASS; evidence docs/qa/evidence/cd-fb-07-leave-create-company-uuid-qa-YYYYMMDD.md
J-*: J-HRM-06
cấm: seed · Phase1/PROD · reopen TEXT/uuid workflow P0 · do not regress C-CD-FB-07-01 picker
```

**ack_status:** `READY_FOR_QA`  
**evidence_path:** `docs/qa/evidence/cd-fb-07-leave-create-company-uuid-20260719.md`
