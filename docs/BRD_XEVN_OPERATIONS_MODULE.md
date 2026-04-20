# BRD — Phân Hệ Vận Hành XeVN (Operations Module)

*Phiên bản: v1.0 (Draft for Review)*
*Ngữ cảnh: Phân hệ vận hành là một nhánh trong hệ sinh thái XeVN OS, kế thừa cấu hình và chuẩn quản trị từ công ty mẹ/tập đoàn.*

---

## 1. Mục tiêu tài liệu

Tài liệu này mô tả:

- Luồng nghiệp vụ thực tế của doanh nghiệp theo hiện trạng vận hành bạn cung cấp.
- Phân tích chuyển đổi số: để số hóa được, quy trình cần chuẩn hóa thêm những gì.
- Danh sách chức năng đầy đủ của hệ thống ở quy mô tập đoàn.
- Ranh giới giữa năng lực dùng chung cấp hệ sinh thái và năng lực riêng của phân hệ vận hành.

---

## 2. Tầm nhìn và mục tiêu kinh doanh

`Operations Module` là lõi điều phối vận chuyển của XeVN:

- Chuẩn hóa điều hành từ phát sinh đơn đến kết thúc toàn trình.
- Quản trị đa mô hình vận tải: `nguyên chuyến`, `ghép hàng`, `trung chuyển`, `đi thẳng`, `tuyến cố định`, `thuê ngoài`.
- Đồng bộ trạng thái theo thời gian thực giữa điều hành, kho, bưu cục, lái xe, vendor.
- Giảm thất thoát và sai lệch qua quét kiện, bằng chứng điện tử, audit trail.
- Cung cấp dashboard quản trị và bộ báo cáo vận hành cho cấp công ty con và tập đoàn.

### 2.1 KPI kỳ vọng (business outcomes)

- Tăng tỷ lệ giao đúng SLA.
- Giảm thời gian phân công lệnh và thời gian xử lý phát sinh.
- Giảm tỷ lệ hoàn/hủy do lỗi vận hành.
- Giảm chi phí vận hành/đơn và chi phí phát sinh không kiểm soát.
- Tăng tính minh bạch và khả năng truy vết quyết định điều hành.

---

## 3. Bối cảnh hệ sinh thái và phạm vi

## 3.1 Vị trí phân hệ trong XeVN OS

- `Unified Portal/Command Center`: điểm vào hợp nhất theo vai trò.
- `Operations Module`: xử lý nghiệp vụ vận chuyển thực thi.
- `Org/Identity Engine` (cấp mẹ): tài khoản, phân quyền, phạm vi dữ liệu.
- `Master Configuration Engine` (cấp mẹ): danh mục chuẩn dùng chung.
- `KPI/Policy Engine` (cấp mẹ): hội tụ KPI, cảnh báo, cơ chế thưởng/phạt.

### 3.1.1 Nguyên tắc danh mục: Web Portal gán — phân hệ tải (xuyên suốt hệ sinh thái)

Đây là **quy tắc nghiệp vụ chung**, áp dụng đồng nhất cho **Vận hành**, **HRM** và mọi phân hệ vệ tinh khác, để BRD / SRS / TechSpec / WBS và mã nguồn sau này **không lệch** vai trò dữ liệu:

1. **Web Portal** là nơi **gán** danh mục dùng chung cho từng **loại đối tượng** (thực thể / domain) và cho từng **phân hệ** được phép dùng danh mục đó trong phạm vi tổ chức.
2. **Mặc định**, mỗi phân hệ **phải tải và sử dụng** đúng các danh mục mà Portal đã gán cho phân hệ đó và cho ngữ cảnh đối tượng (ví dụ Vận hành: tuyến, điểm, vùng, loại phương tiện, loại nhiên liệu…; HRM: tổ chức, chức vụ, phòng ban… — theo cấu hình tập đoàn).
3. **Cộng thêm**, mỗi phân hệ được phép có **danh mục hoặc tham số riêng** do chính phân hệ cấu hình (phạm vi nội bộ module), miễn không trái quy tắc chung và **không** tạo bản “nguồn chuẩn” trùng nghĩa với phần đã do Portal quản trị và gán.

