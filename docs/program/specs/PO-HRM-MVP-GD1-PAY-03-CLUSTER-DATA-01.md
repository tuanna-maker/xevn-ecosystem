# PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01 — Physical DB · STAMPED ADD gtgc_amount + statutory CFG · RETAIN employee_dependents ONE SoT (Option A · ba-data)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-40 seat **#45**) |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** (stamped closable) — **`payroll_payslips.gtgc_amount`** per paper §5.6 · **`public.pay_gtgc_statutory_cfg`** tenant statutory self/per-NPT VND · **RETAIN** LIVE **`public.employee_dependents`** ONE SoT (**F-CORE-DEP-01**) · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · peer ATT chain · **NO** second `payroll_dependents` / `hrm_pay_gtgc` · **NO** `gtgc_amount` on split segment (**DV-14**) · **NO** invent `att_leave_hold` · **NO** merge sick/compensatory/carry→annual on PAY reads · **NO CODE** `apps/**` · **no seed** · **no migrate** governance seat |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED ADD stamp** — header `gtgc_amount` **closable** (ABSENT LIVE) · statutory CFG table **closable** (ABSENT LIVE · mirror `pay_insurance_rate_cfg` pattern) · dependents **HOLD RETAIN** · paper `tax_amount` / `si_*` header cols remain **HOLD waiver** (PAY-05/06) · unlock **sa** `PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01` · dev-be/FE **HOLD** until API stamp · **`payroll_e2e_ready=false`** · **≠ PAY-03 / PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-03` · `FR-UC-BP-PAY-03` · **BR-BP-PAY-02** · **REQ_L_003** · peer **FR-UC-BP-CORE-01** (**F-CORE-DEP-01**) · **FR-UC-BP-PAY-04** (GTCG once · **DV-14**) · **FR-UC-BP-PAY-02** (`dependents_count` bag) |
| **depends_on** | BA-01 O1–O16 **CONFIRMED** · [`PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md) · peer DATA [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md) (**DV-14** · partial header waiver lift for GTCG only) · [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md) · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§3.3** `hrm_dependent` · **§5.4** `pay_insurance_rate_cfg` (CFG pattern cite) · **§5.6** `pay_payslip.gtgc_amount` · **§5.8** + **DV-14** |
| **ref_code_cite** | **read-only cite (2026-08-10):** `employee-dependents.service.ts` ensureSchema **`public.employee_dependents`** LIVE · `payroll.service.ts` ensureSchema **`payroll_payslips`** without `gtgc_amount` · `insurance-rate-cfg.service.ts` **`pay_insurance_rate_cfg`** LIVE · grep **`pay_gtgc_statutory_cfg`** **0** · split segment DDL **forbids** `gtgc_amount` (**PAY04**) |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** DDL stamp alone = PAY-03 DONE · **DENY** deps CRUD LIVE = DONE · **DENY** PAY / ATT module UAT · **DENY** invent `att_leave_hold` · **DENY** merge buckets · **DENY** reopen sealed J-* without regression bus |
| **ack_status** | **PASS_TO_PM CONFIRMED ADD stamp** |

---

## 1. Verdict — **CONFIRMED ADD stamp** (GTCG physical + CFG closable · deps RETAIN)

| Decision | Stamp |
|----------|--------|
| **F-CORE-DEP-01 ONE SoT** | **HOLD RETAIN** — **`public.employee_dependents`** only · paper **`hrm_dependent`** = alias · **cấm** `payroll_dependents` · `hrm_pay_gtgc` · PAY-owned NPT CRUD |
| **Eligibility read model** | **App resolver** (not duplicate table): count rows `archived_at IS NULL` · `is_tax_dependent = true` · window vs **`as_of = payroll_period.end_date`** (**O3** BA) |
| **`payroll_payslips.gtgc_amount`** | **ADD stamp closable** — paper §5.6 · **ABSENT** LIVE · `NUMERIC(15,2) NULL` · writer = PAY process only · **cấm** payroll API body override (**O10**) |
| **`pay_gtgc_statutory_cfg`** | **ADD stamp closable** — tenant/platform mức **bản thân** + **mỗi NPT** · effective-dated · **cấm** sole literals `11000000`/`4400000` in Nest without active row (**O5** · **AC-PAY-03-CFG**) |
| **Bag keys** | **`dependents_count`** · **`gtgc_amount_vnd`** — **process memory / response** · **not** required dedicated payslip columns GĐ1 (align **PAY-02** catalog) |
| **Header vs line (O8)** | **Rule:** persist GTCG static **once** — **`gtgc_amount` header** **xor** single **`GTCG*`** line on `payroll_payslip_lines` · **cấm** duplicate same amount on both · QA inspect |
| **Split-month (O9 · DV-14)** | **must_keep PAY04** — **0** `gtgc_amount` on **`payroll_payslip_split_segments`** · static merge **once** on header path · **`HRM-PAY-SPLIT-409`** if double |
| **Paper `tax_amount` / `si_*` header** | **HOLD waiver** — unchanged from PAY-04 DATA §6.2 · **PAY-05/06** seats |
| **CFG seed path** | **Admin/settings mutate** (like `pay_insurance_rate_cfg`) · **cấm** U65 payroll seed · **cấm** payroll process seed |
| **Leave hold** | **DENY invent** **`att_leave_hold`** · **`pending_days`** only (**ATT09QC1**) |
| **Multi-bucket leave** | **DENY merge** compensatory / sick / carry_over → annual on PAY hour read |
| **This seat** | Docs only — **NO** `apps/**` · **NO** seed · **NO** migrate governance seat |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical GĐ1 LIVE / proposed | Action |
|-----------------|------------------------------|--------|
| `hrm_dependent` | **`public.employee_dependents`** | **HOLD RETAIN** ONE SoT |
| `pay_payslip.gtgc_amount` | **`public.payroll_payslips.gtgc_amount`** | **ADD stamp** §6.1 |
| (paper implicit GTCG CFG) | **`public.pay_gtgc_statutory_cfg`** | **ADD stamp** §6.2 |
| `pay_payslip` grain | **`public.payroll_payslips`** + **`uq_payroll_payslip_period_employee`** | **HOLD RETAIN** (**DV-13**) |
| `pay_payslip_line` GTCG component | **`public.payroll_payslip_lines`** `component_code` ~ `GTCG*` | **HOLD RETAIN** · optional xor header |
| `pay_payslip_split_segment` | **`public.payroll_payslip_split_segments`** (PAY-04 stamp) | **RETAIN cite** · **no** `gtgc_amount` col |
| `pay_insurance_rate_cfg` (pattern) | **`public.pay_insurance_rate_cfg`** LIVE | **RETAIN cite** · ≠ GTCG SoT |
| Paper `att_leave_hold` | **`employee_leave_balances.pending_days`** | **DENY dual table** |
| Second NPT master | — | **DENY** |

```text
  CORE-01 SEALED (must_keep): F-CORE-DEP-01
  public.employee_dependents — ONE SoT (LIVE RETAIN)
        is_tax_dependent · effective_from/to · archived_at
        DENY: payroll_dependents · hrm_pay_gtgc · PAY CRUD duplicate
        │
        │ as-of read (resolver GAP — dev-be after API)
        ▼
  ┌──────── FR-UC-BP-PAY-03 DATA stamp ─────────────────────────────┐
  │  pay_gtgc_statutory_cfg (ADD §6.2 — pick row effective at as_of) │
  │       gtgc_self_amount + gtgc_per_dependent_amount               │
  │       DENY hardcode without row (AC-PAY-03-CFG)                  │
  │                                                                  │
  │  payroll_payslips (RETAIN + ADD gtgc_amount §6.1)                  │
  │       static GTCG once on header OR single GTCG* line (O8)        │
  │       FORBIDDEN: manual API override · segment gtgc (DV-14)      │
  └──────────────────────────────────────────────────────────────────┘
        must_keep PAY01 closed bind · PAY02 formula order · PAY04 merge-once
```

**Label lock:** Wave-40 PAY-03 GĐ1 DATA = **stamped closable** GTCG **header col** + **statutory CFG table** + **RETAIN** **`employee_dependents`** — **not** F-PAY-GTCG-01 runtime DONE · **not** full TNCN (**PAY-06**) · **C-SLICE**.  
**Honesty lock:** `payroll_e2e_ready=false` · **≠ PAY-03 / FR-PAY-03 module UAT**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-03 / FR-UC-BP-PAY-03 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT**  
> must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT peer chain  
> GTCG ADD stamp **necessary not sufficient** · resolver/bag/403 **ABSENT** until Dev after API stamp  
> **F-CORE-DEP-01 RETAIN** · DENY second deps table · DENY manual GTCG · DENY FE SoT · DENY segment GTCG · DENY `att_leave_hold` · DENY merge buckets  
> no seed · no apps/**

---

## 3. AS-IS baseline (physical — read-only cite · 2026-08-10)

| Object | AS-IS LIVE | Gap (Wave-40 DATA) |
|--------|------------|---------------------|
| **`public.employee_dependents`** | ensureSchema LIVE · F-CORE-DEP-01 | **HOLD RETAIN** · resolver **GAP** dev-be |
| **`public.payroll_payslips`** | gross/deduction/net · **no** `gtgc_amount` | **ADD** §6.1 |
| **`public.pay_gtgc_statutory_cfg`** | grep **0** | **ADD** §6.2 |
| **`public.pay_insurance_rate_cfg`** | settings LIVE | **RETAIN cite** · PAY-05 peer |
| **`public.payroll_payslip_split_segments`** | PAY-04 ADD stamp · **no** `gtgc_amount` | **must_keep DV-14** |
| **F-PAY-GTCG consumer / bag** | **ABSENT** in process | **GAP** dev-be after API |
| **`payroll_dependents`** | **ABSENT** | **DENY invent** |
| **`att_leave_hold`** | **ABSENT** | **DENY invent** |

---

## 4. HOLD / residual dispositions

### 4.1 Dependents — **HOLD RETAIN** (ONE SoT)

| Physical / rule | Ruling |
|-----------------|--------|
| `employee_dependents` columns | **HOLD RETAIN** — `id`, `employee_id`, `company_id`, `full_name`, `relation_code`, `date_of_birth`, `is_tax_dependent`, `effective_from`, `effective_to`, `archived_at`, audit |
| Mutate path | **Only** `/api/hrm/employees/:employeeId/dependents*` · scope U19 list=get parity |
| PAY read | Internal service read by `employee_id` + `company_id` · **no** parallel payroll dependents table |
| Age-cut mid-year (**O4**) | Data = `effective_to` on dep row · rule engine **GAP** dev-be |
| Welfare vs tax | `is_tax_dependent` **ALLOW** on row · GTCG amount **not** stored per dep row GĐ1 |

### 4.2 Payslip header — partial waiver **lift** (GTCG only)

| Physical / rule | Ruling |
|-----------------|--------|
| `gtgc_amount` on `payroll_payslips` | **ADD stamp** §6.1 — supersedes PAY-04 HOLD **only for GTCG** col |
| `tax_amount`, `si_employee_amount`, `si_employer_amount` | **HOLD waiver** — remain via `deduction_amount` + lines until PAY-05/06 DATA |
| `dependents_count` on payslip | **NOT ADD** GĐ1 — bag + API display only (**O6/O12**) |
| Re-process | Overwrite `gtgc_amount` on period re-run · idempotent with resolver |

### 4.3 Peer seals — **must_keep**

| Stamp | Ruling |
|-------|--------|
| **`PAY01QC1-MSMBGWC1`** | RETAIN closed-sheet · **412** before GTCG side-effects |
| **`PAY02QC1-MSMC4GWC1`** | RETAIN ATT-412 → FORMULA-412 before GTCG persist |
| **`PAY04QC1-MSMCR4GWC1`** | RETAIN static-once merge · **DV-14** · **409** duplicate static |
| **ATT12/11/10/09/07/06/05b/CORE07** | RETAIN · DENY merge · DENY `att_leave_hold` |
| Reopen sealed J-* | **DENY** without regression bus |

### 4.4 Rejected ADD / DENY

| Object | Verdict |
|--------|---------|
| `payroll_dependents` / `hrm_pay_gtgc` | **DENY** — REQ_L_003 · O1 |
| `gtgc_amount` on `payroll_payslip_split_segments` | **DENY** — **DV-14** |
| `att_leave_hold` | **DENY** |
| Store `gtgc_amount` on `employee_dependents` | **DENY** — amount from CFG + count |
| Platform seed via payroll `process` | **DENY** — U65 |
| Sole hardcode 11_000_000 / 4_400_000 in service | **DENY** — **AC-PAY-03-CFG** |

---

## 5. Validation matrix (data integrity)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-PAY-03-DATA-01** | Second table `payroll_dependents` | REQ_L_003 | **FAIL** schema review |
| **VAL-PAY-03-DATA-02** | `gtgc_amount` column on split segment | **DV-14** | **FAIL** migration |
| **VAL-PAY-03-DATA-03** | Process with **0** active `pay_gtgc_statutory_cfg` for `as_of` | **AC-PAY-03-CFG** | **412/422** stable code · **not** silent 0 without policy |
| **VAL-PAY-03-DATA-04** | Overlapping active CFG rows same `company_id` + date | UQ §6.2 | **FAIL** insert or pick deterministic |
| **VAL-PAY-03-DATA-05** | `gtgc_self_amount` or `gtgc_per_dependent_amount` &lt; 0 | CHK §6.2 | **FAIL** |
| **VAL-PAY-03-DATA-06** | Count includes archived / `is_tax_dependent=false` / out-of-window | **O2** | excluded from `dependents_count` |
| **VAL-PAY-03-DATA-07** | `as_of` ≠ period `end_date` without documented tenant override | **O3** GĐ1 | resolver uses **`end_date`** |
| **VAL-PAY-03-DATA-08** | Header `gtgc_amount` + line `GTCG*` same value duplicate | **O8** | **FAIL** QA / process guard |
| **VAL-PAY-03-DATA-09** | API body sets `gtgc_amount` on payslip mutate | **O10** | **403** `HRM-PAY-GTCG-403` |
| **VAL-PAY-03-DATA-10** | Double static GTCG split path | PAY-04 | **409** `HRM-PAY-SPLIT-409` |
| **VAL-PAY-03-DATA-11** | Invent `att_leave_hold` | grep | **FAIL** |
| **VAL-PAY-03-DATA-12** | Claim DATA stamp = PAY-03 DONE | honesty | **FAIL** |
| **VAL-PAY-03-DATA-13** | Dep `company_id` ≠ parent employee | CORE scope | **409** on write |

Formula check (resolver):

```text
eligible_count = COUNT(employee_dependents WHERE employee_id = :emp
  AND company_id = :co
  AND archived_at IS NULL
  AND is_tax_dependent = TRUE
  AND (effective_from IS NULL OR effective_from <= :as_of)
  AND (effective_to IS NULL OR effective_to >= :as_of))

gtgc_amount_vnd = cfg.gtgc_self_amount + eligible_count * cfg.gtgc_per_dependent_amount
```

`:as_of` = **`payroll_periods.end_date`** (physical `end_date` on LIVE periods table).

---

## 6. Stamped ADD (closable — not LIVE · no migrate this seat)

> **BA stamp (2026-08-10):** O5/O8 CONFIRMED — statutory amounts require **CFG row**; header persistence **closable** on existing payslip table. **Closable YES** for both ADDs (ABSENT LIVE · no legacy backfill required for null `gtgc_amount`). **Dev-be** migrates only after **sa API-01** F.1 + program waiver. **Governance seat:** stamp only.

### 6.1 Payslip header — **`payroll_payslips.gtgc_amount`** (**R-PAY-03-HEADER**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `gtgc_amount` | `NUMERIC(15,2)` | YES | NULL | Giảm trừ gia cảnh tĩnh tháng — **read** deps + CFG · **writer** PAY process only |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — column **ABSENT** · `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` |
| Closable **this** seat? | **NO migrate** — stamp only |
| XOR line rule | If `gtgc_amount` set, **cấm** second static `GTCG*` line same payslip re-run without void policy |
| **FAIL** | Manual PATCH from client · segment col · two static applications split-month |
| Unlock | **AC-PAY-03-HEADER** · **J-HRM-PAY-03-02** · lifts PAY-04 waiver **for GTCG col only** |

**Paper alias:** logical `pay_payslip.gtgc_amount` → physical **`payroll_payslips.gtgc_amount`**.

### 6.2 Statutory CFG — **`public.pay_gtgc_statutory_cfg`** (**R-PAY-03-AMOUNT** · **AC-PAY-03-CFG**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK |
| `tenant_id` | `TEXT` | NO | env default | Platform tenant |
| `company_id` | `TEXT` | NO | | Scope **U19** |
| `ou_id` | `TEXT` | YES | | Optional OU override (nullable = company-wide) |
| `regime_code` | `TEXT` | NO | `'VN_PIT_GTGC'` | Extensible · GĐ1 single regime |
| `gtgc_self_amount` | `NUMERIC(18,2)` | NO | | Mức giảm trừ **bản thân** (VND) |
| `gtgc_per_dependent_amount` | `NUMERIC(18,2)` | NO | | Mức **mỗi NPT** thuế hợp lệ (VND) |
| `currency` | `TEXT` | NO | `'VND'` | |
| `effective_from` | `DATE` | NO | | Inclusive |
| `effective_to` | `DATE` | YES | | Open-ended allowed |
| `status` | `TEXT` | NO | `'active'` | `draft` \| `active` \| `retired` |
| `version` | `INT` | NO | `1` | Monotonic per company+regime |
| `supersedes_id` | `UUID` | YES | | Optional lineage |
| `notes` | `TEXT` | YES | | |
| `archived_at` | `TIMESTAMPTZ` | YES | | Soft-delete |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | NO | `now()` | |
| `created_by` / `updated_by` | `TEXT` | YES | | Admin path |

| Constraint (hint) | Rule |
|-------------------|------|
| **CHK amounts** | `gtgc_self_amount >= 0` AND `gtgc_per_dependent_amount >= 0` |
| **CHK dates** | `effective_to IS NULL OR effective_to >= effective_from` |
| **CHK status** | `status IN ('draft','active','retired')` |
| **IX pick** | `(company_id, regime_code, effective_from DESC)` WHERE `archived_at IS NULL` AND `status = 'active'` |
| **Pick rule** | At `as_of`: one **active** row · `effective_from <= as_of` AND (`effective_to IS NULL OR effective_to >= as_of`) · tie-break: highest `effective_from` then `version` |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — table **ABSENT** · greenfield |
| Seed | **Admin/settings API only** · **cấm** U65 payroll seed · **cấm** `pnpm seed:*` for AC evidence |
| Default VN values | May exist as **initial admin publish** (11_000_000 / 4_400_000) **as CFG row** — **not** Nest literals |
| **FAIL** | Hardcoded amounts in resolver without CFG hit · overlapping active rows ambiguous |
| Unlock | **AC-PAY-03-CFG** · **J-HRM-PAY-03-02** |

**Paper alias:** logical extension of PAY CFG pillar (parallel **`pay_insurance_rate_cfg`** §5.4) — DOC-DELTA: add **`pay_gtgc_statutory_cfg`** to enterprise DB catalog when BA/SA sync paper.

### 6.3 HOLD waiver — unchanged header cols + runtime

| Residual | Waiver | Owner |
|----------|--------|-------|
| **`tax_amount` / `si_*` on payslip** | **HOLD** — PAY-05/06 | **ba-data** future seat |
| **R-PAY-03-RESOLVE/BAG/PROCESS/403** | Runtime **ABSENT** | **dev-be** after API |
| **Progressive TNCN brackets** | **HOLD** | **PAY-06** |
| **BR-BP-SPL-02 SI ceiling** | **HOLD** | **PAY-05** |

---

## 7. Lifecycle

### 7.1 `employee_dependents` (RETAIN)

| State | Meaning | Transition |
|-------|---------|------------|
| **active** | `archived_at IS NULL` | CRUD F-CORE-DEP-01 |
| **archived** | `archived_at` set | soft delete · excluded from count |
| **tax eligible** | `is_tax_dependent=true` + effective window | included in count at `as_of` |

| Invalid | Expected |
|---------|----------|
| PAY table duplicate person | **DENY** schema |
| `effective_from` > `effective_to` | validation **400** |

### 7.2 `pay_gtgc_statutory_cfg` (ADD)

| State | Meaning | Transition |
|-------|---------|------------|
| **draft** | Not pickable | publish → **active** |
| **active** | Pickable at `as_of` | supersede → **retired** + new row |
| **retired** | Historical | read-only |

### 7.3 `payroll_payslips.gtgc_amount` (ADD)

| State | Meaning | Transition |
|-------|---------|------------|
| **null** | Pre-process / legacy | process writes computed |
| **set** | Post-process snapshot | re-process overwrites |

---

## 8. scope_parity (U19)

| Surface | Resolver | Parity rule |
|---------|----------|-------------|
| Dependents list/get | `resolveHrmListScope` on `company_id` | Same employee scope CEO `main` rollup as CORE-01 |
| Payslip list/get `gtgc_amount` | Same as PAY periods/payslips | **J-HRM-PAY-03-06** list→detail |
| CFG admin list/get | `company_id` (+ optional `ou_id`) | Settings lane · not payroll grid |

Trace: **J-HRM-CORE-01-03** · **J-HRM-PAY-03-01..08**.

---

## 9. Traceability (SRS → DB → API → FE → test)

| BR/AC | Physical | API (GAP/RETAIN) | FE / J-* | Evidence |
|-------|----------|------------------|----------|----------|
| **O1** ONE SoT | `employee_dependents` | **F-CORE-DEP-01 RETAIN** | **J-HRM-PAY-03-01** | schema grep |
| **O2–O4** COUNT/ASOF/AGE | dep rows + dates | **F-PAY-GTCG-01 GAP** | **J-03-02/04** | U65 |
| **O5** CFG | `pay_gtgc_statutory_cfg` §6.2 | settings/admin GAP | admin path | **AC-PAY-03-CFG** |
| **O6** BAG | — (memory) | **F-PAY-CB-READ-01 GAP** | **J-03-07** | PAY02QC1 |
| **O8** HEADER | `gtgc_amount` §6.1 | process writer GAP | **J-03-02** | F5 payslip |
| **O9** SPLIT | **no** segment gtgc | **HRM-PAY-SPLIT-409 RETAIN** | **J-03-05** | PAY04QC1 |
| **O10** DENY manual | header read-only | **HRM-PAY-GTCG-403 GAP** | **J-03-03** | |
| **O12** DISPLAY | header + bag fields | payslip GET GAP | **J-03-06** | vi-VN |
| Diễn biến **#1** | deps | F-CORE-DEP-01 | **J-03-01** | |
| Diễn biến **#2** | CFG + header | F-PAY-PROCESS-01 GAP | **J-03-02** | |

---

## 10. Data interaction matrix (PAY-03 slice)

| Entity | Create | Read | Update | Delete/Archive | PAY-03 seat |
|--------|--------|------|--------|----------------|-------------|
| `employee_dependents` | CORE CRUD | PAY resolver internal | CORE PATCH | `archived_at` | **RETAIN** |
| `pay_gtgc_statutory_cfg` | admin publish | process pick | supersede | `archived_at` | **ADD stamp** |
| `payroll_payslips` | process upsert | list/get | process sets `gtgc_amount` | policy | **ADD col stamp** |
| `payroll_payslip_lines` | eval | get | re-process | — | **RETAIN** · optional GTCG line |
| `payroll_payslip_split_segments` | PAY-04 | get segments | — | — | **DV-14** no gtgc |
| `payroll_dependents` | — | — | — | — | **DENY** |
| `att_leave_hold` | — | — | — | — | **DENY** |

---

## 11. Deterministic error mapping (data-related)

| Code / condition | When | HTTP | Data note |
|------------------|------|------|-----------|
| **`HRM-PAY-GTCG-403`** | Body override `gtgc_*` / `dependent_count` on payroll mutate | **403** | **AC-PAY-03-DENY-MANUAL** |
| **`HRM-PAY-GTCG-412`** (proposed) | No CFG row for `as_of` | **412** | **VAL-PAY-03-DATA-03** · stable code in API-01 |
| **`HRM-PAY-SPLIT-409`** (peer) | Double static GTCG | **409** | header/segment guard |
| **`HRM-PAY-ATT-412`** (peer) | No closed bind | **412** | before GTCG write |
| Scope mismatch deps | Wrong `company_id` | **409/404** | U19 |
| Invent **`att_leave_hold`** | migration | — | **process defect** |

---

## 12. Closability analysis (exit gate)

| Candidate ADD | Closable? | Verdict |
|---------------|-----------|---------|
| **`payroll_payslips.gtgc_amount`** | **YES** — col ABSENT · nullable backfill | **ADD stamp** §6.1 |
| **`pay_gtgc_statutory_cfg`** full §6.2 | **YES** — table ABSENT · pattern proven (`pay_insurance_rate_cfg`) | **ADD stamp** §6.2 |
| Second `employee_dependents` | **NO** | **DENY** |
| `gtgc` per dep row | **NO** — violates O5/O8 | **DENY** |
| `gtgc_amount` on segment | **NO** — **DV-14** | **DENY** |
| `att_leave_hold` | **NO** | **DENY** |
| `tax_amount`/`si_*` header now | **YES** technically · **not in scope** | **HOLD waiver** PAY-05/06 |

---

## 13. Unlock next

| Field | Value |
|-------|--------|
| **next_owner** | **sa** (API-01 cluster) · **pm** orchestration |
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01` |
| **Mission** | F.1 deepen **F-PAY-CB-READ-01** + logical **F-PAY-GTCG-01** inside **F-PAY-PROCESS-01** · cite §6.1–6.2 physical names · resolver predicate **O2–O4** · bag **`dependents_count`** + **`gtgc_amount_vnd`** · **HRM-PAY-GTCG-403** · display-ready payslip fields · **must_keep** **PAY01QC1** / **PAY02QC1** / **PAY04QC1** / **F-CORE-DEP-01** · **DENY** public payroll dependents CRUD · **DENY** Nest `/core` dual · **DENY** `att_leave_hold` · **DENY** claim PAY-03 module DONE |

---

## 14. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §15 |
| **next_owner** | `sa` · `pm` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01.md` |

---

## 15. completion_report

**Closed:** ba-data **CONFIRMED ADD stamp** for UC-BP-PAY-03 / FR-UC-BP-PAY-03 / BR-BP-PAY-02 against SA Option A + BA O1–O16 — **stamped closable** **`payroll_payslips.gtgc_amount`** (paper §5.6) + **`public.pay_gtgc_statutory_cfg`** (`gtgc_self_amount` · `gtgc_per_dependent_amount` · effective-dated · **AC-PAY-03-CFG**); **HOLD RETAIN** **`public.employee_dependents`** ONE SoT (**F-CORE-DEP-01** · **REQ_L_003**); resolver predicate + bag keys documented; **O8** header xor single GTCG line; **must_keep** **PAY04** **DV-14** (no segment `gtgc_amount`); **HOLD waiver** paper `tax_amount`/`si_*` header cols; **must_keep** **`PAY01QC1-MSMBGWC1`** + **`PAY02QC1-MSMC4GWC1`** + **`PAY04QC1-MSMCR4GWC1`** + **`ATT12QC1-MSMAIGWC1`** + **`ATT11QC1-MSLXTH9P`** + ATT peer chain; **DENY** `payroll_dependents` · **DENY** `att_leave_hold` · **DENY** merge buckets · validation + lifecycle + scope parity + traceability; **≠ PAY-03 DONE** · **≠ payroll_e2e_ready** · **C-SLICE**; docs-only · no `apps/**` · no seed · no migrate this seat.

**Residual open (not DATA migrate this seat):** sa **API-01** F.1 · dev-be resolver + bag + 403 + ensureSchema ADDs · dev-fe read-only GTCG display · qa **J-HRM-PAY-03-01..08** + regression PAY-01/02/04/CORE · QC GWC C-SLICE · PAY-05/06 tax/SI header cols · admin API for CFG publish.

---

## 16. next_dispatch_prompt (copy-ready — sa API-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01
role: sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-40 seat #45)
lane: governance · F.1 deepen · UC-BP-PAY-03
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01.md (§6.1 gtgc_amount · §6.2 pay_gtgc_statutory_cfg · RETAIN employee_dependents)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-CB-READ-01 · F-PAY-PROCESS-01 · F-CORE-DEP-01
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md (HRM-PAY-SPLIT-409 · static once · DV-14)
entry_criteria: ba-data DATA-01 PASS_TO_PM CONFIRMED ADD stamp · must_keep PAY01QC1 + PAY02QC1 + PAY04QC1 + ATT11/12 · payroll_e2e_ready=false
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-03-CLUSTER-API-01.md
  - F.1 per surface: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (FR-UC-BP-PAY-03 Diễn biến #1–#2 + Thành công)
  - Logical F-PAY-GTCG-01 inside CB read/process · bag dependents_count + gtgc_amount_vnd · HRM-PAY-GTCG-403 · HRM-PAY-GTCG-412 (no CFG) · display-ready fields · DENY public payroll dependents CRUD
  - ack_status PASS_TO_PM unlock dev-be
cấm: apps/** · second dependents API · honesty flip · reopen PAY seals · seed
```
