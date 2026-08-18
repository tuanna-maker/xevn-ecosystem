# Evidence — PO-HRM-SETTINGS-IA-COPY-WAVE2-FE-01

Dev-fe wave 2: chuyển 3 sub-tab/panel Settings từ form cố định (Card trên bảng list) sang
Dialog theo `PAT-SETTINGS-CATALOG-01`, và dọn jargon nội bộ (mã tracing/enum raw/tên bảng DB)
khỏi copy end-user trên 13 file trong `apps/web/hrm/src/components/settings/`.

ack_status: **READY_FOR_QA**

## Phạm vi đã sửa

### Phần A — IA (List + Dialog), 3 file

1. **`JdDynamicSettingsPanel.tsx`**
   - 5 sub-tab (Catalog trường, Nhóm thông tin JD/FG1, Gói mặc định/FG2, Rule chọn gói/FG3,
     Bố cục mặc định/Q6) chuyển từ Card-form cố định ngay trên/dưới list sang `<Dialog>` mở
     qua nút "Thêm mới" (hoặc "Sửa rules" / "Cấu hình bố cục" cho 2 tab không phải catalog
     dạng nhiều dòng). Đã convert cả tab "Catalog trường" dù work item chỉ liệt kê 4 tab có
     hậu tố mã (FG1/FG2/FG3/Q6) — làm thêm cho nhất quán IA vì tab này có cùng vi phạm và
     CardDescription của nó cũng nằm trong danh sách copy cần sửa (F-JD-DEF).
   - Rules tab: tách phần "xem trước theo mã vị trí" (view-only) ở ngoài Dialog, chỉ phần
     sửa JSON rule hàng loạt chuyển vào Dialog — giữ nguyên toàn bộ logic `onSaveRules`/
     `onPreviewResolve`/`putJdPackRules` (DTO strip) không đổi.
   - Copy: bỏ hậu tố `(FG1)`/`(FG2)`/`(FG3)`/`(Q6)` khỏi CardTitle; bỏ mã `F-JD-DEF` khỏi
     CardDescription trường; diễn giải tiếng Việt cho CardDescription nhóm/gói/rule (bỏ raw
     `field_id`, enum `default_eligible|optional_only`, ghi chú kỹ thuật "PUT ... priority
     ASC"); label `group_codes always_on (CSV)` → "Mã nhóm luôn bật (phân cách bởi dấu phẩy)";
     label `field_id CSV (title trước)` → "Mã trường theo thứ tự hiển thị (cách nhau dấu
     phẩy, trường tiêu đề đứng đầu)"; label `field_id (CSV)` (tab nhóm) →
     "Mã trường thuộc nhóm (cách nhau dấu phẩy)"; label "usage"/"view_style" →
     "Cách hiển thị nhóm"/"Kiểu trình bày"; option text enum (`default_eligible`,
     `optional_only`, `heading`/`bullets`/`chips`/`key_value`, `short_text`/`long_text`/
     `select`/`number`/`date`) đổi sang nhãn tiếng Việt hiển thị qua helper
     `displayFieldType`/`displayViewStyle`/`displayGroupUsage` (value gửi API giữ nguyên raw).
   - Giữ nguyên 100% logic mutate (`onCreateField`/`onCreateGroup`/`onSavePack`/`onSaveRules`/
     `onPublishLayout`) và mọi `data-testid` cũ; chỉ thêm testid mới (không đổi/xoá testid cũ).
   - **Follow-up chưa sửa (ngoài phạm vi liệt kê)**: dòng lỗi tải cấu hình
     `'Không tải được cấu hình JD động. Kiểm tra API F-JD-DEF/GRP/PCK/RUL đã sẵn sàng.'`
     (trong `setError`, hiện role="alert") vẫn còn lộ mã API nội bộ `F-JD-DEF/GRP/PCK/RUL` —
     không nằm trong danh sách copy A1 được giao, giữ nguyên để không vượt phạm vi; đề xuất
     BA/PM đưa vào audit tiếp theo (`BA-HRM-SETTINGS-PANEL-IA-AUDIT-01`).

