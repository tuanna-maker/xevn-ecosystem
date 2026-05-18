# Danh mục XBOS cho Logistic và Use case phân hệ Logistic

> Phiên bản: 2026-05-18 · Nguồn: prototype `XEVNM-LOGISTICOPPS`, BRD/SRS XBOS, biên bản họp Chủ tịch Nam  
> Đối chiếu biên bản: [`DOI_CHIEU_BIEN_BAN_HOP_LOGISTICS.md`](./DOI_CHIEU_BIEN_BAN_HOP_LOGISTICS.md)  
> **Bảng một dòng / thống kê:** [`BANG_TONG_HOP_USECASE_LOGISTIC.md`](./BANG_TONG_HOP_USECASE_LOGISTIC.md) — **150 use case**  
> **Gom toàn hệ + 111 danh mục:** [`BANG_TONG_HOP_USECASE_XEVN.md`](../ecosystem/BANG_TONG_HOP_USECASE_XEVN.md)

---

## 1. Phân vai dữ liệu

| Lớp | Quản lý tại | Ví dụ |
|-----|-------------|-------|
| Dùng chung tập đoàn | XBOS | Pháp nhân, công ty thành viên, vai trò người dùng |
| Danh mục Logistic | XBOS | Loại xe, loại phí, loại giấy tờ tài xế |
| Dữ liệu nghiệp vụ | Phân hệ Logistic | Từng xe, vận đơn, phiếu kho |

---

## 2. Danh mục XBOS phải khai cho Logistic

### Nhóm 1 — Tổ chức và phạm vi

| STT | Tên danh mục | Cấp | Phạm vi |
|-----|--------------|-----|---------|
| 1 | Cấu trúc tổ chức nội bộ | 2 | Tập đoàn |
| 2 | Công ty / pháp nhân thành viên | 1 | Tập đoàn |
| 3 | Đơn vị vận hành / bộ phận | 2 | Theo công ty |
| 3a | Bộ phận nghiệp vụ Logistic (kinh doanh, vận hành, an toàn, quản lý phương tiện) | 1 | Theo công ty logistic |
| 4 | Vai trò nghiệp vụ Logistic | 1 | Tập đoàn |
| 5 | Khu vực địa lý / vùng miền | 2 | Tập đoàn |

### Nhóm 2 — Địa điểm và hạ tầng

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 6 | Loại địa điểm | 1 |
| 7 | Danh sách địa điểm chuẩn | 1 |
| 8 | Loại khu / vùng trong kho | 1 |
| 9 | Loại bãi / cơ sở hạ tầng | 1 |

### Nhóm 3 — Dịch vụ vận tải (bắt buộc 3 cấp)

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 10 | Lĩnh vực kinh doanh vận tải | 1 |
| 11 | Danh mục dịch vụ | 2 |
| 12 | Sản phẩm / gói dịch vụ cụ thể | 3 |

### Nhóm 4 — Phương tiện (bắt buộc 3 cấp)

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 13 | Lĩnh vực phương tiện | 1 |
| 14 | Danh mục phương tiện | 2 |
| 15 | Loại phương tiện cụ thể | 3 |
| 16 | Nhiên liệu sử dụng | 1 |
| 17 | Loại hộp số / dầu nhớt | 1 |
| 18 | Nhãn trạng thái vận hành xe | 1 |

### Nhóm 5 — Thiết bị gắn xe (3 cấp)

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 19 | Lĩnh vực thiết bị | 1 |
| 20 | Danh mục thiết bị | 2 |
| 21 | Loại thiết bị cụ thể | 3 |

### Nhóm 6 — Công cụ và đồ bảo hộ (3 cấp)

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 22 | Lĩnh vực công cụ | 1 |
| 23 | Danh mục công cụ | 2 |
| 24 | Loại công cụ cụ thể | 3 |

### Nhóm 7 — Vật tư tiêu hao (3 cấp)

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 25 | Lĩnh vực vật tư | 1 |
| 26 | Danh mục vật tư | 2 |
| 27 | Loại vật tư cụ thể | 3 |
| 28 | Loại phụ tùng thay thế | 1 |
| 29 | Đơn vị tính vật tư | 1 |

### Nhóm 8 — Khách hàng và hợp đồng

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 30 | Loại khách hàng | 1 |
| 31 | Nhóm khách hàng | 1 |
| 32 | Loại hợp đồng | 1 |
| 33 | Hình thức thanh toán | 1 |
| 34 | Kỳ đối soát khách hàng | 1 |
| 35 | Mức rủi ro tín dụng | 1 |

