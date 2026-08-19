/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ → Catalog loại giấy tờ (`/employees/document-types`)
 * UC:         AC-PLT-EMP-02/03/06 · FR-UC-BP-CORE-03 · BR-PLT-02/04/05
 * BR:         Open catalog · soft-delete · U19 scope_parity · typed DOC flags SoT
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md §2 · §6 VAL-EMP-DOC-*
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md §3 F-EMP-CAT-DOC/EFF-01
 * DB_DESIGN:  docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.0a · §3.5
 * API_DESIGN: F-EMP-CAT-DOC-01/02 · F-EMP-CAT-EFF-01
 * Purpose:    ensureSchema emp_document_type + CRUD/retire + effective DOC catalog (tenant SoT).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01
 * Coded:      2026-08-07
 * Callers:    employees.controller · checklist/ACT assert (R-PLT-EMP-01)
 * Callees:    HrmDbService · resolveHrmListScope
 * FEActions:  Settings Tạo loại giấy tờ → list F5 → checklist chọn mã mới
 * BEChain:    ensureSchema → scope filter → soft archive · assert key ∈ effective when >0
 * Impact:     Closed enum reject Nth key = phá BR-PLT-05; hard-delete = phá history checklist
 * must_keep:  CORE-01 profile · UF-HRM-02 contracts · SI · AC-PLT-EMP-01 XBOS position ·
 *             U65 empty [] OK · FORBIDDEN hard-delete / CHECK document_type_key IN (…)
 * SOLID:      Catalog CRUD tách TXN employees / contracts / SI
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01
 * change_mode: ADD
 * What: F-EMP-TOK-01 same-TX upsert/retire emp.doc.<key> origin=emp_catalog via hrm_merge_tokens
 * must_keep: DOC schema seals · soft-delete · U65 no seed · single merge-token SoT · no new emp_* tables
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
import { HrmDbQueryFn, HrmDbService } from '../db/hrm-db.service';
import {
  mergeTokenKeyForEmpDoc,
  mergeTokenSourcePathForEmpDoc,
  upsertEmpCatalogMergeToken,
} from '../merge-tokens/emp-merge-token-register';
import {
  EMP_DOCUMENT_TYPE_CATALOG_KIND,
  EMP_DOCUMENT_TYPE_KEY_FORMAT,
  EMP_DOCUMENT_TYPE_STATUSES,
  HRM_EMP_DOC_404,
  HRM_EMP_DOC_TYPE_UNKNOWN,
  HRM_PLT_CAT_CODE_CONFLICT,
  HRM_PLT_CAT_CODE_INVALID,
  type EmpDocumentTypeSource,
  type EmpDocumentTypeStatus,
} from './emp-document-type.constants';
import type {
  ListEffectiveEmpDocumentTypesQueryDto,
  ListEmpDocumentTypesQueryDto,
  PatchEmpDocumentTypeDto,
  UpsertEmpDocumentTypeDto,
} from './dto/emp-document-type.dto';

