# CD-FB-06-REMOVE-SCOPE-ANNOTATIONS — Dev-FE evidence

**work_item_id:** `CD-FB-06-REMOVE-SCOPE-ANNOTATIONS`  
**date:** 2026-07-20  
**from_role:** dev-fe  
**ack_status:** READY_FOR_QA  
**change_mode:** UPGRADE  
**U65:** no seed

## Sponsor request

Remove UI annotation/context bars showing Ngữ cảnh / JWT / AC-CD-F3-03/04 hint text (space waste). Keep OU filter + portal header membership switch.

## spec_read_ack

- srs/delta: `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` §3 F3 (AC-CD-F3-03 OU filter; AC-CD-F3-04 membership)
- tech_spec/ADR: `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` §5.3
- sponsor_confirm: PM dispatch CD-FB-06-REMOVE-SCOPE-ANNOTATIONS (2026-07-20)

## Closed

| Item | Action |
|------|--------|
| HRM `PortalEmbedScopeBar` | Deleted; removed from `AppLayout` (embed + standalone) |
| Portal `HrmEmbedScopeBar` | Deleted; removed from `HrmWorkspaceRoute` |
| Annotation-only vitest | Deleted `portalEmbedScopeBar.test.ts` |
| TopHeader role VI | Kept `formatRoleCodeVi` + `scopeRoleLabels.test.ts` |
| OU filter | Kept `HrmOperatingUnitFilter` in embed AppLayout |
| Membership switch | Unchanged — portal TopHeader |

## must_keep verified (code)

- Embed AppLayout still renders `<HrmOperatingUnitFilter />` before `<Outlet />`
- `HrmWorkspaceRoute` still remounts iframe on membership/JWT (`scopeRevision` / `embedScopeKey`)
- `TopHeader` still uses `formatRoleCodeVi` for real switcher chips

## Strings removed (no longer rendered)

- «Ngữ cảnh: …» / «Ngữ cảnh HRM: …»
- Role chip as annotation-bar context (e.g. «Tổng giám đốc tập đoàn» in that strip)
- «JWT …/main · Tập đoàn (companyId=main)» annotation line
- «Lọc ĐVTV trong iframe không đổi JWT… (AC-CD-F3-03)»
- «Đổi membership trên header portal… (AC-CD-F3-04)»

Note: TopHeader membership menu may still show role VI labels — that is the real switcher UI, not the annotation bar.

## Tests run

```text
pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/components/layout/PortalEmbedRouterSync.test.ts \
  src/lib/portalEmbedSoftNavigate.test.ts
→ 7 passed

pnpm --filter web-portal exec vitest run \
  src/integrations/scopeRoleLabels.test.ts \
  src/modules/hrm/portalEmbedSoftNavGuard.test.ts
→ 7 passed
```

## Files touched

- `apps/web/hrm/src/components/layout/AppLayout.tsx` (+ CODE-MEMORY-CHANGE)
- `apps/web/web-portal/src/modules/hrm/HrmWorkspaceRoute.tsx` (+ CODE-MEMORY-CHANGE)
- `apps/web/web-portal/src/integrations/scopeRoleLabels.ts` (+ CODE-MEMORY-CHANGE callers)
- DELETED `apps/web/hrm/src/components/hrm/PortalEmbedScopeBar.tsx`
- DELETED `apps/web/hrm/src/components/hrm/__tests__/portalEmbedScopeBar.test.ts`
- DELETED `apps/web/web-portal/src/modules/hrm/HrmEmbedScopeBar.tsx`

## Residual

- None for this slice. Browser smoke needed for visual confirm (no annotation strip).

## QA smoke (narrow — U65 browser-only)

1. Login `ceo@xe.vn` → Command Center → HRM embed  
2. Assert: no «Ngữ cảnh» / JWT annotation strip above iframe or inside iframe  
3. Assert: «Đơn vị thành viên» OU filter still present and changes list scope (AC-CD-F3-03)  
4. Assert: TopHeader membership switch still works; iframe remounts (AC-CD-F3-04)  
5. Optional: standalone HRM — no PortalEmbedScopeBar strip

## next_dispatch_prompt

```text
work_item_id: CD-FB-06-REMOVE-SCOPE-ANNOTATIONS
from_role: pm
to_role: qa
lane: execution
entry_criteria: FE READY_FOR_QA; evidence docs/qa/evidence/cd-fb-06-remove-scope-annotations-20260720.md; U65 zero-seed
exit_criteria: Browser smoke — no Ngữ cảnh/JWT/AC annotation bars on HRM embed + standalone; OU filter still works; TopHeader membership switch still works; matrix/evidence update; PASS_TO_PM
cấm: seed · Phase1/PROD · fail if annotation gone but OU/membership OK
account: ceo@xe.vn / Xevn@2026
```
