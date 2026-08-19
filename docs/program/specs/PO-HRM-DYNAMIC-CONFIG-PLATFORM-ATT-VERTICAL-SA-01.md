# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01 — API_DESIGN F.1 · ATT catalog (Option B roll-out)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **lane** | governance · sa |
| **change_mode** | **ADD** F-ATT-CAT-* · **EXPAND** existing `/attendance/work-sites` · **DOC-DELTA** client API/DB · **NO CODE** `apps/**` · **no seed** · **no wipe** ATT TXN/sign/sheet spine |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — Option **B** roll to ATT vertical · cite F-PLT-TOK / CTR CORR pattern |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1–L7 · §7 ATT row |
| **ref_cfg** | [`ADR-HRM-ATTENDANCE-CFG-PERSIST`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) D1–D4 |
| **ref_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md) F-PLT-TOK F.1 pattern · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) `ICatalogRow` · R-PLT-DATA-04 |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.3 ATT · BR-PLT-02/04/05/06 |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §4.4 `att_leave_type` · §4.3 work-sites |
| **ref_spine** | [`PO-HRM-ATT-LEAVE-FUNNEL-DB-01`](./PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md) · F-ATT-SHEET-* · F-ATT-LEAVE-* (must_keep) |
| **Honesty** | No ATT module UAT flip · no Phase1 DONE · `payroll_e2e_ready=false` · U65 |
| **must_keep** | `work_shifts` ops SoT · sheet close/sign spine · PAY reads closed sheet only · XBOS `leave_types` group REF · soft-delete · scope_parity U19 |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Objective & locks

Roll **Platform Option B** to **ATT vertical GĐ1**: **Catalog (`ICatalogRow`)** for **leave types** + **work sites** — same F.1 depth as **F-PLT-TOK** (CTR MergeToken) and **open-catalog CORR** (no closed enum ceiling). **Unlock ba-data physical + dev-be** only after this seat — **no** `apps/**` here.

| Lock | Rule |
|------|------|
| **L-ATT-CAT-01 Open leave types** | `leave_type_key` = **open catalog** per company scope — starter keys (`annual`, `sick`, `LVT_01`…`LVT_04`, blueprint §4.4) = **bootstrap examples only** — **not** closed enum (**BR-PLT-05** · DYNAMIC-LOCK class) |
| **L-ATT-CAT-02 Dual SoT clarity** | **Group REF** `settings-catalogs` / catalog-sync key `leave_types` (XBOS publish) **≠** ATT CFG writer **`att_leave_type`** — consumer TXN validates against **effective union** (REF pulled + tenant ATT rows) — **cấm** FE hardcode fixed LVT list (**BR-PLT-06**) |
| **L-ATT-CAT-03 Ops vs catalog** | **`work_shifts`** = operational SoT (ADR ATT CFG **D1**) — **FORBIDDEN** treat as platform Catalog duplicate of XBOS `shifts` REF |
| **L-ATT-CAT-04 Work sites** | Geofence SoT = **`attendance_work_sites`** (ADR **D3**) — EXPAND platform catalog contract on **existing** Nest paths — **no** second table GĐ1 |
| **L-ATT-CAT-05 Consumer SoT** | When effective leave catalog **>0** rows: `POST leave-requests` **must** reject free-text `leave_type` not in catalog (**BR-PLT-02** · existing VAL-SET-MD-02 class — **preserve**) |
| **L-ATT-CAT-06 Soft-delete** | Retire = `status=retired` +/or `archived_at` — history FK on requests/balance/policy intact (**BR-PLT-04**) |
| **L-ATT-CAT-07 Scope** | list ↔ get-by-id ↔ mutate = `resolveHrmListScope` + `assertResourceInHrmScope` (**U19**) |
| **L-ATT-CAT-08 Honesty** | Employee `attendance_code` ≠ `employee_code` mapping = **GĐ2 candidate** (`FR-ATT-SET-EMP-MAP-01`) — **out of** this seat |
| **Paths (Nest physical GĐ1)** | **ADD** `/api/hrm/attendance/leave-types*` · **KEEP** `/api/hrm/attendance/work-sites*` (deepen only) |

**Envelope:** `{ code, message, data }`  
**Auth:** HRM JWT / membership — same attendance peers.

---

## 1. Platform → ATT binding (`ICatalogRow`)

