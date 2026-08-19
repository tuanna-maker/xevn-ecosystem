# PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01 — Physical EXPAND · EMP MergeToken origin + register matrix

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01` |
| **Program** | `PO_HRM_CONTINUOUS_W8_20260807` |
| **lane** | governance · ba-data |
| **change_mode** | **EXPAND** `chk_hrm_merge_tok_origin` **+ `emp_catalog`** · **DOC** register matrix `custom.emp.*` / `emp.doc.*` / `emp.et.*` · **NO** new `emp_*` catalog tables · **NO CODE** `apps/**` · **no seed** · **no wipe** EMP-QC / DOC/ET / ATT/REC/DEC / CTR / LIST-TOTALS |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — narrow physical unlock for Option **B** EMP MergeToken hook |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01.md) §5–§6 · F-EMP-TOK-01..05 |
| **ref_platform_data** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) `hrm_merge_tokens` · **§5.2** resolve · §3.2 origin CHK |
| **ref_peer** | [`PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md`](./PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md) §5 `allowance_catalog` |
| **ref_emp_data** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md) **SEALED** `emp_document_type` / `emp_employment_type` — **cấm reopen** |
| **ref_api** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md) **F-PLT-TOK-01..03** |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · PAY/ATT/REC ready **false** · module EMP UAT / Phase1 **DENIED** · **`C-SLICE-≠-MODULE`** · `contracts_printable_ready=false` |
| **must_keep** | EMP-QC-01/02 seals · position/dept XBOS REF · contracts/SI · soft-delete · ATT/REC/DEC · LIST-TOTALS/CTR · keyword_map fallback §5.2 · single `hrm_merge_tokens` SoT |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 0. Decision context

| | |
|--|--|
| **Decision title** | Narrow EXPAND origin + DOC register matrix for EMP MergeToken hook |
| **Requestor** | pm · SA-01 CONFIRMED Option B |
| **Decision owner** | ba-data |
| **Problem** | SA F-EMP-TOK requires `origin=emp_catalog` for DOC/ET tokens; platform DATA-01 CHK lists `builtin\|keyword_map\|extension_field\|import` only; Allowance already EXPAND `allowance_catalog` in Nest — EMP seat must **DOC + CONFIRMED** peer EXPAND before BE ensureSchema. |
| **Constraints** | EXPAND-only · **FORBIDDEN** second EMP token table · **FORBIDDEN** new `emp_*` catalog tables · no `apps/**` · U65 no seed · seals retained |
| **Failure if unresolved** | BE cannot persist `emp_catalog` origin (CHK reject); F-EMP-TOK GĐ1 blocked. |

---

## 1. AS-IS / TO-BE

### 1.1 Physical SoT (unchanged table)

| Item | Stamp |
|------|--------|
| Table | **`public.hrm_merge_tokens`** — platform DATA-01 §3 — **must_keep** |
| Peer origin live | Nest AS-IS CHK already includes **`allowance_catalog`** (Allowance SYNC) |
| EMP catalogs | **`emp_document_type`** · **`emp_employment_type`** — EMP-DATA-01 **SEALED** — consume as **register triggers only** |

### 1.2 EXPAND `chk_hrm_merge_tok_origin`

| AS-IS (platform DATA-01 §3.2 + Allowance) | TO-BE (this seat) |
|------------------------------------------|-------------------|
| `origin IN ('builtin','keyword_map','extension_field','import','allowance_catalog')` | **+ `'emp_catalog'`** |

```sql
-- BE ensureSchema (MERGE-TOKEN-EMP-BE-01) — docs contract only this seat
ALTER TABLE public.hrm_merge_tokens
  DROP CONSTRAINT IF EXISTS chk_hrm_merge_tok_origin;
ALTER TABLE public.hrm_merge_tokens
  ADD CONSTRAINT chk_hrm_merge_tok_origin
  CHECK (origin IN (
    'builtin',
    'keyword_map',
    'extension_field',
    'import',
    'allowance_catalog',
    'emp_catalog'
  ));
```

| Rule | Detail |
|------|--------|
| **Constants** | Nest `MERGE_TOKEN_ORIGINS` ADD `'emp_catalog'` (peer Allowance) |
| **FORBIDDEN** | Closed enum of `token_key` values · hard-delete · invent `emp_merge_tokens` |
| **IX** | Existing `(company_id, origin)` sufficient; optional partial IX `WHERE origin = 'emp_catalog'` — **DEFER** unless BE needs |

### 1.3 Explicitly **not** this seat

| Item | Owner / stamp |
|------|----------------|
| New `emp_document_type` / `emp_employment_type` / any `emp_*` catalog | **SEALED** EMP-DATA-01 — **cấm reopen** |
| Second MergeToken / EAV table | **FORBIDDEN** (L-EMP-TOK-01 · ADR L3) |
| Position / department tokens | XBOS REF — **OUT** (L-EMP-TOK-06 · AC-PLT-EMP-01) |
| Print PDF / `contracts_printable_ready` | CTR must_keep · **false** |
| DEC/QSĐ MergeToken | GĐ2 OUT |
| Client DB/API HTML wipe | ba-docs **R-EMP-TOK-DOCS** ADD-only footer |

---

## 2. DOC register matrix (BR-PLT-01 class · SA §5)

On **successful** EMP writer save (`status=active`, `archived_at IS NULL`) → upsert via **F-PLT-TOK-02** into **`hrm_merge_tokens`**:

| Trigger (writer) | `token_key` | `source_path` | `ring` | `domain` | `origin` | `label_vi` | `extension_field_ref` |
|------------------|-------------|---------------|--------|----------|----------|------------|------------------------|
| EMP extension field (Settings) | `custom.emp.<code>` | `custom.emp.<code>` | `custom` | `EMP` | **`extension_field`** | field label vi-VN | extension item id/code |
| `emp_document_type` create/upsert | `emp.doc.<document_type_key>` | `emp.document_types.<key>` | `public` | `EMP` | **`emp_catalog`** | `name_vi` | optional `document_type_id` |
| `emp_employment_type` create/upsert | `emp.et.<employment_type_key>` | `emp.employment_types.<key>` | `public` | `EMP` | **`emp_catalog`** | `name_vi` | optional `employment_type_id` |

### 2.1 Normalize / UQ / retire

| Rule | Detail |
|------|--------|
| **Normalize** | Keys lower-case; ET hyphen→underscore before token suffix (peer F-EMP-CAT-ET · VAL-EMP-ET-01) |
| **Format** | `token_key` must satisfy `chk_hrm_merge_tok_key_format` — fail → **do not** invent token; surface DOC/ET/extension error first |
| **UQ** | Partial `(company_id, lower(token_key)) WHERE archived_at IS NULL` — conflict → **refresh** same row (F-PLT-TOK-02 upsert) |
| **Retire** | DOC/ET/extension retire → token `status=retired` + `archived_at` — pickers hide; **issued** HĐ snapshots **immutable** (**BR-PLT-03** · VAL-PLT-07) |
| **TX** | Register side-effect **same TX** as DOC/ET/extension writer — token fail → **rollback** (peer Allowance) |
| **Coexistence** | Registry wins `keyword_map` same key — **DATA §5.2** · **VAL-PLT-TOK-01** |
| **Empty registry** | Resolve falls through keyword_map → builtin → missing — **VAL-PLT-TOK-02** / **VAL-PLT-06** **must_keep** |
| **FORBIDDEN** | Hard-delete token · seed tokens for UF · register XBOS `job_titles` / `departments` |

### 2.2 Builtin must_keep (not closed ceiling)

`employee.full_name` and other `MERGE_TOKEN_BUILTIN_DEFAULTS` remain `origin=builtin` — **not** replaced by this hook.

### 2.3 GĐ1 mandatory vs HOLD

| Family | GĐ1 |
|--------|-----|
| `emp.doc.*` / `emp.et.*` (`emp_catalog`) | **Mandatory** — F-EMP-TOK-01 / F-EMP-TOK-02 |
| `custom.emp.*` (`extension_field`) | **Desired**; if extension producer incomplete → residual **R-EMP-TOK-EXT** — **does not** block DOC/ET |

---

## 3. Lifecycle EXPAND (append platform DATA-01 §3.4)

| Event | Behavior |
|-------|----------|
| EMP DOC create/upsert active | Upsert `emp.doc.<key>` · `origin=emp_catalog` · `domain=EMP` · `status=active` (**F-EMP-TOK-01**) |
| EMP ET create/upsert active | Upsert `emp.et.<key>` · `origin=emp_catalog` · normalize suffix (**F-EMP-TOK-02**) |
| EMP extension field save active | Upsert `custom.emp.<code>` · `origin=extension_field` (**F-EMP-TOK-03**) |
| Retire DOC/ET/extension | Soft-retire matching token — **BR-PLT-04** |
| Print issue | Snapshot values only — registry edit does **not** mutate issued PV — **BR-PLT-03** · §5.2 step 1 |

---

## 4. Resolve bag EXPAND (cite DATA §5.2 · F-EMP-TOK-05)

**Order unchanged** (platform DATA-01 §5.2):

```text
1) issued print version → merged_fields_json (immutable)
2) active hrm_merge_tokens row (company_id, token_key) → registry wins
3) template.keyword_map
4) builtin defaults
5) missing → warn / can_issue policy
```

| Resolve key | Value source (when registry/active context) |
|-------------|-----------------------------------------------|
| `emp.doc.<key>` | Effective `emp_document_type.name_vi` (active or retired-for-history) |
| `emp.et.<key>` | Effective `emp_employment_type.name_vi` |
| `custom.emp.<code>` | Extension field value / label per F-PLT-TOK-03 |
| Alias (optional bag) | `employee.employment_type_label` ← ET effective name for employee denorm key |
| Missing catalog | Soft warn / empty — **FORBIDDEN** invent CCCD/FULL_TIME labels |

**Ring `cb` mask** unchanged (VAL-PLT-TOK-05).

---

## 5. DTO ↔ column map (F-EMP-TOK → F-PLT-TOK-02)

> Physical binding only — F.1 Mục đích/Nghiệp vụ = SA-01 §7.

| Matrix field | `hrm_merge_tokens` column | Notes |
|--------------|---------------------------|-------|
| `token_key` | `token_key` | `custom.emp.*` / `emp.doc.*` / `emp.et.*` |
| `source_path` | `source_path` | As matrix §2 |
| `ring` | `ring` | `custom` or `public` |
| `domain` | `domain` | Always `EMP` for this hook |
| `origin` | `origin` | `extension_field` \| **`emp_catalog`** |
| `label_vi` | `label_vi` | Display-ready |
| `extension_field_ref` | `extension_field_ref` | Extension code/id **or** optional DOC/ET id |
| `status` | `status` | `active` on save; `retired` on retire |
| `company_id` | `company_id` | Same as DOC/ET/extension writer — **scope_parity U19** |
| `meta` | `meta_json` | Optional; **not** free-text SoT for labels |

List path: prefer **F-PLT-TOK-01** `GET …/merge-tokens?domain=EMP` (optional EMP alias F-EMP-TOK-04).

Errors: `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · scope 403/409 — same F-PLT-TOK taxonomy.

---

## 6. Data interaction matrix

| Operation | EMP DOC/ET / extension | `hrm_merge_tokens` | Transaction |
|-----------|------------------------|--------------------|-------------|
| **C**reate active DOC/ET | INSERT/UPSERT catalog | UPSERT register `emp_catalog` | **Single TX** |
| **C**reate extension | Settings item save | UPSERT `extension_field` | Single TX |
| **R**ead merge list | — | F-PLT-TOK-01 filter `domain=EMP` | scope_parity |
| **U**pdate label/key | UPDATE catalog | Refresh `label_vi` / `source_path` | Single TX |
| **D** retire | soft catalog | soft token | Single TX |
| Hard-delete | **FORBIDDEN** | **FORBIDDEN** | — |
| Resolve preview | effective catalogs | §5.2 + F-EMP-TOK-05 | read-only |

---

## 7. Validation matrix (EMP-TOK physical)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-EMP-TOK-01** | Persist token `origin=emp_catalog` | CHK includes `emp_catalog` | Persist OK after BE EXPAND |
| **VAL-EMP-TOK-02** | DOC active save | Upsert `emp.doc.<key>` same `company_id` | Row active · AC-PLT-EMP-TOK-01 |
| **VAL-EMP-TOK-03** | ET `full-time` | Normalize → `emp.et.full_time` | AC-PLT-EMP-TOK-02 |
| **VAL-EMP-TOK-04** | Retire DOC/ET | Token retired + archived | Picker hide; issued PV unchanged |
| **VAL-EMP-TOK-05** | Extension save (when live) | `custom.emp.<code>` · `origin=extension_field` | AC-PLT-EMP-TOK-04 |
| **VAL-EMP-TOK-06** | Same key registry + keyword_map | §5.2 registry wins | VAL-PLT-TOK-01 |
| **VAL-EMP-TOK-07** | Empty EMP registry | Fallback keyword_map / builtin | VAL-PLT-TOK-02 · CTR must_keep |
| **VAL-EMP-TOK-08** | Token upsert fails mid DOC TX | Rollback DOC write | Peer Allowance |
| **VAL-EMP-TOK-09** | List id then get-by-id OOS | Same `resolveHrmListScope` as F-PLT-TOK | 403/404 U19 |
| **VAL-EMP-TOK-10** | Register `job_titles` / position as EMP catalog token | — | **FORBIDDEN** |
| **VAL-EMP-TOK-11** | Hard-delete token | — | **FORBIDDEN** |
| **VAL-EMP-TOK-12** | Seed tokens to pass UF | — | **FORBIDDEN** U65 |

Keep **VAL-PLT-*** · **VAL-EMP-DOC/ET-*** — **no wipe**.

---

## 8. Traceability

| Spec / BR | Physical / API | Test expect |
|-----------|----------------|-------------|
| BR-PLT-01 · ADR V3 | Register matrix §2 | AC-PLT-EMP-TOK-01..04 |
| BR-PLT-03 | Issued snapshot immutable | VAL-EMP-TOK-04 · VAL-PLT-07 |
| BR-PLT-04 | Soft-retire sync | VAL-EMP-TOK-04 |
| BR-PLT-05 | Format CHK only | VAL-PLT-01 · no closed token enum |
| DATA §5.2 | Resolve order | VAL-EMP-TOK-06/07 · F-EMP-TOK-05 |
| F-PLT-TOK-01..03 | Reuse upsert/list/resolve | scope_parity |
| F-EMP-TOK-01 | DOC → `emp.doc.*` | AC-PLT-EMP-TOK-01 |
| F-EMP-TOK-02 | ET → `emp.et.*` | AC-PLT-EMP-TOK-02 |
| F-EMP-TOK-03 | Extension → `custom.emp.*` | AC-PLT-EMP-TOK-04 / R-EMP-TOK-EXT |
| F-EMP-TOK-04 | List EMP domain | AC-PLT-EMP-TOK-03 admin |
| F-EMP-TOK-05 | Label bag from effective DOC/ET | AC-PLT-EMP-TOK-03 |
| EMP-DATA DOC/ET | Triggers only — **no** table ADD | must_keep seal |
| AC-PLT-EMP-01 | Position OUT | VAL-EMP-TOK-10 |

**Journey / UF (QA later):** Settings DOC/ET Lưu → F5 → merge-tokens EMP list · U65 zero-seed · cite EMP-QC seals as prior — **cấm reopen**.

---

## 9. DOC-DELTA pointer (client)

| Artifact | Delta this seat |
|----------|-----------------|
| This DATA spec | **SoT** for origin EXPAND + register matrix |
| `DB_DESIGN_HRM_ENTERPRISE.md` | Footer ADD-only: CHK `emp_catalog` + matrix pointer — owner **ba-docs** (**R-EMP-TOK-DOCS**) · **no wipe** |
| `API_DESIGN_HRM_ENTERPRISE.md` | F-EMP-TOK pointer — ba-docs / SA already |

**This seat does not** edit client HTML/md beyond program specs/evidence (governance narrow).

---

## 10. Honesty locks

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** LOCKED |
| `employees_e2e_linkage_ready` | **false** LOCKED |
| `payroll_e2e_ready` | **false** |
| `attendance_uat_ready` | **false** |
| `recruitment_uat_ready` | **false** |
| `contracts_printable_ready` | **false** |
| Module EMP UAT / Phase1 | **DENIED** |
| EMP-QC-01 / EMP-QC-02 | **SEAL RETAIN** |

---

## 11. Unlock / residual

```text
DATA-01 (this) CONFIRMED
  → dev-be MERGE-TOKEN-EMP-BE-01
       ensureSchema EXPAND chk + MERGE_TOKEN_ORIGINS
       side-effect F-EMP-TOK-01/02 (+03 if ready) + F-EMP-TOK-05 bag
  → ba-docs R-EMP-TOK-DOCS (parallel OK)
  → QA AC-PLT-EMP-TOK-* U65 → QC narrow GWC — DENY personnel UAT flip
```

| Residual | Severity | Owner |
|----------|----------|-------|
| **R-EMP-TOK-EXT** | P2 | dev-be / fe |
| **R-EMP-TOK-DOCS** | P3 | ba-docs |
| **C-SLICE-≠-MODULE** | — | pm |

**Closed by this seat:** SA unlock gate — physical origin + DOC matrix **CONFIRMED** for BE.

---

## 12. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | CONFIRMED EXPAND `chk_hrm_merge_tok_origin` **+ `emp_catalog`** (peer `allowance_catalog`); DOC register matrix `custom.emp.*` / `emp.doc.*` / `emp.et.*` DTO↔column; cite F-EMP-TOK-01..05 · F-PLT-TOK · DATA §5.2; **no** new emp_* catalog tables; unlock **MERGE-TOKEN-EMP-BE-01**; honesty false; seals retained; no apps/**. |
| **next_owner** | **pm** → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