### Nhóm 9 — Đối tác vận tải

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 36 | Loại đối tác | 1 |
| 37 | Hạng đối tác / đánh giá SLA | 1 |
| 38 | Điều khoản thanh toán đối tác | 1 |
| 39 | Loại phí trả đối tác | 1 |

### Nhóm 10 — Điều phối, vận đơn, chuyến

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 40 | Loại yêu cầu vận chuyển | 1 |
| 41 | Nguồn tạo yêu cầu | 1 |
| 42 | Loại hàng hóa | 1 |
| 43 | Đơn vị đo khối lượng / thể tích | 1 |
| 44 | Loại chuyến / loại tuyến | 1 |
| 45 | Loại bàn giao giữa các chặng | 1 |
| 46 | Lý do hủy chuyến / hủy yêu cầu | 1 |
| 47 | Mức độ ưu tiên chuyến | 1 |

### Nhóm 11 — Tuân thủ và giấy tờ

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 48 | Loại giấy tờ tài xế | 1 |
| 49 | Loại giấy tờ phương tiện | 1 |
| 50 | Ngưỡng cảnh báo hết hạn | 1 |
| 51 | Lý do cho phép chạy chuyến dù chưa đủ giấy tờ | 1 |

### Nhóm 12 — Giá cước, phí, tài chính

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 52 | Loại phí / khoản thu | 1 |
| 53 | Loại chiết khấu / phụ thu | 1 |
| 54 | Đơn vị tiền tệ | 1 |
| 55 | Loại báo giá | 1 |
| 56 | Lý do điều chỉnh công nợ | 1 |

### Nhóm 13 — Kho vận

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 57 | Loại phiếu nhập kho | 1 |
| 58 | Loại phiếu xuất kho | 1 |
| 59 | Loại kiểm kê | 1 |
| 60 | Lý do chênh lệch tồn kho | 1 |
| 61 | Nhóm hàng hóa trong kho | 1 |

### Nhóm 14 — Sự cố và cảnh báo

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 62 | Loại sự cố vận hành | 1 |
| 63 | Loại ngoại lệ cần xử lý | 1 |
| 64 | Mức độ cảnh báo | 1 |
| 65 | Nguồn cảnh báo | 1 |

### Nhóm 15 — KPI, chính sách, phê duyệt

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 66 | Chỉ số KPI vận tải | 1 |
| 67 | Chính sách SLA theo loại khách | 1 |
| 68 | Loại yêu cầu phê duyệt | 1 |
| 69 | Loại quyết định phê duyệt | 1 |

### Nhóm 16 — Biểu mẫu và trường mở rộng

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 70 | Mẫu biểu in / phiếu | 1 |
| 71 | Trường bổ sung trên vận đơn | 1 |
| 72 | Trường bổ sung trên hồ sơ xe | 1 |

### Nhóm 17 — Tuyến và lộ trình *(bổ sung theo biên bản họp)*

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 73 | Loại tuyến (cố định / phát sinh / nội tỉnh / liên tỉnh) | 1 |
| 74 | Loại hàng vận chuyển (booking lặp theo ngày–tuần–tháng / phát sinh / ghép hàng / nguyên chuyến) | 1 |
| 75 | Loại điểm trên lộ trình (xuất phát, dừng, trạm thu phí, điểm trả, kết thúc) | 1 |
| 76 | Mẫu tuyến dùng chung (tuyến chuẩn công ty) | 1 |
| 77 | Cách tính thời hạn chuyến (theo tổng giờ vận chuyển / theo giờ hẹn trả hàng) | 1 |

### Nhóm 18 — Trạm thu phí và chi phí tuyến

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 78 | Danh mục trạm thu phí | 1 |
| 79 | Loại phí trên tuyến (thu phí, cầu đường, phụ phí đoạn) | 1 |
| 80 | Bảng chi phí trạm thu phí theo loại xe | 2 |

### Nhóm 19 — Quy cách phương tiện và vòng đời xe

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 81 | Quy cách thùng xe (dài, rộng, cao, tải trọng, thể tích xếp hàng) | 1 |
| 82 | Trạng thái vòng đời xe (đang vận hành, bảo dưỡng, bán, chuyển giao, ngưng) | 1 |
| 83 | Lý do gỡ lái xe khỏi xe | 1 |

