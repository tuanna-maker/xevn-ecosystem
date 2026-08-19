# PO-HRM-MVP-GD1-PAY-07-CLUSTER-DATA-01 — Physical DB · STAMPED ADD settlement + final payslip flags · O3 soft TERM · HOLD `hrm_termination` (Option A · ba-data)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-07-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-43 seat **#48**) |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** (stamped closable) — **`public.pay_termination_settlement`** per paper **§5.10** · **`payroll_payslips.is_final_pay`** + **`termination_settlement_id`** per paper **§5.6** · **RETAIN** PAY-01..06 physical spine + sealed static header cols (PAY-03/05/06) · **HOLD** physical **`hrm_termination`** + **`final_settlement_id`** back-pointer until CORE **F-CORE-TERM-01** program (**O3 soft TERM**) · **must_keep** **`PAY01QC1-MSMBGWC1`** … **`PAY06QC1-MSMECGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`CORE06QC1-MSLID363`** · **`CORE10QC1-MSLP0EJB`** · **NO** manual payout amount cols on settlement (**O14**) · **NO** invent `att_leave_hold` · **NO** merge sick/compensatory/carry→annual · **BIND** PAY-04 mid-month + PAY-05/06 static-once on final run · **NO CODE** `apps/**` · **no seed** · **no migrate** governance seat |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED ADD stamp** — **`pay_termination_settlement`** **closable** (ABSENT LIVE) · payslip **`is_final_pay`** / **`termination_settlement_id`** **closable** (ABSENT LIVE) · **O3** soft TERM documented · **`hrm_termination`** **HOLD** (no ADD this seat) · unlock **sa** `PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01` · dev-be/FE **HOLD** until API stamp · **`payroll_e2e_ready=false`** · **≠ PAY-07 / PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-07` · `FR-UC-BP-PAY-07` · **BR-BP-TERM-01** · **BR-BP-LC-05** · **REQ_L_002** · peer **FR-UC-BP-PAY-01..06** (normative §4.2 order) |
| **depends_on** | BA-01 O1–O22 **CONFIRMED** · [`PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md) · peer DATA [`PO-HRM-MVP-GD1-PAY-06-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-06-CLUSTER-DATA-01.md) · [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md) (**DV-14**) · [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01.md) (**DV-09** · closed bind) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§3.10** `hrm_termination` (HOLD) · **§5.6** `pay_payslip` · **§5.10** `pay_termination_settlement` · **§5.11** lifecycle |
| **ref_code_cite** | **read-only cite (2026-08-10):** `payroll.service.ts` ensureSchema **`payroll_payslips`** without `is_final_pay` / `termination_settlement_id` · grep **`pay_termination_settlement`** / **`is_final_pay`** in `apps/api/hrm-api` **0** · **`decisions.service`** maps `hrd_02` → termination event (**WH only**) · **`F-PAY-TERM-SETTLE-01`** writer **ABSENT** |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** DDL stamp alone = PAY-07 DONE · **DENY** `processPayrollPeriod` LIVE = DONE · **DENY** PAY / ATT module UAT · **DENY** invent `att_leave_hold` · **DENY** merge buckets · **DENY** payout amount cols on settlement · **DENY** reopen sealed J-* without regression bus |
| **ack_status** | **PASS_TO_PM CONFIRMED ADD stamp** |

---

## 1. Verdict — **CONFIRMED ADD stamp** (settlement table + final payslip flags · O3 soft TERM)

