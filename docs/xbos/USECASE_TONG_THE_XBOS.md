# Danh sách use case tổng thể — Phân hệ XBOS

> Phiên bản: 2026-05-18 · Tham chiếu: `docs/xbos/BRD.md`, `docs/xbos/SRS.md`, module `apps/api/xbos-api`  
> **Bảng đếm 1 dòng / 1 use case (XBOS thuần, không trùng Logistic/HRM):** [`BANG_TONG_HOP_USECASE_XBOS.md`](./BANG_TONG_HOP_USECASE_XBOS.md) — **97** use case.

---

## 1. Nền tảng và đồng bộ danh mục

| Mã | Tên use case |
|----|--------------|
| UC-XBOS-01 | Kiểm tra trạng thái dịch vụ |
| UC-XBOS-02 | Khởi tạo hoặc cập nhật danh mục dùng chung |
| UC-XBOS-03 | Lấy danh mục theo tên danh mục và phân hệ đích |
| UC-XBOS-04 | Liệt kê danh mục theo phân hệ đích |
| UC-XBOS-05 | Phát hành phiên bản hợp đồng dữ liệu |
| UC-XBOS-06 | Truy vấn nhật ký kiểm toán |
| UC-XBOS-07 | Tiếp nhận cảnh báo từ phân hệ vệ tinh |

---

## 2. Master data và KPI

| Mã | Tên use case |
|----|--------------|
| UC-XBOS-08 | Thêm / sửa / xóa dữ liệu master theo lĩnh vực |
| UC-XBOS-09 | Tính KPI trên máy chủ (đơn lẻ hoặc theo lô) |
| UC-XBOS-MD-01 | Quản lý chức danh |
| UC-XBOS-MD-02 | Quản lý nhà cung cấp |
| UC-XBOS-MD-03 | Quản lý loại chi phí |
| UC-XBOS-MD-04 | Quản lý chỉ số KPI |
| UC-XBOS-MD-05 | Quản lý khách hàng |
| UC-XBOS-MD-06 | Quản lý đối tác |
| UC-XBOS-MD-07 | Quản lý loại xe / tài sản |

---

## 3. Tổ chức, chức danh, phân quyền

| Mã | Tên use case |
|----|--------------|
| UC-XBOS-10 | Nâng mảng kinh doanh thành công ty con |
| UC-XBOS-11 | Quản lý mẫu chức danh và gán vị trí (kiêm nhiệm) |
| UC-XBOS-12 | Gán hoặc thu hồi quyền; kiểm tra xung đột quyền |
| UC-XBOS-ORG-01 | Xem và sửa cây pháp nhân / đơn vị tổ chức |
| UC-XBOS-ORG-02 | Thêm / sửa / xóa phòng ban (đơn vị tổ chức) |
| UC-XBOS-ORG-03 | Lưu hồ sơ pháp nhân (mã số thuế, đại diện, vốn…) |

---

## 4. Quy trình và phê duyệt

| Mã | Tên use case |
|----|--------------|
| UC-XBOS-13 | Định nghĩa quy trình (workflow) |
| UC-XBOS-14 | Chạy quy trình — phê duyệt từng vai (multi-hat) |
| UC-XBOS-15 | Cấu hình tuyến báo cáo và tổng hợp kết quả quy trình |
| UC-XBOS-WF-01 | Lưu sơ đồ quy trình trên canvas |
| UC-XBOS-WF-02 | Xem danh sách phiên bản quy trình |
| UC-XBOS-WF-03 | Khởi tạo phiên chạy quy trình |
| UC-XBOS-WF-04 | Hoàn thành bước phê duyệt trong phiên |
| UC-XBOS-WF-05 | Xem chi tiết phiên và các bước đang chờ |

---

## 5. Tài sản và yêu cầu tài chính

| Mã | Tên use case |
|----|--------------|
| UC-XBOS-16 | Yêu cầu tài sản — xác nhận kế toán (5 bước) |
| UC-XBOS-AST-01 | Đăng ký tài sản |
| UC-XBOS-AST-02 | Theo dõi vòng đời tài sản |

---

## 6. Xác thực và phạm vi truy cập

| Mã | Tên use case |
|----|--------------|
| UC-XBOS-AUTH-01 | Đăng nhập cổng Web Portal |
| UC-XBOS-AUTH-02 | Xem thông tin phiên đăng nhập |
| UC-XBOS-TENANT-01 | Liệt kê tenant / công ty người dùng được truy cập |
| UC-XBOS-TENANT-02 | Xem tổng quan tổ chức tập đoàn theo quyền |
| UC-ECO-SCOPE-01 | Truy cập khi chưa đăng nhập (phạm vi quản trị hệ thống) |
| UC-ECO-SCOPE-02 | Truy cập khi đã đăng nhập (một tenant) |

---

## 7. Command Center — Thiết lập công ty (P0)

| Mã | Tên use case |
|----|--------------|
| UC-CC-P0-01 | Quản lý cổ đông theo pháp nhân |
| UC-CC-P0-02 | Quản lý tài liệu pháp lý và tải / xem file |
| UC-CC-P0-03 | Lưu và xóa phòng ban |
| UC-CC-P0-04 | Ma trận phân quyền theo vai trò |
| UC-CC-P0-05 | Danh mục văn bản / đo lường / giá (Command Center) |
| UC-CC-P0-06 | Hộp thư — mở chi tiết tác vụ quy trình |
| UC-CC-P0-07 | Xem trước biểu mẫu metadata nhân sự |
| UC-CC-P0-08 | Thông tin tổng quan không gian làm việc |
| UC-CC-P0-09 | Chính sách hiển thị dữ liệu tạm khi API chưa sẵn sàng |

