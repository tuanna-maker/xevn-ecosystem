# BRD — X-BOS Unified Portal (Command Center)

*Bản đầy đủ cho toàn hệ sinh thái, viết theo ngôn ngữ đơn giản cho người không IT. Tài liệu lấy Command Center làm trục chính, đồng thời gộp nội dung quan trọng từ các BRD và SRS còn lại để mô tả đầy đủ bức tranh vận hành tập đoàn.*

| Thuộc tính | Giá trị |
|------------|---------|
| Sản phẩm | X-BOS Unified Portal (Command Center) |
| Hệ sinh thái | XeVN OS |
| Mục đích | Một cửa điều hành cho toàn tập đoàn |
| Phiên bản tài liệu | 2.0 |
| Ngày cập nhật | 2026-03-27 |

---

## 1. Tóm tắt điều hành

Hiện tại doanh nghiệp thường gặp một vấn đề lớn: dữ liệu nằm rải rác ở nhiều phần mềm khác nhau. Lãnh đạo muốn xem toàn cảnh phải mở nhiều màn hình. Quản lý muốn điều hành đội nhóm cũng phải đi tìm thông tin ở nhiều nơi. Nhân viên thì dễ bị quá tải vì có quá nhiều thông báo, không biết việc nào cần làm trước.

`X-BOS Unified Portal (Command Center)` được xây để giải quyết đúng bài toán đó:

- Vào một màn hình là thấy ngay việc cần xử lý.
- Mỗi người thấy đúng phần dữ liệu của mình.
- Các chỉ số KPI, cảnh báo rủi ro, chính sách thưởng/phạt được nối thành một luồng thống nhất.

Nói ngắn gọn: đây là “phòng điều hành trung tâm” của toàn hệ sinh thái XeVN OS.

---

## 2. Bối cảnh nghiệp vụ và lý do cần Command Center

### 2.1 Thực trạng trước khi có Command Center

- Dữ liệu phân tán theo từng phân hệ (nhân sự, vận hành, khách hàng, tài chính...).
- Cùng một vấn đề nhưng mỗi nơi nhìn một kiểu số khác nhau.
- Quyết định chậm vì mất thời gian tổng hợp thủ công.
- Khó kiểm soát việc đã giao, việc đang nợ, việc nào có rủi ro cao.

### 2.2 Mục tiêu kinh doanh khi triển khai

- Tạo một điểm vào duy nhất cho toàn bộ nhân sự.
- Giảm thời gian “đi tìm dữ liệu”.
- Tăng tốc xử lý công việc liên phòng ban.
- Tăng tính minh bạch khi đánh giá KPI và thi hành chính sách thưởng/phạt.

### 2.3 Tầm nhìn sản phẩm

Command Center không thay thế các phân hệ chuyên sâu. Command Center đóng vai trò:

- Cửa vào thống nhất.
- Nơi hội tụ dữ liệu quan trọng.
- Nơi điều phối hành động theo vai trò.

---

## 3. Business Value của toàn hệ sinh thái

### 3.1 Giá trị cho tập đoàn

- Ban điều hành có bức tranh tổng thể theo thời gian gần thực.
- Có một ngôn ngữ dữ liệu chung để các công ty con làm việc cùng nhau.
- Giảm sai lệch khi tổng hợp số liệu từ nhiều tầng tổ chức.

### 3.2 Giá trị cho cấp quản lý

- Nhìn ngay backlog công việc của đội.
- Biết việc nào trễ hạn, việc nào cần ưu tiên cao.
- Theo dõi tiến độ KPI nhóm trong cùng màn hình.

### 3.3 Giá trị cho nhân viên

- Chỉ thấy việc liên quan tới bản thân.
- Dễ xác định thứ tự ưu tiên.
- Nhận phản hồi minh bạch dựa trên dữ liệu.

### 3.4 Giá trị về quản trị rủi ro

- Hạn chế dữ liệu nhạy cảm bị nhìn nhầm phạm vi.
- Hạn chế thưởng/phạt cảm tính vì có quy tắc rõ.
- Hạn chế tranh cãi khi chốt KPI do có truy vết đầy đủ.

---

## 4. Phạm vi tổng thể của hệ sinh thái trong Command Center

### 4.1 In-scope

