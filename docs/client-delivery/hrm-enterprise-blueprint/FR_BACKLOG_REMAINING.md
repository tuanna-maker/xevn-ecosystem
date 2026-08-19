# Backlog FR còn lại — skeleton đợt 2+

| Mục | Nội dung |
|-----|----------|
| Phiên bản | 1.1 |
| work_item | `PO-HRM-BP-BA-PROCESS-RESIDUAL-01` |
| Mục đích | Khóa skeleton Diễn biến + BR cho UC **chưa đủ 7 mục** — ba-docs điền FR wave-2 |
| Không đụng | 10 FR đã đủ 7 mục trong `SRS_HRM_ENTERPRISE.md` v0.2 |
| Tham chiếu | `UC_ID_CROSSWALK.md` · inventory 0.3.1 · `UC_BR_MATRIX_DEPTH.md` v1.1 · WBS v0.3 |

> **Lưu ý inventory 0.3.1:** cột FR = **Ưu tiên** có **16** mã = **10 đủ 7 mục** + **6 stub P0**. Wave-2A = fill 6 stub; Wave-2B = residual Lịch P0 (lễ âm, mail PV, accrual, …).

---

## 0. Residual edges vs 10 FR đủ 7 mục (SRS v0.2)

| Edge đối tác | partner_req_id | Phủ bởi 10 FR đủ 7 mục? | UC neo còn thiếu thân FR | Verdict |
|--------------|----------------|-------------------------|--------------------------|---------|
| Trừ phép T6→T2 chỉ ngày làm | REQ_NP_006 | **Đủ** — FR-UC-BP-ATT-08 | Hold = ATT-09 (stub ưu tiên) | Trừ ngày **ĐỦ**; hold **THIẾU thân** |
| Accrual 1n/tháng + thâm niên + chức vụ | REQ_NP_001 | Không | UC-BP-ATT-04 (Lịch — wave-2B) | **THIẾU** · Q-LEAVE-ACCRUAL |
| Ứng phép / thời điểm cấp / không lương | REQ_NP_002 | Không | UC-BP-ATT-04b (Lịch — wave-2B) | **THIẾU** |
| Hold quỹ khi submit | REQ_NP_003 | Không | UC-BP-ATT-09 (stub ưu tiên) | **THIẾU thân** |
| Phép OT nghỉ bù | REQ_NP_004 | Không | UC-BP-ATT-06 (Lịch) | **THIẾU** |
| Bảo lưu Q1 + payout CB-BH | REQ_NP_005 | Không | UC-BP-ATT-05 · PAY-07 | **THIẾU** |
| Lễ dương + **âm lịch cấu hình năm** | REQ_CC_001 | ATT-08 tiêu thụ lịch; không FR cấu hình | UC-BP-ATT-03b (Lịch) | **THIẾU** |
| Mail PV CC interviewer + đánh giá Pass/Fail | REQ_REC_004 | Không | UC-BP-REC-06 (Lịch) | **THIẾU** |
| Phạt phút / block / bậc + IP·GPS·máy | TIME-002 | Không | UC-BP-ATT-02 (stub ưu tiên) | **THIẾU thân** |
| Trong ĐB vs ngoài ĐB fork | REQ_REC_001 | Không | UC-BP-REC-02 / 02b (stub) | **THIẾU thân** · **Q-REC-HEADCOUNT** |
| Auto sinh YCTD theo tháng | REQ_REC_003 | REC-01 nhắc sơ; không FR riêng | UC-BP-REC-01b (stub) | **THIẾU thân** |
| KT/KL → biến kỳ lương | HR-005 | Không | UC-BP-CORE-08 (stub) | **THIẾU thân** |
| Bảng công = SoT lương | REQ_L_001 | **Đủ** — ATT-10/11 + PAY-01 | — | **ĐỦ** |
| Công thức / dual-control | REQ_L_002 | **Đủ khung** — PAY-02 | — | **ĐỦ khung** · **Q-PAY-FORMULA** |
| Split-month không GTCG kép | REQ_L_004 | **Đủ** — PAY-04 | PAY-05 trần | Merge **ĐỦ**; trần **THIẾU** |

---

## 1. Wave-2A — 6 stub ưu tiên (inventory cột Ưu tiên, chưa đủ 7 mục)

