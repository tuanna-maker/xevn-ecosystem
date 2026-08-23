# XEVN HRM — TÀI LIỆU NGỮ CẢNH TỔNG THỂ
## Master Context Document — Gốc → Ngọn → Kế hoạch

> **Version:** 2.0 — Tổng hợp đầy đủ sau khi đọc 30+ tài liệu PDF/MD + BRD/SRS/DB_DESIGN  
> **Ngày:** 2026-08-22  
> **Trạng thái:** ✅ Đủ để viết BRD chi tiết và thiết kế DB Policy Engine

---

## PHẦN A — BỐI CẢNH VÀ PAIN POINTS

### A.1 Mô hình vận hành XeVN Group

XeVN Group vận hành **đa pháp nhân (multi-tenant)** trong 3 mảng:
- **Vận tải hành khách (VTHK):** Xe Limousine tuyến NĐ/TB/NB/PT/VT/YB ↔ HN
- **Vận tải hàng hóa (VTHH):** LX tải, ĐPHH tại các văn phòng bưu cục
- **Dịch vụ:** Tổng đài 1500/1731, VP chi nhánh tỉnh

### A.2 Pain Points đã xác định (BRD-XEVN-NEW v1)

| ID | Pain Point | Mức độ |
|----|-----------|--------|
| P-01 | Data silos — Excel riêng mỗi bộ phận, báo cáo mất 3–5 ngày | 🔴 Cao chí mạng |
| P-02 | Chính sách lương khác nhau giữa các tỉnh, không chuẩn hóa | 🔴 Cao |
| P-03 | Onboarding công ty mới mất 2–4 tuần | 🟡 Trung bình |
| P-04 | Chấm công thủ công, đối chiếu mất nhiều ngày | 🟡 Trung bình |
| P-05 | Bảng lương tính tay Excel, dễ sai | 🔴 Cao |
| P-06 | Tuyển dụng rời rạc, không có pipeline | 🟡 Trung bình |
| P-07 | Không có audit trail | 🔴 Cao |
| P-08 | Không có multi-tenant isolation | 🔴 Cao chí mạng |

---

## PHẦN B — TOÀN BỘ CHÍNH SÁCH LƯƠNG (Từ tài liệu thực tế)

### B.1 Ngạch-Bậc lương (QĐ 2A/2026)

Nền tảng chung — tất cả nhân viên đều có ngạch/bậc. Dùng để tính BHXH, nghỉ phép, thưởng KPI năm.

| Ngạch | Chức danh | Bậc I | Bậc Max | Số Bậc |
|-------|-----------|-------|---------|--------|
| D1 | Chủ tịch HĐTV | 13,100,000 | 26,000,000 | VI |
| D2 | Tổng GĐ | 11,100,000 | 21,400,000 | VI |
| D3 | Phó GĐ, GĐ Khối | 9,600,000 | 19,900,000 | VII |
| C1 | Cố vấn chiến lược | 9,600,000 | 19,900,000 | VII |
| C2 | Chuyên gia cao cấp | 7,000,000 | 12,400,000 | VII |
| M1 | Trưởng phòng | 8,300,000 | 17,100,000 | VIII |
| M2 | Phó phòng, Trưởng CN | 7,000,000 | 13,600,000 | VIII |
| L1 | Trưởng bộ phận | 6,400,000 | 11,700,000 | VIII |
| L2 | Trưởng nhóm | 6,000,000 | 10,400,000 | VIII |
| E1 | Chuyên viên VP | 5,700,000 | 9,400,000 | IX |
| E2 | LX, Tổng đài, Thợ, Tạp vụ | 5,310,000 | 7,850,000 | IX |

**Điều kiện nâng bậc:** ≥2 năm liên tục + KPI ≥80% + Không vi phạm kỷ luật.

---

### B.2 Phụ cấp định mức theo Ngạch (QĐ 127A/2025)

