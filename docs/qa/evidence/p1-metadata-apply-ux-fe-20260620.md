# P1-METADATA-APPLY-UX-FE-01 — Infrastructure metadata apply UX

**work_item_id:** `P1-METADATA-APPLY-UX-FE-01`  
**date:** 2026-06-20  
**role:** dev-fe  
**ack_status:** `READY_FOR_QA`

## Symptom (sponsor)

Modal «Cấu hình mục thông tin hạ tầng cơ sở» on `:8088`: PUT **200** (`XBOS-INFRA-201`) in console but **zero UI feedback**; user expects custom fields on **company_infrastructure** site detail form after apply.

## Root cause

1. `setPublishMessage` ran on apply but banner renders **behind** the modal (`z-[100]`) — not visible to user.
2. Apply button had no `pending` / double-submit guard.
3. No GET refresh after PUT — relied on local state only.
4. Opening from `company_member_units` had no pointer to consumer screen (`?settings=company_infrastructure`).

## Fix

| Area | Change |
|------|--------|
| Apply handler | `applyInfrastructureFieldsConfig()` — PUT via `saveInfrastructureSettingsToDb` + `loadInfrastructureSettingsFromDb()` |
| Button UX | `MutationButton` + `Loader2` + `infrastructureFieldsApplyBusy` |
| Modal feedback | Inline emerald/red `role="alert"` banner in modal footer |
| Page feedback | `infrastructureApplySuccessBanner` (emerald) after modal close |
| Member-units hint | When opened from `company_member_units` → inline hint + **Mở màn nhập điểm hạ tầng** → `/command-center?settings=company_infrastructure` |
| Consumer wiring | `infraCustomFieldDefsForEntity` unchanged — reads `infrastructureCustomFieldDefsByEntity` after GET refresh on site detail |

## Files

- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `apps/web/web-portal/src/integrations/infrastructureFieldsConfigUx.ts` (new)
- `apps/web/web-portal/src/integrations/infrastructureFieldsConfigUx.test.ts` (new)

## Verify (agent)

```text
pnpm --filter web-portal exec vitest run src/integrations/infrastructureFieldsConfigUx.test.ts  → 3/3 PASS
pnpm --filter web-portal build                                                    → exit 0
```

## QA browser (U65 — FE-only, no seed)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `:8088`

### UF path A — consumer screen (primary)

1. Command Center → Cài đặt → **Hạ tầng cơ sở** → tab **2. Điểm hạ tầng** → **Thêm hạ tầng mới** (or edit existing).
2. Link **Mở cấu hình khối & trường** → add visible custom field → **Xác nhận (áp dụng)**.
3. **Expect:** spinner on button; emerald banner on page after modal closes; Network PUT **200** + GET settings **200**.
4. **Expect:** custom field inputs visible on site detail form (`infraCustomFieldDefsForEntity` block).
5. **F5** → field defs persist; site detail still shows custom inputs.

### UF path B — member units entry

1. `?settings=company_member_units` → open entity form → open infra metadata modal (if entry exists) or via foundation scope flow.
2. **Expect:** hint + **Mở màn nhập điểm hạ tầng** navigates to `?settings=company_infrastructure`.

## Residual

- Per-field add/delete inside modal still uses `setPublishMessage` only (not apply flow) — out of scope unless QA reports same gap.
- Member legal entity form does **not** show infra fields (by design — consumer is `company_infrastructure` site detail only).

## next_owner

`qa`
