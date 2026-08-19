# PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN attendance_sheets + att_timesheet_sign_step + close/reopen (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-29 seat **#31**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE `public.attendance_sheets` · `public.att_timesheet_sign_step` · close/reopen writers · **NO** second sign ledger · **NO** invent `att_leave_hold` dual · **NO** Nest `/core` table dual · **NO** wipe ATT-10 AGG/submit · **NO** wipe ATT-09 hold/settle · **NO** wipe ATT-08 preview · **NO** wipe ATT-02/PLT/CORE · **NO** wipe soft≠CORE-06 DONE · **NO** invent PAY / printable / Word / HOL/MEAL / `lines[]` DONE · **NO CODE** `apps/**` · **no seed** · **preserve_default** · CSUM / WF sync / inbox bridge **HOLD** (ADD residual **ONLY if** closable writer/col proven — **not** proven this seat) |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — LIVE **`attendance_sheets` + `att_timesheet_sign_step` + close/reopen** = sign/close SoT · FIXED_GĐ1 3-persona evaluator **RETAIN** · CSUM **OUT GĐ1** · INBOX **OUT GĐ1** · EMIT **response-only GĐ1** · **≠** FR-11 / ATT-11 DONE from LIVE alone · **≠ AGG=ATT-10 DONE** · unlock **sa API-01** F.1 **F-ATT-WF-SIGN-01/02** + **F-ATT-SHEET-02/03** physical `/api/hrm/attendance/attendance-sheets*` — residual wire **ONLY if** closable · **PAY OUT invent DONE** · **printable false RETAIN** · **≠ ATT UAT** · **CFG≠ATT-02 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT |
| **uc_ids** | `UC-BP-ATT-11` · `FR-UC-BP-ATT-11` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md) · **R-ATT-11-WF/INBOX/REJECT/CLOSE/CSUM/EMIT/REOPEN/DISP** · FIXED_GĐ1 · CSUM OUT · INBOX OUT · EMIT response-only · printable false · QC ATT-10 **`ATT10QC1-MSLWGUYH`** (AGG+submit · Nest `/core` AGG 0 · **≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT · ≠ ATT UAT) · evidence [`po-hrm-mvp-gd1-att-10-cluster-qc-01.md`](../../qa/evidence/po-hrm-mvp-gd1-att-10-cluster-qc-01.md) · QA **`ATT10QA1-MSLWCDX2`** · must_keep ATT-09 **`ATT09QC1-MSLUTL9D`** · ATT-08 **`ATT08QC1-MSLSL36C`** · ATT-02 **`ATT02QC1-MSLQZUK7`** · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** printable false · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · PAY invent DONE **OUT** |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md) · O1–O12 · AC-ATT-11-* · R-ATT-11-* |
| **ref_att10_data** | [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md) — stamp `ATT10QC1-MSLWGUYH` · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD |
| **ref_att09_data** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md) — stamp `ATT09QC1-MSLUTL9D` · held=`pending_days` · DENY `att_leave_hold` |
| **ref_att08_data** | [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md) — stamp `ATT08QC1-MSLSL36C` |
| **ref_att02_data** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md) — stamp `ATT02QC1-MSLQZUK7` · CFG≠DONE |
| **ref_plt_data** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md) — stamp `PLT01QC1-MSLPUQIU` |
| **ref_core10_data** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md) — stamp `CORE10QC1-MSLP0EJB` |
| **ref_core09_data** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md) — printable **false** · ≠ CORE-09 DONE |
| **ref_core07_data** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md) — GATE/ACT · Nest `/core` DENY |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.6.1** `att_timesheet_sign_step` · **§4.6.2** bridge — logical `att_timesheet_header` = LIVE **`public.attendance_sheets`** · sign step **PRESENT must_keep** · Nest `@Controller('core')` **ABSENT** · paper `/att` + `/core` **alias only** |
| **ref_paper_api** | **F-ATT-WF-SIGN-01/02** · **F-ATT-SHEET-02/03** · peer **F-ATT-SHEET-01/AGG** (ATT-10 must_keep · ≠ AGG=DONE) · peer **F-ATT-SHEET-04** (PAY OUT invent DONE) · Nest `@Controller('core')` **ABSENT** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-11** · Diễn biến **#1–#3 + Thành công** · **BR-BP-TS-02** · **R-SIGN-01** · partner **REQ_L_001** · UC kế = **PAY-01** (**OUT** invent DONE) |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/attendance-sheets*` · paper `/att` + `/core` alias only · U19 · soft-delete · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** second sign ledger |
| **ref_code_cite** | `attendance-sheet-sign.service.ts` · `MANDATORY_PERSONAS = employee · direct_manager · hr_admin` · runtime DDL `att_timesheet_sign_step` · GET/POST `…/signatures` · POST `…/close` · POST `…/reopen` · FE `AttendanceSheetSignPanel` · Nest `@Controller('core')` **ABSENT** — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim LIVE sign/close alone = ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **DENY** claim soft/ATT-08=ATT-09 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word/HOL/MEAL/`lines[]` DONE · **DENY** CFG=ATT-02 DONE · **DENY** invent `att_leave_hold` · honesty flip |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| **Sign/close SoT** | **HOLD RETAIN** — LIVE **`public.attendance_sheets`** (`status` · `closed_at` · `closed_by`) + **`public.att_timesheet_sign_step`** + close/reopen writers = ONE sign/close SoT — **DENY** second sign ledger · **DENY** invent `att_leave_hold` dual · **DENY** Nest `/core` dual |
| **FIXED_GĐ1 evaluator** | **HOLD RETAIN** — `MANDATORY_PERSONAS = employee · direct_manager · hr_admin` — residual **R-ATT-11-WF** (XBOS tenant sync) **NOT** invent as DONE · **explicit ≠** FR-11 / ATT-11 DONE from LIVE alone |
| **R-ATT-11-CSUM** | **OUT GĐ1** — checksum writer **ABSENT** · footer OUT · **ADD ONLY if** closable col+writer proven |
| **R-ATT-11-INBOX** | **OUT GĐ1** — no ATT-sign inbox/task bridge required · `wf_task_instance_id` stub cols OK · **no** new inbox table |
| **R-ATT-11-EMIT** | **response-only GĐ1** — close body `event: 'timesheet.closed'` **RETAIN** · durable bus/outbox **unproven** · **≠** invent PAY DONE · **no** invent outbox table this seat |
| **R-ATT-11-WF / REJECT / CLOSE / REOPEN / DISP** | **HOLD** — WF sync residual · reject/close/reopen AC on LIVE spine · DISP = sign DTO (≠ invent ATT-10 `lines[]` DONE) |
| Display-ready DTO | **Cite** §4.5 — `header_id` · `status` · `statusLabelVi` · `steps[]` · `missing_mandatory_roles[]` · `can_close` · `policy_ready?` |
| Nest path | Physical `/api/hrm/attendance/attendance-sheets*` · Nest `@Controller('core')` **ABSENT** · paper `/att` + `/core` **alias only** |
| ATT-10 AGG/submit | **must_keep** · stamp **`ATT10QC1-MSLWGUYH`** · ≠ AGG=ATT-10 DONE · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT · Nest `/core` AGG 0 |
| ATT-09 hold/settle | **must_keep** · stamp **`ATT09QC1-MSLUTL9D`** · held=`pending_days` · DENY `att_leave_hold` · Nest `/core` leave 0 · soft/ATT-08≠ATT-09 DONE |
| ATT-08 preview | **must_keep** · stamp **`ATT08QC1-MSLSL36C`** |
| ATT-02 CFG | **must_keep** · stamp **`ATT02QC1-MSLQZUK7`** · **CFG≠ATT-02 DONE** |
| PLT-01 | **must_keep** · stamp **`PLT01QC1-MSLPUQIU`** · peer≠PLT DONE |
| CORE-10 | **must_keep** · stamp **`CORE10QC1-MSLP0EJB`** · ≠ CORE-10 DONE |
| CORE-09 printable | **must_keep** · stamp **`CORE09QC1-MSLNBA89`** · printable **false** · ≠ CORE-09 DONE |
| CORE-07 GATE/ACT | **must_keep** · stamp **`CORE07QC1-KZJTSHNT`** · Nest DENY · soft≠CORE-06 DONE |
| PAY / printable / Word / HOL/MEAL / `lines[]` | **OUT invent DONE** · R-ATT-10-DISP **P2 HOLD** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim LIVE=ATT-11 DONE · AGG=ATT-10 DONE · ATT UAT · soft/ATT-08=ATT-09 DONE · CFG=ATT-02 · PLT/CORE DONE |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `att_timesheet_header` | LIVE **`public.attendance_sheets`** | **HOLD RETAIN** · ONE header · close cols RETAIN · **DENY** dual header |
| `att_timesheet_sign_step` | LIVE **`public.att_timesheet_sign_step`** (runtime DDL + paper §4.6.1) | **HOLD RETAIN** · UQ `(header_id, step_code)` WHERE `archived_at IS NULL` · **DENY** second sign ledger |
| F-ATT-WF-SIGN-02 | **`GET /api/hrm/attendance/attendance-sheets/{id}/signatures`** | **HOLD RETAIN** · ≠ FR-11 DONE alone |
| F-ATT-WF-SIGN-01 | **`POST …/attendance-sheets/{id}/signatures`** | **HOLD RETAIN** · submitted only · dup 409 |
| F-ATT-SHEET-02 | **`POST …/attendance-sheets/{id}/close`** | **HOLD RETAIN** · evaluator + line_locked · CSUM **OUT GĐ1** |
| F-ATT-SHEET-03 | **`POST …/attendance-sheets/{id}/reopen`** | **HOLD RETAIN** · archive sign steps/lines → submitted |
| FIXED_GĐ1 ladder | `MANDATORY_PERSONAS` 3 roles LIVE | **HOLD RETAIN** · **R-ATT-11-WF** residual · ≠ full R-SIGN-01 DONE |
| Checksum on close | **ABSENT** | **OUT GĐ1** · ADD only if closable |
| Inbox / task bridge | cols optional · **no** bridge | **OUT GĐ1** · **HOLD** no new table |
| `timesheet.closed` durable bus | response field only | **response-only GĐ1** · HOLD no outbox invent |
| ATT-10 AGG/submit peer | SEALED `ATT10QC1-MSLWGUYH` | **must_keep** · ≠ AGG=DONE · DISP P2 HOLD |
| Paper held / `att_leave_hold` | LIVE **`employee_leave_balances.pending_days`** (ATT-09) | **must_keep** · **DENY invent dual** |
| Nest `/core` sign/close table | — | **DENY invent** |
| Paper `/core` / `/att` | Alias only | **DENY** Nest dual SoT |
| ATT-09/08/02/PLT/CORE peers | seals | **must_keep** · ≠ claim DONE |

