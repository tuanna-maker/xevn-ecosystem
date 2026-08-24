/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công → Catalog loại phép (`/attendance/leave-types`)
 * UC:         AC-PLT-ATT-01..03 · FR-UC-BP-ATT-04/09 · BR-PLT-02/04/05/06
 * BR:         Open catalog · dual SoT REF+ATT · soft-delete · U19 scope_parity
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md §2 · §2.5
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md §3 F-ATT-CAT-*
 * DB_DESIGN:  docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §4.4
 * API_DESIGN: F-ATT-CAT-LVT-01/02 · F-ATT-CAT-EFF-01
 * Purpose:    ensureSchema att_leave_type + CRUD/retire + effective union (ATT wins collision).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01
 * Coded:      2026-08-07
 * Callers:    attendance.controller · LeaveRequestsService (R-PLT-ATT-01)
 * Callees:    HrmDbService · resolveHrmListScope · SettingsCatalogsService (group REF read)
 * FEActions:  Settings Tạo loại phép → list F5 → form nộp phép chọn mã mới
 * BEChain:    ensureSchema → scope filter → soft archive · effective merge no persist
 * Impact:     Closed enum reject 9th key = phá BR-PLT-05; hard-delete = phá history
 * must_keep:  work_shifts ops · sheet/sign spine · settings-catalogs leave_types REF ·
 *             U65 empty [] OK · FORBIDDEN hard-delete / CHECK leave_type_key IN (…)
 * SOLID:      Catalog CRUD tách TXN leave_requests / sheet
 * LastVerified: docs/qa/evidence/po-hrm-settings-att-lvt-sot-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01
 * WorkItem: PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01
 * change_mode: FIX (bridge only — core LVT/EFF retained from ATT-BE-01)
 * What: HRM-SC-01 dual SoT documented; settings leave_types REF key constant parity test
 * must_keep: F-ATT-CAT-LVT/EFF · open catalog · scope_parity · U65 empty OK
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-MVP-GD1-ATT-08-CLUSTER-BE-01
 * change_mode: ADD
 * What: Soft typed att_leave_type.unit day|hour (Q-LEAVE-UNIT) · display unit on EFF/list
 * must_keep: open catalog · soft-delete · Nest /core DENY · ≠ ATT-08 DONE alone · CFG≠ATT-02
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
  ATT_LEAVE_TYPE_CATALOG_KIND,
  ATT_LEAVE_TYPE_CATEGORIES,
  ATT_LEAVE_TYPE_KEY_FORMAT,
  ATT_LEAVE_TYPE_STATUSES,
  ATT_LEAVE_TYPES_GROUP_REF_KEY,
  HRM_ATT_LVT_404,
  HRM_LEAVE_TYPE_UNKNOWN,
  HRM_PLT_CAT_CODE_CONFLICT,
  HRM_PLT_CAT_CODE_INVALID,
  type AttLeaveTypeCategory,
  type AttLeaveTypeSource,
  type AttLeaveTypeStatus,
} from './att-leave-type.constants';
import type {
  ListAttLeaveTypesQueryDto,
  ListEffectiveAttLeaveTypesQueryDto,
  PatchAttLeaveTypeDto,
  UpsertAttLeaveTypeDto,
} from './dto/att-leave-type.dto';

