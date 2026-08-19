# PO-HRM-MVP-GD1-PAY-08-CLUSTER-DATA-01 — Physical DB · STAMPED ADD payment_status · publish · period lock · version · TT audit (Option A · ba-data)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-08-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-44 seat **#49**) |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** (stamped closable) — **`payroll_payslips.payment_status`** · **`published_to_ess`** · **`published_at`** · **`published_by`** · **`version`** · **status SM GĐ1** expansion · **`payroll_periods.payroll_locked`** (or equivalent lock flag) · optional **`pay_payslip_payment_status_audit`** · **RETAIN** process-written amount/header cols (PAY-03/05/06/07) · **RETAIN** `employee_confirmed_at` / `employee_confirmed_by` · **RETAIN** PAY-01..07 physical spine · **must_keep** **`PAY01QC1-MSMBGWC1`** … **`PAY07QC1-MSMEY7GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **NO** PAY-08 PATCH calculator cols · **NO** invent `att_leave_hold` · **NO** merge sick/compensatory/carry→annual · **BIND** F-PAY-PROCESS-01 writer only · **NO CODE** `apps/**` · **no seed** · **no migrate** governance seat |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED ADD stamp** — **`payment_status`** + **publish** + **lock** cols **closable** (ABSENT/unwired LIVE) · **status SM GĐ1** documented · **`version`** closable · **TT audit** closable if separate table · unlock **sa** `PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01` · dev-be/FE **HOLD** until API stamp · **`payroll_e2e_ready=false`** · **≠ PAY-08 / PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-08` · `FR-UC-BP-PAY-08` · **BR-BP-PAY-03** · **BR-BP-SLIP-01** · **REQ_L_005** · peer **FR-UC-BP-PAY-01..07** (normative §4.2 order) |
| **depends_on** | BA-01 O1–O20 **CONFIRMED** · [`PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md) · peer DATA [`PO-HRM-MVP-GD1-PAY-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-07-CLUSTER-DATA-01.md) (`is_final_pay`) · [`PO-HRM-MVP-GD1-PAY-06-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-06-CLUSTER-DATA-01.md) · [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01.md) (**DV-09**) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§5.6** `pay_payslip` · **§5.11** lifecycle · paper `pay_payroll_period` lock semantics |
| **ref_code_cite** | **read-only cite (2026-08-10):** `payroll.service.ts` ensureSchema — payslip `status` CHECK `draft\|processed\|paid` · **no** `payment_status` · **no** `published_to_ess` · **no** `version` · `mapPayslip` **ABSENT** `payment_status` · `employee_confirmed_at` **LIVE** · period `status` `draft\|processed\|closed` · **no** dedicated payroll lock flag beyond `closed` |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** DDL stamp alone = PAY-08 DONE · **DENY** GET payslip LIVE = DONE · **DENY** PAY / ATT module UAT · **DENY** invent `att_leave_hold` · **DENY** merge buckets · **DENY** reopen sealed J-* without regression bus |
| **ack_status** | **PASS_TO_PM CONFIRMED ADD stamp** |

---

## 1. Verdict — **CONFIRMED ADD stamp** (payment_status · publish · lock · version · TT audit)

| Decision | Stamp |
|----------|--------|
| **`payment_status` (paper §5.6)** | **ADD stamp closable** → **`public.payroll_payslips.payment_status`** `TEXT` · enum **`unpaid` \| `partial` \| `paid` \| `budget_hold`** · default **`unpaid`** when row exists post-process · **cấm** `paid` when **`published_to_ess=false`** (unpublished) · **AC-PAY-SLIP-PAY-STATUS** |
| **Publish to ESS (BA O2)** | **ADD stamp closable** → **`published_to_ess`** `BOOLEAN NOT NULL DEFAULT false` · **`published_at`** `TIMESTAMPTZ NULL` · **`published_by`** `UUID NULL` (actor C&B) · set atomically on publish transition · ESS list predicate **must** filter `published_to_ess=true` (or status `published` — **both** stamped; API-01 picks **one** SoT with other as derived) |
| **Payslip `status` SM GĐ1 (BA O3)** | **ADD stamp** — expand CHECK to include paper-aligned lifecycle: **`calculated`** · **`published`** · **`void`** · **RETAIN** migrate alias: LIVE **`processed`** ≡ **`calculated`** (backfill / app map until DDL migrate) · **deprecate** payslip `status='paid'` for business “đã TT” → use **`payment_status`** only · invalid: **`void`→`calculated`** without new `version` row (**O11 HOLD** depth) |
| **`version` (paper §5.6 · BA O11)** | **ADD stamp closable** → **`public.payroll_payslips.version`** `INT NOT NULL DEFAULT 1` · increment on adjustment clone path (**HOLD** full UI GĐ1) · UQ paper `(payroll_period_id, employee_id, version)` **deferred** until adjustment wave — **RETAIN** LIVE UQ `(period_id, employee_id)` for GĐ1 single row |
| **Period lock (BA O9)** | **ADD stamp closable** → **`public.payroll_periods.payroll_locked`** `BOOLEAN NOT NULL DEFAULT false` **OR** treat **`status='closed'`** + **`closed_at IS NOT NULL`** as lock signal (**RETAIN** LIVE `closed`) — **normative:** enroll/process mutate denied when **`payroll_locked=true` OR `status IN ('closed','locked')`** · **allow** `payment_status` PATCH + publish/void per PAY-08 · **`HRM-PAY-LOCK-409`** |
| **TT audit (BA O4)** | **ADD stamp closable** → **`public.pay_payslip_payment_status_audit`** (logical name; physical table greenfield) · append-only rows on **`payment_status`** change · **optional** mirror publish events in same table with `event_kind` |
| **Process-written amounts** | **must_keep RETAIN** — **`gross_amount`**, **`net_amount`**, **`deduction_amount`**, **`tax_amount`**, **`si_employee_amount`**, **`si_employer_amount`**, **`gtgc_amount`**, lines, segments — **only** **`F-PAY-PROCESS-01`** writer (**O1**) · PAY-08 **cấm** UPDATE these cols |
| **PAY-07 peer cols** | **must_keep RETAIN** — **`is_final_pay`**, **`termination_settlement_id`** per PAY-07 DATA stamp |
| **ESS confirm** | **must_keep RETAIN** — **`employee_confirmed_at`**, **`employee_confirmed_by`** — gate **published** + not void (**O5**) |
| **Leave hold** | **DENY invent** **`att_leave_hold`** |
| **This seat** | Docs only — **NO** `apps/**` · **NO** seed · **NO** migrate governance seat |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical GĐ1 LIVE / proposed | Action |
|-----------------|------------------------------|--------|
| `pay_payslip.payment_status` | **`public.payroll_payslips.payment_status`** | **ADD stamp** §6.1 |
| `pay_payslip.status` (GĐ1 SM) | **`public.payroll_payslips.status`** | **ADD stamp** §6.1 (CHECK expand + alias map) |
| `pay_payslip.version` | **`public.payroll_payslips.version`** | **ADD stamp** §6.1 |
| Publish / ESS visibility | **`published_to_ess`**, **`published_at`**, **`published_by`** | **ADD stamp** §6.1 |
| `pay_payroll_period` lock | **`payroll_periods.payroll_locked`** and/or **`status`/`closed_at`** | **ADD stamp** §6.2 |
| TT audit trail | **`pay_payslip_payment_status_audit`** | **ADD stamp** §6.3 |
| `pay_payslip.gross` / `net` / static plane | **`gross_amount`**, **`net_amount`**, **`tax_amount`**, **`si_*`**, **`gtgc_amount`** | **RETAIN** · PAY-03/05/06 stamps |
| `employee_confirmed_at` | same | **RETAIN LIVE** |
| `is_final_pay` / `termination_settlement_id` | same | **RETAIN** PAY-07 stamp |
| `pay_payslip.timesheet_header_id` | optional / bind peer | **HOLD** PAY-01 bind — **not** PAY-08 ADD scope |
| Paper `att_leave_hold` | **`employee_leave_balances.pending_days`** | **DENY dual table** |

```text
  PAY-01..07 SEALED (must_keep PAY01QC1..PAY07QC1): F-PAY-PROCESS-01 writes calculated row
       │
       ▼
  ┌──────── FR-UC-BP-PAY-08 DATA stamp (lifecycle on same payroll_payslips) ─────┐
  │  RETAIN: gross/net/tax/si/gtgc/lines/segments · is_final_pay · ESS confirm cols │
  │  ADD: payment_status · published_to_ess/at/by · version · status SM GĐ1        │
  │  ADD: payroll_periods payroll_locked (or closed≡lock policy)                    │
  │  ADD: pay_payslip_payment_status_audit (append-only TT)                           │
  │  DENY: PAY-08 UPDATE amount cols · DENY att_leave_hold                            │
  └──────────────────────────────────────────────────────────────────────────────────┘
        Period payroll_locked → deny enroll/process (409) · allow TT PATCH + publish
```

**Label lock:** Wave-44 PAY-08 GĐ1 DATA = **stamped closable** lifecycle + TT cols on **`payroll_payslips`** + **period lock** + **audit** — **not** F-PAY-PAYSLIP-01 runtime DONE · **not** publish/ESS wire LIVE · **C-SLICE**.  
**Honesty lock:** `payroll_e2e_ready=false` · **≠ PAY-08 / FR-PAY-08 module UAT**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-08 / FR-UC-BP-PAY-08 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠** full C&B→NV→TT browser e2e  
> must_keep **`PAY01QC1-MSMBGWC1`** … **`PAY07QC1-MSMEY7GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`**  
> lifecycle ADD stamp **necessary not sufficient** · publish/TT/lock **ABSENT** until Dev after API stamp  
> **RETAIN** process calculator cols · **DENY** amount PATCH from PAY-08 · DENY `att_leave_hold` · DENY merge buckets · no seed · no apps/**

---

## 3. AS-IS baseline (physical — read-only cite · 2026-08-10)

| Object | AS-IS LIVE | Gap (Wave-44 DATA) |
|--------|------------|---------------------|
| **`payroll_payslips.payment_status`** | **ABSENT** in ensureSchema / `mapPayslip` | **ADD** §6.1 |
| **`published_to_ess`** / publish audit | **ABSENT** | **ADD** §6.1 |
| **`payroll_payslips.version`** | **ABSENT** | **ADD** §6.1 |
| **`payroll_payslips.status`** | `draft` \| `processed` \| `paid` | **EXPAND** SM §6.1 · map `processed`→`calculated` |
| **`payroll_periods` lock** | `closed` + `closed_at` partial | **ADD** explicit lock flag §6.2 · document enroll/process deny |
| **`pay_payslip_payment_status_audit`** | grep **0** | **ADD** §6.3 |
| **GET payslip / ESS / confirm** | **LIVE** (≠ DONE) | **RETAIN** + gates after publish cols |
| **Amount header cols** | partial per PAY-03/05/06 | **must_keep RETAIN** |
| **`is_final_pay`** | PAY-07 schema helper may exist | **must_keep RETAIN** |
| **`att_leave_hold`** | **ABSENT** | **DENY invent** |

---

## 4. HOLD / residual dispositions

### 4.1 Full adjustment UI — **HOLD** (BA O11)

| Topic | Ruling |
|-------|--------|
| Clone payslip + `version++` workflow UI | **HOLD** post-GĐ1 · **`version`** col **ADD stamp** now for paper parity |
| Paper UQ `(payroll_period_id, employee_id, version)` | **HOLD** DDL until adjustment slice — **RETAIN** single-row UQ GĐ1 (**DV-13**) |
| Void after paid | **IN-SCOPE API** PAY-08 · data: `status→void` + audit · **≠** silent DELETE (**BR-BP-SLIP-01**) |

### 4.2 Budget hold / NS — **HOLD** (BA O12)

| Topic | Ruling |
|-------|--------|
| **`budget_hold`** enum value | **ADD** on `payment_status` CHECK — semantics + NS display **HOLD** integration |
| REQ_L_005 depth | **≠** PAY-08 DATA DONE alone |

### 4.3 Wire batch — **HOLD** (BA O19)

| Topic | Ruling |
|-------|--------|
| `wire-payment-batch` sets `payment_status=paid` | **One** SoT rule in **sa API-01** · audit row **required** when implemented |

### 4.4 Peer seals — **must_keep**

| Stamp | Ruling |
|-------|--------|
| **`PAY01QC1`** … **`PAY07QC1`** | RETAIN process order §4.2 · PAY-08 read/lifecycle only |
| **`ATT12QC1`** · **`ATT11QC1`** | RETAIN closed sheet peer |
| Reopen sealed J-PAY-01..07 | **DENY** without regression bus |

### 4.5 Rejected ADD / DENY

| Object | Verdict |
|--------|---------|
| PAY-08 UPDATE `gross_amount` / `net_amount` / component lines | **DENY** — **O1/O13** |
| `att_leave_hold` | **DENY** |
| Claim GET payslip LIVE = PAY-08 DONE | **DENY** — **O18** |
| Flip `payroll_e2e_ready` | **DENY** |
| Second payslip per period for split | **DENY** — **DV-13** RETAIN |

---

## 5. Validation matrix (data integrity)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-PAY-08-DATA-01** | `payment_status='paid'` while `published_to_ess=false` | **O4** | **409** / constraint FAIL |
| **VAL-PAY-08-DATA-02** | `payment_status` PATCH on `status='void'` | **O10** | **409** unless void policy allows read-only TT |
| **VAL-PAY-08-DATA-03** | `confirmMyPayslip` while unpublished | **O5** | **409** `HRM-PAY-PUBLISH-409` |
| **VAL-PAY-08-DATA-04** | `payment_status` not in enum | CHECK | **4xx** |
| **VAL-PAY-08-DATA-05** | enroll/process when period locked | **O9** · **DV-09** peer | **409** `HRM-PAY-LOCK-409` |
| **VAL-PAY-08-DATA-06** | TT PATCH when period locked | **O9** | **ALLOW** per policy |
| **VAL-PAY-08-DATA-07** | `payment_status` change without audit row | **O4** | **FAIL** QA / app guard |
| **VAL-PAY-08-DATA-08** | `published_to_ess=true` without `published_at` | publish atomicity | **FAIL** |
| **VAL-PAY-08-DATA-09** | `status` transition `void`→`calculated` in place | **§5.11** paper | **INVALID** — new version row (**HOLD**) or stay void |
| **VAL-PAY-08-DATA-10** | `company_id` list ≠ detail payslip/period | **U19** | Same resolver |
| **VAL-PAY-08-DATA-11** | Invent `att_leave_hold` | grep | **FAIL** |
| **VAL-PAY-08-DATA-12** | Claim DATA stamp = PAY-08 DONE | honesty | **FAIL** |
| **VAL-PAY-08-DATA-13** | Static tax/gtgc/si PATCH via PAY-08 lifecycle API | **DV-14** | **403** |

---

## 6. Stamped ADD (closable — not LIVE · no migrate this seat)

> **BA-data stamp (2026-08-10):** SA Option A + BA O1–O20 — **`payment_status`** · **publish** · **lock** · **`version`** **closable** (ABSENT/unwired LIVE). **Dev-be** migrates only after **sa API-01** F.1 + program waiver. **Governance seat:** stamp only.

### 6.1 Payslip header — lifecycle + TT (**R-PAY-08-PAY-STATUS** · **R-PAY-08-PUBLISH**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `payment_status` | `TEXT` | YES | `NULL` → app sets **`unpaid`** on first publish-ready row | CHECK **`unpaid` \| `partial` \| `paid` \| `budget_hold`** |
| `published_to_ess` | `BOOLEAN` | NO | `false` | **true** only after publish transition |
| `published_at` | `TIMESTAMPTZ` | YES | NULL | Set with publish |
| `published_by` | `UUID` | YES | NULL | C&B actor |
| `version` | `INT` | NO | `1` | Increment on adjustment path (**O11 HOLD** UI) |

**Status CHECK expansion (proposed):**

| GĐ1 status | Meaning | Writer |
|------------|---------|--------|
| `calculated` | Post-**process** output (alias LIVE **`processed`**) | **F-PAY-PROCESS-01** |
| `published` | Released to ESS | Publish API |
| `void` | Cancelled / void O22 path | Void API |
| `draft` | Pre-process placeholder (RETAIN LIVE) | enroll edge |

**Invalid transitions (normative · paper §5.11 adapted):**

| From | To | Verdict |
|------|-----|---------|
| `calculated` | `published` | **VALID** (publish) |
| `published` | `void` | **VALID** (void policy) |
| `paid` (legacy status col) | any | **DEPRECATE** — migrate to `payment_status` |
| `void` | `calculated` | **INVALID** in-place — adjustment = **version** row (**HOLD**) |
| `calculated` | `paid` via status col only | **INVALID** — use **`payment_status`** |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — cols **ABSENT** / unwired |
| Closable **this** seat? | **NO migrate** — stamp only |
| Unlock | **AC-PAY-SLIP-PAY-STATUS** · **AC-PAY-SLIP-PREVIEW-PUBLISH** · **J-HRM-PAY-08-02/03** |

**Paper alias:** logical `pay_payslip.*` → physical **`public.payroll_payslips.*`**.

**Proposed migration sketch (dev-be — not this seat):**

```sql
ALTER TABLE public.payroll_payslips
  ADD COLUMN IF NOT EXISTS payment_status TEXT NULL,
  ADD COLUMN IF NOT EXISTS published_to_ess BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS published_by UUID NULL,
  ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;

ALTER TABLE public.payroll_payslips
  DROP CONSTRAINT IF EXISTS chk_payslip_status;
ALTER TABLE public.payroll_payslips
  ADD CONSTRAINT chk_payslip_status CHECK (
    status IN ('draft', 'processed', 'calculated', 'published', 'paid', 'void')
  );

ALTER TABLE public.payroll_payslips
  ADD CONSTRAINT chk_payslip_payment_status CHECK (
    payment_status IS NULL OR payment_status IN ('unpaid', 'partial', 'paid', 'budget_hold')
  );

-- Backfill GĐ1: processed → calculated semantic (optional UPDATE status or app map only)
-- UPDATE public.payroll_payslips SET status = 'calculated' WHERE status = 'processed';
```

### 6.2 Period — payroll lock (**R-PAY-08-PERIOD-LOCK**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `payroll_locked` | `BOOLEAN` | NO | `false` | When **true** OR `status='closed'`, deny **enroll** / **process** |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — flag **ABSENT**; **`closed`** partial |
| Normative lock predicate | **`payroll_locked = true OR status IN ('closed', 'locked')`** |
| TT / publish under lock | **ALLOW** per BA **O9** |

**Proposed migration sketch (dev-be — not this seat):**

```sql
ALTER TABLE public.payroll_periods
  ADD COLUMN IF NOT EXISTS payroll_locked BOOLEAN NOT NULL DEFAULT false;

-- Optional: extend chk_payroll_status to include 'locked' when product distinguishes closed vs locked
```

### 6.3 TT audit — **`pay_payslip_payment_status_audit`** (**R-PAY-08-PAY-STATUS-AUDIT**)

| Proposed column | Type | Null | Rule |
|-----------------|------|------|------|
| `id` | `UUID` | NO | PK |
| `company_id` | `TEXT` | NO | Scope (**U19**) |
| `payslip_id` | `UUID` | NO | FK → `payroll_payslips(id)` |
| `event_kind` | `TEXT` | NO | `payment_status_change` \| `publish` (optional) |
| `from_payment_status` | `TEXT` | YES | Prior value |
| `to_payment_status` | `TEXT` | YES | New value |
| `actor_user_id` | `UUID` | YES | C&B / system wire batch |
| `note` | `TEXT` | YES | Optional policy note |
| `created_at` | `TIMESTAMPTZ` | NO | `NOW()` |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — table **ABSENT** |
| Append-only | **YES** — no UPDATE/DELETE on audit rows GĐ1 |
| Unlock | **AC-PAY-SLIP-PAY-STATUS** · REQ_L_005 audit pointer |

**Proposed migration sketch (dev-be — not this seat):**

```sql
CREATE TABLE IF NOT EXISTS public.pay_payslip_payment_status_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  payslip_id UUID NOT NULL REFERENCES public.payroll_payslips(id) ON DELETE RESTRICT,
  event_kind TEXT NOT NULL,
  from_payment_status TEXT NULL,
  to_payment_status TEXT NULL,
  actor_user_id UUID NULL,
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_pay_ps_audit_kind CHECK (
    event_kind IN ('payment_status_change', 'publish')
  )
);
CREATE INDEX IF NOT EXISTS ix_pay_ps_audit_payslip
  ON public.pay_payslip_payment_status_audit (payslip_id, created_at DESC);
```

### 6.4 HOLD waiver — unchanged / deferred

| Residual | Waiver | Owner |
|----------|--------|-------|
| **R-PAY-08-VOID-BE** | Void / O22 settlement adjust runtime | **dev-be** after API |
| **H-PAY-08-VERSION-UI** | Full adjustment clone | **O11** |
| **H-PAY-08-BUDGET-NS** | NS integration | **O12** |
| **H-PAY-08-WIRE** | Batch → paid SoT | **O19** · API-01 |
| **timesheet_header_id NOT NULL** paper | PAY-01 bind | **HOLD** separate bind wave |

---

## 7. Lifecycle

### 7.1 `payroll_payslips.status` + publish (GĐ1)

| From | To | Valid when |
|------|-----|------------|
| `draft` | `calculated` / `processed` | **F-PAY-PROCESS-01** success |
| `calculated` | `published` | Publish API · sets `published_to_ess=true` |
| `published` | `void` | Void API (**O22** peer) |
| `void` | `calculated` | **INVALID** in-place (**VAL-PAY-08-DATA-09**) |

### 7.2 `payment_status` (orthogonal to publish SM)

| Value | Meaning |
|-------|---------|
| `unpaid` | Default after publish |
| `partial` | Partial TT |
| `paid` | Fully paid · **cấm** on unpublished row |
| `budget_hold` | NS hold (**O12** semantics HOLD) |

### 7.3 Period lock

| State | enroll/process | payment_status PATCH | publish |
|-------|----------------|----------------------|---------|
| open | **ALLOW** | **ALLOW** (published rows) | **ALLOW** |
| locked/closed | **DENY** **409** | **ALLOW** | **ALLOW** per policy |

---

## 8. scope_parity (U19)

| Surface | Resolver | Parity rule |
|---------|----------|-------------|
| `listPayslips` / `getPayslipById` | Same `company_id` ladder | **J-HRM-PAY-08-06** |
| `listMyPayslips` / `getMyPayslipById` | ESS + `employee_id=self` + **`published_to_ess=true`** | **J-HRM-PAY-08-04/05** |
| Period list/get lock fields | Same as payroll period scope | **J-HRM-PAY-08-05** lock case |

Trace: **J-HRM-PAY-08-01..08** (DRAFT BA-01) · regression **J-HRM-PAY-01..07** subsets per BA-01 §4.1.

---

## 9. Traceability (SRS → DB → API → FE → test)

| BR/AC | Physical | API (GAP/RETAIN) | FE / J-* | Evidence |
|-------|----------|------------------|----------|----------|
| **O1** Calc SoT | amount cols RETAIN | **F-PAY-PROCESS-01 RETAIN** | **J-08-01** | **PAY06QC1** |
| **O2** Preview/publish | §6.1 publish cols | publish GAP | **J-08-02** | |
| **O3** Status SM | §6.1 status CHECK | publish GAP | **J-08-02** | |
| **O4** TT | `payment_status` + §6.3 audit | PATCH GAP | **J-08-03** | F5 |
| **O5** ESS confirm | `employee_confirmed_at` RETAIN | confirm + gate GAP | **J-08-04** | |
| **O6** ESS security | scope cols RETAIN | 403/404 RETAIN | **J-08-05** | |
| **O7** Parity | same tables | list≡get GAP AC | **J-08-06** | U19 |
| **O8** Display | header + lines RETAIN | GET BIND | **J-08-06** | PAY03..07 |
| **O9** Period lock | §6.2 | lock GAP | **J-08-05** | **HRM-PAY-LOCK-409** |
| **O10** Void O22 | `status=void` | void GAP | **J-08-07** | PAY07 O22 |
| Diễn biến **#1–#2** | §6.1 | **F-PAY-PAYSLIP-01** | **J-08-01..03** | U65 |
| Luồng **#4** | ESS filter | me/* RETAIN | **J-08-04** | |

---

## 10. Data interaction matrix (PAY-08 slice)

| Entity | Create | Read | Update | Delete/Archive | PAY-08 seat |
|--------|--------|------|--------|----------------|-------------|
| `payroll_payslips` | process upsert | list/get/ESS | **lifecycle only**: publish · TT · void | void policy | **ADD cols** §6.1 |
| `payroll_payslip_lines` | process | get | re-process only | — | **RETAIN** |
| `payroll_payslip_split_segments` | PAY-04 | get | — | — | **RETAIN** |
| `pay_payslip_payment_status_audit` | on TT/publish | list by payslip | — | — | **ADD stamp** §6.3 |
| `payroll_periods` | PAY-01 | list/get | lock flag | — | **ADD** §6.2 |
| `pay_termination_settlement` | PAY-07 | get | void peer | — | **RETAIN** PAY-07 |
| `att_leave_hold` | — | — | — | — | **DENY** |

---

## 11. Deterministic error mapping (data-related)

| Code / condition | When | HTTP | Data note |
|------------------|------|------|-----------|
| **`HRM-PAY-PUBLISH-409`** | Confirm/publish on draft | **409** | **VAL-PAY-08-DATA-03** |
| **`HRM-PAY-LOCK-409`** | enroll/process on locked period | **409** | **VAL-PAY-08-DATA-05** |
| **`HRM-PAY-403-ESS`** | Wrong ESS owner | **403** | RETAIN |
| **`HRM-PAY-404`** | Out-of-scope id | **404** | RETAIN |
| PATCH amount cols on payslip | lifecycle API body | **403** | **O13** |
| `paid` TT on unpublished | constraint/app | **409** | **VAL-PAY-08-DATA-01** |
| Invent **`att_leave_hold`** | migration | — | **process defect** |

---

## 12. Closability analysis (exit gate)

| Candidate ADD | Closable? | Verdict |
|---------------|-----------|---------|
| **`payroll_payslips.payment_status`** | **YES** — unwired LIVE | **ADD stamp** §6.1 |
| **`published_to_ess`** / **`published_at`** / **`published_by`** | **YES** — ABSENT | **ADD stamp** §6.1 |
| **`payroll_payslips.version`** | **YES** — ABSENT | **ADD stamp** §6.1 |
| **Status SM CHECK expand** | **YES** — migrate from LIVE enum | **ADD stamp** §6.1 |
| **`payroll_periods.payroll_locked`** | **YES** — ABSENT | **ADD stamp** §6.2 |
| **`pay_payslip_payment_status_audit`** | **YES** — table ABSENT | **ADD stamp** §6.3 |
| Process amount cols | **N/A** | **RETAIN** — not PAY-08 writer |
| `att_leave_hold` | **NO** | **DENY** |
| Claim DATA stamp = PAY-08 DONE | **NO** | **DENY** honesty |

---

## 13. Unlock next

| Field | Value |
|-------|--------|
| **next_owner** | **sa** (API-01 cluster) · **pm** orchestration |
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01` |
| **Mission** | F.1 deepen **F-PAY-PAYSLIP-01** · publish · **payment_status** PATCH · ESS gates · period lock · void O22 · **HRM-PAY-PUBLISH-409** · **HRM-PAY-LOCK-409** · Mục đích · Nghiệp vụ · Tham chiếu SRS Diễn biến **#1–#2** · cite §6.1–6.3 physical cols · **must_keep** **PAY01QC1..PAY07QC1** · **DENY** calculator PATCH |

---

## 14. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §15 |
| **next_owner** | `sa` · `pm` |
| **ack_status** | **PASS_TO_PM CONFIRMED ADD stamp** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-DATA-01.md` |

### 14.1 next_dispatch_prompt (copy-ready — sa API-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01
role: sa
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-44 seat #49)
lane: governance · F.1 deepen · UC-BP-PAY-08
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-DATA-01.md (§6.1–6.3 physical stamp)
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-PAYSLIP-01 · F-PAY-PROCESS-01 peer
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md (void O22 peer)
entry_criteria: BA O1–O20 CONFIRMED · DATA-01 PASS_TO_PM CONFIRMED ADD stamp · must_keep PAY01QC1..PAY07QC1 + ATT11/12 · payroll_e2e_ready=false · U65
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01.md
  - F.1: publish · payment_status PATCH · ESS gates · period lock · void O22 · HRM-PAY-PUBLISH-409 · HRM-PAY-LOCK-409
  - Mục đích · Nghiệp vụ · Tham chiếu SRS FR-UC-BP-PAY-08 Diễn biến #1–#2
  - Map DTO fields to DATA-01 §6.1 payment_status · published_to_ess · version · audit §6.3
  - ack_status PASS_TO_PM unlock dev-be
cấm: apps/** · PAY-08 PATCH calculator fields · honesty flip · reorder PAY pipeline · reopen PAY seals
```

---

## 15. completion_report

| | |
|--|--|
| **Closed** | **CONFIRMED ADD stamp** for UC-BP-PAY-08 physical gap on **`payroll_payslips`**: **`payment_status`** (`unpaid\|partial\|paid\|budget_hold`) · **publish** cols (`published_to_ess`, `published_at`, `published_by`) · **GĐ1 status SM** (`calculated`/`published`/`void` + LIVE `processed` alias) · **`version`** · **period lock** (`payroll_periods.payroll_locked` + closed policy) · **append-only** **`pay_payslip_payment_status_audit`** · validation matrix **VAL-PAY-08-DATA-01..13** · lifecycle §7 · **U19** scope_parity §8 · traceability to **AC-PAY-SLIP-*** and **J-HRM-PAY-08-*** · **RETAIN** process-written amounts · PAY-07 final-pay cols · ESS confirm cols · **must_keep PAY01QC1..PAY07QC1 + ATT11/12** · **HOLD** O11/O12/O19 UI/integration footers · **`payroll_e2e_ready=false`** · unlock **sa API-01** |
| **Residual (open)** | sa API-01 · dev-be/FE migrate + wire · QA J-* · QC GWC · void O22 runtime · wire batch SoT · full version UQ |
| **next_owner** | **sa** (`PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01`) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM CONFIRMED ADD stamp** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-DATA-01.md` |
