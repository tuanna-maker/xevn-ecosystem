# WBS — XEVN HRM PAYROLL POLICY ENGINE
## Work Breakdown Structure (Tổng quát → Chi tiết)
**Cập nhật:** 2026-08-22 | **Trạng thái:** Execution

---

## TỔNG QUAN 4 PHASE

```
PHASE 0 ──────── PHASE 1 ──────────────── PHASE 2 ────────────────── PHASE 3 ──── PHASE 4
Discovery        Foundation + Grade       Core Payroll Engine         Completion   Go-live
(DONE ✅)        ~2–3 tuần               ~4–6 tuần                   ~3 tuần      ~2 tuần
                 Không chờ Sponsor        Chờ Q1–Q5 trước khi code E2
```

| Phase | Nội dung | Ưu tiên | Chờ gì | Ước lượng |
|-------|---------|---------|--------|-----------|
| **P0** | Discovery, tài liệu, SRS, TechSpec, API Contract | DONE ✅ | — | Done |
| **P1** | Foundation (E0) + Grade-Step (E1) + Input Hub (E3) | P0 | Không chờ gì | 2–3 tuần |
| **P2** | Policy Engine (E2) + Payroll Rewrite (E4) | P0 | Chờ Q1–Q5 | 4–6 tuần |
| **P3** | Policy Decision (E5) + Vehicle (E6) + Mobile (E7) | P1 | E2+E4 done | 3 tuần |
| **P4** | UAT, go-live, stabilization, seed data production | — | P3 done | 2 tuần |

---

## LEGEND

```
✅ Done     🔄 In Progress     ⏳ Ready to Start     🔒 Blocked     📋 Planned
```

---

## PHASE 0 — DISCOVERY & DOCUMENTATION ✅ DONE

| # | Deliverable | Trạng thái |
|---|------------|-----------|
| D-01 | Đọc 30+ PDF tài liệu khách hàng | ✅ |
| D-02 | XEVN_POLICY_CATALOG.md (7 nhóm × 28 component_type) | ✅ |
| D-03 | XEVN_MASTER_CONTEXT_v2.md (knowledge base) | ✅ |
| D-04 | XEVN_MODULE_ANALYSIS_WBS.md (phân tích module + WBS v1) | ✅ |
| D-05 | SRS_HRM_PAYROLL_POLICY_ENGINE_v1.md (SRS 7 epic) | ✅ |
| D-06 | TECHSPEC_HRM_POLICY_ENGINE_v1.md (kiến trúc kỹ thuật) | ✅ |
| D-07 | API_CONTRACT_HRM_POLICY_ENGINE_v1.md (OpenAPI endpoints) | ✅ |
| D-08 | SPONSOR_QUESTIONS_FORM.md (27 câu hỏi, 5 critical) | ✅ |
| D-09 | Migration E0 (Employee + Attendance extension SQL) | ✅ |
| D-10 | Migration E1 (Grade-Step SQL) | ✅ |
| D-11 | Migration E3 (Input Hub SQL) | ✅ |

---

## PHASE 1 — FOUNDATION + GRADE-STEP + INPUT HUB
### ⏳ Ready to Start (không chờ Sponsor)

---

### 1.0 PREREQUISITE: Sponsor Questions
> Gửi form song song khi team bắt đầu code P1

| Task | Owner | Deadline |
|------|-------|---------|
| Gửi SPONSOR_QUESTIONS_FORM.md cho Sponsor | PM | Ngay hôm nay |
| Chase Q1–Q5 (Critical) | PM | Trong 2 ngày LV |

---

### 1.1 EPIC E0 — Foundation

#### 1.1.1 Catalog Extension
| # | Task | Layer | Role | Status |
|---|------|-------|------|--------|
| E0-01 | Seed 12 catalog types mới (GRADE, PAY_GROUP, PROVINCE, VEHICLE_TYPE, ROUTE_TYPE, SHIFT_TYPE, COMPONENT_TYPE, POLICY_DECISION_TYPE, HOTLINE_CODE, OFFICE_BRANCH...) | DB | dev-be | ⏳ |
| E0-02 | Seed 80+ catalog entries (11 GRADE, 7 PAY_GROUP, 7 PROVINCE, 12+ VEHICLE_TYPE, 3 ROUTE_TYPE, 4 SHIFT_TYPE, 28 COMPONENT_TYPE, 15+ OFFICE_BRANCH...) | DB | dev-be | ⏳ |
| E0-03 | Validate catalog metadata JSONB schema per type | BE | dev-be | ⏳ |
| E0-04 | Portal UI: hiển thị các catalog type mới trong Settings | FE | dev-fe | ⏳ |

