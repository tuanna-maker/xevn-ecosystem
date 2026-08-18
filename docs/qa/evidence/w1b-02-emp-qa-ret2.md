# Evidence — W1-B-02-EMP-QA-RET2

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-02-EMP-QA-RET2` |
| **parent** | Fleet READY `docs/qa/evidence/w1b-02-emp-fe-fleet-01.md` · prior `w1b-02-emp-qa-ret.md` |
| **role** | qa |
| **date** | 2026-08-03 |
| **startedAt** | `2026-08-03T13:23:19.393Z` |
| **finishedAt** | `2026-08-03T13:23:34.642Z` |
| **spec_ref** | FR-UC-H01 · FR-UC-HRM-21 · J-HRM-02 · HDSD Nhân viên |
| **hdsd_align** | **true** — menu/nav attempt → `/hr/employees` · case_matrix A/B/C |
| **U65** | zero-seed · no `pnpm seed:*` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **ack_status** | **FAIL** |
| **QA-IDLE-VIEWPORT** | **PASS** (not idle — 9 timestamped actions; app never mounted = product FE FAIL) |

## Environment (L0 polled this session)

| Probe | Result | at |
|-------|--------|-----|
| `:28001/api/hrm` | **200** | pre-run ~13:22Z |
| `:28002/api/xbos` | **200** | pre-run |
| `:5173` portal | **200** | pre-run |
| `:8080/hr/` HRM Vite | **200** | pre-run |
| `:5173/hr/src/App.tsx` | **200** · Fleet resolve **CLOSED** | boot probe |
| `:8080/hr/src/pages/Fleet.tsx` | **200** | boot probe |

Runtime JSON: `docs/qa/evidence/_tmp-w1b-02-emp-qa-ret2-browser.json`

## Click log (EACH action timestamped)

| # | at (UTC) | action | detail |
|---|----------|--------|--------|
| 1 | 2026-08-03T13:23:19.461Z | API_LOGIN_POST | `POST :5173/api/xbos/auth/login` |
| 2 | 2026-08-03T13:23:19.499Z | API_LOGIN_OK | HTTP **201** |
| 3 | 2026-08-03T13:23:20.220Z | NAV_GOTO_PORTAL_OR_HRM | `http://127.0.0.1:5173/` |
| 4 | 2026-08-03T13:23:23.172Z | NAV_FALLBACK_EMPLOYEES_URL | `/hr/employees?portal=1&tenantId=xevn&companyId=main` (menu miss — shell not mounted) |
| 5 | 2026-08-03T13:23:27.659Z | ASSERT_LIST_RENDER | `#root` childCount=**0** · rows=**0** |
| 6 | 2026-08-03T13:23:27.660Z | RETRY_HRM_DIRECT | `http://127.0.0.1:8080/hr/` |
| 7 | 2026-08-03T13:23:27.660Z | NAV_GOTO_PORTAL_OR_HRM | `:8080/hr/` |
| 8 | 2026-08-03T13:23:30.469Z | NAV_FALLBACK_EMPLOYEES_URL | `:8080/hr/employees?…` |
| 9 | 2026-08-03T13:23:34.642Z | ASSERT_LIST_RENDER | `#root` childCount=**0** · rows=**0** |

Screens (timestamped): `docs/qa/evidence/screens/w1b-02-emp-qa-ret2-20260803/` — `00-shell.png`, `01-employees-list.png` (blank white — mount fail, not idle sit).

## Network proof (captured)

| at | method | status | url |
|----|--------|--------|-----|
| 13:23:20.652Z | GET | 200 | `/api/xbos/auth/me` |
| 13:23:20.686Z | GET | 200 | `/api/xbos/auth/me` |
| — | GET employees | **not reached** | FE never mounted → no list/detail/PATCH from UI |

## AC matrix

| # | AC | Verdict | Evidence |
|---|-----|---------|----------|
| 1 | `/hr/employees` no whitescreen; list renders | 🔴 **FAIL** | `#root` empty on `:5173` and `:8080` |
| 2 | J-HRM-02 click holding → GET `company_id=main` 2xx + FE profile | ⬜ **BLOCKED** | cannot click rows |
| 3 | PATCH via FE → 2xx + display-ready; F5 | ⬜ **BLOCKED** | no dialog/form |
| 4 | No snake `job_title_label` in UI | ⬜ **BLOCKED** | UI not painted |

