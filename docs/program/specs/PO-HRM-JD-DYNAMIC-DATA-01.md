# PO-HRM-JD-DYNAMIC-DATA-01 — Data contract: JD dynamic fields

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-DYNAMIC-DATA-01` |
| **lane** | governance · ba-data |
| **slice** | `docs/program/slices/PO-HRM-JD-DYNAMIC-TOPCV.md` |
| **parallel** | `PO-HRM-JD-DYNAMIC-SPEC-01` (**READY**) |
| **status** | **ALIGNED-SPEC** — DOC-DELTA §12 vs UC-00a/b/c · BR-BP-JD-DYN-01..08 · J-HRM-JD-01..03 · A2/Q2 data-lock |
| **date** | 2026-08-06 |
| **forbidden** | `apps/**` code · migrate · seed · claim LIVE |
| **schema SoT note** | Repo **không** có `schema.prisma` — AS-IS = Nest `ensure*Schema` + `migrations/hrm/*.sql` |

---

## 0. Spec read ack

| Artifact | Cite |
|----------|------|
| Slice | `PO-HRM-JD-DYNAMIC-TOPCV.md` — settings fields → kéo vào create → popup dynamic → view TopCV-like; title-first; must_keep FR-UC-BP-REC-00 / YCTD linkage |
| **SPEC-01 READY** | `docs/program/specs/PO-HRM-JD-DYNAMIC-SPEC-01.md` — FR-UC-BP-REC-00a/b/c · BR-BP-JD-DYN-01..08 · AC-JD-DYN-01..16 · J-HRM-JD-01..03 |
| SRS spine | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-00** · BR-BP-JD-01 |
| Logical DB | `DB_DESIGN_HRM_ENTERPRISE.md` §2.1 `rec_job_description` → YCTD FK |
| AS-IS Nest | `job_description_templates` (Lane A JD library) · `job_requisitions.job_template_id` soft link · leftover `job_postings` (Lane B **không** FR-RC SoT) |
| Position SoT | FR-HRM-RC-JD-01 / AC-SET-FS-03 — `position_code` ∈ `job_titles` |
| Pattern reuse | Group-HR / infra **custom field defs** — **mẫu hành vi**, không copy table name · catalog JD **riêng** (SPEC §6.1) |

---

## 1. AS-IS inventory (trace — no Prisma)

| Physical / ensureSchema | Role | FR / note |
|-------------------------|------|-----------|
| `public.job_description_templates` | JD library (code UQ per `company_id`) | FR-UC-BP-REC-00 AS-IS · F6 / UC-HRM-RC-07 |
| Columns AS-IS | `id`, `company_id` TEXT, `code`, `title`, `position_name`, `position_code`, `job_description`, `requirements`, `notes`, `is_active`, timestamps | Flat text — **chưa** dynamic field catalog / layout |
| `public.job_requisitions` | YCTD Lane A | `job_template_id` TEXT soft → template id; `job_description` / `requirements` copy/snapshot fields |
| `migrations/hrm/0003_*.sql` | Early YCTD DDL (`company_id` UUID legacy) | Superseded by Nest TEXT-slug ensureSchema in service |
| `public.job_postings` (+ wave2) | Lane B leftover | **Forbidden** as JD SoT / headcount SoT |
| Logical target | `rec_job_description` | DB_DESIGN §2.1 — status draft\|active\|retired |

**Gap class (this wave):** thiếu entity **định nghĩa trường** + **layout kéo-thả** + **payload giá trị theo field_id** cho create/view JD. AS-IS chỉ 2 khối text (`job_description`, `requirements`).

---

## 2. Ownership SoT (XBOS catalog vs HRM tenant)

| Concern | Owner write | Owner read/consume | Forbidden |
|---------|-------------|--------------------|-----------|
| **Khung danh mục chức danh** `job_titles` (code/label) | XBOS catalog publish / group HR apply → HRM `settings-catalogs` effective | JD create: `position_code` picker | HRM invent free-text position as SoT (HRM-REC-JD-POS) |
| **Định nghĩa trường JD động** (type, label, required, default order, field_key) | **HRM Settings** per legal-entity scope (tenant CFG) — *không* XBOS platform hard-delete | JD create drag palette + form render + view | XBOS overwrite tenant field defs không qua apply path; FE hardcode field list |
| **Phạm vi pháp nhân** của field def | HRM CFG: `company_id` + optional `applies_to_company_ids[]` (member subset) | List palette scoped by JWT/`company_id` | Cross-tenant bleed; group CEO list id → detail 404 (`scope_parity`) |
| **Instance layout** (field_ids + order + section trên 1 JD / template draft) | HRM TXN — lưu cùng JD hoặc layout draft gắn `jd_id` | Create popup + View | Layout chỉ localStorage; mất sau F5 |
| **Giá trị trường JD** | HRM TXN trên JD master | View TopCV + YCTD reference display | Dual-write sang `job_postings` |
| **YCTD linkage** | HRM `job_requisitions.job_template_id` / logical `rec_recruitment_request.job_description_id` | Pipeline REC | Ngừng JD → xóa cứng / orphan FK silent |
| **Platform catalog rows** (nếu SA chọn publish field skeleton từ XBOS) | XBOS publish → HRM pull **optional GĐ2** | HRM may extend labels/required locally | Tenant hard-delete platform-locked keys |

**Decision lock (ba-data default for SA):**

- **Option A (recommended MVP):** Field-definition catalog = **HRM tenant CFG** (`rec_jd_field_def`), legal-entity scoped — mirrors sponsor “Cài đặt”. XBOS only owns `job_titles` / org catalogs already in ladder.
- **Option B (GĐ2):** XBOS publishes **skeleton** field keys (`jd_field_skeleton`) → HRM pull + tenant override `required`/`label`/`order`. SA must ADR if sponsor wants group-wide field kit.

---

## 3. Domain map (entities · relationships · lifecycle)

```text
rec_jd_field_def (CFG) ──N──◄ palette
        │
        │ drag into
        ▼
rec_jd_form_layout (TXN/CFG draft) ── items(field_id, section, sort_order)
        │
        │ bind values
        ▼
rec_job_description / job_description_templates (TXN master)
        │  values_json[field_id] + layout_snapshot
        │
        └── soft FK ──► job_requisitions / rec_recruitment_request (YCTD)
```

### 3.1 Entity catalog

| Logical entity | Class | PK | Scope key | AS-IS alias |
|----------------|-------|-----|-----------|-------------|
| **E-JD-FIELD-DEF** `rec_jd_field_def` | CFG | `id` UUID | `company_id` TEXT | *(new)* |
| **E-JD-LAYOUT** `rec_jd_form_layout` | CFG/TXN | `id` UUID | `company_id` | *(new)* — 1 active layout per company **or** per JD draft (SA pick) |
| **E-JD-LAYOUT-ITEM** `rec_jd_form_layout_item` | CFG/TXN | `id` UUID | denorm `company_id` | *(new)* |
| **E-JD-MASTER** `rec_job_description` | TXN | `id` UUID | `company_id` | `job_description_templates` |
| **E-JD-VALUE** (embedded) | TXN | — | — | `values_json` on master (+ optional snapshot columns) |
| **E-YCTD** | TXN | `id` | `company_id` | `job_requisitions` |

### 3.2 `rec_jd_field_def` — Catalog định nghĩa trường (Settings)

| Column | Type | Null | Rule |
|--------|------|------|------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | Legal-entity / ops slug — **same resolver** list↔get |
| `field_key` | text | NO | Stable key snake_case; UQ `(company_id, field_key)` WHERE `archived_at IS NULL` |
| `label` | text | NO | UI label vi-VN |
| `field_type` | text | NO | enum §3.5 |
| `is_required` | boolean | NO | Default false; system title always true |
| `sort_order` | int | NO | Default palette order in Settings |
| `section_hint` | text | YES | Optional default section: `hero`\|`summary`\|`responsibilities`\|`requirements`\|`benefits`\|`other` |
| `applies_to_company_ids` | jsonb | YES | NULL = all under writer scope; else member slug allow-list |
| `validation_json` | jsonb | YES | type-specific: maxLen, min, max, options[], pattern |
| `is_system` | boolean | NO | `true` = locked keys (`title`, …) — không xóa, có thể ẩn? **no** for title |
| `is_active` | boolean | NO | Inactive = hidden from drag palette; existing JD values retained |
| `archived_at` | timestamptz | YES | Soft-delete |
| `created_at` / `updated_at` | timestamptz | NO | Audit |
| `created_by` / `updated_by` | text/uuid | YES | Audit |

**System-locked fields (must_keep title-first):**

| field_key | type | required | section | Note |
|-----------|------|----------|---------|------|
| `title` | `short_text` | YES | `hero` | Sponsor: **trường tiêu đề đầu tiên** trên popup thêm mới |
| `code` | `short_text` | YES | `hero` | UQ per company; FR-UC-BP-REC-00 |
| `position_code` | `catalog_ref` | YES | `hero` | Ref `job_titles` — FR-HRM-RC-JD-01 |
| `status` | `enum` | YES | meta | draft\|active\|retired (logical) / `is_active` AS-IS bridge |

### 3.3 `rec_jd_form_layout` + items — Instance layout (kéo-thả)

| Column (layout) | Type | Null | Rule |
|-----------------|------|------|------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | Scope |
| `name` | text | NO | e.g. «Layout mặc định JD» |
| `is_default` | boolean | NO | ≤1 default active per `company_id` |
| `status` | text | NO | draft\|published |
| `archived_at` | timestamptz | YES | Soft |

| Column (item) | Type | Null | Rule |
|---------------|------|------|------|
| `id` | uuid | NO | PK |
| `layout_id` | uuid | NO | FK → layout |
| `field_id` | uuid | NO | FK → `rec_jd_field_def.id` |
| `section` | text | NO | Render section (§3.5 sections) |
| `sort_order` | int | NO | Order **within section**; title must be min order in `hero` |
| `company_id` | text | NO | Denorm scope_parity |

**Persist contract (create JD drag):** FE submits ordered `layout_items[]` = `{ field_id, section, sort_order }[]`. Server validates every `field_id` ∈ active defs in scope; rejects unknown / inactive / out-of-scope.

**SA choice stub:**  
- **L1:** company default layout only (Settings publishes layout; create JD clones snapshot).  
- **L2:** per-JD layout override stored on master (`layout_snapshot_json`).  
**ba-data recommendation:** **L1 + layout_snapshot on save** (immutable render if defs later change).

### 3.4 JD master payload + render view

**Write payload (logical create/update JD):**

```json
{
  "company_id": "holding",
  "code": "JD-OPS-01",
  "title": "Chuyên viên vận hành",
  "position_code": "CHRO",
  "status": "draft",
  "layout_snapshot": [
    { "field_id": "…", "field_key": "title", "section": "hero", "sort_order": 0, "label": "Tiêu đề", "field_type": "short_text", "is_required": true },
    { "field_id": "…", "field_key": "responsibilities", "section": "responsibilities", "sort_order": 0, "label": "Trách nhiệm", "field_type": "rich_text", "is_required": true }
  ],
  "values": {
    "title": "Chuyên viên vận hành",
    "code": "JD-OPS-01",
    "position_code": "CHRO",
    "responsibilities": "<p>…</p>",
    "requirements": "<p>…</p>",
    "benefits": ""
  }
}
```

**Persist mapping AS-IS bridge (ADD-only until migrate):**

| Logical | AS-IS column | Notes |
|---------|--------------|-------|
| `title` / `code` / `position_code` | same columns | Keep for list/search + FR-HRM-RC-JD-01 |
| `values.responsibilities` or legacy body | `job_description` | Bridge: if `values_json` absent, FE reads text columns |
| `values.requirements` | `requirements` | Same bridge |
| full dynamic | **NEW** `values_json` JSONB | SA DDL |
| layout used at save | **NEW** `layout_snapshot_json` JSONB | Render SoT for view |
| status | `is_active` ↔ active/retired bridge | Logical status enum in DB_DESIGN |

**Render view (TopCV-like — data only):**

| Section | Source | Display rule |
|---------|--------|--------------|
| Hero | `title` (+ optional logo company from tenant branding — UI P0 separate) | Title-first; empty title = invalid |
| Meta chips | `position_code`→label, grade, employment_type if present | Catalog label resolve; never raw key alone in UI (display-label rule) |
| Body blocks | `layout_snapshot` ordered by `section`,`sort_order` | Skip empty optional; show "—" only if required missing (should not publish) |
| YCTD strip | count / link via `job_template_id` | Read-only; retired JD still shows history |

### 3.5 Enums

**`field_type` (closed MVP):**

| Value | Value shape | validation_json keys |
|-------|-------------|----------------------|
| `short_text` | string | `maxLen` ≤ 200 |
| `long_text` | string | `maxLen` ≤ 5000 |
| `rich_text` | HTML/string sanitized | `maxLen` ≤ 20000 |
| `number` | number | `min`,`max` |
| `enum` | string ∈ options | `options: string[]` |
| `multi_enum` | string[] | `options` |
| `catalog_ref` | code string | `catalog_key` (e.g. `job_titles`) |
| `date` | ISO date | — |
| `boolean` | boolean | — |

**`section` (closed MVP — TopCV hierarchy, not creative brand):**  
`hero` | `summary` | `responsibilities` | `requirements` | `benefits` | `other` | `meta`

### 3.6 Lifecycle

| Entity | States | Legal transitions | Invalid |
|--------|--------|-------------------|---------|
| Field def | active ↔ inactive → archived | Soft archive only if no **required** layout item on published default **or** force inactive first | Hard delete; archive system `title`/`code`/`position_code` |
| Layout | draft → published; published → draft (revise) | Publish requires `title` item order 0 in `hero` | Publish missing required system fields |
| JD master | draft → active → retired | YCTD may reference active; retired blocked for **new** YCTD | Delete JD with YCTD FK; mutate `code` after active without audit (SA: allow only draft) |

---

## 4. Data interaction matrix (CRUD / transition)

| Actor surface | Create | Read | Update | Delete/transition |
|---------------|--------|------|--------|-------------------|
| Settings — field defs | POST def | GET list/detail scoped | PATCH label/required/order/type* | Soft archive / deactivate |
| Settings — default layout | PUT items drag result | GET default | Reorder / add / remove items | Unpublish |
| Thư viện JD — create popup | POST JD + values + layout_snapshot | — | — | — |
| Thư viện JD — edit / view | — | GET by id (+snapshot) | PATCH values / status | Retire |
| YCTD | Select active JD id | Resolve template fields read-only | Soft `job_template_id` | Cannot select retired |

\*Changing `field_type` after values exist → **reject** or version new `field_key` (VAL-JD-12).

---

## 5. Validation matrix

| ID | Condition | Rule | Expected result | Error code (stub) |
|----|-----------|------|-----------------|-------------------|
| VAL-JD-01 | Create field def missing `label`/`field_key`/`field_type` | Required | **400** | `HRM-JD-FIELD-VAL` |
| VAL-JD-02 | Duplicate `field_key` same `company_id` active | UQ | **409** | `HRM-JD-FIELD-DUP` |
| VAL-JD-03 | `field_type` ∉ enum | Closed set | **400** | `HRM-JD-FIELD-TYPE` |
| VAL-JD-04 | Archive/deactivate system field (`title`,`code`,`position_code`) | Forbidden | **400** | `HRM-JD-FIELD-SYSTEM` |
| VAL-JD-05 | Layout item references unknown/inactive/out-of-scope `field_id` | FK + scope | **400** | `HRM-JD-LAYOUT-FIELD` |
| VAL-JD-06 | Published/default layout: no `title` in `hero` or sort_order ≠ first | Title-first | **400** | `HRM-JD-LAYOUT-TITLE` |
| VAL-JD-07 | Create JD: required field empty in `values` | Per def + snapshot | **400** | `HRM-JD-VAL-REQUIRED` |
| VAL-JD-08 | `position_code` not in effective `job_titles` | Catalog SoT | **400** | `HRM-REC-JD-POS` *(existing)* |
| VAL-JD-09 | Duplicate JD `code` active same company | UQ | **409** | `HRM-JD-CODE-DUP` |
| VAL-JD-10 | YCTD bind retired/inactive JD | Status gate | **400** | `HRM-JD-YCTD-STATUS` |
| VAL-JD-11 | `values` key not in `layout_snapshot.field_key` | Closed payload | **400** | `HRM-JD-VAL-UNKNOWN` |
| VAL-JD-12 | Change type of field with existing values | Immutable type | **409** | `HRM-JD-FIELD-TYPE-LOCK` |
| VAL-JD-13 | Member CEO writes def for other legal entity | Scope | **403/409** | scope mismatch *(existing ladder)* |
| VAL-JD-14 | List returns id; get-by-id different scope filter | **scope_parity** | Detail must **200** same resolver | Flag defect `scope_parity` |
| VAL-JD-15 | `catalog_ref` value fails catalog assert | Same as position | **400** | `HRM-JD-CAT-REF` |
| VAL-JD-16 | `rich_text` / `long_text` over maxLen | Cap | **400** | `HRM-JD-VAL-LEN` |

---

## 6. Deterministic error envelope (FE/QA)

| Code | HTTP | When | FE recovery |
|------|------|------|-------------|
| `HRM-JD-FIELD-VAL` | 400 | Def payload incomplete | Highlight Settings form |
| `HRM-JD-FIELD-DUP` | 409 | Duplicate key | Ask rename `field_key` |
| `HRM-JD-LAYOUT-TITLE` | 400 | Drag removed title / not first | Auto-pin title; block save |
| `HRM-JD-VAL-REQUIRED` | 400 | Create/publish JD | Focus first missing field |
| `HRM-REC-JD-POS` | 400 | Invent position | Catalog picker only |
| `HRM-JD-YCTD-STATUS` | 400 | Pick retired JD | Filter active only |
| scope 409 | 409 | `companyId` ≠ token | Fix membership / slug |

Envelope: existing HRM `{ code, message, details? }` — SA must not invent parallel shape.

---

## 7. API field map stub (for SA TechSpec / API_DESIGN)

> Paths are **stubs** — SA locks final OpenAPI. Prefer nest under `/api/hrm/recruitment/…` + Settings catalogs family **or** dedicated JD-settings controller.

| F-id | Method / path (stub) | Mục đích | SRS bước | Request → DB | Response |
|------|----------------------|----------|----------|--------------|----------|
| F-JD-DEF-01 | `GET /settings/jd-field-defs?company_id=` | Palette + Settings list | FR-UC-BP-REC-00 #1 | → `rec_jd_field_def` scoped | items[] |
| F-JD-DEF-02 | `POST /settings/jd-field-defs` | Tạo trường động | Settings | body §3.2 → insert | 201 + id |
| F-JD-DEF-03 | `PATCH /settings/jd-field-defs/:id` | Sửa label/required/order | Settings | patch cols | 200 |
| F-JD-DEF-04 | `POST …/:id/archive` | Soft archive | Settings | `archived_at` | 200 |
| F-JD-LAY-01 | `GET /settings/jd-layouts/default?company_id=` | Layout kéo-thả SoT | Create JD open | layout+items | 200 |
| F-JD-LAY-02 | `PUT /settings/jd-layouts/default` | Persist drag order | Settings / builder | replace items | 200 |
| F-JD-01 | `GET /recruitment/job-templates` *(AS-IS)* | List JD library | FR-00 #1 | `job_description_templates` | list |
| F-JD-02 | `POST /recruitment/job-templates` | Create JD + values + snapshot | FR-00 #2 | bridge cols + JSONB | 201 `HRM-REC-JD-201` |
| F-JD-03 | `GET /recruitment/job-templates/:id` | Detail + render model | View TopCV | same scope as list | 200 |
| F-JD-04 | `PATCH /recruitment/job-templates/:id` | Update values/status | FR-00 #2–3 | | 200 |
| F-YCTD-JD | `POST/PATCH …/requisitions` + `job_template_id` | Gắn JD → YCTD | FR-00 #4 | soft FK | 2xx |

**List↔detail scope_parity:** `F-JD-01` and `F-JD-03` **must** call identical `resolveHrmListScope` / company filter (U19). Journey stub: **J-HRM-JD-01** list→detail→F5; **J-HRM-JD-02** Settings def→create JD drag→view.

**DTO stub fields:**

| DTO | Fields |
|-----|--------|
| `CreateJdFieldDefDto` | `company_id`, `field_key`, `label`, `field_type`, `is_required?`, `sort_order?`, `section_hint?`, `validation_json?`, `applies_to_company_ids?` |
| `PutJdLayoutDto` | `company_id`, `items: { field_id, section, sort_order }[]` |
| `CreateJobTemplateDto` *(extend)* | AS-IS + `layout_snapshot?`, `values?` (object) — keep `position_code` required |

---

## 8. Traceability matrix

| Req | API stub | DB | FE surface | Test / UF expectation |
|-----|----------|-----|------------|------------------------|
| FR-UC-BP-REC-00 create JD | F-JD-02 | `job_description_templates` + JSONB | Thư viện JD · popup title-first | Create→201→F5 row; view sections ordered |
| FR-UC-BP-REC-00 YCTD link | F-YCTD-JD | `job_requisitions.job_template_id` | YCTD picker active JD | VAL-JD-10 |
| FR-HRM-RC-JD-01 position | F-JD-02 | `position_code` | job_titles picker | invent → `HRM-REC-JD-POS` |
| BR-BP-JD-01 one SoT description | F-JD-01..04 | JD master not `job_postings` | — | Lane B forbidden assert |
| Sponsor dynamic settings | F-JD-DEF-* | `rec_jd_field_def` | Cài đặt HRM | Def→palette visible |
| Sponsor drag layout | F-JD-LAY-* | layout + snapshot | Create JD builder | Persist + F5 |
| Sponsor view TopCV-like | F-JD-03 | `layout_snapshot_json`+`values_json` | View JD | Section hierarchy; no creative brand |
| U19 scope_parity | F-JD-01/03 | `company_id` TEXT | deep link | list id → detail 200 under `main` |
| must_keep YCTD | — | soft FK | — | Retire ≠ hard delete |

**Logical ↔ physical alias (for DB_DESIGN delta):**

| Logical (DB_DESIGN) | Physical AS-IS | Dynamic ADD |
|---------------------|----------------|-------------|
| `rec_job_description` | `job_description_templates` | + `values_json`, `layout_snapshot_json` |
| *(new)* field/layout tables | — | `rec_jd_field_def`, `rec_jd_form_layout*` |
| `rec_recruitment_request.job_description_id` | `job_requisitions.job_template_id` | keep soft TEXT/UUID align in SA |

---

## 9. Risks & mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dual Lane B `job_postings` confusion | Wrong SoT | must_keep F1–F10 lock; tests assert JD APIs only on templates |
| Def change breaks old JD view | Empty/mislabel | **layout_snapshot** + label snapshot at save |
| XBOS vs HRM dual write field defs | Drift | Option A MVP HRM-only; Option B needs ADR |
| `company_id` UUID legacy migration vs TEXT slug | 409/empty | Follow Nest TEXT slug; scope_parity tests |
| Rich text XSS | Security | Sanitize on write; FE render policy SA/TM |
| Over-scope creative TopCV | Brand drift | `creative_extra=none`; sections enum closed |

---

## 10. Residual (after SPEC align)

| ID | Item | Owner | Status |
|----|------|-------|--------|
| R-JD-DATA-01 | Confirm Option A vs B ownership (field skeleton XBOS) | sa · pm | OPEN — ba-data default vẫn Option A |
| R-JD-DATA-02 | Physical DDL + migrate AS-IS → JSONB / new tables | sa → later dev-be | OPEN |
| R-JD-DATA-03 | Merge SPEC AC ↔ VAL-JD-* | ba-data | **CLOSED** §12.3 |
| R-JD-DATA-04 | Journey IDs vào `PROGRAM_JOURNEY_MAP.md` | pm | OPEN — IDs locked in DATA+SPEC; map file chưa |
| R-JD-DATA-05 | D7 rename `rec_*` vs Nest names | pm | OPEN |
| R-JD-DATA-A2 | Layout global vs per-JD | ba-data | **LOCKED** §12.5 — SA ADR-ack |
| R-JD-DATA-Q2 | Select catalog source allowlist | ba-data | **LOCKED** §12.6 — SA ADR-ack |

---

## 11. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `sa` / `pm` synth (SPEC+DATA → ARCH) |
| **evidence** | this file (§12) · `docs/qa/evidence/po-hrm-jd-dynamic-data-01.md` |
| **Dev** | **HOLD** until ARCH + sponsor confirm SRS delta |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-DYNAMIC-ARCH-01
role: sa
read_first:
  - docs/program/slices/PO-HRM-JD-DYNAMIC-TOPCV.md
  - docs/program/specs/PO-HRM-JD-DYNAMIC-SPEC-01.md (READY — UC-00a/b/c · BR-BP-JD-DYN-01..08 · J-HRM-JD-01..03)
  - docs/program/specs/PO-HRM-JD-DYNAMIC-DATA-01.md (§12 ALIGNED-SPEC · A2/Q2 data-lock)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md § FR-UC-BP-REC-00
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §2.1
  - AS-IS: apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts job_description_templates
entry_criteria: SPEC-01 READY + DATA-01 ALIGNED-SPEC (§12)
exit_criteria:
  - ADR-ack DATA locks: A2 global layout + JD layout_snapshot/layout_version; Q2 select allowlist
  - TechSpec/ADR: Option A (HRM tenant field defs) vs B (XBOS skeleton) — default A unless sponsor
  - API_DESIGN F.1 F-JD-DEF/LAY/01-04 map UC-00a/b/c Diễn biến + AC-JD-DYN-*
  - DB_DESIGN delta: jd_field_catalog≡rec_jd_field_def + layout + values_json + layout_snapshot_json + layout_version
  - scope_parity list↔get; must_keep YCTD soft FK + FR-HRM-RC-JD-01; BR-BP-JD-DYN-08 no mix LE
  - no apps/** code
evidence_path: docs/program/specs/PO-HRM-JD-DYNAMIC-ARCH-01.md
ack_status: PASS_TO_PM
pm_note: optional same-session synth SPEC+DATA → PROGRAM_JOURNEY_MAP append J-HRM-JD-01..03 (R-JD-DATA-04)
```

---

## 12. DOC-DELTA — Align SPEC-01 READY (2026-08-06)

**change_mode:** ADD · **ref:** `PO-HRM-JD-DYNAMIC-SPEC-01.md`  
**closes:** R-JD-DATA-03 · A2/Q2 data-side · journey trace rows  
**does not:** apps/** · DDL · journey map file edit (pm)

### 12.1 Entity synonym (SPEC handoff §13 ↔ DATA §3)

| SPEC name | DATA logical | Class | UC primary |
|-----------|--------------|-------|------------|
| `jd_field_catalog` | `rec_jd_field_def` | CFG | UC-BP-REC-00a |
| `jd_form_layout` (+ items) | `rec_jd_form_layout` + `rec_jd_form_layout_item` | CFG | UC-BP-REC-00b |
| `job_description` / job_template values | `rec_job_description` / AS-IS `job_description_templates` + `values_json` | TXN | UC-BP-REC-00c |
| `layout_version` | **ADD column** on JD master: `layout_version` int NOT NULL DEFAULT 1 (bump when snapshot shape changes) | TXN | 00b/00c |
| `tenant/company_scope` | `company_id` TEXT + same list↔get resolver | — | BR-BP-JD-DYN-08 |
| soft-delete / status | field: `is_active` + `archived_at`; JD: draft\|active\|retired (`is_active` bridge) | — | DYN-01 · REC-00 |

### 12.2 UC → entity → API stub → BR → VAL

| UC / FR | Entities touch | API stub | BR | VAL-JD / notes |
|---------|----------------|----------|-----|----------------|
| **UC-BP-REC-00a** FR-00a | `rec_jd_field_def` | F-JD-DEF-01..04 | DYN-01 · DYN-07 | 01–04 · 12–13 · empty catalog = no palette (DYN-07) |
| **UC-BP-REC-00b** FR-00b | layout + items; clone → snapshot | F-JD-LAY-01..02 | DYN-02 · DYN-03 | 05–06 · inactive field reject · title forced index 0 |
| **UC-BP-REC-00c** FR-00c | JD master `values_json` + `layout_snapshot_json` + `layout_version` | F-JD-01..04 | DYN-02..06 · JD-01 | 07–11 · 14–16 · YCTD VAL-10 |
| Spine **FR-UC-BP-REC-00** | soft FK YCTD | F-YCTD-JD | JD-01 · DYN-05 · DYN-08 | must_keep; no Lane B |

### 12.3 BR-BP-JD-DYN-01..08 → data rule (deterministic)

| BR | Data rule | Expected invalid outcome |
|----|-----------|--------------------------|
| **DYN-01** | CRUD field def per `company_id`; soft-stop (`is_active=false`); **cấm** hard-delete nếu tồn tại `values_json` key / snapshot ref | **409** `HRM-JD-FIELD-INUSE` *(ADD code)* hoặc archive-only; VAL-JD-04 for system keys |
| **DYN-02** | Persist/normalize: item `field_key=title` (or `is_title=true`) **sort_order=0** in `hero` on every layout publish & every JD snapshot | **400** `HRM-JD-LAYOUT-TITLE` |
| **DYN-03** | Validate write = fields in snapshot ∩ catalog `is_active`; required flags from **snapshot copy** of `is_required` at save time | **400** `HRM-JD-VAL-REQUIRED` / `HRM-JD-LAYOUT-FIELD` |
| **DYN-04** | View model reads `layout_snapshot` sections — data supplies ordered blocks; FE must not flatten to single rigid table *(NFR UX — SA/FE)* | QA AC-JD-DYN-13 |
| **DYN-05** | YCTD bind only JD `status=active` (Hiệu lực); store id/code ref only — **no** copy full `values_json` | **400** `HRM-JD-YCTD-STATUS` |
| **DYN-06** | No data column for “brand theme”; reject unknown presentation keys in API body if present | Ignore/400 unknown keys — creative_extra=none |
| **DYN-07** | Empty catalog or empty layout items → block JD content save | **400** `HRM-JD-LAYOUT-EMPTY` *(ADD)*; FE empty+CTA |
| **DYN-08** | All CFG/TXN queries filter `company_id` with **identical** semantics list↔get-by-id | scope 403/409 / detail 404 under wrong LE = **scope_parity** defect |

**ADD validation rows (extend §5):**

| ID | Condition | Expected | Code |
|----|-----------|----------|------|
| VAL-JD-17 | Soft-stop field still on **new** layout publish | Reject attach inactive | `HRM-JD-LAYOUT-FIELD` |
| VAL-JD-18 | JD content save with zero layout items | Reject | `HRM-JD-LAYOUT-EMPTY` |
| VAL-JD-19 | Hard-delete field def with historical values | Reject | `HRM-JD-FIELD-INUSE` |
| VAL-JD-20 | `field_type=date` value not parseable to ISO date | Reject | `HRM-JD-VAL-DATE` |
| VAL-JD-21 | `field_type=select` + `source=catalog` code ∉ effective catalog | Reject | `HRM-JD-CAT-REF` / `HRM-REC-JD-POS` if `job_titles` |
| VAL-JD-22 | `select.catalog_key` ∉ allowlist §12.7 | Reject at def create | `HRM-JD-SELECT-SRC` |

### 12.4 AC-JD-DYN-* ↔ VAL / entity (QA feed)

| AC | VAL / entity assert | Journey |
|----|---------------------|---------|
| AC-01..05 | F-JD-DEF + VAL-01..04 · 17 · 19 · DYN-01/07 | **J-HRM-JD-01** |
| AC-06..08 | F-JD-LAY + VAL-05..06 · 17–18 · DYN-02/03/07 | **J-HRM-JD-02** (drag) |
| AC-09..12 | F-JD-02 + VAL-07..09 · 11 · 16 · DYN-02/03 | **J-HRM-JD-02** (save) |
| AC-13..14 | F-JD-03 snapshot sections · DYN-04/06 | **J-HRM-JD-03** |
| AC-15..16 | F-YCTD-JD + VAL-10 · DYN-05 · error≠fake empty | **J-HRM-JD-03** |

### 12.5 Journey L2.5 data trace (U19)

| Journey | Click path (SPEC) | List API | Detail / mutate API | Deep link / FE | scope_parity |
|---------|-------------------|----------|---------------------|----------------|--------------|
| **J-HRM-JD-01** | Login → Cài đặt → trường JD → Thêm → Lưu → F5 | F-JD-DEF-01 | F-JD-DEF-02/03 | Settings JD fields | list id → GET :id same `company_id` resolver |
| **J-HRM-JD-02** | Tuyển dụng → Thư viện JD → Thêm → kéo → nhập → Lưu → F5 | F-JD-01 + F-JD-LAY-01 | F-JD-LAY-02 · F-JD-02 | Recruitment JD library dialog | create returns id → GET detail 200 |
| **J-HRM-JD-03** | List JD → Xem → (opt) YCTD chọn JD hiệu lực | F-JD-01 | F-JD-03 · F-YCTD-JD | list→view; YCTD picker | view 404 on listed id = FAIL scope_parity |

### 12.6 DATA-LOCK — A2 (layout ownership)

| | Lock |
|---|------|
| **A2 resolution (ba-data)** | **(a) + snapshot override:** One **published default** `rec_jd_form_layout` per `company_id` (`is_default=true`). Create/edit JD **clones** items into `layout_snapshot_json` + increments/stores `layout_version`. Reorder inside JD dialog updates **snapshot only** unless user action «Đặt làm bố cục mặc định CT» → F-JD-LAY-02. |
| **Not MVP** | Live per-JD layout row as SoT without snapshot (breaks DYN-01 history when catalog changes). |
| **SA** | ADR-ack this lock; API must return display-ready layout+schema (SPEC §14 — no FE join invent). |

### 12.7 DATA-LOCK — Q2 (select / danh sách chọn source)

SPEC: *Danh sách chọn (khi có nguồn)* — ba-data khóa enum + nguồn.

**MVP `field_type` closed set (align SPEC §6.2):**

| SPEC label | Stored `field_type` | Value JSON | Notes |
|------------|---------------------|------------|-------|
| Văn bản ngắn | `short_text` | string | maxLen≤200 |
| Văn bản dài | `long_text` | string | maxLen≤5000; HTML optional via `validation_json.format=plain\|html` (default plain) |
| Danh sách chọn | `select` | string (code or option) | see source modes |
| Số | `number` | number | min/max |
| Ngày | `date` | ISO `yyyy-MM-dd` | **Display/entry** dd/MM/yyyy (UX lock); null→`—` |

Deprecate for MVP write (keep read-compat if earlier draft cited): `rich_text`→`long_text`+html · `enum`/`multi_enum`→`select` · `catalog_ref`→`select`+`source=catalog` · `boolean` = **OUT MVP** unless SA expands.

**`select` source modes (`validation_json`):**

| Mode | Shape | Rule |
|------|-------|------|
| `catalog` | `{ "source":"catalog", "catalog_key":"<storageKey>" }` | `catalog_key` ∈ **JD_SELECT_ALLOWLIST** below; value ∈ effective settings-catalog for that key + company scope |
| `static` | `{ "source":"static", "options":["…"] }` | Tenant-local options; **not** XBOS publish; options non-empty |

**JD_SELECT_ALLOWLIST (MVP — REC-relevant storageKeys only):**

| catalog_key | Typical JD use | Owner SoT |
|-------------|----------------|-----------|
| `job_titles` | Chức danh / position (**system field `position_code`**) | XBOS→HRM effective · FR-HRM-RC-JD-01 |
| `job_grades` | Cấp bậc | XBOS/HRM catalog |
| `employment_types` | Loại HĐ / hình thức | settings family |
| `departments` | Phòng ban (nếu field động) | settings family |
| `recruitment_channels` | Kênh (optional on JD) | settings family |

**Forbidden as JD select source (MVP):** `leave_types`, `pay_types`, `salary_components`, `payroll_templates`, `insurers`, `insurance_types`, `kpi_library`, `hr_decision_types`, `contract_types`, `shifts` — wrong pillar / noise.  
**Invent catalog_key** → VAL-JD-22 `HRM-JD-SELECT-SRC`.

### 12.8 field_type enum supersede note (§3.5)

§3.5 earlier draft enum is **narrowed by §12.7** for MVP. SA/DB_DESIGN must implement §12.7 as SoT; §3.5 rows outside MVP = deferred.

### 12.9 Title system field (SPEC A1 — data note)

| field_key | is_system | is_title | Notes |
|-----------|-----------|----------|-------|
| `title` | true | true | Always layout index 0 (DYN-02); bootstrap config **≠** UAT evidence (U65) |
| `code` | true | false | Unique when Hiệu lực |
| `position_code` | true | false | `select`+`job_titles` |

---

*End DOC-DELTA §12 — DATA-01 ALIGNED-SPEC.*