#### 1.1.2 Employee Extension
| # | Task | Layer | Role | Status |
|---|------|-------|------|--------|
| E0-05 | Run migration `202608220002` (grade_code, pay_group_code, province_code...) | DB | dev-be | ⏳ |
| E0-06 | API: cập nhật `PATCH /employees/:id` nhận các fields mới | API | dev-be | ⏳ |
| E0-07 | API: validate: `pay_group_code` required khi contract ACTIVE | API | dev-be | ⏳ |
| E0-08 | FE: Form nhân viên → Tab "Phân loại lương" (Pay Group, Tỉnh, Loại xe, TĐ) | FE | dev-fe | ⏳ |
| E0-09 | FE: Indicator thử việc + ngày hết thử việc | FE | dev-fe | ⏳ |

#### 1.1.3 Attendance Extension
| # | Task | Layer | Role | Status |
|---|------|-------|------|--------|
| E0-10 | Run migration `202608220002` (shift_type, is_sunday, is_weekend) | DB | dev-be | ⏳ |
| E0-11 | BE: `AttendanceSummaryService.getSummary(employeeId, periodMonth)` | BE | dev-be | ⏳ |
| E0-12 | BE: Logic tự set `is_sunday` và `is_weekend` khi create attendance record | BE | dev-be | ⏳ |
| E0-13 | Mobile: Dropdown chọn ca (CA_SANG / CA_CHIEU / HC) khi check-in | Mobile | dev-mobile | ⏳ |
| E0-14 | FE: Attendance report thêm cột ca, CN, cuối tuần | FE | dev-fe | ⏳ |

---

### 1.2 EPIC E1 — Grade-Step Management

#### 1.2.1 Database
| # | Task | Layer | Role | Status |
|---|------|-------|------|--------|
| E1-01 | Run migration `202608220004` (pay_grade_definitions, pay_grade_steps, employee_grade_assignments, grade_promotion_requests) | DB | dev-be | ⏳ |
| E1-02 | Seed Grade definitions 11 ngạch × QĐ 2A/2026 | DB | dev-be | ⏳ |
| E1-03 | Seed Grade steps — 11 ngạch × tối đa 9 bậc (từ QĐ 2A/2026) | DB | dev-be | ⏳ |

#### 1.2.2 Backend Services
| # | Task | Layer | Role | Status |
|---|------|-------|------|--------|
| E1-04 | `GradeService`: CRUD grade definitions, versioning theo QĐ | BE | dev-be | ⏳ |
| E1-05 | `GradeStepService`: update step salaries, validate không xóa grade đang dùng | BE | dev-be | ⏳ |
| E1-06 | `GradeAssignmentService`: gán ngạch-bậc, load current assignment tại date | BE | dev-be | ⏳ |
| E1-07 | `GradePromotionService`: tạo đề xuất, auto-check điều kiện (2 năm + KPI + kỷ luật) | BE | dev-be | ⏳ |
| E1-08 | Workflow integration: promotion request → XBOS Workflow Engine | BE | dev-be | ⏳ |

#### 1.2.3 API Endpoints
| # | Endpoint | Status |
|---|---------|--------|
| E1-09 | `GET /grades` — list + steps | ⏳ |
| E1-10 | `POST /grades` — tạo version mới | ⏳ |
| E1-11 | `PUT /grades/:id/steps` — update bậc lương | ⏳ |
| E1-12 | `POST /employees/:id/grade-assignment` | ⏳ |
| E1-13 | `GET /employees/:id/grade-history` | ⏳ |
| E1-14 | `POST /grade-promotions` | ⏳ |
| E1-15 | `GET /grade-promotions/:id` + approval webhook | ⏳ |

