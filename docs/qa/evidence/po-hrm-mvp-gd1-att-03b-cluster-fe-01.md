# Evidence — PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-31 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-ATT-03b` · `FR-UC-BP-ATT-03b` · `J-HRM-ATT-03B-01..06` |
| **depends_on** | API-01 CONFIRMED RETAIN · DATA-01 HOLD · BA O1–O12 · must_keep ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02/PLT/CORE |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **ADD/UPGRADE** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · thin year ≠ ATT-03b DONE · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · CFG≠ATT-02 · printable false · PAY OUT · Nest `/core` DENY · C-SLICE · U65 · R-ATT-01-ASSIGN **open** · DENY `att_leave_hold` |
| **U65** | zero-seed — browser FE only · empty year CTA · no bootstrap seed |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-03b Diễn biến #1–#2 · BR-BP-HOL-01 · REQ_CC_001
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-API-01.md
  F-ATT-HOL-01 RETAIN thin GET/PUT …/holiday-calendars/:year · residual lunar/type/publish
- data: docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-DATA-01.md HOLD RETAIN att_holiday_* thin
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md J-HRM-ATT-03B-01..06 DRAFT
- must_keep: ATT01QC1-MSLZ3KIM ≠ catalog=DONE · R-ATT-01-ASSIGN open · ATT11QC1-MSLXTH9P ·
  ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE ·
  PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false ·
  CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · DENY att_leave_hold
- sponsor_confirm: API-01 CONFIRMED RETAIN · prefer FE+QA thin · Dev-BE residual REQUIRED lunar/type/publish
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind admin Lịch lễ / Tết → GET/PUT `/api/hrm/attendance/holiday-calendars/:year` thin `{date,nameVi}` | **PASS** |
| Display-ready year DTO · `statusLabelVi` FE-derive | **PASS** |
| Nest `/core` = 0 (source lock) | **PASS** |
| Residual lunar/type/publish stub-honest (≠ DONE until BE-01) | **PASS** |
| HOL-MISS CTA → admin Lịch lễ / Tết | **PASS** |
| Honesty ≠ ATT-03b DONE · ≠ catalog/LIVE/AGG DONE · PAY OUT · printable false | **PASS** |
| CODE-MEMORY APPEND · no `*/` inside block comments | **PASS** |
| vitest | **2 files · 10 PASS** |

### Files touched

- `apps/web/hrm/src/lib/attHoliday03bRing.ts` (+ test) — path · DTO · statusLabelVi · honesty · residual stamps
- `apps/web/hrm/src/lib/poHrmMvpGd1Att03bClusterFe01.source.test.ts` — Nest `/core` 0 · seals
- `apps/web/hrm/src/components/attendance/AttHolidayCalendarPanel.tsx` — admin year CRUD thin LIVE
- `apps/web/hrm/src/integrations/hrmApi.ts` — `getHolidayCalendar` · `putHolidayCalendar`
- `apps/web/hrm/src/pages/Attendance.tsx` — sidebar `holiday-calendar` mount
- `apps/web/hrm/src/components/attendance/AttLeavePreviewDeductionPanel.tsx` — HOL-MISS CTA admin
- `apps/web/hrm/src/lib/apiError.ts` — `HRM-ATT-HOL-404`

### Network assert path (QA)

```text
1) Chấm công → Cài đặt → Lịch lễ / Tết
   → GET /api/hrm/attendance/holiday-calendars/:year  (contains /attendance/ · Nest /core = 0)
   → 404 year ABSENT → empty CTA (no seed) · statusLabelVi FE-derive
2) Thêm ngày dương + tên VI → Lưu
   → PUT /api/hrm/attendance/holiday-calendars/:year **2xx** · list cập nhật
   → F5 → còn ngày · Nest /core = 0
   → Footer att-03b-honesty: thin ≠ ATT-03b DONE · seals RETAIN · PAY OUT
3) Residual banner: lunar/type/publish ABSENT · ≠ claim FR-03b DONE
4) (J-05) Đơn nghỉ năm ABSENT → HOL-MISS · CTA → Lịch lễ / Tết · ≠ ATT-03b DONE alone
5) Network: 0 Nest /core/* as holiday SoT
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attHoliday03bRing.test.ts \
  src/lib/poHrmMvpGd1Att03bClusterFe01.source.test.ts
# → exit 0 · 2 files · 10 tests PASS
```

---

## 4. U65 browser plan (QA-01)

