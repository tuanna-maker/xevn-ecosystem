# P1-UIUX-FE-FOUNDATION-02 — Portal UX foundation wave 2 (G-UX-01 / G-UX-02)

**work_item_id:** `P1-UIUX-FE-FOUNDATION-02`  
**Date:** 2026-06-20  
**Role:** dev-fe  
**Scope:** web-portal — catalog governance, member legal save, workflow save, dept template delete (excludes Foundation-01 shareholder/legal doc paths)

## Spec ref

- `docs/qa/evidence/p1-uiux-audit-8088-r1-20260620.md` — DEF-UX-8088-04..07, UX-XBOS-03/09/11/12
- AC-UX-CFM-01, AC-UX-LOD-01

## Delivered

| UX-ID | Module | Change |
|-------|--------|--------|
| UX-XBOS-09 | `CatalogGovernancePanel.tsx` | Phê duyệt / Từ chối → `useConfirmDialog` + `MutationButton` (`decisionPending` / `Loader2`) |
| UX-XBOS-03 | `CommandCenterPage.tsx` | «Lưu thay đổi» pháp nhân → `MutationButton` `pending={companySaving}` |
| UX-XBOS-11 | `CommandCenterPage.tsx` | «Lưu quy trình» → `workflowSaving` + `MutationButton` |
| UX-XBOS-12 | `CommandCenterPage.tsx` | Xóa khung phòng/ban → `requestConfirm` (replaces `window.confirm`) |

**Reuse (Foundation-01):** `ConfirmDialog`, `useConfirmDialog`, `MutationButton` — no changes to shareholder / legal doc wiring.

## Verify commands

```bash
cd apps/web/web-portal
pnpm test -- src/components/common/ConfirmDialog.test.tsx   # 4/4 PASS
pnpm test                                                    # 256/256 PASS
pnpm build                                                   # exit 0
```

## QA retest (browser `:8088` — U65 zero-seed)

**Persona:** `ceo@xe.vn` / `Xevn@2026`

### UX-XBOS-09 — Catalog governance

1. CC → Cài đặt → Quản trị danh mục HRM (`?settings=hrm_catalog_governance`).
2. Chọn task chờ duyệt → **Phê duyệt** → modal tiếng Việt (Hủy / Phê duyệt) → Hủy (no POST) → Phê duyệt → spinner + disabled → Network POST 2xx → FE banner/empty inbox.
3. Task khác → **Từ chối** → modal destructive → confirm → spinner → POST reject 2xx.

### UX-XBOS-03 — Lưu pháp nhân member

1. CC → Đơn vị thành viên → Chỉnh sửa → **Lưu thay đổi**.
2. Button `aria-busy` + `Loader2` during PUT; disabled until complete; F5 data persists.

### UX-XBOS-11 — Lưu quy trình

1. CC → Quy trình → mở/chỉnh sửa WF → **Lưu quy trình**.
2. Spinner + disabled during save; no double-submit.

### UX-XBOS-12 — Xóa khung phòng/ban

1. CC → Khung phòng/ban → **Xóa** on row → `[role=alertdialog]` (not native confirm) → Hủy / Xóa.

## Residual (out of scope)

- Settings Vendors/KPI native `confirm` — wave CC tiếp theo
- G-UX-03 navigation skeleton / HRM embed — `P1-UIUX-FE-HRM-02`
- G-UX-05 number grouping — wave 2

---

## QA retest results — `P1-UIUX-FE-FOUNDATION-02-QA` (2026-06-20)

**Environment:** `http://14.225.217.232:8088/` · **Persona:** `ceo@xe.vn` / `Xevn@2026` · **Policy:** U65 browser-only (no seed)

**Probes:** `window.confirm` hook (`__confirmCalls`), fetch log (`__qaFetchLog`), rAF polling for `aria-busy` / `Loader2`.

| UX-ID | Route / click path | CFM (AC-UX-CFM-01) | LOD (AC-UX-LOD-01) | Network / FE after 2xx | Verdict |
|-------|-------------------|--------------------|--------------------|-------------------------|---------|
| **UX-XBOS-09** | CC → Cài đặt → Duyệt danh mục HRM (`?settings=hrm_catalog_governance`) → task → **Phê duyệt** | `[role=alertdialog]` «Phê duyệt yêu cầu danh mục» — Hủy / Phê duyệt; `__confirmCalls=0`. Hủy → no POST. **Từ chối** → dialog «Từ chối yêu cầu danh mục» destructive. | Confirm approve → `POST …/catalog-governance/tasks/{id}/approve`; inbox **105→104**; action buttons use `MutationButton` (`hasSvg` Loader2). Busy window fast (~500ms) — same component verified on 03/11. | Approve POST logged; inbox count decremented | 🟢 |
| **UX-XBOS-03** | CC → Đơn vị thành viên → Chỉnh sửa (XE_TMDV) → **Lưu thay đổi** | N/A (save) | **38 frames** `disabled=true`, `aria-busy=true`, `svg.animate-spin`; label hidden (Loader2 replaces text) | `PUT /api/xbos/org-foundation/legal-entities/{uuid}` + shareholder PUTs | 🟢 |
| **UX-XBOS-11** | CC → Hệ thống quy trình → Chỉnh sửa WF → **Lưu quy trình** | N/A | **39 frames** busy + Loader2 on save button | `PUT /api/xbos/workflow-engine/definitions/{uuid}` | 🟢 |
| **UX-XBOS-12** | CC → Hệ thống Phòng/Ban (`?settings=company_dept_system`) → row **Xóa** | `[role=alertdialog]` «Xóa khung phòng/ban» — Hủy / Xóa; `__confirmCalls=0` (not native confirm). Hủy → no DELETE. | N/A | Dialog only (cancelled) | 🟢 |

**Note:** UX-XBOS-12 fix applies to **dept system template** delete (`deleteDeptSystemTemplateRow`), route `company_dept_system`. `tenant_departments` «Xóa dòng» is a separate path (`deleteDepartmentRow`) — out of Foundation-02 scope.

**Residual (unchanged):** Settings Vendors/KPI native confirm; G-UX-03 nav skeleton; shareholder/legal doc paths (Foundation-01).

**ack_status:** `PASS_TO_PM`
