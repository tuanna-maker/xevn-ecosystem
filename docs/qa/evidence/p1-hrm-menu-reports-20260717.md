# P1-HRM-MENU-QA-REPORTS — Báo cáo (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-REPORTS` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **env** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / Group CEO · `companyId=main` |
| **URL** | `http://14.225.217.232:8088/command-center/hrm/reports` |
| **HRM iframe** | `/hr/reports?portal=1&tenantId=xevn&companyId=main` |
| **spec_ref** | `HRM-PR-06` (đối soát lương) · `HRM-OP-04` (báo cáo tổng hợp) · program `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` |
| **U65** | zero-seed · browser-only (API probe read-only Bearer; no seed) |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **FAIL** |

---

## Verdict

**FAIL** — Menu Báo cáo **load được dữ liệu live** trên lần quan sát đầu (Tổng NV **1107**, summary **HRM-OPS-200**, payroll cost từ payslips), nhưng **không đạt** gate console + nghiệp vụ:

| Gate | Result | Note |
|------|--------|------|
| L0 tab load (lần 1) | **PASS** | Không banner ERROR / 409 / `54321` |
| L0 reload (lần sau) | **FAIL** | Banner `HRM API trả HTTP 429` (rate-limit dưới wave QA song song) |
| L2 overview KPIs | **PASS GWC** | 1107 NV · 13103 attendance records · 28833M lương — khớp summary |
| L2 tabs (recruit/contract/leave/turnover/services/tools) | **PARTIAL** | Có số live; **turnover 95 ≠ 1107**; tools empty 0 |
| Console | **FAIL** | `ReferenceError: attendanceError is not defined` |
| Network summary | **PASS** | `GET /api/hrm/operations/reports/summary?company_id=main` → **200** `HRM-OPS-200` |
| Network reconciliation | **PASS (API)** / **FAIL (FE wire)** | Probe **200** `HRM-PAY-200` — **không** được Reports page gọi trên load |
| Perf report load | **P1** | `settings-catalogs` **~3.9s**; payslips **~2.6s / ~875KB**; fan-out 7 API song song |
| L2.5 list→detail | **N/A** | Reports = aggregate tabs; không J-HRM detail row |

Screenshots:

- Portal shell (iframe loading): `docs/qa/evidence/p1-hrm-menu-reports-20260717-portal.png`
- Reload 429 banner: `docs/qa/evidence/p1-hrm-menu-reports-20260717-429.png`

---

## Click path (U65)

1. Session `ceo@xe.vn` (portal đã auth) → Command Center → HRM → **Báo cáo**
2. URL: `/command-center/hrm/reports` · iframe `companyId=main`
3. Overview KPIs quan sát được (lần 1)
4. Tab walk (Radix): Tuyển dụng / Hợp đồng / Nghỉ phép / Biến động NS / Dịch vụ nội bộ / Công cụ dụng cụ
5. Probe read-only: summary + reconciliation với session Bearer
6. Reload / soft-reload → **429** banner trên portal

---

## L2 — UI vs API (company_id=main)

### Overview (lần load thành công)

| UI card | Observed | API / source |
|---------|----------|--------------|
| Tổng nhân viên | **1107** | `GET /employees?page_size=100` → `total` (không chỉ length trang) |
| Tỷ lệ chấm công | **0%** | `useAttendanceReports` — **broken** (xem defect D1) |
| Dữ liệu chấm công | **13103** | summary `attendance_records=13103` |
| Chi phí lương | **28833M** | Sum `net_amount` từ `GET /payroll/payslips` |
| Thống kê phòng ban | **4** rồi **0** / pie «Không có dữ liệu» | `useDepartments` — employee_count filter → empty chart |

### Tabs

| Tab | Observed | Notes |
|-----|----------|-------|
| Tuyển dụng | Tổng UV **99**, đang xử lý 99 | Live from candidates API |
| Hợp đồng | Tổng **100**, sắp hết hạn **653** | `page_size=100` list vs expiring `total` — display inconsistency |
| Nghỉ phép | Tổng đơn **85** | Live leave-requests |
| Biến động NS | NV hiện tại **95** | **FAIL** vs overview **1107** — turnover built from page-1 employees only |
| Dịch vụ nội bộ | Tổng YC **50** | Matches summary `service_requests=50` |
| Công cụ dụng cụ | **0** / «Chưa có dữ liệu» | Empty state OK if API empty |

---

## Network (iframe PerformanceResourceTiming — load #1)

| Endpoint | Status | Duration | Transfer |
|----------|--------|----------|----------|
| `/api/hrm/operations/reports/summary?company_id=main` | **200** | **1636 ms** | 518 |
| `/api/hrm/payroll/payslips?company_id=main` | **200** | **2614 ms** | **875145** |
| `/api/hrm/employees?company_id=main&page_size=100` | **200** | 2040 ms | 123328 |
| `/api/hrm/contracts-insurance/contracts/expiring?…` | **200** | 2047 ms | 221510 |
| `/api/hrm/contracts-insurance/contracts?…page_size=100` | **200** | 2327 ms | 47085 |
| `/api/hrm/attendance/leave-requests?company_id=main` | **200** | 1997 ms | 54140 |
| `/api/hrm/recruitment/candidates?…page_size=100` | **200** | 1603 ms | 33122 |
| `/api/hrm/settings-catalogs` | **200** | **3953 ms** | 113222 |
| `/api/hrm/payroll/reports/reconciliation` | **not called on FE load** | — | — |

