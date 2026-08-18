# BUILD-GAP-DECISION-LIST-UI-01-QA — Decisions L2 load

| Field | Value |
|-------|-------|
| work_item_id | BUILD-GAP-DECISION-LIST-UI-01-QA |
| from_role | qa |
| dev_handoff | BUILD-GAP-DECISION-LIST-UI-01 · `docs/qa/evidence/build-gap-decision-list-ui-01.md` |
| date | 2026-08-03 |
| ack_status | **PASS_TO_PM** |
| u65_zero_seed | true |
| spec_ref | UC-HRM-27 / G-DEC-01 · `decisionListUi` restore only |

## L0 / L1 (pre-browser)

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` | HRM :28001 · XBOS :28002 · portal :5173 **200** (Node UV assert on exit — checks passed) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Vitest `decisionListUi` + `useDecisions` | **10/10 PASS** (QA re-run) |

## UF — BUILD_GAP L2 `/hr/decisions` (not UC-27 DONE)

- **Persona / URL:** `ceo@xe.vn` / `Xevn@2026` · `http://127.0.0.1:5173/hr/decisions?portal=1&tenantId=xevn&companyId=main` (PM path + tenant embed)
- **Click path:** API login → portal storage inject (U65) → direct embed URL → **F5**
- **Trước mutate:** live-empty list (0 rows) — **no seed**
- **Action:** load only — no create/mutate
- **Network:** `GET /api/hrm/decisions?company_id=main` → **200** (initial + after F5); `GET /hr/src/lib/decisionListUi.ts` → **200** (no Vite 500 / no resolve failure)
- **FE sau load (SRS):** Decisions shell (type tabs, table headers, «Thêm quyết định»); honest empty **«Không có quyết định nào»** + CTA hint; **no** Vite overlay; **no** «chưa triển khai»
- **Console:** 0 `pageerror`; 0 console `error`
- **F5:** same empty copy + second GET decisions **200**; module still resolves
- **Verdict:** 🟢 **PASS**
- **spec_gap:** none for BUILD_GAP scope; full UC-27 mutate/create→list→F5 matrix **not** executed (cấm claim UC-27 DONE / UAT DONE)

## L2.5 note

Scope = **module restore + L2 load** only. No list→detail row click (live-empty). J-HRM decisions cross-nav deferred until data exists via FE mutate in a future UF wave.

## Screenshots

| File | Note |
|------|------|
| `docs/qa/evidence/screens/build-gap-decision-list-ui-01-qa/01-decisions-load.png` | First paint |
| `docs/qa/evidence/screens/build-gap-decision-list-ui-01-qa/02-decisions-after-f5.png` | After reload |

## Machine trace

- Runtime JSON: `docs/qa/evidence/_tmp-build-gap-decision-list-ui-01-qa-runtime.json`
- Script: `scripts/qa/_tmp-build-gap-decision-list-ui-01-qa-browser.mjs` (exit 0)

## Residual

| Item | Owner | Note |
|------|-------|------|
| Full HRM `vite build` — `metadataWorkflowLabel` | dev-fe (separate BUILD_GAP) | Per dev handoff; not hit on Decisions route |
| UC-27 create/edit/delete + J-HRM list→detail | future QA UF wave | Requires FE mutate U65; not this work_item |

## Handoff

```
completion_report: decisionListUi restore verified — L2 Decisions embed loads, decisionListUi.ts 200, GET decisions 200, honest empty copy, F5 stable; vitest 10/10; no UAT/UC-27 DONE claim.
next_owner: pm
next_dispatch_prompt: PM — Close BUILD-GAP-DECISION-LIST-UI-01 on bus; optional track metadataWorkflowLabel BUILD_GAP next; do not promote UC-27 or Phase1 UAT DONE from this evidence alone.
evidence_path: docs/qa/evidence/build-gap-decision-list-ui-01-qa.md
ack_status: PASS_TO_PM
```
