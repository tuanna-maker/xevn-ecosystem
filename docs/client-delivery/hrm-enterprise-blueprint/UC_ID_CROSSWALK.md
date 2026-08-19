# Ánh xạ mã use case — HRM doanh nghiệp

| Mục | Nội dung |
|-----|----------|
| Phiên bản | 1.0 |
| work_item | `PO-HRM-BP-BA-PROCESS-RESIDUAL-01` (+ fold `PO-HRM-BP-UC-BR-DEPTH-02`) |
| Nguồn khóa | WBS v0.3 · UC_INVENTORY · UC_BR_MATRIX_DEPTH v1.1 · SRS v0.2 |
| Quy ước | **Mã khóa Task mới** = `UC-BP-*`. Mã `UC-HRM-BP-*` chỉ còn để đối chiếu đợt họp / FR cũ — không mở Task song song |

---

## 1. Quy ước cột

| Cột | Ý nghĩa |
|-----|---------|
| **UC-HRM-BP-*** | Mã đợt họp / skeleton SRS sớm (v0.1) |
| **UC-BP-*** | Mã khóa hiện tại (WBS / inventory / ma trận độ sâu) |
| **partner_req_id** | Mã REQ đối tác (primary; có thể nhiều mã) |
| **PPT** | Slide neo (1…14) |
| **FR SRS v0.2** | **Đủ 7 mục** · **Stub ưu tiên** (inventory Ưu tiên, chưa đủ thân) · **Lịch** |
| **Decision** | Q-* chặn khóa FR kỹ thuật (nếu có) |

---

## 2. Bảng map đầy đủ

### 2.1 Tuyển dụng (REC)

| UC-HRM-BP-* (cũ) | UC-BP-* (khóa) | Tên ngắn | partner_req_id | PPT | FR SRS v0.2 | Decision | WBS |
|------------------|----------------|----------|----------------|-----|-------------|----------|-----|
| UC-HRM-BP-RE-01 | UC-BP-REC-01 | Định biên 12 tháng | REQ_REC_003; REQ_REC_005 | 4 | **Đủ 7 mục** | Q-REC-HEADCOUNT (ảnh hưởng spawn) | WBS-REC-01 |
| *(tách từ RE-01)* | UC-BP-REC-01b | Auto sinh YCTD theo tháng | REQ_REC_003 | 4 | Stub ưu tiên | — | WBS-REC-01b |
| UC-HRM-BP-RE-02 | UC-BP-REC-02 | YCTD trong định biên | REQ_REC_001 | 4 | Stub ưu tiên | **Q-REC-HEADCOUNT** | WBS-REC-02 |
| *(tách từ RE-02)* | UC-BP-REC-02b | YCTD ngoài định biên | REQ_REC_001 | 4 | Stub ưu tiên | **Q-REC-HEADCOUNT** | WBS-REC-02b |
| UC-HRM-BP-RE-03 | UC-BP-REC-03 | Chiến dịch & nhận CV | REQ_REC_002; REQ_REC_005 | 4 | Lịch | — | WBS-REC-02c |
| UC-HRM-BP-RE-04 | UC-BP-REC-04 | Quét kho CV nội bộ | REQ_REC_002 | 5 | Lịch | — | WBS-REC-03 |
| UC-HRM-BP-RE-04 | UC-BP-REC-05 | Lịch sử trạng thái UV | REQ_REC_002 | 5 | Lịch | — | WBS-REC-03 |
| UC-HRM-BP-RE-06 | UC-BP-REC-06 | Mail mẫu PV / offer / cảm ơn | REQ_REC_004 | 5 | Lịch | — | WBS-REC-04 |
| UC-HRM-BP-RE-05 | UC-BP-REC-07 | Accept offer → hồ sơ | REQ_REC_004 | 13 | Lịch | — | WBS-REC-05 |
| *(bổ sung)* | UC-BP-REC-08 | Dashboard tuyển | REQ_REC_005 | 4 | **Đủ 7 mục** | — | WBS-REC-06 |

