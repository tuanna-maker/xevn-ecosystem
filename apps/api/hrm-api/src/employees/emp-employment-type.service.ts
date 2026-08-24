/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ → Catalog loại hình thuê (`/employees/employment-types`)
 * UC:         AC-PLT-EMP-04/05 · BR-PLT-02/04/05/06
 * BR:         Open catalog · dual SoT REF+EMP · soft-delete · U19 scope_parity
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md §3 · §3.4 dual SoT
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md §3 F-EMP-CAT-ET/EFF-02
 * DB_DESIGN:  docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.0b
 * API_DESIGN: F-EMP-CAT-ET-01/02 · F-EMP-CAT-EFF-02
 * Purpose:    ensureSchema emp_employment_type + CRUD/retire + effective union (EMP wins collision).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01
 * Coded:      2026-08-07
 * Callers:    employees.controller · YCTD/employee ET assert (R-PLT-EMP-02)
 * Callees:    HrmDbService · resolveHrmListScope · SettingsCatalogsService (group REF read)
 * FEActions:  Settings Tạo loại hình thuê → list F5 → form NV/YCTD chọn mã mới
 * BEChain:    ensureSchema → scope filter → soft archive · effective merge no persist
 * Impact:     Closed 4-option reject 5th = phá BR-PLT-05; write XBOS REF = phá L-EMP-CAT-03
 * must_keep:  CORE-01/UF-HRM-02/SI · AC-PLT-EMP-01 XBOS position · settings employment_types REF ·
 *             U65 empty [] OK · FORBIDDEN hard-delete / CHECK employment_type_key IN (…)
 * SOLID:      Catalog CRUD tách TXN employees / contracts / SI / recruitment TXN
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01
 * change_mode: ADD
 * What: F-EMP-TOK-02 same-TX upsert/retire emp.et.<key> (hyphen→underscore) origin=emp_catalog
 * must_keep: ET schema seals · soft-delete · U65 no seed · single merge-token SoT · no new emp_* tables
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
import { HrmDbQueryFn, HrmDbService } from '../db/hrm-db.service';
import {
  mergeTokenKeyForEmpEt,
  mergeTokenSourcePathForEmpEt,
  upsertEmpCatalogMergeToken,
} from '../merge-tokens/emp-merge-token-register';
import {
  EMP_EMPLOYMENT_TYPE_CATALOG_KIND,
  EMP_EMPLOYMENT_TYPE_KEY_FORMAT,
  EMP_EMPLOYMENT_TYPE_STATUSES,
  EMP_EMPLOYMENT_TYPES_GROUP_REF_KEY,
  HRM_EMP_ET_404,
  HRM_EMP_ET_UNKNOWN,
  HRM_PLT_CAT_CODE_CONFLICT,
  HRM_PLT_CAT_CODE_INVALID,
  type EmpEmploymentTypeSource,
  type EmpEmploymentTypeStatus,
} from './emp-employment-type.constants';
import type {
  ListEffectiveEmpEmploymentTypesQueryDto,
  ListEmpEmploymentTypesQueryDto,
  PatchEmpEmploymentTypeDto,
  UpsertEmpEmploymentTypeDto,
} from './dto/emp-employment-type.dto';

