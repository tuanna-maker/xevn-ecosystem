# D-HRM-LEAVE-REQ-CREATE-FE-01 — Leave create POST company_id TEXT slug

| Field | Value |
|-------|--------|
| **Date** | 2026-07-27 |
| **Role** | dev-fe |
| **work_item_id** | `D-HRM-LEAVE-REQ-CREATE-FE-01` |
| **Prior** | QA PASS `docs/qa/evidence/qa-hrm-leave-req-create-01-20260727.md` §7 — residual P1 FE POSTs holding UUID |
| **BE** | `docs/qa/evidence/be-hrm-leave-req-create-01-20260727.md` (UUID/`holding`/`main` → 201) |
| **Constraints** | U65 zero-seed · HOLD_DEPLOY · NOT Settings MD reopen · NOT `:8088` · NOT Phase1/PROD |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Item | Path / § |
|------|----------|
| **srs** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.5 · **FR-HRM-AT-10** / UC-HRM-10 |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §14.5 FR-HRM-AT-10 · §14.9 **G-AT10-01** TEXT · VAL-SET-MD-02 / BR-HRM-MD-01 |
| **catalog partition** | Settings `resolveHrmSettingsCatalogCompanyId` — `main` / holding UUID → **`holding`** |
| **sponsor_confirm** | PM dispatch `D-HRM-LEAVE-REQ-CREATE-FE-01` 2026-07-27 (QA residual P1) |
| **change_mode** | **FIX** |

---

## Root cause

`buildLeaveCreatePayload` (CD-FB-07) forced `resolveHrmMetadataCompanyUuid` so LeaveTab submit of `employee.company_id` (holding UUID) became POST body UUID. BE now accepts UUID and maps → `holding`, but G-AT10-01 / Settings catalog prefer FE TEXT slug.

---

## Fix (source)

| Area | Change |
|------|--------|
| `hrmMetadataCompany.ts` | ADD `resolveHrmLeaveCreateCompanyId` — `main`/holding UUID → `holding`; member UUID → operating slug; metadata UUID helper unchanged |
| `useLeaveRequests.ts` | `buildLeaveCreatePayload` uses slug helper (not UUID); CODE-MEMORY APPEND |
| `LeaveTab.tsx` | Still binds `employee.company_id`; hook maps UUID→slug; CODE-MEMORY APPEND |
| Tests | `useLeaveRequests.test.ts` + `hrmMetadataCompany.test.ts` |

**must_keep:** leave_type catalog SoT / picker · create→201 · G-AT10-02 toast codes · metadata UUID path · Settings MD not reopened · U65 no seed · HOLD_DEPLOY

---

## Verification

```text
pnpm exec vitest run src/hooks/useLeaveRequests.test.ts src/lib/hrmMetadataCompany.test.ts
→ Test Files: 2 passed · Tests: 13 passed
```

Payload expectations:

| Input | POST `company_id` |
|-------|-------------------|
| holding UUID `10000000-…-0001` | `holding` |
| `main` | `holding` |
| `holding` | `holding` |
| trsport UUID | `trsport` |
| leave_type | unchanged (`LVT_01` in regression fixture) |

Seed: **not used**. Settings MD: **not touched**.

---

## Residuals

| Item | Sev | Owner |
|------|-----|--------|
| Light browser smoke create→201 body `company_id=holding` → F5 | P2 optional | **qa** |
| HOLD_DEPLOY | — | unchanged |

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/fe-hrm-leave-req-create-01-20260727.md`

### completion_report

**Closed:** Leave create POST `company_id` now TEXT slug aligned Settings partition (`holding` for main/holding UUID); member UUID→slug; leave_type path untouched; vitest 13 PASS; Settings MD not reopened; zero seed; HOLD_DEPLOY.

**Open:** Optional light QA smoke assert Network body slug + 201 + F5.

### next_dispatch_prompt

```
work_item_id: QA-HRM-LEAVE-REQ-CREATE-FE-SLUG-01
from_role: pm
to_role: qa
lane: execution

entry: FE READY_FOR_QA docs/qa/evidence/fe-hrm-leave-req-create-01-20260727.md
prior UF: docs/qa/evidence/qa-hrm-leave-req-create-01-20260727.md §7 already 201
scope: light smoke only — ceo@xe.vn → Attendance → Nghỉ phép → Tạo → LVT_01 → Gửi
assert: Network POST company_id is TEXT slug holding (NOT holding UUID) · status 201 · F5 list row
cấm: seed · Settings MD · :8088 · Phase1/PROD · HOLD_DEPLOY honor
evidence: docs/qa/evidence/qa-hrm-leave-req-create-fe-slug-01-20260727.md
exit: PASS_TO_PM or FAIL with body snapshot
```
