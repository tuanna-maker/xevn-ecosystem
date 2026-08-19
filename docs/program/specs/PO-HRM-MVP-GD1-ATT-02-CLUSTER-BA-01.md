# BA AC pack — Wave-25 ATT cluster · UC-BP-ATT-02 (Phạt muộn / về sớm đa chế độ · RETAIN LIVE CFG + XOR residual)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-25 seat **#27**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (ADD residual only if closable gap for mode/bands/scope) · sa API residual unlock after DATA · **DENY** claim round/`notify_late`/đơn = ATT-02 DONE · **DENY** claim ATT module UAT · **printable false RETAIN** · **PAY OUT invent DONE** |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** wipe PLT-01/CORE-10/09/07 · **no** wipe soft≠CORE-06 DONE · **no** invent PAY/printable/Word DONE · **no** claim CFG alone = FR-02 DONE) |
| **uc_ids** | `UC-BP-ATT-02` · `FR-UC-BP-ATT-02` |
| **depends_on** | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01` **Option A LOCKED** · QC **`PLT01QC1-MSLPUQIU`** · QA **`PLT01QA1-MSLPQZF6`** · peer≠PLT DONE · merge≠platform UAT · must_keep CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** (printable **false** · ≠ CORE-09 DONE) · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · PAY invent DONE **OUT** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-02** · Luồng **#1–#5** · Diễn biến **#1–#5 + Thành công** · **BR-BP-SHF-02** · partner **TIME-002** |
| **ref_api_paper** | **F-ATT-RULE-01** · **F-ATT-PUNCH-01** · **F-ATT-CAT-WS-*** · **F-ATT-CAT-SHIFT-*** · sheet `late_penalty_hours` · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE `attendance_rules` · `attendance_work_sites` · `work_shifts` · `late_early_requests` · sheet `late_penalty_hours` · paper `att_attendance_rule` / `att_shift.late_penalty_*` = alias/SoT name · Nest `@Controller('core')` **ABSENT** |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/*` · paper `/att/*` + `/core` **alias only** · U19 scope parity · soft-delete · **DENY** Nest `/core` dual |
| **Honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim CFG alone = ATT-02 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** claim PLT/CORE DONE |
| **Cấm** | Nest `/core` dual · wipe PLT-01/CORE-10/09/07 · soft=CORE-06 DONE · invent PAY/printable/Word DONE · claim round/`notify_late`/đơn = FR-02 DONE · claim ATT module UAT · honesty flip · seed · apps/** · reopen sealed J-HRM-PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-25 seat #27 — **gap-only RETAIN** LIVE ATT CFG/source/shift/funnel + **XOR penalty residual**:

1. **Mode XOR** = đúng một SoT `minute` **|** `block` **|** `tier`/`band` per OU/ca (BR-BP-SHF-02) — lẫn mode → từ chối lưu.
2. **Persist** = physical Nest `/api/hrm/attendance/*` (extend `rules` and/or ADD specificity) — paper **F-ATT-RULE-01** `/att/rules/late-penalty` + `/core` = **alias only**.
3. **Scope** = dept+shift > dept > company > shift default — **DENY** company-only hardcode as final SoT.
4. **Valid source** = RETAIN GPS work-sites + gps/wifi/qr flags · deepen «từ chối / 0 công» · device/máy HOLD if ABSENT.
5. **Evaluate** = write funnel `late_penalty_hours` (or display-ready amount) — **≠** ATT-10/PAY DONE.
6. **Off** = explicit disable → penalty **0**; `notify_late` **≠** off.
7. **Mint** `J-HRM-ATT-02-01..06` DRAFT — config → punch valid → penalty → F5 — **narrow** · **≠** ATT module UAT · **≠** CFG alone DONE.
8. **must_keep** PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| C&B / HCNS | Cấu hình **một** chế độ phạt + bảng mức gắn OU/ca · Lưu → F5 |
| Nhân viên | Chấm bằng nguồn trong danh sách hợp lệ |
| Group CEO | Scope rollup `main` — U19 list = get = mutate |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng scope resolver |
| Hệ thống (Nest) | CFG rules · geofence · evaluate → sheet funnel · Nest `/core` **0** |
| PLT-01 / CORE-10/09/07 / PAY | Peers **must_keep / OUT invent DONE** — **≠** claim DONE from this seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-ATT-02 Diễn biến #1–#5 + BR-BP-SHF-02 → AC-ATT-02-* · residuals MODE/SCOPE/SRC/EVAL/OFF · J-HRM-ATT-02-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer `/attendance/rules*` (+ residual late-penalty same family) · paper `/att` + `/core` alias | Nest `/core/…` ATT SoT dual |
| Explicit ≠ ATT-02 DONE from round/`notify_late`/đơn · ≠ ATT module UAT · ≠ PLT/CORE DONE · printable false · C-SLICE | Claim CFG alone = FR-02 DONE · invent PAY/printable/Word |
| Honesty footer · PLT-01/CORE-10/09/07 RETAIN · soft≠CORE-06 DONE | Flip ready flags · reopen sealed J-* |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Mode SoT | **YES** — XOR enum `minute` **\|** `block` **\|** `tier`/`band` — **một** SoT per OU/ca (BR-BP-SHF-02) — labels VI: *Theo phút* / *Theo block* / *Theo bậc/khoảng* — lẫn mode → **từ chối lưu** — **AC-ATT-02-MODE** · **AC-ATT-02-XOR** |
| **O2** | Persist surface | **YES** — Prefer physical Nest **`/api/hrm/attendance/*`** (extend `GET/PATCH …/rules` and/or ADD specificity rows mapped from paper `att_attendance_rule`) — paper **F-ATT-RULE-01** `PATCH /att/rules/late-penalty` + `/core/…` = **alias only** — **no** Nest `/core` — **AC-ATT-02-PATH** |
| **O3** | Scope resolve | **YES** — Specificity **dept+shift > dept > company > shift default** — **DENY** company-only hardcode as final SoT — **AC-ATT-02-SCOPE** |
| **O4** | Valid sources | **YES** — RETAIN GPS work-sites + `gps_enabled`/`wifi_enabled`/`qr_enabled` + punch geofence — deepen policy «từ chối / 0 công» per Diễn biến #2/#4 — device/máy **HOLD** if ABSENT (ba-data cite) — **AC-ATT-02-SRC** |
| **O5** | Evaluate | **YES** — Write funnel via sheet **`late_penalty_hours`** (or display-ready amount) at aggregate/close — **≠** claim ATT-10 / PAY DONE — **AC-ATT-02-EVAL** |
| **O6** | Off flag | **YES** — Explicit late-penalty **disable** → penalty **= 0**; hours may still store if source valid — **`notify_late` ≠ off** — **AC-ATT-02-OFF** |
| **O7** | late_early_requests | **YES RETAIN peer** — workflow đơn muộn/sớm LIVE — **explicit ≠ FR-02 mode SoT** · **≠** ATT-02 DONE alone — **AC-ATT-02-≠-LER** |
| **O8** | Paper `/core` + `/att` | **YES** — **alias only** — Nest `@Controller('core')` SoT = **FAIL** — **AC-ATT-02-PATH** |
| **O9** | PLT-01/CORE-10/09/07 | **YES** — must_keep stamps **intact** — **≠** reopen · **≠** claim PLT/CORE DONE · peer≠PLT DONE · merge≠platform UAT · printable false · GATE/ACT-400/Nest DENY — **AC-ATT-02-MK-*** |
| **O10** | PAY/printable/Word | **YES OUT invent** — funnel cite **trace-only** · QUEUED PAY — **DENY** invent PAY/printable/Word DONE — **AC-ATT-02-PAY-OUT** |
| **O11** | Honesty | **YES false** — all ready flags false · **`attendance_uat_ready=false`** · C-SLICE · printable false RETAIN · **DENY** claim ATT module UAT · CFG alone = DONE · PLT/CORE DONE — **AC-ATT-02-H** |
| **O12** | Journey mint | **YES** — Mint **`J-HRM-ATT-02-01..06` DRAFT** (config one mode → punch valid → penalty funnel → F5; reject mixed) — **narrow** · **≠** ATT module UAT · **≠** CFG alone DONE · U65 zero-seed |

**Architecture SoT:** RETAIN LIVE `/attendance/rules` + work-sites/punch + `work_shifts` + late_early (≠ mode) + sheet `late_penalty_hours` · unlock XOR mode/scope/source/evaluate/off · paper F-ATT-RULE-01 + `/core` alias only · U19 list↔get↔mutate · PLT-01/CORE-10/09/07 **must_keep**.

### Primary API surface (BA lock — O2/O8)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| CFG rules (RETAIN + residual mode) | **`GET/PATCH /api/hrm/attendance/rules`** (+ optional `…/late-penalty` **same controller family**) | `PATCH /api/hrm/att/rules/late-penalty` · `/core/…` **alias only** |
| Punch / valid source | **`POST /api/hrm/attendance/records`** | `/att/records` alias |
| Work-sites GPS | **`/api/hrm/attendance/work-sites*`** | paper alias |
| Work shifts | **`/api/hrm/attendance/work-shifts*`** | paper alias |
| late_early_requests | LIVE attendance-requests | **≠** mode SoT |
| Sheet funnel | sheet lines `late_penalty_hours` | cite · **≠** ATT-10 DONE |
| PLT-01 MergeToken / CORE peers | `/merge-tokens*` · SI/CTR/activate | must_keep · **≠** claim DONE |

**Invariant ATT-02-PATH:** Penalty CFG Network **MUST** hit physical `/api/hrm/attendance/*` — Nest dual `/core` SoT = **FAIL O8**.

**Invariant ATT-02-XOR:** Save with >1 mode active on same OU/ca SoT = **FAIL O1** (BR-BP-SHF-02).

**Invariant ATT-02-≠-CFG-DONE:** Claim round / `notify_late` / late_early alone = FR-UC-BP-ATT-02 DONE = **FAIL O7/O11**.

**Invariant ATT-02-≠-UAT:** Claim ATT module UAT / flip `attendance_uat_ready` from this seat = **FAIL O11**.

**Invariant ATT-02-≠-PRINTABLE:** Claim printable / Word DONE / flip `contracts_printable_ready` = **FAIL O10/O11**.

**Invariant ATT-02-PAY-OUT:** Invent PAY DONE / claim payroll UAT from funnel cite = **FAIL O10**.

**Wire codes (RETAIN + residual assert):** `HRM-ATT-GEO-001` · `HRM-ATT-GEO-REQ` · `HRM-VAL-400` (bands overlap / mixed mode) · `HRM-SCOPE-409` · sealed PLT/CORE codes · **DENY** invent Nest `/core` error family as SoT.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-02 DONE** · round/`notify_late`/đơn ≠ FR-02 DONE · ≠ ATT module UAT · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · must_keep PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-25 · Option A) |
|---|----------------------|---------------------------|
| CFG rules | `GET/PATCH /attendance/rules` · round · methods · `notify_late` | **RETAIN cite** + residual XOR mode/bands (**O1/O2**) · **≠** FR-02 DONE alone |
| Mode XOR | **ABSENT** on `attendance_rules` / `work_shifts` | **RESIDUAL** R-ATT-02-MODE (**O1**) |
| Scope OU/shift | Company-only 1 row/slug | **RESIDUAL** R-ATT-02-SCOPE (**O3**) |
| Valid source | GPS work-sites + flags **PARTIAL** | **RETAIN** + deepen R-ATT-02-SRC (**O4**) |
| Off → 0 | **ABSENT** explicit (notify_late ≠ off) | **RESIDUAL** R-ATT-02-OFF (**O6**) |
| Evaluate → sheet | `late_penalty_hours` col **PRESENT** · engine **ABSENT** | **RETAIN col** + R-ATT-02-EVAL (**O5**) · ≠ ATT-10/PAY |
| late_early_requests | LIVE workflow | **RETAIN** · **≠** mode SoT (**O7**) |
| work_shifts | LIVE code/name/hours · penalty cols ABSENT | **RETAIN cite** · residual cols via ba-data HOLD/ADD |
| Paper F-ATT-RULE-01 / `/core` | Nest named path ABSENT · `@Controller('core')` ABSENT | **Alias only** (**O8**) |
| PLT-01 / CORE-10/09/07 | SEALED stamps | **must_keep RETAIN** (**O9**) |
| PAY deepen | QUEUED | **OUT invent DONE** (**O10**) |
| Honesty | C-SLICE · printable false | **false RETAIN** (**O11**) |

### 1.1 Disposition **R-ATT-02-MODE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-02-MODE` |
| **Scope** | **IN-SCOPE residual** — XOR `minute`\|`block`\|`tier`/`band` · bands[] · reject mixed · BR-BP-SHF-02 |
| **OUT of residual** | Claim round/`notify_late` = FR-02 DONE · Nest `/core` dual · invent PAY |
| **Rationale** | FR Diễn biến #1/#3 · SA O1; LIVE ABSENT mode SoT |
| **Physical gap vs paper** | Mode/bands **ABSENT** Nest persist — closable via extend `attendance_rules` and/or ADD specificity mapped from `att_attendance_rule` |
| **ba-data** | **HOLD default** — **ADD** only if proves typed col/table ABSENT for mode/bands/scope closable |
| **sa API** | F.1 deepen F-ATT-RULE-01 physical `/attendance/*` · paper alias |
| **DENY** | Nest `/core` SoT · mixed-mode save soft-OK |

### 1.2 Disposition **R-ATT-02-SCOPE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-02-SCOPE` |
| **Scope** | **IN-SCOPE residual** — dept+shift > dept > company > shift default · DENY company-only final SoT |
| **OUT** | Hardcode one company rule ignoring ca · invent Nest dual |
| **Rationale** | FR input · Diễn biến #3 «ca và lịch đang gán» · SA O3 |
| **ba-data** | **HOLD default** — ADD residual specificity only if closable |
| **DENY** | Company-only as sole SoT forever |

### 1.3 Disposition **R-ATT-02-SRC**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-02-SRC` |
| **Scope** | **IN-SCOPE residual deepen** — valid sources only · Diễn biến #2/#4 · RETAIN GPS/wifi/qr + work-sites |
| **OUT** | Device/máy primary invent if ABSENT without HOLD note · claim geofence alone = FR-02 DONE |
| **Rationale** | SA O4 · F-ATT-PUNCH-01 · F-ATT-CAT-WS RETAIN |
| **ba-data** | **HOLD** — LIVE work-sites RETAIN · device HOLD if ABSENT |
| **DENY** | Seed work-sites for U65 · Nest `/core` |

### 1.4 Disposition **R-ATT-02-EVAL** / **R-ATT-02-OFF**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-02-EVAL` · `R-ATT-02-OFF` |
| **Scope** | **IN-SCOPE residual** — evaluate → `late_penalty_hours` · explicit disable → 0 · notify_late ≠ off |
| **OUT** | Claim ATT-10 sheet-sign UAT · invent PAY DONE · treat notify_late as off |
| **Rationale** | Diễn biến #3/#5 + Thành công · SA O5/O6 |
| **ba-data** | **HOLD** — col `late_penalty_hours` RETAIN · engine wire later |
| **DENY** | Claim funnel col alone = ATT-02 DONE · invent PAY |

### 1.5 Disposition **R-ATT-02-≠-DONE** / **R-ATT-02-PAY** / **R-ATT-02-HONESTY**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-ATT-02-≠-CFG-DONE` · `R-ATT-02-≠-LER-DONE` · `R-ATT-02-≠-UAT` · `R-ATT-02-PAY-OUT` · `R-ATT-02-HONESTY` · `R-ATT-02-PRINTABLE` |
| **Scope** | **INFO honesty locks** — every evidence footer |
| **Rule** | round/`notify_late`/đơn ≠ FR-02 DONE · ≠ ATT module UAT · ≠ PLT/CORE DONE · PAY/printable/Word **OUT invent DONE** · all ready flags **false** · printable **false RETAIN** |
| **DENY** | Claim DONE / honesty flip / invent PAY·printable·Word |

### 1.6 ba-data disposition summary

| Slice | Decision | Rule |
|-------|----------|------|
| `attendance_rules` (round/methods) | **HOLD · RETAIN** | ≠ FR-02 DONE alone |
| Mode / bands / scope cols or specificity table | **HOLD default** · **ADD** only if closable gap proven | Prefer extend LIVE spine · map paper `att_attendance_rule` |
| `attendance_work_sites` + punch geofence | **HOLD · RETAIN** | deepen SRC AC · no seed |
| `work_shifts` | **HOLD · RETAIN** | penalty cols ADD only if closable |
| `late_early_requests` | **HOLD · RETAIN** | ≠ mode SoT |
| Sheet `late_penalty_hours` | **HOLD · RETAIN** | engine residual · ≠ ATT-10/PAY DONE |
| Nest `/core` | **DENY** | alias only |
| PLT-01 / CORE-10/09/07 / soft≠06 | **DENY wipe** | must_keep · printable false |
| PAY deepen tables | **OUT invent DONE** | funnel cite only |

**Unlock next:** **ba-data HOLD** stamp (ADD residual only if mode/bands/scope gap closable) → **sa API** F.1 F-ATT-RULE-01 physical `/attendance/*`.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-02 DONE** · Nest `/core` DENY · C-SLICE · `attendance_uat_ready=false`

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-SHF-02** | Cấu hình phạt trên một OU/ca | Đúng **một** mode SoT | Lẫn phút+block+bậc = **FAIL lưu** |
| **BR-ATT-02-PATH** | API phạt / CFG | Physical `/attendance/*` | Nest `/core` dual = **FAIL O8** |
| **BR-ATT-02-SCOPE** | Resolve rule | dept+shift > dept > company > shift default | Company-only final = **FAIL O3** |
| **BR-ATT-02-SRC** | Chấm | Nguồn ∈ danh sách hợp lệ | Ngoài list → từ chối hoặc 0 công (policy) |
| **BR-ATT-02-EVAL** | Có punch hợp lệ + ca gán | Tính muộn/sớm theo **một** mode | Số phạt → `late_penalty_hours` · ≠ ATT-10/PAY DONE |
| **BR-ATT-02-OFF** | Cờ tắt phạt | Penalty = 0 | `notify_late` ≠ off |
| **BR-ATT-02-NO-CA** | Không có ca gán | Cảnh báo | **Không** tự bịa ca để phạt |
| **BR-ATT-02-≠-CFG-DONE** | round / notify_late alone | ≠ FR-02 DONE | Claim DONE = **FAIL O7/O11** |
| **BR-ATT-02-≠-LER** | late_early_requests | ≠ mode SoT | Claim = FR-02 DONE = **FAIL O7** |
| **BR-ATT-02-≠-UAT** | Slice PASS | ≠ ATT module UAT | Flip `attendance_uat_ready` = **FAIL O11** |
| **BR-ATT-02-PAY-OUT** | Funnel cite | PAY QUEUED | Invent PAY DONE = **FAIL O10** |
| **BR-ATT-02-PRINTABLE** | Honesty | `contracts_printable_ready=false` | Flip = **FAIL O10/O11** |
| **BR-ATT-02-NO-SEED** | Nghiệm thu | FE only | Seed = **FAIL U65** |
| **BR-ATT-02-SCOPE-U19** | list = get = mutate | Same scope resolver | Cross-CT leak = **FAIL U19** |
| **BR-ATT-02-MK** | Any ATT-02 evidence | Diff PLT/CORE seals | Wipe/reopen/claim DONE = **FAIL O9** |

### Error taxonomy (RETAIN + residual assert)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| `HRM-VAL-400` | 400 | Lẫn mode / bands overlap | Soft-OK mixed mode |
| `HRM-ATT-GEO-001` | 4xx | Ngoài vùng GPS | Silent 2xx |
| `HRM-ATT-GEO-REQ` | 4xx | Thiếu lat/lon khi GPS | Silent OK |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | Soft OK |
| Sealed PLT-01 | — | peer≠PLT DONE · merge≠UAT | Claim PLT DONE |
| Sealed CORE-10 SI | — | catalog/CRUD/LIVE≠DONE | Claim CORE-10 DONE |
| Sealed CORE-09 CTR | — | printable false | Flip printable |
| Sealed CORE-07 GATE/ACT | — | GATE 409 · ACT-400 · Nest 0 | Claim CORE-07 DONE |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-02 DONE** · Nest `/core` DENY · C-SLICE

---

## 3. Diễn biến FR-UC-BP-ATT-02 → AC / VAL map (normative)

### 3.0 Map overview

| SRS source | Tương tác | AC cite | J-* | LIVE Network (cite) |
|------------|-----------|---------|-----|---------------------|
| **Diễn biến #1** · Luồng #1 | Cấu hình đúng một mode + mức | **AC-ATT-02-MODE** · **AC-ATT-02-XOR** · **AC-ATT-02-LOAD** | **J-HRM-ATT-02-01** | `PATCH /attendance/rules*` · Nest `/core` **0** |
| **Diễn biến #1** (neg) | Lẫn nhiều chế độ | **AC-ATT-02-XOR** | **J-HRM-ATT-02-02** | 400 / reject · F5 không giữ mixed |
| **Diễn biến #2** · Luồng #2 | Chấm nguồn hợp lệ | **AC-ATT-02-SRC** · **AC-ATT-02-PUNCH** | **J-HRM-ATT-02-03** | `POST /attendance/records` · GEO RETAIN |
| **Diễn biến #3** · Luồng #3–#4 | Tính phạt theo mode + ca | **AC-ATT-02-EVAL** · **AC-ATT-02-SCOPE** · BR-BP-SHF-02 | **J-HRM-ATT-02-03** | Funnel `late_penalty_hours` · ≠ ATT-10/PAY |
| **Diễn biến #4** | Nguồn ngoài danh sách | **AC-ATT-02-SRC-NEG** | **J-HRM-ATT-02-04** | Từ chối hoặc 0 công |
| **Diễn biến #5** | Tắt phạt | **AC-ATT-02-OFF** | **J-HRM-ATT-02-05** | Penalty = 0 · notify_late ≠ off |
| **Thành công** | Giờ + phạt nhất quán → kỳ | **AC-ATT-02-F5** · **AC-ATT-02-EVAL** | **J-HRM-ATT-02-06** | F5 còn · seals footer |
| **O7–O11** | ≠DONE + seals | **AC-ATT-02-≠-*** · **H** · **MK-*** | **J-06** | PLT/CORE RETAIN · PAY OUT |

### 3.1 AC-ATT-02 pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-ATT-02-PATH** | CFG/penalty API | List/mutate rules | Network hits **only** physical `/api/hrm/attendance/*` · Nest `/api/hrm/core/**` SoT **0** · paper `/att`+/`/core` alias only | U65 · O2/O8 · **R-ATT-02-MODE** |
| **AC-ATT-02-LOAD** | Quyền C&B đúng scope | Mở Cấu hình chấm / phạt | Form load theo scope · Nest `/core` 0 · no seed · round/methods RETAIN cite | Diễn biến #1 · J-01 |
| **AC-ATT-02-MODE** | Scope OK | Chọn **một** mode (phút\|block\|bậc) + bảng mức → Lưu → F5 | 2xx · mode còn · bands khớp · **≠** claim CFG round alone = DONE | O1 · BR-BP-SHF-02 · J-01 |
| **AC-ATT-02-XOR** | Form có >1 mode | Lưu lẫn phút+block / phút+bậc / … | **Từ chối** (400 VAL) · F5 **không** giữ mixed SoT | O1 · Diễn biến #1 neg · J-02 |
| **AC-ATT-02-SCOPE** | Rule gắn OU/ca | Resolve lúc tính | Specificity dept+shift > dept > company > shift · **DENY** company-only final | O3 · J-03 |
| **AC-ATT-02-SRC** / **AC-ATT-02-PUNCH** | GPS/wifi/qr policy + work-sites | Chấm nguồn hợp lệ | Timestamp hợp lệ · GEO RETAIN (`GEO-001`/`GEO-REQ`) · Nest `/core` 0 | O4 · Diễn biến #2 · J-03 |
| **AC-ATT-02-SRC-NEG** | Nguồn ngoài list | Chấm | Từ chối **hoặc** 0 công theo policy đơn vị · **no** silent 2xx coi đạt | O4 · Diễn biến #4 · J-04 |
| **AC-ATT-02-EVAL** | Mode SoT + punch hợp lệ + ca gán | Tính muộn/sớm | Phạt khớp **một** mode · ghi `late_penalty_hours` (hoặc amount display-ready) · **≠** ATT-10/PAY DONE | O5 · Diễn biến #3 · J-03/06 |
| **AC-ATT-02-OFF** | Cờ tắt phạt bật | Chấm muộn | Penalty **= 0** · giờ vẫn lưu nếu nguồn OK · **`notify_late` ≠ off** | O6 · Diễn biến #5 · J-05 |
| **AC-ATT-02-NO-CA** | Không có ca gán | Evaluate | Cảnh báo · **không** tự bịa ca | SRS đặc biệt · O3 |
| **AC-ATT-02-F5** | Sau Lưu CFG hoặc punch evaluate | F5 / navigate lại | Mode + số phạt funnel còn · Nest `/core` 0 | U65 · J-06 |
| **AC-ATT-02-≠-CFG-DONE** | round / notify_late PASS alone | Claim FR-02 / ATT-02 DONE | **FAIL** — footer **CFG alone ≠ ATT-02 DONE** | O7/O11 |
| **AC-ATT-02-≠-LER** | late_early_requests LIVE | Claim = mode SoT / FR-02 DONE | **FAIL** | O7 |
| **AC-ATT-02-≠-UAT** | Slice GWC later | Claim ATT module UAT / flip `attendance_uat_ready` | **FAIL** | O11 · C-SLICE |
| **AC-ATT-02-≠-PLT-DONE** | Any ATT-02 evidence | Claim PLT-01 / platform UAT DONE | **FAIL** — peer≠PLT · merge≠UAT | O9 |
| **AC-ATT-02-≠-CORE10-DONE** | Any ATT-02 evidence | Claim catalog/CRUD/LIVE = CORE-10 DONE | **FAIL** | O9 |
| **AC-ATT-02-≠-09-DONE** | Any ATT-02 evidence | Claim CORE-09 DONE / printable flip | **FAIL** | O9/O10 |
| **AC-ATT-02-≠-07-DONE** | Any ATT-02 evidence | Claim CORE-07 DONE | **FAIL** | O9 |
| **AC-ATT-02-PAY-OUT** | Funnel / sheet cite | This seat | **OUT invent** — claim PAY DONE = **FAIL** | O10 |
| **AC-ATT-02-NO-SEED** | Empty / missing sites | UF evidence | CTA / hướng dẫn · **no** seed | O12 · U65 |
| **AC-ATT-02-MK-PLT** | Any ATT-02 evidence | Diff PLT-01 | peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT **intact** · **no** reopen J-HRM-PLT-01-01..06 · **≠** claim PLT DONE | O9 · `PLT01QC1-MSLPUQIU` |
| **AC-ATT-02-MK-10** | Any ATT-02 evidence | Diff CORE-10 | SI LIVE · catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · PAY-06 OUT **intact** · **no** reopen J-HRM-CORE-10-01..06 · **≠** claim CORE-10 DONE | O9 · `CORE10QC1-MSLP0EJB` |
| **AC-ATT-02-MK-09** | Any ATT-02 evidence | Diff CORE-09 | Fill+registry · PREV · VER · printable **false** · 09a–d≠DONE · registry≠DONE **intact** · **no** reopen J-HRM-CORE-09-01..06 · **≠** claim CORE-09 DONE · **≠** Word invent | O9 · `CORE09QC1-MSLNBA89` |
| **AC-ATT-02-MK-07** | Any ATT-02 evidence | Diff CORE-07 | Physical activate · GATE **409** · ACT-**400** · Nest `/core` **0** · checklist≠DONE · free PATCH≠DONE **intact** · **no** reopen J-HRM-CORE-07-01..05 · **≠** claim CORE-07 DONE | O9 · `CORE07QC1-KZJTSHNT` |
| **AC-ATT-02-MK-06** | Any ATT-02 evidence | Diff CORE-06 | soft≠DONE · Nest `/core` 0 **intact** · **≠** claim soft=CORE-06 DONE | O9 |
| **AC-ATT-02-H** | Evidence footer | Any seal | attendance/personnel/printable/recruitment/jd **false** · C-SLICE · **printable false RETAIN** · **DENY** CFG=ATT-02 DONE · ATT UAT · PLT/CORE DONE · PAY/printable/Word DONE · Nest DENY · no reopen seals | O9/O10/O11 |

### 3.2 Scope ladder (U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + C&B | Rules/penalty across rollup membership | Cross-CT mutate without membership |
| **Member CEO / HRBP** | Chỉ pháp nhân membership | list ≠ get ≠ mutate resolver |
| **No Settings / C&B right** | Deny mutate rules | Silent 2xx |

**Invariant ATT-02-SCOPE-U19:** attendance rules / work-sites list **=** get-by-id **=** mutate **same** hrm list-scope family.

**Prerequisite:** PLT-01 seal RETAIN (`PLT01QC1-MSLPUQIU` · peer≠PLT · merge≠UAT) · CORE-10 (`CORE10QC1-MSLP0EJB`) · CORE-09 (`CORE09QC1-MSLNBA89` · printable false) · CORE-07 (`CORE07QC1-KZJTSHNT`) · soft≠CORE-06 DONE · **không** seed · honesty flags false.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-02 DONE** · Nest `/core` DENY · C-SLICE

---

## 4. Diễn biến FE U65 (browser matrix — narrow ATT-02)

```text
Login (ceo@xe.vn / member C&B HCNS)
  → /hr Nhân sự → Cài đặt chấm công / cấu hình phạt (narrow CFG)
  → (Pos MODE) Chọn đúng một mode (phút XOR block XOR bậc) + bảng mức → Lưu 2xx → F5 còn
       → Assert Nest /core = 0 · CFG round/notify_late RETAIN cite · ≠ ATT-02 DONE alone
  → (Neg XOR) Thử lẫn mode → từ chối lưu · F5 không giữ mixed
  → (Pos SRC) Chấm bằng nguồn hợp lệ (GPS trong vùng / wifi|qr theo flags) → 2xx timestamp
  → (Pos EVAL) Quan sát số phạt khớp mode · funnel late_penalty_hours (hoặc display-ready) · ≠ ATT-10/PAY DONE
  → (Neg SRC) Nguồn ngoài list → từ chối hoặc 0 công theo policy
  → (Pos OFF) Bật tắt phạt → chấm muộn → penalty = 0 · notify_late ≠ off
  → Footer: ≠ ATT-02 DONE
       · round/notify_late/đơn ≠ FR-02 DONE
       · ≠ ATT module UAT · attendance_uat_ready=false
       · peer≠PLT DONE · merge≠platform UAT
       · printable false RETAIN
       · PAY OUT invent DONE
       · must_keep PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT
       · soft≠CORE-06 DONE · honesty false · no reopen seals
```

**cấm:** `pnpm seed:*` · API seed punch/sites · DB fake · PASS chỉ curl · Nest `/core` dual · wipe PLT-01/CORE-10/09/07 · claim CFG=FR-02 DONE · claim ATT module UAT · invent PAY/printable/Word · claim module DONE · reopen sealed J-*.

### VAL pack (mint)

| VAL-ID | Expect | Maps |
|--------|--------|------|
| **VAL-ATT-02-01** | CFG load + one mode save + F5 · Nest `/core` 0 · no seed | AC-ATT-02-LOAD/MODE/PATH · O1/O2/O8 |
| **VAL-ATT-02-02** | Mixed mode reject · F5 clean | AC-ATT-02-XOR · O1 |
| **VAL-ATT-02-03** | Punch valid source + evaluate khớp mode · funnel cite · ≠ ATT-10/PAY | AC-ATT-02-SRC/EVAL/SCOPE · O3/O4/O5 |
| **VAL-ATT-02-04** | Invalid source → reject hoặc 0 công | AC-ATT-02-SRC-NEG · O4 |
| **VAL-ATT-02-05** | Off → penalty 0 · notify_late ≠ off | AC-ATT-02-OFF · O6 |
| **VAL-ATT-02-06** | F5 + seals · ≠DONE · printable false · PAY OUT · PLT/CORE RETAIN · honesty | AC-ATT-02-F5/≠-*/H/MK-* · O7/O9/O10/O11 |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-02 DONE** · Nest `/core` DENY · C-SLICE

