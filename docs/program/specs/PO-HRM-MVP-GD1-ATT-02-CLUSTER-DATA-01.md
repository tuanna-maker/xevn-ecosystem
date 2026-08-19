# PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN LIVE ATT CFG + residual ADD mode/bands/scope (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-25 seat **#27**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE `public.attendance_rules` · `attendance_work_sites` · `work_shifts` · `late_early_requests` · sheet/`att_timesheet_line.late_penalty_hours` · **RESIDUAL ADD stamped** (closable) for **mode · bands · scope · off** prefer extend LIVE `attendance_rules` and/or ADD specificity mapped from paper `att_attendance_rule` — **NO migrate invent this seat** · **NO** Nest `/core` table dual · **NO** wipe PLT-01/CORE-10/09/07 · **NO** wipe soft≠CORE-06 DONE · **NO** invent PAY / printable / Word DONE · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — LIVE spines **RETAIN** · mode/bands/scope/off typed persist **ABSENT PROVEN** → residual **ADD stamped closable** (not greenfield Nest dual) · device/máy **HOLD if ABSENT** · unlock **sa API-01** RETAIN cite **F-ATT-RULE-01** physical `/api/hrm/attendance/*` — residual wire **ONLY if** closable gap · **PAY OUT invent DONE** · **printable false RETAIN** |
| **uc_ids** | `UC-BP-ATT-02` · `FR-UC-BP-ATT-02` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · **R-ATT-02-MODE** · **R-ATT-02-SCOPE** · **R-ATT-02-SRC** · **R-ATT-02-EVAL** · **R-ATT-02-OFF** · **R-ATT-02-≠-CFG-DONE** · **R-ATT-02-≠-LER-DONE** · **R-ATT-02-≠-UAT** · **R-ATT-02-PAY-OUT** · **R-ATT-02-HONESTY** · **R-ATT-02-PRINTABLE** false RETAIN · QC **`PLT01QC1-MSLPUQIU`** · peer≠PLT DONE · merge≠platform UAT · **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · ≠ CORE-09 DONE · **`CORE07QC1-KZJTSHNT`** · soft≠DONE · Nest `/core` DENY · PAY invent DONE **OUT** |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md) · O1–O12 · AC-ATT-02-* · R-ATT-02-* |
| **ref_plt_data** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md) — MergeToken HOLD · stamp `PLT01QC1-MSLPUQIU` |
| **ref_core10_data** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md) — SI HOLD · stamp `CORE10QC1-MSLP0EJB` |
| **ref_core09_data** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md) — printable **false** · ≠ CORE-09 DONE |
| **ref_core07_data** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md) — GATE/ACT · Nest `/core` DENY |
| **ref_paper_db** | paper `att_attendance_rule` / `att_shift.late_penalty_*` = **alias/SoT name** ↔ LIVE prefer `attendance_rules` (+ residual specificity) · work-sites ↔ `attendance_work_sites` · shifts ↔ `work_shifts` · đơn ↔ `late_early_requests` · funnel ↔ `late_penalty_hours` |
| **ref_paper_api** | **F-ATT-RULE-01** · **F-ATT-PUNCH-01** · **F-ATT-CAT-WS-*** · **F-ATT-CAT-SHIFT-*** · Nest `@Controller('core')` **ABSENT** · paper `/att/*` + `/core` **alias only** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-02** · Diễn biến **#1–#5 + Thành công** · **BR-BP-SHF-02** · partner **TIME-002** |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/*` · paper `/att` + `/core` alias only · U19 · soft-delete · **DENY** Nest `/core` dual |
| **ref_code_cite** | `attendance.controller` `@Controller('attendance')` · `AttendanceConfigService.ensureRulesSchema` / work-sites · `AttendanceCatalogService` `work_shifts` · `attendance-requests` `late_early_requests` · `ensureAttTimesheetLineSchema` `late_penalty_hours` · Nest `@Controller('core')` **ABSENT** (grep 2026-08-09) — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim round/`notify_late`/đơn = ATT-02 DONE · **DENY** claim CFG alone = FR-02 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** claim PLT/CORE DONE · honesty flip |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| CFG rules spine | **HOLD RETAIN** Nest **`public.attendance_rules`** on **`GET/PATCH /api/hrm/attendance/rules`** — round · methods · `notify_late` — **≠** FR-02 DONE alone · **DENY wipe** |
| Work-sites + punch | **HOLD RETAIN** **`public.attendance_work_sites`** + geofence (`HRM-ATT-GEO-001`/`GEO-REQ`) + `gps_enabled`/`wifi_enabled`/`qr_enabled` — deepen SRC · **no seed** |
| Work shifts | **HOLD RETAIN** **`public.work_shifts`** (code/name/hours) — penalty cols **ABSENT** · residual cols only if same closable ADD path |
| late_early_requests | **HOLD RETAIN** workflow đơn muộn/sớm — **≠ mode SoT** · **≠** ATT-02 DONE alone |
| Sheet funnel | **HOLD RETAIN** **`late_penalty_hours`** on `att_timesheet_line` (sheet bootstrap) — engine **ABSENT** · **≠** ATT-10/PAY DONE |
| **R-ATT-02-MODE** | **RESIDUAL ADD stamped** — XOR `minute`\|`block`\|`tier`/`band` · `bands[]` · reject mixed — **ABSENT PROVEN** on LIVE rules/shifts · prefer extend `attendance_rules` and/or ADD specificity ≡ paper `att_attendance_rule` — **NO migrate this seat** |
| **R-ATT-02-SCOPE** | **RESIDUAL ADD stamped** — dept+shift > dept > company > shift default — company-only 1-row/slug **≠** final SoT forever |
| **R-ATT-02-OFF** | **RESIDUAL ADD stamped** — explicit late-penalty disable → **0** · **`notify_late` ≠ off** |
| **R-ATT-02-SRC** | **HOLD RETAIN** deepen — device/máy **HOLD if ABSENT** (no invent primary device SoT GĐ1) |
| **R-ATT-02-EVAL** | **HOLD RETAIN** col · evaluate engine = API/Dev residual later · **≠** ATT-10/PAY DONE |
| **R-ATT-02-≠-*** / PAY / HONESTY / PRINTABLE | **INFO honesty locks** |
| Nest path | Physical `/api/hrm/attendance/*` · Nest `@Controller('core')` **ABSENT** · paper `/att` + `/core` **alias only** |
| PLT-01 | **must_keep** · stamp **`PLT01QC1-MSLPUQIU`** · peer≠PLT DONE · merge≠platform UAT |
| CORE-10 | **must_keep** · stamp **`CORE10QC1-MSLP0EJB`** · ≠ CORE-10 DONE |
| CORE-09 printable | **must_keep** · stamp **`CORE09QC1-MSLNBA89`** · printable **false** · ≠ CORE-09 DONE |
| CORE-07 GATE/ACT | **must_keep** · stamp **`CORE07QC1-KZJTSHNT`** · Nest DENY · soft≠CORE-06 DONE |
| PAY / printable / Word | **OUT invent DONE** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim CFG alone / ATT UAT / PLT/CORE DONE |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `att_attendance_rule` + F-ATT-RULE-01 `PATCH /att/rules/late-penalty` | Prefer **`public.attendance_rules`** (+ residual specificity rows) · **`GET/PATCH /api/hrm/attendance/rules*`** (+ optional `…/late-penalty` same family) | **HOLD RETAIN** spine · residual ADD mode/bands/scope/off |
| `att_shift.late_penalty_*` | Prefer residual on rules/specificity · **HOLD** invent on `work_shifts` unless same ADD path chosen by sa API | **HOLD invent** dual SoT on shifts alone |
| F-ATT-PUNCH-01 / valid source | **`POST /api/hrm/attendance/records`** + work-sites GPS | **HOLD RETAIN** deepen SRC |
| F-ATT-CAT-WS-* | **`/api/hrm/attendance/work-sites*`** → `attendance_work_sites` | **HOLD RETAIN** |
| F-ATT-CAT-SHIFT-* | **`/api/hrm/attendance/work-shifts*`** → `work_shifts` | **HOLD RETAIN** |
| Đơn muộn/sớm | **`late_early_requests`** | **HOLD RETAIN** · **≠** mode |
| Phễu bảng công | **`att_timesheet_line.late_penalty_hours`** | **HOLD RETAIN** · ≠ ATT-10/PAY DONE |
| Nest `/core` ATT table | — | **DENY invent** |
| Paper `/core` / `/att` | Alias only | **DENY** Nest dual SoT |
| PLT / CORE peers | MergeToken · SI · CTR · activate | **must_keep** · ≠ claim DONE |

