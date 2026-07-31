/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → Yêu cầu (list/create/get/patch)
 * UC:         UC-HRM-22 · FR-HRM-RC-01 / HRM-RC-01
 * BR:         Số lượng cần tuyển ≥ 1 trên job_requisitions (không nhầm job_postings / proposals)
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.7 FR-HRM-RC-01
 * SRS bước:   Diễn biến #3/#4 thiếu SL / ≤0 · #6 Lưu thành công · #7 F5
 * TechSpec:   docs/hrm/TECHSPEC.md §14.7 · §14.9 G-RC-01 (ref_srs: FR-HRM-RC-01)
 * Purpose:    CRUD yêu cầu TD + submit WF; persist headcount trên public.job_requisitions.
 * WorkItem:   BE-HRM-G-RC-01
 * Coded:      2026-07-21
 * Callers:    recruitment.controller.ts
 * Callees:    HrmDbService · RecruitmentWorkflowBridge · resolveHrmListScope / persist company
 * FEActions:  Thêm YCTD → POST requisitions; list/get hiện headcount; PATCH status (+ optional headcount)
 * BEChain:    ensureSchema → INSERT/SELECT/UPDATE job_requisitions.headcount
 * Impact:     Thiếu cột/field → FE không nghiệm thu FR-RC-01; nhầm bảng posting/proposal = sai aggregate
 * must_keep:  workflow_instance_id LOCK on status PATCH (XHRM-REC-WF); UF-HRM-12 create-without-submit
 * SOLID:      Service owns requisition persistence; catalog owns postings/proposals
 * LastVerified: be-hrm-g-rc-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: Gắn SRS bước Diễn biến #3/#4/#6/#7 trên create/list/get (không đổi logic)
 * Why: Sponsor lock CODE-MEMORY ↔ SRS FR-HRM-RC-01
 * TechSpec: §14.7 (ref_srs: FR-HRM-RC-01)
 * must_keep: G-RC-01 headcount ≥1 · workflow LOCK
 *
 * @CODE-MEMORY-CHANGE 2026-07-21 BE-HRM-G-RC-01
 * ADD job_requisitions.headcount (≥1) on schema + create/list/get/update SELECT/INSERT/UPDATE.
 * must_keep: workflow_instance_id LOCK; do not write job_postings.headcount / headcount_proposals.
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-BE-01
 * ADD workflow_instance_id on job_requisitions SELECT/UPDATE; LOCKED on status PATCH;
 * submitJobRequisitionForApproval spawn. Cite data contract §3–§4. must_keep UF-HRM-12.
 *
 * @CODE-MEMORY-CHANGE 2026-07-21 BE-HRM-G-DB-01-HIRE-LINK-01
 * ADD soft recruitment_candidates.employee_id (NULL, no REFERENCES — G-DB-02 cấm).
 * Hire enforce for FE catalog path lives in RecruitmentCatalogService + hire-employee-link.
 * change_mode: ADD · must_keep G-RC-01 headcount · UF-HRM-12.
 *
 * @CODE-MEMORY-CHANGE 2026-07-21 BE-HRM-G-DB-04-CM-ANNOTATE-01
 * change_mode: ADD (comment-only)
 * What: Paste §17.6.4 must_keep on Lane A spine; note dual-route POST /candidates fork ở controller.
 * Why: G-DB-04 — spine = FR-RC SoT; catalog twin ≠ primary.
 * TechSpec: §17.6.1–§17.6.4 · F1–F10
 * must_keep: G-DB-04 dual catalog — FR-RC-01→job_requisitions only;
 *   FR-RC-03→recruitment_candidates (POST /candidates + requisition_id);
 *   FR-RC-05→recruitment_interviews;
 *   cấm bind FR-RC vào job_postings/candidates/interviews catalog twin làm SoT primary;
 *   INT-01 hire: candidates.employee_id (pool) + soft recruitment_candidates.employee_id — no hard FK G-DB-02;
 *   không giả FK cross-lane A↔B
 * cấm wave: schema merge · hard FK · FE rewrite · logic change
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  HrmListScopeContext,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { ListCandidatesQueryDto } from './dto/list-candidates.query.dto';
import { GetJobRequisitionQueryDto } from './dto/get-job-requisition.query.dto';
import { ListJobRequisitionsQueryDto } from './dto/list-job-requisitions.query.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { UpdateInterviewStatusDto } from './dto/update-interview-status.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';
import {
  RecruitmentWorkflowBridge,
  WF_BUSINESS_TYPE_HRM_REQUISITION,
} from './recruitment-workflow.bridge';

type JobRequisitionRow = {
  id: string;
  company_id: string;
  title: string;
  department: string;
  employment_type: string;
  /** FR-HRM-RC-01 — số lượng cần tuyển (≥1). */
  headcount: number;
  status: string;
  job_description: string | null;
  requirements: string | null;
  job_template_id: string | null;
  workflow_instance_id?: string | null;
  created_at: string;
  updated_at: string;
};

