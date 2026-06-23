# P1-P0-FE-VERSION-PUBLISH-404-01 — Evidence

**work_item_id:** `P1-P0-FE-VERSION-PUBLISH-404-01`  
**Date:** 2026-06-05  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`

## Defect

On `http://14.225.217.232:8088/command-center?settings=company_member_units`, saving dept system templates triggered:

```
POST /version/publish → 404
```

Root cause: `CommandCenterPage.tsx` `publishVersionChange()` called legacy `/version/publish` (no vite proxy, nginx route, or backend). Real persistence already succeeded via `POST /api/xbos/business-master/dept_system_templates` (200).

## Fix

**File:** `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`

- Removed dead `publishVersionChange()` and all 5 call sites:
  - `infrastructure-foundation-category`
  - `dept-system-foundation-template`
  - `infrastructure-site`
  - `workflow-system`
  - `company_infrastructure`
- Removed unused `payload` local in infrastructure fields config modal.
- Success messages remain on domain API paths (`upsertDeptSystemTemplate`, `saveInfrastructureSettingsToDb`, `saveWorkflowDefinition`, etc.).
- No fake `/version/publish` route added (aligned with `docs/xbos/COMMAND_CENTER_P0_SRS.md` § deprecation).

## Verification

```bash
pnpm --filter web-portal test   # 148/148 PASS
pnpm --filter web-portal build  # exit 0
```

**grep:** no remaining `/version/publish` or `publishVersionChange` in `apps/web/web-portal`.

## QA retest (L2)

1. Login `ceo@xe.vn` / `Xevn@2026`.
2. Command Center → Thiết lập → Khung phòng/ban (dept system templates).
3. Edit/save a template.
4. **Expect:** Network tab shows `PUT/POST /api/xbos/business-master/dept_system_templates/...` **200**; **no** `POST /version/publish`.
5. **Expect:** UI success message «Đã lưu khung phòng ban và phạm vi ORG GRADE (DB).»; no spurious 404 toast.

## Residual

- Optional audit trail via `POST /api/xbos/version/publish` deferred to P0.5 per SRS (not in scope).