Khi triển khai, **tích hợp cấu hình từ công ty mẹ** được hiểu là nằm trong lớp **gán danh mục / phạm vi** do Portal (và chính sách tập đoàn) kiểm soát, không phải mỗi phân hệ tự định nghĩa lại độc lập.

## 3.2 In-scope

- Quản trị đơn vận hành, lệnh vận chuyển, phân công xe/lái/tuyến.
- Kho vận (nhập kho, kho chia, bàn giao), bưu cục điểm cuối.
- App tác nghiệp lái xe và theo dõi thực thi thời gian thực.
- Xử lý phát sinh/sự cố, theo dõi SLA, báo cáo vận hành.
- Tích hợp dữ liệu và cấu hình từ hệ thống công ty mẹ.

## 3.3 Out-of-scope (giai đoạn này)

- TMS tối ưu tuyến bằng AI nâng cao thời gian thực.
- Billing kế toán đầy đủ đa chuẩn kế toán.
- Thay thế hoàn toàn hệ CRM/ERP chuyên sâu của tập đoàn.

---

## 4. Stakeholders và vai trò

| Vai trò | Trách nhiệm chính | Kỳ vọng hệ thống |
|---|---|---|
| BOD/TGĐ tập đoàn | Giám sát hiệu năng mạng lưới | Dashboard hợp nhất, cảnh báo rủi ro |
| CEO/COO công ty thành viên | Chịu KPI vận hành đơn vị | Theo dõi SLA, chi phí, năng suất |
| Trưởng điều hành | Ra quyết định phân công và điều phối | Bảng điều hành realtime, công cụ xử lý ngoại lệ |
| NV điều hành | Tạo lệnh, phân xe/tuyến, kiểm soát tiến độ | Workflow nhanh, rule rõ, nhắc việc |
| NV kho/kho chia | Nhập/xuất/chia hàng, đối soát kiện | Quét kiện chuẩn, bàn giao điện tử |
| NV bưu cục điểm cuối | Nhận hàng và tổ chức giao cuối | Danh sách giao, xác nhận giao nhận |
| Lái xe nội bộ/trung chuyển | Nhận lệnh, vận chuyển, cập nhật trạng thái | App tác nghiệp đơn giản, offline cơ bản |
| Vendor vận chuyển | Thực hiện lệnh thuê ngoài | Cổng tác nghiệp tối giản, chuẩn chứng từ |
| Admin hệ thống | Quản trị cấu hình và phân quyền | Quản trị danh mục, role, policy |

---

## 5. As-Is Business Flow (Luồng thực tế doanh nghiệp)

Phần này tổng hợp trực tiếp từ các sơ đồ thực tế bạn cung cấp.

## 5.1 Khởi tạo và tiếp nhận đơn

1. Đơn phát sinh từ nhiều nguồn: NV kinh doanh, tổng đài, điều hành, nguồn khác.
2. Khai báo sơ bộ gồm:
   - Thông tin khách hàng.
   - Địa chỉ nhận/trả.
   - Thông tin lô hàng, loại hàng, trọng lượng/thể tích.
   - Giá/thỏa thuận đặc biệt.
3. Thông tin chuyển cho bộ phận điều hành để xác minh và lập phương án.

## 5.2 Điều hành xác minh và chọn mô hình vận tải

1. Điều hành xác minh lại dữ liệu đơn và yêu cầu đặc biệt.
2. Đánh giá điều kiện vận chuyển:
   - Đặc thù hàng hóa.
   - Ràng buộc tuyến đường.
   - Khả năng phương tiện hiện có.
   - Thời gian nhận/trả và chi phí dự kiến.
3. Chọn loại hình vận chuyển:
   - `Xe nguyên chuyến`.
   - `Xe ghép hàng`.
   - Kết hợp `trung chuyển nội bộ` hoặc `thuê ngoài` khi cần.

