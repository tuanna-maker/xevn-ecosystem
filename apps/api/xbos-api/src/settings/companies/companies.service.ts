/**
 * @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-BE-01
 * solid_convention_ack: true
 * be_boundary: true
 *
 * SRP: CompaniesService quản lý provision + lifecycle tenant trong XBOS (Plane A).
 * Không query HRM DB. Không gộp với auth logic.
 * Transaction: POST dùng CTE đơn (atomicity at PostgreSQL level - không cần client.connect()).
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../../common/api.exception';
import { XbosDbService } from '../../db/xbos-db.service';
import { PlatformAuditService } from '../../platform/platform-audit.service';
import type { CreateCompanyDto, AllowedModule } from './dto/create-company.dto';
import type { UpdateModulesDto } from './dto/update-modules.dto';

export type CompanyLegalEntity = {
  code: string | null;
  taxCode: string | null;
  businessLines: string | null;
};

export type CompanyListItem = {
  tenantId: string;
  name: string;
  shortName: string;
  tenantKind: string;
  defaultCompanyId: string | null;
  modules: string[];
  status: string;
  legalEntity: CompanyLegalEntity | null;
};

type TenantRegistryRow = {
  tenant_id: string;
  name: string;
  short_name: string;
  tenant_kind: string;
  default_company_id: string | null;
  modules: unknown;
  status: string;
  le_code: string | null;
  le_tax_code: string | null;
  le_business_lines: string | null;
};

type TenantStatusRow = {
  status: string;
  modules: unknown;
};

type ProvisionCteRow = {
  tenant_id: string | null;
  conflict: number | null;
};

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.filter((v): v is string => typeof v === 'string');
  }
  return [];
}

function mapTenantRow(row: TenantRegistryRow): CompanyListItem {
  const hasLe = Boolean(row.le_code || row.le_tax_code || row.le_business_lines);
  return {
    tenantId: row.tenant_id,
    name: row.name,
    shortName: row.short_name,
    tenantKind: row.tenant_kind,
    defaultCompanyId: row.default_company_id,
    modules: toStringArray(row.modules),
    status: row.status,
    legalEntity: hasLe
      ? { code: row.le_code, taxCode: row.le_tax_code, businessLines: row.le_business_lines }
      : null,
  };
}

@Injectable()
export class CompaniesService {
  constructor(
    private readonly db: XbosDbService,
    private readonly audit: PlatformAuditService,
  ) {}

  /**
   * GET /api/xbos/settings/companies
   * List all tenants LEFT JOIN their primary legal entity.
   */
  async listCompanies(): Promise<CompanyListItem[]> {
    const { rows } = await this.db.query<TenantRegistryRow>(`
      SELECT
        t.tenant_id,
        t.name,
        t.short_name,
        t.tenant_kind,
        t.default_company_id,
        t.modules,
        t.status,
        le.code           AS le_code,
        le.tax_code       AS le_tax_code,
        le.business_lines AS le_business_lines
      FROM public.xbos_tenant_registry t
      LEFT JOIN public.xbos_legal_entity le
        ON le.tenant_id = t.tenant_id
       AND le.company_id = COALESCE(t.default_company_id, 'main')
      ORDER BY
        CASE WHEN t.tenant_kind = 'master' THEN 0 ELSE 1 END,
        t.name
    `);
    return rows.map(mapTenantRow);
  }

  /**
   * POST /api/xbos/settings/companies
   * Atomic provision: insert xbos_tenant_registry + optional xbos_legal_entity in a single CTE.
   * PostgreSQL CTE is executed as one statement — atomic at DB level without pool.connect().
   * Rollback semantics: if le_ins fails (e.g. constraint violation), tenant_ins also rolls back.
   */
  async createCompany(
    dto: CreateCompanyDto,
    issuedBy: string,
  ): Promise<{ tenantId: string }> {
    const hasLe = Boolean(
      dto.legalEntity &&
        (dto.legalEntity.code ??
          dto.legalEntity.name ??
          dto.legalEntity.taxCode ??
          dto.legalEntity.businessLines),
    );

    const result = await this.db.query<ProvisionCteRow>(
      `WITH conflict_check AS (
        SELECT 1 AS exists
        FROM public.xbos_tenant_registry
        WHERE tenant_id = $1
      ),
      tenant_ins AS (
        INSERT INTO public.xbos_tenant_registry
          (tenant_id, name, short_name, tenant_kind, default_company_id, modules, status, created_at, updated_at)
        SELECT $1, $2, $3, $4, 'main', $5::jsonb, 'provisioning', NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM conflict_check)
        RETURNING tenant_id
      ),
      le_ins AS (
        INSERT INTO public.xbos_legal_entity
          (id, tenant_id, company_id, code, name, entity_type, tax_code, business_lines, payload, status)
        SELECT
          gen_random_uuid(),
          t.tenant_id,
          'main',
          $6,
          $7,
          'company',
          $8,
          $9,
          '{}'::jsonb,
          'active'
        FROM tenant_ins t
        WHERE $10 = true
        RETURNING id
      )
      SELECT
        (SELECT tenant_id FROM tenant_ins)          AS tenant_id,
        (SELECT 1 FROM conflict_check LIMIT 1)      AS conflict`,
      [
        dto.tenantCode,
        dto.name,
        dto.shortName,
        dto.tenantKind,
        JSON.stringify(dto.modules),
        dto.legalEntity?.code ?? null,
        dto.legalEntity?.name ?? null,
        dto.legalEntity?.taxCode ?? null,
        dto.legalEntity?.businessLines ?? null,
        hasLe,
      ],
    );

    const row = result.rows[0];
    if (row?.conflict != null) {
      throw new ApiException(
        'XBOS-SETTINGS-409',
        `Tenant '${dto.tenantCode}' already exists`,
        HttpStatus.CONFLICT,
        { tenantCode: dto.tenantCode },
      );
    }
    if (!row?.tenant_id) {
      throw new ApiException(
        'XBOS-SETTINGS-500',
        'Failed to create tenant — unexpected DB state',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.audit.emit({
      actor: issuedBy,
      action: 'TENANT_PROVISION_INITIATED',
      entityType: 'tenant',
      entityId: dto.tenantCode,
      payload: {
        eventType: 'TENANT_PROVISION_INITIATED',
        tenantId: dto.tenantCode,
        tenantKind: dto.tenantKind,
        modules: dto.modules,
        status: 'provisioning',
        issuedBy,
      },
    });

    return { tenantId: dto.tenantCode };
  }

  /**
   * PUT /api/xbos/settings/companies/:tenantId/activate
   * Transitions status: provisioning -> active. Emits TENANT_PROVISIONED event.
   * Returns 400 if current status is not 'provisioning'.
   */
  async activateTenant(tenantId: string, issuedBy: string): Promise<void> {
    const updateResult = await this.db.query<{ tenant_id: string; modules: unknown }>(
      `UPDATE public.xbos_tenant_registry
          SET status = 'active', updated_at = NOW()
        WHERE tenant_id = $1 AND status = 'provisioning'
        RETURNING tenant_id, modules`,
      [tenantId],
    );

    if (updateResult.rows.length === 0) {
      const check = await this.db.query<{ status: string }>(
        `SELECT status FROM public.xbos_tenant_registry WHERE tenant_id = $1`,
        [tenantId],
      );
      if (check.rows.length === 0) {
        throw new ApiException('XBOS-SETTINGS-404', 'Tenant not found', HttpStatus.NOT_FOUND, { tenantId });
      }
      const currentStatus = check.rows[0]?.status ?? 'unknown';
      throw new ApiException(
        'XBOS-SETTINGS-400',
        `Cannot activate tenant: current status is '${currentStatus}' (expected 'provisioning')`,
        HttpStatus.BAD_REQUEST,
        { tenantId, currentStatus },
      );
    }

    const modules = toStringArray(updateResult.rows[0]?.modules) as AllowedModule[];
    const activatedAt = new Date().toISOString();

    await this.audit.emit({
      actor: issuedBy,
      tenantId,
      action: 'TENANT_PROVISIONED',
      entityType: 'tenant',
      entityId: tenantId,
      payload: {
        eventType: 'TENANT_PROVISIONED',
        tenantId,
        defaultCompanyId: 'main',
        modules,
        activatedAt,
        issuedBy,
      },
    });
  }

  /**
   * PUT /api/xbos/settings/companies/:tenantId/suspend
   * Set status = 'suspended'. Emits TENANT_SUSPENDED event.
   */
  async suspendTenant(tenantId: string, issuedBy: string): Promise<void> {
    const updateResult = await this.db.query<{ tenant_id: string }>(
      `UPDATE public.xbos_tenant_registry
          SET status = 'suspended', updated_at = NOW()
        WHERE tenant_id = $1
        RETURNING tenant_id`,
      [tenantId],
    );

    if (updateResult.rows.length === 0) {
      throw new ApiException('XBOS-SETTINGS-404', 'Tenant not found', HttpStatus.NOT_FOUND, { tenantId });
    }

    await this.audit.emit({
      actor: issuedBy,
      tenantId,
      action: 'TENANT_SUSPENDED',
      entityType: 'tenant',
      entityId: tenantId,
      payload: {
        eventType: 'TENANT_SUSPENDED',
        tenantId,
        suspendedAt: new Date().toISOString(),
        issuedBy,
      },
    });
  }

  /**
   * PATCH /api/xbos/settings/companies/:tenantId/modules
   * Update modules JSONB. Emits TENANT_MODULE_ADDED when active tenant gains new modules.
   */
  async updateModules(
    tenantId: string,
    dto: UpdateModulesDto,
    issuedBy: string,
  ): Promise<void> {
    const current = await this.db.query<TenantStatusRow>(
      `SELECT status, modules FROM public.xbos_tenant_registry WHERE tenant_id = $1`,
      [tenantId],
    );

    if (current.rows.length === 0) {
      throw new ApiException('XBOS-SETTINGS-404', 'Tenant not found', HttpStatus.NOT_FOUND, { tenantId });
    }

    const existingStatus = current.rows[0]?.status ?? '';
    const existingModules = new Set(toStringArray(current.rows[0]?.modules));
    const newModules = dto.modules;
    const addedModules = newModules.filter((m) => !existingModules.has(m));

    await this.db.query(
      `UPDATE public.xbos_tenant_registry
          SET modules = $2::jsonb, updated_at = NOW()
        WHERE tenant_id = $1`,
      [tenantId, JSON.stringify(newModules)],
    );

    if (existingStatus === 'active' && addedModules.length > 0) {
      await this.audit.emit({
        actor: issuedBy,
        tenantId,
        action: 'TENANT_MODULE_ADDED',
        entityType: 'tenant',
        entityId: tenantId,
        payload: {
          eventType: 'TENANT_MODULE_ADDED',
          tenantId,
          addedModules,
          allModules: newModules,
          updatedAt: new Date().toISOString(),
          issuedBy,
        },
      });
    }
  }
}
