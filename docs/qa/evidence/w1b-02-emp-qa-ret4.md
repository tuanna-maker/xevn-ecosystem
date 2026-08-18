# Evidence — W1-B-02-EMP-QA-RET4

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-02-EMP-QA-RET4` |
| **parent READY** | `docs/qa/evidence/w1b-02-emp-fe-profile-01.md` |
| **prior FAIL** | `docs/qa/evidence/w1b-02-emp-qa-ret3.md` |
| **role** | qa |
| **date** | 2026-08-03 |
| **startedAt** | `2026-08-03T14:02:12.314Z` |
| **finishedAt** | `2026-08-03T14:02:48.708Z` |
| **spec_ref** | FR-UC-H01 · FR-UC-HRM-21 · J-HRM-02 · HDSD Nhân viên |
| **hdsd_align** | **true** |
| **case_matrix** | fail_deep + success_hdsd + logic_br |
| **U65** | zero-seed · no `pnpm seed:*` · no API-only UF invent |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **test_log_md** | `docs/qa/evidence/w1b-02-emp-qa-ret4-test-log.md` |
| **test_log_json** | `docs/qa/evidence/w1b-02-emp-qa-ret4-test-log.json` |
| **runtime** | `docs/qa/evidence/_tmp-w1b-02-emp-qa-ret4-browser.json` |
| **harness** | `scripts/qa/_tmp-w1b-02-emp-qa-ret4-browser.mjs` |
| **ack_status** | **PASS_TO_PM** |
| **QA-IDLE-VIEWPORT** | **PASS** (24 timestamped actions) |

## Environment (L0 at run start)

| Probe | Result |
|-------|--------|
| `:28001/api/hrm` | **200** |
| `:28002/api/xbos` | **200** |
| `:5173` portal | **200** (during run) |
| `:8080/hr/` HRM Vite | **200** |
| `:8080|:5173/hr/src/pages/EmployeeProfile.tsx` | **200** · no resolve fail |
| `PermissionFallback.tsx` · `employeeProfileTabGroups.ts` · ViDateField · CompensationPanel | **200** |

## hdsd_inventory (U76)

| HDSD surface | Attempted | Result |
|--------------|-----------|--------|
| Login persona Group CEO | API login via portal proxy + session inject | **201** |
| Menu / deep-link Nhân viên | Portal → fallback `/hr/employees?portal=1&companyId=main` | List **renders** |
| Bảng danh sách NV | `#root` + `table tbody tr` | **43 rows** · rootChild=**4** |
| J-HRM-02 row → hồ sơ | Click SoftDel/holding row | Profile mounts · tabs Chung/Công việc/Hợp đồng/Lương · GET by id **200** |
| Form fail (A) | `hdsd-employees-create-btn` → clear name → Lưu/Thêm | validation UI · **no** success mutate |
| Form success (B) | profile → Chỉnh sửa → `#full_name` ·RET4 → **Cập nhật** → F5 | PATCH **200** `HRM-EMP-202` · F5 GET **200** |
| Logic (C) | `company_id=main` detail holding row · no snake label on profile | detail `company_id=holding` under query `main` · snake UI **PASS** |

## Click log (EACH action timestamped)

| # | at (UTC) | action | detail |
|---|----------|--------|--------|
| 1 | 2026-08-03T14:02:12.412Z | API_LOGIN_POST | `:5173/api/xbos/auth/login` |
| 2 | 2026-08-03T14:02:12.454Z | API_LOGIN_OK | HTTP **201** |
| 3 | 2026-08-03T14:02:12.880Z | NAV_GOTO_PORTAL_OR_HRM | `http://127.0.0.1:5173/` |
| 4 | 2026-08-03T14:02:15.679Z | NAV_FALLBACK_EMPLOYEES_URL | `/hr/employees?portal=1&tenantId=xevn&companyId=main` |
| 5 | 2026-08-03T14:02:20.124Z | ASSERT_LIST_RENDER | `#root` childCount=**4** · rows=**43** |
| 6–11 | 14:02:20–14:02:25Z | CASE_A_* | create dialog · clear name · Lưu · Hủy → **PASS** |
| 12–20 | 14:02:25–14:02:41Z | CASE_B_* | row → profile → edit → full_name → Cập nhật PATCH 200 → F5 → **PASS** |
| 21–24 | 14:02:41–14:02:48Z | CASE_C_* | list → reclick row → **PASS** |

