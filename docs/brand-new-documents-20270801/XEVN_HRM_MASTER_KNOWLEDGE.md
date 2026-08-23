# XEVN HRM — MASTER KNOWLEDGE FILE
## Tổng hợp từ tài liệu khách hàng + Phân tích HRM + Roadmap BRD

> **Gốc nguồn:** Tài liệu PDF/Excel từ `docs/từ khách hàng/Gửi P.CNTT`  
> **Cập nhật lần cuối:** 2026-08-21  
> **Mục đích:** Làm memory để viết BRD, thiết kế DB/BE/FE/Mobile  

---

## PHẦN 1 — DANH MỤC TÀI LIỆU ĐÃ ĐỌC

### 1.1 Cấu trúc thư mục tổng thể
```
docs/từ khách hàng/Gửi P.CNTT/
├── [FILE-ROOT-1] Lịch làm việc PVTHK.xlsx (ca làm việc Tổng đài)
│
├── 1. Điều phối hàng hóa/
│   ├── Chính sách lương ĐPHH/
│   │   ├── [G] 2022.04.01 Quy chế lương điều phối.pdf ✅ Đã đọc
│   │   ├── [H] 2024.04.22 Chính sách thưởng doanh thu giao hàng.pdf ✅ Đã đọc
│   │   ├── [I] 2024.10.03 Điều chỉnh tỷ lệ hoa hồng hàng gửi/nhận.pdf ✅ Đã đọc
│   │   ├── 2024.07.10 Điều chỉnh DT giao hàng.pdf
│   │   ├── 2025.02.18 Điều chỉnh lương thử việc ĐPHH.pdf
│   │   ├── 2025.04.04 Điều chỉnh TG làm việc VP Trần Đại Nghĩa.pdf
│   │   └── [J] 2025.08.22 Điều chỉnh lương ship ĐPHH.pdf ✅ Đã đọc
│   └── Dữ liệu đầu vào ĐPHH/
│       ├── DLL CPN tháng 6.26.xls (Dữ liệu chuyển phát nhanh)
│       └── 2025.07.30 Bảng lương BP ĐPHH.xlsx
│
├── 2. Bảng Tổng đài hành khách/
│   ├── Chính sách lương tổng đài hành khách/
│   │   ├── [6] 2024.06.19 Quy chế tính lương KPI tổng đài 1500.pdf ✅ Đã đọc
│   │   ├── 2025.09.18 Điều chỉnh lương thử việc tổng đài.pdf ✅ (ghi chú trong file 6)
│   │   └── 2025.11.28 QĐ 752 chi phụ cấp tổng đài.pdf ✅ (ghi chú trong file 6)
│   ├── Dữ liệu đầu vào lương tổng đài/
│   │   ├── BC tỷ lệ nhỡ T5.2026.xlsx (% cuộc nhỡ)
│   │   ├── KPI 1500 T5.2026.xlsx
│   │   ├── KPI 1731 T5.2026.xlsx (số tổng đài thứ 2)
│   │   ├── PCCV BPTĐ T5.2026.xlsx (phụ cấp chức vụ)
│   │   └── Đánh giá KPI TC T5.2026.xlsx
│   └── 2026.06.22 Bảng lương Tổng đài hành khách done.xlsx
│
├── 3. Bảng lương thời gian/
│   ├── Cơ chế lương VP HN/ (trống)
│   └── 2026.06.21 bảng lương văn phòng Hà Nội.done.xlsx
│
├── 4. Bảng lương lái xe tuyến/
│   ├── Cơ chế lương lái xe tuyến/
│   │   ├── [K] 2020.09.01 XEVN_Nam Định_Quy chế lương lái tuyến.pdf ✅ Đã đọc (gốc nghiệp vụ)
│   │   ├── 2020.09.01 XEVN_Ninh Bình_Quy chế lương lái tuyến.pdf
│   │   ├── 2020.10.01 X.EVN_Thái Bình_Quy chế lương lái tuyến.pdf
│   │   ├── 2023.08.28 Điều chỉnh lương HĐ khác tỉnh/ngoại giao.pdf
│   │   ├── 2023.10.01 Quy chế lương tuyến Phú Thọ.pdf
│   │   ├── 2025.09.05 Đề xuất đơn giá lượt Việt Trì, Phú Thọ.pdf
│   │   ├── [3] 2025.10.29 QĐ 439 điều chỉnh đơn giá lượt.pdf ✅ Đã đọc
│   │   ├── [N] 2025.11.28 QĐ 753 phụ cấp lái xe tăng cường.pdf ✅ Đã đọc
│   │   ├── [L] 2025.12.13 QĐ 816 chính sách lương LX tuyến mới.pdf ✅ Đã đọc
│   │   ├── 2025.12.23 QĐ 837 tuyến Nội Bài tính theo lượt.pdf
│   │   ├── 2025.12.30 LX điều chuyển sang Ninh Bình.pdf
│   │   ├── [4] 2026.03.26 QĐ 169 thưởng chuyên cần LX tuyến.pdf ✅ Đã đọc
│   │   └── Đề xuất chuyển đổi hình thức trả lương Yên Bái dài ngày.pdf
│   └── Dữ liệu đầu vào lái xe tuyến/
│       ├── 2026.07.29 BCC TCHN + LXDP T6.xlsx (chi phí sửa chữa chung)
│       ├── 2026.08.01 Dữ liệu lương LX tuyến T6.xlsx
│       ├── 2026.08.01 Tổng hợp DL lương VTHK T6.xlsx
│       ├── Chia CPSC tháng 6.xlsx (Chi phí sửa chữa, phân bổ)
│       ├── DLL CPN tháng 6.xlsx (Doanh thu CPN)
│       └── Điểm đánh giá CLDV LX T6.xlsx (Điểm chất lượng dịch vụ)
│
├── 5. Bảng lương lái xe tải/
│   ├── Chính sách lương lái xe tải/
│   │   ├── [5] 2026.04.01 QĐ 206 sửa đổi chính sách lương LX tải.pdf ✅ Đã đọc
│   │   └── 2026.04.01 Thông báo khoán nhiên liệu.pdf
│   └── Dữ liệu đầu vào lương lái xe tải/
│       ├── 2026.07.10 Phụ cấp đi đường LX tải T5.xlsx
│       ├── 2026.07.16 BCC lái xe T5.xlsx
│       ├── 2026.07.16 Doanh thu Lái Tải T5.xlsx
│       ├── Dữ liệu tạm ứng lương T05.xlsx
│       └── Phụ cấp XDTN VTHH T5.xlsx (Phụ cấp xây dựng thương hiệu)
│
├── 6. Bảng lương văn phòng tỉnh/
│   ├── Chính sách lương văn phòng tỉnh/
│   │   ├── [M] 2020.10.01 X.EVN_Nam Định_Quy chế lương văn phòng.pdf ✅ Đã đọc
│   │   ├── 2020.10.01 X.EVN_Ninh Bình_Quy chế lương văn phòng.pdf
│   │   └── 2020.10.01 XEVN_Thái Bình_Quy chế lương văn phòng.pdf
│   ├── Dữ liệu đầu vào VP tỉnh/
│   │   ├── Chi phí VP CN - Phú Thọ T05.xlsx
│   │   ├── Chi phí VP CN - Việt Trì T05.xlsx
│   │   ├── Chi phí VP CN - Yên Bái T05.xlsx
│   │   ├── Chi phí VP CN - Ninh Bình T05.xlsx (2 file)
│   │   ├── Chi phí VP CN - Nam Định T05.xlsx
│   │   └── File trừ lương tháng 5.xlsx
│   └── Bảng lương VP tỉnh T05.2026.xlsx × 6 tỉnh
│
└── Chính sách chung/
    ├── [1] 2026.01.02 QĐ 2A hệ thống thang lương, bảng lương.pdf ✅ Đã đọc
    └── [2] 2025.06.01 QĐ 127A Phụ lục Quy chế lương.pdf ✅ Đã đọc
```

