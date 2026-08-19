# PO-HRM-MVP-GD1-PAY-09-CLUSTER-DATA-01 — Physical DB · STAMPED ADD pay_payroll_group · period FK · payslip snapshot (Option A · ba-data)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-09-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-45 seat **#50**) |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** (stamped closable) — **`public.pay_payroll_group`** catalog · **`payroll_periods.payroll_group_id`** FK wire · **`payroll_payslips.payroll_group_id`** snapshot at **process only** · **`match_rule_json`** schema closable · **RETAIN** PAY-01..08 physical spine + process-written amount/header cols · **must_keep** **`PAY01QC1-MSMBGWC1`** … **`PAY08QC1-MSMFFXGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **NO** PAY-09 PATCH payslip amounts / publish / **`payment_status`** / void · **NO** invent `att_leave_hold` · **NO** hardcode four group enum · **NO CODE** `apps/**` · **no seed** · **no migrate** governance seat |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED ADD stamp** — catalog table + period/payslip FK cols **closable** (ABSENT LIVE grep 2026-08-10) · unlock **sa** `PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01` · dev-be/FE **HOLD** until API stamp · **`payroll_e2e_ready=false`** · **≠ PAY-09 / PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-09` · `FR-UC-BP-PAY-09` · **BR-BP-PAY-04** · **REQ_L_006** · peer **FR-UC-BP-PAY-01..08** (normative §4.2 order) |
| **depends_on** | BA-01 O1–O20 **CONFIRMED** · [`PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-09-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-09-CLUSTER-SA-01.md) · peer DATA [`PO-HRM-MVP-GD1-PAY-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-08-CLUSTER-DATA-01.md) (payslip lifecycle cols · **O1** boundary) · [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md) (mid-month **O10**) · [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-DATA-01.md) (formula pointer **O7**) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§5.5** `pay_payroll_group` · **§5.1** `pay_payroll_period.payroll_group_id` · **§5.6** `pay_payslip.payroll_group_id` snapshot |
| **ref_code_cite** | **read-only cite (2026-08-10):** `pay_payroll_group` / `payroll_group_id` — **grep `apps/**` + `packages/**` = 0** · LIVE **`public.payroll_periods`** · **`public.payroll_payslips`** — **no** `payroll_group_id` column in ensureSchema |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** DDL stamp alone = PAY-09 DONE · **DENY** period field mention alone = DONE · **DENY** hardcode VP/KD/TX/VH · **DENY** PAY / ATT module UAT · **DENY** invent `att_leave_hold` · **DENY** merge buckets · **DENY** reopen sealed J-* without regression bus |
| **ack_status** | **PASS_TO_PM CONFIRMED ADD stamp** |

---

## 1. Verdict — **CONFIRMED ADD stamp** (catalog · period FK · payslip snapshot)

