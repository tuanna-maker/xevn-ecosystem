# PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01 — API F.1 · Phân nhóm bảng lương · EXPAND F-PAY-GROUP-01 (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-45 seat **#50**) |
| **lane** | governance · sa |
| **change_mode** | **EXPAND** logical **F-PAY-GROUP-01** (tenant CRUD · rule resolve · period scope · payslip snapshot at process · enroll/list/report filters · display-ready labels) **around** **must_keep** **F-PAY-PROCESS-01** + **PAY-01..08** normative order [`PO-HRM-MVP-GD1-PAY-09-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-09-CLUSTER-SA-01.md) **§4.2** (step **(14)** group CFG/filter/snapshot — **cấm** replace calculator or payslip lifecycle) · **RETAIN** LIVE **`GET …/eligibility`** · **`POST …/enroll`** · **`POST …/process`** · **`GET payslips*`** · **`GET periods*`** · paper optional `payroll_group_id` on period **unwired** · physical **`/api/hrm/payroll/*`** · paper `/api/hrm/pay/*` **alias only** · **DENY** hardcode `office\|sales\|driver\|ops` enum · **DENY** PAY-09 **`PATCH`** payslip amounts / publish / **`payment_status`** / void · **DENY** FE group membership SoT · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED EXPAND + GAP MAP** — **`pay_payroll_group`** / **`payroll/groups*`** **ABSENT** (grep 2026-08-10) · **`payroll_group_id`** on period/payslip **ABSENT** in ensureSchema · **`loadPayrollEligibility`** **no** `payroll_group_id` filter · **`mapPayslip`** **no** `payroll_group_*` labels · DATA-01 **CONFIRMED ADD stamp** §6.1–6.3 closable · **unlock dev-be** · **dev-fe HOLD** until BE contract · **≠ PAY-09 / FR-UC-BP-PAY-09 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-09` · `FR-UC-BP-PAY-09` · **BR-BP-PAY-04** · **REQ_L_006** · peer **FR-UC-BP-PAY-01..08** (normative process order) |
| **depends_on** | BA-01 O1–O20 **CONFIRMED** · SA-01 Option **A LOCKED** · DATA-01 **CONFIRMED ADD stamp** · [`PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01.md) · [`PO-HRM-MVP-GD1-PAY-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-09-CLUSTER-DATA-01.md) · peer API [`PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01.md) (**O19** wire HOLD · payslip GET enrich) · [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md) (**O10** mid-month) · PAY-01..08 API-01 peers · **must_keep** **`PAY01QC1-MSMBGWC1`** … **`PAY08QC1-MSMFFXGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** |
| **ref_data** | DATA-01 §6.1 `pay_payroll_group` · §6.2 `payroll_periods.payroll_group_id` · §6.3 `payroll_payslips.payroll_group_id` · §6.1.1 `match_rule_json` |
| **ref_ba** | BA-01 — AC-PAY-GROUP-* · **J-HRM-PAY-09-01..08** DRAFT · regression **J-HRM-PAY-01..08** subsets |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-09** · Luồng **#1–#3** · Diễn biến **#1–#2 + Thành công** · đặc biệt «NV đổi nhóm giữa kỳ» |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` optional `payroll_group_id` on period · index **PAY-09** · logical **`pay_payroll_group`** |
| **ref_code_cite** | **read-only 2026-08-10:** grep **`pay_payroll_group`** / **`payroll/groups`** / **`payroll_group_id`** in `apps/**` + `packages/**` = **0** · **`payroll.controller.ts`** eligibility/enroll/process/payslips **RETAIN** · **`wire-payment-batch`** LIVE (**PAY-08 O19 peer**) |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** CRUD stub alone = PAY-09 DONE · **DENY** period field mention alone = DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED EXPAND + GAP MAP** |
| **unlock_lane** | **dev-be BE-01** (migrate DATA §6.1–6.3 · CRUD · resolver · period wire · process snapshot · filters · errors · display DTO) · **dev-fe FE-01** (catalog · period picker · report filter · payslip badge) · **qa** U65 **J-HRM-PAY-09-*** + regression PAY-01..08 |

---

## 1. Verdict — EXPAND F-PAY-GROUP-01 · RETAIN F-PAY-PROCESS-01 calculator + PAY-08 lifecycle

| Decision | Stamp |
|----------|--------|
| Calculator SoT (**O1**) | **must_keep RETAIN** — only **`F-PAY-PROCESS-01`** writes amounts · PAY-09 **CFG/filter/snapshot only** · **cấm** PATCH publish/TT/void/amounts |
| Tenant catalog (**O2**) | **GAP** **`pay_payroll_group`** CRUD per `company_id` · **cấm** fixed four-code enum in API validation |
| Resolve + priority (**O3/O4**) | **GAP** service — `match_rule_json` · higher **`priority`** wins |
| Period scope (**O5**) | **GAP** **`payroll_group_id`** on period create/update + list filter |
| Payslip snapshot (**O6**) | **GAP** writer at **`POST …/process`** only — **immutable** after calculate |
| Formula per group (**O7**) | **BIND PAY-02** — optional `formula_definition_id` on group or period · published only |
| Enroll filter (**O8**) | **GAP** **`GET …/eligibility?payroll_group_id=`** + scoped period |
| Report filter (**O9**) | **GAP** payslip/period list `payroll_group_id` query + breakdown labels |
| Mid-month (**O10**) | **must_keep BIND** **F-PAY-SPLIT-01** (**PAY04QC1**) — **cấm** second payslip invent |
| Display read (**O14**) | **GAP** `payroll_group_*` on period/payslip GET · **BIND PAY-08** payslip read |
| Scope parity (**O15**) | **GAP** groups list ≡ period ≡ payslip (**U19**) |
| Wire batch (**O19**) | **HOLD peer** — **§4.14** cite PAY-08 API-01 **O19** · **≠** PAY-09 writer |
| AMIS depth (**O20**) | **HOLD** beyond group slice |

```text
  PAY-01..08 SEALED (must_keep PAY01QC1..PAY08QC1): calculator + payslip lifecycle spine
       │
       ▼
  F-PAY-GROUP-01 (this seat — CFG + resolve + filter + snapshot)
    GAP:  GET/POST/PATCH /api/hrm/payroll/groups*
    GAP:  GET …/groups/:id/members (resolve preview)
    GAP:  period create/update payroll_group_id + period list filter
    GAP:  eligibility + payslip/period list payroll_group_id filter
    GAP:  at POST …/process: resolve NV→group · set payslip.payroll_group_id snapshot
    EXPAND: period/payslip GET payroll_group_id · code · name_vi (read-only)

  RETAIN: F-PAY-PROCESS-01 sole amount writer
  RETAIN: F-PAY-PAYSLIP-01 lifecycle (PAY-08) — PAY-09 read enrich only
  HOLD:   wire-payment-batch → payment_status=paid SoT = PAY-08 API-01 §4.14 O19

  DENY: hardcode VP/KD/TX/VH enum · FE resolve membership · PAY-09 PATCH TT/publish/void/amounts
  DENY: CRUD stub alone = FR-PAY-09 DONE · flip payroll_e2e_ready · reorder PAY pipeline
```

**Invariant PAY-09-PATH:** Group catalog + resolver **MUST** exist before «chạy lương theo nhóm» scoped run (**AC-PAY-GROUP-PERIOD-SCOPE** · SRS tiên quyết).

**Invariant PAY-09-PROCESS-ORDER:** Reorder vs PAY-08 §4.2 steps **(0)–(15)** = **FAIL** (**AC-PAY-GROUP-MK-PEERS**).

**Invariant PAY-09-≠-CRUD-DONE:** Catalog routes without resolve/snapshot/filter = **FAIL** (**AC-PAY-GROUP-≠-CRUD-DONE** · **O18**).

**Invariant PAY-09-≠-LIFECYCLE-PATCH:** PAY-09 owns publish/TT/void/amount PATCH = **FAIL** (**O1** · PAY-08 boundary).

**Invariant PAY-09-≠-HARDCODE:** Product enum four groups = **FAIL** (**O2**).

**Invariant PAY-09-≠-FE-SOT:** FE resolves group or recomputes net by group = **FAIL** (**O1/O2**).

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-09 / FR-UC-BP-PAY-09 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT**  
> must_keep **`PAY01QC1-MSMBGWC1`** … **`PAY08QC1-MSMFFXGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`**  
> **RETAIN PAY-01..08 order §4.2** · **CFG/filter/snapshot only PAY-09** · DENY CRUD alone DONE · DENY hardcode four groups · DENY payslip lifecycle PATCH · DENY FE group SoT · DENY reopen sealed J-*  
> **RETAIN PAY-08 O19 wire HOLD** (**O19**) · **O20 AMIS HOLD** · DATA stamp **necessary not sufficient**  
> no seed · no apps/** this seat

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **Catalog list (GAP)** | **`GET /api/hrm/payroll/groups`** |
| **Catalog get (GAP)** | **`GET /api/hrm/payroll/groups/:groupId`** |
| **Catalog create (GAP)** | **`POST /api/hrm/payroll/groups`** |
| **Catalog update (GAP)** | **`PATCH /api/hrm/payroll/groups/:groupId`** |
| **Members preview (GAP)** | **`GET /api/hrm/payroll/groups/:groupId/members`** · query `period_id` required |
| **Period create/update (EXPAND)** | **`POST /api/hrm/payroll/periods`** · **`PATCH /api/hrm/payroll/periods/:periodId`** — field **`payroll_group_id?`** |
| **Period list (EXPAND filter)** | **`GET /api/hrm/payroll/periods`** · query `payroll_group_id?` |
| **Eligibility (RETAIN+filter GAP)** | **`GET /api/hrm/payroll/periods/:periodId/eligibility`** · query `payroll_group_id?` |
| **Enroll (RETAIN)** | **`POST /api/hrm/payroll/periods/:periodId/enroll`** — respects period scope when set |
| **Process (RETAIN+snapshot GAP)** | **`POST /api/hrm/payroll/periods/:periodId/process`** — internal resolve + payslip snapshot |
| **Payslip list (RETAIN+filter GAP)** | **`GET /api/hrm/payroll/payslips`** · query `payroll_group_id?` |
| **Payslip get (RETAIN+labels GAP)** | **`GET /api/hrm/payroll/payslips/:payslipId`** |
| **Period get (RETAIN+labels GAP)** | **`GET /api/hrm/payroll/periods/:periodId`** |
| **Wire batch (HOLD O19)** | **`POST /api/hrm/payroll/periods/:periodId/wire-payment-batch`** — PAY-08 peer |
| **LOGICAL (paper)** | `/api/hrm/pay/groups` · `/api/hrm/pay/periods` — **alias** → **`/api/hrm/payroll/*`** |
| **DENY GĐ1** | **`PATCH /api/hrm/payroll/payslips/:id`** with amounts/publish/`payment_status`/void from PAY-09 slice · hardcoded group enum in validation · Nest **`/core`** as group assignment SoT |

| Paper / logical | Physical GĐ1 | DB (DATA-01 stamp) |
|-----------------|----------------|---------------------|
| `pay_payroll_group` | **§4.1–4.2** routes | **`public.pay_payroll_group`** §6.1 |
| Period `payroll_group_id` | **§4.3** | **`payroll_periods.payroll_group_id`** §6.2 |
| Payslip snapshot | **§4.6** process writer | **`payroll_payslips.payroll_group_id`** §6.3 |
| `match_rule_json` | CRUD body + resolve | §6.1.1 schema |
| `formula_definition_id` on group | optional CRUD | §6.1 optional FK PAY-02 |

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-01 verdict |
|---------|------------|----------------|
| `GET …/eligibility` | `payroll.controller.ts` | **RETAIN** · **GAP** `payroll_group_id` filter |
| `POST …/enroll` · `POST …/process` | `processPayrollPeriod` | **RETAIN** · **GAP** scope + snapshot |
| `GET …/payslips*` · `GET …/periods*` | controller | **RETAIN** · **GAP** filter + labels |
| `payroll/groups*` | grep **0** | **GAP** full CRUD |
| `pay_payroll_group` table | ensureSchema **0** | **GAP** migrate after DATA stamp |
| `payroll_group_id` cols | **ABSENT** | **GAP** §6.2–6.3 |
| Resolver service | **ABSENT** | **GAP** §4.2 internal + preview HTTP |
| `mapPayslip` group fields | **ABSENT** | **GAP** §4.8 |
| `wire-payment-batch` | LIVE | **HOLD** §4.14 **O19** |
| PAY-08 publish/TT/void | **ABSENT** / PAY-08 GAP | **RETAIN** PAY-08 boundary **O1** |

---

## 4. F.1 — functions (normative)

> Mỗi hàng: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response ↔ DB · Lỗi.

### 4.1 F-PAY-GROUP-01 — CRUD danh mục nhóm tenant (**GAP EXPAND**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/groups`** · **`GET /api/hrm/payroll/groups/:groupId`** · **`POST /api/hrm/payroll/groups`** · **`PATCH /api/hrm/payroll/groups/:groupId`** |
| **Paper alias** | Logical **`pay_payroll_group`** · `API_DESIGN_HRM_ENTERPRISE.md` index PAY-09 |
| **Mục đích** | C&B cấu hình **danh mục nhóm bảng lương** theo tenant (`company_id`) — mã · tên vi-VN · priority · rule JSON — **không** hardcode bốn nhóm cố định (**FR-UC-BP-PAY-09** Luồng **#1** · Diễn biến **#1** · **BR-BP-PAY-04** · **O2**). |
| **Nghiệp vụ xử lý** | **Auth/scope:** `resolveHrmListScope` — **`listPayrollGroups` predicate ≡ `getPayrollGroupById`** (**U19** · **O15**). **(C1) List:** filter `company_id`, `status?` (`active\|retired`), `page`, `page_size` · sort by `priority` desc then `code`. **(C2) Create:** body `{ company_id, code, name_vi, priority?, match_rule_json?, formula_definition_id?, status? }` — validate `code` tenant-defined string · **cấm** server enum `office\|sales\|driver\|ops` as only allowed values (**O2**). **(C3) Update:** PATCH allowed fields · **cấm** change `company_id` · retire → `status=retired`, optional `archived_at` (**O12**). **(C4) Retired guard:** new period bind to retired group → **409** (see **§4.3**). **(C5) UQ:** duplicate active `(company_id, code)` → **409** stable. **FORBIDDEN:** seed-only four groups; DELETE hard; wipe peer PAY tables. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-09** Diễn biến **#1** · Luồng **#1** · **AC-PAY-GROUP-CATALOG-SOT** · **AC-PAY-GROUP-RETIRE** · **AC-PAY-GROUP-≠-HARDCODE** · **J-HRM-PAY-09-01** |
| **Request → DB** | **`public.pay_payroll_group`** §DATA-01 §6.1 — `company_id`, `code`, `name_vi`, `priority`, `match_rule_json`, `formula_definition_id?`, `status`, `archived_at?` |
| **Response** | **200** `{ items[] \| group }` **`PayrollGroupDto`** per **§5.1** · **`HRM-PAY-200`** |
| **Lỗi** | **`HRM-SCOPE-409`** · **`HRM-PAY-404`** · **`409`** duplicate code · **`400`** invalid `match_rule_json` (**VAL-PAY-09-DATA-05**) |

### 4.2 F-PAY-GROUP-01 — Resolve membership preview (**GAP EXPAND**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/groups/:groupId/members`** · required query **`period_id`** · optional `as_of_date?` |
| **Mục đích** | C&B **preview** danh sách NV khớp rule / explicit list trước chạy kỳ (**FR-UC-BP-PAY-09** Diễn biến **#2** · **O3/O11**). |
| **Nghiệp vụ xử lý** | **Auth/scope:** group `company_id` in scope. **(R1) Load** active group + `match_rule_json` §DATA §6.1.1. **(R2) Resolve** at period boundary `[start_date, end_date]` (physical `payroll_periods`): apply `employee_ids` override (**O11**) then `department_ids` / `position_keys`. **(R3) Priority peer:** if employee matches multiple groups company-wide, report **winner** by highest `priority` — preview may list only members of **this** group id. **(R4) Dual membership:** employees with ambiguous overlap (equal priority, multiple groups) → include `conflict: true` + stable reason in row or emit warning block — enroll/process must **409** (**O13**). **(R5) Response:** `{ group_id, period_id, items: [{ employee_id, employee_code, employee_name, match_source: 'explicit_list'|'department'|'position' }] }`. **Internal reuse:** same resolver invoked at enroll/process (**§4.6**). **FORBIDDEN:** FE-only membership set; Nest `/core` public ring as sole resolver. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-09** Diễn biến **#2** · **AC-PAY-GROUP-RESOLVE** · **AC-PAY-GROUP-PRIORITY** · **AC-PAY-GROUP-EXPLICIT-LIST** · **J-HRM-PAY-09-02** |
| **Request → DB** | Read **`pay_payroll_group`** · employees/dept/position attrs · period dates |
| **Response** | **200** preview DTO · **`HRM-PAY-200`** |
| **Lỗi** | **`HRM-PAY-GROUP-409`** when policy detects unresolvable dual (**O13**) · **`HRM-PAY-404`** · **`HRM-SCOPE-409`** |

### 4.3 F-PAY-GROUP-01 — Kỳ lương scope theo nhóm (**GAP EXPAND** on period API)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods`** · **`PATCH /api/hrm/payroll/periods/:periodId`** · **`GET /api/hrm/payroll/periods`** · **`GET /api/hrm/payroll/periods/:periodId`** |
| **Mục đích** | Gắn **optional** nhóm khi tạo/sửa kỳ — chạy/lọc đăng ký theo nhóm (**FR-UC-BP-PAY-09** Diễn biến **#2** · Luồng **#3** · **O5**). |
| **Nghiệp vụ xử lý** | **EXPAND** create/update body: **`payroll_group_id?: uuid`** → **`payroll_periods.payroll_group_id`** §DATA §6.2. **(P1) Validation:** FK must exist · same `company_id` scope · group `status=active` — retired → **409** (**VAL-PAY-09-DATA-02** · **O12**). **(P2) List filter:** `GET periods?payroll_group_id=` returns periods with matching FK (**O9**). **(P3) GET enrich:** emit **`payroll_group_id`**, **`payroll_group_code`**, **`payroll_group_name_vi`** read-only (**O14**). **(P4) Scoped run:** when period.`payroll_group_id` set, enroll/eligibility/process batch defaults to NV resolved into that group (**O8**) unless explicit `employee_ids[]` on enroll overrides per PAY-06 enroll contract. **RETAIN** all PAY-01 period fields (`formula_definition_id`, bind sheet, template snapshot). **FORBIDDEN:** claim paper field unwired = DONE; period field without resolver. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-09** Diễn biến **#2** · Luồng **#3** · **AC-PAY-GROUP-PERIOD-SCOPE** · **AC-PAY-GROUP-DISPLAY** · **J-HRM-PAY-09-03** |
| **Request → DB** | **`payroll_periods.payroll_group_id`** FK → **`pay_payroll_group.id`** |
| **Response** | Period DTO per **§5.2** · **`HRM-PAY-200`** |
| **Lỗi** | **`HRM-SCOPE-409`** · **`409`** retired group bind · **`HRM-PAY-404`** |

### 4.4 F-PAY-GROUP-01 — Lọc eligibility / enroll (**RETAIN + GAP filter**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/periods/:periodId/eligibility`** · query **`payroll_group_id?`** |
| **Mục đích** | Khi chạy theo nhóm, **đăng ký / eligibility** chỉ NV trong nhóm (hoặc period scope) (**O8**). |
| **Nghiệp vụ xử lý** | **RETAIN** `loadPayrollEligibility` · **EXPAND:** when `payroll_group_id` query **or** period.`payroll_group_id` set, filter `items[]` to employees resolved into target group at period boundary (**§4.2** rules). **Scope parity** with payslip list (**O15**). **RETAIN** `NO_CLOSED_SHEET` and PAY-01 reasons. **FORBIDDEN:** filter bypass U19; empty filter treated as «all groups» when period scoped — must apply scope. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-09** Diễn biến **#2** · **AC-PAY-GROUP-ENROLL-FILTER** · **J-HRM-PAY-09-03** |
| **Response** | **200** eligibility envelope · **`HRM-PAY-200`** |
| **Lỗi** | **`HRM-PAY-GROUP-409`** on unresolvable dual at enroll boundary |

### 4.5 F-PAY-GROUP-01 — Lọc phiếu / báo cáo theo nhóm (**GAP EXPAND**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/payslips`** · query `period_id?`, `company_id?`, **`payroll_group_id?`** |
| **Mục đích** | Báo cáo / danh sách phiếu theo **snapshot nhóm** + label `name_vi` (**Luồng #3** · **O9**). |
| **Nghiệp vụ xử lý** | Filter on **`payroll_payslips.payroll_group_id`** (post-process snapshot) · optional aggregate `{ by_group: [{ payroll_group_id, code, name_vi, count, total_net_vnd }] }` on list meta when `include_group_breakdown=true` GĐ1 optional. **Display:** each row includes **`payroll_group_*`** read-only (**§5.3**). **FORBIDDEN:** filter on inferred FE group; pre-process NULL snapshot treated as «in group» for scoped report. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-09** Luồng **#3** · **AC-PAY-GROUP-REPORT-FILTER** · **J-HRM-PAY-09-04** |
| **Request → DB** | Read **`payroll_payslips`** · JOIN **`pay_payroll_group`** for labels |
| **Lỗi** | **`HRM-SCOPE-409`** · **`HRM-PAY-404`** |

### 4.6 F-PAY-GROUP-01 — Snapshot trên phiếu tại process (**GAP EXPAND** · internal writer)

| | |
|--|--|
| **METHOD / path** | **Internal** inside **`POST /api/hrm/payroll/periods/:periodId/process`** (**F-PAY-PROCESS-01**) — **no** standalone PATCH payslip group route |
| **Mục đích** | Ghi **audit nhóm** tại thời điểm tính lương — **`payroll_group_id`** immutable sau calculate (**O6** · Thành công). |
| **Nghiệp vụ xử lý** | **Per employee** in process batch: **(S1)** Resolve effective group @ process boundary (**§4.2** · **O3/O4**). **(S2)** If period.`payroll_group_id` set, employee must match scoped group else skip or **409** per enroll policy. **(S3)** On successful payslip upsert (**F-PAY-PROCESS-01**), SET **`payroll_payslips.payroll_group_id`** = resolved winner id §DATA §6.3. **(S4) Formula BIND:** when group.`formula_definition_id` or period pointer differs by group, **BIND PAY-02** published formula only (**O7**) — may trigger **F-PAY-SPLIT-01** when formula changes mid-period (**O10**). **(S5) Immutability:** after calculate, **cấm** UPDATE snapshot except full re-process policy — **403/409** (**VAL-PAY-09-DATA-03**). **FORBIDDEN:** PAY-09 PATCH route changing snapshot; second payslip for group change (**O10**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-09** Thành công · **AC-PAY-GROUP-SNAPSHOT** · **AC-PAY-GROUP-FORMULA-BIND** · **AC-PAY-GROUP-MID-MONTH** · **J-HRM-PAY-09-05** · **J-HRM-PAY-09-06** |
| **Request → DB** | UPDATE **`payroll_payslips.payroll_group_id`** at process only |
| **Lỗi** | **`HRM-PAY-GROUP-409`** · **`HRM-PAY-GROUP-412`** when catalog missing / NV unassigned per policy (**O13** optional **412**) |

### 4.7 HRM-PAY-GROUP-409 — Dual membership / overlap không phân định (**GAP**)

| | |
|--|--|
| **METHOD / path** | Emitted from **§4.2** · **§4.4** · **§4.6** |
| **Mục đích** | **BR-BP-PAY-04** — một NV một nhóm hiệu lực hoặc priority rõ (**O13**). |
| **Nghiệp vụ xử lý** | **409** `{ code: 'HRM-PAY-GROUP-409', message, reason_code: 'DUAL_GROUP_MATCH'|'AMBIGUOUS_PRIORITY', employee_id?, group_ids[]? }` — stable vi-VN message · **cấm** enroll both groups. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-09** FAIL · **AC-PAY-GROUP-DUAL-409** · **J-HRM-PAY-09-07** |

### 4.8 HRM-PAY-GROUP-412 — Thiếu danh mục / chưa gán nhóm (**GAP**)

| | |
|--|--|
| **METHOD / path** | Emitted from **§4.6** when policy requires group assignment |
| **Mục đích** | Fail-closed khi SRS tiên quyết «NV được gán nhóm» nhưng resolver empty (**VAL-PAY-09-DATA-08**). |
| **Nghiệp vụ xử lý** | **412** `{ code: 'HRM-PAY-GROUP-412', message, employee_id? }` — **optional** GĐ1 when company policy `require_payroll_group=true`; default may warn-only until BA policy lock. |
| **Tham chiếu bước SRS** | **AC-PAY-GROUP-SNAPSHOT** · **J-HRM-PAY-09-07** |

### 4.9 F-PAY-PAYSLIP-01 — Display-ready group labels (**RETAIN + GAP expand** · PAY-08 BIND)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/payslips/:payslipId`** · **`GET /api/hrm/payroll/payslips`** · peer **`GET …/periods/:periodId`** |
| **Mục đích** | UI read-only badge/label nhóm trên phiếu và kỳ — **không** sửa nhóm qua payslip PATCH (**O14** · **BIND PAY-08**). |
| **Nghiệp vụ xử lý** | **EXPAND** `mapPayslip` / period mapper: **`payroll_group_id`**, **`payroll_group_code`**, **`payroll_group_name_vi`** from snapshot FK + catalog join · **read-only** · **L2.5** list→detail parity (**U19**). **RETAIN** PAY-08 lifecycle fields (publish, `payment_status`) — PAY-09 **does not** add lifecycle routes. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-09** Thành công · peer **FR-UC-BP-PAY-08** read · **AC-PAY-GROUP-DISPLAY** · **J-HRM-PAY-09-05** |

### 4.10 F-PAY-PROCESS-01 — Calculator peer (**must_keep RETAIN** · PAY-09 must not replace)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Mục đích** | **Sole writer** calculated amounts — PAY-09 only adds **scope filter + snapshot column** (**O1**). |
| **Nghiệp vụ xử lý** | **RETAIN** normative order **(0)–(12)** per PAY-07 API-01 **§4.6** + PAY-08 step **(13)** lifecycle **not** in PAY-09 · **INSERT** step **(14)** group resolve + snapshot per SA §4.2 **before** wire batch **(15)**. **Cluster lock:** **must_keep** **`PAY01QC1`..`PAY08QC1`**. |
| **Tham chiếu bước SRS** | **AC-PAY-GROUP-CALC-SOT** · regression **J-HRM-PAY-01..08** |

### 4.11 F-PAY-SPLIT-01 — Mid-month group / formula change (**must_keep BIND** PAY-04)

| | |
|--|--|
| **METHOD / path** | **Internal** — cite [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md) **§4.1** |
| **Mục đích** | NV **đổi nhóm giữa kỳ** với **effective_date** và công thức khác → segment boundary — **cấm** PAY-09 tạo phiếu thứ hai (**O10**). |
| **Tham chiếu bước SRS** | SRS đặc biệt · **AC-PAY-GROUP-MID-MONTH** · **PAY04QC1** · **J-HRM-PAY-09-06** |

### 4.12 F-PAY-FORMULA-* — Published formula per group (**must_keep BIND** PAY-02)

| | |
|--|--|
| **METHOD / path** | Period / group `formula_definition_id` pointers |
| **Mục đích** | Công thức **có thể** khác nhóm khi cấu hình — **only published** (**O7**). |
| **Nghiệp vụ xử lý** | **BIND** PAY-02 **`HRM-PAY-FORMULA-412`** guards · **cấm** FE pick unpublished · **cấm** second net engine. |
| **Tham chiếu bước SRS** | **AC-PAY-GROUP-FORMULA-BIND** · **PAY02QC1** |

### 4.13 F-PAY-PAYSLIP-01 lifecycle boundary (**must_keep RETAIN** PAY-08 · **DENY** PAY-09 PATCH)

| | |
|--|--|
| **METHOD / path** | **`POST …/publish`** · **`PATCH …/payment-status`** · **`POST …/void`** — cite PAY-08 API-01 **§4.3–4.10** |
| **Mục đích** | Publish / TT / void = **PAY-08** — PAY-09 **cấm** own or extend with group slice (**O1**). |
| **Nghiệp vụ xử lý** | Any PAY-09 PR touching payslip lifecycle routes = **process defect** · group slice **read-only enrich** only on GET. |
| **Tham chiếu bước SRS** | **AC-PAY-GROUP-CALC-SOT** · **PAY08QC1** |

### 4.14 Wire payment batch — (**HOLD O19** · RETAIN from PAY-08 API-01)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/wire-payment-batch`** |
| **Mục đích** | AMIS batch TT — **one SoT** with PAY-08 **`PATCH payment-status`** (**O19** · PAY-08 BA O19). |
| **Nghiệp vụ xử lý** | **GĐ1 rule (LOCK — peer PAY-08 API-01 §4.14):** wire success **may** set **`payment_status='paid'`** on included payslips **iff** already **`published`** — **cấm** FE/local override without server audit · **≠** PAY-09 DONE alone · PAY-09 **does not** own or duplicate wire-batch writer. |
| **Tham chiếu bước SRS** | **AC-PAY-GROUP-WIRE-HOLD** · **O19** |

### 4.15 AMIS / bank file depth — (**HOLD O20**)

Full payment batch UI + bank export beyond group CFG slice — **HOLD** · cite LIVE routes **≠** FR-PAY-09 DONE (**AC-PAY-GROUP-AMIS-HOLD**).

---

## 5. Display-ready DTO lock (FE / QA · map DATA-01 §6.1–6.3)

### 5.1 PayrollGroupDto (catalog CRUD)

```json
{
  "id": "uuid",
  "company_id": "string",
  "code": "string",
  "name_vi": "string",
  "priority": 0,
  "match_rule_json": {
    "department_ids": ["uuid"],
    "position_keys": ["string"],
    "employee_ids": ["uuid"]
  },
  "formula_definition_id": "uuid|null",
  "status": "active|retired",
  "archived_at": "ISO8601|null",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

- **Cấm** API accept only `code` ∈ `{ office, sales, driver, ops }` (**O2**).
- **`match_rule_json`:** empty `{}` allowed; invalid shape → **400**.

### 5.2 PeriodDto enrich (optional scope)

```json
{
  "id": "uuid",
  "company_id": "string",
  "period_from": "date",
  "period_to": "date",
  "payroll_group_id": "uuid|null",
  "payroll_group_code": "string|null",
  "payroll_group_name_vi": "string|null",
  "status": "string"
}
```

### 5.3 PayslipDto enrich (snapshot read-only)

```json
{
  "id": "uuid",
  "payroll_group_id": "uuid|null",
  "payroll_group_code": "string|null",
  "payroll_group_name_vi": "string|null",
  "gross_amount": 0,
  "net_amount": 0
}
```

- Full payslip header per PAY-08 API-01 **§5.1** plus group fields above.
- **Plain numbers** on wire; FE **vi-VN** display (**O14**).
- **Cấm** PATCH body keys `payroll_group_id` on payslip generic route (**O6** · **O1**).

### 5.4 Members preview response

```json
{
  "group_id": "uuid",
  "period_id": "uuid",
  "items": [
    {
      "employee_id": "uuid",
      "employee_code": "string",
      "employee_name": "string",
      "match_source": "explicit_list|department|position"
    }
  ],
  "warnings": []
}
```

---

## 6. GAP map vs Dev ownership

| ID | Capability | API-01 | Owner |
|----|------------|--------|-------|
| **R-PAY-09-CRUD** | Group catalog HTTP | **GAP §4.1** | **dev-be** + migrate §6.1 |
| **R-PAY-09-RESOLVE** | Resolver + preview | **GAP §4.2** | **dev-be** |
| **R-PAY-09-PERIOD-BIND** | Period FK + filter | **GAP §4.3** | **dev-be** + §6.2 |
| **R-PAY-09-SNAPSHOT** | Process writer | **GAP §4.6** | **dev-be** + §6.3 |
| **R-PAY-09-ENROLL-FILTER** | eligibility query | **GAP §4.4** | **dev-be** |
| **R-PAY-09-REPORT-FILTER** | payslip list filter | **GAP §4.5** | **dev-be** + **dev-fe** |
| **R-PAY-09-DISPLAY** | GET labels | **GAP §4.9** | **dev-be** + **dev-fe** |
| **R-PAY-09-DUAL-409** | HRM-PAY-GROUP-409 | **GAP §4.7** | **dev-be** + **qa** |
| **R-PAY-09-MID-MONTH** | PAY-04 bind | **BIND §4.11** | **qa** + PAY04QC1 |
| **R-PAY-09-DENY-UI** | no hardcode four | **§4.1** · **§5.1** | **dev-fe** + **qa** |
| **H-PAY-09-WIRE** | wire SoT | **HOLD §4.14** | **O19** PAY-08 |
| **H-PAY-09-AMIS** | bank depth | **HOLD §4.15** | **O20** |

---

## 7. Enterprise API delta pointer

After Dev wave, append **F-PAY-GROUP-01** block in `API_DESIGN_HRM_ENTERPRISE.md` with:

- **`GET/POST/PATCH /api/hrm/payroll/groups`**
- **`GET …/groups/:id/members`**
- Period / payslip `payroll_group_id` filter params
- Errors **`HRM-PAY-GROUP-409`** · **`HRM-PAY-GROUP-412`**
- **DENY** payslip lifecycle PATCH from PAY-09
- **RETAIN** PAY-08 **O19** wire-batch SoT cross-reference

*(Cluster spec is SoT for PAY-09 wave; paper file update = ba-docs optional delta.)*

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API-01 **CONFIRMED EXPAND + GAP MAP** for UC-BP-PAY-09: full **F.1** **§4.1–4.15** — **EXPAND** **F-PAY-GROUP-01** (CRUD **§4.1** · resolve preview **§4.2** · period scope **§4.3** · eligibility filter **§4.4** · report filter **§4.5** · process snapshot **§4.6** · **`HRM-PAY-GROUP-409/412` §4.7–4.8** · display GET **§4.9**); **RETAIN** **F-PAY-PROCESS-01** calculator **§4.10** + **PAY01QC1..PAY08QC1** order; **BIND** PAY-04 mid-month **§4.11** · PAY-02 formula **§4.12**; **RETAIN** PAY-08 lifecycle boundary **§4.13**; **RETAIN HOLD** wire-batch **O19** **§4.14** (peer PAY-08 API-01); DTO **§5** maps DATA-01 §6.1–6.3; docs-only · **unlock dev-be** · **≠ PAY-09 / payroll_e2e / PAY UAT DONE** · **`payroll_e2e_ready=false`** · **C-SLICE**. |
| **next_owner** | **pm** → **dev-be** `PO-HRM-MVP-GD1-PAY-09-CLUSTER-BE-01` |
| **ack_status** | **PASS_TO_PM CONFIRMED EXPAND + GAP MAP** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01.md` |
| **residual** | dev-be migrate + CRUD/resolver/snapshot/filters/DTO · dev-fe catalog UI · QA **J-HRM-PAY-09-*** + regression PAY-01..08 · QC GWC · O19/O20 footers |

### next_dispatch_prompt (copy-ready — dev-be BE-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-09-CLUSTER-BE-01
role: dev-be
lane: execution · UC-BP-PAY-09 · FR-UC-BP-PAY-09 · BR-BP-PAY-04 · REQ_L_006
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-45 seat #50)
depends_on: API-01 CONFIRMED EXPAND+GAP @ docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01.md · BA O1–O20 · DATA-01 CONFIRMED ADD stamp §6.1–6.3 · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + PAY03QC1-MSMDDGWC1 + PAY04QC1-MSMCR4GWC1 + PAY05QC1-MSMDU2GWC1 + PAY06QC1-MSMECGWC1 + PAY07QC1-MSMEY7GWC1 + PAY08QC1-MSMFFXGWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01.md (§4.1 CRUD · §4.2 resolve · §4.3 period · §4.4–4.5 filters · §4.6 snapshot · §4.7–4.8 errors · §5 DTO)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-DATA-01.md (§6.1–6.3 migration sketches · match_rule_json §6.1.1)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01.md (AC-PAY-GROUP-* · J-HRM-PAY-09-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01.md (§4.14 O19 wire HOLD — do not own wire-batch · §4.13 lifecycle DENY)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md (O10 mid-month split BIND)
  - apps/api/hrm-api/src/payroll/payroll.service.ts (eligibility · process RETAIN)
spec_ref: FR-UC-BP-PAY-09 Diễn biến #1–#2 + Thành công · API-01 §4.1–4.11 · AC-PAY-GROUP-CATALOG-SOT · SNAPSHOT · DUAL-409 · DISPLAY
change_mode: ADD narrow · preserve_default · code_memory_required: true · code_memory_mode: APPEND
allowed_paths: apps/api/hrm-api/src/payroll/** (groups controller/service · resolver · period payroll_group_id · process snapshot · mapPayslip enrich · eligibility filter) · migrate pay_payroll_group + FK cols · jest spec-mapped
forbidden_paths: PATCH payslip amounts/publish/payment_status/void · hardcode office|sales|driver|ops enum · FE group SoT · reorder PAY-01..08 pipeline · wipe PAY seals · honesty flip · claim PAY-09 DONE · wire-batch SoT override (O19 PAY-08) · U65 seed
entry_criteria: API-01 PASS_TO_PM · DATA-01 stamp · hrm-api dev stack · PAY-01..08 process spine stable
exit_criteria:
  1) Migrate §6.1 pay_payroll_group + §6.2 period FK + §6.3 payslip snapshot col
  2) CRUD /api/hrm/payroll/groups* per §4.1 · retire validation §4.3
  3) GET groups/:id/members + internal resolver shared with process §4.2
  4) Period create/update/list/get payroll_group_id wire §4.3
  5) eligibility + payslip list payroll_group_id filter §4.4–4.5
  6) POST process sets payslip.payroll_group_id snapshot §4.6 · immutable after calculate
  7) HRM-PAY-GROUP-409 · HRM-PAY-GROUP-412 §4.7–4.8
  8) mapPayslip/period payroll_group_* display §4.9 · U19 scope_parity groups/periods/payslips
  9) jest + must_keep PAY-01..08 regression green
  10) READY_FOR_QA evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-be-01.md · ack_status READY_FOR_QA · ≠ PAY-09 DONE · payroll_e2e_ready=false · C-SLICE
cấm: seed for U65 AC · reopen J-HRM-PAY-01..08 without regression bus · PAY-09 payslip lifecycle PATCH
```

### next_dispatch_prompt (copy-ready — dev-fe FE-01 · after BE READY_FOR_QA)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01
role: dev-fe
lane: execution · UC-BP-PAY-09 · FR-UC-BP-PAY-09
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-45 seat #50)
depends_on: dev-be PAY-09-BE-01 READY_FOR_QA with group contract @ API-01 §5
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01.md (§5 display-ready)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01.md (J-HRM-PAY-09-01..07 · AC-PAY-GROUP-≠-HARDCODE)
change_mode: FIX narrow · preserve_default
allowed_paths: apps/web/** payroll group catalog · period group picker · payslip group badge · report filter
forbidden_paths: hardcode four groups UI · FE resolve membership SoT · editable payslip group PATCH · client net by group
exit_criteria: U65 J-HRM-PAY-09-01..05 (FE-after-2xx+F5) · evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-fe-01.md · ≠ PAY-09 DONE
cấm: seed
```

---

## 9. Spec read ack (sa)

| Artifact | Cite |
|----------|------|
| SA-01 | Option A LOCKED · §4.2 step (14) · R-PAY-09-* |
| BA-01 | O1–O20 CONFIRMED · AC-PAY-GROUP-* · J-HRM-PAY-09-* |
| DATA-01 | §6.1–6.3 ADD stamp · match_rule_json §6.1.1 |
| PAY-08 API-01 | **O19** wire HOLD §4.14 · lifecycle DENY §4.13 |
| PAY-04 API-01 | O10 mid-month **§4.11** |
| PAY-01..08 API-01 | Process order · must_keep seals |
| Enterprise API | optional `payroll_group_id` on period · PAY-09 index |
| CODE cite | groups/** ABSENT** · eligibility/process RETAIN |

---

*End API-01 · CONFIRMED EXPAND + GAP MAP · unlock dev-be F-PAY-GROUP-01 CRUD/resolve/snapshot/filter · RETAIN PAY-08 O19 wire HOLD · DENY lifecycle PATCH · must_keep PAY01..08 · ≠ PAY-09 DONE · payroll_e2e_ready=false · 2026-08-10*
