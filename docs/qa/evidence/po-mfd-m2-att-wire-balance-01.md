# PO-MFD-M2-ATT-WIRE-BALANCE-01 — FE attendance fidelity wire

| Field | Value |
|-------|--------|
| **work_item_id** | PO-MFD-M2-ATT-WIRE-BALANCE-01 |
| **role** | dev-fe |
| **ack_status** | READY_FOR_QA |
| **date** | 2026-08-04 |

## spec_read_ack

- **srs:** `docs/hrm/SRS.md` · leave balance before submit · attendance leave tab
- **tech_spec:** `docs/hrm/TECHSPEC.md` · GET `/attendance/leave-balance` · HRM-LEAVE-BAL-200
- **enterprise_map:** `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_ENTERPRISE_API_MAP.md` C5 WIRE
- **fidelity_matrix:** `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_FIDELITY_MATRIX.md` rows 17–18 schedule GĐ2-HOLD
- **change_mode:** FIX · preserve useWorkShifts loop · leave approve x-company-id · MD-01 catalog

## Closed (FE)

1. **Leave balance WIRE** — `fetchLeaveBalance` + `useLeaveBalance` + `LeaveTab` panel (`data-testid=leave-balance-panel`) and create-dialog inline balance after employee + leave type; 2xx shows remaining/entitled/used/pending; error/empty honest; removed «Demo» i18n.
2. **Shift schedule/OT** — `activeShiftType=schedule|overtime` → hold Alert (not same shift list); back link to list.
3. **FaceID GĐ2-HOLD** — banner + disabled interaction; `featureHold` blocks check-in/register success paths.
4. **Settings CFG** — ~~`cfgNotPersisted` destructive toast~~ **SUPERSEDED 2026-08-04** by `PO-MFD-M1-ATT-P0-CFG-*` + commit `dc930c5`: Chung **Lưu** → `PATCH /api/hrm/attendance/rules` **200** + F5 (ADR-HRM-ATTENDANCE-CFG-PERSIST D2; QC GWC `po-mfd-m1-att-p0-cfg-qc-01.md`). Doc retire: `PO-MFD-M2-ATT-CFG-DOC-01`.

## Residual

- Rules subtabs tablet/proxy/auto remain GĐ2 / `featureInDev` (ADR D4) — **not** covered by Chung PATCH persist.
- Sheet columns catalog (`getAttendanceColumnsData`) still HARDCODED — out of CFG rules persist close.
- HR persona without `memberships[].employee_id` must pick employee in create dialog to load balance (documented in UI copy).

## Tests

```bash
cd apps/web/hrm && pnpm exec vitest run src/lib/leaveBalance.test.ts src/hooks/useLeaveRequests.test.ts
```

## QA (U65 browser)

- Login → `/hr/attendance` → tab **Nghỉ phép** → Network `GET .../leave-balance` 2xx after employee context → panel shows days (not Demo).
- Tab **Ca** → submenu **Phân ca** / **Làm thêm** → hold message, not shift grid clone.
- Clock-In → Face → hold banner; no success toast on confirm.
- Settings → Quy định → **Chung** → **Lưu** → Network `PATCH …/attendance/rules` **200** + F5 retains values (**not** `cfgNotPersisted`; see M1 CFG QA/QC).

## next_dispatch_prompt

See handoff in dev-fe completion message.
