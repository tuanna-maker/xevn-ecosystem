# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QA-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QA-02` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-FE-01` **READY_FOR_QA** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` |
| **Stamp** | `ATTWSQA2-MSJCG47P` |
| **Retain** | QA-01 stamp **`ATTWSQA-MSJC3IN9`** · AC pack **NOT reopened** |
| **U65** | zero-seed · **browser** FE Network body · probe ≠ UF 🟢 (GEO-REQ optional L1 only) |
| **Honesty** | `attendance_uat_ready=false` · printable/personnel **false** · ATT-LEAVE GWC **SEAL RETAIN** · WAIVE/sign/**J-HRM-06c** **SEAL RETAIN** · SI · CTR · enrollment **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · DENY SITE-UNKNOWN invent · DENY module ATT UAT |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (4/4 spot · **R-PLT-ATT-WS-FE-CNS-05 CLOSED**) |
| **change_mode** | ADD · no `apps/**` · no seed · no ready flip |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-worksite-catalog-qa-02.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-worksite-catalog-qa-02-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-02/` |
| Vitest (FE parent) | `useAttendanceRecords.test.ts` **12 PASS** |

**spec_ref:** VAL-ATT-WS-CNS-05 · BR-PLT-ATT-WS-08 · FE-01 residual **R-PLT-ATT-WS-FE-CNS-05** · QC-01 Condition

**Seed:** none · **ensureDefault:** none · **QA-01 AC reopen:** **DENIED**.

---

## 2. Click path (U65 · HDSD · CNS-05 FE wire only)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | **Chấm công** → **Thiết lập** → **Quy định** → tab **Ứng dụng** → GPS card | `att-gps-sites-card` |
| 2 | Soft empty CTA | `att-gps-add-open` **visible** · no seed / no ensureDefault |
| 3 | Clock → method **GPS** · mock geo HCMC · pick emp | `clock-in-method-gps` · `clock-in-panel-gps` |
| 4 | Confirm check-in | Network **POST** `/api/hrm/attendance/records` body **`check_in_method":"gps"`** + `latitude`/`longitude` |
| 5 | Optional CNS-05 | Authenticated API omit coords + method=gps → **400** `HRM-ATT-GEO-REQ` (not silent 201) |
| 6 | Honesty | ready=false · seals RETAIN · C-SLICE · DENY SITE-UNKNOWN / ATT UAT |

**HDSD ids:** `clock-in-method-gps` · `clock-in-panel-gps` · `clock-in-gps-open-confirm` · `clock-in-gps-confirm-dialog` · `clock-in-gps-confirm-checkin` · `att-gps-add-open`

---

## 3. Spot AC table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **CNS-05-FE-WIRE** | POST body `check_in_method=gps` + lat/lon | method=`gps` · lat=`10.7769` · lon=`106.7009` · status **400** `HRM-ATT-GEO-001` (geofence OOS peer — **proves FE wire**) | 🟢 |
| **CNS-05-GEO-REQ-OPTIONAL** | omit coords + method=gps → 400 GEO-REQ | API **400** `HRM-ATT-GEO-REQ` · silent201=false | 🟢 |
| **SOFT-CTA-RETAIN** | `att-gps-add-open` wired · no seed | ctaWire=true · visible · noEnsureDefault | 🟢 |
| **HONESTY-SEALS** | ready=false · seals · C-SLICE · no QA-01 reopen | all locked | 🟢 |

**Note:** FE wire PASS does **not** require POST 201. Receiving **400 GEO-001** with full GPS body is sufficient proof that FE now sends `check_in_method=gps` + coords (closes residual that QA-01 saw as omit-method). QA-01 AC pack stamps **retained**.

---

## 4. Key network stamps

```text
POST /api/hrm/attendance/records (FE GPS confirm)
  body: check_in_method=gps · latitude=10.7769 · longitude=106.7009
  → 400 HRM-ATT-GEO-001  (geofence — FE wire proven)

POST /api/hrm/attendance/records (API omit coords + method=gps)
  → 400 HRM-ATT-GEO-REQ  (optional CNS-05 · not silent 201)
```

---

## 5. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`attendance_uat_ready`** | **`false`** — **DENIED** flip |
| printable / personnel | **false** — unchanged |
| ATT-LEAVE-CATALOG GWC | **SEAL RETAIN** |
| Leave WAIVE / sign / **J-HRM-06c** | **SEAL RETAIN** |
| SI type/insurer · CTR · enrollment | **SEAL RETAIN** |
| Module ATT UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| SITE-UNKNOWN invent FAIL | **DENIED** (HOLD) |
| Seed / ensureDefaultWorkSite | **none** |
| QA-01 stamp `ATTWSQA-MSJC3IN9` / AC pack | **RETAIN** — not reopened |

---

## 6. Defect / residual register

| ID | Severity | Summary | Status |
|----|----------|---------|--------|
| **R-PLT-ATT-WS-FE-CNS-05** | P2 | FE GPS POST now includes `check_in_method=gps` + lat/lon (browser Network) | **CLOSED** |

No new P0/P1. No SITE-UNKNOWN invent. No module ATT UAT claim.

---

## 7. completion_report

**Closed:** Spot CNS-05 FE wire only after FE-01. Stamp `ATTWSQA2-MSJCG47P`. Browser Clock-In GPS confirm → Network POST `/attendance/records` body has **`check_in_method=gps`** + **latitude/longitude** (response 400 `HRM-ATT-GEO-001` still proves wire). Soft CTA `att-gps-add-open` retained · zero-seed. Optional API omit coords → **400** `HRM-ATT-GEO-REQ` (not silent 201). **R-PLT-ATT-WS-FE-CNS-05 CLOSED**. QA-01 `ATTWSQA-MSJC3IN9` AC pack **RETAIN**. Honesty false · seals RETAIN · C-SLICE · DENY SITE-UNKNOWN · DENY module ATT UAT.

**Residual:** none for this Condition — QC should update Condition R-PLT-ATT-WS-FE-CNS-05 → **CLOSED**.

| Field | Value |
|-------|--------|
| **next_owner** | **qc** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-02.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QC-02
from_role: pm
to_role: qc
lane: governance
priority: P2
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QA-02 PASS_TO_PM stamp ATTWSQA2-MSJCG47P
note: Close QC-01 Condition R-PLT-ATT-WS-FE-CNS-05 only — do NOT reopen QA-01 AC pack ATTWSQA-MSJC3IN9

## entry_criteria
- Read QA-02: docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-02.md
- Machine: docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-worksite-catalog-qa-02-browser.json
- Prior QC-01 GWC: docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qc-01.md
- Honesty: attendance_uat_ready=false LOCKED · C-SLICE-≠-MODULE
- RETAIN: ATT-LEAVE · WAIVE/sign/J-06c · SI · CTR · soft empty CTA · QA-01 AC stamps

## task
1) Audit CNS-05 FE wire stamps: POST body check_in_method=gps + lat/lon (CNS-05-FE-WIRE PASS)
2) Confirm optional GEO-REQ 400 (not silent 201)
3) Update Condition R-PLT-ATT-WS-FE-CNS-05 → CLOSED
4) Seal GWC residual update only — DENY flip attendance_uat_ready · DENY module ATT UAT · DENY SITE-UNKNOWN invent · DENY reopen QA-01 AC pack

## cấm
seed · flip attendance_uat_ready · reopen ATT-LEAVE · invent SITE-UNKNOWN · claim module ATT UAT · reopen QA-01 AC stamps

## evidence_path
docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qc-02.md

## exit
PASS_TO_PM · completion_report · next_dispatch_prompt · ack_status
```
