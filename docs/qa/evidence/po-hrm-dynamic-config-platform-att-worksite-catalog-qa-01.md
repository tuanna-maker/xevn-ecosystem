# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BE-01` **READY_FOR_QA** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` |
| **Stamp** | `ATTWSQA-MSJC3IN9` |
| **U65** | zero-seed · **browser** FE click + Network · probe ≠ 🟢 UF (CNS-05 API = optional L1 only) |
| **Honesty** | `attendance_uat_ready=false` · printable/personnel **false** · ATT-LEAVE GWC **SEAL RETAIN** · WAIVE/sign/**J-HRM-06c** **SEAL RETAIN** · SI type/insurer · CTR · enrollment **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · DENY module ATT UAT |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (core 6/6 + CNS-05 optional PASS · SITE-UNKNOWN HOLD · J-MOB-02 OOS) |
| **change_mode** | ADD · no `apps/**` invent · no seed · no ready flip |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01/` |

**spec_ref:** BA-01 AC-PLT-ATT-WORKSITE-01* · VAL-ATT-WS-CNS-01..05 · BE-01 deepen soft-retire / list active / GEO-REQ

**Seed:** none · **ensureDefault:** none.

---

## 2. Click path (U65 · HDSD inventory)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | **Chấm công** → **Thiết lập** → **Quy định chấm công** → tab **Ứng dụng** | `hdsd-att-rules-tab-app` · `att-gps-sites-card` |
| 2 | CREATE Nest site `QA-WS-msjc3in9` (lat/lng HCMC · r=150) → **Lưu** | Network **POST** `/api/hrm/attendance/work-sites` → **201** `HRM-ATT-SITE-201` id=`d7e0de24-…` |
| 3 | List row + **F5** → tab lại → row còn | 🟢 Nest SoT (not `gps_locations` JSON alone) |
| 4 | Clock → method **GPS** · mock OOS (10,10) · pick emp without today conflict | `clock-in-method-gps` · `clock-in-panel-gps` |
| 5 | Confirm check-in OOS | POST `/attendance/records` → **400** `HRM-ATT-GEO-001` · hasLatLon=true · no persist |
| 6 | GPS inside site radius · pick emp | POST → **201** `HRM-ATT-201` · hasLatLon=true · F5 sites SoT Nest |
| 7 | Soft-retire (UI Xóa / DELETE) | DELETE → **200** · hidden FE + F5 · default list no row · `include_inactive` shows `active=false` |
| 8 | Empty active | activeRemain=1 peer — empty **not forced** (U65 no wipe) · CTA `att-gps-add-open` wire · no seed |
| 9 | Optional CNS-05 | Authenticated API `check_in_method=gps` omit coords → **400** `HRM-ATT-GEO-REQ` · FE omit method = P2 residual |
| 10 | SITE-UNKNOWN / J-MOB-02 | **HOLD** / **OOS** — cấm invent FAIL |
| 11 | Honesty | ready=false · seals retain · C-SLICE |

**HDSD ids:** `hdsd-att-rules-tab-app` · `att-gps-sites-card` · `att-gps-add-open` · `att-gps-add-dialog` · `att-gps-add-submit` · `att-gps-row-*` · `att-gps-remove-*` · `clock-in-method-gps` · `clock-in-panel-gps` · `clock-in-gps-open-confirm` · `clock-in-gps-confirm-dialog` · `clock-in-gps-confirm-checkin`

---

## 3. AC stamp table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **AC-PLT-ATT-WORKSITE-01d** | Admin CREATE N+1 · 201 · list · F5 | POST **201** · row · F5 · id=`d7e0de24-…` | 🟢 |
| **AC-PLT-ATT-WORKSITE-01** | GPS inside · lat/lon · 2xx · Nest SoT F5 | POST **201** `HRM-ATT-201` hasLatLon · nest F5 | 🟢 |
| **AC-PLT-ATT-WORKSITE-01b** | OOS → 4xx `HRM-ATT-GEO-001` · no persist | **400** `HRM-ATT-GEO-001` lat=10,lon=10 | 🟢 |
| **AC-PLT-ATT-WORKSITE-01c** | Empty skip / CTA / no seed | activeRemain=1 — empty not forced · CTA wire · no seed · 01d proven | 🟢 |
| **VAL-ATT-WS-CNS-04** | Soft-retire hide default/geofence | DELETE **200** · hidden FE/F5 · defaultHas=false · inactiveView=true | 🟢 |
| **VAL-ATT-WS-CNS-05** | gps method omit → `HRM-ATT-GEO-REQ` | API **400** `HRM-ATT-GEO-REQ` (optional) · FE method omit residual P2 | 🟢 |
| **VAL-ATT-WS-CNS-02** | SITE-UNKNOWN | **HOLD** GĐ1.5 — no invent FAIL | HOLD |
| **J-MOB-02** | Mobile spot | **OOS** this portal wave | OOS |
| **AC-PLT-ATT-WORKSITE-01H** | Honesty / seals | ready=false · seals RETAIN · C-SLICE · DENY ATT UAT | 🟢 |

**OBS (01c):** Empty active branch not exercised live because wiping peer Nest sites would risk seals; CTA + admin CREATE proven by **01d**; no `ensureDefault` / seed observed.

---

## 4. Key network stamps

```text
POST   /api/hrm/attendance/work-sites                         → 201  HRM-ATT-SITE-201  QA-WS-msjc3in9
POST   /api/hrm/attendance/records (OOS 10,10)                → 400  HRM-ATT-GEO-001
POST   /api/hrm/attendance/records (inside HCMC)              → 201  HRM-ATT-201  hasLatLon
DELETE /api/hrm/attendance/work-sites/{id}?company_id=main    → 200  soft-retire
GET    /api/hrm/attendance/work-sites?company_id=main         → active-only (retired hidden)
GET    ...&include_inactive=true                              → retired active=false visible
POST   /api/hrm/attendance/records check_in_method=gps omit   → 400  HRM-ATT-GEO-REQ  (CNS-05 L1)
```

---

## 5. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`attendance_uat_ready`** | **`false`** — **DENIED** flip |
| printable / personnel | **false** — unchanged |
| ATT-LEAVE-CATALOG GWC | **SEAL RETAIN** |
| Leave WAIVE / sign / **J-HRM-06c** | **SEAL RETAIN** |
| SI type/insurer L1 · CTR · enrollment | **SEAL RETAIN** |
| Module ATT UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed / ensureDefaultWorkSite | **none** |
| SITE-UNKNOWN invent FAIL | **DENIED** (HOLD) |

---

## 6. Defect / residual register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **R-PLT-ATT-WS-FE-CNS-05** | P2 | FE `buildAttendanceCheckInApiPayload` omits `check_in_method=gps` — CNS-05 only proven via API probe; BE GEO-REQ OK | **dev-fe** (optional) |

No P0/P1 blocker for this slice.

---

## 7. completion_report

**Closed:** U65 browser AC pack for ATT work-sites catalog Option B — **PASS**. Stamp `ATTWSQA-MSJC3IN9`. Admin Settings GPS open CREATE Nest site POST 201 + F5 (**01d**). GPS clock invent OOS → 400 `HRM-ATT-GEO-001` with lat/lon (**01b**). GPS inside radius → 201 + Nest SoT F5 (**01**). Soft-retire DELETE 200 → hidden default list + inactive audit (**CNS-04**). Empty not forced / CTA + no seed (**01c**). Optional CNS-05 BE `HRM-ATT-GEO-REQ` stamped; FE method wire residual P2. SITE-UNKNOWN **HOLD**. J-MOB-02 **OOS**. Honesty false · seals retain · C-SLICE · zero-seed.

**Residual:** R-PLT-ATT-WS-FE-CNS-05 P2 optional FE — not blocking slice QC.

**Forbidden claims:** module ATT UAT · Phase1 DONE · flip `attendance_uat_ready` · reopen ATT-LEAVE / WAIVE / J-06c · reopen SI/CTR seals · invent SITE-UNKNOWN FAIL.

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §7 |
| **next_owner** | **qc** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QA-01 PASS_TO_PM stamp ATTWSQA-MSJC3IN9

## entry_criteria
- Read QA: docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01.md
- Read BE: docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-be-01.md
- Read BA: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md
- Machine JSON: docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01-browser.json

## task
Narrow slice GWC only (C-SLICE-≠-MODULE):
1) Audit U65 browser stamps AC-PLT-ATT-WORKSITE-01/01b/01c/01d/01H + CNS-04 soft-retire + optional CNS-05 GEO-REQ
2) Confirm SITE-UNKNOWN HOLD · J-MOB-02 OOS · no invent FAIL
3) Honesty: attendance_uat_ready=false · printable/personnel false LOCKED
4) RETAIN seals: ATT-LEAVE GWC · WAIVE/sign/J-06c · SI type/insurer · CTR · enrollment
5) Residual R-PLT-ATT-WS-FE-CNS-05 P2 optional — do NOT block GWC unless QC policy requires FE wire
6) DENY module ATT UAT / Phase1 DONE / flip ready / reopen ATT-LEAVE

## exit
GO WITH CONDITIONS or GO · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qc-01.md · next_dispatch_prompt · completion_report · ack_status PASS_TO_PM
```
