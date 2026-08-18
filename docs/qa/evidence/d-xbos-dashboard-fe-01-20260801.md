# D-XBOS-DASHBOARD-FE-01 — Dashboard Tổ chức + Khách hàng toolbar

**work_item_id:** `D-XBOS-DASHBOARD-FE-01`  
**Program:** `P-HDSD-ECOSYSTEM-03` · sweep residual  
**Date:** 2026-08-01  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior QA:** `docs/qa/evidence/qa-hdsd-bf-sweep-01-20260801.md` (TC-XBOS-HDSD-016/019 🟡 button-spot soft)

## spec_read_ack

- **srs:** UF-XBOS-10 · HDSD XBOS Ch.4 §4.2 Dashboard Tổ chức · §4.3 Khách hàng & Đối tác
- **tech_spec:** web-portal routes `/dashboard/organization` · `/dashboard/customers` · PageHeader + DataTable
- **change_mode:** FIX · **preserve:** view-only CRM policy on customers · org API scope master/member · no seed

## Root cause → fix map

| Symptom (QA sweep) | Root cause | Fix |
|--------------------|------------|-----|
| TC-XBOS-HDSD-016 🟡 — no `/bộ lọc\|tìm\|export\|xuất/i` in body | OrganizationPage had zero toolbar; TreeView used `name` not `label` | `DashboardPageToolbar` + HDSD labels (Tải lại, Bộ lọc, Tìm kiếm, Xuất Excel, Cài đặt); map `name→label`; filter/export client-side |
| TC-XBOS-HDSD-019 🟡 — no `/thêm\|tạo\|tìm/i` in body | CustomersPage relied on DataTable `searchPlaceholder` (not rendered in DOM innerText); no primary buttons | Toolbar Thêm mới / Tìm kiếm / Xuất; visible search input; «Thêm mới» opens CRM view-only notice (clickable, no POST) |

## Files touched

| File | Change |
|------|--------|
| `apps/web/web-portal/src/lib/dashboardPageToolbar.ts` | Labels, QA regex constants, org tree filter/export, customer filter/export, CODE-MEMORY |
| `apps/web/web-portal/src/lib/dashboardPageToolbar.test.ts` | 7 tests — QA regex + filter/export |
| `apps/web/web-portal/src/components/dashboard/DashboardPageToolbar.tsx` | Reusable visible-label toolbar |
| `apps/web/web-portal/src/pages/organization/OrganizationPage.tsx` | Toolbar wired; reload/filter/search/export; TreeView label fix; CODE-MEMORY |
| `apps/web/web-portal/src/pages/customers/CustomersPage.tsx` | Toolbar wired; search filter; export; add-notice; CODE-MEMORY |

## Regression

```text
apps/web/web-portal:
  pnpm exec vitest run src/lib/dashboardPageToolbar.test.ts → 7/7 PASS
  pnpm exec tsc -p tsconfig.json --noEmit → pre-existing HrmWorkspacePanel fleet key (unchanged by this WI)
```

## QA retest matrix (browser — U65)

| TC ID | URL | Click path | Expected FE |
|-------|-----|------------|-------------|
| TC-XBOS-HDSD-016 | `/dashboard/organization` | Observe toolbar → click **Bộ lọc**, **Tìm kiếm**, **Xuất Excel** | Body contains bộ lọc/tìm/xuất; buttons clickable; no console error; export downloads CSV when org data present |
| TC-XBOS-HDSD-019 | `/dashboard/customers` | Observe toolbar → click **Thêm mới**, **Tìm kiếm**, **Xuất** | Body contains thêm/tìm; Thêm mới shows CRM notice (no POST); search filters table; no console error |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · `http://127.0.0.1:5173`

## completion_report

**Closed:** Visible Vietnamese toolbar on Dashboard Tổ chức and Khách hàng matching HDSD §4.2–4.3 and QA harness regex for TC-016/019. Primary actions clickable with deterministic client-side filter/export. TreeView org labels fixed (`name→label`).

**Residual:** Customers remain view-only for create (by design — CRM notice only). Partners page not in scope (same pattern available if sweep extends). Full-stack customer POST deferred to CRM module.

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-XBOS-DASHBOARD-FE-01
from_role: pm | to_role: qa
program: P-HDSD-ECOSYSTEM-03 · sweep retest
entry_criteria: docs/qa/evidence/d-xbos-dashboard-fe-01-20260801.md READY_FOR_QA; stack :5173/:28002 up
exit_criteria: Browser U65 — TC-XBOS-HDSD-016 + TC-XBOS-HDSD-019 🟢 (toolbar regex + click); no console error on /dashboard/organization and /dashboard/customers; promote matrix rows if PASS; ack PASS_TO_PM
read_first: docs/qa/evidence/d-xbos-dashboard-fe-01-20260801.md § QA retest matrix
persona: ceo@xe.vn / Xevn@2026 · companyId=main
cấm: seed
```
