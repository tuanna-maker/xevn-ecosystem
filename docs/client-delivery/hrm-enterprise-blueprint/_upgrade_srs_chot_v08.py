# -*- coding: utf-8 -*-
"""
PO-HRM-BP-SRS-CHOT-01 — UPGRADE SRS v0.7 → v0.8 from SPONSOR_CHOT_FILL + REMAINING.
- Expand sheet03 EXPAND UCs to 7-section FR
- ADD ATT-03d + ATT-05b (MVP); do NOT ADD 03e
- Stamp OUT/GĐ2; PAY Form GĐ1 + kéo-thả GĐ2; leave FY CRUD; sign XBOS workflow
- No patch_srs wipe — only rewrite target FR bodies + header/scope/changelog
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRS = ROOT / "SRS_HRM_ENTERPRISE.md"

EXPAND = {
    "UC-BP-ATT-01",
    "UC-BP-ATT-03b",
    "UC-BP-ATT-04",
    "UC-BP-ATT-04b",
    "UC-BP-ATT-05",
    "UC-BP-ATT-06",
    "UC-BP-ATT-07",
    "UC-BP-ATT-12",
    "UC-BP-REC-00",
    "UC-BP-REC-04",
    "UC-BP-REC-05",
    "UC-BP-REC-06",
    "UC-BP-REC-07",
    "UC-BP-CORE-02b",
    "UC-BP-CORE-03",
    "UC-BP-CORE-05",
    "UC-BP-CORE-06",
    "UC-BP-CORE-07",
    "UC-BP-CORE-09",
    "UC-BP-CORE-10",
    "UC-BP-PAY-03",
    "UC-BP-PAY-05",
    "UC-BP-PAY-06",
    "UC-BP-PAY-07",
    "UC-BP-PAY-08",
    "UC-BP-PAY-09",
}

# Title / actors / purpose / BR / inputs / special / success — implementation-ready VI
FR_SPEC: dict[str, dict[str, object]] = {
    "UC-BP-REC-00": {
        "title": "Thư viện mô tả công việc (JD master)",
        "actors": "Nhân sự tuyển dụng · Trưởng bộ phận · HCNS",
        "prio": "Cao — MVP",
        "pre": "Đã chọn đúng pháp nhân; có quyền quản trị thư viện mô tả",
        "post": "Có bản mô tả hiệu lực; YCTD có thể tham chiếu mã JD",
        "br": "BR-BP-JD-01",
        "purpose": "Quản lý mô tả công việc chuẩn làm đầu vào cho yêu cầu tuyển — một nguồn mô tả, không nhập lại mỗi lần.",
        "inputs": [
            ("Tiêu đề / mã JD", "Có", "Theo pháp nhân; không trùng mã đang hiệu lực"),
            ("Mô tả · yêu cầu kỹ năng · cấp bậc", "Có", "Đủ trường bắt buộc cấu hình"),
            ("Trạng thái", "Có", "Nháp / Hiệu lực / Ngừng"),
        ],
        "flow": [
            "Mở thư viện JD theo pháp nhân.",
            "Tạo hoặc cập nhật tiêu đề, mô tả, kỹ năng, cấp bậc.",
            "Đưa bản nháp sang hiệu lực (có quyền).",
            "Khi tạo YCTD: chọn JD còn hiệu lực — hệ thống gắn mã, không bắt copy toàn bộ mô tả.",
        ],
        "rules": [
            "JD master là đầu vào YCTD; không thay thế YCTD hay pipeline ứng viên.",
            "Ngừng JD không xóa lịch sử YCTD đã tham chiếu.",
        ],
        "special": [
            ("YCTD tham chiếu JD đã ngừng", "Cho xem lịch sử; chặn chọn JD ngừng cho YCTD mới"),
            ("Hai pháp nhân cùng chức danh", "Không trộn thư viện giữa pháp nhân"),
        ],
        "seq": ("HR", "Thư viện JD", "YCTD"),
        "dien": [
            ("1", "Mở thư viện", "Đúng phạm vi", "Danh sách JD"),
            ("2", "Lưu / phát hành", "Đủ trường", "JD hiệu lực"),
            ("3", "YCTD chọn JD", "JD còn hiệu lực", "YCTD gắn mã JD"),
            ("Thành công", "—", "—", "Một nguồn mô tả; sẵn sàng tạo YCTD"),
        ],
    },
    "UC-BP-REC-04": {
        "title": "Quét kho ứng viên nội bộ trước kênh ngoài",
        "actors": "Nhân sự tuyển dụng · Trưởng bộ phận",
        "prio": "Cao — MVP",
        "pre": "Có YCTD đã duyệt; kho ứng viên nội bộ theo pháp nhân",
        "post": "Đã quét (hoặc bỏ qua có lý do + quyền); kết quả gắn YCTD",
        "br": "BR-BP-CV-01",
        "purpose": "Trước khi mở kênh ngoài, tìm trong kho nội bộ theo chức danh và kỹ năng; giữ lịch sử nguồn.",
        "inputs": [
            ("YCTD", "Có", "Đã duyệt, đúng pháp nhân"),
            ("Tiêu chí kỹ năng / chức danh", "Có", "Không chỉ lọc hành chính"),
            ("Lý do bỏ qua quét", "Khi skip", "Bắt buộc + quyền"),
        ],
        "flow": [
            "Mở YCTD → bước Quét kho nội bộ.",
            "Nhập tiêu chí → xem danh sách khớp.",
            "Gắn ứng viên phù hợp vào pipeline YCTD hoặc ghi bỏ qua có lý do.",
            "Chỉ sau bước này (hoặc skip hợp lệ) mới mở kênh ngoài (khi GĐ2 bật).",
        ],
        "rules": [
            "Bước quét nội bộ bắt buộc trước đăng ngoài, trừ khi skip có lý do và quyền.",
            "Trạng thái ứng viên luôn gắn YCTD (quan hệ nhiều–nhiều).",
        ],
        "special": [
            ("Không có ứng viên khớp", "Cho tiếp tục với log «đã quét — 0 kết quả»"),
            ("Skip không lý do", "Chặn"),
        ],
        "seq": ("HR", "Kho CV", "YCTD"),
        "dien": [
            ("1", "Quét kho", "Có YCTD duyệt", "Danh sách khớp"),
            ("2", "Gắn / skip", "Quyền + lý do nếu skip", "Pipeline cập nhật"),
            ("Thành công", "—", "—", "Có vết quét; sẵn sàng nhận hồ sơ ngoài nếu cần"),
        ],
    },
    "UC-BP-REC-05": {
        "title": "Lịch sử trạng thái ứng viên gắn yêu cầu tuyển",
        "actors": "Nhân sự tuyển dụng · Người phỏng vấn · Hệ thống",
        "prio": "Cao — MVP",
        "pre": "Ứng viên đã gắn ít nhất một YCTD",
        "post": "Mọi đổi trạng thái có thời điểm, người thực hiện, lý do khi từ chối",
        "br": "BR-BP-CV-02",
        "purpose": "Theo dõi pipeline ứng viên trên từng YCTD (đã nhận CV → PV → offer…) với lịch sử đầy đủ.",
        "inputs": [
            ("Ứng viên · YCTD", "Có", "Liên kết N–N"),
            ("Trạng thái mới", "Có", "Theo danh mục pipeline đơn vị"),
            ("Ghi chú / lý do", "Khi từ chối", "Bắt buộc"),
        ],
        "flow": [
            "Mở hồ sơ ứng viên theo YCTD.",
            "Đổi trạng thái pipeline; hệ thống ghi lịch sử.",
            "Lịch phỏng vấn và đánh giá nằm trong cùng pipeline — không menu chiến dịch tách.",
            "Xem timeline theo YCTD hoặc theo ứng viên.",
        ],
        "rules": [
            "Không xóa lịch sử khi đóng YCTD.",
            "Cùng ứng viên trên nhiều YCTD: trạng thái theo từng liên kết.",
        ],
        "special": [
            ("Đổi trạng thái ngược", "Cho nếu cấu hình cho phép + audit"),
            ("Hai pháp nhân", "Không xem chéo hồ sơ"),
        ],
        "seq": ("HR", "Pipeline", "Lịch sử"),
        "dien": [
            ("1", "Đổi trạng thái", "Đúng YCTD", "Bản ghi lịch sử mới"),
            ("2", "Xem timeline", "Có quyền", "Đủ vết không mất"),
            ("Thành công", "—", "—", "Pipeline truy vết được; UC kế = thư/PV hoặc offer"),
        ],
    },
    "UC-BP-REC-06": {
        "title": "Gửi thư tuyển theo mẫu và đánh giá phỏng vấn",
        "actors": "Nhân sự tuyển dụng · Người phỏng vấn",
        "prio": "Cao — MVP",
        "pre": "Ứng viên ở bước cần mời PV hoặc đánh giá; có mẫu thư theo pháp nhân",
        "post": "Thư đã gửi (hoặc xếp hàng); đánh giá Pass/Fail lưu trên liên kết YCTD",
        "br": "BR-BP-REC-MAIL-01",
        "purpose": "Gửi thư mời theo mẫu; thu thập đánh giá phỏng vấn trong pipeline ứng viên.",
        "inputs": [
            ("Mẫu thư", "Có", "CRUD theo tenant — không hardcode nội dung"),
            ("Người nhận / CC người PV", "Có", "Theo cấu hình"),
            ("Kết quả đánh giá", "Khi chốt PV", "Pass / Fail + nhận xét"),
        ],
        "flow": [
            "Chọn ứng viên trên YCTD → Gửi thư theo mẫu.",
            "Hệ thống ghi đã gửi + thời điểm.",
            "Người PV nhập đánh giá Pass/Fail.",
            "Cập nhật trạng thái pipeline theo kết quả.",
        ],
        "rules": [
            "Mẫu thư và quy trình thuộc cấu hình tenant (đồng bộ từ XBOS khi có).",
            "Đánh giá gắn đúng liên kết ứng viên–YCTD.",
        ],
        "special": [
            ("Gửi thất bại", "Giữ bản nháp; báo lỗi; không đổi trạng thái giả"),
            ("Nhiều vòng PV", "Mỗi vòng một bản đánh giá"),
        ],
        "seq": ("HR", "Thư mẫu", "Người PV"),
        "dien": [
            ("1", "Gửi thư", "Mẫu hiệu lực", "Đã gửi + log"),
            ("2", "Nhập đánh giá", "Đúng vòng PV", "Pass/Fail lưu"),
            ("Thành công", "—", "—", "Pipeline cập nhật; sẵn sàng offer hoặc loại"),
        ],
    },
    "UC-BP-REC-07": {
        "title": "Chấp nhận đề nghị nhận việc → tạo hồ sơ nhân sự",
        "actors": "Nhân sự tuyển dụng · HCNS · Ứng viên (xác nhận)",
        "prio": "Cao — MVP",
        "pre": "Offer đã được chấp nhận trên YCTD",
        "post": "Hồ sơ nhân sự mới ở trạng thái chờ hoàn thiện; không nhập lại field đã có từ tuyển",
        "br": "BR-BP-ONB-01",
        "purpose": "Từ offer chấp nhận tạo hồ sơ nhân sự, mang sang thông tin đã thu thập.",
        "inputs": [
            ("Offer đã accept", "Có", "Trên đúng YCTD"),
            ("Pháp nhân / bộ phận / vị trí", "Có", "Từ YCTD + offer"),
            ("Ngày dự kiến vào", "Có", "dd/MM/yyyy"),
        ],
        "flow": [
            "Xác nhận chấp nhận offer.",
            "Hệ thống tạo hồ sơ nhân sự, điền sẵn field từ ứng viên/YCTD.",
            "HCNS bổ sung phần còn thiếu (không bắt nhập lại phần đã có).",
            "Chuyển sang checklist giấy tờ (UC CORE-03).",
        ],
        "rules": [
            "Cấm tạo hồ sơ trùng khi cùng offer đã tạo.",
            "Tuyển không gọi thẳng sang lương.",
        ],
        "special": [
            ("Offer hủy sau accept", "Không tạo hồ sơ mới; đánh dấu hủy có lý do"),
            ("Thiếu field bắt buộc hồ sơ", "Tạo ở trạng thái chờ; chặn Hoạt động đến khi đủ"),
        ],
        "seq": ("HR", "Offer", "Hồ sơ NS"),
        "dien": [
            ("1", "Accept offer", "Offer hợp lệ", "Tín hiệu onboard"),
            ("2", "Tạo hồ sơ", "Không trùng", "Hồ sơ chờ + field mang sang"),
            ("Thành công", "—", "—", "Sẵn sàng checklist; UC kế = CORE-03/07"),
        ],
    },
    "UC-BP-CORE-02b": {
        "title": "Cấu hình nhóm thông tin trên hồ sơ",
        "actors": "HCNS · Quản trị danh mục (XBOS/HRM)",
        "prio": "Cao — MVP",
        "pre": "Danh mục gốc từ XBOS đã đồng bộ (nếu có); quyền cấu hình tenant",
        "post": "Nhóm field hồ sơ hiệu lực theo pháp nhân; HR có thể bổ sung và đồng bộ về XBOS theo chính sách",
        "br": "BR-BP-MD-01",
        "purpose": "CRUD cấu hình nhóm/trường hồ sơ theo tenant — XBOS là gốc danh mục; HRM bổ sung đặc thù và đồng bộ ngược.",
        "inputs": [
            ("Nhóm field · mã · nhãn", "Có", "Theo pháp nhân"),
            ("Bắt buộc / tùy chọn · vòng công khai hay C&B", "Có", "Không lộ C&B ra vòng công khai"),
            ("Thứ tự hiển thị", "Có", "CRUD — không hardcode"),
        ],
        "flow": [
            "Mở cấu hình hồ sơ theo pháp nhân.",
            "Thêm / sửa / ngừng nhóm và field.",
            "Lưu hiệu lực; hồ sơ mới/đang mở áp dụng theo phiên bản cấu hình.",
            "Đồng bộ về XBOS khi tenant bổ sung đặc thù (theo quy tắc hybrid).",
        ],
        "rules": [
            "Mọi cấu hình = CRUD theo tenant; cấm hardcode bộ field cố định cho mọi công ty.",
            "Field vòng C&B không hiện trên hồ sơ công khai.",
        ],
        "special": [
            ("Xóa field đang có dữ liệu", "Chỉ ngừng dùng; không xóa cứng dữ liệu"),
            ("Xung đột với catalog XBOS", "Ưu tiên quy tắc đồng bộ đã cấu hình; báo lệch"),
        ],
        "seq": ("Admin", "Cấu hình HS", "Hồ sơ"),
        "dien": [
            ("1", "CRUD nhóm/field", "Có quyền", "Bản cấu hình nháp/hiệu lực"),
            ("2", "Áp dụng", "Phiên bản hiệu lực", "Form hồ sơ đúng nhóm"),
            ("Thành công", "—", "—", "Metadata theo tenant; sẵn sàng nhập hồ sơ"),
        ],
    },
    "UC-BP-CORE-03": {
        "title": "Danh mục giấy tờ động (bắt buộc / tùy chọn)",
        "actors": "HCNS · Nhân viên (nộp)",
        "prio": "Cao — MVP",
        "pre": "Có hồ sơ nhân sự; checklist theo vị trí/loại HĐ đã cấu hình",
        "post": "Trạng thái đủ/thiếu giấy tờ cập nhật; chặn Hoạt động nếu thiếu bắt buộc",
        "br": "BR-BP-DOC-01",
        "purpose": "Checklist giấy tờ cấu hình theo tenant — bắt buộc/tùy chọn; theo dõi nộp và xác nhận.",
        "inputs": [
            ("Mục giấy tờ", "Có", "CRUD danh mục theo tenant"),
            ("Bắt buộc?", "Có", "Theo vị trí / loại hợp đồng"),
            ("Tệp đính kèm · ngày hết hạn", "Khi nộp", "Định dạng cho phép"),
        ],
        "flow": [
            "HCNS mở checklist trên hồ sơ.",
            "Nhân viên / HCNS nộp từng mục.",
            "HCNS xác nhận hợp lệ hoặc yêu cầu nộp lại.",
            "Khi đủ bắt buộc → mở điều kiện kích hoạt Hoạt động (CORE-07).",
        ],
        "rules": [
            "Thiếu mục bắt buộc → không chuyển Hoạt động.",
            "OCR tự điền (CORE-04) ngoài phạm vi MVP.",
        ],
        "special": [
            ("Giấy tờ hết hạn", "Cảnh báo; có thể cấu hình chặn hoặc cho gia hạn"),
            ("Đổi checklist giữa chừng", "Mục mới bắt buộc áp cho hồ sơ chưa Hoạt động"),
        ],
        "seq": ("NV", "Checklist", "HCNS"),
        "dien": [
            ("1", "Nộp giấy tờ", "Đúng mục", "Trạng thái đã nộp"),
            ("2", "Xác nhận", "Hợp lệ", "Đủ / thiếu cập nhật"),
            ("Thành công", "—", "—", "Đủ điều kiện CORE-07 khi hết thiếu bắt buộc"),
        ],
    },
    "UC-BP-CORE-05": {
        "title": "Cấp phát tài sản và biên bản bàn giao",
        "actors": "HCNS · Nhân viên · Quản lý tài sản",
        "prio": "Cao — MVP (CRUD)",
        "pre": "Hồ sơ đã có; danh mục tài sản / mã serial theo tenant",
        "post": "Bản ghi cấp phát + biên bản; tài sản gắn nhân viên",
        "br": "BR-BP-AST-01",
        "purpose": "CRUD cấp phát tài sản kèm biên bản bàn giao trong giai đoạn MVP.",
        "inputs": [
            ("Mã / serial · loại tài sản", "Có", "Theo danh mục"),
            ("Ngày bàn giao · người nhận", "Có", "dd/MM/yyyy"),
            ("Biên bản (ký nội bộ)", "Có", "Theo cấu hình"),
        ],
        "flow": [
            "Chọn nhân viên → thêm tài sản cấp phát.",
            "Nhập mã/serial, ngày, ghi chú.",
            "Lưu biên bản bàn giao.",
            "Danh sách tài sản đang giữ cập nhật trên hồ sơ.",
        ],
        "rules": [
            "MVP = CRUD mã/serial + biên bản + thu hồi khi nghỉ (CORE-06).",
            "Không bắt module tài sản kế toán đầy đủ trong MVP.",
        ],
        "special": [
            ("Serial trùng đang cấp", "Chặn hoặc cảnh báo theo cấu hình"),
            ("Cấp khi hồ sơ chưa Hoạt động", "Cho nếu chính sách cho phép"),
        ],
        "seq": ("HCNS", "Tài sản", "NV"),
        "dien": [
            ("1", "Tạo cấp phát", "Serial hợp lệ", "Bản ghi + BB"),
            ("2", "Xác nhận nhận", "Có chữ ký/xác nhận", "Tài sản đang giữ"),
            ("Thành công", "—", "—", "Có vết cấp phát; UC kế thu hồi khi nghỉ"),
        ],
    },
    "UC-BP-CORE-06": {
        "title": "Thu hồi tài sản khi nghỉ việc",
        "actors": "HCNS · Nhân viên · Quản lý tài sản",
        "prio": "Cao — MVP",
        "pre": "Đã có lệnh nghỉ việc hoặc checklist nghỉ; còn tài sản đang giữ",
        "post": "Tài sản thu hồi đủ hoặc ghi nợ/mất có lý do; mở điều kiện tất toán",
        "br": "BR-BP-AST-02",
        "purpose": "Checklist thu hồi tài sản khi kích hoạt nghỉ việc — không bỏ sót serial.",
        "inputs": [
            ("Danh sách tài sản đang giữ", "Hệ thống", "Từ CORE-05"),
            ("Trạng thái thu hồi", "Có", "Đã thu / mất / thỏa thuận"),
            ("Ngày thu hồi", "Có", "dd/MM/yyyy"),
        ],
        "flow": [
            "Mở checklist thu hồi từ lệnh nghỉ.",
            "Xác nhận từng tài sản đã thu hoặc ghi ngoại lệ.",
            "Đủ điều kiện → đánh dấu thu hồi xong.",
            "PAY-07 đọc tín hiệu thu hồi khi tất toán.",
        ],
        "rules": [
            "Chưa thu hồi đủ (theo cấu hình bắt buộc) → cảnh báo / chặn tất toán.",
            "Giữ lịch sử cấp–thu; không xóa cứng.",
        ],
        "special": [
            ("Tài sản mất", "Ghi lý do + giá trị bồi thường nếu cấu hình"),
            ("Nghỉ ngay trong ngày", "Cho thu hồi một phần + theo dõi phần còn"),
        ],
        "seq": ("HCNS", "Checklist thu hồi", "PAY"),
        "dien": [
            ("1", "Rà soát tài sản", "Có lệnh nghỉ", "Checklist"),
            ("2", "Xác nhận thu", "Đủ mục bắt buộc", "Cờ thu hồi xong"),
            ("Thành công", "—", "—", "Sẵn sàng tất toán kỳ cuối"),
        ],
    },
    "UC-BP-CORE-07": {
        "title": "Chuyển hồ sơ sang Hoạt động khi đủ giấy tờ",
        "actors": "HCNS · Hệ thống",
        "prio": "Cao — MVP",
        "pre": "Checklist bắt buộc đủ; dữ liệu C&B tối thiểu theo cấu hình",
        "post": "Trạng thái Hoạt động; mở quỹ phép và ca mặc định (ATT-12)",
        "br": "BR-BP-LC-01",
        "purpose": "Kích hoạt hồ sơ Hoạt động chỉ khi đủ điều kiện giấy tờ và cấu hình.",
        "inputs": [
            ("Ngày hiệu lực Hoạt động", "Có", "dd/MM/yyyy"),
            ("Xác nhận checklist", "Hệ thống", "CORE-03 đủ bắt buộc"),
        ],
        "flow": [
            "HCNS kiểm tra đủ điều kiện.",
            "Bấm kích hoạt Hoạt động + ngày hiệu lực.",
            "Hệ thống đổi trạng thái; phát sự kiện mở phép/ca (ATT-12).",
            "Chặn chấm công lương thường nếu còn chờ (theo cấu hình).",
        ],
        "rules": [
            "Thiếu giấy tờ bắt buộc → chặn kích hoạt.",
            "Hoạt động cuối tháng: cấp phép nửa tháng theo ATT-04.",
        ],
        "special": [
            ("Kích hoạt nhầm", "Đảo trạng thái chỉ với quyền + audit; không xóa quỹ đã cấp im lặng"),
        ],
        "seq": ("HCNS", "Hồ sơ", "ATT"),
        "dien": [
            ("1", "Kiểm tra đủ", "Checklist OK", "Nút kích hoạt mở"),
            ("2", "Kích hoạt", "Ngày hợp lệ", "Hoạt động + tín hiệu ATT-12"),
            ("Thành công", "—", "—", "NV sẵn sàng chấm/phép"),
        ],
    },
    "UC-BP-CORE-09": {
        "title": "Hợp đồng lao động — mẫu in điền sẵn thông tin",
        "actors": "HCNS · C&B",
        "prio": "Cao — MVP",
        "pre": "Có hồ sơ; mẫu hợp đồng theo tenant; dữ liệu C&B cần thiết",
        "post": "Bản hợp đồng đã điền từ hồ sơ/C&B; có phiên bản lưu",
        "br": "BR-BP-CTR-01",
        "purpose": "Sinh hợp đồng từ mẫu (điền từ khóa) — không nhập lại thông tin đã có trên hồ sơ.",
        "inputs": [
            ("Mẫu HĐ", "Có", "CRUD mẫu theo tenant"),
            ("Ngày hiệu lực · loại HĐ", "Có", "Từ phụ lục / form"),
            ("Field điền sẵn", "Hệ thống", "Từ hồ sơ công khai + vòng C&B đủ quyền"),
        ],
        "flow": [
            "Chọn mẫu và loại hợp đồng.",
            "Xem trước bản điền sẵn; sửa field cho phép.",
            "Lưu phiên bản / xuất bản in.",
            "Gắn vào hồ sơ; cập nhật hiệu lực C&B nếu có.",
        ],
        "rules": [
            "Mẫu và từ khóa = cấu hình tenant — không hardcode một mẫu cho mọi công ty.",
            "Lương/MST chỉ hiện với đủ quyền C&B.",
        ],
        "special": [
            ("Thiếu field bắt buộc mẫu", "Chặn xuất; liệt kê field thiếu"),
            ("Phụ lục giữa kỳ", "Tạo phiên bản mới; không ghi đè bản cũ"),
        ],
        "seq": ("HCNS", "Mẫu HĐ", "Hồ sơ"),
        "dien": [
            ("1", "Chọn mẫu", "Mẫu hiệu lực", "Bản xem trước"),
            ("2", "Lưu / xuất", "Đủ field", "Phiên bản HĐ gắn hồ sơ"),
            ("Thành công", "—", "—", "HĐ sẵn sàng; C&B cập nhật nếu cần"),
        ],
    },
    "UC-BP-CORE-10": {
        "title": "Bảo hiểm xã hội theo vòng đời (đóng / ngừng / tạm hoãn)",
        "actors": "HCNS · C&B",
        "prio": "Cao — MVP",
        "pre": "Hồ sơ Hoạt động hoặc đang xử lý nghỉ; mức đóng theo timeline",
        "post": "Trạng thái BH và mức đóng có hiệu lực theo kỳ; lịch sử giữ nguyên",
        "br": "BR-BP-SI-01",
        "purpose": "Quản lý vòng đời BHXH trong HRM: đóng, ngừng, tạm hoãn — action nghiệp vụ trên timeline.",
        "inputs": [
            ("Trạng thái BH", "Có", "Đóng / Ngừng / Tạm hoãn"),
            ("Mức đóng NV/CTY · ngày hiệu lực", "Có", "Timeline kỳ"),
            ("Căn cứ tạm hoãn", "Khi tạm hoãn", "Theo cấu hình"),
        ],
        "flow": [
            "Mở timeline BH trên hồ sơ (vòng C&B).",
            "Thêm mức mới hoặc action tạm hoãn / ngừng.",
            "Hệ thống giữ lịch sử; kỳ lương đọc mức hiệu lực.",
            "Nghỉ việc: cắt/ngừng theo PAY-07.",
        ],
        "rules": [
            "Tạm dừng / đổi mức = hành động trong HRM — không chỉ sửa tay hàng loạt im lặng.",
            "Cấu hình tham số theo tenant (CRUD).",
        ],
        "special": [
            ("Tạm hoãn không cắt đúng căn cứ", "Chặn hoặc cảnh báo theo rule"),
            ("Đổi mức giữa kỳ", "Áp theo ngày hiệu lực trên kỳ mở"),
        ],
        "seq": ("C&B", "Timeline BH", "PAY"),
        "dien": [
            ("1", "Ghi action BH", "Có quyền C&B", "Dòng timeline mới"),
            ("2", "Kỳ lương đọc", "Ngày hiệu lực", "Mức đúng kỳ"),
            ("Thành công", "—", "—", "Lịch sử BH đầy đủ; sẵn sàng tính lương"),
        ],
    },
    "UC-BP-ATT-01": {
        "title": "Thiết lập quy tắc ca theo bộ phận / nhóm",
        "actors": "Nhân sự chấm công · Quản lý bộ phận",
        "prio": "Cao — MVP",
        "pre": "Danh mục ca / lịch từ XBOS hoặc bổ sung tenant",
        "post": "Mỗi bộ phận/nhóm có ca và lịch phân ca hiệu lực; phạt/giờ bám ca đang gán",
        "br": "BR-BP-SHF-01",
        "purpose": "CRUD quy tắc ca theo bộ phận — không một rule cứng cả công ty.",
        "inputs": [
            ("Bộ phận / nhóm", "Có", "Đúng pháp nhân"),
            ("Giờ vào/ra · ân hạn · hệ số công", "Có", "Theo ca"),
            ("Lịch phân ca tuần/tháng", "Có", "CRUD"),
        ],
        "flow": [
            "Chọn bộ phận → mở quy tắc ca.",
            "Nhập giờ, ân hạn, hệ số; gán lịch phân ca.",
            "Lưu hiệu lực.",
            "Điểm danh và phạt đọc ca đang gán thực tế.",
        ],
        "rules": [
            "Công tính theo ca đang gán — không rule chung ghi đè mọi đơn vị.",
            "Kiêm nhiệm: rule theo đơn vị đang chấm.",
        ],
        "special": [
            ("Đổi ca giữa kỳ", "Bản ghi chấm trước giữ ca cũ; sau ngày hiệu lực dùng ca mới"),
        ],
        "seq": ("HR CC", "Quy tắc ca", "Điểm danh"),
        "dien": [
            ("1", "Cấu hình ca", "Có quyền", "Ca hiệu lực theo bộ phận"),
            ("2", "Chấm / phạt", "Ca đang gán", "Giờ/phạt đúng rule A/B"),
            ("Thành công", "—", "—", "Sẵn sàng điểm danh theo ca"),
        ],
    },
    "UC-BP-ATT-03b": {
        "title": "Lịch lễ / Tết (dương và âm cấu hình theo năm)",
        "actors": "HCNS · Quản trị XBOS (giai đoạn đầu) · HR tenant (vận hành)",
        "prio": "Cao — MVP",
        "pre": "Năm lịch cần cấu hình; quyền sửa lịch pháp nhân",
        "post": "Bộ lịch năm hiệu lực dùng chung cho phép và bảng công",
        "br": "BR-BP-HOL-01",
        "purpose": "CRUD lịch nghỉ lễ dương + ngày âm theo năm/pháp nhân — XBOS khai đầu, tenant tự cập nhật đặc thù.",
        "inputs": [
            ("Năm lịch", "Có", "Theo pháp nhân"),
            ("Ngày lễ dương / âm", "Có", "CRUD — không hardcode cố định mọi tenant"),
            ("Loại ngày (nghỉ / trực…)", "Có", "Theo cấu hình"),
        ],
        "flow": [
            "Mở lịch năm (HRM và/hoặc sau đồng bộ XBOS).",
            "Thêm/sửa ngày lễ dương và âm.",
            "Phát hành phiên bản lịch.",
            "Phép và bảng công đọc cùng lịch hiệu lực.",
        ],
        "rules": [
            "Cấm chỉ cố định cứng dương lịch quốc gia không cho cấu hình âm/tenant.",
            "Đổi lịch giữa năm: đơn chưa duyệt tính lại theo phiên bản mới.",
        ],
        "special": [
            ("Hai công ty lịch khác nhau", "Mỗi tenant bộ lịch riêng"),
        ],
        "seq": ("Admin", "Lịch năm", "Phép/Công"),
        "dien": [
            ("1", "CRUD lịch", "Đúng năm/pháp nhân", "Bản nháp/hiệu lực"),
            ("2", "Phép/công đọc", "Phiên bản hiệu lực", "Ngày làm đúng lịch"),
            ("Thành công", "—", "—", "Một nguồn lịch cho trừ phép và bảng công"),
        ],
    },
    "UC-BP-ATT-04": {
        "title": "Cấp phát phép năm theo thành phần cấu hình",
        "actors": "HCNS · C&B · Hệ thống cấp quỹ",
        "prio": "Cao — MVP",
        "pre": "Đã cấu hình năm tài chính phép, đơn vị ngày/giờ, thành phần cấp theo tenant (CRUD)",
        "post": "Số dư các loại phép cập nhật theo chính sách; có dòng thành phần tách",
        "br": "BR-BP-LV-01 · BR-BP-LV-TYPE-01",
        "purpose": "Cấp quỹ phép theo năm tài chính cấu hình được — năm · thâm niên · bù OT · chuyển kỳ · ứng phép; cấm hardcode tháng FY cố định.",
        "inputs": [
            ("Năm tài chính phép (tháng bắt đầu)", "Có", "CRUD theo tenant — mỗi công ty khác nhau"),
            ("Thành phần cấp (tháng / thâm niên / chức vụ…)", "Có", "CRUD — học hỏi tham số thị trường, không khóa một số cứng"),
            ("Đơn vị trừ (ngày / giờ) theo loại", "Có", "Cả hai theo loại phép"),
        ],
        "flow": [
            "Mở menu cấu hình phép theo pháp nhân (năm FY, thành phần, loại phép).",
            "Lưu chính sách; chạy cấp quỹ theo chu kỳ đã cấu hình.",
            "Xem số dư tách theo loại phép.",
            "Nộp đơn (ATT-09) trừ đúng loại.",
        ],
        "rules": [
            "Năm tài chính và mọi tham số cấp = CRUD theo tenant — cấm fix tháng bắt đầu chung.",
            "Tối thiểu 5 loại: phép năm · thâm niên · bù OT · chuyển kỳ · ứng phép.",
            "Phải có quỹ theo chính sách trước khi dùng (thời điểm cấp cấu hình được).",
        ],
        "special": [
            ("Đổi phương thức giữa năm", "Chốt chuyển số dư theo quy tắc đã cấu hình"),
            ("Nửa tháng vào/nghỉ", "Cấp gốc theo cấu hình (ví dụ 0,5 ngày)"),
        ],
        "seq": ("HCNS", "Cấu hình phép", "Quỹ NV"),
        "dien": [
            ("1", "CRUD chính sách FY/cấp", "Có quyền", "Chính sách hiệu lực"),
            ("2", "Cấp quỹ", "Theo chu kỳ cấu hình", "Số dư tách loại"),
            ("Thành công", "—", "—", "Sẵn sàng nộp đơn; panel quỹ ATT-05b"),
        ],
    },
    "UC-BP-ATT-04b": {
        "title": "Ứng phép và nghỉ không lương rồi bù trừ",
        "actors": "Nhân viên · Quản lý · HCNS",
        "prio": "Cao — MVP",
        "pre": "Loại ứng phép bật; trần và quy tắc trừ kỳ sau đã cấu hình (CRUD)",
        "post": "Đơn ứng hoặc không lương ghi đúng quỹ; bù trừ khi có quỹ mới theo cấu hình",
        "br": "BR-BP-LV-07",
        "purpose": "Cho ứng phép trong trần cấu hình; hết phép có thể nghỉ không lương rồi bù trừ — mọi tham số CRUD theo tenant.",
        "inputs": [
            ("Trần ứng (% quỹ / số ngày)", "Có", "CRUD — không hardcode"),
            ("Cách trừ kỳ sau", "Có", "Cấu hình được (trừ ngay quỹ tương lai hoặc khi cấp năm mới)"),
            ("Loại nghỉ không lương", "Khi hết phép", "Tách loại + vẫn check còn phép"),
        ],
        "flow": [
            "Cấu hình trần ứng và cách trừ.",
            "NV nộp đơn vượt số dư → hệ thống đề xuất ứng hoặc không lương theo rule.",
            "Duyệt đặc biệt nếu cấu hình yêu cầu.",
            "Khi cấp quỹ mới: bù trừ theo cấu hình.",
        ],
        "rules": [
            "Tắt ứng → chặn đơn vượt số dư.",
            "Hết phép → nghỉ không lương (có cấu hình); vẫn kiểm tra còn phép trước.",
        ],
        "special": [
            ("Vượt trần ứng", "Chặn"),
            ("Cấp 6 tháng/lần", "Đơn giữa kỳ chỉ dùng số đã cấp"),
        ],
        "seq": ("NV", "Đơn phép", "Quỹ"),
        "dien": [
            ("1", "Nộp vượt số dư", "Ứng ON + trong trần", "Hold ứng / không lương"),
            ("2", "Bù trừ khi cấp", "Theo cấu hình", "Quỹ cập nhật"),
            ("Thành công", "—", "—", "Không âm quỹ im lặng"),
        ],
    },
    "UC-BP-ATT-05": {
        "title": "Phép chuyển kỳ (bảo lưu)",
        "actors": "HCNS · Hệ thống",
        "prio": "Cao — MVP",
        "pre": "Chính sách mang sang và mốc cắt theo năm FY tenant (CRUD)",
        "post": "Quỹ chuyển kỳ tách theo dõi; cắt đúng mốc cấu hình; nghỉ việc trả tiền theo chính sách",
        "br": "BR-BP-LV-02",
        "purpose": "Quản lý phép mang sang (chuyển kỳ) — mốc cắt và đơn giá trả gắn năm tài chính cấu hình, không hardcode 01/04 cho mọi tenant.",
        "inputs": [
            ("Số ngày mang sang", "Hệ thống", "Từ phép năm cũ còn"),
            ("Mốc cắt bảo lưu", "Có", "CRUD theo FY tenant"),
            ("Đơn giá trả khi nghỉ", "Khi nghỉ", "Lương cơ bản đóng BH theo chính sách"),
        ],
        "flow": [
            "Cuối năm FY: chuyển số còn sang quỹ chuyển kỳ (nếu bật).",
            "Trong thời hạn bảo lưu: trừ ưu tiên theo thứ tự cấu hình.",
            "Đến mốc cắt: hủy số còn theo rule.",
            "Nghỉ việc: trả tiền phép còn theo đơn giá chính sách.",
        ],
        "rules": [
            "Quỹ chuyển kỳ tách audit — không trộn im lặng vào phép năm.",
            "Mốc cắt = cấu hình theo tenant/FY — không fix một ngày lịch cho mọi công ty.",
        ],
        "special": [
            ("Dùng đồng thời phép mới và mang sang", "Thứ tự trừ theo cấu hình một nguồn gốc chuẩn"),
        ],
        "seq": ("Hệ thống", "Quỹ chuyển kỳ", "NV"),
        "dien": [
            ("1", "Mang sang", "Chính sách bật", "Quỹ chuyển kỳ"),
            ("2", "Cắt / trả tiền", "Mốc cấu hình / nghỉ việc", "Số dư hoặc chi trả đúng"),
            ("Thành công", "—", "—", "Không mất mang sang sai mốc"),
        ],
    },
    "UC-BP-ATT-06": {
        "title": "Phép nghỉ bù từ tăng ca (khi công ty bật)",
        "actors": "HCNS · Quản lý duyệt OT · Hệ thống",
        "prio": "Cao — MVP",
        "pre": "Chế độ bù OT bật; tỷ lệ giờ→ngày cấu hình; OT đã duyệt",
        "post": "Quỹ phép bù OT tăng đúng; đơn nghỉ bù trừ đúng loại",
        "br": "BR-BP-LV-03",
        "purpose": "Quy đổi tăng ca đã duyệt thành quỹ nghỉ bù khi công ty bật — không nhân hệ số lần nữa ở lương.",
        "inputs": [
            ("OT đã duyệt", "Có", "Từ bảng công / đề nghị OT"),
            ("Tỷ lệ giờ→ngày", "Có", "CRUD tenant"),
            ("Toggle chế độ bù", "Có", "Bật/tắt theo pháp nhân"),
        ],
        "flow": [
            "Duyệt OT → nếu chế độ bật, cộng quỹ bù OT.",
            "NV nộp đơn loại nghỉ bù → trừ quỹ bù.",
            "Tắt chế độ: OT chỉ vào bảng công, không cộng phép.",
        ],
        "rules": [
            "Không cộng từ OT bản nháp.",
            "PAY không nhân hệ số OT lần nữa khi đã quy đổi phép.",
        ],
        "special": [
            ("Tắt chế độ giữa năm", "Ngừng cộng mới; quỹ đã có vẫn dùng đến hết hạn cấu hình"),
        ],
        "seq": ("QL", "OT", "Quỹ bù"),
        "dien": [
            ("1", "Duyệt OT", "Chế độ ON", "Cộng quỹ bù"),
            ("2", "Đơn nghỉ bù", "Đủ quỹ", "Trừ đúng loại"),
            ("Thành công", "—", "—", "Không double convert OT"),
        ],
    },
    "UC-BP-ATT-07": {
        "title": "Nghỉ ốm — bảo hiểm hoặc công ty hỗ trợ",
        "actors": "Nhân viên · Quản lý · HCNS",
        "prio": "Cao — MVP",
        "pre": "Chính sách nhánh BH / hỗ trợ CTY / không lương và thứ tự trừ đã cấu hình",
        "post": "Mỗi ngày nghỉ gắn đúng một nhánh theo thứ tự cấu hình; công/lương khớp",
        "br": "BR-BP-LV-04",
        "purpose": "Xử lý nghỉ ốm theo chuỗi quỹ cấu hình được (phép · BH · CTY · không lương) — cấm trừ kép không rule.",
        "inputs": [
            ("Loại đơn nghỉ ốm", "Có", "Theo danh mục"),
            ("Thứ tự trừ quỹ", "Có", "Cấu hình thứ tự — CRUD tenant"),
            ("Chứng từ BH (nếu cần)", "Theo rule", "Checklist"),
        ],
        "flow": [
            "NV nộp đơn ốm.",
            "Hệ thống áp thứ tự trừ đã cấu hình.",
            "Hết nhánh BH → sang hỗ trợ CTY hoặc không lương.",
            "Bảng công nhận đúng mã ngày.",
        ],
        "rules": [
            "Thứ tự trừ = cấu hình được (không khóa một chuỗi cứng cho mọi tenant).",
            "Cấm vừa BH vừa hỗ trợ CTY 100% cùng ngày không rule.",
        ],
        "special": [
            ("Vượt ngày BH", "Nhánh CTY hoặc không lương theo cấu hình"),
            ("Còn phép năm", "Có thể trừ phép trước nếu cấu hình đặt vậy"),
        ],
        "seq": ("NV", "Đơn ốm", "Bảng công"),
        "dien": [
            ("1", "Nộp đơn ốm", "Đủ chứng từ nếu bắt buộc", "Hold theo nhánh"),
            ("2", "Áp thứ tự quỹ", "Cấu hình tenant", "Công/lương đúng nhánh"),
            ("Thành công", "—", "—", "Không trừ kép; sẵn sàng chốt công"),
        ],
    },
    "UC-BP-ATT-12": {
        "title": "Mở quỹ phép và ca mặc định khi hồ sơ Hoạt động",
        "actors": "Hệ thống · HCNS (rà soát)",
        "prio": "Cao — MVP",
        "pre": "Hồ sơ vừa chuyển Hoạt động (CORE-07); chính sách cấp và ca mặc định đã cấu hình",
        "post": "Có số dư khởi tạo theo loại phép + ca mặc định — không bắt gán tay mới đi làm",
        "br": "BR-BP-LC-03",
        "purpose": "Tự mở quỹ phép và map ca khi kích hoạt Hoạt động.",
        "inputs": [
            ("Ngày Hoạt động", "Có", "Từ CORE-07"),
            ("Chính sách cấp / ca mặc định bộ phận", "Có", "ATT-04 · ATT-01"),
        ],
        "flow": [
            "Nhận sự kiện Hoạt động.",
            "Cấp quỹ theo chính sách (kể cả nửa tháng).",
            "Gán ca mặc định bộ phận.",
            "HCNS xem xác nhận trên hồ sơ.",
        ],
        "rules": [
            "Không bắt gán tay mới được chấm ngày đầu (trừ khi cấu hình tắt tự động).",
        ],
        "special": [
            ("Hoạt động cuối tháng", "Cấp dần nửa tháng theo cấu hình"),
        ],
        "seq": ("CORE", "Hệ thống", "ATT"),
        "dien": [
            ("1", "Sự kiện Hoạt động", "CORE-07 OK", "Job mở quỹ/ca"),
            ("2", "Gán ca + số dư", "Chính sách", "NV chấm được"),
            ("Thành công", "—", "—", "Sẵn sàng điểm danh / đơn phép"),
        ],
    },
    "UC-BP-PAY-03": {
        "title": "Giảm trừ gia cảnh từ hồ sơ (đủ quyền)",
        "actors": "C&B · Hệ thống tính lương",
        "prio": "Cao — MVP",
        "pre": "Hồ sơ có người phụ thuộc / GTCG; người chạy lương đủ quyền C&B",
        "post": "Kỳ mở dùng mức GTCG mới; không nhập tay trùng trên bảng lương",
        "br": "BR-BP-PAY-02",
        "purpose": "Lấy giảm trừ gia cảnh từ hồ sơ đủ quyền — một nguồn cho thuế.",
        "inputs": [
            ("Người phụ thuộc · mức GTCG", "Có", "Từ hồ sơ C&B"),
            ("Ngày hiệu lực thay đổi", "Khi đổi", "dd/MM/yyyy"),
        ],
        "flow": [
            "Cập nhật người phụ thuộc trên hồ sơ.",
            "Chạy lương kỳ mở đọc mức hiệu lực.",
            "Không cho nhập GTCG trùng trên màn lương.",
        ],
        "rules": [
            "Đổi hợp lệ → kỳ mở dùng mức mới.",
            "Split-month: GTCG tính một lần trên tổng hợp (PAY-04).",
        ],
        "special": [
            ("Con đủ tuổi giữa năm", "Cắt giảm trừ từ ngày hiệu lực"),
        ],
        "seq": ("C&B", "Hồ sơ", "Tính lương"),
        "dien": [
            ("1", "Cập nhật NPT", "Đủ quyền", "Mức mới"),
            ("2", "Tính lương", "Kỳ mở", "GTCG đúng nguồn hồ sơ"),
            ("Thành công", "—", "—", "Không double nguồn GTCG"),
        ],
    },
    "UC-BP-PAY-05": {
        "title": "Trần bảo hiểm trên tổng hợp kỳ",
        "actors": "C&B · Hệ thống tính lương",
        "prio": "Cao — MVP",
        "pre": "Có tổng thu nhập hợp nhất kỳ (kể cả split-month); trần BH cấu hình",
        "post": "Trần áp một lần trên kỳ — không nhân đôi từng đoạn",
        "br": "BR-BP-SPL-02",
        "purpose": "Áp trần bảo hiểm trên tổng hợp kỳ, kể cả khi gộp giữa tháng.",
        "inputs": [
            ("Tổng thu nhập hợp nhất kỳ", "Hệ thống", "Sau gộp đoạn nếu có"),
            ("Mức trần BH", "Có", "Theo cấu hình / pháp luật + tenant"),
        ],
        "flow": [
            "Tính thu nhập các đoạn (nếu split).",
            "Gộp biến cộng dồn.",
            "Áp trần BH một lần trên tổng.",
        ],
        "rules": [
            "Cấm mỗi đoạn tự áp trần rồi cộng.",
        ],
        "special": [
            ("Vào giữa tháng", "Tỷ lệ ngày + trần theo quy tắc đã cấu hình"),
        ],
        "seq": ("PAY", "Gộp kỳ", "BH"),
        "dien": [
            ("1", "Gộp thu nhập", "Có split hoặc không", "Tổng kỳ"),
            ("2", "Áp trần", "Một lần", "Mức BH đúng"),
            ("Thành công", "—", "—", "Không áp trần hai lần"),
        ],
    },
    "UC-BP-PAY-06": {
        "title": "Tính lương kỳ khi đã Hoạt động và bảng công chốt",
        "actors": "C&B · Hệ thống",
        "prio": "Cao — MVP",
        "pre": "Bảng công kỳ đã chốt; NV Hoạt động trong kỳ; công thức đã phát hành",
        "post": "Phiếu lương kỳ (nháp/chính thức) theo công thức + SoT bảng công",
        "br": "BR-BP-LC-04 · BR-BP-TS-03",
        "purpose": "Chạy tính lương kỳ chỉ khi bảng công đã chốt và nhân sự đủ điều kiện Hoạt động.",
        "inputs": [
            ("Kỳ lương", "Có", "Đúng pháp nhân"),
            ("Bảng công chốt", "Có", "SoT giờ — không đọc OT/phép trực tiếp"),
            ("Công thức hiệu lực", "Có", "Đã phát hành (PAY-02)"),
        ],
        "flow": [
            "Chọn kỳ → kiểm tra bảng công chốt.",
            "Nạp biến từ bảng công + C&B + KT/KL đã thi hành.",
            "Chạy công thức đã phát hành.",
            "Xem trước → khóa phiếu theo quy trình.",
        ],
        "rules": [
            "Chưa Hoạt động → không phiếu lương thường.",
            "Hai bước soạn→phát hành công thức đã khóa; SoT giờ = bảng công chốt.",
        ],
        "special": [
            ("Hire giữa tháng", "Tính tỷ lệ / split theo PAY-04"),
        ],
        "seq": ("C&B", "Bảng công chốt", "Động cơ CT"),
        "dien": [
            ("1", "Kiểm tra chốt", "BR-BP-TS-03", "Pass / từ chối"),
            ("2", "Chạy CT", "CT đã phát hành", "Phiếu nháp"),
            ("Thành công", "—", "—", "Sẵn sàng phiếu lương PAY-08"),
        ],
    },
    "UC-BP-PAY-07": {
        "title": "Tất toán nghỉ việc — BH, phép, tài sản, thưởng/phạt kỳ cuối",
        "actors": "HCNS · C&B",
        "prio": "Cao — MVP",
        "pre": "Lệnh nghỉ; checklist thu hồi; quỹ phép còn; KT/KL kỳ cuối",
        "post": "Kỳ cuối có dòng tất toán; BH cắt/ngừng; phép trả/đối trừ theo chính sách",
        "br": "BR-BP-TERM-01",
        "purpose": "Gom cắt BH, tất toán phép, thu hồi tài sản, KT/KL vào kỳ lương cuối.",
        "inputs": [
            ("Ngày nghỉ · loại nghỉ", "Có", "Tự nguyện / buộc thôi việc"),
            ("Tín hiệu thu hồi tài sản", "Có", "CORE-06"),
            ("Phép còn · đơn giá", "Hệ thống", "ATT-05 / chính sách"),
        ],
        "flow": [
            "Mở lệnh nghỉ → checklist liên quan.",
            "Cắt/ngừng BH; tính trả phép; xác nhận thu hồi.",
            "Đưa biến vào kỳ lương cuối (cần bảng công chốt nếu còn ngày công).",
            "Khóa tất toán có audit.",
        ],
        "rules": [
            "Không bỏ sót tài sản bắt buộc thu hồi theo cấu hình.",
            "Công thức tất toán nằm trong khung PAY đã phát hành — không hardcode ngoài engine.",
        ],
        "special": [
            ("Nghỉ giữa kỳ", "Tính đoạn đến ngày chịu trách nhiệm + tất toán"),
        ],
        "seq": ("HCNS", "Tất toán", "PAY"),
        "dien": [
            ("1", "Rà checklist nghỉ", "CORE-06 + BH + phép", "Đủ điều kiện"),
            ("2", "Vào kỳ cuối", "CT hiệu lực", "Dòng tất toán"),
            ("Thành công", "—", "—", "Kỳ cuối khóa được"),
        ],
    },
    "UC-BP-PAY-08": {
        "title": "Phiếu lương — xem trước, bảo mật, trạng thái thanh toán",
        "actors": "C&B · Nhân viên (xem của mình) · Kế toán (trạng thái TT)",
        "prio": "Cao — MVP",
        "pre": "Đã có kết quả tính lương kỳ",
        "post": "NV xem đúng phiếu mình; C&B xem theo quyền; trạng thái thanh toán cập nhật",
        "br": "BR-BP-SLIP-01",
        "purpose": "Phát hành phiếu lương có xem trước, phân quyền và trạng thái thanh toán.",
        "inputs": [
            ("Phiếu kỳ · NV", "Có", "Đúng pháp nhân"),
            ("Trạng thái TT", "Có", "Chưa TT / Đã TT / …"),
        ],
        "flow": [
            "C&B xem trước bảng / phiếu.",
            "Phát hành cho NV xem.",
            "Cập nhật trạng thái thanh toán.",
            "NV chỉ mở phiếu của mình.",
        ],
        "rules": [
            "Cấm NV xem phiếu người khác.",
            "Sửa sau phát hành = phiên bản / điều chỉnh có audit.",
        ],
        "special": [
            ("Điều chỉnh sau đã TT", "Tạo phiếu điều chỉnh — không xóa im lặng"),
        ],
        "seq": ("C&B", "Phiếu lương", "NV"),
        "dien": [
            ("1", "Xem trước / phát hành", "Có quyền", "Phiếu mở cho NV"),
            ("2", "Cập nhật TT", "Đúng trạng thái", "Audit"),
            ("Thành công", "—", "—", "Bảo mật đúng; trạng thái rõ"),
        ],
    },
    "UC-BP-PAY-09": {
        "title": "Phân nhóm bảng lương (văn phòng / kinh doanh / tài xế / vận hành)",
        "actors": "C&B · Ban lãnh đạo (chính sách nhóm)",
        "prio": "Cao — MVP",
        "pre": "Danh mục nhóm lương CRUD theo tenant; NV được gán nhóm",
        "post": "Chạy / lọc / báo cáo theo nhóm; công thức có thể khác nhóm nếu cấu hình",
        "br": "BR-BP-PAY-GRP-01",
        "purpose": "Phân nhóm bảng lương để áp chính sách và báo cáo theo khối nghiệp vụ.",
        "inputs": [
            ("Mã nhóm · tên", "Có", "CRUD tenant"),
            ("Gán NV / bộ phận", "Có", "Theo hiệu lực"),
        ],
        "flow": [
            "Cấu hình danh mục nhóm.",
            "Gán nhân viên hoặc rule bộ phận.",
            "Chạy lương / xuất báo cáo theo nhóm.",
        ],
        "rules": [
            "Nhóm = cấu hình — không hardcode bốn nhóm cố định nếu tenant đổi tên/bổ sung.",
        ],
        "special": [
            ("NV đổi nhóm giữa kỳ", "Theo ngày hiệu lực / split nếu ảnh hưởng công thức"),
        ],
        "seq": ("C&B", "Nhóm lương", "Báo cáo"),
        "dien": [
            ("1", "CRUD nhóm", "Có quyền", "Danh mục hiệu lực"),
            ("2", "Chạy / lọc", "NV đã gán", "Đúng nhóm"),
            ("Thành công", "—", "—", "Báo cáo phân nhóm đúng"),
        ],
    },
}

# New UCs
ATT_03D = {
    "title": "Danh mục điểm GPS chấm công (vùng hợp lệ)",
    "actors": "HCNS · Quản trị chấm công · Nhân viên (mobile)",
    "prio": "Cao — MVP (web cấu hình + mobile chấm)",
    "pre": "Pháp nhân bật chấm GPS; quyền CRUD điểm",
    "post": "Có danh sách điểm (tên, tọa độ, bán kính); mobile chỉ chấm trong vùng hợp lệ khi rule bắt buộc",
    "br": "BR-BP-GPS-01",
    "purpose": "CRUD điểm/vùng GPS để chấm công hợp lệ — cấu hình trên web; chấm thực tế ưu tiên ứng dụng di động.",
    "inputs": [
        ("Tên điểm", "Có", "Theo pháp nhân"),
        ("Vĩ độ · kinh độ · bán kính (m)", "Có", "Số hợp lệ"),
        ("Áp dụng bộ phận / ca", "Tùy", "Theo cấu hình"),
    ],
    "flow": [
        "Mở danh sách điểm GPS theo pháp nhân.",
        "Thêm/sửa điểm: tên, tọa độ, bán kính.",
        "Lưu hiệu lực.",
        "Trên mobile: chấm vào/ra kiểm tra trong vùng; ngoài vùng → từ chối hoặc giải trình theo rule.",
    ],
    "rules": [
        "MVP: cấu hình điểm trên web; chấm GPS trên mobile.",
        "Ngoài vùng: từ chối hoặc buộc giải trình — không im lặng đủ công.",
    ],
    "special": [
        ("Trùng tọa độ gần", "Cảnh báo chồng vùng"),
        ("Tắt GPS trên thiết bị", "Chặn chấm GPS; gợi ý nguồn khác nếu cấu hình cho phép"),
    ],
    "seq": ("HR CC", "Điểm GPS", "Mobile NV"),
    "dien": [
        ("1", "CRUD điểm", "Có quyền", "Điểm hiệu lực"),
        ("2", "Chấm mobile", "Trong bán kính", "Bản ghi hợp lệ / từ chối"),
        ("Thành công", "—", "—", "Vùng GPS dùng được cho chấm MVP"),
    ],
}

ATT_05B = {
    "title": "Panel quỹ phép khi nộp đơn (số dư theo loại)",
    "actors": "Nhân viên · Quản lý · HCNS",
    "prio": "Cao — MVP",
    "pre": "NV có quỹ các loại phép; đang mở form đơn nghỉ",
    "post": "Thấy số dư theo từng loại phép trước khi gửi; hold sau gửi khớp panel",
    "br": "BR-BP-LV-PANEL-01",
    "purpose": "Hiển thị panel số dư theo loại phép (năm · thâm niên · bù · chuyển kỳ · ứng…) khi nộp đơn — tránh gửi vượt quỹ.",
    "inputs": [
        ("Loại phép chọn", "Có", "Trong 5 loại cấu hình"),
        ("Số dư khả dụng · đang hold", "Hệ thống", "Theo ATT-04…07"),
        ("Số ngày/giờ xin", "Có", "Theo đơn vị loại phép"),
    ],
    "flow": [
        "Mở form đơn nghỉ.",
        "Chọn loại phép → panel hiện số dư / hold / còn lại dự kiến.",
        "Nhập khoảng nghỉ → panel cập nhật ngày trừ dự kiến (ngày làm).",
        "Gửi đơn → hold quỹ (ATT-09); panel phản ánh hold.",
    ],
    "rules": [
        "Panel chỉ đọc quỹ — không tự sửa số dư tay.",
        "Hết phép → gợi ý không lương / ứng theo cấu hình ATT-04b.",
    ],
    "special": [
        ("Đổi loại phép trên form", "Tính lại panel và hold dự kiến"),
        ("Hai đơn chồng ngày", "Chặn; panel báo xung đột"),
    ],
    "seq": ("NV", "Form đơn", "Quỹ"),
    "dien": [
        ("1", "Chọn loại phép", "Có quỹ", "Panel số dư"),
        ("2", "Gửi đơn", "Đủ số dư / ứng hợp lệ", "Hold + panel cập nhật"),
        ("Thành công", "—", "—", "NV thấy đủ quỹ trước khi gửi"),
    ],
}


def render_fr(uc: str, spec: dict[str, object], stamp: str | None = None) -> str:
    title = spec["title"]
    actors = spec["actors"]
    lines: list[str] = [f"### FR-{uc} — {title}", ""]
    if stamp:
        lines += [stamp, ""]
    lines += [
        "#### Thông tin chung",
        "",
        "| Mục | Nội dung |",
        "|-----|----------|",
        f"| Tác nhân | {actors} |",
        f"| Ưu tiên | {spec['prio']} |",
        f"| Tiên quyết | {spec['pre']} |",
        f"| Hậu điều kiện | {spec['post']} |",
        f"| Liên hệ phần mềm hiện tại | Logic giấy đã chốt; triển khai mã theo giai đoạn — không khẳng định đã nghiệm thu vận hành |",
        f"| BR | {spec['br']} |",
        "",
        f"**Mục đích:** {spec['purpose']}",
        "",
        "#### Dữ liệu đầu vào",
        "",
        "| Trường | Bắt buộc | Quy tắc |",
        "|--------|----------|---------|",
    ]
    for a, b, c in spec["inputs"]:  # type: ignore
        lines.append(f"| {a} | {b} | {c} |")
    lines += ["", "#### Luồng chính", ""]
    for i, step in enumerate(spec["flow"], 1):  # type: ignore
        lines.append(f"{i}. {step}")
    lines += ["", "#### Quy tắc nghiệp vụ", ""]
    for r in spec["rules"]:  # type: ignore
        lines.append(f"- {r}")
    lines += ["", "#### Trường hợp đặc biệt", "", "| Tình huống | Hệ thống xử lý |", "|------------|----------------|"]
    for a, b in spec["special"]:  # type: ignore
        lines.append(f"| {a} | {b} |")
    a1, a2, a3 = spec["seq"]  # type: ignore
    lines += [
        "",
        "#### Sơ đồ tương tác",
        "",
        "```mermaid",
        "sequenceDiagram",
        "  autonumber",
        f"  actor A as {a1}",
        f"  participant B as {a2}",
        f"  participant C as {a3}",
        f"  A->>B: Thực hiện thao tác nghiệp vụ",
        "  alt Không đủ điều kiện / thiếu quyền",
        "    B-->>A: Từ chối kèm lý do",
        "  else Hợp lệ",
        "    B->>C: Ghi nhận / cập nhật",
        "    C-->>A: Thành công — dữ liệu còn sau khi tải lại",
        "  end",
        "```",
        "",
        "#### Diễn biến nghiệp vụ",
        "",
        "| # | Tương tác | Điều kiện / quy tắc | Kết quả hoặc lỗi |",
        "|---|-----------|---------------------|------------------|",
    ]
    for row in spec["dien"]:  # type: ignore
        lines.append(f"| {row[0]} | {row[1]} | {row[2]} | {row[3]} |")
    lines.append("")
    return "\n".join(lines)


def extract_fr_block(text: str, uc: str) -> tuple[int, int]:
    pat = rf"^### FR-{re.escape(uc)}\b[^\n]*\n"
    m = re.search(pat, text, flags=re.M)
    if not m:
        raise KeyError(uc)
    start = m.start()
    nxt = re.search(r"^### FR-UC-BP-|^## [0-9]\.|^### 3\.A\.", text[m.end() :], flags=re.M)
    # next FR or chapter
    nxt = re.search(r"^### FR-UC-BP-", text[m.end() :], flags=re.M)
    end = m.end() + nxt.start() if nxt else len(text)
    # if next is ## 4. find it
    ch = re.search(r"^## [456]\.", text[m.end() :], flags=re.M)
    if ch and (not nxt or ch.start() < nxt.start()):
        end = m.end() + ch.start()
    return start, end


def stamp_banner(kind: str, note: str) -> str:
    if kind == "OUT":
        return f"> **Phạm vi:** **OUT** — không thuộc MVP giấy lần này. {note}"
    if kind == "GD2":
        return f"> **Phạm vi:** **GĐ2** — chưa triển khai MVP. {note}"
    return note


def upgrade_header_and_scope(text: str) -> str:
    text = text.replace(
        "| Phiên bản | **0.7** — giữ **16** FR ưu tiên đủ 7 mục (ADD/UPGRADE); khóa phạm vi bốn trụ đã họp xong (gồm tiền lương); bổ sung loại phép cấu hình; bảng công chốt = SoT giờ; **Q-PAY-FORMULA** chỉ còn cờ chốt cách lắp công thức |",
        "| Phiên bản | **0.8** — **DOC-DELTA:** Chốt theo SPONSOR_CHOT_FILL + SPONSOR_CHOT_REMAINING 2026-08-05. Giữ 16 FR ưu tiên; **EXPAND** các UC Lịch sheet 03 đủ 7 mục; ADD ATT-03d (GPS) + ATT-05b (panel quỹ); Face = mobile-only MVP; REC-03·CORE-04·ATT-03e OUT; ATT-03 GĐ2; PAY = form GĐ1 + kéo-thả GĐ2; năm FY/phép = CRUD tenant |",
        1,
    )
    text = text.replace(
        "| Inventory khóa | **45** use case — **16** FR ưu tiên đủ 7 mục; UC bổ sung khung + JD master (MVP); chiến dịch đa kênh = GĐ2 |",
        "| Inventory khóa | **47** use case — **16** FR ưu tiên + các UC EXPAND đủ 7 mục; ADD ATT-03d·ATT-05b; REC-03·CORE-04·thẻ QR OUT; ATT-03 đa nguồn = GĐ2; Face mobile MVP |",
        1,
    )
    # Scope bullets — replace "còn mở" pay / campaign
    old_out = """**Ngoài phạm vi / GĐ2 (không thuộc MVP giấy lần này):**

