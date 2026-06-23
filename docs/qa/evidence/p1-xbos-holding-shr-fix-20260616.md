# P1-XBOS-HOLDING-SHR-01 — UF-XBOS-05 holding shareholder scope

**work_item_id:** `P1-XBOS-HOLDING-SHR-01`  
**role:** dev-fe  
**date:** 2026-06-16  
**ack_status:** `READY_FOR_QA`

## Defect

UF-XBOS-05 **BROKEN** on Tập đoàn (holding root `xbos-group-holding-root`):

- `resolveLegalProfileScope()` returned `entityId: null` — UI id is not a persisted `xbos_legal_entity` UUID.
- Per-row shareholder submit and main **Lưu thay đổi** could not POST/PUT shareholders for holding.
- Amber banner blocked UX even when holding profile existed in org-foundation.

## Root cause

Command Center mapped member units via `resolveLegalEntityApiIdFromList`, but holding root UI id (`GROUP_HOLDING_ROOT_ID`) was never resolved to the seeded holding row (`entity_type: holding`, `company_id: holding`). Shareholder APIs require persisted UUID.

## Fix

| File | Change |
|------|--------|
| `apps/web/web-portal/src/integrations/legalEntityProfileScope.ts` | **New** — `resolveLegalProfileScopeFromState()` maps holding UI id → UUID via `resolvedLegalEntityApiId` / `legalEntityApiCache` / `fetchHoldingLegalEntities`; `legalProfileScopePersistMessage()` for holding-specific guidance |
| `apps/web/web-portal/src/integrations/legalEntityProfileScope.test.ts` | **New** — 7 vitest cases (holding cache, resolved id, member UUID) |
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | Wire scope resolver; hydrate holding on edit via `fetchHoldingLegalEntities`; `ensureLegalProfileEntityId()` lazy fetch; `saveCompanySettings()` create/update holding + `syncShareholders()` on **Lưu thay đổi**; shareholder list preload when scope resolves |

## Automated verification

```bash
pnpm --filter web-portal exec vitest run src/integrations/legalEntityProfileScope.test.ts src/integrations/legalEntityIdResolver.test.ts src/integrations/legalEntityProfileApi.test.ts
pnpm --filter web-portal exec vitest run
pnpm --filter web-portal build
```

| Check | Result |
|-------|--------|
| `legalEntityProfileScope.test.ts` | **7/7** PASS |
| `legalEntityIdResolver.test.ts` | **7/7** PASS (holding via `entity_type`) |
| `legalEntityProfileApi.test.ts` | **1/1** PASS (`syncShareholders`) |
| web-portal vitest (full) | **216/216** PASS |
| web-portal build (`tsc && vite build`) | exit **0** |

## QA manual (exit criteria)

1. Stack: portal `:5173` or `:5175`, xbos-api `:28002`, login `ceo@xe.vn` / `Xevn@2026`.
2. Command Center → Settings → **TẬP ĐOÀN** (holding root) → edit legal entity form.
3. Tab Hồ sơ pháp nhân → **+ Thêm cổ đông** → fill holder name + ratio.
4. Click **Lưu thay đổi** (batch save — not only per-row check).
5. DevTools Network:
   - `GET /api/xbos/org-foundation/legal-entities` with `companyId=holding` (hydrate)
   - `PUT` or `POST` legal entity (if first save)
   - `POST` or `PUT` `/api/xbos/org-foundation/legal-entities/{uuid}/shareholders`
6. F5 → reopen holding → shareholder row visible; amber scope banner absent when holding UUID resolved.
7. Per-row check (✓) also works when holding profile already persisted.

## J-* / matrix

- **UF-XBOS-05** — holding legal profile + shareholders
- **J-CC-02** — legal entity save path (holding slice)
- **J-XBOS-05** — org-foundation holding scope parity

## Residual

- Legal documents on holding still use per-row submit (same as member units; out of scope).
- Fresh tenant without holding seed: user must **Lưu thay đổi** once to create holding profile before per-row shareholder API calls (banner explains).