```text
  public.attendance_sheets (LIVE — HOLD RETAIN · header alias · close/reopen SoT)
        RETAIN: id · company_id · start_date/end_date · status open|submitted|closed
                closed_at · closed_by · …
        DENY invent second header / Nest /core dual
                │
                │ 1──N active (UQ header_id, step_code WHERE archived_at IS NULL)
                ▼
  public.att_timesheet_sign_step (LIVE — HOLD RETAIN · ONE sign ledger · §4.6.1)
        RETAIN: step_code · persona_role · outcome approved|rejected · signed_at
                signer_user_id · comment? · workflow_definition_id? · wf_task_instance_id?
                archived_at (set on reopen)
        FIXED_GĐ1 evaluator: employee · direct_manager · hr_admin (all approved → can_close)
        any rejected → can_close=false → close 409 HRM-ATT-SIGN-INCOMPLETE
        DENY invent second sign ledger / att_leave_hold dual
                │
                │ Physical API (HOLD RETAIN)
                ▼
  GET  /api/hrm/attendance/attendance-sheets/{id}/signatures
  POST …/attendance-sheets/{id}/signatures
  POST …/attendance-sheets/{id}/close     (can_close only · lock lines · event response-only)
  POST …/attendance-sheets/{id}/reopen    (reason · archive steps/lines → submitted)
  Paper /att/… + /core/… = ALIAS ONLY
  Prerequisite: status=submitted (ATT-10 AGG+submit must_keep · ≠ AGG=ATT-10 DONE)

  Display-ready DTO (cite · HOLD schema until Dev after API):
        header_id · status · statusLabelVi
        steps: [{ step_code, persona_role, outcome, signed_at, signer_user_id, comment? }]
        missing_mandatory_roles[] · can_close · policy_ready?

  OUT GĐ1 this seat:
        CSUM writer ABSENT · INBOX bridge ABSENT · durable EMIT unproven
        ADD residual ONLY if closable checksum writer OR WF sync binding cols proven

  ATT10QC1-MSLWGUYH AGG/submit · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT ·
  ATT09QC1-MSLUTL9D hold/settle pending_days · DENY att_leave_hold ·
  ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU ·
  CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT ·
  soft≠CORE-06 · Nest /core DENY
        SEALED must_keep

  FORBIDDEN GĐ1 this seat:
        Invent second sign ledger · invent att_leave_hold dual · Nest /core dual
        Wipe LIVE sheets/sign_step/close · wipe ATT-10/09/08/02/PLT/CORE
        Invent PAY/printable/Word/HOL/MEAL/lines[] DONE · invent CSUM/INBOX as DONE
        Claim LIVE alone = ATT-11 DONE · claim AGG = ATT-10 DONE · claim ATT UAT
        Claim soft/ATT-08=ATT-09 DONE · CFG=ATT-02 DONE · PLT/CORE DONE
        Claim FIXED_GĐ1 alone = full R-SIGN-01 / FR-11 DONE
        Honesty flip · reopen sealed J-* · seed · apps/**
```

