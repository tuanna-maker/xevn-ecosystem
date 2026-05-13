import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbService } from '../db/hrm-db.service';
import type { CatalogExtensionItemDto } from './dto/append-extension-items.dto';
import type { RequestCatalogFieldRemovalDto } from './dto/request-removal.dto';
import { randomUUID } from 'node:crypto';

export type SettingsCatalogItem = {
  code: string;
  label: string;
  unit: string | null;
  status: 'active' | 'draft';
  origin: 'xbos' | 'hrm';
};

export type SettingsCatalogOverviewRow = {
  catalogKey: string;
  name: string | null;
  domain: string | null;
  xbosVersion: number | null;
  xbosSyncedAt: string | null;
  xbosItems: SettingsCatalogItem[];
  hrmExtensionItems: SettingsCatalogItem[];
  effectiveItems: SettingsCatalogItem[];
};

@Injectable()
export class SettingsCatalogsService {
  constructor(
    private readonly db: HrmDbService,
    private readonly catalogSync: CatalogSyncService,
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

  async getOverview(tenantId: string, companyId: string): Promise<{ catalogs: SettingsCatalogOverviewRow[] }> {
    await this.ensureExtensionSchema();
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
    const extByKey = new Map<string, SettingsCatalogItem[]>();
    for (const row of extRes.rows) {
      const list = extByKey.get(row.catalog_key) ?? [];
      list.push({
        code: row.code,
        label: row.label,
        unit: row.unit,
        status: row.status === 'draft' ? 'draft' : 'active',
        origin: 'hrm',
      });
      extByKey.set(row.catalog_key, list);
    }

    const keys = new Set<string>();
    for (const c of synced.data) {
      keys.add(c.key);
    }
    for (const k of extByKey.keys()) {
      keys.add(k);
    }

    const catalogs: SettingsCatalogOverviewRow[] = [];
    for (const catalogKey of [...keys].sort()) {
      const syncedRow = synced.data.find((c) => c.key === catalogKey);
      const parsed = syncedRow ? this.parsePayloadItems(syncedRow.payload) : { name: null, domain: null, key: null, items: [] };
      const xbosItems = this.toXbosOriginItems(parsed.items);
      const hrmExtensionItems = extByKey.get(catalogKey) ?? [];
      catalogs.push({
        catalogKey,
        name: parsed.name ?? syncedRow?.key ?? catalogKey,
        domain: parsed.domain,
        xbosVersion: syncedRow?.version ?? null,
        xbosSyncedAt: syncedRow?.syncedAt ?? null,
        xbosItems,
        hrmExtensionItems,
        effectiveItems: this.mergeEffective(xbosItems, hrmExtensionItems),
      });
    }
    return { catalogs };
  }

  async syncAllFromXbos(tenantId: string, companyId: string): Promise<{ pulledKeys: string[] }> {
    const remote = await this.catalogSync.listRemoteCatalogsFromXbos(tenantId, companyId);
    const pulledKeys: string[] = [];
    for (const entry of remote.data as Array<{ key?: string }>) {
      const key = typeof entry?.key === 'string' ? entry.key : null;
      if (!key) continue;
      await this.catalogSync.pullCatalogFromXbos(key, tenantId, companyId);
      pulledKeys.push(key);
    }
    return { pulledKeys };
  }

  async appendExtensionItems(
    tenantId: string,
    companyId: string,
    catalogKey: string,
    items: CatalogExtensionItemDto[],
  ): Promise<{ upserted: number }> {
    await this.ensureExtensionSchema();
    const ck = this.normalizeCatalogKey(catalogKey);
    const t = tenantId.trim().toLowerCase();
    const c = companyId.trim().toLowerCase();
    let upserted = 0;
    for (const row of items) {
      const status = row.status ?? 'active';
      await this.db.query(
        `
        INSERT INTO public.hrm_catalog_extension_items (tenant_id, company_id, catalog_key, code, label, unit, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (tenant_id, company_id, catalog_key, code)
        DO UPDATE SET
          label = EXCLUDED.label,
          unit = EXCLUDED.unit,
          status = EXCLUDED.status
      `,
        [t, c, ck, row.code, row.label, row.unit ?? null, status],
      );
      upserted += 1;
    }
    return { upserted };
  }

  async requestFieldRemoval(
    tenantId: string,
    companyId: string,
    catalogKey: string,
    payload: RequestCatalogFieldRemovalDto,
  ) {
    await this.ensureExtensionSchema();
    const ck = this.normalizeCatalogKey(catalogKey);
    const code = payload.code.trim();
    const t = tenantId.trim().toLowerCase();
    const c = companyId.trim().toLowerCase();

    const extRes = await this.db.query<{ label: string }>(
      `
      SELECT label
      FROM public.hrm_catalog_extension_items
      WHERE tenant_id = $1 AND company_id = $2 AND catalog_key = $3 AND code = $4
      LIMIT 1
    `,
      [t, c, ck, code],
    );
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
    const templates: Array<{ catalogKey: string; items: CatalogExtensionItemDto[] }> = [
      {
        catalogKey: 'hrm_employee_basic_fields',
        items: [
          { code: 'employee_code', label: 'Mã nhân sự', unit: 'text', status: 'active' },
          { code: 'full_name', label: 'Họ và tên', unit: 'text', status: 'active' },
          { code: 'department', label: 'Phòng ban', unit: 'select:Vận hành|Nhân sự|Kế toán|Kinh doanh', status: 'active' },
          { code: 'position', label: 'Chức danh', unit: 'text', status: 'active' },
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
}
