# PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01 — Physical DB · ADD checklist instance + HOLD LIVE DOC/ET/TOK (Option A · ba-data REQUIRED)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-18 seat **#20**) |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** Nest physical **`public.hrm_document_checklist_item`** (paper §3.5 gap **PROVEN**) · **HOLD / RETAIN** LIVE `public.emp_document_type` · `public.emp_employment_type` · `public.hrm_merge_tokens` (`emp.doc.*` / `emp.et.*`) · **NO** Nest `/core` table dual · **NO** Nest `emp_custom_field` · **NO** Nest `emp_position` · **NO** closed DOC enum · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — instance physical **ADD** locked · catalog DOC/ET/TOK **HOLD RETAIN** · unlock **sa API-01** `F-CORE-CHK-01` |
| **uc_ids** | `UC-BP-CORE-03` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · **R-PLT-EMP-01 IN-SCOPE** · physical gap **PROVEN** · EMP DOC L1 **`EMPPLATQA-MSIZXHIM`** · TOK **`EMPTOKQA-MSJ290VB`** · peer QC **`CORE02BQC1-MSLEFQC1`** / **`CORE09DQC1-MSLDR8I3`** must_keep |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-03-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-03-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01.md) · O1–O12 · AC-CORE-03-* · AC-PLT-EMP-02..06 / TOK · R-PLT-EMP-01 |
| **ref_emp_doc** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md) · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md) — **AC-PLT-EMP-02..06** · **R-PLT-EMP-01** |
| **ref_core02b_data** | [`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md) — EMP-CF HOLD · **≠** personnel / EMPCF DONE |
| **ref_core09d_data** | [`PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md) — open TPL+clause · **≠ printable / closed-8 DONE** |
| **ref_core09c_data** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md) — VER/PDF · **≠ printable UAT** |
| **ref_core09b_data** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md) — PACK+PREV ephemeral |
| **ref_core09a_data** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md) — CL body+snapshot |
| **ref_core08_data** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md) — dual RD + payroll_link |
| **ref_core02_data** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md) — packages/eins · AuthZ/CB-403 |
| **ref_core01_data** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md) — public strip · Nest `/core` DENY |
| **ref_paper_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) **§3.5** `hrm_document_checklist_item` · **§3.0a** `emp_document_type` · **§3.0b** `emp_employment_type` |
| **ref_paper_api** | **F-EMP-CAT-DOC-01/02** · **F-EMP-CAT-ET-01/02** · **F-EMP-CAT-EFF-01** · **F-EMP-TOK-01/02** · residual **F-CORE-CHK-01** · footnote F-CORE-CTR-01 checklist · must_keep **F-EMP-CF-*** / CTR TPL/VER/PDF/PACK/PREV/CL · CORE-08/02/01 · cite peer **F-CORE-ACT-01** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-03** · Diễn biến **#1–#2** · Bổ sung cấu hình · **BR-BP-DOC-01** · **BR-PLT-01/02/04/05** · peers CORE-02b..01 **must_keep** · CORE-04 OCR **OUT** · CORE-07 activate = peer |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR module UAT **false** · **C-SLICE** · U65 · **DENY** claim EMP DOC L1 = CORE-03 / personnel DONE · **DENY** claim CORE-02b = EMPCF / personnel DONE · **DENY** claim CORE-09d printable / closed-8 DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Checklist instance SoT | **ONE ADD** Nest **`public.hrm_document_checklist_item`** ↔ paper §3.5 · API alias `employee_document_checklist` = **same table** — **DENY** second store · **DENY** Nest `/core` checklist table |
| Gap vs §3.5 | **PROVEN ABSENT** — `apps/` grep **0** matches `document-checklist` / `hrm_document_checklist` (2026-08-09) · helper `assertDocumentTypeInEffectiveCatalog` exists **unwired** |
| DOC catalog SoT | **HOLD RETAIN** LIVE **`public.emp_document_type`** — cite `EMPPLATQA-MSIZXHIM` · **no** schema invent this seat |
| ET catalog SoT | **HOLD RETAIN** LIVE **`public.emp_employment_type`** — **no** invent |
| TOK spine | **HOLD RETAIN** LIVE **`public.hrm_merge_tokens`** `emp.doc.*` / `emp.et.*` `origin=emp_catalog` — cite `EMPTOKQA-MSJ290VB` · **orthogonal** CORE-02b EXT |
| Soft links | `employee_id` · `document_type_key` = **soft** text/UUID refs — **DENY hard FK GĐ1** (employees / emp_document_type) |
| Open key | `document_type_key` **TEXT** · format-only optional · **DENY** closed `CHECK … IN (starter)` |
| Status | `missing \| submitted \| approved` only (CHK) |
| Soft-delete | **`archived_at`** — **DENY** hard-delete as sole product path |
| Required default | Instance `required` **defaults from** catalog `required_by_default` on create / materialize — **DENY** FE starter hardcode |
| Nest path | Physical prefer **`/api/hrm/employees/:id/document-checklist*`** · paper `/api/hrm/core/…/document-checklist` = **alias only** |
| Position / dept | XBOS settings-catalogs — **DENY** Nest `emp_position` |
| CORE-02b EMP-CF | **must_keep** · stamp **`CORE02BQC1-MSLEFQC1`** · FE **`R-PLT-EMP-CF-FE-01` P2 HOLD** |
| CORE-09d..01 | **must_keep** · **DENY reopen** sealed J-* |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim EMP DOC L1 = CORE-03 DONE |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `hrm_document_checklist_item` §3.5 | **`public.hrm_document_checklist_item`** | **ADD** ONE instance SoT |
| `employee_document_checklist` (API_DESIGN map) | **same** `hrm_document_checklist_item` | Alias label — **DENY** dual table |
| `emp_document_type` §3.0a | **`public.emp_document_type`** | **HOLD RETAIN** |
| `emp_employment_type` §3.0b | **`public.emp_employment_type`** | **HOLD RETAIN** |
| Merge tokens DOC/ET | **`public.hrm_merge_tokens`** `emp.doc.*` / `emp.et.*` | **HOLD RETAIN** |
| `/api/hrm/core/…/document-checklist` | `/api/hrm/employees/:id/document-checklist*` | **Alias only** — API seat |
| Nest `emp_position` | — | **DENY** |
| Nest `emp_custom_field` / mega-EAV | — | **DENY** (CORE-02b must_keep) |
| Nest `/core` checklist / DOC table | — | **DENY invent** |

