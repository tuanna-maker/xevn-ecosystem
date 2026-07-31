/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → catalog twin (Lane B) — postings / pool / interviews-catalog / proposals
 * UC:         leftover menu density (không FR-RC primary)
 * BR:         G-DB-04 dual catalog · F1–F10 cấm bind nhầm
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md FR-HRM-RC-01/03/05 · FR-HRM-INT-01 (hire surface pool)
 * TechSpec:   docs/hrm/TECHSPEC.md §17.6 (ref_srs primary = Lane A spine)
 * Purpose:    Persist Wave2 catalog tables; INT-01 hire stamp trên candidates.employee_id (soft).
 * WorkItem:   BE-HRM-G-DB-04-CM-ANNOTATE-01
 * Coded:      2026-07-21
 * Callers:    recruitment.controller.ts (job-postings · candidates-pool · interviews-catalog · headcount-proposals · POST /candidates khi thiếu requisition_id)
 * Callees:    HrmDbService · hire-employee-link · RecruitmentWorkflowBridge
 * must_keep: G-DB-04 dual catalog — FR-RC-01→job_requisitions only;
 *   FR-RC-03→recruitment_candidates (POST /candidates + requisition_id);
 *   FR-RC-05→recruitment_interviews;
 *   cấm bind FR-RC vào job_postings/candidates/interviews catalog twin làm SoT primary;
 *   INT-01 hire: candidates.employee_id (pool) + soft recruitment_candidates.employee_id — no hard FK G-DB-02;
 *   không giả FK cross-lane A↔B
 * SOLID:      Catalog twin ≠ RecruitmentService spine
 * LastVerified: docs/qa/evidence/be-hrm-g-db-04-cm-annotate-01-20260721.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-BE-01
 * ADD workflow lock hooks on stage/status PATCH + submit spawn entry points.
 * Cite: XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §4.1 LOCKED · BR-REC-WF-08/09.
 * must_keep: UF-HRM-12 (no instance → local PATCH allowed), AC-CD-F6-* stages.
 *
 * @CODE-MEMORY-CHANGE 2026-07-21 BE-HRM-G-DB-01-HIRE-LINK-01
 * ADD FR-HRM-INT-01 hire enforce: stage=hired ⇒ employee_id (soft) via hire-employee-link.
 * SRS bước Diễn biến #5 reject HRM-REC-HIRE-400 · #7 stamp employee_id. TechSpec §17.3 G-DB-01.
 * change_mode: ADD · must_keep G-RC-01 · leave CREATE · no hard REFERENCES (G-DB-02).
 *
 * @CODE-MEMORY-CHANGE 2026-07-21 BE-HRM-G-DB-04-CM-ANNOTATE-01
 * change_mode: ADD (comment-only)
 * What: Paste §17.6.4 must_keep + Lane B non-primary FR note trên catalog handlers.
 * Why: SA G-DB-04 residual — cấm Dev/QA bind FR-RC SoT vào twin tables.
 * TechSpec: §17.6.1–§17.6.4 · F1–F10 · POST /candidates dual-route
 * must_keep: (paste §17.6.4) G-DB-04 dual catalog — FR-RC-01→job_requisitions only;
 *   FR-RC-03→recruitment_candidates (POST /candidates + requisition_id);
 *   FR-RC-05→recruitment_interviews;
 *   cấm bind FR-RC vào job_postings/candidates/interviews catalog twin làm SoT primary;
 *   INT-01 hire: candidates.employee_id (pool) + soft recruitment_candidates.employee_id — no hard FK G-DB-02;
 *   không giả FK cross-lane A↔B
 * cấm wave: schema merge · hard FK G-DB-02 · FE rewrite · logic/DTO change
 *
 * @CODE-MEMORY-CHANGE 2026-07-22 BM-BE-REC-CAND-GET-BY-ID-01
 * ADD GET candidates-pool/:id scope_parity — same resolveHrmListScope + pushCompanyIdFilter as list.
 * R-REC-WF-04-02: group CEO company_id=main must 200 for ids returned by list (holding/member rows).
 * change_mode: ADD · must_keep G-DB-01 hire · dual catalog F1–F10 · U65 no seed.
 *
 * @CODE-MEMORY-CHANGE 2026-07-25 D-HRM-SETTINGS-MD-JT-BE-01
 * UPGRADE job-templates: position_code required + assertCodeInEffectiveCatalog(job_titles).
 * Reject invent-only free-text title/position_name as sole position SoT (FR-HRM-RC-JD-01 / AC-SET-FS-03 / BR-HRM-MD-01).
 * change_mode: UPGRADE · must_keep JD CRUD with valid catalog code · soft-delete · dual catalog F1–F10 · U65 no seed.
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-BE-ERP-E1A-POS-KEY-01
 * ADD job_postings / headcount_proposals position_key (+ optional department_key);
 * assertCodeInEffectiveCatalog(job_titles) on create/update — mirror JD position_code depth.
 * change_mode: ADD · must_keep §17.6 F1/F6 — cấm FR-RC-01 rebind to job_postings/headcount_proposals · JT position_code · U65
 * DB_DESIGN: docs/hrm/DB_DESIGN_HRM_MD_BIND_E1A.md §5–§6 · API_DESIGN WH/JP/HCP
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-BE-03
 * VERIFY listJobDescriptionTemplates scope_parity — resolveHrmListScope + pushCompanyIdFilter (same as candidates-pool).
 * QA R11 triage: jd-library row vs create dialog empty = FE hook state desync; BE GET main returns holding rows when present.
 * change_mode: FIX (evidence-only) · must_keep persist main→holding via resolveHrmPersistCompanyIdText · U65 no seed.
 * Evidence: docs/qa/evidence/d-hdsd-mutate-be-03-20260801.md · jest d-hdsd-mutate-be-03.spec.ts
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  MASTER_TENANT_ID,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { ListCandidatesTableQueryDto } from './dto/list-candidates-table.query.dto';
import { ListJobPostingsQueryDto } from './dto/list-job-postings.query.dto';
import {
  assertEmployeeInCandidateCompany,
  assertHireEmployeeLinkOrThrow,
  HRM_REC_HIRE_400,
  isHiredStage,
} from './hire-employee-link';
import {
  RecruitmentWorkflowBridge,
  WF_BUSINESS_TYPE_HRM_CANDIDATE,
  WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN,
} from './recruitment-workflow.bridge';

