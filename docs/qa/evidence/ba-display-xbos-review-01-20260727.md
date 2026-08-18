# BA-Data — XBOS display label leak review (U72)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-DISPLAY-XBOS-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-07-27 |
| **sponsor_lock** | U72 — trường hiển thị phải là label nghiệp vụ rõ ràng, không raw key |
| **ack_status** | **PASS_TO_PM** |
| **API path note** | Entry cited `apps/api/xbos/` — SoT thực tế: **`apps/api/xbos-api/`** |

## 0. Scope & method

### BRD XBOS (UC inventory)

Nguồn: `docs/client-delivery/01_BRD_XeVN_OS.html` §3 + catalog UC:

| UC | Module | Priority |
|----|--------|----------|
| UC-B01 | Tạo Tenant mới | P0 |
| UC-B02 | Kích hoạt Tenant Admin | P0 |
| UC-B03 | Phân quyền RBAC | P0 |
| UC-B04 | Workflow Engine — phê duyệt | P0 |
| UC-B05 | Catalog Governance | P1 |
| UC-B06 | Audit Log & Compliance | P1 |
| UC-B07 | Impersonate Tenant | P2 |

Bổ sung surface Phase 1 đã ship (ngoài bảng UC-B* ngắn trong BRD): Command Center pháp nhân / ĐVTV / cổ đông / hạ tầng / RACI / inbox; `x-bos-core` Organization / KPI / Policy / Metadata; Settings business-master.

### Scan roots

| Layer | Path |
|-------|------|
| BE | `apps/api/xbos-api/src/**` (org-foundation, legal-entity-profile, catalog-governance, config-sync, workflow-engine, business-master, infrastructure, …) |
| FE portal | `apps/web/web-portal/src/pages/command-center/**`, settings, partners, customers, kpi |
| FE XBOS core | `apps/web/x-bos-core/src/pages/**` |
| FE consumer (XBOS SoT → HRM) | `apps/web/hrm/src/integrations/tenantScopeApi.ts` + Company Management — **cross-domain**, ghi để không bỏ sót U72 gốc |

### Verdict legend

| Code | Meaning |
|------|---------|
| ✅ PASS | UI đã map label VI (hoặc badge + label) |
| ❌ FAIL-LABEL-LEAK | Raw enum/key/slug hiện ra user-facing |
| ⚠️ UNKNOWN | Thiếu surface FE hoặc không xác định render |
| 🔵 N/A | Field tồn tại API/DB nhưng không render UI |

---

## 1. Tổ chức tập đoàn / Holding (Org Foundation)

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn (label cần) | Verdict |
|--------|--------|---------------------|---------------------|------------------------|---------|
| CC — danh sách pháp nhân | `entityLevel` (map từ `entity_type`) | `holding`→`parent`, `subsidiary` | `ENTITY_LEVEL_LABELS` → «Công ty mẹ / Công ty con / Công ty liên kết» | Label VI cấp bậc | ✅ PASS |
| CC — form cấp bậc | `entityLevel` select | `parent` / `subsidiary` / `affiliate` | Option text = label VI | Label VI | ✅ PASS |
| CC — toast / copy | literal `holding` | n/a | «hồ sơ tập đoàn (holding)» trong toast save | «tập đoàn» / «công ty mẹ» (không cần EN key) | ❌ FAIL-LABEL-LEAK |
| Apply catalog panel | copy «Nguồn holding» | n/a | «Nguồn holding», «Tải lại nguồn holding» | «Nguồn tập đoàn» / «Nguồn công ty mẹ» | ❌ FAIL-LABEL-LEAK |
| Org tree / dept | `org_type` | `department` / `org_unit` / `subsidiary` | Dùng nội bộ filter; list dept hiện **name** | — | 🔵 N/A (không render raw type cột) |
| BE `listGroupMemberUnits` | `entity_type` | `holding` / `subsidiary` | Wire JSON (không phải UI) | Wire giữ key; FE map | 🔵 N/A |

---

## 2. Đơn vị thành viên / Member Units

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn | Verdict |
|--------|--------|---------------------|---------------------|------------|---------|
| CC member list | `entityLevel` | `subsidiary` | Label VI qua `ENTITY_LEVEL_LABELS` | Label VI | ✅ PASS |
| CC member list | `business_lines` | TEXT / catalog key (`tourism`, …) | **Không có cột ngành** trên CC list | Nếu thêm cột: dictionary VI | 🔵 N/A |
| HRM Company (consumer XBOS) | `industry` ← `business_lines` | key hoặc VI | `resolveIndustryDisplay` + blocklist `holding`/`subsidiary` (wave D-HRM-CO-INDUSTRY) | Label VI hoặc «—» | ✅ PASS *(đã fix wave industry; regression guard)* |
| Global filter / mock | `industry` | mock string | «Tập đoàn (X-BOS)» / «Công ty thành viên» | Label VI | ✅ PASS |
| BE members payload | `entity_type` | `subsidiary` | JSON only | FE không bind vào «Ngành nghề» | 🔵 N/A |

