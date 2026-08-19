# PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01 — API F.1 · Phép chuyển kỳ RETAIN carry spine + FY stub §5.1 NOT LIVE · HOLD ENGINE rollover/expire (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-33 seat **#37**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-ATT-CAT-LVT** (`allowsCarryOver` · `category carry_over`) · **F-ATT-LVRULE** (`carryOverExpireRule` · `carryCapDays`) · **F-ATT-LEAVE-BAL** panel bucket `carry_over` · ledger row `leave_type=carry_over` · **STUB** **F-ATT-FY-01** (DATA §5.1 stamped · **not LIVE**) · **HOLD** **F-ATT-LEAVE-04** rollover/expire · **GAP** deduct order · physical **`/api/hrm/attendance/*`** · paper `/att/*` + `/core/*` **alias only** · Nest `@Controller('core')` **DENY** · **DENY** invent `att_leave_hold` · **DENY** merge carry into `annual` · **must_keep** ATT-04/04b spine (**`ATT04QC1-MSM22G4W`** · **`ATT04BQC1-MSM3S8QC1`**) · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED RETAIN + GAP/HOLD MAP** — LIVE RETAIN paths **PRESENT** · FY CRUD **ABSENT** (stub only) · ENGINE rollover/expire **ABSENT** · unlock **dev-fe FE-01** (RETAIN J-01..04 deepen) · **dev-be BE-01 HOLD** default (FY migrate + ENGINE only after program waiver) · **≠ ATT-05 / FR-05 DONE** · **≠ ATT-04 / ATT-04b DONE** · **≠ ATT UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-ATT-05` · `FR-UC-BP-ATT-05` · **BR-BP-LV-02** |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O15 **CONFIRMED** · SA-01 Option **A LOCKED** · peer ATT-04 API [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md) · peer ATT-04b API [`PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01.md) · DATA-05 [`PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01.md) · ATT-09 **`ATT09QC1-MSLUTL9D`** · ATT-04 QC **`ATT04QC1-MSM22G4W`** · ATT-04b QC **`ATT04BQC1-MSM3S8QC1`** · ATT-03d **`ATT03DQC1-MSM1CR19`** · **R-ATT-05-FY** · **R-ATT-05-FY-CAL** · **R-ATT-05-ENGINE HOLD** · **R-ATT-05-DEDUCT GAP** · **R-ATT-01-ASSIGN open** |
| **ref_data** | `PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01.md` §5.1 FY entity · §10 DTO↔cols |
| **ref_ba** | `PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01.md` — AC-ATT-05-* · **J-HRM-ATT-05-01..06** DRAFT |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-05-CLUSTER-SA-01.md` §5 F.1 outline |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-05** · Diễn biến **#1 · #2** · tiên quyết FY tenant · **BR-BP-LV-02** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` — `allowsCarryOver` · `carryOverExpireRule` · `carry_cap_days` · panel `carry_over` · **F-ATT-FY-01** GAP · **F-ATT-LEAVE-04** HOLD · **F-PAY-LEAVE-SETTLE** OUT |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.4 · §4.4b — paper `carried_in` · **DENY** physical `att_leave_hold` |
| **ref_code_cite** | `att-leave-type.service.ts` (`allows_carry_over` · `category carry_over`) · `att-leave-accrual-policy.service.ts` (`carry_over_expire_rule` · `carry_cap_days`) · `leave-balance.service.ts` (`MVP_LEAVE_BALANCE_TYPES` · `carry_over` label · `calendarYearInHoChiMinh`) · `attendance.controller.ts` routes — **read-only 2026-08-10** |
| **Honesty** | **`attendance_uat_ready=false`** · **`contracts_printable_ready=false` RETAIN** · **C-SLICE** · **DENY** claim type + panel + policy cols = FR-05 DONE · **DENY** ATT-05 / ATT-04 / ATT-04b / ATT UAT DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN + GAP/HOLD MAP** |
| **unlock_lane** | **dev-fe FE-01** (RETAIN wire deepen · FY admin **conditional**) · **dev-be BE-01 HOLD** (FY §5.1 migrate + ENGINE + deduct — waiver only) · **qa** after READY_FOR_QA |

---

## 1. Verdict — RETAIN LIVE carry spine + documented GAP/HOLD

