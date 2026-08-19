# DB_DESIGN — HRM ERP E3 (CONSTRAINT + PERF-SM + INS-DEPTH)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-ERP-E3-DB-API-01` |
| **cohort** | E3 · `E-CONSTRAINT` / `CONSTRAINT-PERF-SM` · `P-HRM-ERP-DATA-FIDELITY-01` |
| **change_mode** | ADD · preserve_default · **APPEND** pointers on W2 Perf + Contracts/Ins + E2 |
| **ref_srs** | `docs/program/deltas/BA_ERP_E3_SRS_01_20260728.md` **FR-HRM-PERF-SM-E3-01** · **FR-HRM-INS-DEPTH-E3-01** · **FR-HRM-CONSTRAINT-E3-01** · BR-HRM-PERF/INS/ZOD/SM-E3-* · **AC-PERF-*** / **AC-INS-*** / **AC-E3-*** · team `docs/hrm/SRS.md` §16.6 · khách FR-HRM-PF-01 · FR-HRM-CI-02 · journeys **J-HRM-PERF/INS/SM-E3-01** |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` §14.3 CI-02 · §16.1 PF-01 · §17 spine performance / insurance |
| **ref_baseline** | `DB_DESIGN_HRM_W2_SLICE.md` §A/A′ · `DB_DESIGN_HRM_CONTRACTS_INS.md` · `DB_DESIGN_HRM_ERP_E2.md` §6.1 · E1-A/E1-B soft-assert pattern |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_ERP_E3.md` |
| **ref_dispatch** | `docs/program/FIDELITY_PROGRAM_DISPATCH.md` Cohort 4 |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB slice **before** Dev claim on Perf PATCH/DELETE + eval SM + Insurance policy master |
| **Date** | 2026-07-28 |
| **SA ACK** | **`SA-ERP-E3-ACK-01`** 2026-07-28 — Dev **UNLOCK** FE‖BE · evidence `docs/qa/evidence/sa-erp-e3-ack-01-20260728.md` |
| **Cấm** | `apps/**` this WI · **apply migration** this WI · seed U65 |

> **SM lock (normative — SRS §1.2/§1.3):** Evaluation = **`draft → submitted → approved → completed`** (no jump; withdraw submitted→draft only if product enables — default **cấm**). Policy = **`draft → active → expired|cancelled`**. Cycle axis = runtime **`draft | active | closed`** with SRS wording **`open` ≡ `active`** (alias lock — do **not** DDL-rename). Orthogonal — **cấm** collapse cycle into eval enums.

> **Insurance depth lock:** Policy **master** = `hrm_insurance_policies`; soft-link `policy_id` + **`insurer_key`** ∈ **`insurers`** + **`insurance_type`** ∈ **`insurance_types`**. E2 wired participants list only — E3 closes R-E2-INS-DEPTH.

> **must_keep:** E1-A `position_key` · E2 `pay_types` / `contract_types` asserts · Plane B TEXT slug · soft `employee_id` (G-DB-02) · W2 HARD `cycle_id` CASCADE.

---

## 1. Scope (in / out)

### 1.1 In-scope (E3)

| # | Domain | Gap class | Design action |
|---|--------|-----------|---------------|
| P1 | Performance create-only | No PATCH/DELETE cycle; no eval SM | ADD PATCH/DELETE cycle rules + eval `status` + transitions |
| P2 | KPI library bind thin | Eval free of grade/dept/KPI code | Soft columns + catalog asserts |
| I1 | Insurance thinner than Contracts | No policy master CRUD | ADD `hrm_insurance_policies` + CRUD semantics |
| I2 | Insurer free-text / snapshot | `provider` TEXT only | Soft **`insurer_key`** + U72 label snapshot |
| I3 | Participants orphan | No FK to policy | Soft `policy_id` assert |
| C1 | Cross-domain SM validators | Ad-hoc approve paths | Shared transition map + error family |
| C2 | Constraint validators | Required / unique / FK soft | VAL-E3 matrix (FE Zod + BE) |

### 1.2 Out of scope

| Item | Note |
|------|------|
| Tax settlement tables/API | E2 HIDE — still sponsor CR |
| Hard FK → catalog UUID rows | Soft assert only (E1-A pattern) |
| XBOS apply-to-members expand | E-XBOS-CTRL-SPEC |
| Settings MD bucket UI for `insurers` / `kpi_library` | Prefer E1-B pattern expand — **catalog key** locked here; UI bucket may be FE residual if not in ≥10 |
| Auto-bulk create evaluations on cycle activate | Still forbidden (PF-01) |
| Migration apply / seed | Cấm this WI |

