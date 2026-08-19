# PO-HRM-CONTRACT-LEGAL-PRINT-SA-02 — Group library publish (holding → member)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-SA-02` |
| **lane** | governance · sa |
| **change_mode** | ADD · **NO CODE** `apps/**` · **no wipe** print-spine GWC / F-CORE-CTR-* spine |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED architecture** — closes **Q-CTR-01**; ba-data physicalizes before Dev |
| **ADR** | [`ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH-20260807.md`](../../architecture/ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH-20260807.md) **Option A** |
| **ref_tech** | [`PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md) |
| **ref_data** | [`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **v0.18** · **FR-UC-BP-CORE-09a** Diễn biến **#1–#5** (+ distribution overlay) · CORE-09 consume |
| **parent_qc** | `PO-HRM-CONTRACT-LEGAL-PRINT-QC-01` GWC CONDITION Q-CTR-01 |
| **Honesty** | `contracts_printable_ready=false` |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Objective

Design **group-level** contract **template + clause pack** publish: holding authors → version freeze → member **pull** → **apply** → local merge/print (must_keep print-spine).

**Non-goals:** PDF binary engine (Q-CTR-02); claim printable module UAT; XBOS config-sync for legal bodies; live holding join at preview.

---

## 1. Architecture summary (Option A)

Reuse **catalog-sync discipline** inside HRM (not `synced_catalogs`):

| Step | Cap | Effect |
|------|-----|--------|
| Author | Existing TPL/CL at `holding` | Active library SoT |
| **Publish** | F-CORE-CTR-PUB-01 | Immutable bundle version N |
| **Pull** | F-CORE-CTR-PULL-01 | Upsert member drafts + lineage |
| **Apply** | F-CORE-CTR-APPLY-01 | Activate non-override lineages |
| Consume | PREV/VER/PDF | Local active only |

See ADR §5 for override + scope_parity rules.

---

## 2. DB sketch (ADD — ba-data owns physical confirm)

> Prefer ADD. **Cấm** replace `employee_contracts` / print_versions / wipe GĐ1 library tables.

### 2.1 `hrm_contract_library_publishes` (ADD)

| Column | Type | Rule |
|--------|------|------|
| `id` | uuid | PK |
| `tenant_id` | text | Master `xevn` (group) |
| `source_company_id` | text | Always **`holding`** for group publish |
| `publish_version` | int | Monotonic per tenant |
| `checksum` | text | Hash of canonical payload |
| `payload_json` | jsonb | Frozen: `{ templates[], clauses[], pack_rules[]? }` — only `status=active` at publish time |
| `label_vi` | text | Optional release note |
| `published_at` | timestamptz | |
| `published_by` | text/uuid | |
| `status` | text | `published`\|`retired` (retire = no new pulls; old pulls OK) |
| `archived_at` | timestamptz | Soft-delete |

| **UQ** | `(tenant_id, publish_version)` |
| **IX** | `(tenant_id, status, publish_version DESC)` |

**Payload item shape (intent):**

```json
{
  "templates": [{ "code", "name_vi", "pack_code", "layout_json", "keyword_map", "version" }],
  "clauses": [{ "code", "title_vi", "body_vi", "clause_group", "apply_to_packs", "sort_order", "mandatory", "version" }],
  "pack_rules": [{ "match_type", "match_value", "pack_code", "priority" }]
}
```

### 2.2 Lineage columns on existing library tables (EXPAND)

**`hrm_contract_templates` + `hrm_contract_clauses` (+ optional `hrm_contract_pack_rules`):**

| ADD column | Type | Rule |
|------------|------|------|
| `origin` | text | `member`\|`group`\|`member_override` — default `member` |
| `origin_company_id` | text | NULL if member-authored; `holding` if pulled |
| `origin_publish_version` | int | NULL if local; N after pull |
| `lineage_code` | text | Stable = `code` for group rows; UQ with company |

| **Rule** | Re-pull matches `(company_id, lineage_code)` where `origin IN ('group','member_override')` |

### 2.3 Optional `hrm_contract_library_pull_audits` (ADD)

| Column | Purpose |
|--------|---------|
| `id`, `company_id`, `publish_version`, `pulled_at`, `pulled_by` | Audit |
| `result_json` | `{ upserted, skipped_override, conflicts }` |

GĐ1.5 may log to platform audit instead — ba-data choose one.

### 2.4 Alias map delta

| Logical | Physical |
|---------|----------|
| `hrm_contract_library_publish` | **ADD** `hrm_contract_library_publishes` |
| lineage on template/clause | **EXPAND** columns on DATA-01 tables |
| print_version | **unchanged** — must_keep |

**Do not** store contract bodies in `synced_catalogs`.

---

## 3. Capability map — publish family

**Prefix physical:** `/api/hrm/contracts-insurance`  
**Envelope:** `{ code, message, data }`  
**Scope:** list ↔ get ↔ mutate = same resolver (U19).

| Cap | F-id | METHOD / path | SRS bước |
|-----|------|---------------|----------|
| Publish freeze | **F-CORE-CTR-PUB-01** | `POST …/contract-library/publishes` | **09a** distribution · #3 active set gate |
| List/get publishes | **F-CORE-CTR-PUB-02** | `GET …/contract-library/publishes` · `GET …/:publishVersion` | **09a #1** (group view) |
| Pull to member | **F-CORE-CTR-PULL-01** | `POST …/contract-library/pull` | **09a #1–#2** member consume |
| Apply pulled | **F-CORE-CTR-APPLY-01** | `POST …/contract-library/apply` | **09a #3** activate lineages |
| (Existing) CL/TPL | CL-01..04 · TPL-01/02 | unchanged | **09a #1–#5** author path |

---

## 4. API_DESIGN F.1 — publish / pull / apply

### 4.1 F-CORE-CTR-PUB-01 — Publish library pack

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-library/publishes` |
| **Mục đích** | Đóng băng gói mẫu + điều khoản (và tùy chọn pack_rules) đang **hiệu lực** tại pháp nhân tập đoàn (`holding`) thành phiên bản phát hành để công ty thành viên kéo về. |
| **Nghiệp vụ xử lý** | (1) Assert group config role + persist partition **`holding`** (ADR main↔holding). (2) Load all `status=active` templates + clauses (+ active pack_rules) under holding; exclude archived. (3) If both templates and clauses empty → `HRM-CTR-PUB-EMPTY`. (4) Canonicalize JSON → checksum; INSERT new `publish_version`. (5) **Không** mutate existing published rows. (6) Return display-ready `{ publish_version, checksum, template_count, clause_count, published_at }`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09a** Diễn biến **#3** (chỉ bản hiệu lực được phân phối) · hậu điều kiện «điều khoản hiệu lực sẵn sàng gắn mẫu và gói nghề» · BR-CTR-CL-01 (ban hành thư viện ≠ ghi đè HĐ cũ). |
| **Request** | `{ label_vi? }` — body **không** gửi `company_id` (query scope only; align print-spine body-clean). |
| **Response → DB** | `hrm_contract_library_publishes.*` |
| **Lỗi** | `HRM-CTR-PUB-EMPTY` · `HRM-CTR-PUB-FORBIDDEN` · scope 403/409 |
| **scope_parity** | List publishes (PUB-02) uses same group resolver as create. |

### 4.2 F-CORE-CTR-PUB-02 — List / get publish versions

| | |
|--|--|
| **METHOD / path** | `GET …/contract-library/publishes` · `GET …/contract-library/publishes/:publishVersion` |
| **Mục đích** | Cho HCNS tập đoàn / thành viên xem các phiên bản đã phát hành (số phiên bản · checksum · số mẫu/điều khoản) để chọn kéo về. |
| **Nghiệp vụ xử lý** | Scope assert; exclude `archived_at`; member may **read** publish metadata (not mutate); empty `[]` = 200. Get-by-version: same tenant; 404 if out of scope. **Không** return full `payload_json` on list (size); get may return summary + counts or full payload for pull preview. |
| **Tham chiếu bước SRS** | **09a #1** — mở thư viện theo đúng phạm vi (group catalog of releases). |
| **Lỗi** | 404 scope · 403 |

### 4.3 F-CORE-CTR-PULL-01 — Pull publish into member company

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-library/pull` |
| **Mục đích** | Sao chép payload phiên bản phát hành N vào partition pháp nhân thành viên dưới dạng bản nháp / synced — **chưa** tự kích hoạt (pull ≠ apply). |
| **Nghiệp vụ xử lý** | (1) Assert caller may mutate **target** `company_id` (member slug in scope). (2) Load publish N (`published`); retired → still pullable if policy allow else `HRM-CTR-PUB-RETIRED`. (3) For each template/clause: match `(company_id, lineage_code)`; if none → INSERT `origin=group`, draft; if `origin=group` → UPSERT body/meta from payload; if `origin=member_override` → skip unless `force=true`; if `origin=member` same code → `HRM-CTR-PUB-CODE-CONFLICT`. (4) Optional pack_rules upsert by match key. (5) Write pull audit. (6) Return `{ publish_version, upserted, skipped_override, conflicts }` — **không** set `active` unless apply. |
| **Tham chiếu bước SRS** | **09a #1–#2** — thành viên nhận nội dung cấu hình vào thư viện local (tạo/sửa bản nháp từ nguồn tập đoàn). |
| **Request** | `{ publish_version?, force?: boolean }` — default latest published; `company_id` **query only**. |
| **Response → DB** | Member `hrm_contract_templates` / `hrm_contract_clauses` (+ rules) + audit |
| **Lỗi** | `HRM-CTR-PUB-NOT-FOUND` · `HRM-CTR-PUB-CODE-CONFLICT` · `HRM-CTR-PUB-RETIRED` · scope |
| **scope_parity** | Target company must pass same list-scope assert as local CL list. |

### 4.4 F-CORE-CTR-APPLY-01 — Apply pulled pack (activate)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-library/apply` |
| **Mục đích** | Đưa các dòng đã kéo (`origin=group`, status draft/synced) sang **hiệu lực** trên pháp nhân thành viên để preview/in dùng được — tương đương bước kích hoạt thư viện local. |
| **Nghiệp vụ xử lý** | (1) Scope target company. (2) Select rows with `origin_publish_version=N` (or latest pulled) and `origin=group`. (3) For each lineage: retire prior **active** same `code` if not `member_override`; set `status=active`; bump local `version` when prior issued snapshots reference code (BR-CTR-CL-01). (4) **Never** mutate `hrm_contract_print_versions`. (5) If mandatory group clauses missing after apply → warn `missing_mandatory[]` (issue still gated by PREV/VER). (6) Return counts + display-ready active summary. |
| **Tham chiếu bước SRS** | **09a #3** — đưa sang hiệu lực; chỉ bản hiệu lực vào xem trước/in · AC-CTR-CL-01. |
| **Request** | `{ publish_version? }` query `company_id` |
| **Lỗi** | `HRM-CTR-PUB-NOTHING-TO-APPLY` · scope · `HRM-CTR-CL-CODE-CONFLICT` |
| **scope_parity** | Same as CL-03 activate on member partition. |

### 4.5 Overlay on existing CL list (display)

| | |
|--|--|
| **Cap** | F-CORE-CTR-CL-01 / TPL-01 (unchanged paths) |
| **ADD response fields** | `origin`, `origin_publish_version`, `origin_company_id` (display-ready) |
| **Tham chiếu** | **09a #1** — danh sách theo pháp nhân; badge nguồn tập đoàn |

---

## 5. Error taxonomy (ADD)

| Code | HTTP | When |
|------|------|------|
| `HRM-CTR-PUB-EMPTY` | 400 | Publish with 0 active templates **and** 0 active clauses |
| `HRM-CTR-PUB-FORBIDDEN` | 403 | Non-group role attempting publish |
| `HRM-CTR-PUB-NOT-FOUND` | 404 | Unknown publish_version |
| `HRM-CTR-PUB-RETIRED` | 400 | Policy blocks pull of retired |
| `HRM-CTR-PUB-CODE-CONFLICT` | 409 | Member-local code blocks lineage upsert |
| `HRM-CTR-PUB-NOTHING-TO-APPLY` | 400 | No pulled group drafts for version |
| `HRM-CTR-PUB-MANDATORY-GAP` | 200 warn / optional 400 | Apply missing mandatory — prefer warn + PREV gate |

Keep existing `HRM-CTR-CL-*` / `HRM-CTR-TPL-NONE` / print-spine codes.

---

## 6. must_keep / forbidden

### must_keep

- Print-spine GWC: PREV → VER → PDF stub path · UF-HRM-02 · Settings CL/TPL authoring
- BR-CTR-CL-01 snapshot immutability on issued print versions
- DATA-01 tables + F-CORE-CTR-01..PDF family
- ADR scope ladder `main`↔`holding` for group persist
- pull ≠ apply ≠ silent clone
- `contracts_printable_ready=false`

### forbidden

- `apps/**` this seat
- Live holding join inside PREV-01
- Dual-write contract bodies into `synced_catalogs` / XBOS catalog keys (GĐ1.5)
- Wipe or demote print-spine GWC / invent printable UAT
- Seed publish payloads for QA evidence (U65)

---

## 7. Traceability

| SRS | Cap | DB | Test intent |
|-----|-----|----|-------------|
| 09a #3 + distribution | PUB-01 | `hrm_contract_library_publishes` | Holding publish → version N |
| 09a #1–#2 | PULL-01 | lineage EXPAND | Member pull upsert draft |
| 09a #3 | APPLY-01 | local active | Apply → CL list active + badge |
| 09b/09c | PREV/VER | unchanged | Local library only; must_keep spine |
| BR-CTR-CL-01 | — | print_versions | Re-apply does not mutate issued |

**scope_parity:** PUB/PULL/APPLY + CL/TPL list/get share resolvers per ADR §5.5.

---

## 8. Q-CTR-01 closure stamp

| ID | Prior | Now |
|----|-------|-----|
| **Q-CTR-01** | OPEN — group vs per-company | **LOCKED Option A** (this ADR + SA-02) — ba-data physical next |
| Q-CTR-02 | OPEN PDF binary | Unchanged |
| Print-spine GWC | Sealed | **must_keep** |

---

## 9. Dev unlock (after ba-data)

1. ba-data CONFIRMED columns/UQ/IX + client DB/API DOC-DELTA pointer.  
2. Sponsor/PM unlock BE → FE → QA U65 for **group publish slice** (separate from printable module UAT).  
3. Honesty remains **false** until module printable gate.

---

## Completion contract

| Field | Value |
|-------|--------|
| completion_report | Closed: ADR Option A + F.1 PUB/PULL/APPLY + DB sketch + override/scope_parity; Q-CTR-01 architecture LOCK; print-spine GWC preserved; honesty false. Residual: ba-data physical + later BE/FE. |
| next_owner | **ba-data** (then PM → BE) |
| ack_status | **PASS_TO_PM** |
| evidence_path | `docs/qa/evidence/po-hrm-contract-legal-print-sa-02.md` |