| Vị trí | HN | Tỉnh |
|--------|----|------|
| Chủ tịch HĐTV | 30,050,000 | 21,350,000 |
| Tổng GĐ | 22,800,000 | 16,275,000 |
| Phó GĐ / GĐ Khối | 13,950,000 | 10,080,000 |
| Trưởng phòng / Trợ lý CT | 9,450,000 | 6,930,000 |
| Phó phòng / Trưởng CN | 6,750,000 | 4,720,000 |
| Trưởng bộ phận | 5,750,000 | 3,870,000 |
| Trưởng nhóm | 3,770,000 | 2,292,000 |
| Chuyên viên / LX Tuyến+Tải >3.5t | 2,900,000 | 2,160,000 |
| NV phục vụ (Tổng đài, LX ≤3.5t) | 900,000 | 670,000 |
| NV thừa hành (Tạp vụ) | 250,000 | 150,000 |

---

### B.3 Thưởng KPI % — Khối VP (QĐ 127A/2025)

| Ngạch | Trần | Quy tắc vượt 100% |
|-------|------|-------------------|
| D1/D2 | 35% | Vượt: +1.5 × tỷ lệ × mức |
| D3 | 32% | Tương tự |
| M1 | 28% | Tương tự |
| M2 | 25% | Tương tự |
| L1 | 22% | Tương tự |
| L2 | 20% | Tương tự |
| E1 | 18% | Tương tự |
| E2 phục vụ | 12% | Tương tự |
| E2 thừa hành | 8% | Tương tự |

> **Không áp dụng** cho LX tuyến, LX tải, Tổng đài, ĐPHH.

---

### B.4 Lương Lái xe Tuyến (Trip-Based)

**Công thức:**
```
Tổng = (I) Lương lượt
     + (III) Lương CL phục vụ = Lương DT × Hệ số C
     + (IV) CPN = DT_CPN × 10%
     + (V) Lương khăn, nước (mua lại)
     + (VI) Lương hợp đồng
     - (VII) Giảm trừ bảo dưỡng + tai nạn
```

**Đơn giá lượt (lịch sử điều chỉnh):**

| Tỉnh/Tuyến | Gốc 2020 (T1/T2) | QĐ 439/09.2025 | QĐ 816/12.2025 (LX mới) |
|-----------|-----------------|----------------|------------------------|
| Nam Định | 45k/55k | 65k/70k | 125k flat |
| Ninh Bình | 45k/55k | 55k/65k | 140k flat |
| Thái Bình | 50k/60k | 70k/75k | 145k flat |
| Việt Trì–Ga | 60k/70k | — | — |
| Việt Trì–BigC | 45k/55k | — | — |
| VT/PT–BigC HĐ (từ 07/07/2025) | — | 65k/75k (VT); 70k/80k (PT) | — |
| TX Phú Thọ–Ga | 65k/75k | — | — |
| TX Phú Thọ–BigC | 50k/60k | — | — |
| Nội Bài (QĐ 837/12.2025) | gộp trong tuyến | **50k/lượt riêng** (DT không tính vào DT tháng) | — |
| Yên Bái dài ngày (từ 01/05/2026) | Lương lượt | → **KPI** + 5,000,000 PCCT | — |

*Tier 1: 0–100 lượt (hoặc 0–50 lượt Phú Thọ). Tier 2: vượt ngưỡng.*

**Hỗ trợ tuyến Phú Thọ giai đoạn đầu:** +15k (3t) → +10k (3t) → +5k (3t) → hết.

**Lương DT theo tỉnh:**

| Tỉnh | Ngưỡng | Tier 1 | Tier 2 |
|------|--------|--------|--------|
| NĐ/NB/TB | 100M | 4% | 8% |
| Phú Thọ/VT | 120M | 5% | 6% |

*DT xe 9 chỗ: ×110%; xe 11 chỗ: ×100%. Không tính DT hợp đồng tour.*

**Hệ số C (điểm CLDV):**

| Điểm | Hệ số C |
|------|---------|
| < 9.0 | điểm/10 |
| 9.0–9.4 | 1.0 |
| 9.5–9.9 | 1.05 |
| 10.0 | 1.1 |

**Lương hợp đồng (sau QĐ 280823/06.2023):**

| Loại | Mức áp dụng hiện tại |
|------|---------------------|
| Khác tỉnh 1 ngày | 500,000 + 4% DT |
| Khác tỉnh ≥2 ngày | 600,000/ngày + 4% DT |
| Ngoại giao (không DT) | 750,000/ngày |
| Trong tỉnh 1 lượt | 100,000 + 4% DT |
| Trong tỉnh 2 chiều | 200,000 + 4% DT |
| Trong tỉnh cả ngày | 400,000/ngày + 4% DT |

