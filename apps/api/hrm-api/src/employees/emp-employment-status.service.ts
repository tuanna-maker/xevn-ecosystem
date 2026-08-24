/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ → Catalog trạng thái NV (`/employees/employment-statuses`)
 * UC:         AC-PLT-EMP-STATUS-01* · BR-PLT-02/04/05/06 · L-EMP-ST-01..14
 * BR:         Open catalog · dual SoT REF+EMP · soft-delete · U19 scope_parity · invent KEY
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md §3–§5
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md §5–§6 F-EMP-CAT-ST/EFF
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md §2
 * API_DESIGN: F-EMP-CAT-ST-01..04 · F-EMP-CAT-ST-EFF-01 · F-EMP-ST-CNS-01
 * Purpose:    ensureSchema emp_employment_status + CRUD/retire + effective union (EMP wins) + consumer assert.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01
 * Coded:      2026-08-08
 * Callers:    employees.controller · employees.service create/update status assert
 * Callees:    HrmDbService · resolveHrmListScope · SettingsCatalogsService (group REF read)
 * FEActions:  Settings Tạo trạng thái NV → list F5 → form NV chọn mã mới / invent → KEY
 * BEChain:    ensureSchema → scope filter → soft archive · effective merge no persist · DROP chk_employees_status elsewhere
 * Impact:     Closed CHECK restore = phá BR-PLT-05; write Settings REF = phá L-EMP-ST-03; invent soft when EFF>0 = phá BR-PLT-02
 * must_keep:  DOC/ET Nest seals · EMP-CUSTOM CNS L1 · MergeToken EXT · ATT/SI/CTR · U65 empty [] OK ·
 *             FORBIDDEN hard-delete / CHECK status_key IN (…) / fold into ET/custom
 * SOLID:      Catalog CRUD tách TXN employees · orthogonal to DOC/ET
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-be-01.md
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandHrmTextCompanyIds,
  normalizePayrollListCompanyId,
  pushCompanyIdTextColumnFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  resolveHrmSettingsCatalogCompanyId,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbService } from '../db/hrm-db.service';
import {
  EMP_EMPLOYMENT_STATUS_CATALOG_KIND,
  EMP_EMPLOYMENT_STATUS_GROUP_REF_KEYS,
  EMP_EMPLOYMENT_STATUS_KEY_FORMAT,
  EMP_EMPLOYMENT_STATUS_STATUSES,
  HRM_EMP_STATUS_KEY,
  HRM_EMP_ST_404,
  HRM_PLT_CAT_CODE_CONFLICT,
  HRM_PLT_CAT_CODE_INVALID,
  type EmpEmploymentStatusRowStatus,
  type EmpEmploymentStatusSource,
} from './emp-employment-status.constants';
import type {
  ListEffectiveEmpEmploymentStatusesQueryDto,
  ListEmpEmploymentStatusesQueryDto,
  PatchEmpEmploymentStatusDto,
  UpsertEmpEmploymentStatusDto,
} from './dto/emp-employment-status.dto';

