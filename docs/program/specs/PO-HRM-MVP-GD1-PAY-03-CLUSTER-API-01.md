# PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01 — API F.1 · Giảm trừ gia cảnh từ hồ sơ · EXPAND F-PAY-GTCG-01 inside CB read/process (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-40 seat **#45**) |
| **lane** | governance · sa |
| **change_mode** | **EXPAND** logical **F-PAY-GTCG-01** inside **F-PAY-CB-READ-01** + **F-PAY-PROCESS-01** (resolve · CFG amounts · bag · header once · deny manual) · **GAP** **F-PAY-PAYSLIP-01** display-ready GTCG fields · **must_keep** **F-CORE-DEP-01** `/employees/:id/dependents*` · peer **F-PAY-ATT-CLOSED-01** · **`HRM-PAY-ATT-412`** · **`HRM-PAY-FORMULA-412`** order (**`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`**) · peer **F-PAY-SPLIT-01** static-once + **`HRM-PAY-SPLIT-409`** (**`PAY04QC1-MSMCR4GWC1`**) · physical **`/api/hrm/payroll/*`** + **`/api/hrm/employees/*`** · paper `/api/hrm/pay/*` **alias only** · Nest `@Controller('core')` **DENY** as deps/CB SoT · **DENY** public **`/api/hrm/payroll/dependents*`** CRUD · **DENY** invent `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED EXPAND + GAP MAP** — **F-CORE-DEP-01 LIVE** · GTCG consumer **ABSENT** in bag/process (grep 2026-08-10) · DATA-01 **ADD stamp** **`payroll_payslips.gtgc_amount`** §6.1 + **`pay_gtgc_statutory_cfg`** §6.2 · **unlock dev-be** migrate + resolver · **dev-fe HOLD** until BE contract · **≠ PAY-03 / FR-UC-BP-PAY-03 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-03` · `FR-UC-BP-PAY-03` · **BR-BP-PAY-02** · **REQ_L_003** · peer **FR-UC-BP-CORE-01** (**F-CORE-DEP-01**) · **FR-UC-BP-PAY-01** (**F-PAY-ATT-CLOSED-01**) · **FR-UC-BP-PAY-02** (`dependents_count` · **gd1_eval_v1**) · cross **FR-UC-BP-PAY-04** (GTCG **một lần** · **DV-14**) |
| **depends_on** | DATA-01 **CONFIRMED ADD stamp** · BA-01 O1–O16 **CONFIRMED** · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01.md) · [`PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01.md) · [`PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md) · peer API [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md) · [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md) · [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md) · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** |
| **ref_data** | DATA-01 §6.1 `payroll_payslips.gtgc_amount` · §6.2 `pay_gtgc_statutory_cfg` · §5 resolver predicate · §11 **`HRM-PAY-GTCG-412`** |
| **ref_ba** | BA-01 — AC-PAY-03-* · **J-HRM-PAY-03-01..08** DRAFT · regression **J-HRM-PAY-01-01/02/04/06** · **J-HRM-PAY-02-05..07** · **J-HRM-PAY-04-05/08** · **J-HRM-CORE-01-03** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-03** · Diễn biến **#1–#2 + luồng #3 (cấm nhập tay) + Thành công** · special «Con đủ tuổi giữa năm» |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-CB-READ-01** · **F-PAY-PROCESS-01** · **F-CORE-DEP-01** (via employees dependents) · logical **F-PAY-GTCG-01** · **`HRM-PAY-SPLIT-409`** |
| **ref_code_cite** | **read-only 2026-08-10:** `employees.controller.ts` **`/employees/:employeeId/dependents*`** LIVE (**F-CORE-DEP-01**) · `pay-formula-variable-bag.ts` — **no** `dependents_count` / `gtgc_amount_vnd` load · `payroll.service.ts` `processPayrollPeriod` — **no** GTCG resolver · `pay-payslip-split.constants.ts` + **HRM-PAY-SPLIT-409** (**PAY04**) · grep **`pay_gtgc_statutory_cfg`** / payslip **`gtgc_amount`** col **0** until migrate |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** API stamp alone = PAY-03 DONE · **DENY** F-CORE-DEP-01 CRUD alone = FR-PAY-03 DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED EXPAND + GAP MAP** |
| **unlock_lane** | **dev-be BE-01** (ensureSchema DATA §6.1–6.2 + GTCG resolver + bag + 403/412 + header persist) · **dev-fe FE-01** (read-only GTCG display · hide payroll GTCG inputs) · **qa** U65 **J-HRM-PAY-03-*** |

---

## 1. Verdict — EXPAND F-PAY-GTCG-01 inside CB read + process + GAP payslip display

