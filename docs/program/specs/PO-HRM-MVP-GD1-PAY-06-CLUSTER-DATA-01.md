# PO-HRM-MVP-GD1-PAY-06-CLUSTER-DATA-01 — Physical DB · STAMPED ADD tax_amount header · RETAIN pay_tax_* KV · segment FORBIDS tax_* (Option A · ba-data)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-06-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-42 seat **#47**) |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** (stamped closable) — **`payroll_payslips.tax_amount`** per paper §5.6 (mirror PAY-03 `gtgc_amount` · PAY-05 `si_*` header pattern) · **RETAIN LIVE** **`public.hrm_company_settings`** keys **`pay_tax_*`** (**F-SET-TAX-01**) · **RETAIN** PAY-01..05 physical spine · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · peer ATT chain · **NO** payroll-owned progressive bracket master table GĐ1 · **NO** `tax_*` / static TNCN on split segment (**DV-14**) · **NO** invent `att_leave_hold` · **NO** merge sick/compensatory/carry→annual on PAY reads · **BIND** PAY-03 GTCG + PAY-05 SI static chain (SA §4.2 step 9 TNCN GAP) · **NO CODE** `apps/**` · **no seed** · **no migrate** governance seat |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED ADD stamp** — header **`tax_amount`** **closable** (ABSENT LIVE) · **`pay_tax_*`** **HOLD RETAIN** LIVE on settings · segment **re-assert FORBIDS** `tax_*` static (**DV-14**) · unlock **sa** `PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01` · dev-be/FE **HOLD** until API stamp · **`payroll_e2e_ready=false`** · **≠ PAY-06 / PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-06` · `FR-UC-BP-PAY-06` · **BR-BP-LC-04** · **BR-BP-TS-03** · **REQ_L_001** · peer **FR-UC-BP-PAY-03** (**F-PAY-GTCG-01**) · **FR-UC-BP-PAY-05** (**F-PAY-SI-CEILING-01**) · **FR-UC-BP-PAY-04** (**F-PAY-SPLIT-01** · **DV-14**) · **FR-UC-BP-PAY-02** (**THUE_TNCN_HT** catalog) |
| **depends_on** | BA-01 O1–O22 **CONFIRMED** · [`PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01.md) · peer DATA [`PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-05-CLUSTER-DATA-01.md) (si_* header · §4.2 order) · [`PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-03-CLUSTER-DATA-01.md) (gtgc static plane) · [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md) (**DV-14**) · [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-DATA-01.md) (formula · **THUE_TNCN_HT**) · [`PO-HRM-SETTINGS-DEFAULTS-DATA-01.md`](./PO-HRM-SETTINGS-DEFAULTS-DATA-01.md) · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§5.6** `pay_payslip.tax_amount` · **§5.8** + **DV-14** · **DV-13** |
| **ref_code_cite** | **read-only cite (2026-08-10):** `SettingsTaxParamsService` + **`pay_tax_*`** KV LIVE · **`THUE_TNCN_HT`** starter in `payroll-catalog.constants.ts` · **`payroll_payslips`** ensureSchema **without** `tax_amount` col · **`pay-gtgc-resolver`** / **`pay-si-ceiling-resolver`** ADD cols peer pattern · **`PAY_SPLIT_STATIC_COMPONENT_PREFIXES`** includes `TAX` · `THUE` · segment DDL **no** `tax_amount` (**pay-payslip-split.service.spec.ts**) · **F-PAY-TNCN-01** progressive writer **ABSENT** |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** DDL stamp alone = PAY-06 DONE · **DENY** Settings tax KV LIVE = DONE · **DENY** PAY / ATT module UAT · **DENY** invent `att_leave_hold` · **DENY** merge buckets · **DENY** per-segment tax cols · **DENY** payroll bracket CRUD table GĐ1 · **DENY** reopen sealed J-* without regression bus |
| **ack_status** | **PASS_TO_PM CONFIRMED ADD stamp** |

---

## 1. Verdict — **CONFIRMED ADD stamp** (TNCN header closable · Settings RETAIN · DV-14 re-assert)

| Decision | Stamp |
|----------|--------|
| **`hrm_company_settings` `pay_tax_*`** | **HOLD RETAIN LIVE** — `pay_tax_regime` · `pay_tax_personal_deduction_vnd` · `pay_tax_dependent_deduction_vnd` · `pay_tax_flags` · **cấm** second tax-parameter store in payroll module |
| **Progressive bracket SoT (O19 BA)** | **App / BE constants** `progressive_vn_v1` (versioned module) **xor** display bind **`THUE_TNCN_HT`** line — **DENY** `pay_tax_bracket_cfg` / payroll CRUD bậc thuế GĐ1 |
| **`payroll_payslips.tax_amount`** | **ADD stamp closable** — paper §5.6 · **ABSENT** LIVE · `NUMERIC(15,2) NULL` · writer = **F-PAY-TNCN-01** inside **F-PAY-PROCESS-01** only · **cấm** payroll API body override (**O14** BA) |
| **Header vs line (O12)** | **Rule:** persist TNCN static **once** — **`tax_amount` header** **xor** single **`THUE_TNCN_HT`** line on `payroll_payslip_lines` · **cấm** duplicate same amount on both · **cấm** multiple TNCN lines same payslip |
| **Taxable bag (O8)** | **App resolver** — merged gross/components − **`gtgc_amount`** − **`si_employee_amount`** ± **`pay_tax_flags`** · **not** a dedicated `taxable_income` payslip column GĐ1 (display-ready API fields) |
| **Process placement (O7)** | **must_keep** §4.2: … → **F-PAY-GTCG-01** → **F-PAY-SI-CEILING-01** → **(9) F-PAY-TNCN-01** → **gd1_eval_v1** / formula net |
| **Split-month (O13 · DV-14)** | **must_keep PAY04** — **0** `tax_amount` · **0** `tax_*` static cols on **`payroll_payslip_split_segments`** · component eval **cấm** static `TAX*`/`THUE*`/`TNCN_*` per segment · **`HRM-PAY-SPLIT-409`** if duplicate static tax |
| **`payroll_payslips.gtgc_amount` / `si_*`** | **RETAIN cite** PAY-03 / PAY-05 ADD stamps · inputs to tax bag · same static monthly plane |
| **YTD / bracket admin (O20–O21)** | **HOLD footer** — no YTD ledger col · no 13th-month col this seat |
| **Leave hold** | **DENY invent** **`att_leave_hold`** · **`pending_days`** only (**ATT09QC1**) |
| **Multi-bucket leave** | **DENY merge** compensatory / sick / carry_over → annual on PAY hour read |
| **This seat** | Docs only — **NO** `apps/**` · **NO** seed · **NO** migrate governance seat |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical GĐ1 LIVE / proposed | Action |
|-----------------|------------------------------|--------|
| `pay_payslip.tax_amount` | **`public.payroll_payslips.tax_amount`** | **ADD stamp** §6.1 |
| Tax parameters | **`public.hrm_company_settings`** `key` ~ `pay_tax_*` | **HOLD RETAIN** |
| `pay_payslip` grain | **`public.payroll_payslips`** + **`uq_payroll_payslip_period_employee`** | **HOLD RETAIN** (**DV-13**) |
| `pay_payslip_line` TNCN | **`public.payroll_payslip_lines`** `component_code` = **`THUE_TNCN_HT`** (PAY-02 catalog) | **HOLD RETAIN** · optional xor header |
| `pay_payslip_split_segment` | **`public.payroll_payslip_split_segments`** (PAY-04 stamp) | **RETAIN cite** · **no** `tax_*` cols |
| Payroll tax bracket master | — | **DENY** GĐ1 |
| Paper `att_leave_hold` | **`employee_leave_balances.pending_days`** | **DENY dual table** |

```text
  Settings LIVE (must_keep RETAIN): hrm_company_settings pay_tax_*
        pay_tax_regime.code = progressive_vn (required C-SLICE consumer)
        pay_tax_personal_deduction_vnd · pay_tax_dependent_deduction_vnd · pay_tax_flags
        missing regime → HRM-SET-TAX-412-MISSING (V-14)
        DENY: payroll duplicate tax KV store · payroll bracket CRUD table

  PAY-03 SEALED (must_keep PAY03QC1): gtgc_amount header (ADD stamp)
  PAY-05 SEALED (must_keep PAY05QC1): si_* header (ADD stamp)
        static GTCG + SI BEFORE TNCN step (SA §4.2)

  PAY-04 SEALED (must_keep PAY04QC1): payroll_payslip_split_segments
        time-varying only — FORBIDDEN tax_* on segment (DV-14)
        PAY_SPLIT_STATIC_COMPONENT_PREFIXES: TAX · THUE · … (extend TNCN_* family in API if needed)

  ┌──────── FR-UC-BP-PAY-06 DATA stamp ─────────────────────────────┐
  │  Taxable bag (app — post-merge gross − GTCG − SI employee ± flags) │
  │  progressive_vn_v1 apply ONCE on post-deduction base              │
  │                                                                  │
  │  payroll_payslips (RETAIN + ADD tax_amount §6.1)                    │
  │       tax_amount — process only · once per NV per period           │
  │       FORBIDDEN: manual API override · segment tax_* (DV-14)       │
  └──────────────────────────────────────────────────────────────────┘
        must_keep PAY01 closed bind · PAY02 formula after tax step · PAY04 merge-once
```

**Label lock:** Wave-42 PAY-06 GĐ1 DATA = **stamped closable** TNCN **header col** + **RETAIN** **`pay_tax_*`** settings + **re-assert DV-14** — **not** F-PAY-TNCN-01 runtime DONE · **not** claim enroll/process stub DONE · **C-SLICE**.  
**Honesty lock:** `payroll_e2e_ready=false` · **≠ PAY-06 / FR-PAY-06 module UAT**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-06 / FR-UC-BP-PAY-06 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT**  
> must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT peer chain  
> `tax_amount` ADD stamp **necessary not sufficient** · TNCN consumer **ABSENT** until Dev after API stamp  
> **RETAIN** `pay_tax_*` KV · DENY bracket master table · DENY per-segment tax · DENY manual tax/net · BIND GTCG+SI+TNCN static once §4.2  
> DENY `att_leave_hold` · DENY merge buckets · no seed · no apps/**

---

## 3. AS-IS baseline (physical — read-only cite · 2026-08-10)

| Object | AS-IS LIVE | Gap (Wave-42 DATA) |
|--------|------------|---------------------|
| **`public.hrm_company_settings`** `pay_tax_*` | Settings tax params LIVE | **HOLD RETAIN** · **412** consumer **GAP** dev-be |
| **`public.payroll_payslips`** | gross/deduction/net · **gtgc_amount** / **si_*** via resolver ensureSchema · **no** `tax_amount` | **ADD** §6.1 |
| **`public.payroll_payslip_lines`** | component lines · **`THUE_TNCN_HT`** catalog | **HOLD RETAIN** · writer **GAP** |
| **`public.payroll_payslip_split_segments`** | PAY-04 ADD stamp · **no** `tax_amount` | **must_keep DV-14** |
| **F-PAY-TNCN-01 consumer** | **ABSENT** in process | **GAP** dev-be after API |
| **`pay_tax_bracket_*` table** | grep **0** | **DENY invent** |
| **`att_leave_hold`** | **ABSENT** | **DENY invent** |

---

## 4. HOLD / residual dispositions

### 4.1 Tax settings — **HOLD RETAIN** (parameters only · **F-SET-TAX-01**)

| Physical / rule | Ruling |
|-----------------|--------|
| Keys | **`pay_tax_regime`** · **`pay_tax_personal_deduction_vnd`** · **`pay_tax_dependent_deduction_vnd`** · **`pay_tax_flags`** per [`PO-HRM-SETTINGS-DEFAULTS-DATA-01.md`](./PO-HRM-SETTINGS-DEFAULTS-DATA-01.md) §2.2 |
| Mutate path | **Only** settings company-settings API · scope U19 |
| PAY read | **`SettingsTaxParamsService`** at process · **`pay_tax_regime.code=progressive_vn`** required C-SLICE · absent → **`412` `HRM-SET-TAX-412-MISSING`** (**O9**) |
| **FAIL** | Payroll module owning duplicate KV store or bracket CRUD |

### 4.2 Payslip header — waiver **lift** (TNCN only)

| Physical / rule | Ruling |
|-----------------|--------|
| `tax_amount` on `payroll_payslips` | **ADD stamp** §6.1 — lifts PAY-03/04/05 HOLD **only for TNCN** header col |
| `gtgc_amount` · `si_employee_amount` · `si_employer_amount` | **RETAIN cite** PAY-03/05 §6.1 — tax bag inputs |
| `taxable_income` on payslip | **NOT ADD** GĐ1 — display-ready process/preview fields only (**O15**) |
| `net_amount` | **HOLD RETAIN** existing col · net reconciliation via **gd1_eval_v1** after tax step (**O7**) |
| Re-process | Overwrite `tax_amount` on period re-run · idempotent with bag + bracket engine |

### 4.3 Split segment — **re-assert DV-14** (segment **FORBIDS** `tax_*`)

| Physical / rule | Ruling |
|-----------------|--------|
| `payroll_payslip_split_segments` allow-list | **RETAIN** PAY-04 §6.1 cols only (`segment_seq` · `effective_from/to` · `base_salary_snapshot` · `hours_payable` · `segment_gross` · `company_id` · …) |
| **Forbidden columns** | **No** `tax_amount` · **no** `tax_*` · **no** `tncn_*` · **no** per-segment progressive snapshot |
| **Forbidden segment component eval** | Static prefixes **`TAX`** · **`THUE`** · **`TNCN_*`** (align **`PAY_SPLIT_STATIC_COMPONENT_PREFIXES`** + extend in API-01 if gap) — **cấm** sum tax per segment |
| Per-segment tax then sum | **DENY** — **BR-BP-PAY-STATIC-MONTH** FAIL · SRS «biến tĩnh tháng một lần» |

### 4.4 Peer seals — **must_keep**

| Stamp | Ruling |
|-------|--------|
| **`PAY01QC1-MSMBGWC1`** | RETAIN closed-sheet · **412** before tax side-effects |
| **`PAY02QC1-MSMC4GWC1`** | RETAIN formula **after** tax step · **`THUE_TNCN_HT`** catalog |
| **`PAY03QC1-MSMDDGWC1`** | RETAIN GTCG once · tax bag input |
| **`PAY04QC1-MSMCR4GWC1`** | RETAIN merge · **DV-14** · **409** duplicate static |
| **`PAY05QC1-MSMDU2GWC1`** | RETAIN SI once · **before** TNCN (**§4.2 step 8→9**) |
| **ATT12/11/10/09/07/06/05b/CORE07** | RETAIN · DENY merge · DENY `att_leave_hold` |
| Reopen sealed J-* | **DENY** without regression bus |

### 4.5 Rejected ADD / DENY

| Object | Verdict |
|--------|---------|
| `pay_tax_bracket_cfg` / payroll progressive table | **DENY** — **O19** C-SLICE BE constants only |
| `tax_amount` on `payroll_payslip_split_segments` | **DENY** — **DV-14** |
| `taxable_income_vnd` column on payslip | **DENY** GĐ1 — API display only |
| Manual grid override cols | **DENY** — **O14** |
| `att_leave_hold` | **DENY** |
| YTD cumulative tax ledger | **DENY** GĐ1 — **O20 HOLD** |
| Claim Settings tax KV LIVE = PAY-06 DONE | **DENY** — honesty |
| Claim enroll API alone = PAY-06 DONE | **DENY** — **O18** |

---

## 5. Validation matrix (data integrity)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-PAY-06-DATA-01** | Second payroll-owned tax parameter / bracket master table | SA Option A · **O19** | **FAIL** schema review |
| **VAL-PAY-06-DATA-02** | `tax_amount` or `tax_*` column on split segment | **DV-14** | **FAIL** migration |
| **VAL-PAY-06-DATA-03** | Process with missing/invalid `pay_tax_regime` when taxable path runs | **O9** · **V-14** | **412** `HRM-SET-TAX-412-MISSING` · **not** silent skip |
| **VAL-PAY-06-DATA-04** | `tax_amount` &lt; 0 on header | CHK §6.1 | **FAIL** |
| **VAL-PAY-06-DATA-05** | Tax computed per segment then summed | **O11** · **BR-BP-PAY-STATIC-MONTH** | **FAIL** process/QA |
| **VAL-PAY-06-DATA-06** | Header `tax_amount` + multiple **`THUE_TNCN_HT`** lines | **O12** | **FAIL** QA / process guard |
| **VAL-PAY-06-DATA-07** | API body sets `tax_amount` / `manual_tax_*` / `net_amount` on process/enroll | **O14** | **403** family (extend GTCG/SI peers) |
| **VAL-PAY-06-DATA-08** | Double static tax split path | PAY-04 | **409** `HRM-PAY-SPLIT-409` |
| **VAL-PAY-06-DATA-09** | TNCN before GTCG/SI in pipeline | **§4.2** | **FAIL** ordering AC |
| **VAL-PAY-06-DATA-10** | Static `TAX`/`THUE` component on &gt;1 segment eval | **DV-14** | **409** or process defect |
| **VAL-PAY-06-DATA-11** | Invent `att_leave_hold` | grep | **FAIL** |
| **VAL-PAY-06-DATA-12** | Claim DATA stamp = PAY-06 DONE | honesty | **FAIL** |
| **VAL-PAY-06-DATA-13** | Taxable base uses pre-merge segment gross without GTCG/SI once | **O8** | **FAIL** bag audit |

Formula check (consumer — logical; API-01 names):

```text
taxable_income_vnd = merged_eligible_gross_vnd
  − gtgc_amount_vnd (once, header or resolved)
  − si_employee_amount_vnd (once, header or resolved)
  ± pay_tax_flags adjustments (documented in API-01)

post_deduction_base_vnd = max(0,
  taxable_income_vnd
  − personal_deduction_vnd (from pay_tax_personal_deduction_vnd if flag)
  − dependent_deduction_vnd (per_unit × dependents_count from PAY-03 bag))

tax_amount = progressive_vn_v1(post_deduction_base_vnd)  -- ONCE per payslip header path
```

**Placement:** After **F-PAY-SPLIT-01** merge · after **F-PAY-GTCG-01** · after **F-PAY-SI-CEILING-01** · **before** **gd1_eval_v1** / published formula net (**PAY02QC1**).

---

## 6. Stamped ADD (closable — not LIVE · no migrate this seat)

> **BA-data stamp (2026-08-10):** SA Option A + BA O1–O22 — TNCN on header **closable** (mirror PAY-03 `gtgc_amount` · PAY-05 `si_*`). **Closable YES** (ABSENT LIVE · nullable backfill). **No** payroll bracket DDL. **Dev-be** migrates only after **sa API-01** F.1 + program waiver. **Governance seat:** stamp only.

### 6.1 Payslip header — **`tax_amount`** (**R-PAY-06-HEADER**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `tax_amount` | `NUMERIC(15,2)` | YES | NULL | TNCN — **once** per NV per period on merged income |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — column **ABSENT** in `payroll.service.ts` ensureSchema · `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` (peer: `pay-gtgc-resolver.ts` / `pay-si-ceiling-resolver.ts`) |
| Closable **this** seat? | **NO migrate** — stamp only |
| XOR line rule | If header `tax_amount` set, **cấm** duplicate static **`THUE_TNCN_HT`** line same amount without void policy · **at most one** TNCN line |
| **FAIL** | Manual PATCH from client · segment cols · per-segment tax storage |
| Unlock | **AC-PAY-06-HEADER** · **AC-PAY-06-TNCN-ONCE** · **J-HRM-PAY-06-04** · lifts PAY-03/04/05 HOLD **for TNCN col only** |

**Paper alias:** logical `pay_payslip.tax_amount` → physical **`payroll_payslips.tax_amount`**.

**Proposed migration sketch (dev-be — not this seat):**

```sql
ALTER TABLE public.payroll_payslips
  ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(15,2) NULL;
-- Optional: CHECK (tax_amount IS NULL OR tax_amount >= 0)
```

### 6.2 RETAIN — **`pay_tax_*` on `hrm_company_settings`** (no ADD table)

| Object | Ruling |
|--------|--------|
| Tax KV keys | **HOLD RETAIN LIVE** — authoritative parameters for **F-PAY-TNCN-01** |
| New payroll copy of tax settings | **DENY** |
| Pick at process | Read active JSON per key · regime **`progressive_vn`** for C-SLICE |

### 6.3 HOLD waiver — unchanged cols + runtime

| Residual | Waiver | Owner |
|----------|--------|-------|
| **R-PAY-06-RUN / ENROLL-AC** | FE browser **GAP** | **dev-fe** + **qa** |
| **R-PAY-06-TAX-BAG / TNCN** | Runtime **ABSENT** | **dev-be** after API |
| **R-PAY-06-BRACKET-ADMIN** | Full Luật CRUD | **O19** GĐ2 |
| **R-PAY-06-YTD** | Cumulative ledger | **O20 HOLD** |
| **H-PAY-06-LOCK / TERM / 13TH** | PAY-08/07/09 peers | footer |

---

## 7. Lifecycle

### 7.1 `hrm_company_settings` `pay_tax_*` (RETAIN)

| State | Meaning | Transition |
|-------|---------|------------|
| **configured** | Valid JSON per key | admin PUT settings |
| **missing regime** | Consumer cannot run C-SLICE tax | **412** on process |

### 7.2 `payroll_payslips.tax_amount` (ADD)

| State | Meaning | Transition |
|-------|---------|------------|
| **null** | Pre-process / legacy / zero base | process writes computed |
| **set** | Post-process TNCN snapshot | re-process overwrites |

---

## 8. scope_parity (U19)

| Surface | Resolver | Parity rule |
|---------|----------|-------------|
| Settings tax list/get | `company_id` scope | Same as existing company-settings |
| Payslip list/get `tax_amount` | Same as PAY periods/payslips | **J-HRM-PAY-06-06** list→detail |
| Segment expand | No `tax_*` fields | **DV-14** inspect |

Trace: **J-HRM-PAY-06-01..08** (DRAFT mint ba-process) · regression **J-HRM-PAY-01..05** subsets per BA-01 §4.1.

---

## 9. Traceability (SRS → DB → API → FE → test)

| BR/AC | Physical | API (GAP/RETAIN) | FE / J-* | Evidence |
|-------|----------|------------------|----------|----------|
| **O7** Process order | header static plane | **F-PAY-PROCESS-01** step 9 GAP | **J-06-04** | regression **J-PAY-05-02** |
| **O8** Tax bag | gtgc + si inputs | **F-PAY-TNCN-01 GAP** | **J-06-04** | PAY03/05QC1 |
| **O9** Regime | `pay_tax_regime` | **412 RETAIN/GAP** | **J-06-05** | Settings |
| **O10** Deduct | `pay_tax_*` deduction keys | process GAP | **J-06-04** | PAY-03 deps count |
| **O11** Once | `tax_amount` §6.1 | writer GAP | **J-06-04** | **≠** per-segment |
| **O12** Header/line | `tax_amount` xor **`THUE_TNCN_HT`** | **PAY02 RETAIN** | **J-06-04** | F5 payslip |
| **O13** SPLIT | **no** segment tax | **HRM-PAY-SPLIT-409 RETAIN** | **J-06-07** | PAY04QC1 |
| **O14** DENY manual | header read-only | **403 GAP** | **J-06-05** | |
| Diễn biến **#4–#6** | enroll + process | **F-PAY-RUN-01 GAP** | **J-06-03** | U65 |

---

## 10. Data interaction matrix (PAY-06 slice)

| Entity | Create | Read | Update | Delete/Archive | PAY-06 seat |
|--------|--------|------|--------|----------------|-------------|
| `hrm_company_settings` `pay_tax_*` | admin PUT | process read | supersede key | policy | **RETAIN** |
| `payroll_payslips` | process upsert | list/get | process sets `tax_amount` | policy | **ADD col stamp** |
| `payroll_payslip_lines` | eval | get | re-process | — | **RETAIN** · optional **THUE_TNCN_HT** |
| `payroll_payslip_split_segments` | PAY-04 | get segments | — | — | **DV-14** no tax_* |
| `pay_gtgc_statutory_cfg` | PAY-03 | GTCG pick | — | — | **RETAIN cite** |
| `pay_insurance_rate_cfg` | PAY-05 | SI pick | — | — | **RETAIN cite** |
| `employee_dependents` | CORE | PAY-03 count | — | — | **RETAIN cite** |
| Payroll tax bracket table | — | — | — | — | **DENY** |
| `att_leave_hold` | — | — | — | — | **DENY** |

---

## 11. Deterministic error mapping (data-related)

| Code / condition | When | HTTP | Data note |
|------------------|------|------|-----------|
| **`HRM-SET-TAX-412-MISSING`** | No valid `pay_tax_regime` for C-SLICE consumer | **412** | **VAL-PAY-06-DATA-03** |
| **`HRM-PAY-SPLIT-409`** (peer) | Double static tax/GTCG/SI on segments | **409** | **VAL-PAY-06-DATA-08/10** |
| **`HRM-PAY-TAX-403`** (proposed) | Body override `tax_amount` / `manual_tax_*` / `net_amount` | **403** | **AC-PAY-06-DENY-MANUAL** |
| **`HRM-PAY-ATT-412`** (peer) | No closed bind | **412** | before tax write |
| **`HRM-PAY-GTCG-412/403`** (peer) | GTCG chain break | **412/403** | **PAY03QC1** |
| **`HRM-SET-SI-412-MISSING`** (peer) | SI chain break | **412** | **PAY05QC1** |
| Per-segment tax persisted | segment row / eval | — | **process defect** |
| Invent **`att_leave_hold`** | migration | — | **process defect** |

---

## 12. Closability analysis (exit gate)

| Candidate ADD | Closable? | Verdict |
|---------------|-----------|---------|
| **`payroll_payslips.tax_amount`** | **YES** — col ABSENT · nullable | **ADD stamp** §6.1 |
| **`pay_tax_*` settings keys** | **LIVE RETAIN** | **no ADD** §6.2 |
| Payroll bracket master table | **NO** | **DENY** |
| `tax_*` on segment | **NO** — **DV-14** | **DENY** |
| `taxable_income` on payslip | **NO** GĐ1 | **DENY** — API display |
| `att_leave_hold` | **NO** | **DENY** |
| YTD tax ledger | **NO** GĐ1 | **HOLD** **O20** |

---

## 13. Unlock next

| Field | Value |
|-------|--------|
| **next_owner** | **sa** (API-01 cluster) · **pm** orchestration |
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01` |
| **Mission** | F.1 deepen **F-PAY-TNCN-01** + **F-PAY-RUN-01** inside **F-PAY-PROCESS-01** · cite §6.1 **`tax_amount`** · **BIND** §4.2 after SI · **RETAIN** **F-SET-TAX-01** · display-ready tax fields · **must_keep** **PAY01QC1..PAY05QC1** · **DENY** manual override · **DENY** public tax CRUD GĐ1 |

---

## 14. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §15 |
| **next_owner** | `sa` · `pm` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-DATA-01.md` |

---

## 15. completion_report

**Closed:** ba-data **CONFIRMED ADD stamp** for UC-BP-PAY-06 / FR-UC-BP-PAY-06 / BR-BP-LC-04 / REQ_L_001 against SA Option A + BA O1–O22 — **stamped closable** **`payroll_payslips.tax_amount`** (paper §5.6 · mirror PAY-03/05 header static pattern); **HOLD RETAIN LIVE** **`hrm_company_settings`** **`pay_tax_*`** keys (**F-SET-TAX-01** · **cấm** duplicate payroll tax store / bracket master GĐ1); **re-assert** **`payroll_payslip_split_segments`** **FORBIDS** `tax_*` static (**DV-14** · align **`PAY_SPLIT_STATIC_COMPONENT_PREFIXES`**); **BIND** PAY-03 GTCG + PAY-05 SI + TNCN static monthly once (**§4.2** step 9); **O12** header xor **`THUE_TNCN_HT`** line; **must_keep** **`PAY01QC1-MSMBGWC1`** + **`PAY02QC1-MSMC4GWC1`** + **`PAY03QC1-MSMDDGWC1`** + **`PAY04QC1-MSMCR4GWC1`** + **`PAY05QC1-MSMDU2GWC1`** + **`ATT12QC1-MSMAIGWC1`** + **`ATT11QC1-MSLXTH9P`** + ATT peer chain; validation + lifecycle + scope parity + traceability; **`payroll_e2e_ready=false`** · **≠ PAY-06 DONE** · **C-SLICE**; docs-only · no `apps/**` · no seed · no migrate this seat.

**Residual open (not DATA migrate this seat):** sa **API-01** F.1 · dev-be tax bag + progressive + `tax_amount` persist + deny manual + 409 bind · dev-fe enroll/process AC-PAY-HIRE-04/05 + read-only tax preview · qa **J-HRM-PAY-06-*** + regression PAY-01..05 · QC GWC C-SLICE · **O20–O22** YTD/T13/mid-hire tax edge · optional **`HRM-PAY-TAX-403`** code name in API-01.

---

## 16. next_dispatch_prompt (copy-ready — sa API-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01
role: sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-42 seat #47)
lane: governance · F.1 deepen · UC-BP-PAY-06 · FR-UC-BP-PAY-06 · BR-BP-LC-04
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-SA-01.md (§4.2 order · R-PAY-06-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md (O1–O22 · AC-PAY-06-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-DATA-01.md (§6.1 tax_amount · §6.2 RETAIN pay_tax_* · DV-14 segment FORBIDS tax_*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md (§4.2 steps 8→9 SI before TNCN)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-PROCESS-01
  - docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md (pay_tax_*)
entry_criteria: ba-data DATA-01 PASS_TO_PM CONFIRMED ADD stamp · must_keep PAY01QC1 + PAY02QC1 + PAY03QC1 + PAY04QC1 + PAY05QC1 + ATT11/12 · payroll_e2e_ready=false · U65
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md
  - F.1: F-PAY-TNCN-01 + F-PAY-RUN-01 inside F-PAY-PROCESS-01 · Mục đích · Nghiệp vụ xử lý · Tham chiếu SRS FR-UC-BP-PAY-06 Diễn biến #4–#6
  - Display-ready tax fields · HRM-SET-TAX-412-MISSING · bind §4.2 after F-PAY-SI-CEILING-01 · deny manual tax/net · extend static prefix family for TNCN
  - ack_status PASS_TO_PM unlock dev-be
cấm: apps/** · new public tax CRUD GĐ1 · payroll bracket master table · honesty flip · reorder PAY pipeline · reopen PAY seals · seed
```
