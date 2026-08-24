# XEVN — CATALOG CHÍNH SÁCH LƯƠNG (ĐẦY ĐỦ)
## Policy Configuration Catalog — Dùng để thiết kế Settings UI & Policy Engine

> **Nguồn:** Toàn bộ 30 file PDF + tài liệu thực tế  
> **Ngày hoàn thiện:** 2026-08-22  
> **Mục đích:** Input để code Settings/Policy Engine — không bỏ sót chính sách nào

---

## CẤU TRÚC 3 LỚP

```
NHÓM CHÍNH SÁCH (pay_group)
  └── CHÍNH SÁCH CỤ THỂ (pay_policy)
        └── THÀNH PHẦN THU NHẬP (income_component)
              └── THANG ĐIỂM/ĐIỀU KIỆN (params: JSONB)
```

---

## NHÓM 1: CHÍNH SÁCH CHUNG (Áp dụng mọi nhân viên)

### 1.1 Lương Cơ bản Ngạch-Bậc
**Nguồn:** QĐ 2A/2026/QĐ-X.E (hiệu lực 01/01/2026)  
**component_type:** `grade_base`

**Thang điểm/bảng giá trị:**

| Ngạch | Chức danh | Bậc I | Bậc II | Bậc III | Bậc IV | Bậc V | Bậc VI | Bậc VII | Bậc VIII | Bậc IX |
|-------|-----------|-------|--------|---------|--------|-------|--------|---------|----------|--------|
| D1 | Chủ tịch HĐTV | 13,100k | 15,200k | 17,300k | 19,400k | 22,700k | 26,000k | — | — | — |
| D2 | Tổng GĐ | 11,100k | 12,900k | 14,700k | 16,500k | 19,000k | 21,400k | — | — | — |
| D3 | Phó GĐ/GĐ Khối | 9,600k | 11,200k | 12,800k | 14,400k | 16,000k | 18,000k | 19,900k | — | — |
| C1 | Cố vấn CL | 9,600k | 11,200k | 12,800k | 14,400k | 16,000k | 18,000k | 19,900k | — | — |
| C2 | Chuyên gia CC | 7,000k | 8,200k | 9,400k | 10,300k | 11,200k | 11,800k | 12,400k | — | — |
| M1 | Trưởng phòng | 8,300k | 9,400k | 10,500k | 11,600k | 12,700k | 13,800k | 15,000k | 17,100k | — |
| M2 | Phó phòng/TCN | 7,000k | 8,000k | 9,000k | 9,900k | 10,800k | 11,700k | 12,600k | 13,600k | — |
| L1 | Trưởng BP | 6,400k | 7,200k | 8,000k | 8,800k | 9,400k | 10,100k | 10,900k | 11,700k | — |
| L2 | Trưởng nhóm | 6,000k | 6,700k | 7,400k | 8,000k | 8,600k | 9,200k | 9,800k | 10,400k | — |
| E1 | Chuyên viên VP | 5,700k | 6,400k | 7,000k | 7,500k | 8,000k | 8,500k | 9,000k | 9,200k | 9,400k |
| E2 | LX/TĐ/Thợ/TV | 5,310k | 5,700k | 6,100k | 6,500k | 6,900k | 7,300k | 7,500k | 7,700k | 7,850k |

**Điều kiện nâng bậc:**
- Làm việc liên tục ≥ 2 năm tại cùng ngạch
- Điểm KPI ≥ 80% trong 2 năm liên tiếp
- Không vi phạm kỷ luật trong 2 năm

---

### 1.2 Phụ cấp Định mức theo Ngạch
**Nguồn:** QĐ 127A/2025/QĐ-X.E (hiệu lực 01/06/2025)  
**component_type:** `grade_allowance`

**Bảng giá trị (phân theo Mức 1=HN / Mức 2=Tỉnh):**

