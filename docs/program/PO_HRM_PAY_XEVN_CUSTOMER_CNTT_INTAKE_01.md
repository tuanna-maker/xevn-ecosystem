# PO — Intake cấu hình lương XeVN (P.CNTT) + đối chiếu AMIS + gap linkage

| Meta | Value |
|------|--------|
| **Program** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **Opened** | 2026-08-11 |
| **Trigger** | Sponsor nhận pack **Gửi P.CNTT** — cấu hình bảng lương + chính sách/quy định lương XeVN |
| **Parent** | `PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01` · `PO_HRM_AMIS_PARITY_RESEARCH_01` |
| **Honesty** | `payroll_e2e_ready=false` · research/delta SRS ≠ UAT · U65 zero-seed |
| **sponsor_confirm_srs** | **2026-08-11** — sponsor OK delta Thiết lập lương `UC-BP-PAY-STP-01..12` (ADD-only) |

## 1. Nguồn khách (local — chưa git)

**Root:** `docs/từ khách hàng/Gửi P.CNTT/` — **67 files** (30 PDF · 38 XLSX · 2 XLS)

| # | Mô hình / đơn vị | Chính sách | Bảng lương mẫu | Dữ liệu đầu vào |
|---|------------------|------------|----------------|-----------------|
| 0 | **Chung** | Thang lương QĐ 2A · QĐ lương 127A | — | Lịch PVTHK |
| 1 | Điều phối hàng hóa (ĐPHH) | 7 PDF | BP ĐPHH | DLL CPN |
| 2 | Tổng đài hành khách | 3 PDF KPI 1500/1731 | TĐHK done | KPI/BCC/PCCV T5 |
| 3 | Lương thời gian | — | VP Hà Nội | — |
| 4 | Lái xe tuyến | 13 PDF theo tỉnh | LX tuyến T06 | BCC · CPSC · điểm CLDV |
| 5 | Lái xe tải | 2 PDF | LXT t5 | DT · tạm ứng · XDTN |
| 6 | Văn phòng tỉnh | 3 PDF theo tỉnh | 6 tỉnh T05 | Chi phí VP · trợ lương |

**Insight PM:** XeVN **không** một bảng lương duy nhất — cần **Thiết lập** đa mẫu (AMIS: Mẫu bảng lương + Thành phần + override công thức theo OU).

## 2. Hiện trạng product (tóm tắt audit 2026-08-07 — chưa đủ pack mới)

| Lớp | Trạng thái | Gap vs khách |
|-----|------------|--------------|
| Thiết lập thuế/BH/tham số | Partial Settings | Thiếu policy pack theo BP (ĐPHH/TĐ/LX…) |
| Thành phần lương + công thức | Catalog stub · engine **HOLD** | Khách có cột/formula riêng từng mẫu |
| Mẫu bảng lương đa OU | **MISSING** | 6+ mẫu Excel khách |
| Dữ liệu tính lương (input pack) | ATT close gate OK · vars chưa nạp engine | DLL KPI · doanh thu · CPSC… |
| Lập bảng / process | Period/enroll slice GWC · **net=0 stub** | Bảng done.xlsx khách ≠ runtime |
| Liên kết ATT→PAY→EMP→Settings | **PARTIAL** | `pay_types` consumer vừa seal · formula bind FAIL |

SoT chi tiết: `docs/qa/evidence/po-hrm-payroll-formula-run-gap-ba-01.md` · `PO_HRM_AMIS_PARITY_RESEARCH_01.md`

## 3. Mục tiêu wave (governance trước Dev)

1. **Inventory** pack P.CNTT → capability matrix (policy · component · template · input · output).
2. **Đối chiếu AMIS** spine 1–7 vs XeVN vs **thực tế khách** (6 mô hình).
3. **Linkage audit** — mọi cấu phần menu Lương/Thiết lập đã nối FK/API chưa.
4. **Delta SRS/TechSpec/API/UI** — chỉ phần **GAP** P0; không rewrite toàn SRS nếu ADD đủ.
5. **Thiết lập** (nếu thiếu): module cấu hình mẫu bảng · thành phần · policy bind · input pack schema.

## 5. Sponsor lock — đọc quy định (2026-08-11)

