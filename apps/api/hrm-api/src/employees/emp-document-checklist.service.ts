/**
 * @CODE-MEMORY
 * Screen:     HRM → Checklist giấy tờ hồ sơ NV (F-CORE-CHK-01)
 * UC:         UC-BP-CORE-03 · FR-UC-BP-CORE-03 Diễn biến #1–#2
 * BR:         BR-BP-DOC-01 · BR-PLT-02/04/05 · U19 CORE-03-S-SCOPE · O1–O12
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md · FR-UC-BP-CORE-03
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md §4 F-CORE-CHK-01
 * DB_DESIGN:  docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md §4–§5
 * Purpose:    Instance checklist CRUD soft-delete on public.hrm_document_checklist_item;
 *             wire assertDocumentTypeInEffectiveCatalog; display-ready DOC enrich.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-03-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    employees.controller …/document-checklist*
 * Callees:    resolveHrmListScope · EmpDocumentTypeService.assertDocumentTypeInEffectiveCatalog
 * FEActions:  hồ sơ checklist → GET/POST/PATCH /employees/:id/document-checklist*
 * BEChain:    ensureSchema → parent emp scope → assert EFF>0 → INSERT/UPDATE/soft archive
 * Impact:     Nest /core dual · closed DOC enum · hard FK · claim L1=CORE-03 DONE = FAIL
 * must_keep:  DOC/ET/TOK RETAIN · soft archived_at · U19 · no Nest /core · no emp_position · CORE-02b EMP-CF
 * SOLID:      Service SRP for CHK instance — DOC catalog stays EmpDocumentTypeService
 * LastVerified: po-hrm-mvp-gd1-core-03-cluster-be-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-07-CLUSTER-BE-01
 * change_mode: ADD
 * What: evaluateActivationGate — aggregate LIVE checklist + DOC flags (HOLD invent completeness table)
 * Why: API-01 R-CORE-07-GATE-01 · 409 HRM-EMP-ACT-CHECKLIST-INCOMPLETE · BR-BP-LC-02
 * must_keep: CORE-03 CHK SoT · no gate table invent · silent allow DENY · O8 override OUT · Nest /core DENY
 */
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  HrmListScopeContext,
  pushEmployeeListScopeFilters,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { mergeTokenKeyForEmpDoc } from '../merge-tokens/emp-merge-token-register';
import type { EmployeeRow } from './employee-directory.types';
import {
  HRM_CORE_CHK_404,
  HRM_CORE_CHK_CONFLICT_409,
  HRM_CORE_CHK_VAL_400,
  HRM_DOCUMENT_CHECKLIST_STATUSES,
  HrmDocumentChecklistStatus,
  UQ_HRM_DOC_CHK_EMP_KEY_ACTIVE,
} from './emp-document-checklist.constants';
import {
  EmpDocumentTypeDisplay,
  EmpDocumentTypeService,
} from './emp-document-type.service';
import type {
  CreateEmpDocumentChecklistDto,
  GetEmpDocumentChecklistQueryDto,
  ListEmpDocumentChecklistQueryDto,
  UpdateEmpDocumentChecklistDto,
} from './dto/emp-document-checklist.dto';

/** Display-ready blocking row for CORE-07 GATE (DATA-01 §5). */
export type EmpActivationBlockingItem = {
  documentTypeKey: string;
  nameVi: string;
  status: string;
};

/** Aggregate GATE result — DENY invent completeness table. */
export type EmpActivationGateResult = {
  employeeId: string;
  companyId: string;
  checklist_complete: boolean;
  can_activate: boolean;
  blocking_items: EmpActivationBlockingItem[];
};

