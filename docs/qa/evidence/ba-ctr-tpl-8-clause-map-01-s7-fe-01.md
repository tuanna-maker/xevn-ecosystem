# QA Evidence — BA-CTR-TPL-8-CLAUSE-MAP-01-S7-FE-01

| Meta | Value |
|---|---|
| work_item_id | BA-CTR-TPL-8-CLAUSE-MAP-01-S7-FE-01 |
| date | 2026-08-18 |
| lane | dev-fe |
| ack_status | READY_FOR_QA |

## Files touched

| File | Action | Lines |
|---|---|---|
| `apps/web/hrm/src/components/contracts/ContractClauseOverrideEditor.tsx` | CREATED | 204 |
| `apps/web/hrm/src/components/contracts/ContractCreateStep2ClausePreview.tsx` | EDITED (import + 2 render sites) | 599 |
| `apps/web/hrm/src/integrations/hrmApi.ts` | APPEND (5 new functions) | 10923 |

## API functions added to hrmApi.ts

All 5 functions appended after the last existing function (`resolvePositionCompensationPolicy`):

1. `getContractBoundCodes()` — GET /api/hrm/contract-templates/bound-codes
2. `listContractClauseOverrides(templateCode)` — GET /api/hrm/contract-templates/:code/clauses
   - Note: renamed from spec's `listContractClauses` to avoid collision with existing `listContractClauses` function in the file.
3. `getContractClauseOverride(templateCode, clauseId)` — GET /api/hrm/contract-templates/:code/clauses/:id
   - Note: renamed from spec's `getContractClause` to avoid collision with existing `getContractClause` function.
4. `upsertContractClauseOverride(templateCode, clauseId, body)` — PUT /api/hrm/contract-templates/:code/clauses/:id
   - Note: renamed from spec's `upsertContractClause` to avoid collision.
5. `softDeleteContractClauseOverride(templateCode, clauseId)` — DELETE /api/hrm/contract-templates/:code/clauses/:id
   - Note: renamed from spec's `softDeleteContractClause` to avoid collision.

Pattern used: `requestHrm<T>()` — same as existing functions. Matches observed pattern in file (not fetchHrm/hrmRequest as mentioned in spec hint — actual code uses requestHrm).

## ContractClauseOverrideEditor.tsx — component behavior

- Load state: Skeleton shown while loading/idle
- Error state: banner + "Thu lai" retry button
- Ready state: Textarea (data-testid=clause-override-text) + Select (clause-override-source) + Save button (clause-override-save)
- `override_text = null` → empty textarea, placeholder "Dien tay" (no "(null)")
- `warnings[]` → Badge UI per warning, not raw JSON
- CODE-MEMORY header present per spec
- FE boundary: no DB join, no Prisma, display-ready from API response only

## ContractCreateStep2ClausePreview.tsx changes

- Import: `import { ContractClauseOverrideEditor } from '@/components/contracts/ContractClauseOverrideEditor';`
- templateCode prop: **already existed as required prop** — no prop change needed
- Render: `{templateCode ? <ContractClauseOverrideEditor templateCode={templateCode} clauseId={cl.id} /> : null}` added in:
  1. readOnly mode: inside each `<li>` after body_vi display
  2. DnD canvas mode: inside each Draggable canvas item

## tsc --noEmit result

```
Exit code: 0
stdout: (empty)
stderr: (empty)
```

tsc ran from `apps/web/hrm/` using `node_modules/.bin/tsc.CMD --noEmit`. No TypeScript errors introduced.

## TV tab hide — HOLD

**PASS_WITH_HOLD**: TV tab hide (hide composer tab when bind_count=6) deferred.
- Reason: `ContractCreateWizardDialog.tsx` is Cursor-held (forbidden_paths).
- Implementation: requires injecting `getContractBoundCodes()` into the wizard dialog and conditionally hiding the TV tab.
- Action needed: Cursor lead to implement after file is released from hold.
- getContractBoundCodes() API function is already available in hrmApi.ts.

## Backward compatibility

- templateCode was already a required prop in ContractCreateStep2ClausePreview. The guard `{templateCode ? ... : null}` handles empty-string edge cases.
- No existing exports in hrmApi.ts were removed or modified.
- No forbidden paths were touched.

## ack_status: READY_FOR_QA
