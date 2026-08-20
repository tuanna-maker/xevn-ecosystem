/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ → Catalog lý do trạng thái (`/employees/status-reasons`)
 * UC:         AC-PLT-EMP-STATUS-01e · BR-PLT-EMP-ST-05/07 · L-EMP-ST-02
 * BR:         Open reason catalog · soft-delete · applies_to soft filter · invent KEY
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md §3
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md §6.2–6.3
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md §3
 * API_DESIGN: F-EMP-CAT-STR-01/02 · F-EMP-CAT-STR-EFF-01 · F-EMP-ST-CNS-02
 * Purpose:    ensureSchema emp_status_reason + CRUD/retire + effective list + consumer assert.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01
 * Coded:      2026-08-08
 * Callers:    employees.controller · employees.service status reason assert
 * Callees:    HrmDbService · resolveHrmListScope
 * FEActions:  Settings Tạo lý do → form NV reason khi requires_reason / EFF>0
 * BEChain:    ensureSchema → scope · soft archive · no hard FK to emp_employment_status
 * Impact:     Free-text reason when EFF>0 = phá L-EMP-ST-02; hard FK invent = phá DATA soft rule
 * must_keep:  DOC/ET · EMP-CUSTOM/EXT · ATT/SI/CTR · U65 empty [] · FORBIDDEN hard-delete / closed key CHECK
 * SOLID:      Companion catalog SRP — separate from status service
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-be-01.md
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
  EMP_STATUS_REASON_CATALOG_KIND,
  EMP_STATUS_REASON_KEY_FORMAT,
  EMP_STATUS_REASON_STATUSES,
  HRM_EMP_STATUS_REASON_KEY,
  HRM_EMP_STR_404,
} from './emp-status-reason.constants';
import {
  HRM_PLT_CAT_CODE_CONFLICT,
  HRM_PLT_CAT_CODE_INVALID,
} from './emp-employment-status.constants';
import type { EmpStatusReasonRowStatus } from './emp-status-reason.constants';
import type {
  ListEffectiveEmpStatusReasonsQueryDto,
  ListEmpStatusReasonsQueryDto,
  PatchEmpStatusReasonDto,
  UpsertEmpStatusReasonDto,
} from './dto/emp-status-reason.dto';