export type HrmDocumentChecklistItemRow = {
  id: string;
  employee_id: string;
  company_id: string;
  document_type_key: string;
  required: boolean;
  status: string;
  file_ref: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type CatalogEnrich = {
  nameVi: string;
  documentTypeNameVi: string;
  sortOrder: number;
  requiredByDefault: boolean | null;
  blocksActivation: boolean | null;
  requiresExpiry: boolean | null;
  catalogStatus: string | null;
  source: string | null;
  catalogKind: string | null;
  tokenKey: string;
};

const ROW_SELECT = `
  id, employee_id, company_id, document_type_key, required, status,
  file_ref, archived_at, created_at, updated_at
`;

@Injectable()
export class EmpDocumentChecklistService implements OnModuleInit {
  constructor(
    private readonly db: HrmDbService,
    private readonly empDocumentTypeService: EmpDocumentTypeService,
  ) {}

  async onModuleInit() {
    await this.ensureSchema();
  }

  async ensureSchema(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_document_checklist_item (
        id UUID PRIMARY KEY,
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        document_type_key TEXT NOT NULL,
        required BOOLEAN NOT NULL DEFAULT FALSE,
        status TEXT NOT NULL DEFAULT 'missing',
        file_ref TEXT NULL,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_hrm_document_checklist_item_status
          CHECK (status IN ('missing', 'submitted', 'approved'))
      );
    `);
    // DENY closed document_type_key IN (…) — open TEXT only (format at API layer).
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ${UQ_HRM_DOC_CHK_EMP_KEY_ACTIVE}
      ON public.hrm_document_checklist_item (employee_id, lower(document_type_key))
      WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_doc_chk_company_employee_active
      ON public.hrm_document_checklist_item (company_id, employee_id)
      WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_doc_chk_company_employee_status
      ON public.hrm_document_checklist_item (company_id, employee_id, status)
      WHERE archived_at IS NULL;
    `);
  }

  private mapDisplay(
    row: HrmDocumentChecklistItemRow,
    enrich: CatalogEnrich,
  ) {
    return {
      id: row.id,
      employeeId: row.employee_id,
      companyId: row.company_id,
      documentTypeKey: row.document_type_key,
      required: Boolean(row.required),
      status: row.status as HrmDocumentChecklistStatus,
      fileRef: row.file_ref,
      archivedAt: row.archived_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      nameVi: enrich.nameVi,
      documentTypeNameVi: enrich.documentTypeNameVi,
      sortOrder: enrich.sortOrder,
      requiredByDefault: enrich.requiredByDefault,
      blocksActivation: enrich.blocksActivation,
      requiresExpiry: enrich.requiresExpiry,
      catalogStatus: enrich.catalogStatus,
      source: enrich.source,
      catalogKind: enrich.catalogKind,
      tokenKey: enrich.tokenKey,
    };
  }

  private fallbackEnrich(documentTypeKey: string): CatalogEnrich {
    return {
      nameVi: documentTypeKey,
      documentTypeNameVi: documentTypeKey,
      sortOrder: 9999,
      requiredByDefault: null,
      blocksActivation: null,
      requiresExpiry: null,
      catalogStatus: null,
      source: null,
      catalogKind: null,
      tokenKey: mergeTokenKeyForEmpDoc(documentTypeKey),
    };
  }

  private enrichFromDisplay(
    key: string,
    hit: EmpDocumentTypeDisplay | null | undefined,
  ): CatalogEnrich {
    if (!hit) {
      return this.fallbackEnrich(key);
    }
    return {
      nameVi: hit.nameVi || key,
      documentTypeNameVi: hit.nameVi || key,
      sortOrder: Number(hit.sortOrder ?? 100),
      requiredByDefault: Boolean(hit.requiredByDefault),
      blocksActivation: Boolean(hit.blocksActivation),
      requiresExpiry: Boolean(hit.requiresExpiry),
      catalogStatus: hit.status,
      source: hit.source,
      catalogKind: hit.catalogKind,
      tokenKey: mergeTokenKeyForEmpDoc(key),
    };
  }

  private async loadParentEmployee(
    employeeId: string,
    companyId: string,
    authorization: string | undefined,
    scopeContext: HrmListScopeContext | undefined,
  ): Promise<EmployeeRow> {
    const scope = resolveHrmListScope(authorization, companyId, scopeContext);
    const filters: string[] = ['id = $1::uuid', 'archived_at IS NULL'];
    const values: unknown[] = [employeeId];
    pushEmployeeListScopeFilters(filters, values, scope);
    const res = await this.db.query<EmployeeRow>(
      `
        SELECT
          id, company_id, employee_code, email, full_name, job_title_key,
          manager_id, status, hired_at, archived_at, avatar_url, custom_fields,
          created_at, updated_at
        FROM public.employees
        WHERE ${filters.join(' AND ')};
      `,
      values,
    );
    let row = res.rows[0];
    if (!row && scope.masterTenantPartition) {
      const filters2: string[] = ['id = $1::uuid', 'archived_at IS NULL'];
      const values2: unknown[] = [employeeId];
      pushEmployeeListScopeFilters(filters2, values2, scope, {
        skipTenantPartition: true,
      });
      const res2 = await this.db.query<EmployeeRow>(
        `
          SELECT
            id, company_id, employee_code, email, full_name, job_title_key,
            manager_id, status, hired_at, archived_at, avatar_url, custom_fields,
            created_at, updated_at
          FROM public.employees
          WHERE ${filters2.join(' AND ')};
        `,
        values2,
      );
      row = res2.rows[0];
    }
    if (!row) {
      throw new ApiException(
        HRM_CORE_CHK_404,
        'Employee not found for document checklist',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_CORE_CHK_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return row;
  }

  private assertStatus(raw: string): HrmDocumentChecklistStatus {
    const status = raw.trim().toLowerCase();
    if (
      !(HRM_DOCUMENT_CHECKLIST_STATUSES as readonly string[]).includes(status)
    ) {
      throw new ApiException(
        HRM_CORE_CHK_VAL_400,
        `status must be one of: ${HRM_DOCUMENT_CHECKLIST_STATUSES.join('|')}`,
        HttpStatus.BAD_REQUEST,
        { status: raw },
      );
    }
    return status as HrmDocumentChecklistStatus;
  }

  /** DATA §4.4 — all transitions among the three statuses are legal (re-open OK). */
  private assertStatusTransition(
    from: string,
    to: HrmDocumentChecklistStatus,
  ): void {
    if (from === to) return;
    if (!(HRM_DOCUMENT_CHECKLIST_STATUSES as readonly string[]).includes(from)) {
      throw new ApiException(
        HRM_CORE_CHK_VAL_400,
        `Illegal current status '${from}'`,
        HttpStatus.BAD_REQUEST,
      );
    }
    // All pairwise transitions among missing|submitted|approved are legal.
  }

  private async loadCatalogMap(
    companyId: string,
    keys: string[],
    authorization?: string,
    tenantId?: string,
  ): Promise<Map<string, EmpDocumentTypeDisplay>> {
    const map = new Map<string, EmpDocumentTypeDisplay>();
    if (keys.length === 0) return map;
    try {
      const effective = await this.empDocumentTypeService.listEffective(
        { company_id: companyId },
        authorization,
        { tenantId },
      );
      for (const row of effective.data) {
        map.set(row.documentTypeKey, row);
      }
    } catch {
      // enrich best-effort — never crash list/get on catalog miss
    }
    // History retired keys: load native including archived/retired for missing keys.
    const missing = keys.filter((k) => !map.has(k));
    if (missing.length === 0) return map;
    try {
      const res = await this.db.query<{
        document_type_key: string;
        name_vi: string;
        sort_order: number;
        required_by_default: boolean;
        requires_expiry: boolean;
        blocks_activation: boolean;
        status: string;
      }>(
        `
          SELECT document_type_key, name_vi, sort_order, required_by_default,
                 requires_expiry, blocks_activation, status
          FROM public.emp_document_type
          WHERE company_id = $1
            AND lower(document_type_key) = ANY($2::text[])
          ORDER BY archived_at NULLS FIRST, updated_at DESC;
        `,
        [companyId, missing.map((k) => k.toLowerCase())],
      );
      for (const row of res.rows) {
        if (map.has(row.document_type_key)) continue;
        map.set(row.document_type_key, {
          id: '',
          companyId,
          documentTypeKey: row.document_type_key,
          nameVi: row.name_vi,
          sortOrder: Number(row.sort_order ?? 100),
          requiredByDefault: Boolean(row.required_by_default),
          requiresExpiry: Boolean(row.requires_expiry),
          blocksActivation: Boolean(row.blocks_activation),
          isIdentityDoc: false,
          allowedMime: null,
          metadata: null,
          status: row.status,
          source: 'emp_native',
          catalogKind: 'emp_document_type',
          archivedAt: null,
          updatedAt: '',
          createdAt: '',
        });
      }
    } catch {
      // table may not exist in unit mock — fallback key
    }
    return map;
  }

  private rethrowUniqueConflict(err: unknown): never {
    const pg = err as { code?: string; constraint?: string; message?: string };
    if (
      pg.code === '23505' ||
      /uq_hrm_document_checklist_item_emp_key_active/i.test(pg.constraint ?? '') ||
      /uq_hrm_document_checklist_item_emp_key_active/i.test(pg.message ?? '')
    ) {
      throw new ApiException(
        HRM_CORE_CHK_CONFLICT_409,
        'Active checklist item already exists for this employee and document type key',
        HttpStatus.CONFLICT,
      );
    }
    throw err;
  }

  async listChecklist(
    employeeId: string,
    query: ListEmpDocumentChecklistQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const parent = await this.loadParentEmployee(
      employeeId,
      query.company_id,
      authorization,
      scopeContext,
    );
    const filters: string[] = ['employee_id = $1::uuid', 'company_id = $2::text'];
    const values: unknown[] = [employeeId, parent.company_id];
    if (!query.include_archived) {
      filters.push('archived_at IS NULL');
    }
    const res = await this.db.query<HrmDocumentChecklistItemRow>(
      `
        SELECT ${ROW_SELECT}
        FROM public.hrm_document_checklist_item
        WHERE ${filters.join(' AND ')};
      `,
      values,
    );
    const catalog = await this.loadCatalogMap(
      parent.company_id,
      res.rows.map((r) => r.document_type_key),
      authorization,
      scopeContext?.tenantId,
    );
    const data = res.rows
      .map((row) =>
        this.mapDisplay(
          row,
          this.enrichFromDisplay(
            row.document_type_key,
            catalog.get(row.document_type_key),
          ),
        ),
      )
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.documentTypeKey.localeCompare(b.documentTypeKey);
      });
    return {
      employeeId,
      companyId: parent.company_id,
      total: data.length,
      data,
    };
  }

  async getChecklistItemById(
    employeeId: string,
    itemId: string,
    query: GetEmpDocumentChecklistQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const parent = await this.loadParentEmployee(
      employeeId,
      query.company_id,
      authorization,
      scopeContext,
    );
    const filters: string[] = [
      'id = $1::uuid',
      'employee_id = $2::uuid',
      'company_id = $3::text',
    ];
    const values: unknown[] = [itemId, employeeId, parent.company_id];
    if (!query.include_archived) {
      filters.push('archived_at IS NULL');
    }
    const res = await this.db.query<HrmDocumentChecklistItemRow>(
      `
        SELECT ${ROW_SELECT}
        FROM public.hrm_document_checklist_item
        WHERE ${filters.join(' AND ')};
      `,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_CORE_CHK_404,
        'Document checklist item not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const catalog = await this.loadCatalogMap(
      parent.company_id,
      [row.document_type_key],
      authorization,
      scopeContext?.tenantId,
    );
    return this.mapDisplay(
      row,
      this.enrichFromDisplay(
        row.document_type_key,
        catalog.get(row.document_type_key),
      ),
    );
  }

  async createChecklistItem(
    employeeId: string,
    query: GetEmpDocumentChecklistQueryDto,
    payload: CreateEmpDocumentChecklistDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const parent = await this.loadParentEmployee(
      employeeId,
      query.company_id,
      authorization,
      scopeContext,
    );
    const documentTypeKey = payload.documentTypeKey?.trim() ?? '';
    if (!documentTypeKey) {
      throw new ApiException(
        HRM_CORE_CHK_VAL_400,
        'documentTypeKey is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Wire R-PLT-EMP-01 / BR-PLT-02 — EFF>0 invent → HRM-EMP-DOC-TYPE-UNKNOWN; EFF=0 soft-allow.
    const catalogHit =
      await this.empDocumentTypeService.assertDocumentTypeInEffectiveCatalog({
        companyId: parent.company_id,
        documentTypeKey,
        authorization,
        tenantId: scopeContext?.tenantId,
      });
    const required =
      payload.required ?? catalogHit?.requiredByDefault ?? false;
    const status = payload.status
      ? this.assertStatus(payload.status)
      : 'missing';
    const id = randomUUID();
    let res;
    try {
      res = await this.db.query<HrmDocumentChecklistItemRow>(
        `
          INSERT INTO public.hrm_document_checklist_item (
            id, employee_id, company_id, document_type_key, required, status, file_ref
          ) VALUES (
            $1::uuid, $2::uuid, $3::text, $4, $5, $6, $7
          )
          RETURNING ${ROW_SELECT};
        `,
        [
          id,
          employeeId,
          parent.company_id,
          documentTypeKey,
          required,
          status,
          payload.fileRef ?? null,
        ],
      );
    } catch (err) {
      this.rethrowUniqueConflict(err);
    }
    const row = res.rows[0];
    return this.mapDisplay(
      row,
      this.enrichFromDisplay(documentTypeKey, catalogHit ?? undefined),
    );
  }

  async updateChecklistItem(
    employeeId: string,
    itemId: string,
    query: GetEmpDocumentChecklistQueryDto,
    payload: UpdateEmpDocumentChecklistDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const parent = await this.loadParentEmployee(
      employeeId,
      query.company_id,
      authorization,
      scopeContext,
    );
    const existing = await this.db.query<HrmDocumentChecklistItemRow>(
      `
        SELECT ${ROW_SELECT}
        FROM public.hrm_document_checklist_item
        WHERE id = $1::uuid
          AND employee_id = $2::uuid
          AND company_id = $3::text
          AND archived_at IS NULL;
      `,
      [itemId, employeeId, parent.company_id],
    );
    const current = existing.rows[0];
    if (!current) {
      throw new ApiException(
        HRM_CORE_CHK_404,
        'Document checklist item not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const wantArchive =
      payload.archive === true ||
      (payload.archivedAt !== undefined &&
        payload.archivedAt !== null &&
        String(payload.archivedAt).trim() !== '');

    if (wantArchive) {
      return this.softArchiveChecklistItem(
        employeeId,
        itemId,
        query,
        authorization,
        scopeContext,
      );
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let nextKey = current.document_type_key;
    let catalogHit: EmpDocumentTypeDisplay | null | undefined;

    if (payload.documentTypeKey !== undefined) {
      const key = payload.documentTypeKey.trim();
      if (!key) {
        throw new ApiException(
          HRM_CORE_CHK_VAL_400,
          'documentTypeKey cannot be empty',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (key.toLowerCase() !== current.document_type_key.toLowerCase()) {
        catalogHit =
          await this.empDocumentTypeService.assertDocumentTypeInEffectiveCatalog(
            {
              companyId: parent.company_id,
              documentTypeKey: key,
              authorization,
              tenantId: scopeContext?.tenantId,
            },
          );
        nextKey = key;
        updates.push(`document_type_key = $${updates.length + 1}`);
        values.push(key);
      }
    }

    if (payload.status !== undefined) {
      const nextStatus = this.assertStatus(payload.status);
      this.assertStatusTransition(current.status, nextStatus);
      updates.push(`status = $${updates.length + 1}`);
      values.push(nextStatus);
    }
    if (payload.required !== undefined) {
      updates.push(`required = $${updates.length + 1}`);
      values.push(payload.required);
    }
    if (payload.fileRef !== undefined) {
      updates.push(`file_ref = $${updates.length + 1}`);
      values.push(payload.fileRef);
    }
    if (payload.archivedAt === null) {
      // explicit un-archive not supported on active-only path — no-op field
    }

    if (updates.length === 0) {
      throw new ApiException(
        HRM_CORE_CHK_VAL_400,
        'Không có trường nào để cập nhật',
        HttpStatus.BAD_REQUEST,
      );
    }

    let res;
    try {
      res = await this.db.query<HrmDocumentChecklistItemRow>(
        `
          UPDATE public.hrm_document_checklist_item
          SET ${updates.join(', ')}, updated_at = NOW()
          WHERE id = $${updates.length + 1}::uuid
            AND employee_id = $${updates.length + 2}::uuid
            AND company_id = $${updates.length + 3}::text
            AND archived_at IS NULL
          RETURNING ${ROW_SELECT};
        `,
        [...values, itemId, employeeId, parent.company_id],
      );
    } catch (err) {
      this.rethrowUniqueConflict(err);
    }
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_CORE_CHK_404,
        'Document checklist item not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (!catalogHit) {
      const catalog = await this.loadCatalogMap(
        parent.company_id,
        [nextKey],
        authorization,
        scopeContext?.tenantId,
      );
      catalogHit = catalog.get(nextKey);
    }
    return this.mapDisplay(
      row,
      this.enrichFromDisplay(nextKey, catalogHit ?? undefined),
    );
  }

  /** Soft-delete product path — sets archived_at (DENY hard DELETE as sole SoT). */
  async softArchiveChecklistItem(
    employeeId: string,
    itemId: string,
    query: GetEmpDocumentChecklistQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const parent = await this.loadParentEmployee(
      employeeId,
      query.company_id,
      authorization,
      scopeContext,
    );
    const res = await this.db.query<HrmDocumentChecklistItemRow>(
      `
        UPDATE public.hrm_document_checklist_item
        SET archived_at = NOW(), updated_at = NOW()
        WHERE id = $1::uuid
          AND employee_id = $2::uuid
          AND company_id = $3::text
          AND archived_at IS NULL
        RETURNING ${ROW_SELECT};
      `,
      [itemId, employeeId, parent.company_id],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_CORE_CHK_404,
        'Document checklist item not found or already archived',
        HttpStatus.NOT_FOUND,
      );
    }
    const catalog = await this.loadCatalogMap(
      parent.company_id,
      [row.document_type_key],
      authorization,
      scopeContext?.tenantId,
    );
    return this.mapDisplay(
      row,
      this.enrichFromDisplay(
        row.document_type_key,
        catalog.get(row.document_type_key),
      ),
    );
  }

  /**
   * R-CORE-07-GATE-01 — derive checklist_complete / can_activate / blocking_items[]
   * from LIVE checklist instance + DOC required_by_default / blocks_activation.
   * DENY invent completeness table · DENY silent allow · O8 override OUT.
   */
  async evaluateActivationGate(
    employeeId: string,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<EmpActivationGateResult> {
    await this.ensureSchema();
    const parent = await this.loadParentEmployee(
      employeeId,
      companyId,
      authorization,
      scopeContext,
    );
    const itemRes = await this.db.query<HrmDocumentChecklistItemRow>(
      `
        SELECT ${ROW_SELECT}
        FROM public.hrm_document_checklist_item
        WHERE employee_id = $1::uuid
          AND company_id = $2::text
          AND archived_at IS NULL;
      `,
      [employeeId, parent.company_id],
    );
    let catalogRows: EmpDocumentTypeDisplay[] = [];
    try {
      const effective = await this.empDocumentTypeService.listEffective(
        { company_id: parent.company_id },
        authorization,
        { tenantId: scopeContext?.tenantId },
      );
      catalogRows = effective.data ?? [];
    } catch {
      catalogRows = [];
    }
    const catalogByKey = new Map<string, EmpDocumentTypeDisplay>();
    for (const row of catalogRows) {
      catalogByKey.set(row.documentTypeKey.toLowerCase(), row);
    }

    type GateCandidate = {
      documentTypeKey: string;
      nameVi: string;
      status: string;
      required: boolean;
      blocksActivation: boolean;
    };
    const candidates = new Map<string, GateCandidate>();

    for (const row of itemRes.rows) {
      const hit = catalogByKey.get(row.document_type_key.toLowerCase());
      const enrich = this.enrichFromDisplay(row.document_type_key, hit);
      const blocksActivation = Boolean(enrich.blocksActivation);
      const required =
        Boolean(row.required) ||
        Boolean(enrich.requiredByDefault) ||
        blocksActivation;
      candidates.set(row.document_type_key.toLowerCase(), {
        documentTypeKey: row.document_type_key,
        nameVi: enrich.nameVi || row.document_type_key,
        status: row.status,
        required,
        blocksActivation,
      });
    }

    // DOC flags without checklist instance → synthetic missing (DENY silent allow when EFF>0).
    for (const doc of catalogRows) {
      const key = doc.documentTypeKey.toLowerCase();
      const blocksActivation = Boolean(doc.blocksActivation);
      const requiredByDefault = Boolean(doc.requiredByDefault);
      if (!requiredByDefault && !blocksActivation) continue;
      if (candidates.has(key)) continue;
      candidates.set(key, {
        documentTypeKey: doc.documentTypeKey,
        nameVi: doc.nameVi || doc.documentTypeKey,
        status: 'missing',
        required: true,
        blocksActivation,
      });
    }

    const blocking_items: EmpActivationBlockingItem[] = [];
    for (const c of candidates.values()) {
      const approved = c.status === 'approved';
      if ((c.required || c.blocksActivation) && !approved) {
        blocking_items.push({
          documentTypeKey: c.documentTypeKey,
          nameVi: c.nameVi,
          status: c.status,
        });
      }
    }
    blocking_items.sort((a, b) =>
      a.documentTypeKey.localeCompare(b.documentTypeKey),
    );

    const checklist_complete = blocking_items.length === 0;
    return {
      employeeId,
      companyId: parent.company_id,
      checklist_complete,
      can_activate: checklist_complete,
      blocking_items,
    };
  }
}
