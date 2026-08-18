# Evidence — PO-MFD-M1-ATT-P0-CFG-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-P0-CFG-BE-01` |
| **from_role** | dev-be |
| **to_role** | pm |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **uat_done** | false |

## spec_read_ack

| Layer | Path / binding |
|-------|----------------|
| **srs** | `docs/hrm/SRS.md` · FR-HRM-SC-SHIFT-01 (D1 split) · attendance CFG Rules→Chung/Standard/App · matrix §2.2–2.4 |
| **tech_spec** | `docs/hrm/TECHSPEC.md` attendance module · ADR §3 route sketch |
| **db_design** | `public.attendance_rules` (Supabase `types.ts` parity) · `attendance_work_sites.company_id TEXT` + optional `address` |
| **api_design** | ADR D2–D3 · `GET/PATCH /attendance/rules` · CRUD `/attendance/work-sites` · `HRM-ATT-GEO-001` @ 400 |
| **change_mode** | ADD |
| **sponsor_confirm** | ADR Accepted `PO-MFD-M1-ATT-P0-CFG-SA-01` 2026-08-04 |

## completion_report

**Closed:**

- `AttendanceConfigService` — lazy default row on `GET /attendance/rules` (server defaults = FE `defaultRules`); `PATCH` partial update; `faceid_enabled` forced false on write (ADR D4).
- `GET/POST/PATCH/DELETE /attendance/work-sites` — TEXT slug persist via `resolveHrmPersistCompanyIdText`; list scope via `expandHrmTextCompanyIds` + `pushCompanyIdTextColumnFilter`; get-by-id parity `assertResourceInHrmScope`.
- Schema ensure: `attendance_rules` DDL; work-sites UUID→TEXT migration + pilot UUID→slug remap; **removed** `ensureDefaultWorkSite` HQ pilot insert (U65).
- `createRecord` geofence: slug-scoped site query; skip assert when `gps_enabled=false` (rules read).
- Jest: `attendance-config.service.spec.ts` (lazy rules, PATCH faceid, list sites); `attendance.service.spec.ts` (GEO-001 + gps off skip).

**Residual (FE / QA):**

- `useAttendanceRules` still in-memory until `PO-MFD-M1-ATT-P0-CFG-FE-01`.
- `gps_locations` on rules not written by BE (enforcement SoT = work-sites only).
- auto-checkout duration job GĐ2 (SPEC_GAP).
- API_CONTRACT_VN legacy geo alias doc bump optional.

## Verification

```bash
pnpm --filter hrm-api test -- attendance-config.service.spec.ts attendance.service.spec.ts
```

## API handoff (FE)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/attendance/rules?company_id=` | Returns `AttendanceRules` shape |
| PATCH | `/attendance/rules?company_id=` | Body `UpdateAttendanceRulesDto` fields |
| GET | `/attendance/work-sites?company_id=` | `{ total, data[] }` with `radius` + `radius_meters` |
| POST | `/attendance/work-sites` | `CreateWorkSiteDto` — maps FE `GPSLocation.radius` → `radius_meters` |
| PATCH | `/attendance/work-sites/:id?company_id=` | |
| DELETE | `/attendance/work-sites/:id?company_id=` | Hard delete (work-shifts pattern) |

Auth: same as other `/attendance/*` (Bearer + scope headers).

## next_owner

pm → **dev-fe** (`PO-MFD-M1-ATT-P0-CFG-FE-01`)

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M1-ATT-P0-CFG-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0

read_first:
- docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md D4
- apps/web/hrm/src/hooks/useAttendanceRules.ts
- docs/qa/evidence/po-mfd-m1-att-p0-cfg-be-01.md (API handoff table)

entry_criteria:
- hrm-api READY_FOR_QA; GET/PATCH /attendance/rules + work-sites CRUD live on :28001

exit_criteria:
- Wire fetchRules/saveRules to Nest /attendance/rules (company_id query = currentCompanyId)
- GPS admin: add/update/remove via /attendance/work-sites (not rules.gps_locations JSON)
- D4 stub banners on OT/leave/late/request subtabs — link Settings→Danh mục; faceid read-only false + banner
- Browser U65: Rules→Chung Lưu → F5 values match GET; GPS site → check-in inside/outside (QA matrix AT-14)
- ack_status: READY_FOR_QA

allowed_paths:
- apps/web/hrm/src/hooks/useAttendanceRules.ts
- apps/web/hrm/src/**/Attendance*.tsx rules/settings panels only

must_keep:
- work-shifts UI; TXN tabs; no catalog shifts dual CRUD

forbidden_paths:
- pnpm seed:*

evidence_path: docs/qa/evidence/po-mfd-m1-att-p0-cfg-fe-01.md
```
