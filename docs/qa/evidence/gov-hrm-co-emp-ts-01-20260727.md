# GOV-HRM-CO-EMP-TS-01 — TechSpec physical contract Company headcount

| Field | Value |
|-------|--------|
| **work_item_id** | `GOV-HRM-CO-EMP-TS-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **change_mode** | ADD |
| **date** | 2026-07-27 (ICT) |
| **ack_status** | **PASS_TO_PM** |
| **U65** | No seed · no `apps/**` (docs + OpenAPI yaml only) |

## Inputs read

| Artifact | Use |
|----------|-----|
| `docs/qa/evidence/be-hrm-co-emp-count-01-20260727.md` | Live `by_company[]` Option A contract |
| `docs/qa/evidence/ba-data-hrm-co-emp-linkage-01-20260727.md` | Plane A/B bridge · VAL-CO-HC · ownership |
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-CO-EMP-01..06 | AC / BR alignment |
| `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` | `resolveHrmListScope` · five slugs |
| `docs/api/openapi/hrm-api.yaml` `EmployeeSummary` | Already had `by_company` required — SA annotated `ref_srs` |

## Delivered

### 1. `docs/hrm/TECHSPEC.md` §19 (ADD)

| § | Content |
|---|---------|
| 19.1 | Plane A vs Plane B identity table + 5-unit interim bridge |
| 19.2 | `GET /api/hrm/employees/summary` · `by_company[]` fields · main zero-fill 5 · scope_parity |
| 19.3 | FE bind: ĐVTV → `operating_slug` → `by_company[].total`; never LE UUID as query `company_id` |
| 19.4 | Error → UI «—» not silent 0 |
| 19.5 | Trace matrix FR/UC → endpoint → DTO → DB |
| 19.6 | NFR / L1–L2.5 acceptance plan |

**ref_srs locked:** `FR-HRM-CO-HC-01` / `UC-HRM-CO-01` (SRS body may still be merging — codes normative for Dev/QA).

### 2. OpenAPI note (`docs/api/openapi/hrm-api.yaml`)

- `EmployeeSummary.by_company` description → cite `GOV-HRM-CO-EMP-TS-01`, TechSpec §19, `ref_srs`, FE fail-closed rule.
- `GET /employees/summary` operation description → same pointer.

No schema shape change (BE already required `by_company`).

## Architecture decision (confirm Option A)

| Option | Verdict |
|--------|---------|
| **A** — Extend summary with `by_company[]` under same `resolveHrmListScope` | **SELECT** (live BE + OpenAPI) |
| B — N× `GET /employees?company_id=slug&page_size=1` only | Interim ops fallback only; not SoT |
| C — COUNT by LE UUID / XBOS payload | **Reject** — root cause of UI 0 |

## Residual

| Item | Owner | Note |
|------|-------|------|
| SRS body merge FR-HRM-CO-HC-01 / UC-HRM-CO-01 text | ba-process | Codes already in TechSpec/OpenAPI |
| BR-INT-05 1:1 LE↔slug refine | sa (P3) | Interim name-order map remains SoT until evidence |
| Product QA/QC wave | Already closed local per COUNT live evidence | HOLD_DEPLOY — not Phase1/PROD claim |

## Verification (docs)

- [x] TECHSPEC §19 present with all 6 mandated topics
- [x] OpenAPI cites §19 + FR/UC codes
- [x] No `apps/**` edits

## Handoff

```yaml
work_item_id: GOV-HRM-CO-EMP-TS-01
from_role: sa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/gov-hrm-co-emp-ts-01-20260727.md
completion_report: |
  Closed: ADD TECHSPEC §19 Company headcount physical contract (Plane A/B,
  summary.by_company, FE bind, error «—», FR/UC→DTO→DB matrix, ref_srs).
  OpenAPI annotated with §19 + FR-HRM-CO-HC-01 / UC-HRM-CO-01.
  Residual: BA SRS body merge if not landed; BR-INT-05 refine P3.
next_owner: pm
```
