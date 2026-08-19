# BRD — Phân hệ Nhân sự (HRM)

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Yêu cầu nghiệp vụ — Phân hệ Nhân sự |
| Phiên bản | 3.1 |
| Trạng thái | Chính thức |
| Phạm vi | Phân hệ Nhân sự trong hệ sinh thái XeVN |

---

## 1. Tóm tắt điều hành

Phân hệ Nhân sự phục vụ quản trị hồ sơ người lao động, hợp đồng, bảo hiểm, chấm công, nghỉ phép, lương và tuyển dụng trên nhiều đơn vị thành viên. Dữ liệu danh mục chuẩn (phòng ban, chức danh, trường hồ sơ…) do phân hệ điều hành tập đoàn phát hành; Nhân sự sử dụng thống nhất để tránh lệch chuẩn giữa các đơn vị.

## 2. Bối cảnh và vấn đề

| Vấn đề | Hệ quả nếu không xử lý |
|--------|------------------------|
| Phạm vi dữ liệu đa đơn vị phức tạp | Xem nhầm hoặc sửa nhầm dữ liệu đơn vị khác |
| Hồ sơ – hợp đồng – bảo hiểm – công – lương tách rời | Kỳ lương thiếu căn cứ; báo cáo không khớp |
| Danh mục tự khai lệch chuẩn tập đoàn | Biểu mẫu và lọc nghiệp vụ không thống nhất |
| Bảng chấm công / lưới kỳ không rõ trạng thái trống | Người dùng hiểu nhầm là lỗi hệ thống |

## 3. Mục tiêu và chỉ số thành công

| Mục tiêu | Chỉ số chấp nhận |
|----------|------------------|
| Quản trị hồ sơ và quyền theo đúng đơn vị được cấp | Không lộ dữ liệu ngoài phạm vi được phép |
| Vòng đời nhân sự liên kết: hồ sơ → hợp đồng/BH → công → nghỉ → lương | Mỗi bước sau dùng khóa nghiệp vụ của bước trước |
| Danh mục dùng chung thống nhất | Màn hình Nhân sự chỉ dùng giá trị đã phát hành từ điều hành tập đoàn |
| Bảng chấm công vận hành trung thực | Tạo xong thấy ngay trên danh sách; kỳ trống hiện empty rõ ràng, không báo lỗi giả |

## 4. Phạm vi

### 4.1 Trong phạm vi

- Hồ sơ nhân viên (tạo, xem, cập nhật trong phạm vi đơn vị).
- Hợp đồng lao động và ghi nhận bảo hiểm.
- Bảng chấm công theo kỳ; bản ghi chấm; đơn nghỉ phép.
- Xem phiếu lương theo kỳ đã xử lý.
- Yêu cầu tuyển dụng (requisition).
- Xem và sử dụng danh mục cấu hình đã đồng bộ.

### 4.2 Ngoài phạm vi

- Sở hữu cây tổ chức / thư viện chức danh master (thuộc điều hành tập đoàn).
- Động cơ phê duyệt quy trình tập trung (định nghĩa và chạy quy trình thuộc điều hành tập đoàn; Nhân sự chỉ gắn mã quy trình khi cần).
- Nghiệp vụ tài chính ngoài lương nhân sự.

## 5. Bên liên quan

| Nhóm | Vai trò |
|------|---------|
| Lãnh đạo tập đoàn / đơn vị | Xem đúng phạm vi; quyết định nhân sự |
| HCNS / người vận hành HR | Nhập liệu, theo dõi kỳ công, đơn từ, lương |
| Quản trị nền tảng | Cấp quyền và tài khoản quản trị |
| Người lao động | Gửi đơn nghỉ / chỉnh sửa chấm (khi được phép) |

## 6. Yêu cầu nghiệp vụ (Yêu cầu-N)

> Số và mã **khóa** theo inventory đội ngũ (Yêu cầu-01..30). Bảng dưới liệt kê các Yêu cầu đã có FR đồng nhất trên SRS khách (W1 + W2a + W2b + W2c + W2d); danh mục đầy đủ 30 yêu cầu. Leftover **trong** use case đã có primary (ví dụ tab nhúng / màn di động còn lại) xem inventory đội ngũ — **không** đồng nghĩa toàn bộ 120 use case đã đặc tả đủ thân.

