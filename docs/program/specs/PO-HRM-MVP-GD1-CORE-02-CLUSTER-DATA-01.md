# PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01 — Physical DB · Bank/MST on packages + SI rate timeline + ONE C&B SoT (Option A · O6)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-11 seat **#13**) |
| **lane** | governance · ba-data |
| **change_mode** | **RETAIN** LIVE `employee_compensation_packages\|lines\|history` · **ADD** `bank_*` / `tax_id` on package **header** · **RETAIN** `employee_insurances` + `hrm_insurance_rate_period` · **DOC-DELTA** public strip map · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — physical O6 bank/MST home + SI timeline decision · SA Option A · BA O1–O12 |
| **uc_ids** | `UC-BP-CORE-02` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · Wave-10 CORE-01 **SEALED** stamp **`CORE01QC1-MSL6WMS7`** |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md) · **O1/O3/O5/O6/O7/O9** · AC-CORE-CB-01/02 · AC-CORE-02-* · VAL-CORE-CB-* |
| **ref_core01_data** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md) — public strip + deps ONE · **≠ C&B DONE** |
| **ref_si_data** | [`PO-HRM-E2E-LINK-EMP-DB-01.md`](./PO-HRM-E2E-LINK-EMP-DB-01.md) — enrollment + rate period CONFIRMED peer |
| **ref_paper_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) **§3.2** `hrm_employee_compensation` · **§3.6** enrollment / rate period · **§3.3** dependents GTCG consumer · **§3.1** public **no** C&B cols |
| **ref_paper_api** | **F-CORE-EMP-02** UPGRADE residual · **F-CORE-SI-*** RETAIN · **F-CORE-SI-RATE** RETAIN (period LIVE) · **F-CORE-EMP-01** / **F-CORE-DEP-01** RETAIN SEALED · **F-PAY-CB-READ-01** peer OUT |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-02** · **AC-CORE-CB-01/02** · **BR-BP-SEC-02** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel / CORE module UAT **false** · **C-SLICE** · U65 · **DENY** claim CORE-01 public = C&B DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| C&B salary/PC SoT | **ONE** LIVE **`public.employee_compensation_packages`** + **`lines`** + **`history`** — **DENY** second `hrm_employee_compensation*` abandoning packages · **DENY** Nest `/core` compensation table |
| Paper §3.2 alias | `hrm_employee_compensation` ↔ **packages spine** (versioned header+lines+history) — **not** invent dual physical table |
| Bank / MST home | **ADD** on package **header**: `bank_account` · `bank_name` · `tax_id` (+ optional `bank_branch`) — **DENY** public `employees` cols / `custom_fields` as bank/MST SoT · **DENY** second C&B extension table when header ADD suffices |
| History snapshot | **UPGRADE residual (API/Dev after API)** — create/revise history `snapshot` **MUST** include bank/MST (+ currency/effective) with lines |
| SI enrollment SoT | **ONE** **`public.employee_insurances`** — **RETAIN** |
| SI rate timeline | **RETAIN** LIVE **`public.hrm_insurance_rate_period`** (already ADD'd EMP-DB-01) — append-only · **DENY** second period table · **DENY** silent history wipe |
| SI number | On enrollment (`si_number` / `policy_number`) — **not** re-home onto package header (avoid dual SI-number SoT) |
| Public EMP | **RETAIN** CORE-01 strip + **`HRM-CORE-CB-403`** · bank/MST/salary/SI **omit** on public GET · reject on public PATCH |
| Dependents | **ONE** **`public.employee_dependents`** — GTCG **consumer** · C&B may set/consume `is_tax_dependent` · **DENY** second person SoT |
| Nest path | Physical `/contracts-insurance/compensation-packages*` + `/employee-insurances*` — paper `/core/…/compensation` = **alias only** |
| CORE-01 seal | Stamp **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-01-* **RETAIN** · **≠** C&B DONE |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen J-CORE-01 |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `hrm_employee_compensation` | **`employee_compensation_packages` + `lines` + `history`** | **RETAIN** ONE SoT |
| `base_salary` / allowances | `employee_compensation_lines` (`line_type=base\|allowance` · `component_code` CNS) | **RETAIN** |
| `effective_from` / `effective_to` | package header | **RETAIN** · revise closes prior |
| `tax_id` | **`employee_compensation_packages.tax_id`** | **ADD** |
| `bank_account` / `bank_name` | **`…packages.bank_account` / `bank_name`** | **ADD** |
| `bank_*` (branch) | optional **`bank_branch`** on header | **ADD** nullable |
| `social_insurance_no` | **`employee_insurances.si_number`** (or `policy_number` display) | **RETAIN** on SI SoT — **not** package |
| `hrm_insurance_enrollment` | **`employee_insurances`** | **RETAIN** ONE |
| `hrm_insurance_rate_period` | **`hrm_insurance_rate_period`** | **RETAIN** (LIVE) |
| `hrm_dependent` | **`employee_dependents`** | **RETAIN** ONE · GTCG consumer |
| Public EMP C&B keys | strip/deny on `employees` + CF | **RETAIN** CORE-01 DATA §4.3 |
| `/api/hrm/core/…/compensation` | packages / SI physical | **Alias only** — API seat |

```text
  employees (LIVE — public ring SEALED CORE-01)
        RETAIN strip · HRM-CORE-CB-403 · DENY bank/MST/salary/SI SoT
                │
                │ 1-N packages (C&B SoT)
                ▼
  employee_compensation_packages (RETAIN + ADD bank/tax)
        RETAIN: id · company_id · employee_id · contract_id · version ·
                supersedes_package_id · effective_from/to · currency · change_reason · audit
        ADD:    bank_account · bank_name · tax_id · bank_branch? (nullable)
        DENY:   second compensation table · Nest /core dual · public CF SoT
                │
                ├──1-N── employee_compensation_lines (RETAIN)
                │         base / probation / allowance · component_code CNS
                │
                └──1-N── employee_compensation_history (RETAIN)
                          snapshot JSONB — UPGRADE include bank/MST + lines

  employee_insurances (RETAIN ONE enrollment)
        type · provider · policy_number · si_number · contribution* denorm ·
        employer_contribution* denorm · status · start/end · archived_at
                │
                │ 1-N append-only
                ▼
  hrm_insurance_rate_period (RETAIN — EMP-DB-01 LIVE)
        effective_from/to · rates/amounts · period_status · action · soft archive
        DENY: second period table · silent UPDATE overwrite closed history as SoT

  employee_dependents (RETAIN ONE — CORE-01)
        GTCG consumer · is_tax_dependent boundary · DENY second person SoT
```

**Label lock:** «Vòng C&B» = packages + SI enrollment/periods — **not** public EMP.  
**Spine lock:** LIVE packages + employee-insurances — **DENY** Nest `/core` dual.  
**Bank lock:** Header columns on packages — **DENY** employees CF SoT.  
**SI timeline lock:** Period append — enrollment denorm ≠ history SoT.

---

## 3. AS-IS baseline (Nest facts — read-only)

| Object | AS-IS | Gap (Wave-11 O6 / SI) |
|--------|-------|------------------------|
| Packages header | `id · company_id · employee_id · contract_id · version · supersedes_package_id · effective_from/to · currency · change_reason · created_at/updated_at` | **ADD** `bank_account` · `bank_name` · `tax_id` (+ optional `bank_branch`) |
| Package lines | `line_type · amount · allowance_code · component_code · taxable · note · sort_order` | **RETAIN** |
| Package history | `snapshot` JSONB (lines + effective/currency today) | **UPGRADE residual** include bank/MST on write |
| Create/Revise DTO | No bank/tax fields | API F.1 unlock after this DATA |
| Bank/MST elsewhere | Legacy `employees.custom_fields` / FE form keys — **denied** on public (CORE-01) | **DENY** as C&B SoT — migrate read to package header |
| SI enrollment | LIVE `employee_insurances` + soft-delete · type KEY CNS when EFF>0 | **RETAIN** |
| SI rate period | LIVE `hrm_insurance_rate_period` · create seeds first period · `applyAction` append | **RETAIN** — **no** greenfield second table |
| SI PATCH residual | `update()` may set `contribution` / `employer_contribution` denorm **without** appending period | **API residual** — rate change SoT = `…/actions` append; denorm OK for list; silent wipe of period history **FORBIDDEN** |
| Public EMP | SEALED strip + CB-403 | **RETAIN must_keep** · **≠** C&B DONE |
| Dependents | ONE SoT SEALED | **RETAIN** GTCG consumer |
| Nest `/core` C&B | **ABSENT** as SoT | **DENY** invent |
| Source | `employee-compensation.service.ts` · `employee-insurances.service.ts` · `insurance-enrollment-bridge.ts` · CORE-01 public ring | Dev after API CONFIRMED |

**Overwrite-gap decision (mission §2):** Period table **already present** → **do not ADD** another period table. Document **RETAIN** enrollment + period · residual PATCH denorm vs action-append for API-01.

**FORBIDDEN invent this seat:** Nest `/core` compensation/EMP table · second packages SoT · second deps · bank/MST on public employees · second rate period · seed · honesty flip · apps/** · claim CORE-01 = C&B DONE.

---

## 4. Bank / MST physical lock (O6 — normative)

### 4.1 Preferred home — package header **ADD**

| Cột | Kiểu | Null | Default | Ý nghĩa | Maps |
|-----|------|------|---------|----------|------|
| **`bank_account`** | text | YES | NULL | Số TK nhận lương | §3.2 `bank_account` · AC-CORE-02-06 |
| **`bank_name`** | text | YES | NULL | Tên NH | §3.2 `bank_name` |
| **`bank_branch`** | text | YES | NULL | Chi nhánh (optional) | `bank_*` family |
| **`tax_id`** | text | YES | NULL | MST cá nhân | §3.2 `tax_id` |

**Invariant CORE-CB-BANK-MST-HOME:** Persist bank/MST **only** on C&B package SoT (header). Public GET `/employees*` **MUST omit**; public PATCH with these keys → **`HRM-CORE-CB-403`**.

**Invariant CORE-CB-BANK-MST-ONE:** **DENY** treating `employees.custom_fields.bank_*|tax_*|mst` as SoT after Wave-11 lock — legacy values may remain in DB until migrate/cleanup peer; **read/write product path** = packages.

**Invariant CORE-CB-NO-EXT-DUAL:** Prefer header ADD. A separate `employee_compensation_bank_tax` extension is **only** allowed if Dev proves header ADD blocked — and **MUST** soft-FK `package_id` 1–1 · **MUST NOT** invent parallel salary SoT. Default this DATA seat = **header ADD**.

### 4.2 History / versioning interaction

| Event | Rule |
|-------|------|
| Create package with bank/MST | Persist on header · history snapshot includes bank/MST + lines |
| Revise salary/PC only | New package version · **copy forward** prior bank/MST unless payload overrides · prior package `effective_to` closed |
| Revise bank/MST only | Still **revise** (new version) **or** PATCH active header **same version** — API chooses; if same-version PATCH, history append optional audit row · **DENY** silent unpaid overwrite of locked paid period (O5) |
| Paid/locked period | Overlap / rewrite → **409** peer (`HRM-CORE-CB-OVERLAP-409` mint or RETAIN) |

### 4.3 Mask / display (data contract hint for API)

| Field | C&B role view | View-only / non-full | Public |
|-------|---------------|----------------------|--------|
| `bank_account` | full (AuthZ) | mask last 4 | **DENY** |
| `bank_name` | full | full or mask | **DENY** |
| `tax_id` | full (AuthZ) | mask | **DENY** |

### 4.4 Illustrative DDL (docs only — Dev after API)

```sql
ALTER TABLE public.employee_compensation_packages
  ADD COLUMN IF NOT EXISTS bank_account TEXT NULL,
  ADD COLUMN IF NOT EXISTS bank_name TEXT NULL,
  ADD COLUMN IF NOT EXISTS bank_branch TEXT NULL,
  ADD COLUMN IF NOT EXISTS tax_id TEXT NULL;

-- FORBIDDEN examples (must NOT ship as CORE-02 SoT):
-- ALTER TABLE public.employees ADD COLUMN bank_account …;     -- public SoT
-- ALTER TABLE public.employees ADD COLUMN tax_id …;
-- CREATE TABLE public.hrm_employee_compensation (…);          -- second C&B SoT
-- CREATE TABLE public.core_employee_compensation (…);         -- Nest /core dual
```

---

## 5. SI enrollment + rate timeline (mission §2)

### 5.1 Decision matrix

| Question | Finding | Decision |
|----------|---------|----------|
| Does `employee_insurances` alone hold rate history safely? | AS-IS historically overwrote `contribution` on row | Gap closed by EMP-DB-01 |
| Is `hrm_insurance_rate_period` LIVE? | **YES** — ensureSchema + create seed + applyAction append | **RETAIN** — **no** second ADD table this seat |
| Overwrite gap remaining? | PATCH update may denorm amounts without period append | **Residual API** — not re-ADD table |

### 5.2 RETAIN column map — enrollment

| Physical | Role | Notes |
|----------|------|-------|
| `id` · `employee_id` · `company_id` | PK + soft FK + U19 | **RETAIN** |
| `type` | insurance_type_key alias | CNS when EFF>0 |
| `provider` · `policy_number` · `si_number` | SI identity | Number SoT here — not packages |
| `start_date` / `end_date` | Enrollment window | |
| `contribution` / `employer_contribution` | **Denorm current** for list | **≠** timeline SoT |
| `status` | active\|suspended\|stopped\|closed (+ legacy) | **RETAIN** |
| `archived_at` | Soft-delete | **RETAIN** |

### 5.3 RETAIN — `hrm_insurance_rate_period` (append-only SoT)

| Cột (LIVE / paper) | Rule |
|--------------------|------|
| `enrollment_id` soft → `employee_insurances.id` | ONE enrollment parent |
| `effective_from` required · `effective_to` close prior | Append on `change_rate` / suspend / stop / close / resume |
| amounts / rate_pct / `pay_rate_cfg_id` | Timeline SoT |
| `period_status` · `action` | AC-SI-TL vocabulary |
| UQ open period | `(enrollment_id) WHERE effective_to IS NULL AND archived_at IS NULL` |
| Soft `archived_at` | Soft-delete doctrine |

**Invariant CORE-SI-RATE-APPEND:** Rate/amount history mutate = **append period** (+ close prior open) — **FORBIDDEN** UPDATE closed period amounts as product SoT.

**Invariant CORE-SI-DENORM:** Enrollment `contribution*` may mirror **current** open period for list — **MUST NOT** replace period history.

**Invariant CORE-SI-ONE:** **DENY** `employee_insurance_records` / `hrm_insurance_policy_participants` as enrollment/timeline SoT.

### 5.4 Residual for API-01 (not Dev this seat)

| Residual | Expectation |
|----------|-------------|
| PATCH `/employee-insurances/:id` with contribution change | Prefer **400/409** redirect to `…/actions` `change_rate` **or** document denorm-only + no period delete — API F.1 chooses fail-closed |
| F-CORE-SI-RATE | **RETAIN** (table LIVE) — mint/confirm action contracts · **not** greenfield ADD table |
| Catalog KEY | INS-TYPE / INSURER CNS **RETAIN** |

---

## 6. Public strip map (RETAIN CORE-01 — must_keep)

Cross-cite CORE-01 DATA §4.3 CB deny-list. Wave-11 **does not rewrite** public allow-list.

| Deny family on public `/employees*` | Outcome |
|-------------------------------------|---------|
| `salary` / `base_salary` / allowances | GET omit · PATCH **403** `HRM-CORE-CB-403` |
| `bank_account` / `bank_name` / `bank_*` | same |
| `tax_id` / `tax_code` / `mst` | same |
| SI detail / rates | same |

**Invariant CORE-CB-PUBLIC (AC-CORE-CB-02):** After C&B save 2xx + F5, public GET still **no** salary/NH/MST/SI detail.

**Invariant CORE-CB-≠-PUB-DONE:** CORE-01 GWC **≠** FR-UC-BP-CORE-02 DONE.

---

## 7. Dependents GTCG (O7 — RETAIN)

| Rule | Spec |
|------|------|
| ONE SoT | `public.employee_dependents` |
| C&B | May set/consume `is_tax_dependent` |
| DENY | Second person SoT on payroll / C&B form «nhập NPT mới» as parallel SoT |
| PAY | `dependent_count` **≠** person SoT |

---

## 8. FK / referential / scope rules

| Rule ID | Predicate | Outcome |
|---------|-----------|---------|
| **DV-CORE-CB-01** | Packages = ONE C&B salary SoT | Second compensation table → **FAIL O1** |
| **DV-CORE-CB-02** | Bank/MST on package header | Public CF SoT → **FAIL O6** |
| **DV-CORE-CB-03** | History snapshot includes bank/MST after UPGRADE | Missing on create/revise → residual FAIL |
| **DV-CORE-CB-04** | Revise closes prior open segment | Silent overwrite paid → **409** |
| **DV-CORE-CB-05** | list packages = get = revise = active/history | U19 scope_parity |
| **DV-CORE-SI-01** | Enrollment ONE + period RETAIN | Second period/enrollment SoT → **FAIL** |
| **DV-CORE-SI-02** | Rate change = append period | Silent wipe history → **FAIL** |
| **DV-CORE-DEP-01** | GTCG → ONE deps | Second person SoT → **FAIL O7** |
| **DV-CORE-PUB-01** | Public deny-list RETAIN | Leak after C&B → **FAIL AC-CORE-CB-02** |
| **DV-CORE-PATH-01** | Nest `/core` compensation SoT | **FAIL O1** |
| **DV-CORE-DONE-01** | Claim CORE-01 = C&B DONE | **FAIL O9** |
| **DV-CORE-HON-01** | Seed / honesty flip | **FAIL** U65 / O10 |

**scope_parity:** list packages **=** get/revise/history/active **=** employee-insurances list/get/actions **=** public employees family under same `resolveHrmListScope`. Flag if list id → detail 404 under group CEO `main`.

---

## 9. Data interaction matrix

| Entity | C | R | U | D / soft | Transition |
|--------|---|---|---|----------|------------|
| `employee_compensation_packages` | POST create | list/get/active | revise / optional PATCH bank | Soft via history chain (prefer no hard-delete product) | version++ · close prior |
| `employee_compensation_lines` | with package | with package | replace on revise | with package | |
| `employee_compensation_history` | append on create/revise | GET history | **DENY** mutate snapshot | soft archive peer | audit trail |
| Bank/MST cols | on create/revise/PATCH C&B | C&B AuthZ | C&B only | — | **DENY** public |
| `employee_insurances` | POST | list/get | PATCH meta/denorm | soft `archived_at` | status via actions |
| `hrm_insurance_rate_period` | append on enroll/action | get periods[] | close prior `effective_to` only | soft archive | AC-SI-TL |
| `employee_dependents` | RETAIN CORE-01 | consume GTCG | flag tax | soft | **≠** salary |
| `employees` public | RETAIN | strip | deny C&B | soft | **≠** C&B mutate |

---

## 10. Validation matrix (data-layer)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-CORE-CB-D-01** | ONE packages SoT | No second compensation table | FAIL if invent |
| **VAL-CORE-CB-D-02** | Bank/MST ADD header | Cols on packages | Persist C&B · public omit |
| **VAL-CORE-CB-D-03** | Public CF bank/MST | Not SoT | CB-403 / strip |
| **VAL-CORE-CB-D-04** | History snapshot | Includes bank/MST after upgrade | Residual until Dev |
| **VAL-CORE-CB-D-05** | Version revise | Prior closed · history ≥2 | No silent paid overwrite |
| **VAL-CORE-CB-D-06** | SI enrollment ONE | `employee_insurances` | No dual records SoT |
| **VAL-CORE-CB-D-07** | SI period RETAIN | `hrm_insurance_rate_period` | No second period table |
| **VAL-CORE-CB-D-08** | Rate append | applyAction | No wipe closed periods |
| **VAL-CORE-CB-D-09** | Deps ONE | GTCG consumer | No second person SoT |
| **VAL-CORE-CB-D-10** | Public F5 | AC-CORE-CB-02 | No leak |
| **VAL-CORE-CB-D-11** | Nest `/core` | Alias only | FAIL dual |
| **VAL-CORE-CB-D-12** | CORE-01 ≠ DONE | Seal retained | FAIL claim C&B DONE |
| **VAL-CORE-CB-D-13** | U19 | packages=SI=public family | Cross-CT FAIL |
| **VAL-CORE-CB-D-14** | Honesty / seed | false / FE-only | FAIL flip/seed |
| **VAL-CORE-CB-D-15** | Extension dual | Header preferred | FAIL orphan extension SoT |

---

## 11. Traceability (BRD/SRS → DB → API → FE → Test)

| Requirement | DB physical | API (next) | FE / Journey | Test expect |
|-------------|-------------|------------|--------------|-------------|
| FR-UC-BP-CORE-02 #1–#2 · BR-BP-SEC-02 | packages + SI | **F-CORE-EMP-02** UPGRADE · SI RETAIN | **J-HRM-CORE-02-01/02** | AuthZ · create/revise · F5 |
| O6 bank/MST · AC-CORE-02-06 | §4 header ADD | F-CORE-EMP-02 body fields | J-02-04 | Persist C&B · public omit |
| O5 versioning | packages+history | revise/history/active | J-02-02 | history ≥2 |
| AC-CORE-CB-01/02 · O3 | CORE-01 strip RETAIN | **`HRM-CORE-CB-403`** RETAIN | J-02-03 · J-CORE-01-02 | F5 clean · 403 |
| SI timeline · ALT-03 | period RETAIN | F-CORE-SI-03 / SI-RATE | J-02-04 | append · no wipe |
| O7 GTCG | deps ONE | F-CORE-DEP-01 RETAIN | J-02-04 | consume · no dual |
| O1 path | no Nest core table | paper `/core/…/compensation` alias | Network packages* | FAIL dual |
| O9 ≠ DONE | — | — | review | FAIL claim CORE-01=C&B DONE |
| U19 scope_parity | company_id packages+SI | same resolver | Group CEO | list=get=revise=SI |

**J-* DRAFT (BA):** `J-HRM-CORE-02-01..04` — promote after API+Dev+QA.  
**must_keep:** `J-HRM-CORE-01-01..04` SEALED — **DENY** reopen rewrite.

---

## 12. Error mapping (data outcomes → API codes)

| Data fail | HTTP | Code | Notes |
|-----------|------|------|-------|
| Public body C&B / bank / MST / SI | 403 | **`HRM-CORE-CB-403`** | **RETAIN** |
| Open/mutate C&B without membership | 403 | `HRM-CORE-CB-AUTHZ-403` | mint optional · ≠ public CB-403 |
| Overlap / locked period rewrite | 409 | `HRM-CORE-CB-OVERLAP-409` | mint or RETAIN peer |
| Missing `effective_from` / invalid amount | 400 | `HRM-CORE-CB-VAL-400` | mint |
| Invent allowance component | 400 | `HRM-SC-COMP-KEY` | RETAIN CNS |
| SI invent type/insurer | 400 | `HRM-INS-TYPE-KEY` / `HRM-INS-INSURER-KEY` | RETAIN |
| SI action / open period conflict | 400/409 | `HRM-SI-ACTION-400` / open UQ | RETAIN |
| Scope | 404/409 | `HRM-SCOPE-409` / EINS-409 | U19 |
| Enrollment not found | 404 | `HRM-EINS-404` | RETAIN |

---

## 13. DENY / must_keep footer

| Class | Items |
|-------|--------|
| **must_keep** | LIVE `employee_compensation_packages\|lines\|history` · LIVE `/employee-insurances*` · LIVE `hrm_insurance_rate_period` · CORE-01 public strip · **`HRM-CORE-CB-403`** · `employee_dependents` ONE · Nest `/core` DENY · stamp **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-01-* · soft-delete · U19 · salary_components CNS · SI catalog CNS · W1–W9 REC seals · honesty false |
| **DENY** | Nest `/core` dual EMP/compensation · second compensation SoT · second deps SoT · second rate period · bank/MST on public employees/CF as SoT · write C&B onto public · claim CORE-01 public = C&B DONE · reopen J-HRM-CORE-01-* without regression · CORE-02b / CORE-01a / CORE-09/10 invent deep · PAY process invent · seed · honesty flip · apps/** this seat |
| **OUT** | UC-BP-CORE-02b metadata · CORE-01a DEC→WH · PAY payslip run · formula LIVE claim |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · CORE/personnel UAT **false** · **C-SLICE** |

---

## 14. Unlock ladder (next — **not Dev**)

```text
DATA-01 CONFIRMED (this seat)
  → sa API-01 F.1
       F-CORE-EMP-02 UPGRADE residual physical on
         /api/hrm/contracts-insurance/compensation-packages*
         (+ revise / history / active)
         ADD bank_account · bank_name · tax_id (+ bank_branch?) on create/revise/DTO
         AuthZ C&B + access audit residual
         history snapshot includes bank/MST
         paper GET/PATCH /api/hrm/core/employees/{id}/compensation = alias only
         optional thin /employees/:id/compensation* MUST same packages SoT
       F-CORE-SI-* RETAIN + SI-RATE residual
         enrollment ONE · period append RETAIN
         harden PATCH contribution vs …/actions change_rate (fail-closed prefer)
         mint/retain HRM-CORE-CB-AUTHZ-* · OVERLAP-409 · VAL-400 as needed
       RETAIN HRM-CORE-CB-403 · F-CORE-EMP-01 · F-CORE-DEP-01 · U19
  → Dev-BE / Dev-FE only after API CONFIRMED
  → QA U65 J-HRM-CORE-02-01..04 · QC GWC C-SLICE
```

**cấm Dev** until API-01 CONFIRMED.

---

## 15. Data quality risks & mitigation

| Risk | Mitigation |
|------|------------|
| Legacy CF still holds bank/MST | Strip public · product SoT = package header · optional cleanup peer |
| Dev invents `hrm_employee_compensation` dual | DENY §1/§13 · alias map §2 |
| Extension table + header both SoT | Prefer header only · DENY dual |
| History snapshot omits bank/MST | API residual mandatory include |
| PATCH SI contribution wipes narrative history | Period RETAIN · API harden · denorm ≠ SoT |
| Claim CORE-01 = C&B DONE | O9 · C-SLICE |
| Nest `/core` controller as write SoT | Alias only · FAIL O1 |
| Seed packages to pass QA | U65 DENY |
| Closed CHK on bank name freezes catalog | Free text / open bank catalog consumer — no product ceiling invent this seat |

---

## 16. Completion

| Field | Value |
|-------|--------|
| **completion_report** | Physical DOC-DELTA **CONFIRMED** for UC-BP-CORE-02 O6 (+ SI timeline): **ADD** `bank_account` · `bank_name` · `tax_id` (+ optional `bank_branch`) on LIVE **`employee_compensation_packages` header** — **DENY** public employees/CF as bank/MST SoT · **DENY** second compensation extension as default; **RETAIN** packages\|lines\|history ONE SoT · **RETAIN** `employee_insurances` + LIVE **`hrm_insurance_rate_period`** (no second period ADD — overwrite gap already closed; residual PATCH denorm vs action-append for API); **RETAIN** `employee_dependents` ONE (GTCG) · public strip · **`HRM-CORE-CB-403`**; **DENY** Nest `/core` dual · claim CORE-01=C&B DONE · reopen J-CORE-01 · seed · honesty · apps/**. Unlock **sa** API F.1 **F-CORE-EMP-02** UPGRADE + SI residual — **not Dev**. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-data-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-02
depends_on: DATA-01 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md · BA O1–O12 · peer CORE01QC1-MSL6WMS7
spec_ref: F-CORE-EMP-02 UPGRADE · F-CORE-SI-* RETAIN · SI-RATE residual · BR-BP-SEC-02 · AC-CORE-CB-01/02 · DATA §4–§5

MISSION — API F.1 lock (docs-only):
1) UPGRADE F-CORE-EMP-02 physical on /api/hrm/contracts-insurance/compensation-packages* (+ revise/history/active): AuthZ+audit; ADD bank_account/bank_name/tax_id (+bank_branch?) on DTO create/revise; history snapshot MUST include bank/MST; paper /core/…/compensation = alias only; thin /employees/:id/compensation* MUST same packages SoT
2) RETAIN F-CORE-SI enrollment + hrm_insurance_rate_period append; residual harden PATCH contribution vs …/actions change_rate (fail-closed prefer); mint HRM-CORE-CB-AUTHZ-*/OVERLAP-409/VAL-400 as needed; RETAIN HRM-CORE-CB-403
3) RETAIN F-CORE-EMP-01 / F-CORE-DEP-01 · U19 list=get=revise=SI · display-ready amounts/dates
4) DENY Nest /core dual · second compensation/deps SoT · claim CORE-01=C&B DONE · reopen J-CORE-01 · seed · honesty flip · apps/** · Dev until API CONFIRMED
5) Unlock Dev-BE+FE after API CONFIRMED — not this seat

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md · PASS_TO_PM · next Dev HOLD until CONFIRMED
```