```text
  emp_document_type (LIVE — HOLD RETAIN catalog DOC SoT)
        RETAIN: id · company_id · document_type_key · name_vi · sort_order ·
                required_by_default · requires_expiry · blocks_activation ·
                is_identity_doc · allowed_mime_json · metadata_json ·
                status (active|retired) · archived_at · audit
        UQ:     (company_id, lower(document_type_key)) WHERE archived_at IS NULL
        DENY:   closed key CHECK IN (…) · hard-delete · wipe · Nest /core DOC table
                │
                │ F-EMP-TOK-01 same TX → emp.doc.<key>
                │ F-EMP-CAT-EFF-01 · assertDocumentTypeInEffectiveCatalog (wire residual)
                ▼
  hrm_document_checklist_item (ADD — paper §3.5 · gap PROVEN)
        ADD:    id · employee_id (soft→employees.id) · company_id ·
                document_type_key TEXT open · required ·
                status missing|submitted|approved · file_ref ·
                archived_at · created_at · updated_at
        DENY:   hard FK GĐ1 · closed key CHECK · Nest /core dual ·
                second checklist SoT · hard-delete sole
                │
                │ Display-ready list = instance cols + catalog enrich
                ▼
  Instance list DTO (API — not this seat code)
        documentTypeKey · nameVi (from DOC) · required ·
        requiredByDefault/blocksActivation/requiresExpiry (catalog flags) ·
        status · fileRef · optional token_key emp.doc.* display

  emp_employment_type + hrm_merge_tokens emp.et.* (LIVE — HOLD RETAIN)
        Orthogonal ET/TOK — no invent this seat

  CORE-02b EMP-CF · CORE-09d TPL+clause · 09c VER/PDF ≠ printable ·
  09b PREV ephemeral · 09a CL · 08 RD+payroll_link · 02 packages/AuthZ ·
  01 public · Nest /core DENY
        SEALED must_keep

  FORBIDDEN GĐ1 this seat:
        Invent/change LIVE emp_document_type / emp_employment_type / emp.doc|et TOK schema
        Nest @Controller('core') DOC/checklist SoT · Nest emp_position · Nest emp_custom_field
        Closed DOC enum · wipe EMP-CF · claim EMP DOC L1 = CORE-03/personnel DONE
        Claim CORE-02b = EMPCF/personnel DONE · claim CORE-09d printable/closed-8
        Reopen J-HRM-CORE-02B/09D/09C/09B/09A/08/02/01 · seed · honesty · apps/**
```