### 1.3 must_keep

| Path | Status |
|------|--------|
| Cycle `draft\|active\|closed` CHECK | OK — extend with transition rules, not rename to eval enums |
| Eval HARD `cycle_id` CASCADE | OK |
| `employee_insurance_records` W1 spine | OK — ADD columns only |
| `hrm_insurance_policy_participants` live | OK — ADD `policy_id` / `insurer_key` |
| Leave / Recruitment existing SM paths | Cite + unify helper — do not wipe codes |

---

## 2. Shared constraint & status-machine contract (normative)

### 2.1 Helper — `assertStatusTransition`

| Item | Value |
|------|--------|
| Signature | `assertStatusTransition({ domain, from, to, entityId? })` |
| Behavior | Lookup allow-list; if `(from,to)` not allowed → **`HRM-SM-001`** (400) + optional domain code |
| Idempotent | `from === to` → **no-op success** (PATCH status same) |
| Unknown `from` | Treat as illegal → `HRM-SM-001` (do not invent repair) |

### 2.2 Domain transition maps

#### Performance — **cycle** (`performance_cycles.status`)

| From \ To | draft | active | closed |
|-----------|-------|--------|--------|
| **draft** | ✓ | ✓ | ✗ (must activate first **or** allow draft→closed as cancel — **lock: draft→closed = cancel OK**) |
| **active** | ✗ | ✓ | ✓ |
| **closed** | ✗ | ✗ | ✓ |

**DELETE cycle:** only when `status='draft'` **and** (no evaluations **or** product allows CASCADE — runtime already CASCADE). Prefer reject DELETE when any eval `status ∈ {submitted,approved,completed}` → **`HRM-PERF-DEL-BLOCK`** 409. Closed cycles: **no DELETE** (archive = closed).

#### Performance — **evaluation** (`performance_evaluations.status` — **ADD**)

| From \ To | draft | submitted | approved | completed |
|-----------|-------|-----------|----------|-----------|
| **draft** | ✓ | ✓ | ✗ | ✗ |
| **submitted** | ✗* | ✓ | ✓ | ✗ |
| **approved** | ✗ | ✗ | ✓ | ✓ |
| **completed** | ✗ | ✗ | ✗ | ✓ |

\*Withdraw `submitted`→`draft` — **default E3 = ✗** (SRS §1.2); enable only via explicit API waiver.

**U72 labels:** Nháp · Đã nộp · Đã duyệt · Hoàn thành.

**Cycle alias:** SRS BR «`draft`/`open`» PATCH ↔ DB `draft`/`active`; soft-close ↔ `closed`.

#### Insurance — **policy** (`hrm_insurance_policies.status`)

| From \ To | draft | active | expired | cancelled |
|-----------|-------|--------|---------|-----------|
| **draft** | ✓ | ✓ | ✗ | ✓ |
| **active** | ✗ | ✓ | ✓ | ✓ |
| **expired** | ✗ | ✗ | ✓ | ✗ |
| **cancelled** | ✗ | ✗ | ✗ | ✓ |

#### Leave (cite — unify helper)

Existing: `pending → approved | rejected | cancelled`. Map into same helper domain=`leave`.

#### Recruitment stage (cite — unify helper)

Existing candidate/application `stage` transitions + workflow lock — domain=`recruitment`; invalid → existing codes **or** `HRM-SM-001` + `HRM-REC-SM`.

### 2.3 Soft catalog assert (reuse E1-A/E2)

| Helper | Catalog | Error |
|--------|---------|-------|
| `assertCodeInEffectiveCatalog(…, 'insurers' \| aliases, code)` | Insurer | **`HRM-INS-INSURER-KEY`** |
| `assertCodeInEffectiveCatalog(…, 'insurance_types', code)` | Loại BH | **`HRM-INS-TYPE-KEY`** |
| `assertCodeInEffectiveCatalog(…, 'kpi_library' \| aliases, code)` | KPI def | **`HRM-PERF-KPI-KEY`** |
| `assertCodeInEffectiveCatalog(…, 'job_grades', code)` | Grade | **`HRM-PERF-GRADE-KEY`** |
| `assertCodeInEffectiveCatalog(…, 'departments', code)` | Dept | **`HRM-PERF-DEPT-KEY`** |
| Empty catalog + required field | Reject invent | Same 400 codes |