| Decision | Stamp |
|----------|--------|
| NPT master (F-CORE-DEP-01) | **must_keep RETAIN** — **`/api/hrm/employees/:employeeId/dependents*`** · **`public.employee_dependents`** ONE SoT (**O1** · **REQ_L_003**) |
| Public payroll dependents API | **DENY** — **no** `GET/POST/PATCH/DELETE /api/hrm/payroll/dependents*` GĐ1 (**O11** · **AC-PAY-03-CORE-DEP-ONE**) |
| F-PAY-GTCG-01 consumer | **GAP EXPAND** — internal only inside **`F-PAY-CB-READ-01`** sub-step + persist in **`F-PAY-PROCESS-01`** (**O6–O8**) |
| F-PAY-CB-READ-01 GTCG slice | **RETAIN partial** · **EXPAND** inject **`dependents_count`** + **`gtgc_amount_vnd`** into variable bag (**O6**) |
| Statutory CFG | **GAP** — read **`pay_gtgc_statutory_cfg`** at `as_of` per DATA §6.2 · **412** if missing (**O5** · **`HRM-PAY-GTCG-412`**) |
| Process order | **must_keep RETAIN** — **`HRM-PAY-ATT-412`** → closed bag → **CB read + GTCG resolve** → **FORMULA-412** + **gd1_eval_v1** (**O7** · **PAY02QC1**) |
| Header persist | **GAP** — write **`payroll_payslips.gtgc_amount`** once and/or single **`GTCG*`** line (**O8** · DATA §6.1) |
| Split-month static once | **must_keep RETAIN** — **DV-14** · **`HRM-PAY-SPLIT-409`** if double static (**O9** · **PAY04QC1**) |
| Manual GTCG override | **GAP** — **`403`** **`HRM-PAY-GTCG-403`** on payroll mutate bodies (**O10**) |
| Payslip read | **RETAIN partial** · **GAP** — **`dependents_count`** + **`gtgc_amount_vnd`** display-ready (**O12**) |
| Admin CFG publish | **GAP optional** — mirror **`pay_insurance_rate_cfg`** settings lane · **not** payroll grid · **cấm** U65 payroll seed |
| PAY-05/06 depth | **HOLD** | SI ceiling · progressive TNCN |

```text
  CORE-01 SEALED: F-CORE-DEP-01 → employee_dependents (LIVE CRUD on /employees/.../dependents*)
  DENY: /api/hrm/payroll/dependents* · second payroll_dependents table · FE GTCG SoT
       │
       ▼
  PAY-01/02 SEALED (must_keep): ATT-412 → closed hours → FORMULA-412 → gd1_eval_v1
  PAY-04 SEALED (must_keep): split merge static GTCG once · HRM-PAY-SPLIT-409
       │
       ▼
  POST /api/hrm/payroll/periods/{id}/process (F-PAY-PROCESS-01)
       │  (1) eligibility + HRM-PAY-ATT-412
       │  (2) F-PAY-ATT-CLOSED-01 per employee
       │  (3) F-PAY-CB-READ-01 per employee
       │        └─ F-PAY-GTCG-01 GAP: RESOLVE → AMOUNT → BAG
       │              read employee_dependents @ as_of = period.end_date
       │              pick pay_gtgc_statutory_cfg @ as_of
       │              inject dependents_count, gtgc_amount_vnd
       │  (4) F-PAY-RD-APPLY-01 · F-PAY-SPLIT-01 (peer — static GTCG header path only)
       │  (5)–(7) formula eval (consumes bag vars)
       │  (8) PERSIST-GTCG GAP: gtgc_amount header xor single GTCG* line once
       │
       ▼
  GET payslip → dependents_count + gtgc_amount_vnd read-only (vi-VN display)

  DENY: standalone POST /payroll/gtgc · manual gtgc_* on period/payslip body
        gtgc_amount on split segment row · hardcode 11tr/4.4tr without CFG row
        claim deps CRUD LIVE = PAY-03 DONE
```

**Invariant PAY-03-PATH:** GTCG resolve **MUST** run inside Nest **`POST /api/hrm/payroll/periods/{id}/process`** (and documented preview bag path) — **no** mandatory public **`POST /payroll/gtgc`** GĐ1 (**AC-PAY-03-PATH**).

**Invariant PAY-03-≠-PAYROLL-DEPS-CRUD:** Any **`/api/hrm/payroll/**/dependents*`** public route = **FAIL O1/O11**.

**Invariant PAY-03-PROCESS-ORDER:** GTCG bag **before** **`gd1_eval_v1`** · **after** ATT-412 + closed bag · skip → **FAIL O7** (**PAY02QC1**).

**Invariant PAY-03-DV-14:** `gtgc_amount` on **`payroll_payslip_split_segments`** or segment DTO = **FAIL O9**.

**Invariant PAY-03-≠-MANUAL:** Body `gtgc_amount` / `gtgc_*` / `dependent_count` on payroll period/payslip mutate → **`403`** **`HRM-PAY-GTCG-403`** (**O10**).

**Invariant PAY-03-≠-FE-SOT:** FE computes `gtgc_amount_vnd` from profile without BE fields = **FAIL O12** (OS 28).

**Invariant PAY-03-≠-DEPS-DONE:** F-CORE-DEP-01 LIVE alone = FR-PAY-03 DONE = **FAIL O15**.

