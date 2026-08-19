# BA AC pack — Wave-29 ATT cluster · UC-BP-ATT-11 (Ký chốt bảng công · WF XBOS · RETAIN LIVE WF-SIGN + close/reopen)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-29 seat **#31**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (ADD residual only if closable gap for CSUM / WF sync cols) · sa API residual unlock after DATA · **DENY** claim LIVE sign/close alone = ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **DENY** claim soft/ATT-08=ATT-09 DONE · **DENY** claim ATT module UAT · **DENY** CFG=ATT-02 DONE · **printable false RETAIN** · **PAY OUT invent DONE** · **DENY invent `att_leave_hold` dual** · **DENY invent HOL/MEAL/`lines[]` DONE** · **R-ATT-10-DISP P2 HOLD RETAIN** |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** invent `att_leave_hold` · **no** wipe ATT-10 AGG/submit · **no** wipe ATT-09 hold · **no** wipe ATT-08 preview · **no** wipe ATT-02/PLT/CORE · **no** soft=CORE-06 DONE · **no** invent PAY/printable/Word/HOL/MEAL/`lines[]` DONE · **no** claim LIVE sign/close alone = FR-11 DONE) |
| **uc_ids** | `UC-BP-ATT-11` · `FR-UC-BP-ATT-11` |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01` **Option A LOCKED** · QC ATT-10 **`ATT10QC1-MSLWGUYH`** (AGG+submit · Nest `/core` AGG 0 · **≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT · ≠ ATT UAT) · QA **`ATT10QA1-MSLWCDX2`** · must_keep ATT-09 **`ATT09QC1-MSLUTL9D`** (hold/settle · `pending_days` · DENY `att_leave_hold`) · ATT-08 **`ATT08QC1-MSLSL36C`** · ATT-02 **`ATT02QC1-MSLQZUK7`** · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** (printable **false**) · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · **≠ ATT UAT** · PAY invent DONE **OUT** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-11** · Diễn biến **#1–#3 + Thành công** · **BR-BP-TS-02** · **R-SIGN-01** · partner **REQ_L_001** · UC kế = **PAY-01** (**OUT** invent DONE) |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` **§6.4** · **F-ATT-WF-SIGN-01/02** · **F-ATT-SHEET-02/03/04** · ATT = consumer WF XBOS · R-SIGN-01 CLOSED paper |
| **ref_api_paper** | **F-ATT-WF-SIGN-01/02** · **F-ATT-SHEET-02/03** · peer **F-ATT-SHEET-01/AGG** (ATT-10 must_keep) · peer **F-ATT-SHEET-04** (PAY OUT invent DONE) · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE `public.attendance_sheets` (`status` · `closed_at` · `closed_by`) · **`public.att_timesheet_sign_step`** (`step_code` · `persona_role` · `outcome` · optional `workflow_definition_id` · `wf_task_instance_id`) · peer `att_timesheet_line` lock on close · Nest `@Controller('core')` **ABSENT** |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/attendance-sheets*` · paper `/att/*` + `/core` **alias only** · U19 scope parity · soft-delete · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` |
| **Honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim LIVE sign/close alone = ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **DENY** claim soft/ATT-08=ATT-09 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word/HOL/MEAL/`lines[]` DONE · **DENY** CFG=ATT-02 DONE · **DENY** claim PLT/CORE DONE |
| **Cấm** | Nest `/core` dual · invent `att_leave_hold` dual · wipe ATT-10 AGG/submit · wipe ATT-09 hold · wipe ATT-08 preview · wipe ATT-02/PLT/CORE · soft=CORE-06 DONE · invent PAY/printable/Word/HOL/MEAL/`lines[]` DONE · claim LIVE sign/close alone = FR-11 DONE · claim AGG alone = ATT-10 DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT module UAT · honesty flip · seed · apps/** · reopen sealed J-HRM-ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-29 seat #31 — **gap-only RETAIN** LIVE WF-SIGN + close/reopen:

1. **Sign SoT** = LIVE `GET/POST …/attendance-sheets/:id/signatures` → `att_timesheet_sign_step` — **≠** ATT-11 DONE from LIVE alone.
2. **Ladder GĐ1** = fixed 3-persona interim (`employee` · `direct_manager` · `hr_admin`) **CONFIRMED** · residual **R-ATT-11-WF** for XBOS tenant sync fidelity (**≠** invent HRM WF engine · **≠** claim R-SIGN-01 full DONE).
3. **Reject blocks** = one `rejected` → `can_close=false` → close **409** `HRM-ATT-SIGN-INCOMPLETE` · PAY blocked (BR-BP-TS-02).
4. **Close gate** = `POST …/close` **only** when `can_close` · no bypass Chốt · lock lines · `status=closed` · response `event: timesheet.closed` (emit depth = residual).
5. **Reopen** = `POST …/reopen` + reason + archive sign steps/lines → `submitted` + audit AC.
6. **Display-ready** = `steps[]` · `missing_mandatory_roles[]` · `can_close` · `statusLabelVi`.
7. **Prerequisite ATT-10** = only `submitted` sheets signable · cite `ATT10QC1-MSLWGUYH` · **≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD**.
8. **Mint** `J-HRM-ATT-11-01..06` DRAFT — submitted → ký 3 vai → close → F5 closed · reject path · Nest `/core` 0 · U65 zero-seed · **narrow ≠** ATT/PAY module UAT.
9. **must_keep** ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Nhân viên (NV) | Xác nhận / ký bước `persona_role=employee` trên bảng `submitted` |
| Quản lý trực tiếp (QL) | Ký bước `direct_manager` |
| HCNS (HR) | Ký bước `hr_admin` · Chốt khi `can_close` · Hủy chốt có lý do |
| Hệ thống (Nest) | Evaluator BR-BP-TS-02 · dup 409 · reject→block · close lock lines · reopen archive |
| Group CEO | Scope rollup `main` — U19 list = get = sign/close |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng scope resolver |
| ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT / CORE / PAY | Peers **must_keep / OUT invent DONE** — **≠** claim DONE from this seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-ATT-11 Diễn biến #1–#3 + Thành công + BR-BP-TS-02 + R-SIGN-01 → AC-ATT-11-* · residuals WF/INBOX/REJECT/CLOSE/CSUM/EMIT/REOPEN/DISP · J-HRM-ATT-11-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer `/attendance/attendance-sheets*/signatures|close|reopen` · paper `/att` + `/core` alias | Nest `/core/…` sign/close SoT dual · invent second sign ledger · invent `att_leave_hold` |
| Explicit ≠ ATT-11 DONE from LIVE alone · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · printable false · C-SLICE · PAY OUT | Claim Option/LIVE alone = FR-11 DONE · invent PAY/printable/Word/HOL/MEAL/`lines[]` DONE |
| Honesty footer · ATT-10/09/08/02/PLT/CORE RETAIN · soft≠CORE-06 DONE | Flip ready flags · reopen sealed J-* |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Sign/close SoT | **YES** — LIVE `GET/POST …/signatures` + `POST …/close` + `POST …/reopen` + `att_timesheet_sign_step` · paper F-ATT-WF-SIGN / SHEET-02/03 alias · **≠** ATT-11 DONE from LIVE alone · mint **J-HRM-ATT-11-*** — **AC-ATT-11-SIGN** · **AC-ATT-11-≠-LIVE-DONE** |
| **O2** | Prerequisite ATT-10 | **YES** — only `status=submitted` signable · cite `ATT10QC1-MSLWGUYH` AGG+submit · **≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT — **AC-ATT-11-PREREQ** · **AC-ATT-11-MK-ATT10** |
| **O3** | Ladder R-SIGN-01 | **YES FIXED_GĐ1 interim** — `MANDATORY_PERSONAS = employee · direct_manager · hr_admin` **RETAIN** · footer **FIXED_GĐ1** · residual **R-ATT-11-WF** (XBOS tenant order/parallel sync closable later) · **≠** invent HRM WF engine · **≠** claim full R-SIGN-01 DONE — **AC-ATT-11-LADDER** · **AC-ATT-11-WF-FOOTER** |
| **O4** | Inbox/task | **YES OUT GĐ1** — cols `wf_task_instance_id` stub OK · **no** ATT-sign inbox bridge required GĐ1 · residual **R-ATT-11-INBOX OUT** unless closable ADD — **AC-ATT-11-INBOX-OUT** |
| **O5** | Reject | **YES** — one `outcome=rejected` → `can_close=false` → close **409** `HRM-ATT-SIGN-INCOMPLETE` · PAY blocked · reject requires comment — **AC-ATT-11-REJECT** · **AC-ATT-11-FAIL-REJECT** |
| **O6** | Close gate | **YES** — no bypass Chốt without `can_close` · BR-BP-TS-02 · Network incomplete → **409 INCOMPLETE** · after close: `status=closed` + line_locked — **AC-ATT-11-CLOSE** · **AC-ATT-11-NO-BYPASS** |
| **O7** | Checksum | **YES OUT GĐ1** — writer checksum **ABSENT** accepted · footer **OUT GĐ1** · residual **R-ATT-11-CSUM** ADD only if ba-data proves closable — **AC-ATT-11-CSUM-OUT** |
| **O8** | Emit `timesheet.closed` | **YES response-only GĐ1** — response field `event: 'timesheet.closed'` **RETAIN** · durable bus emit **unproven** = residual **R-ATT-11-EMIT** document · **≠** invent PAY DONE — **AC-ATT-11-EMIT** · **AC-ATT-11-PAY-OUT** |
| **O9** | Paper `/core` + `/att` | **YES** — **alias only** — Nest `@Controller('core')` SoT = **FAIL** — **AC-ATT-11-PATH** |
| **O10** | ATT-10/09/08/02/PLT/CORE | **YES** — must_keep stamps **intact** · **≠ AGG=ATT-10 DONE** · **≠** soft/ATT-08=ATT-09 DONE · **CFG≠ATT-02 DONE** · **R-ATT-10-DISP HOLD** · **DENY** `att_leave_hold` · **DENY** invent `lines[]`/HOL/MEAL DONE · **≠** reopen — **AC-ATT-11-MK-*** |
| **O11** | PAY / printable / HOL/MEAL | **YES OUT invent** — closed sheet cite **trace-only** for PAY-01 · QUEUED PAY · printable false · HOL/MEAL/`lines[]` invent DONE **OUT** — **AC-ATT-11-PAY-OUT** · **AC-ATT-11-≠-PRINTABLE** |
| **O12** | Honesty / journeys | **YES false** — all ready flags false · **`attendance_uat_ready=false`** · C-SLICE · Mint **`J-HRM-ATT-11-01..06` DRAFT** (submitted → 3 signs → close → F5 · reject · Nest `/core` 0) — **narrow** · **≠** ATT module UAT · U65 zero-seed — **AC-ATT-11-H** |

**Architecture SoT:** RETAIN LIVE `/attendance/attendance-sheets*/signatures|close|reopen` + `att_timesheet_sign_step` + BR-BP-TS-02 3-persona evaluator + FE SignPanel · unlock WF/INBOX/REJECT/CLOSE/CSUM/EMIT/REOPEN/DISP · paper F-ATT-WF-SIGN + F-ATT-SHEET-02/03 + `/core` alias only · U19 list↔get↔sign/close · ATT-10/09/08/02/PLT/CORE **must_keep**.

### Primary API surface (BA lock — O1/O9)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| GET signatures (this seat) | **`GET /api/hrm/attendance/attendance-sheets/{id}/signatures`** | `/att/…` · `/core/…` **alias only** |
| POST signature step | **`POST …/attendance-sheets/{id}/signatures`** | paper alias |
| Close | **`POST …/attendance-sheets/{id}/close`** | paper alias |
| Reopen | **`POST …/attendance-sheets/{id}/reopen`** | paper alias |
| ATT-10 AGG/submit peer | `POST …/aggregate` + `…/submit` | must_keep · **≠** AGG=ATT-10 DONE · **≠** invent = ATT-11 DONE |
| GET sheet (PAY peer) | `GET …/attendance-sheets/{id}` | F-ATT-SHEET-04 cite · **OUT invent = PAY DONE** |

**Invariant ATT-11-PATH:** Sign/close/reopen Network **MUST** hit physical `/api/hrm/attendance/attendance-sheets*` — Nest dual `/core` SoT = **FAIL O9**.

**Invariant ATT-11-≠-LIVE-DONE:** Claim LIVE signatures/close endpoints alone = FR-UC-BP-ATT-11 / ATT-11 DONE = **FAIL O1/O12**.

**Invariant ATT-11-PREREQ:** Sign on non-`submitted` (open/closed) without documented 409 = **FAIL O2**.

**Invariant ATT-11-LADDER:** Missing any of NV/QL/HR approved → `can_close=true` = **FAIL O3/O6**.

**Invariant ATT-11-REJECT:** Reject present + close 2xx = **FAIL O5/O6**.

**Invariant ATT-11-NO-BYPASS:** Close without `can_close` / incomplete personas → not **409 INCOMPLETE** = **FAIL O6**.

**Invariant ATT-11-≠-AGG-DONE:** Claim AGG alone = ATT-10 DONE from this seat = **FAIL O2/O10**.

**Invariant ATT-11-≠-09-DONE:** Claim soft/ATT-08 = ATT-09 DONE = **FAIL O10**.

**Invariant ATT-11-≠-UAT:** Claim ATT module UAT / flip `attendance_uat_ready` = **FAIL O12**.

**Invariant ATT-11-≠-PRINTABLE:** Claim printable / Word DONE / flip `contracts_printable_ready` = **FAIL O11/O12**.

**Invariant ATT-11-PAY-OUT:** Invent PAY DONE / claim payroll UAT from closed cite = **FAIL O8/O11**.

**Invariant ATT-11-CFG≠02:** Claim CFG = ATT-02 DONE / reopen ATT-02 seals = **FAIL O10**.

**Invariant ATT-11-≠-DUAL-HOLD:** Invent `att_leave_hold` = **FAIL O10/O12**.

**Invariant ATT-11-≠-DISP-DONE:** Invent `lines[]`/HOL/MEAL DONE / close R-ATT-10-DISP as product DONE = **FAIL O10/O11**.

**Wire codes (RETAIN + residual assert):** `409 HRM-ATT-SIGN-INCOMPLETE` · `409 HRM-ATT-SIGN-DUP` · `409 HRM-ATT-SHEET-LOCKED` · `HRM-SCOPE-409` · sealed ATT-10/09/08/02/PLT/CORE codes · **DENY** invent Nest `/core` error family as SoT.

**Display-ready (normative for FE bind):** `{ header_id, status, statusLabelVi, steps: [{ step_code, persona_role, outcome, signed_at, signer_user_id, comment? }], missing_mandatory_roles[], can_close, policy_ready? }` — GĐ1 map paper WF ladder → LIVE fixed 3-persona set (footer FIXED_GĐ1).

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-11 DONE** · LIVE alone ≠ FR-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · HOL/MEAL/`lines[]` invent DONE OUT · R-ATT-10-DISP P2 HOLD · must_keep ATT-10 `ATT10QC1-MSLWGUYH` · ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · DENY invent `att_leave_hold` · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-29 · Option A) |
|---|----------------------|---------------------------|
| GET signatures | steps · can_close · missing_mandatory_roles | **RETAIN cite** + DISP AC (**O1/O12**) · **≠** FR-11 DONE from LIVE alone |
| POST signature | submitted only · approved/rejected · dup 409 | **RETAIN cite** + reject AC (**O5**) |
| Ladder | Fixed 3 personas | **FIXED_GĐ1 interim** + **R-ATT-11-WF** residual (**O3**) · ≠ full R-SIGN-01 DONE |
| Inbox/task | cols optional · no bridge | **OUT GĐ1** (**O4**) |
| Close | evaluator + line_locked + closed | **RETAIN cite** + no-bypass AC (**O6**) |
| Checksum | ABSENT | **OUT GĐ1** (**O7**) |
| Emit | response field only | **response-only GĐ1** + residual EMIT (**O8**) · ≠ PAY DONE |
| Reopen | archive steps/lines → submitted | **RETAIN cite** + reason/RBAC AC (**O3 peer / O reopen**) |
| Paper `/att` + `/core` | Nest `/core` ABSENT | **Alias only** (**O9**) |
| ATT-10 AGG/submit | SEALED `ATT10QC1-MSLWGUYH` · DISP P2 HOLD | **must_keep RETAIN** (**O2/O10**) · ≠ AGG=DONE |
| ATT-09/08/02/PLT/CORE | SEALED stamps | **must_keep RETAIN** (**O10**) |
| PAY / printable / HOL/MEAL / lines[] | QUEUED / OUT / HOLD | **OUT invent DONE** (**O11**) |
| Honesty | C-SLICE · printable false | **false RETAIN** (**O12**) |

### 1.1 Disposition **R-ATT-11-WF**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-11-WF` |
| **Scope** | **IN-SCOPE residual** — XBOS tenant WF order/parallel sync fidelity vs FIXED_GĐ1 interim |
| **Footer** | **FIXED_GĐ1** interim **CONFIRMED** for GĐ1 AC · full R-SIGN-01 sync = residual closable |
| **OUT** | Invent HRM-owned WF engine · claim FIXED_GĐ1 alone = R-SIGN-01 / FR-11 DONE |
| **Rationale** | SRS R-SIGN-01 · TechSpec §6.4.2 · SA O3 |
| **ba-data** | **HOLD default** — ADD only if closable WF sync col/writer proven |
| **DENY** | Nest `/core` · invent dual sign SoT · claim LIVE ladder = ATT-11 DONE |

