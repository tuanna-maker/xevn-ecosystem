# SPEC-GAP-HRM-DEC-01-TECHSPEC — BA-Data delta (2026-07-17)

| Field | Value |
|-------|--------|
| **work_item_id** | `SPEC-GAP-HRM-DEC-01-TECHSPEC` |
| **from_role** | `ba-data` |
| **to_role** | `pm` |
| **lane** | governance · `estimated_effort` 0.5d |
| **ack_status** | **PASS_TO_PM** |
| **entry** | `docs/qa/evidence/spec-gap-hrm-dec-01-20260717.md` PASS (ba-process SRS delta) |
| **executed_at** | 2026-07-17 |

## Objective

Align **TECHSPEC** embed endpoint table and **BANG_TONG_HOP** UC-HRM-27 catalog title with SRS UC-HRM-27 (live REST + Implemented-empty). Drop stale «backlog / chưa triển khai API / mock» wording for `decisions`. Keep **NOT DONE** until density + CRUD AC closed.

## Spec says / code does (before → after)

| Artifact | Before (stale) | After (delta) |
|----------|----------------|---------------|
| `docs/hrm/TECHSPEC.md` §11.2 | `decisions` grouped with `reports`, `hrm_ai`, `tasks` — «Mock; backlog BRD» | Dedicated row: `GET/POST/PATCH/DELETE /api/hrm/decisions`; **Implemented-empty**; **NOT DONE** until AC-DEC-DENSITY + AC-DEC-04 |
| `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` UC-HRM-27 | «Quyết định và báo cáo (backlog)» | «Quyết định nhân sự (Implemented-empty; fidelity open)» — aligns SRS title; reports = separate menu/UC |

## Data contract (traceability)

| Layer | Contract |
|-------|----------|
| **SRS** | `docs/hrm/SRS.md` UC-HRM-27 — BR-DEC-01..06; AC-DEC-01..04; AC-DEC-DENSITY; AC-DEC-DONE gate |
| **Matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.1/§2.2 — REST live; live-empty OK |
| **TECHSPEC** | §11.2 `decisions` row — CRUD paths + Implemented-empty + NOT DONE gate |
| **API (runtime)** | `DecisionsController` — `GET/POST/PATCH/DELETE /api/hrm/decisions`; codes `HRM-DEC-200`/`201` |
| **DB** | `public.hr_decisions` (`company_id`, `decision_type`, `employee_id` optional FK) |
| **FE** | `/hr/decisions` — empty copy `decisions.noData` «Không có quyết định nào» when `total:0` |
| **Catalog** | `decision_types` (DM §28) |

## Validation matrix (deterministic)

| ID | Condition | Rule | Expected result |
|----|-----------|------|-----------------|
| VAL-DEC-API-01 | Authorized `GET /api/hrm/decisions?company_id=` | Scope resolver same as list | **200** `HRM-DEC-200`; envelope `{ data, total }` |
| VAL-DEC-API-02 | `total:0` | Live-empty branch | **200**; `data:[]` — not 404/501 |
| VAL-DEC-API-03 | Valid body `POST /api/hrm/decisions` | Required fields per DTO | **201** `HRM-DEC-201` |
| VAL-DEC-API-04 | `GET/PATCH/DELETE /api/hrm/decisions/:id` | Same `company_id` scope as list | **200** or **404** deterministic — no list/detail scope drift |
| VAL-DEC-FE-01 | UI load, `total:0` | BR-DEC-03 | Copy «Không có quyết định nào» — **cấm** «chưa triển khai API» |
| VAL-DEC-DONE-01 | Any artifact | AC-DEC-DONE gate | **UC-HRM-27 ≠ DONE** until AC-DEC-01..04 + AC-DEC-DENSITY PASS (browser U65 for mutate) |

## Scope parity note (U19)

| Endpoint pair | Filter semantics |
|---------------|------------------|
| `GET /decisions` (list) ↔ `GET /decisions/:id` (detail) | Both use `resolveScopeContext` + `company_id`; group CEO `main` rollup per ADR scope ladder |
| UI deep link | J-HRM-DEC list→detail — **add to PROGRAM_JOURNEY_MAP when `total ≥ 1`** (N/A while empty) |

## Verification (doc-only)

- [x] Grep TECHSPEC §11.2: `decisions` no longer «Mock; backlog BRD»
- [x] TECHSPEC cites `GET/POST/PATCH/DELETE /api/hrm/decisions` + Implemented-empty + NOT DONE gate
- [x] BANG_TONG_HOP UC-HRM-27 title: no «backlog»; matches SRS «Quyết định nhân sự»
- [x] Consistent with `spec-gap-hrm-dec-01-20260717.md` (ba-process SRS delta)

## Residual (out of scope this delta)

- OpenAPI `hrm-api.yaml` decisions paths documentation (SA / Dev-BE)
- PERF-HRM-DEC-01/02 (FE coalesce list calls)
- J-HRM-DEC journey row (when non-empty list→detail)
- AC-DEC-DENSITY / AC-DEC-04 browser evidence (QA execution, U65)

## Handoff

- **completion_report:** Closed SPEC-GAP-HRM-DEC-01-TECHSPEC — TECHSPEC §11.2 `decisions` row and BANG_TONG_HOP UC-HRM-27 title aligned to live REST + Implemented-empty; NOT DONE gate explicit. No SRS/matrix rewrite (already done by ba-process). Residual: OpenAPI yaml, PERF, QA density/CRUD evidence.
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/spec-gap-hrm-dec-01-techspec-20260717.md`
- **ack_status:** `PASS_TO_PM`
- **next_dispatch_prompt:** see below

```text
work_item_id: SPEC-GAP-HRM-DEC-01-INTAKE-CLOSE
from_role: ba-data | to_role: pm
Intake PASS_TO_PM evidence docs/qa/evidence/spec-gap-hrm-dec-01-techspec-20260717.md.
Governance lane SPEC-GAP-HRM-DEC-01 closed (SRS + matrix + TECHSPEC + BANG_TONG_HOP).
1) Do NOT claim UC-HRM-27 DONE — status remains Implemented-empty until AC-DEC-DENSITY + AC-DEC-04 PASS.
2) Continue P1-HRM-FULL-MENU-QA-PROGRAM; optional Task dev-fe PERF-HRM-DEC-01 (coalesce ×2 list + defer employees page_size=100).
3) When sponsor wants fidelity: Task qa browser U65 AC-DEC-04 create on :8088 (no seed); then add J-HRM-DEC list→detail to PROGRAM_JOURNEY_MAP.md.
4) Optional SA/Dev-BE: document decisions paths in docs/api/openapi/hrm-api.yaml if missing.
```