**Invariant PAY-03-HOLD-DUAL:** Invent **`att_leave_hold`** = **FAIL O14**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-03 / FR-UC-BP-PAY-03 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT**  
> must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10/09/07/06/05b/CORE07  
> **F-CORE-DEP-01 RETAIN** · GTCG consumer **ABSENT** until Dev · DATA ADD stamp **necessary not sufficient**  
> DENY public payroll dependents CRUD · DENY manual GTCG · DENY FE SoT · DENY segment GTCG · DENY `att_leave_hold` · DENY merge buckets  
> no seed · no apps/** this seat

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **NPT CRUD (RETAIN)** | **`GET/POST /api/hrm/employees/:employeeId/dependents`** · **`GET/PATCH/DELETE …/dependents/:dependentId`** |
| **Process (hosts GTCG)** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Payslip read (EXPAND GTCG fields)** | **`GET /api/hrm/payroll/payslips`** · **`GET /api/hrm/payroll/payslips/:payslipId`** |
| **Period preview bag (optional GAP)** | Same orchestrator preview path if exposed — bag fields mirror process (**AC-PAY-03-BAG**) |
| **F-PAY-GTCG-01** | **Internal only** — sub-step of **F-PAY-CB-READ-01** + persist hook on **F-PAY-PROCESS-01** |
| **F-PAY-CB-READ-01** | Internal during process — paper `GET /api/hrm/core/employees/{id}/compensation` **alias only** |
| **Statutory CFG admin (GAP optional)** | **`GET/PUT /api/hrm/payroll/settings/gtgc-statutory-cfg`** (or parallel `payroll/gtgc-statutory-cfg` under settings controller) — **not** blocking PAY-03 BE if CFG rows exist via existing admin path |
| **DENY** | **`/api/hrm/payroll/dependents*`** · **`/api/hrm/payroll/employees/*/dependents*`** duplicate of CORE |
| **LOGICAL (paper)** | `/api/hrm/pay/periods/{id}/process` · `/api/hrm/pay/payslips*` — **alias** → **`/api/hrm/payroll/*`** |
| **Controller** | Nest `@Controller('employees')` deps · `@Controller('payroll')` process/payslips · **`@Controller('core')` ABSENT** as deps/CB SoT |

| Paper / logical | Physical GĐ1 | DB (DATA-01) |
|-----------------|--------------|--------------|
| F-CORE-DEP-01 | `employees/.../dependents*` | **`employee_dependents`** RETAIN |
| F-PAY-GTCG-01 | internal resolver | read deps + **`pay_gtgc_statutory_cfg`** |
| `pay_payslip.gtgc_amount` | process writer | **`payroll_payslips.gtgc_amount`** ADD §6.1 |
| `dependents_count` bag | memory / response | **not** payslip col GĐ1 |
| GTCG deduction line | eval / persist | **`payroll_payslip_lines`** `component_code` ~ `GTCG*` |
| Split segment | peer PAY-04 | **no** `gtgc_amount` (**DV-14**) |
| Paper `att_leave_hold` | — | **`employee_leave_balances.pending_days`** only · **DENY** table |

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-01 verdict |
|---------|------------|----------------|
| F-CORE-DEP-01 CRUD | `employees.controller.ts` dependents routes | **must_keep RETAIN** |
| `POST …/process` | `payroll.service.ts` | **RETAIN partial** · **EXPAND** GTCG **GAP** |
| `HRM-PAY-ATT-412` / FORMULA order | PAY-01/02 cite | **must_keep RETAIN** |
| `dependents_count` in bag | `pay-formula-variable-bag.ts` **ABSENT** | **GAP** |
| `gtgc_amount_vnd` in bag | **ABSENT** | **GAP** |
| `pay_gtgc_statutory_cfg` | grep **0** | **GAP** migrate DATA §6.2 |
| `payroll_payslips.gtgc_amount` | col **ABSENT** | **GAP** migrate DATA §6.1 |
| **`HRM-PAY-GTCG-403`** | **unwired** | **GAP** |
| **`HRM-PAY-GTCG-412`** | **unwired** | **GAP** |
| **`HRM-PAY-SPLIT-409`** | PAY-04 constants/service path | **must_keep RETAIN** · bind O9 |
| Public payroll dependents | grep **0** routes | **DENY** must stay **0** |
| `att_leave_hold` | CREATE **0** | **DENY invent** |

---

## 4. F.1 — functions (normative)

> Mỗi hàng: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response ↔ DB · Lỗi.

### 4.1 F-CORE-DEP-01 — Người phụ thuộc hồ sơ ONE SoT (**must_keep RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/employees/:employeeId/dependents`** · **`POST …/dependents`** · **`GET …/dependents/:dependentId`** · **`PATCH …/dependents/:dependentId`** · **`DELETE …/dependents/:dependentId`** (soft archive) |
| **Paper alias** | `F-CORE-DEP-01` · logical `hrm_dependent` → physical **`employee_dependents`** |
| **Mục đích** | C&B/HRBP cập nhật NPT trên hồ sơ — **một** master cho thuế và phúc lợi; PAY **chỉ đọc** qua orchestrator nội bộ (**BR-BP-PAY-02** · **REQ_L_003**). |
| **Nghiệp vụ xử lý** | **RETAIN** `EmployeeDependentsService` scope U19 list=get parity · fields: `is_tax_dependent`, `effective_from`, `effective_to`, `archived_at`, relation, DOB, `full_name` · **FORBIDDEN:** duplicate CRUD under **`/payroll/`**; store computed `gtgc_amount` per dep row GĐ1; wipe CORE-01 seal without bus. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-03** Diễn biến **#1** · **FR-UC-BP-CORE-01** · **AC-PAY-03-CORE-DEP-ONE** · **AC-PAY-03-AUTHZ** · **J-HRM-PAY-03-01** · regression **J-HRM-CORE-01-03** |
| **Request → DB** | CRUD **`public.employee_dependents`** keyed `employee_id` + `company_id` |
| **Response** | **`HRM-CORE-DEP-200`** family · list/detail DTOs **RETAIN** |
| **Lỗi** | Scope **`HRM-SCOPE-409`** · validation **400** on date window |

### 4.2 F-PAY-GTCG-01 — Giảm trừ gia cảnh consumer (**GAP EXPAND** · logical · internal)

| | |
|--|--|
| **METHOD / path** | **Internal** — invoked from **§4.3 F-PAY-CB-READ-01** after compensation slice · **no** standalone public HTTP GĐ1 |
| **Paper alias** | Logical **F-PAY-GTCG-01** (DOC-DELTA — not separate paper HTTP in GĐ1 cluster) |
| **Mục đích** | Đếm NPT thuế hiệu lực tại cuối kỳ · tính **`gtgc_amount_vnd`** từ CFG · nạp bag cho formula — **không** CRUD NPT (**SRS #2**). |
| **Nghiệp vụ xử lý** | **(G1) RESOLVE** — `as_of = payroll_periods.end_date` (physical `end_date`) unless future tenant `as_of_policy` documented. Count **`employee_dependents`** where: `archived_at IS NULL` · `is_tax_dependent = true` · `effective_from <= as_of` · (`effective_to IS NULL` OR `effective_to >= as_of`) · same `employee_id` + `company_id` as payslip scope (**O2–O4**). **(G2) CFG** — select **one** active row from **`pay_gtgc_statutory_cfg`** for `company_id` (+ optional `ou_id`) at `as_of` per DATA §6.2 pick rule; if **none** → **`412`** **`HRM-PAY-GTCG-412`** with VI message — **cấm** silent 0 without policy (**O5** · **VAL-PAY-03-DATA-03**). **(G3) AMOUNT** — `gtgc_amount_vnd = gtgc_self_amount + eligible_count * gtgc_per_dependent_amount` (NUMERIC) — **cấm** sole literals `11000000`/`4400000` in service without CFG row (**AC-PAY-03-CFG**). **(G4) BAG** — set **`dependents_count`** (int ≥0) and **`gtgc_amount_vnd`** (number) on variable bag; alias **`dependent_count`** paper map **deprecated** for new code — prefer **`dependents_count`** matching PAY-02 catalog (**O6**). **(G5) FORBIDDEN:** second deps table read; FE-provided counts; apply GTCG per split segment (**DV-14**); skip when ATT-412 not satisfied. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-03** Diễn biến **#2** · **Thành công** · special «Con đủ tuổi giữa năm» (**O4**) · **AC-PAY-03-COUNT** · **AC-PAY-03-ASOF** · **AC-PAY-03-CFG** · **AC-PAY-03-BAG** · **AC-PAY-03-AGE-CUT** · **J-HRM-PAY-03-02** · **J-HRM-PAY-03-04** · **J-HRM-PAY-03-07** |
| **Request → DB** | Read **`employee_dependents`** · **`pay_gtgc_statutory_cfg`** · **`payroll_periods.end_date`** |
| **Response (internal)** | `{ dependents_count, gtgc_amount_vnd, as_of, cfg_id?, eligible_dependent_ids?: uuid[] }` embedded in bag builder |
| **Lỗi** | **`HRM-PAY-GTCG-412`** (no CFG) · scope errors from parent orchestrator |

### 4.3 F-PAY-CB-READ-01 — Nạp C&B + GTCG bag (**RETAIN partial** · **EXPAND** GTCG)

| | |
|--|--|
| **METHOD / path** | **Internal** during **`POST /api/hrm/payroll/periods/:periodId/process`** (and preview bag if implemented) — paper facade `GET /api/hrm/core/employees/{id}/compensation` **alias only** |
| **Mục đích** | Lấy lương nền, phụ cấp, BH timeline **và** biến GTCG vào variable bag — **không** từ serializer hồ sơ công khai (**D5 · P2**). |
| **Nghiệp vụ xử lý** | **RETAIN** compensation/SI read paths per PAY-02 TRACE · **INSERT EXPAND:** after base C&B vars loaded, call **§4.2 F-PAY-GTCG-01** for same `employee_id` · merge `{ dependents_count, gtgc_amount_vnd }` into bag returned to formula evaluator · **must_keep** placement **before** **`gd1_eval_v1`** (**O7**). **FORBIDDEN:** expose parallel public deps API; omit GTCG while claiming PAY-03 DONE. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-01** Diễn biến **#3** · **FR-UC-BP-PAY-03** Diễn biến **#2** · **AC-PAY-03-PROCESS-ORDER** · **AC-PAY-03-BAG** |
| **Request → DB** | Read compensation tables + **§4.2** deps/CFG |
| **Response** | `{ employee_id, variables: { base_salary, …, dependents_count, gtgc_amount_vnd } }` |
| **Lỗi** | **`HRM-CORE-CB-403`** · **`HRM-PAY-GTCG-412`** |

### 4.4 F-PAY-PROCESS-01 — Orchestrator + persist GTCG once (**RETAIN partial** · **EXPAND** GTCG persist)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Mục đích** | Chạy tính lương kỳ; sau bag + eval, ghi GTCG **một lần** trên phiếu — bind split static-once (**BR-BP-PAY-02** · **BR-BP-SPL-01** peer). |
| **Nghiệp vụ xử lý** | **Order (normative — must_keep PAY01+PAY02):** (1) Scope + period guards. (2) **`loadPayrollEligibility`** → **`412`** **`HRM-PAY-ATT-412`** if required closed sheet missing. (3) **F-PAY-ATT-CLOSED-01** per employee. (4) **§4.3 F-PAY-CB-READ-01** including **§4.2 GTCG**. (5) **F-PAY-RD-APPLY-01** · **F-PAY-SPLIT-01** per PAY-04 API-01 — static GTCG vars merge **once** on header path only (**O9**). (6) Resolve published formula → **`HRM-PAY-FORMULA-412`** if invalid. (7) **gd1_eval_v1** with bag containing **`dependents_count`**. (8) **PERSIST-GTCG (GAP):** write **`payroll_payslips.gtgc_amount`** = computed `gtgc_amount_vnd` **xor** single deduction line `component_code` matching `GTCG*` per DATA §6.3 — **cấm** duplicate same static on header **and** two lines (**O8**). (9) On split path: segment rows **must not** receive `gtgc_amount`; duplicate static → **`409`** **`HRM-PAY-SPLIT-409`**. (10) **Body guard (GAP):** if request DTO includes `gtgc_amount`, `gtgc_*`, `dependent_count`, `dependents_count` override fields → **`403`** **`HRM-PAY-GTCG-403`** before processing (**O10**). **FORBIDDEN:** process success without bag vars when deps exist; GTCG before ATT-412; public payroll dependents mutate. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-03** Diễn biến **#2–#3** · **Thành công** · peer **FR-UC-BP-PAY-02** **#3** · **FR-UC-BP-PAY-04** static once · **AC-PAY-03-HEADER** · **AC-PAY-03-SPLIT-ONCE** · **AC-PAY-03-DENY-MANUAL** · **AC-PAY-03-PROCESS-ORDER** · **J-HRM-PAY-03-02** · **J-HRM-PAY-03-03** · **J-HRM-PAY-03-05** · regression **J-HRM-PAY-01-04** · **J-HRM-PAY-02-05** · **J-HRM-PAY-04-05** |
| **Request → DB** | Read ATT + deps + CFG + formula; write **`payroll_payslips`** (+ **`gtgc_amount`** §6.1) · **`payroll_payslip_lines`** |
| **Response** | **202** `{ period_id, payslip_count?, preview_totals?, warnings[], employees?: [{ employee_id, dependents_count?, gtgc_amount_vnd?, … }] }` · **`HRM-PAY-202`** |
| **Lỗi** | **`HRM-PAY-ATT-412`** · **`HRM-PAY-FORMULA-412`** · **`HRM-PAY-GTCG-403`** · **`HRM-PAY-GTCG-412`** · **`HRM-PAY-SPLIT-409`** · **`HRM-SCOPE-409`** |

### 4.5 F-PAY-PAYSLIP-01 — Đọc phiếu + GTCG display-ready (**RETAIN partial** · **GAP expand**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/payslips`** · **`GET /api/hrm/payroll/payslips/:payslipId`** |
| **Paper alias** | `GET /api/hrm/pay/payslips/{id}` · period payslip list |
| **Mục đích** | C&B xem preview/phiếu với **`dependents_count`** và **`gtgc_amount_vnd`** **read-only** — BE SoT (**O12** · OS 28). |
| **Nghiệp vụ xử lý** | **RETAIN** list/get scope parity U19. **EXPAND:** map **`dependents_count`** from last process snapshot (bag field persisted on payslip extension JSON **or** re-read resolver on GET — **prefer** snapshot on payslip/process audit GĐ1: at minimum return values from header `gtgc_amount` + stored count if column added later; until then return from process metadata/warnings **not** FE recompute). Expose **`gtgc_amount_vnd`** from **`payroll_payslips.gtgc_amount`** when col present else from single **`GTCG*`** line amount. **FORBIDDEN:** editable GTCG fields in API; FE recalc SoT. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-03** Thành công · **FR-UC-BP-PAY-08** peer · **AC-PAY-03-DISPLAY** · **J-HRM-PAY-03-06** |
| **Request → DB** | Read **`payroll_payslips`** · **`payroll_payslip_lines`** |
| **Response** | **PayslipDto** + **`dependents_count: number`** + **`gtgc_amount_vnd: number`** · **`HRM-PAY-200`** |
| **Lỗi** | **`HRM-SCOPE-409`** · **404** OOS |

### 4.6 HRM-PAY-GTCG-403 — Cấm override GTCG trên payroll (**GAP**)

| | |
|--|--|
| **METHOD / path** | Emitted on **`POST /api/hrm/payroll/periods/:periodId/process`** · any future **`PATCH`** payslip/period mutate that accepts override fields |
| **Mục đích** | Thực thi SRS luồng **#3** — **không** nhập GTCG trùng trên bảng lương (**BR-BP-PAY-02**). |
| **Nghiệp vụ xử lý** | Reject body/query containing: `gtgc_amount`, `gtgc_*`, `dependent_count`, `dependents_count` (when sent as override), `manual_gtgc` flags · stable `code: HRM-PAY-GTCG-403` · VI `message` · **no** partial apply. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-03** luồng **#3** · **AC-PAY-03-DENY-MANUAL** · **J-HRM-PAY-03-03** |
| **Response** | **403** `{ code: 'HRM-PAY-GTCG-403', message }` |

### 4.7 HRM-PAY-GTCG-412 — Thiếu cấu hình mức GTCG (**GAP**)

| | |
|--|--|
| **METHOD / path** | Emitted from **§4.2 G2 CFG** during process (and preview if GTCG resolve runs) |
| **Mục đích** | Fail-closed khi tenant chưa có mức statutory tại `as_of` — **cấm** hardcode hoặc 0₫ im lặng UAT (**O5**). |
| **Nghiệp vụ xử lý** | When **zero** pickable **`pay_gtgc_statutory_cfg`** rows for `company_id` at `as_of` → **412** before payslip persist · include `period_id`, `company_id`, `as_of` in body for support. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-03** Diễn biến **#2** (fail nghiệp vụ) · **AC-PAY-03-CFG** · DATA **VAL-PAY-03-DATA-03** |
| **Response** | **412** `{ code: 'HRM-PAY-GTCG-412', message, as_of?, company_id? }` |

### 4.8 HRM-PAY-SPLIT-409 — Peer PAY-04 (**must_keep RETAIN**)

| | |
|--|--|
| **METHOD / path** | Emitted from split **MERGE** step when static GTCG would apply twice — cite [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md) **§4.7** |
| **Mục đích** | **Bind PAY-03** — GTCG **một lần** trên tổng hợp khi split-month (**O9** · **AC-PAY-03-SPLIT-ONCE**). |
| **Cluster lock** | PAY-03 implementation **must not** regress **PAY04QC1** detector · segment DTO **forbidden** `gtgcAmountVnd` |

### 4.9 F-PAY-GTGC-CFG-ADMIN-01 — Publish mức statutory (**GAP optional** · settings)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/settings/gtgc-statutory-cfg`** · **`PUT /api/hrm/payroll/settings/gtgc-statutory-cfg`** (or equivalent under existing payroll settings module) |
| **Mục đích** | Tenant admin thiết lập `gtgc_self_amount` / `gtgc_per_dependent_amount` effective-dated — **không** qua payroll process seed (**U65**). |
| **Nghiệp vụ xử lý** | Mirror **`pay_insurance_rate_cfg`** authZ · scope `company_id` · validate CHK §6.2 DATA · **draft/active/retired** lifecycle · **FORBIDDEN:** `pnpm seed:*` for U65 evidence; payroll grid edit. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-03** · **AC-PAY-03-CFG** |
| **Request → DB** | **`pay_gtgc_statutory_cfg`** §6.2 |
| **Lỗi** | **`HRM-SCOPE-409`** · validation **400** |
| **Note** | **Optional** for BE-01 exit if CFG rows created via existing settings patterns; **not** blocking resolver tests when test fixtures insert CFG via admin API path. |

### 4.10 DENY — Public payroll dependents CRUD (**normative reject**)

| | |
|--|--|
| **METHOD / path** | **Any** `GET/POST/PATCH/DELETE /api/hrm/payroll/**/dependents*` |
| **Mục đích** | Prevent second SoT · enforce **REQ_L_003**. |
| **Nghiệp vụ xử lý** | **Do not implement** GĐ1 · if discovered in codebase → **remove** or **410** with pointer to **F-CORE-DEP-01**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-03** · **AC-PAY-03-CORE-DEP-ONE** |

### 4.11 PAY-05 / PAY-06 — (**HOLD footers**)

| | |
|--|--|
| **Mục đích** | **BR-BP-SPL-02** SI ceiling depth = **PAY-05** · khấu trừ thuế TNCN lũy tiến đầy đủ = **formula + PAY-06** — seat này chỉ **count + gtgc_amount_vnd** consumer (**O16**). |
| **Tham chiếu** | **AC-PAY-03-TAX-ENGINE-HOLD** |

---

## 5. Display-ready DTO lock (FE / QA)

### 5.1 Variable bag keys (process / preview)

| Key | Type | Source | FE rule |
|-----|------|--------|---------|
| `dependents_count` | int ≥0 | **§4.2 G4** | **read-only** · formula may reference (**PAY-02**) |
| `gtgc_amount_vnd` | number (VND) | **§4.2 G3** | API plain number · display **vi-VN** thousand grouping |
| `as_of` | date ISO | `period.end_date` | display **dd/MM/yyyy** |

### 5.2 PayslipDto GTCG fields

| Field | Type | DB / source | FE rule |
|-------|------|-------------|---------|
| `dependentsCount` | int | process snapshot / resolver | **read-only** |
| `gtgcAmountVnd` | money | `payroll_payslips.gtgc_amount` or `GTCG*` line | **read-only** · **cấm** input on payroll grid GĐ1 |
| **FORBIDDEN** | — | — | FE recompute from profile dependents as SoT |

### 5.3 Error banners (VI)

| Code | HTTP | When |
|------|------|------|
| **`HRM-PAY-GTCG-403`** | 403 | Manual override attempt |
| **`HRM-PAY-GTCG-412`** | 412 | No statutory CFG at `as_of` |
| **`HRM-PAY-SPLIT-409`** | 409 | Double static GTCG on split merge |
| **`HRM-PAY-ATT-412`** | 412 | Before GTCG side-effects |

---

## 6. Scope parity (U19)

| Surface | Rule |
|---------|------|
| `POST …/process` | Same period `company_id` + OU expansion as period list/get |
| `GET …/payslips` / `:id` | **`resolveHrmListScope`** — list row visible ⇒ get-by-id GTCG fields in scope (**J-HRM-PAY-03-06** L2.5) |
| F-CORE-DEP-01 list/get | Same employee scope as CORE-01 · **J-HRM-CORE-01-03** |
| Internal deps read in process | `employee_id` must belong to period batch scope — cross-company **409** |
| CFG admin | `company_id` settings scope only |

---

## 7. Traceability matrix (API → AC → J-*)

| API § | AC | Journey |
|-------|-----|---------|
| §4.1 F-CORE-DEP-01 | AC-PAY-03-CORE-DEP-ONE · AUTHZ | J-03-01 · J-CORE-01-03 |
| §4.2 RESOLVE/COUNT | AC-PAY-03-COUNT · ASOF · AGE-CUT | J-03-02 · J-03-04 |
| §4.2 CFG/AMOUNT | AC-PAY-03-CFG | J-03-02 |
| §4.3 BAG | AC-PAY-03-BAG · PROCESS-ORDER | J-03-07 · J-PAY-02-05 |
| §4.4 PERSIST | AC-PAY-03-HEADER · SPLIT-ONCE | J-03-02 · J-03-05 |
| §4.6 403 | AC-PAY-03-DENY-MANUAL | J-03-03 |
| §4.7 412 | AC-PAY-03-CFG | J-03-02 (fail path) |
| §4.5 payslip | AC-PAY-03-DISPLAY | J-03-06 |
| §4.8 SPLIT-409 | AC-PAY-03-SPLIT-ONCE | J-03-05 · J-PAY-04-05 |
| §4.10 DENY payroll deps | AC-PAY-03-CORE-DEP-ONE | J-03-08 |
| Footer | AC-PAY-03-H · MK-PEERS | J-03-08 · regression J-PAY-01/02/04 |

---

## 8. RETAIN vs GAP vs HOLD summary

| F-id / residual | Verdict | Owner |
|-----------------|---------|-------|
| F-CORE-DEP-01 | **must_keep RETAIN** | peer CORE-01 regression |
| F-PAY-ATT-CLOSED-01 + ATT-412 | **must_keep RETAIN** | PAY-01 |
| F-PAY-FORMULA-412 + gd1_eval_v1 | **must_keep RETAIN** | PAY-02 |
| F-PAY-GTCG-01 resolver | **GAP EXPAND** | **dev-be BE-01** |
| F-PAY-CB-READ-01 GTCG slice | **GAP EXPAND** | **dev-be** |
| F-PAY-PROCESS-01 persist GTCG | **GAP EXPAND** | **dev-be** |
| `pay_gtgc_statutory_cfg` + `gtgc_amount` col | **GAP** migrate | **dev-be** after DATA stamp |
| HRM-PAY-GTCG-403 / 412 | **GAP** | **dev-be** + **qa** |
| F-PAY-PAYSLIP-01 GTCG fields | **GAP** | **dev-be** + **dev-fe** |
| F-PAY-GTGC-CFG-ADMIN-01 | **GAP optional** | **dev-be** settings |
| HRM-PAY-SPLIT-409 | **must_keep RETAIN** | PAY-04 bind |
| Public `/payroll/dependents*` | **DENY** | — |
| PAY-05 SI ceiling | **HOLD** | PAY-05 |
| PAY-06 progressive tax | **HOLD** | PAY-06 |
| `att_leave_hold` | **DENY invent** | — |

---

## 9. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API-01 **CONFIRMED EXPAND + GAP MAP** for UC-BP-PAY-03: full **F.1** per §4 — **RETAIN** **F-CORE-DEP-01** · **DENY** public payroll dependents CRUD; logical **F-PAY-GTCG-01** inside **F-PAY-CB-READ-01** + **F-PAY-PROCESS-01** (resolve · CFG · bag **`dependents_count`** + **`gtgc_amount_vnd`** · header once · **403/412**); **F-PAY-PAYSLIP-01** display-ready §5; **must_keep** **PAY01QC1** + **PAY02QC1** process order + **PAY04QC1** **HRM-PAY-SPLIT-409** / **DV-14**; docs-only · **unlock dev-be** migrate DATA §6.1–6.2 + implementation · **≠ PAY-03 / payroll_e2e / PAY UAT DONE** · **`payroll_e2e_ready=false`** · **C-SLICE**. |
| **next_owner** | **pm** → **dev-be** `PO-HRM-MVP-GD1-PAY-03-CLUSTER-BE-01` |
| **ack_status** | **PASS_TO_PM CONFIRMED EXPAND + GAP MAP** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md` |
| **residual** | BE resolver + bag + 403/412 + header · optional CFG admin · FE read-only · QA **J-HRM-PAY-03-*** · QC GWC · PAY-05/06 depth |

