# BRD — Phân hệ điều hành tập đoàn (XBOS / Command Center)

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Yêu cầu nghiệp vụ — Điều hành tập đoàn |
| Phiên bản | 1.0-W2 |
| Trạng thái | Chính thức (W1 spine + W2 RACI/RBAC/CAT-CC/KPI) |
| Phạm vi | Đăng nhập, phạm vi đơn vị, tổ chức pháp nhân, RACI, phân quyền Settings, catalog CC, KPI rollup, quy trình phê duyệt, phát hành danh mục dùng chung |

---

## 1. Tóm tắt điều hành

Phân hệ điều hành tập đoàn là nơi lãnh đạo và quản trị cấu hình quản lý cây đơn vị thành viên, hồ sơ pháp nhân, ma trận RACI, phân quyền theo chức danh, catalog chuẩn Command Center, chỉ số KPI trong phạm vi, quy trình phê duyệt và danh mục chuẩn phát hành xuống các phân hệ nghiệp vụ (trước hết là Nhân sự). Mọi thao tác đọc/ghi phải đúng phạm vi đơn vị được cấp sau khi đăng nhập.

## 2. Bối cảnh và vấn đề

| Vấn đề | Hệ quả nếu không xử lý |
|--------|------------------------|
| Nhiều pháp nhân / đơn vị thành viên | Xem hoặc sửa nhầm dữ liệu ngoài phạm vi |
| Hồ sơ pháp nhân / cổ đông / phòng ban lệch | Báo cáo và Nhân sự không cùng chuẩn tổ chức |
| RACI / phân quyền chỉ trên tệp ngoài hệ thống | Không truy vết ai chịu trách nhiệm, ai được phép thao tác |
| Catalog CC và KPI không theo phạm vi | Member thấy rollup / chuẩn ngoài quyền |
| Quy trình phê duyệt không thống nhất | Không truy vết được ai duyệt, khi nào |
| Danh mục Nhân sự tự khai lệch chuẩn tập đoàn | Dropdown và báo cáo lệch giữa đơn vị |

## 3. Mục tiêu và chỉ số thành công

| Mục tiêu | Chỉ số chấp nhận |
|----------|------------------|
| Đăng nhập và chọn đúng tư cách đơn vị | Vào đúng không gian làm việc; không lộ rollup ngoài quyền |
| Quản trị pháp nhân / cổ đông / phòng ban / RACI trong phạm vi | Lưu xong thấy trên giao diện; tải lại trang vẫn còn |
| Phân quyền Settings và catalog CC | Đổi ô / checkbox → tải lại còn đúng |
| KPI rollup đúng phạm vi | Tập đoàn xem được trong quyền; member không lộ rollup ngoài quyền |
| Tạo và duyệt quy trình trên hộp thư | Phiên chạy có bước; duyệt xong trạng thái cập nhật |
| Phát hành / duyệt danh mục dùng chung | Sau duyệt, giá trị dùng được ở phân hệ đích |

## 4. Phạm vi

### 4.1 Trong phạm vi (W1 + W2 batch)

- Đăng nhập cổng; liệt kê / chọn tư cách đơn vị.
- Phạm vi dữ liệu sau đăng nhập (một hoặc nhiều đơn vị theo quyền).
- Danh sách đơn vị thành viên; hồ sơ pháp nhân; cổ đông; phòng ban.
- Ma trận RACI theo pháp nhân; ma trận phân quyền Settings; catalog văn bản / đo lường / giá (autosave).
- KPI rollup trên bảng điều hành theo phạm vi tư cách.
- Lưu sơ đồ quy trình; khởi tạo phiên; hoàn thành bước phê duyệt trên hộp thư.
- Khởi chạy và phê duyệt yêu cầu mở rộng danh mục Nhân sự.

### 4.2 Ngoài phạm vi đợt này (bổ sung đợt sau)

- Từ chối bước quy trình / danh mục; CAT / WF phụ (mẫu, phiên bản).
- Ánh xạ RACI–phân hệ / import catalog / báo cáo độ phủ đầy đủ.
- Toàn bộ danh mục DM logistics.
- Nghiệp vụ chuyên sâu Nhân sự / vận hành xe / tài chính.

