# PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01 — Physical DB · UV→EMP prefill map + ONE soft hire stamp (Option A · O4/O7)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-9 seat **#11**) |
| **lane** | governance · ba-data |
| **change_mode** | **RETAIN** soft `employee_id` Lane A+B · **ADD** reverse `employees.candidate_id` if ABSENT · **EXPAND** optional accept-audit cols on Lane A · **DOC-DELTA only** · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — physical O4 UV→EMP map + O7 ONE soft hire link · SA Option A · BA O1–O12 |
| **uc_ids** | `UC-BP-REC-07` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · Wave-8 REC-06 **SEALED** stamp **`REC06QC1-MSL4CU2G`** · REC-05/06a/04 **RETAIN** |
| **ref_sa** | [`PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01.md) · **O4/O7** · AC-REC-07-* · VAL-REC-HIRE-* · §1.1 logical prefill |
| **ref_uv_yctd** | [`PO-HRM-REC-UV-YCTD-DB-01.md`](./PO-HRM-REC-UV-YCTD-DB-01.md) · ONE soft FK `requisition_id` |
| **ref_stage** | [`PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01.md) · APP-02 history — **RETAIN ≠ hire SoT** |
| **ref_paper_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) **§2.4** `rec_candidate.employee_id` · **§2.5** application · **§3.1** `hrm_employee` / `candidate_id` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-07** · **BR-BP-LC-01** / **BR-BP-ONB-01** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Hire link SoT | **ONE soft hire link** — Lane A `recruitment_candidates.employee_id` (+ Lane B `candidates.employee_id` mirror when dual-lane) + reverse `employees.candidate_id` — **DENY** second hire / accept table |
| Hard FK | **DENY** `REFERENCES` candidate↔employee (G-DB-02) — soft UUID only · app assert via hire-employee-link |
| Prefill map (O4) | Physical UV person + YCTD org → LIVE `public.employees` (+ `custom_fields` phone/dept) — **no re-key** · **DENY** invent PAY / C&B columns |
| Create status | Default soft key **`pending_docs`** (paper §3.1 lifecycle) — **block Active** until CORE required set · open EMP status catalog RETAIN |
| Accept-audit (optional) | **EXPAND** Lane A cols `offer_accepted_at` · `offer_accepted_by` · `accepted_application_id` · soft `offer_id` — **DENY** greenfield `rec_hire*` SoT |
| Nest path | Physical prefer `/api/hrm/recruitment/*` — API seat · paper `/rec/*` = alias only |
| Stage writer | **RETAIN** REC-05 APP-02 — accept **does not** own stage columns |
| REC-06 mail `offer` | **RETAIN ≠ hire** — stamp `REC06QC1-MSL4CU2G` |
| PAY | **DENY** invent payslip / payroll / salary structure columns on REC or hire CREATE |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen sealed J-06 |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `rec_candidate` | **`public.recruitment_candidates`** (Lane A preferred) · Lane B `public.candidates` = pool mirror | **RETAIN** |
| `rec_candidate.employee_id` | `recruitment_candidates.employee_id` · mirror `candidates.employee_id` | **RETAIN** soft |
| `hrm_employee` / CORE employee | **`public.employees`** | **RETAIN** CREATE/GET home |
| `hrm_employee.candidate_id` | **`employees.candidate_id`** | **ADD** if ABSENT (AS-IS queried by hire-employee-link; no ensureSchema yet) |
| `work_email` | `employees.email` | **RETAIN** column name |
| `work_phone` / `personal_phone` | `employees.custom_fields.phone_number` (display OS 28) | **RETAIN** JSON path — Prefer copy |
| `department_id` / dept key | `custom_fields.department_key` (+ optional WH timeline denorm) | Prefer from YCTD — **DENY** free-text SoT |
| `position_key` | `employees.job_title_key` ← YCTD `position_key` | Prefer — catalog SoT |
| `hire_date` | `employees.hired_at` | Prefer ← `expected_start_date` |
| `pending_docs` status | `employees.status` soft key **`pending_docs`** | Default on hire CREATE |
| Accept audit | Lane A audit cols (§5) — **not** second table | **EXPAND** optional |
| `/api/hrm/rec/…/accept-offer` | `/api/hrm/recruitment/applications/:id/accept-offer` | **Alias only** — API seat |

