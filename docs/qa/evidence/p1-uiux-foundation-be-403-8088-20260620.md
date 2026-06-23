# P1-UIUX-FE-FOUNDATION-01-BE-403 — group-member-units 403 fix

**work_item_id:** `P1-UIUX-FE-FOUNDATION-01-BE-403`  
**Date:** 2026-06-20  
**Role:** dev-be  
**Blocker:** QA UX-XBOS-06 on `:8088` — `GET /api/xbos/tenant-scope/group-member-units` → **403** `Group member units require master tenant membership` for `ceo@xe.vn`, preventing «Chỉnh sửa Tập đoàn» + Loader2 submit retest.

## spec_ref

- `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` §3–§4 — group CEO on `xevn` / `group_ceo` must access group legal surfaces
- `docs/qa/evidence/p1-uiux-fe-foundation-8088-20260620.md` § Env blocker

## Root cause

`TenantScopeService.groupMemberUnits` required an active **DB row** in `xbos_user_tenant_membership` joined to master `xbos_tenant_registry`. On VPS `:8088`, pilot membership for `ceo@xe.vn` could be missing/stale after container recycle while JWT still carried `tenantId=xevn` + `roleCode=group_ceo` from login — strict DB-only gate returned **403** despite valid group CEO session.

Member CEOs (`du-lich.ceo@xe.vn`) must remain **403** (U28-R2 negative).

## Fix

| File | Change |
|------|--------|
| `auth/pilot-membership.bootstrap.ts` | Shared idempotent upsert for `PILOT_PORTAL_USERS` memberships |
| `auth/auth.service.ts` | `ensurePilotMembershipForUser` on every login (repair drift) |
| `tenant-scope/tenant-scope.service.ts` | `groupMemberUnits(userId, jwtContext)` — allow `isGroupCeoOnMasterTenant` JWT path; lazy membership repair when JWT is group CEO |
| `tenant-scope/tenant-scope.controller.ts` | Pass `tenantId` + `roleCode` from verified JWT to service |

## Verification (local)

```bash
cd apps/api/xbos-api
pnpm exec jest --testPathPatterns="tenant-scope|pilot-membership|auth.service"
# 22/22 PASS

pnpm run build
# exit 0
```

### Key regression cases

- Group CEO JWT + missing membership → **200** path (repair + list units)
- Member CEO JWT → **403** unchanged
- Controller forwards JWT context to service

## VPS retest (QA)

After `xbos-be` recreate / pscp deploy:

```powershell
$body = '{"email":"ceo@xe.vn","password":"Xevn@2026"}'
$r = Invoke-RestMethod -Uri "http://14.225.217.232:8088/api/xbos/auth/login" -Method POST -Body $body -ContentType "application/json"
$hdr = @{ Authorization = "Bearer $($r.accessToken)" }
$gmu = Invoke-WebRequest -Uri "http://14.225.217.232:8088/api/xbos/tenant-scope/group-member-units" -Headers $hdr -UseBasicParsing
# expect gmu.StatusCode = 200, code XBOS-TENANT-200
```

Browser: `ceo@xe.vn` → CÀI ĐẶT → Đơn vị thành viên → «Chỉnh sửa» Tập đoàn → UX-XBOS-06 Loader2 on ✓ submit + F5.

## Handoff

**ack_status:** `READY_FOR_QA`

**completion_report:** Closed BE 403 on `group-member-units` for group CEO via JWT scope parity + login/membership self-heal. Member 403 preserved.

**residual:** VPS deploy required before browser retest; `groupOrgOverview` still DB-only (not in UX-XBOS-06 path).

**next_owner:** `qa`

**next_dispatch_prompt:**

```text
work_item_id: P1-UIUX-FE-FOUNDATION-01-QA-R2
entry: docs/qa/evidence/p1-uiux-foundation-be-403-8088-20260620.md — after xbos-be deploy on :8088
exit: ceo@xe.vn GET group-member-units 200; Command Center → Đơn vị thành viên → Chỉnh sửa Tập đoàn → UX-XBOS-06 Loader2 visible on ✓ submit; POST 2xx + F5; update UIUX_INTERACTION_AUDIT_MATRIX UX-XBOS-06 🟢
evidence: docs/qa/evidence/p1-uiux-fe-foundation-8088-20260620.md (append R2)
ack_status: PASS_TO_PM or FAIL with network trace
cấm: seed; browser-only U65
```
