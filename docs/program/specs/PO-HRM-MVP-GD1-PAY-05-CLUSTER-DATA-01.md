# PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01 — Physical DB · STAMPED ADD si_* header · RETAIN pay_insurance_rate_cfg ceiling (Option A · ba-data)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-41 seat **#46**) |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** (stamped closable) — optional **`payroll_payslips.si_employee_amount`** / **`si_employer_amount`** per paper §5.6 (mirror PAY-03 `gtgc_amount` pattern) · **RETAIN LIVE** **`public.pay_insurance_rate_cfg`** incl. **`ceiling_amount`** · **RETAIN** CORE peer **`employee_insurances`** + **`hrm_insurance_rate_period`** (enrollment ≠ rate master) · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · peer ATT chain · **NO** second payroll rate master table · **NO** `si_*` on split segment (**DV-14**) · **NO** invent `att_leave_hold` · **NO** merge sick/compensatory/carry→annual on PAY reads · **BIND** PAY-03 GTCG static chain (SA §4.2) · **NO CODE** `apps/**` · **no seed** · **no migrate** governance seat |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED ADD stamp** — header `si_employee_amount` / `si_employer_amount` **closable** (ABSENT LIVE) · **`pay_insurance_rate_cfg.ceiling_amount`** **HOLD RETAIN** LIVE · segment **re-assert FORBIDS** `si_*` (**DV-14**) · paper `tax_amount` header remains **HOLD waiver** (PAY-06) · unlock **sa** `PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01` · dev-be/FE **HOLD** until API stamp · **`payroll_e2e_ready=false`** · **≠ PAY-05 / PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-05` · `FR-UC-BP-PAY-05` · **BR-BP-SPL-02** · **REQ_L_003** · **REQ_L_004** · peer **FR-UC-BP-PAY-03** (**F-PAY-GTCG-01** · static plane) · peer **FR-UC-BP-PAY-04** (**F-PAY-SPLIT-01** · **DV-14**) · peer **FR-UC-BP-PAY-02** (`is_insurance_base`) · peer **FR-UC-BP-CORE-10** (**F-CORE-SI-01..03**) |
| **depends_on** | SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01.md) · peer DATA [`PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01.md) (gtgc header stamp · static order) · [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md) (**DV-14** · segment forbid static) · [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md) (enrollment cite) · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§5.4** `pay_insurance_rate_cfg` · **§5.6** `pay_payslip.si_employee_amount` / `si_employer_amount` · **§5.8** + **DV-14** · **DV-13** |
| **ref_code_cite** | **read-only cite (2026-08-10):** `insurance-rate-cfg.service.ts` **`pay_insurance_rate_cfg`** LIVE incl. **`ceiling_amount`** · `pickActiveRateForPeriod` → **`HRM-SET-SI-412-MISSING`** · **`payroll_payslips`** ensureSchema **without** `si_*` cols · PAY process **SI ceiling consumer ABSENT** · **`payroll_payslip_split_segments`** PAY-04 stamp · **no** `si_*` on segment DDL |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** DDL stamp alone = PAY-05 DONE · **DENY** Settings SI CRUD LIVE = DONE · **DENY** PAY / ATT module UAT · **DENY** invent `att_leave_hold` · **DENY** merge buckets · **DENY** per-segment ceiling cols · **DENY** reopen sealed J-* without regression bus |
| **ack_status** | **PASS_TO_PM CONFIRMED ADD stamp** |

---

## 1. Verdict — **CONFIRMED ADD stamp** (SI header closable · CFG RETAIN · DV-14 re-assert)

| Decision | Stamp |
|----------|--------|
| **`pay_insurance_rate_cfg` (paper §5.4)** | **HOLD RETAIN LIVE** — `employee_rate_pct` · `employer_rate_pct` · **`ceiling_amount`** · effective-dated · **`pickActiveRateForPeriod`** · **cấm** payroll-owned duplicate rate master |
| **Enrollment peer (CORE-10)** | **HOLD RETAIN** — **`employee_insurances`** gates participation · **`hrm_insurance_rate_period`** append links **`pay_rate_cfg_id`** soft → CFG · **≠** rewrite % on enrollment row |
| **`payroll_payslips.si_employee_amount` / `si_employer_amount`** | **ADD stamp closable** — paper §5.6 · **ABSENT** LIVE · `NUMERIC(15,2) NULL` each · writer = PAY process only (**F-PAY-SI-CEILING-01**) · **cấm** payroll API body override (**O11** SA) |
| **Header vs line (O8 SA)** | **Rule:** persist SI static **once** — **`si_*` header** **xor** aggregated **`SI*`/`BH*`** deduction lines on `payroll_payslip_lines` · **cấm** duplicate same amounts on both · QA inspect |
| **Insurance base (O3)** | **App resolver** — sum **`is_insurance_base`** components on **merged** period gross (post-**F-PAY-SPLIT-01**) · **not** a dedicated payslip column GĐ1 |
| **Ceiling math (O4)** | `contribution_base_vnd = min(merged_insurance_base_vnd, ceiling_amount)` **once** per `insurance_type_key` per NV per period · **cấm** `min` per segment then sum |
| **Split-month (O9 · DV-14)** | **must_keep PAY04** — **0** `si_employee_amount` / `si_employer_amount` on **`payroll_payslip_split_segments`** · **`HRM-PAY-SPLIT-409`** if duplicate static SI |
| **GTCG chain (§4.2 SA)** | **BIND PAY03QC1** — order: merge segments → **F-PAY-GTCG-01** once → **F-PAY-SI-CEILING-01** once → formula/tax (**PAY-02** + **PAY-06** HOLD) |
| **`payroll_payslips.gtgc_amount`** | **RETAIN cite** PAY-03 ADD stamp · orthogonal to SI · same static plane |
| **Paper `tax_amount` header** | **HOLD waiver** — unchanged · **PAY-06** |
| **CFG seed path** | **Admin/settings** (`/settings/insurance-rate-cfg`) only · **cấm** U65 payroll seed |
| **Leave hold** | **DENY invent** **`att_leave_hold`** · **`pending_days`** only (**ATT09QC1**) |
| **Multi-bucket leave** | **DENY merge** compensatory / sick / carry_over → annual on PAY hour read |
| **This seat** | Docs only — **NO** `apps/**` · **NO** seed · **NO** migrate governance seat |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical GĐ1 LIVE / proposed | Action |
|-----------------|------------------------------|--------|
| `pay_insurance_rate_cfg` | **`public.pay_insurance_rate_cfg`** | **HOLD RETAIN** · incl. **`ceiling_amount`** |
| `hrm_insurance_rate_period` | **`public.hrm_insurance_rate_period`** (CORE-10) | **HOLD RETAIN** peer · soft `pay_rate_cfg_id` |
| `employee_insurances` | **`public.employee_insurances`** | **HOLD RETAIN** participation gate |
| `pay_payslip.si_employee_amount` | **`public.payroll_payslips.si_employee_amount`** | **ADD stamp** §6.1 |
| `pay_payslip.si_employer_amount` | **`public.payroll_payslips.si_employer_amount`** | **ADD stamp** §6.1 |
| `pay_payslip.gtgc_amount` | **`public.payroll_payslips.gtgc_amount`** | **RETAIN cite** PAY-03 §6.1 |
| `pay_payslip` grain | **`public.payroll_payslips`** + **`uq_payroll_payslip_period_employee`** | **HOLD RETAIN** (**DV-13**) |
| `pay_payslip_line` SI component | **`public.payroll_payslip_lines`** `component_code` ~ `SI*`/`BH*`/`BHXH*` | **HOLD RETAIN** · optional xor header |
| `pay_payslip_split_segment` | **`public.payroll_payslip_split_segments`** (PAY-04 stamp) | **RETAIN cite** · **no** `si_*` cols |
| Second rate master in PAY | — | **DENY** |
| Paper `att_leave_hold` | **`employee_leave_balances.pending_days`** | **DENY dual table** |

```text
  Settings LIVE (must_keep RETAIN): pay_insurance_rate_cfg
        employee_rate_pct · employer_rate_pct · ceiling_amount
        pickActiveRateForPeriod → HRM-SET-SI-412-MISSING (V-13)
        DENY: POST /payroll/insurance-rate CRUD · payroll duplicate table

  CORE-10 SEALED (must_keep RETAIN): employee_insurances + hrm_insurance_rate_period
        enrollment timeline ≠ rate master (DATA_OWNERSHIP §9.6)

  PAY-04 SEALED (must_keep PAY04QC1): payroll_payslip_split_segments
        time-varying only — FORBIDDEN si_* on segment (DV-14)

  PAY-03 SEALED (must_keep PAY03QC1): gtgc_amount header (ADD stamp)
        static GTCG once BEFORE SI ceiling step (SA §4.2)

  ┌──────── FR-UC-BP-PAY-05 DATA stamp ─────────────────────────────┐
  │  Merged insurance base (app — is_insurance_base on merged gross) │
  │  contribution_base = min(base, ceiling_amount) ONCE per type     │
  │                                                                  │
  │  payroll_payslips (RETAIN + ADD si_* §6.1)                        │
  │       si_employee_amount · si_employer_amount — process only      │
  │       FORBIDDEN: manual API override · segment si_* (DV-14)       │
  └──────────────────────────────────────────────────────────────────┘
        must_keep PAY01 closed bind · PAY02 formula · PAY04 merge-once · PAY03 GTCG chain
```

**Label lock:** Wave-41 PAY-05 GĐ1 DATA = **stamped closable** SI **header cols** + **RETAIN** LIVE **`pay_insurance_rate_cfg.ceiling_amount`** + **re-assert DV-14** — **not** F-PAY-SI-CEILING-01 runtime DONE · **not** claim Settings CRUD = PAY-05 DONE · **C-SLICE**.  
**Honesty lock:** `payroll_e2e_ready=false` · **≠ PAY-05 / FR-PAY-05 module UAT**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-05 / FR-UC-BP-PAY-05 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT**  
> must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT peer chain  
> SI header ADD stamp **necessary not sufficient** · ceiling consumer **ABSENT** until Dev after API stamp  
> **RETAIN** `pay_insurance_rate_cfg.ceiling_amount` · DENY second rate table · DENY per-segment cap cols · DENY manual ceiling on grid · BIND PAY-03 static order §4.2  
> DENY `att_leave_hold` · DENY merge buckets · no seed · no apps/**

---

## 3. AS-IS baseline (physical — read-only cite · 2026-08-10)

| Object | AS-IS LIVE | Gap (Wave-41 DATA) |
|--------|------------|---------------------|
| **`public.pay_insurance_rate_cfg`** | settings LIVE · **`ceiling_amount`** col | **HOLD RETAIN** · consumer **GAP** dev-be |
| **`public.hrm_insurance_rate_period`** | CORE-10 LIVE append | **HOLD RETAIN** peer |
| **`public.employee_insurances`** | CORE-10 LIVE | **HOLD RETAIN** gate |
| **`public.payroll_payslips`** | gross/deduction/net · **no** `si_*` | **ADD** §6.1 |
| **`public.payroll_payslip_split_segments`** | PAY-04 ADD stamp · **no** `si_*` | **must_keep DV-14** |
| **F-PAY-SI-CEILING-01 consumer** | **ABSENT** in process | **GAP** dev-be after API |
| **`payroll_insurance_rate_cfg`** (duplicate) | **ABSENT** | **DENY invent** |
| **`att_leave_hold`** | **ABSENT** | **DENY invent** |

---

## 4. HOLD / residual dispositions

### 4.1 Rate CFG — **HOLD RETAIN** (ONE master SoT)

| Physical / rule | Ruling |
|-----------------|--------|
| `pay_insurance_rate_cfg` columns | **HOLD RETAIN** — `id`, `company_id`, `insurance_type_key`, `employee_rate_pct`, `employer_rate_pct`, **`ceiling_amount`**, `effective_from`, `effective_to`, `status`, `archived_at`, audit |
| Mutate path | **Only** `/api/hrm/settings/insurance-rate-cfg*` · scope U19 |
| PAY read | **`pickActiveRateForPeriod(company_id, insurance_type_key, period_end)`** · **412** if no active row (**V-13** · **O6**) |
| Multi-type (**O5**) | BHXH/BHYT/BHTN each row · aggregate header `si_*` = sum of per-type computed amounts |
| Snapshot on payslip | Optional soft **`insurance_rate_cfg_snapshot_id`** or JSON snapshot — **HOLD** API-01 · not required for DATA closable §6.1 |

### 4.2 Enrollment — **HOLD RETAIN** (peer only)

| Physical / rule | Ruling |
|-----------------|--------|
| `employee_insurances` | Participant must be active for type at period · **≠** store % on row |
| `hrm_insurance_rate_period` | Append timeline · soft FK `pay_rate_cfg_id` → picked CFG at enroll event |
| **FAIL** | Payroll module owning enrollment CRUD duplicate |

### 4.3 Payslip header — partial waiver **lift** (SI only)

| Physical / rule | Ruling |
|-----------------|--------|
| `si_employee_amount` / `si_employer_amount` on `payroll_payslips` | **ADD stamp** §6.1 — supersedes PAY-03/04 HOLD **only for SI** cols |
| `gtgc_amount` | **RETAIN cite** PAY-03 §6.1 — unchanged this seat |
| `tax_amount` | **HOLD waiver** — PAY-06 |
| `ceiling_amount` on payslip | **DENY** — trần read from CFG at process time only · **AC-PAY-05-DENY-MANUAL** |
| Re-process | Overwrite `si_*` on period re-run · idempotent with merged base + CFG pick |

### 4.4 Split segment — **re-assert DV-14**

| Physical / rule | Ruling |
|-----------------|--------|
| `payroll_payslip_split_segments` allow-list | **RETAIN** PAY-04 §6.1 cols only |
| **Forbidden columns** | **No** `si_employee_amount` · **no** `si_employer_amount` · **no** `ceiling_amount` · **no** per-segment capped base |
| Per-segment cap then sum | **DENY** — **BR-BP-SPL-02 FAIL** |

### 4.5 Peer seals — **must_keep**

| Stamp | Ruling |
|-------|--------|
| **`PAY01QC1-MSMBGWC1`** | RETAIN closed-sheet · **412** before SI side-effects |
| **`PAY02QC1-MSMC4GWC1`** | RETAIN ATT-412 → FORMULA-412 · `is_insurance_base` catalog |
| **`PAY03QC1-MSMDDGWC1`** | RETAIN GTCG once · **BIND** process order before SI (**§4.2**) |
| **`PAY04QC1-MSMCR4GWC1`** | RETAIN merge · **DV-14** · **409** duplicate static |
| **ATT12/11/10/09/07/06/05b/CORE07** | RETAIN · DENY merge · DENY `att_leave_hold` |
| Reopen sealed J-* | **DENY** without regression bus |

### 4.6 Rejected ADD / DENY

| Object | Verdict |
|--------|---------|
| `payroll_insurance_rate_cfg` / second rate table | **DENY** — §5.4 ONE SoT |
| `si_*` on `payroll_payslip_split_segments` | **DENY** — **DV-14** |
| `ceiling_amount` column on payslip | **DENY** — CFG only |
| Manual grid override cols | **DENY** — **O11** |
| `att_leave_hold` | **DENY** |
| Per-segment `min(base, ceiling)` storage | **DENY** — Option B rejected |
| Claim CFG CRUD LIVE = PAY-05 DONE | **DENY** — honesty |

---

## 5. Validation matrix (data integrity)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-PAY-05-DATA-01** | Second payroll-owned rate master table | SA Option A | **FAIL** schema review |
| **VAL-PAY-05-DATA-02** | `si_*` column on split segment | **DV-14** | **FAIL** migration |
| **VAL-PAY-05-DATA-03** | Process with **0** active `pay_insurance_rate_cfg` for type+period | **V-13** · **O6** | **412** `HRM-SET-SI-412-MISSING` · **not** silent 0% |
| **VAL-PAY-05-DATA-04** | `ceiling_amount` NULL treated as unlimited vs zero | BA default | Document in API-01 · **not** silent wrong cap |
| **VAL-PAY-05-DATA-05** | `si_employee_amount` or `si_employer_amount` &lt; 0 | CHK §6.1 | **FAIL** |
| **VAL-PAY-05-DATA-06** | Cap applied per segment then summed | **BR-BP-SPL-02** | **FAIL** process/QA |
| **VAL-PAY-05-DATA-07** | Header `si_*` + line `SI*`/`BH*` same value duplicate | **O8** | **FAIL** QA / process guard |
| **VAL-PAY-05-DATA-08** | API body sets `si_*` / `ceiling_*` on payslip mutate | **O11** | **403** stable code |
| **VAL-PAY-05-DATA-09** | Double static SI split path | PAY-04 | **409** `HRM-PAY-SPLIT-409` |
| **VAL-PAY-05-DATA-10** | GTCG applied after SI or per segment | **§4.2** | **FAIL** ordering AC |
| **VAL-PAY-05-DATA-11** | Invent `att_leave_hold` | grep | **FAIL** |
| **VAL-PAY-05-DATA-12** | Claim DATA stamp = PAY-05 DONE | honesty | **FAIL** |
| **VAL-PAY-05-DATA-13** | Insurance base includes non-`is_insurance_base` component | **O3** | **FAIL** component audit |

Formula check (consumer — logical; API-01 names):

```text
merged_insurance_base_vnd = SUM(eligible component amounts on consolidated period gross post-split)

FOR EACH insurance_type_key WITH active enrollment AND active pay_insurance_rate_cfg at period_end:
  contribution_base_vnd = MIN(merged_insurance_base_vnd, cfg.ceiling_amount OR merged_base if NULL policy)
  type_employee_vnd = contribution_base_vnd * cfg.employee_rate_pct / 100
  type_employer_vnd = contribution_base_vnd * cfg.employer_rate_pct / 100

si_employee_amount = SUM(type_employee_vnd)
si_employer_amount = SUM(type_employer_vnd)
```

**Placement:** After **F-PAY-SPLIT-01** merge · after **F-PAY-GTCG-01** persist (**PAY03QC1**) · before progressive TNCN depth (**PAY-06** HOLD).

---

## 6. Stamped ADD (closable — not LIVE · no migrate this seat)

> **BA-data stamp (2026-08-10):** SA O1–O18 defaults + Option A — SI amounts on header **closable** (mirror PAY-03 `gtgc_amount`). **Closable YES** for both cols (ABSENT LIVE · nullable backfill). **No new CFG table** — ceiling stays on **RETAIN** `pay_insurance_rate_cfg`. **Dev-be** migrates only after **sa API-01** F.1 + program waiver. **Governance seat:** stamp only.

### 6.1 Payslip header — **`si_employee_amount` / `si_employer_amount`** (**R-PAY-05-HEADER**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `si_employee_amount` | `NUMERIC(15,2)` | YES | NULL | BH phần NV — **once** per period after cap on merged base |
| `si_employer_amount` | `NUMERIC(15,2)` | YES | NULL | BH phần DN — **once** per period after cap |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — columns **ABSENT** · `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` |
| Closable **this** seat? | **NO migrate** — stamp only |
| XOR line rule | If header `si_*` set, **cấm** duplicate static `SI*`/`BH*` lines same payslip re-run without void policy |
| **FAIL** | Manual PATCH from client · segment cols · per-segment cap storage |
| Unlock | **AC-PAY-05-HEADER** · **J-HRM-PAY-05-02** · lifts PAY-03/04 waiver **for SI cols only** |

**Paper alias:** logical `pay_payslip.si_employee_amount` / `si_employer_amount` → physical **`payroll_payslips.si_employee_amount`** / **`si_employer_amount`**.

### 6.2 RETAIN — **`pay_insurance_rate_cfg.ceiling_amount`** (no ADD)

| Object | Ruling |
|--------|--------|
| **`ceiling_amount`** on CFG | **HOLD RETAIN LIVE** — authoritative trần for **R-PAY-05-CEILING** |
| New payroll copy of ceiling | **DENY** |
| Pick at process | Active row per `insurance_type_key` at **`payroll_periods.end_date`** (alias period end) |

### 6.3 HOLD waiver — unchanged cols + runtime

| Residual | Waiver | Owner |
|----------|--------|-------|
| **`tax_amount` on payslip** | **HOLD** | **PAY-06** |
| **R-PAY-05-BASE/COMPUTE/MID-MONTH** | Runtime **ABSENT** | **dev-be** after API |
| **Full period orchestration** | **HOLD** | **PAY-06** |
| **Termination SI cutoff** | **HOLD** | **PAY-07** |
| **CFG snapshot id on payslip** | Optional · **HOLD** API-01 | **sa** API-01 |

---

## 7. Lifecycle

### 7.1 `pay_insurance_rate_cfg` (RETAIN)

| State | Meaning | Transition |
|-------|---------|------------|
| **active** | Pickable at period end | admin publish · supersede |
| **retired** | Historical | read-only pick excluded |

### 7.2 `payroll_payslips.si_*` (ADD)

| State | Meaning | Transition |
|-------|---------|------------|
| **null** | Pre-process / legacy | process writes computed |
| **set** | Post-process snapshot | re-process overwrites |

---

## 8. scope_parity (U19)

| Surface | Resolver | Parity rule |
|---------|----------|-------------|
| Settings CFG list/get | `company_id` scope | Same as existing insurance-rate-cfg |
| Payslip list/get `si_*` | Same as PAY periods/payslips | **J-HRM-PAY-05-06** list→detail |
| Segment expand | No `si_*` fields | **DV-14** inspect |

Trace: **J-HRM-PAY-05-01..08** (DRAFT mint ba-process) · regression **J-HRM-PAY-03-*** · **J-HRM-PAY-04-05/06/08**.

---

## 9. Traceability (SRS → DB → API → FE → test)

| BR/AC | Physical | API (GAP/RETAIN) | FE / J-* | Evidence |
|-------|----------|------------------|----------|----------|
| **O1** CFG SoT | `pay_insurance_rate_cfg` §5.4 | **F-SET-SI-01..03 RETAIN** | settings admin | schema grep |
| **O2** Enrollment | `employee_insurances` + `hrm_insurance_rate_period` | **F-CORE-SI RETAIN** | CORE paths | CORE10QC1 |
| **O3** BASE | merged components | **F-PAY-SI-CEILING-01 GAP** | **J-05-01** | `is_insurance_base` |
| **O4** CEILING | `ceiling_amount` CFG | pick + min() GAP | **J-05-02** | BR-BP-SPL-02 |
| **O5** MULTI | per-type CFG rows | aggregate header GAP | **J-05-03** | |
| **O6** MISSING | CFG pick | **HRM-SET-SI-412 RETAIN** | | **412** |
| **O8** HEADER | `si_*` §6.1 | process writer GAP | **J-05-02** | F5 payslip |
| **O9** SPLIT | **no** segment `si_*` | **HRM-PAY-SPLIT-409 RETAIN** | **J-05-05** | PAY04QC1 |
| **O10** MID-MONTH | merged base + days | GAP dev-be | **J-05-04** | SRS special |
| **O11** DENY manual | header read-only | **403 GAP** | **J-05-03** | |
| **O13** GTCG chain | gtgc + si order | **F-PAY-GTCG-01 BIND** | regression **J-03** | PAY03QC1 |
| Diễn biến **#1–#2** | CFG + header | **F-PAY-PROCESS-01 GAP** | **J-05-01..02** | U65 |

---

## 10. Data interaction matrix (PAY-05 slice)

| Entity | Create | Read | Update | Delete/Archive | PAY-05 seat |
|--------|--------|------|--------|----------------|-------------|
| `pay_insurance_rate_cfg` | admin publish | process pick | supersede | `archived_at` | **RETAIN** |
| `employee_insurances` | CORE | process gate | CORE | policy | **RETAIN cite** |
| `hrm_insurance_rate_period` | CORE append | audit | — | — | **RETAIN cite** |
| `payroll_payslips` | process upsert | list/get | process sets `si_*` | policy | **ADD col stamp** |
| `payroll_payslip_lines` | eval | get | re-process | — | **RETAIN** · optional SI lines |
| `payroll_payslip_split_segments` | PAY-04 | get segments | — | — | **DV-14** no si_* |
| `pay_gtgc_statutory_cfg` | PAY-03 | GTCG pick | — | — | **RETAIN cite** peer |
| Payroll duplicate rate table | — | — | — | — | **DENY** |
| `att_leave_hold` | — | — | — | — | **DENY** |

---

## 11. Deterministic error mapping (data-related)

| Code / condition | When | HTTP | Data note |
|------------------|------|------|-----------|
| **`HRM-SET-SI-412-MISSING`** | No active CFG for type+period | **412** | **VAL-PAY-05-DATA-03** · **RETAIN** |
| **`HRM-PAY-SPLIT-409`** (peer) | Double static SI/GTCG | **409** | segment/header guard |
| **`HRM-PAY-SI-403`** (proposed) | Body override `si_*` / `ceiling_*` | **403** | **AC-PAY-05-DENY-MANUAL** |
| **`HRM-PAY-ATT-412`** (peer) | No closed bind | **412** | before SI write |
| **`HRM-PAY-GTCG-412/403`** (peer) | GTCG chain break | **412/403** | **PAY03QC1** |
| Per-segment cap persisted | segment row | — | **process defect** |
| Invent **`att_leave_hold`** | migration | — | **process defect** |

---

## 12. Closability analysis (exit gate)

| Candidate ADD | Closable? | Verdict |
|---------------|-----------|---------|
| **`payroll_payslips.si_employee_amount` / `si_employer_amount`** | **YES** — cols ABSENT · nullable | **ADD stamp** §6.1 |
| **`pay_insurance_rate_cfg.ceiling_amount`** | **LIVE RETAIN** | **no ADD** §6.2 |
| Second payroll rate table | **NO** | **DENY** |
| `si_*` on segment | **NO** — **DV-14** | **DENY** |
| `ceiling_amount` on payslip | **NO** | **DENY** |
| `att_leave_hold` | **NO** | **DENY** |
| `tax_amount` header now | **YES** technically · **not in scope** | **HOLD waiver** PAY-06 |

---

## 13. Unlock next

| Field | Value |
|-------|--------|
| **next_owner** | **sa** (API-01 cluster) · **pm** orchestration · **parallel** **ba-process** BA-01 AC if not started |
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01` |
| **Mission** | F.1 deepen **F-PAY-SI-CEILING-01** inside **F-PAY-PROCESS-01** · cite §6.1 physical names · **BIND** **F-PAY-GTCG-01** order §4.2 · **RETAIN** **F-SET-SI-01..03** · display-ready ceiling/base/si fields · **must_keep** **PAY01QC1** / **PAY02QC1** / **PAY03QC1** / **PAY04QC1** · **DENY** manual override · **DENY** claim PAY-05 module DONE |

---

## 14. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §15 |
| **next_owner** | `sa` · `pm` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01.md` |

---

## 15. completion_report

**Closed:** ba-data **CONFIRMED ADD stamp** for UC-BP-PAY-05 / FR-UC-BP-PAY-05 / BR-BP-SPL-02 against SA Option A — **stamped closable** **`payroll_payslips.si_employee_amount`** / **`si_employer_amount`** (paper §5.6 · mirror PAY-03 `gtgc_amount`); **HOLD RETAIN LIVE** **`public.pay_insurance_rate_cfg`** incl. **`ceiling_amount`** (§5.4 · **cấm** duplicate payroll rate master); **HOLD RETAIN** CORE enrollment peer **`employee_insurances`** + **`hrm_insurance_rate_period`**; **re-assert** **`payroll_payslip_split_segments`** **FORBIDS** `si_*` (**DV-14**); **BIND** PAY-03 GTCG static chain (merge → GTCG once → SI ceiling once); **O8** header xor SI/BH lines; **HOLD waiver** paper `tax_amount`; **must_keep** **`PAY01QC1-MSMBGWC1`** + **`PAY02QC1-MSMC4GWC1`** + **`PAY03QC1-MSMDDGWC1`** + **`PAY04QC1-MSMCR4GWC1`** + **`ATT12QC1-MSMAIGWC1`** + **`ATT11QC1-MSLXTH9P`** + ATT peer chain; validation + lifecycle + scope parity + traceability; **≠ PAY-05 DONE** · **≠ payroll_e2e_ready** · **C-SLICE**; docs-only · no `apps/**` · no seed · no migrate this seat.

**Residual open (not DATA migrate this seat):** sa **API-01** F.1 · ba-process **BA-01** O1–O18 AC + **J-HRM-PAY-05-*** DRAFT · dev-be consolidated base + ceiling + `si_*` persist + deny manual + 409 bind · dev-fe read-only SI/ceiling preview · qa **J-HRM-PAY-05-*** + regression PAY-03/04 · QC GWC C-SLICE · PAY-06 `tax_amount` header · optional CFG snapshot on payslip (API-01).

---

## 16. next_dispatch_prompt (copy-ready — sa API-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01
role: sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-41 seat #46)
lane: governance · F.1 deepen · UC-BP-PAY-05 · BR-BP-SPL-02
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-SA-01.md (§4.2 GTCG chain · R-PAY-05-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01.md (§6.1 si_* header · §6.2 RETAIN ceiling_amount · DV-14)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md (F-PAY-GTCG-01 BIND order)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md (HRM-PAY-SPLIT-409 · DV-14)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-PROCESS-01 · F-SET-SI-01..03 · F-PAY-SPLIT-01
entry_criteria: ba-data DATA-01 PASS_TO_PM CONFIRMED ADD stamp · must_keep PAY01QC1 + PAY02QC1 + PAY03QC1 + PAY04QC1 + ATT11/12 · payroll_e2e_ready=false · U65
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md
  - F.1 per surface: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (FR-UC-BP-PAY-05 Diễn biến #1–#2 + Thành công)
  - Logical F-PAY-SI-CEILING-01 inside F-PAY-PROCESS-01 after F-PAY-SPLIT-01 + F-PAY-GTCG-01 · RETAIN pickActiveRateForPeriod · HRM-SET-SI-412-MISSING · deny manual si_/ceiling_ · display-ready consolidated_insurance_base_vnd + si_* + ceiling read-only
  - ack_status PASS_TO_PM unlock dev-be
cấm: apps/** · second rate table · per-segment cap · honesty flip · reopen PAY seals · seed
```
