# Evidence — PO-HRM-MVP-GD1-ATT-03B-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03B-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-31 · UC-BP-ATT-03b) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `ATT03BQA1-MSM0524Y` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **uc_ids** | `UC-BP-ATT-03b` · `FR-UC-BP-ATT-03b` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `attendance_uat_ready=false` · residual alone ≠ ATT-03b DONE · thin ≠ ATT-03b DONE · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ ATT module UAT · CFG≠ATT-02 · printable false · PAY OUT · Nest `/core` DENY · R-ATT-01-ASSIGN **open** · DENY `att_leave_hold` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | FE-02 READY · BE-01 READY · FE-01 · BA J-HRM-ATT-03B-01..06 · API-01 RETAIN · must_keep ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-03b-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-03b-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-03b-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** claim residual alone=ATT-03b DONE · **DENY** catalog/LIVE/AGG DONE · **DENY** ATT module UAT · **DENY** invent PAY/printable · **DENY** invent ASSIGN / `att_leave_hold` · **DENY** honesty flip · **DENY** seed |
| **L0** | hrm **200** · xbos **200** · portal `:5173` **200** · Nest `/core/att/holiday-calendars/:year` **404** |
| **L2.5 J-*** | **J-01 PASS** · **J-02 PASS** · **J-03 PASS** · **J-04 PASS** · **J-05 PASS** · **J-06 PASS** |
| **Nest `/core` holiday** | probe **404** · Network SoT non-404 **= 0** |
| **Seed** | **none** (U65) · year **2096** CRUD via FE Lưu only · year **2030** ABSENT for HOL-MISS |

