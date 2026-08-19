# PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01 — Physical DB · payroll_link on LIVE dual rewards + discipline (Option A · O5)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-12 seat **#14**) |
| **lane** | governance · ba-data |
| **change_mode** | **RETAIN** LIVE dual `employee_rewards` + `employee_discipline` · **ADD** `payroll_link_status` + soft `payroll_period_id` (+ optional audit) on **both** · **DOC-DELTA** paper §3.7 alias · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — physical O5 link cols + execution↔LIVE status residual map · SA Option A · BA O1–O12 |
| **uc_ids** | `UC-BP-CORE-08` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · Wave-11 CORE-02 **SEALED** stamp **`CORE02QC1-MSL80DU6`** |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01.md) · **O1/O2/O3/O4/O5/O6/O7/O8/O9/O10** · AC-CORE-08-* · VAL-CORE-RD-* · **BR-BP-RD-01** |
| **ref_core02_data** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md) — packages/eins · CB-403 · Nest `/core` DENY · **≠ pillar DONE** |
| **ref_core01_data** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md) — public strip · **≠ RD/C&B DONE** |
| **ref_paper_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) **§3.7** `hrm_reward_discipline` · soft `payroll_period_id` / `payslip_id` · **§5.9** `pay_reward_link` optional PAY-side · dual LIVE **RETAIN GĐ1** |
| **ref_paper_api** | **F-CORE-RD-01** UPGRADE residual · **F-PAY-RD-APPLY-01** peer **OUT invent** · physical `/employees/:id/rewards*` + `/discipline*` · paper `/core/reward-discipline` = **alias only** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-08** · **BR-BP-RD-01** · partner **HR-005** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel / CORE module UAT **false** · **C-SLICE** · U65 · **DENY** claim CORE-02 packages = CORE pillar DONE · **DENY** claim note-CRUD = FR-08 DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| RD physical SoT GĐ1 | **TWO** LIVE tables **`public.employee_rewards`** + **`public.employee_discipline`** — **RETAIN dual** · **DENY** silent wipe / abandon for greenfield `hrm_reward_discipline` without migrate plan |
| Paper §3.7 alias | `hrm_reward_discipline` (`kind=reward\|discipline`) ↔ **union of dual tables** — logical paper entity · **not** mandatory second physical SoT this seat |
| Payroll link cols | **ADD** on **both** tables: `payroll_link_status` · soft `payroll_period_id` (+ optional audit / soft-delete) |
| Link enum | **`none` \| `pending_period` \| `linked` \| `executed`** — CHK / DTO ceiling |
| Period soft target | Soft UUID → LIVE **`public.payroll_periods`** (open / adjust unlocked for enforce) — **DENY** invent period process |
| PAY-side link table | Paper **§5.9** `pay_reward_link` = **optional PAY audit** — **DENY** invent as **mandatory** CORE SoT / dual-write SoT this seat |
| Payslip cols | Soft `payslip_id` **optional audit pointer only** (PAY owns write) — **DENY** `payslip_line*` / amount dual-write cols on CORE RD tables as SoT |
| Execution status | **RETAIN** LIVE `status` column · **map** Chờ/Đang/Đã/Hủy ↔ residual `pending`/`approved`/`active`/`completed` (+ **ADD** `cancelled`) — **DENY** silent vocabulary wipe without bridge |
| Nest path | Physical **`/api/hrm/employees/:id/rewards*`** + **`/discipline*`** · paper `/api/hrm/core/reward-discipline` = **alias only** |
| Decisions | Soft `decision_number` OK · **`/api/hrm/decisions*` ≠ RD payroll SoT** |
| CORE-02 / CORE-01 | **must_keep** packages\|eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · public strip · Nest `/core` DENY · stamps **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-02-* / J-HRM-CORE-01-* **PASS RETAIN** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen sealed J-CORE-02/01 · **NO** claim note-CRUD = FR-08 DONE |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `hrm_reward_discipline` | **`employee_rewards` ∪ `employee_discipline`** | **RETAIN dual** GĐ1 |
| `kind=reward` | row in **`employee_rewards`** | **RETAIN** |
| `kind=discipline` | row in **`employee_discipline`** | **RETAIN** |
| `title` | `title` NOT NULL both | **RETAIN** |
| `amount` | rewards.`amount` · discipline.`penalty_amount` | **RETAIN** · amount>0 → period |
| `decision_date` / dates | `reward_date` · `discipline_date` (+ effective_*) | **RETAIN** |
| `decision_number` | soft text both | **RETAIN** · ≠ decisions SoT |
| `status` (paper draft\|approved\|cancelled) | LIVE `status` + **execution map §5** | **UPGRADE map** · no wipe |
| `payroll_link_status` | **ADD** both | **ADD** |
| `payroll_period_id` | **ADD** soft → `payroll_periods` | **ADD** |
| `payroll_period_ref` | optional display text both | **ADD** nullable (optional) |
| `payslip_id` | optional soft audit both | **ADD** nullable optional · **PAY owns** set `executed` path |
| `archived_at` | soft-delete both | **ADD** preferred (replace hard DELETE residual) |
| `pay_reward_link` §5.9 | PAY optional table | **DENY** mandatory CORE · OUT invent this seat |
| `/api/hrm/core/reward-discipline` | rewards* + discipline* | **Alias only** — API seat |