- **Chiến dịch tuyển dụng**, tin đăng đa kênh, hub kết nối nền tảng đăng tin (Facebook, LinkedIn, …) — chỉ mở khi đã có đối tác sẵn sàng API đồng bộ. Trước đó: trạng thái «đã đăng tin / đã có CV / đang phỏng vấn / …» gắn trên **YCTD**.
- Quản lý công việc / dự án / giao việc (module riêng ngoài hành chính nhân sự).
- Đặc tả kỹ thuật chi tiết, thiết kế bảng dữ liệu vật lý, đặc tả từng hàm tích hợp — **HOLD** sau xác nhận SRS; tạm dừng code/demo đến khi xác nhận tài liệu nghiệp vụ.
- Thay thế toàn bộ tài liệu vận hành nội bộ hiện hữu; gói này là blueprint gửi khách đánh giá.
- Khẳng định phần mềm đã nghiệm thu hay đã triển khai xong theo blueprint."""
    new_out = """**Ngoài phạm vi / GĐ2 / OUT (không thuộc MVP giấy lần này):**

- **OUT — Chiến dịch tuyển dụng / hub đa kênh** (`UC-BP-REC-03`): không làm MVP; trạng thái pipeline gắn trên **YCTD**.
- **OUT — Đọc giấy tờ tự động / OCR** (`UC-BP-CORE-04`): không MVP; nếu mở lại sau thì xem xét GĐ2.
- **OUT — Thẻ QR nhân viên** (đề xuất ATT-03e / bề mặt S15–S16): không MVP.
- **GĐ2 — Điểm danh đa nguồn đầy đủ** (`UC-BP-ATT-03`): gom App/IP/máy/GPS thành một UC đa nguồn hoàn chỉnh ở GĐ2; MVP dùng các nguồn đã chốt riêng (GPS điểm ATT-03d, Face mobile, …).
- **GĐ2 — Kéo-thả công thức lương:** GĐ1 soạn công thức bằng **biểu mẫu cấu hình** + hai bước soạn→phát hành; kéo-thả trực quan = GĐ2 (cùng engine).
- Quản lý công việc / dự án / giao việc (module riêng ngoài hành chính nhân sự).
- Đặc tả kỹ thuật chi tiết, thiết kế bảng dữ liệu vật lý, hợp đồng tích hợp — **HOLD** đến khi mở TechSpec; **demo giấy ≠ product GO**.
- Khẳng định phần mềm đã nghiệm thu hay đã triển khai xong theo blueprint."""
    text = text.replace(old_out, new_out, 1)

    # Add MVP stamps in phạm vi
    insert_after = "- **Loại phép cấu hình (tối thiểu):** phép năm · phép thâm niên · phép bù OT · phép chuyển kỳ (mang sang) · ứng phép. **Nghỉ ốm:** xét chế độ bảo hiểm + hỗ trợ thêm của công ty (nếu có) — không áp hai nhánh cùng lúc không quy tắc."
    extra = """- **Loại phép cấu hình (tối thiểu):** phép năm · phép thâm niên · phép bù OT · phép chuyển kỳ (mang sang) · ứng phép. **Nghỉ ốm:** xét chế độ bảo hiểm + hỗ trợ thêm của công ty (nếu có) — không áp hai nhánh cùng lúc không quy tắc.
