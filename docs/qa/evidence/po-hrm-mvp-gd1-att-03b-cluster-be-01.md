# PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BE-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-31 seat #33) |
| **lane** | execution · **dev-be** |
| **uc_ids** | `UC-BP-ATT-03b` · `FR-UC-BP-ATT-03b` |
| **Date** | 2026-08-09 |
| **depends_on** | API-01 **CONFIRMED RETAIN** · DATA-01 **CONFIRMED HOLD** + residual ADD stamped · BA-01 O1–O12 · SA Option A · must_keep ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02/PLT/CORE · printable false |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim residual BE alone = ATT-03b DONE · **DENY** catalog=ATT-01 DONE · **DENY** LIVE=ATT-11 DONE · **DENY** AGG=ATT-10 DONE · **DENY** ATT module UAT · **DENY** invent ASSIGN / `att_leave_hold` · PAY OUT · printable **false** |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-03b** Diễn biến **#1–#2** · **BR-BP-HOL-01** · peer FR-UC-BP-ATT-08 |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md` O1–O12 · AC-ATT-03B-LUNAR/TYPE/PUB/MIDYEAR/CNS |
| **db_design** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-DATA-01.md` — HOLD thin LIVE `att_holiday_*` · residual ADD `lunar_flag`/`calendar_type`/`is_paid`/`day_type`/`status` |
| **api_design** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-API-01.md` F.1 F-ATT-HOL-01 RETAIN + residual wire · Nest `/core` DENY |
| **sponsor_confirm** | API-01 RETAIN 2026-08-09 · Dev-BE residual REQUIRED |
| **change_mode** | **ADD** residual cols+wire · **RETAIN** thin GET/PUT year · HOL-MISS · soft `archived_at` · **preserve_default** |

---

## 2. Implementation summary

| Item | Detail |
|------|--------|
| **ensureSchema** | LIVE only: `ALTER … ADD COLUMN IF NOT EXISTS` — calendar `status`·`calendar_type` · day `lunar_flag`·`is_paid`·`day_type`·`calendar_type` · **DENY** second mega table · **DENY** `att_leave_hold` |
| **F-ATT-HOL-01 deepen** | `GET/PUT /api/hrm/attendance/holiday-calendars/:year` — residual fields on DTO + display-ready |
| **LUNAR** | `lunarFlag` / `calendarType` solar\|lunar · FAIL invalid type (`HRM-VAL-400`) · ≠ solar-hardcode-only DONE |
| **TYPE** | `isPaid` / `dayType` + `dayTypeLabelVi` (Nghỉ lễ / Trực lễ) · **≠** invent PAY DONE |
| **PUB XOR GĐ1** | `status` draft\|effective + `statusLabelVi` · `publishMode=replace_in_place_gd1` · **`midYearPendingLeaveRecalcRequired=true`** when replace existing year (DENY silent mid-year) |
| **HOL-MISS peer** | `assertHolidayYearsPresent` **RETAIN** · `HRM-LEAVE-HOL-MISSING` · stamp **ATT08QC1-MSLSL36C** · ≠ ATT-03b DONE alone |
| **Sheet HOL** | **OUT GĐ1** · cite ATT-10 · stamp **ATT10QC1-MSLWGUYH** |
| **Nest `/core`** | **ABSENT** — physical `/attendance/*` only |
| **U19** | Same `resolveHrmListScope` / persist TEXT family list=get=put |
| **CODE-MEMORY** | APPEND on service · DTO · attendance.controller |
| **OUT / DENY** | Nest `/core` dual · second mega holiday · invent ASSIGN · invent `att_leave_hold` · claim residual=ATT-03b DONE · catalog/LIVE/AGG DONE · ATT UAT · PAY/printable invent · seed · honesty flip |

### Display-ready (GET/PUT response)

```text
id · companyId · year · status · statusLabelVi · calendarType? ·
days[{ date, nameVi, lunarFlag, calendarType?, isPaid, dayType?, dayTypeLabelVi? }] ·
dayCount · publishMode · midYearPendingLeaveRecalcRequired · updatedAt · createdAt
```

---

## 3. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns=po-hrm-mvp-gd1-att-03b-cluster-be-01 --no-coverage
→ Test Suites: 1 passed · Tests: 10 passed

pnpm --filter hrm-api exec tsc -p tsconfig.build.json --noEmit
→ exit 0

