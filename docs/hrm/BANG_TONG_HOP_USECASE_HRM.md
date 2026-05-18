# Bảng tổng hợp use case — HRM & XBOS (danh mục Nhân sự)

> **Gom toàn hệ:** [`BANG_TONG_HOP_USECASE_XEVN.md`](../ecosystem/BANG_TONG_HOP_USECASE_XEVN.md)

---

## Thống kê nhanh

| Chỉ tiêu | Số lượng |
|----------|----------|
| **Tổng use case** | **119** |
| Quản trị danh mục trên XBOS | 15 |
| API / Web — nền tảng & đồng bộ | 8 |
| API / Web — chấm công & đơn từ | 13 |
| API / Web — yêu cầu dịch vụ & thông báo | 8 |
| API / Web — nhân sự, lương, tuyển dụng, hợp đồng | 24 |
| API / Web — metadata, danh mục, import | 18 |
| API / Web — công việc, đánh giá, đội xe | 9 |
| Web Portal — embed Command Center | 8 |
| Ứng dụng di động HRM | 15 |

### Theo nhóm nghiệp vụ

| Nhóm | Số use case |
|------|-------------|
| Quản trị danh mục XBOS | 15 |
| Nền tảng, quản trị, đồng bộ XBOS | 8 |
| Chấm công và đơn từ | 13 |
| Yêu cầu dịch vụ nội bộ | 6 |
| Hộp thư thông báo | 2 |
| Quản lý nhân viên | 5 |
| Lương | 6 |
| Tuyển dụng | 6 |
| Hợp đồng và bảo hiểm | 7 |
| Thay đổi metadata hồ sơ | 5 |
| Cấu hình danh mục HRM | 9 |
| Import / export nhân sự | 4 |
| Công việc vận hành (tasks) | 4 |
| Đánh giá hiệu suất | 4 |
| Hồ sơ xe (du lịch) | 1 |
| Embed Command Center | 8 |
| Mobile | 15 |

---

## Bảng chung (119 use case)

