# P1-HRM-DQ-REC-AUDIT-01 — HRM recruitment data quality vs XBOS org

| Field | Value |
|-------|-------|
| work_item_id | P1-HRM-DQ-REC-AUDIT-01 |
| role | qa |
| env | localhost stack 2026-06-07 |
| account | ceo@xe.vn / Xevn@2026 |
| company_id | main |
| portal | http://127.0.0.1:5173/command-center/hrm/recruitment?companyId=main |
| iframe | http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main |
| verdict | **PASS_TO_PM** (GWC — see § Residual) |

## L0 — Stack health

```bash
pnpm run qc:dev-stack
# exit 0
```

| Service | Status |
|---------|--------|
| hrm-api :28001 | HTTP 200 |
| xbos-api :28002 | HTTP 200 |
| web-portal :5173 | HTTP 200 |

## L2 — Recruitment Dashboard (user screenshot retest)

**Route:** P-CC-06 embed → HRM → Dashboard tab (`Recruitment.tsx` dashboard sub-tab)

### First navigation (cold / cached bundle)

CDP iframe text probe **before hard refresh**:

| Check | Result |
|-------|--------|
| Contains `1OFFICE` | **FAIL** — dept bar chart Y-axis labels |
| Contains `Chi nhánh HCM` | **FAIL** |
| Line chart months | **FAIL** — `/2023` mock series |
| Cost KPIs | **FAIL** — hardcoded `990.000 đ`, `13.395.000 đ`, `2.756.804 đ` |
| HRM API banner | **FAIL** — `HRM API request failed (500)` (transient) |

→ Stale HRM bundle served on first iframe paint. Logged **D-HRM-DQ-REC-GWC-01**.

### After hard refresh (authoritative runtime)

CDP iframe text probe **after reload**:

| Check | Result |
|-------|--------|
| Contains `1OFFICE` | **PASS** — absent |
| Contains `Chi nhánh HCM` | **PASS** — absent |
| Line chart months | **PASS** — `08/2025 … 06/2026` (live aggregation) |
| Cost KPIs | **PASS** — `Không có dữ liệu` (no invented VND) |
| Target KPI | **PASS** — `Không có dữ liệu` (no hardcoded `86`) |
| Dept bar chart | **PASS** — label `Khác` only (no fake org names) |
| HRM API banner | **PASS** — no error banner |
| CV Ứng tuyển | 5 (live kanban scope) |

Screenshot: browser capture 2026-06-07 post-reload (no 1OFFICE / Chi nhánh HCM visible).

## XBOS org cross-check

Portal proxy GET (ceo@xe.vn, `x-company-id: main`):

### `/api/xbos/org-foundation/legal-entities` — HTTP 200

| legal_name |
|------------|
| Probe Legal Updated 1780557935819 |
| Probe Legal Updated 1780717533501 |
| Tập đoàn XeVN |
| XE TMDV |

**None match 1OFFICE or Chi nhánh HCM.**

### `/api/xbos/tenant-scope/group-member-units` — HTTP 200

| display name |
|--------------|
| Công ty Cổ phần Thương mại và Dịch vụ X.E |
| Công ty TNHH Du lịch Visun |
| QA W1 XBOS legal audit 20260606-1525 |
| Công ty TNHH X.E Việt Nam |

**None match 1OFFICE or Chi nhánh HCM.**

### HRM recruitment API (same session)

| Endpoint | HTTP | Notes |
|----------|------|-------|
| `/api/hrm/recruitment/requisitions?company_id=main` | 200 HRM-REC-200 | total **24** |
| `/api/hrm/recruitment/candidates?company_id=main` | 200 HRM-REC-200 | total **99** |

### Chart name parity note

Recruitment dept bar chart aggregates **job-posting department** via `useRecruitmentDashboard` → `aggregateCandidatesByDepartment`, **not** XBOS legal-entity names. Post-fix runtime shows **`Khác` (0)** for scoped dashboard candidates — acceptable vs mock, but **not** aligned to XBOS member-unit legal names (see P2 residual).

## Grep audit — `apps/web/hrm` mock / hardcoded chart data

### Removed (dev-fe fix — source)

| File | Prior mock | Current |
|------|------------|---------|
| `RecruitmentBarChart.tsx` | `1OFFICE`, `Chi nhánh HCM` const array | Props `data` from aggregator |
| `RecruitmentLineChart.tsx` | 2023 monthly const array | Props `data` from aggregator |
| `Recruitment.tsx` | Hardcoded VND costs + target `86` | `costSummary.hasData`, `targetHeadcount` |

Unit: `pnpm exec vitest run src/lib/recruitmentDashboardAggregator.test.ts` — **5/5 PASS** (includes `does not include hardcoded 1OFFICE mock departments`).

### Remaining mock-only widgets (inventory)

| ID | Priority | File | Mock pattern | User-visible? |
|----|----------|------|--------------|---------------|
| D-HRM-DQ-REC-P2-01 | P2 | `pages/Attendance.tsx:1656-1658` | Inline GPS locations incl. `Chi nhánh HCM` | Attendance GPS tab only |
| D-HRM-DQ-REC-P2-02 | P2 | `employee/EmployeeSkillsRadarChart.tsx:22-31` | `defaultSkillsData` static radar | Employee profile when no API skills |
| D-HRM-DQ-REC-P2-03 | P2 | Recruitment dashboard dept chart | Falls back to `Khác` — job-posting dept enrichment gap vs catalog | Recruitment dashboard |

Props-driven (not mock-only): `RecruitmentPieChart`, `CampaignFunnelChart`, `CandidateEvaluationRadarChart`, `OrgChart`, `EmployeeJobProgressChart` (derives from `jobs` prop).

## Residual / GWC

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| D-HRM-DQ-REC-GWC-01 | GWC | First iframe load served **stale bundle** with pre-fix 1OFFICE mock until hard refresh | dev-fe / devops — cache bust or HRM dev HMR |
| D-HRM-DQ-REC-P2-01 | P2 | Attendance GPS demo still hardcodes Chi nhánh HCM | dev-fe |
| D-HRM-DQ-REC-P2-02 | P2 | Employee skills radar default mock scores | dev-fe |
| D-HRM-DQ-REC-P2-03 | P2 | Dept bar chart `Khác` — enrich from job postings / HRM dept catalog vs XBOS org names | dev-fe + dev-be |

## Promotion

| AC | Status |
|----|--------|
| Recruitment dashboard — no 1OFFICE / Chi nhánh HCM fake names (post-fix runtime) | **CLOSED** |
| XBOS legal-entities contain no 1OFFICE labels | **CLOSED** |
| Mock chart grep removed from recruitment path | **CLOSED** |

**ack_status:** PASS_TO_PM

**next_owner:** pm → dev-fe (GWC cache) optional; P2 backlog non-blocking for recruitment screenshot AC
