/**
 * @CODE-MEMORY
 * Screen:     HRM → Tuyển dụng (HTTP /recruitment) — YCTD + catalog
 * UC:         UC-HRM-22 · HRM-RC-01 · headcount proposals (catalog)
 * BR:         G-RC-01 headcount ≥1 trên job_requisitions (không nhầm postings)
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.7 · FR-HRM-RC-01
 * SRS bước:   Diễn biến #1 auth · #3/#4 thiếu SL / ≤0 · #6 Lưu thành công · #7 F5
 * TechSpec:   docs/hrm/TECHSPEC.md §14.7 (ref_srs: FR-HRM-RC-01) · §14.9 G-RC-01
 * Purpose:    Surface tạo/list/patch YCTD + submit WF; catalog postings/proposals tách.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 * Callers:    apps/web/hrm JobRequisitionsTab / HeadcountProposalTab
 * Callees:    RecruitmentService · RecruitmentCatalogService
 * must_keep:  G-RC-01 headcount; workflow_instance_id LOCK; UF-HRM-12; AC-ATT-SHEET không đụng
 * SOLID:      Requisition service vs catalog postings/proposals
 * LastVerified: be-hrm-g-rc-01.spec.ts · recruitment.controller.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: File-level CODE-MEMORY + Diễn biến RC-01 trên handlers (không đổi logic)
 * Why: Sponsor lock; bổ sung CHANGE XHRM-REC-WF-BE-02
 * must_keep: G-RC-01 · toHrmListScopeContext(tenantId) trên submit WF
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-BE-02
 * FIX D-XHRM-REC-WF-SUBMIT-SCOPE: submitJobRequisitionWorkflow must call
 * toHrmListScopeContext(tenantId) — never the Nest headers bag (object has no .trim → 500).
 * Mirror list/get/update + plan/candidate WF entry points. must_keep leave/catalog/F6.
 *
 * @CODE-MEMORY-CHANGE 2026-07-25 D-HRM-REC-WF-OPTION-B-SPAWN-FIX-01
 * UPGRADE submit-workflow / start-pipeline: resolveSubmitterUserIdFromAuth —
 * JWT email|sub when x-user-id omitted (embed/API). Fixes false SPAWN-MISSING while
 * active hrm_requisition_approval exists. must_keep Option B · J-REC-WF-02 banner.
 *
 * @CODE-MEMORY-CHANGE 2026-07-21 BE-HRM-G-DB-04-CM-ANNOTATE-01
 * change_mode: ADD (comment-only)
 * What: Annotate Lane B handlers + POST /candidates dual-route; paste §17.6.4 must_keep.
 * Why: G-DB-04 residual — cấm bind FR-RC SoT vào catalog twin.
 * TechSpec: §17.6.1–§17.6.4 · F1–F10
 * must_keep: G-DB-04 dual catalog — FR-RC-01→job_requisitions only;
 *   FR-RC-03→recruitment_candidates (POST /candidates + requisition_id);
 *   FR-RC-05→recruitment_interviews;
 *   cấm bind FR-RC vào job_postings/candidates/interviews catalog twin làm SoT primary;
 *   INT-01 hire: candidates.employee_id (pool) + soft recruitment_candidates.employee_id — no hard FK G-DB-02;
 *   không giả FK cross-lane A↔B
 * Dual-route note: POST /candidates + requisition_id → Lane A HRM-REC-202;
 *   thiếu requisition_id → Lane B pool HRM-REC-CP-201
 * cấm wave: logic/DDL/DTO/FE · seed · G-DB-02 · Phase1/PROD
 */
import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest, resolveAuthorizationHeader } from '../common/internal-auth';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { resolveScopeContext } from '../common/scope-context';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { ListCandidatesTableQueryDto } from './dto/list-candidates-table.query.dto';
import { ListCandidatesQueryDto } from './dto/list-candidates.query.dto';
import { ListJobPostingsQueryDto } from './dto/list-job-postings.query.dto';
import { GetJobRequisitionQueryDto } from './dto/get-job-requisition.query.dto';
import { ListJobRequisitionsQueryDto } from './dto/list-job-requisitions.query.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { UpdateCandidatePoolDto } from './dto/update-candidate-pool.dto';
import { UpdateInterviewStatusDto } from './dto/update-interview-status.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';
import { UpdateJobTemplateDto } from './dto/update-job-template.dto';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import { RecruitmentService } from './recruitment.service';
import { resolveSubmitterUserIdFromAuth } from './resolve-submitter-user-id';