- **Năm tài chính phép & mọi cấu hình liên quan:** CRUD theo từng pháp nhân — **cấm** hardcode tháng bắt đầu FY cố định cho mọi tenant.
- **Ký chốt bảng công:** bắt buộc có xác nhận nhân viên + quản lý trực tiếp + HCNS; **thứ tự / song song = quy trình cấu hình từ XBOS** đồng bộ sang HRM theo tenant.
- **Chấm khuôn mặt (Face):** **MVP chỉ trên ứng dụng di động** (cùng ưu tiên GPS / vân tay trên mobile).
- **Điểm GPS (ATT-03d) + panel quỹ phép khi nộp đơn (ATT-05b):** trong MVP giấy + triển khai.
- **Tiền lương — công thức:** đồng ý **hai bước soạn → phát hành**; GĐ1 = **biểu mẫu** lắp biến; kéo-thả = GĐ2; nguồn giờ = **chỉ bảng công đã chốt**."""
    if insert_after in text and "ATT-03d" not in text.split("### 1.3")[0]:
        text = text.replace(insert_after, extra, 1)

    # Remove "chờ chốt" for answered Q in scope line
    text = text.replace(
        "- Quyết định tham số còn mở (Q-REC-HEADCOUNT, Q-LEAVE-UNIT, Q-LEAVE-ACCRUAL, Q-PAY-FORMULA, Q-SI-SUSPEND, …) ghi «chờ chốt» trong FR liên quan — **không** đồng nghĩa chưa họp xong trụ tiền lương; không khẳng định khách đã ký.",
        "- Các quyết định Q-* / R-* từ phiếu chốt 2026-08-05 đã phản ánh vào FR (PAY 2 bước + form GĐ1; leave FY CRUD; sign XBOS; Face mobile; …). Tham số chi tiết từng tenant vẫn cấu hình trong phần mềm — **không** khẳng định khách đã ký nghiệm thu bản này; **không** khẳng định product LIVE.",
        1,
    )
    text = text.replace(
        "- **Tiền lương (đã thống nhất trên giấy):** giữ khung FR PAY hiện có; nguồn giờ công duy nhất = bảng công tổng hợp đã chốt; biến C&B (lương nền, NH, MST, mức BH theo timeline) từ hợp đồng–bảo hiểm; KT/KL có tiền → ghi nhận kỳ lương khi đã thi hành; **Q-PAY-FORMULA** chỉ là cờ chốt cách lắp công thức trên engine — không mở FR lương mới ngoài khung đã có.",
        "- **Tiền lương (đã chốt trên giấy):** hai bước soạn→phát hành; GĐ1 biểu mẫu cấu hình; kéo-thả GĐ2; nguồn giờ = bảng công chốt; biến C&B từ hợp đồng–bảo hiểm; KT/KL đã thi hành → kỳ lương.",
        1,
    )
    return text


def upgrade_pay02(text: str) -> str:
    old = """| Decision | **Q-PAY-FORMULA** — Đề xuất: engine cấu hình + dual-control publish; IT không ghi cứng công thức mỗi kỳ trên cơ sở dữ liệu thủ công thay HR |

