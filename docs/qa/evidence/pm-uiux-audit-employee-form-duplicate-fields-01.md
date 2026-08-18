# PM UI/UX Audit — Duplicate fields trong "Thêm nhân viên" (EmployeeFormDialog)

- **work_item_id:** PM-UIUX-AUDIT-EMPLOYEE-FORM-DUP-01
- **Ngày:** 2026-08-11
- **Người audit:** PM (Claude Code), theo yêu cầu sponsor — rà soát UI/UX enterprise-grade theo `_vibe-team-os/17-BRAND-UIUX-THEME-REMASTER.md` §2 (ops-first, không thông tin thừa) sau khi sponsor phản ánh trực tiếp trên FE.
- **Cách verify:** Browser thật (không đoán code) — login `ceo@xe.vn` tại `http://localhost:8080/hr/employees`, mở dialog "Thêm nhân viên", đọc accessibility tree từng tab. Đối chiếu network response `GET /api/hrm/settings-catalogs`.

## Phát hiện — CONFIRMED, không phải suy đoán

### Tab "Thông tin cơ bản" — 4 field bị lặp

| Field đúng (built-in, required rõ ràng) | Field lặp (leak, ở cuối tab, không required) |
|---|---|
| "Mã NV *" — textbox, placeholder "VD: NV001" | "Mã NV" — textbox placeholder "Mã NV" |
| "Họ và tên *" — textbox | "Họ tên" — textbox placeholder "Họ tên" |
| "Phòng ban" — **combobox** (catalog picker) | "Bộ phận" — **textbox tự do** (không picker, không validate) |
| "Chức vụ" — **combobox** (catalog picker) | "Chức vụ" — **textbox tự do**, trùng cả label lẫn ý nghĩa |

### Tab "Cá nhân" — 3 field bị lặp + 1 field custom hợp lệ

| Field đúng | Field lặp |
|---|---|
| "Ngày sinh" — date input | "Năm sinh" — textbox tự do |
| "Giới tính" — combobox (Nam/Nữ/Khác) | "Giới tính" — textbox tự do, trùng label |
| "Số CMND/CCCD" — textbox có placeholder mẫu | "CCCD" — textbox tự do |
| *(không có sẵn)* | "Dân tộc" — field mới hợp lệ, không trùng, giữ lại |

### Tab "Công việc" — chưa bị (chỉ vì catalog XBOS chưa có data cho lane này, latent bug giống hệt)

## Root cause (đã trace code, không đoán)

`apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx`:
- `basicFieldsCatalog` / `personalFieldsCatalog` bind vào catalog `hrm_employee_basic_fields` / `hrm_employee_personal_fields` (dòng 609, 632).
- `buildDynamicFields()` (dòng ~376) chỉ loại một item khỏi danh sách "extra field" nếu `item.code` khớp `CATALOG_CODE_ALIASES` hoặc nằm sẵn trong `DEFAULT_*_FIELDS` (raw string match).
- Nhưng catalog `hrm_employee_basic_fields`/`hrm_employee_personal_fields` được XBOS sync bằng **code dạng sequence chung toàn hệ** (`BASIC_01`, `BASIC_02`, `BASIC_03`, `BASIC_04`, `PERS_01..04` — cùng convention với `ADDR_01`, `CONT_01`, `EMRG_01`, `INSF_01`, `FLD_01`… thấy trong response `GET /api/hrm/settings-catalogs`), **không phải** code snake_case ngữ nghĩa (`employee_code`, `full_name`…) mà `resolveCatalogFormFieldCode` kỳ vọng.
- Kết quả: `BASIC_01` (label "Mã NV") không khớp alias nào → bị coi là field custom MỚI → render thêm 1 input, dù built-in "Mã NV *" đã có sẵn ngay phía trên. Tương tự cho 3 field basic khác + 3 field personal khác.
- Đây là **lỗi hệ thống** (áp dụng cho mọi catalog `hrm_employee_*_fields` được XBOS sync theo convention sequence-code), không phải lỗi 1 dòng gõ nhầm — cần quyết định thiết kế trước khi Dev sửa (xem mục "Cần quyết định" bên dưới).

## Ảnh hưởng