### next_dispatch_prompt (copy-ready — dev-be BE-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-03-CLUSTER-BE-01
role: dev-be
lane: execution · UC-BP-PAY-03 · FR-UC-BP-PAY-03 · BR-BP-PAY-02 · REQ_L_003
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-40 seat #45)
depends_on: API-01 CONFIRMED EXPAND+GAP @ docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md · DATA-01 ADD stamp payroll_payslips.gtgc_amount §6.1 + pay_gtgc_statutory_cfg §6.2 · BA O1–O16 · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + PAY04QC1-MSMCR4GWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P + ATT peer chain
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md (§4.2 F-PAY-GTCG-01 · §4.3 CB read · §4.4 process persist · §4.6–4.7 errors · §5 DTO)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01.md (§6.1–6.2 · resolver predicate §5)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01.md (AC-PAY-03-* · J-HRM-PAY-03-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md (§4.6 F-PAY-ATT-CLOSED-01 · ATT-412 order)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md (§4.7 process order · gd1_eval_v1 · dependents_count catalog)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md (§4.7 HRM-PAY-SPLIT-409 · DV-14 static once)
spec_ref: FR-UC-BP-PAY-03 Diễn biến #1–#2 + luồng #3 + Thành công · API-01 §4.2 G1–G5 · AC-PAY-03-PROCESS-ORDER · AC-PAY-03-DENY-MANUAL · AC-PAY-03-SPLIT-ONCE
change_mode: ADD narrow · preserve_default · code_memory_required: true · code_memory_mode: APPEND
allowed_paths: apps/api/hrm-api/src/payroll/** (GTCG resolver service · pay-formula-variable-bag.ts bag keys · process body guard · payslip DTO) · apps/api/hrm-api/src/employees/employee-dependents.service.ts (read-only internal helper if needed — preserve F-CORE-DEP-01 mutate surface) · ensureSchema/migrate for DATA §6.1–6.2 · jest spec-mapped
forbidden_paths: GET/POST/PATCH/DELETE /api/hrm/payroll/**/dependents* (DENY second SoT) · gtgc_amount on split segment · invent att_leave_hold · merge hour buckets · Nest /core controller for deps SoT · hardcode 11_000_000/4_400_000 without CFG row · wipe PAY01/PAY02/PAY04/ATT seals · honesty flip · claim PAY-03 DONE · U65 payroll seed
entry_criteria: API-01 + DATA-01 stamps PASS · hrm-api dev stack
exit_criteria:
  1) ensureSchema/migrate: payroll_payslips.gtgc_amount + pay_gtgc_statutory_cfg per DATA §6.1–6.2
  2) Implement F-PAY-GTCG-01: as_of=period.end_date count + CFG pick + gtgc_amount_vnd formula; inject dependents_count + gtgc_amount_vnd into bag before gd1_eval_v1
  3) Process order: HRM-PAY-ATT-412 → closed bag → CB read+GTCG → formula eval → persist gtgc_amount header xor single GTCG* line once
  4) HRM-PAY-GTCG-403 on body override fields; HRM-PAY-GTCG-412 when no CFG; regression HRM-PAY-SPLIT-409 unchanged
  5) GET payslip includes dependentsCount + gtgcAmountVnd display-ready per API-01 §5.2
  6) U19 scope_parity payslip list=get; internal deps read respects employee scope
  7) jest: resolver predicate (archived/non-tax/out-of-window excluded) · 403/412 · bag keys · must_keep PAY-01/02 order tests green
  8) READY_FOR_QA evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-03-cluster-be-01.md · ack_status READY_FOR_QA · ≠ PAY-03 DONE · payroll_e2e_ready=false · C-SLICE