**Giảm trừ bảo dưỡng:**
```
GTC1 = (Tổng CPSC / Số LX trong tổ) × 10%  [Xe Ford: 5%]
GTBD = phạt vượt định kỳ >500km → 10% CPSC của LX vi phạm
Tổng GTC = GTC1 + GTBD
Giảm trừ tai nạn riêng: NĐ/NB/TB = 10%; Phú Thọ = 100% tổng CP
```

**Thưởng chuyên cần & phụ cấp đặc biệt:**

| Loại | Điều kiện | Mức | Thời hạn |
|------|-----------|-----|---------|
| Thưởng chuyên cần (QĐ 169/2026) | ≥24 ngày công, không nghỉ T6/T7/CN | 1,000,000/tháng | Đến 31/05/2026 |
| PC tăng cường (QĐ 753/2025) | Điều động hỗ trợ tỉnh khác | 20,000/lượt | Đến 28/02/2026 |
| LX mới học việc (QĐ 816/2025) | ≤7 ngày | 400,000/ngày | Đến 28/02/2026 |
| PC xa nhà — Ninh Bình | Điều chuyển từ tỉnh khác | 3,000,000/tháng (tỷ lệ ngày) | Đến thông báo mới |
| PC xa nhà — Yên Bái | Điều chuyển dài ngày | 5,000,000/tháng (tỷ lệ ngày) | Từ 01/05/2026 |

---

### B.5 Lương Lái xe Tải (QĐ 206/2026)

**Phân loại:**

| Loại | Công thức |
|------|-----------|
| Lái chính dự án | Lương cứng + QLPT + Thưởng DT tiered - Điểm CLHĐ |
| Lái phụ | Như lái chính, chia 70/30 hoặc thỏa thuận |
| Lái tuyến/Express | Lương cứng + KPI + 1.5% DT cố định + HT bốc xếp |
| Lái TC Logistic | Lương cứng + QLPT + HT bốc xếp khoán 4,400,000 |

**Lương cứng theo loại xe:** 1–2t: 7.5M; 3.5–4.5t: 8M; 5–6.5t: 8.5M; Đầu kéo: 11.5–12.5M

**Thưởng DT tiered:** ≤Mức1: 6%; Mức1–Mức2: 8%; >Mức2: 8%Mức2 + 10%×vượt

**Phạt CLHĐ:** 1 điểm = 100,000đ khấu trừ.

**Khoán nhiên liệu (từ 01/04/2026):**

| Loại xe | Mức (L/100km) |
|---------|--------------|
| 2.5T hàng nóng | 8.0 |
| 2.5T hàng lạnh | 10.0 |
| 3.5T hàng nóng | 9.5 |
| 3.5T hàng lạnh | 11.5 |
| 5.5T | 12.0 |
| 6.5T | 13.0 |
| 8T Hino/Isuzu | 19.0 |
| 8T Chenglong | 18.5 |
| 15T | 21.0 |
| Đầu kéo container | 33.0 |

---

### B.6 Lương Điều phối Hàng hóa (QCĐP 2022 + Điều chỉnh)

**Công thức:**
```
Tổng = Quỹ KPI (pool ngày công)
     + %HH_gửi × Đơn giá DTHG/giờ × Giờ cá nhân
     + %HH_nhận × Đơn giá DTHN/giờ × Giờ cá nhân
     + Thưởng team vượt mốc VP
     + Thưởng giao hàng cá nhân (nếu kiêm shipper)
     + Thưởng nỗ lực team
     - Khấu trừ vi phạm
```

*Thử việc: hưởng 85% mức chính thức.*

**Quỹ KPI:** HN: 4,000,000; Tỉnh: 3,000,000 (chia theo ngày công thực tế).

**Hoa hồng DT hàng gửi (lịch sử):**

| DT VP | Tỷ lệ gốc 2022 | QĐ 1031/10.2024 |
|-------|----------------|----------------|
| < 150M | 6% | **7.5%** |
| 150–200M | 7% | **8.5%** |
| 200–300M | 8% | **9.5%** |
| ≥ 300M | 8% | **10.5%** |

**Hoa hồng DT hàng nhận:**

