# PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01 — Physical DB · Định biên × Auto YCTD (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous) |
| **lane** | governance · ba-data |
| **change_mode** | **ADD / EXPAND / NORMALIZE** AS-IS spine · **DOC-DELTA** · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — physical Option A + BA O1–O5 |
| **uc_ids** | `UC-BP-REC-01` · `UC-BP-REC-01b` |
| **ref_sa** | [`PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md) **Option A LOCKED** · §2 · §6 · §8 HC-S1..S7 · §9 D1–D4 |
| **ref_ba** | [`PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md) **O1–O5 CONFIRMED** · VAL-REC-HC-* |
| **ref_paper_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) **§2.2–§2.3** = **logical alias only** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-01** · **FR-UC-BP-REC-01b** |
| **Honesty** | `recruitment_uat_ready=false` · 16 program honesty flags **false** · **C-SLICE** · U65 |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| SoT định biên | **UPGRADE** AS-IS `public.recruitment_plans` + `recruitment_plan_departments` + `recruitment_plan_positions` |
| Cell SoT | **NORMALIZE** `recruitment_plan_positions.months_data` JSONB → **cell projection** (logical `rec_headcount_plan_cell`) |
| Paper names | `rec_headcount_plan` / `rec_headcount_plan_cell` / `rec_recruitment_request` = **logical alias only** |
| Dual physical | **DENY** CREATE `rec_headcount_plan` / `rec_headcount_plan_cell` / second `rec_headcount_*` SoT table |
| YCTD spine | **EXPAND** `public.job_requisitions` — ADD `headcount_cell_id` · `headcount_mode` · `target_month` (+ spawn UQ) |
| Legacy ns/dx | **O1 LOCK:** `headcount_need_hire ← dx` (null→0) · `headcount_current ← ns` (null→0) · **FORBIDDEN** dual persist post-wave |
| XBOS WF | **RETAIN** `workflow_instance_id` / bridges on plans + YCTD |
| `headcount_proposals` | **HOLD** peer REC-02b — **≠** FR-01 SoT · **FORBIDDEN** mutate as ĐB grid |
| REC-03 / `job_postings` | **OUT / DENY** as YCTD/ĐB SoT |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical AS-IS (Option A) | Action |
|-----------------|---------------------------|--------|
| `rec_headcount_plan` | `public.recruitment_plans` | **LIVE — UPGRADE** EXPAND keys / status notes |
| `rec_headcount_plan_cell` | Projection: row `recruitment_plan_positions` × element `months_data[i]` (+ dept/pos keys) | **NORMALIZE** — **DENY** second table named `rec_headcount_*` |
| `rec_recruitment_request` | `public.job_requisitions` | **LIVE — EXPAND** headcount link columns |
| `qty` (paper YCTD) | `job_requisitions.headcount` | **RETAIN** (G-RC-01) |
| `job_description_id` | `job_requisitions.job_template_id` | **RETAIN** soft FK (JD-YCTD-REF) |

```text
  recruitment_plans (header year + WF status)
        │ 1:N
        ▼
  recruitment_plan_departments (+ department_key ADD)
        │ 1:N
        ▼
  recruitment_plan_positions (+ position_key ADD)
        │ months_data JSONB[12] ──► cell projection
        │   cell_id · month · cell_status · lifecycle_status
        │   headcount_need_hire · headcount_current · headcount_projected?
        ▼
  job_requisitions (YCTD)
        headcount_mode=in_plan · headcount_cell_id · target_month
        UQ spawn (company_id, headcount_cell_id) partial
```

---

## 3. AS-IS baseline (Nest facts)

