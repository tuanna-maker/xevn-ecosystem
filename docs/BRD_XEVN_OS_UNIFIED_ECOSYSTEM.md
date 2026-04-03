# BRD — XeVN OS Unified Ecosystem

*Tài liệu BRD tổng hợp toàn hệ sinh thái, lấy `SRS_X_BOS_UNIFIED_PORTAL_COMMAND_CENTER.md` làm trục điều hành; phần KPI bám theo `BRD_X_BOS_GLOBAL_KPI_WATERFALL_ENGINE.md`; phần Policy diễn giải ở mức BRD từ `SRS_X_BOS_GLOBAL_POLICY_INCENTIVE_ENGINE.md`.*

---

## 1. Tầm nhìn

`XeVN OS Unified Ecosystem` là hệ sinh thái điều hành tập đoàn theo mô hình **một trung tâm chỉ huy, nhiều phân hệ chuyên sâu**:

- **X-BOS Unified Portal (Command Center)** là điểm vào thống nhất cho mọi vai trò.
- **Org Engine** quản lý phân quyền theo cây tổ chức, quyết định ai được xem gì.
- **KPI Waterfall Engine** quản trị giao KPI top-down và hội tụ bottom-up toàn tập đoàn.
- **Global Policy Engine** tự động hóa thưởng/phạt theo dữ liệu KPI, sự kiện và SLA.
- Các phân hệ vệ tinh (HRM, vận hành, CRM, tài chính, bảo trì...) là nguồn phát sinh công việc và dữ liệu nghiệp vụ.

Mục tiêu cuối cùng là giúp tập đoàn điều hành trên cùng một bức tranh dữ liệu, giảm phân mảnh và tăng tốc quyết định từ chiến lược đến thực thi.

---

## 2. Business Value

### 2.1 Giá trị cốt lõi ở cấp hệ sinh thái

- Tạo **điểm chạm duy nhất** cho toàn bộ nhân sự, giảm chi phí học hệ thống và giảm thời gian chuyển ngữ cảnh.
- Chuẩn hóa cách đọc dữ liệu quản trị: cùng định nghĩa KPI, cùng nguồn cảnh báo, cùng logic thưởng/phạt.
- Tạo dòng chảy xuyên suốt: **mục tiêu (KPI) → thực thi (task/sự kiện) → đánh giá (policy) → hành động (approval/execution)**.

### 2.2 Giá trị cho lãnh đạo và vận hành

- Lãnh đạo có **Full Visibility** để ra quyết định nhanh theo tình trạng thực tế.
- Quản lý trung gian có **Team Scope** để điều phối nguồn lực theo phạm vi phụ trách.
- Nhân viên có **Self-Focus** để ưu tiên đúng việc cần làm, tránh nhiễu thông tin.

### 2.3 Giá trị về kiểm soát rủi ro

- Giảm rủi ro lệch dữ liệu đa tầng khi phân bổ và hội tụ KPI.
- Giảm rủi ro thưởng/phạt thiếu công bằng nhờ policy theo phiên bản và truy vết evidence.
- Giảm rủi ro lộ dữ liệu ngang cấp nhờ phân quyền theo Org Tree và deny-by-default.

---

## 3. Đối tượng sử dụng (Stakeholders)

| Vai trò | Mục tiêu chính | Giá trị nhận được |
|---|---|---|
| Chủ tịch / BOD | Chỉ đạo chiến lược và giám sát toàn tập đoàn | Bảng điều hành hợp nhất, cảnh báo nóng, KPI hợp nhất, luồng phê duyệt trọng yếu |
| CEO công ty con | Chịu trách nhiệm kết quả phạm vi công ty | Phân bổ KPI đa tầng, theo dõi thực thi, điều chỉnh trong ngưỡng |
| Trưởng khối / Trưởng bộ phận | Điều phối đội nhóm và giao việc | Theo dõi Action Cards của đơn vị, hội tụ KPI nhóm, xử lý exception |
| HR / Ban chính sách | Đảm bảo công bằng thưởng/phạt | Quản trị policy version, review scanning, thi hành chuẩn |
| Nhân viên | Thực thi mục tiêu và công việc hàng ngày | Self-focus workspace, action rõ ràng, phản hồi kết quả minh bạch |
| Admin hệ thống | Duy trì vận hành và cấu hình | Quản trị menu, quyền, tích hợp vệ tinh, theo dõi chất lượng dữ liệu |

---

## 4. Phạm vi nghiệp vụ toàn hệ sinh thái

### 4.1 In-scope

