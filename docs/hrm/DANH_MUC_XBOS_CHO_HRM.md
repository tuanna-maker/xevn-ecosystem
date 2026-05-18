# Danh mục XBOS phải khai cho phân hệ Nhân sự (HRM)

> Phiên bản: 2026-05-18 · Nguồn tham chiếu: BRD/SRS HRM, `settings-catalogs`, import nhân sự tập đoàn  
> **Bảng một dòng / thống kê:** [`BANG_TONG_HOP_USECASE_HRM.md`](./BANG_TONG_HOP_USECASE_HRM.md) — **119 use case**  
> **Gom toàn hệ + 72 danh mục:** [`BANG_TONG_HOP_USECASE_XEVN.md`](../ecosystem/BANG_TONG_HOP_USECASE_XEVN.md)

---

## 1. Phân vai dữ liệu

| Lớp | Quản lý tại | Ví dụ |
|-----|-------------|-------|
| Dùng chung tập đoàn | XBOS | Pháp nhân, cây tổ chức, thư viện chức danh |
| Danh mục HRM trên XBOS | XBOS | Nhóm trường hồ sơ, phòng ban–chức vụ, loại nghỉ |
| Dữ liệu nghiệp vụ | Phân hệ HRM | Từng nhân viên, đơn nghỉ, bảng lương |

---

## 2. Danh mục XBOS — Tổ chức và pháp nhân

| STT | Tên danh mục | Cấp | Phạm vi |
|-----|--------------|-----|---------|
| 1 | Công ty / pháp nhân thành viên | 1 | Tập đoàn |
| 2 | Mảng kinh doanh (trước khi nâng thành công ty con) | 1 | Tập đoàn |
| 3 | Cây đơn vị tổ chức / phòng ban | 2 | Theo pháp nhân |
| 4 | Chi nhánh / điểm làm việc | 2 | Theo công ty |
| 5 | Trực thuộc quản lý (đơn vị quản lý nhân sự) | 1 | Tập đoàn |
| 6 | Khu vực / vùng miền (phục vụ báo cáo) | 2 | Tập đoàn |

---

## 3. Danh mục XBOS — Chức danh và phân quyền

| STT | Tên danh mục | Cấp | Phạm vi |
|-----|--------------|-----|---------|
| 7 | Thư viện mẫu chức danh (chức danh chuẩn tập đoàn) | 1 | Tập đoàn |
| 8 | Chức danh áp dụng theo công ty | 2 | Theo công ty |
| 9 | Bộ phận làm việc (theo từng công ty) | 2 | Theo công ty |
| 10 | Chức vụ / vị trí công việc (theo từng phòng) | 3 | Theo công ty |
| 11 | Vai trò nghiệp vụ HRM | 1 | Tập đoàn |
| 12 | Mã quyền chức năng | 1 | Tập đoàn |
| 13 | Ma trận phân quyền theo vai trò | 2 | Theo pháp nhân |
| 14 | Gán chức danh cho người dùng (kiêm nhiệm) | 1 | Theo người |

**Công ty đã có bộ phòng–chức vụ riêng (khai trên XBOS, đồng bộ xuống HRM):**

- Xe thương mại dịch vụ
- Visun
- Xe du lịch
- Xe Việt Nam
- Tập đoàn (holding)

---

## 4. Danh mục XBOS — Biểu mẫu hồ sơ nhân viên (nhóm trường)

| STT | Tên nhóm danh mục | Trường trong nhóm |
|-----|-------------------|-------------------|
| 15 | Định danh và tổ chức | Mã nhân viên, Họ tên, Trực thuộc quản lý, Bộ phận, Chức vụ, Chi nhánh, Trạng thái lao động |
| 16 | Nhân thân | Năm sinh, Giới tính, CCCD/CMND, Dân tộc, Tôn giáo, Trình độ chuyên môn |
| 17 | Liên lạc | Số điện thoại, Zalo, Email |
| 18 | Liên hệ khẩn cấp | Người liên hệ, Số điện thoại, Quan hệ |
| 19 | Địa chỉ | Địa chỉ thường trú, Tạm trú |
| 20 | Bảo hiểm | Mã số bảo hiểm xã hội |

