# BA AC pack — Wave-31 ATT cluster · UC-BP-ATT-03b (Lịch lễ / Tết dương+âm · RETAIN thin F-ATT-HOL + residual admin)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-31 seat **#33**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (ADD residual only if closable gap for lunar/type/publish) · sa API residual unlock after DATA · **DENY** claim thin year PUT alone = ATT-03b DONE · **DENY** claim catalog=ATT-01 DONE · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **DENY** claim ATT module UAT · **printable false RETAIN** · **PAY OUT invent DONE** · **DENY invent ASSIGN DONE** · **DENY invent `att_leave_hold`** |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** wipe ATT-01/11/10/09/08/02/PLT/CORE · **no** wipe soft≠CORE-06 DONE · **no** invent PAY/printable/Word DONE · **no** claim thin HOL alone = FR-03b DONE) |
| **uc_ids** | `UC-BP-ATT-03b` · `FR-UC-BP-ATT-03b` |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-01 **`ATT01QC1-MSLZ3KIM`** · QA **`ATT01QA1-MSLYZKGN`** · must_keep ATT-11 **`ATT11QC1-MSLXTH9P`** (≠ LIVE=DONE) · ATT-10 **`ATT10QC1-MSLWGUYH`** (≠ AGG=DONE · HOL/MEAL OUT · R-ATT-10-DISP P2 HOLD) · ATT-09 **`ATT09QC1-MSLUTL9D`** · ATT-08 **`ATT08QC1-MSLSL36C`** (HOL-MISS peer) · ATT-02 **`ATT02QC1-MSLQZUK7`** · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** (printable **false**) · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · **R-ATT-01-ASSIGN open** · PAY invent DONE **OUT** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-03b** · Luồng **#1–#4** · Diễn biến **#1–#2 + Thành công** · **BR-BP-HOL-01** · partner **REQ_CC_001** · peer FR-UC-BP-ATT-08 holiday input |
| **ref_api_paper** | **F-ATT-HOL-01** · peers **F-ATT-LEAVE-01** (ATT-08 HOL-MISS) · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE thin `att_holiday_calendar` + `att_holiday_day` · paper DB_DESIGN §4.3 `lunar_flag`/`is_paid`/`status` · Nest `@Controller('core')` **ABSENT** |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/holiday-calendars*` · paper `/att/*` + `/core` **alias only** · U19 scope parity · soft-delete · **DENY** Nest `/core` dual |
| **Honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim thin HOL = ATT-03b DONE · **DENY** claim catalog=ATT-01 DONE · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** invent ASSIGN DONE · **DENY** invent `att_leave_hold` |
| **Cấm** | Nest `/core` dual · wipe ATT-01/11/10/09/08/02/PLT/CORE · soft=CORE-06 DONE · invent PAY/printable/Word DONE · invent ASSIGN DONE · invent `att_leave_hold` · claim thin year PUT = FR-03b DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT module UAT · honesty flip · seed · apps/** · reopen sealed J-HRM-ATT-01 / ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-31 seat #33 — **gap-only RETAIN** LIVE thin Nest year holiday set + **ATT-08 HOL-MISS peer** + residuals **lunar / type / publish / admin**:

1. **Holiday SoT** = LIVE Nest `GET/PUT /api/hrm/attendance/holiday-calendars/:year` → `att_holiday_calendar` + `att_holiday_day` (**F-ATT-HOL-01 thin**) — **explicit ≠** ATT-03b DONE from thin PUT alone.
2. **Lunar** = residual `lunar_flag` and/or `calendar_type` solar|lunar — **BR-BP-HOL-01** · **FAIL** solar-hardcode-only / no tenant âm config.
3. **Day type / paid** = residual `is_paid` / type enum nghỉ|trực… — display-ready labels VI.
4. **Publish / version** = draft→publish **XOR** GĐ1 replace-in-place with **explicit** mid-year recalc for pending leave — footer GĐ1 vs GĐ2.
5. **Admin FE** = dedicated «Lịch lễ / Tết» CRUD năm (PRODUCT_MISSING → residual) · HOL-MISS CTA → admin — U65 Lưu/F5.
6. **Consumer CNS** = leave **RETAIN** HOL-MISS (`HRM-LEAVE-HOL-MISSING`) · sheet HOL deepen **OUT GĐ1** (cite ATT-10 HOL/MEAL OUT) · same-SoT AC · **≠** claim AGG=ATT-10 DONE.
7. **Soft-archive** = `archived_at` hide year · history days intact · **≠** hard-delete default.
8. **Scope U19** = list = get = put same `resolveHrmListScope`.
9. **Mint** `J-HRM-ATT-03B-01..06` DRAFT — admin CRUD dương+âm → Lưu/F5 · HOL-MISS · Nest `/core` 0 — **narrow** · **≠** ATT module UAT.
10. **must_keep** ATT01QC1-MSLZ3KIM (≠ catalog=DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN) · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS / HR tenant | CRUD lịch năm dương+âm · phát hành · soft-archive |
| Quản trị XBOS (giai đoạn đầu) | Khai lịch đầu · đồng bộ sau (cite · ≠ invent XBOS DONE) |
| Nhân viên / Quản lý | Consumer phép đọc lịch hiệu lực (peer ATT-08 · ≠ ATT-03b DONE alone) |
| Group CEO | Scope rollup `main` — U19 list = get = put |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng scope resolver |
| Hệ thống (Nest) | Year holiday SoT · HOL-MISS gate · Nest `/core` **0** |
| ATT-01/11/10/09/08/02 / PLT / CORE / PAY | Peers **must_keep / OUT invent DONE** — **≠** claim DONE from this seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-ATT-03b Diễn biến #1–#2 + BR-BP-HOL-01 → AC-ATT-03B-* · residuals LUNAR/TYPE/PUB/ADMIN/CNS/DISP/≠DONE · J-HRM-ATT-03B-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer `/attendance/holiday-calendars*` · paper `/att` + `/core` alias | Nest `/core/…` holiday SoT dual |
| Explicit ≠ ATT-03b DONE from thin year alone · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT · DENY invent ASSIGN · DENY invent `att_leave_hold` | Claim Option/thin PUT alone = FR-03b DONE · invent PAY/printable/Word · invent sheet HOL=ATT-10 DONE |
| Honesty footer · ATT-01..CORE RETAIN · soft≠CORE-06 DONE · ATT-08 HOL-MISS peer | Flip ready flags · reopen sealed J-* · wipe HOL-MISS |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Holiday SoT | **YES RETAIN** — LIVE Nest thin `GET/PUT …/holiday-calendars/:year` → `att_holiday_*` (**F-ATT-HOL-01**) · paper `/att`+`/core` alias · **explicit ≠** ATT-03b DONE from thin PUT alone · mint **J-HRM-ATT-03B-*** — **AC-ATT-03B-SOT** · **AC-ATT-03B-PATH** · **AC-ATT-03B-≠-THIN-DONE** |
| **O2** | Lunar | **YES residual** — Prefer ADD `lunar_flag` and/or `calendar_type` solar\|lunar on day/calendar — **no** hardcode âm-only · **no** solar-only national lock without tenant âm config — **FAIL BR-BP-HOL-01** if solar-hardcode-only — **AC-ATT-03B-LUNAR** · **AC-ATT-03B-FAIL-SOLAR** |
| **O3** | Day type / paid | **YES residual** — Prefer `is_paid` + type enum nghỉ\|trực… · display-ready `dayTypeLabelVi` — **AC-ATT-03B-TYPE** · **AC-ATT-03B-PAID** |
| **O4** | Publish / version | **YES residual XOR** — Prefer **draft→publish** versioning **XOR** GĐ1 **replace-in-place** with **explicit** mid-year recalc for **pending leave** (đơn chưa duyệt) — footer must state which XOR · GĐ2 deepen versioning OK — **AC-ATT-03B-PUB** · **AC-ATT-03B-MIDYEAR** |
| **O5** | Admin FE | **YES residual** — Unlock dedicated Lịch lễ năm CRUD (PRODUCT_MISSING → residual) · HOL-MISS CTA → admin · U65 Lưu/F5 — **AC-ATT-03B-ADMIN** · **AC-ATT-03B-F5** |
| **O6** | Consumer CNS | **YES** — Leave **RETAIN** HOL-MISS (`HRM-LEAVE-HOL-MISSING` CHẶN NỘP) · sheet HOL deepen **OUT GĐ1** (cite ATT-10 HOL/MEAL OUT · R-ATT-10-DISP HOLD) · same-SoT leave+admin · **≠** claim AGG=ATT-10 DONE — **AC-ATT-03B-CNS-LEAVE** · **AC-ATT-03B-CNS-SHEET-OUT** · **AC-ATT-03B-≠-AGG10** |
| **O7** | Paper `/core` + `/att` | **YES** — **alias only** — Nest `@Controller('core')` SoT = **FAIL** — **AC-ATT-03B-PATH** |
| **O8** | ATT-01/11/10/09/08/PLT/CORE | **YES** — must_keep stamps **intact** · **≠ catalog=ATT-01 DONE** · **R-ATT-01-ASSIGN open** · **DENY invent ASSIGN DONE** · **≠ LIVE=ATT-11 DONE** · **≠ AGG=ATT-10 DONE** · **DENY `att_leave_hold`** · **≠** reopen · printable false — **AC-ATT-03B-MK-*** |
| **O9** | Soft-archive | **YES** — Prefer `archived_at` hide year · history days intact · **≠** hard-delete default — **AC-ATT-03B-SOFT** |
| **O10** | Scope U19 | **YES** — list = get = put same `resolveHrmListScope` · 409 scope — **AC-ATT-03B-SCOPE** |
| **O11** | PAY / printable | **YES OUT invent** — PAY QUEUED · printable **false RETAIN** — **AC-ATT-03B-PAY-OUT** · **AC-ATT-03B-PRINTABLE** |
| **O12** | Honesty / journeys | **YES false** — all ready flags false · **`attendance_uat_ready=false`** · C-SLICE · mint **`J-HRM-ATT-03B-01..06` DRAFT** — **≠** ATT-03b DONE · **≠** ATT module UAT · U65 zero-seed — **AC-ATT-03B-H** |

**Architecture SoT:** RETAIN LIVE thin `holiday-calendars/:year` + ATT-08 HOL-MISS · unlock LUNAR/TYPE/PUB/ADMIN/CNS/DISP/≠DONE · paper F-ATT-HOL-01 + `/core` alias only · U19 list↔get↔put · ATT-01..CORE **must_keep**.

### Primary API surface (BA lock — O1/O7)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| Year holiday GET/PUT (RETAIN thin + residual deepen) | **`GET/PUT /api/hrm/attendance/holiday-calendars/:year`** | `PUT /api/hrm/att/holiday-calendars/{year}` · `/core/…` **alias only** |
| Leave preview HOL-MISS (peer RETAIN) | **`POST …/leave-requests/preview-deduction`** | paper alias · **≠** ATT-03b DONE alone |
| Leave create/approve (peer RETAIN) | leave-requests* | **≠** ATT-09 DONE · DENY `att_leave_hold` |
| Sheet aggregate (peer RETAIN) | attendance-sheets aggregate | HOL/MEAL **OUT GĐ1** · **≠ AGG=ATT-10 DONE** |
| ATT-01 CAT/CNS / ATT-11 sign / PLT / CORE | peers | must_keep · **≠** claim DONE · DENY invent ASSIGN |

**Invariant ATT-03B-PATH:** Holiday Network **MUST** hit physical `/api/hrm/attendance/*` — Nest dual `/core` SoT = **FAIL O7**.

**Invariant ATT-03B-≠-THIN:** Claim thin GET/PUT year alone = FR-UC-BP-ATT-03b DONE = **FAIL O1/O12**.

**Invariant ATT-03B-≠-UAT:** Claim ATT module UAT / flip `attendance_uat_ready` from this seat = **FAIL O12**.

**Invariant ATT-03B-≠-CAT01:** Claim catalog = ATT-01 DONE = **FAIL O8**.

**Invariant ATT-03B-≠-LIVE11:** Claim LIVE sign/close = ATT-11 DONE = **FAIL O8**.

**Invariant ATT-03B-≠-AGG10:** Claim AGG = ATT-10 DONE / invent sheet HOL DONE = **FAIL O6/O8**.

**Invariant ATT-03B-≠-PRINTABLE:** Claim printable / Word DONE / flip `contracts_printable_ready` = **FAIL O11/O12**.

**Invariant ATT-03B-PAY-OUT:** Invent PAY DONE = **FAIL O11**.

**Invariant ATT-03B-ASSIGN:** Invent ASSIGN DONE / close R-ATT-01-ASSIGN = **FAIL O8**.

**Invariant ATT-03B-HOLD:** Invent `att_leave_hold` dual = **FAIL O8**.

**Wire codes (RETAIN + residual assert):** `HRM-VAL-400` (duplicate date / invalid year) · `HRM-LEAVE-HOL-MISSING` (peer ATT-08 — thiếu lịch năm CHẶN NỘP) · `HRM-SCOPE-409` · sealed peer codes · **DENY** invent Nest `/core` error family as SoT.

**Display-ready (normative for FE bind — O DISP):** `{ id, companyId, year, status?, statusLabelVi?, days: [{ date, nameVi, lunarFlag?, calendarType?, isPaid?, dayTypeLabelVi? }], dayCount, updatedAt }` — BA VI labels; map paper `lunar_flag`/`is_paid`/`status` → LIVE residual after ba-data.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-03b DONE** · thin year PUT ≠ FR-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · ≠ soft/ATT-08=ATT-09 DONE · ≠ CFG=ATT-02 DONE · PAY OUT invent DONE · DENY invent ASSIGN · DENY invent `att_leave_hold` · must_keep ATT-01 `ATT01QC1-MSLZ3KIM` · ATT-11 `ATT11QC1-MSLXTH9P` · ATT-10 `ATT10QC1-MSLWGUYH` · ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-31 · Option A) |
|---|----------------------|---------------------------|
| Year holiday set | `GET/PUT …/holiday-calendars/:year` thin `{date,nameVi}` | **RETAIN cite** + residual deepen (**O1**) · **≠** FR-03b DONE alone |
| Lunar / calendar_type | **ABSENT** | **RESIDUAL** R-ATT-03B-LUNAR (**O2**) |
| is_paid / day type | **ABSENT** | **RESIDUAL** R-ATT-03B-TYPE (**O3**) |
| Publish / status / version | Replace-in-place only | **RESIDUAL** R-ATT-03B-PUB XOR GĐ1 replace+mid-year (**O4**) |
| Admin FE Lịch lễ | **ABSENT** (HOL-MISS msg only) | **RESIDUAL** R-ATT-03B-ADMIN (**O5**) |
| ATT-08 HOL-MISS | PRESENT CHẶN NỘP | **RETAIN cite** (**O6**) · must_keep ATT-08 |
| Sheet HOL/MEAL | OUT GĐ1 on ATT-10 seal | **OUT GĐ1 RETAIN** (**O6**) · ≠ AGG=DONE |
| Soft-archive | Soft calendar cite | **RETAIN + AC** (**O9**) |
| Paper F-ATT-HOL-01 / `/core` | Nest named thin PRESENT · `@Controller('core')` ABSENT | **Alias only** (**O7**) |
| ATT-01..CORE | SEALED stamps | **must_keep RETAIN** (**O8**) |
| PAY / printable | QUEUED / false | **OUT invent DONE** (**O11**) |
| Honesty | C-SLICE · printable false | **false RETAIN** (**O12**) |

### 1.1 Disposition **R-ATT-03B-LUNAR**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-03B-LUNAR` |
| **Scope** | **IN-SCOPE residual** — `lunar_flag` and/or `calendar_type` solar\|lunar · BR-BP-HOL-01 · FAIL solar-hardcode-only |
| **OUT** | Hardcode âm-only calendar · Nest `/core` dual · claim thin=DONE |
| **Rationale** | FR input · REQ_CC_001 · SA O2 · LIVE ABSENT lunar |
| **ba-data** | **HOLD default** — **ADD** only if proves typed col ABSENT closable on LIVE `att_holiday_*` |
| **DENY** | Second mega holiday table · Nest `/core` SoT |

### 1.2 Disposition **R-ATT-03B-TYPE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-03B-TYPE` |
| **Scope** | **IN-SCOPE residual** — `is_paid` + day type nghỉ\|trực… · display-ready labels |
| **OUT** | Invent PAY DONE from `is_paid` alone |
| **Rationale** | SRS input «Loại ngày» · DB §4.3 · SA O3 |
| **ba-data** | **HOLD default** — **ADD** if `is_paid`/type ABSENT closable |
| **DENY** | PAY invent · Nest `/core` |

### 1.3 Disposition **R-ATT-03B-PUB**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-03B-PUB` |
| **Scope** | **IN-SCOPE residual XOR** — draft→publish **OR** GĐ1 replace-in-place + mid-year recalc pending leave · calendar `status` paper cite |
| **OUT** | Claim replace-in-place alone = full FR publish DONE without mid-year rule |
| **Rationale** | Luồng #3 · SRS «đổi lịch giữa năm» · SA O4 |
| **ba-data** | **HOLD default** — **ADD** if `status`/version ABSENT closable |
| **DENY** | Silent mid-year change without pending leave recalc rule |

### 1.4 Disposition **R-ATT-03B-ADMIN**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-03B-ADMIN` |
| **Scope** | **IN-SCOPE residual** — dedicated FE Lịch lễ năm CRUD · HOL-MISS CTA → admin · U65 Lưu/F5 |
| **OUT** | Claim HOL-MISS alert alone = admin DONE · invent Nest `/core` UI |
| **Rationale** | FR Diễn biến #1 · PRODUCT_MISSING · SA O5 |
| **ba-data** | **HOLD** — FE bind after API residual |
| **DENY** | Seed holiday for U65 · claim thin PUT = admin DONE |

### 1.5 Disposition **R-ATT-03B-CNS** / **DISP** / **≠DONE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-03B-CNS` · `R-ATT-03B-DISP` · `R-ATT-03B-≠DONE` · `R-ATT-03B-PAY-OUT` · `R-ATT-03B-HONESTY` |
| **Scope** | Leave HOL-MISS **RETAIN** · sheet HOL **OUT GĐ1** · display-ready DTO · honesty locks |
| **Rule** | thin PUT ≠ FR-03b DONE · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ ATT UAT · PAY/printable **OUT invent DONE** · all ready flags **false** · printable **false RETAIN** |
| **DENY** | Claim DONE / honesty flip / invent PAY·printable·ASSIGN·`att_leave_hold` · reopen seals |

### 1.6 ba-data disposition summary

| Slice | Decision | Rule |
|-------|----------|------|
| `att_holiday_calendar` + `att_holiday_day` thin | **HOLD · RETAIN** | ≠ FR-03b DONE alone |
| `lunar_flag` / `calendar_type` | **HOLD default** · **ADD** if ABSENT closable | BR-BP-HOL-01 · DENY Nest `/core` |
| `is_paid` / day type | **HOLD default** · **ADD** if ABSENT closable | ≠ PAY invent |
| `status` / publish version | **HOLD default** · **ADD** if ABSENT closable | XOR GĐ1 replace+mid-year |
| Admin FE / display DTO | **HOLD** | after API residual |
| ATT-08 HOL-MISS | **HOLD · RETAIN** | must_keep · ≠ ATT-03b DONE alone |
| Sheet HOL/MEAL | **OUT GĐ1** | cite ATT-10 · ≠ AGG=DONE |
| Nest `/core` | **DENY** | alias only |
| ATT-01..CORE / soft≠06 | **DENY wipe** | must_keep · printable false · DENY invent ASSIGN · DENY `att_leave_hold` |
| PAY | **OUT invent DONE** | cite only |

**Unlock next:** **ba-data HOLD** stamp (ADD residual only if lunar/type/publish gap closable) → **sa API** F.1 F-ATT-HOL-01 physical `/attendance/*`.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-03b DONE** · Nest `/core` DENY · C-SLICE · `attendance_uat_ready=false`

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-HOL-01** | Cấu hình lịch năm | Dương + âm theo năm/pháp nhân | **FAIL** nếu chỉ hardcode dương VN không cấu hình âm/tenant |
| **BR-ATT-03B-SOT** | Holiday SoT | Physical `/attendance/holiday-calendars*` | Thin RETAIN · **≠** FR-03b DONE alone |
| **BR-ATT-03B-PATH** | Holiday API | Physical `/attendance/*` | Nest `/core` dual = **FAIL O7** |
| **BR-ATT-03B-LUNAR** | Day/calendar residual | Persist lunarFlag/calendarType | Âm cấu hình năm · FAIL solar-only lock |
| **BR-ATT-03B-TYPE** | Day CRUD | Persist type + is_paid | Display-ready labels VI |
| **BR-ATT-03B-PUB** | Publish XOR replace | draft→publish **OR** replace + mid-year rule | Pending leave recalc theo rule GĐ1 |
| **BR-ATT-03B-MIDYEAR** | Đổi lịch giữa năm | Đơn chưa duyệt | Tính lại theo phiên bản/rule mới |
| **BR-ATT-03B-ADMIN** | Quyền HCNS | CRUD năm trên FE admin | Lưu 2xx · F5 còn · Nest `/core` 0 |
| **BR-ATT-03B-CNS-LEAVE** | Year set ABSENT | Leave preview/submit | **CHẶN NỘP** · `HRM-LEAVE-HOL-MISSING` · must_keep ATT-08 |
| **BR-ATT-03B-CNS-SHEET** | Sheet HOL | GĐ1 | **OUT** · cite ATT-10 HOL/MEAL OUT · ≠ AGG=DONE |
| **BR-ATT-03B-SOFT** | Soft-archive year | Hide from pickers | History days intact · ≠ hard-delete default |
| **BR-ATT-03B-SCOPE-U19** | list = get = put | Same scope resolver | Cross-CT leak = **FAIL U19** |
| **BR-ATT-03B-≠-THIN** | Thin PUT PASS alone | ≠ FR-03b / ATT-03b DONE | Claim DONE = **FAIL O1/O12** |
| **BR-ATT-03B-≠-CAT01** | Any ATT-03b evidence | ≠ catalog=ATT-01 DONE | Claim = **FAIL O8** · R-ATT-01-ASSIGN open |
| **BR-ATT-03B-≠-LIVE11** | Any ATT-03b evidence | ≠ LIVE=ATT-11 DONE | Claim = **FAIL O8** |
| **BR-ATT-03B-≠-AGG10** | Any ATT-03b evidence | ≠ AGG=ATT-10 DONE | Claim / invent sheet HOL DONE = **FAIL O6/O8** |
| **BR-ATT-03B-≠-UAT** | Slice PASS | ≠ ATT module UAT | Flip `attendance_uat_ready` = **FAIL O12** |
| **BR-ATT-03B-PAY-OUT** | Any cite | PAY QUEUED | Invent PAY DONE = **FAIL O11** |
| **BR-ATT-03B-PRINTABLE** | Honesty | `contracts_printable_ready=false` | Flip = **FAIL O11/O12** |
| **BR-ATT-03B-NO-SEED** | Nghiệm thu | FE only | Seed = **FAIL U65** |
| **BR-ATT-03B-ASSIGN** | R-ATT-01-ASSIGN | **open RETAIN** | Invent ASSIGN DONE = **FAIL O8** |
| **BR-ATT-03B-HOLD** | Leave hold | pending_days only | Invent `att_leave_hold` = **FAIL O8** |
| **BR-ATT-03B-MK** | Any ATT-03b evidence | Diff ATT-01..CORE seals | Wipe/reopen/claim DONE = **FAIL O8** |

### Error taxonomy (RETAIN + residual assert)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| `HRM-VAL-400` | 400 | Trùng ngày / năm không hợp lệ | Soft-OK duplicate |
| `HRM-LEAVE-HOL-MISSING` | 4xx | Thiếu lịch lễ năm — chặn nộp (peer ATT-08) | Silent 2xx submit · claim ATT-03b DONE alone |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | Soft OK |
| Sealed ATT-01 | — | ≠ catalog=DONE · ASSIGN open | Invent ASSIGN DONE |
| Sealed ATT-11 | — | ≠ LIVE=DONE | Claim LIVE=ATT-11 DONE |
| Sealed ATT-10 | — | ≠ AGG=DONE · HOL/MEAL OUT | Invent sheet HOL DONE |
| Sealed ATT-09/08 | — | HOL-MISS · pending_days · DENY `att_leave_hold` | Dual hold ledger |
| Sealed ATT-02 | — | CFG≠DONE · ≠ ATT UAT | Claim CFG=ATT-02 DONE |
| Sealed PLT/CORE | — | peer≠DONE · printable false | Flip printable / claim CORE DONE |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-03b DONE** · Nest `/core` DENY · C-SLICE

---

## 3. Diễn biến FR-UC-BP-ATT-03b → AC / VAL map (normative)

### 3.0 Map overview

| SRS source | Tương tác | AC cite | J-* | LIVE Network (cite) |
|------------|-----------|---------|-----|---------------------|
| **Diễn biến #1** · Luồng #1–#2 | CRUD lịch năm dương+âm | **AC-ATT-03B-ADMIN** · **AC-ATT-03B-LUNAR** · **AC-ATT-03B-TYPE** | **J-HRM-ATT-03B-01/02/03** | `GET/PUT …/holiday-calendars/:year` · Nest `/core` **0** |
| **Luồng #3** · publish | Phát hành / mid-year | **AC-ATT-03B-PUB** · **AC-ATT-03B-MIDYEAR** | **J-HRM-ATT-03B-04** | residual status/version XOR replace |
| **Diễn biến #2** · Luồng #4 | Phép/công đọc lịch | **AC-ATT-03B-CNS-LEAVE** · **CNS-SHEET-OUT** | **J-HRM-ATT-03B-05** | HOL-MISS RETAIN · sheet HOL OUT GĐ1 |
| **BR-BP-HOL-01 FAIL** | Solar-hardcode-only | **AC-ATT-03B-FAIL-SOLAR** | **J-02** | Reject / assert FAIL |
| **Thành công** | Một SoT · F5 | **AC-ATT-03B-F5** · **AC-ATT-03B-SOT** | **J-HRM-ATT-03B-06** | F5 còn · seals footer |
| **O7–O12** | ≠DONE + seals | **AC-ATT-03B-≠-*** · **H** · **MK-*** | **J-06** | ATT-01..CORE RETAIN · PAY OUT |

### 3.1 AC-ATT-03B pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-ATT-03B-PATH** | Holiday API | GET/PUT year | Network hits **only** physical `/api/hrm/attendance/*` · Nest `/api/hrm/core/**` SoT **0** · paper `/att`+/`/core` alias only | U65 · O1/O7 · **R-ATT-03B** |
| **AC-ATT-03B-SOT** | Quyền HCNS đúng scope | Mở/lưu lịch năm | Thin year set RETAIN · days persist · Nest `/core` 0 · no seed · **≠** ATT-03b DONE alone | Diễn biến #1 · J-01 |
| **AC-ATT-03B-ADMIN** | PRODUCT_MISSING residual | CRUD trên FE Lịch lễ năm | Form load · Thêm/sửa ngày · Lưu **2xx** · list cập nhật · Nest `/core` 0 | O5 · J-01 |
| **AC-ATT-03B-LUNAR** | Residual cols closable | Thêm ngày âm / `calendar_type=lunar` | Persist `lunarFlag`/`calendarType` · FE hiện nhãn âm · **≠** hardcode âm-only | O2 · BR-BP-HOL-01 · J-02 |
| **AC-ATT-03B-FAIL-SOLAR** | Policy BR-BP-HOL-01 | Claim solar-only national hardcode = FR-03b DONE / no âm config | **FAIL AC** — không đạt · reject soft-OK | O2 · J-02 |
| **AC-ATT-03B-TYPE** / **PAID** | Day CRUD | Chọn loại nghỉ\|trực + is_paid | Persist · display `dayTypeLabelVi` · **≠** invent PAY DONE | O3 · J-03 |
| **AC-ATT-03B-PUB** | XOR locked in evidence | Publish draft **OR** replace-in-place GĐ1 | Status/version **or** explicit replace footer · Nest `/core` 0 | O4 · J-04 |
| **AC-ATT-03B-MIDYEAR** | Đổi lịch giữa năm | Đơn phép chưa duyệt | Recalc theo rule GĐ1 · **no** silent ignore | O4 · SRS · J-04 |
| **AC-ATT-03B-CNS-LEAVE** | Year holiday ABSENT | Leave preview/submit | **Chặn nộp** · `HRM-LEAVE-HOL-MISSING` · must_keep ATT-08 · **≠** ATT-03b DONE alone | O6 · J-05 |
| **AC-ATT-03B-CNS-SHEET-OUT** | Sheet aggregate | GĐ1 | Sheet HOL deepen **OUT** · cite ATT-10 HOL/MEAL OUT · **≠ AGG=ATT-10 DONE** | O6 · J-05/06 |
| **AC-ATT-03B-SOFT** | Soft-archive year | Archive | Year ẩn picker · history days intact · **≠** hard-delete default | O9 · J-01/06 |
| **AC-ATT-03B-SCOPE** | list/get/put | Cross-CT attempt | Same scope resolver · **409** out-of-scope | O10 · U19 · J-06 |
| **AC-ATT-03B-DISP** | Response year | After GET/PUT | Display-ready `{ year, statusLabelVi?, days[{date,nameVi,lunarFlag?,…}], dayCount }` | O DISP · J-01 |
| **AC-ATT-03B-F5** | Sau Lưu 2xx | F5 / navigate lại | Lịch năm còn · Nest `/core` 0 | U65 · J-06 |
| **AC-ATT-03B-≠-THIN-DONE** | Thin PUT PASS alone | Claim FR-03b / ATT-03b DONE | **FAIL** — footer **thin ≠ ATT-03b DONE** | O1/O12 |
| **AC-ATT-03B-≠-CAT01** | Any evidence | Claim catalog = ATT-01 DONE | **FAIL** · R-ATT-01-ASSIGN **open** · DENY invent ASSIGN | O8 |
| **AC-ATT-03B-≠-LIVE11** | Any evidence | Claim LIVE = ATT-11 DONE | **FAIL** | O8 |
| **AC-ATT-03B-≠-AGG10** | Any evidence | Claim AGG = ATT-10 DONE / invent sheet HOL DONE | **FAIL** | O6/O8 |
| **AC-ATT-03B-≠-UAT** | Slice GWC later | Claim ATT module UAT / flip `attendance_uat_ready` | **FAIL** | O12 · C-SLICE |
| **AC-ATT-03B-≠-09** | Any evidence | Claim soft/ATT-08 = ATT-09 DONE | **FAIL** · DENY `att_leave_hold` | O8 |
| **AC-ATT-03B-≠-CFG02** | Any evidence | Claim CFG = ATT-02 DONE | **FAIL** | O8 |
| **AC-ATT-03B-≠-PLT-DONE** | Any evidence | Claim PLT-01 / platform UAT DONE | **FAIL** | O8 |
| **AC-ATT-03B-≠-CORE10-DONE** | Any evidence | Claim CORE-10 DONE | **FAIL** | O8 |
| **AC-ATT-03B-≠-09-DONE** | Any evidence | Claim CORE-09 DONE / printable flip | **FAIL** | O8/O11 |
| **AC-ATT-03B-≠-07-DONE** | Any evidence | Claim CORE-07 DONE | **FAIL** | O8 |
| **AC-ATT-03B-PAY-OUT** | Any cite | This seat | **OUT invent** — claim PAY DONE = **FAIL** | O11 |
| **AC-ATT-03B-PRINTABLE** | Honesty | Any seal | printable **false RETAIN** · flip = **FAIL** | O11/O12 |
| **AC-ATT-03B-NO-SEED** | Empty calendar | UF evidence | CTA / hướng dẫn · **no** seed | O12 · U65 |
| **AC-ATT-03B-MK-ATT01** | Any evidence | Diff ATT-01 | CAT/CNS RETAIN · Nest `/core` 0 · ≠ catalog=DONE · R-ATT-01-ASSIGN **open** · **DENY invent ASSIGN** · **no** reopen J-HRM-ATT-01 · **≠** claim ATT-01 DONE | O8 · `ATT01QC1-MSLZ3KIM` |
| **AC-ATT-03B-MK-ATT11** | Any evidence | Diff ATT-11 | signatures\|close\|reopen RETAIN · ≠ LIVE=DONE · R-ATT-11-WF/CSUM HOLD · **no** reopen J-HRM-ATT-11 · **≠** claim ATT-11 DONE | O8 · `ATT11QC1-MSLXTH9P` |
| **AC-ATT-03B-MK-ATT10** | Any evidence | Diff ATT-10 | AGG+submit RETAIN · ≠ AGG=DONE · HOL/MEAL OUT · R-ATT-10-DISP HOLD · **no** reopen J-HRM-ATT-10 · **≠** claim ATT-10 DONE | O8 · `ATT10QC1-MSLWGUYH` |
| **AC-ATT-03B-MK-ATT09** | Any evidence | Diff ATT-09 | hold/settle · pending_days · DENY `att_leave_hold` · **no** reopen J-HRM-ATT-09 · **≠** claim ATT-09 DONE | O8 · `ATT09QC1-MSLUTL9D` |
| **AC-ATT-03B-MK-ATT08** | Any evidence | Diff ATT-08 | preview · T6→T2=2 · HOL-MISS · ALIGN · thin HOL peer ≠ ATT-03b DONE · **no** reopen J-HRM-ATT-08 · **≠** claim ATT-08 DONE | O6/O8 · `ATT08QC1-MSLSL36C` |
| **AC-ATT-03B-MK-ATT02** | Any evidence | Diff ATT-02 | CFG≠DONE · ≠ ATT UAT · Nest `/core` ATT 0 · **no** reopen J-HRM-ATT-02 · **≠** claim ATT-02 DONE | O8 · `ATT02QC1-MSLQZUK7` |
| **AC-ATT-03B-MK-PLT** | Any evidence | Diff PLT-01 | peer≠PLT DONE · merge≠platform UAT · **no** reopen J-HRM-PLT-01 · **≠** claim PLT DONE | O8 · `PLT01QC1-MSLPUQIU` |
| **AC-ATT-03B-MK-10** | Any evidence | Diff CORE-10 | catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · PAY-06 OUT · **no** reopen J-HRM-CORE-10 · **≠** claim CORE-10 DONE | O8 · `CORE10QC1-MSLP0EJB` |
| **AC-ATT-03B-MK-09** | Any evidence | Diff CORE-09 | printable **false** · 09a–d≠DONE · registry≠DONE · **no** reopen J-HRM-CORE-09 · **≠** claim CORE-09 DONE · **≠** Word invent | O8 · `CORE09QC1-MSLNBA89` |
| **AC-ATT-03B-MK-07** | Any evidence | Diff CORE-07 | GATE **409** · ACT-**400** · Nest `/core` **0** · checklist≠DONE · free PATCH≠DONE · **no** reopen J-HRM-CORE-07 · **≠** claim CORE-07 DONE | O8 · `CORE07QC1-KZJTSHNT` |
| **AC-ATT-03B-MK-06** | Any evidence | Diff CORE-06 | soft≠DONE · Nest `/core` 0 · **≠** claim soft=CORE-06 DONE | O8 |
| **AC-ATT-03B-H** | Evidence footer | Any seal | attendance/personnel/printable/recruitment/jd **false** · C-SLICE · **printable false RETAIN** · **DENY** thin=ATT-03b DONE · catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · ATT UAT · invent ASSIGN · invent `att_leave_hold` · PAY/printable/Word DONE · Nest DENY · no reopen seals | O8/O11/O12 |

### 3.2 Scope ladder (U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + HCNS | Holiday year CRUD across rollup membership | Cross-CT mutate without membership |
| **Member CEO / HRBP / HCNS** | Chỉ pháp nhân membership | list ≠ get ≠ put resolver |
| **No holiday admin right** | Deny mutate holiday-calendars | Silent 2xx |

**Invariant ATT-03B-SCOPE-U19:** holiday-calendars list **=** get-by-year **=** put **same** hrm list-scope family.

**Prerequisite:** ATT-01 seal RETAIN (`ATT01QC1-MSLZ3KIM` · ≠ catalog=DONE · R-ATT-01-ASSIGN open) · ATT-11 (`ATT11QC1-MSLXTH9P` · ≠ LIVE=DONE) · ATT-10 (`ATT10QC1-MSLWGUYH` · ≠ AGG=DONE · HOL/MEAL OUT) · ATT-09 (`ATT09QC1-MSLUTL9D` · DENY `att_leave_hold`) · ATT-08 (`ATT08QC1-MSLSL36C` · HOL-MISS) · ATT-02 (`ATT02QC1-MSLQZUK7` · CFG≠DONE) · PLT-01 · CORE-10/09/07 · soft≠CORE-06 · **không** seed · honesty flags false.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-03b DONE** · Nest `/core` DENY · C-SLICE

---

## 4. Diễn biến FE U65 (browser matrix — narrow ATT-03b)

```text
Login (ceo@xe.vn / member HCNS)
  → /hr Nhân sự → Cài đặt chấm công / Lịch lễ · Tết (narrow admin residual)
  → (Pos ADMIN) Mở lịch năm N → Thêm ngày dương + tên VI → Lưu
       → Assert Network PUT …/attendance/holiday-calendars/:year **2xx** · Nest /core = 0 · no seed
       → Assert FE list cập nhật · thin PUT alone ≠ ATT-03b DONE
  → (Pos LUNAR) Thêm ngày âm / calendar_type=lunar → Lưu → F5 còn lunarFlag
       → Assert FAIL nếu chỉ hardcode dương VN không cấu hình âm (BR-BP-HOL-01)
  → (Pos TYPE) Chọn loại nghỉ/trực + is_paid → Lưu · display dayTypeLabelVi · ≠ invent PAY DONE
  → (Pos PUB XOR) Publish draft **hoặc** replace-in-place GĐ1 + mid-year recalc pending leave (footer XOR)
  → (Neg HOL-MISS peer) Năm chưa có lịch → Đơn nghỉ → chặn nộp HRM-LEAVE-HOL-MISSING · ≠ ATT-03b DONE alone
  → (Pos CNS-SHEET-OUT) Sheet HOL deepen **OUT GĐ1** · ≠ AGG=ATT-10 DONE
  → Soft-archive năm (nếu residual) → ẩn picker · history intact
  → F5 → lịch còn · Nest /core 0
  → Footer: ≠ ATT-03b DONE
       · thin year PUT ≠ FR-03b DONE
       · ≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN
       · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE
       · ≠ soft/ATT-08=ATT-09 DONE · DENY invent att_leave_hold
       · ≠ ATT module UAT · attendance_uat_ready=false
       · CFG≠ATT-02 DONE · printable false RETAIN · PAY OUT invent DONE
       · must_keep ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH
         · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7
         · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT
       · soft≠CORE-06 DONE · honesty false · no reopen seals
```

**cấm:** `pnpm seed:*` · API seed holiday · DB fake · PASS chỉ curl · Nest `/core` dual · wipe ATT-01/11/10/09/08 · claim thin=FR-03b DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · invent ASSIGN DONE · invent `att_leave_hold` · invent PAY/printable/Word · claim ATT module UAT · reopen sealed J-*.

### VAL pack (mint)

| VAL-ID | Expect | Maps |
|--------|--------|------|
| **VAL-ATT-03B-01** | Admin CRUD solar year · Lưu/F5 · Nest `/core` 0 · no seed · ≠ thin=DONE | AC-ATT-03B-SOT/ADMIN/F5/PATH/≠-THIN · O1/O5/O7 |
| **VAL-ATT-03B-02** | Lunar config · FAIL solar-hardcode-only | AC-ATT-03B-LUNAR/FAIL-SOLAR · O2 |
| **VAL-ATT-03B-03** | Day type + is_paid display · ≠ PAY invent | AC-ATT-03B-TYPE/PAID · O3 |
| **VAL-ATT-03B-04** | Publish XOR replace + mid-year recalc | AC-ATT-03B-PUB/MIDYEAR · O4 |
| **VAL-ATT-03B-05** | HOL-MISS chặn nộp · sheet HOL OUT GĐ1 · ≠ AGG=DONE · ≠ ATT-03b DONE alone | AC-ATT-03B-CNS-*/≠-AGG10 · O6 |
| **VAL-ATT-03B-06** | F5 + seals · ≠DONE · printable false · PAY OUT · ATT-01..CORE RETAIN · DENY ASSIGN/`att_leave_hold` · honesty | AC-ATT-03B-F5/≠-*/H/MK-* · O8/O9/O10/O11/O12 |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-03b DONE** · Nest `/core` DENY · C-SLICE

