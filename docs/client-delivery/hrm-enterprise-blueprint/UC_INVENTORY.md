# Inventory use case — HRM doanh nghiệp (khóa trước khi viết FR)

| Mục | Nội dung |
|-----|----------|
| Phiên bản | **0.3.9** — CONFIRM `UC-BP-CORE-09d` tám mã = **ví dụ khởi tạo** · catalog mở · AC-CTR-XEVN-11 · đồng bộ SRS **v0.21** · giữ PLT-01 · nền 0.3.8 |
| Mục đích | Khóa danh sách mã UC trước / khi soạn FR trong SRS |
| Nguồn | WBS bốn khối · phiếu SPONSOR_CHOT_FILL + REMAINING · ma trận UC/BR · SYNTHESIS_MASTER |
| Quy tắc | Mỗi Task WBS có ≥1 UC; mọi UC có `partner_req_id`; FR ưu tiên phải có trong danh sách này |
| Ánh xạ mã | `UC_ID_CROSSWALK.md` — mã cũ ↔ `UC-BP-*` ↔ yêu cầu đối tác ↔ trang trình bày |
| UC chờ bổ sung FR | Chỉ còn OUT/GĐ2 giữ khung stamp — EXPAND đã đủ 7 mục (SRS v0.8) |
| SRS đồng bộ | `SRS_HRM_ENTERPRISE.md` **v0.8** · khóa `SPONSOR_SRS_CHOT_LOCK.md` |

**Trạng thái FR**

| Ký hiệu | Ý nghĩa |
|---------|---------|
| **Ưu tiên** | FR đủ 7 mục (đợt 16 ưu tiên ban đầu) |
| **EXPAND** | Đủ 7 mục sau phiếu chốt REMAINING sheet 03 |
| **OUT** / **GĐ2** | Ngoài MVP giấy / giai đoạn 2 — stamp trên SRS |

**Quy ước khối:** REC = Tuyển dụng · CORE = Nhân sự · ATT = Chấm công & Phép · PAY = Tiền lương.

---

## Xương sống end-to-end (thứ tự nghiệp vụ)

**MVP (GĐ1):**

```text
Định biên (phòng ban trình → duyệt → HCNS tổng hợp; lưới «Cần tuyển»)
  → JD master → Auto/tạo YCTD (trong/ngoài ĐB + lý do tuyển mới/thay thế)
  → Trạng thái pipeline trên YCTD (không chiến dịch MVP)
  → Kho CV + ứng viên gắn YCTD (PV/đánh giá trong pipeline) → Offer / onboard
  → Hồ sơ chờ → Checklist → Hoạt động → Ca + cấp phép
  → Chấm theo ca·lịch / Đơn phép (hold; loại phép cấu hình) → Bảng công SoT → Chốt
  → Công thức lương (khung FR PAY; Q-PAY-FORMULA = cách lắp engine) → (Split-month)
  → Phiếu lương / KT-KL đã thi hành / Tất toán nghỉ việc
```

**OUT / GĐ2:** Chiến dịch hub (`UC-BP-REC-03`) **OUT** · OCR (`UC-BP-CORE-04`) **OUT** · đa nguồn (`UC-BP-ATT-03`) **GĐ2** · thẻ QR **OUT**.

---

## Module REC — Tuyển dụng

