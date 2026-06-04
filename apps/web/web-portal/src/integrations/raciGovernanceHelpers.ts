import type { RaciActivityRow } from './raciGovernanceApi';

/** Ops seed for UC-RACI-05 — catalog must exist in DB before matrix PUT. */
export const RACI_CATALOG_SEED_CMD = 'pnpm seed:raci:catalog';

const BINDINGS_STORAGE_PREFIX = 'xevn:raci-column-binding:';

export function normalizeRaciLettersInput(value: string): string {
  return value.trim().replace(/\s+/g, '').toUpperCase();
}

export function isRaciCatalogSeedOnly(activities: Pick<RaciActivityRow, 'id'>[]): boolean {
  return activities.some((a) => String(a.id).startsWith('seed-'));
}

export function raciCatalogSeedHint(
  total: number,
  activities: Pick<RaciActivityRow, 'id'>[],
): string | null {
  if (total === 0) {
    return `Chưa có catalog RACI trên DB — chạy \`${RACI_CATALOG_SEED_CMD}\` (xbos-api :28002).`;
  }
  if (isRaciCatalogSeedOnly(activities)) {
    return `Catalog đang dùng bản seed tạm — chạy \`${RACI_CATALOG_SEED_CMD}\` để lưu ma trận theo công ty.`;
  }
  return null;
}

export function raciColumnBindingsStorageKey(tenantId: string, companyId: string): string {
  return `${BINDINGS_STORAGE_PREFIX}${tenantId}:${companyId}`;
}

export function readRaciColumnBindings(
  tenantId: string,
  companyId: string,
): Record<string, string> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(raciColumnBindingsStorageKey(tenantId, companyId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

export function writeRaciColumnBinding(
  tenantId: string,
  companyId: string,
  orgColumnId: string,
  positionTemplateId: string,
): Record<string, string> {
  const next = { ...readRaciColumnBindings(tenantId, companyId) };
  if (positionTemplateId) next[orgColumnId] = positionTemplateId;
  else delete next[orgColumnId];
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(
      raciColumnBindingsStorageKey(tenantId, companyId),
      JSON.stringify(next),
    );
  }
  return next;
}
