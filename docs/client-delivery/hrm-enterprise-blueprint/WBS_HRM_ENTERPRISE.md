# WBS — Hệ thống HRM doanh nghiệp

| Mục | Nội dung |
|-----|----------|
| Phiên bản | **0.4** — đồng bộ họp review / SYNTHESIS_MASTER: JD MVP · chiến dịch = GĐ2 · tách module · bảng công → lương |
| Nguồn nghiên cứu | Họp thiết kế kiến trúc (14 trang) · mind map bốn trụ · HTML họp · danh mục yêu cầu đối tác (30 mục) · ma trận UC/BR độ sâu v1.1 · SYNTHESIS_MASTER v1.0 |
| Phạm vi | Bốn khối độc lập, liên kết qua ranh giới dữ liệu đã thống nhất |
| Giai đoạn kế | Đặc tả kỹ thuật · thiết kế dữ liệu · hợp đồng tích hợp **HOLD** đến khi khách xác nhận SRS |

**Mục tiêu quản trị:** Duyệt **100% logic trên giấy** (WBS → use case → quy tắc) trước khi viết mã cho các luồng mới trong phạm vi blueprint.

**Triết lý:** Hệ thống trả lời câu hỏi quản trị và vận hành trạng thái — không chỉ lưu bảng tĩnh.

**Khóa mã use case:** `UC-BP-*` (khớp ma trận độ sâu v1.1). Mã cũ `UC-HRM-BP-*` giữ ánh xạ ở Phụ lục C — không dùng song song trong Task mới.

---

## Bản đồ bốn khối

| Khối | Tên | Câu hỏi quản trị cốt lõi |
|------|-----|---------------------------|
| **REC** | Tuyển dụng | Bao giờ có người làm? |
| **CORE** | Nhân sự | Hồ sơ đã đủ giấy tờ chưa? Ai được xem dữ liệu mật? |
| **ATT** | Chấm công & Nghỉ phép | Giờ công đúng ca? Phép xuyên cuối tuần/lễ trừ đúng ngày làm? |
| **PAY** | Tiền lương & Phúc lợi | Công thức ai cấu hình? Đổi lương giữa kỳ có một phiếu net? |

**Ranh giới liên kết (chốt logic, chưa đặc tả kỹ thuật):**

| Từ → Đến | Dữ liệu mang theo | Cấm |
|----------|-------------------|-----|
| REC → CORE | Ứng viên chấp nhận offer → hồ sơ nhân sự mới | Nhập lại tay các trường đã có trên hồ sơ ứng viên |
| CORE → ATT | Hồ sơ **Hoạt động** → mở phép năm + gắn ca mặc định | Mở chấm công khi hồ sơ còn chờ hoàn thiện |
| ATT → PAY | **Bảng công đã chốt** (đơn vị giờ công tính lương) | Module lương gọi thẳng OT/phép thay vì bảng công chốt |
| CORE → PAY | Lương cơ sở, phụ cấp, giảm trừ gia cảnh, nghỉ việc, **thưởng/phạt đang thi hành** | — |
| REC ↛ PAY | — | Tuyển dụng **không** trao đổi trực tiếp với lương |

---

## 1. Module Tuyển dụng (REC)

**MVP bốn phần:** thư viện mô tả công việc (JD) · yêu cầu tuyển (trong/ngoài định biên + tuyển mới/thay thế) · ứng viên gắn bắt buộc với YCTD · báo cáo kế hoạch so với thực tế.

**Giai đoạn 2 / ngoài phạm vi hiện tại:** chiến dịch tuyển + hub tin đăng đa kênh (`WBS-REC-02c` / UC-BP-REC-03) — chỉ khi có đối tác API.

### WBS-REC-00 — Thư viện mô tả công việc (JD master) *(MVP)*

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-REC-00 |
| **BR tóm tắt** | BR-BP-JD-01 — Mô tả công việc chuẩn là đầu vào tái sử dụng cho YCTD; không bắt nhập lại toàn bộ mô tả mỗi lần tạo yêu cầu khi đã chọn bản gốc còn hiệu lực |
| **partner_req_id** | REQ_REC_003 |
| **Decision** | — |
| **Nghiệp vụ** | Thư viện JD theo vị trí — một trong bốn phần MVP tuyển |
| **PPT** | Slide 4 |

