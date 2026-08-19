# Gói giấy họp chốt — HRM Enterprise Blueprint

| Mục | Nội dung |
|-----|----------|
| **Ngày gói** | 05/08/2026 |
| **Mục đích** | Một lối vào duy nhất cho họp chốt trên giấy — không tạo phiếu hỏi song song |
| **Trạng thái khung** | Chưa đủ điều kiện mở đặc tả kỹ thuật sâu · tạm dừng code nghiệp vụ đến khi chốt giấy (D7) |
| **Phiếu điền chính** | [`SPONSOR_CHOT_FILL.xlsx`](./SPONSOR_CHOT_FILL.xlsx) — cột vàng G–I (hoặc sheet `00_Chot_Sponsor` trong UC_CHOT) · [hướng dẫn md](./SPONSOR_CHOT_FILL_SHEET.md) |

> Tiếng Việt đơn giản. Điền cột trống / ô chọn. Team map lại theo mã cột — không cần biết kỹ thuật sâu.

---

## 1. Mục đích workshop (1 trang)

**Chúng ta họp để chốt trên giấy**, không để viết code hay nghiệm thu phần mềm.

Sau họp, sponsor gửi lại **file Excel đã điền** (`SPONSOR_CHOT_FILL.xlsx` hoặc UC_CHOT sheet `00_Chot_Sponsor`) + cột quyết định bổ sung trong gói này nếu có. Team cập nhật ma trận khoảng trống / SRS theo cột vàng.

| Đã khóa từ họp trước | Còn cần chốt hôm nay |
|----------------------|----------------------|
| Bốn trụ nghiệp vụ (tuyển · nhân sự · chấm công/phép · lương) | Chữ ký / xác nhận giấy **D7** |
| Trụ lương **đã họp xong** — chỉ còn cách **lắp công thức** | Gói câu hỏi **Q-*** tối thiểu (xem §3) |
| 45 tình huống khóa · 16 FR ưu tiên đủ sơ đồ | **18** bề mặt chấm công sâu (sheet Excel 02b) — từng dòng Có / Không / GĐ2 / Hoãn |
| Face ID check-in = giai đoạn 2 (trừ khi đổi ý) | Ba tình huống đề xuất: GPS địa điểm · thẻ QR · panel quỹ phép |
| Tạm dừng code/demo đến khi giấy rõ | UC «Lịch»: viết sâu ngay hay ghi rõ GĐ2 / ngoài phạm vi / tạm hoãn |

**Không mang vào họp:** «chưa họp lương» · mở đặc tả kỹ thuật / API / DB · nghiệm thu màn chấm công / nhân sự trên sản phẩm · sửa mã nguồn.

---

## 2. Checklist đọc trước / trong họp

Đọc theo thứ tự. **Không** cần đọc hết mọi phụ lục nội bộ.

| # | Tài liệu | Việc của sponsor | Bắt buộc? |
|---|----------|------------------|-----------|
| 1 | [`SPONSOR_CHOT_FILL.xlsx`](./SPONSOR_CHOT_FILL.xlsx) | Điền cột vàng D7 · Q-* · MD-S* · ATT · UI · chữ ký | **Có** — phiếu chính (Excel) |
| 2 | [`DECISION_PACKET_Q_PAY_FORMULA.md`](./DECISION_PACKET_Q_PAY_FORMULA.md) | Chốt cách soạn / phát hành công thức lương (hai bước hay khác) | **Có** (P0) |
| 3 | [`WBS_HRM_ENTERPRISE_UC_CHOT.xlsx`](./WBS_HRM_ENTERPRISE_UC_CHOT.xlsx) — sheet **`02b_Man_thieu_sau`** | 18 dòng chức năng sâu — ký Có / Không / GĐ2 (đồng bộ bảng §4 dưới) | **Có** |
| 4 | [`WBS_UC_CHOT_README.md`](./WBS_UC_CHOT_README.md) | Cách chạy họp 60–90 phút (sheet 01 → 02 → 02b → 03) | Khuyến nghị |
| 5 | [`SPONSOR_UC_FLOW_CHOT.pdf`](./SPONSOR_UC_FLOW_CHOT.pdf) | Đọc luồng từng UC trước khi điền sheet 03 (EXPAND / GĐ2 / OUT / WAIVER) | **Có** khi chốt UC «Lịch» |
| 5b | PDF SRS khách v0.7 (nếu đã gửi) | Đối chiếu FR ưu tiên khi nghi ngờ phạm vi | Khuyến nghị |
| 6 | [`SPONSOR_UI_BRAND_OPEN_QUESTIONS.md`](./SPONSOR_UI_BRAND_OPEN_QUESTIONS.md) | Chỉ khi muốn chốt hướng remaster giao diện | **Tuỳ chọn** — tách khỏi chốt nghiệp vụ |
| 7 | [`MASTER_DATA_CONFIG_CLASSIFICATION.md`](./MASTER_DATA_CONFIG_CLASSIFICATION.md) §4 | Chỉ các dòng «Cần sponsor» (đã copy sang phiếu MD-S*) | Khi đụng danh mục / ca / GPS |