### Probe (session Bearer, read-only)

```text
GET /api/hrm/operations/reports/summary?company_id=main
→ 200 HRM-OPS-200
data: {attendance_records:13103, payroll_periods:80, job_requisitions:45, tasks:22, service_requests:50}

GET /api/hrm/payroll/reports/reconciliation?company_id=main
→ 200 HRM-PAY-200
data: {draft:10, processed:10, closed:60}
```

**HRM-PR-06 gap:** API reconciliation sống, nhưng `useReportsData` / Overview **không** gọi `getPayrollReconciliationSummary` — chi phí lương lấy từ payslips sum, không hiển thị draft/processed/closed.

---

## Console

| Severity | Message | Gate |
|----------|---------|------|
| **error** | `Error fetching attendance reports: ReferenceError: attendanceError is not defined` | **FAIL** |
| warn P0-class (dup key / 404 asset) | none observed on hooked window | — |

**Root cause (code):** `apps/web/hrm/src/hooks/useAttendanceReports.ts` L92–100 references `attendanceError` / `employeesError` / `leaveError` / `attendanceData` **without defining/fetching them** → Overview attendance rate always falls back to **0%**.

---

## Perf / scale notes (U65 + NFR)

| Observation | Class |
|-------------|-------|
| Report load fan-out: **7** HRM GETs in `Promise.all` (+ settings-catalogs, subscription) | P1 scale |
| `settings-catalogs` **>3s** | P1 perf (program threshold) |
| Payslips payload **~875KB** for overview payroll card | P1 |
| Vite module graph on cold iframe: many `/hr/src/*` scripts **>10s** under load | P1 DX/env |
| Concurrent menu QA → **HTTP 429** + portal banner | P1 NFR / gateway — blocks reload smoke |

---

## Defects (for PM dispatch)

| ID | Sev | Owner | Summary |
|----|-----|-------|---------|
| **D-HRM-RPT-ATT-REF-01** | **P0** | dev-fe | `useAttendanceReports` `ReferenceError: attendanceError is not defined` → console.error + attendance rate stuck 0% |
| **D-HRM-RPT-TURNOVER-PAGE-01** | **P1** | dev-fe | Biến động NS shows **95** NV while overview **1107** — aggregator uses `listEmployees page_size=100` body, not `total` |
| **D-HRM-RPT-RECON-WIRE-01** | **P1** | dev-fe | `HRM-PR-06` reconciliation API **200** but not wired into Reports UI |
| **D-HRM-RPT-DEPT-PIE-01** | **P2** | dev-fe | Overview «Thống kê phòng ban» pie empty despite department count card |
| **D-HRM-RPT-PERF-01** | **P1** | dev-fe / SA NFR | Fan-out + large payslips + settings-catalogs >3s; 429 under parallel load |

---

## Residual / not promoted

- Export button «Xuất» — not exercised (no mutate required for this menu).
- Tools tab empty — acceptable empty if tools-equipment API empty; confirm on FE fix wave.
- 429 under parallel full-menu QA — treat as NFR residual for `P1-HRM-NFR-1000-SA` / DevOps rate-limit policy; not sole product FAIL.

---

## Handoff

- `completion_report:` QA FAIL on Reports menu. First load proved live summary/payslips hydration (1107 / 28833M / 13103). Blockers: console ReferenceError in `useAttendanceReports`, turnover undercount (95 vs 1107), HRM-PR-06 reconciliation not on FE, P1 perf fan-out; reload hit HTTP 429 banner under concurrent wave.
- `next_owner:` **dev-fe** (then qa retest)
- `ack_status:` **PASS_TO_PM**
- `evidence_path:` `docs/qa/evidence/p1-hrm-menu-reports-20260717.md`
- `next_dispatch_prompt:` «Dev-FE `P1-HRM-MENU-QA-REPORTS` FAIL fix — (1) Repair `useAttendanceReports.ts` undefined `attendanceError`/`employeesError`/`leaveError`/`attendanceData` (wire real attendance API or remove dead throws) so Overview attendance rate ≠ always 0% and console clean; (2) Turnover report must use employee `total`/full scope not page-1 length 95 vs 1107; (3) Wire `getPayrollReconciliationSummary` into Reports for HRM-PR-06 (draft/processed/closed) or hide with AC; (4) Reduce report-load fan-out / payslips payload for overview. Evidence: `docs/qa/evidence/p1-hrm-menu-reports-20260717.md`. Exit: READY_FOR_QA → QA retest same URL `ceo@xe.vn` companyId=main, console 0 ReferenceError, turnover=overview headcount, recon visible or waived AC.»
