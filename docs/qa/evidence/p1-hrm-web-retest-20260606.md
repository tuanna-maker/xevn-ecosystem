# P1-HRM-H0-H1-7-RETEST — HRM web embed after FE fix (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H0-H1-7-RETEST` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **FAIL_TO_PM** |
| **executed_at** | 2026-06-06 |
| **environment** | `http://localhost:5173` · `ceo@xe.vn` / `Xevn@2026` · hrm-api `:28001` · xbos-api `:28002` |
| **entry_evidence** | `docs/qa/evidence/p1-hrm-h1-7-fe-fix-20260606.md` (READY_FOR_QA) |
| **prior_audit** | `docs/qa/evidence/p1-hrm-web-audit-20260606.md` |
| **persona** | Group CEO · `company_id=main` · JWT rollup |

## Executive summary

| Layer | Verdict | Notes |
|-------|---------|-------|
| **L0** `qc:dev-stack` | **PASS** | exit **0** |
| **L0** `qc:fe-be-health` | **PASS** | 8/8 |
| **G-FID** `verify:hrm:menu-density` | **PASS** | 7/7 |
| **API probes** | **PASS** | 17/17 + J-HRM API scope parity |
| **Target defects (FE fix)** | **GWC** | 4/5 closed; **D-HRM-TASKS-EMPTY-01 OPEN** |
| **L2.5 J-HRM-07** | **PASS** | payslip list 79 + detail dialog |
| **§2.1 browser matrix** | **GWC** | tasks FAIL; prior-PASS menus regression OK |

**Overall:** P0 `D-HRM-INTSVC-404-01` and P1 payroll/company/reports fixes **verified CLOSED**. **Do not promote** H1–H7 until `D-HRM-TASKS-EMPTY-01` closed (`useTasks` `page_size=300` → API **400**).

---

## Commands executed

| # | Command | Exit | Result |
|---|---------|------|--------|
| 1 | `pnpm run qc:dev-stack` | **0** | L0 stack healthy |
| 2 | `pnpm run qc:fe-be-health` | **0** | 8/8 PASS |
| 3 | `pnpm run verify:hrm:menu-density` | **0** | 7/7 PASS |
| 4 | `node scripts/tmp-p1-hrm-web-audit-probe.mjs` | **0** | 17/17 API + J-HRM scope |
| 5 | `node scripts/tmp-p1-hrm-web-browser-audit.mjs` | **0** | Portal proxy parity |
| 6 | MCP browser — `/command-center/hrm/*` + `/hr/tasks` direct | — | Defect retest + §2.1 spot |

---

## Defect retest matrix

| ID | Prior sev | Retest | Browser / API evidence | Verdict |
|----|-----------|--------|------------------------|---------|
| **D-HRM-INTSVC-404-01** | P0 | Embed `/command-center/hrm/internal_services` | iframe `src=/hr/internal-services`; «Dịch vụ nội bộ» + 10+ service rows; no 404 | **CLOSED** |
| **D-HRM-PAY-EMPTY-01** | P1 | `/command-center/hrm/payroll` | «Danh sách bảng lương» **79/79** — hrm-api; no onboarding wizard / TỔNG LƯƠNG 0 | **CLOSED** |
| **J-HRM-07** | P1 | P-CC-08 payslip list → detail | Eye/detail click → dialog «Xem phiếu lương — Kỳ lương 05/2026» Nguyễn Văn An 82.340.000 ₫ | **PASS** |
| **D-HRM-TASKS-EMPTY-01** | P1 | `/command-center/hrm/tasks` + `/hr/tasks?portal=1` | UI «Tất cả (0)»; network `GET /api/hrm/operations/tasks?...page_size=**300**` → **400** (empty body); same call `page_size=100` → **200** total **17** | **OPEN** |
| **D-HRM-COMPANY-EMPTY-01** | P1 | `/command-center/hrm/company` | «Tổng công ty **5**»; member units listed (XeVN, X.E TM-DV, Visun, …) | **CLOSED** |
| **D-HRM-RPT-MOCK-01** | P1 | `/command-center/hrm/reports` | Tổng NV **1107**; Chi phí lương **1305M** (not mock 95 / 0M) | **CLOSED** |

### D-HRM-TASKS-EMPTY-01 root cause (new finding)

| Check | Result |
|-------|--------|
| `page_size=50` | HTTP **200** total 17 |
| `page_size=100` | HTTP **200** total 17 |
| `page_size=200` | HTTP **400** |
| `page_size=300` (`useTasks.ts` L114) | HTTP **400** |
| React Query on 400 | `tasks` defaults to `[]` — UI shows 0 without error banner |

