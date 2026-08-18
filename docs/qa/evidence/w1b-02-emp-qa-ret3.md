# Evidence — W1-B-02-EMP-QA-RET3

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-02-EMP-QA-RET3` |
| **parent READY** | `docs/qa/evidence/w1b-02-emp-fe-libs-01.md` |
| **prior FAIL** | `docs/qa/evidence/w1b-02-emp-qa-ret2.md` |
| **role** | qa |
| **date** | 2026-08-03 |
| **startedAt** | `2026-08-03T13:47:32.769Z` |
| **finishedAt** | `2026-08-03T13:48:00.862Z` |
| **spec_ref** | FR-UC-H01 · FR-UC-HRM-21 · J-HRM-02 · HDSD Nhân viên |
| **hdsd_align** | **true** |
| **case_matrix** | fail_deep + success_hdsd + logic_br |
| **U65** | zero-seed · no `pnpm seed:*` · no API-only UF invent |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **test_log_md** | `docs/qa/evidence/w1b-02-emp-qa-ret3-test-log.md` |
| **test_log_json** | `docs/qa/evidence/w1b-02-emp-qa-ret3-test-log.json` |
| **runtime** | `docs/qa/evidence/_tmp-w1b-02-emp-qa-ret3-browser.json` |
| **ack_status** | **FAIL** |
| **QA-IDLE-VIEWPORT** | **PASS** (20 timestamped actions; not idle sit) |

## Environment (L0 polled this session)

| Probe | Result |
|-------|--------|
| `:28001/api/hrm` | **200** |
| `:28002/api/xbos` | **200** |
| `:5173` portal | **200** |
| `:8080/hr/` HRM Vite | **200** |
| `:8080/hr/src/lib/hrmDialogPortalA11y.ts` | **200** (RET2 lib residual CLOSED for list boot) |
| `:8080/hr/src/lib/embedWorkingContext.ts` | **200** |
| `:8080/hr/src/pages/Employees.tsx` | **200** |
| `:5173/hr/src/pages/EmployeeProfile.tsx` | **500** — missing `@/components/auth/PermissionFallback` |
| `:8080/hr/src/pages/EmployeeProfile.tsx` | **500** — same |

Harness: `scripts/qa/_tmp-w1b-02-emp-qa-ret3-browser.mjs`

## hdsd_inventory (U76)

| HDSD surface | Attempted | Result |
|--------------|-----------|--------|
| Login persona Group CEO | API login via portal proxy + session inject | **201** |
| Menu / deep-link Nhân viên | Portal shell → fallback `/hr/employees?portal=1&companyId=main` | List **renders** |
| Bảng danh sách NV | Assert `#root` + `table tbody tr` | **43 rows** |
| J-HRM-02 row → hồ sơ | Click holding / SoftDel row | URL `/employees/{uuid}` · **profile whitescreen** |
| Form fail (A) | Prefer CTA create / edit + bad/empty + Lưu | **BLOCKED** — create CTA not activated; profile edit unreachable |
| Form success (B) | list→detail→PATCH→F5 | **FAIL** — no detail GET; no UI PATCH |
| Logic (C) | `company_id=main` detail + no snake label | **FAIL** — detail never loaded; list shows raw `STAFF` in CHỨC VỤ |

## Click log (EACH action timestamped)

| # | at (UTC) | action | detail |
|---|----------|--------|--------|
| 1 | 2026-08-03T13:47:32.846Z | API_LOGIN_POST | `:5173/api/xbos/auth/login` |
| 2 | 2026-08-03T13:47:32.886Z | API_LOGIN_OK | HTTP **201** |
| 3 | 2026-08-03T13:47:33.267Z | NAV_GOTO_PORTAL_OR_HRM | `http://127.0.0.1:5173/` |
| 4 | 2026-08-03T13:47:36.026Z | NAV_FALLBACK_EMPLOYEES_URL | `/hr/employees?portal=1&tenantId=xevn&companyId=main` |
| 5 | 2026-08-03T13:47:40.404Z | ASSERT_LIST_RENDER | `#root` childCount=**4** · rows=**43** |
| 6 | 2026-08-03T13:47:40.405Z | CASE_A_START | fail_deep |
| 7 | 2026-08-03T13:47:40.425Z | CASE_A_CLICK_ROW | `UAT-0201` (create CTA miss → row fallback) |
| 8 | 2026-08-03T13:47:43.xxxZ | CASE_A_SUBMIT_MISS | no dialog / Lưu |
| 9 | — | CASE_A_DONE | **FAIL** |
| 10–16 | 13:47:43–13:47:54Z | CASE_B_* | holding row → `/employees/4315dade-…` · PATCH UI miss · F5 |
| 17–20 | 13:47:54–13:48:00Z | CASE_C_* | back list → reclick row |

