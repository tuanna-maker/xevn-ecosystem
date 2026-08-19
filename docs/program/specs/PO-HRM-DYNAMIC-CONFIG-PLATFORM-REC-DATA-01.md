# PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01 — Physical DB · REC pipeline stage catalog

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01` |
| **resume_chunk** | K6.2b |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** `rec_pipeline_stage` · **EXPAND** `rec_candidate_application.stage` / history note · **DOC-DELTA** DB_DESIGN · **NO CODE** `apps/**` · **no migrate** · **no seed** · **no wipe** `rec_jd_*` / IV / hire / YCTD |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — physical ADD per SA REC vertical §2.1 |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md) §2 · F-REC-CAT-STG-* · F-REC-CAT-EFF-01 |
| **ref_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) `ICatalogRow` · R-PLT-DATA-04 · JD adapter (**must_keep**) |
| **ref_pattern** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md) (open catalog · soft-delete · VAL matrix) |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · §7 REC |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §2.4a ADD · §2.5–2.6 EXPAND |
| **ref_srs** | FR-UC-BP-REC-05 / 05a / 06 / 06a / 07 · REC-03 **OUT** |
| **Honesty** | `recruitment_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE · U65 |
| **must_keep** | JD DnD / `rec_jd_*` · IV one-active · hire→EMP · YCTD↔JD · soft-delete · scope TEXT slug · history append-only |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical table | **CONFIRMED ADD** `public.rec_pipeline_stage` — **ABSENT AS-IS** Nest / platform DATA-01 (JD adapter only) |
| Platform pattern | Option B **`ICatalogRow`** on domain table — **not** mega-EAV |
| Open catalog | **`stage_key`** format-only CHK — **FORBIDDEN** closed enum CHECK of starter six |
| Dual SoT GĐ1 | **HRM tenant writer** = SoT · XBOS WF task codes = **ops map** via optional `wf_task_type_key` — **≠** second catalog · **no** XBOS `settings-catalogs` stages partition required GĐ1 (**L-REC-CAT-02**) |
| Consumer | AS-IS `rec_candidate_application.stage` stays **text** storing `stage_key` — **EXPAND** validate ∈ effective when catalog >0 |
| JD / IV / hire / YCTD | **must_keep** — **FORBIDDEN** wipe / re-physicalize this seat |
| Dev this seat | **NO** `apps/**` · **NO** migrate · **NO** seed UF |
| Closes | **R-PLT-DATA-04** REC pipeline-stage slice (JD already adapter-noted in DATA-01) |

---

## 2. ADD `public.rec_pipeline_stage`

### 2.1 Columns

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug (JWT operating) |
| `stage_key` | text | NO | | Open catalog code — consumer soft key |
| `name_vi` | text | NO | | UI label (kanban / picker / badge) |
| `sort_order` | int | NO | 100 | Kanban / picker order |
| `is_terminal` | boolean | NO | false | Terminal lane (hide from “advance” defaults) |
| `is_hired_outcome` | boolean | NO | false | Hire spine target — at most **one** active per company |
| `is_reject_outcome` | boolean | NO | false | Reject / fail CV class |
| `allows_interview_schedule` | boolean | NO | true | Gate IV schedule soft warn |
| `wf_task_type_key` | text | YES | NULL | Optional XBOS WF ops map (`rec_screening`…) — **not** SoT |
| `color_token` | text | YES | NULL | Optional UI chip — Precision Motion token name |
| `metadata_json` | jsonb | YES | NULL | Optional — **not** replace typed flags |
| `status` | text | NO | `'active'` | active \| retired |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

### 2.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` |
| **UQ active** | `(company_id, lower(stage_key)) WHERE archived_at IS NULL` |
| **UQ hired outcome** | At most one `(company_id)` WHERE `is_hired_outcome = true AND archived_at IS NULL` |
| **IX** | `(company_id, status)` · `(company_id, sort_order)` |
| **CHK key format** | `stage_key ~ '^[a-z][a-z0-9_]*$'` — **format only** |
| **CHK status** | `status IN ('active','retired')` |
| **CHK flags** | `is_hired_outcome = true` ⇒ `is_terminal = true`; **FORBIDDEN** `is_hired_outcome AND is_reject_outcome` both true |
| **FORBIDDEN** | `CHECK (stage_key IN ('screening','interview','offer','hired','rejected','withdrawn'))` · hard-delete |

### 2.3 Bootstrap starter keys (docs only — Dev ensure later)

Starter keys (`screening`, `interview`, `offer`, `hired`, `rejected`, `withdrawn`) = **bootstrap examples** when ensure upserts — **not** product ceiling · **not** UF evidence (U65 · **BR-PLT-05**).

| Starter `stage_key` | Suggested flags (ensure blueprint) |
|---------------------|-------------------------------------|
| `screening` | non-terminal · `allows_interview_schedule=false` (or true — product choice at ensure) |
| `interview` | `allows_interview_schedule=true` |
| `offer` | near-terminal optional |
| `hired` | `is_hired_outcome=true` · `is_terminal=true` |
| `rejected` | `is_reject_outcome=true` · `is_terminal=true` |
| `withdrawn` | `is_terminal=true` |

### 2.4 `ICatalogRow` binding

| Logical (`ICatalogRow`) | Physical |
|-------------------------|----------|
| `code` | `stage_key` |
| `label_vi` | `name_vi` |
| `status` | `status` + `archived_at` |
| `scope_company_id` | `company_id` |
| `meta` | typed flags + `sort_order` + optional `wf_task_type_key` / `color_token` / `metadata_json` |
| `catalog_kind` | `rec_pipeline_stage` (adapter constant) |

**FORBIDDEN GĐ1:** Mega `hrm_catalog_rows` EAV for stages (ADR Q-PLT-03).

### 2.5 Dual SoT / ops map (read model)

```text
  Settings REC CFG ──► rec_pipeline_stage CRUD (tenant writer = SoT)
                           │
                           ▼
              F-REC-CAT-EFF-01 effective active rows
              (+ future group REF if XBOS publishes — tenant wins on key)
                           │
              F-REC-APP-02 · kanban · hire · IV gate
                           │
  XBOS WF task codes ──► ops map → stage_key (optional wf_task_type_key)
                           │
  rec_jd_* FormSchema ──► SEPARATE vertical (must_keep DnD) — not this table
```

| Rule | Detail |
|------|--------|
| Writer | Only **`rec_pipeline_stage`** for tenant mutate |
| WF codes | Ops map only — **≠** second catalog master (**BR-PLT-06** class / **L-REC-CAT-02**) |
| Group REF | **Not required GĐ1** — reserved `include_group_ref` no-op until XBOS partition exists |
| Consumer | When effective catalog **>0**: `to_stage` / create stage **must** ∈ catalog (**BR-PLT-02**) |
| Empty | `[]` = valid 200 — no fake starter in U65 |
| Collision (future REF) | Same key: tenant native overrides REF label/flags |

---

## 3. EXPAND consumer columns (no rename · no wipe)

### 3.1 `rec_candidate_application.stage`

| Meta | Stamp |
|------|--------|
| Physical | **LIVE AS-IS** text — stores `stage_key` |
| Action | **EXPAND DOC note only** — after catalog >0, mutate values **must** resolve to effective (active) catalog; display of historical/retired keys **allowed** |
| FORBIDDEN | Closed `CHECK (stage IN (6))` on application · rename column · dual enum |

### 3.2 `rec_candidate_stage_history`

| Column | Rule |
|--------|------|
| `from_stage` / `to_stage` | Append-only text keys — **may** reference **retired** keys (**BR-PLT-04**) |
| Soft-delete catalog | Retire stage **must_keep** history rows — **FORBIDDEN** hard-delete cascade |

### 3.3 Pool / other AS-IS `stage`

If candidate pool surfaces expose `stage`, align same `stage_key` space — **no** parallel closed enum.

---

## 4. Explicitly **not** this DATA seat

| Item | Owner / status |
|------|----------------|
| `rec_jd_field_def` / layout DnD | JD-DYNAMIC / ARCH Option A — **must_keep** · DATA-01 adapter |
| Interview schedule one-active | `PO-HRM-REC-IV-ONE-ACTIVE-SA-01` |
| `rec_interview_eval_template` | REC-06 — later P2 catalog |
| YCTD `pipeline_flags_json` | Requisition progress — **≠** application stage catalog (**L-REC-CAT-09**) |
| F-REC-HIRE-01 → CORE employee | Soft-link must_keep — **FORBIDDEN** invent payslip |
| Mail MergeToken | GĐ2 |
| REC-03 / `job_postings` | **OUT** GĐ1 |

---

## 5. Validation matrix

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-REC-STG-01 | Create row | `stage_key` matches slug regex | 201 / persist |
| VAL-REC-STG-02 | Create row | `stage_key` = `Interview` (upper) | 400 `HRM-PLT-CAT-CODE-INVALID` |
| VAL-REC-STG-03 | Create active duplicate key same company | UQ partial | 409 `HRM-PLT-CAT-CODE-CONFLICT` |
| VAL-REC-STG-04 | Create key `hr_custom_stage_07` (7th+) | No enum ceiling | **201** — **AC-PLT-REC-02** |
| VAL-REC-STG-05 | Second active `is_hired_outcome` | UQ hired | 409 `HRM-REC-STG-HIRED-DUP` |
| VAL-REC-STG-06 | `is_hired_outcome=true` without `is_terminal` | CHK flags | 400 `HRM-VAL-400` (or normalize terminal=true in BE — prefer reject) |
| VAL-REC-STG-07 | Both hired + reject outcome | CHK flags | 400 `HRM-VAL-400` |
| VAL-REC-STG-08 | Retire row with history/application key | soft-delete | picker hide; history + app still show old key — **AC-PLT-REC-03** |
| VAL-REC-STG-09 | Hard-delete with history | — | **FORBIDDEN** |
| VAL-REC-STG-10 | Retire sole hired-outcome without reassign | business | 412 `HRM-REC-STG-HIRED-REQUIRED` |
| VAL-REC-STG-11 | List vs get-by-id OOS slug | scope_parity U19 | 404/403 — not empty mask |
| VAL-REC-STG-12 | Transition `to_stage` ∉ effective when catalog >0 | BR-PLT-02 | 400 `HRM-REC-STAGE-UNKNOWN` — **AC-PLT-REC-04** |
| VAL-REC-STG-13 | Catalog empty | compat | free-text / starter map allowed until first active row |
| VAL-REC-STG-14 | Hire path | stage = active hired-outcome key | CORE employee soft-link still works — **AC-PLT-REC-05** |
| VAL-REC-STG-15 | `wf_task_type_key` set | ops map only | does **not** create second catalog row |
| VAL-REC-STG-16 | `metadata_json` only for hire flag | typed flags SoT | hire uses `is_hired_outcome` first |

---

## 6. Error taxonomy (physical ↔ API)

| Code | HTTP | When |
|------|------|------|
| `HRM-PLT-CAT-CODE-INVALID` | 400 | slug format fail — **not** «not in starter six» |
| `HRM-PLT-CAT-CODE-CONFLICT` | 409 | Active UQ `(company_id, stage_key)` |
| `HRM-REC-STG-HIRED-DUP` | 409 | Second active `is_hired_outcome` |
| `HRM-REC-STG-HIRED-REQUIRED` | 412 | Retire last hired-outcome without reassign |
| `HRM-REC-STAGE-UNKNOWN` | 400 | Transition / create ∉ effective catalog |
| `HRM-REC-IV-409-ACTIVE` | 409 | One-active interview — **unchanged** |
| Scope | 403/409 | list↔id↔mutate (**U19**) |

---

## 7. Traceability

| Requirement | DB | API (SA confirmed) | FE (later) | Test |
|-------------|-----|-------------------|------------|------|
| AC-PLT-REC-01 JD | `rec_jd_*` must_keep | ARCH-01 | DnD | separate — **not** this seat |
| AC-PLT-REC-02 open 7+ | §2 ADD | F-REC-CAT-STG-02 | Settings REC CFG | U65 browser |
| AC-PLT-REC-03 retire | `archived_at` | retire endpoint | picker hide | history visible |
| AC-PLT-REC-04 validate | effective keys | F-REC-CAT-EFF-01 · APP-02 | transition form | 4xx unknown |
| AC-PLT-REC-05 hire | `is_hired_outcome` | F-REC-HIRE-01 | accept offer | CORE link |
| BR-PLT-02 | consumer keys | APP-02 | — | VAL-REC-STG-12 |
| BR-PLT-04 | soft-delete | retire | — | VAL-REC-STG-08 |
| BR-PLT-05 | no enum CHECK | slug format only | — | VAL-REC-STG-04 |
| BR-PLT-06 class | WF ops ≠ SoT | `wf_task_type_key` | — | VAL-REC-STG-15 |
| FR-UC-BP-REC-05 | §2.4a + §2.5 | STG/EFF | kanban | QA later |
| J-HRM-REC-STG-01 | §2 | STG-01 | Settings | QA after FE/BE |
| scope_parity U19 | `company_id` TEXT | list=get=mutate | deep link | VAL-REC-STG-11 |

---

## 8. DOC-DELTA — client `DB_DESIGN_HRM_ENTERPRISE.md`

| Action | Content |
|--------|---------|
| **ADD** | §2.4a `rec_pipeline_stage` physical — open key · UQs · FORBIDDEN closed CHECK |
| **EXPAND** | §2.5 `stage` note: stores `stage_key`; starter six ≠ ceiling; validate ∈ catalog when >0 |
| **EXPAND** | §2.6 history: may hold retired keys; soft-delete catalog only |
| **EXPAND** | §1.1 ER note + MVP table row optional |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01` |
| **FORBIDDEN** | Wipe §2.3–§2.8 · wipe JD · invent REC-03 |

API client DOC-DELTA (F-REC-CAT-*) remains **ba-docs** residual (SA §7.1 / R-PLT-REC-03).

---

## 9. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-REC-01 | Wire F-REC-APP-02 → F-REC-CAT-EFF-01 after table live | **dev-be** |
| R-PLT-REC-02 | WF bridge optional `wf_task_type_key` hydrate | **dev-be** |
| R-PLT-REC-03 | Client API DOC-DELTA F-REC-CAT-* | **ba-docs** |
| R-PLT-REC-04 | Interview eval template as Catalog GĐ1.5 | sa later |
| R-PLT-REC-05 | Group REF stages partition (if XBOS publishes) | sa / ba-data later |
| R-PLT-REC-BE | ensureSchema + F-REC-CAT-STG/EFF | **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01`** |

---

## 10. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| REC module UAT / Phase1 DONE | **false** |
| `payroll_e2e_ready` | **false** |
| This seat | Docs + DB_DESIGN DOC-DELTA only |
| Seed | **forbidden** in UF evidence |

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-data-01.md` |
| **next_owner** | **pm** → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01` |
| **completion_report** | CONFIRMED physical ADD `public.rec_pipeline_stage` (open `stage_key`, UQ active + hired-outcome, slug CHK only, FORBIDDEN closed CHECK, soft-delete, optional `wf_task_type_key`, typed outcome flags); EXPAND application.stage + history DOC notes; ICatalogRow + VAL-REC-STG-* + DOC-DELTA DB §2.4a/§2.5–2.6; closes R-PLT-DATA-04 REC stage slice; must_keep JD/IV/hire/YCTD; no apps/**; unlock BE. |