| Object | AS-IS columns / notes | Gap |
|--------|----------------------|-----|
| `recruitment_plans` | `id, company_id, title, start_month, end_month, year, note, status` (default `pending`), `creator_name`, timestamps; WF ADD: `workflow_instance_id`, `rejected_reason`, `wf_callback_fingerprint` | Status token map; optional dept submit key |
| `recruitment_plan_departments` | `id, plan_id, company_id, name, sort_order` | **No** `department_key` — free-text SoT FAIL |
| `recruitment_plan_positions` | `id, department_id, company_id, name, months_data JSONB, sort_order` | `months_data` = `[{ns,dx}×12]` dual number FAIL SRS |
| `job_requisitions` | `id, company_id, title, department, employment_type, headcount≥1, status, job_description, requirements, job_template_id`, WF cols | **No** `headcount_cell_id` / `headcount_mode` / `target_month` |
| Spawn | ABSENT | ADD service path (API seat) + UQ physical |

Source: `recruitment-catalog.service.ts` ensureSchema · `recruitment.service.ts` · `recruitment-workflow.bridge.ts`.

---

## 4. EXPAND — `public.recruitment_plans` (header)

### 4.1 Columns (ADD-only)

| Cột | Kiểu | Null | Default | Action | Ý nghĩa |
|-----|------|------|---------|--------|---------|
| *(existing)* | — | — | — | **RETAIN** | Header year / title / WF |
| `submitted_by_dept_key` | text | YES | NULL | **ADD** | Soft key phòng trình (Q-REC-HC-2) — catalog OU |
| `approved_at` | timestamptz | YES | NULL | **ADD** | Approve stamp (F-REC-HC-03) |
| `approved_by` | text | YES | NULL | **ADD** | Approver id/email snapshot |
| `activation_mode` | text | YES | NULL | **ADD optional** | Snapshot CFG at approve: `on_approve` \| `calendar_month` — **≠** invent second CFG SoT table |

### 4.2 Status tokens (DOC + CHK later)

| AS-IS / WF | Normative (SA D2) | Note |
|------------|-------------------|------|
| `pending` / draft-like | `draft` | Migrate map: `pending` → `draft` **or** accept synonym in API until FE remaster |
| submitted / chờ duyệt | `pending_approval` | Paper `submitted` ↔ `pending_approval` |
| approved | `approved` | Cell lock + spawn gate HC-S1 |
| rejected | `rejected` | + `rejected_reason` RETAIN |

**FORBIDDEN:** Drop WF columns · invent parallel plan header table.

### 4.3 Indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` RETAIN |
| **IX** | `(company_id, year)` · `(company_id, status)` · `(workflow_instance_id)` RETAIN |

---

## 5. EXPAND — departments / positions (catalog keys)

### 5.1 `public.recruitment_plan_departments`

| Cột | Kiểu | Null | Action | Ý nghĩa |
|-----|------|------|--------|---------|
| `department_key` | text | YES→**NO after backfill** | **ADD** | Soft FK → departments / OU catalog · **SoT** |
| `name` | text | NO | **RETAIN** | Denorm label snapshot — **≠** SoT when catalog EFF>0 |

| Key | Rule |
|-----|------|
| **UQ soft** | `(plan_id, lower(department_key))` WHERE `department_key IS NOT NULL` (prefer) |
| **VAL** | VAL-REC-HC-02 — free-text-only when EFF>0 → **4xx** (API) |

### 5.2 `public.recruitment_plan_positions`

| Cột | Kiểu | Null | Action | Ý nghĩa |
|-----|------|------|--------|---------|
| `position_key` | text | YES→**NO after backfill** | **ADD** | Soft FK → `job_titles` / position catalog · **SoT** |
| `name` | text | NO | **RETAIN** | Denorm snapshot |
| `months_data` | jsonb | NO | **NORMALIZE** | Cell projection (§6) — **cấm** dual `ns`+`dx` SoT post-wave |

| Key | Rule |
|-----|------|
| **UQ soft** | `(department_id, lower(position_key))` WHERE `position_key IS NOT NULL` |
| **VAL** | VAL-REC-HC-03 |

---

## 6. Cell projection — `months_data` normalize (logical `rec_headcount_plan_cell`)

> **Physical preference:** keep cells in `months_data` JSONB (preserve_default).  
> **DENY** CREATE `public.rec_headcount_plan_cell` / `public.rec_headcount_plan`.  
> **HOLD GĐ1.5:** materialize `public.recruitment_plan_cells` only if sponsor asks FK hardness — must stay under `recruitment_*` spine, **never** dual-named `rec_headcount_*`.

