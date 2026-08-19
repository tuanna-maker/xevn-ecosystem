# PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01 — API F.1 · Mở quỹ & ca mặc định khi Hoạt động · RETAIN peers + GAP enroll consumer + shift bind (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-36 seat **#41**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-CORE-ACT-01** + **R-CORE-07-ATT-12** emit-only · **F-ATT-LVRULE EFF** · **F-ATT-LEAVE-BAL** read/panel · **PUT tracked-entitlement** (manual parallel) · **F-ATT-CAT-SHIFT EFF** · **F-ATT-RULE-01** (ATT-02 peer read) · **GAP** **F-ATT-LEAVE-BAL enroll-on-activate** (consumer + ledger) · **GAP** **F-ATT-SHIFT-02** narrow `activate_default` · physical **`/api/hrm/employees/*`** (activate) + **`/api/hrm/attendance/*`** (grant/shift) · paper `/att/*` + `/core/*` **alias only** · Nest `@Controller('core')` **DENY** · **HOLD** **F-ATT-LEAVE-04** / **R-ATT-04-ENGINE** · **HOLD** **R-ATT-12-HALF-MONTH** logic (no new policy API) · **DENY** invent `att_leave_hold` · **DENY** merge sick/compensatory/carry→`annual` · **DENY** grant/shift on CORE beyond emit · **DENY** reopen **J-HRM-ATT-07-01..07** / **J-HRM-ATT-06-04** · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED RETAIN + GAP MAP** — LIVE RETAIN LVRULE/ledger/manual grant/shift catalog **PRESENT** · CORE emit **RETAIN cite** · consumer + enroll + default shift **ABSENT** until migrate DATA §6.1/§6.2 + dev-be BE-01 · **unlock dev-be BE-01** (HOLD lifted by this stamp) · **dev-fe FE-01 HOLD** (HCNS confirm strip) · **≠ ATT-12 / FR-12 DONE** · **≠ ATT-07/06/05/05b/04 DONE** · **≠ ATT UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-ATT-12` · `FR-UC-BP-ATT-12` · **BR-BP-LC-03** · peer **FR-UC-BP-CORE-07** · **R-CORE-07-ATT-12** |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O16 **CONFIRMED** · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-12-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-12-CLUSTER-DATA-01.md) §6.1 `att_activate_enroll_ledger` · §6.2 `att_shift_assignment` · [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md) · [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md) · [`PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01.md) · **R-ATT-12-CONSUMER/LEAVE-GRANT/HALF-MONTH/SHIFT-DEFAULT/IDEMPOTENT/FE-CONFIRM** · **R-ATT-04-ENGINE HOLD** · **R-ATT-01-ASSIGN open** (narrow slice only) · **`CORE07QC1-KZJTSHNT`** · **`ATT07QC1-MSM9GWC1`** · **`ATT07QA1-MSM9IFO1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **`ATT09QC1-MSLUTL9D`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** |
| **ref_data** | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-DATA-01.md` §5 AC map · §6.1 idempotency · §6.2 shift assignment |
| **ref_ba** | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01.md` — AC-ATT-12-* · **J-HRM-ATT-12-01..07** DRAFT · regression **J-HRM-ATT-06-04** · **J-HRM-ATT-07-03..05** |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-SA-01.md` §5 F.1 sketch |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-12** · Diễn biến **#1 · #2** · Luồng chính **1–4** · **BR-BP-LC-03** · đặc biệt «Hoạt động cuối tháng» → nửa tháng phép |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` — F-CORE-ACT-01 · F-ATT-LVRULE · F-ATT-LEAVE-BAL · F-ATT-CAT-SHIFT · F-ATT-SHIFT-02 |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.2 `att_shift_assignment` · §4.4b **`pending_days`** · **DENY** `att_leave_hold` |
| **ref_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qc-01.md` — **ATT07QC1** must_keep · **DENY reopen J-07 / J-06-04** |
| **ref_code_cite** | **read-only 2026-08-10:** `employees.service` activate + emit pattern · `leave-balance.service` + `PUT tracked-entitlement` · `att-leave-accrual-policy.service` effective · `work-shifts*` · **ABSENT:** `employee.activated` attendance listener · `shift-assignments*` writer · `att_activate_enroll_ledger` · CREATE `att_shift_assignment` · grep **`att_leave_hold` CREATE = 0** |
| **Honesty** | **`attendance_uat_ready=false`** · **`contracts_printable_ready=false` RETAIN** · **C-SLICE** · **DENY** emit alone = FR-12 DONE · **DENY** manual tracked-entitlement alone = auto-enroll DONE · **DENY** ATT-12 / ATT-07/06/05/05b/04 / ATT UAT DONE · **DENY reopen J-HRM-ATT-07-*** / **J-HRM-ATT-06-04** without regression bus |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN + GAP MAP** |
| **unlock_lane** | **dev-be BE-01** (migrate §6.1/§6.2 + consumer + grant + shift bind + idempotency) · **dev-fe FE-01 HOLD** (profile strip) · **qa** U65 **J-HRM-ATT-12-*** + regression **J-06-04** · **J-07-03..05** when grant paths touched |

---

## 1. Verdict — RETAIN CORE emit + ATT-04/01 peers + documented GAP consumer/grant/shift

| Decision | Stamp |
|----------|--------|
| CORE activate + emit | **RETAIN cite** — **`POST …/employees/:id/activate`** (or gated PATCH) · **`employee.activated`** in 2xx · **OUT** grant/shift on employees.service (**O1/O14**) |
| Emit alone = FR-12 DONE | **DENY** — **AC-ATT-12-≠-EMIT-DONE** |
| ATT-12 consumer | **GAP** — **R-ATT-12-CONSUMER** in attendance lane (**O2**) |
| LVRULE effective read | **RETAIN** — **`GET …/leave-accrual-policies/effective`** per `leave_type_key` (**O3**) |
| Auto grant on activate | **GAP** — **F-ATT-LEAVE-BAL enroll-on-activate** → upsert `employee_leave_balances` (**O4**) |
| Manual HR grant | **RETAIN** — **`PUT …/leave-balance/tracked-entitlement`** parallel · **≠** auto consumer DONE (**O5**) |
| Half-month pro-rata | **HOLD** — **R-ATT-12-HALF-MONTH** branch in consumer when `effective_date` end-of-calendar-month (vi-VN) — **no** new fiscal API (**O6**) |
| Default shift bind | **GAP** — **F-ATT-SHIFT-02** narrow · `source=activate_default` · DATA §6.2 (**O7**) |
| ATT-02 rule peer | **RETAIN cite** — read `attendance/rules*` for resolve only · **CFG≠ATT-02 DONE** (**O8**) |
| Idempotency | **GAP** — consult **`att_activate_enroll_ledger`** DATA §6.1 · replay = no-op (**O10**) |
| ATT-09 hold | **must_keep** **`ATT09QC1`** — enroll **≠** submit **`pending_days`** · **DENY** `att_leave_hold` (**O11**) |
| ATT-07/06/05 peers | **must_keep** **`ATT07QC1`** · **`ATT06QC1`** · **`ATT05BQC1`** · **`ATT05QC1`** · **DENY merge** buckets · **DENY reopen J-07 / J-06-04** (**O12**) |
| Periodic accrue | **HOLD** — **F-ATT-LEAVE-04** · **R-ATT-04-ENGINE** · **≠** ATT-12 slice DONE (**O13**) |

```text
  CORE07QC1 (emit-only) · ATT07QC1 · ATT06QC1 · ATT05BQC1 · ATT05QC1 · ATT09QC1 · ATT04* — must_keep
  Nest /core DENY · honesty false · PAY OUT · C-SLICE · DENY merge buckets · DENY reopen J-07/J-06-04
       │
       │  CORE: F-CORE-ACT-01 activate → R-CORE-07-ATT-12 employee.activated (RETAIN · ≠ FR-12 DONE)
       ▼
  FR-UC-BP-ATT-12 (attendance lane)
       │
       ├─ RETAIN LIVE (cite — necessary not sufficient)
       │    GET leave-accrual-policies/effective (ATT-04)
       │    GET leave-balance / panel
       │    PUT leave-balance/tracked-entitlement (manual parallel)
       │    GET work-shifts/effective + ATT-02 rules read (ATT-01)
       │
       ├─ GAP (post-migrate §6.1/§6.2 · dev-be BE-01)
       │    R-ATT-12-CONSUMER on employee.activated
       │    F-ATT-LEAVE-BAL enroll-on-activate (internal or POST …/enroll-on-activate)
       │    R-ATT-12-HALF-MONTH branch on entitled upsert (HOLD formula in service)
       │    F-ATT-SHIFT-02 PUT shift-assignments activate_default
       │    R-ATT-12-IDEMPOTENT via att_activate_enroll_ledger
       │
       └─ DENY / HOLD
            att_leave_hold table · merge sick/comp/carry→annual
            grant logic in employees.service beyond emit
            Nest /core enroll SoT
            F-ATT-LEAVE-04 periodic job LIVE claim
            emit or manual grant alone = FR-12 DONE
