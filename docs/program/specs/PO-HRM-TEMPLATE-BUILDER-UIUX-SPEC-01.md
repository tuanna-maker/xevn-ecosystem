# SPEC-01: QUY TẮC NGHIỆP VỤ & UI/UX SOẠN THẢO BỐ CỤC JD & ĐIỀU KHOẢN HỢP ĐỒNG

## 1. Mục Đích & Phạm Vi (Purpose & Scope)
Tài liệu này quy định rõ quy tắc nghiệp vụ (**Business Rules**) và chuẩn hóa giao diện (**UI/UX Standards**) áp dụng cho tất cả các màn hình Soạn thảo Mẫu (Template Builder / Dialog Composer):
- **Thư viện JD (Job Description Template Writer)**: Soạn thảo nhóm thông tin tuyển dụng & JD.
- **Mẫu Hợp Đồng Lao Động (Contract Legal Template Composer)**: Soạn thảo thư viện điều khoản và cấu hình mẫu hợp đồng.

---

## 2. Quy Tắc Nghiệp Vụ Quản Lý Danh Sách & Canvas (BR-TPL-PICK-01)

### Rule 2.1. Cơ Chế Thêm / Gỡ Nhanh (1-Click Controls)
1. **Không bắt buộc kéo-thả (Drag-and-drop Optional):** Do thao tác kéo-thả trên các hộp thoại Modal Popup đôi khi gây bất tiện cho người dùng, giao diện **BẮT BUỘC** phải cung cấp:
   - **Nút Bấm `+` (Bấm để thêm vào Canvas)**: Đặt ở góc phải của từng mục trong Danh sách tùy chọn.
   - **Nút Bấm `Trash / Xóa` (Bấm để gỡ khỏi Canvas)**: Đặt ở góc phải tiêu đề của từng mục nằm trên Canvas.

### Rule 2.2. Quy Tắc Trùng Lặp & Ẩn/Hiện Tự Động (Unique Pick List Behavior)
1. **Tự động Ẩn khi được Thêm (Hide on Add):** 
   - Khi một Nhóm thông tin JD hoặc Điều khoản Hợp đồng được người dùng thêm vào Canvas (qua nút `+` hoặc Kéo-thả) ➔ Mục đó **TỰ ĐỘNG ẨN KHỎI** Danh sách tùy chọn bên trái.
   - Tránh tuyệt đối trường hợp một Nhóm/Điều khoản bị thêm trùng lặp nhiều lần vào cùng một mẫu.

2. **Tự động Hiển thị lại khi Gỡ (Show on Remove):**
   - Khi người dùng bấm nút `Xóa / Trash` để gỡ bỏ một Nhóm/Điều khoản khỏi Canvas ➔ Mục đó **TỰ ĐỘNG HIỆN LẠI** trong Danh sách tùy chọn bên trái.
   - Người dùng có thể dễ dàng chọn và thêm lại mục đó bất cứ lúc nào.

---

## 3. Quy Tắc Đánh Số Điều Tự Động (BR-CTR-CLAUSE-AUTO-NUMBER-01)

### Rule 3.1. Tiêu Đề Thuần Trong Thư Viện (Clean Clause Titles)
1. **Không gán cứng số Điều trong Thư viện:**
   - Trong màn hình **Điều khoản HĐ** (Thư viện điều khoản), ô *Tiêu đề điều khoản* chỉ lưu trữ tên điều khoản thuần túy (Ví dụ: `Thời hạn và công việc hợp đồng`, `Chế độ làm việc`, `Quyền lợi của Người lao động`...).
   - **CẤM** điền cứng "Điều 1.", "Điều 2.", "Điều 3." vào ô Tiêu đề trong thư viện, vì một điều khoản có thể được dùng ở các vị trí khác nhau trong nhiều mẫu hợp đồng khác nhau.