### 2.4 Catalog families — insurers + insurance_types (E3 ADD)

| Item | Insurer | Insurance type |
|------|---------|----------------|
| Canonical key | **`insurers`** | **`insurance_types`** |
| Aliases | `insurance_providers`, `bhxh_providers` | — |
| Persist | **`insurer_key`** = code | **`insurance_type`** = code |
| Display | U72 label / snapshot | U72 |
| Settings UI | Empty+CTA if no bucket (SRS must_keep) — **cấm** invent HARDCODE | Same |

### 2.5 Catalog family — kpi_library (bind depth)

| Item | Value |
|------|--------|
| Canonical key | **`kpi_library`** (DANH_MUC / linkage matrix) |
| Aliases | `kpi_metrics` (XBOS BM cite — soft only; do not confuse with XBOS `xbos_kpi_actuals`) |
| Persist on eval | **`kpi_code`** = catalog code |
| Bind depth | Optional **`job_grade_key`** + **`department_key`** on same row (or KPI def metadata) — assert when provided |

---

## 3. Table — `public.performance_cycles` (E3 delta)

| Item | Value |
|------|--------|
| Baseline | `DB_DESIGN_HRM_W2_SLICE.md` §A |
| Owner | `PerformanceService` |
| `ref_srs` | FR-HRM-PF-01 · AC-E3-PERF-PATCH · AC-E3-PERF-DEL |

### 3.1 Columns — no rename; semantics reinforce

| Column | E3 note |
|--------|---------|
| `status` | SM §2.2 cycle map; PATCH may change via helper |
| `cycle_name`, dates | PATCH allowed when `status ∈ {draft, active}`; **closed** → immutable dates/name (**`HRM-PERF-LOCKED`**) |
| `company_id` | TEXT slug must_keep |

### 3.2 Constraints — ADD (design)

| Rule | Error |
|------|-------|
| Transition via `assertStatusTransition('performance_cycle', …)` | **`HRM-SM-001`** / **`HRM-PERF-SM`** |
| DELETE only draft (+ eval guard) | **`HRM-PERF-DEL-BLOCK`** |
| Date order on PATCH | **`HRM-PERF-001`** |
| Overlap open cycles (optional reinforce) | **`HRM-PERF-002`** residual if not enforced |

No new columns required for cycle PATCH/DELETE.

---

## 4. Table — `public.performance_evaluations` (E3 delta)

| Item | Value |
|------|--------|
| Baseline | W2 §A′ — **no `status` today** |
| `ref_srs` | AC-E3-PERF-SM · AC-E3-PERF-KPI |

### 4.1 Columns — ADD (design only)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| **`status`** | TEXT NOT NULL DEFAULT `'draft'` | NO | Eval SM code | AC-E3-PERF-SM |
| **`kpi_code`** | TEXT | YES | Soft → `kpi_library.code` | AC-E3-PERF-KPI |
| **`job_grade_key`** | TEXT | YES | Soft → `job_grades.code` | KPI bind depth |
| **`department_key`** | TEXT | YES | Soft → `departments.code` | KPI bind depth |
| `kpi_name` | TEXT | YES | U72 label snapshot (optional) | U72 |
| `submitted_at` / `approved_at` / `completed_at` | TIMESTAMPTZ | YES | Audit stamps on transition | SM |

Existing: `id`, `company_id`, `employee_id` soft, `cycle_id` HARD, `score`, `summary`, `reviewer`, timestamps — **must_keep**.

### 4.2 Constraints / indexes — ADD

| Name / definition | Purpose | Error |
|-------------------|---------|-------|
| **`chk_performance_evaluation_status`** (`draft\|submitted\|approved\|completed`) | Domain SRS §1.2 | — |
| Index `(company_id, cycle_id, status)` | List filter | — |
| Soft unique `(cycle_id, employee_id)` WHERE status ≠ completed terminal reuse policy: prefer one row per emp×cycle | One open eval per NV×cycle | **`HRM-PERF-EVAL-DUP`** 409 |
| Soft assert employee in scope | App | 400/404 family |
| Soft assert kpi/grade/dept when present | §2.3 | KEY codes |
| Score 0..100 | Existing CHK | — |
| Mutate score/summary only when `status='draft'` | App | **`HRM-PERF-LOCKED`** |

### 4.3 DDL draft (**do not apply**)