## 5.3 Nhánh nghiệp vụ chính

- **Nhánh nguyên chuyến**: 1 xe ưu tiên cho 1 lô/chuyến, tuyến rõ, ít điểm dừng.
- **Nhánh ghép hàng**: gom nhiều đơn/lô trên cùng chuyến theo tải trọng, lịch và điểm giao.
- **Nhánh đi thẳng**: xe chính tuyến đi trực tiếp kho khách nhận hoặc điểm nhận đã định.
- **Nhánh nhập kho chính / kho chia**:
  - Nhận hàng, kiểm đếm, cân đo, in/đính kèm chứng từ.
  - Chia theo tuyến/điểm giao.
  - Bàn giao cho xe trung chuyển hoặc bưu cục cuối.
- **Nhánh thuê ngoài (vendor)**:
  - Khi xe nội bộ không đáp ứng tải/công suất/thời gian.
  - Điều hành đề xuất, lập lệnh thuê, theo dõi thực hiện.
- **Nhánh tuyến cố định**:
  - Kế hoạch lặp theo lịch tuyến, tối ưu cho nhu cầu đều theo khu vực.

## 5.4 Thực thi giao nhận

1. Lái xe nhận lệnh và thực thi theo trình tự ứng dụng.
2. Đến điểm nhận/giao: xác nhận trạng thái, quét kiện, cập nhật bằng chứng.
3. Nhánh giao cuối:
   - Khách nhận trực tiếp.
   - Khách nhờ nhận hộ (đối chiếu thông tin và quy tắc thu hộ nếu có).

## 5.5 Theo dõi, phát sinh và kết thúc

1. Điều hành theo dõi tiến độ, thời gian, vị trí và cảnh báo trễ.
2. Nếu có sự cố, lái xe tạo báo phát sinh trên app.
3. Điều hành là đầu mối tiếp nhận ban đầu, phân cấp xử lý.
4. Kết thúc toàn trình sau đối soát trạng thái/chứng từ/chuyến.
5. Cuối ca có tổng hợp báo cáo: hàng nhận/trả, hoàn hủy, chi phí phát sinh, góp ý/đề xuất.

---

## 6. Phân tích chuyển đổi số (To-Be Analysis)

Luồng thực tế đã rõ về nghiệp vụ, nhưng để số hóa bền vững ở quy mô tập đoàn cần bổ sung các lớp chuẩn sau.

## 6.1 Chuẩn hóa đối tượng dữ liệu cốt lõi

Phải định nghĩa thống nhất toàn hệ thống:

- `Đơn vận hành` (Operation Order).
- `Lệnh vận chuyển` (Transport Job).
- `Lô hàng/kiện` (Shipment/Package).
- `Chuyến xe` (Trip).
- `Điểm vận hành` (kho, bưu cục, điểm trung chuyển, điểm giao).
- `Sự cố/phát sinh` (Incident/Ticket).
- `Bằng chứng` (Proof of pickup/delivery).

Nếu không chuẩn hóa object model ngay từ đầu, báo cáo và tự động hóa liên phòng ban sẽ sai lệch.

## 6.2 Chuẩn hóa trạng thái và state machine

Mỗi đối tượng cần có vòng đời rõ:

- `Đơn`: tạo mới -> xác minh -> lập lệnh -> đang vận chuyển -> giao thành công/hoàn/hủy.
- `Lệnh`: nháp -> đã phân công -> đang thực thi -> tạm dừng ngoại lệ -> hoàn tất.
- `Kiện`: chờ nhận -> nhập kho -> xuất kho -> đang giao -> giao xong/hoàn.

Mỗi chuyển trạng thái bắt buộc:

- Người thực hiện.
- Thời gian.
- Nguồn cập nhật (web/app/api).
- Điều kiện kiểm soát (rule pass/fail).

## 6.3 Chuẩn hóa quyết định điều hành bằng rule engine

