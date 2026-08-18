# BUILD-GAP-METADATA-WORKFLOW-LABEL-01 — evidence

**work_item_id:** BUILD-GAP-METADATA-WORKFLOW-LABEL-01  
**role:** dev-fe  
**date:** 2026-08-03  
**spec_ref:** UC-HRM-26 · docs/hrm/SRS.md §13 · MetadataQueueTab / employee-metadata queue

## Problem

After `decisionListUi` restore, `vite build` failed:

```text
Could not load .../src/lib/metadataWorkflowLabel (imported by MetadataQueueTab.tsx)
```

## Root cause

`apps/web/hrm/src/lib/metadataWorkflowLabel.ts` (and test) absent from working tree; imports remained in:

- `apps/web/hrm/src/components/settings/MetadataQueueTab.tsx` (line 55)
- `apps/web/hrm/src/hooks/useMetadataQueue.ts` (re-export)

## Fix (restore from git 43c479a)

| File | Action |
|------|--------|
| `apps/web/hrm/src/lib/metadataWorkflowLabel.ts` | Restored + `@CODE-MEMORY-CHANGE` BUILD-GAP-METADATA-WORKFLOW-LABEL-01 |
| `apps/web/hrm/src/lib/metadataWorkflowLabel.test.ts` | Restored from same commit |

**must_keep respected:** MD panel · performanceFormSchema · decisionListUi · Contracts/Payroll · Leave — no edits outside lib restore.

## Commands & results

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/metadataWorkflowLabel.test.ts src/hooks/useMetadataQueue.test.ts
# exit 0 — 8 tests passed (2 files)

pnpm run build
# metadataWorkflowLabel: RESOLVED (2344 modules transformed)
# exit 1 — next blocker (out of scope this item):
#   ENOENT src/lib/hrmCompanyEmployeeCount (CompanyManagement.tsx)
```

## Vitest summary

| Suite | Tests | Verdict |
|-------|-------|---------|
| `metadataWorkflowLabel.test.ts` | 5 | PASS |
| `useMetadataQueue.test.ts` | 3 | PASS |

## Residual (for PM / next build-gap)

- **BUILD-GAP follow-up:** restore or recreate `@/lib/hrmCompanyEmployeeCount` for `CompanyManagement.tsx` if full HRM `vite build` green is required program-wide.

## QA handoff (next)

- **UF / path:** Settings → employee-metadata / `MetadataQueueTab` — cột **Quy trình** không hiện `xbos.*`; duyệt/từ chối unchanged.
- **Persona:** group CEO `ceo@xe.vn` · U65 zero-seed · FE-only.
- **J-***: align `PROGRAM_JOURNEY_MAP.md` HRM settings / metadata queue if in-scope sprint.

## ack_status

**READY_FOR_QA** — scope of this work_item closed; full production build still blocked by unrelated missing lib (documented above).