| Decision | Stamp |
|----------|--------|
| **`pay_payroll_group` (paper §5.5)** | **ADD stamp closable** → **`public.pay_payroll_group`** tenant catalog per `company_id` · **ABSENT** LIVE · **cấm** fixed enum `office\|sales\|driver\|ops` in DDL/CHECK (**O2**) |
| **`match_rule_json`** | **ADD stamp closable** → `JSONB NOT NULL DEFAULT '{}'` · schema §6.1.1 · resolve at enroll/process boundary (**O3/O4/O11**) |
| **`priority`** | **ADD** — higher int wins on overlap (**O4**) |
| **Period scope FK** | **ADD stamp closable** → **`public.payroll_periods.payroll_group_id`** `UUID NULL` FK → `pay_payroll_group(id)` · optional run/filter scope (**O5**) · paper §5.1 |
| **Payslip snapshot FK** | **ADD stamp closable** → **`public.payroll_payslips.payroll_group_id`** `UUID NULL` · set **only** at **`POST …/process`** (**F-PAY-PROCESS-01**) · **immutable** after calculate — **cấm** PAY-09 lifecycle PATCH (**O6** · **O1**) |
| **Optional group formula** | **ADD stamp optional** → **`formula_definition_id`** on group (**O7** BIND PAY-02) · period pointer **RETAIN** LIVE path |
| **Process-written amounts** | **must_keep RETAIN** — `gross_amount`, `net_amount`, `deduction_amount`, `tax_amount`, `si_*`, `gtgc_amount`, lines, segments — **only** **F-PAY-PROCESS-01** (**O1**) |
| **PAY-08 lifecycle cols** | **must_keep RETAIN** PAY-08 stamp — `payment_status`, publish cols, `version` — **PAY-09 cấm** writer |
| **PAY-01..08 physical tables** | **must_keep RETAIN** — see §4 · **cấm** DROP/rename peer tables |
| **Leave hold** | **DENY invent** **`att_leave_hold`** |
| **This seat** | Docs only — **NO** `apps/**` · **NO** seed · **NO** migrate governance seat |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical GĐ1 LIVE / proposed | Action |
|-----------------|------------------------------|--------|
| `pay_payroll_group` | **`public.pay_payroll_group`** | **ADD stamp** §6.1 |
| `pay_payroll_period.payroll_group_id` | **`public.payroll_periods.payroll_group_id`** | **ADD stamp** §6.2 |
| `pay_payslip.payroll_group_id` | **`public.payroll_payslips.payroll_group_id`** | **ADD stamp** §6.3 |
| `pay_payroll_period` | **`public.payroll_periods`** | **RETAIN** · alias `start_date`/`end_date` vs paper `period_from`/`period_to` |
| `pay_payslip` | **`public.payroll_payslips`** | **RETAIN** · PAY-03..08 header stamps |
| `pay_formula_definition` | **`pay_formula_definitions`** (LIVE naming) | **RETAIN** PAY-02 · optional FK on group |
| `pay_payslip_split_segment` | **`payroll_payslip_split_segments`** | **RETAIN** PAY-04 · mid-month group **O10** |
| `pay_payslip_payment_status_audit` | same | **RETAIN** PAY-08 |
| `pay_termination_settlement` | **`pay_termination_settlement`** | **RETAIN** PAY-07 |
| Paper `att_leave_hold` | **`employee_leave_balances.pending_days`** | **DENY dual table** |

```text
  PAY-01..08 SEALED (must_keep PAY01QC1..PAY08QC1): F-PAY-PROCESS-01 = calculator + snapshot writer
       │
       ▼
  ┌──────── FR-UC-BP-PAY-09 DATA stamp (CFG + FK + snapshot — not calculator) ─────┐
  │  ADD: pay_payroll_group (tenant catalog · match_rule_json · priority)            │
  │  ADD: payroll_periods.payroll_group_id (optional run scope)                      │
  │  ADD: payroll_payslips.payroll_group_id (snapshot at process only)               │
  │  RETAIN: all PAY-01..08 tables + process amount cols + PAY-08 lifecycle cols   │
  │  DENY: PAY-09 UPDATE gross/net/tax/si/gtgc · publish · payment_status · void    │
  │  DENY: hardcode four group codes · att_leave_hold                                │
  └──────────────────────────────────────────────────────────────────────────────────┘
        Resolve NV→group @ enroll/process · dual match w/o priority → HRM-PAY-GROUP-409
        Mid-month group+formula change → PAY-04 split (BIND) — not second payslip invent
```