Luồng thực tế có nhiều quyết định dựa kinh nghiệm. Khi số hóa cần “quy tắc hóa”:

- Rule chọn loại hình vận tải theo tải trọng, tuyến, SLA, năng lực xe.
- Rule gợi ý ghép hàng theo cụm địa lý và khung giờ.
- Rule chuyển thuê ngoài khi vượt ngưỡng tải/công suất.
- Rule cảnh báo trễ theo checkpoint và thời gian đệm.
- Rule kiểm soát phụ phí và mức phê duyệt.

## 6.4 Chuẩn hóa tác nghiệp hiện trường

App lái xe cần checklist bắt buộc theo từng loại nhiệm vụ:

- Trước chuyến: xác nhận phương tiện, nhiên liệu, chứng từ.
- Nhận hàng: scan kiện, ảnh hiện trạng, chữ ký/đối chiếu.
- Giao hàng: scan, ảnh, xác nhận người nhận, thu hộ (nếu có).
- Sự cố: tạo ticket có loại, mức độ, ảnh/video, định vị.

## 6.5 Chuẩn hóa quản trị SLA và ngoại lệ

- SLA theo loại đơn, loại tuyến, địa bàn.
- Cảnh báo 3 tầng: sắp trễ, trễ nhẹ, trễ nghiêm trọng.
- Cơ chế escalation theo thời gian và vai trò.
- Ngoại lệ phải có reason code và luồng phê duyệt.

## 6.6 Chuẩn hóa báo cáo quản trị

- Báo cáo vận hành không chỉ đếm số lượng; cần theo chiều:
  - Theo đơn vị, tuyến, lái xe, kho, vendor.
  - Theo thời gian, trạng thái, nguyên nhân trễ/hủy.
  - Theo chi phí kế hoạch vs thực tế.
- Chuẩn hóa data mart/semantic layer để tránh mỗi phòng ban tính KPI khác nhau.

---

## 7. Danh sách chức năng hệ thống (Functional Scope)

## 7.1 Nhóm chức năng lõi vận hành (Core)

1. **Quản lý đơn vận hành**
   - Tạo/sửa/hủy đơn; nhập nhanh; import batch.
   - Quản lý thông tin khách, điểm nhận/trả, loại hàng, thông số tải.
2. **Điều hành và lập phương án**
   - Xác minh đơn, ghi chú đặc biệt.
   - Đề xuất mô hình vận tải.
   - Tính sơ bộ thời gian và chi phí.
3. **Lập lệnh vận chuyển**
   - Tạo job, gán xe/lái/tuyến.
   - Chia lô hàng theo chuyến.
4. **Theo dõi thực thi realtime**
   - Bảng điều hành theo timeline trạng thái.
   - Bản đồ vị trí/chuyến.
   - Cảnh báo SLA.

## 7.2 Nhóm kho vận và bưu cục

1. **Kho chính**
   - Nhập kho, kiểm đếm, cân đo, xác nhận chất lượng.
2. **Kho chia**
   - Tách/gom theo tuyến.
   - Bàn giao cho xe trung chuyển hoặc bưu cục cuối.
3. **Bưu cục điểm cuối**
   - Nhận hàng, lập danh sách giao.
   - Đối soát giao nhận cuối ngày.

## 7.3 Nhóm app lái xe

1. Nhận nhiệm vụ và xác nhận.
2. Checkpoint tác nghiệp theo bước.
3. Quét mã kiện và cập nhật trạng thái.
4. Thu thập bằng chứng giao nhận.
5. Tạo ticket phát sinh/sự cố.
6. Chế độ mạng yếu/offline sync cơ bản.

## 7.4 Nhóm vận chuyển đặc thù

1. **Nguyên chuyến**: tối ưu tuyến đơn.
2. **Ghép hàng**: gom chuyến, sắp xếp điểm trả.
3. **Đi thẳng**: bỏ qua một số bước trung gian theo rule.
4. **Tuyến cố định**: lịch chạy định kỳ.
5. **Thuê ngoài vendor**:
   - Đề xuất/duyệt thuê ngoài.
   - Phân đơn cho vendor.
   - Theo dõi chất lượng và chi phí vendor.