| Ngạch/Vị trí | HN (đ/tháng) | Tỉnh (đ/tháng) | Gồm các khoản |
|-------------|-------------|---------------|--------------|
| D1 - Chủ tịch HĐTV | 30,050,000 | 21,350,000 | ĐT+Xăng+TP+Đilại+Nhà ở+Ăn |
| D2 - Tổng GĐ | 22,800,000 | 16,275,000 | Tương tự |
| D3 - Phó GĐ/GĐ Khối | 13,950,000 | 10,080,000 | Tương tự |
| M1 - Trưởng phòng/Trợ lý CT | 9,450,000 | 6,930,000 | Tương tự |
| M2 - Phó phòng/Trưởng CN | 6,750,000 | 4,720,000 | Tương tự |
| L1 - Trưởng BP/Thư ký BLĐ | 5,750,000 | 3,870,000 | Tương tự |
| L2 - Trưởng nhóm/VPKD | 3,770,000 | 2,292,000 | Tương tự |
| E1+LX Tuyến+Tải>3.5t | 2,900,000 | 2,160,000 | Tương tự |
| E2 - NV phục vụ (TĐ, LX≤3.5t) | 900,000 | 670,000 | Giới hạn khoản |
| E2 - NV thừa hành (Tạp vụ) | 250,000 | 150,000 | Giới hạn khoản |

---

### 1.3 Thưởng KPI % — Khối VP Hà Nội
**Nguồn:** QĐ 127A/2025 Phụ lục 02  
**component_type:** `kpi_bonus_pct`  
**Áp dụng:** Khối VP HN (không áp dụng LX, TĐ, ĐPHH)

**Thang điểm:**

| Ngạch | Trần thưởng | Công thức vượt 100% |
|-------|------------|---------------------|
| D1/D2 | 35% TN cơ bản | Vượt: thưởng × 1.5 × %vượt |
| D3 | 32% | Tương tự |
| M1 | 28% | Tương tự |
| M2 | 25% | Tương tự |
| L1 | 22% | Tương tự |
| L2 | 20% | Tương tự |
| E1 | 18% | Tương tự |
| E2 phục vụ | 12% | Tương tự |
| E2 thừa hành | 8% | Tương tự |

---

## NHÓM 2: CHÍNH SÁCH LÁI XE TUYẾN

### 2.1 Lương Lượt (Trip Rate)
**Nguồn:** Quy chế gốc 2020 → QĐ 280823/2023 → QĐ 439/2025 → QĐ 816/2025  
**component_type:** `trip_rate_tiered`  
**Input:** Số lượt từ XBOS (GPS/Manual import)

**Bảng đơn giá hiện hành (sau tất cả điều chỉnh):**

| Tỉnh/Tuyến | Tier 1 (T1) | Ngưỡng T1→T2 | Tier 2 (T2) | Hiệu lực |
|-----------|-------------|-------------|-------------|---------|
| Nam Định | 65,000 | ≤100 lượt | 70,000 | 01/09/2025 (QĐ 439) |
| Ninh Bình | 55,000 | ≤100 lượt | 65,000 | 01/09/2025 (QĐ 439) |
| Thái Bình | 70,000 | ≤100 lượt | 75,000 | 01/09/2025 (QĐ 439) |
| Việt Trì–Ga | 65,000 | ≤50 lượt | 75,000 | 2023 (chưa điều chỉnh QĐ 439) |
| Việt Trì–BC (Hà Đông, từ 07/07/2025) | 65,000 | ≤50 lượt | 75,000 | 07/07/2025 |
| TX Phú Thọ–Ga | 70,000 | ≤50 lượt | 80,000 | 2023 |
| TX Phú Thọ–BC (Hà Đông, từ 07/07/2025) | 70,000 | ≤50 lượt | 80,000 | 07/07/2025 |
| Yên Bái | 95,000 | ≤90 lượt | 115,000 | 2023 (chưa điều chỉnh QĐ 439) |
| Nội Bài (tách riêng, QĐ 837/12.2025) | **50,000/lượt (flat)** | N/A | N/A | 12/2025 |

