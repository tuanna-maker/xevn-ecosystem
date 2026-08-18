# QA-HRM-MENU-FULL-SWEEP-01 — Full AppSidebar leaf sweep (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-MENU-FULL-SWEEP-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **FAIL_TO_PM** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` (Group CEO, `companyId=main`) |
| **sponsor_lock** | U65 zero-seed · browser-only · no Phase1/PROD claim |
| **date** | 2026-07-20 |
| **env** | portal `http://127.0.0.1:5173` · HRM iframe `/hr/*?portal=1` · hrm-api `:28001` · xbos-api `:28002` |

---

## L0 entry

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` 200 · XBOS `:28002` 200 · portal `:5173` 200 |
| `pnpm run qc:fe-be-health` | **ALL PASS** (login + employees + catalog-sync + portal proxy) |
| Seed | **None** (U65) |

---

## Method

1. Session already authenticated as `ceo@xe.vn` on Command Center HRM embed.
2. Soft-nav iframe `src` for every AppSidebar leaf (`apps/web/hrm/src/components/layout/AppSidebar.tsx`).
3. Per menu: CDP read iframe `innerText` + console.error / `window.error` hook after load.
4. Deep checks: employee profile **Lương** tab (DVU-0005), recruitment sub-views, settings **Danh mục**, `/settings-catalogs`, `/employee-metadata`.

**Tech chrome patterns asserted (must be absent):** `GET /employees/summary`, `operations/reports/summary`, `UC-HRM-20`, `Nest API`, `không dùng mock`, visible `UC-HRM-*` ids, `hrm-api` data-source labels.

---

## Per-menu evidence matrix

| Menu | URL (portal / iframe) | Load OK | Console errors (Y/N + snippet) | Tech chrome visible (Y/N) | Abnormal (blank/crash/banner) | Verdict |
|------|------------------------|---------|--------------------------------|---------------------------|-------------------------------|---------|
| Dashboard `/` | `/command-center/hrm` → `/hr/?portal=1…` | Y | N | **N** (tiles: Nhân sự 1108 / Chấm công 13103 / Tuyển dụng 57 / Kỳ lương 80; title «Tổng quan HRM» only) | N — empty payroll charts show honest empty copy (no fake 0) | **PASS** |
| Employees | `/hrm/employees` → `/hr/employees…` | Y | N | N | N — list 1108 rows | **PASS** |
| Employees → profile + Lương | `/hr/employees/70275eaa-…` tab Lương | Y | N (no RangeError / Invalid time) | **Y (P2)** — badge **`API`** as `salaryGrade` | N crash; pay periods render (`Kỳ lương 05/2026 — services`); net 17.190.000 ₫ | **FAIL chrome / abnormal label** |
| Contracts | `/hr/contracts…` | Y | N | N | N — progressive load + rows | **PASS** |
| Insurance | `/hr/insurance…` | Y | N | N | N — BHYT expiry alert present (business, not error) | **PASS** |
| Decisions | `/hr/decisions…` | Y | N | N | Empty list OK («Không có quyết định nào») | **PASS** |
| Recruitment | `/hr/recruitment…` | Y | N | N on Dashboard / Yêu cầu / Thư viện JD | Dashboard funnel + Board tab present; Tin/Ứng viên are dropdown triggers — CDP submenu open flaky (buttons present) | **PASS load** (submenu deep-nav partial) |
| Attendance | `/hr/attendance…` | Y | N | N | N | **PASS** |
| Payroll | `/hr/payroll…` | Y | N | **Y (P1)** — `1834 / 1834 bản ghi — hrm-api` | N crash / no Invalid time | **FAIL chrome** |
| Performance | `/hr/performance…` | Y | N | N path/UC | **P2 UX** — cycle dates raw ISO `…T17:00:00.000Z` | **PASS load / 🟡 UX** |
| AI | `/hr/ai…` | Y | N | N | N | **PASS** |
| Tasks | `/hr/tasks…` | Y | N | N | N — counts render | **PASS** |
| Processes | `/hr/processes…` | Y | N | **Y (P2)** — empty copy cites `XBOS-DM-HRM-14` | Empty state only | **FAIL chrome** |
| Internal services | `/hr/internal-services…` | Y | N | N | N | **PASS** |
| Tools & equipment | `/hr/tools-equipment…` | Y | N | N path/UC | Placeholder «Phase 2 / API đang triển khai» (expected stub) | **PASS** (stub) |
| Company | `/hr/company…` | Y | N | N | N | **PASS** |
| Reports | `/hr/reports…` | Y | N | N | N — totals load | **PASS** |
| Settings (account) | `/hr/settings…` | Y | N | N | N | **PASS** |
| Settings → Danh mục | tab «Danh mục (XBOS + HRM)» | Y | N | N path/UC | **P2 UX** — sync stamp `2026-07-17T02:16:10.132Z` | **PASS load / 🟡 UX** |
| Settings catalogs page | `/hr/settings-catalogs` | Y | N | N | Same ISO sync stamp | **PASS load / 🟡 UX** |
| Metadata queue | `/hr/employee-metadata` | Y | N | N path/UC | Workflow ids like `xbos.employee_metadata.default` visible (P3) | **PASS load / 🟡** |

### Immediate-fail gates

| Gate | Result |
|------|--------|
| White-crash / Uncaught RangeError | **PASS** — none observed |
| Dashboard GET/ops/UC-HRM-20 / Nest mock copy | **PASS** — stripped (`PortalOperationsSummary` user-facing chrome gone) |
| HRM API Sync ERROR / unexpected 409 on load | **PASS** — none |
| Tech chrome fully gone across menus | **FAIL** — payroll `hrm-api`; processes `XBOS-DM-HRM-14`; salary badge `API` |

---

## Defect list (for PM dispatch)

| work_item_id (proposed) | Sev | Spec / location | Evidence |
|-------------------------|-----|-----------------|----------|
| `D-HRM-PAYROLL-STRIP-HRM-API-LABEL-01` | **P1** | `PayrollPayslipsApiTab.tsx` — UI string `— hrm-api`; also empty feedback copy mentions hrm-api in `Payroll.tsx` | Matrix Payroll row |
| `D-HRM-EMP-SALARY-GRADE-API-BADGE-01` | **P2** | `EmployeeSalary.tsx` `salaryGrade: 'API'` renders badge «API» | Profile Lương DVU-0005 |
| `D-HRM-PROCESSES-STRIP-XBOS-DM-CODE-01` | **P2** | Processes empty-state shows `XBOS-DM-HRM-14` | Processes row |
| `D-HRM-SETTINGS-SYNC-ISO-FORMAT-01` | **P2** | Catalogs sync line raw ISO-Z | Settings Danh mục / settings-catalogs |
| `D-HRM-PERF-CYCLE-ISO-DISPLAY-01` | **P2** | Performance cycle list raw ISO timestamps | Performance row |

Closed / must_keep from prior waves (not reopened):
- Dashboard ops tile tech chrome strip — **verified gone** this sweep.
- Employee Lương `Invalid time` / RangeError — **not reproduced**.

---

## Proposal — `USER_FLOW_OPERABILITY_MATRIX.md` (PM/BA may apply)

Add section **§ Full HRM sidebar sweep (UF-HRM-MENU-*)** — one UF per AppSidebar leaf + deep rows:

| Proposed UF-ID | Menu / journey | AC (browser) |
|----------------|----------------|--------------|
| `UF-HRM-MENU-01` | Dashboard | Load; no GET/ops/UC/Nest chrome; no Sync ERROR |
| `UF-HRM-MENU-02` | Employees list | Load; row count; open 1 profile |
| `UF-HRM-MENU-02b` | Employee → Lương | No Invalid time; no tech badge |
| `UF-HRM-MENU-03` | Contracts | Load OK |
| `UF-HRM-MENU-04` | Insurance | Load OK |
| `UF-HRM-MENU-05` | Decisions | Load OK (empty allowed) |
| `UF-HRM-MENU-06` | Recruitment (+ tabs Yêu cầu / JD / candidates) | Load; no UC-id chrome |
| `UF-HRM-MENU-07` | Attendance | Load OK |
| `UF-HRM-MENU-08` | Payroll | Load; **no `hrm-api` label** |
| `UF-HRM-MENU-09` | Performance | Load; human-readable dates |
| `UF-HRM-MENU-10` | AI | Load OK |
| `UF-HRM-MENU-11` | Tasks | Load OK |
| `UF-HRM-MENU-12` | Processes | Load; no internal DM codes |
| `UF-HRM-MENU-13` | Internal services | Load OK |
| `UF-HRM-MENU-14` | Tools & equipment | Load OK (stub allowed) |
| `UF-HRM-MENU-15` | Company | Load OK |
| `UF-HRM-MENU-16` | Reports | Load OK |
| `UF-HRM-MENU-17` | Settings + catalogs + metadata queue | Load; sync time human-readable |

Dev8088 column for this run: mostly 🟢 load; 🔴 chrome on MENU-08 / MENU-02b / MENU-12 until FE fix.

---

## completion_report

**Closed:** Full AppSidebar leaf sweep (17 leaves) under U65 browser embed as Group CEO; L0 PASS; no white-crash / RangeError / Sync ERROR; Dashboard tech chrome (GET/ops/UC-HRM-20/Nest) **confirmed gone**; employee Lương Invalid-time regression **not present**.

**Open / residual:** P1 payroll `hrm-api` label; P2 salaryGrade `API` badge; P2 processes XBOS-DM code; P2 ISO timestamps on settings sync + performance cycles. Recruitment Tin/Ứng viên dropdown deep-nav not fully exercised via CDP (buttons present; Dashboard/Yêu cầu/JD verified).

**Overall:** **FAIL_TO_PM** — load sweep mostly green, but sponsor tech-chrome exit not fully met.

---

## next_owner

`dev-fe` (P1 first) → `qa` R2 → `qc` `QC-HRM-MENU-FULL-SWEEP-01`

## next_dispatch_prompt

```text
work_item_id: D-HRM-PAYROLL-STRIP-HRM-API-LABEL-01
from_role: pm
to_role: dev-fe
lane: execution
entry_criteria: QA-HRM-MENU-FULL-SWEEP-01 FAIL chrome; U65; no seed
spec_ref: user-facing copy must not expose Nest/hrm-api data-source labels (same mandate as D-HRM-UI-STRIP-TECH-CHROME-01)
allowed_paths:
  - apps/web/hrm/src/components/payroll/PayrollPayslipsApiTab.tsx
  - apps/web/hrm/src/pages/Payroll.tsx (empty feedback body if still cites hrm-api)
  - apps/web/hrm/src/components/employee/EmployeeSalary.tsx (salaryGrade 'API' → human label or hide)
  - apps/web/hrm/src/pages/Processes.tsx (or empty-state component citing XBOS-DM-HRM-14)
exit_criteria:
  - Payroll list header has no "hrm-api" substring
  - Employee Lương tab no badge text "API"
  - Processes empty state no XBOS-DM-* code
  - vitest/i18n as needed; READY_FOR_QA
evidence_path: docs/qa/evidence/d-hrm-payroll-strip-hrm-api-label-01-20260720.md
Also batch P2 ISO format (settings sync + performance cycles) if same wave capacity.
After FE READY_FOR_QA → QA-HRM-MENU-FULL-SWEEP-01-R2 (retest FAIL rows only) → QC-HRM-MENU-FULL-SWEEP-01.
```

## ack_status

**FAIL_TO_PM**
