# PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN LIVE leave spine + residual ADD engine/holiday/unit (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-26 seat **#28**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE `public.leave_requests` · `employee_leave_balances` · `att_leave_type`/EFF · calendar helpers/funnel · **RESIDUAL ADD stamped** (closable) for **engine result cols · holiday year set · leave_type.unit** — prefer extend LIVE spines — **NO migrate invent this seat** · **NO** Nest `/core` table dual · **NO** wipe ATT-02/PLT/CORE · **NO** wipe soft≠CORE-06 DONE · **NO** invent PAY / printable / Word DONE · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — LIVE leave spines **RETAIN** · engine/holiday/unit typed persist **ABSENT PROVEN** → residual **ADD stamped closable** · preview = **HOLD calc** (no mandatory table) · unlock **sa API-01** F.1 **F-ATT-LEAVE-01** physical `/api/hrm/attendance/*` — residual wire **ONLY if** closable gap · **PAY OUT invent DONE** · **printable false RETAIN** · **≠ ATT-08 DONE** from client `total_days` alone · **≠ ATT-09/ATT-03b DONE** · **CFG≠ATT-02 DONE** |
| **uc_ids** | `UC-BP-ATT-08` · `FR-UC-BP-ATT-08` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · **R-ATT-08-ENGINE** · **R-ATT-08-PREVIEW** · **R-ATT-08-HOL** · **R-ATT-08-UNIT** · **R-ATT-08-ALIGN** · **R-ATT-08-≠-*** · **R-ATT-08-PAY-OUT** · **R-ATT-08-HONESTY** · **R-ATT-08-PRINTABLE** false RETAIN · QC ATT-02 **`ATT02QC1-MSLQZUK7`** · CFG≠DONE · ≠ ATT UAT · **`PLT01QC1-MSLPUQIU`** · peer≠PLT DONE · merge≠platform UAT · **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · ≠ CORE-09 DONE · **`CORE07QC1-KZJTSHNT`** · soft≠DONE · Nest `/core` DENY · PAY invent DONE **OUT** |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md) · O1–O12 · AC-ATT-08-* · R-ATT-08-* |
| **ref_att02_data** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md) — stamp `ATT02QC1-MSLQZUK7` · CFG≠DONE |
| **ref_plt_data** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md) — stamp `PLT01QC1-MSLPUQIU` |
| **ref_core10_data** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md) — stamp `CORE10QC1-MSLP0EJB` |
| **ref_core09_data** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md) — printable **false** · ≠ CORE-09 DONE |
| **ref_core07_data** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md) — GATE/ACT · Nest `/core` DENY |
| **ref_paper_db** | paper `holiday_calendar_days` / `att_holiday_calendar`+`att_holiday_day` = **alias/SoT name** ↔ residual thin year set under `/attendance/*` · `leave_requests` LIVE · `att_leave_type` LIVE · Nest `@Controller('core')` **ABSENT** |
| **ref_paper_api** | **F-ATT-LEAVE-01** (preview-deduction) · peers **F-ATT-LEAVE-02/03** (≠ ATT-09 DONE) · **F-ATT-HOL-01** (≠ ATT-03b DONE) · **F-ATT-CAT-LVT/EFF** · Nest `@Controller('core')` **ABSENT** · paper `/att/*` + `/core` **alias only** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-08** · Diễn biến **#1–#4 + FAIL calendar + Thành công** · **BR-BP-LV-05** · partner **REQ_NP_006** · **Q-LEAVE-UNIT** |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/*` · paper `/att` + `/core` alias only · U19 · soft-delete · **DENY** Nest `/core` dual |
| **ref_code_cite** | `attendance.controller` `@Controller('attendance')` leave-requests* · leave-balance/panel · `LeaveRequestsService.ensureSchema` (`total_days` client) · `AttLeaveTypeService.ensureSchema` (**no `unit`**) · `expandLeaveDateRange` / `toLeaveDayKey` (calendar inclusive ≠ BR-BP-LV-05) · leave funnel · Nest holiday / `preview-deduction` / `@Controller('core')` **ABSENT** (grep 2026-08-09) — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim client `total_days`/calendar expand = ATT-08 DONE · **DENY** claim ATT-09/ATT-03b DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** CFG=ATT-02 DONE · **DENY** claim PLT/CORE DONE · honesty flip |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| Leave TXN spine | **HOLD RETAIN** Nest **`public.leave_requests`** on **`POST/GET /api/hrm/attendance/leave-requests*`** — client `total_days` PRESENT · **≠** FR-08 DONE alone · **DENY wipe** |
| Balance / panel | **HOLD RETAIN** **`public.employee_leave_balances`** + `GET …/leave-balance*` / panel — **≠** ATT-08 DONE alone · PAY **OUT invent DONE** |
| Leave type / EFF | **HOLD RETAIN** **`public.att_leave_type`** + EFF picker — **≠** ATT-08 DONE alone |
| Calendar helpers / funnel | **HOLD RETAIN** `expandLeaveDateRange` / `toLeaveDayKey` / leave funnel — **explicit ≠** BR-BP-LV-05 / FR-08 DONE |
| **R-ATT-08-ENGINE** | **RESIDUAL ADD stamped** — persist engine result (`working_days` / `deductible_units` / `calendar_days` / `unit` on submit path) — **ABSENT PROVEN** on `leave_requests` · prefer **extend** LIVE `leave_requests` — **DENY** Nest `/core` dual table · **NO migrate this seat** |
| **R-ATT-08-PREVIEW** | **HOLD** — calc read-only · **no** mandatory new table for F-ATT-LEAVE-01 |
| **R-ATT-08-HOL** | **RESIDUAL ADD stamped** — thin **year holiday set** ABSENT Nest (**ABSENT PROVEN**) · map paper `att_holiday_*` / `holiday_calendar_days` · policy **thiếu lịch năm = CHẶN NỘP** · **explicit ≠** ATT-03b admin DONE · prefer `/attendance/*` · **DENY** Nest `/core` |
| **R-ATT-08-UNIT** | **RESIDUAL ADD stamped** — `att_leave_type.unit` (`day`\|`hour`) **ABSENT PROVEN** · Q-LEAVE-UNIT · prefer soft col on LIVE `att_leave_type` (metadata_json **≠** SoT forever) |
| **R-ATT-08-ALIGN** | **HOLD** wire — LIVE leave_requests RETAIN · consume engine units after API · **≠** invent ATT-09 hold DONE |
| **R-ATT-08-≠-*** / PAY / HONESTY / PRINTABLE | **INFO honesty locks** |
| Nest path | Physical `/api/hrm/attendance/*` · Nest `@Controller('core')` **ABSENT** · paper `/att` + `/core` **alias only** |
| ATT-02 | **must_keep** · stamp **`ATT02QC1-MSLQZUK7`** · **CFG≠ATT-02 DONE** · ≠ ATT UAT |
| PLT-01 | **must_keep** · stamp **`PLT01QC1-MSLPUQIU`** · peer≠PLT DONE · merge≠platform UAT |
| CORE-10 | **must_keep** · stamp **`CORE10QC1-MSLP0EJB`** · ≠ CORE-10 DONE |
| CORE-09 printable | **must_keep** · stamp **`CORE09QC1-MSLNBA89`** · printable **false** · ≠ CORE-09 DONE |
| CORE-07 GATE/ACT | **must_keep** · stamp **`CORE07QC1-KZJTSHNT`** · Nest DENY · soft≠CORE-06 DONE |
| PAY / printable / Word | **OUT invent DONE** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim client-days / ATT UAT / ATT-09/03b / CFG=ATT-02 / PLT/CORE DONE |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| F-ATT-LEAVE-01 preview-deduction | Prefer **`POST /api/hrm/attendance/leave-requests/preview-deduction`** · calc on leave family | **HOLD** calc · **no** mandatory table |
| F-ATT-LEAVE-02/03 submit/approve | **`POST/GET …/leave-requests*`** + approve/reject → **`public.leave_requests`** | **HOLD RETAIN** · ALIGN residual · **≠** ATT-09 DONE |
| BR-BP-LV-05 engine persist | Prefer soft cols on **`leave_requests`**: `working_days` · `deductible_units` · `calendar_days` · `unit` (and/or engine snapshot JSON) | **RESIDUAL ADD stamped** · **NO migrate this seat** |
| Client `total_days` | LIVE `leave_requests.total_days` | **HOLD RETAIN** · **≠** FR-08 DONE · reject inflate via ALIGN |
| F-ATT-HOL-01 / `att_holiday_*` | Prefer thin **`/attendance/holiday-calendars*`** year set → paper `att_holiday_calendar`+`att_holiday_day` | **RESIDUAL ADD stamped** · **≠** ATT-03b DONE |
| Q-LEAVE-UNIT | Prefer **`att_leave_type.unit`** `day`\|`hour` | **RESIDUAL ADD stamped** |
| F-ATT-CAT-LVT/EFF | **`/attendance/leave-types*`** / effective → `att_leave_type` | **HOLD RETAIN** |
| leave-balance / panel | **`employee_leave_balances`** | **HOLD RETAIN** · PAY OUT |
| `expandLeaveDateRange` / funnel | calendar helpers + attendance markers | **HOLD RETAIN** · **≠** BR-BP-LV-05 |
| Nest `/core` leave/holiday table | — | **DENY invent** |
| Paper `/core` / `/att` | Alias only | **DENY** Nest dual SoT |
| ATT-02 / PLT / CORE peers | CFG · MergeToken · SI · CTR · activate | **must_keep** · ≠ claim DONE |