**Explicit ≠ DONE:** residual FE/BE bind **≠** ATT-03b / FR-03b module DONE · thin year **≠** ATT-03b DONE · **≠** ATT module UAT · printable **false** · PAY **OUT** · **C-SLICE**.

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | `PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md` J-HRM-ATT-03B-01..06 · AC-ATT-03B-* · O1–O12 |
| API-01 | F-ATT-HOL-01 physical `GET/PUT /attendance/holiday-calendars/:year` · Nest `/core` DENY |
| FE-02 | `docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-fe-02.md` READY residual LIVE |
| BE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-be-01.md` READY display-ready |
| ATT-01 QC | **`ATT01QC1-MSLZ3KIM`** RETAIN · ≠ catalog=DONE · R-ATT-01-ASSIGN **open** |
| ATT-11 QC | **`ATT11QC1-MSLXTH9P`** RETAIN · ≠ LIVE=DONE |
| ATT-10 QC | **`ATT10QC1-MSLWGUYH`** RETAIN · ≠ AGG=DONE · HOL/MEAL OUT |
| ATT-09 QC | **`ATT09QC1-MSLUTL9D`** RETAIN · DENY `att_leave_hold` |
| ATT-08 QC | **`ATT08QC1-MSLSL36C`** RETAIN · HOL-MISS peer · ≠ ATT-03b DONE alone |
| ATT-02 / PLT / CORE | RETAIN · printable false · soft≠CORE-06 |
| PAY | **OUT invent DONE** |

---

## Browser U65 — journeys

Persona: portal auth inject · `/hr/attendance?portal=1&companyId=main` → **Thiết lập** (HDSD «Cài đặt») → **Lịch lễ / Tết** · panel `att-03b-holiday-calendar-panel` · **zero-seed**.

**hdsd_align:** `att-settings-shell-precision` · `att-cfg-holiday-calendar-precision` · `att-03b-holiday-calendar-panel` · `att-03b-status-label` · `att-03b-midyear-banner` · `att-03b-honesty` · `att-08-hol-miss` · `att-08-hol-miss-cta-admin` · `att-leave-precision`.

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-ATT-03B-01** | Thiết lập → Lịch lễ / Tết → năm **2096** → Thêm ngày + tên → **Lưu** · F5 | **GET/PUT** `/api/hrm/attendance/holiday-calendars/2096` **2xx** `HRM-ATT-HOL-201` · session-1 empty CTA when 404 · Nest `/core` **0** · ≠ thin=DONE | **PASS** |
| **J-HRM-ATT-03B-02** | Âm checkbox + calendarType **lunar** → Lưu | PUT body `lunarFlag=true` `calendarType=lunar` · resp lunar day present · Nest 0 · ≠ solar-hardcode-only | **PASS** |
| **J-HRM-ATT-03B-03** | dayType **nghi/truc** · isPaid false · labels | FE `Nghỉ lễ` / `Trực lễ` · BE `dayTypeLabelVi` · isPaid false in PUT · **≠ PAY DONE** · Nest 0 | **PASS** |
| **J-HRM-ATT-03B-04** | status **Đã phát hành** · replace năm đã có | PUT `midYearPendingLeaveRecalcRequired=true` · UI `att-03b-midyear-banner` · `statusLabelVi=Đã phát hành` · `publishMode=replace_in_place_gd1` · DENY silent · Nest 0 | **PASS** |
| **J-HRM-ATT-03B-05** | Nghỉ phép → tạo đơn range **2030** (ABSENT) | GET 2030 **404** `HRM-ATT-HOL-404` · preview **400** · UI `att-08-hol-miss` + CTA → Lịch lễ / Tết · submit disabled · Nest 0 · ≠ ATT-03b DONE alone · ≠ AGG=ATT-10 · sheet HOL OUT | **PASS** |
| **J-HRM-ATT-03B-06** | F5 + honesty footer | F5 dayCount=**3** · footer printable false · residual ≠ DONE · seals ATT01/11/10/09/08 · PAY OUT · Nest DENY · C-SLICE | **PASS** |

Screens: `01-holiday-admin` … `10-j06-honesty`.

**Session note:** first runner pass J-01..05 with empty-year CTA (`ATT03BQA1-MSM03NQ0`); J-06 assert bug (`seed_used:false` vs `.every(Boolean)`) fixed → retest stamp **`ATT03BQA1-MSM0524Y`** all six PASS.

---

## AC map

| AC / exit row | Result |
|---------------|--------|
| Thin+residual CRUD · Network `/attendance/holiday-calendars/:year` · Nest `/core` 0 · F5 | **PASS** (J-01/06) |
| lunarFlag / calendarType âm | **PASS** (J-02) |
| dayType / isPaid / dayTypeLabelVi · ≠ PAY invent | **PASS** (J-03) |
| status + midYear banner on replace · DENY silent | **PASS** (J-04) |
| HOL-MISS year ABSENT · CTA admin · ≠ ATT-03b DONE alone | **PASS** (J-05) |
| Honesty ≠ residual alone=DONE · seals RETAIN · printable false · C-SLICE | **PASS** (J-06) |
| Nest `/core` holiday SoT | **PASS** (0 non-404) |
| U65 zero-seed | **PASS** |

---

## Network summary

| Metric | Value |
|--------|-------|
| `GET/PUT …/holiday-calendars/:year` | GET **11** · PUT **4** (browser) |
| PUT codes | **200** `HRM-ATT-HOL-201` |
| midYear on replace | **true** (J-04) |
| HOL-MISS preview | **400** on `/attendance/leave-requests/preview-deduction` |
| Nest `/core` holiday SoT non-404 | **0** |
| Seed | **none** |

---

## Residual / must_keep (RETAIN)

| Class | Status |
|-------|--------|
| ATT-01 `ATT01QC1-MSLZ3KIM` ≠ catalog=DONE · R-ATT-01-ASSIGN **open** | **RETAIN** |
| ATT-11 `ATT11QC1-MSLXTH9P` ≠ LIVE=DONE | **RETAIN** |
| ATT-10 `ATT10QC1-MSLWGUYH` ≠ AGG=DONE · HOL/MEAL OUT | **RETAIN** |
| ATT-09 `ATT09QC1-MSLUTL9D` · DENY `att_leave_hold` | **RETAIN** |
| ATT-08 `ATT08QC1-MSLSL36C` HOL-MISS | **RETAIN** · ≠ ATT-03b DONE alone |
| ATT-02 / PLT / CORE · printable false | **RETAIN** |
| Nest `/core` | **ABSENT** (Network 0) |
| Honesty / C-SLICE | **false** — residual bind ≠ ATT-03b DONE · ≠ ATT UAT |
| PAY / printable | **OUT invent** / **false** |

---

## Explicit ≠ DONE

- Residual lunar/type/publish FE+BE bind **≠** ATT-03b / FR-03b module DONE (**C-SLICE**)
- Thin year alone **≠** ATT-03b DONE
- **≠** catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · ATT module UAT
- `isPaid` UI **≠** invent PAY DONE · printable **false**
- HOL-MISS peer **≠** ATT-03b DONE alone
- midYear banner **≠** full PUB XOR product DONE alone

---

## Handoff

```yaml
work_item_id: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-QA-01
from_role: qa
to_role: pm → qc
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-qa-01.md
completion_report: |
  U65 browser J-HRM-ATT-03B-01..06 PASS (stamp ATT03BQA1-MSM0524Y).
  Persona ceo@ → Thiết lập → Lịch lễ / Tết; GET/PUT /api/hrm/attendance/holiday-calendars/:year
  residual lunar/type/publish + statusLabelVi/dayTypeLabelVi + midYear banner on replace;
  HOL-MISS year 2030 CTA peer ATT-08; Nest /core holiday SoT = 0; zero-seed;
  F5 dayCount=3; honesty footer C-SLICE · residual alone ≠ ATT-03b DONE · seals RETAIN ·
  printable false · PAY OUT · DENY invent ASSIGN/att_leave_hold · ≠ catalog/LIVE/AGG DONE · ≠ ATT UAT.
next_owner: qc
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-QC-01
  role: qc
  entry_criteria: QA PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-qa-01.md · stamp ATT03BQA1-MSM0524Y · FE-02+BE-01 READY · U65 · Nest /core DENY
  mission: GWC C-SLICE — audit J-HRM-ATT-03B-01..06 evidence (Network holiday-calendars only · Nest /core 0 · midYear banner · HOL-MISS CTA · honesty ≠ residual alone=ATT-03b DONE) · seal must_keep ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02/PLT/CORE · printable false · PAY OUT · R-ATT-01-ASSIGN open · DENY invent ASSIGN/att_leave_hold · DENY claim ATT-03b module UAT / catalog/LIVE/AGG DONE · honesty flip · wipe seals
  exit_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-qc-01.md · GO WITH CONDITIONS C-SLICE · stamp ATT03BQC1-* · PASS_TO_PM
  cấm: claim residual=ATT-03b DONE · claim ATT UAT · invent PAY/printable · reopen sealed J-* · seed · Nest /core SoT
```

---

*End QA-01 · PASS_TO_PM · 2026-08-09 · ≠ ATT-03b DONE · C-SLICE · PAY OUT · printable false*
