import { GROUP_HOLDING_COMPANY_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';

/** UI / JWT / DB aliases for group holding — J-XBOS-05 custom-field entity keys. */
export const INFRA_HOLDING_ENTITY_ALIASES = [
  GROUP_HOLDING_ROOT_ID,
  MEMBER_DEFAULT_COMPANY_ID,
  GROUP_HOLDING_COMPANY_ID,
] as const;

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
