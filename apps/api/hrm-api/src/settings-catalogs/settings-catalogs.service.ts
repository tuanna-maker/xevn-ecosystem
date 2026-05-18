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
  buildPositionCatalogItems,
  getTenantPositionCatalog,
} from './tenant-position-catalog';
import { XbosCatalogWorkflowBridge } from './xbos-catalog-workflow.bridge';

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
    const ck = this.normalizeCatalogKey(catalogKey);
    const t = tenantId.trim().toLowerCase();
    const c = companyId.trim().toLowerCase();
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

  async attachWorkflowToBatch(batchId: string, workflowInstanceId: string): Promise<void> {
    await this.ensureExtensionSchema();
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
    reviewNote?: string,
  ) {
    await this.ensureExtensionSchema();
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

  async getExtensionBatchDetail(batchId: string) {
    await this.ensureExtensionSchema();
    const res = await this.db.query(
      `SELECT id, batch_id, tenant_id, company_id, catalog_key, code, label, unit, status,
              workflow_instance_id, requested_by_user_id, requested_by_email, created_at
       FROM public.hrm_catalog_extension_requests
       WHERE batch_id = $1::uuid
       ORDER BY catalog_key, code`,
      [batchId],
    );
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
        items: (() => {
          const tenantCatalog = getTenantPositionCatalog(t);
          const deptPositionItems: CatalogExtensionItemDto[] = tenantCatalog
            ? buildPositionCatalogItems(tenantCatalog)
            : [
                { code: 'department', label: 'Phòng ban', unit: 'select:', status: 'active' },
                { code: 'position', label: 'Chức danh', unit: 'select:', status: 'active' },
              ];
          return [
            { code: 'employee_code', label: 'Mã nhân sự', unit: 'text', status: 'active' },
            { code: 'full_name', label: 'Họ và tên', unit: 'text', status: 'active' },
            ...deptPositionItems,
            { code: 'status', label: 'Trạng thái lao động', unit: 'select:active|probation|inactive', status: 'active' },
            { code: 'xbos_basic_badge_id', label: 'Mã thẻ nội bộ', unit: 'text', status: 'active' },
          ];
        })(),
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

  /** Upsert chỉ field department + position theo danh mục tenant-position-catalog.ts */
  async seedTenantPositionCatalog(
    tenantId: string,
    companyId: string,
  ): Promise<{
    tenantId: string;
    companyId: string;
    departmentOptions: number;
    positionOptions: number;
    upserted: number;
  }> {
    await this.ensureExtensionSchema();
    const t = tenantId.trim().toLowerCase();
    const c = companyId.trim().toLowerCase();
    const catalog = getTenantPositionCatalog(t);
    if (!catalog) {
      throw new ApiException(
        'HRM-CAT-POSITION',
        `No position catalog defined for tenant "${t}"`,
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
    };
  }

  async seedTenantPositionCatalogAllTenants(): Promise<{
    scopes: Array<{
      tenantId: string;
      companyId: string;
      departmentOptions: number;
      positionOptions: number;
      upserted: number;
    }>;
  }> {
    const scopes: Array<{
      tenantId: string;
      companyId: string;
      departmentOptions: number;
      positionOptions: number;
      upserted: number;
    }> = [];
    for (const { tenantId, companyId } of GROUP_HRM_TENANT_SCOPES.filter((s) => s.tenantId !== 'xevn')) {
      const row = await this.seedTenantPositionCatalog(tenantId, companyId);
      scopes.push({
        tenantId: row.tenantId,
        companyId: row.companyId,
        departmentOptions: row.departmentOptions,
        positionOptions: row.positionOptions,
        upserted: row.upserted,
      });
    }
    return { scopes };
  }
}