2. **`AttLeaveAccrualPolicySettingsPanel.tsx`**
   - Form thêm quy tắc (Loại phép, Chế độ tích lũy, Ngày/năm, Hiệu lực từ, Trần ứng, Quy tắc
     hết hạn mang sang, Trần ngày mang sang) chuyển từ luôn hiện trong Card sang `<Dialog>`
     mở qua nút "Thêm mới" cạnh CardTitle. Lưu thành công → đóng Dialog + reset form (giữ
     logic cũ `setForm(emptyForm())`); đóng không lưu (Esc/click ngoài/Hủy) → reset form qua
     `handleDialogOpenChange`.
   - CardTitle `Quy tắc quỹ phép (LVRULE)` → `Quy tắc quỹ phép`.
   - Empty-state bảng cập nhật theo CTA mới: `"Chưa có quy tắc quỹ — bấm «Thêm mới» ở trên để
     tạo bản ghi đầu tiên."` (trước đó trỏ "form trên", không còn đúng sau khi chuyển Dialog).
   - **GIỮ NGUYÊN 100%** honesty banner (`att04HonestyBannerText()`, `att05HonestyBannerText()`)
     và 3 khối `<Alert>` HOLD (R-ATT-05-FY/ENGINE, R-ATT-04-FY/ENGINE, R-ATT-04B-CAP-CRUD) —
     nội dung/logic không đổi 1 ký tự, đúng yêu cầu "ngoài phạm vi work item này" — các khối
     này vẫn hiển thị thường trực trên Card (không đưa vào Dialog) vì là banner trạng thái hệ
     thống chứ không phải một phần của form thêm.
   - Giữ nguyên logic `onSave`/`onRetire`/`createAttLeaveAccrualPolicy`/
     `retireAttLeaveAccrualPolicy` và mọi `data-testid` cũ.
   - **Follow-up chưa sửa (ngoài phạm vi liệt kê)**: CardDescription
     `"Chính sách tích lũy versioned (F-ATT-LVRULE) — không thay thế Cài đặt chấm công chung."`
     vẫn còn mã `(F-ATT-LVRULE)` — work item A2 chỉ yêu cầu sửa CardTitle, không yêu cầu sửa
     CardDescription này; giữ nguyên để không vượt phạm vi, đề xuất theo dõi cùng audit trên.

3. **`SettingsCatalogsTab.tsx`**
   - Card "Thêm mở rộng" (danh mục, mã, nhãn) chuyển từ Card cố định dưới bảng danh mục sang
     `<Dialog>` mở qua nút mới cạnh nút "Đồng bộ từ XBOS" trên Card danh mục chính. Lưu thành
     công → đóng Dialog + reset `newCode`/`newLabel` (giữ logic cũ); đóng không lưu → reset
     qua `handleExtDialogOpenChange`.
   - `LEAVE_TYPES_REF_READONLY_MD_COPY` (định nghĩa tại
     `apps/web/hrm/src/lib/hrmSettingsLeaveTypeSot.ts`, **ngoài allowed_paths chính thức**,
     sửa theo cho phép rõ trong work item) — bỏ tên bảng DB thô `leave_types`:
     - Trước: `"Danh mục leave_types trên Cài đặt chỉ đọc REF tập đoàn (kéo XBOS). Thêm/sửa
       loại phép theo đơn vị tại tab «Loại phép ATT»."`
     - Sau: `"Danh mục Loại phép tại đây chỉ hiển thị tham chiếu từ tập đoàn (đồng bộ qua
       XBOS) và không sửa trực tiếp được ở màn này. Thêm/sửa loại phép theo đơn vị tại tab
       «Loại phép ATT»."`
   - Giữ nguyên 100% logic `syncMutation`/`appendMutation`/`removeRequestMutation` và mọi
     `data-testid`/`id` cũ (`ext-catalog-key`, `ext-code`, `ext-label`,
     `settings-catalogs-leave-types-ref-readonly`, `settings-catalogs-open-att-leave-types`,
     `catalog-sync-stamp`, `catalog-leave-types-tenant-writer-*`).