**Label lock:** «Checklist giấy tờ động» = **catalog DOC/ET/TOK RETAIN** + **instance ADD §3.5** — **not** catalog-only = Diễn biến #1–#2 DONE · **not** CORE-07 activate DONE.  
**Spine lock:** Physical `/employees/document-types*` · `/employment-types*` · residual `/employees/:id/document-checklist*` — **DENY** Nest `/core` dual.  
**Gap lock:** Instance table ABSENT → **ADD** (not HOLD forever) · catalog LIVE → **HOLD**.  
**Honesty lock:** EMP DOC L1 / TOK ≠ CORE-03 / personnel UAT · CORE-02b ≠ EMPCF DONE · CORE-09d ≠ printable / closed-8.

---

## 3. AS-IS baseline (Nest facts — read-only cite)

| Object | AS-IS LIVE | Gap (Wave-18 DATA) |
|--------|------------|---------------------|
| **`public.emp_document_type`** | `emp-document-type.service.ts` `ensureSchema`: UUID id · `company_id` · `document_type_key` TEXT · `name_vi` · `sort_order` · `required_by_default` · `requires_expiry` · `blocks_activation` · `is_identity_doc` · MIME/meta JSON · `status` active\|retired · `archived_at` · UQ active key · format CHECK slug only · **FORBIDDEN** closed IN | **HOLD RETAIN** — **no invent** |
| Display DOC | `EmpDocumentTypeDisplay`: `documentTypeKey` · `nameVi` · `sortOrder` · flags · `status` · `source` · `catalogKind` | **RETAIN** O11 |
| Assert helper | `assertDocumentTypeInEffectiveCatalog` — EFF=0 soft null · EFF>0 invent → **`HRM-EMP-DOC-TYPE-UNKNOWN`** | **RETAIN** · **wire** on checklist mutate (API) |
| **`public.emp_employment_type`** | LIVE ET catalog + dual REF∪tenant | **HOLD RETAIN** |
| **`public.hrm_merge_tokens`** | F-EMP-TOK-01/02 `emp.doc.*` / `emp.et.*` | **HOLD RETAIN** cite `EMPTOKQA-MSJ290VB` |
| Checklist Nest route | **ABSENT** (`document-checklist` **0** in `apps/`) | **ADD** physical + unlock API |
| Checklist Nest table | **ABSENT** (`hrm_document_checklist` **0** in `apps/`) | **ADD** `hrm_document_checklist_item` |
| Nest `/core` DOC/checklist | CoreModule = DB only · **no** `@Controller('core')` SoT | **DENY invent** |
| Position Nest | **ABSENT** as EMP SoT | **DENY** `emp_position` |