### Nhóm 20 — Chính sách lái xe và lương vận hành

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 84 | Chính sách phụ cấp đi đường theo quãng km | 2 |
| 85 | Ngưỡng km áp dụng mức phụ cấp (ví dụ dưới 1000 km, 1500 km, 2000 km) | 1 |
| 86 | Khoản khấu trừ trên doanh thu chuyến (xăng, phí đường, bốc xếp, chiết khấu…) | 1 |
| 87 | Cách tính lương theo phần trăm doanh thu chuyến | 1 |

### Nhóm 21 — Kinh doanh đầu chuỗi

| STT | Tên danh mục | Cấp |
|-----|--------------|-----|
| 88 | Loại cơ hội / chào hàng | 1 |
| 89 | Trạng thái báo giá | 1 |
| 90 | Loại khách (doanh nghiệp có hợp đồng / khách lẻ / khách tự do một lần) | 1 |
| 91 | Nguồn đăng ký khách hàng (kinh doanh / nhân viên công ty / tự đến) | 1 |

### Nhóm 22 — Quy trình vận hành trên XBOS *(khung ~20 quy trình)*

| STT | Tên quy trình (định nghĩa trên XBOS) |
|-----|--------------------------------------|
| 92 | Phê duyệt báo giá |
| 93 | Phê duyệt hợp đồng vận tải |
| 94 | Phê duyệt điều phối ngoại lệ |
| 95 | Cho phép xuất chuyến khi thiếu giấy tờ |
| 96 | Phê duyệt đổi xe / đổi lái giữa chuyến |
| 97 | Xử lý giao hàng không thành công |
| 98 | Xử lý hoàn hàng / cả hàng |
| 99 | Phê duyệt chi phí phát sinh trên chuyến |
| 100 | Đối soát cước khách hàng |
| 101 | Đối soát cước đối tác |
| 102 | Phê duyệt điều chỉnh công nợ |
| 103 | Mua sắm / cấp phát vật tư xe |
| 104 | Bảo dưỡng / sửa chữa xe |
| 105 | Bán / chuyển giao xe |
| 106 | Bàn giao tài sản khi nhân sự nghỉ việc (liên HRM) |
| 107 | Khiếu nại khách hàng vận chuyển |
| 108 | Xử lý sự cố an toàn |
| 109 | Phê duyệt tuyến / lộ trình mới |
| 110 | Phê duyệt chính sách phụ cấp lái xe |
| 111 | Chốt lương vận hành theo chuyến (tháng) |

---

## 3. Dữ liệu nghiệp vụ (không phải danh mục — Logistic quản lý)

- Hồ sơ khách hàng cụ thể
- Hợp đồng, báo giá, chào giá
- **Mẫu tuyến cố định** và **lộ trình chi tiết** (điểm, km từng đoạn, trạm thu phí)
- **Lộ trình / điểm trả đã lưu theo từng khách** (biến thể trên tuyến chuẩn)
- Hồ sơ xe (biển số, quy cách thùng, giấy tờ)
- Hồ sơ tài xế (liên kết nhân sự HRM)
- Hồ sơ đối tác và xe thuê
- Đơn booking lặp / yêu cầu vận chuyển phát sinh / vận đơn / chuyến đi
- Phiếu nhập / xuất / kiểm kê kho
- Bảng giá và **ma trận chi phí tuyến × loại xe**
- Biên bản bàn giao khi bán xe hoặc nghỉ việc

---

## 4. Use case quản trị danh mục trên XBOS (Logistic)

