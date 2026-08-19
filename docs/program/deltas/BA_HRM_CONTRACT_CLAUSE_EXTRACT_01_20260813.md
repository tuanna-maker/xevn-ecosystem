# BA-Data — Trích xuất cấu trúc điều khoản từ Hợp đồng mẫu X.E (Wave 11 input)

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-CONTRACT-CLAUSE-EXTRACT-01 |
| Nguồn | `docs/từ khách hàng/2026.08.07. Hợp đồng mẫu X.E.xlsx` (18 sheet, đọc thật bằng openpyxl, chỉ đọc không sửa) |
| Dùng cho | Wave 11 — Contract Clause Library (`docs/program/PO_HRM_CNTT_PAYROLL_CATALOG_PROGRAM.md`) |
| Ngày | 2026-08-13 |

## Tóm tắt cấu trúc file

18 sheet → chỉ **4 template gốc** khác nhau về nội dung pháp lý (A/B/C/D dưới đây), còn lại là bản sao gần-y-hệt (VLOOKUP khác nhân viên mẫu, nhiều bản lỗi `#N/A`/`#REF!`) + 4 sheet không phải hợp đồng (bảng dữ liệu nhân sự/tracking — chứa PII thật, **không đưa vào seed/demo**).

Cơ chế chọn pháp nhân: dropdown "Đơn vị" 1-4 → 1=CÔNG TY TNHH X.E VIỆT NAM, 2=CÔNG TY TNHH DU LỊCH X.E VIỆT NAM, 3=Xưởng dịch vụ (**chưa có dữ liệu mẫu — cần hỏi khách hàng**), 4=CÔNG TY TNHH DU LỊCH VISUN.

## 4 template gốc

| Template | Áp dụng | Đặc điểm khác biệt chính |
|---|---|---|
| **A** — HĐTV Khối VP | Thử việc, văn phòng | Baseline 5 điều |
| **B** — HĐLĐ Khối VP | Chính thức (12T/24T/KXĐTH), văn phòng | +NDA chặt hơn (dẫn "Giám đốc" thay vì "Ban lãnh đạo" ở 1 số bản), +nghĩa vụ thông báo thay đổi cá nhân, +báo trước khi đơn phương chấm dứt |
| **C** — HĐTV Khối LX | Thử việc, lái xe | +khối GPLX, +giờ làm "không quá 48h/tuần" (khác "8h/ngày" của VP), +tuân thủ luật giao thông, +mốc báo trước nghỉ việc cụ thể (10-15 ngày NLĐ / 1-3 ngày NSDLĐ — khác B chỉ dẫn chung "theo pháp luật") |
| **D** — HĐLĐ Khối LX | Chính thức, lái xe | = B + đặc thù C + thêm nghĩa vụ báo cáo an toàn LĐ/tai nạn, +quyền NSDLĐ yêu cầu bồi thường vật chất khi vi phạm kỷ luật |

Cấu trúc chung cả 4 template: Mở đầu (bên tham gia) → Điều 1 (Thời hạn &amp; công việc) → Điều 2 (Chế độ làm việc) → Điều 3.1 (Quyền lợi NLĐ + Bảo mật thông tin) → Điều 3.2 (Nghĩa vụ NLĐ) → Điều 4.1 (Nghĩa vụ NSDLĐ) → Điều 4.2 (Quyền hạn NSDLĐ) → Điều 5 (Điều khoản thi hành) → Chữ ký.

## 14 điều khoản DÙNG CHUNG (ứng viên seed mặc định — xuất hiện cả 4 template)

`CL-WORKTOOL-01` cấp phát dụng cụ · `CL-SALARY-FORM-01` hình thức/kỳ hạn trả lương · `CL-BONUS-01` chế độ thưởng · `CL-PPE-01` bảo hộ lao động · `CL-LEAVE-01` chế độ nghỉ ngơi · `CL-INSURANCE-01` BHXH/BHYT/BHTN · `CL-TRAINING-01` chế độ đào tạo · `CL-NDA-01` bảo mật thông tin (2 biến thể câu chữ, cần BA chọn 1 bản chuẩn) · `CL-DUTY-COMPLY-01` nghĩa vụ hoàn thành công việc &amp; chấp hành nội quy · `CL-DUTY-COMPENSATE-01` bồi thường vi phạm/thiệt hại · `CL-DUTY-NOTIFY-01` thông báo thay đổi thông tin cá nhân (chỉ B/D) · `CL-ER-DUTY-01` nghĩa vụ NSDLĐ bảo đảm việc làm/thanh toán · `CL-ER-RIGHT-01` quyền điều hành/kỷ luật NSDLĐ · `CL-TERM-01` điều khoản thi hành chung (câu cuối lệch nhẹ giữa các bản — cần chuẩn hoá).

## Điều khoản đặc thù khối Lái xe (gắn `applies_to = Khối LX`, không seed mặc định cho VP)

`CL-LX-TRAFFIC-01` tuân thủ luật giao thông (C, D) · `CL-LX-SAFETY-01` báo cáo an toàn LĐ/tai nạn (chỉ D) · `CL-LX-NOTICE-01` mốc báo trước nghỉ việc cụ thể (chỉ C) · `CL-LX-DISCIPLINE-01` quyền yêu cầu bồi thường vật chất khi vi phạm kỷ luật (chỉ D).

## Trường động (merge field) cần đối chiếu với hệ thống merge-token hiện có

Số HĐ, ngày ký, đơn vị/pháp nhân (+người đại diện/chức vụ/điện thoại/địa chỉ), loại HĐ, ngày bắt đầu/kết thúc, họ tên NLĐ, mã NV, ngày sinh, CCCD (số/ngày cấp/nơi cấp), địa chỉ thường trú, (khối LX: số GPLX/hạng/ngày cấp/hạn), phòng/bộ phận/chức vụ/chức danh, địa điểm làm việc, mức lương, quốc tịch (có thể cố định "Việt Nam" thay vì field động).

## Lưu ý quan trọng

1. **4 sheet chứa PII thật** ("Mã NV", "Trang tính102", "Thẻ nghiệp vụ", "Trang tính103") — chỉ dùng để xác định cấu trúc field, **không đưa dữ liệu mẫu thật vào seed/demo bất kỳ đâu** (đúng rule U65).
2. Phát hiện **lệch văn bản nhỏ giữa các bản sao** cùng loại HĐ (câu cuối Điều 5, "Ban lãnh đạo" vs "Giám đốc" trong NDA) — cần BA làm việc với khách hàng chốt 1 bản chuẩn duy nhất trước khi seed, không tự ý chọn.
3. Pháp nhân "Xưởng dịch vụ" (Đơn vị=3) chưa có dữ liệu mẫu — cần hỏi khách hàng tên đầy đủ/người đại diện/địa chỉ trước khi đưa vào hệ thống.
4. Cơ chế hiện tại của khách hàng (Excel VLOOKUP thủ công) dễ vỡ (nhiều bản lỗi `#N/A`/`#REF!`) — khi thiết kế merge-engine HRM cần field binding theo TÊN chuẩn hoá, không theo vị trí ô.