### 2.2 Nhân sự (CORE)

| UC-HRM-BP-* (cũ) | UC-BP-* (khóa) | Tên ngắn | partner_req_id | PPT | FR SRS v0.2 | Decision | WBS |
|------------------|----------------|----------|----------------|-----|-------------|----------|-----|
| UC-HRM-BP-HR-01 | UC-BP-CORE-01 | Hồ sơ vòng công khai | REQ_HR_001; HR-001 | 6 | **Đủ 7 mục** | — | WBS-CORE-01 |
| UC-HRM-BP-HR-02 | UC-BP-CORE-02 | Hồ sơ vòng C&B | HR-001; PAY-001 | 6 | **Đủ 7 mục** | — | WBS-CORE-01 |
| *(tách metadata)* | UC-BP-CORE-02b | Cấu hình nhóm field hồ sơ | REQ_HR_001 | 6 | Lịch | **Q-XBOT-PROFILE** | WBS-CORE-01 |
| UC-HRM-BP-HR-03 | UC-BP-CORE-03 | Checklist giấy tờ | HR-003 | 7 | Lịch | — | WBS-CORE-03 |
| UC-HRM-BP-HR-03 | UC-BP-CORE-04 | OCR giấy tờ | HR-003 | 7 | Lịch | — | WBS-CORE-03 |
| UC-HRM-BP-HR-04 | UC-BP-CORE-05 | Cấp phát tài sản | HR-006 | 7 | Lịch | **Q-ASSET-MODULE** | WBS-CORE-04 |
| UC-HRM-BP-HR-04 | UC-BP-CORE-06 | Thu hồi tài sản khi nghỉ | HR-006 | 7 · 13 | Lịch | **Q-ASSET-MODULE** | WBS-CORE-04 |
| UC-HRM-BP-HR-05 | UC-BP-CORE-07 | Kích hoạt hồ sơ Hoạt động | HR-003 | 13 | Lịch | — | WBS-CORE-05 |
| *(bổ sung đối tác)* | UC-BP-CORE-08 | Khen thưởng / kỷ luật → lương | HR-005 | 7 · 11 | Stub ưu tiên | — | WBS-CORE-06 |
| *(bổ sung đối tác)* | UC-BP-CORE-09 | Hợp đồng LĐ · keyword fill | HR-002 | 13 | Lịch | — | WBS-CORE-02 |
| *(bổ sung đối tác)* | UC-BP-CORE-10 | BHXH lifecycle | HR-004 | — | Lịch | **Q-SI-SUSPEND** | WBS-CORE-07 |

### 2.3 Chấm công & Nghỉ phép (ATT)

