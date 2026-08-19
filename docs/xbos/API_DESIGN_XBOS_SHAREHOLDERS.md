# API_DESIGN — XBOS Legal Entity Shareholders (list / create / update)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-SHAREHOLDER-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | Khách `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` **§3.6 FR-CC-P0-01** Diễn biến #1–7 · team `COMMAND_CENTER_P0_SRS.md` **UC-CC-P0-01** · **UF-XBOS-04** · **UF-XBOS-05** |
| **ref_techspec** | `docs/xbos/TECHSPEC.md` **§14.6** · CC P0 §4 · G-OA-04 CLOSED |
| **ref_db** | `docs/xbos/DB_DESIGN_XBOS_SHAREHOLDERS.md` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) · style `docs/hrm/API_DESIGN_HRM_COMPANY_LIST.md` |
| **U71** | Physical API F.1 before Dev claim on shareholder mutate depth |
| **Date** | 2026-07-27 |
| **Runtime** | `LegalEntityProfileController` · `LegalEntityProfileService` · prefix `/api/xbos/org-foundation` |
| **OpenAPI** | `docs/api/openapi/xbos-api.yaml` → `orgFoundationListShareholders` / `Create` / `Update` |
| **Consumers** | Command Center Settings — holding **TẬP ĐOÀN** + ĐVTV cổ đông tab · `legalEntityProfileApi.ts` |

> **Envelope:** Nest `ok(data, code, message)` — response body carries `code` below; HTTP status may be 200 even when code is `XBOS-SHR-201` (PUT) or Nest POST **201**.  
> **must_keep:** UF-XBOS-04/05 🟢 — POST **201** + F5 row remains; no seed for evidence (U65).

---

## 0. Common contract

| Item | Value |
|------|--------|
| Base path | `/api/xbos/org-foundation/legal-entities/{entityId}/shareholders` |
| Headers | `authorization` (or `x-internal-api-key`) · `x-tenant-id` · `x-company-id` |
| Path `entityId` | UUID Plane A `xbos_legal_entity.id` |
| Scope | Read: `readScope` · Mutate: `mutationScope` (group legal write) |
| Parent resolve | `resolveLegalEntityPartition(entityId)` → `{ tenantId, companyId }` |
| Response row shape | DB **snake_case** (`LegalEntityShareholder` OpenAPI) |
| Request body | camelCase (`ShareholderInput` / Create|Update DTO) |

### Locale bind (FE)

| Field | Rule |
|-------|------|
| `ratioPercent` | 0–100; **no** thousand grouping |
| `contributedValue` | Money — auto thousand group `vi-VN` on entry; parse plain number on submit |
| Empty money/ratio | Show `0` or `—` per existing CC form; never epoch junk |

---