### WBS-REC-01 — Quản trị định biên 12 tháng

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-REC-01 |
| **BR tóm tắt** | BR-BP-HC-01 — Mỗi ô tháng một trạng thái (Hiện tại / Cần tuyển / Dự kiến); «Cần tuyển» chỉ ở tháng kích hoạt; sau duyệt khóa chỉnh tay không quyền override |
| **partner_req_id** | REQ_REC_003; REQ_REC_005 |
| **Decision** | Q-REC-HEADCOUNT — Trong định biên đã duyệt vs ngoài định biên: ai bỏ qua BOD? |
| **Nghiệp vụ** | Lập lưới vị trí × 12 tháng → đề xuất → duyệt. Trả lời «Khi nào có người?» |
| **PPT** | Slide 4 |

### WBS-REC-01b — Auto sinh YCTD theo tháng «Cần tuyển» *(P0)*

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-REC-01b |
| **BR tóm tắt** | BR-BP-HC-04 — Sau duyệt ĐB: mỗi ô «Cần tuyển» đã approved sinh đúng **một** YCTD gắn tháng kế hoạch + vị trí + số lượng; không sinh trùng khi mở lại cùng phiên bản ĐB |
| **partner_req_id** | REQ_REC_003 |
| **Decision** | — (đổi SL ô sau khi đã sinh YCTD: cập nhật/version hoặc cảnh báo — chốt trên FR) |
| **Nghiệp vụ** | Lịch kích hoạt theo cấu hình; không tạo tay thay thế auto khi ĐB đã approved |
| **PPT** | Slide 4 |

### WBS-REC-02 — Yêu cầu tuyển trong định biên (tuyển mới / thay thế)

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-REC-02 |
| **BR tóm tắt** | BR-BP-HC-05 — `headcount_mode=in_plan` + ĐB năm đã duyệt → luồng duyệt rút gọn (không bắt buộc BOD nếu policy pháp nhân cho phép); vẫn qua TPB/HCNS tối thiểu; lý do **tuyển mới / thay thế** trên YCTD |
| **partner_req_id** | REQ_REC_001 |
| **Decision** | Q-REC-HEADCOUNT |
| **Nghiệp vụ** | YCTD trong kế hoạch đầu năm; thay thế đúng vị trí không vượt ô vẫn `in_plan` |
| **PPT** | Slide 4 |

### WBS-REC-02b — Yêu cầu tuyển ngoài định biên (tuyển mới / thay thế) *(P0)*

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-REC-02b |
| **BR tóm tắt** | BR-BP-HC-06 — `out_of_plan` / phát sinh / vượt HC → nhánh duyệt dài hơn; thiếu BOD (khi cấu hình yêu cầu) → không mở tin. Mặc định đề xuất: **chặn** mở tin đến khi BOD duyệt; lý do **tuyển mới / thay thế** |
| **partner_req_id** | REQ_REC_001 |
| **Decision** | Q-REC-HEADCOUNT (vượt HC: cảnh báo hay chặn) |
| **Nghiệp vụ** | Fork rõ với trong ĐB — không dùng chung ma trận duyệt rút gọn |
| **PPT** | Slide 4 |

### WBS-REC-02c — Chiến dịch tuyển & hub tin đa kênh — **GĐ2 / ngoài phạm vi hiện tại**

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-REC-03 |
| **BR tóm tắt** | BR-BP-HC-03 — Gom nhiều YCTD cùng nhóm kỹ năng; đóng không xóa lịch sử CV; không trộn pháp nhân — **chỉ khi GĐ2 bật** |
| **partner_req_id** | REQ_REC_002; REQ_REC_005 |
| **Decision** | — |
| **Nghiệp vụ** | MVP: trạng thái đăng tin / CV / PV gắn trên **YCTD** — không bắt buộc menu chiến dịch |
| **PPT** | Slide 4 |

### WBS-REC-03 — Kho ứng viên gắn YCTD (liên kết bắt buộc)

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-REC-04, UC-BP-REC-05 |
| **BR tóm tắt** | BR-BP-CV-01 · BR-BP-CV-02 — Quét kho nội bộ trước kênh ngoài (hoặc skip có lý do); giữ lịch sử nguồn / từ chối offer / lương mong muốn; **ứng viên ↔ YCTD bắt buộc** |
| **partner_req_id** | REQ_REC_002 |
| **Decision** | — |
| **Nghiệp vụ** | Kho CV tập trung; pipeline trạng thái trên đúng yêu cầu tuyển |
| **PPT** | Slide 5 |