| Decision | Stamp |
|----------|--------|
| Catalog `allows_carry_over` + `category=carry_over` | **RETAIN** — **`GET/POST/PATCH …/leave-types*`** DTO `allowsCarryOver` · `category` (**F-ATT-CAT-LVT** · peer ATT-04 §4) · **≠** FR-05 DONE alone |
| Policy carry metadata | **RETAIN** — **`…/leave-accrual-policies*`** `carryOverExpireRule` · `carryCapDays` → `carry_over_expire_rule` · `carry_cap_days` (**F-ATT-LVRULE**) · **≠** expire **job** DONE |
| Panel bucket `carry_over` | **RETAIN** — **`GET …/leave-balance/panel`** MVP key `carry_over` · label «Phép chuyển kỳ» (**F-ATT-LEAVE-BAL** · peer FR-UC-BP-ATT-05b) |
| Separate ledger row | **RETAIN** — **`GET …/leave-balance`** row `leave_type=carry_over` · **DENY** silent merge into `annual.entitled` only (**BR-BP-LV-02-SEP** · **AC-ATT-05-LEDGER-SEP**) |
| `balance_year` interim | **RETAIN** — default **`calendarYearInHoChiMinh()`** on balance read/grant · **GAP** **R-ATT-05-FY-CAL** when FY LIVE |
| Hold on submit | **RETAIN must_keep ATT-09** — `pending_days` on carry row when submit uses carry type · paper `held` / `att_leave_hold` = **alias only** |
| HR grant carry entitled | **RETAIN cite** — **`PUT …/leave-balance/tracked-entitlement`** upsert `entitled_days` on `leave_type=carry_over` (U65 product path · **no seed**) |
| FY tenant CRUD | **STUB / NOT LIVE** — **F-ATT-FY-01** mapped to DATA §5.1 `att_leave_fiscal_config` · **no** controller route until migrate |
| Rollover Diễn biến **#1** | **HOLD** — **F-ATT-LEAVE-04** year-end step · **R-ATT-05-ROLLOVER** · **R-ATT-05-ENGINE** |
| Expire Diễn biến **#2** | **HOLD** — cut milestone job · **R-ATT-05-EXPIRE** |
| Deduct order annual vs carry | **GAP** — **`POST …/leave-requests`** single-type deduct AS-IS · **R-ATT-05-DEDUCT** |
| Paper `carried_in` on annual | **HOLD** — DATA §5.2 default **row-only** SoT · omit DTO field GĐ1 |
| PAY termination settlement | **OUT** — **F-PAY-LEAVE-SETTLE** · **DENY** LIVE in ATT slice |
| ATT-04 / ATT-04b peers | **must_keep** LVT/LVRULE/grant/advance — **DENY wipe** in ATT-05 waves |
| Nest `/core` | **DENY** dual SoT |
| Closable BE for RETAIN spine? | **NO** — carry type/policy/panel/ledger key **PRESENT** → **prefer dev-fe + QA** for J-01..04 |
| Closable BE for FY? | **YES** — after sponsor waiver + DATA §5.1 migration PR → **dev-be BE-01** |

```text
  ATT-04 SEALED (ATT04QC1) · ATT-04b SEALED (ATT04BQC1) — LVT/LVRULE/grant/advance RETAIN
  ATT-09 pending_days (ATT09QC1) · ATT-03d GPS · honesty false · PAY OUT
       │
       ▼
  FR-UC-BP-ATT-05 (RETAIN cite + GAP/HOLD residuals)
       │
       ├─ RETAIN LIVE
       │    F-ATT-CAT-LVT allowsCarryOver · category carry_over
       │    F-ATT-LVRULE carryOverExpireRule · carryCapDays
       │    F-ATT-LEAVE-BAL panel carry_over + GET balance row
       │    PUT tracked-entitlement (carry row grant)
       │    pending_days hold (peer ATT-09)
       │
       ├─ STUB (not LIVE until migrate)
       │    F-ATT-FY-01 → att_leave_fiscal_config (DATA §5.1)
       │
       ├─ GAP
       │    R-ATT-05-DEDUCT on leave-requests
       │    R-ATT-05-FY-CAL balance_year resolver (post-FY)
       │
       └─ HOLD / OUT
            F-ATT-LEAVE-04 rollover + expire (ENGINE)
            carried_in_days col (DATA §5.2 default NO)
            F-PAY-LEAVE-SETTLE (PAY OUT)
            att_leave_hold table (DENY)
```

**Invariant ATT-05-PATH:** Network **MUST** hit physical `/api/hrm/attendance/*` — Nest `/api/hrm/core/**` as leave SoT = **FAIL** (**AC-ATT-05-PATH**).

**Invariant ATT-05-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL** (**ATT09QC1-MSLUTL9D**).

**Invariant ATT-05-≠-TYPE-DONE:** `allows_carry_over` + panel `carry_over` + policy carry cols alone = FR-05 DONE = **FAIL** (**AC-ATT-05-≠-PANEL-DONE**).

**Invariant ATT-05-LEDGER-SEP:** Increase `annual.entitled` instead of distinct `carry_over` row = **FAIL** (**BR-BP-LV-02-SEP**).

**Invariant ATT-05-ENGINE:** Claim **F-ATT-LEAVE-04** rollover/expire LIVE = slice DONE = **FAIL** (**AC-ATT-05-ROLLOVER-HOLD** · **AC-ATT-05-EXPIRE-HOLD**).