### 6.1 Element shape (normative post-wave)

```json
{
  "cell_id": "uuid",
  "month": 1,
  "cell_status": "need_hire",
  "lifecycle_status": "open",
  "headcount_need_hire": 2,
  "headcount_current": 5,
  "headcount_projected": null
}
```

| Field | Type | Rule |
|-------|------|------|
| `cell_id` | uuid string | **Stable identity** — generate on first normalize/save; soft target of `job_requisitions.headcount_cell_id` |
| `month` | int 1..12 | VAL-REC-HC-04; array length **12** on submit |
| `cell_status` | enum | **Semantic** SRS: `current` \| `need_hire` \| `projected` — exactly one (BR-BP-HC-01) |
| `lifecycle_status` | enum | `open` \| `need_hire_approved` \| `fulfilled` \| `cancelled` — after plan approve, need_hire cells → `need_hire_approved` (lock) |
| `headcount_need_hire` | int ≥0 | **Cần tuyển SoT** · API alias `need_hire` · when `cell_status=need_hire` must be **≥1** (VAL-REC-HC-06) |
| `headcount_current` | int ≥0 | Hiện tại snapshot (from legacy `ns`) |
| `headcount_projected` | int \| null | Dự kiến qty when `cell_status=projected`; else null |

**Paper column alias:** `headcount_need_hire` ≡ DB projection field ≡ API `need_hire`.

### 6.2 UQ cell identity (logical)

| UQ | Definition |
|----|------------|
| **Cell natural key** | `(plan_id, department_key, position_key, month)` — unique within plan |
| **Surrogate** | `cell_id` unique among all cells of plan (and ideally globally) |
| **Spawn consumer** | Exactly **one** YCTD per `cell_id` when `headcount_mode=in_plan` (HC-S3 / BR-BP-HC-04) |

App enforce natural key; optional GIN/expression index **not** required GĐ1 if resolve-by-scan acceptable — prefer resolve via position row + month.

### 6.3 Legacy migrate `ns` / `dx` (**O1 LOCK** — BA CONFIRMED)

| Legacy | Target | Rule |
|--------|--------|------|
| `dx` | `headcount_need_hire` | `COALESCE(dx, 0)` — **dx prefer** for Cần tuyển |
| `ns` | `headcount_current` | `COALESCE(ns, 0)` |
| Dual editors | — | **FORBIDDEN** post-wave (VAL-REC-HC-15 · AC-ALT-03/05) |
| `cell_status` derive | | If `headcount_need_hire ≥ 1` → `need_hire`; else → `current` |
| `projected` | | **Never invented** from ns/dx — only new writes |
| `cell_id` | | `gen_random_uuid()` per element on migrate |
| `lifecycle_status` | | `open` if plan not approved; if plan already `approved` and need_hire ≥1 → `need_hire_approved` |

> SA D1 text «dx if dx>0 else ns» **superseded** for migrate by **BA O1 CONFIRMED** (dx→need_hire, ns→current). Mission line «dx prefer / current=ns» = same.

### 6.4 Cell lock after approve

| Condition | Persist |
|-----------|---------|
| Plan → `approved` | All `cell_status=need_hire` → `lifecycle_status=need_hire_approved` |
| Mutate need_hire qty/status without override | **403/409** (VAL-REC-HC-10 · AC-EX-04) |
| Qty change after spawn | **D4 / O3:** warn `HRM-HC-SPAWN-QTY-DRIFT` · **no** silent YCTD overwrite |

---

## 7. EXPAND — `public.job_requisitions` (YCTD)