**Lưu ý cấu hình:**
- `route_type = NOIBAI` → tách riêng, DT không gộp vào lương DT tháng
- Lái xe hỗ trợ tỉnh khác → dùng đơn giá T2 của tỉnh đang hỗ trợ
- LX mới (QĐ 816/2025): NĐ=125k/flat; NB=140k/flat; TB=145k/flat (đến 28/02/2026)

**Phụ cấp ăn ca Chủ nhật (bổ sung từ QĐ 439):**
- Tất cả tuyến: **25,000đ/ngày CN**

---

### 2.2 Lương Doanh Thu × CLDV
**Nguồn:** Quy chế gốc 2020 (mỗi tỉnh); Quy chế Phú Thọ 2023  
**component_type:** `revenue_quality`

**Công thức:**
```
Lương DT (II) = f(Doanh thu, Tỉnh)
Lương CLDV (III) = (II) × Hệ số C
```

**Bảng tỷ lệ DT theo tỉnh:**

| Tỉnh | Ngưỡng (triệu) | Tier 1 | Tier 2 |
|------|--------------|--------|--------|
| Nam Định | 100 | 4% | 8% |
| Ninh Bình | 100 | 4% | 8% |
| Thái Bình | 100 | 4% | 8% |
| Yên Bái | 100 | 4% | 8% |
| Phú Thọ / Việt Trì | **120** | **5%** | **6%** |

*Hệ số loại xe: xe 9 chỗ ×110%; xe 11 chỗ ×100%*  
*Không tính DT hợp đồng tour ngày vào lương DT*

**Hệ số C (CLDV):**

| Điểm đánh giá | Hệ số C | Ghi chú |
|--------------|---------|---------|
| < 9.0 | điểm / 9 | Chia cho 9, KHÔNG phải 10 |
| 9.0 – 9.4 | 1.00 | Chuẩn |
| 9.5 – 9.9 | 1.05 | +5% |
| 10.0 | 1.10 | +10% |

---

### 2.3 Lương CPN (Chuyển phát nhanh)
**component_type:** `cpn_commission`  
**Công thức:** `DT_CPN × 10%` — tính trực tiếp trên cá nhân, không pool

---

### 2.4 Lương Hợp đồng
**Nguồn:** Quy chế gốc 2020 → QĐ 280823/06.2023  
**component_type:** `contract_fee`

**Bảng giá trị hiện hành (từ 06/2023):**

| Loại hợp đồng | Công thức |
|--------------|-----------|
| Khác tỉnh, đi trong ngày | 500,000đ + 4% × DT |
| Khác tỉnh, ≥2 ngày | 600,000đ/ngày + 4% × DT |
| Ngoại giao (không DT) | 750,000đ/ngày |
| Trong tỉnh, 1 lượt | 100,000đ + 4% × DT |
| Trong tỉnh, 2 chiều | 200,000đ + 4% × DT |
| Trong tỉnh, cả ngày | 400,000đ/ngày + 4% × DT |

---

### 2.5 Giảm trừ Bảo dưỡng
**component_type:** `vehicle_repair_deduction`

**Giảm trừ chung (GTC):**

| Loại xe | Tỷ lệ trừ |
|---------|----------|
| Xe Ford | 5% × CPSC tổ |
| Xe khác | 10% × CPSC tổ |

```
GTC1 = (Tổng CPSC / Số LX trong tổ) × Tỷ lệ
GTBD = Phạt LX vượt định kỳ >500km: 10% × CPSC của LX đó
TGTC = GTC1 + GTBD
```

**Giảm trừ tai nạn riêng:**

| Tỉnh | Tỷ lệ |
|------|-------|
| Nam Định/Ninh Bình/Thái Bình/VT/YB | 10% tổng chi phí tai nạn |
| Phú Thọ | **100%** tổng chi phí tai nạn |

