import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';

type MasterEntryRow = {
  tenant_id: string;
  company_id: string;
  domain: string;
  item_id: string;
  payload: unknown;
  status: string;
  created_at: string;
  updated_at: string;
};

const allowedDomains = new Set([
  'companies',
  'kpi_metrics',
  'positions',
  'vendors',
  'expense_categories',
  'organizations',
  'customers',
  'partners',
]);

@Injectable()
export class BusinessMasterService {
  constructor(private readonly db: XbosDbService) {}

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_business_master_entries (
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        domain TEXT NOT NULL,
        item_id TEXT NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (tenant_id, company_id, domain, item_id)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_xbos_business_master_domain_scope
      ON public.xbos_business_master_entries (tenant_id, company_id, domain, updated_at DESC);
    `);
  }

  private assertDomain(domain: string): string {
    const normalized = (domain || '').trim().toLowerCase();
    if (!allowedDomains.has(normalized)) {
      throw new ApiException('XBOS-MASTER-400', 'Invalid business master domain', HttpStatus.BAD_REQUEST, {
        domain,
      });
    }
    return normalized;
  }

  private defaultCompanies(tenantId: string, companyId: string) {
    return [
      {
        id: 'all',
        code: 'ALL',
        name: 'Toàn tập đoàn',
        shortName: 'All',
        employeeCount: 0,
        revenue: 0,
        status: 'active',
        address: 'N/A',
        establishedDate: '2020-01-01',
        entityLevel: 'parent',
        parentEntityId: null,
        tenantId,
        companyId,
      },
      {
        id: companyId,
        code: companyId.toUpperCase(),
        name: `Đơn vị ${companyId.toUpperCase()}`,
        shortName: companyId.toUpperCase(),
        employeeCount: 0,
        revenue: 0,
        status: 'active',
        address: 'N/A',
        establishedDate: '2020-01-01',
        entityLevel: 'subsidiary',
        parentEntityId: null,
        tenantId,
        companyId,
      },
    ];
  }

  async list(tenantId: string, companyId: string, domainRaw: string) {
    await this.ensureSchema();
    const domain = this.assertDomain(domainRaw);
    const res = await this.db.query<MasterEntryRow>(
      `
      SELECT tenant_id, company_id, domain, item_id, payload, status, created_at, updated_at
      FROM public.xbos_business_master_entries
      WHERE tenant_id = $1 AND company_id = $2 AND domain = $3 AND status <> 'deleted'
      ORDER BY updated_at DESC
      `,
      [tenantId, companyId, domain],
    );
    if (res.rows.length === 0 && domain === 'companies') {
      return this.defaultCompanies(tenantId, companyId);
    }
    return res.rows.map((row) => ({
      id: row.item_id,
      ...(typeof row.payload === 'object' && row.payload ? (row.payload as Record<string, unknown>) : {}),
      status: row.status,
      tenantId: row.tenant_id,
      companyId: row.company_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async upsert(tenantId: string, companyId: string, domainRaw: string, itemId: string, payload: unknown) {
    await this.ensureSchema();
    const domain = this.assertDomain(domainRaw);
    const normalizedItemId = (itemId || '').trim();
    if (!normalizedItemId) {
      throw new ApiException('XBOS-MASTER-422', 'itemId is required', HttpStatus.BAD_REQUEST);
    }
    const res = await this.db.query<MasterEntryRow>(
      `
      INSERT INTO public.xbos_business_master_entries (
        tenant_id, company_id, domain, item_id, payload, status, updated_at
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, 'active', NOW())
      ON CONFLICT (tenant_id, company_id, domain, item_id)
      DO UPDATE SET
        payload = EXCLUDED.payload,
        status = 'active',
        updated_at = NOW()
      RETURNING tenant_id, company_id, domain, item_id, payload, status, created_at, updated_at
      `,
      [tenantId, companyId, domain, normalizedItemId, JSON.stringify(payload ?? {})],
    );
    return res.rows[0];
  }

  async remove(tenantId: string, companyId: string, domainRaw: string, itemId: string) {
    await this.ensureSchema();
    const domain = this.assertDomain(domainRaw);
    await this.db.query(
      `
      UPDATE public.xbos_business_master_entries
      SET status = 'deleted', updated_at = NOW()
      WHERE tenant_id = $1 AND company_id = $2 AND domain = $3 AND item_id = $4
      `,
      [tenantId, companyId, domain, itemId],
    );
    return { deleted: true };
  }
}