| Mã UC | Tên | WBS | FR | partner_req_id | PPT |
|-------|-----|-----|-----|----------------|-----|
| UC-BP-REC-00 | Thư viện mô tả công việc (JD master) — **MVP** | WBS-REC-00 | **EXPAND** | REQ_REC_003 | 4 |
| UC-BP-REC-01 | Quản trị định biên vị trí × 12 tháng (phòng ban trình; HCNS tổng hợp) | WBS-REC-01 | **Ưu tiên** | REQ_REC_003; REQ_REC_005 | 4 |
| UC-BP-REC-01b | Auto sinh YCTD theo tháng «Cần tuyển» | WBS-REC-01b | **Ưu tiên** | REQ_REC_003 | 4 |
| UC-BP-REC-02 | Yêu cầu tuyển **trong** định biên (luồng rút gọn) | WBS-REC-02 | **Ưu tiên** | REQ_REC_001 | 4 |
| UC-BP-REC-02b | Yêu cầu tuyển **ngoài** định biên (có BOD) | WBS-REC-02b | **Ưu tiên** | REQ_REC_001 | 4 |
| UC-BP-REC-03 | Gom yêu cầu vào chiến dịch / hub đa kênh — **OUT** | WBS-REC-02c | **OUT** | REQ_REC_002; REQ_REC_005 | 4 |
| UC-BP-REC-04 | Quét kho CV nội bộ trước kênh ngoài | WBS-REC-03 | **EXPAND** | REQ_REC_002 | 5 |
| UC-BP-REC-05 | Lịch sử trạng thái ứng viên gắn YCTD (N–N; PV trong pipeline) | WBS-REC-03 | **EXPAND** | REQ_REC_002 | 5 |
| UC-BP-REC-06 | Gửi thư tuyển + đánh giá PV trong pipeline ứng viên | WBS-REC-04 | **EXPAND** | REQ_REC_004 | 5 |
| UC-BP-REC-06a | Xếp / hủy / đổi lịch PV — tối đa một lịch đang hiệu lực / ứng viên × pháp nhân; badge danh sách | WBS-REC-04 | **ADD** | REQ_REC_004 | 5 |
| UC-BP-REC-07 | Chấp nhận offer → tạo hồ sơ nhân sự (không nhập lại) | WBS-REC-05 | **EXPAND** | REQ_REC_004 | 13 |
| UC-BP-REC-08 | Báo cáo & bảng điều khiển tuyển dụng («bao giờ đủ người») | WBS-REC-06 | **Ưu tiên** | REQ_REC_005 | 4 |

---

## Module CORE — Nhân sự

| Mã UC | Tên | WBS | FR | partner_req_id | PPT |
|-------|-----|-----|-----|----------------|-----|
| UC-BP-CORE-01 | Hồ sơ vòng công khai (hành chính / phúc lợi) | WBS-CORE-01 | **Ưu tiên** | REQ_HR_001; HR-001 | 6 |
| UC-BP-CORE-02 | Hồ sơ vòng C&B (lương, BH, thuế, ngân hàng) | WBS-CORE-01 | **Ưu tiên** | HR-001; PAY-001 | 6 |
| UC-BP-CORE-02b | Cấu hình nhóm field hồ sơ (metadata) | WBS-CORE-01 | **EXPAND** | REQ_HR_001 | 6 |
| UC-BP-CORE-03 | Checklist giấy tờ động (bắt buộc / tùy chọn) | WBS-CORE-03 | **EXPAND** | HR-003 | 7 |
| UC-BP-CORE-04 | OCR giấy tờ — prefill — **OUT** | WBS-CORE-03 | **OUT** | HR-003 | 7 |
| UC-BP-CORE-05 | Cấp phát tài sản & biên bản bàn giao | WBS-CORE-04 | **EXPAND** | HR-006 | 7 |
| UC-BP-CORE-06 | Thu hồi tài sản khi kích hoạt nghỉ việc | WBS-CORE-04 | **EXPAND** | HR-006 | 13 |
| UC-BP-CORE-07 | Kích hoạt hồ sơ Hoạt động khi checklist đủ | WBS-CORE-05 | **EXPAND** | HR-003 | 13 |
| UC-BP-CORE-08 | Khen thưởng & kỷ luật — thi hành → bảng lương | WBS-CORE-06 | **Ưu tiên** | HR-005 | 7 · 11 |
| UC-BP-CORE-09 | Hợp đồng LĐ — mẫu Word keyword fill | WBS-CORE-02 | **EXPAND** | HR-002 | — |
| UC-BP-CORE-09a | Thư viện điều khoản HĐ (Cài đặt) — **ADD** | WBS-CORE-02 | **ADD** | HR-002 | — |
| UC-BP-CORE-09b | Chọn gói nghề và xem trước HĐLĐ — **ADD** | WBS-CORE-02 | **ADD** | HR-002 | — |
| UC-BP-CORE-09c | Lưu phiên bản và in / PDF hợp đồng — **ADD** | WBS-CORE-02 | **ADD** | HR-002 | — |
| UC-BP-CORE-09d | Chọn mẫu HĐ theo catalog mở (ví dụ khởi tạo loại × khối · không trần 8) — **ADD** | WBS-CORE-02 | **ADD** | HR-002 | — |
| UC-BP-PLT-01 | Nền tảng cấu hình động (danh mục · schema · trường trộn) — **ADD** | WBS-CORE-02 | **ADD** | HR-002 | — |
| UC-BP-CORE-10 | BHXH lifecycle (Hoạt động / Ngừng / Tạm hoãn) | WBS-CORE-07 | **EXPAND** | HR-004 | — |

