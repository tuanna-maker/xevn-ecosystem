# PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN pending_days hold spine (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-27 seat **#29**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE `public.employee_leave_balances.pending_days` / `used_days` / `entitled_days` · `public.leave_requests` · `lockPendingLeaveBalance` / `settleApprovedLeaveBalance` / `releasePendingLeaveBalance` · leave-balance/panel · **NO** invent `att_leave_hold` dual · **NO** Nest `/core` table dual · **NO** wipe ATT-08/02/PLT/CORE · **NO** wipe soft≠CORE-06 DONE · **NO** invent PAY / printable / Word DONE · **NO CODE** `apps/**` · **no seed** · **preserve_default** · soft/type **HOLD** (ADD residual **ONLY if** closable gap proven — **not** proven this seat) |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — paper **held** = LIVE **`pending_days`** · leave TXN + lock/settle/release **RETAIN** · panel balance **RETAIN** · soft/type **HOLD** (no ADD stamp) · unlock **sa API-01** F.1 **F-ATT-LEAVE-02/03** physical `/api/hrm/attendance/*` — residual wire **ONLY if** closable · **PAY OUT invent DONE** · **printable false RETAIN** · **≠ ATT-09 DONE** from soft create alone · **≠** ATT-08 preview = ATT-09 DONE · **client-days≠ATT-08 DONE** · **≠ ATT UAT** · **CFG≠ATT-02 DONE** |
| **uc_ids** | `UC-BP-ATT-09` · `FR-UC-BP-ATT-09` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · **R-ATT-09-HOLD/SETTLE/PANEL/SOFT/TYPE/GĐ1/DISP** · **R-ATT-09-≠-*** · **R-ATT-09-PAY-OUT** · printable false · QC ATT-08 **`ATT08QC1-MSLSL36C`** (preview · T6→T2=2 · HOL-MISS · ALIGN · **R-ATT-08-PREVIEW-FE CLOSED**) · **`ATT02QC1-MSLQZUK7`** · **`PLT01QC1-MSLPUQIU`** · **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · **`CORE07QC1-KZJTSHNT`** · soft≠DONE · Nest `/core` DENY · client-days≠ATT-08 DONE · ≠ ATT UAT · PAY invent DONE **OUT** |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md) · O1–O12 · AC-ATT-09-* · R-ATT-09-* |
| **ref_att08_data** | [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md) — stamp `ATT08QC1-MSLSL36C` · preview RETAIN · client-days≠DONE |
| **ref_att02_data** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md) — stamp `ATT02QC1-MSLQZUK7` · CFG≠DONE |
| **ref_plt_data** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md) — stamp `PLT01QC1-MSLPUQIU` |
| **ref_core10_data** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md) — stamp `CORE10QC1-MSLP0EJB` |
| **ref_core09_data** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md) — printable **false** · ≠ CORE-09 DONE |
| **ref_core07_data** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md) — GATE/ACT · Nest `/core` DENY |
| **ref_paper_db** | paper `leave_balances.held` / `att_leave_hold` / `held_units` = **alias only** → LIVE **`employee_leave_balances.pending_days`** · **DENY invent dual** · Nest `@Controller('core')` **ABSENT** |
| **ref_paper_api** | **F-ATT-LEAVE-02** (submit + hold) · **F-ATT-LEAVE-03** (approve consume / reject release) · peer **F-ATT-LEAVE-01** preview (**must_keep ATT-08** · ≠ ATT-09 DONE) · leave-balance/panel · Nest `@Controller('core')` **ABSENT** · paper `/att/*` + `/core` **alias only** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-09** · Diễn biến **#0a–#6 + Thành công** · **BR-BP-LV-06** · **BR-BP-LV-05** peer · **GĐ1 = một QL trực tiếp** |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/*` · paper `/att` + `/core` alias only · U19 · soft-delete · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` |
| **ref_code_cite** | `attendance.controller` `@Controller('attendance')` · `POST leave-requests` · `POST …/approve\|reject\|cancel` · `GET leave-balance` + `…/panel` · `LeaveRequestsService.lockPendingLeaveBalance` / `settleApprovedLeaveBalance` / `releasePendingLeaveBalance` · `assertSufficientLeaveBalance` · `assertNoLeaveOverlap` · `employee_leave_balances.pending_days` PRESENT · `att_leave_hold` table **ABSENT** · Nest `@Controller('core')` **ABSENT** (grep 2026-08-09) — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim soft create = ATT-09 DONE · **DENY** claim ATT-08 preview = ATT-09 DONE · **DENY** claim client-days=ATT-08 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** CFG=ATT-02 DONE · **DENY** invent `att_leave_hold` · honesty flip |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| **Hold SoT** | **HOLD RETAIN** — LIVE **`public.employee_leave_balances.pending_days`** = paper **held** / `held_units` / `att_leave_hold` — **DENY invent dual ledger** |
| Leave TXN spine | **HOLD RETAIN** Nest **`public.leave_requests`** on **`POST/GET /api/hrm/attendance/leave-requests*`** (+ approve/reject/cancel) — **≠** FR-09 DONE from soft alone · **DENY wipe** |
| Hold / settle / release | **HOLD RETAIN** `lockPendingLeaveBalance` · `settleApprovedLeaveBalance` · `releasePendingLeaveBalance` — BR-BP-LV-06 spine |
| Balance / panel | **HOLD RETAIN** **`GET …/leave-balance`** + **`…/panel`** — `available = entitled − used − pending` — **≠** ATT-05b / ATT module UAT · PAY **OUT invent DONE** |
| **R-ATT-09-HOLD** | **HOLD** AC harden — tracked create **must** `pending_days +=` before 2xx · **no** schema invent |
| **R-ATT-09-SETTLE** | **HOLD** — approve pending→used · reject/cancel release **100%** · **no** new table |
| **R-ATT-09-PANEL** | **HOLD** — panel F5 AC · display-ready cite · **no** schema invent |
| **R-ATT-09-SOFT** | **HOLD** — untracked = **no row** (LIVE presence) · **no** ADD flag col proven · **≠** soft = FR-09 DONE |
| **R-ATT-09-TYPE** | **HOLD** — chặn đổi loại when pending = **policy/wire** · PATCH re-hold **ABSENT** · **no** ADD schema stamped (closable typed gap **not** proven) |
| **R-ATT-09-GĐ1 / DISP** | **HOLD** — no approval-ladder table · display-ready DTO cite |
| **R-ATT-09-≠-*** / PAY / HONESTY / PRINTABLE | **INFO honesty locks** |
| Nest path | Physical `/api/hrm/attendance/*` · Nest `@Controller('core')` **ABSENT** · paper `/att` + `/core` **alias only** |
| ATT-08 | **must_keep** · stamp **`ATT08QC1-MSLSL36C`** · preview · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED · client-days≠DONE · **≠** claim ATT-08 = ATT-09 DONE |
| ATT-02 | **must_keep** · stamp **`ATT02QC1-MSLQZUK7`** · **CFG≠ATT-02 DONE** · ≠ ATT UAT |
| PLT-01 | **must_keep** · stamp **`PLT01QC1-MSLPUQIU`** · peer≠PLT DONE · merge≠platform UAT |
| CORE-10 | **must_keep** · stamp **`CORE10QC1-MSLP0EJB`** · ≠ CORE-10 DONE |
| CORE-09 printable | **must_keep** · stamp **`CORE09QC1-MSLNBA89`** · printable **false** · ≠ CORE-09 DONE |
| CORE-07 GATE/ACT | **must_keep** · stamp **`CORE07QC1-KZJTSHNT`** · Nest DENY · soft≠CORE-06 DONE |
| PAY / printable / Word | **OUT invent DONE** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim soft/ATT-08=ATT-09 DONE · ATT UAT · CFG=ATT-02 · PLT/CORE DONE |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `held` / `held_units` / `att_leave_hold` | LIVE **`employee_leave_balances.pending_days`** | **HOLD RETAIN** · **DENY invent dual** |
| F-ATT-LEAVE-02 submit + hold | **`POST /api/hrm/attendance/leave-requests`** → `lockPendingLeaveBalance` | **HOLD RETAIN** · ≠ soft = FR-09 DONE |
| F-ATT-LEAVE-03 approve / reject / cancel | **`POST …/approve\|reject\|cancel`** → settle / release | **HOLD RETAIN** |
| Leave balance / panel | **`GET …/leave-balance*`** / panel → entitled / used / pending / available | **HOLD RETAIN** · PAY OUT |
| F-ATT-LEAVE-01 preview | **`POST …/preview-deduction`** | **must_keep ATT-08** · **≠** ATT-09 DONE · **≠** wipe |
| Soft no-row | Absence of balance row | **HOLD** · tracked XOR untracked via **row presence** · **no** ADD flag |
| Type-change when pending | Block PATCH leave_type | **HOLD** policy/wire · **no** ADD schema · DENY invent re-hold dual |
| Nest `/core` leave/hold table | — | **DENY invent** |
| Paper `/core` / `/att` | Alias only | **DENY** Nest dual SoT |
| ATT-08 / ATT-02 / PLT / CORE peers | seals | **must_keep** · ≠ claim DONE |