| Mã | Tên use case |
|----|--------------|
| XBOS-DM-LOG-01 | Xem tổng quan danh mục theo phân hệ Logistic |
| XBOS-DM-LOG-02 | Tạo nhóm danh mục mới |
| XBOS-DM-LOG-03 | Thêm giá trị vào danh mục |
| XBOS-DM-LOG-04 | Sửa giá trị danh mục |
| XBOS-DM-LOG-05 | Ngừng hoặc kích hoạt giá trị |
| XBOS-DM-LOG-06 | Sắp xếp phân cấp cha–con |
| XBOS-DM-LOG-07 | Gán danh mục cho phân hệ Logistic |
| XBOS-DM-LOG-08 | Gán danh mục theo công ty thành viên |
| XBOS-DM-LOG-09 | Sao chép bộ danh mục sang công ty mới |
| XBOS-DM-LOG-10 | Xuất danh mục ra file |
| XBOS-DM-LOG-11 | Nhập danh mục từ file mẫu |
| XBOS-DM-LOG-12 | Gửi phê duyệt khi sửa danh mục nhạy cảm |
| XBOS-DM-LOG-13 | Phê duyệt hoặc từ chối thay đổi danh mục |
| XBOS-DM-LOG-14 | Xem lịch sử thay đổi danh mục |
| XBOS-DM-LOG-15 | Công ty con yêu cầu bổ sung trường danh mục |
| XBOS-DM-LOG-16 | Công ty con yêu cầu xóa trường — chuyển phê duyệt tập đoàn |
| XBOS-DM-LOG-17 | Phát hành phiên bản danh mục mới |
| XBOS-DM-LOG-18 | Thông báo phân hệ Logistic có danh mục mới |
| XBOS-DM-LOG-19 | Kiểm tra danh mục thiếu trước vận hành |
| XBOS-DM-LOG-20 | Khai báo đủ 3 tầng dịch vụ vận tải |
| XBOS-DM-LOG-21 | Khai báo đủ 3 tầng loại phương tiện |
| XBOS-DM-LOG-22 | Rà soát sản phẩm dịch vụ chưa gắn bảng giá |

---

## 5. Use case nghiệp vụ Logistic (Web)

### 5.0 Kinh doanh đầu chuỗi *(bổ sung theo biên bản họp)*

| Mã | Tên use case |
|----|--------------|
| LG-KD-01 | Quản lý khách hàng doanh nghiệp và liên hệ |
| LG-KD-02 | Đăng ký khách lẻ / khách gửi một lần |
| LG-KD-03 | Lập báo giá / chào giá |
| LG-KD-04 | Phê duyệt báo giá (workflow XBOS) |
| LG-KD-05 | Lập và quản lý hợp đồng vận tải |
| LG-KD-06 | Tạo đơn từ hợp đồng (tuyến cố định, lặp theo kỳ) |
| LG-KD-07 | Tạo đơn phát sinh / ghép hàng / nguyên chuyến |
| LG-KD-08 | Chuyển đơn đã chốt sang vận hành |

### 5.0b Master tuyến và lộ trình

| Mã | Tên use case |
|----|--------------|
| LG-RT-01 | Thiết lập tuyến cố định (điểm đầu–cuối, mô tả, tổng km) |
| LG-RT-02 | Khai báo lộ trình chi tiết (điểm dừng, thứ tự, km từng đoạn) |
| LG-RT-03 | Gắn trạm thu phí và chi phí trên lộ trình |
| LG-RT-04 | Cấu hình thời gian tối thiểu / tối đa và cách tính SLA chuyến |
| LG-RT-05 | Cấu hình chi phí tuyến theo từng loại xe |
| LG-RT-06 | Lưu lộ trình / điểm trả riêng theo khách hàng |
| LG-RT-07 | Chọn tuyến hoặc lộ trình đã lưu khi tạo chuyến |
| LG-RT-08 | Chỉnh sửa tuyến / lộ trình (phiên bản, lịch sử) |

### 5.0c Hạ tầng xe và liên thông nhân sự

| Mã | Tên use case |
|----|--------------|
| LG-HS-01 | Nhập danh sách xe từ file |
| LG-HS-02 | Xuất danh sách xe |
| LG-HS-03 | Khai báo quy cách thùng và tải trọng từng xe |
| LG-HS-04 | Ghi nhận bán / chuyển giao xe |
| LG-HS-05 | Tự gỡ lái xe khi nhân sự nghỉ việc (từ HRM) |
| LG-HS-06 | Lập biên bản bàn giao xe / tài sản khi nghỉ việc |

### 5.1 Tổng quan điều hành

| Mã | Tên use case |
|----|--------------|
| LG-OV-01 | Xem bảng điều hành tổng quan |
| LG-OV-02 | Xem biểu đồ doanh thu – chi phí theo kỳ |
| LG-OV-03 | Xem tổng quan đội xe |
| LG-OV-04 | Lọc số liệu theo công ty / vùng / loại dịch vụ |

### 5.2 Điều phối