```text
  job_requisitions (YCTD — RETAIN)
        │ soft requisition_id ONE
        ▼
  recruitment_candidates (Lane A — hire person SoT)
        RETAIN: employee_id UUID NULL (soft — no REFERENCES)
        EXPAND: offer_accepted_at? · offer_accepted_by? ·
                accepted_application_id? · offer_id? (soft)
        RETAIN: pool_candidate_id UUID NULL → Lane B mirror
                │
                │ soft stamp (ONE hire link)
                ▼
  employees (CORE — RETAIN CREATE home)
        ADD:    candidate_id UUID NULL (soft reverse → Lane A id preferred)
        RETAIN: full_name · email · company_id · job_title_key ·
                status · hired_at · custom_fields · archived_at · employee_code
        DENY:   hard FK · PAY/C&B columns · second hire table

  candidates (Lane B pool — RETAIN)
        RETAIN: employee_id UUID NULL — MIRROR when pool_candidate_id linked
        DENY:   pool PATCH hired alone as FR-07 SoT

  rec_candidate_stage_history / APP-02 (REC-05 SEALED)
        RETAIN — hired-outcome write only via transitions · ≠ accept-audit SoT
```

**Label lock:** «Chấp nhận offer → hồ sơ NS» = CREATE/LINK + prefill + soft stamp — not mail template `offer`; not picker-only forever.  
**Spine lock:** ONE soft `employee_id` on UV person — **DENY** Nest `/rec` dual · second hire SoT · hard FK.  
**Stage lock:** hired-outcome **only** via APP-02 — accept audit cols ≠ stage writer.

---

## 3. AS-IS baseline (Nest facts — read-only)

| Object | AS-IS | Gap (Wave-9 O4/O7) |
|--------|-------|---------------------|
| Lane A | `recruitment_candidates.employee_id UUID NULL` — soft, **no** REFERENCES | Stamp after create — **RETAIN** |
| Lane B | `candidates.employee_id UUID NULL` (workflow bridge ensureSchema) | Mirror when dual-lane — **RETAIN** |
| Reverse | `hire-employee-link` `SELECT … employees WHERE candidate_id = $1` — **no** `ADD COLUMN candidate_id` in `employees.service` ensureSchema | **ADD** soft col — cold DB fail-closed today |
| Employees | `id · company_id · employee_code · email NOT NULL · full_name · job_title_key · status · hired_at · custom_fields · archived_at · manager_id · avatar_url` | Prefill map lock — phone/dept in `custom_fields` |
| Accept-offer API | **ABSENT** Nest physical | API seat — **not this seat** |
| Accept audit cols | **ABSENT** on Lane A | **EXPAND** optional §5 |
| Hire assert | `HRM-REC-HIRE-400/409` LIVE | **RETAIN** |
| Stage history | `rec_candidate_stage_history` SEALED REC-05 | **RETAIN ≠ hire SoT** |
| Mail outbox | REC-06 SEALED | **RETAIN ≠ hire** |
| Source | `recruitment.service.ts` · `hire-employee-link.ts` · `employees.service.ts` | Dev after API CONFIRMED |

**FORBIDDEN invent this seat:** `rec_hire` / `rec_offer_accept` / second hire table · hard FK candidate↔employee · Nest `/rec` dual · PAY/payslip/salary columns · Campaign/`job_postings` hire SoT · claim mail `offer` = hire · seed · honesty flip · reopen J-06.

---

## 4. Physical UV→EMP prefill map (O4 — normative)

### 4.1 Field matrix

