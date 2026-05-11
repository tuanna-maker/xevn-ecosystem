import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { ListCandidatesQueryDto } from './dto/list-candidates.query.dto';
import { ListJobRequisitionsQueryDto } from './dto/list-job-requisitions.query.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { UpdateInterviewStatusDto } from './dto/update-interview-status.dto';

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

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.job_requisitions (
        id UUID PRIMARY KEY,
        company_id UUID NOT NULL,
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
        company_id UUID NOT NULL,
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
        company_id UUID NOT NULL,
        candidate_id UUID NOT NULL REFERENCES public.recruitment_candidates(id),
        scheduled_at TIMESTAMPTZ NOT NULL,
        interviewer TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_recruitment_interviews_status CHECK (status IN ('scheduled', 'passed', 'failed', 'cancelled'))
      );
    `);
  }

  async createJobRequisition(payload: CreateJobRequisitionDto) {
    await this.ensureSchema();
    const res = await this.db.query<JobRequisitionRow>(
      `INSERT INTO public.job_requisitions
        (id, company_id, title, department, employment_type, status)
       VALUES ($1, $2::uuid, $3, $4, $5, 'open')
       RETURNING id, company_id, title, department, employment_type, status, created_at, updated_at;`,
      [randomUUID(), payload.company_id, payload.title.trim(), payload.department.trim(), payload.employment_type.trim()],
    );
    return res.rows[0];
  }

  async listJobRequisitions(query: ListJobRequisitionsQueryDto) {
    await this.ensureSchema();
    const page = query.page ?? 1;
    const pageSize = query.page_size ?? 20;
    const offset = (page - 1) * pageSize;
    const countRes = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.job_requisitions WHERE company_id = $1::uuid;`,
      [query.company_id],
    );
    const res = await this.db.query<JobRequisitionRow>(
      `SELECT id, company_id, title, department, employment_type, status, created_at, updated_at
       FROM public.job_requisitions
       WHERE company_id = $1::uuid
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3;`,
      [query.company_id, pageSize, offset],
    );
    return { total: Number(countRes.rows[0]?.total ?? 0), page, page_size: pageSize, data: res.rows };
  }

  async createCandidate(payload: CreateCandidateDto) {
    await this.ensureSchema();
    const reqRes = await this.db.query<{ id: string }>(
      `SELECT id FROM public.job_requisitions WHERE id = $1::uuid AND company_id = $2::uuid LIMIT 1;`,
      [payload.requisition_id, payload.company_id],
    );
    if (!reqRes.rows[0]) {
      throw new ApiException('HRM-REC-404', 'Requisition not found', HttpStatus.NOT_FOUND);
    }
    const res = await this.db.query<CandidateRow>(
      `INSERT INTO public.recruitment_candidates
        (id, company_id, requisition_id, full_name, email, source, status)
       VALUES ($1, $2::uuid, $3::uuid, $4, $5, $6, 'new')
       RETURNING id, company_id, requisition_id, full_name, email, source, status, created_at, updated_at;`,
      [randomUUID(), payload.company_id, payload.requisition_id, payload.full_name.trim(), payload.email.toLowerCase().trim(), payload.source.trim()],
    );
    return res.rows[0];
  }

  async listCandidates(query: ListCandidatesQueryDto) {
    await this.ensureSchema();
    const page = query.page ?? 1;
    const pageSize = query.page_size ?? 20;
    const offset = (page - 1) * pageSize;
    const filters = ['company_id = $1::uuid'];
    const values: unknown[] = [query.company_id];
    if (query.requisition_id) {
      filters.push('requisition_id = $2::uuid');
      values.push(query.requisition_id);
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

  async scheduleInterview(payload: ScheduleInterviewDto) {
    await this.ensureSchema();
    const candRes = await this.db.query<{ id: string }>(
      `SELECT id FROM public.recruitment_candidates WHERE id = $1::uuid AND company_id = $2::uuid LIMIT 1;`,
      [payload.candidate_id, payload.company_id],
    );
    if (!candRes.rows[0]) {
      throw new ApiException('HRM-REC-405', 'Candidate not found', HttpStatus.NOT_FOUND);
    }
    const res = await this.db.query<InterviewRow>(
      `INSERT INTO public.recruitment_interviews
        (id, company_id, candidate_id, scheduled_at, interviewer, status)
       VALUES ($1, $2::uuid, $3::uuid, $4::timestamptz, $5, 'scheduled')
       RETURNING id, company_id, candidate_id, scheduled_at, interviewer, status, created_at, updated_at;`,
      [randomUUID(), payload.company_id, payload.candidate_id, payload.scheduled_at, payload.interviewer.trim()],
    );
    return res.rows[0];
  }

  async updateInterviewStatus(interviewId: string, payload: UpdateInterviewStatusDto) {
    await this.ensureSchema();
    const res = await this.db.query<InterviewRow>(
      `UPDATE public.recruitment_interviews
       SET status = $1, updated_at = NOW()
       WHERE id = $2::uuid
       RETURNING id, company_id, candidate_id, scheduled_at, interviewer, status, created_at, updated_at;`,
      [payload.status, interviewId],
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-REC-406', 'Interview not found', HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
  }
}