| Mã | Mô tả ngắn | Ưu tiên | UC / FR primary (đã đặc tả SRS khách) |
|----|------------|---------|----------------------------------------|
| Yêu cầu-01 | Phạm vi đa đơn vị | Cao | UC-HRM-SCOPE-01 · 02 · 03 |
| Yêu cầu-02 | Quản trị nền tảng / doanh nghiệp | Cao | UC-HRM-02 · 03 |
| Yêu cầu-03 | Mời nhân viên hàng loạt | Cao | UC-HRM-04 |
| Yêu cầu-04 | Thông tin nhạy cảm tài khoản | Cao | UC-HRM-05 |
| Yêu cầu-05 | Đồng bộ / liệt kê danh mục dùng chung | Cao | UC-HRM-06 · 08 |
| Yêu cầu-06 | Hồ sơ nhân viên (tạo và dùng trong đơn vị) | Cao | HRM-EM-01 |
| Yêu cầu-07 | Bản ghi chấm công | Cao | HRM-AT-01 · 02 · 03 |
| Yêu cầu-08 | Đơn chỉnh sửa chấm công | Cao | UC-HRM-09 |
| Yêu cầu-09 | Đơn nghỉ phép (tạo / duyệt / từ chối) | Cao | HRM-AT-10 · 12 · 13 |
| Yêu cầu-10 | Bảng chấm công theo kỳ (list / lưới / empty trung thực) | Cao | HRM-AT-14 |
| Yêu cầu-11 | Yêu cầu dịch vụ nội bộ + thông báo | Trung bình | UC-HRM-11 |
| Yêu cầu-12 | Hộp thư thông báo nghiệp vụ | Cao | UC-HRM-12 |
| Yêu cầu-13 | Kỳ lương / phiếu lương | Cao | HRM-PR-01 · 03 · 04 · 05 |
| Yêu cầu-14 | Tuyển dụng (YCTD → ứng viên → lịch PV) | Cao | HRM-RC-01 · 03 · 05 |
| Yêu cầu-15 | Hợp đồng lao động và bảo hiểm | Cao | HRM-CI-01 · HRM-CI-02 |
| Yêu cầu-16 | Đổi metadata hồ sơ | Cao | HRM-MD-01 |
| Yêu cầu-17 | Tổng quan danh mục cấu hình Nhân sự | Cao | HRM-SC-01 |
| Yêu cầu-18 | Xem trước import nhân sự | Cao | HRM-IM-01 |
| Yêu cầu-19 | Công việc vận hành | Trung bình | HRM-OP-01 · 02 · 03 · 04 |
| Yêu cầu-20 | Chu kỳ đánh giá hiệu suất | Trung bình | HRM-PF-01 |
| Yêu cầu-21 | Hồ sơ xe (du lịch) | Thấp hơn | HRM-FL-01 |
| Yêu cầu-22 | Nhúng cổng điều hành (slice) | Cao | UC-HRM-20 · 21 · 23 · 27 |
| Yêu cầu-23 | Ứng dụng di động (slice) | Cao | UC-HRM-MOB-01 · 04 · 06 · 08 |
| Yêu cầu-24 | Liên kết chéo tuyển → hồ sơ → HĐ → lương | Cao | UC-HRM-INT-01 · 02 · 03 · 04 |
| Yêu cầu-25 | Quyết định nhân sự (nhúng) | Trung bình | UC-HRM-27 |
| Yêu cầu-26 | Kiểm tra sẵn sàng dịch vụ Nhân sự | Trung bình | UC-HRM-01 |
| Yêu cầu-27 | NFR bảo mật / tin cậy / nhật ký / tương thích | Cao | NFR (SRS Ch.4) |
| Yêu cầu-28 | Pipeline thông báo sau tạo/duyệt đơn | Cao | UC-HRM-09 · 10 · 11 · 12 |
| Yêu cầu-29 | Ranh giới: không sở hữu danh mục tổ chức master | Cao | SRS Ch.6 |
| Yêu cầu-30 | Khởi tạo đơn vị theo cấu hình (không gắn cứng) | Trung bình | BR-HRM-08 |

