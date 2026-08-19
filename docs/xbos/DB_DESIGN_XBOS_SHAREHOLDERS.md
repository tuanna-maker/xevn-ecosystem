# DB_DESIGN — XBOS Legal Entity Shareholders (CC P0)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-SHAREHOLDER-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | Khách `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` **§3.6 FR-CC-P0-01** Diễn biến #1–7 · team `docs/xbos/COMMAND_CENTER_P0_SRS.md` **UC-CC-P0-01** · **UF-XBOS-04** · **UF-XBOS-05** |
| **ref_techspec** | `docs/xbos/TECHSPEC.md` **§14.6** · `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` §2 `xbos_legal_entity_shareholder` · §4 API · §6 codes |
| **ref_org_parent** | `docs/xbos/DB_DESIGN_XBOS_ORG_LEGAL.md` §1 — shareholders deferred to this slice |
| **ref_api** | `docs/xbos/API_DESIGN_XBOS_SHAREHOLDERS.md` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB slice before Dev claim on shareholder mutate / OpenAPI deepen |
| **Date** | 2026-07-27 |
| **Owner service** | XBOS (`xbos-api` · `LegalEntityProfileService` · `FoundationSchemaService.ensureAll`) |
| **Migration SoT** | `apps/api/xbos-api/migrations/20260518_legal_entity_profile.sql` |

> **Scope:** ownership rows under a Plane A legal entity.  
> **Out of scope:** legal profile PUT, documents, org-units, RACI, headcount (Plane B).  
> **must_keep:** UF-XBOS-04 / UF-XBOS-05 🟢 — do not regress browser POST/PUT AC when syncing docs only.

---

## 1. Table SoT

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`xbos_legal_entity_shareholder`** |
| Parent FK | `legal_entity_id` → `xbos_legal_entity(id)` **ON DELETE CASCADE** |
| Soft delete | `status = 'deleted'` (list filters `status = 'active'`) |
| Partition | `tenant_id` + `company_id` denormalized from parent LE resolve |
| Consumers | CC Settings cổ đông (holding root + ĐVTV) · portal `legalEntityProfileApi` |

---

## 2. Physical columns

| Column | Type | Null | Default | Meaning (VI) | API / UI role | `ref_srs` |
|--------|------|------|---------|--------------|---------------|-----------|
| **`id`** | UUID PK | NO | `gen_random_uuid()` | Định danh cổ đông | Path `{shareholderId}` · khóa mang Diễn biến #7 | FR-CC-P0-01 Kết quả |
| **`tenant_id`** | TEXT | NO | — | Partition tenant | Resolve from parent LE; list WHERE | Diễn biến #1 phạm vi |
| **`company_id`** | TEXT | NO | — | Partition trong tenant (`holding` / member slug) | Written on INSERT from `resolveLegalEntityPartition` | FR-CC-P0-01 tập đoàn vs thành viên |
| **`legal_entity_id`** | UUID FK | NO | — | Pháp nhân Plane A đang mở | Path `{entityId}` | Điều kiện tiên quyết FR |
| **`holder_name`** | TEXT | NO | — | Tên cổ đông | Create required; Update COALESCE | Diễn biến #3 · BL holderName |
| **`identity_code`** | TEXT | YES | — | CCCD / MST / mã định danh | Optional form | UC-CC-P0-01 Data Interaction |
| **`ratio_percent`** | NUMERIC(5,2) | YES | `0` | Tỷ lệ sở hữu 0–100 | **Exempt** thousand-group (percent) | Diễn biến #4 · NFR locale |
| **`contributed_value`** | NUMERIC(18,2) | YES | `0` | Giá trị góp (VND-scale numeric) | FE vi-VN thousand group on entry | Diễn biến #4 · money NFR |
| **`status`** | TEXT | NO | `'active'` | `active` \| `deleted` | Soft-delete; list active-only | UC-CC-P0-01 BL-01-02 |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Tạo | List ORDER BY | — |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Cập nhật | Touch on PUT / soft-delete | — |

### 2.1 Normative value sets

| Column | Allowed | Reject |
|--------|---------|--------|
| `status` | `active`, `deleted` | Other values (treat as non-listable) |
| `ratio_percent` | `0` … `100` inclusive | `< 0` or `> 100` → API `XBOS-SHR-400` |
| `contributed_value` | `≥ 0` | Negative → reject at API (OpenAPI `minimum: 0`) |
| `holder_name` | Trimmed length ≥ 1 (product max practical 200 — UC Data Interaction) | Empty / whitespace-only |

