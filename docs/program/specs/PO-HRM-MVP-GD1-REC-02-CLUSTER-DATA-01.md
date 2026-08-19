# PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01 — Physical DB · YCTD trong/ngoài ĐB (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous) |
| **lane** | governance · ba-data |
| **change_mode** | **UPGRADE / EXPAND** AS-IS `job_requisitions` · **DOC-DELTA** · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — physical Option A + BA O1–O5 |
| **uc_ids** | `UC-BP-REC-02` · `UC-BP-REC-02b` |
| **depends_on** | BA-01 O1–O5 **CONFIRMED** · SA-01 Option **A LOCKED** · REC-01 DATA-01 cell identity **RETAIN** |
| **ref_sa** | [`PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md) Option A · Y-S1..Y-S13 · F-REC-YCTD-01..04 |
| **ref_ba** | [`PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md) VAL-REC-YCTD-01..18 · AC-REC-YCTD-02* |
| **ref_data_spine** | [`PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md) — **do not contradict** sealed `cell_id` / spawn UQ |
| **ref_paper_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) **§2.3** = **logical alias** `rec_recruitment_request` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-02** · **FR-UC-BP-REC-02b** |
| **Honesty** | `recruitment_uat_ready=false` · 16 program honesty flags **false** · **C-SLICE** · U65 |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| SoT YCTD | **UPGRADE** AS-IS `public.job_requisitions` only |
| Paper name | `rec_recruitment_request` = **logical alias only** |
| Dual physical | **DENY** CREATE `rec_recruitment_request` / Nest `/rec/...` dual path |
| REC-01 spine | **RETAIN** `headcount_mode` · `headcount_cell_id` · `target_month` · `uq_job_requisitions_spawn_cell` · JD soft FK · cell soft resolve |
| Wave-2 ADD | `hire_reason` · `replace_employee_id` · `out_of_plan_reason` · `approval_matrix_key` · `pipeline_flags_json` · status token `open_for_hire` in CHK |
| XBOS WF | **RETAIN** one bridge `hrm_requisition_approval` / `WF_BUSINESS_TYPE_HRM_REQUISITION` |
| O2 vượt ô | **409 reject** — **no** data path that silently stays `in_plan` |
| O4 legacy NULL mode | **LEGACY_UNCLASSIFIED** — grandfather read; **block** CV until classify; **no** silent treat as `in_plan` |
| `headcount_proposals` | **HOLD** ≠ YCTD SoT (**O5**) |
| REC-03 / Campaign | **OUT / DENY** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **soft-delete only** |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical AS-IS (Option A) | Action |
|-----------------|---------------------------|--------|
| `rec_recruitment_request` | `public.job_requisitions` | **LIVE — UPGRADE** Wave-2 columns + CHK |
| `qty` | `job_requisitions.headcount` | **RETAIN** (G-RC-01) |
| `job_description_id` | `job_requisitions.job_template_id` | **RETAIN** soft FK (JD-YCTD-REF) |
| `pipeline_flags_json` | `job_requisitions.pipeline_flags_json` | **ADD** (ABSENT AS-IS) |
| `/api/hrm/rec/recruitment-requests*` | `/api/hrm/recruitment/requisitions*` | **Alias only** — **DENY** dual Nest SoT |

```text
  REC-01 sealed cell projection (months_data[].cell_id)
        │ soft resolve — NO hard FK into JSON
        ▼
  job_requisitions (sole YCTD SoT)
        RETAIN: headcount_mode · headcount_cell_id · target_month
                · uq_job_requisitions_spawn_cell · job_template_id
                · workflow_instance_id · rejected_reason
        ADD:    hire_reason · replace_employee_id · out_of_plan_reason
                · approval_matrix_key · pipeline_flags_json
                · status open_for_hire in CHK
        │
        ▼
  XBOS hrm_requisition_approval (one business_type; matrix conditions = mode + hire_reason)
```

**Cell identity lock (REC-01):** `headcount_cell_id` soft-targets `months_data[].cell_id` — **FORBIDDEN** hard `REFERENCES` into JSON · **FORBIDDEN** mint+relink that orphans sealed cell_id (peer CELLID FIX orthogonal).

---

## 3. AS-IS baseline (Nest facts)

| Object | AS-IS | Gap (Wave-2) |
|--------|-------|--------------|
| `job_requisitions` core | `id, company_id, title, department, employment_type, headcount≥1, status, job_description, requirements, job_template_id, created_at, updated_at` | — |
| REC-01 cols | `headcount_cell_id, headcount_mode, target_month, recruitment_plan_id, department_key, position_key` + `chk_job_requisitions_headcount_mode` + `uq_job_requisitions_spawn_cell` | Create path **does not require** mode/hire/out reason |
| Status CHK (WF bridge) | `open\|closed\|on_hold\|draft\|pending_approval\|approved\|rejected\|cancelled` | **`open_for_hire` ABSENT** from CHK (list filter already mentions synonym) |
| Create path | INSERT `status='open'` immediate | **GAP P0** vs Y-S7 |
| Hire / out reason / matrix / pipeline JSON | **ABSENT** | **ADD** |
| Soft-delete | No `archived_at` on LIVE table (paper has it) | **ADD optional** `archived_at` for soft-delete policy · **DENY** hard DELETE product path |
| Spawn | LIVE post REC-01 | **RETAIN** — manual create must not break UQ |
| Source | `recruitment.service.ts` ensureSchema · `recruitment-catalog.service.ts` · `recruitment-workflow.bridge.ts` | — |

---

## 4. EXPAND — `public.job_requisitions` (Wave-2 ADD)

### 4.1 Columns **RETAIN** (must_keep — do not drop/rename)

| Cột | Kiểu | Rule |
|-----|------|------|
| `headcount_mode` | text NULL | `in_plan` \| `out_of_plan` \| **NULL = LEGACY_UNCLASSIFIED (O4)** |
| `headcount_cell_id` | uuid NULL | Required when mode=`in_plan` (app+CHK) · soft → cell `cell_id` |
| `target_month` | date NULL | First day of plan month |
| `recruitment_plan_id` | uuid NULL | Optional denorm |
| `department_key` / `position_key` | text NULL | Catalog soft keys |
| `headcount` | int ≥1 | Paper `qty` |
| `job_template_id` | text NULL | JD soft FK |
| `workflow_instance_id` / `rejected_reason` / `wf_callback_fingerprint` | — | XBOS bridge |
| Spawn UQ | partial unique | **RETAIN** `uq_job_requisitions_spawn_cell` |

### 4.2 Columns **ADD** (ensureSchema `ADD COLUMN IF NOT EXISTS`)

| Cột | Kiểu | Null | Default | Ý nghĩa | VAL / AC |
|-----|------|------|---------|---------|----------|
| `hire_reason` | text | YES→**NO on submit** | NULL | `new` \| `replace` | VAL-05 · AC-02b · EX-04 · Y-S6 |
| `replace_employee_id` | uuid | YES | NULL | Soft FK → employee when `hire_reason=replace` · **no** `ON DELETE CASCADE` | VAL-06 · ALT-02 |
| `out_of_plan_reason` | text | YES | NULL | Required when `headcount_mode=out_of_plan` on submit | VAL-04 · AC-02b-01 · Y-S5 |
| `approval_matrix_key` | text | YES | NULL | Snapshot SHORT/LONG (tenant XBOS) at submit | VAL-09 · BR-HC-05/06 · Y-S8 |
| `pipeline_flags_json` | jsonb | YES | `'{}'::jsonb` preferred | MVP flags on YCTD — **not** Campaign | VAL-10/11/13 · F-REC-YCTD-04 · Y-S13 |
| `approved_at` | timestamptz | YES | NULL | Optional stamp on full approve | F-REC-YCTD-03 |
| `approved_by` | text | YES | NULL | Approver id/email snapshot | F-REC-YCTD-03 |
| `archived_at` | timestamptz | YES | NULL | Soft-delete only · list default excludes archived | Soft-delete policy |

### 4.3 `pipeline_flags_json` shape (normative)

```json
{
  "posted": false,
  "has_cv": false,
  "interview_started": false,
  "cv_intake_allowed": false,
  "posted_at": null,
  "has_cv_at": null,
  "interview_started_at": null
}
```

| Key | Rule |
|-----|------|
| `cv_intake_allowed` | **Gate flag** — may be `true` **only** when status ∈ receivable set (`open_for_hire` \| legacy synonym `open` **after** classify + approve). Out_of_plan before BOD → **must** stay `false` (Y-S9). |
| `posted` / `has_cv` / `interview_started` | Operational MVP «mở tin» on YCTD — **DENY** requiring Campaign entity (VAL-13 · REC-03 OUT) |
| `open_for_hire` | **Status token** (CHK) — **FORBIDDEN** as second SoT boolean inside JSON that diverges from `status` |

> Mission phrase «pipeline_flags (open_for_hire / cv_intake_allowed)» = **semantic gates**: receivable = status `open_for_hire`; CV intake = `pipeline_flags_json.cv_intake_allowed` + app enforce. **Not** dual columns inventing Campaign.

### 4.4 Status tokens (CHK ALTER)

| Phase | Normative status | Note |
|-------|------------------|------|
| Draft | `draft` | RETAIN |
| Submitted | `pending_approval` | Y-S7 — **cấm** create→`open` bypass |
| Approved (bridge) | `approved` | May precede receivable if BOD outstanding |
| **Receivable** | **`open_for_hire`** | **O3 LOCK** · ADD to CHK |
| Legacy synonym | `open` | Filter synonym only until FE remaster — **≠** bypass gate for new writes |
| Rejected / cancelled / closed / on_hold | RETAIN | — |

**CHK target (expand):**

```text
status IN (
  'open', 'open_for_hire', 'closed', 'on_hold',
  'draft', 'pending_approval', 'approved', 'rejected', 'cancelled'
)
```

ensureSchema style: DROP CONSTRAINT `chk_job_requisitions_status` IF EXISTS → ADD expanded set (same pattern as `recruitment-workflow.bridge.ts`).

---

## 5. Constraints / indexes

### 5.1 CHECK constraints

| Name (hint) | Rule | Maps |
|-------------|------|------|
| **RETAIN** `chk_job_requisitions_headcount` | `headcount >= 1` | G-RC-01 |
| **RETAIN** `chk_job_requisitions_headcount_mode` | `NULL OR IN ('in_plan','out_of_plan')` | VAL-01 · O4 NULL allowed |
| **EXPAND** `chk_job_requisitions_status` | include `open_for_hire` | VAL-08/11 · O3 |
| **ADD** `chk_job_requisitions_hire_reason` | `hire_reason IS NULL OR hire_reason IN ('new','replace')` | VAL-05 |
| **ADD** `chk_job_requisitions_replace_emp` | `(hire_reason IS DISTINCT FROM 'replace') OR (replace_employee_id IS NOT NULL)` | VAL-06 |
| **ADD** `chk_job_requisitions_in_plan_cell` | `(headcount_mode IS DISTINCT FROM 'in_plan') OR (headcount_cell_id IS NOT NULL)` | VAL-02 · Y-S3 |
| **ADD** `chk_job_requisitions_out_reason` | `(headcount_mode IS DISTINCT FROM 'out_of_plan') OR (out_of_plan_reason IS NOT NULL AND length(btrim(out_of_plan_reason)) > 0)` | VAL-04 · Y-S5 — **OR** enforce at submit-only if draft must allow NULL reason until submit (**prefer app on draft; CHK on rows where status ≠ draft` via partial** — see note) |