---

## Module ATT — Chấm công & Nghỉ phép

| Mã UC | Tên | WBS | FR | partner_req_id | PPT |
|-------|-----|-----|-----|----------------|-----|
| UC-BP-ATT-01 | Thiết lập quy tắc ca theo bộ phận / nhóm | WBS-ATT-01 | **EXPAND** | TIME-001 | 8 |
| UC-BP-ATT-02 | Phạt muộn / về sớm (phút / block / bậc + nguồn hợp lệ) | WBS-ATT-01 | **Ưu tiên** | TIME-002 | 8 |
| UC-BP-ATT-03 | Thu nhận điểm danh đa nguồn → giờ công thô | WBS-ATT-02 | **GĐ2** | TIME-002; REQ_CC_002 | 8 |
| UC-BP-ATT-03b | Lịch lễ / Tết (dương + âm cấu hình năm) | WBS-ATT-03 | **EXPAND** | REQ_CC_001 | 8 · 9 |
| UC-BP-ATT-03d | Danh mục điểm GPS chấm công (vùng hợp lệ) — **ADD MVP** | WBS-ATT-02b | **EXPAND** | REQ_CC_002 | 8 |
| UC-BP-ATT-03e | Thẻ QR nhân viên — **OUT** | — | **OUT** | — | — |
| UC-BP-ATT-04 | Cấp phát phép năm + danh mục loại phép (năm · thâm niên · …) | WBS-ATT-04 | **EXPAND** | REQ_NP_001 | 9 |
| UC-BP-ATT-04b | Ứng phép & thời điểm cấp / không lương bù trừ | WBS-ATT-04 | **EXPAND** | REQ_NP_002 | 9 |
| UC-BP-ATT-05 | Phép chuyển kỳ (bảo lưu theo FY tenant) | WBS-ATT-04 | **EXPAND** | REQ_NP_005 | 9 |
| UC-BP-ATT-05b | Panel quỹ phép khi nộp đơn — **ADD MVP** | WBS-ATT-05b | **EXPAND** | REQ_NP_003 | 9 |
| UC-BP-ATT-06 | Phép bù OT khi công ty bật chế độ | WBS-ATT-04 | **EXPAND** | REQ_NP_004 | 9 |
| UC-BP-ATT-07 | Nghỉ ốm — chế độ BH + hỗ trợ CTY (nếu có) | WBS-ATT-04 | **EXPAND** | HR-004 | 9 |
| UC-BP-ATT-08 | Tính ngày trừ phép xuyên cuối tuần và lễ (0,5 ngày / 1 giờ) | WBS-ATT-05 | **Ưu tiên** | REQ_NP_006 | 9 |
| UC-BP-ATT-09 | Nộp & duyệt phép — **hold quỹ** khi submit | WBS-ATT-05 | **Ưu tiên** | REQ_NP_003; REQ_NP_006 | 9 |
| UC-BP-ATT-10 | Tổng hợp bảng công (phễu giờ công tính lương) | WBS-ATT-06 | **Ưu tiên** | REQ_L_001 | 10 |
| UC-BP-ATT-11 | Ký chốt bảng công trước khi tính lương (workflow XBOS) | WBS-ATT-06 | **Ưu tiên** | REQ_L_001 | 10 |
| UC-BP-ATT-12 | Mở quỹ phép & ca mặc định khi hồ sơ Hoạt động | WBS-CORE-05 | **EXPAND** | REQ_NP_001; TIME-001 | 13 |