---

## 5. Journeys DRAFT (O12)

| J-ID | Layer | Title | Click path (draft) | Pass when |
|------|-------|-------|--------------------|-----------|
| **J-HRM-ATT-02-01** | **CFG** | **One mode XOR save** | Login → Cài đặt chấm → chọn **một** mode + mức → Lưu 2xx → F5 · Nest `/core` 0 · no seed · ≠ ATT-02 DONE from round alone | AC-ATT-02-LOAD/MODE/PATH · O1/O2/O8 · U65 · **DRAFT** |
| **J-HRM-ATT-02-02** | **CFG** | **Reject mixed modes** | Lẫn phút+block/bậc → từ chối · F5 không giữ mixed · Nest `/core` 0 | AC-ATT-02-XOR · O1 · U65 · **DRAFT** |
| **J-HRM-ATT-02-03** | **punch+eval** | **Valid source → penalty** | Chấm nguồn hợp lệ → phạt khớp mode · funnel `late_penalty_hours` cite · Nest `/core` 0 · ≠ ATT-10/PAY DONE | AC-ATT-02-SRC/EVAL/SCOPE · O3/O4/O5 · U65 · **DRAFT** |
| **J-HRM-ATT-02-04** | **punch** | **Invalid source** | Nguồn ngoài list → từ chối hoặc 0 công · Nest `/core` 0 | AC-ATT-02-SRC-NEG · O4 · U65 · **DRAFT** |
| **J-HRM-ATT-02-05** | **CFG** | **Off → penalty 0** | Tắt phạt → chấm muộn → penalty 0 · notify_late ≠ off · Nest `/core` 0 | AC-ATT-02-OFF · O6 · U65 · **DRAFT** |
| **J-HRM-ATT-02-06** | **cross** | **F5 + seals · ≠DONE** | F5 còn mode/funnel · Nest `/core` 0 · ≠ ATT-02 DONE · CFG/đơn ≠ FR-02 DONE · ≠ ATT module UAT · peer≠PLT · merge≠UAT · printable false · PAY OUT · PLT `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 GATE/ACT-400/Nest DENY · soft≠CORE-06 DONE · no reopen J-PLT/CORE-10/09/07/06/05/03/02B/09D..01 · ≠ invent PAY/Word | AC-ATT-02-F5/≠-*/H/MK-* · O7/O9/O10/O11 · U19 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `attendance_uat_ready` · **≠** `hrm_personnel_uat_ready` · **≠** `contracts_printable_ready` · **≠** claim CFG alone = ATT-02 DONE · **≠** claim ATT module UAT · **≠** claim PLT/CORE DONE · **≠** invent PAY DONE · **narrow ≠ full ATT/PAY module**.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-PLT-01-01..06** / `PLT01QC1-MSLPUQIU` / `PLT01QA1-MSLPQZF6` | must_keep peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT |
| **J-HRM-CORE-10-01..06** / `CORE10QC1-MSLP0EJB` | must_keep SI LIVE · catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · PAY-06 OUT · **≠** claim CORE-10 DONE |
| **J-HRM-CORE-09-01..06** / `CORE09QC1-MSLNBA89` | must_keep fill+registry · printable **false** · 09a–d≠DONE · Word OUT · **≠** claim CORE-09 DONE |
| **J-HRM-CORE-07-01..05** / `CORE07QC1-KZJTSHNT` | must_keep activate · GATE 409 · ACT-400 · Nest `/core` 0 · checklist≠DONE · free PATCH≠DONE · **≠** claim CORE-07 DONE |
| **J-HRM-CORE-06-*** / soft≠DONE | must_keep soft≠DONE · **≠** claim soft=CORE-06 DONE |
| **J-HRM-CORE-05/03/02B/09D..01** | must_keep peer stamps · **≠** printable / closed-8 DONE |
| ATT CFG round / late_early / work-sites peers | **RETAIN cite** · **≠** ATT-02 DONE alone · PAY **OUT invent DONE** |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-02 DONE** · Nest `/core` DENY · C-SLICE · `attendance_uat_ready=false`

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `attendance_uat_ready` | **false** · **DENY** flip |
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** · **DENY** flip |
| `contracts_printable_ready` | **false RETAIN** · **DENY** flip |
| `hrm_personnel_uat_ready` | **false** · **DENY** flip |
| Claim round / `notify_late` / late_early alone = ATT-02 / FR-02 DONE | **DENIED** (O7/O11) |
| Claim ATT module UAT | **DENIED** (O11) · C-SLICE |
| Claim PLT-01 / platform UAT DONE | **DENIED** · peer≠PLT · merge≠UAT |
| Claim catalog/CRUD/LIVE = CORE-10 DONE | **DENIED** (O9) |
| Claim CORE-09 DONE / printable flip / Word invent | **DENIED** |
| Claim CORE-07 DONE | **DENIED** |
| Claim soft = CORE-06 DONE | **DENIED** · soft≠DONE **RETAIN** |
| Claim PAY DONE | **DENIED** · **OUT invent** |
| Claim printable / closed-8 DONE | **DENIED** |
| Nest `/core` dual | **DENIED** |
| Wipe PLT-01/CORE-10/09/07/06/05/03/02b/09d..01 | **DENIED** |
| C-SLICE | GWC later ≠ module ATT/PLT/CORE/PAY/personnel UAT ≠ Phase1 |
| must_keep W24 | PLT-01 `PLT01QC1-MSLPUQIU` · peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT |
| must_keep W23 | CORE-10 `CORE10QC1-MSLP0EJB` · catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · PAY-06 OUT · ≠ CORE-10 DONE |
| must_keep W22 | CORE-09 `CORE09QC1-MSLNBA89` · printable false · ≠ CORE-09 DONE |
| must_keep W21 | CORE-07 `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE |
| must_keep W20..W10 | soft≠CORE-06 DONE · CORE-05 · CORE-03 · CORE-02b · CORE-09d..01 · 08 · 02 · 01 |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (ADD residual only if closable gap for mode/bands/OU·shift specificity on LIVE `attendance_rules` / mapped `att_attendance_rule` / `work_shifts`) · then **sa API** F.1 F-ATT-RULE-01 physical `/attendance/*` |
| **ba-data** | **HOLD** (default) — reopen **ADD/REQUIRED** only if DATA proves typed col/table ABSENT for XOR mode/bands/scope closable |
| **sa API-01** | After HOLD stamp — F.1 deepen F-ATT-RULE-01 · RETAIN F-ATT-PUNCH-01 / WS / SHIFT · paper `/att`+`/core` alias only · **DENY** Nest dual · **DENY** invent PAY |
| **Dev** | **HOLD** until API CONFIRMED · **DENY** Nest `/core` dual · **DENY** wipe PLT/CORE · **DENY** invent PAY/printable/Word · **DENY** claim CFG = ATT-02 DONE · **DENY** claim ATT UAT |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-25 seat #27)
uc_ids: UC-BP-ATT-02 · FR-UC-BP-ATT-02
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md · SA Option A · R-ATT-02-MODE HOLD/ADD residual · R-ATT-02-SCOPE · R-ATT-02-SRC HOLD · R-ATT-02-EVAL/OFF HOLD · R-ATT-02-≠-DONE · R-ATT-02-PAY-OUT · printable false · PLT01QC1-MSLPUQIU peer≠PLT · merge≠UAT · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · PAY OUT
spec_ref: F-ATT-RULE-01 physical prefer /api/hrm/attendance/rules* · paper /att/rules/late-penalty + /core alias only · LIVE attendance_rules · attendance_work_sites · work_shifts · late_early_requests (≠ mode) · sheet late_penalty_hours · Nest /core DENY · BR-BP-SHF-02 XOR · ≠ ATT-02 DONE from CFG alone · ≠ ATT module UAT

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — LIVE attendance_rules (round/methods/notify_late) RETAIN — ≠ FR-02 DONE alone
2) HOLD default on mode/bands/OU·shift specificity — ADD residual ONLY if proves typed col/table ABSENT for closable XOR SoT (map paper att_attendance_rule; prefer extend attendance_rules / work_shifts — DENY Nest /core dual table invent as primary)
3) CONFIRM HOLD — attendance_work_sites + punch geofence RETAIN · device/máy HOLD if ABSENT
4) CONFIRM HOLD — work_shifts RETAIN · late_early_requests RETAIN ≠ mode SoT · sheet late_penalty_hours col RETAIN (engine residual ≠ ATT-10/PAY DONE)
5) Cite display-ready DTO needs: late_penalty_mode · bands[] · org/dept/shift keys · enabled/off · late_penalty_hours
6) RETAIN PLT-01 PLT01QC1-MSLPUQIU · CORE-10 CORE10QC1-MSLP0EJB · CORE-09 printable false · CORE-07 GATE 409 · ACT-400 · Nest /core DENY · soft≠CORE-06 DONE
7) DENY wipe PLT/CORE · invent PAY/printable/Word DONE · claim CFG/đơn = ATT-02 DONE · claim ATT module UAT · honesty flip · reopen sealed J-HRM-PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 · seed · apps/**
8) Unlock next: sa API F.1 F-ATT-RULE-01 physical /attendance/* — paper /att + /core alias only — residual wire ONLY after DATA stamp — PAY remain OUT invent DONE

exit: docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API residual (F.1 · wire-only after HOLD/ADD)
cấm: apps/** · seed · Nest /core dual invent · wipe PLT-01/CORE-10/09/07 · honesty flip · claim ATT module UAT · invent PAY/printable/Word DONE
```

---

## 8. completion_report

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-ATT-02 / FR-UC-BP-ATT-02: map XOR minute\|block\|tier + valid source + evaluate/off to LIVE Nest `/attendance/rules` + work-sites/punch + `work_shifts` + late_early (≠ mode) + sheet `late_penalty_hours`; residuals R-ATT-02-MODE/SCOPE/SRC/EVAL/OFF; paper F-ATT-RULE-01 + `/att`+`/core` alias only; minted **J-HRM-ATT-02-01..06 DRAFT** (U65 narrow · ≠ ATT module UAT · ≠ CFG alone DONE); ba-data **HOLD default**; must_keep PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06; DENY Nest `/core` dual · invent PAY/printable/Word · honesty flip · seed · apps/**; honesty footer **false** · C-SLICE. |
| **next_owner** | `ba-data` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md` |

---

*End BA-01 · O1–O12 CONFIRMED · 2026-08-09*