### 1.2 Disposition **R-ATT-11-INBOX**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-11-INBOX` |
| **Scope** | **OUT GĐ1 explicit** — no ATT-sign inbox/task bridge required |
| **OUT** | Invent XBOS inbox bridge as ATT-11 DONE · invent HRM WF task engine |
| **Rationale** | SA O4 prefer OUT · cols stub OK |
| **ba-data** | **HOLD** — no new inbox table |
| **DENY** | Claim missing inbox = ATT-11 FAIL without footer OUT |

### 1.3 Disposition **R-ATT-11-REJECT**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-11-REJECT` |
| **Scope** | **IN-SCOPE AC** — one reject blocks close + PAY |
| **OUT** | Soft-allow close with reject · invent PAY after reject |
| **Rationale** | SRS «Một bên từ chối → không vào payroll» · BR-BP-TS-02 · SA O5 |
| **PASS** | `outcome=rejected` (+ comment) → GET `can_close=false` → POST close **409** `HRM-ATT-SIGN-INCOMPLETE` |
| **ba-data** | **HOLD** — LIVE outcome enum RETAIN |
| **DENY** | Close 2xx with active reject |

### 1.4 Disposition **R-ATT-11-CLOSE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-11-CLOSE` |
| **Scope** | **IN-SCOPE AC** — terminal close only when evaluator PASS |
| **OUT** | One-button Chốt bypass · invent PAY DONE from close alone |
| **Rationale** | F-ATT-SHEET-02 · Diễn biến #2 Thành công · SA O6 |
| **PASS** | 3× approved → `can_close=true` → POST close 2xx → `status=closed` · lines locked · F5 closed |
| **FAIL** | Incomplete → not 409 INCOMPLETE · or close without NV approved |
| **ba-data** | **HOLD** — LIVE closed_* + line_locked RETAIN |
| **DENY** | Bypass evaluator |