#### Dữ liệu đầu vào

| Nhóm biến | Ví dụ | Ghi chú |
|-----------|-------|---------|
| Từ bảng công chốt | Giờ chuẩn, OT đã hệ số, phép, phạt | Bắt buộc SoT ATT |
| Từ CORE C&B | Lương CB, PC cố định / theo ngày | Version hiệu lực |
| Thuế / BH / GTCG | Mức, trần, số NPT | GTCG từ hồ sơ |
| Cờ PC | Chịu TNCN? Đóng BH? | Cấu hình |

#### Luồng chính

1. C&B mở cấu hình công thức kỳ / mẫu đơn vị.
2. Lắp biến (kéo-thả hoặc tương đương nghiệp vụ) — không sửa mã nguồn.
3. (Đề xuất) Người thứ hai duyệt publish — dual-control.
4. Chạy thử trên kỳ mẫu → publish → dùng cho lần tính chính thức.

#### Quy tắc nghiệp vụ

- BR-BP-PAY-01: Không hardcode công thức trong bản phát hành cho từng công ty thành viên.
- **Q-PAY-FORMULA:** Cờ chốt **cách lắp công thức** trên engine (kéo-thả + dual-control publish vs cấu hình thủ công ngoài engine). Trụ tiền lương đã thống nhất trên giấy (SoT bảng công chốt, C&B từ HĐ/BH, KT/KL, split-month). Chưa chốt cờ → **không** khóa đặc tả kỹ thuật sâu động cơ — **không** mang nghĩa «chưa họp lương».
- Phụ cấp cố định tháng vs theo ngày công: toggle đúng kết quả trên dữ liệu mẫu."""
    new = """| Decision | **Q-PAY-FORMULA** = Đồng ý 2 bước · **R-PAY-DD-01** = Form GĐ1 + kéo-thả GĐ2 · **Q-PAY-F-3** = chỉ bảng công chốt |

