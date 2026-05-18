# Biên bản họp — Vận hành Logistics XEVN (Nguyên Văn)

> **Nguồn gốc:** Phiên âm `13.56 Thứ 5 - họp vận hành với anh Nam (xevn)` (~23 phút)  
> **Bản lưu repo:** sao chép từ file người dùng cung cấp (2026-05)  
> **Mục đích sản phẩm:** Căn cứ nghiệp vụ Logistic + vai trò XBOS là nền tảng quản trị điều hành

---

## 1. Thông điệp điều hành (tóm lược nội dung họp)

| Chủ đề | Nội dung chính |
|--------|----------------|
| Thứ tự triển khai | Hệ thống / nền móng → con người (HRM) → kế toán tài chính → quản lý phương tiện–vật tư–kỹ thuật → nghiệp vụ vận hành |
| Luồng nghiệp vụ đầy đủ | Bắt đầu từ **kinh doanh** (khách hàng, hợp đồng, báo giá/chào giá) → mới đến vận chuyển |
| Hai loại hàng | (1) Hàng **tuyến cố định / booking lặp** (ngày/tuần/tháng); (2) Hàng **phát sinh hàng ngày** (ghép hàng, nguyên chuyến, tắt nhá) |
| Tuyến cố định | Thiết lập tuyến: điểm xuất phát–kết thúc, **điểm dừng**, **lộ trình chi tiết**, **km từng đoạn**, **trạm thu phí + chi phí**, thời gian tối ưu min/max, chi phí theo **từng loại xe** |
| SLA chuyến | Tính theo **tổng giờ vận chuyển** (tự tính ngày kết thúc) **hoặc** **hẹn giờ trả hàng** tại điểm |
| Lộ trình lưu riêng | Tuyến dùng chung vs lộ trình/trả hàng **lưu theo khách** (ví dụ Thăng Long: ghé Đà Nẵng bốc, Bình Dương…) |
| Tiền đề vận hành | Phải có **xe** (kích thước thùng, tải trọng), **lái xe**, **nhân sự** trong hệ thống trước |
| Vòng đời xe / lái | Bán xe, chuyển giao, lái nghỉ → tự **gỡ gán**; nghỉ việc HRM → biên bản bàn giao |
| App lái xe | **Bắt buộc** trước/song song go-live; 5 bước tại điểm trả; thống kê **doanh thu / khấu trừ / lương %** theo chuyến và km |
| Quy trình | ~**20 quy trình vận hành**; mở rộng dần (thu, chi, mua sắm, công nợ…) trên XBOS |
| Hệ sinh thái | XBOS = quản trị DN; Logistic / Hành khách = module; app HRM chung; app lái xe **khác biệt** |
| Phạm vi hợp đồng | Hai sản phẩm: nền tảng quản trị + vận hành Logistic; không liệt kê hết use case cố định — làm theo khung |

---

## 2. Phiên âm nguyên văn

*(Giữ nguyên bản phiên âm AI — xem file gốc người dùng hoặc các đoạn timestamp trong bản đầy đủ.)*

Phiên bản đầy đủ timestamp: file người dùng `bien-ban-hop-logistics-xevn-nguyenvan.md`.

**Đoạn 1 (00:00:00–~00:12:00):** Loại hàng, kinh doanh → đơn, tuyến cố định, lộ trình, trạm thu phí, km, khách hàng–hợp đồng, chuyển phát nhanh, hạ tầng xe–lái, thứ tự triển khai NS–KT–phương tiện.

**Đoạn 2 (00:12:00–00:22:14):** Quy trình XBOS, app lái xe 5 bước trả hàng, lương % trên app, phân loại xe và chính sách đi đường theo km, 20 QT vận hành, module hệ sinh thái, hợp đồng triển khai.

---

## 3. Liên kết tài liệu sản phẩm

| Tài liệu | Đường dẫn |
|----------|-----------|
| Đối chiếu & bổ sung | [`docs/logistics/DOI_CHIEU_BIEN_BAN_HOP_LOGISTICS.md`](./logistics/DOI_CHIEU_BIEN_BAN_HOP_LOGISTICS.md) |
| Danh mục XBOS + use case Logistic | [`docs/logistics/DANH_MUC_XBOS_VA_USECASE_LOGISTIC.md`](./logistics/DANH_MUC_XBOS_VA_USECASE_LOGISTIC.md) |
| Use case tổng thể XBOS | [`docs/xbos/USECASE_TONG_THE_XBOS.md`](../xbos/USECASE_TONG_THE_XBOS.md) |