**Draft vs submit CHK note:** Paper requires reason on submit. Physical preference GĐ1:

- Allow NULL `out_of_plan_reason` / `hire_reason` while `status='draft'` (app VAL on submit → 400).
- Optional **partial** CHK / deferred: enforce non-null when `status IN ('pending_approval','approved','open_for_hire','open')`.
- Document for API-01: submit path **must** set columns before status flip.

**O2 qty gate:** **App-layer 409** `HRM-YCTD-CELL-QTY` (BA token) — **no** silent DB rewrite to `out_of_plan`. CFG `force_out_of_plan` = **HOLD** (not MVP). **FORBIDDEN** trigger that auto-flips mode.

### 5.2 Unique / indexes

| Name (hint) | Rule | Maps |
|-------------|------|------|
| **RETAIN** `uq_job_requisitions_spawn_cell` | UNIQUE `(company_id, headcount_cell_id)` WHERE `headcount_mode='in_plan' AND headcount_cell_id IS NOT NULL` *(AND `archived_at IS NULL` if archived_at ADD)* | VAL-12 · BR-BP-HC-04 · Y-S11 |
| **RETAIN** `idx_job_requisitions_headcount_mode` | `(company_id, headcount_mode)` | list filter |
| **RETAIN** `idx_job_requisitions_recruitment_plan_id` | partial on plan_id | — |
| **RETAIN** `idx_job_requisitions_workflow_instance_id` | WF | — |
| **ADD** `idx_job_requisitions_hire_reason` | `(company_id, hire_reason)` optional | analytics |
| **ADD** `idx_job_requisitions_replace_employee_id` | `(replace_employee_id)` WHERE NOT NULL | soft lookup |
| **ADD** `idx_job_requisitions_approval_matrix_key` | `(company_id, approval_matrix_key)` WHERE NOT NULL | audit |
| **ADD** `idx_job_requisitions_archived_at` | `(company_id)` WHERE `archived_at IS NULL` if soft-delete ADD | list default |

