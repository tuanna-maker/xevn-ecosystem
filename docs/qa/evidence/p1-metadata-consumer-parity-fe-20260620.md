# P1-METADATA-CONSUMER-PARITY-FE-02 — Metadata consumer resolver parity

**work_item_id:** `P1-METADATA-CONSUMER-PARITY-FE-02`  
**date:** 2026-06-20  
**role:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**spec_ref:** ADR `ADR-METADATA-APPLY-CONSUMERS-DELTA-20260620.md` · `METADATA_APPLY_PROPAGATION_MATRIX.md`

## Problem (M2 class)

Infra config modal indexed `infrastructureCustomFieldDefsByEntity[entityId]` directly while site detail used `resolveInfraScopedRecord` — defs stored under `main` were visible on **Điểm hạ tầng** but modal list/count showed **0 fields** for holding alias entities.

## Fix

| Check | Implementation |
|-------|----------------|
| **K1** | New `metadataConsumerResolver.ts` — unified `resolveMetadataFieldDefs` for infra + group_hr reads |
| **K2** | Modal `infraModalFieldsForSelectedBlock` + site `infraCustomFieldDefsForEntity` both call same resolver |
| **K3** | Apply success count via `countVisibleMetadataFieldDefs` (resolver-based, not direct map index) |
| **K4** | Group HR modal field list / apply sync reads via `resolveMetadataFieldDefs({ pipeline: 'group_hr' })` |
| **K5** | `legal_entity_static` pipeline returns `[]` — **no** bind of infra defs to `companyForm` |

## Files

- `apps/web/web-portal/src/integrations/metadataConsumerResolver.ts` (new)
- `apps/web/web-portal/src/integrations/metadataConsumerResolver.test.ts` (new)
- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` (refactor reads)

## Verify (agent)

```text
pnpm --filter web-portal exec vitest run src/integrations/metadataConsumerResolver.test.ts src/integrations/infrastructureEntityKeyResolver.test.ts  → 12/12 PASS
pnpm --filter web-portal build                                                                                                        → exit 0
```

## QA browser (U65 — FE-only)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `:8088` or local `:5175`

### AC-META-PROP-INF-01 (primary — K2)

1. **Hạ tầng cơ sở** → **Cấu hình khối & trường** for holding root (`xbos-group-holding-root` or group holding row).
2. Add visible field `QA-META-INF-{ts}` → **Xác nhận (áp dụng)** → PUT **200** + GET refresh.
3. **Expect:** modal field list count matches block sidebar count (not 0 when defs under `main`).
4. **Thêm/Sửa điểm** same `operatingEntityId` → custom input visible (same label).
5. **F5** → field persists on site detail.

### AC-META-PROP-LE-01 (K5 boundary — must NOT regress)

1. **Đơn vị thành viên** → **Chỉnh sửa pháp nhân** → open infra metadata modal → apply.
2. **Expect:** CTA hint to **Hạ tầng cơ sở → Điểm hạ tầng** — **not** new fields on legal entity static form (MST/đại diện unchanged).

### AC-META-PROP-GHR-01 (K4 smoke)

1. **Danh mục hồ sơ nhân sự** → **Cấu hình chi tiết** → add field → **Xác nhận (áp dụng)**.
2. **Expect:** preview / HRM form shows field after reopen or F5.

## Residual

- Modal **write** paths (add/delete field in modal) still persist under modal `entityId` key — canonical PUT key normalization (K3 write-side) deferred to BE/TechSpec delta.
- Legal entity form remains static by design (GAP row LE-01 in matrix = product boundary, not infra bug).

## next_owner

`qa`
