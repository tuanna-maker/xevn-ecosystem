# Danh mục yêu cầu nghiệp vụ HRM — góp ý đối tác (2026-08-04)

| Mục | Nội dung |
|-----|----------|
| **Nguồn** | Danh mục yêu cầu nghiệp vụ hệ thống quản lý nhân sự (bảng tính đối tác) |
| **Ngày họp** | 2026-08-04 |
| **Gộp với** | Bản trình bày blueprint + sơ đồ bốn trụ → WBS / SRS gửi khách |

> Câu văn nghiệp vụ giữ nguyên ý đối tác.

---

## Nguồn tài liệu tham khảo (sheet 2)

| Chỉ mục | Tài liệu |
|--------:|----------|
| 1 | `recording2026-08-04 09-46-51.m4a` |
| 2 | `recording2026-08-04 10-33-17.m4a` |
| 3 | `recording2026-08-04 11-19-44.m4a` |

Cột **Nguồn** ở bảng REQ = chỉ mục recording trên.

---

## Tổng hợp theo khối

| Khối | Số REQ | Mã |
|------|-------:|-----|
| Tuyển dụng | 5 | REQ_REC_001…005 |
| Quản lý nhân sự | 7 | REQ_HR_001, HR-001…006 |
| Chấm công – Nghỉ phép | 11 | TIME-001…002, REQ_CC_001…002, REQ_NP_001…006 |
| Tiền lương | 7 | PAY-001, REQ_L_001…006 |
| **Tổng** | **30** | |

---

## 1. Tuyển dụng

| Mã | Tên | Đối tượng | Trạng thái (đối tác) | Nguồn | Nghiệp vụ chốt (tóm tắt) |
|----|-----|-----------|----------------------|------:|---------------------------|
| **REQ_REC_001** | Quản lý yêu cầu tuyển dụng | HCNS, TPB, BOD | Đang phát triển/Cấu hình | 1 | Thư viện JD, tiêu đề, phòng ban, SL, loại hình thuê. **Phân biệt trong định biên vs ngoài định biên** → ảnh hưởng luồng duyệt (trong ĐB đã duyệt đầu năm có thể không qua BOD lại; ngoài ĐB / phát sinh / thay thế = luồng riêng). |
| **REQ_REC_002** | Kho hồ sơ ứng viên | NV TD, TP TD | Đang nghiên cứu tối ưu | 1 | Pool tái sử dụng (kỹ năng/kinh nghiệm, không chỉ hành chính). Liên kết trạng thái UV với YCTD (đã PV, offer, onboard). |
| **REQ_REC_003** | Kế hoạch định biên NS | TPB, HCNS, BGĐ | Đang thiết kế (cần tỉa dữ liệu) | 1 | Ma trận vị trí × hiện tại × dự kiến × cần tuyển **12 tháng**; phòng ban tự nhập → duyệt → **tự sinh YCTD theo mốc thời gian**. |
| **REQ_REC_004** | Đánh giá PV & Onboarding | Người PV, HCNS, UV | Đề xuất bổ sung | 1 | Mẫu đánh giá động (Pass/Fail), đề xuất lương; Mail Service PV/kết quả; danh sách sắp onboard → chuẩn bị CSVC (chỗ ngồi, thiết bị). |
| **REQ_REC_005** | Báo cáo & Dashboard TD | TP TD, BGĐ, TPB | Yêu cầu quan trọng cần làm | 1 | Tháng × phòng ban; KH vs TT; funnel CV→PV→chốt; trả lời **«Khi nào có đủ người»**. |

---

## 2. Quản lý nhân sự

