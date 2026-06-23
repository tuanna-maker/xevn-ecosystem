# P1-CC-DEPT-REF-SYNC-FE-01 — ORG GRADE reference tab sync

**work_item_id:** `P1-CC-DEPT-REF-SYNC-FE-01`  
**role:** dev-fe  
**date:** 2026-06-06  
**ack_status:** `READY_FOR_QA`

## Bug (user-reported U31/U32)

Saving custom org grade titles in **Settings → Hệ thống Phòng/Ban → Danh mục khung → Chi tiết → Lưu khung phòng/ban** did not appear when switching to tab **Tham chiếu ORG GRADE**. Root cause: reference tab rendered static `ORG_GRADE_LEVELS` only; `gradeTitleLayout` from DB was never shown.

## UX change (exact)

### Tab **Tham chiếu ORG GRADE** (restructured)

1. **Section "Khung đã lưu"** (primary, above fold)
   - Dropdown **Chọn khung xem trước** — lists all templates from `deptSystemTemplates` (DB / mock).
   - Read-only chart using saved `gradeTitleLayout` + `enabledOrgGradeLevels` via extended `OrgGradeOrgChart` props.
   - Heading shows template name; footer notes data is read-only preview from DB.

2. **Collapsible "Chuẩn tập đoàn (read-only)"** (`<details>`)
   - Unchanged static 9-level master reference (`ORG_GRADE_LEVELS`).
   - Clearly separated from saved templates.

### Round-trip persistence

- **`openDeptSystemDetail`**: `await deptTemplatesHook.reload()` before opening — detail form loads fresh API data, not stale list state.
- **`saveDeptSystemTemplate`**: after `upsertDeptSystemTemplate`, `await reload()` and refresh `deptSystemForm` from returned row when detail still open; auto-select saved template in reference preview.
- **Tab switch**: `switchDeptSystemTab()` calls `reload()` on both **Tham chiếu ORG GRADE** ↔ **Danh mục khung** so list/detail/reference stay in sync.

## Files changed

| File | Change |
|------|--------|
| `apps/web/web-portal/src/components/org/OrgGradeOrgChart.tsx` | Optional `enabledLevels` + `titleLayout` props for saved-template preview |
| `apps/web/web-portal/src/components/org/OrgGradeOrgChart.test.tsx` | Regression: custom titles vs static master |
| `apps/web/web-portal/src/hooks/useDeptSystemTemplates.ts` | `reload()` returns fresh `DeptSystemFoundationTemplate[]` |
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | Reference tab UX, `switchDeptSystemTab`, async open/save with refetch |

## User verification (manual — QA L2)

**Account:** `ceo@xe.vn` / `Xevn@2026` · **URL:** `http://localhost:5173` → Command Center → Cài đặt → Hệ thống Phòng/Ban

| Step | Action | Expected |
|------|--------|----------|
| 1 | Tab **Danh mục khung** → **Chi tiết** on a template (or **Thêm khung mới**) | Detail editor opens |
| 2 | In **Sơ đồ khung — CRUD & kéo thả**, add a unique title e.g. `QA-TEST-TITLE-20260606` at level 1 | Title visible in editor |
| 3 | Fill required fields (mã, tên, ≥1 pháp nhân, ≥1 cấp ORG) → **Lưu khung phòng/ban** | Toast/message: đã lưu DB |
| 4 | **Quay lại** → **Chi tiết** same template | Editor shows `QA-TEST-TITLE-20260606` (not reverted to static CHỦ TỊCH only) |
| 5 | Switch tab **Tham chiếu ORG GRADE** | Section **Khung đã lưu** shows dropdown; chart displays `QA-TEST-TITLE-20260606` |
| 6 | Expand **Chuẩn tập đoàn (read-only)** | Static master still shows `CHỦ TỊCH` / `TỔNG GIÁM ĐỐC` — unchanged |
| 7 | Switch back to **Danh mục khung** and return to **Tham chiếu** | Saved title still visible (refetch on tab switch) |

## Automated evidence

```text
pnpm --filter web-portal test
# Test Files  35 passed (35)
# Tests       159 passed (159)

pnpm --filter web-portal build
# exit 0
```

New tests: `src/components/org/OrgGradeOrgChart.test.tsx` (2/2 PASS).

## completion_report

**Closed:**
- Reference tab shows saved `gradeTitleLayout` via template dropdown + read-only chart.
- Static master preserved in collapsible **Chuẩn tập đoàn**.
- Save → Quay lại → Chi tiết round-trip uses fresh API via `reload()`.
- Tab switch triggers refetch to avoid stale list/reference.

**Residual:**
- QA manual L2 on live stack (`localhost:5173` + xbos-api `:28002`) not run by dev-fe this session.
- No J-* journey id mapped (settings admin flow; matrix row UC-XBOS-CC-08).

## next_owner

`qa`

## next_dispatch_prompt

```
QA task xevn-ecosystem — P1-CC-DEPT-REF-SYNC-FE-01 retest (READY_FOR_QA).

work_item_id: P1-CC-DEPT-REF-SYNC-FE-01
evidence_path: docs/qa/evidence/p1-dept-ref-sync-fe-20260606.md

Entry: web-portal vitest 159/159 + build exit 0; dev-fe wired reference tab to saved gradeTitleLayout.

L2 manual (ceo@xe.vn / Xevn@2026, localhost:5173):
Settings → Hệ thống Phòng/Ban → Danh mục khung → Chi tiết → add unique title → Lưu → Quay lại → Chi tiết (title persists) → tab Tham chiếu ORG GRADE (Khung đã lưu dropdown + chart shows title; Chuẩn tập đoàn collapsible unchanged).

Exit: PASS with screenshot or note in evidence; ack_status PASS_TO_PM or FAIL with route/step.
```

## evidence_path

`docs/qa/evidence/p1-dept-ref-sync-fe-20260606.md`