- Điều hướng toàn bộ phân hệ từ Rail menu bên trái.
- Workspace bên phải gồm Action Cards và các widget điều hành.
- Lọc dữ liệu theo phạm vi tổ chức và vai trò.
- Nối luồng dữ liệu từ:
  - KPI Waterfall Engine.
  - Global Policy Engine.
  - Các hệ vệ tinh như HRM, vận hành, CRM, tài chính, bảo trì.

### 4.2 Out-of-scope

- Không thay thế toàn bộ màn nghiệp vụ sâu của từng phân hệ.
- Không đi vào thiết kế kỹ thuật chi tiết API/database trong BRD này.
- Không mô tả quy trình payroll chi tiết cấp kế toán.

---

## 5. Đối tượng sử dụng (Stakeholders)

| Vai trò | Cần gì ở hệ thống | Hệ thống đáp ứng thế nào |
|---|---|---|
| Chủ tịch / BOD | Thấy toàn cảnh để ra quyết định nhanh | Full Visibility: KPI tổng hợp, cảnh báo nóng, việc chờ duyệt |
| CEO công ty con | Điều hành phạm vi công ty | Dashboard phạm vi công ty, theo dõi phân bổ KPI và kết quả |
| Trưởng khối / Trưởng phòng | Quản lý đội nhóm | Team Scope: việc của đơn vị, KPI nhóm, cảnh báo liên quan |
| HR / Ban chính sách | Đảm bảo công bằng thưởng phạt | Theo dõi scanning, duyệt đề xuất, thi hành theo chính sách |
| Nhân viên | Biết việc nào cần làm ngay | Self-Focus: công việc cá nhân, deadline, thông báo liên quan |
| Admin hệ thống | Quản trị vận hành | Quản lý menu, quyền, tích hợp, chất lượng dữ liệu |

---

## 6. Persona-based Experience

### 6.1 Chủ tịch / BOD — Full Visibility

- Thấy toàn cảnh theo tập đoàn hoặc phạm vi được ủy quyền.
- Ưu tiên thông tin mức chiến lược: rủi ro lớn, KPI tổng, quyết định cần duyệt.
- Ít thao tác chi tiết, tập trung vào “ra quyết định đúng lúc”.

### 6.2 Quản lý — Team Scope

- Thấy phạm vi theo cây tổ chức được giao.
- Tập trung vào điều phối: ai đang tắc việc, việc nào trễ, KPI nào lệch ngưỡng.
- Có thể xử lý nhanh các việc trong quyền hạn.

### 6.3 Nhân viên — Self-Focus

- Chỉ thấy việc của mình hoặc nhóm trực tiếp liên quan.
- Tập trung “hôm nay làm gì”, hạn chót khi nào, ai đang chờ mình.
- Trải nghiệm gọn, giảm nhiễu.

---

## 7. Bức tranh chức năng của toàn hệ sinh thái

### 7.1 Trục 1 — Command Center

Là trục trải nghiệm người dùng:

- Rail menu bên trái: chọn phân hệ.
- Workspace bên phải: Action Cards + widget.
- Các widget chính:
  - `Task_Counter`: đang có bao nhiêu việc mở.
  - `KPI_Sparkline`: xu hướng KPI nhanh.
  - `Alert_List`: cảnh báo cần quan tâm.

### 7.2 Trục 2 — KPI Waterfall Engine

Là trục mục tiêu tập đoàn, kế thừa nội dung chi tiết từ BRD KPI:

1. Khởi tạo Gen KPI dùng chung.
2. Giao KPI theo mô hình thác nước từ trên xuống.
3. Hội tụ kết quả thực tế từ dưới lên.
4. Chốt kỳ và khóa số liệu.

Điểm quan trọng:

- Giao KPI đến đúng người, đúng cấp.
- Truy được nguồn gốc từng con số.
- Giảm lệch số giữa các tầng tổ chức.

### 7.3 Trục 3 — Global Policy & Incentive Engine

Là trục công bằng dữ liệu, diễn giải từ SRS Policy sang ngôn ngữ BRD:

- Có chính sách khung cấp tập đoàn.
- Đơn vị con được override trong giới hạn cho phép.
- Hệ thống tự quét dữ liệu KPI, event, SLA để đề xuất thưởng/phạt.
- Có lớp phê duyệt trước thi hành.
- Có lũy tiến, miễn trừ, bằng chứng đi kèm.

Điểm quan trọng:

