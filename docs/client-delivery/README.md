# Bộ tài liệu gửi khách — XeVN Ecosystem

| Tệp | Định dạng | Mô tả |
|-----|-----------|--------|
| `00_Mo_ta_he_sinh_thai_XEVN.md` | Markdown | Trỏ tới bản đầy đủ trong `docs/ecosystem/` |
| `00_Mo_ta_he_sinh_thai_XEVN.html` | HTML | Mô tả hệ sinh thái — bìa + logo XeVN, mở bằng trình duyệt |
| `01_Tai_lieu_thiet_ke_he_thong_XEVN_HRM_MOBILE.md` | Markdown | BRD — yêu cầu hệ thống HRM Mobile |
| `01_Tai_lieu_thiet_ke_he_thong_XEVN_HRM_MOBILE.html` | HTML | Cùng nội dung BRD, có bìa + logo, mở bằng trình duyệt |
| `02_Tai_lieu_nghiep_vu_XEVN_HRM_MOBILE.md` | Markdown | SRS — đặc tả phần mềm |
| `02_Tai_lieu_nghiep_vu_XEVN_HRM_MOBILE.html` | HTML | Cùng nội dung SRS |
| `assets/xevn-logo.png` | Ảnh | Logo XeVN (bìa HTML) — sync từ `assets/brand/xevn-logo-master.png` |
| `01_BRD_XeVN_OS.html` | HTML | BRD Tổng hợp hệ sinh thái |
| `02_SRS_XeVN_OS.html` | HTML | SRS toàn hệ (373 FR) |
| `hrm/BRD_HRM_KHACH.md` | Markdown | **BRD phân hệ Nhân sự (bản khách)** — Yêu cầu-N + Quy tắc |
| `hrm/SRS_HRM_KHACH.md` | Markdown | **SRS phân hệ Nhân sự (bản khách 3.1-W2e)** — Bateco Ch.1–6 + spine FR + dual-doc |
| `hrm/SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md` | Markdown | **Bổ sung W2e** — thân FR Cài đặt CRUD / picker / nhãn công ty / cầu nối nghỉ + inventory leftover |
| `03_Thuong_mai_XeVN_OS.pptx` | PowerPoint | Deck thương mại (~26 slide, theo BRD) |
| `03_DAN_Y_THUONG_MAI_XeVN_OS.md` | Markdown | Dàn ý slide + hướng dẫn tùy chỉnh |
| `03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` | Markdown | **HDSD pilot** — chuẩn bị môi trường, chạy thử, luồng nghiệp vụ, xử lý sự cố |
| `hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md` | Markdown | **HDSD leaf** — Danh sách nhân sự (list, hồ sơ, form, nhập/xuất, xóa mềm) |
| `hdsd/hrm/HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md` | Markdown | **HDSD leaf** — Tuyển dụng |
| `../client/PHASE1_UAT_DELIVERABLE_HANDOFF_20260605.md` | Markdown | **Bàn giao UAT GĐ1** — evidence paths, giới hạn trung thực (05/06/2026) |

**TechSpec nội bộ (sau SRS):** [`docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md`](../ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md) — thiết kế kỹ thuật chi tiết toàn hệ.

**Build PPTX thương mại:** `pnpm docs:commercial:pptx` (cần `pptxgenjs`).

**Mở HTML:** double-click file `.html` hoặc kéo vào Chrome/Edge. Đường dẫn ảnh tương đối — giữ nguyên thư mục `assets/`.

Tài khoản pilot (chi tiết email): [`docs/hrm/HUONG_DAN_DANG_NHAP_PILOT.md`](../hrm/HUONG_DAN_DANG_NHAP_PILOT.md). **Hướng dẫn chạy thử đầy đủ:** [`03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md`](./03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md).