type EmpEmploymentTypeRow = {
  id: string;
  company_id: string;
  employment_type_key: string;
  name_vi: string;
  sort_order: number;
  counts_toward_headcount: boolean;
  eligible_for_si: boolean;
  is_contingent: boolean;
  metadata_json: Record<string, unknown> | string | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EmpEmploymentTypeDisplay = {
  id: string;
  companyId: string;
  employmentTypeKey: string;
  nameVi: string;
  sortOrder: number;
  countsTowardHeadcount: boolean;
  eligibleForSi: boolean;
  isContingent: boolean;
  metadata: Record<string, unknown> | null;
  status: string;
  source: EmpEmploymentTypeSource;
  catalogKind: typeof EMP_EMPLOYMENT_TYPE_CATALOG_KIND;
  archivedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

type GroupRefEmploymentHint = {
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
  ): Promise<GroupRefEmploymentHint[]>;
};

const ROW_SELECT = `id, company_id, employment_type_key, name_vi, sort_order,
              counts_toward_headcount, eligible_for_si, is_contingent, metadata_json,
              status, archived_at, created_at, updated_at`;

@Injectable()
export class EmpEmploymentTypeService {
  private schemaReady = false;

  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogPort,
    @Optional() private readonly moduleRef?: ModuleRef,
  ) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.emp_employment_type (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employment_type_key TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 100,
        counts_toward_headcount BOOLEAN NOT NULL DEFAULT TRUE,
        eligible_for_si BOOLEAN NOT NULL DEFAULT TRUE,
        is_contingent BOOLEAN NOT NULL DEFAULT FALSE,
        metadata_json JSONB NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_emp_employment_type_company_key_active
        ON public.emp_employment_type (company_id, lower(employment_type_key))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_emp_employment_type_company_status
        ON public.emp_employment_type (company_id, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_emp_employment_type_company_sort
        ON public.emp_employment_type (company_id, sort_order);
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.emp_employment_type
          DROP CONSTRAINT IF EXISTS chk_emp_et_key_format;
        ALTER TABLE public.emp_employment_type
          ADD CONSTRAINT chk_emp_et_key_format
          CHECK (employment_type_key ~ '^[a-z][a-z0-9_]*$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.emp_employment_type
          DROP CONSTRAINT IF EXISTS chk_emp_et_status;
        ALTER TABLE public.emp_employment_type
          ADD CONSTRAINT chk_emp_et_status
          CHECK (status IN ('active','retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: never ADD CHECK employment_type_key IN ('full_time','part_time',…)
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

  private display(
    row: EmpEmploymentTypeRow,
    source: EmpEmploymentTypeSource,
  ): EmpEmploymentTypeDisplay {
    return {
      id: row.id,
      companyId: row.company_id,
      employmentTypeKey: row.employment_type_key,
      nameVi: row.name_vi,
      sortOrder: Number(row.sort_order ?? 100),
      countsTowardHeadcount: row.counts_toward_headcount !== false,
      eligibleForSi: row.eligible_for_si !== false,
      isContingent: Boolean(row.is_contingent),
      metadata: this.parseMeta(row.metadata_json),
      status: row.status,
      source,
      catalogKind: EMP_EMPLOYMENT_TYPE_CATALOG_KIND,
      archivedAt: row.archived_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }

  /** Normalize hyphens→underscores then format-check (VAL-EMP-ET-01). */
  private assertKeyFormat(raw: string): string {
    const key = raw.trim().replace(/-/g, '_');
    if (!key || !EMP_EMPLOYMENT_TYPE_KEY_FORMAT.test(key)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'employmentTypeKey format invalid — expected ^[a-z][a-z0-9_]*$ after hyphen→underscore (format only; not a closed starter set)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  private assertStatus(raw: string): EmpEmploymentTypeStatus {
    const s = raw.trim().toLowerCase() as EmpEmploymentTypeStatus;
    if (!(EMP_EMPLOYMENT_TYPE_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `status must be one of ${EMP_EMPLOYMENT_TYPE_STATUSES.join(',')}`,
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
  ): Promise<EmpEmploymentTypeRow[]> {
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
        `(lower(employment_type_key) LIKE $${values.length} OR lower(name_vi) LIKE $${values.length})`,
      );
    }
    const res = await this.db.query<EmpEmploymentTypeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.emp_employment_type
       WHERE ${filters.join(' AND ')}
       ORDER BY sort_order ASC, employment_type_key ASC;`,
      values,
    );
    return res.rows;
  }

  private mapGroupRefItem(
    item: GroupRefEmploymentHint,
    companyId: string,
  ): EmpEmploymentTypeDisplay | null {
    const codeRaw = String(item.code ?? '')
      .trim()
      .replace(/-/g, '_')
      .toLowerCase();
    if (!codeRaw || !EMP_EMPLOYMENT_TYPE_KEY_FORMAT.test(codeRaw)) {
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
      employmentTypeKey: codeRaw,
      nameVi,
      sortOrder: Number(meta?.sort_order ?? meta?.sortOrder ?? 100),
      countsTowardHeadcount:
        meta?.counts_toward_headcount !== false &&
        meta?.countsTowardHeadcount !== false,
      eligibleForSi:
        meta?.eligible_for_si !== false && meta?.eligibleForSi !== false,
      isContingent: Boolean(meta?.is_contingent ?? meta?.isContingent),
      metadata: meta,
      status: 'active',
      source: 'group_ref',
      catalogKind: EMP_EMPLOYMENT_TYPE_CATALOG_KIND,
      archivedAt: null,
      updatedAt: now,
      createdAt: now,
    };
  }

  /**
   * F-EMP-CAT-EFF-02 — EMP native + settings employment_types REF; EMP wins on same key.
   */
  async listEffective(
    query: ListEffectiveEmpEmploymentTypesQueryDto,
    authorization?: string,
    options?: { tenantId?: string },
  ): Promise<{ total: number; data: EmpEmploymentTypeDisplay[] }> {
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
    const byKey = new Map<string, EmpEmploymentTypeDisplay>();
    for (const row of empRows) {
      byKey.set(
        row.employment_type_key.toLowerCase(),
        this.display(row, 'emp_native'),
      );
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
      try {
        const items = await settings.getEffectiveItemsForKey(
          tenantId,
          catalogCompanyId,
          EMP_EMPLOYMENT_TYPES_GROUP_REF_KEY,
        );
        const q = query.q?.trim().toLowerCase();
        for (const item of items ?? []) {
          const mapped = this.mapGroupRefItem(item, catalogCompanyId);
          if (!mapped) continue;
          if (
            q &&
            !mapped.employmentTypeKey.includes(q) &&
            !mapped.nameVi.toLowerCase().includes(q)
          ) {
            continue;
          }
          const existing = byKey.get(mapped.employmentTypeKey);
          if (existing) {
            byKey.set(mapped.employmentTypeKey, {
              ...existing,
              source: 'emp_override',
            });
          } else {
            byKey.set(mapped.employmentTypeKey, mapped);
          }
        }
      } catch {
        // REF unavailable — EMP-only effective set is still valid.
      }
    }

    const data = [...byKey.values()].sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        a.employmentTypeKey.localeCompare(b.employmentTypeKey),
    );
    return { total: data.length, data };
  }

  /**
   * R-PLT-EMP-02 / BR-PLT-02 — when effective catalog >0, reject unknown employment_type.
   * Empty effective = soft allow (U65; no fake starter).
   */
  async assertEmploymentTypeInEffectiveCatalog(input: {
    companyId: string;
    employmentType: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<EmpEmploymentTypeDisplay | null> {
    const key = input.employmentType.trim().replace(/-/g, '_').toLowerCase();
    if (!key) {
      throw new ApiException(
        HRM_EMP_ET_UNKNOWN,
        'employment_type is required',
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
    const hit = effective.data.find((r) => r.employmentTypeKey === key);
    if (!hit) {
      throw new ApiException(
        HRM_EMP_ET_UNKNOWN,
        `employment_type '${input.employmentType}' is not in effective employment catalog (free-text SoT forbidden)`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return hit;
  }

  /** F-EMP-CAT-ET-01 list */
  async listEmploymentTypes(
    query: ListEmpEmploymentTypesQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total: number; data: EmpEmploymentTypeDisplay[] }> {
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

  /** F-EMP-CAT-ET-01 get-by-id — same scope as list (U19). */
  async getEmploymentTypeById(
    employmentTypeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpEmploymentTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const res = await this.db.query<EmpEmploymentTypeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.emp_employment_type
       WHERE id = $1::uuid
       LIMIT 1;`,
      [employmentTypeId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_EMP_ET_404,
        'Employment type not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_EMP_ET_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return this.display(row, 'emp_native');
  }

  /** F-EMP-CAT-ET-02 create / upsert — tenant writer only + F-EMP-TOK-02 same TX. */
  async upsertEmploymentType(
    body: UpsertEmpEmploymentTypeDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpEmploymentTypeDisplay> {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      body.companyId,
      { tenantId },
    );
    const employmentTypeKey = this.assertKeyFormat(body.employmentTypeKey);
    const nameVi = body.nameVi.trim();
    if (!nameVi) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'nameVi is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const status = body.status ? this.assertStatus(body.status) : 'active';
    const metadataJson =
      body.metadata != null ? JSON.stringify(body.metadata) : null;
    const sortOrder = body.sortOrder ?? 100;

    return this.db.withTransaction(async (query) => {
      const existing = await query<EmpEmploymentTypeRow>(
        `SELECT ${ROW_SELECT}
         FROM public.emp_employment_type
         WHERE company_id = $1 AND lower(employment_type_key) = lower($2) AND archived_at IS NULL
         LIMIT 1;`,
        [companyId, employmentTypeKey],
      );
      const hit = existing.rows[0];
      let row: EmpEmploymentTypeRow;
      if (hit) {
        const updated = await query<EmpEmploymentTypeRow>(
          `UPDATE public.emp_employment_type SET
             name_vi = $2,
             sort_order = $3,
             counts_toward_headcount = $4,
             eligible_for_si = $5,
             is_contingent = $6,
             metadata_json = $7::jsonb,
             status = $8,
             updated_at = NOW()
           WHERE id = $1::uuid
           RETURNING ${ROW_SELECT};`,
          [
            hit.id,
            nameVi,
            sortOrder,
            body.countsTowardHeadcount ?? true,
            body.eligibleForSi ?? true,
            body.isContingent ?? false,
            metadataJson,
            status,
          ],
        );
        row = updated.rows[0];
      } else {
        try {
          const inserted = await query<EmpEmploymentTypeRow>(
            `INSERT INTO public.emp_employment_type (
               id, company_id, employment_type_key, name_vi, sort_order,
               counts_toward_headcount, eligible_for_si, is_contingent, metadata_json, status
             ) VALUES (
               $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10
             )
             RETURNING ${ROW_SELECT};`,
            [
              randomUUID(),
              companyId,
              employmentTypeKey,
              nameVi,
              sortOrder,
              body.countsTowardHeadcount ?? true,
              body.eligibleForSi ?? true,
              body.isContingent ?? false,
              metadataJson,
              status,
            ],
          );
          row = inserted.rows[0];
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (
            /uq_emp_employment_type_company_key_active|duplicate key/i.test(msg)
          ) {
            throw new ApiException(
              HRM_PLT_CAT_CODE_CONFLICT,
              `Active employment_type_key '${employmentTypeKey}' already exists for company`,
              HttpStatus.CONFLICT,
            );
          }
          throw err;
        }
      }

      await this.registerEtMergeToken(query, {
        companyId: row.company_id,
        employmentTypeKey: row.employment_type_key,
        nameVi: row.name_vi,
        employmentTypeId: row.id,
        active: row.status === 'active' && !row.archived_at,
      });
      return this.display(row, 'emp_native');
    });
  }

  async patchEmploymentType(
    employmentTypeId: string,
    companyId: string,
    body: PatchEmpEmploymentTypeDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpEmploymentTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<EmpEmploymentTypeRow>(
      `SELECT ${ROW_SELECT} FROM public.emp_employment_type WHERE id = $1::uuid LIMIT 1;`,
      [employmentTypeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_EMP_ET_404,
        'Employment type not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_EMP_ET_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'Cannot patch archived employment type — create a new active key if needed',
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
    if (body.countsTowardHeadcount !== undefined) {
      assign('counts_toward_headcount', body.countsTowardHeadcount);
    }
    if (body.eligibleForSi !== undefined)
      assign('eligible_for_si', body.eligibleForSi);
    if (body.isContingent !== undefined)
      assign('is_contingent', body.isContingent);
    if (body.metadata !== undefined) {
      values.push(body.metadata == null ? null : JSON.stringify(body.metadata));
      sets.push(`metadata_json = $${values.length}::jsonb`);
    }
    if (body.status !== undefined)
      assign('status', this.assertStatus(body.status));

    if (!sets.length) {
      return this.display(row, 'emp_native');
    }

    return this.db.withTransaction(async (query) => {
      const patchValues = [...values, employmentTypeId];
      const updated = await query<EmpEmploymentTypeRow>(
        `UPDATE public.emp_employment_type
         SET ${sets.join(', ')}, updated_at = NOW()
         WHERE id = $${patchValues.length}::uuid
         RETURNING ${ROW_SELECT};`,
        patchValues,
      );
      const next = updated.rows[0];
      await this.registerEtMergeToken(query, {
        companyId: next.company_id,
        employmentTypeKey: next.employment_type_key,
        nameVi: next.name_vi,
        employmentTypeId: next.id,
        active: next.status === 'active' && !next.archived_at,
      });
      return this.display(next, 'emp_native');
    });
  }

  /** Soft-delete — FORBIDDEN hard-delete (BR-PLT-04) · F-EMP-TOK-02 retire token same TX. */
  async retireEmploymentType(
    employmentTypeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpEmploymentTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<EmpEmploymentTypeRow>(
      `SELECT ${ROW_SELECT} FROM public.emp_employment_type WHERE id = $1::uuid LIMIT 1;`,
      [employmentTypeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_EMP_ET_404,
        'Employment type not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_EMP_ET_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      return this.display(row, 'emp_native');
    }
    return this.db.withTransaction(async (query) => {
      const updated = await query<EmpEmploymentTypeRow>(
        `UPDATE public.emp_employment_type
         SET status = 'retired', archived_at = NOW(), updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING ${ROW_SELECT};`,
        [employmentTypeId],
      );
      const next = updated.rows[0];
      await this.registerEtMergeToken(query, {
        companyId: next.company_id,
        employmentTypeKey: next.employment_type_key,
        nameVi: next.name_vi,
        employmentTypeId: next.id,
        active: false,
      });
      return this.display(next, 'emp_native');
    });
  }

  private async registerEtMergeToken(
    query: HrmDbQueryFn,
    args: {
      companyId: string;
      employmentTypeKey: string;
      nameVi: string;
      employmentTypeId: string;
      active: boolean;
    },
  ): Promise<void> {
    try {
      await upsertEmpCatalogMergeToken(query, {
        companyId: args.companyId,
        tokenKey: mergeTokenKeyForEmpEt(args.employmentTypeKey),
        sourcePath: mergeTokenSourcePathForEmpEt(args.employmentTypeKey),
        labelVi: args.nameVi,
        extensionFieldRef: args.employmentTypeId,
        active: args.active,
      });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'HRM-PLT-CAT-CODE-INVALID') {
        throw new ApiException(
          HRM_PLT_CAT_CODE_INVALID,
          err instanceof Error ? err.message : 'tokenKey format invalid',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw err;
    }
  }
}