- Cùng dữ liệu + cùng phiên bản policy => cùng kết quả.
- Hạn chế thưởng/phạt cảm tính.
- Có căn cứ rõ khi giải trình.

### 7.4 Trục 4 — Org Engine và phân quyền

- Mọi dữ liệu đều đi qua “bộ lọc phạm vi”.
- Manager phòng A chỉ thấy dữ liệu phòng A (và nhánh được giao).
- Nhân viên không thấy dữ liệu ngang cấp không liên quan.

### 7.5 Trục 5 — Vệ tinh nghiệp vụ

Các phân hệ vệ tinh tạo dữ liệu thật hàng ngày. Command Center chỉ hội tụ để điều hành:

- HRM.
- Vận tải / logistics.
- CRM.
- Tài chính.
- Bảo trì.
- Các phân hệ khác trong hệ sinh thái.

---

## 8. Luồng nghiệp vụ xuyên suốt

### 8.1 Luồng chuẩn

1. Tập đoàn đặt mục tiêu và chính sách khung.
2. KPI được phân bổ dần xuống các cấp thực thi.
3. Phân hệ vệ tinh phát sinh công việc và sự kiện.
4. Command Center hội tụ thành Action Cards và cảnh báo.
5. Policy Engine quét và tạo đề xuất thưởng/phạt.
6. HR/Manager phê duyệt.
7. Thi hành và ghi nhận kết quả.
8. Chốt kỳ KPI và khóa dữ liệu.

### 8.2 Luồng ra quyết định nhanh

- Khi có cảnh báo nóng, lãnh đạo thấy ngay trên Command Center.
- Bấm vào card để vào đúng phân hệ cần xử lý.
- Sau xử lý, trạng thái cập nhật ngược về Command Center.

---

## 9. Ma trận phân quyền mức cao

| Vai trò | Xem Command Center | Giao KPI | Điều chỉnh KPI | Tạo Policy khung | Override Policy | Duyệt thưởng/phạt | Thi hành |
|---|---|---|---|---|---|---|---|
| Chủ tịch / BOD | Có | Có toàn tập đoàn | Có | Có | Có theo thẩm quyền | Có | Ủy quyền |
| CEO công ty con | Có trong phạm vi | Có trong phạm vi | Có giới hạn | Không mặc định | Có trong phạm vi | Có | Ủy quyền |
| Trưởng bộ phận | Có trong phạm vi | Có trong phạm vi | Có giới hạn | Không | Có nếu được cấp quyền | Có trong phạm vi | Không mặc định |
| HR / Chính sách | Có theo phạm vi | Không | Không | Có theo phân quyền | Có theo phân quyền | Có | Có |
| Nhân viên | Self-Focus | Không | Không | Không | Không | Không | Không |
| Admin kỹ thuật | Theo policy nội bộ | Không mặc định | Không mặc định | Cấu hình hệ thống | Cấu hình hệ thống | Không mặc định | Không mặc định |

Nguyên tắc áp quyền:

- Quyền luôn gắn với vai trò và phạm vi tổ chức.
- Không ai được thao tác vượt phạm vi được ủy quyền.
- Tất cả thay đổi quan trọng phải có log kiểm toán.

---

## 10. Yêu cầu nghiệp vụ cho từng nhóm chức năng

### 10.1 Điều hướng và trải nghiệm

- Một điểm đăng nhập dùng cho toàn hệ sinh thái.
- Người dùng vào là thấy đúng menu được cấp quyền.
- Mỗi màn chính cần có hành động rõ ràng, dễ hiểu, ít gây nhầm.

### 10.2 Hội tụ dữ liệu

- Việc đang xử lý được đếm theo quy tắc thống nhất.
- Tránh trùng việc khi dữ liệu đến từ nhiều nguồn.
- Có dấu thời gian dữ liệu cập nhật gần nhất để người dùng hiểu độ mới.

### 10.3 Quản trị KPI

- Có phiên bản KPI rõ ràng theo kỳ.
- Có dòng trách nhiệm rõ: ai giao, ai nhận, ai chịu trách nhiệm cuối.
- Có cơ chế chốt và mở khóa có kiểm soát.

### 10.4 Quản trị chính sách thưởng/phạt

- Chính sách phải có thời gian hiệu lực rõ ràng.
- Override không được vượt giới hạn tập đoàn đặt ra.
- Trường hợp miễn trừ phải có lý do và bằng chứng.

