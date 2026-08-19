# API_DESIGN — HRM CompanyManagement list display (group-member-units + legal-entities)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-CO-INDUSTRY-SA-01` |
| **change_mode** | ADD |
| **ref_srs** | `docs/hrm/SRS.md` **UC-HRM-CO-01** sequence «Lấy group-member-units» → «Danh sách ĐVTV pháp nhân» · Data Interaction profile fields |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§20** (industry) · **§19** (headcount — orthogonal) |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_COMPANY_DISPLAY.md` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | Physical API slice before Dev/QA claim on «Ngành nghề» |
| **Date** | 2026-07-27 |
| **Consumers** | `apps/web/hrm` CompanyManagement · `tenantScopeApi.mapGroupMemberUnitsToHrmCompanies` · `enrichHrmCompaniesWithLegalProfiles` |

> **Rule:** Never expose raw enum (`subsidiary`, `holding`, catalog key) to end-user **without** VI label map on the FE bind layer (or server-side `*_label` if product adds it).

---

## 1. Endpoint A — Group member units (nav + thin/member profile)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/tenant-scope/group-member-units` |
| OpenAPI | `docs/api/openapi/xbos-api.yaml` → `tenantScopeGroupMemberUnits` |
| Runtime | `TenantScopeController` → `OrgFoundationService.listGroupMemberUnits` |
| Auth | Master/group membership; `XBOS-TENANT-403` for member-only CEO |
| Success | `200` · `XBOS-TENANT-200` |

### Mục đích

Cung cấp danh sách **tập đoàn (holding registry)** + **pháp nhân gốc từng ĐVTV** để màn **Company Management** (HRM embed) vẽ bảng ĐVTV: tên, mã, và các field hồ sơ Plane A (kể cả **ngành nghề** khi API trả `business_lines`).

### Nghiệp vụ xử lý

1. Resolve master tenant registry row → `holding`.
2. Join `xbos_tenant_registry` (member, active) ↔ `xbos_legal_entity` (`company_id = default_company_id`, not deleted).
3. Return `members[]` legal rows for FE map → `HrmCompanyRow`.
4. **Scope:** group CEO / master membership only (parity existing tenant-scope).
5. **Does not** compute headcount (Plane B — see employees/summary).

### Bước SRS

| UC | Sequence / Diễn biến | API role |
|----|----------------------|----------|
| **UC-HRM-CO-01** | «Mở menu Công ty» → **«Lấy group-member-units»** → «Danh sách ĐVTV pháp nhân» | **This endpoint** |
| **UC-HRM-CO-01** | Data Interaction: list ĐVTV (tên, MST, founded, …) | Profile columns including industry when exposed |
| **FR-XBOS-ORG-01** | Xem danh sách đơn vị thành viên | Same read plane |

### Response fields used by CompanyManagement (contract)