## 7.5 Nhóm phát sinh/sự cố

1. Ticketing chuẩn hóa.
2. Escalation theo mức độ ảnh hưởng.
3. SLA xử lý ticket.
4. Nhật ký xử lý và kết luận.

## 7.6 Nhóm báo cáo và điều hành quản trị

1. Dashboard realtime cho điều hành.
2. Tổng hợp cuối ca.
3. Báo cáo hàng nhận/hàng trả.
4. Báo cáo hoàn/hủy và nguyên nhân.
5. Báo cáo chi phí phát sinh.
6. Báo cáo năng suất nhân sự/xe/tuyến/kho.
7. Báo cáo hiệu quả vendor.

## 7.7 Nhóm quản trị hệ thống phân hệ

1. Quản trị danh mục xe, tuyến, kho, bưu cục, loại hàng.
2. Quản trị bảng giá/phụ phí/khung SLA.
3. Quản trị rule điều hành.
4. Quản trị role permission phạm vi phân hệ.
5. Quản trị mẫu chứng từ/biểu mẫu.

---

## 8. Năng lực dùng chung từ công ty mẹ (Shared Platform Dependency)

Phân hệ vận hành phải ăn chung cấu hình và nền tảng tập đoàn ở các lớp sau:

1. **Identity & Access**
   - SSO, MFA, vòng đời user.
   - Vai trò theo Org Tree, phân quyền theo phạm vi dữ liệu.
2. **Master Data Platform**
   - Danh mục tổ chức, địa bàn, kho, bưu cục, khách hàng, phương tiện, nhân sự.
   - Cơ chế đồng bộ 1 chiều/2 chiều.
3. **Configuration Governance**
   - Chính sách cấu hình tập trung và phân cấp override.
   - Versioning, hiệu lực theo thời gian, rollback.
4. **Notification Platform**
   - SMS/email/push/in-app.
   - Template theo sự kiện vận hành.
5. **Audit/Log/SIEM**
   - Nhật ký thao tác chuẩn kiểm toán.
   - Truy vết thay đổi dữ liệu quan trọng.
6. **Data Integration**
   - Event bus/API gateway.
   - Chuẩn contract tích hợp.
7. **Reporting/BI Foundation**
   - Mô hình dữ liệu hợp nhất cho dashboard tập đoàn.

---

## 9. Quy mô triển khai cấp tập đoàn

## 9.1 Mô hình tổ chức triển khai

- 1 tập đoàn -> N công ty thành viên -> N chi nhánh/bưu cục/kho -> N đội xe.
- Hệ thống cần hỗ trợ đa tầng quản trị:
  - Tập đoàn xem toàn cục.
  - Công ty thành viên xem phạm vi công ty.
  - Chi nhánh xem phạm vi địa bàn.

## 9.2 Mô hình dữ liệu đa tenant logic

- Dùng `tenant_id`/`org_scope` để cách ly dữ liệu theo đơn vị.
- Có `global master` và `local override`:
  - Global: chuẩn dùng chung.
  - Local: cấu hình đặc thù theo công ty/địa bàn nhưng trong khung tập đoàn.

## 9.3 Mô hình vận hành đa địa bàn

- Hỗ trợ cấu hình nhiều timezone/ca làm việc/khung cấm đường.
- SLA khác nhau theo vùng địa lý.
- Rule phân bổ xe và trung chuyển theo năng lực địa phương.

---

## 10. Business Rules trọng yếu (đề xuất chuẩn hóa)