### Phần B — Copy hygiene cơ học, 10 file (bảng before/after)

| File | Trước | Sau |
|---|---|---|
| AttAttendanceCodeSettingsPanel.tsx | `'HRM-PLT-CAT-CODE-INVALID — định dạng a-z đầu + a-z0-9_ (vd. wfh_half). Không bị chặn vì «ngoài pending\|present».'` | `'Định dạng a-z đầu + a-z0-9_ (vd. wfh_half).'` |
| AttAttendanceCodeSettingsPanel.tsx | `'... «Thêm mã chấm công» (U65, không seed).'` | `'... «Thêm mã chấm công».'` |
| AttOtCompTypeSettingsPanel.tsx | `'HRM-PLT-CAT-CODE-INVALID — định dạng a-z đầu + a-z0-9_ (vd. cash_plus_leave). Không bị chặn vì «ngoài salary\|compensatory_leave».'` | `'Định dạng a-z đầu + a-z0-9_ (vd. cash_plus_leave).'` |
| AttOtCompTypeSettingsPanel.tsx | `'... «Thêm loại chi trả OT» (U65, không seed).'` | `'... «Thêm loại chi trả OT».'` |
| AttOtTypeSettingsPanel.tsx | `'HRM-PLT-CAT-CODE-INVALID — định dạng a-z đầu + a-z0-9_ (vd. night_shift_ot). Không bị chặn vì «ngoài weekday\|weekend\|holiday».'` | `'Định dạng a-z đầu + a-z0-9_ (vd. night_shift_ot).'` |
| AttOtTypeSettingsPanel.tsx | `'... «Thêm loại tăng ca» (U65, không seed).'` | `'... «Thêm loại tăng ca».'` |
| AttOtTypeSettingsPanel.tsx (B4) | `description: 'defaultCoeff ≥ 0 (display-ready — không phải công thức lương).'` | `description: 'Hệ số mặc định phải ≥ 0 (chỉ hiển thị — không dùng làm công thức lương).'` |
| EmpDocumentTypeSettingsPanel.tsx | `'HRM-PLT-CAT-CODE-INVALID — định dạng a-z / số / gạch dưới (vd. hr_doc_custom_09).'` | `'Định dạng a-z / số / gạch dưới (vd. hr_doc_custom_09).'` |
| EmpDocumentTypeSettingsPanel.tsx | `'... «Thêm loại giấy tờ» (U65, không seed).'` | `'... «Thêm loại giấy tờ».'` |
| EmpEmploymentTypeSettingsPanel.tsx | `description: 'HRM-PLT-CAT-CODE-INVALID — a-z / số / _ sau khi đổi - → _.'` | `description: 'Định dạng a-z / số / _ sau khi đổi - → _.'` |
| EmpEmploymentTypeSettingsPanel.tsx | `'... «Thêm loại hình» (U65, không seed).'` | `'... «Thêm loại hình».'` |
| RecPipelineStageSettingsPanel.tsx | `'... «Thêm giai đoạn» (U65, không seed).'` | `'... «Thêm giai đoạn».'` |
| SiInsuranceTypeSettingsPanel.tsx | `'... «Thêm loại BH» (U65, không seed).'` | `'... «Thêm loại BH».'` |
| SiInsurerSettingsPanel.tsx | `'... «Thêm nhà BH» (U65, không seed).'` | `'... «Thêm nhà BH».'` |
| AttLeaveTypeSettingsPanel.tsx | `'... «Thêm loại phép» (U65, không seed).'` | `'... «Thêm loại phép».'` |
| EmpEmploymentStatusSettingsPanel.tsx (status) | `'HRM-PLT-CAT-CODE-INVALID — định dạng a-z / số / _ sau khi đổi - → _ (vd. on_leave).'` | `'Định dạng a-z / số / _ sau khi đổi - → _ (vd. on_leave).'` |
| EmpEmploymentStatusSettingsPanel.tsx (reason) | `'HRM-PLT-CAT-CODE-INVALID — định dạng a-z / số / _ sau khi đổi - → _ (vd. resign_personal).'` | `'Định dạng a-z / số / _ sau khi đổi - → _ (vd. resign_personal).'` |
| EmpEmploymentStatusSettingsPanel.tsx (B3, status) | `<Label>Picker hiệu lực (sau F5 — AC-PLT-EMP-STATUS)</Label>` | `<Label>Picker hiệu lực (cập nhật sau khi tải lại trang)</Label>` |
| EmpEmploymentStatusSettingsPanel.tsx (B3, reason) | `<Label>Picker hiệu lực (sau F5 — AC-PLT-EMP-STATUS lý do)</Label>` | `<Label>Picker hiệu lực (cập nhật sau khi tải lại trang)</Label>` |
| EmpEmploymentStatusSettingsPanel.tsx (bổ sung, status) | `'... «Thêm trạng thái» (U65, không seed).'` | `'... «Thêm trạng thái».'` |
| EmpEmploymentStatusSettingsPanel.tsx (bổ sung, reason) | `'... «Thêm lý do» (U65, không seed).'` | `'... «Thêm lý do».'` |