## case_matrix (required A/B/C)

| Case | Intent | Verdict | Note |
|------|--------|---------|------|
| **A fail** | validation fail — type bad/empty + Lưu | ⬜ **BLOCKED** | no form mount |
| **B success** | list→detail→PATCH→F5 | ⬜ **BLOCKED** | no table |
| **C logic** | `company_id=main` rollup detail + no snake | ⬜ **BLOCKED** | depends on B |

**No invent UF from API-only** (U65) — prior L1 PASS in `w1b-02-emp-qa-ret.md` not re-promoted here.

## Defect (opened this wave)

| ID | Severity | Layer | Detail | Owner |
|----|----------|-------|--------|-------|
| **D-HRM-FLEET-IMPORT-01** | — | FE | **CLOSED** this wave — App.tsx + Fleet.tsx **200**, no Fleet resolve error | — |
| **D-HRM-LIB-MISSING-01** | **P0** | App / FE | Vite 500: missing `@/lib/hrmDialogPortalA11y` (`dialog.tsx`) **and** `@/lib/embedWorkingContext` (`HrmOperatingUnitFilter.tsx`) — both **absent on disk** → whitescreen all `/hr/*` including Employees | `dev-fe` |

### Console excerpt (no secrets)

```
[vite] Failed to resolve import "@/lib/hrmDialogPortalA11y" from "src/components/ui/dialog.tsx"
[vite] Failed to resolve import "@/lib/embedWorkingContext" from "src/components/hrm/HrmOperatingUnitFilter.tsx"
```

Disk check: `apps/web/hrm/src/lib/hrmDialogPortalA11y.*` = **False** · `embedWorkingContext.*` = **False**.

## Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| R-EMP-BROWSER | P0 | qa after FE | J-HRM-02 + case A/B/C + F5 still open |
| R-EMP-UI-SNAKE | P1 | qa after FE | UI snake assert blocked |
| D-HRM-LIB-MISSING-01 | P0 | **dev-fe** | restore both libs (stash/git) or stub safe exports |

## completion_report

**Closed:** L0 polled PASS (hrm/xbos/portal/hrm-vite); Fleet import residual **CLOSED** (App+Fleet 200); HDSD browser attempt with **9 timestamped click/nav actions** (QA-IDLE-VIEWPORT **PASS**); login **201** + auth/me **200**; U65 zero-seed; no API-only UF invent.

**Open / FAIL:** HRM SPA still whitescreen — next missing modules `hrmDialogPortalA11y` + `embedWorkingContext`. case_matrix A/B/C and J-HRM-02 **BLOCKED**. Overall **FAIL** — do not promote UF EMP 🟢.

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: W1-B-02-EMP-FE-LIBS-01
role: dev-fe
priority: P0
mission: Unblock HRM FE boot after Fleet restore — restore missing libs D-HRM-LIB-MISSING-01
entry: QA FAIL docs/qa/evidence/w1b-02-emp-qa-ret2.md · L0 PASS · Fleet CLOSED · #root empty
defect: Vite Failed to resolve "@/lib/hrmDialogPortalA11y" (dialog.tsx) + "@/lib/embedWorkingContext" (HrmOperatingUnitFilter.tsx) — files absent on disk
fix: restore from stash/git history (prefer real modules) OR minimal stubs that export safe APIs so /hr/employees mounts; must_keep Employees + EmployeeProfile + Fleet restore + portal embed
exit: :8080/hr/employees and :5173/hr/employees render #root children + employee table (not blank); READY_FOR_QA
evidence: docs/qa/evidence/w1b-02-emp-fe-libs-01.md
forbidden: seed · EMP BE rewrite · claim UF
followup_qa: W1-B-02-EMP-QA-RET3 — HDSD menu→Nhân viên · case_matrix A fail + B success + C logic · J-HRM-02 · PATCH+F5 · no snake · click timestamps
```

## pm_dispatch_hint

`W1-B-02-EMP-FE-LIBS-01` → `dev-fe` P0 same session. Do **not** re-dispatch EMP BE (prior L1 PASS). After FE READY → `W1-B-02-EMP-QA-RET3` browser HDSD case_matrix.
