# PO-HRM-E2E-LINK-EMP-DB-01 — DB confirm · EMP E2E linkage (physical)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-DB-01` |
| **lane** | governance · ba-data |
| **parent** | `PO-HRM-E2E-LINK-EMP-SA-01` (TechSpec DRAFT Option A) |
| **change_mode** | ADD confirm · **NO CODE** `apps/**` · **no migrate stamp until this CONFIRMED** |
| **Date** | 2026-08-06 |
| **Status** | **CONFIRMED** — physical plan + ADD-DDL list unlocks Dev; Nest `ensureSchema` ADD only |
| **ref_sa** | [`PO-HRM-E2E-LINK-EMP-SA-01.md`](./PO-HRM-E2E-LINK-EMP-SA-01.md) §3–§4 |
| **ref_ba** | [`PO-HRM-E2E-LINK-EMP-SPEC-01.md`](./PO-HRM-E2E-LINK-EMP-SPEC-01.md) §D.2/D.5/D.6 |
| **ref_logical** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.6 · §3.9 · **§3.11** |
| **ref_physical** | Nest `employee-profile.service` · `decisions.service` · `employee-insurances.service` · `contracts-insurance.service` · `catalog-extensions.service` |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Enrollment SoT **ONE** | **`public.employee_insurances`** ↔ logical `hrm_insurance_enrollment` |
| Rate timeline | **ADD** `public.hrm_insurance_rate_period` (AS-IS thiếu) — append-only |
| **FORBIDDEN** as enrollment SoT | `employee_insurance_records` · `hrm_insurance_policy_participants` |
| WH SoT **ONE** | **`public.employee_work_timeline`** ↔ logical `hrm_employment_history` — **no** dual table |
| WH ← QSĐ | **ADD** `decision_id` UUID soft FK → `hr_decisions.id` (+ `source_module`, `archived_at`) |
| Decision SoT | **`public.hr_decisions`** — keep; app-require `employee_id` person-bound |
| Effective status (F-CORE-DEC-02) | **`effective`** (AS-IS FE vocabulary; TEXT column, no CHECK yet) |
| HTP-05 | Read-model `employees` + **`employee_contracts`** `status='active'` same `company_id` — **no** new table |
| Dual-write logical+physical | **FORBIDDEN** |
| Hard FK / CASCADE WH→decision | **FORBIDDEN** GĐ1 — soft UUID + app assert |
| Honesty UAT flags | **remain false** |

**Unlock:** PM may dispatch **`PO-HRM-E2E-LINK-EMP-BE-01`** + **`PO-HRM-E2E-LINK-EMP-FE-01`** parallel. BE applies ADD columns via Nest `ensureSchema` (same pattern as E1-A `position_key`) — **not** invent second WH/enrollment tables.

---

## 2. Alias map (logical ↔ physical) — ONE SoT

| Logical (enterprise) | Physical AS-IS / ADD | Dual-write |
|----------------------|----------------------|------------|
| `hrm_decision` | `hr_decisions` | **no** |
| `hrm_employment_history` | `employee_work_timeline` | **no** |
| `hrm_insurance_enrollment` | **`employee_insurances`** | **no** |
| `hrm_insurance_rate_period` | **`hrm_insurance_rate_period`** (**ADD**) | n/a new |
| `employee_contracts` | `employee_contracts` | keep |
| *(not enrollment)* | `employee_insurance_records` | expiry/provider list only |
| *(not enrollment)* | `hrm_insurance_policy_participants` | policy attach / PAY CFG — ≠ lifecycle actions |

### 2.1 Column alias — work history

| Logical | Physical | Rule |
|---------|----------|------|
| `effective_from` | **`event_date`** | ONE date SoT |
| `to_position_key` / position SoT | **`position_key`** | Catalog; free-text `position` = denorm label only |
| `to_department_id` / dept SoT | **`department_key`** | Catalog when required; `department` denorm |
| `decision_id` | **`decision_id`** (**ADD**) | Soft FK UUID |
| `decision_ref` (display) | Join `hr_decisions.decision_code` **or** optional denorm later | **≠** replace `decision_id` |
| `source_module` | **`source_module`** (**ADD**) | `decision` \| `manual` |
| `archived_at` | **`archived_at`** (**ADD**) | Soft supersede — cấm hard-delete history rows used in reports |
| `note` | `notes` / `description` | Display; not SoT |

**AS-IS already present:** `id`, `employee_id`, `company_id`, `event_date`, `title`, `event_type`, `status`, `position`, `department`, `position_key`, `department_key`, timestamps.

**AS-IS `title` NOT NULL:** auto row from F-CORE-DEC-02 must set `title` = position label (or decision.title) — denorm, not free-text SoT.

