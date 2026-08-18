# P1-HRM-MENU-QA-DASHBOARD — Tổng quan (exclusive menu)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-DASHBOARD` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **env** | `http://14.225.217.232:8088` (Dev8088) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **URL** | `http://14.225.217.232:8088/command-center/hrm/dashboard` |
| **spec_ref** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.1 `dashboard` · UC-HRM-20 · program `P1-HRM-FULL-MENU-QA-PROGRAM.md` |
| **U65** | zero-seed · browser-only: login → rail **NHÂN SỰ** → menu **Tổng quan** → observe |
| **ack_status** | **FAIL_TO_PM** |
| **flag** | 🟡 |

---

## Verdict

**FAIL_TO_PM — 🟡** — L0 shell/embed OK (no ERROR banner / 409 / 54321); headcount widgets load (1107 / 1041). **Primary matrix API is not consumed by live Dashboard FE**; **`GET /employees/summary` 500 on live**; dashboard load storms list APIs + one call **>21s**.

| Gate | Result |
|------|--------|
| L0 — no ERROR banner, no 409, no 54321 | **PASS** |
| L2 — widgets/counters vs density (≥1000 NV) | **PASS** (Tổng NV **1107**, Đang làm việc **1041**) |
| Primary API `GET /operations/reports/summary` used by page | **FAIL** — **0** calls from Dashboard; UC-HRM-20 `PortalOperationsSummary` **not mounted** |
| Console error/warn (iframe hooks) | **PASS** (0 errors, 0 warns after iframe reload) |
| Network latency >3s | **FAIL P1** — `leave-requests` **21315 ms**; probe `operations/reports/summary` **10428 ms** |
| Duplicate / storm API | **FAIL P1** — `contracts` **×23**, `employees` **×12** on one dashboard load |
| Mutate | **N/A** (read-only dashboard; quick-action links only) |

Screenshots:

- `docs/qa/evidence/p1-hrm-menu-dashboard-20260717.png`
- `docs/qa/evidence/p1-hrm-menu-dashboard-top-20260717.png`

---

## Click path (U65)

1. Login `http://14.225.217.232:8088/login` as `ceo@xe.vn` / `Xevn@2026`
2. Land `/command-center`
3. Click module rail **NHÂN SỰ** → navigates `/command-center/hrm/dashboard`
4. Confirm HRM sidebar **Tổng quan** `current`
5. Re-click **Tổng quan**; observe iframe widgets + Network (Performance resource entries)
6. F5 / iframe reload; re-capture console hooks + API counts

| Item | Observed |
|------|----------|
| Portal URL | `…/command-center/hrm/dashboard` |
| HRM iframe | `…/hr/?portal=1&tenantId=xevn&companyId=main&_v=…` |
| Scope | `hrm_current_company_id=main` |
| BOD persona | Active (header) |

---

## L0 / L2 UI

| Check | Result |
|-------|--------|
| ERROR / Sync ERROR banner | **None** |
| 409 scope / `54321` | **None** |
| Empty white crash | No — quick actions + charts/stats render after settle |
| Tổng nhân viên | **1107** (≥1000 density) |
| Đang làm việc | **1041** |
| Nhân viên mới | **0** |
| Phòng ban | **4** |
| Đơn nghỉ phép chờ duyệt | **27** |
| TỔNG LƯƠNG / thuế / BH | **0 VNĐ** (all salary charts 0) |
| UC-HRM-20 title «Tổng quan HRM (UC-HRM-20)» | **Absent** (`PortalOperationsSummary` not on page) |

---

## Network (iframe Performance)

### Endpoints observed on Dashboard load (no summary)