---

## Module PAY — Tiền lương & Phúc lợi

| Mã UC | Tên | WBS | FR | partner_req_id | PPT |
|-------|-----|-----|-----|----------------|-----|
| UC-BP-PAY-01 | Ranh giới: lương chỉ đọc bảng công đã chốt | WBS-ATT-06 | **Ưu tiên** | REQ_L_001 | 10 |
| UC-BP-PAY-02 | Lắp ráp và chạy động cơ công thức lương | WBS-PAY-01 | **Ưu tiên** | REQ_L_002; PAY-001 | 11 |
| UC-BP-PAY-03 | Giảm trừ gia cảnh từ hồ sơ (đủ quyền) | WBS-PAY-02 | **EXPAND** | REQ_L_003 | 11 |
| UC-BP-PAY-04 | Gộp lương khi đổi điều kiện giữa kỳ (không GTCG kép) | WBS-PAY-03 | **Ưu tiên** | REQ_L_004 | 12 |
| UC-BP-PAY-05 | Trần bảo hiểm trên tổng hợp kỳ (kể cả split) | WBS-PAY-02 | **EXPAND** | REQ_L_003; REQ_L_004 | 12 |
| UC-BP-PAY-06 | Tính lương kỳ khi đã Hoạt động + bảng công chốt | WBS-PAY-04 | **EXPAND** | REQ_L_001 | 11 |
| UC-BP-PAY-07 | Lệnh nghỉ việc — cắt BH, tất toán phép, thu hồi, KT/KL kỳ cuối | WBS-PAY-04 | **EXPAND** | REQ_NP_005; HR-006; HR-004; HR-005 | 13 |
| UC-BP-PAY-08 | Phiếu lương — preview, bảo mật, trạng thái TT | WBS-PAY-05 | **EXPAND** | REQ_L_005 | 11 |
| UC-BP-PAY-09 | Phân nhóm bảng lương (VP / KD / tài xế / vận hành) | WBS-PAY-05 | **EXPAND** | REQ_L_006 | 11 |

---

## Tổng hợp khóa inventory

| Chỉ số | Số lượng |
|--------|----------|
| Tổng UC khóa | **48** (+ ATT-03d · ATT-05b · REC-06a; 03e OUT không FR thân) |
| Task WBS có partner_req_id | **27** |
| FR ưu tiên (16 đủ 7 mục) | **16** — giữ nguyên |
| FR EXPAND đủ 7 mục (v0.8) | **28** (= 26 sheet-03 EXPAND + ATT-03d + ATT-05b) |
| OUT / GĐ2 | REC-03 OUT · CORE-04 OUT · ATT-03 GĐ2 · 03e OUT |
| REQ đối tác phủ (primary) | **30/30** — mỗi REQ gắn ≥1 UC |
| SRS đồng bộ | **v0.8** · `SPONSOR_SRS_CHOT_LOCK.md` |

### Phân tầng FR

| Tầng | Số | Mã |
|------|----|-----|
| Đủ 7 mục ưu tiên | 16 | REC-01, REC-01b, REC-02, REC-02b, REC-08, CORE-01, CORE-02, CORE-08, ATT-02, ATT-08, ATT-09, ATT-10, ATT-11, PAY-01, PAY-02, PAY-04 |
| EXPAND / ADD v0.8 | 28 | REC-00,04–07 · CORE-02b,03,05–07,09,10 · ATT-01,03b,03d,04,04b,05,05b,06,07,12 · PAY-03,05–09 |
| OUT / GĐ2 | 4 | REC-03 **OUT** · CORE-04 **OUT** · ATT-03 **GĐ2** · ATT-03e **OUT** |

### Danh sách FR ưu tiên (đợt gửi chốt)

