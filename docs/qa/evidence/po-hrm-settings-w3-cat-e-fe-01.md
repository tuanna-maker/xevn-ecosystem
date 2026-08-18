# PO-HRM-SETTINGS-W3-CAT-E-FE-01 — Settings non-catalog compact cards

| Field | Value |
|-------|--------|
| **work_item_id** | PO-HRM-SETTINGS-W3-CAT-E-FE-01 |
| **role** | dev-fe |
| **ack_status** | READY_FOR_QA |
| **date** | 2026-08-10 |

## Scope closed

`apps/web/hrm/src/pages/Settings.tsx` — non-catalog tabs use `settings-panel-card` + `settings-panel-card__header` / `__content` (match account tab):

- notifications
- security (2 cards)
- branding (wrapper)
- roles (wrapper)
- system
- subscription (wrapper)

**must_keep:** `settings-page`, `PageHeader density="compact"`, account card pattern unchanged.

## Build

Shared with CAT-C: `pnpm run build` in `apps/web/hrm` exit 0.

## QA handoff

- URL: `http://localhost:5173/command-center/hrm/settings?tab=notifications` (repeat security, branding, system)
- Visual: compact header (`text-base` title, `text-xs` description), no default `CardHeader p-6` padding regression on density paths