### WBS-REC-04 — Phỏng vấn, thư mẫu & đánh giá

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-REC-06 |
| **BR tóm tắt** | BR-BP-MAIL-01 — Mail lịch PV bắt buộc CC toàn bộ interviewer; mọi lần gửi ghi lịch sử; đánh giá Pass/Fail + đề xuất lương; danh sách sắp onboard → chuẩn bị CSVC |
| **partner_req_id** | REQ_REC_004 |
| **Decision** | — |
| **Nghiệp vụ** | Template cảm ơn / lịch PV / offer; mẫu đánh giá động |
| **PPT** | Slide 5 |

### WBS-REC-05 — Offer → Hồ sơ nhân sự

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-REC-07 |
| **BR tóm tắt** | BR-BP-LC-01 — Accept Offer tạo hồ sơ chờ hoàn thiện, **không nhập lại** dữ liệu đã có |
| **partner_req_id** | REQ_REC_004 |
| **Decision** | — |
| **Nghiệp vụ** | Handoff REC → CORE; Tuyển **không** gọi Lương |
| **PPT** | Slide 13 |

### WBS-REC-06 — Báo cáo tuyển — kế hoạch so với thực tế *(MVP)*

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-REC-08 |
| **BR tóm tắt** | Funnel CV→PV→chốt gắn YCTD; **KH vs thực tế** theo thời gian × phòng ban × cấp; chỉ số «khi nào đủ người» |
| **partner_req_id** | REQ_REC_005 |
| **Decision** | — |
| **Nghiệp vụ** | Bảng theo dõi tiến độ tuyển cho TP TD / BGĐ / TPB |
| **PPT** | Slide 4 (câu hỏi quản trị) |

---

## 2. Module Nhân sự (CORE)

**Tách module:** vòng hợp đồng & bảo hiểm mật (HĐ/BH) tách hồ sơ công khai. **Quản lý công việc / dự án = module riêng** — không gộp vào nhân sự hành chính.

### WBS-CORE-01 — Hồ sơ công khai & vòng hợp đồng–bảo hiểm mật

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-CORE-01, UC-BP-CORE-02, UC-BP-CORE-02b |
| **BR tóm tắt** | BR-BP-SEC-01 · BR-BP-SEC-02 · BR-BP-SEC-03 — Vòng ngoài: họ tên, liên hệ nội bộ, bộ phận, chức vụ, gia đình phục vụ phúc lợi. Vòng trong (HĐ/BH / C&B): lương, phụ cấp, MST, ngân hàng, sổ BHXH. Nhóm field cấu hình metadata theo pháp nhân |
| **partner_req_id** | REQ_HR_001; HR-001; PAY-001 |
| **Decision** | Q-XBOT-PROFILE — Cấu hình nhóm hồ sơ qua metadata tập đoàn hay hệ riêng |
| **Nghiệp vụ** | Tách lớp hiển thị; quà 1/6 dùng tuổi con vòng ngoài; lịch sử lương/PC theo ngày (PAY-001) |
| **PPT** | Slide 6 |

### WBS-CORE-02 — Hợp đồng lao động (vòng mật)

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-CORE-09 |
| **BR tóm tắt** | BR-BP-CTR-01 — Mã ký, hiệu lực, vị trí, lương; mẫu Word + **keyword fill** in ấn; phụ lục đổi lương → version + feed split-month |
| **partner_req_id** | HR-002 |
| **Decision** | — |
| **Nghiệp vụ** | Hợp đồng & phụ lục đổi lương thuộc CORE; PAY chỉ đọc baseline |
| **PPT** | Slide 13 |

### WBS-CORE-03 — Checklist giấy tờ & OCR

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-CORE-03, UC-BP-CORE-04 |
| **BR tóm tắt** | BR-BP-DOC-01 · BR-BP-OCR-01 — Thiếu giấy bắt buộc → không Hoàn thiện / không Kích hoạt (mặc định); OCR prefill, không bắt nhập lại field đã trích |
| **partner_req_id** | HR-003 |
| **Decision** | OCR bắt buộc hay tùy loại giấy (mở — chốt trên SRS) |
| **Nghiệp vụ** | Checklist động theo vị trí/loại HĐ |
| **PPT** | Slide 7 |

