# PO — Tầm nhìn sản phẩm HRM enterprise (XeVN / X-BOS)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-ENT-HRM-VISION-01` |
| **Date** | 2026-08-03 |
| **Owner** | **PM + PO** (Composer — dual role, enterprise services 30yr mindset) |
| **Audience** | Sponsor, BA/SA, Dev leads |
| **Liên kết** | `PO_HRM_COMPETITIVE_CAPABILITY_MAP.md` · `PO_E2E_BUSINESS_SPINE_PROGRAM.md` · `SRS_NEW.md` |
| **Status** | LIVE — nghiên cứu PO song song execution; **không** thay sponsor confirm FR mới |

> Vai trò: vừa **điều phối giao hàng** (PM) vừa **sở hữu giá trị & backlog sản phẩm** (PO). Không idle khi Dev/QA chạy — PO nghiên cứu, mở rộng backlog có chủ, khóa IN/OUT.

---

## 1. Buyer thật XeVN phục vụ ai?

| Persona mua / dùng | Việc phải “đúng luật + đúng vận hành” | Metric giá trị |
|--------------------|----------------------------------------|----------------|
| **Group CEO / BOD** | Nhìn xuyên tập đoàn: headcount, quỹ lương, rủi ro nghỉ/OT theo CT | 1 dashboard CC không Excel tay |
| **CEO CT thành viên** | Chỉ data CT mình; duyệt nghỉ/công đúng cấp | 0 leak scope; SLA duyệt < 1 ngày làm việc |
| **HRBP / C&B** | Catalog tập đoàn → CT; đợt lương khóa kỳ; BHXH kỳ | 1 nguồn sự thật catalog; payroll run tái lập được |
| **QL trực tiếp (vận hành / tài xế)** | Duyệt nghỉ L1, đi muộn, OT trên mobile | ESS mobile không cần PC |
| **NV / tài xế** | Nộp đơn, xem phép/công/phiếu lương | Self-service ≥ 80% đơn không qua HR thủ công |

**Ngành neo:** logistics / vận tải / kho — ca kíp, OT, đi muộn, đa chi nhánh, đa pháp nhân — **không** chỉ HR văn phòng SME.

---

## 2. Thanh chuẩn thị trường 2025–26 (PO research)

### 2.1 Việt Nam mid-market (thanh tối thiểu “được coi là HRM”)

Nguồn công khai (AMIS, SureHCS, HrOnline roundups 2026): buyer kỳ vọng tối thiểu:

1. Hồ sơ + HĐLĐ (+ xu hướng eContract / ký số)
2. Chấm công (máy / GPS / Face / app) + ca kíp
3. Nghỉ phép + đơn từ ESS + duyệt đa cấp
4. Tính lương tự động + **TNCN / BHXH cập nhật luật**
5. Phiếu lương ESS + (thường) file chuyển khoản
6. Tuyển dụng + onboarding cơ bản
7. Mobile ESS

**Đối thủ gần XeVN (VN):** MISA AMIS, Base HRM+, Tanca (chấm công chuỗi), SureHCS / CoreHRM (ca kíp nhà máy), 1Office, Fast HRM, GoHR.

**Signal enterprise VN:** tập đoàn lớn (vd. Masan) chọn **Workday HCM** cho core + analytics — chứng tỏ phân khúc “global platform” đã vào VN; XeVN **không** cạnh tranh full Workday; cạnh tranh **đa pháp nhân logistics + XBOS + localization đủ dùng GĐ1**.

### 2.2 Enterprise HCM quốc tế (thanh “học pattern”, không clone)

| Pattern | SAP SF / Workday / Oracle | Áp dụng XeVN |
|---------|---------------------------|--------------|
| Unified employee record | Person + job + org assignment | Giữ DNA multi-entity + memberships |
| Guided journeys / onboarding | Checklist theo role | **P1** sau spine hire→pay |
| Skills / talent / L&D | 2H2025 SF skills foundation | **Sau GĐ1** (SRS §3.7.3) |
| Workforce scheduling | Shift tối ưu sản xuất | **P1–P2** ca kíp logistics (không AI schedule sớm) |
| AI agents trong workflow | Joule / Workday AI | Chỉ sau spine ổn định; không P0 |
| Analytics / Digital Twin workforce | Enterprise buyers | Command Center KPI — mở rộng có chủ |

---

## 3. Định vị cạnh tranh (PO one-liner)

**XeVN HRM = hệ điều hành nhân sự tập đoàn logistics đa pháp nhân**, neo Command Center + catalog XBOS 2 tầng + workflow dùng chung — ESS nghỉ/công/mobile đạt thanh VN, payroll/BH đủ chạy kỳ — **không** pretend suite MISA/Workday full.

| Thắng trên | Hòa / bắt kịp GĐ1 | Không đua sớm |
|------------|-------------------|---------------|
| Multi-entity + scope ladder | Onboarding checklist, payslip ESS, leave ladder cấu hình | FaceID máy, OKR/L&D full, attrition AI |
| Catalog tập đoàn → CT | Sick attach + validation cứng | Global payroll multi-currency |
| WF XBOS ↔ HRM | Ca kíp / OT logistics | Workday Prism-class analytics |

---

## 4. Lộ trình giá trị (PO roadmap — song song E2E spine)

### NOW — chứng minh GĐ1 (đang chạy)