```text
  employees (LIVE — public ring SEALED CORE-01)
        RETAIN strip · HRM-CORE-CB-403 · DENY grow RD money into public GET
                │
                ├──1-N── employee_rewards (RETAIN + ADD link cols)
                │         title · reward_type · amount · decision_number ·
                │         status (execution map) · reward_date · notes ·
                │         ADD: payroll_link_status · payroll_period_id ·
                │              payroll_period_ref? · payslip_id? · archived_at? ·
                │              enforced_at/by? · cancelled_at/by?
                │
                └──1-N── employee_discipline (RETAIN + ADD same link family)
                          title · discipline_type · penalty_amount · …
                          ADD: same payroll_link_* family

  payroll_periods (LIVE — soft target RETAIN)
        Soft pointer only · open/adjust unlocked for enforce
        DENY: invent pay process / payslip_line on CORE tables

  hr_decisions / /decisions* (RETAIN peer)
        Soft decision_number ref OK · DENY fold RD SoT

  employee_compensation_packages | employee_insurances (CORE-02 SEALED)
        must_keep · ≠ CORE pillar DONE · ≠ this RD SoT

  FORBIDDEN GĐ1 default:
        CREATE hrm_reward_discipline AS sole SoT + DROP dual
        Nest /core dual RD table/controller SoT
        Mandatory pay_reward_link on CORE path
```

**Label lock:** «KT/KL GĐ1» = dual LIVE rewards + discipline + link cols — **not** greenfield unified table alone.  
**Spine lock:** Physical mutate on `/employees/:id/rewards*` + `/discipline*` — **DENY** Nest `/core` dual.  
**Link lock:** Soft period on case row — **DENY** payslip_line invent on CORE.  
**Paper lock:** §3.7 = alias map · §5.9 = PAY optional peer.

---

## 3. AS-IS baseline (Nest facts — read-only)

| Object | AS-IS | Gap (Wave-12 O5) |
|--------|-------|------------------|
| `employee_rewards` | ensureSchema: `id · employee_id · company_id · reward_date · reward_type · title · description · decision_number · amount DEFAULT 0 · issued_by · status DEFAULT 'active' · notes · created_at/updated_at` | **ADD** link cols · status vocabulary bridge · soft archive residual |
| `employee_discipline` | ensureSchema: `… · discipline_date · discipline_type · title · … · penalty_amount DEFAULT 0 · effective_from/to · status DEFAULT 'active' · …` | **ADD** same link family |
| Link / period | **ABSENT** | **ADD** `payroll_link_status` + `payroll_period_id` |
| Enforce / cancel | Soft CRUD status / **hard DELETE** | API ADD enforce · cancel-on-unlocked · prefer soft `archived_at` / `cancelled` |
| FE status labels | `pending` · `approved` · `completed` · `active` | Map ↔ Chờ/Đang/Đã · **ADD** `cancelled` for Hủy |
| Default create | rewards often `approved` FE · discipline `active` · DB default `active` | Align create → Chờ/`pending` + link `none`/`pending_period` (API residual) |
| Paper `/core/reward-discipline` | **ABSENT** as Nest SoT | Alias only |
| `hrm_reward_discipline` physical | **ABSENT** | **DENY** greenfield wipe dual |
| `pay_reward_link` | **ABSENT** / optional paper | **DENY** mandatory CORE |
| Period catalog | LIVE `payroll_periods` | Soft target **RETAIN** |
| CORE-02 / CORE-01 | SEALED | **must_keep** |
| Source | `employee-profile.service.ts` ensureSchema + CRUD · FE `EmployeeRewardsDiscipline` | Dev after API CONFIRMED |