| DT VP | Tỷ lệ gốc | QĐ 1031/10.2024 |
|-------|-----------|----------------|
| < 300M | 1% | **2%** |
| ≥ 300M | — | **3%** |

**Thưởng team vượt mốc VP:** Vượt ≥15% → thưởng 20% phần chênh, chia tỷ lệ DT cá nhân.

**Mốc thưởng (triệu):**

| VP | M1 | M2 | M3 |
|----|----|----|----|
| Ngọc Hồi | 80 | 92 | 105 |
| Phố Vọng | 200 | 230 | 265 |
| Rạp Xiếc | 160 | 184 | 212 |
| Big C | 200 | 230 | 265 |
| Thọ Tháp | 100 | 115 | 132 |
| Ninh Bình | 160 | 184 | 212 |
| Nam Định | 180 | 207 | 238 |
| Thái Bình | 130 | 150 | 172 |

**Thưởng giao hàng (kiêm shipper):**
- HN: 25% DT cá nhân + Thưởng nỗ lực team (bậc thang 0–16M theo DT bưu cục)
- Tỉnh (từ 07/2024): **50%** cước ship giao/nhận tận nơi
- Tỉnh (từ 09/2025): **70%** cước ship giao/nhận tận nơi (toàn bộ VP tỉnh)

---

### B.7 Lương Tổng đài hành khách (QĐ 196/2024)

**Công thức:**
```
Tổng = Lương cuộc nghe (pool chia theo tỷ lệ cuộc)
     + Lương HĐ (pool định mức theo HĐ đạt)
     + Lương thời gian (pool định mức theo giờ)
     + Thưởng Top CLDV (nếu ≥9.5)
     + Hệ số thưởng tỷ lệ nhỡ
     + PC ứng dụng X.E VIETNAM (37,607đ/giờ — QĐ 752)
```

*2 số TĐ: 1500 và 1731 — mỗi số có pool riêng.*

**Pool cơ sở:** 5,000,000đ/tháng. Ngày công chuẩn = Số ngày tháng – 4.

**Định mức pool:**

| Hạng mục | Ca sáng | Ca chiều |
|---------|---------|---------|
| Thưởng HĐ | 600,000 | 800,000 |
| Thưởng thời gian | 700,000 | 1,500,000 |

**Hệ số thưởng tỷ lệ nhỡ:**

| Tỷ lệ nhỡ | Hệ số |
|-----------|-------|
| ≤ 2% | 1.1 |
| ≤ 3% | 1.0 |
| ≤ 5% | 0.8 |
| ≤ 8% | 0.5 |
| > 8% | 0 |

**Thưởng Top CLDV:** ≥9.5 → ×1.05 + Hạng 1: 1M; Hạng 2–3: 500k.

**Lương thử việc:** Ca sáng 6,000,000; Ca chiều 6,800,000 (từ 01/09/2025).

---

### B.8 Lương Văn phòng Tỉnh (Zero-Sum Pool theo doanh số)

**Công thức quỹ:**
```
A (Quỹ chia) = B (Tổng quỹ) - C (Chi phí) - D (Lương thử việc)
B = Số khách × Đơn giá/khách + Số xe × QLPT/xe
```

**Tham số theo tỉnh:**

| Tham số | Nam Định | Ninh Bình | Thái Bình |
|---------|----------|-----------|----------|
| Đơn giá/khách | 9,500đ | 9,000đ (+hỗ trợ 9,500 trong 6t) | **7,500đ** |
| QLPT/xe | 800,000 | 800,000 | **500,000** |

**Hệ số lương theo vị trí:**

| Vị trí | Nam Định | Ninh Bình | Thái Bình |
|--------|----------|-----------|----------|
| Trưởng CN | 18 | 20 | 20 |
| Điều hành | 16 | 17 | 17 |
| LX trung chuyển | 15 | 16 | 16 |
| Kế toán | 11 | 12 | 12 |

*Giờ công: min 220h/tháng, max 290h/tháng.*

*Giảm trừ: NV theo biên bản giám sát; Trưởng CN -20% tổng BB; Điều hành -15% tổng BB.*

**Lương thử việc:** Trưởng CN 10M; Điều hành 8M; LX TC 8M; Kế toán 5.5M.

