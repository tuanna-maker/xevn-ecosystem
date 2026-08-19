/**
 * @CODE-MEMORY
 * Screen:     HRM → Tuyển dụng → Catalog giai đoạn pipeline (`/recruitment/pipeline-stages`)
 * UC:         AC-PLT-REC-02..05 · FR-UC-BP-REC-05 · BR-PLT-02/04/05/06
 * BR:         Open catalog · HRM writer SoT · WF ops map ≠ second catalog · soft-delete · U19
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01.md §2 · §2.5 · §5
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md §3 F-REC-CAT-*
 * DB_DESIGN:  docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §2.4a
 * API_DESIGN: F-REC-CAT-STG-01/02 · F-REC-CAT-EFF-01
 * Purpose:    ensureSchema rec_pipeline_stage + CRUD/retire + effective + APP-02 / IV soft-gate assert.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01
 * Coded:      2026-08-07
 * Callers:    recruitment.controller · RecruitmentCatalogService · RecruitmentService (IV soft)
 * Callees:    HrmDbService · resolveHrmListScope
 * FEActions:  Settings Tạo giai đoạn → list F5 → form đổi trạng thái chọn mã mới
 * BEChain:    ensureSchema → scope filter → soft archive · assert to_stage ∈ effective
 * Impact:     Closed enum reject 7th key = phá BR-PLT-05; hard-delete = phá history
 * must_keep:  JD DnD / rec_jd_* · IV one-active · hire→EMP · YCTD · U65 empty [] OK ·
 *             FORBIDDEN hard-delete / CHECK stage_key IN (starter six) · wf_task_type_key ops-only
 * SOLID:      Catalog CRUD tách TXN application stage / JD / IV
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-BE-01
 * ADD assertInterviewScheduleAllowed → HRM-REC-IV-400-STAGE-DISALLOW (VAL-REC-CNS-05).
 * change_mode: ADD · must_keep IV one-active 409 · APP-02 UNKNOWN · U65 · no seed
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
  HRM_PLT_CAT_CODE_CONFLICT,
  HRM_PLT_CAT_CODE_INVALID,
  HRM_REC_IV_STAGE_DISALLOW,
  HRM_REC_STAGE_UNKNOWN,
  HRM_REC_STG_404,
  HRM_REC_STG_HIRED_DUP,
  HRM_REC_STG_HIRED_REQUIRED,
  HRM_VAL_400,
  REC_PIPELINE_STAGE_CATALOG_KIND,
  REC_PIPELINE_STAGE_KEY_FORMAT,
  REC_PIPELINE_STAGE_STATUSES,
  type RecPipelineStageSource,
  type RecPipelineStageStatus,
} from './rec-pipeline-stage.constants';
import type {
  ListEffectiveRecPipelineStagesQueryDto,
  ListRecPipelineStagesQueryDto,
  PatchRecPipelineStageDto,
  UpsertRecPipelineStageDto,
} from './dto/rec-pipeline-stage.dto';

type RecPipelineStageRow = {
  id: string;
  company_id: string;
  stage_key: string;
  name_vi: string;
  sort_order: number;
  is_terminal: boolean;
  is_hired_outcome: boolean;
  is_reject_outcome: boolean;
  allows_interview_schedule: boolean;
  wf_task_type_key: string | null;
  color_token: string | null;
  metadata_json: Record<string, unknown> | string | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RecPipelineStageDisplay = {
  id: string;
  companyId: string;
  stageKey: string;
  nameVi: string;
  sortOrder: number;
  isTerminal: boolean;
  isHiredOutcome: boolean;
  isRejectOutcome: boolean;
  allowsInterviewSchedule: boolean;
  wfTaskTypeKey: string | null;
  colorToken: string | null;
  metadata: Record<string, unknown> | null;
  status: string;
  source: RecPipelineStageSource;
  catalogKind: typeof REC_PIPELINE_STAGE_CATALOG_KIND;
  archivedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

export type RecPipelineStageEffectiveResult = {
  total: number;
  data: RecPipelineStageDisplay[];
  /** Active is_hired_outcome stage_key — null when catalog empty. */
  hiredOutcomeKey: string | null;
};

const SELECT_COLS = `id, company_id, stage_key, name_vi, sort_order,
              is_terminal, is_hired_outcome, is_reject_outcome, allows_interview_schedule,
              wf_task_type_key, color_token, metadata_json,
              status, archived_at, created_at, updated_at`;

