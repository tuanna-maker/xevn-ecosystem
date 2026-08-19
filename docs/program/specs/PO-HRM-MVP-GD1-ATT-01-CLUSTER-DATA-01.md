# PO-HRM-MVP-GD1-ATT-01-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN work_shifts + shift_change_requests + ATT-02 peer (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-01-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-30 seat **#32**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE `public.work_shifts` · `public.shift_change_requests` · ATT-02 `attendance_rules` / `att_attendance_rule` peer · **NO** second shifts table · **NO** invent `att_leave_hold` dual · **NO** Nest `/core` table dual · **NO** wipe ATT-11 sign/close · **NO** wipe ATT-10 AGG/submit · **NO** wipe ATT-09 hold · **NO** wipe ATT-08 preview · **NO** wipe ATT-02/PLT/CORE · **NO** wipe soft≠CORE-06 DONE · **NO** invent PAY / printable / Word / CSUM / INBOX / `lines[]` DONE · **NO** invent full roster grid GĐ1 DONE · **NO CODE** `apps/**` · **no seed** · **preserve_default** · F-ATT-SHIFT-02 assignment writer **ABSENT** → residual **HOLD** + **R-ATT-01-ASSIGN open** (ADD **ONLY if** closable writer/cols proven later — **not** proven this seat) |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — LIVE **`work_shifts` + `shift_change_requests` + ATT-02 rules** = catalog/CNS/peer SoT · FE **Lịch phân ca GĐ2-HOLD** · full tuần/tháng grid **OUT GĐ2** · thin assignment GĐ1 **NOT closable** this seat · **≠** FR-01 / ATT-01 DONE from catalog alone · unlock **sa API-01** F.1 **F-ATT-CAT-SHIFT-01/02/EFF** + **F-ATT-SHIFT-CNS-01** physical `/api/hrm/attendance/*` — wire **F-ATT-SHIFT-02** residual **ONLY if** closable · **PAY OUT invent DONE** · **printable false RETAIN** · **≠ ATT UAT** · **CFG≠ATT-02 DONE** · **R-ATT-11-WF/CSUM HOLD** · **R-ATT-10-DISP P2 HOLD** |
| **uc_ids** | `UC-BP-ATT-01` · `FR-UC-BP-ATT-01` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01.md) · **R-ATT-01-ASSIGN/SCHED/RESOLVE/SCOPE/CNS-FE/DISP/≠DONE** · thin GĐ1 XOR OUT full grid GĐ2 · printable false · QC ATT-11 **`ATT11QC1-MSLXTH9P`** (signatures\|close\|reopen · Nest `/core` sign 0 · **≠ LIVE=ATT-11 DONE** · **R-ATT-11-WF/CSUM/INBOX/EMIT HOLD** · ≠ ATT UAT) · evidence [`po-hrm-mvp-gd1-att-11-cluster-qc-01.md`](../../qa/evidence/po-hrm-mvp-gd1-att-11-cluster-qc-01.md) · QA **`ATT11QA2-MSLXOKS3`** · must_keep ATT-10 **`ATT10QC1-MSLWGUYH`** · ATT-09 **`ATT09QC1-MSLUTL9D`** · ATT-08 **`ATT08QC1-MSLSL36C`** · ATT-02 **`ATT02QC1-MSLQZUK7`** · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** printable false · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · PAY invent DONE **OUT** |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md) · O1–O12 · AC-ATT-01-* · R-ATT-01-* |
| **ref_att11_data** | [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md) — stamp `ATT11QC1-MSLXTH9P` · ≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM HOLD |
| **ref_att10_data** | [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md) — stamp `ATT10QC1-MSLWGUYH` · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD |
| **ref_att09_data** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md) — stamp `ATT09QC1-MSLUTL9D` · held=`pending_days` · DENY `att_leave_hold` |
| **ref_att08_data** | [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md) — stamp `ATT08QC1-MSLSL36C` |
| **ref_att02_data** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md) — stamp `ATT02QC1-MSLQZUK7` · CFG≠DONE |
| **ref_plt_data** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md) — stamp `PLT01QC1-MSLPUQIU` |
| **ref_core10_data** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md) — stamp `CORE10QC1-MSLP0EJB` |
| **ref_core09_data** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md) — printable **false** · ≠ CORE-09 DONE |
| **ref_core07_data** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md) — GATE/ACT · Nest `/core` DENY |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.2** paper `att_shift_assignment` / `att_work_schedule` · LIVE ops SoT **`public.work_shifts`** (ADR D1 · DOC-DELTA 0.36) · LIVE **`public.shift_change_requests`** · Nest `@Controller('core')` **ABSENT** · paper `/att` + `/core` **alias only** |
| **ref_paper_api** | **F-ATT-CAT-SHIFT-01/02** · **F-ATT-CAT-SHIFT-EFF-01** · **F-ATT-SHIFT-CNS-01** · **F-ATT-SHIFT-02** (residual) · **F-ATT-SHIFT-01** (alias→CAT) · peer **F-ATT-RULE-01** (ATT-02 · CFG≠DONE) · Nest `@Controller('core')` **ABSENT** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-01** · Diễn biến **#1–#2 + Thành công** · **BR-BP-SHF-01** · **BR-PLT-02/04/05/06** · partner **TIME-001** · DOC-DELTA **0.36** |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/work-shifts*` (+ residual `shift-assignments*` same family) · paper `/att/*` + `/core` **alias only** · U19 · soft-delete · **DENY** Nest `/core` dual · ADR D1 `work_shifts` wins vs XBOS `shifts` REF |
| **ref_code_cite** | `attendance.controller` `@Controller('attendance')` · `AttendanceCatalogService.ensureWorkShiftSchema` → `public.work_shifts` · `GET/POST/PATCH/DELETE …/work-shifts*` + `…/effective` · `attendance-requests` `CREATE TABLE IF NOT EXISTS public.shift_change_requests` + invent-ban **`HRM-ATT-SHIFT-KEY`** · FE `useWorkShifts` / Danh sách ca LIVE · **Lịch phân ca GĐ2-HOLD** · Nest `shift-assignments*` **ABSENT** · Nest `@Controller('core')` **ABSENT** — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim catalog alone = ATT-01 DONE · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **DENY** claim soft/ATT-08=ATT-09 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word/CSUM/INBOX/`lines[]` DONE · **DENY** CFG=ATT-02 DONE · **DENY** invent `att_leave_hold` · honesty flip |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| **Catalog SoT** | **HOLD RETAIN** — LIVE **`public.work_shifts`** on Nest **`GET/POST/PATCH/DELETE /api/hrm/attendance/work-shifts*`** + **`GET …/effective`** — Settings/`shifts` **REF only** — **DENY** second shifts table · **DENY** Nest `/core` dual · **explicit ≠** FR-01 / ATT-01 DONE from catalog alone |
| **CNS Đổi ca** | **HOLD RETAIN** — LIVE **`public.shift_change_requests`** + invent-ban **`HRM-ATT-SHIFT-KEY`** when active>0 — **≠** ATT-01 DONE from CNS alone |
| **ATT-02 peer** | **HOLD RETAIN** — `attendance_rules` / `att_attendance_rule` · stamp **`ATT02QC1-MSLQZUK7`** · **CFG≠ATT-02 DONE** · **≠** reopen as ATT-01 invent DONE |
| **R-ATT-01-ASSIGN** | **HOLD + open** — Nest physical **`PUT\|POST …/shift-assignments*`** **ABSENT PROVEN** · paper `att_shift_assignment` **not LIVE** · **ADD residual ONLY if** closable writer/cols under `/attendance/*` proven later — **DENY** silent invent table this seat |
| **R-ATT-01-SCHED** | **OUT full grid GĐ2** — FE **Lịch phân ca GĐ2-HOLD RETAIN** · thin assignment-by-range GĐ1 **not closable** without ASSIGN writer — **≠** invent full roster DONE |
| **R-ATT-01-RESOLVE / SCOPE / CNS-FE / DISP / ≠DONE** | **HOLD** — AC residuals after ASSIGN wire · display-ready cite §4.5 · U19 parity · footer ≠DONE |
| Display-ready DTO | **Cite** §4.5 — `shift_id` · `code` · `name` · times · `status` · `statusLabelVi` · dept/group/employee · effective · `sourceFlags` |
| Nest path | Physical `/api/hrm/attendance/work-shifts*` (+ residual `shift-assignments*` same family **when closable**) · Nest `@Controller('core')` **ABSENT** · paper `/att` + `/core` **alias only** |
| ATT-11 sign/close | **must_keep** · stamp **`ATT11QC1-MSLXTH9P`** · ≠ LIVE=ATT-11 DONE · **R-ATT-11-WF/CSUM HOLD** · Nest `/core` sign 0 |
| ATT-10 AGG/submit | **must_keep** · stamp **`ATT10QC1-MSLWGUYH`** · ≠ AGG=ATT-10 DONE · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT |
| ATT-09 hold/settle | **must_keep** · stamp **`ATT09QC1-MSLUTL9D`** · held=`pending_days` · **DENY** `att_leave_hold` |
| ATT-08 preview | **must_keep** · stamp **`ATT08QC1-MSLSL36C`** |
| PLT-01 | **must_keep** · stamp **`PLT01QC1-MSLPUQIU`** · peer≠PLT DONE |
| CORE-10 | **must_keep** · stamp **`CORE10QC1-MSLP0EJB`** · ≠ CORE-10 DONE |
| CORE-09 printable | **must_keep** · stamp **`CORE09QC1-MSLNBA89`** · printable **false** · ≠ CORE-09 DONE |
| CORE-07 GATE/ACT | **must_keep** · stamp **`CORE07QC1-KZJTSHNT`** · Nest DENY · soft≠CORE-06 DONE |
| PAY / printable / Word / CSUM / INBOX / `lines[]` | **OUT invent DONE** · R-ATT-10-DISP **P2 HOLD** · R-ATT-11-WF/CSUM **HOLD** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim catalog=ATT-01 DONE · LIVE=ATT-11 DONE · AGG=ATT-10 DONE · ATT UAT · soft/ATT-08=ATT-09 DONE · CFG=ATT-02 · PLT/CORE DONE |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `att_shift` / F-ATT-CAT-SHIFT-* | LIVE **`public.work_shifts`** · **`/api/hrm/attendance/work-shifts*`** + `/effective` | **HOLD RETAIN** · ADR D1 Nest wins · Settings/`shifts` REF · **≠** ATT-01 DONE alone |
| F-ATT-SHIFT-CNS-01 | LIVE **`public.shift_change_requests`** · **`…/shift-change-requests*`** + **`HRM-ATT-SHIFT-KEY`** | **HOLD RETAIN** · CNS-FE residual |
| F-ATT-SHIFT-02 · `att_shift_assignment` | Prefer Nest **`…/shift-assignments*`** same `@Controller('attendance')` family | **ABSENT PROVEN** → **HOLD** + **R-ATT-01-ASSIGN open** · ADD only if closable |
| `att_work_schedule` (week/month grid) | Full grid | **OUT GĐ2** · FE Lịch **GĐ2-HOLD** · **≠** invent roster DONE |
| Peer F-ATT-RULE-01 | LIVE `attendance_rules` / `att_attendance_rule` | **must_keep** · **CFG≠ATT-02 DONE** |
| Paper held / `att_leave_hold` | LIVE **`employee_leave_balances.pending_days`** (ATT-09) | **must_keep** · **DENY invent dual** |
| Nest `/core` shift/assign table | — | **DENY invent** |
| Paper `/core` / `/att` | Alias only | **DENY** Nest dual SoT |
| ATT-11/10/09/08/02/PLT/CORE peers | seals | **must_keep** · ≠ claim DONE |

