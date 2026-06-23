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

type JobRequisitionRow = {
  id: string;
  company_id: string;
  title: string;
  department: string;
  employment_type: string;
  status: string;
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
  constructor(private readonly db: HrmDbService) {}
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
        status TEXT NOT NULL DEFAULT 'open',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_job_requisitions_status CHECK (status IN ('open', 'closed', 'on_hold'))
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
  }

  async createJobRequisition(payload: CreateJobRequisitionDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const res = await this.db.query<JobRequisitionRow>(
      `INSERT INTO public.job_requisitions
        (id, company_id, title, department, employment_type, status)
       VALUES ($1, $2::text, $3, $4, $5, 'open')
       RETURNING id, company_id, title, department, employment_type, status, created_at, updated_at;`,
      [randomUUID(), companyId, payload.title.trim(), payload.department.trim(), payload.employment_type.trim()],
    );
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
      `SELECT id, company_id, title, department, employment_type, status, created_at, updated_at
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
      `SELECT id, company_id, title, department, employment_type, status, created_at, updated_at
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
    const peek = await this.db.query<{ company_id: string }>(
      `SELECT company_id::text AS company_id FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1;`,
      [requisitionId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-REC-404',
      mismatchCode: 'HRM-REC-409',
    });
    const values: unknown[] = [payload.status, requisitionId];
    const filters: string[] = ['id = $2::uuid'];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<JobRequisitionRow>(
      `UPDATE public.job_requisitions
       SET status = $1, updated_at = NOW()
       WHERE ${filters.join(' AND ')}
       RETURNING id, company_id, title, department, employment_type, status, created_at, updated_at;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-REC-404', 'Job requisition not found', HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
  }

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