1. UC-BP-REC-01 — Định biên 12 tháng *(đủ 7 mục)*  
2. UC-BP-REC-01b — Auto YCTD theo tháng *(đủ 7 mục)*  
3. UC-BP-REC-02 — YCTD trong ĐB *(đủ 7 mục)*  
4. UC-BP-REC-02b — YCTD ngoài ĐB *(đủ 7 mục)*  
5. UC-BP-REC-08 — Dashboard tuyển *(đủ 7 mục)*  
6. UC-BP-CORE-01 — Vòng hồ sơ công khai *(đủ 7 mục)*  
7. UC-BP-CORE-02 — Vòng C&B *(đủ 7 mục)*  
8. UC-BP-CORE-08 — KT/KL → payroll *(đủ 7 mục)*  
9. UC-BP-ATT-02 — Phạt TIME-002 *(đủ 7 mục)*  
10. UC-BP-ATT-08 — Phép T6–T2 (BR-BP-LV-05) *(đủ 7 mục)*  
11. UC-BP-ATT-09 — Hold quỹ (BR-BP-LV-06) *(đủ 7 mục)*  
12. UC-BP-ATT-10 — Tổng hợp bảng công *(đủ 7 mục)*  
13. UC-BP-ATT-11 — Ký chốt bảng công *(đủ 7 mục)*  
14. UC-BP-PAY-01 — SoT bảng công cho lương (BR-BP-TS-03) *(đủ 7 mục)*  
15. UC-BP-PAY-02 — Động cơ công thức (Q-PAY-FORMULA) *(đủ 7 mục)*  
16. UC-BP-PAY-04 — Split-month (BR-BP-SPL-01) *(đủ 7 mục)*  

### Edge P0 phải có AC đo được trong FR

| BR | UC neo | partner_req_id | Ví dụ PASS |
|----|--------|----------------|------------|
| BR-BP-HC-05/06 | UC-BP-REC-02 / 02b | REQ_REC_001 | Trong ĐB rút gọn · ngoài ĐB bắt BOD (theo cấu hình) |
| BR-BP-HC-04 | UC-BP-REC-01b | REQ_REC_003 | Mỗi ô Cần tuyển approved → đúng 1 YCTD |
| BR-BP-LV-05 | UC-BP-ATT-08 | REQ_NP_006 | T6→T2 trừ **2** ngày làm |
| BR-BP-LV-06 | UC-BP-ATT-09 | REQ_NP_003 | Submit hold; reject hoàn 100% |
| BR-BP-SHF-02 | UC-BP-ATT-02 | TIME-002 | Một mode phạt; chỉ nguồn hợp lệ |
| BR-BP-TS-03 | UC-BP-PAY-01 | REQ_L_001 | Chạy lương không đọc OT/phép trực tiếp |
| BR-BP-SPL-01 | UC-BP-PAY-04 | REQ_L_004 | Một Net; GTCG/trần BH một lần |
| BR-BP-RD-01 | UC-BP-CORE-08 | HR-005 | Thi hành → biến kỳ lương đúng kỳ đích |

---

## Ánh xạ REQ đối tác → UC chính (30/30)