### 1.5 Disposition **R-ATT-11-CSUM**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-11-CSUM` |
| **Scope** | **OUT GĐ1 explicit** — checksum writer ABSENT accepted |
| **OUT** | Claim missing checksum = ATT-11 FAIL · invent PAY DONE |
| **Rationale** | TechSpec close+checksum · SA O7 prefer OUT |
| **ba-data** | **HOLD default** — ADD only if closable checksum col+writer proven |
| **DENY** | Nest `/core` · invent silent checksum as DONE |

### 1.6 Disposition **R-ATT-11-EMIT**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-11-EMIT` |
| **Scope** | **IN-SCOPE document** — response-only GĐ1 · durable bus unproven |
| **OUT** | Invent PAY DONE · claim bus emit LIVE = module UAT |
| **Rationale** | F-ATT-SHEET-02 response `event: timesheet.closed` · SA O8 |
| **PASS GĐ1** | Close response includes `event: 'timesheet.closed'` · PAY remains OUT invent DONE |
| **ba-data** | **HOLD** — no invent outbox table this seat |
| **DENY** | Claim emit = PAY UAT |

### 1.7 Disposition **R-ATT-11-REOPEN**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-11-REOPEN` |
| **Scope** | **IN-SCOPE AC** — reason + RBAC + audit |
| **OUT** | Silent reopen · wipe history · invent PAY adjustment DONE |
| **Rationale** | F-ATT-SHEET-03 · Diễn biến #3 · SA reopen residual |
| **PASS** | Closed sheet → reopen with reason → status `submitted` · prior sign steps archived · F5 · Nest `/core` 0 |
| **FAIL** | Reopen without reason when API requires · or hard-delete sign history |
| **ba-data** | **HOLD** — LIVE archive pattern RETAIN |
| **DENY** | Silent delete · invent PAY adjustment UC DONE |