### 7.1 ADD columns

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `headcount_cell_id` | uuid | YES | NULL | Soft FK → cell projection `cell_id` · **required** when `headcount_mode='in_plan'` |
| `headcount_mode` | text | YES→NO for new writes | NULL legacy / prefer `'out_of_plan'` only on peer REC-02b path | `in_plan` \| `out_of_plan` |
| `target_month` | date | YES | NULL | First day of plan month (e.g. `2026-03-01`) — month split BR-REC-01-MONTH-SPLIT |
| `recruitment_plan_id` | uuid | YES | NULL | **ADD optional** denorm for list-by-plan · soft resolve · **no** CASCADE delete YCTD when plan archived |
| `department_key` | text | YES | NULL | **ADD recommended** — catalog key from cell (department free-text RETAIN as snapshot) |
| `position_key` | text | YES | NULL | **ADD recommended** — from cell / JD · UV path already derives from JD soft |

**must_keep RETAIN:** `headcount` (≥1) · `job_template_id` · WF cols · status ladder · soft-delete policy if present · UF-HRM-12🟢.

### 7.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **CHK mode** | `headcount_mode IS NULL OR headcount_mode IN ('in_plan','out_of_plan')` |
| **CHK in_plan cell** | App+optional DB: `headcount_mode='in_plan' ⇒ headcount_cell_id IS NOT NULL` |
| **UQ spawn (idempotent)** | **Partial unique:** `uq_job_requisitions_spawn_cell` ON `(company_id, headcount_cell_id)` **WHERE** `headcount_mode = 'in_plan' AND headcount_cell_id IS NOT NULL` *(and soft-delete predicate if `archived_at` exists)* |
| **IX** | `(company_id, headcount_mode)` · `(headcount_cell_id)` · `(recruitment_plan_id)` · `(company_id, target_month)` |
| **FORBIDDEN** | Second YCTD table · `job_postings` as spawn target · CASCADE from plan→YCTD |

### 7.3 Spawn write invariants (physical ↔ HC-S*)

| ID | Physical rule |
|----|---------------|
| HC-S1 | Plan `status=approved` else **409** `HRM-HC-SPAWN-PLAN-NOT-APPROVED` |
| HC-S2 | Source cells: `cell_status=need_hire` AND `headcount_need_hire≥1` AND lifecycle approved — **never** current/projected alone |
| HC-S3 | Insert YCTD with `headcount_mode=in_plan`, copy qty→`headcount`, set `target_month`, keys, `headcount_cell_id` |
| HC-S4 | UQ violation / pre-check → `skipped_duplicate` · **no** second row |
| HC-S5 | Qty drift → surface `HRM-HC-SPAWN-QTY-DRIFT` · YCTD unchanged until explicit PATCH |
| HC-S6 / O2 | Activation: CFG `on_approve` \| `calendar_month`; **BA O2:** CFG unset ⇒ MVP treat as `on_approve`; `calendar_month` missing schedule ⇒ **block** + VI message |
| HC-S7 | Optional JD bind via existing `job_template_id` if cell/policy configured — **no** Campaign |

---

## 8. Activation CFG (physical note — no second headcount table)

| Store | Rule |
|-------|------|
| Preferred | Tenant settings / company CFG key (e.g. `hrm.rec.headcount_activation`) — **JSON** `{ "mode": "on_approve"|"calendar_month", "months":[…] }` |
| Snapshot | Optional `recruitment_plans.activation_mode` at approve |
| **DENY** | `rec_headcount_activation_*` mega-table · seed CFG for UF |

---

## 9. Explicitly **FORBIDDEN** this seat

| Item | Reason |
|------|--------|
| CREATE `rec_headcount_plan` / `_cell` | Dual SoT vs Option A |
| Dual persist `ns`+`dx` post-wave | SRS special FAIL |
| Mutate `headcount_proposals` as FR-01 | HOLD REC-02b |
| REC-03 campaign / `job_postings` YCTD SoT | OUT |
| Seed plans/inbox/YCTD for evidence | U65 |
| Flip `recruitment_uat_ready` | Honesty / C-SLICE |
| Wipe YCTD/JD/UV/IV/stage/WF | must_keep |
| Hard FK `REFERENCES` into JSON cell | Soft resolve only unless GĐ1.5 materialize under `recruitment_*` |

---

