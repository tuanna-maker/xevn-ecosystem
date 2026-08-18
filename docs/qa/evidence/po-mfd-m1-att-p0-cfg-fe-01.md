# Evidence — PO-MFD-M1-ATT-P0-CFG-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-P0-CFG-FE-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **uat_done** | false (U65 — QA browser) |

## spec_read_ack

| Layer | Path |
|-------|------|
| **srs** | `docs/hrm/SRS.md` · attendance CFG Rules→Chung/Standard/App |
| **tech_spec** | `docs/hrm/TECHSPEC.md` · ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md D2–D4 |
| **api_design** | `docs/qa/evidence/po-mfd-m1-att-p0-cfg-be-01.md` handoff table |
| **change_mode** | FIX |

## completion_report

**Closed:**

- `hrmApi.ts` — `getAttendanceRules`, `patchAttendanceRules` (omit `gps_locations` / `faceid_enabled`), work-sites CRUD.
- `useAttendanceRules.ts` — parallel GET rules + work-sites; PATCH save; GPS add/update/remove via work-sites only; `@CODE-MEMORY` APPEND.
- `Attendance.tsx` — Rules→Chung/Standard controlled form + Lưu → Nest; App tab policy toggles + GPS dialog CRUD; Face ID banner + disabled; D4 stubs (`overtime`, `leave-rules`, `late-early`, `request-rules`) → Settings catalog link.
- i18n `vi`/`en` keys for redirect + Face ID GĐ1.
- Vitest: `useAttendanceRules.rounding.test.ts` (2 cases).

**Residual:**

- Customize columns tab still non-persist (ADR scope).
- GPS edit-in-place UI: delete + add only (update API wired in hook, edit button deferred).
- QA L2.5 browser AT-14: Lưu→F5 + geofence check-in matrix.

## Verification

```bash
pnpm --filter @xevn/hrm exec vitest run src/hooks/useAttendanceRules.rounding.test.ts
```

## QA matrix (U65)

| Step | Persona | Expect |
|------|---------|--------|
| AT-14 rules | Group CEO `ceo@xe.vn` | Settings→Chấm công→Quy tắc→Chung: đổi ngày/làm tròn → Lưu → toast success → F5 giữ giá trị GET |
| GPS admin | same | App tab → Thêm vị trí → list row → xóa → F5 khớp GET work-sites |
| D4 stub | same | Sidebar Tăng ca / Nghỉ phép / Đi muộn / Đơn từ → banner + link `/settings`, không fake Lưu |
| Face ID | same | App tab banner; toggle Face ID disabled |

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M1-ATT-P0-CFG-QA-01
from_role: qa
to_role: pm
lane: execution
priority: P0
u65_zero_seed: true

entry_criteria:
- hrm-api :28001 up; portal /hr/attendance settings
- dev-fe READY_FOR_QA docs/qa/evidence/po-mfd-m1-att-p0-cfg-fe-01.md

exit_criteria:
- Browser AT-14: Rules→Chung Lưu → F5 values match Network GET /api/hrm/attendance/rules
- App→GPS: POST work-site from UI → F5 list; optional geo check-in inside/outside (BE HRM-ATT-GEO-001)
- D4 stubs: overtime/leave-rules/late-early/request-rules show redirect only
- evidence_path: docs/qa/evidence/po-mfd-m1-att-p0-cfg-qa-01.md
- ack_status: PASS_TO_PM or FAIL with defect ids
```