**FORBIDDEN invent this seat:** schema change on LIVE DOC/ET/TOK · Nest `/core` dual · Nest `emp_custom_field` · Nest `emp_position` · closed DOC enum · wipe EMP-CF · seed · honesty flip · apps/** · reopen sealed CORE-02b/09d..01.

---

## 4. ADD — `public.hrm_document_checklist_item` (normative physical)

### 4.1 Columns (paper §3.5 + soft-delete doctrine)

| Physical column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `id` | UUID PK | NO | `gen_random_uuid()` | Immutable |
| `employee_id` | UUID/TEXT | NO | — | Soft → `employees.id` · **DENY hard FK GĐ1** |
| `company_id` | TEXT | NO | — | = parent emp `company_id` · U19 scope |
| `document_type_key` | TEXT | NO | — | Open catalog key · format-only optional (`^[a-z][a-z0-9_]*$`) · **DENY** closed `IN (…)` |
| `required` | BOOLEAN | NO | **see §4.3** | Instance flag · defaults from catalog |
| `status` | TEXT | NO | `'missing'` | **CHK** `IN ('missing','submitted','approved')` |
| `file_ref` | TEXT | YES | NULL | Storage/object ref · not binary in row |
| `archived_at` | TIMESTAMPTZ | YES | NULL | Soft-delete · list default excludes archived |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Audit |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Audit |

**DENY ADD invent this seat (unless later BA proven):** hard FK · `document_type_id` UUID FK · closed starter enum · parallel Nest `/core` table · mega-EAV checklist · OCR payload columns (CORE-04 OUT).

### 4.2 Indexes / uniqueness (recommend)

| Object | Definition | Purpose |
|--------|------------|---------|
| IX company+employee | `(company_id, employee_id)` WHERE `archived_at IS NULL` | List by hồ sơ |
| IX status | `(company_id, employee_id, status)` partial active | Missing/submitted filters |
| UQ active key/emp | **Partial UQ** `(employee_id, lower(document_type_key)) WHERE archived_at IS NULL` | One active row per type per NV — soft-retire then re-open OK |
| Scope | Filter via `resolveHrmListScope` on `company_id` | U19 parity list↔get↔patch |

### 4.3 Required default from catalog flags (O2 · BR-CORE-03-FLAGS)

| Event | Rule | Expected |
|-------|------|----------|
| POST create / materialize from EFF catalog | `required := body.required ?? catalog.required_by_default` | Persist boolean · **DENY** FE hardcode starter set |
| Catalog `blocks_activation` / `requires_expiry` | **Not copied as instance columns GĐ1** — enrich display-ready from DOC join | ACT peer reads catalog flags + instance status |
| PATCH instance `required` | Explicit override OK (HCNS) | Does **not** rewrite catalog SoT |
| Soft-retire DOC | History checklist rows **keep** `document_type_key` · picker hides | **BR-PLT-04** · VAL-EMP-DOC-05 |

### 4.4 Lifecycle (instance)

| From → To | Legal? | Notes |
|-----------|--------|-------|
| (create) → `missing` | YES | Default |
| `missing` → `submitted` | YES | Diễn biến #1 · file_ref optional/required per MIME policy API |
| `submitted` → `approved` | YES | Diễn biến #2 confirm |
| `submitted` → `missing` | YES | Yêu cầu nộp lại |
| `approved` → `missing`/`submitted` | YES | Re-open / re-submit (HCNS) |
| Any → archived (`archived_at`) | YES | Soft-delete |
| Hard DELETE sole path | **NO** | Soft only |
| Invent key when EFF>0 | **NO** | **`HRM-EMP-DOC-TYPE-UNKNOWN`** |
| History row with retired DOC key | **YES read** | Mutate new key must ∈ EFF when EFF>0; retired key on existing row OK |

**Invalid-transition outcome:** API 4xx deterministic (sa API-01 mint) — **no** silent 2xx.

---

## 5. Display-ready columns (instance list + detail)

### 5.1 Instance SoT columns (bind from `hrm_document_checklist_item`)

| Display field | Physical | List | Detail |
|---------------|----------|------|--------|
| `id` | `id` | YES | YES |
| `employeeId` | `employee_id` | YES | YES |
| `companyId` | `company_id` | YES | YES |
| `documentTypeKey` | `document_type_key` | YES | YES |
| `required` | `required` | YES | YES |
| `status` | `status` | YES | YES |
| `fileRef` | `file_ref` | YES | YES |
| `archivedAt` | `archived_at` | soft rules | YES |
| `createdAt` / `updatedAt` | audit | optional | YES |

### 5.2 Catalog enrich (display-ready — **not** second SoT)

| Display field | Source | Rule |
|---------------|--------|------|
| `nameVi` / `documentTypeNameVi` | `emp_document_type.name_vi` by key (+ company scope) | Join/enrich · retired key → last known name or key fallback — **no** crash |
| `sortOrder` | catalog `sort_order` | List order prefer catalog then key |
| `requiredByDefault` | catalog `required_by_default` | Cite default provenance |
| `blocksActivation` | catalog `blocks_activation` | ACT peer display · **≠** claim CORE-07 DONE |
| `requiresExpiry` | catalog `requires_expiry` | Display |
| `catalogStatus` / `source` / `catalogKind` | DOC display | Optional picker/debug |
| `tokenKey` | `emp.doc.<key>` display | Optional · **RETAIN** TOK spine · **≠** invent TOK |

**Invariant CORE-03-DISP:** FE **MUST NOT** invent DOC catalog SoT from checklist DTO — flags/name come from LIVE DOC or null-safe fallback.

**Invariant CORE-03-REQ-DEFAULT:** New instance without explicit `required` → catalog `required_by_default` · FE starter closed list = **FAIL O2**.

---

## 6. HOLD — LIVE DOC / ET / TOK (no invent)

| Object | Decision | Cite |
|--------|----------|------|
| `emp_document_type` | **HOLD RETAIN** full schema + flags + soft-retire | `EMPPLATQA-MSIZXHIM` · F-EMP-CAT-DOC/EFF |
| `emp_employment_type` | **HOLD RETAIN** | F-EMP-CAT-ET/EFF |
| `hrm_merge_tokens` `emp.doc.*` / `emp.et.*` | **HOLD RETAIN** same-TX register | `EMPTOKQA-MSJ290VB` · F-EMP-TOK-01/02 |
| Assert helper | **HOLD** implementation · unlock **wire** on CHK API | BR-PLT-02 |
| Position/dept | XBOS REF **RETAIN** | AC-PLT-EMP-01* · **DENY** Nest `emp_position` |

**Conditional UNLOCK catalog schema:** **NOT** this seat — gap on DOC/ET/TOK **not** proven (already LIVE).

---

## 7. Validation matrix (data layer)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-CORE-CHK-01** | ADD ensureSchema | Table `hrm_document_checklist_item` with §4.1 cols | Persist path exists (after Dev) |
| **VAL-CORE-CHK-02** | status ∉ {missing,submitted,approved} | CHK | 4xx · no persist |
| **VAL-CORE-CHK-03** | Create with invent key · EFF DOC >0 | assert wire | **`HRM-EMP-DOC-TYPE-UNKNOWN`** · F5 no row |
| **VAL-CORE-CHK-04** | Create · omit `required` · catalog `required_by_default=true` | default | `required=true` persist |
| **VAL-CORE-CHK-05** | Create · omit `required` · catalog false | default | `required=false` |
| **VAL-CORE-CHK-06** | Duplicate active (emp, key) | Partial UQ | 4xx conflict class (API mint) |
| **VAL-CORE-CHK-07** | Soft-archive then recreate same key | UQ allows | New active row OK |
| **VAL-CORE-CHK-08** | Hard FK to employees / DOC | — | **FORBIDDEN GĐ1** |
| **VAL-CORE-CHK-09** | Closed `document_type_key IN (…)` | — | **FORBIDDEN** · FAIL O3 |
| **VAL-CORE-CHK-10** | Nest `/core` checklist table/controller SoT | — | **FORBIDDEN** · FAIL O1 |
| **VAL-CORE-CHK-11** | List vs get-by-id OOS emp | U19 scope_parity | 404/403 — not empty mask |
| **VAL-CORE-CHK-12** | History row retired DOC key | BR-PLT-04 | GET OK · picker hide |
| **VAL-CORE-CHK-13** | EFF=0 invent path | soft-allow documented | No fake KEY storm · U65 empty OK |
| **VAL-CORE-CHK-14** | Seed checklist for U65 | — | **FAIL U65** |
| **VAL-EMP-DOC-*** | Catalog DOC (HOLD) | RETAIN EMP-DATA-01 | No reopen invent |
| **VAL-CORE-03-MK-02B** | Diff EMP-CF | CORE-02b intact | No wipe |

---

## 8. Traceability (BRD/SRS → DB → API → FE → Test)

| Requirement | DB | API (next sa) | FE | Test / J-* |
|-------------|-----|---------------|----|------------|
| FR-UC-BP-CORE-03 Diễn biến #1 nộp | §4 ADD instance | **F-CORE-CHK-01** POST/PATCH | Checklist UI | **J-HRM-CORE-03-04** DRAFT |
| Diễn biến #2 xác nhận | `status` transitions | PATCH | Confirm / re-submit | **J-HRM-CORE-03-04** |
| Bổ sung cấu hình DOC | HOLD `emp_document_type` | F-EMP-CAT-DOC-* RETAIN | Settings | **J-HRM-CORE-03-01** · `EMPPLATQA-MSIZXHIM` |
| Flags required/optional | catalog + instance `required` | DOC-02 + CHK create default | Bind flags | **AC-CORE-03-02** |
| TOK emp.doc.* | HOLD merge_tokens | F-EMP-TOK-01 RETAIN | — | **J-HRM-CORE-03-02** · `EMPTOKQA-MSJ290VB` |
| Invent KEY | assert + key TEXT | wire assert | — | **J-HRM-CORE-03-03** · **AC-CORE-03-08** |
| Soft-retire DOC | HOLD archived_at DOC | retire RETAIN | picker hide | **J-HRM-CORE-03-05** |
| Position/dept | XBOS REF | unchanged | picker | **AC-CORE-03-05** |
| Activate đủ bắt buộc | flags + instance | **F-CORE-ACT-01** peer cite | — | **AC-CORE-03-09-OUT** ≠ DONE |
| BR-PLT-02 | key ∈ EFF | assert | — | VAL-CORE-CHK-03 |
| BR-PLT-05 open | no closed CHECK | — | — | VAL-CORE-CHK-09 |
| CORE-02b must_keep | HOLD EMP-CF DATA | F-EMP-CF-* | P2 HOLD | `CORE02BQC1-MSLEFQC1` |
| CORE-09d..01 must_keep | peer DATA | peer F-* | — | stamps · **≠** printable |
| Nest `/core` DENY | no dual table | physical `/employees/:id/…` | Network 0 | O1 |
| scope_parity U19 | company_id filter | list=get=patch | deep link | VAL-CORE-CHK-11 |

**scope_parity:** Checklist list under emp id **=** get/patch item under same `resolveHrmListScope` · group CEO `main` rollup must not 404 when list returned id.

---

## 9. Error / integrity mapping (RETAIN + residual)

| Physical / mutate fail | HTTP / code | Data outcome |
|------------------------|-------------|--------------|
| Invent `document_type_key` when EFF>0 | 4xx **`HRM-EMP-DOC-TYPE-UNKNOWN`** | **no** persist invent |
| Bad DOC key format (catalog path) | 4xx `HRM-PLT-CAT-CODE-INVALID` | RETAIN catalog |
| Active DOC key conflict | 4xx `HRM-PLT-CAT-CODE-CONFLICT` | RETAIN catalog |
| Scope mismatch | 409 `HRM-SCOPE-409` | **no** cross-CT |
| Invalid status | 4xx VAL (API mint) | **no** persist |
| Duplicate active emp+key | 4xx conflict (API mint) | **no** dual active |
| EFF=0 invent | soft-allow | documented · **no** seed |
| Soft-retire DOC | DOC `archived_at` + TOK soft | history checklist OK |
| Sealed CORE-*/CB-* | — | **DENY** rewrite |
| Success submit/confirm | 2xx | row status + file_ref · F5 còn |