| UC-HRM-BP-* (cũ) | UC-BP-* (khóa) | Tên ngắn | partner_req_id | PPT | FR SRS v0.2 | Decision | WBS |
|------------------|----------------|----------|----------------|-----|-------------|----------|-----|
| UC-HRM-BP-AT-01 | UC-BP-ATT-01 | Quy tắc ca theo bộ phận | TIME-001 | 8 | Lịch | — | WBS-ATT-01 |
| UC-HRM-BP-AT-02 | UC-BP-ATT-02 | Phạt muộn / sớm (phút·block·bậc) | TIME-002 | 8 | Stub ưu tiên | — | WBS-ATT-01 |
| UC-HRM-BP-AT-01…02 | UC-BP-ATT-03 | Điểm danh đa nguồn → giờ thô | TIME-002; REQ_CC_002 | 8 | Lịch | — | WBS-ATT-02 |
| *(bổ sung đối tác)* | UC-BP-ATT-03b | Lịch lễ dương + âm cấu hình năm | REQ_CC_001 | 8 · 9 | Lịch | — | WBS-ATT-03 |
| UC-HRM-BP-AT-03…04 | UC-BP-ATT-04 | Cấp phát phép năm (thành phần) | REQ_NP_001 | 9 | Lịch | **Q-LEAVE-ACCRUAL** | WBS-ATT-04 |
| *(tách NP-002)* | UC-BP-ATT-04b | Ứng phép & thời điểm cấp | REQ_NP_002 | 9 | Lịch | — | WBS-ATT-04 |
| UC-HRM-BP-AT-03…04 | UC-BP-ATT-05 | Bảo lưu phép đến hết Q1 | REQ_NP_005 | 9 | Lịch | — | WBS-ATT-04 |
| UC-HRM-BP-AT-03…04 | UC-BP-ATT-06 | Phép OT (nghỉ bù) | REQ_NP_004 | 9 | Lịch | — | WBS-ATT-04 |
| UC-HRM-BP-AT-06 | UC-BP-ATT-07 | Nghỉ ốm BHXH / CTY 100% | (liên quan HR-004) | 9 | Lịch | Q-SI-SUSPEND (map) | WBS-ATT-04 |
| UC-HRM-BP-AT-05 | UC-BP-ATT-08 | Trừ phép xuyên T7–CN–Lễ | REQ_NP_006 | 9 | **Đủ 7 mục** | **Q-LEAVE-UNIT** | WBS-ATT-05 |
| *(tách hold)* | UC-BP-ATT-09 | Nộp/duyệt phép · hold quỹ | REQ_NP_003; REQ_NP_006 | 9 | Stub ưu tiên | Q-LEAVE-UNIT | WBS-ATT-05 |
| UC-HRM-BP-AT-07 | UC-BP-ATT-10 | Tổng hợp bảng công | REQ_L_001 | 10 | **Đủ 7 mục** | — | WBS-ATT-06 |
| UC-HRM-BP-AT-07 | UC-BP-ATT-11 | Ký chốt bảng công | REQ_L_001 | 10 | **Đủ 7 mục** | — | WBS-ATT-06 |
| UC-HRM-BP-HR-05 *(lifecycle)* | UC-BP-ATT-12 | Mở phép & ca khi Hoạt động | REQ_NP_001; TIME-001 | 13 | Lịch | Q-LEAVE-ACCRUAL | WBS-CORE-05 |

### 2.4 Tiền lương (PAY)

| UC-HRM-BP-* (cũ) | UC-BP-* (khóa) | Tên ngắn | partner_req_id | PPT | FR SRS v0.2 | Decision | WBS |
|------------------|----------------|----------|----------------|-----|-------------|----------|-----|
| UC-HRM-BP-AT-07 *(ranh giới)* | UC-BP-PAY-01 | Lương chỉ đọc bảng công chốt | REQ_L_001 | 10 · 3 | **Đủ 7 mục** | — | WBS-ATT-06 |
| UC-HRM-BP-PY-01 | UC-BP-PAY-02 | Động cơ công thức lương | REQ_L_002; PAY-001 | 11 | **Đủ 7 mục** | **Q-PAY-FORMULA** | WBS-PAY-01 |
| UC-HRM-BP-PY-02 | UC-BP-PAY-03 | GTCG từ hồ sơ | REQ_L_003 | 11 | Lịch | — | WBS-PAY-02 |
| UC-HRM-BP-PY-03 | UC-BP-PAY-04 | Split-month · không GTCG kép | REQ_L_004 | 12 | **Đủ 7 mục** | — | WBS-PAY-03 |
| UC-HRM-BP-PY-02 | UC-BP-PAY-05 | Trần BH trên tổng hợp kỳ | REQ_L_003; REQ_L_004 | 12 | Lịch | — | WBS-PAY-02 |
| UC-HRM-BP-PY-04 | UC-BP-PAY-06 | Tính lương kỳ (Active + công chốt) | REQ_L_001 | 11 · 13 | Lịch | — | WBS-PAY-04 |
| UC-HRM-BP-PY-04 | UC-BP-PAY-07 | Lệnh nghỉ việc · tất toán | REQ_NP_005; HR-006; HR-004 | 13 | Lịch | — | WBS-PAY-04 |
| *(bổ sung đối tác)* | UC-BP-PAY-08 | Phiếu lương · TT/công nợ | REQ_L_005 | 11 | Lịch | — | WBS-PAY-05 |
| *(bổ sung đối tác)* | UC-BP-PAY-09 | Phân nhóm bảng lương | REQ_L_006 | 11 | Lịch | — | WBS-PAY-05 |