### WBS-CORE-04 — Tài sản & thu hồi khi nghỉ

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-CORE-05, UC-BP-CORE-06 |
| **BR tóm tắt** | BR-BP-AST-01 · BR-BP-AST-02 — Gán kèm biên bản ký; lệnh nghỉ việc → 100% tài sản đang dùng vào danh sách thu hồi |
| **partner_req_id** | HR-006 |
| **Decision** | Q-ASSET-MODULE — Tham chiếu stub hay SoT tài sản đầy đủ trong giai đoạn này |
| **Nghiệp vụ** | Laptop/xe/CCDC; căn cứ tất toán nghỉ việc |
| **PPT** | Slide 7 · 13 |

### WBS-CORE-05 — Vòng đời trạng thái nhân sự

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-CORE-07 *(+ UC-BP-ATT-12, UC-BP-PAY-06, UC-BP-PAY-07)* |
| **BR tóm tắt** | BR-BP-LC-02…05 — Chờ hoàn thiện → (checklist) → Hoạt động → mở phép/ca → sẵn sàng lương; nghỉ việc: cắt BH + tất toán phép + thu hồi tài sản |
| **partner_req_id** | HR-003; HR-004; REQ_NP_005; HR-006 |
| **Decision** | Q-SI-SUSPEND — Tạm hoãn BH khi ốm dài |
| **Nghiệp vụ** | Cổng kích hoạt xuyên khối |
| **PPT** | Slide 13 |

### WBS-CORE-06 — Khen thưởng & kỷ luật → bảng lương *(P0)*

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-CORE-08 |
| **BR tóm tắt** | **BR-BP-RD-01** — Bản ghi KT/KL có **trạng thái thi hành**; số tiền thưởng/phạt đẩy vào kỳ lương đích (biến kỳ); hủy thi hành → không vào kỳ chưa chốt; sau chốt kỳ không sửa phiếu đã khóa |
| **partner_req_id** | HR-005 |
| **Decision** | — |
| **Nghiệp vụ** | Liên kết CORE → PAY qua biến kỳ — không ghi note HR rồi quên trên phiếu |
| **PPT** | Slide 7 · 11 |

### WBS-CORE-07 — Bảo hiểm xã hội (lifecycle)

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-CORE-10 |
| **BR tóm tắt** | BR-BP-SI-01 — % + số tiền NV/CTY; trạng thái Hoạt động / Ngừng / **Tạm hoãn**; đổi hàng loạt có preview + audit |
| **partner_req_id** | HR-004 |
| **Decision** | Q-SI-SUSPEND |
| **Nghiệp vụ** | Map ATT nghỉ dài → tạm hoãn BH theo chính sách |
| **PPT** | — |

---

## 3. Module Chấm công & Nghỉ phép (ATT)

### WBS-ATT-01 — Thiết lập ca & quy tắc phạt *(P0 TIME-002)*

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-ATT-01, UC-BP-ATT-02 |
| **BR tóm tắt** | BR-BP-SHF-01 · **BR-BP-SHF-02** — Rule theo bộ phận/nhóm; phạt theo **phút / block / bậc** (một mode SoT); chỉ áp khi nguồn chấm **hợp lệ** (IP và/hoặc GPS và/hoặc máy theo cấu hình OU) |
| **partner_req_id** | TIME-001; TIME-002 |
| **Decision** | — |
| **Nghiệp vụ** | Ca VP / tài xế / vận hành khác nhau; nguồn ngoài danh sách → từ chối hoặc 0 công (theo policy) |
| **PPT** | Slide 8 |

### WBS-ATT-02 — Dữ liệu chấm công đa nguồn

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-ATT-03 |
| **BR tóm tắt** | BR-BP-ATT-01 — App / IP / GPS / máy → cùng pipeline rule ca → một «giờ công thô»; giải trình sau duyệt cập nhật công + lịch sử |
| **partner_req_id** | TIME-002; REQ_CC_002 |
| **Decision** | — |
| **Nghiệp vụ** | Điểm danh + giải trình công |
| **PPT** | Slide 8 |

### WBS-ATT-03 — Lịch nghỉ lễ & ngày không làm việc

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-ATT-03b |
| **BR tóm tắt** | BR-BP-HOL-01 — Lễ dương cố định + **âm lịch cấu hình hàng năm** theo pháp nhân; dùng chung phép và bảng công |
| **partner_req_id** | REQ_CC_001 |
| **Decision** | — |
| **Nghiệp vụ** | SoT lịch không làm việc theo pháp nhân |
| **PPT** | Slide 8 · 9 |