## 1. Endpoint A — List shareholders

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/org-foundation/legal-entities/{entityId}/shareholders` |
| OpenAPI | `orgFoundationListShareholders` |
| Success | HTTP 200 · envelope **`XBOS-SHR-200`** · data `{ items: LegalEntityShareholder[] }` |
| Auth | Bearer / internal key + read scope |

### Mục đích

Cấp **danh sách cổ đông đang hiệu lực** của pháp nhân đang mở (tập đoàn hoặc ĐVTV) để FE vẽ bảng tab Cổ đông trước khi thêm/sửa — phục vụ UF-XBOS-04/05 bước mở list và F5 sau mutate.

### Nghiệp vụ xử lý

1. Assert internal/auth + resolve read scope headers.
2. `resolveLegalEntityPartition(entityId)` — missing LE → **`XBOS-DOC-404`**.
3. `SELECT * FROM xbos_legal_entity_shareholder WHERE legal_entity_id = $entityId AND tenant_id = $tenantId AND status = 'active' ORDER BY created_at`.
4. Return `{ items }` — empty array is valid (empty state, not error).
5. Does **not** include soft-deleted rows; does **not** mutate.

### Bước SRS

| UC / FR | Diễn biến # / bước | API role |
|---------|-------------------|----------|
| **FR-CC-P0-01** | **#2** Mở danh sách cổ đông → danh sách hiện có hoặc empty | **This endpoint** |
| **FR-CC-P0-01** | **#6** Tải lại trang → dòng còn (re-GET) | **This endpoint** |
| **UC-CC-P0-01** Happy #2 | FE GET → hiển thị bảng | Same |
| **UF-XBOS-04 / 05** | Pre-mutate paint + F5 verify | Same |

### DTO ↔ DB (response)

| Wire (snake) | DB column | Notes |
|--------------|-----------|-------|
| `id` | `id` | UUID |
| `tenant_id` | `tenant_id` | Partition |
| `company_id` | `company_id` | Partition denorm |
| `legal_entity_id` | `legal_entity_id` | Matches path |
| `holder_name` | `holder_name` | Display name |
| `identity_code` | `identity_code` | Nullable |
| `ratio_percent` | `ratio_percent` | 0–100 |
| `contributed_value` | `contributed_value` | Numeric |
| `status` | `status` | `active` on list |
| `created_at` / `updated_at` | same | ISO timestamptz |

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|----|
| Unauthenticated / bad key | `XBOS-AUTH-*` / reject | 401/403 | Banner; no fake rows |
| Legal entity not found / out of resolve | `XBOS-DOC-404` | 404 | Toast; empty table |
| Empty active set | `XBOS-SHR-200` + `items: []` | 200 | Empty state (PASS) |

### FE after 2xx (U65)

Bảng cổ đông paint từ `items`; không spinner storm; F5 gọi lại GET cùng `entityId`.

---

## 2. Endpoint B — Create shareholder

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/xbos/org-foundation/legal-entities/{entityId}/shareholders` |
| OpenAPI | `orgFoundationCreateShareholder` · body `CreateShareholderRequest` |
| Success | Nest **HTTP 201** · envelope **`XBOS-SHR-201`** · data = created row (snake_case) |
| Auth | Mutation scope (group legal write) |
| DTO | `ShareholderInput` — required `holderName` |

### Mục đích

Cho phép quản trị **thêm một dòng cổ đông** gắn pháp nhân đang chọn (holding root hoặc ĐVTV) từ UI Command Center — đóng AC UF-XBOS-04/05 «Thêm cổ đông + Lưu» với row persist và F5 còn.

### Nghiệp vụ xử lý

1. Assert auth + `mutationScope`.
2. Resolve parent LE partition → `{ tenantId, companyId }`; missing → **`XBOS-DOC-404`**.
3. Validate `holderName` trim — empty → **`XBOS-SHR-400`** («holderName is required»).
4. Validate `ratioPercent` (default `0`) ∈ **[0, 100]** — else **`XBOS-SHR-400`**.
5. Normalize `identityCode` trim or null; `contributedValue` → `Number(... ?? 0)` (≥ 0 per OpenAPI).
6. `INSERT` row `status` default `active` with denorm `tenant_id` / `company_id` / `legal_entity_id`.
7. `RETURNING *` → envelope `XBOS-SHR-201`.
8. **Không** gọi `publishVersionChange` làm SoT (UC BL-01-02).

### Bước SRS

| UC / FR | Diễn biến # / bước | API role |
|---------|-------------------|----------|
| **FR-CC-P0-01** | **#1** Auth/phạm vi sai → từ chối | Scope / partition |
| **FR-CC-P0-01** | **#3** Thiếu tên → từ chối | Validation |
| **FR-CC-P0-01** | **#4** Số không hợp lệ → từ chối | `ratioPercent` / value |
| **FR-CC-P0-01** | **#5** Lưu thành công → dòng mới | **This endpoint** |
| **FR-CC-P0-01** | **#7** Thành công cuối — khóa cổ đông | Return `id` |
| sequenceDiagram | «Thêm hoặc sửa cổ đông và Lưu» → Thành công | Create path |
| **UC-CC-P0-01** Happy #3–4 | Submit ✓ → POST → reload list | Same |
| **UF-XBOS-04** | ĐVTV — POST **201** + F5 | Same |
| **UF-XBOS-05** | Holding TẬP ĐOÀN — POST **201** `XBOS-SHR-201` | Same |

