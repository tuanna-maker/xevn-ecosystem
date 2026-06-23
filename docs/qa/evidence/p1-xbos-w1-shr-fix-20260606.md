# P1-XBOS-W1-SHR-FIX — D-W1-SHR-01

**work_item_id:** `P1-XBOS-W1-SHR-FIX` / `D-W1-SHR-01`  
**role:** dev-fe  
**date:** 2026-06-06  
**ack_status:** `READY_FOR_QA`

## Defect

QA: «Lưu thay đổi» on legal entity form did **not** POST/PUT shareholders. After F5, `GET …/shareholders` returned `count=0`.

## Root cause

Shareholder persistence was only wired to per-row check (`submitShareholderRow`). Main save flow `saveCompanySettings()` updated org-foundation legal entity only — no call to `legalEntityProfileApi`.

## Fix

| File | Change |
|------|--------|
| `apps/web/web-portal/src/integrations/legalEntityProfileApi.ts` | Added `syncShareholders()` — POST new / PUT UUID rows, skip empty `holderName` |
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | After legal entity PUT/POST succeeds, call `syncShareholders(persistedId, tenantId, shareholderRows)` before success navigation |

## Automated verification

```bash
pnpm --filter web-portal test -- src/integrations/legalEntityProfileApi.test.ts
pnpm --filter web-portal test
pnpm --filter web-portal build
```

| Check | Result |
|-------|--------|
| `legalEntityProfileApi.test.ts` | PASS — POST + PUT paths, empty row skipped |
| web-portal vitest (full) | **160/160** PASS |
| web-portal build | exit 0 |

## QA manual (exit criteria)

1. Stack: portal `:5173` (or `:5175`), xbos-api `:28002`, login `ceo@xe.vn` / `Xevn@2026`.
2. Command Center → Settings → member unit **XE_DU_LICH** → edit legal entity form.
3. Tab Hồ sơ pháp nhân → **+ Thêm cổ đông** → fill holder name + ratio.
4. Click **Lưu thay đổi** (do **not** rely on per-row check only).
5. DevTools Network: expect `POST` or `PUT` to `/api/xbos/org-foundation/legal-entities/{uuid}/shareholders`.
6. F5 → reopen same entity → shareholder row visible in UI.
7. `GET …/shareholders` → `items.length >= 1`.

## Residual

- Legal documents still use per-row submit only (out of scope D-W1-SHR-01).
- Holding root entity skips shareholder preload by design.

## J-* / matrix

- **J-CC-02** member legal save (shareholder slice)
- **P0-CRUD-01** shareholders CRUD on save path
