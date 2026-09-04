# FIELD DISPLAY SRS — XBOS

## Document Information

| Field | Value |
|-------|-------|
| **Work Item ID** | BA-U72-FIELD-DISPLAY-XBOS-SRS-01 |
| **Project** | XeVN OS (XBOS – X-Business Operating System) |
| **Module** | XBOS Platform – Label Governance |
| **Rule Ref** | `.cursor/rules/display-label-no-raw-key.mdc` |
| **Status** | FINAL |
| **Date** | 2026-07-28 |

---

## Base Rule: 5 mục/field

Mỗi field xuất hiện trên UI phải có đủ **5 mục**:
1. **Nguồn field** – bảng / API / catalog nào cung cấp giá trị
2. **Label tiếng Việt** – chuỗi hiển thị
3. **Dạng giá trị nguồn** – enum key · UUID · boolean · slug …
4. **Dạng hiển thị UI** – text · badge · select dropdown · icon+badge …
5. **Khi null/empty** – luôn `—` (em dash), không để trống

Quy tắc cứng: null/undefined/empty → `—`; true/false → «Có»/«Không»; enum slug → VI label; UUID → tên đầy đủ từ context.

---

## FAIL-LABEL-LEAK Register (11 items)

---

### F-XBOS-01 · OrganizationPage · `orgTypeCode`

| # | Mục | Nội dung |
|---|-----|---------|
| 1 | **Nguồn field** | Bảng `xbos.organization` → cột `org_type_code` |
| 2 | **Label VI** | `"Loại tổ chức"` (column header) |
| 3 | **Dạng nguồn** | enum key: `holding` / `subsidiary` / `division` / `department` |
| 4 | **Dạng UI** | Badge text |
| 5 | **null →** | `—` |

**Label map:**

| enum key | Label VI |
|----------|----------|
| `holding` | Tập đoàn / Công ty mẹ |
| `subsidiary` | Công ty con |
| `division` | Khối |
| `department` | Phòng ban |
| *(null/other)* | `—` |

---

### F-XBOS-02 · OrganizationPage · `status`

| # | Mục | Nội dung |
|---|-----|---------|
| 1 | **Nguồn field** | Bảng `xbos.organization` → cột `status` |
| 2 | **Label VI** | `"Trạng thái"` (column header) |
| 3 | **Dạng nguồn** | enum key: `active` / `inactive` |
| 4 | **Dạng UI** | Badge (màu xanh lá / xám) |
| 5 | **null →** | `—` |

**Label map:**

| enum key | Label VI | UI hint |
|----------|----------|---------|
| `active` | Hoạt động | badge green |
| `inactive` | Ngưng | badge gray |
| *(null/other)* | `—` | no badge |

---

### F-XBOS-03 · MetadataConfigPage · `entityType` + `dataType`

| # | Mục | Nội dung |
|---|-----|---------|
| 1 | **Nguồn field** | Bảng `xbos.metadata_config` → cột `entity_type` + `data_type` |
| 2 | **Label VI** | `"Loại thực thể"` (entityType) · `"Kiểu dữ liệu"` (dataType) |
| 3 | **Dạng nguồn** | enum key: `org_unit` (entityType); `boolean` / `select` / `string` (dataType) |
| 4 | **Dạng UI** | Select dropdown / text input read-only |
| 5 | **null →** | `—` |

**Label map (entityType):**

| enum key | Label VI |
|----------|----------|
| `org_unit` | Đơn vị tổ chức |
| *(null/other)* | `—` |

**Label map (dataType):**

| enum key | Label VI |
|----------|----------|
| `boolean` | Có/Không |
| `select` | Danh sách chọn |
| `string` | Văn bản |
| *(null/other)* | `—` |

---

### F-XBOS-04 · KPI Definitions · `status` + `frequency`

| # | Mục | Nội dung |
|---|-----|---------|
| 1 | **Nguồn field** | Bảng `xbos.kpi_definition` → cột `status` + `frequency` |
| 2 | **Label VI** | `"Trạng thái"` (status) · `"Tần suất"` (frequency) |
| 3 | **Dạng nguồn** | enum key: `draft` / `active` / `inactive` (status); `daily` / `weekly` / `monthly` (frequency) |
| 4 | **Dạng UI** | Badge (status) · Select dropdown (frequency) |
| 5 | **null →** | `—` |

**Label map (status):**

| enum key | Label VI | UI hint |
|----------|----------|---------|
| `draft` | Nháp | badge gray |
| `active` | Hoạt động | badge green |
| `inactive` | Ngưng | badge red |
| *(null/other)* | `—` | no badge |

**Label map (frequency):**