---

### 2.6 Thưởng Chuyên cần Lái xe Tuyến
**Nguồn:** QĐ 169/2026 (01/04–31/05/2026)  
**component_type:** `attendance_bonus_conditional`

**Điều kiện (tất cả phải thỏa):**

| Điều kiện | Giá trị |
|----------|---------|
| Ngày công tối thiểu | ≥ 24 ngày/tháng |
| Không nghỉ ngày | Thứ 6, Thứ 7, Chủ nhật |
| Đối tượng | LX tuyến chính thức |
| Mức thưởng | 1,000,000đ/người/tháng |
| Thời hạn áp dụng | 01/04/2026 → 31/05/2026 |

---

### 2.7 Phụ cấp Tăng cường Tỉnh khác
**Nguồn:** QĐ 753/2025 (đến 28/02/2026)  
**component_type:** `remote_work_allowance`

| Hình thức | Mức | Điều kiện |
|----------|-----|-----------|
| Điều động hỗ trợ ngắn ngày | 20,000đ/lượt | Lái được điều động hỗ trợ tỉnh khác |
| Điều chuyển Ninh Bình | 3,000,000đ/tháng (tỷ lệ ngày) | LX từ tỉnh khác điều chuyển sang NB |
| Điều chuyển Yên Bái dài ngày | 5,000,000đ/tháng (tỷ lệ ngày) | Từ 01/05/2026 |

---

## NHÓM 3: CHÍNH SÁCH LÁI XE TẢI

### 3.1 Lương Cứng theo Loại xe
**Nguồn:** QĐ 206/2026  
**component_type:** `fixed_base_salary`

| Loại xe | Lương cứng/tháng |
|---------|----------------|
| 1T – 2T | 7,500,000 |
| 3.5T – 4.5T | 8,000,000 |
| 5T – 6.5T | 8,500,000 |
| 8T (Hino, Chenglong) | 10,000,000 |
| 15T FVM | 11,000,000 |
| Đầu kéo container | 11,500,000 – 12,500,000 |

### 3.2 Tiền QLPT (Quản lý phương tiện)
**component_type:** `vehicle_mgmt_allowance`  
*(Số liệu cụ thể theo từng dự án/tuyến — cần bổ sung từ QĐ 206)*

### 3.3 Thưởng Doanh thu Lái xe Tải
**component_type:** `revenue_commission_tiered`

**Phân loại:**

| Loại LX | Tỷ lệ thưởng DT |
|---------|----------------|
| Lái chính/phụ dự án | Tiered: ≤Mức1: 6%; Mức1–Mức2: 8%; >Mức2: 10% |
| Lái tuyến/Express | Cố định 1.5% DT |
| Lái TC Logistic | 0% DT (hưởng lương cứng + QLPT) |

*(Mức 1, Mức 2 cụ thể theo loại xe/dự án — cần QĐ 206 bổ sung)*

### 3.4 Điểm CLHĐ — Phạt Chất lượng Hàng đơn
**component_type:** `clhd_point_deduction`

**Bảng phạt:**

| Loại vi phạm | Số điểm trừ |
|-------------|------------|
| Vệ sinh xe không đạt | -5 điểm/lần |
| Xước > 5cm | -10 điểm/lần |
| Hỏng hóc nặng | Trừ toàn bộ TN QLPT |
| 1 điểm CLHĐ | = 100,000đ khấu trừ lương |

### 3.5 Hỗ trợ Bốc xếp
**component_type:** `loading_support`

| Loại | Mức |
|------|-----|
| LX tuyến/Express | Theo thực tế phát sinh |
| LX TC Logistic | Khoán 4,400,000đ/tháng |

### 3.6 Khoán Nhiên liệu
**Nguồn:** Thông báo 01/04/2026  
**component_type:** `fuel_quota_deduction`

**Bảng định mức (L/100km):**