---

## 3. FR ưu tiên SRS v0.2 ↔ mã khóa (không đổi thân FR)

| # | FR trong SRS (đủ 7 mục) | UC-BP-* | partner_req_id chính |
|---|-------------------------|---------|----------------------|
| 1 | FR-UC-BP-REC-01 | UC-BP-REC-01 | REQ_REC_003 |
| 2 | FR-UC-BP-REC-08 | UC-BP-REC-08 | REQ_REC_005 |
| 3 | FR-UC-BP-CORE-01 | UC-BP-CORE-01 | HR-001 |
| 4 | FR-UC-BP-CORE-02 | UC-BP-CORE-02 | HR-001 |
| 5 | FR-UC-BP-ATT-08 | UC-BP-ATT-08 | REQ_NP_006 |
| 6 | FR-UC-BP-ATT-10 | UC-BP-ATT-10 | REQ_L_001 |
| 7 | FR-UC-BP-ATT-11 | UC-BP-ATT-11 | REQ_L_001 |
| 8 | FR-UC-BP-PAY-01 | UC-BP-PAY-01 | REQ_L_001 |
| 9 | FR-UC-BP-PAY-02 | UC-BP-PAY-02 | REQ_L_002 · **Q-PAY-FORMULA** |
| 10 | FR-UC-BP-PAY-04 | UC-BP-PAY-04 | REQ_L_004 |

> Ghi chú: skeleton SRS sớm từng dùng `FR-UC-HRM-BP-*` (RE-01/02/05/08, AT-04/05/07/08/09, PY-01/03). Đợt v0.2 đã **đổi mã FR sang `FR-UC-BP-*`** theo inventory khóa; không viết lại 10 FR đủ 7 mục — chỉ giữ bảng map này.

---

## 4. Tổng hợp số lượng

| Chỉ số | Số |
|--------|----|
| Task WBS có `partner_req_id` | **27** |
| UC-BP khóa | **44** |
| FR đủ 7 mục (SRS v0.2) | **10** |
| Stub ưu tiên (chưa đủ thân) | **6** |
| UC Lịch | **28** |
| REQ đối tác phủ | **30/30** |

---

## 5. Lỗi map đã sửa khi đối chiếu (inventory → WBS v0.3)

| Vấn đề | Trước (inventory 0.2) | Sau (khóa WBS/depth) |
|--------|----------------------|----------------------|
| REQ_CC_001 | Gắn chung UC-BP-ATT-08 | **UC-BP-ATT-03b** (SoT lịch) + ATT-08 tiêu thụ lịch |
| HR-002 | Gắn CORE-01 «HĐ FR lịch» | **UC-BP-CORE-09** |
| HR-005 | Gắn PAY-06 | **UC-BP-CORE-08** → biến kỳ lương |
| REQ_L_005 / REQ_L_006 | Gắn PAY-06 | **UC-BP-PAY-08 / PAY-09** |
| REQ_REC_001 fork | Chỉ REC-02 | **REC-02 + REC-02b** (+ Decision) |
| REQ_NP_002 | Gộp trong ATT-04 | **UC-BP-ATT-04b** tách |

---

*Tài liệu ánh xạ nội bộ gói khách — không khẳng định đã triển khai phần mềm.*
