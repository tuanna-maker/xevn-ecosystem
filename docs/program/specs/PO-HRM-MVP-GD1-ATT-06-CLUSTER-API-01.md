# PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01 — API F.1 · Phép bù OT RETAIN quỹ `compensatory` + OT TXN + comp catalog · GAP policy + approve→accrue (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-33 seat **#39**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-ATT-LEAVE-BAL** panel/by-type/grant · **F-ATT-LEAVE-02** submit hold · **F-ATT-OT-TXN** create/approve · **F-ATT-CAT-OTC** · **GAP** **F-ATT-OT-COMP-POLICY** (`GET/PUT …/ot-comp-leave-policy`) · **GAP** **F-ATT-OT-COMP-ACCRUE** (approve side-effect) mapped DATA §5.1/§5.2 · physical **`/api/hrm/attendance/*`** · paper `/att/*` + `/core/*` **alias only** · Nest `@Controller('core')` **DENY** · **DENY** invent `att_leave_hold` · **DENY** merge `compensatory`/`carry_over`→`annual` · **DENY** sheet close as accrual trigger · **must_keep** **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** · **`ATT09QC1-MSLUTL9D`** · **`ATT10QC1-MSLWGUYH`** · **`ATT11QC1-MSLXTH9P`** · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED RETAIN + GAP MAP** — LIVE RETAIN paths **PRESENT** · policy + accrual ledger API **ABSENT** (DATA §5.1/§5.2 stamped closable · not LIVE until migrate) · unlock **dev-be BE-01** (HOLD until this stamp) · **dev-fe FE-01 HOLD** (OT picker + comp leave panel) · **≠ ATT-06 / FR-06 DONE** · **≠ ATT-05b/05/04/04b DONE** · **≠ ATT UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-ATT-06` · `FR-UC-BP-ATT-06` · **BR-BP-LV-03** |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O20 **CONFIRMED** · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01.md) §5.1 policy · §5.2 accrual ledger · peer ATT-05b API panel · ATT-04 API grant · ATT-09 hold · ATT-05 carry separate · **R-ATT-06-POLICY** · **R-ATT-06-ACCRUE** · **R-ATT-06-DRAFT/OFF-MID/IDEM/TYPE-MAP** · **R-ATT-06-PANEL-FE** · **R-ATT-06-AGG** footer · **R-ATT-01-ASSIGN open** |
| **ref_data** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01.md` §5.1 `att_ot_comp_leave_policy` · §5.2 `att_ot_comp_accrual_ledger` |
| **ref_ba** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01.md` — AC-ATT-06-* · **J-HRM-ATT-06-01..07** DRAFT |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-SA-01.md` §5 F.1 outline |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-06** · Diễn biến **#1 · #2** · Luồng chính **1–3** · **BR-BP-LV-03** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` — **F-ATT-LEAVE-02/03** · leave-balance family · overtime (cite program delta) · **F-ATT-SHEET-01/02** context |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.4 `category=ot_comp` · §4.4b **`pending_days`** · **DENY** physical `att_leave_hold` |
| **ref_code_cite** | `leave-balance.service.ts` — `compensatory` in `MVP_LEAVE_BALANCE_TYPES` · label «Phép bù OT» · `attendance.controller.ts` — `leave-balance/panel` · `tracked-entitlement` · `overtime-requests*` · `ot-comp-types*` · `attendance-requests.service.ts` — `approveOvertimeRequest` status-only · `att-ot-comp-type.service.ts` — **read-only 2026-08-10** |
| **Honesty** | **`attendance_uat_ready=false`** · **`contracts_printable_ready=false` RETAIN** · **C-SLICE** · **DENY** panel `compensatory` row / `att_ot_comp_type` catalog alone = FR-06 DONE · **DENY** ATT-06 / ATT-05b/05/04/04b / ATT UAT DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN + GAP MAP** |
| **unlock_lane** | **dev-be BE-01** (migration §5.1/§5.2 + approve accrual hook) · **dev-fe FE-01 HOLD** (picker + comp leave panel) · **qa** U65 **J-HRM-ATT-06-*** after READY_FOR_QA |

---

## 1. Verdict — RETAIN LIVE compensatory spine + documented GAP policy/accrue