| Path | Count | Notes |
|------|------:|-------|
| `/api/hrm/contracts-insurance/contracts` | **23** | active paginated; heavy dup |
| `/api/hrm/employees` | **12** | full list pages — not summary |
| `/api/hrm/attendance/leave-requests` | 1 | **21315 ms** |
| `/api/hrm/attendance/records` | 1 | OK |
| `/api/hrm/settings-catalogs` | 1 | OK |
| `/api/hrm/operating-units` | 1 | OK |
| `/api/hrm/company-subscription` | 1 | OK |
| `/api/hrm/operations/reports/summary` | **0** | **Primary API never called by FE** |
| `/api/hrm/employees/summary` | **0** | not used by live wire (and BE probe fails — below) |

No single resource >3s except **leave-requests (21.3s)**. Aggregate page cost dominated by employees×12 + contracts×23.

### Read-only API probe (session Bearer — not UF 🟢)

| Endpoint | Status | Latency | Body |
|----------|--------|---------|------|
| `GET /api/hrm/operations/reports/summary?company_id=main` | **200** `HRM-OPS-200` | **10428 ms** | `attendance_records=13103`, `payroll_periods=80`, `job_requisitions=45`, `tasks=22`, `service_requests=50` |
| `GET /api/hrm/employees/summary?company_id=main` | **500** `HRM-SYS-001` | **10378 ms** | `invalid input syntax for type uuid: "summary"` — live treats `summary` as `:employeeId` |

**Note:** Repo `employees.controller.ts` has `@Get('summary')` (P1-HRM-PERF-BE-01) **before** `:employeeId`, but **live :8088 behavior matches undeployed / old route order**. Local working-tree FE (`useEmployeesSummary`) is not what Network shows on live (still `/employees` pagination).

---

## Console

| Source | Result |
|--------|--------|
| iframe `console.error` / `console.warn` hooks after reload | **0 / 0** |
| window error / unhandledrejection | **0** |
| React duplicate-key | **Not observed** on dashboard (no list table) |

---

## Defects

| ID | Sev | Title | Evidence |
|----|-----|-------|----------|
| **D-DASH-01** | **P0** | Live `GET /api/hrm/employees/summary` → **500** (`uuid: "summary"`) | Probe 500; blocks PERF-FE-04 / dashboard summary path |
| **D-DASH-02** | **P1** | Dashboard **does not call** primary `GET /operations/reports/summary`; `PortalOperationsSummary` (UC-HRM-20) **not mounted** | Network count 0; UI title absent; probe proves API 200 |
| **D-DASH-03** | **P1** | `GET …/attendance/leave-requests?company_id=main` **21.3s** on dashboard load | Performance entry 21315 ms |
| **D-DASH-04** | **P1** | API storm: `contracts` **×23**, `employees` **×12** (mount/dup + listAll) | byPath counts |
| **D-DASH-05** | **P1** | Payroll widgets show **TỔNG LƯƠNG 0 VNĐ** with 1107 NV (salary ranges all 0) | UI text + counters |

---

## Spec says / code does (live :8088)

| Spec | Live |
|------|------|
| Matrix §2.1 primary `GET /operations/reports/summary` | API **exists** 200; **FE Dashboard does not call** |
| UC-HRM-20 PortalOperationsSummary tiles | Component in repo; **not rendered** on Dashboard |
| PERF summary `GET /employees/summary` | Repo has route; **live 500** as `:id` |
| Density counters >0 / NV ≥1000 | **PASS** via paginated employees aggregate |

---

## Residual / not in scope this exclusive menu

- Quick-action deep links (employees/recruitment/…) → covered by other menu QAs / J-*
- SRS UC-HRM-20 lists `employees` + `payslips` (older) vs matrix `operations/reports/summary` — **spec_gap** for BA if needed; this wave follows **program + matrix primary API**

---

## Handoff

- `ack_status`: **FAIL_TO_PM**
- `next_owner`: **pm**
- `pm_dispatch_hint`: deploy/fix **D-DASH-01** (BE summary route live) + **dev-fe** mount `PortalOperationsSummary` + stop list storm (**D-DASH-02/04**); then QA retest this work_item