### WBS-ATT-04 — Các loại nghỉ phép (năm · thâm niên · bù tăng ca · chuyển kỳ · ứng)

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-ATT-04, UC-BP-ATT-04b, UC-BP-ATT-05, UC-BP-ATT-06, UC-BP-ATT-07 |
| **BR tóm tắt** | BR-BP-LV-01 · BR-BP-LV-07 · BR-BP-LV-02…04 — Phép năm (cấp dần) + thâm niên + chức vụ; ứng phép; bảo lưu / chuyển kỳ (Q1); phép bù OT; nghỉ ốm BHXH hoặc công ty hỗ trợ |
| **partner_req_id** | REQ_NP_001; REQ_NP_002; REQ_NP_004; REQ_NP_005; HR-004 |
| **Decision** | Q-LEAVE-ACCRUAL · Q-LEAVE-UNIT |
| **Nghiệp vụ** | Quỹ phép cấu hình theo pháp nhân; không âm quỹ im lặng |
| **PPT** | Slide 9 |

### WBS-ATT-05 — Trừ phép + giữ chỗ quỹ *(P0 NP hold + unit)*

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-ATT-08, UC-BP-ATT-09 |
| **BR tóm tắt** | **BR-BP-LV-05** · **BR-BP-LV-06** — T6→T2 chỉ trừ **2** ngày làm việc (bỏ T7/CN/Lễ); đơn vị tối thiểu nửa ngày hoặc 1 giờ; Submit = **hold** quỹ; reject hoàn hold; approve trừ thật; chặn overlapping |
| **partner_req_id** | REQ_NP_003; REQ_NP_006 |
| **Decision** | Q-LEAVE-UNIT |
| **Nghiệp vụ** | Edge-case chuẩn chốt logic trước phát triển |
| **PPT** | Slide 9 |

### WBS-ATT-06 — Bảng công tổng hợp = đầu vào tính lương *(P0 L-001)*

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-ATT-10, UC-BP-ATT-11, UC-BP-PAY-01 |
| **BR tóm tắt** | BR-BP-TS-01 · BR-BP-TS-02 · **BR-BP-TS-03** — Gộp chấm + phép + OT đã hệ số; ký chốt; **lương chỉ đọc bảng công chốt** — không gọi OT/Phép để tính lương |
| **partner_req_id** | REQ_L_001 |
| **Decision** | Dual-sign mọi kỳ hay chỉ kỳ có OT/điều chỉnh (mở) |
| **Nghiệp vụ** | Một nguồn «giờ công tính lương» (đã thống nhất trong họp bốn trụ) |
| **PPT** | Slide 10 |

---

## 4. Module Tiền lương & Phúc lợi (PAY)

> Họp bốn trụ **đã xong** (gồm tiền lương). Cờ **Q-PAY-FORMULA** chỉ còn về cách lắp công thức — không đồng nghĩa «chưa họp lương».

### WBS-PAY-01 — Động cơ công thức lương

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-PAY-02 |
| **BR tóm tắt** | BR-BP-PAY-01 — HR/C&B lắp biến số (bảng công chốt, lương CB/PC/BH từ vòng HĐ–BH, thuế, GTCG); **không** hardcode công thức trong bản phát hành |
| **partner_req_id** | REQ_L_002; PAY-001 |
| **Decision** | **Q-PAY-FORMULA** — Excel: IT cấu hình DB · PPT: HR kéo-thả → đề xuất engine + dual-control publish |
| **Nghiệp vụ** | Thành phần bật/tắt; PC chịu thuế/BH theo cấu hình; đầu vào giờ = bảng công đã chốt |
| **PPT** | Slide 11 |

### WBS-PAY-02 — Giảm trừ, thuế & bảo hiểm

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-PAY-03, UC-BP-PAY-05 |
| **BR tóm tắt** | BR-BP-PAY-02 · BR-BP-SPL-02 — GTCG từ hồ sơ (đủ quyền); trần BH một lần trên tổng hợp kỳ (kể cả split) |
| **partner_req_id** | REQ_L_003; HR-004 |
| **Decision** | — |
| **Nghiệp vụ** | Không master NPT trùng trên payroll |
| **PPT** | Slide 11 · 12 |

### WBS-PAY-03 — Gộp giữa tháng (split-month) *(P0 L-004)*

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-PAY-04 |
| **BR tóm tắt** | **BR-BP-SPL-01** — Hai đoạn lương CB → một phiếu Net; biến cộng dồn cộng hai đoạn; biến tĩnh (TNCN, GTCG, trần BH) tính **một lần** |
| **partner_req_id** | REQ_L_004 |
| **Decision** | Mốc cắt theo ngày hiệu lực HR hay mốc kỳ cố định |
| **Nghiệp vụ** | Thăng chức / hết thử việc giữa tháng |
| **PPT** | Slide 12 |