#### Dữ liệu đầu vào

| Nhóm biến | Ví dụ | Ghi chú |
|-----------|-------|---------|
| Từ bảng công chốt | Giờ chuẩn, OT đã hệ số, phép, phạt | Bắt buộc SoT ATT — không đọc OT/phép trực tiếp |
| Từ CORE C&B | Lương CB, PC cố định / theo ngày | Version hiệu lực |
| Thuế / BH / GTCG | Mức, trần, số NPT | GTCG từ hồ sơ |
| Cờ PC | Chịu TNCN? Đóng BH? | Cấu hình tenant (CRUD) |

#### Luồng chính

1. C&B mở **biểu mẫu** cấu hình công thức kỳ / mẫu đơn vị (GĐ1 — không bắt buộc kéo-thả).
2. Lắp biến trên form — không sửa mã nguồn.
3. Người có quyền **phát hành** duyệt (bước 2 — kiểm soát phát hành).
4. Chạy thử trên kỳ mẫu → phát hành → dùng cho lần tính chính thức.
5. GĐ2: cùng engine, giao diện **kéo-thả** trực quan (không đổi cách tính phía sau).

#### Quy tắc nghiệp vụ

- BR-BP-PAY-01: Không hardcode công thức trong bản phát hành cho từng công ty thành viên.
- **Đã chốt:** hai bước soạn → phát hành; GĐ1 = form authoring; kéo-thả = GĐ2; SoT giờ = bảng công đã chốt.
- Phụ cấp cố định tháng vs theo ngày công: toggle đúng kết quả trên dữ liệu mẫu."""
    if old not in text:
        # softer replace of key lines
        text = text.replace(
            "2. Lắp biến (kéo-thả hoặc tương đương nghiệp vụ) — không sửa mã nguồn.\n3. (Đề xuất) Người thứ hai duyệt publish — dual-control.\n4. Chạy thử trên kỳ mẫu → publish → dùng cho lần tính chính thức.",
            "2. Lắp biến trên **biểu mẫu** GĐ1 — không sửa mã nguồn.\n3. Người có quyền phát hành duyệt (bước 2).\n4. Chạy thử → phát hành → tính chính thức.\n5. GĐ2: kéo-thả cùng engine.",
            1,
        )
        text = text.replace(
            "- **Q-PAY-FORMULA:** Cờ chốt **cách lắp công thức** trên engine (kéo-thả + dual-control publish vs cấu hình thủ công ngoài engine). Trụ tiền lương đã thống nhất trên giấy (SoT bảng công chốt, C&B từ HĐ/BH, KT/KL, split-month). Chưa chốt cờ → **không** khóa đặc tả kỹ thuật sâu động cơ — **không** mang nghĩa «chưa họp lương».",
            "- **Q-PAY-FORMULA / R-PAY-DD-01 (đã chốt):** hai bước soạn→phát hành; **Form GĐ1 + kéo-thả GĐ2**; SoT bảng công chốt.",
            1,
        )
        text = text.replace(
            "| Decision | **Q-PAY-FORMULA** — Đề xuất: engine cấu hình + dual-control publish; IT không ghi cứng công thức mỗi kỳ trên cơ sở dữ liệu thủ công thay HR |",
            "| Decision | **Q-PAY-FORMULA** = Đồng ý 2 bước · **R-PAY-DD-01** = Form GĐ1 + kéo-thả GĐ2 · chỉ bảng công chốt |",
            1,
        )
        text = text.replace(
            "| Liên hệ phần mềm hiện tại | Có cơ cấu lương; engine kéo-thả chưa đủ |",
            "| Liên hệ phần mềm hiện tại | Có cơ cấu lương; GĐ1 ưu tiên form cấu hình — kéo-thả GĐ2 |",
            1,
        )
        text = text.replace(
            "| 2 | Publish | Dual-control (đề xuất Q-PAY-FORMULA) | Version hiệu lực |",
            "| 2 | Phát hành | Bước 2 đã chốt (Q-PAY-FORMULA) | Version hiệu lực |",
            1,
        )
        text = text.replace(
            "| Thành công | — | — | Công thức dùng được không cần deploy; cờ Q-PAY-FORMULA ghi trên biên bản chốt khách |",
            "| Thành công | — | — | Công thức form GĐ1 đã phát hành; kéo-thả để GĐ2; SoT bảng công chốt |",
            1,
        )
        return text
    return text.replace(old, new, 1)


def upgrade_att11(text: str) -> str:
    text = text.replace(
        "| Tác nhân | Nhân viên (xác nhận nếu cấu hình), HCNS / quản lý ký chốt |",
        "| Tác nhân | Nhân viên · Quản lý trực tiếp · HCNS (đủ ba bên); thứ tự theo quy trình XBOS |",
        1,
    )
    text = text.replace(
        "| Chữ ký / xác nhận các bên | Theo chính sách | Dual-sign mọi kỳ hoặc chỉ kỳ có OT — câu hỏi mở |",
        "| Chữ ký / xác nhận các bên | Có | Bắt buộc NV + quản lý trực tiếp + HR; thứ tự/song song = workflow cấu hình từ XBOS theo tenant |",
        1,
    )
    text = text.replace(
        """#### Luồng chính

