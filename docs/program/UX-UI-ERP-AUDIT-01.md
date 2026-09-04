# UX-UI-ERP-AUDIT-01 — Brand identity + ERP UI/UX audit

| Field | Value |
|-------|-------|
| **work_item_id** | `UX-UI-ERP-AUDIT-01` |
| **role** | ux-research + ba-process |
| **status** | OPEN |
| **requester** | PM |
| **related** | U72 display-label rule |
| **date** | 2026-07-28 |

---

## 0. Entry / scope

Research FE implementation from canonical paths:
- `apps/web/hrm/src/pages/` (33 .tsx pages)
- `apps/web/hrm/src/components/` (21 feature dirs)
- `apps/web/web-portal/src/pages/command-center/` (XBOS CC)
- `apps/web/x-bos-core/src/pages/` (XBOS core)
- `apps/mobile/hrm-mobile/src/` (~293 .ts/.tsx)

Task: Nghiên cứu toàn bộ UI/UX hệ thống, đối chiếu với chuẩn ERP enterprise, đề xuất cải thiện.

---

## 1. Obiettivi audit

1. **Brand identity**: màu sắc, typography, spacing, icon system có nhất quán không?
2. **ERP layout chuẩn**: sidebar, topbar, breadcrumb, table toolbar, form layout có follow pattern enterprise không?
3. **Popup/dialog/modal**: kích thước, animation, nút hành động có chuẩn không?
4. **Danh sách (table/list)**: sorting, filtering, pagination, bulk action, empty state có đủ không?
5. **Nút (button)**: hierarchy primary/secondary/ghost, disabled state, loading, icon+text có nhất quán không?
6. **Thao tác workflow**: form multi-step, confirmation, inline edit, undo có tối ưu không?
7. **Từng màn**: phân tích UX chi tiết từng trang chính

---

## 2. Deliverables

| # | Output | Format |
|---|--------|--------|
| 1 | Brand identity audit | Markdown: color system, typography, spacing, icon usage |
| 2 | Layout pattern audit | Bảng đánh giá từng màn |
| 3 | Component inventory | Button/popup/table/form variants |
| 4 | ERP UX improvement backlog | P0/P1/P2 + rationale |

---

## 3. Suggested lanes

| Lane | Agent role | Focus |
|------|-----------|-------|
| L1 | ux-lead | Brand + layout pattern |
| L2 | ui-dev | Component inventory |
| L3 | erp-analyst | Workflow + backlog |

---

## 4. Entry criteria

- FE paths confirmed (apps/web/hrm, web-portal, x-bos-core)

---

## 5. Exit criteria

- [ ] Brand audit markdown at `docs/qa/evidence/ux-ui-brand-audit-01-YYYYMMDD.md`
- [ ] Component inventory at `docs/qa/evidence/ux-ui-component-inventory-01-YYYYMMDD.md`
- [ ] ERP match matrix per screen at `docs/qa/evidence/ux-ui-erp-screen-matrix-01-YYYYMMDD.md`
- [ ] Improvement backlog at `docs/qa/evidence/ux-ui-erp-backlog-01-YYYYMMDD.md`
