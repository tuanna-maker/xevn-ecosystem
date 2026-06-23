# P1-WEB-ACCEPTANCE-FIX-WAVE-01-R3 — FE acceptance defects

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-WEB-ACCEPTANCE-FIX-WAVE-01-R3` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **date** | 2026-06-20 |
| **entry** | QA FAIL R2 `p1-web-acceptance-close-01-r2-20260620.md` (19/23) |
| **ack_status** | **READY_FOR_QA** |

## Defects closed (FE)

| ID | Fix |
|----|-----|
| **D-UF-WEB-XBOS-05-R1** | `resolveShareholderApiEntityKey` now returns **persisted holding UUID** when profile is resolved (reverts R1 UI-id passthrough). `resolveShareholderEntityScope` recognizes holding UUID + applies `holding` partition. Network path: `…/legal-entities/{uuid}/shareholders` — never `xbos-group-holding-root`. |
| **D-UF-WEB-XBOS-14-01** | `saveCcCatalogRows` syncs each row as **flat item** (`upsertBusinessMasterItem` with `row.code` itemId + `category`) in addition to partition bucket; `saveAndReloadCcCatalogRows` for post-save hydrate. Default partition `holding` unchanged via `resolveXbosCommandCenterCatalogCompanyId`. |

## Verification

```text
pnpm exec vitest run (web-portal)
→ 229/229 PASS

pnpm run build (web-portal)
→ exit 0 (see CI log below)
```

## QA retest matrix

| UF | Account | Path | Expected |
|----|---------|------|----------|
| UF-XBOS-05 | `ceo@xe.vn` | CC → Tập đoàn → Cổ đông → green check / Lưu | Network POST `…/legal-entities/{uuid}/shareholders` **2xx** — path must **not** contain `xbos-group-holding-root` |
| UF-XBOS-14 | `ceo@xe.vn` | Settings → Catalog văn bản → thêm dòng | Debounce save + reload; flat row visible on GET `command_center_catalogs/items` |

## DevOps — pscp file list (portal-fe R3)

**Must pscp + rebuild `portal-fe` container** (Vite `dist/` bundle — source-only pscp is insufficient):

```
apps/web/web-portal/src/integrations/legalEntityProfileScope.ts
apps/web/web-portal/src/integrations/legalEntityProfileScope.test.ts
apps/web/web-portal/src/integrations/legalEntityProfileApi.ts
apps/web/web-portal/src/integrations/legalEntityProfileApi.test.ts
apps/web/web-portal/src/integrations/commandCenterCatalogApi.ts
apps/web/web-portal/src/integrations/commandCenterCatalogApi.test.ts
apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx
```

**Docker rebuild:** **YES** — `portal-fe` image must run `pnpm run build` (or `vite build`) so `:8088` serves updated JS chunks. Recreate container after build (same as `tmp-vps-deploy-acceptance-fix-wave-20260620.sh`).

**Not required for FE R3:** `businessMasterApi.ts`, `commandCenterScope.ts` (unchanged).

## Residual (not FE)

| ID | Owner | Note |
|----|-------|------|
| D-UF-WEB-XBOS-14-01 | dev-be + devops | If probe PUT `main` header still GET-miss after FE+BE deploy — verify `business-master.service.ts` `upsertCommandCenterCatalogRow` + `flattenCommandCenterCatalogList` on VPS |
| D-UF-WEB-HRM-10/11 | dev-be + devops | Out of FE R3 scope |

## Handoff

| Field | Value |
|-------|-------|
| **completion_report** | R3 reverses XBOS-05 R1 UI-id passthrough: holding shareholder CRUD uses persisted UUID in API path. UF-XBOS-14 adds flat-row catalog sync + `saveAndReloadCcCatalogRows`. Vitest 229/229; build exit 0. |
| **next_owner** | **qa** → `P1-WEB-ACCEPTANCE-CLOSE-01-R3` on `:8088` after **devops** portal-fe rebuild |
| **evidence_path** | `docs/qa/evidence/p1-web-acceptance-fe-fix-r3-20260620.md` |
| **ack_status** | **READY_FOR_QA** |