---

## PHẦN 2 — NGHIỆP VỤ LƯƠNG THỰC TẾ (Extracted Knowledge)

### 2.1 Trục Ngạch-Bậc (Grade-Step) — Nền tảng của mọi chính sách

**Nguồn:** QĐ 2A/2026 — Hệ thống thang lương, bảng lương (hiệu lực 01/01/2026)

| Nhóm | Ngạch | Chức danh điển hình | Lương Bậc I | Lương Bậc cao nhất |
|------|-------|--------------------|-----------|--------------------|
| **Lãnh đạo** | D1 | Chủ tịch HĐTV | 13,100,000 | 26,000,000 (Bậc VI) |
| | D2 | Tổng GĐ | 11,100,000 | 21,400,000 (Bậc VI) |
| | D3 | Phó GĐ, GĐ Khối | 9,600,000 | 19,900,000 (Bậc VII) |
| **Chuyên gia** | C1 | Cố vấn chiến lược | 9,600,000 | 19,900,000 (Bậc VII) |
| | C2 | Chuyên gia cao cấp | 7,000,000 | 12,400,000 (Bậc VII) |
| **Quản lý** | M1 | Trưởng phòng | 8,300,000 | 17,100,000 (Bậc VIII) |
| | M2 | Phó phòng, Trưởng CN | 7,000,000 | 13,600,000 (Bậc VIII) |
| | L1 | Trưởng bộ phận, Thư ký BLĐ | 6,400,000 | 11,700,000 (Bậc VIII) |
| | L2 | Trưởng nhóm | 6,000,000 | 10,400,000 (Bậc VIII) |
| **Nhân viên** | E1 | Chuyên viên VP, Trưởng ca | 5,700,000 | 9,400,000 (Bậc IX) |
| | E2 | Lái xe, Tổng đài, Thợ, Tạp vụ | 5,310,000 | 7,850,000 (Bậc IX) |

