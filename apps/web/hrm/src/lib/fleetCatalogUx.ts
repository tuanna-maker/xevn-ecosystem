/**
 * @CODE-MEMORY
 * Screen:     /fleet · Hồ sơ xe (du lịch) — empty / catalog-missing UX
 * UC:         FR-HRM-FL-01 / HRM-FL-01
 * BR:         FL-01 list-only · U65 empty OK · no fake rows
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.49 FR-HRM-FL-01 Diễn biến #3/#4/#7/#8
 * TechSpec:   docs/hrm/TECHSPEC.md §16.5 FR-HRM-FL-01
 * API_DESIGN: docs/hrm/API_DESIGN_HRM_FLEET.md §A · residual G-FL-07
 * Purpose:    Pure helpers — empty trung thực, báo thiếu danh mục VI, không lộ raw catalog key.
 * WorkItem:   D-FE-HRM-FLEET-CATALOG-UX-01
 * Coded:      2026-07-27
 * Callers:    pages/Fleet.tsx · hooks/useFleetVehicles.ts
 * Callees:    none (pure)
 * FEActions:  List empty · catalog missing banner · keyword empty · status/field display
 * Impact:     Sai map → lộ raw key / spinner storm / giả dòng khi thiếu catalog
 * must_keep:  FL-01 list-only · U65 · no invent create · soft U72 maps untouched · HOLD_DEPLOY
 * SOLID:      Pure UX helpers tách khỏi page/hook
 * LastVerified: lib/fleetCatalogUx.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 W1-B-02-EMP-FE-FLEET-01
 * change_mode: ADD (restore)
 * What: Restore fleetCatalogUx (+ test) with Fleet page so Vite App.tsx import resolves
 * Why: Missing module blocked HRM SPA boot /hr/employees (D-HRM-FLEET-IMPORT-01)
 * must_keep: no raw keys · honest empty · FL-01 list-only · U65
 */
import type { HrmSettingsCatalogOverviewRow } from '@/integrations/hrmApi';

export const EM_DASH = '—';

/** Core fleet field schema key — SRS #7 «thiếu danh mục» gate (display, not list block). */
export const FLEET_REQUIRED_CATALOG_KEY = 'hrm_fleet_vehicle_fields';

export const FLEET_CATALOG_KEY_PREFIX = 'hrm_fleet_';

/** Soft name keys mirrored from BE keyword ILIKE (G-FL-02). */
export const FLEET_SOFT_NAME_KEYS = [
  'driver_name',
  'manufacturer',
  'model',
  'route_name',
  'name',
  'vehicle_name',
] as const;

/** Static VI fallbacks — never print raw snake_case when catalog label absent. */
const FLEET_FIELD_LABEL_FALLBACK: Record<string, string> = {
  driver_name: 'Tên lái xe',
  driver_phone: 'SĐT lái xe',
  route_name: 'Tuyến',
  usage_purpose: 'Mục đích sử dụng',
  license_plate: 'BKS',
  chassis_number: 'Số khung',
  engine_number: 'Số máy',
  production_year: 'Năm sản xuất',
  manufacturer: 'Hãng sản xuất',
  model: 'Model',
  seat_capacity: 'Số chỗ',
  current_odometer_km: 'Số KM hiện tại',
  name: 'Tên xe',
  vehicle_name: 'Tên xe',
};

export type FleetEmptyKind = 'honest_empty' | 'keyword_empty' | 'catalog_missing';

export type FleetEmptyCopy = {
  kind: FleetEmptyKind;
  title: string;
  body: string;
};

export function resolveFleetStatusDisplay(status: string | null | undefined): string {
  const key = (status ?? '').trim().toLowerCase();
  if (!key) return EM_DASH;
  if (key === 'active') return 'Đang hoạt động';
  if (key === 'inactive') return 'Ngừng hoạt động';
  return EM_DASH;
}

