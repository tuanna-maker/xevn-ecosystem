# PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01 — API F.1 · F-ATT-LEAVE-02/03 RETAIN cite + leave-balance/panel (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-27 seat **#29**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-ATT-LEAVE-02** submit+hold · **F-ATT-LEAVE-03** approve/reject/cancel settle/release · **GET leave-balance** + **panel** · peer **F-ATT-LEAVE-01** preview **must_keep ATT-08** · paper `/att/*` + `/core` **alias only** · Nest `@Controller('core')` **DENY** · paper **held** → LIVE **`pending_days`** · **DENY invent `att_leave_hold` dual** · **ADD residual wire ONLY if** closable gap proven (DATA-01: **NOT proven**) · **prefer FE+QA** · **must_keep** **`ATT08QC1-MSLSL36C`** · **`ATT02QC1-MSLQZUK7`** CFG≠DONE · **`PLT01QC1-MSLPUQIU`** · **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · **OUT invent** PAY / printable / Word DONE · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** · **no schema invent** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED RETAIN** — F.1 physical Option A · LIVE leave create/approve/reject/cancel + `lockPending` / `settle` / `release` + leave-balance/panel **HOLD RETAIN** · display-ready **PRESENT** (`pending_days`·`available_days`·`used_days`·`status_label` · paper `held`=`pending_days` alias) · closable BE wire/schema gap **NOT proven** (DATA-01 soft/type HOLD) → **HOLD** invent Nest dual / `att_leave_hold` · unlock **prefer FE + QA** U65 **J-HRM-ATT-09-01..06 DRAFT** · **Dev-BE HOLD** unless FE proves thin envelope/type-block gap · **DENY** Nest `/core` · invent PAY/printable · claim soft/ATT-08=ATT-09 DONE · ATT module UAT · CFG=ATT-02 DONE |
| **uc_ids** | `UC-BP-ATT-09` · `FR-UC-BP-ATT-09` |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · **R-ATT-09-HOLD/SETTLE/PANEL/SOFT/TYPE/GĐ1/DISP** · **R-ATT-09-≠-*** · **R-ATT-09-PAY-OUT** · printable **false** · QC ATT-08 **`ATT08QC1-MSLSL36C`** (preview · T6→T2=2 · HOL-MISS · ALIGN · **R-ATT-08-PREVIEW-FE CLOSED**) · **`ATT02QC1-MSLQZUK7`** · **`PLT01QC1-MSLPUQIU`** · **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · **`CORE07QC1-KZJTSHNT`** · soft≠DONE · Nest `/core` DENY · client-days≠ATT-08 DONE · ≠ ATT UAT · PAY invent DONE **OUT** · DENY invent `att_leave_hold` |
| **ref_data** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md) — HOLD RETAIN `pending_days` hold SoT · soft/type HOLD · display-ready cite |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md) · O1–O12 · AC-ATT-09-* · J-HRM-ATT-09-01..06 DRAFT |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-SA-01.md) Option A · BR-BP-LV-06 · paper alias · held→`pending_days` |
| **ref_att08_api** | [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md) — stamp `ATT08QC1-MSLSL36C` · F-ATT-LEAVE-01 must_keep · client-days≠DONE · ≠ ATT-09 DONE from preview |
| **ref_att02_api** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md) — stamp `ATT02QC1-MSLQZUK7` · CFG≠DONE |
| **ref_plt_api** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md) — `PLT01QC1-MSLPUQIU` |
| **ref_core10_api** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md) — `CORE10QC1-MSLP0EJB` |
| **ref_core09_api** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md) — printable **false** · ≠ CORE-09 DONE |
| **ref_core07_api** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md) — GATE/ACT · Nest DENY |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-09** · Diễn biến **#0a–#6 + Thành công** · **BR-BP-LV-06** · **BR-BP-LV-05** peer · **GĐ1 = một QL trực tiếp** |
| **ref_paper_api** | **F-ATT-LEAVE-02** · **F-ATT-LEAVE-03** · peer **F-ATT-LEAVE-01** · leave-balance/panel · Nest `@Controller('core')` **ABSENT** · paper `/att/*` + `/core` **alias only** |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/*` · paper `/att` + `/core` alias only · U19 · soft-delete · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` |
| **ref_code_cite** | `attendance.controller` `@Controller('attendance')` · `POST leave-requests` · `POST …/approve\|reject\|cancel` · `POST …/preview-deduction` · `GET leave-balance` + `…/panel` · `LeaveRequestsService.lockPendingLeaveBalance` / `settleApprovedLeaveBalance` / `releasePendingLeaveBalance` · `assertSufficientLeaveBalance` · `assertNoLeaveOverlap` · `LeaveBalanceService` `available = entitled−used−pending` · `status_label` VI · Nest `@Controller('core')` **ABSENT** · `att_leave_hold` table **ABSENT** — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim soft create alone = ATT-09 DONE · **DENY** claim ATT-08 preview = ATT-09 DONE · **DENY** claim client-days=ATT-08 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** CFG=ATT-02 DONE · **DENY** invent `att_leave_hold` · honesty flip |
| **ba-data** | **ALREADY CONFIRMED HOLD** — this seat **does not** re-open schema invent · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN** |
| **unlock_lane** | **Prefer FE + QA** (RETAIN LIVE · no closable BE wire proven) · **Dev-BE HOLD** invent · optional thin BE **ONLY if** FE proves envelope / type-block gap |

---

## 1. Verdict — **CONFIRMED RETAIN**

| Decision | Stamp |
|----------|--------|
| Hold SoT | **ONE RETAIN** LIVE **`public.employee_leave_balances.pending_days`** = paper **held** / `held_units` / `att_leave_hold` — **DENY invent dual** |
| Leave TXN SoT | **ONE RETAIN** Nest **`public.leave_requests`** on **`POST/GET /api/hrm/attendance/leave-requests*`** (+ approve/reject/cancel) — **≠** FR-09 DONE from soft alone · **DENY wipe** |
| **F-ATT-LEAVE-02** | **RETAIN cite** physical **`POST /api/hrm/attendance/leave-requests`** → `lockPendingLeaveBalance` (`pending_days +=`) when balance row PRESENT |
| **F-ATT-LEAVE-03** | **RETAIN cite** physical **`POST …/leave-requests/:id/approve`** → settle pending→used · **`…/reject`** · **`…/cancel`** → release **100%** |
| Leave balance / panel | **RETAIN cite** **`GET …/leave-balance`** · **`GET …/leave-balance/panel`** — `available = entitled − used − pending` |
| **F-ATT-LEAVE-01** (peer) | **must_keep RETAIN** **`POST …/preview-deduction`** · stamp **`ATT08QC1-MSLSL36C`** · **≠** wipe · **≠** claim ATT-08 = ATT-09 DONE |
| Display-ready DTO | **PRESENT**: `pending_days` · `available_days` · `used_days` · `status_label` (VI) · paper `held` = `pending_days` alias · FE may alias `statusLabelVi` ← `status_label` |
| **R-ATT-09-HOLD/SETTLE/PANEL** | **IN-SCOPE residual AC** — journey U65 · **no** new Nest path required |
| **R-ATT-09-SOFT/TYPE/GĐ1/DISP** | **HOLD** policy/AC · soft no-row ≠ DONE · type-block prefer FE/guard · GĐ1 one manager · DISP FE-bind OK |
| Nest path | Physical `/api/hrm/attendance/*` · Nest `@Controller('core')` **ABSENT** — **DENY invent** |
| Closable gap on LIVE SoT? | **NO schema** · **NO thin wire required** — spine + hold TXN + panel math **PRESENT** · residual = U65 journey fidelity (+ optional type-block if proven) |
| Unlock | **Prefer Dev-FE + QA** · **Dev-BE HOLD** invent · optional thin BE **ONLY if** FE proves envelope/type-block gap later |
| ATT-08 / ATT-02 / PLT / CORE-10/09/07 | **must_keep** stamps · client-days≠ATT-08 DONE · CFG≠ATT-02 DONE · printable **false** · soft≠CORE-06 · Nest DENY |
| PAY / printable / Word | **OUT invent DONE** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim soft/ATT-08=ATT-09 DONE · ATT UAT · CFG=ATT-02 · PLT/CORE DONE |

```text
  FE «Nộp & duyệt phép — giữ chỗ quỹ khi submit» (U65 residual · J-HRM-ATT-09-*)
        │  Network MUST contain /api/hrm/attendance/leave-requests*
        │                  (+ leave-balance|/panel · preview-deduction peer)
        │  DENY Nest /core/* leave-hold SoT
        │  DENY invent att_leave_hold dual · claim soft/ATT-08=ATT-09 DONE
        │  DENY invent PAY/printable/Word · claim ATT module UAT · CFG=ATT-02 DONE
        ▼
  F-ATT-LEAVE-02  POST /api/hrm/attendance/leave-requests
        → lockPendingLeaveBalance (pending_days +=) when tracked
        → BR-BP-LV-06 · Diễn biến #2 · status pending · status_label VI
        │
  F-ATT-LEAVE-03  POST …/leave-requests/:id/approve|reject|cancel
        → settle pending→used · release 100% · Diễn biến #3–#4
        │
  GET leave-balance · leave-balance/panel
        → available = entitled − used − pending
        → display: pending · available · used · held(=pending) · statusLabelVi
        │
  Peer must_keep (≠ ATT-09 DONE)
        F-ATT-LEAVE-01  POST …/preview-deduction   ATT08QC1-MSLSL36C
        │
  Residual (prefer FE+QA — no BE unlock this seat)
        HOLD/SETTLE/PANEL AC · soft ≠ DONE · TYPE-BLOCK · GĐ1 · DISP bind · F5
        │
        └─► must_keep ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE ·
              PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB ·
              CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT ·
              soft≠CORE-06 · Nest /core DENY · C-SLICE · honesty false · PAY OUT
```

**Invariant ATT-09-PATH (O9):** Submit/approve/reject/cancel/panel Network **MUST** hit physical `/api/hrm/attendance/*` — Nest dual `/core` SoT = **FAIL**.

**Invariant ATT-09-HOLD-SOT (O1):** Paper `held` / `att_leave_hold` = **`pending_days`** — invent dual ledger = **FAIL**.

**Invariant ATT-09-HOLD (O2 / BR-BP-LV-06):** Tracked balance + create **2xx without** `pending_days` increase = **FAIL**.

**Invariant ATT-09-SETTLE (O4):** Approve without pending→used · reject/cancel without **100%** release = **FAIL**.

**Invariant ATT-09-≠-SOFT-DONE (O3/O12):** Claim soft no-row create alone = FR-UC-BP-ATT-09 / ATT-09 DONE = **FAIL**.

**Invariant ATT-09-≠-08-DONE (O6):** Claim ATT-08 preview seal alone = ATT-09 DONE / wipe preview = **FAIL**.

**Invariant ATT-09-≠-CLIENT-08 (O10):** Claim client `total_days` / calendar = ATT-08 DONE = **FAIL**.

**Invariant ATT-09-≠-UAT (O12):** Claim ATT module UAT / flip `attendance_uat_ready` = **FAIL**.

**Invariant ATT-09-≠-CFG02 (O10):** Claim CFG = ATT-02 DONE / reopen ATT-02 = **FAIL**.

**Invariant ATT-09-≠-PRINTABLE / PAY-OUT (O11):** Invent PAY/printable/Word DONE = **FAIL**.

**Invariant ATT-09-GĐ1 (O8):** Invent day-threshold multi-level approve as GĐ1 DONE = **FAIL**.

**Invariant ATT-09-U19:** leave-requests list = get-by-id = mutate/approve/reject/cancel · balance/panel same scope family — OOS → 409/404 · not empty-mask.

**Invariant ATT-09-DATA-HOLD:** LIVE spines **HOLD RETAIN** · **DENY** Nest `/core` table dual · **DENY** invent `att_leave_hold`.

**Invariant ATT-09-NO-SEED (O12):** Seed fake leave/balance for UF = **FAIL** U65.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-09 DONE** · soft create alone ≠ FR-09 DONE · ≠ ATT-08 preview = ATT-09 DONE · client-days≠ATT-08 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · DENY invent `att_leave_hold` · must_keep ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · no apps/**

---

## 2. AS-IS Nest baseline → residual gap

| Surface | LIVE (read-only cite 2026-08-09) | Gap vs F.1 this seat |
|---------|----------------------------------|----------------------|
| `POST /attendance/leave-requests` | LIVE · `lockPendingLeaveBalance` when row PRESENT | **RETAIN** · AC harden BR-BP-LV-06 · **≠** soft = FR-09 DONE |
| `POST …/approve` | LIVE · `settleApprovedLeaveBalance` | **RETAIN** · R-ATT-09-SETTLE AC |
| `POST …/reject` · `…/cancel` | LIVE · `releasePendingLeaveBalance` 100% | **RETAIN** · R-ATT-09-SETTLE AC |
| `GET leave-balance` · `…/panel` | LIVE · `available = entitled−used−pending` | **RETAIN** · PANEL F5 AC · PAY OUT |
| `POST …/preview-deduction` | LIVE (ATT-08) | **must_keep** · **≠** ATT-09 DONE · **≠** wipe |
| Display-ready | `status_label` VI · `pending_days` · `available_days` · `used_days` | **RETAIN** · FE alias `held`/`statusLabelVi` OK |
| Soft no-row | lock **no-op** when no balance row | **HOLD** · **≠** soft = DONE · no ADD flag |
| Type-change re-hold | PATCH re-hold **ABSENT** | **HOLD** block policy · prefer FE/guard · no ADD schema |
| `att_leave_hold` table | **ABSENT** | **DENY invent** |
| Nest `@Controller('core')` | **ABSENT** · CoreModule = DB export only | **DENY invent** |
| Source cite | `attendance.controller` · `LeaveRequestsService` · `LeaveBalanceService` | Docs-only this seat |

**FORBIDDEN invent this seat (docs):** Nest `@Controller('core')` · invent `att_leave_hold` dual · wipe LIVE spines / ATT-08 preview · invent PAY/printable/Word DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT UAT · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · seed · honesty flip · apps/** · reopen sealed J-*.

---

## 3. Path & alias lock (O1/O9)

| Plane | Path |
|-------|------|
| **PHYSICAL submit (F-ATT-LEAVE-02)** | **`POST /api/hrm/attendance/leave-requests`** |
| **PHYSICAL approve (F-ATT-LEAVE-03)** | **`POST /api/hrm/attendance/leave-requests/:requestId/approve`** |
| **PHYSICAL reject (F-ATT-LEAVE-03)** | **`POST /api/hrm/attendance/leave-requests/:requestId/reject`** |
| **PHYSICAL cancel (F-ATT-LEAVE-03 peer)** | **`POST /api/hrm/attendance/leave-requests/:requestId/cancel`** |
| **PHYSICAL balance / panel** | **`GET /api/hrm/attendance/leave-balance`** · **`GET /api/hrm/attendance/leave-balance/panel`** |
| **PHYSICAL preview (peer must_keep)** | **`POST /api/hrm/attendance/leave-requests/preview-deduction`** |
| **LOGICAL (paper)** | `POST /api/hrm/att/leave-requests` · `…/approve|reject|cancel` · `/api/hrm/core/…` — **alias only** |
| Rule | Client/docs **may** keep paper names; runtime **physical only**. |
| QA Network assert | Path **contains** `/attendance/` — **FAIL O9** if FE hits Nest `/core/*` as leave-hold SoT |

| Paper / logical | Physical | DB (DATA-01) |
|-----------------|----------|--------------|
| F-ATT-LEAVE-02 `/att/…/leave-requests` | **`POST /attendance/leave-requests`** | `leave_requests` + `pending_days +=` |
| F-ATT-LEAVE-03 approve/reject/cancel | **`POST …/approve\|reject\|cancel`** | settle / release on `employee_leave_balances` |
| held / held_units / att_leave_hold | LIVE **`pending_days`** | **alias** · **DENY invent dual** |
| leave-balance / panel | **`GET …/leave-balance*`** / panel | entitled / used / pending / available |
| F-ATT-LEAVE-01 preview | **`POST …/preview-deduction`** | must_keep ATT-08 · ≠ ATT-09 DONE |
| Nest `/core` | — | **DENY invent** |

**Prefer rule (normative):** Dev **MUST NOT** invent Nest `@Controller('core')` or `att_leave_hold` second SoT. Physical remain under **`@Controller('attendance')`**.

---

## 4. F-ATT-LEAVE-02 — F.1 RETAIN cite submit + hold (normative)

### 4.1 Header

| | |
|--|--|
| **Function ID** | **F-ATT-LEAVE-02** |
| **METHOD / path (physical)** | **`POST /api/hrm/attendance/leave-requests`** |
| **Paper alias** | `POST /api/hrm/att/leave-requests` · `/api/hrm/core/…` — **alias only** |
| **change_mode** | **RETAIN cite** LIVE · residual = AC harden BR-BP-LV-06 (no new path) |
| **Table** | `public.leave_requests` INSERT · `public.employee_leave_balances.pending_days` UPDATE when tracked |

### 4.2 Mục đích

Cấp API vật lý để **nhân viên nộp đơn nghỉ phép và giữ chỗ quỹ ngay** (giảm khả dụng) theo **BR-BP-LV-06** / SRS **FR-UC-BP-ATT-09 Diễn biến #2** — khi hệ thống theo dõi quỹ (có dòng `employee_leave_balances`), create **phải** tăng `pending_days` trước khi trả **2xx**; paper **held** = LIVE **`pending_days`** — **không** thay Nest `/core` leave SoT; **không** invent `att_leave_hold` dual; **không** claim soft no-row create = FR-09 / ATT-09 DONE; **không** wipe ATT-08 preview; **không** invent PAY/printable DONE; **không** claim ATT module UAT.

### 4.3 Nghiệp vụ xử lý

1. **AuthZ + U19 scope** — resolve company/slug như LIVE leave-requests family; OOS → `HRM-SCOPE-409` / 404 (không empty-mask).
2. **Validate** — leave_type ∈ EFF (else `HRM-LEAVE-TYPE-UNKNOWN` **before** hold) · range · overlap `assertNoLeaveOverlap` (pending|approved) · VAL-400 on invalid.
3. **Peer preview/ALIGN (must_keep ATT-08)** — when engine ALIGN live, hold consumes engine `deductible_units` / working-day units — **≠** claim ATT-08 = ATT-09 DONE · **≠** wipe preview.
4. **Balance gate** — when tracked, `assertSufficientLeaveBalance` (available = entitled−used−pending); insufficient → **409** (no soft-OK overdraw).
5. **INSERT** leave_request status=`pending` · display-ready `status_label` VI (*Chờ duyệt*).
6. **Hold (BR-BP-LV-06)** — if balance row **PRESENT**: `lockPendingLeaveBalance` → `pending_days +=` units **before** return 2xx · available↓; if **ABSENT** (untracked): lock **no-op** · allow create · **explicit ≠** soft path = FR-09 DONE.
7. **Tracked FAIL path** — create that would return 2xx **without** pending↑ when tracked = **FAIL AC** (R-ATT-09-HOLD).
8. **Response** — display-ready request + cite balance fields when available · Nest `/core` **0**.
9. **DENY** Nest `@Controller('core')` dual · invent `att_leave_hold` · wipe ATT-08/02/PLT/CORE · invent PAY.

### 4.4 Tham chiếu bước SRS

| Bước | SRS | API action |
|------|-----|------------|
| Diễn biến **#0a–#0b** | Loại phép ∈ EFF · điều kiện | leave_type assert · `HRM-LEAVE-TYPE-UNKNOWN` |
| Diễn biến **#1** | Preview ngày trừ (peer) | cite F-ATT-LEAVE-01 · **≠** ATT-09 DONE |
| Diễn biến **#2** | Gửi đơn → **giữ chỗ ngay** | INSERT + `lockPendingLeaveBalance` |
| **BR-BP-LV-06** | Gửi không giữ chỗ khi tracked = không chấp nhận | FAIL if 2xx without pending↑ |
| Diễn biến **#5** | Chồng ngày chặn | `assertNoLeaveOverlap` |
| Thành công | NV thấy khả dụng giảm · đơn chờ duyệt | panel pending↑ available↓ · `status_label` · Nest `/core` **0** |

### 4.5 Request → DB

| DTO (cite) | DB / rule |
|------------|-----------|
| `employee_id` / company scope | U19 membership |
| `leave_type` | ∈ EFF |
| `start_date` / `end_date` | dd/MM/yyyy or ISO · end ≥ start |
| `total_days` / engine units | ALIGN peer ATT-08 when live · hold amount |
| Balance row | PRESENT → tracked hold · ABSENT → soft no-op ≠ DONE |

### 4.6 Response (display-ready — normative)

| Field | Rule |
|-------|------|
| `request_id` / `id` | LIVE leave_requests id |
| `status` | `pending` |
| `status_label` / `statusLabelVi` | VI *Chờ duyệt* — LIVE `status_label` PRESENT · FE alias OK |
| `leave_type` · `leave_type_label` | display-ready |
| `pending_days` / `held` / `held_units` | after hold: pending↑ · paper held = **alias** → `pending_days` |
| `available_days` | entitled − used − pending (panel/balance after submit) |
| `deductible_units?` | ATT-08 ALIGN peer when live |

**Success code cite:** `HRM-LEAVE-201`.

---

## 5. F-ATT-LEAVE-03 — F.1 RETAIN cite approve / reject / cancel (normative)

### 5.1 Header

| | |
|--|--|
| **Function ID** | **F-ATT-LEAVE-03** |
| **METHOD / path (physical)** | **`POST /api/hrm/attendance/leave-requests/:requestId/approve`** · **`…/reject`** · peer **`…/cancel`** |
| **Paper alias** | paper `/att/…` + `/core/…` — **alias only** |
| **change_mode** | **RETAIN cite** LIVE settle/release · residual = AC 100% + panel F5 |
| **Table** | `leave_requests.status` · `employee_leave_balances.pending_days` / `used_days` |

### 5.2 Mục đích

Cấp API vật lý để **quản lý trực tiếp (GĐ1 — một cấp)** **duyệt** đơn (giữ chỗ → đã trừ quỹ) hoặc **từ chối / hủy** (hoàn **100%** chỗ đã giữ) theo SRS **FR-UC-BP-ATT-09 Diễn biến #3–#4** và **BR-BP-LV-06** — **không** invent multi-level duyệt theo số ngày GĐ1; **không** Nest `/core` dual; **không** invent `att_leave_hold`; **không** claim approve alone = ATT module UAT; **không** invent PAY DONE.

### 5.3 Nghiệp vụ xử lý

1. **AuthZ + U19** — same scope family as list/get; OOS → 409/404.
2. **Load request** — must be in actionable state (`pending` for approve/reject; cancel per LIVE rules); wrong state → deterministic 4xx.
3. **Approve** — `settleApprovedLeaveBalance`: `pending_days −=` · `used_days +=` · status approved · `status_label` *Đã duyệt* · panel used↑ available reflects consume.
4. **Reject** — `releasePendingLeaveBalance`: `pending_days −=` **100%** locked units · used unchanged · status rejected · available hoàn đủ · reason required per LIVE DTO.
5. **Cancel** — same release **100%** when pending (or LIVE approved reverse path cite) · **DENY** invent partial release.
6. **GĐ1** — one direct manager enough · **DENY** invent day-threshold ladder as GĐ1 DONE (nước đoạn sau OUT).
7. **Type-change** — GĐ1 **chặn** đổi loại khi pending (prefer FE/guard · HOLD schema) — **DENY** invent full re-hold edit this seat.
8. **DENY** Nest `/core` · invent `att_leave_hold` · invent PAY · wipe peers.

### 5.4 Tham chiếu bước SRS

| Bước | SRS | API action |
|------|-----|------------|
| Diễn biến **#3** | Duyệt → giữ chỗ thành đã trừ | `settleApprovedLeaveBalance` |
| Diễn biến **#4** | Từ chối → hoàn **100%** | `releasePendingLeaveBalance` |
| **BR-BP-LV-06** | Reject hoàn đủ | FAIL if partial release invent |
| GĐ1 | Một QL trực tiếp | approve path · **≠** multi-level DONE |
| Thành công | Panel used/available khớp · F5 | GET panel after mutate |

### 5.5 Response (display-ready)

| Field | Approve | Reject / cancel |
|-------|---------|-----------------|
| `status` / `status_label` | approved / *Đã duyệt* | rejected|cancelled / VI label |
| `pending_days` / held | ↓ (settled) | ↓ (released 100%) |
| `used_days` | ↑ | unchanged |
| `available_days` | reflects consume | hoàn 100% |

**Success codes cite:** approve `HRM-LEAVE-203` · reject `HRM-LEAVE-204` · cancel `HRM-LEAVE-205`.

---

## 6. GET leave-balance + panel — F.1 RETAIN cite (normative)

### 6.1 Header

| | |
|--|--|
| **Function ID** | Leave balance / panel (RETAIN · ATT-05b peer cite · **≠** ATT-05b / ATT module UAT DONE) |
| **METHOD / path (physical)** | **`GET /api/hrm/attendance/leave-balance`** · **`GET /api/hrm/attendance/leave-balance/panel`** |
| **Paper alias** | `/att/…` + `/core/…` — **alias only** |
| **change_mode** | **RETAIN cite** · residual = PANEL F5 AC after submit/approve/reject |

### 6.2 Mục đích

Cấp API vật lý **display-ready** để FE/panel phản ánh quỹ sau giữ chỗ / duyệt / từ chối — `pending` · `available` · `used` · paper `held` · phục vụ hậu điều kiện FR-UC-BP-ATT-09 và **R-ATT-09-PANEL** — **không** claim panel alone = ATT-05b / ATT module UAT; **không** invent PAY DONE từ balance cite.

### 6.3 Nghiệp vụ xử lý

1. **AuthZ + U19** — self-or-HR · same company scope family.
2. **Read** `employee_leave_balances` · map `available_days = max(0, entitled − used − pending)`.
3. **Panel** — multi-type MVP one GET (RETAIN) · after submit: pending↑ available↓ · after approve: used↑ · after reject: pending↓ available hoàn · **F5** còn.
4. **Display-ready** — expose `pending_days` · `available_days` · `used_days` · `entitled_days` · `leave_type_label` · FE may alias `held` ← `pending_days` · `statusLabelVi` from request peer.
5. **PAY OUT** — balance cite **trace-only** · **DENY** invent payroll endpoints/DONE.

### 6.4 Tham chiếu bước SRS

| Bước | SRS | API action |
|------|-----|------------|
| Hậu điều kiện FR-09 | Khả dụng phản ánh hold | GET panel after submit |
| Diễn biến #2 / #3 / #4 | pending↑ · used↑ · hoàn 100% | panel fields match TXN |
| Thành công | F5 còn | U65 J-HRM-ATT-09-* |

### 6.5 Response (display-ready — normative)

```json
{
  "employee_id": "…",
  "leave_type": "annual",
  "leave_type_label": "Phép năm",
  "entitled_days": 12,
  "used_days": 2,
  "pending_days": 1,
  "held": 1,
  "available_days": 9,
  "statusLabelVi": "Chờ duyệt"
}
```

| Field | Rule |
|-------|------|
| `pending_days` / `pending` | LIVE pending — after submit ↑ |
| `held` / `held_units` | **alias** → `pending_days` · **DENY** second SoT |
| `available_days` / `available` | entitled − used − pending |
| `used_days` / `used` | after approve ↑ |
| `statusLabelVi` / `status_label` | from request VI · FE alias OK |

**Success codes cite:** `HRM-LEAVE-BAL-200` · panel `HRM-LEAVE-BAL-PANEL-200`.

---

## 7. Peer F-ATT-LEAVE-01 — must_keep ATT-08 (normative)

| | |
|--|--|
| **Function ID** | **F-ATT-LEAVE-01** (peer · **≠** this seat primary) |
| **Physical** | **`POST /api/hrm/attendance/leave-requests/preview-deduction`** |
| **Seal** | **`ATT08QC1-MSLSL36C`** · T6→T2=2 · HOL-MISS · ALIGN · **R-ATT-08-PREVIEW-FE CLOSED** |
| **Rule** | **must_keep RETAIN** · hold may consume engine units when ALIGN live · **DENY wipe** · **DENY** claim preview alone = ATT-09 DONE · **DENY** claim client-days = ATT-08 DONE |
| **Paper alias** | `/att/…` + `/core/…` alias only · Nest `/core` DENY |

---

## 8. Residuals & unlock lane

| Residual | Disposition | Unlock |
|----------|-------------|--------|
| **R-ATT-09-HOLD** | AC harden tracked must pending↑ | **FE+QA** journey evidence |
| **R-ATT-09-SETTLE** | approve consume · reject/cancel 100% | **FE+QA** |
| **R-ATT-09-PANEL** | panel F5 pending/available/used | **FE+QA** |
| **R-ATT-09-SOFT** | untracked allow · ≠ DONE footer | **FE+QA** · honesty |
| **R-ATT-09-TYPE** | chặn đổi loại pending | prefer **FE guard** · BE thin **ONLY if** closable wire proven |
| **R-ATT-09-GĐ1** | one manager · ≠ multi-level | **FE+QA** · DENY invent ladder |
| **R-ATT-09-DISP** | bind pending·available·used·held·statusLabelVi | **FE** · LIVE PRESENT |
| Nest `/core` / `att_leave_hold` / PAY | **DENY invent** | — |

**Closable BE wire?** DATA-01: soft/type **HOLD** · schema gap **NOT proven** · LIVE lock/settle/release/panel **PRESENT** → **Dev-BE HOLD** invent this unlock · **prefer FE-01 + QA-01**.

---

## 9. Error taxonomy (RETAIN cite)

| Code / HTTP | When |
|-------------|------|
| `HRM-LEAVE-201/203/204/205` | Success create/approve/reject/cancel |
| `HRM-LEAVE-PREVIEW-200` | Peer preview (ATT-08) |
| `HRM-LEAVE-BAL-200` / `HRM-LEAVE-BAL-PANEL-200` | Balance / panel |
| `HRM-LEAVE-TYPE-UNKNOWN` | leave_type ∉ EFF — **before** hold |
| `409` insufficient balance | tracked overdraw |
| Overlap conflict 4xx | `assertNoLeaveOverlap` |
| `HRM-SCOPE-409` / 404 | U19 OOS |
| `HRM-VAL-400` | invalid body/range |
| Sealed ATT-08 HOL-MISS / ALIGN | peer must_keep |
| Nest `/core` leave-hold SoT | **FAIL O9** |

---

## 10. U19 scope parity

| Surface | Resolver | Rule |
|---------|----------|------|
| leave-requests list/get/create | hrm list-scope TEXT slug family | list **=** get **=** mutate |
| approve / reject / cancel | same company scope | no cross-CT |
| leave-balance / panel | same family | **HOLD RETAIN** |
| preview-deduction | same attendance company scope | **must_keep ATT-08** |

---

## 11. Traceability (requirement → API → test)

| Requirement | API | FE / J-* | Expect |
|-------------|-----|----------|--------|
| BR-BP-LV-06 hold | F-ATT-LEAVE-02 | J-HRM-ATT-09-01 | pending↑ available↓ · FAIL no-hold tracked |
| Approve consume | F-ATT-LEAVE-03 approve | J-HRM-ATT-09-02 | pending→used |
| Reject 100% | F-ATT-LEAVE-03 reject | J-HRM-ATT-09-03 | release 100% |
| Soft ≠ DONE | create no-row | J-HRM-ATT-09-04 | footer ≠ soft=ATT-09 DONE |
| Panel F5 | GET panel | J-01 / J-06 | F5 còn · Nest `/core` 0 |
| ATT-08 must_keep | F-ATT-LEAVE-01 | J-06 seals | ≠ wipe · ≠ 08=09 DONE |
| Honesty / PATH | all | J-06 | Nest `/core` 0 · ≠ ATT UAT · CFG≠02 |

---

## 12. must_keep / DENY checklist

| Lock | Rule |
|------|------|
| ATT08QC1-MSLSL36C | RETAIN preview · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED · client-days≠ATT-08 DONE · ≠ ATT UAT · Nest `/core` leave 0 · **≠** claim = ATT-09 DONE |
| ATT02QC1-MSLQZUK7 | RETAIN · **CFG≠ATT-02 DONE** · ≠ ATT UAT |
| PLT01QC1-MSLPUQIU | RETAIN · peer≠PLT DONE · merge≠platform UAT |
| CORE10QC1-MSLP0EJB | RETAIN · ≠ CORE-10 DONE |
| CORE09QC1-MSLNBA89 | printable **false** · ≠ CORE-09 DONE |
| CORE07QC1-KZJTSHNT | GATE/ACT · Nest DENY · soft≠CORE-06 DONE |
| `pending_days` hold spine | **RETAIN** · paper held alias · **DENY** invent `att_leave_hold` |
| Nest `/core` | **DENY** dual · paper alias only |
| PAY / printable / Word | **OUT invent DONE** |
| soft / ATT-08 preview | **≠** ATT-09 DONE |
| Honesty | **DENY** flip · C-SLICE · `attendance_uat_ready=false` |
| apps/** / seed | **CẤM** this seat / U65 |

---

## 13. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §14 |
| **next_owner** | `pm` → **dev-fe** + **qa** (prefer) · Dev-BE HOLD unless closable wire proven |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md` |
| **unlock_lane** | **FE+QA** (RETAIN LIVE) |
| **next_dispatch_prompt** | See §15 |

---

## 14. completion_report

**Closed:** SA API F.1 **CONFIRMED RETAIN** for UC-BP-ATT-09 / FR-UC-BP-ATT-09 — cite **F-ATT-LEAVE-02** physical `POST /api/hrm/attendance/leave-requests` + `lockPendingLeaveBalance` on `pending_days`; **F-ATT-LEAVE-03** physical `POST …/approve|reject|cancel` settle / release **100%**; **GET leave-balance** + **panel** display-ready `pending`·`available`·`used`·`held`(=pending alias)·`statusLabelVi`/`status_label`; peer **F-ATT-LEAVE-01** preview **must_keep** `ATT08QC1-MSLSL36C` (≠ wipe · ≠ ATT-08=ATT-09 DONE); paper `/att`+`/core` **alias only** · Nest `@Controller('core')` **DENY** · paper held→`pending_days` · **DENY** invent `att_leave_hold` dual; must_keep ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · client-days≠ATT-08 DONE · ≠ ATT UAT · PAY OUT; closable BE wire **NOT proven** → unlock **prefer FE+QA**; DENY invent PAY/printable · claim soft/ATT-08=ATT-09 DONE · claim ATT UAT · honesty flip · seed · apps/**.

**Residual open (execution):** R-ATT-09-HOLD/SETTLE/PANEL/SOFT/TYPE/GĐ1/DISP AC via U65 **J-HRM-ATT-09-01..06 DRAFT** — FE bind + QA browser · BE optional thin **ONLY if** FE proves envelope/type-block gap.

---

## 15. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01 (+ QA-01 parallel)
role: dev-fe (+ qa)
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-27 seat #29)
entry_criteria: API-01 CONFIRMED RETAIN @ docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md · DATA-01 HOLD · BA O1–O12 · SA Option A · unlock_lane FE+QA · Dev-BE HOLD invent · must_keep ATT08QC1-MSLSL36C preview RETAIN (T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED) · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · client-days≠ATT-08 DONE · ≠ ATT UAT · PAY OUT · DENY invent att_leave_hold
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md (F.1 F-ATT-LEAVE-02/03 · panel · unlock FE+QA)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md (AC-ATT-09-* · J-HRM-ATT-09-01..06 DRAFT)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md (pending_days=held · DENY att_leave_hold)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-qc-01.md (must_keep ATT08QC1-MSLSL36C)
exit_criteria:
  - FE: bind submit → Network POST /api/hrm/attendance/leave-requests 2xx · panel pending↑ available↓ · F5; approve used XOR reject hoàn 100%; display-ready pending·available·used·held·statusLabelVi; Nest /core 0; type-block when pending (FE guard prefer)
  - QA U65: J-HRM-ATT-09-01..06 DRAFT browser — login→menu→submit→panel→approve XOR reject→F5; zero-seed; FAIL if Nest /core SoT · invent att_leave_hold · soft alone claimed DONE · ATT-08 wipe · claim ATT UAT · CFG=ATT-02 DONE
  - Explicit ≠ ATT-09 DONE from soft alone · ≠ ATT-08 preview = ATT-09 DONE · ≠ client-days=ATT-08 DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT
  - Dev-BE: HOLD unless FE proves closable thin envelope/type-block wire gap (then separate BE-01)
  - evidence: docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-fe-01.md (+ qa-01)
  - ack_status READY_FOR_QA / PASS_TO_PM
cấm: apps/** invent Nest /core · invent att_leave_hold dual · wipe ATT-08/02/PLT/CORE · seed · honesty flip · invent PAY/printable/Word DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE
```

---

*End API-01 · CONFIRMED RETAIN · unlock FE+QA · 2026-08-09*
