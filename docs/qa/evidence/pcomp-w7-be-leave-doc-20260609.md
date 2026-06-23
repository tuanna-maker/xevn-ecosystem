# PCOMP-W7-BE-LEAVE-DOC — Leave medical attachment_url (W7-3)

| Field | Value |
|-------|-------|
| **work_item_id** | PCOMP-W7-BE-LEAVE-DOC |
| **role** | dev-be |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | `MOBILE_W7_DATA_CONTRACTS.md` §3 · ADR D-W7-01 · VAL-W7-LATT-* |
| **journeys** | J-MOB-11 · MOB-UX-06b |

---

## Summary

Closed W7-3 backend gap: mobile `CreateLeaveRequestScreen` already POSTs `attachment_url` after `feature=leave_attachment` upload; Nest now accepts, validates, and persists the column on `public.leave_requests`. List (`SELECT lr.*`) returns `attachment_url` under existing workforce scope — no list↔detail parity gap for mobile detail load (list filter by id).

---

## API contract

```http
POST /api/hrm/attendance/leave-requests
Authorization: Bearer {jwt}
Content-Type: application/json

{
  "company_id": "{uuid}",
  "employee_id": "{uuid}",
  "employee_code": "NV1001",
  "employee_name": "Nguyễn Văn UAT",
  "leave_type": "sick",
  "start_date": "2026-06-10",
  "end_date": "2026-06-12",
  "total_days": 3,
  "attachment_url": "/api/hrm/files/holding/leave_attachment-1717747300000-giay-bac-si.pdf"
}
```

**201** `HRM-LEAVE-201` — response `data.attachment_url` echoed from DB.

**400** `HRM-LEAVE-VAL-ATT` — URL not under `/api/hrm/files/{scope}/` (VAL-W7-LATT-02).

Optional for all leave types (VAL-W7-LATT-01 — client blocks sick/maternity without upload).

---

## Scope parity (U19)

| Layer | Mechanism |
|-------|-----------|
| List | `normalizePayrollListCompanyId` → `resolveHrmListScope` → `pushWorkforceEmployeeScopeFilter('lr.employee_id')` — unchanged |
| Column | `SELECT lr.*` includes `attachment_url` when column present |
| Create | `ensureSchema()` idempotent `ADD COLUMN IF NOT EXISTS attachment_url TEXT NULL` |

**Residual (out of slice):** scoped `GET /attendance/leave-requests/:id` — mobile uses list+id filter today; ADR D-W7-04 whos_out cross-nav GWC.

---

## Delta (2026-06-09)

| File | Change |
|------|--------|
| `dto/create-leave-request.dto.ts` | Optional `attachment_url` string |
| `leave-requests.service.ts` | `ensureSchema`, `assertValidLeaveAttachmentUrl`, INSERT + RETURNING |
| `leave-requests.service.spec.ts` | PCOMP-W7-BE-LEAVE-DOC + VAL-W7-LATT-02 regressions |

---

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Leave requests unit | `pnpm --filter hrm-api exec npx jest leave-requests.service.spec.ts --no-cache` | **9/9 PASS** |
| Attendance controller | `pnpm --filter hrm-api exec npx jest attendance.controller.spec.ts --no-cache` | **21/21 PASS** |
| Combined | both files | **30/30 PASS** |
| TypeScript build | `pnpm --filter hrm-api run build` | exit **0** |
| Local HTTP smoke | `:28001` sick leave + attachment | **SKIP** — stack not running |

---

## QA dispatch (L2.5)

| Journey | Account | Steps |
|---------|---------|-------|
| J-MOB-11 | `uat.nv####@xe.vn` | Create sick leave → upload PDF → submit → list/detail shows attachment link |
| MOB-UX-06b | same | Verify `attachment_url` in POST body persisted; open WebView on detail |

Pre-deploy nip.io may still strip field until API image updated — compare local :28001 after `pnpm run dev:hrm-api`.

---

## Handoff

- **next_owner:** qa
- **pm_dispatch_hint:** J-MOB-11 device + list/detail attachment_url round-trip after deploy
