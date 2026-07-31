# Ma trận Phase 1 — Use case × SRS × TechSpec

> Nguồn UC: `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md`. SRS: `docs/client-delivery/02_SRS_XeVN_OS.html` (FR-{mã}). TechSpec: `TECHSPEC_HE_SINH_THAI_XEVN.md` + phân hệ.

## 1. Tóm tắt Phase 1

| Chỉ tiêu | Giá trị |
|----------|--------|
| **Tổng UC Phase 1** | **245** (+ **1** governance ADD `UC-HRM-CO-01` STT 351a — chưa regenerate inventory) |
| Khối **A** — XBOS nền + `UC-XBOS-CAT-*` | **104** (STT 1–97, 367–373) |
| Khối **B** — `XBOS-DM-LOG-*` | **22** (STT 98–119) |
| Khối **C** — HRM đầy đủ | **119** (STT 248–366) |

### Độ phủ TechSpec (ước lượng trên 245 UC)

| Mức | Số UC | Ý nghĩa |
|-----|------:|---------|
| **Có — endpoint** | 160 | Có gợi ý API / controller trong repo |
| **Một phần** | 85 | SRS + mô tả module; chưa map từng UC |
| **Chưa** | 0 | — |

**Kết luận:** SRS Phase 1 **đủ 245/245 FR**. TechSpec **mô tả đủ ở mức module** (M00–M06); **chưa đủ ở mức từng UC** cho ~-75 UC còn lại — cần bổ sung khi làm nốt P1 (OpenAPI, traceability từng mã).

### impl_status (tracking code)

| impl_status | Số UC |
|-------------|------:|
| e2e_pass | 244 |
| waived | 1 |

Cập nhật override: `docs/ecosystem/phase1-impl-status.json` · Regenerate: `pnpm docs:phase1:matrix`

### Theo MOD SRS

| MOD | Số UC | Tài liệu TechSpec chính |
|-----|------:|-------------------------|
| M00 | 22 | TECHSPEC_HE §8 · TECHSPEC.md · Command Center |
| M01 | 75 | TECHSPEC_HE §4–9 · xbos/TECHSPEC |
| M02 | 22 | TECHSPEC_HE §7–8 · catalog-governance · HRM settings-catalogs |
| M03 | 22 | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC |
| M05 | 89 | TECHSPEC_HE §9.3 · hrm/TECHSPEC |
| M06 | 15 | TECHSPEC_HE §9.4 · TECHSPEC_MOBILE |

---

## 2.A Khối A — XBOS nền tảng + governance CAT (104 UC)