### DTO ↔ DB (request → insert)

| Request (camel) | DB column | Rules |
|-----------------|-----------|-------|
| `holderName` | `holder_name` | Required; trim; min 1 |
| `identityCode` | `identity_code` | Optional; trim → null if empty |
| `ratioPercent` | `ratio_percent` | Optional; default 0; 0–100 |
| `contributedValue` | `contributed_value` | Optional; default 0; ≥ 0 |
| *(path)* `entityId` | `legal_entity_id` | UUID FK |
| *(resolve)* | `tenant_id`, `company_id` | From parent LE — not body |

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|----|
| Missing / blank `holderName` | **`XBOS-SHR-400`** | 400 | Toast; **không** đánh dấu submitted local |
| `ratioPercent` ∉ [0,100] | **`XBOS-SHR-400`** | 400 | Same |
| LE not found / out of scope resolve | `XBOS-DOC-404` | 404 | Toast |
| Auth / mutation scope | auth / tenant codes | 401/403 | Banner |
| Insert failure | 500 platform | 500 | Toast; no optimistic commit |

### FE after 2xx (U65)

```markdown
### UF-XBOS-04 / UF-XBOS-05 — Thêm cổ đông
- Action: + Thêm → điền tên (+ tỷ lệ/giá trị) → ✓ / Lưu
- Network: POST …/shareholders → **201** · code **XBOS-SHR-201**
- FE sau 2xx: row xuất hiện trên bảng (id từ response hoặc re-GET)
- F5: GET list còn cùng holder_name
- Verdict: 🟢
```

---

## 3. Endpoint C — Update shareholder

### Identity

| Item | Value |
|------|--------|
| Method / path | `PUT /api/xbos/org-foundation/legal-entities/{entityId}/shareholders/{shareholderId}` |
| OpenAPI | `orgFoundationUpdateShareholder` · body `UpdateShareholderRequest` |
| Success | HTTP **200** · envelope **`XBOS-SHR-201`** («Shareholder saved») · data = updated row |
| Auth | Mutation scope |
| DTO | Partial `ShareholderInput` — COALESCE per field |

### Mục đích

Cho phép quản trị **sửa dòng cổ đông đã lưu** (tên, mã định danh, tỷ lệ, giá trị góp) trên cùng pháp nhân — khớp FR-CC-P0-01 nhánh sửa và UC-CC-P0-01 Alternate PUT.

### Nghiệp vụ xử lý

1. Assert auth + `mutationScope`.
2. Resolve parent LE partition (tenant).
3. `UPDATE … SET holder_name = COALESCE($trimName, holder_name), identity_code = COALESCE($5, identity_code), ratio_percent = COALESCE($6, ratio_percent), contributed_value = COALESCE($7, contributed_value), updated_at = NOW() WHERE id AND legal_entity_id AND tenant_id AND status = 'active' RETURNING *`.
4. No row → **`XBOS-SHR-404`**.
5. Note: empty-string `holderName` after trim becomes `null` → COALESCE keeps prior name (FE should send omitted field or valid name; product must not clear name via blank PUT without BA BR).
6. Return updated row + `XBOS-SHR-201`.

### Bước SRS