1. Các bên xem bảng tổng hợp.
2. Xác nhận / ký đủ theo cấu hình.
3. Hệ thống chuyển **đã chốt**; phát tín hiệu cho lương được phép tính.
4. Hủy chốt (nếu cần): lý do + quyền → trạng thái mở lại có audit.

#### Quy tắc nghiệp vụ

- BR-BP-TS-02: Chưa đủ chữ ký bắt buộc → không mở lệnh tính lương.
- Một bên từ chối → không vào payroll.""",
        """#### Luồng chính

1. Các bên xem bảng tổng hợp.
2. Nhân viên, quản lý trực tiếp và HCNS xác nhận / ký theo **quy trình cấu hình từ XBOS** (thứ tự hoặc song song tùy tenant).
3. Hệ thống chuyển **đã chốt** chỉ khi đủ bước workflow; phát tín hiệu cho lương được phép tính.
4. Hủy chốt (nếu cần): lý do + quyền → trạng thái mở lại có audit.

#### Quy tắc nghiệp vụ

- BR-BP-TS-02: Chưa đủ chữ ký bắt buộc theo workflow → không mở lệnh tính lương.
- Một bên từ chối → không vào payroll.
- **R-SIGN-01 (đã chốt):** cấu hình workflow XBOS — không hardcode một thứ tự duy nhất cho mọi pháp nhân; vẫn bắt buộc đủ ba phía NV + QL + HR.""",
        1,
    )
    text = text.replace(
        """  NV->>TS: Xác nhận (nếu bật)
  HR->>TS: Ký chốt
  alt Thiếu chữ ký
    TS-->>HR: Chặn chốt
  else Đủ
    TS->>TS: Đánh dấu đã chốt
    TS-->>PAY: Cho phép đọc kỳ này
  end""",
        """  NV->>TS: Xác nhận (bắt buộc theo workflow)
  participant QL as Quản lý trực tiếp
  NV->>QL: (theo thứ tự XBOS)
  QL->>TS: Xác nhận
  HR->>TS: Xác nhận / ký chốt
  alt Thiếu bước workflow
    TS-->>HR: Chặn chốt
  else Đủ NV+QL+HR
    TS->>TS: Đánh dấu đã chốt
    TS-->>PAY: Cho phép đọc kỳ này
  end""",
        1,
    )
    return text


def upgrade_decisions_and_footer(text: str) -> str:
    new_table = """| ID | Nội dung | Trạng thái sau phiếu chốt 05/08/2026 |