---

## 3. Cổ đông (Shareholders)

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn | Verdict |
|--------|--------|---------------------|---------------------|------------|---------|
| CC shareholder table | `holder_name` | string | Input / text | Tên người | ✅ PASS |
| CC | `identity_code` | string | Input | CCCD/MST | ✅ PASS |
| CC | `ratio_percent` | number | Input % | Số % | ✅ PASS |
| CC | `contributed_value` | number | Input grouped VI | Số tiền | ✅ PASS |
| API/DB | `share_class` | — | **Không có cột** trên `xbos_legal_entity_shareholder` | — | 🔵 N/A |
| API/DB | `ownership_type` | — | Không có | — | 🔵 N/A |
| API | `status` | `active` / soft-delete `deleted` | Không render cột status trên UI cổ đông | Nếu hiện: «Hoạt động» | 🔵 N/A |

---

## 4. Pháp nhân (Legal Entities)

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn | Verdict |
|--------|--------|---------------------|---------------------|------------|---------|
| CC form | `enterpriseType` (payload) | `joint-stock` / `llc-2-members` / `llc-1-member` / `state-owned` | `<select>` option **text VI** | Tên loại hình đầy đủ | ✅ PASS |
| CC form | `enterpriseType` read-only ngoài select | cùng keys | Không có cell text riêng — chỉ select | Nếu có card tóm tắt: map label | 🔵 N/A |
| BE `entity_type` | `holding` / `subsidiary` | Wire | FE map `entityLevel` | Wire OK | 🔵 N/A |
| Mapper risk | `affiliate` / `associate` | API chủ yếu `holding`\|`subsidiary` | `legalEntityFormMapper` non-holding → luôn `subsidiary` | `associate`→`affiliate` label «Công ty liên kết» | ⚠️ UNKNOWN *(parity affiliate chưa chứng minh live)* |
| `is_public` / `is_listed` | — | Không thấy field LE | — | «Có»/«Không» | 🔵 N/A |
| `legal_form` jsc/llc/sole | — | Dùng `enterpriseType` keys khác (`joint-stock`…) | Select VI | Đồng bộ dictionary SoT | ✅ PASS *(UI)* / ⚠️ UNKNOWN *(catalog jsc/llc/sole không dùng)* |

---

## 5. Danh mục ngành nghề / loại hình (`business_lines`, `entity_type`)

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn | Verdict |
|--------|--------|---------------------|---------------------|------------|---------|
| Catalog governance | item `code` + `label` | code + label | Cột code (mono) + **label** | Code = mã danh mục OK; label = tên | ✅ PASS *(label)*; code intentional |
| Config-sync publish | `status` | `active` / `draft` | Admin tooling; item có `label` | Status badge VI nếu user-facing | ⚠️ UNKNOWN *(ít surface user)* |
| Business master settings | `code` / `nameVi` / `status` | active/inactive | Form mã+tên; table qua DataTable columns domain | Status badge VI ở Regions/Depts | ✅ PASS *(Regions/Depts/KPI formulas)* |
| `business_lines` SoT | TEXT free / catalog key | `tourism`, … | CC không nhập/hiện field riêng | Dictionary industries.* | 🔵 N/A *(CC)* / ✅ PASS *(HRM resolve)* |
| `entity_type` as industry | **anti-pattern** | `subsidiary` | Đã blocklist HRM | Không bao giờ làm «Ngành nghề» | ✅ PASS *(guard)* |

---

## 6. Hợp đồng XBOS

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn | Verdict |
|--------|--------|---------------------|---------------------|------------|---------|
| Hợp đồng XBOS module | — | Không có module contracts riêng trong `xbos-api` / portal `pages/contracts` | — | — | 🔵 N/A *(ngoài scope ship / chưa có UI)* |
| Legal documents | doc metadata | name/code/dates | Upload/list tên file | Tên tài liệu | ✅ PASS *(không enum status UI)* |

---