type EmpDocumentTypeRow = {
  id: string;
  company_id: string;
  document_type_key: string;
  name_vi: string;
  sort_order: number;
  required_by_default: boolean;
  requires_expiry: boolean;
  blocks_activation: boolean;
  is_identity_doc: boolean;
  allowed_mime_json: unknown;
  metadata_json: Record<string, unknown> | string | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EmpDocumentTypeDisplay = {
  id: string;
  companyId: string;
  documentTypeKey: string;
  nameVi: string;
  sortOrder: number;
  requiredByDefault: boolean;
  requiresExpiry: boolean;
  blocksActivation: boolean;
  isIdentityDoc: boolean;
  allowedMime: unknown;
  metadata: Record<string, unknown> | null;
  status: string;
  source: EmpDocumentTypeSource;
  catalogKind: typeof EMP_DOCUMENT_TYPE_CATALOG_KIND;
  archivedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

const ROW_SELECT = `id, company_id, document_type_key, name_vi, sort_order,
              required_by_default, requires_expiry, blocks_activation, is_identity_doc,
              allowed_mime_json, metadata_json, status, archived_at, created_at, updated_at`;

@Injectable()
export class EmpDocumentTypeService {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.emp_document_type (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        document_type_key TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 100,
        required_by_default BOOLEAN NOT NULL DEFAULT FALSE,
        requires_expiry BOOLEAN NOT NULL DEFAULT FALSE,
        blocks_activation BOOLEAN NOT NULL DEFAULT FALSE,
        is_identity_doc BOOLEAN NOT NULL DEFAULT FALSE,
        allowed_mime_json JSONB NULL,
        metadata_json JSONB NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_emp_document_type_company_key_active
        ON public.emp_document_type (company_id, lower(document_type_key))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_emp_document_type_company_status
        ON public.emp_document_type (company_id, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_emp_document_type_company_sort
        ON public.emp_document_type (company_id, sort_order);
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.emp_document_type
          DROP CONSTRAINT IF EXISTS chk_emp_doc_type_key_format;
        ALTER TABLE public.emp_document_type
          ADD CONSTRAINT chk_emp_doc_type_key_format
          CHECK (document_type_key ~ '^[a-z][a-z0-9_]*$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.emp_document_type
          DROP CONSTRAINT IF EXISTS chk_emp_doc_type_status;
        ALTER TABLE public.emp_document_type
          ADD CONSTRAINT chk_emp_doc_type_status
          CHECK (status IN ('active','retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: never ADD CHECK document_type_key IN ('cccd','cv','degree',…)
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

  private display(row: EmpDocumentTypeRow, source: EmpDocumentTypeSource): EmpDocumentTypeDisplay {
    return {
      id: row.id,
      companyId: row.company_id,
      documentTypeKey: row.document_type_key,
      nameVi: row.name_vi,
      sortOrder: Number(row.sort_order ?? 100),
      requiredByDefault: Boolean(row.required_by_default),
      requiresExpiry: Boolean(row.requires_expiry),
      blocksActivation: Boolean(row.blocks_activation),
      isIdentityDoc: Boolean(row.is_identity_doc),
      allowedMime: row.allowed_mime_json ?? null,
      metadata: this.parseMeta(row.metadata_json),
      status: row.status,
      source,
      catalogKind: EMP_DOCUMENT_TYPE_CATALOG_KIND,
      archivedAt: row.archived_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }

  private assertKeyFormat(raw: string): string {
    const key = raw.trim();
    if (!key || !EMP_DOCUMENT_TYPE_KEY_FORMAT.test(key)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'documentTypeKey format invalid — expected ^[a-z][a-z0-9_]*$ (format only; not a closed starter set)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  private assertStatus(raw: string): EmpDocumentTypeStatus {
    const s = raw.trim().toLowerCase() as EmpDocumentTypeStatus;
    if (!(EMP_DOCUMENT_TYPE_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `status must be one of ${EMP_DOCUMENT_TYPE_STATUSES.join(',')}`,
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
  ): Promise<EmpDocumentTypeRow[]> {
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
        `(lower(document_type_key) LIKE $${values.length} OR lower(name_vi) LIKE $${values.length})`,
      );
    }
    const res = await this.db.query<EmpDocumentTypeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.emp_document_type
       WHERE ${filters.join(' AND ')}
       ORDER BY sort_order ASC, document_type_key ASC;`,
      values,
    );
    return res.rows;
  }

  /** F-EMP-CAT-EFF-01 — active tenant DOC rows (group REF reserved GĐ1.5). */
  async listEffective(
    query: ListEffectiveEmpDocumentTypesQueryDto,
    authorization?: string,
    options?: { tenantId?: string },
  ): Promise<{ total: number; data: EmpDocumentTypeDisplay[] }> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(authorization, query.company_id, options?.tenantId);
    const rows = await this.loadNativeRows(companyKeys, {
      includeArchived: false,
      status: 'active',
      q: query.q,
    });
    const data = rows.map((r) => this.display(r, 'emp_native'));
    return { total: data.length, data };
  }

  /**
   * R-PLT-EMP-01 / BR-PLT-02 — when effective catalog >0, reject unknown document_type_key.
   * Empty effective = soft allow (U65; no fake starter).
   */
  async assertDocumentTypeInEffectiveCatalog(input: {
    companyId: string;
    documentTypeKey: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<EmpDocumentTypeDisplay | null> {
    const key = input.documentTypeKey.trim();
    if (!key) {
      throw new ApiException(
        HRM_EMP_DOC_TYPE_UNKNOWN,
        'document_type_key is required',
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
    const hit = effective.data.find((r) => r.documentTypeKey === key);
    if (!hit) {
      throw new ApiException(
        HRM_EMP_DOC_TYPE_UNKNOWN,
        `document_type_key '${input.documentTypeKey}' is not in effective document catalog (free-text SoT forbidden)`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return hit;
  }

  /** F-EMP-CAT-DOC-01 list */
  async listDocumentTypes(
    query: ListEmpDocumentTypesQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total: number; data: EmpDocumentTypeDisplay[] }> {
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
    const data = rows.map((r) => this.display(r, 'emp_native'));
    return { total: data.length, data };
  }

  /** F-EMP-CAT-DOC-01 get-by-id — same scope as list (U19). */
  async getDocumentTypeById(
    documentTypeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpDocumentTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const res = await this.db.query<EmpDocumentTypeRow>(
      `SELECT ${ROW_SELECT}
       FROM public.emp_document_type
       WHERE id = $1::uuid
       LIMIT 1;`,
      [documentTypeId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(HRM_EMP_DOC_404, 'Document type not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_EMP_DOC_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return this.display(row, 'emp_native');
  }

  /** F-EMP-CAT-DOC-02 create / upsert by (company_id, document_type_key) + F-EMP-TOK-01 same TX. */
  async upsertDocumentType(
    body: UpsertEmpDocumentTypeDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpDocumentTypeDisplay> {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, body.companyId, { tenantId });
    const documentTypeKey = this.assertKeyFormat(body.documentTypeKey);
    const nameVi = body.nameVi.trim();
    if (!nameVi) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'nameVi is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const status = body.status ? this.assertStatus(body.status) : 'active';
    const metadataJson = body.metadata != null ? JSON.stringify(body.metadata) : null;
    const allowedMimeJson =
      body.allowedMime != null ? JSON.stringify(body.allowedMime) : null;
    const sortOrder = body.sortOrder ?? 100;

    return this.db.withTransaction(async (query) => {
      const existing = await query<EmpDocumentTypeRow>(
        `SELECT ${ROW_SELECT}
         FROM public.emp_document_type
         WHERE company_id = $1 AND lower(document_type_key) = lower($2) AND archived_at IS NULL
         LIMIT 1;`,
        [companyId, documentTypeKey],
      );
      const hit = existing.rows[0];
      let row: EmpDocumentTypeRow;
      if (hit) {
        const updated = await query<EmpDocumentTypeRow>(
          `UPDATE public.emp_document_type SET
             name_vi = $2,
             sort_order = $3,
             required_by_default = $4,
             requires_expiry = $5,
             blocks_activation = $6,
             is_identity_doc = $7,
             allowed_mime_json = $8::jsonb,
             metadata_json = $9::jsonb,
             status = $10,
             updated_at = NOW()
           WHERE id = $1::uuid
           RETURNING ${ROW_SELECT};`,
          [
            hit.id,
            nameVi,
            sortOrder,
            body.requiredByDefault ?? false,
            body.requiresExpiry ?? false,
            body.blocksActivation ?? false,
            body.isIdentityDoc ?? false,
            allowedMimeJson,
            metadataJson,
            status,
          ],
        );
        row = updated.rows[0];
      } else {
        try {
          const inserted = await query<EmpDocumentTypeRow>(
            `INSERT INTO public.emp_document_type (
               id, company_id, document_type_key, name_vi, sort_order,
               required_by_default, requires_expiry, blocks_activation, is_identity_doc,
               allowed_mime_json, metadata_json, status
             ) VALUES (
               $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12
             )
             RETURNING ${ROW_SELECT};`,
            [
              randomUUID(),
              companyId,
              documentTypeKey,
              nameVi,
              sortOrder,
              body.requiredByDefault ?? false,
              body.requiresExpiry ?? false,
              body.blocksActivation ?? false,
              body.isIdentityDoc ?? false,
              allowedMimeJson,
              metadataJson,
              status,
            ],
          );
          row = inserted.rows[0];
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (/uq_emp_document_type_company_key_active|duplicate key/i.test(msg)) {
            throw new ApiException(
              HRM_PLT_CAT_CODE_CONFLICT,
              `Active document_type_key '${documentTypeKey}' already exists for company`,
              HttpStatus.CONFLICT,
            );
          }
          throw err;
        }
      }

      await this.registerDocMergeToken(query, {
        companyId: row.company_id,
        documentTypeKey: row.document_type_key,
        nameVi: row.name_vi,
        documentTypeId: row.id,
        active: row.status === 'active' && !row.archived_at,
      });
      return this.display(row, 'emp_native');
    });
  }

  async patchDocumentType(
    documentTypeId: string,
    companyId: string,
    body: PatchEmpDocumentTypeDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpDocumentTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<EmpDocumentTypeRow>(
      `SELECT ${ROW_SELECT} FROM public.emp_document_type WHERE id = $1::uuid LIMIT 1;`,
      [documentTypeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(HRM_EMP_DOC_404, 'Document type not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_EMP_DOC_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'Cannot patch archived document type — create a new active key if needed',
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
    if (body.requiredByDefault !== undefined) assign('required_by_default', body.requiredByDefault);
    if (body.requiresExpiry !== undefined) assign('requires_expiry', body.requiresExpiry);
    if (body.blocksActivation !== undefined) assign('blocks_activation', body.blocksActivation);
    if (body.isIdentityDoc !== undefined) assign('is_identity_doc', body.isIdentityDoc);
    if (body.allowedMime !== undefined) {
      values.push(body.allowedMime == null ? null : JSON.stringify(body.allowedMime));
      sets.push(`allowed_mime_json = $${values.length}::jsonb`);
    }
    if (body.metadata !== undefined) {
      values.push(body.metadata == null ? null : JSON.stringify(body.metadata));
      sets.push(`metadata_json = $${values.length}::jsonb`);
    }
    if (body.status !== undefined) assign('status', this.assertStatus(body.status));

    if (!sets.length) {
      return this.display(row, 'emp_native');
    }

    return this.db.withTransaction(async (query) => {
      const patchValues = [...values, documentTypeId];
      const updated = await query<EmpDocumentTypeRow>(
        `UPDATE public.emp_document_type
         SET ${sets.join(', ')}, updated_at = NOW()
         WHERE id = $${patchValues.length}::uuid
         RETURNING ${ROW_SELECT};`,
        patchValues,
      );
      const next = updated.rows[0];
      await this.registerDocMergeToken(query, {
        companyId: next.company_id,
        documentTypeKey: next.document_type_key,
        nameVi: next.name_vi,
        documentTypeId: next.id,
        active: next.status === 'active' && !next.archived_at,
      });
      return this.display(next, 'emp_native');
    });
  }

  /** Soft-delete — FORBIDDEN hard-delete (BR-PLT-04) · F-EMP-TOK-01 retire token same TX. */
  async retireDocumentType(
    documentTypeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<EmpDocumentTypeDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<EmpDocumentTypeRow>(
      `SELECT ${ROW_SELECT} FROM public.emp_document_type WHERE id = $1::uuid LIMIT 1;`,
      [documentTypeId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(HRM_EMP_DOC_404, 'Document type not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_EMP_DOC_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      return this.display(row, 'emp_native');
    }
    return this.db.withTransaction(async (query) => {
      const updated = await query<EmpDocumentTypeRow>(
        `UPDATE public.emp_document_type
         SET status = 'retired', archived_at = NOW(), updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING ${ROW_SELECT};`,
        [documentTypeId],
      );
      const next = updated.rows[0];
      await this.registerDocMergeToken(query, {
        companyId: next.company_id,
        documentTypeKey: next.document_type_key,
        nameVi: next.name_vi,
        documentTypeId: next.id,
        active: false,
      });
      return this.display(next, 'emp_native');
    });
  }

  private async registerDocMergeToken(
    query: HrmDbQueryFn,
    args: {
      companyId: string;
      documentTypeKey: string;
      nameVi: string;
      documentTypeId: string;
      active: boolean;
    },
  ): Promise<void> {
    try {
      await upsertEmpCatalogMergeToken(query, {
        companyId: args.companyId,
        tokenKey: mergeTokenKeyForEmpDoc(args.documentTypeKey),
        sourcePath: mergeTokenSourcePathForEmpDoc(args.documentTypeKey),
        labelVi: args.nameVi,
        extensionFieldRef: args.documentTypeId,
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