### 10.5 Quản trị minh bạch

- Mọi thay đổi quan trọng đều có lịch sử.
- Có thể truy ngược một kết quả thưởng/phạt về đúng policy đã dùng.
- Có thể truy ngược một KPI tổng về dữ liệu nguồn.

---

## 11. Chỉ số thành công

| Nhóm chỉ số | Ý nghĩa kinh doanh |
|---|---|
| Tỷ lệ người dùng vào qua Command Center | Đo mức độ thống nhất điểm vào |
| Thời gian từ đăng nhập đến xử lý card đầu tiên | Đo hiệu quả điều hướng |
| Tỷ lệ KPI phân bổ đúng hạn | Đo kỷ luật vận hành mục tiêu |
| Tỷ lệ lệch số liên tầng | Đo chất lượng hội tụ dữ liệu |
| Tỷ lệ đề xuất thưởng/phạt duyệt đúng hạn | Đo hiệu quả vận hành policy |
| Tỷ lệ hồ sơ có đủ evidence khi cần | Đo tính minh bạch và sẵn sàng kiểm toán |

---

## 12. Roadmap triển khai

### Giai đoạn 1 — Portal Menu & Basic Widgets

- Hoàn thiện Rail menu theo quyền.
- Hoàn thiện Action Cards và 3 widget cốt lõi.
- Thiết lập scope dữ liệu theo Org Tree.

Kết quả:

- Có Command Center vận hành được cho điều hành cơ bản.

### Giai đoạn 2 — Waterfall KPI & Policy Scanning

- Kích hoạt đầy đủ luồng KPI thác nước.
- Kích hoạt scanning thưởng/phạt theo KPI/Event/SLA.
- Hoàn thiện luồng review/phê duyệt.

Kết quả:

- Có chu trình khép kín mục tiêu và chính sách ở quy mô tập đoàn.

### Giai đoạn 3 — Real-time Integration

- Đồng bộ dữ liệu gần thời gian thực từ phân hệ ưu tiên.
- Nâng chất lượng cảnh báo nóng và ưu tiên hành động.
- Mở rộng tự động hóa luồng thi hành.

Kết quả:

- Command Center trở thành “bộ não điều hành theo dữ liệu” cho tập đoàn.

---

## 13. Rủi ro và cách kiểm soát

| Rủi ro | Ảnh hưởng | Cách kiểm soát |
|---|---|---|
| Cây tổ chức chưa chuẩn | Phân quyền sai phạm vi | Chuẩn hóa org định kỳ, kiểm tra quyền theo lịch |
| Dữ liệu KPI lệch giữa các tầng | Báo cáo sai, quyết định sai | Chuẩn hội tụ thống nhất, cảnh báo sai lệch |
| Override policy quá mức | Mất công bằng | Limit zone + phê duyệt theo thẩm quyền |
| Đồng bộ vệ tinh trễ | Dashboard chậm cập nhật | Hiển thị thời điểm cập nhật + cơ chế retry |
| Thiếu bằng chứng khi phê duyệt | Khó kiểm toán | Bắt buộc evidence với tình huống quy định |

---

## 14. Điều kiện chấp nhận ở mức nghiệp vụ

- Người dùng theo từng vai trò đăng nhập và thấy đúng phạm vi dữ liệu.
- Ban điều hành xem được dashboard hợp nhất trong một điểm vào.
- Quản lý xử lý được backlog đội nhóm qua Action Cards.
- Luồng KPI đi đủ vòng: giao -> nhận -> cập nhật -> hội tụ -> khóa kỳ.
- Luồng policy đi đủ vòng: ban hành -> scanning -> duyệt -> thi hành.
- Có log đầy đủ cho các thay đổi quan trọng.

---

## 15. Kết luận

`X-BOS Unified Portal (Command Center)` không chỉ là một màn hình đẹp. Đây là lớp điều hành trung tâm giúp toàn bộ hệ sinh thái XeVN OS vận hành thống nhất, minh bạch và nhanh hơn.

Khi kết hợp với KPI Waterfall Engine và Global Policy Engine, tập đoàn có được một vòng quản trị đầy đủ:

**Đặt mục tiêu đúng -> giao đúng người -> theo dõi đúng tiến độ -> đánh giá đúng dữ liệu -> hành động đúng thời điểm.**