Mỗi khối: **id · tên · 3 bullet Diễn biến · BR · Decision**.

### 1. UC-BP-REC-01b — Auto sinh YCTD theo tháng

- **Diễn biến:** (1) Sau duyệt định biên, hệ quét ô «Cần tuyển». (2) Mỗi ô approved sinh đúng **một** YCTD gắn tháng kế hoạch + vị trí + SL. (3) Mở lại cùng phiên bản ĐB → không sinh trùng; đổi SL sau khi đã sinh → cập nhật/version hoặc cảnh báo.
- **BR:** BR-BP-HC-04 · **partner_req_id:** REQ_REC_003 · PPT 4 · **Decision:** —

### 2. UC-BP-REC-02 — YCTD trong định biên

- **Diễn biến:** (1) Tạo YCTD gắn ô «Cần tuyển» đã duyệt (`headcount_mode=in_plan`). (2) Luồng duyệt rút gọn theo policy pháp nhân (không bắt buộc BOD nếu cấu hình cho phép). (3) Sau duyệt → sẵn sàng chiến dịch / nhận CV.
- **BR:** BR-BP-HC-05 · **partner_req_id:** REQ_REC_001 · PPT 4 · **Decision:** **Q-REC-HEADCOUNT**

### 3. UC-BP-REC-02b — YCTD ngoài định biên

- **Diễn biến:** (1) Tạo YCTD `out_of_plan` / vượt HC / phát sinh. (2) Nhánh duyệt dài hơn — thiếu BOD (khi cấu hình yêu cầu) → không mở tin. (3) Mặc định đề xuất: **chặn** mở tin đến khi BOD duyệt.
- **BR:** BR-BP-HC-06 · **partner_req_id:** REQ_REC_001 · PPT 4 · **Decision:** **Q-REC-HEADCOUNT**

### 4. UC-BP-ATT-02 — Phạt muộn / về sớm

- **Diễn biến:** (1) C&B chọn mode phạt: phút XOR block XOR bậc theo bộ phận/ca. (2) Điểm danh hợp lệ (IP và/hoặc GPS và/hoặc máy) → áp phạt khớp timestamp. (3) Nguồn ngoài danh sách hợp lệ → từ chối hoặc 0 công; tắt phạt → 0 phạt.
- **BR:** BR-BP-SHF-02 · **partner_req_id:** TIME-002 · PPT 8 · **Decision:** —

### 5. UC-BP-ATT-09 — Nộp và duyệt phép · hold quỹ

- **Diễn biến:** (1) Submit đơn → hold số ngày trừ dự kiến (working-day theo ATT-08 / lịch ATT-03b). (2) Duyệt → hold chuyển deducted; từ chối → hoàn hold 100%. (3) Đổi loại nghỉ → tính lại hold; overlapping cùng ngày → chặn.
- **BR:** BR-BP-LV-06 · BR-BP-LV-05 · **partner_req_id:** REQ_NP_003; REQ_NP_006 · PPT 9 · **Decision:** Q-LEAVE-UNIT

### 6. UC-BP-CORE-08 — Khen thưởng & kỷ luật → bảng lương

- **Diễn biến:** (1) HCNS tạo bản ghi KT/KL có số tiền + trạng thái thi hành. (2) Đang/Đã thi hành → đẩy biến thưởng/phạt vào kỳ lương đích. (3) Hủy thi hành → không vào kỳ chưa chốt; sau chốt không sửa phiếu đã khóa.
- **BR:** BR-BP-RD-01 · **partner_req_id:** HR-005 · PPT 7·11 · **Decision:** —

---

## 1b. Wave-2B — Residual Lịch P0 (≥6 UC — lễ âm · mail PV · NP accrual)

### 7. UC-BP-ATT-03b — Lịch nghỉ lễ & ngày không làm việc

- **Diễn biến:** (1) Admin pháp nhân mở lịch năm → nhập/duyệt lễ dương cố định + ngày âm lịch năm đó. (2) Phép và bảng công cùng đọc lịch hiệu lực. (3) Đổi lịch giữa năm → đơn chưa duyệt tính lại theo version mới.
- **BR:** BR-BP-HOL-01 · **partner_req_id:** REQ_CC_001 · PPT 8·9 · **Decision:** —

### 8. UC-BP-ATT-04 — Cấp phát phép năm (thành phần)