```text
  public.employee_leave_balances (LIVE — HOLD RETAIN · hold SoT)
        RETAIN: company_id · employee_id · leave_type · balance_year ·
                entitled_days · used_days · pending_days (= paper held)
        available = entitled − used − pending
        ABSENT PROVEN: att_leave_hold table / second hold ledger (grep 2026-08-09)
        DENY invent dual att_leave_hold
                │
                │ TXN (HOLD RETAIN)
                ▼
  public.leave_requests
        create → lockPendingLeaveBalance (pending +=) when row PRESENT
        approve → settleApprovedLeaveBalance (pending −= · used +=)
        reject|cancel → releasePendingLeaveBalance (pending −= · 100%)
                │
                │ Physical API (HOLD RETAIN)
                ▼
  POST /api/hrm/attendance/leave-requests
  POST …/leave-requests/:id/approve|reject|cancel
  GET  …/leave-balance · …/leave-balance/panel
  POST …/leave-requests/preview-deduction   (must_keep ATT-08 · ≠ ATT-09 DONE)
  Paper /att/… + /core/… = ALIAS ONLY

  Soft no-row: no employee_leave_balances row → lock no-op · ≠ FR-09 DONE
  Type-block: HOLD policy (chặn đổi loại pending) · no ADD schema stamped

  Display-ready DTO (cite · HOLD schema until Dev after API):
        pending · available · used · held (=pending alias) · statusLabelVi
        (+ request_id · status · entitled? · deductible_units? · leave_type · leave_type_label)

  ATT08QC1-MSLSL36C preview RETAIN · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU ·
  CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT ·
  soft≠CORE-06 · Nest /core DENY
        SEALED must_keep

  FORBIDDEN GĐ1 this seat:
        Invent att_leave_hold dual · Nest /core dual
        Wipe LIVE leave_requests / balances / lock/settle/release / panel
        Wipe ATT-08/02/PLT/CORE · invent PAY/printable/Word DONE
        Claim soft/ATT-08=ATT-09 DONE · client-days=ATT-08 DONE · ATT UAT
        Claim CFG=ATT-02 DONE · PLT/CORE DONE · honesty flip · reopen sealed J-*
        Seed · apps/**
```

