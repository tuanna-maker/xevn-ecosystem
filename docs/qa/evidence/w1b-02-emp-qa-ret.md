# Evidence — W1-B-02-EMP-QA-RET

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-02-EMP-QA-RET` |
| **parent** | `W1-B-02-EMP-QA` · `docs/qa/evidence/w1b-02-emp-qa.md` |
| **L0 entry** | `docs/qa/evidence/w1b-stack-l0-01.md` **PASS** |
| **role** | qa |
| **date** | 2026-08-03 |
| **spec_ref** | FR-UC-H01 · FR-UC-HRM-21 · API_CONTRACT §3 · OS 28 |
| **J-\*** | **J-HRM-02** (list→detail scope parity) — browser **FAIL** (HRM FE whitescreen) |
| **U65** | zero-seed · no `pnpm seed:*` · no DB fake |
| **ack_status** | `FAIL` |

## Environment

| Probe | Result |
|-------|--------|
| `pnpm run qc:fe-be-health` | **PASS** exit 0 (hrm/xbos/portal/login/employees) |
| Portal | `http://127.0.0.1:5173` |
| HRM web (Vite) | `http://127.0.0.1:8080` (`base: /hr/`) |
| APIs | `:28001` hrm · `:28002` xbos |
| Persona | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · tenant `xevn` |

## AC matrix

| # | AC | Method | Verdict |
|---|-----|--------|---------|
| 1 | GET list `company_id=main` rows have `status_label`, `department`, `job_title_label`, `display_name` | Live L1 direct `:28001` + portal proxy `:5173` | ✅ **PASS** |
| 2 | Click holding row → GET `:id?company_id=main` 2xx not 404 (J-HRM-02) | Live GET holding id **PASS**; browser click path **FAIL** (FE boot) | 🔴 **FAIL** overall (L2.5) · L1 API ✅ |
| 3 | PATCH same id `company_id=main` → 2xx + display-ready | Live PATCH direct + portal proxy | ✅ **PASS** (API) · browser UI PATCH ⬜ blocked |
| 4 | UI `job_title_label` never shows snake catalog key (— when missing) | API: `job_title_label` null, no snake leak ✅ · UI assert ⬜ blocked by whitescreen | 🟡 API PASS · UI **BLOCKED-FE** |
| 5 | FE after 2xx + F5 | Not executable — HRM root empty | 🔴 **FAIL** |

**Overall:** **FAIL** — L1 live display-ready + scope parity closed; U65 browser / J-HRM-02 blocked by HRM Vite resolve error (missing Fleet page). Per U65: **no UF 🟢**.

## L1 live evidence

Runtime JSON: `docs/qa/evidence/_tmp-w1b-02-emp-qa-ret-l1.json`

### Login

`POST :5173/api/xbos/auth/login` → **201** · token ok · membership `company=main` / `group_ceo`

### GET list (direct HRM)

`GET :28001/api/hrm/employees?company_id=main&page_size=20`  
Headers: `Authorization` + `x-tenant-id: xevn` + `x-company-id: main`

- HTTP **200** `HRM-EMP-200` · `total=42` · page `count=20`
- Keys present on rows: `display_name`, `department`, `job_title_label`, `status_label`
- Sample holding row: `id=4315dade-…` · `company_id=holding` · `display_name=QA SoftDel SD8EZ1HE` · `status_label=Đang làm việc` · `job_title_label=null` · `department=null`
- Snake leak count on labels: **0**

### GET by id (J-HRM-02 API leg)

`GET :28001/api/hrm/employees/4315dade-ef5a-4db2-99ee-f724896ffa09?company_id=main`  
→ **200** `HRM-EMP-200` · `company_id=holding` · display-ready fields present · **not 404**

### PATCH

`PATCH` same id `?company_id=main` body `{ full_name }` (noop preserve)  
→ **200** `HRM-EMP-202` · returns `display_name` / `department` / `job_title_label` / `status_label`

### Portal proxy parity

`GET/PATCH :5173/api/hrm/employees…` with same auth+tenant headers → list rows under `data.data[]` · get **200** · patch **200** `HRM-EMP-202` · same holding id.

## Browser U65 / L2.5

Runtime: `docs/qa/evidence/_tmp-w1b-02-emp-qa-ret-browser.json`  
Screen: `docs/qa/evidence/screens/w1b-02-emp-qa-ret-20260803/01-employees-list.png` (blank)