### Rule 3.2. Đánh Số Tự Động Theo Thứ Tự Sắp Xếp Khu In/Xem Trước (Dynamic Order Prefix)
1. **Đánh số theo `sort_order` trên Canvas:**
   - Khi ghép các điều khoản vào Mẫu hợp đồng và xuất in / xem trước (Print Preview & PDF):
     - Vị trí thứ 1 (`sort_order = 0`) ➔ Tự động thêm prefix **"Điều 1. [Tiêu đề]"**
     - Vị trí thứ 2 (`sort_order = 1`) ➔ Tự động thêm prefix **"Điều 2. [Tiêu đề]"**
     - Vị trí thứ 3 (`sort_order = 2`) ➔ Tự động thêm prefix **"Điều 3. [Tiêu đề]"**
   - Đảm bảo tính linh hoạt 100%, khi kéo đổi vị trí điều khoản trên Canvas thì số Điều tự động điều chỉnh theo đúng thứ tự mới.

---

## 4. Quy Tắc Đóng Popup Modal & Cập Nhật Danh Sách Tự Động (BR-UI-POPUP-AUTO-CLOSE-01)

### Rule 4.1. Trạng Thái Bận & Ngăn Double-Submit (Busy Feedback)
1. Khi người dùng bấm nút Submit / Lưu tại bất kỳ Hộp thoại Popup Modal nào (*Sửa mẫu HĐ*, *Thêm/Sửa điều khoản*, *Đăng ký token merge*, *Thêm/Sửa nhà bảo hiểm*, *Thêm/Sửa loại bảo hiểm*, *Thêm/Sửa giai đoạn tuyển dụng*...):
   - Nút bấm **BẮT BUỘC** phải chuyển sang trạng thái bận/disabled (VD: `saveBusy` / `isPending` / `Đang lưu...`) để ngăn double-click và phản hồi thị giác tức thì cho người dùng.

### Rule 4.2. Tự Động Đóng Popup Modal Sau Khi Lưu Thành Công (Auto Close Dialog)
1. Khi API phản hồi thành công (HTTP 200/201):
   - Popup Modal **BẮT BUỘC TỰ ĐỘNG ĐÓNG LẠI** (`closeDialog()` / `setOpen(false)` / `setTplDialogOpen(false)`).
   - Người dùng không phải thao tác bấm nút 'Đóng' hoặc nút 'Hủy' thủ công sau khi đã lưu thành công.

### Rule 4.3. Tự Động Cập Nhật Danh Sách Màn Hình Chính (Auto Refresh List Data)
1. Ngay sau khi đóng Popup Modal:
   - Hệ thống **BẮT BUỘC** kích hoạt hàm làm mới danh sách (`loadAll()` / `loadRows()` / `invalidateQueries()`) để bảng dữ liệu ở màn hình chính hiển thị ngay bản ghi mới/đã sửa mà không yêu cầu F5 hay thao tác thủ công.

### Rule 4.4. Tự Động Ẩn Menu Thao Tác Khi Chọn Mục (Dismiss Action Dropdown Menu)
1. Khi người dùng bấm chọn bất kỳ mục nào ("Xem", "Chỉnh sửa", "Xóa"...) trong Menu Thao tác Dropdown (`DropdownMenu` / `DropdownMenuItem`) của bảng danh sách:
   - Menu Dropdown **BẮT BUỘC TỰ ĐỘNG ĐÓNG LẠI NGAY LẬP TỨC** (`setOpen(false)` / để Radix UI xử lý sự kiện đóng mặc định).
   - **CẤM** sử dụng `e.preventDefault()` trong `onSelect` / `onClick` gây giữ nguyên trạng thái mở của Popover Menu trên màn hình hoặc đè lên Backdrop của Dialog Popup Modal.

---

