# PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01 — API F.1 · Trần BH trên tổng hợp kỳ · EXPAND F-PAY-SI-CEILING-01 inside F-PAY-PROCESS-01 (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-41 seat **#46**) |
| **lane** | governance · sa |
| **change_mode** | **EXPAND** logical **F-PAY-SI-CEILING-01** inside **F-PAY-PROCESS-01** (merged insurance base · `min(base, ceiling_amount)` once · `si_*` header once · CFG pick · deny manual) · **GAP** **F-PAY-PAYSLIP-01** display-ready SI/ceiling/base fields · **must_keep** **F-SET-SI-01..03** `/settings/insurance-rate-cfg` · **`pickActiveRateForPeriod`** · **`HRM-SET-SI-412-MISSING`** · peer **F-PAY-SPLIT-01** + **`HRM-PAY-SPLIT-409`** (**`PAY04QC1-MSMCR4GWC1`**) · peer **F-PAY-GTCG-01** + **`HRM-PAY-GTCG-403/412`** (**`PAY03QC1-MSMDDGWC1`**) · peer **F-PAY-ATT-CLOSED-01** · **`HRM-PAY-ATT-412`** · **`HRM-PAY-FORMULA-412`** (**`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`**) · peer **F-CORE-SI-01..03** enrollment cite · physical **`/api/hrm/payroll/*`** + **`/api/hrm/settings/insurance-rate-cfg*`** · paper `/api/hrm/pay/*` **alias only** · Nest `@Controller('core')` **DENY** as rate SoT · **DENY** `POST /payroll/insurance-rate` duplicate master · **DENY** invent `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED EXPAND + GAP MAP** — **`pay_insurance_rate_cfg`** + **`pickActiveRateForPeriod`** LIVE · **SI ceiling consumer ABSENT** on process (grep 2026-08-10) · DATA-01 **ADD stamp** **`payroll_payslips.si_employee_amount`** / **`si_employer_amount`** §6.1 closable · **unlock dev-be** migrate + implementation · **dev-fe HOLD** until BE contract · **≠ PAY-05 / FR-UC-BP-PAY-05 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-05` · `FR-UC-BP-PAY-05` · **BR-BP-SPL-02** · **REQ_L_003** · **REQ_L_004** · peer **FR-UC-BP-PAY-03** (**F-PAY-GTCG-01** · static plane §4.2) · peer **FR-UC-BP-PAY-04** (**F-PAY-SPLIT-01** · **DV-14**) · peer **FR-UC-BP-PAY-02** (`is_insurance_base` · **gd1_eval_v1**) · peer **FR-UC-BP-CORE-10** (**F-CORE-SI-01..03**) |
| **depends_on** | DATA-01 **CONFIRMED ADD stamp** · BA-01 O1–O18 **CONFIRMED** · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01.md) · [`PO-HRM-MVP-GD1-PAY-05-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-05-CLUSTER-BA-01.md) · [`PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01.md) · peer API [`PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md) · [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md) · [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md) · [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md) · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** |
| **ref_data** | DATA-01 §6.1 `si_*` header · §6.2 RETAIN `ceiling_amount` on CFG · §5 formula · §11 errors |
| **ref_ba** | BA-01 — AC-PAY-05-* · **J-HRM-PAY-05-01..08** DRAFT · regression **J-HRM-PAY-03-*** · **J-HRM-PAY-04-05/06/08** · **J-HRM-PAY-01-*** · **J-HRM-PAY-02-05..07** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-05** · Diễn biến **#1–#2 + Thành công** · trường hợp đặc biệt «Vào giữa tháng» |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-PROCESS-01** (snapshot `pay_insurance_rate_cfg` ceiling) · **F-PAY-SPLIT-01** · logical **F-PAY-SI-CEILING-01** (DOC-DELTA cluster) · Settings **F-SET-SI-01..03** |
| **ref_code_cite** | **read-only 2026-08-10:** `insurance-rate-cfg.service.ts` **`pay_insurance_rate_cfg`** LIVE incl. **`ceiling_amount`** · **`pickActiveRateForPeriod`** → **`HRM-SET-SI-412-MISSING`** · `payroll.service.ts` `processPayrollPeriod` — **no** consolidated base + cap math · **`payroll_payslips`** **no** `si_*` cols until migrate · PAY-04 **`PAY_SPLIT_STATIC_COMPONENT_PREFIXES`** incl. **SI_/BH_** + **HRM-PAY-SPLIT-409** · PAY-03 GTCG consumer **bind** sealed API-01 (**may be partial LIVE**) |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** API stamp alone = PAY-05 DONE · **DENY** F-SET-SI CRUD alone = FR-PAY-05 DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED EXPAND + GAP MAP** |
| **unlock_lane** | **dev-be BE-01** (ensureSchema DATA §6.1 + SI ceiling service + process order + 403/412 bind) · **dev-fe FE-01** (read-only SI/ceiling on preview) · **qa** U65 **J-HRM-PAY-05-*** + regression PAY-03/04 |

---

## 1. Verdict — EXPAND F-PAY-SI-CEILING-01 after GTCG inside process + GAP payslip SI fields

| Decision | Stamp |
|----------|--------|
| Rate CFG (F-SET-SI-01..03) | **must_keep RETAIN** — **`/api/hrm/settings/insurance-rate-cfg*`** · **`pay_insurance_rate_cfg`** incl. **`ceiling_amount`** · **≠** PAY-05 DONE alone |
| `pickActiveRateForPeriod` | **must_keep RETAIN** — **`412`** **`HRM-SET-SI-412-MISSING`** when no active row (**V-13** · **O6**) |
| Enrollment peer (CORE-10) | **must_keep RETAIN cite** — **`employee_insurances`** gates participation · **`hrm_insurance_rate_period`** append · **≠** rate % SoT on enrollment row |
| F-PAY-SI-CEILING-01 consumer | **GAP EXPAND** — internal only after **F-PAY-SPLIT-01** merge + **F-PAY-GTCG-01** persist (**§4.2 order**) |
| Consolidated insurance base | **GAP** — sum **`is_insurance_base`** components on **merged** period gross post-split (**O3**) |
| Ceiling once | **GAP** — `contribution_base_vnd = min(merged_base, ceiling_amount)` **once** per `insurance_type_key` (**O4** · **BR-BP-SPL-02**) |
| Header `si_*` persist | **GAP** — **`payroll_payslips.si_employee_amount`** / **`si_employer_amount`** DATA §6.1 · writer = process only |
| Split-month static | **must_keep RETAIN** — **DV-14** · **no** `si_*` on segment · **`HRM-PAY-SPLIT-409`** if duplicate static SI (**O9** · **PAY04QC1**) |
| GTCG chain | **must_keep BIND** — merge → GTCG once (**PAY03QC1**) → SI ceiling once (**this seat**) → formula/tax (**PAY-02** + **PAY-06** HOLD) |
| Manual override | **GAP** — **`403`** **`HRM-PAY-SI-403`** on body `si_*` / `ceiling_*` / manual BH fields (**O11**) |
| Payslip read SI fields | **RETAIN partial** · **GAP** — display-ready §5 |
| PAY-06 / PAY-07 | **HOLD** | full period run · termination SI cutoff |

```text
  Settings LIVE (must_keep RETAIN): pay_insurance_rate_cfg (% + ceiling_amount)
        pickActiveRateForPeriod → HRM-SET-SI-412-MISSING (V-13)
        F-SET-SI-01..03 admin only — DENY payroll duplicate rate table

  CORE-10 SEALED (must_keep RETAIN): employee_insurances + hrm_insurance_rate_period
        enrollment ≠ rate master

  PAY-01/02 SEALED: ATT-412 → closed bag → FORMULA-412 → gd1_eval_v1 · is_insurance_base catalog
  PAY-04 SEALED: F-PAY-SPLIT-01 merge one Net · DV-14 · HRM-PAY-SPLIT-409 (GTCG + SI_/BH_ prefixes)
  PAY-03 SEALED: F-PAY-GTCG-01 → dependents_count + gtgc_amount_vnd ONCE post-merge (BIND §4.2)
       │
       ▼
  POST /api/hrm/payroll/periods/{id}/process (F-PAY-PROCESS-01)
       │  (1) eligibility + HRM-PAY-ATT-412
       │  (2) F-PAY-ATT-CLOSED-01 per employee
       │  (3) F-PAY-CB-READ-01 (+ PAY-03 GTCG bag slice)
       │  (4) F-PAY-SPLIT-01 merge → consolidated gross/components
       │  (5) F-PAY-GTCG-01 persist once (PAY03QC1 — peer)
       │  (6) F-PAY-SI-CEILING-01 GAP:
       │        BASE → PICK CFG per type → CEILING once → COMPUTE si_* → PERSIST header
       │  (7) Formula / component eval + tax depth (PAY-02 RETAIN · PAY-06 HOLD progressive)
       │
       ▼
  GET payslip → consolidated_insurance_base_vnd + ceiling_amount_vnd + si_* read-only (vi-VN)

  DENY: min(base,ceiling) per segment then sum · FE computes trần/si_*
        manual ceiling column on payroll grid · claim Settings SI = PAY-05 DONE
        si_* on split segment row · second rate master in PAY module
```

**Invariant PAY-05-PATH:** SI ceiling **MUST** run inside Nest **`POST /api/hrm/payroll/periods/{id}/process`** after **F-PAY-GTCG-01** persist when GTCG step is in pipeline — **no** mandatory public **`POST /payroll/si-ceiling`** GĐ1 (**AC-PAY-05-PATH**).

**Invariant PAY-05-PROCESS-ORDER:** SI ceiling **after** split merge + GTCG once · **before** progressive TNCN depth (**PAY-06** HOLD) · **after** **`HRM-PAY-ATT-412`** (**AC-PAY-05-PROCESS-ORDER** · **PAY02QC1**).

**Invariant PAY-05-CEILING-ONCE:** Per-segment `min(segment_base, ceiling)` then aggregate `si_*` = **FAIL** (**BR-BP-SPL-02** · **AC-PAY-05-CEILING**).

**Invariant PAY-05-DV-14:** `si_employee_amount` / `si_employer_amount` / `ceiling_amount` on **`payroll_payslip_split_segments`** or segment DTO = **FAIL** (**AC-PAY-05-DV-14**).

**Invariant PAY-05-≠-FE-SOT:** FE computes insurance base / cap / `si_*` = **FAIL** (**O12** · OS 28).

**Invariant PAY-05-≠-MANUAL:** Body override `si_*` / `ceiling_*` / `insurance_base_*` on process or payslip mutate → **`403`** **`HRM-PAY-SI-403`** (**O11**).

**Invariant PAY-05-≠-CFG-DONE:** F-SET-SI LIVE alone = FR-PAY-05 DONE = **FAIL** (**O16**).

**Invariant PAY-05-HOLD-DUAL:** Invent **`att_leave_hold`** = **FAIL** (**O14**).

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-05 / FR-UC-BP-PAY-05 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT**  
> must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10/09/07/06/05b/CORE07  
> **F-SET-SI RETAIN** · SI ceiling consumer **ABSENT** until Dev · DATA ADD stamp **necessary not sufficient**  
> **BIND PAY-03 GTCG §4.2** · **BIND PAY-04 merge/DV-14/409** · DENY per-segment cap · DENY second rate table · DENY manual ceiling/SI · DENY FE SI SoT · DENY `si_*` on segment · DENY claim CFG CRUD = DONE · DENY `att_leave_hold` · DENY merge buckets  
> no seed · no apps/** this seat

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **Rate CFG admin (RETAIN)** | **`GET/POST/PATCH /api/hrm/settings/insurance-rate-cfg`** (+ get-by-id variants per existing controller) |
| **Process (hosts SI ceiling)** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Payslip read (EXPAND SI fields)** | **`GET /api/hrm/payroll/payslips`** · **`GET /api/hrm/payroll/payslips/:payslipId`** |
| **Enrollment (RETAIN cite)** | **`/api/hrm/employee-insurances*`** · **`/api/hrm/contracts-insurance/*`** (CORE-10 — participation gate only) |
| **F-PAY-SI-CEILING-01** | **Internal only** — sub-step of **F-PAY-PROCESS-01** after **F-PAY-GTCG-01** |
| **F-PAY-GTCG-01 (peer)** | Internal — cite PAY-03 API-01 **§4.2–4.4** |
| **F-PAY-SPLIT-01 (peer)** | Internal — cite PAY-04 API-01 **§4.1** |
| **LOGICAL (paper)** | `/api/hrm/pay/periods/{id}/process` · `/api/hrm/pay/payslips*` — **alias** → **`/api/hrm/payroll/*`** |
| **DENY** | **`POST /api/hrm/payroll/insurance-rate*`** CRUD GĐ1 · **`PATCH`** payslip with `si_*` / `ceiling_*` override |
| **Controller** | Nest `@Controller('settings')` rate CFG · `@Controller('payroll')` process/payslips · **`@Controller('core')` ABSENT** as rate SoT |

| Paper / logical | Physical GĐ1 | DB (DATA-01) |
|-----------------|--------------|--------------|
| F-SET-SI rate master | `settings/insurance-rate-cfg` | **`pay_insurance_rate_cfg`** incl. **`ceiling_amount`** RETAIN |
| `pay_payslip.si_employee_amount` | process writer | **`payroll_payslips.si_employee_amount`** ADD §6.1 |
| `pay_payslip.si_employer_amount` | process writer | **`payroll_payslips.si_employer_amount`** ADD §6.1 |
| Insurance base (logical) | app resolver | **no** dedicated col GĐ1 — merged components |
| `ceiling_amount` on payslip | read from CFG at process | **DENY** persist ceiling on payslip col |
| Split segment | peer PAY-04 | **no** `si_*` (**DV-14**) |
| `hrm_insurance_rate_period` | CORE append | **RETAIN** peer only |
| Paper `att_leave_hold` | — | **`employee_leave_balances.pending_days`** only · **DENY** table |

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-01 verdict |
|---------|------------|----------------|
| F-SET-SI CRUD + `ceiling_amount` | `insurance-rate-cfg.service.ts` | **must_keep RETAIN** |
| `pickActiveRateForPeriod` | same service → **412** | **must_keep RETAIN** **`HRM-SET-SI-412-MISSING`** |
| `POST …/process` | `payroll.service.ts` | **RETAIN partial** · **EXPAND** SI step **GAP** |
| Consolidated base + cap math | grep **ABSENT** on process path | **GAP** **F-PAY-SI-CEILING-01** |
| `payroll_payslips.si_*` cols | ensureSchema **without** | **GAP** migrate DATA §6.1 |
| `is_insurance_base` catalog | PAY-02 cite | **RETAIN** for BASE resolver |
| **`HRM-PAY-SPLIT-409`** | PAY-04 constants | **must_keep RETAIN** · bind O9 |
| **`HRM-PAY-GTCG-403/412`** | PAY-03 contract | **must_keep BIND** process order |
| **`HRM-PAY-SI-403`** | **unwired** | **GAP** |
| `POST /payroll/insurance-rate` duplicate | grep **0** expected | **DENY** must stay **0** |
| `att_leave_hold` | CREATE **0** | **DENY invent** |

---

## 4. F.1 — functions (normative)

> Mỗi hàng: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response ↔ DB · Lỗi.

### 4.1 F-SET-SI-01..03 — Cấu hình tỷ lệ & trần BH (**must_keep RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/settings/insurance-rate-cfg`** · **`POST /api/hrm/settings/insurance-rate-cfg`** · **`GET/PATCH /api/hrm/settings/insurance-rate-cfg/:id`** (exact paths per existing `insurance-rate-cfg.controller.ts`) |
| **Paper alias** | **F-SET-SI-01** list · **F-SET-SI-02** upsert/publish · **F-SET-SI-03** pick-at-period (internal + admin) |
| **Mục đích** | Tenant admin thiết lập **`employee_rate_pct`** · **`employer_rate_pct`** · **`ceiling_amount`** theo `insurance_type_key` và hiệu lực — **một** master SoT cho PAY consumer (**O1** · **REQ_L_004**). |
| **Nghiệp vụ xử lý** | **RETAIN** `InsuranceRateCfgService` scope U19 list=get parity · effective-dated rows · `archived_at` soft retire · **FORBIDDEN:** duplicate **`payroll_insurance_rate_cfg`** table; payroll module CRUD rate master GĐ1; claim admin CFG LIVE = **FR-UC-BP-PAY-05 DONE**; U65 payroll seed for rates. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-05** input table · **AC-PAY-05-CFG-SOT** · **J-HRM-PAY-05-01** (RETAIN cite — **≠** PAY-05 DONE) |
| **Request → DB** | **`public.pay_insurance_rate_cfg`** (`company_id`, `insurance_type_key`, rates, **`ceiling_amount`**, `effective_from`, `effective_to`, `status`, audit) |
| **Response** | **`HRM-SET-SI-200`** family DTOs · money fields plain number API · display vi-VN on FE |
| **Lỗi** | **`HRM-SCOPE-409`** · validation **400** on date overlap / negative ceiling |

### 4.2 F-PAY-SI-CEILING-01 — Trần BH một lần trên tổng hợp kỳ (**GAP EXPAND** · logical · internal)

| | |
|--|--|
| **METHOD / path** | **Internal** — invoked from **§4.4 F-PAY-PROCESS-01** step **(8)** after **§4.8 F-PAY-GTCG-01** persist · **no** standalone public HTTP GĐ1 |
| **Paper alias** | Logical **F-PAY-SI-CEILING-01** (DOC-DELTA inside **F-PAY-PROCESS-01** — paper mentions snapshot ceiling) |
| **Mục đích** | Sau gộp thu nhập kỳ (split nếu có) và GTCG tĩnh một lần: tính **mức đóng BH** từ thu nhập hợp nhất · áp **`ceiling_amount`** **một lần** per type · ghi **`si_employee_amount`** / **`si_employer_amount`** một lần — **cấm** áp trần từng đoạn rồi cộng (**BR-BP-SPL-02**). |
| **Nghiệp vụ xử lý** | **Preconditions:** (P0) **`HRM-PAY-ATT-412`** satisfied (**must_keep PAY01**). (P1) **F-PAY-SPLIT-01** merge completed when split path — consolidated gross + component lines available (**must_keep PAY04**). (P2) **F-PAY-GTCG-01** static applied **once** on header path (**must_keep PAY03** · **§4.2 order**). **Pipeline (per employee in batch):** **(S1) BASE** — `merged_insurance_base_vnd = SUM(component amounts where salary_components.is_insurance_base = true on **merged** period totals post-split)` · **cấm** include non-eligible components (**O3** · **VAL-PAY-05-DATA-13**). Mid-month hire: pro-rate **days** on eligible amounts per SRS special **before** cap on **period consolidated** base — **still** one `min(base, ceiling)` on period total (**O10**). **(S2) ENROLL-GATE** — for each `insurance_type_key` (BHXH/BHYT/BHTN…): **`employee_insurances`** active participation at `as_of = period.end_date` (**O2** CORE-10 cite); skip types not enrolled — **cấm** silent charge for unenrolled type without documented policy. **(S3) PICK-RATE** — **`pickActiveRateForPeriod({ company_id, insurance_type_key, period_end })`** on **`pay_insurance_rate_cfg`** · if **no** active row → **`412`** **`HRM-SET-SI-412-MISSING`** · **cấm** silent 0% (**O6** · **V-13**). **`ceiling_amount` NULL policy:** treat as unlimited cap (= use full `merged_insurance_base_vnd`) — document in tenant config; **cấm** treat NULL as zero cap without BA waiver (**VAL-PAY-05-DATA-04**). **(S4) CEILING** — `contribution_base_vnd = MIN(merged_insurance_base_vnd, cfg.ceiling_amount)` when ceiling present · **once** per type per NV per period (**O4**). **(S5) COMPUTE** — `type_employee_vnd = contribution_base_vnd * employee_rate_pct / 100` · `type_employer_vnd = contribution_base_vnd * employer_rate_pct / 100` · aggregate: `si_employee_amount = SUM(type_employee_vnd)` · `si_employer_amount = SUM(type_employer_vnd)` (**O5**). **(S6) PERSIST** — write **`payroll_payslips.si_employee_amount`** / **`si_employer_amount`** (**O8** DATA §6.1) **xor** aggregated **`SI*`/`BH*`/`BHXH*`** deduction lines **once** — **cấm** duplicate same amounts on header **and** multiple static lines (**VAL-PAY-05-DATA-07**). Optional: soft snapshot `insurance_rate_cfg_ids[]` or JSON on payslip extension — **HOLD** API optional field `rate_cfg_snapshot` GĐ1. **(S7) DOUBLE-STATIC-GUARD** — if merge path would emit per-segment SI static lines → **`409`** **`HRM-PAY-SPLIT-409`** (**O9** · **PAY04QC1**). **FORBIDDEN:** per-segment cap then sum; FE-provided base/ceiling; persist `ceiling_amount` column on payslip; second rate table read; skip pick when CFG missing; apply SI **before** GTCG when both static (**§4.2**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-05** Diễn biến **#1** (gộp thu nhập) · **#2** (áp trần một lần) · **Thành công** · special «Vào giữa tháng» (**O10**) · **AC-PAY-05-BASE** · **AC-PAY-05-CEILING** · **AC-PAY-05-MULTI** · **AC-PAY-05-MID** · **AC-PAY-05-HEADER** · **AC-PAY-05-GTCG-CHAIN** · **J-HRM-PAY-05-02** · **J-HRM-PAY-05-03** · **J-HRM-PAY-05-04** |
| **Request → DB** | Read **`pay_insurance_rate_cfg`** · **`employee_insurances`** · merged payslip components/lines · **`payroll_periods.end_date`**; write **`payroll_payslips.si_*`** §6.1 · optional **`payroll_payslip_lines`** |
| **Response (internal)** | `{ merged_insurance_base_vnd, contribution_base_vnd_by_type[], ceiling_amount_vnd_applied, si_employee_amount_vnd, si_employer_amount_vnd, rate_cfg_snapshot? }` embedded in process employee payload |
| **Lỗi** | **`HRM-SET-SI-412-MISSING`** · **`HRM-PAY-SPLIT-409`** (peer) · **`HRM-PAY-ATT-412`** (peer, before step) |

### 4.3 pickActiveRateForPeriod — Pick CFG tại cuối kỳ (**must_keep RETAIN** · internal + settings)

| | |
|--|--|
| **METHOD / path** | **Internal** — `InsuranceRateCfgService.pickActiveRateForPeriod` · also used by settings admin validation |
| **Mục đích** | Chọn **một** bản ghi **`pay_insurance_rate_cfg`** active cho `company_id` + `insurance_type_key` tại **`period_end`** — SoT cho % và trần (**V-13**). |
| **Nghiệp vụ xử lý** | **RETAIN** existing pick logic · effective window · `status=active` · `archived_at IS NULL` · **412** **`HRM-SET-SI-412-MISSING`** when zero rows · **cấm** fallback 0% in process UAT path (**O6**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-05** Diễn biến **#2** (fail nghiệp vụ) · **AC-PAY-05-412** · **J-HRM-PAY-05-05** |
| **Request → DB** | Read **`pay_insurance_rate_cfg`** |
| **Lỗi** | **`HRM-SET-SI-412-MISSING`** **412** |

### 4.4 F-PAY-PROCESS-01 — Orchestrator + SI step binding (**RETAIN partial** · **EXPAND**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/process`** |
| **Mục đích** | Host pipeline kỳ; step **(6)** gọi **§4.2 F-PAY-SI-CEILING-01** sau merge + GTCG · persist BH tĩnh một lần trên phiếu (**FR-UC-BP-PAY-05**). |
| **Nghiệp vụ xử lý** | **Normative order (cluster lock — reconcile PAY-01/02/03/04/05):** (1) Scope + period guards. (2) **`loadPayrollEligibility`** → **`412`** **`HRM-PAY-ATT-412`** (**PAY01QC1**). (3) **F-PAY-ATT-CLOSED-01** per employee. (4) **F-PAY-CB-READ-01** including PAY-03 GTCG bag slice (**PAY03QC1**). (5) **F-PAY-RD-APPLY-01** if in pipeline. (6) **F-PAY-SPLIT-01** detect/segment/eval/merge (**PAY04QC1**) → consolidated gross. (7) **F-PAY-GTCG-01** resolve + **PERSIST-GTCG** once on header (**PAY03QC1** §4.4 step 8). (8) **§4.2 F-PAY-SI-CEILING-01** (**this seat GAP**). (9) Published formula resolve → **`HRM-PAY-FORMULA-412`** if invalid (**PAY02QC1**). (10) **gd1_eval_v1** / component SRC depth (**PAY-02** · progressive TNCN **PAY-06 HOLD**). (11) **Body guard (GAP):** reject `si_employee_amount`, `si_employer_amount`, `si_*`, `ceiling_*`, `insurance_base_*`, `manual_si_*` on process DTO → **`403`** **`HRM-PAY-SI-403`** (**O11**) · also reject GTCG override fields → **`HRM-PAY-GTCG-403`** (**PAY03**). **FORBIDDEN:** SI step before GTCG persist; SI per segment; process 2xx with 0% BH when CFG missing; wipe PAY01–04 seals. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-05** Diễn biến **#1–#2** · **Thành công** · **AC-PAY-05-PROCESS-ORDER** · **AC-PAY-05-DENY-MANUAL** · regression **J-HRM-PAY-03-*** · **J-HRM-PAY-04-05/06/08** · **J-HRM-PAY-01-04** · **J-HRM-PAY-02-05** |
| **Request → DB** | Read ATT + CFG + enrollment + merged payslip; write **`payroll_payslips`** (+ **`si_*`** §6.1) · lines |
| **Response** | **202** `{ period_id, payslip_count?, preview_totals?, warnings[], employees?: [{ employee_id, merged_insurance_base_vnd?, ceiling_amount_vnd?, si_employee_amount_vnd?, si_employer_amount_vnd?, … }] }` · **`HRM-PAY-202`** |
| **Lỗi** | **`HRM-PAY-ATT-412`** · **`HRM-PAY-FORMULA-412`** · **`HRM-SET-SI-412-MISSING`** · **`HRM-PAY-SI-403`** · **`HRM-PAY-GTCG-403/412`** · **`HRM-PAY-SPLIT-409`** · **`HRM-SCOPE-409`** |

### 4.5 F-PAY-PAYSLIP-01 — Đọc phiếu + SI/ceiling display-ready (**RETAIN partial** · **GAP expand**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/payroll/payslips`** · **`GET /api/hrm/payroll/payslips/:payslipId`** |
| **Paper alias** | `GET /api/hrm/pay/payslips/{id}` |
| **Mục đích** | C&B xem preview với **mức đóng BH** và **trần** **read-only** — BE SoT (**O12** · OS 28). |
| **Nghiệp vụ xử lý** | **RETAIN** list/get scope parity U19. **EXPAND:** map **`consolidatedInsuranceBaseVnd`** (from last process snapshot or stored metadata) · **`ceilingAmountVnd`** (applied cap from CFG at process — **read-only** · **cấm** editable grid column) · **`siEmployeeAmountVnd`** · **`siEmployerAmountVnd`** from **`payroll_payslips.si_*`** when cols present else from aggregated **`SI*`/`BH*`** lines (**O8**). Include PAY-03 fields when present (**`dependentsCount`**, **`gtgcAmountVnd`** — peer). **FORBIDDEN:** PATCH payslip to set SI/ceiling; FE recompute trần/net BH. |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-05** Thành công · **FR-UC-BP-PAY-08** peer · **AC-PAY-05-DISPLAY** · **J-HRM-PAY-05-03** · **J-HRM-PAY-05-06** |
| **Request → DB** | Read **`payroll_payslips`** · **`payroll_payslip_lines`** |
| **Response** | **PayslipDto** + §5 fields · **`HRM-PAY-200`** |
| **Lỗi** | **`HRM-SCOPE-409`** · **404** OOS |

### 4.6 F-CORE-SI-01..03 — Enrollment peer (**must_keep RETAIN cite**)

| | |
|--|--|
| **METHOD / path** | **`/api/hrm/employee-insurances*`** · enrollment timeline APIs per CORE-10 cluster |
| **Mục đích** | Gate **participant** per `insurance_type_key` — **≠** store authoritative %/ceiling on enrollment row (**O2** · DATA_OWNERSHIP §9.6). |
| **Nghiệp vụ xử lý** | **RETAIN** CORE-10 sealed behavior · PAY process **read-only** gate in **§4.2 S2** · **`hrm_insurance_rate_period`** append links `pay_rate_cfg_id` soft — **cấm** PAY enrollment CRUD duplicate. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-10** · **AC-PAY-05-ENROLL-CITE** |
| **Cluster lock** | Enrollment CRUD DONE **≠** FR-PAY-05 DONE |

### 4.7 F-PAY-SPLIT-01 — Peer PAY-04 (**must_keep RETAIN**)

| | |
|--|--|
| **METHOD / path** | **Internal** — cite [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md) **§4.1** |
| **Mục đích** | Merge segment gross **before** SI ceiling on **consolidated** totals (**O7** · **O9**). |
| **Cluster lock** | **No drift** — SI consumer assumes **one** net payslip + **no** `si_*` on segment (**DV-14**) |

### 4.8 F-PAY-GTCG-01 — Peer PAY-03 (**must_keep BIND**)

| | |
|--|--|
| **METHOD / path** | **Internal** — cite [`PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md) **§4.2–4.4** |
| **Mục đích** | Static GTCG **once** on header **before** **§4.2 SI** (**SA §4.2** · **AC-PAY-05-GTCG-CHAIN**). |
| **Cluster lock** | Regression **J-HRM-PAY-03-*** when PAY-05 Dev touches process order |

### 4.9 HRM-SET-SI-412-MISSING — Thiếu CFG BH active (**must_keep RETAIN**)

| | |
|--|--|
| **METHOD / path** | Emitted from **§4.2 S3 PICK-RATE** · **§4.3 pickActiveRateForPeriod** |
| **Mục đích** | Fail-closed khi không có tỷ lệ/trần hiệu lực — **cấm** 0% im lặng UAT (**O6**). |
| **Nghiệp vụ xử lý** | When zero pickable rows for `insurance_type_key` at `period_end` → **412** before writing `si_*` · body includes `company_id`, `insurance_type_key`, `period_end` (support). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-05** Diễn biến **#2** (fail) · **AC-PAY-05-412** · **J-HRM-PAY-05-05** |
| **Response** | **412** `{ code: 'HRM-SET-SI-412-MISSING', message }` |

### 4.10 HRM-PAY-SI-403 — Cấm override BH/trần trên payroll (**GAP**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/payroll/periods/:periodId/process`** · any **`PATCH`** payslip/period mutate accepting override fields |
| **Mục đích** | **DENY manual overrides** — trần và `si_*` chỉ từ process + CFG (**O11** · SRS cấm nhập tay trên lưới kỳ). |
| **Nghiệp vụ xử lý** | Reject body/query containing: `si_employee_amount`, `si_employer_amount`, `si_*`, `ceiling_amount`, `ceiling_*`, `insurance_base_*`, `contribution_base_*`, `manual_si`, `override_si` · stable `code: HRM-PAY-SI-403` · VI `message` · **no** partial apply · **also** enforce peer **`HRM-PAY-GTCG-403`** on GTCG fields (**PAY03**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-PAY-05** (cấm nhập tay) · **AC-PAY-05-DENY-MANUAL** · **J-HRM-PAY-05-03** |
| **Response** | **403** `{ code: 'HRM-PAY-SI-403', message }` |

### 4.11 HRM-PAY-SPLIT-409 — Peer PAY-04 (**must_keep RETAIN**)

| | |
|--|--|
| **METHOD / path** | Emitted from split **MERGE** / static detector — cite PAY-04 API-01 **§4.7** |
| **Mục đích** | **Bind PAY-05** — cấm static SI/GTCG **kép** khi split-month (**O9** · **AC-PAY-05-SPLIT-409**). |
| **Cluster lock** | Prefixes incl. **GTCG** + **SI_/BH_/BHXH** — PAY-05 **must not** regress detector |

### 4.12 DENY — Payroll-owned rate master CRUD (**normative reject**)

| | |
|--|--|
| **METHOD / path** | **Any** `POST/PUT/PATCH /api/hrm/payroll/**/insurance-rate*` · second rate table API |
| **Mục đích** | **ONE** SoT **`pay_insurance_rate_cfg`** via Settings only (**O1**). |
| **Nghiệp vụ xử lý** | **Do not implement** GĐ1 · if discovered → remove or **410** pointer to **F-SET-SI-01..03**. |

### 4.13 PAY-06 / PAY-07 — (**HOLD footers**)

| | |
|--|--|
| **Mục đích** | Full «chạy kỳ» orchestration depth · **`tax_amount`** header · progressive TNCN = **PAY-06** · termination SI cutoff = **PAY-07** — seat này = **SI ceiling consumer only** (**O17–O18**). |
| **Tham chiếu** | **AC-PAY-05-HOLD-PAY06** |

---

## 5. Display-ready DTO lock (FE / QA)

### 5.1 Process employee payload (optional expand)

| Field | Type | Source | FE rule |
|-------|------|--------|---------|
| `mergedInsuranceBaseVnd` | money | **§4.2 S1** | **read-only** |
| `ceilingAmountVnd` | money | CFG applied cap (min result) | **read-only** · **cấm** grid edit |
| `siEmployeeAmountVnd` | money | **§4.2 S6** | **read-only** |
| `siEmployerAmountVnd` | money | **§4.2 S6** | **read-only** |
| `rateCfgSnapshotId` | uuid? | optional HOLD | audit display |

### 5.2 PayslipDto SI fields

| Field | Type | DB / source | FE rule |
|-------|------|-------------|---------|
| `consolidatedInsuranceBaseVnd` | money | process metadata / last run | **read-only** |
| `ceilingAmountVnd` | money | CFG at process (applied) | **read-only** · **AC-PAY-05-DENY-MANUAL** |
| `siEmployeeAmountVnd` | money | `payroll_payslips.si_employee_amount` or SI lines | **read-only** · vi-VN format |
| `siEmployerAmountVnd` | money | `payroll_payslips.si_employer_amount` or SI lines | **read-only** |
| **FORBIDDEN** | — | — | Editable ceiling column on period grid · FE cap math |

### 5.3 Error banners (VI)

| Code | HTTP | When |
|------|------|------|
| **`HRM-SET-SI-412-MISSING`** | 412 | No active CFG for type+period |
| **`HRM-PAY-SI-403`** | 403 | Manual `si_*` / `ceiling_*` override |
| **`HRM-PAY-SPLIT-409`** | 409 | Double static SI/GTCG on split |
| **`HRM-PAY-GTCG-403/412`** | 403/412 | Peer PAY-03 chain break |
| **`HRM-PAY-ATT-412`** | 412 | Before SI side-effects |

---

## 6. Scope parity (U19)

| Surface | Rule |
|---------|------|
| `POST …/process` | Same period `company_id` + OU expansion as period list/get |
| `GET …/payslips` / `:id` | **`resolveHrmListScope`** — list row ⇒ get-by-id SI fields in scope (**J-HRM-PAY-05-06** L2.5) |
| Settings CFG | Existing insurance-rate-cfg scope |
| Internal enrollment read | `employee_id` in period batch scope |

---

## 7. Traceability matrix (API → AC → J-*)

| API § | AC | Journey |
|-------|-----|---------|
| §4.1 F-SET-SI | AC-PAY-05-CFG-SOT | J-05-01 (cite RETAIN) |
| §4.2 BASE/CEILING | AC-PAY-05-BASE · CEILING · MID | J-05-02 · J-05-04 |
| §4.2 MULTI/COMPUTE | AC-PAY-05-MULTI · HEADER | J-05-02 · J-05-03 |
| §4.4 PROCESS-ORDER | AC-PAY-05-PROCESS-ORDER · GTCG-CHAIN | J-05-02 · regression J-03-* |
| §4.10 SI-403 | AC-PAY-05-DENY-MANUAL | J-05-03 |
| §4.9 412 | AC-PAY-05-412 | J-05-05 |
| §4.11 SPLIT-409 | AC-PAY-05-SPLIT-409 | J-05-05 · J-PAY-04-05/06/08 |
| §4.5 payslip | AC-PAY-05-DISPLAY | J-05-06 |
| §4.12 DENY payroll rate | AC-PAY-05-CFG-SOT | — |
| Footer | AC-PAY-05-H · MK-PEERS | J-05-08 · regression |

---

## 8. RETAIN vs GAP vs HOLD summary

| F-id / residual | Verdict | Owner |
|-----------------|---------|-------|
| F-SET-SI-01..03 | **must_keep RETAIN** | settings regression |
| pickActiveRateForPeriod | **must_keep RETAIN** | settings service |
| HRM-SET-SI-412-MISSING | **must_keep RETAIN** | **dev-be** bind in process |
| F-CORE-SI enrollment | **must_keep RETAIN cite** | CORE-10 |
| F-PAY-SPLIT-01 + 409 | **must_keep RETAIN** | PAY-04 |
| F-PAY-GTCG-01 + 403/412 | **must_keep BIND** | PAY-03 |
| F-PAY-ATT-CLOSED + ATT-412 | **must_keep RETAIN** | PAY-01 |
| F-PAY-FORMULA-412 + gd1_eval | **must_keep RETAIN** | PAY-02 |
| F-PAY-SI-CEILING-01 | **GAP EXPAND** | **dev-be BE-01** |
| F-PAY-PROCESS-01 SI step | **GAP EXPAND** | **dev-be** |
| `payroll_payslips.si_*` cols | **GAP** migrate | **dev-be** after DATA §6.1 |
| HRM-PAY-SI-403 | **GAP** | **dev-be** + **qa** |
| F-PAY-PAYSLIP-01 SI fields | **GAP** | **dev-be** + **dev-fe** |
| Payroll duplicate rate API | **DENY** | — |
| PAY-06 tax header / run depth | **HOLD** | PAY-06 |
| PAY-07 termination SI | **HOLD** | PAY-07 |
| `att_leave_hold` | **DENY invent** | — |

---

## 9. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API-01 **CONFIRMED EXPAND + GAP MAP** for UC-BP-PAY-05: full **F.1** per §4 — **RETAIN** **F-SET-SI-01..03** + **`pickActiveRateForPeriod`** + **`HRM-SET-SI-412-MISSING`**; logical **F-PAY-SI-CEILING-01** inside **F-PAY-PROCESS-01** **after** **F-PAY-SPLIT-01** merge + **F-PAY-GTCG-01** persist (**§4.2 order**): merged **`is_insurance_base`** base · `min(base, ceiling_amount)` **once** · `si_*` header once · **`HRM-PAY-SI-403`** deny manual `si_*`/`ceiling_*`; **F-PAY-PAYSLIP-01** display-ready §5; **must_keep** **PAY01QC1** + **PAY02QC1** + **PAY03QC1** + **PAY04QC1** + **HRM-PAY-SPLIT-409** / **DV-14**; docs-only · **unlock dev-be** migrate DATA §6.1 + implementation · **≠ PAY-05 / payroll_e2e / PAY UAT DONE** · **`payroll_e2e_ready=false`** · **C-SLICE**. |
| **next_owner** | **pm** → **dev-be** `PO-HRM-MVP-GD1-PAY-05-CLUSTER-BE-01` |
| **ack_status** | **PASS_TO_PM CONFIRMED EXPAND + GAP MAP** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md` |
| **residual** | BE SI ceiling service + migrate `si_*` + 403/412 bind + process order · FE read-only · QA **J-HRM-PAY-05-*** + regression PAY-03/04 · QC GWC · PAY-06/07 depth |

### next_dispatch_prompt (copy-ready — dev-be BE-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-05-CLUSTER-BE-01
role: dev-be
lane: execution · UC-BP-PAY-05 · FR-UC-BP-PAY-05 · BR-BP-SPL-02 · REQ_L_004
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-41 seat #46)
depends_on: API-01 CONFIRMED EXPAND+GAP @ docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md · DATA-01 ADD stamp payroll_payslips.si_* §6.1 · BA O1–O18 · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + PAY03QC1-MSMDDGWC1 + PAY04QC1-MSMCR4GWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P + ATT peer chain
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md (§4.2 F-PAY-SI-CEILING-01 · §4.4 process order · §4.9–4.10 errors · §5 DTO)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01.md (§6.1 si_* · §5 formula · §11 errors)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-BA-01.md (AC-PAY-05-* · J-HRM-PAY-05-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md (§4.4 GTCG persist order — BIND before SI)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md (§4.1 merge · HRM-PAY-SPLIT-409)
  - apps/api/hrm-api/src/settings/insurance-rate-cfg.service.ts (pickActiveRateForPeriod RETAIN)
spec_ref: FR-UC-BP-PAY-05 Diễn biến #1–#2 + Thành công · API-01 §4.2 S1–S7 · AC-PAY-05-PROCESS-ORDER · AC-PAY-05-CEILING · AC-PAY-05-DENY-MANUAL · AC-PAY-05-GTCG-CHAIN
change_mode: ADD narrow · preserve_default · code_memory_required: true · code_memory_mode: APPEND
allowed_paths: apps/api/hrm-api/src/payroll/** (SI ceiling service · process step · body guard · payslip DTO) · ensureSchema/migrate DATA §6.1 · jest spec-mapped
forbidden_paths: POST /api/hrm/payroll/**/insurance-rate* (DENY second SoT) · si_* on split segment · per-segment min(base,ceiling) persist · invent att_leave_hold · merge hour buckets · manual PATCH si_/ceiling_ on payslip · wipe PAY01–04/ATT seals · honesty flip · claim PAY-05 DONE · U65 payroll seed
entry_criteria: API-01 + DATA-01 stamps PASS · hrm-api dev stack
exit_criteria:
  1) ensureSchema/migrate: payroll_payslips.si_employee_amount + si_employer_amount per DATA §6.1
  2) Implement F-PAY-SI-CEILING-01: merged is_insurance_base base · pickActiveRateForPeriod per type · min(base,ceiling) ONCE · aggregate si_* · persist header xor SI/BH lines once
  3) Process order: ATT-412 → closed → CB+GTCG → SPLIT merge → GTCG persist → SI ceiling → formula eval (PAY-03/04 order preserved)
  4) HRM-PAY-SI-403 on body si_/ceiling_ overrides; HRM-SET-SI-412-MISSING when no CFG; regression HRM-PAY-SPLIT-409 + GTCG chain unchanged
  5) GET payslip includes consolidatedInsuranceBaseVnd + ceilingAmountVnd + siEmployeeAmountVnd + siEmployerAmountVnd per API-01 §5.2
  6) U19 scope_parity payslip list=get
  7) jest: ceiling once (not per segment) · 403/412 · is_insurance_base sum · must_keep PAY-01/02/03/04 order tests green
  8) READY_FOR_QA evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-05-cluster-be-01.md · ack_status READY_FOR_QA · ≠ PAY-05 DONE · payroll_e2e_ready=false · C-SLICE