| Step | Result |
|------|--------|
| Navigate `:5173/hr/employees?portal=1&tenantId=xevn&companyId=main` | Title `UNICOM HRM` but `#root` empty |
| Navigate `:8080/hr/employees?…` | Same — Vite Internal Server Error |
| Console | `Failed to resolve import "./pages/Fleet" from "src/App.tsx". Does the file exist?` |
| Network | `GET /hr/src/App.tsx` → **500** |
| Table rows / list API from FE | **0** (app never mounts) |
| J-HRM-02 click path | **not executed** |
| FE after 2xx + F5 | **not executed** |

### Defect (opened)

| ID | Severity | Layer | Detail | Owner |
|----|----------|-------|--------|-------|
| **D-HRM-FLEET-IMPORT-01** | **P0** | App / FE | `apps/web/hrm/src/App.tsx` lazy-imports `./pages/Fleet` but **no** `apps/web/hrm/src/pages/Fleet*` on disk → Vite 500 → HRM whitescreen on all `/hr/*` including Employees | `dev-fe` |

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| R-EMP-BROWSER | P0 | U65 J-HRM-02 + FE F5 blocked until Fleet import fixed | qa retest after FE |
| R-EMP-UI-SNAKE | P1 | UI «—» when `job_title_label` null not visually confirmed (API null OK; dataset has 0 labeled titles this run) | qa after FE up |
| R-FE-BIND | P2 | Prior: FE `useEmployee` may still join `custom_fields` — optional | dev-fe |

## Defects closed this wave

None product EMP BE — L1 confirms display-ready + holding get/patch under `company_id=main`.

## Prior residuals closed

| ID | Status |
|----|--------|
| R-EMP-L1-LIVE | **CLOSED** (live GET/PATCH PASS) |
| R-EMP-BROWSER | **OPEN** — root cause shifted from stack-down → **D-HRM-FLEET-IMPORT-01** |

## Commands (repro)

```bash
pnpm run qc:fe-be-health
node scripts/qa/_tmp-w1b-02-emp-qa-ret-l1.mjs
node scripts/qa/_tmp-w1b-02-emp-qa-ret-browser.mjs
# diagnose Fleet miss:
node scripts/qa/_tmp-w1b-02-emp-diag.mjs
```

## completion_report

**Closed:** Live L1 EMP for Group CEO `company_id=main` — list display-ready fields, get-by-id holding **200** (not 404), PATCH **200** + display-ready, no snake `job_title_label` in API; U65 zero-seed; L0 health reconfirmed.

**Open / FAIL cause:** Browser U65 + J-HRM-02 cannot run — HRM FE does not boot (`./pages/Fleet` missing). Do not promote UF EMP 🟢. Dispatch `dev-fe` fix Fleet import (restore page or remove route), then QA browser retest.

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: W1-B-02-EMP-FE-FLEET-01
role: dev-fe
priority: P0
mission: Unblock HRM FE boot — App.tsx imports missing ./pages/Fleet (D-HRM-FLEET-IMPORT-01)
entry: QA FAIL docs/qa/evidence/w1b-02-emp-qa-ret.md · L1 EMP API PASS · browser whitescreen
defect: apps/web/hrm/src/App.tsx lazy Fleet → Vite "Failed to resolve import ./pages/Fleet" · no pages/Fleet*
fix: restore Fleet page (list-only FL-01) OR remove/guard route so /hr/employees mounts; must_keep Employees + EmployeeProfile + portal embed
exit: :8080/hr/employees and :5173/hr/employees render list (not blank root); READY_FOR_QA
evidence: docs/qa/evidence/w1b-02-emp-fe-fleet-01.md
forbidden: seed · change EMP BE display-ready mappers
followup_qa: W1-B-02-EMP-QA-RET2 — browser J-HRM-02 click holding → GET :id 2xx · PATCH UI/FE · no snake job_title · F5
```

## pm_dispatch_hint

`W1-B-02-EMP-FE-FLEET-01` → `dev-fe` P0 same session; do **not** re-dispatch `dev-be` for EMP display-ready (L1 PASS). After FE READY_FOR_QA → `W1-B-02-EMP-QA-RET2` browser-only.
