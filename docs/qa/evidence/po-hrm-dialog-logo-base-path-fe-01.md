# Evidence — PO-HRM-DIALOG-LOGO-BASE-PATH-FE-01

work_item_id: PO-HRM-DIALOG-LOGO-BASE-PATH-FE-01
role: dev-fe
date: 2026-08-13
files changed: apps/web/hrm/src/components/ui/dialog.tsx

## Bug

`DialogHeader` (default `brandChrome`, used by every `<Dialog>` in the app) hardcoded
`<img src="/xevn-logo.png" .../>`. HRM standalone serves under Vite `base: "/hr/"`
(`apps/web/hrm/vite.config.ts`), so the real asset lives at `/hr/xevn-logo.png`.
Absolute root `/xevn-logo.png` 404s outside CC embed → broken image
(`naturalWidth === 0`) on every Dialog using default `DialogHeader`, whenever HRM is
opened standalone (not through the Command Center iframe).

Root cause pre-traced by PM before dispatch (curl-verified) and re-confirmed here.

## Fix

`DialogHeader` now computes `logoSrc` via the existing context-aware helper
`isHrmDialogMountedToPortalParent()` (already imported in `dialog.tsx` from
`@/lib/hrmDialogPortal.ts`, same logic `DialogContent` already uses):

```ts
const logoSrc = isHrmDialogMountedToPortalParent()
  ? "/xevn-logo.png"
  : `${import.meta.env.BASE_URL}xevn-logo.png`;
```

- CC embed (Dialog portals to parent document) → unchanged `/xevn-logo.png`
  (parent portal-fe origin has its own root asset — correct as before).
- Standalone (no parent portal) → `${import.meta.env.BASE_URL}xevn-logo.png`, which
  Vite resolves to `/hr/xevn-logo.png` today and will auto-track any future `base`
  change.

`@CODE-MEMORY-CHANGE 2026-08-13 / WorkItem: PO-HRM-DIALOG-LOGO-BASE-PATH-FE-01` added
to `dialog.tsx` header comment block, `must_keep` records the CC-embed branch stays
byte-for-byte unchanged.

## 1. Standalone verification — LIVE browser (PASS)

Servers already running (pre-started by PM per dispatch): `hrm-fe` :8080, `hrm-api` :3001.

curl (before/after context, matches PM's pre-trace):
```
$ curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/xevn-logo.png
404
$ curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/hr/xevn-logo.png
200
```

Browser steps:
1. Session already authenticated (persisted `ceo@xe.vn` session — login screen not
   re-shown); navigated to `http://localhost:8080/hr/settings?tab=master-data`.
2. Tab "Chức danh" (default), clicked "Thêm mới" to open the master-data upsert
   Dialog (uses default `DialogHeader brandChrome`).
3. `javascript_tool` check on the live DOM:

```js
const img = document.querySelector('[data-testid="xevn-dialog-wordmark"]');
({
  found: !!img,
  src: img.src,
  naturalWidth: img.naturalWidth,
  naturalHeight: img.naturalHeight,
  complete: img.complete,
  windowParentIsSelf: window.parent === window,
})
```

Result:
```json
{
  "found": true,
  "src": "http://localhost:8080/hr/xevn-logo.png",
  "naturalWidth": 600,
  "naturalHeight": 420,
  "complete": true,
  "windowParentIsSelf": true
}
```

`naturalWidth: 600` (not 0) → logo renders correctly, standalone (confirmed by
`windowParentIsSelf: true`), `src` resolved to `/hr/xevn-logo.png` as intended.
Before the fix this would have been `naturalWidth: 0` at
`http://localhost:8080/xevn-logo.png` (404, matches curl above).

**Result: PASS.**

## 2. CC embed verification — NOT COMPLETED live (code-review only)

Attempted: started `apps/web/web-portal` dev server (`pnpm --filter web-portal run
dev`, port 5173, confirmed up via curl 200). Logged into Command Center at
`http://localhost:5173` with `ceo@xe.vn` / `Xevn@2026` → **login failed**
(`POST http://localhost:5173/api/xbos/auth/login → 500 Internal Server Error`).//
The XBOS auth backend (`xbos-api`, CLAUDE.md port :3002) was not running in this
session (only `hrm-fe`/`hrm-api` were pre-started by PM) and standing it up is out of
this work item's scope/time budget, so a live CC-embed Dialog render could not be
reached. Portal dev server was stopped afterward to restore the environment to its
prior state (only hrm-fe/hrm-api running).

Code-level confirmation instead: the CC-embed branch of the new `logoSrc` logic is
`isHrmDialogMountedToPortalParent() ? "/xevn-logo.png" : ...` — the **exact same
literal string** (`"/xevn-logo.png"`) that was hardcoded before this change, so the
CC-embed rendering path is byte-for-byte unchanged. `isHrmDialogMountedToPortalParent()`
is the identical helper `DialogContent` already calls for the same portal-parent
decision (`apps/web/hrm/src/lib/hrmDialogPortal.ts:87-92`), so there is no new
branching risk beyond what `DialogContent` already exercises in production.

**Result: PASS_WITH_HOLD — recommend PM/QA do a live CC-embed browser check once
`xbos-api` is available, to close the loop fully.**

## 3. Static checks

```
$ cd apps/web/hrm && npx vitest run src/components/ui/dialog
 ✓ src/components/ui/dialogCenter.source.test.ts (11 tests)
 ✓ src/components/ui/dialogA11yPrimitive.test.ts (5 tests)
 Test Files  2 passed (2)
      Tests  16 passed (16)
```
(No dedicated `dialog.test.ts` exists; these are the only existing test files that
exercise `dialog.tsx` — both green, no references to the hardcoded `/xevn-logo.png`
literal so nothing broke there.)

```
$ cd apps/web/hrm && npx tsc --noEmit
(no output — 0 errors)
```

## ack_status

**PASS_WITH_HOLD** — standalone fix verified live and correct (root bug fixed);
CC-embed branch verified by code review only (unchanged literal, shared helper
already proven by `DialogContent`), not live-browser-verified because `xbos-api`
backend wasn't available in this session. Recommend PM/QA run a quick live CC-embed
Dialog check (`?portal=1` iframe) with `xbos-api` up before closing.