| Mã | Tên | Đối tượng | Trạng thái | Nguồn | Nghiệp vụ chốt |
|----|-----|-----------|------------|------:|----------------|
| **REQ_HR_001** | Hồ sơ nhân sự (nhóm TT) | HCNS, NV | Đang thực hiện (nhóm TT) | 1 | Nhóm: cơ bản / cá nhân / công việc / tài chính; cấu hình linh hoạt qua **Xbot**. |
| **HR-001** | Hồ sơ chi tiết + bảo mật | Toàn NV, HCNS | Đang thảo luận | 2 | Public công việc vs cá nhân/CCCD; người phụ thuộc (1/6, quà); tài chính (MST, TKNH); BHXH/BHYT. **Lương tách** sang HĐ/BH (C&B). |
| **HR-002** | Hợp đồng LĐ | HCNS | Đang thảo luận | 2 | Mã ký, hiệu lực, lương, vị trí; upload Word template + **keyword fill data** in ấn. |
| **HR-003** | Checklist chứng từ | HCNS, NV | Đang thảo luận | 2 | Danh mục theo vị trí/PB; bắt buộc vs không; cảnh báo thiếu; ưu tiên PDF scan. |
| **HR-004** | BHXH | HCNS, C&B | Đang thảo luận | 2 | % + số tiền NV/CTY; trạng thái Hoạt động / Ngừng / Tạm hoãn; đổi hàng loạt. |
| **HR-005** | Khen thưởng & Kỷ luật | HCNS, C&B | Đang thảo luận | 2 | Thêm **Trạng thái thi hành**; tiền thưởng/phạt **liên kết bảng lương tháng**. |
| **HR-006** | Cấp phát tài sản / CCDC | HCNS, NV | Đang thảo luận | 2 | Tham chiếu module Tài sản (mã, serial); ký BB bàn giao; căn cứ thu hồi nghỉ việc. |

---

## 3. Chấm công – Nghỉ phép

| Mã | Tên | Đối tượng | Trạng thái | Nguồn | Nghiệp vụ chốt |
|----|-----|-----------|------------|------:|----------------|
| **TIME-001** | Ca làm việc & Phân ca | HCNS, TP | Đang thảo luận | 2 | Giờ vào/ra, hệ số công, grace muộn/sớm; phân ca tuần/tháng theo bộ phận (VP, tài xế); công theo ca gán thực tế. |
| **TIME-002** | Phạt muộn/về sớm | HCNS, C&B | Đang thảo luận | 2 | Phạt theo phút / block / bậc; phương thức hợp lệ: IP, GPS, máy chấm công. |
| **REQ_CC_001** | Ngày nghỉ lễ, Tết | Admin/NS | Đang thảo luận | 3 | Lễ dương cố định + **âm lịch cấu hình hàng năm**. |
| **REQ_CC_002** | Giải trình công | NV, QL, NS | Đang thảo luận | 3 | Sau duyệt cập nhật công + lịch sử thay đổi. |
| **REQ_NP_001** | Cấp phát phép năm | Hệ thống, NS | Đang thảo luận | 3 | 1 ngày/tháng (0.5 nếu nửa tháng) + thâm niên (3/5 năm +1) + theo chức vụ (vd TP +4). |
| **REQ_NP_002** | Ứng phép & thời điểm cấp | Admin, NV | Đang thảo luận | 3 | Cho/không ứng trước; cấp đầu năm / theo tháng / 6 tháng; nghỉ chưa có phép → không lương rồi bù trừ. |
| **REQ_NP_003** | Giữ chỗ phép & duyệt | NV, QL | Đang thảo luận | 3 | Submit = hold ngày; từ chối hoàn / đổi loại nghỉ. |
| **REQ_NP_004** | Phép OT (nghỉ bù) | NV, NS | Đang thảo luận | 3 | OT quy đổi cộng phép nếu CTY bật chế độ. |
| **REQ_NP_005** | Bảo toàn & hoàn trả phép | NS, KT | Đang thảo luận | 3 | Hạn dùng phép cũ (thường hết Q1 năm sau); trả tiền phép khi nghỉ việc; tính trên lương CB đóng BH. |
| **REQ_NP_006** | Logic trừ ngày nghỉ | Hệ thống | Đang thảo luận | 3 | Trừ lễ + T7/CN theo lịch làm việc; đơn vị tối thiểu nửa ngày hoặc 1 giờ. |

---

## 4. Tiền lương

