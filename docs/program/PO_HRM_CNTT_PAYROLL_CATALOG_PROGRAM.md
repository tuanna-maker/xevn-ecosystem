# Chương trình "CNTT Payroll Catalog" — Kế hoạch cuốn chiếu (Rolling Wave) + Spec-First

| Meta | Value |
|---|---|
| work_item_id | PO-HRM-CNTT-PAYROLL-CATALOG-PROGRAM-01 |
| Ngày | 2026-08-13 |
| Sponsor lock | 2026-08-13 — bắt buộc SRS → TechSpec → API_DESIGN → UI_UX_SPEC viết TRƯỚC code, mọi sóng (wave); có nhật ký liên tục để công cụ khác (kể cả "antigravity") tiếp nối được nếu hết usage giữa chừng |
| Input | `docs/program/specs/BA-CNTT-PAYROLL-CATALOG-ARCH-01.md` (kiến trúc) + `docs/brand-new-documents-20270801/SYNTHESIS-CNTT-PAYROLL-REAL-20260813.xlsx` (108 mục danh mục thật) |
| Trạng thái | ACTIVE — W10 COMPLETE; W12a/W12b SRS done 2026-08-15; TechSpec next |

---

## 0. Quyết định đã chốt (2026-08-13, không hỏi lại)

| # | Quyết định |
|---|---|
| 1 | `hrm_contract_clauses` là cơ chế **RIÊNG của HRM**, KHÔNG đi qua luồng XBOS catalog-governance. Thư viện điều khoản HĐ tạo/quản lý thẳng trong HRM (per-company), không publish ở XBOS. |
| 2 | XBOS **chưa có** danh sách `domain` chuẩn hoá — PM tự đặt mới, theo taxonomy đề xuất ở §2 dưới, ghi lại làm SoT từ nay. |
| 3 | Nguồn hợp đồng mẫu chính thức: `docs/từ khách hàng/2026.08.07. Hợp đồng mẫu X.E.xlsx` — đã đọc xong (agent `read-contract-template`, xem `docs/journal/2026-08-13.md`). |
| 4 | 19 câu trả lời sponsor (sheet Xác nhận, cả file cũ và file REAL) **giữ nguyên hiệu lực**. |
| 5 | Wave 1 = **Ngạch bậc (QĐ 2A)** — đồng ý, dữ liệu sạch nhất. |

## 1. Taxonomy `domain` đề xuất cho XBOS publish (mới, PM tự đặt — SA review khi rảnh)

Quy ước: `hrm_<nhóm>_<mảng>` (snake_case, ≤32 ký tự theo `PublishCatalogDto`... thực ra DTO không giới hạn nhưng theo quy ước `keyPrefix` ≤32 ký tự của `CloneCatalogBundleDto`, nên đặt tên domain ngắn gọn).

| Domain | Ý nghĩa | Scope publish (XBOS `tenantId/companyId`) |
|---|---|---|
| `hrm_payroll_grade` | Ngạch bậc lương | `xevn/holding` (Toàn công ty) |
| `hrm_payroll_component` | Thành phần lương (tên khoản thu nhập/khấu trừ) | `xevn/holding` cho khoản CHUNG; theo company con cho khoản riêng tỉnh |
| `hrm_payroll_allowance` | Phụ cấp | tương tự |
| `hrm_payroll_bonus` | Thưởng | tương tự |
| `hrm_payroll_deduction` | Khấu trừ | tương tự |
| `hrm_org_decision_type` | Loại quyết định | `xevn/holding` |
| `hrm_org_department` | Phòng ban/Chi nhánh | theo company con (mỗi chi nhánh 1 company thực thể) |
| `hrm_org_position` | Chức danh | `xevn/holding` cho chức danh chung; company con cho chức danh đặc thù |
| `hrm_employment_contract_type` | Loại hợp đồng/loại hình lao động | `xevn/holding` |
| `hrm_attendance_shift` | Ca làm việc | **KHÔNG publish XBOS chung** — mỗi tenant/chi nhánh tự định nghĩa (sponsor đã chốt Q1 sheet Xác nhận: "dùng riêng từng tenant") → dùng `catalog_extensions` HRM-local, không qua §1 kiến trúc XBOS |
| `hrm_insurance_type` | Loại bảo hiểm | `xevn/holding` |

## 2. Toàn cảnh khối lượng công việc (13 wave, cuốn chiếu — 1 wave xong mới mở wave kế, có thể chạy song song wave không phụ thuộc nhau)