- Command Center hợp nhất menu phân hệ, action cards, widget giám sát.
- Org Engine cho identity, role, membership, data scope theo cây tổ chức.
- Quản trị KPI thác nước đa tầng: khởi tạo gen KPI, phân bổ, hội tụ, khóa kỳ.
- Quản trị Policy thưởng/phạt đa tầng: global policy, override, scanning, approval, execution.
- Kết nối dữ liệu vệ tinh phục vụ hội tụ dashboard và chính sách.

### 4.2 Out-of-scope (giai đoạn hiện tại)

- Thay thế hoàn toàn màn chuyên sâu của mọi phân hệ vệ tinh.
- Tính payroll đầy đủ cuối kỳ ở mức kế toán chi tiết.
- Mô phỏng tài chính nâng cao đa kịch bản chuyên biệt.

---

## 5. Trụ cột nghiệp vụ

### 5.1 Command Center làm trục điều hành

Command Center là cửa vào mặc định:

- Rail menu điều hướng theo quyền.
- Workspace hiển thị Action Cards, Task Counter, KPI Sparkline, Alert List.
- Dữ liệu hiển thị được lọc theo persona và scope tổ chức.

Nguyên tắc giá trị:

- Không thay thế phân hệ chuyên sâu.
- Tập trung vào “việc nào cần xử lý ngay” và “rủi ro nào cần can thiệp”.

### 5.2 KPI Waterfall Engine làm trục mục tiêu

Áp dụng nguyên bản định hướng từ BRD KPI Waterfall:

1. **Khởi tạo Gen KPI**: chuẩn hóa KPI dùng chung, có phiên bản và hiệu lực.
2. **Top-Down Allocation**: giao KPI từ Tập đoàn xuống đa tầng tổ chức.
3. **Bottom-Up Aggregation**: hội tụ kết quả thực tế theo chiều ngược lại.
4. **Freezing**: chốt số và khóa dữ liệu theo kỳ.

Giá trị chính:

- Chuẩn hóa chuỗi trách nhiệm KPI xuyên tầng.
- Truy vết được nguồn gốc số liệu hợp nhất.
- Giảm tranh chấp khi đánh giá hiệu suất.

### 5.3 Global Policy Engine làm trục công bằng dữ liệu

Diễn giải BRD từ SRS Policy:

- Ban hành **chính sách khung toàn tập đoàn** (global policy).
- Đơn vị thành viên được **kế thừa và ghi đè có kiểm soát** trong vùng giới hạn.
- Engine quét dữ liệu từ KPI/Event/SLA để sinh đề xuất thưởng/phạt.
- Danh sách đề xuất đi qua lớp review/phê duyệt trước khi thi hành.

Nguyên tắc chính sách:

- Cùng dữ liệu đầu vào + cùng policy version => cùng kết quả.
- Có cơ chế lũy tiến cho vi phạm lặp lại.
- Có miễn trừ cho trường hợp khách quan nhưng phải có evidence và lý do.

---

## 6. Quy trình nghiệp vụ tổng thể

### 6.1 Luồng xuyên suốt hệ sinh thái

1. Tập đoàn thiết lập mục tiêu (Gen KPI) và chính sách khung.
2. KPI được phân bổ thác nước từ cấp tập đoàn xuống các tầng thực thi.
3. Vệ tinh phát sinh công việc, sự kiện vận hành, và dữ liệu thực tế.
4. Portal hội tụ dữ liệu theo scope để người dùng xử lý qua Action Cards.
5. Policy Engine quét dữ liệu KPI/Event/SLA để đề xuất thưởng/phạt.
6. HR/Manager phê duyệt và thi hành sang kênh thông báo / payroll.
7. Kỳ KPI được chốt và khóa, phục vụ báo cáo quản trị và kiểm toán.

### 6.2 Luồng điều hành theo persona

- **BOD:** xem toàn cảnh tập đoàn, duyệt các điểm nghẽn cấp cao.
- **Manager:** xử lý backlog theo phạm vi quản lý, theo dõi KPI nhóm.
- **Employee:** nhận việc, cập nhật thực hiện, phản hồi đúng quy trình.

---

## 7. Ma trận phân quyền mức cao