| Mã | Tên | Đối tượng | Trạng thái | Nguồn | Nghiệp vụ chốt |
|----|-----|-----------|------------|------:|----------------|
| **PAY-001** | Lịch sử lương & phụ cấp | C&B | Đang thảo luận | 2 | Hiệu lực theo ngày; cấu hình phụ cấp: chịu TNCN? đóng BH? theo ngày công (block) hay trọn gói. |
| **REQ_L_001** | Tổng hợp bảng công tính lương | NS, KT lương | Đang thảo luận | 3 | Gom chấm công + phép + OT → công chuẩn/thực tế/phép/lễ/phạt; giờ + hệ số OT (vd 150%) → **Công tính lương**. |
| **REQ_L_002** | Thành phần & công thức lương | IT/Dev, NS | Đang thảo luận | 3 | Thành phần (chính, PC, KPI). *Đối tác ghi: công thức do kỹ thuật thiết lập trên DB.* — **cần chốt với PPT formula engine (HR kéo-thả)** → Decision Q-PAY-FORMULA. |
| **REQ_L_003** | Khấu trừ thuế & BH | KT lương | Đang thảo luận | 3 | GTCG (vd bản thân 11tr, PT 4tr) + mức đóng BH làm căn cứ TNCN. |
| **REQ_L_004** | Mượt bảng lương (Merge) | Hệ thống, KT | Đang thảo luận | 3 | 2 bảng/tháng (đổi lương / thử việc→CT): cộng thu nhập; **giảm trừ bản thân/GTCG chỉ 1 lần**. |
| **REQ_L_005** | Phiếu lương | NV, KT | Đang thảo luận | 3 | Preview + xác nhận; bảo mật chỉ xem của mình; trạng thái TT + công nợ NS. |
| **REQ_L_006** | Phân nhóm bảng lương | NS, KT | Đang thảo luận | 3 | Nhóm VP / KD / tài xế / vận hành theo PB, chức vụ hoặc danh sách đặc thù. |

---

## 5. Điểm cần khách / đối tác chốt (Decision backlog)

| ID | Xung đột / mở | Phương án gợi ý |
|----|---------------|-----------------|
| **Q-REC-HEADCOUNT** | Trong ĐB đã duyệt vs ngoài ĐB — ai bypass BOD? | Khóa rule + ma trận role trong SRS FR định biên |
| **Q-PAY-FORMULA** | Excel: IT cấu hình công thức DB · PPT: HR kéo-thả engine | Đề xuất: engine cấu hình + dual-control publish; IT không hardcode mỗi kỳ |
| **Q-XBOT-PROFILE** | REQ_HR_001 nêu cấu hình qua Xbot | Làm rõ Xbot = XBOS catalog/metadata hay hệ riêng |
| **Q-ASSET-MODULE** | HR-006 tham chiếu module Tài sản | Scope Phase: stub ref vs full Asset SoT |
| **Q-LEAVE-ACCRUAL** | 1 ngày/tháng + thâm niên + chức vụ | Thông số cấu hình theo legal entity |
| **Q-LEAVE-UNIT** | Nửa ngày vs 1 giờ | Cấu hình theo loại phép / ca |
| **Q-SI-SUSPEND** | Tạm hoãn BH khi ốm dài | Map lifecycle termination/suspend ATT→PAY |

---

## 6. Ánh xạ nhanh → trụ Blueprint / Mind map

| Trụ | REQ đối tác |
|-----|-------------|
| REC | REQ_REC_001…005 |
| CORE | REQ_HR_001, HR-001…006, HR-004 (BH một phần overlap PAY) |
| ATT | TIME-*, REQ_CC_*, REQ_NP_* |
| PAY | PAY-001, REQ_L_001…006 (+ HR-005 tiền thưởng/phạt) |

Hard boundary vẫn giữ: **REQ_L_001 / bảng công chốt = SoT** trước công thức lương; REC không gọi PAY trực tiếp.

---

## 7. Hướng xử lý tiếp (sau xác nhận khách)

1. Gắn cột `partner_req_id` vào mọi Task WBS (đã làm trên bản 0.3).
2. Đưa các trường hợp biên NP/L vào ma trận UC/BR (đặc biệt NP-006, L-004, REC-001).
3. Ghi Q-PAY-FORMULA vào phiếu quyết định / khung kiến trúc — **chờ chữ ký khách**.
4. Chưa mở triển khai phần mềm theo blueprint đến khi WBS + SRS được xác nhận.
)