| # | Source | Source physical | → Target physical | Null on create | Rule | Maps |
|---|--------|-----------------|-------------------|----------------|------|------|
| **M01** | UV Lane A | `recruitment_candidates.full_name` | `employees.full_name` | **NO** | Required — missing → **`HRM-REC-HIRE-PREFILL-FAIL`** · **no re-key** | BA O4 · AC-07-01 |
| **M02** | UV | `recruitment_candidates.email` | `employees.email` | **NO*** | LIVE `email NOT NULL` — copy lower(trim); blank UV email → PREFILL-FAIL **or** link-only path (API) — **DENY** silent invent fake email | O4 · UQ email/CT |
| **M03** | UV | `phone` if present on UV/pool | `employees.custom_fields.phone_number` | YES | Prefer soft copy — OS 28 display | O4 · O12 |
| **M04** | UV | `cv_file_ref` / docs (if present) | Optional `employee_resume_files.file_url` peer CORE | YES | Soft attach — **DENY** invent PAY | O4 · handoff |
| **M05** | YCTD | `job_requisitions.company_id` | `employees.company_id` | **NO** | Same CT as offer/YCTD — cross-CT → **`HRM-REC-HIRE-409`** / SCOPE | O7 · U19 |
| **M06** | YCTD | `department_key` (prefer) / legacy `department` display | `custom_fields.department_key` (+ display label path) | YES Prefer | Catalog key — **DENY** free-text SoT | O4 · E1-A |
| **M07** | YCTD | `position_key` | `employees.job_title_key` | YES Prefer | Catalog SoT (`job_titles`) — invent key → CORE catalog reject (API) | O4 |
| **M08** | Body / UV pool / YCTD | `expected_start_date` | `employees.hired_at` (date) | YES Prefer | UX `dd/MM/yyyy` · ISO date persist | O4 · BA §1.1 |
| **M09** | UV | `recruitment_candidates.id` | `employees.candidate_id` | **NO** after success | Soft reverse — Lane A id preferred | O7 |
| **M10** | Application | `application_id` (accept path id) | Lane A `accepted_application_id` (+ history soft neo) | Prefer | Persist neo for idempotency | O5 · O7 |
| **M11** | — | — | `employees.status` | **NO** | Default **`pending_docs`** — **DENY** force `active` on accept alone | FR-07 special · O8 |
| **M12** | — | — | `employees.employee_code` | **NO** | Generate unique per CT (API rule) — **DENY** re-key from UV as primary UX | LIVE UQ |
| **M13** | Lane A | soft stamp | `recruitment_candidates.employee_id` = new/linked emp id | **NO** after 2xx | ONE soft link | O7 |
| **M14** | Dual-lane | `pool_candidate_id` set | `candidates.employee_id` = **same** emp id | Prefer | Mirror — **DENY** pool-alone FR-07 DONE | O7 · O9 |

\*Email: paper «Prefer»; LIVE column **NOT NULL** → treat as **create-required** under Option A physical (align VAL-REC-HIRE / PREFILL-FAIL).

### 4.2 Create vs link (data rules)

| Rule ID | Predicate | Outcome |
|---------|-----------|---------|
| **DV-REC-HIRE-MAP-01** | No valid reverse `employees.candidate_id` / soft `employee_id` same `company_id` | **CREATE** emp from §4.1 map · status `pending_docs` |
| **DV-REC-HIRE-MAP-02** | Existing soft link same CT valid | **LINK** — stamp/confirm · **no** second emp |
| **DV-REC-HIRE-MAP-03** | Re-accept same `application_id` already hired+linked | Idempotent return existing · **no** INSERT emp |
| **DV-REC-HIRE-MAP-04** | True conflict (different emp / race) | **409** `HRM-REC-HIRE-DUP` — **no** silent second profile |
| **DV-REC-HIRE-MAP-05** | Missing M01 `full_name` or M05 `company_id` | **400** `HRM-REC-HIRE-PREFILL-FAIL` · **no** emp · **no** stage |
| **DV-REC-HIRE-MAP-06** | Optional CORE fields missing (dept/position/phone/start) | Still CREATE `pending_docs` — **block Active** · HCNS hoàn thiện (FR-07 special) |
| **DV-REC-HIRE-MAP-07** | Empty re-key form as primary write SoT | **FAIL O3/O4** |
| **DV-REC-HIRE-MAP-08** | Client payroll/payslip/salary payload on accept | **`HRM-REC-PAY-403`** · **no** PAY columns written |

### 4.3 Status token lock (Q-REC-HIRE-STATUS-TOKEN — closed here)

| Token | Meaning | Use on hire CREATE |
|-------|---------|---------------------|
| **`pending_docs`** | «Chờ hoàn thiện» — paper §3.1 | **Default** after accept CREATE |
| `active` | Đang làm việc | **DENY** auto on accept alone — CORE/HTP after contract |
| Other open catalog keys | EMP-STATUS EFF | Allowed later via CORE mutate — **not** invent closed CHK |

**Note:** When `emp_employment_status` EFF **>0**, API must ensure `pending_docs` ∈ EFF or mint catalog bootstrap peer — **out of invent PAY**; residual API/CORE if EFF lacks key. EFF=0 → soft key persist OK (EMP open-status doctrine RETAIN).

---

## 5. Soft stamp + accept-audit columns (O7)

### 5.1 Soft hire stamp (RETAIN + ADD reverse)