---

## PHẦN C — NGHIỆP VỤ QUẢN LÝ CHÍNH SÁCH THƯỞNG/PHẠT

### C.1 Các loại "chính sách" hiện đang tồn tại

Từ tài liệu đọc được, XeVN có **4 loại quyết định chính sách** cần quản lý:

#### Loại 1 — Quyết định Ban hành (Issue)
Là quyết định ban hành quy chế mới hoặc sửa đổi toàn diện.
- VD: QĐ 2A/2026 (thang lương), QĐ 206/2026 (lương LX tải), QĐ 196/2024 (lương TĐ)
- **DB cần:** `policy_id`, `policy_type`, `effective_from`, `effective_to`, nội dung dạng versioned

#### Loại 2 — Quyết định Điều chỉnh (Amend)
Chỉ thay đổi 1 hoặc vài tham số trong quy chế đang có.
- VD: QĐ 439/2025 (thay đơn giá lượt), QĐ 1031/2024 (thay tỷ lệ HH), QĐ 280823/2023 (thay lương HĐ)
- **DB cần:** `amendment_of_policy_id`, `changed_params: JSONB`, `effective_from`

#### Loại 3 — Quyết định Thưởng (Bonus Award)
Quyết định chi thưởng đặc biệt theo đợt/thời hạn.
- VD: QĐ 169/2026 (thưởng chuyên cần), QĐ 816/2025 (thưởng LX mới), QĐ 752/2025 (PC app)
- **DB cần:** `bonus_type`, `conditions: JSONB`, `amount`, `period_from`, `period_to`, `target_group`

#### Loại 4 — Đề xuất/Đề nghị (Proposal)
Đề xuất chờ phê duyệt BGĐ, khi phê duyệt mới thành QĐ.
- VD: Đề xuất ship tỉnh 50% (07/2024), Đề xuất Yên Bái KPI, Đề xuất Ninh Bình điều chuyển
- **DB cần:** `proposal_status: PENDING|APPROVED|REJECTED`, `approved_by`, `approved_at`, `resulting_policy_id`

### C.2 Cơ chế thưởng hiện tại (tổng hợp)

| Tên thưởng | Nhóm | Điều kiện | Mức | Phân loại |
|-----------|------|-----------|-----|-----------|
| Thưởng KPI % ngạch | VP, Quản lý | Điểm KPI | Đến 35% TN | Monthly/Quarterly |
| Thưởng CLDV LX tuyến (Hệ số C) | LX tuyến | Điểm đánh giá | ×C trên lương DT | Monthly |
| Thưởng Top CLDV tổng đài | Tổng đài | Điểm ≥9.5 + xếp hạng | 0.5M–1M | Monthly |
| Thưởng cuộc nhỡ thấp | Tổng đài | % nhỡ ≤ 2% | Hệ số ×1.1 | Monthly |
| Thưởng chuyên cần LX tuyến | LX tuyến | ≥24 NC + không nghỉ T6/7/CN | 1,000,000 | Monthly |
| Thưởng DT team vượt mốc VP | ĐPHH | VP vượt mốc ≥15% | 20% phần vượt | Monthly |
| Thưởng nỗ lực team giao hàng | ĐPHH kiêm shipper | DT bưu cục | Bậc thang 0–16M | Monthly |
| Thưởng KPI hợp đồng tổng đài | Tổng đài | Số HĐ ký | Pool theo định mức | Monthly |
| Thưởng LX tải DT vượt tier | LX tải | DT theo tiered | 6–10% | Monthly |

### C.3 Cơ chế phạt/khấu trừ hiện tại

| Tên phạt | Nhóm | Cơ chế |
|---------|------|--------|
| Giảm trừ bảo dưỡng chung (GTC1) | LX tuyến | Chia đều theo tổ, trừ % CPSC |
| Phạt vượt định kỳ bảo dưỡng (GTBD) | LX tuyến | Riêng LX vi phạm, 10% CPSC |
| Giảm trừ tai nạn riêng | LX tuyến NĐ/NB/TB | 10% tổng CP tai nạn |
| Giảm trừ tai nạn riêng | LX tuyến Phú Thọ | 100% tổng CP tai nạn |
| Điểm CLHĐ vi phạm | LX tải | 1 điểm = 100,000đ |
| Giảm trừ vi phạm biên bản giám sát | VP tỉnh | Theo biên bản: NV trực tiếp; TCN -20%; ĐH -15% |
| Hệ số nhỡ cao | Tổng đài | % nhỡ >8% → hệ số = 0 |
| Bồi thường hàng hóa | ĐPHH | Thất lạc, hỏng hóc → khấu trừ |
| CLDV thấp (Hệ số C < 1) | LX tuyến | C = điểm/10 → giảm lương DT |

