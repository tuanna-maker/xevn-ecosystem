# P1-METADATA-MU-INFRA-ENTRY-FE — Member units infra modal entry

**work_item_id:** `P1-METADATA-MU-INFRA-ENTRY-FE`  
**date:** 2026-06-20  
**role:** dev-fe  
**ack_status:** `READY_FOR_QA`

## Symptom (QA spec_gap)

`SPEC-GAP-MU-INF-MODAL-ENTRY` — on **Đơn vị thành viên** (`company_member_units`) entity form there was no button to open infrastructure metadata modal; QA Path B blocked.

## Fix

Sticky footer on `company_member_units` + `companySettingsView === 'form'`:

- Secondary action **«Cấu hình khối & trường hạ tầng»** (`data-capability="ACT-CC-MU-INFRA-MODAL"`)
- Calls `openInfrastructureFieldsConfigModal(companyEntityId)` → sets `infrastructureFieldsConfigOpenedFromMenu` from `activeSettingsMenu` (`company_member_units`)
- Existing modal footer hint + **Mở màn nhập điểm hạ tầng** CTA unchanged (`shouldShowInfraConsumerNavHint`)
- New entity (`companyEntityId === 'new'`) → inline `publishMessage` asks to save legal entity first

## Files

- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`

## Verify (agent)

```text
pnpm --filter web-portal exec vitest run src/integrations/infrastructureFieldsConfigUx.test.ts  → 3/3 PASS
pnpm --filter web-portal build                                                    → exit 0
```

## QA browser (U65 — FE-only, no seed)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `:8088`

### UF Path B — member units entry (primary for this wave)

1. Command Center → Cài đặt → **Đơn vị thành viên** → **Chỉnh sửa** một pháp nhân (form view).
2. Sticky footer → click **Cấu hình khối & trường hạ tầng**.
3. **Expect:** modal «Cấu hình mục thông tin hạ tầng cơ sở» opens; entity scoped to current pháp nhân.
4. **Expect:** sky hint + **Mở màn nhập điểm hạ tầng** → navigates to `?settings=company_infrastructure`.
5. Add visible field → **Xác nhận (áp dụng)** → emerald feedback; Network PUT **200** + GET **200**.
6. **F5** on member form → re-open modal → defs persist.

### Edge — new entity

1. **Thêm mới đơn vị** (unsaved) → click secondary button.
2. **Expect:** message «Lưu pháp nhân trước…» — modal does not open.

## Residual

- None for this work_item scope.

## next_owner

`qa`