### 1.8 Disposition **R-ATT-11-DISP**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-11-DISP` |
| **Scope** | **IN-SCOPE residual** — display-ready steps / statusLabelVi / can_close FE |
| **OUT** | Invent `lines[]` gold table DONE · invent HOL/MEAL DONE · claim R-ATT-10-DISP closed |
| **Rationale** | F-ATT-WF-SIGN-02 · SA O1/O12 · peer R-ATT-10-DISP P2 HOLD |
| **ba-data** | **HOLD** — no invent lines[] for ATT-11 |
| **DENY** | Conflate ATT-11 DISP with ATT-10 lines[] DONE |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-11 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE · ≠ AGG=ATT-10 DONE

---

## 2. Use-case catalog → AC map

| SRS step | Intent | AC IDs | Pass evidence |
|----------|--------|--------|---------------|
| Diễn biến **#1** | Xem bảng chờ chốt (`submitted`) | AC-ATT-11-LOAD · AC-ATT-11-GET-SIGN · AC-ATT-11-PREREQ · AC-ATT-11-DISP | GET sheet submitted · GET signatures · steps/can_close visible · Nest `/core` 0 |
| Diễn biến **#2** | Ký NV+QL+HR · chốt khi đủ | AC-ATT-11-SIGN · AC-ATT-11-LADDER · AC-ATT-11-CLOSE · AC-ATT-11-NO-BYPASS · AC-ATT-11-F5 | 3× POST signatures approved · POST close 2xx · F5 `closed` |
| Diễn biến **#2** FAIL | Thiếu bước / reject | AC-ATT-11-REJECT · AC-ATT-11-FAIL-REJECT · AC-ATT-11-INCOMPLETE | can_close false · close 409 INCOMPLETE |
| Diễn biến **#3** | Hủy chốt | AC-ATT-11-REOPEN | reopen + reason → submitted · archive · F5 |
| Thành công | PAY được đọc (boundary) | AC-ATT-11-EMIT · AC-ATT-11-PAY-OUT | response event cite · **≠** invent PAY DONE |
| Cross | Path / honesty / peers | AC-ATT-11-PATH · AC-ATT-11-H · AC-ATT-11-MK-* · AC-ATT-11-≠-* | Nest `/core` 0 · seals RETAIN · ≠DONE footers |