| UC / FR | Diễn biến # / bước | API role |
|---------|-------------------|----------|
| **FR-CC-P0-01** | Luồng chính #1–4 nhánh **sửa dòng** | **This endpoint** |
| **FR-CC-P0-01** | **#3–4** validation tên / số | Same codes as create when values sent |
| **FR-CC-P0-01** | **#5** Lưu thành công → dòng cập nhật | **This endpoint** |
| **FR-CC-P0-01** | **#6–7** F5 + khóa mang | Re-GET + return `id` |
| **UC-CC-P0-01** Alternate | Sửa dòng → `PUT …/shareholders/:id` | Same |
| sequenceDiagram | «Thêm hoặc sửa cổ đông và Lưu» | Update path |

### DTO ↔ DB (request → update)

| Request (camel) | DB column | COALESCE behavior |
|-----------------|-----------|-------------------|
| `holderName` | `holder_name` | Trim; empty → null → keep old |
| `identityCode` | `identity_code` | Trim; `?? null` |
| `ratioPercent` | `ratio_percent` | null → keep; if sent should be 0–100 (runtime create validates; update should reject out-of-range — **Dev residual** if missing) |
| `contributedValue` | `contributed_value` | null → keep |

Path: `shareholderId` → `id`; `entityId` → `legal_entity_id` predicate.

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|----|
| Active row not found / wrong entity | **`XBOS-SHR-404`** | 404 | Toast; no silent success |
| Validation (when enforced) | **`XBOS-SHR-400`** | 400 | Toast |
| LE resolve fail | `XBOS-DOC-404` | 404 | Toast |
| Scope / auth | auth / tenant | 401/403 | Banner |

### FE after 2xx (U65)

Row trên bảng phản ánh field mới; F5 GET còn; Network PUT 2xx + `XBOS-SHR-201`.

---

## 4. Related — Delete (soft) — not primary deliverable

| Item | Value |
|------|--------|
| Method / path | `DELETE …/shareholders/{shareholderId}` |
| Success | **`XBOS-SHR-204`** · `{ deleted: true }` |
| Nghiệp vụ | Soft `status='deleted'` |
| Bước SRS | Exception / cleanup (không phải Diễn biến #5 happy create) |
| Note | Documented for contract completeness; UF-XBOS-04/05 P0 = create (+ update) |

---

## 5. Error taxonomy (shareholder codes)

| Code | HTTP | Meaning |
|------|------|---------|
| `XBOS-SHR-200` | 200 | List OK |
| `XBOS-SHR-201` | 201 (POST) / 200 (PUT) | Create / update saved |
| `XBOS-SHR-204` | 200 | Soft-delete OK |
| `XBOS-SHR-400` | 400 | Validation (name / ratio) |
| `XBOS-SHR-404` | 404 | Shareholder not found (active) |
| `XBOS-DOC-404` | 404 | Parent legal entity partition missing |

---

## 6. Scope parity note (SA)

| Operation | Resolver | Parity rule |
|-----------|----------|-------------|
| List | `resolveLegalEntityPartition` + tenant filter | Same parent LE as create |
| Create / Update / Delete | Same partition resolve + mutation scope | **Must** match list parent |
| Holding vs member | Same endpoints; different `{entityId}` | UF-XBOS-05 vs UF-XBOS-04 |

**FAIL** if list used a different scope key than mutate (e.g. header company invent without LE resolve).

---

## 7. Residual (governance — not invent)

| Gap | Owner | Note |
|-----|-------|------|
| Khách SRS «Loại cổ đông» catalog | BA (+ SA if column) | No DB/DTO — do not ADD without delta |
| PUT `ratioPercent` out-of-range | Dev-BE verify | Create validates; update COALESCE path may skip — confirm jest |
| Sum ratios ≤/＝ 100 | BA optional | Not in Diễn biến — defer |
| OpenAPI deepen narrative | Optional | G-OA-04 CLOSED; this F.1 is U71 SoT for mục đích/bước SRS |

---

## 8. Out of scope

- Documents / upload APIs (`API_DESIGN_XBOS_ORG_LEGAL`)
- HRM Company industry / headcount
- Seed / API-only PASS for UF (U65)
- Changing envelope codes (`XBOS-SHR-*` must_keep)
