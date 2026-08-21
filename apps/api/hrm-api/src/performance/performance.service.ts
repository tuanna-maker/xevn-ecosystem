/**
 * @CODE-MEMORY
 * Screen:     HRM → Đánh giá hiệu suất (cycles + evaluations)
 * UC:         FR-HRM-PF-01 · FR-HRM-PERF-SM-E3-01
 * BR:         BR-HRM-PERF-E3-01 · BR-HRM-PERF-E3-02 · BR-HRM-PERF-E3-03
 * SRS:        docs/program/deltas/BA_ERP_E3_SRS_01_20260728.md §1.2 · AC-PERF-01..05
 * TechSpec:   docs/hrm/TECHSPEC.md §16.1
 * DB_DESIGN:  docs/hrm/DB_DESIGN_HRM_ERP_E3.md §2–4 · W2 baseline
 * API_DESIGN: docs/hrm/API_DESIGN_HRM_ERP_E3.md §§1–4
 * Purpose:    Chu kỳ + phiếu đánh giá; PATCH/DELETE; SM 4-state; KPI/grade/dept soft catalog.
 * WorkItem:   D-BE-ERP-E3-01
 * Coded:      2026-07-28
 * Callers:    performance.controller.ts
 * Callees:    assertStatusTransition · SettingsCatalogsService.assertCodeInEffectiveCatalog · resolveHrmListScope
 * FE-Actions: Tạo/sửa/xóa chu kỳ · SM phiếu · gắn KPI → PATCH
 * BE-Chain:   ensureSchema → INSERT/SELECT/UPDATE/DELETE + SM helper
 * Impact:     Sai SM → data quality; scope lệch → 404 get/PATCH
 * must_keep:  W2 create/list; cycle draft|active|closed ≠ eval SM; HARD cycle_id CASCADE; U65 no seed
 * SOLID:      Service owns SQL + SM; catalogs Optional inject
 * LastVerified: be-erp-e3-01.spec.ts · performance.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-30 D-HRM-PERF-EVAL-500-01
 * change_mode: FIX
 * What: ensureSchema — repair invalid/null status trước ADD chk_performance_evaluation_status; idempotent DO $$ (no DROP mỗi request)
 * Why: QA-HRM-EMBED-NETWORK-AUDIT-01 GET evaluations?company_id=main → 500 khi legacy rows vi phạm CHECK
 * must_keep: E3 PATCH/DELETE/SM; scope rollup listEvaluations
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-BE-ERP-E3-01
 * change_mode: ADD
 * What: eval status+kpi columns; updateCycle/deleteCycle; updateEvaluation/deleteEvaluation;
 *   assertStatusTransition; catalog KEY asserts; scope_parity load helpers
 * Why: AC-PERF-01..05 · closes create-only gap
 * must_keep: list/create W2; no auto-bulk evals on active; HOLD_DEPLOY
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { assertStatusTransition } from '../common/assert-status-transition';
import {
  assertResourceInHrmScope,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { MASTER_TENANT_ID } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { CreatePerformanceCycleDto } from './dto/create-performance-cycle.dto';
import { CreatePerformanceEvaluationDto } from './dto/create-performance-evaluation.dto';
import {
  ListPerformanceCyclesQueryDto,
  ListPerformanceEvaluationsQueryDto,
} from './dto/list-performance.query.dto';
import { UpdatePerformanceCycleDto } from './dto/update-performance-cycle.dto';
import { UpdatePerformanceEvaluationDto } from './dto/update-performance-evaluation.dto';

export const HRM_PERF_KPI_KEY = 'HRM-PERF-KPI-KEY';
export const HRM_PERF_GRADE_KEY = 'HRM-PERF-GRADE-KEY';
export const HRM_PERF_DEPT_KEY = 'HRM-PERF-DEPT-KEY';
export const HRM_PERF_LOCKED = 'HRM-PERF-LOCKED';
export const HRM_PERF_DEL_BLOCK = 'HRM-PERF-DEL-BLOCK';
export const HRM_PERF_EVAL_DUP = 'HRM-PERF-EVAL-DUP';
export const HRM_PERF_CYCLE_STATE = 'HRM-PERF-CYCLE-STATE';

type PerformanceCycleRow = {
  id: string;
  company_id: string;
  cycle_name: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'closed';
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type PerformanceEvaluationRow = {
  id: string;
  company_id: string;
  employee_id: string;
  cycle_id: string;
  score: number;
  summary: string;
  reviewer: string;
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  kpi_code: string | null;
  job_grade_key: string | null;
  department_key: string | null;
  kpi_name: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

const EVAL_SELECT = `id, company_id, employee_id, cycle_id, score, summary, reviewer, status,
  kpi_code, job_grade_key, department_key, kpi_name, submitted_at, approved_at, completed_at, created_at, updated_at`;

@Injectable()
export class PerformanceService {
  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
  ) {}

  private resolveCatalogTenantId(): string {
    return masterTenantIdFromEnv() || MASTER_TENANT_ID;
  }

  /** SRS open ≡ DB active */
  private normalizeCycleStatus(
    raw: string | undefined,
  ): 'draft' | 'active' | 'closed' | undefined {
    if (raw == null) return undefined;
    const s = raw.trim().toLowerCase();
    if (s === 'open') return 'active';
    if (s === 'draft' || s === 'active' || s === 'closed') return s;
    return undefined;
  }

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.performance_cycles (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        cycle_name TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        created_by TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_performance_cycle_status CHECK (status IN ('draft', 'active', 'closed')),
        CONSTRAINT chk_performance_cycle_dates CHECK (start_date <= end_date)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.performance_evaluations (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        cycle_id UUID NOT NULL REFERENCES public.performance_cycles(id) ON DELETE CASCADE,
        score NUMERIC(5,2) NOT NULL,
        summary TEXT NOT NULL,
        reviewer TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_performance_score CHECK (score >= 0 AND score <= 100)
      );
    `);
    // E3 — eval SM + KPI soft keys (DDL ADD; idempotent — one column per ALTER)
    await this.db.query(
      `ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS status TEXT;`,
    );
    await this.db.query(`
      UPDATE public.performance_evaluations
      SET status = 'draft', updated_at = NOW()
      WHERE status IS NULL
         OR TRIM(status) = ''
         OR status NOT IN ('draft','submitted','approved','completed');
    `);
    await this.db.query(`
      ALTER TABLE public.performance_evaluations
      ALTER COLUMN status SET DEFAULT 'draft';
    `);
    await this.db.query(`
      ALTER TABLE public.performance_evaluations
      ALTER COLUMN status SET NOT NULL;
    `);
    await this.db.query(
      `ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS kpi_code TEXT NULL;`,
    );
    await this.db.query(
      `ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS job_grade_key TEXT NULL;`,
    );
    await this.db.query(
      `ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS department_key TEXT NULL;`,
    );
    await this.db.query(
      `ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS kpi_name TEXT NULL;`,
    );
    await this.db.query(
      `ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ NULL;`,
    );
    await this.db.query(
      `ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ NULL;`,
    );
    await this.db.query(
      `ALTER TABLE public.performance_evaluations ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NULL;`,
    );
    await this.db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint c
          INNER JOIN pg_class t ON c.conrelid = t.oid
          INNER JOIN pg_namespace n ON t.relnamespace = n.oid
          WHERE n.nspname = 'public'
            AND t.relname = 'performance_evaluations'
            AND c.conname = 'chk_performance_evaluation_status'
        ) THEN
          ALTER TABLE public.performance_evaluations
            ADD CONSTRAINT chk_performance_evaluation_status
            CHECK (status IN ('draft','submitted','approved','completed'));
        END IF;
      END $$;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_performance_cycles_company_status
      ON public.performance_cycles (company_id, status, start_date DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_performance_evaluations_company_cycle
      ON public.performance_evaluations (company_id, cycle_id, created_at DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_performance_evaluations_company_cycle_status
      ON public.performance_evaluations (company_id, cycle_id, status);
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_performance_evaluations_cycle_employee
      ON public.performance_evaluations (cycle_id, employee_id);
    `);
  }

  private async assertPerfCatalogKey(
    companyId: string,
    catalogKey: string,
    code: string | null | undefined,
    errorCode: string,
  ): Promise<{ code: string; label: string } | null> {
    const trimmed = code?.trim() ?? '';
    if (!trimmed) return null;
    if (!this.settingsCatalogs) return { code: trimmed, label: trimmed };
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId: this.resolveCatalogTenantId(),
      companyId,
      catalogKey,
      code: trimmed,
      errorCode,
      errorMessage: `${errorCode}: '${trimmed}' is not in ${catalogKey} catalog`,
    });
    return { code: hit.code, label: hit.label };
  }

  async createCycle(
    payload: CreatePerformanceCycleDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    if (
      new Date(payload.start_date).getTime() >
      new Date(payload.end_date).getTime()
    ) {
      throw new ApiException(
        'HRM-PERF-001',
        'start_date must be <= end_date',
        HttpStatus.BAD_REQUEST,
      );
    }
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const res = await this.db.query<PerformanceCycleRow>(
      `
        INSERT INTO public.performance_cycles
          (id, company_id, cycle_name, start_date, end_date, created_by, status)
        VALUES ($1, $2, $3, $4::date, $5::date, $6, 'draft')
        RETURNING id, company_id, cycle_name, start_date, end_date, status, created_by, created_at, updated_at;
      `,
      [
        randomUUID(),
        companyId,
        payload.cycle_name.trim(),
        payload.start_date,
        payload.end_date,
        payload.created_by,
      ],
    );
    return res.rows[0];
  }

  async listCycles(
    query: ListPerformanceCyclesQueryDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (query.status) {
      const st = this.normalizeCycleStatus(query.status) ?? query.status;
      filters.push(`status = $${values.length + 1}`);
      values.push(st);
    }
    const res = await this.db.query<PerformanceCycleRow>(
      `
        SELECT id, company_id, cycle_name, start_date, end_date, status, created_by, created_at, updated_at
        FROM public.performance_cycles
        WHERE ${filters.join(' AND ')}
        ORDER BY start_date DESC, created_at DESC;
      `,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  private async loadCycleInScope(
    cycleId: string,
    requestedCompanyId: string,
    authorization?: string,
  ): Promise<PerformanceCycleRow> {
    const scope = resolveHrmListScope(authorization, requestedCompanyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [cycleId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<PerformanceCycleRow>(
      `SELECT id, company_id, cycle_name, start_date, end_date, status, created_by, created_at, updated_at
       FROM public.performance_cycles WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-PERF-404',
      mismatchCode: 'HRM-PERF-409',
    });
    return row;
  }

  /** AC-PERF-01 — PATCH cycle name/dates/status */
  async updateCycle(
    cycleId: string,
    payload: UpdatePerformanceCycleDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const current = await this.loadCycleInScope(
      cycleId,
      requestedCompanyId,
      authorization,
    );
    const nextStatus = this.normalizeCycleStatus(payload.status);
    const touchContent =
      payload.cycle_name !== undefined ||
      payload.start_date !== undefined ||
      payload.end_date !== undefined;
    if (touchContent && current.status === 'closed') {
      throw new ApiException(
        HRM_PERF_LOCKED,
        'Closed cycle is immutable',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (nextStatus !== undefined) {
      assertStatusTransition({
        domain: 'performance_cycle',
        from: current.status,
        to: nextStatus,
        entityId: cycleId,
      });
    }
    const start = payload.start_date ?? current.start_date;
    const end = payload.end_date ?? current.end_date;
    if (new Date(start).getTime() > new Date(end).getTime()) {
      throw new ApiException(
        'HRM-PERF-001',
        'start_date must be <= end_date',
        HttpStatus.BAD_REQUEST,
      );
    }
    const res = await this.db.query<PerformanceCycleRow>(
      `
        UPDATE public.performance_cycles
        SET cycle_name = COALESCE($2, cycle_name),
            start_date = COALESCE($3::date, start_date),
            end_date = COALESCE($4::date, end_date),
            status = COALESCE($5, status),
            updated_at = NOW()
        WHERE id = $1::uuid
        RETURNING id, company_id, cycle_name, start_date, end_date, status, created_by, created_at, updated_at;
      `,
      [
        cycleId,
        payload.cycle_name?.trim() ?? null,
        payload.start_date ?? null,
        payload.end_date ?? null,
        nextStatus ?? null,
      ],
    );
    return res.rows[0];
  }

  /** AC-PERF-02 — DELETE draft only; block if submitted+ evals */
  async deleteCycle(
    cycleId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const current = await this.loadCycleInScope(
      cycleId,
      requestedCompanyId,
      authorization,
    );
    if (current.status !== 'draft') {
      throw new ApiException(
        HRM_PERF_DEL_BLOCK,
        'Only draft cycles can be deleted',
        HttpStatus.CONFLICT,
      );
    }
    const blocking = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.performance_evaluations
       WHERE cycle_id = $1::uuid AND status IN ('submitted','approved','completed');`,
      [cycleId],
    );
    if (Number(blocking.rows[0]?.total ?? 0) > 0) {
      throw new ApiException(
        HRM_PERF_DEL_BLOCK,
        'Cannot delete cycle with submitted/approved/completed evaluations',
        HttpStatus.CONFLICT,
      );
    }
    await this.db.query(
      `DELETE FROM public.performance_cycles WHERE id = $1::uuid;`,
      [cycleId],
    );
    return { id: cycleId, deleted: true };
  }

  async createEvaluation(
    payload: CreatePerformanceEvaluationDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, payload.company_id);
    const cycleFilters: string[] = ['id = $1::uuid'];
    const cycleValues: unknown[] = [payload.cycle_id];
    pushCompanyIdFilter(cycleFilters, cycleValues, scope.companyIds);
    const cycleRes = await this.db.query<{
      id: string;
      company_id: string;
      status: string;
    }>(
      `SELECT id, company_id, status FROM public.performance_cycles WHERE ${cycleFilters.join(' AND ')} LIMIT 1;`,
      cycleValues,
    );
    if (!cycleRes.rows[0]) {
      throw new ApiException(
        'HRM-PERF-404',
        'Performance cycle not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const companyId = cycleRes.rows[0].company_id;
    const kpi = await this.assertPerfCatalogKey(
      companyId,
      'kpi_library',
      (payload as CreatePerformanceEvaluationDto & { kpi_code?: string })
        .kpi_code,
      HRM_PERF_KPI_KEY,
    );
    const grade = await this.assertPerfCatalogKey(
      companyId,
      'job_grades',
      (payload as CreatePerformanceEvaluationDto & { job_grade_key?: string })
        .job_grade_key,
      HRM_PERF_GRADE_KEY,
    );
    const dept = await this.assertPerfCatalogKey(
      companyId,
      'departments',
      (payload as CreatePerformanceEvaluationDto & { department_key?: string })
        .department_key,
      HRM_PERF_DEPT_KEY,
    );
    try {
      const res = await this.db.query<PerformanceEvaluationRow>(
        `
          INSERT INTO public.performance_evaluations
            (id, company_id, employee_id, cycle_id, score, summary, reviewer, status,
             kpi_code, job_grade_key, department_key, kpi_name)
          VALUES ($1, $2, $3::uuid, $4::uuid, $5, $6, $7, 'draft', $8, $9, $10, $11)
          RETURNING ${EVAL_SELECT};
        `,
        [
          randomUUID(),
          companyId,
          payload.employee_id,
          payload.cycle_id,
          payload.score,
          payload.summary.trim(),
          payload.reviewer.trim(),
          kpi?.code ?? null,
          grade?.code ?? null,
          dept?.code ?? null,
          kpi?.label ?? null,
        ],
      );
      return res.rows[0];
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === '23505') {
        throw new ApiException(
          HRM_PERF_EVAL_DUP,
          'Evaluation already exists for this employee in the cycle',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async listEvaluations(
    query: ListPerformanceEvaluationsQueryDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (query.employee_id) {
      filters.push(`employee_id = $${values.length + 1}::uuid`);
      values.push(query.employee_id);
    }
    if (query.cycle_id) {
      filters.push(`cycle_id = $${values.length + 1}::uuid`);
      values.push(query.cycle_id);
    }
    const res = await this.db.query<PerformanceEvaluationRow>(
      `
        SELECT ${EVAL_SELECT}
        FROM public.performance_evaluations
        WHERE ${filters.join(' AND ')}
        ORDER BY created_at DESC;
      `,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  private async loadEvaluationInScope(
    evaluationId: string,
    requestedCompanyId: string,
    authorization?: string,
  ): Promise<PerformanceEvaluationRow> {
    const scope = resolveHrmListScope(authorization, requestedCompanyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [evaluationId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<PerformanceEvaluationRow>(
      `SELECT ${EVAL_SELECT} FROM public.performance_evaluations WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-PERF-404',
      mismatchCode: 'HRM-PERF-409',
    });
    return row;
  }

  /** AC-PERF-03/04/05 — PATCH content (draft only) + SM */
  async updateEvaluation(
    evaluationId: string,
    payload: UpdatePerformanceEvaluationDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const current = await this.loadEvaluationInScope(
      evaluationId,
      requestedCompanyId,
      authorization,
    );
    const contentTouch =
      payload.score !== undefined ||
      payload.summary !== undefined ||
      payload.reviewer !== undefined ||
      payload.kpi_code !== undefined ||
      payload.job_grade_key !== undefined ||
      payload.department_key !== undefined ||
      payload.kpi_name !== undefined;
    if (contentTouch && current.status !== 'draft') {
      throw new ApiException(
        HRM_PERF_LOCKED,
        'Only draft evaluations allow content mutation',
        HttpStatus.BAD_REQUEST,
      );
    }
    const nextStatus = payload.status?.trim().toLowerCase() as
      | PerformanceEvaluationRow['status']
      | undefined;
    if (nextStatus) {
      assertStatusTransition({
        domain: 'performance_evaluation',
        from: current.status,
        to: nextStatus,
        entityId: evaluationId,
      });
      if (
        nextStatus === 'submitted' ||
        nextStatus === 'approved' ||
        nextStatus === 'completed'
      ) {
        const cycle = await this.db.query<{ status: string }>(
          `SELECT status FROM public.performance_cycles WHERE id = $1::uuid LIMIT 1;`,
          [current.cycle_id],
        );
        const cs = cycle.rows[0]?.status;
        if (cs !== 'active') {
          throw new ApiException(
            HRM_PERF_CYCLE_STATE,
            'Cycle must be active (open) to submit/approve/complete evaluation',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }
    const kpi = await this.assertPerfCatalogKey(
      current.company_id,
      'kpi_library',
      payload.kpi_code,
      HRM_PERF_KPI_KEY,
    );
    const grade = await this.assertPerfCatalogKey(
      current.company_id,
      'job_grades',
      payload.job_grade_key,
      HRM_PERF_GRADE_KEY,
    );
    const dept = await this.assertPerfCatalogKey(
      current.company_id,
      'departments',
      payload.department_key,
      HRM_PERF_DEPT_KEY,
    );
    const submittedAt =
      nextStatus === 'submitted'
        ? 'NOW()'
        : nextStatus === undefined
          ? 'submitted_at'
          : 'submitted_at';
    const approvedAt = nextStatus === 'approved' ? 'NOW()' : 'approved_at';
    const completedAt = nextStatus === 'completed' ? 'NOW()' : 'completed_at';
    const res = await this.db.query<PerformanceEvaluationRow>(
      `
        UPDATE public.performance_evaluations
        SET score = COALESCE($2, score),
            summary = COALESCE($3, summary),
            reviewer = COALESCE($4, reviewer),
            status = COALESCE($5, status),
            kpi_code = COALESCE($6, kpi_code),
            job_grade_key = COALESCE($7, job_grade_key),
            department_key = COALESCE($8, department_key),
            kpi_name = COALESCE($9, kpi_name),
            submitted_at = CASE WHEN $5 = 'submitted' THEN NOW() ELSE submitted_at END,
            approved_at = CASE WHEN $5 = 'approved' THEN NOW() ELSE approved_at END,
            completed_at = CASE WHEN $5 = 'completed' THEN NOW() ELSE completed_at END,
            updated_at = NOW()
        WHERE id = $1::uuid
        RETURNING ${EVAL_SELECT};
      `,
      [
        evaluationId,
        payload.score ?? null,
        payload.summary?.trim() ?? null,
        payload.reviewer?.trim() ?? null,
        nextStatus ?? null,
        kpi?.code ??
          (payload.kpi_code === undefined
            ? null
            : payload.kpi_code.trim() || null),
        grade?.code ??
          (payload.job_grade_key === undefined
            ? null
            : payload.job_grade_key.trim() || null),
        dept?.code ??
          (payload.department_key === undefined
            ? null
            : payload.department_key.trim() || null),
        payload.kpi_name?.trim() || kpi?.label || null,
      ],
    );
    void submittedAt;
    void approvedAt;
    void completedAt;
    return res.rows[0];
  }

  async deleteEvaluation(
    evaluationId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const current = await this.loadEvaluationInScope(
      evaluationId,
      requestedCompanyId,
      authorization,
    );
    if (current.status !== 'draft') {
      throw new ApiException(
        HRM_PERF_DEL_BLOCK,
        'Only draft evaluations can be deleted',
        HttpStatus.CONFLICT,
      );
    }
    await this.db.query(
      `DELETE FROM public.performance_evaluations WHERE id = $1::uuid;`,
      [evaluationId],
    );
    return { id: evaluationId, deleted: true };
  }
}