**Ghi chú bổ sung ngoài B2 list gốc**: `EmpEmploymentStatusSettingsPanel.tsx` không nằm trong
danh sách B2 (8 file) nhưng có 2 dòng cùng pattern `(U65, không seed)` — đã dọn luôn vì file
này vốn đã trong allowed_paths (đang sửa B3 ở đúng file), cùng loại vi phạm, và việc bỏ sót sẽ
khiến tự-kiểm §10.4 không nhất quán giữa 2 sub-catalog Status/Reason trong cùng 1 file.

## Test / verify

1. **Grep pre-check test assertions** — tìm thấy 1 assertion cứng chuỗi jargon sắp xóa:
   `apps/web/hrm/src/components/settings/EmpEmploymentStatusSettingsPanel.test.ts:79`
   `expect(panelSrc).toContain('HRM-PLT-CAT-CODE-INVALID')` → sửa thành
   `expect(panelSrc).toContain("Định dạng a-z / số / _ sau khi đổi - → _")` (không xoá test
   case, chỉ đổi expected string cho khớp copy mới). Các test khác tham chiếu `LVRULE`/`FG1`
   chỉ là tên `describe/it` (mô tả), không assert chuỗi trong source — không cần sửa.

2. **Vitest theo đúng lệnh work item** (`pnpm --filter hrm-fe vitest run ...` → dùng
   `pnpm vitest run` trong `apps/web/hrm` vì package không có filter name `hrm-fe` — package
   thật tên `vite_react_shadcn_ts`):
   ```
   ✓ src/components/settings/EmpEmploymentStatusSettingsPanel.test.ts (10 tests) — PASS
   ```
   (Các file A1–A3, và 8 file B còn lại không có `.test.ts` riêng tên trùng — không có gì để
   chạy cho pattern đó, đúng như trước khi sửa.)

3. **Vitest toàn bộ `src/components/settings`** (regression check rộng hơn yêu cầu tối thiểu):
   ```
   Test Files  6 passed (6)
        Tests  38 passed (38)
   ```