| Nhóm xe | Hàng | Định mức |
|---------|------|---------|
| 2.5T QKR | Nóng | 8.0 |
| 2.5T QKR | Lạnh | 10.0 |
| 3.5T NPR | Nóng | 9.5 |
| 3.5T NPR | Lạnh | 11.5 |
| 5.5T FRR | — | 12.0 |
| 6.5T FRR | — | 13.0 |
| 8T Hino/Isuzu | — | 19.0 |
| 8T Chenglong | — | 18.5 |
| 15T FVM | — | 21.0 |
| Đầu kéo Container | — | 33.0 |

---

## NHÓM 4: CHÍNH SÁCH ĐIỀU PHỐI HÀNG HÓA

### 4.1 Quỹ KPI Pool
**component_type:** `kpi_pool_share`

| Khu vực | Quỹ/tháng | Cách chia |
|---------|----------|----------|
| Hà Nội | 4,000,000 | Tỷ lệ ngày công thực tế / ngày công chuẩn |
| Tỉnh | 3,000,000 | Tương tự |

*Thử việc: hưởng 85% mức chính thức.*

### 4.2 Hoa hồng Hàng gửi (tiered theo DT VP)
**component_type:** `revenue_commission_tiered`

**Công thức:**
```
Đơn giá DTHG = Tổng DT hàng gửi VP / Tổng giờ công NV VP
Lương HH gửi = Tỷ lệ(DT VP) × Đơn giá DTHG × Giờ công cá nhân
```

**Bảng tỷ lệ % (từ QĐ 1031/10.2024):**

| DT VP (triệu) | Tỷ lệ HH gửi |
|--------------|-------------|
| < 150 | 7.5% |
| 150 – 200 | 8.5% |
| 200 – 300 | 9.5% |
| ≥ 300 | 10.5% |

### 4.3 Hoa hồng Hàng nhận
**component_type:** `revenue_commission_tiered`

**Công thức:**
```
Đơn giá DTHN = Tổng DT hàng nhận VP / Tổng giờ công NV VP
Lương HH nhận = Tỷ lệ(DT VP) × Đơn giá DTHN × Giờ công cá nhân
```

**Bảng tỷ lệ % (từ QĐ 1031/10.2024):**

| DT VP (triệu) | Tỷ lệ HH nhận |
|--------------|--------------|
| < 300 | 2% |
| ≥ 300 | 3% |

### 4.4 Thưởng Vượt mốc VP
**component_type:** `team_milestone_bonus`

**Điều kiện:** DT VP vượt mốc ≥ 15% → Thưởng 20% phần chênh, chia theo DT cá nhân.

**Mốc doanh thu (triệu đồng):**

| Văn phòng | Mốc 1 | Mốc 2 | Mốc 3 |
|-----------|-------|-------|-------|
| Ngọc Hồi | 80 | 92 | 105 |
| Phố Vọng | 200 | 230 | 265 |
| Rạp Xiếc | 160 | 184 | 212 |
| Big C | 200 | 230 | 265 |
| Thọ Tháp | 100 | 115 | 132 |
| Ninh Bình | 160 | 184 | 212 |
| Nam Định | 180 | 207 | 238 |
| Thái Bình | 130 | 150 | 172 |

### 4.5 Thưởng Giao hàng (kiêm shipper)
**Nguồn:** QĐ 224/2024 (HN) + Đề xuất 01/2025 (Tỉnh)  
**component_type:** `delivery_commission`

**HÀ NỘI:**
```
Thưởng giao hàng = 25% × DT giao cá nhân
Thưởng nỗ lực = (Mức thưởng team / Tổng DT bưu cục) × DT cá nhân
```

**Bảng thưởng nỗ lực team (HN):**