| Logical (`ICatalogRow`) | Physical GĐ1 | `catalog_kind` | Notes |
|-------------------------|--------------|----------------|-------|
| `code` | `leave_type_key` | `att_leave_type` | Stable slug; UQ active per company |
| `label_vi` | `name_vi` | | display-ready |
| `status` | `status` + `archived_at` | | active \| retired |
| `scope_company_id` | `company_id` TEXT | | JWT operating slug |
| `meta` | `category`, flag columns | | See §2.1 — **not** free JSON SoT for paid/unpaid |
| Work site row | `attendance_work_sites` | `att_work_site` | Existing table — platform **interface map** only |

**FORBIDDEN GĐ1:** One mega `hrm_catalog_rows` EAV for ATT (ADR Q-PLT-03). **FORBIDDEN:** `CHECK (leave_type_key IN ('annual','sick',…))` closed set.

```text
  XBOS publish ──► settings-catalogs.leave_types (group REF)
                           │
                           ├── pull/sync (read) ──► effective picker union
                           │
  ATT Settings/CFG ──► att_leave_type CRUD (tenant writer)
                           │
                           ▼
              leave-requests · balance · accrual policy · sheet aggregate
                           │
              work_shifts (ops) ◄── NOT catalog duplicate of shifts REF
```

---

## 2. Physical DATA pointer (ba-data unlock — not this seat)

> SoT columns: **DB_DESIGN §4.4** `att_leave_type`. Dev **ensureSchema** after DATA CONFIRMED.

### 2.1 `att_leave_type` (ADD physical — closes R-PLT-DATA-04 ATT slice)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | uuid | PK | |
| `company_id` | text | NO | Scope slug |
| `leave_type_key` | text | NO | Open catalog code — format `^[a-z][a-z0-9_]*$` |
| `name_vi` | text | NO | UI label |
| `category` | text | NO | `annual`\|`seniority`\|`ot_comp`\|`carry_over`\|`advance`\|`sick`\|`other` |
| `is_paid` | boolean | NO | Default paid/unpaid for sheet aggregate |
| `allows_carry_over` | boolean | NO | |
| `allows_advance` | boolean | NO | |
| `insurance_regime_flag` | boolean | NO | Sick BHXH branch |
| `company_topup_flag` | boolean | NO | |
| `counts_toward_timesheet` | boolean | NO | default true |
| `metadata_json` | jsonb | YES | **Optional** — `is_sick`, attachment rules (bridge QA LV-03 class) — **not** replace typed flags |
| `status` | text | NO | active \| retired |
| `archived_at` | timestamptz | YES | soft-delete |
| `created_at`, `updated_at` | timestamptz | NO | audit |

| Constraint | Rule |
|------------|------|
| **UQ active** | `(company_id, lower(leave_type_key))` WHERE `archived_at IS NULL` |
| **CHK format** | slug only — **FORBIDDEN** enum ceiling CHECK |
| **Starter rows** | Optional ensure upsert blueprint keys — **not** UF evidence (U65) |

### 2.2 `attendance_work_sites` (EXPAND — table exists)

No new table. Platform seat **confirms** `ICatalogRow` map on existing columns (`name`, `active`, `company_id` TEXT, geofence fields) per ADR D3.

---

## 3. API_DESIGN F.1 — F-ATT-CAT-*

### 3.1 F-ATT-CAT-LVT-01 — List / get leave types (open catalog)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/attendance/leave-types` · `GET /api/hrm/attendance/leave-types/:leaveTypeId` |
| **Mục đích** | Trả catalog loại phép (picker Settings · form nộp phép · balance panel) — display-ready — sau HR thêm mã **thứ 9+** F5 list **có** row (**AC-PLT-ATT-01**). |
| **Nghiệp vụ xử lý** | (1) `resolveHrmListScope` + required `company_id` query. (2) Query `att_leave_type` WHERE scope AND `archived_at IS NULL` unless `include_archived=true`. (3) Default filter `status=active` when omitted (picker). (4) Optional `q` ilike `leave_type_key`/`name_vi`. (5) **Effective union (read model):** when query `include_group_ref=true`, merge active rows from settings-catalogs partition `leave_types` for same scope **without** overwriting ATT row on key collision — ATT row **wins** on same `leave_type_key`. (6) Empty `[]` = **200** — **không** fake starter in UF (U65). (7) Get-by-id: same scope — OOS → 404/403 (**U19**). (8) Response includes typed flags + `metadata` for sick/attach rules. |
| **Tham chiếu bước SRS / AC** | FR-UC-BP-ATT-04/04b/05/06/07 · SYNTHESIS A3–A4 · **AC-PLT-ATT-01** · **BR-PLT-02/05/06** · BA §2.3 ATT · ADR platform §7 |
| **Request (query)** | `company_id` (required) · `status?` · `category?` · `include_archived?` · `include_group_ref?` · `q?` |
| **Response → DB** | |

