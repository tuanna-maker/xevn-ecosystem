# PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01 — API F.1 · F-ATT-CAT-LVT/EFF + F-ATT-LVRULE + ledger grant RETAIN (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-33 seat **#35**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-ATT-CAT-LVT-01/02** · **F-ATT-CAT-EFF-01** · **F-ATT-LVRULE-01..04** · **F-ATT-LVRULE-CNS** · **GET** `leave-balance` / `leave-balance/panel` · **PUT** `leave-balance/tracked-entitlement` — physical **`/api/hrm/attendance/*`** · paper `/att/*` + `/core/*` **alias only** · Nest `@Controller('core')` **DENY** · **F-ATT-LEAVE-04** accrue **HOLD outline only** · **R-ATT-04-FY** dedicated CRUD **HOLD** · residual wire **ONLY** FE policy admin (**R-ATT-04-POLICY-ADM**) + optional `statusLabelVi` deepen · **DENY** invent `att_leave_hold` · **DENY** Settings/`attendance_rules` sole accrual SoT · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED RETAIN** — F.1 physical Option A · LIVE Nest LVT + LVRULE + ledger grant **PRESENT** · closable BE for spine **NOT required** → unlock **prefer Dev-FE + QA** U65 **J-HRM-ATT-04-01..06 DRAFT** · **Dev-BE HOLD** invent (no DATA ADD · no FY/engine LIVE) · optional thin BE **ONLY if** FE proves envelope gap post-wire |
| **uc_ids** | `UC-BP-ATT-04` · `FR-UC-BP-ATT-04` · **BR-BP-LV-01** · **BR-BP-LV-TYPE-01** |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · **R-ATT-04-TYPE-ADMIN / POLICY-ADM / GRANT / PANEL / CNS / FY HOLD / ENGINE HOLD / ≠DONE** · QC ATT-03d **`ATT03DQC1-MSM1CR19`** (**DENY wipe GPS**) · must_keep ATT-03b **`ATT03BQC1-MSM0891H`** · ATT-01 **`ATT01QC1-MSLZ3KIM`** (**R-ATT-01-ASSIGN open**) · ATT-11 **`ATT11QC1-MSLXTH9P`** · ATT-10 **`ATT10QC1-MSLWGUYH`** · ATT-09 **`ATT09QC1-MSLUTL9D`** (**pending_days · PUT tracked-entitlement · DENY `att_leave_hold`**) · ATT-08 **`ATT08QC1-MSLSL36C`** · ATT-02 **`ATT02QC1-MSLQZUK7`** CFG≠DONE · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** printable false · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · peer ATT-LEAVE L1 + LVRULE platform seals cite · PAY invent DONE **OUT** |
| **ref_data** | [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md) |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md) |
| **ref_att09_api** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md) — stamp **`ATT09QC1-MSLUTL9D`** |
| **ref_lvrule_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md) §6 F.1 map |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-04** · Diễn biến **#0a · #1 · #2** · auto accrual = **giai đoạn sau** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-ATT-CAT-LVT-01/02** · **F-ATT-CAT-EFF-01** · **F-ATT-LEAVE-02/03** (peer hold · `pending_days`) · **F-ATT-LEAVE-04 HOLD** · LVRULE cite platform SA §6 |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.4 · §4.4b · paper `att_leave_hold` = **alias only** → **`pending_days`** |
| **ref_code_cite** | `attendance.controller.ts` `@Controller('attendance')` routes · `att-leave-type.service.ts` · `att-leave-accrual-policy.service.ts` · `leave-balance.service.ts` — **read-only cite 2026-08-09** · grep **`att_leave_hold` CREATE = 0** · **`POST …/leave-balances/accrue` = ABSENT** |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim L1/LVRULE/grant/soft09 = ATT-04 DONE · **DENY** ATT module UAT · honesty flip |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN** |
| **unlock_lane** | **Prefer Dev-FE + QA** · **Dev-BE HOLD** default (Option A) |

---

## 1. Verdict — **CONFIRMED RETAIN** (no BE gap blocking FE)