| DT bưu cục (triệu) | Mức thưởng team |
|-------------------|----------------|
| < 25 | 0 |
| 25 – <35 | 4,000,000 |
| 35 – <50 | 6,000,000 |
| 50 – <75 | 8,000,000 |
| 75 – <100 | 12,000,000 |
| ≥ 100 | 16,000,000 |

**CÁC TỈNH (NĐ, TB, NB, VT, PT, Phù Ninh, YB) — từ 01/09/2025:**
- **70%** tổng cước ship Giao/Nhận tận nơi
- Không áp dụng mốc thưởng team; không tính vào DT hoa hồng chính

*(Lịch sử: gốc 07/2024 là 50%; từ 09/2025 là 70%)*

---

## NHÓM 5: CHÍNH SÁCH TỔNG ĐÀI HÀNH KHÁCH

### 5.1 Pool Lương Cơ sở
**Nguồn:** QĐ 196/2024  
**component_type:** `zero_sum_pool`

| Tham số | Giá trị |
|---------|---------|
| Pool/tháng | 5,000,000đ |
| Ngày nghỉ chuẩn | 4 ngày/tháng |
| Ngày công chuẩn | Số ngày tháng – 4 |
| Điều kiện ≥50% công chuẩn | Hưởng 100% pool |
| Điều kiện <50% công chuẩn | Hưởng 50% pool |
| Có 2 số TĐ | 1500 và 1731 → pool riêng từng số |

**Chia pool theo tỷ lệ cuộc nghe cá nhân/tổng cuộc VP.**

### 5.2 Pool Thưởng Hợp đồng & Thời gian
**component_type:** `zero_sum_pool`

| Hạng mục | Ca sáng | Ca chiều |
|---------|---------|---------|
| Thưởng HĐ | 600,000 | 800,000 |
| Thưởng thời gian | 700,000 | 1,500,000 |

*Điều kiện: ≥50% công chuẩn → 100%; <50% → 50%.*

### 5.3 Hệ số thưởng Tỷ lệ Nhỡ
**component_type:** `kpi_multiplier`

| Tỷ lệ nhỡ | Hệ số thưởng |
|-----------|-------------|
| ≤ 2% | 1.10 |
| ≤ 3% | 1.00 |
| ≤ 5% | 0.80 |
| ≤ 8% | 0.50 |
| > 8% | 0 (không thưởng) |

*Thưởng tỷ lệ nhỡ đạt ≤2%: **500,000đ/người/tháng** thêm*

### 5.4 Thưởng Top CLDV
**component_type:** `ranking_bonus`

| Hạng | Điều kiện | Mức thưởng |
|------|----------|-----------|
| Hạng 1 | Điểm CLDV cao nhất ≥9.5 | 1,000,000đ |
| Hạng 2–3 | Top 3 CLDV ≥9.5 | 500,000đ |

**Hệ số KPI theo điểm:**

| Điểm CLDV | Hệ số KPI áp vào pool |
|-----------|----------------------|
| ≥ 9.5 | 1.05 |
| 9.0 – <9.5 | 1.00 |
| < 9.0 | Điểm / 9 |

### 5.5 Lương thử việc Tổng đài (từ 01/09/2025)

| Ca | Mức lương thử việc |
|----|------------------|
| Ca sáng | 6,000,000đ/tháng |
| Ca chiều | 6,800,000đ/tháng |

### 5.6 Phụ cấp Hỗ trợ App
**Nguồn:** QĐ 752/2025 (23/10–03/11/2025)

| Mức | 37,607đ/giờ hỗ trợ |
|-----|-------------------|
| Đối tượng | NV TĐ hỗ trợ khách dùng app X.E VIETNAM |
| Thanh toán | Cùng kỳ lương tháng |

---

## NHÓM 6: CHÍNH SÁCH VĂN PHÒNG TỈNH

### 6.1 Quỹ Lương VP Tỉnh (Zero-Sum Pool)
**Nguồn:** Quy chế VP Chi nhánh 2020  
**component_type:** `zero_sum_pool`