|----|----------|-------------------------------------|
| Q-REC-HEADCOUNT | Ngoài ĐB + duyệt BOD; quy trình XBOS theo tenant | **Đã chốt** |
| Q-PAY-FORMULA | Hai bước soạn→phát hành | **Đã chốt** |
| R-PAY-DD-01 | Form GĐ1 + kéo-thả GĐ2 | **Đã chốt** (ghi đè «GĐ1 kéo-thả» phiếu FILL) |
| Q-PAY-F-3 | Chỉ bảng công chốt | **Đã chốt** |
| Q-LEAVE-UNIT | Cả hai theo loại phép | **Đã chốt** |
| Q-LEAVE-ACCRUAL / R-FY-01 | Năm tài chính + CRUD cấu hình — cấm fix tháng | **Đã chốt hướng** |
| R-SIGN-01 | Workflow ký bảng công từ XBOS (NV+QL+HR) | **Đã chốt** |
| Q-ATT-FACE / R-FACE-01 | Face MVP **mobile only** | **Đã chốt** |
| R-PROP-03d / 05b | GPS points + panel quỹ — IN MVP | **Đã chốt** |
| R-PROP-03e | Thẻ QR | **OUT** |
| R-CAMPAIGN-01 / REC-03 | Chiến dịch đa kênh | **OUT** |
| R-OCR-01 / CORE-04 | OCR giấy tờ | **OUT** (mở lại sau = GĐ2) |
| ATT-03 | Điểm danh đa nguồn | **GĐ2** |
| Q-ASSET-MODULE | CRUD MVP | **Đã chốt** |
| Q-SI-SUSPEND | Trong HRM | **Đã chốt** |
| Q-XBOT-PROFILE | Hybrid XBOS master + HRM bổ sung đồng bộ | **Đã chốt** |
| R-DEMO-01 | Demo = toàn bộ UC giấy cũ+mới | **Đã chốt** — **không** = product GO |
| R-PDF-01 | PDF luồng đủ (có thể bổ sung sau) | **Đã chốt** |"""
    text = re.sub(
        r"\| ID \| Nội dung \| Trạng thái sau họp review \|.*?\| \*\(mở\)\* \| Dual-sign.*?\|\n",
        new_table + "\n",
        text,
        count=1,
        flags=re.S,
    )
    text = text.replace(
        "| **0.7** | **2026-08-04** | CORRECTION: bốn trụ (gồm lương) đã họp xong; khóa phạm vi campaign GĐ2 · REC MVP · định biên · C&B HĐ/BH · work-mgmt OUT · pause code · bảng công→PAY; ADD loại phép + nghỉ ốm BH/CTY; Q-PAY-FORMULA = cờ engine (không «chưa họp») |",
        "| **0.7** | **2026-08-04** | CORRECTION bốn trụ đã họp xong (baseline trước phiếu chốt) |\n| **0.8** | **2026-08-05** | **DOC-DELTA chốt** SPONSOR_CHOT_FILL + SPONSOR_CHOT_REMAINING: EXPAND UC Lịch đủ 7 mục; ADD ATT-03d·ATT-05b; OUT REC-03·CORE-04·QR; GĐ2 ATT-03; PAY form GĐ1 + kéo-thả GĐ2; FY/CRUD leave; sign XBOS; Face mobile; demo ≠ product GO |",
        1,
    )
    text = re.sub(
        r"\*Hết bản SRS v0\.7[^*]+\*",
        "*Hết bản SRS v0.8 — đã chốt theo phiếu FILL + REMAINING 05/08/2026. "
        "16 FR ưu tiên giữ nguyên; các UC EXPAND đủ 7 mục; ATT-03d·ATT-05b ADD MVP; "
        "REC-03·CORE-04·thẻ QR OUT; ATT-03 GĐ2. Demo toàn bộ UC giấy **không** đồng nghĩa product GO / TechSpec đã mở. "
        "Tài liệu **không** khẳng định khách đã ký nghiệm thu vận hành.*",
        text,
        count=1,
    )
    return text


def upgrade_toc_3a(text: str) -> str:
    old = """### 3.A. Use case bổ sung (khung nghiệp vụ — từ bảng tình huống)

Các tình huống dưới đây đã khóa mã trong inventory **44** UC. Mười sáu FR ưu tiên ở trên vẫn giữ đủ 7 mục. Phần này bổ sung đủ mục đích · tác nhân · diễn biến · quy tắc · đạt/không đạt để khách đọc và chốt khung — chưa bắt buộc đủ 7 mục kỹ thuật cho mọi UC.

| # | Mã | Tên ngắn | Module |
|---|-----|----------|--------|
| 0 | UC-BP-REC-00 | Thư viện mô tả công việc (JD master) — MVP | Tuyển dụng |
| 1 | UC-BP-REC-03 | Gom yêu cầu vào chiến dịch / hub đa kênh — **GĐ2 / ngoài MVP** | Tuyển dụng |
| 2 | UC-BP-REC-04 | Quét kho ứng viên nội bộ trước kênh ngoài | Tuyển dụng |
| 3 | UC-BP-REC-05 | Lịch sử trạng thái ứng viên (gắn YCTD; PV·đánh giá trong pipeline) | Tuyển dụng |
| 4 | UC-BP-REC-06 | Gửi thư tuyển theo mẫu và đánh giá phỏng vấn | Tuyển dụng |
| 5 | UC-BP-REC-07 | Chấp nhận đề nghị nhận việc → tạo hồ sơ nhân sự | Tuyển dụng |
| 6 | UC-BP-CORE-02b | Cấu hình nhóm thông tin trên hồ sơ | Nhân sự |
| 7 | UC-BP-CORE-03 | Danh mục giấy tờ động (bắt buộc / tùy chọn) | Nhân sự |
| 8 | UC-BP-CORE-04 | Đọc giấy tờ tự động — điền sẵn, không nhập lại | Nhân sự |
| 9 | UC-BP-CORE-05 | Cấp phát tài sản và biên bản bàn giao | Nhân sự |
| 10 | UC-BP-CORE-06 | Thu hồi tài sản khi nghỉ việc | Nhân sự |
| 11 | UC-BP-CORE-07 | Chuyển hồ sơ sang «Hoạt động» khi đủ giấy tờ | Nhân sự |
| 12 | UC-BP-CORE-09 | Hợp đồng lao động — mẫu in điền sẵn thông tin | Nhân sự |
| 13 | UC-BP-CORE-10 | Bảo hiểm xã hội theo vòng đời (đóng / ngừng / tạm hoãn) | Nhân sự |
| 14 | UC-BP-ATT-01 | Thiết lập quy tắc ca theo bộ phận / nhóm | Chấm công & Nghỉ phép |
| 15 | UC-BP-ATT-03 | Thu nhận điểm danh nhiều nguồn → giờ công thô | Chấm công & Nghỉ phép |
| 16 | UC-BP-ATT-03b | Lịch lễ / Tết (dương và âm cấu hình theo năm) | Chấm công & Nghỉ phép |
| 17 | UC-BP-ATT-04 | Cấp phát phép năm theo thành phần cấu hình | Chấm công & Nghỉ phép |
| 18 | UC-BP-ATT-04b | Ứng phép và thời điểm cấp / nghỉ không lương rồi bù trừ | Chấm công & Nghỉ phép |
| 19 | UC-BP-ATT-05 | Bảo lưu phép năm cũ đến hết quý 1 | Chấm công & Nghỉ phép |
| 20 | UC-BP-ATT-06 | Phép nghỉ bù từ tăng ca (khi công ty bật) | Chấm công & Nghỉ phép |
| 21 | UC-BP-ATT-07 | Nghỉ ốm — bảo hiểm xã hội hoặc công ty hỗ trợ đủ | Chấm công & Nghỉ phép |
| 22 | UC-BP-ATT-12 | Mở quỹ phép và ca mặc định khi hồ sơ Hoạt động | Chấm công & Nghỉ phép |
| 23 | UC-BP-PAY-03 | Giảm trừ gia cảnh từ hồ sơ (đủ quyền) | Tiền lương & Phúc lợi |
| 24 | UC-BP-PAY-05 | Trần bảo hiểm trên tổng hợp kỳ (kể cả gộp giữa tháng) | Tiền lương & Phúc lợi |
| 25 | UC-BP-PAY-06 | Tính lương kỳ khi đã Hoạt động và bảng công chốt | Tiền lương & Phúc lợi |
| 26 | UC-BP-PAY-07 | Tất toán nghỉ việc — bảo hiểm, phép, tài sản, thưởng/phạt kỳ cuối | Tiền lương & Phúc lợi |
| 27 | UC-BP-PAY-08 | Phiếu lương — xem trước, bảo mật, trạng thái thanh toán | Tiền lương & Phúc lợi |
| 28 | UC-BP-PAY-09 | Phân nhóm bảng lương (văn phòng / kinh doanh / tài xế / vận hành) | Tiền lương & Phúc lợi |"""
    new = """### 3.A. Use case bổ sung (đã EXPAND đủ 7 mục theo phiếu chốt — trừ OUT/GĐ2)

