# BUILD-GAP-DECISION-LIST-UI-01 — evidence

**work_item_id:** BUILD-GAP-DECISION-LIST-UI-01  
**role:** dev-fe  
**date:** 2026-08-03  
**ack_status:** READY_FOR_QA  

## Problem

HRM `vite build` failed after `performanceFormSchema` restore with missing module `@/lib/decisionListUi` imported by `apps/web/hrm/src/pages/Decisions.tsx` (`resolveListVisibilityAfterCreate`, `resolveCreateDialogDecisionType`).

## Fix (restore from git `43c479a`)

| File | Action |
|------|--------|
| `apps/web/hrm/src/lib/decisionListUi.ts` | `git checkout 43c479a --` + `@CODE-MEMORY-CHANGE` BUILD-GAP-DECISION-LIST-UI-01 |
| `apps/web/hrm/src/lib/decisionListUi.test.ts` | Restored from `43c479a` (UTF-8 via git checkout) |

**Import site (unchanged):** `Decisions.tsx` lines ~69–72 `@/lib/decisionListUi`.

**must_keep honored:** MD panel · `performanceFormSchema` · Contracts/Payroll · Leave — no Decisions page rewrite.

## Verification

### Vitest

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/decisionListUi.test.ts src/hooks/useDecisions.test.ts --reporter=dot
```

- `decisionListUi.test.ts`: 7 tests PASS  
- `useDecisions.test.ts`: 3 tests PASS  
- **Total:** 10/10 PASS  

### Vite build (Decisions / decisionListUi path)

```text
cd apps/web/hrm && pnpm exec vite build
```

- **Before (prior wave):** build failed ENOENT `decisionListUi` (Decisions import).  
- **After:** transform reaches **2348 modules**; **no** `decisionListUi` / `Decisions.tsx` ENOENT in log.  
- **Next blocker (out of scope):** missing `@/lib/metadataWorkflowLabel` (`MetadataQueueTab.tsx`) — separate build-gap item if program needs full green `vite build`.

## QA entry (PM dispatch)

- **URL:** portal embed `/hr/decisions` (persona `ceo@xe.vn` / `Xevn@2026`, `company_id=main`)  
- **UF:** L2 load — no Vite 500 / no «Failed to resolve import decisionListUi»  
- **L2.5:** list tab load; empty copy «Không có quyết định nào» if live-empty (U65, no seed)  
- **Regression:** Performance · MD panel · Contracts · Payroll · Leave untouched  

## Residual (not this wave)

- Full HRM production `vite build` still blocked by missing `metadataWorkflowLabel` (settings MD queue tab chain).

## spec_read_ack

- srs: `docs/hrm/SRS.md` § UC-HRM-27 / FR-HRM-27  
- tech_spec: `docs/hrm/TECHSPEC.md` §16.5 #50 · §16.9 G-DEC-01  
- change_mode: FIX / restore on disk (no Decisions logic change)

---

**next_owner:** qa  
**next_dispatch:** Browser smoke `/hr/decisions` L2 + grep DevTools for decisionListUi resolve; U65 zero-seed.