> **Lưu ý thiết kế:** Ngạch-Bậc là "tọa độ" của nhân viên. Tất cả phụ cấp, thưởng KPI năm, tính BHXH đều THAM CHIẾU vào đây.

---

### 2.2 Phụ cấp Định mức theo Ngạch (Fixed Allowance)

**Nguồn:** QĐ 127A/2025 — Phụ lục 01 (hiệu lực 01/06/2025)  
Gồm: Điện thoại + Xăng xe + Trang phục + Đi lại + Nhà ở + Tiền ăn

| Vị trí | Mức 1 (HN) | Mức 2 (Tỉnh) |
|--------|-----------|-------------|
| Chủ tịch HĐTV | 30,050,000 | 21,350,000 |
| Tổng GĐ | 22,800,000 | 16,275,000 |
| Phó GĐ / GĐ Khối | 13,950,000 | 10,080,000 |
| Trưởng phòng / Trợ lý CT | 9,450,000 | 6,930,000 |
| Phó phòng / Trưởng CN | 6,750,000 | 4,720,000 |
| Trưởng bộ phận / Trợ lý GĐ | 5,750,000 | 3,870,000 |
| Trưởng nhóm / VPKD | 3,770,000 | 2,292,000 |
| Chuyên viên / LX Tuyến+Tải >3.5t | 2,900,000 | 2,160,000 |
| NV phục vụ (Tổng đài, LX ≤3.5t) | 900,000 | 670,000 |
| NV thừa hành (Lễ tân, Tạp vụ) | 250,000 | 150,000 |

---

### 2.3 Thưởng KPI % — Ngạch Văn phòng

**Nguồn:** QĐ 127A/2025 — Phụ lục 02

| Ngạch | Trần thưởng | Quy tắc vượt |
|-------|------------|-------------|
| D1/D2 | 35% | Vượt 100%: +1.5× tỷ lệ vượt |
| D3 | 32% | Tương tự |
| M1 | 28% | Tương tự |
| M2 | 25% | Tương tự |
| L1 | 22% | Tương tự |
| L2 | 20% | Tương tự |
| E1 | 18% | Tương tự |
| E2 (phục vụ) | 12% | Tương tự |
| E2 (thừa hành) | 8% | Tương tự |

> **Ghi chú:** LX tuyến, tổng đài, ĐPHH KHÔNG áp dụng KPI % này — họ có cơ chế riêng.

---

### 2.4 Lương Lái xe Tuyến (Trip-Based)

**Nguồn gốc:** Quy chế lương tuyến 2020 (Nam Định là mẫu gốc) + Điều chỉnh liên tục 2023–2026

