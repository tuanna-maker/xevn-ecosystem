# UC Inventory — Phase1 (245 + MFD delta) · squad by STT

SoT: docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md

> **MFD add 2026-08-04 (U87):** `HRM-AT-14` — by-uc pack CFG rules/columns/sheets · `PO-MFD-M1-ATT-AT14-BYUC-01` · không tăng STT Phase1 matrix 245; alias SRS FR-HRM-AT-14 + MFD scope.

| STT | UC | Name | Squad |
|----:|----|------|-------|
| 1 | `UC-XBOS-01` | Kiểm tra trạng thái dịch vụ | W1-S1-XBOS-CORE |
| 2 | `UC-XBOS-02` | Khởi tạo hoặc cập nhật danh mục dùng chung | W1-S1-XBOS-CORE |
| 3 | `UC-XBOS-03` | Lấy danh mục theo tên danh mục và phân hệ đích | W1-S1-XBOS-CORE |
| 4 | `UC-XBOS-04` | Liệt kê danh mục theo phân hệ đích | W1-S1-XBOS-CORE |
| 5 | `UC-XBOS-05` | Phát hành phiên bản hợp đồng dữ liệu | W1-S1-XBOS-CORE |
| 6 | `UC-XBOS-06` | Truy vấn nhật ký kiểm toán | W1-S1-XBOS-CORE |
| 7 | `UC-XBOS-07` | Tiếp nhận cảnh báo từ phân hệ vệ tinh | W1-S1-XBOS-CORE |
| 8 | `UC-XBOS-SYNC-01` | Bootstrap hệ sinh thái XEVN (danh mục nền) | W1-S1-XBOS-CORE |
| 9 | `UC-XBOS-MET-01` | Xem chỉ số vận hành dịch vụ API | W1-S1-XBOS-CORE |
| 10 | `UC-XBOS-08` | Thêm / sửa / xóa dữ liệu master theo lĩnh vực | W1-S1-XBOS-CORE |
| 11 | `UC-XBOS-KPI-01` | Tính KPI đơn lẻ trên máy chủ | W1-S1-XBOS-CORE |
| 12 | `UC-XBOS-KPI-02` | Tính KPI theo lô trên máy chủ | W1-S1-XBOS-CORE |
| 13 | `UC-XBOS-KPI-03` | Tổng hợp KPI đa cấp (rollup) | W1-S1-XBOS-CORE |
| 14 | `UC-XBOS-KPI-04` | Phát cảnh báo KPI lên cổng điều hành | W1-S1-XBOS-CORE |
| 15 | `UC-XBOS-MD-01` | Quản lý chức danh (master) | W1-S1-XBOS-CORE |
| 16 | `UC-XBOS-MD-02` | Quản lý nhà cung cấp (master) | W1-S1-XBOS-CORE |
| 17 | `UC-XBOS-MD-03` | Quản lý loại chi phí (master) | W1-S1-XBOS-CORE |
| 18 | `UC-XBOS-MD-04` | Quản lý chỉ số KPI (master) | W1-S1-XBOS-CORE |
| 19 | `UC-XBOS-MD-05` | Quản lý khách hàng (master) | W1-S1-XBOS-CORE |
| 20 | `UC-XBOS-MD-06` | Quản lý đối tác (master) | W1-S1-XBOS-CORE |
| 21 | `UC-XBOS-MD-07` | Quản lý loại xe / tài sản (master) | W1-S1-XBOS-CORE |
| 22 | `UC-XBOS-10` | Nâng mảng kinh doanh thành công ty con | W1-S1-XBOS-CORE |
| 23 | `UC-XBOS-11` | Quản lý mẫu chức danh và gán vị trí (kiêm nhiệm) | W1-S1-XBOS-CORE |
| 24 | `UC-XBOS-12` | Gán hoặc thu hồi quyền; kiểm tra xung đột quyền | W1-S1-XBOS-CORE |
| 25 | `UC-XBOS-ORG-01` | Xem và sửa cây pháp nhân / đơn vị tổ chức | W1-S1-XBOS-CORE |
| 26 | `UC-XBOS-ORG-02` | Thêm / sửa / xóa phòng ban (đơn vị tổ chức) | W1-S1-XBOS-CORE |
| 27 | `UC-XBOS-ORG-03` | Lưu hồ sơ pháp nhân (mã số thuế, đại diện, vốn…) | W1-S1-XBOS-CORE |
| 28 | `UC-XBOS-13` | Định nghĩa quy trình (workflow) | W1-S1-XBOS-CORE |
| 29 | `UC-XBOS-14` | Chạy quy trình — phê duyệt từng vai (multi-hat) | W1-S1-XBOS-CORE |
| 30 | `UC-XBOS-15` | Cấu hình tuyến báo cáo và tổng hợp kết quả quy t… | W1-S1-XBOS-CORE |
| 31 | `UC-XBOS-WF-01` | Lưu sơ đồ quy trình trên canvas | W1-S1-XBOS-CORE |
| 32 | `UC-XBOS-WF-02` | Xem danh sách phiên bản quy trình | W1-S1-XBOS-CORE |
| 33 | `UC-XBOS-WF-03` | Khởi tạo phiên chạy quy trình | W1-S1-XBOS-CORE |
| 34 | `UC-XBOS-WF-04` | Hoàn thành bước phê duyệt trong phiên | W1-S1-XBOS-CORE |
| 35 | `UC-XBOS-WF-05` | Xem chi tiết phiên và các bước đang chờ | W1-S1-XBOS-CORE |
| 36 | `UC-XBOS-WF-06` | Từ chối bước phê duyệt trong phiên | W1-S1-XBOS-CORE |
| 37 | `UC-XBOS-16` | Yêu cầu tài sản — quy trình xác nhận kế toán (5 … | W1-S1-XBOS-CORE |
| 38 | `UC-XBOS-AR-01` | Danh sách yêu cầu tài sản | W1-S1-XBOS-CORE |
| 39 | `UC-XBOS-AR-02` | Tạo yêu cầu tài sản mới | W1-S1-XBOS-CORE |
| 40 | `UC-XBOS-AR-03` | Chuyển trạng thái yêu cầu tài sản | W1-S1-XBOS-CORE |
| 41 | `UC-XBOS-AST-01` | Đăng ký tài sản | W1-S2-XBOS-ORG-WF |
| 42 | `UC-XBOS-AST-02` | Theo dõi vòng đời tài sản | W1-S2-XBOS-ORG-WF |
| 43 | `UC-XBOS-AUTH-01` | Đăng nhập cổng Web Portal | W1-S2-XBOS-ORG-WF |
| 44 | `UC-XBOS-AUTH-02` | Xem thông tin phiên đăng nhập | W1-S2-XBOS-ORG-WF |
| 45 | `UC-XBOS-TENANT-01` | Liệt kê tenant / công ty người dùng được truy cập | W1-S2-XBOS-ORG-WF |
| 46 | `UC-XBOS-TENANT-02` | Xem tổng quan tổ chức tập đoàn theo quyền | W1-S2-XBOS-ORG-WF |
| 47 | `UC-XBOS-TENANT-03` | Liệt kê đơn vị thành viên trong tập đoàn | W1-S2-XBOS-ORG-WF |
| 48 | `UC-ECO-SCOPE-01` | Truy cập khi chưa đăng nhập (phạm vi quản trị hệ… | W1-S2-XBOS-ORG-WF |
| 49 | `UC-ECO-SCOPE-02` | Truy cập khi đã đăng nhập (một tenant) | W1-S2-XBOS-ORG-WF |
| 50 | `UC-CC-P0-01` | Quản lý cổ đông theo pháp nhân | W1-S2-XBOS-ORG-WF |
| 51 | `UC-CC-P0-02` | Quản lý tài liệu pháp lý và tải / xem file | W1-S2-XBOS-ORG-WF |
| 52 | `UC-CC-P0-03` | Lưu và xóa phòng ban | W1-S2-XBOS-ORG-WF |
| 53 | `UC-CC-P0-04` | Ma trận phân quyền theo vai trò | W1-S2-XBOS-ORG-WF |
| 54 | `UC-CC-P0-05` | Danh mục văn bản / đo lường / giá (Command Center) | W1-S2-XBOS-ORG-WF |
| 55 | `UC-CC-P0-06` | Hộp thư — mở chi tiết tác vụ quy trình | W1-S2-XBOS-ORG-WF |
| 56 | `UC-CC-P0-08` | Thông tin tổng quan không gian làm việc | W1-S2-XBOS-ORG-WF |
| 57 | `UC-CC-P0-09` | Chính sách hiển thị dữ liệu tạm khi API chưa sẵn… | W1-S2-XBOS-ORG-WF |
| 58 | `UC-CC-01` | Cấu hình phòng ban theo từng pháp nhân | W1-S2-XBOS-ORG-WF |
| 59 | `UC-CC-03` | Chi tiết đơn vị thành viên — hồ sơ pháp nhân và … | W1-S2-XBOS-ORG-WF |
| 60 | `UC-CC-04` | Lưu thông tin pháp nhân | W1-S2-XBOS-ORG-WF |
| 61 | `UC-XBOS-CC-05` | Thanh điều hành — KPI / tác vụ / cảnh báo | W1-S2-XBOS-ORG-WF |
| 62 | `UC-XBOS-CC-06` | Canvas quy trình | W1-S2-XBOS-ORG-WF |
| 63 | `UC-XBOS-CC-07` | Hạ tầng — danh mục nền | W1-S2-XBOS-ORG-WF |
| 64 | `UC-XBOS-CC-08` | Hệ thống phòng ban mẫu | W1-S2-XBOS-ORG-WF |
| 65 | `UC-RACI-01` | Xem danh mục hoạt động RACI theo khối nghiệp vụ | W1-S2-XBOS-ORG-WF |
| 66 | `UC-RACI-02` | Xem và chỉnh ma trận RACI tại chi tiết pháp nhân | W1-S2-XBOS-ORG-WF |
| 67 | `UC-RACI-03` | Xem ánh xạ chức năng phân hệ cho hoạt động | W1-S2-XBOS-ORG-WF |
| 68 | `UC-RACI-04` | Gán cột RACI với chức danh | W1-S2-XBOS-ORG-WF |
| 69 | `UC-RACI-05` | Nhập hoặc nâng phiên bản catalog RACI | W1-S2-XBOS-ORG-WF |
| 70 | `UC-RACI-06` | Báo cáo độ phủ số hóa theo công ty | W1-S2-XBOS-ORG-WF |
| 71 | `UC-XBOS-DASH-01` | Cockpit tổng hợp KPI điều hành | W1-S2-XBOS-ORG-WF |
| 72 | `UC-XBOS-DASH-02` | Bảng KPI theo công ty | W1-S2-XBOS-ORG-WF |
| 73 | `UC-XBOS-DASH-03` | Chính sách KPI | W1-S2-XBOS-ORG-WF |
| 74 | `UC-XBOS-INF-01` | Xem và sửa cấu hình hạ tầng danh mục nền | W1-S2-XBOS-ORG-WF |
| 75 | `UC-XBOS-INF-02` | Quản lý mẫu siêu dữ liệu theo pháp nhân | W1-S2-XBOS-ORG-WF |
| 76 | `UC-XBOS-INF-03` | Xem tóm tắt trạng thái hạ tầng danh mục | W1-S2-XBOS-ORG-WF |
| 77 | `XBOS-DM-01` | Xem tổng quan danh mục theo phân hệ | W1-S2-XBOS-ORG-WF |
| 78 | `XBOS-DM-02` | Tạo nhóm danh mục | W1-S2-XBOS-ORG-WF |
| 79 | `XBOS-DM-03` | Thêm giá trị danh mục | W1-S2-XBOS-ORG-WF |
| 80 | `XBOS-DM-04` | Sửa giá trị danh mục | W1-S2-XBOS-ORG-WF |
| 81 | `XBOS-DM-05` | Ngừng hoặc kích hoạt giá trị | W1-S3-XBOS-CAT-TAIL |
| 82 | `XBOS-DM-06` | Sắp xếp phân cấp cha–con | W1-S3-XBOS-CAT-TAIL |
| 83 | `XBOS-DM-07` | Gán danh mục cho phân hệ đích | W1-S3-XBOS-CAT-TAIL |
| 84 | `XBOS-DM-08` | Gán danh mục theo công ty | W1-S3-XBOS-CAT-TAIL |
| 85 | `XBOS-DM-09` | Sao chép bộ danh mục | W1-S3-XBOS-CAT-TAIL |
| 86 | `XBOS-DM-10` | Xuất danh mục | W1-S3-XBOS-CAT-TAIL |
| 87 | `XBOS-DM-11` | Nhập danh mục từ file | W1-S3-XBOS-CAT-TAIL |
| 88 | `XBOS-DM-12` | Gửi phê duyệt thay đổi nhạy cảm | W1-S3-XBOS-CAT-TAIL |
| 89 | `XBOS-DM-13` | Phê duyệt hoặc từ chối | W1-S3-XBOS-CAT-TAIL |
| 90 | `XBOS-DM-14` | Xem lịch sử thay đổi | W1-S3-XBOS-CAT-TAIL |
| 91 | `XBOS-DM-15` | Yêu cầu bổ sung trường (công ty con) | W1-S3-XBOS-CAT-TAIL |
| 92 | `XBOS-DM-16` | Yêu cầu xóa trường — phê duyệt tập đoàn | W1-S3-XBOS-CAT-TAIL |
| 93 | `XBOS-DM-17` | Phát hành phiên bản danh mục | W1-S3-XBOS-CAT-TAIL |
| 94 | `XBOS-DM-18` | Thông báo phân hệ có danh mục mới | W1-S3-XBOS-CAT-TAIL |
| 95 | `UC-ECO-MASTER-01` | Quản lý master data theo tenant và công ty | W1-S3-XBOS-CAT-TAIL |
| 96 | `UC-ECO-MASTER-02` | Mở rộng tenant mới với tenant master | W1-S3-XBOS-CAT-TAIL |
| 97 | `UC-ECO-FE-01` | Thay thế dữ liệu giả lập trên Web Portal bằng AP… | W1-S3-XBOS-CAT-TAIL |
| 98 | `XBOS-DM-LOG-01` | Xem tổng quan danh mục theo phân hệ Logistic | W1-S4-DM-LOG |
| 99 | `XBOS-DM-LOG-02` | Tạo nhóm danh mục mới | W1-S4-DM-LOG |
| 100 | `XBOS-DM-LOG-03` | Thêm giá trị vào danh mục | W1-S4-DM-LOG |
| 101 | `XBOS-DM-LOG-04` | Sửa giá trị danh mục | W1-S4-DM-LOG |
| 102 | `XBOS-DM-LOG-05` | Ngừng hoặc kích hoạt giá trị | W1-S4-DM-LOG |
| 103 | `XBOS-DM-LOG-06` | Sắp xếp phân cấp cha–con | W1-S4-DM-LOG |
| 104 | `XBOS-DM-LOG-07` | Gán danh mục cho phân hệ Logistic | W1-S4-DM-LOG |
| 105 | `XBOS-DM-LOG-08` | Gán danh mục theo công ty thành viên | W1-S4-DM-LOG |
| 106 | `XBOS-DM-LOG-09` | Sao chép bộ danh mục sang công ty mới | W1-S4-DM-LOG |
| 107 | `XBOS-DM-LOG-10` | Xuất danh mục ra file | W1-S4-DM-LOG |
| 108 | `XBOS-DM-LOG-11` | Nhập danh mục từ file mẫu | W1-S4-DM-LOG |
| 109 | `XBOS-DM-LOG-12` | Gửi phê duyệt khi sửa danh mục nhạy cảm | W1-S4-DM-LOG |
| 110 | `XBOS-DM-LOG-13` | Phê duyệt hoặc từ chối thay đổi danh mục | W1-S4-DM-LOG |
| 111 | `XBOS-DM-LOG-14` | Xem lịch sử thay đổi danh mục | W1-S4-DM-LOG |
| 112 | `XBOS-DM-LOG-15` | Công ty con yêu cầu bổ sung trường danh mục | W1-S4-DM-LOG |
| 113 | `XBOS-DM-LOG-16` | Công ty con yêu cầu xóa trường — chuyển phê duyệ… | W1-S4-DM-LOG |
| 114 | `XBOS-DM-LOG-17` | Phát hành phiên bản danh mục mới | W1-S4-DM-LOG |
| 115 | `XBOS-DM-LOG-18` | Thông báo phân hệ Logistic có danh mục mới | W1-S4-DM-LOG |
| 116 | `XBOS-DM-LOG-19` | Kiểm tra danh mục thiếu trước vận hành | W1-S4-DM-LOG |
| 117 | `XBOS-DM-LOG-20` | Khai báo đủ 3 tầng dịch vụ vận tải | W1-S4-DM-LOG |
| 118 | `XBOS-DM-LOG-21` | Khai báo đủ 3 tầng loại phương tiện | W1-S4-DM-LOG |
| 119 | `XBOS-DM-LOG-22` | Rà soát sản phẩm dịch vụ chưa gắn bảng giá | W1-S4-DM-LOG |
| 248 | `XBOS-DM-HRM-01` | Xem tổng quan danh mục theo phân hệ Nhân sự | W1-S5-HRM-A |
| 249 | `XBOS-DM-HRM-02` | Cấu hình 6 nhóm trường hồ sơ nhân viên | W1-S5-HRM-A |
| 250 | `XBOS-DM-HRM-03` | Bổ sung trường mở rộng theo công ty | W1-S5-HRM-A |
| 251 | `XBOS-DM-HRM-04` | Gửi phê duyệt khi công ty con thêm hoặc xóa trường | W1-S5-HRM-A |
| 252 | `XBOS-DM-HRM-05` | Phê duyệt hoặc từ chối mở rộng danh mục | W1-S5-HRM-A |
| 253 | `XBOS-DM-HRM-06` | Khai bộ phòng ban và chức vụ theo từng công ty | W1-S5-HRM-A |
| 254 | `XBOS-DM-HRM-07` | Sao chép thư viện chức danh sang công ty con | W1-S5-HRM-A |
| 255 | `XBOS-DM-HRM-08` | Gán danh mục cho phân hệ Nhân sự | W1-S5-HRM-A |
| 256 | `XBOS-DM-HRM-09` | Phát hành phiên bản danh mục mới | W1-S5-HRM-A |
| 257 | `XBOS-DM-HRM-10` | Đồng bộ danh mục xuống HRM | W1-S5-HRM-A |
| 258 | `XBOS-DM-HRM-11` | Kiểm tra danh mục thiếu trước import nhân sự | W1-S5-HRM-A |
| 259 | `XBOS-DM-HRM-12` | Cấu hình preset biểu mẫu theo công ty (Command C… | W1-S5-HRM-A |
| 260 | `XBOS-DM-HRM-13` | Khai danh mục hồ sơ xe (du lịch) | W1-S5-HRM-A |
| 261 | `XBOS-DM-HRM-14` | Gán mã quy trình cho loại đơn HRM | W1-S5-HRM-A |
| 262 | `XBOS-DM-HRM-15` | Xem lịch sử thay đổi danh mục | W1-S5-HRM-A |
| 263 | `UC-HRM-01` | Kiểm tra trạng thái dịch vụ | W1-S5-HRM-A |
| 264 | `UC-HRM-02` | Tạo quản trị nền tảng | W1-S5-HRM-A |
| 265 | `UC-HRM-03` | Tạo hoặc cập nhật quản trị doanh nghiệp | W1-S5-HRM-A |
| 266 | `UC-HRM-04` | Mời nhân viên hàng loạt | W1-S5-HRM-A |
| 267 | `UC-HRM-05` | Cập nhật thông tin nhạy cảm tài khoản | W1-S5-HRM-A |
| 268 | `UC-HRM-06` | Đồng bộ dữ liệu dùng chung từ XBOS | W1-S5-HRM-A |
| 269 | `UC-HRM-07` | Lấy dữ liệu dùng chung theo khóa danh mục | W1-S5-HRM-A |
| 270 | `UC-HRM-08` | Liệt kê dữ liệu dùng chung theo phân hệ | W1-S5-HRM-A |
| 271 | `HRM-AT-01` | Ghi nhận bản ghi chấm công | W1-S5-HRM-A |
| 272 | `HRM-AT-02` | Xem danh sách bản ghi chấm công | W1-S5-HRM-A |
| 273 | `HRM-AT-03` | Cập nhật trạng thái bản ghi chấm công | W1-S5-HRM-A |
| 274 | `HRM-AT-04` | Tạo đơn chỉnh sửa chấm công | W1-S5-HRM-A |
| 275 | `HRM-AT-05` | Xem danh sách đơn chỉnh sửa chấm công | W1-S5-HRM-A |
| 276 | `HRM-AT-06` | Sửa đơn chỉnh sửa chấm công | W1-S5-HRM-A |
| 277 | `HRM-AT-07` | Phê duyệt đơn chỉnh sửa chấm công | W1-S5-HRM-A |
| 278 | `HRM-AT-08` | Từ chối đơn chỉnh sửa chấm công | W1-S5-HRM-A |
| 279 | `HRM-AT-09` | Xóa đơn chỉnh sửa chấm công | W1-S5-HRM-A |
| 280 | `HRM-AT-10` | Tạo đơn nghỉ phép | W1-S5-HRM-A |
| 281 | `HRM-AT-11` | Xem danh sách đơn nghỉ phép | W1-S5-HRM-A |
| 282 | `HRM-AT-12` | Phê duyệt đơn nghỉ phép | W1-S5-HRM-A |
| 283 | `HRM-AT-13` | Từ chối đơn nghỉ phép | W1-S5-HRM-A |
| MFD | `HRM-AT-14` | Cấu hình quy tắc & bảng công (CFG persist · U87) | PO-MFD-M1-ATT-AT14-BYUC-01 |
| 284 | `HRM-SV-01` | Tạo yêu cầu dịch vụ nội bộ | W1-S5-HRM-A |
| 285 | `HRM-SV-02` | Xem danh sách yêu cầu dịch vụ | W1-S5-HRM-A |
| 286 | `HRM-SV-03` | Cập nhật yêu cầu dịch vụ | W1-S5-HRM-A |
| 287 | `HRM-SV-04` | Xóa yêu cầu dịch vụ | W1-S5-HRM-A |
| 288 | `HRM-SV-05` | Phê duyệt yêu cầu dịch vụ | W1-S5-HRM-A |
| 289 | `HRM-SV-06` | Từ chối yêu cầu dịch vụ | W1-S5-HRM-A |
| 290 | `UC-HRM-12` | Đọc hộp thư thông báo nghiệp vụ | W1-S5-HRM-A |
| 291 | `HRM-NT-01` | Đánh dấu thông báo đã đọc | W1-S5-HRM-A |
| 292 | `HRM-NT-02` | Đăng ký token thông báo đẩy (mobile) | W1-S5-HRM-A |
| 293 | `HRM-EM-01` | Tạo hồ sơ nhân viên | W1-S5-HRM-A |
| 294 | `HRM-EM-02` | Xem danh sách nhân viên | W1-S5-HRM-A |
| 295 | `HRM-EM-03` | Cập nhật hồ sơ nhân viên | W1-S5-HRM-A |
| 296 | `HRM-EM-04` | Lưu trữ (xóa mềm) nhân viên | W1-S5-HRM-A |
| 297 | `HRM-EM-05` | Khôi phục nhân viên đã lưu trữ | W1-S5-HRM-A |
| 298 | `HRM-PR-01` | Tạo kỳ lương | W1-S5-HRM-A |
| 299 | `HRM-PR-02` | Xem danh sách kỳ lương | W1-S5-HRM-A |
| 300 | `HRM-PR-03` | Xử lý tính lương theo kỳ | W1-S5-HRM-A |
| 301 | `HRM-PR-04` | Chốt kỳ lương | W1-S6-HRM-B-MOB |
| 302 | `HRM-PR-05` | Xem phiếu lương | W1-S6-HRM-B-MOB |
| 303 | `HRM-PR-06` | Báo cáo đối soát lương | W1-S6-HRM-B-MOB |
| 304 | `HRM-RC-01` | Tạo yêu cầu tuyển dụng | W1-S6-HRM-B-MOB |
| 305 | `HRM-RC-02` | Xem danh sách yêu cầu tuyển dụng | W1-S6-HRM-B-MOB |
| 306 | `HRM-RC-03` | Tạo hồ sơ ứng viên | W1-S6-HRM-B-MOB |
| 307 | `HRM-RC-04` | Xem danh sách ứng viên | W1-S6-HRM-B-MOB |
| 308 | `HRM-RC-05` | Lên lịch phỏng vấn | W1-S6-HRM-B-MOB |
| 309 | `HRM-RC-06` | Cập nhật kết quả phỏng vấn | W1-S6-HRM-B-MOB |
| 310 | `HRM-CI-01` | Tạo hợp đồng lao động | W1-S6-HRM-B-MOB |
| 311 | `HRM-CI-02` | Ghi nhận bảo hiểm nhân viên | W1-S6-HRM-B-MOB |
| 312 | `HRM-CI-03` | Xem danh sách hợp đồng | W1-S6-HRM-B-MOB |
| 313 | `HRM-CI-04` | Cảnh báo hợp đồng sắp hết hạn | W1-S6-HRM-B-MOB |
| 314 | `HRM-CI-05` | Cập nhật hợp đồng | W1-S6-HRM-B-MOB |
| 315 | `HRM-CI-06` | Xóa hợp đồng | W1-S6-HRM-B-MOB |
| 316 | `HRM-CI-07` | Cảnh báo bảo hiểm sắp hết hạn | W1-S6-HRM-B-MOB |
| 317 | `HRM-MD-01` | Gửi yêu cầu thay đổi metadata hồ sơ | W1-S6-HRM-B-MOB |
| 318 | `HRM-MD-02` | Xem hàng chờ thay đổi metadata | W1-S6-HRM-B-MOB |
| 319 | `HRM-MD-03` | Phê duyệt thay đổi metadata | W1-S6-HRM-B-MOB |
| 320 | `HRM-MD-04` | Từ chối thay đổi metadata | W1-S6-HRM-B-MOB |
| 321 | `HRM-MD-05` | Xem nhật ký thay đổi metadata | W1-S6-HRM-B-MOB |
| 322 | `HRM-SC-01` | Xem tổng quan danh mục cấu hình HRM | W1-S6-HRM-B-MOB |
| 323 | `HRM-SC-02` | Đồng bộ toàn bộ danh mục từ XBOS | W1-S6-HRM-B-MOB |
| 324 | `HRM-SC-03` | Bổ sung giá trị danh mục mở rộng | W1-S6-HRM-B-MOB |
| 325 | `HRM-SC-04` | Yêu cầu xóa trường danh mục | W1-S6-HRM-B-MOB |
| 326 | `HRM-SC-05` | Phê duyệt lô mở rộng danh mục | W1-S6-HRM-B-MOB |
| 327 | `HRM-SC-06` | Từ chối lô mở rộng danh mục | W1-S6-HRM-B-MOB |
| 328 | `HRM-SC-07` | Khởi tạo mẫu import nhân sự tập đoàn | W1-S6-HRM-B-MOB |
| 329 | `HRM-SC-08` | Khởi tạo danh mục phòng ban – chức vụ theo công ty | W1-S6-HRM-B-MOB |
| 330 | `HRM-SC-09` | Khởi tạo danh mục hồ sơ xe du lịch | W1-S6-HRM-B-MOB |
| 331 | `HRM-IM-01` | Xem trước import nhân sự từ file | W1-S6-HRM-B-MOB |
| 332 | `HRM-IM-02` | Xác nhận import nhân sự | W1-S6-HRM-B-MOB |
| 333 | `HRM-IM-03` | Export danh sách nhân sự | W1-S6-HRM-B-MOB |
| 334 | `HRM-IM-04` | Tải file mẫu import | W1-S6-HRM-B-MOB |
| 335 | `HRM-OP-01` | Tạo công việc vận hành | W1-S6-HRM-B-MOB |
| 336 | `HRM-OP-02` | Xem danh sách công việc | W1-S6-HRM-B-MOB |
| 337 | `HRM-OP-03` | Cập nhật trạng thái công việc | W1-S6-HRM-B-MOB |
| 338 | `HRM-OP-04` | Báo cáo tổng hợp công việc | W1-S6-HRM-B-MOB |
| 339 | `HRM-PF-01` | Tạo chu kỳ đánh giá hiệu suất | W1-S6-HRM-B-MOB |
| 340 | `HRM-PF-02` | Xem danh sách chu kỳ đánh giá | W1-S6-HRM-B-MOB |
| 341 | `HRM-PF-03` | Tạo phiếu đánh giá | W1-S6-HRM-B-MOB |
| 342 | `HRM-PF-04` | Xem danh sách phiếu đánh giá | W1-S6-HRM-B-MOB |
| 343 | `HRM-FL-01` | Xem danh sách hồ sơ xe (fleet) | W1-S6-HRM-B-MOB |
| 344 | `UC-HRM-20` | Embed — Tổng quan HRM | W1-S6-HRM-B-MOB |
| 345 | `UC-HRM-21` | Embed — Danh sách nhân sự | W1-S6-HRM-B-MOB |
| 346 | `UC-HRM-22` | Embed — Tuyển dụng | W1-S6-HRM-B-MOB |
| 347 | `UC-HRM-23` | Embed — Chấm công | W1-S6-HRM-B-MOB |
| 348 | `UC-HRM-24` | Embed — Lương | W1-S6-HRM-B-MOB |
| 349 | `UC-HRM-25` | Embed — Hợp đồng và bảo hiểm xã hội | W1-S6-HRM-B-MOB |
| 350 | `UC-HRM-26` | Embed — Hàng chờ duyệt metadata | W1-S6-HRM-B-MOB |
| 351 | `UC-HRM-27` | Embed — Quyết định và báo cáo (backlog) | W1-S6-HRM-B-MOB |
| 352 | `UC-HRM-MOB-01` | Đăng nhập và thiết lập phiên an toàn | W1-S6-HRM-B-MOB |
| 353 | `UC-HRM-MOB-02` | Chọn và xác nhận phạm vi công ty | W1-S6-HRM-B-MOB |
| 354 | `UC-HRM-MOB-03` | Xem bảng điều khiển cá nhân | W1-S6-HRM-B-MOB |
| 355 | `UC-HRM-MOB-04` | Ghi nhận chấm công / điểm danh | W1-S6-HRM-B-MOB |
| 356 | `UC-HRM-MOB-05` | Xem lịch sử chấm công | W1-S6-HRM-B-MOB |
| 357 | `UC-HRM-MOB-06` | Tạo đơn chỉnh sửa chấm công hoặc đơn nghỉ phép | W1-S6-HRM-B-MOB |
| 358 | `UC-HRM-MOB-07` | Xem danh sách đơn và trạng thái | W1-S6-HRM-B-MOB |
| 359 | `UC-HRM-MOB-08` | Phê duyệt hoặc từ chối đơn chờ | W1-S6-HRM-B-MOB |
| 360 | `UC-HRM-MOB-09` | Xem tóm tắt lương theo kỳ | W1-S6-HRM-B-MOB |
| 361 | `UC-HRM-MOB-10` | Xem hợp đồng và bảo hiểm | W1-S6-HRM-B-MOB |
| 362 | `UC-HRM-MOB-11` | Quản lý công việc và yêu cầu dịch vụ | W1-S6-HRM-B-MOB |
| 363 | `UC-HRM-MOB-12` | Xem và cập nhật hồ sơ cá nhân | W1-S6-HRM-B-MOB |
| 364 | `UC-HRM-MOB-13` | Nhận thông báo (in-app / realtime / push) | W1-S6-HRM-B-MOB |
| 365 | `UC-HRM-MOB-14` | Làm việc ngoại tuyến có kiểm soát | W1-S6-HRM-B-MOB |
| 366 | `UC-HRM-MOB-15` | Đăng xuất và thu hồi phiên | W1-S6-HRM-B-MOB |
| 367 | `UC-XBOS-CAT-01` | Xem yêu cầu mở rộng danh mục HRM đang chờ | W1-S3-XBOS-CAT-TAIL |
| 368 | `UC-XBOS-CAT-02` | Khởi chạy quy trình phê duyệt danh mục | W1-S3-XBOS-CAT-TAIL |
| 369 | `UC-XBOS-CAT-03` | Xem hộp thư duyệt danh mục | W1-S3-XBOS-CAT-TAIL |
| 370 | `UC-XBOS-CAT-04` | Xem chi tiết phiên duyệt danh mục | W1-S3-XBOS-CAT-TAIL |
| 371 | `UC-XBOS-CAT-05` | Phê duyệt bước duyệt danh mục | W1-S3-XBOS-CAT-TAIL |
| 372 | `UC-XBOS-CAT-06` | Từ chối bước duyệt danh mục | W1-S3-XBOS-CAT-TAIL |
| 373 | `UC-XBOS-CAT-07` | Khởi tạo quy trình duyệt danh mục mẫu (theo công… | W1-S3-XBOS-CAT-TAIL |