- Enterprise-grade fail: HR nhập trùng dữ liệu 2 lần cho cùng 1 field (Mã NV, Họ tên, Chức vụ...), 1 trong 2 bản không có validate/picker → dữ liệu rác, không đồng bộ với field chính thức đã submit.
- Vi phạm `_vibe-team-os/17` §2.6 ops-first: "1 tiêu đề + 1 vùng data chính" — form đang có 2 vùng data trùng nhau.
- KHÔNG phải lỗi hiển thị đơn thuần (contrast/màu chữ) — là lỗi logic form khiến double data-entry thật sự.

## Cần quyết định trước khi Dev sửa (không tự sáng tạo — `35-NO-UNSOLICITED-CREATIVE.md`)

Có 2 hướng fix khác nhau về bản chất, PM chọn hướng **A** (an toàn, additive, không đổi data model XBOS):

- **Hướng A (khuyến nghị — FE guard, scope hẹp):** `buildDynamicFields` thêm điều kiện loại trừ theo **label** (so khớp không phân biệt hoa/thường/dấu) với label của field built-in đã hiển thị trong cùng section — nếu trùng label, coi là "field mô tả capability", KHÔNG render lặp. Không đổi XBOS catalog data, không đổi API, chỉ sửa 1 hàm thuần FE.
- **Hướng B (rộng hơn, đụng XBOS sync, KHÔNG làm trong Task này):** yêu cầu catalog-sync XBOS đổi code từ `BASIC_01`.. sang semantic code — ảnh hưởng nhiều consumer khác, cần SA/BA xác nhận trước.

→ Dispatch dev-fe theo **Hướng A**.

## Không kiểm tra trong audit này (ngoài scope)
- Portal FE / XBOS FE — chưa audit, chỉ audit HRM employee form theo đúng complaint của sponsor.
- Contract wizard "Phòng ban / Hình thức làm việc / Nơi làm việc" lặp lại giữa Employee profile và Contract Step 1 — CÓ THỂ hợp lệ về nghiệp vụ (hợp đồng có thể khác profile mặc định), cần BA xác nhận trước khi coi là bug — không gộp vào Task fix lần này.

---

## Audit bổ sung 2026-08-12 — CatalogSearchPicker "inline" search box sai ngữ cảnh (màn Thêm hợp đồng)

**Sponsor báo:** vào browser thật `http://localhost:8080/hr/contracts` → "Thêm hợp đồng" — mọi select (Đối tượng hợp đồng/NV picker, Phòng ban, Hình thức làm việc) đều có 1 ô tìm kiếm hiện SẴN ngay dưới, thay vì bấm vào select mới mở ra ô tìm.

**Root cause (đã trace code, verify qua browser thật):**
- `apps/web/hrm/src/components/common/CatalogSearchPicker.tsx` có 2 mode: `searchPlacement="popover"` (mặc định, ĐÚNG — search nằm trong Popover chỉ hiện khi bấm) và `searchPlacement="inline"` (search luôn hiện sẵn, không nằm trong popover).
- `apps/web/hrm/src/components/contracts/ContractCreateStep1GeneralGrid.tsx` dòng 236/250/402/453 **hardcode `searchPlacement="inline"` vô điều kiện** — áp dụng cả khi trang chạy standalone (`/hr/contracts`, không có `?portal=1`) lẫn khi nhúng CC portal iframe.
- Lịch sử: mode `inline` được thêm 2026-08-10/11 để fix lỗi Playwright QA không click được option trong Popover khi HRM chạy nhúng trong iframe Command Center (`DEF-CTR-PICKER-INLINE-PORTAL-01`, `ETCTRQA1` popover/stacking). Đây là fix ĐÚNG cho ngữ cảnh portal, nhưng bị áp dụng nhầm sang cả ngữ cảnh standalone.
- Có sẵn đúng hàm để phân biệt 2 ngữ cảnh: `getHrmPortalMode(window.location.search)` (`apps/web/hrm/src/lib/hrmPortalMode.ts`) — check `?portal=1` hoặc `companyId` khác `all`.
- 3 test đang hardcode assert `searchPlacement="inline"` xuất hiện trong source: `contractCreateWizard.source.test.ts` (x2), `po-hrm-settings-catalog-consumer-audit-fe-01.test.ts` (x1) — sẽ cần sửa theo logic điều kiện mới, không được xoá mất coverage cho case portal.

**Không phải fix bằng cách xoá `inline` mode** — case portal-embed vẫn cần giữ (đã có lý do QA rõ ràng). Fix bằng cách làm `searchPlacement` **điều kiện theo `getHrmPortalMode`**.
