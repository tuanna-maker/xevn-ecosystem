# Evidence — PO-HRM-CTR-CREATE-PICKER-INLINE-PORTAL-CONDITIONAL-01

- **work_item_id:** PO-HRM-CTR-CREATE-PICKER-INLINE-PORTAL-CONDITIONAL-01
- **Ngày:** 2026-08-12
- **Vai trò:** dev-fe
- **ack_status:** READY_FOR_QA

## Việc đã làm

1. `apps/web/hrm/src/components/contracts/ContractCreateStep1GeneralGrid.tsx`
   - Import `getHrmPortalMode` từ `@/lib/hrmPortalMode`.
   - Thêm biến `catalogSearchPlacement: 'popover' | 'inline'` trong component, tính bằng
     `typeof window !== 'undefined' && getHrmPortalMode(window.location.search) ? 'inline' : 'popover'`
     — theo đúng convention có sẵn trong `apps/web/hrm/src/lib/contractCreateApi.ts` (dùng
     `typeof window !== 'undefined' && getHrmPortalMode(window.location.search)` cho portal auth header),
     không có file nào trong `components/contracts/` truyền `search`/`location` qua props nên giữ nguyên
     cách gọi trực tiếp `window.location.search`, không đổi props signature.
   - Thay 4 chỗ hardcode `searchPlacement="inline"` (candidate picker, employee picker, department
     picker, work-arrangement picker) thành `searchPlacement={catalogSearchPlacement}`.
   - Append `@CODE-MEMORY-CHANGE 2026-08-12` (giữ nguyên block cũ, không xoá lịch sử).
   - **Không đụng** `CatalogSearchPicker.tsx`.

2. `apps/web/hrm/src/lib/contractCreateWizard.source.test.ts`
   - 2 chỗ assert cũ `expect(step1).toContain('searchPlacement="inline"')` (dòng ~92, ~144) đổi thành
     assert theo logic điều kiện mới: `toContain('getHrmPortalMode')`, `toContain("? 'inline' : 'popover'")`,
     `toContain('searchPlacement={catalogSearchPlacement}')` — giữ nguyên các assert khác trong cùng `it()`.

3. `apps/web/hrm/src/lib/po-hrm-settings-catalog-consumer-audit-fe-01.test.ts`
   - 1 chỗ (dòng ~22) đổi từ `toContain('searchPlacement="inline"')` sang
     `toContain('getHrmPortalMode')` + `toContain('searchPlacement={catalogSearchPlacement}')`.

## vitest — trước/sau

Không chạy "trước" riêng vì thay đổi source + test đi cùng nhau (source lock test đọc trực tiếp file
`.tsx` bằng `readFileSync`, sửa xong mới có thể pass — chạy "trước" khi source đã đổi nhưng test
chưa đổi sẽ FAIL by design, không phải baseline có ý nghĩa). Baseline thật là full run SAU khi cả
source lẫn test đã sửa xong:

```
cd apps/web/hrm && pnpm exec vitest run --no-coverage
Test Files  6 failed | 342 passed (348)
     Tests  7 failed | 1844 passed (1851)
```

2 file test bị sửa trong Task này: **PASS 100%**

```
pnpm exec vitest run --no-coverage src/lib/contractCreateWizard.source.test.ts src/lib/po-hrm-settings-catalog-consumer-audit-fe-01.test.ts
✓ src/lib/po-hrm-settings-catalog-consumer-audit-fe-01.test.ts (4 tests)
✓ src/lib/contractCreateWizard.source.test.ts (16 tests)
Test Files  2 passed (2)
     Tests  20 passed (20)
```

6 file FAIL còn lại là **pre-existing, không liên quan Task này** (verify bằng grep — không file
nào chứa `searchPlacement` / `hrmPortalMode` / `ContractCreateStep1GeneralGrid` / `CatalogSearchPicker`):
- `src/hooks/useEmployeePicker.test.ts`
- `src/hooks/useOvertimeRequests.test.ts` (2 tests)
- `src/lib/poHrmMvpGd1Att04bClusterFe01.source.test.ts`
- `src/lib/poHrmMvpGd1Core09ClusterFe01.source.test.ts`
- `src/lib/xevn-thm-fe-w1-density-01.test.ts`
- `src/components/auth/PermissionFallback.test.ts`

## Browser verify — CẢ 2 ngữ cảnh (server thật :8080, không tự start thêm)