| Decision | Stamp |
|----------|--------|
| Type catalog API | **RETAIN** — **`GET/POST/PATCH/PUT/retire …/leave-types*`** + **`GET …/leave-types/effective`** → `att_leave_type` (**F-ATT-CAT-LVT/EFF**) · **≠** ATT-LEAVE L1 alone = FR-04 DONE |
| Accrual policy API | **RETAIN** — **`leave-accrual-policies*`** CRUD/effective/retire + **`POST …/assert-consumer`** → `att_leave_accrual_policy` (**F-ATT-LVRULE-01..04 · CNS**) · **≠** LVRULE BE alone = FR-04 DONE · **≠** `attendance_rules` sole |
| Ledger read / panel | **RETAIN** — **`GET …/leave-balance`** · **`GET …/leave-balance/panel`** → `employee_leave_balances` + EFF labels (**peer 05b**) |
| HR grant | **RETAIN cite** — **`PUT …/leave-balance/tracked-entitlement`** → upsert `entitled_days` (**ATT09QC1-MSLUTL9D** · Diễn biến **#2**) · **≠** grant alone = ATT-04 DONE |
| Hold semantics | **must_keep ATT-09** — paper **`held`** = LIVE **`pending_days`** · **DENY** physical `att_leave_hold` |
| FY start month CRUD | **HOLD** — **no** dedicated LIVE route · footer **R-ATT-04-FY** |
| Auto accrue job | **HOLD** — **F-ATT-LEAVE-04** outline only · **no** `POST …/leave-balances/accrue` in controller |
| Nest `/core` | **DENY** dual SoT · physical **`@Controller('attendance')`** only |
| FE residual | **R-ATT-04-POLICY-ADM** — BE LIVE · admin UI for `leave-accrual-policies` **GAP** (grep zero FE wire) |
| Closable BE gap on LIVE spine? | **NO** — LVT/LVRULE/grant/panel **PRESENT** → **Dev-BE HOLD** invent |
| BE gap list (documented) | **None P0** for Option A — see §8 |
| Unlock | **dev-fe** `PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01` (+ **qa** parallel) |

```text
  FE U65 (J-HRM-ATT-04-01..06 DRAFT)
        │  Network MUST /api/hrm/attendance/leave-types*
        │           + /leave-accrual-policies* (when policy UI wired)
        │           + /leave-balance* + PUT tracked-entitlement
        │  DENY Nest /core/* leave SoT · DENY att_leave_hold invent
        │  DENY seed · DENY claim L1/LVRULE/grant=ATT-04 DONE
        ▼
  F-ATT-CAT-LVT-01/02 + F-ATT-CAT-EFF-01 (RETAIN)
        → Diễn biến #0a · att_leave_type
        │
  F-ATT-LVRULE-01..04 + F-ATT-LVRULE-CNS (RETAIN)
        → Diễn biến #1 (FY partial HOLD footer)
        → att_leave_accrual_policy
        │
  GET leave-balance / panel + PUT tracked-entitlement (RETAIN)
        → Diễn biến #2 + Thành công footer cite
        → employee_leave_balances (pending_days = held)
        │
  HOLD: F-ATT-LEAVE-04 accrue job · FY dedicated API
        │
  Residual: FE policy admin wire · statusLabelVi? deepen (FE-first)
        │
  must_keep ATT03DQC1-MSM1CR19 · ATT peers · C-SLICE · honesty false
```

**Invariant ATT-04-PATH (O8):** LVT/LVRULE/grant/panel Network **MUST** hit physical `/api/hrm/attendance/*` — Nest `/api/hrm/core/**` as leave SoT = **FAIL**.

**Invariant ATT-04-HOLD-DUAL (O4):** Invent physical `att_leave_hold` = **FAIL** (**ATT09QC1-MSLUTL9D**).

**Invariant ATT-04-RULE-SOLE (O2):** Settings MD / `attendance_rules` as accrual rule sole SoT = **FAIL**.

**Invariant ATT-04-ENGINE (O7):** Claim **F-ATT-LEAVE-04** LIVE / run accrue in U65 = **FAIL**.

**Invariant ATT-04-FY (O5):** Claim FY start-month CRUD LIVE without ba-data ADD = **FAIL**.

**Invariant ATT-04-03D (O9):** Touch/wipe ATT-03d `work-sites*` in ATT-04 wave = **FAIL** (**ATT03DQC1-MSM1CR19**).

**Invariant ATT-04-U19:** leave-types list **=** get-by-id **=** mutate **=** policy list/get **same** `resolveHrmListScope` family as grant/panel for same `company_id`.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-04 DONE** · L1/LVRULE/grant/soft09 alone ≠ FR-04 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · **FY HOLD** · **ENGINE HOLD** · PAY OUT invent DONE · must_keep ATT03DQC1-MSM1CR19 · ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest `/core` DENY · **DENY invent `att_leave_hold`** · no seed · no apps/**

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **Controller** | Nest `@Controller('attendance')` → prefix **`/api/hrm/attendance`** |
| **PHYSICAL LVT** | `…/leave-types` · `…/leave-types/:leaveTypeId` · `…/leave-types/effective` |
| **PHYSICAL LVRULE** | `…/leave-accrual-policies` · `…/leave-accrual-policies/effective` · `…/leave-accrual-policies/:policyId` · `…/leave-accrual-policies/:policyId/retire` · `…/leave-accrual-policies/assert-consumer` |
| **PHYSICAL ledger** | `…/leave-balance` · `…/leave-balance/panel` · `…/leave-balance/tracked-entitlement` (**PUT**) |
| **LOGICAL (paper)** | `/api/hrm/att/leave-types*` · `/api/hrm/att/leave-accrual-policies*` · `/api/hrm/att/leave-balance*` · `/api/hrm/core/…` — **alias only** |
| **HOLD (no LIVE route)** | `POST /api/hrm/att/leave-balances/accrue` (**F-ATT-LEAVE-04**) · FY fiscal config CRUD |

| Paper / logical | Physical | DB (DATA-01) |
|-----------------|----------|--------------|
| F-ATT-CAT-LVT-* | `…/attendance/leave-types*` | `att_leave_type` RETAIN |
| F-ATT-CAT-EFF-01 | `…/leave-types/effective` | `att_leave_type` + REF merge |
| F-ATT-LVRULE-* | `…/leave-accrual-policies*` | `att_leave_accrual_policy` RETAIN |
| F-ATT-LVRULE-CNS | `…/assert-consumer` | policy assert · **HRM-ATT-LVRULE-KEY** |
| Panel / balance | `…/leave-balance*` | `employee_leave_balances` |
| Grant | `PUT …/tracked-entitlement` | `entitled_days` upsert |
| Paper `held` / `att_leave_hold` | **`pending_days`** (peer ATT-09) | **DENY dual table** |
| F-ATT-LEAVE-04 | — | **HOLD** |
| Nest `/core` | — | **DENY invent** |

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-01 verdict |
|---------|------------|----------------|
| `leave-types*` + `effective` | `attendance.controller.ts` L1294–1379 · L1041–1052 | **RETAIN** |
| `leave-accrual-policies*` | L1072–1189 | **RETAIN** |
| `assert-consumer` | L1110–1137 | **RETAIN** · CNS |
| `leave-balance/panel` | L578–592 · `HRM-LEAVE-BAL-PANEL-200` | **RETAIN** |
| `PUT tracked-entitlement` | L598–612 · `HRM-LEAVE-BAL-201` | **RETAIN** · cite ATT-09 |
| `GET leave-balance` | L615–629 · `HRM-LEAVE-BAL-200` | **RETAIN** |
| `att_leave_hold` table | grep hrm-api **0** CREATE | **DENY invent** |
| `POST …/leave-balances/accrue` | **ABSENT** | **HOLD F-ATT-LEAVE-04** |
| FY fiscal API | grep **0** dedicated | **HOLD R-ATT-04-FY** |
| Nest `@Controller('core')` leave | **ABSENT** | **DENY** |
| FE `leave-accrual-policies` admin | grep FE **0** wire | **FE GAP** · not BE |

---

## 4. F.1 RETAIN cite — endpoints (normative)

### 4.1 F-ATT-CAT-LVT-01 — List / GET loại phép (RETAIN)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-types`** · **`GET …/leave-types/{leaveTypeId}`** |
| **Paper alias** | `/api/hrm/att/leave-types*` · `/api/hrm/core/…` — **alias only** |
| **Mục đích** | Danh sách / chi tiết loại phép Nest theo pháp nhân — màn Cài đặt · đối chiếu admin; display-ready; **không** thay **F-ATT-CAT-EFF-01** khi cần union hiệu lực cho consumer. |
| **Nghiệp vụ xử lý** | `resolveScopeContext` + list scope **parity** với get-by-id · mặc định lọc `status=active` · `include_archived` cho audit · empty **200[]** · optional merge REF `leave_types` khi `include_group_ref` (**BR-PLT-06** — tenant writer thắng) · **cấm** closed enum reject N+1 trên path admin · OOS → scope **403/409** · response wire **`HRM-ATT-LVT-200`**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04** — admin list (Diễn biến **#0a** bối cảnh · **#1** đối chiếu loại gắn policy) · **BR-BP-LV-TYPE-01** |
| **Request → DB** | Read `att_leave_type` (`company_id` TEXT · `leave_type_key` · `name_vi` · `category` · flags · `unit` · `status` · …) — map DATA-01 §6.1 |
| **Response (display-ready)** | `{ id, companyId, leaveTypeKey, nameVi, category, unit, isPaid, allowsCarryOver, allowsAdvance, status, statusLabelVi?, source }` |
| **Lỗi** | `HRM-SCOPE-409` / scope invalid · empty list **không** 404 |

### 4.2 F-ATT-CAT-LVT-02 — Tạo / sửa / ngừng loại phép N+1 (RETAIN)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/leave-types`** · **`PUT …/leave-types`** (upsert) · **`PATCH …/leave-types/{leaveTypeId}`** · **`POST …/leave-types/{leaveTypeId}/retire`** |
| **Paper alias** | paper `/att/leave-types` — **alias only** |
| **Mục đích** | **Catalog admin — mở N+1:** HCNS thêm/sửa mã loại phép hợp lệ trên Settings Loại phép — U65 Diễn biến **#0a**. |
| **Nghiệp vụ xử lý** | Validate scope + DTO · UQ `(company_id, lower(leave_type_key))` · retire soft (`status` + `archived_at`) — **cấm** hard-delete · **cấm** áp `HRM-LEAVE-TYPE-UNKNOWN` lên admin CREATE · **cấm** Settings REF làm writer sole · POST → **`HRM-ATT-LVT-201`** · PATCH/PUT/retire → **`HRM-ATT-LVT-200`**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04** · Diễn biến **#0a** (quản trị thêm mã loại phép) · **BR-BP-LV-TYPE-01** |
| **Request → DB** | INSERT/UPDATE `att_leave_type` |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · `HRM-VAL-400` · `HRM-SCOPE-409` |

### 4.3 F-ATT-CAT-EFF-01 — Loại phép hiệu lực (picker consumer — RETAIN)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-types/effective`** |
| **Paper alias** | paper `/att/leave-types/effective` — **alias only** |
| **Mục đích** | **SoT picker consumer** — union ATT native + group REF (ATT thắng trùng khóa) khi còn phần tử hiệu lực; dùng bởi form nghỉ phép / panel / assert submit (peer ATT-08/09). |
| **Nghiệp vụ xử lý** | Read-only · cùng scope resolver với LVT-01 · hide retired · empty **200[]** + CTA admin · consumer invent khi EFF active>0 → peer **`HRM-LEAVE-TYPE-UNKNOWN`** (ATT-09 path — **≠** ATT-04 DONE alone) · wire **`HRM-ATT-LVT-200`**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04** Thành công footer (sẵn sàng chọn loại) · peer FR-ATT-05b/09 · **BR-BP-LV-TYPE-01-CNS** |
| **Request → DB** | Read `att_leave_type` + merge REF (không persist) |
| **Lỗi** | Scope only |

> **Admin ≠ consumer:** LVT-02 admin N+1 OK · EFF-01 consumer SoT · **explicit ≠** claim EFF/L1 platform seal alone = **ATT-04 DONE**.

### 4.4 F-ATT-LVRULE-01 — List quy tắc quỹ (RETAIN)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-accrual-policies`** (+ query `leave_type_key?`, `include_inactive?`, `company_id`) |
| **Paper alias** | paper `/att/leave-accrual-policies` — **alias only** |
| **Mục đích** | Danh sách chính sách tích lũy/versioned — admin đối chiếu · display-ready (type label · mode label). |
| **Nghiệp vụ xử lý** | `resolveScopeContext` · default **active** policies · `include_inactive` audit · join label từ EFF/`name_vi` · empty **200[]** · **≠** `attendance_rules` sole · wire **`HRM-ATT-LVRULE-200`**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04** · Diễn biến **#1** (CRUD quy tắc quỹ versioned — phần policy; FY CRUD **HOLD** footer) |
| **Request → DB** | Read `att_leave_accrual_policy` — DATA-01 §6.2 |
| **Lỗi** | `HRM-SCOPE-409` |

### 4.5 F-ATT-LVRULE-02 — Tạo quy tắc quỹ N+1 (RETAIN)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/leave-accrual-policies`** |
| **Paper alias** | paper alias |
| **Mục đích** | **Admin CREATE open N+1** — HCNS phát hành quy tắc quỹ mới gắn `leave_type_key` ∈ EFF. |
| **Nghiệp vụ xử lý** | Validate `leave_type_key` soft-FK type · version + `effective_from`/`effective_to` · `accrual_mode` · `annual_days` · `unit` · carry/max caps · INSERT · **≠** consumer invent · wire **`HRM-ATT-LVRULE-201`**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04** · Diễn biến **#1** |
| **Request → DB** | INSERT `att_leave_accrual_policy` |
| **Lỗi** | Type OOS · window conflict · `HRM-VAL-400` · scope |

### 4.6 F-ATT-LVRULE-03 — Sửa / ngừng quy tắc (RETAIN)

| | |
|--|--|
| **METHOD / path** | **`PATCH …/leave-accrual-policies/{policyId}`** · **`POST …/leave-accrual-policies/{policyId}/retire`** |
| **Paper alias** | paper alias |
| **Mục đích** | Cập nhật metadata/effective window · soft-retire policy — giữ lịch sử · ẩn khỏi resolve mặc định. |
| **Nghiệp vụ xử lý** | Scope parity get-by-id · soft-retire **FORBIDDEN hard-delete** · wire **`HRM-ATT-LVRULE-200`**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04** · Diễn biến **#1** · SRS v0.37 versioned + soft-retire |
| **Request → DB** | UPDATE `att_leave_accrual_policy` |
| **Lỗi** | `404` OOS · scope |

### 4.7 F-ATT-LVRULE-04 — Resolve quy tắc hiệu lực (RETAIN)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-accrual-policies/effective`** (+ `leave_type_key`, `as_of?`, `company_id`) |
| **Paper alias** | paper alias |
| **Mục đích** | Resolve policy published cho loại phép tại `as_of` — grant/adjust bind (**R-ATT-04-CNS**). |
| **Nghiệp vụ xử lý** | Read model · ATT wins · empty active = **200** empty/skip · wire **`HRM-ATT-LVRULE-200`**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04** · Diễn biến **#1** · **#2** (chọn từ quy tắc đã phát hành) |
| **Request → DB** | Read `att_leave_accrual_policy` filtered effective window |
| **Lỗi** | Scope |

### 4.8 F-ATT-LVRULE-CNS — Assert consumer (RETAIN)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/leave-accrual-policies/assert-consumer`** (+ gated grant paths per BA) |
| **Paper alias** | paper alias |
| **Mục đích** | Khi policy active>0: từ chối tham số quỹ invent trên consumer grant/adjust — SRS «không nhập tay mode/ngày lạ». |
| **Nghiệp vụ xử lý** | Active policy set >0 và body invent `policyId` / ad-hoc `accrualMode`/`annualDays` → **`HRM-ATT-LVRULE-KEY`** (400) · empty active → soft skip `{ skipped: true }` (U65) · **NOT** admin CREATE · **NOT** F-ATT-LEAVE-04 engine. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04** · Diễn biến **#2** · **BR-LVRULE-NOMANUAL** |
| **Request → DB** | Validate against `att_leave_accrual_policy` |
| **Lỗi** | **`HRM-ATT-LVRULE-KEY`** · scope |

### 4.9 F-ATT-LEAVE-BAL-01 — GET số dư (RETAIN)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-balance`** |
| **Paper alias** | paper `/att/leave-balance` — **alias only** |
| **Mục đích** | Đọc số dư theo NV · loại · `balance_year` — admin/consumer read. |
| **Nghiệp vụ xử lý** | Scope employee in membership · read `employee_leave_balances` · derive `available_days = entitled − used − pending` · **`pending_days` = paper held** · wire **`HRM-LEAVE-BAL-200`**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04** Thành công footer · peer FR-05b |
| **Request → DB** | Read `employee_leave_balances` — DATA-01 §6.3 |
| **Lỗi** | Scope · not found safe empty |

### 4.10 F-ATT-LEAVE-BAL-PANEL — Panel 5 MVP (RETAIN)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-balance/panel`** (registered **before** exact `leave-balance` — path order lock) |
| **Paper alias** | paper alias |
| **Mục đích** | Panel quỹ 5 loại MVP (năm/thâm niên/bù/chuyển kỳ/ứng) một response — embed khi nộp đơn (**R-ATT-04-PANEL**). |
| **Nghiệp vụ xử lý** | Aggregate rows per MVP codes · enrich `leave_type_label` from EFF — residual deepen labels · **≠** closed enum SoT when catalog open · wire **`HRM-LEAVE-BAL-PANEL-200`**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04** Thành công · peer FR-05b |
| **Request → DB** | Read `employee_leave_balances` + EFF join |
| **Lỗi** | Scope |

### 4.11 F-ATT-LEAVE-BAL-GRANT — PUT tracked-entitlement (RETAIN cite ATT-09)

| | |
|--|--|
| **METHOD / path** | **`PUT /api/hrm/attendance/leave-balance/tracked-entitlement`** |
| **Paper alias** | paper alias |
| **Mục đích** | HR cấp / điều chỉnh **`entitled_days`** trên ledger — luồng sản phẩm U65 (**peer ATT-09** · **ATT09QC1-MSLUTL9D**). |
| **Nghiệp vụ xử lý** | Upsert `(company_id, employee_id, leave_type, balance_year)` · set `entitled_days` · bind/assert policy when active>0 (**CNS**) · **no seed** · HR role gate · wire **`HRM-LEAVE-BAL-201`**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04** · Diễn biến **#2** (cấp quỹ / điều chỉnh entitled) |
| **Request → DB** | UPSERT `employee_leave_balances.entitled_days` |
| **Lỗi** | **`HRM-ATT-LVRULE-KEY`** when illegal manual params · scope · validation |

> **Invariant ATT-04-≠-GRANT-DONE:** Claim PUT alone = ATT-04 DONE = **FAIL** (peer ATT-09 ≠ ATT-04 slice).

### 4.12 F-ATT-LEAVE-04 — Auto accrue job (**HOLD — outline only**)

| | |
|--|--|
| **METHOD / path** | Paper `POST /api/hrm/att/leave-balances/accrue` *(job)* — **NO LIVE Nest route** |
| **Mục đích** | Tự động cấp quỹ theo chu kỳ / policy — SRS «giai đoạn sau». |
| **Nghiệp vụ xử lý** | **HOLD GĐ1** — cite `API_DESIGN_HRM_ENTERPRISE.md` outline · **Q-LEAVE-ACCRUAL** · **DENY** claim engine LIVE = Wave-33 slice DONE · **DENY** run accrue in U65 evidence. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04** / 04b lịch — **OUT** GĐ1 execution |
| **Request → DB** | *(none LIVE)* — would policy → `entitled_days` |
| **Lỗi** | N/A until engine wave |

### 4.13 R-ATT-04-FY — Năm tài chính phép (**HOLD — no API**)

| | |
|--|--|
| **METHOD / path** | *(no dedicated LIVE API)* |
| **Mục đích** | SRS Diễn biến **#1** partial — CRUD tháng bắt đầu năm tài chính phép. |
| **Nghiệp vụ xử lý** | **HOLD** — LIVE chỉ có `balance_year` INT (calendar bucket) · **not closable ADD** from existing schema (DATA-01 §5) · future: ba-data ADD + dev-be migration + sa stub · **FAIL** claim FY LIVE without DATA stamp. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04** · Diễn biến **#1** (FY component) · **BR-BP-LV-01** |
| **Footer** | Every QC evidence: **FY HOLD** |

### 4.14 Peer hold (must_keep — not ATT-04 spine mutate)

| | |
|--|--|
| **F-ATT-LEAVE-02/03** | **`POST …/leave-requests`** · approve/reject — hold/release **`pending_days`** (**ATT09QC1**) · **DENY** `att_leave_hold` table |
| **Mục đích** | Document cross-ref only — **must_keep** in ATT-04 footers · **≠** claim soft/ATT-09 = ATT-04 DONE |

---

## 5. Residual wire (FE-first · Dev-BE HOLD)

| Residual ID | Layer | Disposition | Owner |
|-------------|-------|-------------|-------|
| **R-ATT-04-POLICY-ADM** | FE | Admin UI `leave-accrual-policies` **ABSENT** — BE routes LIVE | **dev-fe** FE-01 |
| **R-ATT-04-TYPE-ADMIN** | FE | Settings Loại phép — deepen AC Diễn biến **#0a** | **dev-fe** |
| **R-ATT-04-PANEL** | FE | Labels display-ready from EFF | **dev-fe** |
| **R-ATT-04-CNS** | FE+BE | Grant form bind policy · assert-consumer path | **dev-fe** (wire) · BE **HOLD** |
| **statusLabelVi?** | FE-derive | Optional deepen on type/policy DTO | **dev-fe** first |
| **R-ATT-04-FY** | — | **HOLD** | ba-process + future ba-data ADD |
| **R-ATT-04-ENGINE** | — | **HOLD** | engine program wave |
| **Dev-BE invent** | — | **DENY** schema · Nest `/core` · `att_leave_hold` | **HOLD** unless FE proves thin envelope gap post-wire |

**Closable BE for LVT/LVRULE/grant/panel:** **NOT required** — spine **LIVE PRESENT** (Option A).

---

## 6. Traceability (SRS → API → test)

| SRS | API (LIVE) | Journey | QA expect |
|-----|------------|---------|-----------|
| **#0a** | F-ATT-CAT-LVT-02 | **J-HRM-ATT-04-01** | U65 · 2xx · F5 · Nest `/core` 0 |
| **#1** policy | F-ATT-LVRULE-01..04 | **J-HRM-ATT-04-02** | FE wired OR API residual + HOLD footer |
| **#1** FY | **HOLD** | **J-HRM-ATT-04-06** footer | FAIL if FY LIVE claimed |
| **#2** grant | PUT tracked-entitlement | **J-HRM-ATT-04-03** | 200 `HRM-LEAVE-BAL-201` · no seed |
| Thành công panel | GET panel | **J-HRM-ATT-04-04** | MVP codes + labels |
| CNS | assert-consumer | **J-HRM-ATT-04-05** | KEY path when invent |
| Seals | — | **J-HRM-ATT-04-06** | FY/ENGINE HOLD · ≠DONE |
| Hold peer | F-ATT-LEAVE-02 | ATT-09 QA | **pending_days** · DENY hold table |

---

## 7. must_keep / FORBIDDEN (docs seat)

**FORBIDDEN invent this seat:** Nest `@Controller('core')` leave SoT · physical **`att_leave_hold`** · Settings/`attendance_rules` sole accrual · **F-ATT-LEAVE-04 LIVE** · FY CRUD LIVE without DATA ADD · wipe **`attendance_work_sites`** (**ATT03DQC1**) · claim **L1/LVRULE/grant/soft09** = ATT-04 DONE · ATT module UAT flip · PAY/printable DONE · seed · apps/** · honesty flip.

---

## 8. Gap list & owners

| # | Gap | Severity | Owner | Verdict |
|---|-----|----------|-------|---------|
| G1 | FE admin `leave-accrual-policies` unwired | P1 residual | **dev-fe** | **Not BE gap** — unlock FE-01 |
| G2 | FY fiscal CRUD API/table absent | HOLD | ba-process / future ba-data | **Not closable** this wave |
| G3 | F-ATT-LEAVE-04 accrue route absent | HOLD by design | engine program | **Not BE gap** Wave-33 |
| G4 | `statusLabelVi?` optional on DTOs | P2 deepen | **dev-fe** FE-derive first | Optional thin BE only if FE proves |
| G5 | Scope parity regression | P0 if FAIL | **dev-be** | **Only if** QA proves list≠get 404 — **not pre-stamped** |

**Summary:** **RETAIN CONFIRMED** — **no mandatory Dev-BE** for Option A Wave-33; **next_owner = dev-fe**.

---

## 9. completion_report

**Closed:** SA API F.1 **CONFIRMED RETAIN** for UC-BP-ATT-04 / FR-UC-BP-ATT-04 — physical cite **F-ATT-CAT-LVT-01/02 · F-ATT-CAT-EFF-01 · F-ATT-LVRULE-01..04 · F-ATT-LVRULE-CNS · GET leave-balance/panel · PUT tracked-entitlement** under **`/api/hrm/attendance/*`** with full **Mục đích · Nghiệp vụ xử lý · Bước SRS** per endpoint; **HOLD** **F-ATT-LEAVE-04** + **R-ATT-04-FY**; **DENY** `att_leave_hold` dual · Nest `/core` · Settings sole; must_keep **ATT03DQC1-MSM1CR19** + full ATT/CORE/PLT stamp chain; closable BE **NOT required** → unlock **dev-fe** (+ qa); **Dev-BE HOLD**; explicit **≠ ATT-04 DONE · ≠ ATT UAT · C-SLICE · printable false · PAY OUT**; apps/** untouched.

**Residual open:** FE policy admin wire (**R-ATT-04-POLICY-ADM**) · QA U65 **J-HRM-ATT-04-*** · QC GWC · FY/ENGINE program waves · **R-ATT-01-ASSIGN** open.

**next_owner:** **dev-fe** — `PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01` (+ **qa** parallel).

**ack_status:** **PASS_TO_PM CONFIRMED RETAIN**

**evidence_path:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md`

---

## 10. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01 (+ QA-01 parallel)
role: dev-fe (+ qa)
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-33 seat #35)
entry_criteria: API-01 CONFIRMED RETAIN @ docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md · DATA-01 HOLD RETAIN LVT/LVRULE/ledger · BA O1–O12 · SA Option A · Dev-BE HOLD (no P0 BE gap) · unlock_lane FE+QA · must_keep ATT03DQC1-MSM1CR19 (DENY wipe GPS) · ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM (R-ATT-01-ASSIGN open) · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D (pending_days · PUT tracked-entitlement · DENY att_leave_hold) · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · ≠ ATT UAT · PAY OUT · printable false · C-SLICE
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md (F.1 RETAIN paths · HOLD FY/ENGINE · FE policy admin gap · Dev-BE HOLD)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md (AC-ATT-04-* · J-HRM-ATT-04-01..06 DRAFT)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md (DTO ↔ cols §6)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (F-ATT-CAT-LVT/EFF · F-ATT-LEAVE-04 HOLD)
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md (F-ATT-LVRULE F.1 map)
exit_criteria:
  - FE: wire Settings Loại phép Diễn biến #0a (F-ATT-CAT-LVT-02) · NEW admin surface leave-accrual-policies (R-ATT-04-POLICY-ADM) on LIVE GET/POST/PATCH/retire/effective · deepen panel/grant UX (tracked-entitlement product path · CNS bind) · Network only /api/hrm/attendance/* · display-ready per API-01 §4 · statusLabelVi FE-derive optional · Nest /core 0 · no seed
  - QA U65: J-HRM-ATT-04-01..06 DRAFT browser (type N+1 · policy N+1 when FE wired OR API residual+HOLD footer · grant 200 HRM-LEAVE-BAL-201 · panel · CNS · seals FY/ENGINE HOLD · ≠ L1/LVRULE/grant/soft09=ATT-04 DONE · F5 · zero-seed) — FAIL Nest /core SoT · invent att_leave_hold · Settings sole · run accrue · claim ATT UAT · wipe ATT-03d GPS
  - Dev-BE: HOLD invent unless QA proves scope_parity P0 on list/get — then thin BE-01 with allowed_paths only
  - evidence: docs/qa/evidence/po-hrm-mvp-gd1-att-04-cluster-fe-01.md (+ qa-01)
  - ack_status READY_FOR_QA / PASS_TO_PM
  - explicit ≠ ATT-04 DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT
cấm: apps/** invent Nest /core · invent att_leave_hold · invent FY/engine LIVE · seed · honesty flip · wipe work-sites · claim L1/LVRULE/grant alone DONE · claim ATT UAT
```

---

*End API-01 · CONFIRMED RETAIN · unlock dev-fe (+ qa) · Dev-BE HOLD · ≠ ATT-04 DONE · 2026-08-09*
