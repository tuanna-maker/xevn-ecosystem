# QA evidence — P1-HRM-H0-H1-7-AUDIT (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H0-H1-7-AUDIT` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **FAIL_TO_PM** |
| **executed_at** | 2026-06-06 |
| **environment** | `http://localhost:5173` · `ceo@xe.vn` / `Xevn@2026` · hrm-api `:28001` · xbos-api `:28002` |
| **SoT** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.1 · `docs/program/HRM_WAVE_EXECUTION_PLAN.md` · J-HRM-01..07 |
| **persona** | Group CEO · `company_id=main` · JWT rollup |

## Executive summary

| Layer | Verdict | Notes |
|-------|---------|-------|
| **L0** `qc:dev-stack` | **PASS** | exit **0** (hrm + xbos + portal 200) |
| **L0** `qc:fe-be-health` | **PASS (after restart)** | 1st run **FAIL** — hrm-api down; restarted `pnpm run dev:hrm-api` → 8/8 PASS |
| **G-FID density** `verify:hrm:menu-density` | **PASS** | 7/7 — employees 1190, contracts ratio 0.85, insurance 1270, attendance 472, payroll periods 59, recruitment 38/55, leave 61 |
| **API menu probes** | **PASS** | 17/17 direct HRM endpoints 200 + data; portal proxy 200; J-HRM-01/02/04/05/06/07 API scope parity **PASS** |
| **Browser embed §2.1** | **FAIL** | **P0** `internal_services` iframe **404**; **P1** payroll/tasks/company/reports UI empty or mock vs seeded API |
| **L2.5 J-HRM-01..07** | **GWC** | 01/02 browser **PASS**; 07 browser **FAIL** (no payslip list); 03/04/06 partial |

**Overall:** Core employee/contract/recruitment/attendance APIs and density gate are healthy, but **SRS consumer fidelity FAIL** on several menus (empty UI + mock aggregates while Nest returns rows). **Do not promote** H1–H7 waves until P0/P1 defects closed.

---

## Commands executed

| # | Command | Exit | Result |
|---|---------|------|--------|
| 1 | `pnpm run qc:dev-stack` | **0** | L0 stack healthy |
| 2 | `pnpm run qc:fe-be-health` | **1** → **0** | 1st FAIL hrm down; after `dev:hrm-api` **8/8 PASS** |
| 3 | `pnpm run verify:hrm:menu-density` | **0** | 7/7 PASS |
| 4 | `node scripts/tmp-p1-hrm-web-audit-probe.mjs` | **0** | All menu APIs + J-HRM scope parity |
| 5 | `node scripts/tmp-p1-hrm-web-browser-audit.mjs` | **0** | Portal proxy parity |
| 6 | MCP browser — `/command-center/hrm/*` | — | Per-menu iframe audit + J-HRM click paths |

---

## Menu audit matrix (§2.1)

