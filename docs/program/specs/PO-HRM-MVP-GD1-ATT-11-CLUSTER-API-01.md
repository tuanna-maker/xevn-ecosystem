# PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01 — API F.1 · F-ATT-WF-SIGN-01/02 + F-ATT-SHEET-02/03 RETAIN cite (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-29 seat **#31**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-ATT-WF-SIGN-01/02** · **F-ATT-SHEET-02/03** physical `GET/POST …/attendance-sheets/{id}/signatures` · `POST …/close` · `POST …/reopen` · paper `/att/*` + `/core` **alias only** · Nest `@Controller('core')` **DENY** · **DENY invent** second sign ledger · **DENY invent `att_leave_hold`** · **ADD residual wire ONLY if** closable (REJECT/CLOSE/REOPEN/DISP/WF) — **NOT** invent CSUM/INBOX durable/EMIT bus DONE · **NOT** invent PAY · **NOT** invent FULL R-SIGN-01 DONE from FIXED_GĐ1 alone · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** · **no schema invent** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED RETAIN** — F.1 physical Option A · LIVE signatures + close/reopen + `att_timesheet_sign_step` + FIXED_GĐ1 evaluator **HOLD RETAIN** · CSUM **OUT GĐ1** · INBOX **OUT GĐ1** · EMIT **response-only GĐ1** · closable BE wire for SIGN/CLOSE/REOPEN/REJECT **NOT proven required** (spine LIVE) → unlock **prefer FE + QA** U65 **J-HRM-ATT-11-01..06 DRAFT** · **Dev-BE HOLD** invent · optional thin BE **ONLY if** FE proves `statusLabelVi` / reopen-reason envelope gap · **DENY** Nest `/core` · invent PAY/printable · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · soft/ATT-08=ATT-09 DONE · ATT module UAT · CFG=ATT-02 DONE |
| **uc_ids** | `UC-BP-ATT-11` · `FR-UC-BP-ATT-11` |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · **R-ATT-11-WF/INBOX/REJECT/CLOSE/CSUM/EMIT/REOPEN/DISP** · FIXED_GĐ1 · CSUM OUT · INBOX OUT · EMIT response-only · printable **false** · QC ATT-10 **`ATT10QC1-MSLWGUYH`** (AGG+submit · Nest `/core` AGG 0 · **≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT · ≠ ATT UAT) · must_keep ATT-09 **`ATT09QC1-MSLUTL9D`** · ATT-08 **`ATT08QC1-MSLSL36C`** · ATT-02 **`ATT02QC1-MSLQZUK7`** CFG≠DONE · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** printable false · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · ≠ ATT UAT · PAY invent DONE **OUT** · DENY second sign ledger |
| **ref_data** | [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md) — HOLD RETAIN `attendance_sheets` + `att_timesheet_sign_step` · FIXED_GĐ1 · CSUM/INBOX OUT · display-ready cite |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md) · O1–O12 · AC-ATT-11-* · J-HRM-ATT-11-01..06 DRAFT |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md) Option A · BR-BP-TS-02 · R-SIGN-01 · paper alias |
| **ref_att10_api** | [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01.md) — stamp `ATT10QC1-MSLWGUYH` · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT |
| **ref_att09_api** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md) — stamp `ATT09QC1-MSLUTL9D` · held=`pending_days` · DENY `att_leave_hold` · ≠ soft/ATT-08=ATT-09 DONE |
| **ref_att08_api** | [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md) — stamp `ATT08QC1-MSLSL36C` · preview must_keep |
| **ref_att02_api** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md) — stamp `ATT02QC1-MSLQZUK7` · CFG≠DONE |
| **ref_plt_api** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md) — `PLT01QC1-MSLPUQIU` |
| **ref_core10_api** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md) — `CORE10QC1-MSLP0EJB` |
| **ref_core09_api** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md) — printable **false** · ≠ CORE-09 DONE |
| **ref_core07_api** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md) — GATE/ACT · Nest DENY |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-11** · Diễn biến **#1–#3 + Thành công** · **BR-BP-TS-02** · **R-SIGN-01** · partner **REQ_L_001** · UC kế = **PAY-01** (**OUT** invent DONE) |
| **ref_paper_api** | **F-ATT-WF-SIGN-01/02** · **F-ATT-SHEET-02/03** · peer **F-ATT-SHEET-01/AGG** (ATT-10 must_keep · ≠ AGG=DONE) · peer **F-ATT-SHEET-04** (PAY OUT invent DONE) · Nest `@Controller('core')` **ABSENT** · paper `/att/*` + `/core` **alias only** · SoT cite `API_DESIGN_HRM_ENTERPRISE.md` § F-ATT-WF-SIGN · F-ATT-SHEET-02/03 |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/attendance-sheets*` · paper `/att` + `/core` alias only · U19 · soft-delete · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** second sign ledger · ADR `ADR-HRM-ATT-SHEET-HTTP-PATH-20260805` |
| **ref_code_cite** | `attendance.controller` `@Controller('attendance')` · `GET/POST attendance-sheets/:sheetId/signatures` · `POST …/close` · `POST …/reopen` · `attendance-sheet-sign.service.ts` (`MANDATORY_PERSONAS` · `evaluateCanClose` · `listSignatures` · `createSignature` · `closeAttendanceSheet` · `reopenAttendanceSheet`) · FE `AttendanceSheetSignPanel` · scope-parity jest SP-ATT-SIGN-* · Nest `@Controller('core')` **ABSENT** · `att_leave_hold` **ABSENT** — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim LIVE sign/close alone = ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **DENY** claim soft/ATT-08=ATT-09 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word/HOL/MEAL/`lines[]` DONE · **DENY** CFG=ATT-02 DONE · **DENY** invent `att_leave_hold` · honesty flip |
| **ba-data** | **ALREADY CONFIRMED HOLD** — this seat **does not** re-open schema invent · CSUM/INBOX **OUT GĐ1** · EMIT response-only · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** second sign ledger |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN** |
| **unlock_lane** | **Prefer FE + QA** (RETAIN LIVE SIGN/CLOSE/REOPEN spine · no closable BE wire **required**) · **Dev-BE HOLD** invent · optional thin BE **ONLY if** FE proves `statusLabelVi` / reopen-reason envelope gap |

---

## 1. Verdict — **CONFIRMED RETAIN**

| Decision | Stamp |
|----------|--------|
| Sign/close SoT | **ONE RETAIN** LIVE **`public.attendance_sheets` + `public.att_timesheet_sign_step` + close/reopen** — **DENY** second sign ledger · **DENY** invent `att_leave_hold` |
| **F-ATT-WF-SIGN-02** | **RETAIN cite** physical **`GET /api/hrm/attendance/attendance-sheets/{id}/signatures`** → `steps[]` · `missing_mandatory_roles[]` · `can_close` · **≠** FR-11 / ATT-11 DONE from LIVE alone |
| **F-ATT-WF-SIGN-01** | **RETAIN cite** physical **`POST …/signatures`** · submitted only · `approved`\|`rejected` · dup **409** `HRM-ATT-SIGN-DUP` · FIXED_GĐ1 RETAIN · **R-ATT-11-WF NOT invent DONE** |
| **F-ATT-SHEET-02** | **RETAIN cite** physical **`POST …/close`** · `can_close` only · **409** `HRM-ATT-SIGN-INCOMPLETE` · `line_locked` · `event: timesheet.closed` response-only · CSUM **OUT GĐ1** · **≠ invent PAY** |
| **F-ATT-SHEET-03** | **RETAIN cite** physical **`POST …/reopen`** · archive steps/lines → `submitted` · **DENY** hard-delete |
| FIXED_GĐ1 evaluator | **RETAIN** `employee` · `direct_manager` · `hr_admin` · footer FIXED_GĐ1 · **≠** full R-SIGN-01 DONE |
| Display-ready DTO | Cite: `header_id` · `status` · `statusLabelVi` (FE-derive OK) · `steps[]` · `missing_mandatory_roles[]` · `can_close` · `policy_ready?` |
| Nest path | Physical `/api/hrm/attendance/attendance-sheets*` · Nest `@Controller('core')` **ABSENT** — **DENY invent** |
| Closable gap on LIVE SoT? | **NO** required BE for SIGN/CLOSE/REJECT/REOPEN — spine **PRESENT** · residual = U65 journey + FE DISP bind · optional thin GET enrich **only if** proven |
| Unlock | **Prefer Dev-FE + QA** · **Dev-BE HOLD** invent · optional thin BE **ONLY if** FE proves envelope DISP/reopen-reason gap |
| ATT-10/09/08/02/PLT/CORE-10/09/07 | **must_keep** stamps · ≠ AGG=ATT-10 DONE · soft/ATT-08≠ATT-09 DONE · CFG≠ATT-02 DONE · printable **false** · soft≠CORE-06 · Nest DENY · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT |
| PAY / printable / Word / HOL/MEAL / `lines[]` | **OUT invent DONE** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim LIVE=ATT-11 DONE · AGG=ATT-10 DONE · ATT UAT · soft/ATT-08=ATT-09 DONE · CFG=ATT-02 · PLT/CORE DONE |

```text
  FE «Ký chốt bảng công — WF XBOS» (U65 residual · J-HRM-ATT-11-*)
        │  Network MUST contain /api/hrm/attendance/attendance-sheets*
        │                  (…/signatures · …/close · …/reopen)
        │  DENY Nest /core/* sign/close SoT
        │  DENY invent second sign ledger · invent att_leave_hold
        │  DENY invent PAY/printable/Word/HOL/MEAL/lines[] · claim LIVE=ATT-11 DONE
        │  DENY claim AGG=ATT-10 DONE · soft/ATT-08=ATT-09 DONE · ATT UAT · CFG=ATT-02 DONE
        ▼
  F-ATT-WF-SIGN-02
        GET /api/hrm/attendance/attendance-sheets/{id}/signatures
        → { header_id, status, steps[], missing_mandatory_roles[], can_close }
        → Diễn biến #1 · ≠ FR-11 DONE alone
        │
  F-ATT-WF-SIGN-01
        POST …/attendance-sheets/{id}/signatures
        → submitted only · approved|rejected · dup 409 SIGN-DUP · FIXED_GĐ1
        → Diễn biến #2 · BR-BP-TS-02 · R-ATT-11-WF residual NOT invent DONE
        │
  F-ATT-SHEET-02
        POST …/attendance-sheets/{id}/close
        → can_close only · 409 SIGN-INCOMPLETE · line_locked · event timesheet.closed
        → CSUM OUT GĐ1 · ≠ invent PAY DONE
        │
  F-ATT-SHEET-03
        POST …/attendance-sheets/{id}/reopen
        → archive steps/lines → submitted · DENY hard-delete
        │
  Display-ready (RETAIN cite)
        header_id · status · statusLabelVi(FE-derive OK) · steps[] ·
        missing_mandatory_roles[] · can_close · policy_ready?
        ≠ invent ATT-10 lines[]/HOL/MEAL DONE
        │
  Residual (prefer FE+QA — no BE unlock required this seat)
        REJECT/CLOSE/REOPEN/DISP AC · FIXED_GĐ1 footer · Nest /core 0
        CSUM/INBOX OUT · EMIT response-only · R-ATT-11-WF residual document
        │
        └─► must_keep ATT10QC1-MSLWGUYH ≠ AGG=DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT ·
              ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE ·
              PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB ·
              CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT ·
              soft≠CORE-06 · Nest /core DENY · C-SLICE · honesty false · PAY OUT
```

**Invariant ATT-11-PATH (O9):** Sign/close/reopen Network **MUST** hit physical `/api/hrm/attendance/attendance-sheets*` — Nest dual `/core` SoT = **FAIL**.

**Invariant ATT-11-≠-LIVE-DONE (O1/O12):** Claim LIVE signatures/close alone = FR-UC-BP-ATT-11 / ATT-11 DONE = **FAIL**.

**Invariant ATT-11-PREREQ (O2):** Sign on non-`submitted` without 409 LOCKED/STATE = **FAIL**.

**Invariant ATT-11-LADDER (O3/O6):** `can_close=true` with missing FIXED_GĐ1 persona = **FAIL**.

**Invariant ATT-11-REJECT (O5):** Close 2xx with active `rejected` = **FAIL**.

**Invariant ATT-11-NO-BYPASS (O6):** Close without `can_close` / incomplete → not **409 INCOMPLETE** = **FAIL**.

**Invariant ATT-11-WF-FOOTER (O3):** Claim FIXED_GĐ1 alone = full R-SIGN-01 / FR-11 DONE = **FAIL**.

**Invariant ATT-11-CSUM-OUT (O7):** Claim missing checksum = ATT-11 FAIL when footer OUT = **FAIL**.

**Invariant ATT-11-EMIT (O8):** Invent PAY DONE from `event: timesheet.closed` = **FAIL**.

**Invariant ATT-11-≠-AGG-DONE (O2/O10):** Claim AGG alone = ATT-10 DONE from this seat = **FAIL**.

**Invariant ATT-11-≠-09-DONE (O10):** Claim soft/ATT-08 = ATT-09 DONE = **FAIL**.

**Invariant ATT-11-≠-UAT (O12):** Claim ATT module UAT / flip `attendance_uat_ready` = **FAIL**.

**Invariant ATT-11-≠-PRINTABLE / PAY-OUT (O11):** Invent PAY/printable/Word/HOL/MEAL/`lines[]` DONE = **FAIL**.

**Invariant ATT-11-CFG≠02 (O10):** Claim CFG = ATT-02 DONE / reopen ATT-02 = **FAIL**.

**Invariant ATT-11-≠-DUAL-HOLD / LEDGER:** Invent `att_leave_hold` / second sign ledger = **FAIL**.

**Invariant ATT-11-U19:** attendance-sheets list = get-by-id = sign/close/reopen — OOS → 409/404 · not empty-mask.

**Invariant ATT-11-DATA-HOLD:** LIVE spines **HOLD RETAIN** · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** second ledger.

**Invariant ATT-11-NO-SEED (O12):** Seed fake sheet/signs for UF = **FAIL** U65.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-11 DONE** · LIVE alone ≠ FR-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · HOL/MEAL/`lines[]` invent DONE OUT · R-ATT-10-DISP P2 HOLD · DENY invent `att_leave_hold` · DENY second sign ledger · must_keep ATT-10 `ATT10QC1-MSLWGUYH` · ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · no apps/**

---

## 2. AS-IS Nest baseline → residual gap

| Surface | LIVE (read-only cite 2026-08-09) | Gap vs F.1 this seat |
|---------|----------------------------------|----------------------|
| `GET …/attendance-sheets/:sheetId/signatures` | LIVE · `steps[]` · `missing_mandatory_roles[]` · `can_close` · code `HRM-ATT-SIGN-200` | **RETAIN** · DISP AC · **≠** FR-11 DONE alone |
| `POST …/signatures` | LIVE · submitted only · approved/rejected · comment on reject · dup **409** `HRM-ATT-SIGN-DUP` · `policy_ready` | **RETAIN** · REJECT AC · **≠** invent FULL R-SIGN-01 DONE |
| FIXED_GĐ1 evaluator | LIVE `MANDATORY_PERSONAS = employee · direct_manager · hr_admin` | **RETAIN interim** · **R-ATT-11-WF** residual document |
| `POST …/close` | LIVE · `can_close` gate · **409** `HRM-ATT-SIGN-INCOMPLETE` · `line_locked` · `event: timesheet.closed` | **RETAIN** · CLOSE/NO-BYPASS AC · CSUM **ABSENT** = **OUT GĐ1** |
| Checksum writer | **ABSENT** | **OUT GĐ1** · HOLD invent |
| Durable bus emit | **unproven** | response-only GĐ1 · **≠** invent PAY DONE |
| `POST …/reopen` | LIVE · archive sign steps + lines → `submitted` | **RETAIN** · reason/RBAC AC residual (thin) · **DENY** hard-delete |
| Inbox / task bridge | cols stub · **no** bridge | **OUT GĐ1** · HOLD invent |
| Display `statusLabelVi` | Not forced on GET signatures body | FE-derive prefer · thin BE **ONLY if** proven |
| Nest `@Controller('core')` | **ABSENT** · CoreModule = DB export only | **DENY invent** |
| Second sign ledger / `att_leave_hold` | **ABSENT** | **DENY invent** |
| ATT-10 AGG/submit peer | SEALED `ATT10QC1-MSLWGUYH` · DISP P2 HOLD | **must_keep** · ≠ AGG=DONE |
| Source cite | `attendance.controller` · `attendance-sheet-sign.service.ts` · FE SignPanel · SP-ATT-SIGN-* | Docs-only this seat |

**FORBIDDEN invent this seat (docs):** Nest `@Controller('core')` · invent second sign ledger · invent `att_leave_hold` · invent CSUM/INBOX/outbox DONE · invent PAY/printable/Word/HOL/MEAL/`lines[]` DONE · wipe LIVE spines / ATT-10/09/08/02/PLT/CORE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim FIXED_GĐ1 = full R-SIGN-01 DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT UAT · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · seed · honesty flip · apps/** · reopen sealed J-*.

---

## 3. Path & alias lock (O1/O9)

| Plane | Path |
|-------|------|
| **PHYSICAL GET signatures (F-ATT-WF-SIGN-02)** | **`GET /api/hrm/attendance/attendance-sheets/{id}/signatures`** |
| **PHYSICAL POST signature (F-ATT-WF-SIGN-01)** | **`POST /api/hrm/attendance/attendance-sheets/{id}/signatures`** |
| **PHYSICAL close (F-ATT-SHEET-02)** | **`POST /api/hrm/attendance/attendance-sheets/{id}/close`** |
| **PHYSICAL reopen (F-ATT-SHEET-03)** | **`POST /api/hrm/attendance/attendance-sheets/{id}/reopen`** |
| **PHYSICAL AGG/submit peer (ATT-10 must_keep)** | `POST …/aggregate` · `POST …/submit` — **cite only** · **≠ AGG=ATT-10 DONE** · **≠ invent = ATT-11 DONE** |
| **PHYSICAL GET peer (F-ATT-SHEET-04 · PAY OUT)** | `GET …/attendance-sheets/{id}` — **cite only** · **≠ invent PAY DONE** |
| **LOGICAL (paper)** | `POST/GET /api/hrm/att/…` · `/api/hrm/core/…` — **alias only** |
| Rule | Client/docs **may** keep paper names; runtime **physical only**. |
| QA Network assert | Path **contains** `/attendance/attendance-sheets` — **FAIL O9** if FE hits Nest `/core/*` as sign/close SoT |

| Paper / logical | Physical | DB (DATA-01) |
|-----------------|----------|--------------|
| F-ATT-WF-SIGN-02 `/att/…/signatures` | **`GET …/attendance-sheets/{id}/signatures`** | read `att_timesheet_sign_step` + header |
| F-ATT-WF-SIGN-01 | **`POST …/signatures`** | insert `att_timesheet_sign_step` |
| F-ATT-SHEET-02 | **`POST …/close`** | `closed_*` + `line_locked` · CSUM ABSENT OK |
| F-ATT-SHEET-03 | **`POST …/reopen`** | archive steps/lines → submitted |
| F-ATT-SHEET-01/AGG peer | aggregate + submit | **ATT-10 must_keep** · ≠ AGG=DONE |
| Nest `/core` | — | **DENY invent** |
| Paper held / `att_leave_hold` | LIVE **`pending_days`** (ATT-09) | **must_keep** · **DENY dual** |

**Prefer rule (normative):** Dev **MUST NOT** invent Nest `@Controller('core')`, second sign ledger, or `att_leave_hold`. Physical remain under **`@Controller('attendance')`**.

---

## 4. F-ATT-WF-SIGN-02 — F.1 RETAIN cite (GET signatures)

### 4.1 Header

| | |
|--|--|
| **Function ID** | **F-ATT-WF-SIGN-02** |
| **METHOD / path (physical)** | **`GET /api/hrm/attendance/attendance-sheets/{id}/signatures`** |
| **Paper alias** | `GET /api/hrm/att/…/signatures` · `/api/hrm/core/…` — **alias only** |
| **change_mode** | **RETAIN cite** LIVE · residual = DISP AC (no new path) |
| **Table** | read `public.att_timesheet_sign_step` (active) · `public.attendance_sheets` |

### 4.2 Mục đích

Cấp API vật lý để **đọc trạng thái từng bước ký** trên bảng công chờ chốt (`submitted`) — trả `steps[]`, `missing_mandatory_roles[]`, `can_close` theo **BR-BP-TS-02** / SRS **FR-UC-BP-ATT-11 Diễn biến #1** — hỗ trợ SignPanel trước khi gọi close; **không** thay Nest `/core` SoT; **không** invent second sign ledger; **không** claim LIVE alone = FR-11 / ATT-11 DONE; **không** invent PAY/printable DONE; **không** invent ATT-10 `lines[]`/HOL/MEAL DONE; **không** claim ATT module UAT.

### 4.3 Nghiệp vụ xử lý

1. **AuthZ + U19 scope** — resolve company/slug như LIVE attendance-sheets family (list = get = sign); OOS → `HRM-SCOPE-409` / 404.
2. **Load header** — `{id}` ∈ scope; missing → `HRM-AS-404`.
3. **List active steps** — `att_timesheet_sign_step` WHERE `header_id` AND `archived_at IS NULL` ORDER BY `step_order`, `signed_at`.
4. **Evaluator FIXED_GĐ1** — `can_close` / `missing_mandatory_roles` từ `MANDATORY_PERSONAS` (employee · direct_manager · hr_admin); any `rejected` → `can_close=false`.
5. **Response display-ready** — map steps fields; `statusLabelVi` = FE-derive OK (thin BE optional if proven).
6. **DENY** — Nest `/core` SoT · claim GET alone = FR-11 DONE · invent PAY.

### 4.4 Tham chiếu bước SRS

| SRS | Map |
|-----|-----|
| **FR-UC-BP-ATT-11** Diễn biến **#1** | Xem bảng chờ chốt · GET signatures |
| **BR-BP-TS-02** | Evaluator → `can_close` |
| **AC-ATT-11-GET-SIGN / LOAD / DISP / PATH** | Display-ready · Nest `/core` 0 |

### 4.5 Request / Response → DB

| Direction | Contract |
|-----------|----------|
| **Path** | `{id}` = sheet header id |
| **Response** | `{ header_id, status, steps: [{ step_code, persona_role, outcome, signed_at, signer_user_id, comment? }], missing_mandatory_roles[], can_close }` (+ optional `statusLabelVi` / `policy_ready?`) |
| **DB** | read `attendance_sheets` · `att_timesheet_sign_step` |
| **Lỗi** | `404` · `HRM-SCOPE-409` |

---

## 5. F-ATT-WF-SIGN-01 — F.1 RETAIN cite (POST signature)

### 5.1 Header

| | |
|--|--|
| **Function ID** | **F-ATT-WF-SIGN-01** |
| **METHOD / path (physical)** | **`POST /api/hrm/attendance/attendance-sheets/{id}/signatures`** |
| **Paper alias** | paper `/att` + `/core` — **alias only** |
| **change_mode** | **RETAIN cite** LIVE · residual = REJECT/WF AC (no new path · **NOT** invent FULL R-SIGN-01 DONE) |
| **Table** | insert `public.att_timesheet_sign_step` · read header |

### 5.2 Mục đích

Ghi nhận **một bước xác nhận / từ chối** (NV · QL · HCNS) trên bảng `submitted` — **không** tự `closed`; **không** thay engine WF XBOS (ATT = consumer); FIXED_GĐ1 interim RETAIN; **R-ATT-11-WF** residual **NOT** invent DONE; **không** claim POST alone = ATT-11 DONE.

### 5.3 Nghiệp vụ xử lý

1. **U19 scope** — same resolver as list/get/close.
2. **Status gate** — `closed` → **409** `HRM-ATT-SHEET-LOCKED`; not `submitted` → **409** `HRM-ATT-SHEET-STATE`.
3. **Validate body** — `step_code` · `persona_role` · `outcome` (`approved`\|`rejected`); reject **requires** `comment` → else **422** `HRM-ATT-SIGN-422`.
4. **Insert** active `att_timesheet_sign_step` (+ optional `wf_task_instance_id` / `workflow_definition_id` stub OK).
5. **Dup active `step_code`** → **409** `HRM-ATT-SIGN-DUP` (UQ).
6. **Rejected** → **không** gọi close; PAY blocked cite (BR-BP-TS-02).
7. **Approved** → **không** auto-close; return `policy_ready` = evaluator PASS hint.
8. **FIXED_GĐ1** — personas RETAIN · **DENY** claim = full R-SIGN-01 DONE · residual **R-ATT-11-WF** document only.

### 5.4 Tham chiếu bước SRS

| SRS | Map |
|-----|-----|
| **FR-UC-BP-ATT-11** Diễn biến **#2** | Ký từng bên |
| **BR-BP-TS-02** · **R-SIGN-01** (GĐ1 interim) | Ladder · reject |
| **AC-ATT-11-SIGN / LADDER / REJECT / WF-FOOTER / PREREQ** | Dup · reject · FIXED_GĐ1 |

### 5.5 Request / Response → DB

| Direction | Contract |
|-----------|----------|
| **Body** | `step_code`, `persona_role`, `outcome` (`approved`\|`rejected`), `comment?`, `wf_task_instance_id?`, `workflow_definition_id?` |
| **Response** | `{ header_id, step_code, outcome, signed_at, signer_user_id, policy_ready }` |
| **DB** | insert `att_timesheet_sign_step` |
| **Lỗi** | `409 LOCKED/STATE/DUP` · `422` reject no comment · `403` persona · `HRM-SCOPE-409` · `404` |

---

## 6. F-ATT-SHEET-02 — F.1 RETAIN cite (POST close)

### 6.1 Header

| | |
|--|--|
| **Function ID** | **F-ATT-SHEET-02** |
| **METHOD / path (physical)** | **`POST /api/hrm/attendance/attendance-sheets/{id}/close`** |
| **Paper alias** | paper `/att` + `/core` — **alias only** |
| **change_mode** | **RETAIN cite** LIVE · residual = CLOSE/NO-BYPASS AC · CSUM **OUT GĐ1** · EMIT response-only |
| **Table** | update `attendance_sheets` `closed_*` · lock `att_timesheet_line` |

### 6.2 Mục đích

**Chốt bất biến** bảng công khi evaluator PASS — lock lines · trả `event: timesheet.closed` (response-only GĐ1) — mở **boundary** PAY đọc (QUEUED · **OUT invent PAY DONE**); **không** checksum DONE; **không** one-button bypass; **không** claim close alone = ATT-11 / PAY DONE.

### 6.3 Nghiệp vụ xử lý

1. **U19 scope** — list = get = close.
2. **Preconditions (BR-BP-TS-02):**
   - P1: header `status=submitted` (else STATE/LOCKED).
   - P2: no active `rejected`.
   - P3: FIXED_GĐ1 all three personas `approved` — else **409** `HRM-ATT-SIGN-INCOMPLETE`.
   - P4: **Cấm** set `closed` when P2–P3 fail (no bypass Chốt).
3. **After PASS:** set `status=closed` · `closed_at` · `closed_by` · lock lines (`line_locked`).
4. **Checksum:** writer **ABSENT** = **OUT GĐ1** accepted · **DENY** invent silent CSUM as DONE.
5. **Emit:** response field `event: 'timesheet.closed'` **RETAIN** · durable bus **unproven** = residual document · **≠ invent PAY DONE**.
6. **DENY** invent PAY endpoints / claim payroll UAT.

### 6.4 Tham chiếu bước SRS

| SRS | Map |
|-----|-----|
| **FR-UC-BP-ATT-11** Diễn biến **#2** Thành công | Đủ bên → đã chốt |
| **BR-BP-TS-02** | Block incomplete / reject |
| **AC-ATT-11-CLOSE / NO-BYPASS / F5 / EMIT / CSUM-OUT / PAY-OUT** | 409 · closed · event · PAY OUT |

### 6.5 Request / Response → DB

| Direction | Contract |
|-----------|----------|
| **Body** | empty / optional (no invent PAY fields) |
| **Response** | `{ sheet_id, status: 'closed', event: 'timesheet.closed', line_locked_count? }` |
| **DB** | update `attendance_sheets` · lock `att_timesheet_line` · **no** checksum col required GĐ1 |
| **Lỗi** | `409 HRM-ATT-SIGN-INCOMPLETE` · `409 LOCKED` · `409 STATE` · `HRM-SCOPE-409` · `404` |

---

## 7. F-ATT-SHEET-03 — F.1 RETAIN cite (POST reopen)

### 7.1 Header

| | |
|--|--|
| **Function ID** | **F-ATT-SHEET-03** |
| **METHOD / path (physical)** | **`POST /api/hrm/attendance/attendance-sheets/{id}/reopen`** |
| **Paper alias** | paper `/att` + `/core` — **alias only** |
| **change_mode** | **RETAIN cite** LIVE · residual = reason/RBAC AC · **DENY** hard-delete |
| **Table** | archive `att_timesheet_sign_step` · archive lines · header → `submitted` |

### 7.2 Mục đích

**Hủy chốt có audit** — archive vòng ký cũ · trả `submitted` — **không** xóa cứng lịch sử; **không** invent PAY adjustment DONE; Diễn biến **#3**.

### 7.3 Nghiệp vụ xử lý

1. **U19 scope** — same family.
2. **Only `closed`** → else **409** `HRM-ATT-SHEET-STATE`.
3. **Archive** active sign steps (`archived_at`) · archive timesheet lines · clear `closed_*` · `status=submitted`.
4. **Reason/RBAC** — AC residual (body reason when required by FE/QA assert) · **DENY** silent wipe.
5. **DENY** hard-delete sign history · invent PAY adjustment UC DONE.

### 7.4 Tham chiếu bước SRS

| SRS | Map |
|-----|-----|
| **FR-UC-BP-ATT-11** Diễn biến **#3** | Hủy chốt |
| **AC-ATT-11-REOPEN / F5** | submitted · archive · F5 |

### 7.5 Request / Response → DB

| Direction | Contract |
|-----------|----------|
| **Body** | `reason?` (AC residual — assert when UI requires) |
| **Response** | `{ sheet_id, status: 'submitted', lines_archived? }` |
| **DB** | soft archive only · **DENY** DELETE history |
| **Lỗi** | `409 STATE` · `403` · `HRM-SCOPE-409` · `404` |

---

## 8. Display-ready DTO (cite · residual wire only if closable)

| DTO field | Source / derive | Rule |
|-----------|-----------------|------|
| `header_id` | sheet id | required |
| `status` | header | submitted\|closed (sign path) |
| `statusLabelVi` | **FE-derive OK** | thin BE **ONLY if** FE proves closable gap |
| `steps[].step_code` | sign_step | required |
| `steps[].persona_role` | sign_step | employee\|direct_manager\|hr_admin |
| `steps[].outcome` | sign_step | approved\|rejected |
| `steps[].signed_at` | sign_step | timestamptz |
| `steps[].signer_user_id` | sign_step | required |
| `steps[].comment?` | sign_step | required when rejected |
| `missing_mandatory_roles[]` | evaluator | FIXED_GĐ1 set |
| `can_close` | evaluator | true only 3× approved · no reject |
| `policy_ready?` | POST sign / optional GET | hint for Chốt · **≠ invent PAY** |

**DENY:** invent ATT-10 `lines[]` / HOL/MEAL DONE as ATT-11 DISP · claim R-ATT-10-DISP closed.

**Residual wire disposition:** REJECT/CLOSE/REOPEN = **AC journey** (no new Nest path). DISP = FE bind prefer · thin BE **optional if proven**. WF = FIXED_GĐ1 footer · **NOT** invent FULL R-SIGN-01 DONE. CSUM/INBOX = **OUT GĐ1**. EMIT = response-only.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-11 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · DENY second sign ledger · C-SLICE · ≠ AGG=ATT-10 DONE

---

## 9. Residual unlock map

| Residual | Closable BE wire this seat? | Unlock |
|----------|----------------------------|--------|
| **R-ATT-11-WF** | NO — FIXED_GĐ1 LIVE interim | FE+QA footer · **NOT** invent FULL R-SIGN-01 DONE |
| **R-ATT-11-INBOX** | NO — **OUT GĐ1** | HOLD invent |
| **R-ATT-11-REJECT** | NO (outcome + 409 LIVE) | FE+QA AC assert |
| **R-ATT-11-CLOSE** | NO (can_close + lock LIVE) | FE+QA AC · F5 |
| **R-ATT-11-CSUM** | NO — **OUT GĐ1** | HOLD invent · ABSENT OK |
| **R-ATT-11-EMIT** | NO — response-only LIVE | FE+QA assert event · **≠ invent PAY** |
| **R-ATT-11-REOPEN** | Thin reason/RBAC **optional** | Prefer FE+QA · BE **ONLY if** FE proves |
| **R-ATT-11-DISP** | Thin `statusLabelVi` **optional** | Prefer FE-derive · BE **ONLY if** FE proves |
| **R-ATT-10-DISP** | peer **P2 HOLD** | **≠ invent lines[]** DONE |
| **R-ATT-11-≠-DONE / PAY-OUT / H** | N/A | Footer · DENY invent |

**Verdict unlock_lane:** **FE + QA** (prefer) · **Dev-BE HOLD** invent Nest dual / CSUM/INBOX/outbox / second ledger / `att_leave_hold` / PAY / FULL R-SIGN-01 DONE / claim LIVE=ATT-11 DONE.

---

## 10. U19 scope parity

| Surface | Resolver | Rule |
|---------|----------|------|
| attendance-sheets list/get/signatures/close/reopen | hrm list-scope TEXT slug family | list **=** get-by-id **=** sign/close/reopen |
| Sign steps under sheet | same company scope as header | no cross-CT sign write |
| ATT-10 AGG/submit peer | same attendance family | **must_keep** · ≠ AGG=DONE |
| ATT-09 leave peers (cite) | same attendance family | **must_keep** · held=`pending_days` |
| ATT-02 late_penalty peer | same family | **CFG≠ATT-02 DONE** |

---

## 11. Traceability (requirement → API → FE → test)

| BR/AC | API | FE / J-* | Expect |
|-------|-----|----------|--------|
| BR-BP-TS-02 · AC-ATT-11-SIGN/LADDER/GET-SIGN | F-ATT-WF-SIGN-01/02 | **J-HRM-ATT-11-01..02** DRAFT | steps · can_close · Nest `/core` 0 · ≠ LIVE=DONE |
| AC-ATT-11-REJECT/FAIL-REJECT/NO-BYPASS | POST close 409 INCOMPLETE | **J-03/04** | reject/incomplete block |
| AC-ATT-11-CLOSE/F5/EMIT/CSUM-OUT | F-ATT-SHEET-02 | **J-02/06** | closed · F5 · event response-only · CSUM OUT · ≠ PAY DONE |
| AC-ATT-11-REOPEN | F-ATT-SHEET-03 | **J-05** | submitted · archive · F5 · DENY hard-delete |
| AC-ATT-11-DISP | GET signatures body | SignPanel · **J-01** | FE bind · ≠ invent lines[] DONE |
| AC-ATT-11-PATH | Nest `/attendance` | all J-* | Nest `/core` **0** |
| AC-ATT-11-MK-* / H / PAY-OUT / ≠-* | seals | **J-06** footer | ATT-10/09/08/02/PLT/CORE ≠ DONE · printable false · CFG≠DONE · ≠ AGG=DONE · C-SLICE · soft≠09 DONE |

---

## 12. must_keep / DENY checklist

| Lock | Rule |
|------|------|
| **ATT10QC1-MSLWGUYH** | RETAIN · AGG+submit · Nest `/core` AGG 0 · **≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT · ≠ ATT UAT |
| ATT09QC1-MSLUTL9D | RETAIN hold/settle · `pending_days` · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT |
| ATT08QC1-MSLSL36C | RETAIN preview · T6→T2=2 · HOL-MISS · ALIGN · client-days≠DONE · ≠ ATT UAT · **≠** claim = ATT-09 DONE |
| ATT02QC1-MSLQZUK7 | RETAIN · **CFG≠ATT-02 DONE** · ≠ ATT UAT |
| PLT01QC1-MSLPUQIU | RETAIN · peer≠PLT DONE · merge≠platform UAT |
| CORE10QC1-MSLP0EJB | RETAIN · ≠ CORE-10 DONE |
| CORE09QC1-MSLNBA89 | printable **false** · ≠ CORE-09 DONE |
| CORE07QC1-KZJTSHNT | GATE/ACT · Nest DENY · soft≠CORE-06 DONE |
| LIVE signatures + close/reopen | **RETAIN** · **≠** ATT-11 DONE from LIVE alone |
| Nest `/core` | **DENY** dual · paper alias only |
| Second sign ledger / `att_leave_hold` | **DENY** invent |
| CSUM / INBOX DONE | **OUT GĐ1** · HOLD invent |
| PAY / printable / Word / HOL/MEAL / `lines[]` | **OUT invent DONE** · printable false · DISP HOLD |
| FIXED_GĐ1 alone | **≠** full R-SIGN-01 / FR-11 DONE |
| Honesty | **DENY** flip · C-SLICE · `attendance_uat_ready=false` |
| apps/** / seed | **CẤM** this seat / U65 |

---

## 13. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §14 |
| **next_owner** | `pm` → **dev-fe** + **qa** (prefer) · Dev-BE HOLD unless closable thin DISP/reopen-reason wire proven |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01.md` |
| **unlock_lane** | **FE+QA** (RETAIN LIVE) |
| **next_dispatch_prompt** | See §15 |

---

## 14. completion_report

**Closed:** SA API F.1 **CONFIRMED RETAIN** for UC-BP-ATT-11 / FR-UC-BP-ATT-11 — cite **F-ATT-WF-SIGN-02** physical `GET /api/hrm/attendance/attendance-sheets/{id}/signatures` (`steps[]` · `missing_mandatory_roles[]` · `can_close`); **F-ATT-WF-SIGN-01** `POST …/signatures` (submitted only · approved|rejected · dup **409** `HRM-ATT-SIGN-DUP` · FIXED_GĐ1 · **R-ATT-11-WF NOT invent DONE**); **F-ATT-SHEET-02** `POST …/close` (`can_close` only · **409** `HRM-ATT-SIGN-INCOMPLETE` · `line_locked` · `event: timesheet.closed` response-only · CSUM **OUT GĐ1** · **≠ invent PAY**); **F-ATT-SHEET-03** `POST …/reopen` (archive → submitted · **DENY** hard-delete); display-ready `header_id`·`status`·`statusLabelVi`(FE-derive OK)·`steps[]`·`missing_mandatory_roles[]`·`can_close`·`policy_ready?`; paper `/att`+`/core` **alias only** · Nest `@Controller('core')` **DENY** · **DENY** second sign ledger · **DENY** invent `att_leave_hold`; must_keep ATT10QC1-MSLWGUYH (**≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT) · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · ≠ ATT UAT · PAY OUT; closable BE wire for SIGN/CLOSE/REJECT/REOPEN **NOT required** (LIVE PRESENT) → unlock **prefer FE+QA**; optional thin BE `statusLabelVi`/reopen-reason **ONLY if** FE proves gap; DENY invent PAY/printable · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT UAT · honesty flip · seed · apps/**.

**Residual open (execution):** R-ATT-11-REJECT/CLOSE/REOPEN/DISP + FIXED_GĐ1 footer via U65 **J-HRM-ATT-11-01..06 DRAFT** — FE bind + QA browser · BE optional thin **ONLY if** FE proves envelope gap. CSUM/INBOX remain **OUT GĐ1** · EMIT response-only · **R-ATT-11-WF** document residual (**NOT** invent FULL R-SIGN-01 DONE). Explicit **≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT · honesty false**.

---

## 15. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-01 (+ QA-01 parallel)
role: dev-fe (+ qa)
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-29 seat #31)
entry_criteria: API-01 CONFIRMED RETAIN @ docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01.md · DATA-01 HOLD · BA O1–O12 · SA Option A · unlock_lane FE+QA · Dev-BE HOLD invent · must_keep ATT10QC1-MSLWGUYH AGG/submit RETAIN (≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · Nest /core AGG 0) · ATT09QC1-MSLUTL9D hold/settle pending_days DENY att_leave_hold · ATT08QC1-MSLSL36C preview RETAIN · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · soft/ATT-08≠ATT-09 DONE · ≠ ATT UAT · PAY OUT · DENY second sign ledger
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01.md (F.1 F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02/03 · display-ready · unlock FE+QA)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md (AC-ATT-11-* · J-HRM-ATT-11-01..06 DRAFT)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md (attendance_sheets + att_timesheet_sign_step HOLD · FIXED_GĐ1 · CSUM/INBOX OUT)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-qc-01.md (must_keep ATT10QC1-MSLWGUYH)
exit_criteria:
  - FE: bind SignPanel trên sheet submitted (cite ATT-10 submit peer · ≠ AGG=ATT-10 DONE) → Network GET/POST /api/hrm/attendance/attendance-sheets/{id}/signatures · POST …/close · POST …/reopen; display-ready header_id·status·statusLabelVi(FE-derive OK)·steps[]·missing_mandatory_roles[]·can_close·policy_ready?; FIXED_GĐ1 3 personas; Nest /core 0
  - QA U65: J-HRM-ATT-11-01..06 DRAFT browser — submitted→ký NV+QL+HR→close→F5 closed; reject→409 INCOMPLETE; incomplete no-bypass; reopen+archive; Nest /core 0; zero-seed; FAIL if Nest /core SoT · invent att_leave_hold · second ledger · LIVE alone claimed DONE · AGG=ATT-10 DONE · invent PAY/printable/HOL/MEAL/lines[] DONE · soft/ATT-08=ATT-09 DONE · claim ATT UAT · CFG=ATT-02 DONE · invent CSUM/INBOX DONE · claim FIXED_GĐ1=full R-SIGN-01 DONE
  - Explicit ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT
  - Dev-BE: HOLD unless FE proves closable thin statusLabelVi / reopen-reason envelope gap (then separate BE-01) — DENY invent Nest /core · CSUM/INBOX/outbox DONE · second ledger · att_leave_hold · PAY · FULL R-SIGN-01 DONE · claim LIVE=ATT-11 DONE
  - evidence: docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-fe-01.md (+ qa-01)
  - ack_status READY_FOR_QA / PASS_TO_PM
cấm: apps/** invent Nest /core · invent att_leave_hold dual · invent second sign ledger · invent CSUM/INBOX DONE · invent PAY/printable/Word/HOL/MEAL/lines[] DONE · wipe ATT-10/09/08/02/PLT/CORE · seed · honesty flip · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · claim FIXED_GĐ1=full R-SIGN-01 DONE
```

---

*End API-01 · CONFIRMED RETAIN · unlock FE+QA · 2026-08-09*