| enum key | Label VI |
|----------|----------|
| `daily` | Hàng ngày |
| `weekly` | Hàng tuần |
| `monthly` | Hàng tháng |
| *(null/other)* | `—` |

---

### F-XBOS-05 · KPI Assignments · `status` (header)

| # | Mục | Nội dung |
|---|-----|---------|
| 1 | **Nguồn field** | Bảng `xbos.kpi_assignment` → cột `status` |
| 2 | **Label VI** | `"Trạng thái"` (column header) |
| 3 | **Dạng nguồn** | enum key: `draft` / `frozen` |
| 4 | **Dạng UI** | Badge text trong header section |
| 5 | **null →** | `—` |

**Label map:**

| enum key | Label VI | UI hint |
|----------|----------|---------|
| `draft` | Nháp | badge gray |
| `frozen` | Đóng băng | badge blue |
| *(null/other)* | `—` | no badge |

---

### F-XBOS-06 · PolicyManagementPage · `groupStatus` + `policyStatus`

| # | Mục | Nội dung |
|---|-----|---------|
| **F-XBOS-06a – Nhóm chính sách** | | |
| 1 | **Nguồn field** | Bảng `xbos.policy_group` → cột `status` |
| 2 | **Label VI** | `"Trạng thái nhóm"` |
| 3 | **Dạng nguồn** | enum key: active / inactive / draft |
| 4 | **Dạng UI** | Badge |
| 5 | **null →** | `—` |
| **F-XBOS-06b – Chính sách** | | |
| 1 | **Nguồn field** | Bảng `xbos.policy` → cột `status` |
| 2 | **Label VI** | `"Trạng thái chính sách"` |
| 3 | **Dạng nguồn** | enum key: active / inactive / draft |
| 4 | **Dạng UI** | Badge + icon indicator |
| 5 | **null →** | `—` |

**Label map – policyStatus / groupStatus (shared vocabulary):**

| enum key | Label VI | UI hint |
|----------|----------|---------|
| `active` | Hoạt động | badge green |
| `inactive` | Ngưng | badge gray |
| `draft` | Nháp | badge gray-outline |
| *(null/other)* | `—` | no badge |

---

### F-XBOS-07 · RewardPenaltyCalcPage · `status`

| # | Mục | Nội dung |
|---|-----|---------|
| 1 | **Nguồn field** | Bảng `xbos.reward_penalty_config` → cột `status` |
| 2 | **Label VI** | `"Trạng thái cấu hình"` (column header) |
| 3 | **Dạng nguồn** | enum key: `active` / `inactive` / `draft` |
| 4 | **Dạng UI** | Badge (green / gray / outline) |
| 5 | **null →** | `—` |

**Label map (shared with F-XBOS-06):**

| enum key | Label VI | UI hint |
|----------|----------|---------|
| `active` | Hoạt động | badge green |
| `inactive` | Ngưng | badge gray |
| `draft` | Nháp | badge gray-outline |
| *(null/other)* | `—` | no badge |

---

### F-XBOS-08 · PartnersPage · `type`

| # | Mục | Nội dung |
|---|-----|---------|
| 1 | **Nguồn field** | Bảng `xbos.partner` → cột `partner_type` |
| 2 | **Label VI** | `"Loại đối tác"` (column header) |
| 3 | **Dạng nguồn** | enum key: `supplier` / `distributor` / `service` |
| 4 | **Dạng UI** | Badge + icon (truck / store / service-bell) |
| 5 | **null →** | `—` |

**Label map:**

| enum key | Label VI | Icon hint |
|----------|----------|-----------|
| `supplier` | Nhà cung cấp | truck / box |
| `distributor` | Nhà phân phối | store |
| `service` | Dịch vụ | service-bell / wrench |
| *(null/other)* | `—` | no icon |

---

### F-XBOS-09 · CC Infra · Custom field `blockCode` options

| # | Mục | Nội dung |
|---|-----|---------|
| 1 | **Nguồn field** | Catalog `xbos.custom_field_options` → filter `block_code` = `general` |
| 2 | **Label VI** | `"Khối Thông tin chung"` (block badge) |
| 3 | **Dạng nguồn** | enum key: `general` / `location` / `capacity` |
| 4 | **Dạng UI** | Block badge (non-editable label trên custom field panel) |
| 5 | **null →** | `—` |

**Label map (front có filter về `general` only):**

| enum key | Label VI |
|----------|----------|
| `general` | Khối Thông tin chung |
| `location` | Khối Vị trí |
| `capacity` | Khối Công suất |
| *(null/other)* | `—` |

**Behavior:** Page chỉ render custom fields thuộc block `general`. User không cần thấy `location` hoặc `capacity` trên màn hình CC Infra này. Bộ lọc backend: `WHERE block_code = 'general'`.