```text
  public.work_shifts (LIVE — HOLD RETAIN · ONE ca catalog SoT · ADR D1)
        RETAIN: id · company_id · code · name · department?
                start_time · end_time · break_start/end? · work_hours · coefficient
                status active|inactive · soft-retire ≠ hard-delete default
        DENY invent second shifts table / Nest /core dual
        ≠ FR-01 / ATT-01 DONE from catalog alone
                │
                │ Physical API (HOLD RETAIN)
                ▼
  GET/POST/PATCH/DELETE /api/hrm/attendance/work-shifts*
  GET …/work-shifts/effective
  Paper /att/… + /core/… = ALIAS ONLY
                │
  public.shift_change_requests (LIVE — HOLD RETAIN · CNS)
        RETAIN: invent-ban HRM-ATT-SHIFT-KEY when active catalog >0
        empty → CTA admin · no seed
                │
  ATT-02 peer attendance_rules / att_attendance_rule
        must_keep ATT02QC1-MSLQZUK7 · CFG≠ATT-02 DONE
                │
  F-ATT-SHIFT-02 assignment (paper att_shift_assignment)
        Nest …/shift-assignments* ABSENT PROVEN (2026-08-09)
        public.att_shift_assignment / att_work_schedule LIVE writer ABSENT
        → HOLD + R-ATT-01-ASSIGN open
        ADD residual ONLY if closable under /attendance/* later
        full tuần/tháng grid = OUT GĐ2 · FE Lịch GĐ2-HOLD RETAIN
                │
  Display-ready DTO (cite · HOLD schema until Dev after API):
        shift_id · code · name · start_time · end_time · break_minutes? · work_factor?
        status · statusLabelVi
        department_id? · group_id? · employee_id?
        effective_from? · effective_to? · sourceFlags?

  ATT11QC1-MSLXTH9P sign/close · ≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM HOLD ·
  ATT10QC1-MSLWGUYH AGG/submit · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT ·
  ATT09QC1-MSLUTL9D hold/settle pending_days · DENY att_leave_hold ·
  ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU ·
  CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT ·
  soft≠CORE-06 · Nest /core DENY
        SEALED must_keep

  FORBIDDEN GĐ1 this seat:
        Invent second shifts table · invent att_leave_hold dual · Nest /core dual
        Invent att_shift_assignment / att_work_schedule as DONE without closable proof
        Wipe LIVE work_shifts / shift_change_requests · wipe ATT-11/10/09/08/02/PLT/CORE
        Invent PAY/printable/Word/CSUM/INBOX/lines[] DONE · invent full roster GĐ1 DONE
        Claim catalog alone = ATT-01 DONE · claim LIVE = ATT-11 DONE · claim AGG = ATT-10 DONE
        Claim ATT UAT · soft/ATT-08=ATT-09 DONE · CFG=ATT-02 DONE · PLT/CORE DONE
        Honesty flip · reopen sealed J-* · seed · apps/**
```

