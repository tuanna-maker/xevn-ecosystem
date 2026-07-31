/**
 * @CODE-MEMORY
 * Screen:     /command-center?settings=company_infrastructure — Wizard danh mục nền · Phạm vi pháp nhân (Group CEO)
 * UC:         UC-XBOS-INF-01 · UC-XBOS-CC-07
 * BR:         BR-FCAT-SCOPE-03 · BR-FCAT-SCOPE-04
 * SRS:        docs/xbos/INFRA_FOUNDATION_CATEGORY_WIZARD_UX.md §BR-FCAT-SCOPE · UC-XBOS-INF-01 / UC-XBOS-CC-07
 * TechSpec:   docs/xbos/API_DESIGN_XBOS_INFRASTRUCTURE.md §0/§4 · ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727 (ref_srs: UC-XBOS-INF-01)
 * Purpose:    Khớp khóa entity hạ tầng (holding alias + LE UUID Plane A); chuẩn hóa appliesToCompanyIds khi tick/lưu — không ghi Plane B′ / slug workforce member.
 * WorkItem:   D-XBOS-INF-SCOPE-KEY-PLANE-FE-01
 * Coded:      2026-07-27
 *
 * Callers:
 *   - FoundationCategoryWizard.tsx → isInfraScopeKeySelected / label alias match
 *   - CommandCenterPage.tsx → toggleInfraAppliesToCompanyId · normalize on PUT
 *   - metadataConsumerResolver.ts · infraSiteConsumerContext.ts → resolveInfraScopedRecord / isOperatingEntityInFoundationScope
 *
 * Callees:
 *   - constants/tenant (main/holding) · tenantScopeApi.GROUP_HOLDING_ROOT_ID
 *
 * FE-Actions:
 *   | Thao tác người dùng              | Handler                         | Lib                                      |
 *   |----------------------------------|---------------------------------|------------------------------------------|
 *   | Tick pháp nhân bước 2            | toggleFoundationCompany         | toggleInfraAppliesToCompanyId            |
 *   | Xác nhận & áp dụng               | saveFoundationCategory          | normalizeInfraAppliesToCompanyIdsForPersist → PUT settings |
 *   | F5 / mở lại wizard               | openEditFoundationCategory      | isInfraScopeKeySelected (alias)          |
 *
 * BE-Chain: N/A (FE) — PUT /api/xbos/infrastructure/settings JSONB foundation_categories
 *
 * Impact:     Sai khóa → checkbox 0 tick, custom field ẩn, hoặc nhầm Plane B/B′ với site LE.
 * must_keep:  infraEntityIdsMatch holding aliases; CO-HC/OP/MD GWC không đụng; không bridge LE↔B′.
 * SOLID:      Resolver tách khỏi CommandCenter — một SoT khóa plane cho tick/match/persist.
 * LastVerified: infrastructureEntityKeyResolver.test.ts · docs/qa/evidence/fe-xbos-inf-scope-key-plane-01-20260727.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-XBOS-INF-SCOPE-KEY-PLANE-FE-01
 * change_mode: ADD
 * What: Thêm normalize/persist Plane A + holding root; cấm B′/slug workforce; tick/checkbox alias-aware (AC-INF-KEY-01..05).
 * Why:  ADR Option A — legacy main/holding gây 0 tick; tránh ghi Plane B/B′ vào appliesToCompanyIds.
 * SRS:  UC-XBOS-INF-01 / UC-XBOS-CC-07 · BR-FCAT-SCOPE-04
 * TechSpec: API_DESIGN_XBOS_INFRASTRUCTURE.md §0/§4 · ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727
 * must_keep: infraEntityIdsMatch; resolveInfraScopedRecord inheritance; không rewrite BE scope.
 */
