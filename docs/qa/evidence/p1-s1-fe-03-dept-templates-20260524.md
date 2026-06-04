# P1-S1-FE-03 — Command Center dept system templates CRUD

**work_item_id:** `P1-S1-FE-03`  
**date:** 2026-05-24  
**owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**audit:** `docs/ecosystem/FE_MOCK_TO_API_AUDIT.md` (W14 — khung PB mẫu)

## Summary

Command Center **Hệ thống Phòng/Ban → Danh mục khung** loads and persists via XBOS `business-master/dept_system_templates` (list / PUT upsert / DELETE). Mock `INITIAL_DEPT_SYSTEM_TEMPLATES` only when `VITE_ALLOW_MOCK_FALLBACK=true` in dev (FE-01/02 policy). Create, edit, delete from detail footer; list refresh after save/delete.

## API contracts wired

| Action | Endpoint | FE module |
|--------|----------|-----------|
| List | `GET /api/xbos/business-master/dept_system_templates/items?tenantId&companyId` | `deptSystemTemplatesApi.listDeptSystemTemplates` |
| Upsert | `PUT /api/xbos/business-master/dept_system_templates/items/:id` | `deptSystemTemplatesApi.upsertDeptSystemTemplate` |
| Delete | `DELETE /api/xbos/business-master/dept_system_templates/items/:id` | `deptSystemTemplatesApi.deleteDeptSystemTemplate` |

Scope: `resolveIdentityScope()` via `businessMasterApi` (JWT tenant/company).

## Strict vs mock

| Flag | Empty API | API error |
|------|-----------|-----------|
| `VITE_ALLOW_MOCK_FALLBACK=false` | Empty table + optional `ApiLoadBanner` | Empty + `ApiLoadBanner` |
| `VITE_ALLOW_MOCK_FALLBACK=true` | `INITIAL_DEPT_SYSTEM_TEMPLATES` + amber notice | Same mock + `loadFailed` banner |

## Seed (QA)

```bash
pnpm seed:business-master:settings-md
```

Seeds `dtpl-001` (`PB-ORG-XEVN-01`) into `dept_system_templates`.

## Files changed

- `apps/web/web-portal/src/integrations/deptSystemTemplatesApi.ts` (+ test)
- `apps/web/web-portal/src/hooks/useDeptSystemTemplates.ts`
- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `scripts/seed-business-master-settings-placeholders.mjs` (dept template row)

## Build / test evidence

```bash
cd apps/web/web-portal
pnpm test    # 41 passed (9 files)
pnpm build   # PASS
```

## QA matrix (L2 — Command Center org settings)

**Pre:** `ceo@xe.vn` / `Xevn@2026` → Command Center → Cài đặt → **Hệ thống Phòng/Ban** → tab **Danh mục khung**; xbos-api `:28002`; run seed above.

| # | Check | Expected |
|---|--------|----------|
| FE03-1 | Network on tab open | `GET .../business-master/dept_system_templates/items` **200** |
| FE03-2 | Strict (no mock flag) | No mock banner; row from seed or empty — not hardcoded local-only list |
| FE03-3 | Thêm khung mới → Lưu | `PUT .../items/dtpl-*` **200**; row appears after reload |
| FE03-4 | Chi tiết → sửa → Lưu | `PUT` **200**; fields persist on re-open |
| FE03-5 | Xóa khung | `DELETE .../items/:id` **200**; row removed from table |
| FE03-6 | Dev mock only | With `VITE_ALLOW_MOCK_FALLBACK=true`, amber mock notice if API empty |

## Residual risk

- `appliesToCompanyIds` in seed use prototype IDs (`comp-001`…); align with live legal-entity IDs when org-foundation list diverges.