```sql
-- Design only — Dev-BE after SA ack
ALTER TABLE public.performance_evaluations
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS kpi_code TEXT NULL,
  ADD COLUMN IF NOT EXISTS job_grade_key TEXT NULL,
  ADD COLUMN IF NOT EXISTS department_key TEXT NULL,
  ADD COLUMN IF NOT EXISTS kpi_name TEXT NULL,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NULL;

ALTER TABLE public.performance_evaluations
  DROP CONSTRAINT IF EXISTS chk_performance_evaluation_status;
ALTER TABLE public.performance_evaluations
  ADD CONSTRAINT chk_performance_evaluation_status
  CHECK (status IN ('draft','submitted','approved','completed'));

CREATE INDEX IF NOT EXISTS idx_performance_evaluations_company_cycle_status
  ON public.performance_evaluations (company_id, cycle_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS uq_performance_evaluations_cycle_employee
  ON public.performance_evaluations (cycle_id, employee_id);
```

---

## 5. Table — `public.hrm_insurance_policies` (**ADD** master)

| Item | Value |
|------|--------|
| Owner | **`ContractsInsuranceService`** (**SA-ERP-E3-ACK-01** lock) — **one** write path; do not split to CatalogExtensions |
| Consumers | Insurance module policy CRUD · participants link · UC-HRM-25 depth |
| `ref_srs` | AC-E3-INS-CRUD · FR-CI-02 depth |

### 5.1 Columns

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Khóa chính sách | AC-E3-INS-CRUD |
| **`company_id`** | TEXT NOT NULL | NO | Plane B slug | SCOPE |
| **`policy_code`** | TEXT NOT NULL | NO | Mã chính sách (unique/company) | VAL-E3-INS-01 |
| `policy_name` | TEXT NOT NULL | NO | Tên hiển thị | U72 |
| **`insurer_key`** | TEXT NOT NULL | NO | Soft → `insurers.code` | AC-INS-02 · BR-HRM-INS-E3-01 |
| `insurer_label` | TEXT | YES | Snapshot nhãn | U72 |
| **`insurance_type`** | TEXT NOT NULL | NO | Soft → `insurance_types.code` | AC-INS-03 · SRS key lock |
| `policy_type` | TEXT | YES | **Deprecated alias** — prefer `insurance_type`; do not dual-SoT | — |
| `effective_date` | DATE NOT NULL | NO | Hiệu lực từ | — |
| `expiry_date` | DATE | YES | Hết hạn | Expiring |
| **`status`** | TEXT NOT NULL DEFAULT `'draft'` | NO | SM §2.2 insurance | AC-E3-INS-SM |
| `notes` | TEXT | YES | Ghi chú | — |
| `created_by` | TEXT | YES | Audit | — |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | — |

### 5.2 Constraints / indexes

| Name | Purpose | Error |
|------|---------|-------|
| **`uq_hrm_insurance_policies_company_code`** UNIQUE `(company_id, lower(policy_code))` | Anti-dup | **`HRM-INS-POL-002`** 409 |
| `chk_hrm_insurance_policy_status` | draft/active/expired/cancelled | — |
| `chk_hrm_insurance_policy_dates` | expiry ≥ effective when set | **`HRM-INS-POL-001`** |
| Index `(company_id, status, expiry_date)` | List / expiring | — |
| Soft `insurer_key` assert | Catalog | **`HRM-INS-INSURER-KEY`** |
| Soft `insurance_type` assert | Catalog | **`HRM-INS-TYPE-KEY`** |

### 5.3 DDL draft (**do not apply**)

```sql
CREATE TABLE IF NOT EXISTS public.hrm_insurance_policies (
  id UUID PRIMARY KEY,
  company_id TEXT NOT NULL,
  policy_code TEXT NOT NULL,
  policy_name TEXT NOT NULL,
  insurer_key TEXT NOT NULL,
  insurer_label TEXT NULL,
  insurance_type TEXT NOT NULL,
  effective_date DATE NOT NULL,
  expiry_date DATE NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT NULL,
  created_by TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_hrm_insurance_policy_status
    CHECK (status IN ('draft','active','expired','cancelled')),
  CONSTRAINT chk_hrm_insurance_policy_dates
    CHECK (expiry_date IS NULL OR effective_date <= expiry_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_insurance_policies_company_code
  ON public.hrm_insurance_policies (company_id, lower(policy_code));

CREATE INDEX IF NOT EXISTS idx_hrm_insurance_policies_company_status_expiry
  ON public.hrm_insurance_policies (company_id, status, expiry_date);
```

---