@Injectable()
export class RecPipelineStageService {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.rec_pipeline_stage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        stage_key TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 100,
        is_terminal BOOLEAN NOT NULL DEFAULT FALSE,
        is_hired_outcome BOOLEAN NOT NULL DEFAULT FALSE,
        is_reject_outcome BOOLEAN NOT NULL DEFAULT FALSE,
        allows_interview_schedule BOOLEAN NOT NULL DEFAULT TRUE,
        wf_task_type_key TEXT NULL,
        color_token TEXT NULL,
        metadata_json JSONB NULL,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_pipeline_stage_company_key_active
        ON public.rec_pipeline_stage (company_id, lower(stage_key))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_pipeline_stage_hired_outcome_active
        ON public.rec_pipeline_stage (company_id)
        WHERE is_hired_outcome = TRUE AND archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_rec_pipeline_stage_company_status
        ON public.rec_pipeline_stage (company_id, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_rec_pipeline_stage_company_sort
        ON public.rec_pipeline_stage (company_id, sort_order);
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.rec_pipeline_stage
          DROP CONSTRAINT IF EXISTS chk_rec_pipeline_stage_key_format;
        ALTER TABLE public.rec_pipeline_stage
          ADD CONSTRAINT chk_rec_pipeline_stage_key_format
          CHECK (stage_key ~ '^[a-z][a-z0-9_]*$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.rec_pipeline_stage
          DROP CONSTRAINT IF EXISTS chk_rec_pipeline_stage_status;
        ALTER TABLE public.rec_pipeline_stage
          ADD CONSTRAINT chk_rec_pipeline_stage_status
          CHECK (status IN ('active','retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.rec_pipeline_stage
          DROP CONSTRAINT IF EXISTS chk_rec_pipeline_stage_flags;
        ALTER TABLE public.rec_pipeline_stage
          ADD CONSTRAINT chk_rec_pipeline_stage_flags
          CHECK (
            (is_hired_outcome = FALSE OR is_terminal = TRUE)
            AND NOT (is_hired_outcome = TRUE AND is_reject_outcome = TRUE)
          );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: never ADD CHECK stage_key IN ('screening','interview','offer','hired','rejected','withdrawn')
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

  private display(row: RecPipelineStageRow, source: RecPipelineStageSource): RecPipelineStageDisplay {
    return {
      id: row.id,
      companyId: row.company_id,
      stageKey: row.stage_key,
      nameVi: row.name_vi,
      sortOrder: Number(row.sort_order ?? 100),
      isTerminal: Boolean(row.is_terminal),
      isHiredOutcome: Boolean(row.is_hired_outcome),
      isRejectOutcome: Boolean(row.is_reject_outcome),
      allowsInterviewSchedule: row.allows_interview_schedule !== false,
      wfTaskTypeKey: row.wf_task_type_key?.trim() || null,
      colorToken: row.color_token?.trim() || null,
      metadata: this.parseMeta(row.metadata_json),
      status: row.status,
      source,
      catalogKind: REC_PIPELINE_STAGE_CATALOG_KIND,
      archivedAt: row.archived_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }

  private assertKeyFormat(raw: string): string {
    // VAL-REC-STG-02 — validate before lowercasing; uppercase `Interview` must 400.
    const key = raw.trim();
    if (!key || !REC_PIPELINE_STAGE_KEY_FORMAT.test(key)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'stageKey format invalid — expected ^[a-z][a-z0-9_]*$ (format only; not a closed starter set)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  private assertStatus(raw: string): RecPipelineStageStatus {
    const s = raw.trim().toLowerCase() as RecPipelineStageStatus;
    if (!(REC_PIPELINE_STAGE_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `status must be one of ${REC_PIPELINE_STAGE_STATUSES.join(',')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return s;
  }

  private assertFlags(input: {
    isHiredOutcome: boolean;
    isRejectOutcome: boolean;
    isTerminal: boolean;
  }): void {
    if (input.isHiredOutcome && input.isRejectOutcome) {
      throw new ApiException(
        HRM_VAL_400,
        'isHiredOutcome and isRejectOutcome cannot both be true',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (input.isHiredOutcome && !input.isTerminal) {
      throw new ApiException(
        HRM_VAL_400,
        'isHiredOutcome requires isTerminal=true',
        HttpStatus.BAD_REQUEST,
      );
    }
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
  ): Promise<RecPipelineStageRow[]> {
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
        `(lower(stage_key) LIKE $${values.length} OR lower(name_vi) LIKE $${values.length})`,
      );
    }
    const res = await this.db.query<RecPipelineStageRow>(
      `SELECT ${SELECT_COLS}
       FROM public.rec_pipeline_stage
       WHERE ${filters.join(' AND ')}
       ORDER BY sort_order ASC, stage_key ASC;`,
      values,
    );
    return res.rows;
  }

  private resolveHiredOutcomeKey(rows: RecPipelineStageDisplay[]): string | null {
    const hit = rows.find((r) => r.isHiredOutcome && r.status === 'active' && !r.archivedAt);
    return hit?.stageKey ?? null;
  }

  /**
   * F-REC-CAT-EFF-01 — active tenant rows; GĐ1 no XBOS stages REF (include_group_ref reserved no-op).
   */
  async listEffective(
    query: ListEffectiveRecPipelineStagesQueryDto,
    authorization?: string,
    options?: { tenantId?: string },
  ): Promise<RecPipelineStageEffectiveResult> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(authorization, query.company_id, options?.tenantId);
    const rows = await this.loadNativeRows(companyKeys, {
      includeArchived: false,
      status: 'active',
      q: query.q,
    });
    const data = rows.map((r) => this.display(r, 'rec_native'));
    return {
      total: data.length,
      data,
      hiredOutcomeKey: this.resolveHiredOutcomeKey(data),
    };
  }

  /**
   * R-PLT-REC-01 / BR-PLT-02 — when effective catalog >0, reject unknown to_stage.
   * Empty effective = soft allow (U65 honesty; no fake starter).
   */
  async assertStageInEffectiveCatalog(input: {
    companyId: string;
    stageKey: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<RecPipelineStageDisplay | null> {
    const key = input.stageKey.trim().toLowerCase();
    if (!key) {
      throw new ApiException(
        HRM_REC_STAGE_UNKNOWN,
        'stage is required',
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
    const hit = effective.data.find((r) => r.stageKey === key);
    if (!hit) {
      throw new ApiException(
        HRM_REC_STAGE_UNKNOWN,
        `stage '${input.stageKey}' is not in effective pipeline catalog (free-text SoT forbidden)`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return hit;
  }

  /**
   * VAL-REC-CNS-05 / BR-PLT-REC-STAGE-09 — soft-gate IV schedule by stage flag.
   * Empty EFF or stage not in catalog → soft allow (≠ invent UNKNOWN on IV path).
   * Hit with allowsInterviewSchedule=false → HRM-REC-IV-400-STAGE-DISALLOW.
   * FORBIDDEN: reopen one-active lifecycle (HRM-REC-IV-409-ACTIVE unchanged).
   */
  async assertInterviewScheduleAllowed(input: {
    companyId: string;
    stageKey: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<RecPipelineStageDisplay | null> {
    const key = input.stageKey.trim().toLowerCase();
    if (!key) {
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
    const hit = effective.data.find((r) => r.stageKey === key);
    if (!hit) {
      return null;
    }
    if (hit.allowsInterviewSchedule === false) {
      throw new ApiException(
        HRM_REC_IV_STAGE_DISALLOW,
        `stage '${hit.stageKey}' does not allow interview schedule (allows_interview_schedule=false)`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return hit;
  }

  /** F-REC-CAT-STG-01 list */
  async listStages(
    query: ListRecPipelineStagesQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total: number; data: RecPipelineStageDisplay[] }> {
    await this.ensureSchema();
    // GĐ1: include_group_ref reserved — no XBOS stages REF partition yet (BR-PLT-06 / L-REC-CAT-02).
    const { companyKeys } = this.resolveScope(authorization, query.company_id, tenantId);
    const includeArchived = String(query.include_archived ?? '').toLowerCase() === 'true';
    const rows = await this.loadNativeRows(companyKeys, {
      includeArchived,
      status: query.status,
      q: query.q,
    });
    const data = rows.map((r) => this.display(r, 'rec_native'));
    return { total: data.length, data };
  }

  /** F-REC-CAT-STG-01 get-by-id — same scope as list (U19). */
  async getStageById(
    stageId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<RecPipelineStageDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const res = await this.db.query<RecPipelineStageRow>(
      `SELECT ${SELECT_COLS}
       FROM public.rec_pipeline_stage
       WHERE id = $1::uuid
       LIMIT 1;`,
      [stageId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(HRM_REC_STG_404, 'Pipeline stage not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_REC_STG_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return this.display(row, 'rec_native');
  }

  /** F-REC-CAT-STG-02 create / upsert by (company_id, stage_key). */
  async upsertStage(
    body: UpsertRecPipelineStageDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<RecPipelineStageDisplay> {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, body.companyId, { tenantId });
    const stageKey = this.assertKeyFormat(body.stageKey);
    const nameVi = body.nameVi.trim();
    if (!nameVi) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'nameVi is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const isHiredOutcome = Boolean(body.isHiredOutcome);
    const isRejectOutcome = Boolean(body.isRejectOutcome);
    // VAL-REC-STG-06 — prefer reject when hired without terminal (do not silently normalize).
    const isTerminal = Boolean(body.isTerminal);
    this.assertFlags({ isHiredOutcome, isRejectOutcome, isTerminal });
    const status = body.status ? this.assertStatus(body.status) : 'active';
    const sortOrder = body.sortOrder ?? 100;
    const allowsInterviewSchedule = body.allowsInterviewSchedule ?? true;
    const wfTaskTypeKey = body.wfTaskTypeKey?.trim() || null;
    const colorToken = body.colorToken?.trim() || null;
    const metadataJson = body.metadata != null ? JSON.stringify(body.metadata) : null;

    const existing = await this.db.query<RecPipelineStageRow>(
      `SELECT ${SELECT_COLS}
       FROM public.rec_pipeline_stage
       WHERE company_id = $1 AND lower(stage_key) = lower($2) AND archived_at IS NULL
       LIMIT 1;`,
      [companyId, stageKey],
    );
    const hit = existing.rows[0];
    if (hit) {
      try {
        const updated = await this.db.query<RecPipelineStageRow>(
          `UPDATE public.rec_pipeline_stage SET
             name_vi = $2,
             sort_order = $3,
             is_terminal = $4,
             is_hired_outcome = $5,
             is_reject_outcome = $6,
             allows_interview_schedule = $7,
             wf_task_type_key = $8,
             color_token = $9,
             metadata_json = $10::jsonb,
             status = $11,
             updated_at = NOW()
           WHERE id = $1::uuid
           RETURNING ${SELECT_COLS};`,
          [
            hit.id,
            nameVi,
            sortOrder,
            isTerminal,
            isHiredOutcome,
            isRejectOutcome,
            allowsInterviewSchedule,
            wfTaskTypeKey,
            colorToken,
            metadataJson,
            status,
          ],
        );
        return this.display(updated.rows[0], 'rec_native');
      } catch (err: unknown) {
        this.rethrowConstraint(err, stageKey);
      }
    }

    try {
      const inserted = await this.db.query<RecPipelineStageRow>(
        `INSERT INTO public.rec_pipeline_stage (
           id, company_id, stage_key, name_vi, sort_order,
           is_terminal, is_hired_outcome, is_reject_outcome, allows_interview_schedule,
           wf_task_type_key, color_token, metadata_json, status
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13
         )
         RETURNING ${SELECT_COLS};`,
        [
          randomUUID(),
          companyId,
          stageKey,
          nameVi,
          sortOrder,
          isTerminal,
          isHiredOutcome,
          isRejectOutcome,
          allowsInterviewSchedule,
          wfTaskTypeKey,
          colorToken,
          metadataJson,
          status,
        ],
      );
      return this.display(inserted.rows[0], 'rec_native');
    } catch (err: unknown) {
      this.rethrowConstraint(err, stageKey);
      throw err;
    }
  }

  private rethrowConstraint(err: unknown, stageKey: string): never {
    const msg = err instanceof Error ? err.message : String(err);
    if (/uq_rec_pipeline_stage_hired_outcome_active/i.test(msg)) {
      throw new ApiException(
        HRM_REC_STG_HIRED_DUP,
        'At most one active is_hired_outcome stage per company',
        HttpStatus.CONFLICT,
      );
    }
    if (/uq_rec_pipeline_stage_company_key_active|duplicate key/i.test(msg)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_CONFLICT,
        `Active stage_key '${stageKey}' already exists for company`,
        HttpStatus.CONFLICT,
      );
    }
    if (/chk_rec_pipeline_stage_flags/i.test(msg)) {
      throw new ApiException(HRM_VAL_400, 'Invalid pipeline stage flags', HttpStatus.BAD_REQUEST);
    }
    throw err instanceof Error ? err : new Error(String(err));
  }

  async patchStage(
    stageId: string,
    companyId: string,
    body: PatchRecPipelineStageDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<RecPipelineStageDisplay> {
    await this.ensureSchema();
    const { scope } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<RecPipelineStageRow>(
      `SELECT ${SELECT_COLS} FROM public.rec_pipeline_stage WHERE id = $1::uuid LIMIT 1;`,
      [stageId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(HRM_REC_STG_404, 'Pipeline stage not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_REC_STG_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'Cannot patch archived pipeline stage — create a new active key if needed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const nextHired =
      body.isHiredOutcome !== undefined ? Boolean(body.isHiredOutcome) : Boolean(row.is_hired_outcome);
    const nextReject =
      body.isRejectOutcome !== undefined
        ? Boolean(body.isRejectOutcome)
        : Boolean(row.is_reject_outcome);
    let nextTerminal =
      body.isTerminal !== undefined ? Boolean(body.isTerminal) : Boolean(row.is_terminal);
    if (nextHired) nextTerminal = true;
    this.assertFlags({
      isHiredOutcome: nextHired,
      isRejectOutcome: nextReject,
      isTerminal: nextTerminal,
    });

    const sets: string[] = [];
    const values: unknown[] = [];
    const assign = (col: string, value: unknown) => {
      values.push(value);
      sets.push(`${col} = $${values.length}`);
    };
    if (body.nameVi !== undefined) assign('name_vi', body.nameVi.trim());
    if (body.sortOrder !== undefined) assign('sort_order', body.sortOrder);
    if (body.isTerminal !== undefined || body.isHiredOutcome !== undefined) {
      assign('is_terminal', nextTerminal);
    }
    if (body.isHiredOutcome !== undefined) assign('is_hired_outcome', nextHired);
    if (body.isRejectOutcome !== undefined) assign('is_reject_outcome', nextReject);
    if (body.allowsInterviewSchedule !== undefined) {
      assign('allows_interview_schedule', body.allowsInterviewSchedule);
    }
    if (body.wfTaskTypeKey !== undefined) {
      assign('wf_task_type_key', body.wfTaskTypeKey?.trim() || null);
    }
    if (body.colorToken !== undefined) {
      assign('color_token', body.colorToken?.trim() || null);
    }
    if (body.metadata !== undefined) {
      values.push(body.metadata == null ? null : JSON.stringify(body.metadata));
      sets.push(`metadata_json = $${values.length}::jsonb`);
    }
    if (body.status !== undefined) assign('status', this.assertStatus(body.status));

    if (!sets.length) {
      return this.display(row, 'rec_native');
    }
    values.push(stageId);
    try {
      const updated = await this.db.query<RecPipelineStageRow>(
        `UPDATE public.rec_pipeline_stage
         SET ${sets.join(', ')}, updated_at = NOW()
         WHERE id = $${values.length}::uuid
         RETURNING ${SELECT_COLS};`,
        values,
      );
      return this.display(updated.rows[0], 'rec_native');
    } catch (err: unknown) {
      this.rethrowConstraint(err, row.stage_key);
    }
  }

  /** Soft-delete — FORBIDDEN hard-delete (BR-PLT-04 / VAL-REC-STG-09). */
  async retireStage(
    stageId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<RecPipelineStageDisplay> {
    await this.ensureSchema();
    const { scope, companyKeys } = this.resolveScope(authorization, companyId, tenantId);
    const existing = await this.db.query<RecPipelineStageRow>(
      `SELECT ${SELECT_COLS} FROM public.rec_pipeline_stage WHERE id = $1::uuid LIMIT 1;`,
      [stageId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(HRM_REC_STG_404, 'Pipeline stage not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_REC_STG_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    if (row.archived_at) {
      return this.display(row, 'rec_native');
    }

    // VAL-REC-STG-10 — sole active hired-outcome cannot retire without reassign.
    if (row.is_hired_outcome) {
      const filters: string[] = [
        'archived_at IS NULL',
        `status = 'active'`,
        'is_hired_outcome = TRUE',
        'id <> $1::uuid',
      ];
      const values: unknown[] = [stageId];
      pushCompanyIdTextColumnFilter(filters, values, companyKeys.length ? companyKeys : [row.company_id]);
      const others = await this.db.query<{ id: string }>(
        `SELECT id::text AS id FROM public.rec_pipeline_stage
         WHERE ${filters.join(' AND ')}
         LIMIT 1;`,
        values,
      );
      if (!others.rows[0]) {
        throw new ApiException(
          HRM_REC_STG_HIRED_REQUIRED,
          'Cannot retire the sole active hired-outcome stage — reassign is_hired_outcome first',
          HttpStatus.PRECONDITION_FAILED,
        );
      }
    }

    const updated = await this.db.query<RecPipelineStageRow>(
      `UPDATE public.rec_pipeline_stage
       SET status = 'retired', archived_at = NOW(), updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING ${SELECT_COLS};`,
      [stageId],
    );
    return this.display(updated.rows[0], 'rec_native');
  }
}