**Owner:** `dev-fe` — change `page_size` to ≤100 (or paginate).

---

## §2.1 menu browser matrix (retest)

| Menu | Route | Browser UI | vs prior audit | Verdict |
|------|-------|------------|----------------|---------|
| `dashboard` | `…/dashboard` | Not re-deep-audited (P2 date drift still possible) | unchanged GWC | **PASS GWC** |
| `employees` | `…/employees` | 100 rows; employee names visible | unchanged PASS | **PASS** |
| `contracts` | `…/contracts` | Contract table + employee names | unchanged PASS | **PASS** |
| `insurance` | `…/insurance` | Not re-deep-audited (P2 row count) | unchanged GWC | **PASS GWC** |
| `recruitment` | `…/recruitment` | Dashboard 86 chỉ tiêu / 5 CV | unchanged PASS | **PASS** |
| `attendance` | `…/attendance` | Overview KPI 62 nghỉ tuần này | unchanged PASS | **PASS** |
| `payroll` | `…/payroll` | 79 payslips hydrated | was FAIL | **PASS** |
| `decisions` | `…/decisions` | Deferred / no REST | NOT PROMOTED | **NOT PROMOTED** |
| `tasks` | `…/tasks` | 0 bản ghi (API 400) | was FAIL | **FAIL** |
| `internal_services` | `…/internal_services` | 16 requests visible | was FAIL | **PASS** |
| `processes` | `…/processes` | Not re-deep-audited | unchanged GWC | **PASS GWC** |
| `company` | `…/company` | 5 member companies | was FAIL | **PASS** |
| `reports` | `…/reports` | Live aggregates 1107 / 1305M | was FAIL | **PASS** |
| `settings` | `…/settings` | Not re-deep-audited | unchanged GWC | **PASS GWC** |
| `guide` | `…/guide` | Static N/A | NOT PROMOTED | **NOT PROMOTED** |

**Console/network (spot):** No **409** / **500** / **54321** on retested loads. No HRM Sync ERROR on employees/contracts/payroll.

---

## L2.5 cross-navigation (spot)

| Journey | Retest | Verdict |
|---------|--------|---------|
| **J-HRM-07** | Payslip list → detail dialog (see above) | **PASS** |
| **J-HRM-01..06** | API probes PASS; browser not full re-click this slice (unchanged from prior PASS/GWC audit) | **GWC** — no regression signal |

---

## U34 consumer sync (spot)

| Surface | Test | Verdict |
|---------|------|---------|
| Tasks create → list without F5 | **Blocked** — list hydration FAIL | **NOT RUN** |
| Payroll tab refetch | List visible after navigation (79 rows) | **PASS GWC** |
| Company save refresh | Not exercised (read-only spot) | **NOT RUN** |

---

## Residual / not promoted

| Item | Sev | Notes |
|------|-----|-------|
| **D-HRM-TASKS-EMPTY-01** | **P1** | `page_size=300` validation — dispatch dev-fe |
| **D-HRM-INS-UI-02** | P2 | From prior audit — insurance row count |
| **D-HRM-DASH-DATE-01** | P2 | Dashboard expiry date drift |
| **D-HRM-J03/J04** | P2 | Contract drawer / insurance click nav |
| **D-HRM-PAY-I18N-01** | P3 | Status column i18n object leak in payslip table |
| **H1–H7 waves** | — | Blocked until tasks P1 closed |

---

## Handoff

- **completion_report:** Retested FE fix wave on localhost:5173. **CLOSED:** D-HRM-INTSVC-404-01, D-HRM-PAY-EMPTY-01, D-HRM-COMPANY-EMPTY-01, D-HRM-RPT-MOCK-01, **J-HRM-07** browser. **OPEN:** D-HRM-TASKS-EMPTY-01 — `useTasks` requests `page_size=300` → API 400 while UI shows 0 tasks (API has 17). L0 + density + API probes PASS. §2.1 matrix **FAIL** on tasks only.
- **next_owner:** `pm` → dispatch `dev-fe`
- **next_dispatch_prompt:** «Dev-FE `P1-HRM-H0-H1-7-TASKS-FIX` — D-HRM-TASKS-EMPTY-01: `apps/web/hrm/src/hooks/useTasks.ts` `listOperationsTasks` uses `page_size: 300` but API max is 100 (200+ → 400 HRM-VAL). Change to `page_size: 100` (or paginate). Exit: QA retest tasks browser + U34 task create list refresh. Evidence: `docs/qa/evidence/p1-hrm-web-retest-20260606.md`.»
- **evidence_path:** `docs/qa/evidence/p1-hrm-web-retest-20260606.md`
- **ack_status:** **FAIL_TO_PM**
- **pm_dispatch_hint:** `P1-HRM-H0-H1-7-TASKS-FIX` — one-line `page_size` cap in `useTasks.ts`