| DTO field | DB column | Notes |
|-----------|-----------|-------|
| `id` | `id` | uuid |
| `companyId` | `company_id` | |
| `leaveTypeKey` | `leave_type_key` | consumer FK |
| `nameVi` | `name_vi` | |
| `category` | `category` | |
| `isPaid` | `is_paid` | |
| `allowsCarryOver` | `allows_carry_over` | |
| `allowsAdvance` | `allows_advance` | |
| `insuranceRegimeFlag` | `insurance_regime_flag` | |
| `companyTopupFlag` | `company_topup_flag` | |
| `countsTowardTimesheet` | `counts_toward_timesheet` | |
| `metadata` | `metadata_json` | optional |
| `status` | `status` | |
| `source` | derived | `att_native` \| `group_ref` \| `att_override` |
| `archivedAt` | `archived_at` | |
| `updatedAt` | `updated_at` | |

| **Lỗi** | Scope 403/409 · empty list **không** 404 |
| **scope_parity** | List predicate = get-by-id assert |

---

### 3.2 F-ATT-CAT-LVT-02 — Create / upsert / retire leave type

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/attendance/leave-types` · `PUT /api/hrm/attendance/leave-types` (upsert by `(company_id, leave_type_key)`) · `PATCH …/:leaveTypeId` · `POST …/:leaveTypeId/retire` |
| **Mục đích** | HR CRUD loại phép tenant — mở catalog **không** giới hạn số mã starter (**BR-PLT-05**). |
| **Nghiệp vụ xử lý** | (1) Scope + mutate assert. (2) Validate `leaveTypeKey` slug — **`HRM-PLT-CAT-CODE-INVALID` = format only** — **cấm** reject «not in LVT_01..04». (3) Validate `category` + boolean flags. (4) Upsert active key → refresh labels/flags/metadata; bump `updated_at`. (5) UQ conflict → **`HRM-PLT-CAT-CODE-CONFLICT`**. (6) Retire: `status=retired`, `archived_at=now()` — pickers hide; **must_keep** historical `leave_requests.leave_type` / balance rows (**BR-PLT-04**). (7) **FORBIDDEN** hard-delete. (8) **FORBIDDEN** mutate group REF rows in XBOS partition — tenant writer only on `att_leave_type`. (9) After 2xx consumer leave form must accept new key (**AC-PLT-ATT-01**). |
| **Tham chiếu bước SRS / AC** | **AC-PLT-ATT-01** · **BR-PLT-02/04/05** · FR-UC-BP-ATT-09 submit validates ∈ catalog · VAL-SET-MD-02 |
| **Request → DB** | Same fields as §3.1 (create/upsert required: `companyId`, `leaveTypeKey`, `nameVi`, `category`, flag set) |
| **Response → DB** | Single row display-ready |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · `HRM-VAL-400` · scope |
| **scope_parity** | Mutate assert = list scope |

---

### 3.3 F-ATT-CAT-WS-01 — List / get work sites (EXPAND platform contract)

| | |
|--|--|
| **METHOD / path** | **KEEP** `GET /api/hrm/attendance/work-sites` · `GET …/work-sites/:siteId` |
| **Mục đích** | Danh sách điểm GPS/geofence — Settings/CFG bind (**ADR D3**). |
| **Nghiệp vụ xử lý** | **AS-IS** behavior preserved. **EXPAND:** (1) Document `ICatalogRow` map (`code` optional GĐ1 = slug from `id` or future `site_code`). (2) Default exclude inactive unless `include_inactive=true`. (3) Display-ready `name`, `address`, `radiusMeters`, `active`. (4) scope_parity explicit in OpenAPI class. (5) **cấm** `ensureDefaultWorkSite` on U65 path (ADR D3). |
| **Tham chiếu bước SRS / AC** | FR-UC-BP-ATT-03d · ADR ATT CFG D3 · **BR-PLT-04** |
| **Response → DB** | `attendance_work_sites` columns |
| **Lỗi** | Scope · 404 OOS |
| **scope_parity** | **PASS** (existing — stamp) |

---

### 3.4 F-ATT-CAT-WS-02 — Create / update / retire work site (EXPAND)

| | |
|--|--|
| **METHOD / path** | **KEEP** `POST/PATCH/DELETE /api/hrm/attendance/work-sites` (+ `:siteId`) |
| **Mục đích** | CRUD vùng check-in GPS. |
| **Nghiệp vụ xử lý** | **AS-IS** + platform locks: soft retire (`active=false` or `archived_at` when column added) — **FORBIDDEN** hard-delete when punches reference site (future FK guard). `company_id` TEXT slug parity. `radiusMeters` FE alias preserved. |
| **Tham chiếu bước SRS / AC** | FR-UC-BP-ATT-03d · `HRM-ATT-GEO-001` on punch create |
| **Lỗi** | `HRM-VAL-400` coords · scope |
| **scope_parity** | list ↔ mutate |

---

### 3.5 F-ATT-CAT-EFF-01 — Effective leave catalog for consumers (read helper)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/attendance/leave-types/effective` (alias — may implement inside LVT-01 `include_group_ref=true`) |
| **Mục đích** | Single read model for leave form / VAL-SET-MD-02 / mobile picker — union ATT native + group REF. |
| **Nghiệp vụ xử lý** | (1) Load ATT rows active. (2) Merge settings-catalogs `leave_types` items active for scope not retired. (3) Key collision → ATT row overrides REF label/flags. (4) Used by `leave-requests.service` assert — **replace ad-hoc catalog-only path** after BE lands. (5) Read-only — no persist. |
| **Tham chiếu bước SRS / AC** | **BR-PLT-06** · UF-HRM-09 catalog sync · LV-03 sick metadata class |
| **Lỗi** | Scope only |
| **scope_parity** | Same as LVT-01 |