---

## PHẦN D — BRD HIỆN TẠI VÀ GAP ANALYSIS

### D.1 BRD-XEVN-NEW v1 (Đã có — 2026-08-01)

**Modules trong phạm vi Phase 1:**

| Module | Ưu tiên | Trạng thái |
|--------|---------|-----------|
| XBOS (Tenant, RBAC, Workflow, Catalog, Audit) | P0 | Đang build |
| HRM Web (Employee, Attendance, Leave, Payroll, Recruitment) | P0 | Đang build |
| Mobile (GPS check-in, Leave, Payslip, Notifications, Offline) | P0 | Spec sẵn |
| Portal/CC (Super Admin, Catalog mgmt) | P1 | Đang build |
| Logistics (Vehicle, Driver, Trip — giới hạn) | P1 | Chưa đầy đủ |

**NFR đã định nghĩa:** P95 < 300ms; Payroll 500 NV < 30 phút; Uptime 99.5%; RTO < 2h.

### D.2 SRS Payroll hiện tại (UC-H04 — đơn giản)

Hiện SRS chỉ định nghĩa:
```
Net = Gross - BHXH(8%) - BHYT(1.5%) - BHTN(1%) - PIT
```
→ **CHƯA có** Policy Engine cho các loại lương đặc thù (trip-rate, commission, pool).

### D.3 DB Design hiện tại — Payroll Records

`payroll_records` hiện chỉ có: `gross`, `deductions: JSONB`, `net`, `status`
→ **CHƯA có** bảng nào cho: `pay_policy`, `income_component`, `policy_version`, `trip_log`, `commission_input`

### D.4 GAP ANALYSIS — Những gì cần thêm

| Gap | Mức độ | Nghiệp vụ bị ảnh hưởng |
|-----|--------|----------------------|
| Ngạch-Bậc lương | 🔴 P0 | Tất cả — nền tảng BHXH, phép năm |
| Phụ cấp định mức theo ngạch | 🔴 P0 | Tất cả — lương cơ bản |
| Versioning chính sách (effective_from/to) | 🔴 P0 | Mọi thay đổi QĐ |
| Policy Engine (income_component types) | 🔴 P0 | Lương LX tuyến, tải, ĐPHH, TĐ |
| Trip log import | 🟠 P1 | LX tuyến — đầu vào số lượt |
| Revenue import | 🟠 P1 | LX tuyến/tải/ĐPHH — đầu vào DT |
| Pool calculation (zero-sum) | 🟠 P1 | Tổng đài, VP tỉnh |
| Fuel quota tracking | 🟡 P2 | LX tải — khoán nhiên liệu |
| Maintenance deduction tracking | 🟡 P2 | LX tuyến — GTC bảo dưỡng |
| CLHĐ point system | 🟡 P2 | LX tải — điểm phạt |
| Proposal → Policy flow | 🟠 P1 | HR Admin — quản lý QĐ |
| Attendance bonus conditional | 🟠 P1 | LX tuyến, Tổng đài |

---

## PHẦN E — THIẾT KẾ POLICY ENGINE

### E.1 Kiến trúc đề xuất

```
employee
  └── pay_policy_assignment (N:1 → pay_policy, có effective_from)
        └── pay_policy
              ├── id, name, policy_type, target_pay_group
              ├── effective_from, effective_to
              └── income_component[] (các thành phần thu nhập)
                    ├── component_type (enum — xem bảng bên dưới)
                    ├── effective_from, effective_to
                    ├── input_source (manual|excel_import|xbos_api|gps)
                    ├── params: JSONB (tier_table, rate, pool_key, conditions...)
                    └── applies_to_pay_group
```

### E.2 Catalog component_type (21 loại)

