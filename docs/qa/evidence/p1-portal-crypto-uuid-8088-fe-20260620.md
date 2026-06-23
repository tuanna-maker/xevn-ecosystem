# P1-PORTAL-CRYPTO-UUID-8088-01 — Dev-FE evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PORTAL-CRYPTO-UUID-8088-01` |
| **role** | dev-fe |
| **executed_at** | 2026-06-20 |
| **spec_ref** | `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` · HTTP pilot `:8088` |
| **ack_status** | **READY_FOR_QA** |

---

## Summary

Closed portal-side `crypto.randomUUID is not a function` on HTTP pilot `http://14.225.217.232:8088/` (non-secure context). HRM iframe already had polyfill (`P1-HRM-PAGESIZE-CRYPTO-8088-01`); **web-portal** and **x-bos-core** now mirror the same bootstrap + `safeRandomUuid()` pattern.

---

## Fixes

| ID | Change | Files |
|----|--------|-------|
| D-PORTAL-CRYPTO-POLYFILL | `installSafeRandomUuidPolyfill()` before React render | `apps/web/web-portal/src/main.tsx`, `apps/web/x-bos-core/src/main.tsx` |
| D-PORTAL-CRYPTO-UTIL | Shared `safeRandomUuid` + RFC-4122 v4 fallback | `apps/web/web-portal/src/lib/safeRandomUuid.ts`, `apps/web/x-bos-core/src/lib/safeRandomUuid.ts` |
| D-PORTAL-CRYPTO-WIRE | Replace bare `crypto.randomUUID()` in API clients / store | `hrmApiClient.ts`, `assetRegistryApi.ts`, `xbosApi.ts`, `useXbosStore.ts` |

---

## Verification

| Check | Result |
|-------|--------|
| `pnpm --filter web-portal test -- src/lib/safeRandomUuid.test.ts` | **3/3 PASS** |
| `pnpm --filter web-portal run build` | **exit 0** |
| `pnpm --filter x-bos run build` | **exit 0** |
| `rg 'crypto\.randomUUID\(' apps/web --glob '*.{ts,tsx}'` | **0 bare calls** in browser bundles (only inside `safeRandomUuid.ts` impl + tests) |

---

## Deploy bundle (pscp :8088)

**Source directory:** `apps/web/web-portal/dist/`

| Path | Notes |
|------|-------|
| `apps/web/web-portal/dist/index.html` | SPA shell |
| `apps/web/web-portal/dist/assets/index-*.js` | Main bundle (polyfill at bootstrap) |
| `apps/web/web-portal/dist/assets/hrmApiClient-*.js` | `safeRandomUuid` for HRM embed API |
| `apps/web/web-portal/dist/assets/CommandCenterPage-*.js` | CC / asset registry paths |

PM: sync full `dist/` to VPS portal-fe static root + restart portal-fe container.

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| Deploy to `:8088` | PM / devops | Rebuild + pscp before QA browser retest |
| Console audit on CC + login | qa | Verify zero `crypto.randomUUID` errors after deploy |

---

## Handoff

- **completion_report:** Portal + x-bos-core polyfill installed; all listed bare `crypto.randomUUID` replaced; vitest 3/3; both builds exit 0; grep clean for browser bundles.
- **next_owner:** `qa` (after PM pscp + portal-fe restart)
- **next_dispatch_prompt:** Task qa — work_item_id `P1-PORTAL-CRYPTO-UUID-8088-01-R1`: entry `docs/qa/evidence/p1-portal-crypto-uuid-8088-fe-20260620.md`; browser-only U63 on `http://14.225.217.232:8088/` account `ceo@xe.vn` / `Xevn@2026`; login → Command Center home → HRM embed tab; DevTools Console must show **zero** `crypto.randomUUID is not a function`; Network `x-request-id` headers present on `/api/xbos` and `/api/hrm` calls; F5 reload stable; ack PASS_TO_PM or FAIL_TO_PM with screenshot.
- **evidence_path:** `docs/qa/evidence/p1-portal-crypto-uuid-8088-fe-20260620.md`
- **ack_status:** **READY_FOR_QA**