| Decision | Stamp |
|----------|--------|
| **`pay_termination_settlement` (paper §5.10)** | **ADD stamp closable** → physical **`public.pay_termination_settlement`** · **ABSENT** LIVE · greenfield · checklist flags only — **cấm** `leave_cashout_vnd` / `severance_vnd` / `manual_payout_*` cols (**O14** · formula on payslip lines only) |
| **`pay_payslip.is_final_pay` (paper §5.6)** | **ADD stamp closable** → **`public.payroll_payslips.is_final_pay`** `BOOLEAN NOT NULL DEFAULT false` |
| **`termination_settlement_id` on payslip** | **ADD stamp closable** → **`public.payroll_payslips.termination_settlement_id`** `UUID NULL` → settlement PK (bidirectional with `final_payslip_id`) |
| **`hrm_termination` + `final_settlement_id` (paper §3.10)** | **HOLD** — physical table **ABSENT** LIVE · **no ADD** this governance seat · CORE program owns **F-CORE-TERM-01** · PAY settlement **`termination_id`** accepts **soft case** pointer (**O3**) |
| **O3 soft TERM (BA CONFIRM)** | **YES GĐ1** — `termination_id` = opaque UUID: future FK → `hrm_termination.id` **or** deterministic surrogate from **(`employee_id`, `company_id`, `termination_date`, optional `hr_decisions.id` where `hrd_02`)** · **cấm** require physical `hrm_termination` row for settlement INSERT · **cấm** invent Nest `/core/termination` dual SoT |
| **Checklist booleans on settlement** | **ADD stamp** — `si_cutoff_done` · `leave_cashout_done` · `asset_checklist_ack` · `reward_discipline_included` — **audit snapshot at post time** · writers = **read peers** + settlement orchestration only (**≠** PAY POST SI stop · **≠** PATCH leave balance) |
| **Closed sheet (O2 · DV-09)** | **must_keep PAY01** — `timesheet_header_id` nullable on settlement · app assert **closed** before `status→posted` · **`HRM-PAY-ATT-412`** |
| **Static plane (O8/O10 · DV-14)** | **must_keep PAY04/05/06** — GTCG/SI/TNCN **once** on payslip header · **0** static on split segments |
| **Settlement lifecycle (O11)** | **draft → ready → posted** · optional **cancelled** · **cấm** **posted → draft** (void = **PAY-08** · **O22 HOLD**) |
| **Leave hold** | **DENY invent** **`att_leave_hold`** · **`pending_days`** only (**ATT09QC1**) |
| **This seat** | Docs only — **NO** `apps/**` · **NO** seed · **NO** migrate governance seat |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical GĐ1 LIVE / proposed | Action |
|-----------------|------------------------------|--------|
| `pay_termination_settlement` | **`public.pay_termination_settlement`** | **ADD stamp** §6.1 |
| `pay_payslip.is_final_pay` | **`public.payroll_payslips.is_final_pay`** | **ADD stamp** §6.2 |
| `pay_payslip.termination_settlement_id` | **`public.payroll_payslips.termination_settlement_id`** | **ADD stamp** §6.2 |
| `pay_termination_settlement.final_payslip_id` | same table col | **ADD stamp** §6.1 |
| `pay_termination_settlement.termination_id` | soft → `hrm_termination` **or** O3 surrogate | **ADD stamp** §6.1 · **O3** §4.3 |
| `hrm_termination` | — | **HOLD** §4.2 |
| `hrm_termination.final_settlement_id` | — | **HOLD** §4.2 |
| `payroll_period_id` (paper) | **`period_id`** on payslip · **`payroll_period_id`** on settlement (proposed col name align paper) | **RETAIN** payslip alias · settlement uses **`payroll_period_id`** per paper |
| `pay_payslip` grain | **`public.payroll_payslips`** + UQ | **HOLD RETAIN** (**DV-13**) |
| Paper `att_leave_hold` | **`employee_leave_balances.pending_days`** | **DENY dual table** |

