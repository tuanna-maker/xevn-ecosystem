# PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02 — Group publish physical (CONFIRMED)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02` |
| **lane** | governance · ba-data |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-SA-02` PASS_TO_PM |
| **change_mode** | ADD · **NO CODE** `apps/**` · **no migrate** · **no seed** · **no wipe** DATA-01 / print-spine GWC / F-CORE-CTR-* spine |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — physical plan unlock **dev-be** PUB/PULL/APPLY (BE HOLD until this PASS); honesty unchanged |
| **ref_adr** | [`ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH-20260807.md`](../../architecture/ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH-20260807.md) **Option A** |
| **ref_sa** | [`PO-HRM-CONTRACT-LEGAL-PRINT-SA-02.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-SA-02.md) |
| **ref_data_spine** | [`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md) — **must_keep** |
| **ref_tech** | [`PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md) §13 **Q-CTR-01 LOCKED** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **v0.18** · **FR-UC-BP-CORE-09a** Diễn biến #1–#5 (+ distribution) |
| **Honesty** | `contracts_printable_ready=false` · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Publish registry | **ADD** `public.hrm_contract_library_publishes` |
| Lineage | **EXPAND** `hrm_contract_templates` · `hrm_contract_clauses` · `hrm_contract_pack_rules` |
| Pull audit SoT | **ADD** `public.hrm_contract_library_pull_audits` — **CONFIRMED** (reject platform-audit-only GĐ1.5) |
| Print spine / registry | **unchanged** — must_keep DATA-01 + GWC |
| `synced_catalogs` | **FORBIDDEN** for contract bodies |
| Live holding join at PREV | **FORBIDDEN** |
| API prefix | `/api/hrm/contracts-insurance/contract-library/*` |
| Dev this seat | **NO** `apps/**` — next = **dev-be** after PM intake |
| Honesty | **remain false** — **DENIED** invent printable UAT |

**Closes:** Q-CTR-01 **physical DB + F.1 path confirm** (architecture already LOCKED SA-02).

---

## 2. Alias map delta (ADD-only)

| Logical | Physical | Dual-write |
|---------|----------|------------|
| `hrm_contract_library_publish` | **`public.hrm_contract_library_publishes`** (**ADD**) | n/a |
| `hrm_contract_library_pull_audit` | **`public.hrm_contract_library_pull_audits`** (**ADD**) | n/a |
| lineage on template/clause/rule | **EXPAND** cols on DATA-01 tables | n/a |
| print_version / employee_contracts | DATA-01 — **unchanged** | no |
| XBOS catalog row | — | **FORBIDDEN** as contract body SoT |

---

## 3. ADD `hrm_contract_library_publishes`

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `tenant_id` | text | NO | Master group tenant (`xevn`) |
| `source_company_id` | text | NO | Always **`holding`** for group publish (ADR §5.1) |
| `publish_version` | int | NO | Monotonic per `tenant_id` |
| `checksum` | text | NO | Hash of canonical `payload_json` |
| `payload_json` | jsonb | NO | Frozen `{ templates[], clauses[], pack_rules[]? }` — only `status=active` + `archived_at IS NULL` at publish |
| `label_vi` | text | YES | Release note |
| `template_count` | int | NO | Denorm count at freeze (display-ready list) |
| `clause_count` | int | NO | Denorm count at freeze |
| `pack_rule_count` | int | NO | Default 0 |
| `published_at` | timestamptz | NO | |
| `published_by` | text | YES | Actor id/email |
| `status` | text | NO | `published`\|`retired` — retire = no **new** policy-blocked pulls; old pulls may still load if BE policy allows |
| `archived_at` | timestamptz | YES | Soft-delete (exclude from list) |
| `created_at` / `updated_at` | timestamptz | NO | |

| **UQ** | **`(tenant_id, publish_version)`** — hard unique (immutable versions) |
| **IX** | `(tenant_id, status, publish_version DESC)` · `(tenant_id, archived_at)` partial where null |
| **Rule** | **Never** UPDATE `payload_json` / `checksum` / `publish_version` after INSERT; new edit → new version only |
| **EMPTY gate** | 0 active templates **AND** 0 active clauses at holding → **VAL-PUB-01** / `HRM-CTR-PUB-EMPTY` (pack_rules alone **insufficient**) |

### 3.1 Payload item shape (canonical — checksum input)

```json
{
  "templates": [{ "code", "name_vi", "pack_code", "layout_json", "keyword_map", "version" }],
  "clauses": [{ "code", "title_vi", "body_vi", "clause_group", "apply_to_packs", "sort_order", "mandatory", "version" }],
  "pack_rules": [{ "match_type", "match_value", "pack_code", "priority" }]
}
```

Canonicalization: stable key order · UTF-8 · no wall-clock fields inside items · `apply_to_packs` sorted.

---

## 4. EXPAND lineage columns (templates · clauses · pack_rules)

**Tables:** `hrm_contract_templates` · `hrm_contract_clauses` · **`hrm_contract_pack_rules`** (CONFIRMED needed — payload may include rules).

| ADD column | Type | Null | Default | Rule |
|------------|------|------|---------|------|
| `origin` | text | NO | `'member'` | `member`\|`group`\|`member_override` |
| `origin_company_id` | text | YES | NULL | `holding` when pulled; NULL if member-authored |
| `origin_publish_version` | int | YES | NULL | N after pull; NULL if local-only |
| `lineage_code` | text | YES | NULL | Stable = source `code` (templates/clauses) or synthetic key for rules (see §4.1) |

| **IX** | `(company_id, lineage_code)` WHERE `lineage_code IS NOT NULL` · `(company_id, origin, origin_publish_version)` |
| **Match rule** | Re-pull upserts by `(company_id, lineage_code)` where `origin IN ('group','member_override')` |
| **UQ keep** | DATA-01 partial UQ `(company_id, code)` / active clause UQ — **unchanged**; lineage does not invent second code column |

### 4.1 Pack rule `lineage_code`

| Case | `lineage_code` |
|------|----------------|
| Template / clause | Equal to payload `code` |
| Pack rule | `pr:{match_type}:{match_value|∅}:{pack_code}` (deterministic; `∅` when `match_value` NULL) |

### 4.2 Override / conflict semantics (data)

| Case | Persist | Expected API |
|------|---------|--------------|
| New lineage | INSERT `origin=group`, status **draft/synced** (not auto-active) | counted in `upserted` |
| Existing `origin=group` | UPSERT body/meta from payload; keep `lineage_code` | `upserted` |
| Existing `origin=member_override` | **Skip** body unless `force=true`; stamp audit `skipped_override[]` | VAL-PUB-04 |
| Existing `origin=member` same `code` | **No** overwrite | VAL-PUB-02 `HRM-CTR-PUB-CODE-CONFLICT` |
| Apply | Activate `origin=group` for version N; never mutate `hrm_contract_print_versions` | VAL-PUB-03 if nothing to activate |

---

## 5. Pull audit — **CONFIRMED** dedicated table

### 5.1 Decision

| Option | Stamp |
|--------|--------|
| **A — ADD `hrm_contract_library_pull_audits`** | **CONFIRMED** GĐ1.5 |
| B — platform-audit / `platform_audit_events` only | **REJECTED** as sole SoT — weak query by `company_id`+`publish_version`; FE Settings «lịch sử kéo» needs structured `result_json` |
| Optional later | BE may **also** emit platform audit event (NFR) — **not** required; **must not** dual-write contract bodies |

### 5.2 ADD `hrm_contract_library_pull_audits`

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | Member partition pulled into |
| `tenant_id` | text | NO | Same master tenant as publish |
| `publish_version` | int | NO | Version pulled |
| `publish_id` | uuid | YES | Soft FK → publishes.id |
| `force` | boolean | NO | Default false |
| `pulled_at` | timestamptz | NO | |
| `pulled_by` | text | YES | |
| `result_json` | jsonb | NO | `{ upserted, skipped_override, conflicts, pack_rules_upserted? }` |
| `archived_at` | timestamptz | YES | Soft-delete optional |

| **IX** | `(company_id, pulled_at DESC)` · `(company_id, publish_version)` |
| **Rule** | Append-only preferred; no mutate of historical `result_json` |

---

## 6. Validation matrix (VAL-PUB-*)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-PUB-01** | Publish with 0 active templates **and** 0 active clauses at holding | Block | HTTP **400** `HRM-CTR-PUB-EMPTY` |
| **VAL-PUB-02** | Pull: member-local `origin=member` row shares `code` / lineage collision | Block upsert that lineage | HTTP **409** `HRM-CTR-PUB-CODE-CONFLICT` · audit `conflicts[]` |
| **VAL-PUB-03** | Apply: no `origin=group` drafts for requested `publish_version` (or latest pulled) | Block | HTTP **400** `HRM-CTR-PUB-NOTHING-TO-APPLY` |
| **VAL-PUB-04** | Re-pull hits `origin=member_override` and `force≠true` | Skip body; continue others | **2xx** with `skipped_override[]` · **no** silent overwrite |
| VAL-PUB-05 | Non-group role POST publish | Block | **403** `HRM-CTR-PUB-FORBIDDEN` |
| VAL-PUB-06 | Unknown `publish_version` | Block | **404** `HRM-CTR-PUB-NOT-FOUND` |
| VAL-PUB-07 | Pull into company outside caller list-scope | Block | **403/409** scope (U19) |
| VAL-PUB-08 | Mutate `payload_json` of existing published row | Forbidden | App/schema reject — new version only |
| VAL-PUB-09 | Apply / pull mutates `hrm_contract_print_versions` | Forbidden | Process FAIL · must_keep BR-CTR-CL-01 |
| VAL-PUB-10 | List publish id then get-by-version out of tenant/scope | Fail parity | 404/403 — **scope_parity** |
| VAL-PUB-11 | Preview/print after pull **without** apply → 0 local active | Domain empty OK | `HRM-CTR-TPL-NONE` on PREV — **not** invent holding live join |
| VAL-PUB-12 | Dual-write publish payload into `synced_catalogs` | Forbidden | Schema/process FAIL |

Keep DATA-01 **VAL-CTR-*** for print spine — **no wipe**.

---

## 7. API_DESIGN F.1 — **CONFIRMED** paths

**Prefix physical:** `/api/hrm/contracts-insurance`  
**Envelope:** `{ code, message, data }`  
**Scope:** list ↔ get ↔ mutate = same resolver (U19) — ADR §5.5.

| Cap | F-id | METHOD / path | SRS bước | Response → DB |
|-----|------|---------------|----------|---------------|
| Publish freeze | **F-CORE-CTR-PUB-01** | `POST /api/hrm/contracts-insurance/contract-library/publishes` | **09a** #3 + distribution | `hrm_contract_library_publishes` |
| List publishes | **F-CORE-CTR-PUB-02** | `GET …/contract-library/publishes` | **09a** #1 | metadata — **no** full `payload_json` on list |
| Get publish | **F-CORE-CTR-PUB-02** | `GET …/contract-library/publishes/:publishVersion` | **09a** #1 | summary + counts; payload optional for pull preview |
| Pull | **F-CORE-CTR-PULL-01** | `POST …/contract-library/pull` | **09a** #1–#2 | member TPL/CL/rules + `hrm_contract_library_pull_audits` |
| Apply | **F-CORE-CTR-APPLY-01** | `POST …/contract-library/apply` | **09a** #3 | activate lineages — **≠** print_versions |

### 7.1 F.1 blocks (physical confirm — cite SA-02 full text)

#### F-CORE-CTR-PUB-01

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-library/publishes` |
| **Mục đích** | Đóng băng gói mẫu + điều khoản (+ pack_rules) hiệu lực tại `holding` thành phiên bản phát hành. |
| **Nghiệp vụ xử lý** | Assert group role + persist **`holding`**; load active TPL/CL/(rules); VAL-PUB-01; canonicalize → checksum; INSERT monotonic `publish_version`; never mutate prior rows; return `{ publish_version, checksum, template_count, clause_count, published_at }`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09a** #3 · BR-CTR-CL-01 |
| **Request** | `{ label_vi? }` — `company_id` **query only** |
| **Lỗi** | `HRM-CTR-PUB-EMPTY` · `HRM-CTR-PUB-FORBIDDEN` · scope |
| **scope_parity** | Same group resolver as PUB-02 list |

#### F-CORE-CTR-PUB-02

| | |
|--|--|
| **METHOD / path** | `GET …/contract-library/publishes` · `GET …/contract-library/publishes/:publishVersion` |
| **Mục đích** | Xem phiên bản đã phát hành (version · checksum · counts) để chọn kéo. |
| **Nghiệp vụ xử lý** | Exclude `archived_at`; member may **read** metadata; empty `[]`=200; get 404 if missing/out of tenant. |
| **Tham chiếu bước SRS** | **09a** #1 |
| **Lỗi** | 404 · 403 |

#### F-CORE-CTR-PULL-01

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-library/pull` |
| **Mục đích** | Sao payload phiên bản N vào partition thành viên dạng nháp/synced — **pull ≠ apply**. |
| **Nghiệp vụ xử lý** | Assert target `company_id` in scope; load publish N; upsert by lineage (§4.2); INSERT pull_audit; return `{ publish_version, upserted, skipped_override, conflicts }` — **không** set `active`. |
| **Tham chiếu bước SRS** | **09a** #1–#2 |
| **Request** | `{ publish_version?, force?: boolean }` — query `company_id` |
| **Lỗi** | `HRM-CTR-PUB-NOT-FOUND` · `HRM-CTR-PUB-CODE-CONFLICT` · `HRM-CTR-PUB-RETIRED` · scope |
| **scope_parity** | Target must pass same list-scope as local CL list |

#### F-CORE-CTR-APPLY-01

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-library/apply` |
| **Mục đích** | Kích hoạt dòng `origin=group` đã kéo để preview/in local. |
| **Nghiệp vụ xử lý** | Scope; select lineage for version N; retire prior active same code if not override; set `active`; **never** touch print_versions; warn `missing_mandatory[]` optional. |
| **Tham chiếu bước SRS** | **09a** #3 · AC-CTR-CL-01 |
| **Request** | `{ publish_version? }` · query `company_id` |
| **Lỗi** | `HRM-CTR-PUB-NOTHING-TO-APPLY` · scope · `HRM-CTR-CL-CODE-CONFLICT` |
| **scope_parity** | Same as CL-03 activate on member partition |

### 7.2 Overlay display (existing CL/TPL — ADD fields only)

| Cap | ADD response fields |
|-----|---------------------|
| F-CORE-CTR-CL-01 / TPL-01 | `origin` · `origin_publish_version` · `origin_company_id` · `lineage_code` (display-ready) |

**Không** đổi METHOD/path spine DATA-01.

### 7.3 Error taxonomy (ADD — keep DATA-01 `HRM-CTR-*`)

| Code | HTTP | VAL |
|------|------|-----|
| `HRM-CTR-PUB-EMPTY` | 400 | VAL-PUB-01 |
| `HRM-CTR-PUB-FORBIDDEN` | 403 | VAL-PUB-05 |
| `HRM-CTR-PUB-NOT-FOUND` | 404 | VAL-PUB-06 |
| `HRM-CTR-PUB-RETIRED` | 400 | policy |
| `HRM-CTR-PUB-CODE-CONFLICT` | 409 | VAL-PUB-02 |
| `HRM-CTR-PUB-NOTHING-TO-APPLY` | 400 | VAL-PUB-03 |
| `HRM-CTR-PUB-MANDATORY-GAP` | 200 warn (prefer) | apply missing mandatory |

---

## 8. scope_parity (U19)

| Cap | List | Get / mutate |
|-----|------|--------------|
| PUB-01/02 | Group + holding persist partition | get-by-`publishVersion` same tenant assert |
| PULL/APPLY | Member `company_id` in `resolveHrmListScope` | Forbidden pull into foreign member |
| TPL/CL after pull | Existing DATA-01 resolvers | `assertResourceInHrmScope` |
| PREV/VER/PDF | Local library only | **no** holding live join |

Journey intent (QA later): holding publish → member pull → apply → local preview — **≠** invent printable module UAT; must_keep UF-HRM-02 + print-spine GWC.

---

## 9. must_keep / forbidden

### must_keep

- Print-spine GWC · UF-HRM-02 · F-CORE-CTR-01..PDF · DATA-01 tables/VAL-CTR-*
- BR-CTR-CL-01 issued snapshot immutability
- ADR `main`↔`holding` persist for publish SoT
- pull ≠ apply ≠ silent clone
- `contracts_printable_ready=false`

### forbidden

- `apps/**` / migrate / seed this seat
- `synced_catalogs` dual-write of legal bodies
- Wipe DATA-01 / F-CORE-CTR stub / demote GWC
- Invent printable UAT / claim module ready
- Option B live holding merge at PREV

---

## 10. Traceability

| SRS | Cap | DB | Test intent |
|-----|-----|----|-------------|
| 09a #3 + distribution | PUB-01 | `hrm_contract_library_publishes` | Holding publish → version N · VAL-PUB-01 |
| 09a #1 | PUB-02 | publishes list/get | scope_parity list↔get |
| 09a #1–#2 | PULL-01 | lineage EXPAND + pull_audits | upsert draft · VAL-PUB-02/04 |
| 09a #3 | APPLY-01 | local active | VAL-PUB-03 · badge origin |
| 09b/09c | PREV/VER | DATA-01 unchanged | Local only · must_keep spine |
| BR-CTR-CL-01 | — | print_versions | Apply does not mutate issued |

---

## 11. Residual / unlock

| ID | Status | Owner |
|----|--------|-------|
| Q-CTR-01 architecture | CLOSED SA-02 | — |
| Q-CTR-01 physical | **CLOSED this seat** | — |
| BE PUB/PULL/APPLY + jest scope_parity | **OPEN** | **dev-be** (PM dispatch) |
| FE Settings Publish/Pull/Apply + origin badge | OPEN | dev-fe after BE |
| Q-CTR-02 PDF binary | OPEN CONDITION | sa/devops |
| Printable module UAT | **DENIED** | — |

**Dev unlock:** PM may dispatch **dev-be** on this CONFIRMED plan. Honesty remains **false**.

---

## Completion contract

| Field | Value |
|-------|--------|
| completion_report | Closed: CONFIRMED ADD publishes (UQ tenant+version, checksum, payload_json) + EXPAND lineage on TPL/CL/pack_rules + CONFIRMED pull_audits table (reject platform-only) + VAL-PUB-01..12 + F.1 `/contract-library/*`; client DOC-DELTA pointer; no wipe DATA-01/GWC; honesty false. Residual: BE implement. |
| next_owner | **pm** → **dev-be** |
| ack_status | **PASS_TO_PM** |
| evidence_path | `docs/qa/evidence/po-hrm-contract-legal-print-data-02.md` |