| partner_req_id | UC chính |
|----------------|----------|
| REQ_REC_001 | UC-BP-REC-02, UC-BP-REC-02b |
| REQ_REC_002 | UC-BP-REC-04, UC-BP-REC-05 · UC-BP-REC-03 (GĐ2) |
| REQ_REC_003 | UC-BP-REC-00, UC-BP-REC-01, UC-BP-REC-01b |
| REQ_REC_004 | UC-BP-REC-06, UC-BP-REC-06a, UC-BP-REC-07 |
| REQ_REC_005 | UC-BP-REC-08, UC-BP-REC-01 · UC-BP-REC-03 (GĐ2) |
| REQ_HR_001 | UC-BP-CORE-02b, UC-BP-CORE-01 |
| HR-001 | UC-BP-CORE-01, UC-BP-CORE-02 |
| HR-002 | UC-BP-CORE-09 · 09a · 09b · 09c · 09d · PLT-01 |
| HR-003 | UC-BP-CORE-03, UC-BP-CORE-04, UC-BP-CORE-07 |
| HR-004 | UC-BP-CORE-10, UC-BP-ATT-07 |
| HR-005 | UC-BP-CORE-08 |
| HR-006 | UC-BP-CORE-05, UC-BP-CORE-06 |
| TIME-001 | UC-BP-ATT-01, UC-BP-ATT-12 |
| TIME-002 | UC-BP-ATT-02, UC-BP-ATT-03 |
| REQ_CC_001 | UC-BP-ATT-03b |
| REQ_CC_002 | UC-BP-ATT-03d (MVP) · UC-BP-ATT-03 (GĐ2) |
| REQ_NP_001 | UC-BP-ATT-04, UC-BP-ATT-12 |
| REQ_NP_002 | UC-BP-ATT-04b |
| REQ_NP_003 | UC-BP-ATT-09, UC-BP-ATT-05b |
| REQ_NP_004 | UC-BP-ATT-06 |
| REQ_NP_005 | UC-BP-ATT-05, UC-BP-PAY-07 |
| REQ_NP_006 | UC-BP-ATT-08, UC-BP-ATT-09 |
| PAY-001 | UC-BP-CORE-02, UC-BP-PAY-02 |
| REQ_L_001 | UC-BP-ATT-10, UC-BP-ATT-11, UC-BP-PAY-01 |
| REQ_L_002 | UC-BP-PAY-02 |
| REQ_L_003 | UC-BP-PAY-03, UC-BP-PAY-05 |
| REQ_L_004 | UC-BP-PAY-04 |
| REQ_L_005 | UC-BP-PAY-08 |
| REQ_L_006 | UC-BP-PAY-09 |

---

## Gate trước khi mở đặc tả kỹ thuật

- [x] Inventory **47** UC khóa trên giấy (EXPAND + ADD 03d/05b; OUT/GĐ2 stamp) — SRS v0.8  
- [x] **16** FR ưu tiên đủ 7 mục (giữ nguyên)  
- [x] Sheet 03 EXPAND + ATT-03d/05b đủ 7 mục; REC-03·CORE-04·ATT-03e OUT; ATT-03 GĐ2  
- [x] Decision FILL+REMAINING phản ánh SRS (FY CRUD · sign XBOS · PAY form GĐ1 · Face mobile)  
- [ ] QC spot PO-HRM-BP-SRS-CHOT-QC-SPOT-01 trước khi PM flip ready_for_techspec_docs (paper-only)  
- [ ] **Chưa** READY_FOR_TECHSPEC đầy đủ / TechSpec S3 vẫn HOLD · Attendance not CLOSED  

---

## Nhật ký phiên bản

| Ver | Ngày | Thay đổi |
|-----|------|----------|
| 0.3 | 2026-08-04 | Align WBS + crosswalk → 44 UC · 30/30 REQ |
| **0.3.1** | **2026-08-04** | Ánh xạ mã / danh sách chờ FR; tách **10 đủ 7 mục** vs **6 stub ưu tiên** (+ UC lịch) |
| **0.4** | **2026-08-04** | SRS bổ sung 6 FR stub → **16** FR ưu tiên đủ 7 mục |
| **0.3.2** | **2026-08-04** | Họp review: +REC-00 JD; REC-03 = GĐ2; E2E spine MVP; đồng bộ SRS v0.6 |
| **0.3.3** | **2026-08-04** | Synthesis CORRECTION: PAY meeting complete; ATT leave types; SRS v0.7 |
| **0.3.4** | **2026-08-05** | SRS-CHOT-01: EXPAND sheet 03 · ADD 03d/05b · PAY→EXPAND · đồng bộ SRS v0.8 · cấm claim READY_FOR_TECHSPEC |
| **0.3.8** | **2026-08-07** | ADD `UC-BP-PLT-01` · EXPAND `UC-BP-CORE-09d` catalog mở · đồng bộ SRS v0.20 |
| **0.3.9** | **2026-08-07** | CONFIRM `UC-BP-CORE-09d` ví dụ khởi tạo + catalog mở · đồng bộ SRS v0.21 · giữ PLT-01 |

*Inventory này là khóa phạm vi — không thay thế SRS và không khẳng định đã triển khai / khách đã ký.*