| Menu key | Route | API (direct) | Browser UI | SRS density | Verdict |
|----------|-------|--------------|------------|-------------|---------|
| `dashboard` | `/command-center/hrm/dashboard` | `GET /operations/reports/summary` **200** counters≈309 | KPI cards; 422 HĐ sắp hết hạn; dates **01/03/2022** on cards | counters > 0 | **PASS GWC** |
| `employees` | `…/employees` | `GET /employees` **200** total=**1107** | 100 rows visible; subtitle «100» (page size not total) | N_EMP≥1000 | **PASS** |
| `contracts` | `…/contracts` | `GET /contracts-insurance/contracts` **200** total=780 | 10+ rows; employee names linked | R≥0.85 | **PASS** |
| `insurance` | `…/insurance` | `GET /contracts-insurance/insurance` **200** total=171 | **2** table rows visible; tabs BHXH/BHYT 0 | R≥0.95 | **GWC** |
| `recruitment` | `…/recruitment` | requisitions **24**, candidates **40** | Dashboard: 86 chỉ tiêu, 5 CV | pipeline seeded | **PASS** |
| `attendance` | `…/attendance` | records **309**, leave **37** | Overview KPI (62 nghỉ tuần này) | scale OK | **PASS** |
| `payroll` | `…/payroll` | payslips **79**, periods **20** | Onboarding wizard; **TỔNG LƯƠNG 0**; no payslip table | payslip R≥0.90 | **FAIL** |
| `decisions` | `…/decisions` | No REST (deferred) | Empty «Không có quyết định» | Deferred G-FID | **NOT PROMOTED** |
| `tasks` | `…/tasks` | `GET /operations/tasks` **200** total=**17** | «Hiển thị 1-0 / **0 bản ghi**» | ≥5/company | **FAIL** |
| `internal_services` | `…/internal_services` | `GET /operations/service-requests` **200** total=**16** | iframe **404 Trang không tồn tại** (`/hr/internal_services`) | ≥10/company | **FAIL** |
| `processes` | `…/processes` | Workflow ref (read-only) | iframe empty on load (10s wait) | catalog present | **GWC** |
| `company` | `…/company` | tenant-scope via portal | «**Chưa có công ty**»; all counters **0** | ≥1 member unit | **FAIL** |
| `reports` | `…/reports` | summary **200**; reconciliation **10** | Tổng NV **95**; Chi phí lương **0M** | derived > 0 | **FAIL** |
| `settings` | `…/settings` | `GET /settings-catalogs` **200** 76 catalogs | Account tab loads (Cài đặt); catalog tab not deep-audited | ≥8 keys | **PASS GWC** |
| `guide` | `…/guide` | Static N/A | Empty on quick load | N/A | **NOT PROMOTED** |

---

## L2.5 cross-navigation (J-HRM-01..07)

| Journey | Click path | API proof | Browser | Verdict |
|---------|------------|-----------|---------|---------|
| **J-HRM-01** | P-CC-04 contracts → click «Nguyễn Văn An» | `GET /employees/{id}?company_id=main` **200** | Navigated to `/hr/employees/3796d949-…` | **PASS** |
| **J-HRM-02** | P-CC-03 employees → click row | `GET /employees/3c5aa470-…` **200** | Navigated to `/hr/employees/196ac746-…` profile | **PASS** |
| **J-HRM-03** | P-CC-04 → contract detail drawer | contracts list **200** | Action ⋯ click — no modal; list columns show HĐ detail | **GWC** |
| **J-HRM-04** | P-CC-05 insurance → employee link | insurance row → employee **200** | Name click — **no navigation** (stayed on insurance) | **GWC** |
| **J-HRM-05** | P-CC-06 recruitment → detail | candidates id `631b2e5e-…` **200** | Dashboard pipeline metrics visible | **PASS** |
| **J-HRM-06** | P-CC-07 attendance → detail | record id `c91b0581-…` **200** | Overview KPI load; record list tab not clicked | **GWC** |
| **J-HRM-07** | P-CC-08 payroll → payslip detail | payslip id `8ef206d6-…` **200** | **No payslip list** — stuck on onboarding overview | **FAIL** |

**Console/network:** No **409** / **500** / **54321** on audited loads after hrm-api restart. No HRM Sync ERROR banner on employees/contracts.

---

## Defect register

