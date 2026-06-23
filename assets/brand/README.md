# XeVN brand assets

Master logo: **`xevn-logo-master.png`** (wings emblem, blue on black).

## Sync to apps

When updating the logo, copy the master file to:

| Target | Path |
|--------|------|
| HRM mobile icon / splash | `apps/mobile/hrm-mobile/assets/` → `icon.png`, `splash.png`, `adaptive-icon.png`, `xevn-logo.png` |
| HRM web + favicon | `apps/web/hrm/public/favicon.png`, `xevn-logo.png` |
| Web portal | `apps/web/web-portal/public/favicon.png`, `xevn-logo.png` |
| X-BOS core | `apps/web/x-bos-core/public/favicon.png`, `xevn-logo.png` |

## New mobile apps (mandatory)

1. Copy `xevn-logo-master.png` into the app `assets/` folder as `xevn-logo.png` (and generate Expo `icon` / `splash` from it).
2. Reuse `XevnLogo` + `SplashIntro` from `apps/mobile/hrm-mobile/src/components/brand/` (or extract to a shared package later).
3. Set splash `backgroundColor` to `#000000` to match the mark.

## Web usage

Reference `/xevn-logo.png` from each app's `public/` folder (Vite static asset).