---

### F-XBOS-10 · ApplyCatalog + toast · `"holding"` copy

| # | Mục | Nội dung |
|---|-----|---------|
| 1 | **Nguồn field** | Catalog `xbos.org_type_labels` + toast notification service |
| 2 | **Label VI** | Toast success message sau apply catalog |
| 3 | **Dạng nguồn** | Enum key `holding` → dynamic string từ catalog (không hardcode) |
| 4 | **Dạng UI** | Toast notification (fade-in / auto-dismiss sau 5s) |
| 5 | **null →** | Không áp dụng – catalog luôn có giá trị default |

**Toast copy template:**

| Trigger | Toast text (VI) |
|---------|----------------|
| Apply org type = holding | `Đã áp dụng loại tổ chức "Tập đoàn / Công ty mẹ" thành công` |
| Apply org type = subsidiary | `Đã áp dụng loại tổ chức "Công ty con" thành công` |
| Apply org type = division | `Đã áp dụng loại tổ chức "Khối" thành công` |
| Apply org type = department | `Đã áp dụng loại tổ chức "Phòng ban" thành công` |

**Rule:** Không hardcode `"holding"` → toast. Luôn lookup `xbos.org_type_labels[code]` từ catalog.

---

### F-XBOS-11 · Workflow Instance · `statusLabelVi` (unknown status)

| # | Mục | Nội dung |
|---|-----|---------|
| 1 | **Nguồn field** | BE enum `WorkflowInstanceStatus` → FE map `workflowInstanceStatusLabelVi` |
| 2 | **Label VI** | `"Trạng thái"` (column header trong list) |
| 3 | **Dạng nguồn** | enum key từ BE: `pending` / `approved` / `rejected` / `cancelled` / *(unknown)* |
| 4 | **Dạng UI** | Badge (màu theo trạng thái) |
| 5 | **null/unknown →** | `"Không xác định"` |

**Full enum map (phải đủ):**

| enum key | Label VI | Màu badge |
|----------|----------|-----------|
| `pending` | Chờ xử lý | vàng |
| `approved` | Đã phê duyệt | xanh lá |
| `rejected` | Từ chối | đỏ |
| `cancelled` | Đã hủy | xám |
| *(null/unknown/else)* | **Không xác định** | xám nhạt |

**FE utility (reference):**

```typescript
// xbos/utils/labelVi.ts
export const workflowInstanceStatusLabelVi = (key: string | null | undefined): string => {
  if (!key) return 'Không xác định';
  const map: Record<string, string> = {
    pending: 'Chờ xử lý',
    approved: 'Đã phê duyệt',
    rejected: 'Từ chối',
    cancelled: 'Đã hủy',
  };
  return map[key] ?? 'Không xác định';
};
```

---

---

## Cross-Reference: Shared Label Vocabularies

| Vocabulary | Used in | Shared keys |
|------------|---------|-------------|
| `orgTypeLabelVi` | F-XBOS-01, F-XBOS-10 | holding / subsidiary / division / department |
| `orgStatusLabelVi` | F-XBOS-02 | active / inactive |
| `kpiStatusLabelVi` | F-XBOS-04 | draft / active / inactive |
| `freqLabelVi` | F-XBOS-04 | daily / weekly / monthly |
| `kpiAssignmentStatusLabelVi` | F-XBOS-05 | draft / frozen |
| `policyStatusLabelVi` | F-XBOS-06, F-XBOS-07 | active / inactive / draft |
| `partnerTypeLabelVi` | F-XBOS-08 | supplier / distributor / service |
| `blockCodeLabelVi` | F-XBOS-09 | general / location / capacity |
| `workflowInstanceStatusLabelVi` | F-XBOS-11 | pending / approved / rejected / cancelled |

---

## QC Checklist