**Công thức (Nam Định 2020):**
```
Tổng lương = Lương Lượt (I)
           + Lương CL phục vụ = Lương DT × Hệ số C (III)
           + Lương CPN 10% (IV)
           + Lương khăn, nước (V)
           + Lương hợp đồng (VI)
           - Chi phí sửa chữa chung (VII-GTC)
           - Giảm trừ tai nạn (VII-GTR)
```

**Đơn giá lượt theo tỉnh và thời điểm (tiered):**

| Tuyến | Gốc 2020 (1-100 lượt) | Sau QĐ 439/2025 (01/09/2025) | Lái mới (QĐ 816/2025) |
|-------|----------------------|------------------------------|----------------------|
| Nam Định | 45,000 / 55,000 | 65,000 / 70,000 | 125,000 |
| Ninh Bình | — | 55,000 / 65,000 | 140,000 |
| Thái Bình | — | 70,000 / 75,000 | 145,000 |
| Nội Bài | — | Theo lượt (QĐ 837) | — |
| Việt Trì / Phú Thọ / Yên Bái | Theo quy chế tỉnh | Chưa điều chỉnh | — |

**Lương chất lượng phục vụ (CLDV) — Hệ số C:**
- Điểm < 9.0 → C = điểm/10 (hưởng tỷ lệ)
- 9.0–9.4 → C = 100%
- 9.5–9.9 → C = 105%
- Điểm 10 → C = 110%

**Lương hợp đồng:**
- Khác tỉnh 1 ngày: 400,000 + 4% DT
- Khác tỉnh ≥2 ngày: 500,000/ngày + 4% DT
- Ngoại giao lãnh đạo: 600,000/ngày
- Nội Bài 1 lượt: 100,000 + 4% DT; 2 chiều: 200,000; cả ngày: 400,000

**Thưởng chuyên cần (QĐ 169/2026):**
- Điều kiện: ≥24 ngày công + không nghỉ T6, T7, CN
- Mức: 1,000,000 đ/tháng

**Phụ cấp lái xe tăng cường (QĐ 753/2025):**
- Lái xe điều động hỗ trợ tỉnh khác: +20,000 đ/lượt

---

### 2.5 Lương Lái xe Tải (Km + Revenue)

**Nguồn:** QĐ 206/2026 (hiệu lực 01/04/2026)

**Phân loại lái xe tải:**

| Loại | Công thức thu nhập |
|------|-------------------|
| Lái chính dự án | Lương cứng + TN QLPT + Thưởng DT |
| Lái phụ dự án | Lương cứng + TN QLPT + Thưởng DT (chia thỏa thuận 70/30) |
| Lái tuyến/Express | Lương cứng + KPI + Thưởng DT 1.5% + Hỗ trợ bốc xếp |
| Lái trung chuyển Logistic | Lương cứng + TN QLPT + Hỗ trợ bốc xếp khoán 4.4tr |

**Lương cứng theo loại xe:**
- Xe 1-2t: 7,500,000
- Xe 3.5-4.5t: 8,000,000
- Xe 5-6.5t: 8,500,000
- Đầu kéo: 11,500,000–12,500,000

**Thưởng doanh thu (tiered cho lái chính):**
- DT ≤ Mức 1: 6% DT
- Mức 1 < DT ≤ Mức 2: 8% DT
- DT > Mức 2: 8%×Mức2 + 10%×(DT-Mức2)

**Phạt vi phạm (Điểm CLHĐ):**
- 1 điểm CLHĐ = 100,000 đ
- Vệ sinh không đạt: -5 điểm/lần
- Xước >5cm: -10 điểm/lần
- Hỏng hóc nặng: trừ toàn bộ TN QLPT

---

### 2.6 Lương Điều phối Hàng hóa (Commission Pool + Hoa hồng)

**Nguồn:** Quy chế lương ĐPHH 2022 + Điều chỉnh 2024-2025

**Công thức:**
```
Tổng lương = Lương KPI (pool)
           + Lương DT hàng gửi (hoa hồng tiered × đơn giá giờ công)
           + Lương DT hàng nhận (hoa hồng × đơn giá giờ công)
           + Thưởng DT team vượt mốc
           + Thưởng giao hàng 25% (kiêm shipper)
           + Thưởng nỗ lực team (bậc thang)
           - Vi phạm và bồi thường
```