type EmpStatusReasonRow = {
  id: string;
  company_id: string;
  reason_key: string;
  name_vi: string;
  sort_order: number;
  applies_to_status_keys_json: unknown;
  metadata_json: Record<string, unknown> | string | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EmpStatusReasonDisplay = {
  id: string;
  companyId: string;
  reasonKey: string;
  nameVi: string;
  sortOrder: number;
  appliesToStatusKeys: string[] | null;
  metadata: Record<string, unknown> | null;
  status: string;
  catalogKind: typeof EMP_STATUS_REASON_CATALOG_KIND;
  archivedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

const ROW_SELECT = `id, company_id, reason_key, name_vi, sort_order,
              applies_to_status_keys_json, metadata_json,
              status, archived_at, created_at, updated_at`;

@Injectable()
export class EmpStatusReasonService {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.emp_status_reason (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        reason_key TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 100,
        applies_to_status_keys_json JSONB NULL,
        metadata_json JSONB NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_emp_status_reason_company_key_active
        ON public.emp_status_reason (company_id, lower(reason_key))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_emp_status_reason_company_status
        ON public.emp_status_reason (company_id, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_emp_status_reason_company_sort
        ON public.emp_status_reason (company_id, sort_order);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_emp_status_reason_effective
        ON public.emp_status_reason (company_id)
        WHERE archived_at IS NULL AND status = 'active';
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.emp_status_reason
          DROP CONSTRAINT IF EXISTS chk_emp_str_key_format;
        ALTER TABLE public.emp_status_reason
          ADD CONSTRAINT chk_emp_str_key_format
          CHECK (reason_key ~ '^[a-z][a-z0-9_]*$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.emp_status_reason
          DROP CONSTRAINT IF EXISTS chk_emp_str_row_status;
        ALTER TABLE public.emp_status_reason
          ADD CONSTRAINT chk_emp_str_row_status
          CHECK (status IN ('active','retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: closed reason_key IN (…) · hard FK to emp_employment_status
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

  private parseAppliesTo(raw: unknown): string[] | null {
    if (raw == null) return null;
    let arr: unknown = raw;
    if (typeof raw === 'string') {
      try {
        arr = JSON.parse(raw);
      } catch {
        return null;
      }
    }
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr
      .map((x) =>
        String(x ?? '')
          .trim()
          .replace(/-/g, '_')
          .toLowerCase(),
      )
      .filter((k) => !!k && EMP_STATUS_REASON_KEY_FORMAT.test(k));
  }

  private display(row: EmpStatusReasonRow): EmpStatusReasonDisplay {
    return {
      id: row.id,
      companyId: row.company_id,
      reasonKey: row.reason_key,
      nameVi: row.name_vi,
      sortOrder: Number(row.sort_order ?? 100),
      appliesToStatusKeys: this.parseAppliesTo(row.applies_to_status_keys_json),
      metadata: this.parseMeta(row.metadata_json),
      status: row.status,
      catalogKind: EMP_STATUS_REASON_CATALOG_KIND,
      archivedAt: row.archived_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }

  private assertKeyFormat(raw: string): string {
    const key = raw.trim().replace(/-/g, '_').toLowerCase();
    if (!key || !EMP_STATUS_REASON_KEY_FORMAT.test(key)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'reasonKey format invalid — expected ^[a-z][a-z0-9_]*$ after hyphen→underscore',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  private assertRowStatus(raw: string): EmpStatusReasonRowStatus {
    const s = raw.trim().toLowerCase() as EmpStatusReasonRowStatus;
    if (!(EMP_STATUS_REASON_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `status must be one of ${EMP_STATUS_REASON_STATUSES.join(',')}`,
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

  private reasonAppliesToStatus(
    appliesTo: string[] | null,
    statusKey: string | undefined,
  ): boolean {
    if (!statusKey?.trim()) return true;
    if (!appliesTo || appliesTo.length === 0) return true;
    return appliesTo.includes(
      statusKey.trim().replace(/-/g, '_').toLowerCase(),
    );
  }

  private async loadNativeRows(
    companyKeys: string[],
    opts?: {
      includeArchived?: boolean;
      status?: string;
      q?: string;
      appliesToStatusKey?: string;
    },
  ): Promise<EmpStatusReasonRow[]> {
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
        `(lower(reason_key) LIKE $${values.length} OR lower(name_vi) LIKE $${values.length})`,
      );
    }
    const res = await this.db.query<EmpStatusReasonRow>(
      `SELECT ${ROW_SELECT}
       FROM public.emp_status_reason
       WHERE ${filters.join(' AND ')}
       ORDER BY sort_order ASC, reason_key ASC;`,
      values,
    );
    let rows = res.rows;
    if (opts?.appliesToStatusKey?.trim()) {
      const sk = opts.appliesToStatusKey
        .trim()
        .replace(/-/g, '_')
        .toLowerCase();
      rows = rows.filter((r) =>
        this.reasonAppliesToStatus(
          this.parseAppliesTo(r.applies_to_status_keys_json),
          sk,
        ),
      );
    }
    return rows;
  }

  /** F-EMP-CAT-STR-EFF-01 */
  async listEffective(
    query: ListEffectiveEmpStatusReasonsQueryDto,
    authorization?: string,
    options?: { tenantId?: string },
  ): Promise<{ total: number; data: EmpStatusReasonDisplay[] }> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(
      authorization,
      query.company_id,
      options?.tenantId,
    );
    const rows = await this.loadNativeRows(companyKeys, {
      includeArchived: false,
      status: 'active',
      q: query.q,
      appliesToStatusKey: query.applies_to_status_key,
    });
    const data = rows.map((r) => this.display(r));
    return { total: data.length, data };
  }

  /**
   * F-EMP-ST-CNS-02 — invent KEY when:
   * - status.requires_reason and reason missing/invent, OR
   * - reason provided while reason EFF>0 and key ∉ EFF / applies_to fail.
   * Empty reason EFF + not required → soft skip (BR-PLT-EMP-ST-06 · U65).
   */
  async assertStatusReasonInEffectiveCatalog(input: {
    companyId: string;
    reasonKey: string | null | undefined;
    statusKey?: string;
    requiresReason?: boolean;
    authorization?: string;
    tenantId?: string;
  }): Promise<EmpStatusReasonDisplay | null> {
    const raw = String(input.reasonKey ?? '').trim();
    const requiresReason = Boolean(input.requiresReason);
    // Membership uses full EFF (no applies_to filter); applies_to checked after hit (VAL-EMP-STR-CNS-02).
    const effective = await this.listEffective(
      { company_id: input.companyId },
      input.authorization,
      { tenantId: input.tenantId },
    );

    if (!raw) {
      if (requiresReason) {
        throw new ApiException(
          HRM_EMP_STATUS_REASON_KEY,
          'status_reason_key is required when status.requires_reason=true',
          HttpStatus.BAD_REQUEST,
        );
      }
      return null;
    }

    if (effective.total === 0) {
      // EFF empty — soft allow free-text bootstrap (no seed); membership skip.
      return null;
    }

    const key = raw.replace(/-/g, '_').toLowerCase();
    const hit = effective.data.find((r) => r.reasonKey === key);
    if (!hit) {
      throw new ApiException(
        HRM_EMP_STATUS_REASON_KEY,
        `status_reason_key '${input.reasonKey}' is not in effective status reason catalog`,
        HttpStatus.BAD_REQUEST,
        { reasonKey: input.reasonKey, key },
      );
    }
    if (!this.reasonAppliesToStatus(hit.appliesToStatusKeys, input.statusKey)) {
      throw new ApiException(
        HRM_EMP_STATUS_REASON_KEY,
        `status_reason_key '${input.reasonKey}' does not apply to status '${input.statusKey}'`,
        HttpStatus.BAD_REQUEST,
        { reasonKey: input.reasonKey, statusKey: input.statusKey },
      );
    }
    return hit;
  }

  async listStatusReasons(
    query: ListEmpStatusReasonsQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total: number; data: EmpStatusReasonDisplay[] }> {
    await this.ensureSchema();
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
      appliesToStatusKey: query.applies_to_status_key,
    });
    const data = rows.map((r) => this.display(r));
    return { total: data.length, data };
  }

  async getStatusReasonById(
    reasonId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpStatusReasonDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const res = await this.db.query<EmpStatusReasonRow>(
      `SELECT ${ROW_SELECT}
       FROM public.emp_status_reason
       WHERE id = $1::uuid
       LIMIT 1;`,
      [reasonId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_EMP_STR_404,
        'Status reason not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_EMP_STR_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return this.display(row);
  }

  async upsertStatusReason(
    body: UpsertEmpStatusReasonDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpStatusReasonDisplay> {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      body.companyId,
      { tenantId },
    );
    const reasonKey = this.assertKeyFormat(body.reasonKey);
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
    const appliesJson =
      body.appliesToStatusKeys != null
        ? JSON.stringify(
            body.appliesToStatusKeys.map((k) => this.assertKeyFormat(k)),
          )
        : null;
    const sortOrder = body.sortOrder ?? 100;

    const existing = await this.db.query<EmpStatusReasonRow>(
      `SELECT ${ROW_SELECT}
       FROM public.emp_status_reason
       WHERE company_id = $1 AND lower(reason_key) = lower($2) AND archived_at IS NULL
       LIMIT 1;`,
      [companyId, reasonKey],
    );
    const hit = existing.rows[0];
    if (hit) {
      const updated = await this.db.query<EmpStatusReasonRow>(
        `UPDATE public.emp_status_reason SET
           name_vi = $2,
           sort_order = $3,
           applies_to_status_keys_json = COALESCE($4::jsonb, applies_to_status_keys_json),
           metadata_json = $5::jsonb,
           status = $6,
           updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING ${ROW_SELECT};`,
        [hit.id, nameVi, sortOrder, appliesJson, metadataJson, status],
      );
      return this.display(updated.rows[0]);
    }

    try {
      const inserted = await this.db.query<EmpStatusReasonRow>(
        `INSERT INTO public.emp_status_reason (
           id, company_id, reason_key, name_vi, sort_order,
           applies_to_status_keys_json, metadata_json, status
         ) VALUES (
           $1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8
         )
         RETURNING ${ROW_SELECT};`,
        [
          randomUUID(),
          companyId,
          reasonKey,
          nameVi,
          sortOrder,
          appliesJson,
          metadataJson,
          status,
        ],
      );
      return this.display(inserted.rows[0]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/uq_emp_status_reason_company_key_active|duplicate key/i.test(msg)) {
        throw new ApiException(
          HRM_PLT_CAT_CODE_CONFLICT,
          `Active reason_key '${reasonKey}' already exists for company`,
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async patchStatusReason(
    reasonId: string,
    companyId: string,
    body: PatchEmpStatusReasonDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpStatusReasonDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<EmpStatusReasonRow>(
      `SELECT ${ROW_SELECT} FROM public.emp_status_reason WHERE id = $1::uuid LIMIT 1;`,
      [reasonId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_EMP_STR_404,
        'Status reason not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_EMP_STR_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'Cannot patch archived status reason',
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
    if (body.appliesToStatusKeys !== undefined) {
      values.push(
        body.appliesToStatusKeys == null
          ? null
          : JSON.stringify(
              body.appliesToStatusKeys.map((k) => this.assertKeyFormat(k)),
            ),
      );
      sets.push(`applies_to_status_keys_json = $${values.length}::jsonb`);
    }
    if (body.metadata !== undefined) {
      values.push(body.metadata == null ? null : JSON.stringify(body.metadata));
      sets.push(`metadata_json = $${values.length}::jsonb`);
    }
    if (body.status !== undefined)
      assign('status', this.assertRowStatus(body.status));

    if (!sets.length) {
      return this.display(row);
    }
    const patchValues = [...values, reasonId];
    const updated = await this.db.query<EmpStatusReasonRow>(
      `UPDATE public.emp_status_reason
       SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${patchValues.length}::uuid
       RETURNING ${ROW_SELECT};`,
      patchValues,
    );
    return this.display(updated.rows[0]);
  }

  async retireStatusReason(
    reasonId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpStatusReasonDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<EmpStatusReasonRow>(
      `SELECT ${ROW_SELECT} FROM public.emp_status_reason WHERE id = $1::uuid LIMIT 1;`,
      [reasonId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_EMP_STR_404,
        'Status reason not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_EMP_STR_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      return this.display(row);
    }
    const updated = await this.db.query<EmpStatusReasonRow>(
      `UPDATE public.emp_status_reason
       SET status = 'retired', archived_at = NOW(), updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING ${ROW_SELECT};`,
      [reasonId],
    );
    return this.display(updated.rows[0]);
  }
}
