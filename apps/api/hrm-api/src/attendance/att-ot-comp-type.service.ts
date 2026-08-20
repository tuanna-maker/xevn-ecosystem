/**
 * @CODE-MEMORY
 * Screen:     HRM · Chấm công · Catalog hình thức bồi thường tăng ca (`/attendance/ot-comp-types`)
 * UC:         AC-PLT-ATT-COMP-01* · BR-PLT-02/04/05/06 · L-ATT-OTC-01..16
 * BR:         Open catalog · soft-delete · U19 scope_parity · invent KEY · không cột formula
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01.md §3..§7
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md Option B
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01.md §2
 * API_DESIGN: F-ATT-CAT-OTC-01/02 · EFF · consumer HRM-ATT-OT-COMP-KEY
 * Purpose:    ensureSchema att_ot_comp_type + CRUD/retire + effective picker + consumer invent assert.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BE-01
 * Coded:      2026-08-08
 * Callers:    attendance.controller · AttendanceRequestsService.createOvertimeRequest
 * Callees:    HrmDbService · resolveHrmListScope
 * FEActions:  Admin Hình thức bồi thường OT → list F5 → OT create picker / invent → KEY
 * BEChain:    ensureSchema → scope filter → soft archive · EFF active · CNS invent KEY
 * Impact:     Closed IsIn/CHECK code IN = phá BR-PLT-05; invent soft khi EFF>0 = phá BR-PLT-02;
 *             fold vào att_ot_type = phá L-ATT-OTC-08; claim formula LIVE = phá L-ATT-OTC-10.
 * must_keep:  overtime_requests.compensation_type TEXT soft key · att_ot_type orthogonal SEAL ·
 *             leave/code/worksite/shifts seals · U65 empty [] OK ·
 *             FORBIDDEN hard-delete / fold / seed / formula LIVE / reopen OT-TYPE L1
 * SOLID:      Catalog CRUD tách khỏi TXN overtime_requests; tách khỏi peer att_ot_type
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-be-01.md
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
  ATT_OT_COMP_TYPE_CATALOG_KIND,
  ATT_OT_COMP_TYPE_KEY_FORMAT,
  ATT_OT_COMP_TYPE_STATUSES,
  HRM_ATT_OTC_404,
  HRM_ATT_OTC_409,
  HRM_ATT_OTC_VAL,
  HRM_ATT_OT_COMP_KEY,
  HRM_PLT_CAT_CODE_CONFLICT,
  type AttOtCompTypeRowStatus,
  type AttOtCompTypeSource,
} from './att-ot-comp-type.constants';
import type {
  ListAttOtCompTypesQueryDto,
  ListEffectiveAttOtCompTypesQueryDto,
  PatchAttOtCompTypeDto,
  UpsertAttOtCompTypeDto,
} from './dto/att-ot-comp-type.dto';

type AttOtCompTypeRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  name_en: string | null;
  sort_order: number;
  color: string | null;
  metadata_json: Record<string, unknown> | string | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AttOtCompTypeDisplay = {
  id: string;
  companyId: string;
  code: string;
  nameVi: string;
  nameEn: string | null;
  sortOrder: number;
  color: string | null;
  metadata: Record<string, unknown> | null;
  status: string;
  source: AttOtCompTypeSource;
  catalogKind: typeof ATT_OT_COMP_TYPE_CATALOG_KIND;
  archivedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

const ROW_SELECT = `id, company_id, code, name_vi, name_en, sort_order,
              color, metadata_json, status, archived_at, created_at, updated_at`;

@Injectable()
export class AttOtCompTypeService {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_ot_comp_type (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        name_en TEXT NULL,
        sort_order INT NOT NULL DEFAULT 100,
        color TEXT NULL,
        method TEXT NULL,
        description TEXT NULL,
        metadata_json JSONB NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_att_ot_comp_type_company_code_active
        ON public.att_ot_comp_type (company_id, lower(code))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_ot_comp_type_company_status
        ON public.att_ot_comp_type (company_id, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_ot_comp_type_company_sort
        ON public.att_ot_comp_type (company_id, sort_order);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_att_ot_comp_type_effective
        ON public.att_ot_comp_type (company_id)
        WHERE archived_at IS NULL AND status = 'active';
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_ot_comp_type
          DROP CONSTRAINT IF EXISTS chk_att_ot_comp_type_code_format;
        ALTER TABLE public.att_ot_comp_type
          ADD CONSTRAINT chk_att_ot_comp_type_code_format
          CHECK (code ~ '^[a-z][a-z0-9_]*$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_ot_comp_type
          DROP CONSTRAINT IF EXISTS chk_att_ot_comp_type_name_vi;
        ALTER TABLE public.att_ot_comp_type
          ADD CONSTRAINT chk_att_ot_comp_type_name_vi
          CHECK (char_length(trim(name_vi)) BETWEEN 1 AND 128);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.att_ot_comp_type
          DROP CONSTRAINT IF EXISTS chk_att_ot_comp_type_row_status;
        ALTER TABLE public.att_ot_comp_type
          ADD CONSTRAINT chk_att_ot_comp_type_row_status
          CHECK (status IN ('active','inactive'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: never ADD CHECK code IN ('salary','compensatory_leave') - open catalog (BR-PLT-05).
    // FORBIDDEN: no payroll formula / amount columns this seat (L-ATT-OTC-10 formula HOLD).
    // U65: optional starter upsert omitted - empty catalog is valid.
    await this.db.query(`
      ALTER TABLE public.att_ot_comp_type
      ADD COLUMN IF NOT EXISTS method TEXT NULL,
      ADD COLUMN IF NOT EXISTS description TEXT NULL;
    `);
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

  private display(
    row: AttOtCompTypeRow,
    source: AttOtCompTypeSource = 'att_native',
  ): AttOtCompTypeDisplay {
    return {
      id: row.id,
      companyId: row.company_id,
      code: row.code,
      nameVi: row.name_vi,
      nameEn: row.name_en,
      sortOrder: Number(row.sort_order) || 100,
      color: row.color,
      metadata: this.parseMeta(row.metadata_json),
      status: row.status,
      source,
      catalogKind: ATT_OT_COMP_TYPE_CATALOG_KIND,
      archivedAt: row.archived_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }

  private assertKeyFormat(raw: string): string {
    const key = raw.trim();
    if (!key || !ATT_OT_COMP_TYPE_KEY_FORMAT.test(key)) {
      throw new ApiException(
        HRM_ATT_OTC_VAL,
        'code format invalid - expected ^[a-z][a-z0-9_]*$ (format only; not a closed starter set)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  private assertStatus(raw: string): AttOtCompTypeRowStatus {
    const s = raw.trim().toLowerCase() as AttOtCompTypeRowStatus;
    if (!(ATT_OT_COMP_TYPE_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException(
        HRM_ATT_OTC_VAL,
        `status must be one of ${ATT_OT_COMP_TYPE_STATUSES.join(',')}`,
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
      includeInactive?: boolean;
      status?: string;
      q?: string;
    },
  ): Promise<AttOtCompTypeRow[]> {
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdTextColumnFilter(filters, values, companyKeys);
    if (!opts?.includeInactive) {
      filters.push('archived_at IS NULL');
    }
    if (opts?.status?.trim()) {
      values.push(opts.status.trim().toLowerCase());
      filters.push(`status = $${values.length}`);
    }
    if (opts?.q?.trim()) {
      values.push(`%${opts.q.trim().toLowerCase()}%`);
      filters.push(
        `(lower(code) LIKE $${values.length} OR lower(name_vi) LIKE $${values.length})`,
      );
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const res = await this.db.query<AttOtCompTypeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.att_ot_comp_type
       ${where}
       ORDER BY sort_order ASC, code ASC;`,
      values,
    );
    return res.rows;
  }

  /** F-ATT-CAT-OTC-01 effective picker - active + not archived. Empty [] OK (U65). */
  async listEffective(
    query: ListEffectiveAttOtCompTypesQueryDto,
    authorization?: string,
    opts?: { tenantId?: string },
  ): Promise<{ total: number; data: AttOtCompTypeDisplay[] }> {
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
   * VAL-ATT-COMP-CNS-01 / AC-PLT-ATT-COMP-01b - when EFF >0, reject invent compensation_type.
   * Empty compensation_type (optional) OR empty EFF = soft skip (01c · U65 · no seed).
   * Invent KEY = HRM-ATT-OT-COMP-KEY (orthogonal to HRM-ATT-OT-TYPE-KEY · L-ATT-OTC-16).
   */
  async assertCompTypeInEffectiveCatalog(input: {
    companyId: string;
    compensationType: string | null | undefined;
    authorization?: string;
    tenantId?: string;
  }): Promise<AttOtCompTypeDisplay | null> {
    const key = (input.compensationType ?? '').trim().toLowerCase();
    if (!key) {
      // compensation_type is optional on the TXN - no value = no assert (default salary retained).
      return null;
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
        HRM_ATT_OT_COMP_KEY,
        `compensation_type '${input.compensationType}' is not in effective OT compensation catalog (invent forbidden when EFF is non-empty)`,
        HttpStatus.BAD_REQUEST,
        { compensation_type: input.compensationType, key },
      );
    }
    return hit;
  }

  /** F-ATT-CAT-OTC-01 list - default active; include_inactive audit. */
  async listOtCompTypes(
    query: ListAttOtCompTypesQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total: number; data: AttOtCompTypeDisplay[] }> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(
      authorization,
      query.company_id,
      tenantId,
    );
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

  /** F-ATT-CAT-OTC-01 get-by-id - same scope as list (U19). */
  async getOtCompTypeById(
    compTypeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttOtCompTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const res = await this.db.query<AttOtCompTypeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.att_ot_comp_type
       WHERE id = $1::uuid
       LIMIT 1;`,
      [compTypeId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_ATT_OTC_404,
        'OT compensation type not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_OTC_404,
      mismatchCode: HRM_ATT_OTC_409,
    });
    return this.display(row);
  }

  /** F-ATT-CAT-OTC-02 create / upsert by (company_id, code) - admin open N+1. */
  async upsertOtCompType(
    body: UpsertAttOtCompTypeDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttOtCompTypeDisplay> {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      body.companyId,
      { tenantId },
    );
    const code = this.assertKeyFormat(body.code);
    const nameVi = body.nameVi.trim();
    if (!nameVi || nameVi.length > 128) {
      throw new ApiException(
        HRM_ATT_OTC_VAL,
        'nameVi is required (1..128)',
        HttpStatus.BAD_REQUEST,
      );
    }
    const status = body.status ? this.assertStatus(body.status) : 'active';
    const metadataJson =
      body.metadata != null ? JSON.stringify(body.metadata) : null;
    const sortOrder = body.sortOrder ?? 100;
    const nameEn = body.nameEn?.trim() || null;
    const color = body.color?.trim() || null;

    const existing = await this.db.query<AttOtCompTypeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.att_ot_comp_type
       WHERE company_id = $1 AND lower(code) = lower($2) AND archived_at IS NULL
       LIMIT 1;`,
      [companyId, code],
    );
    const hit = existing.rows[0];
    if (hit) {
      const updated = await this.db.query<AttOtCompTypeRow>(
        `UPDATE public.att_ot_comp_type SET
           name_vi = $2,
           name_en = $3,
           sort_order = $4,
           color = $5,
           metadata_json = $6::jsonb,
           status = $7,
           updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING ${ROW_SELECT};`,
        [hit.id, nameVi, nameEn, sortOrder, color, metadataJson, status],
      );
      return this.display(updated.rows[0]);
    }

    try {
      const inserted = await this.db.query<AttOtCompTypeRow>(
        `INSERT INTO public.att_ot_comp_type (
           id, company_id, code, name_vi, name_en, sort_order,
           color, metadata_json, status
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9
         )
         RETURNING ${ROW_SELECT};`,
        [
          randomUUID(),
          companyId,
          code,
          nameVi,
          nameEn,
          sortOrder,
          color,
          metadataJson,
          status,
        ],
      );
      return this.display(inserted.rows[0]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_att_ot_comp_type_company_code_active|duplicate key/i.test(msg)) {
        throw new ApiException(
          HRM_PLT_CAT_CODE_CONFLICT,
          `Active OT compensation code '${code}' already exists for company`,
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async patchOtCompType(
    compTypeId: string,
    companyId: string,
    body: PatchAttOtCompTypeDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttOtCompTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<AttOtCompTypeRow>(
      `SELECT ${ROW_SELECT} FROM public.att_ot_comp_type WHERE id = $1::uuid LIMIT 1;`,
      [compTypeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_ATT_OTC_404,
        'OT compensation type not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_OTC_404,
      mismatchCode: HRM_ATT_OTC_409,
    });
    if (row.archived_at) {
      throw new ApiException(
        HRM_ATT_OTC_VAL,
        'Cannot patch archived OT compensation type - create a new active code if needed',
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
        throw new ApiException(
          HRM_ATT_OTC_VAL,
          'nameVi is required (1..128)',
          HttpStatus.BAD_REQUEST,
        );
      }
      assign('name_vi', nameVi);
    }
    if (body.nameEn !== undefined) {
      assign(
        'name_en',
        body.nameEn == null ? null : String(body.nameEn).trim() || null,
      );
    }
    if (body.sortOrder !== undefined) assign('sort_order', body.sortOrder);
    if (body.color !== undefined) {
      assign(
        'color',
        body.color == null ? null : String(body.color).trim() || null,
      );
    }
    if (body.metadata !== undefined) {
      values.push(body.metadata == null ? null : JSON.stringify(body.metadata));
      sets.push(`metadata_json = $${values.length}::jsonb`);
    }
    if (body.status !== undefined)
      assign('status', this.assertStatus(body.status));

    if (!sets.length) {
      return this.display(row);
    }
    values.push(compTypeId);
    const updated = await this.db.query<AttOtCompTypeRow>(
      `UPDATE public.att_ot_comp_type
       SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}::uuid
       RETURNING ${ROW_SELECT};`,
      values,
    );
    return this.display(updated.rows[0]);
  }

  /** Soft-delete - FORBIDDEN hard-delete (BR-PLT-04 · VAL-ATT-OTC-CAT-04). */
  async retireOtCompType(
    compTypeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttOtCompTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<AttOtCompTypeRow>(
      `SELECT ${ROW_SELECT} FROM public.att_ot_comp_type WHERE id = $1::uuid LIMIT 1;`,
      [compTypeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_ATT_OTC_404,
        'OT compensation type not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_ATT_OTC_404,
      mismatchCode: HRM_ATT_OTC_409,
    });
    if (row.archived_at) {
      return this.display(row);
    }
    const updated = await this.db.query<AttOtCompTypeRow>(
      `UPDATE public.att_ot_comp_type
       SET status = 'inactive', archived_at = NOW(), updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING ${ROW_SELECT};`,
      [compTypeId],
    );
    return this.display(updated.rows[0]);
  }
}