### 4.1 Danh mục giá trị chọn (gắn vào nhóm trên)

| STT | Tên danh mục | Giá trị mẫu |
|-----|--------------|-------------|
| 21 | Trạng thái lao động | Đang làm việc, Thử việc, Ngừng làm việc |
| 22 | Giới tính | Nam, Nữ, Khác |
| 23 | Dân tộc | (danh sách chuẩn) |
| 24 | Tôn giáo | (danh sách chuẩn) |
| 25 | Trình độ chuyên môn | (danh sách chuẩn) |
| 26 | Quan hệ người liên hệ khẩn cấp | Cha/mẹ, Vợ/chồng, Anh/chị/em, Khác |

---

## 5. Danh mục XBOS — Hợp đồng, chấm công, lương

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 27 | Loại hợp đồng lao động | 1 |
| 28 | Loại quyết định nhân sự | 1 |
| 29 | Loại đơn chỉnh sửa chấm công | 1 |
| 30 | Loại đơn nghỉ phép | 1 |
| 31 | Ca làm việc / lịch ca | 1 |
| 32 | Kỳ lương | 1 |
| 33 | Loại phụ cấp | 1 |
| 34 | Loại khấu trừ | 1 |
| 35 | Loại yêu cầu dịch vụ nội bộ (operations) | 1 |
| 36 | Trạng thái xử lý đơn | 1 |

---

## 6. Danh mục XBOS — Tuyển dụng

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 37 | Loại chiến dịch tuyển dụng | 1 |
| 38 | Trạng thái yêu cầu tuyển | 1 |
| 39 | Nguồn ứng viên | 1 |
| 40 | Trạng thái ứng viên | 1 |
| 41 | Vòng phỏng vấn | 1 |
| 42 | Kết quả phỏng vấn | 1 |

---

## 7. Danh mục XBOS — Hồ sơ và tài liệu nhân viên

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 43 | Thư mục / loại tài liệu hồ sơ | 2 |
| 44 | Loại thay đổi metadata hồ sơ | 1 |
| 45 | Lý do từ chối duyệt thay đổi hồ sơ | 1 |

---

## 8. Danh mục XBOS — Hồ sơ xe (công ty du lịch, bổ sung HRM)

| STT | Tên nhóm danh mục | Nội dung trường |
|-----|-------------------|-----------------|
| 46 | Lái xe và tuyến | Tên lái xe, SĐT, Tuyến, Mục đích sử dụng |
| 47 | Thông tin xe | Biển số, Số khung, Số máy, Năm SX, Hãng, Model, Số chỗ, Số km hiện tại, Ngày bắt đầu vận hành |
| 48 | Đăng ký và đăng kiểm | Ngày đăng ký lần đầu, Đăng kiểm, Hết hạn đăng kiểm |
| 49 | Bảo hiểm xe | Bảo hiểm TNDS, Bảo hiểm vật chất (ngày cấp / hết hạn) |
| 50 | Phù hiệu và giấy đi đường | Ngày cấp / hết hạn |
| 51 | Phí bảo trì đường bộ | Phí, Ngày đóng, Hết hạn |
| 52 | Viễn thông / SIM | Gói cước, Nhà mạng, SIM |
| 53 | Thiết bị định vị | Thiết bị, Ngày lắp |
| 54 | Tài chính vay xe | Tổ chức vay, Ngày vay, Số tiền |

---

## 9. Danh mục XBOS — Quy trình và phê duyệt (tham chiếu HRM)

| STT | Tên danh mục | Ghi chú |
|-----|--------------|---------|
| 55 | Mã quy trình chỉnh sửa chấm công | Định nghĩa trên XBOS, HRM chỉ tham chiếu |
| 56 | Mã quy trình nghỉ phép | Định nghĩa trên XBOS |
| 57 | Mã quy trình duyệt mở rộng danh mục HRM | Định nghĩa trên XBOS |
| 58 | Mã quy trình duyệt thay đổi metadata nhân viên | Định nghĩa trên XBOS |
| 59 | Nhóm quy trình (Nhân sự / Vận hành / Tài chính) | Phân loại trên XBOS |