| ID | Check | Expected | Result |
|----|-------|----------|--------|
| F-XBOS-01 | `orgTypeCode=holding` → raw key on UI | Map → «Tập đoàn / Công ty mẹ» | ☐ |
| F-XBOS-01 | `orgTypeCode=null` → empty cell | Display `—` | ☐ |
| F-XBOS-02 | `status=active` → raw key on UI | Map → «Hoạt động» badge green | ☐ |
| F-XBOS-02 | `status=inactive` → raw key on UI | Map → «Ngưng» badge gray | ☐ |
| F-XBOS-03 | `entityType=org_unit` → raw key | Map → «Đơn vị tổ chức» | ☐ |
| F-XBOS-03 | `dataType=boolean` → raw key | Map → «Có/Không» | ☐ |
| F-XBOS-04 | `status=draft` → raw key | Map → «Nháp» badge | ☐ |
| F-XBOS-04 | `frequency=monthly` → raw key | Map → «Hàng tháng» | ☐ |
| F-XBOS-05 | `status=frozen` → raw key | Map → «Đóng băng» | ☐ |
| F-XBOS-06 | group/policy `status=null` → empty | Display `—` | ☐ |
| F-XBOS-07 | `status=null` → empty | Display `—` | ☐ |
| F-XBOS-08 | `type=service` → raw key | Map → «Dịch vụ» | ☐ |
| F-XBOS-09 | Block page shows only `general` block | Badge text = «Khối Thông tin chung» | ☐ |
| F-XBOS-10 | Apply catalog holding → toast | Text contains catalog label (not `"holding"`) | ☐ |
| F-XBOS-11 | FE receives unknown status key | Badge = «Không xác định» | ☐ |
| ALL | Any field = null/undefined/empty | Displays `—` (em dash) | ☐ |
| ALL | Any boolean field | Displays «Có»/«Không» | ☐ |

---

## Appendix: FE Utility File Reference

```
apps/api/xbos/
├── src/
│   ├── modules/
│   │   ├── organization/
│   │   │   └── utils/
│   │   │       └── labelVi.ts         ← orgTypeLabelVi, orgStatusLabelVi
│   │   ├── metadata/
│   │   │   └── utils/
│   │   │       └── labelVi.ts         ← entityTypeLabelVi, dataTypeLabelVi
│   │   ├── kpi/
│   │   │   ├── definitions/
│   │   │   │   └── utils/
│   │   │   │       └── labelVi.ts     ← kpiStatusLabelVi, freqLabelVi
│   │   │   └── assignments/
│   │   │       └── utils/
│   │   │           └── labelVi.ts     ← kpiAssignmentStatusLabelVi
│   │   ├── policy/
│   │   │   └── utils/
│   │   │       └── labelVi.ts         ← policyStatusLabelVi
│   │   ├── reward-penalty/
│   │   │   └── utils/
│   │   │       └── labelVi.ts         ← rewardPenaltyStatusLabelVi
│   │   ├── partner/
│   │   │   └── utils/
│   │   │       └── labelVi.ts         ← partnerTypeLabelVi
│   │   ├── workflow/
│   │   │   └── utils/
│   │   │       └── labelVi.ts         ← workflowInstanceStatusLabelVi
│   │   └── shared/
│   │       └── catalog/
│   │           └── orgTypeLabels.json ← runtime catalog (BA populates)
│   └── components/
│       └── ui/
│           ├── StatusBadge.tsx        ← reusable badge component
│           ├── EmDashCell.tsx         ← wrapper: null → `—`
│           └── Toast.tsx              ← notification with catalog lookup
```

---

## Source Hierarchy

| Source Tier | Where | Examples |
|-------------|-------|----------|
| **T1 – Static map trong FE** | `utils/labelVi.ts` | `orgTypeLabelVi`, `freqLabelVi` |
| **T2 – Catalog từ BE** | GET `/api/xbos/catalogs/org-types` | Runtime label map cho toast |
| **T3 – DB enum via API** | GET `/api/xbos/metadata/enums` | Dynamic enum discovery (fallback) |

Quy tắc ưu tiên: T1 (hardcode VI) → T2 (catalog, KHÔNG hardcode raw key) → T3 (BE enum, map qua T1).

---

## Trace to Rule

Mỗi FAIL ID phải có trong FE một utility function tương ứng. Mapping:

| FAIL ID | FE Utility | Rule violated |
|---------|-----------|---------------|
| F-XBOS-01 | `orgTypeLabelVi()` | Must map `holding`/`subsidiary`/… → VI |
| F-XBOS-02 | `orgStatusLabelVi()` | Must map `active`/`inactive` → VI |
| F-XBOS-03 | `entityTypeLabelVi()` + `dataTypeLabelVi()` | Must map enum → VI |
| F-XBOS-04 | `kpiStatusLabelVi()` + `freqLabelVi()` | Must map 2 cols |
| F-XBOS-05 | `kpiAssignmentStatusLabelVi()` | Must map `draft`/`frozen` → VI |
| F-XBOS-06 | `policyStatusLabelVi()` | Must map status → VI |
| F-XBOS-07 | `rewardPenaltyStatusLabelVi()` | Must map status → VI |
| F-XBOS-08 | `partnerTypeLabelVi()` | Must map type → VI + icon |
| F-XBOS-09 | `blockCodeLabelVi()` filtered | Page shows only `general` block |
| F-XBOS-10 | Toast service + `orgTypeLabels` catalog | Must NOT hardcode `"holding"` |
| F-XBOS-11 | `workflowInstanceStatusLabelVi()` | Must handle unknown → «Không xác định» |