| STT | Mã | Tên use case | Nhóm nghiệp vụ | Kênh |
|-----|-----|--------------|----------------|------|
| 1 | XBOS-DM-HRM-01 | Xem tổng quan danh mục theo phân hệ Nhân sự | Quản trị danh mục XBOS | XBOS |
| 2 | XBOS-DM-HRM-02 | Cấu hình 6 nhóm trường hồ sơ nhân viên | Quản trị danh mục XBOS | XBOS |
| 3 | XBOS-DM-HRM-03 | Bổ sung trường mở rộng theo công ty | Quản trị danh mục XBOS | XBOS |
| 4 | XBOS-DM-HRM-04 | Gửi phê duyệt khi công ty con thêm hoặc xóa trường | Quản trị danh mục XBOS | XBOS |
| 5 | XBOS-DM-HRM-05 | Phê duyệt hoặc từ chối mở rộng danh mục | Quản trị danh mục XBOS | XBOS |
| 6 | XBOS-DM-HRM-06 | Khai bộ phòng ban và chức vụ theo từng công ty | Quản trị danh mục XBOS | XBOS |
| 7 | XBOS-DM-HRM-07 | Sao chép thư viện chức danh sang công ty con | Quản trị danh mục XBOS | XBOS |
| 8 | XBOS-DM-HRM-08 | Gán danh mục cho phân hệ Nhân sự | Quản trị danh mục XBOS | XBOS |
| 9 | XBOS-DM-HRM-09 | Phát hành phiên bản danh mục mới | Quản trị danh mục XBOS | XBOS |
| 10 | XBOS-DM-HRM-10 | Đồng bộ danh mục xuống HRM | Quản trị danh mục XBOS | XBOS |
| 11 | XBOS-DM-HRM-11 | Kiểm tra danh mục thiếu trước import nhân sự | Quản trị danh mục XBOS | XBOS |
| 12 | XBOS-DM-HRM-12 | Cấu hình preset biểu mẫu theo công ty (Command Center) | Quản trị danh mục XBOS | XBOS |
| 13 | XBOS-DM-HRM-13 | Khai danh mục hồ sơ xe (du lịch) | Quản trị danh mục XBOS | XBOS |
| 14 | XBOS-DM-HRM-14 | Gán mã quy trình cho loại đơn HRM | Quản trị danh mục XBOS | XBOS |
| 15 | XBOS-DM-HRM-15 | Xem lịch sử thay đổi danh mục | Quản trị danh mục XBOS | XBOS |
| 16 | UC-HRM-01 | Kiểm tra trạng thái dịch vụ | Nền tảng, quản trị, đồng bộ | API |
| 17 | UC-HRM-02 | Tạo quản trị nền tảng | Nền tảng, quản trị, đồng bộ | API |
| 18 | UC-HRM-03 | Tạo hoặc cập nhật quản trị doanh nghiệp | Nền tảng, quản trị, đồng bộ | API |
| 19 | UC-HRM-04 | Mời nhân viên hàng loạt | Nền tảng, quản trị, đồng bộ | API |
| 20 | UC-HRM-05 | Cập nhật thông tin nhạy cảm tài khoản | Nền tảng, quản trị, đồng bộ | API |
| 21 | UC-HRM-06 | Đồng bộ dữ liệu dùng chung từ XBOS | Nền tảng, quản trị, đồng bộ | API |
| 22 | UC-HRM-07 | Lấy dữ liệu dùng chung theo khóa danh mục | Nền tảng, quản trị, đồng bộ | API |
| 23 | UC-HRM-08 | Liệt kê dữ liệu dùng chung theo phân hệ | Nền tảng, quản trị, đồng bộ | API |
| 24 | HRM-AT-01 | Ghi nhận bản ghi chấm công | Chấm công và đơn từ | API / Web |
| 25 | HRM-AT-02 | Xem danh sách bản ghi chấm công | Chấm công và đơn từ | API / Web |
| 26 | HRM-AT-03 | Cập nhật trạng thái bản ghi chấm công | Chấm công và đơn từ | API / Web |
| 27 | HRM-AT-04 | Tạo đơn chỉnh sửa chấm công | Chấm công và đơn từ | API / Web |
| 28 | HRM-AT-05 | Xem danh sách đơn chỉnh sửa chấm công | Chấm công và đơn từ | API / Web |
| 29 | HRM-AT-06 | Sửa đơn chỉnh sửa chấm công | Chấm công và đơn từ | API / Web |
| 30 | HRM-AT-07 | Phê duyệt đơn chỉnh sửa chấm công | Chấm công và đơn từ | API / Web |
| 31 | HRM-AT-08 | Từ chối đơn chỉnh sửa chấm công | Chấm công và đơn từ | API / Web |
| 32 | HRM-AT-09 | Xóa đơn chỉnh sửa chấm công | Chấm công và đơn từ | API / Web |
| 33 | HRM-AT-10 | Tạo đơn nghỉ phép | Chấm công và đơn từ | API / Web |
| 34 | HRM-AT-11 | Xem danh sách đơn nghỉ phép | Chấm công và đơn từ | API / Web |
| 35 | HRM-AT-12 | Phê duyệt đơn nghỉ phép | Chấm công và đơn từ | API / Web |
| 36 | HRM-AT-13 | Từ chối đơn nghỉ phép | Chấm công và đơn từ | API / Web |
| 37 | HRM-SV-01 | Tạo yêu cầu dịch vụ nội bộ | Yêu cầu dịch vụ nội bộ | API / Web |
| 38 | HRM-SV-02 | Xem danh sách yêu cầu dịch vụ | Yêu cầu dịch vụ nội bộ | API / Web |
| 39 | HRM-SV-03 | Cập nhật yêu cầu dịch vụ | Yêu cầu dịch vụ nội bộ | API / Web |
| 40 | HRM-SV-04 | Xóa yêu cầu dịch vụ | Yêu cầu dịch vụ nội bộ | API / Web |
| 41 | HRM-SV-05 | Phê duyệt yêu cầu dịch vụ | Yêu cầu dịch vụ nội bộ | API / Web |
| 42 | HRM-SV-06 | Từ chối yêu cầu dịch vụ | Yêu cầu dịch vụ nội bộ | API / Web |
| 43 | UC-HRM-12 | Đọc hộp thư thông báo nghiệp vụ | Hộp thư thông báo | API / Web |
| 44 | HRM-NT-01 | Đánh dấu thông báo đã đọc | Hộp thư thông báo | API / Web |
| 45 | HRM-NT-02 | Đăng ký token thông báo đẩy (mobile) | Hộp thư thông báo | API / Mobile |
| 46 | HRM-EM-01 | Tạo hồ sơ nhân viên | Quản lý nhân viên | API / Web |
| 47 | HRM-EM-02 | Xem danh sách nhân viên | Quản lý nhân viên | API / Web |
| 48 | HRM-EM-03 | Cập nhật hồ sơ nhân viên | Quản lý nhân viên | API / Web |
| 49 | HRM-EM-04 | Lưu trữ (xóa mềm) nhân viên | Quản lý nhân viên | API / Web |
| 50 | HRM-EM-05 | Khôi phục nhân viên đã lưu trữ | Quản lý nhân viên | API / Web |
| 51 | HRM-PR-01 | Tạo kỳ lương | Lương | API / Web |
| 52 | HRM-PR-02 | Xem danh sách kỳ lương | Lương | API / Web |
| 53 | HRM-PR-03 | Xử lý tính lương theo kỳ | Lương | API / Web |
| 54 | HRM-PR-04 | Chốt kỳ lương | Lương | API / Web |
| 55 | HRM-PR-05 | Xem phiếu lương | Lương | API / Web |
| 56 | HRM-PR-06 | Báo cáo đối soát lương | Lương | API / Web |
| 57 | HRM-RC-01 | Tạo yêu cầu tuyển dụng | Tuyển dụng | API / Web |
| 58 | HRM-RC-02 | Xem danh sách yêu cầu tuyển dụng | Tuyển dụng | API / Web |
| 59 | HRM-RC-03 | Tạo hồ sơ ứng viên | Tuyển dụng | API / Web |
| 60 | HRM-RC-04 | Xem danh sách ứng viên | Tuyển dụng | API / Web |
| 61 | HRM-RC-05 | Lên lịch phỏng vấn | Tuyển dụng | API / Web |
| 62 | HRM-RC-06 | Cập nhật kết quả phỏng vấn | Tuyển dụng | API / Web |
| 63 | HRM-CI-01 | Tạo hợp đồng lao động | Hợp đồng và bảo hiểm | API / Web |
| 64 | HRM-CI-02 | Ghi nhận bảo hiểm nhân viên | Hợp đồng và bảo hiểm | API / Web |
| 65 | HRM-CI-03 | Xem danh sách hợp đồng | Hợp đồng và bảo hiểm | API / Web |
| 66 | HRM-CI-04 | Cảnh báo hợp đồng sắp hết hạn | Hợp đồng và bảo hiểm | API / Web |
| 67 | HRM-CI-05 | Cập nhật hợp đồng | Hợp đồng và bảo hiểm | API / Web |
| 68 | HRM-CI-06 | Xóa hợp đồng | Hợp đồng và bảo hiểm | API / Web |
| 69 | HRM-CI-07 | Cảnh báo bảo hiểm sắp hết hạn | Hợp đồng và bảo hiểm | API / Web |
| 70 | HRM-MD-01 | Gửi yêu cầu thay đổi metadata hồ sơ | Thay đổi metadata hồ sơ | API / Web |
| 71 | HRM-MD-02 | Xem hàng chờ thay đổi metadata | Thay đổi metadata hồ sơ | API / Web |
| 72 | HRM-MD-03 | Phê duyệt thay đổi metadata | Thay đổi metadata hồ sơ | API / Web |
| 73 | HRM-MD-04 | Từ chối thay đổi metadata | Thay đổi metadata hồ sơ | API / Web |
| 74 | HRM-MD-05 | Xem nhật ký thay đổi metadata | Thay đổi metadata hồ sơ | API / Web |
| 75 | HRM-SC-01 | Xem tổng quan danh mục cấu hình HRM | Cấu hình danh mục HRM | API / Web |
| 76 | HRM-SC-02 | Đồng bộ toàn bộ danh mục từ XBOS | Cấu hình danh mục HRM | API / Web |
| 77 | HRM-SC-03 | Bổ sung giá trị danh mục mở rộng | Cấu hình danh mục HRM | API / Web |
| 78 | HRM-SC-04 | Yêu cầu xóa trường danh mục | Cấu hình danh mục HRM | API / Web |
| 79 | HRM-SC-05 | Phê duyệt lô mở rộng danh mục | Cấu hình danh mục HRM | API / Web |
| 80 | HRM-SC-06 | Từ chối lô mở rộng danh mục | Cấu hình danh mục HRM | API / Web |
| 81 | HRM-SC-07 | Khởi tạo mẫu import nhân sự tập đoàn | Cấu hình danh mục HRM | API / Web |
| 82 | HRM-SC-08 | Khởi tạo danh mục phòng ban – chức vụ theo công ty | Cấu hình danh mục HRM | API / Web |
| 83 | HRM-SC-09 | Khởi tạo danh mục hồ sơ xe du lịch | Cấu hình danh mục HRM | API / Web |
| 84 | HRM-IM-01 | Xem trước import nhân sự từ file | Import / export nhân sự | API / Web |
| 85 | HRM-IM-02 | Xác nhận import nhân sự | Import / export nhân sự | API / Web |
| 86 | HRM-IM-03 | Export danh sách nhân sự | Import / export nhân sự | API / Web |
| 87 | HRM-IM-04 | Tải file mẫu import | Import / export nhân sự | API / Web |
| 88 | HRM-OP-01 | Tạo công việc vận hành | Công việc vận hành (tasks) | API / Web |
| 89 | HRM-OP-02 | Xem danh sách công việc | Công việc vận hành (tasks) | API / Web |
| 90 | HRM-OP-03 | Cập nhật trạng thái công việc | Công việc vận hành (tasks) | API / Web |
| 91 | HRM-OP-04 | Báo cáo tổng hợp công việc | Công việc vận hành (tasks) | API / Web |
| 92 | HRM-PF-01 | Tạo chu kỳ đánh giá hiệu suất | Đánh giá hiệu suất | API / Web |
| 93 | HRM-PF-02 | Xem danh sách chu kỳ đánh giá | Đánh giá hiệu suất | API / Web |
| 94 | HRM-PF-03 | Tạo phiếu đánh giá | Đánh giá hiệu suất | API / Web |
| 95 | HRM-PF-04 | Xem danh sách phiếu đánh giá | Đánh giá hiệu suất | API / Web |
| 96 | HRM-FL-01 | Xem danh sách hồ sơ xe (fleet) | Hồ sơ xe (du lịch) | API / Web |
| 97 | UC-HRM-20 | Embed — Tổng quan HRM | Embed Command Center | Web Portal |
| 98 | UC-HRM-21 | Embed — Danh sách nhân sự | Embed Command Center | Web Portal |
| 99 | UC-HRM-22 | Embed — Tuyển dụng | Embed Command Center | Web Portal |
| 100 | UC-HRM-23 | Embed — Chấm công | Embed Command Center | Web Portal |
| 101 | UC-HRM-24 | Embed — Lương | Embed Command Center | Web Portal |
| 102 | UC-HRM-25 | Embed — Hợp đồng và bảo hiểm xã hội | Embed Command Center | Web Portal |
| 103 | UC-HRM-26 | Embed — Hàng chờ duyệt metadata | Embed Command Center | Web Portal |
| 104 | UC-HRM-27 | Embed — Quyết định và báo cáo (backlog) | Embed Command Center | Web Portal |
| 105 | UC-HRM-MOB-01 | Đăng nhập và thiết lập phiên an toàn | Mobile — nền tảng | Mobile |
| 106 | UC-HRM-MOB-02 | Chọn và xác nhận phạm vi công ty | Mobile — nền tảng | Mobile |
| 107 | UC-HRM-MOB-03 | Xem bảng điều khiển cá nhân | Mobile — nền tảng | Mobile |
| 108 | UC-HRM-MOB-04 | Ghi nhận chấm công / điểm danh | Mobile — chấm công | Mobile |
| 109 | UC-HRM-MOB-05 | Xem lịch sử chấm công | Mobile — chấm công | Mobile |
| 110 | UC-HRM-MOB-06 | Tạo đơn chỉnh sửa chấm công hoặc đơn nghỉ phép | Mobile — đơn từ | Mobile |
| 111 | UC-HRM-MOB-07 | Xem danh sách đơn và trạng thái | Mobile — đơn từ | Mobile |
| 112 | UC-HRM-MOB-08 | Phê duyệt hoặc từ chối đơn chờ | Mobile — đơn từ | Mobile |
| 113 | UC-HRM-MOB-09 | Xem tóm tắt lương theo kỳ | Mobile — lương | Mobile |
| 114 | UC-HRM-MOB-10 | Xem hợp đồng và bảo hiểm | Mobile — hợp đồng | Mobile |
| 115 | UC-HRM-MOB-11 | Quản lý công việc và yêu cầu dịch vụ | Mobile — dịch vụ | Mobile |
| 116 | UC-HRM-MOB-12 | Xem và cập nhật hồ sơ cá nhân | Mobile — hồ sơ | Mobile |
| 117 | UC-HRM-MOB-13 | Nhận thông báo (in-app / realtime / push) | Mobile — thông báo | Mobile |
| 118 | UC-HRM-MOB-14 | Làm việc ngoại tuyến có kiểm soát | Mobile — nền tảng | Mobile |
| 119 | UC-HRM-MOB-15 | Đăng xuất và thu hồi phiên | Mobile — nền tảng | Mobile |