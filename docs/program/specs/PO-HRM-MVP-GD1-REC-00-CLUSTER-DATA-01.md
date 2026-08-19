# PO-HRM-MVP-GD1-REC-00-CLUSTER-DATA-01 — Physical DB · JD master status (Option A · O2)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-5 seat **#7**) |
| **lane** | governance · ba-data |
| **change_mode** | **UPGRADE / EXPAND** AS-IS `job_description_templates` · **DOC-DELTA only** · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — physical O2 `status` + `is_active` bridge + backfill · SA Option A · BA O1–O7 |
| **uc_ids** | `UC-BP-REC-00` *(00a/00b/00c = CFG peers RETAIN — **no** redefine)* |
| **depends_on** | BA-01 O1–O7 **CONFIRMED** · SA-01 Option **A LOCKED** · YCTD-REF soft FK **RETAIN** · JD-DYNAMIC DATA/ARCH Option A **RETAIN** |
| **ref_sa** | [`PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md) · **O2** · AC-REC-JD-00-* · VAL-REC-JD-* |
| **ref_yctd_db** | [`PO-HRM-JD-YCTD-REF-DB-01.md`](./PO-HRM-JD-YCTD-REF-DB-01.md) · **DV-YCTD-JD-*** |
| **ref_jd_dyn** | [`PO-HRM-JD-DYNAMIC-DATA-01.md`](./PO-HRM-JD-DYNAMIC-DATA-01.md) · [`PO-HRM-JD-DYNAMIC-ARCH-02.md`](./PO-HRM-JD-DYNAMIC-ARCH-02.md) §3.4 |
| **ref_paper_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) **§2.1** `rec_job_description` = **logical alias** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-00** · **BR-BP-JD-01** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| SoT JD master | **UPGRADE** AS-IS `public.job_description_templates` **only** |
| Paper name | `rec_job_description` = **logical alias only** (DENY physical CREATE) |
| Dual physical | **DENY** second JD table · Nest `/rec/job-descriptions` dual SoT · `job_postings` as JD master |
| **O2 status** | **ADD** `status` `draft` \| `active` \| `retired` + **CHK** |
| **Bridge** | `active` ⇒ `is_active=true`; `draft` \| `retired` ⇒ `is_active=false` (**RETAIN** column `is_active`) |
| **Backfill** | `is_active=true` → `active`; `is_active=false` + YCTD soft-FK history → `retired`; else → `draft` |
| Soft FK YCTD | **RETAIN** `job_requisitions.job_template_id` · **DV-YCTD-JD-*** · **no CASCADE** |
| Code UQ | **RETAIN** `uq_job_description_templates_company_code` `(company_id, code)` |
| Dynamic spine | **RETAIN** `values_json` · `layout_snapshot_json` · `layout_version` · `rec_jd_*` peers |
| Nest path | Physical prefer `/api/hrm/recruitment/job-templates*` — API seat (not this DOC) |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen W1–W4 |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical AS-IS (Option A) | Action |
|-----------------|---------------------------|--------|
| `rec_job_description` | `public.job_description_templates` | **LIVE — UPGRADE** ADD `status` |
| `status` draft\|active\|retired | **ADD** `job_description_templates.status` | **NEW** (gap vs boolean-only) |
| (bridge) Hiệu lực | `is_active=true` ∧ `status='active'` | **RETAIN** `is_active` + sync rule |
| `job_description_id` (YCTD) | `job_requisitions.job_template_id` | **RETAIN** soft FK |
| `/api/hrm/rec/job-descriptions*` | `/api/hrm/recruitment/job-templates*` | **Alias only** — **DENY** dual Nest SoT |
| CFG field/layout | `rec_jd_field_def` · `rec_jd_form_layout*` | **RETAIN** peer (O6) |

```text
  rec_jd_field_def / rec_jd_form_layout(+items)   ◄── CFG peers RETAIN (00a/00b/00c)
                │
                ▼
  job_description_templates  ◄── Sole JD master SoT
        RETAIN: id · company_id · code UQ · title · position_* ·
                job_description · requirements · notes ·
                is_active · values_json · layout_snapshot_json · layout_version · timestamps
        ADD:    status TEXT NOT NULL  CHECK IN ('draft','active','retired')
        BRIDGE: status ↔ is_active (see §4)
                │
                │ soft FK (NO hard REFERENCES · NO CASCADE)
                ▼
  job_requisitions.job_template_id   ◄── YCTD-REF must_keep (DV-YCTD-JD-*)
```

**Label lock:** «Thư viện mô tả công việc» / paper `rec_job_description` / F-REC-JD-01 = **same** physical `job_description_templates`.

---

## 3. AS-IS baseline (Nest facts — read-only)

| Object | AS-IS | Gap (Wave-5 O2) |
|--------|-------|-----------------|
| Table | `CREATE TABLE IF NOT EXISTS public.job_description_templates` | — |
| Core cols | `id UUID PK`, `company_id TEXT NOT NULL`, `code TEXT NOT NULL`, `title TEXT NOT NULL`, `position_name`, `job_description`, `requirements`, `notes`, timestamps | — |
| UQ | `uq_job_description_templates_company_code UNIQUE (company_id, code)` | **RETAIN** (O4) |
| Status | `is_active BOOLEAN NOT NULL DEFAULT TRUE` only | **Nháp ≠ Ngừng undifferentiated** — **FAIL O2** without `status` |
| Position | `position_code TEXT` | **RETAIN** · assert ∈ job_titles (`HRM-REC-JD-POS`) |
| Dynamic | `values_json` · `layout_snapshot_json` · `layout_version` | **RETAIN** JD-DYNAMIC |
| Bindable list | `WHERE is_active = TRUE` | After upgrade: prefer `status='active'` (+ bridge keep `is_active=TRUE`) |
| Create path | Often `is_active !== false` → **true** | Must default **`draft` / `is_active=false`** (AC-REC-JD-00-P04) |
| Soft FK | `job_requisitions.job_template_id` TEXT soft | **RETAIN** · no CASCADE |
| Source | `recruitment-catalog.service.ts` ensureWave2Schema · list/create/patch | Dev after API CONFIRMED |
| Paper §2.1 | Already lists `status` draft\|active\|retired | Physical catch-up **this DOC** |

**FORBIDDEN invent this seat:** `CREATE TABLE rec_job_description` · Nest dual `/rec` SoT · dual-write master to `job_postings` · hard DELETE · seed templates for U65.

---

## 4. EXPAND — `public.job_description_templates` (O2)

### 4.1 Columns **RETAIN** (must_keep — do not drop/rename)

| Cột | Kiểu | Rule |
|-----|------|------|
| `id` | uuid PK | Soft target of `job_template_id` |
| `company_id` | text NOT NULL | U19 `resolveHrmListScope` — list=get=mutate |
| `code` | text NOT NULL | UQ with `company_id` · case-insensitive app check RETAIN |
| `title` | text NOT NULL | Title-first (JD-DYNAMIC) |
| `position_name` / `position_code` | text NULL | Soft catalog · `HRM-REC-JD-POS` |
| `job_description` / `requirements` / `notes` | text NULL | Flat bridge + YCTD snapshot source |
| **`is_active`** | boolean NOT NULL | **RETAIN** — **bridge slave** to `status` (not sole SoT after upgrade) |
| `values_json` | jsonb NULL | Dynamic values |
| `layout_snapshot_json` | jsonb NULL | Q6 render SoT |
| `layout_version` | int NOT NULL DEFAULT 1 | Snapshot shape |
| `created_at` / `updated_at` | timestamptz | — |

### 4.2 Column **ADD**

| Cột | Kiểu | Null | Default (new rows) | Ý nghĩa | Maps |
|-----|------|------|--------------------|----------|------|
| **`status`** | text | **NO** (after backfill) | **`draft`** | Nháp / Hiệu lực / Ngừng | BA O2 · AC-REC-JD-00-* · VAL-REC-JD-05/06/08 · BR-BP-JD-01 |

**UI dictionary (normative):**

| UI (VI) | `status` | `is_active` bridge | Bindable YCTD mới? |
|---------|----------|--------------------|--------------------|
| **Nháp** | `draft` | `false` | **No** |
| **Hiệu lực** | `active` | `true` | **Yes** |
| **Ngừng** | `retired` | `false` | **No** (`HRM-JD-YCTD-STATUS`) · history OK |

### 4.3 Bridge invariant (normative — app + optional CHK)

| Rule ID | Predicate | Outcome if violated |
|---------|-----------|---------------------|
| **BR-JD-BRIDGE-01** | `status = 'active'` ⇒ `is_active = TRUE` | **FAIL** VAL-REC-JD-08 · reject write |
| **BR-JD-BRIDGE-02** | `status IN ('draft','retired')` ⇒ `is_active = FALSE` | **FAIL** VAL-REC-JD-08 |
| **BR-JD-BRIDGE-03** | Mutate path always sets **both** columns in one transaction | Partial update = **FAIL** |
| **BR-JD-BINDABLE-01** | Bindable set = `status = 'active'` ∧ `is_active = TRUE` ∧ in scope | Drift either side → exclude from picker |

**YCTD-REF compat:** During/after migrate, keep filter `is_active = TRUE` **equivalent** to Hiệu lực **only if** bridge held. Prefer filter `status = 'active'` in API seat (F.1) while **RETAIN** `is_active` predicate for sealed F-YCTD-JD until dual-assert period ends.

### 4.4 CHECK constraints

| Name (hint) | Rule | Maps |
|-------------|------|------|
| **ADD** `chk_job_description_templates_status` | `status IN ('draft','active','retired')` | VAL-REC-JD-05 · O2 |
| **ADD** `chk_job_description_templates_status_active_bridge` | `(status = 'active' AND is_active IS TRUE) OR (status IN ('draft','retired') AND is_active IS FALSE)` | VAL-REC-JD-08 · BR-JD-BRIDGE-* |

ensureSchema style (Dev later — **not run this seat**):

```text
ALTER TABLE public.job_description_templates
  ADD COLUMN IF NOT EXISTS status TEXT;
-- backfill §5 then:
ALTER TABLE public.job_description_templates
  ALTER COLUMN status SET DEFAULT 'draft',
  ALTER COLUMN status SET NOT NULL;
ALTER TABLE ... DROP CONSTRAINT IF EXISTS chk_job_description_templates_status;
ALTER TABLE ... ADD CONSTRAINT chk_job_description_templates_status
  CHECK (status IN ('draft','active','retired'));
ALTER TABLE ... ADD CONSTRAINT chk_job_description_templates_status_active_bridge
  CHECK (
    (status = 'active' AND is_active IS TRUE)
    OR (status IN ('draft','retired') AND is_active IS FALSE)
  );
```

**Optional (non-blocking):** change column default `is_active` from `TRUE` → `FALSE` to match create-Nháp — **or** leave DEFAULT and **require** INSERT explicit `is_active=false` when `status='draft'` (prefer explicit INSERT both).

### 4.5 Unique / indexes

| Name | Rule | Maps |
|------|------|------|
| **RETAIN** `uq_job_description_templates_company_code` | UNIQUE `(company_id, code)` — **all** non-deleted rows (AS-IS; retired still occupies code) | O4 · AC-REC-JD-00-P05 · 409 |
| **ADD** `idx_job_description_templates_company_status` | `(company_id, status)` | Library filter Nháp/Hiệu lực/Ngừng |
| **ADD** `idx_job_description_templates_bindable` | partial `(company_id)` WHERE `status = 'active' AND is_active IS TRUE` | YCTD picker |

**FORBIDDEN:** Second UQ table · hard FK `job_template_id REFERENCES job_description_templates` with CASCADE · hard DELETE product path.

---

## 5. Backfill rule (legacy `is_active` → `status`)

> BA open note closed here: *«prefer `retired` if ever bindable-historical else `draft`»* — **no FE invent**.

### 5.1 Classification

| Class | Predicate (pre-upgrade) | Assigned `status` | Set `is_active` |
|-------|-------------------------|-------------------|-----------------|
| **LEGACY_ACTIVE** | `is_active IS TRUE` | **`active`** | keep `TRUE` |
| **LEGACY_RETIRED_HIST** | `is_active IS FALSE` **AND** EXISTS ≥1 `job_requisitions` row with `job_template_id = templates.id::text` (any status YCTD) | **`retired`** | keep `FALSE` |
| **LEGACY_DRAFT_OR_UNUSED** | `is_active IS FALSE` **AND** NO YCTD soft-FK reference | **`draft`** | keep `FALSE` |

**Rationale:** Boolean false collapsed Nháp + Ngừng. Rows already referenced by YCTD were historically selectable as Hiệu lực → treat as **Ngừng** so history + STATUS gate stay coherent (**DV-YCTD-JD-13** · AC-REC-JD-00-05). Unused inactive rows stay **Nháp** (safe default; HR may publish later).

### 5.2 Ordered steps (Dev-BE migrate later — **no run this seat**)

1. `ADD COLUMN status TEXT NULL` (nullable until backfill).
2. `UPDATE … SET status = 'active' WHERE is_active IS TRUE`.
3. `UPDATE … SET status = 'retired' WHERE is_active IS FALSE AND EXISTS (SELECT 1 FROM job_requisitions r WHERE r.job_template_id = job_description_templates.id::text)`.
4. `UPDATE … SET status = 'draft' WHERE status IS NULL` (remainder `is_active=false`).
5. Assert bridge: zero rows violating BR-JD-BRIDGE-01/02.
6. `SET NOT NULL` + DEFAULT `'draft'` + ADD CHKs §4.4.
7. **FORBIDDEN:** mass-set all false → `active`; mass-set all false → `draft` without YCTD EXISTS check; invent FE labels without column.

### 5.3 Post-backfill bindable semantics (RETAIN DV-YCTD-JD-*)

| Logical | Physical after upgrade | Bind new YCTD? | History |
|---------|------------------------|----------------|---------|
| Nháp | `status='draft'` | **No** → `HRM-JD-YCTD-STATUS` | N/A |
| Hiệu lực | `status='active'` | **Yes** | Yes |
| Ngừng | `status='retired'` | **No** → `HRM-JD-YCTD-STATUS` | Soft FK + snapshot **unchanged** · **no CASCADE** |

Maps: **DV-YCTD-JD-12/13/14** · **BR-BP-JD-01** · **AC-REC-JD-00-04/05** · **VAL-REC-JD-09/10/11**.

---

## 6. Lifecycle (physical transitions)

| From → To | Persist | Forbidden |
|-----------|---------|-----------|
| (create) → `draft` | INSERT `status='draft'`, `is_active=false` | Auto-`active` without publish (**P04**) |
| `draft` → `active` | Publish — app required-on-layout gate (**O3** — API seat) | Publish with empty/missing required → still draft |
| `active` → `retired` | Soft Ngừng · YCTD FK intact | Hard DELETE / NULL FK forced |
| `retired` → `active` | **HOLD** MVP (Q-REC-JD-REACTIVE) — API may DENY or require re-publish gate | Silent reactivate without O3 |
| Any → hard DELETE | **FORBIDDEN** | Soft-retire only |

Publish required-on-layout is **app/API** (reads `rec_jd_*` + `values_json`) — **not** a DB trigger in GĐ1.

---

## 7. Validation matrix — column ↔ VAL/AC (data layer)

| VAL / DV | Physical rule | Valid | Invalid → |
|----------|---------------|-------|-----------|
| **VAL-REC-JD-05** | `status` ∈ {draft,active,retired} | CHK + app | Unknown → **400** |
| **VAL-REC-JD-06** | Create default `draft` | INSERT | Auto-active → **FAIL P04** |
| **VAL-REC-JD-08** | Bridge status↔is_active | CHK + app | Drift → **FAIL** / reject write |
| **VAL-REC-JD-09** | Bindable = active only | Query filter | Nháp/Ngừng in picker → **FAIL O5** |
| **VAL-REC-JD-10** | Bind non-active | Reject | **400** `HRM-JD-YCTD-STATUS` |
| **VAL-REC-JD-11** | Soft-retire | `retired` + FK intact | Hard DELETE / CASCADE → **FAIL** |
| **VAL-REC-JD-02/O4** | Code UQ `(company_id,code)` | RETAIN | Dup → **409** |
| **VAL-REC-JD-12** | Physical table/path | `job_description_templates` | Dual Nest `/rec` SoT → **FAIL O1** |
| **VAL-REC-JD-13** | One JD table | Sole SoT | `rec_job_description` physical → **FAIL** |
| **VAL-REC-JD-14** | `job_postings` | Not master | Dual-write master → **FAIL** |
| **VAL-REC-JD-15** | U19 list=get=mutate | Same scope | Mismatch → **FAIL** |
| **DV-YCTD-JD-01..17** | Soft FK + snapshot + STATUS | **RETAIN** | Dual FK / postings / CASCADE → **FAIL** |
| **VAL-REC-JD-17** | U65 | FE-only evidence | Seed = **FAIL** |
| **VAL-REC-JD-18** | Honesty | flags false | Flip = **FAIL O7** |

### Error codes (mint / seal in API-01 — pointer)

| Code | HTTP | When |
|------|------|------|
| `HRM-JD-YCTD-STATUS` | 400 | Bind draft/retired (**RETAIN**) |
| `HRM-JD-YCTD-REQUIRED` / `NOT-FOUND` | 400/404 | **RETAIN** YCTD-REF |
| `HRM-REC-JD-POS` | 400 | Invent `position_code` |
| **409** code conflict | 409 | UQ `(company_id, code)` |
| `HRM-JD-*` / `HRM-REC-JD-PUB-*` | 4xx | Publish required-on-layout (**O3** — API mint) |
| Scope | 404/409 | U19 |

---

## 8. Traceability — requirement → DB → API → FE → Test

| Requirement | DB (this DOC) | API (next) | FE / Journey | Test evidence |
|-------------|---------------|------------|--------------|---------------|
| **FR-UC-BP-REC-00** · Diễn biến #1–#3 | `status` + bridge | F-JD-01..04 DTO `status` | Thư viện chips Nháp/Hiệu lực/Ngừng | J-HRM-REC-JD-00-01..04 DRAFT |
| **BR-BP-JD-01** | Bindable = `active` | STATUS gate | YCTD picker | **J-HRM-JD-YCTD-01** PASS RETAIN |
| **O2** BA | ADD `status` CHK + backfill | Display-ready status | **FAIL** boolean-only UI (EX-12) | AC-REC-JD-00-P03/P04 |
| **O3** Publish | Transition draft→active | PUB 4xx codes | Phát hành | AC-REC-JD-00-P01/P02 |
| **O4** Code UQ | RETAIN UQ | 409 | Toast mã trùng | AC-REC-JD-00-P05 |
| **O5** YCTD | Soft FK RETAIN | F-YCTD-JD-* | History vs picker | DV-YCTD-JD-* |
| **O6** Peers | `rec_jd_*` RETAIN | No redefine | Cite layout only | L3 GWC ≠ FR-00 DONE |
| **O1** Path | One table | Physical `/job-templates*` | Network assert | EX-02 |
| Paper §2.1 | Alias map | Alias F-REC-JD-01 | — | DENY dual |

**scope_parity (U19):** list templates = get-by-id = create/patch/publish/retire = bindable list — **same** `company_id` / `resolveHrmListScope` (cite SA must_keep · F-JD-03).

---

## 9. Honesty & must_keep / DENY

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| C-SLICE | DATA CONFIRMED ≠ module REC UAT ≠ Phase1 DONE |
| must_keep W1–W4 | REC-01/02/08/06a seals |
| must_keep | Soft FK · DV-YCTD-JD-* · F-YCTD-JD · `values_json`/snapshot · `rec_jd_*` · code UQ · U19 · soft-retire |
| **DENY** | Second JD table · Nest `/rec` dual · `job_postings` SoT · seed · honesty flip · reopen W1–W4 · `apps/**` this seat · boolean-only MVP after this DOC |

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED** |
| **next_owner** | **sa** — API F.1 residual publish/status DTO |
| **Does not unlock** | Dev `apps/**` until API CONFIRMED · honesty flips · REC-03 · Nest dual |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-data-01.md` |

### Assumptions

- BA O2 CONFIRMED ADD `status` (not boolean-only).
- YCTD-REF + JD-DYNAMIC Option A RETAIN.
- Paper `rec_job_description.status` already normative — physical catch-up only.

### Open / non-blocking

| ID | Note |
|----|------|
| Q-REC-JD-REACTIVE | `retired`→`active` — MVP **HOLD**; API seat may DENY |
| `is_active` DEFAULT TRUE on column | Prefer explicit INSERT pair; optional DEFAULT FALSE later |
| Partial UQ exclude retired | **OUT** GĐ1 — RETAIN full `(company_id, code)` AS-IS |

---

## completion_report

- **Closed:** DOC-DELTA physical on `job_description_templates` only — ADD `status` draft\|active\|retired + CHK + bridge CHK; `is_active` bridge rules; backfill LEGACY_ACTIVE / LEGACY_RETIRED_HIST / LEGACY_DRAFT_OR_UNUSED; RETAIN soft FK · code UQ · values/layout · `rec_jd_*`; DENY second JD table · Nest dual · postings SoT · seed · honesty flip · reopen W1–W4 · apps/**.
- **Residual:** **sa** API F.1 — F-JD-01..04 DTO `status` + publish transition + PUB error mint + bindable filter prefer `status='active'` while bridge held; then Dev after contracts; QA U65.
- **O2 stamp:** Explicit 3-state column **CONFIRMED** — boolean-only MVP **REJECTED**.