- **Diễn biến:** (1) Hồ sơ Hoạt động → accrual theo cấu hình pháp nhân. (2) Cộng thành phần tách dòng: base tháng (0,5 nếu nửa tháng) + thâm niên + chức vụ. (3) Audit mọi điều chỉnh; không hardcode 12 ngày toàn tập đoàn.
- **BR:** BR-BP-LV-01 · **partner_req_id:** REQ_NP_001 · PPT 9 · **Decision:** **Q-LEAVE-ACCRUAL**

### 9. UC-BP-ATT-04b — Ứng phép & thời điểm cấp

- **Diễn biến:** (1) Admin bật/tắt ứng trước + chọn thời điểm cấp (đầu năm / tháng / 6 tháng). (2) Toggle OFF → chặn đơn vượt số dư. (3) Nghỉ khi chưa có quỹ → loại không lương rồi bù trừ khi accrual về.
- **BR:** BR-BP-LV-07 · **partner_req_id:** REQ_NP_002 · PPT 9 · **Decision:** —

### 10. UC-BP-REC-06 — Gửi thư tuyển theo mẫu (PV CC interviewer)

- **Diễn biến:** (1) TD chọn template (cảm ơn / lịch PV / offer) + interviewer. (2) Gửi lịch PV → **bắt buộc CC** mọi interviewer; thiếu email → chặn gửi. (3) Log mọi lần gửi; đánh giá Pass/Fail + đề xuất lương; onboard list → task CSVC.
- **BR:** BR-BP-MAIL-01 · **partner_req_id:** REQ_REC_004 · PPT 5 · **Decision:** —

### 11. UC-BP-REC-07 — Chấp nhận offer → hồ sơ nhân sự

- **Diễn biến:** (1) Offer = Chấp nhận → tạo hồ sơ chờ hoàn thiện. (2) Sao chép trường đã có — **không** bắt nhập lại. (3) Mở checklist; Tuyển **không** gọi Lương.
- **BR:** BR-BP-LC-01 · **partner_req_id:** REQ_REC_004 · PPT 13 · **Decision:** —

### 12. UC-BP-CORE-03 — Checklist giấy tờ động

- **Diễn biến:** (1) Checklist theo vị trí/loại HĐ (bắt buộc / tùy chọn). (2) Upload PDF; HR duyệt từng loại. (3) Thiếu giấy bắt buộc → không Hoàn thiện / không Enabled.
- **BR:** BR-BP-DOC-01 · BR-BP-LC-02 · **partner_req_id:** HR-003 · PPT 7 · **Decision:** —

### 13. UC-BP-PAY-08 — Phiếu lương

- **Diễn biến:** (1) Preview phiếu trước khi gửi. (2) NV chỉ mở phiếu của mình; trạng thái TT / công nợ. (3) Điều chỉnh kỳ → version phiếu rõ.
- **BR:** BR-BP-PAY-03 · **partner_req_id:** REQ_L_005 · PPT 11 · **Decision:** —

### 14. UC-BP-ATT-01 — Thiết lập quy tắc ca theo bộ phận

- **Diễn biến:** (1) Cấu hình ca (giờ, hệ số, grace) theo bộ phận/nhóm. (2) Phân ca tuần/tháng; công theo ca đang gán. (3) Hai bộ phận khác rule — không bị rule global ghi đè.
- **BR:** BR-BP-SHF-01 · **partner_req_id:** TIME-001 · PPT 8 · **Decision:** —

---

## 2. Wave-3+ (đã khóa mã — skeleton ngắn)

Viết đủ 7 mục sau wave-2 hoặc khi khách mở phạm vi:

| UC-BP-* | Tên | BR chính | partner_req_id |
|---------|-----|----------|----------------|
| UC-BP-REC-03 | Chiến dịch & nhận CV | BR-BP-HC-03 | REQ_REC_002; REQ_REC_005 |
| UC-BP-REC-04 | Quét kho CV nội bộ | BR-BP-CV-01 | REQ_REC_002 |
| UC-BP-REC-05 | Lịch sử trạng thái UV | BR-BP-CV-02 | REQ_REC_002 |
| UC-BP-CORE-02b | Cấu hình nhóm field | BR-BP-SEC-03 | REQ_HR_001 · **Q-XBOT-PROFILE** |
| UC-BP-CORE-04 | OCR giấy tờ | BR-BP-OCR-01 | HR-003 |
| UC-BP-CORE-05 / 06 | Tài sản cấp / thu hồi | BR-BP-AST-01/02 | HR-006 · **Q-ASSET-MODULE** |
| UC-BP-CORE-07 | Kích hoạt Hoạt động | BR-BP-LC-02 | HR-003 |
| UC-BP-CORE-09 | HĐ keyword fill | BR-BP-CTR-01 | HR-002 |
| UC-BP-CORE-09a | Thư viện điều khoản HĐ | BR-CTR-CL-01..04 | HR-002 |
| UC-BP-CORE-09b | Gói nghề + xem trước HĐLĐ | BR-CTR-CL-02/04 | HR-002 |
| UC-BP-CORE-09c | Lưu phiên bản + in/PDF | BR-CTR-CL-01/02/04 | HR-002 |
| UC-BP-CORE-10 | BHXH lifecycle | BR-BP-SI-01 | HR-004 · **Q-SI-SUSPEND** |
| UC-BP-ATT-03 | Điểm danh đa nguồn | BR-BP-ATT-01 | TIME-002; REQ_CC_002 |
| UC-BP-ATT-05 | Bảo lưu Q1 | BR-BP-LV-02 | REQ_NP_005 |
| UC-BP-ATT-06 | Phép OT | BR-BP-LV-03 | REQ_NP_004 |
| UC-BP-ATT-07 | Nghỉ ốm BHXH/CTY | BR-BP-LV-04 | (HR-004) |
| UC-BP-ATT-12 | Mở phép & ca mặc định | BR-BP-LC-03 | REQ_NP_001; TIME-001 |
| UC-BP-PAY-03 | GTCG từ hồ sơ | BR-BP-PAY-02 | REQ_L_003 |
| UC-BP-PAY-05 | Trần BH split | BR-BP-SPL-02 | REQ_L_003; REQ_L_004 |
| UC-BP-PAY-06 | Tính lương kỳ | BR-BP-LC-04 | REQ_L_001 |
| UC-BP-PAY-07 | Lệnh nghỉ việc | BR-BP-LC-05 | REQ_NP_005; HR-006; HR-004 |
| UC-BP-PAY-09 | Phân nhóm bảng lương | BR-BP-PAY-04 | REQ_L_006 |

---

## 3. Handoff ba-docs (wave-2)

| Mục | Nội dung |
|-----|----------|
| Entry | SRS v0.2 giữ nguyên 10 FR đủ 7 mục; đọc skeleton §1 + §1b + `UC_ID_CROSSWALK.md` |
| Exit | **6 stub wave-2A** đủ 7 mục trước; sau đó ≥6 residual wave-2B (ưu tiên ATT-03b, ATT-04/04b, REC-06); mỗi FR có `partner_req_id` + BR; Decision mở thì ghi «chờ chốt» — không bịa nhánh |
| Cấm | Đè / rewrite 10 FR đủ 7 mục trừ bug map id; prompt-echo; đụng `docs/hrm/SRS.md` |

---

## 4. Delta họp review 2026-08-04 (POINTER)

| Mục | Hành động |
|-----|-----------|
| UC-BP-REC-00 | Skeleton JD master đã có thân khung trong SRS §3.A — wave ba-docs nâng 7 mục khi chốt MVP |
| UC-BP-REC-03 | **GĐ2 / ngoài MVP** — không ưu tiên fill 7 mục trước hub API |
| PAY mới | **Cấm** invent ngoài khung FR PAY đã có — trụ lương **đã họp xong**; chỉ còn cờ **Q-PAY-FORMULA** (cách lắp engine) |
| ATT loại phép | Wave-2B ATT-04…07: khóa năm · thâm niên · bù OT · chuyển kỳ · ứng phép + nghỉ ốm BH/CTY (SRS v0.7 BR) |
| SoT | SRS v0.7 · inventory 0.3.3 · SYNTHESIS_MASTER v1.0 · evidence `docs/qa/evidence/po-hrm-bp-synth-srs-01.md` (supersede residual «họp lương buổi sau» của `po-hrm-bp-meet-srs-01.md`) |

---

*Skeleton này không thay thế SRS và không khẳng định đã triển khai.*