### 2.1 Acceptance criteria (measurable)

| AC ID | Rule | Pass | Fail |
|-------|------|------|------|
| **AC-ATT-11-LOAD** | User opens sheet awaiting sign | UI shows `submitted` sheet from FE path · no seed | Blank forever / GET storm / seed |
| **AC-ATT-11-GET-SIGN** | GET signatures display-ready | 2xx with `steps[]` · `missing_mandatory_roles[]` · `can_close` | 5xx · Nest `/core` SoT |
| **AC-ATT-11-PREREQ** | Only submitted signable | POST sign on submitted 2xx · closed/open → 409 LOCKED or documented reject | Sign mutates closed without 409 |
| **AC-ATT-11-SIGN** | POST signature step | NV/QL/HR each POST approved 2xx · row in steps · dup step → 409 DUP | Silent overwrite · auto-close on sign |
| **AC-ATT-11-LADDER** | Fixed 3 personas GĐ1 | All three roles required for can_close | can_close with missing persona |
| **AC-ATT-11-WF-FOOTER** | FIXED_GĐ1 vs R-SIGN-01 | Footer FIXED_GĐ1 + residual WF documented | Claim FIXED = full R-SIGN-01 DONE |
| **AC-ATT-11-INBOX-OUT** | Inbox OUT GĐ1 | Evidence footer OUT · no fail for missing inbox | Claim missing inbox = ATT-11 FAIL |
| **AC-ATT-11-REJECT** | Reject blocks | rejected + comment → can_close false | can_close true with reject |
| **AC-ATT-11-FAIL-REJECT** | Close after reject | POST close → **409** `HRM-ATT-SIGN-INCOMPLETE` | Close 2xx with reject |
| **AC-ATT-11-CLOSE** | Terminal close | 3 approved → close 2xx → `status=closed` · lines locked | Close without 3 approved |
| **AC-ATT-11-NO-BYPASS** | No Chốt bypass | Incomplete close → 409 INCOMPLETE | One-button close without signs |
| **AC-ATT-11-CSUM-OUT** | Checksum OUT GĐ1 | Footer OUT · close still PASS GĐ1 | Claim missing checksum = FAIL seat |
| **AC-ATT-11-EMIT** | Response event | Close body has `event: timesheet.closed` | Invent PAY from emit |
| **AC-ATT-11-REOPEN** | Reopen + audit | reason → submitted · steps archived · F5 | Silent wipe · no reason when required |
| **AC-ATT-11-DISP** | FE bind display-ready | SignPanel shows steps / can_close / VI labels | Crash / invent lines[] DONE |
| **AC-ATT-11-F5** | Persist after close | F5 still `closed` · signatures retained as closed history | Lost state after F5 |
| **AC-ATT-11-PATH** | Physical Nest path | Network `/api/hrm/attendance/…` · Nest `/core` sign/close **0** non-404 SoT | Nest `/core` primary SoT |
| **AC-ATT-11-MK-ATT10** | ATT-10 must_keep | Cite `ATT10QC1-MSLWGUYH` · AGG/submit RETAIN · ≠ AGG=DONE · DISP HOLD | Wipe AGG · claim AGG=ATT-10 DONE |
| **AC-ATT-11-MK-ATT09** | ATT-09 must_keep | `ATT09QC1-MSLUTL9D` · pending_days · DENY `att_leave_hold` | Invent `att_leave_hold` · claim soft/ATT-08=ATT-09 DONE |
| **AC-ATT-11-MK-ATT08** | ATT-08 must_keep | `ATT08QC1-MSLSL36C` preview RETAIN | Wipe preview · claim ATT-08=ATT-09 DONE |
| **AC-ATT-11-MK-ATT02** | ATT-02 must_keep | `ATT02QC1-MSLQZUK7` · CFG≠DONE | Claim CFG=ATT-02 DONE |
| **AC-ATT-11-MK-PLT** | PLT must_keep | `PLT01QC1-MSLPUQIU` · peer≠PLT DONE | Claim PLT DONE |
| **AC-ATT-11-MK-CORE** | CORE must_keep | CORE10/09/07 stamps · printable false · soft≠CORE-06 | Flip printable · claim CORE DONE |
| **AC-ATT-11-PAY-OUT** | PAY OUT | Closed cite only · no invent PAY DONE | Claim payroll UAT / PAY DONE |
| **AC-ATT-11-≠-LIVE-DONE** | LIVE ≠ DONE | Footer ≠ ATT-11 DONE | Claim LIVE alone DONE |
| **AC-ATT-11-≠-AGG-DONE** | AGG ≠ ATT-10 DONE | Footer ≠ AGG=ATT-10 DONE | Claim AGG=ATT-10 DONE |
| **AC-ATT-11-≠-PRINTABLE** | printable false | `contracts_printable_ready=false` | Flip printable / Word invent |
| **AC-ATT-11-≠-UAT** | ≠ ATT UAT | `attendance_uat_ready=false` · C-SLICE | Flip UAT flags |
| **AC-ATT-11-H** | Honesty pack | All false · no seed · no apps/** | Honesty flip · seed |

### 2.2 Business rules

| BR / Rule | Condition | Action | Outcome |
|-----------|-----------|--------|---------|
| **BR-BP-TS-02** | Missing mandatory approved OR any rejected | Block close · block PAY | 409 INCOMPLETE · can_close false |
| **R-SIGN-01 (GĐ1)** | FIXED_GĐ1 personas | Require NV+QL+HR approved | can_close true only when all three approved |
| **R-SIGN-01 residual** | Tenant WF sync not LIVE | Document FIXED_GĐ1 · residual WF | ≠ claim full R-SIGN-01 DONE |
| Dup step | Same `step_code` active again | Reject | 409 `HRM-ATT-SIGN-DUP` |
| Closed mutate | Sheet `closed` | Block sign/AGG mutate | 409 `HRM-ATT-SHEET-LOCKED` |
| Reopen | Closed + reason + RBAC | Archive steps → submitted | Audit retained |
| PAY boundary | Sheet ≠ closed | PAY must not treat as source | OUT invent PAY DONE this seat |
| Path | Paper `/core` | Alias only | Nest `/core` DENY |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-11 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE

---

## 3. Residual unlock table (BA → DATA/API)

| Residual | BA disposition | ba-data | Next |
|----------|----------------|---------|------|
| **R-ATT-11-WF** | FIXED_GĐ1 CONFIRMED · sync residual | **HOLD** (ADD if closable WF sync) | sa API cite · Dev residual later |
| **R-ATT-11-INBOX** | **OUT GĐ1** | **HOLD** | no invent |
| **R-ATT-11-REJECT** | **AC locked** | **HOLD** | QA assert |
| **R-ATT-11-CLOSE** | **AC locked** | **HOLD** | QA assert |
| **R-ATT-11-CSUM** | **OUT GĐ1** | **HOLD** (ADD if closable) | optional later |
| **R-ATT-11-EMIT** | response-only GĐ1 | **HOLD** | ≠ PAY DONE |
| **R-ATT-11-REOPEN** | **AC locked** | **HOLD** | QA assert |
| **R-ATT-11-DISP** | display-ready AC | **HOLD** · **≠** invent lines[] | FE residual wire after API |
| **R-ATT-10-DISP** | peer **P2 HOLD** RETAIN | **HOLD invent** | ≠ invent lines[] DONE |
| **R-ATT-11-≠-DONE / PAY-OUT / H** | footers locked | n/a | QC C-SLICE |

**ba-data default:** **HOLD** — LIVE `attendance_sheets` + `att_timesheet_sign_step` + close/reopen writers **RETAIN**. **ADD residual ONLY** if DATA proves closable gap for **checksum writer** and/or **WF sync** binding cols (not invent dual SoT / Nest `/core` / `att_leave_hold` / PAY / printable / HOL/MEAL / `lines[]`).

---

## 4. Journeys DRAFT (O12)

| J-ID | Layer | Title | Click path (draft) | Pass when |
|------|-------|-------|--------------------|-----------|
| **J-HRM-ATT-11-01** | **load** | **Submitted sheet → GET signatures** | Login → Bảng công → mở kỳ `submitted` (cite ATT-10 submit peer · **≠** AGG=ATT-10 DONE) → Sign panel · GET signatures · steps/can_close · Nest `/core` 0 · no seed · ≠ LIVE alone DONE | AC-ATT-11-LOAD/GET-SIGN/PREREQ/DISP/PATH/≠-LIVE-DONE · O1/O2/O9 · U65 · **DRAFT** |
| **J-HRM-ATT-11-02** | **sign-close** | **NV+QL+HR → close → F5 closed** | POST/UI ký đủ 3 vai approved → can_close true → Chốt / POST close 2xx → F5 `closed` · Nest `/core` 0 · ≠ invent PAY DONE | AC-ATT-11-SIGN/LADDER/CLOSE/F5/PAY-OUT · O3/O6/O8/O11 · U65 · **DRAFT** |
| **J-HRM-ATT-11-03** | **reject** | **Reject blocks close** | Một vai rejected (+ comment) → can_close false → Chốt → **409** INCOMPLETE · Nest `/core` 0 · PAY blocked cite | AC-ATT-11-REJECT/FAIL-REJECT/INCOMPLETE · O5/O6 · U65 · **DRAFT** |
| **J-HRM-ATT-11-04** | **incomplete** | **No-bypass Chốt** | Thiếu ≥1 vai approved → close → **409** INCOMPLETE · không silent closed · Nest `/core` 0 | AC-ATT-11-NO-BYPASS/INCOMPLETE/LADDER · O3/O6 · U65 · **DRAFT** |
| **J-HRM-ATT-11-05** | **reopen** | **Reopen + audit** | Sheet closed → Hủy chốt + lý do → `submitted` · prior steps archived · F5 · Nest `/core` 0 · ≠ invent PAY adjustment DONE | AC-ATT-11-REOPEN · O reopen · U65 · **DRAFT** |
| **J-HRM-ATT-11-06** | **cross** | **F5 + seals · ≠DONE** | F5 closed/sign state · Nest `/core` 0 · ≠ ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 DONE · peer≠PLT · merge≠UAT · printable false · PAY OUT · HOL/MEAL/`lines[]` OUT · DENY invent `att_leave_hold` · ATT-10 `ATT10QC1-MSLWGUYH` · ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 GATE/ACT-400/Nest DENY · soft≠CORE-06 DONE · R-ATT-10-DISP HOLD · no reopen J-ATT-10/09/08/ATT-02/PLT/CORE-* · CSUM/INBOX footer OUT · FIXED_GĐ1 · ≠ invent PAY/Word | AC-ATT-11-F5/≠-*/H/MK-*/CSUM-OUT/INBOX-OUT/WF-FOOTER · O7/O10/O11/O12 · U19 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `attendance_uat_ready` · **≠** `hrm_personnel_uat_ready` · **≠** `contracts_printable_ready` · **≠** claim LIVE alone = ATT-11 DONE · **≠** claim AGG = ATT-10 DONE · **≠** claim soft/ATT-08 = ATT-09 DONE · **≠** claim ATT module UAT · **≠** claim CFG=ATT-02 DONE · **≠** claim PLT/CORE DONE · **≠** invent PAY/printable/HOL/MEAL/`lines[]` DONE · **≠** invent `att_leave_hold` · **narrow ≠ full ATT/PAY module**.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-ATT-10-01..06** / `ATT10QC1-MSLWGUYH` / `ATT10QA1-MSLWCDX2` | must_keep AGG+submit · Nest `/core` AGG 0 · **≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT · ≠ ATT UAT · **≠** wipe · **≠** invent = ATT-11 DONE |
| **J-HRM-ATT-09-01..06** / `ATT09QC1-MSLUTL9D` | must_keep hold/settle · pending_days · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · **≠** wipe |
| **J-HRM-ATT-08-01..06** / `ATT08QC1-MSLSL36C` | must_keep preview · T6→T2=2 · HOL-MISS · ALIGN · client-days≠DONE · ≠ ATT UAT · **≠** claim ATT-08 = ATT-09 DONE |
| **J-HRM-ATT-02-01..06** / `ATT02QC1-MSLQZUK7` | must_keep CFG≠DONE · ≠ ATT UAT · Nest `/core` ATT 0 · **≠** claim ATT-02 DONE |
| **J-HRM-PLT-01-01..06** / `PLT01QC1-MSLPUQIU` | must_keep peer≠PLT DONE · merge≠platform UAT |
| **J-HRM-CORE-10-01..06** / `CORE10QC1-MSLP0EJB` | must_keep SI LIVE · catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · PAY-06 OUT · **≠** claim CORE-10 DONE |
| **J-HRM-CORE-09-01..06** / `CORE09QC1-MSLNBA89` | must_keep fill+registry · printable **false** · **≠** claim CORE-09 DONE |
| **J-HRM-CORE-07-01..05** / `CORE07QC1-KZJTSHNT` | must_keep activate · GATE 409 · ACT-400 · Nest `/core` 0 · checklist≠DONE · free PATCH≠DONE · **≠** claim CORE-07 DONE |
| **J-HRM-CORE-06-*** / soft≠DONE | must_keep soft≠DONE · **≠** claim soft=CORE-06 DONE |
| **J-HRM-CORE-05/03/02B/09D..01** | must_keep peer stamps · **≠** printable / closed-8 DONE |
| LIVE WF-SIGN + close/reopen | **RETAIN cite** · **≠** ATT-11 DONE from LIVE alone · PAY **OUT invent DONE** · **DENY** invent `att_leave_hold` · **DENY** invent HOL/MEAL/`lines[]` DONE |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-11 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE · `attendance_uat_ready=false` · ≠ AGG=ATT-10 DONE · soft/ATT-08≠ATT-09 DONE · CFG≠ATT-02 DONE