**Priority first (thin LIVE):** J-HRM-ATT-03B-01 · J-HRM-ATT-03B-05  
**Wait BE residual (or BLOCKED):** J-HRM-ATT-03B-02 / 03 / 04 (lunar / type / publish)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-ATT-03B-01** | Login → Cài đặt → Lịch lễ / Tết → năm N → thêm ngày dương + tên → Lưu → F5 · Nest `/core` **0** · no seed · ≠ thin=DONE | AC-ATT-03B-SOT/ADMIN/F5/PATH/≠-THIN |
| **J-HRM-ATT-03B-05** | Năm ABSENT → Đơn nghỉ **chặn nộp** HOL-MISS · CTA admin · sheet HOL OUT · Nest `/core` **0** · ≠ ATT-03b DONE alone · ≠ AGG=ATT-10 DONE | AC-ATT-03B-CNS-*/≠-AGG10 |
| **J-HRM-ATT-03B-02** | Âm / lunarFlag | **RESIDUAL** await BE-01 — expect HOLD/BLOCKED or stub-honest |
| **J-HRM-ATT-03B-03** | Loại ngày + is_paid | **RESIDUAL** await BE-01 |
| **J-HRM-ATT-03B-04** | Publish XOR mid-year | **RESIDUAL** await BE-01 |
| **J-HRM-ATT-03B-06** | F5 + seals footer | After J-01 · ≠DONE seals |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed → Chấm công → Cài đặt  
**Cấm:** `pnpm seed:*` · Nest `/core` holiday SoT · claim thin = ATT-03b DONE · claim catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · invent ASSIGN / `att_leave_hold` · invent PAY/printable · claim ATT UAT · honesty flip · reopen sealed J-*

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-ATT-03B-LUNAR** | BE ADD `lunar_flag` / `calendar_type` + wire · FE deepen after | Dev-BE |
| **R-ATT-03B-TYPE** | BE ADD `is_paid` / day type · ≠ PAY invent | Dev-BE |
| **R-ATT-03B-PUB** | status XOR mid-year pending-leave recalc | Dev-BE |
| **R-ATT-03B-DISP** | Enrich optional residual display fields | FE after BE |
| Honesty | printable=false · C-SLICE · ≠ ATT UAT · seals RETAIN | QC |

---

## 6. Explicit ≠ DONE

- **≠ ATT-03b DONE** (thin year GET/PUT alone ≠ FR-03b DONE)
- **≠ ATT module UAT** · `attendance_uat_ready=false`
- **≠ catalog=ATT-01 DONE** · R-ATT-01-ASSIGN **open**
- **≠ LIVE=ATT-11 DONE** · **≠ AGG=ATT-10 DONE**
- **C-SLICE** · **PAY OUT** · printable **false**
- sheet HOL **OUT GĐ1** · DENY invent `att_leave_hold` · Nest `/core` DENY

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-fe-01.md` |

### completion_report

**Closed:** Dev-FE Wave-31 ATT-03b **FE-01** — admin «Lịch lễ / Tết» bound to LIVE thin `GET/PUT /api/hrm/attendance/holiday-calendars/:year` (`{date,nameVi}`); display-ready year DTO + `statusLabelVi` FE-derive; residual lunar/type/publish stub-honest (≠ DONE); Nest `/core` = 0; HOL-MISS CTA → admin; CODE-MEMORY APPEND; vitest **2 files · 10 PASS**; honesty seals RETAIN · U65 zero-seed · **≠ ATT-03b DONE** · **≠ ATT UAT** · **C-SLICE** · **PAY OUT**.

**Residual open:** BE-01 lunar/type/publish wire → then FE deepen + QA J-02/03/04.

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-QA-01
role: qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-31)
entry_criteria: FE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-fe-01.md · API-01 CONFIRMED RETAIN · browser-only U65 zero-seed · L0 stack up
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-fe-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md (J-HRM-ATT-03B-01..06 · AC-ATT-03B-*)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-API-01.md (F-ATT-HOL-01 thin · ≠ thin=DONE)
exit_criteria:
  - Browser U65: J-HRM-ATT-03B-01 (thin CRUD Lưu/F5) + J-HRM-ATT-03B-05 (HOL-MISS peer)
  - Network MUST contain /api/hrm/attendance/holiday-calendars/:year · Nest /api/hrm/core/** holiday SoT = 0 · no seed
  - Explicit ≠ ATT-03b DONE · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ ATT UAT · printable false · C-SLICE · PAY OUT
  - J-02/03/04: HOLD/BLOCKED or wait BE-01 residual lunar/type/publish (do not invent DONE)
  - evidence: docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-qa-01.md
  - ack_status PASS_TO_PM (or FAIL with residual) — not invent ATT-03b DONE
cấm: pnpm seed:* · Nest /core holiday SoT · claim thin=ATT-03b DONE · claim catalog/LIVE/AGG DONE · invent ASSIGN · invent att_leave_hold · invent PAY/printable · claim ATT UAT · honesty flip
persona: ceo@xe.vn / Xevn@2026
click_path: Login → HRM Chấm công → Cài đặt → Lịch lễ / Tết → năm → Thêm ngày → Lưu → F5; peer Đơn nghỉ HOL-MISS
```
