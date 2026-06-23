# Portal UI density ~90% (PORTAL-UI-DENSITY-90-01)

**Date:** 2026-05-22  
**Owner:** dev-fe  
**Scope:** `apps/web/web-portal` — Command Center chrome, shared portal shell

## Problem

At browser **100% zoom**, the portal felt oversized; stakeholders preferred the look of **90% browser zoom** without asking users to change browser settings.

## Approach (before → after)

| Aspect | Before | After |
|--------|--------|--------|
| Root scale | `html { font-size: 82.5%; }` (static) | `calc(100% * var(--xevn-ui-density, 0.9))` + `applyUiDensity()` at boot |
| Tuning | None | `VITE_UI_DENSITY` (default **0.9**, clamp 0.75–1) in `.env` |
| Command Center px typography / sidebars | Fixed `text-[15px]`, `w-[280px]`, etc. | **rem** tokens in `settings-form-pattern.tsx` so chrome scales with root |
| `zoom: 0.9` on `body` | Not used | Avoided (modal / `position: fixed` risk) |

**Mechanism:** Lowering the rem base (~14.4px at density 0.9) scales Tailwind spacing/typography that use `rem`. Command Center pattern constants were moved from px to rem so rails, sub-sidebar, labels, and member-unit tables track the same density.

## Files

- `apps/web/web-portal/src/config/uiDensity.ts` (+ `uiDensity.test.ts`)
- `apps/web/web-portal/src/main.tsx`
- `apps/web/web-portal/src/index.css`
- `apps/web/web-portal/src/vite-env.d.ts`, `.env.example`
- `apps/web/web-portal/src/pages/command-center/settings-form-pattern.tsx`
- `apps/web/web-portal/src/pages/command-center/CommandCenterModuleRail.tsx`
- `apps/web/web-portal/src/pages/command-center/TenantConfigScopeBar.tsx`

## Build evidence

```text
cd apps/web/web-portal
pnpm run build
# exit 0 — tsc && vite build (2026-05-22)
```

Unit tests added at `src/config/uiDensity.test.ts` (defaults/clamp). Portal `pnpm test` may fail on pre-existing vitest/vite merge config; **build gate** is the release check for this item.

## QA notes

- Verify at **100% browser zoom** on **1366×768**: Command Center member-units table + dual sidebars readable, no new horizontal overflow.
- Optional: set `VITE_UI_DENSITY=0.85` in `.env` if product wants tighter; rebuild required (Vite env at build time).
- **Not in scope:** `hrm-mobile`, standalone apps; `@xevn/ui` unchanged (portal-local rem + root scale sufficient).

## Handoff

`ack_status`: **READY_FOR_QA**
