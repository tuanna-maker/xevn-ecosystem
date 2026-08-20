/**
 * @CODE-MEMORY
 * Screen:     HRM → Quyết định / Settings → Catalog loại QSĐ (`/decisions/decision-types`)
 * UC:         AC-PLT-DEC-01..06 · FR-UC-BP-CORE-01a · BR-PLT-02/04/05/06 · BR-PLT-DEC-*
 * BR:         Open catalog · dual SoT REF+DEC · soft-delete · U19 scope_parity · typed flags SoT
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md §2 · §2.4 · §5
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md §3 F-DEC-CAT-*
 * DB_DESIGN:  docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.11a
 * API_DESIGN: F-DEC-CAT-TYP-01/02 · F-DEC-CAT-EFF-01
 * Purpose:    ensureSchema hr_decision_type + CRUD/retire + effective union (DEC wins collision).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01
 * Coded:      2026-08-07
 * Callers:    decisions.controller · DecisionsService (R-PLT-DEC-01)
 * Callees:    HrmDbService · resolveHrmListScope · SettingsCatalogsService (group REF read)
 * FEActions:  Settings Tạo loại QSĐ → list F5 → form tạo quyết định chọn mã mới
 * BEChain:    ensureSchema → scope filter → soft archive · effective merge no persist
 * Impact:     Closed enum reject Nth key = phá BR-PLT-05; hard-delete = phá history QSĐ
 * must_keep:  F-CORE-DEC create/approve/effective→WH · settings hr_decision_types REF ·
 *             EMP DOC/ET · ATT leave · REC stages · CTR contract_types OUT · U65 empty [] OK ·
 *             FORBIDDEN hard-delete / CHECK decision_type_key IN (…) / mutate REF via DEC API
 * SOLID:      Catalog CRUD tách TXN hr_decisions / WH spine
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-be-01.md
 *
 * solid_convention_ack:
 *   FE–BE boundary: catalog DTOs display-ready; consumer assert ∈ effective; typed flags not JSON SoT
 *   display-ready: nameVi · decisionTypeKey · flags · source on list/get
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
  HR_DECISION_TYPE_CATALOG_KIND,
  HR_DECISION_TYPE_KEY_FORMAT,
  HR_DECISION_TYPE_STATUSES,
  HR_DECISION_TYPES_GROUP_REF_KEY,
  HRM_DEC_TYPE_UNKNOWN,
  HRM_DEC_TYP_404,
  HRM_DEC_TYP_WH_REQUIRED,
  HRM_PLT_CAT_CODE_CONFLICT,
  HRM_PLT_CAT_CODE_INVALID,
  HRM_VAL_400,
  type HrDecisionTypeSource,
  type HrDecisionTypeStatus,
} from './hr-decision-type.constants';
import type {
  ListEffectiveHrDecisionTypesQueryDto,
  ListHrDecisionTypesQueryDto,
  PatchHrDecisionTypeDto,
  UpsertHrDecisionTypeDto,
} from './dto/hr-decision-type.dto';

type HrDecisionTypeRow = {
  id: string;
  company_id: string;
  decision_type_key: string;
  name_vi: string;
  sort_order: number;
  is_person_bound: boolean;
  writes_work_history: boolean;
  wh_event_type: string | null;
  requires_position_key: boolean;
  legacy_alias_keys_json: string[] | string | null;
  color_token: string | null;
  metadata_json: Record<string, unknown> | string | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type HrDecisionTypeDisplay = {
  id: string;
  companyId: string;
  decisionTypeKey: string;
  nameVi: string;
  sortOrder: number;
  isPersonBound: boolean;
  writesWorkHistory: boolean;
  whEventType: string | null;
  requiresPositionKey: boolean;
  legacyAliasKeys: string[] | null;
  colorToken: string | null;
  metadata: Record<string, unknown> | null;
  status: string;
  source: HrDecisionTypeSource;
  catalogKind: typeof HR_DECISION_TYPE_CATALOG_KIND;
  archivedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

type GroupRefDecisionHint = {
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
  ): Promise<GroupRefDecisionHint[]>;
};

const ROW_SELECT = `id, company_id, decision_type_key, name_vi, sort_order,
              is_person_bound, writes_work_history, wh_event_type, requires_position_key,
              legacy_alias_keys_json, color_token, metadata_json,
              status, archived_at, created_at, updated_at`;

@Injectable()
export class HrDecisionTypeService {
  private schemaReady = false;

  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogPort,
    @Optional() private readonly moduleRef?: ModuleRef,
  ) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hr_decision_type (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        decision_type_key TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 100,
        is_person_bound BOOLEAN NOT NULL DEFAULT FALSE,
        writes_work_history BOOLEAN NOT NULL DEFAULT FALSE,
        wh_event_type TEXT NULL,
        requires_position_key BOOLEAN NOT NULL DEFAULT FALSE,
        legacy_alias_keys_json JSONB NULL,
        color_token TEXT NULL,
        metadata_json JSONB NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hr_decision_type_company_key_active
        ON public.hr_decision_type (company_id, lower(decision_type_key))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hr_decision_type_company_status
        ON public.hr_decision_type (company_id, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hr_decision_type_company_sort
        ON public.hr_decision_type (company_id, sort_order);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hr_decision_type_company_person_bound
        ON public.hr_decision_type (company_id, is_person_bound)
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hr_decision_type
          DROP CONSTRAINT IF EXISTS chk_hr_decision_type_key_format;
        ALTER TABLE public.hr_decision_type
          ADD CONSTRAINT chk_hr_decision_type_key_format
          CHECK (decision_type_key ~ '^[a-zA-Z][a-zA-Z0-9_]*$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hr_decision_type
          DROP CONSTRAINT IF EXISTS chk_hr_decision_type_status;
        ALTER TABLE public.hr_decision_type
          ADD CONSTRAINT chk_hr_decision_type_status
          CHECK (status IN ('active','retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hr_decision_type
          DROP CONSTRAINT IF EXISTS chk_hr_decision_type_wh_flags;
        ALTER TABLE public.hr_decision_type
          ADD CONSTRAINT chk_hr_decision_type_wh_flags
          CHECK (
            (writes_work_history = false)
            OR (
              is_person_bound = true
              AND wh_event_type IS NOT NULL
              AND length(trim(wh_event_type)) > 0
            )
          );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: never ADD CHECK decision_type_key IN ('appointment','HRD_01',…)
    // FORBIDDEN: never ADD closed CHECK on hr_decisions.decision_type
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
      // eslint-disable-next-line @typescript-eslint/no-require-imports
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

  private parseAliases(raw: unknown): string[] | null {
    if (raw == null) return null;
    if (Array.isArray(raw)) {
      return raw.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
    }
    if (typeof raw === 'string') {
      try {
        const p = JSON.parse(raw) as unknown;
        if (Array.isArray(p)) {
          return p.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
        }
      } catch {
        /* ignore */
      }
    }
    return null;
  }

  private display(
    row: HrDecisionTypeRow,
    source: HrDecisionTypeSource,
  ): HrDecisionTypeDisplay {
    return {
      id: row.id,
      companyId: row.company_id,
      decisionTypeKey: row.decision_type_key,
      nameVi: row.name_vi,
      sortOrder: Number(row.sort_order ?? 100),
      isPersonBound: Boolean(row.is_person_bound),
      writesWorkHistory: Boolean(row.writes_work_history),
      whEventType: row.wh_event_type?.trim() || null,
      requiresPositionKey: Boolean(row.requires_position_key),
      legacyAliasKeys: this.parseAliases(row.legacy_alias_keys_json),
      colorToken: row.color_token,
      metadata: this.parseMeta(row.metadata_json),
      status: row.status,
      source,
      catalogKind: HR_DECISION_TYPE_CATALOG_KIND,
      archivedAt: row.archived_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }

  private assertKeyFormat(raw: string): string {
    const key = raw.trim();
    if (!key || !HR_DECISION_TYPE_KEY_FORMAT.test(key)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'decisionTypeKey format invalid — expected ^[a-zA-Z][a-zA-Z0-9_]*$ (format only; not a closed starter/HRD set)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  private assertStatus(raw: string): HrDecisionTypeStatus {
    const s = raw.trim().toLowerCase() as HrDecisionTypeStatus;
    if (!(HR_DECISION_TYPE_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `status must be one of ${HR_DECISION_TYPE_STATUSES.join(',')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return s;
  }

  /** VAL-DEC-CAT-06/07 — writes_work_history ⇒ person_bound + wh_event_type. */
  private assertWhFlags(input: {
    isPersonBound: boolean;
    writesWorkHistory: boolean;
    whEventType: string | null | undefined;
  }): string | null {
    if (!input.writesWorkHistory) {
      return input.whEventType?.trim() || null;
    }
    if (!input.isPersonBound) {
      throw new ApiException(
        HRM_VAL_400,
        'writesWorkHistory=true requires isPersonBound=true',
        HttpStatus.BAD_REQUEST,
      );
    }
    const wh = input.whEventType?.trim() ?? '';
    if (!wh) {
      throw new ApiException(
        HRM_VAL_400,
        'writesWorkHistory=true requires whEventType',
        HttpStatus.BAD_REQUEST,
      );
    }
    return wh;
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

  private async loadDecNativeRows(
    companyKeys: string[],
    opts?: {
      includeArchived?: boolean;
      status?: string;
      q?: string;
      personBoundOnly?: boolean;
    },
  ): Promise<HrDecisionTypeRow[]> {
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
    if (opts?.personBoundOnly) {
      filters.push('is_person_bound = TRUE');
    }
    if (opts?.q?.trim()) {
      values.push(`%${opts.q.trim().toLowerCase()}%`);
      filters.push(
        `(lower(decision_type_key) LIKE $${values.length} OR lower(name_vi) LIKE $${values.length})`,
      );
    }
    const res = await this.db.query<HrDecisionTypeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.hr_decision_type
       WHERE ${filters.join(' AND ')}
       ORDER BY sort_order ASC, decision_type_key ASC;`,
      values,
    );
    return res.rows;
  }

  private mapGroupRefItem(
    item: GroupRefDecisionHint,
    companyId: string,
  ): HrDecisionTypeDisplay | null {
    const code = String(item.code ?? '').trim();
    if (!code || !HR_DECISION_TYPE_KEY_FORMAT.test(code)) {
      return null;
    }
    if (String(item.status ?? '').toLowerCase() !== 'active') {
      return null;
    }
    const meta =
      item.metadata && typeof item.metadata === 'object' ? item.metadata : null;
    const nameVi = String(item.label ?? item.name ?? code).trim() || code;
    const now = new Date().toISOString();
    const isPersonBound = Boolean(
      meta?.is_person_bound ?? meta?.isPersonBound ?? meta?.person_bound,
    );
    const writesWorkHistory = Boolean(
      meta?.writes_work_history ?? meta?.writesWorkHistory,
    );
    const whEventType =
      String(meta?.wh_event_type ?? meta?.whEventType ?? '').trim() || null;
    const requiresPositionKey =
      meta?.requires_position_key != null || meta?.requiresPositionKey != null
        ? Boolean(meta?.requires_position_key ?? meta?.requiresPositionKey)
        : writesWorkHistory;
    return {
      id: `group-ref:${companyId}:${code.toLowerCase()}`,
      companyId,
      decisionTypeKey: code,
      nameVi,
      sortOrder: Number(meta?.sort_order ?? meta?.sortOrder ?? 100),
      isPersonBound,
      writesWorkHistory,
      whEventType,
      requiresPositionKey,
      legacyAliasKeys: null,
      colorToken: meta?.color_token != null ? String(meta.color_token) : null,
      metadata: meta,
      status: 'active',
      source: 'group_ref',
      catalogKind: HR_DECISION_TYPE_CATALOG_KIND,
      archivedAt: null,
      updatedAt: now,
      createdAt: now,
    };
  }

  /**
   * F-DEC-CAT-EFF-01 — DEC native + settings hr_decision_types REF; DEC wins on same key.
   */
  async listEffective(
    query: ListEffectiveHrDecisionTypesQueryDto,
    authorization?: string,
    options?: { tenantId?: string },
  ): Promise<{
    total: number;
    data: HrDecisionTypeDisplay[];
    personBoundKeys: string[];
    workHistoryNeoKeys: string[];
  }> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(
      authorization,
      query.company_id,
      options?.tenantId,
    );
    const personBoundOnly =
      String(query.person_bound_only ?? '').toLowerCase() === 'true';
    const decRows = await this.loadDecNativeRows(companyKeys, {
      includeArchived: false,
      status: 'active',
      q: query.q,
      personBoundOnly,
    });
    const byKey = new Map<string, HrDecisionTypeDisplay>();
    for (const row of decRows) {
      byKey.set(
        row.decision_type_key.toLowerCase(),
        this.display(row, 'dec_native'),
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
          HR_DECISION_TYPES_GROUP_REF_KEY,
        );
        const q = query.q?.trim().toLowerCase();
        for (const item of items ?? []) {
          const mapped = this.mapGroupRefItem(item, catalogCompanyId);
          if (!mapped) continue;
          if (personBoundOnly && !mapped.isPersonBound) continue;
          if (
            q &&
            !mapped.decisionTypeKey.toLowerCase().includes(q) &&
            !mapped.nameVi.toLowerCase().includes(q)
          ) {
            continue;
          }
          const k = mapped.decisionTypeKey.toLowerCase();
          const existing = byKey.get(k);
          if (existing) {
            byKey.set(k, { ...existing, source: 'dec_override' });
          } else {
            byKey.set(k, mapped);
          }
        }
      } catch {
        // REF unavailable — DEC-only effective set is still valid.
      }
    }

    const data = [...byKey.values()].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.decisionTypeKey.localeCompare(b.decisionTypeKey);
    });
    const personBoundKeys = data
      .filter((r) => r.isPersonBound)
      .map((r) => r.decisionTypeKey.toLowerCase());
    const workHistoryNeoKeys = data
      .filter((r) => r.writesWorkHistory)
      .map((r) => r.decisionTypeKey.toLowerCase());
    return { total: data.length, data, personBoundKeys, workHistoryNeoKeys };
  }

  private matchesKeyOrAlias(
    row: HrDecisionTypeDisplay,
    needle: string,
  ): boolean {
    const n = needle.toLowerCase();
    if (row.decisionTypeKey.toLowerCase() === n) return true;
    return (row.legacyAliasKeys ?? []).some((a) => a === n);
  }

  /**
   * R-PLT-DEC-01 / BR-PLT-02 — when effective catalog >0, reject unknown decision_type.
   * Empty effective = soft allow (BR-PLT-DEC-06 · U65; no fake starter).
   * Resolves legacy aliases → canonical row.
   */
  async assertDecisionTypeInEffectiveCatalog(input: {
    companyId: string;
    decisionType: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<HrDecisionTypeDisplay | null> {
    const key = input.decisionType.trim();
    if (!key) {
      throw new ApiException(
        HRM_DEC_TYPE_UNKNOWN,
        'decision_type is required',
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
    const hit = effective.data.find((r) => this.matchesKeyOrAlias(r, key));
    if (!hit) {
      throw new ApiException(
        HRM_DEC_TYPE_UNKNOWN,
        `decision_type '${input.decisionType}' is not in effective decision-type catalog (free-text SoT forbidden)`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return hit;
  }

  /** F-DEC-CAT-TYP-01 list */
  async listDecisionTypes(
    query: ListHrDecisionTypesQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total: number; data: HrDecisionTypeDisplay[] }> {
    await this.ensureSchema();
    const includeGroupRef =
      String(query.include_group_ref ?? '').toLowerCase() === 'true';
    if (includeGroupRef) {
      const eff = await this.listEffective(
        {
          company_id: query.company_id,
          q: query.q,
          person_bound_only: query.person_bound_only,
        },
        authorization,
        { tenantId },
      );
      return { total: eff.total, data: eff.data };
    }
    const { companyKeys } = this.resolveScope(
      authorization,
      query.company_id,
      tenantId,
    );
    const includeArchived =
      String(query.include_archived ?? '').toLowerCase() === 'true';
    const personBoundOnly =
      String(query.person_bound_only ?? '').toLowerCase() === 'true';
    const rows = await this.loadDecNativeRows(companyKeys, {
      includeArchived,
      status: query.status,
      q: query.q,
      personBoundOnly,
    });
    const data = rows.map((r) => this.display(r, 'dec_native'));
    return { total: data.length, data };
  }

  /** F-DEC-CAT-TYP-01 get-by-id — same scope as list (U19). */
  async getDecisionTypeById(
    decisionTypeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<HrDecisionTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const res = await this.db.query<HrDecisionTypeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.hr_decision_type
       WHERE id = $1::uuid
       LIMIT 1;`,
      [decisionTypeId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_DEC_TYP_404,
        'Decision type not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_DEC_TYP_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return this.display(row, 'dec_native');
  }

  /** F-DEC-CAT-TYP-02 create / upsert by (company_id, decision_type_key). Tenant writer only. */
  async upsertDecisionType(
    body: UpsertHrDecisionTypeDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<HrDecisionTypeDisplay> {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      body.companyId,
      { tenantId },
    );
    const decisionTypeKey = this.assertKeyFormat(body.decisionTypeKey);
    const nameVi = body.nameVi.trim();
    if (!nameVi) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'nameVi is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const writesWorkHistory = body.writesWorkHistory ?? false;
    const isPersonBound = body.isPersonBound ?? false;
    const whEventType = this.assertWhFlags({
      isPersonBound,
      writesWorkHistory,
      whEventType: body.whEventType,
    });
    const requiresPositionKey =
      body.requiresPositionKey ?? (writesWorkHistory ? true : false);
    const status = body.status ? this.assertStatus(body.status) : 'active';
    const sortOrder = body.sortOrder ?? 100;
    const metadataJson =
      body.metadata != null ? JSON.stringify(body.metadata) : null;
    const aliasJson =
      body.legacyAliasKeys != null
        ? JSON.stringify(
            body.legacyAliasKeys
              .map((k) => k.trim().toLowerCase())
              .filter(Boolean),
          )
        : null;

    const existing = await this.db.query<HrDecisionTypeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.hr_decision_type
       WHERE company_id = $1 AND lower(decision_type_key) = lower($2) AND archived_at IS NULL
       LIMIT 1;`,
      [companyId, decisionTypeKey],
    );
    const hit = existing.rows[0];
    if (hit) {
      const updated = await this.db.query<HrDecisionTypeRow>(
        `UPDATE public.hr_decision_type SET
           name_vi = $2,
           sort_order = $3,
           is_person_bound = $4,
           writes_work_history = $5,
           wh_event_type = $6,
           requires_position_key = $7,
           legacy_alias_keys_json = $8::jsonb,
           color_token = $9,
           metadata_json = $10::jsonb,
           status = $11,
           updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING ${ROW_SELECT};`,
        [
          hit.id,
          nameVi,
          sortOrder,
          isPersonBound,
          writesWorkHistory,
          whEventType,
          requiresPositionKey,
          aliasJson,
          body.colorToken?.trim() || null,
          metadataJson,
          status,
        ],
      );
      return this.display(updated.rows[0], 'dec_native');
    }

    try {
      const inserted = await this.db.query<HrDecisionTypeRow>(
        `INSERT INTO public.hr_decision_type (
           id, company_id, decision_type_key, name_vi, sort_order,
           is_person_bound, writes_work_history, wh_event_type, requires_position_key,
           legacy_alias_keys_json, color_token, metadata_json, status
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12::jsonb, $13
         )
         RETURNING ${ROW_SELECT};`,
        [
          randomUUID(),
          companyId,
          decisionTypeKey,
          nameVi,
          sortOrder,
          isPersonBound,
          writesWorkHistory,
          whEventType,
          requiresPositionKey,
          aliasJson,
          body.colorToken?.trim() || null,
          metadataJson,
          status,
        ],
      );
      return this.display(inserted.rows[0], 'dec_native');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        /uq_hr_decision_type_company_key_active|duplicate key|chk_hr_decision_type_wh_flags/i.test(
          msg,
        )
      ) {
        if (/chk_hr_decision_type_wh_flags/i.test(msg)) {
          throw new ApiException(
            HRM_VAL_400,
            'writesWorkHistory requires isPersonBound and whEventType',
            HttpStatus.BAD_REQUEST,
          );
        }
        throw new ApiException(
          HRM_PLT_CAT_CODE_CONFLICT,
          `Active decision_type_key '${decisionTypeKey}' already exists for company`,
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async patchDecisionType(
    decisionTypeId: string,
    companyId: string,
    body: PatchHrDecisionTypeDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<HrDecisionTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<HrDecisionTypeRow>(
      `SELECT ${ROW_SELECT} FROM public.hr_decision_type WHERE id = $1::uuid LIMIT 1;`,
      [decisionTypeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_DEC_TYP_404,
        'Decision type not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_DEC_TYP_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'Cannot patch archived decision type — create a new active key if needed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const nextIsPersonBound =
      body.isPersonBound !== undefined
        ? body.isPersonBound
        : Boolean(row.is_person_bound);
    const nextWritesWh =
      body.writesWorkHistory !== undefined
        ? body.writesWorkHistory
        : Boolean(row.writes_work_history);
    const nextWh =
      body.whEventType !== undefined ? body.whEventType : row.wh_event_type;
    this.assertWhFlags({
      isPersonBound: nextIsPersonBound,
      writesWorkHistory: nextWritesWh,
      whEventType: nextWh,
    });

    const sets: string[] = [];
    const values: unknown[] = [];
    const assign = (col: string, value: unknown) => {
      values.push(value);
      sets.push(`${col} = $${values.length}`);
    };
    if (body.nameVi !== undefined) assign('name_vi', body.nameVi.trim());
    if (body.sortOrder !== undefined) assign('sort_order', body.sortOrder);
    if (body.isPersonBound !== undefined)
      assign('is_person_bound', body.isPersonBound);
    if (body.writesWorkHistory !== undefined)
      assign('writes_work_history', body.writesWorkHistory);
    if (body.whEventType !== undefined) {
      assign('wh_event_type', body.whEventType?.trim() || null);
    }
    if (body.requiresPositionKey !== undefined) {
      assign('requires_position_key', body.requiresPositionKey);
    }
    if (body.legacyAliasKeys !== undefined) {
      values.push(
        body.legacyAliasKeys == null
          ? null
          : JSON.stringify(
              body.legacyAliasKeys
                .map((k) => k.trim().toLowerCase())
                .filter(Boolean),
            ),
      );
      sets.push(`legacy_alias_keys_json = $${values.length}::jsonb`);
    }
    if (body.colorToken !== undefined)
      assign('color_token', body.colorToken?.trim() || null);
    if (body.metadata !== undefined) {
      values.push(body.metadata == null ? null : JSON.stringify(body.metadata));
      sets.push(`metadata_json = $${values.length}::jsonb`);
    }
    if (body.status !== undefined)
      assign('status', this.assertStatus(body.status));

    if (!sets.length) {
      return this.display(row, 'dec_native');
    }
    values.push(decisionTypeId);
    try {
      const updated = await this.db.query<HrDecisionTypeRow>(
        `UPDATE public.hr_decision_type
         SET ${sets.join(', ')}, updated_at = NOW()
         WHERE id = $${values.length}::uuid
         RETURNING ${ROW_SELECT};`,
        values,
      );
      return this.display(updated.rows[0], 'dec_native');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/chk_hr_decision_type_wh_flags/i.test(msg)) {
        throw new ApiException(
          HRM_VAL_400,
          'writesWorkHistory requires isPersonBound and whEventType',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw err;
    }
  }

  /** Soft-delete — FORBIDDEN hard-delete (BR-PLT-04). */
  async retireDecisionType(
    decisionTypeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<HrDecisionTypeDisplay> {
    await this.ensureSchema();
    const { scope, companyKeys } = this.resolveScope(
      authorization,
      companyId,
      tenantId,
    );
    const existing = await this.db.query<HrDecisionTypeRow>(
      `SELECT ${ROW_SELECT} FROM public.hr_decision_type WHERE id = $1::uuid LIMIT 1;`,
      [decisionTypeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_DEC_TYP_404,
        'Decision type not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_DEC_TYP_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      return this.display(row, 'dec_native');
    }

    // VAL-DEC-CAT-10 — last active WH-producing type.
    if (row.writes_work_history) {
      const filters: string[] = [
        "status = 'active'",
        'archived_at IS NULL',
        'writes_work_history = TRUE',
        'id <> $1::uuid',
      ];
      const values: unknown[] = [decisionTypeId];
      pushCompanyIdTextColumnFilter(filters, values, companyKeys);
      const peers = await this.db.query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM public.hr_decision_type WHERE ${filters.join(' AND ')};`,
        values,
      );
      const remaining = Number(peers.rows[0]?.c ?? 0);
      if (remaining < 1) {
        throw new ApiException(
          HRM_DEC_TYP_WH_REQUIRED,
          'Cannot retire the last active writes_work_history decision type — create a replacement first',
          HttpStatus.PRECONDITION_FAILED,
        );
      }
    }

    const updated = await this.db.query<HrDecisionTypeRow>(
      `UPDATE public.hr_decision_type
       SET status = 'retired', archived_at = NOW(), updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING ${ROW_SELECT};`,
      [decisionTypeId],
    );
    return this.display(updated.rows[0], 'dec_native');
  }
}