#### 1.2.4 Frontend
| # | Task | Layer | Role | Status |
|---|------|-------|------|--------|
| E1-16 | Settings → Thang bảng lương: bảng 11×9 edit inline | FE | dev-fe | ⏳ |
| E1-17 | Settings → History timeline theo QĐ ban hành | FE | dev-fe | ⏳ |
| E1-18 | Employee form → Tab Lương: Grade/Step selector | FE | dev-fe | ⏳ |
| E1-19 | Employee form → Grade history tab | FE | dev-fe | ⏳ |
| E1-20 | Nâng bậc flow: Dept Manager → HR → BGĐ (reuse workflow UI) | FE | dev-fe | ⏳ |

#### 1.2.5 Test
| # | Task | Status |
|---|------|--------|
| E1-T01 | Unit test: GradeService versioning (version mới → version cũ tự close) | ⏳ |
| E1-T02 | Unit test: GradePromotionService auto-check (đủ / thiếu điều kiện) | ⏳ |
| E1-T03 | Integration test: gán grade → payslip hiển thị đúng mức lương | ⏳ |

---

### 1.3 EPIC E3 — Input Data Hub

#### 1.3.1 Database
| # | Task | Status |
|---|------|--------|
| E3-01 | Run migration `202608220006` (pay_input_imports, pay_input_rows) | ⏳ |

#### 1.3.2 Backend
| # | Task | Layer | Role | Status |
|---|------|-------|------|--------|
| E3-02 | Excel template generator (per input_type, 7 loại) | BE | dev-be | ⏳ |
| E3-03 | `ExcelParserFactory`: routing per input_type | BE | dev-be | ⏳ |
| E3-04 | Parser: `TRIP_LOG` (ma_nv, tinh_code, luot_t1, luot_t2...) | BE | dev-be | ⏳ |
| E3-05 | Parser: `REVENUE_CLDV` (ma_nv, doanh_thu, diem_cldv...) | BE | dev-be | ⏳ |
| E3-06 | Parser: `MAINTENANCE_COST` (to_xe, cp_sua_chua...) | BE | dev-be | ⏳ |
| E3-07 | Parser: `FREIGHT_REVENUE` (ma_nv, loai_xe, doanh_thu, diem_clhd) | BE | dev-be | ⏳ |
| E3-08 | Parser: `DPHH_REVENUE` (van_phong, dt_gui, dt_nhan, gio_cong...) | BE | dev-be | ⏳ |
| E3-09 | Parser: `HOTLINE_STATS` (ma_nv, so_td, cuoc_nghe, ty_le_nho...) | BE | dev-be | ⏳ |
| E3-10 | Parser: `BRANCH_STATS` (chi_nhanh, so_khach, so_xe...) | BE | dev-be | ⏳ |
| E3-11 | `ImportValidationService`: schema check + employee matching + period lock check | BE | dev-be | ⏳ |
| E3-12 | Employee fuzzy match: ma_nv → employee_id (exact) hoặc tên → confirm | BE | dev-be | ⏳ |
| E3-13 | Version 2 override logic: supersede import cũ | BE | dev-be | ⏳ |

#### 1.3.3 API
| # | Endpoint | Status |
|---|---------|--------|
| E3-14 | `GET /payroll-inputs/templates/:type` (download Excel) | ⏳ |
| E3-15 | `POST /payroll-inputs/import` (multipart upload) | ⏳ |
| E3-16 | `GET /payroll-inputs/:period` (list imports + missing) | ⏳ |
| E3-17 | `GET /payroll-inputs/:id/rows` (preview + filter by status) | ⏳ |
| E3-18 | `PUT /payroll-inputs/:id/rows/:rowId` (manual override) | ⏳ |
| E3-19 | `POST /payroll-inputs/:id/approve` | ⏳ |

#### 1.3.4 Frontend
| # | Task | Status |
|---|------|--------|
| E3-20 | HR → Nhập liệu lương: chọn kỳ + loại + upload file | ⏳ |
| E3-21 | Preview table: highlight lỗi đỏ, warning vàng | ⏳ |
| E3-22 | Inline edit: sửa employee ref + data trong UI | ⏳ |
| E3-23 | Import history: list theo kỳ, link đến rows | ⏳ |
| E3-24 | Missing imports badge: cảnh báo thiếu loại input cho kỳ | ⏳ |

---

## PHASE 2 — POLICY ENGINE + PAYROLL REWRITE
### 🔒 Bắt đầu sau khi có Q1–Q5 từ Sponsor

---

### 2.1 EPIC E2 — Policy Engine