```text
  PAY-01..06 SEALED (must_keep PAY01QC1..PAY06QC1): §4.2 process order on final run
  PAY-04 (must_keep): mid-month termination_date → split segments · DV-14 static on header only
  CORE-06 READ (CORE06QC1): asset_checklist_ack signal — ≠ PAY asset return API
  CORE-10 READ (CORE10QC1): si_cutoff_done — ≠ PAY POST insurance stop
  ATT-05 OUT: leave cashout inputs via formula vars — ≠ PAY mutate balance

  O3 SOFT TERM (GĐ1):
    termination_id on settlement = opaque UUID
      path A (future): hrm_termination.id when CORE table LIVE
      path B (GĐ1 now): surrogate from employee resigned + termination_date + optional hrd_02 decision id
    HOLD: physical hrm_termination DDL + final_settlement_id back-pointer (CORE program)

  ┌──────── FR-UC-BP-PAY-07 DATA stamp ────────────────────────────────┐
  │  public.pay_termination_settlement (ADD §6.1 — NOT LIVE)            │
  │       checklist flags · lifecycle draft→ready→posted                │
  │       NO manual payout amount columns (formula → payslip lines)      │
  │       termination_id (soft TERM O3) · employee_id · company_id       │
  │       payroll_period_id · timesheet_header_id (closed assert)        │
  │       final_payslip_id ↔ payslip.termination_settlement_id          │
  │                                                                      │
  │  public.payroll_payslips (RETAIN + ADD §6.2)                         │
  │       is_final_pay · termination_settlement_id                       │
  │       FORBIDDEN: second net row per split (DV-13)                    │
  └──────────────────────────────────────────────────────────────────────┘
        must_keep closed sheet before posted · static once on header · DENY att_leave_hold
```

