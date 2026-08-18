# Evidence — PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-02` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-31 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-ATT-03b` · `FR-UC-BP-ATT-03b` · `J-HRM-ATT-03B-01..06` |
| **depends_on** | BE-01 READY_FOR_QA @ `docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-be-01.md` · API-01 CONFIRMED RETAIN · DATA-01 HOLD · FE-01 thin bind UPGRADE · must_keep ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02/PLT/CORE |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **UPGRADE** FE-01 thin → residual LIVE · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · thin year ≠ ATT-03b DONE · **residual alone ≠ ATT-03b DONE** · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · CFG≠ATT-02 · printable false · PAY OUT · Nest `/core` DENY · C-SLICE · U65 · R-ATT-01-ASSIGN **open** · DENY `att_leave_hold` |
| **U65** | zero-seed — browser FE only · empty year CTA · no bootstrap seed |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-03b Diễn biến #1–#2 · BR-BP-HOL-01 · REQ_CC_001
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-API-01.md
  F-ATT-HOL-01 RETAIN GET/PUT …/holiday-calendars/:year · residual lunar/type/publish
- be: docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-be-01.md display-ready
  lunarFlag · calendarType · isPaid · dayType · dayTypeLabelVi · status · statusLabelVi ·
  publishMode · midYearPendingLeaveRecalcRequired
- data: docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-DATA-01.md HOLD + residual ADD
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md J-HRM-ATT-03B-01..06
- must_keep: ATT01QC1-MSLZ3KIM ≠ catalog=DONE · R-ATT-01-ASSIGN open · ATT11QC1-MSLXTH9P ·
  ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C HOL-MISS · ATT02QC1-MSLQZUK7 ·
  PLT/CORE · Nest /core DENY · DENY att_leave_hold · PAY OUT · printable false
- sponsor_confirm: BE-01 READY · FE-02 residual admin bind
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| UPGRADE admin Lịch lễ / Tết → GET/PUT residual `lunarFlag` · `calendarType` · `isPaid` · `dayType` · `status` | **PASS** |
| Show `statusLabelVi` · `dayTypeLabelVi` (wire + FE-derive) | **PASS** |
| Surface `midYearPendingLeaveRecalcRequired` banner on replace | **PASS** |
| HOL-MISS CTA peer RETAIN (ATT-08) · Nest `/core` = 0 · no seed | **PASS** |
| Honesty ≠ residual alone=ATT-03b DONE · ≠ catalog/LIVE/AGG DONE · seals RETAIN | **PASS** |
| CODE-MEMORY APPEND · no `*/` inside block comments | **PASS** |
| vitest | **3 files · 14 PASS** |

### Files touched

- `apps/web/hrm/src/lib/attHoliday03bRing.ts` (+ test) — residual DTO · dayTypeLabelVi · midYear · honesty
- `apps/web/hrm/src/lib/poHrmMvpGd1Att03bClusterFe02.source.test.ts` — Nest `/core` 0 · seals · residual
- `apps/web/hrm/src/components/attendance/AttHolidayCalendarPanel.tsx` — residual admin CRUD UI
- `apps/web/hrm/src/integrations/hrmApi.ts` — PUT residual fields · response midYear/publishMode
- `apps/web/hrm/src/pages/Attendance.tsx` — CODE-MEMORY APPEND FE-02

### Network assert path (QA)

```text
1) Chấm công → Cài đặt → Lịch lễ / Tết
   → GET /api/hrm/attendance/holiday-calendars/:year
   → statusLabelVi · days với dayTypeLabelVi nếu BE trả residual
2) Thêm ngày + Âm/lunarFlag + Loại ngày (Nghỉ lễ/Trực lễ) + Có lương + status
   → PUT /api/hrm/attendance/holiday-calendars/:year **2xx**
   → body gồm lunarFlag · calendarType · isPaid · dayType · status
   → FE sau 2xx: list cập nhật · dayTypeLabelVi · statusLabelVi
3) Lưu lại năm đã có → midYear banner (midYearPendingLeaveRecalcRequired)
   → DENY silent mid-year · ≠ ATT-03b DONE alone
4) F5 → còn ngày + residual fields · Nest /core = 0
5) (J-05) Đơn nghỉ năm ABSENT → HOL-MISS · CTA → Lịch lễ / Tết · ≠ ATT-03b DONE alone
6) Footer att-03b-honesty: residual alone ≠ ATT-03b DONE · seals RETAIN · PAY OUT
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attHoliday03bRing.test.ts \
  src/lib/poHrmMvpGd1Att03bClusterFe01.source.test.ts \
  src/lib/poHrmMvpGd1Att03bClusterFe02.source.test.ts
# → exit 0 · 3 files · 14 tests PASS
```

---

