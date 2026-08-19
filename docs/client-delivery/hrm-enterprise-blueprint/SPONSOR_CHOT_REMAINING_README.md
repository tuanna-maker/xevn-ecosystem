# Phiếu còn cần chốt — sau `SPONSOR_CHOT_FILL.xlsx`

| Mục | Nội dung |
|-----|----------|
| **File điền** | [`SPONSOR_CHOT_REMAINING.xlsx`](./SPONSOR_CHOT_REMAINING.xlsx) |
| **Đã đọc** | `SPONSOR_CHOT_FILL.xlsx` — **34/34** dòng (JSON nội bộ `_tmp-sponsor-chot-fill-read.json`) |
| **PDF luồng UC** | [`SPONSOR_UC_FLOW_CHOT.pdf`](./SPONSOR_UC_FLOW_CHOT.pdf) — mỗi UC mục đích · diễn biến · thành công (đọc trước sheet 03) |
| **PDF SRS đầy đủ** | [`SRS_HRM_ENTERPRISE_KHACH.pdf`](./SRS_HRM_ENTERPRISE_KHACH.pdf) — 6 chương + sơ đồ UC ưu tiên |

## Cách dùng

1. Mở **Excel** `SPONSOR_CHOT_REMAINING.xlsx` (không cần Cursor).  
2. Sheet **00** — xem lại những gì đã chốt (chỉ đọc).  
3. Sheet **01** — điền cột vàng (tháng năm tài chính, ứng phép, ốm, ký chốt, PROP, Face, demo ngày mai…).  
4. Sheet **02** — 18 surface sâu (IN MVP / GĐ2 / OUT / DEFER).  
5. Sheet **03** — UC còn «Lịch»: EXPAND / GĐ2 / OUT / WAIVER — **đọc trước** [`SPONSOR_UC_FLOW_CHOT.pdf`](./SPONSOR_UC_FLOW_CHOT.pdf) (mục lục 45 mã + Phần B khung Lịch).  
6. Save → báo PM.

## PDF

- **Gói luồng chốt (sheet 03):** `SPONSOR_UC_FLOW_CHOT.pdf` — cover hướng dẫn đọc Excel · 16 UC Ưu tiên đủ diễn biến · 29 UC Lịch khung «cần EXPAND». Build: `python _build_sponsor_uc_flow_pdf.py`.  
- **SRS khách đầy đủ:** `SRS_HRM_ENTERPRISE_KHACH.pdf` — 6 chương + sơ đồ sequence các UC ưu tiên.
