/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công → Catalog ký hiệu công (`/attendance/attendance-codes`)
 * UC:         AC-PLT-ATT-CODE-01* · BR-PLT-02/04/05/06 · L-ATT-CODE-01..14
 * BR:         Open catalog · dual SoT REF+ATT · soft-delete · U19 scope_parity · invent KEY
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md §3–§5
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md §5–§6 F-ATT-CAT-CODE/EFF
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01.md §2
 * API_DESIGN: F-ATT-CAT-CODE-01..04 · F-ATT-CAT-CODE-EFF-01 · F-ATT-CODE-CNS-01
 * Purpose:    ensureSchema att_attendance_code + CRUD/retire + effective union (ATT wins) + consumer assert.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01
 * Coded:      2026-08-08
 * Callers:    attendance.controller · attendance.service create/update status assert
 * Callees:    HrmDbService · resolveHrmListScope · SettingsCatalogsService (group REF read)
 * FEActions:  Settings Ký hiệu công → list F5 → bảng ghi công chọn mã / invent → KEY
 * BEChain:    ensureSchema → scope filter → soft archive · effective merge no persist · DROP chk_attendance_status elsewhere
 * Impact:     Closed CHECK/IsIn restore = phá BR-PLT-05; write Settings REF = phá L-ATT-CODE-03; invent soft when EFF>0 = phá BR-PLT-02
 * must_keep:  att_leave_type / work_sites / work_shifts · sheet/sign · U65 empty [] OK ·
 *             FORBIDDEN hard-delete / CHECK code IN (…) / fold leave·worksite · L-ATT-CODE-07 aggregate sealed
 * SOLID:      Catalog CRUD tách TXN attendance_records · orthogonal to leave-type
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-be-01.md
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
  ATT_ATTENDANCE_CODE_CATALOG_KIND,
  ATT_ATTENDANCE_CODE_COUNTS_AS,
  ATT_ATTENDANCE_CODE_GROUP_REF_KEYS,
  ATT_ATTENDANCE_CODE_KEY_FORMAT,
  ATT_ATTENDANCE_CODE_STATUSES,
  HRM_ATT_CODE_404,
  HRM_ATT_CODE_KEY,
  HRM_PLT_CAT_CODE_CONFLICT,
  HRM_PLT_CAT_CODE_INVALID,
  type AttAttendanceCodeCountsAs,
  type AttAttendanceCodeRowStatus,
  type AttAttendanceCodeSource,
} from './att-attendance-code.constants';
import type {
  ListAttAttendanceCodesQueryDto,
  ListEffectiveAttAttendanceCodesQueryDto,
  PatchAttAttendanceCodeDto,
  UpsertAttAttendanceCodeDto,
} from './dto/att-attendance-code.dto';

type AttAttendanceCodeRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  symbol: string;
  sort_order: number;
  counts_as: string;
  day_weight: string | number;
  is_paid: boolean;
  is_present: boolean;
  color: string | null;
  legacy_alias_keys_json: unknown;
  metadata_json: Record<string, unknown> | string | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AttAttendanceCodeDisplay = {
  id: string;
  companyId: string;
  code: string;
  nameVi: string;
  /** Display-ready status_label alias (OS 28). */
  statusLabel: string;
  symbol: string;
  sortOrder: number;
  countsAs: AttAttendanceCodeCountsAs;
  dayWeight: number;
  isPaid: boolean;
  isPresent: boolean;
  color: string | null;
  legacyAliasKeys: string[];
  metadata: Record<string, unknown> | null;
  status: string;
  source: AttAttendanceCodeSource;
  catalogKind: typeof ATT_ATTENDANCE_CODE_CATALOG_KIND;
  archivedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

export type AttAttendanceCodeDisplayHints = {
  statusLabel: string;
  symbol: string;
};

type GroupRefCodeHint = {
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
  ): Promise<GroupRefCodeHint[]>;
};

