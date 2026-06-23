# P1-GHR-SYNC-SCOPE-FE — D-U34-GHR-EMP-409-01 + D-U34-GHR-SYNC-SLOW-01 (FE)

**work_item_id:** `P1-GHR-SYNC-SCOPE-FE`  
**role:** dev-fe  
**date:** 2026-06-06  
**route:** `localhost:5173/command_center?settings=company_member_units` (settings workspace) + tab **Danh mục hồ sơ nhân sự** (`company_group_hr`) popup sync

## Defects closed

| ID | Symptom | Fix |
|----|---------|-----|
| D-U34-GHR-EMP-409-01 | Console 409 on `GET /api/hrm/employees` while on settings tabs other than Phòng/Ban | `listHrmEmployees` effect gated with `activeSettingsMenuRef`; early return before/after fetch when menu ≠ `tenant_departments`; scope via `resolveGroupHrHrmCatalogScope` (`xevn` + `main`) |
| D-U34-GHR-SYNC-SLOW-01 | Sequential POST per catalog bucket | `syncGroupHrFieldDefsToHrm` uses `Promise.all` for non-empty buckets |
| UX | Frozen «Đang đồng bộ…» | Progress label «Đang đồng bộ danh mục N/M…» via `GroupHrSyncProgress` callback |
| Scope | `companyId` always null on sync/fetch | `resolveGroupHrHrmCatalogScope` — master JWT → `xevn` + `resolveHrmOperationalCompanyId(..., main)` |

## Files

- `apps/web/web-portal/src/integrations/groupHrCatalogApi.ts` — scope helper, parallel sync, progress hook
- `apps/web/web-portal/src/integrations/groupHrCatalogApi.test.ts` — 2 regressions
- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` — employees guard, sync handler, progress UI

## Verification

```bash
pnpm --filter web-portal exec vitest run src/integrations/groupHrCatalogApi.test.ts  # 2/2 PASS
pnpm --filter web-portal exec vitest run                                           # 180/180 PASS
pnpm --filter web-portal build                                                     # exit 0
```

## QA retest (L2.5)

1. Login `ceo@xe.vn` / `Xevn@2026` → Command Center → Cài đặt → **Đơn vị thành viên** — console: **no** `409` on `/api/hrm/employees`.
2. Tab **Danh mục hồ sơ nhân sự** → **Cấu hình chi tiết** → **Xác nhận (áp dụng)** — button shows `Đang đồng bộ danh mục 1/N…` through `N/N`; sync completes without scope 409 on settings-catalogs.
3. Network: `x-tenant-id=xevn`, `x-company-id=main` on HRM catalog POST/GET from popup.

## Residual

- BE batch endpoint for single-call catalog sync (optional; FE parallel POST is sufficient for pilot).
- `tenant_departments` dept-head picker still loads employees only on that tab (by design).

**ack_status:** `READY_FOR_QA`