**Bắt buộc mọi seat BA:** đọc **từng PDF** theo `docs/program/specs/PO-HRM-PAY-CNTT-POLICY-READ-METHOD.md`.

- Phân định **chính sách CHUNG** vs **RIÊNG** (theo BP/mô hình).
- **Mỗi điều khoản / quy tắc = một `fragment`** — mảnh ghép nghiệp vụ (thang lương, KPI, phụ cấp, thử việc, doanh thu, chuyên cần…).
- Bảng lương XLSX **gắn fragment** — không liệt kê cột mù.

Seat song song **không dừng** wave CTR workspace nếu không conflict path.

## 6. Waves (song song)

| WI | Owner | Deliverable |
|----|-------|-------------|
| `PO-HRM-PAY-CNTT-LINKAGE-QA-01` | qa | Inventory menu Lương/Settings — **PASS** · `po-hrm-pay-cntt-linkage-qa-01.md` |
| `PO-HRM-PAY-CNTT-BA-PROCESS-01` | ba-process | Ma trận 6 mô hình — **PASS** · `PO-HRM-PAY-CNTT-BA-PROCESS-01.md` |
| `PO-HRM-PAY-CNTT-SA-01` | sa | ADR multi-template — **PASS** · `PO-HRM-PAY-CNTT-SA-01.md` |
| `PO-HRM-PAY-CNTT-SYNTH-PM-01` | pm | **PARTIAL** · `PO-HRM-PAY-CNTT-GAP-SYNTH-01.md` |
| W1 (sau synth) | ba-docs | Delta SRS § PAY — **DISPATCHED** post sponsor confirm 2026-08-11 |
| **PO-HRM-UIUX-PIPELINE-PLAYBOOK-01** | pm | **PUBLISHED** · `PM_PO_DELIVERY_PIPELINE_UIUX.md` + OS template |

## 7. Code linkage baseline (2026-08-11)

Audit payroll linkage: product **PARTIAL** vs BA snapshot Aug 7 — formula/evaluator/template exist in code; **`payroll_e2e_ready=false`** retained. Customer P.CNTT **6 models** require multi-template + policy fragments — feed BA-POLICY-DECOMPOSE + BA-DATA.

## 8. Cấm
- Seed để demo bảng lương khách.
- Claim `payroll_e2e_ready=true` từ research.
- Hardcode 6 mô hình vào Nest — phải metadata/template.
- Copy brand/UI AMIS.

## 6. Exit program (trước Dev lớn)

- ~~Sponsor **confirm** delta SRS scope~~ → **DONE 2026-08-11** (ADD-only `UC-BP-PAY-STP-01..12`)
- ~~DB_DESIGN + API_DESIGN physical~~ → **DONE** [API-01](047e5a03-a3f1-4a3b-983e-3155acb5e7e0) · `DB_DESIGN_HRM_PAYROLL.md` §8 · `API_DESIGN_HRM_PAYROLL.md` CNTT APPEND
- ~~SRS delta 12 UC~~ → **DONE** [SRS-DELTA-01](eb49ba78-df9a-4360-b59f-b4c94c8367e2) · `docs/program/deltas/PO-HRM-PAY-CNTT-STP-SRS-DELTA-01.md`
- **UI_SCREEN_SPEC** → **DONE** [UI-SCREEN-01](52d82db6-788f-43b6-bb98-8e559837a860) · `UI-HRM-PAY-STP-SPEC-INDEX.md` + 7 màn
- **Dev-BE** compile fix **DONE** [D-PAY-CNTT-BE-COMPILE-01](4d04f032-088e-4e7f-adfd-374f5d886c27) · CNTT routes live
- **QA BE-01 R2** **PASS** [QA R2](052cb6fa-9c49-4798-acec-3181806b2b78) · L0–L1 · stamp `CNTTBER2QA-MSO8HVER`
- **QC BE-01** **GWC** [QC](9a9f664c-a947-4e78-9eda-342edf4bf549) · `CNTTBEQC1-MSO8HVERQC1` · carry `R-CNTT-FE`
- **Dev-FE** `PO-HRM-PAY-CNTT-FE-STP-01` in flight — closes `R-CNTT-FE`
- **Dev-BE** `PO-HRM-PAY-CNTT-BE-02` in flight — fragment bind §8.7–8.8
- Linkage matrix: mọi hàng P0 có owner Dev hoặc waiver