| `component_type` | Nhóm | Mô tả |
|-----------------|------|-------|
| `grade_base` | Tất cả | Lương cơ bản ngạch-bậc |
| `grade_allowance` | Tất cả | Phụ cấp định mức theo ngạch |
| `kpi_bonus_pct` | VP, QL | Thưởng KPI % |
| `trip_rate_tiered` | LX Tuyến | Đơn giá × lượt (tiered by province+date) |
| `revenue_quality` | LX Tuyến | Lương DT × hệ số CLDV |
| `cpn_commission` | LX Tuyến | CPN 10% DT cá nhân |
| `contract_fee` | LX Tuyến | Lương hợp đồng (flat + %DT) |
| `vehicle_repair_deduction` | LX Tuyến | Giảm trừ bảo dưỡng chung/riêng |
| `fixed_base_salary` | LX Tải | Lương cứng theo loại xe |
| `vehicle_mgmt_allowance` | LX Tải | TN QLPT |
| `revenue_commission_tiered` | LX Tải, ĐPHH | Hoa hồng DT tiered |
| `fuel_quota_deduction` | LX Tải | Trừ vượt định mức nhiên liệu |
| `clhd_point_deduction` | LX Tải | Điểm CLHĐ × 100,000 |
| `kpi_pool_share` | ĐPHH | Quỹ KPI chia ngày công |
| `revenue_pool_commission` | ĐPHH | Hoa hồng DT × đơn giá giờ pool |
| `team_milestone_bonus` | ĐPHH | Thưởng team vượt mốc VP |
| `delivery_commission` | ĐPHH shipper | 25%/50%/70% cước ship |
| `zero_sum_pool` | Tổng đài, VP tỉnh | Pool chia theo hệ số đóng góp |
| `attendance_bonus_conditional` | LX tuyến, TĐ | Thưởng chuyên cần theo điều kiện |
| `remote_work_allowance` | LX điều chuyển | PC công tác xa nhà |
| `penalty_deduction` | Tất cả | Khấu trừ vi phạm biên bản |

---

## PHẦN F — USE CASES NHÓM (BRD Level)

### UC-P01: Quản lý Thang Bảng Lương (Grade-Step Management)
**Actor:** HR Admin  
**Chức năng:** CRUD ngạch, bậc, mức lương. Versioning theo QĐ. Tra cứu lịch sử điều chỉnh.  
**Business rule:** Nâng bậc cần điều kiện; không xóa ngạch đang có NV.

### UC-P02: Quản lý Chính sách Lương (Pay Policy Management)
**Actor:** HR Admin  
**Chức năng:** Tạo/sửa policy, gắn income_component, set effective_from/to.  
**Business rule:** Policy đang active không thể sửa trực tiếp — phải tạo version mới.

### UC-P03: Gán Chính sách cho Nhân viên (Policy Assignment)
**Actor:** HR Admin  
**Chức năng:** Gán policy cho nhân viên theo pay_group, có effective_from.  
**Business rule:** 1 NV chỉ có 1 active policy tại 1 thời điểm; lịch sử gán được lưu.

### UC-P04: Import Dữ liệu đầu vào Lương (Input Data Import)
**Actor:** HR Staff  
**Chức năng:** Import Excel số lượt, DT, điểm CLDV, chi phí SC theo tháng.  
**Business rule:** Validate format; lưu trạng thái import; cho phép sửa trước khi tính.

### UC-P05: Tính lương tháng (Payroll Batch)
**Actor:** HR Manager (khởi động), Finance (phê duyệt)  
**Chức năng:** Batch tính lương cho từng NV theo policy đang active, với input data tháng đó.  
**Business rule:** Kết quả là draft → qua 6 bước → lock. Lock rồi không sửa.

### UC-P06: Quản lý Quyết định Chính sách (Policy Decision Management)
**Actor:** HR Admin, BGĐ  
**Chức năng:** Tạo QĐ, đề xuất, phê duyệt. Khi phê duyệt → trigger tạo policy version mới.  
**Business rule:** QĐ có số hiệu, ngày hiệu lực. Lịch sử QĐ không xóa.

### UC-P07: Tính BHXH/BHYT/BHTN/TNCN
**Actor:** Hệ thống (tự động)  
**Chức năng:** Tính các khoản trích theo luật từ lương cơ bản ngạch-bậc.  
**Business rule:** Theo quy định nhà nước; tỷ lệ cần cấu hình được.

