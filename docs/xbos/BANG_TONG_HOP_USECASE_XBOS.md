# Bảng tổng hợp use case — Phân hệ XBOS

> Phiên bản: 2026-05-18

**Phạm vi:** chỉ use case **nền tảng XBOS** (Command Center, tổ chức, RACI, workflow, master, đồng bộ danh mục chung…).

---

## Thống kê nhanh

| Chỉ tiêu | Số lượng |
|----------|----------|
| **Tổng use case XBOS thuần** | **97** |
| Nền tảng và đồng bộ danh mục | 9 |
| Master data và KPI | 12 |
| Tổ chức, chức danh, phân quyền | 6 |
| Quy trình và phê duyệt | 9 |
| Tài sản và yêu cầu tài chính | 6 |
| Xác thực và phạm vi truy cập | 7 |
| Command Center — Thiết lập công ty (P0) | 8 |
| Command Center — Cấu hình mở rộng | 7 |
| Quản trị RACI | 6 |
| Bảng điều hành | 3 |
| Hạ tầng và cài đặt | 3 |
| Quản trị danh mục chung (đa phân hệ) | 18 |
| Master data toàn hệ & tích hợp FE | 3 |

### Tổng hợp toàn hệ sinh thái

| Phân hệ | Số use case |
|---------|-------------|
| Logistic (+ danh mục LOG trên XBOS) | 150 |
| HRM (+ danh mục HRM trên XBOS) | 119 |
| **XBOS nền tảng** (file này) | **97** |
| **Tổng gom 1 file** | **[`BANG_TONG_HOP_USECASE_XEVN.md`](../ecosystem/BANG_TONG_HOP_USECASE_XEVN.md) — 373** |

---

## Bảng chung (97 use case)