```text
  public.leave_requests (LIVE — HOLD RETAIN · ≠ FR-08 DONE alone)
        RETAIN: id · company_id TEXT · employee_id · leave_type · start/end_date ·
                status · total_days (client) · handover* · attachment_url · workflow* · audit
        ABSENT PROVEN: working_days · deductible_units · calendar_days · unit
                       (engine result persist — grep ensureSchema 2026-08-09)
        RESIDUAL ADD (stamped closable — NO migrate this seat):
          prefer soft cols on leave_requests for BR-BP-LV-05 persist after engine
          DENY Nest /core dual leave table as primary
                │
                │ Physical API (HOLD RETAIN + residual)
                ▼
  POST/GET /api/hrm/attendance/leave-requests*
  POST …/leave-requests/preview-deduction   (residual F-ATT-LEAVE-01 — HOLD calc)
  Paper /att/leave-requests/preview-deduction + /core/… = ALIAS ONLY
                │
  public.employee_leave_balances            HOLD RETAIN (quỹ · ≠ ATT-08 DONE · PAY OUT)
  public.att_leave_type                     HOLD RETAIN spine
        ABSENT PROVEN: unit (day|hour)      → RESIDUAL ADD stamped (Q-LEAVE-UNIT)
  expandLeaveDateRange / toLeaveDayKey      HOLD RETAIN · ≠ BR-BP-LV-05
  leave funnel materialize                  HOLD RETAIN · ≠ ATT-08 DONE
  holiday year set (Nest)                   ABSENT PROVEN
        → RESIDUAL ADD stamped thin year set ≡ paper att_holiday_*
        → thiếu lịch năm = CHẶN NỘP · ≠ ATT-03b DONE · DENY Nest /core

  Display-ready preview DTO (cite · HOLD schema until Dev after API):
        deductible_units · calendar_days · working_days · unit ·
        excluded_days[]? · warnings[]?
        labels VI: *Ngày calendar* / *Ngày trừ quỹ* / *Ngày loại (T7/CN/Lễ)*

  ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB ·
  CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 ·
  Nest /core DENY
        SEALED must_keep

  FORBIDDEN GĐ1 this seat:
        Wipe LIVE leave_requests / balances / att_leave_type / expand / funnel
        Nest /core dual · invent PAY/printable/Word DONE
        Claim client total_days / calendar expand = ATT-08 DONE
        Claim ATT-09 / ATT-03b DONE · ATT module UAT · CFG=ATT-02 DONE
        Claim PLT/CORE DONE · honesty flip · reopen sealed J-*
        Seed · apps/** · invent full ATT-03b admin as ATT-08 blocker
```