## 7. Báo cáo / Dashboard

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn | Verdict |
|--------|--------|---------------------|---------------------|------------|---------|
| Portal KPI dashboard | health `status` | `good`/`warning`/critical | Icon only (không text key) | Có thể thêm label VI | ✅ PASS |
| Portal KPI dashboard | `trend` | up/down | Icon | OK | ✅ PASS |
| x-bos-core KPI Definitions | `status` | `draft`/`active`/`inactive` | Badge **raw** `{row.status}` + select option = key | «Nháp» / «Hoạt động» / «Ngưng» | ❌ FAIL-LABEL-LEAK |
| x-bos-core KPI Definitions | `frequency` | `daily`/`weekly`/`monthly`/… | Cell + select raw English | «Hàng ngày» / «Hàng tuần» / «Hàng tháng»… | ❌ FAIL-LABEL-LEAK |
| x-bos-core KPI Assignments | header `status` | `draft`/`frozen`/… | `font-mono` raw + «Status: {h.status}» | Label VI + tiêu đề VI | ❌ FAIL-LABEL-LEAK |
| x-bos-core Policy | group/policy `status` | draft/active/inactive | Table + select raw | Label VI | ❌ FAIL-LABEL-LEAK |
| x-bos-core RewardPenalty | `status` | enum | Raw trong list | Label VI | ❌ FAIL-LABEL-LEAK |

---

## 8. Settings XBOS (+ portal surfaces dùng XBOS data)

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn | Verdict |
|--------|--------|---------------------|---------------------|------------|---------|
| Infra sites | `facilityType` | warehouse/parking/… | `INFRA_FACILITY_LABELS` VI | Label VI | ✅ PASS |
| Infra sites | `status` | active/maintenance/inactive | `INFRA_STATUS_LABELS` VI | Label VI | ✅ PASS |
| Infra custom field modal | `blockCode` options | `general`/`location`/`capacity` | **«general - Khối…»** (key prefix) | Chỉ «Khối Thông tin chung» | ❌ FAIL-LABEL-LEAK |
| Asset requests | `status` | workflow keys | `ASSET_REQUEST_STATUS_LABELS` | Label VI | ✅ PASS |
| Workflow instance | `status` | pending/running/completed/rejected | `workflowInstanceStatusLabelVi` | Label VI; **default fallback = raw status** | ✅ PASS *(known)* / ❌ FAIL-LABEL-LEAK *(unknown status → raw)* |
| RACI | letters R/A/C/I | letters | `RACI_LETTER_MEANINGS` | Chuẩn RACI | ✅ PASS |
| Partners page | `type` | `supplier`/`distributor`/`service` | Badge **raw** `{value}` | «Nhà cung cấp» / «Nhà phân phối» / «Dịch vụ» | ❌ FAIL-LABEL-LEAK |
| Partners / Customers | `status` | active/inactive | Label VI | Label VI | ✅ PASS |
| Customers | `type` | corporate/individual | «Doanh nghiệp» / «Cá nhân» | Label VI | ✅ PASS |
| Regions / Depts / KPI formulas settings | `status` | active/inactive | «Hoạt động» / «Ngưng» | Label VI | ✅ PASS |
| Vehicle types | `fuelType` | diesel/… | Select option VI; **không cột list** | Label VI | ✅ PASS *(form)* / 🔵 N/A *(list)* |
| Permission data scope | scope enum | personal/department/… | `PERMISSION_DATA_SCOPE_LABELS` | Label VI | ✅ PASS |

---

## 9. x-bos-core Organization / Metadata (XBOS app)

| Module | Trường | Giá trị nguồn (API/store) | Hiện tại UI hiển thị | Đúng chuẩn | Verdict |
|--------|--------|---------------------------|---------------------|------------|---------|
| OrganizationPage table | `orgTypeCode` | holding/subsidiary/division/department | **Raw** `{row.orgTypeCode}` | «Tập đoàn» / «Công ty con» / «Khối» / «Phòng ban» | ❌ FAIL-LABEL-LEAK |
| OrganizationPage select | `orgTypeCode` | same | `<option>` text = **key** | Label VI | ❌ FAIL-LABEL-LEAK |
| OrganizationPage | `status` | active/inactive | Badge **raw** `{row.status}` | «Hoạt động» / «Ngưng» | ❌ FAIL-LABEL-LEAK |
| MetadataConfigPage | `entityType` | `org_unit` | Raw `{m.entityType}` | «Đơn vị tổ chức» | ❌ FAIL-LABEL-LEAK |
| MetadataConfigPage | `dataType` | select/boolean/string… | Một phần raw (`m.dataType`, «select ·») | Label VI kiểu dữ liệu | ❌ FAIL-LABEL-LEAK |