```

**Invariant ATT-12-PATH (O15):** Activate Network **MUST** hit `/employees/` · grant/shift consumer **MUST** hit `/api/hrm/attendance/*` — Nest `/api/hrm/core/**` as enroll SoT = **FAIL** (**AC-ATT-12-PATH**).

**Invariant ATT-12-≠-EMIT-DONE (O1):** `employee.activated` in `events[]` alone = FR-12 / ATT-12 DONE = **FAIL**.

**Invariant ATT-12-≠-MANUAL-AUTO-DONE (O5):** HR **PUT tracked-entitlement** alone satisfies SRS auto-enroll = **FAIL**.

**Invariant ATT-12-HOLD-DUAL (O4/O11):** Invent physical `att_leave_hold` = **FAIL** (**ATT09QC1**).

**Invariant ATT-12-≠-MERGE (O12):** Fold sick/compensatory/carry into `annual` ledger or panel = **FAIL** (**ATT07QC1** · **ATT06QC1** · **ATT05QC1**).

**Invariant ATT-12-CORE-BOUNDARY (O14):** Grant/shift persist logic inside `employees.service` beyond emit = **FAIL**.

**Invariant ATT-12-≠-REOPEN-J07 (O12):** Reopen **J-HRM-ATT-07-01..07** or **J-HRM-ATT-06-04** without regression bus = **FAIL**.

**Invariant ATT-12-CONSUMER-HOLD-LABEL:** Claim FR-12 DONE when consumer/grant/shift GAP not LIVE = **FAIL** — footer **HOLD** on **J-HRM-ATT-12-03/04** until BE.

**Invariant ATT-12-U19:** `leave-accrual-policies/effective` · `leave-balance*` · `work-shifts/effective` · future `shift-assignments*` **same** `resolveHrmListScope` family as employee profile under `main` CEO.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-12 / FR-12 DONE** · **≠ ATT-07 / FR-07 DONE** (`ATT07QC1`) · **≠ ATT-06 / ATT-05b / ATT-05 / ATT-04 DONE** · **≠ ATT UAT** · printable false · PAY OUT · must_keep **`CORE07QC1-KZJTSHNT`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **`ATT09QC1-MSLUTL9D`** · **`ATT04*`** · **R-ATT-04-ENGINE HOLD** · **R-ATT-01-ASSIGN open** (narrow slice ≠ full grid DONE) · **DENY `att_leave_hold`** · **DENY merge** sick/compensatory/carry→annual · **DENY reopen J-HRM-ATT-07-*** / **J-06-04** · emit **necessary not sufficient** · no seed · no apps/** this seat

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **CORE activate (RETAIN)** | **`POST /api/hrm/employees/:employeeId/activate`** **or** gated **`PATCH /api/hrm/employees/:employeeId`** (`status=active` + `effective_date`) |
| **CORE emit (RETAIN)** | Event **`employee.activated`** in 2xx envelope / realtime seam — **not** a REST path |
| **ATT LVRULE (RETAIN)** | **`GET /api/hrm/attendance/leave-accrual-policies/effective`** |
| **ATT ledger read (RETAIN)** | **`GET /api/hrm/attendance/leave-balance`** · **`GET …/leave-balance/panel`** |
| **ATT manual grant (RETAIN)** | **`PUT /api/hrm/attendance/leave-balance/tracked-entitlement`** |
| **ATT auto enroll (GAP)** | **Internal** handler **or** proposed **`POST /api/hrm/attendance/leave-balance/enroll-on-activate`** — **ABSENT** 2026-08-10 |
| **ATT shift catalog (RETAIN)** | **`GET /api/hrm/attendance/work-shifts/effective`** |
| **ATT shift assign (GAP)** | Proposed **`PUT /api/hrm/attendance/shift-assignments`** (narrow `activate_default`) — **ABSENT** Nest writer |
| **ATT rule peer (RETAIN cite)** | **`GET/PATCH …/attendance/rules*`** (ATT-02 · CFG≠DONE) |
| **Periodic accrue (HOLD)** | Paper `POST …/leave-balances/accrue` — **no LIVE route** |
| **LOGICAL (paper)** | `/api/hrm/att/…` · `/api/hrm/core/…` — **alias only** |
| **Controller** | Nest `@Controller('attendance')` for ATT surfaces · **`@Controller('core')` ABSENT** |

| Paper / logical | Physical | DB (DATA-12) |
|-----------------|----------|--------------|
| F-CORE-ACT-01 | `POST …/employees/:id/activate` | `employees.status` only on CORE |
| R-CORE-07-ATT-12 | event payload | **no** grant cols on EMP |
| F-ATT-LVRULE EFF | `…/leave-accrual-policies/effective` | `att_leave_accrual_policy` **RETAIN** |
| F-ATT-LEAVE-BAL grant (auto) | enroll-on-activate GAP | `employee_leave_balances` **RETAIN** |
| F-ATT-LEAVE-BAL manual | `PUT …/tracked-entitlement` | same table **RETAIN** |
| Paper `held` | submit hold (peer ATT-09) | **`pending_days`** · **DENY** `att_leave_hold` |
| F-ATT-CAT-SHIFT EFF | `…/work-shifts/effective` | `work_shifts` **RETAIN** |
| F-ATT-SHIFT-02 | `…/shift-assignments` | `att_shift_assignment` **ADD §6.2 NOT LIVE** |
| Idempotency | consumer consult | `att_activate_enroll_ledger` **ADD §6.1 NOT LIVE** |
| F-ATT-LEAVE-04 | — | **HOLD R-ATT-04-ENGINE** |

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-12 verdict |
|---------|------------|----------------|
| CORE activate + emit | **CORE07QC1** sealed · wire cite | **RETAIN** · **≠** ATT-12 DONE |
| `leave-accrual-policies/effective` | `att-leave-accrual-policy.service` | **RETAIN** **AC-ATT-12-LVRULE-EFF** |
| `employee_leave_balances` upsert | `leave-balance.service` | **RETAIN** **AC-ATT-12-LEDGER** |
| `PUT tracked-entitlement` | controller + service | **RETAIN** **AC-ATT-12-MANUAL-GRANT** |
| `work-shifts/effective` | `work-shifts*` | **RETAIN** peer ATT-01 |
| `employee.activated` consumer | grep listener **0** | **GAP** **AC-ATT-12-CONSUMER** |
| enroll-on-activate API/handler | grep **0** | **GAP** §4.6 |
| `shift-assignments*` | grep **0** | **GAP** §4.8 |
| `att_activate_enroll_ledger` | grep **0** | **GAP** §4.5 (idempotency) |
| `att_shift_assignment` table | CREATE **0** | **ADD** §6.2 not LIVE |
| `att_leave_hold` | CREATE **0** | **DENY invent** |
| Nest `/core` enroll | **ABSENT** | **DENY** |

---

## 4. F.1 — endpoints (normative)

> Deepen **ATT-12** GAP functions; re-cite **RETAIN** peers per ATT-04 API-01 §4.9–4.11 · ATT-01 API-01 §4.3 · CORE-07 API-01 §7.

### 4.1 F-CORE-ACT-01 + R-CORE-07-ATT-12 — Kích hoạt & emit (**RETAIN cite · CORE-07**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/employees/:employeeId/activate`** **or** gated **`PATCH /api/hrm/employees/:employeeId`** |
| **Paper alias** | `POST /api/hrm/core/employees/{id}/activate` — **alias only** |
| **Mục đích** | Kích hoạt hồ sơ **Hoạt động** — GATE checklist · phát tín hiệu cho ATT-12; **không** cấp quỹ/ca trên CORE seat. |
| **Nghiệp vụ xử lý** | Per **CORE-07 API-01** §4–§7: GATE → `status=active` → `effective_date` `dd/MM/yyyy` → on 2xx emit **`employee.activated`** `{ employee_id, company_id, effective_date }` · **cấm** upsert `employee_leave_balances` · **cấm** write shift assignment in `employees.service` · idempotent emit on retry prefer same event semantics. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-12** Diễn biến **#1** (input signal) · peer **FR-UC-BP-CORE-07** Luồng **#3** · **AC-ATT-12-CORE-EMIT** · **AC-ATT-12-≠-EMIT-DONE** · **AC-ATT-12-MK-CORE07** · **J-HRM-ATT-12-01/02** |
| **Request → DB** | `employees.status` · wire `effective_date` (typed `activated_at` HOLD per CORE DATA) |
| **Response** | 2xx + `events[]` contains readable **`employee.activated`** |
| **Lỗi** | `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` **409** · scope **404/409** · **≠** FR-12 DONE on 2xx alone |

### 4.2 F-ATT-LVRULE-04 — GET chính sách quỹ hiệu lực (**RETAIN · ATT-04**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-accrual-policies/effective`** (`leave_type_key?`, `as_of?`, `company_id`) |
| **Paper alias** | F-ATT-LVRULE EFF |
| **Mục đích** | Consumer đọc policy published per loại phép tại ngày kích hoạt — **cấm** ad-hoc `annual_days` bypass policy. |
| **Nghiệp vụ xử lý** | **RETAIN cite** ATT-04 API-01 §4.7 · resolve effective window · empty policy for type → skip upsert for that type (no invent amounts) · U19 same scope as grant target employee `company_id`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-12** tiên quyết Diễn biến **#2** · **BR-BP-LV-01** (peer) · **AC-ATT-12-LVRULE-EFF** · **J-HRM-ATT-12-03** |
| **Request → DB** | Read `att_leave_accrual_policy` |
| **Lỗi** | `HRM-SCOPE-409` |

### 4.3 F-ATT-LEAVE-BAL-01 / PANEL — GET số dư & panel (**RETAIN · ATT-04/05b**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-balance`** · **`GET …/leave-balance/panel`** |
| **Paper alias** | F-ATT-LEAVE-BAL read |
| **Mục đích** | HCNS/NV xác nhận quỹ sau enroll — Luồng **#4**; panel MVP **5 buckets** tách **`compensatory`** · **`carry_over`** · **không** merge sick→`annual`. |
| **Nghiệp vụ xử lý** | **RETAIN cite** ATT-04 §4.9–4.10 · `pending_days` = paper held · **must_keep ATT06QC1** · **ATT05QC1** · **ATT07QC1** panel semantics · **cấm** fold buckets. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-12** Luồng **#4** · **AC-ATT-12-FE-CONFIRM** (read model) · **J-HRM-ATT-12-03/05** |
| **Request → DB** | `employee_leave_balances` |
| **Lỗi** | Scope · safe empty |

### 4.4 F-ATT-LEAVE-BAL-GRANT-MANUAL — PUT tracked-entitlement (**RETAIN · parallel path**)

| | |
|--|--|
| **METHOD / path** | **`PUT /api/hrm/attendance/leave-balance/tracked-entitlement`** |
| **Paper alias** | F-ATT-LEAVE-BAL manual |
| **Mục đích** | HR cấp/điều chỉnh **`entitled_days`** tay — song song consumer auto-enroll; tenant tắt auto hoặc override sau activate. |
| **Nghiệp vụ xử lý** | **RETAIN cite** ATT-04 §4.11 · ATT-09 **ATT09QC1** · upsert same columns as auto path · assert-consumer when policy active>0 · **≠** substitute **R-ATT-12-LEAVE-GRANT** DONE claim. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-12** alternate **BR-BP-LC-03-MANUAL** · **AC-ATT-12-MANUAL-GRANT** · **AC-ATT-12-≠-MANUAL-AUTO-DONE** |
| **Request → DB** | UPSERT `employee_leave_balances.entitled_days` (and peers per LIVE DTO) |
| **Lỗi** | `HRM-ATT-LVRULE-KEY` · scope |

### 4.5 R-ATT-12-IDEMPOTENT — Idempotency store (**GAP · DATA §6.1**)

| | |
|--|--|
| **Function ID** | **R-ATT-12-IDEMPOTENT** |
| **Surface** | **Internal** — consulted by consumer before grant/shift writes; optional admin read later |
| **Physical table (post-migrate)** | **`att_activate_enroll_ledger`** — see DATA-01 §6.1 |
| **Mục đích** | Đảm bảo kích hoạt lại cùng `effective_date` / replay event **không** nhân đôi quỹ hoặc ca mặc định. |
| **Nghiệp vụ xử lý** | (1) Compute **`idempotency_key`** = `sha256(company_id ‖ employee_id ‖ effective_date)` **or** CORE `event_id` when present · (2) **BEGIN** transaction · (3) **INSERT** ledger row `ledger_status=completed` · on **UQ conflict** → **ROLLBACK** grant/shift side effects · return success no-op · (4) On first success: link `default_shift_assignment_id` when §6.2 row created · store optional `policy_snapshot_hash` · (5) **cấm** double `entitled` upsert on replay. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-12** implicit BR · **AC-ATT-12-IDEMPOTENT** · **J-HRM-ATT-12-07** |
| **DTO ↔ DB** | `idempotency_key` ↔ UQ · `employee_id` · `company_id` · `effective_date` · `grant_applied_at` · `default_shift_assignment_id?` |
| **Lỗi** | Duplicate open processing → deterministic no-op **2xx** consumer · corrupt replay → log + **no** second grant |

### 4.6 F-ATT-LEAVE-BAL-ENROLL — enroll-on-activate consumer (**GAP · R-ATT-12-LEAVE-GRANT**)

| | |
|--|--|
| **Function ID** | **F-ATT-LEAVE-BAL enroll-on-activate** (program name; paper may alias grant-on-activate) |
| **METHOD / path (target)** | **Internal** subscriber on `employee.activated` **or** **`POST /api/hrm/attendance/leave-balance/enroll-on-activate`** body `{ employeeId, companyId, effectiveDate }` — **service-role / system only** · **not** HR manual CTA substitute |
| **Paper alias** | `/api/hrm/att/leave-balance/enroll-on-activate` · `/core` — **alias only** |
| **Mục đích** | Sau Hoạt động: khởi tạo **`employee_leave_balances`** theo chính sách hiệu lực — NV có quỹ ngày đầu **không** cần PUT tay (trừ tenant policy tắt auto). |
| **Nghiệp vụ xử lý** | (1) **§4.5** idempotency PASS first · (2) Load employee dept/OU for scope · (3) For each configured `leave_type_key` with **§4.2** effective policy: compute **`entitled`** from policy `annual_days` / `accrual_mode` / unit · (4) **R-ATT-12-HALF-MONTH HOLD branch:** when `effective_date` is **last calendar day** of month (vi-VN): apply pro-rata formula stamped in BA (e.g. `entitled = floor(policy_annual_days / 2)` or policy-driven half — **document exact formula in BE CODE-MEMORY**; **no** new API) · else full policy amount for balance_year = calendar year of `effective_date` unless FY HOLD footer applies · (5) UPSERT `(company_id, employee_id, leave_type, balance_year)` same columns as **§4.4** manual path · **cấm** invent amounts bypassing LVRULE · **cấm** merge `compensatory`/`carry_over`/sick into `annual` key · **cấm** `att_leave_hold` · (6) Complete §4.5 ledger row · (7) **≠** F-ATT-LEAVE-04 periodic job. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-12** Diễn biến **#2** (quỹ) · **BR-BP-LC-03** · **BR-BP-LC-03-HALF** · **AC-ATT-12-LEDGER** · **AC-ATT-12-HALF-MONTH** · **J-HRM-ATT-12-03** |
| **Request → DB** | Read `att_leave_accrual_policy` · UPSERT `employee_leave_balances` (`entitled_days` / LIVE col names) · INSERT `att_activate_enroll_ledger` |
| **Response (if exposed POST)** | `{ enrolled: true, balanceYears: number[], idempotencyKey, skipped?: false }` · replay `{ enrolled: false, skipped: true }` |
| **Lỗi** | Scope **409** · employee not `active` **409** · policy missing for required type → skip or **409** per tenant rule (deterministic — document in BE) · **HRM-ATT-LVRULE-KEY** if illegal manual params smuggled |

### 4.7 R-ATT-12-CONSUMER — Event wiring (**GAP**)

| | |
|--|--|
| **Residual ID** | **R-ATT-12-CONSUMER** |
| **Trigger** | **`employee.activated`** after CORE **2xx** (in-proc handler, outbox, or queue — same tenant context as activate) |
| **Mục đích** | Nối tín hiệu CORE-07 với **§4.6** + **§4.8** trong attendance module — **không** trên CORE controller. |
| **Nghiệp vụ xử lý** | Subscribe once per deployment · deserialize payload min fields · call enroll grant + shift bind in **one transactional unit** prefer · emit metric/log for QA evidence · **cấm** Nest `/core` duplicate consumer SoT. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-12** Diễn biến **#1** · **AC-ATT-12-CONSUMER** · **J-HRM-ATT-12-02** |
| **Lỗi** | Handler failure → retry safe via **§4.5** · poison message → DLQ (platform pattern) |

### 4.8 F-ATT-SHIFT-02 — Gán ca mặc định khi activate (**GAP · narrow slice**)

| | |
|--|--|
| **METHOD / path (target)** | **`PUT /api/hrm/attendance/shift-assignments`** (upsert one open row) **or** internal write from consumer |
| **Paper alias** | `/api/hrm/att/shift-assignments` — **alias only** |
| **Mục đích** | Gán **ca mặc định** theo bộ phận/OU + rule ATT-02 khi hồ sơ Hoạt động — narrow **R-ATT-01-ASSIGN** · **≠** full lịch GĐ2 DONE. |
| **Nghiệp vụ xử lý** | (1) After **§4.5** idempotency allows work · (2) Resolve employee `department_id` / OU at activate · (3) Read **F-ATT-RULE-01** / ATT-02 specificity → pick `shift_id` from **§4.9** effective catalog · (4) INSERT **`att_shift_assignment`** `source='activate_default'` · `effective_from = effective_date` · `effective_to = NULL` · partial UQ: one open `activate_default` per employee (**DATA §6.2**) · (5) On duplicate open row → **409** `HRM-ATT-SHIFT-ASSIGN-DUP` · (6) Manual ASSIGN later may set `effective_to` on prior row (supersede) · **cấm** company-wide single rule replacing dept assignment · **cấm** claim full roster DONE. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-12** Diễn biến **#2** (ca) · **BR-BP-SHF-01** (peer) · **AC-ATT-12-SHIFT-DEFAULT** · **J-HRM-ATT-12-04** |
| **Request → DB** | INSERT `att_shift_assignment` (§6.2) · FK `work_shifts.id` |
| **Request DTO (target)** | `{ employeeId, companyId, shiftId, effectiveFrom, source: 'activate_default', departmentId? }` |
| **Response** | `{ assignmentId, shiftId, shiftCode?, shiftName?, effectiveFrom }` display-ready |
| **Lỗi** | Shift OOS scope **404** · inactive shift **409** · duplicate open default **409** |

### 4.9 F-ATT-CAT-SHIFT-EFF-01 — Ca hiệu lực (**RETAIN cite · ATT-01**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/work-shifts/effective`** |
| **Mục đích** | Assert `shift_id` in §4.8 resolves in tenant catalog — picker/catalog SoT. |
| **Nghiệp vụ xử lý** | **RETAIN cite** ATT-01 API-01 §4.3 · U19 parity with assignment mutate. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-12** tiên quyết ca · peer **FR-UC-BP-ATT-01** |
| **Disposition** | **RETAIN** — **≠** ATT-01 DONE alone |

### 4.10 F-ATT-RULE-01 — Rule BP (**RETAIN cite · ATT-02**)

| | |
|--|--|
| **METHOD / path** | **`GET/PATCH …/attendance/rules*`** (read for resolve in consumer) |
| **Mục đích** | Đọc rule độ ưu tiên dept/OU → default ca — **CFG≠ATT-02 DONE**. |
| **Nghiệp vụ xử lý** | Read-only in ATT-12 consumer path · **cấm** wipe ATT-02 seals. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-12** resolve default · **AC-ATT-12-MK-ATT02** |
| **Disposition** | **RETAIN cite** |

### 4.11 F-ATT-LEAVE-02 — POST đơn phép sau enroll (**RETAIN cite · peer ATT-09 · regression only**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/leave-requests`** |
| **Mục đích** | Document cross-ref — sau enroll NV nộp đơn · **`pending_days`** hold · **≠** enroll hold table. |
| **Nghiệp vụ xử lý** | **must_keep ATT09QC1** · **DENY** `att_leave_hold` · when grant paths touched re-run **J-HRM-ATT-07-03..05** · **J-HRM-ATT-06-04**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-12** post-condition · **J-HRM-ATT-12-06** |
| **Disposition** | **RETAIN cite** — ATT-12 wave **must not** regress sick/comp panel |

### 4.12 F-ATT-LEAVE-04 — Tích lũy định kỳ (**HOLD · R-ATT-04-ENGINE**)

| | |
|--|--|
| **METHOD / path** | Paper job — **NO LIVE Nest route** |
| **Mục đích** | Periodic accrue — SRS giai đoạn sau · **≠** activate enroll. |
| **Nghiệp vụ xử lý** | **HOLD** per ATT-04 API-01 §4.12 · **DENY** claim LIVE = ATT-12 DONE. |
| **Tham chiếu bước SRS** | Peer ATT-04 · **AC-ATT-12-ENGINE-HOLD** |
| **Disposition** | **HOLD footer** |

### 4.13 R-ATT-12-HALF-MONTH — Pro-rata cuối tháng (**HOLD logic · no new API**)

| | |
|--|--|
| **Residual ID** | **R-ATT-12-HALF-MONTH** |
| **Surface** | Branch inside **§4.6** service layer only |
| **Mục đích** | Khi kích hoạt **cuối tháng** (vi-VN calendar): số phép khởi tạo **nửa tháng** theo SRS đặc biệt + peer CORE-07. |
| **Nghiệp vụ xử lý** | Detect `effective_date` = last day of month (timezone tenant default Asia/Ho_Chi_Minh) · apply BA-stamped formula on `entitled` per policy type · **no** new fiscal table · **no** standalone REST endpoint · evidence **J-HRM-ATT-12-03** when LIVE. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-12** đặc biệt · **BR-BP-LC-03-HALF** · **AC-ATT-12-HALF-MONTH** |
| **Disposition** | **HOLD** until dev-be implements branch · **≠** optional skip for ATT-12 slice |

---

## 5. Closable-gap decision (unlock dev-be)

| Residual | LIVE? | Closable after DATA stamp? | Unlock |
|----------|-------|----------------------------|--------|
| CORE emit | **YES** (sealed) | N/A — RETAIN cite | **No change** on CORE seat |
| LVRULE + ledger + manual PUT | **YES** | N/A — RETAIN | **No spine BE** |
| Consumer + enroll + shift | **ABSENT** | **YES** — §6.1/§6.2 stamped closable | **dev-be BE-01** migrate + wire |
| Half-month branch | **ABSENT** | **YES** — app-layer in §4.6 | **dev-be** + **qa** J-03 |
| F-ATT-LEAVE-04 job | **ABSENT** by design | **HOLD** | ATT-04 engine wave |
| Full **R-ATT-01-ASSIGN** grid | **ABSENT** | **HOLD** | **≠** ATT-12 DONE |

**Verdict:** API-12 **CONFIRMED RETAIN + GAP MAP** → unlock **`PO-HRM-MVP-GD1-ATT-12-CLUSTER-BE-01`** after program waiver on migrate §6.

---

## 6. U19 scope_parity

| Operation | Path | Resolver family |
|-----------|------|-----------------|
| Employee activate | `POST …/employees/:id/activate` | employees scope |
| LVRULE effective | `GET …/leave-accrual-policies/effective` | attendance list scope |
| Grant read/write | `GET/PUT …/leave-balance*` | same as employee grant rows under `main` |
| Shift effective | `GET …/work-shifts/effective` | ATT-01 family |
| Shift assign (GAP) | `PUT …/shift-assignments` | **MUST** match catalog shift scope |
| Consumer tenant | event `company_id` | **MUST** match employee row |

**PASS:** Group CEO `main` → activate → F5 balances visible for same employee id deep link.  
**FAIL:** List shows employee but grant GET empty-mask / 404 scope.

---

## 7. Regression matrix (must_keep · DENY reopen)

| Seal | When ATT-12 touches grant/balance/shift | Journey |
|------|----------------------------------------|---------|
| **ATT07QC1** | Sick submit · fund-order · dayBranches | **J-HRM-ATT-07-03..05** — **DENY reopen J-07-01..07** |
| **ATT06QC1** | Panel `compensatory` separate | **J-HRM-ATT-06-04** — **DENY reopen J-06-04** |
| **ATT05BQC1** / **ATT05QC1** | `carry_over` row separate | panel regression |
| **ATT09QC1** | `pending_days` only | **DENY** `att_leave_hold` |
| **ATT04*** | LVT/LVRULE/grant spine | no wipe effective policies |

Any BE change to `leave-balance.service` grant upsert · `att-leave-accrual-policy` effective resolution · or new shift writer **must** attach regression evidence before ATT-12 QC seal.

---

## 8. DENY / must_keep / honesty

### DENY (this seat)

| Item | Why |
|------|-----|
| Physical `att_leave_hold` | **ATT09QC1** |
| Merge sick/compensatory/carry→`annual` | **ATT07/06/05** seals |
| Grant/shift in `employees.service` beyond emit | **CORE07** boundary |
| Nest `/core` enroll SoT | Option A |
| Claim emit or manual alone = FR-12 DONE | BA invariants |
| Claim F-ATT-LEAVE-04 LIVE = ATT-12 DONE | **R-ATT-04-ENGINE** |
| Reopen **J-HRM-ATT-07-*** / **J-06-04** without bus | **ATT07QC1** |
| Flip `attendance_uat_ready` / ATT module UAT | C-SLICE |
| Seed · `apps/**` this seat | U65 · docs-only |

### must_keep RETAIN

| Stamp | Retain |
|-------|--------|
| **`CORE07QC1-KZJTSHNT`** | activate GATE · emit only |
| **`ATT07QC1-MSM9GWC1`** · **`ATT07QA1-MSM9IFO1`** | sick order/branch · **DENY reopen J-07** |
| **`ATT06QC1-MSM84GWC1`** | compensatory sep · **J-06-04** |
| **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** | carry panel |
| **`ATT09QC1-MSLUTL9D`** | `pending_days` |
| **`ATT04BQC1`** · **`ATT04QC1-MSM22G4W`** | LVRULE/grant |
| LIVE `employee_leave_balances` · `att_leave_accrual_policy` · `work_shifts` | consumer inputs |

### Honesty (LOCKED false)

| Flag | Value |
|------|-------|
| `attendance_uat_ready` | **false** |
| `contracts_printable_ready` | **false** RETAIN |
| **≠ ATT-12 / FR-12 DONE** from API stamp alone | **LOCKED** |
| **C-SLICE-≠-MODULE** | **RETAIN** |

---

## 9. Traceability (SRS → API → test)

| SRS Diễn biến | API | Journey | QA expect |
|---------------|-----|---------|-----------|
| **#1** signal | §4.1 emit RETAIN | **J-HRM-ATT-12-01/02** | activate 2xx · event · **≠** DONE alone |
| **#1** consumer | §4.7 GAP | **J-HRM-ATT-12-02** | handler evidence when LIVE |
| **#2** quỹ | §4.2 + §4.6 GAP | **J-HRM-ATT-12-03** | F5 rows · half-month when stamped |
| **#2** ca | §4.8–4.9 GAP | **J-HRM-ATT-12-04** | default shift visible |
| Luồng **#4** | §4.3 RETAIN | **J-HRM-ATT-12-05** | FE strip GAP |
| Post enroll | §4.11 peer | **J-HRM-ATT-12-06** | `pending_days` |
| Seals / idempotent | §4.5 | **J-HRM-ATT-12-07** | Nest `/core` 0 · **≠** DONE |
| Regression | §7 | **J-06-04** · **J-07-03..05** | **ATT07QC1** non-regression |

---

## 10. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API-01 **CONFIRMED RETAIN + GAP MAP** for UC-BP-ATT-12 / FR-UC-BP-ATT-12: **RETAIN cite** F-CORE-ACT-01 + **R-CORE-07-ATT-12** emit-only (**≠** FR-12 DONE) · **RETAIN** F-ATT-LVRULE EFF · GET leave-balance/panel · **PUT tracked-entitlement** manual parallel (**≠** auto DONE) · **RETAIN** F-ATT-CAT-SHIFT EFF + F-ATT-RULE-01 read; **GAP F.1** **F-ATT-LEAVE-BAL enroll-on-activate** (consumer **§4.6–4.7**) with **R-ATT-12-IDEMPOTENT** (**DATA §6.1**) · **GAP F-ATT-SHIFT-02** narrow `activate_default` (**DATA §6.2**) · **HOLD** **R-ATT-12-HALF-MONTH** in consumer (**no** new API) · **HOLD** **F-ATT-LEAVE-04** / **R-ATT-04-ENGINE** footer; full **Mục đích · Nghiệp vụ · Bước SRS · DTO↔DB** per §4; **DENY** `att_leave_hold` · **DENY** merge buckets · **DENY** grant on CORE · **DENY reopen J-HRM-ATT-07-*** / **J-HRM-ATT-06-04**; must_keep **CORE07QC1** + **ATT07QC1** + full peer chain; U19 scope_parity §6; docs-only · unlock **dev-be BE-01**; **≠ ATT-12 / ATT UAT DONE** · C-SLICE. |
| **next_owner** | **dev-be** — `PO-HRM-MVP-GD1-ATT-12-CLUSTER-BE-01` |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN + GAP MAP** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01.md` |
| **residual** | BE migrate §6.1/§6.2 + consumer wire · FE confirm strip · QA J-* · QC GWC C-SLICE · **R-ATT-01-ASSIGN** full grid still OPEN |

### next_dispatch_prompt (copy-ready — dev-be BE-01)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-12-CLUSTER-BE-01
role: dev-be
lane: execution · UC-BP-ATT-12 · FR-UC-BP-ATT-12 · BR-BP-LC-03
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-36 seat #41)
depends_on: API-01 CONFIRMED RETAIN+GAP @ docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01.md · DATA-01 CONFIRMED HOLD §6.1 att_activate_enroll_ledger · §6.2 att_shift_assignment · BA O1–O16 · SA Option A · CORE07QC1-KZJTSHNT · ATT07QC1-MSM9GWC1 · ATT06QC1-MSM84GWC1 · ATT05BQC1-MSM5SDQC1 · ATT05QC1-MSM52GWC1 · ATT09QC1-MSLUTL9D · ATT04BQC1 · ATT04QC1-MSM22G4W · program migrate waiver for §6 ADD
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01.md (§4.5–4.8 GAP F.1 · §4.6 half-month HOLD branch · idempotency)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-DATA-01.md (§6.1–§6.2 physical cols · validation §8)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01.md (AC-ATT-12-* · J-HRM-ATT-12-*)
  - docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md (R-CORE-07-ATT-12 emit · DENY grant on employees.service)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md (LVRULE EFF · tracked-entitlement RETAIN · F-ATT-LEAVE-04 HOLD)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01.md (F-ATT-SHIFT-02 residual · R-ATT-01-ASSIGN narrow only)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qc-01.md (regression J-07-03..05 · J-06-04 · DENY reopen J-07)
spec_ref: FR-UC-BP-ATT-12 Diễn biến #1–#2 · BR-BP-LC-03 · BR-BP-LC-03-HALF · API-01 §4.5 idempotency · §4.6 enroll-on-activate · §4.7 consumer · §4.8 shift-assignments activate_default
change_mode: ADD · preserve_default · code_memory_required: true · code_memory_mode: APPEND
allowed_paths: apps/api/hrm-api/src/**/leave-balance* · att-leave-accrual* · work-shifts* · new shift-assignment* module · migration for att_activate_enroll_ledger + att_shift_assignment · attendance consumer listener · spec-mapped tests only
forbidden_paths: employees.service grant/shift beyond emit · invent att_leave_hold · merge compensatory/carry/sick into annual · sick fund-order/dayBranch regress · wipe ATT07QC1 peers · Nest /core controller · honesty flags
entry_criteria: hrm-api dev stack · CORE activate emit LIVE · API-01 + DATA §6 stamped
exit_criteria:
  1) Migrate §6.1 + §6.2 per DATA-01 (UQ idempotency_key · partial UQ open activate_default)
  2) R-ATT-12-CONSUMER: subscribe employee.activated → transactional §4.6 + §4.8
  3) Idempotency: replay activate same effective_date → no duplicate entitled / shift (AC-ATT-12-IDEMPOTENT)
  4) Grant: read leave-accrual-policies/effective · upsert employee_leave_balances same cols as PUT tracked-entitlement · R-ATT-12-HALF-MONTH branch when effective_date end-of-month (vi-VN)
  5) Shift: resolve shift from dept + ATT-02 rules · INSERT att_shift_assignment source=activate_default · U19 scope_parity
  6) RETAIN PUT tracked-entitlement unchanged behavior · must_keep ATT09 pending_days path
  7) Regression jest: scope_parity · idempotent enroll · half-month unit cases · no att_leave_hold CREATE
  8) READY_FOR_QA with evidence docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-be-01.md · U65 browser J-HRM-ATT-12-* + J-06-04 + J-07-03..05 when grant touched
  9) ack_status READY_FOR_QA · explicit ≠ ATT-12 DONE · ≠ ATT UAT · C-SLICE