---

## QA tasks-fix retest — P1-HRM-H0-H1-7-TASKS-FIX (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H0-H1-7-TASKS-FIX` |
| **prior_ack** | FAIL_TO_PM (D-HRM-TASKS-EMPTY-01 OPEN) |
| **entry_evidence** | `docs/qa/evidence/p1-hrm-tasks-fix-20260606.md` (READY_FOR_QA) |
| **ack_status** | **PASS_TO_PM** — H1–H7 wave **promote** |

### Executive summary (post-fix)

| Layer | Verdict |
|-------|---------|
| L0 stack + fe-be-health | **PASS** |
| D-HRM-TASKS-EMPTY-01 | **CLOSED** — UI 17→18 rows; `page_size=100` not 300 |
| H1–H7 target defects (5/5) | **ALL CLOSED** |
| U34 task create → list refresh | **GWC** — API create + hydrate PASS; UI create hidden by PermissionGate |

### Defect retest — D-HRM-TASKS-EMPTY-01

| Check | Before (FAIL) | After (PASS) |
|-------|---------------|--------------|
| Tab count | «Tất cả (**0**)» | «Tất cả (**17**)» → **18** after API create probe |
| Network | `page_size=**300**` → **400** | `page_size=**100**` → **200** |
| Embed `/command-center/hrm/tasks` | Empty table | 10 rows/page, pagination 1/2, seed tasks visible |
| Error banner | None (silent empty) | None |

**Browser evidence:** Command Center iframe — «Hiển thị 1-10 / 17 bản ghi»; screenshot captured; after `POST` create `QA-H1-7-TASKS-RETEST-*` → «Tất cả (18)», new task row first in list.

### H1–H7 closure matrix (promote)

| ID | Prior | Retest verdict |
|----|-------|----------------|
| D-HRM-INTSVC-404-01 | CLOSED | unchanged **CLOSED** |
| D-HRM-PAY-EMPTY-01 | CLOSED | unchanged **CLOSED** |
| D-HRM-COMPANY-EMPTY-01 | CLOSED | unchanged **CLOSED** |
| D-HRM-RPT-MOCK-01 | CLOSED | unchanged **CLOSED** |
| J-HRM-07 | PASS | unchanged **PASS** |
| **D-HRM-TASKS-EMPTY-01** | OPEN | **CLOSED** |

**H1–H7 wave:** **PROMOTE** — all P0/P1 target defects from FE-fix wave closed.

### Residual (not blocking promote)

| Item | Sev | Notes |
|------|-----|-------|
| U34 UI create button | — | Hidden by `PermissionGate` in embed; API create + list hydrate OK |
| D-HRM-INS-UI-02 | P2 | Prior audit |
| D-HRM-DASH-DATE-01 | P2 | Prior audit |
| D-HRM-J03/J04 | P2 | Prior audit |
| D-HRM-PAY-I18N-01 | P3 | Prior audit |
| QA-created task row | — | `QA-H1-7-TASKS-RETEST-1780753350919` left in seed (18 total) |

### Handoff

- **completion_report:** Retested `P1-HRM-H0-H1-7-TASKS-FIX` on localhost:5173. **D-HRM-TASKS-EMPTY-01 CLOSED** — tasks tab shows 17 rows (18 after create probe); `page_size=100` returns 200; no 400 on load. All H1–H7 FE-fix target defects closed. U34 UI create not available (PermissionGate); API create + list hydrate PASS.
- **next_owner:** `pm` → `qc` (H1–H7 gate) or sprint close
- **next_dispatch_prompt:** «QC gate P1-HRM-H0-H1-7 — H1–H7 wave promoted by QA. Verify L2 §2.1 tasks row PASS + residual P2 list in `p1-hrm-web-retest-20260606.md`. Evidence: `docs/qa/evidence/p1-hrm-web-retest-20260606.md` § QA tasks-fix retest. Account `ceo@xe.vn` / `company_id=main`.»
- **evidence_path:** `docs/qa/evidence/p1-hrm-web-retest-20260606.md`
- **ack_status:** **PASS_TO_PM**