## 6. Table — `public.hrm_insurance_policy_participants` (E3 delta)

| Item | Value |
|------|--------|
| Baseline | Runtime CatalogExtensions · E2 mock-removal SoT |
| E3 | Link to policy master + insurer + employee soft assert |

### 6.1 Columns — ADD

| Column | Type | Null | Meaning |
|--------|------|------|---------|
| **`policy_id`** | UUID | YES* | Soft → `hrm_insurance_policies.id` (*required on **new** writes after cutover) |
| **`insurer_key`** | TEXT | YES | Soft catalog (may denorm from policy) |
| `employee_id` | UUID | YES→prefer NOT NULL on new | Soft → employees — **assert in scope** |

\*Legacy rows may have NULL `policy_id` until backfill WI.

### 6.2 Soft refs / reject

| Field | Target | Error |
|-------|--------|-------|
| `policy_id` | Policy in same company scope + preferably `status='active'` for enroll | **`HRM-INS-POL-404`** / **`HRM-INS-POL-STATUS`** |
| `employee_id` | Active employee in scope | **`HRM-INS-EMP-404`** |
| `insurer_key` | effective `insurers` when provided | **`HRM-INS-INSURER-KEY`** |
| Unique soft `(policy_id, employee_id)` when both set | Anti double enroll | **`HRM-INS-P-DUP`** 409 |

### 6.3 DDL draft (**do not apply**)

```sql
ALTER TABLE public.hrm_insurance_policy_participants
  ADD COLUMN IF NOT EXISTS policy_id UUID NULL,
  ADD COLUMN IF NOT EXISTS insurer_key TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_hrm_ins_participants_policy
  ON public.hrm_insurance_policy_participants (policy_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_ins_participants_policy_employee
  ON public.hrm_insurance_policy_participants (policy_id, employee_id)
  WHERE policy_id IS NOT NULL AND employee_id IS NOT NULL;
```

**Cấm:** Hard `REFERENCES hrm_insurance_policies` this wave without backfill (soft assert first — same G-DB-02 spirit).

---

## 7. Table — `public.employee_insurance_records` (E3 delta)

| Item | Value |
|------|--------|
| Baseline | `DB_DESIGN_HRM_CONTRACTS_INS.md` §2 |
| E3 | Parity with Contracts depth: catalog insurer + optional policy link + PATCH/GET-by-id enabled in API_DESIGN |

### 7.1 Columns — ADD

| Column | Type | Null | Meaning |
|--------|------|------|---------|
| **`insurer_key`** | TEXT | YES→required on new | Soft → `insurers` |
| **`policy_id`** | UUID | YES | Soft → policy master |
| `provider` | TEXT (existing) | NO historically | **Snapshot label** — may copy from catalog label; **not** SoT when `insurer_key` set |

### 7.2 Semantics

| Rule | Detail |
|------|--------|
| New create | Require `insurer_key` (+ assert); `provider` = label snapshot or derived |
| Legacy | `provider` free-text rows remain readable; new writes prefer key |
| Status SM | Existing `active\|expired\|cancelled` — transitions via helper domain=`insurance_record` |
| Duplicate `policy_number` per company | Soft unique when product locks → **`HRM-INS-DUP`** |

### 7.3 DDL draft (**do not apply**)

```sql
ALTER TABLE public.employee_insurance_records
  ADD COLUMN IF NOT EXISTS insurer_key TEXT NULL,
  ADD COLUMN IF NOT EXISTS policy_id UUID NULL;

CREATE INDEX IF NOT EXISTS idx_employee_insurance_insurer_key
  ON public.employee_insurance_records (company_id, insurer_key);
```

---

## 8. Identity dual-plane + scope_parity (U19)

| Entity | List scope | Get/PATCH/DELETE by id |
|--------|------------|------------------------|
| Cycles / evaluations | `resolveHrmListScope` | **Same** family + `assertResourceInHrmScope` |
| Insurance policies | Same | Same |
| Participants | Same | Same |
| Employee insurance | Same as Contracts CI | Same |

**Fail:** list returns id under `main` but get 404 → `scope_parity` defect.

---

## 9. Validation matrix (DB / data plane)

