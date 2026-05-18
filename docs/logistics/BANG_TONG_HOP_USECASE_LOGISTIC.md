# Bảng tổng hợp use case — Logistic & XBOS (danh mục Logistic)

> **Gom toàn hệ:** [`BANG_TONG_HOP_USECASE_XEVN.md`](../ecosystem/BANG_TONG_HOP_USECASE_XEVN.md)

---

## Thống kê nhanh

| Chỉ tiêu | Số lượng |
|----------|----------|
| **Tổng use case** | **150** |
| Quản trị danh mục trên XBOS | 22 |
| Nghiệp vụ Web (phân hệ Logistic) | 100 |
| Ứng dụng lái xe (Mobile) | 28 |

### Theo nhóm nghiệp vụ (Web + Mobile)

| Nhóm | Số use case |
|------|-------------|
| Kinh doanh đầu chuỗi | 8 |
| Master tuyến và lộ trình | 8 |
| Hạ tầng xe và liên thông nhân sự | 6 |
| Tổng quan điều hành | 4 |
| Điều phối | 16 |
| Phê duyệt | 6 |
| Vận đơn và theo dõi | 9 |
| Đội xe | 10 |
| Đối tác | 4 |
| Tuân thủ | 5 |
| Khách hàng, giá, báo giá | 6 |
| Kho | 8 |
| Vật tư và tài sản | 3 |
| Hỗ trợ thông minh | 3 |
| Hệ thống | 4 |
| Mobile — nền tảng | 9 |
| Mobile — trả hàng (5 công đoạn) | 5 |
| Mobile — chứng từ và sự cố | 8 |
| Mobile — doanh thu và lương | 6 |
| **XBOS — quản trị danh mục** | **22** |

---

## Bảng chung (150 use case)