---

## 10. DENY / must_keep / honesty

### DENY (this seat)

| Item | Why |
|------|-----|
| Invent/change LIVE `emp_document_type` / `emp_employment_type` / emp.doc\|et TOK schema | HOLD · already LIVE |
| Hard FK GĐ1 employee / DOC | Soft doctrine · paper EXPAND |
| Closed `document_type_key IN (…)` | O3 · BR-PLT-05 |
| Nest `/core` DOC or checklist table / `@Controller('core')` SoT | O1 dual-SoT FAIL |
| Nest `emp_position` | O5 · AC-PLT-EMP-01 |
| Nest `emp_custom_field` / mega-EAV / wipe EMP-CF | O8 · CORE-02b must_keep |
| Claim EMP DOC L1 / TOK = CORE-03 / personnel UAT DONE | O10 · C-SLICE |
| Claim CORE-02b = EMPCF / personnel DONE | O10 · `CORE02BQC1-MSLEFQC1` |
| Claim CORE-09d printable / closed-8 DONE | O10 · `CORE09DQC1-MSLDR8I3` |
| Claim catalog-only Settings = Diễn biến #1–#2 DONE | O6 · R-PLT-EMP-01 |
| Claim CORE-07 activate / OCR DONE | O9 OUT |
| Flip honesty ready flags | honesty lock |
| Reopen sealed J-HRM-CORE-02B/09D/09C/09B/09A/08/02/01 | seals |
| Seed checklist / catalog for U65 | U65 |
| `apps/**` / migrate run this seat | docs-only |