| Wire field | DB column | Mục đích UI | FE bind | Label rule |
|------------|-----------|-------------|---------|------------|
| `members[].id` | `id` | Row key | `HrmCompanyRow.id` | UUID as-is (not user label) |
| `members[].code` | `code` | Mã | `code` | as-is |
| `members[].name` | `name` | Tên công ty | `name` | as-is VI |
| **`members[].business_lines`** | **`business_lines`** | **Ngành nghề** | **`industry` ← resolve VI** | Catalog key→VI §20.3; empty→«—»; **never** show raw key if catalog known |
| `members[].entity_type` | `entity_type` | Loại ĐVTV only | **Not** `industry` | If UI shows: VI dict (`holding`→Tập đoàn, `subsidiary`→Công ty thành viên) |
| `members[].tax_code` | `tax_code` | MST | `tax_code` | as-is |
| `members[].established_at` | `established_at` | Ngày thành lập | `founded_date` | `yyyy-MM-dd` wire → `dd/MM/yyyy` display |
| `members[].address` | `address` | Địa chỉ | `address` | as-is |
| `members[].payload` | `payload` | Fallback form | companyForm → email/phone/website/**industry** | Industry fallback only if `business_lines` empty |
| `holding.*` | tenant registry | Holding nav row | Synthetic `GROUP_HOLDING_ROOT_ID` | Industry via legal-entities enrich |

### BE residual (contract gap → Dev)

**Current SELECT** (evidence code): `id, code, name, entity_type, payload` — **omits `business_lines`**.  

| Option | Verdict |
|--------|---------|
| **A** — ADD `le.business_lines` (+ `tax_code`, `established_at`, `address`) to `listGroupMemberUnits` SELECT | **Recommended** for single-call list paint |
| **B** — Keep thin list; **mandatory** FE enrich from Endpoint B before showing industry | Acceptable if enrich always runs (CO-BIND path) |

Either A or B must be explicit in FE handoff; silent `industry ← entity_type` is **forbidden**.

### Errors

| Condition | Code | FE |
|-----------|------|-----|
| Unauthenticated | `XBOS-AUTH-001` | Banner XBOS; no fake rows |
| Member CEO | `XBOS-TENANT-403` | Scope message |
| Empty members | `200` + `[]` | Empty state (not industry defect) |

---

## 2. Endpoint B — Legal entities list (profile SoT / CO-BIND)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/org-foundation/legal-entities` |
| Query / headers | `x-tenant-id`, `x-company-id` (`holding` for holding partition; `main` → flat member LEs) |
| OpenAPI | `orgFoundationListLegalEntities` |
| Runtime | `OrgFoundationService.listLegalEntities` / `listGroupMemberLegalEntitiesFlat` (`SELECT le.*`) |
| Success | `200` · `XBOS-ORG-200` |

### Mục đích

Cấp **hồ sơ pháp nhân đầy đủ** (kể cả `business_lines`, MST, `established_at`, payload) để FE **enrich** hàng Company sau `group-member-units` — đóng gap list mỏng và đảm bảo «Ngành nghề» đúng SoT.

### Nghiệp vụ xử lý

1. Resolve scope (`holding` vs group `main` flat members).
2. Return full `xbos_legal_entity` rows (`SELECT *` / `le.*`) — includes **`business_lines`** and **`entity_type`**.
3. FE matches by `id` / `tenant_id` / `code` → overwrite profile fields including industry.
4. Upsert path (`PUT …/legal-entities/{id}`) writes `businessLines` → `business_lines` (existing).

### Bước SRS

| UC | Sequence / Diễn biến | API role |
|----|----------------------|----------|
| **UC-HRM-CO-01** | After list load — enrich profile (MST, founded, **ngành nghề**) before paint complete | **This endpoint** (CO-BIND) |
| **FR-XBOS-ORG-03** | Hồ sơ pháp nhân | Read/write SoT |
| Data Interaction | Profile fields from XBOS legal | `business_lines` → industry |

### Response fields — industry-critical

| Wire field (snake or camel per serializer) | DB | Mục đích | FE bind | Label rule |
|--------------------------------------------|-----|----------|---------|------------|
| **`business_lines` / `businessLines`** | `business_lines` | Ngành nghề SoT | `industry` via `extractIndustryFromLegalSources` | VI map; no raw enum |
| `entity_type` / `entityType` | `entity_type` | Loại ĐVTV | Separate only | VI dict; **cấm** → `industry` |
| `payload.companyForm.industry` | JSONB | Fallback | Same extract helper | Same VI rules |
| `tax_code`, `established_at`, `address` | columns | Profile | CO-BIND fields | Date locale on FE |

### Write (related — industry persist)

| Item | Value |
|------|--------|
| Path | `PUT /api/xbos/org-foundation/legal-entities/{entityId}` |
| Body field | `businessLines` (DTO) |
| Nghiệp vụ | Upsert sets `business_lines = $n`; `entityType` only when intentionally changing **loại ĐVTV** |
| Bước SRS | FR-XBOS-ORG-03 lưu hồ sơ · Company form «Ngành nghề» Save |
| Cấm | Mapping industry Select → `entityType` |

### Errors

| Condition | Code | FE |
|-----------|------|-----|
| Scope mismatch | `SCOPE_CONTEXT_MISMATCH` / 409 | Banner; keep prior rows; industry «—» if enrich fail |
| Not found on PUT | `XBOS-ORG-404` | Toast; no silent success |

---

## 3. FE bind contract (copy into Dev Task)

```text
MUST:
  industry = resolveIndustryDisplay(business_lines)
            ?? resolveIndustryDisplay(companyForm.industry|businessLines|business_lines)
  resolveIndustryDisplay:
    - empty → null
    - token in {holding,subsidiary,parent,member,branch} → null
    - catalog key → VI label (TECHSPEC §20.3)
    - else free text as-is

MUST NOT:
  industry = entity_type
  industry = entityType
  Show "subsidiary" / "holding" in column «Ngành nghề»
```

| Surface | PASS | FAIL |
|---------|------|------|
| Table «Ngành nghề» | VI label or «—» | Raw `subsidiary` |
| Badge detail | Same | Raw enum |
| Form Select | Catalog keys + VI labels | Preselect from `entity_type` |

---

## 4. Orthogonal: headcount (do not mix)

| Field | API | See |
|-------|-----|-----|
| `employee_count` | `GET /api/hrm/employees/summary` → `by_company[]` | TECHSPEC §19 · `API_DESIGN` headcount / control doc |

Industry API_DESIGN **does not** redefine headcount.

---

## 5. QA evidence expectations (U65)

```markdown
### UF-HRM-CO-IND — Ngành nghề Company
- Persona: ceo@xe.vn · /command-center/hrm/company
- Network: group-member-units 2xx (+ legal-entities enrich if used)
- Cột «Ngành nghề»: không chứa "subsidiary"/"holding"
- Nếu DB business_lines=logistics → UI «Vận tải - Logistics» (hoặc free text VI)
- entity_type vẫn có trên JSON nhưng không bind industry
- F5: giữ label
- Verdict: 🟢 / 🔴
- spec_ref: TECHSPEC §20 · DB_DESIGN_HRM_COMPANY_DISPLAY · API_DESIGN_HRM_COMPANY_LIST
```

---

## 6. Out of scope

- New dedicated `/industries` catalog API (optional later)
- Changing JWT scope ladder
- Seed `business_lines` for QA PASS (U65)
