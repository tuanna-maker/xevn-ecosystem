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
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-DYNAMIC-BE-01
 * ADD F-JD-DEF/LAY/GRP/PCK/RUL + GET job-templates/:id · extend create/update snapshot v2
 * must_keep: YCTD soft FK · HRM-REC-JD-POS · FORBIDDEN job_postings dual-write · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-YCTD-REF-BE-01
 * ADD bindable/for=yctd on GET job-templates · preview=yctd STATUS gate · YCTD alias DTO wire.
 * change_mode: ADD · must_keep ONE soft FK · F-REC-YCTD stubs · no campaign/job_postings SoT
 * SRS: FR-UC-BP-REC-02/02b Diễn biến 1a–1d · API-01 F-YCTD-JD-01..05
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-BE-01
 * ADD FR-05a: POST /candidates YCTD REQUIRED (no silent Lane B) · POST /candidates-pool explicit
 * · GET applications + GET compare · receivable query wire.
 * change_mode: ADD · must_keep ONE requisition_id · F-REC-APP-02/03 · FORBIDDEN job_postings SoT
 * SRS: FR-UC-BP-REC-05a/06b · API-01 F-REC-UV-YCTD / F-REC-CMP
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01
 * ADD F-REC-CAT-STG-01/02 · F-REC-CAT-EFF-01 routes under /recruitment/pipeline-stages*
 * change_mode: ADD · must_keep JD DnD · IV one-active · hire→EMP · YCTD · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01
 * ADD GET/PUT recruitment-plans/:id · POST spawn-requests · year query · status body options.
 * change_mode: ADD · must_keep XBOS submit-workflow · UF-HRM-12 · DENY /rec/headcount-plans
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-08-CLUSTER-BE-01
 * ADD GET /dashboard + /dashboard/yctd (+ ?include=yctd) · METHOD-405 mutate deny ·
 * RecruitmentDashboardService Option A · DENY Nest /rec dual · C&B omit · U19 resolveHrmListScope
 * change_mode: ADD · must_keep REC-01/02 seals · TARGET-MONTH CLOSED · honesty false · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-01
 * UPGRADE PATCH interviews/:id/status (no_show + cancel_reason) · ADD PATCH interviews/:id R-A
 * Physical /recruitment/interviews* only · DENY Nest /rec dual · Lane B ≠ FR-06a SoT
 * change_mode: ADD/UPGRADE · must_keep 409 ACTIVE · soft-gate · badge · W1–W3 · honesty false · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-04-CLUSTER-BE-01
 * ADD POST requisitions/:id/internal-scan · UPGRADE pipeline-flags scan keys + posted gate
 * · candidates-pool scan query · mint HRM-REC-CV-SCAN-* · DENY Nest /rec dual · REC-03 · seed
 * change_mode: UPGRADE · UC-BP-REC-04 · API-01 F-REC-CV-SCAN-01..03 · F-REC-YCTD-04
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01
 * ADD POST candidates/:id/transitions · GET candidates/:id/stage-history (F-REC-APP-02 / TL)
 * Physical /recruitment only · DENY Nest /rec dual · REC-03 · pool/posting ≠ FR-05 SoT · seed · honesty
 * change_mode: ADD · UC-BP-REC-05 · API-01 CONFIRMED · DATA-01 · BA O1–O9
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01
 * ADD POST/GET candidates/:id/mail · GET mail-outbox/:id · UPGRADE candidate-evaluations query neo
 * · soft DELETE · Pass/Fail · ROUND-GATE; mint HRM-REC-MAIL-* / HRM-REC-EVAL-*; RETAIN APP-02.
 * change_mode: ADD/UPGRADE · UC-BP-REC-06 · DENY Nest /rec · pool DONE · Campaign · seed · honesty
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01
 * ADD POST applications/:id/accept-offer (+ optional candidates/:id/accept-offer thin alias)
 * · mint HRM-REC-HIRE-200/201 · RETAIN APP-02 sole hired-outcome · DENY Nest /rec · PAY · seed
 * change_mode: ADD · UC-BP-REC-07 · API-01 CONFIRMED · DATA-01 · BA O1–O12
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import {
  isAuthorizedInternalRequest,
  resolveAuthorizationHeader,
} from '../common/internal-auth';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { resolveScopeContext } from '../common/scope-context';
import { CompareCandidatesQueryDto } from './dto/compare-candidates.query.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateJdFieldDefDto } from './dto/create-jd-field-def.dto';
import { CreateJdGroupDefDto } from './dto/create-jd-group-def.dto';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { PatchRequisitionPipelineFlagsDto } from './dto/patch-requisition-pipeline-flags.dto';
import { InternalScanDto } from './dto/internal-scan.dto';
import { RequisitionTransitionDto } from './dto/requisition-transition.dto';
import { ListApplicationsQueryDto } from './dto/list-applications.query.dto';
import { ListCandidatesTableQueryDto } from './dto/list-candidates-table.query.dto';
import { ListCandidatesQueryDto } from './dto/list-candidates.query.dto';
import { ListJobPostingsQueryDto } from './dto/list-job-postings.query.dto';
import { GetJobRequisitionQueryDto } from './dto/get-job-requisition.query.dto';
import { ListJobRequisitionsQueryDto } from './dto/list-job-requisitions.query.dto';
import { RecruitmentDashboardQueryDto } from './dto/recruitment-dashboard.query.dto';
import {
  GetRecPipelineStageQueryDto,
  ListEffectiveRecPipelineStagesQueryDto,
  ListRecPipelineStagesQueryDto,
  PatchRecPipelineStageDto,
  UpsertRecPipelineStageDto,
} from './dto/rec-pipeline-stage.dto';
import { PutJdDefaultPackDto } from './dto/put-jd-default-pack.dto';
import { PutJdLayoutDto } from './dto/put-jd-layout.dto';
import { PutJdPackRulesDto } from './dto/put-jd-pack-rules.dto';
import { ResolveJdPackDto } from './dto/resolve-jd-pack.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import {
  CandidateStageTransitionDto,
  ListCandidateStageHistoryQueryDto,
} from './dto/candidate-stage-transition.dto';
import {
  EnqueueCandidateMailDto,
  ListCandidateMailQueryDto,
} from './dto/candidate-mail.dto';
import { AcceptOfferDto } from './dto/accept-offer.dto';
import { requireUvYctdRequisitionId } from './uv-yctd-bind';
import { UpdateCandidatePoolDto } from './dto/update-candidate-pool.dto';
import { UpdateInterviewStatusDto } from './dto/update-interview-status.dto';
import { UpdateJdFieldDefDto } from './dto/update-jd-field-def.dto';
import { UpdateJdGroupDefDto } from './dto/update-jd-group-def.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';
import { UpdateJobTemplateDto } from './dto/update-job-template.dto';
import { JdDynamicService } from './jd-dynamic.service';
import { RecPipelineStageService } from './rec-pipeline-stage.service';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import { RecruitmentDashboardService } from './recruitment-dashboard.service';
import { HRM_REC_DASH_200 } from './recruitment-dashboard.constants';
import { RecruitmentService } from './recruitment.service';
import { resolveSubmitterUserIdFromAuth } from './resolve-submitter-user-id';
import { HRM_REC_HIRE_200, HRM_REC_HIRE_201 } from './rec-hire.constants';

