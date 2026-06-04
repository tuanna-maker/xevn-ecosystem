# P1-EX-FE-HTTPS-JWT-EMBED-01 — Portal→HRM embed JWT bridge (HTTPS pilot)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-EX-FE-HTTPS-JWT-EMBED-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | `2026-05-28` |
| **prior QA** | [R2 FAIL](p1-ex-qa-https-browser-01-r2-20260528.md) — parent `/api/xbos/auth/me` **200**, iframe `/api/hrm/*` **401**, HRM API Sync ERROR |
| **ack_status** | **READY_FOR_QA** |

---

## Root cause

Same-origin HRM iframe (`/hr/*` on nip.io) uses a **separate browsing context**: `sessionStorage` written by portal login is **not visible** inside the iframe. HRM `hrmApi.ts` called Nest without `Authorization` → **401** while parent XBOS calls succeeded.

---

## Fix (dual channel)

| Channel | Where | Behavior |
|---------|--------|----------|
| **localStorage mirror** | `web-portal/authSession.ts` → `hrm/portalAuthBridge.ts` | `persistAuthSession` mirrors JWT to `localStorage` (shared same-origin); iframe reads mirror when iframe `sessionStorage` empty |
| **postMessage push** | `portalEmbedSessionBridge.ts` (portal + hrm) | Parent pushes `xevn.portal.embed.session.push` on iframe load + on `accessToken` change; iframe requests `xevn.portal.embed.session.request` if still missing |
| **Sync banner retry** | `HrmApiSyncBanner.tsx` | Re-runs catalog-sync check on `xevn-portal-session-ready` after bridge applies JWT |

`companyId=main` in iframe query unchanged (already in `paths.ts` + `resolveHrmOperationalCompanyId`; pilot needs **portal-fe** redeploy if R2 still showed `companyId=xevn`).

---

## Files touched

| File | Change |
|------|--------|
| `apps/web/web-portal/src/integrations/authSession.ts` | Mirror JWT to `localStorage` on login/clear |
| `apps/web/web-portal/src/modules/hrm/portalEmbedSessionBridge.ts` | Parent publisher + `usePortalEmbedSessionPublisher` |
| `apps/web/web-portal/src/modules/hrm/HrmWorkspaceRoute.tsx` | iframe ref + session publisher hook |
| `apps/web/hrm/src/lib/portalAuthBridge.ts` | `applyPortalSession`, localStorage read, ready event |
| `apps/web/hrm/src/lib/portalEmbedSessionBridge.ts` | Child listener + parent request |
| `apps/web/hrm/src/main.tsx` | `initPortalEmbedSessionBridge()` before render |
| `apps/web/hrm/src/components/layout/HrmApiSyncBanner.tsx` | Retry on session ready |

---

## Verification (local)

```text
apps/web/hrm:        vitest portalAuthBridge + portalEmbedSessionBridge — 7/7 PASS
apps/web/web-portal: vitest authSession + portalEmbedSessionBridge + paths — 14/14 PASS
```

---

## QA retest (HTTPS pilot — mandatory)

**Base:** `https://14-225-217-232.nip.io` · `ceo@xe.vn` / `Xevn@2026`

**Prerequisite:** rebuild/restart **portal-fe** + **hrm-fe** after pull (no commit in this wave).

| # | Step | PASS when |
|---|------|-----------|
| 1 | Login → `/command-center/hrm/employees` | iframe **no** HRM API Sync ERROR |
| 2 | DevTools → iframe network | `/api/hrm/catalog-sync` **200** (not 401) |
| 3 | Inspect iframe `src` | `companyId=main` (not `xevn`) |
| 4 | P-CC-03..08 | List rows > 0 where seeded |
| 5 | J-HRM-01..07 | list→detail clickable |

**J-CC-03 KPI 409** — out of scope this item (separate FE rollup scope fix).

---

## Handoff packet

```yaml
work_item_id: P1-EX-FE-HTTPS-JWT-EMBED-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/p1-ex-fe-https-jwt-embed-01-20260528.md
entry_criteria: QA R2 iframe 401 while parent auth 200
exit_criteria: iframe /api/hrm/* 200 with Sync CONNECTED; companyId=main in src
summary: Dual localStorage mirror + postMessage JWT bridge; HrmApiSyncBanner retries after session ready.
pm_dispatch_hint: P1-EX-QA-HTTPS-BROWSER-01-R3 after portal-fe + hrm-fe redeploy
```