Screens: `docs/qa/evidence/screens/w1b-02-emp-qa-ret4-20260803/` — `00-shell` … `07-case-c-reopen` (**9** PNGs on disk).

## Network proof (browser)

| method | status | url | note |
|--------|--------|-----|------|
| POST | **201** | `/api/xbos/auth/login` | Group CEO |
| GET | **200** | `/api/hrm/employees?company_id=main&page=1&page_size=50` | total **43** |
| GET | **200** | `/api/hrm/employees/4315dade-…?company_id=main` | detail · `company_id=holding` · `HRM-EMP-200` |
| PATCH | **200** | `/api/hrm/employees/4315dade-…` | UI Cập nhật · `display_name` …`·RET4` · `HRM-EMP-202` |
| GET | **200** | same id `?company_id=main` after F5 / reopen | persistence |

Console / pageerror: **0** resolve / PermissionFallback errors.

## AC matrix

| # | AC | Verdict | Evidence |
|---|-----|---------|----------|
| 1 | `#root` + employee table rows | 🟢 **PASS** | rootChild=4 · 43 rows · list GET 200 |
| 2 | J-HRM-02 list→detail · GET `company_id=main` 2xx · FE profile | 🟢 **PASS** | `/employees/4315dade-…` · profile tabs · detail GET **200** |
| 3A | fail — empty/invalid + Lưu | 🟢 **PASS** | create dialog · validationUi · no success POST/PATCH |
| 3B / 4 | success — PATCH via FE → 2xx + display-ready · F5 | 🟢 **PASS** | PATCH 200 · `display_name`/`status_label` · F5 GET 200 |
| 5 / C | no snake `job_title_label` on profile when missing · main detail OK | 🟢 **PASS** | API `job_title_label=null` · snakeUiFiltered=[] · holding under `main` |

## case_matrix

| Case | Intent | Verdict | Note |
|------|--------|---------|------|
| **A fail** | validation fail — empty required + Lưu | 🟢 **PASS** | `hdsd-employees-create-btn` + form dialog |
| **B success** | list→detail→PATCH→F5 | 🟢 **PASS** | full_name via FE **Cập nhật** (phone catalog-gated; dept=picker) |
| **C logic** | main rollup detail + no snake label | 🟢 **PASS** | scope + profile UI |

**No invent UF from API-only** (U65).

## Defects

| ID | Severity | Layer | Detail | Owner | Status |
|----|----------|-------|--------|-------|--------|
| **D-HRM-EMP-PROFILE-PERM-FALLBACK-01** | P0 | FE | Vite missing PermissionFallback → whitescreen | — | **CLOSED** (FE-PROFILE-01 + RET4 browser) |
| **D-HRM-EMP-PROFILE-TABGROUPS-01** | P1 | FE | missing tabGroups / transitive deps | — | **CLOSED** |
| **R-EMP-UI-STAFF-RAW** | P2 | FE/BE display | List API sample still returns `job_title_label: "STAFF"` (catalog code) for some rows — **not** snake `_` form; profile missing label OK (null, no snake in UI) | defer | **OPEN** (non-blocking this wave) |

## Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| R-EMP-UI-STAFF-RAW | P2 | PM triage / display wave | List CHỨC VỤ may show raw `STAFF` — separate from J-HRM-02 profile AC |
| Portal `:5173` | ops | devops if next wave | Post-run poll may show portal DOWN — retest wave had live `:5173` |

## completion_report

**Closed:** L0 PASS at run; FE-PROFILE-01 residuals CLOSED for profile mount; AC1 list PASS; **J-HRM-02 PASS**; case_matrix A/B/C **PASS**; PATCH via FE + F5 PASS; U65 zero-seed; idle_guard PASS (24 clicks); world-standard test-log md+json written; 9 screens on disk.

**Open:** P2 list `STAFF` display residual only — does **not** block this UF/J-HRM-02 wave.

## Handoff

- **next_owner:** `pm` (then `qc` if gate wave)
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/w1b-02-emp-qa-ret4.md`
- **test_log:** `docs/qa/evidence/w1b-02-emp-qa-ret4-test-log.md` + `.json`