**FORBIDDEN:** Second YCTD table UQ · hard FK `headcount_cell_id REFERENCES` into JSON · CASCADE plan→YCTD · hard DELETE.

---

## 6. O2 — vượt ô = 409 reject (data invariant)

| Rule | Stamp |
|------|--------|
| Condition | `headcount_mode=in_plan` AND requested `headcount` > remaining capacity of bound cell (`need_hire_approved`) |
| Persist | **Reject** — no INSERT/UPDATE that keeps `in_plan` over capacity |
| HTTP | **409** `HRM-YCTD-CELL-QTY` (seal exact in API-01) |
| Silent paths | **FORBIDDEN** — no default rewrite to `out_of_plan`; no warn-cho-qua |
| Replace | `hire_reason=replace` + đúng vị trí **may** stay `in_plan` if qty policy allows (BA ALT-02) — still **no** silent over-capacity |
| CFG HOLD | `force_out_of_plan=true` not MVP — when later unlocked: rewrite mode + require `out_of_plan_reason` **before** 2xx |

Maps: **VAL-REC-YCTD-03** · **AC-REC-YCTD-02-EX-03** · **AC-REC-YCTD-02b-ALT-02** · Y-S4 · O2.

---

## 7. O4 — Legacy NULL `headcount_mode` (classification + migration)