**Label lock:** Wave-43 PAY-07 GĐ1 DATA = **stamped closable** settlement audit table + **final payslip link cols** + **O3 soft TERM** semantics — **not** F-PAY-TERM-SETTLE-01 runtime DONE · **not** full `hrm_termination` CORE DDL · **C-SLICE**.  
**Honesty lock:** `payroll_e2e_ready=false` · **≠ PAY-07 / FR-PAY-07 module UAT**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-07 / FR-UC-BP-PAY-07 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠** full hire→termination→payslip browser e2e  
> must_keep **`PAY01QC1-MSMBGWC1`** … **`PAY06QC1-MSMECGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`CORE06QC1-MSLID363`** · **`CORE10QC1-MSLP0EJB`**  
> settlement ADD stamp **necessary not sufficient** · **F-PAY-TERM-SETTLE-01** consumer **ABSENT** until Dev after API stamp  
> **O3 soft TERM** documented · **HOLD** `hrm_termination` physical · DENY manual payout cols · DENY PAY mutate CORE/ATT pillars  
> DENY `att_leave_hold` · DENY merge buckets · no seed · no apps/**

---

## 3. AS-IS baseline (physical — read-only cite · 2026-08-10)

| Object | AS-IS LIVE | Gap (Wave-43 DATA) |
|--------|------------|---------------------|
| **`public.pay_termination_settlement`** | grep CREATE **0** | **ADD** §6.1 stamp |
| **`public.payroll_payslips`** | ensureSchema · no `is_final_pay` / `termination_settlement_id` | **ADD** §6.2 stamp |
| **`public.hrm_termination`** | **ABSENT** | **HOLD** §4.2 — CORE program |
| **F-PAY-TERM-SETTLE-01** | route **ABSENT** | **GAP** dev-be after API |
| **`processPayrollPeriod`** | LIVE (**≠ PAY-07 DONE**) | **must_keep RETAIN** host |
| **Peer PAY-01..06 cols** | partial LIVE per PAY-03/05/06 stamps | **must_keep RETAIN** |
| **`att_leave_hold`** | **ABSENT** | **DENY invent** |

---

## 4. HOLD / residual dispositions

### 4.1 `hrm_termination` physical — **HOLD** (not closable this seat)

| Physical / rule | Ruling |
|-----------------|--------|
| Paper **`hrm_termination`** (§3.10) | **HOLD** — table **not** in LIVE payroll/CORE migrate path GĐ1 PAY-07 slice |
| **`final_settlement_id`** on termination row | **HOLD** — back-pointer when CORE implements **F-CORE-TERM-01** · until then settlement **`termination_id`** is **forward-only** soft link |
| **`asset_checklist_closed`** on termination | **HOLD** — CORE-06 **`asset_checklist_ack`** on **settlement row** is PAY audit snapshot (**O4**) |
| **FAIL** | PAY migration inventing full CORE termination schema as payroll-owned SoT |

### 4.2 O3 — **soft TERM** (normative data semantics)

| Topic | Ruling |
|-------|--------|
| **Purpose** | Allow **FR-UC-BP-PAY-07** settlement row when CORE lệnh nghỉ UI / physical `hrm_termination` **ABSENT** |
| **`termination_id` column** | **NOT NULL** `UUID` on settlement — stores **case pointer** not necessarily FK to existing row |
| **GĐ1 resolution inputs** | `employee.status` = resigned (or equivalent) · `termination_date` within final `payroll_period` · optional link `hr_decisions.id` where workflow type **`hrd_02`** (termination) — cite LIVE WH mapping only |
| **Surrogate generation** | **App-owned** stable UUID per (`company_id`, `employee_id`, `termination_date`, optional `decision_id`) — document in API-01 · **cấm** NULL `termination_id` on posted settlement |
| **Future CORE** | When `hrm_termination` LIVE → **same col** may FK `hrm_termination.id` · migrate backfill optional · **`final_settlement_id`** on termination becomes inverse link (**HOLD** until CORE) |
| **AC hook** | **AC-PAY-TERM-SOFT-CASE** · **J-HRM-PAY-07-01** |
| **FAIL** | Require `hrm_termination` row for GĐ1 INSERT · invent `/api/core/termination` payroll dual writer |

### 4.3 Peer seals — **must_keep**

| Stamp | Ruling |
|-------|--------|
| **`PAY01QC1-MSMBGWC1`** | RETAIN closed-sheet · **412** before final post |
| **`PAY02QC1-MSMC4GWC1`** | RETAIN formula · term lines via **`required_vars_json`** only |
| **`PAY03QC1-MSMDDGWC1`** | RETAIN GTCG once on final header |
| **`PAY04QC1-MSMCR4GWC1`** | RETAIN mid-month split · **DV-14** |
| **`PAY05QC1-MSMDU2GWC1`** | RETAIN SI once final period |
| **`PAY06QC1-MSMECGWC1`** | RETAIN TNCN once on merged header |
| **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** | RETAIN closed sheet peer |
| **`CORE06QC1-MSLID363`** | READ asset ack · **≠** PAY return API |
| **`CORE10QC1-MSLP0EJB`** | READ SI cutoff · **≠** PAY cut BH |
| Reopen sealed J-PAY-01..06 | **DENY** without regression bus |

### 4.4 Rejected ADD / DENY

| Object | Verdict |
|--------|---------|
| `leave_cashout_vnd` / `severance_vnd` / `manual_payout_*` on settlement | **DENY** — **O14** · amounts on **`payroll_payslip_lines`** via formula only |
| `hrm_termination` CREATE this seat | **DENY** — **HOLD** CORE |
| `att_leave_hold` | **DENY** |
| Static GTCG/SI/TNCN on settlement row | **DENY** — header payslip only (**DV-14**) |
| Second payslip per period for termination | **DENY** — **DV-13** |
| Claim process API LIVE = PAY-07 DONE | **DENY** — **O18** |
| Flip `payroll_e2e_ready` | **DENY** |

---

## 5. Validation matrix (data integrity)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-PAY-07-DATA-01** | Settlement row with manual payout amount columns | **O14** | **FAIL** schema review |
| **VAL-PAY-07-DATA-02** | `posted` settlement without closed `timesheet_header_id` when period has workdays | **O2** · **DV-09** | **412** `HRM-PAY-ATT-412` |
| **VAL-PAY-07-DATA-03** | `posted→draft` on settlement | **O11** · §5.11 | **FAIL** / **409** without PAY-08 |
| **VAL-PAY-07-DATA-04** | `is_final_pay=true` payslip without `termination_settlement_id` when settlement posted | **O12** | **FAIL** QA |
| **VAL-PAY-07-DATA-05** | `termination_settlement_id` on payslip points to wrong `employee_id` | FK/app guard | **409** |
| **VAL-PAY-07-DATA-06** | Mandatory checklist false at post | **O13** | **409** `HRM-PAY-TERM-409` |
| **VAL-PAY-07-DATA-07** | GTCG/SI/TNCN stored on settlement or segment for termination run | **DV-14** · **O8/O10** | **FAIL** |
| **VAL-PAY-07-DATA-08** | `termination_id` NULL on posted settlement | **O3** | **FAIL** |
| **VAL-PAY-07-DATA-09** | Invent `att_leave_hold` | grep | **FAIL** |
| **VAL-PAY-07-DATA-10** | Claim DATA stamp = PAY-07 DONE | honesty | **FAIL** |
| **VAL-PAY-07-DATA-11** | `company_id` list ≠ detail on settlement/payslip | **U19** scope_parity | Same resolver as payroll list/get |

---

## 6. Stamped ADD (closable — not LIVE · no migrate this seat)

> **BA-data stamp (2026-08-10):** SA Option A + BA O1–O22 — settlement table + final payslip flags **closable** (ABSENT LIVE). **O3 soft TERM** documented. **`hrm_termination` HOLD**. **Dev-be** migrates only after **sa API-01** F.1 + program waiver. **Governance seat:** stamp only.

### 6.1 Settlement — **`pay_termination_settlement`** (**R-PAY-07-SETTLE**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK |
| `company_id` | `TEXT` | NO | — | Scope (**U19**) |
| `termination_id` | `UUID` | NO | — | **O3** soft TERM pointer (§4.2) |
| `employee_id` | `UUID` | NO | — | NV final period |
| `payroll_period_id` | `UUID` | YES | — | FK → `payroll_periods(id)` final kỳ |
| `final_payslip_id` | `UUID` | YES | — | FK → `payroll_payslips(id)` when `is_final_pay=true` |
| `timesheet_header_id` | `UUID` | YES | — | Closed sheet ref · assert closed before **posted** |
| `si_cutoff_done` | `BOOLEAN` | NO | `false` | Snapshot at post · read CORE-10 |
| `leave_cashout_done` | `BOOLEAN` | NO | `false` | Snapshot · **≠** mutate ATT balance |
| `asset_checklist_ack` | `BOOLEAN` | NO | `false` | Snapshot · read CORE-06 signal |
| `reward_discipline_included` | `BOOLEAN` | NO | `false` | Snapshot · CORE-08 peer |
| `status` | `TEXT` | NO | `'draft'` | `draft` \| `ready` \| `posted` \| `cancelled` |
| `archived_at` | `TIMESTAMPTZ` | YES | — | Soft archive policy |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | NO | `NOW()` | Audit |

| Index (proposed) | Columns |
|------------------|---------|
| **IX** | `(company_id, employee_id, status)` |
| **IX** | `(payroll_period_id, employee_id)` |
| **UQ (active)** | `(company_id, employee_id, payroll_period_id)` WHERE `status IN ('draft','ready','posted')` AND `archived_at IS NULL` — **one** open settlement per NV per final period |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — table **ABSENT** · greenfield |
| Closable **this** seat? | **NO migrate** — stamp only |
| Payout amounts | **FORBIDDEN** on this table — **AC-PAY-TERM-DENY-MANUAL** |
| Unlock | **AC-PAY-TERM-LIFECYCLE** · **AC-PAY-TERM-SOFT-CASE** · **J-HRM-PAY-07-03/04** |

**Paper alias:** logical `pay_termination_settlement` → physical **`public.pay_termination_settlement`**.

**Proposed migration sketch (dev-be — not this seat):**

```sql
CREATE TABLE IF NOT EXISTS public.pay_termination_settlement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  termination_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  payroll_period_id UUID NULL REFERENCES public.payroll_periods(id) ON DELETE RESTRICT,
  final_payslip_id UUID NULL,
  timesheet_header_id UUID NULL,
  si_cutoff_done BOOLEAN NOT NULL DEFAULT false,
  leave_cashout_done BOOLEAN NOT NULL DEFAULT false,
  asset_checklist_ack BOOLEAN NOT NULL DEFAULT false,
  reward_discipline_included BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_pay_term_settle_status CHECK (
    status IN ('draft', 'ready', 'posted', 'cancelled')
  )
);
-- FK final_payslip_id → payroll_payslips(id) added after payslip row exists (deferrable app pattern)
CREATE INDEX IF NOT EXISTS ix_pay_term_settle_co_emp_st
  ON public.pay_termination_settlement (company_id, employee_id, status);