const ROW_SELECT = `id, company_id, code, name_vi, symbol, sort_order,
              counts_as, day_weight, is_paid, is_present, color,
              legacy_alias_keys_json, metadata_json,
              status, archived_at, created_at, updated_at`;

@Injectable()
export class AttAttendanceCodeService {
  private schemaReady = false;

  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogPort,
    @Optional() private readonly moduleRef?: ModuleRef,
  ) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_attendance_code (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        symbol TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 100,
        counts_as TEXT NOT NULL DEFAULT 'other',
        day_weight NUMERIC(4,2) NOT NULL DEFAULT 1,
        is_paid BOOLEAN NOT NULL DEFAULT TRUE,
        is_present BOOLEAN NOT NULL DEFAULT FALSE,
        color TEXT NULL,
        legacy_alias_keys_json JSONB NULL,
        metadata_json JSONB NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_att_attendance_code_company_code_active
        ON public.att_attendance_code (company_id, lower(code))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_attendance_code_company_status
        ON public.att_attendance_code (company_id, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_attendance_code_company_sort
        ON public.att_attendance_code (company_id, sort_order);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_attendance_code_effective
        ON public.att_attendance_code (company_id)
        WHERE archived_at IS NULL AND status = 'active';
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_attendance_code_counts_as
        ON public.att_attendance_code (company_id, counts_as);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_attendance_code_is_present
        ON public.att_attendance_code (company_id, is_present);
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_attendance_code
          DROP CONSTRAINT IF EXISTS chk_att_att_code_format;
        ALTER TABLE public.att_attendance_code
          ADD CONSTRAINT chk_att_att_code_format
          CHECK (code ~ '^[a-z][a-z0-9_]*$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_attendance_code
          DROP CONSTRAINT IF EXISTS chk_att_att_code_symbol;
        ALTER TABLE public.att_attendance_code
          ADD CONSTRAINT chk_att_att_code_symbol
          CHECK (char_length(trim(symbol)) BETWEEN 1 AND 16);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_attendance_code
          DROP CONSTRAINT IF EXISTS chk_att_att_code_counts_as;
        ALTER TABLE public.att_attendance_code
          ADD CONSTRAINT chk_att_att_code_counts_as
          CHECK (counts_as IN ('work','paid_leave','unpaid_leave','holiday','absent','other'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_attendance_code
          DROP CONSTRAINT IF EXISTS chk_att_att_code_day_weight;
        ALTER TABLE public.att_attendance_code
          ADD CONSTRAINT chk_att_att_code_day_weight
          CHECK (day_weight > 0 AND day_weight <= 1);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_attendance_code
          DROP CONSTRAINT IF EXISTS chk_att_att_code_row_status;
        ALTER TABLE public.att_attendance_code
          ADD CONSTRAINT chk_att_att_code_row_status
          CHECK (status IN ('active','retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: never ADD CHECK code IN ('pending','present','absent','leave',…)
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
      .map((x) => String(x ?? '').trim().replace(/-/g, '_').toLowerCase())
      .filter((k) => !!k && ATT_ATTENDANCE_CODE_KEY_FORMAT.test(k));
  }

  private display(
    row: AttAttendanceCodeRow,
    source: AttAttendanceCodeSource,
  ): AttAttendanceCodeDisplay {
    const nameVi = row.name_vi;
    return {
      id: row.id,
      companyId: row.company_id,
      code: row.code,
      nameVi,
      statusLabel: nameVi,
      symbol: row.symbol,
      sortOrder: Number(row.sort_order ?? 100),
      countsAs: row.counts_as as AttAttendanceCodeCountsAs,
      dayWeight: Number(row.day_weight ?? 1),
      isPaid: row.is_paid !== false,
      isPresent: Boolean(row.is_present),
      color: row.color ?? null,
      legacyAliasKeys: this.parseAliasKeys(row.legacy_alias_keys_json),
      metadata: this.parseMeta(row.metadata_json),
      status: row.status,
      source,
      catalogKind: ATT_ATTENDANCE_CODE_CATALOG_KIND,
      archivedAt: row.archived_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }

  private assertKeyFormat(raw: string): string {
    const key = raw.trim().replace(/-/g, '_').toLowerCase();
    if (!key || !ATT_ATTENDANCE_CODE_KEY_FORMAT.test(key)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'code format invalid — expected ^[a-z][a-z0-9_]*$ after hyphen→underscore (format only; not a closed starter set)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  private assertSymbol(raw: string): string {
    const symbol = raw.trim();
    if (!symbol || symbol.length > 16) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'symbol must be 1..16 characters after trim',
        HttpStatus.BAD_REQUEST,
      );
    }
    return symbol;
  }

  private assertCountsAs(raw: string): AttAttendanceCodeCountsAs {
    const v = raw.trim().toLowerCase() as AttAttendanceCodeCountsAs;
    if (!(ATT_ATTENDANCE_CODE_COUNTS_AS as readonly string[]).includes(v)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `countsAs must be one of ${ATT_ATTENDANCE_CODE_COUNTS_AS.join(',')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return v;
  }

  private assertDayWeight(raw: number): number {
    if (!Number.isFinite(raw) || raw <= 0 || raw > 1) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'dayWeight must be > 0 and <= 1',
        HttpStatus.BAD_REQUEST,
      );
    }
    return raw;
  }

  private assertRowStatus(raw: string): AttAttendanceCodeRowStatus {
    const s = raw.trim().toLowerCase() as AttAttendanceCodeRowStatus;
    if (!(ATT_ATTENDANCE_CODE_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `status must be one of ${ATT_ATTENDANCE_CODE_STATUSES.join(',')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return s;
  }

  private resolveScope(authorization: string | undefined, requestedCompanyId: string, tenantId?: string) {
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId, { tenantId });
    const companyKeys = expandHrmTextCompanyIds(scope, authorization, requestedCompanyId);
    return { scope, companyKeys, scopeCompanyId };
  }

  private async loadNativeRows(
    companyKeys: string[],
    opts?: {
      includeArchived?: boolean;
      status?: string;
      q?: string;
    },
  ): Promise<AttAttendanceCodeRow[]> {
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
        `(lower(code) LIKE $${values.length} OR lower(name_vi) LIKE $${values.length} OR lower(symbol) LIKE $${values.length})`,
      );
    }
    const res = await this.db.query<AttAttendanceCodeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.att_attendance_code
       WHERE ${filters.join(' AND ')}
       ORDER BY sort_order ASC, code ASC;`,
      values,
    );
    return res.rows;
  }

  private mapGroupRefItem(
    item: GroupRefCodeHint,
    companyId: string,
  ): AttAttendanceCodeDisplay | null {
    const codeRaw = String(item.code ?? '').trim().replace(/-/g, '_').toLowerCase();
    if (!codeRaw || !ATT_ATTENDANCE_CODE_KEY_FORMAT.test(codeRaw)) {
      return null;
    }
    if (String(item.status ?? '').toLowerCase() !== 'active') {
      return null;
    }
    const meta = item.metadata && typeof item.metadata === 'object' ? item.metadata : null;
    const nameVi = String(item.label ?? item.name ?? codeRaw).trim() || codeRaw;
    const symbolRaw = String(meta?.symbol ?? codeRaw).trim() || codeRaw;
    const symbol = symbolRaw.slice(0, 16);
    const countsAsRaw = String(meta?.counts_as ?? meta?.countsAs ?? 'other')
      .trim()
      .toLowerCase();
    const countsAs = (ATT_ATTENDANCE_CODE_COUNTS_AS as readonly string[]).includes(countsAsRaw)
      ? (countsAsRaw as AttAttendanceCodeCountsAs)
      : 'other';
    const now = new Date().toISOString();
    return {
      id: `group-ref:${companyId}:${codeRaw}`,
      companyId,
      code: codeRaw,
      nameVi,
      statusLabel: nameVi,
      symbol,
      sortOrder: Number(meta?.sort_order ?? meta?.sortOrder ?? 100),
      countsAs,
      dayWeight: Number(meta?.day_weight ?? meta?.dayWeight ?? 1),
      isPaid: meta?.is_paid !== false && meta?.isPaid !== false,
      isPresent: Boolean(meta?.is_present ?? meta?.isPresent),
      color: meta?.color != null ? String(meta.color) : null,
      legacyAliasKeys: [],
      metadata: meta,
      status: 'active',
      source: 'group_ref',
      catalogKind: ATT_ATTENDANCE_CODE_CATALOG_KIND,
      archivedAt: null,
      updatedAt: now,
      createdAt: now,
    };
  }

  /**
   * F-ATT-CAT-CODE-EFF-01 — ATT native + settings attendance_codes REF; ATT wins.
   */
  async listEffective(
    query: ListEffectiveAttAttendanceCodesQueryDto,
    authorization?: string,
    options?: { tenantId?: string },
  ): Promise<{ total: number; data: AttAttendanceCodeDisplay[] }> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(authorization, query.company_id, options?.tenantId);
    const attRows = await this.loadNativeRows(companyKeys, {
      includeArchived: false,
      status: 'active',
      q: query.q,
    });
    const byKey = new Map<string, AttAttendanceCodeDisplay>();
    for (const row of attRows) {
      byKey.set(row.code.toLowerCase(), this.display(row, 'att_native'));
    }

    const settings = this.resolveSettingsCatalogs();
    if (settings) {
      const tenantId = options?.tenantId?.trim() || masterTenantIdFromEnv() || 'xevn';
      const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
        authorization,
        tenantId,
        query.company_id,
      );
      const q = query.q?.trim().toLowerCase();
      for (const catalogKey of ATT_ATTENDANCE_CODE_GROUP_REF_KEYS) {
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
              !mapped.code.includes(q) &&
              !mapped.nameVi.toLowerCase().includes(q) &&
              !mapped.symbol.toLowerCase().includes(q)
            ) {
              continue;
            }
            const existing = byKey.get(mapped.code);
            if (existing) {
              byKey.set(mapped.code, { ...existing, source: 'att_override' });
            } else {
              byKey.set(mapped.code, mapped);
            }
          }
        } catch {
          // REF unavailable — ATT-only effective set is still valid.
        }
      }
    }

    const data = [...byKey.values()].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code),
    );
    return { total: data.length, data };
  }

  /**
   * Label/symbol lookup for OS 28 display-ready — maps canonical keys + aliases.
   * Empty EFF → empty map (caller keeps hardcode bootstrap).
   */
  async buildCodeDisplayLookup(
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<Map<string, AttAttendanceCodeDisplayHints>> {
    const effective = await this.listEffective({ company_id: companyId }, authorization, {
      tenantId,
    });
    const map = new Map<string, AttAttendanceCodeDisplayHints>();
    for (const row of effective.data) {
      const hints = { statusLabel: row.statusLabel, symbol: row.symbol };
      map.set(row.code.toLowerCase(), hints);
      for (const alias of row.legacyAliasKeys) {
        if (!map.has(alias)) {
          map.set(alias, hints);
        }
      }
    }
    return map;
  }

  /**
   * F-ATT-CODE-CNS-01 / VAL-ATT-CODE-CNS-01 — when effective catalog >0, reject invent day-code.
   * Empty effective = soft allow (U65; no fake starter). Alias → canonical.
   */
  async assertCodeInEffectiveCatalog(input: {
    companyId: string;
    code: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<AttAttendanceCodeDisplay | null> {
    const key = input.code.trim().replace(/-/g, '_').toLowerCase();
    if (!key) {
      throw new ApiException(HRM_ATT_CODE_KEY, 'status/day-code is required', HttpStatus.BAD_REQUEST);
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
      effective.data.find((r) => r.code === key) ??
      effective.data.find((r) => r.legacyAliasKeys.includes(key));
    if (!hit) {
      throw new ApiException(
        HRM_ATT_CODE_KEY,
        `status '${input.code}' is not in effective attendance-code catalog (free-text invent forbidden when EFF ≠ empty)`,
        HttpStatus.BAD_REQUEST,
        { status: input.code, key },
      );
    }
    return hit;
  }

  /** F-ATT-CAT-CODE-01 list */
  async listAttendanceCodes(
    query: ListAttAttendanceCodesQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total: number; data: AttAttendanceCodeDisplay[] }> {
    await this.ensureSchema();
    const includeGroupRef = String(query.include_group_ref ?? '').toLowerCase() === 'true';
    if (includeGroupRef) {
      return this.listEffective(
        { company_id: query.company_id, q: query.q },
        authorization,
        { tenantId },
      );
    }
    const { companyKeys } = this.resolveScope(authorization, query.company_id, tenantId);
    const includeArchived = String(query.include_archived ?? '').toLowerCase() === 'true';
    const rows = await this.loadNativeRows(companyKeys, {
      includeArchived,
      status: query.status,
      q: query.q,
    });
    const data = rows.map((r) => this.display(r, 'att_native'));
    return { total: data.length, data };
  }

  /** F-ATT-CAT-CODE-01 get-by-id — same scope as list (U19). */
  async getAttendanceCodeById(
    codeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttAttendanceCodeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const res = await this.db.query<AttAttendanceCodeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.att_attendance_code
       WHERE id = $1::uuid
       LIMIT 1;`,
      [codeId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(HRM_ATT_CODE_404, 'Attendance code not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_CODE_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return this.display(row, 'att_native');
  }

  /** F-ATT-CAT-CODE-02 create / upsert — tenant writer only. */
  async upsertAttendanceCode(
    body: UpsertAttAttendanceCodeDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttAttendanceCodeDisplay> {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, body.companyId, { tenantId });
    const code = this.assertKeyFormat(body.code);
    const nameVi = body.nameVi.trim();
    if (!nameVi) {
      throw new ApiException(HRM_PLT_CAT_CODE_INVALID, 'nameVi is required', HttpStatus.BAD_REQUEST);
    }
    const symbol = this.assertSymbol(body.symbol);
    const countsAs = body.countsAs ? this.assertCountsAs(body.countsAs) : 'other';
    const dayWeight =
      body.dayWeight !== undefined ? this.assertDayWeight(Number(body.dayWeight)) : 1;
    const status = body.status ? this.assertRowStatus(body.status) : 'active';
    const metadataJson = body.metadata != null ? JSON.stringify(body.metadata) : null;
    const aliasJson =
      body.legacyAliasKeys != null
        ? JSON.stringify(
            body.legacyAliasKeys
              .map((k) => this.assertKeyFormat(k))
              .filter((k) => k !== code),
          )
        : null;
    const sortOrder = body.sortOrder ?? 100;

    const existing = await this.db.query<AttAttendanceCodeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.att_attendance_code
       WHERE company_id = $1 AND lower(code) = lower($2) AND archived_at IS NULL
       LIMIT 1;`,
      [companyId, code],
    );
    const hit = existing.rows[0];
    if (hit) {
      const updated = await this.db.query<AttAttendanceCodeRow>(
        `UPDATE public.att_attendance_code SET
           name_vi = $2,
           symbol = $3,
           sort_order = $4,
           counts_as = $5,
           day_weight = $6,
           is_paid = $7,
           is_present = $8,
           color = $9,
           legacy_alias_keys_json = COALESCE($10::jsonb, legacy_alias_keys_json),
           metadata_json = $11::jsonb,
           status = $12,
           updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING ${ROW_SELECT};`,
        [
          hit.id,
          nameVi,
          symbol,
          sortOrder,
          countsAs,
          dayWeight,
          body.isPaid ?? true,
          body.isPresent ?? false,
          body.color?.trim() || null,
          aliasJson,
          metadataJson,
          status,
        ],
      );
      return this.display(updated.rows[0], 'att_native');
    }

    try {
      const inserted = await this.db.query<AttAttendanceCodeRow>(
        `INSERT INTO public.att_attendance_code (
           id, company_id, code, name_vi, symbol, sort_order,
           counts_as, day_weight, is_paid, is_present, color,
           legacy_alias_keys_json, metadata_json, status
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14
         )
         RETURNING ${ROW_SELECT};`,
        [
          randomUUID(),
          companyId,
          code,
          nameVi,
          symbol,
          sortOrder,
          countsAs,
          dayWeight,
          body.isPaid ?? true,
          body.isPresent ?? false,
          body.color?.trim() || null,
          aliasJson,
          metadataJson,
          status,
        ],
      );
      return this.display(inserted.rows[0], 'att_native');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_att_attendance_code_company_code_active|duplicate key/i.test(msg)) {
        throw new ApiException(
          HRM_PLT_CAT_CODE_CONFLICT,
          `Active code '${code}' already exists for company`,
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async patchAttendanceCode(
    codeId: string,
    companyId: string,
    body: PatchAttAttendanceCodeDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttAttendanceCodeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<AttAttendanceCodeRow>(
      `SELECT ${ROW_SELECT} FROM public.att_attendance_code WHERE id = $1::uuid LIMIT 1;`,
      [codeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(HRM_ATT_CODE_404, 'Attendance code not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_CODE_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'Cannot patch archived attendance code — create a new active key if needed',
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
    if (body.symbol !== undefined) assign('symbol', this.assertSymbol(body.symbol));
    if (body.sortOrder !== undefined) assign('sort_order', body.sortOrder);
    if (body.countsAs !== undefined) assign('counts_as', this.assertCountsAs(body.countsAs));
    if (body.dayWeight !== undefined) assign('day_weight', this.assertDayWeight(Number(body.dayWeight)));
    if (body.isPaid !== undefined) assign('is_paid', body.isPaid);
    if (body.isPresent !== undefined) assign('is_present', body.isPresent);
    if (body.color !== undefined) {
      assign('color', body.color == null ? null : String(body.color).trim() || null);
    }
    if (body.legacyAliasKeys !== undefined) {
      values.push(
        body.legacyAliasKeys == null
          ? null
          : JSON.stringify(body.legacyAliasKeys.map((k) => this.assertKeyFormat(k))),
      );
      sets.push(`legacy_alias_keys_json = $${values.length}::jsonb`);
    }
    if (body.metadata !== undefined) {
      values.push(body.metadata == null ? null : JSON.stringify(body.metadata));
      sets.push(`metadata_json = $${values.length}::jsonb`);
    }
    if (body.status !== undefined) assign('status', this.assertRowStatus(body.status));

    if (!sets.length) {
      return this.display(row, 'att_native');
    }
    const patchValues = [...values, codeId];
    const updated = await this.db.query<AttAttendanceCodeRow>(
      `UPDATE public.att_attendance_code
       SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${patchValues.length}::uuid
       RETURNING ${ROW_SELECT};`,
      patchValues,
    );
    return this.display(updated.rows[0], 'att_native');
  }

  /** Soft-delete — FORBIDDEN hard-delete (BR-PLT-04 · L-ATT-CODE-11). */
  async retireAttendanceCode(
    codeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttAttendanceCodeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<AttAttendanceCodeRow>(
      `SELECT ${ROW_SELECT} FROM public.att_attendance_code WHERE id = $1::uuid LIMIT 1;`,
      [codeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(HRM_ATT_CODE_404, 'Attendance code not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_CODE_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    const updated = await this.db.query<AttAttendanceCodeRow>(
      `UPDATE public.att_attendance_code
       SET status = 'retired', archived_at = NOW(), updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING ${ROW_SELECT};`,
      [codeId],
    );
    return this.display(updated.rows[0], 'att_native');
  }
}