**FORBIDDEN invent this seat:** Nest `/core` RD SoT · second unified table wipe dual · mandatory `pay_reward_link` · payslip_line cols on CORE · fold into `/decisions` · seed · honesty flip · apps/** · claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE · reopen J-CORE-02/01.

---

## 4. ADD — payroll link columns (O5 — normative · both tables)

### 4.1 Columns (identical semantics on rewards **and** discipline)

| Cột | Kiểu | Null | Default | Ý nghĩa | Maps |
|-----|------|------|---------|----------|------|
| **`payroll_link_status`** | text | NO | `'none'` | Link lifecycle to PAY period | §3.7 · O2/O4/O5 |
| **`payroll_period_id`** | uuid | YES | NULL | Soft → `payroll_periods.id` | §3.7 · O6 · BR-BP-RD-01 |
| **`payroll_period_ref`** | text | YES | NULL | Display/legacy period label | §3.7 optional |
| **`payslip_id`** | uuid | YES | NULL | Soft audit → payslip after PAY apply | §3.7 · **PAY owns** write |
| **`archived_at`** | timestamptz | YES | NULL | Soft-delete / supersede | soft-delete doctrine |
| **`enforced_at`** | timestamptz | YES | NULL | Optional audit when enforce | O3 |
| **`enforced_by`** | text | YES | NULL | Optional actor audit | O3 |
| **`cancelled_at`** | timestamptz | YES | NULL | Optional cancel audit | O3 |
| **`cancelled_by`** | text | YES | NULL | Optional actor audit | O3 |
| **`link_updated_at`** | timestamptz | YES | NULL | Optional last link transition | observability |

**Minimum ship set (non-negotiable):** `payroll_link_status` + `payroll_period_id` on **both** tables.  
**Recommended GĐ1:** + `archived_at` (exit hard DELETE) + `payroll_period_ref`.  
**Optional:** payslip_id + enforce/cancel audit — **not** payslip_line columns.

### 4.2 CHK / enum — `payroll_link_status`

| Value | Meaning | Typical execution | PAY filter |
|-------|---------|-------------------|------------|
| **`none`** | No money period / note-only / unlinked cancel | Chờ (note) **or** Hủy | **EXCLUDE** |
| **`pending_period`** | Has target period · not yet enforced | Chờ | **EXCLUDE** until enforce |
| **`linked`** | Enforced · available for PAY apply read | Đang / Đã (pre-apply) | **INCLUDE** (amount>0 + period match) |
| **`executed`** | PAY applied (peer) — CORE **MAY** observe | Đã thi hành | **INCLUDE** · set primarily by PAY peer |

**Invariant CORE-RD-LINK-ENUM:** Values outside `{none,pending_period,linked,executed}` → **FAIL** VAL/CHK.

**Invariant CORE-RD-NOTE:** `amount`/`penalty_amount` null/0 **and** `payroll_period_id` NULL → `payroll_link_status=none` → **not** PAY-visible.

**Invariant CORE-RD-AMOUNT-PERIOD:** amount>0 → `payroll_period_id` NOT NULL (create and/or enforce) · missing → **400/409** · **not** silent 2xx.

**Invariant CORE-RD-ENFORCE-LINK:** Enforce with amount>0 → status Đang/Đã + `payroll_link_status ∈ {linked,executed}` + period bound.

**Invariant CORE-RD-CANCEL-UNLOCK:** Cancel on unlocked period → unlink to `none`/`pending_period` or execution Hủy · gone from open PAY filter.

**Invariant CORE-RD-LOCKED:** Period locked → deny mutate affecting locked payslip → **409**.

**Invariant CORE-RD-DUAL-PERIOD:** One case → two open/adjust periods → **409** (**BR-BP-RD-01**).

**Invariant CORE-RD-SOFT-PERIOD:** `payroll_period_id` is **soft** pointer — **no** hard FK CASCADE that deletes RD when period archived; resolve existence + company scope in service (API).

**Invariant CORE-RD-NO-PAY-WRITE:** CORE **MUST NOT** invent `payslip_line` / dual-write amount onto payslip engine tables this seat.

**Invariant CORE-RD-NO-PAY-LINK-MANDATORY:** **DENY** requiring `pay_reward_link` row as CORE create/enforce SoT GĐ1 — soft cols on dual tables suffice; §5.9 remains PAY optional peer.

### 4.3 Soft target — `payroll_periods`

| Rule | Spec |
|------|------|
| Target table | LIVE **`public.payroll_periods`** |
| Enforce allow | Period status **open** or **adjust** (unlocked) — exact status vocabulary = payroll catalog SoT (API cite) |
| Invent id | Unknown / out-of-scope period → **404/VAL** |
| Display | Prefer join/DTO `payroll_period_ref` / period label display-ready — **no** FE invent period SoT |
| OUT | F-PAY-PROCESS-01 · payslip run invent |

### 4.4 Illustrative DDL (docs only — Dev after API)

```sql
-- BOTH tables — minimum + recommended
ALTER TABLE public.employee_rewards
  ADD COLUMN IF NOT EXISTS payroll_link_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS payroll_period_id UUID NULL,
  ADD COLUMN IF NOT EXISTS payroll_period_ref TEXT NULL,
  ADD COLUMN IF NOT EXISTS payslip_id UUID NULL,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS enforced_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS enforced_by TEXT NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS cancelled_by TEXT NULL,
  ADD COLUMN IF NOT EXISTS link_updated_at TIMESTAMPTZ NULL;

ALTER TABLE public.employee_discipline
  ADD COLUMN IF NOT EXISTS payroll_link_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS payroll_period_id UUID NULL,
  ADD COLUMN IF NOT EXISTS payroll_period_ref TEXT NULL,
  ADD COLUMN IF NOT EXISTS payslip_id UUID NULL,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS enforced_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS enforced_by TEXT NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS cancelled_by TEXT NULL,
  ADD COLUMN IF NOT EXISTS link_updated_at TIMESTAMPTZ NULL;

-- CHK (names illustrative)
ALTER TABLE public.employee_rewards
  ADD CONSTRAINT chk_employee_rewards_payroll_link_status
  CHECK (payroll_link_status IN ('none','pending_period','linked','executed'));

ALTER TABLE public.employee_discipline
  ADD CONSTRAINT chk_employee_discipline_payroll_link_status
  CHECK (payroll_link_status IN ('none','pending_period','linked','executed'));

CREATE INDEX IF NOT EXISTS ix_employee_rewards_payroll_period
  ON public.employee_rewards (payroll_period_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS ix_employee_discipline_payroll_period
  ON public.employee_discipline (payroll_period_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS ix_employee_rewards_link_status
  ON public.employee_rewards (company_id, payroll_link_status) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS ix_employee_discipline_link_status
  ON public.employee_discipline (company_id, payroll_link_status) WHERE archived_at IS NULL;

-- FORBIDDEN examples (must NOT ship as CORE-08 SoT):
-- DROP TABLE public.employee_rewards; DROP TABLE public.employee_discipline;
-- CREATE TABLE public.hrm_reward_discipline (…) AS sole SoT without migrate;
-- CREATE TABLE public.core_reward_discipline (…);  -- Nest /core dual
-- ALTER TABLE public.employee_rewards ADD COLUMN payslip_line_id … AS CORE write SoT;
-- REQUIRE pay_reward_link insert on every CORE enforce;
```

**Backfill (docs):** Existing rows → `payroll_link_status='none'` · `payroll_period_id=NULL` (note-CRUD residual ≠ FR-08 DONE). amount>0 legacy without period remains `none` until user/API attaches period — **DENY** silent auto-link invent.

---

## 5. Execution status map (LIVE residual ↔ SRS)

### 5.1 Normative map (RETAIN column `status`)

| UI / SRS | Logical `execution_status` (API mint OK) | LIVE residual values accepted | Typical `payroll_link_status` |
|----------|------------------------------------------|-------------------------------|-------------------------------|
| **Chờ** | `pending` | `pending` | `none` (note) **or** `pending_period` |
| **Đang thi hành** | `in_force` *(preferred mint)* | `approved` *(bridge)* · optionally early `active` | `linked` |
| **Đã thi hành** | `executed` | `completed` · `active` *(discipline residual default)* · `executed` | `linked` **or** `executed` (after PAY) |
| **Hủy** | `cancelled` | **`cancelled`** (**ADD** — AS-IS FE labels lack it) | `none` (unlinked) |

### 5.2 Bridge rules (DENY silent wipe)

| Rule ID | Rule |
|---------|------|
| **DV-CORE-RD-ST-01** | **RETAIN** physical column name `status` on both tables — **DENY** DROP/rename wipe without migrate |
| **DV-CORE-RD-ST-02** | Product transitions GĐ1 **SHOULD** write canonical `{pending,in_force,executed,cancelled}` after API lock — **MAY** accept residual read of `approved`/`active`/`completed` via **alias map** in serializer |
| **DV-CORE-RD-ST-03** | **DENY** mass UPDATE that forces all historical `active` → `executed` without business rule — backfill only with documented policy (default: leave residual; map on read) |
| **DV-CORE-RD-ST-04** | Create path residual: prefer **`pending` + link none/pending_period** — FE default `approved`/`active` = **impl_gap** for API/FE after DATA (not DONE claim) |
| **DV-CORE-RD-ST-05** | Hard `DELETE` AS-IS = residual — prefer **`archived_at`** or `cancelled` for product remove; hard delete **FORBIDDEN** when `payroll_link_status ∈ {linked,executed}` on locked period |
| **DV-CORE-RD-ST-06** | Unified ONE `hrm_reward_discipline` table **only** with migrate plan + dual→single ETL — **DENY** Option B wipe this seat |

### 5.3 Controlled unify (future — not this seat)

| Path | Allowed when |
|------|--------------|
| ADD `hrm_reward_discipline` + migrate dual → one | Explicit migrate WI + dual read/write window + QC — **not** silent DROP |
| GĐ1 default | **Dual RETAIN** + identical link cols |

---

## 6. FK / referential / scope rules

| Rule ID | Predicate | Outcome |
|---------|-----------|---------|
| **DV-CORE-RD-01** | Dual rewards + discipline = RD SoT GĐ1 | Wipe / sole greenfield `hrm_reward_discipline` → **FAIL O5** |
| **DV-CORE-RD-02** | Link cols on **both** tables | Missing on one side → **FAIL O5** |
| **DV-CORE-RD-03** | Soft `payroll_period_id` → `payroll_periods` | Hard CASCADE delete RD on period drop → **FAIL** |
| **DV-CORE-RD-04** | amount>0 ⇒ period | Persist without period → **FAIL** VAL |
| **DV-CORE-RD-05** | Note-only ⇒ `none` | Appears in PAY filter → **FAIL O4** |
| **DV-CORE-RD-06** | Dual open periods same case | **409** · **FAIL** if 2xx |
| **DV-CORE-RD-07** | Locked period mutate | **409** |
| **DV-CORE-RD-08** | list=get=enforce same scope | U19 `resolveHrmListScope` · cross-CT → **FAIL** |
| **DV-CORE-RD-09** | Nest `/core` RD SoT | **FAIL O1** |
| **DV-CORE-RD-10** | `/decisions*` as RD payroll SoT | **FAIL O7** |
| **DV-CORE-RD-11** | Mandatory `pay_reward_link` / payslip_line on CORE | **FAIL O8** |
| **DV-CORE-RD-12** | Claim CORE-02 = pillar DONE / note-CRUD = FR-08 DONE | **FAIL O9/O10** |
| **DV-CORE-RD-13** | Seed / honesty flip | **FAIL** U65 / O10 |
| **DV-CORE-RD-14** | Public EMP grows RD money | **FAIL** CORE-01 must_keep |

**scope_parity:** list rewards = get/update/enforce reward · list discipline = get/update/enforce discipline · period soft resolve under same employee profile scope family. Flag if list id → detail/enforce 404 under group CEO `main`.

---

## 7. Data interaction matrix

| Entity | C | R | U | D / soft | Transition |
|--------|---|---|---|----------|------------|
| `employee_rewards` | POST create | list/get | PATCH fields + link | prefer `archived_at` / cancel · hard DELETE residual | enforce · cancel |
| `employee_discipline` | POST create | list/get | PATCH fields + link | same | enforce · cancel |
| `payroll_link_status` | default `none` | with row | enforce→linked · cancel→none · PAY→executed | — | O2/O3/O4 |
| `payroll_period_id` | set when amount>0 | with row | change only unlocked | clear on cancel unlink | O6 |
| `payroll_periods` | **OUT** invent | picker read | **OUT** process | — | soft target |
| `pay_reward_link` | **OUT** mandatory | PAY optional peer | PAY | soft | §5.9 peer |
| `payslip` / lines | **OUT** CORE write | PAY | PAY | — | O8 |
| `/decisions*` | peer personnel | soft ref number | **≠** RD mutate | — | O7 |
| packages / eins | **RETAIN** CORE-02 | — | — | — | must_keep |
| `employees` public | RETAIN strip | omit RD money | deny C&B/RD leak | soft | CORE-01 |

---

## 8. Validation matrix (data-layer)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-CORE-RD-D-01** | Dual SoT GĐ1 | No wipe for greenfield sole table | FAIL if invent wipe |
| **VAL-CORE-RD-D-02** | ADD link cols both | `payroll_link_status` + `payroll_period_id` | Persist both tables |
| **VAL-CORE-RD-D-03** | Link enum | only four values | CHK/VAL fail else |
| **VAL-CORE-RD-D-04** | amount>0 | require period | 400/409 |
| **VAL-CORE-RD-D-05** | note-only | `none` · not PAY | FAIL if in PAY filter |
| **VAL-CORE-RD-D-06** | enforce | → linked (+ execution Đang/Đã) | F5 retains |
| **VAL-CORE-RD-D-07** | cancel unlocked | unlink / Hủy | gone from open period |
| **VAL-CORE-RD-D-08** | locked period | deny mutate | 409 |
| **VAL-CORE-RD-D-09** | dual-period | one case two open | 409 |
| **VAL-CORE-RD-D-10** | status residual | map §5 · no silent wipe | FAIL wipe |
| **VAL-CORE-RD-D-11** | soft period | → `payroll_periods` | no hard CASCADE SoT |
| **VAL-CORE-RD-D-12** | Nest `/core` | alias only | FAIL dual |
| **VAL-CORE-RD-D-13** | decisions | ≠ RD SoT | FAIL fold |
| **VAL-CORE-RD-D-14** | pay_reward_link mandatory | DENY | FAIL invent |
| **VAL-CORE-RD-D-15** | payslip_line on CORE | DENY | FAIL invent |
| **VAL-CORE-RD-D-16** | CORE-02 must_keep | packages/AuthZ/CB | FAIL reopen/claim DONE |
| **VAL-CORE-RD-D-17** | note-CRUD ≠ FR-08 DONE | honesty | FAIL claim |
| **VAL-CORE-RD-D-18** | U19 | list=get=enforce | Cross-CT FAIL |
| **VAL-CORE-RD-D-19** | seed / honesty | FE-only · flags false | FAIL |
| **VAL-CORE-RD-D-20** | public strip | no RD money leak | FAIL leak |

---

## 9. Traceability (BRD/SRS → DB → API → FE → Test)

| Requirement | DB physical | API (next) | FE / Journey | Test expect |
|-------------|-------------|------------|--------------|-------------|
| FR-UC-BP-CORE-08 #1–#5 · BR-BP-RD-01 | dual + link cols | **F-CORE-RD-01** UPGRADE + enforce ADD | **J-HRM-CORE-08-01..04** DRAFT | create+period · enforce F5 · cancel · Nest `/core` 0 |
| O5 physical | §4 ADD both | DTO + ensureSchema residual | — | cols present both |
| O2/O4 note vs money | link enum + period | VAL-400 / ENFORCE-409 | J-08-01/03 | note excluded PAY |
| O3 enforce/cancel | status + link | POST enforce / cancel | J-08-02/03 | linked / unlink |
| O6 soft period | `payroll_period_id` | resolve `payroll_periods` | picker | open/adjust only |
| O1 path | no Nest core table | paper `/core/reward-discipline` alias | Network rewards*/discipline* | FAIL dual |
| O7 decisions | soft `decision_number` | **≠** `/decisions*` SoT | — | FAIL fold |
| O8 PAY | soft payslip_id optional | **F-PAY-RD-APPLY-01** OUT | — | no CORE payslip_line |
| O9 must_keep | CORE-02/01 seals | CB-403 / AuthZ RETAIN | J-08-04 | no packages regression |
| O10 honesty | — | — | review | C-SLICE · ≠ DONE claims |
| U19 scope_parity | company_id both | same resolver | Group CEO | list=get=enforce |

