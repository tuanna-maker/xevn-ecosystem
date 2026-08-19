# PO-HRM-MVP-GD1-ATT-03B-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN LIVE att_holiday_* thin year + residual ADD lunar/type/publish (Option A · ba-data)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03B-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-31 seat **#33**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE thin `public.att_holiday_calendar` + `public.att_holiday_day` year GET/PUT spine · **RESIDUAL ADD stamped closable** for **`lunar_flag` / `calendar_type` · `is_paid` / day type · calendar `status`/publish** on LIVE tables only — prefer **extend** LIVE `att_holiday_*` — **NO migrate invent this seat** · **DENY** second mega holiday table · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** invent ASSIGN DONE · **NO** wipe ATT-01/11/10/09/08/02/PLT/CORE · **NO** wipe soft≠CORE-06 DONE · **NO** invent PAY / printable / Word DONE · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — LIVE thin year holiday SoT **RETAIN** · lunar/type/publish typed cols **ABSENT PROVEN** → residual **ADD stamped closable** · ATT-08 HOL-MISS **RETAIN** · sheet HOL **OUT GĐ1** · unlock **sa API-01** F.1 **F-ATT-HOL-01** physical `/api/hrm/attendance/holiday-calendars*` — residual wire **ONLY if** closable · **PAY OUT invent DONE** · **printable false RETAIN** · **≠ ATT-03b DONE** from thin year alone · **≠ catalog=ATT-01 DONE** · **≠ LIVE=ATT-11 DONE** · **≠ AGG=ATT-10 DONE** · **≠ ATT module UAT** · **CFG≠ATT-02 DONE** · **C-SLICE** · **R-ATT-01-ASSIGN open** |
| **uc_ids** | `UC-BP-ATT-03b` · `FR-UC-BP-ATT-03b` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01.md) · **R-ATT-03B-LUNAR/TYPE/PUB/ADMIN/CNS/DISP/≠DONE** · printable false · QC ATT-01 **`ATT01QC1-MSLZ3KIM`** (≠ catalog=DONE · **R-ATT-01-ASSIGN open** · DENY invent ASSIGN) · must_keep ATT-11 **`ATT11QC1-MSLXTH9P`** (≠ LIVE=DONE) · ATT-10 **`ATT10QC1-MSLWGUYH`** (≠ AGG=DONE · HOL/MEAL OUT · R-ATT-10-DISP P2 HOLD) · ATT-09 **`ATT09QC1-MSLUTL9D`** (pending_days · DENY `att_leave_hold`) · ATT-08 **`ATT08QC1-MSLSL36C`** (HOL-MISS · thin HOL peer ≠ ATT-03b DONE) · ATT-02 **`ATT02QC1-MSLQZUK7`** CFG≠DONE · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** printable false · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · PAY invent DONE **OUT** |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md) · O1–O12 · AC-ATT-03B-* · R-ATT-03B-* |
| **ref_att01_data** | [`PO-HRM-MVP-GD1-ATT-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-01-CLUSTER-DATA-01.md) — stamp `ATT01QC1-MSLZ3KIM` · ≠ catalog=DONE · R-ATT-01-ASSIGN **open** |
| **ref_att11_data** | [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md) — stamp `ATT11QC1-MSLXTH9P` · ≠ LIVE=ATT-11 DONE |
| **ref_att10_data** | [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md) — stamp `ATT10QC1-MSLWGUYH` · ≠ AGG=DONE · HOL/MEAL OUT |
| **ref_att09_data** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md) — stamp `ATT09QC1-MSLUTL9D` · DENY `att_leave_hold` |
| **ref_att08_data** | [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md) — stamp `ATT08QC1-MSLSL36C` · HOL-MISS · thin HOL ≠ ATT-03b DONE |
| **ref_att02_data** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md) — stamp `ATT02QC1-MSLQZUK7` · CFG≠DONE |
| **ref_plt_data** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md) — stamp `PLT01QC1-MSLPUQIU` |
| **ref_core10_data** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md) — stamp `CORE10QC1-MSLP0EJB` |
| **ref_core09_data** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md) — printable **false** · ≠ CORE-09 DONE |
| **ref_core07_data** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md) — GATE/ACT · Nest `/core` DENY |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.3** `att_holiday_calendar` (`id`·`company_id`·`year`·`name`·`status`) + `att_holiday_day` (`calendar_id`·`holiday_date`·`name`·`is_paid`·`lunar_flag`) · Nest `@Controller('core')` **ABSENT** · paper `/att` + `/core` **alias only** |
| **ref_paper_api** | **F-ATT-HOL-01** · peer **F-ATT-LEAVE-01** (ATT-08 HOL-MISS) · Nest `@Controller('core')` **ABSENT** · paper `PUT /api/hrm/att/holiday-calendars/{year}` + `/core` **alias only** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-03b** · Diễn biến **#1–#2 + Thành công** · **BR-BP-HOL-01** · partner **REQ_CC_001** · peer FR-UC-BP-ATT-08 holiday input |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/holiday-calendars*` · paper `/att/*` + `/core` **alias only** · U19 · soft-delete · **DENY** Nest `/core` dual |
| **ref_code_cite** | `att-holiday-calendar.service.ts` `ensureSchema` → LIVE `att_holiday_calendar` + `att_holiday_day` · `GET/PUT …/holiday-calendars/:year` thin `{date,nameVi}` · `assertHolidayYearsPresent` / `HRM-LEAVE-HOL-MISSING` · CODE-MEMORY **≠ ATT-03b DONE** · Nest `@Controller('core')` **ABSENT** — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim thin year PUT = ATT-03b DONE · **DENY** claim catalog=ATT-01 DONE · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** invent ASSIGN DONE · **DENY** invent `att_leave_hold` · honesty flip |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD** (+ residual ADD stamped closable)

| Decision | Stamp |
|----------|--------|
| **Holiday year SoT** | **HOLD RETAIN** — LIVE Nest **`GET/PUT /api/hrm/attendance/holiday-calendars/:year`** → **`public.att_holiday_calendar` + `public.att_holiday_day`** (**F-ATT-HOL-01 thin**) — **DENY** second mega holiday table · **DENY** Nest `/core` dual · **explicit ≠** FR-03b / ATT-03b DONE from thin PUT alone |
| **Soft-archive** | **HOLD RETAIN** — LIVE `att_holiday_calendar.archived_at` · hide year · history days intact · **≠** hard-delete default |
| **ATT-08 HOL-MISS peer** | **HOLD RETAIN** — `assertHolidayYearsPresent` · **`HRM-LEAVE-HOL-MISSING` CHẶN NỘP** · stamp **`ATT08QC1-MSLSL36C`** · **≠** ATT-03b DONE alone |
| **Sheet HOL/MEAL** | **OUT GĐ1** — cite ATT-10 HOL/MEAL OUT · stamp **`ATT10QC1-MSLWGUYH`** · **≠ AGG=ATT-10 DONE** · **≠** invent sheet HOL DONE |
| **R-ATT-03B-LUNAR** | **RESIDUAL ADD stamped closable** — paper `lunar_flag` +/or `calendar_type` solar\|lunar — **ABSENT PROVEN** on LIVE day/calendar (`ensureSchema` 2026-08-09) · prefer soft cols on LIVE `att_holiday_day` (+ optional calendar-level type) · **BR-BP-HOL-01** · **FAIL** solar-hardcode-only · **NO migrate this seat** · **DENY** Nest `/core` · **DENY** second holiday SoT |
| **R-ATT-03B-TYPE** | **RESIDUAL ADD stamped closable** — paper `is_paid` + day type nghỉ\|trực… — **ABSENT PROVEN** on LIVE `att_holiday_day` · prefer soft cols on LIVE day · display-ready `dayTypeLabelVi` · **≠** invent PAY DONE from `is_paid` alone · **NO migrate this seat** |
| **R-ATT-03B-PUB** | **RESIDUAL ADD stamped closable** — paper calendar `status` (draft\|effective…) **ABSENT PROVEN** on LIVE `att_holiday_calendar` · prefer soft col + mid-year recalc rule for pending leave **XOR** GĐ1 replace-in-place with **explicit** footer · **NO migrate this seat** · **DENY** silent mid-year without rule |
| **R-ATT-03B-ADMIN** | **HOLD** — FE bind after API residual · PRODUCT_MISSING · **≠** invent Nest `/core` UI · **≠** claim thin PUT = admin DONE |
| **R-ATT-03B-CNS / DISP / ≠DONE** | **HOLD** — leave HOL-MISS RETAIN · sheet HOL OUT · display-ready DTO cite §4 · honesty locks |
| Display-ready DTO | **Cite** §4 — year calendar display-ready (thin LIVE + residual optional fields) |
| Nest path | Physical `/api/hrm/attendance/holiday-calendars*` · Nest `@Controller('core')` **ABSENT** · paper `/att` + `/core` **alias only** |
| ATT-01 CAT/CNS | **must_keep** · stamp **`ATT01QC1-MSLZ3KIM`** · ≠ catalog=DONE · **R-ATT-01-ASSIGN open** · **DENY invent ASSIGN** · Nest `/core` 0 |
| ATT-11 sign/close | **must_keep** · stamp **`ATT11QC1-MSLXTH9P`** · ≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM HOLD |
| ATT-10 AGG/submit | **must_keep** · stamp **`ATT10QC1-MSLWGUYH`** · ≠ AGG=DONE · HOL/MEAL OUT · R-ATT-10-DISP P2 HOLD |
| ATT-09 hold/settle | **must_keep** · stamp **`ATT09QC1-MSLUTL9D`** · held=`pending_days` · **DENY** `att_leave_hold` |
| ATT-08 preview | **must_keep** · stamp **`ATT08QC1-MSLSL36C`** · HOL-MISS · thin HOL ≠ ATT-03b DONE |
| ATT-02 CFG | **must_keep** · stamp **`ATT02QC1-MSLQZUK7`** · **CFG≠ATT-02 DONE** · ≠ ATT UAT |
| PLT-01 | **must_keep** · stamp **`PLT01QC1-MSLPUQIU`** · peer≠PLT DONE · merge≠platform UAT |
| CORE-10 | **must_keep** · stamp **`CORE10QC1-MSLP0EJB`** · ≠ CORE-10 DONE |
| CORE-09 printable | **must_keep** · stamp **`CORE09QC1-MSLNBA89`** · printable **false** · ≠ CORE-09 DONE |
| CORE-07 GATE/ACT | **must_keep** · stamp **`CORE07QC1-KZJTSHNT`** · Nest DENY · soft≠CORE-06 DONE |
| PAY / printable / Word | **OUT invent DONE** · printable **false RETAIN** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim thin=ATT-03b DONE · catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · ATT UAT · soft/ATT-08=ATT-09 · CFG=ATT-02 · PLT/CORE DONE · invent ASSIGN / `att_leave_hold` |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| F-ATT-HOL-01 · `att_holiday_calendar` + `att_holiday_day` | LIVE **`public.att_holiday_*`** · **`GET/PUT /api/hrm/attendance/holiday-calendars/:year`** | **HOLD RETAIN** thin · **≠** ATT-03b DONE alone |
| Paper `year` / `name` | LIVE `calendar_year` · day `name_vi` (calendar `name` ABSENT) | **HOLD RETAIN** year · calendar `name` **HOLD** optional soft ADD (not FR blocker) |
| Paper `lunar_flag` · `calendar_type` | Prefer soft cols on LIVE **`att_holiday_day`** (+/or calendar) | **RESIDUAL ADD stamped** · ABSENT PROVEN · **NO migrate this seat** |
| Paper `is_paid` · loại ngày | Prefer soft cols on LIVE **`att_holiday_day`** | **RESIDUAL ADD stamped** · ABSENT PROVEN · **≠ PAY invent** |
| Paper calendar `status` | Prefer soft col on LIVE **`att_holiday_calendar`** | **RESIDUAL ADD stamped** · ABSENT PROVEN · XOR mid-year rule |
| Soft-archive | LIVE **`archived_at`** | **HOLD RETAIN** |
| F-ATT-LEAVE-01 HOL-MISS | LIVE assert years · **`HRM-LEAVE-HOL-MISSING`** | **HOLD RETAIN** · must_keep ATT-08 |
| Sheet HOL deepen | ATT-10 aggregate | **OUT GĐ1** · ≠ AGG=DONE |
| Paper held / `att_leave_hold` | LIVE **`employee_leave_balances.pending_days`** (ATT-09) | **must_keep** · **DENY invent dual** |
| Nest `/core` holiday table | — | **DENY invent** |
| Paper `/core` / `/att` | Alias only | **DENY** Nest dual SoT |
| ATT-01/11/10/09/08/02/PLT/CORE peers | seals | **must_keep** · ≠ claim DONE · DENY invent ASSIGN |

```text
  public.att_holiday_calendar (LIVE — HOLD RETAIN · ONE year SoT · ≠ FR-03b DONE alone)
        RETAIN: id · company_id TEXT · calendar_year · archived_at · created_at · updated_at
        ABSENT PROVEN: name · status (paper §4.3) · calendar_type
        RESIDUAL ADD (stamped closable — NO migrate this seat):
          prefer status (draft|effective…) and/or calendar_type solar|lunar
          DENY Nest /core dual · DENY second mega holiday table
                │
                │ Physical API (HOLD RETAIN + residual deepen)
                ▼
  GET/PUT /api/hrm/attendance/holiday-calendars/:year
  Paper PUT /api/hrm/att/holiday-calendars/{year} + /core/… = ALIAS ONLY

  public.att_holiday_day (LIVE — HOLD RETAIN thin days)
        RETAIN: id · calendar_id FK · holiday_date · name_vi · created_at
        ABSENT PROVEN: lunar_flag · is_paid · day_type (nghỉ|trực…)
        RESIDUAL ADD (stamped closable — NO migrate this seat):
          prefer lunar_flag BOOLEAN · is_paid BOOLEAN · day_type TEXT open
          (+/or calendar_type on day if not on calendar)
          UQ RETAIN (calendar_id, holiday_date)
                │
  ATT-08 assertHolidayYearsPresent · HRM-LEAVE-HOL-MISSING
        HOLD RETAIN · stamp ATT08QC1-MSLSL36C · ≠ ATT-03b DONE alone
  Sheet HOL/MEAL deepen
        OUT GĐ1 · stamp ATT10QC1-MSLWGUYH · ≠ AGG=ATT-10 DONE

  Display-ready year DTO (cite · HOLD schema deepen until Dev after API):
        id · companyId · year · status? · statusLabelVi? ·
        days[{ date, nameVi, lunarFlag?, calendarType?, isPaid?, dayTypeLabelVi? }] ·
        dayCount · updatedAt · createdAt?
        labels VI: *Lịch lễ năm* / *Ngày âm* / *Có lương* / *Loại ngày* / *Trạng thái phát hành*

  ATT01QC1-MSLZ3KIM ≠ catalog=DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN
  ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D DENY att_leave_hold
  ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE
  PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false
  CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY
        SEALED must_keep

  FORBIDDEN GĐ1 this seat:
        Wipe LIVE att_holiday_* · Nest /core dual · second mega holiday table
        Invent att_leave_hold · invent ASSIGN DONE · invent PAY/printable/Word DONE
        Claim thin year PUT = ATT-03b / FR-03b DONE
        Claim catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · ATT module UAT
        Claim soft/ATT-08=ATT-09 · CFG=ATT-02 · PLT/CORE DONE
        Invent sheet HOL DONE · honesty flip · reopen sealed J-* · seed · apps/**
```

**Label lock:** Board «Lịch lễ / Tết (dương + âm)» GĐ1 = **LIVE thin year RETAIN** + **lunar/type/publish residual ADD stamped on LIVE `att_holiday_*`** — **not** Nest `/core` dual · **not** thin PUT = FR-03b DONE · **not** ATT module UAT.  
**Spine lock:** Physical `/api/hrm/attendance/holiday-calendars*` — **DENY** Nest `/core` second SoT · paper `/att`+`/core` alias only.  
**Gap lock:** `lunar_flag` / `is_paid` / day type / calendar `status` **ABSENT PROVEN** → residual **ADD stamped** · **HOLD invent migrate** until sa API F.1 + Dev unlock.  
**Honesty lock:** `attendance_uat_ready=false` · printable false · C-SLICE · PAY OUT · ≠ ATT-03b DONE · R-ATT-01-ASSIGN **open**.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-03b DONE** · thin year PUT ≠ FR-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · ≠ soft/ATT-08=ATT-09 DONE · ≠ CFG=ATT-02 DONE · PAY OUT invent DONE · DENY invent ASSIGN · DENY invent `att_leave_hold` · must_keep ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · no apps/**

---

## 3. LIVE prove — ABSENT / PRESENT (read-only cite)

| Object | LIVE prove (2026-08-09) | Verdict |
|--------|-------------------------|---------|
| `att_holiday_calendar` | `ensureSchema` CREATE: `id`·`company_id`·`calendar_year`·`archived_at`·`created_at`·`updated_at` | **PRESENT** thin · **HOLD RETAIN** |
| `att_holiday_day` | `ensureSchema` CREATE: `id`·`calendar_id`·`holiday_date`·`name_vi`·`created_at` · UQ `(calendar_id,holiday_date)` | **PRESENT** thin · **HOLD RETAIN** |
| `GET/PUT …/holiday-calendars/:year` | Nest attendance controller + service | **PRESENT** · body days `{date,nameVi}` only |
| Display DTO | `AttHolidayCalendarDisplay` = `{id,companyId,year,days[{date,nameVi}],dayCount,updatedAt,createdAt}` | **PRESENT thin** · residual fields **ABSENT** |
| `lunar_flag` / `calendar_type` | **0** cols in ensureSchema / SELECT / INSERT | **ABSENT PROVEN** → **ADD stamped closable** |
| `is_paid` / day type | **0** cols | **ABSENT PROVEN** → **ADD stamped closable** |
| calendar `status` / version | **0** cols · replace-in-place DELETE+INSERT days only | **ABSENT PROVEN** → **ADD stamped closable** (XOR mid-year rule wire) |
| `archived_at` | PRESENT on calendar | **HOLD RETAIN** soft-archive |
| HOL-MISS | `HRM_LEAVE_HOL_MISSING` · assert years | **PRESENT** · **HOLD RETAIN** peer ATT-08 |
| Nest `@Controller('core')` holiday | ABSENT | **DENY invent** |
| Second mega holiday table | — | **DENY invent** |
| `att_leave_hold` | — | **DENY invent** (ATT-09 pending_days) |
| Sheet HOL writer | ATT-10 HOL/MEAL OUT | **OUT GĐ1** · ≠ invent DONE |
| FE admin Lịch lễ | PRODUCT_MISSING (HOL-MISS msg only) | **HOLD** after API · **≠** claim thin=admin DONE |

**Paper §4.3 map → LIVE residual (prefer extend):**

| Paper col | LIVE target | ba-data |
|-----------|-------------|---------|
| calendar.`status` | `att_holiday_calendar.status` TEXT | **ADD stamped** |
| day.`lunar_flag` | `att_holiday_day.lunar_flag` BOOLEAN | **ADD stamped** |
| day.`is_paid` | `att_holiday_day.is_paid` BOOLEAN | **ADD stamped** |
| (SRS) calendar_type / loại ngày | soft TEXT on day and/or calendar | **ADD stamped** |
| calendar.`name` | optional soft TEXT | **HOLD** (not FR blocker if year SoT intact) |
| Soft-archive | LIVE `archived_at` | **RETAIN** |

---

## 4. Display-ready DTO (year calendar — normative cite)

| Field | Source | GĐ1 note |
|-------|--------|----------|
| `id` | LIVE calendar.id | RETAIN |
| `companyId` | LIVE company_id | U19 same resolver list=get=put |
| `year` | LIVE calendar_year | RETAIN |
| `status?` | residual ADD | draft\|effective… · optional until wire |
| `statusLabelVi?` | derive VI | display-ready |
| `days[]` | LIVE + residual | `date` · `nameVi` RETAIN |
| `days[].lunarFlag?` | residual ADD | BR-BP-HOL-01 |
| `days[].calendarType?` | residual ADD | solar\|lunar |
| `days[].isPaid?` | residual ADD | **≠** invent PAY DONE |
| `days[].dayTypeLabelVi?` | residual ADD | nghỉ\|trực… |
| `dayCount` | LIVE | RETAIN |
| `updatedAt` / `createdAt?` | LIVE | RETAIN |

**Peer RETAIN:** ATT-08 HOL-MISS response codes · **sheet HOL OUT GĐ1** (no sheet HOL display invent this seat).

---

## 5. Validation / error mapping (RETAIN + residual assert)

| Condition | Rule | Expected |
|-----------|------|----------|
| Duplicate `holiday_date` in year PUT | UQ `(calendar_id, holiday_date)` | **`HRM-VAL-400`** |
| Invalid year | LIVE guard 2000–2100 | **`HRM-VAL-400`** |
| Year holiday ABSENT on leave path | ATT-08 assert | **`HRM-LEAVE-HOL-MISSING`** CHẶN NỘP · ≠ ATT-03b DONE alone |
| Out-of-scope company | U19 list=get=put | **`HRM-SCOPE-409`** |
| Solar-hardcode-only claim = FR-03b DONE | BR-BP-HOL-01 | **FAIL AC** · residual lunar required |
| Nest `/core/**` as holiday SoT | O7 | **FAIL** |
| Thin PUT PASS alone = ATT-03b DONE | O1/O12 | **FAIL** |
| Invent `att_leave_hold` / ASSIGN DONE | O8 | **FAIL** |
| Invent PAY/printable DONE | O11 | **FAIL** |

---

## 6. Scope parity (U19)

| Surface | Filter |
|---------|--------|
| GET year | `resolveHrmListScope` + `company_id` TEXT keys · `archived_at IS NULL` |
| PUT year | same persist company_id family |
| HOL-MISS year presence | same company key expansion |

**Invariant:** holiday-calendars list **=** get-by-year **=** put **same** hrm list-scope family — **scope_parity** FAIL if list returns year id but get 404 under group CEO `main`.

---

## 7. must_keep / DENY checklist

| Lock | Rule |
|------|------|
| **ATT01QC1-MSLZ3KIM** | RETAIN · ≠ catalog=ATT-01 DONE · **R-ATT-01-ASSIGN open** · **DENY invent ASSIGN** · Nest `/core` 0 |
| **ATT11QC1-MSLXTH9P** | RETAIN · ≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM HOLD |
| **ATT10QC1-MSLWGUYH** | RETAIN · ≠ AGG=ATT-10 DONE · HOL/MEAL OUT · R-ATT-10-DISP P2 HOLD |
| **ATT09QC1-MSLUTL9D** | RETAIN · pending_days · **DENY** `att_leave_hold` |
| **ATT08QC1-MSLSL36C** | RETAIN · HOL-MISS · thin HOL peer ≠ ATT-03b DONE |
| **ATT02QC1-MSLQZUK7** | RETAIN · **CFG≠ATT-02 DONE** · ≠ ATT UAT |
| **PLT01QC1-MSLPUQIU** | RETAIN · peer≠PLT DONE · merge≠platform UAT |
| **CORE10QC1-MSLP0EJB** | RETAIN · ≠ CORE-10 DONE |
| **CORE09QC1-MSLNBA89** | RETAIN · printable **false** · ≠ CORE-09 DONE |
| **CORE07QC1-KZJTSHNT** | RETAIN · GATE 409 · ACT-400 · Nest DENY |
| soft≠CORE-06 DONE | RETAIN |
| Nest `/core` | **DENY** dual |
| Thin HOL alone | **≠** ATT-03b DONE · **≠** ATT UAT |
| Second mega holiday table | **DENY** |
| PAY / printable | **OUT invent DONE** · printable false |
| apps/** / seed | **CẤM** this seat |
| Honesty | **DENY** flip · **C-SLICE** |

---

## 8. Traceability (BRD/SRS → API → DB → FE → Test)

| Requirement | API | DB | FE | Test expect |
|-------------|-----|----|----|-------------|
| FR-UC-BP-ATT-03b Diễn biến #1 | F-ATT-HOL-01 physical GET/PUT year | LIVE `att_holiday_*` RETAIN + residual lunar/type | Admin residual HOLD | J-HRM-ATT-03B-01 DRAFT · Nest `/core` 0 · ≠ thin=DONE |
| BR-BP-HOL-01 âm | residual wire lunarFlag/calendarType | ADD stamped day/calendar | Lunar labels | J-02 · FAIL solar-hardcode-only |
| Loại ngày / is_paid | residual PUT deepen | ADD stamped day | dayTypeLabelVi | J-03 · ≠ PAY invent |
| Publish / mid-year | residual status XOR replace+rule | ADD stamped status | PUB XOR footer | J-04 |
| HOL-MISS peer | F-ATT-LEAVE-01 | year presence | Leave chặn nộp | J-05 · ATT-08 seal |
| Sheet HOL | F-ATT-SHEET peer | OUT GĐ1 | — | J-05/06 · ≠ AGG=DONE |
| Soft-archive | PUT/archive path residual | LIVE `archived_at` | Hide picker | J-01/06 |
| U19 scope | same resolver | company_id TEXT | — | J-06 · 409 |
| ≠DONE / seals | — | must_keep | Footer honesty | J-06 · VAL-ATT-03B-06 |

---

## 9. Data quality risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev invents Nest `/core` holiday SoT | O7 DENY · QC Nest SoT 0 |
| Second mega holiday table | Prefer extend LIVE · DENY dual |
| Claim thin PUT = ATT-03b DONE | Footer ≠DONE · C-SLICE |
| Lunar hardcode national only | BR-BP-HOL-01 FAIL AC · residual ADD |
| PAY invent from `is_paid` | O11 OUT invent DONE |
| Wipe ATT-08 HOL-MISS | must_keep ATT08 |
| Invent ASSIGN / `att_leave_hold` | O8 DENY · R-ATT-01-ASSIGN open |
| Sheet HOL invent = AGG DONE | OUT GĐ1 · ATT10 seal |
| Migrate this DATA seat | **NO migrate** — stamp only · Dev after API |

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED HOLD** |
| **next_owner** | **sa** — API-01 F.1 **F-ATT-HOL-01** RETAIN cite physical `/attendance/holiday-calendars*` · residual wire **ONLY if** closable (lunar/type/publish stamped this seat) |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-DATA-01.md` |
| **completion_report** | See §10.1 |
| **next_dispatch_prompt** | See §10.2 |

### 10.1 completion_report

**Closed:** ba-data Wave-31 ATT-03b **CONFIRMED HOLD** — RETAIN LIVE thin `public.att_holiday_calendar` + `public.att_holiday_day` + Nest `GET/PUT /api/hrm/attendance/holiday-calendars/:year` (**F-ATT-HOL-01 thin**) + soft `archived_at` + ATT-08 HOL-MISS peer; **DENY** Nest `/core` dual · **DENY** second mega holiday table · **DENY** invent `att_leave_hold` · **DENY** invent ASSIGN DONE; sheet HOL **OUT GĐ1** cite ATT-10; display-ready year DTO cited; must_keep ATT01QC1-MSLZ3KIM (≠ catalog=DONE · R-ATT-01-ASSIGN open) · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT/CORE · soft≠CORE-06 · printable **false** · **C-SLICE** · **PAY OUT** · apps/** untouched · no seed.

**Residual ADD stamped (closable — NO migrate this seat):** `lunar_flag` / `calendar_type` · `is_paid` / day type · calendar `status` (publish XOR mid-year rule) on LIVE `att_holiday_*` — **ABSENT PROVEN** in `att-holiday-calendar.service.ts` ensureSchema.

**Explicit ≠:** ATT-03b DONE from thin year alone · catalog=ATT-01 DONE · LIVE=ATT-11 DONE · AGG=ATT-10 DONE · ATT module UAT · soft/ATT-08=ATT-09 DONE · CFG=ATT-02 DONE · invent PAY/printable/Word DONE.

**Unlock next:** **sa API-01** F.1 F-ATT-HOL-01 RETAIN (+ residual wire if closable).

### 10.2 next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-API-01
role: sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-31 seat #33)
entry_criteria: DATA-01 CONFIRMED HOLD @ docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-DATA-01.md · BA-01 O1–O12 CONFIRMED · SA-01 Option A LOCKED · residual ADD stamped closable on LIVE att_holiday_* for lunar_flag/calendar_type · is_paid/day type · calendar status (NO migrate DATA seat) · must_keep ATT01QC1-MSLZ3KIM (≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN · Nest /core 0) · ATT11QC1-MSLXTH9P (≠ LIVE=ATT-11 DONE) · ATT10QC1-MSLWGUYH (≠ AGG=ATT-10 DONE · HOL/MEAL OUT · R-ATT-10-DISP P2 HOLD) · ATT09QC1-MSLUTL9D (pending_days · DENY att_leave_hold) · ATT08QC1-MSLSL36C (HOL-MISS · thin HOL peer ≠ ATT-03b DONE) · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ≠ ATT UAT · PAY invent DONE OUT · printable false
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-DATA-01.md (HOLD RETAIN thin · residual ADD stamped lunar/type/publish · display-ready DTO · DENY Nest /core · DENY second mega table · DENY att_leave_hold · DENY invent ASSIGN)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md (O1–O12 · AC-ATT-03B-* · J-HRM-ATT-03B-*)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01.md (Option A · F.1 outline)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-HOL-01
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §4.3
  - apps/api/hrm-api/src/attendance/att-holiday-calendar.service.ts (LIVE thin — read-only cite · ≠ ATT-03b DONE)
exit_criteria:
  - sa API-01 F.1 deepen RETAIN cite F-ATT-HOL-01 physical GET/PUT /api/hrm/attendance/holiday-calendars/:year — paper /att + /core alias only
  - Residual wire contract ONLY for closable lunar_flag/calendar_type · is_paid/day type · status/publish XOR mid-year (DATA stamped) — DENY invent Nest /core dual · DENY second mega holiday table · DENY invent att_leave_hold · DENY invent ASSIGN DONE
  - Cite display-ready year DTO · ATT-08 HOL-MISS peer RETAIN · sheet HOL OUT GĐ1 · U19 list=get=put scope_parity
  - Explicit ≠ ATT-03b DONE from thin year alone · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT
  - evidence: docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-API-01.md
  - ack_status PASS_TO_PM · next_owner=dev-be/dev-fe residual ONLY after API (or QA if wire-only cite) — not invent DONE
cấm: apps/** this seat · seed · Nest /core invent · invent att_leave_hold dual · invent ASSIGN DONE · wipe ATT-01/11/10/09/08/02/PLT/CORE · honesty flip · claim thin HOL=ATT-03b DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT module UAT · invent PAY/printable DONE · invent second holiday SoT
```

---

## Explicit locks (footer)

**≠ ATT-03b DONE · ≠ ATT module UAT · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · printable false · C-SLICE · PAY OUT · R-ATT-01-ASSIGN open · DENY invent ASSIGN · DENY invent `att_leave_hold` · Nest `/core` DENY · soft≠CORE-06 · CFG≠ATT-02 · ATT-08 HOL-MISS RETAIN · sheet HOL OUT GĐ1 · residual ADD stamped closable lunar/type/publish on LIVE only · NO migrate this seat · apps/** cấm this seat.**
