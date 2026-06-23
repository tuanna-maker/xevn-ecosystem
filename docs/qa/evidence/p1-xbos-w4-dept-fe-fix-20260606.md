# P1-XBOS-W4-DEPT-FE-FIX — J-XBOS-07 dept tree FE defects

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-XBOS-W4-DEPT-FE` |
| **journey_id** | **J-XBOS-07** |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **Date** | 2026-06-06 |

## Defects closed (FE scope)

| ID | Fix |
|----|-----|
| **D-W4-DEPT-RELOAD-01** | `loadLegalEntityDepartmentTree` matches `group-org-overview` by UI entity id (`xbos-group-holding-root` or member legal-entity UUID); `isStaleDepartmentRowCache` allows re-hydrate on F5 when only blank scaffold row present |
| **D-W4-DEPT-LEGAL-ID-01** | `resolveDepartmentSaveContext` + `submitDepartmentRow` / `deleteDepartmentRow` always resolve holding/member `legalEntityId` and correct `companyId` (`holding` vs `main`) |
| **D-W4-DEPT-HEAD-MOCK-01** | Removed static `DEPT_HEAD_OPTIONS`; Trưởng bộ phận loads from HRM `listHrmEmployees`; disabled + `ApiLoadBanner` on load failure |

## Files changed

- `apps/web/web-portal/src/integrations/orgFoundationApi.ts`
- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `apps/web/web-portal/src/integrations/orgFoundationApi.dept-tree.test.ts` (new)

## Residual (QA / BE)

- **D-W4-DEPT-OVERVIEW-01** — BE must expose holding + member trees in `group-org-overview` (dev-be W4 patch). FE fallback: `fetchOrgTreeForScope` for holding `xevn`/`holding` and member tenant direct tree.
- **D-W4-DEPT-MEMBER-EMPTY-01** — retest member tab after BE overview + FE hydrate; prior empty state may have been stale-cache + overview key mismatch.
- QA probe rows `QA-W4-PB-001`, `QA-W4-PB-002` may remain in DB — use fresh marker on retest.

## Verification (agent)

```bash
pnpm --filter web-portal test -- src/integrations/orgFoundationApi.dept-tree.test.ts
pnpm --filter web-portal test
pnpm --filter web-portal build
```

| Check | Result |
|-------|--------|
| orgFoundationApi.dept-tree.test.ts | **4/4 PASS** |
| web-portal vitest | **169/169 PASS** |
| web-portal build | **exit 0** |

## QA retest script (J-XBOS-07)

1. L0: `pnpm run qc:dev-stack`
2. Login `ceo@xe.vn` → **CÀI ĐẶT HỆ THỐNG** → **Phòng/Ban pháp nhân**
3. Tab **Tập đoàn XeVN**: add `QA-W4-PB-003` → **Lưu dòng** → F5 → row persists (code, name, function, head from HRM list)
4. Tab member **X.E Du lịch VN**: dept rows load from org-foundation (not zero inputs)
5. Trưởng bộ phận dropdown shows HRM employees (not `head-1`…`head-6` mock labels)

## Handoff

- **completion_report:** FE closed D-W4-DEPT-RELOAD-01, D-W4-DEPT-LEGAL-ID-01, D-W4-DEPT-HEAD-MOCK-01 with API-backed hydrate/save/head picker. Depends on BE overview holding tree for full J-XBOS-07 PASS.
- **next_owner:** **qa**
- **next_dispatch_prompt:** See below.
- **evidence_path:** `docs/qa/evidence/p1-xbos-w4-dept-fe-fix-20260606.md`

### next_dispatch_prompt (copy-ready)

```text
P1-XBOS-W4-DEPT-TREE — QA retest J-XBOS-07 after dev-fe fix

Entry: docs/qa/evidence/p1-xbos-w4-dept-fe-fix-20260606.md (READY_FOR_QA).
Prerequisite: dev-be D-W4-DEPT-OVERVIEW-01 merged/restarted if holding tree still empty in group-org-overview probe.

L0 qc:dev-stack → L2.5 J-XBOS-07 on :5173 with ceo@xe.vn:
- Settings → Phòng/Ban pháp nhân → Tập đoàn: save QA-W4-PB-003 → F5 → row persists
- Member tab: dept rows visible
- Trưởng bộ phận: HRM employee options (no head-1 mock)

Evidence: docs/qa/evidence/p1-xbos-w4-dept-tree-retest-20260606.md
ack_status: PASS_TO_PM or FAIL with defect id
```