### WBS-PAY-04 — Tính lương kỳ & tất toán nghỉ việc

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-PAY-06, UC-BP-PAY-07 |
| **BR tóm tắt** | BR-BP-LC-04 · BR-BP-LC-05 — Chạy lương khi bảng công chốt + NV Hoạt động; nghỉ việc: cutoff BH + payout phép + thu hồi tài sản + KT/KL đang thi hành vào kỳ cuối |
| **partner_req_id** | REQ_L_001; REQ_NP_005; HR-006; HR-004; HR-005 |
| **Decision** | — |
| **Nghiệp vụ** | Kỳ lương thường + lệnh nghỉ việc xuyên khối |
| **PPT** | Slide 11 · 13 |

### WBS-PAY-05 — Phiếu lương & phân nhóm bảng lương

| Thuộc tính | Nội dung |
|------------|----------|
| **UC** | UC-BP-PAY-08, UC-BP-PAY-09 |
| **BR tóm tắt** | BR-BP-PAY-03 · BR-BP-PAY-04 — Preview + xác nhận; chỉ xem của mình; trạng thái TT/công nợ; nhóm VP / KD / tài xế / vận hành |
| **partner_req_id** | REQ_L_005; REQ_L_006 |
| **Decision** | — |
| **Nghiệp vụ** | Phiếu bảo mật; một NV một nhóm active (hoặc rule ưu tiên rõ) |
| **PPT** | Slide 11 |

---

## Phụ lục A — Ánh xạ trang trình bày nguồn

| Trang | Nội dung chính | WBS chính |
|------:|----------------|-----------|
| 1 | Bìa — thiết kế kiến trúc & logic | Toàn chương trình |
| 2 | Từ lưu trữ tĩnh → nghiệp vụ động | Mọi module (trạng thái) |
| 3 | Bốn trụ độc lập & liên kết | REC / CORE / ATT / PAY |
| 4 | Dòng chảy tuyển — định biên | WBS-REC-01..02b, WBS-REC-02c, WBS-REC-06 |
| 5 | Kho ứng viên & giao tiếp | WBS-REC-03..04 |
| 6 | Phân quyền công khai / mật C&B | WBS-CORE-01 |
| 7 | Giấy tờ & tài sản & KT/KL | WBS-CORE-03..04, WBS-CORE-06 |
| 8 | Ma trận cấu hình chấm công theo ca | WBS-ATT-01..02 |
| 9 | Hệ sinh thái nghỉ phép (T6–T2 + hold) | WBS-ATT-03..05 |
| 10 | Chốt bảng công — nguồn gốc lương | WBS-ATT-06 |
| 11 | Động cơ công thức lương · phiếu · nhóm | WBS-PAY-01..02, WBS-PAY-05 |
| 12 | Split-month — mượt bảng lương | WBS-PAY-03 |
| 13 | Vòng đời trạng thái xuyên khối | WBS-CORE-05, WBS-REC-05, WBS-PAY-04 |
| 14 | Kế hoạch: WBS → UC → thiết kế sau duyệt giấy | Gate gửi khách |

---

## Phụ lục B — Decision backlog (Q-*) — chốt với khách / đối tác

