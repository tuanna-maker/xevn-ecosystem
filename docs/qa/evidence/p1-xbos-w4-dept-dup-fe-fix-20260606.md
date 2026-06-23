# P1-XBOS-W4-DEPT-DUP-SAVE — D-W4-DEPT-DUP-SAVE-01 FE fix

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-XBOS-W4-DEPT-DUP-SAVE` |
| **defect_id** | **D-W4-DEPT-DUP-SAVE-01** |
| **journey_id** | **J-XBOS-07** |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **Date** | 2026-06-06 |
| **entry** | `docs/qa/evidence/p1-xbos-w4-dept-tree-retest-20260606.md` |

## Problem

Re-save department row with code already persisted in DB (client scaffold id, e.g. after F5 blank hydrate) issued `POST /org-foundation/org-units` → HTTP **500** duplicate key → red banner `org-foundation.org-units.create failed: duplicate key …`.

## Fix

| Layer | Change |
|-------|--------|
| **orgFoundationApi.ts** | `saveOrgUnit` proactively resolves existing unit id by code via org tree → **PUT**; reactive fallback on duplicate-key POST error |
| **CommandCenterPage.tsx** | `submitDepartmentRow` passes cached persisted id when same code exists in entity rows; delegates upsert to `saveOrgUnit` |

## Files changed

- `apps/web/web-portal/src/integrations/orgFoundationApi.ts`
- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `apps/web/web-portal/src/integrations/orgFoundationApi.dept-tree.test.ts`

## Residual (BE / QA)

- **D-W4-DEPT-RELOAD-01** / **D-W4-DEPT-LEGAL-MATCH-01** — holding F5 hydrate still depends on dev-be overview tree fix; this FE fix prevents 500 on re-save when unit exists in tree API.
- QA retest: save `QA-W4-PB-004` on Tập đoàn tab → no duplicate banner → F5 row visible (after BE reload fix).

## Verification (agent)

```bash
pnpm --filter web-portal test -- src/integrations/orgFoundationApi.dept-tree.test.ts
pnpm --filter web-portal test
pnpm --filter web-portal build
```

| Check | Result |
|-------|--------|
| orgFoundationApi.dept-tree.test.ts | **8/8 PASS** |
| web-portal vitest | **173/173 PASS** |
| web-portal build | **exit 0** |

## QA retest script

1. L0: `pnpm run qc:dev-stack`
2. Login `ceo@xe.vn` → **CÀI ĐẶT HỆ THỐNG** → **Phòng/Ban pháp nhân** → tab **Tập đoàn**
3. Enter code already in DB (or save once, F5 if blank, re-enter same code) → **Lưu dòng** → expect **200 PUT or 201**, message «Đã lưu phòng ban», **no** duplicate-key 500 banner
4. F5 → row persists (requires BE D-W4-DEPT-RELOAD-01 closed for full J-XBOS-07 PASS)

## Handoff

- **completion_report:** Closed D-W4-DEPT-DUP-SAVE-01 — duplicate department code upserts via PUT instead of failing POST. Residual: holding F5 hydrate (dev-be).
- **next_owner:** **qa**
- **next_dispatch_prompt:** See below.
- **evidence_path:** `docs/qa/evidence/p1-xbos-w4-dept-dup-fe-fix-20260606.md`

### next_dispatch_prompt (copy-ready)

```text
P1-XBOS-W4-DEPT-DUP-SAVE — QA retest D-W4-DEPT-DUP-SAVE-01 + J-XBOS-07 holding save

Entry: docs/qa/evidence/p1-xbos-w4-dept-dup-fe-fix-20260606.md (READY_FOR_QA).
Prerequisite: dev-be D-W4-DEPT-LEGAL-MATCH-01 + D-W4-DEPT-RELOAD-01 if F5 still blank.

L0 qc:dev-stack → Settings → Phòng/Ban pháp nhân → Tập đoàn:
- Save QA-W4-PB-004 (or re-save existing code after F5 blank row) → no HTTP 500 duplicate banner; success toast
- F5 → row persists on holding tab

Evidence: docs/qa/evidence/p1-xbos-w4-dept-tree-retest-20260606.md (update verdict)
ack_status: PASS_TO_PM or FAIL with defect id
```
