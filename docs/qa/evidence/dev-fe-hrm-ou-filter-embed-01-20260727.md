# Evidence — D-HRM-OU-FILTER-EMBED-01 (dev-fe)

**Date:** 2026-07-27  
**Work item:** `D-HRM-OU-FILTER-EMBED-01`  
**Role:** dev-fe  
**ack_status:** READY_FOR_QA  
**change_mode:** FIX · preserve_default

## spec_read_ack

| Field | Value |
|-------|--------|
| srs | `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` §3 / U39 OU filter |
| tech_spec | `HrmOperatingUnitFilter.tsx` CODE-MEMORY BM-AC-02 / AC-CD-F3-03 |
| sponsor_confirm | PM dispatch P0 UX CC embed 2026-07-27 |

## Root cause (verified)

1. **Select portal:** `SelectContent` always used `getRadixPortalContainer()` → parent `document.body` in CC iframe. Top-level OU filter is not inside a dialog; cross-document portal detached after parent/iframe relayout → options disappear, only trigger label remains.
2. **Query wipe:** `setSelectedSlug` called `queryClient.invalidateQueries()` (all keys) → `hrm-operating-units` refetch could fail-closed to `[]` with no `keepPreviousData` / focus refetch → Select items gone.
3. **Duplicate Radix value:** loading used second `SelectItem value="all"` → fragile when value stale.

## Fixes

### A. Select portal (`select.tsx` + `hrmDialogPortal.ts`)

- `SelectContent` accepts `portalScope?: 'iframe' | 'parent'`.
- `getRadixPortalContainer('iframe')` → iframe `document.body`; default/parent unchanged for Dialog/Sheet floating selects.
- OU filter: `<SelectContent portalScope="iframe">`.

### B. Operating units resilience (`HrmOperatingUnitFilterContext.tsx`)

- `refetchOnWindowFocus: false`
- `placeholderData: keepPreviousData`
- `retry: 2`
- `enabled: shouldFetchOperatingUnits && portalSessionReady` (`hasPortalSession` + `PORTAL_SESSION_READY_EVENT`)
- Scoped invalidate via `shouldInvalidateQueryOnOuChange` (excludes `hrm-operating-units`)
- `coerceOperatingUnitSelection` when settled fetch lacks selected slug

### C. Loading UI (`HrmOperatingUnitFilter.tsx`)

- Non-item loading row (`data-testid="hrm-operating-unit-loading"`); single `SelectItem value="all"`.

## must_keep check

| Constraint | Status |
|------------|--------|
| OU filter does not mutate JWT `companyId` | Kept — only `setCurrentCompanyId` query scope |
| Group CEO `showFilter`; member compact chip | Unchanged |
| Dialog/Sheet parent portal full viewport | Default Select + Dialog still use parent when embed |
| Direct `/hr/employees?portal=1` | Same OU components; iframe portal still same-document when not nested oddly |

## Tests

```text
pnpm --filter vite_react_shadcn_ts test -- HrmOperatingUnitFilterContext hrmDialogPortal hrmOperatingUnitFilterRoleChip hrmOperatingUnits
```

| Suite | Result |
|-------|--------|
| `HrmOperatingUnitFilterContext.test.ts` | 5 PASS |
| `hrmDialogPortal.test.ts` | 7 PASS (incl. portalScope) |
| `hrmOperatingUnitFilterRoleChip.test.ts` | 3 PASS (incl. iframe + no dup all) |
| `hrmOperatingUnits.test.ts` | 9 PASS |
| `hrmDialogPortalA11y.test.ts` | 6 PASS (matched filter) |
| **Total** | **30 PASS** |

## Manual QA note (required)

1. Login `ceo@xe.vn` → `http://192.168.1.4:5173/command-center/hrm/dashboard`
2. Open «Đơn vị thành viên» — options list visible
3. Wait ≥5s, reopen Select — **all member units must still appear** (not only «Tất cả đơn vị (rollup)»)
4. Regression: direct `/hr/employees?portal=1` OU filter still works
5. Open any HRM Dialog Select in embed — still overlays correctly (parent portal default)

## Files touched

- `apps/web/hrm/src/components/ui/select.tsx`
- `apps/web/hrm/src/lib/hrmDialogPortal.ts`
- `apps/web/hrm/src/components/hrm/HrmOperatingUnitFilter.tsx`
- `apps/web/hrm/src/contexts/HrmOperatingUnitFilterContext.tsx`
- `apps/web/hrm/src/contexts/HrmOperatingUnitFilterContext.test.ts` (new)
- `apps/web/hrm/src/lib/hrmDialogPortal.test.ts`
- `apps/web/hrm/src/components/hrm/__tests__/hrmOperatingUnitFilterRoleChip.test.ts`

## Residual

- None for this work item. HOLD_DEPLOY until QA browser sign-off on CC embed URL above.