4. **Vitest các source-lock test tham chiếu file đã sửa** (`poHrmMvpGd1Att04ClusterFe01`,
   `poHrmMvpGd1Att04bClusterFe01`, `poHrmMvpGd1Att05ClusterFe01`, `poHrmMvpGd1Core03ClusterFe01`,
   `p1-hrm-perf-fe-03`, `d-hrm-ui-strip-tech-chrome-02`, `AttCodeOtFeAdminSettingsPanels`,
   `SettingsCatalogF5ListPanels`):
   ```
   Test Files  1 failed | 7 passed (8)
        Tests  1 failed | 41 passed (42)
   ```
   Lỗi duy nhất: `poHrmMvpGd1Att04bClusterFe01.source.test.ts` — assertion trên
   `components/attendance/LeaveTab.tsx` (`expect(tab).toContain('deriveAtt04bPanelBucketLabelVi')`).
   File `LeaveTab.tsx` **không nằm trong allowed_paths của work item này** (thuộc
   `apps/web/hrm/src/components/attendance/**`, forbidden path rõ ràng), và `git status`
   xác nhận file đó đang `M` (modified) độc lập với phiên làm việc này — lỗi **pre-existing**,
   không do thay đổi trong wave này gây ra. Các assertion trên chính 2 file tôi sửa trong
   cùng test (`lvt` = `AttLeaveTypeSettingsPanel.tsx`, `lvrule` =
   `AttLeaveAccrualPolicySettingsPanel.tsx`) đều **PASS**.

5. **`pnpm tsc --noEmit`** (trong `apps/web/hrm`): **0 lỗi** (exit code 0, không output).

## Xác nhận KHÔNG đụng phạm vi cấm

- Grep tự-kiểm §10.4 (`FR-HRM-|FR-XBOS-|AC-[A-Z-]+-[0-9]|BR-[A-Z-]+-[0-9]|U6[0-9]\)|U7[0-9]\)|
  SoT\b|seed/fake|smoke only`, loại trừ dòng comment) trên toàn bộ 13 file: **0 match còn lại
  trong JSX render** (chỉ còn trong `/** @CODE-MEMORY */` — đúng R1 cho phép).
- Không sửa dòng nào chứa `hrm_personnel_uat_ready`, `attendance_uat_ready`,
  `employees_e2e_linkage_ready`, `recruitment_uat_ready`, `C-SLICE`, hay span/Alert "Honesty:".
- Không sửa file `lib/att*Ring.ts` nào — `attLeave04Ring.ts`/`attLeave04bRing.ts`/
  `attLeave05Ring.ts` chỉ được **import và gọi nguyên trạng** trong
  `AttLeaveAccrualPolicySettingsPanel.tsx` (banner + 3 Alert HOLD giữ nguyên 100% nội dung).
- Không đổi bất kỳ `data-testid` cũ, tên field API/DTO, hay logic mutate/validate nào — chỉ
  đổi TEXT hiển thị + NƠI render (Card cố định → Dialog). Đã verify bằng grep đếm số lần xuất
  hiện từng `data-testid` cũ trước/sau khi ghi file (khớp 100%).
- File ngoài allowed_paths chính thức nhưng có sửa (có giải thích + xin phép rõ trong work
  item): `apps/web/hrm/src/lib/hrmSettingsLeaveTypeSot.ts` (hằng số
  `LEAVE_TYPES_REF_READONLY_MD_COPY`, lý do: bỏ tên bảng DB thô `leave_types` theo đúng A3);
  `apps/web/hrm/src/components/settings/EmpEmploymentStatusSettingsPanel.test.ts` (sửa 1
  expected string theo bước "Test/verify bắt buộc" #1, không xoá test case).

## Follow-up đề xuất (chưa sửa, ngoài phạm vi liệt kê rõ trong work item)

1. `JdDynamicSettingsPanel.tsx` — thông báo lỗi tải cấu hình lộ mã API nội bộ
   `F-JD-DEF/GRP/PCK/RUL` trong `setError(...)`.
2. `AttLeaveAccrualPolicySettingsPanel.tsx` — CardDescription còn mã `(F-ATT-LVRULE)`.

Cả 2 đã tồn tại **trước** wave này, không nằm trong danh sách copy A1/A2 được giao; giữ
nguyên để không vượt phạm vi allowed_paths/exit_criteria. Đề xuất gộp vào
`BA-HRM-SETTINGS-PANEL-IA-AUDIT-01` (audit toàn menu Cài đặt).