```text
  public.attendance_rules (LIVE — HOLD RETAIN CFG spine · ≠ FR-02 DONE alone)
        RETAIN: id · company_id (UQ 1-row/slug) · work_* · round_in/out ·
                standard_* · hours_per_day · allow_multiple_checkin ·
                auto_checkout · notify_late · gps/wifi/qr/faceid · gps_locations · audit
        ABSENT PROVEN: late_penalty_mode · bands_json · org_unit/dept · shift_id ·
                       penalty_enabled/off · grace_* (grep 2026-08-09)
        RESIDUAL ADD (stamped closable — NO migrate this seat):
          prefer soft cols on attendance_rules AND/OR specificity table
          mapped from paper att_attendance_rule (dept+shift > dept > company > shift default)
          XOR mode minute|block|tier(band) · bands[] · explicit off
                │
                │ Physical API (HOLD RETAIN + residual)
                ▼
  GET/PATCH /api/hrm/attendance/rules*  (+ optional …/late-penalty same controller)
  Paper PATCH /att/rules/late-penalty + /core/… = ALIAS ONLY
                │
  public.attendance_work_sites + punch geofence   HOLD RETAIN (SRC deepen)
  public.work_shifts                              HOLD RETAIN (ca spine)
  public.late_early_requests                      HOLD RETAIN (≠ mode SoT)
  att_timesheet_line.late_penalty_hours           HOLD RETAIN (funnel col · engine later)

  Display-ready DTO (cite · HOLD schema until Dev after API):
        mode · modeLabelVi · bands[] · scope (deptId/shiftId/companyId) ·
        sourceFlags (gps/wifi/qr) · latePenaltyEnabled · late_penalty_hours ·
        statusLabelVi (wire/derive HOLD)

  PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false ·
  CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY
        SEALED must_keep

  FORBIDDEN GĐ1 this seat:
        Wipe LIVE attendance_rules / work-sites / work_shifts / late_early / funnel col
        Nest /core dual · invent PAY/printable/Word DONE
        Claim round/notify_late/đơn = ATT-02 DONE · CFG alone = FR-02 DONE
        Claim ATT module UAT · PLT/CORE DONE · honesty flip · reopen sealed J-*
        Seed · apps/** · invent device primary without HOLD reopen
```