/** VAL-SET-MD / AC-SET-FS-03 — JD position must be job_titles catalog code. */
export const HRM_REC_JD_POS = 'HRM-REC-JD-POS';
/** E1-A MD-BIND — Lane B job_postings position_key (≠ FR-RC-01). */
export const HRM_JP_POS_KEY = 'HRM-JP-POS-KEY';
/** E1-A MD-BIND — Lane B headcount_proposals position_key (≠ FR-RC-01). */
export const HRM_HCP_POS_KEY = 'HRM-HCP-POS-KEY';

@Injectable()
export class RecruitmentCatalogService {
  constructor(
    private readonly db: HrmDbService,
    private readonly recruitmentWorkflowBridge: RecruitmentWorkflowBridge,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
  ) {}

  private resolveCatalogTenantId(tenantId?: string): string {
    return tenantId?.trim() || masterTenantIdFromEnv() || MASTER_TENANT_ID;
  }

  /**
   * FR-HRM-RC-JD-01 / BR-HRM-MD-01 — position_code ∈ job_titles (AC-SET-FS-03).
   * Returns catalog label for optional position_name denormalize.
   */
  private async assertJdPositionCodeInCatalog(opts: {
    companyId: string;
    positionCode: string;
    tenantId?: string;
  }): Promise<{ code: string; label: string }> {
    const code = opts.positionCode.trim();
    if (!code) {
      throw new ApiException(
        HRM_REC_JD_POS,
        'position_code is required (catalog SoT; free-text title/position_name alone forbidden)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.settingsCatalogs) {
      return { code, label: code };
    }
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId: this.resolveCatalogTenantId(opts.tenantId),
      companyId: opts.companyId,
      catalogKey: 'job_titles',
      code,
      errorCode: HRM_REC_JD_POS,
      errorMessage: `position_code '${code}' is not in job_titles catalog (free-text SoT forbidden)`,
    });
    return { code: hit.code, label: hit.label };
  }

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
    // F6 / UC-HRM-RC-07 — reusable JD templates (code unique per company_id).
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.job_description_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        position_name TEXT,
        job_description TEXT,
        requirements TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_job_description_templates_company_code UNIQUE (company_id, code)
      );
    `);
    await this.db.query(
      `ALTER TABLE public.job_description_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`,
    );
    await this.db.query(
      `ALTER TABLE public.job_description_templates ADD COLUMN IF NOT EXISTS position_code TEXT`,
    );
    // E1-A MD-BIND Layer A — Lane B leftover position_key (not FR-RC-01 SoT).
    await this.db.query(`
      ALTER TABLE public.job_postings
        ADD COLUMN IF NOT EXISTS position_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_postings
        ADD COLUMN IF NOT EXISTS department_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.headcount_proposals
        ADD COLUMN IF NOT EXISTS position_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.headcount_proposals
        ADD COLUMN IF NOT EXISTS department_key TEXT NULL;
    `);
  }

  /**
   * E1-A — position_key ∈ job_titles (same family as JD position_code / employees.job_title_key).
   */
  private async assertConsumerPositionKey(opts: {
    companyId: string;
    positionKey: unknown;
    errorCode: string;
    tenantId?: string;
  }): Promise<{ code: string; label: string }> {
    const code = typeof opts.positionKey === 'string' ? opts.positionKey.trim() : '';
    if (!code) {
      throw new ApiException(
        opts.errorCode,
        'position_key is required (catalog SoT; free-text position alone forbidden)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.settingsCatalogs) {
      return { code, label: code };
    }
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId: this.resolveCatalogTenantId(opts.tenantId),
      companyId: opts.companyId,
      catalogKey: 'job_titles',
      code,
      errorCode: opts.errorCode,
      errorMessage: `position_key '${code}' is not in job_titles catalog (free-text SoT forbidden)`,
    });
    return { code: hit.code, label: hit.label };
  }

  /**
   * @CODE-MEMORY method · Lane B job_postings — KHÔNG FR-HRM-RC-01 SoT (F1/F6)
   * TechSpec: §17.6.1 · must_keep §17.6.4 · cấm bind headcount YCTD vào đây
   */
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

  /**
   * @CODE-MEMORY method · Lane B create job_postings — menu JD leftover (F1/F6/F9)
   * must_keep §17.6.4 — FR-RC-01 chỉ job_requisitions
   */
  async createJobPosting(payload: CreateJobPostingDto, authorization?: string) {
    await this.ensureWave2Schema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const pos = await this.assertConsumerPositionKey({
      companyId,
      positionKey: payload.position_key,
      errorCode: HRM_JP_POS_KEY,
    });
    const positionSnapshot = payload.position?.trim() || pos.label;
    const departmentKey = payload.department_key?.trim() || null;
    if (departmentKey && this.settingsCatalogs) {
      await this.settingsCatalogs.assertCodeInEffectiveCatalog({
        tenantId: this.resolveCatalogTenantId(),
        companyId,
        catalogKey: 'departments',
        code: departmentKey,
        errorCode: HRM_JP_POS_KEY,
        errorMessage: `department_key '${departmentKey}' is not in departments catalog`,
      });
    }
    const id = randomUUID();
    const res = await this.db.query(
      `INSERT INTO public.job_postings (
        id, company_id, title, department, department_key, position, position_key, employment_type, work_location,
        salary_min, salary_max, is_salary_visible, description, requirements, benefits,
        headcount, deadline, priority, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17::date, $18, $19
      ) RETURNING *;`,
      [
        id,
        companyId,
        payload.title.trim(),
        payload.department ?? null,
        departmentKey,
        positionSnapshot,
        pos.code,
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

  /**
   * @CODE-MEMORY method · Lane B candidates pool — KHÔNG FR-HRM-RC-03 primary SoT (F2)
   * HTTP: GET …/candidates-pool · table public.candidates
   * INT-01 hire surface = pool stage (G-DB-01) — không đồng nghĩa FR-RC-03 spine
   * must_keep §17.6.4 — FR-RC-03→recruitment_candidates (+ requisition_id)
   */
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

  /**
   * @CODE-MEMORY method · Lane B GET candidates-pool/:id — scope_parity với listCandidatesTable
   * HTTP: GET …/candidates-pool/:candidateId · table public.candidates (KHÔNG FR-RC-03 primary)
   * ADR: ADR-GROUP-CEO-MAIN-HOLDING-SCOPE — group CEO main → company_id = ANY(GROUP_MEMBER_SLUGS)
   * must_keep: G-DB-01 hire employee_id · dual catalog F1–F10 · không đọc recruitment_candidates
   */
  async getCandidatePoolById(candidateId: string, companyId: string, authorization?: string) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [candidateId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `SELECT * FROM public.candidates WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-REC-CP-404', 'Candidate not found', HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
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
    employeeId?: string,
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peekFilters = ['ca.id = $1::uuid'];
    const peekValues: unknown[] = [applicationId];
    pushCompanyIdFilter(peekFilters, peekValues, scope.companyIds);
    // Qualify company on application alias — hire link needs parent candidate.
    const peekSql = peekFilters
      .map((f) => f.replace(/^company_id/, 'ca.company_id'))
      .join(' AND ');
    const peek = await this.db.query<{
      id: string;
      candidate_id: string;
      company_id: string;
      cand_employee_id: string | null;
      cand_company_id: string;
    }>(
      `SELECT ca.id::text AS id,
              ca.candidate_id::text AS candidate_id,
              ca.company_id::text AS company_id,
              c.employee_id::text AS cand_employee_id,
              c.company_id::text AS cand_company_id
       FROM public.candidate_applications ca
       INNER JOIN public.candidates c ON c.id = ca.candidate_id
       WHERE ${peekSql}
       LIMIT 1`,
      peekValues,
    );
    const app = peek.rows[0];
    if (!app) throw new ApiException('HRM-REC-CA-404', 'Application not found', HttpStatus.NOT_FOUND);

    // FR-HRM-INT-01 #5 — application hired inherits candidate→employee soft link.
    if (isHiredStage(stage)) {
      const linkedEmployeeId = await assertHireEmployeeLinkOrThrow(this.db, app.candidate_id, app.cand_company_id, {
        existingEmployeeId: app.cand_employee_id,
        explicitEmployeeId: employeeId,
      });
      await this.db.query(
        `UPDATE public.candidates
         SET stage = 'hired', employee_id = $2::uuid, updated_at = NOW()
         WHERE id = $1::uuid`,
        [app.candidate_id, linkedEmployeeId],
      );
    }

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
    const hasPositionKey = Object.prototype.hasOwnProperty.call(payload, 'position_key');
    const hasPositionText = Object.prototype.hasOwnProperty.call(payload, 'position');
    if (hasPositionText && !hasPositionKey) {
      throw new ApiException(
        HRM_JP_POS_KEY,
        'position_key is required when updating position (invent-only free-text forbidden)',
        HttpStatus.BAD_REQUEST,
      );
    }
    let nextPositionKey: string | null = null;
    let nextPosition: string | null = null;
    if (hasPositionKey) {
      const pos = await this.assertConsumerPositionKey({
        companyId: existing.company_id,
        positionKey: payload.position_key,
        errorCode: HRM_JP_POS_KEY,
      });
      nextPositionKey = pos.code;
      nextPosition =
        typeof payload.position === 'string' && payload.position.trim()
          ? payload.position.trim()
          : pos.label;
    }
    const nextDepartmentKey =
      payload.department_key !== undefined
        ? typeof payload.department_key === 'string'
          ? payload.department_key.trim() || null
          : null
        : undefined;
    if (nextDepartmentKey && this.settingsCatalogs) {
      await this.settingsCatalogs.assertCodeInEffectiveCatalog({
        tenantId: this.resolveCatalogTenantId(),
        companyId: existing.company_id,
        catalogKey: 'departments',
        code: nextDepartmentKey,
        errorCode: HRM_JP_POS_KEY,
        errorMessage: `department_key '${nextDepartmentKey}' is not in departments catalog`,
      });
    }
    const res = await this.db.query(
      `UPDATE public.job_postings SET
        title = COALESCE($2, title),
        department = COALESCE($3, department),
        department_key = CASE WHEN $17::boolean THEN $18 ELSE department_key END,
        position = CASE WHEN $19::boolean THEN $4 ELSE COALESCE($4, position) END,
        position_key = CASE WHEN $19::boolean THEN $20 ELSE position_key END,
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
        hasPositionKey ? nextPosition : (payload.position ?? null),
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
        nextDepartmentKey !== undefined,
        nextDepartmentKey ?? null,
        hasPositionKey,
        nextPositionKey,
      ],
    );
    return res.rows[0];
  }

  /**
   * FR-HRM-INT-01 · G-DB-01 — stage=hired yêu cầu employee_id (soft).
   * SRS bước: Diễn biến #5 từ chối thiếu hồ sơ · #7 Lưu hired + khóa hồ sơ.
   */
  async updateCandidatePoolStage(
    candidateId: string,
    companyId: string,
    stage: string,
    authorization?: string,
    employeeId?: string,
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    const existingRes = await this.db.query(
      `SELECT id::text AS id,
              company_id::text AS company_id,
              stage,
              workflow_instance_id::text AS workflow_instance_id,
              employee_id::text AS employee_id
       FROM public.candidates WHERE id = $1::uuid LIMIT 1;`,
      [candidateId],
    );
    const existing = existingRes.rows[0] as {
      id: string;
      company_id: string;
      stage?: string;
      workflow_instance_id?: string | null;
      employee_id?: string | null;
    } | undefined;
    if (!existing) {
      throw new ApiException('HRM-REC-CP-404', 'Candidate not found', HttpStatus.NOT_FOUND);
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-CP-404',
      mismatchCode: 'HRM-REC-CP-409',
    });
    try {
      this.recruitmentWorkflowBridge.assertNotLockedOrThrow(
        existing.workflow_instance_id,
        existing.stage,
        'candidate',
      );
    } catch (err) {
      if (err instanceof Error && err.message === 'HRM-REC-WF-LOCKED') {
        throw new ApiException(
          'HRM-REC-WF-LOCKED',
          'Candidate stage locked while workflow instance is active',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }

    // Diễn biến #5/#7 — chốt hired bắt buộc gắn hồ sơ; stamp employee_id.
    if (isHiredStage(stage)) {
      const linkedEmployeeId = await assertHireEmployeeLinkOrThrow(this.db, candidateId, existing.company_id, {
        existingEmployeeId: existing.employee_id,
        explicitEmployeeId: employeeId,
      });
      const res = await this.db.query(
        `UPDATE public.candidates
         SET stage = $2, employee_id = $3::uuid, updated_at = NOW()
         WHERE id = $1::uuid RETURNING *;`,
        [candidateId, stage, linkedEmployeeId],
      );
      return res.rows[0];
    }

    const res = await this.db.query(
      `UPDATE public.candidates SET stage = $2, updated_at = NOW() WHERE id = $1::uuid RETURNING *;`,
      [candidateId, stage],
    );
    return res.rows[0];
  }

  /**
   * @CODE-MEMORY method · Lane B POST pool row — dual-route nhánh thiếu requisition_id
   * HTTP: POST …/candidates → HRM-REC-CP-201 · table public.candidates (F2)
   * Đối chiếu spine: body.requisition_id → RecruitmentService.createCandidate · HRM-REC-202
   * must_keep §17.6.4 · không giả FK A↔B · INT-01 soft employee_id (F8)
   */
  async createCandidatePool(
    payload: {
      company_id: string;
      full_name: string;
      email?: string;
      phone?: string;
      source?: string;
      stage?: string;
      employee_id?: string;
      applied_date?: string;
      notes?: string;
    },
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const stage = payload.stage ?? 'applied';
    let employeeId: string | null = payload.employee_id?.trim() || null;
    // FR-HRM-INT-01 #5 — không tạo thẳng hired thiếu khóa hồ sơ.
    if (isHiredStage(stage)) {
      if (!employeeId) {
        throw new ApiException(
          HRM_REC_HIRE_400,
          'Hire requires a linked employee profile (employee_id)',
          HttpStatus.BAD_REQUEST,
        );
      }
      employeeId = await assertEmployeeInCandidateCompany(this.db, employeeId, companyId);
    }
    const res = await this.db.query(
      `INSERT INTO public.candidates (
        id, company_id, full_name, email, phone, stage, source, applied_date, notes, employee_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::date, CURRENT_DATE), $9, $10::uuid)
      RETURNING *;`,
      [
        randomUUID(),
        companyId,
        payload.full_name.trim(),
        payload.email?.toLowerCase().trim() ?? null,
        payload.phone?.trim() ?? null,
        stage,
        payload.source?.trim() ?? null,
        payload.applied_date ?? null,
        payload.notes ?? null,
        employeeId,
      ],
    );
    return res.rows[0];
  }

  /**
   * FR-HRM-INT-01 · G-DB-01 — PATCH pool; stage=hired stamps employee_id.
   * SRS bước: Diễn biến #5/#7 · TechSpec §17.3 G-DB-01
   */
  async updateCandidatePool(
    candidateId: string,
    companyId: string,
    payload: {
      full_name?: string;
      email?: string;
      phone?: string;
      source?: string;
      stage?: string;
      employee_id?: string;
      applied_date?: string;
      notes?: string;
    },
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    const existingRes = await this.db.query(
      `SELECT company_id::text AS company_id,
              stage,
              workflow_instance_id::text AS workflow_instance_id,
              employee_id::text AS employee_id
       FROM public.candidates WHERE id = $1::uuid LIMIT 1;`,
      [candidateId],
    );
    const existing = existingRes.rows[0] as {
      company_id: string;
      stage?: string;
      workflow_instance_id?: string | null;
      employee_id?: string | null;
    } | undefined;
    assertResourceInHrmScope(existing, resolveHrmListScope(authorization, companyId), {
      notFoundCode: 'HRM-REC-CP-404',
      mismatchCode: 'HRM-REC-CP-409',
    });
    if (payload.stage !== undefined) {
      try {
        this.recruitmentWorkflowBridge.assertNotLockedOrThrow(
          existing?.workflow_instance_id,
          existing?.stage,
          'candidate',
        );
      } catch (err) {
        if (err instanceof Error && err.message === 'HRM-REC-WF-LOCKED') {
          throw new ApiException(
            'HRM-REC-WF-LOCKED',
            'Candidate stage locked while workflow instance is active',
            HttpStatus.CONFLICT,
          );
        }
        throw err;
      }
    }

    let nextEmployeeId: string | null = null;
    const nextStage = payload.stage ?? null;
    // Diễn biến #5/#7 — hired bắt buộc khóa hồ sơ; stamp soft employee_id.
    if (isHiredStage(nextStage)) {
      nextEmployeeId = await assertHireEmployeeLinkOrThrow(this.db, candidateId, existing!.company_id, {
        existingEmployeeId: existing?.employee_id,
        explicitEmployeeId: payload.employee_id,
      });
    } else if (payload.employee_id?.trim()) {
      nextEmployeeId = await assertEmployeeInCandidateCompany(
        this.db,
        payload.employee_id.trim(),
        existing!.company_id,
      );
    }

    const res = await this.db.query(
      `UPDATE public.candidates SET
        full_name = COALESCE($2, full_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        source = COALESCE($5, source),
        stage = COALESCE($6, stage),
        applied_date = COALESCE($7::date, applied_date),
        notes = COALESCE($8, notes),
        employee_id = COALESCE($9::uuid, employee_id),
        updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING *;`,
      [
        candidateId,
        payload.full_name?.trim() ?? null,
        payload.email?.toLowerCase().trim() ?? null,
        payload.phone?.trim() ?? null,
        payload.source?.trim() ?? null,
        nextStage,
        payload.applied_date ?? null,
        payload.notes ?? null,
        nextEmployeeId,
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

  /**
   * @CODE-MEMORY method · Lane B interviews catalog — KHÔNG FR-HRM-RC-05 primary (F3/F5)
   * HTTP: …/interviews-catalog · table public.interviews — candidate_id ≠ recruitment_candidates.id
   * must_keep §17.6.4 — FR-RC-05→recruitment_interviews
   */
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

  /**
   * @CODE-MEMORY method · Lane B create interviews — twin schedule (F3/F5)
   * cấm join candidate_id sang recruitment_candidates (F4 ngược / F5)
   * must_keep §17.6.4
   */
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

  /**
   * @CODE-MEMORY method · Lane B headcount_proposals — leftover (F1)
   * cấm claim FR-HRM-RC-01 / G-RC-01 SoT = proposals · đúng bind = job_requisitions.headcount
   * must_keep §17.6.4
   */
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
    const pos = await this.assertConsumerPositionKey({
      companyId,
      positionKey: payload.position_key,
      errorCode: HRM_HCP_POS_KEY,
    });
    const positionName =
      typeof payload.position_name === 'string' && payload.position_name.trim()
        ? payload.position_name.trim()
        : pos.label;
    const departmentKey =
      typeof payload.department_key === 'string' ? payload.department_key.trim() || null : null;
    if (departmentKey && this.settingsCatalogs) {
      await this.settingsCatalogs.assertCodeInEffectiveCatalog({
        tenantId: this.resolveCatalogTenantId(),
        companyId,
        catalogKey: 'departments',
        code: departmentKey,
        errorCode: HRM_HCP_POS_KEY,
        errorMessage: `department_key '${departmentKey}' is not in departments catalog`,
      });
    }
    const res = await this.db.query(
      `INSERT INTO public.headcount_proposals (
        id, company_id, title, department, department_key, position_name, position_key,
        current_headcount, requested_headcount,
        proposal_type, priority, status, justification, expected_start_date,
        salary_budget_min, salary_budget_max, job_description, requirements, requested_by, notes
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::date,$15,$16,$17,$18,$19,$20
      ) RETURNING *;`,
      [
        randomUUID(),
        companyId,
        payload.title,
        payload.department,
        departmentKey,
        positionName,
        pos.code,
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
    await this.recruitmentWorkflowBridge.ensureSchema();
    const existingRes = await this.db.query(
      `SELECT * FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`,
      [planId],
    );
    const existing = existingRes.rows[0] as {
      company_id: string;
      status?: string;
      workflow_instance_id?: string | null;
    } | undefined;
    if (!existing) {
      throw new ApiException('HRM-REC-PLAN-404', 'Recruitment plan not found', HttpStatus.NOT_FOUND);
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-PLAN-404',
      mismatchCode: 'HRM-REC-PLAN-409',
    });
    try {
      this.recruitmentWorkflowBridge.assertNotLockedOrThrow(
        existing.workflow_instance_id,
        existing.status,
        'plan',
      );
    } catch (err) {
      if (err instanceof Error && err.message === 'HRM-REC-WF-LOCKED') {
        throw new ApiException(
          'HRM-REC-WF-LOCKED',
          'Recruitment plan status locked while workflow instance is active',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
    const res = await this.db.query(
      `UPDATE public.recruitment_plans SET status = $2, updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`,
      [planId, status],
    );
    return res.rows[0];
  }

  /**
   * UC-HRM-REC-WF-02 — submit plan for XBOS approval (SPAWN-MISSING keeps pending_approval).
   */
  async submitRecruitmentPlanForApproval(
    planId: string,
    companyId: string,
    authorization?: string,
    options?: { submitterUserId?: string; tenantId?: string; companySlug?: string },
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    const existingRes = await this.db.query(
      `SELECT id, company_id, status, workflow_instance_id::text AS workflow_instance_id
       FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`,
      [planId],
    );
    const existing = existingRes.rows[0] as {
      id: string;
      company_id: string;
      status: string;
      workflow_instance_id?: string | null;
    } | undefined;
    if (!existing) {
      throw new ApiException('HRM-REC-PLAN-404', 'Recruitment plan not found', HttpStatus.NOT_FOUND);
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-PLAN-404',
      mismatchCode: 'HRM-REC-PLAN-409',
    });
    if (existing.workflow_instance_id) {
      return {
        ...existing,
        status: existing.status === 'pending' ? 'pending_approval' : existing.status,
        workflow_instance_id: existing.workflow_instance_id,
        spawn: { workflowInstanceId: existing.workflow_instance_id, idempotent: true },
      };
    }
    const spawn = await this.recruitmentWorkflowBridge.startRecruitmentWorkflowIfConfigured({
      businessType: WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN,
      businessId: planId,
      companyId: existing.company_id,
      submitterUserId: options?.submitterUserId,
      tenantId: options?.tenantId,
      companySlug: options?.companySlug ?? existing.company_id,
    });
    const refreshed = await this.db.query(
      `SELECT * FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`,
      [planId],
    );
    return {
      ...refreshed.rows[0],
      spawn,
      spawnMissing: !spawn?.workflowInstanceId,
    };
  }

  /**
   * UC-HRM-REC-WF-04 — start candidate pipeline instance.
   */
  async startCandidatePipeline(
    candidateId: string,
    companyId: string,
    authorization?: string,
    options?: { submitterUserId?: string; tenantId?: string; companySlug?: string },
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    const existingRes = await this.db.query(
      `SELECT id, company_id, stage, workflow_instance_id::text AS workflow_instance_id
       FROM public.candidates WHERE id = $1::uuid LIMIT 1;`,
      [candidateId],
    );
    const existing = existingRes.rows[0] as {
      id: string;
      company_id: string;
      stage: string;
      workflow_instance_id?: string | null;
    } | undefined;
    if (!existing) {
      throw new ApiException('HRM-REC-CP-404', 'Candidate not found', HttpStatus.NOT_FOUND);
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-CP-404',
      mismatchCode: 'HRM-REC-CP-409',
    });
    if (existing.workflow_instance_id) {
      return {
        ...existing,
        spawn: { workflowInstanceId: existing.workflow_instance_id, idempotent: true },
      };
    }
    const spawn = await this.recruitmentWorkflowBridge.startRecruitmentWorkflowIfConfigured({
      businessType: WF_BUSINESS_TYPE_HRM_CANDIDATE,
      businessId: candidateId,
      companyId: existing.company_id,
      submitterUserId: options?.submitterUserId,
      tenantId: options?.tenantId,
      companySlug: options?.companySlug ?? existing.company_id,
    });
    const refreshed = await this.db.query(
      `SELECT * FROM public.candidates WHERE id = $1::uuid LIMIT 1;`,
      [candidateId],
    );
    return {
      ...refreshed.rows[0],
      spawn,
      spawnMissing: !spawn?.workflowInstanceId,
    };
  }

  /**
   * @CODE-MEMORY method · FR-HRM-SC-JT-01 / UC-HRM-RC-07
   * AC-SET-FS / AC-HRM-PICKER-01 — list supports q + active filter
   * TechSpec: §18.1 company-local JD CRUD (S3)
   */
  async listJobDescriptionTemplates(
    companyId: string,
    authorization?: string,
    query?: { q?: string; active?: string },
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (query?.q?.trim()) {
      values.push(`%${query.q.trim().toLowerCase()}%`);
      filters.push(
        `(lower(code) LIKE $${values.length} OR lower(title) LIKE $${values.length} OR lower(COALESCE(position_name, '')) LIKE $${values.length} OR lower(COALESCE(position_code, '')) LIKE $${values.length})`,
      );
    }
    const activeRaw = query?.active?.trim().toLowerCase();
    if (activeRaw === '1' || activeRaw === 'true' || activeRaw === 'active' || activeRaw === 'yes') {
      filters.push(`is_active = TRUE`);
    } else if (
      activeRaw === '0' ||
      activeRaw === 'false' ||
      activeRaw === 'inactive' ||
      activeRaw === 'draft' ||
      activeRaw === 'no'
    ) {
      filters.push(`is_active = FALSE`);
    }
    const whereClause = filters.length ? filters.join(' AND ') : 'TRUE';
    const res = await this.db.query(
      `SELECT id, company_id, code, title, position_name, position_code, job_description, requirements, notes, is_active, created_at, updated_at
       FROM public.job_description_templates
       WHERE ${whereClause}
       ORDER BY updated_at DESC, created_at DESC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createJobDescriptionTemplate(
    payload: {
      company_id: string;
      code: string;
      title: string;
      position_name?: string;
      position_code?: string;
      job_description?: string;
      requirements?: string;
      notes?: string;
      is_active?: boolean;
    },
    authorization?: string,
    options?: { tenantId?: string },
  ) {
    await this.ensureWave2Schema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const code = payload.code.trim();
    const title = payload.title.trim();
    if (!code || !title) {
      throw new ApiException('HRM-REC-JD-400', 'code and title are required', HttpStatus.BAD_REQUEST);
    }
    // AC-SET-FS-03 / FR-HRM-RC-JD-01 — position_code catalog SoT (not free title/position_name alone).
    const catalogPos = await this.assertJdPositionCodeInCatalog({
      companyId,
      positionCode: payload.position_code ?? '',
      tenantId: options?.tenantId,
    });
    const positionName = payload.position_name?.trim() || catalogPos.label || null;
    const dup = await this.db.query(
      `SELECT id FROM public.job_description_templates WHERE company_id = $1 AND lower(code) = lower($2) LIMIT 1;`,
      [companyId, code],
    );
    if (dup.rows[0]) {
      throw new ApiException('HRM-REC-JD-409', 'JD template code already exists for company', HttpStatus.CONFLICT);
    }
    const res = await this.db.query(
      `INSERT INTO public.job_description_templates
        (id, company_id, code, title, position_name, position_code, job_description, requirements, notes, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, company_id, code, title, position_name, position_code, job_description, requirements, notes, is_active, created_at, updated_at;`,
      [
        randomUUID(),
        companyId,
        code,
        title,
        positionName,
        catalogPos.code,
        payload.job_description?.trim() || null,
        payload.requirements?.trim() || null,
        payload.notes?.trim() || null,
        payload.is_active !== false,
      ],
    );
    return res.rows[0];
  }

  async updateJobDescriptionTemplate(
    templateId: string,
    companyId: string,
    payload: {
      code?: string;
      title?: string;
      position_name?: string;
      position_code?: string;
      job_description?: string;
      requirements?: string;
      notes?: string;
      is_active?: boolean;
    },
    authorization?: string,
    options?: { tenantId?: string },
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query<{
      company_id: string;
      code: string;
      position_code: string | null;
    }>(
      `SELECT company_id::text AS company_id, code, position_code
       FROM public.job_description_templates WHERE id = $1::uuid LIMIT 1;`,
      [templateId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-REC-JD-404',
      mismatchCode: 'HRM-REC-JD-409',
    });
    const existing = peek.rows[0];
    const nextCode = payload.code?.trim();
    if (nextCode && nextCode.toLowerCase() !== existing.code.toLowerCase()) {
      const dup = await this.db.query(
        `SELECT id FROM public.job_description_templates
         WHERE company_id = $1 AND lower(code) = lower($2) AND id <> $3::uuid LIMIT 1;`,
        [existing.company_id, nextCode, templateId],
      );
      if (dup.rows[0]) {
        throw new ApiException('HRM-REC-JD-409', 'JD template code already exists for company', HttpStatus.CONFLICT);
      }
    }

    let nextPositionCode: string | undefined;
    let nextPositionName: string | null | undefined;
    if (payload.position_code !== undefined) {
      const catalogPos = await this.assertJdPositionCodeInCatalog({
        companyId: existing.company_id,
        positionCode: payload.position_code,
        tenantId: options?.tenantId,
      });
      nextPositionCode = catalogPos.code;
      if (payload.position_name === undefined) {
        nextPositionName = catalogPos.label;
      }
    } else if (payload.position_name !== undefined) {
      // Display-only patch: require existing catalog link (cấm invent-only free SoT).
      const existingCode = existing.position_code?.trim();
      if (!existingCode) {
        throw new ApiException(
          HRM_REC_JD_POS,
          'position_code is required when linking a position (free-text position_name alone forbidden)',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const setParts: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    const pushSet = (col: string, value: unknown) => {
      values.push(value);
      setParts.push(`${col} = $${values.length}`);
    };
    if (nextCode !== undefined && nextCode.length > 0) pushSet('code', nextCode);
    if (payload.title !== undefined) pushSet('title', payload.title.trim());
    if (payload.position_name !== undefined) {
      pushSet('position_name', payload.position_name.trim() || null);
    } else if (nextPositionName !== undefined) {
      pushSet('position_name', nextPositionName);
    }
    if (nextPositionCode !== undefined) pushSet('position_code', nextPositionCode);
    if (payload.job_description !== undefined) pushSet('job_description', payload.job_description.trim() || null);
    if (payload.requirements !== undefined) pushSet('requirements', payload.requirements.trim() || null);
    if (payload.notes !== undefined) pushSet('notes', payload.notes.trim() || null);
    if (payload.is_active !== undefined) pushSet('is_active', payload.is_active);

    values.push(templateId);
    const idParam = `$${values.length}`;
    const filters = [`id = ${idParam}::uuid`];
    pushCompanyIdFilter(filters, values, scope.companyIds);

    const res = await this.db.query(
      `UPDATE public.job_description_templates SET ${setParts.join(', ')}
       WHERE ${filters.join(' AND ')}
       RETURNING id, company_id, code, title, position_name, position_code, job_description, requirements, notes, is_active, created_at, updated_at;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-REC-JD-404', 'JD template not found', HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
  }

  async deleteJobDescriptionTemplate(templateId: string, companyId: string, authorization?: string) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [templateId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    // Soft-deactivate — keep history for requisitions that snapshotted this JD.
    const res = await this.db.query(
      `UPDATE public.job_description_templates SET is_active = FALSE, updated_at = NOW()
       WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-REC-JD-404', 'JD template not found', HttpStatus.NOT_FOUND);
    }
    return { id: templateId, is_active: false };
  }
}