```

### 6.2 Payslip header — **`is_final_pay`** + **`termination_settlement_id`** (**R-PAY-07-FINAL-PAYSLIP**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `is_final_pay` | `BOOLEAN` | NO | `false` | **true** only kỳ tất toán nghỉ (**O12**) |
| `termination_settlement_id` | `UUID` | YES | NULL | FK → `pay_termination_settlement(id)` |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — cols **ABSENT** in `payroll.service.ts` ensureSchema |
| Bidirectional link | On post: set `settlement.final_payslip_id` **and** `payslip.termination_settlement_id` **and** `is_final_pay=true` in one transaction |
| **FAIL** | `is_final_pay=true` without settlement link on termination path |

**Paper alias:** logical `pay_payslip.is_final_pay` / `termination_settlement_id` → physical **`payroll_payslips.*`**.

**Proposed migration sketch (dev-be — not this seat):**

```sql
ALTER TABLE public.payroll_payslips
  ADD COLUMN IF NOT EXISTS is_final_pay BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.payroll_payslips
  ADD COLUMN IF NOT EXISTS termination_settlement_id UUID NULL;
-- Optional FK after pay_termination_settlement exists:
-- REFERENCES public.pay_termination_settlement(id) ON DELETE RESTRICT
```

### 6.3 HOLD waiver — unchanged / deferred

| Residual | Waiver | Owner |
|----------|--------|-------|
| **`hrm_termination` DDL** | **HOLD** CORE program | **sa** CORE wave · **O3** soft path until then |
| **`hrm_termination.final_settlement_id`** | **HOLD** back-pointer | CORE + optional later ALTER |
| **R-PAY-07-SETTLE-BE** | Runtime writer **ABSENT** | **dev-be** after API |
| **H-PAY-07-VOID** | Posted adjust | **PAY-08** · **O22** |
| **H-PAY-07-FORMULA-DEPTH** | Full severance matrix | **O19** GĐ2 |

---

## 7. Lifecycle

### 7.1 `pay_termination_settlement.status` (ADD)

| From | To | Valid when |
|------|-----|------------|
| `draft` | `ready` | Checklist preview complete · no mandatory 409 |
| `ready` | `posted` | Closed sheet (**DV-09**) · checklist policy satisfied · final process bind scheduled/done |
| `draft` / `ready` | `cancelled` | User cancel before post |
| `posted` | `draft` | **INVALID** — use **PAY-08** void path (**O22 HOLD**) |

### 7.2 `payroll_payslips.is_final_pay` (ADD)

| State | Meaning | Transition |
|-------|---------|------------|
| `false` | Regular period payslip | default |
| `true` | Final termination payslip | set on successful final process + settlement **posted** link |

---

## 8. scope_parity (U19)

| Surface | Resolver | Parity rule |
|---------|----------|-------------|
| Settlement list/get | Same `company_id` / membership ladder as payroll periods | **J-HRM-PAY-07-06** list→detail |
| Payslip list/get `is_final_pay` | Same as existing payslip scope | **J-HRM-PAY-07-04** · **F5** |
| Soft TERM resolve | Employee in scope | **≠** cross-company rollup without ADR (**O21 HOLD**) |

Trace: **J-HRM-PAY-07-01..08** (DRAFT mint BA-01) · regression **J-HRM-PAY-01..06** subsets per BA-01 §4.1.

---

## 9. Traceability (SRS → DB → API → FE → test)

| BR/AC | Physical | API (GAP/RETAIN) | FE / J-* | Evidence |
|-------|----------|------------------|----------|----------|
| **O2** Closed sheet | `timesheet_header_id` | **HRM-PAY-ATT-412 RETAIN** | **J-07-02** | **PAY01QC1** |
| **O3** Soft TERM | `termination_id` §4.2 | **F-PAY-TERM-SETTLE GAP** | **J-07-01** | HOLD CORE UI |
| **O4–O7** Checklist | flag cols §6.1 | read peers GAP | **J-07-01** | CORE06/10 · ATT |
| **O8** Mid-month | split segments RETAIN | **F-PAY-SPLIT-01** | **J-07-07** | **PAY04QC1** |
| **O9–O10** SI/TNCN | payslip header RETAIN | PAY05/06 BIND | **J-07-04** | static once |
| **O11** Lifecycle | `status` §7.1 | settle GAP | **J-07-03** | |
| **O12** Final payslip | §6.2 cols | process GAP | **J-07-04** | F5 |
| **O13** 409 | flags at post | **HRM-PAY-TERM-409 GAP** | **J-07-05** | |
| **O14** DENY manual | no payout cols | **403 GAP** | **J-07-05** | |
| **O15** Display | GET projection | display-ready GAP | **J-07-06** | vi-VN |
| Diễn biến **#1–#2** | settlement | **F-PAY-TERM-SETTLE-01** | **J-07-03** | U65 |
| Thành công | final pay | **F-PAY-PROCESS-01 RETAIN** | **J-07-04** | |

---

## 10. Data interaction matrix (PAY-07 slice)

| Entity | Create | Read | Update | Delete/Archive | PAY-07 seat |
|--------|--------|------|--------|----------------|-------------|
| `pay_termination_settlement` | settle orchestration | list/get preview | draft→ready→posted | cancel / archive | **ADD stamp** |
| `payroll_payslips` | process upsert | list/get | set `is_final_pay` + link | policy | **ADD cols** |
| `payroll_payslip_lines` | formula eval | get | re-process | — | **RETAIN** · severance/leave lines |
| `payroll_payslip_split_segments` | PAY-04 | get | — | — | **DV-14** RETAIN |
| `hrm_termination` | CORE program | — | — | — | **HOLD** |
| `employee` / `hr_decisions` | CORE | soft TERM read | — | — | **O3** read only |
| CORE-06/10/08 assets/SI/RD | pillar owners | PAY read flags | — | — | **READ only** |
| ATT leave balances | ATT | display for formula | **DENY** PAY PATCH | — | **O6** |
| `att_leave_hold` | — | — | — | — | **DENY** |

---

## 11. Deterministic error mapping (data-related)

| Code / condition | When | HTTP | Data note |
|------------------|------|------|-----------|
| **`HRM-PAY-TERM-409`** | Mandatory checklist false at post | **409** | `reason_code` ASSET_OPEN / SI_CUTOFF_OPEN / LEAVE_CASHOUT_OPEN / RD_PENDING |
| **`HRM-PAY-ATT-412`** (peer) | No closed sheet | **412** | **VAL-PAY-07-DATA-02** |
| **`HRM-PAY-TERM-403`** (proposed) | Body manual payout override | **403** | **O14** |
| **posted→draft** settlement | PATCH status | **409** | **VAL-PAY-07-DATA-03** |
| Invent **`att_leave_hold`** | migration | — | **process defect** |
| Per-segment static on termination | segment row | — | **DV-14 defect** |

---

## 12. Closability analysis (exit gate)

| Candidate ADD | Closable? | Verdict |
|---------------|-----------|---------|
| **`pay_termination_settlement`** table | **YES** — ABSENT LIVE | **ADD stamp** §6.1 |
| **`payroll_payslips.is_final_pay`** | **YES** — col ABSENT | **ADD stamp** §6.2 |
| **`payroll_payslips.termination_settlement_id`** | **YES** — col ABSENT | **ADD stamp** §6.2 |
| **`hrm_termination`** | **NO** this seat | **HOLD** §4.1 |
| Manual payout cols on settlement | **NO** | **DENY** |
| `att_leave_hold` | **NO** | **DENY** |

---

## 13. Unlock next

| Field | Value |
|-------|--------|
| **next_owner** | **sa** (API-01 cluster) · **pm** orchestration |
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01` |
| **Mission** | F.1 deepen **F-PAY-TERM-SETTLE-01** · settle SoT xor process flag · **O3** soft TERM contract · **HRM-PAY-TERM-409** · display-ready checklist · bind SA §4.2 · cite §6.1–6.2 physical cols · **must_keep** **PAY01QC1..PAY06QC1** · **DENY** PAY mutate CORE/ATT |