**Label lock:** Board «Thiết lập quy tắc ca theo bộ phận / nhóm» GĐ1 = **LIVE `work_shifts` + `shift_change_requests` + ATT-02 peer RETAIN** + **gap phân ca residual open** — **not** Nest `/core` dual · **not** catalog alone = FR-01 DONE · **not** full roster invent DONE.  
**Spine lock:** Physical `/api/hrm/attendance/work-shifts*` — **DENY** Nest `/core` second SoT · paper `/att`+`/core` alias only · residual `shift-assignments*` same family **when closable**.  
**Grain lock:** Full tuần/tháng grid **OUT GĐ2** · FE Lịch **GĐ2-HOLD** · thin GĐ1 assignment **HOLD** until ASSIGN closable.  
**Honesty lock:** `attendance_uat_ready=false` · printable false · C-SLICE · PAY OUT · ≠ ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · CFG≠ATT-02 DONE · soft/ATT-08≠ATT-09 DONE.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-01 DONE** · catalog alone ≠ FR-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · CSUM/INBOX/`lines[]` invent DONE OUT · R-ATT-11-WF/CSUM HOLD · R-ATT-10-DISP P2 HOLD · must_keep ATT-11 `ATT11QC1-MSLXTH9P` · ATT-10 `ATT10QC1-MSLWGUYH` · ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · DENY invent `att_leave_hold` · no seed · no apps/**

---

## 3. AS-IS baseline (Nest facts — read-only cite · 2026-08-09)

| Object | AS-IS LIVE | Gap (Wave-30 DATA) |
|--------|------------|---------------------|
| **`public.work_shifts`** | `ensureWorkShiftSchema` PRESENT · CRUD + soft-retire `inactive` | **HOLD RETAIN** · ≠ FR-01 DONE alone |
| **`GET/POST/PATCH/DELETE …/work-shifts*`** + `/effective` | PRESENT | **HOLD RETAIN** · ≠ ATT-01 DONE from catalog alone |
| Settings/`shifts` | REF only · Nest wins ADR D1 | **HOLD RETAIN** · DENY dual-write |
| **`public.shift_change_requests`** | PRESENT + **`HRM-ATT-SHIFT-KEY`** | **HOLD RETAIN** · CNS-FE residual |
| Nest **`…/shift-assignments*`** | **ABSENT** (controller: work-shifts + shift-change only) | **HOLD** + **R-ATT-01-ASSIGN open** |
| Paper `att_shift_assignment` / `att_work_schedule` | Paper §4.2 · **no LIVE Nest writer** | **HOLD** invent · ADD only if closable |
| FE Danh sách ca | LIVE `useWorkShifts` | **HOLD RETAIN** · ≠ DONE alone |
| FE Lịch phân ca | **GĐ2-HOLD** (`featureInDev`) | **HOLD RETAIN** · full grid **OUT GĐ2** |
| ATT-02 rules peer | SEALED `ATT02QC1-MSLQZUK7` · CFG≠DONE | **must_keep** |
| Paper F-ATT-CAT / `/core` | Nest `@Controller('core')` **ABSENT** | **alias only** · **DENY invent** dual |
| ATT-11/10/09/08/PLT/CORE | SEALED stamps | **must_keep** · **DENY wipe** |
| PAY deepen | QUEUED | **OUT invent DONE** |

**FORBIDDEN invent this seat:** wipe LIVE `work_shifts` / `shift_change_requests` · Nest `/core` dual · invent second shifts table · invent `att_leave_hold` · invent `att_shift_assignment` / `att_work_schedule` as DONE without closable proof · invent PAY/printable/Word/CSUM/INBOX/`lines[]` DONE · invent full roster GĐ1 DONE · claim catalog = FR-01 / ATT UAT · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim soft/ATT-08=ATT-09 DONE · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · seed · honesty flip · apps/** · reopen sealed J-HRM-ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01.

---

## 4. HOLD / residual dispositions (normative)

### 4.1 Catalog + CNS SoT — **HOLD RETAIN** (mission §1)

| Physical | Rule |
|----------|------|
| `work_shifts` + work-shifts* + EFF | **HOLD RETAIN** · ONE ca catalog SoT |
| `shift_change_requests` + invent-ban | **HOLD RETAIN** · CNS SoT |
| ATT-02 rules peer | **HOLD RETAIN** · CFG≠DONE |
| Second shifts table / Nest `/core` dual / `att_leave_hold` | **DENY invent** |
| Catalog alone = FR-01 / ATT-01 DONE | **DENIED** (**R-ATT-01-≠DONE**) |

### 4.2 FE Lịch / schedule grain — **HOLD / OUT GĐ2** (mission §2)

| Residual | Ruling |
|----------|--------|
| FE Lịch phân ca | **GĐ2-HOLD RETAIN** until ASSIGN wire |
| Full tuần/tháng grid | **OUT GĐ2** · **≠** invent roster as GĐ1 DONE |
| Thin assignment-by-range GĐ1 | Prefer same spine as ASSIGN · **not closable** this seat (writer ABSENT) |
| DENY | Claim mega calendar GĐ1 DONE · invent `att_work_schedule` = ATT-01 DONE |

### 4.3 R-ATT-01-ASSIGN — **HOLD + open** (mission §3)

| Field | Ruling |
|-------|--------|
| **Gap** | Nest `shift-assignments*` **ABSENT PROVEN** · paper `att_shift_assignment` not LIVE |
| **ba-data this seat** | **HOLD** — **no** schema ADD stamped · **R-ATT-01-ASSIGN remains open** |
| **ADD later** | **ONLY if** closable physical writer/cols under `/api/hrm/attendance/*` family proven (prefer map paper → LIVE name) |
| **DENY** | Silent invent cols · Nest `/core` dual · claim FE Lịch HOLD alone = ATT-01 FAIL without residual footer |
| **sa API** | May deepen **F-ATT-SHIFT-02** residual contract as **paper→physical prefer** · **not** claim DATA ADD DONE · wire **ONLY if** closable |

### 4.4 RESOLVE / SCOPE / CNS-FE / DISP / ≠DONE — **HOLD** AC (no schema ADD)

| Residual | Ruling |
|----------|--------|
| **R-ATT-01-RESOLVE** | Punch/penalty/hours read **assigned** ca after ASSIGN · **HOLD** until writer |
| **R-ATT-01-SCOPE** | U19 list=get=assign=mutate · Scope **409** AC · **HOLD** |
| **R-ATT-01-CNS-FE** | LIVE CNS RETAIN · FE picker fidelity residual · no seed |
| **R-ATT-01-DISP** | Display-ready cite §4.5 · **≠** invent PAY/`lines[]` DONE |
| **R-ATT-01-≠DONE** | Catalog alone ≠ FR-01 · ≠ ATT UAT · ≠ LIVE=11 · ≠ AGG=10 |

### 4.5 Display-ready DTO — cite (mission §4)

| DTO field | Source / derive | Rule |
|-----------|-----------------|------|
| `shift_id` | `work_shifts.id` | display-ready |
| `code` | `work_shifts.code` | required |
| `name` | `work_shifts.name` | required |
| `start_time` / `end_time` | LIVE times | required |
| `break_minutes?` | derive from break_start/end or HOLD | optional |
| `work_factor?` | LIVE `coefficient` map | optional |
| `status` | `active`\|`inactive` | soft-retire |
| `statusLabelVi` | wire/derive | VI label |
| `department_id?` / `group_id?` / `employee_id?` | assignment residual | **HOLD** until ASSIGN |
| `effective_from?` / `effective_to?` | assignment residual | **HOLD** until ASSIGN |
| `sourceFlags?` | catalog vs REF vs assignment | optional wire |

**Residual wire:** sa API may stamp envelope fidelity for CAT/CNS **RETAIN cite** · assignment fields **ONLY if** closable — prefer physical F-ATT-CAT-SHIFT + F-ATT-SHIFT-CNS · **HOLD** invent assignment schema until closable ADD unlocked.

### 4.6 ATT-11/10/09/08/02/PLT/CORE seals · Nest `/core` — **RETAIN** (mission §5)

| Stamp | Rule |
|-------|------|
| **`ATT11QC1-MSLXTH9P`** | **must_keep** · signatures\|close\|reopen · Nest `/core` sign 0 · **≠ LIVE=ATT-11 DONE** · **R-ATT-11-WF/CSUM/INBOX/EMIT HOLD** · ≠ ATT UAT |
| **`ATT10QC1-MSLWGUYH`** | **must_keep** · AGG+submit · Nest `/core` AGG 0 · **≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT · ≠ ATT UAT |
| **`ATT09QC1-MSLUTL9D`** | **must_keep** · hold/settle · `pending_days` · DENY `att_leave_hold` · Nest `/core` leave 0 · soft/ATT-08≠ATT-09 DONE · ≠ ATT UAT |
| **`ATT08QC1-MSLSL36C`** | **must_keep** · preview RETAIN · ≠ wipe · ≠ ATT-08=ATT-09 DONE |
| **`ATT02QC1-MSLQZUK7`** | **must_keep** · **CFG≠ATT-02 DONE** · ≠ ATT UAT |
| **`PLT01QC1-MSLPUQIU`** | **must_keep** · peer≠PLT DONE · merge≠platform UAT |
| **`CORE10QC1-MSLP0EJB`** | **must_keep** · ≠ CORE-10 DONE |
| **`CORE09QC1-MSLNBA89`** | printable **false RETAIN** · ≠ CORE-09 DONE |
| **`CORE07QC1-KZJTSHNT`** | GATE/ACT · Nest DENY · ≠ CORE-07 DONE |
| soft≠CORE-06 DONE | **RETAIN** |
| Nest `@Controller('core')` | **ABSENT** · paper alias only · **DENY invent** |

### 4.7 DENY inventory (mission §7 / §5)

| DENY | Why |
|------|-----|
| Second shifts table / Nest `/core` dual | Option A · O1/O7 |
| Invent `att_leave_hold` dual | ATT-09 held=`pending_days` |
| Wipe ATT-11/10/09/08/02/PLT/CORE | must_keep seals |
| Invent PAY/printable/Word/CSUM/INBOX/`lines[]` DONE | OUT invent · printable false · DISP HOLD |
| Invent full roster grid GĐ1 DONE | O3 · FE Lịch GĐ2-HOLD |
| Claim catalog alone = ATT-01 DONE | R-ATT-01-≠DONE · C-SLICE |
| Claim LIVE alone = ATT-11 DONE | ATT11 seal · O8 |
| Claim AGG alone = ATT-10 DONE | ATT10 seal · O8 |
| Claim soft/ATT-08 = ATT-09 DONE | ATT09/08 seals |
| Claim ATT module UAT / CFG=ATT-02 DONE | O6/O12 |
| Claim PLT/CORE DONE | must_keep honesty |
| Honesty flip / reopen sealed J-* / seed / apps/** | preserve · U65 · docs-only |

---

## Footer — honesty (repeat)

> **honesty false** · **printable false RETAIN** · **≠ ATT-01 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE · `attendance_uat_ready=false` · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · CFG≠ATT-02 DONE · soft/ATT-08≠ATT-09 DONE

---

## 5. Validation matrix (data integrity — HOLD)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-ATT-01-DATA-01 | Admin CRUD Nest ca | LIVE `work_shifts` RETAIN | 2xx · list+F5 · Nest `/core` 0 · ≠ FR-01 DONE claim from catalog alone |
| VAL-ATT-01-DATA-02 | Soft-retire `inactive` | hide default picker · history còn | EFF excludes inactive · soft ≠ hard-delete default |
| VAL-ATT-01-DATA-03 | Active>0 + invent CNS key | invent-ban | **`HRM-ATT-SHIFT-KEY`** · no persist |
| VAL-ATT-01-DATA-04 | Active=0 CNS | empty CTA · no seed | Soft skip · hardcode tạm ≠ SoT |
| VAL-ATT-01-DATA-05 | Settings/`shifts` REF | Nest wins | DENY dual-write |
| VAL-ATT-01-DATA-06 | Nest `shift-assignments*` GĐ1 | ABSENT | HOLD OK · **R-ATT-01-ASSIGN open** · no silent invent |
| VAL-ATT-01-DATA-07 | Full tuần/tháng grid GĐ1 | footer OUT GĐ2 | ABSENT OK · ≠ invent roster DONE |
| VAL-ATT-01-DATA-08 | Scope mismatch | U19 list=get=assign=mutate | `HRM-SCOPE-409` / 404 |
| VAL-ATT-01-DATA-09 | Nest `/core` dual | `@Controller('core')` as SoT | **FAIL** O7 |
| VAL-ATT-01-DATA-10 | Invent `att_leave_hold` / second shifts | schema/grep | **FAIL** |
| VAL-ATT-01-DATA-11 | Claim catalog=DONE / LIVE=11 / AGG=10 / ATT UAT / CFG=02 / soft=09 / invent PAY/printable | evidence footer | **FAIL** honesty |
| VAL-ATT-01-DATA-12 | ATT-02 peer CFG | must_keep | CFG≠ATT-02 DONE · ≠ reopen as ATT-01 DONE |

---

## 6. Lifecycle (catalog / CNS — HOLD · assign residual)

| From → To | Legal? | Notes |
|-----------|--------|-------|
| Admin CREATE N+1 Nest ca | YES | Persist `work_shifts` · ≠ ATT-01 DONE alone |
| Soft-retire active → inactive | YES | Hide picker · history retained |
| Hard-delete with CNS refs | **NO** (default) | Soft-retire · ref count guard |
| CNS invent when active>0 | **NO** | **`HRM-ATT-SHIFT-KEY`** |
| CNS when EFF=0 | Soft skip + CTA | No seed |
| Upsert assignment dept/group/NV | **HOLD** | Writer ABSENT · R-ATT-01-ASSIGN open |
| Claim full grid = GĐ1 DONE | **NO** | OUT GĐ2 |
| Catalog alone → claim FR-01 / ATT UAT | **NO** | C-SLICE |
| Catalog/CNS → Nest `/core` second SoT | **NO** | DENY dual |
| LIVE alone → claim ATT-11 DONE | **NO** | ATT11 must_keep ≠DONE |
| AGG alone → claim ATT-10 DONE | **NO** | ATT10 must_keep ≠DONE |

Invalid transition → deterministic 4xx (not silent wipe / soft-OK dual ledger).

---

## 7. Scope parity (U19)

| Surface | Resolver | Rule |
|---------|----------|------|
| work-shifts list/get/mutate/EFF | hrm list-scope TEXT slug family | list **=** get-by-id **=** mutate |
| shift-change-requests list/mutate | same attendance family | invent-ban uses same company scope |
| Residual shift-assignments (when ADD) | **MUST** same `resolveHrmListScope` | else `scope_parity` defect |
| ATT-02 rules peer | same attendance family | **CFG≠ATT-02 DONE** |
| ATT-11/10/09 peers (cite) | same attendance family | **must_keep** · ≠ DONE claims |

**Flag:** If residual ADD later introduces assignment table/writer, sa API **MUST** document list=get=assign=mutate parity — else `scope_parity` defect (U19).

---

## 8. Traceability (requirement → physical → API → FE → test)

| BR/AC | Physical | API | FE / J-* | Evidence expect |
|-------|----------|-----|----------|-----------------|
| BR-BP-SHF-01 · AC-ATT-01-CAT/EFF/SOFT | LIVE `work_shifts` | F-ATT-CAT-SHIFT-01/02/EFF physical `/attendance/work-shifts*` | **J-HRM-ATT-01-01/05** DRAFT | CRUD · EFF · soft-retire · Nest `/core` 0 · ≠ CAT=DONE |
| AC-ATT-01-CNS/INVENT-BAN/EMPTY | LIVE `shift_change_requests` | F-ATT-SHIFT-CNS-01 | **J-04/05** | invent-ban · CTA · no seed |
| AC-ATT-01-ASSIGN/SCHED-OUT/SCOPE | paper `att_shift_assignment` · writer ABSENT | F-ATT-SHIFT-02 residual prefer `…/shift-assignments*` | **J-02** DRAFT | HOLD + R-ATT-01-ASSIGN open · ≠ full grid DONE |
| AC-ATT-01-RESOLVE/FAIL-RESOLVE | assigned ca residual | after ASSIGN wire | **J-03** DRAFT | OU A ≠ OU B · ≠ company-hardcode |
| AC-ATT-01-DISP | display-ready DTO | CAT/CNS (+ assign when closable) | list/detail · **J-01** | FE bind · ≠ invent lines[] DONE |
| AC-ATT-01-PATH | Nest `/attendance` | paper `/att`+`/core` alias | all J-* | Nest `/core` **0** |
| AC-ATT-01-MK-* / H / PAY-OUT / ≠-* | seals | — | **J-06** footer | ATT-11/10/09/08/02/PLT/CORE ≠ DONE · printable false · CFG≠DONE · ≠ LIVE=11 · ≠ AGG=10 · C-SLICE · DENY `att_leave_hold` |

---

## 9. Unlock next — sa API-01

| Field | Value |
|-------|--------|
| **next_owner** | **sa** |
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01` |
| **Mission** | F.1 deepen **F-ATT-CAT-SHIFT-01/02** + **F-ATT-CAT-SHIFT-EFF-01** + **F-ATT-SHIFT-CNS-01** physical prefer `/api/hrm/attendance/work-shifts*` + `shift-change-requests*` · RETAIN cite · paper `/att` + `/core` **alias only** · cite this DATA-01 physical prefer · display-ready shift DTO · residual **F-ATT-SHIFT-02** contract deepen **ONLY as residual** (writer ABSENT — **HOLD invent schema DONE** · wire **ONLY if** closable later) · **DENY** Nest dual · invent second shifts · invent `att_leave_hold` · invent PAY/printable · invent full roster GĐ1 DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT UAT · CFG=ATT-02 DONE · seed · apps/** |
| **cấm** | Dev invent migrate assignment before closable ADD unlock · Nest `/core` SoT · wipe ATT-11/10/09/08/02/PLT/CORE · honesty flip |

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §11 |
| **next_owner** | `sa` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-DATA-01.md` |
| **next_dispatch_prompt** | See §12 |

---

## 11. completion_report

**Closed:** ba-data **CONFIRMED HOLD** for UC-BP-ATT-01 / FR-UC-BP-ATT-01 — LIVE **`public.work_shifts` + `public.shift_change_requests` + ATT-02 rules peer** = ONE catalog/CNS/peer SoT (**DENY** second shifts table · **DENY** invent `att_leave_hold` · **DENY** Nest `/core` dual); FE **Lịch phân ca GĐ2-HOLD** · full tuần/tháng grid **OUT GĐ2** · **≠** invent full roster DONE · **≠** FR-01 DONE from catalog alone; Nest **`shift-assignments*` ABSENT PROVEN** → **no schema ADD** this seat · **R-ATT-01-ASSIGN remains open** (ADD residual **ONLY if** closable writer under `/attendance/*` proven later); cite display-ready **shift_id · code · name · start_time · end_time · break_minutes? · work_factor? · status · statusLabelVi · department_id? · group_id? · employee_id? · effective_from? · effective_to? · sourceFlags?**; **must_keep** ATT11QC1-MSLXTH9P sign/close (**≠ LIVE=ATT-11 DONE** · **R-ATT-11-WF/CSUM HOLD**) · ATT10QC1-MSLWGUYH AGG/submit (**≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT) · ATT09QC1-MSLUTL9D hold/settle `pending_days` · DENY `att_leave_hold` · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · ≠ ATT UAT · PAY OUT; DENY wipe peers · invent PAY/printable/Word/CSUM/INBOX/`lines[]` · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT UAT · honesty flip · seed · apps/** · NO migrate this seat.

**Residual open (API/FE — not DATA schema ADD this seat):** R-ATT-01-ASSIGN/SCHED/RESOLVE/SCOPE/CNS-FE/DISP/≠DONE — unlock **sa API** F.1 F-ATT-CAT-SHIFT-* + F-ATT-SHIFT-CNS (+ F-ATT-SHIFT-02 residual contract **only** — **not** invent writer DONE). Full grid remains **OUT GĐ2**.

---

## 12. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-30 seat #32)
uc_ids: UC-BP-ATT-01 · FR-UC-BP-ATT-01
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA Option A · R-ATT-01-ASSIGN open (Nest shift-assignments ABSENT · no DATA ADD this seat) · R-ATT-01-SCHED OUT full grid GĐ2 · FE Lịch GĐ2-HOLD · R-ATT-01-RESOLVE/SCOPE/CNS-FE/DISP/≠DONE · printable false · ATT11QC1-MSLXTH9P sign/close RETAIN (≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM/INBOX/EMIT HOLD · Nest /core sign 0) · ATT10QC1-MSLWGUYH AGG/submit RETAIN (≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · Nest /core AGG 0) · ATT09QC1-MSLUTL9D hold/settle pending_days DENY att_leave_hold · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ≠ ATT UAT · PAY OUT · ≠ catalog alone = ATT-01 DONE · DENY second shifts table
spec_ref: F-ATT-CAT-SHIFT-01/02 · F-ATT-CAT-SHIFT-EFF-01 · F-ATT-SHIFT-CNS-01 physical prefer GET/POST/PATCH/DELETE /api/hrm/attendance/work-shifts* + GET …/effective + shift-change-requests* · F-ATT-SHIFT-02 residual prefer PUT|POST /api/hrm/attendance/shift-assignments* (HOLD invent schema DONE — wire ONLY if closable) · paper /att + /core alias only · LIVE work_shifts + shift_change_requests = catalog/CNS SoT · BR-BP-SHF-01 · TIME-001 · display-ready shift_id·code·name·start_time·end_time·break_minutes?·work_factor?·status·statusLabelVi·department_id?·group_id?·employee_id?·effective_from?·effective_to?·sourceFlags? · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE · soft/ATT-08≠ATT-09 DONE

MISSION — API F.1 (docs-only · RETAIN cite · wire residual ONLY if closable):
1) CONFIRM RETAIN F-ATT-CAT-SHIFT-01/02 physical GET/POST/PATCH/DELETE /api/hrm/attendance/work-shifts* — paper /att+/core alias only — ≠ FR-01 DONE from catalog alone
2) CONFIRM RETAIN F-ATT-CAT-SHIFT-EFF-01 physical GET …/work-shifts/effective — picker SoT when active>0
3) CONFIRM RETAIN F-ATT-SHIFT-CNS-01 physical shift-change-requests* + HRM-ATT-SHIFT-KEY invent-ban — empty CTA · no seed — CNS-FE residual OK
4) CONFIRM F-ATT-SHIFT-02 residual contract prefer physical …/shift-assignments* same attendance family — DATA writer ABSENT → HOLD invent schema DONE · stamp residual open R-ATT-01-ASSIGN — wire ONLY if closable later — DENY claim assign DONE · DENY invent full roster GĐ1 DONE
5) CONFIRM display-ready DTO wire cite — shift_id·code·name·times·status·statusLabelVi·dept/group/employee?·effective?·sourceFlags? — assignment fields HOLD until closable
6) Residual wire ONLY if closable gap (ASSIGN/RESOLVE/SCOPE/CNS-FE/DISP) — HOLD invent Nest /core · HOLD invent second shifts · HOLD invent att_leave_hold · HOLD invent PAY endpoints · HOLD invent full grid DONE · HOLD claim catalog=ATT-01 DONE
7) RETAIN ATT-11/10/09/08/02/PLT/CORE seals · Nest /core DENY · soft≠CORE-06 · printable false · soft/ATT-08≠ATT-09 DONE · CFG≠ATT-02 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · R-ATT-11-WF/CSUM HOLD · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · ≠ ATT UAT · PAY OUT
8) DENY wipe peers · invent att_leave_hold dual · invent second shifts table · invent PAY/printable/Word/CSUM/INBOX/lines[] DONE · invent full roster GĐ1 DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · honesty flip · reopen sealed J-* · seed · apps/**
9) Unlock next prefer FE+QA U65 J-HRM-ATT-01-01..06 DRAFT (catalog/CNS paths first · ASSIGN journeys remain residual) — Dev-BE optional wire-only AFTER API CONFIRMED · ASSIGN migrate ONLY after closable DATA ADD unlock

exit: docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01.md · PASS_TO_PM · next FE/QA (or Dev wire-only if closable)
cấm: apps/** · seed · Nest /core dual invent · invent att_leave_hold dual · invent second shifts table · invent att_shift_assignment as DONE without closable · wipe ATT-11/10/09/08/02/PLT/CORE · honesty flip · claim ATT module UAT · invent PAY/printable/Word/CSUM/INBOX/lines[] DONE · invent full roster GĐ1 DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim soft/ATT-08=ATT-09 DONE
```

---

*End DATA-01 · CONFIRMED HOLD · 2026-08-09*