| VAL-ID | Condition | Expected |
|--------|-----------|----------|
| VAL-E3-PERF-01 | PATCH cycle `closed`→`active` | Reject `HRM-SM-001` |
| VAL-E3-PERF-02 | Eval `draft`→`completed` skip | Reject `HRM-SM-001` |
| VAL-E3-PERF-03 | DELETE cycle with submitted eval | `HRM-PERF-DEL-BLOCK` |
| VAL-E3-PERF-04 | Eval `kpi_code` invent | `HRM-PERF-KPI-KEY` |
| VAL-E3-PERF-05 | Duplicate open eval same cycle+emp | `HRM-PERF-EVAL-DUP` |
| VAL-E3-INS-01 | Policy create unknown `insurer_key` | `HRM-INS-INSURER-KEY` |
| VAL-E3-INS-01b | Policy create unknown `insurance_type` | `HRM-INS-TYPE-KEY` |
| VAL-E3-INS-02 | Duplicate `policy_code` | `HRM-INS-POL-002` |
| VAL-E3-INS-03 | Participant without resolvable `policy_id` (post-cutover) | `HRM-INS-POL-404` |
| VAL-E3-INS-04 | Participant employee out of scope | `HRM-INS-EMP-404` |
| VAL-E3-INS-05 | Policy `active`→`draft` | `HRM-SM-001` |
| VAL-E3-LEAVE-01 | Leave `approved`→`pending` | `HRM-SM-001` (via shared helper) |
| VAL-E3-REC-01 | Illegal recruitment stage jump when locked | Existing / `HRM-SM-001` |
| VAL-E3-SCOPE-01 | Member slug mutates other company policy | 404/409 |

---

## 10. Acceptance (DB plane E3)

| Check | PASS |
|-------|------|
| Eval SM codes + cycle SM documented separately | §2.2 |
| Policy master table + unique code designed | §5 |
| Insurer / KPI soft-ref + error codes | §2.3–2.5 |
| Participant + employee insurance link columns | §6–7 |
| Shared SM helper contract | §2.1 |
| DDL draft present; **not applied** | Evidence |
| Pointers APPEND W2 / CI / E2 | Same WI |
| U65 | No seed insurers/kpi for evidence |

**Read-only probes (after Dev apply — not BA):**

```sql
SELECT status, COUNT(*) FROM public.performance_evaluations GROUP BY 1;
SELECT company_id, status, COUNT(*) FROM public.hrm_insurance_policies GROUP BY 1, 2;
SELECT COUNT(*) FROM public.hrm_insurance_policy_participants
WHERE policy_id IS NULL; -- legacy debt
```

---

## 11. must_keep / forbidden

| Keep | Forbidden |
|------|-----------|
| W2 cycle CHECK draft/active/closed | Replace cycle enums with eval SM strings |
| HARD cycle_id CASCADE | Drop CASCADE without SA |
| E2 pay/contract asserts | Overwrite E2 SoT |
| Soft emp / TEXT slug | LE UUID persist |
| Soft catalog assert | Hard FK catalog UUID this wave |
| Honest empty | Seed policies / insurers / KPI for U65 |
| Leave approve codes | Silent status overwrite without transition check |

---

## 12. Residuals

| ID | Finding | Owner |
|----|---------|-------|
| R-E3-SRS-DELTA | Formal E3 SRS | **CLOSED** — `BA_ERP_E3_SRS_01_20260728.md` |
| R-E3-SETTINGS-UI | MD bucket for `insurers` / `kpi_library` if not in E1-B ≥10 | dev-fe / E1-B follow-on |
| R-E3-PARTICIPANT-BACKFILL | NULL `policy_id` legacy rows | Dev-BE after cutover |
| R-E3-HARD-FK | Optional REFERENCES policy after clean | Separate wave |
| R-E3-XBOS-INSURERS | Publish `insurers` on XBOS DANH_MUC if missing | E-XBOS-CTRL / DevOps sync |
| R-E2-TAX-API | Still out | Sponsor CR |

---

## 13. DOC-DELTA pointers (APPEND targets)

| File | Pointer text |
|------|--------------|
| `DB_DESIGN_HRM_W2_SLICE.md` | E3 ADD eval `status` + KPI soft keys; cycle PATCH/DELETE rules → `DB_DESIGN_HRM_ERP_E3.md` |
| `DB_DESIGN_HRM_CONTRACTS_INS.md` | E3 policy master + `insurer_key` on records → E3 file; closes thin residual |
| `DB_DESIGN_HRM_ERP_E2.md` | R-E2-INS-DEPTH → **closed by E3 design** (impl after SA/Dev) |
| `DB_DESIGN_HRM_SETTINGS_E1B.md` | Catalog families `insurers`, `kpi_library` consumer ownership → E3 |
|