## 10. Validation matrix (data layer)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-REC-HC-DATA-01 | Migrate element | `need_hire=COALESCE(dx,0)` · `current=COALESCE(ns,0)` | Dual fields gone from SoT |
| VAL-REC-HC-DATA-02 | Save cell `need_hire` status | `headcount_need_hire≥1` | Else 4xx |
| VAL-REC-HC-DATA-03 | Submit plan | 12 months present · one `cell_status` each | Else 4xx |
| VAL-REC-HC-DATA-04 | Catalog EFF>0 | `department_key` / `position_key` required ∈ catalog | Free-text-only → 4xx |
| VAL-REC-HC-DATA-05 | Approve | need_hire cells → `lifecycle_status=need_hire_approved` | Locked |
| VAL-REC-HC-DATA-06 | Spawn | Plan approved + need_hire cells | Insert ≤1 / `cell_id` |
| VAL-REC-HC-DATA-07 | Re-spawn same cell | UQ partial | skip / 409 duplicate class — **no** 2nd row |
| VAL-REC-HC-DATA-08 | `in_plan` without `headcount_cell_id` | CHK | 4xx |
| VAL-REC-HC-DATA-09 | Two months same pos | Two `cell_id` | Two YCTD allowed |
| VAL-REC-HC-DATA-10 | Scope list↔get plan/YCTD | same `resolveHrmListScope` | U19 — no 404 rollup skew |
| VAL-REC-HC-DATA-11 | Qty after spawn | drift warn | No silent overwrite |
| VAL-REC-HC-DATA-12 | Attempt CREATE `rec_headcount_*` | Diff / TM | **FAIL process** |

### Error codes (mint for API-01)

| Code | HTTP | When |
|------|------|------|
| `HRM-HC-VAL-400` | 400 | Cell/month/status/qty validation |
| `HRM-HC-KEY-UNKNOWN` | 400 | department_key / position_key ∉ catalog |
| `HRM-HC-CELL-LOCKED` | 403/409 | Mutate after approve without override |
| `HRM-HC-SPAWN-PLAN-NOT-APPROVED` | 409 | HC-S1 |
| `HRM-HC-SPAWN-DUP` | 409 | Idempotent collide (or map to skipped_duplicate 200) |
| `HRM-HC-SPAWN-QTY-DRIFT` | 409/422 | D4 warn path |
| `HRM-HC-ACTIVATION-CFG` | 409/412 | calendar_month missing schedule |
| Scope | 403/409 | U19 |

---

## 11. Traceability

| Requirement | DB physical | API (next) | FE | Test / Journey |
|-------------|-------------|------------|----|----------------|
| FR-UC-BP-REC-01 · AC-REC-HC-01* | §4–§6 plans/dept/pos/months | F-REC-HC-01..03 | single Cần tuyển | **J-HRM-REC-HC-01** · UF-HRM-REC-HC-01 |
| FR-UC-BP-REC-01b · BR-BP-HC-04 | §7 YCTD + UQ | F-REC-HC-05 spawn | list YCTD | **J-HRM-REC-HC-01b** |
| O1 ns/dx | §6.3 migrate | DTO `need_hire` | dual column ABSENT | AC-ALT-03/05 |
| O2 activation | §8 CFG | spawn gate | message VI | AC-01b-ALT-04 / EX-02 |
| O3 drift | §6.4 / HC-S5 | drift code | warn | AC-01b-ALT-02 |
| O4 vượt grid | **OUT** data | — | warn only | VAL-REC-HC-16 |
| O5 HCNS rollup | read aggregation | GET rollup | no write-all | AC-01e / EX-05 |
| Q-REC-HC-2 | `submitted_by_dept_key` + scope | mutate ACL | TP room | EX-05 |
| UF-HRM-12🟢 / J-HRM-05 | YCTD RETAIN | — | must_keep | regression |
| scope_parity U19 | company_id TEXT | list=get=spawn | deep link | VAL-REC-HC-DATA-10 |
| Paper §2.2–2.3 | **alias** → this file | — | — | DENY dual physical |

---