**Công thức quỹ:**
```
A (Quỹ chia) = B (Tổng quỹ) − C (Chi phí) − D (Lương thử việc)
B = Số khách × Đơn giá/khách + Số xe × QLPT/xe
C = Khấu hao CCDC + Khấu hao xe TC + Xăng dầu xe TC + Chi phí VP
```

**Tham số theo tỉnh:**

| Tham số | Nam Định | Ninh Bình | Thái Bình |
|---------|----------|-----------|----------|
| Đơn giá/khách | 9,500đ | 9,000đ | **7,500đ** |
| Hỗ trợ 6t đầu | 9,500đ/khách | 9,500đ/khách | — |
| QLPT/xe/tháng | 800,000 | 800,000 | **500,000** |
| Trừ khách ngoại giao/NV CT/HĐ nguyên chuyến | Có | Có | Có |

### 6.2 Phân bổ Lương Cá nhân theo Hệ số
**component_type:** `zero_sum_pool`

**Hệ số lương theo vị trí:**

| Vị trí | Nam Định | Ninh Bình | Thái Bình |
|--------|----------|-----------|----------|
| Trưởng chi nhánh | 18 | 20 | 20 |
| Điều hành | 16 | 17 | 17 |
| LX trung chuyển | 15 | 16 | 16 |
| Kế toán | 11 | 12 | 12 |

**Công thức:**
```
Hệ số quy đổi giờ = Tổng giờ thực tế / Tổng hệ số lương
Hệ số hưởng (i) = HệSố(i) × Giờ(i) × HệSốQuyĐổi
Đơn giá giờ = Quỹ A / Tổng hệ số hưởng
Lương (i) = HệSốHưởng(i) × ĐơnGiáGiờ
```

**Giới hạn giờ công:** Min 220h – Max 290h/tháng.

**Giảm trừ:**

| Đối tượng | Giảm trừ |
|----------|---------|
| NV vi phạm | Theo biên bản giám sát, trừ trực tiếp |
| Trưởng CN | −20% tổng BB giảm trừ chi nhánh |
| Điều hành | −15% tổng BB giảm trừ chi nhánh |

**Lương thử việc:**

| Vị trí | Mức |
|--------|-----|
| Trưởng chi nhánh | 10,000,000 |
| Điều hành | 8,000,000 |
| LX trung chuyển | 8,000,000 |
| Kế toán | 5,500,000 |

---

## NHÓM 7: CHÍNH SÁCH ĐẶC THÙ / THỜI HẠN

### 7.1 LX mới nhận việc (QĐ 816/2025)
**Thời hạn:** Đến 28/02/2026

| Tỉnh | Mức flat trong học việc (≤7 ngày) | Thưởng chuyên cần |
|------|----------------------------------|------------------|
| Nam Định | 125,000đ/lượt | 1,000,000đ/tháng nếu ≥24NC + không nghỉ T6/7/CN |
| Ninh Bình | 140,000đ/lượt | Tương tự |
| Thái Bình | 145,000đ/lượt | Tương tự |

### 7.2 VP Trần Đại Nghĩa (QĐ đặc thù 04/2025)

| Vị trí | Mức lương cố định | Giờ làm |
|--------|-----------------|---------|
| Điều hành ĐPHH | 8,000,000đ/tháng | 9h/ca (Ca1: 6h–15h; Ca2: 11h–20h) |

---

## BẢNG TỔNG HỢP — MAPPING NHÓM → COMPONENT_TYPE

