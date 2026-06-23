# PCOMP-W4-FE-EMPLOYEES-FILTER-01 — Employees.tsx companyFilter ReferenceError fix

**work_item_id:** `PCOMP-W4-FE-EMPLOYEES-FILTER-01`  
**Date:** 2026-06-07  
**Owner:** Dev-FE  
**ack_status:** `READY_FOR_QA`  
**Upstream FAIL:** `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R3` — `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r3-20260607.md`

---

## Root cause

`apps/web/hrm/src/pages/Employees.tsx` referenced undeclared `companyFilter` in:

- `useEffect` department fetch (lines ~110–121)
- `importSpreadsheetScope` IIFE (lines ~126–128)

Component already destructures `selectedSlug` from `useHrmOperatingUnitFilter()` (line 66) and uses it for `companyIdForHook` / `useEmployees`.

---

## Fix

Replaced all `companyFilter` usages with `selectedSlug`:

| Location | Before | After |
|----------|--------|-------|
| Department fetch `companyIds` | `companyFilter === 'all'` / `[companyFilter]` | `selectedSlug === 'all'` / `[selectedSlug]` |
| `useEffect` deps | `[companyFilter, memberships]` | `[selectedSlug, memberships]` |
| `importSpreadsheetScope` | `companyFilter === 'all'` / `companyFilter` | `selectedSlug === 'all'` / `selectedSlug` |

Added regression smoke: `apps/web/hrm/src/pages/Employees.smoke.test.ts` (dynamic import, no ReferenceError).

---

## Verification

```bash
pnpm --filter vite_react_shadcn_ts test   # 160/160 PASS (incl. Employees.smoke)
pnpm --filter vite_react_shadcn_ts build  # exit 0
```

| Check | Result |
|-------|--------|
| `rg companyFilter apps/web/hrm/src/pages/Employees.tsx` | **0 hits** |
| Employees.smoke dynamic import | **PASS** (~3.9s) |
| vitest full suite | **160/160** |
| vite build | **exit 0** |

---

## QA retest scope

1. **L2.5 J-AVT-01** — Employees list route on pilot (`/hr/employees?portal=1&companyId=main`) — no blank root / ReferenceError; TCN-0954 row avatar `<img>` visible.
2. **J-HRM-EMP-01** — list → detail click `/employees/:id` with `company_id=main`.
3. Operating-unit filter change — department dropdown + import scope follow `selectedSlug`.

**Account:** `ceo@xe.vn` / `Xevn@2026` · pilot `https://14-225-217-232.nip.io`

---

## pm_dispatch_hint

`devops` **PCOMP-W4-DO-AVT-WEB-03** — PSCP `Employees.tsx` + `Employees.smoke.test.ts` to nip.io after QA PASS.

---

## Residual

None at FE layer. Pilot display retest blocked until DevOps deploy + QA L2.5.
