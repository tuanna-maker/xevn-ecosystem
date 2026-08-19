# PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01 — Option/F.1 · Quy tắc ca theo bộ phận / nhóm — RETAIN LIVE catalog + gap phân ca

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe ATT-11 sign/close · **DENY** wipe ATT-10 AGG/submit · **DENY** wipe ATT-09 hold · **DENY** wipe ATT-08 preview · **DENY** invent `att_leave_hold` dual · **DENY** invent PAY/printable/CSUM/INBOX/`lines[]` DONE · **DENY** honesty flip · **DENY** claim ATT-01 DONE from catalog alone · **DENY** claim ATT module UAT · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE · **C-SLICE** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** AC → (ba-data HOLD/ADD residual) → API/FE/BE residual only after contracts · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-29 UC-BP-ATT-11 **SEALED** — stamp **`ATT11QC1-MSLXTH9P`** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-qc-01.md` · QA **`ATT11QA2-MSLXOKS3`** · residual **`R-ATT-11-WF`/`CSUM`/`INBOX`/`EMIT` HOLD** · **≠ LIVE=ATT-11 DONE** · **must_keep** `ATT10QC1-MSLWGUYH` AGG (**≠ AGG=ATT-10 DONE** · **`R-ATT-10-DISP` P2 HOLD**) · `ATT09QC1-MSLUTL9D` hold · `ATT08QC1-MSLSL36C` preview · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` (**printable false**) · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` **ABSENT** · **≠ ATT UAT** · PAY invent DONE **OUT** · printable **false** · DENY invent `att_leave_hold` |
| **uc_ids** | `UC-BP-ATT-01` · `FR-UC-BP-ATT-01` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#32** after ATT-11 (#31 SEALED GWC) · PAY remain **QUEUED** · PAY OUT invent DONE |
| **ref_sa_spine** | ATT-11 [`PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-11-CLUSTER-SA-01.md) · ATT-10/09/08/02/PLT/CORE seals · DOC-DELTA ATT-SHIFT-CATALOG cite · honesty packs **RETAIN false** — **DENY reopen sealed J-HRM-ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 without regression** |
| **ref_honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR module UAT **false** · product_go **false** · **DENY claim catalog alone = ATT-01 DONE** · **DENY claim LIVE=ATT-11 DONE** · **DENY claim AGG=ATT-10 DONE** · **DENY invent PAY/printable/CSUM/INBOX DONE** · **DENY claim ATT module UAT** · **C-SLICE** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-01** · Diễn biến **#1–#2 + Thành công** · **BR-BP-SHF-01** · **BR-PLT-02/04/05/06** · partner **TIME-001** · DOC-DELTA **0.36** Nest `work_shifts` SoT · Settings `shifts` REF only |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` §6 ATT A1 · FR map ATT · matrix F-ATT-SHIFT / F-ATT-RULE cite |
| **ref_adr** | This Option evaluation · Nest physical prefer `/api/hrm/attendance/work-shifts*` (+ residual `shift-assignments` same controller family) · paper `/att/*` + `/core` **alias only** · U19 scope parity · soft-delete · **DENY** Nest `/core` dual · ADR D1 `work_shifts` wins vs XBOS `shifts` REF |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-ATT-CAT-SHIFT-01/02** · **F-ATT-CAT-SHIFT-EFF-01** · **F-ATT-SHIFT-CNS-01** · **F-ATT-SHIFT-01/02** · peer **F-ATT-RULE-01** · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE `public.work_shifts` · LIVE `public.shift_change_requests` · LIVE `public.attendance_rules` + `public.att_attendance_rule` (ATT-02 peer · CFG≠DONE) · paper `att_shift_assignment` / `att_work_schedule` · Nest `@Controller('core')` **ABSENT** |
| **ref_code** | `attendance.controller` `@Controller('attendance')` work-shifts CRUD + `/effective` · `attendance-catalog.service` · shift-change-requests + `HRM-ATT-SHIFT-KEY` · FE `useWorkShifts` / Attendance shifts submenu (Danh sách ca LIVE · **Lịch phân ca GĐ2-HOLD**) · **read-only cite** · CoreModule = DB export only |
| **OUT** | Nest `/core` dual · wipe ATT-11/10/09/08/02/PLT/CORE · invent `att_leave_hold` · invent PAY/printable/CSUM/INBOX/`lines[]` DONE · claim catalog alone = ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT module UAT · reopen sealed peers · seed · honesty flip · apps/** this seat · full roster grid as GĐ1 invent DONE |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-30 architecture unlock: **thiết lập quy tắc ca theo bộ phận / nhóm** (FR-UC-BP-ATT-01 · BR-BP-SHF-01 · TIME-001) vs AS-IS LIVE Nest `work_shifts` catalog + shift-change consumer + ATT-02 CFG peer — **gap-only** under U89 |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U89 after ATT-11 QC-01 GWC (`ATT11QC1-MSLXTH9P`) · U88 continuous |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-01 · BR-BP-SHF-01 · BR-PLT-02/04/05/06 · TIME-001 · F-ATT-CAT-SHIFT-* · F-ATT-SHIFT-02 · F-ATT-SHIFT-CNS-01 · peer F-ATT-RULE-01 (ATT-02) · must_keep ATT-11/10/09/08/02/PLT/CORE · Nest `/core` DENY · U19 · soft≠CORE-06 · PAY OUT · printable false · ≠ ATT UAT · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · R-ATT-11-WF/CSUM HOLD · R-ATT-10-DISP P2 HOLD |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **ATT-11 SEALED (`ATT11QC1-MSLXTH9P`):** signatures\|close\|reopen physical · Nest `/core` **0** · FIXED_GĐ1 ≠ full R-SIGN-01 · **≠ LIVE=ATT-11 DONE** · CSUM/INBOX OUT · EMIT response-only · PAY OUT · printable **false** · must_keep ATT-10/09/08/02/PLT/CORE · soft≠CORE-06 · ≠ ATT UAT · **R-ATT-11-WF/CSUM HOLD** · peer **R-ATT-10-DISP P2 HOLD**. **Shift spine AS-IS (PRESENT — RETAIN cite):** (1) **Catalog SoT** Nest physical `GET/POST/PATCH/DELETE /api/hrm/attendance/work-shifts*` + `GET …/effective` → `public.work_shifts` (**F-ATT-CAT-SHIFT-01/02/EFF** · ADR D1 Nest wins vs Settings/`shifts` REF). (2) **Consumer Đổi ca** `shift-change-requests` + invent assert **`HRM-ATT-SHIFT-KEY`** when active>0 (**F-ATT-SHIFT-CNS-01**). (3) **ATT-02 peer CFG** `GET/PATCH /attendance/rules*` + `att_attendance_rule` dept/shift specificity (**F-ATT-RULE-01**) — **CFG≠ATT-02 DONE** (`ATT02QC1-MSLQZUK7`). (4) **FE** Danh sách ca via `useWorkShifts` **LIVE**; submenu **Lịch phân ca / Ca làm thêm = GĐ2-HOLD** (`featureInDev` · **no** roster API invent). **ABSENT / residual:** Nest physical **`PUT …/shift-assignments`** (**F-ATT-SHIFT-02** paper) · runtime Nest persist **`att_shift_assignment` / `att_work_schedule`** as ATT SoT unproven · dept/group default assignment AC · resolve punch/penalty from **assigned** ca (not catalog-only) · full tuần/tháng grid (**SRS:** lưới đầy đủ có thể giai đoạn sau). Nest `@Controller('core')` **ABSENT**. |
| **Paper target** | FR-UC-BP-ATT-01: CRUD quy tắc ca theo **bộ phận/nhóm** — không một rule cứng cả công ty; SoT ca instance = Nest; Settings `shifts` REF; gán lịch phân ca; điểm danh/phạt đọc ca đang gán; Đổi ca chọn Nest khi còn ca hiệu lực. BR-BP-SHF-01 · TIME-001. |
| **Gap class** | **GĐ1 continuous AC + residual phân ca / resolve** on LIVE catalog + CNS + ATT-02 peer — **not** greenfield Nest `/core`; **not** second shifts table; **not** claim catalog alone = FR-01 DONE; **not** invent full roster GĐ1 DONE; **not** wipe ATT-11..CORE; **not** invent PAY/printable/CSUM/INBOX/`att_leave_hold` DONE. |
| **Constraints** | U89 continuous · **preserve** ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · C-SLICE · DENY seed · **cấm code until Option CONFIRMED** · gap-only · **DENY** honesty flip · **DENY** invent PAY/printable/CSUM/INBOX DONE · **DENY** claim ATT module UAT · **DENY** claim LIVE=ATT-11 DONE · **DENY** claim AGG=ATT-10 DONE |
| **Failure impact if unresolved** | Board #32 stalls or Dev invents Nest `/core` / dual shifts SoT; false claim Danh sách ca = ATT-01 DONE; wipe ATT-11 sign seals; invent roster mega-grid + PAY early |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-ATT-11 + ATT-10 + ATT-09 + ATT-08 + ATT-02 + PLT + CORE-* (SEALED must_keep)
  Nest /core DENY · printable false · C-SLICE · honesty false · PAY OUT
  ATT-11: sign/close RETAIN · ≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM HOLD
  ATT-10: AGG RETAIN · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD
       │
       │  must_keep RETAIN — DENY reopen J-HRM-ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT / CORE-*
       │  must_keep ATT-09 pending_days · DENY att_leave_hold
       │  must_keep ATT-08 preview · ATT-02 CFG≠DONE
       ▼
  ┌────────────── FR-UC-BP-ATT-01 (this seat — gap-only RETAIN + phân ca residual) ─┐
  │                                                                                │
  │  RETAIN LIVE (cite — ≠ ATT-01 DONE alone)                                      │
  │    GET/POST/PATCH/DELETE /api/hrm/attendance/work-shifts*                      │
  │      + GET …/effective → public.work_shifts (F-ATT-CAT-SHIFT-01/02/EFF)        │
  │    Settings/XBOS shifts = REF only (BR-PLT-06 · ADR D1)                        │
  │    POST shift-change-requests + HRM-ATT-SHIFT-KEY (F-ATT-SHIFT-CNS-01)         │
  │    Peer ATT-02 rules + att_attendance_rule dept/shift (CFG≠ATT-02 DONE)        │
  │    FE Danh sách ca LIVE · Lịch phân ca GĐ2-HOLD (no invent roster API)         │
  │                                                                                │
  │  RESIDUAL unlock (BA → DATA/API — closable gap)                                │
  │    R-ATT-01-ASSIGN : F-ATT-SHIFT-02 dept/group/employee assignment SoT         │
  │    R-ATT-01-SCHED  : week/month schedule thin GĐ1 XOR OUT full grid GĐ2        │
  │    R-ATT-01-RESOLVE: punch/penalty/hours read assigned ca (BR-BP-SHF-01)       │
  │    R-ATT-01-SCOPE  : OU/dept/group specificity · kiêm nhiệm by active OU       │
  │    R-ATT-01-CNS-FE : Đổi ca picker Nest fidelity (cite LIVE · FE residual)     │
  │    R-ATT-01-DISP   : display-ready shift + assignment labels                   │
  │    R-ATT-01-≠DONE  : catalog alone ≠ FR-01 · ≠ ATT UAT                         │
  │    Prefer physical Nest under /api/hrm/attendance/*                            │
  │    Paper F-ATT-SHIFT-02 /att/shift-assignments + /core = ALIAS ONLY            │
  │                                                                                │
  │  PAY / ATT-03b holiday deepen = QUEUED · OUT invent DONE                       │
  │  must_keep ATT-11..CORE · Nest /core DENY · printable false                    │
  └────────────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat
       ▼
  Nest /core dual ATT                        = DENY
  Wipe ATT-11 sign / ATT-10 AGG / ATT-09/08  = DENY
  Invent att_leave_hold second ledger        = DENY
  Invent PAY/printable/CSUM/INBOX/lines[]    = DENY
  Claim catalog alone = ATT-01 DONE          = DENY
  Claim LIVE=ATT-11 DONE · AGG=ATT-10 DONE   = DENY
  Claim Option alone = ATT module UAT        = DENY
  Flip personnel / printable / recruit       = DENY
  C-SLICE ≠ module ATT / PLT / CORE / PAY UAT

  Honesty: C-SLICE ≠ attendance_uat_ready · ≠ hrm_personnel_uat_ready
           ≠ contracts_printable_ready · ≠ product_go · ≠ invent PAY DONE
```

**Label lock:** Board «Thiết lập quy tắc ca theo bộ phận / nhóm» GĐ1 = **RETAIN cite LIVE Nest `work_shifts` catalog + CNS + ATT-02 peer** + **gap phân ca / resolve residuals** — **not** Nest `/core` dual; **not** catalog alone = FR-01 DONE; **not** Option alone = ATT UAT; **not** full roster invent DONE.  
**Spine lock:** Physical prefer `/api/hrm/attendance/work-shifts*` (+ residual `shift-assignments` same Nest family) · paper `PUT /api/hrm/att/shift-assignments` + `/core/…` = **alias only** — **DENY** Nest `/core` second SoT · **DENY** second shifts table.  
**Honesty lock:** Slice GWC later **≠** auto-flip `attendance_uat_ready` · **≠** invent PAY/printable/CSUM/INBOX DONE · **C-SLICE**.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Ca instance SoT Nest | F-ATT-CAT-SHIFT-01/02 · `work_shifts` · DOC-DELTA 0.36 | Nest CRUD + soft-retire **PRESENT** | **RETAIN cite** · **≠ ATT-01 DONE alone** |
| Effective picker | F-ATT-CAT-SHIFT-EFF-01 | `GET …/work-shifts/effective` **PRESENT** | **RETAIN cite** |
| Settings/`shifts` REF | BR-PLT-06 · ADR D1 | REF only · Nest wins | **RETAIN cite** · DENY dual-write |
| Consumer Đổi ca | F-ATT-SHIFT-CNS-01 · `HRM-ATT-SHIFT-KEY` | `shift-change-requests` **PRESENT** | **RETAIN cite** · residual FE picker fidelity **R-ATT-01-CNS-FE** |
| Phân ca dept/group/NV | F-ATT-SHIFT-02 · `att_shift_assignment` · BR-BP-SHF-01 | Nest `PUT …/shift-assignments` **ABSENT** · FE Lịch phân ca **GĐ2-HOLD** | **RESIDUAL** **R-ATT-01-ASSIGN** |
| Lịch tuần/tháng lưới | SRS «lưới đầy đủ có thể giai đoạn sau» · `att_work_schedule` | Full grid **ABSENT** | **RESIDUAL** **R-ATT-01-SCHED** (thin GĐ1 **XOR** OUT full grid GĐ2) |
| Resolve giờ/phạt theo ca gán | Diễn biến #2 · BR-BP-SHF-01 | Catalog + ATT-02 rules **PARTIAL**; assignment resolve **ABSENT** | **RESIDUAL** **R-ATT-01-RESOLVE** |
| Penalty mode XOR / bands | Peer ATT-02 · F-ATT-RULE-01 | LIVE residual seat `ATT02QC1-MSLQZUK7` · **CFG≠DONE** | **must_keep peer** · **≠** reopen as ATT-01 DONE |
| Paper `/att` + `/core` | alias | Nest `@Controller('core')` **ABSENT** | **paper = alias only** |
| ATT-11 sign/close | peer | SEALED `ATT11QC1-MSLXTH9P` | **must_keep RETAIN** · ≠ LIVE=ATT-11 DONE · WF/CSUM HOLD |
| ATT-10 AGG | peer | SEALED `ATT10QC1-MSLWGUYH` | **must_keep RETAIN** · ≠ AGG=DONE · DISP HOLD |
| ATT-09/08 | peers | SEALED stamps | **must_keep RETAIN** · DENY `att_leave_hold` |
| PLT / CORE | peers | SEALED stamps | **must_keep RETAIN** · printable false |
| PAY / CSUM / INBOX | OUT | QUEUED / OUT GĐ1 | **OUT invent DONE** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT-01 DONE** · **≠ ATT UAT** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN catalog/CNS + gap phân ca (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** LIVE Nest `@Controller('attendance')` `work_shifts*` catalog (**F-ATT-CAT-SHIFT-01/02/EFF**), Settings/`shifts` REF only, `shift-change-requests` + **`HRM-ATT-SHIFT-KEY`** (**F-ATT-SHIFT-CNS-01**), peer ATT-02 `rules*`/`att_attendance_rule` (**CFG≠DONE**), FE Danh sách ca LIVE · Lịch phân ca GĐ2-HOLD. Unlock BA residuals **R-ATT-01-ASSIGN/SCHED/RESOLVE/SCOPE/CNS-FE/DISP/≠DONE** for dept/group assignment SoT (**F-ATT-SHIFT-02**) + resolve ca đang gán (BR-BP-SHF-01) + schedule thin GĐ1 **XOR** explicit OUT full grid GĐ2. Prefer physical Nest under `/api/hrm/attendance/*`; paper **F-ATT-SHIFT-02** `/att/shift-assignments` + `/core` = **alias only**. **must_keep** ATT11QC1-MSLXTH9P (**≠ LIVE=ATT-11 DONE** · R-ATT-11-WF/CSUM HOLD) · ATT10QC1-MSLWGUYH (**≠ AGG=ATT-10 DONE** · R-ATT-10-DISP HOLD) · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · ≠ ATT UAT. PAY/printable/CSUM/INBOX **OUT invent DONE**. **DENY** invent `att_leave_hold` · claim catalog alone = ATT-01 DONE · claim ATT module UAT. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium (catalog LIVE; residual = assignment persist + resolve AC; schedule grain BA-lockable) |
| **Risk** | Low–medium if BA does not invent Nest dual / claim catalog=DONE / invent full roster+PAY |
| **Cost / timeline** | BA → ba-data HOLD/ADD residual → sa API F.1 → Dev wire · QA U65 |
| **Pros** | Matches preserve_default; reuses LIVE catalog/CNS; unlocks board #32; avoids dual SoT; separates định nghĩa ca ≠ phân ca |
| **Cons** | Not full ATT UAT; full roster may stay GĐ2; ATT-02 penalty still CFG≠DONE peer |
| **Failure modes** | BA over-scopes Nest `/core` · claims Danh sách ca=FR-01 · invent PAY · wipe ATT-11 |
| **Mitigation** | O1–O12 locks · DENY invent · peers OUT · ≠DONE footers · C-SLICE |

### Option B — Nest `/core` dual + wipe/re-home `work_shifts` (REJECT)

| | |
|--|--|
| **Summary** | Stand up Nest `@Controller('core')` as primary shift SoT; dual-write or abandon `/attendance/work-shifts`; invent parallel assignment engine unrelated to LIVE CNS/ATT-02 |
| **Pros** | Paper `/core` literal |
| **Cons** | Dual SoT · violates U89 preserve · high blast · regression ATT-11..CORE + catalog DOC-DELTA |
| **Failure modes** | Dual-write · Nest `/core` non-404 SoT · honesty flip · wipe CNS |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim LIVE catalog = ATT-01 DONE / honesty (REJECT)

| | |
|--|--|
| **Summary** | Declare seat DONE because `work_shifts` CRUD + Đổi ca exist; flip `attendance_uat_ready`; invent PAY/printable/CSUM/INBOX DONE; reopen sealed ATT-11..CORE peers |
| **Pros** | Fast chat claim |
| **Cons** | Violates BR-BP-SHF-01 (phân ca ≠ định nghĩa) · TIME-001 · C-SLICE · FE Lịch phân ca still GĐ2-HOLD |
| **Failure modes** | False UAT · sponsor distrust · continuous program stall |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+gap assign) | B (Nest dual+wipe) | C (HOLD/claim DONE) |
|-----------|-------:|----------------------:|-------------------:|--------------------:|
| Business value (FR-ATT-01) | 5 | **5** | 2 | 0 |
| Time to deliver | 4 | **4** | 1 | Fake PASS |
| Complexity (lower=better) | 3 | **3** | 1 | — |
| Security / scope U19 | 4 | **5** | 2 | Honesty breach |
| Reliability / preserve seals | 5 | **5** | 1 | High defect |
| Maintainability | 4 | **5** | 1 | Spec lie |
| Fit BR-BP-SHF-01 + preserve | 5 | **5** | 0 | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE `work_shifts*` catalog + EFF + CNS (`HRM-ATT-SHIFT-KEY`) + peer ATT-02 rules; unlock ASSIGN/SCHED/RESOLVE/SCOPE/CNS-FE/DISP residuals; paper F-ATT-SHIFT-02 + `/core` = alias only; **RETAIN** ATT-11 sign/close · ATT-10 AGG · ATT-09 hold · ATT-08 preview · ATT-02/PLT/CORE · soft≠CORE-06 · Nest `/core` DENY · ≠ ATT UAT · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · R-ATT-11-WF/CSUM HOLD · R-ATT-10-DISP P2 HOLD; **DENY** Nest dual · invent `att_leave_hold` · wipe peers · invent PAY/printable/CSUM/INBOX/`lines[]` DONE · claim catalog alone = ATT-01 DONE · claim ATT module UAT · honesty flip · reopen seals · seed · apps/** |
| **Why selected** | AS-IS already owns Nest ca instance SoT + consumer invent-ban + ATT-02 dept/shift penalty peer; FR-01 gap is **phân ca theo bộ phận/nhóm + resolve ca đang gán** — not greenfield Nest `/core`, not wipe ATT-11 sign; preserves W10–W29 must_keep; unlocks board #32 |
| **Assumptions** | ATT-11 **`ATT11QC1-MSLXTH9P` RETAIN** · QA `ATT11QA2-MSLXOKS3` · ≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM HOLD. ATT-10 **`ATT10QC1-MSLWGUYH` RETAIN** · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD. ATT-09 **`ATT09QC1-MSLUTL9D` RETAIN** · DENY `att_leave_hold`. ATT-08 **`ATT08QC1-MSLSL36C` RETAIN**. ATT-02 **`ATT02QC1-MSLQZUK7` RETAIN** · CFG≠DONE. PLT-01 **`PLT01QC1-MSLPUQIU` RETAIN**. CORE-10 **`CORE10QC1-MSLP0EJB` RETAIN**. CORE-09 **`CORE09QC1-MSLNBA89` RETAIN** · printable false. CORE-07 **`CORE07QC1-KZJTSHNT` RETAIN**. soft≠CORE-06 DONE **RETAIN**. Nest `@Controller('core')` **ABSENT**. Physical `work_shifts*` + CNS **PRESENT**. FE Lịch phân ca **GĐ2-HOLD**. `attendance_uat_ready=false` · printable false · product_go **false**. PAY **QUEUED**. |
| **Rejected** | **B** — Nest `/core` dual / wipe · **C** — HOLD / claim catalog = ATT-01 DONE / invent PAY·printable·CSUM/INBOX / honesty flip / reopen sealed |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Ca SoT | LIVE Nest `work_shifts*` · Settings `shifts` REF only · paper F-ATT-CAT-SHIFT alias | ≠DONE from catalog alone · mint J-HRM-ATT-01-* |
| O2 | Phân ca | Prefer residual **F-ATT-SHIFT-02** physical under `/attendance/shift-assignments*` (or equivalent same family) · map paper `att_shift_assignment` | AC dept/group/NV · BR-BP-SHF-01 |
| O3 | Lịch lưới | Prefer: thin GĐ1 assignment-by-range **XOR** OUT full tuần/tháng grid GĐ2 (match FE HOLD) | Explicit footer GĐ1 vs GĐ2 |
| O4 | Resolve | Punch/penalty/hours read **assigned** ca · not company-hardcode · kiêm nhiệm = OU chấm active | FAIL: rule A applied to OU B |
| O5 | Consumer Đổi ca | RETAIN CNS + `HRM-ATT-SHIFT-KEY` · empty catalog CTA · no seed | AC invent-ban · F5 |
| O6 | ATT-02 peer | must_keep `ATT02QC1-MSLQZUK7` · CFG≠ATT-02 DONE · penalty residual ≠ this seat invent DONE | ≠ reopen ATT-02 as ATT-01 |
| O7 | Paper `/core` + `/att` | Alias only | DENY Nest dual in AC/evidence |
| O8 | ATT-11/10/09/08/PLT/CORE | must_keep stamps · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · R-ATT-11-WF/CSUM HOLD · R-ATT-10-DISP HOLD · DENY `att_leave_hold` | ≠ reopen · ≠ claim DONE |
| O9 | Soft-retire ca | `status=inactive` ẩn picker · history còn | AC soft ≠ hard-delete default |
| O10 | Scope U19 | list=get=assign=mutate same `resolveHrmListScope` | Scope 409 AC |
| O11 | PAY / printable / CSUM / INBOX | OUT invent DONE · printable false | Trace-only if closed cite |
| O12 | Honesty / journeys | All false · C-SLICE · `attendance_uat_ready=false` · mint `J-HRM-ATT-01-*` DRAFT | Footer ≠DONE · ≠ ATT module UAT · U65 zero-seed |

---

## 5. F.1 outline (paper alias · Nest physical prefer)

> Full F.1 deepen = later **sa API** seat after BA (+ ba-data) — this outline **locks disposition only**.

| F-id (cite) | Physical METHOD/path (prefer) | Paper alias | Mục đích (VI) | Bước SRS |
|-------------|-------------------------------|-------------|---------------|----------|
| **F-ATT-CAT-SHIFT-01** (RETAIN) | `GET /api/hrm/attendance/work-shifts` · `GET …/:shiftId` | `/att/…` · `/core/…` **alias only** | Danh mục ca Nest | Diễn biến **#1** |
| **F-ATT-CAT-SHIFT-02** (RETAIN) | `POST/PATCH/DELETE …/work-shifts*` | paper alias | Admin mở/sửa/ngừng ca N+1 | Diễn biến **#1** |
| **F-ATT-CAT-SHIFT-EFF-01** (RETAIN) | `GET …/work-shifts/effective` | paper alias | Picker ca hiệu lực | Diễn biến **#5** Đổi ca |
| **F-ATT-SHIFT-CNS-01** (RETAIN) | `POST …/shift-change-requests*` | paper alias | Consumer đổi ca · invent-ban | Diễn biến **#5** |
| **F-ATT-SHIFT-02** (this seat residual) | Prefer `PUT|POST /api/hrm/attendance/shift-assignments*` (same Nest family) | `PUT /api/hrm/att/shift-assignments` + `/core` **alias only** | Phân ca bộ phận/nhóm/NV | Diễn biến **#2–#4** · BR-BP-SHF-01 |
| **F-ATT-SHIFT-01** (alias→CAT) | cite CAT-SHIFT-02 | paper upsert | Định nghĩa ca ≠ phân ca | Diễn biến **#1** |
| **F-ATT-RULE-01** (peer RETAIN) | `/attendance/rules*` | paper alias | Phạt theo dept/ca — **ATT-02** | peer · **CFG≠DONE** · ≠ invent = ATT-01 DONE |

**DENY:** invent Nest `@Controller('core')` as primary SoT for F-ATT-CAT-SHIFT / F-ATT-SHIFT-02.  
**DENY:** invent second `work_shifts` / mega-EAV catalog table.  
**DENY:** treat paper path alone as Nest dual invent requirement.  
**DENY:** claim Danh sách ca CRUD alone = FR-UC-BP-ATT-01 DONE.

**Display-ready cite for BA/DATA:** `{ shift_id, code, name, start_time, end_time, break_minutes?, work_factor?, status, statusLabelVi, department_id?, group_id?, employee_id?, effective_from?, effective_to?, sourceFlags? }` — BA may deepen VI labels; map paper assignment → LIVE residual table name after ba-data.

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O12 + mint J-HRM-ATT-01-* DRAFT
  → ba-data HOLD default (ADD residual ONLY if BA proves closable col/writer for assignment/schedule)
  → sa API-01 F.1 deepen RETAIN cite F-ATT-CAT-SHIFT-* + F-ATT-SHIFT-CNS (+ wire F-ATT-SHIFT-02 residual ONLY if closable)
  → Dev-BE / Dev-FE residual wire ONLY (gap-only · roster full grid NOT invent DONE)
  → QA U65 J-HRM-ATT-01-* browser FE-after-2xx + F5
  → QC GWC C-SLICE (≠ ATT-01 module UAT · ≠ ATT module UAT · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · printable false · PAY OUT)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O12 AC + mint J-HRM-ATT-01-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default / ADD residual only if closable | ba-data | HOLD unless closable gap |
| 4. sa API F.1 cite RETAIN CAT-SHIFT/CNS (+ wire ASSIGN residual ONLY if closable) | sa | API-01 delta |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 J-HRM-ATT-01-* (catalog CRUD · assign dept · resolve · CNS invent-ban · Nest `/core` 0) | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ module ATT UAT · ≠ honesty flip · ≠ wipe ATT-11..CORE · ≠ invent PAY |

**Rollback:** Docs-only seat — supersede this Option if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · BA unlocked · ATT-11/10/09/08/02/PLT/CORE stamps untouched · Nest `/core` still DENY · honesty false · apps/** untouched · **≠** claim ATT-01 DONE · **≠** claim ATT UAT · **≠** claim LIVE=ATT-11 DONE · **≠** claim AGG=ATT-10 DONE.

---

## 7. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | BA invents Nest `/core` dual | Spec path `/core` as SoT · Dev opens CoreController | O7 DENY · QC Nest SoT 0 |
| A | Claim catalog alone = ATT-01 DONE | Evidence footer missing ≠DONE | O1/O12 · C-SLICE |
| A | Wipe ATT-11 sign / ATT-10 AGG | Diff removes signatures/AGG | must_keep ATT11/10 · O8 |
| A | Invent PAY / printable / CSUM / INBOX DONE | AC claims payroll / inbox DONE | O11 OUT |
| A | Invent `att_leave_hold` | New table dual | O8 DENY · held=pending_days |
| A | Invent full roster grid as GĐ1 DONE | FE mounts mega calendar without BA lock | O3 · FE GĐ2-HOLD RETAIN until CONFIRMED |
| A | Claim Option = ATT module UAT | Ready flag flip | O12 DENY |
| B | Dual-write / Nest `/core` | New `/core` non-404 | **REJECT B** |
| C | Honesty flip / false DONE | Ready flags true without UF wave | **REJECT C** |

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| **ATT11QC1-MSLXTH9P** | RETAIN · signatures\|close\|reopen · Nest `/core` sign 0 · **≠ LIVE=ATT-11 DONE** · **R-ATT-11-WF/CSUM/INBOX/EMIT HOLD** · ≠ ATT-11/ATT UAT |
| **ATT10QC1-MSLWGUYH** | RETAIN · AGG+submit · Nest `/core` AGG 0 · **≠ AGG=ATT-10 DONE** · **R-ATT-10-DISP P2 HOLD** · HOL/MEAL OUT · ≠ ATT-10/ATT UAT |
| ATT09QC1-MSLUTL9D | RETAIN · hold/settle/release · held=`pending_days` · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT |
| ATT08QC1-MSLSL36C | RETAIN · preview-deduction physical · T6→T2=2 · HOL-MISS · ALIGN · client-days≠ATT-08 DONE |
| ATT02QC1-MSLQZUK7 | RETAIN · **CFG≠ATT-02 DONE** · late_penalty peer · ≠ ATT UAT · ≠ reopen as ATT-01 DONE |
| PLT01QC1-MSLPUQIU | RETAIN · peer≠PLT DONE · merge≠platform UAT |
| CORE10QC1-MSLP0EJB | RETAIN · catalog/CRUD/LIVE≠CORE-10 DONE · BH≠CORE-07 · PAY-06 OUT |
| CORE09QC1-MSLNBA89 | RETAIN · printable **false** · ≠ CORE-09 DONE |
| CORE07QC1-KZJTSHNT | RETAIN · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE |
| soft≠CORE-06 DONE | RETAIN |
| Nest `/core` | **DENY** dual invent · paper alias only |
| PAY / printable / Word / CSUM / INBOX / `lines[]` DONE | **OUT invent DONE** · printable false · DISP HOLD · CSUM/INBOX OUT GĐ1 |
| Catalog alone | **≠** ATT-01 DONE · **≠** ATT module UAT |
| LIVE sign/close alone | **≠** ATT-11 DONE |
| AGG alone | **≠** ATT-10 DONE |
| `att_leave_hold` | **DENY** invent dual |
| Honesty | **DENY** flip · **C-SLICE** · `attendance_uat_ready=false` |
| apps/** | **CẤM** until contracts after BA/DATA/API |
| Seed | **DENY** U65 |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A** CONFIRMED for UC-BP-ATT-01: RETAIN LIVE Nest `GET/POST/PATCH/DELETE /api/hrm/attendance/work-shifts*` + `/effective` + `shift-change-requests`/`HRM-ATT-SHIFT-KEY` + peer ATT-02 rules/`att_attendance_rule` (CFG≠DONE) + FE Danh sách ca LIVE (Lịch phân ca GĐ2-HOLD); unlock R-ATT-01-ASSIGN/SCHED/RESOLVE/SCOPE/CNS-FE/DISP/≠DONE for F-ATT-SHIFT-02 phân ca bộ phận/nhóm + BR-BP-SHF-01 resolve; paper F-ATT-SHIFT-02 `/att`+`/core` alias only; **must_keep** ATT-11 sign/close (`ATT11QC1-MSLXTH9P` · ≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM HOLD) · ATT-10 AGG (`ATT10QC1-MSLWGUYH` · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP HOLD) · ATT-09 hold (`ATT09QC1-MSLUTL9D` · pending_days · DENY `att_leave_hold`) · ATT-08 preview (`ATT08QC1-MSLSL36C`) · ATT-02/PLT/CORE · Nest `/core` DENY · printable false · ≠ ATT UAT; DENY invent PAY/printable/CSUM/INBOX/`lines[]` DONE · honesty flip · claim catalog=ATT-01 DONE · apps/**. unlock_lane **BA → DATA(HOLD) → API → FE/BE**. Explicit **≠ ATT-01 DONE · ≠ ATT module UAT · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · C-SLICE · PAY OUT · printable false**. |
| **next_owner** | `ba-process` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01.md` |
| **unlock_lane** | `ba-process` → `ba-data` (HOLD prefer) → `sa` API-01 → `dev-be`/`dev-fe` residual → `qa` → `qc` |
| **next_dispatch_prompt** | see §10 |

---

## 10. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01
role: ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-30 seat #32)
entry_criteria: SA-01 Option A CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01.md · depends ATT11QC1-MSLXTH9P · must_keep ATT-11 sign/close RETAIN (≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM/INBOX/EMIT HOLD · Nest /core sign 0) · ATT10QC1-MSLWGUYH AGG/submit RETAIN (≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · Nest /core AGG 0) · ATT09QC1-MSLUTL9D hold/settle RETAIN (pending_days · DENY att_leave_hold · Nest /core leave 0) · ATT08QC1-MSLSL36C preview RETAIN · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · PAY invent DONE OUT · printable false
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-SA-01.md (Option A · O1–O12 · F.1 outline · residuals R-ATT-01-* · unlock_lane)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-01 · BR-BP-SHF-01 · BR-PLT-02/04/05/06 · Diễn biến #1–#2 · DOC-DELTA 0.36
  - docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md §6 ATT A1
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-CAT-SHIFT-01/02/EFF · F-ATT-SHIFT-CNS-01 · F-ATT-SHIFT-02 · peer F-ATT-RULE-01
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §4.1 att_shift · §4.2 att_shift_assignment / att_work_schedule
  - docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-qc-01.md (must_keep ATT11QC1-MSLXTH9P)
exit_criteria:
  - BA AC pack O1–O12 CONFIRMED for UC-BP-ATT-01 (catalog Nest SoT · phân ca dept/group · resolve ca đang gán · CNS invent-ban · schedule GĐ1 thin XOR OUT full grid GĐ2 · display)
  - Mint J-HRM-ATT-01-* DRAFT (U65 browser) — admin CRUD ca Nest → gán bộ phận/nhóm (residual) → Đổi ca picker Nest · invent → HRM-ATT-SHIFT-KEY · Nest /core 0 · không seed · F5 còn
  - Explicit ≠ ATT-01 DONE from catalog alone · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ ATT module UAT · ≠ soft/ATT-08=ATT-09 DONE · ≠ CFG=ATT-02 DONE · printable false · C-SLICE · PAY OUT · DENY invent att_leave_hold · DENY invent CSUM/INBOX/lines[] DONE
  - ba-data HOLD default (ADD residual only if closable gap for assignment/schedule) · DENY Nest /core dual · DENY invent PAY/printable/Word DONE · DENY wipe ATT-11/10/09/08 · DENY seed · DENY apps/**
  - evidence: docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md
  - ack_status PASS_TO_PM · next ba-data HOLD (or sa API if closable gap ONLY)
cấm: apps/** · seed · Nest /core invent · invent att_leave_hold dual · wipe ATT-11/10/09/08/02/PLT/CORE · honesty flip · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT module UAT · invent PAY/printable/CSUM/INBOX/lines[] DONE · invent full roster grid DONE without BA lock
```

---

*End SA-01 · Option A LOCKED · 2026-08-09*