Screens: `docs/qa/evidence/screens/w1b-02-emp-qa-ret3-20260803/` — `00-shell`, `01-employees-list` (table OK), `03-case-a-fail`, `04-case-b-detail` (white), `06-case-b-f5` (white), `07-case-c-reopen`.

## Network proof (browser)

| method | status | url |
|--------|--------|-----|
| GET | 200 | `/api/xbos/auth/me` |
| GET | **200** | `/api/hrm/employees?company_id=main&page=1&page_size=50` · total **43** |
| GET | 200 | `/api/hrm/employees/summary?company_id=main&include_archived=true` |
| GET by id | **not reached** | FE never mounted `EmployeeProfile` → no `GET /employees/{id}?company_id=main` |
| PATCH | **not reached** | U65 — refused API-only invent |

## AC matrix

| # | AC | Verdict | Evidence |
|---|-----|---------|----------|
| 1 | `#root` not empty · employee table renders | 🟢 **PASS** | rootChild=4 · 43 rows · list GET 200 · PNG `01-employees-list` |
| 2 | J-HRM-02 list→detail · GET `company_id=main` 2xx · FE profile | 🔴 **FAIL** | URL navigates to uuid · Vite **500** `EmployeeProfile.tsx` · detail GET never fired · PNG white |
| 3A | fail — bad/empty + Lưu | 🔴 **FAIL** | no form dialog activated |
| 3B | success — list→detail→PATCH→F5 | 🔴 **FAIL** | blocked by profile mount |
| 3C | logic — no snake `job_title_label` | 🔴 **FAIL** | detail blocked; list CHỨC VỤ shows raw **STAFF** (catalog code) |

## case_matrix

| Case | Intent | Verdict | Note |
|------|--------|---------|------|
| **A fail** | validation fail — bad/empty + Lưu | 🔴 **FAIL** | create CTA not activated in harness; profile edit path whitescreen |
| **B success** | list→detail→PATCH→F5 | 🔴 **FAIL** | AC1 PASS only; AC2/3/5 FAIL |
| **C logic** | main rollup detail + no snake label | 🔴 **FAIL** | no detail body; list shows `STAFF` |

**No invent UF from API-only** (U65).

## Defects

| ID | Severity | Layer | Detail | Owner | Status |
|----|----------|-------|--------|-------|--------|
| **D-HRM-LIB-MISSING-01** | — | FE | a11y + embedWorkingContext | — | **CLOSED** this wave (list boots; libs **200**) |
| **D-HRM-EMP-PROFILE-PERM-FALLBACK-01** | **P0** | App / FE | Vite 500: `Failed to resolve import "@/components/auth/PermissionFallback" from "src/pages/EmployeeProfile.tsx"` — file **absent** under `apps/web/hrm/src/components/auth/` (folder has PermissionGate/Route only) → J-HRM-02 whitescreen | `dev-fe` | **OPEN** |
| **D-HRM-EMP-PROFILE-TABGROUPS-01** | P1 | FE | Disk also missing `apps/web/hrm/src/lib/employeeProfileTabGroups.ts` (imported by EmployeeProfile) — likely next transform fail after PermissionFallback restore | `dev-fe` | **OPEN** (latent) |

### Console / pageerror excerpt (no secrets)

```
Failed to fetch dynamically imported module: …/hr/src/pages/EmployeeProfile.tsx
[vite] Failed to resolve import "@/components/auth/PermissionFallback" from "src/pages/EmployeeProfile.tsx"
```

## Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| D-HRM-EMP-PROFILE-PERM-FALLBACK-01 | P0 | **dev-fe** | restore PermissionFallback (+ verify tabGroups) |
| R-EMP-BROWSER-J02 | P0 | qa after FE | retest J-HRM-02 + case A/B/C + F5 |
| R-EMP-UI-STAFF-RAW | P2 | qa after FE | list CHỨC VỤ shows `STAFF` — confirm display-ready mapping |

## completion_report

**Closed:** L0 PASS; FE libs wave residual for **list boot CLOSED** (`D-HRM-LIB-MISSING-01`); AC1 list render PASS on `:5173` (43 rows, GET employees `company_id=main` 200); HDSD browser with **20** timestamped clicks; idle_guard PASS; U65 zero-seed; world-standard test-log md+json written; no API-only UF invent.

**Open / FAIL:** J-HRM-02 profile mount **FAIL** (`D-HRM-EMP-PROFILE-PERM-FALLBACK-01`); case_matrix A/B/C all FAIL; no detail GET/PATCH/F5 UF 🟢.

## Handoff

- **next_owner:** `dev-fe` (then `qa` RET4)
- **ack_status:** **FAIL**
- **evidence_path:** `docs/qa/evidence/w1b-02-emp-qa-ret3.md`
- **test_log:** `docs/qa/evidence/w1b-02-emp-qa-ret3-test-log.md` + `.json`