---

## 10. Danh mục XBOS — Master dùng chung (Business Master)

| STT | Tên danh mục | Dùng cho HRM |
|-----|--------------|--------------|
| 60 | Chức danh (master) | Có |
| 61 | Khách hàng nội bộ / đối tác HR | Tuỳ chọn |
| 62 | Loại chi phí (nếu liên kết tạm ứng) | Tuỳ chọn |
| 63 | Chỉ số KPI nhân sự | Có (cockpit embed) |

---

## 11. Danh mục XBOS — RACI và nhiệm vụ (Command Center)

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 64 | Khối nghiệp vụ RACI | 1 |
| 65 | Catalog hoạt động RACI | 1 |
| 66 | Vai trò RACI (R/A/C/I) | 1 |
| 67 | Ánh xạ hoạt động ↔ chức năng phân hệ | 2 |
| 68 | Gán cột RACI ↔ chức danh | 2 |

---

## 12. Danh mục XBOS — Cấu hình Command Center (khối Nhân sự tập đoàn)

| STT | Tên danh mục | Mục đích |
|-----|--------------|----------|
| 69 | Preset biểu mẫu hồ sơ theo công ty | Áp dụng nhanh bộ trường |
| 70 | Danh mục văn bản nội bộ (Command Center) | Chuẩn hóa loại văn bản |
| 71 | Danh mục đo lường | KPI / chỉ tiêu embed |
| 72 | Danh mục giá / chính sách (nếu liên quan phúc lợi) | Tuỳ chọn |

---

## 13. Dữ liệu nghiệp vụ (không phải danh mục — HRM quản lý)

- Hồ sơ từng nhân viên
- Tài khoản và lời mời người dùng
- Đơn chỉnh sửa chấm công, đơn nghỉ phép, yêu cầu dịch vụ
- Kỳ lương và phiếu lương cụ thể
- Yêu cầu tuyển dụng, ứng viên, lịch phỏng vấn
- Phiên bản tài liệu đính kèm (kho tài liệu)
- Hộp thư thông báo nghiệp vụ

---

## 14. Use case quản trị danh mục trên XBOS (HRM)

| Mã | Tên use case |
|----|--------------|
| XBOS-DM-HRM-01 | Xem tổng quan danh mục theo phân hệ Nhân sự |
| XBOS-DM-HRM-02 | Cấu hình 6 nhóm trường hồ sơ nhân viên |
| XBOS-DM-HRM-03 | Bổ sung trường mở rộng theo công ty |
| XBOS-DM-HRM-04 | Gửi phê duyệt khi công ty con thêm/xóa trường |
| XBOS-DM-HRM-05 | Phê duyệt hoặc từ chối mở rộng danh mục |
| XBOS-DM-HRM-06 | Khai bộ phòng ban và chức vụ theo từng công ty |
| XBOS-DM-HRM-07 | Sao chép thư viện chức danh sang công ty con |
| XBOS-DM-HRM-08 | Gán danh mục cho phân hệ Nhân sự |
| XBOS-DM-HRM-09 | Phát hành phiên bản danh mục mới |
| XBOS-DM-HRM-10 | Đồng bộ danh mục xuống HRM |
| XBOS-DM-HRM-11 | Kiểm tra danh mục thiếu trước import nhân sự |
| XBOS-DM-HRM-12 | Cấu hình preset biểu mẫu theo công ty (Command Center) |
| XBOS-DM-HRM-13 | Khai danh mục hồ sơ xe (du lịch) |
| XBOS-DM-HRM-14 | Gán mã quy trình cho loại đơn HRM |
| XBOS-DM-HRM-15 | Xem lịch sử thay đổi danh mục |
