# Sponsor intake — Tạo HĐLĐ (Excel X.E × AMIS × UX)

| Meta | Value |
|------|--------|
| **Date** | 2026-08-10 |
| **Sponsor** | User — ưu tiên **trước** wave program khác |
| **Trigger** | Màn tạo HĐ thiếu trường theo loại HĐ; UX khó hiểu; **bỏ** banner/chú thích honesty trên UI khách; **thiếu** thao tác gán điều khoản rõ ràng |
| **SoT Excel** | `docs/program/refs/2026.08.07-hop-dong-mau-X.E-templates-only.xlsx` · outline `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TEMPLATES-OUTLINE-01.md` |
| **SoT ma trận** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md` (8 `template_code` VP/LX × HĐTV/12T/24T/KXĐ + merge §5) |
| **AMIS** | `docs/qa/evidence/po-hrm-amis-parity-ba-01.md` — CTR clause library + layout DnD **OK** principle; product **≠** customer-ready |
| **Cấm** | Claim `contracts_printable_ready=true` / module CTR UAT trước QC sponsor |
| **U65** | Nghiệm thu sau redesign = luồng FE đầy đủ, zero-seed |

## Sponsor requirements (lock)

1. **Đủ thông tin theo loại HĐ** — map từ Excel (Bên A/B, thời hạn, chức danh, địa điểm, lương/C&B read-only, GPLX block DRIVER, …) hiển thị **trên form tạo/sửa**, không ẩn sau pack chung chung.
2. **AMIS HRM parity (CTR)** — chọn mẫu → gán/thứ tự điều khoản → preview/in; không clone UI AMIS, nhưng **cùng nghiệp vụ**.
3. **Gán điều khoản vào HĐ** — thao tác rõ (kéo-thả hoặc tương đương AMIS) **trên luồng tạo HĐ**, không chỉ Cài đặt.
4. **Bỏ chú thích honesty/dev** trên màn user (`ContractPrintSpinePanel`, `Contracts.tsx` registry banner) — giữ flag nội bộ/QA nếu cần, **không** hiển thị paragraph dài cho HCNS.
5. **Thiết kế** — layout 2 bước hoặc master-detail: (1) Thông tin HĐ + mẫu `template_code` (2) Điều khoản + xem trước; grid 12 cột, tiếng Việt, không jargon UC.

## AS-IS gap (PM scan — không thay code)

| Kỳ vọng (SPEC/Excel) | Product hiện tại |
|----------------------|------------------|
| Picker 8+ `template_code` XEVN_* | Pack GENERAL/IT_OFFICE/DRIVER; template matrix **shallow** trên dialog |
| Merge fields §5 (VP vs DRIVER) | Một phần qua registry/C&B; **không** layout theo loại HĐ trên form |
| Clause DnD trên tạo HĐ | Có trong `ContractPrintSpinePanel` nhưng **lẫn** print spine + honesty; dễ **không thấy** / điều kiện `libraryReady` |
| AMIS «mẫu + điều khoản + preview» | Settings có DnD; **create dialog** chưa parity UX |

## Sponsor reference — AMIS HRM (2026-08-10 screenshot + bài giới thiệu)

**Tham chiếu:** [Quản lý hợp đồng trên AMIS HRM (MISA)](https://sme.misa.vn/1206/lam-viec-hieu-qua-hon-voi-phan-he-hop-dong-tren-misa-hrm-net-2010/) · màn **«Thêm hợp đồng hàng loạt»** (sponsor screenshot).

**Sponsor lock:** Bước 1 tạo HĐ **phải có cùng lớp thông tin** như AMIS «Thông tin chung», không thay bằng khối print-spine + chú thích kỹ thuật.

| Nhóm AMIS (screenshot) | Trường | XeVN TO-BE (BA-01) | AS-IS gap |
|------------------------|--------|-------------------|-----------|
| Thông tin chung | Số HĐ*, Tên HĐ, Thời hạn HĐ, Ngày hiệu lực*, Ngày ký*, Loại HĐ*, Hình thức làm việc, Ngày hết hạn* | Bước 1 grid 12 cột — **bổ sung** tên HĐ, ngày ký, hình thức LV, thời hạn preset, tỉ lệ hưởng lương | Chỉ mã HĐ + loại catalog + ngày; **thiếu** tên HĐ, ngày ký, hình thức, tỉ lệ % |
| Lương/BH | Lương cơ bản, Lương đóng BH, Tỉ lệ hưởng lương | Card C&B read-only (CORE-02) + format vi-VN | Không hiện rõ trên form tạo |
| Đại diện | Người đại diện công ty ký | Merge Bên A / picker đại diện pháp nhân | Thiếu trên form |
| Mô tả | Trích yếu, Ghi chú | Trích yếu + ghi chú sổ | Ghi chú có; trích yếu thiếu |
| Phụ cấp | **Các khoản phụ cấp** (+ Thêm) | Sub-grid phụ cấp snapshot từ C&B / catalog PC-KT (AMIS parity) | **Không có** section |
| Phụ lục | **Phụ lục hợp đồng** (collapsible) | Phase 2 / link «Sinh phụ lục» (AMIS article) — **không** chặn Bước 1 MVP | Không có |
| In/mẫu | AMIS: mẫu + trộn merge → in hàng loạt | Bước 2: template_code X.E + clause DnD + preview (Excel) | Lẫn vào dialog cuối + honesty |

**Giải thích sponsor («sao vẫn giữ màn cũ»):** Wave dev ưu tiên **print-spine / clause kỹ thuật (CORE-09 C-SLICE)** và seal QC **không** qua nghiệm thu form kiểu AMIS; parity BA ghi CTR «OK nguyên tắc» **chưa** bắt thay `Contracts.tsx`. **TO-BE** đã có trong `PO-HRM-CTR-CREATE-REDESIGN-BA-01.md` — **chưa implement**. Từ intake này: **IA = AMIS Thông tin chung + Bước 2 điều khoản/mẫu X.E**.

## Wave kế

`PO-HRM-CTR-CREATE-REDESIGN-SA-01` (IA + API bind) → `FE-01` / `BE-01` → QA J-HRM-CTR-* → QC GWC.
