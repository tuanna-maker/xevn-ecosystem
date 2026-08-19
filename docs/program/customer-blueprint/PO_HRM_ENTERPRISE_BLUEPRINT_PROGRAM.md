# PO — HRM Enterprise Blueprint (khách chốt trên giấy)

| Field | Value |
|-------|--------|
| **work_item_root** | `PO-HRM-BP-PROGRAM-01` |
| **Sponsor ask** | Nghiên cứu kỹ PPT họp + mind map → WBS module→task→UC→BR → SRS → TechSpec → API gửi khách đánh giá/chốt |
| **Nguồn** | `HRM_System_Architectural_Blueprint.pptx` (14 slide = ảnh full-bleed) + 4 mind map NotebookLM (REC / CORE / ATT / PAY) + **Excel danh mục YCNB đối tác** |
| **Excel đối tác** | `Danh_muc_yeu_cau_nghiep_vu_HRM.xlsx` · SoT trích: `PARTNER_REQ_CATALOG_20260804.md` (**30 REQ** + 3 recording 2026-08-04) |
| **Media** | `docs/program/customer-blueprint/hrm-enterprise-pptx-media/` · mirror `C:\xevn-tmp\hrm-blueprint-media\` |
| **Gói khách** | `docs/client-delivery/hrm-enterprise-blueprint/` |
| **Preserve** | **Không** đè `docs/hrm/SRS.md` / OpenAPI AS-IS — gói mới song song |
| **Dev gate** | **Cấm** `apps/**` cho blueprint đến khi khách confirm SRS + TechSpec/DB/API trên giấy (slide 14) |

---

## 1. Mandate (slide 14 — khóa)

1. Duyệt **100% logic nghiệp vụ trên giấy** trước khi code thêm theo blueprint.
2. Dừng kiểu «vừa code vừa vá nghiệp vụ».
3. Thứ tự: **WBS → UC map → SRS confirm → TechSpec + DB_DESIGN + API_DESIGN → (sau đó mới) Dev**.
4. Bốn trụ **độc lập**, liên kết qua **API Gateway / event** — không gọi chéo phá SoT.

### Hard boundaries (kiến trúc khách)

| Rule | Ý nghĩa |
|------|---------|
| **Bảng công chốt = SoT lương** | Payroll **chỉ** đọc timesheet đã chốt; **không** gọi trực tiếp OT/Leave API để tính lương |
| **REC ↛ PAY** | Tuyển dụng không nói chuyện trực tiếp với Lương |
| **Formula engine** | Công thức lương cấu hình (kéo-thả HR), không hardcode trong code release |
| **C&B ring** | Lương/BH/thuế/phụ thuộc chỉ role C&B; vòng public hồ sơ tách biệt |

---

## 2. Bốn trụ (L1) + mind map (L2/L3)

### 2.1 Quản lý Tuyển dụng (REC)

| L2 Task | L3 / leaf nghiệp vụ |
|---------|---------------------|
| Yêu cầu tuyển dụng | Thư viện JD · Phê duyệt định biên · Nhu cầu phát sinh |
| Tin tuyển dụng | Đăng nội bộ · Đồng bộ đa kênh · Trạng thái tin |
| Quản lý ứng viên | Kho CV · Tìm kiếm thông minh · OCR file |
| Phỏng vấn & Onboarding | Lịch PV · Mẫu đánh giá · Offer · Tiếp nhận NV mới |
| Báo cáo tuyển dụng | Tiến độ · Chỉ tiêu hoàn thành |

### 2.2 Quản lý Nhân sự (CORE)

| L2 Task | L3 / leaf |
|---------|-----------|
| Hồ sơ nhân viên | Cá nhân & gia đình · Người phụ thuộc (GTCG) · Lịch sử CT & kỹ năng · Checklist giấy tờ |
| Hợp đồng lao động | Mẫu HĐ · Fill data · Phụ lục & đổi lương |
| Tài sản & Công cụ | Cấp phát · Biên bản bàn giao · Thu hồi khi nghỉ |
| Khen thưởng & Kỷ luật | Thành tích · Xử lý KL · Theo dõi thi hành |

### 2.3 Chấm công & Nghỉ phép (ATT)

| L2 Task | L3 / leaf |
|---------|-----------|
| Thiết lập ca | Phân ca bộ phận · Giờ vào/ra · Lịch lễ & Tết |
| Dữ liệu chấm công | App GPS/Location · Giải trình & phê duyệt · Đi muộn về sớm |
| Quản lý nghỉ phép | Cấp phép năm · Nghỉ OT (bù) · Nghỉ chế độ BH (ốm, thai sản) |
| Bảng công tổng hợp | Chốt cuối tháng · Công tính lương |

### 2.4 Tiền lương & Phúc lợi (PAY)

| L2 Task | L3 / leaf |
|---------|-----------|
| Cấu trúc lương | Thành phần & phụ cấp · Lương theo ngày công · Lương theo KPI |
| Bảo hiểm & Thuế | Mức đóng · Tăng/giảm BH · TNCN |
| Bảng lương & Phiếu lương | Công thức tự động · Gộp mid-month · Gửi phiếu · Xác nhận & thanh toán |

---

## 3. Inventory PPT (slide → nội dung chốt)

| Slide | File | Nội dung chính (để WBS/UC) |
|------:|------|----------------------------|
| 1 | image1 | Cover — Architecture & Business Logic Design |
| 2 | image2 | Từ lưu trữ tĩnh → quy trình động (REC→CORE→ATT→PAY status) |
| 3 | image3 | Bốn trụ độc lập + liên kết API |
| 4 | image4 | Lưới định biên 12 tháng; luồng đề xuất→YC→chiến dịch→CV→PV/Offer («Khi nào có người?») |
| 5 | image5 | Kho CV: ưu tiên nội bộ; Junior→Mid theo thời gian; lịch sử trạng thái; mail template |
| 6 | image6 | Vòng public vs **chỉ C&B**; quà Ngày trẻ em theo tuổi con |
| 7 | image7 | Checklist giấy tờ động + OCR; tài sản + ký số; thu hồi khi offboard |
| 8 | image8 | Chấm công theo rule ca (App/IP/GPS/máy; làm tròn; phạt muộn) |
| 9 | image9 | Hệ sinh thái phép (accrual, loại phép, ốm BHXH vs công ty 100%, trừ công ngày làm T6–T2) |
| 10 | image10 | Phễu bảng công — nút thắt / SoT trước lương |
| 11 | image11 | Payroll formula engine (HR kéo-thả; không hardcode) |
| 12 | image12 | Gộp giữa tháng; không trừ thuế/BH trùng |
| 13 | image13 | Lifecycle Offer→HS→Active→phép/ca→lương; nghỉ việc→cắt BH + tất toán phép |
| 14 | image14 | Plan: WBS → UC map → API gateway boundaries — **approve paper trước code** |

---

## 4. Roadmap gói khách (W0→W6)

| Wave | Owner | Output | Gate |
|------|-------|--------|------|
| **W0** | PM | Program + media extract | DONE khi file này + media 14 ảnh |
| **W1** | ba-docs + ba-process + ba-data + sa | WBS · UC inventory · UC/BR depth · Data ownership · ADR API boundary | PASS_TO_PM |
| **W2** | Sponsor + PM | Khách review WBS/UC | CONFIRM hoặc delta |
| **W3** | ba-docs | SRS 6 chương đầy FR | Sponsor CONFIRM SRS |
| **W4** | sa + ba-data | TechSpec + DB_DESIGN + API_DESIGN | Sponsor CONFIRM |
| **W5** | qc | Audit docs khách (no_prompt_echo, depth) | GO docs |
| **W6** | Dev (sau confirm) | Implement theo slice — **chưa mở** | — |

---

## 5. Deliverable paths (khách)

```
docs/client-delivery/hrm-enterprise-blueprint/
  WBS_HRM_ENTERPRISE.md
  UC_INVENTORY.md
  UC_BR_MATRIX_DEPTH.md
  DATA_OWNERSHIP_MATRIX.md
  ADR-HRM-4-PILLAR-API-BOUNDARY.md
  API_BOUNDARY_MAP.md
  TECHSPEC_OUTLINE_HRM_ENTERPRISE.md
  SRS_HRM_ENTERPRISE.md
  TECHSPEC_HRM_ENTERPRISE.md          # sau confirm SRS
  DB_DESIGN_HRM_ENTERPRISE.md         # sau confirm TechSpec outline
  API_DESIGN_HRM_ENTERPRISE.md        # sau confirm
```

---

## 6. Dispatch wave W1 (đang chạy)

| work_item_id | Role | Evidence target |
|--------------|------|-----------------|
| `PO-HRM-BP-WBS-SRS-01` | ba-docs | WBS + UC_INVENTORY + SRS skeleton/FR ưu tiên |
| `PO-HRM-BP-UC-BR-DEPTH-01` | ba-process | UC_BR_MATRIX_DEPTH.md |
| `PO-HRM-BP-ARCH-API-BOUNDARY-01` | sa | ADR + API_BOUNDARY_MAP + TECHSPEC_OUTLINE |
| `PO-HRM-BP-DATA-OWNERSHIP-01` | ba-data | DATA_OWNERSHIP_MATRIX.md |

### Câu hỏi quản trị cần khách chốt (seed — BA bổ sung)

1. Định biên: trong ĐB đã duyệt vs ngoài ĐB — ai bypass BOD? (`REQ_REC_001` / Q-REC-HEADCOUNT)
2. Phép xuyên T7–CN + lễ: trừ ngày làm việc (`REQ_NP_006`) — xác nhận đơn vị nửa ngày / 1 giờ
3. Split-month / merge salary: giảm trừ chỉ 1 lần (`REQ_L_004`) — mốc kỳ lương?
4. OCR CV / pool kỹ năng: bắt buộc trước tạo UV? (`REQ_REC_002`)
5. **Q-PAY-FORMULA:** Excel = IT cấu hình DB · PPT = HR kéo-thả — chốt dual-control?
6. Xbot cấu hình hồ sơ (`REQ_HR_001`) = XBOS metadata hay hệ riêng?
7. Module Tài sản tham chiếu (`HR-006`) — scope Phase?

Chi tiết Decision backlog: `PARTNER_REQ_CATALOG_20260804.md` §5.

---

## 7. Liên hệ AS-IS (tham chiếu — không đè)

- Portal HRM hiện có menu Attendance / Leave / Recruit / Payroll — fidelity U87 đang chạy **riêng** (không claim = blueprint DONE).
- `docs/hrm/SRS.md` = baseline nội bộ; gói khách blueprint = SoT mới sau confirm.

---

## 8. Exit criteria chương trình (docs)

- [ ] WBS 4 module đủ task→UC→BR tóm tắt
- [ ] UC inventory khóa ID
- [ ] Depth matrix edge-case (phép / split-month / timesheet SoT / lifecycle)
- [ ] Data ownership + API boundary ADR
- [ ] SRS 6 chương gửi khách
- [ ] Sau confirm: TechSpec + DB_DESIGN + API_DESIGN
- [ ] QC docs GO
- [ ] **Chưa** `uat_done` / Phase1 DONE từ wave này
)