### must_keep RETAIN

| Stamp / surface | Retain |
|-----------------|--------|
| **`EMPPLATQA-MSIZXHIM`** | DOC catalog L1 · open + flags |
| **`EMPTOKQA-MSJ290VB`** | F-EMP-TOK-01/02 smoke |
| **`CORE02BQC1-MSLEFQC1`** | EMP-CF · Nest `/core` 0 · **≠** personnel · FE P2 HOLD |
| **`CORE09DQC1-MSLDR8I3`** | TPL+clause · **≠ printable** · **≠ closed-8 DONE** |
| **`CORE09CQC1-MSLBXMUT`** | VER/PDF · **≠ printable UAT** |
| **`CORE09BQC1-MSLB05DZ`** | PACK+PREV ephemeral |
| **`CORE09AQC1-MSLA4LX9`** | CL body + snapshot |
| **`CORE08QC1-MSL9BFFE`** | RD dual + payroll_link |
| **`CORE02QC1-MSL80DU6`** | packages/eins · AuthZ/CB-403 |
| **`CORE01QC1-MSL6WMS7`** | public strip · Nest `/core` DENY |
| LIVE DOC/ET/TOK | `/document-types*` · `/employment-types*` · merge_tokens |
| Soft-delete · U19 scope_parity | doctrine |
| Helper assert | wire residual only — **no** wipe |

