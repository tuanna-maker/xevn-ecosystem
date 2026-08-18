# D-MOB-REMOVE-NIPIO-01 — Remove nip.io from hrm-mobile

**Date:** 2026-07-28  
**work_item_id:** D-MOB-REMOVE-NIPIO-01  
**role:** dev-mobile  
**ack_status:** READY_FOR_QA  
**HOLD_DEPLOY:** yes (no APK rebuild / no device promote)

## Sponsor intake

TG-INTAKE-1785231917281 — xóa nip.io; chỉ local + dev từ deploy/env.

## Spec / SoT URL

| Env | Base URL | Source |
|-----|----------|--------|
| Local | `http://127.0.0.1:28001` | `.env.example` active; deploy `VITE_DEV_PROXY_HRM_API` / pick-ports |
| VPS/dev | `http://14.225.217.232:3001` | `deploy/xevn-ecosystem/.env.example` `HRM_BE_PORT=3001`; `EXPO_BUILD_CHECKLIST.md` |

**Cấm:** `*.nip.io`, portal `:8088` as HRM API origin.

## Changes

| Path | Change |
|------|--------|
| `src/config/pilotApiBase.ts` | Fallback → `http://14.225.217.232:3001`; CODE-MEMORY APPEND |
| `.env.example` | Active `EXPO_PUBLIC_HRM_API_BASE_URL=http://127.0.0.1:28001`; comment VPS `:3001` |
| `eas.json` | preview + production → `http://14.225.217.232:3001` |
| `scripts/build-apk.cjs` | default embed URL → `http://14.225.217.232:3001` |
| Unit tests | Hardcoded nip.io / `:8088` → `http://127.0.0.1:28001` (leave absolute HTTPS assert → `https://127.0.0.1:28001/...` per validator) |
| `android/.../assets/index.android.bundle` (+ build copies) | Length-preserving scrub of baked `https://14-225-217-232.nip.io` → `http://14.225.217.232:3001///` (stripTrailingSlash-safe); **stale until next APK embed** |

## Grep

```text
rg -n "nip\.io" apps/mobile
# exit 1 — zero matches (source + assets after scrub)
```

## Tests

```text
pnpm exec vitest run \
  src/integrations/__tests__/hrmApiClient.test.ts \
  src/integrations/__tests__/hrmFileUpload.test.ts \
  src/integrations/__tests__/hrmEmployees.test.ts \
  src/integrations/__tests__/hrmEmployeeDirectory.test.ts \
  src/integrations/__tests__/hrmTeamDirectory.test.ts \
  src/utils/__tests__/leaveAttachment.test.ts \
  src/utils/__tests__/resolveHrmAvatarUrl.test.ts
```

**Result:** 7 files / **59/59 passed**.

## Residual

1. **HOLD_DEPLOY** — no `android:apk:qa-device` this wave; device binary still needs rebuild before field QA against new defaults.
2. Tracked Hermes/JS asset scrubbed in-place (length pad `///`); next `build-apk` / EAS embed should regenerate clean string without pad.
3. Release HTTP cleartext: only `debug` manifest sets `usesCleartextTraffic`; device release APK vs HTTP VPS may need cleartext/network-security follow-up if QA uses non-debug binary.

## Handoff

- `ack_status:` **READY_FOR_QA**
- `next_owner:` qa (or qa-device after APK if smoke needs install)
- `pm_dispatch_hint:` QA-MOB-REMOVE-NIPIO-01 — grep `apps/mobile` zero `nip.io`; assert `.env.example` local + eas/build `14.225.217.232:3001`; no seed.