export function resolveFleetFieldDisplayLabel(
  code: string | null | undefined,
  catalogLabelByCode?: ReadonlyMap<string, string> | Record<string, string> | null,
): string {
  const key = (code ?? '').trim();
  if (!key) return EM_DASH;
  if (catalogLabelByCode instanceof Map) {
    const fromMap = catalogLabelByCode.get(key)?.trim();
    if (fromMap) return fromMap;
  } else if (catalogLabelByCode && typeof catalogLabelByCode === 'object') {
    const fromObj = catalogLabelByCode[key]?.trim();
    if (fromObj) return fromObj;
  }
  return FLEET_FIELD_LABEL_FALLBACK[key] ?? EM_DASH;
}

export function readFleetFieldString(
  fleetFields: Record<string, unknown> | null | undefined,
  key: string,
): string {
  if (!fleetFields || typeof fleetFields !== 'object') return '';
  const raw = fleetFields[key];
  if (raw == null) return '';
  if (typeof raw === 'string') return raw.trim();
  if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
  return '';
}

/** Display name for list row — soft keys only; never dump raw JSON / unknown keys. */
export function resolveFleetVehicleDisplayName(
  fleetFields: Record<string, unknown> | null | undefined,
): string {
  const vehicleName = readFleetFieldString(fleetFields, 'vehicle_name');
  if (vehicleName) return vehicleName;
  const name = readFleetFieldString(fleetFields, 'name');
  if (name) return name;
  const manufacturer = readFleetFieldString(fleetFields, 'manufacturer');
  const model = readFleetFieldString(fleetFields, 'model');
  const combo = [manufacturer, model].filter(Boolean).join(' ').trim();
  return combo || EM_DASH;
}

export function buildFleetFieldLabelMap(
  catalogs: HrmSettingsCatalogOverviewRow[] | null | undefined,
): Map<string, string> {
  const map = new Map<string, string>();
  if (!catalogs?.length) return map;
  for (const row of catalogs) {
    if (!row.catalogKey?.startsWith(FLEET_CATALOG_KEY_PREFIX)) continue;
    for (const item of row.effectiveItems ?? []) {
      const code = (item.code ?? '').trim();
      const label = (item.label ?? '').trim();
      if (code && label) map.set(code, label);
    }
  }
  return map;
}

/**
 * SRS #7 — thiếu danh mục bắt buộc (vehicle fields) sau khi overview đã load.
 * Does not invent rows; caller shows VI message only.
 */
export function isFleetCatalogMissing(
  catalogs: HrmSettingsCatalogOverviewRow[] | null | undefined,
  opts?: { catalogsSettled?: boolean },
): boolean {
  if (opts?.catalogsSettled === false) return false;
  if (!catalogs) return true;
  const vehicle = catalogs.find((c) => c.catalogKey === FLEET_REQUIRED_CATALOG_KEY);
  if (!vehicle) return true;
  return (vehicle.effectiveItems?.length ?? 0) === 0;
}

export function resolveFleetEmptyCopy(input: {
  vehicleTotal: number;
  keyword: string;
  catalogMissing: boolean;
}): FleetEmptyCopy {
  const keyword = input.keyword.trim();
  if (input.catalogMissing && input.vehicleTotal === 0 && !keyword) {
    return {
      kind: 'catalog_missing',
      title: 'Cần cấu hình danh mục hồ sơ xe',
      body: 'Chưa đồng bộ danh mục thuộc tính xe. Vào Cài đặt HRM hoặc Command Center → đồng bộ danh mục trước khi khai thác đầy đủ. Danh sách vẫn empty trung thực — không giả dòng.',
    };
  }
  if (keyword && input.vehicleTotal === 0) {
    return {
      kind: 'keyword_empty',
      title: 'Không tìm thấy xe khớp từ khóa',
      body: 'Thử biển số hoặc tên xe khác trong phạm vi đơn vị hiện tại.',
    };
  }
  return {
    kind: 'honest_empty',
    title: 'Chưa có hồ sơ xe',
    body: 'Đơn vị chưa khai xe trong phạm vi hiện tại. Empty hợp lệ — không tạo mới ở bước chỉ xem.',
  };
}
