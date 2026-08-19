# DOC-ENT-HRM-MMAP-BRD-01 — team note (nội bộ)

| Meta | Value |
|------|--------|
| **work_item_id** | `DOC-ENT-HRM-MMAP-BRD-01` |
| **role** | ba-docs |
| **date** | 2026-08-10 |
| **customer artifacts** | `docs/client-delivery/hrm/BRD_HRM_KHACH.md` §10 (v3.1) · `docs/brand-new-documents-20270801/BRD_HRM_CAPABILITY_MINDMAP_SLICE.md` |
| **sources** | `BA-MINDMAP-GAP-DELTA-01.md` · `doc-ent-hrm-mmap-01.md` |

## Bucket mapping (27 lá → 3 cột BRD khách)

| gap_id | Lá | Bucket BRD khách | repo status (delta) |
|--------|-----|------------------|---------------------|
| MM-GAP-01 | Yêu cầu TD | Đang triển khai GĐ1 | implemented |
| MM-GAP-02 | Pipeline & CV | Hoàn thiện GĐ1 | planned |
| MM-GAP-03 | Lịch PV | Hoàn thiện GĐ1 | planned |
| MM-GAP-04 | Offer & Onboarding | Hoàn thiện GĐ1 (GĐ2: offer/onboard đầy đủ) | planned |
| MM-GAP-05 | Sơ đồ tổ chức | Hoàn thiện GĐ1 | planned |
| MM-GAP-06 | Hồ sơ master | Đang triển khai GĐ1 | implemented |
| MM-GAP-07 | Hợp đồng | Đang triển khai GĐ1 | implemented |
| MM-GAP-08 | GPS/FaceID | Đang triển khai GĐ1 (GPS) · Mong muốn GĐ2 (FaceID) | implemented / MISSING |
| MM-GAP-09 | Phân ca | Hoàn thiện GĐ1 | planned |
| MM-GAP-10 | Giải trình & chốt | Đang triển khai GĐ1 | implemented |
| MM-GAP-11 | Quỹ phép | Hoàn thiện GĐ1 | planned |
| MM-GAP-12 | Nộp & duyệt phép | Đang triển khai GĐ1 | implemented |
| MM-GAP-13 | OT đăng ký | Mong muốn GĐ2 | MISSING |
| MM-GAP-14 | Hệ số OT | Mong muốn GĐ2 | MISSING |
| MM-GAP-15 | Kế hoạch khóa | Mong muốn GĐ2 | MISSING |
| MM-GAP-16 | Khảo sát ĐT | Mong muốn GĐ2 | MISSING |
| MM-GAP-17 | Gán KPI | Hoàn thiện GĐ1 | planned |
| MM-GAP-18 | Tiến độ KPI/OKR | Hoàn thiện GĐ1 (OKR liên tục → GĐ2) | planned |
| MM-GAP-19 | Tạo đợt review | Đang triển khai GĐ1 | implemented |
| MM-GAP-20 | 360 / Self | Hoàn thiện GĐ1 (360 → GĐ2) | planned |
| MM-GAP-21 | Điều chuyển | Hoàn thiện GĐ1 | planned |
| MM-GAP-22 | Timeline | Hoàn thiện GĐ1 | planned |
| MM-GAP-23 | KT quyết định | Hoàn thiện GĐ1 | planned |
| MM-GAP-24 | Vi phạm log | Hoàn thiện GĐ1 (log chuyên → GĐ2) | planned |
| MM-GAP-25 | Công thức lương | Hoàn thiện GĐ1 | planned |
| MM-GAP-26 | Tính & PD lương | Đang triển khai GĐ1 | implemented |
| MM-GAP-27 | Payslip mật | Đang triển khai GĐ1 | implemented |

## P0-MAP guards (không đưa vào body khách)

- Pipeline 13-step dynamic, OT module GĐ1, FaceID GĐ1, formula builder GĐ1, 360 đầy đủ GĐ1 — giữ trong delta BA; Dev đọc `BA-MINDMAP-GAP-DELTA-01.md`.

## Sponsor open (Q1–Q5)

Chưa chốt — BRD khách giữ OT/ĐT/GĐ2 an toàn. SRS delta: `DOC-ENT-HRM-MMAP-SRS-01` sau PM + sponsor.

## HTML / build

- BRD HRM khách chưa có script build riêng trong PROJECT_PROFILE (ecosystem BRD = `docs:brd:html` từ `BRD_TONG_HOP`).
- PM có thể: (a) merge §10 vào pipeline BRD tổng khi rebuild, hoặc (b) ship slice MD/PDF phụ lục.

*DOC-ENT-HRM-MMAP-BRD-01 — ba-docs — 2026-08-10*