### 2.2 Column alias — enrollment

| Logical | Physical |
|---------|----------|
| `insurance_type_key` | **`type`** |
| `employee_amount` (seed first period) | **`contribution`** |
| `employer_amount` | **`employer_contribution`** |
| `status` | **`status`** — expand enum §3 |
| `policy_id` / `si_number` / `archived_at` | **ADD nullable** if BE needs for CORE-10 (optional GĐ1 except status expand + period FK) |

---

## 3. SI action ↔ enum 1:1 (CONFIRMED)

| `action` (API) | `employee_insurances.status` | New period `period_status` | New period `action` |
|----------------|------------------------------|----------------------------|---------------------|
| `close` | `closed` | `closed` | `close` |
| `stop` | `stopped` | `stopped` | `stop` |
| `suspend` | `suspended` | `suspended` | `suspend` |
| `change_rate` | keep `active` (unless already `suspended`) | `applying` | `change_rate` |
| `resume` | `active` | `applying` | `resume` |

**Rules:**

1. Action = **append** `hrm_insurance_rate_period` + set prior open row `effective_to` = day-before.
2. **Cấm** UPDATE đè `contribution` / rates trên enrollment row làm SoT timeline (may sync “current” denorm for list — not history SoT).
3. Suspend **không** xóa periods cũ.
4. AS-IS `employee_insurances.status` default `'active'` TEXT — **no CHECK**; BE ADD app validation (+ optional CHECK) for `active|suspended|stopped|closed`.
5. `Q-SI-SUSPEND` vocabulary GĐ1 = **SUPERSEDED** by this map (AC-SI-TL); residual **AC-SI-TL-06** PAY read remains PAY seat.

### 3.1 ADD table `hrm_insurance_rate_period` (minimal)

| Cột | Kiểu | Null |
|-----|------|------|
| `id` | uuid PK | NO |
| `enrollment_id` | uuid | NO — soft → `employee_insurances.id` |
| `company_id` | text | NO |
| `effective_from` | date | NO |
| `effective_to` | date | YES |
| `employee_rate_pct` / `employer_rate_pct` | numeric | YES |
| `employee_amount` / `employer_amount` | numeric | YES |
| `pay_rate_cfg_id` | uuid | YES soft |
| `period_status` | text | NO — `applying\|suspended\|closed\|stopped` |
| `action` | text | YES — enum §3 |
| `change_reason` / `suspend_reason` | text | YES |
| `archived_at` | timestamptz | YES |
| timestamps | | |

| **IX** | `(enrollment_id, effective_from)` · `(company_id, period_status)` |
| **UQ** | partial: one open period per enrollment (`effective_to IS NULL AND archived_at IS NULL`) |
| **Soft FK** | No REFERENCES CASCADE to enrollment; app assert same `company_id` |

---

## 4. WH `decision_id` + indexes (CONFIRMED ADD)

| Cột / IX | Intent |
|----------|--------|
| `decision_id` uuid NULL | Soft FK → `hr_decisions.id`; **NOT NULL** when `source_module='decision'` |
| `source_module` text NULL | `decision` \| `manual` |
| `archived_at` timestamptz NULL | Soft supersede on cancel QSĐ |
| **UQ** | `(decision_id) WHERE decision_id IS NOT NULL AND archived_at IS NULL` — idempotent UPSERT key F-CORE-DEC-02 |
| **IX** | `(employee_id, event_date)` · `(company_id, position_key)` keep |

**Soft FK rules:**

- Validate `decision_id` exists + same scope / same `employee_id` on write.
- **No** ON DELETE CASCADE; cancel → archive WH row or mark superseded per AC-DEC-WH-04.
- Manual WH may omit `decision_id`; optional neo tay must pass same assert.

---

## 5. `hr_decisions` — person-bound + effective (CONFIRMED)

| Topic | AS-IS | GĐ1 rule |
|-------|-------|----------|
| Table | `hr_decisions` | keep |
| `employee_id` | UUID **nullable** | **Required** when `decision_type` ∈ person-bound set (app + BR-DEC-05) — optional CHECK later |
| Person-bound default set | FE types include appointment/transfer/… | **Defaults:** `appointment`, `transfer` (+ tenant catalog flags); discipline/termination/contract_renewal = config |
| `status` | TEXT default `draft` — **no CHECK** | Vocabulary AS-IS FE: `draft\|pending\|signed\|effective\|expired\|cancelled` |
| F-CORE-DEC-02 trigger | — | **Only** when `status = 'effective'` (and person-bound + `employee_id`) |
| `position_key` | ADD’d E1-A | keep catalog SoT |
| `department_key` | **missing** (only `department` text) | **ADD nullable** preferred for WH copy; else map denorm → WH.`department_key` only when catalog code known |
| Soft-delete | hard DELETE in service today | WH history path: **cấm** hard-delete WH; decision cancel → archive linked WH |

