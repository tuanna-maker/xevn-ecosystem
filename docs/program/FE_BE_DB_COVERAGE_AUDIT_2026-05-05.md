# FE-BE-DB Coverage Audit (2026-05-05)

## Ket luan nhanh
- Da con nhieu man nghiep vu dang chay mock/local-state, chua co ket noi API/DB day du.
- Da sua nen tang tenancy de mo rong nhieu tenant, `xevn` la master tenant mac dinh.

## Da xu ly trong dot nay
- XBOS infrastructure API bo xoa tenant cheo (`DELETE tenant_id <> ...`), truyen `tenantId` xuyen suot controller -> service.
- HRM settings catalog seed bo co che xoa tenant khac, seed theo `tenantId` truyen vao.
- Command Center bo hardcode scope ha tang (`xevn/holding`), chuyen sang `resolveIdentityScope(...)`.
- Script cleanup tenant dat co an toan: bat buoc `ALLOW_CROSS_TENANT_PURGE=true` moi duoc purge tenant cheo.

## Cac man P0 can uu tien chuyen sang FE+BE+DB that
- `apps/web/web-portal/src/pages/hr/HRPage.tsx`
- `apps/web/web-portal/src/pages/kpi/KPIDashboardPage.tsx`
- `apps/web/web-portal/src/pages/kpi-policy/KPIPolicyPage.tsx`
- `apps/web/web-portal/src/pages/settings/KPIMetricsSettingsPage.tsx`
- `apps/web/web-portal/src/pages/settings/PositionsSettingsPage.tsx`
- `apps/web/web-portal/src/pages/settings/VendorsSettingsPage.tsx`
- `apps/web/web-portal/src/pages/settings/ExpenseCategoriesSettingsPage.tsx`
- `apps/web/web-portal/src/pages/organization/OrganizationPage.tsx`
- `apps/web/web-portal/src/pages/customers/CustomersPage.tsx`
- `apps/web/web-portal/src/pages/partners/PartnersPage.tsx`
- `apps/web/web-portal/src/contexts/GlobalFilterContext.tsx`
- `apps/web/x-bos-core/src/store/useXbosStore.ts`
- `apps/web/x-bos-core/src/pages/kpi/KpiProgressPage.tsx`
- `apps/web/x-bos-core/src/pages/kpi/RewardPenaltyCalcPage.tsx`

## Khe ho API/DB can bo sung de loai mock
- Company registry endpoint de thay `mockCompanies` cho global scope.
- KPI policy/metric master-data endpoint cho portal settings.
- Customer/partner master-data endpoint.
- Organization tree endpoint cho `OrganizationPage`.
- KPI compute endpoint cho x-bos-core (progress + reward/penalty).

## Nguyen tac tenancy sau khi mo rong
- `xevn` la master tenant (mac dinh qua `MASTER_TENANT_ID`), khong duoc xoa tenant khac trong runtime flow.
- Moi du lieu nghiep vu phai doc/ghi theo `(tenant_id, company_id)` ro rang.
- Chi script/endpoint admin co co che purge tenant, va phai explicit flag/authorization.