**Invariant ATT-05-FY:** Claim FY CRUD LIVE without DATA §5.1 migration + route evidence = **FAIL** (**AC-ATT-05-FY-HOLD**).

**Invariant ATT-05-FY-HARDCODE:** API/UI fixes 01/04 for all tenants without FY row = **FAIL**.

**Invariant ATT-05-MK-ATT04:** Wipe/demote ATT-04/04b leave-types/policies/grant/advance in ATT-05 wave = **FAIL**.

**Invariant ATT-05-U19:** leave-types list **=** get-by-id **=** policy list/get **=** balance/panel for same `company_id` scope family (**scope_parity**).

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-05 / FR-05 DONE** · **≠ ATT-04 DONE** (`ATT04QC1-MSM22G4W`) · **≠ ATT-04b DONE** (`ATT04BQC1-MSM3S8QC1`) · **≠ ATT UAT** · printable false · PAY OUT · must_keep ATT-04 LVT/LVRULE/grant · ATT-04b advance · ATT-09 `pending_days` · ATT-03d · **DENY** `att_leave_hold` · **HOLD** ENGINE rollover/expire · **STUB** FY §5.1 not LIVE · **GAP** deduct order · no seed · no apps/** this seat

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **Controller** | Nest `@Controller('attendance')` → **`/api/hrm/attendance`** |
| **ATT-05 RETAIN** | `…/leave-types*` · `…/leave-accrual-policies*` · `…/leave-balance` · `…/leave-balance/panel` · `…/leave-balance/tracked-entitlement` (**PUT**) |
| **ATT-05 peer (must_keep)** | `…/leave-requests*` (deduct/hold · **GAP** order) — cite ATT-04b/09 API-01 |
| **LOGICAL (paper)** | `/api/hrm/att/…` · `/api/hrm/core/…` — **alias only** |
| **STUB (not LIVE)** | `…/leave-fiscal-config*` or paper **F-ATT-FY-01** — **unlock after** DATA §5.1 migrate |
| **HOLD** | `POST …/leave-balances/accrue` + year-end/expire steps (**F-ATT-LEAVE-04**) |
| **OUT** | PAY module **F-PAY-LEAVE-SETTLE** |

| Paper / logical | Physical | DB (DATA-05) |
|-----------------|----------|--------------|
| `allows_carry_over` | `…/leave-types*` DTO `allowsCarryOver` | `att_leave_type.allows_carry_over` **RETAIN** |
| `category carry_over` | same CRUD | `att_leave_type.category` **RETAIN** |
| `carry_over_expire_rule` | `…/leave-accrual-policies*` `carryOverExpireRule` | `att_leave_accrual_policy.carry_over_expire_rule` **RETAIN** |
| `carry_cap_days` | same CRUD `carryCapDays` | `att_leave_accrual_policy.carry_cap_days` **RETAIN** |
| Panel `carry_over` | `GET …/leave-balance/panel` | ledger + label map **RETAIN** |
| Carry balance row | `GET …/leave-balance` | `leave_type='carry_over'` **RETAIN** |
| Paper `held` / `att_leave_hold` | submit hold | **`pending_days`** **RETAIN** · **DENY** table |
| `balance_year` | query/body `year` / `balance_year` | INT · calendar HCM default **RETAIN** · **GAP** FY-CAL |
| FY config | *(future)* **F-ATT-FY-01** | `att_leave_fiscal_config` **ADD §5.1 NOT LIVE** |
| Paper `carried_in` | — | **HOLD** row-only · omit GĐ1 |
| Rollover / expire | — | **HOLD** ENGINE |
| Deduct order | `POST …/leave-requests` | **GAP** config SoT TBD |
| Nest `/core` | — | **DENY invent** |

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-05 verdict |
|---------|------------|----------------|
| `allows_carry_over` on types | `att-leave-type.service.ts` `ensureSchema` + PATCH/POST | **RETAIN** **AC-ATT-05-CAT-CARRY** |
| `category` incl. `carry_over` | CHK enum on `att_leave_type` | **RETAIN** |
| Policy `carry_over_expire_rule` · `carry_cap_days` | `att-leave-accrual-policy.service.ts` CRUD | **RETAIN** **AC-ATT-05-POLICY-CARRY** |
| Panel bucket `carry_over` | `leave-balance.service.ts` `MVP_LEAVE_BALANCE_TYPES` + label «Phép chuyển kỳ» | **RETAIN** **AC-ATT-05-PANEL** |
| `GET leave-balance/panel` | `attendance.controller.ts` `@Get('leave-balance/panel')` before exact `leave-balance` | **RETAIN** |
| Carry row on GET balance | `leave_type=carry_over` in ledger reads | **RETAIN** **AC-ATT-05-LEDGER-SEP** |
| `available_days` on carry row | `computeLeaveAvailableDays(entitled, used, pending, advanced)` — carry row typically `advanced=0` | **RETAIN** · peer 04b formula on **annual** only |
| `balance_year` default | `calendarYearInHoChiMinh()` | **RETAIN interim** · **GAP** **R-ATT-05-FY-CAL** |
| `PUT tracked-entitlement` | upsert `entitled_days` per `leave_type` | **RETAIN cite** grant path |
| `pending_days` hold | peer `leave-requests.service.ts` | **RETAIN** **AC-ATT-05-MK-ATT09** |
| Deduct annual+carry order | single `leave_type` on submit | **GAP** **R-ATT-05-DEDUCT** |
| `att_leave_fiscal_config` API | grep route **0** | **STUB** **F-ATT-FY-01** |
| Rollover / expire job | no year-end writer | **HOLD** **F-ATT-LEAVE-04** |
| `carried_in` / `carried_in_days` DTO | absent | **HOLD** §5.2 |
| `att_leave_hold` table | grep CREATE **0** | **DENY invent** |
| Nest `@Controller('core')` leave | **ABSENT** | **DENY** |

---

## 4. F.1 — endpoints (normative)

> Peer **ATT-04 API-01** §4.1–4.11 and **ATT-04b API-01** §4.1–4.6 remain **must_keep** for shared LVT/LVRULE/grant/advance surfaces. This section **deepens ATT-05 carry deltas** and **re-cites** touched surfaces.

### 4.1 F-ATT-CAT-LVT — `allowsCarryOver` · `category carry_over` (**RETAIN** · 05 focus)

| | |
|--|--|
| **METHOD / path** | **`GET/POST/PATCH/PUT …/leave-types*`** · **`GET …/leave-types/effective`** (full cite: ATT-04 API-01 §4.1–4.3) |
| **Paper alias** | F-ATT-CAT-LVT · `/att/leave-types*` — **alias only** |
| **Mục đích** | Tiên quyết FR-05: HCNS khai báo loại phép **cho phép mang sang** và/hoặc loại thuộc nhóm **chuyển kỳ**; consumer EFF thấy flag khi cấu hình đơn/ quỹ. |
| **Nghiệp vụ xử lý** | Scope parity list=get=mutate (`resolveHrmListScope`) · persist `allows_carry_over` BOOLEAN · `category` enum includes **`carry_over`** · soft-retire unchanged from ATT-04 · **cấm** claim flag/category alone closes FR-05 · response **`allowsCarryOver`** + **`category`** display-ready · **must_keep** peer cols `allows_advance` (**ATT04BQC1**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-05** — tiên quyết loại + chính sách mang sang · **BR-BP-LV-02** · Luồng chính bước cấu hình (trước Diễn biến #1/#2) |
| **Request → DB** | `att_leave_type.allows_carry_over` ← `allowsCarryOver` · `category` ← `category` (**RETAIN**) |
| **Response** | `{ …, allowsCarryOver, category, allowsAdvance, … }` |
| **Lỗi** | `HRM-SCOPE-409` · `HRM-PLT-CAT-CODE-*` · category CHK 400 |

### 4.2 F-ATT-LVRULE — metadata mang sang trên chính sách cấp (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`GET/POST/PATCH …/leave-accrual-policies*`** · **`GET …/leave-accrual-policies/effective`** · **`POST …/leave-accrual-policies/assert-consumer`** (cite ATT-04 API-01 §4.4–4.8) |
| **Paper alias** | F-ATT-LVRULE-01..04 · `/att/leave-accrual-policies*` |
| **Mục đích** | HCNS CRUD **quy tắc hết hạn mang sang** và **trần ngày mang** gắn loại phép — metadata cho ENGINE sau này; **không** thay job cắt/rollover. |
| **Nghiệp vụ xử lý** | Versioned policy per `leave_type_key` · persist `carry_over_expire_rule` TEXT (vocabulary aligned paper SRS) · `carry_cap_days` NUMERIC with DB CHK ≥0 · CNS assert **HRM-ATT-LVRULE-KEY** · optional deepen **`carryOverExpireRuleLabelVi`** wire derive on GET · **≠** expire job LIVE · **must_keep** peer `allow_negative` · advance cap cols when migrated (**ATT04BQC1**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-05** — tiên quyết policy mang sang · **BR-BP-LV-02** · Diễn biến **#2** (rule input cho cắt — **job HOLD**) |
| **Request → DB** | `carry_over_expire_rule` ← `carryOverExpireRule` · `carry_cap_days` ← `carryCapDays` (**RETAIN**) |
| **Response** | `{ carryOverExpireRule, carryCapDays, … }` |
| **Lỗi** | `HRM-ATT-LVRULE-KEY` · scope **409** · validation 400 on negative cap |

### 4.3 F-ATT-LEAVE-BAL-PANEL — bucket «Phép chuyển kỳ» (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-balance/panel`** (register **before** exact `leave-balance` — path order lock) |
| **Paper alias** | F-ATT-LEAVE-BAL panel · peer **FR-UC-BP-ATT-05b** |
| **Mục đích** | NV/HCNS đọc quỹ khi mở form đơn — hiển thị bucket **`carry_over`** với nhãn **«Phép chuyển kỳ»** read-only cùng các bucket MVP khác. |
| **Nghiệp vụ xử lý** | Always include MVP key **`carry_over`** in panel assembly · enrich `leave_type_label` from map · per-item derive `available_days = max(0, entitled − used − pending)` on carry row (**omit** `advanced_days` on carry type unless BA delta) · `balance_year` from query or `calendarYearInHoChiMinh()` · self/HR scope · wire **`HRM-LEAVE-BAL-PANEL-200`**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-05** · peer **FR-UC-BP-ATT-05b** · **AC-ATT-05-PANEL** |
| **Request → DB** | Read `employee_leave_balances` where `leave_type='carry_over'` + EFF join (**RETAIN**) |
| **Response (display-ready)** | `items[]`: `{ leave_type: 'carry_over', leave_type_label, balance_year, entitled_days, used_days, pending_days, available_days, source? }` |
| **Lỗi** | Scope only · safe empty bucket when no row (0 entitled) — **not** ERROR banner |

### 4.4 F-ATT-LEAVE-BAL-01 — GET số dư · hàng `carry_over` (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-balance`** |
| **Paper alias** | paper `/att/leave-balance` |
| **Mục đích** | Đọc số dư theo NV · loại · `balance_year` — đối chiếu quỹ **chuyển kỳ** tách khỏi `annual`. |
| **Nghiệp vụ xử lý** | **RETAIN:** filter/read row `leave_type=carry_over` · expose `entitled_days` · `used_days` · `pending_days` (paper **held**) · `available_days` derived · **DENY** API that only returns merged annual without carry row when carry entitled > 0 in DB · **HOLD:** omit `carriedInDays` until DATA §5.2 waiver · **GAP (post-FY):** `balance_year` from tenant FY resolver (**R-ATT-05-FY-CAL**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-05** · **BR-BP-LV-02-SEP** · **AC-ATT-05-LEDGER-SEP** |
| **Request → DB** | `employee_leave_balances` — `(company_id, employee_id, leave_type, balance_year)` |
| **Lỗi** | Scope · safe empty |

### 4.5 F-ATT-LEAVE-BAL-GRANT — PUT tracked entitlement (**RETAIN cite**)

| | |
|--|--|
| **METHOD / path** | **`PUT /api/hrm/attendance/leave-balance/tracked-entitlement`** |
| **Paper alias** | HR grant · peer ATT-04 Diễn biến #2 |
| **Mục đích** | HCNS gán `entitled_days` cho quỹ tracked — bao gồm hàng **`carry_over`** khi cấp thủ công (U65 · **no seed**). |
| **Nghiệp vụ xử lý** | Upsert `employee_leave_balances` for `leave_type` incl. **`carry_over`** · default `balance_year` calendar HCM · scope + HR gate · **≠** substitute for ENGINE rollover (**HOLD**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-05** context · peer ATT-04 grant · **AC-ATT-05-LEDGER-SEP** |
| **Request → DB** | `entitled_days` on `leave_type=carry_over` row |
| **Lỗi** | Scope · unknown type · validation |

### 4.6 F-ATT-LEAVE-02 — POST nộp đơn (**RETAIN** hold + **GAP** deduct order)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/leave-requests`** |
| **Paper alias** | F-ATT-LEAVE-02 · F-ATT-LEAVE-03 peer |
| **Mục đích** | NV nộp đơn tracked — khi SRS yêu cầu dùng **đồng thời** phép năm và mang sang, hệ thống trừ theo **một** thứ tự cấu hình. |
| **Nghiệp vụ xử lý** | **RETAIN (AS-IS):** submit binds **single** `leave_type` / balance row · `lockPendingLeaveBalance` → **`pending_days`** on that row (**ATT09QC1** · **≠** `att_leave_hold`). **GAP (**R-ATT-05-DEDUCT**):** when employee uses both `annual` and `carry_over` in one logical leave span, apply configured priority (SoT TBD: tenant policy metadata or `att_leave_fiscal_config` extension) — split days across rows or sequential deduct — **FAIL** QC if hardcoded `annual`-first without config · cross-ref ATT-09 hold on affected rows. **DENY** PAY settlement as submit side-effect. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-05** — đặc biệt «dùng đồng thời phép mới và mang sang» · **AC-ATT-05-DEDUCT-GAP** |
| **Request → DB** | `leave_requests` · `employee_leave_balances.pending_days` (± multi-row when GAP wired) |
| **Lỗi** | Sealed ATT-09/04b family · scope **409** |

### 4.7 F-ATT-FY-01 — CRUD cấu hình FY tenant (**STUB · NOT LIVE**)

| | |
|--|--|
| **METHOD / path** | **TARGET (post-migrate):** `GET/POST/PATCH …/leave-fiscal-config` or paper path under `/attendance/leave-fiscal-config*` — **ABSENT in controller 2026-08-10** |
| **Paper alias** | F-ATT-FY-01 · re-home **R-ATT-05-FY** (ex **R-ATT-04-FY**) |
| **Mục đích** | HCNS CRUD **tháng bắt đầu FY** và **mốc cắt bảo lưu** theo từng công ty — tiên quyết SRS FR-05; **cấm** hardcode 01/04 cho mọi tenant. |
| **Nghiệp vụ xử lý** | **STUB ONLY this seat:** contract locked to DATA §5.1 columns · one active row per `company_id` (partial UQ) · scope same as LVT/LVRULE · **FAIL** claim LIVE without migration + route + jest · **FAIL** UI-only FY fix. When LIVE: validate `fiscalYearStartMonth` 1..12 · `carryCutoverRule` vocabulary aligns `carry_over_expire_rule` · soft-retire via `status`/`archived_at`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-05** — tiên quyết FY tenant · Luồng chính 2–3 · **AC-ATT-05-FY-HOLD** |
| **Request → DB (target)** | `att_leave_fiscal_config` per DATA-05 §5.1 |
| **Response (target display-ready)** | `{ fiscalYearStartMonth, carryCutoverRule?, carryCutoverDay?, status, statusLabelVi?, effectiveFrom? }` |
| **Lỗi (target)** | `HRM-SCOPE-409` · duplicate active FY **409** · month CHK **400** |
| **Unlock** | **dev-be BE-01** migration + controller **after** program waiver · **dev-fe FE-01** admin **J-HRM-ATT-05-05** conditional |

### 4.8 F-ATT-LEAVE-04 — rollover cuối FY (**HOLD** · Diễn biến **#1**)

| | |
|--|--|
| **METHOD / path** | **TARGET:** `POST …/leave-balances/accrue` + internal year-end step — **ABSENT** · no public U65 job |
| **Paper alias** | F-ATT-LEAVE-04 · **R-ATT-05-ROLLOVER** · **R-ATT-05-ENGINE** |
| **Mục đích** | Cuối FY: phần còn của `annual` (nếu policy `allows_carry_over`) chuyển sang `entitled_days` trên hàng **`carry_over`** — **tách audit** · **DENY** merge vào `annual.entitled` only. |
| **Nghiệp vụ xử lý** | **HOLD:** no LIVE writer · respect `carry_cap_days` when implemented · requires **R-ATT-05-FY** LIVE for period boundaries · **DENY** seed/SQL bypass U65 = slice DONE · shared wave with accrue evaluator (**Q-LEAVE-ACCRUAL**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-05** — Diễn biến **#1** «Mang sang» · **BR-BP-LV-02** · **AC-ATT-05-ROLLOVER-HOLD** |
| **Request → DB (target)** | INSERT/UPDATE `employee_leave_balances` `leave_type=carry_over` · optional decrease `annual` used/entitled per rule |
| **Lỗi** | **N/A LIVE** |

### 4.9 F-ATT-LEAVE-04 — expire tại mốc cắt (**HOLD** · Diễn biến **#2**)

| | |
|--|--|
| **METHOD / path** | Internal ENGINE step on cut date — **ABSENT** |
| **Paper alias** | F-ATT-LEAVE-04 expire leg · **R-ATT-05-EXPIRE** |
| **Mục đích** | Đến mốc cắt FY tenant: forfeit số `carry_over` còn lại theo `carry_over_expire_rule` + FY config. |
| **Nghiệp vụ xử lý** | **HOLD:** policy col alone **≠** expire DONE · job must read FY + policy · **DENY** LIVE claim in ATT-05 C-SLICE QC. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-05** — Diễn biến **#2** cắt · **AC-ATT-05-EXPIRE-HOLD** |
| **Request → DB (target)** | Adjust `entitled_days` / write-off on `carry_over` row |
| **Lỗi** | **N/A LIVE** |

### 4.10 F-PAY-LEAVE-SETTLE — trả phép nghỉ việc (**OUT**)

| | |
|--|--|
| **METHOD / path** | PAY module · **UC-BP-PAY-07** |
| **Mục đích** | Luồng chính 4 SRS — đơn giá C&B khi nghỉ việc. |
| **Nghiệp vụ xử lý** | **OUT** GĐ1 ATT slice · footer **AC-ATT-05-PAY-OUT** · **DENY** invent DONE in attendance API. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-05** Luồng chính 4 · **R-ATT-05-TERMINATION-PAY** |

### 4.11 DENY list (process + API)

| Deny | Rationale |
|------|-----------|
| Physical `att_leave_hold` CRUD | **ATT09QC1** — `pending_days` only |
| Nest `/core` leave SoT | Path lock |
| Merge carry into `annual.entitled` without `carry_over` row | **BR-BP-LV-02-SEP** |
| `carriedInDays` on annual + `carry_over` row dual without BA delta | DATA §5.2 |
| FY LIVE without §5.1 migration | **AC-ATT-05-FY-HOLD** |
| Rollover/expire LIVE without ENGINE stamp | **AC-ATT-05-ROLLOVER/EXPIRE-HOLD** |
| Wipe ATT-04/04b carry/advance cols | **must_keep** seals |

---

## 5. GAP / HOLD / STUB matrix (dev unlock)

| ID | API surface | Disposition | Owner | Entry |
|----|-------------|-------------|-------|-------|
| **R-ATT-05-PANEL** | §4.3 panel | **RETAIN** | **dev-fe FE-01** | Deepen bind J-02 · panel always shows bucket |
| **R-ATT-05-CAT** | §4.1 | **RETAIN** | **dev-fe FE-01** | Settings loại phép · J-01 |
| **R-ATT-05-POLICY** | §4.2 | **RETAIN** | **dev-fe FE-01** | LVRULE admin carry cols · J-03 |
| **R-ATT-05-LEDGER** | §4.4–4.5 | **RETAIN** | **dev-fe FE-01** + **qa** | J-04 separate row visible |
| **R-ATT-05-FY** | §4.7 | **STUB NOT LIVE** | **dev-be BE-01** (migrate) + **dev-fe** | After waiver · J-05 conditional |
| **R-ATT-05-FY-CAL** | §4.4 `balance_year` | **GAP** | **dev-be** post-FY | Period resolver |
| **R-ATT-05-DEDUCT** | §4.6 | **GAP** | **dev-be** + ba-data order SoT | J-04 conditional |
| **R-ATT-05-ROLLOVER** | §4.8 | **HOLD** | ENGINE program | J-06 footer |
| **R-ATT-05-EXPIRE** | §4.9 | **HOLD** | ENGINE program | J-06 footer |
| **R-ATT-05-CARRIED-IN** | DTO field | **HOLD** | ba-data waiver only | Omit GĐ1 |
| **R-ATT-05-TERMINATION-PAY** | §4.10 | **OUT** | PAY | Footer |

**Default execution lane:** **dev-fe FE-01** + **qa** for RETAIN J-01..04 — **dev-be BE-01 HOLD** unless PM dispatches FY migration or deduct/ENGINE with explicit waiver.

---

## 6. Scope parity (U19)

| Surface | Resolver |
|---------|----------|
| `leave-types*` list/get/mutate | `resolveHrmListScope` · TEXT `company_id` |
| `leave-accrual-policies*` | same family |
| `leave-balance` · `leave-balance/panel` | employee in scope + self/HR gate |
| *(future)* `leave-fiscal-config*` | **must** match LVT/LVRULE `company_id` filter |

**Invariant:** Group CEO `main` list includes carry type → get-by-id same id **must** 200 under same token — **scope_parity** FAIL otherwise.

---

## 7. Traceability (SRS → API → DB → FE → Test)

| Requirement | API § | DB | FE / QA |
|-------------|-------|-----|---------|
| Tiên quyết loại mang sang | 4.1 | `allows_carry_over` · `category` | J-05-01 DRAFT |
| Panel chuyển kỳ | 4.3 | panel key | J-05-02 |
| Policy mang sang | 4.2 | carry cols | J-05-03 |
| Quỹ tách audit | 4.4 | `leave_type=carry_over` | J-05-04 |
| FY CRUD | 4.7 STUB | §5.1 ADD | J-05-05 conditional |
| Diễn biến #1/#2 | 4.8–4.9 HOLD | job | J-05-06 footer |
| Thứ tự trừ | 4.6 GAP | config TBD | J-05-04 conditional |
| Hold peer | 4.6 RETAIN | `pending_days` | must_keep ATT-09 |
| Honesty | footer | — | J-05-06 |

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN + GAP/HOLD MAP** |
| **next_owner** | **pm** → **dev-fe** `PO-HRM-MVP-GD1-ATT-05-CLUSTER-FE-01` · **dev-be HOLD** unless FY waiver |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01.md` |

### 8.1 completion_report

**Closed:** F.1 **CONFIRMED RETAIN** for LIVE **`allowsCarryOver`** · **`category carry_over`** · **`carryOverExpireRule` / `carryCapDays`** · **panel `carry_over`** · **ledger row `leave_type=carry_over`** · interim **`balance_year`** calendar HCM · **`pending_days`** hold alias · **PUT tracked-entitlement** cite; **STUB** **F-ATT-FY-01** bound to DATA §5.1 **`att_leave_fiscal_config` (NOT LIVE)**; **HOLD** **F-ATT-LEAVE-04** rollover/expire; **GAP** **R-ATT-05-DEDUCT** · **R-ATT-05-FY-CAL**; **OUT** PAY termination; invariants + U19; **DENY** `att_leave_hold` · merge annual · Nest `/core`; **must_keep** **ATT04QC1** · **ATT04BQC1** · **ATT09QC1** · **ATT03DQC1**; apps/** untouched · no seed.

**Residual (open):** dev-fe RETAIN wire + QA **J-HRM-ATT-05-*** · dev-be FY migrate + ENGINE + deduct (waiver) · QC GWC C-SLICE · carry **R-ATT-04B-*** · **R-MAIN-EFFECTIVE-EMPTY**.

**Explicit ≠:** ATT-05 / FR-05 DONE · ATT-04/04b DONE · ATT UAT · panel+policy alone = DONE · FY LIVE without §5.1 · rollover LIVE · PAY in ATT slice.

### 8.2 next_dispatch_prompt — dev-fe FE-01 (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05-CLUSTER-FE-01
role: dev-fe
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-33 seat #37)
lane: execution · UC-BP-ATT-05 · FR-UC-BP-ATT-05 · BR-BP-LV-02 · Option A · API-01 PASS_TO_PM RETAIN
entry_criteria: docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01.md CONFIRMED · DATA-01 HOLD · BA J-HRM-ATT-05-01..06 DRAFT · L0 stack up · U65 zero-seed · must_keep ATT04QC1-MSM22G4W · ATT04BQC1-MSM3S8QC1 · ATT09QC1-MSLUTL9D · Nest /core DENY
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01.md (§4.1–4.5 RETAIN · §4.7 FY STUB not LIVE)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01.md (AC-ATT-05-* · J-* click paths)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01.md (peer LVT/LVRULE settings path — DENY wipe)
  - docs/hrm/SRS.md or SRS_HRM_ENTERPRISE FR-UC-BP-ATT-05 (if mapped in SUBAGENT_READ_MAP)
spec_read_ack: API-01 §4 · DATA-01 §10 · BA AC pack · change_mode FIX/ADD display bind only
allowed_paths: apps/web/** or apps/hrm-fe/** attendance settings + leave form panel embed paths per slice map (PM to stamp)
forbidden_paths: wipe allows_advance · demote carry_over bucket · invent att_leave_hold · Nest /core client · FY hardcode 01/04 UI · claim ATT-05 DONE
exit_criteria:
  - J-HRM-ATT-05-01: allows_carry_over / category carry_over on loại phép → Lưu 2xx → F5 (F-ATT-CAT-LVT)
  - J-HRM-ATT-05-02: panel bucket «Phép chuyển kỳ» on leave form (F-ATT-LEAVE-BAL panel)
  - J-HRM-ATT-05-03: carryOverExpireRule / carryCapDays on LVRULE admin → Lưu 2xx → F5
  - J-HRM-ATT-05-04: annual vs carry_over visibly separate on panel/balance GET
  - J-HRM-ATT-05-05: HOLD footer OR conditional when BE not LIVE — no fake FY CRUD
  - Regression ATT-04/04b paths untouched · Network /api/hrm/attendance/* only
  - jest/smoke as touched package · ack_status READY_FOR_QA
  - evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-fe-01.md
cấm: seed · honesty flip · merge carry into annual UI · PAY termination wire
```

### 8.3 next_dispatch_prompt — dev-be BE-01 (HOLD default · copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05-CLUSTER-BE-01
role: dev-be
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-33 seat #37)
lane: execution · HOLD default — dispatch only on PM FY/deduct/ENGINE waiver
entry_criteria: Sponsor/program waiver for DATA §5.1 migration OR R-ATT-05-DEDUCT wire OR ENGINE stamp — otherwise DO NOT START
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01.md (§4.7 FY target · §4.6 deduct GAP · §4.8–4.9 HOLD)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-DATA-01.md (§5.1 att_leave_fiscal_config · DENY att_leave_hold · DENY merge annual)
exit_criteria (when unblocked):
  - Migration att_leave_fiscal_config + F-ATT-FY-01 routes per API-01 §4.7 · scope parity spec
  - OR deduct order implementation per R-ATT-05-DEDUCT with regression leave-requests + hrm-list-scope
  - OR ENGINE job behind feature flag — never U65 seed evidence
  - must_keep carry_over cols on LVT/LVRULE · ATT04QC1 · ATT04BQC1
  - ack_status READY_FOR_QA · evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-be-01.md
cấm: invent att_leave_hold · wipe ATT-04/04b · rollover LIVE claim without ENGINE program · seed year-end
```

---

## Footer — honesty (document)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-05 / FR-05 DONE** · **≠ ATT-04 DONE** (`ATT04QC1-MSM22G4W`) · **≠ ATT-04b DONE** (`ATT04BQC1-MSM3S8QC1`) · **≠ ATT UAT** · printable false · PAY OUT · **R-ATT-05-FY** stub §5.1 not LIVE · **R-ATT-05-ENGINE HOLD** · DENY `att_leave_hold` · DENY merge carry into annual · must_keep peer chain · no seed · no apps/** this seat