Regression:
pnpm --filter hrm-api exec jest --testPathPatterns=po-hrm-mvp-gd1-att-08-cluster-be-01 --no-coverage
→ Test Suites: 1 passed · Tests: 12 passed

Nest @Controller('core') holiday SoT
→ ABSENT (grep comments-only · DENY invent)
```

**Jest coverage:** ensureSchema residual ALTER · PUT lunar/type · isPaid/dayTypeLabelVi · mid-year replace footer · duplicate date 400 · invalid calendarType 400 · HOL-MISS RETAIN · GET display-ready · honesty locks.

---

## 4. must_keep / residual

| Class | Status |
|-------|--------|
| ATT-01 `ATT01QC1-MSLZ3KIM` ≠ catalog=DONE · R-ATT-01-ASSIGN **open** | **RETAIN** · DENY invent ASSIGN |
| ATT-11 `ATT11QC1-MSLXTH9P` ≠ LIVE=DONE | **RETAIN** |
| ATT-10 `ATT10QC1-MSLWGUYH` ≠ AGG=DONE · HOL/MEAL OUT | **RETAIN** · sheet HOL OUT |
| ATT-09 `ATT09QC1-MSLUTL9D` · DENY `att_leave_hold` | **RETAIN** |
| ATT-08 `ATT08QC1-MSLSL36C` HOL-MISS | **RETAIN** · ≠ ATT-03b DONE alone |
| ATT-02 / PLT / CORE · printable false | **RETAIN** |
| Nest `/core` | **ABSENT** |
| FE admin bind residual fields | **FE-02 next** (or parallel thin FE-01) |
| Browser U65 J-HRM-ATT-03B-01..06 | **QA next** after FE bind |
| Honesty / C-SLICE | **false** — no flip · **≠ ATT-03b DONE** from residual alone |

---

## 5. Explicit ≠ DONE

- Residual BE lunar/type/publish wire **≠** ATT-03b / FR-03b module DONE (**C-SLICE**)
- Thin year alone **≠** ATT-03b DONE (still true)
- **≠** catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · ATT module UAT
- `is_paid` wire **≠** invent PAY DONE · printable **false**
- HOL-MISS peer **≠** ATT-03b DONE alone

---

## 6. Handoff

```yaml
work_item_id: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BE-01
from_role: dev-be
to_role: pm → qa (after FE bind) | dev-fe (FE-02 residual bind)
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-be-01.md
completion_report: |
  ADD residual lunar_flag/calendar_type · is_paid/day_type · status on LIVE att_holiday_*
  via ensureSchema ALTER; deepen GET/PUT /attendance/holiday-calendars/:year display-ready
  (lunarFlag/calendarType/isPaid/dayTypeLabelVi/statusLabelVi/publishMode/
  midYearPendingLeaveRecalcRequired); ATT-08 HOL-MISS RETAIN; sheet HOL OUT GĐ1;
  Nest /core 0; DENY second mega / att_leave_hold / invent ASSIGN;
  ≠ ATT-03b DONE · ≠ catalog/LIVE/AGG DONE · C-SLICE · PAY OUT · printable false;
  jest 10 PASS · ATT-08 regression 12 PASS · tsc 0.
next_owner: qa (if FE thin/residual bind ready) else dev-fe FE-02
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-02
  role: dev-fe
  entry_criteria: BE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-be-01.md · API-01 RETAIN · DATA-01 HOLD · U65 zero-seed · Nest /core DENY
  mission: Bind Lịch lễ năm admin to GET/PUT /api/hrm/attendance/holiday-calendars/:year with residual fields lunarFlag/calendarType/isPaid/dayType/status · show statusLabelVi/dayTypeLabelVi · surface midYearPendingLeaveRecalcRequired footer on replace · HOL-MISS CTA peer · Nest /core 0 · no seed · footer ≠ residual alone=ATT-03b DONE · ≠ catalog/LIVE/AGG DONE · PAY OUT · printable false
  exit_criteria: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-fe-02.md · then QA J-HRM-ATT-03B-01..06 (U65 · Nest /core 0 · ≠ ATT-03b DONE · seals RETAIN)
  cấm: Nest /core SoT · second mega holiday · invent att_leave_hold · invent ASSIGN · seed · claim ATT UAT · claim catalog/LIVE/AGG DONE · invent PAY/printable · reopen ATT-01/11/10/09/08 seals
```

---

*End BE-01 · READY_FOR_QA · 2026-08-09 · ≠ ATT-03b DONE · C-SLICE · PAY OUT*
