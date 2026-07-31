/**
 * @CODE-MEMORY
 * Screen:     XBOS Config Sync — publish / áp dụng danh mục ĐVTV (admin tập đoàn)
 * UC:         XBOS-DM-HRM-07 · XBOS-DM-HRM-09 · UC-XBOS-02/05
 * BR:         Partition `(tenant_id, company_id, catalog_key)` — không rollup đọc chung
 * SRS:        docs/hrm/DANH_MUC_XBOS_CHO_HRM.md §14 XBOS-DM-HRM-07 · FR-HRM-SC-01 consumer
 * TechSpec:   docs/hrm/TECHSPEC.md §17.6 dual catalog · BM-06 Option B fan-out
 * Purpose:    Phát hành danh mục theo một partition; áp dụng (fan-out) sang ĐVTV đã chọn
 *             để HRM pull đúng snapshot member — không dùng seed làm nghiệm thu.
 * WorkItem:   BM-BE-CFG-APPLY-MEMBERS-01
 * Coded:      2026-07-22
 *
 * Callers:
 *   - config-sync.controller → publishCatalog / applyCatalogToMembers
 *   - catalog-governance.controller → publishCatalogVersion (delegate)
 *
 * Callees:
 *   - publishCatalog → config_catalogs + config_catalog_items + catalog_audit_logs
 *   - applyCatalogToMembers → getCatalogForTarget(source) → publishCatalog(each target)
 *
 * BE-Chain:
 *   POST …/publish → upsert one scope
 *   POST …/apply-to-members → copy items to N member scopes (allow-list keys)
 *
 * Impact:     Fan-out sai key/scope → member HRM sync nhầm hoặc đè catalog ngoài TD
 * must_keep:  Single-company publish path · Leave/Catalog WF bridges · U65 no seed
 * SOLID:      Apply tái sử dụng publishCatalog — không nhân bản SQL upsert
 * LastVerified: config-sync.service.spec.ts · bm-be-cfg-apply-members-01-20260722.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: BM-BE-CFG-APPLY-MEMBERS-01
 * change_mode: ADD
 * What: Thêm applyCatalogToMembers (Option B) cho allow-list recruitment keys
 * Why:  Đóng G-BM-REC-01 / G-BM-03 — thiếu fan-out holding → member companyIds
 * SRS:  DANH_MUC §14 XBOS-DM-HRM-07 · BM-06
 * TechSpec: SA bm-sa-xbos-hrm-rec-trace-01 §5 Option B
 * must_keep: publishCatalog single-scope; bridges leave/rec untouched
 *
 * @CODE-MEMORY-CHANGE 2026-07-29
 * WorkItem: D-BE-XBOS-CTRL-G1-ALLOWLIST-01
 * change_mode: ADD
 * What: Mở rộng APPLY_TO_MEMBERS_CATALOG_ALLOWLIST P0+P1; alias path→canonical;
 *       DEC try-list nguồn (hr_decision_types|decision_types); write key = L0 nguồn (SA-DEC-WRITE-01)
 * Why:  Sponsor chốt P0+P1 — unlock departments/leave_types + E1-B parity keys fan-out
 * SRS:  docs/program/deltas/BA_ERP_XBOS_CTRL_SPEC_01_20260728.md §2.1–2.4 · FR-XBOS-CTRL-01
 * TechSpec: docs/xbos/TECHSPEC_XBOS_APPLY_TO_MEMBERS_EXPAND.md §2.1–2.2
 * API:  docs/xbos/API_DESIGN_XBOS_APPLY_TO_MEMBERS_EXPAND.md §1
 * must_keep: publishCatalog reuse · no new tables/URLs · U65 no seed · P2 HOLD
 * LastVerified: config-sync.service.spec.ts · d-be-xbos-ctrl-g1-allowlist-01-20260729.md
 */
import { Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { HttpStatus } from '@nestjs/common';
import { XbosDbService } from '../db/xbos-db.service';
import { PlatformAuditService } from '../platform/platform-audit.service';
import { assertMasterGroupBootstrapScope } from '../platform/tenant-bootstrap.policy';
import { createHash } from 'node:crypto';

export type AssignmentTarget = 'hrm' | 'xbos' | 'web-portal';

/**
 * Allow-list for apply-to-members (G-BM-REC-01 / DM-07 / E-XBOS-CTRL-G1).
 * P0 = Settings spine; P1 = E1-B parity (sponsor unlocked 2026-07-29).
 * P2 HOLD: salary_components, insurers, insurance_types, kpi_library, …
 */
export const APPLY_TO_MEMBERS_CATALOG_ALLOWLIST = [
  // P0
  'job_titles',
  'recruitment_channels',
  'job_grades',
  'departments',
  'leave_types',
  // P1
  'contract_types',
  'employment_types',
  'pay_types',
  'shifts',
  'decision_types',
] as const;

export type ApplyToMembersCatalogKey = (typeof APPLY_TO_MEMBERS_CATALOG_ALLOWLIST)[number];

/**
 * Path aliases → canonical allow-list key (BA §2.4 / DB_DESIGN expand §3.2).
 * Allow-list check uses canonical; storage write key may differ for DEC (SA-DEC-WRITE-01).
 */
export const APPLY_TO_MEMBERS_CATALOG_ALIASES: Readonly<Record<string, ApplyToMembersCatalogKey>> = {
  positions: 'job_titles',
  employee_positions: 'job_titles',
  candidate_sources: 'recruitment_channels',
  grades: 'job_grades',
  department_catalog: 'departments',
  org_departments: 'departments',
  employment_type: 'employment_types',
  component_types: 'pay_types',
  pay_natures: 'pay_types',
  hr_decision_types: 'decision_types',
  work_shifts: 'shifts',
};

/** Source L0 storage keys to probe (prefer path order) — DEC dual-key live. */
const APPLY_SOURCE_STORAGE_TRY_LIST: Readonly<
  Partial<Record<ApplyToMembersCatalogKey, readonly string[]>>
> = {
  decision_types: ['decision_types', 'hr_decision_types'],
};

export function resolveApplyToMembersCanonicalKey(normalizedKey: string): string {
  return APPLY_TO_MEMBERS_CATALOG_ALIASES[normalizedKey] ?? normalizedKey;
}

export type ApplyCatalogMemberTarget = {
  tenantId: string;
  companyId: string;
};

export type ApplyCatalogToMembersPayload = {
  tenantId: string;
  companyId: string;
  targets?: ApplyCatalogMemberTarget[];
  memberCompanyIds?: string[];
  actor?: string;
};

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
  constructor(
    private readonly db: XbosDbService,
    private readonly platformAudit: PlatformAuditService,
  ) {}

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
      assertMasterGroupBootstrapScope({
        tenantId: catalog.tenantId,
        companyId: catalog.companyId,
      });
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

    await this.platformAudit.emit({
      actor: validated.actor ?? 'system',
      tenantId: validated.tenantId,
      companyId: validated.companyId,
      action: 'config_catalog.publish',
      entityType: 'config_catalog',
      entityId: normalizedCatalogKey,
      payload: {
        version: nextVersion,
        checksum,
        itemCount: validated.items.length,
        domain: validated.domain,
      },
    });

    return this.getCatalogForTarget(normalizedCatalogKey, 'xbos', validated.tenantId, validated.companyId);
  }

  /**
   * XBOS-DM-HRM-07 / G-BM-REC-01 — Option B: copy source catalog snapshot to selected member partitions.
   * Reuses publishCatalog so version/checksum/audit semantics stay identical to single-company publish.
   * E-XBOS-CTRL-G1: P0+P1 allow-list + path alias → canonical; DEC write key = source L0 header.
   */
  async applyCatalogToMembers(catalogKey: string, payload: ApplyCatalogToMembersPayload) {
    await this.ensureSchema();
    const normalizedCatalogKey = this.normalizeCatalogKey(catalogKey);
    const canonicalCatalogKey = resolveApplyToMembersCanonicalKey(normalizedCatalogKey);
    if (
      !APPLY_TO_MEMBERS_CATALOG_ALLOWLIST.includes(
        canonicalCatalogKey as ApplyToMembersCatalogKey,
      )
    ) {
      throw new ApiException(
        'XBOS-CFG-005',
        `Catalog '${normalizedCatalogKey}' is not allowed for apply-to-members. Allowed: ${APPLY_TO_MEMBERS_CATALOG_ALLOWLIST.join(', ')}`,
        HttpStatus.BAD_REQUEST,
        {
          catalogKey: normalizedCatalogKey,
          canonicalCatalogKey,
          allowed: [...APPLY_TO_MEMBERS_CATALOG_ALLOWLIST],
        },
      );
    }

    const sourceTenantId = this.normalizeScopeId(payload.tenantId, 'tenantId');
    const sourceCompanyId = this.normalizeScopeId(payload.companyId, 'companyId');
    const targets = this.normalizeApplyTargets(payload, sourceTenantId, sourceCompanyId);

    const storageTryList = this.resolveApplySourceStorageTryList(
      canonicalCatalogKey as ApplyToMembersCatalogKey,
      normalizedCatalogKey,
    );
    const { source, writeKey } = await this.loadApplySourceCatalog(
      storageTryList,
      sourceTenantId,
      sourceCompanyId,
    );

    const actor = payload.actor?.trim() || 'system';
    const applied: Array<{
      tenantId: string;
      companyId: string;
      version: number;
      checksum: string;
    }> = [];

    for (const target of targets) {
      const published = await this.publishCatalog(writeKey, {
        tenantId: target.tenantId,
        companyId: target.companyId,
        name: source.name,
        domain: source.domain,
        assignedTo: source.assignedTo,
        items: source.items,
        actor,
      });
      applied.push({
        tenantId: published.tenantId,
        companyId: published.companyId,
        version: published.version,
        checksum: published.checksum,
      });
    }

    const summary = {
      catalogKey: canonicalCatalogKey,
      writeKey,
      source: {
        tenantId: source.tenantId,
        companyId: source.companyId,
        version: source.version,
        checksum: source.checksum,
        itemCount: source.items.length,
        catalogKey: source.key,
      },
      applied,
      appliedCount: applied.length,
    };

    await this.db.query(
      `
      INSERT INTO public.catalog_audit_logs (catalog_key, action, actor, after_payload)
      VALUES ($1, 'apply_to_members', $2, $3::jsonb)
    `,
      [writeKey, actor, JSON.stringify(summary)],
    );

    await this.platformAudit.emit({
      actor,
      tenantId: sourceTenantId,
      companyId: sourceCompanyId,
      action: 'config_catalog.apply_to_members',
      entityType: 'config_catalog',
      entityId: writeKey,
      payload: {
        appliedCount: applied.length,
        canonicalCatalogKey,
        writeKey,
        targets: applied.map((row) => `${row.tenantId}/${row.companyId}`),
      },
    });

    return summary;
  }

  /** Prefer path storage key first when it is an alias sibling (e.g. hr_decision_types). */
  private resolveApplySourceStorageTryList(
    canonical: ApplyToMembersCatalogKey,
    pathNormalized: string,
  ): string[] {
    const family = APPLY_SOURCE_STORAGE_TRY_LIST[canonical];
    if (!family || family.length === 0) {
      return [canonical];
    }
    const ordered = [pathNormalized, ...family.filter((k) => k !== pathNormalized)];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const key of ordered) {
      if (!seen.has(key)) {
        seen.add(key);
        out.push(key);
      }
    }
    return out;
  }

  private async loadApplySourceCatalog(
    storageTryList: string[],
    sourceTenantId: string,
    sourceCompanyId: string,
  ): Promise<{ source: ConfigCatalog; writeKey: string }> {
    let lastMissing: ApiException | undefined;
    for (const storageKey of storageTryList) {
      try {
        // Prefer hrm assignment for HRM pull consumers; fall back to xbos if source is xbos-only.
        try {
          const source = await this.getCatalogForTarget(
            storageKey,
            'hrm',
            sourceTenantId,
            sourceCompanyId,
          );
          return { source, writeKey: source.key };
        } catch (err) {
          if (err instanceof ApiException && err.code === 'XBOS-CFG-002') {
            const source = await this.getCatalogForTarget(
              storageKey,
              'xbos',
              sourceTenantId,
              sourceCompanyId,
            );
            return { source, writeKey: source.key };
          }
          throw err;
        }
      } catch (err) {
        if (err instanceof ApiException && err.code === 'XBOS-CFG-001') {
          lastMissing = err;
          continue;
        }
        throw err;
      }
    }
    throw (
      lastMissing ??
      new ApiException(
        'XBOS-CFG-001',
        `Catalog '${storageTryList[0] ?? 'unknown'}' not found`,
        HttpStatus.NOT_FOUND,
      )
    );
  }

  private normalizeApplyTargets(
    payload: ApplyCatalogToMembersPayload,
    sourceTenantId: string,
    sourceCompanyId: string,
  ): ApplyCatalogMemberTarget[] {
    const raw: ApplyCatalogMemberTarget[] = [];
    if (Array.isArray(payload.targets)) {
      for (const target of payload.targets) {
        raw.push({
          tenantId: this.normalizeScopeId(target.tenantId, 'tenantId'),
          companyId: this.normalizeScopeId(target.companyId, 'companyId'),
        });
      }
    }
    if (Array.isArray(payload.memberCompanyIds)) {
      for (const companyId of payload.memberCompanyIds) {
        raw.push({
          tenantId: sourceTenantId,
          companyId: this.normalizeScopeId(companyId, 'companyId'),
        });
      }
    }
    if (raw.length === 0) {
      throw new ApiException(
        'XBOS-VAL-011',
        'Apply-to-members requires targets[] and/or memberCompanyIds[]',
        HttpStatus.BAD_REQUEST,
      );
    }

    const seen = new Set<string>();
    const unique: ApplyCatalogMemberTarget[] = [];
    for (const target of raw) {
      const key = `${target.tenantId}::${target.companyId}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      if (target.tenantId === sourceTenantId && target.companyId === sourceCompanyId) {
        throw new ApiException(
          'XBOS-VAL-012',
          'Apply-to-members target must differ from source scope',
          HttpStatus.BAD_REQUEST,
          { sourceTenantId, sourceCompanyId, target },
        );
      }
      unique.push(target);
    }
    return unique;
  }
}