**Label lock:** Board «Giữ chỗ quỹ phép khi nộp & duyệt» GĐ1 = **LIVE `pending_days` hold + leave TXN + panel RETAIN** — **not** invent `att_leave_hold` · **not** Nest `/core` dual · **not** soft create = FR-09 DONE.  
**Spine lock:** Physical `/api/hrm/attendance/*` — **DENY** Nest `/core` second SoT · paper `/att`+`/core` alias only.  
**Hold SoT lock:** **`pending_days`** = paper held — **DENY** dual ledger.  
**Honesty lock:** `attendance_uat_ready=false` · printable false · C-SLICE · PAY OUT · soft≠ATT-09 DONE · ATT-08≠ATT-09 DONE · client-days≠ATT-08 DONE · CFG≠ATT-02 DONE.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-09 DONE** · soft create alone ≠ FR-09 DONE · ≠ ATT-08 preview = ATT-09 DONE · client-days≠ATT-08 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · DENY invent `att_leave_hold` · must_keep ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · no apps/**

---

## 3. AS-IS baseline (Nest facts — read-only cite · 2026-08-09)

| Object | AS-IS LIVE | Gap (Wave-27 DATA) |
|--------|------------|---------------------|
| **`public.employee_leave_balances.pending_days`** | HOLD ledger PRESENT | **HOLD RETAIN** = paper held · **DENY** invent `att_leave_hold` |
| **`used_days` / `entitled_days`** | LIVE | **HOLD RETAIN** · settle / available math |
| **`lockPending` / `settle` / `release`** | PRESENT on create/approve/reject/cancel | **HOLD RETAIN** · AC harden residual (no schema) |
| **`public.leave_requests`** | LIVE TXN | **HOLD RETAIN** · ≠ FR-09 DONE from soft alone |
| **leave-balance / panel** | `available = entitled−used−pending` | **HOLD RETAIN** · F5 AC · PAY OUT |
| Soft no-row | assert + lock **no-op** when no row | **HOLD** · ≠ soft = DONE · **no** ADD flag proven |
| Type-change re-hold | PATCH re-hold **ABSENT** | **HOLD** block policy · **no** ADD schema stamped |
| `att_leave_hold` table | **ABSENT** (docs alias only) | **DENY invent** |
| Paper F-ATT-LEAVE-02/03 / `/core` | Nest named `/att/…` + `@Controller('core')` **ABSENT** | **alias only** · **DENY invent** dual |
| ATT-08 preview | SEALED `ATT08QC1-MSLSL36C` | **must_keep** · ≠ ATT-09 DONE |
| ATT-02 / PLT / CORE-10/09/07 | SEALED stamps | **must_keep** · **DENY wipe** |
| ATT-04b / ATT-10 / PAY deepen | QUEUED | **OUT invent DONE** |

**FORBIDDEN invent this seat:** invent `att_leave_hold` dual · wipe LIVE spines · Nest `/core` dual · invent PAY/printable/Word DONE · claim soft/ATT-08=ATT-09 DONE · claim client-days=ATT-08 DONE · claim ATT UAT · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · seed · honesty flip · apps/** · reopen sealed J-HRM-ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01.

---

## 4. HOLD dispositions (normative)

### 4.1 Hold SoT — **HOLD RETAIN** (mission §1)

| Physical | Rule |
|----------|------|
| `employee_leave_balances.pending_days` | **HOLD RETAIN** = paper **held** · map `held_units` → `pending_days` |
| Invent `att_leave_hold` / second ledger | **DENY** (**R-ATT-09-≠-DUAL** · O1) |
| `used_days` / `entitled_days` | **HOLD RETAIN** |

### 4.2 Leave TXN + lock/settle/release — **HOLD RETAIN** (mission §2)

| Physical | Rule |
|----------|------|
| `leave_requests` create/approve/reject/cancel | **HOLD RETAIN** · ≠ FR-09 DONE from soft alone |
| `lockPendingLeaveBalance` | **HOLD RETAIN** — tracked must pending↑ before 2xx |
| `settleApprovedLeaveBalance` | **HOLD RETAIN** — pending→used |
| `releasePendingLeaveBalance` | **HOLD RETAIN** — hoàn **100%** · DENY partial invent |

### 4.3 Panel balance — **HOLD RETAIN** (mission §3)

| Physical | Rule |
|----------|------|
| `GET leave-balance` / `…/panel` | **HOLD RETAIN** |
| Math | `available = entitled − used − pending` |
| Explicit ≠ | **≠** ATT-05b / ATT module UAT · PAY **OUT invent DONE** |

### 4.4 Soft / type — **HOLD** (mission §4 · no ADD stamp)

| Residual | Ruling |
|----------|--------|
| **R-ATT-09-SOFT** | **HOLD** — tracked = row **PRESENT** · untracked = **no row** · LIVE no-op · **≠** soft = FR-09 / ATT-09 DONE · closable typed flag col **NOT proven** → **no ADD** |
| **R-ATT-09-TYPE** | **HOLD** — GĐ1 **chặn** đổi loại khi pending · prefer wire/guard · full release+re-lock **OUT** · closable schema gap **NOT proven** → **no ADD** |
| Reopen ADD | Only if later seat **proves** closable typed gap — prefer LIVE semantics first |

### 4.5 Display-ready DTO — cite (mission §5)

| DTO field | Source / derive | Rule |
|-----------|-----------------|------|
| `pending` / `pending_days` | LIVE pending | **display-ready** · panel after submit ↑ |
| `held` / `held_units` | **alias** → `pending_days` | Map paper held · **DENY** second SoT |
| `available` / `available_days` | entitled − used − pending | Panel after hold ↓ |
| `used` / `used_days` | LIVE used | After approve ↑ |
| `statusLabelVi` / `status_label` | request status VI | After mutate |
| `request_id` · `status` · `leave_type` · `leave_type_label` · `deductible_units?` · `entitled?` | LIVE / ATT-08 peer | Cite · HOLD invent col |

**Residual wire:** sa API may stamp envelope fidelity **ONLY if** closable gap — prefer physical F-ATT-LEAVE-02/03 cite · **HOLD** schema invent until API locks DTO.

### 4.6 ATT-08 / ATT-02 / PLT / CORE seals · Nest `/core` — **RETAIN** (mission §6)

| Stamp | Rule |
|-------|------|
| **`ATT08QC1-MSLSL36C`** | **must_keep** · preview physical · T6→T2=2 · HOL-MISS · ALIGN · **R-ATT-08-PREVIEW-FE CLOSED** · client-days≠ATT-08 DONE · ≠ ATT UAT · Nest `/core` leave 0 · **≠** claim ATT-08 = ATT-09 DONE · **≠** wipe |
| **`ATT02QC1-MSLQZUK7`** | **must_keep** · **CFG≠ATT-02 DONE** · ≠ ATT UAT · Nest `/core` ATT 0 |
| **`PLT01QC1-MSLPUQIU`** | **must_keep** · peer≠PLT DONE · merge≠platform UAT |
| **`CORE10QC1-MSLP0EJB`** | **must_keep** · ≠ CORE-10 DONE |
| **`CORE09QC1-MSLNBA89`** | printable **false RETAIN** · ≠ CORE-09 DONE |
| **`CORE07QC1-KZJTSHNT`** | GATE/ACT · Nest DENY · ≠ CORE-07 DONE |
| soft≠CORE-06 DONE | **RETAIN** |
| Nest `@Controller('core')` | **ABSENT** · paper alias only · **DENY invent** |

### 4.7 DENY inventory (mission §7)

| DENY | Why |
|------|-----|
| Invent `att_leave_hold` dual ledger | Hold SoT = `pending_days` only |
| Wipe ATT-08/02/PLT/CORE-10/09/07/06/05/03/02B/09D..01 | must_keep seals |
| Invent PAY/printable/Word DONE | OUT invent · printable false |
| Claim soft create alone = ATT-09 / FR-09 DONE | O3/O12 |
| Claim ATT-08 preview = ATT-09 DONE | O6 |
| Claim client `total_days` / calendar = ATT-08 DONE | O10 · must_keep peer |
| Claim ATT module UAT / CFG=ATT-02 DONE | O10/O12 · C-SLICE |
| Claim PLT/CORE DONE | must_keep honesty |
| Nest `/core` dual / honesty flip / reopen sealed J-* | Option A · preserve |
| Seed / `apps/**` | U65 · docs-only |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-09 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · C-SLICE · `attendance_uat_ready=false` · client-days≠ATT-08 DONE · CFG≠ATT-02 DONE

---

## 5. Validation matrix (data integrity — HOLD)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-ATT-09-DATA-01 | Paper held / att_leave_hold cite | Map → `pending_days` | **no** second ledger |
| VAL-ATT-09-DATA-02 | Tracked balance · submit N | `pending_days += N` · available↓ | FAIL if 2xx without pending↑ |
| VAL-ATT-09-DATA-03 | Approve after hold | pending−= · used+= | settle math |
| VAL-ATT-09-DATA-04 | Reject / cancel after hold | pending−= · used unchanged · available hoàn **100%** | FAIL partial release |
| VAL-ATT-09-DATA-05 | Soft no-row create | Allow without hold | Footer **≠ soft = ATT-09 DONE** |
| VAL-ATT-09-DATA-06 | Panel after submit | pending↑ · available↓ · F5 | Nest `/core` 0 |
| VAL-ATT-09-DATA-07 | Display-ready | pending · available · used · held · statusLabelVi | FE bind cite |
| VAL-ATT-09-DATA-08 | Scope mismatch | U19 list=get=mutate | `HRM-SCOPE-409` / 404 |
| VAL-ATT-09-DATA-09 | Nest `/core` dual / invent att_leave_hold | SoT invent | **FAIL** O1/O9 |
| VAL-ATT-09-DATA-10 | Claim soft/ATT-08=ATT-09 / ATT UAT / client-days=08 / CFG=02 / PAY/printable | evidence footer | **FAIL** honesty |
| VAL-ATT-09-DATA-11 | Diff ATT-08/02/PLT/CORE seals | must_keep | Wipe/reopen/claim DONE = **FAIL** |

---

## 6. Lifecycle (leave hold — HOLD)

| From → To | Legal? | Notes |
|-----------|--------|-------|
| Tracked submit → pending↑ | YES | BR-BP-LV-06 · lockPending |
| Tracked submit without pending↑ | **NO** | FAIL AC · no soft-OK |
| Soft no-row submit | YES (allow) | **≠** FR-09 DONE alone |
| Pending → approve → used | YES | settle |
| Pending → reject/cancel → released | YES | release **100%** |
| Pending → invent att_leave_hold dual | **NO** | DENY |
| Pending → Nest `/core` second SoT | **NO** | DENY dual |
| Soft create → claim ATT-09 DONE | **NO** | honesty |
| Preview ATT-08 → claim ATT-09 DONE | **NO** | must_keep peer |

Invalid transition → deterministic 4xx (not silent wipe / invent dual).

---

## 7. Scope parity (U19)

| Surface | Resolver | Rule |
|---------|----------|------|
| leave-requests list/get/mutate | hrm list-scope TEXT slug family | list **=** get-by-id **=** mutate |
| approve / reject / cancel | same company scope | U19 membership · no cross-CT mutate |
| leave-balance / panel | same family | **HOLD RETAIN** |
| preview-deduction (peer) | same attendance company scope | **must_keep ATT-08** |

**Flag:** If later residual invents hold keys outside `pending_days`, sa API **MUST** document list=get=mutate parity — else `scope_parity` defect. Prefer **no** invent.

---

## 8. Traceability (requirement → physical → test)

| Requirement | Physical | API cite | FE / J-* | Test expect |
|-------------|----------|----------|----------|-------------|
| BR-BP-LV-06 hold | `pending_days +=` | F-ATT-LEAVE-02 | J-HRM-ATT-09-01 | VAL-ATT-09-DATA-02 |
| Hold SoT = held | `pending_days` | paper held alias | J-01 · HOLD-SOT | VAL-ATT-09-DATA-01 |
| Approve consume | settle pending→used | F-ATT-LEAVE-03 | J-HRM-ATT-09-02 | VAL-ATT-09-DATA-03 |
| Reject 100% | release | F-ATT-LEAVE-03 | J-HRM-ATT-09-03 | VAL-ATT-09-DATA-04 |
| Soft ≠ DONE | no-row path | create no-op lock | J-HRM-ATT-09-04 | VAL-ATT-09-DATA-05 |
| Panel F5 | balance/panel | GET panel | J-01 / J-06 | VAL-ATT-09-DATA-06 |
| ATT-08 must_keep | preview-deduction | F-ATT-LEAVE-01 | J-06 seals | VAL-ATT-09-DATA-11 |
| Nest `/core` DENY | ABSENT | physical `/attendance/*` | all J-* | VAL-ATT-09-DATA-09 |
| Honesty | flags false | — | J-06 | VAL-ATT-09-DATA-10 |

---

## 9. Unlock next — sa API-01

| Field | Value |
|-------|--------|
| **next_owner** | **sa** |
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01` |
| **Mission** | F.1 deepen **F-ATT-LEAVE-02/03** physical `/api/hrm/attendance/leave-requests*` (+ approve/reject/cancel) · leave-balance/panel · held→`pending_days` · paper `/att`+`/core` **alias only** · RETAIN peer **F-ATT-LEAVE-01** must_keep · residual wire **ONLY if** closable · **DENY** Nest dual · **DENY** invent `att_leave_hold` · **DENY** invent PAY · **DENY** claim soft/ATT-08=ATT-09 DONE |
| **Dev** | **HOLD** until API CONFIRMED |

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §11 |
| **next_owner** | `sa` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md` |
| **next_dispatch_prompt** | See §12 |

---

## 11. completion_report

**Closed:** ba-data **CONFIRMED HOLD** for UC-BP-ATT-09 / FR-UC-BP-ATT-09 — paper **held** = LIVE **`employee_leave_balances.pending_days`** (**DENY** invent `att_leave_hold` dual); **HOLD RETAIN** `leave_requests` + `lockPending` / `settle` / `release`; **HOLD RETAIN** leave-balance/panel (`available = entitled−used−pending`); soft/type **HOLD** (no ADD stamp — closable schema gap **not** proven; prefer LIVE row presence + wire block type); cite display-ready **pending · available · used · held · statusLabelVi**; **must_keep** ATT08QC1-MSLSL36C preview (T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED) · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · client-days≠ATT-08 DONE · ≠ ATT UAT · PAY OUT; DENY wipe peers · invent PAY/printable/Word · claim soft/ATT-08=ATT-09 DONE · claim ATT UAT · honesty flip · seed · apps/**.

**Residual open (API/FE — not DATA schema):** R-ATT-09-HOLD/SETTLE/PANEL/SOFT/TYPE/GĐ1/DISP AC wire + U65 J-HRM-ATT-09-* — unlock **sa API** F.1 F-ATT-LEAVE-02/03.

---

## 12. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-27 seat #29)
uc_ids: UC-BP-ATT-09 · FR-UC-BP-ATT-09
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA Option A · R-ATT-09-HOLD/SETTLE/PANEL/SOFT/TYPE/GĐ1/DISP · printable false · ATT08QC1-MSLSL36C preview RETAIN (T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED) · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · client-days≠ATT-08 DONE · ≠ ATT UAT · PAY OUT · DENY invent att_leave_hold
spec_ref: F-ATT-LEAVE-02/03 physical prefer POST /api/hrm/attendance/leave-requests* (+ approve|reject|cancel) · GET leave-balance|/panel · paper /att + /core alias only · LIVE pending_days = paper held · DENY invent att_leave_hold dual · must_keep F-ATT-LEAVE-01 preview · BR-BP-LV-06 · display-ready pending·available·used·held·statusLabelVi · ≠ soft=ATT-09 DONE · ≠ ATT-08 preview=ATT-09 DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE

MISSION — API F.1 (docs-only · RETAIN cite · wire residual ONLY if closable):
1) CONFIRM RETAIN F-ATT-LEAVE-02 physical POST /api/hrm/attendance/leave-requests — submit + lockPending on pending_days — paper /att+/core alias only — held→pending_days
2) CONFIRM RETAIN F-ATT-LEAVE-03 physical POST …/approve|reject|cancel — settle pending→used · release 100% — paper alias only
3) CONFIRM RETAIN GET leave-balance + panel — available=entitled−used−pending — display-ready pending·available·used·held·statusLabelVi
4) RETAIN peer F-ATT-LEAVE-01 preview must_keep ATT08QC1-MSLSL36C — ≠ wipe · ≠ claim ATT-08=ATT-09 DONE
5) Residual wire ONLY if closable gap (HOLD/SETTLE/PANEL/SOFT/TYPE/GĐ1/DISP) — HOLD invent Nest /core · HOLD invent att_leave_hold · HOLD invent PAY endpoints
6) RETAIN ATT-08/02/PLT/CORE seals · Nest /core DENY · soft≠CORE-06 · printable false · client-days≠ATT-08 DONE · ≠ ATT UAT · PAY OUT
7) DENY wipe peers · invent att_leave_hold dual · invent PAY/printable/Word DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · honesty flip · reopen sealed J-* · seed · apps/**
8) Unlock next prefer FE+QA U65 J-HRM-ATT-09-01..06 DRAFT — Dev-BE optional wire-only AFTER API CONFIRMED

exit: docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md · PASS_TO_PM · next FE/QA (or Dev wire-only if closable)
cấm: apps/** · seed · Nest /core dual invent · invent att_leave_hold dual · wipe ATT-08/02/PLT/CORE · honesty flip · claim ATT module UAT · invent PAY/printable/Word DONE · claim soft/ATT-08=ATT-09 DONE
```

---

*End DATA-01 · CONFIRMED HOLD · 2026-08-09*