## 5. Ma Trận Kiểm Thử Tự Động (Acceptance Criteria & Verification)
- **AC-01**: Bấm nút `+` tại Nhóm optional A ➔ Nhóm A xuất hiện ở Canvas ➔ Nhóm A biến mất khỏi Nhóm tùy chọn.
- **AC-02**: Bấm nút `Xóa` tại Nhóm A ở Canvas ➔ Nhóm A biến mất khỏi Canvas ➔ Nhóm A xuất hiện lại ở Nhóm tùy chọn.
- **AC-03**: Tiêu đề điều khoản trong Thư viện lưu thuần túy (không có `Điều X.`). Khi render in ấn/xem trước HĐ, hệ thống tự động gán prefix `Điều 1.`, `Điều 2.`... theo thứ tự sắp xếp trên Canvas.
- **AC-04 (BR-UI-POPUP-AUTO-CLOSE-01)**: Khi bấm Lưu tại Popup Modal (vd: Sửa mẫu HĐ) ➔ Nút chuyển `Đang lưu...` (disabled) ➔ Xử lý thành công ➔ Popup tự động đóng (`setTplDialogOpen(false)`) ➔ Danh sách màn hình chính cập nhật tự động.
- **AC-05 (BR-UI-DEDUP-FIELDS-01)**: Mọi Popup Form Nhân sự / Danh mục ➔ Tự động đối soát và lọc bỏ 100% các trường trùng lặp hoặc biến thể alias (Họ tên vs Tên, Ngày sinh vs Năm sinh, CCCD vs Số CMND/CCCD).
- **AC-06 (BR-UI-ACCESSIBILITY-READABILITY-01)**: Mọi ô nhập liệu Form (Input, Select, Picker, DatePicker, Button, Textarea) ➔ Font size tối thiểu `14px` (`text-sm`), nét chữ màu tối/đen rõ ràng (`text-slate-900` / `text-foreground`), đường viền border rõ nét (`border-slate-300` / `border-gray-400`), CẤM dùng màu xám mờ/tone nhạt.
- **AC-07 (BR-UI-DROPDOWN-DISMISS-01)**: Bấm chọn "Chỉnh sửa" / "Xem" / "Xóa" trên Menu Thao tác Dropdown ở bảng danh sách ➔ Popover Menu tự động đóng ẩn ngay lập tức, không đè lên màn hình Modal.
- **AC-08 (BR-UI-I18N-SAFE-FALLBACK-01)**: Mọi lệnh gọi hàm dịch `t('key')` ➔ BẮT BUỘC cung cấp `defaultValue` fallback HOẶC đảm bảo 100% key có trong `vi.json`/`en.json`, CẤM NGHIÊM NGẠC để lộ raw key string như `employeeForm.genderMale`.
- **AC-09 (BR-UI-CATALOG-HUMAN-READABLE-RESOLVER-01)**: Mọi thuộc tính danh mục (Phòng ban, Chức vụ, Loại hình nhân sự, Trạng thái...) khi render trên Bảng danh sách hay Màn hình Chi tiết Profile ➔ BẮT BUỘC tra cứu chuyển đổi mã thô catalog key (VD: `DEPT_02`) thành nhãn đọc được của con người (VD: "Vận hành"), CẤM NGHIÊM NGẠC hiển thị mã thô `DEPT_01`, `DEPT_02`, `POS_03` ra UI.
- **AC-10 (BR-UI-NUMERIC-INPUT-NO-TYPE-NUMBER-01)**: Mọi ô nhập liệu số trên hệ thống (Định biên tuyển dụng, Số lượng, Thứ tự sắp xếp, Tỷ lệ %, Số ngày nghỉ...) ➔ BẮT BUỘC dùng `<Input type="text" inputMode="numeric" pattern="[0-9]*" />` hoặc `<ViNumericInput />`. CẤM NGHIÊM NGẠC dùng `type="number"` gây xuất hiện mũi tên tăng/giảm (spinner stepper arrows) làm vỡ giao diện.

---

## 6. Quy Tắc Chống Trùng Lặp Trường & Chuẩn Hóa Giao Diện SOLID FE (BR-UI-DEDUP-FIELDS-01)