| Table | Column | Type | Null | Action | Rule |
|-------|--------|------|------|--------|------|
| `recruitment_candidates` | **`employee_id`** | uuid | YES | **RETAIN** | Soft → `employees.id` · **no** `REFERENCES` · IX recommend `(employee_id) WHERE employee_id IS NOT NULL` |
| `candidates` | **`employee_id`** | uuid | YES | **RETAIN** | Mirror when `pool_candidate_id` linked · same soft doctrine |
| `employees` | **`candidate_id`** | uuid | YES | **ADD** if ABSENT | Soft → Lane A `recruitment_candidates.id` preferred · **no** hard FK · IX `(candidate_id) WHERE candidate_id IS NOT NULL AND archived_at IS NULL` |

**Invariant HIRE-SOFT-ONE:** At most **one** active emp per (application neo ∪ Lane A person) after accept 2xx — enforced app-side (idempotency + hire-employee-link).

**Invariant HIRE-NO-HARD-FK:** **FORBIDDEN** `ALTER … ADD CONSTRAINT … FOREIGN KEY (employee_id|candidate_id) REFERENCES …` for hire spine.

**Invariant HIRE-MIRROR:** If `recruitment_candidates.pool_candidate_id` IS NOT NULL → Lane B `candidates.employee_id` **must equal** Lane A stamp after success (or explicit NULL-only when unlink — out of FR-07 happy path).

**RETAIN assert codes:** `HRM-REC-HIRE-400` (link-only missing emp) · `HRM-REC-HIRE-409` (cross-company).

### 5.2 Optional accept-audit cols on Lane A (EXPAND — DENY second SoT)

| Cột | Kiểu | Null | Default | Ý nghĩa | Maps |
|-----|------|------|---------|----------|------|
| **`offer_accepted_at`** | timestamptz | YES | NULL | First successful accept timestamp | O5 idempotent · O12 |
| **`offer_accepted_by`** | text | YES | NULL | Actor membership/user id (scope audit) | U19 |
| **`accepted_application_id`** | uuid | YES | NULL | Soft neo to accept path application id | O1 · O5 |
| **`offer_id`** | uuid | YES | NULL | Soft offer entity id **if** exists elsewhere — **NULL OK** · **DENY** invent `rec_offer` table this seat | BA optional |

**CHK / index (recommend):**

| Rule | Spec |
|------|------|
| **IX** | `(company_id, offer_accepted_at DESC) WHERE offer_accepted_at IS NOT NULL` |
| **IX** | `(accepted_application_id) WHERE accepted_application_id IS NOT NULL` |
| **Idempotent write** | Re-accept: **do not** wipe `offer_accepted_at` / change `employee_id` · return existing |
| **DENY** | Second physical `rec_hire_event` / `rec_offer_accept` as SoT · hard FK to Campaign posting apps |

### 5.3 Illustrative DDL delta (docs only — Dev after API)

```sql
-- Reverse soft link (ABSENT AS-IS ensureSchema)
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS candidate_id UUID NULL;

CREATE INDEX IF NOT EXISTS idx_employees_candidate_id_active
  ON public.employees (candidate_id)
  WHERE candidate_id IS NOT NULL AND archived_at IS NULL;

-- Optional accept-audit on Lane A (EXPAND)
ALTER TABLE public.recruitment_candidates
  ADD COLUMN IF NOT EXISTS offer_accepted_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS offer_accepted_by TEXT NULL,
  ADD COLUMN IF NOT EXISTS accepted_application_id UUID NULL,
  ADD COLUMN IF NOT EXISTS offer_id UUID NULL;

CREATE INDEX IF NOT EXISTS idx_rec_cand_accepted_app
  ON public.recruitment_candidates (accepted_application_id)
  WHERE accepted_application_id IS NOT NULL;

-- FORBIDDEN examples (must NOT ship):
-- ALTER … ADD CONSTRAINT fk_rec_cand_employee FOREIGN KEY (employee_id) REFERENCES employees(id);
-- CREATE TABLE public.rec_hire …;
-- ALTER TABLE recruitment_candidates ADD COLUMN base_salary …;
```

---

## 6. FK / referential / scope rules