---

## 5. Honesty & must_keep

| Item | Rule |
|------|------|
| `attendance_uat_ready` | **false** · **DENY** flip |
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** · **DENY** flip |
| `contracts_printable_ready` | **false RETAIN** · **DENY** flip |
| `hrm_personnel_uat_ready` | **false** · **DENY** flip |
| Claim LIVE sign/close alone = ATT-11 / FR-11 DONE | **DENIED** (O1/O12) |
| Claim AGG alone = ATT-10 DONE | **DENIED** (O2/O10) |
| Claim soft / ATT-08 = ATT-09 DONE | **DENIED** (O10) |
| Claim ATT module UAT | **DENIED** (O12) · C-SLICE |
| Claim CFG = ATT-02 DONE | **DENIED** (O10) · CFG≠DONE **RETAIN** |
| Claim PLT-01 / platform UAT DONE | **DENIED** · peer≠PLT · merge≠UAT |
| Claim catalog/CRUD/LIVE = CORE-10 DONE | **DENIED** (O10) |
| Claim CORE-09 DONE / printable flip / Word invent | **DENIED** |
| Claim CORE-07 DONE | **DENIED** |
| Claim soft = CORE-06 DONE | **DENIED** · soft≠DONE **RETAIN** |
| Claim PAY DONE | **DENIED** · **OUT invent** |
| Claim printable / closed-8 DONE | **DENIED** |
| Invent `att_leave_hold` dual | **DENIED** (O10/O12) |
| Invent HOL/MEAL/`lines[]` DONE | **DENIED** · R-ATT-10-DISP HOLD |
| Nest `/core` dual | **DENIED** |
| Wipe ATT-10/09/08/02/PLT/CORE-10/09/07/06/05/03/02b/09d..01 | **DENIED** |
| C-SLICE | GWC later ≠ module ATT/PLT/CORE/PAY/personnel UAT ≠ Phase1 |
| must_keep W28 | ATT-10 `ATT10QC1-MSLWGUYH` · AGG+submit · Nest `/core` AGG 0 · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · ≠ ATT UAT |
| must_keep W27 | ATT-09 `ATT09QC1-MSLUTL9D` · hold/settle · pending_days · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT |
| must_keep W26 | ATT-08 `ATT08QC1-MSLSL36C` · preview · T6→T2=2 · HOL-MISS · ALIGN · client-days≠DONE · ≠ ATT UAT |
| must_keep W25 | ATT-02 `ATT02QC1-MSLQZUK7` · CFG≠DONE · ≠ ATT UAT · Nest `/core` ATT 0 |
| must_keep W24 | PLT-01 `PLT01QC1-MSLPUQIU` · peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT |
| must_keep W23 | CORE-10 `CORE10QC1-MSLP0EJB` · catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · PAY-06 OUT · ≠ CORE-10 DONE |
| must_keep W22 | CORE-09 `CORE09QC1-MSLNBA89` · printable false · ≠ CORE-09 DONE |
| must_keep W21 | CORE-07 `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE |
| must_keep W20..W10 | soft≠CORE-06 DONE · CORE-05 · CORE-03 · CORE-02b · CORE-09d..01 · 08 · 02 · 01 |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (ADD residual only if closable gap for CSUM writer and/or WF sync binding on LIVE spine) · then **sa API** F.1 F-ATT-WF-SIGN-01/02 + F-ATT-SHEET-02/03 physical `/attendance/attendance-sheets*` |
| **ba-data** | **HOLD** (default) — LIVE `attendance_sheets` + `att_timesheet_sign_step` + close/reopen RETAIN · FIXED_GĐ1 · CSUM **OUT GĐ1** · INBOX **OUT GĐ1** · EMIT response-only · **DENY** invent Nest `/core` · **DENY** invent `att_leave_hold` · **DENY** invent HOL/MEAL/`lines[]` · reopen **ADD/REQUIRED** only if DATA proves closable CSUM/WF sync gap |
| **sa API-01** | After HOLD stamp — F.1 deepen F-ATT-WF-SIGN-01/02 + F-ATT-SHEET-02/03 · RETAIN physical `/attendance/…` · paper `/att`+`/core` alias only · **DENY** Nest dual · **DENY** invent `att_leave_hold` · **DENY** invent PAY · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE |
| **Dev** | **HOLD** until API CONFIRMED · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** wipe ATT-10/09/08/02/PLT/CORE · **DENY** invent PAY/printable/Word/HOL/MEAL/`lines[]` · **DENY** claim LIVE = ATT-11 DONE · **DENY** claim ATT UAT |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-29 seat #31)
uc_ids: UC-BP-ATT-11 · FR-UC-BP-ATT-11
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md · SA Option A · R-ATT-11-WF/INBOX/REJECT/CLOSE/CSUM/EMIT/REOPEN/DISP · FIXED_GĐ1 · CSUM OUT GĐ1 · INBOX OUT GĐ1 · EMIT response-only · printable false · ATT10QC1-MSLWGUYH AGG/submit RETAIN (≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · Nest /core AGG 0) · ATT09QC1-MSLUTL9D hold/settle RETAIN (pending_days · DENY att_leave_hold · Nest /core leave 0 · ≠ soft/ATT-08=ATT-09 DONE) · ATT08QC1-MSLSL36C preview RETAIN · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU peer≠PLT · merge≠UAT · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ≠ ATT UAT · PAY OUT
spec_ref: F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02/03 physical prefer /api/hrm/attendance/attendance-sheets/{id}/signatures|close|reopen · paper /att + /core alias only · LIVE att_timesheet_sign_step · BR-BP-TS-02 · FIXED_GĐ1 MANDATORY_PERSONAS employee|direct_manager|hr_admin · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — LIVE attendance_sheets + att_timesheet_sign_step + close/reopen writers RETAIN = sign/close SoT — DENY invent second sign ledger · DENY invent att_leave_hold dual · DENY Nest /core dual
2) CONFIRM HOLD — FIXED_GĐ1 3-persona evaluator RETAIN — residual R-ATT-11-WF sync NOT invent as DONE · ≠ FR-11 DONE from LIVE alone
3) CONFIRM HOLD — CSUM OUT GĐ1 · INBOX OUT GĐ1 · EMIT response-only GĐ1 — ADD residual ONLY if proves closable checksum writer OR WF sync binding cols needed (prefer footer OUT — DENY Nest /core · DENY invent silent cols)
4) Cite display-ready DTO: header_id · status · statusLabelVi · steps[{ step_code, persona_role, outcome, signed_at, signer_user_id, comment? }] · missing_mandatory_roles[] · can_close · policy_ready?
5) RETAIN ATT-10 ATT10QC1-MSLWGUYH AGG/submit · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · ATT-09 ATT09QC1-MSLUTL9D hold/settle pending_days · DENY att_leave_hold · ATT-08 ATT08QC1-MSLSL36C preview · ATT-02 ATT02QC1-MSLQZUK7 CFG≠DONE · PLT-01 PLT01QC1-MSLPUQIU · CORE-10 CORE10QC1-MSLP0EJB · CORE-09 printable false · CORE-07 GATE 409 · ACT-400 · Nest /core DENY · soft≠CORE-06 DONE
6) DENY wipe ATT-10/09/08/02/PLT/CORE · invent att_leave_hold dual · invent PAY/printable/Word/HOL/MEAL/lines[] DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · honesty flip · reopen sealed J-HRM-ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 · seed · apps/**
7) Unlock next: sa API F.1 F-ATT-WF-SIGN-01/02 + F-ATT-SHEET-02/03 physical /attendance/attendance-sheets* — paper /att + /core alias only — residual wire ONLY after DATA stamp — PAY remain OUT invent DONE

exit: docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API residual (F.1 · wire-only after HOLD/ADD)
cấm: apps/** · seed · Nest /core dual invent · invent att_leave_hold dual · wipe ATT-10/09/08/02/PLT/CORE · honesty flip · claim ATT module UAT · invent PAY/printable/Word/HOL/MEAL/lines[] DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE
```

