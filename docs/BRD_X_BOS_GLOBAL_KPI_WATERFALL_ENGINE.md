# BRD — X-BOS Global KPI Waterfall Engine

## 1. Tầm nhìn
`X-BOS Global KPI Waterfall Engine` là phân hệ quản trị KPI theo mô hình thác nước toàn tập đoàn, giúp giao chỉ tiêu từ cấp cao nhất xuống đa tầng tổ chức và hội tụ kết quả thực tế theo chiều ngược lại, bảo đảm dữ liệu nhất quán, truy vết được, và chốt số đúng kỳ.

Mục tiêu là tạo một “xương sống KPI” dùng chung cho toàn hệ sinh thái quản trị, nơi mọi cấp đều làm việc trên cùng một bộ định nghĩa KPI, cùng chu kỳ, và cùng quy tắc khóa dữ liệu.

---

## 2. Business Value

### 2.1 Giải quyết bài toán cốt lõi
- Phân bổ KPI từ Tập đoàn xuống nhiều tầng (`Subsidiary -> Block -> Dept -> Unit`) mà không làm lệch dữ liệu giữa các cấp.
- Loại bỏ tình trạng mỗi đơn vị tự tính một kiểu, gây sai lệch số tổng hợp và tranh chấp khi đánh giá.
- Chuẩn hóa “chuỗi trách nhiệm KPI”: ai giao, ai nhận, ai phân rã tiếp, ai chịu trách nhiệm cuối.

### 2.2 Giá trị kinh doanh trực tiếp
- **Minh bạch điều hành:** Ban lãnh đạo theo dõi được trạng thái giao KPI theo từng tầng trong thời gian thực.
- **Tăng tốc chu kỳ quản trị:** Rút ngắn thời gian giao KPI đầu kỳ và chốt số cuối kỳ.
- **Giảm rủi ro quyết định sai:** Dữ liệu hội tụ một nguồn chuẩn, giảm sai khác giữa báo cáo quản trị và vận hành.
- **Nâng hiệu suất tổ chức:** KPI đi đến đúng đơn vị/cá nhân thực thi, có đại diện theo dõi rõ ràng.

### 2.3 KPI thành công của phân hệ
- Tỷ lệ phân bổ KPI đúng hạn theo kỳ.
- Tỷ lệ sai lệch giữa số hợp nhất và số cấp dưới báo cáo.
- Thời gian từ “mở kỳ” đến “khóa kỳ”.
- Tỷ lệ KPI có đầy đủ chuỗi giao việc (có người giao và người nhận ở mọi tầng liên quan).

---

## 3. Stakeholders
| Vai trò | Mục tiêu chính | Trách nhiệm trong hệ thống |
|---|---|---|
| Chủ tịch | Giao KPI chiến lược toàn tập đoàn | Khởi tạo/chốt KPI cấp tập đoàn, phê duyệt nguyên tắc phân bổ |
| CEO Công ty con | Phân bổ KPI về phạm vi công ty con | Nhận KPI từ tập đoàn, phân rã xuống Block/Dept theo năng lực thực thi |
| Trưởng bộ phận | Nhận KPI và giao tiếp xuống đội/đơn vị | Điều phối thực thi, cân bằng giữa chỉ tiêu và năng lực đơn vị |
| Nhân viên | Thực hiện KPI đã nhận | Cập nhật thực tế, phản hồi vướng mắc, chịu đánh giá theo KPI |

---

## 4. Phạm vi nghiệp vụ

### 4.1 In-scope
- Định nghĩa Gen KPI (DNA) dùng chung toàn tập đoàn.
- Phân bổ KPI thác nước theo cây tổ chức đa tầng.
- Hội tụ số thực tế bottom-up theo kỳ.
- Chốt số và khóa dữ liệu theo kỳ tính.
- Ma trận phân quyền giao/xem/điều chỉnh theo vai trò và phạm vi tổ chức.

### 4.2 Out-of-scope (giai đoạn này)
- Tính lương thưởng chi tiết cuối cùng.
- Tích hợp đầy đủ mọi nguồn dữ liệu vệ tinh ngoài danh sách ưu tiên roadmap.
- Cơ chế mô phỏng tài chính nâng cao (what-if nhiều kịch bản phức hợp).

---

## 5. Quy trình nghiệp vụ tổng thể (Business Process)

## 5.1 Khởi tạo Gen KPI (DNA)
Mục tiêu: tạo bộ gene KPI chuẩn để toàn hệ thống dùng cùng định nghĩa.

Đầu vào chính:
- Danh mục KPI chiến lược.
- Công thức tham chiếu, đơn vị đo, chu kỳ áp dụng.
- Quy tắc phân rã và nguyên tắc hội tụ.

Kết quả:
- Bộ Gen KPI có phiên bản, có hiệu lực theo thời gian, sẵn sàng phân bổ.

### 5.2 Phân bổ thác nước (Top-Down Allocation)
Mục tiêu: giao KPI từ cấp tập đoàn xuống các tầng tổ chức mà vẫn giữ tính nhất quán.

Nguyên tắc:
- KPI ở cấp cha là “trần/khung” để cấp con phân rã.
- Cấp con chỉ được điều chỉnh trong ngưỡng được phép.
- Mọi lần giao/điều chỉnh phải có người giao, người nhận, thời điểm và lý do.

Kết quả:
- Mỗi node tổ chức nhận KPI rõ ràng, có đại diện chịu trách nhiệm.