**Label lock:** Board «Trừ phép xuyên T7–CN–Lễ» GĐ1 = **LIVE leave TXN/balance/type/helpers RETAIN** + **working-day engine / holiday year set / unit residual ADD stamped** — **not** Nest `/core` dual · **not** client `total_days` = FR-08 DONE · **not** ATT-03b/ATT-09 DONE.  
**Spine lock:** Physical `/api/hrm/attendance/*` — **DENY** Nest `/core` second SoT · paper `/att`+`/core` alias only.  
**Gap lock:** Engine cols · holiday year set · `unit` **ABSENT PROVEN** → residual **ADD stamped** · **HOLD invent migrate** until sa API F.1 + Dev unlock.  
**Honesty lock:** `attendance_uat_ready=false` · printable false · C-SLICE · PAY OUT · CFG≠ATT-02 DONE.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-08 DONE** · client `total_days`/calendar expand ≠ FR-08 DONE · ≠ ATT-09/ATT-03b DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · must_keep ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · no apps/**

---

## 3. AS-IS baseline (Nest facts — read-only cite · 2026-08-09)

| Object | AS-IS LIVE | Gap (Wave-26 DATA) |
|--------|------------|---------------------|
| **`public.leave_requests`** | `ensureSchema` — `total_days` client · status · dates · scope TEXT | **HOLD RETAIN** · engine persist cols **ABSENT** → residual ADD stamped |
| **`POST/GET /attendance/leave-requests*`** | TXN LIVE | **HOLD RETAIN** · ≠ FR-08 DONE · ALIGN residual |
| **`preview-deduction`** | Nest path **ABSENT** | **HOLD** calc residual (F-ATT-LEAVE-01) · no table required |
| Working-day engine | **ABSENT** — client days trusted | **RESIDUAL ADD** persist after engine (**R-ATT-08-ENGINE**) |
| **`public.employee_leave_balances`** | LIVE ledger + panel | **HOLD RETAIN** · PAY OUT |
| **`public.att_leave_type`** | LIVE open catalog + EFF | **HOLD RETAIN** · **`unit` ABSENT** → residual ADD |
| `expandLeaveDateRange` / funnel | Inclusive **calendar** days | **HOLD RETAIN** · ≠ BR-BP-LV-05 |
| Holiday Nest table/routes | **ABSENT** (grep `holiday_calendar` / `att_holiday` = 0) | **RESIDUAL ADD** thin year set · ≠ ATT-03b DONE · thiếu lịch = **CHẶN NỘP** |
| Paper F-ATT-LEAVE-01 / `/core` | Nest named `/att/…` + `@Controller('core')` **ABSENT** | **alias only** · **DENY invent** dual |
| ATT-02 / PLT / CORE-10/09/07 | SEALED stamps | **must_keep** · **DENY wipe** |
| PAY / ATT-09 / ATT-03b deepen | QUEUED | **OUT invent DONE** |

**FORBIDDEN invent this seat:** wipe LIVE spines · Nest `/core` dual · invent PAY/printable/Word DONE · claim client-days = FR-08 / ATT UAT · claim ATT-09/03b DONE · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · seed · honesty flip · apps/** · reopen sealed J-HRM-ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01.

---

## 4. HOLD / residual dispositions (normative)

### 4.1 LIVE spines — **HOLD RETAIN** (mission §1 · §5)

| Physical | Rule |
|----------|------|
| `leave_requests` (+ client `total_days`) | **HOLD RETAIN** · ≠ FR-08 DONE alone |
| `employee_leave_balances` / panel | **HOLD RETAIN** · ≠ ATT-08 DONE · PAY OUT |
| `att_leave_type` / EFF | **HOLD RETAIN** · ≠ ATT-08 DONE alone |
| `expandLeaveDateRange` / `toLeaveDayKey` / funnel | **HOLD RETAIN** · **explicit ≠** BR-BP-LV-05 / FR-08 DONE (**R-ATT-08-≠-EXPAND**) |

### 4.2 Engine result cols — **RESIDUAL ADD stamped** (mission §2)

| Residual | Ruling |
|----------|--------|
| **R-ATT-08-ENGINE** | **ADD stamped** — persist `working_days` · `deductible_units` · `calendar_days` · `unit` (and/or typed snapshot) for BR-BP-LV-05 · gold T6→T2=**2** · FAIL calendar-4 · **ABSENT PROVEN** on LIVE `leave_requests` |
| Prefer physical | Soft cols on **`leave_requests`** — **DENY** Nest `/core` dual leave table · **DENY** greenfield unrelated SoT |
| This seat | **HOLD invent migrate** — stamp only · sa API F.1 → Dev later |
| Preview | **HOLD** ephemeral calc — **no** mandatory preview table (**R-ATT-08-PREVIEW**) |

### 4.3 Holiday year set — **RESIDUAL ADD stamped** (mission §3)

| Residual | Ruling |
|----------|--------|
| **R-ATT-08-HOL** | **ADD stamped** — thin year holiday set **ABSENT PROVEN** Nest · map paper `att_holiday_calendar`+`att_holiday_day` / `holiday_calendar_days` |
| Policy | **Thiếu lịch lễ năm pháp nhân = CHẶN NỘP** (`HRM-LEAVE-HOL-MISSING` / VAL-400) — **no** silent 2xx |
| Explicit ≠ | **≠** claim ATT-03b admin DONE · **≠** invent full lunar/solar admin UAT this seat |
| Prefer physical | `/attendance/holiday-calendars*` under same Nest attendance family — **DENY** Nest `/core` |
| This seat | **HOLD invent migrate** — stamp only |

### 4.4 Leave type unit — **RESIDUAL ADD stamped** (mission §4)

| Residual | Ruling |
|----------|--------|
| **R-ATT-08-UNIT** | **ADD stamped** — `att_leave_type.unit` ∈ `day`\|`hour` · Q-LEAVE-UNIT cả hai theo loại phép · **ABSENT PROVEN** (Nest CREATE has no `unit`; paper DB_DESIGN §4.4 also lacks typed `unit`) |
| Prefer | Soft typed col on LIVE `att_leave_type` — `metadata_json` **may** bridge temporarily · **≠** SoT forever |
| DENY | Hardcode one unit for entire tenant · Nest `/core` dual |

### 4.5 Display-ready DTO — cite (mission §6)

| DTO field | Source / derive | Rule |
|-----------|-----------------|------|
| `deductible_units` | engine × unit | **display-ready** · AC-ATT-08-ENGINE/UNIT |
| `calendar_days` | inclusive range length | Show contrast vs working · FAIL if used as trừ quỹ |
| `working_days` | BR-BP-LV-05 count | Gold T6→T2 = **2** · T7/CN/Lễ = 0 |
| `unit` | leave_type `day`\|`hour` | Q-LEAVE-UNIT · DENY lock one unit CT-wide |
| `excluded_days[]?` | weekend + holiday keys | Optional array · labels VI *Ngày loại* |
| `warnings[]?` | zero-deduction · HOL-MISS · inflate | Optional · ZERO warn · HOL-MISS block submit |

**Residual wire:** sa API may stamp envelope fidelity **ONLY if** closable gap — prefer physical F-ATT-LEAVE-01 cite · **HOLD** schema invent until API locks DTO.

### 4.6 ATT-02 / PLT / CORE seals · Nest `/core` — **RETAIN** (mission §7)

| Stamp | Rule |
|-------|------|
| **`ATT02QC1-MSLQZUK7`** | **must_keep** · **CFG≠ATT-02 DONE** · ≠ ATT UAT · Nest `/core` ATT 0 |
| **`PLT01QC1-MSLPUQIU`** | **must_keep** · peer≠PLT DONE · merge≠platform UAT |
| **`CORE10QC1-MSLP0EJB`** | **must_keep** · ≠ CORE-10 DONE |
| **`CORE09QC1-MSLNBA89`** | printable **false RETAIN** · ≠ CORE-09 DONE |
| **`CORE07QC1-KZJTSHNT`** | GATE/ACT · Nest DENY · ≠ CORE-07 DONE |
| soft≠CORE-06 DONE | **RETAIN** |
| Nest `@Controller('core')` | **ABSENT** · paper alias only · **DENY invent** |

### 4.7 DENY inventory (mission §8)

| DENY | Why |
|------|-----|
| Wipe ATT-02/PLT/CORE-10/09/07/06/05/03/02B/09D..01 | must_keep seals |
| Invent PAY/printable/Word DONE | OUT invent · printable false |
| Claim client `total_days` / calendar expand = ATT-08 DONE | R-ATT-08-≠-CLIENT / ≠-EXPAND |
| Claim ATT-09 hold / ATT-03b admin DONE | R-ATT-08-≠-09 / ≠-03b |
| Claim ATT module UAT / CFG=ATT-02 DONE | O11 · O9 · C-SLICE |
| Claim PLT/CORE DONE | must_keep honesty |
| Nest `/core` dual / honesty flip / reopen sealed J-* | Option A · preserve |
| Seed / `apps/**` | U65 · docs-only |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-08 DONE** · Nest `/core` DENY · C-SLICE · `attendance_uat_ready=false` · CFG≠ATT-02 DONE

---

## 5. Validation matrix (data integrity — HOLD + residual)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-ATT-08-DATA-01 | Submit/list leave_requests | LIVE spine RETAIN | 2xx · F5 · ≠ FR-08 DONE claim from `total_days` alone |
| VAL-ATT-08-DATA-02 | Preview T6→T2 no holiday | BR-BP-LV-05 | `working_days=2` · `calendar_days=4` · FAIL if trừ=4 |
| VAL-ATT-08-DATA-03 | Engine persist after align | residual cols | persisted units = engine · reject client inflate |
| VAL-ATT-08-DATA-04 | Year holiday set ABSENT | HOL-MISS | **CHẶN NỘP** · `HRM-LEAVE-HOL-MISSING` / VAL-400 · ≠ ATT-03b DONE |
| VAL-ATT-08-DATA-05 | Range includes lễ / T7/CN | exclude | trừ = 0 for those days · excluded_days cite |
| VAL-ATT-08-DATA-06 | leave_type unit=day\|hour | Q-LEAVE-UNIT | 0.5d and/or 1h · no CT-wide lock |
| VAL-ATT-08-DATA-07 | expandLeaveDateRange alone | calendar helpers | **≠** BR-BP-LV-05 DONE |
| VAL-ATT-08-DATA-08 | Balance panel cite | ledger RETAIN | **≠** ATT-08 DONE · PAY OUT |
| VAL-ATT-08-DATA-09 | Scope mismatch | U19 list=get=mutate | `HRM-SCOPE-409` / 404 |
| VAL-ATT-08-DATA-10 | Nest `/core` dual | `@Controller('core')` as SoT | **FAIL** O8 |
| VAL-ATT-08-DATA-11 | Claim client-days / ATT-09/03b / ATT UAT | evidence footer | **FAIL** honesty |
| VAL-ATT-08-DATA-12 | Claim CFG=ATT-02 DONE / invent PAY/printable | footer | **FAIL** honesty |

---

## 6. Lifecycle (leave deduction — residual)

| From → To | Legal? | Notes |
|-----------|--------|-------|
| Range + leave_type → preview | YES | Ephemeral · no persist required |
| Preview → submit (holiday OK) | YES | Persist engine units · ALIGN · ≠ ATT-09 DONE |
| Preview → submit (holiday ABSENT) | **NO** | **CHẶN NỘP** · HOL-MISS |
| Client calendar inflate → accept | **NO** | Reject VAL-400 · FAIL AC calendar-4 |
| Engine result → Nest `/core` second SoT | **NO** | DENY dual |
| Holiday residual → claim ATT-03b DONE | **NO** | Peer QUEUED |
| expandLeaveDateRange → claim FR-08 DONE | **NO** | ≠ BR-BP-LV-05 |

Invalid transition → deterministic 4xx (not silent wipe / soft-OK calendar inflate).

---

## 7. Scope parity (U19)

| Surface | Resolver | Rule |
|---------|----------|------|
| leave-requests list/get/mutate | hrm list-scope TEXT slug family | list **=** get-by-id **=** mutate |
| preview-deduction | same company scope on body/query | U19 membership · no cross-CT mutate |
| leave-balance / panel | same family | **Cite RETAIN** |
| leave-types / EFF | att_leave_type company scope | **Cite RETAIN** |
| holiday year set (residual) | same attendance company scope | If ADD — **MUST** same resolver · else `scope_parity` defect |

**Flag:** If residual ADD introduces holiday calendar keys, sa API **MUST** document list=get=mutate parity — else `scope_parity` defect.

---

## 8. Traceability (requirement → physical → API → FE → test)

| BR/AC | Physical | API | FE / J-* | Evidence expect |
|-------|----------|-----|----------|-----------------|
| BR-BP-LV-05 · AC-ATT-08-ENGINE/GOLD/FAIL-CAL | residual engine cols on `leave_requests` | F-ATT-LEAVE-01 physical `/attendance/*` | **J-HRM-ATT-08-01/02** DRAFT | T6→T2=**2** not 4 · Nest `/core` 0 |
| AC-ATT-08-PREVIEW | HOLD calc | `POST …/preview-deduction` | **J-01** | DTO display-ready |
| AC-ATT-08-HOL/HOL-MISS/WE/ZERO | residual holiday year set | F-ATT-HOL-01 peer cite | **J-03/04** | exclude · CHẶN NỘP · warn · ≠ ATT-03b DONE |
| AC-ATT-08-UNIT | residual `att_leave_type.unit` | F-ATT-CAT-LVT/EFF | **J-05** | 0.5d / 1h |
| AC-ATT-08-ALIGN · ≠-09 | LIVE leave_requests | F-ATT-LEAVE-02/03 RETAIN | **J-01/06** | engine consume · ≠ ATT-09 DONE |
| AC-ATT-08-≠-EXPAND | expand/funnel RETAIN | helpers | footer | ≠ BR-BP-LV-05 DONE |
| AC-ATT-08-PATH | Nest `/attendance` | paper `/att`+`/core` alias | all J-* | Nest `/core` **0** |
| AC-ATT-08-MK-* / H / PAY-OUT | seals | — | footer | ATT-02/PLT/CORE ≠ DONE · printable false · CFG≠DONE · C-SLICE |

---

## 9. Unlock next — sa API-01

| | |
|--|--|
| **next_owner** | **sa** |
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01` |
| **Mission** | F.1 deepen **F-ATT-LEAVE-01** physical prefer `POST /api/hrm/attendance/leave-requests/preview-deduction` · RETAIN cite F-ATT-LEAVE-02/03 · F-ATT-HOL-01 peer · F-ATT-CAT-LVT/EFF · paper `/att` + `/core` **alias only** · cite this DATA-01 physical prefer · residual wire **ONLY if** closable gap (engine/holiday/unit display-ready) · **DENY** Nest dual · invent PAY/printable · claim client-days=ATT-08 DONE · claim ATT-09/03b DONE · claim ATT UAT · CFG=ATT-02 DONE · seed · apps/** |
| **cấm** | Dev invent migrate before API F.1 · Nest `/core` SoT · wipe ATT-02/PLT/CORE · honesty flip |

---

## Footer — honesty

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-08 DONE** · client `total_days`/calendar expand ≠ FR-08 DONE · ≠ ATT-09/ATT-03b DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · must_keep ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · no apps/**

---

## Handoff contract

```yaml
work_item_id: PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01
from_role: ba-data
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md
completion_report: |
  CONFIRMED HOLD — LIVE leave_requests (client total_days) / employee_leave_balances /
  att_leave_type/EFF / expandLeaveDateRange+funnel RETAIN (≠ FR-08 / BR-BP-LV-05 DONE alone);
  residual ADD stamped closable for engine result cols on leave_requests (ABSENT PROVEN) ·
  thin holiday year set (ABSENT Nest · thiếu lịch=CHẶN NỘP · ≠ ATT-03b DONE) ·
  att_leave_type.unit day|hour (ABSENT PROVEN · Q-LEAVE-UNIT);
  PREVIEW HOLD calc (no mandatory table); ALIGN HOLD wire · ≠ ATT-09 DONE;
  display-ready cite deductible_units·calendar_days·working_days·unit·excluded_days[]?·warnings[]?;
  must_keep ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB ·
  CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY;
  DENY wipe peers · invent PAY/printable/Word DONE · claim client-days=ATT-08 DONE ·
  claim ATT-09/03b DONE · claim ATT UAT · CFG=ATT-02 DONE · honesty flip · reopen sealed J-* ·
  seed · apps/** · NO migrate this seat.
next_owner: sa
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01
  role: sa
  program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-26 seat #28)
  entry_criteria: DATA-01 CONFIRMED HOLD @ docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md · BA O1–O12 · SA Option A · residual ADD stamped engine cols + holiday year set + leave_type.unit closable · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · PAY OUT · printable false
  read_first:
    - docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md
    - docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md
    - docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01.md
    - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-LEAVE-01 · F-ATT-HOL-01 · F-ATT-LEAVE-02/03 · F-ATT-CAT-LVT/EFF
  exit_criteria: API-01 F.1 deepen F-ATT-LEAVE-01 physical POST /api/hrm/attendance/leave-requests/preview-deduction · RETAIN F-ATT-LEAVE-02/03 · F-ATT-HOL-01 peer cite · paper /att+/core alias only · display-ready deductible_units·calendar_days·working_days·unit·excluded_days[]?·warnings[]? · residual wire ONLY if closable (engine/holiday/unit) · DENY Nest /core dual · DENY invent PAY/printable/Word · DENY claim client-days=ATT-08 DONE · DENY claim ATT-09/ATT-03b DONE · DENY ATT UAT · DENY CFG=ATT-02 DONE · DENY seed · DENY apps/** · evidence docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md · PASS_TO_PM
  cấm: apps/** · seed · Nest /core invent · wipe ATT-02/PLT/CORE · honesty flip · claim ATT module UAT · invent PAY/printable DONE · claim ATT-09/03b DONE · migrate invent before F.1 lock
```

---

*End DATA-01 · CONFIRMED HOLD · 2026-08-09*