**Hoa hồng DT hàng gửi (sau QĐ 1031/2024, từ 10/2024):**
- < 150 triệu: 7.5%
- 150–200 triệu: 8.5%
- 200–300 triệu: 9.5%
- ≥300 triệu: 10.5%

**Hoa hồng DT hàng nhận:**
- < 300 triệu: 2%
- ≥300 triệu: 3%

**Thưởng DT team vượt mốc (Mốc 1/Mốc 2/Mốc 3 — triệu đồng):**

| VP | Mốc 1 | Mốc 2 | Mốc 3 |
|----|-------|-------|-------|
| Ngọc Hồi | 80 | 92 | 105 |
| Phố Vọng | 200 | 230 | 265 |
| Rạp Xiếc | 160 | 184 | 212 |
| Big C | 200 | 230 | 265 |
| Thọ Tháp | 100 | 115 | 132 |
| Ninh Bình | 160 | 184 | 212 |
| Nam Định | 180 | 207 | 238 |
| Thái Bình | 130 | 150 | 172 |

*Nếu VP vượt mốc 15%: thưởng 20% phần chênh vượt.*

**Thưởng giao hàng (shipper kiêm nhiệm):**
- HN: 25% DT giao cá nhân + Thưởng nỗ lực team (theo bảng bậc thang 0–16 triệu)
- Tỉnh: 70% tổng cước giao/nhận tận nơi (từ 09/2025)

**Lương KPI pool (quỹ):**
- HN: 4,000,000 đ/tháng
- Tỉnh: 3,000,000 đ/tháng
- Chia theo ngày công thực tế

---

### 2.7 Lương Tổng đài (Zero-Sum KPI Pool)

**Nguồn:** QĐ 196/2024 (hiệu lực 01/07/2024) + điều chỉnh 09/2025

**Công thức:**
```
Tổng lương = Lương cuộc nghe (pool chia theo số cuộc)
           + Lương hợp đồng (pool chia theo số HĐ)
           + Lương thời gian (pool chia theo giờ làm)
           + Thưởng Top (nếu CLDV ≥ 9.5)
           + Thưởng hạn chế gọi nhỡ (hệ số theo % nhỡ)
           + Phụ cấp ca đêm / ứng dụng
```

**Pool lương cơ sở:** 5,000,000 đ/tháng  
**Ngày công chuẩn:** Số ngày tháng – 4

**Định mức thưởng HĐ:** Ca sáng 600,000; Ca chiều 800,000  
**Định mức thưởng thời gian:** Ca sáng 700,000; Ca chiều 1,500,000

**Hệ số thưởng tỷ lệ nhỡ:**
- Nhỡ ≤2%: ×1.1
- Nhỡ ≤3%: ×1.0
- Nhỡ ≤5%: ×0.8
- Nhỡ ≤8%: ×0.5
- Nhỡ >8%: ×0 (không thưởng)

**Thưởng Top:**
- CLDV ≥9.5: ×1.05 KPI + thưởng Top 1,000,000 (hạng 1) / 500,000 (hạng 2-3)
- CLDV 9.0–9.5: ×1.0
- CLDV <9.0: ×(điểm/9)

**Lương thử việc (từ 01/09/2025):**
- Ca sáng: 6,000,000
- Ca chiều: 6,800,000

---

### 2.8 Lương Văn phòng Tỉnh (Revenue-based Pool)

**Nguồn:** Quy chế lương VP chi nhánh 2020 (Nam Định, Ninh Bình, Thái Bình)

**Đặc điểm: Lương phụ thuộc vào doanh số thực tế của chi nhánh**

**Công thức quỹ lương:**
```
A (Quỹ để chia) = B (Tổng quỹ) - C (Chi phí) - D (Lương thử việc)

B = (Số khách × Đơn giá/khách) + (Số xe × 800,000 đ/xe)

Đơn giá/khách: Nam Định 9,500đ; Ninh Bình 9,000đ; Thái Bình 9,500đ
(Hỗ trợ thêm 9,500đ trong 6 tháng đầu)
```

**Phân bổ lương theo hệ số vị trí (Zero-Sum):**

| Vị trí | Nam Định | Ninh Bình/Thái Bình |
|--------|---------|---------------------|
| Trưởng CN | 18 | 20 |
| Điều hành | 16 | 17 |
| LX trung chuyển | 15 | 16 |
| Kế toán | 11 | 12 |