**Label lock:** Wave-45 PAY-09 GĐ1 DATA = **stamped closable** tenant group catalog + period/payslip FK wire — **not** F-PAY-GROUP-01 runtime DONE · **not** CRUD→process→report browser e2e · **C-SLICE**.  
**Honesty lock:** `payroll_e2e_ready=false` · **≠ PAY-09 / FR-PAY-09 module UAT**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-09 / FR-UC-BP-PAY-09 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠** full group CRUD→scoped process→report e2e  
> must_keep **`PAY01QC1-MSMBGWC1`** … **`PAY08QC1-MSMFFXGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`**  
> group ADD stamp **necessary not sufficient** · resolver/filter/snapshot **ABSENT** until Dev after API stamp  
> **RETAIN** PAY-01..08 physical · **CFG/filter/snapshot only PAY-09** · DENY hardcode four groups · DENY payslip lifecycle PATCH · DENY `att_leave_hold` · no seed · no apps/**

---

## 3. AS-IS baseline (physical — read-only cite · 2026-08-10)

| Object | AS-IS LIVE | Gap (Wave-45 DATA) |
|--------|------------|---------------------|
| **`public.pay_payroll_group`** | **ABSENT** (grep 0) | **ADD** §6.1 |
| **`payroll_periods.payroll_group_id`** | **ABSENT** | **ADD** §6.2 |
| **`payroll_payslips.payroll_group_id`** | **ABSENT** | **ADD** §6.3 |
| **`match_rule_json` resolver** | **ABSENT** | **GAP** BE service (post-API) |
| **PAY-01..08 tables** | LIVE + peer stamps | **must_keep RETAIN** §4 |
| **Process amount cols** | partial per PAY-03..07 | **must_keep RETAIN** |
| **PAY-08 lifecycle cols** | stamped ABSENT/unwired | **RETAIN** PAY-08 DATA stamp |
| **`att_leave_hold`** | **ABSENT** | **DENY invent** |

---

## 4. RETAIN — PAY-01..08 physical inventory (must_keep)

| Peer | Primary physical objects | PAY-09 relation |
|------|------------------------|-----------------|
| **PAY-01** | `pay_period_timesheet_bind` · `payroll_periods` · `attendance_sheets` / lines | **RETAIN** · period FK **ADD** does not remove bind |
| **PAY-02** | `pay_formula_definitions` · salary component pointers | **RETAIN** · group optional `formula_definition_id` **BIND** |
| **PAY-03** | `pay_gtgc_statutory_cfg` · `gtgc_amount` on payslip | **RETAIN** · **cấm** PAY-09 write |
| **PAY-04** | `payroll_payslip_split_segments` | **RETAIN** · **O10** mid-month group |
| **PAY-05** | `pay_insurance_rate_cfg` · `si_*` on payslip | **RETAIN** |
| **PAY-06** | `tax_amount` on payslip | **RETAIN** |
| **PAY-07** | `pay_termination_settlement` · `is_final_pay` | **RETAIN** |
| **PAY-08** | `payment_status` · publish · lock · audit | **RETAIN** · **O1** lifecycle boundary |
| **Common** | `payroll_payslips` · `payroll_payslip_lines` | **RETAIN** UQ DV-13 GĐ1 |

**Invariant:** PAY-09 **does not** DROP, rename, or repurpose columns owned by PAY-01..08 stamps.

---

## 5. Validation matrix (data integrity)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-PAY-09-DATA-01** | Two active groups match same NV same period w/o priority | **O13** · **BR-BP-PAY-04** | **409** `HRM-PAY-GROUP-409` |
| **VAL-PAY-09-DATA-02** | Period create/update with `payroll_group_id` → retired group | **O12** | **409** or validation **FAIL** |
| **VAL-PAY-09-DATA-03** | `payroll_group_id` on payslip PATCH after calculate (non re-process) | **O6** | **403** / **409** — snapshot immutable |
| **VAL-PAY-09-DATA-04** | PAY-09 API PATCH `gross_amount` / `payment_status` / publish cols | **O1** | **403** — PAY-08 boundary |
| **VAL-PAY-09-DATA-05** | `match_rule_json` invalid shape | schema §6.1.1 | **400** deterministic |
| **VAL-PAY-09-DATA-06** | `employee_ids` in rule + dept/position overlap | **O11** | explicit list **wins** for listed NV |
| **VAL-PAY-09-DATA-07** | Scoped period `payroll_group_id` set | enroll list | only NV resolved into group (**O8**) |
| **VAL-PAY-09-DATA-08** | Process without resolved group when policy requires | SRS tiên quyết | **412** `HRM-PAY-GROUP-412` optional |
| **VAL-PAY-09-DATA-09** | `company_id` list groups ≠ get group by id | **U19** **O15** | same resolver · **J-HRM-PAY-09-08** |
| **VAL-PAY-09-DATA-10** | Hardcode CHECK enum four codes | **O2** | **process defect** |
| **VAL-PAY-09-DATA-11** | Invent `att_leave_hold` | grep | **FAIL** |
| **VAL-PAY-09-DATA-12** | Claim DATA stamp = PAY-09 DONE | honesty **O18** | **FAIL** |
| **VAL-PAY-09-DATA-13** | Duplicate `(company_id, code)` active group | catalog UQ | **409** |

---

## 6. Stamped ADD (closable — not LIVE · no migrate this seat)

> **BA-data stamp (2026-08-10):** SA Option A + BA O1–O20 — **`pay_payroll_group`** · period/payslip **`payroll_group_id`** **closable** (ABSENT LIVE). **Dev-be** migrates only after **sa API-01** F.1 + program waiver. **Governance seat:** stamp only.

### 6.1 Catalog — **`public.pay_payroll_group`** (**R-PAY-09-CRUD**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK |
| `company_id` | `TEXT` | NO | | Scope (**U19**) |
| `code` | `TEXT` | NO | | Tenant-defined · **≠** fixed VP/KD/TX/VH enum |
| `name_vi` | `TEXT` | NO | | Display label (**O9** · **O14**) |
| `priority` | `INT` | NO | `0` | Higher wins on overlap (**O4**) |
| `match_rule_json` | `JSONB` | NO | `'{}'` | §6.1.1 |
| `formula_definition_id` | `UUID` | YES | NULL | Optional group default formula (**O7** BIND PAY-02 published) |
| `status` | `TEXT` | NO | `'active'` | `active` \| `retired` |
| `archived_at` | `TIMESTAMPTZ` | YES | NULL | Soft retire (**O12**) |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | Audit |

| Index / constraint | Definition |
|--------------------|------------|
| **UQ active code** | `UNIQUE (company_id, code)` WHERE `archived_at IS NULL` (or partial index) |
| **IX scope** | `(company_id, status)` |
| **FK formula** | `formula_definition_id` → `pay_formula_definitions(id)` ON DELETE RESTRICT (when col present) |

#### 6.1.1 `match_rule_json` schema (normative · closable)

| Key | Type | Required | Semantics |
|-----|------|----------|-----------|
| `department_ids` | `string[]` (UUID) | NO | Match NV primary dept in list |
| `position_keys` | `string[]` | NO | Match NV `position_key` / job catalog key |
| `employee_ids` | `string[]` (UUID) | NO | **Explicit list** — **overrides** dept/position for listed NV (**O11**) |

**Resolve order (normative):**

1. Collect all **active** groups for `company_id` where rule matches NV attributes at period boundary.
2. If `employee_ids` contains NV → group matches (**override**).
3. If multiple matches → pick highest **`priority`** (**O4**).
4. If still ambiguous (equal priority overlap) → **VAL-PAY-09-DATA-01** **`HRM-PAY-GROUP-409`**.

**Cấm:** seed rows with only four fixed codes as product default.

**Proposed migration sketch (dev-be — not this seat):**

```sql
CREATE TABLE IF NOT EXISTS public.pay_payroll_group (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name_vi TEXT NOT NULL,
  priority INT NOT NULL DEFAULT 0,
  match_rule_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  formula_definition_id UUID NULL,
  status TEXT NOT NULL DEFAULT 'active',
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_pay_payroll_group_status CHECK (status IN ('active', 'retired'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pay_payroll_group_company_code_active
  ON public.pay_payroll_group (company_id, code)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_pay_payroll_group_company_status
  ON public.pay_payroll_group (company_id, status);
```

### 6.2 Period — optional scope FK (**R-PAY-09-PERIOD-BIND** · paper §5.1)

| Proposed column | Type | Null | Rule |
|-----------------|------|------|------|
| `payroll_group_id` | `UUID` | YES | FK → `pay_payroll_group(id)` ON DELETE RESTRICT |

| Question | Ruling |
|----------|--------|
| Writer | Period create/update API (**F-PAY-GROUP-01**) · **not** payslip |
| Scoped run | When set, enroll/eligibility + process scope = NV in group (**O5** · **O8**) |
| Retired bind | **VAL-PAY-09-DATA-02** |
| Paper UQ note | Paper `(company_id, period_from, period_to, coalesce(payroll_group_id,''))` — **HOLD** align with LIVE period date cols on migrate |

**Proposed migration sketch (dev-be — not this seat):**

```sql
ALTER TABLE public.payroll_periods
  ADD COLUMN IF NOT EXISTS payroll_group_id UUID NULL
  REFERENCES public.pay_payroll_group(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS ix_payroll_periods_payroll_group_id
  ON public.payroll_periods (payroll_group_id)
  WHERE payroll_group_id IS NOT NULL;
```

### 6.3 Payslip — snapshot at process (**R-PAY-09-SNAPSHOT** · paper §5.6)

| Proposed column | Type | Null | Rule |
|-----------------|------|------|------|
| `payroll_group_id` | `UUID` | YES | FK → `pay_payroll_group(id)` ON DELETE RESTRICT |

| Question | Ruling |
|----------|--------|
| Writer | **Only** **`F-PAY-PROCESS-01`** at successful **process** — value = resolved effective group for NV @ process boundary (**O6**) |
| Immutability | After calculate, **cấm** UPDATE `payroll_group_id` except full re-process policy documented in API-01 — **not** PAY-09 PATCH |
| Display | GET enrich `code` + `name_vi` (**O14** BIND PAY-08) — read-only |
| Mid-month | Group change + formula change → **PAY-04** split (**O10**) — **cấm** invent second payslip |

**Proposed migration sketch (dev-be — not this seat):**

```sql
ALTER TABLE public.payroll_payslips
  ADD COLUMN IF NOT EXISTS payroll_group_id UUID NULL
  REFERENCES public.pay_payroll_group(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS ix_payroll_payslips_payroll_group_id
  ON public.payroll_payslips (payroll_group_id)
  WHERE payroll_group_id IS NOT NULL;
```

### 6.4 HOLD / deferred (not PAY-09 DATA ADD scope)

| Residual | Waiver | Owner |
|----------|--------|-------|
| **H-PAY-09-WIRE** | `wire-payment-batch` → `payment_status=paid` | **O19** · PAY-08 API-01 |
| **H-PAY-09-AMIS** | Bank file / AMIS UI depth | **O20** |
| **R-PAY-09-RESOLVE** | Resolver service runtime | **dev-be** post-API |
| **R-PAY-09-ENROLL-FILTER** | Query param wire | **dev-be** + **dev-fe** |
| Paper period UQ with group | LIVE `start_date`/`end_date` naming | **dev-be** migrate alignment |

---

## 7. Lifecycle

### 7.1 `pay_payroll_group.status`

| From | To | Valid when |
|------|-----|------------|
| `active` | `retired` | CRUD retire · sets `archived_at` optional |
| `retired` | `active` | **HOLD** GĐ1 — prefer new group code vs un-retire |

| State | New period `payroll_group_id` bind | Historical payslip snapshot |
|-------|-----------------------------------|----------------------------|
| `active` | **ALLOW** | N/A |
| `retired` | **DENY** (**VAL-PAY-09-DATA-02**) | **RETAIN** id on old payslips |

### 7.2 Payslip `payroll_group_id` (snapshot SM)

| Event | Column behavior |
|-------|-----------------|
| Pre-process | `NULL` or stale — **not** authoritative for report |
| **POST process** success | Set resolved group id — **snapshot** |
| Publish / TT / void (PAY-08) | **RETAIN** snapshot · **cấm** PAY-09 change |
| Re-process (policy) | May refresh snapshot per API-01 — **not** silent PATCH |

---

## 8. scope_parity (U19)

| Surface | Resolver | Parity rule | Journey |
|---------|----------|-------------|---------|
| `listPayrollGroups` / `getPayrollGroupById` | `company_id` ladder (group CEO `main` rollup) | list ≡ get-by-id | **J-HRM-PAY-09-01** · **O15** |
| `listPeriods` / `getPeriodById` | same + `payroll_group_id` filter | | **J-HRM-PAY-09-03** |
| `listPayslips` / `getPayslipById` | same + filter by snapshot `payroll_group_id` | | **J-HRM-PAY-09-04/05** |

Trace: **J-HRM-PAY-09-01..08** (DRAFT BA-01) · regression **J-HRM-PAY-01..08** subsets per BA-01 §4.1.

---

## 9. Traceability (SRS → DB → API → FE → test)

| BR/AC | Physical | API (GAP/RETAIN) | FE / J-* | Evidence |
|-------|----------|------------------|----------|----------|
| **O1** Calc SoT | amount cols **RETAIN** | **F-PAY-PROCESS-01 RETAIN** | **J-09-03** | **PAY06QC1** |
| **O2** Catalog | §6.1 | **F-PAY-GROUP-01** CRUD GAP | **J-09-01** | **≠ hardcode** |
| **O3/O4** Resolve | `match_rule_json` | resolve GAP | **J-09-02** | priority |
| **O5** Period scope | §6.2 | period GAP | **J-09-03** | |
| **O6** Snapshot | §6.3 | process writer GAP | **J-09-05** | F5 |
| **O7** Formula | `formula_definition_id` optional | PAY-02 BIND | **J-09-03** | **PAY02QC1** |
| **O8** Enroll filter | resolver + period FK | eligibility GAP | **J-09-03** | |
| **O9** Report | snapshot + `name_vi` | list filter GAP | **J-09-04** | |
| **O10** Mid-month | split segments **RETAIN** | **F-PAY-SPLIT-01** BIND | **J-09-06** | **PAY04QC1** |
| **O12** Retire | `status` + §7.1 | CRUD GAP | **J-09-07** | |
| **O13** Dual 409 | resolver | enroll/process GAP | **J-09-07** | **HRM-PAY-GROUP-409** |
| **O14** Display | §6.3 FK | GET enrich GAP | **J-09-05** | PAY-08 BIND |
| **O15** Parity | all §6 FKs | same resolver GAP | **J-09-08** | U19 |
| Diễn biến **#1** | §6.1 | CRUD | **J-09-01** | U65 |
| Diễn biến **#2** | §6.2 + resolve | filter + process | **J-09-02/03** | |
| Luồng **#3** | §6.3 snapshot | list/report GAP | **J-09-04** | |

---

## 10. Data interaction matrix (PAY-09 slice)

| Entity | Create | Read | Update | Delete/Archive | PAY-09 seat |
|--------|--------|------|--------|----------------|-------------|
| `pay_payroll_group` | CRUD API | list/get catalog | rule/priority/status | retire → `retired` | **ADD** §6.1 |
| `payroll_periods` | PAY-01 | list/get | **`payroll_group_id`** optional | — | **ADD col** §6.2 |
| `payroll_payslips` | process upsert | list/get | **cấm** group PATCH · lifecycle = PAY-08 | — | **ADD col** §6.3 snapshot writer only |
| `payroll_payslip_split_segments` | PAY-04 | get | — | — | **RETAIN** **O10** |
| `pay_formula_definitions` | PAY-02 | get | — | — | **RETAIN** |
| `pay_payslip_payment_status_audit` | PAY-08 | audit | — | — | **RETAIN** |
| `att_leave_hold` | — | — | — | — | **DENY** |

---

## 11. Deterministic error mapping (data-related)

| Code / condition | When | HTTP | Data note |
|------------------|------|------|-----------|
| **`HRM-PAY-GROUP-409`** | Dual/overlap group match | **409** | **VAL-PAY-09-DATA-01** · stable `reason_code` |
| **`HRM-PAY-GROUP-412`** | Missing catalog / no group when required | **412** | **VAL-PAY-09-DATA-08** |
| Retired group on new period | bind | **409** | **VAL-PAY-09-DATA-02** |
| Snapshot PATCH after calculate | lifecycle | **403** | **VAL-PAY-09-DATA-03** |
| PATCH amounts/publish from PAY-09 | API boundary | **403** | **VAL-PAY-09-DATA-04** |
| Out-of-scope group id | U19 | **404** | **VAL-PAY-09-DATA-09** |
| Invent **`att_leave_hold`** | migration | — | **process defect** |
| Hardcode four-group enum | DDL/app | — | **VAL-PAY-09-DATA-10** |

---

## 12. Closability analysis (exit gate)

| Candidate ADD | Closable? | Verdict |
|---------------|-----------|---------|
| **`public.pay_payroll_group`** table | **YES** — ABSENT LIVE | **ADD stamp** §6.1 |
| **`payroll_periods.payroll_group_id`** | **YES** — ABSENT | **ADD stamp** §6.2 |
| **`payroll_payslips.payroll_group_id`** | **YES** — ABSENT | **ADD stamp** §6.3 |
| **`match_rule_json` schema** | **YES** — no table today | **ADD stamp** §6.1.1 |
| PAY-01..08 peer tables/cols | **N/A** | **RETAIN** §4 |
| Process amount cols | **N/A** | **RETAIN** — not PAY-09 writer |
| `att_leave_hold` | **NO** | **DENY** |
| Hardcode four codes CHECK | **NO** | **DENY** |
| Claim DATA stamp = PAY-09 DONE | **NO** | **DENY** honesty |

---

## 13. Unlock next

| Field | Value |
|-------|--------|
| **next_owner** | **sa** (API-01 cluster) · **pm** orchestration |
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01` |
| **Mission** | F.1 deepen **F-PAY-GROUP-01** · CRUD · resolve · period scope · snapshot at process · enroll/list/report filters · **HRM-PAY-GROUP-409** · **HRM-PAY-GROUP-412** · display-ready labels · **RETAIN** PAY-08 **O19** wire HOLD · Mục đích · Nghiệp vụ · Tham chiếu SRS Diễn biến **#1–#2** · cite §6.1–6.3 · **must_keep** **PAY01QC1..PAY08QC1** · **DENY** calculator/lifecycle PATCH |

---

## 14. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §15 |
| **next_owner** | `sa` · `pm` |
| **ack_status** | **PASS_TO_PM CONFIRMED ADD stamp** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-DATA-01.md` |

### 14.1 next_dispatch_prompt (copy-ready — sa API-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01
role: sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-45 seat #50)
lane: governance · F.1 deepen · UC-BP-PAY-09 · F-PAY-GROUP-01
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-DATA-01.md (§6.1–6.3 physical stamp · match_rule_json §6.1.1)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md payroll_group_id on period · index PAY-09
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01.md (O19 wire-batch HOLD peer · payslip GET enrich)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md (mid-month O10 BIND)
entry_criteria: BA O1–O20 CONFIRMED · DATA-01 PASS_TO_PM CONFIRMED ADD stamp · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + PAY03QC1-MSMDDGWC1 + PAY04QC1-MSMCR4GWC1 + PAY05QC1-MSMDU2GWC1 + PAY06QC1-MSMECGWC1 + PAY07QC1-MSMEY7GWC1 + PAY08QC1-MSMFFXGWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P · payroll_e2e_ready=false · U65
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01.md
  - F.1: F-PAY-GROUP-01 CRUD · resolve · period payroll_group_id · snapshot at POST process · enroll/list/report filters
  - HRM-PAY-GROUP-409 · HRM-PAY-GROUP-412 · display-ready payroll_group_* on period/payslip GET
  - RETAIN F-PAY-PROCESS-01 calculator · RETAIN PAY-08 O19 wire HOLD pointer
  - Mục đích · Nghiệp vụ · Tham chiếu SRS FR-UC-BP-PAY-09 Diễn biến #1–#2 + Thành công
  - Map DTO ↔ DATA-01 §6.1 pay_payroll_group · §6.2 period FK · §6.3 payslip snapshot
  - ack_status PASS_TO_PM unlock dev-be
cấm: apps/** · PAY-09 PATCH payslip amounts/publish/TT/void · hardcode four group enum · honesty flip · reorder PAY pipeline · reopen PAY seals · seed
```

---

## 15. completion_report

| | |
|--|--|
| **Closed** | **CONFIRMED ADD stamp** for UC-BP-PAY-09 physical gap: **`public.pay_payroll_group`** (tenant catalog · `code` · `name_vi` · `priority` · `match_rule_json` §6.1.1 · optional `formula_definition_id` · `status`/`archived_at`) · **`payroll_periods.payroll_group_id`** optional scope FK §6.2 · **`payroll_payslips.payroll_group_id`** snapshot at **F-PAY-PROCESS-01** only §6.3 · migration sketches for dev-be · validation **VAL-PAY-09-DATA-01..13** · lifecycle §7 · **U19** scope_parity §8 · traceability to **AC-PAY-GROUP-*** and **J-HRM-PAY-09-*** · **RETAIN** PAY-01..08 physical inventory §4 · process amount cols · PAY-08 lifecycle peer · **must_keep PAY01QC1..PAY08QC1 + ATT11/12** · **DENY** hardcode four groups · **DENY** PAY-09 lifecycle/amount PATCH · **HOLD** O19/O20 wire/AMIS footers · **`payroll_e2e_ready=false`** · unlock **sa API-01** |
| **Residual (open)** | sa API-01 · dev-be migrate + resolver/filter/snapshot wire · dev-fe catalog UI · QA J-* · QC GWC |
| **next_owner** | **sa** (`PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01`) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM CONFIRMED ADD stamp** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-DATA-01.md` |