---

## 8. Command Center — Cấu hình mở rộng

| Mã | Tên use case |
|----|--------------|
| UC-CC-01 | Cấu hình phòng ban theo từng pháp nhân |
| UC-CC-02 | Cấu hình danh mục hồ sơ nhân sự tập đoàn |
| UC-CC-03 | Chi tiết đơn vị thành viên — hồ sơ pháp nhân và RACI |
| UC-CC-04 | Lưu thông tin pháp nhân |
| UC-XBOS-CC-05 | Thanh điều hành — KPI / tác vụ / cảnh báo |
| UC-XBOS-CC-06 | Canvas quy trình |
| UC-XBOS-CC-07 | Hạ tầng — danh mục nền |
| UC-XBOS-CC-08 | Hệ thống phòng ban mẫu |

---

## 9. Quản trị RACI

| Mã | Tên use case |
|----|--------------|
| UC-RACI-01 | Xem danh mục hoạt động RACI theo khối nghiệp vụ |
| UC-RACI-02 | Xem và chỉnh ma trận RACI tại chi tiết pháp nhân |
| UC-RACI-03 | Xem ánh xạ chức năng phân hệ cho hoạt động |
| UC-RACI-04 | Gán cột RACI với chức danh |
| UC-RACI-05 | Nhập hoặc nâng phiên bản catalog RACI |
| UC-RACI-06 | Báo cáo độ phủ số hóa theo công ty |

---

## 10. Quản trị danh mục HRM (Governance)

| Mã | Tên use case |
|----|--------------|
| UC-XBOS-CAT-01 | Xem yêu cầu mở rộng danh mục HRM đang chờ |
| UC-XBOS-CAT-02 | Khởi chạy quy trình phê duyệt danh mục |
| UC-XBOS-CAT-03 | Xem hộp thư duyệt danh mục |
| UC-XBOS-CAT-04 | Xem chi tiết phiên duyệt danh mục |
| UC-XBOS-CAT-05 | Phê duyệt bước duyệt danh mục |
| UC-XBOS-CAT-06 | Từ chối bước duyệt danh mục |
| UC-XBOS-CAT-07 | Khởi tạo quy trình duyệt danh mục mẫu (theo công ty) |

---

## 11. Bảng điều hành (Dashboard)

| Mã | Tên use case |
|----|--------------|
| UC-XBOS-DASH-01 | Cockpit tổng hợp KPI điều hành |
| UC-XBOS-DASH-02 | Bảng KPI theo công ty |
| UC-XBOS-DASH-03 | Chính sách KPI |

---

## 12. Hạ tầng và cài đặt

| Mã | Tên use case |
|----|--------------|
| UC-XBOS-INF-01 | Xem và sửa cấu hình hạ tầng danh mục nền |
| UC-XBOS-INF-02 | Quản lý mẫu siêu dữ liệu theo pháp nhân |

---

## 13. Quản trị danh mục theo phân hệ (chung)

| Mã | Tên use case |
|----|--------------|
| XBOS-DM-01 | Xem tổng quan danh mục theo phân hệ |
| XBOS-DM-02 | Tạo nhóm danh mục |
| XBOS-DM-03 | Thêm giá trị danh mục |
| XBOS-DM-04 | Sửa giá trị danh mục |
| XBOS-DM-05 | Ngừng hoặc kích hoạt giá trị |
| XBOS-DM-06 | Sắp xếp phân cấp cha–con |
| XBOS-DM-07 | Gán danh mục cho phân hệ đích |
| XBOS-DM-08 | Gán danh mục theo công ty |
| XBOS-DM-09 | Sao chép bộ danh mục |
| XBOS-DM-10 | Xuất danh mục |
| XBOS-DM-11 | Nhập danh mục từ file |
| XBOS-DM-12 | Gửi phê duyệt thay đổi nhạy cảm |
| XBOS-DM-13 | Phê duyệt hoặc từ chối |
| XBOS-DM-14 | Xem lịch sử thay đổi |
| XBOS-DM-15 | Yêu cầu bổ sung trường (công ty con) |
| XBOS-DM-16 | Yêu cầu xóa trường — phê duyệt tập đoàn |
| XBOS-DM-17 | Phát hành phiên bản danh mục |
| XBOS-DM-18 | Thông báo phân hệ có danh mục mới |

---

## 14. Master data toàn hệ (liên phân hệ)

| Mã | Tên use case |
|----|--------------|
| UC-ECO-MASTER-01 | Quản lý master data theo tenant và công ty |
| UC-ECO-MASTER-02 | Mở rộng tenant mới với tenant master |
| UC-ECO-FE-01 | Thay thế dữ liệu giả lập trên Web Portal bằng API thật |

---

## Liên kết bảng tổng hợp theo phân hệ

| Phân hệ | File | Ghi chú |
|---------|------|---------|
| **Toàn hệ (gom + danh mục)** | [`../ecosystem/BANG_TONG_HOP_USECASE_XEVN.md`](../ecosystem/BANG_TONG_HOP_USECASE_XEVN.md) | **373 UC** · **183 mục cấu hình** |
| XBOS nền tảng | [`BANG_TONG_HOP_USECASE_XBOS.md`](./BANG_TONG_HOP_USECASE_XBOS.md) | 97 — không gồm `XBOS-DM-LOG-*`, `XBOS-DM-HRM-*` |
| Logistic | [`../logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md`](../logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md) | 150 use case |
| HRM | [`../hrm/BANG_TONG_HOP_USECASE_HRM.md`](../hrm/BANG_TONG_HOP_USECASE_HRM.md) | 119 use case |