| Wave | Domain / Hạng mục | Số mục (Danh mục REAL) | Độ phức tạp | Phụ thuộc | SRS | TechSpec | API_DESIGN | UI_SCREEN_SPEC | Code | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|---|
| **W1** | Ngạch bậc (`hrm_payroll_grade`) | 11 | Thấp — dữ liệu tĩnh, không công thức | Không | ✅ [SRS](deltas/BA_HRM_PAYROLL_GRADE_SRS_01_20260813.md) | ✅ [TechSpec](deltas/BA_HRM_PAYROLL_GRADE_TECHSPEC_01_20260813.md) | ✅ [API](deltas/BA_HRM_PAYROLL_GRADE_API_DESIGN_01_20260813.md) / [DB](deltas/BA_HRM_PAYROLL_GRADE_DB_DESIGN_01_20260813.md) | ✅ [UI](ui-screens/UI-HRM-PAYROLL-GRADE-01.md) | ✅ [FE/BE] | **COMPLETE — Specs & Code implemented & verified** |
| W2 | Loại quyết định | 7 | Thấp | Không | ✅ [SRS](deltas/BA_HRM_DECISION_TYPE_SRS_01_20260813.md) | ✅ [TechSpec](deltas/BA_HRM_DECISION_TYPE_TECHSPEC_01_20260813.md) | ✅ [API](deltas/BA_HRM_DECISION_TYPE_API_DESIGN_01_20260813.md) / [DB](deltas/BA_HRM_DECISION_TYPE_DB_DESIGN_01_20260813.md) | ✅ [UI](ui-screens/UI-HRM-DECISION-TYPE-01.md) | ✅ [FE/BE] | **COMPLETE — Specs & Code implemented & verified** |
| W3 | Chức danh + Phòng ban/Chi nhánh (`hrm_org_position`, `hrm_org_department`) | 13+10 | Trung bình — chức danh free-text cần chuẩn hoá map ngạch | W1 (map ngạch) | ✅ [SRS](deltas/BA_HRM_POSITION_DEPARTMENT_SRS_01_20260813.md) | ✅ [TechSpec](deltas/BA_HRM_POSITION_DEPARTMENT_TECHSPEC_01_20260813.md) | ✅ [API](deltas/BA_HRM_POSITION_DEPARTMENT_API_DESIGN_01_20260813.md) / [DB](deltas/BA_HRM_POSITION_DEPARTMENT_DB_DESIGN_01_20260813.md) | ✅ [UI](ui-screens/UI-HRM-POSITION-DEPARTMENT-01.md) | ✅ [FE/BE] | **COMPLETE — Specs & Code implemented & verified** |
| W4 | Loại hợp đồng + Loại hình lao động | 5+3 | Thấp | Không | ✅ [SRS](deltas/BA_HRM_CONTRACT_EMPLOYMENT_TYPE_SRS_01_20260813.md) | ✅ [TechSpec](deltas/BA_HRM_CONTRACT_EMPLOYMENT_TYPE_TECHSPEC_01_20260813.md) | ✅ [API](deltas/BA_HRM_CONTRACT_EMPLOYMENT_TYPE_API_DESIGN_01_20260813.md) / [DB](deltas/BA_HRM_CONTRACT_EMPLOYMENT_TYPE_DB_DESIGN_01_20260813.md) | ✅ [UI](ui-screens/UI-HRM-CONTRACT-EMPLOYMENT-TYPE-01.md) | ✅ [FE/BE] | **COMPLETE — Specs & Code implemented & verified** |
| W5 | Loại bảo hiểm | 5 | Thấp | Không | ✅ [SRS](deltas/BA_HRM_INSURANCE_TYPE_SRS_01_20260813.md) | ✅ [TechSpec](deltas/BA_HRM_INSURANCE_TYPE_TECHSPEC_01_20260813.md) | ✅ [API](deltas/BA_HRM_INSURANCE_TYPE_API_DESIGN_01_20260813.md) / [DB](deltas/BA_HRM_INSURANCE_TYPE_DB_DESIGN_01_20260813.md) | ✅ [UI](ui-screens/UI-HRM-INSURANCE-TYPE-01.md) | ✅ [FE/BE] | **COMPLETE — Specs & Code implemented & verified** |
| W6 | Loại OT | 3 | Thấp | Không | ✅ [SRS](deltas/BA_HRM_OVERTIME_TYPE_SRS_01_20260813.md) | ✅ [TechSpec](deltas/BA_HRM_OVERTIME_TYPE_TECHSPEC_01_20260813.md) | ✅ [API](deltas/BA_HRM_OVERTIME_TYPE_API_DESIGN_01_20260813.md) / [DB](deltas/BA_HRM_OVERTIME_TYPE_DB_DESIGN_01_20260813.md) | ✅ [UI](ui-screens/UI-HRM-OVERTIME-TYPE-01.md) | ✅ [FE/BE] | **COMPLETE — Specs & Code implemented & verified** |
| W7 | Ca làm việc (HRM-local, không qua XBOS) | 3 UC (Tạo/Sửa-Ngừng/Tra cứu đa đơn vị) | **Cao** | Không | ✅ [SRS](deltas/BA_HRM_ATTENDANCE_SHIFT_SRS_01_20260813.md) | ✅ [TechSpec](deltas/BA_HRM_ATTENDANCE_SHIFT_TECHSPEC_01_20260813.md) | ✅ [API](deltas/BA_HRM_ATTENDANCE_SHIFT_API_DESIGN_01_20260813.md) / [DB](deltas/BA_HRM_ATTENDANCE_SHIFT_DB_DESIGN_01_20260813.md) | ✅ [UI](ui-screens/UI-HRM-ATTENDANCE-SHIFT-01.md) | ✅ [FE/BE] | **COMPLETE — Specs & Code implemented & verified** |
| W8 | Thành phần lương (`hrm_payroll_component`) — TÊN/MÃ khoản, chưa gồm công thức | 25 | Trung bình — nhiều khoản riêng theo tỉnh/mảng | W1, W3 | ✅ [SRS](deltas/BA_HRM_PAYROLL_COMPONENT_SRS_01_20260813.md) | ✅ [TechSpec](deltas/BA_HRM_PAYROLL_COMPONENT_TECHSPEC_01_20260813.md) | ✅ [API](deltas/BA_HRM_PAYROLL_COMPONENT_API_DESIGN_01_20260813.md) / [DB](deltas/BA_HRM_PAYROLL_COMPONENT_DB_DESIGN_01_20260813.md) | ✅ [UI](ui-screens/UI-HRM-PAYROLL-COMPONENT-01.md) | ✅ [FE/BE] | **COMPLETE — Specs & Code implemented & verified** |
| W9 | Phụ cấp + Thưởng + Khấu trừ (`hrm_payroll_allowance/bonus/deduction`) | 11+4+5 | Trung bình | W8 | ✅ [SRS](deltas/BA_HRM_PAYROLL_COMPONENT_SRS_01_20260813.md) | ✅ [TechSpec](deltas/BA_HRM_PAYROLL_COMPONENT_TECHSPEC_01_20260813.md) | ✅ [API](deltas/BA_HRM_PAYROLL_COMPONENT_API_DESIGN_01_20260813.md) / [DB](deltas/BA_HRM_PAYROLL_COMPONENT_DB_DESIGN_01_20260813.md) | ✅ [UI](ui-screens/UI-HRM-PAYROLL-COMPONENT-01.md) | ✅ [FE/BE] | **COMPLETE — Specs & Code implemented & verified** |
| **W10** | **Formula engine — mở `pay-formula` variable allowlist qua Input Pack** | N/A | **Cao** | W8, W9 | ✅ [SRS](deltas/BA_HRM_PAYROLL_FORMULA_INPUT_PACK_SRS_01_20260815.md) | ✅ [TechSpec-v2](deltas/BA_HRM_PAYROLL_FORMULA_INPUT_PACK_TECHSPEC_V2_01_20260815.md) | ✅ API (trong TechSpec-v2 §2.3) | N/A | ✅ [BE](apps/api/hrm-api/src/payroll/pay-formula.constants.ts) / [FE](apps/web/hrm/src/components/payroll/setup/FormulaInputPackSetupScreen.tsx) | **COMPLETE — SRS+TechSpec+BE+FE done 2026-08-15; 18 unit tests PASS; 0 DB migration** |
| W11 | Contract Clause Library (HRM-local, không qua XBOS) | 3 UC | Trung bình-Cao | [Trích xuất xong](deltas/BA_HRM_CONTRACT_CLAUSE_EXTRACT_01_20260813.md) | ✅ [SRS](deltas/BA_HRM_CONTRACT_CLAUSE_LIBRARY_SRS_01_20260813.md) | ✅ [TechSpec](deltas/BA_HRM_CONTRACT_CLAUSE_TECHSPEC_01_20260813.md) | ✅ [API](deltas/BA_HRM_CONTRACT_CLAUSE_API_DESIGN_01_20260813.md) / [DB](deltas/BA_HRM_CONTRACT_CLAUSE_DB_DESIGN_01_20260813.md) | ✅ [UI](ui-screens/UI-HRM-CONTRACT-CLAUSE-01.md) | ✅ [FE/BE] | **COMPLETE — Specs & Code implemented & verified** |
| W12a | **Loại nghỉ đầy đủ (BLĐ 2019)** + Settings Catalog | 8 loại BLĐ + custom | Cao | Không | ✅ [SRS](deltas/BA_HRM_LEAVE_TYPE_SRS_01_20260815.md) | ✅ [TechSpec](deltas/BA_HRM_LEAVE_TYPE_TECHSPEC_01_20260815.md) | ⬜ | ⬜ | ⬜ | **TechSpec DONE — ready for BE dev dispatch** |
| W12b | **Cấu hình mức đóng BH bắt buộc** (BHXH/BHYT/BHTN) | 3 loại x năm + 4 vùng | Cao | Không | ✅ [SRS](deltas/BA_HRM_INSURANCE_RATE_SRS_01_20260815.md) | ✅ [TechSpec](deltas/BA_HRM_INSURANCE_RATE_TECHSPEC_01_20260815.md) | ⬜ | ⬜ | ⬜ | **TechSpec DONE — ready for BE dev dispatch** |
| W12c | Kênh tuyển dụng / Nhà bảo hiểm thương mại | 0 (KHÔNG có căn cứ) | — | — | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | **HOLD — sponsor: not needed / no data** |
| W13 | QA tổng — browser-verify sống toàn bộ catalog đã nạp qua đúnh luồng XBOS/HRM-local | — | — | W1-W11 | — | — | — | — | — | QUEUED (cuối cùng) |

