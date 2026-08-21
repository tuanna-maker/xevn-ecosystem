/**
 * @CODE-MEMORY
 * Screen:     HRM → catalog-sync pull/list/get (display-ready)
 * UC:         FR-UC-B04 · UC-B04 · UC-HRM-06/07/08
 * BR:         OS 28 FE–BE display-ready · BR-DM (XBOS SoT; HRM không invent L0)
 * SRS:        docs/brand-new-documents-20270801/SRS_NEW.md · FR-UC-B04 Diễn biến #5–6
 * TechSpec:   docs/brand-new-documents-20270801/API_CONTRACT_NEW.md §2.3–2.4
 * DB:         docs/brand-new-documents-20270801/DB_DESIGN_NEW.md §3.8 synced_catalogs
 * Purpose:    Flatten payload XBOS → view model picker-ready (code/label/status_label)
 *             để FE bind không join raw XBOS+HRM hay đào payload.items.
 * WorkItem:   W1-B-03-TC-CAT
 * Coded:      2026-08-03
 * Callers:    catalog-sync.service mapSyncedCatalogRow
 * Callees:    none (pure)
 * Impact:     Thiếu items/status_label → FE reshape payload (vi phạm OS 28)
 * must_keep:  giữ `payload` gốc cho settings-catalogs parsePayloadItems; không invent items
 * SOLID:      Thuần hàm — tách khỏi Nest / SQL / HTTP
 * LastVerified: catalog-sync-display.spec.ts
 */

export type CatalogItemStatusTone = 'success' | 'warning' | 'neutral';

export type HrmSyncedCatalogItemDisplay = {
  code: string;
  label: string;
  unit: string | null;
  status: 'active' | 'draft' | string;
  status_label: string;
  status_tone: CatalogItemStatusTone;
  origin: 'xbos';
};

const ITEM_STATUS_LABELS_VI: Record<string, string> = {
  active: 'Đang dùng',
  draft: 'Nháp',
  inactive: 'Ngừng dùng',
};

const ITEM_STATUS_TONES: Record<string, CatalogItemStatusTone> = {
  active: 'success',
  draft: 'warning',
  inactive: 'neutral',
};

export function catalogItemStatusLabelVi(
  status: string | null | undefined,
): string {
  const raw = String(status ?? '').trim();
  const key = raw.toLowerCase();
  return ITEM_STATUS_LABELS_VI[key] ?? (raw || '—');
}

export function catalogItemStatusTone(
  status: string | null | undefined,
): CatalogItemStatusTone {
  const key = String(status ?? '')
    .trim()
    .toLowerCase();
  return ITEM_STATUS_TONES[key] ?? 'neutral';
}

export function extractPublishedVersion(
  payload: unknown,
  fallbackVersion: number,
): number {
  if (!payload || typeof payload !== 'object') {
    return fallbackVersion > 0 ? fallbackVersion : 1;
  }
  const raw = (payload as Record<string, unknown>).version;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 1) {
    return Math.floor(raw);
  }
  if (typeof raw === 'string' && /^\d+$/.test(raw.trim())) {
    const n = Number.parseInt(raw.trim(), 10);
    if (n >= 1) return n;
  }
  return fallbackVersion > 0 ? fallbackVersion : 1;
}

export function parseSyncedCatalogPayloadMeta(payload: unknown): {
  name: string | null;
  domain: string | null;
  items: HrmSyncedCatalogItemDisplay[];
} {
  if (!payload || typeof payload !== 'object') {
    return { name: null, domain: null, items: [] };
  }
  const p = payload as Record<string, unknown>;
  const rawItems = Array.isArray(p.items) ? p.items : [];
  const items = rawItems
    .filter(
      (row): row is Record<string, unknown> => !!row && typeof row === 'object',
    )
    .map((row) => {
      const code = typeof row.code === 'string' ? row.code.trim() : '';
      const label = typeof row.label === 'string' ? row.label.trim() : '';
      const statusRaw =
        typeof row.status === 'string'
          ? row.status.trim().toLowerCase()
          : 'active';
      const status =
        statusRaw === 'draft'
          ? 'draft'
          : statusRaw === 'inactive'
            ? 'inactive'
            : 'active';
      const unit =
        typeof row.unit === 'string'
          ? row.unit
          : row.unit === null
            ? null
            : null;
      return {
        code,
        label,
        unit,
        status,
        status_label: catalogItemStatusLabelVi(status),
        status_tone: catalogItemStatusTone(status),
        origin: 'xbos' as const,
      };
    })
    .filter((row) => row.code.length > 0 && row.label.length > 0);

  return {
    name: typeof p.name === 'string' ? p.name : null,
    domain: typeof p.domain === 'string' ? p.domain : null,
    items,
  };
}

export type SyncedCatalogDisplayReady = {
  name: string | null;
  domain: string | null;
  published_version: number;
  items: HrmSyncedCatalogItemDisplay[];
  item_count: number;
};

/**
 * OS 28 — FE bind list/detail/picker from top-level fields; payload kept for L1 consumers.
 */
export function buildSyncedCatalogDisplayReady(
  payload: unknown,
  rowVersion: number,
): SyncedCatalogDisplayReady {
  const meta = parseSyncedCatalogPayloadMeta(payload);
  const published_version = extractPublishedVersion(payload, rowVersion);
  return {
    name: meta.name,
    domain: meta.domain,
    published_version,
    items: meta.items,
    item_count: meta.items.length,
  };
}
