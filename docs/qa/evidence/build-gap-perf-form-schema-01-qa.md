# BUILD-GAP-PERF-FORM-SCHEMA-01-QA

| Field | Value |
|-------|-------|
| work_item_id | BUILD-GAP-PERF-FORM-SCHEMA-01-QA |
| dev_handoff | BUILD-GAP-PERF-FORM-SCHEMA-01 · `docs/qa/evidence/build-gap-perf-form-schema-01.md` |
| date | 2026-08-03 |
| ack_status | **PASS_TO_PM** |
| persona | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| env | portal `:5173` · hrm-api `:28001` · xbos-api `:28002` |
| u65 | zero-seed · no Performance mutate |
| harness | `scripts/qa/build-gap-perf-form-schema-01-browser.mjs` |
| raw | `docs/qa/evidence/_tmp-build-gap-perf-form-schema-01-browser.json` |
| screens | `docs/qa/evidence/screens/build-gap-perf-form-schema-01-20260803/` |

## L0

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` | hrm-api · xbos-api · portal **HTTP 200** (Windows Node exit noise — probes OK) |
| Vitest (QA re-run) | `performanceFormSchema.test.ts` + `statusMachineE3.test.ts` — **10/10 PASS** |

## Vite transform (independent of Dev)

| Probe | Status |
|-------|--------|
| `GET :5173/hr/src/lib/performanceFormSchema.ts` | **200** |
| `GET :5173/hr/src/pages/Performance.tsx` | **200** |

## UF — Performance tab load (BUILD_GAP closure)

- **URL:** `http://127.0.0.1:5173/hr/performance?portal=1&tenantId=xevn&companyId=main`
- **Click path:** API login + portal storage inject (U65) → navigate Performance embed
- **FE sau load:** `data-testid="performance-page-e3"` visible · empty states `perf-cycles-empty` + `perf-evals-empty` (honest empty OK)
- **Vite:** no overlay · no «Failed to resolve import performanceFormSchema»
- **Network:** `GET /api/hrm/performance/cycles?company_id=main` **200** · `GET /api/hrm/performance/evaluations?company_id=main` **200**
- **F5:** `performance-page-e3` still visible
- **Console / pageerror:** **[]**
- **Verdict:** 🟢 **PASS**

## must_keep spot — Settings MD tab

- **URL:** `/hr/settings?portal=1&…&companyId=main` → tab **Danh mục nghiệp vụ**
- **FE:** `md-settings-panel` + `md-bucket-tabs` visible (no regression vs BUILD-GAP-MD-PANEL-01)
- **Verdict:** 🟢 **PASS**

## L2.5 note

Wave scope = **module restore + mount** only. Full J-HRM Performance list→detail / cycle mutate not executed (PM cấm full mutate). No scope_parity defect observed on load.

## Residual

| Item | Owner | Note |
|------|-------|------|
| Full HRM `vite build` blocked by `decisionListUi` | separate BUILD_GAP | Pre-existing; out of scope this QA |
| PO-ECO TC Performance mutate matrix | future exec | PLANNED in `HRM-PERFORMANCE.md` |

## Handoff

```
completion_report: performanceFormSchema restore verified — Vite 200, browser mount E3, cycles/evals API 200, F5 stable, MD panel spot OK. No seed.
next_owner: pm
next_dispatch_prompt: PM intake BUILD-GAP-PERF-FORM-SCHEMA-01-QA PASS — close work_item on bus; optional dispatch dev-fe BUILD-GAP-DECISION-LIST-UI if program needs green HRM vite build.
evidence_path: docs/qa/evidence/build-gap-perf-form-schema-01-qa.md
ack_status: PASS_TO_PM
```
