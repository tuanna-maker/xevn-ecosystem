# DO-REC-8088-JOBREQ-UI-EXPORT-01 — VPS module-body proof (2026-08-01)

| Field | Value |
|-------|-------|
| work_item_id | `DO-REC-8088-JOBREQ-UI-EXPORT-01` |
| program | `P-REC-E2E-13STEP-01` · `R-REC-8088-JOBREQ-UI-EXPORT-01` |
| from_role | pm → devops |
| ack_status | **READY_FOR_QA** |
| VPS | `14.225.217.232` · `/opt/xevn-ecosystem` |
| executed | 2026-08-01 (Asia/Ho_Chi_Minh) |

## Root cause (prior FAIL)

Live `:8088` Vite transform of `/hr/src/lib/jobRequisitionUi.ts` returned **200** with module body **without** `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI` (`hasExport=false`) while SoftDel EmpForm wave sat at `ba2ad5f` (ahead of export commit `1faa8b2` on disk serve path until FE recreate).

Blocks: `QA-REC-HDSD-COVERAGE-01A` + `01B` (same root cause).

## Steps executed

1. **origin verify (local):** `git fetch origin main` — HEAD `e3d41b1`; file on origin contains:
   ```ts
   export const REQUISITION_EMPTY_JD_LIBRARY_HINT_VI =
     'Chưa có JD trong thư viện — tạo JD trước, rồi quay lại chọn cho yêu cầu tuyển dụng.';
   ```
   Ship commit: `1faa8b2` (`fix(hrm): ship jobRequisitionUi JD library export for :8088`) — ancestor of `e3d41b1`. **No new commit required.**

2. **VPS audit before:** HEAD `ba2ad5f`; `:8088/hr/src/lib/jobRequisitionUi.ts` → 200 len≈3019 · `hasExport=0`.

3. **Pull:** `git pull --ff-only origin main` — `ba2ad5f` → `e3d41b1`. **No stash / no stash pop.** Disk grep: export present line 15.

4. **Recreate FE only:**  
   `docker compose --env-file .env up -d --build --force-recreate --no-deps hrm-fe portal-fe`  
   SoftDel/BH/Employees / BE: **not touched**.

5. **Probes after Vite warm (~20s).**

## Gate table

| # | Exit criteria | Result |
|---|---------------|--------|
| 1 | origin HEAD has `export` `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI` (`1faa8b2`+) | **PASS** — `e3d41b1` includes export |
| 2 | VPS ff-only + recreate hrm-fe + portal-fe | **PASS** — HEAD `e3d41b1`; containers recreated |
| 3a | `:8088` module 200 · not SPA · **CONTAINS** export | **PASS** — 200 · `text/javascript` · len=30516 · `hasExport=1` · `isHtml=0` |
| 3b | `:8080` module 200 · not SPA · **CONTAINS** export | **PASS** — path `/hr/src/lib/jobRequisitionUi.ts` (base `/hr/`) · 200 · len=30516 · `hasExport=1` · `isHtml=0` |
| 4 | Spot JobRequisitionsTab / recruitment transform | **PASS** — `/hr/src/components/recruitment/JobRequisitionsTab.tsx` 200 · not HTML · `hint` count=2; `/hr/recruitment` 200 |
| 5 | L0 `:8088` 200 | **PASS** — `8088_root:200` (`8080_root:302` SPA redirect OK) |
| 6 | evidence + READY_FOR_QA | **PASS** — this file |

### Probe snippets (VPS localhost)

```text
8088_root:200
8080_root:302
8088_mod:200 len=30516 ctype=text/javascript
hasExport_8088=1
isHtml_8088=0
8080 /hr/src/lib/jobRequisitionUi.ts -> 200 len=30516
hasExport=1
isHtml=0
FOUND /hr/src/components/recruitment/JobRequisitionsTab.tsx -> 200 html=0 hint=2
recruitment:200
HEAD=e3d41b1bdc2fe99e579b286865a613cf739abb75
```

Note: bare `/src/lib/jobRequisitionUi.ts` on `:8080` returns Vite 404 hint to visit `/hr/...` (base URL `/hr/`) — **expected**; gate uses `/hr/` path.

## Residual

- Coverage UF PASS is **QA scope** — DevOps does **not** claim `QA-REC-HDSD-COVERAGE-01A/01B` PASS.
- SoftDel / BH / Employees: OOS this WI (left at prior redeploy).

## next_owner

`qa` — parallel retest.

## next_dispatch_prompt

```text
work_item_id: QA-REC-HDSD-COVERAGE-01A-RET + QA-REC-HDSD-COVERAGE-01B-RET (PARALLEL)
from_role: pm | to_role: qa
priority: P0
entry_criteria:
- DO-REC-8088-JOBREQ-UI-EXPORT-01 READY_FOR_QA
- evidence: docs/ops/evidence/do-rec-8088-jobreq-ui-export-01-20260801.md
- VPS HEAD e3d41b1; :8088/:8080 /hr/src/lib/jobRequisitionUi.ts hasExport=1
- U65 zero-seed · browser-only · SoftDel/BH OOS
exit_criteria:
- Retest HDSD coverage 01A + 01B per prior FAIL evidence
- Prove Job Requisitions UI no missing-export; empty JD library hint path if AC requires
- evidence under docs/qa/evidence/; matrix update; PASS_TO_PM or FAIL_TO_PM with residual
cấm: seed · SoftDel/BH mutate · claim coverage PASS without browser FE path
```

## completion_report

- **Closed:** Export confirmed on origin; VPS ff-only to `e3d41b1`; hrm-fe + portal-fe force-recreate; Vite module-body proof `:8088` + `:8080` (`/hr/...`) CONTAINS `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI`; JobRequisitionsTab transform 200 with hint import; L0 `:8088` 200.
- **Open:** QA parallel RET 01A+01B for business/HDSD coverage (not claimed here).