**J-* DRAFT (BA):** `J-HRM-CORE-08-01..04` — promote after API+Dev+QA.  
**must_keep:** `J-HRM-CORE-02-01..04` · `J-HRM-CORE-01-*` SEALED — **DENY** reopen rewrite.

---

## 10. Error mapping (data outcomes → API codes)

| Data fail | HTTP | Code | Notes |
|-----------|------|------|-------|
| Missing title / amount invalid / amount>0 no period | 400 | **`HRM-CORE-RD-VAL-400`** *(mint)* | O2 |
| Enforce missing period / invalid transition | 409 | **`HRM-CORE-RD-ENFORCE-409`** *(mint)* | O3 |
| Dual open periods | 409 | **`HRM-CORE-RD-DUAL-PERIOD-409`** *(mint)* | BR-BP-RD-01 |
| Locked period mutate | 409 | **`HRM-CORE-RD-LOCKED-PERIOD-409`** *(mint)* | O3 |
| Emp not Hoạt động | 409 | **`HRM-CORE-RD-EMP-INACTIVE-409`** *(mint)* | O2 |
| Scope | 404/409 | `HRM-SCOPE-409` / profile 404 | U19 |
| Public body C&B/RD money leak | 403 | **`HRM-CORE-CB-403`** | **RETAIN** |
| C&B AuthZ | 403 | **`HRM-CORE-CB-AUTHZ-403`** | **RETAIN** · ≠ rewrite |
| Period not found | 404 | mint `HRM-CORE-RD-PERIOD-404` or VAL | O6 |
| Row not found | 404 | `HRM-EMP-PROFILE-404` RETAIN or RD-404 mint | — |

