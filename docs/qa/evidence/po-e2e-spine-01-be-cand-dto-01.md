# Evidence — PO-E2E-SPINE-01-BE-CAND-DTO-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-01-BE-CAND-DTO-01` |
| **from_role** | pm → **dev-be** |
| **date** | 2026-08-03 |
| **prior** | QA FAIL `po-e2e-spine-01-qa-w4.md` — POST candidates **400** `HRM-VAL-001` |
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | qa |

## spec_read_ack

- srs: `docs/client-delivery/hrm/SRS_HRM_KHACH.md` FR-HRM-RC-03 · FR-HRM-INT-01 · HDSD CH07 §6 Thêm ứng viên
- tech_spec: `docs/hrm/TECHSPEC.md` §17.6 dual-route POST `/candidates` · §17.3 G-DB-01 hire
- qa_fail: `docs/qa/evidence/po-e2e-spine-01-qa-w4.md` — FE `CandidateFormDialog` non-whitelisted props
- change_mode: **ADD**
- must_keep: Leave/LV-03/04 GWC · AUTH/EMP/CAT · HP-03 Inbox closed · G-DB-01 hire bind

## Root cause

| Layer | Fact |
|-------|------|
| FE | `CandidateFormDialog` POST includes `position`, `rating`, `expected_start_date`, `nationality`, `hometown`, `marital_status` |
| BE | `CreateCandidateDto` lacked those props → Nest `forbidNonWhitelisted` → **400** `HRM-VAL-001` |
| DB | Supabase `candidates` Row already had columns; Nest `ensureWave2Schema` CREATE was minimal — ADD COLUMN IF NOT EXISTS |

## Fix (ADD)

1. **`CreateCandidateDto`** — optional: `position`, `rating` (0–5), `expected_start_date`, `nationality`, `hometown`, `marital_status`, `employee_id` (+ null-tolerant phone/notes/dates).
2. **`UpdateCandidatePoolDto`** — same FE form fields (PATCH parity).
3. **`RecruitmentCatalogService`**
   - `ensureWave2Schema`: ADD COLUMN IF NOT EXISTS for the six form columns.
   - `createCandidatePool` / `updateCandidatePool`: persist fields.
4. **@CODE-MEMORY APPEND** on DTO + catalog service.
5. **Jest** FE-shaped payload → 0 validation errors; INSERT includes columns; hired without `employee_id` still `HRM-REC-HIRE-400`.

## Verify

```text
pnpm --filter hrm-api exec jest --testPathPatterns=po-e2e-spine-01-be-cand-dto-01 --testPathPatterns=recruitment.controller.spec
→ Test Suites: 2 passed · Tests: 20 passed

pnpm --filter hrm-api exec jest --testPathPatterns=hire-employee-link --testPathPatterns=recruitment-catalog.service.spec --testPathPatterns=recruitment.service.spec
→ Test Suites: 2 passed · Tests: 11 passed
```

## must_keep (untouched)

| Area | Status |
|------|--------|
| Leave / LV-03/04 | not opened |
| AUTH / EMP / CAT | not opened |
| HP-03 Inbox | not reopened |
| G-DB-01 hire `employee_id` when stage=hired | still enforced (jest) |
| Dual-route `requisition_id` → Lane A | unchanged |

## Residual

| ID | Note |
|----|------|
| Browser UF | QA must retest U65 Thêm UV → Lưu 2xx → Đã tuyển → HireEmployeeLinkDialog → F5 |
| Seed | none used |

## Handoff

```
ack_status: READY_FOR_QA
next_owner: qa
evidence_path: docs/qa/evidence/po-e2e-spine-01-be-cand-dto-01.md
next_dispatch_prompt: PO-E2E-SPINE-01-QA-W4-R1 — browser U65 Thêm UV → Lưu 2xx → Đã tuyển → HireEmployeeLinkDialog → F5
```

### completion_report

- Closed: DTO↔FE form parity for create (and PATCH) candidate pool; persist form columns; jest FE-shaped body not VAL-001; G-DB-01 hire path intact.
- Open: browser HP-04/05 QA retest (no UF claim this wave).
