/**
 * @CODE-MEMORY
 * Screen:     /command-center?settings=company_infrastructure — Modal field tùy chỉnh · Thuộc khối
 * UC:         F-XBOS-09
 * BR:         AC-F-XBOS-09
 * SRS:        docs/xbos/SRS_FIELD_DISPLAY.md § F-XBOS-09
 * TechSpec:   N/A (display-label FIX; wire key giữ nguyên)
 * Purpose:    Đổi mã khối hạ tầng (general/location/capacity/custom) sang nhãn tiếng Việt
 *             để UI không in raw blockCode. value= trên select vẫn là key kỹ thuật.
 * WorkItem:   D-XBOS-LABEL-FE-02
 * Coded:      2026-07-27
 *
 * Callers:
 *   - pages/command-center/CommandCenterPage.tsx → Thuộc khối read-only + header khối
 *
 * Callees:
 *   - pure map — không gọi API
 *
 * FE-Actions:
 *   | Thao tác người dùng | Handler | Lib |
 *   |---------------------|---------|-----|
 *   | Xem Thuộc khối      | render  | resolveInfraBlockCodeDisplayLabel |
 *
 * BE-Chain: N/A (chỉ FE display)
 *
 * Impact:     Sửa sai → lộ lại `general`/`location`/`capacity` trên modal hạ tầng (U72 FAIL).
 * must_keep:  value= vẫn là blockCode; không đổi payload API; F-01..08/11 không đụng.
 * SOLID:      Tách resolver thuần để vitest + tái dùng header/list/bind.
 * LastVerified: utils/infraBlockDisplayLabels.test.ts · docs/qa/evidence/dev-fe-xbos-label-02-20260727.md
 */

export type InfraBaseBlockCode = 'general' | 'location' | 'capacity';

/** Default VI titles — khớp option select modal hạ tầng (không prefix key). */
export const INFRA_BASE_BLOCK_LABELS_VI: Record<InfraBaseBlockCode, string> = {
  general: 'Khối Thông tin chung',
  location: 'Khối Vị trí & liên hệ',
  capacity: 'Khối Năng lực',
};

export type InfraBlockDisplayLabelOpts = {
  /** Draft / override tên khối nền (ưu tiên nếu non-empty). */
  titleOverrides?: Partial<Record<InfraBaseBlockCode, string>>;
  /** Khối custom — dùng labelVi khi khớp blockCode. */
  customBlocks?: ReadonlyArray<{ blockCode: string; labelVi: string }>;
};

/**
 * Map blockCode → nhãn VI hiển thị. Unknown / empty → «—» (cấm echo raw key).
 * Wire key vẫn dùng ở value= / API — hàm này chỉ cho surface người dùng.
 */
export function resolveInfraBlockCodeDisplayLabel(
  blockCode: string | null | undefined,
  opts: InfraBlockDisplayLabelOpts = {},
): string {
  const code = (blockCode ?? '').trim();
  if (!code) return '—';

  const custom = opts.customBlocks?.find((b) => b.blockCode === code);
  const customLabel = custom?.labelVi?.trim();
  if (customLabel) return customLabel;

  if (code === 'general' || code === 'location' || code === 'capacity') {
    const override = opts.titleOverrides?.[code]?.trim();
    if (override) return override;
    return INFRA_BASE_BLOCK_LABELS_VI[code];
  }

  return '—';
}