Leftover use case trong catalog 120 (tab nhúng còn lại, màn di động còn lại, slice EM/CI/SC…) giữ nguyên phạm vi sản phẩm; bổ sung FR ở đợt catalog tiếp theo — **không** rút các Yêu cầu-N đã khóa.

## 7. Quy tắc nghiệp vụ

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| Quy tắc-1 | Thao tác trên dữ liệu đơn vị | Chỉ trong phạm vi được cấp | Không lộ chéo đơn vị |
| Quy tắc-2 | Nghiệp vụ cần danh mục chuẩn | Dùng giá trị đã đồng bộ từ điều hành tập đoàn | Biểu mẫu thống nhất |
| Quy tắc-3 | Mời / nhập theo lô có lỗi từng dòng | Xử lý từng bản ghi | Không dừng cả lô vì một dòng lỗi |
| Quy tắc-4 | Tạo bảng chấm công thành công | Hiện ngay trên danh sách (không bắt tải lại trang) | Người dùng thấy dòng bảng mới |
| Quy tắc-5 | Danh sách bảng hoặc lưới kỳ rỗng hợp lệ | Empty trung thực, không dữ liệu giả, không báo lỗi hệ thống | Người dùng hiểu «chưa có» |
| Quy tắc-6 | Kỳ bảng không hợp lệ hoặc trùng bị cấm | Từ chối lưu + thông báo rõ | Không tạo bản ghi sai |
| Quy tắc-7 | Mở một bảng công | Lưới chỉ trong kỳ và phạm vi đơn vị của bảng | Không lộ ngoài phạm vi |
| Quy tắc-8 | Đơn nghỉ / chỉnh sửa được tạo hoặc quyết định | Cập nhật trạng thái + thông báo người liên quan | Người gửi và người duyệt theo dõi được |
| Quy tắc-9 | Phiếu lương | Chỉ hiện dữ liệu kỳ đã xử lý trong phạm vi | Không bịa số lương |

## 8. Luồng nghiệp vụ tổng quan (ngày / kỳ)

1. Khai hồ sơ nhân viên trong đơn vị.
2. Lập hợp đồng và ghi nhận bảo hiểm gắn hồ sơ.
3. Mở bảng chấm công theo kỳ; ghi nhận điểm danh / đơn nghỉ trong kỳ.
4. Xử lý kỳ lương; người dùng xem phiếu lương.
5. Song song: yêu cầu tuyển dụng khi cần bổ sung nhân sự; danh mục cấu hình luôn lấy từ bản đã đồng bộ.

Chi tiết xương sống E2E và use case: tài liệu SRS phân hệ Nhân sự (bản khách).

## 9. Tiêu chí chấp nhận (mức BRD)

- Mọi **Yêu cầu-N** Cao ở mục 6 có use case primary và đặc tả SRS đủ khung thống nhất.
- Quy tắc-4..7 (bảng chấm công) không bị rút gọn so với bản đã khóa nghiệm thu vận hành.
- Không giảm số use case trong bảng tổng hợp (120) trừ khi có quyết định gỡ chính thức.

## 10. Bản đồ năng lực HRM

Khách hàng đã cung cấp **bản đồ năng lực** tổng hợp (11 nhóm nghiệp vụ, 27 năng lực lá) nhằm mô tả định hướng mong muốn dài hạn của phân hệ Nhân sự. Bản đồ **không** thay thế phạm vi Giai đoạn 1 đã công bố tại mục 4 và các Yêu cầu-N tại mục 6; nó dùng để **đối chiếu** nhu cầu với lộ trình triển khai và nghiệm thu.

**Nguyên tắc đọc bản đồ**

- Màu hoặc nhánh trên hình minh họa chỉ phân **nhóm nghiệp vụ**, không biểu thị mức ưu tiên kỹ thuật.
- Nghiệm thu Giai đoạn 1 chỉ áp dụng cho các năng lực nằm trong cột **Đang triển khai Giai đoạn 1** và các hạng mục **Hoàn thiện Giai đoạn 1** khi đã có tiêu chí chấp nhận tương ứng trên SRS.
- Các năng lực ở cột **Mong muốn Giai đoạn 2** là định hướng mở rộng; **không** đưa vào tiêu chí nghiệm thu Giai đoạn 1 trừ khi có quyết định mở rộng phạm vi bằng văn bản.