### 5.3 Hội tụ thực tế (Bottom-Up Aggregation)
Mục tiêu: tổng hợp số thực hiện từ `Unit -> Dept -> Block -> Subsidiary -> Tập đoàn`.

Nguyên tắc:
- Hội tụ theo đúng công thức trong Gen KPI.
- Có kiểm tra lệch dữ liệu giữa các tầng và cảnh báo sai số.
- Có cơ chế truy ngược từ số hợp nhất về từng điểm dữ liệu nguồn.

Kết quả:
- Dashboard hợp nhất tin cậy cho điều hành theo kỳ.

### 5.4 Chốt số & Khóa dữ liệu (Freezing)
Mục tiêu: đảm bảo số liệu đánh giá không bị thay đổi sau thời điểm chốt.

Nguyên tắc:
- Chốt theo kỳ và phạm vi tổ chức.
- Sau khi khóa, mọi thay đổi phải qua luồng mở khóa có thẩm quyền.
- Lưu dấu vết kiểm toán đầy đủ (ai, khi nào, thay đổi gì, lý do).

Kết quả:
- Kỳ KPI được đóng sổ, ổn định cho báo cáo quản trị và đánh giá hiệu suất.

---

## 6. Ma trận phân quyền mức cao
| Vai trò | Giao KPI | Xem KPI | Điều chỉnh KPI | Khóa dữ liệu | Mở khóa dữ liệu |
|---|---|---|---|---|---|
| Chủ tịch | Toàn tập đoàn | Toàn tập đoàn | Toàn tập đoàn | Có | Có |
| CEO Công ty con | Trong phạm vi công ty con | Trong phạm vi công ty con | Trong phạm vi công ty con | Có (phạm vi công ty con) | Đề nghị, hoặc được cấp quyền |
| Trưởng bộ phận | Trong phạm vi bộ phận/đội được giao | Trong phạm vi bộ phận/đội | Có giới hạn theo ngưỡng | Không mặc định | Không mặc định |
| Nhân viên | Không | KPI cá nhân/đơn vị liên quan | Không (chỉ cập nhật thực hiện) | Không | Không |

Nguyên tắc áp quyền:
- Quyền luôn gắn với vai trò và phạm vi tổ chức.
- Không được giao KPI vượt ra ngoài phạm vi được ủy quyền.
- Điều chỉnh KPI phải có log và lý do bắt buộc.

---

## 7. Yêu cầu nghiệp vụ mức cao
- Hệ thống phải hỗ trợ cấu trúc tổ chức đa tầng và thay đổi theo thời gian.
- Mỗi KPI phải có phiên bản và hiệu lực rõ ràng.
- Luồng top-down và bottom-up phải dùng cùng một bộ quy tắc, tránh lệch logic.
- Dữ liệu đã freeze phải bất biến ở mức nghiệp vụ.
- Có khả năng kiểm toán toàn bộ vòng đời KPI: tạo, giao, nhận, điều chỉnh, chốt.

---

## 8. Roadmap triển khai

### Giai đoạn 1 — Core Setup
Mục tiêu:
- Chuẩn hóa mô hình tổ chức đa tầng.
- Xây bộ Gen KPI (DNA), phiên bản hóa, hiệu lực.
- Thiết lập quyền truy cập nền tảng theo vai trò.

Kết quả bàn giao:
- Khung dữ liệu KPI và tổ chức sẵn sàng cho phân bổ.

### Giai đoạn 2 — Waterfall Logic
Mục tiêu:
- Hoàn thiện logic phân bổ Top-Down.
- Hoàn thiện logic hội tụ Bottom-Up.
- Cảnh báo sai lệch và hỗ trợ xử lý điều chỉnh có kiểm soát.

Kết quả bàn giao:
- Vận hành đầy đủ chu trình giao KPI và hội tụ số theo kỳ.

### Giai đoạn 3 — Real-time Integration
Mục tiêu:
- Kết nối dữ liệu thực tế từ các hệ thống vận hành.
- Cập nhật tiến độ KPI gần thời gian thực.
- Tự động hóa chốt kỳ, khóa dữ liệu, và phát hành báo cáo điều hành.

Kết quả bàn giao:
- Hệ thống KPI hợp nhất theo thời gian thực, phục vụ điều hành chủ động.

---

## 9. Rủi ro & nguyên tắc kiểm soát
- **Rủi ro lệch dữ liệu liên tầng:** kiểm soát bằng quy tắc hội tụ chuẩn và cảnh báo sai lệch.
- **Rủi ro phân quyền chồng chéo:** kiểm soát bằng mô hình role + scope rõ ràng, deny-by-default.
- **Rủi ro điều chỉnh KPI thiếu kiểm soát:** bắt buộc audit log và quy trình phê duyệt theo cấp.
- **Rủi ro chậm chốt kỳ:** thiết lập lịch freeze chuẩn, nhắc hạn, escalation theo vai trò.

---

## 10. Kết luận
`X-BOS Global KPI Waterfall Engine` tạo nền tảng quản trị KPI xuyên suốt từ chiến lược đến thực thi, bảo đảm KPI được giao đúng người, hội tụ đúng số, và khóa đúng kỳ. Đây là phân hệ trọng yếu để nâng chất lượng điều hành dữ liệu và hiệu suất tổ chức ở quy mô tập đoàn đa tầng.