**Một phiếu điền Excel.** Mọi câu hỏi chốt map về `SPONSOR_CHOT_FILL.xlsx` — gói này chỉ là mục lục + bảng quyết định bổ sung (02b / UC đề xuất).

---

## 3. Map khoảng trống W3 → ô điền trên phiếu chốt

| Khoảng trống (team) | Ý nghĩa ngắn | Mã dòng trên `SPONSOR_CHOT_FILL.xlsx` (cột C → điền cột G) |
|---------------------|--------------|----------------------------------------|
| D7 — giấy chưa ký | Có chốt logic trên giấy chưa? Khi nào mở lại code/demo? | **§0** D7-1 · D7-2 · D7-3 |
| Q-PAY-FORMULA | Ai soạn / ai phát hành công thức; có 2 bước không? | **§1.1** Q-PAY-FORMULA (+ Q-PAY-F-2 · F-3) · packet riêng |
| Q-REC-HEADCOUNT | Tuyển ngoài định biên + SoT số định biên | **§1.2** Q-REC-HEADCOUNT · Q-REC-HC-2 · **§3** MD-S5 |
| Q-LEAVE-ACCRUAL | Cộng dồn / hết hạn 5 loại phép theo lịch nào | **§1.3** Q-LEAVE-ACCRUAL |
| Q-LEAVE-UNIT | Đơn vị tính phép (ngày / giờ / cả hai) | **§1.3** Q-LEAVE-UNIT |
| Q-SI-SUSPEND | BHXH tạm dừng khi nghỉ không lương / tạm hoãn HĐ | **§1.4** Q-SI-SUSPEND · liên Q-LEAVE-4 |
| Q-ASSET-MODULE | Tài sản trên hồ sơ: xem / CRUD / GĐ2 / ngoài | **§1.4** Q-ASSET-MODULE |
| Q-XBOT-PROFILE | Field động hồ sơ: XBOS hay HRM | **§1.4** Q-XBOT-PROFILE · **§3** MD-S* liên quan |
| ATT — ký chốt / tổng hợp / lễ / Face | Policy chấm công còn mở | **§1.5** Q-ATT-SIGN · SUMMARY · HOLIDAY · FACE |
| 18 MISSING (sheet 02b) | Chức năng sâu chưa có hàng fidelity riêng | **§1.5** Q-ATT-MISSING (tổng) + **§7 phiếu** + bảng **§4 gói này** + Excel 02b |
| UC đề xuất 03d / 03e / 05b | GPS địa điểm · thẻ QR · quỹ phép — chưa ghi vào SRS | **§7 phiếu** PROP-03d · PROP-03e · PROP-05b |
| SRS «Lịch» mỏng (~29 UC) | Có mã nhưng chưa đủ diễn biến chốt | **§8 phiếu** + bảng **§5 gói này** |
| Cấu hình danh mục / ca / GPS | Ai CRUD, SoT nào | **§3** MD-S1…MD-S5 |
| UI / thương hiệu | Remaster — không chặn chốt nghiệp vụ | **§4** UI-1 · UI-2 (tuỳ chọn) |
| Màn thiếu: lịch lễ · OCR · tách kỳ lương UI | PRODUCT_MISSING spine | **§1.5** Q-ATT-HOLIDAY · **§7b phiếu** PM-OCR · PM-HOLIDAY · PM-SPLIT |

---

## 4. Quyết định bắt buộc — 18 chức năng sâu (sheet 02b) + UC đề xuất

Cột **Quyết định sponsor**: chọn một — **IN MVP giấy** · **GĐ2** · **OUT** · **DEFER** (hoãn quyết định).  
Đồng bộ với Excel `02b_Man_thieu_sau` khi họp.

### 4.1 Mười tám bề mặt (Excel 02b)

