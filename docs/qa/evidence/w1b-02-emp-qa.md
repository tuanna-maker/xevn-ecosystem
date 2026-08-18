# Evidence — W1-B-02-EMP-QA

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-02-EMP-QA` |
| **parent** | `W1-B-02-EMP` · `docs/qa/evidence/w1b-02-emp.md` |
| **role** | qa |
| **date** | 2026-08-03 |
| **spec_ref** | FR-UC-H01 · FR-UC-HRM-21 · API_CONTRACT §3 · OS 28 |
| **J-\*** | J-HRM-02 (list→detail scope parity) — browser **not executed** (stack down) |
| **U65** | zero-seed · no DB fake · no probe-as-UF |
| **ack_status** | `PASS_TO_PM` |

## Environment

| Probe | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | **FAIL** — hrm-api `:28001` fetch failed · xbos-api `:28002` failed · portal optional failed |
| `http://127.0.0.1:28001/api/hrm` | ECONNREFUSED |
| `http://127.0.0.1:5175` / `:8088` | ECONNREFUSED |
| Account ready for live | `ceo@xe.vn` / `Xevn@2026` — **not used** (stack down) |

**Verdict layering (AC#5):** L1 unit/jest = executed · L1 live API + browser UF = **BLOCKED-STACK** (not PASS on probe-only).

## AC matrix

| # | AC | Method | Verdict |
|---|-----|--------|---------|
| 1 | GET list `company_id=main` rows include `status_label`, `department`, `job_title_label`, `display_name` | jest `employees.service.spec` display-ready list+get + mapper | ✅ **PASS** (unit) · ⬜ live GET |
| 2 | Click row → GET `:id` same `company_id=main` succeeds for holding employee (not 404) | jest `get-by-id with company_id=main finds holding row` (`company_id = ANY`) | ✅ **PASS** (unit scope parity) · ⬜ J-HRM-02 browser |
| 3 | PATCH same id under `company_id=main` → 2xx + display-ready | jest PATCH main→holding + controller `scopeContext` | ✅ **PASS** (unit) · ⬜ live PATCH |
| 4 | `job_title_label` never equals snake catalog key when label missing | jest + `employee-display` / directory «never leaks snake» → `null` | ✅ **PASS** (unit) |
| 5 | Stack down → jest EMP suites; mark L1/browser BLOCKED-STACK | this evidence | ✅ applied |

## Jest (Dev evidence path — re-run QA)

```text
pnpm --filter hrm-api exec jest src/employees/employee-display.spec.ts src/employees/employee-directory.spec.ts src/employees/employees.service.spec.ts src/employees/employees.controller.spec.ts --no-cache

→ Test Suites: 4 passed, 4 total
→ Tests:       52 passed, 52 total
→ Time:        5.73 s
→ exit 0
```

Covered cases (spot):

- list + get display-ready: `display_name` / `department` / `job_title_label` / `status_label` / `phone_number`
- `job_title_label` ≠ `LEGAL_SPECIALIST` when VI label present
- get-by-id `company_id=main` → holding row via `company_id = ANY`
- PATCH `company_id=main` updates holding + returns display-ready
- missing label → `job_title_label` **null** (not snake key)
- directory mapper no raw label leak
- controller PATCH passes `toHrmListScopeContext(tenantId)` → `{ tenantId: 'xevn' }`

## Code path audit (read-only)

| Check | Result |
|-------|--------|
| `buildEmployeeDisplayReadyFields` exposes OS 28 fields | ✅ `employee-display.ts` |
| `resolveEmployeeJobTitleLabel` rejects `looksLikeJobTitleCatalogCode` | ✅ returns `null` for snake/SCREAMING_SNAKE |
| `mapEmployee` spreads display fields | ✅ `employees.service.ts` |
| PATCH uses `scopeContext` like list/get | ✅ controller + `updateEmployee` |

## Browser / L2.5 (U65)

| Item | Status |
|------|--------|
| Portal login → HR employees → click row → detail | **BLOCKED-STACK** |
| Network GET list/detail/PATCH 2xx + FE after 2xx + F5 | **BLOCKED-STACK** |
| J-HRM-02 click path | **BLOCKED-STACK** — prior journey map ✅ not revalidated this wave |
| UF EMP 🟢 claim | **FORBIDDEN** this wave (stack was down) |

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| R-EMP-L1-LIVE | P0 gate | Live GET/PATCH `company_id=main` not exercised — needs `dev:hrm-api` + auth | qa (retest) / devops stack |
| R-EMP-BROWSER | P0 UF | U65 FE list→detail→patch not run | qa after L0 up |
| R-FE-BIND | P2 | FE `useEmployee` may still join `custom_fields` (Dev residual) — not blocking BE AC | dev-fe optional |

## Defects

None opened against BE display-ready / scope parity (unit green). No FAIL defects.

## completion_report

**Closed:** Retest W1-B-02-EMP via jest EMP suites **52/52 PASS**; AC1–4 satisfied at unit/scope-parity layer; AC5 BLOCKED-STACK applied for live L1 + browser; U65 zero-seed; evidence this file.

**Open:** Live L1 + browser J-HRM-02 / UF EMP when `:28001` + portal up — do not promote UF 🟢 until FE path.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: W1-B-02-EMP-QA-RET
role: qa
priority: P0
mission: Retest EMP live L1 + browser U65 after stack up (residual R-EMP-L1-LIVE / R-EMP-BROWSER)
entry: W1-B-02-EMP-QA PASS_TO_PM · docs/qa/evidence/w1b-02-emp-qa.md · L0 qc:dev-stack exit 0
AC:
  - login ceo@xe.vn → GET /api/hrm/employees?company_id=main rows have status_label, department, job_title_label, display_name
  - click row (holding) → GET :id?company_id=main 2xx not 404 (J-HRM-02)
  - PATCH same id company_id=main → 2xx + display-ready
  - UI job_title_label never shows snake catalog key (— when missing)
  - U65 zero-seed; FE after 2xx + F5
exit: docs/qa/evidence/w1b-02-emp-qa-ret.md · PASS_TO_PM or FAIL
forbidden: seed · probe-only UF 🟢
prereq: devops bring-up pnpm run dev:hrm-api (+ xbos-api + portal) if L0 still down
```

## pm_dispatch_hint

`W1-B-02-EMP-QA-RET` — after L0 up, QA browser+live; optional parallel `devops` stack bring-up if idle. BE wave closed at unit gate — do not re-dispatch `dev-be` unless live FAIL.