### 10.1 Đang triển khai Giai đoạn 1

Các năng lực đã nằm trong phạm vi Giai đoạn 1 và đang được triển khai hoặc vận hành theo đặc tả SRS (có liên kết dữ liệu nghiệp vụ; không đồng nghĩa toàn bộ luồng chi tiết trên bản đồ đã hoàn tất).

| Nhóm trên bản đồ | Năng lực |
|------------------|----------|
| Tuyển dụng | Quản lý yêu cầu tuyển dụng (tạo, theo dõi yêu cầu trong phạm vi đơn vị) |
| Hồ sơ nhân sự | Hồ sơ cá nhân master (tạo, xem, cập nhật trong phạm vi; liên kết đơn vị) |
| Hồ sơ nhân sự | Hợp đồng lao động (gắn hồ sơ; ghi nhận bảo hiểm theo phạm vi đã công bố) |
| Chấm công | Giải trình và chốt công (đơn chỉnh sửa; bảng chấm công theo kỳ; chốt kỳ trong Giai đoạn 1) |
| Chấm công | Chấm công qua vị trí GPS / vùng cho phép (ứng dụng di động và tích hợp đã công bố) |
| Nghỉ phép | Nộp và duyệt phép (web, di động, hộp thông báo nghiệp vụ) |
| Review đánh giá | Tạo đợt đánh giá (chu kỳ hiệu suất; khởi tạo và quản lý đợt trong phạm vi SRS) |
| Bảng lương | Tính toán và phê duyệt lương (chạy kỳ, khóa kỳ sau phê duyệt) |
| Bảng lương | Phát hành phiếu lương có kiểm soát hiển thị (xem phiếu theo kỳ đã xử lý; bảo mật hiển thị trên di động) |

*Bổ sung theo phạm vi đã công bố:* nhúng trên cổng điều hành, các màn di động chấm công / nghỉ / phiếu lương, và liên kết tuyển dụng → hồ sơ → hợp đồng → lương (Yêu cầu-22, Yêu cầu-23, Yêu cầu-24).

### 10.2 Hoàn thiện Giai đoạn 1

Các năng lực **đã có hướng** trong Giai đoạn 1 (menu, dữ liệu nền hoặc đặc tả SRS) nhưng **chưa đủ** để coi là hoàn tất toàn bộ mức độ chi tiết trên bản đồ khách. Đây là hạng mục ưu tiên hoàn thiện **trong** Giai đoạn 1, không chuyển sang Giai đoạn 2.

| Nhóm trên bản đồ | Năng lực | Ghi chú nghiệp vụ (mức BRD) |
|------------------|----------|-----------------------------|
| Tuyển dụng | Pipeline và hồ sơ ứng viên | Pipeline **cố định** theo SRS Giai đoạn 1; độ sâu CV và hiển thị funnel cần hoàn thiện |
| Tuyển dụng | Lịch hẹn phỏng vấn | Lên lịch và cập nhật kết quả; luồng danh sách → chi tiết trên giao diện cần đủ trải nghiệm nghiệm thu |
| Tuyển dụng | Offer và onboarding | Sau trạng thái tuyển thành công → tạo hồ sơ nhân viên; thư offer và checklist onboarding đầy đủ **không** thuộc tiêu chí Giai đoạn 1 |
| Hồ sơ nhân sự | Sơ đồ tổ chức | Dữ liệu cây đơn vị / phòng ban từ điều hành tập đoàn; **sơ đồ trực quan** trên phân hệ Nhân sự cần làm rõ mức nghiệm thu |
| Chấm công | Phân ca và lịch trình | Danh mục ca có; **lịch phân ca / roster** cần hoàn thiện so với mong muốn bản đồ |
| Nghỉ phép | Cấu hình quỹ phép | Số dư và loại nghỉ; **cấu hình quỹ, chuyển năm** cần tiêu chí chấp nhận bổ sung |
| KPI và OKR | Gán chỉ tiêu và trọng số | Thư viện KPI và gắn chu kỳ đánh giá; **khung OKR và trọng số bắt buộc** chưa đủ cho nghiệm thu đầy đủ |
| KPI và OKR | Cập nhật tiến độ | Cập nhật trên phiếu đánh giá; **theo dõi tiến độ OKR liên tục** nằm ngoài mức Giai đoạn 1 |
| Review đánh giá | Tự đánh giá và đánh giá quản lý | Luồng self / quản lý trực tiếp; **đánh giá 360 đa người** không thuộc tiêu chí Giai đoạn 1 |
| Lịch sử thuyên chuyển | Đề xuất điều chuyển | Qua quyết định nhân sự; mật độ vận hành và tạo mới từ giao diện cần đạt tiêu chí nghiệm thu |
| Lịch sử thuyên chuyển | Timeline công tác | Lịch sử công tác trên hồ sơ; độ sâu tra cứu timeline cần khớp SRS khi bổ sung |
| Khen thưởng / Kỷ luật | Quyết định khen thưởng | Ghi nhận qua loại quyết định nhân sự; không tách module khen thưởng riêng trong Giai đoạn 1 |
| Khen thưởng / Kỷ luật | Ghi nhận vi phạm / kỷ luật | Ghi nhận kỷ luật qua quyết định; **nhật ký vi phạm chuyên biệt** xem mục 10.3 |
| Bảng lương | Cấu hình công thức lương | Thành phần lương và mẫu bảng lương theo danh mục; **trình dựng công thức tự do** không thuộc Giai đoạn 1 |
| *(Chéo)* | Quyết định nhân sự (nhúng) | Hệ thống cho phép loại quyết định và API; **vận hành đủ mật độ** trên giao diện là hạng mục hoàn thiện, không tuyên bố «đã vận hành đầy đủ» chỉ vì có menu |

