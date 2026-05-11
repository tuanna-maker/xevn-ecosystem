import { Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { HttpStatus } from '@nestjs/common';
import { XbosDbService } from '../db/xbos-db.service';
import { createHash } from 'node:crypto';

export type AssignmentTarget = 'hrm' | 'xbos' | 'web-portal';

export interface ConfigCatalogItem {
  code: string;
  label: string;
  unit?: string;
  status: 'active' | 'draft';
}

export interface ConfigCatalog {
  contractVersion: 'xbos-config-v1';
  checksumAlgorithm: 'sha256:items-canonical-v1';
  tenantId: string;
  companyId: string;
  key: string;
  name: string;
  domain: string;
  assignedTo: AssignmentTarget[];
  version: number;
  checksum: string;
  updatedAt: string;
  items: ConfigCatalogItem[];
}

export interface PublishCatalogPayload {
  tenantId: string;
  companyId: string;
  name: string;
  domain: string;
  assignedTo: AssignmentTarget[];
  items: ConfigCatalogItem[];
  actor?: string;
}

@Injectable()
export class ConfigSyncService {
  constructor(private readonly db: XbosDbService) {}

  private readonly targetSet = new Set<AssignmentTarget>(['hrm', 'xbos', 'web-portal']);

  private normalizeCatalogKey(catalogKey: string): string {
    const normalized = catalogKey.trim().toLowerCase();
    if (!/^[a-z0-9_][a-z0-9_-]{1,62}$/.test(normalized)) {
      throw new ApiException(
        'XBOS-VAL-002',
        'Invalid catalog key format',
        HttpStatus.BAD_REQUEST,
      );
    }
    return normalized;
  }

  private normalizeScopeId(rawScopeId: string, label: 'tenantId' | 'companyId'): string {
    const normalized = rawScopeId.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9_-]{1,62}$/.test(normalized)) {
      throw new ApiException('XBOS-VAL-009', `Invalid ${label} format`, HttpStatus.BAD_REQUEST);
    }
    return normalized;
  }

  private deterministicChecksum(items: ConfigCatalogItem[]): string {
    const stableItems = [...items]
      .map((item) => {
        const canonical: Record<string, string> = {
          code: item.code,
          label: item.label,
          status: item.status,
        };
        // Normalize null/undefined/blank unit to avoid checksum drift.
        if (item.unit && item.unit.trim()) {
          canonical.unit = item.unit.trim();
        }
        return canonical;
      })
      .sort((a, b) => a.code.localeCompare(b.code));
    const digest = createHash('sha256').update(JSON.stringify(stableItems)).digest('hex');
    return `sha256:${digest}`;
  }

  private validatePayload(payload: PublishCatalogPayload): PublishCatalogPayload {
    if (!payload.tenantId?.trim() || !payload.companyId?.trim()) {
      throw new ApiException(
        'XBOS-VAL-010',
        'tenantId and companyId are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!payload.name?.trim() || !payload.domain?.trim()) {
      throw new ApiException(
        'XBOS-VAL-003',
        'Catalog name and domain are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!Array.isArray(payload.assignedTo) || payload.assignedTo.length === 0) {
      throw new ApiException(
        'XBOS-VAL-004',
        'assignedTo must include at least one target',
        HttpStatus.BAD_REQUEST,
      );
    }
    const uniqueTargets = [...new Set(payload.assignedTo)];
    if (uniqueTargets.some((target) => !this.targetSet.has(target))) {
      throw new ApiException(
        'XBOS-VAL-001',
        'Invalid target. Use hrm, xbos, or web-portal',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new ApiException(
        'XBOS-VAL-005',
        'Catalog must include at least one item',
        HttpStatus.BAD_REQUEST,
      );
    }

    const seenCodes = new Set<string>();
    const normalizedItems = payload.items.map((item, index) => {
      const code = item.code?.trim();
      const label = item.label?.trim();
      const status = item.status;
      if (!code || !label) {
        throw new ApiException(
          'XBOS-VAL-006',
          `Invalid item at index ${index}: code and label are required`,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (seenCodes.has(code)) {
        throw new ApiException(
          'XBOS-VAL-007',
          `Duplicate item code '${code}'`,
          HttpStatus.BAD_REQUEST,
        );
      }
      seenCodes.add(code);
      if (status !== 'active' && status !== 'draft') {
        throw new ApiException(
          'XBOS-VAL-008',
          `Invalid status for item '${code}'. Use active or draft`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return {
        code,
        label,
        unit: item.unit?.trim() || undefined,
        status,
      };
    });

    return {
      ...payload,
      tenantId: this.normalizeScopeId(payload.tenantId, 'tenantId'),
      companyId: this.normalizeScopeId(payload.companyId, 'companyId'),
      name: payload.name.trim(),
      domain: payload.domain.trim(),
      assignedTo: uniqueTargets,
      items: normalizedItems.sort((a, b) => a.code.localeCompare(b.code)),
      actor: payload.actor?.trim() || 'system',
    };
  }

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.config_catalogs (
        id BIGSERIAL PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'xevn',
        company_id TEXT NOT NULL DEFAULT 'holding',
        catalog_key TEXT NOT NULL,
        name TEXT NOT NULL,
        domain TEXT NOT NULL,
        assigned_systems JSONB NOT NULL DEFAULT '[]'::jsonb,
        version INT NOT NULL DEFAULT 1,
        checksum TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`ALTER TABLE public.config_catalogs ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'xevn';`);
    await this.db.query(`ALTER TABLE public.config_catalogs ADD COLUMN IF NOT EXISTS company_id TEXT NOT NULL DEFAULT 'holding';`);
    await this.dropLegacyCatalogScopeConstraints();
    await this.normalizeCatalogScopeData();
    await this.repairCatalogDuplicatesInScope();
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_config_catalogs_scope_key
      ON public.config_catalogs (tenant_id, company_id, catalog_key);
    `);
    await this.db.query(`ALTER TABLE public.config_catalogs ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;`);
    await this.db.query(`ALTER TABLE public.config_catalogs ADD COLUMN IF NOT EXISTS checksum TEXT NOT NULL DEFAULT '';`);
    await this.db.query(`CREATE INDEX IF NOT EXISTS idx_config_catalogs_assigned_systems ON public.config_catalogs USING GIN (assigned_systems);`);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.config_catalog_items (
        id BIGSERIAL PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'xevn',
        company_id TEXT NOT NULL DEFAULT 'holding',
        catalog_key TEXT NOT NULL,
        code TEXT NOT NULL,
        label TEXT NOT NULL,
        unit TEXT NULL,
        status TEXT NOT NULL DEFAULT 'active'
      );
    `);
    await this.db.query(`ALTER TABLE public.config_catalog_items ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'xevn';`);
    await this.db.query(`ALTER TABLE public.config_catalog_items ADD COLUMN IF NOT EXISTS company_id TEXT NOT NULL DEFAULT 'holding';`);
    await this.dropLegacyCatalogItemScopeConstraints();
    await this.normalizeCatalogItemsScopeData();
    await this.repairCatalogItemDuplicatesInScope();
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_config_catalog_items_scope_key_code
      ON public.config_catalog_items (tenant_id, company_id, catalog_key, code);
    `);
    await this.ensureScopedCatalogItemForeignKey();
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.catalog_audit_logs (
        id BIGSERIAL PRIMARY KEY,
        catalog_key TEXT NOT NULL,
        action TEXT NOT NULL,
        actor TEXT NOT NULL DEFAULT 'system',
        before_payload JSONB NULL,
        after_payload JSONB NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`CREATE INDEX IF NOT EXISTS idx_catalog_audit_logs_catalog_key ON public.catalog_audit_logs (catalog_key, created_at DESC);`);
  }

  private async dropLegacyCatalogScopeConstraints() {
    await this.db.query(`ALTER TABLE public.config_catalog_items DROP CONSTRAINT IF EXISTS config_catalog_items_catalog_key_fkey;`);
    await this.db.query(`
      DO $$
      DECLARE rec RECORD;
      BEGIN
        FOR rec IN
          SELECT tc.constraint_name
          FROM information_schema.table_constraints tc
          JOIN (
            SELECT kcu.constraint_name, array_agg(kcu.column_name::text ORDER BY kcu.ordinal_position) AS columns
            FROM information_schema.key_column_usage kcu
            WHERE kcu.table_schema = 'public' AND kcu.table_name = 'config_catalogs'
            GROUP BY kcu.constraint_name
          ) cols ON cols.constraint_name = tc.constraint_name
          WHERE tc.table_schema = 'public'
            AND tc.table_name = 'config_catalogs'
            AND tc.constraint_type = 'UNIQUE'
            AND cols.columns = ARRAY['catalog_key']::text[]
        LOOP
          EXECUTE format('ALTER TABLE public.config_catalogs DROP CONSTRAINT IF EXISTS %I', rec.constraint_name);
        END LOOP;
      END
      $$;
    `);
    await this.db.query(`DROP INDEX IF EXISTS public.config_catalogs_catalog_key_key;`);
  }

  private async dropLegacyCatalogItemScopeConstraints() {
    await this.db.query(`
      DO $$
      DECLARE rec RECORD;
      BEGIN
        FOR rec IN
          SELECT tc.constraint_name
          FROM information_schema.table_constraints tc
          JOIN (
            SELECT kcu.constraint_name, array_agg(kcu.column_name::text ORDER BY kcu.ordinal_position) AS columns
            FROM information_schema.key_column_usage kcu
            WHERE kcu.table_schema = 'public' AND kcu.table_name = 'config_catalog_items'
            GROUP BY kcu.constraint_name
          ) cols ON cols.constraint_name = tc.constraint_name
          WHERE tc.table_schema = 'public'
            AND tc.table_name = 'config_catalog_items'
            AND tc.constraint_type = 'UNIQUE'
            AND cols.columns = ARRAY['catalog_key', 'code']::text[]
        LOOP
          EXECUTE format('ALTER TABLE public.config_catalog_items DROP CONSTRAINT IF EXISTS %I', rec.constraint_name);
        END LOOP;
      END
      $$;
    `);
    await this.db.query(`DROP INDEX IF EXISTS public.config_catalog_items_catalog_key_code_key;`);
  }

  private async ensureScopedCatalogItemForeignKey() {
    await this.db.query(`
      ALTER TABLE public.config_catalog_items
      ADD CONSTRAINT fk_config_catalog_items_scope_catalog
      FOREIGN KEY (tenant_id, company_id, catalog_key)
      REFERENCES public.config_catalogs(tenant_id, company_id, catalog_key)
      ON DELETE CASCADE;
    `).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.toLowerCase().includes('already exists')) {
        throw error;
      }
    });
  }

  private async normalizeCatalogScopeData() {
    await this.db.query(`
      UPDATE public.config_catalogs
      SET
        tenant_id = LOWER(BTRIM(COALESCE(NULLIF(tenant_id, ''), 'xevn'))),
        company_id = LOWER(BTRIM(COALESCE(NULLIF(company_id, ''), 'holding'))),
        catalog_key = LOWER(BTRIM(catalog_key)),
        assigned_systems = COALESCE(assigned_systems, '[]'::jsonb)
      WHERE TRUE;
    `);
  }

  private async normalizeCatalogItemsScopeData() {
    await this.db.query(`
      UPDATE public.config_catalog_items
      SET
        tenant_id = LOWER(BTRIM(COALESCE(NULLIF(tenant_id, ''), 'xevn'))),
        company_id = LOWER(BTRIM(COALESCE(NULLIF(company_id, ''), 'holding'))),
        catalog_key = LOWER(BTRIM(catalog_key)),
        code = BTRIM(code),
        label = BTRIM(label)
      WHERE TRUE;
    `);
  }

  private async repairCatalogDuplicatesInScope() {
    await this.db.query(`
      WITH ranked AS (
        SELECT
          id,
          ROW_NUMBER() OVER (
            PARTITION BY tenant_id, company_id, catalog_key
            ORDER BY version DESC, updated_at DESC, id DESC
          ) AS rn
        FROM public.config_catalogs
      )
      DELETE FROM public.config_catalogs c
      USING ranked r
      WHERE c.id = r.id AND r.rn > 1;
    `);
  }

  private async repairCatalogItemDuplicatesInScope() {
    await this.db.query(`
      WITH ranked AS (
        SELECT
          id,
          ROW_NUMBER() OVER (
            PARTITION BY tenant_id, company_id, catalog_key, code
            ORDER BY id DESC
          ) AS rn
        FROM public.config_catalog_items
      )
      DELETE FROM public.config_catalog_items i
      USING ranked r
      WHERE i.id = r.id AND r.rn > 1;
    `);
  }

  async bootstrapXevnGroupConfig() {
    await this.ensureSchema();
    const now = new Date().toISOString();
    const records: Array<Omit<ConfigCatalog, 'contractVersion' | 'checksumAlgorithm'>> = [
      {
        tenantId: 'xevn',
        companyId: 'holding',
        key: 'job_titles',
        name: 'Danh muc chuc danh tap doan XeVN',
        domain: 'human_resources',
        assignedTo: ['hrm', 'xbos'],
        version: 1,
        checksum: '',
        updatedAt: now,
        items: [
          { code: 'CEO', label: 'Tong giam doc', status: 'active' },
          { code: 'CHRO', label: 'Giam doc Nhan su', status: 'active' },
          { code: 'OPS_MANAGER', label: 'Quan ly Van hanh Vung', status: 'active' },
          { code: 'WAREHOUSE_SUP', label: 'Giam sat Kho Tong', status: 'active' },
          { code: 'DRIVER_LEAD', label: 'Truong nhom Tai xe', status: 'active' },
        ],
      },
      {
        tenantId: 'xevn',
        companyId: 'holding',
        key: 'cost_centers',
        name: 'Danh muc trung tam chi phi XeVN',
        domain: 'finance_control',
        assignedTo: ['hrm', 'xbos', 'web-portal'],
        version: 1,
        checksum: '',
        updatedAt: now,
        items: [
          { code: 'CC-HN-OPS', label: 'Van hanh Ha Noi', status: 'active' },
          { code: 'CC-HCM-OPS', label: 'Van hanh TP HCM', status: 'active' },
          { code: 'CC-DN-WHS', label: 'Kho trung chuyen Da Nang', status: 'active' },
          { code: 'CC-TECH-PLT', label: 'Nen tang Cong nghe', status: 'active' },
        ],
      },
      {
        tenantId: 'xevn',
        companyId: 'holding',
        key: 'kpi_library',
        name: 'Thu vien KPI van hanh va nhan su',
        domain: 'performance_management',
        assignedTo: ['xbos', 'hrm'],
        version: 1,
        checksum: '',
        updatedAt: now,
        items: [
          { code: 'KPI_OTIF', label: 'Ty le giao dung han OTIF', unit: '%', status: 'active' },
          { code: 'KPI_ABSENCE', label: 'Ty le vang mat dot xuat', unit: '%', status: 'active' },
          { code: 'KPI_LABOR_COST', label: 'Chi phi nhan cong tren don', unit: 'VND/order', status: 'active' },
        ],
      },
    ];
    for (const catalog of records) {
      await this.publishCatalog(catalog.key, {
        tenantId: catalog.tenantId,
        companyId: catalog.companyId,
        name: catalog.name,
        domain: catalog.domain,
        assignedTo: catalog.assignedTo,
        items: catalog.items,
        actor: 'system',
      });
    }
    return {
      success: true,
      seeded_catalogs: records.length,
      catalog_keys: records.map((item) => item.key),
      generated_at: now,
    };
  }

  async getCatalogForTarget(catalogKey: string, target: AssignmentTarget, tenantId: string, companyId: string) {
    await this.ensureSchema();
    const normalizedCatalogKey = this.normalizeCatalogKey(catalogKey);
    const normalizedTenantId = this.normalizeScopeId(tenantId, 'tenantId');
    const normalizedCompanyId = this.normalizeScopeId(companyId, 'companyId');
    const foundRes = await this.db.query<{
      catalog_key: string;
      name: string;
      domain: string;
      assigned_systems: AssignmentTarget[];
      version: number;
      checksum: string;
      updated_at: string;
    }>(
      `
      SELECT catalog_key, name, domain, assigned_systems, version, checksum, updated_at
      FROM public.config_catalogs
      WHERE catalog_key = $1 AND tenant_id = $2 AND company_id = $3
    `,
      [normalizedCatalogKey, normalizedTenantId, normalizedCompanyId],
    );
    const found = foundRes.rows[0];
    if (!found) {
      throw new ApiException('XBOS-CFG-001', `Catalog '${normalizedCatalogKey}' not found`, HttpStatus.NOT_FOUND);
    }
    if (!found.assigned_systems.includes(target)) {
      throw new ApiException(
        'XBOS-CFG-002',
        `Catalog '${normalizedCatalogKey}' is not assigned to ${target}`,
        HttpStatus.FORBIDDEN,
      );
    }
    const itemsRes = await this.db.query<ConfigCatalogItem>(
      `
      SELECT code, label, unit, status
      FROM public.config_catalog_items
      WHERE catalog_key = $1 AND tenant_id = $2 AND company_id = $3
      ORDER BY code
    `,
      [normalizedCatalogKey, normalizedTenantId, normalizedCompanyId],
    );
    const computedChecksum = this.deterministicChecksum(itemsRes.rows);
    if (found.checksum !== computedChecksum) {
      throw new ApiException(
        'XBOS-CFG-004',
        `Checksum mismatch detected for catalog '${normalizedCatalogKey}'`,
        HttpStatus.CONFLICT,
      );
    }
    return {
      contractVersion: 'xbos-config-v1',
      checksumAlgorithm: 'sha256:items-canonical-v1',
      tenantId: normalizedTenantId,
      companyId: normalizedCompanyId,
      key: found.catalog_key,
      name: found.name,
      domain: found.domain,
      assignedTo: found.assigned_systems,
      version: found.version,
      checksum: found.checksum,
      updatedAt: found.updated_at,
      items: itemsRes.rows,
    } as ConfigCatalog;
  }

  async listCatalogsForTarget(target: AssignmentTarget, tenantId: string, companyId: string) {
    await this.ensureSchema();
    if (!this.targetSet.has(target)) {
      throw new ApiException(
        'XBOS-VAL-001',
        'Invalid target. Use hrm, xbos, or web-portal',
        HttpStatus.BAD_REQUEST,
      );
    }
    const normalizedTenantId = this.normalizeScopeId(tenantId, 'tenantId');
    const normalizedCompanyId = this.normalizeScopeId(companyId, 'companyId');
    const catalogRows = await this.db.query<{
      tenant_id: string;
      company_id: string;
      catalog_key: string;
      name: string;
      domain: string;
      assigned_systems: AssignmentTarget[];
      version: number;
      checksum: string;
      updated_at: string;
      items: ConfigCatalogItem[];
    }>(
      `
      SELECT
        c.catalog_key,
        c.tenant_id,
        c.company_id,
        c.name,
        c.domain,
        c.assigned_systems,
        c.version,
        c.checksum,
        c.updated_at,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'code', i.code,
              'label', i.label,
              'unit', i.unit,
              'status', i.status
            )
            ORDER BY i.code
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'::jsonb
        ) AS items
      FROM public.config_catalogs c
      LEFT JOIN public.config_catalog_items i
        ON i.catalog_key = c.catalog_key
       AND i.tenant_id = c.tenant_id
       AND i.company_id = c.company_id
      WHERE assigned_systems @> $1::jsonb AND c.tenant_id = $2 AND c.company_id = $3
      GROUP BY c.catalog_key, c.tenant_id, c.company_id, c.name, c.domain, c.assigned_systems, c.version, c.checksum, c.updated_at
      ORDER BY c.catalog_key
    `,
      [JSON.stringify([target]), normalizedTenantId, normalizedCompanyId],
    );
    const catalogs: ConfigCatalog[] = [];
    for (const row of catalogRows.rows) {
      const computedChecksum = this.deterministicChecksum(row.items);
      if (row.checksum !== computedChecksum) {
        throw new ApiException(
          'XBOS-CFG-004',
          `Checksum mismatch detected for catalog '${row.catalog_key}'`,
          HttpStatus.CONFLICT,
        );
      }
      catalogs.push({
        contractVersion: 'xbos-config-v1',
        checksumAlgorithm: 'sha256:items-canonical-v1',
        tenantId: row.tenant_id,
        companyId: row.company_id,
        key: row.catalog_key,
        name: row.name,
        domain: row.domain,
        assignedTo: row.assigned_systems,
        version: row.version,
        checksum: row.checksum,
        updatedAt: row.updated_at,
        items: row.items,
      });
    }
    return { total: catalogs.length, target, tenantId: normalizedTenantId, companyId: normalizedCompanyId, data: catalogs };
  }

  async publishCatalog(catalogKey: string, payload: PublishCatalogPayload) {
    await this.ensureSchema();
    const normalizedCatalogKey = this.normalizeCatalogKey(catalogKey);
    const validated = this.validatePayload(payload);
    const checksum = this.deterministicChecksum(validated.items);

    const existingRes = await this.db.query<{ version: number; checksum: string }>(
      `
      SELECT version, checksum
      FROM public.config_catalogs
      WHERE catalog_key = $1 AND tenant_id = $2 AND company_id = $3
    `,
      [normalizedCatalogKey, validated.tenantId, validated.companyId],
    );
    const existing = existingRes.rows[0];
    const nextVersion = !existing ? 1 : existing.checksum === checksum ? existing.version : existing.version + 1;

    await this.db.query(
      `
      INSERT INTO public.config_catalogs (tenant_id, company_id, catalog_key, name, domain, assigned_systems, version, checksum, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, NOW())
      ON CONFLICT (tenant_id, company_id, catalog_key)
      DO UPDATE SET
        name = EXCLUDED.name,
        domain = EXCLUDED.domain,
        assigned_systems = EXCLUDED.assigned_systems,
        version = EXCLUDED.version,
        checksum = EXCLUDED.checksum,
        updated_at = NOW()
    `,
      [
        validated.tenantId,
        validated.companyId,
        normalizedCatalogKey,
        validated.name,
        validated.domain,
        JSON.stringify(validated.assignedTo),
        nextVersion,
        checksum,
      ],
    );

    await this.db.query(
      `DELETE FROM public.config_catalog_items WHERE catalog_key = $1 AND tenant_id = $2 AND company_id = $3`,
      [normalizedCatalogKey, validated.tenantId, validated.companyId],
    );
    for (const item of validated.items) {
      await this.db.query(
        `
        INSERT INTO public.config_catalog_items (tenant_id, company_id, catalog_key, code, label, unit, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (tenant_id, company_id, catalog_key, code)
        DO UPDATE SET
          label = EXCLUDED.label,
          unit = EXCLUDED.unit,
          status = EXCLUDED.status
      `,
        [
          validated.tenantId,
          validated.companyId,
          normalizedCatalogKey,
          item.code,
          item.label,
          item.unit ?? null,
          item.status,
        ],
      );
    }

    const persisted = {
      tenantId: validated.tenantId,
      companyId: validated.companyId,
      key: normalizedCatalogKey,
      name: validated.name,
      domain: validated.domain,
      assignedTo: validated.assignedTo,
      version: nextVersion,
      checksum,
      items: validated.items,
    };
    await this.db.query(
      `
      INSERT INTO public.catalog_audit_logs (catalog_key, action, actor, after_payload)
      VALUES ($1, 'publish_upsert', $2, $3::jsonb)
    `,
      [normalizedCatalogKey, validated.actor ?? 'system', JSON.stringify(persisted)],
    );

    return this.getCatalogForTarget(normalizedCatalogKey, 'xbos', validated.tenantId, validated.companyId);
  }
}
