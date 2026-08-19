# PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01 — Physical DB_DESIGN · MergeToken + CTR open catalog

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** `hrm_merge_tokens` · **EXPAND/CONFIRM** CTR open-catalog constraints · **NO CODE** `apps/**` · **no migrate** · **no seed** · **no wipe** print-spine / DATA-01/02 / XEVN-TPL |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — sponsor Option **B** · TechSpec platform · ADR L1–L7 |
| **ref_tech** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md) §1–§6 · §10 cascade |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) L1–L7 · Option B |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) BR-PLT-01..06 · AC-PLT-* |
| **ref_ctr_spine** | [`DATA-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md) · [`DATA-02`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md) · [`XEVN-TPL-DATA-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01.md) **@CHANGE CORR** · [`TECHSPEC-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md) print-spine |
| **ref_rec** | [`PO-HRM-JD-DYNAMIC-DATA-01.md`](./PO-HRM-JD-DYNAMIC-DATA-01.md) — FormSchema vertical #2 adapter |
| **Honesty** | `contracts_printable_ready=false` · no module `*_uat_ready` flip · no Phase1 DONE · U65 |
| **must_keep** | UF-HRM-02 · print-spine GWC · soft-delete · XBOS legal-body boundary · U65 · DYNAMIC-LOCK / CORR-01 (no CHK IN 8) · Q-CTR-01/02 CLOSED · BR-CD-F5-01 · JD Option A `rec_jd_*` |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Storage pattern | **Option B physical** — domain tables + shared **interfaces** (`ICatalogRow` / `IFormSchema` / `IMergeToken`); **FORBIDDEN** mega-EAV one table all domains (ADR Q-PLT-03) |
| MergeToken SoT | **CONFIRMED ADD** `public.hrm_merge_tokens` (canonical name) |
| CTR Catalog | **CONFIRMED** SoT = existing `hrm_contract_templates` (+ clauses / packs as catalog kinds) — **no** second template catalog table GĐ1 |
| CTR FormSchema | **CONFIRMED** SoT = `hrm_contract_templates.layout_json` (+ clause canvas) — **must_keep** print-spine |
| Open catalog | **CONFIRM CORR-01** — **FORBIDDEN** ship `CHECK code IN (8 XEVN_*)` / closed enum / API reject 9th as product rule |
| keyword_map coexistence | **CONFIRMED** dual-layer GĐ1 — registry **wins** on same `token_key`; empty registry → fallback `keyword_map` (ADR §8.2) |
| Vertical #1 | **CTR-first EXPAND OK** — MergeToken **same wave** (staged in this DATA file); non-CTR physical DDL = later waves |
| REC adapter | **NOTE only** — `rec_jd_*` implements `ICatalogRow`/`IFormSchema` via adapter; **no wipe** / no migrate into MergeToken |
| Dev this seat | **NO** `apps/**` · **NO** migrate · **NO** seed |
| Honesty | **remain false** |

---

## 2. Interface → physical map (Option B)

> Logical registries from TechSpec §1.1. Physical = **domain tables**. Shared Nest helpers come **after** API F.1 — not this seat.

### 2.1 Overview

| Interface | CTR (vertical #1 — GĐ1) | REC (vertical #2 — adapter) | EMP / ATT / PAY / SET (GĐ1) |
|-----------|-------------------------|-----------------------------|-----------------------------|
| **`ICatalogRow`** | `hrm_contract_templates` (`catalog_kind=contract_template`) · `hrm_contract_clauses` (clause-as-catalog) · packs = configured catalog / Settings (starter `GENERAL`\|`IT_OFFICE`\|`DRIVER`) | `rec_jd_field_def` · pack/group tables (`rec_jd_*`) | Interface only — later ba-data; consume XBOS REF where ADR allows |
| **`IFormSchema`** | `hrm_contract_templates.layout_json` (`schema_kind=CTR.template_layout`) | `rec_jd_form_layout` + `_item` + snapshot | Interface only GĐ1 |
| **`IMergeToken`** | **`hrm_merge_tokens`** + template `keyword_map` fallback | Optional JD view tokens later — **not** required this wave | Hook plan: EMP custom → register token (BR-PLT-01) after CTR |

```text
ICatalogRow  ──CTR──► hrm_contract_templates / hrm_contract_clauses (+ packs)
IFormSchema  ──CTR──► templates.layout_json (clause_ids + chrome)
IMergeToken  ──ALL──► hrm_merge_tokens  (+ CTR keyword_map coexistence)

ICatalogRow  ──REC──► rec_jd_field_def (adapter — must_keep Option A)
IFormSchema  ──REC──► rec_jd_form_layout* (adapter — no wipe)
```

### 2.2 `ICatalogRow` ↔ CTR columns (binding)

| Logical (`ICatalogRow`) | Physical CTR | Notes |
|-------------------------|--------------|-------|
| `id` | `hrm_contract_templates.id` | uuid PK |
| `company_id` | `company_id` text | Same `resolveHrmListScope` as list/get/mutate |
| `domain` | implied `CTR` | Not a column GĐ1 — adapter sets constant |
| `catalog_kind` | implied `contract_template` | Clauses: `contract_clause` |
| `code` | `code` | **Open** — UQ partial `(company_id, lower(code)) WHERE archived_at IS NULL` |
| `label_vi` | `name_vi` | Display-ready |
| `status` | `status` | `draft`\|`active`\|`retired` |
| `meta_json` | XEVN cols + `keyword_map` + pack defaults | `default_term_type` · durations · `title_print_vi` · `matrix_family` (XEVN-TPL-DATA) |
| `version` | `version` | Bump after issued consumer |
| `archived_at` | `archived_at` | Soft-delete only |

**FORBIDDEN:** Second physical mega-catalog table for CTR templates GĐ1. **FORBIDDEN:** `CHK code IN (8)`.

### 2.3 `IFormSchema` ↔ CTR columns

| Logical | Physical | Notes |
|---------|----------|-------|
| `schema_id` | `templates.id` (layout owned by template) | One layout per template row GĐ1 |
| `schema_kind` | `CTR.template_layout` (adapter constant) | |
| `layout_json` | `layout_json` jsonb | `clause_ids[]` order + `show_driver_license_block` |
| `field_defs[]` | N/A on template — clauses are separate catalog | REC uses `rec_jd_field_def` |
| `status` / `version` / `archived_at` | same as template | Soft-delete |

### 2.4 REC adapter note (must_keep — no DDL this wave)

| Platform interface | REC physical (AS-IS / JD-DYNAMIC-DATA) | Rule |
|--------------------|----------------------------------------|------|
| `ICatalogRow` | `rec_jd_field_def` (`field_key` ≡ `code`) | Adapter maps keys; **cấm** wipe into EAV / `hrm_merge_tokens` |
| `IFormSchema` | `rec_jd_form_layout` + items + `layout_snapshot_json` | Option A must_keep |
| `IMergeToken` | Optional later for JD public view | **OUT** GĐ1 platform DATA — do not invent JD token table here |

---

## 3. ADD `hrm_merge_tokens` (physical)

### 3.1 Table

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug / OU — **same** resolver as CTR peers |
| `token_key` | text | NO | | Canonical **without** braces; render as `{{token_key}}` (Q-PLT-01 CLOSED) |
| `source_path` | text | NO | | e.g. `employee.full_name` · `contract.contract_number` · `custom.emp.<code>` |
| `ring` | text | NO | | `public`\|`company`\|`contract`\|`cb`\|`clause`\|`custom` — ACL on merge |
| `domain` | text | NO | | Owning module: `CTR`\|`EMP`\|`REC`\|`ATT`\|`PAY`\|`SET`\|`CAT` |
| `label_vi` | text | NO | | Merge field picker label (display-ready) |
| `status` | text | NO | `'active'` | `draft`\|`active`\|`retired` |
| `origin` | text | NO | `'builtin'` | `builtin`\|`keyword_map`\|`extension_field`\|`import` |
| `extension_field_ref` | text | YES | NULL | Soft ref to settings extension item / custom field code when `origin=extension_field` |
| `meta_json` | jsonb | YES | NULL | Optional hints (format, required_packs[], …) — **not** free-text SoT |
| `version` | int | NO | 1 | Bump on material change after issued consumer exists |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` / `updated_at` | timestamptz | NO | now() | |
| `created_by` / `updated_by` | text | YES | NULL | |

### 3.2 Constraints / indexes

| Name (hint) | Rule |
|-------------|------|
| **PK** | `id` |
| **UQ** | **Partial:** `(company_id, lower(token_key)) WHERE archived_at IS NULL` |
| **IX** | `(company_id, domain)`, `(company_id, status)`, `(company_id, ring)` |
| **IX** | `(company_id, origin)` WHERE `origin = 'extension_field'` |
| **CHK `chk_hrm_merge_tok_ring`** | `ring IN ('public','company','contract','cb','clause','custom')` |
| **CHK `chk_hrm_merge_tok_status`** | `status IN ('draft','active','retired')` |
| **CHK `chk_hrm_merge_tok_origin`** | `origin IN ('builtin','keyword_map','extension_field','import')` |
| **CHK `chk_hrm_merge_tok_domain`** | `domain IN ('CTR','EMP','REC','ATT','PAY','SET','CAT')` |
| **CHK `chk_hrm_merge_tok_key_format`** | `token_key ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$'` — **format only**; **cấm** closed token enum |
| **FORBIDDEN** | `CHECK token_key IN (<fixed N>)` · hard-delete · XBOS sync of token rows as legal body |

### 3.3 Builtin seed policy (docs only — not this seat)

| Family | Example `token_key` | `source_path` | `ring` | `domain` |
|--------|---------------------|---------------|--------|----------|
| Employee | `employee.full_name` | `employee.full_name` | public | EMP |
| Contract | `contract.contract_number` | `contract.contract_code` | contract | CTR |
| Company / OU | `company.legal_name` | `company.legal_name` | company | SET |
| DRIVER GPLX | `driver.license_number` (alias map to spine tokens) | `contract.driver_license_number` | public | CTR |
| C&B | `cb.base_salary` | `cb.base_salary` | cb | CTR |
| Custom | `custom.emp.<code>` | `custom.emp.<code>` | custom | EMP |

> Starter builtin rows = **bootstrap examples** when Dev ensure runs later — **not** ceiling (BR-PLT-05 class). Enumerate in ensure/migration seat — **not** closed TS union forever.

### 3.4 Lifecycle

| Event | Behavior |
|-------|----------|
| Create / update active custom field (BR-PLT-01) | Upsert row `origin=extension_field` · refresh `label_vi` / `source_path` · `status=active` |
| Soft-delete field | Set `archived_at` / `retired` — pickers hide; issued snapshots keep resolved values |
| Print issue | Snapshot **values** into `print_versions.merged_fields_json` — **not** live token row edit (BR-PLT-03) |
| Holding publish | Token registry **tenant-local** GĐ1 — **not** required in library payload DATA-02 unless later EXPAND (residual OPEN) |

---

## 4. CTR open catalog — EXPAND / CONFIRM (no CHK IN 8)

> **Pointer + lock:** Physical template EXPAND already in [`XEVN-TPL-DATA-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01.md) **@CHANGE CORR-01**. This section **re-confirms** platform lens — **does not wipe** XEVN-TPL-DATA.

| Topic | Platform DATA stamp |
|-------|---------------------|
| SoT | `hrm_contract_templates.code` = Catalog `catalog_kind=contract_template` |
| Starter 8 `XEVN_*` | Optional ensure — **not** max |
| UQ | Partial `(company_id, lower(code)) WHERE archived_at IS NULL` |
| **CHK `chk_hrm_ctr_tpl_xevn_code` IN (8)** | **REMOVED / FORBIDDEN to ship** (CORR · DYNAMIC-LOCK · BR-PLT-05) |
| Create 9+ | Format/slug + UQ + `pack_code` ∈ configured packs — VAL-XEVN-06/11 · AC-PLT-CTR-01 ≡ AC-CTR-XEVN-11 |
| Packs | Starter neo `GENERAL`\|`IT_OFFICE`\|`DRIVER` (+ optional `LOGISTICS`) — configured set; **cấm** FE invent pack forever as closed TS enum |
| Lineage | DATA-02 `origin*` · publishes · pull_audits **must_keep** |
| Legal bodies | In-HRM only — **cấm** XBOS L0 sync clause/template body (L5) |

**No additional DDL required** on templates for open-catalog beyond XEVN-TPL-DATA CORR — platform seat **confirms** constraint policy for Dev ensureSchema: **omit** closed code CHECK.

---

## 5. keyword_map ↔ MergeToken coexistence (CTR)

### 5.1 Layers

| Layer | Physical | Role GĐ1 |
|-------|----------|----------|
| A — Registry | `hrm_merge_tokens` | Cross-template SoT + custom field tokens; picker list |
| B — Per-template override | `hrm_contract_templates.keyword_map` jsonb | Pack chrome · GPLX · number pattern · employer_* (XEVN-TPL-DATA §3.3) **must_keep** |
| C — Issued snapshot | `hrm_contract_print_versions.merged_fields_json` | Freeze values at VER (BR-PLT-03) |

### 5.2 Resolve order (deterministic)

```text
1) If print version issued → use merged_fields_json (immutable)
2) Else if hrm_merge_tokens has active row for (company_id, token_key) → registry wins
3) Else if template.keyword_map has "{{token_key}}" or token_key → keyword_map
4) Else builtin defaults (service constants / ensure rows) 
5) Else missing → warn / can_issue policy (HRM-PLT-TOKEN-UNKNOWN class)
```

| Rule ID | Condition | Expected |
|---------|-----------|----------|
| **VAL-PLT-TOK-01** | Same `token_key` in registry **and** `keyword_map` | Registry **wins**; keyword_map ignored for that key |
| **VAL-PLT-TOK-02** | Registry empty / no row for key | Fallback `keyword_map` — print-spine still works (ADR rollback) |
| **VAL-PLT-TOK-03** | `keyword_map` key uses braces `{{x}}` | Normalize to `token_key=x` for lookup |
| **VAL-PLT-TOK-04** | Dual syntax `#x#` in same template GĐ1 | **REJECT** persist / resolve — Q-PLT-01 `{{ }}` only |
| **VAL-PLT-TOK-05** | Ring `cb` without ACL | Mask / omit value — BR-CD-F5-01 class |

### 5.3 `keyword_map` shape (unchanged — must_keep)

```json
{
  "{{token}}": { "source": "path.to.field", "ring": "public|company|contract|cb|clause" }
}
```

Optional sync path (later BE): upsert `origin=keyword_map` rows from template map — **not** required for GĐ1 fallback; prefer explicit registry for custom fields.

---

## 6. Validation matrix (platform DATA)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-PLT-01** | Upsert `hrm_merge_tokens.token_key` | Format CHK + UQ active | else `HRM-PLT-CAT-CODE-INVALID` / conflict class |
| **VAL-PLT-02** | Soft-delete token | `archived_at` set | Picker excludes; history OK |
| **VAL-PLT-03** | List token id then get-by-id out of scope | Same `resolveHrmListScope` | 403/404 **scope_parity** U19 |
| **VAL-PLT-04** | Custom field save active | Register/refresh token same `company_id` | BR-PLT-01 · AC-PLT-CTR-05 |
| **VAL-PLT-05** | CTR template create 9th code | **No** CHK IN 8; format+UQ+pack only | AC-PLT-CTR-01 · VAL-XEVN-06/11 |
| **VAL-PLT-06** | Merge preview with empty registry | Resolve via `keyword_map` | Preview still 2xx path |
| **VAL-PLT-07** | Issued PV then edit token registry | Issued snapshot unchanged | BR-PLT-03 |
| **VAL-PLT-08** | Hard-delete token row | Forbidden | Soft-delete only |
| **VAL-PLT-09** | Legal clause body → XBOS catalog-sync | Forbidden | L5 · library ADR |
| **VAL-PLT-10** | UF-HRM-02 CRUD omit `template_*` | Allowed | must_keep |
| **VAL-PLT-TOK-01..05** | §5.2 | Coexistence | As above |

Keep **VAL-CTR-*** · **VAL-PUB-*** · **VAL-XEVN-*** — **no wipe**.

---

## 7. DTO ↔ column map — **F-PLT-TOK-*** (hints for SA API deepen)

> Full F.1 (Mục đích · Nghiệp vụ · bước SRS) = **sa** next seat. Below = physical binding only.

### 7.1 F-PLT-TOK-01 — List tokens

| Intent | List active merge tokens for picker / admin |
|--------|-----------------------------------------------|
| Suggested path | `GET /api/hrm/merge-tokens?company_id=&domain=&status=` (exact path = SA) |
| Scope | `resolveHrmListScope` — exclude `archived_at IS NOT NULL` |

| DTO field | DB column | Notes |
|-----------|-----------|-------|
| `id` | `id` | |
| `companyId` | `company_id` | |
| `tokenKey` | `token_key` | Wire without braces; FE may display `{{tokenKey}}` |
| `sourcePath` | `source_path` | |
| `ring` | `ring` | |
| `domain` | `domain` | |
| `labelVi` | `label_vi` | Display-ready |
| `status` | `status` | |
| `origin` | `origin` | |
| `extensionFieldRef` | `extension_field_ref` | |
| `version` | `version` | |
| `meta` | `meta_json` | |

### 7.2 F-PLT-TOK-02 — Upsert / register token

| DTO field | DB column | Notes |
|-----------|-----------|-------|
| `tokenKey` | `token_key` | Format validate |
| `sourcePath` | `source_path` | |
| `ring` | `ring` | |
| `domain` | `domain` | |
| `labelVi` | `label_vi` | |
| `status` | `status` | |
| `origin` | `origin` | default `builtin` or `extension_field` |
| `extensionFieldRef` | `extension_field_ref` | BR-PLT-01 |
| `meta` | `meta_json` | |

Errors: `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · scope 403/409.

### 7.3 F-PLT-TOK-03 — Resolve preview (read)

| Request | Resolve using §5.2 order for given `company_id` + optional `template_id` |
|---------|--------------------------------------------------------------------------|
| Response | `tokens[]` / `mergedPreview` map — **no** persist unless VER |

| Resolve input | Source |
|---------------|--------|
| Registry | `hrm_merge_tokens` |
| Template override | `hrm_contract_templates.keyword_map` |
| Contract / employee / OU | Live domain columns (print-spine) |
| C&B | ACL-gated |

### 7.4 Coexistence with existing CTR APIs (must_keep)

| Family | Binding |
|--------|---------|
| **F-CORE-CTR-TPL / CL / PREV / VER / PDF** | Print-spine AS-IS + CORR open catalog — **deepen**, not replace |
| **PREV merge** | Call same resolve order as F-PLT-TOK-03 |
| **VER freeze** | Write `merged_fields_json` from resolve — ignore later token edits |
| **F-CTR-LIB-*** | DATA-02 must_keep — tokens **not** required in publish payload GĐ1 |

---

## 8. Scope parity (U19)

| Surface | List | Get-by-id | Mutate |
|---------|------|-----------|--------|
| `hrm_merge_tokens` | `resolveHrmListScope` | **Same** filter | Same |
| `hrm_contract_templates` | Existing CTR | Existing — **must_keep** | Open catalog CORR |
| Holding `main` | ADR-GROUP-CEO + library publish | List id then detail 404 = **scope_parity** defect | |

Journey link (QA later): AC-PLT-CTR-05 / proposed `J-HRM-CTR-07` + print `J-HRM-03` class.

---

## 9. must_keep / forbidden

| Keep | Forbidden |
|------|-----------|
| UF-HRM-02 nullable `template_*` | Require template on every contract |
| Print-spine preview→version→PDF | Redesign PDF / reopen Q-CTR |
| Soft-delete `archived_at` | Hard-delete tokens/templates/clauses |
| XBOS group REF catalogs | Sync legal clause/template bodies to XBOS |
| `keyword_map` fallback | Remove keyword_map before registry empty-safe |
| Open catalog 9+ · DYNAMIC-LOCK | `CHK IN (8)` · FE fixed 8 · API reject 9th as enum |
| JD `rec_jd_*` Option A | Wipe JD into EAV / MergeToken table |
| BR-CD-F5-01 | Salary SoT on contract body |
| Honesty flags false | Flip `contracts_printable_ready` / Phase1 from this doc |
| DATA-01/02 / XEVN-TPL-DATA | Wipe or contradict CORR open catalog |

---

## 10. Migration / Dev notes (not this seat)

| Item | Note |
|------|------|
| ensureSchema | ADD `hrm_merge_tokens` + indexes/CHKs §3; **omit** closed XEVN code CHECK on templates |
| Feature flag | Print operable if token table empty (keyword_map only) |
| Builtin ensure | Optional upsert starter tokens — **not** UF evidence (U65) |
| Shared Nest package | After API F.1 — `IMergeToken` resolver |

---

## 11. Residuals (OPEN — not blocking CONFIRMED)

| ID | Note | Owner |
|----|------|-------|
| R-PLT-DATA-01 | Exact Nest path prefix for F-PLT-TOK | **sa** API deepen |
| R-PLT-DATA-02 | Whether holding publish payload includes tokens GĐ1.5 | sa / ba-data later |
| R-PLT-DATA-03 | EMP extension-item → token auto-hook physical event | after CTR TOK API |
| R-PLT-DATA-04 | PAY/ATT/EMP/DEC/SI catalog physical waves | **ATT** · **REC pipeline** · **EMP DOC+ET** · **DEC QSĐ types** · **SI insurance-type** · **SI insurers** slices **CLOSED** (`ATT-DATA-01` · `REC-DATA-01` · `EMP-DATA-01` · `DEC-DATA-01` · `SI-INS-CATALOG-DATA-01` · `SI-INSURER-CATALOG-DATA-01`) — residual PAY catalog physical remains PM sequence Q-PLT-05 |
| R-PLT-DATA-05 | Client DOC-DELTA pointer DB_DESIGN (ADD-only) | ba-docs |

---

## 12. Honesty

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| Platform / Phase1 DONE | **false** |
| This seat | Docs only — physical DB_DESIGN |
| Option B | **Sponsor CONFIRMED** 2026-08-07 |
| `apps/**` touched | **none** |

---

## 13. Cascade unlock

| Next | Owner | Exit |
|------|-------|------|
| **sa** | API deepen **F-PLT-TOK-*** F.1 (Mục đích · bước SRS · DTO) + PREV resolve cite §5.2 | API CONFIRMED |
| **dev-be** | Only after DATA+API F.1 — ensureSchema MergeToken + open TPL (no CHK IN 8) | READY_FOR_QA |
| **dev-fe** | Token picker / AC-PLT-CTR-05 after BE | READY_FOR_QA |
| **QA** | AC-PLT-CTR-01..06 U65 browser | printable still false |
| **ba-docs** | FR-PLT pointer DOC-DELTA ADD-only | optional parallel |

**Dev HOLD** on shared platform helpers until **sa** F-PLT-TOK F.1 complete. CTR CORR open-catalog on existing TPL tables may continue in parallel when its own DATA+API already unlocked.

---

## 14. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-data-01.md` |
| **next_owner** | **pm** → **sa** API deepen F-PLT-TOK |
| **completion_report** | CONFIRMED ADD `hrm_merge_tokens` + CTR open-catalog confirm (no CHK IN 8) + I*→domain map (CTR first; REC adapter note) + keyword_map coexistence + F-PLT-TOK DTO hints + VAL-PLT-*; printable=false; no apps/**. |
