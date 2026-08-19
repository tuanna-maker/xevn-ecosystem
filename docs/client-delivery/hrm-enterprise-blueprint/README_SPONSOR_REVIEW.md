# Gói review khách — HRM Enterprise Blueprint (v0.7)

Ngày: 2026-08-05 · Trạng thái: **READY gửi chốt logic trên giấy** · Chưa triển khai phần mềm · **Chưa** claim khách đã ký / đã chốt SRS · Gap matrix **chưa sẵn sàng** đặc tả kỹ thuật sâu

**Thư gửi kèm:** [COVER_GUI_KHACH.md](./COVER_GUI_KHACH.md)

## Lối vào họp chốt (ưu tiên — 2026-08-05)

| File | Việc |
|------|------|
| **[`W3_PAPER_PACKET_SPONSOR.md`](./W3_PAPER_PACKET_SPONSOR.md)** | **Entry workshop:** mục đích 1 trang · checklist đọc · map khoảng trống → ô điền · bảng 18 dòng / UC đề xuất / «Lịch» · điều kiện mở khóa |
| [`SPONSOR_CHOT_FILL_SHEET.md`](./SPONSOR_CHOT_FILL_SHEET.md) | **Phiếu điền chính** (D7 · Q-* · MD-S* · PROP · LICH) — một phiếu, không phiếu song song |
| [`DECISION_PACKET_Q_PAY_FORMULA.md`](./DECISION_PACKET_Q_PAY_FORMULA.md) | Cách lắp công thức lương (đã họp trụ lương — chỉ còn authoring) |
| [`WBS_HRM_ENTERPRISE_UC_CHOT.xlsx`](./WBS_HRM_ENTERPRISE_UC_CHOT.xlsx) sheet **02b** | 18 chức năng sâu — ký IN / GĐ2 / OUT |

## Nguồn tổng hợp (nội bộ)

Gói đồng bộ từ họp review: **mindmap B-Minutes** + **bản ghi HTML** + **WBS Excel** + **ma trận khoảng trống họp × sản phẩm** — chi tiết merge ở [`SYNTHESIS_MASTER_HRM_ENTERPRISE.md`](./SYNTHESIS_MASTER_HRM_ENTERPRISE.md). Tài liệu khách (PDF/Excel) **không** chép nguyên văn mindmap/HTML/ma trận nội bộ.

## Phạm vi khóa

| Chỉ số | Giá trị |
|--------|---------|
| Use case khóa | **45** (gồm JD master; chiến dịch = giai đoạn 2) |
| FR ưu tiên (đủ 7 mục) | **16** |
| UC bổ sung khung | **29** (gồm loại phép ATT; REC-03 = GĐ2) |
| Phiên bản SRS | **0.7** · Inventory **0.3.3** · WBS hạng mục **0.4** · WBS UC chốt **1.1** |
| Trụ tiền lương | **Đã họp xong** — còn chốt cách lắp công thức (không mang nghĩa «chưa họp lương») |

## Phiếu sponsor tự điền

| File | Việc của sponsor |
|------|------------------|
| **[SPONSOR_CHOT_FILL.xlsx](./SPONSOR_CHOT_FILL.xlsx)** | **Điền cột vàng G–I** (mở bằng Excel) — D7 · Q-* · master data · UI |
| hoặc sheet `00_Chot_Sponsor` trong [WBS_HRM_ENTERPRISE_UC_CHOT.xlsx](./WBS_HRM_ENTERPRISE_UC_CHOT.xlsx) | Cùng nội dung; **không** điền vào `KHACH_MOI` |
| [SPONSOR_CHOT_FILL_SHEET.md](./SPONSOR_CHOT_FILL_SHEET.md) | Chỉ hướng dẫn đường dẫn (không điền trên md) |
| [MASTER_DATA_CONFIG_CLASSIFICATION.md](./MASTER_DATA_CONFIG_CLASSIFICATION.md) | REF/CFG/TXN (team) |
| [SPONSOR_UI_BRAND_OPEN_QUESTIONS.md](./SPONSOR_UI_BRAND_OPEN_QUESTIONS.md) | Tuỳ chọn — remaster UI / tư vấn ngoài |

## Đọc theo thứ tự (bản gửi chốt)

0. **[`W3_PAPER_PACKET_SPONSOR.md`](./W3_PAPER_PACKET_SPONSOR.md)** — bắt đầu workshop từ đây.  
1. **[SRS_HRM_ENTERPRISE_KHACH.pdf](./SRS_HRM_ENTERPRISE_KHACH.pdf)** — PDF gửi khách: 6 chương · **45** tình huống · **16** sơ đồ sequence · tiếng Việt.  
2. **[WBS_HRM_ENTERPRISE_UC_CHOT.xlsx](./WBS_HRM_ENTERPRISE_UC_CHOT.xlsx)** — **ưu tiên họp chốt:** 45 UC + 46 màn chấm công (kể cả đang phát triển) + sheet **02b** (18) + khoảng trống G-*. Hướng dẫn: [WBS_UC_CHOT_README.md](./WBS_UC_CHOT_README.md).  
3. **[WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx](./WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx)** — Excel hạng mục (**28**) + diễn biến từng bước (`03b`). Fallback: `WBS_HRM_ENTERPRISE_KHACH.xlsx`.  
4. [SRS_HRM_ENTERPRISE.md](./SRS_HRM_ENTERPRISE.md) — markdown gốc v0.7  
5. [UC_INVENTORY.md](./UC_INVENTORY.md) — 45 UC · 16 FR ưu tiên  
6. [DECISION_PACKET_Q_PAY_FORMULA.md](./DECISION_PACKET_Q_PAY_FORMULA.md) — phiếu chốt cách lắp công thức lương  
7. [UC_BR_MATRIX_DEPTH.md](./UC_BR_MATRIX_DEPTH.md) · [PARTNER_REQ_CATALOG_20260804.md](./PARTNER_REQ_CATALOG_20260804.md)

*Sinh lại:* `python _build_wbs_uc_chot.py` · `python _build_wbs_excel.py` · `python _build_srs_pdf_khach.py` trong thư mục này.*

## HOLD đến khi chốt SRS trên giấy

Đặc tả kỹ thuật đầy đủ · thiết kế dữ liệu vật lý · hợp đồng tích hợp chi tiết · mã nguồn sản phẩm theo blueprint. **Tạm dừng code/demo** đến khi xác nhận tài liệu. Điều kiện xét mở đặc tả sâu: gói workshop §6 — **không** claim sẵn.

## Quyết định cần chữ ký sớm

- Q-PAY-FORMULA (cách lắp công thức — **không** = «chưa họp lương»)  
- Q-REC-HEADCOUNT · Q-LEAVE-UNIT · Q-LEAVE-ACCRUAL · Q-SI-SUSPEND · Q-ASSET-MODULE · Q-XBOT-PROFILE  
- Sheet 02b (18) · PROP-03d / 03e / 05b · chính sách UC «Lịch» (LICH-ATT tối thiểu)  