---

## 10. Tổng hợp FAIL-LABEL-LEAK

| ID | Module / UI | Field | Raw hiện | Label chuẩn đề xuất | Owner |
|----|-------------|-------|----------|---------------------|-------|
| **F-XBOS-01** | `x-bos-core` OrganizationPage | `orgTypeCode` (table + select) | `holding`, `subsidiary`, … | Tập đoàn / Công ty con / Khối / Phòng ban | **dev-fe** |
| **F-XBOS-02** | `x-bos-core` OrganizationPage | `status` | `active` / `inactive` | Hoạt động / Ngưng | **dev-fe** |
| **F-XBOS-03** | `x-bos-core` MetadataConfigPage | `entityType`, `dataType` | `org_unit`, `boolean`, `select` | Label VI | **dev-fe** |
| **F-XBOS-04** | `x-bos-core` KPI Definitions | `status`, `frequency` | `draft`/`active`, `monthly`… | VI dictionary | **dev-fe** |
| **F-XBOS-05** | `x-bos-core` KPI Assignments | header `status` + EN «Status» | `draft`/`frozen` | «Trạng thái» + label VI | **dev-fe** |
| **F-XBOS-06** | `x-bos-core` PolicyManagementPage | group/policy `status` | draft/active/inactive | VI | **dev-fe** |
| **F-XBOS-07** | `x-bos-core` RewardPenaltyCalcPage | `status` | raw | VI | **dev-fe** |
| **F-XBOS-08** | PartnersPage | `type` | `supplier`/`distributor`/`service` | Nhà cung cấp / Nhà phân phối / Dịch vụ | **dev-fe** |
| **F-XBOS-09** | CC infra custom field modal | block options | `general - Khối…` | Chỉ label VI (ẩn key) | **dev-fe** |
| **F-XBOS-10** | CC ApplyCatalog + save toast | copy «holding» | EN jargon | «tập đoàn» / «công ty mẹ» | **dev-fe** |
| **F-XBOS-11** | `workflowInstanceStatusLabelVi` | unknown `status` | fallback raw string | «Không xác định» / map đủ enum BE | **dev-fe** (+ **dev-be** nếu thiếu enum SoT) |

### Không FAIL (đã PASS / N/A) — high-risk checklist U72

| Risk field | Kết luận |
|------------|----------|
| `entity_type` holding/subsidiary trên CC cấp bậc | ✅ map `ENTITY_LEVEL_LABELS` |
| `business_lines` lộ key như ngành | ✅ HRM guard; 🔵 CC không render |
| `status` infra / partners / customers / regions | ✅ label VI |
| `legal_form` / `enterpriseType` | ✅ select VI |
| `ownership_type` / `share_class` / `is_public` / `is_listed` | 🔵 không có trên schema/UI hiện tại |
| Hợp đồng XBOS | 🔵 không có module UI |

### Counts (rows đã chấm trong bảng §1–§9)

| Verdict | Count |
|---------||------:|
| ✅ PASS | **28** |
| ❌ FAIL-LABEL-LEAK | **18** field-rows ≈ **11** FAIL-ID (F-XBOS-01..11) |
| ⚠️ UNKNOWN | **4** |
| 🔵 N/A | **14** |

---

## 11. AC khắc phục (mỗi FAIL-ID)

### AC-F-XBOS-01 — Organization orgTypeCode
- **Given** user mở `x-bos-core` Tổ chức  
- **When** xem cột «Loại» và select «Loại đơn vị»  
- **Then** không còn chuỗi `holding|subsidiary|division|department` — chỉ label VI  
- **And** value submit API vẫn là enum key  
- **Regression:** jest map `ORG_TYPE_LABELS`

### AC-F-XBOS-02 — Organization status
- **Then** badge «Hoạt động» / «Ngưng» (không `active`/`inactive`)

### AC-F-XBOS-03 — Metadata entityType / dataType
- **Then** cột kiểu thực thể / kiểu dữ liệu = VI; code kỹ thuật chỉ trong tooltip admin (optional)

### AC-F-XBOS-04 — KPI status + frequency
- **Then** table + form options VI; wire keys unchanged

### AC-F-XBOS-05 — KPI assignment header
- **Then** bỏ EN «Status:»; dùng «Trạng thái: Nháp|Đóng băng|…»

### AC-F-XBOS-06 / 07 — Policy & RewardPenalty status
- **Then** mọi surface status VI