| Mã | Tên use case |
|----|--------------|
| LG-DP-01 | Tạo yêu cầu vận chuyển mới |
| LG-DP-02 | Sửa yêu cầu chưa chạy |
| LG-DP-03 | Hủy yêu cầu |
| LG-DP-04 | Xem danh sách yêu cầu theo trạng thái |
| LG-DP-05 | Gán xe nội bộ cho yêu cầu |
| LG-DP-06 | Gán xe đối tác cho yêu cầu |
| LG-DP-07 | Xem trung tâm điều phối |
| LG-DP-08 | Ưu tiên xử lý đơn sắp quá hạn |
| LG-DP-09 | Gán xuất kho / nguồn hàng cho đơn |
| LG-DP-10 | Xem lịch sử dùng xe |
| LG-DP-11 | Sắp lịch xe theo ngày / ca |
| LG-DP-12 | Đổi xe trên lịch |
| LG-DP-13 | Lập lịch tuyến cố định |
| LG-DP-14 | Gán chuyến vào tuyến |
| LG-DP-15 | Kiểm tra giấy tờ trước khi xuất chuyến |
| LG-DP-16 | Cho phép chạy chuyến dù chưa đủ giấy tờ |

### 5.3 Phê duyệt

| Mã | Tên use case |
|----|--------------|
| LG-AP-01 | Xem hàng đợi phê duyệt |
| LG-AP-02 | Phê duyệt yêu cầu điều phối / báo giá / ngoại lệ |
| LG-AP-03 | Từ chối phê duyệt |
| LG-AP-04 | Xem gợi ý rủi ro từ hệ thống hỗ trợ |
| LG-AP-05 | Xem lịch sử quyết định phê duyệt |
| LG-AP-06 | Cấu hình quy trình phê duyệt |

### 5.4 Vận đơn và theo dõi

| Mã | Tên use case |
|----|--------------|
| LG-TR-01 | Xem danh sách vận đơn |
| LG-TR-02 | Tạo vận đơn nhiều chặng |
| LG-TR-03 | Cập nhật trạng thái từng chặng |
| LG-TR-04 | Bàn giao hàng giữa các chặng |
| LG-TR-05 | Theo dõi tiến độ trên bản đồ |
| LG-TR-06 | Ghi nhận trễ / sự cố trên hành trình |
| LG-TR-07 | Xem chi phí từng chặng |
| LG-TR-08 | Mở hồ sơ ngoại lệ |
| LG-TR-09 | Quản lý chuyến hành khách |

### 5.5 Đội xe

| Mã | Tên use case |
|----|--------------|
| LG-FL-01 | Quản lý hồ sơ từng xe |
| LG-FL-02 | Tạo lệnh bảo dưỡng |
| LG-FL-03 | Ghi nhật ký đổ nhiên liệu |
| LG-FL-04 | So sánh tiêu hao với định mức |
| LG-FL-05 | Quản lý xuất – nhập phụ tùng |
| LG-FL-06 | Ghi sự cố / tai nạn liên quan xe |
| LG-FL-07 | Thiết lập và điều chỉnh định mức |
| LG-FL-08 | Xem điểm sức khỏe xe và cảnh báo |
| LG-FL-09 | Xem hành vi lái |
| LG-FL-10 | Xem bảng điểm KPI tài xế |

### 5.6 Đối tác

| Mã | Tên use case |
|----|--------------|
| LG-PT-01 | Quản lý danh sách xe đối tác |
| LG-PT-02 | Quản lý tài xế đối tác |
| LG-PT-03 | Đối soát cước theo chuyến |
| LG-PT-04 | Ghi nhận phạt / thưởng đối tác |

### 5.7 Tuân thủ

| Mã | Tên use case |
|----|--------------|
| LG-CP-01 | Quản lý hồ sơ giấy tờ tài xế |
| LG-CP-02 | Cảnh báo giấy tờ sắp hết hạn |
| LG-CP-03 | Hồ sơ tài xế — thông tin và lịch sử sự cố |
| LG-CP-04 | Báo cáo tuân thủ tổng hợp |
| LG-CP-05 | Quản lý giấy tờ đội xe |

### 5.8 Khách hàng, giá, báo giá

| Mã | Tên use case |
|----|--------------|
| LG-FN-01 | Quản lý khách hàng |
| LG-FN-02 | Quản lý bảng giá và quy tắc tính cước |
| LG-FN-03 | Mô phỏng tính giá |
| LG-FN-04 | Lập báo giá |
| LG-FN-05 | Theo dõi công nợ khách |
| LG-FN-06 | Kế toán xác nhận đối soát |

### 5.9 Kho