### UC-P08: Báo cáo Bảng lương (Payslip & Reports)
**Actor:** HR, Finance, Employee (tự xem)  
**Chức năng:** Xem payslip chi tiết từng thành phần; xuất Excel/PDF; báo cáo tổng hợp.

---

## PHẦN G — CÂU HỎI CÒN TỒN ĐỌNG (Cần Sponsor xác nhận)

*(Từ SPONSOR_REVIEW_ACTION_2026-08-13.md + phân tích mới)*

| # | Câu hỏi | Ảnh hưởng | Mức độ |
|---|---------|-----------|--------|
| Q1 | KPI 1500 vs KPI 1731 — cách tính pool có khác nhau không? | Sai → sai toàn bộ lương TĐ | 🔴 Critical |
| Q2 | Ca làm việc S/HC — dùng chung hay riêng theo vùng? | Ảnh hưởng cách tính giờ công chuẩn | 🔴 Critical |
| Q3 | Tạm ứng lương: % là bao nhiêu? (30%, 50%, hay 80%?) | Cần để tính advance payment | 🟠 High |
| Q4 | QĐ 127A điều chỉnh Phụ lục của Quy chế số 17/2025 — có file Phụ lục 17/2025 không? | Cần biết baseline trước điều chỉnh | 🟠 High |
| Q5 | Thưởng chuyên cần sau 31/05/2026 — có gia hạn không? | Nếu không gia hạn → cần set effective_to tự động | 🟡 Medium |
| Q6 | LX tải — "Mức 1", "Mức 2" trong tiered DT cụ thể là bao nhiêu theo từng loại xe? | Thiếu số liệu → không tính được thưởng DT | 🔴 Critical |
| Q7 | Điểm CLHĐ LX tải — ai nhập? Bộ phận kỹ thuật hay HR? | Ảnh hưởng flow nhập liệu | 🟡 Medium |
| Q8 | VP Hà Nội — có quy chế lương riêng không, hay chỉ theo ngạch-bậc? | Chưa có file VP HN | 🟠 High |
| Q9 | Thưởng chuyên cần "0 bản tin" — con số cụ thể là bao nhiêu? | Cần để tính | 🟡 Medium |
| Q10 | Tuyến Ninh Bình, Thái Bình lúc 2020 — đơn giá gốc có đúng như Nam Định không? | Đã xác nhận: NB = NĐ (45k/55k); TB = 50k/60k | ✅ Confirmed |
| Q11 | VP tỉnh Phú Thọ/Việt Trì/Yên Bái — có quy chế VP tỉnh riêng không? | Chưa có file | 🟠 High |
| Q12 | Bảng lương VP HN hiện tính theo cơ chế gì? Ngạch-bậc hay pool? | Cần để thiết kế UC-P01 | 🟠 High |

---

## PHẦN H — ROADMAP TRIỂN KHAI

### Phase 0 (Bắt buộc — nền tảng):
1. ✅ Ngạch-Bậc lương (grade_base, grade_allowance)
2. ✅ Cơ chế phê duyệt QĐ (Policy Decision Management)
3. ✅ BHXH/BHYT/BHTN auto-calculate
4. ✅ Nghỉ phép tích lũy theo luật LĐ

### Phase 1 (Cạnh tranh):
5. Trip-rate tiered LX Tuyến (import số lượt)
6. Revenue × CLDV LX Tuyến
7. Fixed + DT tiered LX Tải
8. KPI bonus % VP
9. Thưởng chuyên cần conditional

### Phase 2 (Lợi thế):
10. Revenue commission pool ĐPHH
11. Zero-sum pool Tổng đài + VP Tỉnh
12. Fuel quota tracking
13. CLHĐ point deduction
14. Policy versioning dashboard
15. Thuế TNCN progressive full

### Nguyên tắc thiết kế để bán cho Enterprise khác:
- `component_type` là catalog động, không hardcode
- Mọi policy có `effective_from` / `effective_to`
- `input_source` tách rời: manual, Excel import, API, GPS
- Multi-tenant isolation đầy đủ
- Graceful fallback: thiếu policy đặc thù → về ngạch-bậc