Server dev đã chạy sẵn ở `:8080`; đã login sẵn `ceo@xe.vn` trong session browser tool (không cần
login lại). Verify bằng cách đọc DOM thật qua `document.querySelectorAll` (không giả lập) — vì
`computer.screenshot` bị lỗi "Browser pane not displayed" trong session này (môi trường headless),
nên dùng `javascript_tool` inspect DOM + `read_page` accessibility tree làm evidence thay ảnh chụp.

### 1. Standalone — `http://localhost:8080/hr/contracts` (không `?portal=1`, chưa từng set portal flag)

Mở dialog "Thêm hợp đồng" (`document.querySelectorAll('[role="dialog"]').length === 1`).

Trước khi bấm vào bất kỳ picker nào — đếm `[cmdk-input]` (ô search CatalogSearchPicker) trong toàn
dialog:

```js
document.querySelector('[role="dialog"]').querySelectorAll('[cmdk-input]').length
// => 0  (KHÔNG có ô tìm kiếm nào hiện sẵn — đúng kỳ vọng sponsor)
```

6 combobox picker phát hiện trong dialog, tất cả role="combobox", KHÔNG có ô search con kèm theo:

```json
[
  {"testid":"hdsd-contracts-form-employee","text":"Gõ tên hoặc mã NV để tìm…"},
  {"testid":"ctr-create-template-combobox","text":"Chọn template_code active"},
  {"testid":"hdsd-contracts-form-contract-type","text":"Hợp đồng học việc"},
  {"testid":null,"text":"Chờ duyệt"},
  {"testid":"ctr-create-department-picker","text":"Chọn từ danh mục…"},
  {"testid":"ctr-create-work-arrangement","text":"Chọn hình thức"}
]
```

Bấm vào `[data-testid="ctr-create-department-picker"]` — sau click, đúng 1 ô `[cmdk-input]` xuất hiện
(popover mở ra), placeholder "Tìm theo mã hoặc tên…", `visible: true`. Trước click là 0, sau click
là 1 — đúng hành vi popover (search chỉ hiện khi bấm mở).

Bấm vào employee picker (`combobox "Gõ tên hoặc mã NV để tìm…"`) qua accessibility tree
(`read_page`) — cũng xác nhận mở ra 1 `generic` (Popover content) chứa `combobox "Tìm theo mã hoặc
tên…"` + `listbox "Suggestions"`, không hiện sẵn trước đó.

→ **Standalone: search KHÔNG còn hiện sẵn — đúng yêu cầu sponsor.**

### 2. Portal-embed — `http://localhost:8080/hr/contracts?portal=1&tenantId=xevn&companyId=main`

`window.location.href` xác nhận đúng query string. Mở dialog "Thêm hợp đồng"
(`document.querySelectorAll('[role="dialog"]').length === 1`).

Trước khi bấm vào bất kỳ picker nào — đếm `[cmdk-input]`:

```js
document.querySelectorAll('[cmdk-input]').length
// => 3 (employee, department, work-arrangement — cả 3 picker đang render trong Step1
//    đều có search box hiện sẵn ngay, đúng inline mode)
```

Chi tiết 3 ô search hiện sẵn (`visible: true` cho cả 3, placeholder "Tìm theo mã hoặc tên…"), gắn
kèm data-testid tương ứng combobox cha:
- `hdsd-contracts-form-employee-search` (cạnh `hdsd-contracts-form-employee-combobox`)
- `ctr-create-department-picker-search` (cạnh `ctr-create-department-picker-combobox`)
- `ctr-create-work-arrangement-search` (cạnh `ctr-create-work-arrangement-combobox`)

`getHrmPortalMode` side-effect xác nhận: `sessionStorage.hrm_portal_mode = "1"`,
`localStorage.hrm_portal_mode = "1"`.

→ **Portal-embed: VẪN giữ inline mode như cũ — không phá case QA gốc
`DEF-CTR-PICKER-INLINE-PORTAL-01` / `ETCTRQA1`.**

*Lưu ý thứ tự test:* standalone được verify TRƯỚC khi ghé portal URL lần nào trong session này,
tránh nhiễm `sessionStorage/localStorage hrm_portal_mode` (được `getHrmPortalMode` set persist khi
gặp query portal — đúng thiết kế hàm, không phải bug).

## File sửa

- `apps/web/hrm/src/components/contracts/ContractCreateStep1GeneralGrid.tsx`
- `apps/web/hrm/src/lib/contractCreateWizard.source.test.ts`
- `apps/web/hrm/src/lib/po-hrm-settings-catalog-consumer-audit-fe-01.test.ts`

## Không commit git — theo yêu cầu Task.