#### 2.1.1 Database
| # | Task | Status |
|---|------|--------|
| E2-01 | Migration E2: `pay_policies`, `pay_income_components`, `pay_policy_assignments` | 🔒 Q2 |
| E2-02 | Seed: 6 policy templates (LX_TUYEN, LX_TAI, DPHH, TONG_DAI, VP_TINH, VP_HN) | 🔒 Q1,Q2,Q3 |

#### 2.1.2 Backend — Policy Management
| # | Task | Status |
|---|------|--------|
| E2-03 | `PolicyService`: CRUD + versioning (clone khi amend) | ⏳ |
| E2-04 | `PolicyAssignmentService`: gán cho NV/nhóm, resolve active policy tại date | ⏳ |
| E2-05 | `PolicyVersioningService`: close version cũ khi version mới activate | ⏳ |
| E2-06 | `PolicyPreviewService`: tính thử với data mẫu | ⏳ |

#### 2.1.3 Backend — Calculator Factory (28 types)
| # | Calculator | Chờ Q? | Status |
|---|-----------|--------|--------|
| E2-07 | `grade_base` — lookup ngạch-bậc | — | ⏳ |
| E2-08 | `grade_allowance` — phụ cấp định mức HN/Tỉnh | — | ⏳ |
| E2-09 | `kpi_bonus_pct` — thưởng KPI% theo ngạch | — | ⏳ |
| E2-10 | `trip_rate_tiered` — đơn giá lượt theo tỉnh/tier | — | ⏳ |
| E2-11 | `revenue_quality` — DT × hệ số CLDV | — | ⏳ |
| E2-12 | `cpn_commission` — 10% DT CPN | — | ⏳ |
| E2-13 | `contract_fee` — phí hợp đồng theo loại | — | ⏳ |
| E2-14 | `vehicle_repair_deduction` — giảm trừ bảo dưỡng | — | ⏳ |
| E2-15 | `fixed_base_salary` — lương cứng LX Tải theo loại xe | — | ⏳ |
| E2-16 | `vehicle_mgmt_allowance` — tiền QLPT | — | ⏳ |
| E2-17 | `revenue_commission_tiered` — thưởng DT LX Tải | 🔒 Q1 | 🔒 |
| E2-18 | `fuel_quota_deduction` — khoán nhiên liệu | — | ⏳ |
| E2-19 | `clhd_point_deduction` — điểm CLHĐ × 100k | — | ⏳ |
| E2-20 | `kpi_pool_share` — quỹ KPI ĐPHH | — | ⏳ |
| E2-21 | `revenue_pool_commission` — hoa hồng gửi/nhận ĐPHH | — | ⏳ |
| E2-22 | `team_milestone_bonus` — vượt mốc DT VP | — | ⏳ |
| E2-23 | `delivery_commission` — thưởng giao hàng ship | — | ⏳ |
| E2-24 | `zero_sum_pool` — pool TĐ / VP Tỉnh | 🔒 Q3,Q8,Q9 | 🔒 |
| E2-25 | `attendance_bonus_conditional` — thưởng chuyên cần | — | ⏳ |
| E2-26 | `meal_allowance_conditional` — ăn ca CN 25k | — | ⏳ |
| E2-27 | `remote_work_allowance` — PC xa nhà / tăng cường | 🔒 Q13 | 🔒 |
| E2-28 | `loading_support` — hỗ trợ bốc xếp | — | ⏳ |
| E2-29 | `special_allowance` — phụ cấp đặc thù | — | ⏳ |
| E2-30 | `probation_override` — nhân 85% toàn bộ income | — | ⏳ |
| E2-31 | `fixed_trial_salary` — lương flat thử việc | — | ⏳ |
| E2-32 | `ranking_bonus` — thưởng Top CLDV TĐ | 🔒 Q9 | 🔒 |
| E2-33 | `kpi_multiplier` — hệ số nhỡ TĐ | — | ⏳ |
| E2-34 | `penalty_deduction` — phạt giám sát/kỷ luật | — | ⏳ |

#### 2.1.4 API
| # | Endpoint | Status |
|---|---------|--------|
| E2-35 | `GET/POST /pay-policies` | ⏳ |
| E2-36 | `GET /pay-policies/:id` (+ components) | ⏳ |
| E2-37 | `POST /pay-policies/:id/clone` | ⏳ |
| E2-38 | `POST/PUT /pay-policies/:id/components` | ⏳ |
| E2-39 | `POST /pay-policies/:id/preview` | ⏳ |
| E2-40 | `POST /pay-policies/:id/assign` | ⏳ |
| E2-41 | `GET /employees/:id/policy-assignment` | ⏳ |

