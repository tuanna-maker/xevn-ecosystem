# PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01 — Physical DB · Public EMP allow/deny strip + ONE dependents SoT (Option A · O2/O5)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-10 seat **#12**) |
| **lane** | governance · ba-data |
| **change_mode** | **RETAIN** LIVE `public.employees` · **ADD** `public.employee_dependents` · **DOC-DELTA** public allow-list + CB deny-list strip map · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — physical O2 allow/strip + O5 ONE dependents SoT · SA Option A · BA O1–O12 |
| **uc_ids** | `UC-BP-CORE-01` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · Wave-9 REC-07 **SEALED** stamp **`REC07QC1-MSL5WXU5`** |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md) · **O2/O5/O6** · AC-CORE-01-* · VAL-CORE-PUB-* · §1.1 logical matrix |
| **ref_hire_data** | [`PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01.md) — soft `candidate_id` / prefill **RETAIN ≠ CORE DONE** |
| **ref_paper_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) **§3.1** `hrm_employee` public · **§3.3** `hrm_dependent` · **§3.2** C&B **OUT** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-CORE-EMP-01** · **F-CORE-DEP-01** residual · physical prefer `/employees*` · paper `/core` alias |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-01** · **BR-BP-SEC-01** · AC-CORE-PUB-01/02 · AC-CORE-CB-MAP-01 |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel / CORE module UAT **false** · **C-SLICE** · U65 |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| EMP SoT | **ONE** LIVE **`public.employees`** — **DENY** second `hrm_employee*` / Nest `/core` EMP table |
| Public ring | **UPGRADE** serializer strip map + PATCH CB deny-list on LIVE cols + `custom_fields` keys — **no** second EMP |
| C&B storage | Legacy money/NH/MST/SI may still exist under `custom_fields` / peers — **MUST NOT** appear on public GET/list DTO · PATCH with those keys → **`HRM-CORE-CB-403`** (API) — physical home for mutate = **CORE-02** `employee_compensation` peer (**OUT**) |
| Dependents SoT | **ONE** **`public.employee_dependents`** ↔ paper **`hrm_dependent`** alias — **ADD** if ABSENT |
| Soft-delete deps | **`archived_at`** — hard DELETE **not** sole product path |
| Tax flag | **`is_tax_dependent`** boolean **ALLOW** on dep row (boundary) — GTCG / tax detail mutate **OUT** CORE-02 / PAY-03 |
| Scope | Dep `company_id` = parent emp `company_id` · U19 list=get=patch=deps |
| Hire | Soft `employees.candidate_id` + REC-07 soft stamp **RETAIN** — **DENY** hard FK reopen · hire ≠ CORE DONE |
| Nest path | Physical `/api/hrm/employees*` + `/employees/:id/dependents*` — paper `/core/*` = **alias only** |
| PAY count | Tax-policy `dependent_count` **≠** person SoT — **DENY** rewrite PAY as dependents CRUD |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen J-07 |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `hrm_employee` | **`public.employees`** | **RETAIN** ONE SoT |
| `work_email` | `employees.email` | **RETAIN** |
| `employee_code` / `full_name` / `status` | same columns | **RETAIN** |
| `position_key` | `employees.job_title_key` | **RETAIN** |
| `hire_date` | `employees.hired_at` | **RETAIN** |
| `manager_employee_id` | `employees.manager_id` | **RETAIN** |
| `candidate_id` | `employees.candidate_id` | **RETAIN** soft (REC-07) |
| `department_id` | `custom_fields.department_key` (+ display denorm) | **RETAIN** JSON path |
| `work_phone` / `personal_phone` | `custom_fields.phone_number` / `work_phone` / `personal_phone` | **RETAIN** |
| Emergency / address / CCCD | `custom_fields.*` allow keys §4 | **RETAIN** / checklist |
| `profile_groups_json` | optional peer CORE-02b | **OUT** invent this seat |
| §3.2 C&B cols | **not** public EMP SoT — peer `employee_compensation` | **OUT** · strip/deny on public |
| Legacy FE salary/bank/tax/SI | Often in `custom_fields` or DTO projection | **STRIP/DENY** public ring §4–§5 |
| `hrm_dependent` | **`public.employee_dependents`** | **ADD** ONE SoT |
| `/api/hrm/core/employees/{id}` | `/api/hrm/employees/:id` | **Alias only** — API seat |
| `/core/…/dependents` | `/api/hrm/employees/:id/dependents*` | **Alias only** |

```text
  employees (LIVE — RETAIN ONE EMP SoT)
        RETAIN: id · company_id · employee_code · email · full_name ·
                job_title_key · status · hired_at · manager_id ·
                avatar_url · candidate_id (soft) · archived_at · custom_fields
        UPGRADE (API): public DTO strip CB keys · PATCH reject CB keys
        DENY:   second EMP table · Nest /core dual · CORE-02 cols as public SoT
                │
                │ 1-N welfare (ADD)
                ▼
  employee_dependents (ADD — paper hrm_dependent)
        ADD: id · employee_id (soft→employees.id) · company_id ·
             full_name · relation_code · date_of_birth ·
             is_tax_dependent · effective_from/to? · archived_at · audit
        DENY: second deps SoT · PAY dependent_count as person CRUD · hard-delete sole

  employee_compensation / CORE-02 (OUT this seat)
        Peer C&B — public ring MUST NOT write/read as SoT

  REC-07 soft hire (SEALED RETAIN)
        candidate_id soft · DENY hard FK reopen · ≠ CORE-01 DONE
```

**Label lock:** «Hồ sơ vòng công khai» = EMP public allow-list + dependents welfare — not C&B mutate.  
**Spine lock:** LIVE `/employees` — **DENY** Nest `/core` dual EMP.  
**Deps lock:** ONE `employee_dependents` — **DENY** second person SoT.  
**Ring lock:** BR-BP-SEC-01 fail-closed strip + CB-403.

---

## 3. AS-IS baseline (Nest facts — read-only)

| Object | AS-IS | Gap (Wave-10 O2/O5) |
|--------|-------|---------------------|
| EMP table | `public.employees` ensureSchema: `id · company_id · employee_code · email NOT NULL · full_name · job_title_key · status · hired_at · archived_at · custom_fields · manager_id · avatar_url · candidate_id` | **RETAIN** SoT — strip map lock |
| Public serializer | `mapEmployee` + display-ready still may surface/merge CF; FE form carries salary/bank/tax/SI | **UPGRADE** public omit + CB reject (API) |
| List summary | `EMPLOYEE_SALARY_NUM_SQL` reads `custom_fields.salary|base_salary` → salary bands | Public non-C&B bind **MUST NOT** expose bands (API/FE gate) — **DENY** treat summary salary as public ring SoT |
| Dependents person CRUD | **ABSENT** Nest table/API | **ADD** `employee_dependents` |
| PAY tax participants | `dependent_count` INT on tax policy rows | **≠** CORE-01 person SoT — **RETAIN** PAY count peer |
| Nest `/core` EMP | **ABSENT** as SoT | **DENY** invent |
| Hire soft link | REC-07 SEALED | **RETAIN** · **≠** CORE DONE |
| Source | `employees.service.ts` · `employee-summary.ts` · `EmployeeFormDialog.tsx` | Dev after API CONFIRMED |

**FORBIDDEN invent this seat:** Nest `/core` EMP table · second EMP · second deps · hard FK hire reopen · CORE-02 compensation table as required for this GWC · seed · honesty flip · apps/**.

---

## 4. Public allow-list + CB deny-list strip map (O2/O3 — normative)

### 4.1 Top-level `employees` columns — public ring

| Physical column | Public GET/list | Public PATCH/POST | Notes |
|-----------------|-----------------|-------------------|-------|
| `id` | ALLOW | NO (immutable) | |
| `company_id` | ALLOW | Scope-governed | U19 |
| `employee_code` | ALLOW | ALLOW | UQ per CT |
| `email` | ALLOW | ALLOW | = paper `work_email` |
| `full_name` | ALLOW | ALLOW | required |
| `job_title_key` | ALLOW | ALLOW | + display label |
| `status` | ALLOW | ALLOW | open catalog consumer |
| `hired_at` | ALLOW | ALLOW | = `hire_date` |
| `manager_id` | ALLOW | ALLOW | = `manager_employee_id` |
| `avatar_url` | ALLOW | ALLOW | |
| `candidate_id` | ALLOW display-ready | System/hire path | Soft · **no** hard FK |
| `archived_at` | Soft-delete rules | Soft archive | RETAIN doctrine |
| `created_at` / `updated_at` | ALLOW audit | System | |
| `custom_fields` | **Filtered** §4.2 | **Filtered** §4.2–4.3 | Never raw dump C&B keys |

**Invariant CORE-PUB-COL:** Public DTO projects **only** §4.1 + §4.2 allow keys (+ display-ready labels). Extra C&B keys = **FAIL O2**.

### 4.2 `custom_fields` keys — **ALLOW** (public admin / welfare)

| Key (physical JSON) | Maps BA logical | Rule |
|---------------------|-----------------|------|
| `phone_number` | work/personal phone (OS 28) | ALLOW |
| `work_phone` | work phone | ALLOW |
| `personal_phone` | personal contact | ALLOW |
| `department_key` | `department_id` | ALLOW · catalog REF |
| `department` / dept display denorm | display-ready | ALLOW read · prefer key write |
| `job_title_label` / `position` | position display | ALLOW read (not invent catalog SoT) |
| `emergency_contact` / `emergency_contact_name` | emergency | ALLOW |
| `emergency_phone` / `emergency_contact_phone` | emergency | ALLOW |
| `address` / address parts | checklist | ALLOW |
| `cccd` / `national_id` / id-card checklist keys ∈ Settings EFF | checklist | ALLOW consumer · invent → `HRM-EMP-CUSTOM-FIELD-KEY` |
| Other Settings EFF custom keys **non-C&B** | CF consumer | ALLOW iff ∈ EFF · **F-EMP-CF-CNS-01 RETAIN** |
| `tenant_id` | partition | System RETAIN — **DENY** self invent as public business SoT |

### 4.3 CB **DENY-LIST** (strip on GET · reject on PATCH/POST) — BR-BP-SEC-01

Any of the following as **top-level body key**, **DTO projection key**, or **`custom_fields` key** on public `/employees*` ring:

| Deny key family | Examples | Outcome |
|-----------------|----------|---------|
| Money / salary | `salary`, `base_salary`, `allowances`, `allowance_*`, `*_salary`, money phụ cấp | GET omit · PATCH **403** `HRM-CORE-CB-403` |
| Bank | `bank_account`, `bank_name`, `bank_*` | same |
| Tax ID | `tax_code`, `tax_id`, `mst` | same |
| SI / BHXH detail | `social_insurance_number`, `social_insurance_code`, `social_insurance_no`, `social_insurance_rate`, `bhxh_*`, `si_rate*` | same |
| Compensation peer shape | keys that write §3.2 compensation SoT via public path | same · **OUT** CORE-02 |

**Invariant CORE-PUB-STRIP:** Even if legacy rows still store deny keys in `custom_fields`, **public GET/list MUST omit** them (AC-CORE-PUB-01/02 · F5).

**Invariant CORE-PUB-REJECT:** Body containing deny keys → **403** `HRM-CORE-CB-403` — **silent strip-and-200 = FAIL O3**.

**Invariant CORE-PUB-SUMMARY:** `GET …/employees/summary` salary bands / `avg_salary` / `total_payroll` are **not** public-ring SoT for non-C&B bind — API-01 must gate or separate C&B summary; **DENY** claim public profile DONE while leaking bands on default public dashboard.

### 4.4 List vs get parity (U19 · scope_parity)

| Surface | Same strip map? | Scope |
|---------|-----------------|-------|
| `GET /employees` list item | **YES** — no C&B keys | `resolveHrmListScope` |
| `GET /employees/:id` | **YES** | same |
| `PATCH /employees/:id` | Write allow §4.1–4.2 only · deny §4.3 | same |
| `…/dependents*` | Dep DTO §5 — no emp C&B leak | emp in scope ⇒ deps in scope |

**Flag `scope_parity`:** list returns id but get/patch/deps 404 under group CEO `main` = defect.

---

## 5. ONE dependents SoT — `public.employee_dependents` (O5/O6)

### 5.1 Alias

| Paper | Physical | Role |
|-------|----------|------|
| `hrm_dependent` | **`public.employee_dependents`** | **ONE** person/welfare SoT |
| — | PAY `dependent_count` | **≠** SoT — count-only peer |

### 5.2 Column lock (ADD)

| Cột | Kiểu | Null | Default | Ý nghĩa | Maps |
|-----|------|------|---------|----------|------|
| **`id`** | uuid | NO | — | PK | §3.3 |
| **`employee_id`** | uuid | NO | — | Soft → `employees.id` · **app assert** same CT · **DENY** CASCADE hard-delete sole | §3.3 |
| **`company_id`** | text | NO | — | Denorm = parent emp `company_id` · U19 | §3.3 · O5 |
| **`full_name`** | text | NO | — | Họ tên người phụ thuộc | O5 · AC-06 |
| **`relation_code`** | text | NO | — | Soft open key (`child`\|`spouse`\|`parent`\|`other`…); display-ready label from BE | O5 · O11 |
| **`date_of_birth`** | date | YES* | NULL | Quà 1/6 eligibility | O5 · AC-07 |
| **`is_tax_dependent`** | boolean | NO | `false` | Boundary flag — public may store/show limited · **GTCG mutate OUT** | O6 |
| **`effective_from`** | date | YES | NULL | Optional validity | §3.3 |
| **`effective_to`** | date | YES | NULL | Optional validity | §3.3 |
| **`archived_at`** | timestamptz | YES | NULL | Soft-delete | O5 · VAL-09 |
| **`created_at`** / **`updated_at`** | timestamptz | NO | now() | Audit | |

\*BA: DOB **required for quà 1/6 filter eligibility**; POST without DOB → **400** `HRM-CORE-DEP-VAL-400` when welfare create requires it, or soft-warn incomplete eligibility — **DENY** infer DOB/eligibility from C&B ring.

### 5.3 Constraints / indexes (recommend)

| Rule | Spec |
|------|------|
| **PK** | `id` |
| **IX active by emp** | `(employee_id) WHERE archived_at IS NULL` |
| **IX scope** | `(company_id, employee_id)` |
| **IX relation** | `(company_id, relation_code)` |
| **CHK format (optional)** | `relation_code ~ '^[a-z][a-z0-9_]*$'` — **format only** · **FORBIDDEN** closed `IN ('child','spouse')` product ceiling |
| **Soft FK** | `employee_id` UUID **without** `ON DELETE CASCADE` product path — soft archive emp/dep |
| **Scope invariant** | `company_id` **must equal** parent `employees.company_id` (normalized slug) — mismatch → 409/400 |
| **List default** | `archived_at IS NULL` · `include_archived` audit optional |

### 5.4 Illustrative DDL (docs only — Dev after API)

```sql
CREATE TABLE IF NOT EXISTS public.employee_dependents (
  id UUID PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  relation_code TEXT NOT NULL,
  date_of_birth DATE NULL,
  is_tax_dependent BOOLEAN NOT NULL DEFAULT FALSE,
  effective_from DATE NULL,
  effective_to DATE NULL,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emp_deps_employee_active
  ON public.employee_dependents (employee_id)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_emp_deps_company_employee
  ON public.employee_dependents (company_id, employee_id);

CREATE INDEX IF NOT EXISTS idx_emp_deps_company_relation
  ON public.employee_dependents (company_id, relation_code);

-- FORBIDDEN examples (must NOT ship as CORE-01 SoT):
-- CREATE TABLE public.hrm_dependent …;          -- second physical SoT
-- CREATE TABLE public.core_employees …;         -- Nest /core dual EMP
-- ALTER TABLE employees ADD COLUMN base_salary …; -- CORE-02 on public
-- ALTER … ADD CONSTRAINT fk_hire_candidate FOREIGN KEY (candidate_id) REFERENCES recruitment_candidates(id);
```

### 5.5 Dependents DTO / display-ready (data contract for API)

| Field | Source | Public |
|-------|--------|--------|
| `id`, `employee_id`, `company_id` | cols | ALLOW |
| `full_name`, `relation_code`, `relation_label` | col + label map | ALLOW |
| `date_of_birth` | col · `dd/MM/yyyy` UX | ALLOW |
| `is_tax_dependent` | col | ALLOW limited flag |
| `effective_from` / `effective_to` | cols | ALLOW |
| `archived_at` | col | audit |
| salary / MST / bank of **employee** | — | **DENY** leak via deps payload |

**Invariant CORE-FAMILY-≠-SALARY:** Presence of dependents **≠** authorize salary view.

**Invariant CORE-DEP-ONE:** **DENY** second deps table / PAY-owned person rewrite.

---

## 6. FK / referential / scope rules

| Rule ID | Predicate | Outcome |
|---------|-----------|---------|
| **DV-CORE-PUB-01** | Public DTO ⊆ §4 allow | Extra C&B → **FAIL O2** |
| **DV-CORE-PUB-02** | PATCH/POST has §4.3 deny key | **403** `HRM-CORE-CB-403` · no persist |
| **DV-CORE-PUB-03** | Legacy CF still has salary keys | GET omit · F5 clean |
| **DV-CORE-DEP-01** | Dep `company_id` = emp `company_id` | Mismatch → reject |
| **DV-CORE-DEP-02** | Dep `employee_id` soft · emp in scope | Out of scope → 404/409 |
| **DV-CORE-DEP-03** | Soft-delete | Set `archived_at` · list hides |
| **DV-CORE-DEP-04** | Hard-delete sole SoT | **FAIL** soft-delete doctrine |
| **DV-CORE-DEP-05** | Quà 1/6 | Filter by `date_of_birth` (+ relation) on deps — **DENY** C&B infer |
| **DV-CORE-TAX-01** | `is_tax_dependent` | Flag OK · tax detail mutate OUT |
| **DV-CORE-HIRE-01** | `candidate_id` | Soft only · **DENY** hard FK reopen |
| **DV-CORE-PATH-01** | Nest `@Controller('core')` EMP SoT | **FAIL O1** |
| **DV-CORE-PATH-02** | Nest `/rec` dual | **FAIL O9** |
| **DV-CORE-SCP-01** | list=get=patch=deps | Cross-CT leak → **FAIL** U19 |

---

## 7. Data interaction matrix

| Entity | C | R | U | D / soft | Transition |
|--------|---|---|---|----------|------------|
| `employees` public ring | RETAIN create public fields | GET list/get strip | PATCH allow §4 | Soft `archived_at` | pending_docs→active via CORE peers — **not** C&B |
| `employees` C&B keys | **DENY** via public | **DENY** public GET | **DENY** · CB-403 | — | CORE-02 peer |
| `employee_dependents` | **ADD** INSERT | List/get under emp | PATCH name/relation/DOB/flag | Soft `archived_at` | Welfare eligibility by DOB |
| PAY `dependent_count` | — | Peer read | Peer | — | **≠** person SoT |
| `employee_compensation` | **OUT** | **OUT** public | **OUT** | — | CORE-02 |
| Hire soft link | RETAIN | RETAIN | RETAIN | — | **≠** CORE DONE |

---

## 8. Validation matrix (data-layer)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-CORE-PUB-D-01** | ONE EMP SoT | `public.employees` only | No second EMP / Nest core table |
| **VAL-CORE-PUB-D-02** | Public GET | Strip §4.3 keys | No salary/NH/MST/SI on DTO |
| **VAL-CORE-PUB-D-03** | PATCH CB keys | Reject | CB-403 · no write |
| **VAL-CORE-PUB-D-04** | F5 after admin save | Still strip | AC-CORE-PUB-02 |
| **VAL-CORE-PUB-D-05** | CF allow | Only §4.2 + EFF non-C&B | Invent CF → KEY |
| **VAL-CORE-PUB-D-06** | Summary salary bands | Not public-ring default SoT | No leak to non-C&B |
| **VAL-CORE-DEP-D-01** | ADD deps table | `employee_dependents` | ABSENT until Dev after API |
| **VAL-CORE-DEP-D-02** | Required name/relation/(DOB welfare) | Validate | DEP-VAL-400 |
| **VAL-CORE-DEP-D-03** | Soft-delete | `archived_at` | Not hard-delete sole |
| **VAL-CORE-DEP-D-04** | company_id match emp | Enforce | 409/400 |
| **VAL-CORE-DEP-D-05** | Quà 1/6 | DOB on deps | Not C&B infer |
| **VAL-CORE-DEP-D-06** | Tax flag | Boundary only | No GTCG mutate SoT |
| **VAL-CORE-DEP-D-07** | Second deps / PAY person | Reject | DENY |
| **VAL-CORE-HIRE-D-01** | Hard FK candidate | Reject | DENY reopen |
| **VAL-CORE-PATH-D-01** | Nest `/core` EMP dual | Reject | Alias only |
| **VAL-CORE-PATH-D-02** | Nest `/rec` dual | Reject | DENY |
| **VAL-CORE-HON-D-01** | Seed / honesty flip | Reject | U65 · O10 |

---

## 9. Traceability (BRD/SRS → DB → API → FE → Test)

| Requirement | DB physical | API (next) | FE / Journey | Test expect |
|-------------|-------------|------------|--------------|-------------|
| FR-UC-BP-CORE-01 #1–#2 · BR-BP-SEC-01 | §4 strip on `employees` | **F-CORE-EMP-01** UPGRADE | **J-HRM-CORE-01-01/02** | Public-only GET · PATCH admin · F5 |
| O3 CB reject | Deny-list §4.3 | mint/retain **`HRM-CORE-CB-403`** | J-01-02 · AC-04 | 403 · no leak |
| O4 CB-MAP | — (FE) | same public path | J-01-04 | Hide/redirect |
| O5 dependents / quà 1/6 | §5 `employee_dependents` | **F-CORE-DEP-01** ADD | **J-HRM-CORE-01-03** | POST deps 2xx · F5 · DOB |
| O6 tax boundary | `is_tax_dependent` | limited flag on DTO | ALT-03 | No MST/salary leak |
| O7 hire ≠ DONE | `candidate_id` soft RETAIN | HTP-05 / hire RETAIN | J-01-04 handoff | No claim CORE DONE |
| U19 scope_parity | company_id emp+deps | same resolver | J-* Group CEO | list=get=patch=deps |
| O1 path | no Nest core table | paper `/core` alias | Network `/employees` | FAIL if dual SoT |

**scope_parity:** list employees **=** get employee **=** patch public **=** dependents — flag if list id → detail 404 under `main`.

---

## 10. Error mapping (data outcomes → API codes)

| Data fail | HTTP | Code | Notes |
|-----------|------|------|-------|
| Body/DTO C&B deny keys on public | 403 | **`HRM-CORE-CB-403`** | RETAIN/mint API |
| Public field validation | 400 | `HRM-CORE-PUB-VAL-400` | optional mint |
| Dep missing name/relation/DOB (required) | 400 | **`HRM-CORE-DEP-VAL-400`** | mint |
| Dep not found / archived | 404 | **`HRM-CORE-DEP-404`** | mint |
| Invent custom field | 400 | `HRM-EMP-CUSTOM-FIELD-KEY` | RETAIN |
| Invent status | 400 | `HRM-EMP-STATUS-KEY` | RETAIN |
| Scope | 404/409 | `HRM-SCOPE-409` | U19 |
| Hire readiness (handoff) | ready=false | `HRM-HTP-NO-ACTIVE-CONTRACT` | HTP RETAIN · ≠ public save fail |

---

## 11. DENY / must_keep footer

| Class | Items |
|-------|--------|
| **must_keep** | LIVE `public.employees` · soft `candidate_id` · REC-07 soft hire stamp **`REC07QC1-MSL5WXU5`** · HTP-05 · open status / CF **consumer** · soft-delete · U19 · G-DB-02 no hard FK hire · APP-02 · W1–W8 REC seals |
| **DENY** | Nest `/core` dual EMP · Nest `/rec` dual · second EMP table · second deps SoT · hard FK hire reopen · CORE-02 cols as public SoT / required this GWC · PAY `dependent_count` as person CRUD · claim hire = CORE-01 DONE · seed · honesty flip · reopen sealed J-HRM-REC-07-01..04 without regression · apps/** this seat |
| **OUT** | UC-BP-CORE-02 compensation write · UC-BP-CORE-01a DEC→WH · CORE-03/09/10 invent |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · CORE/personnel UAT **false** · **C-SLICE** |

---

## 12. Unlock ladder (next — **not Dev**)

```text
DATA-01 CONFIRMED (this seat)
  → sa API-01 F.1
       F-CORE-EMP-01 UPGRADE residual physical on /api/hrm/employees*
         public-only serializer · CB deny-list · HRM-CORE-CB-403
         paper /api/hrm/core/employees/{id} = alias only
       F-CORE-DEP-01 ADD residual
         GET/POST/PATCH/(soft)DELETE /api/hrm/employees/:id/dependents*
         mint HRM-CORE-DEP-* · display-ready relation_label
       RETAIN HTP-05 · F-REC-HIRE-01 · soft candidate_id · U19
  → Dev-BE / Dev-FE only after API CONFIRMED
  → QA U65 J-HRM-CORE-01-01..04 · QC GWC C-SLICE
```

**cấm Dev** until API-01 CONFIRMED.

---

## 13. Data quality risks & mitigation

| Risk | Mitigation |
|------|------------|
| Legacy `custom_fields.salary` still in DB | Strip on public GET · CB-403 on write · migrate to CORE-02 later (peer) |
| Summary endpoint leaks bands to public dashboard | API-01 gate / separate C&B summary · VAL-D-06 |
| Dev invents Nest `/core` + `hrm_dependent` dual | DENY §1/§11 · alias-only |
| PAY count mistaken as deps SoT | Document §5.1 · DENY |
| Soft FK orphan deps | App assert emp exists+scope · soft archive with emp |
| Closed CHK on `relation_code` freezes catalog | Format-only CHK · open keys |
| Claim REC-07 = CORE DONE | O7 · C-SLICE |
| Hard FK on `candidate_id` | DENY · G-DB-02 |

---

## 14. Completion

| Field | Value |
|-------|--------|
| **completion_report** | Physical DOC-DELTA **CONFIRMED** for UC-BP-CORE-01 O2/O5: public allow-list + CB deny-list strip map on LIVE **`public.employees`** (no second EMP); **ADD** ONE **`public.employee_dependents`** ↔ paper `hrm_dependent` (`full_name` · `relation_code` · `date_of_birth` · `is_tax_dependent` boundary · soft `archived_at` · `company_id` scope); **DENY** Nest `/core` dual EMP · Nest `/rec` dual · second deps SoT · hard FK hire reopen · CORE-02 cols on public · seed · honesty · apps/**. Unlock **sa** API F.1 **F-CORE-EMP-01** UPGRADE + **F-CORE-DEP-01** ADD — **not Dev**. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-data-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md` |