import { GROUP_HOLDING_COMPANY_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';

/** UI / JWT / DB aliases for group holding — J-XBOS-05 custom-field entity keys. */
export const INFRA_HOLDING_ENTITY_ALIASES = [
  GROUP_HOLDING_ROOT_ID,
  MEMBER_DEFAULT_COMPANY_ID,
  GROUP_HOLDING_COMPANY_ID,
] as const;

/**
 * Plane B workforce member slugs — forbidden as appliesToCompanyIds member keys (ADR §4.1).
 * `holding` is allowed only as holding alias, not listed here.
 */
export const INFRA_FORBIDDEN_WORKFORCE_MEMBER_SLUGS = new Set([
  'trsport',
  'logistics',
  'finance',
  'services',
]);

/**
 * Plane B′ pilot UUIDs (`HRM_COMPANY_UUID_BY_SLUG`) — forbidden in infra foundation scope.
 * Mirror of hrm-list-scope map; FE must not write these into appliesToCompanyIds.
 */
export const INFRA_PLANE_B_PRIME_UUIDS = new Set([
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005',
]);

export type InfraFoundationScopeRow = {
  appliesToCompanyIds?: string[];
};

/** True when two infra entity ids refer to the same holding row or exact match. */
export function infraEntityIdsMatch(a: string, b: string): boolean {
  const left = a.trim();
  const right = b.trim();
  if (!left || !right) return false;
  if (left === right) return true;
  const holding = new Set<string>(INFRA_HOLDING_ENTITY_ALIASES);
  return holding.has(left) && holding.has(right);
}

/** Holding chip / JWT alias set (root · main · holding). */
export function isInfraHoldingScopeKey(raw: string): boolean {
  const id = raw.trim();
  if (!id) return false;
  return INFRA_HOLDING_ENTITY_ALIASES.some((alias) => infraEntityIdsMatch(alias, id));
}

/**
 * Forbidden scope key: empty, Plane B′ UUID, or workforce member slug.
 * Xử lý: ADR §4.1 / API_DESIGN anti-patterns — không persist vào appliesToCompanyIds.
 */
export function isForbiddenInfraScopeKey(raw: string): boolean {
  const id = raw.trim();
  if (!id) return true;
  const lower = id.toLowerCase();
  if (INFRA_FORBIDDEN_WORKFORCE_MEMBER_SLUGS.has(lower)) return true;
  if (INFRA_PLANE_B_PRIME_UUIDS.has(lower)) return true;
  return false;
}

/** Checkbox / F5 bind — alias-aware (AC-INF-KEY-05). */
export function isInfraScopeKeySelected(
  chipId: string,
  appliesToCompanyIds: readonly string[],
): boolean {
  return appliesToCompanyIds.some((id) => infraEntityIdsMatch(id, chipId));
}

/**
 * Persist SoT: member = Plane A LE UUID; holding → xbos-group-holding-root;
 * drop B′ and workforce member slugs (AC-INF-KEY-01/02).
 */
export function normalizeInfraAppliesToCompanyIdsForPersist(
  appliesToCompanyIds: readonly string[],
): string[] {
  const out: string[] = [];
  let holdingSeen = false;
  for (const raw of appliesToCompanyIds) {
    const id = typeof raw === 'string' ? raw.trim() : '';
    if (!id) continue;
    if (isForbiddenInfraScopeKey(id)) continue;
    if (isInfraHoldingScopeKey(id)) {
      if (!holdingSeen) {
        out.push(GROUP_HOLDING_ROOT_ID);
        holdingSeen = true;
      }
      continue;
    }
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

/**
 * Wizard tick: holding always stores canonical root; untick removes all aliases;
 * members store LE UUID; forbidden chips ignored.
 */
export function toggleInfraAppliesToCompanyId(
  appliesToCompanyIds: readonly string[],
  chipId: string,
): string[] {
  const chip = chipId.trim();
  if (!chip || isForbiddenInfraScopeKey(chip)) {
    return normalizeInfraAppliesToCompanyIdsForPersist(appliesToCompanyIds);
  }

  const selected = isInfraScopeKeySelected(chip, appliesToCompanyIds);

  if (isInfraHoldingScopeKey(chip)) {
    if (selected) {
      return appliesToCompanyIds.filter((id) => !isInfraHoldingScopeKey(id));
    }
    const withoutHolding = appliesToCompanyIds.filter((id) => !isInfraHoldingScopeKey(id));
    return normalizeInfraAppliesToCompanyIdsForPersist([
      ...withoutHolding,
      GROUP_HOLDING_ROOT_ID,
    ]);
  }

  if (selected) {
    return appliesToCompanyIds.filter((id) => !infraEntityIdsMatch(id, chip));
  }
  return normalizeInfraAppliesToCompanyIdsForPersist([...appliesToCompanyIds, chip]);
}

/** Normalize every category row before PUT settings. */
export function normalizeFoundationCategoriesScopeForPersist<T extends InfraFoundationScopeRow>(
  rows: readonly T[],
): T[] {
  return rows.map((row) => ({
    ...row,
    appliesToCompanyIds: normalizeInfraAppliesToCompanyIdsForPersist(
      row.appliesToCompanyIds ?? [],
    ),
  }));
}

/** Candidate config-map keys for custom fields / blocks / title overrides. */
export function resolveInfraEntityConfigKeys(
  operatingEntityId: string,
  foundationCategories: InfraFoundationScopeRow[] = [],
): string[] {
  const trimmed = operatingEntityId.trim();
  if (!trimmed) return [];

  const keys = new Set<string>([trimmed]);
  if (INFRA_HOLDING_ENTITY_ALIASES.some((id) => infraEntityIdsMatch(id, trimmed))) {
    for (const alias of INFRA_HOLDING_ENTITY_ALIASES) {
      keys.add(alias);
    }
  }

  for (const category of foundationCategories) {
    const applies = category.appliesToCompanyIds ?? [];
    const inCategory = applies.some((id) => infraEntityIdsMatch(id, trimmed));
    if (!inCategory) continue;
    for (const id of applies) {
      keys.add(id);
      if (INFRA_HOLDING_ENTITY_ALIASES.some((alias) => infraEntityIdsMatch(alias, id))) {
        for (const alias of INFRA_HOLDING_ENTITY_ALIASES) {
          keys.add(alias);
        }
      }
    }
  }

  return Array.from(keys);
}

export function resolveInfraScopedRecord<T>(
  operatingEntityId: string,
  byEntity: Record<string, T[] | undefined>,
  foundationCategories: InfraFoundationScopeRow[] = [],
): T[] {
  const keys = resolveInfraEntityConfigKeys(operatingEntityId, foundationCategories);
  const merged: T[] = [];
  const seen = new Set<string>();

  for (const key of keys) {
    for (const item of byEntity[key] ?? []) {
      const dedupeKey =
        item !== null && typeof item === 'object' && 'fieldCode' in item
          ? String((item as { fieldCode: string }).fieldCode)
          : item !== null && typeof item === 'object' && 'blockCode' in item
            ? String((item as { blockCode: string }).blockCode)
            : JSON.stringify(item);
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      merged.push(item);
    }
  }

  return merged;
}

export function resolveInfraBlockTitleOverrides(
  operatingEntityId: string,
  byEntity: Record<string, Record<string, string> | undefined>,
  foundationCategories: InfraFoundationScopeRow[] = [],
): Record<string, string> {
  const keys = resolveInfraEntityConfigKeys(operatingEntityId, foundationCategories);
  const merged: Record<string, string> = {};
  for (const key of keys) {
    const ov = byEntity[key];
    if (!ov) continue;
    for (const [block, title] of Object.entries(ov)) {
      if (!merged[block]) merged[block] = title;
    }
  }
  return merged;
}

/** Operating entity appears in at least one foundation category scope (alias-aware). */
export function isOperatingEntityInFoundationScope(
  operatingEntityId: string,
  foundationCategories: InfraFoundationScopeRow[],
): boolean {
  const trimmed = operatingEntityId.trim();
  if (!trimmed) return true;
  return foundationCategories.some((category) =>
    (category.appliesToCompanyIds ?? []).some((id) => infraEntityIdsMatch(id, trimmed)),
  );
}
