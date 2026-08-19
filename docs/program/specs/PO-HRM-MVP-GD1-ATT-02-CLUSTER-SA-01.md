# PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01 — Option/F.1 · Phạt muộn / về sớm đa chế độ — RETAIN LIVE CFG + gap XOR modes

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe PLT-01/CORE-10/09/07 seals · **DENY** invent PAY/printable/Word DONE · **DENY** honesty flip · **DENY** claim ATT module UAT from Option alone · **C-SLICE** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** AC → (ba-data HOLD/ADD residual) → API/FE residual only after contracts · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-24 UC-BP-PLT-01 **SEALED** — stamp `PLT01QC1-MSLPUQIU` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-qc-01.md` · QA `PLT01QA1-MSLPQZF6` · must_keep CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` (**printable false** · ≠ CORE-09 DONE) · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` **ABSENT** · peer≠PLT DONE · merge≠platform UAT · PAY invent DONE **OUT** |
| **uc_ids** | `UC-BP-ATT-02` · `FR-UC-BP-ATT-02` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#27** after PLT-01 (#26 SEALED GWC) · ATT-08+ / PAY remain **QUEUED** · PAY OUT invent DONE |
| **ref_sa_spine** | PLT-01 [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-SA-01.md) · CORE-10/09/07 seals · ATT worksite/shift/code DOC-DELTA peers **RETAIN cite** · honesty packs **RETAIN false** — **DENY reopen sealed J-HRM-PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 without regression** |
| **ref_honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR module UAT **false** · product_go **false** · **DENY claim PLT-01 = ATT DONE** · **DENY invent PAY/printable DONE** · **DENY claim CORE-10/09/07 DONE** · **C-SLICE** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-02** · Diễn biến **#1–#5 + Thành công** · **BR-BP-SHF-02** · partner **TIME-002** |
| **ref_inventory** | `UC_INVENTORY.md` `UC-BP-ATT-02` — **Ưu tiên** · WBS-ATT-01 · TIME-002 |
| **ref_adr** | This Option evaluation (ADR template) · Nest physical prefer `/api/hrm/attendance/*` · paper `/att/*` + `/core` **alias only** · U19 scope parity · soft-delete · **DENY** Nest `/core` dual |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-ATT-RULE-01** · **F-ATT-PUNCH-01** · **F-ATT-CAT-WS-*** · **F-ATT-CAT-SHIFT-*** · peers sheet/sign · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | Paper `att_attendance_rule` + `att_shift.late_penalty_*` · LIVE `attendance_rules` · `attendance_work_sites` · `work_shifts` · `late_early_requests` · sheet `late_penalty_hours` · Nest `@Controller('core')` **ABSENT** |
| **ref_code** | `attendance.controller` `@Controller('attendance')` GET/PATCH `rules` · `AttendanceConfigService` · work-sites · work-shifts catalog · punch geofence · `attendance-requests` late_early · sheet bootstrap `late_penalty_hours` · **read-only cite** · CoreModule = DB export only |
| **OUT** | Nest `/core` dual · wipe PLT-01/CORE-10/09/07 · invent PAY DONE · invent printable/Word DONE · claim round/notify_late alone = ATT-02 DONE · claim late_early_requests = FR-02 DONE · claim ATT module UAT · reopen sealed peers · seed · honesty flip · apps/** this seat |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-25 architecture unlock: **late/early leave penalty multi-mode** (FR-UC-BP-ATT-02 — phút / block / bậc + nguồn hợp lệ) vs AS-IS LIVE Nest ATT CFG/punch/shift surfaces — **gap-only** under U89 |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after PLT-01 QC-01 GWC (`PLT01QC1-MSLPUQIU`) |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-ATT-02 · BR-BP-SHF-02 · TIME-002 · F-ATT-RULE-01 · F-ATT-PUNCH-01 · F-ATT-CAT-WS/SHIFT · must_keep PLT-01/CORE-10/09/07 · Nest `/core` DENY · U19 · soft≠CORE-06 DONE · PAY OUT invent DONE |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **PLT-01 SEALED (`PLT01QC1-MSLPUQIU`):** three-layer platform cite · Nest `/core` TOK/PLT **0** · peer≠PLT DONE · merge≠platform UAT · printable **false** · must_keep CORE-10/09/07 · soft≠CORE-06 · PAY/ATT OUT invent DONE · **≠** claim PLT/platform UAT. **ATT AS-IS (PRESENT — RETAIN cite):** (1) **CFG rules** Nest physical `GET/PATCH /api/hrm/attendance/rules` → `public.attendance_rules` (1 row/slug): round in/out · standard days · `notify_late` · method flags `gps_enabled`/`wifi_enabled`/`qr_enabled` (Face OUT GĐ1) — **ABSENT** `late_penalty_mode` / bands / OU·shift specificity. (2) **Valid-source spine partial:** work-sites GPS catalog + punch geofence (`HRM-ATT-GEO-001`/`GEO-REQ`) + wifi/qr flags — **not** full FR-02 policy matrix. (3) **Work shifts** `public.work_shifts` LIVE (code/name/hours) — **ABSENT** `late_penalty_mode` / `late_penalty_config_json` / `grace_late_minutes` columns. (4) **Đơn muộn/sớm** `late_early_requests` LIVE — **workflow request**, **≠** penalty mode SoT. (5) **Sheet funnel stub** `late_penalty_hours` on attendance sheet lines **PRESENT** — evaluate engine **ABSENT**. (6) **ABSENT:** Nest `@Controller('core')` · Nest `PATCH …/att/rules/late-penalty` as primary · table `att_attendance_rule` as LIVE Nest SoT. |
| **Paper target** | FR-UC-BP-ATT-02: C&B chọn **đúng một** chế độ (phút **XOR** block **XOR** bậc/band) gắn bộ phận/ca (+ lịch nếu khác); bảng mức; nguồn chấm ∈ danh sách hợp lệ (app/IP/GPS/máy); tắt phạt → 0; lẫn mode → từ chối lưu; số phạt vào phễu bảng công kỳ. |
| **Gap class** | **GĐ1 continuous AC + residual wire for XOR penalty modes + valid-source gate + evaluate→sheet** on LIVE CFG spine — **not** greenfield Nest `/core` ATT dual; **not** claim round/`notify_late`/đơn muộn = FR-02 DONE. |
| **Constraints** | U89 continuous · **preserve** PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · C-SLICE · DENY seed · **cấm code until Option CONFIRMED** · gap-only · **DENY** honesty flip · **DENY** invent PAY/printable/Word DONE · **DENY** claim ATT module UAT from Option alone |
| **Failure impact if unresolved** | Board #27 stalls or Dev invents Nest `/core` / dual SoT; false claim CFG round = ATT-02 DONE; wipe PLT/CORE seals; PAY open early; honesty flip |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-PLT-01 + CORE-01..10* (SEALED must_keep)
  Nest /core DENY · printable false · peer≠PLT DONE · C-SLICE · honesty false
       │
       │  must_keep RETAIN — DENY reopen J-HRM-PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01
       ▼
  ┌────────────── FR-UC-BP-ATT-02 (this seat — gap-only RETAIN + XOR residual) ─────┐
  │                                                                                │
  │  RETAIN LIVE (cite — ≠ ATT-02 DONE alone)                                      │
  │    GET/PATCH /api/hrm/attendance/rules  → attendance_rules (round · methods)   │
  │    work-sites GPS + punch geofence      → valid-source partial                 │
  │    work_shifts catalog                  → ca definition spine                  │
  │    late_early_requests                  → đơn muộn/sớm (≠ mode SoT)            │
  │    sheet late_penalty_hours             → funnel column stub                   │
  │                                                                                │
  │  RESIDUAL unlock (BA → DATA/API — closable gap)                                │
  │    R-ATT-02-MODE   : XOR minute|block|tier(band) · BR-BP-SHF-02 one SoT        │
  │    R-ATT-02-SCOPE  : OU/dept/shift specificity (DENY company-only hardcode)    │
  │    R-ATT-02-SRC    : valid sources only (gps/wifi/qr/device per OU policy)     │
  │    R-ATT-02-EVAL   : evaluate → sheet funnel (late_penalty_hours / amount)     │
  │    R-ATT-02-OFF    : disable flag → penalty = 0                                │
  │    Prefer physical Nest under /api/hrm/attendance/*                            │
  │    Paper F-ATT-RULE-01 /att/rules/late-penalty + /core = ALIAS ONLY            │
  │                                                                                │
  │  PAY deepen / ATT-08+ / sheet-sign UAT = QUEUED · OUT invent DONE this seat    │
  │  must_keep PLT-01/CORE-10/09/07 · Nest /core DENY · printable false            │
  └────────────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat
       ▼
  Nest /core dual ATT                        = DENY
  Wipe PLT-01/CORE-10/09/07 seals            = DENY
  soft = CORE-06 DONE                        = DENY
  Invent PAY/printable/Word DONE             = DENY
  Claim round/notify_late/đơn = ATT-02 DONE  = DENY
  Claim Option alone = ATT module UAT        = DENY
  Flip personnel / printable / recruit       = DENY
  C-SLICE ≠ module ATT / PLT / CORE / PAY UAT

  Honesty: C-SLICE ≠ attendance_uat_ready · ≠ hrm_personnel_uat_ready
           ≠ contracts_printable_ready · ≠ product_go
```

**Label lock:** Board «Phạt muộn / về sớm (phút / block / bậc + nguồn hợp lệ)» GĐ1 = **RETAIN cite LIVE ATT CFG + source + shift + funnel stubs** + **gap XOR mode/evaluate residuals** — **not** Nest `/core` dual; **not** round/`notify_late` alone = FR-02 DONE; **not** Option alone = ATT UAT.  
**Spine lock:** Physical prefer `/api/hrm/attendance/rules*` (+ residual late-penalty surface on same Nest controller family) · paper `PATCH /api/hrm/att/rules/late-penalty` + `/core/…` = **alias only** — **DENY** Nest `/core` second SoT.  
**Honesty lock:** Slice GWC later **≠** auto-flip `attendance_uat_ready` · **≠** invent PAY/printable DONE · **C-SLICE**.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / DB) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| One penalty mode XOR | BR-BP-SHF-02 · Diễn biến #1/#3 | **ABSENT** mode column on `attendance_rules` / `work_shifts` | **RESIDUAL** R-ATT-02-MODE |
| Bands / levels table | F-ATT-RULE-01 `bands[]` · `att_attendance_rule` | **ABSENT** Nest persist | **RESIDUAL** (+ ba-data HOLD vs ADD) |
| OU / shift scope | FR input · Resolve specificity | Rules = **company-only** 1 row/slug | **RESIDUAL** R-ATT-02-SCOPE |
| Valid source gate | Diễn biến #2/#4 · IP/GPS/máy | GPS work-sites + gps/wifi/qr flags **PARTIAL** | **RETAIN cite** + deepen R-ATT-02-SRC |
| Disable → 0 penalty | Diễn biến #5 | **ABSENT** explicit late-penalty off flag (notify_late ≠ off) | **RESIDUAL** R-ATT-02-OFF |
| Evaluate → timesheet | Diễn biến Thành công · sheet | `late_penalty_hours` col **PRESENT** · engine **ABSENT** | **RETAIN col** + R-ATT-02-EVAL |
| Round in/out | CFG peer | LIVE on `attendance_rules` | **RETAIN cite** · ≠ FR-02 DONE |
| Đơn muộn/sớm | Peer UX | `late_early_requests` LIVE | **RETAIN cite** · **≠** mode SoT |
| Work shifts definition | FR tiên quyết ca | LIVE `work_shifts` | **RETAIN cite** · penalty cols **ABSENT** |
| Paper F-ATT-RULE-01 path | `PATCH /att/rules/late-penalty` | Nest route **ABSENT** as named path | **paper = alias** → physical `/attendance/*` |
| Paper `/core` | alias | Nest `@Controller('core')` **ABSENT** | **paper = alias only** |
| PLT-01 / CORE-10/09/07 | Peer seals | SEALED stamps | **must_keep RETAIN** |
| PAY deepen | OUT | QUEUED | **OUT invent DONE** |
| Module / honesty | program | C-SLICE | **DENY flip** · **≠ ATT UAT** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN CFG/source/shift/funnel + gap XOR penalty (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** LIVE Nest `@Controller('attendance')` CFG (`/attendance/rules` → `attendance_rules`), work-sites GPS + punch geofence, `work_shifts`, `late_early_requests` (≠ mode SoT), sheet `late_penalty_hours` funnel column. Unlock BA residuals **R-ATT-02-MODE/SCOPE/SRC/EVAL/OFF** for **one** SoT mode (`minute`\|`block`\|`tier`/`band` XOR per BR-BP-SHF-02) + valid sources only + evaluate into kỳ funnel. Prefer physical Nest under `/api/hrm/attendance/*` (extend rules and/or ADD specificity table mapped from paper `att_attendance_rule`); paper **F-ATT-RULE-01** `/att/rules/late-penalty` + `/core` = **alias only**. **must_keep** PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY. PAY/printable/Word **OUT invent DONE**. **DENY** claim Option/CFG alone = ATT module UAT. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium (spine LIVE; residual = mode persist + scope + evaluate AC) |
| **Risk** | Low–medium if BA does not invent Nest dual / claim round=DONE / invent PAY |
| **Cost / timeline** | BA → ba-data HOLD/ADD residual → sa API F.1 → Dev wire · QA U65 |
| **Pros** | Matches preserve_default; reuses LIVE CFG/source/shift; unlocks board #27; avoids dual SoT |
| **Cons** | Not full ATT UAT; ATT-08+ / PAY still QUEUED; evaluate may need later ATT-10 funnel alignment |
| **Failure modes** | BA over-scopes Nest `/core` · claims notify_late=FR-02 · invent PAY · wipe PLT/CORE |
| **Mitigation** | O1–O12 locks · DENY invent · peers OUT · ≠DONE footers · C-SLICE |

### Option B — Nest `/core` dual + wipe/re-home attendance_rules (REJECT)

| | |
|--|--|
| **Summary** | Stand up Nest `@Controller('core')` as primary late-penalty SoT; dual-write or abandon `/attendance/rules` + work-sites; invent parallel penalty engine unrelated to LIVE punch/sheet |
| **Pros** | Paper `/core` literal |
| **Cons** | Dual SoT · violates U89 preserve · high blast · regression PLT/CORE + ATT CFG seals |
| **Failure modes** | Dual-write · Nest `/core` non-404 SoT · honesty flip · wipe GPS/shift |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim LIVE CFG = ATT-02 DONE / honesty (REJECT)

| | |
|--|--|
| **Summary** | Declare seat DONE because round/`notify_late`/đơn muộn/GPS exist; flip `attendance_uat_ready`; invent PAY/printable DONE; reopen sealed PLT/CORE peers |
| **Pros** | Fast chat claim |
| **Cons** | Violates BR-BP-SHF-02 XOR modes · C-SLICE · TIME-002 · peer must_keep |
| **Failure modes** | False UAT · sponsor distrust · continuous program stall |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+gap XOR) | B (Nest dual+wipe) | C (HOLD/claim DONE) |
|-----------|-------:|-------------------:|-------------------:|--------------------:|
| Business value (FR-ATT-02) | 5 | **5** | 2 | 0 |
| Time to deliver | 4 | **4** | 1 | Fake PASS |
| Complexity (lower=better) | 3 | **3** | 1 | — |
| Security / scope U19 | 4 | **5** | 2 | Honesty breach |
| Reliability / preserve seals | 5 | **5** | 1 | High defect |
| Maintainability | 4 | **5** | 1 | Spec lie |
| Fit BR-BP-SHF-02 + preserve | 5 | **5** | 0 | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE `/attendance/rules` + work-sites + punch + `work_shifts` + late_early (≠ mode) + sheet `late_penalty_hours`; unlock XOR mode/scope/source/evaluate/off residuals; paper F-ATT-RULE-01 + `/core` = alias only; **RETAIN** PLT-01/CORE-10/09/07 · soft≠CORE-06 · Nest `/core` DENY; **DENY** Nest dual · wipe peers · invent PAY/printable/Word DONE · claim round/notify_late/đơn = ATT-02 DONE · claim ATT module UAT · honesty flip · reopen seals · seed · apps/** |
| **Why selected** | AS-IS already owns ATT CFG + valid-source partial + shift + funnel column; FR-02 gap is **one-mode SoT + bands + OU/shift resolve + evaluate** — not greenfield Nest `/core`, not wipe PLT/CORE; preserves W10–W24 must_keep; unlocks board #27 |
| **Assumptions** | PLT-01 **`PLT01QC1-MSLPUQIU` RETAIN** · QA `PLT01QA1-MSLPQZF6` · peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT. CORE-10 **`CORE10QC1-MSLP0EJB` RETAIN**. CORE-09 **`CORE09QC1-MSLNBA89` RETAIN** · printable false. CORE-07 **`CORE07QC1-KZJTSHNT` RETAIN**. soft≠CORE-06 DONE **RETAIN**. Nest `@Controller('core')` **ABSENT** (grep 2026-08-09). Physical `@Controller('attendance')` **PRESENT**. `attendance_uat_ready=false` · printable false · product_go **false**. |
| **Rejected** | **B** — Nest `/core` dual / wipe · **C** — HOLD / claim LIVE CFG = ATT-02 DONE / invent PAY·printable / honesty flip / reopen sealed |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Mode SoT | XOR `minute`\|`block`\|`tier`/`band` — one per OU/ca SoT (BR-BP-SHF-02) | Reject save when mixed modes; enum labels VI |
| O2 | Persist surface | Prefer physical Nest `/attendance/*` (extend rules and/or ADD specificity rows) | Map paper F-ATT-RULE-01 + `att_attendance_rule` as alias/SoT name — **no** Nest `/core` |
| O3 | Scope resolve | Specificity dept+shift > dept > company > shift default | DENY company-only hardcode as final SoT |
| O4 | Valid sources | RETAIN GPS/wifi/qr flags + work-sites; deepen policy «từ chối / 0 công» | AC Diễn biến #2/#4 · device/máy HOLD if ABSENT |
| O5 | Evaluate | Write funnel via sheet `late_penalty_hours` (or display-ready amount) at aggregate/close | ≠ claim ATT-10/PAY DONE |
| O6 | Off flag | Explicit disable → penalty 0; hours may still store if source valid | `notify_late` **≠** off |
| O7 | late_early_requests | RETAIN peer workflow | Explicit ≠ FR-02 mode DONE |
| O8 | Paper `/core` + `/att` | Alias only | DENY Nest dual in AC/evidence |
| O9 | PLT-01/CORE-10/09/07 | must_keep stamps | ≠ reopen · ≠ claim DONE |
| O10 | PAY/printable/Word | OUT invent DONE | Trace-only if funnel cite |
| O11 | Honesty | All false · C-SLICE · `attendance_uat_ready=false` | Footer ≠DONE · ≠ ATT module UAT |
| O12 | Journey mint | Prefer `J-HRM-ATT-02-*` DRAFT (config → punch valid → penalty → F5) | Narrow · not full ATT/PAY module · U65 zero-seed |

---

## 5. F.1 outline (paper alias · Nest physical prefer)

> Full F.1 deepen = later **sa API** seat after BA (+ ba-data) — this outline **locks disposition only**.

| F-id (cite) | Physical METHOD/path (prefer) | Paper alias | Mục đích (VI) | Bước SRS |
|-------------|-------------------------------|-------------|---------------|----------|
| **F-ATT-RULE-01** (residual) | Prefer `PATCH /api/hrm/attendance/rules` (+ optional `…/late-penalty` **same controller family**) · list/get parity U19 | `PATCH /api/hrm/att/rules/late-penalty` · `/core/…` **alias only** | Cấu hình **một** mode phút/block/bậc + bands gắn OU/ca | Diễn biến **#1** · BR-BP-SHF-02 |
| **F-ATT-PUNCH-01** (RETAIN cite) | `POST /api/hrm/attendance/records` | `/att/records` alias | Chấm nguồn hợp lệ → timestamp | Diễn biến **#2**/#4 |
| **F-ATT-CAT-WS-*** (RETAIN) | `/attendance/work-sites*` | paper alias | Danh mục GPS / vùng | Nguồn hợp lệ GPS |
| **F-ATT-CAT-SHIFT-*** (RETAIN) | `/attendance/work-shifts*` | paper alias | Định nghĩa ca | Tiên quyết ca |
| **Sheet funnel cite** | sheet lines `late_penalty_hours` | — | Đưa số phạt vào phễu kỳ | Diễn biến **#3**/Thành công · **≠** ATT-10 DONE |