type EmpEmploymentStatusRow = {
  id: string;
  company_id: string;
  status_key: string;
  name_vi: string;
  sort_order: number;
  is_workforce_active: boolean;
  is_terminal: boolean;
  requires_reason: boolean;
  counts_toward_headcount: boolean;
  legacy_alias_keys_json: unknown;
  metadata_json: Record<string, unknown> | string | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EmpEmploymentStatusDisplay = {
  id: string;
  companyId: string;
  statusKey: string;
  nameVi: string;
  sortOrder: number;
  isWorkforceActive: boolean;
  isTerminal: boolean;
  requiresReason: boolean;
  countsTowardHeadcount: boolean;
  legacyAliasKeys: string[];
  metadata: Record<string, unknown> | null;
  status: string;
  source: EmpEmploymentStatusSource;
  catalogKind: typeof EMP_EMPLOYMENT_STATUS_CATALOG_KIND;
  archivedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

type GroupRefStatusHint = {
  status: string;
  code?: string;
  label?: string;
  name?: string;
  metadata?: Record<string, unknown> | null;
};

type SettingsCatalogPort = {
  getEffectiveItemsForKey(
    tenantId: string,
    companyId: string,
    catalogKey: string,
  ): Promise<GroupRefStatusHint[]>;
};

const ROW_SELECT = `id, company_id, status_key, name_vi, sort_order,
              is_workforce_active, is_terminal, requires_reason, counts_toward_headcount,
              legacy_alias_keys_json, metadata_json,
              status, archived_at, created_at, updated_at`;

@Injectable()
export class EmpEmploymentStatusService {
  private schemaReady = false;

  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogPort,
    @Optional() private readonly moduleRef?: ModuleRef,
  ) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.emp_employment_status (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        status_key TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 100,
        is_workforce_active BOOLEAN NOT NULL DEFAULT TRUE,
        is_terminal BOOLEAN NOT NULL DEFAULT FALSE,
        requires_reason BOOLEAN NOT NULL DEFAULT FALSE,
        counts_toward_headcount BOOLEAN NOT NULL DEFAULT TRUE,
        legacy_alias_keys_json JSONB NULL,
        metadata_json JSONB NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_emp_employment_status_company_key_active
        ON public.emp_employment_status (company_id, lower(status_key))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_emp_employment_status_company_status
        ON public.emp_employment_status (company_id, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_emp_employment_status_company_sort
        ON public.emp_employment_status (company_id, sort_order);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_emp_employment_status_effective
        ON public.emp_employment_status (company_id)
        WHERE archived_at IS NULL AND status = 'active';
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_emp_employment_status_terminal
        ON public.emp_employment_status (company_id, is_terminal);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_emp_employment_status_requires_reason
        ON public.emp_employment_status (company_id, requires_reason);
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.emp_employment_status
          DROP CONSTRAINT IF EXISTS chk_emp_st_key_format;
        ALTER TABLE public.emp_employment_status
          ADD CONSTRAINT chk_emp_st_key_format
          CHECK (status_key ~ '^[a-z][a-z0-9_]*$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.emp_employment_status
          DROP CONSTRAINT IF EXISTS chk_emp_st_row_status;
        ALTER TABLE public.emp_employment_status
          ADD CONSTRAINT chk_emp_st_row_status
          CHECK (status IN ('active','retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: never ADD CHECK status_key IN ('active','inactive',…)
    // U65: optional starter upsert omitted — empty catalog is valid.
    this.schemaReady = true;
  }

  private resolveSettingsCatalogs(): SettingsCatalogPort | undefined {
    if (this.settingsCatalogs) {
      return this.settingsCatalogs;
    }
    if (!this.moduleRef) {
      return undefined;
    }
    try {
      const mod = require('../settings-catalogs/settings-catalogs.service') as {
        SettingsCatalogsService: new (...args: never[]) => SettingsCatalogPort;
      };
      return this.moduleRef.get(mod.SettingsCatalogsService, { strict: false });
    } catch {
      return undefined;
    }
  }

  private parseMeta(raw: unknown): Record<string, unknown> | null {
    if (raw == null) return null;
    if (typeof raw === 'object' && !Array.isArray(raw)) {
      return raw as Record<string, unknown>;
    }
    if (typeof raw === 'string') {
      try {
        const p = JSON.parse(raw) as unknown;
        if (p && typeof p === 'object' && !Array.isArray(p)) {
          return p as Record<string, unknown>;
        }
      } catch {
        /* ignore */
      }
    }
    return null;
  }

  private parseAliasKeys(raw: unknown): string[] {
    if (raw == null) return [];
    let arr: unknown = raw;
    if (typeof raw === 'string') {
      try {
        arr = JSON.parse(raw);
      } catch {
        return [];
      }
    }
    if (!Array.isArray(arr)) return [];
    return arr
      .map((x) =>
        String(x ?? '')
          .trim()
          .replace(/-/g, '_')
          .toLowerCase(),
      )
      .filter((k) => !!k && EMP_EMPLOYMENT_STATUS_KEY_FORMAT.test(k));
  }

  private display(
    row: EmpEmploymentStatusRow,
    source: EmpEmploymentStatusSource,
  ): EmpEmploymentStatusDisplay {
    return {
      id: row.id,
      companyId: row.company_id,
      statusKey: row.status_key,
      nameVi: row.name_vi,
      sortOrder: Number(row.sort_order ?? 100),
      isWorkforceActive: row.is_workforce_active !== false,
      isTerminal: Boolean(row.is_terminal),
      requiresReason: Boolean(row.requires_reason),
      countsTowardHeadcount: row.counts_toward_headcount !== false,
      legacyAliasKeys: this.parseAliasKeys(row.legacy_alias_keys_json),
      metadata: this.parseMeta(row.metadata_json),
      status: row.status,
      source,
      catalogKind: EMP_EMPLOYMENT_STATUS_CATALOG_KIND,
      archivedAt: row.archived_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }

  private assertKeyFormat(raw: string): string {
    const key = raw.trim().replace(/-/g, '_').toLowerCase();
    if (!key || !EMP_EMPLOYMENT_STATUS_KEY_FORMAT.test(key)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'statusKey format invalid — expected ^[a-z][a-z0-9_]*$ after hyphen→underscore (format only; not a closed starter set)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  private assertRowStatus(raw: string): EmpEmploymentStatusRowStatus {
    const s = raw.trim().toLowerCase() as EmpEmploymentStatusRowStatus;
    if (!(EMP_EMPLOYMENT_STATUS_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `status must be one of ${EMP_EMPLOYMENT_STATUS_STATUSES.join(',')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return s;
  }

  private resolveScope(
    authorization: string | undefined,
    requestedCompanyId: string,
    tenantId?: string,
  ) {
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId, {
      tenantId,
    });
    const companyKeys = expandHrmTextCompanyIds(
      scope,
      authorization,
      requestedCompanyId,
    );
    return { scope, companyKeys, scopeCompanyId };
  }

  private async loadNativeRows(
    companyKeys: string[],
    opts?: {
      includeArchived?: boolean;
      status?: string;
      q?: string;
    },
  ): Promise<EmpEmploymentStatusRow[]> {
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdTextColumnFilter(filters, values, companyKeys);
    if (!opts?.includeArchived) {
      filters.push('archived_at IS NULL');
    }
    if (opts?.status?.trim()) {
      values.push(opts.status.trim().toLowerCase());
      filters.push(`status = $${values.length}`);
    } else if (!opts?.includeArchived) {
      filters.push(`status = 'active'`);
    }
    if (opts?.q?.trim()) {
      values.push(`%${opts.q.trim().toLowerCase()}%`);
      filters.push(
        `(lower(status_key) LIKE $${values.length} OR lower(name_vi) LIKE $${values.length})`,
      );
    }
    const res = await this.db.query<EmpEmploymentStatusRow>(
      `SELECT ${ROW_SELECT}
       FROM public.emp_employment_status
       WHERE ${filters.join(' AND ')}
       ORDER BY sort_order ASC, status_key ASC;`,
      values,
    );
    return res.rows;
  }

  private mapGroupRefItem(
    item: GroupRefStatusHint,
    companyId: string,
  ): EmpEmploymentStatusDisplay | null {
    const codeRaw = String(item.code ?? '')
      .trim()
      .replace(/-/g, '_')
      .toLowerCase();
    if (!codeRaw || !EMP_EMPLOYMENT_STATUS_KEY_FORMAT.test(codeRaw)) {
      return null;
    }
    if (String(item.status ?? '').toLowerCase() !== 'active') {
      return null;
    }
    const meta =
      item.metadata && typeof item.metadata === 'object' ? item.metadata : null;
    const nameVi = String(item.label ?? item.name ?? codeRaw).trim() || codeRaw;
    const now = new Date().toISOString();
    return {
      id: `group-ref:${companyId}:${codeRaw}`,
      companyId,
      statusKey: codeRaw,
      nameVi,
      sortOrder: Number(meta?.sort_order ?? meta?.sortOrder ?? 100),
      isWorkforceActive:
        meta?.is_workforce_active !== false &&
        meta?.isWorkforceActive !== false,
      isTerminal: Boolean(meta?.is_terminal ?? meta?.isTerminal),
      requiresReason: Boolean(meta?.requires_reason ?? meta?.requiresReason),
      countsTowardHeadcount:
        meta?.counts_toward_headcount !== false &&
        meta?.countsTowardHeadcount !== false,
      legacyAliasKeys: [],
      metadata: meta,
      status: 'active',
      source: 'group_ref',
      catalogKind: EMP_EMPLOYMENT_STATUS_CATALOG_KIND,
      archivedAt: null,
      updatedAt: now,
      createdAt: now,
    };
  }

  /**
   * F-EMP-CAT-ST-EFF-01 — EMP native + settings employee_statuses|employment_statuses REF; EMP wins.
   */
  async listEffective(
    query: ListEffectiveEmpEmploymentStatusesQueryDto,
    authorization?: string,
    options?: { tenantId?: string },
  ): Promise<{ total: number; data: EmpEmploymentStatusDisplay[] }> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(
      authorization,
      query.company_id,
      options?.tenantId,
    );
    const empRows = await this.loadNativeRows(companyKeys, {
      includeArchived: false,
      status: 'active',
      q: query.q,
    });
    const byKey = new Map<string, EmpEmploymentStatusDisplay>();
    for (const row of empRows) {
      byKey.set(row.status_key.toLowerCase(), this.display(row, 'emp_native'));
    }

    const settings = this.resolveSettingsCatalogs();
    if (settings) {
      const tenantId =
        options?.tenantId?.trim() || masterTenantIdFromEnv() || 'xevn';
      const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
        authorization,
        tenantId,
        query.company_id,
      );
      const q = query.q?.trim().toLowerCase();
      for (const catalogKey of EMP_EMPLOYMENT_STATUS_GROUP_REF_KEYS) {
        try {
          const items = await settings.getEffectiveItemsForKey(
            tenantId,
            catalogCompanyId,
            catalogKey,
          );
          for (const item of items ?? []) {
            const mapped = this.mapGroupRefItem(item, catalogCompanyId);
            if (!mapped) continue;
            if (
              q &&
              !mapped.statusKey.includes(q) &&
              !mapped.nameVi.toLowerCase().includes(q)
            ) {
              continue;
            }
            const existing = byKey.get(mapped.statusKey);
            if (existing) {
              byKey.set(mapped.statusKey, {
                ...existing,
                source: 'emp_override',
              });
            } else {
              byKey.set(mapped.statusKey, mapped);
            }
          }
        } catch {
          // REF unavailable — EMP-only effective set is still valid.
        }
      }
    }

    const data = [...byKey.values()].sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.statusKey.localeCompare(b.statusKey),
    );
    return { total: data.length, data };
  }

  /**
   * Label lookup for OS 28 display-ready — maps canonical keys + aliases → name_vi.
   * Empty EFF → empty map (caller keeps hardcode bootstrap).
   */
  async buildStatusLabelLookup(
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<Map<string, string>> {
    const effective = await this.listEffective(
      { company_id: companyId },
      authorization,
      {
        tenantId,
      },
    );
    const map = new Map<string, string>();
    for (const row of effective.data) {
      map.set(row.statusKey.toLowerCase(), row.nameVi);
      for (const alias of row.legacyAliasKeys) {
        if (!map.has(alias)) {
          map.set(alias, row.nameVi);
        }
      }
    }
    return map;
  }

  /**
   * F-EMP-ST-CNS-01 / VAL-EMP-ST-CNS-01 — when effective catalog >0, reject invent status.
   * Empty effective = soft allow (U65; no fake starter). Alias → canonical (CNS-05).
   */
  async assertStatusInEffectiveCatalog(input: {
    companyId: string;
    status: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<EmpEmploymentStatusDisplay | null> {
    const key = input.status.trim().replace(/-/g, '_').toLowerCase();
    if (!key) {
      throw new ApiException(
        HRM_EMP_STATUS_KEY,
        'status is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const effective = await this.listEffective(
      { company_id: input.companyId },
      input.authorization,
      { tenantId: input.tenantId },
    );
    if (effective.total === 0) {
      return null;
    }
    const hit =
      effective.data.find((r) => r.statusKey === key) ??
      effective.data.find((r) => r.legacyAliasKeys.includes(key));
    if (!hit) {
      throw new ApiException(
        HRM_EMP_STATUS_KEY,
        `status '${input.status}' is not in effective employment status catalog (free-text invent forbidden when EFF ≠ empty)`,
        HttpStatus.BAD_REQUEST,
        { status: input.status, key },
      );
    }
    return hit;
  }

  /** F-EMP-CAT-ST-01 list */
  async listEmploymentStatuses(
    query: ListEmpEmploymentStatusesQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total: number; data: EmpEmploymentStatusDisplay[] }> {
    await this.ensureSchema();
    const includeGroupRef =
      String(query.include_group_ref ?? '').toLowerCase() === 'true';
    if (includeGroupRef) {
      return this.listEffective(
        { company_id: query.company_id, q: query.q },
        authorization,
        { tenantId },
      );
    }
    const { companyKeys } = this.resolveScope(
      authorization,
      query.company_id,
      tenantId,
    );
    const includeArchived =
      String(query.include_archived ?? '').toLowerCase() === 'true';
    const rows = await this.loadNativeRows(companyKeys, {
      includeArchived,
      status: query.status,
      q: query.q,
    });
    const data = rows.map((r) => this.display(r, 'emp_native'));
    return { total: data.length, data };
  }

  /** F-EMP-CAT-ST-01 get-by-id — same scope as list (U19). */
  async getEmploymentStatusById(
    statusId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpEmploymentStatusDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const res = await this.db.query<EmpEmploymentStatusRow>(
      `SELECT ${ROW_SELECT}
       FROM public.emp_employment_status
       WHERE id = $1::uuid
       LIMIT 1;`,
      [statusId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_EMP_ST_404,
        'Employment status not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_EMP_ST_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return this.display(row, 'emp_native');
  }

  /** F-EMP-CAT-ST-02 create / upsert — tenant writer only. */
  async upsertEmploymentStatus(
    body: UpsertEmpEmploymentStatusDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpEmploymentStatusDisplay> {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      body.companyId,
      { tenantId },
    );
    const statusKey = this.assertKeyFormat(body.statusKey);
    const nameVi = body.nameVi.trim();
    if (!nameVi) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'nameVi is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const status = body.status ? this.assertRowStatus(body.status) : 'active';
    const metadataJson =
      body.metadata != null ? JSON.stringify(body.metadata) : null;
    const aliasJson =
      body.legacyAliasKeys != null
        ? JSON.stringify(
            body.legacyAliasKeys
              .map((k) => this.assertKeyFormat(k))
              .filter((k) => k !== statusKey),
          )
        : null;
    const sortOrder = body.sortOrder ?? 100;

    const existing = await this.db.query<EmpEmploymentStatusRow>(
      `SELECT ${ROW_SELECT}
       FROM public.emp_employment_status
       WHERE company_id = $1 AND lower(status_key) = lower($2) AND archived_at IS NULL
       LIMIT 1;`,
      [companyId, statusKey],
    );
    const hit = existing.rows[0];
    if (hit) {
      const updated = await this.db.query<EmpEmploymentStatusRow>(
        `UPDATE public.emp_employment_status SET
           name_vi = $2,
           sort_order = $3,
           is_workforce_active = $4,
           is_terminal = $5,
           requires_reason = $6,
           counts_toward_headcount = $7,
           legacy_alias_keys_json = COALESCE($8::jsonb, legacy_alias_keys_json),
           metadata_json = $9::jsonb,
           status = $10,
           updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING ${ROW_SELECT};`,
        [
          hit.id,
          nameVi,
          sortOrder,
          body.isWorkforceActive ?? true,
          body.isTerminal ?? false,
          body.requiresReason ?? false,
          body.countsTowardHeadcount ?? true,
          aliasJson,
          metadataJson,
          status,
        ],
      );
      return this.display(updated.rows[0], 'emp_native');
    }

    try {
      const inserted = await this.db.query<EmpEmploymentStatusRow>(
        `INSERT INTO public.emp_employment_status (
           id, company_id, status_key, name_vi, sort_order,
           is_workforce_active, is_terminal, requires_reason, counts_toward_headcount,
           legacy_alias_keys_json, metadata_json, status
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12
         )
         RETURNING ${ROW_SELECT};`,
        [
          randomUUID(),
          companyId,
          statusKey,
          nameVi,
          sortOrder,
          body.isWorkforceActive ?? true,
          body.isTerminal ?? false,
          body.requiresReason ?? false,
          body.countsTowardHeadcount ?? true,
          aliasJson,
          metadataJson,
          status,
        ],
      );
      return this.display(inserted.rows[0], 'emp_native');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        /uq_emp_employment_status_company_key_active|duplicate key/i.test(msg)
      ) {
        throw new ApiException(
          HRM_PLT_CAT_CODE_CONFLICT,
          `Active status_key '${statusKey}' already exists for company`,
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async patchEmploymentStatus(
    statusId: string,
    companyId: string,
    body: PatchEmpEmploymentStatusDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpEmploymentStatusDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<EmpEmploymentStatusRow>(
      `SELECT ${ROW_SELECT} FROM public.emp_employment_status WHERE id = $1::uuid LIMIT 1;`,
      [statusId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_EMP_ST_404,
        'Employment status not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_EMP_ST_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'Cannot patch archived employment status — create a new active key if needed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    const assign = (col: string, value: unknown) => {
      values.push(value);
      sets.push(`${col} = $${values.length}`);
    };
    if (body.nameVi !== undefined) assign('name_vi', body.nameVi.trim());
    if (body.sortOrder !== undefined) assign('sort_order', body.sortOrder);
    if (body.isWorkforceActive !== undefined)
      assign('is_workforce_active', body.isWorkforceActive);
    if (body.isTerminal !== undefined) assign('is_terminal', body.isTerminal);
    if (body.requiresReason !== undefined)
      assign('requires_reason', body.requiresReason);
    if (body.countsTowardHeadcount !== undefined) {
      assign('counts_toward_headcount', body.countsTowardHeadcount);
    }
    if (body.legacyAliasKeys !== undefined) {
      values.push(
        body.legacyAliasKeys == null
          ? null
          : JSON.stringify(
              body.legacyAliasKeys.map((k) => this.assertKeyFormat(k)),
            ),
      );
      sets.push(`legacy_alias_keys_json = $${values.length}::jsonb`);
    }
    if (body.metadata !== undefined) {
      values.push(body.metadata == null ? null : JSON.stringify(body.metadata));
      sets.push(`metadata_json = $${values.length}::jsonb`);
    }
    if (body.status !== undefined)
      assign('status', this.assertRowStatus(body.status));

    if (!sets.length) {
      return this.display(row, 'emp_native');
    }
    const patchValues = [...values, statusId];
    const updated = await this.db.query<EmpEmploymentStatusRow>(
      `UPDATE public.emp_employment_status
       SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${patchValues.length}::uuid
       RETURNING ${ROW_SELECT};`,
      patchValues,
    );
    return this.display(updated.rows[0], 'emp_native');
  }

  /** Soft-delete — FORBIDDEN hard-delete (BR-PLT-04 · L-EMP-ST-11). */
  async retireEmploymentStatus(
    statusId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpEmploymentStatusDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<EmpEmploymentStatusRow>(
      `SELECT ${ROW_SELECT} FROM public.emp_employment_status WHERE id = $1::uuid LIMIT 1;`,
      [statusId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_EMP_ST_404,
        'Employment status not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_EMP_ST_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      return this.display(row, 'emp_native');
    }
    const updated = await this.db.query<EmpEmploymentStatusRow>(
      `UPDATE public.emp_employment_status
       SET status = 'retired', archived_at = NOW(), updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING ${ROW_SELECT};`,
      [statusId],
    );
    return this.display(updated.rows[0], 'emp_native');
  }
}