| STT | Mã | Tên use case | Nhóm nghiệp vụ | Kênh |
|-----|-----|--------------|----------------|------|
| 1 | UC-XBOS-01 | Kiểm tra trạng thái dịch vụ | Nền tảng và đồng bộ | API |
| 2 | UC-XBOS-02 | Khởi tạo hoặc cập nhật danh mục dùng chung | Nền tảng và đồng bộ | API |
| 3 | UC-XBOS-03 | Lấy danh mục theo tên danh mục và phân hệ đích | Nền tảng và đồng bộ | API |
| 4 | UC-XBOS-04 | Liệt kê danh mục theo phân hệ đích | Nền tảng và đồng bộ | API |
| 5 | UC-XBOS-05 | Phát hành phiên bản hợp đồng dữ liệu | Nền tảng và đồng bộ | API |
| 6 | UC-XBOS-06 | Truy vấn nhật ký kiểm toán | Nền tảng và đồng bộ | API |
| 7 | UC-XBOS-07 | Tiếp nhận cảnh báo từ phân hệ vệ tinh | Nền tảng và đồng bộ | API |
| 8 | UC-XBOS-SYNC-01 | Bootstrap hệ sinh thái XEVN (danh mục nền) | Nền tảng và đồng bộ | API |
| 9 | UC-XBOS-MET-01 | Xem chỉ số vận hành dịch vụ API | Nền tảng và đồng bộ | API |
| 10 | UC-XBOS-08 | Thêm / sửa / xóa dữ liệu master theo lĩnh vực | Master data và KPI | API |
| 11 | UC-XBOS-KPI-01 | Tính KPI đơn lẻ trên máy chủ | Master data và KPI | API |
| 12 | UC-XBOS-KPI-02 | Tính KPI theo lô trên máy chủ | Master data và KPI | API |
| 13 | UC-XBOS-KPI-03 | Tổng hợp KPI đa cấp (rollup) | Master data và KPI | API |
| 14 | UC-XBOS-KPI-04 | Phát cảnh báo KPI lên cổng điều hành | Master data và KPI | API |
| 15 | UC-XBOS-MD-01 | Quản lý chức danh (master) | Master data và KPI | Web Portal |
| 16 | UC-XBOS-MD-02 | Quản lý nhà cung cấp (master) | Master data và KPI | Web Portal |
| 17 | UC-XBOS-MD-03 | Quản lý loại chi phí (master) | Master data và KPI | Web Portal |
| 18 | UC-XBOS-MD-04 | Quản lý chỉ số KPI (master) | Master data và KPI | Web Portal |
| 19 | UC-XBOS-MD-05 | Quản lý khách hàng (master) | Master data và KPI | Web Portal |
| 20 | UC-XBOS-MD-06 | Quản lý đối tác (master) | Master data và KPI | Web Portal |
| 21 | UC-XBOS-MD-07 | Quản lý loại xe / tài sản (master) | Master data và KPI | Web Portal |
| 22 | UC-XBOS-10 | Nâng mảng kinh doanh thành công ty con | Tổ chức, chức danh, phân quyền | API / Web |
| 23 | UC-XBOS-11 | Quản lý mẫu chức danh và gán vị trí (kiêm nhiệm) | Tổ chức, chức danh, phân quyền | API / Web |
| 24 | UC-XBOS-12 | Gán hoặc thu hồi quyền; kiểm tra xung đột quyền | Tổ chức, chức danh, phân quyền | API / Web |
| 25 | UC-XBOS-ORG-01 | Xem và sửa cây pháp nhân / đơn vị tổ chức | Tổ chức, chức danh, phân quyền | Web Portal |
| 26 | UC-XBOS-ORG-02 | Thêm / sửa / xóa phòng ban (đơn vị tổ chức) | Tổ chức, chức danh, phân quyền | Web Portal |
| 27 | UC-XBOS-ORG-03 | Lưu hồ sơ pháp nhân (mã số thuế, đại diện, vốn…) | Tổ chức, chức danh, phân quyền | Web Portal |
| 28 | UC-XBOS-13 | Định nghĩa quy trình (workflow) | Quy trình và phê duyệt | API / Web |
| 29 | UC-XBOS-14 | Chạy quy trình — phê duyệt từng vai (multi-hat) | Quy trình và phê duyệt | API / Web |
| 30 | UC-XBOS-15 | Cấu hình tuyến báo cáo và tổng hợp kết quả quy trình | Quy trình và phê duyệt | API / Web |
| 31 | UC-XBOS-WF-01 | Lưu sơ đồ quy trình trên canvas | Quy trình và phê duyệt | Web Portal |
| 32 | UC-XBOS-WF-02 | Xem danh sách phiên bản quy trình | Quy trình và phê duyệt | Web Portal |
| 33 | UC-XBOS-WF-03 | Khởi tạo phiên chạy quy trình | Quy trình và phê duyệt | API / Web |
| 34 | UC-XBOS-WF-04 | Hoàn thành bước phê duyệt trong phiên | Quy trình và phê duyệt | API / Web |
| 35 | UC-XBOS-WF-05 | Xem chi tiết phiên và các bước đang chờ | Quy trình và phê duyệt | API / Web |
| 36 | UC-XBOS-WF-06 | Từ chối bước phê duyệt trong phiên | Quy trình và phê duyệt | API / Web |
| 37 | UC-XBOS-16 | Yêu cầu tài sản — quy trình xác nhận kế toán (5 bước) | Tài sản và yêu cầu tài chính | API / Web |
| 38 | UC-XBOS-AR-01 | Danh sách yêu cầu tài sản | Tài sản và yêu cầu tài chính | API / Web |
| 39 | UC-XBOS-AR-02 | Tạo yêu cầu tài sản mới | Tài sản và yêu cầu tài chính | API / Web |
| 40 | UC-XBOS-AR-03 | Chuyển trạng thái yêu cầu tài sản | Tài sản và yêu cầu tài chính | API / Web |
| 41 | UC-XBOS-AST-01 | Đăng ký tài sản | Tài sản và yêu cầu tài chính | API / Web |
| 42 | UC-XBOS-AST-02 | Theo dõi vòng đời tài sản | Tài sản và yêu cầu tài chính | API / Web |
| 43 | UC-XBOS-AUTH-01 | Đăng nhập cổng Web Portal | Xác thực và phạm vi | Web Portal |
| 44 | UC-XBOS-AUTH-02 | Xem thông tin phiên đăng nhập | Xác thực và phạm vi | API / Web |
| 45 | UC-XBOS-TENANT-01 | Liệt kê tenant / công ty người dùng được truy cập | Xác thực và phạm vi | API / Web |
| 46 | UC-XBOS-TENANT-02 | Xem tổng quan tổ chức tập đoàn theo quyền | Xác thực và phạm vi | API / Web |
| 47 | UC-XBOS-TENANT-03 | Liệt kê đơn vị thành viên trong tập đoàn | Xác thực và phạm vi | API / Web |
| 48 | UC-ECO-SCOPE-01 | Truy cập khi chưa đăng nhập (phạm vi quản trị hệ thống) | Xác thực và phạm vi | Web Portal |
| 49 | UC-ECO-SCOPE-02 | Truy cập khi đã đăng nhập (một tenant) | Xác thực và phạm vi | Web Portal |
| 50 | UC-CC-P0-01 | Quản lý cổ đông theo pháp nhân | Command Center P0 | Web Portal |
| 51 | UC-CC-P0-02 | Quản lý tài liệu pháp lý và tải / xem file | Command Center P0 | Web Portal |
| 52 | UC-CC-P0-03 | Lưu và xóa phòng ban | Command Center P0 | Web Portal |
| 53 | UC-CC-P0-04 | Ma trận phân quyền theo vai trò | Command Center P0 | Web Portal |
| 54 | UC-CC-P0-05 | Danh mục văn bản / đo lường / giá (Command Center) | Command Center P0 | Web Portal |
| 55 | UC-CC-P0-06 | Hộp thư — mở chi tiết tác vụ quy trình | Command Center P0 | Web Portal |
| 56 | UC-CC-P0-08 | Thông tin tổng quan không gian làm việc | Command Center P0 | Web Portal |
| 57 | UC-CC-P0-09 | Chính sách hiển thị dữ liệu tạm khi API chưa sẵn sàng | Command Center P0 | Web Portal |
| 58 | UC-CC-01 | Cấu hình phòng ban theo từng pháp nhân | Command Center mở rộng | Web Portal |
| 59 | UC-CC-03 | Chi tiết đơn vị thành viên — hồ sơ pháp nhân và RACI | Command Center mở rộng | Web Portal |
| 60 | UC-CC-04 | Lưu thông tin pháp nhân | Command Center mở rộng | Web Portal |
| 61 | UC-XBOS-CC-05 | Thanh điều hành — KPI / tác vụ / cảnh báo | Command Center mở rộng | Web Portal |
| 62 | UC-XBOS-CC-06 | Canvas quy trình | Command Center mở rộng | Web Portal |
| 63 | UC-XBOS-CC-07 | Hạ tầng — danh mục nền | Command Center mở rộng | Web Portal |
| 64 | UC-XBOS-CC-08 | Hệ thống phòng ban mẫu | Command Center mở rộng | Web Portal |
| 65 | UC-RACI-01 | Xem danh mục hoạt động RACI theo khối nghiệp vụ | Quản trị RACI | Web Portal |
| 66 | UC-RACI-02 | Xem và chỉnh ma trận RACI tại chi tiết pháp nhân | Quản trị RACI | Web Portal |
| 67 | UC-RACI-03 | Xem ánh xạ chức năng phân hệ cho hoạt động | Quản trị RACI | Web Portal |
| 68 | UC-RACI-04 | Gán cột RACI với chức danh | Quản trị RACI | Web Portal |
| 69 | UC-RACI-05 | Nhập hoặc nâng phiên bản catalog RACI | Quản trị RACI | API |
| 70 | UC-RACI-06 | Báo cáo độ phủ số hóa theo công ty | Quản trị RACI | Web Portal |
| 71 | UC-XBOS-DASH-01 | Cockpit tổng hợp KPI điều hành | Bảng điều hành | Web Portal |
| 72 | UC-XBOS-DASH-02 | Bảng KPI theo công ty | Bảng điều hành | Web Portal |
| 73 | UC-XBOS-DASH-03 | Chính sách KPI | Bảng điều hành | Web Portal |
| 74 | UC-XBOS-INF-01 | Xem và sửa cấu hình hạ tầng danh mục nền | Hạ tầng và cài đặt | Web Portal |
| 75 | UC-XBOS-INF-02 | Quản lý mẫu siêu dữ liệu theo pháp nhân | Hạ tầng và cài đặt | Web Portal |
| 76 | UC-XBOS-INF-03 | Xem tóm tắt trạng thái hạ tầng danh mục | Hạ tầng và cài đặt | API / Web |
| 77 | XBOS-DM-01 | Xem tổng quan danh mục theo phân hệ | Quản trị danh mục chung | XBOS |
| 78 | XBOS-DM-02 | Tạo nhóm danh mục | Quản trị danh mục chung | XBOS |
| 79 | XBOS-DM-03 | Thêm giá trị danh mục | Quản trị danh mục chung | XBOS |
| 80 | XBOS-DM-04 | Sửa giá trị danh mục | Quản trị danh mục chung | XBOS |
| 81 | XBOS-DM-05 | Ngừng hoặc kích hoạt giá trị | Quản trị danh mục chung | XBOS |
| 82 | XBOS-DM-06 | Sắp xếp phân cấp cha–con | Quản trị danh mục chung | XBOS |
| 83 | XBOS-DM-07 | Gán danh mục cho phân hệ đích | Quản trị danh mục chung | XBOS |
| 84 | XBOS-DM-08 | Gán danh mục theo công ty | Quản trị danh mục chung | XBOS |
| 85 | XBOS-DM-09 | Sao chép bộ danh mục | Quản trị danh mục chung | XBOS |
| 86 | XBOS-DM-10 | Xuất danh mục | Quản trị danh mục chung | XBOS |
| 87 | XBOS-DM-11 | Nhập danh mục từ file | Quản trị danh mục chung | XBOS |
| 88 | XBOS-DM-12 | Gửi phê duyệt thay đổi nhạy cảm | Quản trị danh mục chung | XBOS |
| 89 | XBOS-DM-13 | Phê duyệt hoặc từ chối | Quản trị danh mục chung | XBOS |
| 90 | XBOS-DM-14 | Xem lịch sử thay đổi | Quản trị danh mục chung | XBOS |
| 91 | XBOS-DM-15 | Yêu cầu bổ sung trường (công ty con) | Quản trị danh mục chung | XBOS |
| 92 | XBOS-DM-16 | Yêu cầu xóa trường — phê duyệt tập đoàn | Quản trị danh mục chung | XBOS |
| 93 | XBOS-DM-17 | Phát hành phiên bản danh mục | Quản trị danh mục chung | XBOS |
| 94 | XBOS-DM-18 | Thông báo phân hệ có danh mục mới | Quản trị danh mục chung | XBOS |
| 95 | UC-ECO-MASTER-01 | Quản lý master data theo tenant và công ty | Master toàn hệ | API / Web |
| 96 | UC-ECO-MASTER-02 | Mở rộng tenant mới với tenant master | Master toàn hệ | API |
| 97 | UC-ECO-FE-01 | Thay thế dữ liệu giả lập trên Web Portal bằng API thật | Tích hợp FE | Web Portal |

---