**DENY:** invent Nest `@Controller('core')` as primary SoT for F-ATT-RULE-01.  
**DENY:** treat paper path alone as Nest dual invent requirement.

---

## 6. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | BA invents Nest `/core` dual | Spec path `/core` as SoT · Dev opens CoreController | O8 DENY · QC Nest SoT 0 |
| A | Claim round/`notify_late`/đơn = ATT-02 DONE | Evidence footer missing ≠DONE | O7/O11 · C-SLICE |
| A | Wipe PLT-01/CORE seals | Diff touches sealed J-* | must_keep stamps · regression |
| A | Invent PAY/printable DONE | AC claims payroll/print UAT | O10 OUT |
| A | Claim Option = ATT module UAT | Ready flag flip | O11 DENY |
| B | Dual-write / Nest `/core` | New `/core` non-404 | **REJECT B** |
| C | Honesty flip / false DONE | Ready flags true without UF wave | **REJECT C** |

---

## 7. Implementation & validation plan

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O12 AC pack + mint J-HRM-ATT-02-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default / ADD residual only if BA proves | ba-data | HOLD unless closable gap (mode/bands/scope) |
| 4. sa API F.1 cite RETAIN + residual RULE | sa | API-01 delta |
| 5. Dev-BE/FE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 J-HRM-ATT-02-* | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ module ATT UAT · ≠ honesty flip |