---

## 6. HTP-05 — no new table (CONFIRMED)

| Read | Predicate |
|------|-----------|
| Employee | in scope (`resolveHrmListScope`) |
| Active contract | `employee_contracts.status = 'active'` **AND** same `company_id` **AND** date window contains check date (`start_date` ≤ d AND (`end_date` IS NULL OR `end_date` ≥ d)) |
| AS-IS CHECK | `status IN ('active','expired','terminated')` — **`active` = hiệu lực SoT** |
| Blocker code | `HRM-HTP-NO-ACTIVE-CONTRACT` in readiness DTO — **not** HTTP 500 |
| BH participant | **optional** GĐ1 — default **do not** block payroll unless BR on |

---

## 7. Validation matrix (data)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-EMP-DB-01 | Person-bound QSĐ create/patch | `employee_id` NOT NULL + in scope | else `HRM-DEC-EMP-REQUIRED` |
| VAL-EMP-DB-02 | Status → `effective` | UPSERT WH by `decision_id` | row with `decision_id` + `position_key` |
| VAL-EMP-DB-03 | WH mutate | `position_key` catalog required | else `HRM-WH-PICK-REQUIRED` |
| VAL-EMP-DB-04 | SI action | `action` ∈ enum §3 + `effective_from` | else `HRM-SI-ACTION-400` |
| VAL-EMP-DB-05 | SI action | append period; prior open closed | no silent overwrite amounts |
| VAL-EMP-DB-06 | Two open periods | UQ partial | reject / coalesce `409` |
| VAL-EMP-DB-07 | HTP readiness | no active contract same company | `ready_for_payroll=false` + blocker |
| VAL-EMP-DB-08 | List/get WH or SI | same scope resolver | scope_parity U19 |
| VAL-EMP-DB-09 | Write enrollment SoT | only `employee_insurances` (+ period) | **FAIL** if BE writes AC-SI-TL to records/participants |
| VAL-EMP-DB-10 | Dual table WH | invent `hrm_employment_history` runtime | **FORBIDDEN** |

---

## 8. ADD-DDL checklist for BE (not executed this seat)

```text
ALTER employee_work_timeline
  ADD decision_id UUID NULL
  ADD source_module TEXT NULL
  ADD archived_at TIMESTAMPTZ NULL
  + UQ partial decision_id
  + IX (employee_id, event_date)

ALTER hr_decisions
  ADD department_key TEXT NULL   -- preferred

ALTER employee_insurances
  -- status enum via app (+ optional CHECK active|suspended|stopped|closed)
  ADD policy_id / si_number / archived_at optional

CREATE hrm_insurance_rate_period (…)  -- §3.1
```

**Cấm seat này / Dev:** Prisma wipe · dual-write · seed QSĐ/HĐ/BH for QA · claim UAT.

---

## 9. Traceability

| SRS / AC | Physical | F-id |
|----------|----------|------|
| CORE-01a · AC-DEC-WH-02..03 | `employee_work_timeline.decision_id` | F-CORE-DEC-02 |
| AC-WH-PICK | `position_key` / `department_key` | F-CORE-WH-02 |
| CORE-10 · AC-SI-TL-01..05 | `employee_insurances` + `hrm_insurance_rate_period` | F-CORE-SI-02/03 |
| AC-HTP-05 | `employee_contracts.status=active` | F-CORE-HTP-05 |
| BR-DEC-05 | `hr_decisions.employee_id` | F-CORE-DEC-01 |

---

## 10. Residual (not blocking CONFIRMED)

| Residual | Owner |
|----------|-------|
| Implement ADD-DDL in Nest ensureSchema + jest | **dev-be** BE-01 |
| WH picker + SI actions UI + C&B hide D1 | **dev-fe** FE-01 |
| AC-SI-TL-06 PAY period read | PAY seat |
| CORE-09 template | FE-TPL-01 |
| Browser U65 D1–D7 | **qa** after FE/BE |
| Optional CHECK constraints on status TEXT | BE (non-blocking) |

---

## Completion contract

- `completion_report`: CONFIRMED ONE enrollment=`employee_insurances`; WH=`employee_work_timeline`+ADD `decision_id`; SI action enum 1:1 + ADD period table; `hr_decisions.status=effective` trigger; HTP via `employee_contracts.active`; alias map + soft FK; no apps/**; honesty false.
- `next_owner`: **pm** → unlock **dev-be** + **dev-fe** parallel
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/po-hrm-e2e-link-emp-db-01.md`
