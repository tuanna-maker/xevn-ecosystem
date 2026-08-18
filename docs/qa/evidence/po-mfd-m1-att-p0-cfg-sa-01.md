# Evidence — PO-MFD-M1-ATT-P0-CFG-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-P0-CFG-SA-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **adr_path** | `docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md` |
| **date** | 2026-08-04 |
| **uat_done** | false |

## completion_report

**Closed:** Published ADR locking (1) **work_shifts** operational SoT vs XBOS **`shifts`** REF-only GĐ1 + payroll coeff on shift row; (2) **`attendance_rules` dedicated table** (not `hrm_company_settings` JSON) with column map to `useAttendanceRules.ts` / Supabase types; (3) **geofence enforcement** on **`attendance_work_sites`** with **TEXT `company_id` slug**, deprecate rules JSON for enforcement, **`HRM-ATT-GEO-001` @ HTTP 400** + legacy alias note; (4) **GĐ2 / sidebar stub** redirect to Settings catalog until FR. Linked from DATA_CLASS_MATRIX §6.

**Residual:** `P0-2` FE Save wire, `P0-3` sheet columns, `P0-5` stub UX copy — execution not SA; auto-checkout **duration job** SPEC_GAP; API_CONTRACT_VN doc bump for geo code optional with dev-be; schedule roster / catalog one-way sync deferred.

**Sources read:** `HRM-ATTENDANCE_DATA_CLASS_MATRIX.md` §6; `po-mfd-m1-att-cfg-ref-01.md`; `useAttendanceRules.ts`; `attendance.service.ts` (work_sites DDL, assert, pilot insert); `supabase/types.ts` `attendance_rules`; `hrm-settings-master-keys.ts` (`shifts` family); `docs/hrm/SRS.md` FR-HRM-SC-SHIFT-01; `API_CONTRACT_VN.md` §4; `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` (slug plane). Did **not** duplicate `HRM-ATTENDANCE_ENTERPRISE_API_MAP.md` body.

## Decision summary (PM one-liner)

CFG persist = **`attendance_rules` table + work-sites API**; shifts = **`work_shifts` mutate** / **catalog `shifts` read**; geofence = **slug-scoped sites**; Attendance settings stubs = **pointer to Settings** until GĐ2 FR.

## next_owner

pm → **dev-be** (`PO-MFD-M1-ATT-P0-CFG-BE-01`)

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M1-ATT-P0-CFG-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P0

read_first (order):
- docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md (D1–D4 — binding)
- docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_DATA_CLASS_MATRIX.md §6 P0-1,P0-4,P0-6
- apps/web/hrm/src/hooks/useAttendanceRules.ts (AttendanceRules / AttendanceRulesInput)
- apps/api/hrm-api/src/attendance/attendance.service.ts (work_sites, assertWithinWorkSite, ensureDefaultWorkSite)
- docs/hrm/SRS.md FR-HRM-SC-SHIFT-01 (resolved by ADR D1)
- docs/brand-new-documents-20270801/API_CONTRACT_VN.md §4 (geo alias)

spec_read_ack (fill in evidence before code):
- srs: docs/hrm/SRS.md · FR-HRM-SC-SHIFT-01 · attendance CFG surfaces (matrix §2.2–2.4)
- tech_spec: docs/hrm/TECHSPEC.md attendance module pointers · TECH_SPEC_VN geofence executive line
- db_design: public.attendance_rules (Supabase types parity) · attendance_work_sites company_id TEXT migration
- api_design: ADR §3 route sketch · HRM-ATT-GEO-001 · GET/PATCH /attendance/rules · CRUD /attendance/work-sites
- change_mode: ADD
- sponsor_confirm: PO-MFD-M1-ATT-P0-CFG-SA-01 ADR Accepted 2026-08-04

entry_criteria:
- ADR Accepted; no conflicting SA HOLD on shifts dual SoT for GĐ1 ops path.

exit_criteria:
- GET/PATCH /attendance/rules scoped by resolveHrmListScope; lazy default row on first GET (server defaults match FE defaultRules semantics — no seed script).
- attendance_work_sites.company_id TEXT + migration; list/create/update/delete with scope parity; remove ensureDefaultWorkSite from normal bootstrap (U65).
- assertWithinWorkSite uses slug company_id; HRM-ATT-GEO-001 unchanged semantics; optional skip when gps_enabled=false after reading rules.
- jest: rules + work-sites scope + geo assert (extend attendance.service.spec.ts).
- ack_status: READY_FOR_QA

allowed_paths:
- apps/api/hrm-api/src/attendance/**
- apps/api/hrm-api/src/common/scope-context.ts (only if required for work-sites parity)
- packages/** (only if shared DTO — prefer local dto under attendance/)

forbidden_paths:
- apps/web/** (dev-fe wave)
- pnpm seed:* · ensureDefaultWorkSite pilot insert on UAT path
- Dual CRUD on XBOS catalog shifts from attendance module

must_keep:
- Existing /attendance/work-shifts CRUD (D1 operational SoT)
- Existing TXN endpoints (records, sheets, leave, OT) behavior unless geo/rules read required
- resolveHrmListScope / company_id TEXT slug invariant (ADR-GROUP-CEO-MAIN-HOLDING-SCOPE)
- HRM-ATT-GEO-001 code string for mobile/portal contract
- leave_l1_max_days in hrm_company_settings — do not move into attendance_rules

code_memory_required: true
code_memory_mode: APPEND
preserve_default: true
uat_done: false
cấm: seed rules/sites; apps/web in this work_item

evidence_path: docs/qa/evidence/po-mfd-m1-att-p0-cfg-be-01.md

After READY_FOR_QA — dispatch dev-fe PO-MFD-M1-ATT-P0-CFG-FE-01:
- Wire useAttendanceRules fetch/save to Nest; Rules subtabs Save; GPS admin → work-sites API; D4 stub banners «Cấu hình tại Settings→Danh mục»; faceid_enabled read-only false + banner.
- allowed_paths: apps/web/hrm/src/hooks/useAttendanceRules.ts · Attendance.tsx rules/settings panels only.
- must_keep: work-shifts UI; TXN tabs; no hardcoded catalog shifts CRUD.
```