### 7.1 Classification

| Class | Predicate | Product behavior |
|-------|-----------|------------------|
| **LEGACY_UNCLASSIFIED** | `headcount_mode IS NULL` (typically `status=open` grandfather) | List/read **OK** + warn VI «cần phân loại trong/ngoài ĐB» |
| **CLASSIFIED_IN_PLAN** | `headcount_mode='in_plan'` + cell bind | Normal SHORT matrix path |
| **CLASSIFIED_OUT_OF_PLAN** | `headcount_mode='out_of_plan'` + reason | LONG + BOD gate |

### 7.2 Blocks until classified

| Action | While LEGACY_UNCLASSIFIED | Outcome |
|--------|---------------------------|---------|
| Attach CV / set `has_cv` / `cv_intake_allowed=true` | **BLOCK** | **409** `HRM-YCTD-MODE-UNCLASSIFIED` / `HRM-YCTD-NOT-RECEIVABLE` |
| Set `posted=true` | **BLOCK** | same |
| Promote receivable / treat as in_plan | **FORBIDDEN** | Silent in_plan = **FAIL O4** |
| Next PATCH/save | **Require** `headcount_mode` (+ cell **or** out_of_plan_reason) before 2xx | VAL-14 · AC-02b-ALT-04 |

### 7.3 Backfill / migration note (Dev-BE later — **no run this seat**)