| STT | Mã | Tên use case | Nhóm nghiệp vụ | Kênh |
|-----|-----|--------------|----------------|------|
| 1 | XBOS-DM-LOG-01 | Xem tổng quan danh mục theo phân hệ Logistic | Quản trị danh mục XBOS | XBOS |
| 2 | XBOS-DM-LOG-02 | Tạo nhóm danh mục mới | Quản trị danh mục XBOS | XBOS |
| 3 | XBOS-DM-LOG-03 | Thêm giá trị vào danh mục | Quản trị danh mục XBOS | XBOS |
| 4 | XBOS-DM-LOG-04 | Sửa giá trị danh mục | Quản trị danh mục XBOS | XBOS |
| 5 | XBOS-DM-LOG-05 | Ngừng hoặc kích hoạt giá trị | Quản trị danh mục XBOS | XBOS |
| 6 | XBOS-DM-LOG-06 | Sắp xếp phân cấp cha–con | Quản trị danh mục XBOS | XBOS |
| 7 | XBOS-DM-LOG-07 | Gán danh mục cho phân hệ Logistic | Quản trị danh mục XBOS | XBOS |
| 8 | XBOS-DM-LOG-08 | Gán danh mục theo công ty thành viên | Quản trị danh mục XBOS | XBOS |
| 9 | XBOS-DM-LOG-09 | Sao chép bộ danh mục sang công ty mới | Quản trị danh mục XBOS | XBOS |
| 10 | XBOS-DM-LOG-10 | Xuất danh mục ra file | Quản trị danh mục XBOS | XBOS |
| 11 | XBOS-DM-LOG-11 | Nhập danh mục từ file mẫu | Quản trị danh mục XBOS | XBOS |
| 12 | XBOS-DM-LOG-12 | Gửi phê duyệt khi sửa danh mục nhạy cảm | Quản trị danh mục XBOS | XBOS |
| 13 | XBOS-DM-LOG-13 | Phê duyệt hoặc từ chối thay đổi danh mục | Quản trị danh mục XBOS | XBOS |
| 14 | XBOS-DM-LOG-14 | Xem lịch sử thay đổi danh mục | Quản trị danh mục XBOS | XBOS |
| 15 | XBOS-DM-LOG-15 | Công ty con yêu cầu bổ sung trường danh mục | Quản trị danh mục XBOS | XBOS |
| 16 | XBOS-DM-LOG-16 | Công ty con yêu cầu xóa trường — chuyển phê duyệt tập đoàn | Quản trị danh mục XBOS | XBOS |
| 17 | XBOS-DM-LOG-17 | Phát hành phiên bản danh mục mới | Quản trị danh mục XBOS | XBOS |
| 18 | XBOS-DM-LOG-18 | Thông báo phân hệ Logistic có danh mục mới | Quản trị danh mục XBOS | XBOS |
| 19 | XBOS-DM-LOG-19 | Kiểm tra danh mục thiếu trước vận hành | Quản trị danh mục XBOS | XBOS |
| 20 | XBOS-DM-LOG-20 | Khai báo đủ 3 tầng dịch vụ vận tải | Quản trị danh mục XBOS | XBOS |
| 21 | XBOS-DM-LOG-21 | Khai báo đủ 3 tầng loại phương tiện | Quản trị danh mục XBOS | XBOS |
| 22 | XBOS-DM-LOG-22 | Rà soát sản phẩm dịch vụ chưa gắn bảng giá | Quản trị danh mục XBOS | XBOS |
| 23 | LG-KD-01 | Quản lý khách hàng doanh nghiệp và liên hệ | Kinh doanh đầu chuỗi | Web |
| 24 | LG-KD-02 | Đăng ký khách lẻ / khách gửi một lần | Kinh doanh đầu chuỗi | Web |
| 25 | LG-KD-03 | Lập báo giá / chào giá | Kinh doanh đầu chuỗi | Web |
| 26 | LG-KD-04 | Phê duyệt báo giá (workflow XBOS) | Kinh doanh đầu chuỗi | Web |
| 27 | LG-KD-05 | Lập và quản lý hợp đồng vận tải | Kinh doanh đầu chuỗi | Web |
| 28 | LG-KD-06 | Tạo đơn từ hợp đồng (tuyến cố định, lặp theo kỳ) | Kinh doanh đầu chuỗi | Web |
| 29 | LG-KD-07 | Tạo đơn phát sinh / ghép hàng / nguyên chuyến | Kinh doanh đầu chuỗi | Web |
| 30 | LG-KD-08 | Chuyển đơn đã chốt sang vận hành | Kinh doanh đầu chuỗi | Web |
| 31 | LG-RT-01 | Thiết lập tuyến cố định (điểm đầu–cuối, mô tả, tổng km) | Master tuyến và lộ trình | Web |
| 32 | LG-RT-02 | Khai báo lộ trình chi tiết (điểm dừng, thứ tự, km từng đoạn) | Master tuyến và lộ trình | Web |
| 33 | LG-RT-03 | Gắn trạm thu phí và chi phí trên lộ trình | Master tuyến và lộ trình | Web |
| 34 | LG-RT-04 | Cấu hình thời gian tối thiểu / tối đa và cách tính SLA chuyến | Master tuyến và lộ trình | Web |
| 35 | LG-RT-05 | Cấu hình chi phí tuyến theo từng loại xe | Master tuyến và lộ trình | Web |
| 36 | LG-RT-06 | Lưu lộ trình / điểm trả riêng theo khách hàng | Master tuyến và lộ trình | Web |
| 37 | LG-RT-07 | Chọn tuyến hoặc lộ trình đã lưu khi tạo chuyến | Master tuyến và lộ trình | Web |
| 38 | LG-RT-08 | Chỉnh sửa tuyến / lộ trình (phiên bản, lịch sử) | Master tuyến và lộ trình | Web |
| 39 | LG-HS-01 | Nhập danh sách xe từ file | Hạ tầng xe và liên thông nhân sự | Web |
| 40 | LG-HS-02 | Xuất danh sách xe | Hạ tầng xe và liên thông nhân sự | Web |
| 41 | LG-HS-03 | Khai báo quy cách thùng và tải trọng từng xe | Hạ tầng xe và liên thông nhân sự | Web |
| 42 | LG-HS-04 | Ghi nhận bán / chuyển giao xe | Hạ tầng xe và liên thông nhân sự | Web |
| 43 | LG-HS-05 | Tự gỡ lái xe khi nhân sự nghỉ việc (từ HRM) | Hạ tầng xe và liên thông nhân sự | Web |
| 44 | LG-HS-06 | Lập biên bản bàn giao xe / tài sản khi nghỉ việc | Hạ tầng xe và liên thông nhân sự | Web |
| 45 | LG-OV-01 | Xem bảng điều hành tổng quan | Tổng quan điều hành | Web |
| 46 | LG-OV-02 | Xem biểu đồ doanh thu – chi phí theo kỳ | Tổng quan điều hành | Web |
| 47 | LG-OV-03 | Xem tổng quan đội xe | Tổng quan điều hành | Web |
| 48 | LG-OV-04 | Lọc số liệu theo công ty / vùng / loại dịch vụ | Tổng quan điều hành | Web |
| 49 | LG-DP-01 | Tạo yêu cầu vận chuyển mới | Điều phối | Web |
| 50 | LG-DP-02 | Sửa yêu cầu chưa chạy | Điều phối | Web |
| 51 | LG-DP-03 | Hủy yêu cầu | Điều phối | Web |
| 52 | LG-DP-04 | Xem danh sách yêu cầu theo trạng thái | Điều phối | Web |
| 53 | LG-DP-05 | Gán xe nội bộ cho yêu cầu | Điều phối | Web |
| 54 | LG-DP-06 | Gán xe đối tác cho yêu cầu | Điều phối | Web |
| 55 | LG-DP-07 | Xem trung tâm điều phối | Điều phối | Web |
| 56 | LG-DP-08 | Ưu tiên xử lý đơn sắp quá hạn | Điều phối | Web |
| 57 | LG-DP-09 | Gán xuất kho / nguồn hàng cho đơn | Điều phối | Web |
| 58 | LG-DP-10 | Xem lịch sử dùng xe | Điều phối | Web |
| 59 | LG-DP-11 | Sắp lịch xe theo ngày / ca | Điều phối | Web |
| 60 | LG-DP-12 | Đổi xe trên lịch | Điều phối | Web |
| 61 | LG-DP-13 | Lập lịch tuyến cố định | Điều phối | Web |
| 62 | LG-DP-14 | Gán chuyến vào tuyến | Điều phối | Web |
| 63 | LG-DP-15 | Kiểm tra giấy tờ trước khi xuất chuyến | Điều phối | Web |
| 64 | LG-DP-16 | Cho phép chạy chuyến dù chưa đủ giấy tờ | Điều phối | Web |
| 65 | LG-AP-01 | Xem hàng đợi phê duyệt | Phê duyệt | Web |
| 66 | LG-AP-02 | Phê duyệt yêu cầu điều phối / báo giá / ngoại lệ | Phê duyệt | Web |
| 67 | LG-AP-03 | Từ chối phê duyệt | Phê duyệt | Web |
| 68 | LG-AP-04 | Xem gợi ý rủi ro từ hệ thống hỗ trợ | Phê duyệt | Web |
| 69 | LG-AP-05 | Xem lịch sử quyết định phê duyệt | Phê duyệt | Web |
| 70 | LG-AP-06 | Cấu hình quy trình phê duyệt | Phê duyệt | Web |
| 71 | LG-TR-01 | Xem danh sách vận đơn | Vận đơn và theo dõi | Web |
| 72 | LG-TR-02 | Tạo vận đơn nhiều chặng | Vận đơn và theo dõi | Web |
| 73 | LG-TR-03 | Cập nhật trạng thái từng chặng | Vận đơn và theo dõi | Web |
| 74 | LG-TR-04 | Bàn giao hàng giữa các chặng | Vận đơn và theo dõi | Web |
| 75 | LG-TR-05 | Theo dõi tiến độ trên bản đồ | Vận đơn và theo dõi | Web |
| 76 | LG-TR-06 | Ghi nhận trễ / sự cố trên hành trình | Vận đơn và theo dõi | Web |
| 77 | LG-TR-07 | Xem chi phí từng chặng | Vận đơn và theo dõi | Web |
| 78 | LG-TR-08 | Mở hồ sơ ngoại lệ | Vận đơn và theo dõi | Web |
| 79 | LG-TR-09 | Quản lý chuyến hành khách | Vận đơn và theo dõi | Web |
| 80 | LG-FL-01 | Quản lý hồ sơ từng xe | Đội xe | Web |
| 81 | LG-FL-02 | Tạo lệnh bảo dưỡng | Đội xe | Web |
| 82 | LG-FL-03 | Ghi nhật ký đổ nhiên liệu | Đội xe | Web |
| 83 | LG-FL-04 | So sánh tiêu hao với định mức | Đội xe | Web |
| 84 | LG-FL-05 | Quản lý xuất – nhập phụ tùng | Đội xe | Web |
| 85 | LG-FL-06 | Ghi sự cố / tai nạn liên quan xe | Đội xe | Web |
| 86 | LG-FL-07 | Thiết lập và điều chỉnh định mức | Đội xe | Web |
| 87 | LG-FL-08 | Xem điểm sức khỏe xe và cảnh báo | Đội xe | Web |
| 88 | LG-FL-09 | Xem hành vi lái | Đội xe | Web |
| 89 | LG-FL-10 | Xem bảng điểm KPI tài xế | Đội xe | Web |
| 90 | LG-PT-01 | Quản lý danh sách xe đối tác | Đối tác | Web |
| 91 | LG-PT-02 | Quản lý tài xế đối tác | Đối tác | Web |
| 92 | LG-PT-03 | Đối soát cước theo chuyến | Đối tác | Web |
| 93 | LG-PT-04 | Ghi nhận phạt / thưởng đối tác | Đối tác | Web |
| 94 | LG-CP-01 | Quản lý hồ sơ giấy tờ tài xế | Tuân thủ | Web |
| 95 | LG-CP-02 | Cảnh báo giấy tờ sắp hết hạn | Tuân thủ | Web |
| 96 | LG-CP-03 | Hồ sơ tài xế — thông tin và lịch sử sự cố | Tuân thủ | Web |
| 97 | LG-CP-04 | Báo cáo tuân thủ tổng hợp | Tuân thủ | Web |
| 98 | LG-CP-05 | Quản lý giấy tờ đội xe | Tuân thủ | Web |
| 99 | LG-FN-01 | Quản lý khách hàng | Khách hàng, giá, báo giá | Web |
| 100 | LG-FN-02 | Quản lý bảng giá và quy tắc tính cước | Khách hàng, giá, báo giá | Web |
| 101 | LG-FN-03 | Mô phỏng tính giá | Khách hàng, giá, báo giá | Web |
| 102 | LG-FN-04 | Lập báo giá | Khách hàng, giá, báo giá | Web |
| 103 | LG-FN-05 | Theo dõi công nợ khách | Khách hàng, giá, báo giá | Web |
| 104 | LG-FN-06 | Kế toán xác nhận đối soát | Khách hàng, giá, báo giá | Web |
| 105 | LG-WH-01 | Thiết kế sơ đồ kho | Kho | Web |
| 106 | LG-WH-02 | Tạo phiếu nhập kho | Kho | Web |
| 107 | LG-WH-03 | Nhập hàng bằng file mẫu | Kho | Web |
| 108 | LG-WH-04 | Tạo lệnh xuất kho | Kho | Web |
| 109 | LG-WH-05 | Pick – pack – xuất giao | Kho | Web |
| 110 | LG-WH-06 | Kiểm kê và xử lý chênh lệch | Kho | Web |
| 111 | LG-WH-07 | Báo cáo tồn kho | Kho | Web |
| 112 | LG-WH-08 | Xem hàng đang chờ tại kho | Kho | Web |
| 113 | LG-MA-01 | Danh mục vật tư | Vật tư và tài sản | Web |
| 114 | LG-MA-02 | Phiếu xuất – nhập vật tư | Vật tư và tài sản | Web |
| 115 | LG-MA-03 | Đăng ký tài sản | Vật tư và tài sản | Web |
| 116 | LG-AI-01 | Gợi ý kế hoạch điều phối | Hỗ trợ thông minh | Web |
| 117 | LG-AI-02 | Trung tâm cảnh báo | Hỗ trợ thông minh | Web |
| 118 | LG-AI-03 | Báo cáo phân tích sâu | Hỗ trợ thông minh | Web |
| 119 | LG-SY-01 | Xem sơ đồ module hệ thống | Hệ thống | Web |
| 120 | LG-SY-02 | Cấu hình tham số vận hành | Hệ thống | Web |
| 121 | LG-SY-03 | Báo cáo tổng hợp | Hệ thống | Web |
| 122 | LG-SY-04 | Cài đặt người dùng | Hệ thống | Web |
| 123 | LG-MB-01 | Đăng nhập tài xế | Mobile — nền tảng | Mobile |
| 124 | LG-MB-02 | Xem danh sách chuyến được giao | Mobile — nền tảng | Mobile |
| 125 | LG-MB-03 | Xem chi tiết chuyến (lộ trình, điểm trả, SLA) | Mobile — nền tảng | Mobile |
| 126 | LG-MB-04 | Nhận hoặc từ chối chuyến | Mobile — nền tảng | Mobile |
| 127 | LG-MB-05 | Bắt đầu / kết thúc chuyến | Mobile — nền tảng | Mobile |
| 128 | LG-MB-06 | Báo trạng thái trên hành trình | Mobile — nền tảng | Mobile |
| 129 | LG-MB-07 | Gửi vị trí định kỳ | Mobile — nền tảng | Mobile |
| 130 | LG-MB-08 | Mở chỉ đường theo lộ trình | Mobile — nền tảng | Mobile |
| 131 | LG-MB-16 | Làm việc khi mất mạng, đồng bộ sau | Mobile — nền tảng | Mobile |
| 132 | LG-MB-20 | Gọi khách hàng — xác nhận giờ đến, địa chỉ, thăm dò đường | Mobile — trả hàng | Mobile |
| 133 | LG-MB-21 | Ghi nhận vướng mắc — trả trực tiếp hoặc thuê xe trung chuyển | Mobile — trả hàng | Mobile |
| 134 | LG-MB-22 | Chụp ảnh tình trạng niêm phong trước khi cắt seal | Mobile — trả hàng | Mobile |
| 135 | LG-MB-23 | Cắt niêm phong, hạ hàng, kiểm đếm | Mobile — trả hàng | Mobile |
| 136 | LG-MB-24 | Ký xác nhận bàn giao và niêm phong lại | Mobile — trả hàng | Mobile |
| 137 | LG-MB-09 | Chụp ảnh biên nhận / chứng từ giao hàng | Mobile — chứng từ và sự cố | Mobile |
| 138 | LG-MB-10 | Ký nhận trên màn hình | Mobile — chứng từ và sự cố | Mobile |
| 139 | LG-MB-11 | Nhập mã xác nhận từ khách | Mobile — chứng từ và sự cố | Mobile |
| 140 | LG-MB-12 | Quét mã kiện hàng | Mobile — chứng từ và sự cố | Mobile |
| 141 | LG-MB-13 | Báo không giao được / khách từ chối | Mobile — chứng từ và sự cố | Mobile |
| 142 | LG-MB-14 | Báo tai nạn / hỏng xe | Mobile — chứng từ và sự cố | Mobile |
| 143 | LG-MB-15 | Gọi điều phối từ ứng dụng | Mobile — chứng từ và sự cố | Mobile |
| 144 | LG-MB-17 | Ghi phiếu đổ dầu kèm ảnh hóa đơn | Mobile — chứng từ và sự cố | Mobile |
| 145 | LG-MB-30 | Xem doanh thu từng chuyến | Mobile — doanh thu và lương | Mobile |
| 146 | LG-MB-31 | Xem các khoản khấu trừ (xăng, phí đường, bốc xếp, chiết khấu…) | Mobile — doanh thu và lương | Mobile |
| 147 | LG-MB-32 | Xem doanh thu tính lương sau khấu trừ | Mobile — doanh thu và lương | Mobile |
| 148 | LG-MB-33 | Xem tổng hợp tháng: số chuyến, doanh thu, lương % | Mobile — doanh thu và lương | Mobile |
| 149 | LG-MB-34 | Xem quãng đường thực tế và so với lộ trình chuẩn | Mobile — doanh thu và lương | Mobile |
| 150 | LG-MB-35 | Xem phụ cấp đi đường theo ngưỡng km và loại xe | Mobile — doanh thu và lương | Mobile |