cấm: seed for U65 AC · payroll insurance-rate CRUD · reopen J-HRM-PAY-03-* / J-HRM-PAY-04-05/06/08 without regression bus
```

### next_dispatch_prompt (copy-ready — dev-fe FE-01 · after BE READY_FOR_QA)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-05-CLUSTER-FE-01
role: dev-fe
lane: execution · UC-BP-PAY-05 · FR-UC-BP-PAY-05
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-41 seat #46)
depends_on: dev-be PAY-05-BE-01 READY_FOR_QA with SI/ceiling contract @ API-01 §5
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md (§5 display-ready)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-BA-01.md (AC-PAY-05-DENY-MANUAL · AC-PAY-05-DISPLAY · J-HRM-PAY-05-03/06)
change_mode: FIX narrow · display-only · preserve_default
allowed_paths: apps/web/** payroll payslip preview/detail · hide editable ceiling/SI on period grid
forbidden_paths: FE SI/ceiling/base SoT · editable trần column on payroll grid · client-side min(base,ceiling)
exit_criteria: U65 J-HRM-PAY-05-03 (no manual edit) + J-05-06 (read-only vi-VN) · F5 · Network 2xx · evidence docs/qa/evidence/po-hrm-mvp-gd1-pay-05-cluster-fe-01.md · ≠ PAY-05 DONE
cấm: seed
```

---

## 10. Spec read ack (sa)

| Artifact | Cite |
|----------|------|
| SA-01 | Option A LOCKED · §4.2 GTCG chain · R-PAY-05-* |
| DATA-01 | §6.1 `si_*` · §6.2 RETAIN `ceiling_amount` · §5 formula · §11 errors |
| BA-01 | O1–O18 · AC-PAY-05-* · J-HRM-PAY-05-* |
| PAY-03 API-01 | F-PAY-GTCG-01 order · HRM-PAY-GTCG-403/412 |
| PAY-04 API-01 | F-PAY-SPLIT-01 · HRM-PAY-SPLIT-409 · DV-14 |
| PAY-01/02 API-01 | ATT-412 · FORMULA-412 · `is_insurance_base` |
| API_DESIGN paper | F-PAY-PROCESS-01 snapshot ceiling |
| CODE cite | F-SET-SI LIVE · pick 412 RETAIN · SI consumer **ABSENT** |

---

*End API-01 · CONFIRMED EXPAND + GAP MAP · unlock dev-be migrate + F-PAY-SI-CEILING-01 · ≠ PAY-05 DONE · payroll_e2e_ready=false · 2026-08-10*