| # | Mã nội bộ | Tên ngắn (tiếng Việt) | Gợi ý team (không bắt buộc) | Quyết định sponsor |
|---|-----------|------------------------|-----------------------------|-------------------|
| 1 | S03 | Tổng quan — nút «Chấm công ngay» | Ghi chú cầu nối chấm tay | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 2 | S04 | Tổng quan — tùy chỉnh bố cục | Đang phát triển / no-op | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 3 | S07 | Biểu đồ tròn loại nghỉ | Có thể GĐ2 hoặc chấp nhận thiếu FR | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 4 | S15 | Thẻ QR nhân viên | Liên PROP-03e | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 5 | S16 | Hộp thoại thẻ QR | Lồng S15 | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 6 | S25 | Xóa bảng chấm công | Cần quy tắc nếu giữ ký chốt | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 7 | S28 | Xóa bản ghi chấm | Cùng kênh điểm danh | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 8 | S29 | Bản ghi → Xuất | Có thể gộp đường xuất khác | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 9 | S32 | Lịch tuần — chi tiết ô | Phụ thuộc có dùng lịch tuần MVP | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 10 | S33 | Lịch tuần — icon không tác dụng | Honesty stub | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 11 | S39 | Ca làm việc — Sao chép | Stub | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 12 | S43 | Panel quỹ phép | Liên PROP-05b · Q-LEAVE-* | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 13 | S65 | Cài đặt NV — Import | Mở rộng import hiện có | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 14 | S66 | Bộ lọc / tải xuống NV (no-op) | Stub | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 15 | S70 | Tùy chỉnh — Reset / Xem trước / Thêm | Stub | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 16 | S71 | Gợi ý phương thức chấm | Stub | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 17 | S74 | Cài đặt → Địa điểm GPS | Liên PROP-03d · MD-S3 | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| 18 | S75 | Thêm địa điểm GPS | Lồng S74 | ☐ IN MVP giấy · ☐ GĐ2 · ☐ OUT · ☐ DEFER |

### 4.2 Ba tình huống đề xuất (chưa ghi vào SRS — không xóa FR hiện có)

| Mã đề xuất | Nội dung | Điều kiện gợi ý | Quyết định sponsor |
|------------|----------|-----------------|-------------------|
| **UC-BP-ATT-03d** | Quản lý địa điểm GPS / bán kính chấm công | Bắt buộc nếu giữ chấm GPS ở giai đoạn 1 | ☐ IN MVP giấy (ADD SRS sau) · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| **UC-BP-ATT-03e** | Thẻ QR nhân viên (xem · tải · in) | Bắt buộc nếu giữ kênh QR ở giai đoạn 1 | ☐ IN MVP giấy (ADD SRS sau) · ☐ GĐ2 · ☐ OUT · ☐ DEFER |
| **UC-BP-ATT-05b** | Panel quỹ phép (số dư · giữ chỗ · chuyển kỳ) | Siết / tách từ quỹ phép hiện có | ☐ IN MVP giấy (ADD SRS sau) · ☐ GĐ2 · ☐ OUT · ☐ DEFER |

---

## 5. UC trạng thái «Lịch» — viết sâu hoặc ghi rõ ngoại lệ

**PDF luồng chốt:** [`SPONSOR_UC_FLOW_CHOT.pdf`](./SPONSOR_UC_FLOW_CHOT.pdf) — mục lục 45 mã · Phần A (16 Ưu tiên đủ diễn biến) · Phần B (29 Lịch khung «cần EXPAND»). Đọc PDF rồi đánh dấu Excel sheet 03 / bảng dưới.

**Không xóa / ghi đè** các FR đã đủ 7 mục. Chỉ chọn hướng cho từng dòng còn mỏng.

Cột quyết định: **EXPAND** (viết đủ diễn biến sau khi khung ký) · **GĐ2** · **OUT** · **WAIVER** (chấp nhận khung mỏng cho GĐ1, ghi lý do).

### 5.1 Trục chấm công / phép / lịch (ưu tiên họp A3–A5)

| Mã UC | Tên ngắn | Quyết định sponsor | Ghi chú |
|-------|----------|-------------------|---------|
| UC-BP-ATT-01 | Quy tắc ca theo bộ phận | ☐ EXPAND · ☐ GĐ2 · ☐ OUT · ☐ WAIVER | |
| UC-BP-ATT-03 | Điểm danh đa nguồn | ☐ EXPAND · ☐ GĐ2 · ☐ OUT · ☐ WAIVER | |
| UC-BP-ATT-03b | Lịch lễ / Tết (dương + âm) | ☐ EXPAND · ☐ GĐ2 · ☐ OUT · ☐ WAIVER | Liên Q-ATT-HOLIDAY |
| UC-BP-ATT-04 | Cấp phát phép + 5 loại | ☐ EXPAND · ☐ GĐ2 · ☐ OUT · ☐ WAIVER | Liên Q-LEAVE-* |
| UC-BP-ATT-04b | Ứng phép | ☐ EXPAND · ☐ GĐ2 · ☐ OUT · ☐ WAIVER | |
| UC-BP-ATT-05 | Phép chuyển kỳ | ☐ EXPAND · ☐ GĐ2 · ☐ OUT · ☐ WAIVER | |
| UC-BP-ATT-06 | Phép bù OT | ☐ EXPAND · ☐ GĐ2 · ☐ OUT · ☐ WAIVER | |
| UC-BP-ATT-07 | Nghỉ ốm + BH | ☐ EXPAND · ☐ GĐ2 · ☐ OUT · ☐ WAIVER | Liên Q-SI-SUSPEND |
| UC-BP-ATT-12 | Mở quỹ phép khi Hoạt động | ☐ EXPAND · ☐ GĐ2 · ☐ OUT · ☐ WAIVER | |