**Label lock:** Board «Ký chốt bảng công (WF XBOS)» GĐ1 = **LIVE `attendance_sheets` + `att_timesheet_sign_step` + close/reopen RETAIN** — **not** Nest `/core` dual · **not** second ledger · **not** LIVE alone = FR-11 DONE.  
**Spine lock:** Physical `/api/hrm/attendance/attendance-sheets*` — **DENY** Nest `/core` second SoT · paper `/att`+`/core` alias only.  
**Ladder lock:** FIXED_GĐ1 3-persona **RETAIN** · **R-ATT-11-WF** residual · ≠ invent HRM WF engine · ≠ claim full R-SIGN-01 DONE.  
**Honesty lock:** `attendance_uat_ready=false` · printable false · C-SLICE · PAY OUT · ≠ ATT-11 DONE · ≠ AGG=ATT-10 DONE · CFG≠ATT-02 DONE · soft/ATT-08≠ATT-09 DONE.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-11 DONE** · LIVE alone ≠ FR-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · HOL/MEAL/`lines[]` invent DONE OUT · R-ATT-10-DISP P2 HOLD · must_keep ATT-10 `ATT10QC1-MSLWGUYH` · ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · DENY invent `att_leave_hold` · no seed · no apps/**

---

## 3. AS-IS baseline (Nest facts — read-only cite · 2026-08-09)

| Object | AS-IS LIVE | Gap (Wave-29 DATA) |
|--------|------------|---------------------|
| **`public.attendance_sheets`** | Header + `status` · `closed_at` · `closed_by` | **HOLD RETAIN** · ≠ FR-11 DONE alone |
| **`public.att_timesheet_sign_step`** | Runtime DDL PRESENT · UQ active step · archive on reopen | **HOLD RETAIN** · DENY second ledger |
| **`GET/POST …/signatures`** | steps · can_close · missing_mandatory_roles · dup 409 | **HOLD RETAIN** · ≠ ATT-11 DONE from LIVE alone |
| **FIXED_GĐ1 evaluator** | `employee` · `direct_manager` · `hr_admin` | **HOLD RETAIN** · **R-ATT-11-WF** residual |
| **`POST …/close`** | can_close gate · line_locked · `event: timesheet.closed` | **HOLD RETAIN** · CSUM **ABSENT** = **OUT GĐ1** |
| **`POST …/reopen`** | archive steps/lines → submitted | **HOLD RETAIN** · reason/RBAC AC residual |
| Checksum writer | **ABSENT** | **OUT GĐ1** · ADD only if closable |
| Inbox / task bridge | cols stub · **no** bridge | **OUT GĐ1** · HOLD no table |
| Durable bus emit | **unproven** | response-only GĐ1 · HOLD no outbox |
| XBOS tenant WF sync | fixed set interim | **R-ATT-11-WF** · ≠ invent DONE |
| Paper F-ATT-WF-SIGN / `/core` | Nest `@Controller('core')` **ABSENT** | **alias only** · **DENY invent** dual |
| ATT-10 AGG/submit | SEALED `ATT10QC1-MSLWGUYH` · DISP P2 HOLD | **must_keep** · ≠ AGG=DONE |
| ATT-09/08/02/PLT/CORE | SEALED stamps | **must_keep** · **DENY wipe** |
| PAY deepen | QUEUED | **OUT invent DONE** |

**FORBIDDEN invent this seat:** wipe LIVE sheets/sign_step/close · Nest `/core` dual · invent second sign ledger · invent `att_leave_hold` · invent CSUM/INBOX/outbox as DONE · invent PAY/printable/Word/HOL/MEAL/`lines[]` DONE · claim LIVE = FR-11 / ATT UAT · claim AGG=ATT-10 DONE · claim FIXED_GĐ1 = full R-SIGN-01 DONE · claim soft/ATT-08=ATT-09 DONE · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · seed · honesty flip · apps/** · reopen sealed J-HRM-ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01.

---

## 4. HOLD / residual dispositions (normative)

### 4.1 Sign/close SoT — **HOLD RETAIN** (mission §1)

| Physical | Rule |
|----------|------|
| `attendance_sheets` + `att_timesheet_sign_step` + close/reopen | **HOLD RETAIN** · ONE sign/close SoT |
| Second sign ledger / Nest `/core` dual / `att_leave_hold` | **DENY invent** |
| LIVE alone = FR-11 / ATT-11 DONE | **DENIED** (**R-ATT-11-≠-LIVE-DONE**) |

### 4.2 FIXED_GĐ1 + R-ATT-11-WF — **HOLD RETAIN** (mission §2)

| Residual | Ruling |
|----------|--------|
| **FIXED_GĐ1** | `employee` · `direct_manager` · `hr_admin` **RETAIN** for GĐ1 AC |
| **R-ATT-11-WF** | XBOS tenant order/parallel sync = **IN-SCOPE residual** · **NOT** invent as DONE this seat |
| ADD WF sync cols | **ONLY if** closable binding proven later · prefer footer FIXED_GĐ1 |
| DENY | Invent HRM-owned WF engine · claim FIXED_GĐ1 = full R-SIGN-01 / FR-11 DONE |

### 4.3 CSUM / INBOX / EMIT — **OUT / response-only GĐ1** (mission §3)

| Residual | Ruling |
|----------|--------|
| **R-ATT-11-CSUM** | Checksum writer **ABSENT** · footer **OUT GĐ1** · **ADD ONLY if** closable col+writer proven |
| **R-ATT-11-INBOX** | **OUT GĐ1** · stub `wf_task_instance_id` OK · **HOLD** no new inbox table |
| **R-ATT-11-EMIT** | Close response `event: 'timesheet.closed'` **RETAIN** · durable bus **unproven** · **≠** invent PAY DONE · **HOLD** no outbox table |
| DENY | Claim missing CSUM/INBOX = ATT-11 FAIL when footer OUT · invent silent CSUM as DONE · invent PAY from emit |

### 4.4 REJECT / CLOSE / REOPEN / DISP — **HOLD** AC (no schema ADD stamped)

| Residual | Ruling |
|----------|--------|
| **R-ATT-11-REJECT** | LIVE `outcome` enum RETAIN · reject → `can_close=false` → close **409** `HRM-ATT-SIGN-INCOMPLETE` |
| **R-ATT-11-CLOSE** | LIVE `closed_*` + `line_locked` RETAIN · no bypass without `can_close` |
| **R-ATT-11-REOPEN** | LIVE archive pattern RETAIN · reason + RBAC AC · **DENY** hard-delete history |
| **R-ATT-11-DISP** | Sign display-ready DTO · **≠** invent ATT-10 `lines[]` / HOL/MEAL DONE · peer **R-ATT-10-DISP P2 HOLD** |

### 4.5 Display-ready DTO — cite (mission §4)

| DTO field | Source / derive | Rule |
|-----------|-----------------|------|
| `header_id` | sheet id | display-ready |
| `status` | header status | submitted\|closed (sign path) |
| `statusLabelVi` | wire/derive | VI label |
| `steps[].step_code` | sign_step | required |
| `steps[].persona_role` | sign_step | employee\|direct_manager\|hr_admin |
| `steps[].outcome` | sign_step | approved\|rejected |
| `steps[].signed_at` | sign_step | timestamptz |
| `steps[].signer_user_id` | sign_step | required |
| `steps[].comment?` | sign_step | required when rejected |
| `missing_mandatory_roles[]` | evaluator | FIXED_GĐ1 set |
| `can_close` | evaluator | true only when 3× approved · no reject |
| `policy_ready?` | optional wire | HOLD derive · not invent PAY |

**Residual wire:** sa API may stamp envelope fidelity **ONLY if** closable gap — prefer physical F-ATT-WF-SIGN + F-ATT-SHEET-02/03 cite · **HOLD** schema invent until API locks DTO.

### 4.6 ATT-10/09/08/02/PLT/CORE seals · Nest `/core` — **RETAIN** (mission §5)

| Stamp | Rule |
|-------|------|
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

### 4.7 DENY inventory (mission §7)

| DENY | Why |
|------|-----|
| Second sign ledger / Nest `/core` dual | Option A · O1/O9 |
| Invent `att_leave_hold` dual | ATT-09 held=`pending_days` |
| Wipe ATT-10/09/08/02/PLT/CORE | must_keep seals |
| Invent PAY/printable/Word/HOL/MEAL/`lines[]` DONE | OUT invent · printable false · DISP HOLD |
| Claim LIVE alone = ATT-11 DONE | R-ATT-11-≠-LIVE-DONE · C-SLICE |
| Claim AGG alone = ATT-10 DONE | O2/O10 · ATT10 seal |
| Claim FIXED_GĐ1 = full R-SIGN-01 / FR-11 DONE | R-ATT-11-WF footer |
| Claim soft/ATT-08 = ATT-09 DONE | O10 · ATT09 seal |
| Claim ATT module UAT / CFG=ATT-02 DONE | O10/O12 |
| Claim PLT/CORE DONE | must_keep honesty |
| Invent CSUM/INBOX as DONE / invent outbox PAY | OUT / response-only footers |
| Honesty flip / reopen sealed J-* / seed / apps/** | preserve · U65 · docs-only |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-11 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE · `attendance_uat_ready=false` · ≠ AGG=ATT-10 DONE · CFG≠ATT-02 DONE · soft/ATT-08≠ATT-09 DONE

---

## 5. Validation matrix (data integrity — HOLD)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-ATT-11-DATA-01 | GET/POST signatures on submitted | LIVE spine RETAIN | steps · can_close · Nest `/core` 0 · ≠ FR-11 DONE claim from LIVE alone |
| VAL-ATT-11-DATA-02 | FIXED_GĐ1 evaluator | 3 personas approved | `can_close=true` · missing=[] |
| VAL-ATT-11-DATA-03 | Any `rejected` | block close | `can_close=false` · close **409** `HRM-ATT-SIGN-INCOMPLETE` |
| VAL-ATT-11-DATA-04 | Incomplete personas | no bypass | close **409** INCOMPLETE |
| VAL-ATT-11-DATA-05 | Dup active `step_code` | UQ | **409** `HRM-ATT-SIGN-DUP` |
| VAL-ATT-11-DATA-06 | Close when can_close | terminal | `status=closed` · lines locked · F5 closed |
| VAL-ATT-11-DATA-07 | Reopen closed | archive pattern | steps/lines archived · status `submitted` · history retained |
| VAL-ATT-11-DATA-08 | Sheet closed | mutate sign/AGG | **409** `HRM-ATT-SHEET-LOCKED` |
| VAL-ATT-11-DATA-09 | Non-submitted sign | prereq ATT-10 | 409 LOCKED or documented reject |
| VAL-ATT-11-DATA-10 | CSUM / INBOX GĐ1 | footer OUT | ABSENT OK · no silent invent · ADD only if closable |
| VAL-ATT-11-DATA-11 | Emit GĐ1 | response-only | `event: timesheet.closed` · ≠ invent PAY DONE |
| VAL-ATT-11-DATA-12 | Scope mismatch | U19 list=get=sign/close | `HRM-SCOPE-409` / 404 |
| VAL-ATT-11-DATA-13 | Nest `/core` dual | `@Controller('core')` as SoT | **FAIL** O9 |
| VAL-ATT-11-DATA-14 | Invent `att_leave_hold` / second ledger | schema/grep | **FAIL** |
| VAL-ATT-11-DATA-15 | Claim LIVE=DONE / AGG=ATT-10 DONE / ATT UAT / CFG=02 / soft=09 / invent PAY/printable | evidence footer | **FAIL** honesty |

---

## 6. Lifecycle (sign/close — HOLD)

| From → To | Legal? | Notes |
|-----------|--------|-------|
| Submitted → POST signature approved | YES | Insert active step · ≠ ATT-11 DONE alone |
| Submitted → POST signature rejected | YES | comment required · can_close false |
| 3× approved → close | YES | closed + line_locked · event response-only · ≠ invent PAY DONE |
| Incomplete / reject → close | **NO** | 409 INCOMPLETE |
| Closed → sign / AGG mutate | **NO** | 409 LOCKED |
| Closed → reopen (+ reason) | YES | archive steps/lines → submitted · audit retained |
| Reopen → hard-delete sign history | **NO** | DENY wipe · soft archive only |
| Close → invent CSUM/INBOX DONE | **NO** | footer OUT |
| LIVE alone → claim FR-11 / ATT UAT | **NO** | C-SLICE |
| FIXED_GĐ1 → claim full R-SIGN-01 DONE | **NO** | R-ATT-11-WF residual |
| Sign/close → Nest `/core` second SoT | **NO** | DENY dual |
| AGG alone → claim ATT-10 DONE | **NO** | ATT10 must_keep ≠DONE |

Invalid transition → deterministic 4xx (not silent wipe / soft-OK dual ledger).

---

## 7. Scope parity (U19)

| Surface | Resolver | Rule |
|---------|----------|------|
| attendance-sheets list/get/signatures/close/reopen | hrm list-scope TEXT slug family | list **=** get-by-id **=** sign/close/reopen |
| Sign steps under sheet | same company scope as header | no cross-CT sign write |
| ATT-10 AGG/submit peer | same attendance family | **must_keep** · ≠ AGG=DONE |
| ATT-09 leave peers (cite) | same attendance family | **must_keep** · held=`pending_days` |
| ATT-02 late_penalty peer | same family | **CFG≠ATT-02 DONE** |

**Flag:** If residual ADD later introduces CSUM/WF sync cols, sa API **MUST** document list=get=sign/close parity — else `scope_parity` defect.

---

## 8. Traceability (requirement → physical → API → FE → test)

| BR/AC | Physical | API | FE / J-* | Evidence expect |
|-------|----------|-----|----------|-----------------|
| BR-BP-TS-02 · AC-ATT-11-SIGN/LADDER/GET-SIGN | LIVE `attendance_sheets` + `att_timesheet_sign_step` | F-ATT-WF-SIGN-01/02 physical `/attendance/…/signatures` | **J-HRM-ATT-11-01..02** DRAFT | steps · can_close · Nest `/core` 0 · ≠ LIVE=DONE |
| AC-ATT-11-REJECT/FAIL-REJECT/NO-BYPASS | outcome + evaluator | POST close 409 INCOMPLETE | **J-03/04** | reject/incomplete block |
| AC-ATT-11-CLOSE/F5/EMIT | closed_* + line_locked | F-ATT-SHEET-02 | **J-02/06** | closed · F5 · event response-only · ≠ PAY DONE |
| AC-ATT-11-REOPEN | archived_at pattern | F-ATT-SHEET-03 | **J-05** | submitted · archive · F5 |
| AC-ATT-11-CSUM-OUT / INBOX-OUT / WF-FOOTER | OUT / FIXED_GĐ1 | — | footer | ABSENT OK · ≠ invent DONE |
| AC-ATT-11-DISP | display-ready DTO | GET signatures body | SignPanel · **J-01** | FE bind · ≠ invent lines[] DONE |
| AC-ATT-11-PATH | Nest `/attendance` | paper `/att`+`/core` alias | all J-* | Nest `/core` **0** |
| AC-ATT-11-MK-* / H / PAY-OUT / ≠-* | seals | — | **J-06** footer | ATT-10/09/08/02/PLT/CORE ≠ DONE · printable false · CFG≠DONE · ≠ AGG=DONE · C-SLICE · soft≠09 DONE |

---

## 9. Unlock next — sa API-01

| Field | Value |
|-------|--------|
| **next_owner** | **sa** |
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01` |
| **Mission** | F.1 deepen **F-ATT-WF-SIGN-01/02** + **F-ATT-SHEET-02/03** physical prefer `GET/POST /api/hrm/attendance/attendance-sheets/{id}/signatures` · `POST …/close` · `POST …/reopen` · RETAIN cite · paper `/att` + `/core` **alias only** · cite this DATA-01 physical prefer · display-ready sign DTO · residual wire **ONLY if** closable (REJECT/CLOSE/REOPEN/DISP/WF — **not** invent CSUM/INBOX/EMIT durable/PAY DONE) · **DENY** Nest dual · invent second sign ledger · invent `att_leave_hold` · invent PAY/printable · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT UAT · soft/ATT-08=ATT-09 DONE · CFG=ATT-02 DONE · seed · apps/** |
| **cấm** | Dev invent migrate before API F.1 · Nest `/core` SoT · wipe ATT-10/09/08/02/PLT/CORE · honesty flip |

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §11 |
| **next_owner** | `sa` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md` |
| **next_dispatch_prompt** | See §12 |

---

## 11. completion_report

**Closed:** ba-data **CONFIRMED HOLD** for UC-BP-ATT-11 / FR-UC-BP-ATT-11 — LIVE **`public.attendance_sheets` + `public.att_timesheet_sign_step` + close/reopen** = ONE sign/close SoT (**DENY** second sign ledger · **DENY** invent `att_leave_hold` · **DENY** Nest `/core` dual); **HOLD RETAIN** FIXED_GĐ1 3-persona evaluator (**≠** FR-11 DONE from LIVE alone · **R-ATT-11-WF** residual **NOT** invent DONE); CSUM **OUT GĐ1** · INBOX **OUT GĐ1** · EMIT **response-only GĐ1** (ADD residual **ONLY if** closable CSUM/WF sync proven); cite display-ready **header_id · status · statusLabelVi · steps[] · missing_mandatory_roles[] · can_close · policy_ready?**; **must_keep** ATT10QC1-MSLWGUYH AGG/submit (**≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT) · ATT09QC1-MSLUTL9D hold/settle `pending_days` · DENY `att_leave_hold` · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · soft/ATT-08≠ATT-09 DONE · ≠ ATT UAT · PAY OUT; DENY wipe peers · invent PAY/printable/Word/HOL/MEAL/`lines[]` · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT UAT · honesty flip · seed · apps/** · NO migrate this seat.

**Residual open (API/FE — not DATA schema ADD this seat):** R-ATT-11-REJECT/CLOSE/REOPEN/DISP/WF AC wire + U65 J-HRM-ATT-11-* — unlock **sa API** F.1 F-ATT-WF-SIGN-01/02 + F-ATT-SHEET-02/03. CSUM/INBOX remain **OUT GĐ1** · EMIT response-only unless closable ADD proven later.

---

## 12. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-29 seat #31)
uc_ids: UC-BP-ATT-11 · FR-UC-BP-ATT-11
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA Option A · R-ATT-11-WF/INBOX/REJECT/CLOSE/CSUM/EMIT/REOPEN/DISP · FIXED_GĐ1 · CSUM OUT GĐ1 · INBOX OUT GĐ1 · EMIT response-only · printable false · ATT10QC1-MSLWGUYH AGG/submit RETAIN (≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · Nest /core AGG 0) · ATT09QC1-MSLUTL9D hold/settle pending_days DENY att_leave_hold · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · soft/ATT-08≠ATT-09 DONE · ≠ ATT UAT · PAY OUT · DENY second sign ledger
spec_ref: F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02/03 physical prefer GET/POST /api/hrm/attendance/attendance-sheets/{id}/signatures · POST …/close · POST …/reopen · paper /att + /core alias only · LIVE attendance_sheets + att_timesheet_sign_step = sign/close SoT · FIXED_GĐ1 MANDATORY_PERSONAS employee|direct_manager|hr_admin · BR-BP-TS-02 · display-ready header_id·status·statusLabelVi·steps[{step_code,persona_role,outcome,signed_at,signer_user_id,comment?}]·missing_mandatory_roles[]·can_close·policy_ready? · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE · soft/ATT-08≠ATT-09 DONE

MISSION — API F.1 (docs-only · RETAIN cite · wire residual ONLY if closable):
1) CONFIRM RETAIN F-ATT-WF-SIGN-02 physical GET /api/hrm/attendance/attendance-sheets/{id}/signatures — steps · missing_mandatory_roles · can_close — paper /att+/core alias only — ≠ FR-11 DONE from LIVE alone
2) CONFIRM RETAIN F-ATT-WF-SIGN-01 physical POST …/signatures — submitted only · approved|rejected · dup 409 HRM-ATT-SIGN-DUP — FIXED_GĐ1 personas RETAIN — R-ATT-11-WF residual NOT invent DONE
3) CONFIRM RETAIN F-ATT-SHEET-02 physical POST …/close — can_close only · 409 HRM-ATT-SIGN-INCOMPLETE · line_locked · event timesheet.closed response-only — CSUM OUT GĐ1 · ≠ invent PAY DONE
4) CONFIRM RETAIN F-ATT-SHEET-03 physical POST …/reopen — archive steps/lines → submitted · reason/RBAC AC — DENY hard-delete history
5) CONFIRM display-ready DTO wire cite — header_id·status·statusLabelVi·steps[]·missing_mandatory_roles[]·can_close·policy_ready? — ≠ invent ATT-10 lines[]/HOL/MEAL DONE
6) Residual wire ONLY if closable gap (REJECT/CLOSE/REOPEN/DISP/WF) — HOLD invent Nest /core · HOLD invent second sign ledger · HOLD invent att_leave_hold · HOLD invent CSUM/INBOX/outbox DONE · HOLD invent PAY endpoints · HOLD invent FULL R-SIGN-01 DONE from FIXED_GĐ1 alone
7) RETAIN ATT-10/09/08/02/PLT/CORE seals · Nest /core DENY · soft≠CORE-06 · printable false · soft/ATT-08≠ATT-09 DONE · CFG≠ATT-02 DONE · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · ≠ ATT UAT · PAY OUT
8) DENY wipe peers · invent att_leave_hold dual · invent second sign ledger · invent PAY/printable/Word/HOL/MEAL/lines[] DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · honesty flip · reopen sealed J-* · seed · apps/**
9) Unlock next prefer FE+QA U65 J-HRM-ATT-11-01..06 DRAFT — Dev-BE optional wire-only AFTER API CONFIRMED

exit: docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01.md · PASS_TO_PM · next FE/QA (or Dev wire-only if closable)
cấm: apps/** · seed · Nest /core dual invent · invent att_leave_hold dual · invent second sign ledger · wipe ATT-10/09/08/02/PLT/CORE · honesty flip · claim ATT module UAT · invent PAY/printable/Word/HOL/MEAL/lines[] DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim soft/ATT-08=ATT-09 DONE
```

---

*End DATA-01 · CONFIRMED HOLD · 2026-08-09*
