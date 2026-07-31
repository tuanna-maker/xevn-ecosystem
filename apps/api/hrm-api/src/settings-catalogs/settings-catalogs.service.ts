/**
 * @CODE-MEMORY
 * Screen:     HRM → Danh mục cấu hình (service overview/merge)
 * UC:         HRM-SC-01..03
 * BR:         main→holding catalog partition · empty chưa đồng bộ trung thực
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.8 · FR-HRM-SC-01
 * SRS bước:   Diễn biến #2/#3/#4 — tổng quan nhóm / empty / có dữ liệu
 * TechSpec:   docs/hrm/TECHSPEC.md §14.8 (ref_srs: FR-HRM-SC-01)
 * Purpose:    Merge XBOS snapshot + HRM extension; không fake items khi chưa sync.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 * Callers:    settings-catalogs.controller.ts → getOverview / upsert / delete
 * Callees:    CatalogSyncService · HrmDbService · XbosCatalogWorkflowBridge
 * must_keep:  empty honesty; seed endpoints không dùng evidence U65
 * SOLID:      Service owns merge SQL
 * LastVerified: settings-catalogs.service.spec.ts · d-hrm-set-item-persist-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: CODE-MEMORY map Diễn biến SC-01 (không đổi logic)
 *
 * @CODE-MEMORY-CHANGE 2026-07-23
 * WorkItem: D-HRM-SETTINGS-MD-CRUD-BE-01
 * change_mode: ADD
 * What: Picker list (q/active/company) + assertCodeInEffectiveCatalog (BR-HRM-MD-01);
 *   soft-deactivate delete; upsert status; FR-HRM-SC-POS/LEAVE/DEC/PAY/JT consumers.
 * SRS: delta Cài đặt SC-POS/LEAVE/DEC/PAY · ADR §5 S1/S3 · TechSpec §18.1
 * must_keep: empty honesty; no XBOS SoT fork; seed endpoints not U65 evidence
 *
 * @CODE-MEMORY-CHANGE 2026-07-25
 * WorkItem: D-HRM-SETTINGS-MD-POS-SEED-BE-01
 * change_mode: UPGRADE
 * What: Retire G-ORPH-BE-03 — tenant-position hardcode seed is bootstrap-only;
 *   refuse when XBOS/Settings POS catalogs have items; profile template no longer embeds hardcode.
 * SRS: FR-HRM-SC-MD-01/02 · BA matrix · GAP-MD-01
 * must_keep: job_titles/departments SoT via effectiveItems; U65 no seed UAT; LE company-col; RBAC
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-BE-ERP-E1B-ALIAS-KEYS-01
 * change_mode: ADD
 * What: Family-aware getEffectiveItems / picker / assert / overview DEC merge;
 *   write storageKey prefer hr_decision_types; resolveCatalogFamily on mutate.
 * SRS: BA_ERP_E1B_SRS_01 · FR-HRM-SC-DEC-01 alias · AC-SC-DEC-ALIAS-*
 * DB/API: DB_DESIGN_HRM_SETTINGS_E1B §3.2 · API_DESIGN_HRM_SETTINGS_E1B §0–§2
 * must_keep: empty honesty; no invent L0; no work_shifts dual-write; POS/LEAVE paths
 */
import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbService } from '../db/hrm-db.service';
import type { CatalogExtensionItemDto } from './dto/append-extension-items.dto';
import type { RequestCatalogFieldRemovalDto } from './dto/request-removal.dto';
import { createHash } from 'node:crypto';
import { randomUUID } from 'node:crypto';
import {
  GROUP_EMPLOYEE_IMPORT_CATALOGS,
  GROUP_HRM_TENANT_SCOPES,
} from './group-employee-import-catalog';
import {
  TOURISM_COMPANY_ID,
  TOURISM_FLEET_CATALOGS,
  TOURISM_TENANT_ID,
} from './tourism-fleet-catalog';
import {
  HRM_SC_POS_KEYS,
  catalogAliasTryList,
  isE1bMasterCatalogKey,
  resolveCatalogFamily,
} from './hrm-settings-master-keys';
import {
  buildEmptyPositionFieldDefs,
  buildPositionCatalogItems,
  getTenantPositionCatalog,
  isTenantPositionSeedEnvAllowed,
} from './tenant-position-catalog';
import { XbosCatalogWorkflowBridge } from './xbos-catalog-workflow.bridge';
import { SettingsCatalogItemMutationDto } from './dto/settings-catalog-item.dto';
import { assertResourceInHrmScope, resolveHrmListScope } from '../common/hrm-list-scope';

export type SettingsCatalogItem = {
  code: string;
  label: string;
  unit: string | null;
  status: 'active' | 'draft';
  origin: 'xbos' | 'hrm';
};

export type SettingsCatalogOverviewRow = {
  catalogKey: string;
  /** Snake_case alias for portal probes (UF-XBOS-15). */
  catalog_key: string;
  key: string;
  name: string | null;
  domain: string | null;
  xbosVersion: number | null;
  xbosSyncedAt: string | null;
  xbosItems: SettingsCatalogItem[];
  hrmExtensionItems: SettingsCatalogItem[];
  /** Snake_case alias — includes pending extension requests (HRM-SET-209). */
  extension_items: SettingsCatalogItem[];
  extensionItems: SettingsCatalogItem[];
  items: SettingsCatalogItem[];
  effectiveItems: SettingsCatalogItem[];
  /** E1-B family aliases (same logical catalog). */
  aliases?: string[];
  familyId?: string;
};

@Injectable()
export class SettingsCatalogsService {
  constructor(
    private readonly db: HrmDbService,
    private readonly catalogSync: CatalogSyncService,
    private readonly xbosWorkflow: XbosCatalogWorkflowBridge,
  ) {}

  private normalizeCatalogKey(catalogKey: string): string {
    const normalized = catalogKey.trim().toLowerCase();
    if (!/^[a-z0-9_][a-z0-9_-]{1,62}$/.test(normalized)) {
      throw new ApiException('HRM-SET-001', 'Invalid catalog key format', HttpStatus.BAD_REQUEST);
    }
    return normalized;
  }