cấm: seed · merge buckets · reopen J-HRM-ATT-07-* / J-06-04 without regression bus · claim FR-12 DONE from BE alone · F-ATT-LEAVE-04 LIVE · full R-ATT-01-ASSIGN grid DONE
```

---

## 11. Spec read ack (sa)

| Artifact | Cite |
|----------|------|
| DATA-01 | §6.1 idempotency · §6.2 shift · RETAIN ledger/LVRULE · DENY att_leave_hold |
| BA-01 | O1–O16 · AC-ATT-12-* · J-HRM-ATT-12-* · regression J-07/J-06-04 |
| SA-01 | Option A LOCKED · R-ATT-12-* residuals |
| CORE-07 API-01 | F-CORE-ACT-01 · R-CORE-07-ATT-12 emit OUT enroll |
| ATT-04 API-01 | LVRULE · tracked-entitlement · F-ATT-LEAVE-04 HOLD |
| ATT-01 API-01 | F-ATT-SHIFT-02 HOLD · R-ATT-01-ASSIGN open |
| ATT07QC1 | must_keep · DENY reopen J-07 / J-06-04 |

---

*End API-01 · CONFIRMED RETAIN + GAP MAP · unlock dev-be BE-01 · ≠ ATT-12 DONE · 2026-08-10*
