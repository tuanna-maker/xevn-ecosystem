# P1-WEB-ACCEPTANCE-FIX-WAVE-01 — FE acceptance defects

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-WEB-ACCEPTANCE-FIX-WAVE-01` |
| **from_role** | pm |
| **to_role** | dev-fe |
| **date** | 2026-06-20 |
| **entry** | QA FAIL `p1-web-acceptance-close-20260620.md` |
| **ack_status** | **READY_FOR_QA** |

## Defects closed (FE)

| ID | Fix |
|----|-----|
| **D-UF-WEB-XBOS-05-R1** | `resolveShareholderEntityScope` in `legalEntityProfileApi.ts` — holding UI id `xbos-group-holding-root` → persisted UUID + `holding` partition before POST/PUT/GET/DELETE shareholders; complements `legalEntityProfileScope.ts` + `ensureLegalProfileEntityId` in Command Center |
| **D-UF-WEB-XBOS-12-01** | `fetchOrgTreeForLegalEntity` (`?legal_entity_id=`) + `loadLegalEntityDepartmentTree` fallback; `submitDepartmentRow` reloads flat dept rows after save |
| **D-UF-WEB-XBOS-14-01** | `commandCenterCatalogApi` default partition `holding`; autosave debounce re-hydrates from API after PUT |
| **D-UF-WEB-HRM-12-01** | `updateJobRequisition` PATCH → PUT fallback on HTTP 404 (`hrmApi.ts`, `hrmApiClient.ts`) for proxies/deploy without PATCH route |

## Verification

```text
pnpm exec vitest run (web-portal)
→ 226/226 PASS

pnpm run build (web-portal)
→ exit 0
```

## QA retest matrix

| UF | Account | Path | Expected |
|----|---------|------|----------|
| UF-XBOS-05 | `ceo@xe.vn` | CC → Tập đoàn → Cổ đông → green check / Lưu | Network: `…/legal-entities/{uuid}/shareholders` **2xx** (not `xbos-group-holding-root`) |
| UF-XBOS-12 | `ceo@xe.vn` | Settings → Phòng ban → Lưu dòng | F5 / reload: row visible via `org-units/tree?legal_entity_id=` |
| UF-XBOS-14 | `ceo@xe.vn` | Settings → Catalog văn bản → thêm dòng | Debounce save + reload; row in `regulations` partition |
| UF-HRM-12 | `ceo@xe.vn` | HRM → Tuyển dụng → Yêu cầu → Sửa trạng thái | PATCH or PUT **200** `HRM-REC-200` |

## Residual (not FE)

| ID | Owner | Note |
|----|-------|------|
| D-UF-WEB-XBOS-12-01 | dev-be | API probe `GET org-units/tree` without `legal_entity_id` may still be empty until BE tree parity on `:8088` |
| D-UF-WEB-XBOS-14-01 | dev-be | If PUT 200 but GET list missing row — BE `command_center_catalogs` persist on VPS |
| D-UF-WEB-HRM-10/11/15 | dev-be/devops | Out of FE wave scope |
| `:8088` deploy | devops | Portal bundle must be redeployed for sponsor `:8088` retest |

## §XBOS-05 — D-UF-WEB-XBOS-05-R1 (2026-06-20, wave close)

**work_item_id:** `P1-WEB-ACCEPTANCE-FIX-WAVE-01-XBOS05`

**Root cause:** After holding profile save, `syncShareholders` / row submit passed persisted UUID directly. `resolveShareholderEntityScope` only remaps when key is `GROUP_HOLDING_ROOT_ID`, so holding bulk-save on «Lưu thay đổi» could still hit wrong entity resolution path on stale bundles; row-level flows needed explicit holding UI key.

**Fix:**

- `resolveShareholderApiEntityKey()` in `legalEntityProfileScope.ts` — holding always returns `xbos-group-holding-root` for shareholder CRUD (API layer resolves UUID + partition).
- `CommandCenterPage.tsx` — `saveCompanySettings` sync, `submitShareholderRow`, `deleteShareholderRow`, shareholder/doc load effect use `resolveShareholderApiEntityKey`.

**Verification:**

```text
pnpm exec vitest run (web-portal) → 226/226 PASS
pnpm run build (web-portal) → exit 0 (see below)
```

**QA retest (UF-XBOS-05):** `ceo@xe.vn` → CC → Tập đoàn → Cổ đông → green check or «Lưu thay đổi» → Network POST `…/legal-entities/{uuid}/shareholders` **2xx** (never `xbos-group-holding-root` in path).

## Files touched

- `apps/web/web-portal/src/integrations/legalEntityProfileScope.ts`
- `apps/web/web-portal/src/integrations/legalEntityProfileApi.ts`
- `apps/web/web-portal/src/integrations/orgFoundationApi.ts`
- `apps/web/web-portal/src/integrations/commandCenterCatalogApi.ts`
- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `apps/web/web-portal/src/modules/hrm/hrmApiClient.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts`
- `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx`
- Tests: `legalEntityProfileApi.test.ts`, `legalEntityProfileScope.test.ts`, `orgFoundationApi.dept-tree.test.ts`, `commandCenterCatalogApi.test.ts`
