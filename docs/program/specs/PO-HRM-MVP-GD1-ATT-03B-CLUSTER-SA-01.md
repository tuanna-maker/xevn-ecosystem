# PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01 — Option/F.1 · Lịch lễ / Tết (dương + âm cấu hình năm) — RETAIN thin F-ATT-HOL + gap admin

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe ATT-01 CAT/CNS · **DENY** invent ASSIGN DONE · **DENY** wipe ATT-11 sign/close · **DENY** wipe ATT-10 AGG/submit · **DENY** wipe ATT-09 hold · **DENY** wipe ATT-08 preview · **DENY** invent `att_leave_hold` dual · **DENY** invent PAY/printable DONE · **DENY** honesty flip · **DENY** claim thin year-set alone = ATT-03b DONE · **DENY** claim ATT module UAT · **DENY** claim catalog=ATT-01 DONE · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **C-SLICE** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** AC → (ba-data HOLD/ADD residual) → API/FE/BE residual only after contracts · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-30 UC-BP-ATT-01 **SEALED** — stamp **`ATT01QC1-MSLZ3KIM`** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-qc-01.md` · QA **`ATT01QA1-MSLYZKGN`** · residual **`R-ATT-01-ASSIGN` open** · **≠ catalog=ATT-01 DONE** · **must_keep** `ATT11QC1-MSLXTH9P` (**≠ LIVE=ATT-11 DONE**) · `ATT10QC1-MSLWGUYH` (**≠ AGG=ATT-10 DONE** · **`R-ATT-10-DISP` P2 HOLD** · HOL/MEAL OUT) · `ATT09QC1-MSLUTL9D` hold · `ATT08QC1-MSLSL36C` preview · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` (**printable false**) · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` **ABSENT** · **≠ ATT UAT** · PAY invent DONE **OUT** · printable **false** · DENY invent `att_leave_hold` |
| **uc_ids** | `UC-BP-ATT-03b` · `FR-UC-BP-ATT-03b` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#33** after ATT-01 (#32 SEALED GWC) · next ATT-03d QUEUED · PAY remain **QUEUED** · PAY OUT invent DONE |
| **ref_sa_spine** | ATT-01 [`PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01.md) · ATT-11/10/09/08/02/PLT/CORE seals · ATT-08 F-ATT-HOL-01 thin peer cite · honesty packs **RETAIN false** — **DENY reopen sealed J-HRM-ATT-01 / ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 without regression** |
| **ref_honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR module UAT **false** · product_go **false** · **DENY claim thin HOL alone = ATT-03b DONE** · **DENY claim catalog=ATT-01 DONE** · **DENY claim LIVE=ATT-11 DONE** · **DENY claim AGG=ATT-10 DONE** · **DENY invent PAY/printable DONE** · **DENY claim ATT module UAT** · **C-SLICE** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-03b** · Diễn biến **#1–#2 + Thành công** · **BR-BP-HOL-01** · partner **REQ_CC_001** · peer FR-UC-BP-ATT-08 holiday input |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` §6 ATT · FR map ATT · holiday cite `holiday_calendar` · matrix F-ATT-* |
| **ref_adr** | This Option evaluation · Nest physical prefer `/api/hrm/attendance/holiday-calendars*` · paper `/att/*` + `/core` **alias only** · U19 scope parity · soft-delete · **DENY** Nest `/core` dual |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-ATT-HOL-01** · peers **F-ATT-LEAVE-01** (ATT-08 consumer) · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE thin `public.att_holiday_calendar` + `public.att_holiday_day` (ATT-08 ensureSchema) · paper DB_DESIGN §4.3 `lunar_flag`/`is_paid`/`status` · Nest `@Controller('core')` **ABSENT** |
| **ref_code** | `att-holiday-calendar.service` GET/PUT year · `assertHolidayYearsPresent` HOL-MISS · `attendance.controller` `holiday-calendars/:year` · leave preview consumer · FE **no** dedicated Lịch lễ admin (HOL-MISS message only) · **read-only cite** · CoreModule = DB export only |
| **OUT** | Nest `/core` dual · wipe ATT-01/11/10/09/08/02/PLT/CORE · invent ASSIGN DONE · invent `att_leave_hold` · invent PAY/printable DONE · claim thin year-set = ATT-03b DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT module UAT · reopen sealed peers · seed · honesty flip · apps/** this seat · hardcode quốc gia VN alone without lunar/tenant config |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-31 architecture unlock: **Lịch lễ / Tết (dương + âm cấu hình theo năm)** (FR-UC-BP-ATT-03b · BR-BP-HOL-01 · REQ_CC_001) vs AS-IS LIVE thin Nest year holiday set (**F-ATT-HOL-01** from ATT-08 peer) — **gap-only** under U89 |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U89 after ATT-01 QC-01 GWC (`ATT01QC1-MSLZ3KIM`) · U88 continuous |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-03b · BR-BP-HOL-01 · REQ_CC_001 · F-ATT-HOL-01 · peer F-ATT-LEAVE-01 (ATT-08 HOL-MISS) · must_keep ATT-01/11/10/09/08/02/PLT/CORE · Nest `/core` DENY · U19 · soft≠CORE-06 · PAY OUT · printable false · ≠ ATT UAT · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · R-ATT-01-ASSIGN open · R-ATT-10-DISP P2 HOLD |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **ATT-01 SEALED (`ATT01QC1-MSLZ3KIM`):** CAT `work-shifts*` + CNS `shift-change-requests*` · Nest `/core` **0** · **R-ATT-01-ASSIGN open** · **≠ catalog=ATT-01 DONE** · must_keep ATT-11/10/09/08/02/PLT/CORE · soft≠CORE-06 · ≠ ATT UAT · PAY OUT · printable **false**. **Holiday spine AS-IS (PRESENT thin — RETAIN cite · ≠ ATT-03b DONE):** (1) Nest physical `GET/PUT /api/hrm/attendance/holiday-calendars/:year` → `att_holiday_calendar` + `att_holiday_day` (**F-ATT-HOL-01 thin** · CODE-MEMORY explicit **≠ ATT-03b admin DONE**). (2) Day payload = `{ date, nameVi }` only — **no** `lunar_flag` · **no** `is_paid` · **no** `calendar_type` · **no** draft/publish `status`/version. (3) Consumer ATT-08: `assertHolidayYearsPresent` → **`HRM-LEAVE-HOL-MISSING` CHẶN NỘP** when year ABSENT (`ATT08QC1-MSLSL36C` RETAIN). (4) FE: leave preview HOL-MISS alert only — **no** dedicated admin «Lịch lễ / Tết» screen (meeting gap PRODUCT_MISSING). Nest `@Controller('core')` **ABSENT**. |
| **Paper target** | FR-UC-BP-ATT-03b: CRUD lịch nghỉ lễ **dương + âm** theo năm/pháp nhân — không hardcode dương VN cố định không cấu hình âm/tenant; phát hành phiên bản lịch; phép **và** bảng công đọc **cùng** lịch hiệu lực; đổi lịch giữa năm → đơn chưa duyệt tính lại theo version mới. BR-BP-HOL-01 · REQ_CC_001. DB paper: `lunar_flag` · `is_paid` · calendar `status`. API paper: `PUT /api/hrm/att/holiday-calendars/{year}` + `calendar_type`. |
| **Gap class** | **GĐ1 continuous AC + residual admin/lunar/publish/consumer-sheet** on LIVE thin year set — **not** greenfield Nest `/core`; **not** claim thin PUT = FR-03b DONE; **not** wipe ATT-08 HOL-MISS; **not** invent PAY/printable/`att_leave_hold`/ASSIGN DONE; **not** reopen ATT-01..CORE seals. |
| **Constraints** | U89 continuous · **preserve** ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · C-SLICE · DENY seed · **cấm code until Option CONFIRMED** · gap-only · **DENY** honesty flip · **DENY** invent PAY/printable DONE · **DENY** claim ATT module UAT · **DENY** invent ASSIGN DONE · **DENY** invent `att_leave_hold` |
| **Failure impact if unresolved** | Board #33 stalls or Dev invents Nest `/core` / second holiday SoT; false claim thin year PUT = ATT-03b DONE; wipe ATT-08 HOL-MISS; invent lunar mega without BA AC; invent PAY early |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-ATT-01 + ATT-11 + ATT-10 + ATT-09 + ATT-08 + ATT-02 + PLT + CORE-* (SEALED must_keep)
  Nest /core DENY · printable false · C-SLICE · honesty false · PAY OUT
  ATT-01: CAT/CNS RETAIN · ≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN open
  ATT-11: sign/close RETAIN · ≠ LIVE=ATT-11 DONE
  ATT-10: AGG RETAIN · ≠ AGG=ATT-10 DONE · HOL/MEAL OUT · R-ATT-10-DISP HOLD
  ATT-08: preview + HOL-MISS RETAIN · thin HOL peer cite ≠ ATT-03b DONE
       │
       │  must_keep RETAIN — DENY reopen J-HRM-ATT-01 / ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT / CORE-*
       │  must_keep ATT-09 pending_days · DENY att_leave_hold
       │  must_keep ATT-01 · DENY invent ASSIGN DONE
       ▼
  ┌────────────── FR-UC-BP-ATT-03b (this seat — gap-only RETAIN thin HOL + admin residual) ─┐
  │                                                                                        │
  │  RETAIN LIVE (cite — ≠ ATT-03b DONE alone)                                             │
  │    GET/PUT /api/hrm/attendance/holiday-calendars/:year                                 │
  │      → att_holiday_calendar + att_holiday_day (F-ATT-HOL-01 thin)                      │
  │    ATT-08 assertHolidayYearsPresent · HRM-LEAVE-HOL-MISSING CHẶN NỘP                   │
  │    Soft-archive calendar · U19 resolveHrmListScope                                     │
  │                                                                                        │
  │  RESIDUAL unlock (BA → DATA/API — closable gap)                                        │
  │    R-ATT-03B-LUNAR  : lunar_flag / calendar_type solar|lunar (BR-BP-HOL-01)            │
  │    R-ATT-03B-TYPE   : day type / is_paid (nghỉ / trực…)                                │
  │    R-ATT-03B-PUB    : draft → publish version · mid-year recalc pending leave          │
  │    R-ATT-03B-ADMIN  : FE admin CRUD Lịch lễ năm (PRODUCT_MISSING → unlock)             │
  │    R-ATT-03B-CNS    : phép + bảng công cùng SoT hiệu lực (sheet HOL deepen XOR cite)   │
  │    R-ATT-03B-DISP   : display-ready year·days[]·lunarFlag·statusLabelVi                │
  │    R-ATT-03B-≠DONE  : thin year-set alone ≠ FR-03b · ≠ ATT UAT                         │
  │    Prefer physical Nest under /api/hrm/attendance/*                                    │
  │    Paper F-ATT-HOL-01 /att/holiday-calendars/{year} + /core = ALIAS ONLY               │
  │                                                                                        │
  │  PAY invent DONE = OUT · must_keep ATT-01..CORE · Nest /core DENY · printable false    │
  └────────────────────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat
       ▼
  Nest /core dual ATT                        = DENY
  Wipe ATT-01 CAT/CNS / invent ASSIGN DONE   = DENY
  Wipe ATT-11 sign / ATT-10 AGG / ATT-09/08  = DENY
  Invent att_leave_hold second ledger        = DENY
  Invent PAY/printable DONE                  = DENY
  Claim thin HOL alone = ATT-03b DONE        = DENY
  Claim catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 DONE = DENY
  Claim Option alone = ATT module UAT        = DENY
  Flip personnel / printable / recruit       = DENY
  C-SLICE ≠ module ATT / PLT / CORE / PAY UAT

  Honesty: C-SLICE ≠ attendance_uat_ready · ≠ hrm_personnel_uat_ready
           ≠ contracts_printable_ready · ≠ product_go · ≠ invent PAY DONE
```

**Label lock:** Board «Lịch lễ / Tết (dương + âm cấu hình năm)» GĐ1 = **RETAIN cite LIVE thin Nest year holiday set + ATT-08 HOL-MISS consumer** + **gap lunar/publish/admin/display residuals** — **not** Nest `/core` dual; **not** thin PUT alone = FR-03b DONE; **not** Option alone = ATT UAT.  
**Spine lock:** Physical prefer `/api/hrm/attendance/holiday-calendars*` · paper `PUT /api/hrm/att/holiday-calendars/{year}` + `/core/…` = **alias only** — **DENY** Nest `/core` second SoT · **DENY** second holiday mega-table.  
**Honesty lock:** Slice GWC later **≠** auto-flip `attendance_uat_ready` · **≠** invent PAY/printable DONE · **C-SLICE**.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Year holiday set SoT Nest | F-ATT-HOL-01 · `att_holiday_*` | `GET/PUT …/holiday-calendars/:year` **PRESENT** (thin) | **RETAIN cite** · **≠ ATT-03b DONE alone** |
| HOL-MISS chặn phép | FR-08 / BR-ATT-08-HOL-MISS | `assertHolidayYearsPresent` · `HRM-LEAVE-HOL-MISSING` **PRESENT** | **RETAIN cite** · must_keep ATT-08 |
| Lễ dương CRUD năm | FR-03b Diễn biến #1 | PUT replace `days[{date,nameVi}]` **PARTIAL** (no type/lunar) | **RETAIN + residual deepen** |
| Lễ âm cấu hình năm | BR-BP-HOL-01 · `lunar_flag` · `calendar_type` | **ABSENT** on day/calendar | **RESIDUAL** **R-ATT-03B-LUNAR** |
| Loại ngày (nghỉ/trực) · `is_paid` | SRS input · DB §4.3 | **ABSENT** | **RESIDUAL** **R-ATT-03B-TYPE** |
| Phát hành phiên bản lịch | Diễn biến #3 · `status` draft/effective | **ABSENT** (replace-in-place only) | **RESIDUAL** **R-ATT-03B-PUB** |
| Đổi lịch giữa năm → đơn chưa duyệt recalc | SRS quy tắc | **ABSENT** versioning | **RESIDUAL** under **R-ATT-03B-PUB** |
| Admin FE Lịch lễ | FR-03b · meeting PRODUCT_MISSING | **ABSENT** dedicated screen (HOL-MISS msg only) | **RESIDUAL** **R-ATT-03B-ADMIN** |
| Bảng công đọc cùng lịch | FR-03b Thành công · ATT-10 HOL/MEAL | Sheet HOL deepen **OUT GĐ1** on ATT-10 seal · leave consumer **PRESENT** | **RESIDUAL** **R-ATT-03B-CNS** (leave RETAIN · sheet cite XOR OUT GĐ1 explicit BA) |
| Hardcode dương VN only | FAIL BR-BP-HOL-01 | No national hardcode SoT — empty until PUT | **RETAIN** (empty ≠ hardcode · still need lunar AC) |
| Paper `/att` + `/core` | alias | Nest `@Controller('core')` **ABSENT** | **paper = alias only** |
| ATT-01 CAT/CNS | peer | SEALED `ATT01QC1-MSLZ3KIM` · ASSIGN open | **must_keep RETAIN** · ≠ catalog=DONE · DENY invent ASSIGN DONE |
| ATT-11 sign/close | peer | SEALED `ATT11QC1-MSLXTH9P` | **must_keep RETAIN** · ≠ LIVE=ATT-11 DONE |
| ATT-10 AGG | peer | SEALED `ATT10QC1-MSLWGUYH` · HOL/MEAL OUT | **must_keep RETAIN** · ≠ AGG=DONE · DISP HOLD |
| ATT-09/08 | peers | SEALED stamps | **must_keep RETAIN** · DENY `att_leave_hold` |
| PLT / CORE | peers | SEALED stamps | **must_keep RETAIN** · printable false |
| PAY | OUT | QUEUED | **OUT invent DONE** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT-03b DONE** · **≠ ATT UAT** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN thin F-ATT-HOL + gap admin/lunar/publish (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** LIVE Nest `@Controller('attendance')` thin `GET/PUT …/holiday-calendars/:year` → `att_holiday_calendar` + `att_holiday_day` (**F-ATT-HOL-01**), ATT-08 **HOL-MISS** consumer (`HRM-LEAVE-HOL-MISSING`), U19 scope, soft-archive. Unlock BA residuals **R-ATT-03B-LUNAR/TYPE/PUB/ADMIN/CNS/DISP/≠DONE** for solar+lunar year config (BR-BP-HOL-01), day type/`is_paid`, publish/version + mid-year recalc, admin FE CRUD, leave+sheet same-SoT AC (sheet HOL deepen **XOR** explicit OUT GĐ1 cite ATT-10 HOL/MEAL OUT). Prefer physical Nest under `/api/hrm/attendance/*`; paper **F-ATT-HOL-01** `/att/holiday-calendars/{year}` + `/core` = **alias only**. **must_keep** ATT01QC1-MSLZ3KIM (**≠ catalog=ATT-01 DONE** · **R-ATT-01-ASSIGN open** · DENY invent ASSIGN DONE) · ATT11QC1-MSLXTH9P (**≠ LIVE=ATT-11 DONE**) · ATT10QC1-MSLWGUYH (**≠ AGG=ATT-10 DONE** · HOL/MEAL OUT · R-ATT-10-DISP HOLD) · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · ≠ ATT UAT. PAY/printable **OUT invent DONE**. **DENY** invent `att_leave_hold` · claim thin HOL = ATT-03b DONE · claim ATT module UAT. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium (thin year LIVE; residual = lunar/type/publish/admin FE; sheet CNS BA-lockable vs OUT) |
| **Risk** | Low–medium if BA does not invent Nest dual / claim thin=DONE / invent PAY / invent ASSIGN |
| **Cost / timeline** | BA → ba-data HOLD/ADD residual → sa API F.1 → Dev wire · QA U65 |
| **Pros** | Matches preserve_default; reuses LIVE thin HOL + HOL-MISS; unlocks board #33; avoids dual SoT; separates engine input ≠ admin FR-03b DONE |
| **Cons** | Not full ATT UAT; sheet HOL may stay OUT GĐ1; lunar AC needs BA depth |
| **Failure modes** | BA over-scopes Nest `/core` · claims PUT year=FR-03b · invent PAY · wipe ATT-08 · invent ASSIGN |
| **Mitigation** | O1–O12 locks · DENY invent · peers OUT · ≠DONE footers · C-SLICE |

### Option B — Nest `/core` dual + wipe/re-home thin holiday (REJECT)

| | |
|--|--|
| **Summary** | Stand up Nest `@Controller('core')` as primary holiday SoT; dual-write or abandon `/attendance/holiday-calendars`; invent parallel calendar engine unrelated to ATT-08 HOL-MISS |
| **Pros** | Paper `/core` literal |
| **Cons** | Dual SoT · violates U89 preserve · high blast · regression ATT-08 HOL-MISS + ATT-01..CORE |
| **Failure modes** | Dual-write · Nest `/core` non-404 SoT · honesty flip · wipe leave engine |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim thin year-set = ATT-03b DONE / honesty (REJECT)

| | |
|--|--|
| **Summary** | Declare seat DONE because GET/PUT year exists; flip `attendance_uat_ready`; invent PAY/printable DONE; invent ASSIGN DONE; reopen sealed ATT-01..CORE peers |
| **Pros** | Fast chat claim |
| **Cons** | Violates BR-BP-HOL-01 (âm cấu hình năm ABSENT) · FR Diễn biến publish/admin · C-SLICE · FE admin still PRODUCT_MISSING · CODE-MEMORY already ≠ ATT-03b DONE |
| **Failure modes** | False UAT · sponsor distrust · continuous program stall |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+gap lunar/admin) | B (Nest dual+wipe) | C (HOLD/claim DONE) |
|-----------|-------:|---------------------------:|-------------------:|--------------------:|
| Business value (FR-ATT-03b) | 5 | **5** | 2 | 0 |
| Time to deliver | 4 | **4** | 1 | Fake PASS |
| Complexity (lower=better) | 3 | **3** | 1 | — |
| Security / scope U19 | 4 | **5** | 2 | Honesty breach |
| Reliability / preserve seals | 5 | **5** | 1 | High defect |
| Maintainability | 4 | **5** | 1 | Spec lie |
| Fit BR-BP-HOL-01 + preserve | 5 | **5** | 0 | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE thin `holiday-calendars/:year` + ATT-08 HOL-MISS; unlock LUNAR/TYPE/PUB/ADMIN/CNS/DISP residuals; paper F-ATT-HOL-01 + `/core` = alias only; **RETAIN** ATT-01 CAT/CNS (`ATT01QC1-MSLZ3KIM` · ≠ catalog=DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN) · ATT-11 sign/close · ATT-10 AGG · ATT-09 hold · ATT-08 preview · ATT-02/PLT/CORE · soft≠CORE-06 · Nest `/core` DENY · ≠ ATT UAT · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE; **DENY** Nest dual · invent `att_leave_hold` · wipe peers · invent PAY/printable DONE · claim thin HOL = ATT-03b DONE · claim ATT module UAT · honesty flip · reopen seals · seed · apps/** |
| **Why selected** | AS-IS already owns Nest year holiday set + leave HOL-MISS gate (ATT-08 peer); FR-03b gap is **admin solar+lunar + publish/version + shared SoT AC** — not greenfield Nest `/core`, not wipe ATT-01 CAT/CNS; preserves W10–W30 must_keep; unlocks board #33 |
| **Assumptions** | ATT-01 **`ATT01QC1-MSLZ3KIM` RETAIN** · QA `ATT01QA1-MSLYZKGN` · ≠ catalog=ATT-01 DONE · **R-ATT-01-ASSIGN open**. ATT-11 **`ATT11QC1-MSLXTH9P` RETAIN** · ≠ LIVE=ATT-11 DONE. ATT-10 **`ATT10QC1-MSLWGUYH` RETAIN** · ≠ AGG=ATT-10 DONE · HOL/MEAL OUT · R-ATT-10-DISP P2 HOLD. ATT-09 **`ATT09QC1-MSLUTL9D` RETAIN** · DENY `att_leave_hold`. ATT-08 **`ATT08QC1-MSLSL36C` RETAIN**. ATT-02 **`ATT02QC1-MSLQZUK7` RETAIN** · CFG≠DONE. PLT-01 **`PLT01QC1-MSLPUQIU` RETAIN**. CORE-10 **`CORE10QC1-MSLP0EJB` RETAIN**. CORE-09 **`CORE09QC1-MSLNBA89` RETAIN** · printable false. CORE-07 **`CORE07QC1-KZJTSHNT` RETAIN**. soft≠CORE-06 DONE **RETAIN**. Nest `@Controller('core')` **ABSENT**. Physical thin `holiday-calendars*` **PRESENT**. FE admin Lịch lễ **ABSENT**. `attendance_uat_ready=false` · printable false · product_go **false**. PAY **QUEUED**. |
| **Rejected** | **B** — Nest `/core` dual / wipe · **C** — HOLD / claim thin = ATT-03b DONE / invent PAY·printable·ASSIGN / honesty flip / reopen sealed |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Holiday SoT | LIVE Nest thin `holiday-calendars/:year` · paper F-ATT-HOL-01 alias | ≠DONE from thin PUT alone · mint J-HRM-ATT-03B-* |
| O2 | Lunar | Prefer residual ADD `lunar_flag` (and/or `calendar_type`) on day/calendar — **no** hardcode âm only · **no** solar-only national lock | AC BR-BP-HOL-01 · FAIL solar-hardcode-only |
| O3 | Day type / paid | Prefer residual `is_paid` / type enum nghỉ\|trực… | AC field + display |
| O4 | Publish / version | Prefer draft→publish **XOR** replace-in-place GĐ1 with explicit mid-year recalc rule | Explicit footer GĐ1 vs GĐ2 versioning |
| O5 | Admin FE | Unlock dedicated Lịch lễ năm CRUD (PRODUCT_MISSING → residual) · HOL-MISS CTA → admin | U65 path · F5 |
| O6 | Consumer CNS | Leave RETAIN HOL-MISS · sheet HOL deepen **XOR** OUT GĐ1 (cite ATT-10 HOL/MEAL OUT) | Explicit same-SoT AC · ≠ claim AGG=ATT-10 DONE |
| O7 | Paper `/core` + `/att` | Alias only | DENY Nest dual in AC/evidence |
| O8 | ATT-01/11/10/09/08/PLT/CORE | must_keep stamps · ≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · DENY `att_leave_hold` | ≠ reopen · ≠ claim DONE |
| O9 | Soft-archive | `archived_at` hide year · history days intact | AC soft ≠ hard-delete default |
| O10 | Scope U19 | list=get=put same `resolveHrmListScope` | Scope 409 AC |
| O11 | PAY / printable | OUT invent DONE · printable false | Trace-only if closed cite |
| O12 | Honesty / journeys | All false · C-SLICE · `attendance_uat_ready=false` · mint `J-HRM-ATT-03B-*` DRAFT | Footer ≠DONE · ≠ ATT module UAT · U65 zero-seed |

---

## 5. F.1 outline (paper alias · Nest physical prefer)

> Full F.1 deepen = later **sa API** seat after BA (+ ba-data) — this outline **locks disposition only**.

| F-id (cite) | Physical METHOD/path (prefer) | Paper alias | Mục đích (VI) | Bước SRS |
|-------------|-------------------------------|-------------|---------------|----------|
| **F-ATT-HOL-01** (RETAIN thin + residual deepen) | `GET/PUT /api/hrm/attendance/holiday-calendars/:year` | `PUT /api/hrm/att/holiday-calendars/{year}` · `/core/…` **alias only** | Lịch năm pháp nhân — input phép + admin FR-03b | FR-UC-BP-ATT-03b Diễn biến **#1–#2** · peer FR-08 HOL |
| **F-ATT-LEAVE-01** (peer RETAIN) | `POST …/leave-requests/preview-deduction` | paper alias | Consumer HOL-MISS / exclude holiday | FR-08 · **≠** ATT-03b DONE alone |
| **F-ATT-LEAVE-02/03** (peer RETAIN) | leave-requests* | paper alias | Create/approve — must_keep ATT-09/08 | peer · DENY `att_leave_hold` |
| **F-ATT-SHEET-01** (peer RETAIN) | aggregate | paper alias | Sheet — HOL/MEAL **OUT GĐ1** unless BA opens CNS | peer · **≠ AGG=ATT-10 DONE** |

**DENY:** invent Nest `@Controller('core')` as primary SoT for F-ATT-HOL-01.  
**DENY:** invent second `att_holiday_*` / mega-EAV calendar table.  
**DENY:** treat paper path alone as Nest dual invent requirement.  
**DENY:** claim thin GET/PUT year alone = FR-UC-BP-ATT-03b DONE.

**Display-ready cite for BA/DATA:** `{ id, companyId, year, status?, statusLabelVi?, days: [{ date, nameVi, lunarFlag?, calendarType?, isPaid?, dayTypeLabelVi? }], dayCount, updatedAt }` — BA may deepen VI labels; map paper `lunar_flag`/`is_paid`/`status` → LIVE residual cols after ba-data.

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O12 + mint J-HRM-ATT-03B-* DRAFT
  → ba-data HOLD default (ADD residual ONLY if BA proves closable col for lunar/type/publish)
  → sa API-01 F.1 deepen RETAIN cite F-ATT-HOL-01 (+ wire residual ONLY if closable)
  → Dev-BE / Dev-FE residual wire ONLY (gap-only · DENY invent ASSIGN / att_leave_hold / PAY)
  → QA U65 J-HRM-ATT-03B-* browser FE-after-2xx + F5
  → QC GWC C-SLICE (≠ ATT-03b module UAT · ≠ ATT module UAT · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · printable false · PAY OUT)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O12 AC + mint J-HRM-ATT-03B-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default / ADD residual only if closable | ba-data | HOLD unless closable gap |
| 4. sa API F.1 cite RETAIN F-ATT-HOL-01 (+ wire residual ONLY if closable) | sa | API-01 delta |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 J-HRM-ATT-03B-* (admin CRUD · lunar · HOL-MISS · Nest `/core` 0) | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ module ATT UAT · ≠ honesty flip · ≠ wipe ATT-01..CORE · ≠ invent PAY |

**Rollback:** Docs-only seat — supersede this Option if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · BA unlocked · ATT-01/11/10/09/08/02/PLT/CORE stamps untouched · Nest `/core` still DENY · honesty false · apps/** untouched · **≠** claim ATT-03b DONE · **≠** claim ATT UAT · **≠** claim catalog=ATT-01 DONE · **≠** claim LIVE=ATT-11 DONE · **≠** claim AGG=ATT-10 DONE.

---

## 7. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | BA invents Nest `/core` dual | Spec path `/core` as SoT · Dev opens CoreController | O7 DENY · QC Nest SoT 0 |
| A | Claim thin HOL alone = ATT-03b DONE | Evidence footer missing ≠DONE | O1/O12 · C-SLICE |
| A | Wipe ATT-01 CAT/CNS / invent ASSIGN DONE | Diff removes work-shifts / opens assign DONE | must_keep ATT01 · O8 · R-ATT-01-ASSIGN open |
| A | Wipe ATT-11 sign / ATT-10 AGG / ATT-08 HOL-MISS | Diff removes signatures/AGG/HOL | must_keep ATT11/10/08 · O8 |
| A | Invent PAY / printable DONE | AC claims payroll DONE | O11 OUT |
| A | Invent `att_leave_hold` | New table dual | O8 DENY · held=pending_days |
| A | Claim Option = ATT module UAT | Ready flag flip | O12 DENY |
| B | Dual-write / Nest `/core` | New `/core` non-404 | **REJECT B** |
| C | Honesty flip / false DONE | Ready flags true without UF wave | **REJECT C** |

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| **ATT01QC1-MSLZ3KIM** | RETAIN · CAT `work-shifts*` + CNS · Nest `/core` 0 · **≠ catalog=ATT-01 DONE** · **R-ATT-01-ASSIGN open** · **DENY invent ASSIGN DONE** · ≠ ATT-01/ATT UAT |
| **ATT11QC1-MSLXTH9P** | RETAIN · signatures\|close\|reopen · Nest `/core` sign 0 · **≠ LIVE=ATT-11 DONE** · **R-ATT-11-WF/CSUM/INBOX/EMIT HOLD** · ≠ ATT-11/ATT UAT |
| **ATT10QC1-MSLWGUYH** | RETAIN · AGG+submit · Nest `/core` AGG 0 · **≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT · ≠ ATT-10/ATT UAT |
| ATT09QC1-MSLUTL9D | RETAIN · hold/settle/release · held=`pending_days` · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT |
| ATT08QC1-MSLSL36C | RETAIN · preview-deduction physical · T6→T2=2 · HOL-MISS · ALIGN · client-days≠ATT-08 DONE · thin HOL peer ≠ ATT-03b DONE |
| ATT02QC1-MSLQZUK7 | RETAIN · **CFG≠ATT-02 DONE** · late_penalty peer · ≠ ATT UAT · ≠ reopen as ATT-03b DONE |
| PLT01QC1-MSLPUQIU | RETAIN · peer≠PLT DONE · merge≠platform UAT |
| CORE10QC1-MSLP0EJB | RETAIN · catalog/CRUD/LIVE≠CORE-10 DONE · BH≠CORE-07 · PAY-06 OUT |
| CORE09QC1-MSLNBA89 | RETAIN · printable **false** · ≠ CORE-09 DONE |
| CORE07QC1-KZJTSHNT | RETAIN · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE |
| soft≠CORE-06 DONE | RETAIN |
| Nest `/core` | **DENY** dual invent · paper alias only |
| PAY / printable DONE | **OUT invent DONE** · printable false |
| Thin HOL alone | **≠** ATT-03b DONE · **≠** ATT module UAT |
| Catalog alone | **≠** ATT-01 DONE |
| LIVE sign/close alone | **≠** ATT-11 DONE |
| AGG alone | **≠** ATT-10 DONE |
| ASSIGN | **DENY** invent DONE · R-ATT-01-ASSIGN **open** |
| `att_leave_hold` | **DENY** invent dual |
| Honesty | **DENY** flip · **C-SLICE** · `attendance_uat_ready=false` |
| apps/** | **CẤM** until contracts after BA/DATA/API |
| Seed | **DENY** U65 |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A** CONFIRMED for UC-BP-ATT-03b: RETAIN LIVE Nest thin `GET/PUT /api/hrm/attendance/holiday-calendars/:year` → `att_holiday_calendar`/`att_holiday_day` (**F-ATT-HOL-01**) + ATT-08 HOL-MISS (`HRM-LEAVE-HOL-MISSING`); unlock R-ATT-03B-LUNAR/TYPE/PUB/ADMIN/CNS/DISP/≠DONE for BR-BP-HOL-01 solar+lunar year config + publish/admin FE; paper F-ATT-HOL-01 `/att`+`/core` alias only; **must_keep** ATT-01 CAT/CNS (`ATT01QC1-MSLZ3KIM` · ≠ catalog=DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN) · ATT-11 sign/close (`ATT11QC1-MSLXTH9P` · ≠ LIVE=ATT-11 DONE) · ATT-10 AGG (`ATT10QC1-MSLWGUYH` · ≠ AGG=DONE · HOL/MEAL OUT) · ATT-09 hold (`ATT09QC1-MSLUTL9D` · pending_days · DENY `att_leave_hold`) · ATT-08 preview (`ATT08QC1-MSLSL36C`) · ATT-02/PLT/CORE · Nest `/core` DENY · printable false · ≠ ATT UAT; DENY invent PAY/printable DONE · honesty flip · claim thin HOL=ATT-03b DONE · apps/**. unlock_lane **BA → DATA(HOLD) → API → FE/BE**. Explicit **≠ ATT-03b DONE · ≠ ATT module UAT · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · C-SLICE · PAY OUT · printable false**. |
| **next_owner** | `ba-process` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01.md` |
| **unlock_lane** | `ba-process` → `ba-data` (HOLD prefer) → `sa` API-01 → `dev-be`/`dev-fe` residual → `qa` → `qc` |
| **next_dispatch_prompt** | see §10 |

---

## 10. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01
role: ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-31 seat #33)
entry_criteria: SA-01 Option A CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01.md · depends ATT01QC1-MSLZ3KIM · must_keep ATT-01 CAT/CNS RETAIN (≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN DONE · Nest /core 0) · ATT11QC1-MSLXTH9P sign/close RETAIN (≠ LIVE=ATT-11 DONE) · ATT10QC1-MSLWGUYH AGG/submit RETAIN (≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · Nest /core AGG 0) · ATT09QC1-MSLUTL9D hold/settle RETAIN (pending_days · DENY att_leave_hold · Nest /core leave 0) · ATT08QC1-MSLSL36C preview RETAIN (HOL-MISS · thin HOL peer ≠ ATT-03b DONE) · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · PAY invent DONE OUT · printable false
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01.md (Option A · O1–O12 · F.1 outline · residuals R-ATT-03B-* · unlock_lane)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-03b · BR-BP-HOL-01 · Diễn biến #1–#2 · REQ_CC_001
  - docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md §6 ATT · holiday_calendar cite
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-HOL-01 · peer F-ATT-LEAVE-01
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §4.3 att_holiday_calendar + att_holiday_day (lunar_flag · is_paid · status)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-qc-01.md (must_keep ATT01QC1-MSLZ3KIM)
  - apps/api/hrm-api/src/attendance/att-holiday-calendar.service.ts (LIVE thin · ≠ ATT-03b DONE CODE-MEMORY — read-only)
exit_criteria:
  - BA AC pack O1–O12 CONFIRMED for UC-BP-ATT-03b (thin year RETAIN · lunar year config · day type/paid · publish/version XOR GĐ1 replace · admin FE · leave+sheet same-SoT · display)
  - Mint J-HRM-ATT-03B-* DRAFT (U65 browser) — admin CRUD lịch năm dương+âm → Lưu/F5 · HOL-MISS khi thiếu năm · Nest /core 0 · không seed
  - Explicit ≠ ATT-03b DONE from thin year alone · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · ≠ soft/ATT-08=ATT-09 DONE · ≠ CFG=ATT-02 DONE · printable false · C-SLICE · PAY OUT · DENY invent att_leave_hold · DENY invent ASSIGN DONE
  - ba-data HOLD default (ADD residual only if closable gap for lunar/type/publish) · DENY Nest /core dual · DENY invent PAY/printable DONE · DENY wipe ATT-01/11/10/09/08 · DENY seed · DENY apps/**
  - evidence: docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md
  - ack_status PASS_TO_PM · next ba-data HOLD (or sa API if closable gap ONLY)
cấm: apps/** · seed · Nest /core invent · invent att_leave_hold dual · invent ASSIGN DONE · wipe ATT-01/11/10/09/08/02/PLT/CORE · honesty flip · claim thin HOL=ATT-03b DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT module UAT · invent PAY/printable DONE
```

---

## Explicit locks (footer)

**≠ ATT-03b DONE · ≠ ATT module UAT · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · printable false · C-SLICE · PAY OUT · R-ATT-01-ASSIGN open · DENY invent ASSIGN · DENY invent `att_leave_hold` · Nest `/core` DENY · soft≠CORE-06 · CFG≠ATT-02 · apps/** cấm this seat.**
