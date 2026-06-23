import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest, resolveAuthorizationHeader } from '../common/internal-auth';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { resolveScopeContext } from '../common/scope-context';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { ListCandidatesTableQueryDto } from './dto/list-candidates-table.query.dto';
import { ListCandidatesQueryDto } from './dto/list-candidates.query.dto';
import { ListJobPostingsQueryDto } from './dto/list-job-postings.query.dto';
import { GetJobRequisitionQueryDto } from './dto/get-job-requisition.query.dto';
import { ListJobRequisitionsQueryDto } from './dto/list-job-requisitions.query.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { UpdateCandidatePoolDto } from './dto/update-candidate-pool.dto';
import { UpdateInterviewStatusDto } from './dto/update-interview-status.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import { RecruitmentService } from './recruitment.service';

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

  @Patch('candidates-pool/:candidateId/stage')
  updateCandidatePoolStage(
    @Param('candidateId', new ParseUUIDPipe()) candidateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body('stage') stage: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .updateCandidatePoolStage(candidateId, companyId, stage, authorization)
      .then((data) => ok(data, 'HRM-REC-CP-200', 'Candidate stage updated'));
  }

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
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .updateCandidateApplicationStage(applicationId, companyId, stage, authorization)
      .then((data) => ok(data, 'HRM-REC-CA-200', 'Candidate application updated'));
  }

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

  @Post('requisitions')
  createJobRequisition(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateJobRequisitionDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.recruitmentService
      .createJobRequisition(body, authorization)
      .then((data) => ok(data, 'HRM-REC-201', 'Job requisition created'));
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
