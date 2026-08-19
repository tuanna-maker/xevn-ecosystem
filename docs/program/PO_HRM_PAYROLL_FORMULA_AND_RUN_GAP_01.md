# PO — Gap lương: công thức + lập bảng lương (customer-ready)

| Meta | Value |
|------|--------|
| **Program** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-01` |
| **Opened** | 2026-08-07 |
| **Trigger** | Sponsor: sóng gần đây thiếu công thức tính lương / tạo bảng lương; cần chuẩn để triển khai khách chỉ custom nhẹ |
| **Honesty** | `payroll_e2e_ready=false` · `contracts_printable_ready=false` · không Phase1 DONE · U65 |

## 1. Sponsor / khách đã chốt trên giấy (không được quên)

| Quyết định | Nội dung | SoT |
|------------|----------|-----|
| **Q-PAY-FORMULA** | Hai bước **soạn → phát hành**; runtime metadata engine; **cấm hardcode** công thức theo tenant trong code kỳ lương | `DECISION_PACKET_Q_PAY_FORMULA.md` · ADR 4-pillar §10 Option A |
| **R-PAY-DD-01** | **GĐ1 = form cấu hình** · **GĐ2 = kéo-thả** (cùng `expression_json`) | FILL/REMAINING Excel · SRS v0.8+ |
| **Q-PAY-F-3** | Biến giờ/OT/phép **chỉ từ bảng công đã chốt** | Decision packet |
| **FR-UC-BP-PAY-02** | Động cơ công thức lương (7 mục SRS) | `SRS_HRM_ENTERPRISE` |
| **FR-UC-BP-PAY-06** | Hire→bảng lương / enroll (AC-PAY-HIRE-*) | Enterprise SRS |

## 2. PM audit nhanh (2026-08-07) — thiếu gì

| Lớp | Trạng thái | Gap |
|-----|------------|-----|
| **Giấy Q-PAY-FORMULA** | ANSWERED / SRS Đã chốt | Product fidelity **NOT_READY** |
| **TechSpec / API F-PAY-FORMULA-*** | Author/publish **HOLD** | Chưa unlock Dev formula |
| **DB `pay_formula_definition`** | DRAFT pointer · `expression_json` opaque | Chưa physical F.1 đầy đủ + ensureSchema live |
| **Platform Option B · PAY** | ADR ghi `salary_components` catalog | Vertical PAY **chưa** ship (chỉ MergeToken CTR) |
| **Lập bảng lương (period/enroll)** | PAY-HIRE waves nhiều vòng | ATT close→eligible còn **FAIL** evidence; `payroll_e2e_ready=false` |
| **Tính kỳ / payslip lines** | Process/close lifecycle có | Giải thích dòng + formula bind chưa chứng minh UAT |
| **Sóng UAT song song 08-07** | EMP/REC/ATT/CTR/platform | **Không** có lane PO-UAT-PAY / formula — **đúng là thiếu** |

## 3. Mục tiêu chương trình (customer-ready)

Khi xong GĐ1 product (không claim sớm):

1. HR cấu hình thành phần + công thức bằng **form** (version + preview + dual-control publish).
2. Lập bảng lương kỳ → enroll NV **sau** bảng công chốt → process → phiếu có dòng thành phần từ engine (không FE net).
3. Khách mới: chỉ **nhập công thức / thành phần / hệ số** theo pháp nhân — **không** fork code.

## 4. Waves (governance → execution)

| Wave | work_item | Owner | Mục tiêu |
|------|-----------|-------|----------|
| W0 | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BA-01` | ba-process | Ma trận gap: FR PAY-02/06 vs code vs evidence; AC còn mở |
| W0 | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-01` | ba-data | `pay_formula_*` · `salary_components` · period/payslip vs DB_DESIGN live |
| W0 | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-SA-01` | sa | Unlock path F-PAY-FORMULA + platform PAY vertical + Option A |
| W0 | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-01` | qa | Inventory evidence: formula / lập bảng / ATT→enroll / process — UNTESTED vs FAIL |
| W1 | (sau W0) | ba-docs / sa | Delta SRS/TechSpec/API nếu gap giấy |
| W2 | (sau unlock) | dev-be / dev-fe | Formula author GĐ1 form + run bind |
| W3 | | qa → qc | Browser U65 AC formula + lập bảng · cấm invent `payroll_e2e_ready` |

## 5. Cấm

- Claim `payroll_e2e_ready=true` / module lương UAT / Phase1 từ research.
- FE tính net / formula trên browser.
- Seed để pass bảng lương.
- Hardcode hệ số tenant trong Nest.
- Coi MergeToken CTR GWC = xong lương.

## 6. Liên kết

- Platform: `PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md` (PAY catalog roll-out)
- **AMIS parity (sponsor):** `PO_HRM_AMIS_PARITY_RESEARCH_01.md` — Thành phần lương · Mẫu bảng lương · Dữ liệu tính lương · Lập bảng
- Hire→Pay: evidence `po-hrm-e2e-link-pay-*`
- ATT J-06c: close sheet precondition
- Public neo: helpamis.misa.vn/amis-tien-luong (luồng tổng quan · thành phần · mẫu)