### 2.2 Client SRS residual (do **not** invent column)

| Khách SRS «Dữ liệu đầu vào» | Physical DB | Verdict |
|-----------------------------|-------------|---------|
| Tên cổ đông | `holder_name` | **Mapped** |
| Tỷ lệ / giá trị góp | `ratio_percent` · `contributed_value` | **Mapped** |
| **Loại cổ đông** (catalog if bắt buộc) | **No column / DTO today** | **Residual BA/SA** — runtime + OpenAPI thiếu; **cấm** invent `holder_type` in this ADD without BA delta + migration |

---

## 3. Indexes / constraints

| Constraint / index | Purpose |
|--------------------|---------|
| `PRIMARY KEY (id)` | Shareholder identity |
| `FOREIGN KEY (legal_entity_id) REFERENCES xbos_legal_entity(id) ON DELETE CASCADE` | Parent LE lifecycle |
| `idx_xbos_les_entity` on `(legal_entity_id, status)` | List active by entity |

**No unique** on `(legal_entity_id, holder_name)` — duplicate names allowed unless BA adds BR later.

Bootstrap parity: `FoundationSchemaService` `CREATE TABLE IF NOT EXISTS` mirrors migration (must stay column-aligned).

---

## 4. Partition & scope semantics

```text
Path entityId (LE UUID)
  → OrgFoundationService.resolveLegalEntityPartition(entityId)
  → { tenantId, companyId } from parent xbos_legal_entity
  → INSERT denormalizes tenant_id + company_id
  → LIST / UPDATE / DELETE filter legal_entity_id + tenant_id (+ status active for mutate)
```

| Rule | Verdict |
|------|---------|
| Holding root vs member LE | Same table + same columns; difference = which `{entityId}` user selected in scope |
| Header `x-company-id` vs row `company_id` | Mutation scope from JWT/headers; **persist partition from parent LE**, not arbitrary header invent |
| Cross-tenant write | Forbidden — LE not found / wrong partition → `XBOS-DOC-404` / `XBOS-SHR-404` |
| Soft-delete | `status='deleted'`; excluded from GET list |

**FAIL** if product inserts shareholders without resolving parent LE partition, or lists deleted rows as active.

---

## 5. Locale / NFR (column consumers)

| Field | Wire | FE display / entry |
|-------|------|--------------------|
| `ratio_percent` | number 0–100 | **No** thousand grouping (percent exempt) |
| `contributed_value` | plain number | **vi-VN** thousand group while typing; parse to number on submit |
| Dates | N/A on this table | — |

---

## 6. ER relationship (text)

```text
xbos_legal_entity (1) ──< (N) xbos_legal_entity_shareholder
         id                    legal_entity_id
         tenant_id / company_id  (denorm copy on write)
```

Orthogonal: `xbos_legal_entity_document` shares parent LE but **separate** slice (`DB_DESIGN_XBOS_ORG_LEGAL`).

---

## 7. must_keep / forbidden

| must_keep | forbidden |
|-----------|-----------|
| Soft-delete (not hard DELETE row) for UF F5 consistency | Seed shareholders for QA PASS (U65) |
| FK to Plane A LE UUID | Using LE UUID as HRM Plane B headcount key |
| `ratio_percent` 0–100 validation at service | Inventing `holder_type` without BA + migration |
| UF-XBOS-04/05 🟢 browser AC | Publish-version as SoT for shareholder save (BL-01-02) |

---

## 8. Verification (read-only)

```sql
-- Active shareholders per legal entity
SELECT legal_entity_id, COUNT(*) AS active_n
FROM public.xbos_legal_entity_shareholder
WHERE status = 'active'
GROUP BY legal_entity_id
ORDER BY active_n DESC;

-- Orphan check (should be 0 with FK)
SELECT s.id
FROM public.xbos_legal_entity_shareholder s
LEFT JOIN public.xbos_legal_entity le ON le.id = s.legal_entity_id
WHERE le.id IS NULL;
```

---

## 9. Out of scope

- Documents / upload storage
- Sum(`ratio_percent`) = 100 hard BR (not in SRS Diễn biến — optional future BA)
- OpenAPI path change (already G-OA-04 CLOSED)
- HRM Company headcount / industry columns
