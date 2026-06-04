import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { ListCandidatesTableQueryDto } from './dto/list-candidates-table.query.dto';
import { ListJobPostingsQueryDto } from './dto/list-job-postings.query.dto';

@Injectable()
export class RecruitmentCatalogService {
  constructor(private readonly db: HrmDbService) {}

  private async ensureWave2Schema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.job_postings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        title TEXT NOT NULL,
        department TEXT,
        position TEXT NOT NULL,
        employment_type TEXT NOT NULL DEFAULT 'full-time',
        work_location TEXT,
        salary_min NUMERIC,
        salary_max NUMERIC,
        is_salary_visible BOOLEAN NOT NULL DEFAULT TRUE,
        description TEXT,
        requirements TEXT,
        benefits TEXT,
        headcount INTEGER NOT NULL DEFAULT 1,
        applied_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'draft',
        deadline DATE,
        priority TEXT NOT NULL DEFAULT 'medium',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.candidates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        stage TEXT NOT NULL DEFAULT 'applied',
        source TEXT,
        applied_date DATE,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.candidate_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
        job_posting_id UUID NOT NULL REFERENCES public.job_postings (id) ON DELETE CASCADE,
        company_id TEXT NOT NULL,
        applied_date DATE DEFAULT CURRENT_DATE,
        stage TEXT NOT NULL DEFAULT 'applied',
        rating INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        campaign_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_candidate_applications UNIQUE (candidate_id, job_posting_id)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.recruitment_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        title TEXT NOT NULL,
        start_month INTEGER NOT NULL DEFAULT 1,
        end_month INTEGER NOT NULL DEFAULT 12,
        year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
        note TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        creator_name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.headcount_proposals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        title TEXT NOT NULL,
        department TEXT NOT NULL,
        position_name TEXT NOT NULL,
        current_headcount INTEGER NOT NULL DEFAULT 0,
        requested_headcount INTEGER NOT NULL DEFAULT 1,
        proposal_type TEXT NOT NULL DEFAULT 'new',
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'pending',
        justification TEXT,
        expected_start_date DATE,
        salary_budget_min NUMERIC,
        salary_budget_max NUMERIC,
        job_description TEXT,
        requirements TEXT,
        requested_by TEXT NOT NULL DEFAULT 'HR',
        approved_by TEXT,
        approved_at TIMESTAMPTZ,
        rejected_reason TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.candidate_evaluations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        candidate_id UUID NOT NULL,
        interview_id UUID,
        evaluator_name TEXT,
        evaluator_email TEXT,
        total_score NUMERIC,
        weighted_score NUMERIC,
        result TEXT NOT NULL DEFAULT 'pending',
        overall_feedback TEXT,
        recommendation TEXT,
        scores JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.evaluation_criteria_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        weight NUMERIC NOT NULL DEFAULT 10,
        default_required_score INTEGER NOT NULL DEFAULT 3,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.recruitment_plan_departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plan_id UUID NOT NULL REFERENCES public.recruitment_plans (id) ON DELETE CASCADE,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.recruitment_plan_positions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        department_id UUID NOT NULL REFERENCES public.recruitment_plan_departments (id) ON DELETE CASCADE,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        months_data JSONB NOT NULL DEFAULT '[]'::jsonb,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  async listJobPostings(query: ListJobPostingsQueryDto, authorization?: string) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, query.company_id);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (query.status) {
      values.push(query.status);
      filters.push(`status = $${values.length}`);
    }
    const res = await this.db.query(
      `SELECT * FROM public.job_postings WHERE ${filters.join(' AND ')} ORDER BY created_at DESC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createJobPosting(payload: CreateJobPostingDto, authorization?: string) {
    await this.ensureWave2Schema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const id = randomUUID();
    const res = await this.db.query(
      `INSERT INTO public.job_postings (
        id, company_id, title, department, position, employment_type, work_location,
        salary_min, salary_max, is_salary_visible, description, requirements, benefits,
        headcount, deadline, priority, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::date, $16, $17
      ) RETURNING *;`,
      [
        id,
        companyId,
        payload.title.trim(),
        payload.department ?? null,
        payload.position.trim(),
        payload.employment_type ?? 'full-time',
        payload.work_location ?? null,
        payload.salary_min ?? null,
        payload.salary_max ?? null,
        payload.is_salary_visible ?? true,
        payload.description ?? null,
        payload.requirements ?? null,
        payload.benefits ?? null,
        payload.headcount ?? 1,
        payload.deadline ?? null,
        payload.priority ?? 'medium',
        payload.status ?? 'draft',
      ],
    );
    return res.rows[0];
  }

  async deleteJobPosting(id: string, companyId: string, authorization?: string) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `DELETE FROM public.job_postings WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-REC-JP-404', 'Job posting not found', HttpStatus.NOT_FOUND);
    }
    return { id };
  }

  async listCandidatesTable(query: ListCandidatesTableQueryDto, authorization?: string) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, query.company_id);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (query.stage) {
      values.push(query.stage);
      filters.push(`stage = $${values.length}`);
    }
    const res = await this.db.query(
      `SELECT * FROM public.candidates WHERE ${filters.join(' AND ')} ORDER BY created_at DESC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async listCandidateApplications(companyId: string, authorization?: string, jobPostingId?: string) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    if (scope.companyIds.length === 1) {
      values.push(scope.companyIds[0]);
      filters.push(`ca.company_id = $${values.length}::text`);
    } else {
      values.push(scope.companyIds);
      filters.push(`ca.company_id = ANY($${values.length}::text[])`);
    }
    if (jobPostingId) {
      values.push(jobPostingId);
      filters.push(`ca.job_posting_id = $${values.length}::uuid`);
    }
    const res = await this.db.query(
      `SELECT ca.*,
        json_build_object(
          'id', c.id,
          'full_name', c.full_name,
          'email', c.email,
          'phone', c.phone,
          'position', jp.position,
          'stage', c.stage,
          'rating', ca.rating,
          'avatar_url', NULL,
          'applied_date', c.applied_date,
          'source', c.source
        ) AS candidates
       FROM public.candidate_applications ca
       INNER JOIN public.candidates c ON c.id = ca.candidate_id
       LEFT JOIN public.job_postings jp ON jp.id = ca.job_posting_id
       WHERE ${filters.join(' AND ')}
       ORDER BY ca.created_at DESC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createCandidateApplication(
    companyId: string,
    payload: { candidate_id: string; job_posting_id: string; stage?: string },
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const company = resolveHrmPersistCompanyIdText(authorization, companyId);
    const res = await this.db.query(
      `INSERT INTO public.candidate_applications (id, candidate_id, job_posting_id, company_id, stage)
       VALUES ($1, $2::uuid, $3::uuid, $4, $5)
       ON CONFLICT (candidate_id, job_posting_id) DO UPDATE SET stage = EXCLUDED.stage, updated_at = NOW()
       RETURNING *;`,
      [randomUUID(), payload.candidate_id, payload.job_posting_id, company, payload.stage ?? 'applied'],
    );
    return res.rows[0];
  }

  async deleteCandidateApplication(applicationId: string, companyId: string, authorization?: string) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [applicationId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(`DELETE FROM public.candidate_applications WHERE ${filters.join(' AND ')} RETURNING id;`, values);
    if (!res.rows[0]) throw new ApiException('HRM-REC-CA-404', 'Application not found', HttpStatus.NOT_FOUND);
    return { id: applicationId };
  }

  async updateCandidateApplicationStage(
    applicationId: string,
    companyId: string,
    stage: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [applicationId, stage];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `UPDATE public.candidate_applications SET stage = $2, updated_at = NOW() WHERE ${filters.join(' AND ')} RETURNING *;`,
      values,
    );
    if (!res.rows[0]) throw new ApiException('HRM-REC-CA-404', 'Application not found', HttpStatus.NOT_FOUND);
    return res.rows[0];
  }

  async listRecruitmentPlans(companyId: string, authorization?: string) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const plansRes = await this.db.query(
      `SELECT * FROM public.recruitment_plans WHERE ${filters.join(' AND ')} ORDER BY created_at DESC;`,
      values,
    );
    const plans = plansRes.rows as Array<Record<string, unknown> & { id: string }>;
    if (plans.length === 0) {
      return { total: 0, data: [] };
    }
    const planIds = plans.map((p) => p.id);
    const deptsRes = await this.db.query(
      `SELECT * FROM public.recruitment_plan_departments
       WHERE plan_id = ANY($1::uuid[]) ORDER BY sort_order ASC;`,
      [planIds],
    );
    const depts = deptsRes.rows as Array<Record<string, unknown> & { id: string; plan_id: string }>;
    const deptIds = depts.map((d) => d.id);
    let positions: Array<Record<string, unknown>> = [];
    if (deptIds.length > 0) {
      const posRes = await this.db.query(
        `SELECT * FROM public.recruitment_plan_positions
         WHERE department_id = ANY($1::uuid[]) ORDER BY sort_order ASC;`,
        [deptIds],
      );
      positions = posRes.rows;
    }
    const data = plans.map((plan) => {
      const planDepts = depts.filter((d) => d.plan_id === plan.id).map((dept) => ({
        ...dept,
        positions: positions.filter((p) => p.department_id === dept.id),
      }));
      return { ...plan, departments: planDepts };
    });
    return { total: data.length, data };
  }

  async updateJobPosting(
    jobPostingId: string,
    payload: Record<string, unknown>,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const existingRes = await this.db.query(
      `SELECT * FROM public.job_postings WHERE id = $1::uuid LIMIT 1;`,
      [jobPostingId],
    );
    const existing = existingRes.rows[0] as { company_id: string } | undefined;
    if (!existing) {
      throw new ApiException('HRM-REC-JP-404', 'Job posting not found', HttpStatus.NOT_FOUND);
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-JP-404',
      mismatchCode: 'HRM-REC-JP-409',
    });
    const res = await this.db.query(
      `UPDATE public.job_postings SET
        title = COALESCE($2, title),
        department = COALESCE($3, department),
        position = COALESCE($4, position),
        employment_type = COALESCE($5, employment_type),
        work_location = COALESCE($6, work_location),
        salary_min = COALESCE($7, salary_min),
        salary_max = COALESCE($8, salary_max),
        is_salary_visible = COALESCE($9, is_salary_visible),
        description = COALESCE($10, description),
        requirements = COALESCE($11, requirements),
        benefits = COALESCE($12, benefits),
        headcount = COALESCE($13, headcount),
        deadline = COALESCE($14::date, deadline),
        priority = COALESCE($15, priority),
        status = COALESCE($16, status),
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`,
      [
        jobPostingId,
        payload.title ?? null,
        payload.department ?? null,
        payload.position ?? null,
        payload.employment_type ?? null,
        payload.work_location ?? null,
        payload.salary_min ?? null,
        payload.salary_max ?? null,
        payload.is_salary_visible ?? null,
        payload.description ?? null,
        payload.requirements ?? null,
        payload.benefits ?? null,
        payload.headcount ?? null,
        payload.deadline ?? null,
        payload.priority ?? null,
        payload.status ?? null,
      ],
    );
    return res.rows[0];
  }

  async updateCandidatePoolStage(
    candidateId: string,
    companyId: string,
    stage: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const existingRes = await this.db.query(
      `SELECT * FROM public.candidates WHERE id = $1::uuid LIMIT 1;`,
      [candidateId],
    );
    const existing = existingRes.rows[0] as { company_id: string } | undefined;
    if (!existing) {
      throw new ApiException('HRM-REC-CP-404', 'Candidate not found', HttpStatus.NOT_FOUND);
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-CP-404',
      mismatchCode: 'HRM-REC-CP-409',
    });
    const res = await this.db.query(
      `UPDATE public.candidates SET stage = $2, updated_at = NOW() WHERE id = $1::uuid RETURNING *;`,
      [candidateId, stage],
    );
    return res.rows[0];
  }

  async createCandidatePool(
    payload: {
      company_id: string;
      full_name: string;
      email?: string;
      phone?: string;
      source?: string;
      stage?: string;
      applied_date?: string;
      notes?: string;
    },
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const res = await this.db.query(
      `INSERT INTO public.candidates (
        id, company_id, full_name, email, phone, stage, source, applied_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::date, CURRENT_DATE), $9)
      RETURNING *;`,
      [
        randomUUID(),
        companyId,
        payload.full_name.trim(),
        payload.email?.toLowerCase().trim() ?? null,
        payload.phone?.trim() ?? null,
        payload.stage ?? 'applied',
        payload.source?.trim() ?? null,
        payload.applied_date ?? null,
        payload.notes ?? null,
      ],
    );
    return res.rows[0];
  }

  async updateCandidatePool(
    candidateId: string,
    companyId: string,
    payload: {
      full_name?: string;
      email?: string;
      phone?: string;
      source?: string;
      stage?: string;
      applied_date?: string;
      notes?: string;
    },
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const existingRes = await this.db.query(`SELECT company_id FROM public.candidates WHERE id = $1::uuid LIMIT 1;`, [candidateId]);
    assertResourceInHrmScope(existingRes.rows[0], resolveHrmListScope(authorization, companyId), {
      notFoundCode: 'HRM-REC-CP-404',
      mismatchCode: 'HRM-REC-CP-409',
    });
    const res = await this.db.query(
      `UPDATE public.candidates SET
        full_name = COALESCE($2, full_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        source = COALESCE($5, source),
        stage = COALESCE($6, stage),
        applied_date = COALESCE($7::date, applied_date),
        notes = COALESCE($8, notes),
        updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING *;`,
      [
        candidateId,
        payload.full_name?.trim() ?? null,
        payload.email?.toLowerCase().trim() ?? null,
        payload.phone?.trim() ?? null,
        payload.source?.trim() ?? null,
        payload.stage ?? null,
        payload.applied_date ?? null,
        payload.notes ?? null,
      ],
    );
    return res.rows[0];
  }

  async deleteCandidatePool(candidateId: string, companyId: string, authorization?: string) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [candidateId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(`DELETE FROM public.candidates WHERE ${filters.join(' AND ')} RETURNING id;`, values);
    if (!res.rows[0]) {
      throw new ApiException('HRM-REC-CP-404', 'Candidate not found', HttpStatus.NOT_FOUND);
    }
    return { id: candidateId };
  }

  async createRecruitmentPlan(payload: Record<string, unknown>, authorization?: string) {
    await this.ensureWave2Schema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, String(payload.company_id ?? ''));
    const planId = randomUUID();
    const departments = (payload.departments as Array<Record<string, unknown>>) ?? [];
    await this.db.query(
      `INSERT INTO public.recruitment_plans (
        id, company_id, title, start_month, end_month, year, note, status, creator_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        planId,
        companyId,
        String(payload.title ?? '').trim(),
        payload.start_month ?? 1,
        payload.end_month ?? 12,
        payload.year ?? new Date().getFullYear(),
        payload.note ?? null,
        payload.status ?? 'pending',
        payload.creator_name ?? null,
      ],
    );
    for (let i = 0; i < departments.length; i++) {
      const dept = departments[i];
      const deptId = randomUUID();
      await this.db.query(
        `INSERT INTO public.recruitment_plan_departments (id, plan_id, company_id, name, sort_order)
         VALUES ($1, $2, $3, $4, $5);`,
        [deptId, planId, companyId, String(dept.name ?? '').trim(), i],
      );
      const positions = (dept.positions as Array<Record<string, unknown>>) ?? [];
      for (let j = 0; j < positions.length; j++) {
        const pos = positions[j];
        await this.db.query(
          `INSERT INTO public.recruitment_plan_positions (id, department_id, company_id, name, months_data, sort_order)
           VALUES ($1, $2, $3, $4, $5::jsonb, $6);`,
          [
            randomUUID(),
            deptId,
            companyId,
            String(pos.name ?? '').trim(),
            JSON.stringify(pos.months ?? pos.months_data ?? []),
            j,
          ],
        );
      }
    }
    return this.listRecruitmentPlans(companyId, authorization).then((r) => r.data.find((p) => p.id === planId) ?? { id: planId });
  }

  async deleteRecruitmentPlan(planId: string, companyId: string, authorization?: string) {
    await this.ensureWave2Schema();
    const existingRes = await this.db.query(
      `SELECT company_id FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`,
      [planId],
    );
    const existing = existingRes.rows[0] as { company_id: string } | undefined;
    if (!existing) {
      throw new ApiException('HRM-REC-PLAN-404', 'Recruitment plan not found', HttpStatus.NOT_FOUND);
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-PLAN-404',
      mismatchCode: 'HRM-REC-PLAN-409',
    });
    await this.db.query(`DELETE FROM public.recruitment_plans WHERE id = $1::uuid;`, [planId]);
    return { id: planId };
  }

  private async ensureInterviewsSchema() {
    await this.ensureWave2Schema();
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.interviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        candidate_id UUID,
        candidate_name TEXT NOT NULL,
        candidate_email TEXT,
        candidate_phone TEXT,
        job_posting_id UUID,
        position TEXT,
        interview_date DATE NOT NULL DEFAULT CURRENT_DATE,
        interview_time TEXT NOT NULL DEFAULT '09:00',
        duration_minutes INTEGER,
        interview_type TEXT,
        location TEXT,
        meeting_link TEXT,
        interviewer_name TEXT,
        interviewer_email TEXT,
        notes TEXT,
        status TEXT DEFAULT 'scheduled',
        feedback TEXT,
        rating INTEGER,
        interview_round INTEGER DEFAULT 1,
        result TEXT DEFAULT 'pending',
        next_steps TEXT,
        created_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  async listInterviews(companyId: string, authorization?: string) {
    await this.ensureInterviewsSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `SELECT * FROM public.interviews WHERE ${filters.join(' AND ')} ORDER BY interview_date DESC, interview_time DESC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createInterview(payload: Record<string, unknown>, authorization?: string) {
    await this.ensureInterviewsSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, String(payload.company_id ?? ''));
    const res = await this.db.query(
      `INSERT INTO public.interviews (
        id, company_id, candidate_id, candidate_name, candidate_email, candidate_phone,
        job_posting_id, position, interview_date, interview_time, duration_minutes,
        interview_type, location, meeting_link, interviewer_name, interviewer_email,
        notes, status, interview_round, result, next_steps
      ) VALUES (
        $1,$2,$3::uuid,$4,$5,$6,$7::uuid,$8,$9::date,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
      ) RETURNING *;`,
      [
        randomUUID(),
        companyId,
        payload.candidate_id ?? null,
        String(payload.candidate_name ?? 'Candidate').trim(),
        payload.candidate_email ?? null,
        payload.candidate_phone ?? null,
        payload.job_posting_id ?? null,
        payload.position ?? null,
        payload.interview_date ?? new Date().toISOString().slice(0, 10),
        payload.interview_time ?? '09:00',
        payload.duration_minutes ?? 60,
        payload.interview_type ?? 'onsite',
        payload.location ?? null,
        payload.meeting_link ?? null,
        payload.interviewer_name ?? null,
        payload.interviewer_email ?? null,
        payload.notes ?? null,
        payload.status ?? 'scheduled',
        payload.interview_round ?? 1,
        payload.result ?? 'pending',
        payload.next_steps ?? null,
      ],
    );
    return res.rows[0];
  }

  async updateInterview(id: string, payload: Record<string, unknown>, companyId: string, authorization?: string) {
    await this.ensureInterviewsSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query(`SELECT company_id FROM public.interviews WHERE id = $1::uuid LIMIT 1;`, [id]);
    assertResourceInHrmScope(peek.rows[0], scope, { notFoundCode: 'HRM-REC-INT-404', mismatchCode: 'HRM-REC-INT-409' });
    const res = await this.db.query(
      `UPDATE public.interviews SET
        status = COALESCE($2, status),
        rating = COALESCE($3, rating),
        feedback = COALESCE($4, feedback),
        result = COALESCE($5, result),
        next_steps = COALESCE($6, next_steps),
        interview_round = COALESCE($7, interview_round),
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`,
      [
        id,
        payload.status ?? null,
        payload.rating ?? null,
        payload.feedback ?? null,
        payload.result ?? null,
        payload.next_steps ?? null,
        payload.interview_round ?? null,
      ],
    );
    if (!res.rows[0]) throw new ApiException('HRM-REC-INT-404', 'Interview not found', HttpStatus.NOT_FOUND);
    return res.rows[0];
  }

  async deleteInterview(id: string, companyId: string, authorization?: string) {
    await this.ensureInterviewsSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(`DELETE FROM public.interviews WHERE ${filters.join(' AND ')} RETURNING id;`, values);
    if (!res.rows[0]) throw new ApiException('HRM-REC-INT-404', 'Interview not found', HttpStatus.NOT_FOUND);
    return { id };
  }

  async listHeadcountProposals(companyId: string, authorization?: string) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `SELECT * FROM public.headcount_proposals WHERE ${filters.join(' AND ')} ORDER BY created_at DESC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createHeadcountProposal(payload: Record<string, unknown>, authorization?: string) {
    await this.ensureWave2Schema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, String(payload.company_id ?? ''));
    const res = await this.db.query(
      `INSERT INTO public.headcount_proposals (
        id, company_id, title, department, position_name, current_headcount, requested_headcount,
        proposal_type, priority, status, justification, expected_start_date,
        salary_budget_min, salary_budget_max, job_description, requirements, requested_by, notes
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::date,$13,$14,$15,$16,$17,$18
      ) RETURNING *;`,
      [
        randomUUID(),
        companyId,
        payload.title,
        payload.department,
        payload.position_name,
        payload.current_headcount ?? 0,
        payload.requested_headcount ?? 1,
        payload.proposal_type ?? 'new',
        payload.priority ?? 'medium',
        payload.status ?? 'pending',
        payload.justification ?? null,
        payload.expected_start_date ?? null,
        payload.salary_budget_min ?? null,
        payload.salary_budget_max ?? null,
        payload.job_description ?? null,
        payload.requirements ?? null,
        payload.requested_by ?? 'HR',
        payload.notes ?? null,
      ],
    );
    return res.rows[0];
  }

  async updateHeadcountProposalStatus(
    proposalId: string,
    companyId: string,
    status: string,
    authorization?: string,
    rejectedReason?: string,
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query(`SELECT company_id FROM public.headcount_proposals WHERE id = $1::uuid LIMIT 1;`, [
      proposalId,
    ]);
    assertResourceInHrmScope(peek.rows[0], scope, { notFoundCode: 'HRM-REC-HC-404', mismatchCode: 'HRM-REC-HC-409' });
    const res = await this.db.query(
      `UPDATE public.headcount_proposals SET
        status = $2,
        rejected_reason = COALESCE($3, rejected_reason),
        approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE approved_at END,
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`,
      [proposalId, status, rejectedReason ?? null],
    );
    if (!res.rows[0]) throw new ApiException('HRM-REC-HC-404', 'Headcount proposal not found', HttpStatus.NOT_FOUND);
    return res.rows[0];
  }

  async listCandidateEvaluations(companyId: string, authorization?: string, candidateId?: string) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    if (scope.companyIds.length === 1) {
      values.push(scope.companyIds[0]);
      filters.push(`e.company_id = $${values.length}::text`);
    } else {
      values.push(scope.companyIds);
      filters.push(`e.company_id = ANY($${values.length}::text[])`);
    }
    if (candidateId) {
      values.push(candidateId);
      filters.push(`e.candidate_id = $${values.length}::uuid`);
    }
    const res = await this.db.query(
      `SELECT e.*, c.full_name AS candidate_name, c.email AS candidate_email, c.stage AS candidate_position
       FROM public.candidate_evaluations e
       LEFT JOIN public.candidates c ON c.id = e.candidate_id
       WHERE ${filters.join(' AND ')}
       ORDER BY e.created_at DESC;`,
      values,
    );
    const data = res.rows.map((row: Record<string, unknown>) => ({
      ...row,
      scores: Array.isArray(row.scores) ? row.scores : [],
    }));
    return { total: data.length, data };
  }

  async createCandidateEvaluation(payload: Record<string, unknown>, authorization?: string) {
    await this.ensureWave2Schema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, String(payload.company_id ?? ''));
    const res = await this.db.query(
      `INSERT INTO public.candidate_evaluations (
        id, company_id, candidate_id, interview_id, evaluator_name, evaluator_email,
        total_score, weighted_score, result, overall_feedback, recommendation, scores
      ) VALUES ($1,$2,$3::uuid,$4::uuid,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)
      RETURNING *;`,
      [
        randomUUID(),
        companyId,
        payload.candidate_id,
        payload.interview_id ?? null,
        payload.evaluator_name ?? null,
        payload.evaluator_email ?? null,
        payload.total_score ?? null,
        payload.weighted_score ?? null,
        payload.result ?? 'pending',
        payload.overall_feedback ?? null,
        payload.recommendation ?? null,
        JSON.stringify(payload.scores ?? []),
      ],
    );
    return res.rows[0];
  }

  async deleteCandidateEvaluation(evaluationId: string, companyId: string, authorization?: string) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [evaluationId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(`DELETE FROM public.candidate_evaluations WHERE ${filters.join(' AND ')} RETURNING id;`, values);
    if (!res.rows[0]) throw new ApiException('HRM-REC-EVAL-404', 'Evaluation not found', HttpStatus.NOT_FOUND);
    return { id: evaluationId };
  }

  async listEvaluationCriteriaTemplates(companyId: string, authorization?: string) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['is_active = TRUE'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `SELECT * FROM public.evaluation_criteria_templates WHERE ${filters.join(' AND ')} ORDER BY sort_order ASC, created_at ASC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async replaceEvaluationCriteriaTemplates(companyId: string, templates: Record<string, unknown>[], authorization?: string) {
    await this.ensureWave2Schema();
    const resolved = resolveHrmPersistCompanyIdText(authorization, companyId);
    await this.db.query(`DELETE FROM public.evaluation_criteria_templates WHERE company_id = $1;`, [resolved]);
    for (const [index, tpl] of templates.entries()) {
      await this.db.query(
        `INSERT INTO public.evaluation_criteria_templates (
          id, company_id, category, name, weight, default_required_score, sort_order, is_active
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE);`,
        [
          randomUUID(),
          resolved,
          tpl.category,
          tpl.name,
          tpl.weight ?? 10,
          tpl.default_required_score ?? 3,
          tpl.sort_order ?? index,
        ],
      );
    }
    return this.listEvaluationCriteriaTemplates(resolved, authorization);
  }

  async updateRecruitmentPlanStatus(
    planId: string,
    companyId: string,
    status: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const existingRes = await this.db.query(
      `SELECT * FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`,
      [planId],
    );
    const existing = existingRes.rows[0] as { company_id: string } | undefined;
    if (!existing) {
      throw new ApiException('HRM-REC-PLAN-404', 'Recruitment plan not found', HttpStatus.NOT_FOUND);
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-PLAN-404',
      mismatchCode: 'HRM-REC-PLAN-409',
    });
    const res = await this.db.query(
      `UPDATE public.recruitment_plans SET status = $2, updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`,
      [planId, status],
    );
    return res.rows[0];
  }
}
