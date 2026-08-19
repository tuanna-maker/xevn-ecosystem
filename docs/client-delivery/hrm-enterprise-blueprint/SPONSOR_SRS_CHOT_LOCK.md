# Khóa SRS giấy — HRM Enterprise (1 trang)

| Mục | Nội dung |
|-----|----------|
| **Ngày chốt** | 05/08/2026 |
| **SRS** | `SRS_HRM_ENTERPRISE.md` **v0.8** · PDF `SRS_HRM_ENTERPRISE_KHACH.pdf` (**85** trang · pypdf) |
| **Nguồn** | `SPONSOR_CHOT_FILL.xlsx` + `SPONSOR_CHOT_REMAINING.xlsx` (REMAINING thắng khi lệch) |
| **QC giấy** | **GO WITH CONDITIONS** — `po-hrm-bp-srs-chot-qc-spot-01.md` · stale Q-PAY **CLOSED** |
| **ready_for_techspec_docs** | **true** (paper-only) |
| **ready_for_techspec** | **false** — TechSpec S3 / coding depth **HOLD** (product fidelity) |
| **Product GO** | **Không** — demo / giấy ≠ nghiệm thu vận hành |

## Đã khóa (MVP giấy)

- Bốn trụ REC · CORE · ATT · PAY trên giấy; **47** UC (thêm ATT-03d GPS · ATT-05b panel quỹ).
- **PAY:** 2 bước soạn→phát hành; **form GĐ1**; kéo-thả **GĐ2**; giờ công chỉ từ **bảng công chốt**.
- **Phép:** 5 loại tối thiểu; năm tài chính + accrual + đơn vị = **CRUD theo tenant** (cấm fix tháng FY).
- **Ký bảng công:** NV + QL trực tiếp + HR; workflow từ **XBOS**.
- **Face:** mobile-only MVP · **GPS điểm** IN · **panel quỹ** IN.
- Các UC sheet 03 đánh dấu EXPAND: đã viết đủ 7 mục FR.

## OUT / GĐ2

| Mã / chủ đề | Phạm vi |
|-------------|---------|
| UC-BP-REC-03 chiến dịch đa kênh | **OUT** |
| UC-BP-CORE-04 OCR | **OUT** (mở lại sau = GĐ2) |
| Thẻ QR NV (03e / S15–S16) | **OUT** / S15–S16 GĐ2 |
| UC-BP-ATT-03 đa nguồn | **GĐ2** |
| S71 gợi ý phương thức chấm | **OUT** |
| Kéo-thả công thức lương | **GĐ2** |

## Demo

R-DEMO-01: phạm vi demo = **toàn bộ UC cũ + mới trên giấy**.  
**Không** claim product LIVE / UAT PASS / READY_FOR_TECHSPEC chỉ vì đã demo.

## Residual (chưa flip TechSpec)

- Fidelity ATT/Employees **not CLOSED** · `uat_done: false`
- Product stub / LIVE parity còn mở trên matrix nội bộ
- PDF «đủ» — có thể bổ sung UC sau (R-PDF-01)