**DENY** rewrite sealed `HRM-COMP-*` / `HRM-EINS-*` / public `HRM-EMP-*` success semantics.

---

## 11. DENY / must_keep footer

| Class | Items |
|-------|--------|
| **must_keep** | LIVE dual `employee_rewards` + `employee_discipline` · LIVE `/employees/:id/rewards*` + `/discipline*` · LIVE `payroll_periods` soft target · CORE-02 packages\|lines\|history + `employee_insurances` + rate period · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · CORE-01 public strip · Nest `/core` DENY · stamps **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-02-* · J-HRM-CORE-01-* · soft-delete doctrine · U19 · W1–W9 REC seals · honesty false |
| **DENY** | Nest `/core` dual RD SoT · second `hrm_reward_discipline` wipe dual without migrate · mandatory `pay_reward_link` as CORE SoT · payslip_line / dual-write amount on CORE tables · fold RD into `/decisions` · claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE · reopen sealed J-CORE-02/01 without regression · seed · honesty flip · apps/** this seat |
| **OUT** | F-PAY-RD-APPLY-01 implement · F-PAY-PROCESS-01 · UC-BP-CORE-09/05/06/07 · ATT · CORE-02b invent |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · CORE/personnel UAT **false** · **C-SLICE** |

---

## 12. Unlock ladder (next — **not Dev**)

```text
DATA-01 CONFIRMED (this seat)
  → sa API-01 F.1
       F-CORE-RD-01 UPGRADE physical on
         /api/hrm/employees/:id/rewards*
         /api/hrm/employees/:id/discipline*
         ADD payroll_link_status · payroll_period_id (+ audit) on DTO/ensureSchema
         ADD enforce / cancel-enforce (or PATCH transition same SoT)
         execution status map §5 + display-ready VI
         amount>0 period gate · note-only none · dual-period 409 · locked deny
         paper POST/GET /api/hrm/core/reward-discipline (+ /enforce) = alias only
       RETAIN CORE-02 AuthZ/CB-403 · CORE-01 public · Nest /core DENY · U19
       OUT F-PAY-RD-APPLY-01 invent · pay_reward_link mandatory
  → Dev-BE / Dev-FE only after API CONFIRMED
  → QA U65 J-HRM-CORE-08-01..04 · QC GWC C-SLICE
```

**cấm Dev** until API-01 CONFIRMED.

---

## 13. Data quality risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev creates `hrm_reward_discipline` and drops dual | DENY §1/§11 · dual RETAIN · migrate-only unify |
| Link cols added only on rewards | FAIL O5 — **both** tables mandatory |
| Hard FK CASCADE to `payroll_periods` | Soft pointer + service resolve |
| Legacy amount>0 without period auto-linked | Backfill `none` · no silent link |
| FE keeps default `approved`/`active` on create | API residual prefer `pending` · not FR-08 DONE |
| Hard DELETE removes linked locked case | Prefer archived/cancel + locked deny |
| PAY filter includes note-only | VAL-CORE-RD-D-05 · O4 |
| Claim packages GWC = CORE DONE / note CRUD = FR-08 | O9/O10 · C-SLICE |
| Nest `/core` controller as write SoT | Alias only · FAIL O1 |
| Seed RD to pass QA | U65 DENY |
| Fold RD into decisions | O7 DENY |

---

## 14. Completion

| Field | Value |
|-------|--------|
| **completion_report** | Physical DOC-DELTA **CONFIRMED** for UC-BP-CORE-08 O5: **ADD** `payroll_link_status` (`none\|pending_period\|linked\|executed`) + soft `payroll_period_id` (+ optional audit/`archived_at`/`payroll_period_ref`/`payslip_id`) on LIVE dual **`employee_rewards` AND `employee_discipline`** — **RETAIN dual GĐ1** · paper §3.7 alias · **DENY** silent wipe for greenfield `hrm_reward_discipline`; execution map Chờ/Đang/Đã/Hủy ↔ LIVE `pending`/`approved`/`active`/`completed` + **ADD** `cancelled` — **DENY** silent status wipe; soft → LIVE **`payroll_periods`** · **DENY** mandatory `pay_reward_link` / payslip_line cols on CORE; **RETAIN** CORE-02 packages/eins · AuthZ-403 · CB-403 · CORE-01 public · Nest `/core` DENY · decisions ≠ RD SoT; **DENY** claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE · reopen J-CORE-02/01 · seed · honesty · apps/**. Unlock **sa** API-01 **F-CORE-RD-01** UPGRADE + enforce ADD — **not Dev**. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-data-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-08
depends_on: DATA-01 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md · BA O1–O12 · peer CORE02QC1-MSL80DU6
spec_ref: F-CORE-RD-01 UPGRADE · enforce ADD · BR-BP-RD-01 · AC-CORE-08-* · DATA §4–§5 · paper /core/reward-discipline alias

MISSION — API F.1 lock (docs-only):
1) UPGRADE F-CORE-RD-01 physical on /api/hrm/employees/:id/rewards* + /discipline*: DTO/ensureSchema ADD payroll_link_status + soft payroll_period_id (+ audit); ADD enforce/cancel-enforce (or PATCH transition same SoT); execution map Chờ/Đang/Đã/Hủy ↔ LIVE residual; amount>0→period gate; note-only none not PAY-visible; dual-period 409; locked deny; emp Hoạt động; display-ready VI
2) Paper POST/GET /api/hrm/core/reward-discipline (+ /enforce) = alias only — DENY Nest /core dual RD SoT
3) Soft resolve payroll_periods; OUT invent F-PAY-RD-APPLY-01 / pay_reward_link mandatory / payslip_line CORE write; decisions ≠ RD SoT
4) RETAIN CORE-02 packages/eins · HRM-CORE-CB-AUTHZ-403 · HRM-CORE-CB-403 · CORE-01 public · Nest /core DENY · U19 list=get=enforce; DENY claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE · reopen J-CORE-02/01 · seed · honesty · apps/** · Dev until API CONFIRMED
5) Unlock Dev-BE+FE after API CONFIRMED — not this seat

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md · PASS_TO_PM · next Dev HOLD until CONFIRMED
```