### 5.2 Trục tuyển / nhân sự / lương còn «Lịch» (chốt nhanh hoặc để sau)

| Nhóm | Mã UC (gộp) | Quyết định sponsor | Ghi chú |
|------|-------------|-------------------|---------|
| Tuyển khung | REC-00 · 04 · 05 · 06 · 07 | ☐ EXPAND cả nhóm · ☐ GĐ2 phần: ____ · ☐ WAIVER · ☐ Từng UC (ghi phiếu §8) | REC-03 đã GĐ2 |
| Nhân sự khung | CORE-02b · 03 · 04 · 05 · 06 · 07 · 09 · 10 | ☐ EXPAND cả nhóm · ☐ GĐ2 phần: ____ · ☐ WAIVER · ☐ Từng UC | OCR = CORE-04 · tài sản = Q-ASSET |
| Lương khung | PAY-03 · 05 · 06 · 07 · 08 · 09 | ☐ EXPAND cả nhóm · ☐ GĐ2 phần: ____ · ☐ WAIVER · ☐ Từng UC | Trụ lương đã họp; đây là độ sâu giấy |

---

## 6. Điều kiện mở khóa — khi nào mới xét đặc tả kỹ thuật sâu

Team **chỉ xét** mở gói đặc tả kỹ thuật / API / thiết kế dữ liệu sâu khi **đủ tất cả** điều kiện dưới.  
Gói này **không** khẳng định đã sẵn sàng.

| # | Điều kiện | Ai xác nhận |
|---|-----------|-------------|
| 1 | **D7** — đã chốt / ký giấy (hoặc lịch ký rõ ngày) theo phiếu §0 | Sponsor + PM |
| 2 | Đã trả lời tối thiểu: **Q-PAY-FORMULA** · **Q-LEAVE-ACCRUAL** · **Q-LEAVE-UNIT** · **Q-REC-HEADCOUNT** (khuyến nghị thêm Q-SI-SUSPEND) | Sponsor trên phiếu |
| 3 | Sheet **02b** (18 dòng) + bảng §4.1 có quyết định IN / GĐ2 / OUT / DEFER | Sponsor |
| 4 | PROP-03d · 03e · 05b có quyết định §4.2 | Sponsor |
| 5 | Chính sách UC «Lịch» §5: EXPAND hoặc GĐ2 / OUT / WAIVER cho trục phép–lịch (A3–A5) tối thiểu | Sponsor |
| 6 | Vẫn **tạm dừng code nghiệp vụ** trên sản phẩm đến khi D7 cho phép mở (phiếu D7-2) | PM giữ khóa |

**Sau khi đủ 1–5:** PM mới được giao bước đặc tả kỹ thuật trên **tài liệu** — vẫn không sửa mã nguồn cho đến D7-2 mở phạm vi.

**Chưa đủ** → giữ trạng thái «chưa sẵn sàng đặc tả sâu»; cập nhật phiếu / họp bổ sung.

---

## 7. Nhắc ngắn — tránh hiểu nhầm

| Đúng | Sai |
|------|-----|
| Họp lương **đã xong**; còn chốt **cách lắp công thức** | Nói «chưa họp lương» / «lương chưa xong» |
| Face ID = giai đoạn 2 trừ khi sponsor đổi | Đưa Face vào MVP im lặng |
| Một phiếu `SPONSOR_CHOT_FILL.xlsx` | Tạo phiếu hỏi thứ hai trùng nội dung |
| Chấm công / nhân sự trên sản phẩm **chưa** đóng nghiệm thu | Coi browser đã «xong» Attendance / Employees |

---

## 8. Sau họp — gửi lại gì

1. File [`SPONSOR_CHOT_FILL.xlsx`](./SPONSOR_CHOT_FILL.xlsx) (hoặc UC_CHOT sheet `00_Chot_Sponsor`) đã Save cột vàng.  
2. Cột quyết định §4 và §5 trong gói này (hoặc đánh dấu tương đương trên Excel 02b + ghi chú PROP).  
3. (Tuỳ chọn) Ý kiến UI từ file Open Questions.

PM nhận → cập nhật ma trận khoảng trống → giao làm đầy SRS theo quyết định EXPAND / ADD UC đề xuất — **không** mở code ngoài phạm vi D7.
