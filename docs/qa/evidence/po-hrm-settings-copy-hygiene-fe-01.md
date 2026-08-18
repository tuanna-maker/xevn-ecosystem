# Evidence — PO-HRM-SETTINGS-COPY-HYGIENE-FE-01

Ngày: 2026-08-13
Vai trò: dev-fe
Phạm vi: dọn copy jargon nội bộ (FR-/AC-/BR-/U-number, SoT, ghi chú QA nội bộ) khỏi text
end-user trên các màn Cài đặt (Settings) HRM. Không đổi hành vi/logic API.

## Danh sách file đã sửa

### 1. `apps/web/hrm/src/components/settings/MasterDataSettingsPanel.tsx`
- Xóa hẳn `function PickerSmokePreview()` (widget dev/QA test picker sót lại trong production)
  và điểm gọi `<div className="border-t pt-4"><PickerSmokePreview /></div>` ở cuối
  `MasterDataSettingsPanel`.
- Xóa import không còn dùng sau khi bỏ `PickerSmokePreview`: `HRM_MASTER_DATA_CATALOG_KEYS`
  (từ `@/lib/catalogSearchPicker`) và `CatalogSearchPicker`
  (từ `@/components/common/CatalogSearchPicker`).
- `DialogTitle`: `Thêm / cập nhật mục (extension HRM)` (cố định, có ngoặc kỹ thuật)
  → `{code ? 'Cập nhật' : 'Thêm mới'} {meta.title}` (động theo bucket + chế độ tạo/sửa,
  vd "Thêm mới Chức danh" / "Cập nhật Chức danh").
- Xóa hẳn `<p>` caption QA nội bộ dưới form: "Sau Lưu danh sách cập nhật; F5 vẫn còn (U65).
  Chọn dòng để sửa nhãn; Ngưng = soft-stop (không xóa cứng). Form nghiệp vụ chỉ chọn qua
  picker — không gõ free-text SoT."
- Header mỗi bucket: bỏ `{meta.fr}` (mã FR-HRM-SC-*) khỏi dòng caption; viết lại phần còn
  lại tự nhiên hơn — có catalog thì chỉ hiện `resolveCatalogKeyDisplayLabel(...)`, chưa có
  thì hiện "Chưa có danh mục — thêm mục bên dưới sẽ tạo mới."
- `CardTitle`: "Danh mục nghiệp vụ (master data)" → "Danh mục nghiệp vụ".
- `CardDescription`: câu cũ chứa "(E1-B)", "FR-HRM-SC-*", "(U72)", mã kỹ thuật → viết lại
  thuần Việt: "Quản lý các danh mục dùng chung cho hồ sơ nhân viên, hợp đồng và tuyển dụng.
  Mẫu JD và thành phần lương chi tiết được quản lý riêng tại các phân hệ tương ứng."
- Tab JT: bỏ `<strong>FR-HRM-SC-JT-01</strong> — `; viết lại: "Mẫu tin tuyển dụng (JD) được
  quản lý tại Thư viện JD. Yêu cầu tuyển dụng chọn mẫu qua ô tìm kiếm."
- Tab PAY: bỏ `<strong>FR-HRM-SC-PAY-01</strong> — `; viết lại: "Thành phần lương được vận
  hành chi tiết tại Phân hệ Lương. Danh mục ở tab «Thành phần lương (danh mục)»."
- Thêm khối `@CODE-MEMORY-CHANGE 2026-08-13 PO-HRM-SETTINGS-COPY-HYGIENE-FE-01` (change_mode:
  FIX) nối tiếp sau khối PO-HRM-SETTINGS-MD-PANEL-UPSERT-DIALOG-01 đã có.
- Không đổi bất kỳ `data-testid` nào; không đổi `upsertMutation`/API call shape.

### 2. `apps/web/hrm/src/lib/mdBucketRegistry.ts`
- Xóa đuôi ngoặc kỹ thuật `(bind E1-A)` / `(E3)` khỏi 5 field `description` (render thẳng
  ra UI qua `meta.description`), giữ nguyên phần câu chính:
  - `contractTypes.description`: `... (bind E1-A).` → `...` (bỏ đuôi ngoặc).
  - `jobGrades.description`: `... (bind E1-A).` → `...` (bỏ đuôi ngoặc).
  - `insurers.description`: `... (E3). Empty = ...` → `... Empty = ...` (bỏ đuôi ngoặc).
  - `insuranceTypes.description`: `... (E3).` → `...` (bỏ đuôi ngoặc).
  - `kpiLibrary.description`: `... (E3).` → `...` (bỏ đuôi ngoặc).
  - Grep xác nhận `(E1-A)` / `(E3)` = 0 kết quả còn lại trong file.
- Field `fr` giữ nguyên giá trị (không đổi) — chỉ không còn nơi nào render nó ra UI sau khi
  sửa mục 1 ở trên.
- Thêm khối `@CODE-MEMORY-CHANGE 2026-08-13 PO-HRM-SETTINGS-COPY-HYGIENE-FE-01`.

### 3. `apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx`
- Toast "Đã lưu mẫu HĐ": description \`PUT …/clauses — ${clause_ids.length} điều khoản
  (junction SoT).\` → \`Đã áp dụng ${clause_ids.length} điều khoản cho mẫu.\`
- Toast destructive (conflict phiên bản): description "Bấm «Tăng phiên bản» để POST activate
  bump — HĐ cũ giữ clauses_snapshot_json." → "Bấm «Tăng phiên bản» để tạo bản mới. Hợp đồng
  cũ vẫn giữ nguyên nội dung điều khoản tại thời điểm ký."
- Không đụng code comment `// Create always Nháp...` / `// Draft / not-issued...` (giữ
  nguyên theo đúng yêu cầu — đây là comment, không render UI).