1. **Do not** UPDATE all NULL → `in_plan` (invents false ĐB link).
2. Optional **report-only** query: count rows `headcount_mode IS NULL` by `company_id` / `status`.
3. Leave NULL until user classify on edit (BA O4 CONFIRMED).
4. After classify: apply VAL-01..06; spawn UQ still applies if user picks `in_plan`+cell already spawned → **409**.
5. Soft-delete only if retiring junk — **no** hard DELETE.

Maps: **VAL-REC-YCTD-14** · **AC-REC-YCTD-02b-ALT-04** · SA O4.

---

## 8. Lifecycle & receivable gate (physical)

| Transition | Persist | Forbidden |
|------------|---------|-----------|
| Create draft | `status=draft` · mode/hire may partial | create→`open` / `open_for_hire` |
| Submit | `pending_approval` + start XBOS + snapshot `approval_matrix_key` | skip WF / fake approve |
| Approve in_plan (SHORT complete) | → `open_for_hire` · may set `cv_intake_allowed=true` | LONG-only path (HC-05) |
| Approve out_of_plan without BOD | **stay** non-receivable | set posted/CV (**Y-S9**) |
| BOD approve out_of_plan | → `open_for_hire` · flags unlock | warn-cho-qua |
| Reject | `rejected` + `rejected_reason` · JD soft FK keep | receivable |
| Pipeline flags PATCH | only when receivable (or draft flags that do **not** open intake) | Campaign entity |

**Receivable set (normative):** `status IN ('open_for_hire')` for **new** writes; list filter may include legacy `open`\|`approved` synonym (**O3**).

---

## 9. Validation matrix — column ↔ VAL/AC (data layer)

| VAL-ID | Physical column / rule | Valid | Invalid → | AC primary |
|--------|------------------------|-------|-----------|------------|
| **VAL-01** | `headcount_mode` | `in_plan`\|`out_of_plan` on submit | Missing/other → **400** | EX-01 · Y-S2 |
| **VAL-02** | `headcount_cell_id` + cell lifecycle | NOT NULL · `need_hire_approved` · plan approved | Else **409** CELL-* | EX-02 · Y-S3 |
| **VAL-03** | `headcount` vs cell remaining | ≤ remaining; replace OK per policy | Vượt → **409** CELL-QTY · **no silent** | EX-03 · O2 · Y-S4 |
| **VAL-04** | `out_of_plan_reason` | Non-empty when out_of_plan submit | Missing → **400** | 02b-EX-01 · Y-S5 |
| **VAL-05** | `hire_reason` | `new`\|`replace` | Missing → **400** | EX-04 · Y-S6 |
| **VAL-06** | `replace_employee_id` | Required + in scope when replace | Missing/invalid → **400** | EX-04 · ALT-02 |
| **VAL-07** | `job_template_id` | Hiệu lực + scope when required | Ngừng/missing → **4xx** | EX-05/06 · Y-S12 |
| **VAL-08** | `status` on submit | → `pending_approval` | create→`open` = **FAIL** | 02c · Y-S7 |
| **VAL-09** | `approval_matrix_key` | SHORT in_plan / LONG out_of_plan | Wrong matrix = **FAIL** HC-05/06 | ALT-03 · 02b-03 · Y-S8/10 |
| **VAL-10** | BOD + flags | Receivable only after BOD out_of_plan | CV/posted early → **409** | 02b-04 · Y-S9 |
| **VAL-11** | Receivable token | Normative `open_for_hire` | Synonym `open` filter ≠ bypass | 02d · O3 |
| **VAL-12** | Spawn UQ | Manual ≠ second in_plan same cell | Duplicate → **409** | ALT-04 · Y-S11 |
| **VAL-13** | `pipeline_flags_json` | Flags on YCTD only | Require Campaign = **FAIL** | 02e · Y-S13 · REC-03 |
| **VAL-14** | NULL `headcount_mode` | Read+warn; mutate classify; block CV | Silent in_plan = **FAIL O4** | 02b-ALT-04 |
| **VAL-15** | `headcount_proposals` | Non-SoT; no dual-write | Dual persist = **FAIL O5** | 02b-ALT-03 |
| **VAL-16** | `company_id` scope | list=get=mutate=flags=transitions | Mismatch = **FAIL U19** | EX-08 |
| **VAL-17** | `rejected_reason` | Required on reject | Missing → **4xx** | ALT-01 · 02b-ALT-01 |
| **VAL-18** | Evidence path | FE-only | Seed/API fake = **FAIL U65** | EX-09 · 02b-EX-07 |