type CandidateRow = {
  id: string;
  company_id: string;
  requisition_id: string;
  full_name: string;
  email: string;
  source: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type InterviewRow = {
  id: string;
  company_id: string;
  candidate_id: string;
  scheduled_at: string;
  interviewer: string;
  status: string;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class RecruitmentService {
  constructor(
    private readonly db: HrmDbService,
    private readonly recruitmentWorkflowBridge: RecruitmentWorkflowBridge,
  ) {}
  private resolvePage(value: number | string | undefined, fallback: number): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.trunc(parsed);
  }

  private resolvePageSize(value: number | string | undefined, fallback: number): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.min(100, Math.trunc(parsed));
  }

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.job_requisitions (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        title TEXT NOT NULL,
        department TEXT NOT NULL,
        employment_type TEXT NOT NULL,
        headcount INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_job_requisitions_status CHECK (status IN ('open', 'closed', 'on_hold')),
        CONSTRAINT chk_job_requisitions_headcount CHECK (headcount >= 1)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.recruitment_candidates (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        requisition_id UUID NOT NULL REFERENCES public.job_requisitions(id),
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        source TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_recruitment_candidates_status CHECK (status IN ('new', 'screening', 'interview', 'offer', 'hired', 'rejected'))
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.recruitment_interviews (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        candidate_id UUID NOT NULL REFERENCES public.recruitment_candidates(id),
        scheduled_at TIMESTAMPTZ NOT NULL,
        interviewer TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_recruitment_interviews_status CHECK (status IN ('scheduled', 'passed', 'failed', 'cancelled'))
      );
    `);
    // Backward-compatible conversion if old schema existed with UUID company_id.
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
    await this.db.query(`
      ALTER TABLE public.recruitment_candidates
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
    await this.db.query(`
      ALTER TABLE public.recruitment_interviews
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS job_description TEXT;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS requirements TEXT;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS job_template_id TEXT;
    `);
    // G-DB-01 / FR-HRM-INT-01 — soft employee link on spine candidate (no REFERENCES — G-DB-02).
    await this.db.query(`
      ALTER TABLE public.recruitment_candidates
      ADD COLUMN IF NOT EXISTS employee_id UUID NULL;
    `);
    // G-RC-01 / FR-HRM-RC-01 — số lượng cần tuyển (không đụng job_postings.headcount).
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS headcount INTEGER NOT NULL DEFAULT 1;
    `);
    await this.db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'chk_job_requisitions_headcount'
        ) THEN
          ALTER TABLE public.job_requisitions
            ADD CONSTRAINT chk_job_requisitions_headcount CHECK (headcount >= 1);
        END IF;
      END $$;
    `);
    await this.recruitmentWorkflowBridge.ensureSchema();
  }

  /**
   * @CODE-MEMORY method · FR-HRM-RC-01 · G-RC-01
   * SRS bước: Diễn biến #4 Số lượng ≤0 · #6 Lưu thành công
   * TechSpec: §14.7 · §14.9 G-RC-01
   */
  async createJobRequisition(payload: CreateJobRequisitionDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const headcount = Math.trunc(Number(payload.headcount));
    // Thất bại: Diễn biến #4 — số lượng ≤ 0 (defense + DTO @Min(1)).
    if (!Number.isFinite(headcount) || headcount < 1) {
      throw new ApiException(
        'HRM-REC-400',
        'Requisition headcount must be an integer greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }
    const res = await this.db.query<JobRequisitionRow>(
      `INSERT INTO public.job_requisitions
        (id, company_id, title, department, employment_type, headcount, status, job_description, requirements, job_template_id)
       VALUES ($1, $2::text, $3, $4, $5, $6, 'open', $7, $8, $9)
       RETURNING id, company_id, title, department, employment_type, headcount, status,
                 job_description, requirements, job_template_id, created_at, updated_at;`,
      [
        randomUUID(),
        companyId,
        payload.title.trim(),
        payload.department.trim(),
        payload.employment_type.trim(),
        headcount,
        payload.job_description?.trim() || null,
        payload.requirements?.trim() || null,
        payload.job_template_id?.trim() || null,
      ],
    );
    // Thành công: Diễn biến #6 — khóa YCTD + headcount (G-RC-01).
    return res.rows[0];
  }

  async listJobRequisitions(
    query: ListJobRequisitionsQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id, scopeContext);
    const page = this.resolvePage(query.page, 1);
    const pageSize = this.resolvePageSize(query.page_size ?? query.pageSize, 20);
    const offset = (page - 1) * pageSize;
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const whereClause = filters.join(' AND ');
    const countRes = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.job_requisitions WHERE ${whereClause};`,
      values,
    );
    const res = await this.db.query<JobRequisitionRow>(
      `SELECT id, company_id, title, department, employment_type, headcount, status,
              job_description, requirements, job_template_id,
              workflow_instance_id::text AS workflow_instance_id,
              created_at, updated_at
       FROM public.job_requisitions
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2};`,
      [...values, pageSize, offset],
    );
    return { total: Number(countRes.rows[0]?.total ?? 0), page, page_size: pageSize, data: res.rows };
  }

  async getJobRequisitionById(
    requisitionId: string,
    query: GetJobRequisitionQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id, scopeContext);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [requisitionId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<JobRequisitionRow>(
      `SELECT id, company_id, title, department, employment_type, headcount, status,
              job_description, requirements, job_template_id,
              workflow_instance_id::text AS workflow_instance_id,
              created_at, updated_at
       FROM public.job_requisitions
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-REC-404', 'Job requisition not found', HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
  }

  async updateJobRequisition(
    requisitionId: string,
    payload: UpdateJobRequisitionDto,
    query: GetJobRequisitionQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id, scopeContext);
    const peek = await this.db.query<{
      company_id: string;
      status: string;
      workflow_instance_id: string | null;
    }>(
      `SELECT company_id::text AS company_id, status,
              workflow_instance_id::text AS workflow_instance_id
       FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1;`,
      [requisitionId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-REC-404',
      mismatchCode: 'HRM-REC-409',
    });
    try {
      this.recruitmentWorkflowBridge.assertNotLockedOrThrow(
        peek.rows[0]?.workflow_instance_id,
        peek.rows[0]?.status,
        'requisition',
      );
    } catch (err) {
      if (err instanceof Error && err.message === 'HRM-REC-WF-LOCKED') {
        throw new ApiException(
          'HRM-REC-WF-LOCKED',
          'Requisition status locked while workflow instance is active',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
    const nextHeadcount =
      payload.headcount === undefined || payload.headcount === null
        ? null
        : Math.trunc(Number(payload.headcount));
    if (nextHeadcount !== null && (!Number.isFinite(nextHeadcount) || nextHeadcount < 1)) {
      throw new ApiException(
        'HRM-REC-400',
        'Requisition headcount must be an integer greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }
    const values: unknown[] = [payload.status, nextHeadcount, requisitionId];
    const filters: string[] = ['id = $3::uuid'];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<JobRequisitionRow>(
      `UPDATE public.job_requisitions
       SET status = $1,
           headcount = COALESCE($2, headcount),
           updated_at = NOW()
       WHERE ${filters.join(' AND ')}
       RETURNING id, company_id, title, department, employment_type, headcount, status,
                 job_description, requirements, job_template_id,
                 workflow_instance_id::text AS workflow_instance_id,
                 created_at, updated_at;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-REC-404', 'Job requisition not found', HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
  }

  /**
   * UC-HRM-REC-WF-02 — submit requisition for XBOS approval.
   * UF-HRM-12: create without submit stays `open` and unlocked.
   */
  async submitJobRequisitionForApproval(
    requisitionId: string,
    query: GetJobRequisitionQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    options?: { submitterUserId?: string; tenantId?: string; companySlug?: string },
  ) {
    await this.ensureSchema();
    const existing = await this.getJobRequisitionById(requisitionId, query, authorization, scopeContext);
    if (existing.workflow_instance_id) {
      return {
        ...existing,
        spawn: { workflowInstanceId: existing.workflow_instance_id, idempotent: true },
      };
    }
    const spawn = await this.recruitmentWorkflowBridge.startRecruitmentWorkflowIfConfigured({
      businessType: WF_BUSINESS_TYPE_HRM_REQUISITION,
      businessId: requisitionId,
      companyId: existing.company_id,
      submitterUserId: options?.submitterUserId,
      tenantId: options?.tenantId,
      companySlug: options?.companySlug ?? existing.company_id,
    });
    const refreshed = await this.getJobRequisitionById(requisitionId, query, authorization, scopeContext);
    return {
      ...refreshed,
      spawn,
      spawnMissing: !spawn?.workflowInstanceId,
    };
  }

  /**
   * @CODE-MEMORY method · Lane A FR-HRM-RC-03 SoT — recruitment_candidates
   * Entry: POST /candidates + body.requisition_id → HRM-REC-202 (dual-route §17.6.1)
   * must_keep §17.6.4 — không ghi public.candidates · không FK cross-lane
   */
  async createCandidate(payload: CreateCandidateDto, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, payload.company_id);
    const reqFilters: string[] = ['id = $1::uuid'];
    const reqValues: unknown[] = [payload.requisition_id];
    pushCompanyIdFilter(reqFilters, reqValues, scope.companyIds);
    const reqRes = await this.db.query<{ id: string; company_id: string }>(
      `SELECT id, company_id FROM public.job_requisitions WHERE ${reqFilters.join(' AND ')} LIMIT 1;`,
      reqValues,
    );
    if (!reqRes.rows[0]) {
      throw new ApiException('HRM-REC-404', 'Requisition not found', HttpStatus.NOT_FOUND);
    }
    const res = await this.db.query<CandidateRow>(
      `INSERT INTO public.recruitment_candidates
        (id, company_id, requisition_id, full_name, email, source, status)
       VALUES ($1, $2::text, $3::uuid, $4, $5, $6, 'new')
       RETURNING id, company_id, requisition_id, full_name, email, source, status, created_at, updated_at;`,
      [
        randomUUID(),
        reqRes.rows[0].company_id,
        payload.requisition_id,
        payload.full_name.trim(),
        payload.email?.toLowerCase().trim() ?? '',
        payload.source?.trim() ?? '',
      ],
    );
    return res.rows[0];
  }

  async listCandidates(
    query: ListCandidatesQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id, scopeContext);
    const page = this.resolvePage(query.page, 1);
    const pageSize = this.resolvePageSize(query.page_size, 20);
    const offset = (page - 1) * pageSize;
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (query.requisition_id) {
      values.push(query.requisition_id);
      filters.push(`requisition_id = $${values.length}::uuid`);
    }
    const whereClause = filters.join(' AND ');
    const countRes = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.recruitment_candidates WHERE ${whereClause};`,
      values,
    );
    const res = await this.db.query<CandidateRow>(
      `SELECT id, company_id, requisition_id, full_name, email, source, status, created_at, updated_at
       FROM public.recruitment_candidates
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2};`,
      [...values, pageSize, offset],
    );
    return { total: Number(countRes.rows[0]?.total ?? 0), page, page_size: pageSize, data: res.rows };
  }

  /**
   * @CODE-MEMORY method · Lane A GET candidates/:id — FR-HRM-RC-03 scope_parity với listCandidates
   * HTTP: GET …/candidates/:candidateId · table public.recruitment_candidates only (F1–F10)
   * ADR: group CEO main → company_id = ANY(GROUP_MEMBER_SLUGS) — không đọc public.candidates
   */
  async getCandidateById(
    candidateId: string,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId, scopeContext);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [candidateId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<CandidateRow>(
      `SELECT id, company_id, requisition_id, full_name, email, source, status, created_at, updated_at
       FROM public.recruitment_candidates
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-REC-404', 'Candidate not found', HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
  }

  /**
   * @CODE-MEMORY method · Lane A FR-HRM-RC-05 SoT — recruitment_interviews
   * candidate_id → recruitment_candidates only (F4) · không public.interviews
   * must_keep §17.6.4
   */
  async scheduleInterview(payload: ScheduleInterviewDto, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, payload.company_id);
    const candFilters: string[] = ['id = $1::uuid'];
    const candValues: unknown[] = [payload.candidate_id];
    pushCompanyIdFilter(candFilters, candValues, scope.companyIds);
    const candRes = await this.db.query<{ id: string; company_id: string }>(
      `SELECT id, company_id FROM public.recruitment_candidates WHERE ${candFilters.join(' AND ')} LIMIT 1;`,
      candValues,
    );
    if (!candRes.rows[0]) {
      throw new ApiException('HRM-REC-405', 'Candidate not found', HttpStatus.NOT_FOUND);
    }
    const res = await this.db.query<InterviewRow>(
      `INSERT INTO public.recruitment_interviews
        (id, company_id, candidate_id, scheduled_at, interviewer, status)
       VALUES ($1, $2::text, $3::uuid, $4::timestamptz, $5, 'scheduled')
       RETURNING id, company_id, candidate_id, scheduled_at, interviewer, status, created_at, updated_at;`,
      [
        randomUUID(),
        candRes.rows[0].company_id,
        payload.candidate_id,
        payload.scheduled_at,
        payload.interviewer.trim(),
      ],
    );
    return res.rows[0];
  }

  async updateInterviewStatus(
    interviewId: string,
    payload: UpdateInterviewStatusDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, requestedCompanyId);
    const peek = await this.db.query<{ company_id: string }>(
      `SELECT company_id::text AS company_id FROM public.recruitment_interviews WHERE id = $1::uuid LIMIT 1;`,
      [interviewId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-REC-406',
      mismatchCode: 'HRM-REC-409',
    });
    const values: unknown[] = [payload.status, interviewId];
    const filters: string[] = ['id = $2::uuid'];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<InterviewRow>(
      `UPDATE public.recruitment_interviews
       SET status = $1, updated_at = NOW()
       WHERE ${filters.join(' AND ')}
       RETURNING id, company_id, candidate_id, scheduled_at, interviewer, status, created_at, updated_at;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-REC-406', 'Interview not found', HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
  }
}