## 5. Bên liên quan

| Nhóm | Vai trò |
|------|---------|
| Lãnh đạo tập đoàn | Xem đơn vị thành viên; RACI; KPI rollup; duyệt quy trình / danh mục theo quyền |
| Quản trị cấu hình | Sửa hồ sơ pháp nhân, cổ đông, phòng ban, phân quyền, catalog CC; thiết kế quy trình |
| Lãnh đạo đơn vị thành viên | Chỉ dữ liệu đơn vị mình; không rollup tập đoàn nếu không được cấp |
| Phân hệ Nhân sự (tiêu thụ) | Nhận danh mục đã phát hành / duyệt |

## 6. Yêu cầu nghiệp vụ (Yêu cầu-N)

> Khóa theo inventory đội ngũ. Bảng dưới = W1 + W2 batch đã có FR trên SRS khách. Catalog đầy đủ ~97+7 UC không đồng nghĩa đã đặc tả hết thân.

| Mã | Mô tả ngắn | Ưu tiên | UC / FR primary |
|----|------------|---------|-----------------|
| Yêu cầu-01 | Đăng nhập cổng điều hành | Cao | UC-XBOS-AUTH-01 |
| Yêu cầu-02 | Liệt kê / chọn tư cách đơn vị | Cao | UC-XBOS-TENANT-01 |
| Yêu cầu-03 | Phạm vi dữ liệu khi đã đăng nhập | Cao | UC-ECO-SCOPE-02 |
| Yêu cầu-04 | Danh sách / cây đơn vị thành viên | Cao | UC-XBOS-ORG-01 |
| Yêu cầu-05 | Hồ sơ pháp nhân và tài liệu pháp lý | Cao | UC-XBOS-ORG-03 |
| Yêu cầu-06 | Cổ đông theo pháp nhân (thành viên / tập đoàn) | Cao | UC-CC-P0-01 |
| Yêu cầu-07 | Phòng ban theo đơn vị | Cao | UC-XBOS-ORG-02 |
| Yêu cầu-08 | Quy trình canvas + khởi tạo + duyệt; duyệt danh mục HRM | Cao | UC-XBOS-WF-01 · 03 · 04 · CAT-02 · CAT-05 |
| Yêu cầu-09 | Ma trận RACI theo pháp nhân | Cao | UC-RACI-02 |
| Yêu cầu-10 | Ma trận phân quyền Settings | Cao | UC-CC-P0-04 |
| Yêu cầu-11 | Catalog CC autosave (văn bản / đo lường / giá) | Cao | UC-CC-P0-05 |
| Yêu cầu-12 | KPI rollup đa cấp trên bảng điều hành | Cao | UC-XBOS-KPI-03 |

## 7. Quy tắc nghiệp vụ

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| Quy tắc-1 | Thao tác trên pháp nhân / phòng ban / cổ đông / RACI | Chỉ trong phạm vi đơn vị được cấp | Không lộ chéo đơn vị |
| Quy tắc-2 | Lãnh đạo đơn vị thành viên | Không xem rollup / danh sách ngoài quyền | Từ chối rõ ràng trên giao diện |
| Quy tắc-3 | Duyệt quy trình / danh mục | Đúng người được gán bước; ghi nhận kết quả | Trạng thái phiên cập nhật; tải lại vẫn đúng |
| Quy tắc-4 | Danh mục Nhân sự | Chỉ dùng sau khi bước duyệt thành công (khi cấu hình bắt buộc duyệt) | Phân hệ đích nhận giá trị chuẩn |
| Quy tắc-5 | Phân quyền Settings / catalog CC | Lưu ô / checkbox trong phạm vi cấu hình | Tải lại còn đúng; không lộ ngoài quyền |

## 8. Tham chiếu

| Tài liệu | Nội dung |
|----------|----------|
| SRS — Điều hành tập đoàn (khách) | FR W1 + W2 batch |
| Bảng tổng hợp use case XBOS | Catalog đội ngũ |
| Ma trận luồng nghiệm thu cổng | UF-XBOS-01..15 (không rút hàng đã khóa) |
