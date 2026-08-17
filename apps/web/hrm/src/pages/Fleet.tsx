/**
 * @CODE-MEMORY
 * Screen:     /fleet · Hồ sơ xe (du lịch / ĐV được cấp)
 * UC:         FR-HRM-FL-01 / HRM-FL-01
 * BR:         FL-01 list-only · U65 empty OK · G-FL-07 catalog-missing UX
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.49 Diễn biến #2/#3/#4/#7/#8
 * TechSpec:   docs/hrm/TECHSPEC.md §16.5 · docs/hrm/API_DESIGN_HRM_FLEET.md §A
 * Purpose:    Bảng hồ sơ xe chỉ xem; empty trung thực; báo thiếu danh mục VI;
 *             tìm biển/tên qua BE `q`; không nút tạo xe; không lộ raw key.
 * WorkItem:   D-FE-HRM-FLEET-CATALOG-UX-01
 * Coded:      2026-07-27
 * Callers:    App.tsx Route /fleet
 * Callees:    useFleetVehicles · fleetCatalogUx · LinkedDataEmptyNotice helpers (catalog sync)
 * FEActions:
 *   | Thao tác        | Handler              | Lib / API                         |
 *   |-----------------|----------------------|-----------------------------------|
 *   | Mở Hồ sơ xe     | useFleetVehicles     | GET /api/hrm/fleet/vehicles       |
 *   | Tìm biển/tên    | setKeyword → q       | GET …?q= (G-FL-02)                |
 *   | Thiếu danh mục  | catalog banner       | settings-catalogs overview share  |
 * Impact:     Spinner storm / raw keys / invent create = FAIL G-FL-07
 * must_keep:  FL-01 list-only · U65 · no invent upsert · soft U72 maps untouched · HOLD_DEPLOY
 * SOLID:      Page presentation; hook server state; pure UX helpers
 * LastVerified: lib/fleetCatalogUx.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 W1-B-02-EMP-FE-FLEET-01
 * change_mode: ADD (restore)
 * What: Restore pages/Fleet.tsx + useFleetVehicles + fleetCatalogUx from stash 43c479a
 * Why: App.tsx lazy import ./pages/Fleet missing → Vite 500 whitescreen blocks /hr/employees J-HRM-02
 * must_keep: FL-01 list-only · Employees/EmployeeProfile routes · App.tsx route table · U65 · no invent create
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ExternalLink, Loader2, Search, Truck } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFleetVehicles } from '@/hooks/useFleetVehicles';
import {
  EM_DASH,
  readFleetFieldString,
  resolveFleetEmptyCopy,
  resolveFleetStatusDisplay,
  resolveFleetVehicleDisplayName,
} from '@/lib/fleetCatalogUx';
import { navigatePortalCatalogSync } from '@/lib/hrmLinkedDataEmpty';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { toErrorMessage } from '@/lib/apiError';

export default function FleetPage() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const {
    vehicles,
    total,
    isLoading,
    isError,
    error,
    catalogMissing,
    catalogsLoading,
  } = useFleetVehicles({ keyword });

  const portalEmbed =
    typeof window !== 'undefined' && getHrmPortalMode(window.location.search);

  const emptyCopy = resolveFleetEmptyCopy({
    vehicleTotal: total,
    keyword,
    catalogMissing,
  });

  const showCatalogBanner = catalogMissing && !catalogsLoading;

  return (
    <div className="space-y-4 md:space-y-6" data-testid="fleet-page">
      <PageHeader
        title={t('fleet.title', 'Hồ sơ xe')}
        subtitle={t(
          'fleet.description',
          'Danh sách hồ sơ xe theo đơn vị — chỉ xem (không tạo mới ở bước này)',
        )}
      />

      {showCatalogBanner ? (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-amber-950"
          role="status"
          data-testid="fleet-catalog-missing-banner"
        >
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium">{emptyCopy.kind === 'catalog_missing' ? emptyCopy.title : 'Cần cấu hình danh mục hồ sơ xe'}</p>
              <p className="text-sm leading-relaxed">
                {emptyCopy.kind === 'catalog_missing'
                  ? emptyCopy.body
                  : 'Chưa đồng bộ danh mục thuộc tính xe. Đồng bộ danh mục trước khi khai thác đầy đủ.'}
              </p>
              {portalEmbed ? (
                <Button
                  type="button"
                  variant="link"
                  className="mt-1 h-auto p-0 text-xs font-semibold text-primary"
                  onClick={() => navigatePortalCatalogSync()}
                >
                  Mở đồng bộ danh mục HRM (Command Center)
                  <ExternalLink className="ml-1 inline h-3 w-3" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
          <Input
            data-testid="fleet-search-input"
            placeholder={t('fleet.searchPlaceholder', 'Tìm biển số / tên xe…')}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-9"
            aria-label={t('fleet.searchPlaceholder', 'Tìm biển số / tên xe…')}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10" data-testid="fleet-loading">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" aria-label="Đang tải" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-8 text-center text-destructive space-y-2" data-testid="fleet-error">
            <AlertCircle className="w-10 h-10 mx-auto opacity-70" aria-hidden />
            <p className="font-medium">Không tải được danh sách hồ sơ xe</p>
            <p className="text-sm text-muted-foreground">
              {toErrorMessage(error, 'Vui lòng thử lại sau.')}
            </p>
          </CardContent>
        </Card>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent
            className="p-8 text-center text-muted-foreground space-y-2"
            data-testid="fleet-empty"
            data-empty-kind={emptyCopy.kind}
          >
            <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden />
            <p className="font-medium text-foreground">{emptyCopy.title}</p>
            <p className="text-sm max-w-md mx-auto">{emptyCopy.body}</p>
          </CardContent>
        </Card>
      ) : (
        <Card data-testid="fleet-table-card">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-3 font-semibold">BKS</th>
                  <th className="px-4 py-3 font-semibold">Tên / Model</th>
                  <th className="px-4 py-3 font-semibold">Lái xe</th>
                  <th className="px-4 py-3 font-semibold">Tuyến</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((row) => {
                  const statusLabel = resolveFleetStatusDisplay(row.status);
                  const isActive = (row.status ?? '').toLowerCase() === 'active';
                  return (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium tabular-nums">
                        {row.license_plate?.trim() || EM_DASH}
                      </td>
                      <td className="px-4 py-3">
                        {resolveFleetVehicleDisplayName(row.fleet_fields)}
                      </td>
                      <td className="px-4 py-3">
                        {readFleetFieldString(row.fleet_fields, 'driver_name') || EM_DASH}
                      </td>
                      <td className="px-4 py-3">
                        {readFleetFieldString(row.fleet_fields, 'route_name') || EM_DASH}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={isActive ? 'default' : 'secondary'}>{statusLabel}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="px-4 py-2 text-xs text-muted-foreground tabular-nums" data-testid="fleet-total">
              Tổng: {total} xe
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
