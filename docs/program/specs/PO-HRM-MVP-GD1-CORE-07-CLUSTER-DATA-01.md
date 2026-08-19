# PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN LIVE employees status spine + HOLD invent gate table / `activated_at` (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-21 seat **#23**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE employees status spine · **HOLD invent** completeness / gate table · **HOLD invent** soft ADD `activated_at` · **NO** Nest `/core` table dual · **NO** wipe CORE-06 soft≠DONE · **NO** wipe CORE-05 AST/BB/serial/DELETE-FORBIDDEN · **NO** wipe CORE-03 DOC/ET/CHK · **NO** wipe CORE-02b EMP-CF · **NO** invent PAY / CORE-09 / ATT-12 enroll DONE · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — status spine **HOLD RETAIN** · gate aggregate **HOLD invent** (prefer LIVE checklist+DOC flags) · `activated_at` **HOLD invent** soft ADD (gap **ABSENT PROVEN**) · unlock **sa API-01** wire-only prefer (F-CORE-ACT-01 physical activate/gated PATCH + GATE 409 + EFF + ATT emit) |
| **uc_ids** | `UC-BP-CORE-07` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · **R-CORE-07-GATE-01 IN-SCOPE** (prefer aggregate from LIVE checklist+DOC flags · wire-capable · HOLD invent completeness table) · **R-CORE-07-ACT-01 IN-SCOPE** (prefer POST `/employees/:id/activate` OR gated PATCH · paper `/core` alias only) · **R-CORE-07-EFF-01 IN-SCOPE** (`activated_at` ABSENT PROVEN · HOLD invent soft ADD) · **R-CORE-07-ATT-12** emit only · OUT invent ATT/PAY/CORE-09 DONE · QC **`CORE06QC1-MSLID363`** · soft≠CORE-06 DONE · **`R-CORE-06-HONESTY` INFO idle-ok** · **`CORE05QC1-MSLGVT40`** · **`CORE03QC1-MSLFJH0K`** · **`CORE02BQC1-MSLEFQC1`** · peer **`CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7`** · **`EMPPLATQA-MSIZXHIM`** · **`EMPTOKQA-MSJ290VB`** must_keep |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01.md) · O1–O12 · AC-CORE-07-* · R-CORE-07-GATE/ACT/EFF/ATT-12 |
| **ref_core06_data** | [`PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01.md) — soft-return HOLD · soft≠DONE · Nest `/core` DENY |
| **ref_core05_data** | [`PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01.md) — AST/BB · serial 409 · DELETE-FORBIDDEN |
| **ref_core03_data** | [`PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md) — DOC/ET/CHK · `hrm_document_checklist_item` · flags |
| **ref_core02b_data** | [`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md) — EMP-CF HOLD |
| **ref_core09d_data** | [`PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md) — open TPL+clause · **≠ printable / closed-8 DONE** |
| **ref_core09c_data** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md) — VER/PDF · **≠ printable UAT** |
| **ref_core09b_data** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md) — PACK+PREV ephemeral |
| **ref_core09a_data** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md) — CL body+snapshot |
| **ref_core08_data** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md) — dual RD + payroll_link |
| **ref_core02_data** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md) — packages/eins · AuthZ/CB-403 |
| **ref_core01_data** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md) — public strip · Nest `/core` DENY |
| **ref_paper_db** | paper `employees.status` · paper `activated_at` · checklist instance · DOC `required_by_default` / `blocks_activation` |
| **ref_paper_api** | **F-CORE-ACT-01** (paper `POST /api/hrm/core/employees/{id}/activate` · physical prefer **`POST /api/hrm/employees/:id/activate`** **or** gated **`PATCH /api/hrm/employees/:id`**) · must_keep **F-CORE-CHK-01** · F-EMP-CAT-DOC/ET/EFF · F-EMP-TOK · F-CORE-AST-01/02 + BB · F-EMP-CF · CTR · CORE-08/02/01 · peer ATT via `employee.activated` (**OUT invent ATT DONE**) · PAY/CORE-09 **OUT invent DONE** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-07** · Luồng **#1–#4** · Diễn biến **#1–#2** · **BR-BP-LC-02** · peers CORE-06..01 **must_keep** · ATT-12 peer consumer · CORE-09/10 / PAY **OUT invent DONE** |
| **ref_adr** | ADR 4-pillar · Nest physical prefer · paper `/core` alias only · U19 scope parity list↔get↔activate |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR module UAT **false** · **C-SLICE** · U65 · **`R-CORE-06-HONESTY` INFO idle-ok** · **DENY** claim checklist đủ alone = CORE-07 DONE · **DENY** claim free PATCH = CORE-07 DONE · **DENY** claim CORE-06 DONE / soft=DONE · **DENY** invent PAY/CORE-09/ATT DONE · **DENY** claim printable / closed-8 DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| Employee SoT | **ONE HOLD RETAIN** Nest **`public.employees`** — **DENY** second EMP store · **DENY** Nest `/core` EMP/ACT table dual · **DENY wipe** status spine / open catalog |
| Status spine | **HOLD** — **no invent/change** LIVE `status` · open employment-status catalog · PENDING=`pending_docs` · ENABLED/Hoạt động=`active` |
| Checklist / DOC flags | **HOLD must_keep** CORE-03 — LIVE `hrm_document_checklist_item` + `emp_document_type.required_by_default` / `blocks_activation` |
| **R-CORE-07-GATE-01** | **IN-SCOPE** · prefer **aggregate** from checklist + DOC flags (**wire-capable**) · **HOLD invent** completeness / gate table |
| **R-CORE-07-ACT-01** | **IN-SCOPE** · prefer **POST** `/employees/:id/activate` **or** gated **PATCH** same controller · paper `/core/…/activate` = **alias only** · **HOLD** (no new EMP SoT table) |
| **R-CORE-07-EFF-01** | **IN-SCOPE** · typed `activated_at` **ABSENT PROVEN** · **HOLD invent** soft ADD · reopen **REQUIRED** only if typed col stamped over wire-body-only `effective_date` |
| **R-CORE-07-ATT-12** | **emit only** · **OUT invent** ATT enroll / quỹ/ca tables DONE |
| Paper F-CORE-ACT-01 | Physical prefer activate/gated PATCH · paper `/api/hrm/core/…/activate` = **alias only** |
| Free status PATCH / checklist CRUD | **RETAIN path** for status/check — **≠ CORE-07 DONE** |
| Nest path | Physical `/employees/:id` · Nest `@Controller('core')` **ABSENT** (grep **0**) |
| CORE-06 soft≠DONE | **must_keep** · stamp **`CORE06QC1-MSLID363`** · **`R-CORE-06-HONESTY` INFO idle-ok** · **≠** CORE-06 DONE |
| CORE-05..01 / EMP DOC/TOK | **must_keep** · **DENY reopen** sealed J-* |
| PAY / CORE-09 / ATT enroll | **OUT invent DONE** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim checklist/PATCH = CORE-07 DONE |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| Employee status / PENDING→ENABLED | **`public.employees.status`** open catalog | **HOLD RETAIN** |
| PENDING | `pending_docs` | **HOLD RETAIN** (REC-07 / CORE-01) |
| ENABLED / Hoạt động | `active` | **HOLD RETAIN** |
| F-CORE-ACT-01 `/core/…/activate` | **`POST /employees/:id/activate`** **or** gated **`PATCH /employees/:id`** | Physical prefer · paper **alias only** |
| Checklist gate SoT | **`hrm_document_checklist_item`** + DOC flags | **HOLD must_keep** CORE-03 · **≠** invent gate table |
| Completeness / gate table | Derived aggregate display-ready | **HOLD invent** |
| `activated_at` | Paper col · LIVE **ABSENT** | **HOLD invent** soft ADD · wire `effective_date` until unlock |
| ATT-12 enroll tables | Peer ATT | **OUT invent DONE** · emit `employee.activated` only |
| Nest `/core` EMP/ACT table | — | **DENY invent** |
| PAY / CORE-09 | Peers | **OUT invent DONE** |

```text
  public.employees (LIVE — HOLD RETAIN status spine · ONE EMP SoT)
        RETAIN: id · company_id · employee_code · email · full_name ·
                job_title_key · status (open catalog · pending_docs|active spine) ·
                hired_at · archived_at · custom_fields · manager_id · avatar_url ·
                candidate_id · created_at · updated_at
        DENY:   wipe status spine · invent closed PENDING|ENABLED enum as primary ·
                Nest /core dual EMP · invent CORE-07 DONE from free PATCH alone
                │
                │ Gate input (must_keep CORE-03 — NO invent this seat)
                ▼
        LIVE:   public.hrm_document_checklist_item
                (status missing|submitted|approved · required · soft archived_at)
        LIVE:   emp_document_type.required_by_default · blocks_activation
                │
                │ Completeness (residual — NO schema invent)
                ▼
        Derived: checklist_complete =
                   (all required items approved
                    AND no blocks_activation open non-approved)
                 can_activate = checklist_complete (GĐ1 hard gate · no override)
                 blocking_items[] = required/non-approved ∪ blocks_activation open
        HOLD:   invent dedicated completeness / gate table
                │
                │ Effective date (residual — HOLD invent typed col)
                ▼
        ABSENT PROVEN: activated_at on public.employees
                       (ensureSchema CREATE/ADD + INSERT · grep apps/api/hrm-api **0**)
        HOLD:   soft ADD activated_at timestamptz
        Until unlock: wire-body effective_date OK (persist when col live)
        REQUIRED reopen: only if DATA stamps typed ADD over body-only
                │
                │ ATT tín hiệu
                ▼
        Emit:   employee.activated (employee_id · company_id · effective_date)
        OUT:    invent ATT enroll / quỹ/ca engine tables DONE

  Activate DTO (API — not this seat code · display-ready O11)
        status · statusLabelVi · checklist_complete · blocking_items[] ·
        activated_at / effective_date · can_activate

  CORE-06 soft≠DONE · CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 DOC/ET/CHK ·
  CORE-02b EMP-CF · CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral ·
  09a CL · 08 RD · 02 packages/AuthZ · 01 public · Nest /core DENY ·
  R-CORE-06-HONESTY INFO idle-ok
        SEALED must_keep

  FORBIDDEN GĐ1 this seat:
        Invent/change LIVE employees status spine
        Invent completeness / gate table as required
        Invent soft ADD activated_at without REQUIRED reopen stamp
        Nest /core ACT dual · wipe CORE-06/05/03/02b
        Invent PAY/CORE-09/ATT-12 DONE
        Claim checklist alone = CORE-07 DONE · claim free PATCH = CORE-07 DONE
        Claim CORE-06 DONE · printable/closed-8 · honesty flip · reopen sealed J-* · seed · apps/**
```

**Label lock:** «Kích hoạt hồ sơ Hoạt động khi checklist đủ» GĐ1 = **gated PENDING→ENABLED on LIVE employees + CORE-03 checklist aggregate** — **not** Nest `/core` dual · **not** checklist CRUD alone = FR-07 DONE · **not** free PATCH = FR-07 DONE.  
**Spine lock:** Physical `/employees/:id` (activate **or** gated PATCH) — **DENY** Nest `/core` second SoT.  
**Gap lock:** `activated_at` **ABSENT PROVEN** → **HOLD invent** · gate table not required → prefer aggregate (**HOLD invent**).  
**Honesty lock:** checklist ≠ CORE-07 DONE · free PATCH ≠ DONE · soft≠CORE-06 DONE · PAY/CORE-09/ATT/printable/closed-8 **DENIED**.

---

## 3. AS-IS baseline (Nest facts — read-only cite · 2026-08-09)

| Object | AS-IS LIVE | Gap (Wave-21 DATA) |
|--------|------------|---------------------|
| **`public.employees`** | `employees.service.ts` `ensureSchema`: `status TEXT` open catalog (DROP `chk_employees_status`) · cols id/company/code/email/name/job_title/status/hired_at/archived_at/custom_fields/manager_id/avatar_url/candidate_id — **no** `activated_at` ADD/CREATE | **HOLD RETAIN** spine — **no** invent/change |
| Status PATCH | `assertEmployeeStatusPayload` = employment-status catalog + optional reason — **no** checklist gate | **HOLD RETAIN path** · **≠** FR-07 DONE alone |
| Dedicated activate | **ABSENT** — employees grep `activate` / `HRM-EMP-ACT` / `can_activate` **0** | Residual **R-CORE-07-ACT-01** · **HOLD** EMP SoT |
| **`activated_at`** | apps/api/hrm-api grep **0** · ensureSchema INSERT omit | **ABSENT PROVEN** · **HOLD invent** soft ADD |
| Checklist instance | LIVE `hrm_document_checklist_item` (CORE-03) | **HOLD must_keep** |
| DOC flags | LIVE `required_by_default` · `blocks_activation` on `emp_document_type` | **HOLD must_keep** |
| Completeness table | **ABSENT** | Prefer aggregate · **HOLD invent** |
| Paper `/core` | Nest `@Controller('core')` **ABSENT** (**0**) · CoreModule = DB only | **DENY invent** dual |
| ATT enroll / PAY / CORE-09 | Peers | **OUT invent DONE** |
| CORE-06 / 05 / 03 / 02b / CTR | SEALED stamps | **must_keep** · **DENY wipe** |

**FORBIDDEN invent this seat:** change LIVE status spine · gate completeness table as required · soft ADD `activated_at` without REQUIRED reopen · Nest `/core` ACT dual · invent PAY/CORE-09/ATT DONE · claim checklist/PATCH = FR-07 DONE · seed · honesty flip · apps/** · reopen sealed CORE-06..01.

---

## 4. HOLD dispositions (normative)

### 4.1 Employees status spine — **HOLD RETAIN** (mission §1)

| Physical | Rule |
|----------|------|
| `status` open catalog | **HOLD** — no invent/change · PENDING=`pending_docs` · ENABLED=`active` |
| Closed PENDING\|ENABLED enum as primary | **FORBIDDEN** |
| Soft archive `archived_at` | **RETAIN** soft-delete doctrine |
| Free PATCH `status=active` | **RETAIN path** · **≠ CORE-07 DONE** without gate + EFF + ATT + U65 |

### 4.2 **R-CORE-07-GATE-01** — **HOLD invent** completeness / gate table (mission §2)

| Field | Ruling |
|-------|--------|
| **Scope** | **IN-SCOPE residual** Diễn biến #1 / Luồng #1 / **BR-BP-LC-02** |
| **Prefer** | Aggregate from LIVE `hrm_document_checklist_item` + `required_by_default` / `blocks_activation` |
| **Physical gap** | Gate assert on status transition **ABSENT** (catalog-only assert) — SoT **wire-capable** without new table |
| **ba-data** | **HOLD invent** dedicated completeness / gate table |
| **PASS rule** | Every **required** item `approved` **and** no open `blocks_activation=true` non-approved |
| **FAIL** | Prefer **409** `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` (mint class) · status unchanged |
| **DENY** | Claim checklist CRUD = GATE residual CLOSED · silent allow · Nest `/core` dual · seed densify |

### 4.3 **R-CORE-07-ACT-01** — **HOLD** (no new EMP SoT · mission unlock for API)

| Field | Ruling |
|-------|--------|
| **Scope** | **IN-SCOPE residual** Diễn biến #2 / Luồng #2–#3 / F-CORE-ACT-01 |
| **Prefer** | Thin **POST** `/employees/:id/activate` **or** gated **PATCH** on **same** controller/SoT |
| **ba-data** | **HOLD** — no second EMP table · no Nest `/core` ACT dual |
| **DENY** | Nest `/core` dual · claim free PATCH = ACT DONE |

### 4.4 **R-CORE-07-EFF-01** — **HOLD invent** soft ADD `activated_at` (mission §3)

| Field | Ruling |
|-------|--------|
| **Scope** | **IN-SCOPE residual** FR-07 ngày hiệu lực `dd/MM/yyyy` · paper `activated_at` |
| **Physical gap** | Typed col **ABSENT PROVEN** (ensureSchema + INSERT + repo grep **0**) |
| **ba-data** | **HOLD invent** soft ADD `activated_at TIMESTAMPTZ NULL` on `public.employees` |
| **Until unlock** | API may accept wire-body `effective_date` / display envelope · persist when col live |
| **Conditional UNLOCK REQUIRED** | Only if DATA stamps typed ADD preferred over wire-body-only |
| **DENY** | Claim free PATCH without date = EFF DONE · invent PAY period DONE · epoch junk display |

### 4.5 **R-CORE-07-ATT-12** — **HOLD / OUT invent** ATT tables (mission emit)

| Field | Ruling |
|-------|--------|
| **Emit** | Readable `employee.activated` (employee_id · company_id · effective_date) |
| **ba-data** | **HOLD / OUT invent** ATT enroll / quỹ/ca tables this seat |
| **DENY** | Claim CORE-07 = ATT-12 module DONE |

### 4.6 Conditional UNLOCK gate (default = NOT)

| Condition | Unlock schema? | This seat |
|-----------|----------------|-----------|
| Typed `activated_at` chosen over wire-body-only effective_date | **YES** — narrow soft ADD after ba-data **REQUIRED** reopen | **NOT chosen** → **HOLD invent** |
| Completeness table needed because aggregate cannot express gate | **NO** default — LIVE checklist+flags wire-capable | **HOLD invent** |
| Desire Nest `/core` ACT dual / wipe status spine / invent PAY·09·ATT DONE | **NO** — **DENY** | Absolute |

**Verdict:** BA prefer aggregate gate + HOLD invent `activated_at` → **HOLD / NOT unlock** schema invent this wave.

---

## 5. Display-ready activate DTO (mission §4 — cite for sa API)

### 5.1 Status + activate envelope

| Display field | Physical / source | Notes |
|---------------|-------------------|-------|
| `id` / `companyId` | `employees.id` / `company_id` | U19 |
| `status` | `employees.status` | `pending_docs` → `active` |
| **`statusLabelVi`** | derived from employment-status catalog | «Chờ hoàn thiện» / «Hoạt động» |
| **`checklist_complete`** | aggregate CORE-03 | boolean · **HOLD invent** table |
| **`blocking_items[]`** | required non-approved ∪ blocks_activation open | `{ documentTypeKey, nameVi, status }` |
| **`activated_at`** / `effectiveDate` | paper col ABSENT · wire until unlock | locale `dd/MM/yyyy` · null → `—` |
| **`can_activate`** | derived = checklist_complete (GĐ1) | CTA gate · **≠** invent override |

### 5.2 Lifecycle (activate — RETAIN spine)

| From → To | Legal? | Notes |
|-----------|--------|-------|
| `pending_docs` → `active` (+ effective_date when gate live) | YES when checklist PASS | F-CORE-ACT-01 physical |
| Activate when incomplete | **NO** | 409 incomplete · status unchanged |
| Hard DELETE history | Prefer soft `archived_at` | soft-delete doctrine |
| Claim FR-07 DONE from checklist alone | **NO** | checklist ≠ DONE |
| Claim FR-07 DONE from free PATCH alone | **NO** | free PATCH ≠ DONE |
| Invent Nest `/core` ACT as sole SoT | **NO** | DENY |

**Invalid-transition outcome:** API 4xx/409 deterministic (sa API-01) — **no** silent 2xx.

---

## 6. Validation matrix (physical)

| VAL-ID | Condition | Rule | Expected |
|--------|-----------|------|----------|
| **VAL-CORE-07-DATA-01** | Status spine | No invent/change LIVE `status` / open catalog | Schema invent = **FAIL** HOLD |
| **VAL-CORE-07-DATA-02** | EMP SoT | ONE `public.employees` | Second Nest EMP/ACT table = **FAIL** |
| **VAL-CORE-07-DATA-03** | Physical path | POST activate **or** gated PATCH `/employees/:id` | Nest `/core` activate SoT = **FAIL O1** |
| **VAL-CORE-07-DATA-04** | Status map | PENDING=`pending_docs` · ENABLED=`active` | Closed enum invent primary = **FAIL** |
| **VAL-CORE-07-DATA-05** | GATE residual | Prefer aggregate checklist+DOC flags | Invent completeness table as required = **FAIL** |
| **VAL-CORE-07-DATA-06** | Gate PASS | required all approved + blocks clear | Incomplete activate 2xx = **FAIL** |
| **VAL-CORE-07-DATA-07** | EFF residual | `activated_at` ABSENT PROVEN | Soft ADD without REQUIRED reopen = **FAIL HOLD** |
| **VAL-CORE-07-DATA-08** | EFF wire | effective_date body until col live | Epoch junk / missing date = **FAIL** when ACT residual live |
| **VAL-CORE-07-DATA-09** | Checklist≠DONE | CRUD / badge alone | Claim FR-07 DONE = **FAIL O4** |
| **VAL-CORE-07-DATA-10** | Free PATCH≠DONE | Unrestricted status PATCH | Claim FR-07 DONE = **FAIL O5** |
| **VAL-CORE-07-DATA-11** | ATT emit | `employee.activated` only | Invent ATT enroll DONE = **FAIL** |
| **VAL-CORE-07-DATA-12** | Scope U19 | list=get=activate same resolver | Cross-CT / scope_parity FAIL |
| **VAL-CORE-07-DATA-13** | Peer seals | CORE-06..01 RETAIN | Wipe/reopen = **FAIL** |
| **VAL-CORE-07-DATA-14** | Soft≠06 DONE | CORE-06 seal | Claim CORE-06 DONE / soft=DONE = **FAIL** |
| **VAL-CORE-07-DATA-15** | Honesty | no checklist/PATCH/PAY/09/printable flip | Claim/flip = **FAIL** |
| **VAL-CORE-07-DATA-16** | No seed | FE-only | Seed checklist/status/active = **FAIL U65** |
| **VAL-CORE-07-DATA-17** | PAY/CORE-09/ATT | Peers OUT invent DONE | Invent DONE this seat = **FAIL** |

---

## 7. Traceability (requirement → DB → API → FE → test)

| SRS / BR / residual | DB | API (paper → physical) | FE / J-* | Test expect |
|---------------------|----|------------------------|----------|-------------|
| Luồng #1 · AC-03/04 · GATE | checklist+flags **HOLD** · **HOLD invent** gate table | GET checklist* · DOC flags · gate assert residual | **J-HRM-CORE-07-01/03** DRAFT | can_activate / 409 · Nest `/core` 0 · ≠-CHK-DONE |
| Luồng #2 · AC-01/02 · ACT | `employees.status` **HOLD** | **POST** activate **or** gated **PATCH** | **J-HRM-CORE-07-02** DRAFT | 2xx · F5 `active` · Nest `/core` 0 |
| AC-05 · EFF | `activated_at` **HOLD invent** | effective_date wire · display `activated_at` | **J-02** | dd/MM/yyyy · no epoch |
| Luồng #3 · AC-06 · ATT-12 | no ATT table invent | emit `employee.activated` | **J-04** | emit cite · ATT OUT |
| ≠-CHK / ≠-PATCH · AC-H | — | free PATCH / checklist path RETAIN | **J-04/05** | FAIL if claim FR-07 DONE |
| MK-06 soft≠DONE | CORE-06 assets HOLD | F-CORE-AST-02 | seals | no reopen J-06 · honesty idle-ok · ≠ CORE-06 DONE |
| MK-05/03/02B/09D..01 | peer tables | peer APIs | seals | no reopen |
| O10 PAY/09 OUT | — | peers | footer | ≠ invent DONE |
| O1 Nest deny | no `/core` table | physical `/employees/:id` | Network | Nest `/core` 0 |

**scope_parity (U19):** employees list / get-by-id / activate (POST or gated PATCH) **MUST** use **same** profile scope resolver family (CORE-01 RETAIN). List returns employee id → activate under group CEO `main` must not 404 scope (`scope_parity`). Trace: `GET/PATCH/POST …/employees/:id*` + **J-HRM-CORE-07-01..05** + UI Profile deep link.

---

## 8. Error / integrity mapping (RETAIN + residual mint — no invent rewrite sealed)

| Physical fail | HTTP / code | Data outcome |
|---------------|-------------|--------------|
| Activate success (when residual live) | 2xx | `status=active` · EFF persist when col live · **≠** FR-07 DONE alone without journeys |
| Checklist incomplete | 409 residual **`HRM-EMP-ACT-CHECKLIST-INCOMPLETE`** | status unchanged · F5 `pending_docs` |
| EFF invalid | 4xx residual | no status flip · no epoch junk |
| Scope mismatch | 409 `HRM-SCOPE-409` | no cross-CT |
| Free PATCH success (AS-IS) | 2xx `HRM-EMP-PROFILE-200/202` | **≠** claim FR-07 DONE |
| Nest `/core` dual invent | FAIL O1 | dual SoT rejected |
| Sealed CORE-* | — | **DENY** rewrite |

---

## 9. DENY / must_keep / honesty

### DENY (this seat)

| Item | Why |
|------|-----|
| Invent/change LIVE employees status spine | HOLD §4.1 |
| Invent completeness / gate table as required | HOLD §4.2 · aggregate prefer |
| Invent soft ADD `activated_at` without REQUIRED reopen | HOLD §4.4 · gap ≠ auto invent |
| Nest `/core` ACT SoT · `@Controller('core')` | O1 dual-SoT FAIL |
| Wipe CORE-06 soft≠DONE / return checklist | must_keep `CORE06QC1-MSLID363` |
| Wipe CORE-05 AST/BB/serial/DELETE-FORBIDDEN | must_keep `CORE05QC1-MSLGVT40` |
| Wipe CORE-03 DOC/ET/CHK · CORE-02b EMP-CF | must_keep |
| Invent PAY / CORE-09 / ATT-12 enroll DONE | O7/O10 OUT |
| Claim checklist đủ alone = CORE-07 / FR-07 DONE | O4 |
| Claim free status PATCH alone = CORE-07 DONE | O5 |
| Claim CORE-06 DONE / soft Profile = DONE | O10 · soft≠DONE RETAIN |
| Claim printable / closed-8 DONE | O10 |
| Flip honesty / reopen sealed J-HRM-CORE-06-01..05 / 05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 | seals |
| Seed · `apps/**` | U65 · docs-only |

### must_keep RETAIN

| Stamp / surface | Retain |
|-----------------|--------|
| **`CORE06QC1-MSLID363`** | soft≠DONE · TERM/CLOSED FE-derive · Nest `/core` 0 · **≠** CORE-06 DONE · **`R-CORE-06-HONESTY` INFO idle-ok** |
| **`CORE05QC1-MSLGVT40`** | AST/BB/serial/DELETE-FORBIDDEN · **≠** CORE-05 DONE / personnel |
| **`CORE03QC1-MSLFJH0K`** | DOC/ET/CHK · **≠** claim CHK = CORE-07 DONE · **≠** personnel |
| **`EMPPLATQA-MSIZXHIM`** / **`EMPTOKQA-MSJ290VB`** | DOC/ET · TOK |
| **`CORE02BQC1-MSLEFQC1`** | EMP-CF four catalogs · **DENY wipe** |
| **`CORE09DQC1-MSLDR8I3`** | TPL+clause · **≠ printable** · **≠ closed-8 DONE** · **≠** invent CORE-09 DONE |
| **`CORE09CQC1-MSLBXMUT`** | VER/PDF · **≠ printable UAT** |
| **`CORE09BQC1-MSLB05DZ`** | PREV ephemeral |
| **`CORE09AQC1-MSLA4LX9`** | CL |
| **`CORE08QC1-MSL9BFFE`** | RD + payroll_link |
| **`CORE02QC1-MSL80DU6`** | packages · AuthZ/CB-403 |
| **`CORE01QC1-MSL6WMS7`** | public strip · Nest `/core` DENY |
| LIVE employees* physical | `/api/hrm/employees*` · checklist* · DOC/ET |
| Soft-delete · U19 scope_parity | doctrine |

### Honesty (LOCKED false)

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| **`contracts_printable_ready`** | **false** · **DENY** flip |
| **`hrm_personnel_uat_ready`** | **false** · **DENY** flip |
| personnel / CORE / CTR module UAT | **false** |
| **C-SLICE-≠-MODULE** | GWC later ≠ module UAT ≠ Phase1 |
| Claim checklist đủ alone = CORE-07 DONE | **DENIED** |
| Claim free PATCH alone = CORE-07 DONE | **DENIED** |
| Claim CORE-06 DONE / soft=DONE | **DENIED** · soft≠DONE **RETAIN** |
| Invent PAY / CORE-09 / ATT / printable / closed-8 DONE | **DENIED** |
| **`R-CORE-06-HONESTY`** | **INFO idle-ok RETAIN** |

---

## 10. Risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev invents Nest `/core` activate dual | VAL-03 · O1 FAIL · DENY |
| Dev invents completeness table as required | §4.2 HOLD · VAL-05 |
| Dev invents `activated_at` without REQUIRED reopen | §4.4 · VAL-07 |
| Claim checklist / free PATCH = FR-07 DONE | VAL-09/10 · O4/O5 · J-04/05 |
| Wipe CORE-06 soft≠DONE / CORE-05/03/02b | must_keep stamps · VAL-13/14 |
| Invent PAY/CORE-09/ATT DONE | VAL-11/17 · O10 |
| Seed status/checklist densify | VAL-16 · U65 |
| scope_parity list≠activate | VAL-12 · U19 |
| Misread ABSENT `activated_at` as REQUIRED invent now | §4.6 · HOLD invent default |

---

## 11. Unlock next (governance)

| Next | Role | What |
|------|------|------|
| **`PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01`** | **sa** | **RETAIN cite** **F-CORE-ACT-01** physical prefer **POST** `/employees/:id/activate` **or** gated **PATCH** · residual **GATE 409** (aggregate checklist+flags) · **EFF** effective_date / display `activated_at` · **ATT emit** `employee.activated` · paper `/core` alias only · F.1 mục đích + bước SRS · U19 scope_parity · must_keep CORE-06..01 · Nest `/core` DENY · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE · PAY/CORE-09 **OUT invent DONE** — **wire-only prefer** · **not** Dev invent schema |
| Dev-BE / Dev-FE | **HOLD** | Until API CONFIRMED · residual wire only if API proves closable gap on LIVE SoT |
| QA / QC | After wire (if any) | J-HRM-CORE-07-01..05 DRAFT · C-SLICE · honesty false · cite ≠-CHK/≠-PATCH · soft≠CORE-06 DONE |
| PAY / CORE-09 | Peers | Remain **OUT invent DONE** |

---

## 12. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | DATA-01 **CONFIRMED HOLD** for UC-BP-CORE-07: **HOLD RETAIN** LIVE `public.employees` status spine (`pending_docs`/`active` · open catalog · **no invent/change**) · **HOLD invent** completeness/gate table (prefer aggregate from CORE-03 checklist + `blocks_activation` / `required_by_default` · wire-capable) · **HOLD invent** soft ADD `activated_at` (**ABSENT PROVEN** · reopen **REQUIRED** only if typed col stamped over wire-body-only) · cite display-ready activate DTO (`statusLabelVi` · `checklist_complete` · `blocking_items[]` · `activated_at` · `can_activate`) · RETAIN CORE-06 soft≠DONE (`CORE06QC1-MSLID363` · `R-CORE-06-HONESTY` idle-ok) · CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · Nest `/core` DENY · DENY wipe CORE-06/05/03/02b · invent PAY/CORE-09/ATT-12 DONE · claim checklist alone = CORE-07 DONE · claim free PATCH = CORE-07 DONE · claim CORE-06 DONE · printable/closed-8 · honesty flip · reopen sealed J-* · seed · apps/** · unlock **sa API-01** wire-only prefer · C-SLICE · honesty false. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md` · `docs/qa/evidence/po-hrm-mvp-gd1-core-07-cluster-data-01.md` |
| **residual** | API F-CORE-ACT-01 physical + GATE/EFF/ATT · J-07-01..03 DRAFT until live · `activated_at` HOLD invent · gate table HOLD invent · PAY/CORE-09/ATT peers OUT · personnel/printable flags HOLD · soft≠CORE-06 DONE · `R-CORE-06-HONESTY` INFO idle-ok |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-07
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA Option A · R-CORE-07-GATE-01 IN-SCOPE (aggregate LIVE checklist+DOC flags · HOLD invent completeness table) · R-CORE-07-ACT-01 IN-SCOPE (POST /employees/:id/activate OR gated PATCH) · R-CORE-07-EFF-01 IN-SCOPE (activated_at ABSENT PROVEN · HOLD invent soft ADD · wire effective_date OK) · R-CORE-07-ATT-12 emit only · OUT invent ATT/PAY/CORE-09 DONE · CORE06QC1-MSLID363 · soft≠CORE-06 DONE · R-CORE-06-HONESTY INFO idle-ok · CORE05QC1-MSLGVT40 · CORE03QC1-MSLFJH0K · CORE02BQC1-MSLEFQC1 · peer CORE09DQC1-MSLDR8I3..CORE01QC1-MSL6WMS7 · EMPPLATQA-MSIZXHIM · EMPTOKQA-MSJ290VB must_keep
spec_ref: F-CORE-ACT-01 physical prefer POST /employees/:id/activate OR gated PATCH · LIVE employees status spine HOLD RETAIN · LIVE hrm_document_checklist_item + emp_document_type flags HOLD RETAIN · paper activated_at HOLD invent · Nest /core DENY · checklist đủ ≠ CORE-07 DONE · free PATCH ≠ CORE-07 DONE · soft≠CORE-06 DONE RETAIN

MISSION — API F.1 lock (docs-only · wire-only prefer · no schema invent):
1) RETAIN cite F-CORE-ACT-01 physical prefer POST /api/hrm/employees/:id/activate OR gated PATCH /api/hrm/employees/:id (status=active + effective_date) · paper /core/…/activate alias only
2) Residual GATE — assert before activate/gated PATCH · 409 HRM-EMP-ACT-CHECKLIST-INCOMPLETE when required incomplete or blocks_activation open · derive from LIVE checklist+DOC flags · DENY invent completeness table · DENY silent allow
3) Residual EFF — accept effective_date dd/MM/yyyy · display activated_at · HOLD invent typed col (DATA ABSENT PROVEN) · DENY epoch junk
4) Residual ATT-12 — emit readable employee.activated (employee_id · company_id · effective_date) · DENY invent ATT enroll/quỹ/ca DONE
5) Display-ready DTO from DATA-01: statusLabelVi · checklist_complete · blocking_items[] · activated_at · can_activate
6) F.1 mỗi endpoint: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (UC-BP-CORE-07 Diễn biến #1–#2 · BR-BP-LC-02) · DTO↔DB from DATA-01 · U19 scope_parity list=get=activate
7) RETAIN CORE-06 soft≠DONE · CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d..01 · Nest /core DENY · R-CORE-06-HONESTY INFO idle-ok
8) DENY wipe CORE-06/05/03/02b · invent PAY/CORE-09/ATT-12 DONE · claim checklist alone = CORE-07 DONE · claim free PATCH = CORE-07 DONE · claim CORE-06 DONE · claim printable/closed-8 DONE · honesty flip · reopen J-HRM-CORE-06-01..05 / 05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 · seed · apps/**
9) Unlock next: Dev wire residual ONLY if API CONFIRMED closable gap on LIVE SoT — else FE/QA journey draft; PAY/CORE-09 remain OUT invent DONE

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md · PASS_TO_PM · Dev HOLD until API CONFIRMED
```

---

## 13. Spec read ack (ba-data)

| Artifact | Cite |
|----------|------|
| BA-01 | O1 path · O2 status map · O3 GATE HOLD invent · O4 ≠-CHK · O5 ≠-PATCH · O6 EFF HOLD invent · O7 ATT emit · O8 OV OUT · O9 C&B HOLD · O10 honesty · O11 display · O12 J-* |
| SA-01 | Option A LOCKED · status RETAIN · residuals GATE/ACT/EFF/ATT · checklist≠DONE · free PATCH≠DONE |
| CORE-06 DATA | soft≠DONE · Nest `/core` DENY · `R-CORE-06-HONESTY` idle-ok |
| CORE-03 DATA | checklist + DOC flags HOLD must_keep |
| AS-IS Nest (read-only) | `employees.ensureSchema` **no** `activated_at` · grep **0** `activated_at` · **0** `Controller('core')` · **0** employees activate/HRM-EMP-ACT · `assertEmployeeStatusPayload` catalog-only · LIVE checklist + `blocks_activation`/`required_by_default` |
| Peer seals | `CORE06QC1-MSLID363` · `CORE05QC1-MSLGVT40` · `CORE03QC1-MSLFJH0K` · EMP DOC/TOK · `CORE02BQC1-MSLEFQC1` · `CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7` |