**Rollback:** Docs-only seat — supersede this Option if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · BA unlocked · PLT/CORE stamps untouched · Nest `/core` still DENY · honesty false · apps/** untouched · **≠** claim ATT UAT.

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| PLT01QC1-MSLPUQIU | RETAIN · peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT |
| CORE10QC1-MSLP0EJB | RETAIN · catalog/CRUD/LIVE≠CORE-10 DONE · BH≠CORE-07 · PAY-06 OUT |
| CORE09QC1-MSLNBA89 | RETAIN · printable **false** · ≠ CORE-09 DONE |
| CORE07QC1-KZJTSHNT | RETAIN · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE |
| soft≠CORE-06 DONE | RETAIN |
| Nest `/core` | **DENY** dual invent · paper alias only |
| PAY / printable / Word | **OUT invent DONE** |
| round / notify_late / late_early | **≠** FR-UC-BP-ATT-02 DONE alone |
| Honesty | **DENY** flip · **C-SLICE** · `attendance_uat_ready=false` |
| ATT module UAT | **DENY** claim from Option alone |
| apps/** | **CẤM** until contracts after BA/DATA/API |
| Seed | **DENY** U65 |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A** CONFIRMED for UC-BP-ATT-02: RETAIN LIVE `/attendance/rules` + work-sites/punch + `work_shifts` + late_early (≠ mode) + sheet `late_penalty_hours`; unlock XOR mode/scope/source/evaluate/off residuals (BR-BP-SHF-02); paper F-ATT-RULE-01 + `/core` alias only; must_keep PLT-01/CORE-10/09/07; DENY Nest dual · invent PAY/printable · honesty flip · claim CFG=ATT-02 DONE · claim ATT UAT; **no** `apps/**`. |
| **next_owner** | `ba-process` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01.md` |
| **next_dispatch_prompt** | see §10 |

---

## 10. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01
role: ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-25 seat #27)
entry_criteria: SA-01 Option A CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01.md · depends PLT01QC1-MSLPUQIU · must_keep CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · peer≠PLT DONE · merge≠platform UAT · PAY invent DONE OUT
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01.md (Option A · O1–O12 · F.1 outline · residuals R-ATT-02-*)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-02
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-RULE-01 · F-ATT-PUNCH-01
  - docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md UC-BP-ATT-02 · BR-BP-SHF-02
exit_criteria:
  - BA AC pack O1–O12 CONFIRMED for UC-BP-ATT-02 (XOR minute|block|tier + valid source only + BR-BP-SHF-02)
  - Mint J-HRM-ATT-02-* DRAFT (U65 browser) — config one mode → punch valid source → penalty funnel → F5; reject mixed modes
  - Explicit ≠ ATT-02 DONE from round/notify_late/đơn alone · ≠ ATT module UAT · ≠ PLT/CORE DONE · printable false · C-SLICE
  - ba-data HOLD default (ADD residual only if closable gap for mode/bands/scope) · DENY Nest /core dual · DENY invent PAY/printable/Word DONE · DENY seed · DENY apps/**
  - evidence: docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md
  - ack_status PASS_TO_PM · next ba-data HOLD (or sa API if closable gap ONLY)
cấm: apps/** · seed · Nest /core invent · wipe PLT-01/CORE-10/09/07 · honesty flip · claim CFG=ATT-02 DONE · claim ATT module UAT
```

---

*End SA-01 · Option A LOCKED · 2026-08-09*
