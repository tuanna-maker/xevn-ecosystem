# BE-SPEC-ORPHAN-CODE-SAMPLE-01 — hrm-api orphan label/registry sample

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-SPEC-ORPHAN-CODE-SAMPLE-01` |
| **date** | 2026-07-22 (ICT) |
| **from_role** | dev-be |
| **to_role** | pm |
| **lane** | execution (RESEARCH / inventory — **no** large refactor) |
| **ack_status** | **PASS_TO_PM** |
| **HOLD_DEPLOY** | **CẤM deploy** — local inventory only |
| **register** | `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` §4.1 |

---

## 1. Method

1. List `apps/api/hrm-api/src/**/*.ts` (exclude `*.spec.ts`) **without** `@CODE-MEMORY` or `ref_srs`.
2. Prefer files that hardcode **business VI labels**, **status/type registries**, **catalog seeds**, or **display SoT**.
3. Cross-check TechSpec `docs/hrm/TECHSPEC.md` §16 (FR-HRM-*) for nearest FR / known gap (G-DB-05/06).
4. Rank **top 15** by FE/UX blast + spec silence — not by file size alone.

**Out of scope this Task:** company-column product fix (owned by `BE-HRM-EMP-COMPANY-COL-01` — already updated registry + `hrm-company-display-name.ts`).

---

## 2. Top 15 (summary)

Full table: register **§4.1** (`G-ORPH-BE-01` … `G-ORPH-BE-15`).

| # | Path | Behavior (short) | Likely FR missing |
|---|------|------------------|-------------------|
| 1 | `tourism-fleet-catalog.ts` | VI fleet field labels seed | Beyond **FR-HRM-FL-01** list |
| 2 | `group-employee-import-catalog.ts` | Employee field catalogs + VI labels | **FR-HRM-IM-01** / SC field SoT |
| 3 | `tenant-position-catalog.ts` | Dept/position hardcode per tenant | Position SoT vs XBOS FR |
| 4 | `attendance-overview.service.ts` | Month labels + leave colors | **FR-HRM-20** chart AC |
| 5 | `employee-summary.ts` | Salary bands 15/20/30M | Salary-range FR/BR |
| 6 | `payroll-catalog.service.ts` | Default `Lương` + runtime DDL | Component catalog FR |
| 7 | `decisions.service.ts` | Free `decision_type`, default appointment | **FR-HRM-27** enum |
| 8 | `spreadsheet-kinds.ts` + validation | Kind set + EN aliases | **FR-HRM-IM-01** alias matrix |
| 9 | `operations/dto/*task*` | Priority/status enums | OP task lifecycle FR + CM |
| 10 | `update-interview-status.dto.ts` | Interview status enum | Interview state FR |
| 11 | `home/home.service.ts` | Birthday / who’s-out hub | **MOB-03** / **FR-20** sections |
| 12 | `hrm-list-scope.ts` | 5 slugs + pilot UUIDs | UUID SoT vs ADR (document) |
| 13 | `leave-balance.service.ts` | Default `annual` | Leave-type / entitlement FR |
| 14 | `xbos-catalog-workflow.bridge.ts` | Tenant WF gates hardcode | Catalog WF trigger FR |
| 15 | `catalog-extensions.service.ts` | Large mutate, no CM | **G-DB-06** annex FR |

---

## 3. G-ORPH-01 / company-col note

| Item | Status |
|------|--------|
| Legacy «Khối …» registry | **Replaced** under `BE-HRM-EMP-COMPANY-COL-01` with LE/ĐVTV display names + CODE-MEMORY |
| Residual orphan | Slug→LE map still **hardcoded** (not live XBOS LE pull) — register §4 G-ORPH-01 note |
| This Task | **Did not** re-edit company-col paths |

---

## 4. Commands / proof (local)

```text
# Files without CODE-MEMORY / ref_srs (sample): PowerShell scan under hrm-api/src
# Label/registry hits: tourism-fleet-catalog, group-employee-import-catalog,
#   tenant-position-catalog, attendance-overview, employee-summary, payroll-catalog,
#   decisions, spreadsheet-*, operations dto, interview status, home, hrm-list-scope,
#   leave-balance, xbos-catalog-workflow.bridge, catalog-extensions
```

No API deploy. No seed. No production mutate.

---

## 5. Handoff

```yaml
work_item_id: BE-SPEC-ORPHAN-CODE-SAMPLE-01
from_role: dev-be
to_role: pm
entry_criteria: SPEC-CODE TRACEABILITY AUDIT · HOLD_DEPLOY
exit_criteria: Top 15 orphans in register §4.1 + this evidence
evidence_path: docs/qa/evidence/be-spec-orphan-code-sample-01-20260722.md
ack_status: PASS_TO_PM
completion_report: |
  Closed: inventory of 15 hrm-api hardcoded label/registry orphans without CODE-MEMORY/ref_srs;
  appended SPEC_CODE_TRACEABILITY_GAP_REGISTER.md §4.1 (G-ORPH-BE-01..15).
  Residual: full CM coverage still open (TM-CODE-MEMORY-COVERAGE-01); company-col product fix
  remains on BE-HRM-EMP-COMPANY-COL-01 (not this Task); slug→LE still interim hardcode.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: PM-SPEC-ORPHAN-BE-TRIAGE-01
  Read docs/qa/evidence/be-spec-orphan-code-sample-01-20260722.md + register §4.1.
  Triage P0: G-ORPH-BE-01..03 (catalog seeds) → ba-process FR delta;
  G-ORPH-BE-07/13 enums → ba-process + optional narrow BE DTO;
  Do NOT deploy. Merge FE/MOB orphan samples when ready.
pm_dispatch_hint: BA FR deltas for fleet fields + employee import catalogs; TM coverage continues
```
