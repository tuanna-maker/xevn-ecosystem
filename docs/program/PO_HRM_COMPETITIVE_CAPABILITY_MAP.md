# PO — Bản đồ năng lực HRM: XeVN vs MISA vs chuẩn thế giới

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-HRM-COMP-MAP-01` |
| **Date** | 2026-08-03 |
| **Owner** | PM / PO |
| **Mục đích** | Mở rộng tầm nhìn sản phẩm: đối thủ VN (MISA AMIS) + suite quốc tế → gap → backlog / test spine |
| **Nguồn công khai** | [AMIS Nhân Sự](https://amis.misa.vn/amis-nhan-su/) · [HRM Platform MISA](https://amis.misa.vn/227597/hrm-platform/) · Workday / SAP SF / BambooHR / Personio (buyer guides 2025–26) |
| **XeVN SoT** | `SRS_NEW.md` v1.3 · `HRM_MENU_DATA_LINKAGE_MATRIX.md` · `PO_E2E_BUSINESS_SPINE_PROGRAM.md` · `PO_ENTERPRISE_HRM_PRODUCT_VISION.md` |
| **Status** | LIVE PO — BA/SA đã khóa GĐ1 IN/OUT; research vòng 2 bổ sung VN peers + enterprise signal |
| **Owner role** | **PM + PO** (U81) |

> Đây **không** phải cam kết làm hết như Workday. Đây là **khung PO** để biết mình đứng đâu, GĐ1 phải chứng minh gì, và phần nào Sau GĐ1 / out-of-scope có chủ.

---

## 1. Phân khúc tham chiếu

| Nhóm | Đại diện | Điểm mạnh điển hình | XeVN nên học gì |
|------|----------|---------------------|-----------------|
| **VN mid-market** | **MISA AMIS HRM** | Gói đủ nghiệp vụ VN (BHXH, TNCN), AI agent, liên thông kế toán MISA, ESS mobile mạnh | Localization thuế/BH; onboarding checklist; công thức lương giải thích được; ESS đi muộn/OT |
| **VN ops / chuỗi** | **Tanca**, GoHR | GPS/Face/QR, ca kíp F&B–retail, mobile-first | Pattern chấm công phân tán — FaceID vẫn Sau GĐ1; OT/ca = P1 |
| **VN nhà máy / tập đoàn on-prem** | **CoreHRM**, SureHCS / Lạc Việt | Ca gãy, lương 3P, BHXH sâu, Bank Hub | Học depth lương/BH — không copy on-prem |
| **VN workflow UX** | Base HRM+, 1Office | Số hóa quy trình, all-in-one SME | UX ESS; XeVN thắng ở đa pháp nhân + XBOS |
| **VN localized enterprise cloud** | MiHCM Enterprise | Multi-company payroll SEA, org planning | Pattern checklist payroll trước khóa kỳ |
| **EU SMB** | Personio | Core HR + absence + recruiting gọn, GDPR | UX ESS đơn giản; time-off rõ ladder |
| **US SMB** | BambooHR | Onboarding + ATS nhẹ + PTO | Onboarding wizard; document pack |
| **Enterprise HCM** | Workday, SAP SuccessFactors, Oracle HCM | Unified data model, global payroll, talent/L&D, workforce planning, analytics | Multi-entity (DNA XeVN); talent/WFP = Sau GĐ1 |
| **Enterprise VN signal** | Workday @ Masan (công bố) | Core HCM + hướng WFP/analytics/EX | Xác nhận phân khúc global đã vào VN — XeVN không đua full suite |
| **Ops / payroll US** | Rippling, Gusto, Dayforce | HR+IT+Payroll automation | Pattern “một sự kiện → nhiều hệ” (XBOS WF → HRM) |

**Định vị XeVN (PO):** HRM **đa pháp nhân tập đoàn logistics** + Command Center + workflow XBOS — không phải clone MISA full suite; phải **bằng hoặc hơn** đối thủ VN ở: scope đa CT, catalog tập đoàn, quy trình phê duyệt liên phân hệ, ESS nghỉ/công/mobile.

---

## 2. Taxonomy năng lực (chuẩn thị trường)

| Domain | Mã | Mô tả ngắn |
|--------|-----|------------|
| Core HRIS | D-CORE | Hồ sơ NV, org, tài liệu, RBAC, multi-entity |
| Time & Absence | D-TIME | Chấm công, ca, nghỉ, OT, đi muộn/về sớm |
| Payroll & Comp | D-PAY | Đợt lương, thành phần, khóa kỳ, phiếu |
| Statutory VN | D-VN | BHXH/BHYT/BHTN, TNCN, hồ sơ pháp lý VN |
| Recruit & Onboard | D-REC | ATS, JD, pipeline, offer, onboarding checklist |
| Talent | D-TAL | Mục tiêu, đánh giá, 360, L&D, succession |
| ESS / MSS | D-ESS | App NV + QL duyệt |
| Workflow / Policy | D-WF | Phê duyệt đa cấp, SLA, chống tự duyệt |
| Analytics | D-AN | Dashboard, dự báo nghỉ việc, headcount plan |
| AI Assist | D-AI | JD/CV, giải thích lương, chatbot quy chế |
| Integration | D-INT | Kế toán, máy công, SSO, API |

---

## 3. Ma trận đối chiếu (PO đánh giá)

**Ký hiệu XeVN:**  
`🟢` Có & đang/đã chứng minh được (ít nhất local/pilot) · `🟡` Có một phần / stub / thiếu E2E · `🔴` Chưa có / Sau GĐ1 rõ · `⚪` Cố ý out-of-scope GĐ1

| Domain | Capability | MISA AMIS (công bố) | Global (Workday/SF/Bamboo/Personio) | **XeVN hôm nay** | GĐ1 PO | Ghi chú / SoT |
|--------|------------|---------------------|--------------------------------------|------------------|--------|----------------|
| D-CORE | Multi-company / holding | Có (AMIS platform) | Workday/SF mạnh | 🟢 DNA + scope ladder | **Phải E2E** | ADR scope · persona CEO/CT |
| D-CORE | Employee master + profile | Có | Core mọi suite | 🟢 / 🟡 | E2E mutate+F5 | FR-UC-H01 · J-HRM-02 |
| D-CORE | Hợp đồng LĐ | Có | Có | 🟢 | Spine hire | FR-UC-HRM-25 |
| D-CORE | Org chart / dept | Có | Có | 🟡 XBOS org + HRM | Catalog+org | J-XBOS dept |
| D-CORE | Document e-file | Có | Bamboo mạnh | 🟡 | P1 | Legal docs XBOS; HRM docs partial |
| D-TIME | Chấm công GPS / app | GPS, Face, QR, WiFi… | Time clocks + app | 🟡 GPS **không FaceID** (SRS) | E2E GPS/geofence | UC-H02 |
| D-TIME | Ca / shift | Có | Có | 🟡 | P1 density | shifts catalog |
| D-TIME | Nghỉ phép + số dư | Có + mobile | PTO mọi suite | 🟡 web+mobile có; **ladder ngày L1/L2 chưa khóa spec** | **E2E spine 02** | FR-UC-H03 |
| D-TIME | Đi muộn / về sớm / giải trình | Có | Time exceptions | 🟡 | **E2E spine 03** | update-requests |
| D-TIME | OT / tăng ca | Có | Có | 🟡 | P1 | Liên leave type Bù |
| D-PAY | Chạy đợt + khóa kỳ | Có + AI giải thích CT | Workday/SF sâu | 🟡 | Spine 01 bước lương | FR-UC-H04 |
| D-PAY | Formula builder | AI tạo CT lương | Enterprise | 🔴 | **Sau GĐ1** | AC-MMAP-PR-FORM |
| D-PAY | Payslip ESS | Có | Có | 🟡 mobile J-MOB-04 | E2E | |
| D-VN | BHXH điện tử / tờ khai | **Mạnh (VN)** | Global ≠ VN | 🟡 list BH; **chưa** cổng BHXH/TNCN full | GĐ1: list trung thực; cổng = Sau | Q-INS-01 |
| D-VN | Thuế TNCN kê khai | Module riêng MISA | Local payroll packs | 🔴 | Sau GĐ1 / tích hợp | |
| D-REC | ATS + đăng tin + AI CV | AI Agent mạnh | Bamboo/Personio ATS | 🟡 requisition/candidate + WF bridge | **Spine 01** | UC-H05 P1 inventory |
| D-REC | Onboarding checklist (IT/doc/training) | Có “hội nhập” | Bamboo benchmark | 🔴/🟡 hire→NV only | **Mở rộng GĐ1 tối thiểu** | Checklist Sau; hire bắt buộc |
| D-TAL | OKR / Goal | Module Mục tiêu | Workday/SF/Personio | 🔴 | Sau GĐ1 | |
| D-TAL | Performance review | Module Đánh giá | Mọi HCM | 🟡 `/performance` API | P1 density | Matrix § performance |
| D-TAL | L&D / succession | Có đào tạo (MISA) | Enterprise | 🔴 | Sau GĐ1 | |
| D-ESS | Mobile NV+QL | Rất mạnh | Personio/Bamboo app | 🟡 nhiều J-MOB đã smoke | **Spine 02/03 bắt buộc** | UF-HRM-07/08 |
| D-WF | Multi-level approval | Có | Workday | 🟢 XBOS WF | E2E không seed | FR-UC-B03 |
| D-WF | Catalog 2-tầng tập đoàn | Ít nhấn mạnh | Enterprise config | 🟢 điểm khác biệt XeVN | Spine 04 | FR-UC-B04 |
| D-AN | People analytics / attrition AI | AI dự báo nghỉ việc | Workday mạnh | 🔴/🟡 dashboard counters | Sau GĐ1 AI | hrm_ai menu |
| D-AI | JD/CV/chat quy chế | AVA / AI Agent | Emerging everywhere | 🟡 UniAI shell | Sau GĐ1 productize | |
| D-INT | Kế toán / máy công | MISA kế toán native | SAP/Workday finance | ⚪/🟡 | GĐ1: API + WF; kế toán = phase sau | BRD boundary |

---

## 4. Khoảng trống ưu tiên PO (mở rộng ngoài W1-B)

### P0 — Phải chứng minh bằng E2E (đang chạy `PO-E2E-BIZ-SPINE-01`)

| ID | Gap | Vì sao so với MISA/global | Action |
|----|-----|---------------------------|--------|
| G-P0-HIREPAY | Hire→Pay chưa spine U78 | MISA/Bamboo coi đây là happy path | QA SPINE-01 |
| G-P0-LEAVE-LADDER | Thiếu bảng ngày→cấp duyệt | Mọi HRM VN có rule QL vs GĐ | BA khóa BR + QA |
| G-P0-LATE-ESS | Đi muộn mobile→duyệt | AMIS Chấm công chuẩn ESS | qa-device SPINE-03 |
| G-P0-MENU-HONEST | Menu có nhưng chưa retest nghiệp vụ | Market = “dùng được” không phải “load được” | Menu sweep + mutate |

### P1 — GĐ1 mở rộng (backlog sản phẩm — chưa claim DONE)

| ID | Gap | Competitor cue | Owner lane |
|----|-----|----------------|------------|
| G-P1-ONBOARD-CHK | Checklist hội nhập sau hire (doc, thiết bị, training stub) | MISA onboarding · Bamboo | BA → SRS delta → Dev |
| G-P1-SHIFT-OT | Ca + OT + đồng bộ lương | AMIS chấm công–lương | BA-P + Dev |
| G-P1-PERF-CYCLE | Chu kỳ đánh giá mật độ tối thiểu | Personio Review | BA + Dev |
| G-P1-PAY-EXPLAIN | Giải thích thành phần lương trên phiếu (không AI full) | MISA AVA “giải mã CT” | FE copy + BE lines |
| G-P1-VN-INS-DEPTH | BH list chuyên biệt + export tối thiểu | AMIS BHXH | Q-INS-01 đóng |

### P2 — Sau GĐ1 / khác biệt có chủ (cấm pretend)

| ID | Gap | Note |
|----|-----|------|
| G-P2-TNCN-PORTAL | Cổng kê khai TNCN | Tích hợp hoặc phase riêng |
| G-P2-FACE-QR | FaceID / QR timeclock | SRS GĐ1 **không** FaceID |
| G-P2-GOAL-OKR | Mục tiêu / OKR | |
| G-P2-LND | Đào tạo / succession | |
| G-P2-ATTRITION-AI | Dự báo nghỉ việc | |
| G-P2-ACCT-NATIVE | Liên thông kế toán kiểu MISA | XeVN = ecosystem riêng |

---

## 5. Điểm mạnh XeVN cần giữ (đừng “đuổi MISA” làm mất)

1. **Catalog tập đoàn 2 tầng** (XBOS → HRM) — ít đối thủ VN làm sâu.  
2. **Workflow engine dùng chung** Command Center (tuyển dụng, metadata, catalog gov).  
3. **RBAC đa pháp nhân + kiêm nhiệm** (`memberships[]`).  
4. **Logistics domain DNA** (không phải HRM generic thuần).  

PO rule: mở rộng năng lực **bám định vị**, không phình thành “AMIS clone”.

---

## 6. Liên kết chương trình

| Artifact | Role |
|----------|------|
| `PO_E2E_BUSINESS_SPINE_PROGRAM.md` | Chứng minh P0 bằng test |
| `PO_E2E_BIZ_SPINE_STATUS.md` | Báo cáo sống |
| `PO_ENTERPRISE_HRM_PRODUCT_VISION.md` | Tầm nhìn buyer/persona + CAND* backlog vòng 2 |
| Doc này | Backlog mở rộng + competitive lens |
| SRS `§3.7` AC-MMAP-* | Ranh giới GĐ1 vs Sau GĐ1 đã có — BA chỉ **ADD** khi sponsor confirm |

---

## 7. Next (PO + execution)

1. ~~ba-process / sa GĐ1 IN/OUT~~ — DONE (evidence `po-hrm-comp-ba-01` / `po-hrm-comp-sa-01`).  
2. **Execution** — đóng SPINE-01/02/03 (U79); không mở Dev cho CAND* / P1 wishlist.  
3. **PO research liên tục** — cập nhật vision §5 CAND* khi có tín hiệu thị trường/luật.  
4. Sponsor chốt `T_L1` / TNCN Option → mới mở FR tương ứng.
