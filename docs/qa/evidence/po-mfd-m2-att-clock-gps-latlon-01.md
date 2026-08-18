# PO-MFD-M2-ATT-CLOCK-GPS-LATLON-01 — Dev-FE evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-CLOCK-GPS-LATLON-01` |
| **from_role** | dev-fe · **to_role** | qa |
| **change_mode** | FIX |
| **priority** | P0 |
| **u65** | zero-seed |
| **date** | 2026-08-04 |
| **ack_status** | **READY_FOR_QA** |
| **residual_closed** | R-MFD-M2-CLOCK-GPS-LATLON (FE wire) |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/qa/professional/by-uc/HRM-AT-01.md` · POST `/api/hrm/attendance/records` · GPS/geofence matrix #10 (`HRM-ATTENDANCE_FIDELITY_MATRIX.md`) · `SRS_VN` geofence intent |
| **tech_spec** | `docs/hrm/TECHSPEC.md` attendance records create · Nest `CreateAttendanceRecordDto` `latitude?` / `longitude?` |
| **qa_fail** | `docs/qa/evidence/po-mfd-m2-att-clock-01-qa.md` — UI coords 10,10 · POST omit lat/lon · silent 201 |
| **be_contract** | `attendance.service.ts` `createRecord` → `assertWithinWorkSite` only when `payload.latitude != null && payload.longitude != null` · code `HRM-ATT-GEO-001` · HTTP 400 |
| **db_design** | N/A this FIX (DTO fields already on BE; no schema change) |
| **api_design** | POST body optional `latitude`/`longitude` numbers — mục đích: kích hoạt geofence; bước SRS check-in GPS |
| **sponsor_confirm** | PM dispatch residual R-MFD-M2-CLOCK-GPS-LATLON · 2026-08-04 |
| **uc_ids** | HRM-AT-01 |
| **change_mode** | FIX |

## Root cause

| Layer | Before |
|-------|--------|
| `GPSAttendance` | Put coords only into `check_in_location` **string** |
| `useAttendanceRecords.checkIn` | `createAttendanceRecord` without lat/lon |
| BE | Skipped `assertWithinWorkSite` → **201** even for outside mock (10,10) |

## Fix (files)

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/attendance/GPSAttendance.tsx` | Pass `latitude`/`longitude` from `gpsLocation` into `checkIn`; keep dialog open on API fail |
| `apps/web/hrm/src/hooks/useAttendanceRecords.ts` | `CheckInData` + `buildAttendanceCheckInApiPayload` forwards finite lat/lon |
| `apps/web/hrm/src/integrations/hrmApi.ts` | `createAttendanceRecord` payload type includes optional lat/lon + CODE-MEMORY |
| `apps/web/hrm/src/hooks/useAttendanceRecords.test.ts` | Vitest: GPS includes coords; manual omits |

**must_keep verified in scope:** Face GĐ2-HOLD untouched · Manual CheckInOutWidget still omits coords · No Attendance shell rewrite · No leave/OT/SHEETS · U65 no seed.

## Verify plan (QA — GPS AC only)

**work_item retest:** `PO-MFD-M2-ATT-CLOCK-01-R2` (GPS AC only)

1. Persona NV e.g. `uat.nv0007@xe.vn` · Attendance → Clock-In → **GPS**.
2. Mock geolocation outside site (e.g. **10,10**).
3. Select employee → confirm check-in.
4. **Network:** `POST /api/hrm/attendance/records` body **must** include `latitude` + `longitude` (`hasLatLon: true`).
5. **Expect when gps geofence ON + ≥1 active work site:** **4xx** `HRM-ATT-GEO-001` + FE error toast · **no** silent 201.
6. **BE note if site empty or gps_enabled=false:** Nest skips assert (`assertWithinWorkSite` early-return when no sites; create path only asserts when `isGpsGeofenceEnabled`) → may still **201** even with lat/lon — document as CFG, not FE omit bug.
7. Manual check-in path: still **201** without lat/lon (regression must_keep).

## Unit evidence

```text
cd apps/web/hrm && pnpm exec vitest run src/hooks/useAttendanceRecords.test.ts
# ✓ 4 passed (page_size + 3 lat/lon cases) · 2026-08-04
```

## Residual / not claimed

| Item | Status |
|------|--------|
| Face LIVE | **not claimed** (GĐ2-HOLD) |
| QR mutate depth | P1 unchanged |
| Attendance CLOSED / uat_done | **false** |
| Checkout GEO on status PATCH | Out of scope — GEO assert is create-record only |

## completion_report

- **Closed:** FE GPS check-in POST wires numeric `latitude`/`longitude`; manual path omits; dialog stays open on GEO fail; CODE-MEMORY APPEND; vitest coverage.
- **Open for QA:** Browser assert Network hasLatLon + GEO-001 (or document empty-site CFG).
- **next_owner:** qa

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-CLOCK-01-R2
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true
u76_hdsd_align: true

## Context
Dev-FE READY_FOR_QA PO-MFD-M2-ATT-CLOCK-GPS-LATLON-01
evidence: docs/qa/evidence/po-mfd-m2-att-clock-gps-latlon-01.md
Prior FAIL: docs/qa/evidence/po-mfd-m2-att-clock-01-qa.md (GPS omit lat/lon)

## Scope (GPS AC only — do not reopen OT/SHEETS/Face LIVE)
1. Clock-In → GPS · mock geo outside (e.g. 10,10)
2. POST /api/hrm/attendance/records bodyKeys include latitude+longitude
3. When gps_enabled + work site exists → expect 4xx HRM-ATT-GEO-001 + FE toast (no silent 201)
4. If sites empty / gps off → document BE skip (not FE omit)
5. Spot: Manual check-in still 201 without lat/lon (must_keep)
6. Face still GĐ2-HOLD · 0 Face POST

## Exit
Update matrix #10 stamp; evidence docs/qa/evidence/po-mfd-m2-att-clock-01-r2-qa.md
ack_status PASS_TO_PM or FAIL with residual
```

## ack_status

**READY_FOR_QA**