### Rule 6.1. Mỗi Thuộc Tính Định Danh Chỉ Hiển Thị 1 Lần (Single Representation)
1. **Không cho phép xuất hiện đồng thời trường chuẩn & trường alias trùng lặp:**
   - Trường *Ngày sinh* (`birth_date`) đã có ➔ **CẤM** hiển thị thêm trường *Năm sinh* (`birth_year` / `nam_sinh`).
   - Trường *Số CMND/CCCD* (`id_number`) đã có ➔ **CẤM** hiển thị thêm trường *CCCD* (`cccd` / `national_id`).
   - Trường *Họ và tên* (`full_name`) đã có ➔ **CẤM** hiển thị thêm trường *Tên nhân viên* (`name` / `ho_ten`).

### Rule 6.2. Lọc Lược Bỏ Tự Động Với Danh Mục Trường Động (Dynamic Field Deduplication)
1. Khi render các trường thuộc danh mục động (Custom / Catalog Fields):
   - Hệ thống **BẮT BUỘC** phải đối soát cả `code` lẫn `label` (sau khi chuẩn hóa không dấu/in thường) với danh sách trường đã tích hợp sẵn.
   - Nếu tìm thấy sự trùng lặp (ví dụ: `code` hay `label` ứng với Ngày sinh, CCCD, Họ tên, SĐT, Email, Bộ phận, Vị trí...) ➔ Hệ thống tự động triệt hạ, **KHÔNG RENDER** ô Textbox nhập tự do trùng lặp đó dưới dạng trường động.

---

## 7. Quy Tắc Chuẩn Hóa Font Chữ, Màu Chữ & Đường Viền Rõ Nét (BR-UI-ACCESSIBILITY-READABILITY-01)

### Rule 7.1. Kích Thước Font Chữ Tối Thiểu (Minimum 14px Font Size)
1. **Cấm dùng cỡ chữ nhỏ mờ (No text-xs / 12px for form inputs & labels):**
   - Tất cả các ô nhập liệu Textbox (`<Input>`), Dropdown (`<Select>`), Bộ chọn danh mục (`<CatalogSearchPicker>`), Chọn ngày (`<ViDatePickerField>`), Nhãn trường (`<FormLabel>`), Nút bấm (`<Button>`) **BẮT BUỘC** đạt kích thước font chữ **tối thiểu 14px** (`text-sm`).
   - CẤM sử dụng font size 11px hoặc 12px cho nội dung ô nhập hoặc nhãn trường chính.

### Rule 7.2. Màu Chữ Rõ Nét (High-Contrast Black Text)
1. **Màu nét chữ đậm đà, tương phản cao:**
   - Nội dung chữ người dùng điền và nhãn hiển thị **BẮT BUỘC** dùng nét chữ màu tối/đen (`text-slate-900`, `text-gray-900`, `text-foreground`).
   - CẤM dùng màu chữ xám mờ, mờ nhạt gây mỏi mắt hoặc khó đọc cho người dùng.

### Rule 7.3. Đường Viền Border Ô Nhập Rõ Nét (High-Contrast Border Radius & Stroke)
1. **Border rõ nét cho mọi Form Control:**
   - Các element như Textbox, Select, DatePicker, Combobox **BẮT BUỘC** phải có đường viền border rõ ràng (`border border-slate-300`, `border-gray-300`, `border-slate-400`).
   - **CẤM** sử dụng đường viền màu xám quá nhạt (tone nhạt như `border-gray-100`, `border-slate-100`) hoặc không nhìn thấy viền làm người dùng không phân biệt được vùng nhập liệu.

### Rule 7.4. Quy Tắc Chống Lộ Raw i18n Key (BR-UI-I18N-SAFE-FALLBACK-01)
1. **Dự phòng chuỗi hiển thị tiếng Việt cho 100% hàm dịch `t('key')`:**
   - Mọi lệnh gọi `t('key')` trên giao diện **BẮT BUỘC** phải kèm theo phương án dự phòng `{ defaultValue: 'Tên hiển thị tiếng Việt' }` HOẶC đối soát 100% key đã khai báo trong `vi.json` / `en.json`.
   - **CẤM NGHIÊM NGẠC** gọi key trơ trọi như `t('employeeForm.genderMale')` mà không có key trong JSON và không có fallback, khiến hệ thống hiện chuỗi mã thô `employeeForm.genderMale` làm xấu giao diện.

---