| Vai trò | Xem Portal toàn cảnh | Giao KPI | Điều chỉnh KPI | Tạo Policy khung | Override Policy | Phê duyệt thưởng/phạt | Thi hành |
|---|---|---|---|---|---|---|---|
| Chủ tịch / BOD | Có (full hoặc theo ủy quyền) | Có (toàn tập đoàn) | Có | Có | Có (theo chính sách) | Có (mức chiến lược) | Ủy quyền |
| CEO công ty con | Có (phạm vi công ty) | Có (phạm vi công ty) | Có (giới hạn) | Không mặc định | Có (phạm vi công ty) | Có | Ủy quyền |
| Trưởng bộ phận | Có (team scope) | Có (phạm vi bộ phận/đội) | Có (giới hạn) | Không | Có (nếu được cấp quyền) | Có (phạm vi đơn vị) | Không mặc định |
| HR/Chính sách | Có (theo phạm vi) | Không | Không | Có (theo phân quyền) | Có (theo phân quyền) | Có | Có (kênh nghiệp vụ) |
| Nhân viên | Self-focus | Không | Không | Không | Không | Không | Không |
| Admin kỹ thuật | Theo policy nội bộ | Không mặc định | Không mặc định | Cấu hình hệ thống | Cấu hình hệ thống | Không mặc định | Không mặc định |

Nguyên tắc áp quyền:

- Quyền luôn gắn đồng thời với **vai trò + phạm vi tổ chức**.
- Không được giao KPI hoặc override policy vượt phạm vi được ủy quyền.
- Mọi thao tác nhạy cảm đều phải có log kiểm toán.

---

## 8. Chỉ số thành công cấp hệ sinh thái

- Tỷ lệ người dùng vào hệ thống qua Command Center làm điểm vào chính.
- Tỷ lệ KPI phân bổ đúng hạn và tỷ lệ sai lệch hội tụ liên tầng.
- Thời gian từ phát sinh sự kiện đến xuất hiện action card/cảnh báo.
- Tỷ lệ đề xuất thưởng/phạt được duyệt đúng hạn.
- Tỷ lệ trường hợp thưởng/phạt có đầy đủ evidence và truy vết policy version.

---

## 9. Roadmap triển khai

### Giai đoạn 1 — Foundation: Portal Menu & Basic Widgets + Core Governance

- Vận hành Command Center với Rail + Action Cards + 3 widget nền tảng.
- Thiết lập Org Engine và data scope cho persona.
- Chuẩn hóa Gen KPI và policy khung mức tập đoàn.

Kết quả bàn giao:

- Một điểm vào thống nhất, có phân quyền, có chỉ báo vận hành cơ bản.

### Giai đoạn 2 — Orchestration: Waterfall KPI + Policy Scanning

- Kích hoạt đầy đủ luồng KPI thác nước (giao, nhận, hội tụ, chốt kỳ).
- Kích hoạt quét thưởng/phạt theo KPI/Event/SLA và lớp phê duyệt.
- Đồng bộ dữ liệu vệ tinh theo lô/chu kỳ ngắn cho Command Center.

Kết quả bàn giao:

- Chu trình quản trị mục tiêu và chính sách chạy xuyên suốt ở quy mô tập đoàn.

### Giai đoạn 3 — Real-time Integration & Executive Intelligence

- Đồng bộ gần thời thực từ các vệ tinh ưu tiên.
- Cải thiện cảnh báo nóng, ưu tiên action theo mức độ rủi ro.
- Tự động hóa sâu hơn luồng execution và báo cáo điều hành.

Kết quả bàn giao:

- Hệ sinh thái điều hành dữ liệu theo thời gian gần thực, phục vụ chỉ đạo chủ động.

---

## 10. Rủi ro chính và nguyên tắc kiểm soát

- **Rủi ro scope sai do Org Tree:** kiểm soát bằng quy trình quản trị tổ chức và kiểm tra định kỳ phân quyền.
- **Rủi ro lệch dữ liệu KPI liên tầng:** kiểm soát bằng chuẩn hội tụ, cảnh báo sai lệch, truy ngược nguồn.
- **Rủi ro override policy quá mức:** kiểm soát bằng limit zone và approval theo thẩm quyền.
- **Rủi ro trễ đồng bộ vệ tinh:** hiển thị `asOf`, đánh dấu trạng thái pending, có cơ chế retry.
- **Rủi ro thiếu minh bạch khi thi hành:** bắt buộc lưu vết theo policy version, evidence, người phê duyệt.

---

## 11. Kết luận

`XeVN OS Unified Ecosystem` đặt Command Center làm trung tâm điều hành, KPI Waterfall làm trung tâm mục tiêu, và Global Policy Engine làm trung tâm công bằng dữ liệu. Ba trụ cột này liên kết thành một vòng vận hành khép kín: **định hướng mục tiêu → tổ chức thực thi → đánh giá minh bạch → điều chỉnh liên tục**, phù hợp cho quản trị tập đoàn đa công ty, đa tầng và đa phân hệ.

