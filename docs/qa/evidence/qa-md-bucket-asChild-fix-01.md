# QA Evidence: MD-BUCKET-ASCHILD-FIX-01

**Date:** 2026-08-19
**File:** apps/web/hrm/src/components/settings/MasterDataSettingsPanel.tsx
**Lines:** 406-417 (after fix)

## Root Cause

`Button asChild` uses Radix `Slot` which calls `React.Children.only()`.
The old code passed 5 children (4 `false` booleans + 1 element) to `Button asChild`,
causing: `React.Children.only expected to receive a single React element child`.

## Before (buggy - lines 406-412)

```tsx
<Button asChild variant="default" size="sm" data-testid={...}>
  {bucket === 'leaveTypes' && <Link ...>Mo tab Loai phep ATT</Link>}
  {bucket === 'employmentTypes' && <Link ...>Mo tab Loai hinh thue</Link>}
  {bucket === 'decisionTypes' && <Link ...>Mo tab Loai quyet dinh</Link>}
  {bucket === 'insuranceTypes' && <Link ...>Mo tab Loai bao hiem</Link>}
  {bucket === 'insurers' && <Link ...>Mo tab Noi KCB / Don vi BH</Link>}
</Button>
```

## After (fixed - ternary chain, exactly 1 child)

```tsx
<Button asChild variant="default" size="sm" data-testid={...}>
  {bucket === 'leaveTypes'
    ? <Link ...>Mo tab Loai phep ATT</Link>
    : bucket === 'employmentTypes'
    ? <Link ...>Mo tab Loai hinh thue</Link>
    : bucket === 'decisionTypes'
    ? <Link ...>Mo tab Loai quyet dinh</Link>
    : bucket === 'insuranceTypes'
    ? <Link ...>Mo tab Loai bao hiem</Link>
    : <Link ...>Mo tab Noi KCB / Don vi BH</Link>
  }
</Button>
```

## Fix Description

Replaced the 5-branch `&&` pattern (which produces multiple children including `false` values)
with a single ternary chain that always yields exactly 1 React element child,
satisfying `Slot` / `React.Children.only()` requirement.

## Verification

Read-back of lines 406-417 after edit confirms ternary chain present, no `&&` multi-child pattern.

## ack_status: PASS_TO_PM