---

## 4. Consumer deepen (pointer — must_keep TXN APIs)

> **Không** redesign F-ATT-LEAVE-* / sheet / sign. **EXPAND** validation source only.

| Consumer F-id | Change |
|---------------|--------|
| **F-ATT-LEAVE-02/03** | Assert `leave_type` ∈ **F-ATT-CAT-EFF-01** effective set — **BR-PLT-02** |
| **F-ATT-SHEET-01** | Aggregate paid/unpaid uses `att_leave_type.is_paid` when physical; until then metadata/classifier (**must_keep** funnel) |
| **F-PAY-ATT-CLOSED-01** | **No** new FK to leave_type — **deny-list** preserved |

---

## 5. Acceptance criteria (new — ATT vertical)

| ID | Domain | Đạt khi (U65 browser) | Không đạt khi |
|----|--------|----------------------|---------------|
| **AC-PLT-ATT-01** | ATT | Settings/ATT CFG → **Tạo loại phép** mã HR đặt (#9+) → **2xx** → list có row → **F5** còn → form nộp phép **chọn được** mã mới | Reject «không thuộc LVT_0x» · FE hardcode 4 loại · mất sau F5 |
| **AC-PLT-ATT-02** | ATT | Retire loại phép → picker ẩn → đơn cũ/balance **còn** hiển thị key | Hard-delete · balance orphan |
| **AC-PLT-ATT-03** | ATT | Khi catalog >0: submit leave với mã **ngoài** catalog → **4xx** deterministic — không 201 free-text | Free-text SoT khi catalog có items |
| **AC-PLT-ATT-04** | ATT | Work site CRUD Settings/CFG → 2xx → F5 → punch geofence dùng site mới (when gps_enabled) | Fake save stub · UUID company scope mismatch |

**Journey (QA later):** `J-HRM-ATT-LVT-01` (open catalog) · reuse leave spine `J-HRM-06` / LV-03/04 class.

---

## 6. Error taxonomy (ATT catalog class)

| Code | HTTP | When | Shared with |
|------|------|------|-------------|
| `HRM-PLT-CAT-CODE-INVALID` | 400 | slug format fail — **not** «not in starter N» | Platform |
| `HRM-PLT-CAT-CODE-CONFLICT` | 409 | Active UQ `(company_id, leave_type_key)` | Platform |
| `HRM-LEAVE-TYPE-UNKNOWN` | 400 | Submit leave type ∉ effective catalog | VAL-SET-MD-02 upgrade |
| `HRM-ATT-GEO-001` | 400 | Punch outside sites | ADR D3 — unchanged |
| Scope | 403/409 | list↔id↔mutate | U19 |

---

## 7. DOC-DELTA — client deliverables (ADD-only)

> **ba-docs** append to enterprise blueprint — **không** wipe §3 ATT TXN stubs.

### 7.1 `API_DESIGN_HRM_ENTERPRISE.md`

| Action | Content |
|--------|---------|
| **ADD** §3.x | **F-ATT-CAT-LVT-01..02** · **F-ATT-CAT-WS-01..02** · **F-ATT-CAT-EFF-01** with full F.1 blocks (copy §3 above) |
| **EXPAND** | §7.1 alias row `leave_types` → **`att_leave_type`** physical writer + settings-catalog REF |
| **EXPAND** | F-ATT-LEAVE-02 footnote: validate against effective catalog |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01` |

### 7.2 `DB_DESIGN_HRM_ENTERPRISE.md`

| Action | Content |
|--------|---------|
| **CONFIRM** | §4.4 `att_leave_type` as platform ATT catalog physical — **FORBIDDEN** closed key CHECK |
| **ADD** | §4.4c `attendance_work_sites` platform `ICatalogRow` note (cross-ref ADR D3) |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01` |

---

## 8. must_keep / forbidden

| Keep | Forbidden |
|------|-----------|
| F-ATT-SHEET close/sign spine | Redesign sheet WF |
| `work_shifts` ops CRUD | Catalog-duplicate shifts master |
| PAY closed-sheet-only | PAY HTTP leave/OT |
| settings-catalogs group REF | Hard-delete leave history |
| U65 FE CRUD evidence | Seed for UF |
| Open catalog 9+ leave types | `CHECK IN (LVT_*)` · API reject 9th |
| Honesty flags false | ATT UAT / Phase1 flip from docs |

---

## 9. Cascade unlock

| Gate | Status after this seat |
|------|------------------------|
| ATT vertical API F.1 | **CONFIRMED** (this doc) |
| **ba-data** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01` | **UNLOCKED** — physical `att_leave_type` ensureSchema |
| **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01` | **HOLD** until DATA CONFIRMED |
| **dev-fe** ATT picker Settings | **HOLD** until BE READY_FOR_QA |
| **QA** AC-PLT-ATT-01..04 | After FE/BE — U65 browser |
| MergeToken / sheet export GĐ1.5 | **Later** — not blocking ATT catalog |

**Residual OPEN:**

| ID | Note | Owner |
|----|------|-------|
| R-PLT-ATT-01 | Wire `leave-requests` to F-ATT-CAT-EFF-01 after table live | dev-be |
| R-PLT-ATT-02 | Accrual policy CRUD bound to catalog keys | ba-data GĐ1.5 |
| R-PLT-ATT-03 | Client DOC-DELTA pointer §7 | ba-docs |
| R-PLT-ATT-04 | Sheet export MergeToken GĐ1.5 | sa later |
| R-PLT-ATT-05 | Employee attendance_code map | **GĐ2** — spec gap closed |

---

## 10. Honesty

| Flag | Value |
|------|-------|
| ATT module UAT-ready | **false** |
| Platform / Phase1 DONE | **false** |
| `payroll_e2e_ready` | **false** |
| This seat | Docs only — API F.1 ATT vertical |
| Option B | **CONFIRMED** |

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-vertical-sa-01.md` |
| **next_owner** | **pm** → **ba-data** ATT physical · parallel **ba-docs** DOC-DELTA §7 |
| **completion_report** | CONFIRMED ATT vertical F.1: F-ATT-CAT-LVT/WS/EFF open catalog pattern (like F-PLT-TOK CTR); ICatalogRow map; dual SoT leave_types REF vs att_leave_type; work_shifts ops lock; AC-PLT-ATT-01..04; DOC-DELTA client API/DB; unlock ba-data; no apps/**. |