### 10.3 Mong muốn Giai đoạn 2

Nhu cầu bổ sung từ bản đồ năng lực khách hàng; **ngoài** nghiệm thu Giai đoạn 1 trừ khi có quyết định mở rộng phạm vi.

| Nhóm trên bản đồ | Năng lực |
|------------------|----------|
| Tăng ca (OT) | Đăng ký và phê duyệt tăng ca |
| Tăng ca (OT) | Quy đổi hệ số tăng ca (ví dụ hệ số ngày thường, cuối tuần, ngày lễ) |
| Đào tạo | Kế hoạch khóa học |
| Đào tạo | Khảo sát và đánh giá sau đào tạo |
| Chấm công | Nhận diện khuôn mặt / thiết bị chấm công cứng (bổ sung ngoài GPS Giai đoạn 1) |
| KPI và OKR | Cập nhật tiến độ OKR liên tục (check-in theo chu kỳ OKR) |
| Review đánh giá | Đánh giá 360 đa người tham gia |
| Tuyển dụng | Thư offer chính thức và quy trình onboarding đầy đủ sau tuyển |
| Tuyển dụng | Pipeline tuyển dụng động nhiều bước (vượt quá pipeline cố định Giai đoạn 1) |
| Bảng lương | Trình dựng công thức lương tùy biến (formula builder) |
| Bảng lương | Phát hành phiếu lương dạng tệp mã hóa nâng cao (ngoài kiểm soát hiển thị Giai đoạn 1) |
| Khen thưởng / Kỷ luật | Sổ theo dõi vi phạm chuyên biệt, tách khỏi quyết định chung |

### 10.4 Liên hệ với tiêu chí chấp nhận Giai đoạn 1

- Mục 9 và các Yêu cầu-N mục 6 **không** mở rộng tự động khi bổ sung bản đồ năng lực.
- Hoàn thiện các dòng mục 10.2 được quản lý qua đợt cập nhật SRS và nghiệm thu có kiểm soát; mục 10.3 chỉ vào backlog sản phẩm Giai đoạn 2 hoặc change request.

---

## 11. Tài liệu liên quan

| Tài liệu | Vai trò |
|----------|---------|
| SRS — Phân hệ Nhân sự (bản khách) | Đặc tả phần mềm gửi đối tác |
| Bảng tổng hợp use case HRM | Catalog đầy đủ 120 mã |
| Bản đồ năng lực HRM (minh họa khách) | Tham chiếu nhóm nghiệp vụ; đối chiếu mục 10 |
| BRD / SRS nội bộ đội ngũ | Ghi chú kỹ thuật, mã lỗi, ánh xạ triển khai |