## 8. Quy Tắc Chuyển Đổi Mã Thô Catalog Thành Nhãn Tiếng Việt Hợp Lệ (BR-UI-CATALOG-HUMAN-READABLE-RESOLVER-01)

### Rule 8.1. Bắt Buộc Sử Dụng Resolver Chuyển Đổi Nhãn (Catalog Label Resolvers)
1. **Không in trực tiếp giá trị mã thô catalog lên UI:**
   - Trường *Phòng ban* (`department` / `department_key`) ➔ **BẮT BUỘC** đi qua `resolveDepartmentDisplay(val, catalogOptions)` để hiển thị tên phòng ban đọc được (VD: "Vận hành", "Kế toán"...) thay vì mã thô `DEPT_02`.
   - Trường *Chức vụ* (`position` / `job_title_key`) ➔ **BẮT BUỘC** đi qua `resolveJobTitleDisplayLabel(source, catalogOptions)` để hiển thị tên chức vụ thay vì mã thô.
   - Trường *Loại hình nhân viên* (`employment_type`) ➔ **BẮT BUỘC** đi qua `resolveEmploymentTypeDisplay(val)` để hiển thị "Toàn thời gian" / "Bán thời gian".
   - Trường *Giới tính* (`gender`) ➔ **BẮT BUỘC** đi qua `resolveGenderDisplay(val)` để hiển thị "Nam" / "Nữ" / "Khác".

### Rule 8.2. Tham Chiếu Chuẩn Hóa Code Headers (Traceability Comments Requirement)
1. **Mọi file component / utility vừa code và refactor:**
   - **BẮT BUỘC** ghi chú khối `@CODE-MEMORY` ở đầu file tham chiếu đầy đủ:
     - `@SRS`: `docs/hrm/SRS.md` & `docs/hrm/SRS_FIELD_DISPLAY.md`
     - `@TechSpec`: `docs/program/specs/PO-HRM-TEMPLATE-BUILDER-UIUX-SPEC-01.md`
     - `@APIContract`: API Endpoints contract specifications
     - `@UIUXSpec`: `PO-HRM-TEMPLATE-BUILDER-UIUX-SPEC-01.md` §6–§9
     - `@BR`: `BR-UI-CATALOG-HUMAN-READABLE-RESOLVER-01`, `BR-UI-I18N-SAFE-FALLBACK-01`, `BR-UI-NUMERIC-INPUT-NO-TYPE-NUMBER-01`

---

## 9. Quy Tắc Chuẩn Hóa Ô Nhập Liệu Số - Cấm Dùng type="number" (BR-UI-NUMERIC-INPUT-NO-TYPE-NUMBER-01)

### Rule 9.1. Loại Bỏ Mũi Tên Tăng/Giảm Trình Duyệt (Eliminate Browser Spin Buttons)
1. **Không sử dụng HTML `type="number"` cho Form Control nhập số:**
   - Ô nhập số lượng cần tuyển (Định biên tuyển dụng), thứ tự sắp xếp (`sort_order`), tỷ lệ phần trăm (`%`), số suất ăn/hành khách, số tiền/đơn giá ➔ **BẮT BUỘC** chuyển sang `type="text"` kết hợp `inputMode="numeric"` và `pattern="[0-9]*"`.
   - **CẤM NGHIÊM NGẠC** dùng `type="number"` khiến trình duyệt xuất hiện 2 nút mũi tên tăng/giảm (`spin-button`) góc phải ô nhập làm xấu giao diện.

### Rule 9.2. Lọc Ký Tự Số Tự Động (Numeric Character Filtering)
1. Trên sự kiện `onChange` / `onInput` của ô nhập số:
   - Hệ thống tự động lọc bỏ 100% các ký tự không phải chữ số (`val.replace(/[^0-9]/g, '')` đối với số nguyên hoặc `val.replace(/[^0-9.]/g, '')` đối với số thập phân).
   - Đảm bảo người dùng gõ phím mượt mà, hỗ trợ tốt bàn phím số trên thiết bị di động (`inputMode="numeric"`).