| STT | Mã UC | Tên use case | MOD | SRS (FR) | TechSpec module | TechSpec chi tiết | impl_status | Owner |
|----:|-------|--------------|-----|----------|-----------------|-------------------|-------------|-------|
| 1 | `UC-XBOS-01` | Kiểm tra trạng thái dịch vụ | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 2 | `UC-XBOS-02` | Khởi tạo hoặc cập nhật danh mục dùng chung | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 3 | `UC-XBOS-03` | Lấy danh mục theo tên danh mục và phân hệ đích | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 4 | `UC-XBOS-04` | Liệt kê danh mục theo phân hệ đích | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 5 | `UC-XBOS-05` | Phát hành phiên bản hợp đồng dữ liệu | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 6 | `UC-XBOS-06` | Truy vấn nhật ký kiểm toán | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 7 | `UC-XBOS-07` | Tiếp nhận cảnh báo từ phân hệ vệ tinh | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 8 | `UC-XBOS-SYNC-01` | Bootstrap hệ sinh thái XEVN (danh mục nền) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 9 | `UC-XBOS-MET-01` | Xem chỉ số vận hành dịch vụ API | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 10 | `UC-XBOS-08` | Thêm / sửa / xóa dữ liệu master theo lĩnh vực | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 11 | `UC-XBOS-KPI-01` | Tính KPI đơn lẻ trên máy chủ | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 12 | `UC-XBOS-KPI-02` | Tính KPI theo lô trên máy chủ | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 13 | `UC-XBOS-KPI-03` | Tổng hợp KPI đa cấp (rollup) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 14 | `UC-XBOS-KPI-04` | Phát cảnh báo KPI lên cổng điều hành | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 15 | `UC-XBOS-MD-01` | Quản lý chức danh (master) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 16 | `UC-XBOS-MD-02` | Quản lý nhà cung cấp (master) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 17 | `UC-XBOS-MD-03` | Quản lý loại chi phí (master) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 18 | `UC-XBOS-MD-04` | Quản lý chỉ số KPI (master) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 19 | `UC-XBOS-MD-05` | Quản lý khách hàng (master) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 20 | `UC-XBOS-MD-06` | Quản lý đối tác (master) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 21 | `UC-XBOS-MD-07` | Quản lý loại xe / tài sản (master) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 22 | `UC-XBOS-10` | Nâng mảng kinh doanh thành công ty con | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 23 | `UC-XBOS-11` | Quản lý mẫu chức danh và gán vị trí (kiêm nhiệm) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 24 | `UC-XBOS-12` | Gán hoặc thu hồi quyền; kiểm tra xung đột quyền | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 25 | `UC-XBOS-ORG-01` | Xem và sửa cây pháp nhân / đơn vị tổ chức | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 26 | `UC-XBOS-ORG-02` | Thêm / sửa / xóa phòng ban (đơn vị tổ chức) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 27 | `UC-XBOS-ORG-03` | Lưu hồ sơ pháp nhân (mã số thuế, đại diện, vốn…) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 28 | `UC-XBOS-13` | Định nghĩa quy trình (workflow) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 29 | `UC-XBOS-14` | Chạy quy trình — phê duyệt từng vai (multi-hat) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 30 | `UC-XBOS-15` | Cấu hình tuyến báo cáo và tổng hợp kết quả quy t… | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 31 | `UC-XBOS-WF-01` | Lưu sơ đồ quy trình trên canvas | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 32 | `UC-XBOS-WF-02` | Xem danh sách phiên bản quy trình | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 33 | `UC-XBOS-WF-03` | Khởi tạo phiên chạy quy trình | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 34 | `UC-XBOS-WF-04` | Hoàn thành bước phê duyệt trong phiên | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 35 | `UC-XBOS-WF-05` | Xem chi tiết phiên và các bước đang chờ | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 36 | `UC-XBOS-WF-06` | Từ chối bước phê duyệt trong phiên | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 37 | `UC-XBOS-16` | Yêu cầu tài sản — quy trình xác nhận kế toán (5 … | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | XBOS |
| 38 | `UC-XBOS-AR-01` | Danh sách yêu cầu tài sản | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 39 | `UC-XBOS-AR-02` | Tạo yêu cầu tài sản mới | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 40 | `UC-XBOS-AR-03` | Chuyển trạng thái yêu cầu tài sản | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 41 | `UC-XBOS-AST-01` | Đăng ký tài sản | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 42 | `UC-XBOS-AST-02` | Theo dõi vòng đời tài sản | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 43 | `UC-XBOS-AUTH-01` | Đăng nhập cổng Web Portal | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 44 | `UC-XBOS-AUTH-02` | Xem thông tin phiên đăng nhập | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 45 | `UC-XBOS-TENANT-01` | Liệt kê tenant / công ty người dùng được truy cập | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 46 | `UC-XBOS-TENANT-02` | Xem tổng quan tổ chức tập đoàn theo quyền | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 47 | `UC-XBOS-TENANT-03` | Liệt kê đơn vị thành viên trong tập đoàn | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 48 | `UC-ECO-SCOPE-01` | Truy cập khi chưa đăng nhập (phạm vi quản trị hệ… | M00 | Có | TECHSPEC_HE §8 | Một phần — pattern API | e2e_pass | Portal |
| 49 | `UC-ECO-SCOPE-02` | Truy cập khi đã đăng nhập (một tenant) | M00 | Có | TECHSPEC_HE §8 | Một phần — pattern API | e2e_pass | Portal |
| 50 | `UC-CC-P0-01` | Quản lý cổ đông theo pháp nhân | M00 | Có | TECHSPEC_HE §8 | Có — endpoint | e2e_pass | Portal |
| 51 | `UC-CC-P0-02` | Quản lý tài liệu pháp lý và tải / xem file | M00 | Có | TECHSPEC_HE §8 | Có — endpoint | e2e_pass | Portal |
| 52 | `UC-CC-P0-03` | Lưu và xóa phòng ban | M00 | Có | TECHSPEC_HE §8 | Có — endpoint | e2e_pass | Portal |
| 53 | `UC-CC-P0-04` | Ma trận phân quyền theo vai trò | M00 | Có | TECHSPEC_HE §8 | Có — endpoint | e2e_pass | Portal |
| 54 | `UC-CC-P0-05` | Danh mục văn bản / đo lường / giá (Command Center) | M00 | Có | TECHSPEC_HE §8 | Có — endpoint | e2e_pass | Portal |
| 55 | `UC-CC-P0-06` | Hộp thư — mở chi tiết tác vụ quy trình | M00 | Có | TECHSPEC_HE §8 | Có — endpoint | e2e_pass | Portal |
| 56 | `UC-CC-P0-08` | Thông tin tổng quan không gian làm việc | M00 | Có | TECHSPEC_HE §8 | Có — endpoint | e2e_pass | Portal |
| 57 | `UC-CC-P0-09` | Chính sách hiển thị dữ liệu tạm khi API chưa sẵn… | M00 | Có | TECHSPEC_HE §8 | Một phần — pattern API | e2e_pass | Portal |
| 58 | `UC-CC-01` | Cấu hình phòng ban theo từng pháp nhân | M00 | Có | TECHSPEC_HE §8 | Một phần — pattern API | e2e_pass | Portal |
| 59 | `UC-CC-03` | Chi tiết đơn vị thành viên — hồ sơ pháp nhân và … | M00 | Có | TECHSPEC_HE §8 | Một phần — pattern API | e2e_pass | Portal |
| 60 | `UC-CC-04` | Lưu thông tin pháp nhân | M00 | Có | TECHSPEC_HE §8 | Một phần — pattern API | e2e_pass | Portal |
| 61 | `UC-XBOS-CC-05` | Thanh điều hành — KPI / tác vụ / cảnh báo | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | XBOS |
| 62 | `UC-XBOS-CC-06` | Canvas quy trình | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | Portal |
| 63 | `UC-XBOS-CC-07` | Hạ tầng — danh mục nền | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | Portal |
| 64 | `UC-XBOS-CC-08` | Hệ thống phòng ban mẫu | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | Portal |
| 65 | `UC-RACI-01` | Xem danh mục hoạt động RACI theo khối nghiệp vụ | M00 | Có | TECHSPEC_HE §8 | Một phần — pattern API | e2e_pass | Portal |
| 66 | `UC-RACI-02` | Xem và chỉnh ma trận RACI tại chi tiết pháp nhân | M00 | Có | TECHSPEC_HE §8 | Một phần — pattern API | e2e_pass | Portal |
| 67 | `UC-RACI-03` | Xem ánh xạ chức năng phân hệ cho hoạt động | M00 | Có | TECHSPEC_HE §8 | Một phần — pattern API | e2e_pass | Portal |
| 68 | `UC-RACI-04` | Gán cột RACI với chức danh | M00 | Có | TECHSPEC_HE §8 | Một phần — pattern API | e2e_pass | Portal |
| 69 | `UC-RACI-05` | Nhập hoặc nâng phiên bản catalog RACI | M00 | Có | TECHSPEC_HE §8 | Một phần — pattern API | e2e_pass | Portal |
| 70 | `UC-RACI-06` | Báo cáo độ phủ số hóa theo công ty | M00 | Có | TECHSPEC_HE §8 | Một phần — pattern API | e2e_pass | Portal |
| 71 | `UC-XBOS-DASH-01` | Cockpit tổng hợp KPI điều hành | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | Portal |
| 72 | `UC-XBOS-DASH-02` | Bảng KPI theo công ty | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | Portal |
| 73 | `UC-XBOS-DASH-03` | Chính sách KPI | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | Portal |
| 74 | `UC-XBOS-INF-01` | Xem và sửa cấu hình hạ tầng danh mục nền | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 75 | `UC-XBOS-INF-02` | Quản lý mẫu siêu dữ liệu theo pháp nhân | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 76 | `UC-XBOS-INF-03` | Xem tóm tắt trạng thái hạ tầng danh mục | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 77 | `XBOS-DM-01` | Xem tổng quan danh mục theo phân hệ | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | XBOS |
| 78 | `XBOS-DM-02` | Tạo nhóm danh mục | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | XBOS |
| 79 | `XBOS-DM-03` | Thêm giá trị danh mục | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | XBOS |
| 80 | `XBOS-DM-04` | Sửa giá trị danh mục | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | XBOS |
| 81 | `XBOS-DM-05` | Ngừng hoặc kích hoạt giá trị | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | XBOS |
| 82 | `XBOS-DM-06` | Sắp xếp phân cấp cha–con | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | XBOS |
| 83 | `XBOS-DM-07` | Gán danh mục cho phân hệ đích | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | XBOS |
| 84 | `XBOS-DM-08` | Gán danh mục theo công ty | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | XBOS |
| 85 | `XBOS-DM-09` | Sao chép bộ danh mục | M01 | Có | TECHSPEC_HE §4–9 | Một phần — pattern API | e2e_pass | XBOS |
| 86 | `XBOS-DM-10` | Xuất danh mục | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 87 | `XBOS-DM-11` | Nhập danh mục từ file | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 88 | `XBOS-DM-12` | Gửi phê duyệt thay đổi nhạy cảm | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 89 | `XBOS-DM-13` | Phê duyệt hoặc từ chối | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 90 | `XBOS-DM-14` | Xem lịch sử thay đổi | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 91 | `XBOS-DM-15` | Yêu cầu bổ sung trường (công ty con) | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 92 | `XBOS-DM-16` | Yêu cầu xóa trường — phê duyệt tập đoàn | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 93 | `XBOS-DM-17` | Phát hành phiên bản danh mục | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 94 | `XBOS-DM-18` | Thông báo phân hệ có danh mục mới | M01 | Có | TECHSPEC_HE §4–9 | Có — endpoint | e2e_pass | XBOS |
| 95 | `UC-ECO-MASTER-01` | Quản lý master data theo tenant và công ty | M00 | Có | TECHSPEC_HE §8 | Chưa (API P2) | e2e_pass | XBOS |
| 96 | `UC-ECO-MASTER-02` | Mở rộng tenant mới với tenant master | M00 | Có | TECHSPEC_HE §8 | Có — endpoint | e2e_pass | XBOS |
| 97 | `UC-ECO-FE-01` | Thay thế dữ liệu giả lập trên Web Portal bằng AP… | M00 | Có | TECHSPEC_HE §8 | Chưa (API P2) | e2e_pass | Portal |
| 367 | `UC-XBOS-CAT-01` | Xem yêu cầu mở rộng danh mục HRM đang chờ | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 368 | `UC-XBOS-CAT-02` | Khởi chạy quy trình phê duyệt danh mục | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 369 | `UC-XBOS-CAT-03` | Xem hộp thư duyệt danh mục | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 370 | `UC-XBOS-CAT-04` | Xem chi tiết phiên duyệt danh mục | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 371 | `UC-XBOS-CAT-05` | Phê duyệt bước duyệt danh mục | M02 | Có | TECHSPEC_HE §7–8 | Có — endpoint | e2e_pass | XBOS+HRM |
| 372 | `UC-XBOS-CAT-06` | Từ chối bước duyệt danh mục | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 373 | `UC-XBOS-CAT-07` | Khởi tạo quy trình duyệt danh mục mẫu (theo công… | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |

## 2.B Khối B — XBOS-DM-LOG — khai danh mục Logistic (22 UC)

| STT | Mã UC | Tên use case | MOD | SRS (FR) | TechSpec module | TechSpec chi tiết | impl_status | Owner |
|----:|-------|--------------|-----|----------|-----------------|-------------------|-------------|-------|
| 98 | `XBOS-DM-LOG-01` | Xem tổng quan danh mục theo phân hệ Logistic | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 99 | `XBOS-DM-LOG-02` | Tạo nhóm danh mục mới | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 100 | `XBOS-DM-LOG-03` | Thêm giá trị vào danh mục | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 101 | `XBOS-DM-LOG-04` | Sửa giá trị danh mục | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 102 | `XBOS-DM-LOG-05` | Ngừng hoặc kích hoạt giá trị | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 103 | `XBOS-DM-LOG-06` | Sắp xếp phân cấp cha–con | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 104 | `XBOS-DM-LOG-07` | Gán danh mục cho phân hệ Logistic | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 105 | `XBOS-DM-LOG-08` | Gán danh mục theo công ty thành viên | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 106 | `XBOS-DM-LOG-09` | Sao chép bộ danh mục sang công ty mới | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 107 | `XBOS-DM-LOG-10` | Xuất danh mục ra file | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 108 | `XBOS-DM-LOG-11` | Nhập danh mục từ file mẫu | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 109 | `XBOS-DM-LOG-12` | Gửi phê duyệt khi sửa danh mục nhạy cảm | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 110 | `XBOS-DM-LOG-13` | Phê duyệt hoặc từ chối thay đổi danh mục | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 111 | `XBOS-DM-LOG-14` | Xem lịch sử thay đổi danh mục | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 112 | `XBOS-DM-LOG-15` | Công ty con yêu cầu bổ sung trường danh mục | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 113 | `XBOS-DM-LOG-16` | Công ty con yêu cầu xóa trường — chuyển phê duyệ… | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 114 | `XBOS-DM-LOG-17` | Phát hành phiên bản danh mục mới | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 115 | `XBOS-DM-LOG-18` | Thông báo phân hệ Logistic có danh mục mới | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 116 | `XBOS-DM-LOG-19` | Kiểm tra danh mục thiếu trước vận hành | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 117 | `XBOS-DM-LOG-20` | Khai báo đủ 3 tầng dịch vụ vận tải | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 118 | `XBOS-DM-LOG-21` | Khai báo đủ 3 tầng loại phương tiện | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |
| 119 | `XBOS-DM-LOG-22` | Rà soát sản phẩm dịch vụ chưa gắn bảng giá | M03 | Có | TECHSPEC_HE §8.1 (pattern DM) — chưa logistics/TECHSPEC | Một phần — pattern API | e2e_pass | Data+XBOS |

## 2.C Khối C — HRM — DM, API/Web, Mobile (119 UC)

| STT | Mã UC | Tên use case | MOD | SRS (FR) | TechSpec module | TechSpec chi tiết | impl_status | Owner |
|----:|-------|--------------|-----|----------|-----------------|-------------------|-------------|-------|
| 248 | `XBOS-DM-HRM-01` | Xem tổng quan danh mục theo phân hệ Nhân sự | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 249 | `XBOS-DM-HRM-02` | Cấu hình 6 nhóm trường hồ sơ nhân viên | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 250 | `XBOS-DM-HRM-03` | Bổ sung trường mở rộng theo công ty | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 251 | `XBOS-DM-HRM-04` | Gửi phê duyệt khi công ty con thêm hoặc xóa trường | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 252 | `XBOS-DM-HRM-05` | Phê duyệt hoặc từ chối mở rộng danh mục | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 253 | `XBOS-DM-HRM-06` | Khai bộ phòng ban và chức vụ theo từng công ty | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 254 | `XBOS-DM-HRM-07` | Sao chép thư viện chức danh sang công ty con | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 255 | `XBOS-DM-HRM-08` | Gán danh mục cho phân hệ Nhân sự | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 256 | `XBOS-DM-HRM-09` | Phát hành phiên bản danh mục mới | M02 | Có | TECHSPEC_HE §7–8 | Có — endpoint | e2e_pass | XBOS+HRM |
| 257 | `XBOS-DM-HRM-10` | Đồng bộ danh mục xuống HRM | M02 | Có | TECHSPEC_HE §7–8 | Có — endpoint | e2e_pass | XBOS+HRM |
| 258 | `XBOS-DM-HRM-11` | Kiểm tra danh mục thiếu trước import nhân sự | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 259 | `XBOS-DM-HRM-12` | Cấu hình preset biểu mẫu theo công ty (Command C… | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 260 | `XBOS-DM-HRM-13` | Khai danh mục hồ sơ xe (du lịch) | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 261 | `XBOS-DM-HRM-14` | Gán mã quy trình cho loại đơn HRM | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 262 | `XBOS-DM-HRM-15` | Xem lịch sử thay đổi danh mục | M02 | Có | TECHSPEC_HE §7–8 | Một phần — pattern API | e2e_pass | XBOS+HRM |
| 263 | `UC-HRM-01` | Kiểm tra trạng thái dịch vụ | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 264 | `UC-HRM-02` | Tạo quản trị nền tảng | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 265 | `UC-HRM-03` | Tạo hoặc cập nhật quản trị doanh nghiệp | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 266 | `UC-HRM-04` | Mời nhân viên hàng loạt | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 267 | `UC-HRM-05` | Cập nhật thông tin nhạy cảm tài khoản | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 268 | `UC-HRM-06` | Đồng bộ dữ liệu dùng chung từ XBOS | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 269 | `UC-HRM-07` | Lấy dữ liệu dùng chung theo khóa danh mục | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 270 | `UC-HRM-08` | Liệt kê dữ liệu dùng chung theo phân hệ | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 271 | `HRM-AT-01` | Ghi nhận bản ghi chấm công | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 272 | `HRM-AT-02` | Xem danh sách bản ghi chấm công | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 273 | `HRM-AT-03` | Cập nhật trạng thái bản ghi chấm công | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 274 | `HRM-AT-04` | Tạo đơn chỉnh sửa chấm công | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 275 | `HRM-AT-05` | Xem danh sách đơn chỉnh sửa chấm công | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 276 | `HRM-AT-06` | Sửa đơn chỉnh sửa chấm công | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 277 | `HRM-AT-07` | Phê duyệt đơn chỉnh sửa chấm công | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 278 | `HRM-AT-08` | Từ chối đơn chỉnh sửa chấm công | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 279 | `HRM-AT-09` | Xóa đơn chỉnh sửa chấm công | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 280 | `HRM-AT-10` | Tạo đơn nghỉ phép | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 281 | `HRM-AT-11` | Xem danh sách đơn nghỉ phép | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 282 | `HRM-AT-12` | Phê duyệt đơn nghỉ phép | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 283 | `HRM-AT-13` | Từ chối đơn nghỉ phép | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 284 | `HRM-SV-01` | Tạo yêu cầu dịch vụ nội bộ | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 285 | `HRM-SV-02` | Xem danh sách yêu cầu dịch vụ | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 286 | `HRM-SV-03` | Cập nhật yêu cầu dịch vụ | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 287 | `HRM-SV-04` | Xóa yêu cầu dịch vụ | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 288 | `HRM-SV-05` | Phê duyệt yêu cầu dịch vụ | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 289 | `HRM-SV-06` | Từ chối yêu cầu dịch vụ | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 290 | `UC-HRM-12` | Đọc hộp thư thông báo nghiệp vụ | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 291 | `HRM-NT-01` | Đánh dấu thông báo đã đọc | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 292 | `HRM-NT-02` | Đăng ký token thông báo đẩy (mobile) | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 293 | `HRM-EM-01` | Tạo hồ sơ nhân viên | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 294 | `HRM-EM-02` | Xem danh sách nhân viên | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 295 | `HRM-EM-03` | Cập nhật hồ sơ nhân viên | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 296 | `HRM-EM-04` | Lưu trữ (xóa mềm) nhân viên | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 297 | `HRM-EM-05` | Khôi phục nhân viên đã lưu trữ | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 298 | `HRM-PR-01` | Tạo kỳ lương | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 299 | `HRM-PR-02` | Xem danh sách kỳ lương | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 300 | `HRM-PR-03` | Xử lý tính lương theo kỳ | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 301 | `HRM-PR-04` | Chốt kỳ lương | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 302 | `HRM-PR-05` | Xem phiếu lương | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 303 | `HRM-PR-06` | Báo cáo đối soát lương | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 304 | `HRM-RC-01` | Tạo yêu cầu tuyển dụng | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 305 | `HRM-RC-02` | Xem danh sách yêu cầu tuyển dụng | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 306 | `HRM-RC-03` | Tạo hồ sơ ứng viên | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 307 | `HRM-RC-04` | Xem danh sách ứng viên | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 308 | `HRM-RC-05` | Lên lịch phỏng vấn | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 309 | `HRM-RC-06` | Cập nhật kết quả phỏng vấn | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 310 | `HRM-CI-01` | Tạo hợp đồng lao động | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 311 | `HRM-CI-02` | Ghi nhận bảo hiểm nhân viên | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 312 | `HRM-CI-03` | Xem danh sách hợp đồng | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 313 | `HRM-CI-04` | Cảnh báo hợp đồng sắp hết hạn | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 314 | `HRM-CI-05` | Cập nhật hợp đồng | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 315 | `HRM-CI-06` | Xóa hợp đồng | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 316 | `HRM-CI-07` | Cảnh báo bảo hiểm sắp hết hạn | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 317 | `HRM-MD-01` | Gửi yêu cầu thay đổi metadata hồ sơ | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 318 | `HRM-MD-02` | Xem hàng chờ thay đổi metadata | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 319 | `HRM-MD-03` | Phê duyệt thay đổi metadata | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 320 | `HRM-MD-04` | Từ chối thay đổi metadata | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 321 | `HRM-MD-05` | Xem nhật ký thay đổi metadata | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 322 | `HRM-SC-01` | Xem tổng quan danh mục cấu hình HRM | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 323 | `HRM-SC-02` | Đồng bộ toàn bộ danh mục từ XBOS | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 324 | `HRM-SC-03` | Bổ sung giá trị danh mục mở rộng | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 325 | `HRM-SC-04` | Yêu cầu xóa trường danh mục | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 326 | `HRM-SC-05` | Phê duyệt lô mở rộng danh mục | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 327 | `HRM-SC-06` | Từ chối lô mở rộng danh mục | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 328 | `HRM-SC-07` | Khởi tạo mẫu import nhân sự tập đoàn | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 329 | `HRM-SC-08` | Khởi tạo danh mục phòng ban – chức vụ theo công ty | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 330 | `HRM-SC-09` | Khởi tạo danh mục hồ sơ xe du lịch | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 331 | `HRM-IM-01` | Xem trước import nhân sự từ file | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 332 | `HRM-IM-02` | Xác nhận import nhân sự | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 333 | `HRM-IM-03` | Export danh sách nhân sự | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 334 | `HRM-IM-04` | Tải file mẫu import | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 335 | `HRM-OP-01` | Tạo công việc vận hành | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 336 | `HRM-OP-02` | Xem danh sách công việc | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 337 | `HRM-OP-03` | Cập nhật trạng thái công việc | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 338 | `HRM-OP-04` | Báo cáo tổng hợp công việc | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 339 | `HRM-PF-01` | Tạo chu kỳ đánh giá hiệu suất | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 340 | `HRM-PF-02` | Xem danh sách chu kỳ đánh giá | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 341 | `HRM-PF-03` | Tạo phiếu đánh giá | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 342 | `HRM-PF-04` | Xem danh sách phiếu đánh giá | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 343 | `HRM-FL-01` | Xem danh sách hồ sơ xe (fleet) | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 344 | `UC-HRM-20` | Embed — Tổng quan HRM | M05 | Có | TECHSPEC_HE §9.3 | Một phần — pattern API | e2e_pass | HRM |
| 345 | `UC-HRM-21` | Embed — Danh sách nhân sự | M05 | Có | TECHSPEC_HE §9.3 | Một phần — pattern API | e2e_pass | HRM |
| 346 | `UC-HRM-22` | Embed — Tuyển dụng | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 347 | `UC-HRM-23` | Embed — Chấm công | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 348 | `UC-HRM-24` | Embed — Lương | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 349 | `UC-HRM-25` | Embed — Hợp đồng và bảo hiểm xã hội | M05 | Có | TECHSPEC_HE §9.3 | Có — endpoint | e2e_pass | HRM |
| 350 | `UC-HRM-26` | Embed — Hàng chờ duyệt metadata | M05 | Có | TECHSPEC_HE §9.3 | Một phần — pattern API | e2e_pass | HRM |
| 351 | `UC-HRM-27` | Embed — Quyết định và báo cáo (backlog) | M05 | Có | TECHSPEC_HE §9.3 | Một phần — pattern API | waived | FE |
| 351a | `UC-HRM-CO-01` | Embed — Quản lý công ty: headcount ĐVTV (FR-HRM-CO-HC-01) + Ngành nghề (FR-HRM-CO-IND-01) | M05 | Có — `docs/hrm/SRS.md` UC-HRM-CO-01 | TECHSPEC_HE Plane A/B + BR-INT-05; **industry:** expose `business_lines` + FE dictionary (TBD SA) | Một phần — XBOS list + HRM summary/COUNT; industry bind residual | planned | HRM |
| 352 | `UC-HRM-MOB-01` | Đăng nhập và thiết lập phiên an toàn | M06 | Có | TECHSPEC_HE §9.4 | Có — endpoint | e2e_pass | Mobile |
| 353 | `UC-HRM-MOB-02` | Chọn và xác nhận phạm vi công ty | M06 | Có | TECHSPEC_HE §9.4 | Có — endpoint | e2e_pass | Mobile |
| 354 | `UC-HRM-MOB-03` | Xem bảng điều khiển cá nhân | M06 | Có | TECHSPEC_HE §9.4 | Một phần — pattern API | e2e_pass | Mobile |
| 355 | `UC-HRM-MOB-04` | Ghi nhận chấm công / điểm danh | M06 | Có | TECHSPEC_HE §9.4 | Có — endpoint | e2e_pass | Mobile |
| 356 | `UC-HRM-MOB-05` | Xem lịch sử chấm công | M06 | Có | TECHSPEC_HE §9.4 | Một phần — pattern API | e2e_pass | Mobile |
| 357 | `UC-HRM-MOB-06` | Tạo đơn chỉnh sửa chấm công hoặc đơn nghỉ phép | M06 | Có | TECHSPEC_HE §9.4 | Có — endpoint | e2e_pass | Mobile |
| 358 | `UC-HRM-MOB-07` | Xem danh sách đơn và trạng thái | M06 | Có | TECHSPEC_HE §9.4 | Một phần — pattern API | e2e_pass | Mobile |
| 359 | `UC-HRM-MOB-08` | Phê duyệt hoặc từ chối đơn chờ | M06 | Có | TECHSPEC_HE §9.4 | Có — endpoint | e2e_pass | Mobile |
| 360 | `UC-HRM-MOB-09` | Xem tóm tắt lương theo kỳ | M06 | Có | TECHSPEC_HE §9.4 | Một phần — pattern API | e2e_pass | Mobile |
| 361 | `UC-HRM-MOB-10` | Xem hợp đồng và bảo hiểm | M06 | Có | TECHSPEC_HE §9.4 | Một phần — pattern API | e2e_pass | Mobile |
| 362 | `UC-HRM-MOB-11` | Quản lý công việc và yêu cầu dịch vụ | M06 | Có | TECHSPEC_HE §9.4 | Một phần — pattern API | e2e_pass | Mobile |
| 363 | `UC-HRM-MOB-12` | Xem và cập nhật hồ sơ cá nhân | M06 | Có | TECHSPEC_HE §9.4 | Một phần — pattern API | e2e_pass | Mobile |
| 364 | `UC-HRM-MOB-13` | Nhận thông báo (in-app / realtime / push) | M06 | Có | TECHSPEC_HE §9.4 | Một phần — pattern API | e2e_pass | Mobile |
| 365 | `UC-HRM-MOB-14` | Làm việc ngoại tuyến có kiểm soát | M06 | Có | TECHSPEC_HE §9.4 | Một phần — pattern API | e2e_pass | Mobile |
| 366 | `UC-HRM-MOB-15` | Đăng xuất và thu hồi phiên | M06 | Có | TECHSPEC_HE §9.4 | Một phần — pattern API | e2e_pass | Mobile |

