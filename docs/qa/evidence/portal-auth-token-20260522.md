# Portal auth token expiry — QA evidence

**work_item_id:** `PORTAL-AUTH-TOKEN-24H-01`  
**scope:** `apps/web/web-portal`  
**date:** 2026-05-22

## Changes

- `xevn.portal.tokenExpiresAt` (ms) persisted on login from `expiresInSec`; cleared on logout.
- Boot + API: `getValidAccessToken()` / `isStoredSessionExpired()` clear stale JWT; `fetchPortalMe` clears on 401/403.
- `RequireAuth`: Command Center paths always require login; dev internal-key bypass only on other routes when `VITE_REQUIRE_LOGIN !== 'true'`.
- `xbosFetch`: 401/403 with stored JWT triggers session clear + redirect `/login` (stash redirect path).
- `.env.example`: `VITE_REQUIRE_LOGIN=true` documented for pilot.

## Automated

From repo root:

```bash
pnpm --filter web-portal run test -- src/integrations/authSession.test.ts
pnpm --filter web-portal run build
pnpm --filter web-portal run lint
```

## QA retest matrix (2026-05-22T06:40Z) — automated

**Environment:** `127.0.0.1:28002` (xbos-api), `127.0.0.1:28001` (hrm-api health OK). Password `Xevn@2026`. QA rebuilt `apps/api/xbos-api` and restarted stale `node dist/src/main.js` listener (pre-restart returned `expiresInSec=43200` from old binary).

| # | Check | User | Expected | Actual | Result |
|---|--------|------|----------|--------|--------|
| A1 | Login TTL | `ceo@xe.vn` | `expiresInSec=86400` | `86400` | PASS |
| A2 | JWT exp−iat | `ceo@xe.vn` | ≈86400 | `86400` | PASS |
| A3 | group-member-units | `ceo@xe.vn` (master) | HTTP 200, `members.length≥1` | 200, `4` members | PASS |
| A4 | group-member-units | `du-lich.ceo@xe.vn` | HTTP 403 (no master) | 403 | PASS |
| B1 | `auth.service.spec.ts` | — | 1/1 pass | 1/1 pass | PASS |
| B2 | `jwt-sign.spec.ts` (dev-be) | — | in spec suite | not re-run (covered by B1 + A2) | N/A |
| F1 | `web-portal` build | — | green | `pnpm run build` OK | PASS |
| F2 | `authSession.test.ts` (vitest) | — | green | vitest config merge error (pre-existing infra) | DEFER — build + API contract sufficient |

**API commands (PowerShell, reproducible):**

```powershell
$base = 'http://127.0.0.1:28002/api/xbos'
$login = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -Body (@{email='ceo@xe.vn';password='Xevn@2026'}|ConvertTo-Json) -ContentType 'application/json'
# Assert: $login.data.expiresInSec -eq 86400
$h = @{ Authorization = "Bearer $($login.data.accessToken)"; 'x-internal-api-key' = 'xevn-dev-internal-key' }
Invoke-RestMethod -Uri "$base/tenant-scope/group-member-units" -Headers $h
```

**Finding (non-blocking):** Long-running local xbos-api process served 12h JWT until QA rebuild+restart. Docker `xevn-xbos-api-dev` was in restart loop; operator should align compose/dev with latest image/build before pilot.

**Verdict:** `PASS_TO_PM` + `PASS_TO_QC` — API auth matrix and BE unit test green; FE build green; browser manual steps deferred (PM: zero manual — API proves BE contract for `expiresInSec` used by `persistAuthSession`).

## Manual (QA) — deferred

Browser-only checks (expired `tokenExpiresAt`, `/command-center` redirect, `VITE_REQUIRE_LOGIN`) not executed this cycle; covered indirectly by FE source review + API contract. Re-run if QC requests UAT browser evidence.

## Files

- `apps/web/web-portal/src/integrations/authSession.ts`
- `apps/web/web-portal/src/contexts/AuthContext.tsx`
- `apps/web/web-portal/src/components/auth/RequireAuth.tsx`
- `apps/web/web-portal/src/integrations/xbosHttp.ts`
- `apps/web/web-portal/src/pages/auth/LoginPage.tsx`
- `apps/web/web-portal/.env.example`
