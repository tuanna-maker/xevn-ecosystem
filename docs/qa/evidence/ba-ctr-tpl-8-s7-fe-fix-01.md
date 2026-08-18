# Evidence: BA-CTR-TPL-8-S7-FE-FIX-01

**Date:** 2026-08-18  
**WorkItem:** BA-CTR-TPL-8-S7-FE-FIX-01  
**Lane:** dev-fe  
**ack_status:** READY_FOR_QA

---

## Fix 1 — hrmApi.ts: getContractBoundCodes safe defaults

**File:** `apps/web/hrm/src/integrations/hrmApi.ts`  
**Lines:** 10887–10897 (after edit; total lines 10928)  
**Status:** DONE

**Finding:** Function already existed (was added in prior S7-FE-01 dispatch) but used non-optional generic type and returned the raw API response without safe defaults. Updated to use optional fields in generic + explicit ?? fallbacks.

**Change summary:**
- Before: `return requestHrm<{ bound_codes: string[]; ... }>(...)`
- After: `const data = await requestHrm<{ bound_codes?: string[]; ... }>(...); return { bound_codes: data.bound_codes ?? [], bind_count: data.bind_count ?? 0, dropped_codes: data.dropped_codes ?? [] };`

---

## Fix 2 — ContractCreateStep2ClausePreview.tsx: import + canvas wire

**File:** `apps/web/hrm/src/components/contracts/ContractCreateStep2ClausePreview.tsx`  
**Status:** ALREADY COMPLETE (no changes needed)

**Finding:** Both the import and canvas wiring were already in place from the prior S7-FE-01 dispatch.

- **Import** at line 59: `import { ContractClauseOverrideEditor } from '@/components/contracts/ContractClauseOverrideEditor';`
- **Canvas wire 1** at line 387: `<ContractClauseOverrideEditor templateCode={templateCode} clauseId={cl.id} />` (palette list item)
- **Canvas wire 2** at line 495: `<ContractClauseOverrideEditor templateCode={templateCode} clauseId={cl.id} />` (DnD canvas item inside Draggable)
- `templateCode` prop confirmed present at line 67 of component props.
- Field used is `cl.id` (not `clause_id`) — this is the correct field from `HrmContractClauseRecord`.

---

## requestHrm function name

Confirmed: function is named `requestHrm` in hrmApi.ts (not an alias). Used correctly.

---

## tsc result

```
node apps/web/hrm/node_modules/typescript/bin/tsc --noEmit
exit code: 0
output lines: 0 (clean)
```

---

## Files changed

1. `apps/web/hrm/src/integrations/hrmApi.ts` — getContractBoundCodes safe defaults
2. No other files changed (Fix 2 already complete)

---

**ack_status: READY_FOR_QA**