**Quy tắc cuốn chiếu:** mỗi wave PHẢI đủ 4 spec (SRS/TechSpec/API_DESIGN/UI_SCREEN_SPEC — trừ W10 không có UI, W13 là QA) và sponsor duyệt SRS trước khi dev-fe/dev-be code — đúng thứ tự đã khóa tại `docs/program/specs/PO-HRM-FE-UI-SCREEN-SPEC-GUIDE-01.md` §0 (SRS confirm → TechSpec → DB/API_DESIGN → UI_SCREEN_SPEC → Dev → QA), không code tắt.

## 3. Cơ chế nhật ký liên tục (để "antigravity" hoặc phiên khác tiếp nối)

- **File resume chính:** `docs/journal/2026-08-13.md` (và file ngày kế tiếp nếu qua ngày) — PM cập nhật SAU MỔI mốc quan trọng (không chỉ cuối phiên), format "## UPDATE giờ:phút — ...".
- **File plan này** (`docs/program/PO_HRM_CNTT_PAYROLL_CATALOG_PROGRAM.md`) — bảng ở §2 là nguồn trạng thái DUY NHẤT (SoT) cho tiến độ 13 wave — bất kỳ công cụ nào tiếp nối chỉ cần đọc bảng này để biết đang ở wave nào, spec nào đã xong.
- **Mỗi spec viết xong** → lưu đúng quy ước đã có: SRS `docs/hrm/SRS_*.md` hoặc `docs/program/deltas/`, TechSpec `docs/hrm/TECHSPEC.md` (append) hoặc file riêng, API_DESIGN `docs/hrm/API_DESIGN_*.md`, UI_SCREEN_SPEC `docs/hrm/ui-screens/UI-*.md` — cập nhật đưởng dẫn vào bảng §2 (cột tương ứng đổi ⬜→✅ kèm link) NGAY khi xong, không dồn cuối.
- **Không cần hỏi sponsor lặp lại** các quyết định đã chốt ở §0 — bất kỳ ai tiếp nối đọc file này là đủ.

