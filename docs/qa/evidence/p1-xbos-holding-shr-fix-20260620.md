# P1-XBOS-HOLDING-SHR-01 — Holding root shareholder scope fix

**work_item_id:** P1-XBOS-HOLDING-SHR-01  
**role:** dev-fe  
**date:** 2026-06-20  
**matrix:** UF-XBOS-05  

## Root cause

`resolveLegalProfileScope()` in `CommandCenterPage.tsx` returned `entityId: null` whenever `companyEntityId === GROUP_HOLDING_ROOT_ID` (`xbos-group-holding-root`), even when `resolvedLegalEntityApiId` or `legalEntityApiCache` already held the persisted `xbos_legal_entity` UUID. This blocked `submitShareholderRow` (per-row green check) and prevented shareholder list hydration on holding root.

`saveCompanySettings()` already resolved holding UUID via `resolvedLegalEntityApiId` / `fetchHoldingLegalEntities` + `syncShareholders` — per-row and hydrate paths did not.

## Fix

1. **`legalEntityProfileScope.ts`** — pure `resolveLegalProfileScopeFromState()` mirrors holding save path: uses `resolvedLegalEntityApiId`, `resolveLegalEntityApiIdFromList`, never treats UI holding id as UUID.
2. **`CommandCenterPage.tsx`**
   - `resolveLegalProfileScope()` delegates to scope helper (removed holding early-null).
   - `ensureLegalProfileEntityId()` async fallback: `fetchHoldingLegalEntities` + cache update when cache empty on submit.
   - Holding-root `useEffect` resolves API id via `fetchHoldingLegalEntities` (not member-company fetch).
   - Amber banner on shareholder section when entity not yet persisted (holding-specific copy).
   - `submitShareholderRow` / legal-doc submit wired to `ensureLegalProfileEntityId`.
3. **`legalEntityProfileScope.test.ts`** — 7 tests (holding resolved / cache / null / member UUID).

## Verification

```text
pnpm exec vitest run src/integrations/legalEntityProfileScope.test.ts \
  src/integrations/legalEntityProfileApi.test.ts \
  src/integrations/legalEntityIdResolver.test.ts
→ 15/15 PASS

pnpm exec vitest run (web-portal full)
→ 216/216 PASS

pnpm run build (web-portal)
→ exit 0
```

## QA retest (manual — L2.5 UF-XBOS-05)

**Account:** `ceo@xe.vn` / `Xevn@2026`  
**Path:** Command Center → Settings → TẬP ĐOÀN (holding root) → tab Pháp lý → Danh sách Cổ đông

| Step | Expected |
|------|----------|
| Add row + green check | POST/PUT `/org-foundation/legal-entities/{uuid}/shareholders` **2xx** |
| «Lưu thay đổi» with shareholders | `syncShareholders` batch **2xx** |
| F5 | Shareholder rows persist from GET |
| No holding UUID yet | Amber banner + toast «Lưu thay đổi» guidance (not silent fail) |

## ack_status

**READY_FOR_QA**