Các tình huống dưới đây khóa trong inventory **47** UC (thêm ATT-03d · ATT-05b). Mười sáu FR ưu tiên ở trên giữ nguyên. Các dòng **EXPAND** đã viết đủ 7 mục. Dòng **OUT** / **GĐ2** giữ khung + stamp phạm vi.

| # | Mã | Tên ngắn | Phạm vi |
|---|-----|----------|---------|
| 0 | UC-BP-REC-00 | Thư viện mô tả công việc (JD master) | EXPAND · MVP |
| 1 | UC-BP-REC-03 | Gom yêu cầu vào chiến dịch / hub đa kênh | **OUT** |
| 2 | UC-BP-REC-04 | Quét kho ứng viên nội bộ trước kênh ngoài | EXPAND · MVP |
| 3 | UC-BP-REC-05 | Lịch sử trạng thái ứng viên | EXPAND · MVP |
| 4 | UC-BP-REC-06 | Thư tuyển + đánh giá phỏng vấn | EXPAND · MVP |
| 5 | UC-BP-REC-07 | Offer → hồ sơ nhân sự | EXPAND · MVP |
| 6 | UC-BP-CORE-02b | Cấu hình nhóm thông tin hồ sơ | EXPAND · MVP |
| 7 | UC-BP-CORE-03 | Checklist giấy tờ động | EXPAND · MVP |
| 8 | UC-BP-CORE-04 | Đọc giấy tờ tự động (OCR) | **OUT** |
| 9 | UC-BP-CORE-05 | Cấp phát tài sản + biên bản | EXPAND · MVP |
| 10 | UC-BP-CORE-06 | Thu hồi tài sản khi nghỉ | EXPAND · MVP |
| 11 | UC-BP-CORE-07 | Kích hoạt hồ sơ Hoạt động | EXPAND · MVP |
| 12 | UC-BP-CORE-09 | Hợp đồng LĐ — mẫu điền sẵn | EXPAND · MVP |
| 13 | UC-BP-CORE-10 | BHXH vòng đời | EXPAND · MVP |
| 14 | UC-BP-ATT-01 | Quy tắc ca theo bộ phận | EXPAND · MVP |
| 15 | UC-BP-ATT-03 | Điểm danh đa nguồn | **GĐ2** |
| 16 | UC-BP-ATT-03b | Lịch lễ / Tết | EXPAND · MVP |
| 16b | UC-BP-ATT-03d | Điểm GPS chấm công | **ADD** · MVP |
| 17 | UC-BP-ATT-04 | Cấp phát phép + 5 loại | EXPAND · MVP |
| 18 | UC-BP-ATT-04b | Ứng phép / không lương | EXPAND · MVP |
| 19 | UC-BP-ATT-05 | Phép chuyển kỳ | EXPAND · MVP |
| 19b | UC-BP-ATT-05b | Panel quỹ phép khi nộp đơn | **ADD** · MVP |
| 20 | UC-BP-ATT-06 | Phép bù tăng ca | EXPAND · MVP |
| 21 | UC-BP-ATT-07 | Nghỉ ốm BH / CTY | EXPAND · MVP |
| 22 | UC-BP-ATT-12 | Mở quỹ + ca khi Hoạt động | EXPAND · MVP |
| 23 | UC-BP-PAY-03 | Giảm trừ gia cảnh | EXPAND · MVP |
| 24 | UC-BP-PAY-05 | Trần bảo hiểm kỳ | EXPAND · MVP |
| 25 | UC-BP-PAY-06 | Tính lương kỳ | EXPAND · MVP |
| 26 | UC-BP-PAY-07 | Tất toán nghỉ việc | EXPAND · MVP |
| 27 | UC-BP-PAY-08 | Phiếu lương | EXPAND · MVP |
| 28 | UC-BP-PAY-09 | Phân nhóm bảng lương | EXPAND · MVP |"""
    if old not in text:
        raise SystemExit("TOC 3.A block not found")
    return text.replace(old, new, 1)


def replace_fr(text: str, uc: str, body: str) -> str:
    start, end = extract_fr_block(text, uc)
    return text[:start] + body + ("\n" if not body.endswith("\n") else "") + text[end:]


def stamp_existing_skeleton(text: str, uc: str, kind: str, note: str) -> str:
    start, end = extract_fr_block(text, uc)
    block = text[start:end]
    banner = stamp_banner(kind, note)
    if banner in block:
        return text
    # insert after title line
    lines = block.splitlines(keepends=True)
    if not lines:
        return text
    new_block = lines[0] + "\n" + banner + "\n\n" + "".join(lines[1:])
    return text[:start] + new_block + text[end:]


def insert_after_uc(text: str, after_uc: str, new_body: str) -> str:
    start, end = extract_fr_block(text, after_uc)
    return text[:end] + new_body + "\n" + text[end:]


def patch_leave_waiting(text: str) -> str:
    text = text.replace(
        "- **Phải cấp quỹ trước khi dùng** — chính sách thời điểm cấp theo pháp nhân (ví dụ: cấp sẵn đầu năm / cấp cuối tháng cho tháng sau / cấp theo chu kỳ 6 tháng…) — tham số **Q-LEAVE-ACCRUAL** chờ chốt.",
        "- **Phải cấp quỹ trước khi dùng** — chính sách thời điểm cấp theo pháp nhân qua **CRUD** (đầu năm / cuối tháng / 6 tháng…). **R-FY-01:** năm tài chính và mọi cấu hình liên quan theo tenant — **cấm** hardcode tháng FY cố định.",
        1,
    )
    text = text.replace(
        "| Decision | Q-LEAVE-UNIT — **chờ chốt** (nửa ngày hoặc 1 giờ theo loại phép / ca) |",
        "| Decision | Q-LEAVE-UNIT = **Cả hai theo loại phép** (đã chốt) |",
        1,
    )
    text = text.replace(
        "| Decision | Q-REC-HEADCOUNT — **chờ chốt** |",
        "| Decision | Q-REC-HEADCOUNT = **Cho ngoài ĐB + duyệt BOD**; workflow XBOS theo tenant (đã chốt) |",
    )
    text = text.replace(
        "- Chi tiết action tạm dừng: **Q-SI-SUSPEND** chờ chốt.",
        "- Action tạm dừng / đổi mức: **Q-SI-SUSPEND** = trong HRM (đã chốt).",
        1,
    )
    text = text.replace(
        "- Trường hợp đặc biệt: Q-ASSET-MODULE: bản ghi tạm giai dõi ref vs module tài sản đầy đủ nguồn gốc chuẩn theo giai đoạn — **chờ chốt**.",
        "- Q-ASSET-MODULE = **CRUD MVP** (đã chốt): mã/serial + biên bản + thu hồi khi nghỉ.",
        1,
    )
    return text


def main() -> None:
    text = SRS.read_text(encoding="utf-8")
    if "**0.8**" in text.split("\n", 20)[0:15] and "DOC-DELTA" in text[:800]:
        print("SRS already appears v0.8 — continuing idempotent patches")

    text = upgrade_header_and_scope(text)
    text = upgrade_toc_3a(text)
    text = upgrade_pay02(text)
    text = upgrade_att11(text)
    text = patch_leave_waiting(text)

    expanded = []
    for uc in sorted(EXPAND):
        if uc not in FR_SPEC:
            raise SystemExit(f"missing FR_SPEC {uc}")
        body = render_fr(uc, FR_SPEC[uc])
        text = replace_fr(text, uc, body)
        expanded.append(uc)

    text = stamp_existing_skeleton(
        text,
        "UC-BP-REC-03",
        "OUT",
        "Chiến dịch / hub đa kênh không thuộc MVP. Pipeline gắn trên yêu cầu tuyển.",
    )
    text = stamp_existing_skeleton(
        text,
        "UC-BP-CORE-04",
        "OUT",
        "OCR không thuộc MVP. Nếu mở lại sau này, xem xét giai đoạn 2.",
    )
    text = stamp_existing_skeleton(
        text,
        "UC-BP-ATT-03",
        "GD2",
        "Điểm danh đa nguồn đầy đủ ở giai đoạn 2. MVP dùng GPS điểm (ATT-03d), Face mobile và các nguồn đã chốt riêng.",
    )

    if "### FR-UC-BP-ATT-03d" not in text:
        text = insert_after_uc(text, "UC-BP-ATT-03b", render_fr("UC-BP-ATT-03d", ATT_03D))
    if "### FR-UC-BP-ATT-05b" not in text:
        text = insert_after_uc(text, "UC-BP-ATT-05", render_fr("UC-BP-ATT-05b", ATT_05B))

    # Face note near ATT-03 if present
    if "Face MVP chỉ trên ứng dụng di động" not in text:
        text = text.replace(
            "> **Phạm vi:** **GĐ2** — chưa triển khai MVP. Điểm danh đa nguồn đầy đủ ở giai đoạn 2. MVP dùng GPS điểm (ATT-03d), Face mobile và các nguồn đã chốt riêng.",
            "> **Phạm vi:** **GĐ2** — chưa triển khai MVP. Điểm danh đa nguồn đầy đủ ở giai đoạn 2. MVP dùng GPS điểm (ATT-03d), **Face chỉ mobile**, và các nguồn đã chốt riêng.\n>\n> **Face ID:** MVP **chỉ ứng dụng di động** (không bắt buộc web).",
            1,
        )

    text = upgrade_decisions_and_footer(text)

    # Q-PAY-FORMULA term
    text = text.replace(
        "| Q-PAY-FORMULA | Cờ chốt cách lắp công thức trên engine (kéo-thả + kiểm soát phát hành) — **không** mang nghĩa «chưa họp xong tiền lương» |",
        "| Q-PAY-FORMULA | Đã chốt: hai bước soạn→phát hành; form GĐ1; kéo-thả GĐ2; SoT bảng công chốt |",
        1,
    )

    SRS.write_text(text, encoding="utf-8")
    frs = re.findall(r"^### FR-(UC-BP-[A-Z]+-\d+[a-z]?)", text, flags=re.M)
    print("wrote", SRS)
    print("FR headers", len(frs), "unique", len(set(frs)))
    print("expanded", len(expanded))
    for u in ("UC-BP-ATT-03d", "UC-BP-ATT-05b", "UC-BP-REC-03", "UC-BP-CORE-04", "UC-BP-ATT-03"):
        print(u, "OK" if f"### FR-{u}" in text else "MISSING")


if __name__ == "__main__":
    main()