### Error codes (mint for API-01)

| Code | HTTP | When |
|------|------|------|
| `HRM-YCTD-MODE-REQUIRED` | 400 | VAL-01 |
| `HRM-YCTD-CELL-*` | 409 | VAL-02 cell gate |
| `HRM-YCTD-CELL-QTY` | 409 | VAL-03 / O2 |
| `HRM-YCTD-OUT-REASON` | 400 | VAL-04 |
| `HRM-YCTD-HIRE-REASON` | 400 | VAL-05/06 |
| `HRM-YCTD-JD-*` | 4xx | VAL-07 |
| `HRM-YCTD-BOD-REQUIRED` | 409 | VAL-10 |
| `HRM-YCTD-NOT-RECEIVABLE` | 409 | VAL-10/11/14 |
| `HRM-YCTD-MODE-UNCLASSIFIED` | 409 | VAL-14 CV block |
| `HRM-YCTD-SPAWN-DUP` / UQ | 409 | VAL-12 |
| Scope | 403/409 | VAL-16 U19 |

---

## 10. Explicitly **FORBIDDEN** this seat

| Item | Reason |
|------|--------|
| CREATE `rec_recruitment_request` physical table | Dual SoT vs Option A / O1 |
| Nest greenfield `/api/hrm/rec/recruitment-requests` dual path | O1 / Y-S1 |
| Soften O2 to silent stay in_plan | BA O2 |
| Auto-backfill NULL mode → `in_plan` | O4 |
| REC-03 Campaign as SoT «mở tin» | Y-S13 |
| Dual-write `headcount_proposals` as YCTD | O5 |
| Hard DELETE YCTD / hard FK into JSON cell | soft-delete + soft resolve |
| Flip `recruitment_uat_ready` / product_go | Honesty / C-SLICE |
| Seed for evidence | U65 |
| Contradict REC-01 cell_id / spawn UQ | sealed spine |
| Wipe JD soft FK / UF-HRM-12🟢 / J-HRM-JD-YCTD-01 / J-REC-WF-* | must_keep |

---

## 11. Traceability

| Requirement | DB physical | API (next) | FE / Journey |
|-------------|-------------|------------|--------------|
| FR-UC-BP-REC-02 · AC-02* | §4–§5 · §8 in_plan | F-REC-YCTD-01/03 | **J-HRM-REC-YCTD-02** · UF-HRM-REC-YCTD-02 DRAFT |
| FR-UC-BP-REC-02b · AC-02b* | §4 out reason · §8 BOD gate | F-REC-YCTD-02/03/04 | **J-HRM-REC-YCTD-02b** |
| O1 physical prefer | §2 alias | `/recruitment/requisitions*` | — |
| O2 409 | §6 | CELL-QTY | EX-03 |
| O3 open_for_hire | §4.4 CHK | transitions | 02d |
| O4 legacy | §7 | classify + CV block | 02b-ALT-04 |
| O5 proposals | §10 DENY dual | CTA only | 02b-ALT-03 |
| BR-BP-HC-04 spawn | §4.1 UQ RETAIN | spawn peer | ALT-04 |
| BR-BP-HC-05/06 | `approval_matrix_key` + mode | XBOS conditions | VAL-09 |
| JD soft FK | `job_template_id` RETAIN | F-YCTD-JD-* | J-HRM-JD-YCTD-01 must_keep |
| scope_parity U19 | `company_id` TEXT | list=get=mutate=flags | VAL-16 · EX-08 |
| Paper §2.3 | **alias** → this file | — | DENY dual physical |

---

## 12. DOC-DELTA — client `DB_DESIGN_HRM_ENTERPRISE.md`