### Honesty (LOCKED false)

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| **`contracts_printable_ready`** | **false** · **DENY** flip |
| **`hrm_personnel_uat_ready`** | **false** · **DENY** flip |
| personnel / CORE / CTR module UAT | **false** |
| **C-SLICE-≠-MODULE** | GWC later ≠ module UAT ≠ personnel ready |
| Claim EMP DOC L1 = CORE-03 / personnel DONE | **DENIED** |
| Claim CORE-02b = EMPCF / personnel DONE | **DENIED** |
| Claim CORE-09d printable / closed-8 DONE | **DENIED** |

---

## 11. Risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev invents Nest `/core` checklist dual | VAL-CORE-CHK-10 · O1 FAIL |
| Dev adds hard FK / closed DOC enum | VAL-CORE-CHK-08/09 · DENY |
| Dev mutates LIVE DOC/ET/TOK schema «while here» | §6 HOLD · DENY |
| FE hardcodes required starter | §4.3 · VAL-CORE-CHK-04/05 · O2 FAIL |
| Claim catalog L1 = instance DONE | O6 · honesty · R-PLT-EMP-01 residual until API+FE |
| Wire assert without table | This DATA unlocks table map first · API wires assert |
| Wipe EMP-CF / reopen 09d as printable | must_keep stamps · O8/O10 |
| Seed to pass invent KEY / checklist UF | VAL-CORE-CHK-14 · U65 |
| scope list≠get under `main` | VAL-CORE-CHK-11 · U19 |

---

## 12. Unlock next (governance)

| Next | Role | What |
|------|------|------|
| **`PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01`** | **sa** | **ADD/RETAIN** **F-CORE-CHK-01** prefer **`GET/POST/PATCH /api/hrm/employees/:id/document-checklist*`** · wire **`assertDocumentTypeInEffectiveCatalog`** when EFF>0 → **`HRM-EMP-DOC-TYPE-UNKNOWN`** · DTO↔DB from DATA-01 §4–§5 · display-ready enrich · paper `/core` alias only · **RETAIN cite** F-EMP-CAT-DOC/ET/EFF · F-EMP-TOK-01/02 · **DENY** Nest `/core` dual · Nest `emp_position` · Nest `emp_custom_field` · closed DOC enum · must_keep CORE-02b..01 — **not** Dev invent |
| Dev-BE / Dev-FE | **HOLD** | Until API-01 CONFIRMED |
| QA / QC | After FE | J-HRM-CORE-03-01..05 · C-SLICE · honesty false · cite EMP DOC/TOK · **≠** claim personnel DONE |