## 4. U65 browser plan (QA-01)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-ATT-03B-01** | Login → Cài đặt → Lịch lễ / Tết → năm N → thêm ngày + tên → Lưu → F5 · Nest `/core` **0** · no seed · ≠ thin=DONE | AC-ATT-03B-SOT/ADMIN/F5/PATH/≠-THIN |
| **J-HRM-ATT-03B-02** | Ngày lunarFlag / calendarType âm · Lưu · F5 còn · BR-BP-HOL-01 · ≠ solar-hardcode-only | AC-ATT-03B-LUNAR |
| **J-HRM-ATT-03B-03** | dayType Nghỉ lễ / Trực lễ · isPaid · dayTypeLabelVi · ≠ invent PAY DONE | AC-ATT-03B-TYPE |
| **J-HRM-ATT-03B-04** | status Nháp/Đã phát hành · replace năm đã có → midYear banner · DENY silent | AC-ATT-03B-PUB/MIDYEAR |
| **J-HRM-ATT-03B-05** | Năm ABSENT → Đơn nghỉ **chặn nộp** HOL-MISS · CTA admin · sheet HOL OUT · Nest `/core` **0** · ≠ ATT-03b DONE alone · ≠ AGG=ATT-10 DONE | AC-ATT-03B-CNS-*/≠-AGG10 |
| **J-HRM-ATT-03B-06** | F5 + seals footer · residual alone ≠ ATT-03b DONE · catalog/LIVE/AGG seals | AC-ATT-03B-≠DONE |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed → Chấm công → Cài đặt  
**Cấm:** `pnpm seed:*` · Nest `/core` holiday SoT · claim residual = ATT-03b DONE · claim catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · invent ASSIGN / `att_leave_hold` · invent PAY/printable · claim ATT UAT · honesty flip · reopen sealed J-*

---

## 5. Residual / must_keep

| Class | Status |
|-------|--------|
| ATT-01 `ATT01QC1-MSLZ3KIM` ≠ catalog=DONE · R-ATT-01-ASSIGN **open** | **RETAIN** |
| ATT-11 `ATT11QC1-MSLXTH9P` ≠ LIVE=DONE | **RETAIN** |
| ATT-10 `ATT10QC1-MSLWGUYH` ≠ AGG=DONE · HOL/MEAL OUT | **RETAIN** |
| ATT-09 `ATT09QC1-MSLUTL9D` · DENY `att_leave_hold` | **RETAIN** |
| ATT-08 `ATT08QC1-MSLSL36C` HOL-MISS | **RETAIN** · ≠ ATT-03b DONE alone |
| ATT-02 / PLT / CORE · printable false | **RETAIN** |
| Nest `/core` | **ABSENT** (source lock) |
| Browser U65 J-HRM-ATT-03B-01..06 | **QA next** |
| Honesty / C-SLICE | **false** — residual FE bind ≠ ATT-03b DONE |

---

## 6. Explicit ≠ DONE

- Residual FE lunar/type/publish bind **≠** ATT-03b / FR-03b module DONE (**C-SLICE**)
- Thin year alone **≠** ATT-03b DONE
- **≠** catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · ATT module UAT
- `isPaid` UI **≠** invent PAY DONE · printable **false**
- HOL-MISS peer **≠** ATT-03b DONE alone
- midYear banner **≠** full PUB XOR product DONE alone

---

## 7. Handoff

```yaml
work_item_id: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-02
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-fe-02.md
completion_report: |
  UPGRADE FE-01 thin → residual LIVE bind Lịch lễ năm admin to
  GET/PUT /api/hrm/attendance/holiday-calendars/:year with lunarFlag · calendarType ·
  isPaid · dayType · status; show statusLabelVi/dayTypeLabelVi; surface
  midYearPendingLeaveRecalcRequired on replace; HOL-MISS CTA peer RETAIN;
  Nest /core 0; no seed; honesty ≠ residual alone=ATT-03b DONE · ≠ catalog/LIVE/AGG;
  seals RETAIN; PAY OUT; printable false; vitest 3 files 14 PASS.
next_owner: qa
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-QA-01
  role: qa
  entry_criteria: FE-02 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-fe-02.md · BE-01 READY · L0 stack · U65 zero-seed · Nest /core DENY
  mission: Browser U65 J-HRM-ATT-03B-01..06 — login ceo@xe.vn → Chấm công → Cài đặt → Lịch lễ / Tết · GET/PUT residual fields · statusLabelVi/dayTypeLabelVi · midYear banner on replace · HOL-MISS CTA · Network /attendance/holiday-calendars only · Nest /core 0 · F5 · footer ≠ residual alone=ATT-03b DONE · seals ATT01/11/10/09/08 RETAIN · ≠ catalog/LIVE/AGG DONE · PAY OUT · printable false
  exit_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-qa-01.md · click path + Network 2xx + FE sau 2xx + F5 per J-* · PASS_TO_PM or FAIL with residual owner
  cấm: pnpm seed:* · Nest /core holiday SoT · claim residual=ATT-03b DONE · invent ASSIGN/att_leave_hold · invent PAY/printable · reopen sealed seals · honesty flip
```

---

*End FE-02 · READY_FOR_QA · 2026-08-09 · ≠ ATT-03b DONE · C-SLICE · PAY OUT*