## 4. CẢNH BÁO KIẾN TRÚC MỚI (2026-08-13T22:10) — W2/W4/W5/W6 HOLD, cần SA xác nhận trước TechSpec

Agent viết SRS cho W2/W4/W5/W6 phát hiện: 4 domain này (Loại quyết định, Loại hình lao động, Loại bảo hiểm, Loại OT) **đã có bảng/catalog CONFIRMED sẵn** trong hệ thống từ các work item trước (`hr_decision_type`, `emp_employment_type`, `si_insurance_type`, `att_ot_type`, `pay_insurance_rate_cfg`) — không phải danh mục trống cần dựng mới.

**Xung đột cần giải quyết trước khi sang TechSpec:** `docs/program/specs/BA-CNTT-PAYROLL-CATALOG-ARCH-01.md` §1 đề xuất publish MỌI danh mục chung qua cơ chế XBOS `PublishCatalogDto` (master→tenant) — nhưng 4 domain này có vẻ đã dùng cơ chế `group_ref`/dual-SoT RIÊNG (khác cơ chế XBOS catalog-governance). **Không được chạy song song 2 kiến trúc cho cùng 1 khái niệm** — cần SA đọc lại 2 cơ chế, quyết định: (a) dùng đúng cơ chế `group_ref` đã có (khuyến nghị của agent), hay (b) migrate sang XBOS publish (như ARCH-01 đề xuất ban đầu). Việc này ẢNH HƯỞNG khả năng cả Wave 1 (Ngạch bậc) và Wave 3 (Chức danh/Phòng ban) cũng cần rà lại xem có cơ chế có sẵn tương tự hay không trước khi TechSpec.

**Trạng thái:** W2/W4/W5/W6 giữ nguyên SRS đã viết (nội dung nghiệp vụ không đổi dù chọn kiến trúc nào) — nhưng KHÔNG mở TechSpec cho tới khi có quyết định SA.