| ID | Sev | Owner | Menu / J-* | Description | Evidence |
|----|-----|-------|------------|-------------|----------|
| **D-HRM-INTSVC-404-01** | **P0** | dev-fe | `internal_services` | Embed deep link `/command-center/hrm/internal_services` maps iframe to `/hr/internal_services` → **404**; `paths.ts` expects `/hr/internal-services` | Browser iframe text «404 Trang không tồn tại»; API 16 rows |
| **D-HRM-PAY-EMPTY-01** | **P1** | dev-fe | `payroll` / **J-HRM-07** | API 79 payslips + 20 periods; UI default tab = onboarding wizard, **TỔNG LƯƠNG 0**, no payslip list/detail navigation | API probe + payroll iframe text |
| **D-HRM-TASKS-EMPTY-01** | **P1** | dev-fe | `tasks` | API 17 tasks; UI «0 bản ghi» all status tabs 0 | API + iframe |
| **D-HRM-COMPANY-EMPTY-01** | **P1** | dev-fe | `company` | Group CEO expects member units; UI «Chưa có công ty», counters 0 | iframe company page |
| **D-HRM-RPT-MOCK-01** | **P1** | dev-fe | `reports` | Reports show **95** NV + **0M** salary vs API **1107** employees / seeded payroll | iframe reports + API summary |
| **D-HRM-INS-UI-02** | P2 | dev-fe | `insurance` | UI 2 rows vs API 171 insurance records | API vs iframe row count |
| **D-HRM-DASH-DATE-01** | P2 | dev-fe | `dashboard` | HĐ sắp hết hạn cards show **01/03/2022** expiry (timestamp drift) | dashboard iframe |
| **D-HRM-J03-DRAWER-01** | P2 | dev-fe | **J-HRM-03** | Contract row action does not open drawer/modal | contracts click test |
| **D-HRM-J04-CLICK-01** | P2 | dev-fe | **J-HRM-04** | Insurance employee name click no profile navigation (API parity OK) | insurance click |
| **D-HRM-STACK-FLAKE-01** | P3 | devops | L0 | hrm-api not running at audit start — fe-be-health FAIL until `dev:hrm-api` | fe-be-health log |

---

## Not promoted (explicit)

| Item | Reason |
|------|--------|
| `decisions` | SRS/matrix: no REST API — deferred G-FID; empty UI expected |
| `guide` | Static N/A — no transactional gate |
| `hrm_ai`, `tools_equipment` | Out of §2.1 fidelity scope |
| **H1–H7 waves** | Audit FAIL — dispatch Dev fixes before wave QA retest |
| **U34 CRUD consumer sync** | Not in scope this audit slice — separate retest per menu after list hydration fixes |

---

## PM dispatch hints

1. **P0** `D-HRM-INTSVC-404-01` — fix `hrmProxyPathFromSuffix` / route map underscore → hyphen for `internal_services` (see `paths.test.ts` expected `/hr/internal-services`).
2. **P1 batch** `D-HRM-PAY-EMPTY-01`, `D-HRM-TASKS-EMPTY-01`, `D-HRM-COMPANY-EMPTY-01`, `D-HRM-RPT-MOCK-01` — wire embed views to live Nest list/aggregate APIs (stop mock/onboarding shell when `total>0`).
3. **QA retest** after fixes: full §2.1 browser matrix + J-HRM-07 payslip click + U34 spot on payroll/tasks.

---

## Handoff

- **completion_report:** Audited all 15 §2.1 HRM embed menus on localhost:5173 with L0 gates, menu-density 7/7 PASS, API probes 17/17 PASS, browser iframe audit. **FAIL_TO_PM** — 1×P0 (`internal_services` 404), 4×P1 (payroll/tasks/company/reports empty-mock vs API), J-HRM-07 browser FAIL. J-HRM-01/02 PASS with click paths. Employees/contracts/recruitment/attendance API+UI PASS.
- **next_owner:** `pm` → dispatch `dev-fe` (P0/P1) then `qa` retest
- **next_dispatch_prompt:** «Dev-FE `P1-HRM-H0-H1-7-FE-FIX` — Fix D-HRM-INTSVC-404-01 (internal_services embed 404: map `/hr/internal-services` in `hrmProxyPathFromSuffix`), D-HRM-PAY-EMPTY-01 (hydrate payroll from `/payroll/payslips` + enable J-HRM-07 list→detail), D-HRM-TASKS-EMPTY-01 (wire tasks list to `/operations/tasks`), D-HRM-COMPANY-EMPTY-01 (group CEO member units from tenant-scope), D-HRM-RPT-MOCK-01 (reports aggregates from live summary/reconciliation). Evidence: `docs/qa/evidence/p1-hrm-web-audit-20260606.md`. Exit: QA retest all §2.1 menus + J-HRM-01..07 browser click paths.»
- **evidence_path:** `docs/qa/evidence/p1-hrm-web-audit-20260606.md`
- **ack_status:** **FAIL_TO_PM**