- BR-01: Không phân công lệnh nếu thiếu dữ liệu bắt buộc.
- BR-02: Không cho tạo chuyến vượt tải trọng/thể tích cấu hình.
- BR-03: Mọi bàn giao bắt buộc có scan kiện và định danh người nhận.
- BR-04: Mọi chỉnh sửa chi phí phát sinh vượt ngưỡng phải qua phê duyệt.
- BR-05: Chuyển thuê ngoài bắt buộc theo luồng đề xuất/duyệt.
- BR-06: Mọi phát sinh tại hiện trường phải tạo ticket trên app.
- BR-07: Không đóng lệnh nếu còn kiện chưa đối soát.
- BR-08: Chậm SLA cấp nghiêm trọng phải escalation tự động.

---

## 11. Phi chức năng (NFR)

- NFR-01: Cập nhật trạng thái trọng yếu gần realtime (mục tiêu < 5 giây).
- NFR-02: Uptime dịch vụ vận hành mục tiêu >= 99.9%.
- NFR-03: Hỗ trợ tối thiểu 5.000+ người dùng đồng thời ở quy mô tập đoàn (tham số cần chốt).
- NFR-04: App mobile có cơ chế queue/sync khi mạng yếu.
- NFR-05: Audit trail bất biến cho các hành động quan trọng.
- NFR-06: Tuân thủ bảo mật dữ liệu khách hàng và chính sách tập đoàn.

---

## 12. Lộ trình triển khai đề xuất

## Phase 1 (MVP điều hành)

- Quản lý đơn, lập lệnh, phân công, app lái xe cơ bản.
- Theo dõi trạng thái và cảnh báo SLA mức cơ bản.
- Báo cáo vận hành cốt lõi.

## Phase 2 (Nâng cao điều phối)

- Ghép hàng nâng cao, kho chia chuẩn hóa, vendor workflow đầy đủ.
- Ticket sự cố + escalation tự động.
- Dashboard quản trị theo vai trò.

## Phase 3 (Quy mô hệ sinh thái)

- Tích hợp sâu KPI/Policy Engine cấp tập đoàn.
- Data mart hợp nhất và phân tích hiệu suất đa công ty.
- Tối ưu vận hành thông minh (gợi ý tuyến/ghép/chuyển tải).

---

## 13. Rủi ro và biện pháp kiểm soát

- **Rủi ro lệch quy trình giữa đơn vị** -> áp chuẩn global + local override có kiểm soát.
- **Rủi ro chất lượng dữ liệu hiện trường** -> checklist bắt buộc + validation tại app.
- **Rủi ro quá tải giờ cao điểm** -> mở rộng ngang + cơ chế queue/event.
- **Rủi ro phụ thuộc vendor** -> KPI vendor, SLA hợp đồng, cảnh báo vi phạm.
- **Rủi ro chống đối thay đổi** -> đào tạo theo vai trò + dashboard minh bạch lợi ích.

---

## 14. Danh sách quyết định cần chốt với Business

1. Bộ trạng thái chuẩn cuối cùng cho `đơn`, `lệnh`, `kiện`, `chuyến`.
2. Bảng SLA chuẩn theo loại hàng/tuyến/địa bàn.
3. Chính sách phụ phí và ngưỡng phê duyệt.
4. Bộ chứng từ bắt buộc theo từng nhánh vận hành.
5. Ma trận quyền chi tiết theo vai trò và cấp tổ chức.
6. Chính sách dữ liệu: thời gian lưu, khóa dữ liệu, truy cập lịch sử.

---

## 15. Kết luận

Luồng thực tế doanh nghiệp hiện đã rất đầy đủ về tri thức vận hành. Trọng tâm của chuyển đổi số không phải là vẽ lại quy trình, mà là:

- Chuẩn hóa dữ liệu và trạng thái.
- Quy tắc hóa quyết định điều hành.
- Tự động hóa cảnh báo/ngoại lệ/phê duyệt.
- Kết nối phân hệ vào nền tảng cấu hình chung cấp tập đoàn.

Khi 4 lớp này được triển khai đúng, phân hệ vận hành sẽ trở thành trục thực thi đáng tin cậy cho toàn hệ sinh thái XeVN.

