/**
 * @CODE-MEMORY
 * Screen:     HRM → Hợp đồng & BH → Catalog nhà BH (`/contracts-insurance/insurers`)
 * UC:         AC-PLT-SI-INSURER-01..01d · FR-UC-BP-CORE-10 · E3 AC-INS-02 · BR-PLT-02/04/05/06
 * BR:         Open catalog · dual SoT REF+SI · soft-delete · U19 scope_parity
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01.md §2 · §2.4
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md §5–§6 F-SI-CAT-INS-*
 * DB_DESIGN:  docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.6b
 * API_DESIGN: F-SI-CAT-INS-01/02 · F-SI-CAT-INS-EFF-01
 * Purpose:    ensureSchema si_insurer + CRUD/retire + effective union (SI wins collision).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BE-01
 * Coded:      2026-08-08
 * Callers:    contracts-insurance.controller · ContractsInsuranceService.assertInsurerKey
 * Callees:    HrmDbService · resolveHrmListScope · SettingsCatalogsService (group REF read)
 * FEActions:  Settings Nhà BH → list F5 → policy pick Nest EFF
 * BEChain:    ensureSchema → scope filter → soft archive · effective merge no persist
 * Impact:     Closed enum reject Nth key = phá BR-PLT-05; hard-delete = phá history; MD-alone SoT = phá L-SI-INR-02
 * must_keep:  enrollment ONE SoT employee_insurances · CTR legal-print/library · si_insurance_type L1 RETAIN ·
 *             U65 empty [] OK · FORBIDDEN hard-delete / CHECK insurer_key IN (…) / fold into type
 * SOLID:      Catalog CRUD tách TXN policy/enrollment
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-be-01.md
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
  HRM_INS_INSURER_KEY,
  HRM_PLT_CAT_CODE_CONFLICT,
  HRM_PLT_CAT_CODE_INVALID,
  HRM_SI_INSURER_404,
  SI_INSURER_CATALOG_KIND,
  SI_INSURER_KEY_FORMAT,
  SI_INSURER_STATUSES,
  SI_INSURERS_GROUP_REF_KEY,
  type SiInsurerSource,
  type SiInsurerStatus,
} from './si-insurer.constants';
import type {
  ListEffectiveSiInsurersQueryDto,
  ListSiInsurersQueryDto,
  PatchSiInsurerDto,
  UpsertSiInsurerDto,
} from './dto/si-insurer.dto';

type SiInsurerRow = {
  id: string;
  company_id: string;
  insurer_key: string;
  name_vi: string;
  sort_order: number;
  legacy_alias_keys_json: unknown;
  metadata_json: Record<string, unknown> | string | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SiInsurerDisplay = {
  id: string;
  companyId: string;
  insurerKey: string;
  nameVi: string;
  sortOrder: number;
  legacyAliasKeys: string[];
  metadata: Record<string, unknown> | null;
  status: string;
  source: SiInsurerSource;
  catalogKind: typeof SI_INSURER_CATALOG_KIND;
  archivedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

type GroupRefInsHint = {
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
  ): Promise<GroupRefInsHint[]>;
};

const ROW_SELECT = `id, company_id, insurer_key, name_vi, sort_order,
              legacy_alias_keys_json, metadata_json,
              status, archived_at, created_at, updated_at`;

@Injectable()
export class SiInsurerService {
  private schemaReady = false;

  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogPort,
    @Optional() private readonly moduleRef?: ModuleRef,
  ) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.si_insurer (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        insurer_key TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 100,
        legacy_alias_keys_json JSONB NULL,
        metadata_json JSONB NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_si_insurer_company_key_active
        ON public.si_insurer (company_id, lower(insurer_key))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_si_insurer_company_status
        ON public.si_insurer (company_id, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_si_insurer_company_sort
        ON public.si_insurer (company_id, sort_order);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_si_insurer_company_effective
        ON public.si_insurer (company_id)
        WHERE archived_at IS NULL AND status = 'active';
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.si_insurer
          DROP CONSTRAINT IF EXISTS chk_si_insurer_key_format;
        ALTER TABLE public.si_insurer
          ADD CONSTRAINT chk_si_insurer_key_format
          CHECK (insurer_key ~ '^[a-zA-Z][a-zA-Z0-9_]*$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.si_insurer
          DROP CONSTRAINT IF EXISTS chk_si_insurer_status;
        ALTER TABLE public.si_insurer
          ADD CONSTRAINT chk_si_insurer_status
          CHECK (status IN ('active','retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: never ADD CHECK insurer_key IN ('VSS','BaoViet',…)
    // FORBIDDEN: never fold into / ALTER public.si_insurance_type
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
        arr = JSON.parse(raw) as unknown;
      } catch {
        return [];
      }
    }
    if (!Array.isArray(arr)) return [];
    return arr
      .map((x) => String(x ?? '').trim())
      .filter((x) => x.length > 0 && SI_INSURER_KEY_FORMAT.test(x));
  }

  private display(
    row: SiInsurerRow,
    source: SiInsurerSource,
  ): SiInsurerDisplay {
    return {
      id: row.id,
      companyId: row.company_id,
      insurerKey: row.insurer_key,
      nameVi: row.name_vi,
      sortOrder: Number(row.sort_order) || 100,
      legacyAliasKeys: this.parseAliasKeys(row.legacy_alias_keys_json),
      metadata: this.parseMeta(row.metadata_json),
      status: row.status,
      source,
      catalogKind: SI_INSURER_CATALOG_KIND,
      archivedAt: row.archived_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }

  private assertKeyFormat(raw: string): string {
    const key = raw.trim();
    if (!key || !SI_INSURER_KEY_FORMAT.test(key)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'insurerKey format invalid — expected ^[a-zA-Z][a-zA-Z0-9_]*$ (format only; not a closed starter set)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  private assertStatus(raw: string): SiInsurerStatus {
    const s = raw.trim().toLowerCase() as SiInsurerStatus;
    if (!(SI_INSURER_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `status must be one of ${SI_INSURER_STATUSES.join(',')}`,
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

  private async loadSiNativeRows(
    companyKeys: string[],
    opts?: {
      includeArchived?: boolean;
      status?: string;
      q?: string;
    },
  ): Promise<SiInsurerRow[]> {
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
        `(lower(insurer_key) LIKE $${values.length} OR lower(name_vi) LIKE $${values.length})`,
      );
    }
    const res = await this.db.query<SiInsurerRow>(
      `SELECT ${ROW_SELECT}
       FROM public.si_insurer
       WHERE ${filters.join(' AND ')}
       ORDER BY sort_order ASC, insurer_key ASC;`,
      values,
    );
    return res.rows;
  }

  private mapGroupRefItem(
    item: GroupRefInsHint,
    companyId: string,
  ): SiInsurerDisplay | null {
    const code = String(item.code ?? '').trim();
    if (!code || !SI_INSURER_KEY_FORMAT.test(code)) {
      return null;
    }
    if (String(item.status ?? '').toLowerCase() !== 'active') {
      return null;
    }
    const meta =
      item.metadata && typeof item.metadata === 'object' ? item.metadata : null;
    const nameVi = String(item.label ?? item.name ?? code).trim() || code;
    const now = new Date().toISOString();
    return {
      id: `group-ref:${companyId}:${code.toLowerCase()}`,
      companyId,
      insurerKey: code,
      nameVi,
      sortOrder: Number(meta?.sort_order ?? meta?.sortOrder ?? 100) || 100,
      legacyAliasKeys: [],
      metadata: meta,
      status: 'active',
      source: 'group_ref',
      catalogKind: SI_INSURER_CATALOG_KIND,
      archivedAt: null,
      updatedAt: now,
      createdAt: now,
    };
  }

  /**
   * F-SI-CAT-INS-EFF-01 — SI native + settings insurers REF; SI wins on same insurer_key.
   */
  async listEffective(
    query: ListEffectiveSiInsurersQueryDto,
    authorization?: string,
    options?: { tenantId?: string },
  ): Promise<{ total: number; data: SiInsurerDisplay[] }> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(
      authorization,
      query.company_id,
      options?.tenantId,
    );
    const siRows = await this.loadSiNativeRows(companyKeys, {
      includeArchived: false,
      status: 'active',
      q: query.q,
    });
    const byKey = new Map<string, SiInsurerDisplay>();
    for (const row of siRows) {
      byKey.set(row.insurer_key.toLowerCase(), this.display(row, 'si_native'));
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
          SI_INSURERS_GROUP_REF_KEY,
        );
        const q = query.q?.trim().toLowerCase();
        for (const item of items ?? []) {
          const mapped = this.mapGroupRefItem(item, catalogCompanyId);
          if (!mapped) continue;
          if (
            q &&
            !mapped.insurerKey.toLowerCase().includes(q) &&
            !mapped.nameVi.toLowerCase().includes(q)
          ) {
            continue;
          }
          const existing = byKey.get(mapped.insurerKey.toLowerCase());
          if (existing) {
            byKey.set(mapped.insurerKey.toLowerCase(), {
              ...existing,
              source: 'si_override',
            });
          } else {
            byKey.set(mapped.insurerKey.toLowerCase(), mapped);
          }
        }
      } catch {
        // REF unavailable — SI-only effective set is still valid.
      }
    }

    const data = [...byKey.values()].sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.insurerKey.localeCompare(b.insurerKey),
    );
    return { total: data.length, data };
  }

  private findInEffective(
    data: SiInsurerDisplay[],
    rawKey: string,
  ): SiInsurerDisplay | undefined {
    const needle = rawKey.trim().toLowerCase();
    if (!needle) return undefined;
    const direct = data.find((r) => r.insurerKey.toLowerCase() === needle);
    if (direct) return direct;
    return data.find((r) =>
      r.legacyAliasKeys.some((a) => a.toLowerCase() === needle),
    );
  }

  /**
   * BR-PLT-02 / L-SI-INR-07 — when effective catalog >0, reject unknown insurer key.
   * Empty effective = soft allow (U65 honesty; no fake starter).
   * Alias → canonical key (VAL-SI-INR-CNS-06).
   */
  async assertInsurerInEffectiveCatalog(input: {
    companyId: string;
    insurerKey: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<SiInsurerDisplay | null> {
    const raw = input.insurerKey.trim();
    if (!raw) {
      throw new ApiException(
        HRM_INS_INSURER_KEY,
        'insurer_key is required (insurers catalog code; free-text SoT forbidden)',
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
    const hit = this.findInEffective(effective.data, raw);
    if (!hit) {
      throw new ApiException(
        HRM_INS_INSURER_KEY,
        `insurer_key '${input.insurerKey}' is not in effective insurers catalog (free-text SoT forbidden)`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return hit;
  }

  /** F-SI-CAT-INS-01 list */
  async listInsurers(
    query: ListSiInsurersQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total: number; data: SiInsurerDisplay[] }> {
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
    const rows = await this.loadSiNativeRows(companyKeys, {
      includeArchived,
      status: query.status,
      q: query.q,
    });
    const data = rows.map((r) => this.display(r, 'si_native'));
    return { total: data.length, data };
  }

  /** F-SI-CAT-INS-01 get-by-id — same scope as list (U19). */
  async getInsurerById(
    insurerId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<SiInsurerDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const res = await this.db.query<SiInsurerRow>(
      `SELECT ${ROW_SELECT}
       FROM public.si_insurer
       WHERE id = $1::uuid
       LIMIT 1;`,
      [insurerId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_SI_INSURER_404,
        'Insurer not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_SI_INSURER_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return this.display(row, 'si_native');
  }

  /** F-SI-CAT-INS-02 create / upsert by (company_id, insurer_key). */
  async upsertInsurer(
    body: UpsertSiInsurerDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<SiInsurerDisplay> {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      body.companyId,
      { tenantId },
    );
    const insurerKey = this.assertKeyFormat(body.insurerKey);
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
    const aliasJson =
      body.legacyAliasKeys != null
        ? JSON.stringify(
            body.legacyAliasKeys
              .map((a) => String(a).trim())
              .filter((a) => a && SI_INSURER_KEY_FORMAT.test(a)),
          )
        : null;

    const existing = await this.db.query<SiInsurerRow>(
      `SELECT ${ROW_SELECT}
       FROM public.si_insurer
       WHERE company_id = $1 AND lower(insurer_key) = lower($2) AND archived_at IS NULL
       LIMIT 1;`,
      [companyId, insurerKey],
    );
    const hit = existing.rows[0];
    if (hit) {
      const updated = await this.db.query<SiInsurerRow>(
        `UPDATE public.si_insurer SET
           name_vi = $2,
           sort_order = $3,
           legacy_alias_keys_json = COALESCE($4::jsonb, legacy_alias_keys_json),
           metadata_json = COALESCE($5::jsonb, metadata_json),
           status = $6,
           updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING ${ROW_SELECT};`,
        [
          hit.id,
          nameVi,
          body.sortOrder ?? hit.sort_order ?? 100,
          aliasJson,
          metadataJson,
          status,
        ],
      );
      return this.display(updated.rows[0], 'si_native');
    }

    try {
      const inserted = await this.db.query<SiInsurerRow>(
        `INSERT INTO public.si_insurer (
           id, company_id, insurer_key, name_vi, sort_order,
           legacy_alias_keys_json, metadata_json, status
         ) VALUES (
           $1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8
         )
         RETURNING ${ROW_SELECT};`,
        [
          randomUUID(),
          companyId,
          insurerKey,
          nameVi,
          body.sortOrder ?? 100,
          aliasJson,
          metadataJson,
          status,
        ],
      );
      return this.display(inserted.rows[0], 'si_native');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_si_insurer_company_key_active|duplicate key/i.test(msg)) {
        throw new ApiException(
          HRM_PLT_CAT_CODE_CONFLICT,
          `Active insurer_key '${insurerKey}' already exists for company`,
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async patchInsurer(
    insurerId: string,
    companyId: string,
    body: PatchSiInsurerDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<SiInsurerDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<SiInsurerRow>(
      `SELECT ${ROW_SELECT}
       FROM public.si_insurer WHERE id = $1::uuid LIMIT 1;`,
      [insurerId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_SI_INSURER_404,
        'Insurer not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_SI_INSURER_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'Cannot patch archived insurer — create a new active key if needed',
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
    if (body.legacyAliasKeys !== undefined) {
      values.push(
        body.legacyAliasKeys == null
          ? null
          : JSON.stringify(
              body.legacyAliasKeys
                .map((a) => String(a).trim())
                .filter((a) => a && SI_INSURER_KEY_FORMAT.test(a)),
            ),
      );
      sets.push(`legacy_alias_keys_json = $${values.length}::jsonb`);
    }
    if (body.metadata !== undefined) {
      values.push(body.metadata == null ? null : JSON.stringify(body.metadata));
      sets.push(`metadata_json = $${values.length}::jsonb`);
    }
    if (body.status !== undefined)
      assign('status', this.assertStatus(body.status));

    if (!sets.length) {
      return this.display(row, 'si_native');
    }
    values.push(insurerId);
    const updated = await this.db.query<SiInsurerRow>(
      `UPDATE public.si_insurer
       SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}::uuid
       RETURNING ${ROW_SELECT};`,
      values,
    );
    return this.display(updated.rows[0], 'si_native');
  }

  /** Soft-delete — FORBIDDEN hard-delete (BR-PLT-04 · VAL-SI-INR-CAT-05). */
  async retireInsurer(
    insurerId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<SiInsurerDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<SiInsurerRow>(
      `SELECT ${ROW_SELECT}
       FROM public.si_insurer WHERE id = $1::uuid LIMIT 1;`,
      [insurerId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_SI_INSURER_404,
        'Insurer not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_SI_INSURER_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      return this.display(row, 'si_native');
    }
    const updated = await this.db.query<SiInsurerRow>(
      `UPDATE public.si_insurer
       SET status = 'retired', archived_at = NOW(), updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING ${ROW_SELECT};`,
      [insurerId],
    );
    return this.display(updated.rows[0], 'si_native');
  }
}