*Giờ công: min 220h/tháng, max 290h/tháng*

---

### 2.9 Thưởng Chuyên cần (Multi-group Attendance Bonus)

| Nhóm | Quyết định | Điều kiện | Mức thưởng |
|------|-----------|-----------|-----------|
| LX Tuyến | QĐ 169/2026 | ≥24 ngày công, không nghỉ T6/T7/CN (áp dụng đến 31/05/2026) | 1,000,000/tháng |
| LX Tuyến tăng cường | QĐ 753/2025 | Điều động hỗ trợ tỉnh khác (đến 28/02/2026) | 20,000/lượt |
| LX Tuyến mới | QĐ 816/2025 | ≥24 ngày công, không nghỉ T6/T7/CN | 1,000,000/tháng |
| Tổng đài | QĐ 752/2025 | Dùng app X.E VIETNAM | 37,607đ/giờ (tạm thời) |

---

## PHẦN 3 — CÁC LOẠI CHÍNH SÁCH LƯƠNG (Policy Taxonomy)

XeVN có đúng **9 loại chính sách lương** cần hệ thống hóa:

| # | Policy Type | `component_type` | Nhóm áp dụng | Input đầu vào |
|---|-------------|-----------------|-------------|---------------|
| 1 | Lương cơ bản Ngạch-Bậc | `grade_base` | Tất cả | Ngạch, Bậc, Ngày công |
| 2 | Phụ cấp định mức theo Ngạch | `grade_allowance` | Tất cả | Ngạch, Địa điểm (HN/Tỉnh) |
| 3 | Thưởng KPI % tổng thu nhập | `kpi_bonus_pct` | VP, Quản lý | Điểm KPI, Tổng TN |
| 4 | Lương theo Lượt (tiered) | `trip_rate_tiered` | LX Tuyến | Số lượt, Tuyến, Tỉnh |
| 5 | Lương DT × Hệ số CLDV | `revenue_x_quality` | LX Tuyến | Doanh thu cá nhân, Điểm CLDV |
| 6 | Lương CPN % DT | `cpn_commission` | LX Tuyến | DT chuyển phát nhanh |
| 7 | Lương cứng + KPI + DT tiered | `fixed_kpi_revenue` | LX Tải | Loại xe, Ngày công, DT |
| 8 | Hoa hồng DT tiered (pool chia đơn giá giờ) | `revenue_commission_pool` | ĐPHH | DT hàng gửi/nhận, Giờ công |
| 9 | Pool Zero-Sum (chia theo đóng góp) | `zero_sum_pool` | Tổng đài, VP Tỉnh | Số cuộc, HĐ, Giờ, % nhỡ |
| 10 | Thưởng chuyên cần (điều kiện đặc thù) | `attendance_bonus_conditional` | Đa nhóm | Ngày công, Ca, Điều kiện |

---

## PHẦN 4 — SO SÁNH HRM VÀ GAP ANALYSIS

### 4.1 Ma trận so sánh tổng thể

| Module | Base E-Hiring | AMIS HRM | VnResource | Odoo | XeVN (hiện tại) | Gap |
|--------|:------------:|:--------:|:----------:|:----:|:---------------:|-----|
| **Tuyển dụng Pipeline** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Cần Automation Trigger |
| **Ngạch-Bậc lương** | ❌ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ | **THIẾU HOÀN TOÀN** |
| **Phụ cấp định mức** | ❌ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ | **THIẾU HOÀN TOÀN** |
| **KPI % thưởng** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ❌ | Chưa có module KPI |
| **Lương theo Lượt** | ❌ | ❌ | ⭐ | ⭐⭐ | ❌ | **UNIQUE — chưa ai làm** |
| **Lương DT × CLDV** | ❌ | ❌ | ❌ | ⭐ | ❌ | **UNIQUE** |
| **Hoa hồng tiered** | ❌ | ❌ | ⭐ | ⭐⭐ | ❌ | **UNIQUE** |
| **Pool Zero-Sum** | ❌ | ❌ | ❌ | ❌ | ❌ | **UNIQUE — không ai làm** |
| **Thưởng chuyên cần** | ⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐ | ❌ | Cần thêm |
| **Nghỉ phép (tích lũy)** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ | Gap lớn |
| **Bảo hiểm tự động** | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ (si_base) | Gap lớn |
| **Mobile App** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ (spec sẵn) | Đang build |
| **Multi-OU** | ⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Điểm mạnh XeVN** |
| **Dynamic Config** | ❌ | ⭐ | ❌ | ⭐⭐ | ⭐⭐⭐⭐⭐ | **Điểm mạnh XeVN** |
| **Formula Engine** | ❌ | ⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Mạnh, cần thêm input types |