#### 2.1.5 Frontend — Policy Builder
| # | Task | Status |
|---|------|--------|
| E2-42 | Settings → Chính sách lương: list + version timeline | ⏳ |
| E2-43 | Policy Builder: thêm/sửa/xóa income_component | ⏳ |
| E2-44 | Dynamic form per component_type (params schema) | ⏳ |
| E2-45 | Tier table editor (thêm/xóa dòng tier) | ⏳ |
| E2-46 | Preview panel: nhập data mẫu → xem kết quả | ⏳ |
| E2-47 | Policy assignment tab per employee | ⏳ |
| E2-48 | Version timeline: hiển thị lịch sử QĐ | ⏳ |

---

### 2.2 EPIC E4 — Payroll Engine Rewrite

#### 2.2.1 Database
| # | Task | Status |
|---|------|--------|
| E4-01 | Migration E4: ALTER `payroll_records` (+ policy_id, policy_snapshot, components JSONB) | ⏳ |

#### 2.2.2 Backend
| # | Task | Status |
|---|------|--------|
| E4-02 | `PayrollBatchService`: orchestrator (pre-check → Phase1 → Phase2 Pool → Phase3 Net) | 🔒 E2 |
| E4-03 | Phase 1: parallel individual calculation per employee | 🔒 E2 |
| E4-04 | Phase 2: `PoolCalculationService` — zero-sum distribute per pool_key | 🔒 E2,Q8,Q9 |
| E4-05 | Phase 3: BHXH/BHYT/BHTN tính từ grade_base | 🔒 Q4,Q5 |
| E4-06 | PIT tính lũy tiến theo bảng (config trong catalog) | 🔒 Q7 |
| E4-07 | `PayslipService`: generate response + PDF template | ⏳ |
| E4-08 | Policy snapshot lưu kèm payroll_record (audit trail) | 🔒 E2 |
| E4-09 | Pre-check: missing imports warning trước khi batch | ⏳ |

#### 2.2.3 API
| # | Endpoint | Status |
|---|---------|--------|
| E4-10 | `POST /payroll/batch` | ⏳ |
| E4-11 | `GET /payroll/batch/:id` | ⏳ |
| E4-12 | `GET /payroll/batch/:id/records` | ⏳ |
| E4-13 | `GET /payroll/records/:id/payslip` | ⏳ |
| E4-14 | `GET /payroll/records/:id/payslip.pdf` | ⏳ |
| E4-15 | `POST /payroll/batch/:id/approve` | ⏳ |
| E4-16 | `POST /payroll/batch/:id/lock` | ⏳ |

#### 2.2.4 Frontend
| # | Task | Status |
|---|------|--------|
| E4-17 | HR → Bảng lương: batch run UI + progress bar | ⏳ |
| E4-18 | Payroll list: filter/sort/search, status badge | ⏳ |
| E4-19 | Payslip detail: accordion từng component, màu income/deduction | ⏳ |
| E4-20 | Pool summary view: TĐ pool members + shares | ⏳ |
| E4-21 | Export Excel/PDF | ⏳ |
| E4-22 | Mobile: Payslip accordion components + ngạch-bậc hiển thị | Mobile | ⏳ |

---

## PHASE 3 — COMPLETION (P1)
### 📋 Sau khi Phase 2 done

---

### 3.1 EPIC E5 — Policy Decision Management

| # | Task | Layer | Status |
|---|------|-------|--------|
| E5-01 | Migration E5: `pay_policy_decisions` | DB | 📋 |
| E5-02 | `PolicyDecisionService`: CRUD + workflow approval | BE | 📋 |
| E5-03 | Trigger: APPROVED → tạo policy version mới (AMEND) hoặc policy mới (ISSUE) | BE | 📋 |
| E5-04 | `GET/POST /policy-decisions` | API | 📋 |
| E5-05 | `POST /policy-decisions/:id/approve` | API | 📋 |
| E5-06 | FE: Quản lý Quyết định — list + form 4 loại + approval | FE | 📋 |
| E5-07 | FE: Link QĐ → Policy version (audit trail) | FE | 📋 |