---

## 14. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §15 |
| **next_owner** | `sa` · `pm` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-DATA-01.md` |

---

## 15. completion_report

**Closed:** ba-data **CONFIRMED ADD stamp** for UC-BP-PAY-07 / FR-UC-BP-PAY-07 / BR-BP-TERM-01 / REQ_L_002 against SA Option A + BA O1–O22 — **stamped closable** **`public.pay_termination_settlement`** (paper §5.10 · checklist flags only · **no** manual payout cols); **stamped closable** **`payroll_payslips.is_final_pay`** + **`termination_settlement_id`** (paper §5.6); **O3 soft TERM** documented (`termination_id` opaque · resigned + `termination_date` + optional `hrd_02` · **cấm** require physical `hrm_termination` GĐ1); **HOLD** physical **`hrm_termination`** + **`final_settlement_id`** (CORE program); lifecycle **draft→ready→posted** · **cấm posted→draft**; validation + scope parity + traceability; **must_keep** **`PAY01QC1-MSMBGWC1`** … **`PAY06QC1-MSMECGWC1`** + **`ATT12QC1-MSMAIGWC1`** + **`ATT11QC1-MSLXTH9P`** + **`CORE06QC1-MSLID363`** + **`CORE10QC1-MSLP0EJB`**; **`payroll_e2e_ready=false`** · **≠ PAY-07 DONE** · **C-SLICE**; docs-only · no `apps/**` · no seed · no migrate this seat.

**Residual open (not DATA migrate this seat):** sa **API-01** F.1 · dev-be settlement upsert + 409 + final payslip bind + O3 resolver · dev-fe checklist display · qa **J-HRM-PAY-07-*** · QC GWC · CORE **`hrm_termination`** · **O20–O22** footers · **PAY-08** void.

---

## 16. next_dispatch_prompt (copy-ready — sa API-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01
role: sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-43 seat #48)
lane: governance · F.1 deepen · UC-BP-PAY-07 · FR-UC-BP-PAY-07 · BR-BP-TERM-01
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-SA-01.md (§4.2 order · R-PAY-07-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01.md (O1–O22 · AC-PAY-TERM-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-DATA-01.md (§6.1 settlement · §6.2 is_final_pay · §4.2 O3 soft TERM · HOLD hrm_termination)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md (process order extend)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-TERM-SETTLE-01 · F-PAY-PROCESS-01
entry_criteria: ba-data DATA-01 PASS_TO_PM CONFIRMED ADD stamp · must_keep PAY01QC1..PAY06QC1 + ATT11/12 + CORE06/10 · payroll_e2e_ready=false · U65
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md
  - F.1: F-PAY-TERM-SETTLE-01 · settle SoT xor process flag · O3 soft TERM API contract · HRM-PAY-TERM-409 · display-ready checklist
  - Mục đích · Nghiệp vụ xử lý · Tham chiếu SRS FR-UC-BP-PAY-07 Diễn biến #1–#2
  - ack_status PASS_TO_PM unlock dev-be
cấm: apps/** · PAY mutate CORE/ATT · honesty flip · reorder PAY pipeline · reopen PAY seals · seed
```
