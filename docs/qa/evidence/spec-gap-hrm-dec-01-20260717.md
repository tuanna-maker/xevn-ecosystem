# SPEC-GAP-HRM-DEC-01 — BA-Process delta (2026-07-17)

| Field | Value |
|-------|--------|
| **work_item_id** | `SPEC-GAP-HRM-DEC-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **lane** | governance · `estimated_effort` 0.5d |
| **ack_status** | **PASS_TO_PM** |
| **entry** | `docs/qa/evidence/p1-hrm-menu-decisions-20260717.md` PASS GWC |
| **executed_at** | 2026-07-17 |

## Objective

Close **stale spec** claiming decisions = mock / «chưa triển khai API» while runtime has live REST + honest live-empty UI. Keep **UC-HRM-27 NOT DONE** until density + CRUD AC explicit and evidenced.

## Spec says / code does (before → after)

| Artifact | Before (stale) | After (delta) |
|----------|----------------|---------------|
| `docs/hrm/SRS.md` UC-HRM-27 | «Hiện mock — chờ BRD»; «không claim DONE» only | Full UC: live `GET/POST/PATCH/DELETE /api/hrm/decisions`; branches H/A/E; BR-DEC-01..06; AC-DEC-01..04 + **AC-DEC-DENSITY** + **AC-DEC-DONE gate**; status **Implemented-empty · NOT DONE** |
| SRS embed API table | «Chưa có API (BRD backlog)» | `HRM-DEC-200`/`201` — Implemented-empty OK; fidelity/CRUD chưa DONE |
| Matrix §2.1 `decisions` | «Chưa có REST — mock»; empty must «chưa triển khai API» | REST CRUD; `hr_decisions`; **live-empty OK** «Không có quyết định nào»; density open |
| Matrix §2.2 `/decisions` | API **None** · Deferred | Same REST + NOT DONE until AC-DEC-DENSITY + AC-DEC-04 |
| Matrix R-FID-02 / coverage | `decisions` «no API» / deferred list | REST live; residual = density/CRUD; deferred = `tools_equipment`, `hrm_ai` |

## Business rules locked

| ID | Rule |
|----|------|
| BR-DEC-03 | `total:0` + copy «Không có quyết định nào» = **valid live-empty** — not undeployed API |
| BR-DEC-06 / AC-DEC-DONE | **Cấm** claim UC-HRM-27 DONE until AC-DEC-01..04 + AC-DEC-DENSITY PASS (browser U65 for mutate) |
| AC-DEC-DENSITY | Target ≥1 QSĐ / pilot company via FE create (U65) or sponsor-explicit bootstrap seed only — seed never promotes UF 🟢 alone |

## Out of scope this delta

- OpenAPI yaml decisions path documentation (SA / Dev-BE if missing)
- `docs/hrm/TECHSPEC.md` backlog line for `decisions` (optional follow-up)
- `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` title still says «backlog» — PM may dispatch BA catalog rename
- PERF-HRM-DEC-01/02 (execution)
- J-* journey row (N/A while empty; add when non-empty list→detail in program map)

## Verification (doc-only)

- [x] Grep SRS: no «chưa triển khai API» / «Hiện mock» under UC-HRM-27
- [x] Matrix §2.1/§2.2 decisions rows cite `/decisions` REST + live-empty OK
- [x] DONE gate explicit — empty honesty alone ≠ DONE

## Handoff

- **completion_report:** Closed SPEC-GAP-HRM-DEC-01 governance delta on SRS UC-HRM-27 + matrix §2.1/§2.2 (+ R-FID-02/coverage consistency). Live-empty validated as AC; CRUD density AC explicit; module remains **NOT DONE**. Residual catalog/TECHSPEC wording optional.
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/spec-gap-hrm-dec-01-20260717.md`
- **ack_status:** `PASS_TO_PM`
- **next_dispatch_prompt:** see below

```text
work_item_id: SPEC-GAP-HRM-DEC-01-INTAKE
from_role: ba-process | to_role: pm
Intake PASS_TO_PM evidence docs/qa/evidence/spec-gap-hrm-dec-01-20260717.md.
1) Optional same day: Task sa or ba-data — align docs/hrm/TECHSPEC.md decisions row + BANG_TONG_HOP UC-HRM-27 title (drop «backlog» → Implemented-empty / fidelity open).
2) Do NOT claim UC-HRM-27 DONE; continue P1-HRM-FULL-MENU-QA-PROGRAM. Optional Task dev-fe PERF-HRM-DEC-01 (coalesce ×2 list + defer employees page_size=100).
3) When sponsor wants fidelity: Task QA browser U65 AC-DEC-04 create on :8088 (no seed) OR defer density until FE create path exercised; then add J-HRM-DEC list→detail to PROGRAM_JOURNEY_MAP.md.
```