| ID | Xung đột / mở | Nguồn | Phương án gợi ý | Ảnh hưởng UC/BR | WBS | Trạng thái |
|----|---------------|-------|-----------------|-----------------|-----|------------|
| **Q-REC-HEADCOUNT** | Trong ĐB đã duyệt vs ngoài ĐB — ai bypass BOD? Vượt HC cảnh báo hay chặn? | REQ_REC_001 | Khóa ma trận role theo pháp nhân trong FR; mặc định ngoài ĐB bắt BOD; vượt HC = chặn mở tin đến khi duyệt | UC-BP-REC-02 / 02b · BR-BP-HC-05/06 | WBS-REC-02, WBS-REC-02b | MỞ |
| **Q-PAY-FORMULA** | Excel: IT cấu hình công thức DB · PPT: HR kéo-thả engine | REQ_L_002 vs PPT | Engine cấu hình versioned + dual-control publish; IT không hardcode mỗi kỳ | UC-BP-PAY-02 · BR-BP-PAY-01 | WBS-PAY-01 | MỞ |
| **Q-XBOT-PROFILE** | REQ_HR_001 nêu cấu hình qua Xbot | REQ_HR_001 | Xbot = lớp metadata/catalog tập đoàn (khuyến nghị) hoặc hệ riêng — ghi rõ phạm vi giai đoạn | UC-BP-CORE-02b | WBS-CORE-01 | MỞ |
| **Q-ASSET-MODULE** | HR-006 tham chiếu module Tài sản | HR-006 | Giai đoạn 1: stub mã/serial + biên bản; giai đoạn sau: SoT tài sản đầy đủ | UC-BP-CORE-05/06 | WBS-CORE-04 | MỞ |
| **Q-LEAVE-ACCRUAL** | 1 ngày/tháng + thâm niên + chức vụ | REQ_NP_001 | Thông số cấu hình theo pháp nhân; thành phần tách dòng audit | UC-BP-ATT-04 · BR-BP-LV-01 | WBS-ATT-04 | MỞ |
| **Q-LEAVE-UNIT** | Nửa ngày vs 1 giờ | REQ_NP_006 | Cấu hình theo loại phép / ca; một đơn vị SoT trên loại | UC-BP-ATT-08 · BR-BP-LV-05 | WBS-ATT-05 | MỞ |
| **Q-SI-SUSPEND** | Tạm hoãn BH khi ốm dài | HR-004 | Map ATT nghỉ dài → BH tạm hoãn có ngày hiệu lực | UC-BP-CORE-10 · BR-BP-SI-01 | WBS-CORE-07 | MỞ |

**Câu hỏi mở bổ sung (không mã Q-*):** Dual-sign bảng công mọi kỳ hay chỉ kỳ có OT/điều chỉnh · Tỷ lệ giờ OT → ngày phép bù · Chính sách lưu ảnh OCR · Chỉ số dashboard bắt buộc trên slide khách.

---

## Phụ lục C — Ánh xạ mã UC phiên bản trước → khóa hiện tại

| Mã cũ / ghi chú | Mã khóa |
|-----------------|---------|
| UC-HRM-BP-RE-01 | UC-BP-REC-01 (+ UC-BP-REC-01b auto YCTD) |
| UC-HRM-BP-RE-02 | UC-BP-REC-02 (trong ĐB) + UC-BP-REC-02b (ngoài ĐB) |
| UC-HRM-BP-RE-03 | UC-BP-REC-03 |
| UC-HRM-BP-RE-04 | UC-BP-REC-04, UC-BP-REC-05 |
| UC-HRM-BP-RE-05 | UC-BP-REC-07 |
| UC-HRM-BP-RE-06 | UC-BP-REC-06 |
| *(bổ sung)* | UC-BP-REC-08 (dashboard — REQ_REC_005) |
| UC-HRM-BP-HR-01…02 | UC-BP-CORE-01, UC-BP-CORE-02, UC-BP-CORE-02b |
| UC-HRM-BP-HR-03 | UC-BP-CORE-03, UC-BP-CORE-04 |
| UC-HRM-BP-HR-04 | UC-BP-CORE-05, UC-BP-CORE-06 |
| *(bổ sung v0.3)* | UC-BP-CORE-08 (KT/KL→lương — HR-005) |
| *(bổ sung v0.3)* | UC-BP-CORE-09 (HĐ keyword — HR-002) |
| *(bổ sung v0.3)* | UC-BP-CORE-10 (BHXH — HR-004) |
| UC-HRM-BP-HR-05 | UC-BP-CORE-07 (+ lifecycle ATT/PAY) |
| UC-HRM-BP-AT-01…02 | UC-BP-ATT-01…03 |
| *(bổ sung v0.3)* | UC-BP-ATT-03b (lịch lễ — REQ_CC_001) |
| UC-HRM-BP-AT-03…04 | UC-BP-ATT-04…07 + UC-BP-ATT-04b |
| UC-HRM-BP-AT-05 | UC-BP-ATT-08 |
| UC-HRM-BP-AT-06 | UC-BP-ATT-07 |
| UC-HRM-BP-AT-07 | UC-BP-ATT-10, UC-BP-ATT-11, UC-BP-PAY-01 |
| UC-HRM-BP-PY-01 | UC-BP-PAY-02 |
| UC-HRM-BP-PY-02 | UC-BP-PAY-03, UC-BP-PAY-05 |
| UC-HRM-BP-PY-03 | UC-BP-PAY-04 |
| UC-HRM-BP-PY-04 | UC-BP-PAY-06, UC-BP-PAY-07 |
| *(bổ sung v0.3)* | UC-BP-PAY-08 (phiếu — REQ_L_005), UC-BP-PAY-09 (nhóm — REQ_L_006) |