type AttLeaveTypeRow = {
  id: string;
  company_id: string;
  leave_type_key: string;
  name_vi: string;
  category: string;
  is_paid: boolean;
  allows_carry_over: boolean;
  allows_advance: boolean;
  insurance_regime_flag: boolean;
  company_topup_flag: boolean;
  counts_toward_timesheet: boolean;
  unit?: string | null;
  metadata_json: Record<string, unknown> | string | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AttLeaveTypeDisplay = {
  id: string;
  companyId: string;
  leaveTypeKey: string;
  nameVi: string;
  category: string;
  isPaid: boolean;
  allowsCarryOver: boolean;
  allowsAdvance: boolean;
  insuranceRegimeFlag: boolean;
  companyTopupFlag: boolean;
  countsTowardTimesheet: boolean;
  /** Q-LEAVE-UNIT — day | hour (ATT-08 residual). */
  unit: 'day' | 'hour';
  metadata: Record<string, unknown> | null;
  status: string;
  source: AttLeaveTypeSource;
  catalogKind: typeof ATT_LEAVE_TYPE_CATALOG_KIND;
  archivedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

type GroupRefLeaveHint = {
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
  ): Promise<GroupRefLeaveHint[]>;
};

@Injectable()
export class AttLeaveTypeService {
  private schemaReady = false;

  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogPort,
    @Optional() private readonly moduleRef?: ModuleRef,
  ) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_leave_type (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        leave_type_key TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        category TEXT NOT NULL,
        is_paid BOOLEAN NOT NULL DEFAULT TRUE,
        allows_carry_over BOOLEAN NOT NULL DEFAULT FALSE,
        allows_advance BOOLEAN NOT NULL DEFAULT FALSE,
        insurance_regime_flag BOOLEAN NOT NULL DEFAULT FALSE,
        company_topup_flag BOOLEAN NOT NULL DEFAULT FALSE,
        counts_toward_timesheet BOOLEAN NOT NULL DEFAULT TRUE,
        max_days_per_year INT NULL,
        allow_half_day BOOLEAN NOT NULL DEFAULT TRUE,
        description TEXT NULL,
        metadata_json JSONB NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_att_leave_type_company_key_active
        ON public.att_leave_type (company_id, lower(leave_type_key))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_leave_type_company_status
        ON public.att_leave_type (company_id, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_leave_type_company_category
        ON public.att_leave_type (company_id, category);
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_leave_type
          DROP CONSTRAINT IF EXISTS chk_att_leave_type_key_format;
        ALTER TABLE public.att_leave_type
          ADD CONSTRAINT chk_att_leave_type_key_format
          CHECK (leave_type_key ~ '^[a-z][a-z0-9_]*$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_leave_type
          DROP CONSTRAINT IF EXISTS chk_att_leave_type_category;
        ALTER TABLE public.att_leave_type
          ADD CONSTRAINT chk_att_leave_type_category
          CHECK (category IN ('annual','seniority','ot_comp','carry_over','advance','sick','other'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_leave_type
          DROP CONSTRAINT IF EXISTS chk_att_leave_type_status;
        ALTER TABLE public.att_leave_type
          ADD CONSTRAINT chk_att_leave_type_status
          CHECK (status IN ('active','retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: never ADD CHECK leave_type_key IN ('annual','sick','LVT_01',…)
    // Q-LEAVE-UNIT residual (ATT-08) — soft typed col; metadata bridge ≠ SoT forever.
    await this.db.query(`
      ALTER TABLE public.att_leave_type
      ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'day';
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_leave_type
          DROP CONSTRAINT IF EXISTS chk_att_leave_type_unit;
        ALTER TABLE public.att_leave_type
          ADD CONSTRAINT chk_att_leave_type_unit
          CHECK (unit IN ('day','hour'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      ALTER TABLE public.att_leave_type
      ADD COLUMN IF NOT EXISTS max_days_per_year INT NULL,
      ADD COLUMN IF NOT EXISTS allow_half_day BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS description TEXT NULL;
    `);
    this.schemaReady = true;
  }

  private resolveUnit(
    row: AttLeaveTypeRow,
    meta: Record<string, unknown> | null,
  ): 'day' | 'hour' {
    const fromCol = String(row.unit ?? '')
      .trim()
      .toLowerCase();
    if (fromCol === 'hour' || fromCol === 'day') {
      return fromCol;
    }
    const fromMeta = String(meta?.unit ?? '')
      .trim()
      .toLowerCase();
    return fromMeta === 'hour' ? 'hour' : 'day';
  }

  private assertUnit(raw: string | undefined): 'day' | 'hour' {
    if (raw == null || !String(raw).trim()) {
      return 'day';
    }
    const u = String(raw).trim().toLowerCase();
    if (u !== 'day' && u !== 'hour') {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        "unit must be 'day' or 'hour' (Q-LEAVE-UNIT)",
        HttpStatus.BAD_REQUEST,
      );
    }
    return u;
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
    row: AttLeaveTypeRow,
    source: AttLeaveTypeSource,
  ): AttLeaveTypeDisplay {
    const metadata = this.parseMeta(row.metadata_json);
    return {
      id: row.id,
      companyId: row.company_id,
      leaveTypeKey: row.leave_type_key,
      nameVi: row.name_vi,
      category: row.category,
      isPaid: row.is_paid !== false,
      allowsCarryOver: Boolean(row.allows_carry_over),
      allowsAdvance: Boolean(row.allows_advance),
      insuranceRegimeFlag: Boolean(row.insurance_regime_flag),
      companyTopupFlag: Boolean(row.company_topup_flag),
      countsTowardTimesheet: row.counts_toward_timesheet !== false,
      unit: this.resolveUnit(row, metadata),
      metadata,
      status: row.status,
      source,
      catalogKind: ATT_LEAVE_TYPE_CATALOG_KIND,
      archivedAt: row.archived_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }

  private assertKeyFormat(raw: string): string {
    // VAL-ATT-LVT-02 — validate before lowercasing; uppercase `Annual` must 400.
    const key = raw.trim();
    if (!key || !ATT_LEAVE_TYPE_KEY_FORMAT.test(key)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'leaveTypeKey format invalid — expected ^[a-z][a-z0-9_]*$ (format only; not a closed starter set)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  private assertCategory(raw: string): AttLeaveTypeCategory {
    const c = raw.trim().toLowerCase() as AttLeaveTypeCategory;
    if (!(ATT_LEAVE_TYPE_CATEGORIES as readonly string[]).includes(c)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `category must be one of ${ATT_LEAVE_TYPE_CATEGORIES.join(',')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return c;
  }

  private assertStatus(raw: string): AttLeaveTypeStatus {
    const s = raw.trim().toLowerCase() as AttLeaveTypeStatus;
    if (!(ATT_LEAVE_TYPE_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `status must be one of ${ATT_LEAVE_TYPE_STATUSES.join(',')}`,
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

  private async loadAttNativeRows(
    companyKeys: string[],
    opts?: {
      includeArchived?: boolean;
      status?: string;
      category?: string;
      q?: string;
    },
  ): Promise<AttLeaveTypeRow[]> {
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
    if (opts?.category?.trim()) {
      values.push(opts.category.trim().toLowerCase());
      filters.push(`category = $${values.length}`);
    }
    if (opts?.q?.trim()) {
      values.push(`%${opts.q.trim().toLowerCase()}%`);
      filters.push(
        `(lower(leave_type_key) LIKE $${values.length} OR lower(name_vi) LIKE $${values.length})`,
      );
    }
    const res = await this.db.query<AttLeaveTypeRow>(
      `SELECT id, company_id, leave_type_key, name_vi, category,
              is_paid, allows_carry_over, allows_advance, insurance_regime_flag,
              company_topup_flag, counts_toward_timesheet, unit, metadata_json,
              status, archived_at, created_at, updated_at
       FROM public.att_leave_type
       WHERE ${filters.join(' AND ')}
       ORDER BY leave_type_key ASC;`,
      values,
    );
    return res.rows;
  }

  private mapGroupRefItem(
    item: GroupRefLeaveHint,
    companyId: string,
  ): AttLeaveTypeDisplay | null {
    const code = String(item.code ?? '')
      .trim()
      .toLowerCase();
    if (!code || !ATT_LEAVE_TYPE_KEY_FORMAT.test(code)) {
      return null;
    }
    if (String(item.status ?? '').toLowerCase() !== 'active') {
      return null;
    }
    const meta =
      item.metadata && typeof item.metadata === 'object' ? item.metadata : null;
    const categoryRaw = String(meta?.category ?? 'other').toLowerCase();
    const category = (ATT_LEAVE_TYPE_CATEGORIES as readonly string[]).includes(
      categoryRaw,
    )
      ? categoryRaw
      : 'other';
    const nameVi = String(item.label ?? item.name ?? code).trim() || code;
    const now = new Date().toISOString();
    return {
      id: `group-ref:${companyId}:${code}`,
      companyId,
      leaveTypeKey: code,
      nameVi,
      category,
      isPaid: meta?.is_paid !== false && meta?.isPaid !== false,
      allowsCarryOver: Boolean(
        meta?.allows_carry_over ?? meta?.allowsCarryOver,
      ),
      allowsAdvance: Boolean(meta?.allows_advance ?? meta?.allowsAdvance),
      insuranceRegimeFlag: Boolean(
        meta?.insurance_regime_flag ??
        meta?.insuranceRegimeFlag ??
        meta?.is_sick,
      ),
      companyTopupFlag: Boolean(
        meta?.company_topup_flag ?? meta?.companyTopupFlag,
      ),
      countsTowardTimesheet:
        meta?.counts_toward_timesheet !== false &&
        meta?.countsTowardTimesheet !== false,
      unit:
        String(meta?.unit ?? 'day').toLowerCase() === 'hour' ? 'hour' : 'day',
      metadata: meta,
      status: 'active',
      source: 'group_ref',
      catalogKind: ATT_LEAVE_TYPE_CATALOG_KIND,
      archivedAt: null,
      updatedAt: now,
      createdAt: now,
    };
  }

  /**
   * F-ATT-CAT-EFF-01 — ATT native + settings leave_types REF; ATT wins on same leave_type_key.
   */
  async listEffective(
    query: ListEffectiveAttLeaveTypesQueryDto,
    authorization?: string,
    options?: { tenantId?: string },
  ): Promise<{ total: number; data: AttLeaveTypeDisplay[] }> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(
      authorization,
      query.company_id,
      options?.tenantId,
    );
    const attRows = await this.loadAttNativeRows(companyKeys, {
      includeArchived: false,
      status: 'active',
      q: query.q,
    });
    const byKey = new Map<string, AttLeaveTypeDisplay>();
    for (const row of attRows) {
      byKey.set(
        row.leave_type_key.toLowerCase(),
        this.display(row, 'att_native'),
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
          ATT_LEAVE_TYPES_GROUP_REF_KEY,
        );
        const q = query.q?.trim().toLowerCase();
        for (const item of items ?? []) {
          const mapped = this.mapGroupRefItem(item, catalogCompanyId);
          if (!mapped) continue;
          if (
            q &&
            !mapped.leaveTypeKey.includes(q) &&
            !mapped.nameVi.toLowerCase().includes(q)
          ) {
            continue;
          }
          const existing = byKey.get(mapped.leaveTypeKey);
          if (existing) {
            // Collision: ATT wins — stamp override source for FE transparency.
            byKey.set(mapped.leaveTypeKey, {
              ...existing,
              source: 'att_override',
            });
          } else {
            byKey.set(mapped.leaveTypeKey, mapped);
          }
        }
      } catch {
        // REF unavailable — ATT-only effective set is still valid.
      }
    }

    const data = [...byKey.values()].sort((a, b) =>
      a.leaveTypeKey.localeCompare(b.leaveTypeKey),
    );
    return { total: data.length, data };
  }

  /**
   * R-PLT-ATT-01 / BR-PLT-02 — when effective catalog >0, reject unknown leave_type.
   * Empty effective = soft allow (U65 honesty; no fake starter).
   */
  async assertLeaveTypeInEffectiveCatalog(input: {
    companyId: string;
    leaveType: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<AttLeaveTypeDisplay | null> {
    const key = input.leaveType.trim().toLowerCase();
    if (!key) {
      throw new ApiException(
        HRM_LEAVE_TYPE_UNKNOWN,
        'leave_type is required',
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
    const hit = effective.data.find((r) => r.leaveTypeKey === key);
    if (!hit) {
      throw new ApiException(
        HRM_LEAVE_TYPE_UNKNOWN,
        `leave_type '${input.leaveType}' is not in effective leave catalog (free-text SoT forbidden)`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return hit;
  }

  /** F-ATT-CAT-LVT-01 list */
  async listLeaveTypes(
    query: ListAttLeaveTypesQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total: number; data: AttLeaveTypeDisplay[] }> {
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
    const rows = await this.loadAttNativeRows(companyKeys, {
      includeArchived,
      status: query.status,
      category: query.category,
      q: query.q,
    });
    const data = rows.map((r) => this.display(r, 'att_native'));
    return { total: data.length, data };
  }

  /** F-ATT-CAT-LVT-01 get-by-id — same scope as list (U19). */
  async getLeaveTypeById(
    leaveTypeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttLeaveTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const res = await this.db.query<AttLeaveTypeRow>(
      `SELECT id, company_id, leave_type_key, name_vi, category,
              is_paid, allows_carry_over, allows_advance, insurance_regime_flag,
              company_topup_flag, counts_toward_timesheet, unit, metadata_json,
              status, archived_at, created_at, updated_at
       FROM public.att_leave_type
       WHERE id = $1::uuid
       LIMIT 1;`,
      [leaveTypeId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_ATT_LVT_404,
        'Leave type not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_LVT_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return this.display(row, 'att_native');
  }

  /** F-ATT-CAT-LVT-02 create / upsert by (company_id, leave_type_key). */
  async upsertLeaveType(
    body: UpsertAttLeaveTypeDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttLeaveTypeDisplay> {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      body.companyId,
      { tenantId },
    );
    const leaveTypeKey = this.assertKeyFormat(body.leaveTypeKey);
    const category = this.assertCategory(body.category);
    const nameVi = body.nameVi.trim();
    if (!nameVi) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'nameVi is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const status = body.status ? this.assertStatus(body.status) : 'active';
    const unit = this.assertUnit(body.unit);
    const metadataJson =
      body.metadata != null ? JSON.stringify(body.metadata) : null;

    const existing = await this.db.query<AttLeaveTypeRow>(
      `SELECT id, company_id, leave_type_key, name_vi, category,
              is_paid, allows_carry_over, allows_advance, insurance_regime_flag,
              company_topup_flag, counts_toward_timesheet, unit, metadata_json,
              status, archived_at, created_at, updated_at
       FROM public.att_leave_type
       WHERE company_id = $1 AND lower(leave_type_key) = lower($2) AND archived_at IS NULL
       LIMIT 1;`,
      [companyId, leaveTypeKey],
    );
    const hit = existing.rows[0];
    if (hit) {
      const updated = await this.db.query<AttLeaveTypeRow>(
        `UPDATE public.att_leave_type SET
           name_vi = $2,
           category = $3,
           is_paid = $4,
           allows_carry_over = $5,
           allows_advance = $6,
           insurance_regime_flag = $7,
           company_topup_flag = $8,
           counts_toward_timesheet = $9,
           unit = $10,
           metadata_json = $11::jsonb,
           status = $12,
           updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING id, company_id, leave_type_key, name_vi, category,
                   is_paid, allows_carry_over, allows_advance, insurance_regime_flag,
                   company_topup_flag, counts_toward_timesheet, unit, metadata_json,
                   status, archived_at, created_at, updated_at;`,
        [
          hit.id,
          nameVi,
          category,
          body.isPaid ?? true,
          body.allowsCarryOver ?? false,
          body.allowsAdvance ?? false,
          body.insuranceRegimeFlag ?? false,
          body.companyTopupFlag ?? false,
          body.countsTowardTimesheet ?? true,
          unit,
          metadataJson,
          status,
        ],
      );
      return this.display(updated.rows[0], 'att_native');
    }

    try {
      const inserted = await this.db.query<AttLeaveTypeRow>(
        `INSERT INTO public.att_leave_type (
           id, company_id, leave_type_key, name_vi, category,
           is_paid, allows_carry_over, allows_advance, insurance_regime_flag,
           company_topup_flag, counts_toward_timesheet, unit, metadata_json, status
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14
         )
         RETURNING id, company_id, leave_type_key, name_vi, category,
                   is_paid, allows_carry_over, allows_advance, insurance_regime_flag,
                   company_topup_flag, counts_toward_timesheet, unit, metadata_json,
                   status, archived_at, created_at, updated_at;`,
        [
          randomUUID(),
          companyId,
          leaveTypeKey,
          nameVi,
          category,
          body.isPaid ?? true,
          body.allowsCarryOver ?? false,
          body.allowsAdvance ?? false,
          body.insuranceRegimeFlag ?? false,
          body.companyTopupFlag ?? false,
          body.countsTowardTimesheet ?? true,
          unit,
          metadataJson,
          status,
        ],
      );
      return this.display(inserted.rows[0], 'att_native');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_att_leave_type_company_key_active|duplicate key/i.test(msg)) {
        throw new ApiException(
          HRM_PLT_CAT_CODE_CONFLICT,
          `Active leave_type_key '${leaveTypeKey}' already exists for company`,
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async patchLeaveType(
    leaveTypeId: string,
    companyId: string,
    body: PatchAttLeaveTypeDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttLeaveTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<AttLeaveTypeRow>(
      `SELECT id, company_id, leave_type_key, name_vi, category,
              is_paid, allows_carry_over, allows_advance, insurance_regime_flag,
              company_topup_flag, counts_toward_timesheet, unit, metadata_json,
              status, archived_at, created_at, updated_at
       FROM public.att_leave_type WHERE id = $1::uuid LIMIT 1;`,
      [leaveTypeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_ATT_LVT_404,
        'Leave type not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_LVT_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'Cannot patch archived leave type — create a new active key if needed',
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
    if (body.category !== undefined)
      assign('category', this.assertCategory(body.category));
    if (body.isPaid !== undefined) assign('is_paid', body.isPaid);
    if (body.allowsCarryOver !== undefined)
      assign('allows_carry_over', body.allowsCarryOver);
    if (body.allowsAdvance !== undefined)
      assign('allows_advance', body.allowsAdvance);
    if (body.insuranceRegimeFlag !== undefined) {
      assign('insurance_regime_flag', body.insuranceRegimeFlag);
    }
    if (body.companyTopupFlag !== undefined)
      assign('company_topup_flag', body.companyTopupFlag);
    if (body.countsTowardTimesheet !== undefined) {
      assign('counts_toward_timesheet', body.countsTowardTimesheet);
    }
    if (body.unit !== undefined) {
      assign('unit', this.assertUnit(body.unit));
    }
    if (body.metadata !== undefined) {
      values.push(body.metadata == null ? null : JSON.stringify(body.metadata));
      sets.push(`metadata_json = $${values.length}::jsonb`);
    }
    if (body.status !== undefined)
      assign('status', this.assertStatus(body.status));

    if (!sets.length) {
      return this.display(row, 'att_native');
    }
    values.push(leaveTypeId);
    const updated = await this.db.query<AttLeaveTypeRow>(
      `UPDATE public.att_leave_type
       SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}::uuid
       RETURNING id, company_id, leave_type_key, name_vi, category,
                 is_paid, allows_carry_over, allows_advance, insurance_regime_flag,
                 company_topup_flag, counts_toward_timesheet, unit, metadata_json,
                 status, archived_at, created_at, updated_at;`,
      values,
    );
    return this.display(updated.rows[0], 'att_native');
  }

  /** Soft-delete — FORBIDDEN hard-delete (BR-PLT-04). */
  async retireLeaveType(
    leaveTypeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttLeaveTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<AttLeaveTypeRow>(
      `SELECT id, company_id, leave_type_key, name_vi, category,
              is_paid, allows_carry_over, allows_advance, insurance_regime_flag,
              company_topup_flag, counts_toward_timesheet, unit, metadata_json,
              status, archived_at, created_at, updated_at
       FROM public.att_leave_type WHERE id = $1::uuid LIMIT 1;`,
      [leaveTypeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_ATT_LVT_404,
        'Leave type not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_LVT_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      return this.display(row, 'att_native');
    }
    const updated = await this.db.query<AttLeaveTypeRow>(
      `UPDATE public.att_leave_type
       SET status = 'retired', archived_at = NOW(), updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING id, company_id, leave_type_key, name_vi, category,
                 is_paid, allows_carry_over, allows_advance, insurance_regime_flag,
                 company_topup_flag, counts_toward_timesheet, unit, metadata_json,
                 status, archived_at, created_at, updated_at;`,
      [leaveTypeId],
    );
    return this.display(updated.rows[0], 'att_native');
  }
}