| Nhóm | Chính sách | component_type | input_source | Versioning |
|------|-----------|---------------|-------------|-----------|
| Chung | Lương cơ bản ngạch-bậc | `grade_base` | HR manual | Theo QĐ ban hành |
| Chung | Phụ cấp định mức | `grade_allowance` | HR manual | Theo QĐ |
| Chung | Thưởng KPI % | `kpi_bonus_pct` | KPI system | Tháng/Quý |
| LX Tuyến | Đơn giá lượt | `trip_rate_tiered` | XBOS trip log | ✅ Nhiều QĐ/tỉnh |
| LX Tuyến | DT × CLDV | `revenue_quality` | Excel/XBOS | Per province |
| LX Tuyến | CPN 10% | `cpn_commission` | XBOS trip | Ổn định |
| LX Tuyến | Hợp đồng | `contract_fee` | Manual/XBOS | ✅ QĐ 2023 |
| LX Tuyến | Bảo dưỡng | `vehicle_repair_deduction` | Manual | Theo tổ/tháng |
| LX Tuyến | Thưởng chuyên cần | `attendance_bonus_conditional` | Chấm công | ✅ Có thời hạn |
| LX Tuyến | Ăn ca CN | `meal_allowance_conditional` | Chấm công | QĐ 439 |
| LX Tải | Lương cứng loại xe | `fixed_base_salary` | HR contract | Theo loại xe |
| LX Tải | QLPT | `vehicle_mgmt_allowance` | Manual | Theo dự án |
| LX Tải | Thưởng DT | `revenue_commission_tiered` | XBOS | Theo tier |
| LX Tải | Điểm CLHĐ | `clhd_point_deduction` | Manual/QC | Hàng tháng |
| LX Tải | Bốc xếp | `loading_support` | Manual | Cố định/khoán |
| LX Tải | Khoán nhiên liệu | `fuel_quota_deduction` | GPS km | ✅ QĐ 04/2026 |
| ĐPHH | Quỹ KPI pool | `kpi_pool_share` | Chấm công | HN/Tỉnh |
| ĐPHH | HH hàng gửi | `revenue_commission_tiered` | Excel DT VP | ✅ QĐ 10/2024 |
| ĐPHH | HH hàng nhận | `revenue_commission_tiered` | Excel DT VP | ✅ QĐ 10/2024 |
| ĐPHH | Vượt mốc VP | `team_milestone_bonus` | Excel DT VP | Theo VP |
| ĐPHH | Giao hàng ship | `delivery_commission` | Excel DT CPN | ✅ 50%→70% |
| TĐ | Pool cuộc nghe | `zero_sum_pool` | TĐ system | Theo số TĐ |
| TĐ | Thưởng HĐ+TG | `zero_sum_pool` | TĐ system | Ca sáng/chiều |
| TĐ | Hệ số nhỡ | `kpi_multiplier` | TĐ system | Hàng tháng |
| TĐ | Top CLDV | `ranking_bonus` | TĐ system | Hàng tháng |
| TĐ | PC app | `special_allowance` | Manual | Theo đợt |
| VP Tỉnh | Quỹ pool | `zero_sum_pool` | Chấm công + DT | Theo tỉnh |
| Đặc thù | PC xa nhà | `remote_work_allowance` | Manual | Theo đề xuất |
| Đặc thù | LX mới flat | `trip_rate_tiered` | XBOS | Có thời hạn |

---

## NGUYÊN TẮC CẤU HÌNH HỆ THỐNG

1. **Mọi policy phải có `effective_from` / `effective_to`** — thay đổi không xóa, chỉ close và tạo version mới
2. **`input_source` tách rời logic** — cùng 1 component_type có thể có input khác nhau theo từng tháng
3. **`params: JSONB` chứa tier table** — không hardcode logic tính toán trong code
4. **Multi-tenant isolation** — mỗi tenant có thể override mốc thưởng VP, đơn giá lượt
5. **Conditional bonus** — thưởng chuyên cần có `period_from`, `period_to`, `conditions[]`
6. **Pool key** — TĐ 1500 và 1731 dùng `pool_key` khác nhau trong cùng policy type
7. **Province-level config** — đơn giá lượt, tỷ lệ DT, QLPT đều config per-province
8. **Trial period** — `is_probation: bool` → override sang 85% hoặc mức thử việc cụ thể
