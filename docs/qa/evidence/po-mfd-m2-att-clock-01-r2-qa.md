# PO-MFD-M2-ATT-CLOCK-01-R2 — QA (GPS AC retest)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-CLOCK-01-R2` |
| **from_role** | qa · **to_role** | pm |
| **priority** | P0 |
| **u65** | zero-seed · browser-only |
| **u76_hdsd_align** | true |
| **u87_menu_fidelity** | true |
| **date** | 2026-08-04 · **commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | **false** — do **not** claim Attendance CLOSED |
| **prior_fail** | `docs/qa/evidence/po-mfd-m2-att-clock-01-qa.md` (POST omit lat/lon) |
| **dev_fe_ready** | `docs/qa/evidence/po-mfd-m2-att-clock-gps-latlon-01.md` |

## L0 / FE↔BE

| Check | Result |
|-------|--------|
| `pnpm run qc:fe-be-health` (entry) | **ALL PASS** |
| `pnpm run qc:fe-be-health` (exit) | **ALL PASS** |
| Seed | **none** |

**Persona:** `uat.nv0007@xe.vn` / `xevn-uat-2026` · JWT OU `trsport`  
**URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport`  
**HDSD path:** Chấm công → **Chấm công vào/ra** → Clock-In → **GPS**

**Do not reopen:** SHEETS / OT / NT CLOSED slices · Face LIVE claim.

---

## CFG probe (honest skip)

| Field | Value |
|-------|--------|
| `GET /attendance/rules` | **200** · `gps_enabled=true` |
| `GET /attendance/work-sites` | **200** · **sitesTotal=0** · **sitesActive=0** |
| Expect mode | **`BE_SKIP_EMPTY_SITES`** |

Nest `assertWithinWorkSite` early-returns when no active sites → **201 with lat/lon is expected**, not silent FE omit.  
**GEO-001 reject path not exercised this seat** (needs ≥1 active work site under OU) — residual **OBS CFG**, not FE FAIL.

---

## Browser matrix (GPS AC + spots)

| # | AC | Evidence | Verdict |
|---|-----|----------|---------|
| 1 | Clock-In → GPS · mock geo **10,10** | Panel shows Vĩ độ/Kinh độ `10.000000°` · accuracy 12m | 🟢 |
| 2 | POST includes latitude+longitude | `POST /api/hrm/attendance/records` **201** `HRM-ATT-201` · `hasLatLon=true` · `latitude=10` · `longitude=10` · bodyKeys include both | 🟢 |
| 3 | gps ON + ≥1 site → 4xx `HRM-ATT-GEO-001` + toast | **N/A** — `sitesActive=0` → BE skip | ⚪ CFG |
| 4 | empty sites / gps off → document BE skip | Documented above · **201** with lat/lon · **not** invent FE FAIL | 🟢 |
| 5 | Manual still 201 without lat/lon | `POST` **201** `HRM-ATT-201` · `hasLatLon=false` · emp `VTH-0002` | 🟢 |
| 6 | Face still GĐ2-HOLD | `att-faceid-hold-banner` present · **0** Face POST before GPS | 🟢 |

### Network (GPS mutate — SoT)

```
POST /api/hrm/attendance/records → 201 HRM-ATT-201
employee_id: b06422c0-… (VTH-0007 Phan Văn An)
bodyKeys: company_id, employee_id, attendance_date, check_in_at, status, created_by, latitude, longitude
hasLatLon: true
latitude: 10
longitude: 10
x-company-id: main   (OBS header; body company_id=trsport)
```

### Network (Manual spot — must_keep)

```
POST /api/hrm/attendance/records → 201 HRM-ATT-201
employee_id: 293b5900-… (VTH-0002 Trần Văn An)
bodyKeys: company_id, employee_id, attendance_date, check_in_at, status, created_by
hasLatLon: false
```

### FE after GPS 2xx

- Dialog confirm clicked `gpsAttendance.checkIn` (OBS raw i18n key on CTA)
- Record created for VTH-0007 · no silent omit of coords
- Mock outside (10,10) did **not** produce GEO-001 because **0 work sites** (CFG)

### Console (non-blocker)

- Face model noise (`<!DOCTYPE` JSON parse) while Face HOLD — expected GĐ2 path · **0** Face attendance POST

---

## Matrix runtime stamp (this seat)

| Matrix # | Prior (CLOCK-01) | After R2 | Note |
|---------:|------------------|----------|------|
| 7 | LIVE | **LIVE** (spot reconfirmed) | Manual omit lat/lon kept |
| 9 | GĐ2-HOLD | **GĐ2-HOLD** | Banner · 0 Face POST |
| 10 | PARTIAL (GEO wire FAIL) | **LIVE** | FE lat/lon wire CLOSED · GEO-001 CFG-gated (0 sites) |

**R-MFD-M2-CLOCK-GPS-LATLON** → **CLOSED** (browser Network `hasLatLon=true`).

---

## Artifacts

| Artifact | Path |
|----------|------|
| Evidence | `docs/qa/evidence/po-mfd-m2-att-clock-01-r2-qa.md` |
| Browser JSON | `docs/qa/evidence/_tmp-po-mfd-m2-att-clock-01-r2-browser.json` |
| Screens | `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/*.png` |
| Repro | `node scripts/qa/_tmp-po-mfd-m2-att-clock-01-r2-qa.mjs` |

---

## Residual

| ID | Owner | Sev | Note |
|----|-------|-----|------|
| **R-MFD-M2-CLOCK-GEO001-CFG** | pm → cfg/ops or ceo CFG wave (not FE) | **P2 OBS** | `trsport` has `gps_enabled=true` but **0** active work sites → cannot prove `HRM-ATT-GEO-001` reject until ≥1 site exists (U65: create site from FE CFG seat, not seed) |
| **R-MFD-M2-CLOCK-I18N-GPS-CTA** | obs | P3 | Dialog CTA shows raw `gpsAttendance.checkIn` |
| **R-MFD-M2-CLOCK-HDR-MAIN** | obs | P3 | NV session still sends `x-company-id: main` on records POST |
| QR depth / Face LIVE / Attendance CLOSED | — | — | **not claimed** |

---

## completion_report

- **Closed:** R1 residual **R-MFD-M2-CLOCK-GPS-LATLON** — GPS Clock-In POST now includes numeric `latitude`/`longitude` (10/10); Manual must_keep omit coords + 201; Face GĐ2-HOLD; matrix **#10 LIVE**; L0 PASS entry+exit; U65 no seed.
- **Documented CFG:** empty work sites → BE skips geofence → **201** with lat/lon is correct (not FE silent bypass).
- **Open OBS:** GEO-001 end-to-end reject needs CFG work site (P2); i18n raw key on GPS confirm CTA.
- **Not claimed:** Attendance menu CLOSED · `uat_done` · Face LIVE · SHEETS/OT/NT reopen.

## next_owner

**qc**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-CLOCK-01-R2-QC
from_role: pm
to_role: qc
lane: governance
priority: P0
u65_zero_seed: true

## Context
QA PASS_TO_PM PO-MFD-M2-ATT-CLOCK-01-R2
evidence: docs/qa/evidence/po-mfd-m2-att-clock-01-r2-qa.md
Prior FAIL lat/lon omit CLOSED by Dev-FE + browser retest.
Matrix #10 stamp LIVE (FE wire); GEO-001 reject N/A — trsport sitesActive=0 (CFG OBS).

## Gate
1. Audit Network hasLatLon=true on GPS POST 201 HRM-ATT-201
2. Confirm Manual hasLatLon=false still 201 (must_keep)
3. Face remains GĐ2-HOLD — do not promote Face LIVE
4. Accept CFG note: GEO-001 not proven without work sites (condition/OBS — not NO-GO on FE wire)
5. uat_done false · Attendance NOT CLOSED
6. Verdict GO / GO WITH CONDITIONS / NO-GO
7. evidence_path: docs/qa/evidence/po-mfd-m2-att-clock-01-r2-qc.md

## Forbidden
seed · claim Attendance CLOSED · reopen SHEETS/OT/NT · invent GEO-001 FAIL on empty sites
```

## ack_status

**PASS_TO_PM**