cấm: seed for U65 AC · public payroll dependents routes · reopen J-HRM-PAY-01-* / J-HRM-PAY-02-05..07 / J-HRM-PAY-04-05/08 / J-CORE-01-03 without regression bus
```

### next_dispatch_prompt (copy-ready — dev-fe FE-01 · after BE READY_FOR_QA)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-03-CLUSTER-FE-01
role: dev-fe
lane: execution · UC-BP-PAY-03 · FR-UC-BP-PAY-03
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-40 seat #45)
depends_on: dev-be PAY-03-BE-01 READY_FOR_QA with dependentsCount + gtgcAmountVnd contract @ API-01 §5
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md (§5 display-ready)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01.md (AC-PAY-03-DENY-MANUAL · AC-PAY-03-DISPLAY · J-HRM-PAY-03-03/06)
change_mode: FIX narrow · display-only · preserve_default
allowed_paths: apps/web/** payroll payslip preview/detail · hide editable GTCG on period grid per slice map
forbidden_paths: FE GTCG/count SoT · editable GTCG column on payroll grid GĐ1 · client-side gtgc_amount_vnd recompute from profile
exit_criteria: U65 J-HRM-PAY-03-03 (no edit) + J-03-06 (read-only vi-VN) · F5 · Network 2xx · evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-03-cluster-fe-01.md · ≠ PAY-03 DONE
cấm: seed
```

---

## 10. Spec read ack (sa)

| Artifact | Cite |
|----------|------|
| DATA-01 | §6.1 `gtgc_amount` · §6.2 `pay_gtgc_statutory_cfg` · §5 resolver · §11 **HRM-PAY-GTCG-412** |
| BA-01 | O1–O16 · AC-PAY-03-* · J-HRM-PAY-03-* |
| SA-01 | Option A LOCKED · §5 F.1 disposition |
| PAY-01 API-01 | F-PAY-ATT-CLOSED-01 · ATT-412 order |
| PAY-02 API-01 | F-PAY-PROCESS-01 · FORMULA-412 · `dependents_count` catalog |
| PAY-04 API-01 | HRM-PAY-SPLIT-409 · DV-14 static once |
| API_DESIGN paper | F-PAY-CB-READ-01 · F-PAY-PROCESS-01 |
| CODE cite | F-CORE-DEP-01 LIVE · GTCG bag **ABSENT** · SPLIT-409 **RETAIN cite** |

---

*End API-01 · CONFIRMED EXPAND + GAP MAP · unlock dev-be migrate + GTCG consumer · ≠ PAY-03 DONE · payroll_e2e_ready=false · 2026-08-10*
