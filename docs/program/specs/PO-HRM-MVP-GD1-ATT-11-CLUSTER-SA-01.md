# PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01 — Option/F.1 · Ký chốt bảng công (workflow XBOS) — RETAIN LIVE WF-SIGN + close/reopen

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe ATT-10 AGG/submit · **DENY** wipe ATT-09 hold/settle · **DENY** wipe ATT-08 preview · **DENY** invent `att_leave_hold` dual · **DENY** invent PAY/printable/HOL/MEAL/`lines[]` DONE · **DENY** honesty flip · **DENY** claim ATT module UAT · **DENY** claim AGG=ATT-10 DONE · **DENY** claim ATT-11 DONE from LIVE alone · **C-SLICE** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** AC → (ba-data HOLD/ADD residual) → API/FE/BE residual only after contracts · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-28 UC-BP-ATT-10 **SEALED** — stamp **`ATT10QC1-MSLWGUYH`** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-qc-01.md` · QA **`ATT10QA1-MSLWCDX2`** · residual **`R-ATT-10-DISP` P2 HOLD** · **≠ AGG=ATT-10 DONE** · **must_keep** `ATT09QC1-MSLUTL9D` hold/settle (`pending_days` · DENY `att_leave_hold`) · `ATT08QC1-MSLSL36C` preview RETAIN · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` (**printable false** · ≠ CORE-09 DONE) · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` **ABSENT** · **≠ ATT UAT** · PAY invent DONE **OUT** · HOL/MEAL OUT GĐ1 |
| **uc_ids** | `UC-BP-ATT-11` · `FR-UC-BP-ATT-11` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#31** after ATT-10 (#30 SEALED GWC) · PAY remain **QUEUED** · PAY OUT invent DONE |
| **ref_sa_spine** | ATT-10 [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md) · prior Manifest pilot `docs/qa/evidence/po-hrm-bp-att-sign-sa-01.md` (cite only · **≠** invent = this cluster DONE) · ATT-09/08/02/PLT/CORE seals · honesty packs **RETAIN false** — **DENY reopen sealed J-HRM-ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 without regression** |
| **ref_honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR module UAT **false** · product_go **false** · **DENY claim LIVE sign/close alone = ATT-11 DONE** · **DENY claim AGG = ATT-10 DONE** · **DENY invent PAY/printable/HOL/MEAL/`lines[]` DONE** · **DENY claim ATT module UAT** · **C-SLICE** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-11** · Diễn biến **#1–#3 + Thành công** · **BR-BP-TS-02** (chưa đủ chữ ký → không mở lệnh tính lương · một bên từ chối → không vào PAY) · **R-SIGN-01** (workflow XBOS theo tenant · đủ NV+QL+HR · không hard-code ladder tập đoàn) · partner **REQ_L_001** · UC kế = **PAY-01** đọc sheet `closed` (**OUT** invent DONE this seat) |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` **§6.4** · F-ATT-SHEET-01 submit tiền đề · **F-ATT-WF-SIGN-01/02** · **F-ATT-SHEET-02** close+checksum+`timesheet.closed` · **F-ATT-SHEET-03** reopen · **F-ATT-SHEET-04** GET closed whitelist PAY · R-SIGN-01 CLOSED · ATT **consumer** WF · không sở hữu engine XBOS |
| **ref_adr** | This Option evaluation · Nest physical prefer `/api/hrm/attendance/attendance-sheets*` · paper `/att/*` + `/core` **alias only** · U19 scope parity list↔GET↔sign/close · soft-delete · **DENY** Nest `/core` dual · prior path ADR cite `ADR-HRM-ATT-SHEET-HTTP-PATH-20260805` |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-ATT-WF-SIGN-01/02** · **F-ATT-SHEET-02/03/04** · Manifest `PO-HRM-BP-ATT-SIGN-DB-API-01` · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE `public.attendance_sheets` (header · `status` · `closed_at` · `closed_by`) · **`public.att_timesheet_sign_step`** (runtime DDL · `step_code` · `persona_role` · `outcome` · optional `workflow_definition_id` · `wf_task_instance_id`) · peer `att_timesheet_line` lock on close · Nest `@Controller('core')` **ABSENT** |
| **ref_code** | `attendance-sheet-sign.service.ts` · `attendance.controller` GET/POST `…/signatures` · POST `…/close` · POST `…/reopen` · FE `AttendanceSheetSignPanel.tsx` · `hrmApi` signatures/close · scope-parity jest · **read-only cite** · CoreModule = DB export only |
| **OUT** | Nest `/core` dual · wipe ATT-10 AGG/submit · wipe ATT-09 hold · wipe ATT-08 preview · invent `att_leave_hold` · invent PAY DONE · invent printable/Word DONE · invent HOL/MEAL/`lines[]` DONE · claim LIVE sign/close alone = ATT-11 DONE · claim AGG = ATT-10 DONE · claim ATT module UAT · reopen sealed peers · seed · honesty flip · apps/** this seat |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-29 architecture unlock: **ký chốt bảng công trước khi tính lương** (FR-UC-BP-ATT-11 · BR-BP-TS-02 · R-SIGN-01 · WF XBOS) vs AS-IS LIVE Nest WF-SIGN + close/reopen — **gap-only** under U89 |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U89 after ATT-10 QC-01 GWC (`ATT10QC1-MSLWGUYH`) · U88 continuous |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-11 · BR-BP-TS-02 · R-SIGN-01 · REQ_L_001 · F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02/03/04 · must_keep ATT-10 AGG/submit · ATT-09/08/02/PLT/CORE · Nest `/core` DENY · U19 · soft≠CORE-06 · PAY OUT invent DONE · ≠ ATT UAT · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **ATT-10 SEALED (`ATT10QC1-MSLWGUYH`):** AGG physical + submit MUST AGG · closed AGG **409** `HRM-ATT-SHEET-LOCKED` · Nest `/core` AGG **0** · **≠ AGG=ATT-10 DONE** · **`R-ATT-10-DISP` P2 HOLD** (`lines[]` ABSENT · HOLD invent) · HOL/MEAL OUT · PAY OUT · printable **false** · must_keep ATT-09/08/02/PLT/CORE · soft≠CORE-06 · ≠ ATT UAT. **Sign/close spine AS-IS (PRESENT — RETAIN cite):** (1) **GET** `…/attendance-sheets/{id}/signatures` → steps + `missing_mandatory_roles` + `can_close` (**F-ATT-WF-SIGN-02**). (2) **POST** `…/signatures` when `status=submitted` · outcomes `approved`/`rejected` · dup `step_code` → **409** `HRM-ATT-SIGN-DUP` · reject requires comment (**F-ATT-WF-SIGN-01**). (3) **Close evaluator** `MANDATORY_PERSONAS = employee · direct_manager · hr_admin` — all `approved` required · any `rejected` → `can_close=false` · close incomplete → **409** `HRM-ATT-SIGN-INCOMPLETE` (**BR-BP-TS-02**). (4) **POST close** → `status=closed` + `closed_at/by` + **lock** `att_timesheet_line` + response `event: 'timesheet.closed'` (**F-ATT-SHEET-02** terminal). (5) **POST reopen** → archive sign steps + archive lines → `submitted` (**F-ATT-SHEET-03**). (6) **DB** `att_timesheet_sign_step` runtime DDL · optional `workflow_definition_id` / `wf_task_instance_id` columns. (7) **FE** `AttendanceSheetSignPanel` + `hrmApi` list/create/close. (8) **U19** scope-parity jest SP-ATT-SIGN-*. **ABSENT / residual:** XBOS WF **master sync** per tenant (order/parallel) — LIVE uses **fixed 3-role set** (GĐ1 interim vs R-SIGN-01 full); **no** ATT-sign inbox/task bridge (unlike leave-workflow); **checksum** on close **ABSENT**; `timesheet.closed` = **response field** (outbox/bus emit **unproven**); reopen **reason+RBAC** AC depth thin; Nest `@Controller('core')` **ABSENT**. |
| **Paper target** | FR-UC-BP-ATT-11: xem bảng chờ chốt → NV+QL+HR ký theo **WF XBOS tenant** → đủ bước → **đã chốt** → tín hiệu PAY; hủy chốt = lý do + quyền + audit. BR-BP-TS-02 + R-SIGN-01. |
| **Gap class** | **GĐ1 continuous AC + residual WF-fidelity / checksum / emit / display** on LIVE sign+close spine — **not** greenfield Nest `/core`; **not** invent dual sign SoT; **not** claim LIVE alone = FR-11 DONE; **not** invent PAY DONE; **not** wipe ATT-10 AGG; **not** invent `att_leave_hold` / `lines[]` DONE. |
| **Constraints** | U89 continuous · **preserve** ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · C-SLICE · DENY seed · **cấm code until Option CONFIRMED** · gap-only · **DENY** honesty flip · **DENY** invent PAY/printable/HOL/MEAL/`lines[]` DONE · **DENY** claim ATT module UAT · **DENY** claim AGG=ATT-10 DONE |
| **Failure impact if unresolved** | Board #31 stalls or Dev invents Nest `/core` / bypass close without signs; false claim sign=ATT-11 DONE → PAY opens; wipe ATT-10 AGG / ATT-09 hold; silent one-button Chốt |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-ATT-10 + ATT-09 + ATT-08 + ATT-02 + PLT-01 + CORE-* (SEALED must_keep)
  Nest /core DENY · printable false · C-SLICE · honesty false · PAY OUT
  ATT-10: AGG+submit RETAIN · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD
       │
       │  must_keep RETAIN — DENY reopen J-HRM-ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT / CORE-*
       │  must_keep ATT-09 pending_days · DENY att_leave_hold
       │  must_keep ATT-08 preview · ATT-02 CFG peer
       ▼
  ┌────────────── FR-UC-BP-ATT-11 (this seat — gap-only RETAIN + WF residuals) ─────┐
  │                                                                                │
  │  RETAIN LIVE (cite — ≠ ATT-11 DONE alone)                                      │
  │    GET/POST /api/hrm/attendance/attendance-sheets/:id/signatures               │
  │      → att_timesheet_sign_step · can_close · missing_mandatory_roles           │
  │    POST …/close → BR-BP-TS-02 evaluator → closed + line_locked                 │
  │      + response event timesheet.closed (emit depth = residual)                 │
  │    POST …/reopen → archive steps + lines → submitted                           │
  │    FE AttendanceSheetSignPanel · U19 scope parity                              │
  │    GĐ1 interim ladder: employee + direct_manager + hr_admin (fixed set)        │
  │                                                                                │
  │  RESIDUAL unlock (BA → DATA/API — closable gap)                                │
  │    R-ATT-11-WF     : R-SIGN-01 XBOS tenant WF sync (order/parallel) vs fixed   │
  │    R-ATT-11-INBOX  : task/inbox bridge (wf_task_instance_id) OR GĐ1 OUT explicit│
  │    R-ATT-11-REJECT : one reject → block close + PAY (AC)                       │
  │    R-ATT-11-CLOSE  : terminal close only when can_close · no bypass Chốt       │
  │    R-ATT-11-CSUM   : checksum on close OR OUT GĐ1 explicit                     │
  │    R-ATT-11-EMIT   : timesheet.closed durable emit OR document response-only   │
  │    R-ATT-11-REOPEN : reason + RBAC + audit AC                                  │
  │    R-ATT-11-DISP   : display-ready steps[] · statusLabelVi · can_close FE      │
  │    Prefer physical Nest under /api/hrm/attendance/attendance-sheets*           │
  │    Paper F-ATT-WF-SIGN / F-ATT-SHEET-02/03 /att/… + /core = ALIAS ONLY         │
  │                                                                                │
  │  PAY closed read / formula = QUEUED · OUT invent DONE                          │
  │  must_keep ATT-10 AGG · ATT-09/08/02/PLT/CORE · Nest /core DENY · printable    │
  └────────────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat
       ▼
  Nest /core dual ATT                        = DENY
  Wipe ATT-10 AGG/submit / ATT-09 / ATT-08   = DENY
  Invent att_leave_hold second ledger        = DENY
  Invent PAY/printable/HOL/MEAL/lines[] DONE = DENY
  Claim LIVE sign/close alone = ATT-11 DONE  = DENY
  Claim AGG alone = ATT-10 DONE              = DENY
  Claim Option alone = ATT module UAT        = DENY
  Flip personnel / printable / recruit       = DENY
  C-SLICE ≠ module ATT / PLT / CORE / PAY UAT

  Honesty: C-SLICE ≠ attendance_uat_ready · ≠ hrm_personnel_uat_ready
           ≠ contracts_printable_ready · ≠ product_go · ≠ invent PAY DONE
```

**Label lock:** Board «Ký chốt bảng công trước khi tính lương (workflow XBOS)» GĐ1 = **RETAIN cite LIVE WF-SIGN + close/reopen + `att_timesheet_sign_step` evaluator** + **gap AC WF-fidelity** — **not** Nest `/core` dual; **not** one-button Chốt bypass; **not** Option alone = ATT UAT; **not** PAY DONE.  
**Spine lock:** Physical prefer `/api/hrm/attendance/attendance-sheets/{id}/signatures|close|reopen` · paper `/att/…` + `/core/…` = **alias only** — **DENY** Nest `/core` second SoT.  
**WF SoT lock:** ATT = **consumer** of XBOS WF definition (R-SIGN-01) — **DENY** invent HRM-owned WF engine this seat; GĐ1 fixed 3-persona evaluator = **interim RETAIN** until residual WF sync closable.  
**Honesty lock:** Slice GWC later **≠** auto-flip `attendance_uat_ready` · **≠** invent PAY/printable DONE · **≠** AGG=ATT-10 DONE · **C-SLICE**.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / TechSpec / API) | AS-IS LIVE | Verdict |
|------------|------------------------------|------------|---------|
| Xem bảng chờ chốt | Diễn biến #1 · submitted | GET sheet + FE panel · prerequisite ATT-10 submit | **RETAIN cite** peer ATT-10 · ≠ ATT-10 DONE |
| POST signature step | F-ATT-WF-SIGN-01 · NV/QL/HR | `POST …/signatures` · submitted only · dup 409 | **RETAIN cite** · residual **R-ATT-11-WF/INBOX** |
| GET signature status | F-ATT-WF-SIGN-02 | `GET …/signatures` · steps · can_close | **RETAIN cite** · **R-ATT-11-DISP** |
| Ladder NV+QL+HR | R-SIGN-01 XBOS tenant | Fixed `MANDATORY_PERSONAS` 3 roles | **RETAIN interim** · **R-ATT-11-WF** (sync OR document GĐ1 fixed) |
| Reject blocks close | SRS · BR-BP-TS-02 | `outcome=rejected` → can_close false · close 409 INCOMPLETE | **RETAIN cite** · **R-ATT-11-REJECT** AC |
| Terminal close | F-ATT-SHEET-02 · Diễn biến #2 | POST close + line_locked + status closed | **RETAIN cite** · **R-ATT-11-CLOSE** |
| Checksum | TechSpec closed+checksum | **ABSENT** writer | **RESIDUAL** R-ATT-11-CSUM (or OUT GĐ1) |
| `timesheet.closed` | emit for PAY | Response field only · bus emit **unproven** | **RESIDUAL** R-ATT-11-EMIT |
| Reopen + audit | F-ATT-SHEET-03 · Diễn biến #3 | POST reopen · archive steps/lines | **RETAIN cite** · **R-ATT-11-REOPEN** |
| XBOS inbox/task | §6.4.2 | cols optional · **no** ATT-sign bridge proven | **RESIDUAL** R-ATT-11-INBOX (or OUT GĐ1) |
| GET closed for PAY | F-ATT-SHEET-04 | GET sheet when closed | **peer RETAIN** · **OUT invent = PAY DONE** |
| Paper `/att` + `/core` | alias | Nest `/core` **ABSENT** | **paper = alias only** |
| ATT-10 AGG/submit | peer | SEALED `ATT10QC1-MSLWGUYH` · DISP P2 HOLD | **must_keep RETAIN** · ≠ AGG=DONE |
| ATT-09 hold/settle | peer | SEALED `ATT09QC1-MSLUTL9D` | **must_keep RETAIN** · DENY `att_leave_hold` |
| ATT-08 preview | peer | SEALED `ATT08QC1-MSLSL36C` | **must_keep RETAIN** |
| ATT-02 / PLT / CORE | peers | SEALED stamps | **must_keep RETAIN** |
| HOL/MEAL / `lines[]` DONE | DENY invent | HOL/MEAL OUT · DISP HOLD | **DENY invent DONE** |
| PAY deepen | OUT | QUEUED | **OUT invent DONE** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT UAT** · **≠ ATT-11 DONE** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN WF-SIGN + close/reopen (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** LIVE Nest `@Controller('attendance')` GET/POST `…/attendance-sheets/{id}/signatures` + POST `…/close` + POST `…/reopen` + `att_timesheet_sign_step` + BR-BP-TS-02 evaluator (employee · direct_manager · hr_admin) + FE `AttendanceSheetSignPanel` + U19 scope parity. Unlock BA residuals **R-ATT-11-WF/INBOX/REJECT/CLOSE/CSUM/EMIT/REOPEN/DISP** for R-SIGN-01 / Diễn biến AC (XBOS tenant ladder fidelity · reject block · no bypass Chốt · checksum/emit closable or OUT GĐ1 · reopen reason · display-ready). Prefer physical Nest under `/api/hrm/attendance/attendance-sheets*`; paper **F-ATT-WF-SIGN-01/02** + **F-ATT-SHEET-02/03** `/att/…` + `/core` = **alias only**. **must_keep** ATT10QC1-MSLWGUYH AGG/submit (**≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD**) · ATT09QC1-MSLUTL9D hold · ATT08QC1-MSLSL36C preview · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · ≠ ATT UAT. PAY/printable/HOL/MEAL/`lines[]` invent DONE **OUT**. **DENY** invent `att_leave_hold` · claim Option/LIVE alone = ATT module UAT / ATT-11 DONE. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Low–medium (spine LIVE; residual = WF sync fidelity + optional checksum/emit/inbox) |
| **Risk** | Low if BA invents Nest dual / claims LIVE=DONE / invents PAY / wipes ATT-10 AGG |
| **Cost / timeline** | BA → ba-data HOLD (prefer) → sa API F.1 deepen only if closable wire gap → Dev residual · QA U65 |
| **Pros** | Matches preserve_default; reuses coded sign/close/evaluator; unlocks board #31; avoids dual SoT; preserves ATT-10..CORE seals |
| **Cons** | Full XBOS tenant ladder sync still residual; PAY still QUEUED |
| **Failure modes** | BA over-scopes Nest `/core` · claims LIVE alone DONE · invents PAY · wipes AGG/hold/preview |
| **Mitigation** | O1–O12 locks · DENY invent · peers OUT · ≠DONE footers · C-SLICE |

### Option B — Nest `/core` dual + invent second WF / wipe LIVE sign (REJECT)

| | |
|--|--|
| **Summary** | Stand up Nest `@Controller('core')` as primary sign/close SoT; invent parallel sign ledger or hard-code Chốt bypass; dual-write or abandon `/attendance/…/signatures|close` |
| **Pros** | Paper `/core` literal |
| **Cons** | Dual SoT · violates U89 preserve · high blast · regression ATT-10 AGG + sign FE + PAY probes |
| **Failure modes** | Dual-write · Nest `/core` non-404 SoT · honesty flip · wipe AGG/sign |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim LIVE sign/close = ATT-11 DONE / honesty (REJECT)

| | |
|--|--|
| **Summary** | Declare seat DONE because signatures+close endpoints exist (even when XBOS WF sync / checksum / emit / inbox / FE journey incomplete); flip `attendance_uat_ready`; invent PAY/printable/`lines[]` DONE; reopen sealed ATT-10/09/08/02/PLT/CORE; claim AGG=ATT-10 DONE |
| **Pros** | Fast chat claim |
| **Cons** | Violates BR-BP-TS-02 / R-SIGN-01 fidelity · C-SLICE · sponsor distrust · PAY risk on incomplete closed gate |
| **Failure modes** | False UAT · one-button Chốt narrative · continuous program stall |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+gap WF AC) | B (Nest dual+wipe) | C (HOLD/claim DONE) |
|-----------|-------:|---------------------:|-------------------:|--------------------:|
| Business value (FR-ATT-11) | 5 | **5** | 2 | 0 |
| Time to deliver | 4 | **5** | 1 | Fake PASS |
| Complexity (lower=better) | 3 | **4** | 1 | — |
| Security / scope U19 | 4 | **5** | 2 | Honesty breach |
| Reliability / preserve seals | 5 | **5** | 1 | High defect |
| Maintainability | 4 | **5** | 1 | Spec lie |
| Fit BR-BP-TS-02 + R-SIGN-01 + preserve | 5 | **5** | 0 | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE WF-SIGN + close/reopen + `att_timesheet_sign_step` + BR-BP-TS-02 3-persona evaluator; unlock R-ATT-11-* residuals; paper F-ATT-WF-SIGN + F-ATT-SHEET-02/03 + `/core` = alias only; **RETAIN** ATT-10 AGG/submit · ATT-09 hold · ATT-08 preview · ATT-02/PLT/CORE · soft≠CORE-06 · Nest `/core` DENY · ≠ ATT UAT · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD; **DENY** Nest dual · invent `att_leave_hold` · wipe peers · invent PAY/printable/HOL/MEAL/`lines[]` DONE · claim LIVE alone = ATT-11 DONE · claim ATT module UAT · honesty flip · reopen seals · seed · apps/** |
| **Why selected** | AS-IS already owns BR-BP-TS-02 spine (signatures · reject blocks · close only when can_close · line_locked · reopen archive); FR-11 gap is **WF-fidelity AC (R-SIGN-01) + checksum/emit/inbox/display journey** — not greenfield Nest `/core`, not dual ledger, not wipe ATT-10 AGG; preserves W10–W28 must_keep; unlocks board #31 |
| **Assumptions** | ATT-10 **`ATT10QC1-MSLWGUYH` RETAIN** · QA `ATT10QA1-MSLWCDX2` · AGG+submit **PRESENT** · ≠ AGG=ATT-10 DONE · **R-ATT-10-DISP P2 HOLD**. ATT-09 **`ATT09QC1-MSLUTL9D` RETAIN** · held=`pending_days` · DENY `att_leave_hold`. ATT-08 **`ATT08QC1-MSLSL36C` RETAIN**. ATT-02 **`ATT02QC1-MSLQZUK7` RETAIN**. PLT-01 **`PLT01QC1-MSLPUQIU` RETAIN**. CORE-10 **`CORE10QC1-MSLP0EJB` RETAIN**. CORE-09 **`CORE09QC1-MSLNBA89` RETAIN** · printable false. CORE-07 **`CORE07QC1-KZJTSHNT` RETAIN**. soft≠CORE-06 DONE **RETAIN**. Nest `@Controller('core')` **ABSENT** (grep 2026-08-09). Physical signatures/close/reopen **PRESENT**. `attendance_uat_ready=false` · printable false · product_go **false**. PAY **QUEUED**. |
| **Rejected** | **B** — Nest `/core` dual / invent second WF / wipe · **C** — HOLD / claim LIVE = ATT-11 DONE / invent PAY·printable·`lines[]` / honesty flip / reopen sealed |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Sign/close SoT | LIVE GET/POST signatures + POST close/reopen + `att_timesheet_sign_step` · paper F-ATT-WF-SIGN / SHEET-02/03 alias | ≠DONE from LIVE alone · mint J-HRM-ATT-11-* |
| O2 | Prerequisite ATT-10 | submitted via AGG+submit must_keep `ATT10QC1-MSLWGUYH` · ≠ AGG=ATT-10 DONE · DISP P2 HOLD | AC: only submitted sheets signable · cite ATT-10 |
| O3 | Ladder R-SIGN-01 | Prefer: document GĐ1 fixed 3-persona interim **XOR** residual XBOS tenant WF sync closable | Footer FIXED_GĐ1 vs WF_SYNC residual |
| O4 | Inbox/task | Prefer OUT GĐ1 explicit (cols stub OK) **XOR** residual bridge if closable | ≠ invent XBOS engine in HRM |
| O5 | Reject | One reject → can_close false → close 409 · PAY blocked | FAIL case AC |
| O6 | Close gate | No bypass Chốt without can_close · BR-BP-TS-02 | AC + Network 409 INCOMPLETE |
| O7 | Checksum | Prefer OUT GĐ1 **XOR** residual wire if TechSpec closable | Explicit OUT or ADD |
| O8 | Emit `timesheet.closed` | Prefer document response-only GĐ1 **XOR** durable emit residual | ≠ invent PAY DONE |
| O9 | Paper `/core` + `/att` | Alias only | DENY Nest dual in AC/evidence |
| O10 | ATT-10/09/08/02/PLT/CORE | must_keep stamps · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · CFG≠ATT-02 DONE · R-ATT-10-DISP HOLD · DENY `att_leave_hold` · DENY invent `lines[]` DONE | ≠ reopen · ≠ claim DONE |
| O11 | PAY / printable / HOL/MEAL | OUT invent DONE · printable false | Trace-only if closed cite |
| O12 | Honesty / journeys | All false · C-SLICE · `attendance_uat_ready=false` · mint `J-HRM-ATT-11-*` DRAFT | Footer ≠DONE · ≠ ATT module UAT · U65 zero-seed |

---

## 5. F.1 outline (paper alias · Nest physical prefer)

> Full F.1 deepen = later **sa API** seat after BA (+ ba-data) — this outline **locks disposition only**.

| F-id (cite) | Physical METHOD/path (prefer) | Paper alias | Mục đích (VI) | Bước SRS |
|-------------|-------------------------------|-------------|---------------|----------|
| **F-ATT-WF-SIGN-02** (this seat) | `GET /api/hrm/attendance/attendance-sheets/{id}/signatures` | `/att/…` · `/core/…` **alias only** | Đọc bước ký + `can_close` + thiếu vai | Diễn biến **#1** |
| **F-ATT-WF-SIGN-01** (this seat) | `POST …/attendance-sheets/{id}/signatures` | paper alias | Ghi bước ký / từ chối (NV·QL·HR) | Diễn biến **#2** · BR-BP-TS-02 |
| **F-ATT-SHEET-02** (this seat) | `POST …/attendance-sheets/{id}/close` | paper alias | Chốt khi đủ chữ ký · lock lines · tín hiệu closed | Diễn biến **#2** Thành công |
| **F-ATT-SHEET-03** (this seat) | `POST …/attendance-sheets/{id}/reopen` | paper alias | Hủy chốt + audit | Diễn biến **#3** |
| **F-ATT-SHEET-01 / AGG** (peer RETAIN) | aggregate + submit | paper alias | Tiền đề submitted | **ATT-10 must_keep** · ≠ invent = ATT-11 DONE |
| **F-ATT-SHEET-04** (peer RETAIN) | `GET …/attendance-sheets/{id}` | paper alias | Đọc sheet (PAY chỉ khi closed) | peer PAY-01 · **OUT invent PAY DONE** |

**DENY:** invent Nest `@Controller('core')` as primary SoT for F-ATT-WF-SIGN / F-ATT-SHEET-02/03.  
**DENY:** invent second sign ledger beside `att_timesheet_sign_step`.  
**DENY:** treat paper path alone as Nest dual invent requirement.  
**DENY:** close without evaluator / one-button Chốt bypass.

**Display-ready cite for BA/DATA:** `{ header_id, status, statusLabelVi, steps: [{ step_code, persona_role, outcome, signed_at, signer_user_id, comment? }], missing_mandatory_roles[], can_close, policy_ready? }` — BA may deepen VI labels; map paper WF ladder → LIVE fixed set interim or residual sync.

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O12 + mint J-HRM-ATT-11-* DRAFT
  → ba-data HOLD default (ADD residual ONLY if BA proves closable col/writer for CSUM/WF sync)
  → sa API-01 F.1 deepen RETAIN cite F-ATT-WF-SIGN-01/02 + F-ATT-SHEET-02/03 (+ wire residual ONLY if closable)
  → Dev-BE / Dev-FE residual wire ONLY (gap-only)
  → QA U65 J-HRM-ATT-11-* browser FE-after-2xx + F5
  → QC GWC C-SLICE (≠ ATT-11 module UAT · ≠ ATT module UAT · ≠ AGG=ATT-10 DONE · printable false · PAY OUT)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O12 AC + mint J-HRM-ATT-11-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default / ADD residual only if closable | ba-data | HOLD unless closable gap |
| 4. sa API F.1 cite RETAIN WF-SIGN/close (+ wire residual ONLY if closable) | sa | API-01 delta |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 J-HRM-ATT-11-* (sign NV+QL+HR → close → F5 closed · reject blocks · Nest `/core` 0 · reopen) | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ module ATT UAT · ≠ honesty flip · ≠ wipe ATT-10/09/08 · ≠ invent PAY |

**Rollback:** Docs-only seat — supersede this Option if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · BA unlocked · ATT-10/09/08/02/PLT/CORE stamps untouched · Nest `/core` still DENY · honesty false · apps/** untouched · **≠** claim ATT-11 DONE · **≠** claim ATT UAT · **≠** claim AGG=ATT-10 DONE.

---

## 7. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | BA invents Nest `/core` dual | Spec path `/core` as SoT · Dev opens CoreController | O9 DENY · QC Nest SoT 0 |
| A | Claim LIVE alone = ATT-11 DONE | Evidence footer missing ≠DONE | O1/O12 · C-SLICE |
| A | Wipe ATT-10 AGG / ATT-09 / ATT-08 | Diff removes AGG/hold/preview | must_keep ATT10/09/08 · O10 |
| A | Invent PAY / printable / `lines[]` DONE | AC claims payroll / gold table DONE | O11 OUT · R-ATT-10-DISP HOLD |
| A | Invent `att_leave_hold` | New table dual | O10 DENY · held=pending_days |
| A | Bypass Chốt without signs | Close without can_close | O6 · 409 INCOMPLETE AC |
| A | Claim Option = ATT module UAT | Ready flag flip | O12 DENY |
| B | Dual-write / Nest `/core` | New `/core` non-404 | **REJECT B** |
| C | Honesty flip / false DONE | Ready flags true without UF wave | **REJECT C** |

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| **ATT10QC1-MSLWGUYH** | RETAIN · AGG+submit · Nest `/core` AGG 0 · **≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT · ≠ ATT-10/ATT UAT |
| ATT09QC1-MSLUTL9D | RETAIN · hold/settle/release · held=`pending_days` · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT |
| ATT08QC1-MSLSL36C | RETAIN · preview-deduction physical · T6→T2=2 · HOL-MISS · ALIGN · client-days≠ATT-08 DONE |
| ATT02QC1-MSLQZUK7 | RETAIN · **CFG≠ATT-02 DONE** · late_penalty peer · ≠ ATT UAT |
| PLT01QC1-MSLPUQIU | RETAIN · peer≠PLT DONE · merge≠platform UAT |
| CORE10QC1-MSLP0EJB | RETAIN · catalog/CRUD/LIVE≠CORE-10 DONE · BH≠CORE-07 · PAY-06 OUT |
| CORE09QC1-MSLNBA89 | RETAIN · printable **false** · ≠ CORE-09 DONE |
| CORE07QC1-KZJTSHNT | RETAIN · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE |
| soft≠CORE-06 DONE | RETAIN |
| Nest `/core` | **DENY** dual invent · paper alias only |
| PAY / printable / Word / HOL/MEAL / `lines[]` DONE | **OUT invent DONE** · printable false · DISP HOLD |
| LIVE sign/close alone | **≠** ATT-11 DONE · **≠** ATT module UAT |
| AGG alone | **≠** ATT-10 DONE |
| `att_leave_hold` | **DENY** invent dual |
| Honesty | **DENY** flip · **C-SLICE** · `attendance_uat_ready=false` |
| apps/** | **CẤM** until contracts after BA/DATA/API |
| Seed | **DENY** U65 |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A** CONFIRMED for UC-BP-ATT-11: RETAIN LIVE `GET/POST …/attendance-sheets/:id/signatures` + `POST …/close` + `POST …/reopen` + `att_timesheet_sign_step` + BR-BP-TS-02 3-persona evaluator + FE SignPanel; unlock R-ATT-11-WF/INBOX/REJECT/CLOSE/CSUM/EMIT/REOPEN/DISP; paper F-ATT-WF-SIGN + F-ATT-SHEET-02/03 `/att`+`/core` alias only; **must_keep** ATT-10 AGG/submit (`ATT10QC1-MSLWGUYH` · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD) · ATT-09 hold (`ATT09QC1-MSLUTL9D` · pending_days · DENY `att_leave_hold`) · ATT-08 preview (`ATT08QC1-MSLSL36C`) · ATT-02/PLT/CORE · Nest `/core` DENY · printable false · ≠ ATT UAT; DENY invent PAY/printable/HOL/MEAL/`lines[]` DONE · honesty flip · claim LIVE=ATT-11 DONE · apps/**. unlock_lane **BA → DATA(HOLD) → API → FE/BE**. Explicit **≠ ATT-11 DONE · ≠ ATT module UAT · ≠ AGG=ATT-10 DONE · C-SLICE · PAY OUT · printable false**. |
| **next_owner** | `ba-process` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md` |
| **unlock_lane** | `ba-process` → `ba-data` (HOLD prefer) → `sa` API-01 → `dev-be`/`dev-fe` residual → `qa` → `qc` |
| **next_dispatch_prompt** | see §10 |

---

## 10. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01
role: ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-29 seat #31)
entry_criteria: SA-01 Option A CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md · depends ATT10QC1-MSLWGUYH · must_keep ATT-10 AGG/submit RETAIN (≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · Nest /core AGG 0) · ATT09QC1-MSLUTL9D hold/settle RETAIN (pending_days · DENY att_leave_hold · Nest /core leave 0) · ATT08QC1-MSLSL36C preview RETAIN · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · PAY invent DONE OUT
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md (Option A · O1–O12 · F.1 outline · residuals R-ATT-11-* · unlock_lane)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-11 · BR-BP-TS-02 · R-SIGN-01 · Diễn biến #1–#3
  - docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md §6.4 · F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02/03/04
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-WF-SIGN · F-ATT-SHEET-02/03
  - docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-qc-01.md (must_keep ATT10QC1-MSLWGUYH)
exit_criteria:
  - BA AC pack O1–O12 CONFIRMED for UC-BP-ATT-11 (sign NV+QL+HR · reject blocks · close gate · reopen · display · WF GĐ1 fixed XOR residual)
  - Mint J-HRM-ATT-11-* DRAFT (U65 browser) — submitted sheet → POST signatures đủ 3 vai → POST close → F5 closed; reject path; Nest /core 0; không seed
  - Explicit ≠ ATT-11 DONE from LIVE alone · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · ≠ soft/ATT-08=ATT-09 DONE · ≠ CFG=ATT-02 DONE · printable false · C-SLICE · PAY OUT · DENY invent att_leave_hold · DENY invent HOL/MEAL/lines[] DONE
  - ba-data HOLD default (ADD residual only if closable gap for CSUM/WF sync) · DENY Nest /core dual · DENY invent PAY/printable/Word DONE · DENY wipe ATT-10/09/08 · DENY seed · DENY apps/**
  - evidence: docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md
  - ack_status PASS_TO_PM · next ba-data HOLD (or sa API if closable gap ONLY)
cấm: apps/** · seed · Nest /core invent · invent att_leave_hold dual · wipe ATT-10/09/08/02/PLT/CORE · honesty flip · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT module UAT · invent PAY/printable/HOL/MEAL/lines[] DONE
```

---

*End SA-01 · Option A LOCKED · 2026-08-09*