---

## PHẦN 5 — ROADMAP VÀ ĐỀ XUẤT BRD

### 5.1 Kiến trúc "Policy Engine" đề xuất

```
employee
  └── pay_policy (1 chính sách lương tổng, gắn theo pay_group)
        └── income_component[] (các thành phần thu nhập)
              ├── component_type (xem bảng ở Phần 3)
              ├── effective_from / effective_to (versioning)
              ├── input_source (manual | import_excel | xbos_api | gps)
              ├── apply_to_pay_group (không hardcode company)
              └── params (cấu hình riêng theo type: rate, tier_table, pool_key...)
```

### 5.2 Thứ tự ưu tiên (Priority Order)

**P0 — Bắt buộc để production (Q4/2026):**
1. `grade_base` + `grade_allowance` — Ngạch Bậc + Phụ cấp (nền tảng của mọi thứ)
2. Nghỉ phép tích lũy (tối thiểu theo Luật LĐ VN)
3. Bảo hiểm auto-calculate (BHXH/BHYT/BHTN)
4. Mobile App hoàn thiện (UC-M01 đến M05)

**P1 — Cạnh tranh được (Q1/2027):**
5. `trip_rate_tiered` — Lương lượt LX Tuyến
6. `fixed_kpi_revenue` — Lương LX Tải
7. `kpi_bonus_pct` — Thưởng KPI VP/Quản lý
8. `attendance_bonus_conditional` — Thưởng chuyên cần

**P2 — Lợi thế cạnh tranh (Q2/2027):**
9. `revenue_commission_pool` — ĐPHH hoa hồng
10. `zero_sum_pool` — Tổng đài + VP Tỉnh
11. Thuế TNCN tự động
12. Policy versioning (effective_from/to)

### 5.3 Nguyên tắc thiết kế để bán cho Enterprise khác

1. **Không hardcode domain vận tải** — `component_type` là dynamic catalog
2. **Versioning bắt buộc** — mọi policy có `effective_from`
3. **Input source tách biệt** — không ép HR nhập tay, có thể import Excel hoặc nhận từ API
4. **Multi-tenant isolation** — mọi bảng có `company_id`
5. **Graceful fallback** — nếu không có policy đặc thù → về lương cơ bản Ngạch-Bậc

---

## PHẦN 6 — GHI CHÚ ĐỂ VIẾT BRD

### Các điểm đặc thù XeVN cần nêu trong BRD:

1. **Lương lượt thay đổi theo tỉnh và thời gian:** Cùng 1 tuyến, đơn giá lượt có thể khác nhau theo quyết định điều chỉnh. Cần versioning chính sách.

2. **Lái xe mới nhận việc:** Áp dụng mức đặc thù (VD: 125,000-145,000đ/lượt thay vì tier thông thường) — đây là một loại policy override theo điều kiện thử việc.

3. **Lái xe điều chuyển tỉnh:** Hưởng đơn giá tỉnh đang hỗ trợ + phụ cấp 20,000đ/lượt — cần policy gắn theo "hành trình thực" không phải "quê nhà".

4. **VP tỉnh — quỹ phụ thuộc doanh số:** Không có mức lương cố định — lương biến động theo số khách thực tế của chi nhánh. Cần cấu hình "doanh thu nguồn" gắn với hệ thống đặt vé/booking (XBOS).

5. **Tổng đài có 2 số:** 1500 và 1731 — mỗi số có KPI pool riêng, cần tách biệt.

6. **Lái xe tải — CLHĐ điểm phạt:** Cần module "điểm vi phạm" tích hợp với bộ phận kỹ thuật (khai báo sự cố xe).

7. **Thưởng nhóm** (team bonus) tại ĐPHH: Cần aggregate dữ liệu cấp văn phòng/bưu cục, không phải cấp cá nhân.