@Controller('recruitment')
export class RecruitmentController {
  constructor(
    private readonly recruitmentService: RecruitmentService,
    private readonly recruitmentCatalog: RecruitmentCatalogService,
    private readonly jdDynamic: JdDynamicService,
    private readonly recPipelineStages: RecPipelineStageService,
    private readonly recruitmentDashboard: RecruitmentDashboardService,
  ) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized recruitment access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * F-REC-DASH-01 — Summary KH vs TT + funnel + enough-people (Option A).
   * Physical: GET /api/hrm/recruitment/dashboard — paper /rec/dashboard = alias only (DENY dual Nest).
   */
  @Get('dashboard')
  getRecruitmentDashboard(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: RecruitmentDashboardQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    const companyId = query.company_id ?? headerCompanyId ?? 'main';
    resolveScopeContext(authHeader, { tenantId, companyId });
    return this.recruitmentDashboard
      .getDashboard(
        { ...query, company_id: companyId },
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, HRM_REC_DASH_200, 'Recruitment dashboard loaded'),
      );
  }

  /**
   * F-REC-DASH-02 — YCTD drill (same scope as summary — U19).
   */
  @Get('dashboard/yctd')
  getRecruitmentDashboardYctd(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: RecruitmentDashboardQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    const companyId = query.company_id ?? headerCompanyId ?? 'main';
    resolveScopeContext(authHeader, { tenantId, companyId });
    return this.recruitmentDashboard
      .getDashboardYctd(
        { ...query, company_id: companyId },
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, HRM_REC_DASH_200, 'Recruitment dashboard YCTD drill loaded'),
      );
  }

  /** VAL-14 — GET only on dashboard routes. */
  @Post('dashboard')
  @Put('dashboard')
  @Patch('dashboard')
  @Delete('dashboard')
  denyDashboardMutate() {
    this.recruitmentDashboard.denyMutate();
  }

  @Post('dashboard/yctd')
  @Put('dashboard/yctd')
  @Patch('dashboard/yctd')
  @Delete('dashboard/yctd')
  denyDashboardYctdMutate() {
    this.recruitmentDashboard.denyMutate();
  }

  /** F-REC-CAT-EFF-01 — effective stage catalog (+ hiredOutcomeKey). */
  @Get('pipeline-stages/effective')
  listEffectivePipelineStages(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEffectiveRecPipelineStagesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.recPipelineStages
      .listEffective(query, authorization, { tenantId })
      .then((data) =>
        ok(data, 'HRM-REC-STG-200', 'Effective pipeline stages listed'),
      );
  }

  /** F-REC-CAT-STG-01 list */
  @Get('pipeline-stages')
  listPipelineStages(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListRecPipelineStagesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.recPipelineStages
      .listStages(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-REC-STG-200', 'Pipeline stages listed'));
  }

  /** F-REC-CAT-STG-02 create */
  @Post('pipeline-stages')
  createPipelineStage(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertRecPipelineStageDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.recPipelineStages
      .upsertStage(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-REC-STG-201', 'Pipeline stage created'));
  }

  /** F-REC-CAT-STG-02 upsert by (companyId, stageKey) */
  @Put('pipeline-stages')
  upsertPipelineStage(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertRecPipelineStageDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.recPipelineStages
      .upsertStage(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-REC-STG-200', 'Pipeline stage upserted'));
  }

  /** F-REC-CAT-STG-01 get-by-id — scope_parity U19 */
  @Get('pipeline-stages/:stageId')
  getPipelineStageById(
    @Param('stageId', new ParseUUIDPipe()) stageId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: GetRecPipelineStageQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.recPipelineStages
      .getStageById(stageId, query.company_id, authorization, tenantId)
      .then((data) => ok(data, 'HRM-REC-STG-200', 'Pipeline stage loaded'));
  }

  /** F-REC-CAT-STG-02 patch */
  @Patch('pipeline-stages/:stageId')
  patchPipelineStage(
    @Param('stageId', new ParseUUIDPipe()) stageId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: PatchRecPipelineStageDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recPipelineStages
      .patchStage(stageId, companyId, body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-REC-STG-200', 'Pipeline stage updated'));
  }

  /** F-REC-CAT-STG-02 soft-delete — FORBIDDEN hard DELETE */
  @Post('pipeline-stages/:stageId/retire')
  retirePipelineStage(
    @Param('stageId', new ParseUUIDPipe()) stageId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recPipelineStages
      .retireStage(stageId, companyId, authorization, tenantId)
      .then((data) => ok(data, 'HRM-REC-STG-200', 'Pipeline stage retired'));
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
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
      .updateCandidatePoolStage(
        candidateId,
        companyId,
        stage,
        authorization,
        employeeId,
      )
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.recruitmentCatalog
      .listCandidateApplications(companyId, authorization, jobPostingId)
      .then((data) =>
        ok(data, 'HRM-REC-CA-200', 'Candidate applications listed'),
      );
  }

  @Post('candidate-applications')
  createCandidateApplication(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body()
    body: {
      company_id: string;
      candidate_id: string;
      job_posting_id: string;
      stage?: string;
    },
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .createCandidateApplication(body.company_id, body, authorization)
      .then((data) =>
        ok(data, 'HRM-REC-CA-201', 'Candidate application created'),
      );
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
      .then((data) =>
        ok(data, 'HRM-REC-CA-200', 'Candidate application deleted'),
      );
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
      .updateCandidateApplicationStage(
        applicationId,
        companyId,
        stage,
        authorization,
        employeeId,
      )
      .then((data) =>
        ok(data, 'HRM-REC-CA-200', 'Candidate application updated'),
      );
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
      .updateHeadcountProposalStatus(
        proposalId,
        companyId,
        body.status,
        authorization,
        body.rejected_reason,
      )
      .then((data) => ok(data, 'HRM-REC-HC-200', 'Headcount proposal updated'));
  }

  @Get('candidate-evaluations')
  listCandidateEvaluations(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Query('candidate_id') candidateId?: string,
    @Query('recruitment_candidate_id') recruitmentCandidateId?: string,
    @Query('application_id') applicationId?: string,
    @Query('include_legacy') includeLegacy?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .listCandidateEvaluations(companyId, authorization, {
        candidateId,
        recruitmentCandidateId,
        applicationId,
        includeLegacy: includeLegacy === 'true' || includeLegacy === '1',
      })
      .then((data) =>
        ok(data, 'HRM-REC-EVAL-200', 'Candidate evaluations listed'),
      );
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
      .then((data) =>
        ok(data, 'HRM-REC-EVAL-201', 'Candidate evaluation created'),
      );
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
      .then((data) =>
        ok(data, 'HRM-REC-EVAL-200', 'Candidate evaluation archived'),
      );
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
      .then((data) =>
        ok(data, 'HRM-REC-EVAL-200', 'Evaluation criteria templates listed'),
      );
  }

  /**
   * UC-HRM-RC-07 / F6 / UC-BP-REC-00 — reusable JD library.
   * F-YCTD-JD-01 — bindable=true | for=yctd → status=active AND is_active (Diễn biến 1a/1b).
   */
  @Get('job-templates')
  listJobTemplates(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('q') q?: string,
    @Query('active') active?: string,
    @Query('status') status?: string,
    @Query('bindable') bindable?: string,
    @Query('for') forParam?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recruitmentCatalog
      .listJobDescriptionTemplates(companyId, authorization, {
        q,
        active,
        status,
        bindable,
        for: forParam,
      })
      .then((data) =>
        ok(data, 'HRM-REC-JD-200', 'Job description templates listed'),
      );
  }

  /**
   * F-JD-03 — GET by id · scope_parity with list.
   * F-YCTD-JD-02 — preview=yctd → thin preview + STATUS gate (Diễn biến 1c/1d).
   */
  @Get('job-templates/:templateId')
  getJobTemplate(
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('preview') preview?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    if (preview?.trim().toLowerCase() === 'yctd') {
      return this.recruitmentCatalog
        .getYctdJdPreview(templateId, companyId, authorization)
        .then((data) => ok(data, 'HRM-REC-JD-200', 'YCTD JD preview'));
    }
    return this.recruitmentCatalog
      .getJobDescriptionTemplateById(templateId, companyId, authorization)
      .then((data) =>
        ok(data, 'HRM-REC-JD-200', 'Job description template detail'),
      );
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.recruitmentCatalog
      .createJobDescriptionTemplate(body, authorization, { tenantId })
      .then((data) =>
        ok(data, 'HRM-REC-JD-201', 'Job description template created'),
      );
  }

  /**
   * F-JD-04 publish — Nháp → Hiệu lực (API-01 §6.4.2 · mint HRM-REC-JD-PUB-*).
   * Must be registered before generic :templateId PATCH consumers that collide — path is distinct.
   */
  @Post('job-templates/:templateId/publish')
  publishJobTemplate(
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recruitmentCatalog
      .publishJobDescriptionTemplate(templateId, companyId, authorization)
      .then((data) =>
        ok(data, 'HRM-REC-JD-200', 'Job description template published'),
      );
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
      .updateJobDescriptionTemplate(
        templateId,
        companyId,
        body,
        authorization,
        { tenantId },
      )
      .then((data) =>
        ok(data, 'HRM-REC-JD-200', 'Job description template updated'),
      );
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
      .then((data) =>
        ok(data, 'HRM-REC-JD-200', 'Job description template deleted'),
      );
  }

  // ─── JD dynamic CFG (ARCH-02 + GROUP-ARCH) ──────────────────────────────

  @Get('jd-field-defs')
  listJdFieldDefs(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('active') active?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.jdDynamic
      .listFieldDefs(companyId, authorization, active)
      .then((data) =>
        ok(data, 'HRM-JD-FIELD-200', 'JD field definitions listed'),
      );
  }

  @Get('jd-field-defs/:id')
  getJdFieldDef(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.jdDynamic
      .getFieldDefById(id, companyId, authorization)
      .then((data) =>
        ok(data, 'HRM-JD-FIELD-200', 'JD field definition detail'),
      );
  }

  @Post('jd-field-defs')
  createJdFieldDef(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: CreateJdFieldDefDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id,
    });
    return this.jdDynamic
      .createFieldDef(body, authorization)
      .then((data) =>
        ok(data, 'HRM-JD-FIELD-201', 'JD field definition created'),
      );
  }

  @Patch('jd-field-defs/:id')
  updateJdFieldDef(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: UpdateJdFieldDefDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.jdDynamic
      .updateFieldDef(id, companyId, body, authorization)
      .then((data) =>
        ok(data, 'HRM-JD-FIELD-200', 'JD field definition updated'),
      );
  }

  @Post('jd-field-defs/:id/archive')
  archiveJdFieldDef(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.jdDynamic
      .archiveFieldDef(id, companyId, authorization)
      .then((data) =>
        ok(data, 'HRM-JD-FIELD-200', 'JD field definition archived'),
      );
  }

  @Get('jd-form-layouts')
  listJdFormLayouts(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.jdDynamic
      .listLayouts(companyId, authorization)
      .then((data) => ok(data, 'HRM-JD-LAYOUT-200', 'JD form layouts listed'));
  }

  @Get('jd-form-layouts/default')
  getJdDefaultLayout(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.jdDynamic
      .getDefaultLayout(companyId, authorization)
      .then((data) => ok(data, 'HRM-JD-LAYOUT-200', 'JD default layout'));
  }

  @Put('jd-form-layouts/default')
  putJdDefaultLayout(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: PutJdLayoutDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id,
    });
    return this.jdDynamic
      .putDefaultLayout(body, authorization)
      .then((data) =>
        ok(data, 'HRM-JD-LAYOUT-200', 'JD default layout published'),
      );
  }

  @Get('jd-form-layouts/:id')
  getJdFormLayout(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.jdDynamic
      .getLayoutById(id, companyId, authorization)
      .then((data) => ok(data, 'HRM-JD-LAYOUT-200', 'JD form layout detail'));
  }

  @Get('jd-group-defs')
  listJdGroupDefs(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('active') active?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.jdDynamic
      .listGroupDefs(companyId, authorization, active)
      .then((data) =>
        ok(data, 'HRM-JD-GRP-200', 'JD group definitions listed'),
      );
  }

  @Get('jd-group-defs/:id')
  getJdGroupDef(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.jdDynamic
      .getGroupDefById(id, companyId, authorization)
      .then((data) => ok(data, 'HRM-JD-GRP-200', 'JD group definition detail'));
  }

  @Post('jd-group-defs')
  createJdGroupDef(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: CreateJdGroupDefDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id,
    });
    return this.jdDynamic
      .createGroupDef(body, authorization)
      .then((data) =>
        ok(data, 'HRM-JD-GRP-201', 'JD group definition created'),
      );
  }

  @Patch('jd-group-defs/:id')
  updateJdGroupDef(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: UpdateJdGroupDefDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.jdDynamic
      .updateGroupDef(id, companyId, body, authorization)
      .then((data) =>
        ok(data, 'HRM-JD-GRP-200', 'JD group definition updated'),
      );
  }

  @Get('jd-default-packs')
  listJdDefaultPacks(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.jdDynamic
      .listDefaultPacks(companyId, authorization)
      .then((data) => ok(data, 'HRM-JD-PCK-200', 'JD default packs listed'));
  }

  @Get('jd-default-packs/:code')
  getJdDefaultPack(
    @Param('code') code: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.jdDynamic
      .getDefaultPackByCode(code, companyId, authorization)
      .then((data) => ok(data, 'HRM-JD-PCK-200', 'JD default pack detail'));
  }

  @Put('jd-default-packs/:code')
  putJdDefaultPack(
    @Param('code') code: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: PutJdDefaultPackDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id,
    });
    return this.jdDynamic
      .putDefaultPack(code, body, authorization)
      .then((data) => ok(data, 'HRM-JD-PCK-200', 'JD default pack upserted'));
  }

  @Get('jd-pack-rules')
  listJdPackRules(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.jdDynamic
      .listPackRules(companyId, authorization)
      .then((data) => ok(data, 'HRM-JD-RUL-200', 'JD pack rules listed'));
  }

  @Put('jd-pack-rules')
  putJdPackRules(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: PutJdPackRulesDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id,
    });
    return this.jdDynamic
      .replacePackRules(body, authorization)
      .then((data) => ok(data, 'HRM-JD-RUL-200', 'JD pack rules replaced'));
  }

  @Post('jd-pack-rules/resolve')
  @HttpCode(HttpStatus.OK)
  resolveJdPack(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: ResolveJdPackDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id,
    });
    return this.jdDynamic
      .resolvePack(body, authorization)
      .then((data) => ok(data, 'HRM-JD-RUL-200', 'JD pack resolved'));
  }

  @Post('evaluation-criteria-templates/replace')
  replaceEvaluationCriteriaTemplates(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: { company_id: string; templates: Record<string, unknown>[] },
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.recruitmentCatalog
      .replaceEvaluationCriteriaTemplates(
        body.company_id,
        body.templates ?? [],
        authorization,
      )
      .then((data) =>
        ok(data, 'HRM-REC-EVAL-200', 'Evaluation criteria templates saved'),
      );
  }

  @Get('recruitment-plans')
  listRecruitmentPlans(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('year') year?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.recruitmentCatalog
      .listRecruitmentPlans(companyId, authorization, { year })
      .then((data) => ok(data, 'HRM-REC-PLAN-200', 'Recruitment plans listed'));
  }

  @Get('recruitment-plans/:planId')
  getRecruitmentPlanById(
    @Param('planId', new ParseUUIDPipe()) planId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recruitmentCatalog
      .getRecruitmentPlanById(planId, companyId, authorization)
      .then((data) => ok(data, 'HRM-REC-PLAN-200', 'Recruitment plan loaded'));
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

  @Put('recruitment-plans/:planId')
  upsertRecruitmentPlan(
    @Param('planId', new ParseUUIDPipe()) planId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId:
        typeof body.company_id === 'string' ? body.company_id : undefined,
    });
    return this.recruitmentCatalog
      .upsertRecruitmentPlan(planId, body, authorization)
      .then((data) =>
        ok(data, 'HRM-REC-PLAN-200', 'Recruitment plan upserted'),
      );
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
    @Body()
    body: {
      status?: string;
      rejected_reason?: string;
      approved_by?: string;
      activation_mode?: string;
    },
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recruitmentCatalog
      .updateRecruitmentPlanStatus(
        planId,
        companyId,
        String(body?.status ?? ''),
        authorization,
        {
          rejected_reason: body?.rejected_reason,
          approved_by: body?.approved_by,
          activation_mode: body?.activation_mode,
        },
      )
      .then((data) => ok(data, 'HRM-REC-PLAN-200', 'Recruitment plan updated'));
  }

  @Post('recruitment-plans/:planId/spawn-requests')
  spawnRecruitmentPlanRequests(
    @Param('planId', new ParseUUIDPipe()) planId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: { dry_run?: boolean; cell_ids?: string[] },
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recruitmentCatalog
      .spawnRecruitmentPlanRequests(
        planId,
        companyId,
        authorization,
        body ?? {},
      )
      .then((data) =>
        ok(data, 'HRM-HC-SPAWN-200', 'Headcount spawn requests processed'),
      );
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
    const submitterUserId = resolveSubmitterUserIdFromAuth(
      authorization,
      userId,
    );
    return this.recruitmentCatalog
      .submitRecruitmentPlanForApproval(planId, companyId, authorization, {
        submitterUserId,
        tenantId,
        companySlug: companyId,
      })
      .then((data) =>
        ok(
          data,
          'HRM-REC-PLAN-WF-200',
          'Recruitment plan submitted to workflow',
        ),
      );
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
    const submitterUserId = resolveSubmitterUserIdFromAuth(
      authorization,
      userId,
    );
    return this.recruitmentCatalog
      .startCandidatePipeline(candidateId, companyId, authorization, {
        submitterUserId,
        tenantId,
        companySlug: companyId,
      })
      .then((data) =>
        ok(data, 'HRM-REC-CP-WF-200', 'Candidate pipeline started'),
      );
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return (
      this.recruitmentService
        .createJobRequisition(body, authorization)
        // Thành công: Diễn biến #6 — dòng yêu cầu (headcount) trên list; F5 = #7.
        .then((data) => ok(data, 'HRM-REC-201', 'Job requisition created'))
    );
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
    const submitterUserId = resolveSubmitterUserIdFromAuth(
      authorization,
      userId,
    );
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
      .then((data) =>
        ok(data, 'HRM-REC-WF-200', 'Job requisition submitted to workflow'),
      );
  }

  /**
   * F-REC-YCTD-03 — approve → open_for_hire (BOD gate out_of_plan) / reject + reason.
   */
  @Post('requisitions/:requisitionId/transitions')
  transitionJobRequisition(
    @Param('requisitionId', new ParseUUIDPipe()) requisitionId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetJobRequisitionQueryDto,
    @Body() body: RequisitionTransitionDto,
    @Headers('x-user-id') userId: string | undefined,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.recruitmentService
      .transitionJobRequisition(
        requisitionId,
        body,
        query,
        authorization,
        toHrmListScopeContext(tenantId),
        {
          actorId:
            userId ?? resolveSubmitterUserIdFromAuth(authorization, userId),
        },
      )
      .then((data) =>
        ok(data, 'HRM-REC-200', 'Job requisition transition applied'),
      );
  }

  /**
   * F-REC-YCTD-04 — pipeline flags on YCTD (REC-03 Campaign DENY).
   * UPGRADE REC-04: internal_scan_* + posted gate HRM-REC-CV-SCAN-REQUIRED.
   */
  @Patch('requisitions/:requisitionId/pipeline-flags')
  patchRequisitionPipelineFlags(
    @Param('requisitionId', new ParseUUIDPipe()) requisitionId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetJobRequisitionQueryDto,
    @Body() body: PatchRequisitionPipelineFlagsDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.recruitmentService
      .patchRequisitionPipelineFlags(
        requisitionId,
        body,
        query,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, 'HRM-REC-200', 'Job requisition pipeline flags updated'),
      );
  }

  /**
   * F-REC-CV-SCAN-02/03 — Quét kho complete|skip → stamp pipeline_flags_json only.
   */
  @Post('requisitions/:requisitionId/internal-scan')
  postRequisitionInternalScan(
    @Param('requisitionId', new ParseUUIDPipe()) requisitionId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetJobRequisitionQueryDto,
    @Body() body: InternalScanDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.recruitmentService
      .postRequisitionInternalScan(
        requisitionId,
        body,
        query,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-REC-200', 'Internal CV scan recorded'));
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
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.recruitmentService
      .updateJobRequisition(
        requisitionId,
        body,
        query,
        authHeader,
        toHrmListScopeContext(tenantId),
      )
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
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.recruitmentService
      .getJobRequisitionById(
        requisitionId,
        query,
        authHeader,
        toHrmListScopeContext(tenantId),
      )
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
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.recruitmentService
      .listJobRequisitions(query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-REC-200', 'Job requisitions listed'));
  }

  /**
   * @CODE-MEMORY method · POST /candidates — FR-UC-BP-REC-05a / F-REC-UV-YCTD-03
   * YCTD (requisition_id | recruitment_request_id) REQUIRED — no silent Lane B pool.
   * Lane B pool create → POST /candidates-pool (explicit).
   * must_keep §17.6.4 — spine = recruitment_candidates · FORBIDDEN job_postings SoT
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    // FR-05a #5 — thiếu YCTD → REQUIRED (không fallback pool HRM-REC-CP-201).
    requireUvYctdRequisitionId(body);
    return this.recruitmentService
      .createCandidate(body, authorization)
      .then((data) => ok(data, 'HRM-REC-202', 'Candidate created'));
  }

  /**
   * @CODE-MEMORY method · POST /candidates-pool — Lane B explicit (G-DB-04)
   * Không phải FR-05a Thêm UV SoT — pool/hire surface riêng.
   */
  @Post('candidates-pool')
  createCandidatePoolExplicit(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateCandidateDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.recruitmentCatalog
      .createCandidatePool(body, authorization)
      .then((data) => ok(data, 'HRM-REC-CP-201', 'Candidate pool row created'));
  }

  /**
   * F-REC-CMP-01 — applications by YCTD (+ optional evals). Empty → 200 [].
   * FORBIDDEN: job_posting_id filter SoT.
   */
  @Get('applications')
  listApplicationsByYctd(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListApplicationsQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.recruitmentService
      .listApplicationsByYctd(
        query,
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, 'HRM-REC-CMP-200', 'Applications listed by YCTD'),
      );
  }

  /**
   * @CODE-MEMORY method · F-REC-HIRE-01 POST …/applications/:id/accept-offer
   * WorkItem: PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01
   * SRS: FR-UC-BP-REC-07 Diễn biến #1–#2 · BR-BP-LC-01
   * must_keep: physical /recruitment · APP-02 sole hired-outcome · DENY Nest /rec · PAY · seed
   */
  @Post('applications/:applicationId/accept-offer')
  acceptOfferApplication(
    @Param('applicationId', new ParseUUIDPipe()) applicationId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Headers('x-user-id') userId: string | undefined,
    @Query('company_id') companyId: string | undefined,
    @Body() body: AcceptOfferDto,
    @Res({ passthrough: true }) res: Response,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    const scopeCompany = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authHeader, { tenantId, companyId: scopeCompany });
    return this.recruitmentService
      .acceptOfferApplication(
        applicationId,
        body ?? {},
        scopeCompany,
        authHeader,
        toHrmListScopeContext(tenantId),
        {
          actorId: userId ?? resolveSubmitterUserIdFromAuth(authHeader, userId),
        },
      )
      .then((data) => {
        const created = data.mode === 'created';
        res.status(created ? HttpStatus.CREATED : HttpStatus.OK);
        return ok(
          data,
          created ? HRM_REC_HIRE_201 : HRM_REC_HIRE_200,
          created
            ? 'Offer accepted — employee created'
            : 'Offer accepted — employee linked',
        );
      });
  }

  /**
   * @CODE-MEMORY method · F-REC-HIRE-01-A POST …/candidates/:id/accept-offer (thin alias)
   * WorkItem: PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01
   * Primary FE remain applications/:id — same VAL/SoT.
   */
  @Post('candidates/:candidateId/accept-offer')
  acceptOfferByCandidate(
    @Param('candidateId', new ParseUUIDPipe()) candidateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Headers('x-user-id') userId: string | undefined,
    @Query('company_id') companyId: string | undefined,
    @Body() body: AcceptOfferDto,
    @Res({ passthrough: true }) res: Response,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    const scopeCompany = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authHeader, { tenantId, companyId: scopeCompany });
    return this.recruitmentService
      .acceptOfferByCandidateId(
        candidateId,
        body ?? {},
        scopeCompany,
        authHeader,
        toHrmListScopeContext(tenantId),
        {
          actorId: userId ?? resolveSubmitterUserIdFromAuth(authHeader, userId),
        },
      )
      .then((data) => {
        const created = data.mode === 'created';
        res.status(created ? HttpStatus.CREATED : HttpStatus.OK);
        return ok(
          data,
          created ? HRM_REC_HIRE_201 : HRM_REC_HIRE_200,
          created
            ? 'Offer accepted — employee created'
            : 'Offer accepted — employee linked',
        );
      });
  }

  /**
   * F-REC-CMP-02 — compare matrix ≤ N · BE MAX-N + YCTD-MIX.
   */
  @Get('compare')
  compareCandidatesByYctd(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: CompareCandidatesQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.recruitmentService
      .compareCandidatesByYctd(
        query,
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-REC-CMP-200', 'Compare matrix'));
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
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
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
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.recruitmentService
      .getCandidateById(
        candidateId,
        companyId,
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-REC-200', 'Candidate loaded'));
  }

  /**
   * @CODE-MEMORY method · F-REC-APP-02 POST …/candidates/:id/transitions
   * WorkItem: PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01
   * SRS: FR-UC-BP-REC-05 Diễn biến #1 · BR-BP-CV-02
   * must_keep: physical /recruitment · atomic history · DENY Nest /rec · pool ≠ SoT
   */
  @Post('candidates/:candidateId/transitions')
  transitionCandidateStage(
    @Param('candidateId', new ParseUUIDPipe()) candidateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Headers('x-user-id') userId: string | undefined,
    @Query('company_id') companyId: string | undefined,
    @Body() body: CandidateStageTransitionDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    const scopeCompany = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authHeader, { tenantId, companyId: scopeCompany });
    return this.recruitmentService
      .transitionCandidateStage(
        candidateId,
        body,
        scopeCompany,
        authHeader,
        toHrmListScopeContext(tenantId),
        {
          actorId: userId ?? resolveSubmitterUserIdFromAuth(authHeader, userId),
        },
      )
      .then((data) =>
        ok(data, 'HRM-REC-200', 'Candidate stage transition applied'),
      );
  }

  /**
   * @CODE-MEMORY method · F-REC-APP-02-TL GET …/candidates/:id/stage-history
   * WorkItem: PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01
   * SRS: FR-UC-BP-REC-05 Diễn biến #2 · display-ready timeline
   * must_keep: U19 scope_parity · empty [] 200 · DENY Nest /rec
   */
  @Get('candidates/:candidateId/stage-history')
  listCandidateStageHistory(
    @Param('candidateId', new ParseUUIDPipe()) candidateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListCandidateStageHistoryQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    const scopeCompany = query.company_id ?? headerCompanyId;
    resolveScopeContext(authHeader, { tenantId, companyId: scopeCompany });
    return this.recruitmentService
      .listCandidateStageHistory(
        candidateId,
        { ...query, company_id: scopeCompany },
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, 'HRM-REC-200', 'Candidate stage history listed'),
      );
  }

  /**
   * @CODE-MEMORY method · F-REC-MAIL-01 POST …/candidates/:id/mail
   * WorkItem: PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01
   * SRS: FR-UC-BP-REC-06 Diễn biến #1 · BR-BP-MAIL-01
   * must_keep: physical /recruitment · MAIL-LOG · no stage mutate · DENY Nest /rec
   */
  @Post('candidates/:candidateId/mail')
  enqueueCandidateMail(
    @Param('candidateId', new ParseUUIDPipe()) candidateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string | undefined,
    @Body() body: EnqueueCandidateMailDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    const scopeCompany = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authHeader, { tenantId, companyId: scopeCompany });
    return this.recruitmentService
      .enqueueCandidateMail(
        candidateId,
        body,
        scopeCompany,
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, 'HRM-REC-MAIL-201', 'Recruitment mail enqueued'),
      );
  }

  /**
   * @CODE-MEMORY method · F-REC-MAIL-01-R GET …/candidates/:id/mail
   * WorkItem: PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01
   */
  @Get('candidates/:candidateId/mail')
  listCandidateMail(
    @Param('candidateId', new ParseUUIDPipe()) candidateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListCandidateMailQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    const scopeCompany = query.company_id ?? headerCompanyId;
    resolveScopeContext(authHeader, { tenantId, companyId: scopeCompany });
    return this.recruitmentService
      .listCandidateMail(
        candidateId,
        { ...query, company_id: scopeCompany },
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-REC-MAIL-200', 'Recruitment mail listed'));
  }

  /**
   * @CODE-MEMORY method · optional GET …/mail-outbox/:outboxId
   * WorkItem: PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01
   */
  @Get('mail-outbox/:outboxId')
  getMailOutbox(
    @Param('outboxId', new ParseUUIDPipe()) outboxId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string | undefined,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    const scopeCompany = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authHeader, { tenantId, companyId: scopeCompany });
    return this.recruitmentService
      .getMailOutboxById(
        outboxId,
        scopeCompany,
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-REC-MAIL-200', 'Mail outbox loaded'));
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.recruitmentService
      .scheduleInterview(body, authorization)
      .then((data) => ok(data, 'HRM-REC-203', 'Interview scheduled'));
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
      .updateInterviewStatus(
        interviewId,
        body,
        companyId ?? 'main',
        authorization,
      )
      .then((data) => ok(data, 'HRM-REC-204', 'Interview updated'));
  }

  /**
   * @CODE-MEMORY method · F-REC-IV-03 R-A — PATCH scheduled_at same ACTIVE id
   * WorkItem: PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-01
   * must_keep: never POST create as reschedule · Lane A only
   */
  @Patch('interviews/:interviewId')
  rescheduleInterview(
    @Param('interviewId', new ParseUUIDPipe()) interviewId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: RescheduleInterviewDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.recruitmentService
      .rescheduleInterview(
        interviewId,
        body,
        companyId ?? 'main',
        authorization,
      )
      .then((data) => ok(data, 'HRM-REC-204', 'Interview rescheduled'));
  }
}