| Decision | Stamp |
|----------|--------|
| Quỹ `compensatory` ledger + panel | **RETAIN** — `employee_leave_balances.leave_type=compensatory` · **`GET …/leave-balance/panel`** item «Phép bù OT» (**F-ATT-LEAVE-BAL**) · **≠** FR-06 DONE alone (**O1**) |
| Interim HR grant | **RETAIN** — **`PUT …/leave-balance/tracked-entitlement`** upsert `entitled_days` for `compensatory` · evidence **interim** until engine LIVE (**O2**) |
| Submit đơn nghỉ bù + hold | **RETAIN** — **`POST …/leave-requests`** · `lockPendingLeaveBalance` → **`pending_days`** on comp row (**F-ATT-LEAVE-02** · **ATT09QC1**) · **DENY** `att_leave_hold` |
| OT create + comp intent | **RETAIN** — **`POST …/overtime-requests`** · `compensation_type` assert ∈ **`att_ot_comp_type`** EFF (**F-ATT-OT-TXN** · **F-ATT-CAT-OTC**) · **orthogonal** · **≠** accrual DONE (**O4**) |
| Approve OT baseline | **RETAIN** — **`POST …/overtime-requests/:id/approve`** today **`status=approved` only** · **no** `entitled_days` Δ pre-engine (**O5**) |
| Policy toggle + hours→days | **GAP** — **F-ATT-OT-COMP-POLICY** → DATA §5.1 `att_ot_comp_leave_policy` · route **ABSENT** until migrate |
| Approve→accrue engine | **GAP** — **F-ATT-OT-COMP-ACCRUE** side-effect on approve → §5.2 ledger + comp `entitled_days` · SRS Diễn biến **#1** (**O8**) |
| Draft / mode-OFF / idempotency / type map | **GAP/HOLD AC** on approve path — **R-ATT-06-DRAFT/OFF-MID/IDEM/TYPE-MAP** |
| Panel on comp leave form | **GAP FE** — **R-ATT-06-PANEL-FE** (peer **ATT05BQC1** submit-form panel) |
| ATT-10 AGG | **RETAIN cite** + **HOLD footer** **R-ATT-06-AGG** when engine LIVE |
| ATT-11 close | **RETAIN cite** · **≠** accrual trigger (**O15**) |
| `carry_over` + `annual` peers | **must_keep** **ATT05QC1** · **DENY merge** buckets |

```text
  ATT-05b (ATT05BQC1) · ATT-05 carry (ATT05QC1) · ATT-04/04b · ATT-09 · ATT-03d — must_keep
  ATT-10 (ATT10QC1) AGG · ATT-11 (ATT11QC1) close — context gates · ≠ accrual SoT
  Nest /core DENY · honesty false · PAY OUT · C-SLICE
       │
       ▼
  FR-UC-BP-ATT-06 (RETAIN cite + GAP policy/accrue)
       │
       ├─ RETAIN LIVE
       │    F-ATT-LEAVE-BAL panel/by-type + PUT tracked-entitlement (compensatory)
       │    F-ATT-LEAVE-02 submit → pending_days on compensatory
       │    F-ATT-OT-TXN create/approve (status-only today)
       │    F-ATT-CAT-OTC ot-comp-types* (intent on OT row)
       │
       ├─ GAP (post-migrate · dev-be BE-01)
       │    F-ATT-OT-COMP-POLICY GET/PUT ot-comp-leave-policy (DATA §5.1)
       │    F-ATT-OT-COMP-ACCRUE on approve (DATA §5.2 + entitled_days)
       │
       └─ DENY / HOLD
            att_leave_hold table
            merge compensatory/carry→annual
            accrual on F-ATT-SHEET-02 close only
            R-ATT-06-AGG PAY-double (footer until engine)
```

**Invariant ATT-06-PATH:** Network **MUST** hit physical `/api/hrm/attendance/*` — Nest `/api/hrm/core/**` as leave/OT SoT = **FAIL** (**AC-ATT-06-PATH**).

**Invariant ATT-06-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL** (**ATT09QC1-MSLUTL9D**).

**Invariant ATT-06-≠-PANEL-DONE:** `compensatory` panel row or `GET panel` 200 alone = FR-06 DONE = **FAIL** (**AC-ATT-06-≠-PANEL-DONE**).

**Invariant ATT-06-≠-CATALOG-DONE:** `att_ot_comp_type` catalog LIVE alone = FR-06 DONE = **FAIL** (**AC-ATT-06-≠-CATALOG-DONE**).

**Invariant ATT-06-≠-MERGE:** Fold `compensatory` or `carry_over` into `annual` display/ledger = **FAIL** (**AC-ATT-06-≠-MERGE-BUCKETS** · **ATT05QC1**).

**Invariant ATT-06-≠-SHEET-TRIGGER:** Accrual **only** on sheet close (ATT-11) = **FAIL** — SRS **#1** = **approve OT** (**AC-ATT-06-≠-SHEET-CLOSE-TRIGGER**).

**Invariant ATT-06-INTERIM-LABEL:** U65 `tracked-entitlement` after approve without **interim** tag when engine absent = **FAIL** (**AC-ATT-06-INTERIM-GRANT**).