---

## 5. Journeys DRAFT (O12)

| J-ID | Layer | Title | Click path (draft) | Pass when |
|------|-------|-------|--------------------|-----------|
| **J-HRM-ATT-03B-01** | **admin** | **CRUD lịch năm dương** | Login → Lịch lễ/Tết → năm N → thêm ngày dương + tên → Lưu · F5 · Nest `/core` 0 · no seed · ≠ thin PUT = ATT-03b DONE | AC-ATT-03B-SOT/ADMIN/F5/PATH/≠-THIN · O1/O5/O7 · U65 · **DRAFT** |
| **J-HRM-ATT-03B-02** | **lunar** | **Âm cấu hình năm · FAIL solar-only** | Thêm ngày âm / `calendar_type=lunar` → Lưu · assert FAIL soft-OK solar-hardcode-only · Nest `/core` 0 | AC-ATT-03B-LUNAR/FAIL-SOLAR · O2 · BR-BP-HOL-01 · U65 · **DRAFT** |
| **J-HRM-ATT-03B-03** | **type** | **Loại ngày + is_paid** | Chọn nghỉ\|trực + is_paid → Lưu · display dayTypeLabelVi · ≠ invent PAY DONE · Nest `/core` 0 | AC-ATT-03B-TYPE/PAID · O3 · U65 · **DRAFT** |
| **J-HRM-ATT-03B-04** | **publish** | **Publish XOR mid-year** | Publish draft **hoặc** replace GĐ1 + mid-year recalc pending leave · Nest `/core` 0 | AC-ATT-03B-PUB/MIDYEAR · O4 · U65 · **DRAFT** |
| **J-HRM-ATT-03B-05** | **consumer** | **HOL-MISS peer · sheet OUT** | Năm ABSENT → Đơn nghỉ **chặn nộp** · sheet HOL OUT GĐ1 · Nest `/core` 0 · ≠ ATT-03b DONE alone · ≠ AGG=ATT-10 DONE | AC-ATT-03B-CNS-*/≠-AGG10 · O6 · U65 · **DRAFT** |
| **J-HRM-ATT-03B-06** | **cross** | **F5 + seals · ≠DONE** | F5 còn lịch · soft-archive cite · Nest `/core` 0 · ≠ ATT-03b DONE · thin ≠ FR-03b · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 · peer≠PLT · merge≠UAT · printable false · PAY OUT · DENY invent ASSIGN · DENY invent `att_leave_hold` · ATT-01 `ATT01QC1-MSLZ3KIM` · ATT-11 `ATT11QC1-MSLXTH9P` · ATT-10 `ATT10QC1-MSLWGUYH` · ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 GATE/ACT-400/Nest DENY · soft≠CORE-06 DONE · no reopen J-ATT-01/11/10/09/08/02/PLT/CORE-10/09/07/06/05/03/02B/09D..01 · ≠ invent PAY/Word | AC-ATT-03B-F5/≠-*/H/MK-* · O8/O9/O10/O11/O12 · U19 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `attendance_uat_ready` · **≠** `hrm_personnel_uat_ready` · **≠** `contracts_printable_ready` · **≠** claim thin = ATT-03b DONE · **≠** claim catalog=ATT-01 DONE · **≠** claim LIVE=ATT-11 DONE · **≠** claim AGG=ATT-10 DONE · **≠** claim ATT module UAT · **≠** invent PAY DONE · **narrow ≠ full ATT/PAY module**.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-ATT-01-01..06** / `ATT01QC1-MSLZ3KIM` | must_keep ≠ catalog=DONE · R-ATT-01-ASSIGN **open** · DENY invent ASSIGN · Nest `/core` 0 · **≠** claim ATT-01 DONE |
| **J-HRM-ATT-11-01..06** / `ATT11QC1-MSLXTH9P` | must_keep ≠ LIVE=DONE · R-ATT-11-WF/CSUM HOLD · **≠** claim ATT-11 DONE |
| **J-HRM-ATT-10-01..06** / `ATT10QC1-MSLWGUYH` | must_keep ≠ AGG=DONE · HOL/MEAL OUT · R-ATT-10-DISP HOLD · **≠** claim ATT-10 DONE |
| **J-HRM-ATT-09-01..06** / `ATT09QC1-MSLUTL9D` | must_keep pending_days · DENY `att_leave_hold` · **≠** claim ATT-09 DONE |
| **J-HRM-ATT-08-01..06** / `ATT08QC1-MSLSL36C` | must_keep HOL-MISS · thin HOL peer ≠ ATT-03b DONE · **≠** claim ATT-08 DONE |
| **J-HRM-ATT-02-01..06** / `ATT02QC1-MSLQZUK7` | must_keep CFG≠DONE · ≠ ATT UAT · **≠** claim ATT-02 DONE |
| **J-HRM-PLT-01-01..06** / `PLT01QC1-MSLPUQIU` | must_keep peer≠PLT DONE · merge≠platform UAT |
| **J-HRM-CORE-10/09/07/06…** | must_keep · printable **false** · soft≠DONE · Nest `/core` DENY |
| Thin HOL LIVE / ATT-08 HOL-MISS | **RETAIN cite** · **≠** ATT-03b DONE alone · PAY **OUT invent DONE** |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-03b DONE** · Nest `/core` DENY · C-SLICE · `attendance_uat_ready=false`

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `attendance_uat_ready` | **false** · **DENY** flip |
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** · **DENY** flip |
| `contracts_printable_ready` | **false RETAIN** · **DENY** flip |
| `hrm_personnel_uat_ready` | **false** · **DENY** flip |
| Claim thin year PUT alone = ATT-03b / FR-03b DONE | **DENIED** (O1/O12) |
| Claim catalog = ATT-01 DONE | **DENIED** (O8) · R-ATT-01-ASSIGN **open** |
| Claim LIVE sign/close = ATT-11 DONE | **DENIED** (O8) |
| Claim AGG = ATT-10 DONE / invent sheet HOL DONE | **DENIED** (O6/O8) |
| Claim soft/ATT-08 = ATT-09 DONE | **DENIED** · DENY invent `att_leave_hold` |
| Claim ATT module UAT | **DENIED** (O12) · C-SLICE |
| Claim CFG = ATT-02 DONE | **DENIED** (O8) |
| Claim PLT-01 / platform UAT DONE | **DENIED** |
| Claim CORE-10/09/07 DONE / printable flip | **DENIED** |
| Claim soft = CORE-06 DONE | **DENIED** |
| Invent ASSIGN DONE | **DENIED** · R-ATT-01-ASSIGN **open** |
| Invent `att_leave_hold` | **DENIED** |
| Claim PAY DONE | **DENIED** · **OUT invent** |
| Nest `/core` dual | **DENIED** |
| Wipe ATT-01/11/10/09/08/02/PLT/CORE | **DENIED** |
| C-SLICE | GWC later ≠ module ATT/PLT/CORE/PAY/personnel UAT ≠ Phase1 |
| must_keep W30 | ATT-01 `ATT01QC1-MSLZ3KIM` · ≠ catalog=DONE · ASSIGN open · Nest `/core` 0 |
| must_keep W29 | ATT-11 `ATT11QC1-MSLXTH9P` · ≠ LIVE=DONE |
| must_keep W28 | ATT-10 `ATT10QC1-MSLWGUYH` · ≠ AGG=DONE · HOL/MEAL OUT · DISP HOLD |
| must_keep W27 | ATT-09 `ATT09QC1-MSLUTL9D` · pending_days · DENY `att_leave_hold` |
| must_keep W26 | ATT-08 `ATT08QC1-MSLSL36C` · HOL-MISS · thin HOL ≠ ATT-03b DONE |
| must_keep W25 | ATT-02 `ATT02QC1-MSLQZUK7` · CFG≠DONE |
| must_keep W24..W10 | PLT-01 · CORE-10/09/07 · soft≠CORE-06 · CORE-05/03/02b/09d..01 |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-ATT-01/11/10/09/08/02/PLT/CORE-* |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (ADD residual only if closable gap for `lunar_flag`/`calendar_type` / `is_paid`/day type / `status` publish on LIVE `att_holiday_*`) · then **sa API** F.1 F-ATT-HOL-01 physical `/attendance/*` |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md` |
| **ba_trace** | `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` §54 |
| **completion_report** | See §7.1 |
| **next_dispatch_prompt** | See §7.2 |

### 7.1 completion_report

**Closed:** BA AC pack O1–O12 **CONFIRMED** for UC-BP-ATT-03b / FR-UC-BP-ATT-03b against SA Option A: RETAIN LIVE thin Nest `GET/PUT /api/hrm/attendance/holiday-calendars/:year` + ATT-08 HOL-MISS peer; unlock residuals LUNAR/TYPE/PUB/ADMIN/CNS/DISP/≠DONE; AC-ATT-03B-* + VAL-ATT-03B-01..06; mint **J-HRM-ATT-03B-01..06 DRAFT** (U65); ba-data **HOLD default**; explicit **≠ ATT-03b DONE** from thin PUT alone · **≠ catalog=ATT-01 DONE** · **≠ LIVE=ATT-11 DONE** · **≠ AGG=ATT-10 DONE** · **≠ ATT module UAT** · printable **false** · **C-SLICE** · **PAY OUT** · DENY invent ASSIGN · DENY invent `att_leave_hold` · Nest `/core` DENY · must_keep ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT/CORE · soft≠CORE-06 · apps/** untouched · no seed.

**Residual (open — not this seat):** ba-data prove closable cols for lunar/type/publish · sa API F.1 deepen · Dev-FE admin screen · Dev-BE residual wire · QA U65 J-* · QC GWC C-SLICE · R-ATT-01-ASSIGN still **open** · sheet HOL OUT GĐ1 · ATT module UAT **false**.

### 7.2 next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-DATA-01
role: ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-31 seat #33)
entry_criteria: BA-01 O1–O12 CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md · SA-01 Option A LOCKED @ docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01.md · depends ATT01QC1-MSLZ3KIM · must_keep ATT-01 CAT/CNS RETAIN (≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN DONE · Nest /core 0) · ATT11QC1-MSLXTH9P (≠ LIVE=ATT-11 DONE) · ATT10QC1-MSLWGUYH (≠ AGG=ATT-10 DONE · HOL/MEAL OUT · R-ATT-10-DISP P2 HOLD) · ATT09QC1-MSLUTL9D (pending_days · DENY att_leave_hold) · ATT08QC1-MSLSL36C (HOL-MISS · thin HOL peer ≠ ATT-03b DONE) · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ≠ ATT UAT · PAY invent DONE OUT · printable false
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md (O1–O12 · R-ATT-03B-* · ba-data HOLD default · AC-ATT-03B-* · J-HRM-ATT-03B-*)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01.md (Option A · LIVE thin F-ATT-HOL · residuals)
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §4.3 att_holiday_calendar + att_holiday_day (lunar_flag · is_paid · status)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-HOL-01
  - apps/api/hrm-api/src/attendance/att-holiday-calendar.service.ts (LIVE thin — read-only cite · ≠ ATT-03b DONE)
exit_criteria:
  - ba-data HOLD default stamp (ADD residual ONLY if proves closable typed gap on LIVE att_holiday_* for lunar_flag/calendar_type and/or is_paid/day type and/or status publish — prefer extend LIVE tables · DENY second mega holiday table · DENY Nest /core)
  - Explicit ≠ ATT-03b DONE from thin year alone · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT · DENY invent att_leave_hold · DENY invent ASSIGN DONE · sheet HOL OUT GĐ1 cite
  - evidence: docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-DATA-01.md
  - ack_status PASS_TO_PM · next_owner=sa (API-01 F.1 RETAIN cite F-ATT-HOL-01 physical /attendance/* · wire residual ONLY if DATA proved closable)
cấm: apps/** · seed · Nest /core invent · invent att_leave_hold dual · invent ASSIGN DONE · wipe ATT-01/11/10/09/08/02/PLT/CORE · honesty flip · claim thin HOL=ATT-03b DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT module UAT · invent PAY/printable DONE · invent second holiday SoT
```

---

## Explicit locks (footer)

**≠ ATT-03b DONE · ≠ ATT module UAT · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · printable false · C-SLICE · PAY OUT · R-ATT-01-ASSIGN open · DENY invent ASSIGN · DENY invent `att_leave_hold` · Nest `/core` DENY · soft≠CORE-06 · CFG≠ATT-02 · ATT-08 HOL-MISS RETAIN · sheet HOL OUT GĐ1 · apps/** cấm this seat.**
