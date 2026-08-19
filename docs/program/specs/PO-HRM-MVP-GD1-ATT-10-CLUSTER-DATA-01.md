# PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN attendance_sheets + att_timesheet_line funnel (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-28 seat **#30**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE `public.attendance_sheets` · `public.att_timesheet_line` AGG writer cols · **NO** second hour ledger · **NO** invent `att_leave_hold` dual · **NO** Nest `/core` table dual · **NO** wipe ATT-09 hold/settle · **NO** wipe ATT-08 preview · **NO** wipe ATT-02/PLT/CORE · **NO** wipe soft≠CORE-06 DONE · **NO** invent PAY / printable / Word DONE · **NO CODE** `apps/**` · **no seed** · **preserve_default** · HOL/MEAL/−penalty **HOLD** (ADD residual **ONLY if** closable writer/formula proven — **not** proven this seat) |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — LIVE **`attendance_sheets` + `att_timesheet_line`** = phễu SoT giờ công tính lương · AGG writer cols **RETAIN** · **≠** FR-10 / ATT-10 DONE from AGG alone · payable gold GĐ1 = `standard_hours + paid_leave_hours + ot_hours_weighted` · `late_penalty_hours` **display-only** · unpaid **excluded** · −penalty **OUT GĐ1** · HOL/MEAL **OUT GĐ1** · unlock **sa API-01** F.1 **F-ATT-SHEET-01/AGG** physical `/api/hrm/attendance/attendance-sheets*` — residual wire **ONLY if** closable · **PAY OUT invent DONE** · **printable false RETAIN** · **≠ ATT-11/PAY DONE** · **≠ ATT UAT** · **soft/ATT-08≠ATT-09 DONE** · **CFG≠ATT-02 DONE** |
| **uc_ids** | `UC-BP-ATT-10` · `FR-UC-BP-ATT-10` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md) · **R-ATT-10-FUNNEL/STD/LEAVE/HOL/MEAL/PAYABLE/OT/WARN/DISP** · **R-ATT-10-≠-*** · **R-ATT-10-PAY-OUT** · printable false · QC ATT-09 **`ATT09QC1-MSLUTL9D`** (hold/settle · `pending_days` · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT) · evidence [`po-hrm-mvp-gd1-att-09-cluster-qc-01.md`](../../qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qc-01.md) · QA **`ATT09QA2-MSLUKI9U`** · must_keep ATT-08 **`ATT08QC1-MSLSL36C`** · ATT-02 **`ATT02QC1-MSLQZUK7`** · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** printable false · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · PAY invent DONE **OUT** |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md) · O1–O12 · AC-ATT-10-* · R-ATT-10-* |
| **ref_att09_data** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md) — stamp `ATT09QC1-MSLUTL9D` · held=`pending_days` · DENY `att_leave_hold` |
| **ref_att08_data** | [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md) — stamp `ATT08QC1-MSLSL36C` · preview RETAIN |
| **ref_att02_data** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md) — stamp `ATT02QC1-MSLQZUK7` · CFG≠DONE |
| **ref_plt_data** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md) — stamp `PLT01QC1-MSLPUQIU` |
| **ref_core10_data** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md) — stamp `CORE10QC1-MSLP0EJB` |
| **ref_core09_data** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md) — printable **false** · ≠ CORE-09 DONE |
| **ref_core07_data** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md) — GATE/ACT · Nest `/core` DENY |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.6 · §4.6.2 bridge — logical `att_timesheet_header` = LIVE **`public.attendance_sheets`** · LIVE **`public.att_timesheet_line`** (AGG SoT) · Nest `@Controller('core')` **ABSENT** · paper `/att` + `/core` **alias only** · prior [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01.md`](./PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01.md) |
| **ref_paper_api** | **F-ATT-SHEET-01** / **F-ATT-SHEET-AGG-01** (aggregate write) · submit **must** invoke AGG · peer **F-ATT-SHEET-02/03/04** + WF-SIGN (**ATT-11 OUT** invent DONE) · Nest `@Controller('core')` **ABSENT** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-10** · Diễn biến **#1–#3 + Thành công** · **BR-BP-TS-01** · phễu SoT · partner **REQ_L_001** · UC kế = **ATT-11** (**OUT** invent DONE) |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/attendance-sheets*` · paper `/att` + `/core` alias only · U19 · soft-delete · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** second hour ledger |
| **ref_code_cite** | `attendance.controller` `@Controller('attendance')` · `POST attendance-sheets/:sheetId/aggregate` · `POST …/submit` (calls AGG) · `att-timesheet-line-aggregate.ts` · sources `attendance_records` · `overtime_requests` · `late_early_requests` · Nest `@Controller('core')` **ABSENT** — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim LIVE AGG alone = ATT-10 DONE · **DENY** claim ATT-11/PAY DONE · **DENY** claim soft/ATT-08=ATT-09 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** CFG=ATT-02 DONE · **DENY** invent `att_leave_hold` · honesty flip |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| **Funnel SoT** | **HOLD RETAIN** — LIVE **`public.attendance_sheets`** (header alias) + **`public.att_timesheet_line`** = ONE phễu giờ công tính lương — **DENY** second hour ledger · **DENY** invent `att_leave_hold` dual |
| **AGG writer cols** | **HOLD RETAIN** LIVE writer path (`standard_hours` · `ot_hours_weighted` · `paid_leave_hours` · `unpaid_leave_hours` · `payable_hours` · `late_penalty_hours` · `work_days` · `line_locked` · warnings) — **explicit ≠** FR-10 / ATT-10 DONE from AGG alone |
| **Payable gold GĐ1** | **HOLD RETAIN** = `standard_hours + paid_leave_hours + ot_hours_weighted` (±0.01) · `late_penalty_hours` **display-only** · **not** subtracted GĐ1 · `unpaid_leave_hours` **excluded** · −penalty into payable = **OUT GĐ1** |
| **R-ATT-10-HOL** | **OUT GĐ1** — dedicated `holiday_hours` writer **ABSENT** · footer ABSENT · **ADD ONLY if** closable writer proven |
| **R-ATT-10-MEAL** | **OUT GĐ1** — `meal_shift_hours` NULL · writer **ABSENT** · **ADD ONLY if** closable writer proven |
| **R-ATT-10-FUNNEL / STD / LEAVE / OT / WARN / DISP** | **HOLD** AC harden — no schema invent this seat · interim default-8 STD OK · leave via day-records cite ATT-09 · OT weighted only · warnings[] cite |
| **R-ATT-10-PAYABLE** | **HOLD** gold formula RETAIN · ADD −penalty **ONLY if** closable later |
| Display-ready DTO | **Cite** §4.5 — `sheet_id` · `status` · `statusLabelVi` · `line_count` · `warnings[]` · `lines[…]` |
| Nest path | Physical `/api/hrm/attendance/attendance-sheets*` · Nest `@Controller('core')` **ABSENT** · paper `/att` + `/core` **alias only** |
| ATT-09 hold/settle | **must_keep** · stamp **`ATT09QC1-MSLUTL9D`** · held=`pending_days` · DENY `att_leave_hold` · Nest `/core` leave 0 · soft/ATT-08≠ATT-09 DONE |
| ATT-08 preview | **must_keep** · stamp **`ATT08QC1-MSLSL36C`** |
| ATT-02 CFG | **must_keep** · stamp **`ATT02QC1-MSLQZUK7`** · **CFG≠ATT-02 DONE** · late_penalty peer |
| PLT-01 | **must_keep** · stamp **`PLT01QC1-MSLPUQIU`** · peer≠PLT DONE |
| CORE-10 | **must_keep** · stamp **`CORE10QC1-MSLP0EJB`** · ≠ CORE-10 DONE |
| CORE-09 printable | **must_keep** · stamp **`CORE09QC1-MSLNBA89`** · printable **false** · ≠ CORE-09 DONE |
| CORE-07 GATE/ACT | **must_keep** · stamp **`CORE07QC1-KZJTSHNT`** · Nest DENY · soft≠CORE-06 DONE |
| ATT-11 / PAY / printable / Word | **OUT invent DONE** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim AGG=ATT-10 DONE · ATT-11/PAY DONE · ATT UAT · soft/ATT-08=ATT-09 DONE · CFG=ATT-02 · PLT/CORE DONE |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `att_timesheet_header` | LIVE **`public.attendance_sheets`** | **HOLD RETAIN** · ONE header · **DENY** dual header |
| `period_from` / `period_to` | `start_date` / `end_date` | alias only |
| `att_timesheet_line` | LIVE **`public.att_timesheet_line`** | **HOLD RETAIN** · UQ `(header_id, employee_id)` · **DENY** second hour ledger |
| F-ATT-SHEET-01 / AGG-01 | **`POST /api/hrm/attendance/attendance-sheets/{sheetId}/aggregate`** | **HOLD RETAIN** · ≠ FR-10 DONE alone |
| Submit → AGG | **`POST …/attendance-sheets/{sheetId}/submit`** | **HOLD RETAIN** · **must** invoke AGG |
| GET sheet + lines | **`GET …/attendance-sheets/{id}`** | peer RETAIN · ≠ ATT-10 DONE · ≠ PAY DONE |
| Close / reopen / sign | F-ATT-SHEET-02/03/04 + WF-SIGN | **ATT-11 OUT** invent = ATT-10 DONE |
| `holiday_hours` dedicated | **ABSENT** | **OUT GĐ1** · ADD only if closable |
| `meal_shift_hours` writer | Col may exist **NULL** · writer **ABSENT** | **OUT GĐ1** · ADD only if closable |
| Payable − late_penalty | LIVE does **not** subtract | **OUT GĐ1** formula change · ADD only if closable |
| Paper held / `att_leave_hold` | LIVE **`employee_leave_balances.pending_days`** (ATT-09) | **must_keep** · **DENY invent dual** |
| Nest `/core` sheet/AGG table | — | **DENY invent** |
| Paper `/core` / `/att` | Alias only | **DENY** Nest dual SoT |
| ATT-09/08/02/PLT/CORE peers | seals | **must_keep** · ≠ claim DONE |

```text
  public.attendance_sheets (LIVE — HOLD RETAIN · header alias att_timesheet_header)
        RETAIN: id · company_id · start_date/end_date · status open|submitted|closed · …
        DENY invent second header table
                │
                │ 1──N (UQ header_id, employee_id)
                ▼
  public.att_timesheet_line (LIVE — HOLD RETAIN · phễu SoT giờ công tính lương)
        RETAIN writer cols:
          standard_hours · ot_hours_weighted · paid_leave_hours · unpaid_leave_hours
          payable_hours (= gold GĐ1: std + paidLeave + otWeighted)
          late_penalty_hours (display · NOT subtracted GĐ1)
          work_days · line_locked
        OUT GĐ1: holiday_hours writer ABSENT · meal_shift_hours NULL/writer ABSENT
        DENY invent second hour ledger / PAY shadow copy punch
                │
                │ Sources (HOLD RETAIN cite)
                ▼
  attendance_records · overtime_requests (approved × coef) · late_early_requests
  leave → paid/unpaid via day-record path · cite ATT-09 approved upstream
                │
                │ Physical API (HOLD RETAIN)
                ▼
  POST /api/hrm/attendance/attendance-sheets/{sheetId}/aggregate
  POST …/attendance-sheets/{sheetId}/submit   (MUST call AGG · OPEN-Q2 FROZEN)
  GET  …/attendance-sheets/{id}               (peer · ≠ ATT-10/PAY DONE)
  Paper /att/… + /core/… = ALIAS ONLY
  Closed mutate → 409 HRM-ATT-SHEET-LOCKED

  Display-ready DTO (cite · HOLD schema until Dev after API):
        sheet_id · status · statusLabelVi · line_count · warnings[]
        lines: [{ employee_id, employee_name?, standard_hours, ot_hours_weighted,
                  paid_leave_hours, unpaid_leave_hours, late_penalty_hours,
                  meal_shift_hours?, holiday_hours?, payable_hours, work_days, line_locked }]
        meal_shift_hours / holiday_hours may be null/ABSENT GĐ1 (footer OUT)

  ATT09QC1-MSLUTL9D hold/settle pending_days · DENY att_leave_hold ·
  ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU ·
  CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT ·
  soft≠CORE-06 · Nest /core DENY
        SEALED must_keep

  FORBIDDEN GĐ1 this seat:
        Invent second hour ledger · invent att_leave_hold dual · Nest /core dual
        Wipe LIVE sheets/lines AGG · wipe ATT-09/08/02/PLT/CORE
        Invent PAY/printable/Word DONE · invent HOL/MEAL writer without closable ADD
        Claim AGG alone = ATT-10 DONE · claim ATT-11/PAY DONE · claim ATT UAT
        Claim soft/ATT-08=ATT-09 DONE · CFG=ATT-02 DONE · PLT/CORE DONE
        Honesty flip · reopen sealed J-* · seed · apps/**
```

**Label lock:** Board «Tổng hợp bảng công (phễu giờ công tính lương)» GĐ1 = **LIVE `attendance_sheets` + `att_timesheet_line` AGG RETAIN** — **not** Nest `/core` dual · **not** second ledger · **not** AGG alone = FR-10 DONE.  
**Spine lock:** Physical `/api/hrm/attendance/attendance-sheets*` — **DENY** Nest `/core` second SoT · paper `/att`+`/core` alias only.  
**Payable gold lock:** `payable_hours = standard_hours + paid_leave_hours + ot_hours_weighted` — penalty display · unpaid excluded · −penalty **OUT GĐ1**.  
**Honesty lock:** `attendance_uat_ready=false` · printable false · C-SLICE · PAY OUT · ≠ ATT-10 DONE · ≠ ATT-11/PAY DONE · soft/ATT-08≠ATT-09 DONE · CFG≠ATT-02 DONE.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-10 DONE** · AGG alone ≠ FR-10 DONE · ≠ ATT-11/PAY DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · must_keep ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · DENY invent `att_leave_hold` · no seed · no apps/**

---

## 3. AS-IS baseline (Nest facts — read-only cite · 2026-08-09)

| Object | AS-IS LIVE | Gap (Wave-28 DATA) |
|--------|------------|---------------------|
| **`public.attendance_sheets`** | Header alias LIVE | **HOLD RETAIN** · ≠ FR-10 DONE alone |
| **`public.att_timesheet_line`** | AGG UPSERT LIVE · UQ `(header_id, employee_id)` | **HOLD RETAIN** · funnel AC residual |
| **`POST …/aggregate`** | Materialize lines · warnings · closed 409 | **HOLD RETAIN** · ≠ ATT-10 DONE from AGG alone |
| **`POST …/submit`** | Must call AGG (OPEN-Q2 FROZEN) | **HOLD RETAIN** · F5 AC |
| Payable formula | `std + paidLeave + ot` · penalty **not** subtracted | **HOLD gold GĐ1** · −penalty **OUT** |
| `holiday_hours` writer | **ABSENT** | **OUT GĐ1** · ADD only if closable |
| `meal_shift_hours` writer | NULL / writer **ABSENT** | **OUT GĐ1** · ADD only if closable |
| STD beyond default-8 | Interim default-8 / punch capped | **HOLD** residual STD · ≠ STD DONE if interim |
| Leave into funnel | Via `attendance_records` leave · cite ATT-09 | **HOLD** · DENY invent leave HTTP in PAY · DENY `att_leave_hold` |
| Close / sign peers | PRESENT (ATT-11) | **peer RETAIN** · **OUT invent = ATT-10 DONE** |
| Paper F-ATT-SHEET-01 / `/core` | Nest `@Controller('core')` **ABSENT** | **alias only** · **DENY invent** dual |
| ATT-09/08/02/PLT/CORE | SEALED stamps | **must_keep** · **DENY wipe** |
| ATT-11 / PAY deepen | QUEUED | **OUT invent DONE** |

**FORBIDDEN invent this seat:** wipe LIVE sheets/lines · Nest `/core` dual · invent second hour ledger · invent `att_leave_hold` · invent PAY/printable/Word DONE · claim AGG = FR-10 / ATT UAT · claim ATT-11/PAY DONE · claim soft/ATT-08=ATT-09 DONE · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · seed · honesty flip · apps/** · reopen sealed J-HRM-ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01.

---

## 4. HOLD / residual dispositions (normative)

### 4.1 Funnel SoT + AGG cols — **HOLD RETAIN** (mission §1–§2)

| Physical | Rule |
|----------|------|
| `attendance_sheets` + `att_timesheet_line` | **HOLD RETAIN** · ONE phễu SoT · **DENY** second hour ledger |
| AGG writer cols LIVE | **HOLD RETAIN** · **≠** FR-10 DONE from AGG alone (**R-ATT-10-≠-DONE**) |
| Submit→AGG | **HOLD RETAIN** · lines PRESENT after 2xx · F5 |

### 4.2 Payable gold GĐ1 — **HOLD RETAIN** (mission §3)

| Residual | Ruling |
|----------|--------|
| **R-ATT-10-PAYABLE** | Gold = `standard_hours + paid_leave_hours + ot_hours_weighted` (±0.01) |
| Penalty | `late_penalty_hours` **PRESENT display** · **NOT** subtracted GĐ1 |
| Unpaid | `unpaid_leave_hours` **PRESENT** · **excluded** from payable |
| −penalty into payable | **OUT GĐ1** · **ADD ONLY if** closable formula change proven later |
| DENY | FE invent PAY formula · claim PAY DONE from AGG cite |

### 4.3 HOL / MEAL — **OUT GĐ1** (mission §4)

| Residual | Ruling |
|----------|--------|
| **R-ATT-10-HOL** | Dedicated holiday hours writer **ABSENT** · footer **OUT GĐ1** · **ADD ONLY if** closable `holiday_hours` (or equiv) proven |
| **R-ATT-10-MEAL** | `meal_shift_hours` NULL · writer **ABSENT** · footer **OUT GĐ1** · **ADD ONLY if** closable writer proven |
| DENY | Silent invent HOL/MEAL ledger · force meal into payable GĐ1 without policy · claim missing HOL/MEAL = ATT-10 module FAIL when footer OUT |

### 4.4 STD / LEAVE / OT / WARN — **HOLD** AC (no schema ADD stamped)

| Residual | Ruling |
|----------|--------|
| **R-ATT-10-STD** | Interim default-8 **accepted** · **≠** claim STD DONE · no new col for interim |
| **R-ATT-10-LEAVE** | Day-record leave → paid/unpaid · cite ATT-09 · **DENY** invent leave HTTP in PAY · **DENY** `att_leave_hold` |
| **R-ATT-10-OT** | Only weighted OT in payable · raw OT = **FAIL** · LIVE coef path RETAIN · DENY PAY re-multiply |
| **R-ATT-10-WARN** | `warnings[]` AC · block-chốt = ATT-11 peer · **≠** invent ATT-11 DONE |

### 4.5 Display-ready DTO — cite (mission §5)

| DTO field | Source / derive | Rule |
|-----------|-----------------|------|
| `sheet_id` | header id | display-ready |
| `status` | header status | open\|submitted\|closed |
| `statusLabelVi` | wire/derive | VI label |
| `line_count` | lines length | ≥0 after AGG |
| `warnings[]` | AGG codes LIVE | `AGG_SHEET_DATE_INVALID` · `AGG_RECORDS_UNAVAILABLE` · `AGG_OT_ENROLL_UNAVAILABLE` · `AGG_EMPTY_ENROLLMENT` · `AGG_LINE_COUNT_ZERO` |
| `lines[].employee_id` | line | required |
| `lines[].employee_name?` | enrich optional | display |
| `lines[].standard_hours` | LIVE | PRESENT · interim OK |
| `lines[].ot_hours_weighted` | LIVE × coef | PRESENT · FAIL if raw in payable |
| `lines[].paid_leave_hours` | LIVE | PRESENT |
| `lines[].unpaid_leave_hours` | LIVE | PRESENT · ∉ payable |
| `lines[].late_penalty_hours` | LIVE | display · not −payable GĐ1 |
| `lines[].meal_shift_hours?` | NULL/ABSENT GĐ1 | footer OUT |
| `lines[].holiday_hours?` | ABSENT GĐ1 | footer OUT |
| `lines[].payable_hours` | gold formula | assert ±0.01 |
| `lines[].work_days` | LIVE | PRESENT |
| `lines[].line_locked` | LIVE | true when closed |

**Residual wire:** sa API may stamp envelope fidelity **ONLY if** closable gap — prefer physical F-ATT-SHEET-01 cite · **HOLD** schema invent until API locks DTO.

### 4.6 ATT-09/08/02/PLT/CORE seals · Nest `/core` — **RETAIN** (mission §6)

| Stamp | Rule |
|-------|------|
| **`ATT09QC1-MSLUTL9D`** | **must_keep** · hold/settle · `pending_days` · DENY `att_leave_hold` · Nest `/core` leave 0 · soft/ATT-08≠ATT-09 DONE · ≠ ATT UAT |
| **`ATT08QC1-MSLSL36C`** | **must_keep** · preview RETAIN · ≠ wipe · ≠ ATT-08=ATT-09 DONE |
| **`ATT02QC1-MSLQZUK7`** | **must_keep** · **CFG≠ATT-02 DONE** · late_penalty peer · ≠ ATT UAT |
| **`PLT01QC1-MSLPUQIU`** | **must_keep** · peer≠PLT DONE · merge≠platform UAT |
| **`CORE10QC1-MSLP0EJB`** | **must_keep** · ≠ CORE-10 DONE |
| **`CORE09QC1-MSLNBA89`** | printable **false RETAIN** · ≠ CORE-09 DONE |
| **`CORE07QC1-KZJTSHNT`** | GATE/ACT · Nest DENY · ≠ CORE-07 DONE |
| soft≠CORE-06 DONE | **RETAIN** |
| Nest `@Controller('core')` | **ABSENT** · paper alias only · **DENY invent** |

### 4.7 DENY inventory (mission §8)

| DENY | Why |
|------|-----|
| Second hour ledger / PAY shadow punch hours | Funnel SoT ONE |
| Invent `att_leave_hold` dual | ATT-09 held=`pending_days` |
| Nest `/core` dual AGG/sheet | Option A · O9 |
| Wipe ATT-09/08/02/PLT/CORE | must_keep seals |
| Invent PAY/printable/Word DONE | OUT invent · printable false |
| Claim AGG alone = ATT-10 DONE | R-ATT-10-≠-DONE · C-SLICE |
| Claim ATT-11 close/sign = ATT-10 DONE | R-ATT-10-≠-11 |
| Claim soft/ATT-08 = ATT-09 DONE | O10 · ATT09 seal |
| Claim ATT module UAT / CFG=ATT-02 DONE | O10/O12 |
| Claim PLT/CORE DONE | must_keep honesty |
| Invent HOL/MEAL writer without closable ADD | OUT GĐ1 |
| Honesty flip / reopen sealed J-* / seed / apps/** | preserve · U65 · docs-only |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-10 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE · `attendance_uat_ready=false` · CFG≠ATT-02 DONE · soft/ATT-08≠ATT-09 DONE

---

## 5. Validation matrix (data integrity — HOLD)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-ATT-10-DATA-01 | AGG / submit on open sheet | LIVE spine RETAIN | UPSERT lines · Nest `/core` 0 · ≠ FR-10 DONE claim from AGG alone |
| VAL-ATT-10-DATA-02 | After AGG | gold payable | `payable_hours === standard + paidLeave + otWeighted` (±0.01) |
| VAL-ATT-10-DATA-03 | Late penalty written | display-only GĐ1 | `late_penalty_hours` present · **not** subtracted from payable |
| VAL-ATT-10-DATA-04 | Unpaid leave hours | excluded | unpaid **not** added to payable |
| VAL-ATT-10-DATA-05 | OT into payable | weighted only | raw OT in payable = **FAIL** |
| VAL-ATT-10-DATA-06 | HOL / MEAL GĐ1 | footer OUT | null/ABSENT OK · no silent invent · ADD only if closable |
| VAL-ATT-10-DATA-07 | Submit 2xx | must AGG | lines PRESENT · F5 còn |
| VAL-ATT-10-DATA-08 | Sheet closed | mutate AGG/submit | **409** `HRM-ATT-SHEET-LOCKED` |
| VAL-ATT-10-DATA-09 | Scope mismatch | U19 list=get=mutate | `HRM-SCOPE-409` / 404 |
| VAL-ATT-10-DATA-10 | Nest `/core` dual | `@Controller('core')` as SoT | **FAIL** O9 |
| VAL-ATT-10-DATA-11 | Invent `att_leave_hold` / second ledger | schema/grep | **FAIL** |
| VAL-ATT-10-DATA-12 | Claim AGG=DONE / ATT-11/PAY / ATT UAT / CFG=02 / soft=09 / invent PAY/printable | evidence footer | **FAIL** honesty |

---

## 6. Lifecycle (sheet funnel — HOLD)

| From → To | Legal? | Notes |
|-----------|--------|-------|
| Open sheet → AGG | YES | UPSERT lines · warnings maybe · ≠ ATT-10 DONE alone |
| Open → submit (calls AGG) | YES | Lines PRESENT · status → submitted peer · ≠ ATT-11 DONE |
| Re-AGG same sheet | YES | Idempotent UQ `(header_id, employee_id)` |
| Closed → AGG/submit | **NO** | 409 LOCKED |
| Raw OT → payable | **NO** | FAIL AC-ATT-10-FAIL-RAW-OT |
| −penalty → payable GĐ1 | **NO** (OUT) | unless later closable ADD |
| HOL/MEAL invent silent | **NO** | footer OUT · ADD only if closable |
| AGG → Nest `/core` second SoT | **NO** | DENY dual |
| AGG alone → claim FR-10 / ATT UAT | **NO** | C-SLICE |
| Close/sign → claim ATT-10 DONE | **NO** | ATT-11 OUT invent |

Invalid transition → deterministic 4xx (not silent wipe / soft-OK dual ledger).

---

## 7. Scope parity (U19)

| Surface | Resolver | Rule |
|---------|----------|------|
| attendance-sheets list/get/mutate/aggregate/submit | hrm list-scope TEXT slug family | list **=** get-by-id **=** mutate AGG |
| Lines under sheet | same company scope as header | no cross-CT line write |
| ATT-09 leave peers (cite) | same attendance family | **must_keep** · held=`pending_days` |
| ATT-02 late_penalty peer | same family | **CFG≠ATT-02 DONE** |

**Flag:** If residual ADD later introduces HOL/MEAL cols/writers, sa API **MUST** document list=get=mutate parity — else `scope_parity` defect.

---

## 8. Traceability (requirement → physical → API → FE → test)

| BR/AC | Physical | API | FE / J-* | Evidence expect |
|-------|----------|-----|----------|-----------------|
| BR-BP-TS-01 · AC-ATT-10-AGG/FUNNEL/PAYABLE/GOLD/OT | LIVE `attendance_sheets` + `att_timesheet_line` | F-ATT-SHEET-01 / AGG physical `/attendance/attendance-sheets*` | **J-HRM-ATT-10-01..06** DRAFT | gold payable · Nest `/core` 0 · ≠ AGG=DONE |
| AC-ATT-10-SUBMIT/F5 | submit→AGG | `POST …/submit` | **J-02/06** | lines after 2xx · F5 |
| AC-ATT-10-FOOTER HOL/MEAL | OUT GĐ1 | — | footer | ABSENT/null OK · no invent |
| AC-ATT-10-LEAVE · MK-ATT09 | day-records + ATT-09 cite | peer leave paths | **J-03** | unpaid ∉ payable · DENY `att_leave_hold` |
| AC-ATT-10-WARN · ≠-11 | warnings[] | AGG response | **J-04** | warn codes · ≠ invent ATT-11 DONE |
| AC-ATT-10-DISP | display-ready DTO | GET/AGG body | **J-05** | FE bind |
| AC-ATT-10-PATH | Nest `/attendance` | paper `/att`+`/core` alias | all J-* | Nest `/core` **0** |
| AC-ATT-10-MK-* / H / PAY-OUT | seals | — | footer | ATT-09/08/02/PLT/CORE ≠ DONE · printable false · CFG≠DONE · C-SLICE · soft≠09 DONE |

---

## 9. Unlock next — sa API-01

| Field | Value |
|-------|--------|
| **next_owner** | **sa** |
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01` |
| **Mission** | F.1 deepen **F-ATT-SHEET-01** / **F-ATT-SHEET-AGG-01** physical prefer `POST /api/hrm/attendance/attendance-sheets/{sheetId}/aggregate` (+ submit must AGG) · RETAIN cite GET peer · paper `/att` + `/core` **alias only** · cite this DATA-01 physical prefer · display-ready sheet DTO · residual wire **ONLY if** closable (FUNNEL/STD/LEAVE/PAYABLE/OT/WARN/DISP — **not** invent HOL/MEAL/−penalty DONE) · **DENY** Nest dual · invent second ledger · invent `att_leave_hold` · invent PAY/printable · claim AGG=ATT-10 DONE · claim ATT-11/PAY DONE · claim ATT UAT · soft/ATT-08=ATT-09 DONE · CFG=ATT-02 DONE · seed · apps/** |
| **cấm** | Dev invent migrate before API F.1 · Nest `/core` SoT · wipe ATT-09/08/02/PLT/CORE · honesty flip |

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §11 |
| **next_owner** | `sa` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md` |
| **next_dispatch_prompt** | See §12 |

---

## 11. completion_report

**Closed:** ba-data **CONFIRMED HOLD** for UC-BP-ATT-10 / FR-UC-BP-ATT-10 — LIVE **`public.attendance_sheets` + `public.att_timesheet_line`** = ONE phễu SoT (**DENY** second hour ledger · **DENY** invent `att_leave_hold`); **HOLD RETAIN** AGG writer cols (**≠** FR-10 DONE from AGG alone); payable gold GĐ1 = `standard_hours + paid_leave_hours + ot_hours_weighted` · `late_penalty_hours` display-only · unpaid excluded · −penalty **OUT GĐ1**; HOL/MEAL **OUT GĐ1** (ADD only if closable writer proven); cite display-ready **sheet_id · status · statusLabelVi · line_count · warnings[] · lines[…]**; **must_keep** ATT09QC1-MSLUTL9D hold/settle `pending_days` · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · soft/ATT-08≠ATT-09 DONE · ≠ ATT UAT · PAY OUT; DENY wipe peers · invent PAY/printable/Word · claim AGG=ATT-10 DONE · claim ATT-11/PAY DONE · claim ATT UAT · honesty flip · seed · apps/** · NO migrate this seat.

**Residual open (API/FE — not DATA schema ADD this seat):** R-ATT-10-FUNNEL/STD/LEAVE/PAYABLE/OT/WARN/DISP AC wire + U65 J-HRM-ATT-10-* — unlock **sa API** F.1 F-ATT-SHEET-01/AGG. HOL/MEAL/−penalty remain **OUT GĐ1** unless closable ADD proven later.

---

## 12. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-28 seat #30)
uc_ids: UC-BP-ATT-10 · FR-UC-BP-ATT-10
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA Option A · R-ATT-10-FUNNEL/STD/LEAVE/HOL/MEAL/PAYABLE/OT/WARN/DISP · printable false · ATT09QC1-MSLUTL9D hold/settle pending_days DENY att_leave_hold · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · soft/ATT-08≠ATT-09 DONE · ≠ ATT UAT · PAY OUT · DENY second hour ledger
spec_ref: F-ATT-SHEET-01 / F-ATT-SHEET-AGG-01 physical prefer POST /api/hrm/attendance/attendance-sheets/{sheetId}/aggregate · POST …/submit must AGG · GET …/attendance-sheets/{id} peer cite · paper /att + /core alias only · LIVE attendance_sheets + att_timesheet_line = phễu SoT · payable gold = standard+paidLeave+otWeighted · late_penalty display · unpaid excluded · HOL/MEAL OUT GĐ1 · display-ready sheet_id·status·statusLabelVi·line_count·warnings[]·lines[] · ≠ AGG=ATT-10 DONE · ≠ ATT-11/PAY DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE · soft/ATT-08≠ATT-09 DONE

MISSION — API F.1 (docs-only · RETAIN cite · wire residual ONLY if closable):
1) CONFIRM RETAIN F-ATT-SHEET-01/AGG physical POST /api/hrm/attendance/attendance-sheets/{sheetId}/aggregate — UPSERT att_timesheet_line — paper /att+/core alias only — ≠ FR-10 DONE from AGG alone
2) CONFIRM RETAIN POST …/submit MUST invoke AGG — after 2xx lines PRESENT · F5 — OPEN-Q2 FROZEN
3) CONFIRM RETAIN GET …/attendance-sheets/{id} peer cite — display-ready sheet_id·status·statusLabelVi·line_count·warnings[]·lines[{employee_id,standard_hours,ot_hours_weighted,paid_leave_hours,unpaid_leave_hours,late_penalty_hours,meal_shift_hours?,holiday_hours?,payable_hours,work_days,line_locked}] — ≠ ATT-10/PAY DONE
4) CONFIRM payable gold GĐ1 wire assert — payable = standard+paidLeave+otWeighted · late_penalty display-only · unpaid excluded · −penalty OUT GĐ1 · HOL/MEAL OUT GĐ1 (null/ABSENT OK)
5) Residual wire ONLY if closable gap (FUNNEL/STD/LEAVE/PAYABLE/OT/WARN/DISP) — HOLD invent Nest /core · HOLD invent second hour ledger · HOLD invent att_leave_hold · HOLD invent HOL/MEAL/−penalty DONE · HOLD invent PAY endpoints · HOLD invent ATT-11 close/sign DONE
6) RETAIN ATT-09/08/02/PLT/CORE seals · Nest /core DENY · soft≠CORE-06 · printable false · soft/ATT-08≠ATT-09 DONE · CFG≠ATT-02 DONE · ≠ ATT UAT · PAY OUT
7) DENY wipe peers · invent att_leave_hold dual · invent second hour ledger · invent PAY/printable/Word DONE · claim AGG=ATT-10 DONE · claim ATT-11/PAY DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · honesty flip · reopen sealed J-* · seed · apps/**
8) Unlock next prefer FE+QA U65 J-HRM-ATT-10-01..06 DRAFT — Dev-BE optional wire-only AFTER API CONFIRMED

exit: docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01.md · PASS_TO_PM · next FE/QA (or Dev wire-only if closable)
cấm: apps/** · seed · Nest /core dual invent · invent att_leave_hold dual · invent second hour ledger · wipe ATT-09/08/02/PLT/CORE · honesty flip · claim ATT module UAT · invent PAY/printable/Word DONE · claim AGG=ATT-10 DONE · claim ATT-11/PAY DONE · claim soft/ATT-08=ATT-09 DONE
```

---

*End DATA-01 · CONFIRMED HOLD · 2026-08-09*