| Rule ID | Predicate | Outcome |
|---------|-----------|---------|
| **DV-REC-HIRE-FK-01** | `employee_id` / `candidate_id` = **soft UUID** only | Hard FK DDL → **FAIL O7** · G-DB-02 |
| **DV-REC-HIRE-FK-02** | Stamp emp `company_id` **must equal** YCTD/UV `company_id` (normalized slug) | Mismatch → **`HRM-REC-HIRE-409`** |
| **DV-REC-HIRE-FK-03** | `accepted_application_id` soft — **no** hard FK to `candidate_applications.job_posting_id` SoT | Posting hard FK → **FAIL** REC-03 |
| **DV-REC-HIRE-FK-04** | list get accept emp HTP same `resolveHrmListScope` | Cross-scope → 404/409 U19 |
| **DV-REC-HIRE-FK-05** | Soft-delete emp (`archived_at`) | Must not remain sole active hire link for new accept without resolve — API assert |
| **DV-REC-HIRE-FK-06** | Stage / history | **No** accept-audit owns `status`/history — APP-02 RETAIN |

---

## 7. Data interaction matrix

| Entity | C | R | U | D / soft | Transition |
|--------|---|---|---|----------|------------|
| `employees` (hire CREATE) | INSERT prefill §4 | GET display-ready | HCNS CORE peers | Soft `archived_at` RETAIN | `pending_docs` → active via CORE — **not** accept alone |
| Soft stamp Lane A/B | Set `employee_id` | Read link | Idempotent no-clobber | Unlink out-of-scope | — |
| `employees.candidate_id` | Set on CREATE/LINK | Reverse resolve | Keep ONE | Clear only controlled unlink | — |
| Accept-audit Lane A | Set on first accept | Read | Re-accept no wipe first-at | Soft only | — |
| Stage hired-outcome | — | History GET | — | — | **APP-02 only** |
| Mail outbox `offer` | — | — | — | — | **OUT as hire** |
| PAY / payslip | **DENY** | — | — | — | — |

---

## 8. Validation matrix (data-layer)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-REC-HIRE-D-01** | Accept CREATE | M01+M05 present | Emp row + soft stamps |
| **VAL-REC-HIRE-D-02** | Blank full_name / company | Reject | PREFILL-FAIL · no stamp |
| **VAL-REC-HIRE-D-03** | Email blank vs NOT NULL | Reject or gated | No invent fake email |
| **VAL-REC-HIRE-D-04** | Prefill phone/dept/position | Copy if present | No re-key required |
| **VAL-REC-HIRE-D-05** | Status on CREATE | `pending_docs` | Not auto-active |
| **VAL-REC-HIRE-D-06** | Soft link ONE | Single emp per app neo | No second emp / no hard FK |
| **VAL-REC-HIRE-D-07** | Dual-lane pool | Mirror employee_id | Same UUID |
| **VAL-REC-HIRE-D-08** | Re-accept | Idempotent | Same employee_id · audit at preserved |
| **VAL-REC-HIRE-D-09** | Cross-CT emp | Reject | HIRE-409 |
| **VAL-REC-HIRE-D-10** | PAY payload / salary col | Reject | PAY-403 · no DDL PAY |
| **VAL-REC-HIRE-D-11** | Nest `/rec` SoT table | Reject architecture | Alias only |
| **VAL-REC-HIRE-D-12** | Second hire table | Reject | DENY |
| **VAL-REC-HIRE-D-13** | Mail template offer row | ≠ hire | REC-06 RETAIN |
| **VAL-REC-HIRE-D-14** | Seed hire rows for U65 | Reject evidence | U65 |

---

## 9. Traceability (BRD/SRS → DB → API → FE → Test)

| Requirement | DB physical | API (next) | FE / Journey | Test expect |
|-------------|-------------|------------|--------------|-------------|
| FR-UC-BP-REC-07 #1–#2 · BR-BP-LC-01 | §4 map + §5 stamp | F-REC-HIRE-01 ADD | J-HRM-REC-07-01 | Prefill + employee_id F5 |
| O5 idempotent | Soft stamp + audit | Same POST | J-HRM-REC-07-02 | Same emp · no dup |
| O6 hired-outcome | APP-02 history RETAIN | F-REC-APP-02 | J-07-01 transitions | history_id |
| O7 soft link · G-DB-02 | §5 no hard FK | hire-employee-link RETAIN | Link assert | 400/409 |
| O8 HTP | employees + contracts peer | F-CORE-HTP-05 | J-HRM-REC-07-03 | NO-ACTIVE-CONTRACT |
| O11 no PAY | **no** PAY cols | PAY-403 | — | 403 |
| O9 mail≠hire | no mail SoT change | F-REC-MAIL-01 RETAIN | — | ≠ hire DONE |
| U19 scope | company_id soft CT | same resolver | J-HRM-REC-07-04 | 404/409 |