@Controller('recruitment')
export class RecruitmentController {
  constructor(
    private readonly recruitmentService: RecruitmentService,
    private readonly recruitmentCatalog: RecruitmentCatalogService,
  ) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized recruitment access', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * @CODE-MEMORY method · Lane B job-postings — KHÔNG FR-HRM-RC-01 SoT (F1/F6)
   * TechSpec: §17.6.1 · must_keep §17.6.4
   */
  @Get('job-postings')
  listJobPostings(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListJobPostingsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.recruitmentCatalog
      .listJobPostings(query, authorization)
      .then((data) => ok(data, 'HRM-REC-JP-200', 'Job postings listed'));
  }

  /**
   * @CODE-MEMORY method · Lane B POST job-postings — menu JD leftover (F1/F6)
   * must_keep §17.6.4 — FR-RC-01 chỉ job_requisitions
   */
  @Post('job-postings')
  createJobPosting(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateJobPostingDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.recruitmentCatalog
      .createJobPosting(body, authorization)
      .then((data) => ok(data, 'HRM-REC-JP-201', 'Job posting created'));
  }

  @Patch('job-postings/:jobPostingId')
  updateJobPosting(
    @Param('jobPostingId', new ParseUUIDPipe()) jobPostingId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recruitmentCatalog
      .updateJobPosting(jobPostingId, body, companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-JP-200', 'Job posting updated'));
  }

  @Delete('job-postings/:jobPostingId')
  deleteJobPosting(
    @Param('jobPostingId', new ParseUUIDPipe()) jobPostingId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recruitmentCatalog
      .deleteJobPosting(jobPostingId, companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-JP-200', 'Job posting deleted'));
  }

  /**
   * @CODE-MEMORY method · Lane B candidates-pool stage — INT-01 hire surface (pool)
   * KHÔNG FR-HRM-RC-03 primary SoT (F2) · table public.candidates
   * TechSpec: §17.6.1 · §17.6.3 · must_keep §17.6.4
   * FR-HRM-INT-01 · G-DB-01 — stage body + optional employee_id.
   * SRS bước: Diễn biến #5 thiếu hồ sơ → HRM-REC-HIRE-400 · #7 stamp employee_id
   */
  @Patch('candidates-pool/:candidateId/stage')
  updateCandidatePoolStage(
    @Param('candidateId', new ParseUUIDPipe()) candidateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body('stage') stage: string,
    @Body('employee_id') employeeId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .updateCandidatePoolStage(candidateId, companyId, stage, authorization, employeeId)
      .then((data) => ok(data, 'HRM-REC-CP-200', 'Candidate stage updated'));
  }

  /**
   * @CODE-MEMORY method · Lane B interviews-catalog — KHÔNG FR-HRM-RC-05 primary (F3/F5)
   * table public.interviews · candidate_id ≠ recruitment_candidates.id
   * must_keep §17.6.4 — FR-RC-05→recruitment_interviews
   */
  @Get('interviews-catalog')
  listInterviewsCatalog(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .listInterviews(companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-INT-200', 'Interviews listed'));
  }

  /**
   * @CODE-MEMORY method · Lane B POST interviews-catalog — twin schedule (F3/F5)
   * must_keep §17.6.4
   */
  @Post('interviews-catalog')
  createInterviewCatalog(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .createInterview(body, authorization)
      .then((data) => ok(data, 'HRM-REC-INT-201', 'Interview created'));
  }

  @Patch('interviews-catalog/:interviewId')
  updateInterviewCatalog(
    @Param('interviewId', new ParseUUIDPipe()) interviewId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .updateInterview(interviewId, body, companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-INT-200', 'Interview updated'));
  }

  @Delete('interviews-catalog/:interviewId')
  deleteInterviewCatalog(
    @Param('interviewId', new ParseUUIDPipe()) interviewId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .deleteInterview(interviewId, companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-INT-200', 'Interview deleted'));
  }

  /**
   * @CODE-MEMORY method · Lane B GET candidates-pool — KHÔNG FR-RC-03 primary (F2)
   * must_keep §17.6.4 — FR-RC-03→recruitment_candidates
   */
  @Get('candidates-pool')
  listCandidatesPool(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListCandidatesTableQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.recruitmentCatalog
      .listCandidatesTable(query, authorization)
      .then((data) => ok(data, 'HRM-REC-CP-200', 'Candidates pool listed'));
  }

  /**
   * @CODE-MEMORY method · Lane B GET candidates-pool/:id — R-REC-WF-04-02 scope_parity
   * SRS/J: J-REC-WF-04 deep-link detail · cùng rollup list (group CEO main)
   * TechSpec: §17.6 Lane B · HRM-REC-CP-200 · không FR-RC-03 spine
   * must_keep: G-DB-01 hire · dual catalog F1–F10
   */
  @Get('candidates-pool/:candidateId')
  getCandidatePool(
    @Param('candidateId', new ParseUUIDPipe()) candidateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
    return this.recruitmentCatalog
      .getCandidatePoolById(candidateId, companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-CP-200', 'Candidate pool row loaded'));
  }

  @Get('candidate-applications')
  listCandidateApplications(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('job_posting_id') jobPostingId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
    return this.recruitmentCatalog
      .listCandidateApplications(companyId, authorization, jobPostingId)
      .then((data) => ok(data, 'HRM-REC-CA-200', 'Candidate applications listed'));
  }

  @Post('candidate-applications')
  createCandidateApplication(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: { company_id: string; candidate_id: string; job_posting_id: string; stage?: string },
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .createCandidateApplication(body.company_id, body, authorization)
      .then((data) => ok(data, 'HRM-REC-CA-201', 'Candidate application created'));
  }

  @Delete('candidate-applications/:applicationId')
  deleteCandidateApplication(
    @Param('applicationId', new ParseUUIDPipe()) applicationId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .deleteCandidateApplication(applicationId, companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-CA-200', 'Candidate application deleted'));
  }

  @Patch('candidate-applications/:applicationId/stage')
  updateCandidateApplicationStage(
    @Param('applicationId', new ParseUUIDPipe()) applicationId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body('stage') stage: string,
    @Body('employee_id') employeeId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .updateCandidateApplicationStage(applicationId, companyId, stage, authorization, employeeId)
      .then((data) => ok(data, 'HRM-REC-CA-200', 'Candidate application updated'));
  }

  /**
   * @CODE-MEMORY method · Lane B headcount-proposals — leftover (F1)
   * cấm claim FR-HRM-RC-01 / G-RC-01 SoT = proposals
   * SRS bước: số lượng đề xuất ≠ job_requisitions.headcount
   * TechSpec: §14.7 · §17.6.4 must_keep — không bind proposals làm G-RC-01
   */
  @Get('headcount-proposals')
  listHeadcountProposals(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .listHeadcountProposals(companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-HC-200', 'Headcount proposals listed'));
  }

  /**
   * @CODE-MEMORY method · Lane B POST headcount-proposals — leftover (F1)
   * must_keep §17.6.4 — FR-RC-01→job_requisitions only
   */
  @Post('headcount-proposals')
  createHeadcountProposal(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .createHeadcountProposal(body, authorization)
      .then((data) => ok(data, 'HRM-REC-HC-201', 'Headcount proposal created'));
  }

  @Patch('headcount-proposals/:proposalId/status')
  updateHeadcountProposalStatus(
    @Param('proposalId', new ParseUUIDPipe()) proposalId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: { status: string; rejected_reason?: string },
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .updateHeadcountProposalStatus(proposalId, companyId, body.status, authorization, body.rejected_reason)
      .then((data) => ok(data, 'HRM-REC-HC-200', 'Headcount proposal updated'));
  }

  @Get('candidate-evaluations')
  listCandidateEvaluations(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Query('candidate_id') candidateId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .listCandidateEvaluations(companyId, authorization, candidateId)
      .then((data) => ok(data, 'HRM-REC-EVAL-200', 'Candidate evaluations listed'));
  }

  @Post('candidate-evaluations')
  createCandidateEvaluation(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .createCandidateEvaluation(body, authorization)
      .then((data) => ok(data, 'HRM-REC-EVAL-201', 'Candidate evaluation created'));
  }

  @Delete('candidate-evaluations/:evaluationId')
  deleteCandidateEvaluation(
    @Param('evaluationId', new ParseUUIDPipe()) evaluationId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .deleteCandidateEvaluation(evaluationId, companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-EVAL-200', 'Candidate evaluation deleted'));
  }

  @Get('evaluation-criteria-templates')
  listEvaluationCriteriaTemplates(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .listEvaluationCriteriaTemplates(companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-EVAL-200', 'Evaluation criteria templates listed'));
  }

  /** UC-HRM-RC-07 / F6 — reusable JD library. */
  @Get('job-templates')
  listJobTemplates(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('q') q?: string,
    @Query('active') active?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recruitmentCatalog
      .listJobDescriptionTemplates(companyId, authorization, { q, active })
      .then((data) => ok(data, 'HRM-REC-JD-200', 'Job description templates listed'));
  }

  @Post('job-templates')
  createJobTemplate(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateJobTemplateDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.recruitmentCatalog
      .createJobDescriptionTemplate(body, authorization, { tenantId })
      .then((data) => ok(data, 'HRM-REC-JD-201', 'Job description template created'));
  }

  @Patch('job-templates/:templateId')
  updateJobTemplate(
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: UpdateJobTemplateDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recruitmentCatalog
      .updateJobDescriptionTemplate(templateId, companyId, body, authorization, { tenantId })
      .then((data) => ok(data, 'HRM-REC-JD-200', 'Job description template updated'));
  }

  @Delete('job-templates/:templateId')
  deleteJobTemplate(
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recruitmentCatalog
      .deleteJobDescriptionTemplate(templateId, companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-JD-200', 'Job description template deleted'));
  }

  @Post('evaluation-criteria-templates/replace')
  replaceEvaluationCriteriaTemplates(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: { company_id: string; templates: Record<string, unknown>[] },
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .replaceEvaluationCriteriaTemplates(body.company_id, body.templates ?? [], authorization)
      .then((data) => ok(data, 'HRM-REC-EVAL-200', 'Evaluation criteria templates saved'));
  }

  @Get('recruitment-plans')
  listRecruitmentPlans(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
    return this.recruitmentCatalog
      .listRecruitmentPlans(companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-PLAN-200', 'Recruitment plans listed'));
  }

  @Post('recruitment-plans')
  createRecruitmentPlan(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .createRecruitmentPlan(body, authorization)
      .then((data) => ok(data, 'HRM-REC-PLAN-201', 'Recruitment plan created'));
  }

  @Delete('recruitment-plans/:planId')
  deleteRecruitmentPlan(
    @Param('planId', new ParseUUIDPipe()) planId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .deleteRecruitmentPlan(planId, companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-PLAN-200', 'Recruitment plan deleted'));
  }

  @Patch('recruitment-plans/:planId/status')
  updateRecruitmentPlanStatus(
    @Param('planId', new ParseUUIDPipe()) planId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body('status') status: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recruitmentCatalog
      .updateRecruitmentPlanStatus(planId, companyId, status, authorization)
      .then((data) => ok(data, 'HRM-REC-PLAN-200', 'Recruitment plan updated'));
  }

  @Post('recruitment-plans/:planId/submit-workflow')
  submitRecruitmentPlanWorkflow(
    @Param('planId', new ParseUUIDPipe()) planId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Headers('x-user-id') userId: string | undefined,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    const submitterUserId = resolveSubmitterUserIdFromAuth(authorization, userId);
    return this.recruitmentCatalog
      .submitRecruitmentPlanForApproval(planId, companyId, authorization, {
        submitterUserId,
        tenantId,
        companySlug: companyId,
      })
      .then((data) => ok(data, 'HRM-REC-PLAN-WF-200', 'Recruitment plan submitted to workflow'));
  }

  @Post('candidates-pool/:candidateId/start-pipeline')
  startCandidatePipeline(
    @Param('candidateId', new ParseUUIDPipe()) candidateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Headers('x-user-id') userId: string | undefined,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    const submitterUserId = resolveSubmitterUserIdFromAuth(authorization, userId);
    return this.recruitmentCatalog
      .startCandidatePipeline(candidateId, companyId, authorization, {
        submitterUserId,
        tenantId,
        companySlug: companyId,
      })
      .then((data) => ok(data, 'HRM-REC-CP-WF-200', 'Candidate pipeline started'));
  }

  /**
   * @CODE-MEMORY method · FR-HRM-RC-01
   * SRS bước: Diễn biến #1 auth · #3/#4 thiếu SL / ≤0 (DTO) · #6 Lưu thành công
   * TechSpec: §14.7 ref_srs FR-HRM-RC-01 · G-RC-01 · POST requisitions → HRM-REC-201
   */
  @Post('requisitions')
  createJobRequisition(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateJobRequisitionDto,
  ) {
    // Xử lý: Diễn biến #1 — auth/scope trước tạo YCTD.
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.recruitmentService
      .createJobRequisition(body, authorization)
      // Thành công: Diễn biến #6 — dòng yêu cầu (headcount) trên list; F5 = #7.
      .then((data) => ok(data, 'HRM-REC-201', 'Job requisition created'));
  }

  @Post('requisitions/:requisitionId/submit-workflow')
  submitJobRequisitionWorkflow(
    @Param('requisitionId', new ParseUUIDPipe()) requisitionId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetJobRequisitionQueryDto,
    @Headers('x-user-id') userId: string | undefined,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    const submitterUserId = resolveSubmitterUserIdFromAuth(authorization, userId);
    return this.recruitmentService
      .submitJobRequisitionForApproval(
        requisitionId,
        query,
        authorization,
        toHrmListScopeContext(tenantId),
        {
          submitterUserId,
          tenantId,
          companySlug: query.company_id ?? headerCompanyId,
        },
      )
      .then((data) => ok(data, 'HRM-REC-WF-200', 'Job requisition submitted to workflow'));
  }

  @Patch('requisitions/:requisitionId')
  updateJobRequisition(
    @Param('requisitionId', new ParseUUIDPipe()) requisitionId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetJobRequisitionQueryDto,
    @Body() body: UpdateJobRequisitionDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    return this.patchJobRequisitionInternal(
      requisitionId,
      authorization,
      internalApiKey,
      tenantId,
      headerCompanyId,
      query,
      body,
      headers,
    );
  }

  /** PUT alias for proxies that block PATCH (UF-HRM-12). */
  @Put('requisitions/:requisitionId')
  putJobRequisition(
    @Param('requisitionId', new ParseUUIDPipe()) requisitionId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetJobRequisitionQueryDto,
    @Body() body: UpdateJobRequisitionDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    return this.patchJobRequisitionInternal(
      requisitionId,
      authorization,
      internalApiKey,
      tenantId,
      headerCompanyId,
      query,
      body,
      headers,
    );
  }

  private patchJobRequisitionInternal(
    requisitionId: string,
    authorization: string | undefined,
    internalApiKey: string | undefined,
    tenantId: string | undefined,
    headerCompanyId: string | undefined,
    query: GetJobRequisitionQueryDto,
    body: UpdateJobRequisitionDto,
    headers: Record<string, unknown>,
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.recruitmentService
      .updateJobRequisition(requisitionId, body, query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-REC-200', 'Job requisition updated'));
  }

  @Get('requisitions/:requisitionId')
  getJobRequisition(
    @Param('requisitionId', new ParseUUIDPipe()) requisitionId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetJobRequisitionQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.recruitmentService
      .getJobRequisitionById(requisitionId, query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-REC-200', 'Job requisition loaded'));
  }

  /**
   * @CODE-MEMORY method · FR-HRM-RC-01
   * SRS bước: Diễn biến #7 Tải lại — list YCTD trong đơn vị (có headcount)
   * TechSpec: §14.7 ref_srs FR-HRM-RC-01 · GET requisitions → HRM-REC-200
   */
  @Get('requisitions')
  listJobRequisitions(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListJobRequisitionsQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.recruitmentService
      .listJobRequisitions(query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-REC-200', 'Job requisitions listed'));
  }

  /**
   * @CODE-MEMORY method · POST /candidates dual-route (G-DB-04 §17.6.1)
   * + body.requisition_id → Lane A RecruitmentService · HRM-REC-202 · recruitment_candidates (FR-RC-03 SoT)
   * − requisition_id → Lane B RecruitmentCatalogService · HRM-REC-CP-201 · candidates pool (không FR-RC-03 primary)
   * must_keep §17.6.4 — không giả một bảng cho cả hai nhánh · không FK cross-lane A↔B
   */
  @Post('candidates')
  createCandidate(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateCandidateDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    // Xử lý: dual-route — có requisition_id = spine FR-RC-03; không có = catalog pool.
    if (body.requisition_id) {
      return this.recruitmentService
        .createCandidate(body, authorization)
        .then((data) => ok(data, 'HRM-REC-202', 'Candidate created'));
    }
    return this.recruitmentCatalog
      .createCandidatePool(body, authorization)
      .then((data) => ok(data, 'HRM-REC-CP-201', 'Candidate pool row created'));
  }

  @Patch('candidates-pool/:candidateId')
  updateCandidatePool(
    @Param('candidateId', new ParseUUIDPipe()) candidateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: UpdateCandidatePoolDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .updateCandidatePool(candidateId, companyId, body, authorization)
      .then((data) => ok(data, 'HRM-REC-CP-200', 'Candidate pool row updated'));
  }

  @Delete('candidates-pool/:candidateId')
  deleteCandidatePool(
    @Param('candidateId', new ParseUUIDPipe()) candidateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .deleteCandidatePool(candidateId, companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-CP-200', 'Candidate pool row deleted'));
  }

  /**
   * @CODE-MEMORY method · Lane A GET candidates — FR-HRM-RC-03 SoT (recruitment_candidates)
   * TechSpec: §17.6.1 · must_keep §17.6.4 — không list public.candidates ở đây
   */
  @Get('candidates')
  listCandidates(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListCandidatesQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.recruitmentService
      .listCandidates(query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-REC-200', 'Candidates listed'));
  }

  /**
   * @CODE-MEMORY method · Lane A GET candidates/:id — FR-HRM-RC-03 scope_parity
   * must_keep §17.6.4 — không đọc public.candidates (pool = GET candidates-pool/:id)
   */
  @Get('candidates/:candidateId')
  getCandidate(
    @Param('candidateId', new ParseUUIDPipe()) candidateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: companyId ?? headerCompanyId });
    return this.recruitmentService
      .getCandidateById(candidateId, companyId, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-REC-200', 'Candidate loaded'));
  }

  /**
   * @CODE-MEMORY method · Lane A POST interviews — FR-HRM-RC-05 SoT (recruitment_interviews)
   * candidate_id → recruitment_candidates only (F4) · không catalog interviews
   * must_keep §17.6.4
   */
  @Post('interviews')
  scheduleInterview(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: ScheduleInterviewDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.recruitmentService.scheduleInterview(body, authorization).then((data) => ok(data, 'HRM-REC-203', 'Interview scheduled'));
  }

  @Patch('interviews/:interviewId/status')
  updateInterviewStatus(
    @Param('interviewId', new ParseUUIDPipe()) interviewId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: UpdateInterviewStatusDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recruitmentService
      .updateInterviewStatus(interviewId, body, companyId ?? 'main', authorization)
      .then((data) => ok(data, 'HRM-REC-204', 'Interview updated'));
  }
}
