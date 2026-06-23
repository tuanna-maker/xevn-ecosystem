import { GROUP_HOLDING_COMPANY_ID, MASTER_TENANT_ID } from '../constants/tenant';
import { listBusinessMasterItems, upsertBusinessMasterItem } from './businessMasterApi';

const DOMAIN = 'command_center_catalogs';

export type CcCatalogKind = 'regulations' | 'measurements' | 'pricing';

export type CcRegulationRow = { code: string; title: string; version: string; active: boolean };
export type CcMeasurementRow = { key: string; unit: string; currency: string; precision: number };
export type CcPricingRow = { priceCode: string; label: string; amount: number };

type CatalogPayload<T> = { rows?: T[] };

type FlatCatalogItem = {
  id?: string;
  code?: string;
  title?: string;
  label?: string;
  key?: string;
  category?: string;
  version?: string;
  active?: boolean;
  unit?: string;
  currency?: string;
  precision?: number;
  priceCode?: string;
  amount?: number;
};

const CC_CATALOG_KINDS: CcCatalogKind[] = ['regulations', 'measurements', 'pricing'];

function flatItemMatchesKind(item: FlatCatalogItem, kind: CcCatalogKind): boolean {
  const category = String(item.category ?? '').trim().toLowerCase();
  if (category === kind) return true;
  if (kind === 'regulations' && item.code && item.title != null) return category === '' || category === 'regulation';
  if (kind === 'measurements' && item.key != null) return true;
  if (kind === 'pricing' && item.priceCode != null) return true;
  return false;
}

function flatItemToRow<T>(kind: CcCatalogKind, item: FlatCatalogItem): T | null {
  if (kind === 'regulations' && item.code) {
    return {
      code: item.code,
      title: item.title ?? item.label ?? '',
      version: item.version ?? 'v1.0',
      active: item.active ?? true,
    } as T;
  }
  if (kind === 'measurements' && item.key) {
    return {
      key: item.key,
      unit: item.unit ?? '',
      currency: item.currency ?? 'VND',
      precision: item.precision ?? 2,
    } as T;
  }
  if (kind === 'pricing' && item.priceCode) {
    return {
      priceCode: item.priceCode,
      label: item.label ?? item.title ?? '',
      amount: item.amount ?? 0,
    } as T;
  }
  return null;
}

function catalogRowKey(kind: CcCatalogKind, row: unknown): string | null {
  if (!row || typeof row !== 'object') return null;
  const record = row as Record<string, unknown>;
  if (kind === 'regulations' && typeof record.code === 'string') return record.code;
  if (kind === 'measurements' && typeof record.key === 'string') return record.key;
  if (kind === 'pricing' && typeof record.priceCode === 'string') return record.priceCode;
  return null;
}

function mergeCatalogRows<T>(kind: CcCatalogKind, items: Array<CatalogPayload<T> & FlatCatalogItem & { id: string }>): T[] {
  const bucket = items.find((row) => row.id === kind);
  const bucketRows = bucket?.rows ?? [];
  const merged = new Map<string, T>();

  for (const row of bucketRows) {
    const key = catalogRowKey(kind, row);
    if (key) merged.set(key, row);
  }

  for (const item of items) {
    if (CC_CATALOG_KINDS.includes(item.id as CcCatalogKind)) continue;
    if (!flatItemMatchesKind(item, kind)) continue;
    const mapped = flatItemToRow<T>(kind, item);
    if (!mapped) continue;
    const key = catalogRowKey(kind, mapped);
    if (key && !merged.has(key)) merged.set(key, mapped);
  }

  return Array.from(merged.values());
}

/** Blank row for inline add — never used as persisted seed fallback. */
export function createCcRegulationRow(suffix = Date.now()): CcRegulationRow {
  return { code: `QĐ-${suffix}`, title: '', version: 'v1.0', active: true };
}

export function createCcMeasurementRow(suffix = Date.now()): CcMeasurementRow {
  return { key: `METRIC-${suffix}`, unit: '', currency: 'VND', precision: 2 };
}

export function createCcPricingRow(suffix = Date.now()): CcPricingRow {
  return { priceCode: `PRC-${suffix}`, label: '', amount: 0 };
}

export async function loadCcCatalogRows<T>(
  kind: CcCatalogKind,
  tenantId = MASTER_TENANT_ID,
  companyId = GROUP_HOLDING_COMPANY_ID,
): Promise<T[]> {
  const items = await listBusinessMasterItems<CatalogPayload<T> & FlatCatalogItem & { id: string }>(
    DOMAIN,
    tenantId,
    companyId,
  );
  return mergeCatalogRows(kind, items);
}

export async function saveCcCatalogRows<T>(
  kind: CcCatalogKind,
  rows: T[],
  tenantId = MASTER_TENANT_ID,
  companyId = GROUP_HOLDING_COMPANY_ID,
): Promise<void> {
  await upsertBusinessMasterItem(DOMAIN, kind, { rows }, tenantId, companyId);
  await syncCcCatalogFlatRows(kind, rows, tenantId, companyId);
}

/** UF-XBOS-14 — mirror each row as flat item so GET list surfaces row.code (probe + BE flatten). */
async function syncCcCatalogFlatRows<T>(
  kind: CcCatalogKind,
  rows: T[],
  tenantId: string,
  companyId: string,
): Promise<void> {
  for (const row of rows) {
    const flat = catalogRowToFlatPayload(kind, row);
    if (!flat) continue;
    const itemId = String(flat.code).trim();
    if (!itemId) continue;
    await upsertBusinessMasterItem(DOMAIN, itemId, flat, tenantId, companyId);
  }
}

function catalogRowToFlatPayload(kind: CcCatalogKind, row: unknown): Record<string, unknown> | null {
  if (!row || typeof row !== 'object') return null;
  const record = row as Record<string, unknown>;
  if (kind === 'regulations' && record.code) {
    return {
      code: record.code,
      title: record.title ?? '',
      category: kind,
      status: 'active',
      version: record.version ?? 'v1.0',
      active: record.active ?? true,
    };
  }
  if (kind === 'measurements' && record.key) {
    return {
      key: record.key,
      unit: record.unit ?? '',
      currency: record.currency ?? 'VND',
      precision: record.precision ?? 2,
      category: kind,
      status: 'active',
    };
  }
  if (kind === 'pricing' && record.priceCode) {
    return {
      priceCode: record.priceCode,
      label: record.label ?? '',
      amount: record.amount ?? 0,
      category: kind,
      status: 'active',
    };
  }
  return null;
}

/** Save partition + flat rows, then re-hydrate from API (post-save hydrate). */
export async function saveAndReloadCcCatalogRows<T>(
  kind: CcCatalogKind,
  rows: T[],
  tenantId = MASTER_TENANT_ID,
  companyId = GROUP_HOLDING_COMPANY_ID,
): Promise<T[]> {
  await saveCcCatalogRows(kind, rows, tenantId, companyId);
  return loadCcCatalogRows<T>(kind, tenantId, companyId);
}