**scope_parity:** get application **=** accept-offer **=** get employee **=** hire-readiness — flag defect if list returns id but detail/accept 404 under group CEO `main`.

---

## 10. Error mapping (data outcomes → API codes)

| Data fail | HTTP | Code | Notes |
|-----------|------|------|-------|
| Missing required prefill (name/company[/email]) | 400 | `HRM-REC-HIRE-PREFILL-FAIL` | Mint API |
| Not offer-ready | 400 | `HRM-REC-HIRE-OFFER-INVALID` | Gate — API |
| Offer cancelled | 400 | `HRM-REC-HIRE-CANCELLED` | Optional mint |
| Link-only missing emp | 400 | `HRM-REC-HIRE-400` | RETAIN |
| Cross-company | 409 | `HRM-REC-HIRE-409` | RETAIN |
| True dup conflict | 409 | `HRM-REC-HIRE-DUP` | ≠ idempotent 2xx |
| PAY invent | 403 | `HRM-REC-PAY-403` | RETAIN |
| Stage invent | 400 | `HRM-REC-STAGE-UNKNOWN` | APP-02 RETAIN |
| Scope | 404/409 | `HRM-SCOPE-409` | U19 |
| No active contract (readiness) | ready=false | `HRM-HTP-NO-ACTIVE-CONTRACT` | HTP RETAIN · ≠ create fail |

---

## 11. DENY / must_keep footer

| Class | Items |
|-------|--------|
| **must_keep** | Soft `employee_id` Lane A+B · hire-employee-link 400/409 · APP-02 + `rec_candidate_stage_history` · UV-YCTD ONE `requisition_id` · REC-06 mail/eval ≠ hire · REC-06a IV · REC-04 scan · HTP-05 · EMP open status · soft-delete · U19 · G-DB-02 |
| **DENY** | Hard FK hire · second hire/accept SoT · Nest `/rec` dual · PAY/C&B columns on REC hire · invent `rec_offer` required · pool/Kanban hired alone = FR-07 DONE · claim REC-06 mail=`hire` · seed · honesty flip · reopen sealed J-HRM-REC-06-01..04 · apps/** this seat |
| **OUT** | UC-BP-REC-03 · REC-06b · CORE contract/SI rewrite as REC-only |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** |

---

## 12. Unlock ladder (next — **not Dev**)

```text
DATA-01 CONFIRMED (this seat)
  → sa API-01 F.1 F-REC-HIRE-01 ADD residual physical
       POST /api/hrm/recruitment/applications/:id/accept-offer
       mint HRM-REC-HIRE-* expand · RETAIN APP-02 · HTP-05 · HIRE-400/409 · PAY-403
       paper /rec/…/accept-offer = alias only
  → Dev-BE / Dev-FE only after API CONFIRMED
  → QA U65 J-HRM-REC-07-* · QC GWC C-SLICE
```

**cấm Dev** until API-01 CONFIRMED.

---

## 13. Data quality risks & mitigation

| Risk | Mitigation |
|------|------------|
| Cold DB missing `employees.candidate_id` | **ADD** col §5.1 before reverse resolve in BE |
| LIVE email NOT NULL vs BA «Prefer» | Treat email as create-required physical · PREFILL-FAIL |
| Dual-lane stamp drift | Invariant HIRE-MIRROR · same UUID |
| Dev invents `/rec` + hire table | DENY §1/§11 · API alias-only |
| Status `pending_docs` missing from EMP EFF | API/CORE residual — bootstrap or catalog row · not PAY invent |
| Accept-audit mistaken as stage SoT | Document APP-02 sole stage writer |
| Prefill writes salary into custom_fields | VAL-D-10 · strip PAY keys |

---

## 14. Completion

| Field | Value |
|-------|--------|
| **completion_report** | Physical DOC-DELTA **CONFIRMED** for UC-BP-REC-07 O4/O7: UV→EMP field map onto LIVE `employees` (+ `custom_fields` phone/dept); ONE soft hire link Lane A (+ pool mirror) + **ADD** reverse `employees.candidate_id`; optional Lane A accept-audit cols; default status `pending_docs`; **DENY** hard FK · second hire SoT · PAY columns · Nest `/rec` dual · mail=hire · seed · honesty · apps/**. Unlock **sa** API F.1 next — **not Dev**. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-data-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01.md` |