**Label lock:** Board «Phạt muộn / về sớm đa chế độ» GĐ1 = **LIVE ATT CFG/source/shift/funnel RETAIN** + **XOR residual ADD stamped** — **not** Nest `/core` dual · **not** round/`notify_late`/đơn = FR-02 DONE · **not** CFG alone = ATT UAT.  
**Spine lock:** Physical `/api/hrm/attendance/*` — **DENY** Nest `/core` second SoT · paper `/att`+`/core` alias only.  
**Gap lock:** Mode/bands/scope/off **ABSENT PROVEN** → residual **ADD stamped** · **HOLD invent migrate** until sa API F.1 + Dev unlock.  
**Honesty lock:** `attendance_uat_ready=false` · printable false · C-SLICE · PAY OUT.

---

## 3. AS-IS baseline (Nest facts — read-only cite · 2026-08-09)

| Object | AS-IS LIVE | Gap (Wave-25 DATA) |
|--------|------------|---------------------|
| **`public.attendance_rules`** | `ensureRulesSchema` — round · notify_late · gps/wifi/qr · 1 row/`company_id` | **HOLD RETAIN** · mode/bands/scope/off **ABSENT** → residual ADD stamped |
| **`GET/PATCH /attendance/rules`** | CFG LIVE | **HOLD RETAIN** · ≠ FR-02 DONE |
| **`public.attendance_work_sites`** | GPS catalog + active soft | **HOLD RETAIN** SRC |
| Punch geofence | `HRM-ATT-GEO-001` / `GEO-REQ` | **HOLD RETAIN** deepen |
| **`public.work_shifts`** | code/name/hours/status | **HOLD RETAIN** · penalty cols ABSENT |
| **`public.late_early_requests`** | request workflow | **HOLD RETAIN** · ≠ mode |
| **`late_penalty_hours`** | on `att_timesheet_line` | **HOLD RETAIN** · engine ABSENT |
| Paper F-ATT-RULE-01 / `/core` | Nest named `/att/…` + `@Controller('core')` **ABSENT** | **alias only** · **DENY invent** dual |
| PLT-01 / CORE-10/09/07 | SEALED stamps | **must_keep** · **DENY wipe** |
| PAY deepen | QUEUED | **OUT invent DONE** |