  private async ensureExtensionSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_catalog_extension_items (
        id BIGSERIAL PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        catalog_key TEXT NOT NULL,
        code TEXT NOT NULL,
        label TEXT NOT NULL,
        unit TEXT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_cat_ext_scope_key_code
      ON public.hrm_catalog_extension_items (tenant_id, company_id, catalog_key, code);
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_catalog_field_removal_requests (
        id UUID PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        catalog_key TEXT NOT NULL,
        code TEXT NOT NULL,
        label TEXT NULL,
        reason TEXT NULL,
        requested_by_name TEXT NULL,
        requested_by_email TEXT NULL,
        leadership_emails TEXT[] NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'pending',
        reviewed_note TEXT NULL,
        reviewed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_cat_remove_req_scope
      ON public.hrm_catalog_field_removal_requests (tenant_id, company_id, catalog_key, status, created_at DESC);
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_catalog_extension_requests (
        id UUID PRIMARY KEY,
        batch_id UUID NOT NULL,
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        catalog_key TEXT NOT NULL,
        code TEXT NOT NULL,
        label TEXT NOT NULL,
        unit TEXT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        workflow_instance_id UUID NULL,
        requested_by_user_id TEXT NULL,
        requested_by_email TEXT NULL,
        reviewed_by_user_id TEXT NULL,
        review_note TEXT NULL,
        reviewed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_cat_ext_req_status
      ON public.hrm_catalog_extension_requests (status, created_at DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_cat_ext_req_scope
      ON public.hrm_catalog_extension_requests (tenant_id, company_id, catalog_key, status);
    `);
    await this.db.query(
      `ALTER TABLE public.hrm_catalog_extension_requests ADD COLUMN IF NOT EXISTS batch_id UUID`,
    );
    await this.db.query(
      `ALTER TABLE public.hrm_catalog_extension_requests ADD COLUMN IF NOT EXISTS workflow_instance_id UUID`,
    );
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_cat_ext_req_batch
      ON public.hrm_catalog_extension_requests (batch_id, status);
    `);
  }

  private parseLeadershipEmails(): string[] {
    const raw = process.env.HRM_XBOS_LEADERSHIP_EMAILS ?? process.env.XBOS_LEADERSHIP_EMAILS ?? '';
    if (!raw.trim()) return [];
    return [...new Set(raw.split(',').map((v) => v.trim()).filter((v) => v.length > 0))];
  }

  private parsePayloadItems(payload: unknown): {
    name: string | null;
    domain: string | null;
    key: string | null;
    items: Array<{ code: string; label: string; unit?: string | null; status?: string }>;
  } {
    if (!payload || typeof payload !== 'object') {
      return { name: null, domain: null, key: null, items: [] };
    }
    const p = payload as Record<string, unknown>;
    const rawItems = Array.isArray(p.items) ? p.items : [];
    const items = rawItems
      .filter((row): row is Record<string, unknown> => !!row && typeof row === 'object')
      .map((row) => ({
        code: typeof row.code === 'string' ? row.code : '',
        label: typeof row.label === 'string' ? row.label : '',
        unit: typeof row.unit === 'string' ? row.unit : row.unit === null ? null : undefined,
        status: typeof row.status === 'string' ? row.status : 'active',
      }))
      .filter((row) => row.code.length > 0 && row.label.length > 0);
    return {
      name: typeof p.name === 'string' ? p.name : null,
      domain: typeof p.domain === 'string' ? p.domain : null,
      key: typeof p.key === 'string' ? p.key : null,
      items,
    };
  }

  private toXbosOriginItems(
    items: Array<{ code: string; label: string; unit?: string | null; status?: string }>,
  ): SettingsCatalogItem[] {
    return items.map((row) => ({
      code: row.code,
      label: row.label,
      unit: row.unit ?? null,
      status: row.status === 'draft' ? 'draft' : 'active',
      origin: 'xbos' as const,
    }));
  }

  private mergeEffective(xbos: SettingsCatalogItem[], hrm: SettingsCatalogItem[]): SettingsCatalogItem[] {
    const byCode = new Map<string, SettingsCatalogItem>();
    for (const row of xbos) {
      byCode.set(row.code.toLowerCase(), { ...row, origin: 'xbos' });
    }
    for (const row of hrm) {
      byCode.set(row.code.toLowerCase(), { ...row, origin: 'hrm' });
    }
    return [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
  }

  /** VAL-E1B-DEC-05 — dedupe by code; keep first (prefer storageKey / XBOS order). */
  private mergeByCodePreferFirst(
    primary: SettingsCatalogItem[],
    secondary: SettingsCatalogItem[],
  ): SettingsCatalogItem[] {
    const byCode = new Map<string, SettingsCatalogItem>();
    for (const row of primary) {
      byCode.set(row.code.toLowerCase(), row);
    }
    for (const row of secondary) {
      const k = row.code.toLowerCase();
      if (!byCode.has(k)) {
        byCode.set(k, row);
      }
    }
    return [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
  }

  /** Exact L1 row for one key — null when missing (never throws). */
  private async loadSyncedExact(
    catalogKey: string,
    tenantId: string,
    companyId: string,
  ): Promise<{ key: string; payload: unknown } | null> {
    const exact = this.catalogSync.getSyncedCatalogExact;
    if (typeof exact === 'function') {
      return exact.call(this.catalogSync, catalogKey, tenantId, companyId);
    }
    const get = this.catalogSync.getSyncedCatalog;
    if (typeof get === 'function') {
      return get.call(this.catalogSync, catalogKey, tenantId, companyId).catch(() => null);
    }
    return null;
  }

  /**
   * Resolve write storage key — prefer L1 live key (DEC → hr_decision_types), else defaultStorageKey.
   * @CODE-MEMORY method · VAL-E1B-DEC-03 · SA-ERP-E1B-DESIGN-REVIEW-01 §3.1
   */
  async resolveWriteStorageKey(
    tenantId: string,
    companyId: string,
    catalogKey: string,
  ): Promise<string> {
    const fam = resolveCatalogFamily(catalogKey);
    const t = tenantId.trim().toLowerCase();
    const c = companyId.trim().toLowerCase();
    for (const candidate of catalogAliasTryList(catalogKey)) {
      const row = await this.loadSyncedExact(candidate, t, c);
      if (row) {
        return row.key;
      }
    }
    return fam.storageKey;
  }

  private matchesPickerQuery(item: SettingsCatalogItem, q: string | undefined): boolean {
    if (!q?.trim()) return true;
    const needle = q.trim().toLowerCase();
    return item.code.toLowerCase().includes(needle) || item.label.toLowerCase().includes(needle);
  }

  private matchesActiveFilter(
    item: SettingsCatalogItem,
    activeRaw: string | undefined,
    status: 'active' | 'draft' | 'all' | undefined,
  ): boolean {
    if (status === 'all') return true;
    if (status === 'active') return item.status === 'active';
    if (status === 'draft') return item.status === 'draft';
    if (activeRaw == null || activeRaw.trim() === '') return true;
    const a = activeRaw.trim().toLowerCase();
    if (a === '1' || a === 'true' || a === 'active' || a === 'yes') return item.status === 'active';
    if (a === '0' || a === 'false' || a === 'draft' || a === 'inactive' || a === 'no') {
      return item.status !== 'active';
    }
    return true;
  }

  /**
   * Load effective items for one catalog family (merge all aliases' L1+L2a).
   * @CODE-MEMORY method · FR-HRM-SC-POS/LEAVE/DEC · AC-SET-FS-01 · VAL-E1B-DEC-01 · TechSpec §18.1
   */
  async getEffectiveItemsForKey(
    tenantId: string,
    companyId: string,
    catalogKey: string,
  ): Promise<SettingsCatalogItem[]> {
    await this.ensureExtensionSchema();
    const t = tenantId.trim().toLowerCase();
    const c = companyId.trim().toLowerCase();
    const fam = resolveCatalogFamily(this.normalizeCatalogKey(catalogKey));
    let xbosMerged: SettingsCatalogItem[] = [];
    let hrmMerged: SettingsCatalogItem[] = [];

    for (const alias of fam.aliases) {
      const synced = await this.loadSyncedExact(alias, t, c);
      const parsed = synced
        ? this.parsePayloadItems(synced.payload)
        : {
            items: [] as Array<{
              code: string;
              label: string;
              unit?: string | null;
              status?: string;
            }>,
          };
      xbosMerged = this.mergeByCodePreferFirst(xbosMerged, this.toXbosOriginItems(parsed.items));

      const extRes = await this.db.query<{
        code: string;
        label: string;
        unit: string | null;
        status: string;
      }>(
        `
      SELECT code, label, unit, status
      FROM public.hrm_catalog_extension_items
      WHERE tenant_id = $1 AND company_id = $2 AND catalog_key = $3
      ORDER BY code
    `,
        [t, c, alias],
      );
      const hrmItems: SettingsCatalogItem[] = extRes.rows.map((row) => ({
        code: row.code,
        label: row.label,
        unit: row.unit,
        status: row.status === 'draft' ? 'draft' : 'active',
        origin: 'hrm' as const,
      }));
      hrmMerged = this.mergeByCodePreferFirst(hrmMerged, hrmItems);
    }

    return this.mergeEffective(xbosMerged, hrmMerged);
  }

  /**
   * Picker API — AC-SET-FS-01..05 / AC-HRM-PICKER-01 · E1-B alias-aware.
   * @CODE-MEMORY method · FR-HRM-SC-* Settings list for combobox search
   */
  async listPickerItems(
    tenantId: string,
    companyId: string,
    catalogKey: string,
    query?: { q?: string; active?: string; status?: 'active' | 'draft' | 'all' },
  ): Promise<{
    catalog_key: string;
    aliases: string[];
    family_id: string;
    company_id: string;
    total: number;
    data: SettingsCatalogItem[];
  }> {
    const fam = resolveCatalogFamily(this.normalizeCatalogKey(catalogKey));
    const storageKey = await this.resolveWriteStorageKey(tenantId, companyId, catalogKey);
    const items = await this.getEffectiveItemsForKey(tenantId, companyId, catalogKey);
    const filtered = items.filter(
      (item) =>
        this.matchesActiveFilter(item, query?.active, query?.status) &&
        this.matchesPickerQuery(item, query?.q),
    );
    return {
      catalog_key: storageKey,
      aliases: [...fam.aliases],
      family_id: fam.familyId,
      company_id: companyId.trim().toLowerCase(),
      total: filtered.length,
      data: filtered,
    };
  }

  /**
   * BR-HRM-MD-01 — consumer forms may only persist codes from effective catalog.
   * Empty catalog → 400 (honest empty; no free-text SoT).
   * @CODE-MEMORY method · VAL-SET-MD-01..03 · TechSpec §18.1
   */
  async assertCodeInEffectiveCatalog(opts: {
    tenantId: string;
    companyId: string;
    catalogKey: string;
    code: string;
    errorCode: string;
    errorMessage?: string;
  }): Promise<SettingsCatalogItem> {
    const code = opts.code.trim();
    if (!code) {
      throw new ApiException(
        opts.errorCode,
        opts.errorMessage ?? `Catalog code required for ${opts.catalogKey}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const items = await this.getEffectiveItemsForKey(opts.tenantId, opts.companyId, opts.catalogKey);
    const activeOnly = items.filter((i) => i.status === 'active');
    if (activeOnly.length === 0) {
      throw new ApiException(
        opts.errorCode,
        opts.errorMessage ??
          `Catalog '${opts.catalogKey}' has no active items — sync from XBOS or add in Settings`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const hit = activeOnly.find((i) => i.code.toLowerCase() === code.toLowerCase());
    if (!hit) {
      throw new ApiException(
        opts.errorCode,
        opts.errorMessage ??
          `Code '${code}' is not in catalog '${opts.catalogKey}' (free-text SoT forbidden)`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return hit;
  }

  /**
   * @CODE-MEMORY method · FR-HRM-SC-01
   * SRS bước: Diễn biến #2/#3/#4 — merge snapshot + extension; empty chưa sync OK
   * TechSpec: §14.8 ref_srs FR-HRM-SC-01
   */
  async getOverview(tenantId: string, companyId: string): Promise<{ catalogs: SettingsCatalogOverviewRow[] }> {
    await this.ensureExtensionSchema();
    // Xử lý: đọc partition đã resolve (main→holding ở controller).
    const t = tenantId.trim().toLowerCase();
    const c = companyId.trim().toLowerCase();
    const synced = await this.catalogSync.listSyncedCatalogs(t, c);
    const extRes = await this.db.query<{
      catalog_key: string;
      code: string;
      label: string;
      unit: string | null;
      status: string;
    }>(
      `
      SELECT catalog_key, code, label, unit, status
      FROM public.hrm_catalog_extension_items
      WHERE tenant_id = $1 AND company_id = $2
      ORDER BY catalog_key, code
    `,
      [t, c],
    );
    const pendingRes = await this.db.query<{
      catalog_key: string;
      code: string;
      label: string;
      unit: string | null;
      status: string;
    }>(
      `
      SELECT catalog_key, code, label, unit, status
      FROM public.hrm_catalog_extension_requests
      WHERE tenant_id = $1 AND company_id = $2 AND status = 'pending'
      ORDER BY catalog_key, code
    `,
      [t, c],
    );
    const extByKey = new Map<string, SettingsCatalogItem[]>();
    const mergeExtensionRow = (row: {
      catalog_key: string;
      code: string;
      label: string;
      unit: string | null;
      status: string;
    }) => {
      const list = extByKey.get(row.catalog_key) ?? [];
      const normalizedCode = row.code.toLowerCase();
      if (list.some((item) => item.code.toLowerCase() === normalizedCode)) {
        return;
      }
      list.push({
        code: row.code,
        label: row.label,
        unit: row.unit,
        status: row.status === 'pending' ? 'draft' : row.status === 'draft' ? 'draft' : 'active',
        origin: 'hrm',
      });
      extByKey.set(row.catalog_key, list);
    };
    for (const row of extRes.rows) {
      mergeExtensionRow(row);
    }
    for (const row of pendingRes.rows) {
      mergeExtensionRow({ ...row, status: 'pending' });
    }

    const keys = new Set<string>();
    for (const c of synced.data) {
      keys.add(c.key);
    }
    for (const k of extByKey.keys()) {
      keys.add(k);
    }

    const catalogs: SettingsCatalogOverviewRow[] = [];
    // E1-B: family effectiveItems from in-memory L1+L2a so dual DEC keys share one merged set.
    const familyEffectiveCache = new Map<string, SettingsCatalogItem[]>();
    const effectiveForFamily = (familyId: string, aliases: readonly string[]): SettingsCatalogItem[] => {
      const cached = familyEffectiveCache.get(familyId);
      if (cached) return cached;
      let xbosMerged: SettingsCatalogItem[] = [];
      let hrmMerged: SettingsCatalogItem[] = [];
      for (const alias of aliases) {
        const syncedRow = synced.data.find((row) => row.key === alias);
        if (syncedRow) {
          const parsedAlias = this.parsePayloadItems(syncedRow.payload);
          xbosMerged = this.mergeByCodePreferFirst(
            xbosMerged,
            this.toXbosOriginItems(parsedAlias.items),
          );
        }
        hrmMerged = this.mergeByCodePreferFirst(hrmMerged, extByKey.get(alias) ?? []);
      }
      const merged = this.mergeEffective(xbosMerged, hrmMerged);
      familyEffectiveCache.set(familyId, merged);
      return merged;
    };

    for (const catalogKey of [...keys].sort()) {
      const fam = resolveCatalogFamily(catalogKey);
      const syncedRow = synced.data.find((row) => row.key === catalogKey);
      const parsed = syncedRow
        ? this.parsePayloadItems(syncedRow.payload)
        : { name: null, domain: null, key: null, items: [] };
      const xbosItems = this.toXbosOriginItems(parsed.items);
      const hrmExtensionItems = extByKey.get(catalogKey) ?? [];
      catalogs.push({
        catalogKey,
        catalog_key: catalogKey,
        key: catalogKey,
        name: parsed.name ?? syncedRow?.key ?? catalogKey,
        domain: parsed.domain,
        xbosVersion: syncedRow?.version ?? null,
        xbosSyncedAt: syncedRow?.syncedAt ?? null,
        xbosItems,
        hrmExtensionItems,
        extension_items: hrmExtensionItems,
        extensionItems: hrmExtensionItems,
        items: hrmExtensionItems,
        effectiveItems: effectiveForFamily(fam.familyId, fam.aliases),
        aliases: [...fam.aliases],
        familyId: fam.familyId,
      });
    }
    return { catalogs };
  }

  async syncAllFromXbos(
    tenantId: string,
    companyId: string,
    authorization?: string,
  ): Promise<{ pulledKeys: string[] }> {
    const remote = await this.catalogSync.listRemoteCatalogsFromXbos(tenantId, companyId, authorization);
    const pulledKeys: string[] = [];
    for (const entry of remote.data as Array<{ key?: string }>) {
      const key = typeof entry?.key === 'string' ? entry.key : null;
      if (!key) continue;
      await this.catalogSync.pullCatalogFromXbos(key, tenantId, companyId, authorization);
      pulledKeys.push(key);
    }
    return { pulledKeys };
  }

  async submitExtensionItemsForApproval(
    tenantId: string,
    companyId: string,
    catalogKey: string,
    items: CatalogExtensionItemDto[],
    requestedBy?: { userId?: string; email?: string },
  ): Promise<{
    batchId: string;
    submitted: number;
    status: string;
    message: string;
    workflowInstanceId: string | null;
  }> {
    await this.ensureExtensionSchema();
    const t = tenantId.trim().toLowerCase();
    const c = companyId.trim().toLowerCase();
    const inputKey = this.normalizeCatalogKey(catalogKey);
    const ck = isE1bMasterCatalogKey(inputKey)
      ? await this.resolveWriteStorageKey(t, c, inputKey)
      : inputKey;
    const batchId = randomUUID();
    let submitted = 0;
    for (const row of items) {
      await this.db.query(
        `
        INSERT INTO public.hrm_catalog_extension_requests
          (id, batch_id, tenant_id, company_id, catalog_key, code, label, unit, status, requested_by_user_id, requested_by_email)
        VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, 'pending', $9, $10)
      `,
        [
          randomUUID(),
          batchId,
          t,
          c,
          ck,
          row.code,
          row.label,
          row.unit ?? null,
          requestedBy?.userId ?? null,
          requestedBy?.email ?? null,
        ],
      );
      submitted += 1;
    }
    await this.appendExtensionItems(
      t,
      c,
      ck,
      items.map((row) => ({
        ...row,
        status: row.status ?? 'draft',
      })),
    );
    const workflow = await this.xbosWorkflow.startCatalogWorkflowIfConfigured(
      batchId,
      t,
      c,
      requestedBy?.userId ?? requestedBy?.email,
    );

    return {
      batchId,
      submitted,
      status: 'pending',
      workflowInstanceId: workflow?.workflowInstanceId ?? null,
      message: workflow?.workflowInstanceId
        ? 'Đã gửi yêu cầu và khởi tạo quy trình phê duyệt XBOS (Tập đoàn).'
        : 'Đã gửi yêu cầu bổ sung danh mục — chờ XBOS (tập đoàn) phê duyệt.',
    };
  }

  async listExtensionRequests(filters: {
    status?: string;
    tenantId?: string;
    companyId?: string;
  }) {
    await this.ensureExtensionSchema();
    const clauses = ['1=1'];
    const params: unknown[] = [];
    let idx = 1;
    if (filters.status) {
      clauses.push(`status = $${idx++}`);
      params.push(filters.status);
    }
    if (filters.tenantId) {
      clauses.push(`tenant_id = $${idx++}`);
      params.push(filters.tenantId.trim().toLowerCase());
    }
    if (filters.companyId) {
      clauses.push(`company_id = $${idx++}`);
      params.push(filters.companyId.trim().toLowerCase());
    }
    const res = await this.db.query<{
      id: string;
      batch_id: string;
      tenant_id: string;
      company_id: string;
      catalog_key: string;
      code: string;
      label: string;
      unit: string | null;
      status: string;
      requested_by_user_id: string | null;
      requested_by_email: string | null;
      created_at: string;
    }>(
      `
      SELECT id, batch_id, tenant_id, company_id, catalog_key, code, label, unit, status,
             requested_by_user_id, requested_by_email, created_at
      FROM public.hrm_catalog_extension_requests
      WHERE ${clauses.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT 500
    `,
      params,
    );
    return { items: res.rows };
  }

  private async assertExtensionBatchInCatalogScope(
    batchId: string,
    tenantId: string,
    catalogCompanyId: string,
    authorization?: string,
  ): Promise<void> {
    await this.ensureExtensionSchema();
    const scope = resolveHrmListScope(authorization, catalogCompanyId, { tenantId });
    const peek = await this.db.query<{ tenant_id: string; company_id: string }>(
      `SELECT tenant_id, company_id
       FROM public.hrm_catalog_extension_requests
       WHERE batch_id = $1::uuid
       LIMIT 1`,
      [batchId],
    );
    const row = peek.rows[0];
    if (!row) {
      throw new ApiException('HRM-SET-404', 'Extension batch not found', HttpStatus.NOT_FOUND);
    }
    const normalizedTenant = tenantId.trim().toLowerCase();
    if (row.tenant_id?.trim().toLowerCase() !== normalizedTenant) {
      throw new ApiException(
        'HRM-SET-409',
        'Extension batch tenant is outside token scope',
        HttpStatus.CONFLICT,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-SET-404',
      mismatchCode: 'HRM-SET-409',
    });
  }

  async attachWorkflowToBatch(
    batchId: string,
    workflowInstanceId: string,
    tenantId: string,
    catalogCompanyId: string,
    authorization?: string,
  ): Promise<void> {
    await this.assertExtensionBatchInCatalogScope(batchId, tenantId, catalogCompanyId, authorization);
    await this.db.query(
      `UPDATE public.hrm_catalog_extension_requests
       SET workflow_instance_id = $2::uuid
       WHERE batch_id = $1::uuid AND status = 'pending'`,
      [batchId, workflowInstanceId],
    );
  }

  async reviewExtensionBatch(
    batchId: string,
    decision: 'approved' | 'rejected',
    reviewerUserId: string,
    reviewNote: string | undefined,
    tenantId: string,
    catalogCompanyId: string,
    authorization?: string,
  ) {
    await this.assertExtensionBatchInCatalogScope(batchId, tenantId, catalogCompanyId, authorization);
    const res = await this.db.query<{ id: string }>(
      `SELECT id FROM public.hrm_catalog_extension_requests
       WHERE batch_id = $1::uuid AND status = 'pending'`,
      [batchId],
    );
    const results = [];
    for (const row of res.rows) {
      results.push(await this.reviewExtensionRequest(row.id, decision, reviewerUserId, reviewNote));
    }
    return { batchId, decision, reviewed: results.length, results };
  }

  async getExtensionBatchDetail(
    batchId: string,
    tenantId: string,
    catalogCompanyId: string,
    authorization?: string,
  ) {
    await this.assertExtensionBatchInCatalogScope(batchId, tenantId, catalogCompanyId, authorization);
    const normalizedTenant = tenantId.trim().toLowerCase();
    const normalizedCompany = catalogCompanyId.trim().toLowerCase();
    const res = await this.db.query(
      `SELECT id, batch_id, tenant_id, company_id, catalog_key, code, label, unit, status,
              workflow_instance_id, requested_by_user_id, requested_by_email, created_at
       FROM public.hrm_catalog_extension_requests
       WHERE batch_id = $1::uuid
         AND tenant_id = $2
         AND company_id = $3
       ORDER BY catalog_key, code`,
      [batchId, normalizedTenant, normalizedCompany],
    );
    if (!res.rows.length) {
      throw new ApiException('HRM-SET-404', 'Extension batch not found', HttpStatus.NOT_FOUND);
    }
    return { batchId, items: res.rows };
  }

  async reviewExtensionRequest(
    requestId: string,
    decision: 'approved' | 'rejected',
    reviewerUserId: string,
    reviewNote?: string,
  ) {
    await this.ensureExtensionSchema();
    const res = await this.db.query<{
      id: string;
      tenant_id: string;
      company_id: string;
      catalog_key: string;
      code: string;
      label: string;
      unit: string | null;
      status: string;
    }>(
      `SELECT id, tenant_id, company_id, catalog_key, code, label, unit, status
       FROM public.hrm_catalog_extension_requests WHERE id = $1::uuid LIMIT 1`,
      [requestId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-SET-420', 'Extension request not found', HttpStatus.NOT_FOUND);
    }
    if (row.status !== 'pending') {
      throw new ApiException('HRM-SET-421', 'Request already reviewed', HttpStatus.CONFLICT, {
        status: row.status,
      });
    }
    if (decision === 'approved') {
      await this.appendExtensionItems(row.tenant_id, row.company_id, row.catalog_key, [
        {
          code: row.code,
          label: row.label,
          unit: row.unit ?? undefined,
          status: 'active',
        },
      ]);
    }
    await this.db.query(
      `
      UPDATE public.hrm_catalog_extension_requests
      SET status = $2, reviewed_by_user_id = $3, review_note = $4, reviewed_at = NOW()
      WHERE id = $1::uuid
    `,
      [requestId, decision, reviewerUserId, reviewNote?.trim() ?? null],
    );
    return { requestId, status: decision, catalogKey: row.catalog_key, code: row.code };
  }

  async appendExtensionItems(
    tenantId: string,
    companyId: string,
    catalogKey: string,
    items: CatalogExtensionItemDto[],
  ): Promise<{ upserted: number; storageKey: string }> {
    await this.ensureExtensionSchema();
    const t = tenantId.trim().toLowerCase();
    const c = companyId.trim().toLowerCase();
    const inputKey = this.normalizeCatalogKey(catalogKey);
    // E1-B MD families → storageKey; other extension catalogs (employee fields) keep literal key.
    const ck = isE1bMasterCatalogKey(inputKey)
      ? await this.resolveWriteStorageKey(t, c, inputKey)
      : inputKey;
    if (items.length === 0) {
      return { upserted: 0, storageKey: ck };
    }

    const codes: string[] = [];
    const labels: string[] = [];
    const units: Array<string | null> = [];
    const statuses: string[] = [];
    for (const row of items) {
      codes.push(row.code);
      labels.push(row.label);
      units.push(row.unit ?? null);
      statuses.push(row.status ?? 'active');
    }

    await this.db.query(
      `
      INSERT INTO public.hrm_catalog_extension_items (tenant_id, company_id, catalog_key, code, label, unit, status)
      SELECT $1, $2, $3, u.code, u.label, u.unit, u.status
      FROM unnest($4::text[], $5::text[], $6::text[], $7::text[]) AS u(code, label, unit, status)
      ON CONFLICT (tenant_id, company_id, catalog_key, code)
      DO UPDATE SET
        label = EXCLUDED.label,
        unit = EXCLUDED.unit,
        status = EXCLUDED.status
    `,
      [t, c, ck, codes, labels, units, statuses],
    );
    return { upserted: items.length, storageKey: ck };
  }

  async upsertCatalogItem(tenantId: string, body: SettingsCatalogItemMutationDto) {
    const status = body.status === 'draft' ? 'draft' : 'active';
    const result = await this.appendExtensionItems(tenantId, body.company_id, body.category_key, [
      {
        code: body.item_key,
        label: body.item_name,
        unit: body.item_value ?? undefined,
        status,
      },
    ]);
    return {
      upserted: result.upserted,
      item_key: body.item_key,
      category_key: result.storageKey,
      status,
    };
  }

  /**
   * Soft-deactivate extension item (status=draft) — AC-SC-POS prefer stop over hard delete.
   * XBOS-origin codes cannot be deleted here (extension-only); missing extension → 404.
   * E1-B: locate across family aliases; prefer storageKey row.
   */
  async deleteCatalogItem(tenantId: string, body: Pick<SettingsCatalogItemMutationDto, 'company_id' | 'category_key' | 'item_key'>) {
    await this.ensureExtensionSchema();
    const t = tenantId.trim().toLowerCase();
    const c = body.company_id.trim().toLowerCase();
    const inputKey = this.normalizeCatalogKey(body.category_key);
    const fam = resolveCatalogFamily(inputKey);
    const code = body.item_key.trim();
    const tryKeys = isE1bMasterCatalogKey(inputKey)
      ? catalogAliasTryList(inputKey)
      : [inputKey];

    for (const catalogKey of tryKeys) {
      const res = await this.db.query<{ code: string; catalog_key: string }>(
        `UPDATE public.hrm_catalog_extension_items
         SET status = 'draft'
         WHERE tenant_id = $1 AND company_id = $2 AND catalog_key = $3 AND code = $4
         RETURNING code, catalog_key`,
        [t, c, catalogKey, code],
      );
      if (res.rows[0]) {
        return {
          item_key: res.rows[0].code,
          category_key: res.rows[0].catalog_key,
          status: 'draft' as const,
        };
      }
    }
    throw new ApiException(
      'HRM-SET-404',
      `Catalog item not found in HRM extension for family '${fam.familyId}' (cannot hard-delete XBOS master)`,
      HttpStatus.NOT_FOUND,
    );
  }

  async requestFieldRemoval(
    tenantId: string,
    companyId: string,
    catalogKey: string,
    payload: RequestCatalogFieldRemovalDto,
  ) {
    await this.ensureExtensionSchema();
    const inputKey = this.normalizeCatalogKey(catalogKey);
    const code = payload.code.trim();
    const t = tenantId.trim().toLowerCase();
    const c = companyId.trim().toLowerCase();
    const tryKeys = isE1bMasterCatalogKey(inputKey)
      ? catalogAliasTryList(inputKey)
      : [inputKey];

    let ck = inputKey;
    let extRes: { rows: Array<{ label: string }> } = { rows: [] };
    for (const candidate of tryKeys) {
      extRes = await this.db.query<{ label: string }>(
        `
      SELECT label
      FROM public.hrm_catalog_extension_items
      WHERE tenant_id = $1 AND company_id = $2 AND catalog_key = $3 AND code = $4
      LIMIT 1
    `,
        [t, c, candidate, code],
      );
      if (extRes.rows[0]) {
        ck = candidate;
        break;
      }
    }
    if (!extRes.rows[0]) {
      throw new ApiException(
        'HRM-SET-410',
        `Field '${code}' does not exist in HRM extension scope`,
        HttpStatus.NOT_FOUND,
      );
    }

    const requestRes = await this.db.query<{
      id: string;
      status: string;
      leadership_emails: string[];
      created_at: string;
    }>(
      `
      INSERT INTO public.hrm_catalog_field_removal_requests
        (id, tenant_id, company_id, catalog_key, code, label, reason, requested_by_name, requested_by_email, leadership_emails, status)
      VALUES
        ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10::text[], 'pending')
      RETURNING id, status, leadership_emails, created_at
    `,
      [
        randomUUID(),
        t,
        c,
        ck,
        code,
        payload.label?.trim() || extRes.rows[0].label,
        payload.reason?.trim() || 'Company requested field removal from HRM extension catalog',
        payload.requested_by_name?.trim() || null,
        payload.requested_by_email?.trim() || null,
        this.parseLeadershipEmails(),
      ],
    );

    const row = requestRes.rows[0];
    return {
      requestId: row.id,
      status: row.status,
      leadershipEmails: row.leadership_emails,
      createdAt: row.created_at,
      message:
        'Removal request created and pending XBOS + group leadership approval. Field is not deleted immediately.',
    };
  }

  /**
   * Count active items across FR-HRM-SC-POS catalog keys (XBOS snapshot + HRM extension).
   * When > 0, hardcoded tenant-position registry must not write as SoT.
   */
  async countActivePosMasterItems(tenantId: string, companyId: string): Promise<number> {
    let total = 0;
    for (const key of HRM_SC_POS_KEYS) {
      const items = await this.getEffectiveItemsForKey(tenantId, companyId, key);
      total += items.filter((i) => i.status === 'active').length;
    }
    return total;
  }

  /**
   * G-ORPH-BE-03 gate — hardcode seed only when sponsor enables bootstrap AND POS SoT empty.
   * @CODE-MEMORY method · FR-HRM-SC-MD-01/02 · U65
   */
  private async assertTenantPositionHardcodeSeedAllowed(
    tenantId: string,
    companyId: string,
  ): Promise<void> {
    if (!isTenantPositionSeedEnvAllowed()) {
      throw new ApiException(
        'HRM-CAT-POS-SEED-FORBIDDEN',
        'tenant-position-catalog seed is bootstrap-only (G-ORPH-BE-03 retired). Prefer POST …/sync-from-xbos or catalog-sync/pull for job_titles/departments. Set HRM_ALLOW_TENANT_POSITION_SEED=1 only for explicit bootstrap-dev — not UAT evidence.',
        HttpStatus.FORBIDDEN,
      );
    }
    const activePos = await this.countActivePosMasterItems(tenantId, companyId);
    if (activePos > 0) {
      throw new ApiException(
        'HRM-CAT-POS-SEED-SOT-EXISTS',
        `Refusing hardcoded tenant-position seed: ${activePos} active item(s) already in XBOS/Settings POS catalogs (${HRM_SC_POS_KEYS.join('|')}). Use Settings path.`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async seedEmployeeProfileTemplate(tenantId: string, companyId: string): Promise<{
    catalogs: Array<{ catalogKey: string; upserted: number }>;
    totalUpserted: number;
  }> {
    await this.ensureExtensionSchema();
    const t = tenantId.trim().toLowerCase() || masterTenantIdFromEnv();
    if (!t) {
      throw new ApiException(
        'HRM-CAT-TENANT',
        'tenantId is required (header or JWT), or set MASTER_TENANT_ID / DEFAULT_TENANT_ID for seed.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const c = companyId.trim().toLowerCase();
    // Xử lý: dept/position field defs = empty select — SoT là job_titles/departments (XBOS), không hardcode (G-ORPH-BE-03).
    const deptPositionItems = buildEmptyPositionFieldDefs();
    const templates: Array<{ catalogKey: string; items: CatalogExtensionItemDto[] }> = [
      {
        catalogKey: 'hrm_employee_basic_fields',
        items: [
            { code: 'employee_code', label: 'Mã nhân sự', unit: 'text', status: 'active' },
            { code: 'full_name', label: 'Họ và tên', unit: 'text', status: 'active' },
            ...deptPositionItems,
            { code: 'status', label: 'Trạng thái lao động', unit: 'select:active|probation|inactive', status: 'active' },
            { code: 'xbos_basic_badge_id', label: 'Mã thẻ nội bộ', unit: 'text', status: 'active' },
        ],
      },
      {
        catalogKey: 'hrm_employee_personal_fields',
        items: [
          { code: 'date_of_birth', label: 'Ngày sinh', unit: 'date', status: 'active' },
          { code: 'gender', label: 'Giới tính', unit: 'select:Nam|Nữ|Khác', status: 'active' },
          { code: 'national_id', label: 'CCCD/CMND', unit: 'text', status: 'active' },
          { code: 'phone_number', label: 'Số điện thoại', unit: 'phone', status: 'active' },
          { code: 'permanent_address', label: 'Địa chỉ thường trú', unit: 'text', status: 'active' },
          { code: 'xbos_personal_hometown', label: 'Quê quán', unit: 'text', status: 'active' },
        ],
      },
      {
        catalogKey: 'hrm_employee_work_fields',
        items: [
          { code: 'join_date', label: 'Ngày vào làm', unit: 'date', status: 'active' },
          { code: 'work_location', label: 'Địa điểm làm việc', unit: 'text', status: 'active' },
          { code: 'manager', label: 'Quản lý trực tiếp', unit: 'text', status: 'active' },
          { code: 'employment_type', label: 'Loại hợp đồng', unit: 'select:full-time|part-time|contract|intern', status: 'active' },
          { code: 'xbos_work_shift_group', label: 'Nhóm ca làm việc', unit: 'select:Ca hành chính|Ca xoay 2|Ca xoay 3', status: 'active' },
        ],
      },
      {
        catalogKey: 'hrm_employee_finance_fields',
        items: [
          { code: 'bank_account_number', label: 'Số tài khoản ngân hàng', unit: 'text', status: 'active' },
          { code: 'bank_name', label: 'Ngân hàng', unit: 'text', status: 'active' },
          { code: 'tax_code', label: 'Mã số thuế TNCN', unit: 'text', status: 'active' },
          { code: 'salary_grade', label: 'Bậc lương', unit: 'text', status: 'active' },
          { code: 'xbos_finance_salary_band', label: 'Nhóm lương XBOS', unit: 'select:Band A|Band B|Band C', status: 'active' },
        ],
      },
    ];

    const catalogs: Array<{ catalogKey: string; upserted: number }> = [];
    let totalUpserted = 0;
    for (const tpl of templates) {
      const result = await this.appendExtensionItems(t, c, tpl.catalogKey, tpl.items);
      catalogs.push({ catalogKey: tpl.catalogKey, upserted: result.upserted });
      totalUpserted += result.upserted;
    }
    return { catalogs, totalUpserted };
  }

  private async upsertGroupCatalogMeta(
    tenantId: string,
    companyId: string,
    catalogKey: string,
    name: string,
    domain: string,
    items: CatalogExtensionItemDto[],
  ): Promise<void> {
    await this.catalogSync.listSyncedCatalogs(tenantId, companyId);
    const payload = {
      key: catalogKey,
      name,
      domain,
      source: 'xevn_group_import_template',
      items: items.map((row) => ({
        code: row.code,
        label: row.label,
        unit: row.unit ?? null,
        status: row.status ?? 'active',
      })),
    };
    const checksum = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    await this.db.query(
      `
      INSERT INTO public.synced_catalogs (tenant_id, company_id, catalog_key, source_system, payload, version, checksum, synced_at)
      VALUES ($1, $2, $3, 'xevn_group', $4::jsonb, 1, $5, NOW())
      ON CONFLICT (tenant_id, company_id, catalog_key)
      DO UPDATE SET
        payload = EXCLUDED.payload,
        source_system = EXCLUDED.source_system,
        version = public.synced_catalogs.version + 1,
        checksum = EXCLUDED.checksum,
        synced_at = NOW()
    `,
      [tenantId, companyId, catalogKey, JSON.stringify(payload), checksum],
    );
  }

  async seedGroupEmployeeImportCatalog(
    tenantId: string,
    companyId: string,
  ): Promise<{
    tenantId: string;
    companyId: string;
    catalogs: Array<{ catalogKey: string; upserted: number }>;
    totalUpserted: number;
  }> {
    const t = tenantId.trim().toLowerCase();
    const c = companyId.trim().toLowerCase();
    if (!t || !c) {
      throw new ApiException(
        'HRM-CAT-SCOPE',
        'tenantId and companyId are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const catalogs: Array<{ catalogKey: string; upserted: number }> = [];
    let totalUpserted = 0;
    for (const def of GROUP_EMPLOYEE_IMPORT_CATALOGS) {
      await this.upsertGroupCatalogMeta(t, c, def.catalogKey, def.name, def.domain, def.items);
      const result = await this.appendExtensionItems(t, c, def.catalogKey, def.items);
      catalogs.push({ catalogKey: def.catalogKey, upserted: result.upserted });
      totalUpserted += result.upserted;
    }
    return { tenantId: t, companyId: c, catalogs, totalUpserted };
  }

  async seedGroupEmployeeImportCatalogAllTenants(): Promise<{
    scopes: Array<{
      tenantId: string;
      companyId: string;
      catalogs: Array<{ catalogKey: string; upserted: number }>;
      totalUpserted: number;
    }>;
    totalUpserted: number;
  }> {
    const scopes: Array<{
      tenantId: string;
      companyId: string;
      catalogs: Array<{ catalogKey: string; upserted: number }>;
      totalUpserted: number;
    }> = [];
    let totalUpserted = 0;
    for (const scope of GROUP_HRM_TENANT_SCOPES) {
      const row = await this.seedGroupEmployeeImportCatalog(scope.tenantId, scope.companyId);
      scopes.push({
        tenantId: row.tenantId,
        companyId: row.companyId,
        catalogs: row.catalogs,
        totalUpserted: row.totalUpserted,
      });
      totalUpserted += row.totalUpserted;
    }
    return { scopes, totalUpserted };
  }

  async seedTourismFleetCatalog(): Promise<{
    tenantId: string;
    companyId: string;
    catalogs: Array<{ catalogKey: string; upserted: number }>;
    totalUpserted: number;
  }> {
    const t = TOURISM_TENANT_ID;
    const c = TOURISM_COMPANY_ID;
    const catalogs: Array<{ catalogKey: string; upserted: number }> = [];
    let totalUpserted = 0;
    for (const def of TOURISM_FLEET_CATALOGS) {
      await this.upsertGroupCatalogMeta(t, c, def.catalogKey, def.name, def.domain, def.items);
      const result = await this.appendExtensionItems(t, c, def.catalogKey, def.items);
      catalogs.push({ catalogKey: def.catalogKey, upserted: result.upserted });
      totalUpserted += result.upserted;
    }
    return { tenantId: t, companyId: c, catalogs, totalUpserted };
  }

  /**
   * BOOTSTRAP-ONLY — upsert department + position into hrm_employee_basic_fields from hardcode registry.
   * Prefer XBOS pull job_titles/departments. Requires HRM_ALLOW_TENANT_POSITION_SEED=1 and empty POS SoT.
   * @CODE-MEMORY method · G-ORPH-BE-03 retired · FR-HRM-SC-MD-01/02
   */
  async seedTenantPositionCatalog(
    tenantId: string,
    companyId: string,
  ): Promise<{
    tenantId: string;
    companyId: string;
    departmentOptions: number;
    positionOptions: number;
    upserted: number;
    source: 'bootstrap_hardcode';
    sot: 'deprecated_use_xbos_settings';
  }> {
    await this.ensureExtensionSchema();
    const t = tenantId.trim().toLowerCase();
    const c = companyId.trim().toLowerCase();
    await this.assertTenantPositionHardcodeSeedAllowed(t, c);
    const catalog = getTenantPositionCatalog(t);
    if (!catalog) {
      throw new ApiException(
        'HRM-CAT-POSITION',
        `No bootstrap position catalog defined for tenant "${t}" — use XBOS sync for job_titles/departments`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const items = buildPositionCatalogItems(catalog);
    const result = await this.appendExtensionItems(t, c, 'hrm_employee_basic_fields', items);
    const deptUnit = items.find((i) => i.code === 'department')?.unit ?? '';
    const posUnit = items.find((i) => i.code === 'position')?.unit ?? '';
    return {
      tenantId: t,
      companyId: c,
      departmentOptions: deptUnit.replace(/^select:/, '').split('|').filter(Boolean).length,
      positionOptions: posUnit.replace(/^select:/, '').split('|').filter(Boolean).length,
      upserted: result.upserted,
      source: 'bootstrap_hardcode',
      sot: 'deprecated_use_xbos_settings',
    };
  }

  async seedTenantPositionCatalogAllTenants(): Promise<{
    scopes: Array<{
      tenantId: string;
      companyId: string;
      departmentOptions: number;
      positionOptions: number;
      upserted: number;
      source: 'bootstrap_hardcode';
      sot: 'deprecated_use_xbos_settings';
    }>;
  }> {
    if (!isTenantPositionSeedEnvAllowed()) {
      throw new ApiException(
        'HRM-CAT-POS-SEED-FORBIDDEN',
        'tenant-position-catalog seed-all is bootstrap-only (G-ORPH-BE-03 retired). Prefer sync-from-xbos. Set HRM_ALLOW_TENANT_POSITION_SEED=1 only for explicit bootstrap-dev.',
        HttpStatus.FORBIDDEN,
      );
    }
    const scopes: Array<{
      tenantId: string;
      companyId: string;
      departmentOptions: number;
      positionOptions: number;
      upserted: number;
      source: 'bootstrap_hardcode';
      sot: 'deprecated_use_xbos_settings';
    }> = [];
    for (const { tenantId, companyId } of GROUP_HRM_TENANT_SCOPES.filter((s) => s.tenantId !== 'xevn')) {
      const row = await this.seedTenantPositionCatalog(tenantId, companyId);
      scopes.push({
        tenantId: row.tenantId,
        companyId: row.companyId,
        departmentOptions: row.departmentOptions,
        positionOptions: row.positionOptions,
        upserted: row.upserted,
        source: row.source,
        sot: row.sot,
      });
    }
    return { scopes };
  }
}