| Action | Content |
|--------|---------|
| **EXPAND §2.3** | Stamp Wave-2: physical `job_requisitions` **ADD** `hire_reason` · `replace_employee_id` · `out_of_plan_reason` · `approval_matrix_key` · `pipeline_flags_json` · status `open_for_hire` · O4 NULL mode policy · O2 409 · **DENY** dual `rec_*` table |
| **Registry** | DOC-DELTA CONFIRMED `PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01` |
| **RETAIN** | REC-01 §2.3 cell/mode/target_month/UQ notes — **no wipe** |
| **FORBIDDEN** | Wipe §2.3–§2.8 · invent REC-03 · claim paper table live as second Nest SoT |

**Team SoT primary:** this file.

---

## 13. Migration notes (Dev-BE later — ADD-only ensureSchema)

1. `ALTER TABLE public.job_requisitions ADD COLUMN IF NOT EXISTS` for §4.2 columns.
2. Expand `chk_job_requisitions_status` to include `open_for_hire` (DROP/ADD pattern).
3. ADD hire_reason / replace_emp / in_plan_cell CHKs (§5.1); out_reason prefer submit-app or partial CHK.
4. Default `pipeline_flags_json` to `{}` for new rows; do **not** backfill `cv_intake_allowed=true` on legacy `open`.
5. **O4:** leave `headcount_mode` NULL; report counts only.
6. If ADD `archived_at`: extend spawn UQ predicate `AND archived_at IS NULL`.
7. **No** seed · **No** hard DELETE · feature-flag gates off = emergency rollback (prefer forward-fix).
8. Spawn path RETAIN — do not change cell_id mint rules from REC-01/CELLID.

---

## 14. Residual

| ID | Item | Owner |
|----|------|-------|
| R-REC-02-API | F.1 physical YCTD-01..04 + DTO↔column + error tokens | **`PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01`** · **sa** |
| R-REC-02-BE | ensureSchema + create/submit gates + BOD receivable + O2/O4 + spawn regression | **dev-be** after API |
| R-REC-02-FE | Form forks in/out · classify banner · block CV UI · F5 | **dev-fe** |
| R-REC-02-QA | Browser J-HRM-REC-YCTD-02/02b U65 | **qa** |
| R-REC-03 | Campaign | **DENY** |
| R-REC-HC-OVERRIDE-CELLID | Peer cell_id reuse | Orthogonal — do not reopen SoT here |

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
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-data-01.md` |
| **next_owner** | **sa** (`PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01`) |
| **completion_report** | CONFIRMED Option A physical UPGRADE `job_requisitions`: ADD hire_reason/replace_employee_id/out_of_plan_reason/approval_matrix_key/pipeline_flags_json + open_for_hire CHK; RETAIN REC-01 mode/cell/target_month/spawn UQ/JD/WF; O2 409 no silent; O4 LEGACY_UNCLASSIFIED block CV; DENY dual rec_* table · Nest /rec dual · REC-03 · seed · honesty flip. |

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-02 · UC-BP-REC-02b
depends_on: DATA-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md · BA-01 O1–O5 · SA-01 Option A

MISSION: TechSpec/API F.1 DOC-DELTA on PHYSICAL Option A paths (not paper-only).
Lock DTO↔column for /api/hrm/recruitment/requisitions* (F-REC-YCTD-01..04):
create/submit in_plan + out_of_plan; transitions → open_for_hire; PATCH pipeline-flags;
error tokens HRM-YCTD-*; O2 409 CELL-QTY; O4 unclassified CV block; XBOS matrix conditions
(mode + hire_reason); scope_parity U19 list=get=mutate=flags=transitions.
Cite DATA-01 physical SoT. Paper /rec/recruitment-requests* = alias only.

READ FIRST:
1. docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md (CONFIRMED)
2. docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md §8 Y-S1..Y-S13
3. docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md AC/VAL
4. docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-data-01.md
5. API_DESIGN_HRM_ENTERPRISE.md F-REC-YCTD-* (logical alias only)

DELIVER:
- docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md
- docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-api-01.md
must_keep: Option A · REC-01 spawn/cell · JD soft FK · hrm_requisition_approval · REC-03 OUT · honesty false · U65 · DENY dual rec_* / Nest /rec dual
EXIT: PASS_TO_PM CONFIRMED · next_owner pm → unlock dev-be/fe after API CONFIRMED
```