**FORBIDDEN invent this seat:** wipe LIVE spines · Nest `/core` dual · invent PAY/printable/Word DONE · claim CFG/round/đơn = FR-02 / ATT UAT · claim PLT/CORE DONE · seed · honesty flip · apps/** · reopen sealed J-HRM-PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01.

---

## 4. HOLD / residual dispositions (normative)

### 4.1 LIVE spines — **HOLD RETAIN** (mission §1)

| Physical | Rule |
|----------|------|
| `attendance_rules` (round/methods/`notify_late`) | **HOLD RETAIN** · ≠ FR-02 DONE alone |
| `attendance_work_sites` + punch | **HOLD RETAIN** · no seed U65 |
| `work_shifts` | **HOLD RETAIN** ca spine |
| `late_early_requests` | **HOLD RETAIN** · **≠** mode SoT (**R-ATT-02-≠-LER-DONE**) |
| `late_penalty_hours` | **HOLD RETAIN** funnel col · ≠ ATT-10/PAY DONE |

### 4.2 Mode / bands / scope / off — **RESIDUAL ADD stamped** (mission §2)

| Residual | Ruling |
|----------|--------|
| **R-ATT-02-MODE** | **ADD stamped** — XOR enum + `bands[]` · BR-BP-SHF-02 · reject mixed · **ABSENT PROVEN** |
| **R-ATT-02-SCOPE** | **ADD stamped** — specificity dept+shift > dept > company > shift default · DENY company-only final SoT |
| **R-ATT-02-OFF** | **ADD stamped** — explicit disable → 0 · notify_late ≠ off |
| Prefer physical | Soft cols on **`attendance_rules`** and/or **specificity table** ≡ paper `att_attendance_rule` — **DENY** Nest `/core` dual · **DENY** greenfield unrelated SoT |
| This seat | **HOLD invent migrate** — stamp only · sa API F.1 → Dev later |
| Device/máy | **HOLD** if ABSENT — no invent primary GĐ1 |

### 4.3 Display-ready DTO — cite (mission §3)

| DTO field (camelCase) | Source / derive | Rule |
|-----------------------|-----------------|------|
| `mode` | residual enum `minute`\|`block`\|`tier`/`band` | XOR one SoT · **AC-ATT-02-MODE** |
| `modeLabelVi` | derive VI labels (*Theo phút* / *Theo block* / *Theo bậc/khoảng*) | **display-ready** — DENY raw enum as sole UI |
| `bands[]` | residual JSON / rows | overlap → `HRM-VAL-400` |
| `scope` / `departmentId` / `shiftId` / `companyId` | residual specificity | U19 + resolve order **AC-ATT-02-SCOPE** |
| `sourceFlags` (`gpsEnabled`/`wifiEnabled`/`qrEnabled`) | LIVE rules + work-sites | **RETAIN** · deepen SRC |
| `latePenaltyEnabled` | residual off flag | disable → penalty 0 · ≠ `notifyLate` |
| `notifyLate` | LIVE `notify_late` | **RETAIN peer** · ≠ off |
| `latePenaltyHours` | sheet/`att_timesheet_line.late_penalty_hours` | funnel cite · ≠ ATT-10/PAY DONE |
| `statusLabelVi` | wire/derive HOLD | sa API residual **ONLY if** closable |

**Residual wire:** sa API may stamp envelope fidelity **ONLY if** closable gap — prefer physical F-ATT-RULE-01 cite · **HOLD** schema invent until API locks DTO.

### 4.4 PLT/CORE seals · Nest `/core` — **RETAIN** (mission §4)

| Stamp | Rule |
|-------|------|
| **`PLT01QC1-MSLPUQIU`** | **must_keep** · peer≠PLT DONE · merge≠platform UAT |
| **`CORE10QC1-MSLP0EJB`** | **must_keep** · ≠ CORE-10 DONE |
| **`CORE09QC1-MSLNBA89`** | printable **false RETAIN** · ≠ CORE-09 DONE |
| **`CORE07QC1-KZJTSHNT`** | GATE/ACT · Nest DENY · ≠ CORE-07 DONE |
| soft≠CORE-06 DONE | **RETAIN** |
| Nest `@Controller('core')` | **ABSENT** · paper alias only · **DENY invent** |

### 4.5 DENY inventory (mission §5)

| DENY | Why |
|------|-----|
| Wipe PLT-01/CORE-10/09/07/06/05/03/02B/09D..01 | must_keep seals |
| Invent PAY/printable/Word DONE | OUT invent · printable false |
| Claim round/`notify_late`/đơn = ATT-02 DONE | R-ATT-02-≠-CFG/LER-DONE |
| Claim CFG alone = FR-02 DONE · ATT module UAT | O11 · C-SLICE |
| Claim PLT/CORE DONE | must_keep honesty |
| Nest `/core` dual / honesty flip / reopen sealed J-* | Option A · preserve |
| Seed / `apps/**` | U65 · docs-only |

---

## 5. Validation matrix (data integrity — HOLD + residual)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-ATT-02-DATA-01 | PATCH rules CFG (round/methods) | LIVE spine RETAIN | 2xx · F5 · ≠ FR-02 DONE claim |
| VAL-ATT-02-DATA-02 | Save mixed modes same OU/ca | XOR BR-BP-SHF-02 | **reject** · `HRM-VAL-400` (residual) |
| VAL-ATT-02-DATA-03 | Bands overlap | bands[] | `HRM-VAL-400` |
| VAL-ATT-02-DATA-04 | Company-only as sole final SoT forever | specificity | **FAIL** SCOPE residual |
| VAL-ATT-02-DATA-05 | Invalid punch source | SRC deepen | từ chối / 0 công · GEO codes RETAIN |
| VAL-ATT-02-DATA-06 | Explicit off | disable flag | penalty **0** · notify_late may stay |
| VAL-ATT-02-DATA-07 | Evaluate funnel | write `late_penalty_hours` | col RETAIN · ≠ ATT-10/PAY DONE |
| VAL-ATT-02-DATA-08 | late_early approve alone | peer workflow | **≠** mode SoT DONE |
| VAL-ATT-02-DATA-09 | Scope mismatch | U19 list=get=mutate | `HRM-SCOPE-409` / 404 |
| VAL-ATT-02-DATA-10 | Nest `/core` dual | `@Controller('core')` as SoT | **FAIL** O8 |
| VAL-ATT-02-DATA-11 | Claim CFG/round/đơn = ATT-02 DONE | evidence footer | **FAIL** honesty |
| VAL-ATT-02-DATA-12 | Claim ATT UAT / invent PAY/printable | footer | **FAIL** honesty |

---

## 6. Lifecycle (penalty CFG — residual)

| From → To | Legal? | Notes |
|-----------|--------|-------|
| (none) → one mode + bands under scope | YES | XOR · reject mixed |
| Mode A → Mode B (same SoT key) | YES | Replace one SoT · history soft preferred |
| Enabled → disabled (off) | YES | Penalty **0** |
| Disabled → enabled | YES | Re-evaluate per mode |
| Any → Nest `/core` second SoT | **NO** | DENY dual |
| late_early request → mode SoT | **NO** | Orthogonal peer |

Invalid transition → deterministic 4xx (not silent wipe / soft-OK mixed).

---

## 7. Scope parity (U19)

| Surface | Resolver | Rule |
|---------|----------|------|
| `GET/PATCH /attendance/rules` | company slug scope (LIVE 1-row) | Residual specificity must use **same** list↔get↔mutate resolver family |
| Work-sites / work-shifts / punch | Existing ATT resolvers | **Cite RETAIN** |
| late_early list/detail | Existing request scope | **Cite** · ≠ mode |
| Sheet funnel lines | Sheet header company scope | List id → detail under `main` = **scope_parity** gate |

**Flag:** If residual ADD introduces dept/shift keys, sa API **MUST** document list=get=mutate parity — else `scope_parity` defect.

---

## 8. Traceability (requirement → physical → API → FE → test)

| BR/AC | Physical | API | FE / J-* | Evidence expect |
|-------|----------|-----|----------|-----------------|
| BR-BP-SHF-02 · AC-ATT-02-MODE/XOR | residual mode+bands | F-ATT-RULE-01 physical `/attendance/*` | **J-HRM-ATT-02-01/02** DRAFT | One mode · reject mixed · F5 |
| AC-ATT-02-SCOPE | residual specificity | same family | **J-HRM-ATT-02-01** | dept+shift > … |
| AC-ATT-02-SRC | work-sites + flags | F-ATT-PUNCH-01 · F-ATT-CAT-WS | **J-HRM-ATT-02-03** | valid source only |
| AC-ATT-02-EVAL/OFF | `late_penalty_hours` + off | F-ATT-RULE-01 + sheet cite | **J-HRM-ATT-02-03/04** | funnel · off=0 · ≠ PAY |
| AC-ATT-02-≠-LER | `late_early_requests` | attendance-requests | **J-HRM-ATT-02-05** DRAFT | ≠ mode DONE |
| AC-ATT-02-PATH | Nest `/attendance` | paper `/att`+`/core` alias | all J-* | Nest `/core` **0** |
| AC-ATT-02-MK-* / H / PAY-OUT | seals | — | footer | PLT/CORE ≠ DONE · printable false · C-SLICE |

---

## 9. Unlock next — sa API-01

| | |
|--|--|
| **next_owner** | **sa** |
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01` |
| **Mission** | F.1 **RETAIN cite** **F-ATT-RULE-01** physical prefer `/api/hrm/attendance/rules*` (+ residual late-penalty same family) · paper `/att` + `/core` **alias only** · cite this DATA-01 physical prefer · residual wire **ONLY if** closable gap (mode/bands/scope/off display-ready) · **DENY** Nest dual · invent PAY/printable · claim CFG=DONE · ATT UAT · seed · apps/** |
| **cấm** | Dev invent migrate before API F.1 · Nest `/core` SoT · wipe PLT/CORE · honesty flip |

---

## Footer — honesty

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-02 DONE** · round/`notify_late`/đơn ≠ FR-02 DONE · ≠ ATT module UAT · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · must_keep PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · no apps/**

---

## Handoff contract

```yaml
work_item_id: PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01
from_role: ba-data
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md
completion_report: |
  CONFIRMED HOLD — LIVE attendance_rules / work-sites / work_shifts / late_early_requests /
  late_penalty_hours RETAIN; residual ADD stamped closable for mode|bands|scope|off
  (ABSENT PROVEN · prefer extend rules/specificity ≡ att_attendance_rule · NO migrate this seat);
  display-ready cite mode·modeLabelVi·bands[]·scope·sourceFlags·latePenaltyEnabled·latePenaltyHours;
  must_keep PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false ·
  CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY; DENY wipe peers · invent PAY/printable/Word DONE ·
  claim ATT UAT · CFG alone DONE · honesty flip · reopen sealed J-* · seed · apps/**.
next_owner: sa
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01
  role: sa
  program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-25 seat #27)
  entry_criteria: DATA-01 CONFIRMED HOLD @ docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md · BA O1–O12 · SA Option A · residual ADD mode/bands/scope/off stamped closable · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · PAY OUT
  read_first:
    - docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md
    - docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md
    - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-RULE-01
  exit_criteria: API-01 F.1 RETAIN cite F-ATT-RULE-01 physical /api/hrm/attendance/rules* (+ residual late-penalty same family) · paper /att+/core alias only · display-ready mode·bands·scope·source·late_penalty_hours · residual wire ONLY if closable · DENY Nest /core dual · DENY invent PAY/printable/Word · DENY claim CFG=ATT-02 DONE · DENY ATT UAT · DENY seed · DENY apps/** · evidence docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md · PASS_TO_PM
  cấm: apps/** · seed · Nest /core invent · wipe PLT/CORE · honesty flip · claim ATT module UAT · invent PAY/printable DONE · migrate invent before F.1 lock
```
