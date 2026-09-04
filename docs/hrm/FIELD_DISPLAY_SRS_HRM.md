# FIELD_DISPLAY_SRS_HRM

| Meta | Value |
|------|-------|
| Project | XeVN OS |
| Work Item | BA-U72-FIELD-DISPLAY-SRS-01 |
| Type | Software Requirements Specification (SRS) |
| Scope | 13 FAIL-LABEL-LEAK field display rules — Employees, Contracts, Attendance, Recruitment, Settings, Performance |
| Version | 1.0.0 |
| Date | 2026-07-28 |
| Requirement Format | 5 mandatory attributes per field (1. Tên cột, 2. Label VI, 3. Source Data Type, 4. UI Form, 5. Null/Empty Behavior) |

---

## Overview

This SRS defines the **field display layer** for 13 FAIL-LABEL-LEAK IDs across the XeVN HRM modules.

| Col | Atributo | Proposito |
|-----|----------|-----------|
| 1 | Nguon goc field | DB table / API response / Catalog / Enum |
| 2 | Label hien thi | Tieng Viet theo nghiep vu XeVN |
| 3 | Dang gia tri nguon | enum key, UUID, boolean, int, string… |
| 4 | Dang hien thi UI | Badge / Label catalog / Plain text |
| 5 | Khi null/empty | EM-DASH / An hang / "Chua cap nhat" |

All null/empty values MUST render as one of the three standard representations per module convention (see col 5 rules per row).

---

## Section 1: Employees — Profile & Resume

### F-01: Gender (Gioi tinh) | Employees Profile + Resume