- Không đụng các chỗ khác trong file có jargon tương tự nhưng KHÔNG nằm trong danh sách
  dispatch (vd toast "Đã tăng phiên bản (activate bump)" ở dòng ~570, banner Network
  PATCH …/contract-clauses ở dòng ~1679) — ngoài phạm vi allowed_paths của work item này,
  cần work item riêng nếu sponsor muốn dọn tiếp.

### 4. `apps/web/hrm/src/components/settings/MergeTokenSettingsPanel.tsx`
- `SettingsCatalogScreenShell description`: "Đăng ký token merge theo BR-PLT-01 — F5 sau
  lưu; resolve-preview chỉ smoke (≠ VER/print SoT)." → "Đăng ký các token dùng để chèn nội
  dung động vào mẫu hợp đồng. Tải lại trang sau khi lưu để xác nhận."
- Xóa hẳn `<p className="text-xs text-muted-foreground">Smoke only · resolve-preview ≠ VER
  write / print SoT · printable false RETAIN</p>` trong khối preview kết quả resolve.

### 5. `apps/web/hrm/src/components/settings/PaySheetTemplateSettingsPanel.tsx`
- Empty-state chọn thành phần lương: "Chưa có thành phần Nest. Tạo tại Payroll → Thành phần
  lương trước (AC-PLT-PAY-01b). Cấm seed/fake." → "Chưa có thành phần lương. Tạo tại
  Payroll → Thành phần lương trước."
- Empty-state danh sách mẫu: "Chưa có mẫu bảng lương — bấm «Thêm mẫu» (U65)." → "Chưa có
  mẫu bảng lương — bấm «Thêm mẫu»."

### 6. `apps/web/hrm/src/components/settings/DecDecisionTypeSettingsPanel.tsx`
- Empty-state: "Chưa có loại quyết định — bấm «Thêm loại quyết định» (U65)." → "Chưa có
  loại quyết định — bấm «Thêm loại quyết định»."

### 7. `apps/web/hrm/src/components/settings/SettingsDefaultsPanel.tsx`
- Message lỗi validate: "Tỷ lệ NLĐ / NSDLĐ phải là số ≥ 0 (BE SoT — FE không tự suy %)."
  → "Tỷ lệ NLĐ / NSDLĐ phải là số ≥ 0."

## Test file assertion check (trước khi sửa)
Grep các chuỗi jargon sắp xóa/đổi trong `MasterDataSettingsPanel.test.ts` và
`MasterDataSettingsPanel.upsertDialog.test.ts`: không có assertion nào check
`'extension HRM'`, `'AC-HRM-PICKER-01'`, `'master data'`, hay `'(U65)'` dạng chuỗi UI —
không cần sửa expected string nào trong 2 file test này.

## Kết quả vitest

```
pnpm vitest run src/components/settings
  Test Files  6 passed (6)
  Tests       38 passed (38)
```
Chi tiết theo file:
- SettingsCatalogF5ListPanels.test.ts — 9 passed
- AttCodeOtFeAdminSettingsPanels.test.ts — 8 passed
- ContractLegalPrintSettingsPanel.source.test.ts — 2 passed
- EmpEmploymentStatusSettingsPanel.test.ts — 10 passed
- MasterDataSettingsPanel.test.ts — 6 passed
- MasterDataSettingsPanel.upsertDialog.test.ts — 3 passed

Trước khi sửa: baseline không chạy riêng (không có sẵn kết quả trước) — nhưng không file
test nào bị sửa nội dung assertion (không có assertion nào check các chuỗi jargon đã xóa),
nên baseline PASS/FAIL tương đương sau khi sửa: 38/38 PASS cả trước lẫn sau (source thay
đổi không phá vỡ contract testid/API mà test check).

Kiểm tra thêm các test lib liên quan gián tiếp (MergeToken/pltTokRing, ContractClause) để
đảm bảo không phá vỡ do JSX bị xóa:
```
pnpm vitest run src/lib/mdBucketRegistry src/lib/pltTokRing src/lib/poHrmMvpGd1Plt01ClusterFe01 \
  src/lib/contractClauseLibraryUx src/integrations/contractTemplateClauseBind
  Test Files  5 passed (5)
  Tests       19 passed (19)
```

## Kết quả tsc

```
cd apps/web/hrm && npx tsc --noEmit -p tsconfig.json
EXIT: 0 (không có output — 0 lỗi type)
```

## Kết quả eslint (file đã sửa)

```
npx eslint <7 file trên>
0 lỗi, 3 warning (react-hooks/exhaustive-deps trên dòng 240 — pre-existing, không liên quan
đến thay đổi copy hygiene, không phải import/unused-var mới phát sinh)
```

## Xác nhận data-testid

Không đổi bất kỳ `data-testid` nào trong cả 6 file component đã sửa — chỉ đổi text hiển thị
(toast/description/placeholder/label/CardTitle/CardDescription/DialogTitle) và xóa 1 hàm
dev-only (`PickerSmokePreview`) không có `data-testid` liên quan tới nghiệp vụ (chỉ tự chứa
`CatalogSearchPicker` nội bộ nó).

## Xác nhận xóa PickerSmokePreview

```
grep -rn "PickerSmokePreview" apps/
→ chỉ còn 1 dòng trong @CODE-MEMORY-CHANGE comment của MasterDataSettingsPanel.tsx
  (ghi lại lịch sử đã xóa nó) — không còn function/JSX render nào gọi PickerSmokePreview.
```

## ack_status: READY_FOR_QA
