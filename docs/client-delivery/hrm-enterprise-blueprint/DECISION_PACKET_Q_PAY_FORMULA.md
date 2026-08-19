# Phiếu quyết định — Công thức tính lương (Q-PAY-FORMULA)

| Mục | Nội dung |
|-----|----------|
| **Mã quyết định** | Q-PAY-FORMULA |
| **Ngày** | 04/08/2026 |
| **Nguồn** | Họp blueprint + Excel yêu cầu đối tác (`REQ_L_002`) + sơ đồ kiến trúc (slide công thức lương) |
| **Trạng thái** | **ANSWERED** — FILL + REMAINING · matrix **1.1.4** · `PO-HRM-BP-UC-GAP-W3-MATRIX-APPLY-02` |
| **Chi tiết kỹ thuật** | ADR 4 trụ · mục Quyết định công thức lương |
| **Sponsor stamp** | Q-PAY-FORMULA = **Đồng ý 2 bước** · Q-PAY-F-2 FILL **GĐ1 kéo-thả** → **SUPERSEDE R-PAY-DD-01 = Form GĐ1 + kéo-thả GĐ2** · Q-PAY-F-3 = **chỉ bảng công chốt** |

---

## Vấn đề cần chốt

Hai cách hiểu đang cùng tồn tại:

1. **Excel đối tác:** bộ phận kỹ thuật thiết lập công thức trên cơ sở dữ liệu.  
2. **Sơ đồ họp:** nhân sự lắp biến số trên “máy công thức”; không viết cứng công thức trong phần mềm mỗi kỳ lương.

Cần một quy tắc chung để thiết kế SRS / xây dựng không lệch.

---

## Phương án đề xuất (khuyến nghị)

**Hai bước kiểm soát + máy công thức theo cấu hình**

| Bước | Ai làm | Ý nghĩa |
|------|--------|---------|
| Soạn thảo | C&B / quản trị lương | Tạo hoặc sửa bản nháp công thức, phụ cấp, hệ số |
| Phát hành | Vai trò kỹ thuật (hoặc đồng ký C&B + kỹ thuật) | Đưa bản nháp thành bản **hiệu lực** theo công ty / ngày áp dụng |
| Tính lương kỳ | Hệ thống | Chỉ **áp dụng** bản đã phát hành + **bảng công đã chốt** — không tự lấy OT/phép trực tiếp |

- Giai đoạn 1: cấu hình **form** + xem trước kết quả + nhật ký phiên bản.  
- ~~Giai đoạn 1 chưa bắt buộc kéo-thả~~ → ~~Q-PAY-F-2 GĐ1 kéo-thả~~ → **DOC-DELTA REMAINING R-PAY-DD-01:** **Form GĐ1 + kéo-thả GĐ2** (2 bước soạn→phát hành vẫn giữ).

**Không làm:** viết cứng công thức / hệ số theo từng công ty trong mã nguồn mỗi kỳ lương; nhân sự tự phát hành một mình không có bước kiểm soát (giai đoạn 1).

---

## Hệ quả khi đồng ý

- Bảng công **đã chốt** vẫn là nguồn duy nhất đưa vào tính lương.  
- Mọi thay đổi công thức có phiên bản, xem trước, và người chịu trách nhiệm phát hành.  
- Tuyển dụng **không** nối thẳng sang lương.

---

## Các quyết định kèm (cùng buổi nếu tiện)

| Mã | Nội dung ngắn | Đề xuất |
|----|---------------|---------|
| Q-ASSET-MODULE | Cấp phát tài sản | Giai đoạn 1: mã/serial + biên bản + thu hồi khi nghỉ; module tài sản đầy đủ sau |
| Q-REC-HEADCOUNT | Trong / ngoài định biên | Luồng duyệt BOD khác nhau — chi tiết trong WBS tuyển dụng |
| Q-XBOT-PROFILE | Cấu hình hồ sơ qua Xbot | Làm rõ = danh mục tập đoàn hiện có hay hệ riêng |

---

## Xác nhận đối tác

| Hạng mục | Đồng ý / Không / Có điều kiện | Ghi chú | Họ tên · Ngày |
|----------|-------------------------------|---------|----------------|
| Q-PAY-FORMULA theo phương án khuyến nghị | **Đồng ý 2 bước** | FILL Excel | Sponsor |
| Giai đoạn 1 kéo-thả (Q-PAY-F-2) | ~~GĐ1 kéo-thả~~ → **Form GĐ1 + kéo-thả GĐ2** (R-PAY-DD-01) | REMAINING Excel | Sponsor |
| Biến OT/phép từ bảng công chốt (Q-PAY-F-3) | **Xác nhận đúng** | FILL Excel | Sponsor |
| Q-ASSET-MODULE | **CRUD MVP** | FILL Excel | Sponsor |

**DOC-DELTA 1.1.4b:** R-PAY-DD-01 supersede Q-PAY-F-2. SRS **v0.8** đã phản ánh (SRS-CHOT-01). TechSpec **S3 HOLD** · program gap **NOT_READY** (product fidelity) · **cấm** unfinished-PAY / claim PAY LIVE.

