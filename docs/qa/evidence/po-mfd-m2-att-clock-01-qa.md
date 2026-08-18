# PO-MFD-M2-ATT-CLOCK-01 — QA (U65 clock hub fidelity)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-CLOCK-01` |
| **from_role** | qa · **to_role** | pm |
| **priority** | P0 |
| **u65** | zero-seed · browser-only |
| **u76_hdsd_align** | true |
| **u87_menu_fidelity** | true |
| **date** | 2026-08-04 · **commit** | `dc930c5` |
| **ack_status** | **FAIL** |
| **uat_done** | **false** — do **not** claim Attendance CLOSED |

## L0 / FE↔BE

| Check | Result |
|-------|--------|
| `pnpm run qc:fe-be-health` (entry) | **ALL PASS** · hrm `:28001` · xbos `:28002` · portal `:5173` |
| `pnpm run qc:fe-be-health` (exit) | **ALL PASS** |
| Seed | **none** |

**Persona:** `uat.nv0007@xe.vn` / `xevn-uat-2026` · JWT OU `trsport` · `employee_id=b06422c0-…`  
**URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport`  
**HDSD path:** Chấm công → **Chấm công vào/ra** (`data-testid=attendance-tab-clock-in`) → Clock-In wizard methods

**Do not reopen:** OT create→approve QC GWC · SHIFTS-02 GWC · SHEETS-01 (other seats).

---

## 1. HDSD inventory (clock hub)

| # | menu_path | testid / UI | Present | Classification |
|---|-----------|-------------|---------|----------------|
| **6** | Chấm công → Vào/ra (Clock-In hub) | `clock-in-wizard` + `clock-in-method-selector` | Yes | **LIVE** |
| **7** | Clock-In → Thủ công | `clock-in-method-manual` · `clock-in-panel-manual` · CheckInOutWidget | Yes | **LIVE** (mutate) |
| **8** | Clock-In → QR / Mã QR | `clock-in-method-qrcode` · `clock-in-panel-qrcode` | Yes | **PARTIAL** (shell; camera mutate not exercised) |
| **9** | Clock-In → Face ID | `clock-in-method-faceid` · `att-faceid-hold-banner` | Yes | **GĐ2-HOLD** (not LIVE) |
| **10** | Clock-In → GPS | `clock-in-method-gps` · `clock-in-panel-gps` · coords UI | Yes | **PARTIAL** — GEO silent bypass |

---

## 2. Browser matrix (U65)

| # | AC | Evidence | Verdict |
|---|-----|----------|---------|
| 1 | Open clock hub HDSD | Wizard + 4 methods (manual/qr/face/gps) | 🟢 |
| 2 | Manual check-in CTA LIVE → mutate | Select **UAT-0201** → Check-in → confirm → `POST /api/hrm/attendance/records` **201** `HRM-ATT-201` · FE shows Check-in `06:16` · **F5** still shows time | 🟢 |
| 3 | Face = HOLD | Banner `att-faceid-hold-banner` · **0** POST records | 🟢 (honest HOLD) |
| 4 | QR shell | Panel + scanner copy · mutate **not** claimed | 🟡 PARTIAL / P1 |
| 5 | GPS geofence honest 422/`HRM-ATT-GEO-001` or success | Mock geo **10,10** shown in UI · FE `createAttendanceRecord` **omits** `latitude`/`longitude` · GEO path **never** called · no `HRM-ATT-GEO-001` | 🔴 **FAIL** |
| 6 | No Face LIVE / no UAT DONE | Face stamped GĐ2-HOLD · `uat_done=false` | 🟢 process |

### Network (manual mutate — SoT)

```
POST /api/hrm/attendance/records → 201 HRM-ATT-201
bodyKeys: company_id, employee_id, attendance_date, check_in_at, status, created_by
hasLatLon: false
x-company-id: main   (query company_id=trsport — OBS header)
```

### GPS gap (code + runtime)

| Layer | Finding |
|-------|---------|
| FE UI | GPS panel LIVE — lat/lon **10.000000 / 10.000000** displayed (Playwright geolocation mock) |
| FE API | `useAttendanceRecords.checkIn` → `createAttendanceRecord` payload **no** lat/lon fields (`hrmApi.ts`) |
| FE GPS | `GPSAttendance` only puts coords into `check_in_location` **string** |
| BE | `assertWithinWorkSite` / `HRM-ATT-GEO-001` only when `payload.latitude && payload.longitude` |
| Runtime | **Silent GEO bypass** — outside coords cannot produce 422/GEO-001 from clock GPS path |

GPS-first follow-up (`_tmp-po-mfd-m2-att-clock-01-gps-only.json`): UI coords confirmed; no POST with lat/lon observed.

### FE after 2xx + F5 (manual)

- Before F5: Check-in time visible · status badge (OBS: raw key `status.present`)
- After F5: re-open manual · re-select UAT-0201 · Check-in **06:16** still present · Check-out `--:--`

### Console (non-blocker)

- Face model noise out of scope when on Face tab only; Face hold still 0 POST.
- No `Uncaught` on clock hub open.

---

## 3. Matrix runtime stamp (this seat)

| Matrix # | Prior | After CLOCK-01 | Note |
|---------:|-------|----------------|------|
| 6 | LIVE | **LIVE** | Hub + selector confirmed U65 NV |
| 7 | PARTIAL | **LIVE** | Manual POST 201 + F5 |
| 8 | PARTIAL | **PARTIAL** | Shell only; P1-10 QR depth |
| 9 | PARTIAL / GĐ2-HOLD | **GĐ2-HOLD** | Banner; not LIVE |
| 10 | PARTIAL | **PARTIAL** | UI LIVE · GEO wire **FAIL** residual |

---

## 4. Screenshots / machine JSON

| Artifact | Path |
|----------|------|
| Evidence | `docs/qa/evidence/po-mfd-m2-att-clock-01-qa.md` |
| Browser JSON | `docs/qa/evidence/_tmp-po-mfd-m2-att-clock-01-browser.json` |
| GPS-only JSON | `docs/qa/evidence/_tmp-po-mfd-m2-att-clock-01-gps-only.json` |
| Screens | `docs/qa/evidence/screens/po-mfd-m2-att-clock-01/*.png` |
| Repro | `node scripts/qa/_tmp-po-mfd-m2-att-clock-01-qa.mjs` |

---

## Residual

| ID | Owner | Sev | Note |
|----|-------|-----|------|
| **R-MFD-M2-CLOCK-GPS-LATLON** | **dev-fe** (+ be contract if DTO unused) | **P0** | Wire `latitude`/`longitude` from `GPSAttendance` through `checkIn` → `createAttendanceRecord` so BE can return **400/422 `HRM-ATT-GEO-001`** when outside work site; no silent 201 without coords when GPS method used |
| **R-MFD-M2-CLOCK-QR-DEPTH** | ba-process → P1-10 | P1 | QR mutate depth UNMAPPED — shell PARTIAL OK this seat |
| **R-MFD-M2-CLOCK-HDR-MAIN** | obs | P3 | NV `trsport` session sends `x-company-id: main` on records POST while body/query use OU — document; not this seat’s block if 201 OK |
| **R-MFD-M2-CLOCK-I18N-STATUS** | obs | P3 | FE shows raw `status.present` after check-in |

---

## completion_report

- **Closed (proven):** Clock hub LIVE (#6); manual check-in LIVE (#7) with **201 HRM-ATT-201 + F5**; Face honest **GĐ2-HOLD** (#9); QR/GPS shells inventoried; L0 PASS entry+exit; U65 no seed.
- **Open / FAIL:** GPS geofence fidelity (#10) — UI shows mock outside coords but POST omits lat/lon → **no honest GEO-001** (AC4). QR mutate depth deferred P1.
- **Not claimed:** Face LIVE · Attendance menu CLOSED · UAT DONE · SHEETS/OT reopen.

## next_owner

**dev-fe**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-CLOCK-GPS-LATLON-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
u65_zero_seed: true

## Context
QA FAIL PO-MFD-M2-ATT-CLOCK-01 — evidence docs/qa/evidence/po-mfd-m2-att-clock-01-qa.md
Manual clock LIVE (POST 201 HRM-ATT-201 + F5). Face GĐ2-HOLD OK.
GPS panel shows lat/lon but createAttendanceRecord omits latitude/longitude → BE assertWithinWorkSite / HRM-ATT-GEO-001 never fires (silent GEO bypass).

## Entry
Read: apps/web/hrm/src/components/attendance/GPSAttendance.tsx
      apps/web/hrm/src/hooks/useAttendanceRecords.ts (checkIn)
      apps/web/hrm/src/integrations/hrmApi.ts (createAttendanceRecord)
      apps/api/hrm-api/src/attendance/attendance.service.ts (assertWithinWorkSite · HRM-ATT-GEO-001)
spec_ref: HRM-AT-01 · SRS_VN geofence · matrix surfaces #10
change_mode: FIX
must_keep: Face GĐ2-HOLD · manual check-in path · U65 no seed · do not claim Face LIVE

## Exit
1. GPS check-in POST includes latitude+longitude when method=gps
2. Outside work site → honest 4xx HRM-ATT-GEO-001 (or 422 per contract) + FE error toast (no silent 201)
3. Inside site or gps_enabled=false → 2xx still works
4. Unit/jest or vitest coverage for payload lat/lon
5. evidence_path: docs/qa/evidence/po-mfd-m2-att-clock-gps-latlon-01.md
6. READY_FOR_QA — retest PO-MFD-M2-ATT-CLOCK-01 GPS AC only

## Forbidden
seed · Face LIVE claim · Attendance CLOSED · touch SHEETS/OT waves
```

## ack_status

**FAIL**
