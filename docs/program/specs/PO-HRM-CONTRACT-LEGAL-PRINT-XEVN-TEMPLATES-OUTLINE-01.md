# Outline — bộ mẫu HĐ X.E (sponsor Excel 2026-08-07)

| Meta | Value |
|------|--------|
| **Work** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-01` (bonus wave — mở rộng template matrix) |
| **Source (sponsor)** | `C:\Users\ADMIN\Downloads\2026.08.07. Hợp đồng mẫu X.E.xlsx` |
| **Repo extract (templates only)** | `docs/program/refs/2026.08.07-hop-dong-mau-X.E-templates-only.xlsx` |
| **Parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-01` · UNICOM outline vẫn giữ |
| **Honesty** | `contracts_printable_ready=false` |
| **Matrix status** | **BA LOCKED** · SPEC `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md` · **SRS merge** FR-UC-BP-CORE-09d (Enterprise SRS v0.19) |
| **Cấm** | Paste full body HĐ / PII NV vào SRS khách · seed body bản quyền · claim printable UAT |

## Sponsor intent (2026-08-07)

Bonus thêm **các mẫu hợp đồng thực tế của X.E** (không chỉ khung UNICOM / pack `GENERAL`·`IT_OFFICE`·`DRIVER`):

- Theo **loại HĐ**: HĐ thử việc · HĐLĐ 12 tháng · HĐLĐ 24 tháng · HĐLĐ không xác định thời hạn  
- Theo **khối**: Văn phòng (VP) · Lái xe (LX)  
- Variant LX «nhiều công ty» / KXĐ trùng sheet — BA dedupe

## Template matrix (canonical — **BA LOCKED** 2026-08-07)

> SoT chi tiết: [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md) · evidence `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-01.md`

| `template_code` | Sheet nguồn | Loại HĐ | Pack | Ghi chú |
|-----------------|-------------|---------|------|---------|
| `XEVN_PROBATION_OFFICE` | HĐTV (Khối VP) | HĐTV | `IT_OFFICE` | Tiêu đề «HỢP ĐỒNG THỬ VIỆC» · default ~60 ngày |
| `XEVN_FT_12M_OFFICE` | HĐLĐ 12T (Khối VP) | HĐLĐ XĐTH 12T | `IT_OFFICE` | Số kiểu `…/HĐLĐ-X.E` · +12 tháng |
| `XEVN_FT_24M_OFFICE` | HĐLĐ 24T( Khối VP) | HĐLĐ XĐTH 24T | `IT_OFFICE` | Đơn vị Visun / Du lịch → suffix số HĐ |
| `XEVN_INDEF_OFFICE` | HĐLĐ KXĐTH | HĐLĐ KXĐTH | `IT_OFFICE` | Không bắt `effective_to` |
| `XEVN_PROBATION_DRIVER` | HĐTV (Khối LX) | HĐTV | `DRIVER` | **GPLX** · hạng · GTĐB |
| `XEVN_FT_12M_DRIVER` | HĐLĐ 12T (Khối LX) | HĐLĐ 12T | `DRIVER` | + thông báo hết hạn bằng lái |
| `XEVN_FT_24M_DRIVER` | HĐLĐ 24T ( Khối LX) | HĐLĐ 24T | `DRIVER` | |
| `XEVN_INDEF_DRIVER` | HĐLĐ KXĐTH (lx- nhiều công ty) | HĐLĐ KXĐTH | `DRIVER` | Canonical; **alias** `HĐKXĐ` / `HĐ KXĐ (Khối LX)` — không mã riêng |

### Sheets **không** đưa vào template SoT

| Sheet | Lý do |
|-------|--------|
| `Mã NV` | Master NV + PII — **không** copy vào repo; không seed |
| `Thẻ nghiệp vụ` · `Trang tính102/103` | Vận hành ký / danh sách — ngoài print-spine HĐ |
| `Bản sao của …` | Duplicate — bỏ |

## Section skeleton (chung mọi mẫu — structure only)

Khớp UNICOM + X.E Excel (không paste full Điều):

| # | Khối | OFFICE | DRIVER delta |
|---|------|--------|--------------|
| 0 | Quốc hiệu · số HĐ · đơn vị | ✓ | ✓ |
| 1 | Bên A / Bên B | ✓ | Bên B + **GPLX** (số, hạng, ngày/nơi cấp) |
| 2 | Điều 1 — loại HĐ · thời hạn · chức danh · địa điểm | Loại theo template_code | Chức danh lái xe |
| 3 | Điều 2 — chế độ LV | VP | + phương tiện đi lại; GTĐB |
| 4 | Điều 3 — NLĐ quyền/nghĩa vụ · BH · bí mật · bồi thường | ✓ | + chấp hành luật GTĐB / sử dụng phương tiện; báo sắp hết hạn bằng lái |
| 5 | Điều 4 — NSDLĐ | ✓ | ✓ |
| 6 | Chữ ký 2 bên | ✓ | ✓ |

## Mapping vs AS-IS product

| AS-IS (print-spine GĐ1) | Gap vs Excel X.E |
|-------------------------|------------------|
| Packs `GENERAL` · `IT_OFFICE` · `DRIVER` | Thiếu **ma trận loại HĐ × thời hạn** (HĐTV / 12T / 24T / KXĐ) như template riêng |
| `contract_type` catalog registry | Cần neo `template_code` → loại + pack + default duration |
| UNICOM outline | Giữ làm khung Đ.21; **X.E Excel = SoT nội dung mẫu DN** (structure + clause inventory) |

## BA / SA next (wave)

1. SPEC delta: inventory clause codes per `template_code` (ADD-only; không đè UF-HRM-02)  
2. TechSpec/DATA: `hrm_contract_template.template_code` enum + duration defaults  
3. Settings: 8 template rows (deduped) DnD clause packs  
4. QA U65: tạo HĐ theo từng template_code → preview/PDF khác nhau VP vs LX  
5. **Không** claim `contracts_printable_ready=true` cho đến QC GO đủ matrix

## PII / copyright

- Sheet `Mã NV` và dữ liệu điền mẫu trên sheet HĐ có PII — chỉ dùng để hiểu merge fields; **cấm** commit full workbook gốc.  
- Body Điều = tài sản DN — clause library Settings, không dán full vào docs khách.
