# BUILD-GAP-PERF-FORM-SCHEMA-01 — evidence

**work_item_id:** BUILD-GAP-PERF-FORM-SCHEMA-01  
**role:** dev-fe  
**date:** 2026-08-03  
**ack_status:** READY_FOR_QA  

## Problem

HRM `vite build` failed with missing module `@/lib/performanceFormSchema` imported by `apps/web/hrm/src/pages/Performance.tsx` (residual from BUILD-GAP-MD-PANEL-01 audit).

## Fix (restore from git `43c479a`)

| File | Action |
|------|--------|
| `apps/web/hrm/src/lib/performanceFormSchema.ts` | Restored + `@CODE-MEMORY-CHANGE` BUILD-GAP-PERF-FORM-SCHEMA-01 |
| `apps/web/hrm/src/lib/performanceFormSchema.test.ts` | Restored (E3 Zod unit tests) |
| `apps/web/hrm/src/pages/Performance.tsx` | `@CODE-MEMORY-CHANGE` only — no logic change |

**must_keep honored:** MD panel restore · Contracts/Payroll Vite · Leave/LV · AUTH/EMP/CAT — no edits outside Performance schema restore.

## Verification

### Vitest

```text
pnpm exec vitest run src/lib/performanceFormSchema.test.ts src/lib/statusMachineE3.test.ts
```

- `performanceFormSchema.test.ts`: 2 tests PASS  
- `statusMachineE3.test.ts`: PASS (Performance SM deps unchanged)

### Vite build (Performance path)

```text
cd apps/web/hrm && pnpm exec vite build
```

- **Before:** build failed on `performanceFormSchema` (Performance import).  
- **After:** transform passes Performance chain; build proceeds to **1329 modules** then fails on unrelated missing `decisionListUi` (`Decisions.tsx`) — **pre-existing, out of scope** for this work item.  
- Grep build log: **no** `performanceFormSchema` / `Performance.tsx` ENOENT.

## QA entry (PM dispatch)

- **URL:** portal embed `/hr/performance` (persona `ceo@xe.vn` / `Xevn@2026`, `company_id=main`)  
- **UF:** load tab — no Vite 500 / no «Failed to resolve import performanceFormSchema»  
- **Browser:** L2 load + empty/error states OK; **no seed** (U65)  
- **Regression:** MD panel · Contracts · Payroll · Leave routes untouched  

## Residual (not this wave)

- Full HRM production `vite build` still blocked by missing `decisionListUi` — separate work item if program needs green build.

## spec_read_ack

- srs: `docs/program/deltas/BA_ERP_E3_SRS_01_20260728.md` · FR-HRM-PERF-SM-E3-01  
- tech_spec: `docs/hrm/API_DESIGN_HRM_ERP_E3.md` §1–4  
- change_mode: FIX / restore on disk  

---

## QA verdict (BUILD-GAP-PERF-FORM-SCHEMA-01-QA · 2026-08-03)

| Check | Result |
|-------|--------|
| ack_status | **PASS_TO_PM** |
| L0 `qc:dev-stack` | 200 hrm + xbos + portal |
| Vitest re-run | 10/10 PASS |
| Browser `/hr/performance?portal=1&companyId=main` | `performance-page-e3` · no Vite overlay · no import fail |
| API | cycles + evaluations GET **200** (empty OK) |
| F5 | stable |
| must_keep MD tab | `md-settings-panel` OK |

Detail: `docs/qa/evidence/build-gap-perf-form-schema-01-qa.md` · raw JSON `_tmp-build-gap-perf-form-schema-01-browser.json`