| Epic | Outcome | Gate |
|------|---------|------|
| **SPINE-01** Hire→Pay | JD→ứng viên→offer→NV→đợt lương | Web E2E + U78 |
| **SPINE-02** Leave ladder | NV→QL→(GĐ nếu > T_L1)→Inbox | Web+mobile; T_L1 sponsor |
| **SPINE-03** Late approve | Đi muộn→duyệt QL | Mobile+web |
| Catalog / AUTH / EMP | Nền tảng không regress | W1-B GWC ≠ DONE sản phẩm |

### NEXT — P1 sau spine xanh (đã khóa competitive map)

| ID | Outcome | Vì sao buyer VN hỏi |
|----|---------|---------------------|
| **P1-ONB-01** | Checklist onboarding sau hire | Bamboo/MISA baseline |
| **P1-SHIFT-OT-01** | Ca + OT đề nghị/duyệt | Logistics / Tanca-class |
| **P1-PAY-EXPLAIN-01** | Phiếu lương + giải thích thành phần | MISA / ESS expectation |
| **P1-BH-DEPTH-01** | BHXH kỳ / hồ sơ đủ sâu hơn stub | Statutory VN bar 2026 |
| **P1-TNCN-PORTAL** | Quyết toán / portal (Option A/B/C — chưa chốt) | Luật 2026 buyer fear |

### LATER — Sau GĐ1 (SRS §3.7.3 — không mở Dev)

FaceID/GPS advanced · OKR/L&D · Formula builder full · Attrition AI · Skills taxonomy enterprise.

---

## 5. Backlog mở rộng từ nghiên cứu vòng 2 (2026-08-03)

PO ghi **ứng viên backlog** — chưa FR cho đến BA/SA + sponsor khi đến sóng:

| Candidate ID | Năng lực | Nguồn tín hiệu | Gợi ý phase | Ghi chú |
|--------------|----------|----------------|-------------|---------|
| **CAND-BANK-FILE-01** | File chi lương ngân hàng / payroll checklist trước khóa kỳ | MiHCM, SureHCS, Việt POS | Sau P1-PAY | Phụ thuộc payslip ổn |
| **CAND-ECONTRACT-01** | HĐLĐ điện tử + ký số | VN 2026 roundups | Sau GĐ1 / legal | Ngoài HRM thuần — cần XBOS/legal |
| **CAND-DEVICE-ATT-01** | Kết nối máy ZK / Face cửa sổ | Tanca, SureHCS | Sau FaceID SRS | Giữ OUT GĐ1 |
| **CAND-COMM-01** | Hoa hồng / 3P cho vận hành KD | GoHR, CoreHRM | Sau payroll base | Logistics sales? |
| **CAND-WFP-01** | Headcount plan vs actual theo CT | Workday/SF WFP | Sau CC KPI | Group CEO value |
| **CAND-GEOFENCE-01** | Geofence chấm công | SAP SF Time 2025 | Sau GPS | Fraud control |
| **CAND-JOURNEY-01** | Guided journey (transfer/promote) | Oracle journeys | Sau onboard | Lifecycle events |
| **CAND-ZALO-NOTIF-01** | Thông báo duyệt Zalo/app | Việt POS pattern | P2 UX | Không chặn spine |

**Quy tắc PO:** mọi CAND* vào map competitive trước khi mở SRS FR; nghiệm thu trước mắt vẫn = **U79 spine**.

---

## 6. Rủi ro sản phẩm PO theo dõi (không chờ user nhắc)

| Risk | Tác động | Mitigation đang chạy |
|------|----------|----------------------|
| Spine Hire→Pay gãy ở Inbox/assignee | Không chứng minh “một sự kiện → duyệt” | BE-INBOX-01 |
| Sick leave không bắt attach | Lệch thanh compliance VN + SRS | BE-LV03-VAL + FE attach |
| Leave ladder Dev trước T_L1 | Sai chính sách tập đoàn | HOLD + Option A |
| Competitive wishlist đè UAT | Team làm rộng, không chứng minh E2E | U80 lock |
| Claim DONE từ W1-B GWC | Sponsor mất tin | U79 · status report |

---

## 7. Cách PO làm việc song song team (operating rhythm)

```text
Mỗi phiên PM+PO:
1) Pulse execution (bus / evidence / stalled Task) → intake / re-dispatch
2) Research 1 slice (đối thủ / luật / persona / gap)
3) Ghi artifact (vision / map / candidate backlog) — không hỏi sponsor “làm gì”
4) Chỉ mở FR khi: spine P0 đủ xanh HOẶC sponsor chốt Option (T_L1, TNCN A/B/C)
```

| PO sở hữu | PM sở hữu | Không làm |
|-----------|-----------|-----------|
| Giá trị, IN/OUT, ưu tiên backlog, acceptance nghiệp vụ | WBS, bus, Task, gate QA/QC | Tự code `apps/**` (trừ sponsor “tự sửa”) |
| Nghiên cứu đối thủ / luật / persona | Coaching role + residual auto-fix | Claim parity MISA/Workday |

---

## 8. Nguồn nghiên cứu (vòng 2)

- MISA AMIS / HRM Platform (public)
- VN roundups 2026: SureHCS, HrOnline, Vieclam.info (CoreHRM, Tanca, Base, 1Office, Fast)
- MiHCM Enterprise VN localization
- SAP SuccessFactors 2H 2025 (skills, scheduling, geofence)
- Workday @ Masan (Vietnam+) — signal enterprise buyer VN
- Nội bộ: SRS_NEW §3.7 · competitive map · E2E spine program

---

*PO-ENT-HRM-VISION-01 — cập nhật khi có vòng research mới hoặc sponsor chốt Option.*
