# Dev-FE evidence — P1-CC-FE-MEMBER-LEGAL-CONTENT-TYPE-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-CC-FE-MEMBER-LEGAL-CONTENT-TYPE-01 |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **depends_on** | QA FAIL `docs/qa/evidence/p1-cc-qa-member-legal-save-l25-20260604.md` (duplicate Content-Type) |

## Problem

Browser PUT `/api/xbos/org-foundation/legal-entities/{id}` sent **both** `content-type` (from `buildApiAuthHeaders`) and `Content-Type` (from `orgFoundationApi.scopeHeaders(withBody=true)`). Duplicate headers caused proxy/body-parser to drop JSON body → **400** `XBOS-VAL-001` despite correct client payload.

Probe `test:xbos:cc-member-save` passed because script sends a single Content-Type.

## Fix

Central case-insensitive header merge in `apps/web/web-portal/src/integrations/xbosHttp.ts`:

- Added `mergeRequestHeaders(...layers)` — later layer wins per lowercase key.
- `buildHeaders` uses `mergeRequestHeaders(base, scope, init.headers)` instead of object spread.

No change to `orgFoundationApi.scopeHeaders` — dedupe is centralized in `xbosHttp` per PM dispatch.

## Tests

| Command | Result |
|---------|--------|
| `pnpm --filter web-portal exec vitest run src/integrations/xbosHttp.test.ts` | **4/4 PASS** |
| `pnpm --filter web-portal exec vitest run` | **135/135 PASS** |
| `pnpm --filter web-portal build` | **exit 0** |

New file: `apps/web/web-portal/src/integrations/xbosHttp.test.ts`

- `mergeRequestHeaders` dedupes `content-type` + `Content-Type`
- Integration: `xbosFetch` PUT with scope headers asserts single Content-Type on fetch init

## QA retest scope (after devops portal-fe deploy)

| Layer | Check |
|-------|--------|
| L2 | **P-CC-02** `?settings=company_member_units` loads |
| L2.5 | **J-CC-02** XE_DU_LICH edit → save → PUT **200**, no ERROR banner |
| API | `PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run test:xbos:cc-member-save` **4/4** |

Verify browser PUT request has **one** Content-Type header (DevTools Network).

## Residual

| Item | Owner |
|------|--------|
| Redeploy `portal-fe` on nip.io | **devops** |
| Browser J-CC-02 retest post-deploy | **qa** |

## ack_status

**READY_FOR_QA** — FE header dedupe merged; vitest **135/135**; build PASS. Requires **devops** portal-fe redeploy before nip.io browser retest.