---

### 3.2 EPIC E6 — Vehicle & Fuel Tracking

| # | Task | Layer | Status |
|---|------|-------|--------|
| E6-01 | Migration E6: `vehicles`, `vehicle_fuel_logs` | DB | 📋 |
| E6-02 | `VehicleService`: CRUD xe + gán lái xe | BE | 📋 |
| E6-03 | `FuelQuotaService`: nhập km → tính vượt/thiếu → deduction | BE | 📋 |
| E6-04 | Output: fuel_deduction → tự động tạo pay_input_row type FREIGHT_REVENUE | BE | 📋 |
| E6-05 | `GET/POST /vehicles`, `POST /vehicles/:id/fuel-logs` | API | 📋 |
| E6-06 | FE: Logistics → Phương tiện + Khoán nhiên liệu | FE | 📋 |

---

### 3.3 EPIC E7 — Mobile Enhancement

| # | Task | Platform | Status |
|---|------|---------|--------|
| E7-01 | Payslip: accordion từng component (income xanh / deduction đỏ) | Mobile | 📋 |
| E7-02 | Payslip: hiển thị ngạch-bậc + nhóm lương | Mobile | 📋 |
| E7-03 | Check-in: dropdown ca (CA_SANG / CA_CHIEU / HC) | Mobile | 📋 |
| E7-04 | Attendance monthly: badge ngày CN + quota công chuẩn | Mobile | 📋 |

---

## PHASE 4 — UAT & GO-LIVE
### 📋 Sau khi Phase 3 done

| # | Task | Status |
|---|------|--------|
| G-01 | Seed data production: Grade 11×9, Province config, Vehicle types | 📋 |
| G-02 | Import historical data: gán grade/policy cho toàn bộ NV hiện có | 📋 |
| G-03 | UAT: chạy payroll thử tháng 1 với data thực | 📋 |
| G-04 | Fix bugs từ UAT | 📋 |
| G-05 | Go-live: chạy batch chính thức tháng đầu tiên | 📋 |
| G-06 | Stabilization: monitor + fix 4 tuần đầu | 📋 |

---

## TÓM TẮT SỐ LƯỢNG TASK

| Phase | DB | BE | API | FE | Mobile | Test | Total |
|-------|----|----|-----|----|--------|------|-------|
| P0 (Done) | 3 | 0 | 0 | 0 | 0 | 0 | **11 deliverables** |
| P1 (E0+E1+E3) | 8 | 15 | 12 | 15 | 2 | 3 | **~55 tasks** |
| P2 (E2+E4) | 2 | 35 | 14 | 12 | 1 | — | **~64 tasks** |
| P3 (E5+E6+E7) | 2 | 8 | 5 | 5 | 4 | — | **~24 tasks** |
| P4 (Go-live) | — | — | — | — | — | — | **6 tasks** |
| **TOTAL** | | | | | | | **~160 tasks** |

---

## DEPENDENCY MAP

```
Q1–Q5 (Sponsor) ──────────────────────┐
                                       ▼
E0 (Catalog+Employee+Att) ──► E1 (Grade) ──► E2 (Policy Engine) ──► E4 (Payroll)
         │                                              │
         └──────────────► E3 (Input Hub) ──────────────┘
                                                        │
                                        ┌───────────────┼───────────────┐
                                        ▼               ▼               ▼
                                    E5 (Decision)   E6 (Vehicle)    E7 (Mobile)
                                        │               │               │
                                        └───────────────┴───────────────┘
                                                        │
                                                    Phase 4: Go-live
```

---

## ƯỚC LƯỢNG THỜI GIAN (team 3–4 người: 1 dev-be, 1 dev-fe, 1 dev-mobile)

| Phase | Duration | Ghi chú |
|-------|---------|---------|
| P1 | 2–3 tuần | E0+E1 song song, E3 sau |
| P2 | 4–6 tuần | E2 là complex nhất (28 calculators), E4 sau |
| P3 | 2–3 tuần | E5+E6+E7 song song được |
| P4 | 1–2 tuần | Phụ thuộc kết quả UAT |
| **TỔNG** | **9–14 tuần** | ~2.5–3.5 tháng |

> **Rủi ro chính:** Nếu Q1–Q5 không có trong tuần này → P2 delay 1–2 tuần.