| # | Atributo | Chi tiet |
|---|----------|----------|
| 1 | Nguon goc | **API** — `GET /api/employees/:id/profile` → `profile.gender` |
| 2 | Label VI | **Gioi tinh** |
| 3 | Dang gia tri nguon | `enum` : `male` / `female` / `other` |
| 4 | Dang hien thi UI | **Badge voi mau phan biet** — `male` → Nam (xanh duong #3B82F6); `female` → Nu (hong #EC4899); `other` → Khac (xam #6B7280) |
| 5 | Khi null/empty | Hien thi **EM-DASH**. Khong an hang. |

### F-02: Employment Type (Loai hinh lao dong) | Employees

| # | Atributo | Chi tiet |
|---|----------|----------|
| 1 | Nguon goc | **DB** — `employees.employment_type` (field tren bang employees hoac API `GET /api/employees/:id`) |
| 2 | Label VI | **Loai hinh lao dong** |
| 3 | Dang gia tri nguon | `enum` : `full-time` / `full_time` / `part-time` / `contract` / `intern` (tolocal_key khac nhau); gia tri bat kep tra ve "unknown" |
| 4 | Dang hien thi UI | **Label catalog** (badge neu can): `full-time` / `full_time` → Toan thoi gian; `part-time` → Ban thoi gian; `contract` → Hop dong; `intern` → Thuc tap; unknown → EM-DASH |
| 5 | Khi null/empty | Hien thi **"Chua cap nhat"** (chu IN HOA dau dong). Khong an hang. Khong de dau `-` moi. |

---

## Section 2: Compensation (Bang luong)

### F-03: Compensation Line Type (Loai dong luong) | Employees / Payroll

| # | Atributo | Chi tiet |
|---|----------|----------|
| 1 | Nguon goc | **API** — `GET /api/payroll/compensation/:id` hoac GET danh sach luong → `compensation[].line_type` + `allowance_code` |
| 2 | Label VI | **Loai dong luong** |
| 3 | Dang gia tri nguon | `enum` `line_type` : `base` / `probation` / `allowance`; `allowance_code` la `enum` tu `/payroll/allowances/catalog` (UUID-R$7.2T catalog) |
| 4 | Dang hien thi UI | **Label catalog + display name**: `base` → "Luong co ban"; `probation` → "Thu viec"; `allowance` → "Phu cap" + [catalog label tu allowance_code, vi du "Phu cap di lai"] |
| 5 | Khi null/empty | `line_type` null → Hien thi **EM-DASH** (khong an hang); `allowance_code` null khi line_type=`allowance` → Hien thi **"Chua cap nhat"**. |

---

## Section 3: Contracts

### F-04: Contract Type (Loai hop dong) | Contracts

| # | Atributo | Chi tiet |
|---|----------|----------|
| 1 | Nguon goc | **DB** — `contracts.contract_type` |
| 2 | Label VI | **Loai hop dong** |
| 3 | Dang gia tri nguon | `enum` : `fixed_term` / `indefinite` / `HDLD_*` (cac ma hop dong dac biet bat dau bang HDLD_) |
| 4 | Dang hien thi UI | **Label catalog** quy uoc: `fixed_term` → "Co thoi han"; `indefinite` → "Khong thoi han"; `HDLD_*` → lay phan `HDLD_` + doc label tu `/contracts/types/catalog` |
| 5 | Khi null/empty | Hien thi **"Chua cap nhat"**. Khong an hang. |

### F-05: Contract History Status (Trang thai Lich su HD) | Contracts History

| # | Atributo | Chi tiet |
|---|----------|----------|
| 1 | Nguon goc | **API** — `GET /api/contracts/history` → `history[].status` |
| 2 | Label VI | **Trang thai** |
| 3 | Dang gia tri nguon | `enum` : `active` / `expired` / `terminated` |
| 4 | Dang hien thi UI | **Badge VI giong list view** — `active` → Badge xanh "Dang hieu luc"; `expired` → Badge xam "Da het han"; `terminated` → Badge do "Da cham dut" |
| 5 | Khi null/empty | Hien thi **EM-DASH**. Khong an hang. (Badge chi hien thi khi status hop le, null duoc xu ly nhu EM-DASH) |

---

## Section 4: Attendance

### F-06: Leave Type (Loai nghi phep) | Attendance — HrmApiReminders

| # | Atributo | Chi tiet |
|---|----------|----------|
| 1 | Nguon goc | **API** — `HrmApiReminders` endpoint → `leave_type` |
| 2 | Label VI | **Loai nghi phep** |
| 3 | Dang gia tri nguon | `enum` : `annual` / `LVT_01` / `LVT_*` (ma le hoi nghi le; `LVT_01` = nghi phep nam) |
| 4 | Dang hien thi UI | **Label catalog** tu `/attendance/leave-types/catalog`: `annual` / `LVT_01` → "Nghi phep nam"; `LVT_*` khac → doc tu catalog |
| 5 | Khi null/empty | Hien thi **EM-DASH**. Khong an hang. Neu ma nghi phep khong ton tai trong catalog → hien thi ma goc (vi du "LVT_02") kem ghi chu "(chua dich)". |

---

## Section 5: Recruitment

### F-07: Requisition Employment Type (Loai HD Tuyen dung) | Recruitment — Requisition

| # | Atributo | Chi tiet |
|---|----------|----------|
| 1 | Nguon goc | **API** — `GET /api/recruitment/requisitions/:id` → `requisition.employment_type` |
| 2 | Label VI | **Loai hop dong** |
| 3 | Dang gia tri nguon | `enum` : `full-time` / `full_time` (cac bien the giong nhau duoc normalize) |
| 4 | Dang hien thi UI | **Label catalog** GIA NGU quy uoc `EMPLOYMENT_TYPE_OPTIONS`: `full-time` = "Toan thoi gian"; `full_time` = "Toan thoi gian" (sau normalize) |
| 5 | Khi null/empty | Hien thi **EM-DASH**. Khong an hang. |

### F-08: Requisition Company (Don vi) | Recruitment — Detail

| # | Atributo | Chi tiet |
|---|----------|----------|
| 1 | Nguon goc | **API** — `GET /api/recruitment/:id` → `requisition.company_id` (UUID) |
| 2 | Label VI | **Don vi** |
| 3 | Dang gia tri nguon | `UUID` — FK to `companies.id` (co slug la `trsport`) |
| 4 | Dang hien thi UI | **Plain text** — display_name tu cache/catalog: API docs luon data dinh kem, ten don vi hien thi truc tiep (VD: "Xe Viet Nam") |
| 5 | Khi null/empty | Hien thi **"Chua cap nhat"**. Khong an hang. |

### F-09: Requisition Workflow Instance (Quy trinh) | Recruitment — Detail

| # | Atributo | Chi tiet |
|---|----------|----------|
| 1 | Nguon goc | **API** — `GET /api/recruitment/:id` → `workflow_instance_id` (UUID) |
| 2 | Label VI | **Quy trinh** |
| 3 | Dang gia tri nguon | `UUID` (Nullable) — FK to `rec_workflow_instances.instance_id` |
| 4 | Dang hien thi UI | **Badge / conditional**: Co UUID → hien thi badge "Da gan quy trinh" (mau xanh la #10B981); null → **AN HANG** — dong nay khong hien thi, khong hien thi EM-DASH. Neu khong muon an hang: hien thi badge xam "Chua gan quy trinh" |
| 5 | Khi null/empty | **AN HANG** (hidden row). Quy uoc: workflow_instance_id quan trong, neu chua gan thi bo qua hien thi. *Lua chon backup*: Badge xam "Chua gan quy trinh" neu khong the an hang. |

### F-10: Candidate Marital Status (Tinh trang hon nhan) | Recruitment — Candidate

| # | Atributo | Chi tiet |
|---|----------|----------|
| 1 | Nguon goc | **DB** — `recruitment_candidates.marital_status` |
| 2 | Label VI | **Tinh trang hon nhan** |
| 3 | Dang gia tri nguon | `enum` : `single` / `married` / `divorced` |
| 4 | Dang hien thi UI | **Label catalog**: `single` → "Doc than"; `married` → "Da ket hon"; `divorced` → "Da ly hon" |
| 5 | Khi null/empty | Hien thi **EM-DASH**. Khong an hang. |

### F-11: Import Stage (Giai doan nhap) | Recruitment — Import

| # | Atributo | Chi tiet |
|---|----------|----------|
| 1 | Nguon goc | **API** — `GET /api/recruitment/imports/:id` → `import.stage` (field nay dc mapping tu ben thu 3) |
| 2 | Label VI | **Giai doan** |
| 3 | Dang gia tri nguon | `enum` : `screening` / `interview` / `offer` / `onboarding` (gia tri English tu source import) |
| 4 | Dang hien thi UI | **Funnel VI label doc tu `/recruitment/funnel/catalog`**: `screening` → "Loc ho so"; `interview` → "Phong van"; `offer` → "Mo offer"; `onboarding` → "Nhan vien moi" |
| 5 | Khi null/empty | Hien thi **EM-DASH**. Khong an hang. |

---

## Section 6: Settings — Catalog

### F-12: Catalog Item Status (Trang thai muc Catalog) | Settings

| # | Atributo | Chi tiet |
|---|----------|----------|
| 1 | Nguon goc | **API** — `GET /api/settings/catalogs/:id/items` → `items[].status` |
| 2 | Label VI | **Trang thai** |
| 3 | Dang gia tri nguon | `enum` : `active` / `draft` / `archived` |
| 4 | Dang hien thi UI | **Label catalog + badge mau**: `active` → Badge xanh la "Dang dung"; `draft` → Badge xam "Nhap"; `archived` → Badge do "Da luu tru" |
| 5 | Khi null/empty | Hien thi **"Chua cap nhat"**. Khong an hang. |

---

## Section 7: Performance — Cycle

### F-13: Performance Cycle Status + Evaluator (Chu ky danh gia + Nguoi danh gia) | Performance

| # | Atributo | Chi tiet |
|---|----------|----------|
| 1 | Nguon goc | **DB** — `performance_cycles.status` + `performance_cycles.eval_employee_id` (UUID) |
| 2 | Label VI | **Trang thai chu ky** (cho status) / **Nguoi danh gia** (cho eval employee_id) |
| 3 | Dang gia tri nguon | `status` la `enum` : `draft` / `active` / `closed`; `eval_employee_id` la `UUID` FK to `employees.id` |
| 4 | Dang hien thi UI | **status**: Label catalog — `draft` → "Nhap"; `active` → "Dang mo"; `closed` → "Da dong" (badge mau). **eval_employee_id**: Plain text — hien thi ten NV tu cache nhan vien (VD: "Nguyen Van A") |
| 5 | Khi null/empty | `status` null → Hien thi **EM-DASH**. `eval_employee_id` null → Hien thi **"Chua phan cong"**. Khong an hang. |

---

## Appendix: Null/Empty Rules Summary

| Rule ID | Behavior | Dung cho truong | Khong dung cho |
|---------|----------|-----------------|----------------|
| R-EMDASH | Hien thi EM-DASH | Gender, Employment Type (unknown), Contract History Status, Leave Type, Candidate MS, Import Stage, Performance Status | — |
| R-NOT-UPDATED | Hien thi "Chua cap nhat" / "Chua phan cong" | Employment Type (null), Contract Type, Company, Catalog Status, Performance Evaluator | — |
| R-HIDE | An hang (khong hien thi dong) | Workflow Instance (null = chua gan quy trinh) | — |

---

## Appendix: UI Component Reference

| Col 4 Type | Component | Mau sac / Kieu |
|------------|-----------|----------------|
| Badge (co mau) | `<Badge color="blue">` | male, Contract History active, Catalog active, Performance active |
| Badge (xam) | `<Badge color="gray">` | other gender, Contract expired, Catalog draft, Workflow "Chua gan quy trinh" |
| Badge (do) | `<Badge color="red">` | Contract terminated, Catalog archived |
| Label catalog | `<CatalogLabel code="..." />` | Employment Type, Leave Type, Funnel Stage, Contract Type |
| Plain text | `<span>` | Company name, Evaluator name |
| Funnel VI | `<FunnelStep stage="screening">` | Import Stage — mapping qua `/recruitment/funnel/catalog` |

---

## Appendix: Sync with Catalog / Enum Sources

| Module | Catalog Path | Update Frequency | Source of Truth |
|--------|-------------|------------------|-----------------|
| Employees | `/api/catalogs/gender`, `/api/catalogs/employment-types` | Static | DB enum + Catalog table |
| Payroll | `/api/payroll/allowances/catalog` | Static | Payroll allowances table |
| Contracts | `/api/contracts/types/catalog` | Static | Contract types config |
| Attendance | `/api/attendance/leave-types/catalog` | Static | Attendance leave config |
| Recruitment | `/api/recruitment/funnel/catalog`, `/api/companies` | Static / Low | Recruitment funnel config + Companies table |
| Settings | `/api/settings/catalogs` | Dynamic | Catalog admin CRUD |
| Performance | `/api/performance/cycles` (with employee cache) | Static | Performance config + Employees cache |