---

## 13. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Physical DATA **CONFIRMED** for UC-BP-CORE-03: **ADD** Nest **`public.hrm_document_checklist_item`** per paper §3.5 (`employee_id` · `company_id` · `document_type_key` TEXT open · `required` · `status` missing\|submitted\|approved · `file_ref` · soft `archived_at`) — **DENY** hard FK GĐ1 · closed key CHECK · Nest `/core` table dual; **HOLD RETAIN** LIVE `emp_document_type` / `emp_employment_type` / `hrm_merge_tokens` emp.doc\|et (`EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB`); cite display-ready instance list + **`required` default from `required_by_default`**; **must_keep** CORE-02b EMP-CF · CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · Nest `/core` DENY; **DENY** wipe EMP-CF · Nest `emp_custom_field` · Nest `emp_position` · closed DOC enum · claim EMP DOC L1=CORE-03/personnel DONE · claim CORE-02b=EMPCF/personnel DONE · claim CORE-09d printable/closed-8 · honesty flip · reopen J-HRM-CORE-02B/09D/09C/09B/09A/08/02/01 · seed · apps/**; unlock **sa API-01** residual **F-CORE-CHK-01** — **not** Dev. |
| **next_owner** | **sa** |
| **next_dispatch_prompt** | see §14 |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md` · `docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-data-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 14. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-03
depends_on: DATA-01 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA-01 Option A · R-PLT-EMP-01 · EMPPLATQA-MSIZXHIM · EMPTOKQA-MSJ290VB · peer CORE02BQC1-MSLEFQC1 · CORE09DQC1-MSLDR8I3 must_keep
spec_ref: F-CORE-CHK-01 ADD · F-EMP-CAT-DOC/ET/EFF RETAIN · F-EMP-TOK-01/02 RETAIN · assertDocumentTypeInEffectiveCatalog wire · physical /api/hrm/employees/:id/document-checklist* · paper /core alias only · DTO↔DB DATA-01 §4–§5 · Nest /core DENY · Nest emp_position DENY · Nest emp_custom_field DENY

MISSION — API F.1 lock (docs-only · residual CHK):
1) ADD F-CORE-CHK-01 — Mục đích + Nghiệp vụ xử lý + Tham chiếu bước SRS Diễn biến #1–#2 — prefer GET/POST/PATCH /api/hrm/employees/:id/document-checklist* on public.hrm_document_checklist_item; statuses missing|submitted|approved; soft archived_at; required default from catalog required_by_default; display-ready enrich nameVi + flags; U19 list=get=patch
2) Wire assertDocumentTypeInEffectiveCatalog when EFF>0 → HRM-EMP-DOC-TYPE-UNKNOWN; history retired keys OK; EFF=0 soft-allow documented; DENY closed DOC enum · DENY Nest /core dual SoT
3) RETAIN cite F-EMP-CAT-DOC-01/02 · F-EMP-CAT-ET-01/02 · F-EMP-CAT-EFF-01 · F-EMP-TOK-01/02 — HOLD no invent rewrite; paper /core alias only
4) RETAIN must_keep CORE-02b EMP-CF · CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · Nest /core DENY · F-CORE-ACT-01 peer cite OUT invent DONE
5) DENY wipe EMP-CF · Nest emp_custom_field · Nest emp_position · claim EMP DOC L1 = CORE-03/personnel DONE · claim CORE-02b = EMPCF/personnel DONE · claim CORE-09d printable/closed-8 · honesty flip · reopen J-HRM-CORE-02B/09D/09C/09B/09A/08/02/01 · seed · apps/**
6) Unlock next: Dev-BE + Dev-FE HOLD until API CONFIRMED — not before

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md · PASS_TO_PM · next Dev HOLD
```
