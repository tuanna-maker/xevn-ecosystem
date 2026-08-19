# WBS chốt họp theo UC — hướng dẫn sponsor

| Mục | Nội dung |
|-----|----------|
| File Excel chốt UC | [`WBS_HRM_ENTERPRISE_UC_CHOT.xlsx`](./WBS_HRM_ENTERPRISE_UC_CHOT.xlsx) **v1.1** |
| File Excel diễn biến sâu | [`WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx`](./WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx) |
| SRS / PDF | [`SRS_HRM_ENTERPRISE.md`](./SRS_HRM_ENTERPRISE.md) **v0.7** · [`SRS_HRM_ENTERPRISE_KHACH.pdf`](./SRS_HRM_ENTERPRISE_KHACH.pdf) |
| Mục đích | Chốt khung 45 tình huống + màn chấm công + khoảng trống còn mở với khách |
| Không dùng để | Khẳng định khách đã ký · mở đặc tả kỹ thuật · nghiệm thu phần mềm |

---

## Gói gửi chốt (thứ tự)

1. PDF SRS khách (v0.7) — đọc FR ưu tiên.  
2. `WBS_HRM_ENTERPRISE_UC_CHOT.xlsx` — ký theo UC + màn chấm công (#1–46) + sheet chức năng sâu (18) + khoảng trống.  
3. `WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx` — khi cần đi sâu từng bước diễn biến.  
4. File này + `README_SPONSOR_REVIEW.md` + `COVER_GUI_KHACH.md`.

---

## Cách chạy họp chốt (60–90 phút)

1. **Sheet `01_Danh_muc_UC`** — lọc khối Tuyển → Nhân sự → Chấm công & phép → Tiền lương; ưu tiên «Ưu tiên gửi chốt»; điền cột ký.  
2. **Sheet `02_Man_cham_cong`** — ATT-FID#1–46 + cột trạng thái trình duyệt; dòng đỏ/cam = đang phát triển / giai đoạn 2 / còn khoảng trống.  
3. **Sheet `02b_Man_thieu_sau`** — 18 chức năng sâu (GPS vùng · thẻ QR · quỹ phép · xóa bảng…) + trung thực nhãn nghỉ; chốt Có / Không / GĐ2.  
4. **Sheet `03_Tom_tat_khoang_trong`** — G-01…G-19; ưu tiên G-13 (cách lắp công thức — **không** mang nghĩa «chưa họp lương»), G-06 (5 loại phép), G-16 (xác nhận giấy trước khi code), G-18 (sheet 02b).  
5. Sau họp: cập nhật SRS theo cột ký — **không** mở đặc tả kỹ thuật đến khi khung được xác nhận (tạm dừng code/demo).

---

## Mục lục SRS đối chiếu

| Phần | Nội dung chốt |
|------|----------------|
| §1–§2 | Bốn trụ đã họp · campaign GĐ2 · bảng công → lương |
| §3 — 16 FR đủ 7 mục | REC-01/01b/02/02b/08 · CORE-01/02/08 · ATT-02/08/09/10/11 · PAY-01/02/04 |
| §3 — UC khung / lịch | REC-00 · REC-03 GĐ2 · ATT loại phép · PAY phiếu/tất toán… |
| §4–§6 | Phi chức năng · giao diện ngoài · ràng buộc |

---

## Nguồn bản 1.1

| Nguồn | Vai trò |
|-------|---------|
| Tổng hợp quyết định họp | D1–D8 · R/C/A/P |
| `UC_INVENTORY.md` 0.3.3 | 45 mã UC |
| `UC_MEETING_PRODUCT_GAP_MATRIX.md` v1.1 | Khoảng trống họp × giấy × màn · §6.1 18 MISSING |
| 46 màn chấm công (fidelity) | Sheet 02 — + cột trình duyệt ATT-DEEP-QA |
| Inventory sâu ATT (18) | Sheet 02b — GPS · QR card · quỹ phép · xóa bảng… |
| ATT-DEEP-QA browser | LIVE / PARTIAL / STUB_UI / GĐ2-HOLD trên sheet 02 |

Tái tạo:

```text
python _build_wbs_uc_chot.py
python _build_wbs_excel.py
# PDF: chỉ build_pdf_from_srs() nếu SRS đổi — không chạy main() có patch_srs
```