---

## 7. completion_report

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-ATT-11 / FR-UC-BP-ATT-11: map BR-BP-TS-02 + R-SIGN-01 to LIVE Nest `GET/POST …/attendance-sheets/:id/signatures` + `POST …/close` + `POST …/reopen` + `att_timesheet_sign_step` + FIXED_GĐ1 3-persona evaluator (employee·direct_manager·hr_admin) + reject→409 INCOMPLETE + no-bypass close + reopen archive; residuals R-ATT-11-WF (FIXED_GĐ1 footer) / INBOX OUT / REJECT / CLOSE / CSUM OUT / EMIT response-only / REOPEN / DISP; paper F-ATT-WF-SIGN + F-ATT-SHEET-02/03 + `/att`+`/core` alias only; **must_keep** ATT-10 AGG/submit (`ATT10QC1-MSLWGUYH` · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD) · ATT-09 hold (`ATT09QC1-MSLUTL9D` · pending_days · DENY `att_leave_hold`) · ATT-08 preview (`ATT08QC1-MSLSL36C`) · ATT-02/PLT/CORE; minted **J-HRM-ATT-11-01..06 DRAFT** (U65 narrow · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · C-SLICE · PAY OUT · DENY HOL/MEAL/`lines[]` DONE); ba-data **HOLD default** (ADD only CSUM/WF sync closable); DENY Nest `/core` dual · invent `att_leave_hold` · invent PAY/printable/Word · honesty flip · seed · apps/**; honesty footer **false**. |
| **next_owner** | `ba-data` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md` |

---

*End BA-01 · O1–O12 CONFIRMED · 2026-08-09*