| Mã | Tên use case |
|----|--------------|
| LG-WH-01 | Thiết kế sơ đồ kho |
| LG-WH-02 | Tạo phiếu nhập kho |
| LG-WH-03 | Nhập hàng bằng file mẫu |
| LG-WH-04 | Tạo lệnh xuất kho |
| LG-WH-05 | Pick – pack – xuất giao |
| LG-WH-06 | Kiểm kê và xử lý chênh lệch |
| LG-WH-07 | Báo cáo tồn kho |
| LG-WH-08 | Xem hàng đang chờ tại kho |

### 5.10 Vật tư và tài sản

| Mã | Tên use case |
|----|--------------|
| LG-MA-01 | Danh mục vật tư |
| LG-MA-02 | Phiếu xuất – nhập vật tư |
| LG-MA-03 | Đăng ký tài sản |

### 5.11 Hỗ trợ thông minh

| Mã | Tên use case |
|----|--------------|
| LG-AI-01 | Gợi ý kế hoạch điều phối |
| LG-AI-02 | Trung tâm cảnh báo |
| LG-AI-03 | Báo cáo phân tích sâu |

### 5.12 Hệ thống

| Mã | Tên use case |
|----|--------------|
| LG-SY-01 | Xem sơ đồ module hệ thống |
| LG-SY-02 | Cấu hình tham số vận hành |
| LG-SY-03 | Báo cáo tổng hợp |
| LG-SY-04 | Cài đặt người dùng |

---

## 6. Use case ứng dụng lái xe (Mobile)

> **Bắt buộc** triển khai trước hoặc song song go-live (theo biên bản họp).

### 6.1 Nền tảng

| Mã | Tên use case |
|----|--------------|
| LG-MB-01 | Đăng nhập tài xế |
| LG-MB-02 | Xem danh sách chuyến được giao |
| LG-MB-03 | Xem chi tiết chuyến (lộ trình, điểm trả, SLA) |
| LG-MB-04 | Nhận hoặc từ chối chuyến |
| LG-MB-05 | Bắt đầu / kết thúc chuyến |
| LG-MB-06 | Báo trạng thái trên hành trình |
| LG-MB-07 | Gửi vị trí định kỳ |
| LG-MB-08 | Mở chỉ đường theo lộ trình |
| LG-MB-16 | Làm việc khi mất mạng, đồng bộ sau |

### 6.2 Năm công đoạn tại điểm trả hàng *(theo biên bản họp)*

| Mã | Tên use case |
|----|--------------|
| LG-MB-20 | Gọi khách hàng — xác nhận giờ đến, địa chỉ, thăm dò đường |
| LG-MB-21 | Ghi nhận vướng mắc — trả trực tiếp hoặc thuê xe trung chuyển |
| LG-MB-22 | Chụp ảnh tình trạng niêm phong trước khi cắt seal |
| LG-MB-23 | Cắt niêm phong, hạ hàng, kiểm đếm |
| LG-MB-24 | Ký xác nhận bàn giao và niêm phong lại |

### 6.3 Chứng từ và sự cố

| Mã | Tên use case |
|----|--------------|
| LG-MB-09 | Chụp ảnh biên nhận / chứng từ giao hàng |
| LG-MB-10 | Ký nhận trên màn hình |
| LG-MB-11 | Nhập mã xác nhận từ khách |
| LG-MB-12 | Quét mã kiện hàng |
| LG-MB-13 | Báo không giao được / khách từ chối |
| LG-MB-14 | Báo tai nạn / hỏng xe |
| LG-MB-15 | Gọi điều phối từ ứng dụng |
| LG-MB-17 | Ghi phiếu đổ dầu kèm ảnh hóa đơn |

### 6.4 Doanh thu chuyến và lương vận hành *(theo biên bản họp)*

| Mã | Tên use case |
|----|--------------|
| LG-MB-30 | Xem doanh thu từng chuyến |
| LG-MB-31 | Xem các khoản khấu trừ (xăng, phí đường, bốc xếp, chiết khấu…) |
| LG-MB-32 | Xem doanh thu tính lương sau khấu trừ |
| LG-MB-33 | Xem tổng hợp tháng: số chuyến, doanh thu, lương % |
| LG-MB-34 | Xem quãng đường thực tế và so với lộ trình chuẩn |
| LG-MB-35 | Xem phụ cấp đi đường theo ngưỡng km và loại xe |
