/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công → Catalog loại tăng ca (`/attendance/ot-types`)
 * UC:         AC-PLT-ATT-OT-01* · BR-PLT-02/04/05/06 · L-ATT-OT-01..15
 * BR:         Open catalog · soft-delete · U19 scope_parity · invent KEY · default_coeff display-only
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01.md §3–§5
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md Option B
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01.md §2
 * API_DESIGN: F-ATT-CAT-OT-01/02 · EFF · consumer HRM-ATT-OT-TYPE-KEY
 * Purpose:    ensureSchema att_ot_type + CRUD/retire + effective picker + consumer invent assert.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01
 * Coded:      2026-08-08
 * Callers:    attendance.controller · AttendanceRequestsService.createOvertimeRequest
 * Callees:    HrmDbService · resolveHrmListScope
 * FEActions:  Admin Loại tăng ca → list F5 → OT create picker / invent → KEY
 * BEChain:    ensureSchema → scope filter → soft archive · EFF active · CNS invent KEY
 * Impact:     Closed IsIn(3)/CHECK code IN = phá BR-PLT-05; invent soft when EFF>0 = phá BR-PLT-02;
 *             claim default_coeff = formula LIVE = phá L-ATT-OT-10
 * must_keep:  overtime_requests.overtime_type TEXT · leave/code/worksite/shifts seals ·
 *             U65 empty [] OK · FORBIDDEN hard-delete / fold / seed / formula LIVE
 * SOLID:      Catalog CRUD tách TXN overtime_requests
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-be-01.md
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandHrmTextCompanyIds,
  normalizePayrollListCompanyId,
  pushCompanyIdTextColumnFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import {
  ATT_OT_TYPE_CATALOG_KIND,
  ATT_OT_TYPE_KEY_FORMAT,
  ATT_OT_TYPE_STATUSES,
  HRM_ATT_OT_404,
  HRM_ATT_OT_409,
  HRM_ATT_OT_TYPE_KEY,
  HRM_ATT_OT_VAL,
  HRM_PLT_CAT_CODE_CONFLICT,
  type AttOtTypeRowStatus,
  type AttOtTypeSource,
} from './att-ot-type.constants';
import type {
  ListAttOtTypesQueryDto,
  ListEffectiveAttOtTypesQueryDto,
  PatchAttOtTypeDto,
  UpsertAttOtTypeDto,
} from './dto/att-ot-type.dto';

type AttOtTypeRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  name_en: string | null;
  default_coeff: string | number;
  sort_order: number;
  color: string | null;
  metadata_json: Record<string, unknown> | string | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AttOtTypeDisplay = {
  id: string;
  companyId: string;
  code: string;
  nameVi: string;
  nameEn: string | null;
  /** Display-ready default hệ số — ≠ payroll formula LIVE (L-ATT-OT-10). */
  defaultCoeff: number;
  /** BA synonym of defaultCoeff. */
  defaultCoefficient: number;
  sortOrder: number;
  color: string | null;
  metadata: Record<string, unknown> | null;
  status: string;
  source: AttOtTypeSource;
  catalogKind: typeof ATT_OT_TYPE_CATALOG_KIND;
  archivedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

const ROW_SELECT = `id, company_id, code, name_vi, name_en, default_coeff, sort_order,
              color, metadata_json, status, archived_at, created_at, updated_at`;

@Injectable()
export class AttOtTypeService {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_ot_type (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        name_en TEXT NULL,
        default_coeff NUMERIC(6,2) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 100,
        color TEXT NULL,
        metadata_json JSONB NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_att_ot_type_company_code_active
        ON public.att_ot_type (company_id, lower(code))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_ot_type_company_status
        ON public.att_ot_type (company_id, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_ot_type_company_sort
        ON public.att_ot_type (company_id, sort_order);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_ot_type_effective
        ON public.att_ot_type (company_id)
        WHERE archived_at IS NULL AND status = 'active';
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_ot_type
          DROP CONSTRAINT IF EXISTS chk_att_ot_type_code_format;
        ALTER TABLE public.att_ot_type
          ADD CONSTRAINT chk_att_ot_type_code_format
          CHECK (code ~ '^[a-z][a-z0-9_]*$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_ot_type
          DROP CONSTRAINT IF EXISTS chk_att_ot_type_name_vi;
        ALTER TABLE public.att_ot_type
          ADD CONSTRAINT chk_att_ot_type_name_vi
          CHECK (char_length(trim(name_vi)) BETWEEN 1 AND 128);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_ot_type
          DROP CONSTRAINT IF EXISTS chk_att_ot_type_default_coeff;
        ALTER TABLE public.att_ot_type
          ADD CONSTRAINT chk_att_ot_type_default_coeff
          CHECK (default_coeff >= 0);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_ot_type
          DROP CONSTRAINT IF EXISTS chk_att_ot_type_row_status;
        ALTER TABLE public.att_ot_type
          ADD CONSTRAINT chk_att_ot_type_row_status
          CHECK (status IN ('active','inactive'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: never ADD CHECK code IN ('weekday','weekend','holiday')
    // U65: optional starter upsert omitted — empty catalog is valid.
    this.schemaReady = true;
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

  private toCoeff(raw: string | number): number {
    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(n) ? n : 1;
  }

  private display(row: AttOtTypeRow, source: AttOtTypeSource = 'att_native'): AttOtTypeDisplay {
    const coeff = this.toCoeff(row.default_coeff);
    return {
      id: row.id,
      companyId: row.company_id,
      code: row.code,
      nameVi: row.name_vi,
      nameEn: row.name_en,
      defaultCoeff: coeff,
      defaultCoefficient: coeff,
      sortOrder: Number(row.sort_order) || 100,
      color: row.color,
      metadata: this.parseMeta(row.metadata_json),
      status: row.status,
      source,
      catalogKind: ATT_OT_TYPE_CATALOG_KIND,
      archivedAt: row.archived_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }

  private assertKeyFormat(raw: string): string {
    const key = raw.trim();
    if (!key || !ATT_OT_TYPE_KEY_FORMAT.test(key)) {
      throw new ApiException(
        HRM_ATT_OT_VAL,
        'code format invalid — expected ^[a-z][a-z0-9_]*$ (format only; not a closed starter set)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  private assertStatus(raw: string): AttOtTypeRowStatus {
    const s = raw.trim().toLowerCase() as AttOtTypeRowStatus;
    if (!(ATT_OT_TYPE_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException(
        HRM_ATT_OT_VAL,
        `status must be one of ${ATT_OT_TYPE_STATUSES.join(',')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return s;
  }

  private assertCoeff(raw: number): number {
    if (!Number.isFinite(raw) || raw < 0) {
      throw new ApiException(
        HRM_ATT_OT_VAL,
        'defaultCoeff must be >= 0 (display-ready default; not payroll formula)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return raw;
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
      includeInactive?: boolean;
      status?: string;
      q?: string;
    },
  ): Promise<AttOtTypeRow[]> {
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdTextColumnFilter(filters, values, companyKeys);
    if (!opts?.includeInactive) {
      filters.push('archived_at IS NULL');
    }
    if (opts?.status?.trim()) {
      values.push(opts.status.trim().toLowerCase());
      filters.push(`status = $${values.length}`);
    } else if (!opts?.includeInactive) {
      filters.push(`status = 'active'`);
    }
    if (opts?.q?.trim()) {
      values.push(`%${opts.q.trim().toLowerCase()}%`);
      filters.push(
        `(lower(code) LIKE $${values.length} OR lower(name_vi) LIKE $${values.length})`,
      );
    }
    const res = await this.db.query<AttOtTypeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.att_ot_type
       WHERE ${filters.join(' AND ')}
       ORDER BY sort_order ASC, code ASC;`,
      values,
    );
    return res.rows;
  }

  /** F-ATT-CAT-OT-01 effective picker — active + not archived. Empty [] OK (U65). */
  async listEffective(
    query: ListEffectiveAttOtTypesQueryDto,
    authorization?: string,
    opts?: { tenantId?: string },
  ): Promise<{ total: number; data: AttOtTypeDisplay[] }> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(
      authorization,
      query.company_id,
      opts?.tenantId,
    );
    const rows = await this.loadNativeRows(companyKeys, {
      status: 'active',
      q: query.q,
    });
    const data = rows.map((r) => this.display(r));
    return { total: data.length, data };
  }

  /**
   * VAL-ATT-OT-CNS-01 / AC-PLT-ATT-OT-01b — when EFF >0, reject invent overtime_type.
   * Empty EFF = soft skip (AC-PLT-ATT-OT-01c · U65 · no seed).
   */
  async assertOtTypeInEffectiveCatalog(input: {
    companyId: string;
    overtimeType: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<AttOtTypeDisplay | null> {
    const key = input.overtimeType.trim().toLowerCase();
    if (!key) {
      throw new ApiException(
        HRM_ATT_OT_TYPE_KEY,
        'overtime_type is required when OT-type catalog is non-empty',
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
    const hit = effective.data.find((r) => r.code === key);
    if (!hit) {
      throw new ApiException(
        HRM_ATT_OT_TYPE_KEY,
        `overtime_type '${input.overtimeType}' is not in effective OT-type catalog (invent forbidden when EFF ≠ empty)`,
        HttpStatus.BAD_REQUEST,
        { overtime_type: input.overtimeType, key },
      );
    }
    return hit;
  }

  /** F-ATT-CAT-OT-01 list — default active; include_inactive audit. */
  async listOtTypes(
    query: ListAttOtTypesQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total: number; data: AttOtTypeDisplay[] }> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(authorization, query.company_id, tenantId);
    const includeInactive =
      String(query.include_inactive ?? '').toLowerCase() === 'true' ||
      String(query.include_inactive ?? '') === '1' ||
      String(query.include_inactive ?? '').toLowerCase() === 'yes';
    const rows = await this.loadNativeRows(companyKeys, {
      includeInactive,
      status: query.status,
      q: query.q,
    });
    const data = rows.map((r) => this.display(r));
    return { total: data.length, data };
  }

  /** F-ATT-CAT-OT-01 get-by-id — same scope as list (U19). */
  async getOtTypeById(
    otTypeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttOtTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const res = await this.db.query<AttOtTypeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.att_ot_type
       WHERE id = $1::uuid
       LIMIT 1;`,
      [otTypeId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(HRM_ATT_OT_404, 'OT type not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_OT_404,
      mismatchCode: HRM_ATT_OT_409,
    });
    return this.display(row);
  }

  /** F-ATT-CAT-OT-02 create / upsert by (company_id, code) — admin open N+1. */
  async upsertOtType(
    body: UpsertAttOtTypeDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttOtTypeDisplay> {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, body.companyId, { tenantId });
    const code = this.assertKeyFormat(body.code);
    const nameVi = body.nameVi.trim();
    if (!nameVi || nameVi.length > 128) {
      throw new ApiException(HRM_ATT_OT_VAL, 'nameVi is required (1..128)', HttpStatus.BAD_REQUEST);
    }
    const defaultCoeff =
      body.defaultCoeff !== undefined ? this.assertCoeff(Number(body.defaultCoeff)) : 1;
    const status = body.status ? this.assertStatus(body.status) : 'active';
    const metadataJson = body.metadata != null ? JSON.stringify(body.metadata) : null;
    const sortOrder = body.sortOrder ?? 100;
    const nameEn = body.nameEn?.trim() || null;
    const color = body.color?.trim() || null;

    const existing = await this.db.query<AttOtTypeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.att_ot_type
       WHERE company_id = $1 AND lower(code) = lower($2) AND archived_at IS NULL
       LIMIT 1;`,
      [companyId, code],
    );
    const hit = existing.rows[0];
    if (hit) {
      const updated = await this.db.query<AttOtTypeRow>(
        `UPDATE public.att_ot_type SET
           name_vi = $2,
           name_en = $3,
           default_coeff = $4,
           sort_order = $5,
           color = $6,
           metadata_json = $7::jsonb,
           status = $8,
           updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING ${ROW_SELECT};`,
        [hit.id, nameVi, nameEn, defaultCoeff, sortOrder, color, metadataJson, status],
      );
      return this.display(updated.rows[0]);
    }

    try {
      const inserted = await this.db.query<AttOtTypeRow>(
        `INSERT INTO public.att_ot_type (
           id, company_id, code, name_vi, name_en, default_coeff, sort_order,
           color, metadata_json, status
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10
         )
         RETURNING ${ROW_SELECT};`,
        [
          randomUUID(),
          companyId,
          code,
          nameVi,
          nameEn,
          defaultCoeff,
          sortOrder,
          color,
          metadataJson,
          status,
        ],
      );
      return this.display(inserted.rows[0]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_att_ot_type_company_code_active|duplicate key/i.test(msg)) {
        throw new ApiException(
          HRM_PLT_CAT_CODE_CONFLICT,
          `Active OT-type code '${code}' already exists for company`,
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async patchOtType(
    otTypeId: string,
    companyId: string,
    body: PatchAttOtTypeDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttOtTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<AttOtTypeRow>(
      `SELECT ${ROW_SELECT} FROM public.att_ot_type WHERE id = $1::uuid LIMIT 1;`,
      [otTypeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(HRM_ATT_OT_404, 'OT type not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_OT_404,
      mismatchCode: HRM_ATT_OT_409,
    });
    if (row.archived_at) {
      throw new ApiException(
        HRM_ATT_OT_VAL,
        'Cannot patch archived OT type — create a new active code if needed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    const assign = (col: string, value: unknown) => {
      values.push(value);
      sets.push(`${col} = $${values.length}`);
    };
    if (body.nameVi !== undefined) {
      const nameVi = body.nameVi.trim();
      if (!nameVi || nameVi.length > 128) {
        throw new ApiException(HRM_ATT_OT_VAL, 'nameVi is required (1..128)', HttpStatus.BAD_REQUEST);
      }
      assign('name_vi', nameVi);
    }
    if (body.nameEn !== undefined) {
      assign('name_en', body.nameEn == null ? null : String(body.nameEn).trim() || null);
    }
    if (body.defaultCoeff !== undefined) {
      assign('default_coeff', this.assertCoeff(Number(body.defaultCoeff)));
    }
    if (body.sortOrder !== undefined) assign('sort_order', body.sortOrder);
    if (body.color !== undefined) {
      assign('color', body.color == null ? null : String(body.color).trim() || null);
    }
    if (body.metadata !== undefined) {
      values.push(body.metadata == null ? null : JSON.stringify(body.metadata));
      sets.push(`metadata_json = $${values.length}::jsonb`);
    }
    if (body.status !== undefined) assign('status', this.assertStatus(body.status));

    if (!sets.length) {
      return this.display(row);
    }
    values.push(otTypeId);
    const updated = await this.db.query<AttOtTypeRow>(
      `UPDATE public.att_ot_type
       SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}::uuid
       RETURNING ${ROW_SELECT};`,
      values,
    );
    return this.display(updated.rows[0]);
  }

  /** Soft-delete — FORBIDDEN hard-delete (BR-PLT-04 · VAL-ATT-OT-CAT-05). */
  async retireOtType(
    otTypeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttOtTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<AttOtTypeRow>(
      `SELECT ${ROW_SELECT} FROM public.att_ot_type WHERE id = $1::uuid LIMIT 1;`,
      [otTypeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(HRM_ATT_OT_404, 'OT type not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_OT_404,
      mismatchCode: HRM_ATT_OT_409,
    });
    if (row.archived_at) {
      return this.display(row);
    }
    const updated = await this.db.query<AttOtTypeRow>(
      `UPDATE public.att_ot_type
       SET status = 'inactive', archived_at = NOW(), updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING ${ROW_SELECT};`,
      [otTypeId],
    );
    return this.display(updated.rows[0]);
  }
}
