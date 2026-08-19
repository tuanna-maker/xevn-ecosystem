# PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01 — API_DESIGN F.1 · DEC / QSĐ catalog (Option B roll-out)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** F-DEC-CAT-TYP-* · F-DEC-CAT-EFF-* · **EXPAND** F-CORE-DEC-01/02 consumer validate · **DOC-DELTA** client API/DB · **NO CODE** `apps/**` · **no seed** · **no wipe** decisions WH spine · **no wipe** EMP DOC/ET L1 SEAL · **no absorb** CTR `contract_types` |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — Option **B** roll to **Decisions / QSĐ** vertical (`hr_decision_types` open catalog) · cite F-PLT-TOK / ATT-VERTICAL / REC-VERTICAL / EMP-VERTICAL pattern · closes EMP residual **L-EMP-CAT-06 / R-PLT-EMP-05** |
| **prior** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md) OUT GĐ1 → **GĐ1.5 this seat** |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1–L7 · §7 Employees/NS (extension catalogs) — **DEC types = Catalog deepen under Decisions consumer** |
| **ref_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md) F-PLT-TOK · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md) §2 dual SoT · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md) system flags · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md) · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) `ICatalogRow` · R-PLT-DATA-04 |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.1 «Loại QSĐ / quyết định» Catalog + Schema · BR-PLT-02/04/05/06 · parallel **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01`** |
| **ref_e2e** | [`PO-HRM-E2E-LINK-EMP-SA-01.md`](./PO-HRM-E2E-LINK-EMP-SA-01.md) **F-CORE-DEC-01/02** · WH soft FK — **must_keep** |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-CORE-01a** · BR-BP-DEC-EMP-01 · AC-DEC-WH-* · AC-DEC-EMP-01 |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.11 `hr_decisions.decision_type` · §3.9 WH `decision_id` · **no** `hr_decision_type` physical yet |
| **ref_api** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) F-CORE-DEC pointer · settings-catalogs family `decision_types` / storage `hr_decision_types` |
| **ref_as_is** | Nest: `HRM_SC_DEC_KEY` / `HRM_SC_DEC_STORAGE_KEY` · `assertCodeInEffectiveCatalog` · hardcoded `PERSON_BOUND_DECISION_TYPES` / `WORK_HISTORY_NEO_DECISION_TYPES` (HRD_* + legacy) — **to be replaced by catalog flags after BE** |
| **Honesty** | No decisions / personnel / EMP / ATT / REC / PAY UAT flip · all ready flags **false** · U65 |
| **must_keep** | Decisions TXN spine F-CORE-DEC-01/02 + WH · EMP DOC/ET L1 SEAL · ATT leave / REC stages sealed · CTR `contract_types` OUT · position/dept XBOS REF · soft-delete · scope_parity U19 |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Objective & locks

Roll **Platform Option B** to **Decisions / QSĐ vertical GĐ1 Catalog**: **decision types** (`hr_decision_types` / `decision_types`) as open `ICatalogRow` — same F.1 depth as **F-PLT-TOK** / **F-ATT-CAT-LVT-*** / **F-REC-CAT-STG-*** / **F-EMP-CAT-DOC|ET-***. **Unlock ba-data physical** — **no** `apps/**` here.

| Lock | Rule |
|------|------|
| **L-DEC-CAT-01 Open decision types** | `decision_type_key` = **open catalog** per company — starter (`appointment`, `transfer`, `HRD_01`…`HRD_03`, …) = **bootstrap examples only** — **not** closed enum (**BR-PLT-05** · DYNAMIC-LOCK). **FORBIDDEN** `CHECK (decision_type IN (...))` ceiling on catalog **or** on `hr_decisions.decision_type` after catalog >0 |
| **L-DEC-CAT-02 Dual SoT** | **Group REF** settings-catalogs / catalog-sync family **`decision_types`** (aliases · storageKey **`hr_decision_types`**) (XBOS publish) **≠** DEC CFG writer **`hr_decision_type`** — effective union; **tenant row wins** on key collision (**BR-PLT-06** · ATT `leave_types` / EMP `employment_types` peer) |
| **L-DEC-CAT-03 System flags (replace hardcoded Sets)** | Typed flags on catalog row: `is_person_bound`, `writes_work_history`, `wh_event_type`, `requires_position_key` — F-CORE-DEC-01/02 remain **code-deterministic via flags** — **FORBIDDEN** permanent FE/Nest closed `Set(['appointment','hrd_01'…])` as SoT after catalog live |
| **L-DEC-CAT-04 Decisions spine must_keep** | **F-CORE-DEC-01/02** · `hr_decisions` ONE SoT · WH `decision_id` soft FK UPSERT on effective — **FORBIDDEN** redesign / dual decision table / seed QSĐ for UF |
| **L-DEC-CAT-05 Contract types OUT** | `contract_types` / HĐ packs = **CTR** domain — **FORBIDDEN** absorb into DEC |
| **L-DEC-CAT-06 EMP/ATT/REC sealed** | **FORBIDDEN** wipe EMP DOC/ET L1 SEAL · ATT leave-types · REC pipeline-stages this seat |
| **L-DEC-CAT-07 Consumer SoT** | When effective catalog **>0**: create/patch QSĐ `decision_type` **must** ∈ catalog (**BR-PLT-02** · preserve VAL-SET-MD-03 / HRM_SC_DEC class) — free-text **4xx** |
| **L-DEC-CAT-08 Soft-delete** | Retire = `status=retired` + `archived_at` — history FK / past `hr_decisions.decision_type` intact (**BR-PLT-04**) — **FORBIDDEN** hard-delete |
| **L-DEC-CAT-09 Scope** | list ↔ get-by-id ↔ mutate = `resolveHrmListScope` + `assertResourceInHrmScope` (**U19**) |
| **L-DEC-CAT-10 FormSchema OUT GĐ1** | Type-specific QSĐ form schema (BA «Catalog + Schema») = **GĐ1.5 residual** — this seat = **Catalog only** |
| **L-DEC-CAT-11 Merge print OUT** | QSĐ MergeToken / print = **GĐ2** (BA) — **not** this seat |
| **L-DEC-CAT-12 Honesty** | No module UAT / e2e / PAY / ATT / REC / EMP ready flip from docs |
| **Paths (Nest physical GĐ1)** | **ADD** `/api/hrm/decisions/decision-types*` (alias `/api/hrm/core/decision-types*` OK) |

**Envelope:** `{ code, message, data }`  
**Auth:** HRM JWT / membership — same decisions peers.

---

## 1. Platform → DEC binding (`ICatalogRow`)

| Logical (`ICatalogRow`) | Physical GĐ1 | `catalog_kind` | Notes |
|-------------------------|--------------|----------------|-------|
| `code` | `decision_type_key` | `hr_decision_type` | Stable slug; UQ active per company; consumer = `hr_decisions.decision_type` |
| `label_vi` | `name_vi` | | display-ready (picker · tabs · badge) |
| `status` | `status` + `archived_at` | | active \| retired |
| `scope_company_id` | `company_id` TEXT | | JWT operating slug |
| `meta` | typed flags + `sort_order` + optional legacy aliases | | **not** free JSON SoT for person-bound / WH |
| Settings REF row | settings-catalogs `hr_decision_types` | `decision_types` family | Group REF — merge-read |

**FORBIDDEN GĐ1:** Mega `hrm_catalog_rows` EAV for DEC (ADR Q-PLT-03). **FORBIDDEN:** closed `CHECK IN` on starter / HRD_*. **FORBIDDEN:** invent second `hr_decisions` table.

```text
  XBOS publish ──► settings-catalogs.hr_decision_types (group REF · aliases decision_types)
                           │
                           ├── pull/sync (read) ──► effective picker union
                           │
  DEC Settings/CFG ──► hr_decision_type CRUD (tenant writer)
                           │
                           ▼
              F-CORE-DEC-01 create/patch · picker tabs · assert ∈ catalog
                           │
              F-CORE-DEC-02 effective ── flags → employee_id / WH UPSERT (must_keep)
                           │
  contract_types (CTR) ──► OUT — not this table
  emp_document_type / emp_employment_type / att_leave_type / rec_pipeline_stage ──► SEALED peers
```

---

## 2. Physical DATA pointer (ba-data unlock — **not covered yet**)

> **Unlock:** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01` — **ADD** `public.hr_decision_type`.  
> Platform DATA-01 / EMP-DATA / ATT-DATA / REC-DATA **did not** physicalize QSĐ types — **DEC catalog physical = this cascade** (closes R-PLT-DATA-04 DEC / R-PLT-EMP-05).  
> AS-IS `hr_decisions.decision_type` stays **text** storing catalog key — **EXPAND** DOC note: after catalog >0, values **must** resolve to active/retired catalog (history may hold retired keys).  
> AS-IS settings partition `hr_decision_types` **remains** group REF — **not** dropped.

### 2.1 `hr_decision_type` (ADD physical)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | uuid | PK | |
| `company_id` | text | NO | Scope slug |
| `decision_type_key` | text | NO | Open catalog code — format `^[a-zA-Z][a-zA-Z0-9_]*$` (allow `HRD_01` style; normalize lookup **lower** for UQ / assert) |
| `name_vi` | text | NO | UI label |
| `sort_order` | int | NO | Picker / tab order — default 100 |
| `is_person_bound` | boolean | NO | F-CORE-DEC-01 → require `employee_id` (**BR-BP-DEC-EMP-01**) |
| `writes_work_history` | boolean | NO | F-CORE-DEC-02 → UPSERT WH when `status=effective` |
| `wh_event_type` | text | YES | When `writes_work_history`: `appointment` \| `transfer` \| `termination` (TEXT; open — **not** invent new WH SoT) |
| `requires_position_key` | boolean | NO | Default true when `writes_work_history`; soft gate `HRM-DEC-POS-KEY` |
| `legacy_alias_keys_json` | jsonb | YES | Optional aliases (`["appointment"]`) — resolve assert accepts alias → canonical key |
| `color_token` | text | YES | Optional UI chip |
| `metadata_json` | jsonb | YES | Optional — **not** replace typed flags |
| `status` | text | NO | active \| retired |
| `archived_at` | timestamptz | YES | soft-delete |
| `created_at`, `updated_at` | timestamptz | NO | audit |

| Constraint | Rule |
|------------|------|
| **UQ active** | `(company_id, lower(decision_type_key))` WHERE `archived_at IS NULL` |
| **CHK format** | slug only — **FORBIDDEN** enum ceiling CHECK of starter / HRD_* |
| **CHK flags** | `writes_work_history=true` ⇒ `is_person_bound=true`; `writes_work_history` ⇒ `wh_event_type` NOT NULL |
| **Starter rows** | Optional ensure upsert blueprint (`appointment`, `transfer`, `HRD_01`…) — **not** UF evidence (U65) |

### 2.2 Consumer columns (EXPAND note — no rename)

| Table | Column | Rule after catalog live |
|-------|--------|-------------------------|
| `hr_decisions` | `decision_type` | Stores key; validate ∈ **F-DEC-CAT-EFF-01** when catalog >0 |
| `employee_work_timeline` | `decision_id` / `event_type` | **must_keep** F-CORE-DEC-02; `event_type` ← catalog `wh_event_type` |
| Settings items | `hr_decision_types` | Group REF partition — merge-read only |

### 2.3 Explicitly **not** this DATA seat

| Item | Owner |
|------|-------|
| `hr_decisions` TXN DDL / WH `decision_id` | E2E-LINK-EMP-DB — **must_keep** |
| `emp_document_type` / `emp_employment_type` | EMP-DATA — **SEAL** |
| `att_leave_type` / `rec_pipeline_stage` | ATT/REC — **SEAL** |
| `contract_types` / HĐ packs | CTR — **OUT** |
| QSĐ FormSchema by type | GĐ1.5 residual |
| QSĐ MergeToken print | GĐ2 |

---

## 3. API_DESIGN F.1 — F-DEC-CAT-*

### 3.1 F-DEC-CAT-TYP-01 — List / get decision types (open catalog)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/decisions/decision-types` · `GET /api/hrm/decisions/decision-types/:decisionTypeId` |
| **Mục đích** | Trả danh mục loại quyết định / QSĐ (Settings · form tạo QSĐ · tab filter) — display-ready — sau HR thêm mã **thứ N+** F5 list **có** row (**AC-PLT-DEC-01**). |
| **Nghiệp vụ xử lý** | (1) `resolveHrmListScope` + required `company_id` query. (2) Query `hr_decision_type` WHERE scope AND `archived_at IS NULL` unless `include_archived=true`. (3) Default filter `status=active` when omitted (picker). (4) Optional `q` ilike key/`name_vi`. (5) Sort `sort_order`, `decision_type_key`. (6) **Effective union (read model):** when `include_group_ref=true`, merge settings-catalogs partition `hr_decision_types` / family `decision_types` — **tenant row wins** on same key (**L-DEC-CAT-02**). (7) Empty `[]` = **200** — **không** fake starter in UF (U65). (8) Get-by-id: same scope — OOS → 404/403 (**U19**). (9) Response includes typed flags. |
| **Tham chiếu bước SRS / AC** | **FR-UC-BP-CORE-01a** · BR-BP-DEC-EMP-01 · **AC-PLT-DEC-01** · **BR-PLT-02/05/06** · BA §2.1 QSĐ · ADR Option B · AS-IS HRM_SC_DEC |
| **Request (query)** | `company_id` (required) · `status?` · `include_archived?` · `include_group_ref?` · `q?` · `person_bound_only?` |
| **Response → DB** | |

| DTO field | DB column | Notes |
|-----------|-----------|-------|
| `id` | `id` | uuid |
| `companyId` | `company_id` | |
| `decisionTypeKey` | `decision_type_key` | consumer FK |
| `nameVi` | `name_vi` | |
| `sortOrder` | `sort_order` | |
| `isPersonBound` | `is_person_bound` | |
| `writesWorkHistory` | `writes_work_history` | |
| `whEventType` | `wh_event_type` | optional unless WH |
| `requiresPositionKey` | `requires_position_key` | |
| `legacyAliasKeys` | `legacy_alias_keys_json` | optional |
| `colorToken` | `color_token` | optional |
| `metadata` | `metadata_json` | optional |
| `status` | `status` | |
| `source` | derived | `dec_native` \| `group_ref` \| `dec_override` |
| `archivedAt` | `archived_at` | |
| `updatedAt` | `updated_at` | |

| **Lỗi** | Scope 403/409 · empty list **không** 404 |
| **scope_parity** | List predicate = get-by-id assert |

---

### 3.2 F-DEC-CAT-TYP-02 — Create / upsert / retire decision type

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/decisions/decision-types` · `PUT /api/hrm/decisions/decision-types` (upsert by `(company_id, decision_type_key)`) · `PATCH …/:decisionTypeId` · `POST …/:decisionTypeId/retire` |
| **Mục đích** | HR CRUD loại QSĐ tenant — mở catalog **không** giới hạn starter / HRD_* (**BR-PLT-05**). |
| **Nghiệp vụ xử lý** | (1) Scope + mutate assert. (2) Validate `decisionTypeKey` slug — **`HRM-PLT-CAT-CODE-INVALID` = format only** — **cấm** reject «not in appointment\|HRD_01». (3) Validate flags + `wh_event_type` when WH. (4) Upsert active key → refresh labels/flags; bump `updated_at`. (5) UQ conflict → **`HRM-PLT-CAT-CODE-CONFLICT`**. (6) Retire: `status=retired`, `archived_at=now()` — pickers hide; **must_keep** historical `hr_decisions` rows (**BR-PLT-04**). (7) **FORBIDDEN** hard-delete. (8) **FORBIDDEN** mutate group REF rows in XBOS partition — tenant writer only on `hr_decision_type`. (9) Retire of last active `writes_work_history` while open WH-producing paths exist → **412** `HRM-DEC-TYP-WH-REQUIRED` (reassign/create replacement first) **or** document waiver if catalog empty allowed. (10) After 2xx, QSĐ create UI must accept new key (**AC-PLT-DEC-01**). |
| **Tham chiếu bước SRS / AC** | **AC-PLT-DEC-01/02** · **BR-PLT-02/04/05** · FR-UC-BP-CORE-01a |
| **Request → DB** | Same fields as §3.1 (create/upsert required: `companyId`, `decisionTypeKey`, `nameVi`; flags default false) |
| **Response → DB** | Single row display-ready |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · `HRM-DEC-TYP-WH-REQUIRED` · `HRM-VAL-400` · scope |
| **scope_parity** | Mutate assert = list scope |

---

### 3.3 F-DEC-CAT-EFF-01 — Effective decision-type catalog (read helper)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/decisions/decision-types/effective` (alias — may fold into TYP-01 `include_group_ref=true`) |
| **Mục đích** | Single read model for F-CORE-DEC-01 assert / Settings picker / mobile — union DEC native + group REF. |
| **Nghiệp vụ xử lý** | (1) Load DEC rows active. (2) Merge settings-catalogs `hr_decision_types`. (3) Key collision → DEC overrides REF. (4) Resolve legacy aliases → canonical key. (5) Used by decisions.service assert — **replace ad-hoc settings-only path + hardcoded Sets** after BE lands. (6) Read-only. (7) Helpers: `personBoundKeys[]`, `workHistoryNeoKeys[]` derived from flags. |
| **Tham chiếu bước SRS / AC** | **BR-PLT-02/06** · VAL-SET-MD-03 · F-CORE-DEC-01/02 · **AC-PLT-DEC-03** |
| **Lỗi** | Scope only |
| **scope_parity** | Same as TYP-01 |

---

## 4. Consumer deepen (pointer — must_keep TXN APIs)

> **Không** redesign F-CORE-DEC-01/02 · WH · profile. **EXPAND** validation + flag source only.

| Consumer F-id | Change |
|---------------|--------|
| **F-CORE-DEC-01** | Assert `decision_type` ∈ **F-DEC-CAT-EFF-01** when catalog >0 → else **`HRM-DEC-TYPE-UNKNOWN`** (preserve VAL-SET-MD-03 class). Person-bound gate ← catalog `is_person_bound` (**not** hardcoded Set). Position key ← `requires_position_key` + XBOS `job_titles` (**AC-PLT-EMP-01** must_keep). |
| **F-CORE-DEC-02** | WH write when `writes_work_history=true` + `status=effective` + `employee_id`; `event_type` ← `wh_event_type` — **must_keep** UPSERT by `decision_id`. Discipline-like types (`is_person_bound` without WH) **no** invent WH row. |
| **Settings catalogs REF** | Keep pull/alias `decision_types`↔`hr_decision_types` — merge into EFF — **not** sole SoT after tenant table live |
| **F-CORE-WH-*** | Unchanged list/get — display decision ref |
| **EMP DOC/ET · ATT · REC** | **No touch** |

---

## 5. Acceptance criteria (DEC vertical)

| ID | Domain | Đạt khi (U65 browser) | Không đạt khi |
|----|--------|----------------------|---------------|
| **AC-PLT-DEC-01** | DEC types | Settings/DEC CFG → **Tạo loại QSĐ** mã HR đặt (#N+) → **2xx** → list có row → **F5** còn → form tạo quyết định **chọn được** mã mới | Reject «không thuộc HRD_* / appointment» · FE hardcode list · mất sau F5 |
| **AC-PLT-DEC-02** | DEC types | Retire loại → picker ẩn → QSĐ cũ **còn** hiển thị key | Hard-delete · orphan decisions |
| **AC-PLT-DEC-03** | DEC types | Khi catalog >0: submit `decision_type` **ngoài** catalog → **4xx** deterministic | Free-text SoT khi catalog có items |
| **AC-PLT-DEC-04** | DEC WH | Tạo loại `is_person_bound` + `writes_work_history` + `wh_event_type=appointment` → QSĐ effective → WH row + `decision_id` (F-CORE-DEC-02) | Break WH spine · invent free-text position SoT |
| **AC-PLT-DEC-05** | DEC person-bound | Loại `is_person_bound` thiếu `employee_id` → **`HRM-DEC-EMP-REQUIRED`** | Silent save without employee |
| **AC-PLT-DEC-06** | Dual SoT | Group REF item + tenant override same key → picker shows tenant label/flags | REF wipe tenant · dual masters diverge without merge rule |

**Journey (QA later):** `J-HRM-DEC-TYP-01` (open catalog) · reuse CORE-01a WH — **no** claim decisions/personnel UAT from this seat.

**Align BA:** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01` may refine AC wording / BR ids — **must not** reclose enum or invent contract_types SoT.

---

## 6. Error taxonomy (DEC catalog class)

| Code | HTTP | When | Shared with |
|------|------|------|-------------|
| `HRM-PLT-CAT-CODE-INVALID` | 400 | slug format fail — **not** «not in starter N» | Platform |
| `HRM-PLT-CAT-CODE-CONFLICT` | 409 | Active UQ key | Platform |
| `HRM-DEC-TYPE-UNKNOWN` | 400 | decision_type ∉ effective | BR-PLT-02 · VAL-SET-MD-03 class |
| `HRM-DEC-TYP-WH-REQUIRED` | 412 | Retire last WH-producing type without replacement | DEC |
| `HRM-DEC-EMP-REQUIRED` | 400 | Person-bound missing employee_id | F-CORE-DEC-01 — **must_keep** |
| `HRM-DEC-POS-KEY` | 400 | Missing/invalid position_key when required | F-CORE-DEC-01 — **must_keep** |
| `HRM-DEC-NOT-EFFECTIVE` | 400/412 | WH write before effective | F-CORE-DEC-02 — **must_keep** |
| Scope | 403/409 | list↔id↔mutate | U19 |

---

## 7. DOC-DELTA — client deliverables (ADD-only)

> **ba-docs** append — **không** wipe F-CORE-DEC-* / WH / EMP DOC-ET / CTR stubs.

### 7.1 `API_DESIGN_HRM_ENTERPRISE.md`

| Action | Content |
|--------|---------|
| **ADD** §3.x | **F-DEC-CAT-TYP-01..02** · **F-DEC-CAT-EFF-01** with full F.1 blocks (copy §3) |
| **EXPAND** | **F-CORE-DEC-01/02** footnote: type ∈ effective catalog; person-bound / WH from flags |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01` |

### 7.2 `DB_DESIGN_HRM_ENTERPRISE.md`

| Action | Content |
|--------|---------|
| **ADD** | §3.x `hr_decision_type` physical — **FORBIDDEN** closed key CHECK |
| **EXPAND** | §3.11 `decision_type` note: open catalog key · starter/HRD_* ≠ ceiling · dual SoT REF `hr_decision_types` |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01` |

### 7.3 `SRS_HRM_ENTERPRISE.md` (optional pointer)

| Action | Content |
|--------|---------|
| **EXPAND** | FR-UC-BP-CORE-01a — «loại cấu hình tenant» = Settings open catalog (no new FR if wording matches) |

### 7.4 ADR platform (optional)

| Action | Content |
|--------|---------|
| **EXPAND** §7 | Explicit **Decisions / QSĐ** Catalog row (types open; FormSchema GĐ1.5; Merge GĐ2) — pointer only |

---

## 8. must_keep / forbidden

| Keep | Forbidden |
|------|-----------|
| F-CORE-DEC-01/02 + WH `decision_id` soft FK | Dual decision table · seed QSĐ for UF · wipe WH |
| EMP DOC/ET L1 SEAL | Wipe / reopen EMP catalog as DEC |
| ATT leave-types · REC stages sealed | Absorb into DEC |
| CTR `contract_types` ownership | DEC duplicate contract-type SoT |
| Position/dept XBOS REF | Free-text position SoT on auto WH |
| Soft-delete catalogs | Hard-delete with history FK |
| U65 FE CRUD evidence | Seed for UF |
| Open catalog N+ type keys | `CHECK IN (starter)` · API reject Nth · permanent hardcoded Sets as SoT |
| Honesty flags false | Decisions / personnel / PAY / ATT / REC / EMP UAT flip from docs |
| Settings alias `decision_types`↔`hr_decision_types` | Drop REF without merge path |

---

## 9. Cascade unlock

| Gate | Status after this seat |
|------|------------------------|
| DEC vertical API F.1 (types) | **CONFIRMED** (this doc) |
| **ba-data** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01` | **UNLOCKED** — physical `hr_decision_type` (**not** already covered) |
| **ba-process** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01` | **ALIGN** parallel — AC/BR; no enum reclose |
| **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01` | **HOLD** until DATA CONFIRMED |
| **dev-fe** DEC Settings picker + QSĐ form bind | **HOLD** until BE READY_FOR_QA |
| **QA** AC-PLT-DEC-01..06 | After FE/BE — U65 browser |
| FormSchema by type / Merge print | **Residual** GĐ1.5 / GĐ2 |
| EMP residual R-PLT-EMP-05 | **CLOSED** by this seat (ownership → DEC cascade) |

**Residual OPEN:**

| ID | Note | Owner |
|----|------|-------|
| R-PLT-DEC-01 | Wire F-CORE-DEC-01/02 → F-DEC-CAT-EFF-01; retire hardcoded Sets | dev-be |
| R-PLT-DEC-02 | Client DOC-DELTA §7 | ba-docs |
| R-PLT-DEC-03 | ADR §7 Decisions row EXPAND | sa / ba-docs |
| R-PLT-DEC-04 | FormSchema per decision type | sa GĐ1.5 |
| R-PLT-DEC-05 | QSĐ MergeToken print | GĐ2 |
| R-PLT-DEC-06 | Align DEC-BA-01 AC ids if BA renumbers | ba-process |

---

## 10. Honesty

| Flag | Value |
|------|-------|
| Decisions / QSĐ module UAT-ready | **false** |
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| `attendance_uat_ready` | **false** |
| `recruitment_uat_ready` | **false** |
| EMP DOC/ET L1 SEAL reopen | **false** (must_keep SEAL) |
| Platform / Phase1 DONE | **false** |
| This seat | Docs only — API F.1 DEC decision-type catalog |
| Option B | **CONFIRMED** |
| Seed | **forbidden** in UF evidence |

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-vertical-sa-01.md` |
| **next_owner** | **pm** → **ba-data** DEC physical · parallel **ba-process** DEC-BA-01 align · **ba-docs** DOC-DELTA §7 |
| **completion_report** | CONFIRMED DEC/QSĐ vertical F.1: F-DEC-CAT-TYP/EFF open `hr_decision_type` catalog (peer F-PLT-TOK / F-ATT-CAT-LVT / F-REC-CAT-STG / F-EMP-CAT); dual SoT settings `hr_decision_types` REF vs tenant writer; typed flags replace hardcoded person-bound/WH Sets; must_keep F-CORE-DEC/WH + EMP/ATT/REC sealed + CTR types OUT; AC-PLT-DEC-01..06; DOC-DELTA client API/DB; unlock ba-data DEC-DATA-01; closes R-PLT-EMP-05; no apps/**; honesty flags stay false. |