### AC-F-XBOS-08 — Partner type
- **Then** badge VI cho 3 loại; unknown → «Khác» không dump key

### AC-F-XBOS-09 — Infra block select
- **Then** option text chỉ label VI; `value=` giữ key

### AC-F-XBOS-10 — Holding copy
- **Then** UI copy không nhúng EN `holding` khi nói với user nghiệp vụ

### AC-F-XBOS-11 — Workflow status fallback
- **Then** mọi status BE đã ship có entry map; unknown → «Không xác định» (không echo raw)

### Shared BR (U72)

| ID | Rule |
|----|------|
| **BR-XBOS-LABEL-01** | User-facing text = dictionary VI; API/DB giữ enum key |
| **BR-XBOS-LABEL-02** | Cấm bind `entity_type` vào cột ngành nghề (đã khóa HRM) |
| **BR-XBOS-LABEL-03** | Boolean user-facing → «Có»/«Không» (khi field xuất hiện) |
| **VAL-XBOS-LABEL-01** | QA grep UI snapshot: không match `\b(holding|subsidiary|active|draft|monthly|supplier)\b` trên surface đã map (trừ mã danh mục `code` cột) |

---

## 12. Traceability (BRD/SRS → API → FE → Test)

| Requirement | API / DB | FE | Test / journey |
|-------------|----------|-----|----------------|
| U72 display labels | Wire enums OK | Label maps | QA browser UF-XBOS + x-bos-core pages |
| UC-B01..B03 org/tenant | `xbos_legal_entity.entity_type`, org_unit | CC `ENTITY_LEVEL_LABELS` | J-CC / UF-XBOS-01 |
| UC-B04 workflow | instance.status | `workflowInstanceStatusLabelVi` | UF-XBOS-08 / J-XBOS-01 |
| UC-B05 catalog | code+label | CatalogGovernancePanel | UF catalog |
| Shareholders UF-XBOS-05 | shareholder CRUD | CC table text fields | UF-XBOS-05 |
| Industry consumer | `business_lines` | HRM `resolveIndustryDisplay` | J-HRM-CO-01 / AC-CO-IND |

---

## 13. Data risks

| Risk | Mitigation |
|------|------------|
| `affiliate` FE vs API `associate`/`subsidiary` only | SA/BA confirm enum SoT; mapper 1:1 |
| `business_lines` free-text vs catalog key | Dictionary + empty «—» (đã HRM) |
| x-bos-core vẫn seed local — label leak dễ sót QA portal-only | QA matrix add x-bos-core routes |
| Fallback `?? status` / `?? next` | Fail-closed «Không xác định» |

---

## 14. Handoff

```yaml
work_item_id: BA-DISPLAY-XBOS-01
from_role: ba-data
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/ba-display-xbos-review-01-20260727.md
completion_report: |
  Closed: full XBOS domain label audit (8 modules + x-bos-core + portal consumers).
  Counts: PASS=28, FAIL-LABEL-LEAK field-rows=18 (11 FAIL-IDs F-XBOS-01..11), UNKNOWN=4, N/A=14.
  High-risk entity_type/business_lines on CC/HRM industry: PASS or N/A (prior industry wave).
  Residual: FE label maps for x-bos-core + Partners type + CC copy/options; workflow unknown fallback.
next_owner: dev-fe
next_dispatch_prompt: |
  work_item_id: D-XBOS-LABEL-FE-01
  role: dev-fe
  entry_criteria: evidence docs/qa/evidence/ba-display-xbos-review-01-20260727.md §10–§11; U72; U65 zero-seed
  scope: Fix F-XBOS-01..10 (x-bos-core Organization/Metadata/KPI/Policy/RewardPenalty; PartnersPage type;
         CC infra block options; holding copy). Map dictionaries VI; keep wire keys.
  must_keep: ENTITY_LEVEL_LABELS; INFRA_*_LABELS; HRM resolveIndustryDisplay; shareholder CRUD; no seed
  exit_criteria: AC-F-XBOS-01..10 PASS unit/static; no raw keys on listed surfaces; READY_FOR_QA
  evidence_path: docs/qa/evidence/dev-fe-xbos-label-01-20260727.md
  parallel_optional: D-XBOS-LABEL-FE-02 for F-XBOS-11 workflowInstanceStatusLabelVi exhaustiveness
```

**Residual for PM:** sau FE → Task `qa` browser spot F-XBOS-01/04/08 trên x-bos-core + Partners + CC; không claim Phase1/PROD từ governance doc này.