## 12. DOC-DELTA — client `DB_DESIGN_HRM_ENTERPRISE.md`

| Action | Content |
|--------|---------|
| **EXPAND §2.2** | Stamp: logical `rec_headcount_*` = **alias** of AS-IS `recruitment_plans` + dept/pos + `months_data` cell projection — **DENY** dual physical |
| **EXPAND §2.3** | Stamp: ADD physical columns on `job_requisitions`: `headcount_cell_id` · `headcount_mode` · `target_month` (+ UQ spawn) — SoT path = this DATA-01 |
| **Registry** | DOC-DELTA CONFIRMED `PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01` |
| **FORBIDDEN** | Wipe §2.2–§2.8 · invent REC-03 · claim paper tables live in Nest |

**Team SoT primary:** this file. Client paper remains logical vocabulary for SRS/API names.

---

## 13. Migration notes (Dev-BE later — ADD-only)

1. `ALTER TABLE` ADD columns §§4–5–7 (`IF NOT EXISTS`).
2. One-time SQL/app job: rewrite `months_data` elements per §6.3; mint `cell_id`.
3. Create partial UQ `uq_job_requisitions_spawn_cell`.
4. Backfill catalog keys where name matches catalog (best-effort); else leave NULL → FE/API force pick on next save (VAL).
5. **No** DROP of `ns`/`dx` keys until FE remaster shipped — after remaster, writers must not emit `ns`/`dx`.
6. **No** seed · **No** DELETE of plans/YCTD · feature-flag spawn off = rollback.

---

## 14. Residual

| ID | Item | Owner |
|----|------|-------|
| R-REC-HC-API | F.1 physical paths + DTO↔column + spawn contract | **`PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01`** · **sa** |
| R-REC-HC-BE | ensureSchema + normalize + spawn + scope tests | **dev-be** after API |
| R-REC-HC-FE | Single Cần tuyển column · label Định biên · post-2xx F5 | **dev-fe** |
| R-REC-HC-QA | Browser J-HRM-REC-HC-01/01b U65 | **qa** |
| R-REC-02b | `headcount_proposals` / out_of_plan BOD | QUEUED peer |
| R-REC-03 | Campaign | **DENY** |

---

## 15. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| Program honesty (16) | **false** |
| C-SLICE ≠ module REC UAT | **true** |
| Seed in UF | **forbidden** |
| This seat | Docs + client DOC-DELTA pointer only |

---

## 16. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-data-01.md` |
| **next_owner** | **sa** (`PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01`) |
| **completion_report** | CONFIRMED Option A physical: UPGRADE `recruitment_plans` spine; NORMALIZE `months_data` → cell projection (`cell_id`, `headcount_need_hire`, semantic+lifecycle); ADD dept/pos catalog keys; EXPAND `job_requisitions` with `headcount_cell_id`/`headcount_mode`/`target_month` + partial UQ spawn; O1 migrate dx→need_hire / ns→current; **DENY** dual `rec_headcount_*` table · REC-03 · seed · honesty flip. |

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-01 · UC-BP-REC-01b

MISSION: TechSpec/API F.1 DOC-DELTA on PHYSICAL Option A paths (not paper-only).
Lock DTO↔column for recruitment-plans* + ADD POST …/recruitment-plans/:id/spawn-requests
(F-REC-HC-01..03/05); map need_hire ↔ headcount_need_hire; HC-S1..S7; error codes HRM-HC-*;
scope_parity U19; cite DATA-01 physical SoT.

READ FIRST:
1. docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md (CONFIRMED)
2. docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md §8–§9
3. docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md AC/VAL
4. docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-data-01.md
5. API_DESIGN_HRM_ENTERPRISE.md F-REC-HC-* (logical alias only)

DELIVER:
- docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md
- docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-api-01.md
must_keep: Option A · XBOS WF · YCTD spine · REC-03 OUT · honesty false · U65 · DENY dual rec_headcount_*
EXIT: PASS_TO_PM CONFIRMED · next_owner pm → unlock dev-be/fe after API CONFIRMED
```