**Invariant ATT-06-U19:** panel list scope **=** by-type get **=** OT get-by-id **=** policy GET for same `company_id` family.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-06 / FR-06 DONE** · **≠ ATT-05b DONE** (`ATT05BQC1-MSM5SDQC1`) · **≠ ATT-05 DONE** (`ATT05QC1-MSM52GWC1`) · **≠ ATT-04/04b DONE** (`ATT04QC1` · `ATT04BQC1`) · **≠ ATT UAT** · printable false · PAY OUT · must_keep ATT-09 `pending_days` · ATT-03d · ATT-10/11 context only · **R-ATT-06-AGG/PAY-DOUBLE** HOLD · **R-ATT-01-ASSIGN open** · DENY `att_leave_hold` · DENY merge compensatory/carry→annual · no seed · no apps/** this seat

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **Controller** | Nest `@Controller('attendance')` → **`/api/hrm/attendance`** |
| **ATT-06 RETAIN** | `…/leave-balance/panel` · `…/leave-balance` · `…/leave-balance/tracked-entitlement` (**PUT**) · `…/leave-requests` (**POST**) · `…/overtime-requests` · `…/overtime-requests/:id/approve` · `…/ot-comp-types*` |
| **ATT-06 GAP (target post-migrate)** | `…/ot-comp-leave-policy` (**GET/PUT**) — **ABSENT** controller 2026-08-10 |
| **ATT-06 peer context (must_keep cite)** | `…/attendance-sheets/:id/aggregate` (**F-ATT-SHEET-01**) · `…/attendance-sheets/:id/close` (**F-ATT-SHEET-02**) |
| **LOGICAL (paper)** | `/api/hrm/att/…` · `/api/hrm/core/…` — **alias only** |
| **OUT** | PAY double-count slice · invent `att_leave_hold` CRUD |

| Paper / logical | Physical | DB (DATA-06) |
|-----------------|----------|--------------|
| Panel `compensatory` | `GET …/leave-balance/panel` | `employee_leave_balances.leave_type='compensatory'` **RETAIN** |
| By-type comp | `GET …/leave-balance?leave_type=compensatory` | same row **RETAIN** |
| HR grant / interim | `PUT …/leave-balance/tracked-entitlement` | `entitled_days` upsert **RETAIN** |
| Paper `held` / `att_leave_hold` | submit hold | **`pending_days`** **RETAIN** · **DENY** table |
| OT TXN | `…/overtime-requests*` | `overtime_requests` **RETAIN** |
| Comp catalog | `…/ot-comp-types*` | `att_ot_comp_type` **RETAIN** |
| OT-comp policy | `…/ot-comp-leave-policy` | `att_ot_comp_leave_policy` **ADD §5.1 NOT LIVE** |
| Accrual idempotency | side-effect on approve | `att_ot_comp_accrual_ledger` **ADD §5.2 NOT LIVE** |
| Sheet close | `POST …/close` | **≠** accrual writer **DENY** |

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-06 verdict |
|---------|------------|----------------|
| `compensatory` in MVP types | `leave-balance.service.ts` `MVP_LEAVE_BALANCE_TYPES` | **RETAIN** **AC-ATT-06-COMP-BUCKET** |
| Panel label «Phép bù OT» | `LEAVE_BALANCE_TYPE_LABELS` | **RETAIN** |
| `GET leave-balance/panel` | `attendance.controller.ts` before exact `leave-balance` | **RETAIN** · peer **ATT05BQC1** |
| `GET leave-balance?leave_type=compensatory` | same service | **RETAIN** |
| `PUT tracked-entitlement` | upsert per `leave_type` incl. compensatory | **RETAIN interim** **AC-ATT-06-INTERIM-GRANT** |
| `POST leave-requests` hold | `lockPendingLeaveBalance` → `pending_days` | **RETAIN** **AC-ATT-06-DEDUCT-HOLD** |
| `POST overtime-requests` | `compensation_type` + catalog assert | **RETAIN** **AC-ATT-06-CAT-ORTH** |
| `approveOvertimeRequest` | status update only | **RETAIN baseline** **AC-ATT-06-OT-APPROVE-BASE** |
| `ot-comp-types*` CRUD + EFF | `att-ot-comp-type.service.ts` | **RETAIN** · **≠** FR-06 DONE |
| `ot-comp-leave-policy` route | grep **0** | **GAP** §4.8 |
| `att_ot_comp_accrual_ledger` | grep **0** | **GAP** §4.9 |
| `att_leave_hold` table | grep CREATE **0** | **DENY invent** |
| Nest `@Controller('core')` leave/OT | **ABSENT** | **DENY** |
| `carry_over` separate panel key | peer ATT-05 | **RETAIN** **AC-ATT-06-MK-ATT05** |

---

## 4. F.1 — endpoints (normative)

> Peer **ATT-04 API-01** (grant) · **ATT-05b** (panel on submit) · **ATT-09** (hold) remain **must_keep**. This section deepens **ATT-06** deltas and re-cites touched surfaces.

### 4.1 F-ATT-LEAVE-BAL-PANEL — bucket «Phép bù OT» (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-balance/panel`** (register **before** exact `leave-balance`) |
| **Paper alias** | F-ATT-LEAVE-BAL panel · peer **FR-UC-BP-ATT-05b** · **ATT05BQC1** |
| **Mục đích** | NV/HCNS đọc quỹ khi mở form đơn — hiển thị bucket **`compensatory`** với nhãn **«Phép bù OT»** read-only · **tách** khỏi `annual` và **`carry_over`**. |
| **Nghiệp vụ xử lý** | Always include MVP key **`compensatory`** in panel assembly · enrich `leave_type_label` from map · `available_days = max(0, entitled − used − pending)` on comp row · `balance_year` from query or calendar HCM default · scope self/HR · **cấm** merge comp into annual item · **≠** claim panel alone closes FR-06. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-06** — Diễn biến **#2** «Đủ quỹ» · peer panel **BR-BP-LV-PANEL-01** · **AC-ATT-06-COMP-BUCKET** |
| **Request → DB** | Read `employee_leave_balances` where `leave_type='compensatory'` (**RETAIN**) |
| **Response (display-ready)** | `items[]`: `{ leave_type: 'compensatory', leave_type_label, balance_year, entitled_days, used_days, pending_days, available_days }` |
| **Lỗi** | `HRM-SCOPE-409` · safe empty bucket when no row — **not** ERROR banner |

### 4.2 F-ATT-LEAVE-BAL-01 — GET số dư `compensatory` (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-balance`** · query `leave_type=compensatory` |
| **Paper alias** | F-ATT-LEAVE-BAL by-type |
| **Mục đích** | Đọc chi tiết quỹ phép bù OT theo NV · năm quỹ — đối chiếu trước submit đơn nghỉ bù. |
| **Nghiệp vụ xử lý** | **RETAIN:** read/upsert-safe row `leave_type=compensatory` · expose `entitled_days` · `used_days` · **`pending_days`** (paper **held** alias) · derived `available_days` · **DENY** API that redirects comp balance into `annual` only. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-06** — Diễn biến **#2** · **AC-ATT-06-COMP-BUCKET** |
| **Request → DB** | `employee_leave_balances` — `(company_id, employee_id, leave_type='compensatory', balance_year)` |
| **Lỗi** | Scope · safe zeros if missing row |

### 4.3 F-ATT-LEAVE-BAL-GRANT — PUT tracked entitlement (**RETAIN cite · interim**)

| | |
|--|--|
| **METHOD / path** | **`PUT /api/hrm/attendance/leave-balance/tracked-entitlement`** |
| **Paper alias** | F-ATT-LEAVE-BAL grant · peer ATT-04 |
| **Mục đích** | HCNS (hoặc luồng sản phẩm U65 sau duyệt OT) gán `entitled_days` cho quỹ **`compensatory`** khi engine accrual **chưa LIVE** — **phải gắn nhãn interim** trong evidence QA. |
| **Nghiệp vụ xử lý** | Upsert `employee_leave_balances` for `leave_type=compensatory` · default `balance_year` calendar HCM · scope + HR gate · **≠** substitute for **F-ATT-OT-COMP-ACCRUE** when policy+ledger LIVE · **không** ghi §5.2 ledger row on interim path. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-06** — Diễn biến **#1** (path B interim) · Luồng chính **1** until engine · **AC-ATT-06-INTERIM-GRANT** |
| **Request → DB** | `entitled_days` on `leave_type=compensatory` |
| **Lỗi** | Scope · unknown type · validation |

### 4.4 F-ATT-LEAVE-02 — POST nộp đơn nghỉ bù (**RETAIN** hold)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/leave-requests`** |
| **Paper alias** | F-ATT-LEAVE-02 · peer F-ATT-LEAVE-03 approve/reject |
| **Mục đích** | NV nộp đơn loại **nghỉ bù** (`att_leave_type.category=ot_comp` ↔ balance key `compensatory`) — trừ đúng quỹ và giữ chỗ. |
| **Nghiệp vụ xử lý** | When **F-ATT-CAT-EFF-01** active >0: `leave_type` ∈ EFF · map **`ot_comp`** → deduct **`compensatory`** row (**R-ATT-06-TYPE-MAP**) · `assertSufficientLeaveBalance` · **`lockPendingLeaveBalance`** → **`pending_days +=`** on **`compensatory`** row only · paper `held` / `att_leave_hold` = **alias** — **cấm** second hold table · **must_keep** ATT-09 semantics · **DENY** merge deduct into `annual` when comp type selected. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-06** — Diễn biến **#2** «Đơn nghỉ bù» · **BR-BP-LV-03-DEDUCT** · **AC-ATT-06-DEDUCT-HOLD** |
| **Request → DB** | `leave_requests` · `employee_leave_balances.pending_days` on comp row |
| **Lỗi** | `HRM-LEAVE-TYPE-UNKNOWN` · insufficient balance · scope **409** · overlap (peer ATT-09) |

### 4.5 F-ATT-OT-TXN-CREATE — POST tạo đơn OT (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/overtime-requests`** |
| **Paper alias** | F-ATT-OT-TXN create (program cite) |
| **Mục đích** | NV/QL tạo đề nghị OT — chọn **`compensation_type`** từ danh mục khi EFF>0 (vd. `compensatory_leave`). |
| **Nghiệp vụ xử lý** | Persist `total_hours` · `status` pending/draft · `compensation_type` TEXT · when EFF>0 assert code ∈ **`GET …/ot-comp-types/effective`** — invent → **`HRM-ATT-OT-COMP-KEY`** · **no** balance mutation at create · **≠** automated accrual. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-06** — tiên quyết OT · SRS v0.41 catalog orthogonal · **AC-ATT-06-CAT-ORTH** · **J-HRM-ATT-06-02** |
| **Request → DB** | `overtime_requests.compensation_type` · hours · employee scope |
| **Lỗi** | `HRM-ATT-OT-COMP-KEY` · scope · validation |

### 4.6 F-ATT-OT-TXN-APPROVE — POST duyệt OT (**RETAIN baseline · GAP accrual hook**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/overtime-requests/:requestId/approve`** |
| **Paper alias** | F-ATT-OT-TXN approve |
| **Mục đích** | QL duyệt OT — SRS Diễn biến **#1** «Duyệt OT» khi chế độ ON phải dẫn tới cộng quỹ bù (engine hoặc interim product path). |
| **Nghiệp vụ xử lý (AS-IS RETAIN)** | Validate scope parity with list/get OT · transition `status=approved` · **no** `employee_leave_balances` mutation in baseline (**AC-ATT-06-OT-APPROVE-BASE**). **GAP extension (same endpoint — F-ATT-OT-COMP-ACCRUE):** after status commit, when §5.1 policy `mode_enabled=true` ∧ OT `compensation_type` maps to leave-comp per `maps_comp_codes`/app map ∧ `status` was not already approved: (1) compute `credited_days = f(total_hours, hours_per_leave_day)` with ratio snapshot · (2) insert **`att_ot_comp_accrual_ledger`** row if no active `credited` for `(company_id, overtime_request_id)` (**R-ATT-06-IDEM**) · (3) same transaction `entitled_days += credited_days` on `leave_type=compensatory` · (4) return display-ready accrual block in response when engine LIVE. **R-ATT-06-DRAFT:** reject accrual if OT not `approved` outcome path from non-approved states. **R-ATT-06-OFF-MID:** when `mode_enabled=false`, approve still **2xx** but **skip** steps (1–3) — OT still flows to ATT-10 AGG. **Reject-after-accrue:** documented reversal rules (**O11**) — separate transaction · `ledger_status=reversed`. **Cấm** trigger accrual from **F-ATT-SHEET-02** close alone. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-06** — Diễn biến **#1** «Duyệt OT · Chế độ ON · Cộng quỹ bù» · Luồng chính **1** · **BR-BP-LV-03** · **AC-ATT-06-ACCRUE-ENGINE** |
| **Request → DB (RETAIN)** | `overtime_requests.status` |
| **Request → DB (GAP)** | `att_ot_comp_accrual_ledger` §5.2 · `employee_leave_balances.entitled_days` on compensatory · read `att_ot_comp_leave_policy` §5.1 |
| **Response (target when GAP LIVE)** | `{ id, status: 'approved', accrual?: { credited_days, balance_year, ledger_id, idempotent_replay: boolean } }` |
| **Lỗi** | `HRM-SCOPE-409` · OT not found · invalid state transition · policy ratio invalid when mode ON · duplicate credit prevented (idempotent replay returns prior ledger) |

### 4.7 F-ATT-CAT-OTC — danh mục hình thức bồi thường OT (**RETAIN · orthogonal**)

| | |
|--|--|
| **METHOD / path** | **`GET/POST/PUT/PATCH …/ot-comp-types*`** · **`GET …/ot-comp-types/effective`** |
| **Paper alias** | F-ATT-CAT-OTC · platform catalog delta |
| **Mục đích** | HCNS quản trị mã hình thức bồi thường (trả lương / nghỉ bù / N+1) — consumer OT create chọn từ EFF. |
| **Nghiệp vụ xử lý** | CRUD `att_ot_comp_type` · soft-retire · EFF list for picker · assert on OT create (**§4.5**) · **cấm** claim catalog alone = FR-06 DONE · **≠** policy toggle · **≠** accrual engine. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-06** peer SRS v0.41 · **AC-ATT-06-CAT-ORTH** · **AC-ATT-06-≠-CATALOG-DONE** |
| **Request → DB** | `att_ot_comp_type` (**RETAIN**) |
| **Lỗi** | `HRM-ATT-OT-COMP-KEY` · scope · retire constraints |

### 4.8 F-ATT-OT-COMP-POLICY — GET/PUT chế độ bù OT + tỷ lệ giờ→ngày (**GAP · NOT LIVE**)

| | |
|--|--|
| **METHOD / path** | **TARGET (post-migrate):** **`GET /api/hrm/attendance/ot-comp-leave-policy`** · **`PUT /api/hrm/attendance/ot-comp-leave-policy`** — **ABSENT** controller 2026-08-10 |
| **Paper alias** | F-ATT-OT-COMP-POLICY · physical name locked at migration PR |
| **Mục đích** | HCNS xem/cấu hình **toggle** «chế độ bù OT» và **tỷ lệ quy đổi giờ OT → 1 ngày phép bù** theo pháp nhân — tiên quyết SRS FR-06. |
| **Nghiệp vụ xử lý** | Scope: company slug same resolver family as OT/leave list (**U19**) · **GET:** return active row per `company_id` (partial UQ §5.1) or safe defaults `{ mode_enabled: false, hours_per_leave_day: null }` when no row · display-ready `{ modeEnabled, hoursPerLeaveDay, compBalanceKey: 'compensatory', mapsCompCodes?, status, effectiveFrom? }` · **PUT:** upsert active policy · validate when `mode_enabled=true` then `hours_per_leave_day > 0` · **`comp_balance_key`** must remain **`compensatory`** — **cấm** silently redirect to `annual`/`carry_over` (**AC-ATT-06-≠-MERGE-BUCKETS**) · soft-retire via `status`/`archived_at` · **FAIL** claim LIVE without migration + route + jest. **R-ATT-06-OFF-MID:** `mode_enabled=false` stops **new** accrual on approve hook; existing quỹ + submit comp leave unchanged. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-06** — tiên quyết «Toggle chế độ bù» · «Tỷ lệ giờ→ngày CRUD tenant» · Luồng chính **3** (tắt chế độ) · **AC-ATT-06-POLICY-TOGGLE** · **AC-ATT-06-HOURS-DAYS** · **AC-ATT-06-MODE-OFF** · **J-HRM-ATT-06-01** · **J-HRM-ATT-06-07** |
| **Request → DB** | `att_ot_comp_leave_policy` per DATA-06 §5.1: `mode_enabled` ← `modeEnabled` · `hours_per_leave_day` ← `hoursPerLeaveDay` · `comp_balance_key` ← `compBalanceKey` (default `compensatory`) · `maps_comp_codes` optional |
| **Response** | Policy DTO as above + `updated_at` |
| **Lỗi** | `HRM-SCOPE-409` · `HRM-ATT-OT-COMP-POLICY-RATIO` when mode ON and ratio ≤ 0 · duplicate active policy **409** |

### 4.9 F-ATT-OT-COMP-ACCRUE — side-effect cộng quỹ on approve (**GAP · NOT LIVE writer**)

| | |
|--|--|
| **METHOD / path** | **No standalone public route GĐ1** — normative hook inside **`POST …/overtime-requests/:id/approve`** (§4.6) · optional future read-only audit: `GET …/overtime-requests/:id/comp-accrual` (*not required this wave*) |
| **Paper alias** | F-ATT-OT-COMP-ACCRUE |
| **Mục đích** | Thực thi BR-BP-LV-03: OT đã duyệt · chế độ ON · hình thức map nghỉ bù → **cộng quỹ `compensatory`** theo tỷ lệ — **một lần** mỗi OT id. |
| **Nghiệp vụ xử lý** | Preconditions: (P1) policy `mode_enabled=true` (**§4.8**) · (P2) OT row `status=approved` after approve mutate · (P3) `compensation_type` ∈ mapped leave-comp codes · (P4) OT not draft/pending/rejected at accrual decision (**R-ATT-06-DRAFT**) · (P5) no existing `att_ot_comp_accrual_ledger` row with `ledger_status=credited` for `(company_id, overtime_request_id)` — else **idempotent replay** return prior credit (**R-ATT-06-IDEM**) · (P6) **≠** invoked from sheet close job. Writer steps: snapshot `ot_hours` · `hours_per_leave_day` · compute `credited_days` (round rule: **half-day 0.5** aligned leave balance NUMERIC(5,1) — document in BE jest) · insert ledger §5.2 · upsert comp balance `entitled_days += credited_days` for `balance_year` aligned employee row · emit optional domain event for panel refresh. **Interim path:** absent engine, product may use **§4.3** without ledger — QA tags **interim**. **HOLD footer:** when LIVE, coordinate **R-ATT-06-AGG** ATT-10 payable OT exclusion — non-blocking this API stamp. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-06** — Diễn biến **#1** · Luồng chính **1** · **BR-BP-LV-03** · **AC-ATT-06-ACCRUE-ENGINE** · **J-HRM-ATT-06-03/04** |
| **Request → DB** | `att_ot_comp_accrual_ledger` §5.2 · `employee_leave_balances` `leave_type=compensatory` |
| **Lỗi** | Skip silently when mode OFF (not error) · `HRM-ATT-OT-COMP-NO-ACCRUE` when comp type not mapped · policy missing when mode ON → **409** config |

### 4.10 F-ATT-SHEET-01 — Aggregate bảng công (**RETAIN context · ≠ accrual**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/attendance-sheets/:id/aggregate`** (cite ATT-10) |
| **Paper alias** | F-ATT-SHEET-01 |
| **Mục đích** | Đưa OT `approved` vào phễu `ot_hours_weighted` — Luồng chính **3** khi chế độ OFF (OT vào bảng công, không cộng phép mới). |
| **Nghiệp vụ xử lý** | **RETAIN cite** ATT-10 · **≠** substitute for **F-ATT-OT-COMP-ACCRUE** · when engine LIVE footer **R-ATT-06-AGG** may reduce payable OT for comp-leave OT — **HOLD** until engine. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-06** — Luồng chính **3** · **AC-ATT-06-AGG-FOOTER** |
| **Lỗi** | Peer ATT-10 family |

### 4.11 F-ATT-SHEET-02 — Close bảng công (**RETAIN context · DENY accrual trigger**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/attendance-sheets/:id/close`** (cite ATT-11) |
| **Paper alias** | F-ATT-SHEET-02 |
| **Mục đích** | Chốt bảng công trước PAY — **không** là nguồn sự thật cộng quỹ phép bù OT. |
| **Nghiệp vụ xử lý** | **RETAIN cite** ATT-11 · **cấm** implement accrual writer chỉ trên close · SRS **#1** = approve OT · **FAIL** QC if close alone credits compensatory quỹ. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-06** — **AC-ATT-06-≠-SHEET-CLOSE-TRIGGER** · **O15** |
| **Lỗi** | Peer ATT-11 sign evaluator |

### 4.12 DENY list (process + API)

| Deny | Rationale |
|------|-----------|
| Physical `att_leave_hold` CRUD | **ATT09QC1** — `pending_days` only |
| Nest `/core` leave/OT/policy SoT | Path lock |
| Merge `compensatory` or `carry_over` into `annual` display/ledger | **ATT05QC1** · **AC-ATT-06-≠-MERGE-BUCKETS** |
| Accrual **only** on sheet close | SRS Diễn biến **#1** approve OT |
| Panel row / catalog alone = FR-06 DONE | **AC-ATT-06-≠-PANEL/CATALOG-DONE** |
| Credit without §5.2 ledger when engine LIVE | **AC-ATT-06-IDEM** |
| Wipe ATT-04/05b/09 peer paths | **must_keep** seals |

---

## 5. GAP / HOLD / RETAIN matrix (dev unlock)

| ID | API surface | Disposition | Owner | Entry |
|----|-------------|-------------|-------|-------|
| **R-ATT-06-PANEL-FE** | §4.1 on comp leave form | **GAP FE** | **dev-fe FE-01** | **J-HRM-ATT-06-05** · **ATT05BQC1** |
| **R-ATT-06-OT-PICKER** | §4.5 + §4.7 EFF | **GAP FE partial** | **dev-fe FE-01** | **J-HRM-ATT-06-02** |
| **R-ATT-06-POLICY** | §4.8 | **GAP NOT LIVE** | **dev-be BE-01** | Migrate §5.1 + GET/PUT |
| **R-ATT-06-ACCRUE** | §4.6/§4.9 | **GAP NOT LIVE** | **dev-be BE-01** | Approve hook + §5.2 |
| **R-ATT-06-DRAFT/OFF-MID/IDEM/TYPE-MAP** | §4.4–4.6 | **AC on BE** | **dev-be** + **qa** | J-03/06/07 |
| **R-ATT-06-INTERIM** | §4.3 | **RETAIN** | **qa** U65 label | J-04 path B |
| **R-ATT-06-AGG** | §4.10 | **HOLD footer** | **dev-be** when engine LIVE | ATT-10 |
| **R-ATT-06-PAY-DOUBLE** | PAY slice | **OUT** | PAY | Footer |
| **RETAIN spine** | §4.1–4.7 | **PRESENT** | **qa** regression | Must not regress |

**Default execution lane:** **dev-be BE-01** after this API stamp + program migrate waiver · **dev-fe FE-01** parallel for picker/panel GAP · **qa** U65 **J-HRM-ATT-06-02..06** mandatory.

---

## 6. Scope parity (U19)

| Surface | Resolver | Parity rule |
|---------|----------|-------------|
| `GET …/leave-balance/panel` | Employee + company scope | Must match embed deep link |
| `GET …/leave-balance?leave_type=compensatory` | Same as panel employee | **FAIL** if panel shows comp but by-type **404** |
| `GET …/overtime-requests/:id` | OT list scope | **FAIL** if approve credits wrong `company_id` bucket |
| `GET/PUT …/ot-comp-leave-policy` | Company slug | Same as OT/leave admin scope |
| `POST …/overtime-requests/:id/approve` | OT row `company_id` | Accrual ledger company **must** match OT row |

---

## 7. Traceability (SRS → API → DB → Test)

| SRS Diễn biến | API | DB | Test hook |
|---------------|-----|-----|-----------|
| Tiên quyết toggle + ratio | **F-ATT-OT-COMP-POLICY** §4.8 GAP | §5.1 | **J-HRM-ATT-06-01** |
| **#1** Duyệt OT → quỹ | §4.6 approve + §4.9 GAP (or §4.3 interim) | §5.2 + comp row | **J-HRM-ATT-06-03/04** |
| **#2** Đơn nghỉ bù | §4.4 **F-ATT-LEAVE-02** | `pending_days` | **J-HRM-ATT-06-05/06** |
| Luồng **3** mode OFF | §4.8 PUT + §4.6 skip accrual | §5.1 | **J-HRM-ATT-06-07** |
| Catalog orthogonal | §4.7 **F-ATT-CAT-OTC** | `att_ot_comp_type` | **J-HRM-ATT-06-02** |

---

## 8. completion_report

| | |
|--|--|
| **Closed** | F.1 **CONFIRMED RETAIN + GAP MAP** for UC-BP-ATT-06: deepened **F-ATT-OT-COMP-POLICY** (`GET/PUT …/ot-comp-leave-policy` → DATA §5.1) · **F-ATT-OT-COMP-ACCRUE** (approve side-effect → DATA §5.2 + SRS Diễn biến **#1**) · **RETAIN cite** **F-ATT-LEAVE-BAL** panel/by-type/grant · **F-ATT-LEAVE-02** hold · **F-ATT-OT-TXN** · **F-ATT-CAT-OTC** · context **F-ATT-SHEET-01/02** (close **≠** accrual) · invariants DENY `att_leave_hold` · merge buckets · sheet-close trigger · must_keep full peer QC chain · docs-only · **≠ ATT-06 / ATT UAT DONE** |
| **Residual (open)** | **dev-be BE-01** migration + hook implementation · **dev-fe FE-01** picker + comp leave panel · **qa** J-HRM-ATT-06-* U65 · **qc** GWC C-SLICE · **R-ATT-06-AGG** footer when engine lands |
| **next_owner** | **dev-be** (BE-01 primary) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN + GAP MAP** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01.md` |

### 8.1 next_dispatch_prompt (copy-ready — dev-be BE-01)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-01
role: dev-be
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-33 seat #39)
lane: execution · UC-BP-ATT-06 · sa API-01 PASS_TO_PM stamped
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01.md (F.1 §4.6–4.9 policy + accrual · RETAIN §4.1–4.7)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01.md §5.1 att_ot_comp_leave_policy · §5.2 att_ot_comp_accrual_ledger
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01.md (AC-ATT-06-* · J-HRM-ATT-06-*)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-06 Diễn biến #1–#2
  - apps/api/hrm-api/src/attendance/attendance-requests.service.ts (approveOvertimeRequest baseline)
  - apps/api/hrm-api/src/attendance/leave-balance.service.ts (compensatory row)
entry_criteria: sa API-01 stamped · program migrate waiver for §5.1+§5.2 · must_keep ATT05BQC1 + ATT09QC1 pending_days
exit_criteria:
  - Prisma/SQL migration: att_ot_comp_leave_policy + att_ot_comp_accrual_ledger per DATA-01 §5
  - Controller: GET/PUT /api/hrm/attendance/ot-comp-leave-policy per API-01 §4.8
  - approveOvertimeRequest: policy ON + comp maps leave → idempotent credit per API-01 §4.6/§4.9 (≠ sheet close)
  - RETAIN pending_days hold on comp leave · DENY att_leave_hold · DENY merge compensatory/carry→annual
  - jest: draft guard · mode OFF skip · idempotent double-approve · scope parity OT approve vs ledger company_id
  - spec_read_ack filled · @CODE-MEMORY APPEND · ack_status READY_FOR_QA
cấm: seed UAT evidence · invent att_leave_hold · accrual trigger only on sheet close · honesty flip · wipe peer seals
```

### 8.2 next_dispatch_prompt (copy-ready — pm orchestration hint)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-06-CLUSTER-PM-01
role: pm
lane: governance
entry_criteria: API-01 PASS_TO_PM @ docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01.md
exit_criteria:
  - Dispatch dev-be BE-01 (primary) · dev-fe FE-01 HOLD parallel for R-ATT-06-PANEL-FE/OT-PICKER
  - Update PO_HRM_MVP_GD1_CONTINUOUS.md seat #39 API stamped
  - No attendance_uat_ready flip · C-SLICE honesty
cấm: claim ATT-06 or ATT module UAT DONE from API pack alone
```

---

## Footer — honesty

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-06 / FR-06 DONE** · **≠ ATT-05b DONE** (`ATT05BQC1-MSM5SDQC1`) · **≠ ATT-05 DONE** (`ATT05QC1-MSM52GWC1`) · **≠ ATT-04/04b DONE** · **≠ ATT UAT** · must_keep **ATT09QC1** · **DENY** merge buckets · **DENY** panel/catalog alone DONE · no seed · no apps/**