WBS cũ `WBS-RE/HR/AT/PY-*` tương ứng `WBS-REC/CORE/ATT/PAY-*` cùng số thứ tự nghiệp vụ (có tách suffix `b`/`c` khi fork đối tác).

---

## Phụ lục D — Phủ 30 REQ đối tác trên WBS (coverage)

| partner_req_id | Task WBS neo | UC neo |
|----------------|--------------|--------|
| REQ_REC_001 | WBS-REC-02, WBS-REC-02b | UC-BP-REC-02 / 02b |
| REQ_REC_002 | WBS-REC-02c, WBS-REC-03 | UC-BP-REC-03 / 04 / 05 |
| REQ_REC_003 | WBS-REC-00, WBS-REC-01, WBS-REC-01b | UC-BP-REC-00 / 01 / 01b |
| REQ_REC_004 | WBS-REC-04, WBS-REC-05 | UC-BP-REC-06 / 07 |
| REQ_REC_005 | WBS-REC-06, WBS-REC-01 | UC-BP-REC-08 / 01 / 03 |
| REQ_HR_001 | WBS-CORE-01 | UC-BP-CORE-02b |
| HR-001 | WBS-CORE-01 | UC-BP-CORE-01 / 02 |
| HR-002 | WBS-CORE-02 | UC-BP-CORE-09 |
| HR-003 | WBS-CORE-03, WBS-CORE-05 | UC-BP-CORE-03 / 04 / 07 |
| HR-004 | WBS-CORE-07, WBS-PAY-02 | UC-BP-CORE-10 |
| HR-005 | WBS-CORE-06 | UC-BP-CORE-08 |
| HR-006 | WBS-CORE-04, WBS-PAY-04 | UC-BP-CORE-05 / 06 |
| TIME-001 | WBS-ATT-01 | UC-BP-ATT-01 |
| TIME-002 | WBS-ATT-01, WBS-ATT-02 | UC-BP-ATT-02 / 03 |
| REQ_CC_001 | WBS-ATT-03 | UC-BP-ATT-03b |
| REQ_CC_002 | WBS-ATT-02 | UC-BP-ATT-03 |
| REQ_NP_001 | WBS-ATT-04 | UC-BP-ATT-04 |
| REQ_NP_002 | WBS-ATT-04 | UC-BP-ATT-04b |
| REQ_NP_003 | WBS-ATT-05 | UC-BP-ATT-09 |
| REQ_NP_004 | WBS-ATT-04 | UC-BP-ATT-06 |
| REQ_NP_005 | WBS-ATT-04, WBS-PAY-04 | UC-BP-ATT-05 · PAY-07 |
| REQ_NP_006 | WBS-ATT-05 | UC-BP-ATT-08 / 09 |
| PAY-001 | WBS-CORE-01, WBS-PAY-01 | UC-BP-CORE-02 · PAY-02 |
| REQ_L_001 | WBS-ATT-06 | UC-BP-ATT-10/11 · PAY-01 |
| REQ_L_002 | WBS-PAY-01 | UC-BP-PAY-02 |
| REQ_L_003 | WBS-PAY-02 | UC-BP-PAY-03 / 05 |
| REQ_L_004 | WBS-PAY-03 | UC-BP-PAY-04 |
| REQ_L_005 | WBS-PAY-05 | UC-BP-PAY-08 |
| REQ_L_006 | WBS-PAY-05 | UC-BP-PAY-09 |

**Đếm phủ:** 30/30 REQ có ≥1 Task WBS + cột `partner_req_id`.

---

## Phụ lục E — Việc làm tiếp (không thuộc tài liệu này)

| Việc | Điều kiện mở |
|------|----------------|
| Đặc tả kỹ thuật (TechSpec) đầy đủ | Khách **xác nhận** WBS + SRS |
| Thiết kế dữ liệu vật lý (DB) & hợp đồng API | Sau TechSpec; giữ cấm REC ↔ PAY trực tiếp |
| Kế hoạch kiểm thử & triển khai mã | Sau khi logic giấy đủ 100% luồng ưu tiên |

**HOLD rõ:** Độ sâu TechSpec / DB / API = **chưa mở** đến khi khách xác nhận SRS.

*Tài liệu này không khẳng định phần mềm đã nghiệm thu hay đã triển khai xong.*
