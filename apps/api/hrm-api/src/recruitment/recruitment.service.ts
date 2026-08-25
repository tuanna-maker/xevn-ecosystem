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
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-IV-ONE-ACTIVE-SPINE-POOL-LINK-03
 * ADD pool-spine-bridge: listCandidates materializes spine from pool email; pool_candidate_id soft column.
 * must_keep: G-DB-04 dual catalog · one-active 409 · BE-02 slug DTO · U65 no seed.
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
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-YCTD-REF-BE-01
 * ADD YCTD↔JD soft FK gate: REQUIRED/STATUS/NOT-FOUND · alias job_description_id
 * · display-ready jd_code/jd_title on list/get · optional snapshot text (≠ values_json).
 * change_mode: ADD · must_keep ONE physical job_template_id · F-REC-YCTD stubs · no CASCADE
 * · FORBIDDEN job_postings dual-write · U65 no seed
 * SRS: FR-UC-BP-REC-02/02b Diễn biến 1a–1d · API-01 F-YCTD-JD-03..05 · DB-01
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-BE-01
 * ADD UV↔YCTD: receivable list · bind STATUS · create REQUIRED/NOT-FOUND/MISMATCH
 * · alias recruitment_request_id · position derive · list/get display-ready
 * · GET applications + GET compare MAX-N / YCTD-MIX · no silent Lane B · no job_postings SoT.
 * change_mode: ADD · must_keep ONE physical requisition_id · F-REC-APP-02/03 · no CASCADE
 * SRS: FR-UC-BP-REC-05a/06b · API-01 F-REC-UV-YCTD-* · F-REC-CMP-* · DB-01
 * solid_convention_ack: list-mutate scope_parity resolveHrmListScope shared list↔get↔create
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-BE-WATCH-FIX-01
 * FIX mapRequisitionDisplay: preserve JobRequisitionRow (company_id, workflow_instance_id)
 * after JD display-ready overlay — nest --watch TS2339 blocked submitJobRequisitionForApproval.
 * change_mode: FIX · must_keep BE-01 UV/compare gates · receivable · MAX-N/MIX · no silent Lane B
 * · workflow_instance_id LOCK · UF-HRM-12 · U65 no seed · recruitment_uat_ready DENIED
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-BE-01
 * ADD VAL-REC-CNS-05 soft-gate: scheduleInterview checks allows_interview_schedule on candidate status.
 * Error HRM-REC-IV-400-STAGE-DISALLOW ≠ UNKNOWN · ≠ HRM-REC-IV-409-ACTIVE (one-active RETAIN).
 * change_mode: ADD · must_keep one-active · G-DB-04 · U65 · recruitment_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01
 * UPGRADE Option A YCTD Wave-2: ensureSchema hire_reason/replace/out/matrix/pipeline_flags
 * + open_for_hire CHK; create→draft + VAL O2/O4/cell/hire; submit SHORT|LONG conditions;
 * ADD transitions + pipeline-flags; UV receivable+O4; RETAIN spawn UQ · JD · hrm_requisition_approval.
 * change_mode: UPGRADE · preserve_default · DENY Nest /rec dual · REC-03 · seed · honesty flip
 * SRS: FR-UC-BP-REC-02/02b · API-01 F-REC-YCTD-01..04 · DATA-01 §4–§8
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-BE-01
 * FIX create/update: normalizeTargetMonthOrThrow before $n::date — YYYY-MM→YYYY-MM-01;
 * garbage → 400 HRM-YCTD-VAL-400 (not 500 SYS). Spawn stays firstOfMonthIso.
 * change_mode: FIX · residual R-REC-02-TARGET-MONTH-DATE · must_keep CELL-QTY/BOD/UQ/U19
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-BE-ALT01-01
 * FIX reject transitions: drop unused actorId bind ($2) — no rejected_by column;
 * values=[reason,id] + id=$2::uuid (approve still uses $2→approved_by). Persist rejected_reason RETURNING.
 * change_mode: FIX · residual R-REC-02-ALT-01 · must_keep SHORT/LONG BOD · CELL-QTY · U19
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-01
 * UPGRADE F-REC-IV-02: no_show TERMINAL + cancel_reason CFG · INVALID-TRANSITION matrix
 * ADD F-REC-IV-03 R-A PATCH scheduled_at (± interviewer) on ACTIVE only
 * ADD PAST-DATETIME / CANCEL-REASON mint · ensureSchema CHECK no_show + cancel_reason col
 * RETAIN: 409 ACTIVE · soft-gate ≠ 409 · badge projection · Lane A SoT · U19
 * DENY: Nest /rec dual · Lane B SoT · seed · honesty flip · greenfield interview table
 * Spec: API-01 CONFIRMED · BA O1–O10 · SA Option A · FR-UC-BP-REC-06a #1–#7
 * change_mode: ADD/UPGRADE · preserve_default · must_keep W1–W3 · prior IV GWC · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-02
 * FIX F-REC-IV-04: embed active_interview_id in toActiveInterviewProjection (+ flat on list)
 * · getCandidateById LATERAL ACTIVE parity with list · FE Manage dialog PATCH id.
 * residual R-REC-IV-PROJ-ID · change_mode: FIX · must_keep badge · 409 · Lane A · U65
 * DENY: Nest /rec dual · Lane B SoT · seed · honesty flip · reopen W1–W3
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-04-CLUSTER-BE-01
 * UPGRADE F-REC-YCTD-04 posted gate + ADD POST …/internal-scan complete|skip;
 * PipelineFlags display-ready internal_scan_*; mint HRM-REC-CV-SCAN-*; U19.
 * change_mode: UPGRADE · FR-UC-BP-REC-04 · BR-BP-CV-01 · DENY Nest /rec · REC-03 · seed · honesty
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01
 * ADD ensureSchema rec_candidate_stage_history + Lane A open-CHK (DATA-01);
 * ADD POST …/candidates/:id/transitions — EFF/reject/reverse VAL · atomic stage+history;
 * ADD GET …/stage-history display-ready; mint HRM-REC-STAGE-*; U19 list=get=transition=timeline.
 * change_mode: ADD/UPGRADE · FR-UC-BP-REC-05 · BR-BP-CV-02 · preserve_default
 * DENY: Nest /rec dual · second SoT · REC-03 · seed · honesty · reopen REC-04
 * Spec: API-01 CONFIRMED · DATA-01 · BA O1–O9
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-02
 * FIX listCandidateStageHistory: resolveHrmListScope(query.company_id ?? '') — TS2345
 * optional DTO company_id → string; nest build + LIVE routes. Residual R-REC-05-BE-BUILD-TS2345.
 * change_mode: FIX · preserve_default · must_keep UV-YCTD · REC-04 · 06a · CAT EFF · honesty false
 * DENY: Nest /rec dual · pool SoT · seed · flip recruitment_uat_ready · reopen J-CV-04
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01
 * ADD ensureSchema rec_mail_outbox + append-only rec_mail_log (DATA-01);
 * ADD POST/GET …/candidates/:id/mail (+ GET mail-outbox/:id) — CC VAL · template CFG ·
 * MAIL-LOG append · mail fail ≠ stage; mint HRM-REC-MAIL-*; U19 list=get=mail;
 * RETAIN APP-02 sole stage writer. DENY Nest /rec · second mail SoT · Campaign · seed · honesty.
 * Spec: API-01 CONFIRMED · DATA-01 · BA O1–O12 · FR-UC-BP-REC-06 #1
 * change_mode: ADD · preserve_default · must_keep UV-YCTD · REC-05 · 06a · REC-04 · honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01
 * ADD ensureSchema employees.candidate_id + Lane A accept-audit cols (DATA-01 §5);
 * ADD POST …/applications/:id/accept-offer — create+prefill · soft stamp · reverse ·
 * idempotent 2xx · PAY-403 · mint HRM-REC-HIRE-*; RETAIN APP-02 sole hired-outcome
 * (no silent stage) · HTP-05 consume · HIRE-400/409; optional thin candidates/:id alias.
 * change_mode: ADD · preserve_default · DENY Nest /rec dual · second hire SoT · hard FK ·
 * PAY invent · mail=hire · seed · honesty flip · reopen sealed J-06
 * Spec: API-01 CONFIRMED · DATA-01 · BA O1–O12 · FR-UC-BP-REC-07 #1–#2
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-02
 * FIX R-REC-07-SOFT-LINK-PROJECTION — list/get SELECT + display-ready employee_id
 *   (list↔get parity · F5 soft stamp); FIX R-REC-07-IDEMPOTENT-OFFER-GATE — soft/reverse
 *   BEFORE assertOfferReady (hired-outcome re-accept → HIRE-200); harden post-stamp
 *   assertPersistedHireSoftLinkOrThrow (DB soft+reverse). DENY /rec · seed · honesty.
 * change_mode: FIX · preserve_default · must_keep create+prefill 201 · PAY-403 · APP-02
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 D-BE-HRM-REC-JOB-GRADE-ASSERT-01
 * ADD job_requisitions.job_grade_key · assert job_grades via SettingsCatalogs (HRM-REC-GRADE-KEY);
 * main→holding catalog partition on write; list/get SELECT job_grade_key.
 * change_mode: ADD · AC-SET-CONSUMER-JG-REC-01 · must_keep RECCHQC1 · YCTD WF · U65 no seed
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandPayrollPeriodCompanyIds,
  HrmListScope,
  HrmListScopeContext,
  MASTER_TENANT_ID,
  pushCompanyIdFilter,
  pushHrmTableScopeFilters,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  resolveHrmPersistTenantId,
  resolveHrmSettingsCatalogCompanyId,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import {
  backfillRecruitmentMainPartitionTenantId,
  ensureHrmTenantIdColumns,
} from '../common/hrm-tenant-scope-schema';
import type { HrmDbQueryFn } from '../db/hrm-db.service';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { CompareCandidatesQueryDto } from './dto/compare-candidates.query.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { ListApplicationsQueryDto } from './dto/list-applications.query.dto';
import { ListCandidatesQueryDto } from './dto/list-candidates.query.dto';
import { GetJobRequisitionQueryDto } from './dto/get-job-requisition.query.dto';
import { ListJobRequisitionsQueryDto } from './dto/list-job-requisitions.query.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { UpdateInterviewStatusDto } from './dto/update-interview-status.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';
import { RequisitionTransitionDto } from './dto/requisition-transition.dto';
import { PatchRequisitionPipelineFlagsDto } from './dto/patch-requisition-pipeline-flags.dto';
import { InternalScanDto } from './dto/internal-scan.dto';
import {
  CandidateStageTransitionDto,
  ListCandidateStageHistoryQueryDto,
} from './dto/candidate-stage-transition.dto';
import {
  EnqueueCandidateMailDto,
  ListCandidateMailQueryDto,
} from './dto/candidate-mail.dto';
import { AcceptOfferDto } from './dto/accept-offer.dto';
import {
  RecPipelineStageService,
  type RecPipelineStageDisplay,
} from './rec-pipeline-stage.service';
import {
  CFG_ALLOW_REVERSE_STAGE,
  HRM_REC_STAGE_EMPTY_CATALOG,
  HRM_REC_STAGE_HISTORY_FAIL,
  HRM_REC_STAGE_REJECT_REASON,
  HRM_REC_STAGE_REVERSE_FORBIDDEN,
  HRM_REC_STAGE_UNKNOWN,
  REC_STAGE_REJECT_KEY_FALLBACK,
} from './rec-pipeline-stage.constants';
import {
  CFG_MAIL_TEMPLATE_CODES,
  DEFAULT_MAIL_TEMPLATE_CODES,
  HRM_REC_MAIL_404,
  HRM_REC_MAIL_CC_REQUIRED,
  HRM_REC_MAIL_NEO_REQUIRED,
  HRM_REC_MAIL_PROVIDER_FAIL,
  HRM_REC_MAIL_TEMPLATE_INACTIVE,
  HRM_REC_MAIL_VAL_400,
  MAIL_TEMPLATE_INTERVIEW_INVITE,
} from './rec-mail-eval.constants';
import {
  EMP_STATUS_PENDING_DOCS,
  HRM_REC_HIRE_CANCELLED,
  HRM_REC_HIRE_DUP,
  HRM_REC_HIRE_OFFER_INVALID,
  HRM_REC_HIRE_PREFILL_FAIL,
  HRM_REC_PAY_403,
  OFFER_ACCEPTED_EVENT,
  OFFER_CANCELLED_STAGES,
  PAY_FORBIDDEN_BODY_KEYS,
} from './rec-hire.constants';
import {
  assertPersistedHireSoftLinkOrThrow,
  HRM_REC_HIRE_409,
} from './hire-employee-link';
import {
  RecruitmentWorkflowBridge,
  WF_BUSINESS_TYPE_HRM_REQUISITION,
} from './recruitment-workflow.bridge';
import {
  assertYctdJdBindableOrThrow,
  assertYctdJdRebindAllowed,
  requireYctdJdTemplateId,
  resolveYctdJdTemplateId,
  toRequisitionJdDisplayReady,
  type YctdJdTemplateBindRow,
} from './yctd-jd-bind';
import {
  assertCompareMaxNOrThrow,
  assertCompareSameYctdOrThrow,
  assertUvPositionKeyMatchesOrThrow,
  assertUvYctdReceivableOrThrow,
  COMPARE_EVAL_LANE_A_ID_SQL,
  HRM_REC_UV_YCTD_NOT_FOUND,
  isUvReceivableListQuery,
  isUvYctdBindTargetQuery,
  normalizeCompareScoreItems,
  parseCandidateIdList,
  REC_COMPARE_MAX_N,
  requireUvYctdRequisitionId,
  resolveUvYctdRequisitionId,
  toCandidateUvDisplayReady,
  toReceivableListItem,
  toUvPositionDisplay,
  type UvYctdReceivableRow,
} from './uv-yctd-bind';
import { materializeMissingSpineCandidatesFromPool } from './pool-spine-bridge';
import {
  assertCellQtyOrThrow,
  assertInternalScanSkipActorOrThrow,
  assertMatrixMatchesModeOrThrow,
  assertPostedAllowedOrThrow,
  assertYctdOpenForInternalScanOrThrow,
  assertYctdReceivableForMutateOrThrow,
  applyInternalScanComplete,
  applyInternalScanSkip,
  backfillLegacyYctdHeadcountMode,
  EMPTY_PIPELINE_FLAGS,
  HRM_YCTD_CELL_MISSING,
  HRM_YCTD_CELL_NOT_APPROVED,
  HRM_YCTD_CELL_PLAN_NOT_APPROVED,
  HRM_YCTD_BOD_REQUIRED,
  HRM_YCTD_MODE_REQUIRED,
  HRM_YCTD_NOT_RECEIVABLE,
  HRM_YCTD_SPAWN_DUP,
  HRM_YCTD_VAL_400,
  isLegacyUnclassifiedMode,
  mergePipelineFlags,
  normalizeHeadcountMode,
  normalizeHireReason,
  normalizeTargetMonthOrThrow,
  parsePipelineFlags,
  pipelineRequiresReceivableGate,
  requireHireReasonOrThrow,
  requireInternalScanSkipReasonOrThrow,
  requireModeOrThrow,
  requireOutOfPlanReasonOrThrow,
  requireRejectedReasonOrThrow,
  resolveApprovalMatrixKey,
  type CellCapacitySnapshot,
  type YctdHeadcountMode,
} from './yctd-requisition-gates';
import {
  isPlanApprovedStatus,
  projectMonthsForApi,
} from './recruitment-plan-headcount';

type JobRequisitionRow = {
  id: string;
  tenant_id?: string | null;
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
  headcount_mode?: string | null;
  headcount_cell_id?: string | null;
  target_month?: string | null;
  recruitment_plan_id?: string | null;
  department_key?: string | null;
  hire_reason?: string | null;
  replace_employee_id?: string | null;
  out_of_plan_reason?: string | null;
  approval_matrix_key?: string | null;
  pipeline_flags_json?: unknown;
  approved_at?: string | null;
  approved_by?: string | null;
  rejected_reason?: string | null;
  jd_code?: string | null;
  jd_title?: string | null;
  position_key?: string | null;
  job_grade_key?: string | null;
  position_name?: string | null;
  position_code?: string | null;
  /** Lane A UV count on this YCTD (list/picker disambiguation). */
  candidate_count?: number | string | null;
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
  /** Soft hire stamp (G-DB-01 / REC-07 O7) — display-ready on list↔get. */
  employee_id?: string | null;
  created_at: string;
  updated_at: string;
};

type ActiveInterviewProjection = {
  has_active_interview: boolean;
  /** ACTIVE interview UUID — FE Manage cancel/complete/no_show/R-A PATCH (F-REC-IV-04). */
  active_interview_id: string | null;
  active_interview_status: string | null;
  active_interview_at: string | null;
  active_interview_display_time_vi_vn: string;
  active_interview_badge_label: string | null;
};

type CandidateListRow = CandidateRow & {
  active_interview_id: string | null;
  active_interview_status: string | null;
  active_interview_at: string | null;
};

type InterviewRow = {
  id: string;
  company_id: string;
  candidate_id: string;
  scheduled_at: string;
  interviewer: string;
  status: string;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
};

type InterviewConflictRow = {
  id: string;
  status: string;
  scheduled_at: string;
};

const ACTIVE_INTERVIEW_STATUSES = ['scheduled', 'confirmed'] as const;
/** TERMINAL unlocks create — includes legacy passed|failed (completed-family). */
const TERMINAL_INTERVIEW_STATUSES = [
  'cancelled',
  'completed',
  'no_show',
  'passed',
  'failed',
] as const;
const ACTIVE_INTERVIEW_BADGE_LABEL = 'Đã có lịch';
const CFG_INTERVIEW_CANCEL_REASON_REQUIRED = 'interview_cancel_reason_required';
const CFG_ALLOW_PAST_INTERVIEW_SCHEDULE = 'allow_past_interview_schedule';
const INTERVIEW_RETURNING =
  'id, company_id, candidate_id, scheduled_at, interviewer, status, cancel_reason, created_at, updated_at';

/** VAL-JG-REC-BE-01 — job_grades consumer on YCTD write when EFF>0. */
export const HRM_REC_GRADE_KEY = 'HRM-REC-GRADE-KEY';

@Injectable()
export class RecruitmentService {
  /** REC-PERF: skip ~65 DDL round-trips after first successful ensure (remote DB). */
  private schemaReady = false;
  private schemaEnsurePromise: Promise<void> | null = null;

  constructor(
    private readonly db: HrmDbService,
    private readonly recruitmentWorkflowBridge: RecruitmentWorkflowBridge,
    @Optional() private readonly recPipelineStages?: RecPipelineStageService,
    @Optional() private readonly moduleRef?: ModuleRef,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
  ) {}

  private resolveCatalogTenantId(): string {
    return masterTenantIdFromEnv() || MASTER_TENANT_ID;
  }

  /**
   * EFF>0 + non-empty code → assertCodeInEffectiveCatalog(job_grades).
   * Empty/null → persist null (EFF=0 honest empty).
   */
  private async resolveJobGradeKeyForWrite(
    authorization: string | undefined,
    persistCompanyId: string,
    raw: string | null | undefined,
  ): Promise<string | null> {
    const trimmed = typeof raw === 'string' ? raw.trim() : '';
    if (!trimmed) return null;
    if (!this.settingsCatalogs) return trimmed;
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      this.resolveCatalogTenantId(),
      persistCompanyId,
    );
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId: this.resolveCatalogTenantId(),
      companyId: catalogCompanyId,
      catalogKey: 'job_grades',
      code: trimmed,
      errorCode: HRM_REC_GRADE_KEY,
      errorMessage: `${HRM_REC_GRADE_KEY}: '${trimmed}' is not in job_grades catalog`,
    });
    return hit.code;
  }

  private resolveRecPipelineStages(): RecPipelineStageService | undefined {
    if (this.recPipelineStages) return this.recPipelineStages;
    if (!this.moduleRef) return undefined;
    try {
      return this.moduleRef.get(RecPipelineStageService, { strict: false });
    } catch {
      return undefined;
    }
  }
  private resolvePage(
    value: number | string | undefined,
    fallback: number,
  ): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.trunc(parsed);
  }

  private resolvePageSize(
    value: number | string | undefined,
    fallback: number,
  ): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.min(100, Math.trunc(parsed));
  }

  private async ensureSchema() {
    if (this.schemaReady) return;
    if (this.schemaEnsurePromise) return this.schemaEnsurePromise;
    this.schemaEnsurePromise = this.runEnsureSchema();
    return this.schemaEnsurePromise;
  }

  private async runEnsureSchema() {
    try {
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
        CONSTRAINT chk_recruitment_candidates_status_open
          CHECK (status IS NOT NULL AND length(trim(status)) > 0)
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
    await this.db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'chk_recruitment_interviews_status'
        ) THEN
          ALTER TABLE public.recruitment_interviews
            DROP CONSTRAINT chk_recruitment_interviews_status;
        END IF;
        ALTER TABLE public.recruitment_interviews
          ADD CONSTRAINT chk_recruitment_interviews_status CHECK (
            status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show', 'passed', 'failed')
          );
      END $$;
    `);
    await this.db.query(`
      ALTER TABLE public.recruitment_interviews
      ADD COLUMN IF NOT EXISTS cancel_reason TEXT NULL;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uniq_recruitment_interviews_active_candidate
      ON public.recruitment_interviews (company_id, candidate_id)
      WHERE status IN ('scheduled', 'confirmed');
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
      ADD COLUMN IF NOT EXISTS tenant_id TEXT NULL;
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
    // PO-HRM-REC-IV-ONE-ACTIVE-SPINE-POOL-LINK-03 — soft pool trace (no REFERENCES — G-DB-02).
    await this.db.query(`
      ALTER TABLE public.recruitment_candidates
      ADD COLUMN IF NOT EXISTS pool_candidate_id UUID NULL;
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
    // PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01 — YCTD headcount link cols (DATA-01 §7).
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS headcount_cell_id UUID NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS headcount_mode TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS target_month DATE NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS recruitment_plan_id UUID NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS department_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS position_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS job_grade_key TEXT NULL;
    `);
    await this.db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_job_requisitions_headcount_mode'
        ) THEN
          ALTER TABLE public.job_requisitions
            ADD CONSTRAINT chk_job_requisitions_headcount_mode
            CHECK (headcount_mode IS NULL OR headcount_mode IN ('in_plan', 'out_of_plan'));
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_job_requisitions_spawn_cell
      ON public.job_requisitions (company_id, headcount_cell_id)
      WHERE headcount_mode = 'in_plan' AND headcount_cell_id IS NOT NULL;
    `);
    // PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01 — Wave-2 YCTD columns (DATA-01 §4.2).
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS hire_reason TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS replace_employee_id UUID NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS out_of_plan_reason TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS approval_matrix_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS pipeline_flags_json JSONB NULL DEFAULT '{}'::jsonb;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS approved_by TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;
    `);
    await this.db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_job_requisitions_hire_reason'
        ) THEN
          ALTER TABLE public.job_requisitions
            ADD CONSTRAINT chk_job_requisitions_hire_reason
            CHECK (hire_reason IS NULL OR hire_reason IN ('new', 'replace'));
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_job_requisitions_replace_emp'
        ) THEN
          ALTER TABLE public.job_requisitions
            ADD CONSTRAINT chk_job_requisitions_replace_emp
            CHECK (
              (hire_reason IS DISTINCT FROM 'replace')
              OR (replace_employee_id IS NOT NULL)
            );
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_job_requisitions_in_plan_cell'
        ) THEN
          ALTER TABLE public.job_requisitions
            ADD CONSTRAINT chk_job_requisitions_in_plan_cell
            CHECK (
              (headcount_mode IS DISTINCT FROM 'in_plan')
              OR (headcount_cell_id IS NOT NULL)
            );
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_job_requisitions_hire_reason
      ON public.job_requisitions (company_id, hire_reason);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_job_requisitions_replace_employee_id
      ON public.job_requisitions (replace_employee_id)
      WHERE replace_employee_id IS NOT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_job_requisitions_approval_matrix_key
      ON public.job_requisitions (company_id, approval_matrix_key)
      WHERE approval_matrix_key IS NOT NULL;
    `);
    // PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01 §7 — O4 legacy uplift (cell → in_plan, else out_of_plan).
    await backfillLegacyYctdHeadcountMode(this.db);
    // PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01 — DATA-01 O4: DROP closed-six → open non-empty.
    await this.db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'chk_recruitment_candidates_status'
        ) THEN
          ALTER TABLE public.recruitment_candidates
            DROP CONSTRAINT chk_recruitment_candidates_status;
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'chk_recruitment_candidates_status_open'
        ) THEN
          ALTER TABLE public.recruitment_candidates
            ADD CONSTRAINT chk_recruitment_candidates_status_open
            CHECK (status IS NOT NULL AND length(trim(status)) > 0);
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01 — DATA-01 O2: append-only stage history (Lane A FK).
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.rec_candidate_stage_history (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        recruitment_candidate_id UUID NOT NULL
          REFERENCES public.recruitment_candidates (id),
        application_id UUID NULL,
        from_stage TEXT NULL,
        to_stage TEXT NOT NULL,
        note TEXT NULL,
        desired_salary NUMERIC NULL,
        changed_by UUID NULL,
        changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_rec_candidate_stage_history_to_stage
          CHECK (length(trim(to_stage)) > 0)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_rec_csh_candidate_changed
      ON public.rec_candidate_stage_history (recruitment_candidate_id, changed_at DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_rec_csh_company_changed
      ON public.rec_candidate_stage_history (company_id, changed_at DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_rec_csh_application
      ON public.rec_candidate_stage_history (application_id)
      WHERE application_id IS NOT NULL;
    `);
    // PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01 — DATA-01 §4: ONE mail outbox + append log.
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.rec_mail_outbox (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        recruitment_candidate_id UUID NULL
          REFERENCES public.recruitment_candidates (id),
        application_id UUID NULL,
        requisition_id UUID NULL,
        template_code TEXT NOT NULL,
        to_emails_json JSONB NOT NULL,
        cc_emails_json JSONB NULL,
        payload_json JSONB NULL,
        status TEXT NOT NULL DEFAULT 'queued',
        queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        sent_at TIMESTAMPTZ NULL,
        error_message TEXT NULL,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_rec_mail_outbox_status
          CHECK (status IN ('queued', 'sending', 'sent', 'failed')),
        CONSTRAINT chk_rec_mail_outbox_template
          CHECK (length(trim(template_code)) > 0),
        CONSTRAINT chk_rec_mail_outbox_neo
          CHECK (recruitment_candidate_id IS NOT NULL OR application_id IS NOT NULL)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_rec_mail_outbox_company_status
      ON public.rec_mail_outbox (company_id, status)
      WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_rec_mail_outbox_candidate
      ON public.rec_mail_outbox (recruitment_candidate_id, queued_at DESC)
      WHERE recruitment_candidate_id IS NOT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_rec_mail_outbox_app_tpl
      ON public.rec_mail_outbox (application_id, template_code)
      WHERE application_id IS NOT NULL;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.rec_mail_log (
        id UUID PRIMARY KEY,
        outbox_id UUID NOT NULL
          REFERENCES public.rec_mail_outbox (id),
        company_id TEXT NOT NULL,
        attempt_no INT NOT NULL,
        provider_ref TEXT NULL,
        result TEXT NOT NULL,
        error_message TEXT NULL,
        logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_rec_mail_log_result CHECK (result IN ('sent', 'failed')),
        CONSTRAINT chk_rec_mail_log_attempt CHECK (attempt_no >= 1),
        CONSTRAINT uq_rec_mail_log_outbox_attempt UNIQUE (outbox_id, attempt_no)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_rec_mail_log_outbox
      ON public.rec_mail_log (outbox_id, logged_at DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_rec_mail_log_company
      ON public.rec_mail_log (company_id, logged_at DESC);
    `);
    // PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01 — DATA-01 §5.1 reverse soft link (no hard FK).
    await this.db.query(`
      ALTER TABLE public.employees
      ADD COLUMN IF NOT EXISTS candidate_id UUID NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_candidate_id_active
      ON public.employees (candidate_id)
      WHERE candidate_id IS NOT NULL AND archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_rec_cand_employee_id
      ON public.recruitment_candidates (employee_id)
      WHERE employee_id IS NOT NULL;
    `);
    // PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01 — DATA-01 §5.2 optional accept-audit (DENY second hire table).
    await this.db.query(`
      ALTER TABLE public.recruitment_candidates
      ADD COLUMN IF NOT EXISTS offer_accepted_at TIMESTAMPTZ NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.recruitment_candidates
      ADD COLUMN IF NOT EXISTS offer_accepted_by TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.recruitment_candidates
      ADD COLUMN IF NOT EXISTS accepted_application_id UUID NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.recruitment_candidates
      ADD COLUMN IF NOT EXISTS offer_id UUID NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_rec_cand_offer_accepted
      ON public.recruitment_candidates (company_id, offer_accepted_at DESC)
      WHERE offer_accepted_at IS NOT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_rec_cand_accepted_app
      ON public.recruitment_candidates (accepted_application_id)
      WHERE accepted_application_id IS NOT NULL;
    `);
    // REC-PERF-BE-01: Performance indexes for list queries.
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_job_requisitions_company_status
      ON public.job_requisitions (company_id, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_job_requisitions_company_created_at
      ON public.job_requisitions (company_id, created_at DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_company_requisition
      ON public.recruitment_candidates (company_id, requisition_id);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_company_created_at
      ON public.recruitment_candidates (company_id, created_at DESC);
    `);
    await this.recruitmentWorkflowBridge.ensureSchema();
    await ensureHrmTenantIdColumns((sql) => this.db.query(sql));
    await backfillRecruitmentMainPartitionTenantId(
      (sql, params) => this.db.query(sql, params),
      masterTenantIdFromEnv(),
    );
    this.schemaReady = true;
    } finally {
      this.schemaEnsurePromise = null;
    }
  }

  private toViVnDateTime(value: string | null): string {
    if (!value) {
      return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    const parts = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const lookup = new Map(parts.map((part) => [part.type, part.value]));
    const day = lookup.get('day');
    const month = lookup.get('month');
    const year = lookup.get('year');
    const hour = lookup.get('hour');
    const minute = lookup.get('minute');
    if (!day || !month || !year || !hour || !minute) {
      return '—';
    }
    return `${day}/${month}/${year} ${hour}:${minute}`;
  }

  private toActiveInterviewProjection(row: {
    active_interview_id?: string | null;
    active_interview_status: string | null;
    active_interview_at: string | null;
  }): ActiveInterviewProjection {
    if (!row.active_interview_status || !row.active_interview_at) {
      return {
        has_active_interview: false,
        active_interview_id: null,
        active_interview_status: null,
        active_interview_at: null,
        active_interview_display_time_vi_vn: '—',
        active_interview_badge_label: null,
      };
    }
    const id =
      typeof row.active_interview_id === 'string'
        ? row.active_interview_id.trim()
        : '';
    return {
      has_active_interview: true,
      active_interview_id: id || null,
      active_interview_status: row.active_interview_status,
      active_interview_at: row.active_interview_at,
      active_interview_display_time_vi_vn: this.toViVnDateTime(
        row.active_interview_at,
      ),
      active_interview_badge_label: ACTIVE_INTERVIEW_BADGE_LABEL,
    };
  }

  private async throwOneActiveConflict(
    companyId: string,
    candidateId: string,
    message = 'Ứng viên đã có lịch phỏng vấn đang hiệu lực',
  ): Promise<never> {
    const active = await this.db.query<InterviewConflictRow>(
      `SELECT id, status, scheduled_at
       FROM public.recruitment_interviews
       WHERE company_id = $1::text
         AND candidate_id = $2::uuid
         AND status IN ('scheduled', 'confirmed')
       ORDER BY scheduled_at DESC
       LIMIT 1;`,
      [companyId, candidateId],
    );
    const current = active.rows[0];
    throw new ApiException(
      'HRM-REC-IV-409-ACTIVE',
      message,
      HttpStatus.CONFLICT,
      {
        candidate_id: candidateId,
        active_interview_id: current?.id ?? null,
        active_status: current?.status ?? null,
        active_at: current?.scheduled_at ?? null,
      },
    );
  }

  private isActiveInterviewStatus(status: string): boolean {
    return ACTIVE_INTERVIEW_STATUSES.includes(
      status as (typeof ACTIVE_INTERVIEW_STATUSES)[number],
    );
  }

  private isTerminalInterviewStatus(status: string): boolean {
    return TERMINAL_INTERVIEW_STATUSES.includes(
      status as (typeof TERMINAL_INTERVIEW_STATUSES)[number],
    );
  }

  private isUniqueActiveInterviewViolation(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }
    const pgError = error as { code?: string; constraint?: string };
    return (
      pgError.code === '23505' &&
      pgError.constraint === 'uniq_recruitment_interviews_active_candidate'
    );
  }

  /** Tenant CFG boolean — unset → defaultValue (O6/O7). Soft-fail if settings table absent. */
  private async readInterviewCfgBoolean(
    companyId: string,
    settingKey: string,
    defaultValue: boolean,
  ): Promise<boolean> {
    try {
      const res = await this.db.query<{ value_json: unknown }>(
        `SELECT value_json
         FROM public.hrm_company_settings
         WHERE company_id = $1::text
           AND setting_key = $2
           AND archived_at IS NULL
         ORDER BY updated_at DESC
         LIMIT 1;`,
        [companyId, settingKey],
      );
      const raw = res.rows[0]?.value_json;
      if (raw == null) return defaultValue;
      if (typeof raw === 'boolean') return raw;
      if (typeof raw === 'string') {
        const normalized = raw.trim().toLowerCase();
        if (normalized === 'true' || normalized === '1') return true;
        if (normalized === 'false' || normalized === '0') return false;
        return defaultValue;
      }
      if (typeof raw === 'object') {
        const obj = raw as Record<string, unknown>;
        const candidate = obj.value ?? obj.enabled ?? obj[settingKey];
        if (typeof candidate === 'boolean') return candidate;
        if (typeof candidate === 'string') {
          const normalized = candidate.trim().toLowerCase();
          if (normalized === 'true' || normalized === '1') return true;
          if (normalized === 'false' || normalized === '0') return false;
        }
      }
      return defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private assertScheduledAtNotPastOrThrow(
    scheduledAt: string,
    allowPast: boolean,
  ): void {
    const ts = Date.parse(scheduledAt);
    if (Number.isNaN(ts)) {
      throw new ApiException(
        'HRM-REC-IV-400-PAST-DATETIME',
        'Ngày giờ phỏng vấn không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!allowPast && ts < Date.now()) {
      throw new ApiException(
        'HRM-REC-IV-400-PAST-DATETIME',
        'Không được xếp lịch phỏng vấn trong quá khứ theo chính sách pháp nhân',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * F-REC-IV-02 transition matrix (API-01 §4.2).
   * ACTIVE → TERMINAL / confirmed (from scheduled) only; TERMINAL → anything = INVALID.
   */
  private assertInterviewStatusTransitionOrThrow(
    fromStatus: string,
    toStatus: string,
  ): void {
    if (this.isTerminalInterviewStatus(fromStatus)) {
      throw new ApiException(
        'HRM-REC-IV-400-INVALID-TRANSITION',
        'Không thể đổi trạng thái lịch phỏng vấn đã kết thúc',
        HttpStatus.BAD_REQUEST,
        { from_status: fromStatus, to_status: toStatus },
      );
    }
    if (!this.isActiveInterviewStatus(fromStatus)) {
      throw new ApiException(
        'HRM-REC-IV-400-INVALID-TRANSITION',
        'Trạng thái lịch phỏng vấn nguồn không hợp lệ',
        HttpStatus.BAD_REQUEST,
        { from_status: fromStatus, to_status: toStatus },
      );
    }
    if (fromStatus === toStatus) {
      throw new ApiException(
        'HRM-REC-IV-400-INVALID-TRANSITION',
        'Chuyển trạng thái phỏng vấn không hợp lệ',
        HttpStatus.BAD_REQUEST,
        { from_status: fromStatus, to_status: toStatus },
      );
    }
    if (toStatus === 'confirmed') {
      if (fromStatus !== 'scheduled') {
        throw new ApiException(
          'HRM-REC-IV-400-INVALID-TRANSITION',
          'Chỉ lịch đang lên lịch mới được xác nhận',
          HttpStatus.BAD_REQUEST,
          { from_status: fromStatus, to_status: toStatus },
        );
      }
      return;
    }
    if (this.isTerminalInterviewStatus(toStatus)) {
      return;
    }
    // ACTIVE→ACTIVE other (e.g. confirmed→scheduled) forbidden
    throw new ApiException(
      'HRM-REC-IV-400-INVALID-TRANSITION',
      'Chuyển trạng thái phỏng vấn không hợp lệ',
      HttpStatus.BAD_REQUEST,
      { from_status: fromStatus, to_status: toStatus },
    );
  }

  /**
   * Resolve soft FK target in same list scope — STATUS / NOT-FOUND (F-YCTD-JD-03).
   * FORBIDDEN: write job_postings from this path.
   */
  private async resolveYctdBindTemplate(
    templateId: string,
    companyId: string,
    authorization?: string,
  ): Promise<YctdJdTemplateBindRow> {
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [templateId];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query<YctdJdTemplateBindRow>(
      `SELECT id::text AS id, code, title, job_description, requirements, status, is_active,
              position_code, position_name
       FROM public.job_description_templates
       WHERE ${filters.join(' AND ')}
       LIMIT 1`,
      values,
    );
    return assertYctdJdBindableOrThrow(res.rows[0]);
  }

  private mapRequisitionDisplay(row: JobRequisitionRow) {
    // Keep JobRequisitionRow on the typed result — casting only to Record<string, unknown>
    // erased company_id / workflow_instance_id (TS2339 on submitJobRequisitionForApproval).
    const jdReady = toRequisitionJdDisplayReady(
      row as JobRequisitionRow & Record<string, unknown>,
      {
        code: row.jd_code,
        title: row.jd_title,
      },
    );
    const positionKey =
      (row.position_key ?? '').trim() || (row.position_code ?? '').trim() || '';
    const positionName =
      (row.position_name ?? '').trim() || row.title || positionKey || '—';
    const pipeline_flags = parsePipelineFlags(row.pipeline_flags_json);
    const classification_required = isLegacyUnclassifiedMode(
      row.headcount_mode,
    );
    const mode = normalizeHeadcountMode(row.headcount_mode);
    const requires_bod =
      mode === 'out_of_plan' &&
      !['open_for_hire', 'open', 'rejected', 'cancelled', 'closed'].includes(
        String(row.status ?? '')
          .trim()
          .toLowerCase(),
      );
    return {
      ...row,
      job_template_id: jdReady.job_template_id,
      job_description_id: jdReady.job_description_id,
      jd_code: jdReady.jd_code,
      jd_title: jdReady.jd_title,
      position_key: positionKey,
      position_name: positionName,
      position_code: row.position_code ?? null,
      headcount_mode: row.headcount_mode ?? null,
      headcount_cell_id: row.headcount_cell_id ?? null,
      hire_reason: row.hire_reason ?? null,
      replace_employee_id: row.replace_employee_id ?? null,
      out_of_plan_reason: row.out_of_plan_reason ?? null,
      approval_matrix_key: row.approval_matrix_key ?? null,
      pipeline_flags,
      classification_required: classification_required || undefined,
      requires_bod: requires_bod || undefined,
      recruitment_request_id: row.id,
      requisition_id: row.id,
      candidate_count:
        row.candidate_count != null &&
        Number.isFinite(Number(row.candidate_count))
          ? Number(row.candidate_count)
          : 0,
    };
  }

  private requisitionSelectSql(): string {
    return `SELECT r.id, r.tenant_id, r.company_id, r.title, r.department, r.employment_type, r.headcount, r.status,
              r.job_description, r.requirements, r.job_template_id,
              r.workflow_instance_id::text AS workflow_instance_id,
              r.headcount_mode, r.headcount_cell_id::text AS headcount_cell_id,
              r.target_month::text AS target_month,
              r.recruitment_plan_id::text AS recruitment_plan_id,
              r.department_key, r.position_key AS req_position_key,
              r.job_grade_key,
              r.hire_reason, r.replace_employee_id::text AS replace_employee_id,
              r.out_of_plan_reason, r.approval_matrix_key,
              r.pipeline_flags_json,
              r.approved_at::text AS approved_at, r.approved_by,
              r.rejected_reason,
              t.code AS jd_code, t.title AS jd_title,
              t.position_code AS position_code,
              COALESCE(NULLIF(r.position_key, ''), t.position_code, '') AS position_key,
              t.position_name AS position_name,
              (SELECT COUNT(1)::int FROM public.recruitment_candidates rc
                WHERE rc.requisition_id = r.id) AS candidate_count,
              r.created_at, r.updated_at
       FROM public.job_requisitions r
       LEFT JOIN public.job_description_templates t ON t.id::text = r.job_template_id`;
  }

  private toReceivableRow(row: JobRequisitionRow): UvYctdReceivableRow {
    return {
      id: row.id,
      company_id: row.company_id,
      title: row.title,
      status: row.status,
      headcount: row.headcount,
      headcount_mode: row.headcount_mode ?? null,
      position_key: row.position_key ?? row.position_code ?? null,
      position_name: row.position_name ?? null,
      position_code: row.position_code ?? null,
      code: row.jd_code ?? null,
    };
  }

  /**
   * Soft-resolve headcount_cell_id → months_data[].cell_id (REC-01 — no hard FK).
   */
  private async resolveInPlanCellOrThrow(
    cellId: string,
    companyIds: string[],
  ): Promise<CellCapacitySnapshot> {
    if (!cellId?.trim()) {
      throw new ApiException(
        HRM_YCTD_CELL_MISSING,
        'headcount_cell_id bắt buộc khi headcount_mode=in_plan',
        HttpStatus.CONFLICT,
      );
    }
    const filters: string[] = [];
    const values: unknown[] = [];
    if (companyIds.length === 1) {
      values.push(companyIds[0]);
      filters.push(`pl.company_id = $${values.length}::text`);
    } else {
      values.push(companyIds);
      filters.push(`pl.company_id = ANY($${values.length}::text[])`);
    }
    const res = await this.db.query<{
      plan_id: string;
      plan_status: string;
      company_id: string;
      months_data: unknown;
    }>(
      `SELECT pl.id::text AS plan_id, pl.status AS plan_status, pl.company_id::text AS company_id,
              pos.months_data
       FROM public.recruitment_plan_positions pos
       JOIN public.recruitment_plan_departments d ON d.id = pos.department_id
       JOIN public.recruitment_plans pl ON pl.id = d.plan_id
       WHERE ${filters.join(' AND ')}
       LIMIT 200`,
      values,
    );
    for (const row of res.rows) {
      const months = projectMonthsForApi(row.months_data, true);
      const cell = months.find((c) => c.cell_id === cellId);
      if (!cell) continue;
      if (!isPlanApprovedStatus(row.plan_status)) {
        throw new ApiException(
          HRM_YCTD_CELL_PLAN_NOT_APPROVED,
          'Định biên gắn ô chưa được duyệt — không lập YCTD trong ĐB',
          HttpStatus.CONFLICT,
        );
      }
      if (cell.lifecycle_status !== 'need_hire_approved') {
        throw new ApiException(
          HRM_YCTD_CELL_NOT_APPROVED,
          'Ô Cần tuyển chưa ở trạng thái need_hire_approved',
          HttpStatus.CONFLICT,
        );
      }
      return {
        cell_id: cell.cell_id,
        lifecycle_status: cell.lifecycle_status,
        plan_status: row.plan_status,
        headcount_need_hire: Number(cell.headcount_need_hire) || 0,
        plan_id: row.plan_id,
      };
    }
    throw new ApiException(
      HRM_YCTD_CELL_MISSING,
      'Không tìm thấy ô định biên (headcount_cell_id) trong phạm vi pháp nhân',
      HttpStatus.CONFLICT,
    );
  }

  private async assertNoSpawnDupOrThrow(
    companyId: string,
    cellId: string,
    excludeRequisitionId?: string,
  ): Promise<void> {
    const res = await this.db.query<{ id: string }>(
      `SELECT id::text AS id FROM public.job_requisitions
       WHERE company_id = $1::text
         AND headcount_mode = 'in_plan'
         AND headcount_cell_id = $2::uuid
         AND ($3::uuid IS NULL OR id <> $3::uuid)
         AND archived_at IS NULL
       LIMIT 1`,
      [companyId, cellId, excludeRequisitionId ?? null],
    );
    if (res.rows[0]) {
      throw new ApiException(
        HRM_YCTD_SPAWN_DUP,
        'Ô này đã có YCTD trong ĐB — không tạo trùng (spawn UQ)',
        HttpStatus.CONFLICT,
        { existing_requisition_id: res.rows[0].id, headcount_cell_id: cellId },
      );
    }
  }

  /**
   * VAL-01..07 for create/submit/classify — mode required on submit; draft may be partial.
   */
  private async validateYctdFieldsOrThrow(opts: {
    mode: YctdHeadcountMode | null;
    headcount: number;
    hire_reason?: unknown;
    replace_employee_id?: string | null;
    out_of_plan_reason?: unknown;
    headcount_cell_id?: string | null;
    companyIds: string[];
    companyIdPersist: string;
    requireComplete: boolean;
    excludeRequisitionId?: string;
  }): Promise<{
    mode: YctdHeadcountMode | null;
    hire_reason: string | null;
    replace_employee_id: string | null;
    out_of_plan_reason: string | null;
    headcount_cell_id: string | null;
    recruitment_plan_id: string | null;
  }> {
    let mode = opts.mode;
    if (opts.requireComplete) {
      mode = requireModeOrThrow(mode);
    }
    let hire_reason: string | null = normalizeHireReason(opts.hire_reason);
    let replace_employee_id: string | null =
      (opts.replace_employee_id ?? '').trim() || null;
    let out_of_plan_reason: string | null =
      typeof opts.out_of_plan_reason === 'string'
        ? opts.out_of_plan_reason.trim() || null
        : null;
    let headcount_cell_id: string | null =
      (opts.headcount_cell_id ?? '').trim() || null;
    let recruitment_plan_id: string | null = null;

    if (opts.requireComplete) {
      const hire = requireHireReasonOrThrow(
        opts.hire_reason,
        opts.replace_employee_id,
      );
      hire_reason = hire.hire_reason;
      replace_employee_id = hire.replace_employee_id;
      if (mode === 'out_of_plan') {
        out_of_plan_reason = requireOutOfPlanReasonOrThrow(
          opts.out_of_plan_reason,
        );
        headcount_cell_id = null;
      }
    }

    if (mode === 'in_plan') {
      // On complete submit (requireComplete=true), cell_id is mandatory.
      // On draft (requireComplete=false), allow partial data — cell validation deferred to submit.
      if (!headcount_cell_id && opts.requireComplete) {
        throw new ApiException(
          HRM_YCTD_CELL_MISSING,
          'headcount_cell_id bắt buộc khi headcount_mode=in_plan',
          HttpStatus.CONFLICT,
        );
      }
      if (headcount_cell_id) {
        const cell = await this.resolveInPlanCellOrThrow(
          headcount_cell_id,
          opts.companyIds,
        );
        assertCellQtyOrThrow(opts.headcount, cell.headcount_need_hire);
        await this.assertNoSpawnDupOrThrow(
          opts.companyIdPersist,
          headcount_cell_id,
          opts.excludeRequisitionId,
        );
        recruitment_plan_id = cell.plan_id;
      }
    }

    return {
      mode,
      hire_reason,
      replace_employee_id,
      out_of_plan_reason,
      headcount_cell_id: mode === 'out_of_plan' ? null : headcount_cell_id,
      recruitment_plan_id,
    };
  }

  /**
   * @CODE-MEMORY method · FR-HRM-RC-01 · G-RC-01 · F-YCTD-JD-03 · F-REC-YCTD-01
   * SRS bước: Diễn biến #4 Số lượng ≤0 · REC-02 1c/1d bind JD · #6 Lưu nháp draft
   * TechSpec: §14.7 · API-01 §5.1 — create status=draft (Y-S7 cấm open)
   */
  async createJobRequisition(
    payload: CreateJobRequisitionDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const scope = resolveHrmListScope(authorization, payload.company_id);
    const headcount = Math.trunc(Number(payload.headcount));
    // Thất bại: Diễn biến #4 — số lượng ≤ 0 (defense + DTO @Min(1)).
    if (!Number.isFinite(headcount) || headcount < 1) {
      throw new ApiException(
        'HRM-REC-400',
        'Requisition headcount must be an integer greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }
    // BR-YCTD-JD-REF-01 — JD soft FK bắt buộc khi tạo YCTD (GĐ1).
    const templateId = requireYctdJdTemplateId(payload);
    const jd = await this.resolveYctdBindTemplate(
      templateId,
      payload.company_id,
      authorization,
    );
    const snapshotDesc =
      payload.job_description?.trim() ||
      (jd.job_description ?? '').trim() ||
      null;
    const snapshotReq =
      payload.requirements?.trim() || (jd.requirements ?? '').trim() || null;

    const modeHint = normalizeHeadcountMode(payload.headcount_mode);
    // Draft may be partial; when mode provided, enforce cell/qty/UQ (O2/Y-S11).
    const validated = await this.validateYctdFieldsOrThrow({
      mode: modeHint,
      headcount,
      hire_reason: payload.hire_reason,
      replace_employee_id: payload.replace_employee_id,
      out_of_plan_reason: payload.out_of_plan_reason,
      headcount_cell_id: payload.headcount_cell_id,
      companyIds: scope.companyIds,
      companyIdPersist: companyId,
      requireComplete: false,
    });
    // If mode set on create, still run in_plan cell gates via validate when mode=in_plan.
    if (modeHint === 'in_plan' || modeHint === 'out_of_plan') {
      // re-validate with same path — already done; for out_of_plan reason optional on draft
    } else if (
      payload.headcount_mode != null &&
      String(payload.headcount_mode).trim() !== ''
    ) {
      throw new ApiException(
        HRM_YCTD_MODE_REQUIRED,
        'headcount_mode phải là in_plan | out_of_plan',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hireNorm = normalizeHireReason(payload.hire_reason);
    if (
      payload.hire_reason != null &&
      String(payload.hire_reason).trim() !== '' &&
      !hireNorm
    ) {
      throw new ApiException(
        HRM_YCTD_VAL_400,
        'hire_reason không hợp lệ (new | replace)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (hireNorm === 'replace' && !(payload.replace_employee_id ?? '').trim()) {
      throw new ApiException(
        HRM_YCTD_VAL_400,
        'replace_employee_id bắt buộc khi hire_reason=replace',
        HttpStatus.BAD_REQUEST,
      );
    }

    // R-REC-02-TARGET-MONTH-DATE — coerce YYYY-MM → YYYY-MM-01 before ::date (VAL-400 ≠ SYS-500).
    const targetMonth = normalizeTargetMonthOrThrow(payload.target_month);

    const jobGradeKey = await this.resolveJobGradeKeyForWrite(
      authorization,
      companyId,
      payload.job_grade_key,
    );

    const tenantId = resolveHrmPersistTenantId(
      authorization,
      payload.company_id,
    );

    const id = randomUUID();
    try {
      const res = await this.db.query<JobRequisitionRow>(
        `INSERT INTO public.job_requisitions
          (id, tenant_id, company_id, title, department, employment_type, headcount, status,
           job_description, requirements, job_template_id,
           headcount_mode, headcount_cell_id, target_month, recruitment_plan_id,
           department_key, position_key, job_grade_key, hire_reason, replace_employee_id,
           out_of_plan_reason, pipeline_flags_json)
         VALUES ($1, $2::text, $3::text, $4, $5, $6, $7, 'draft',
                 $8, $9, $10,
                 $11, $12::uuid, $13::date, $14::uuid,
                 $15, $16, $17, $18, $19::uuid,
                 $20, $21::jsonb)
         RETURNING id, tenant_id, company_id, title, department, employment_type, headcount, status,
                   job_description, requirements, job_template_id,
                   headcount_mode, headcount_cell_id::text AS headcount_cell_id,
                   target_month::text AS target_month,
                   hire_reason, replace_employee_id::text AS replace_employee_id,
                   out_of_plan_reason, approval_matrix_key, pipeline_flags_json,
                   job_grade_key,
                   created_at, updated_at;`,
        [
          id,
          tenantId,
          companyId,
          payload.title.trim(),
          payload.department.trim(),
          payload.employment_type.trim(),
          headcount,
          snapshotDesc,
          snapshotReq,
          jd.id,
          validated.mode,
          validated.headcount_cell_id,
          targetMonth,
          validated.recruitment_plan_id ?? payload.recruitment_plan_id ?? null,
          payload.department_key?.trim() || null,
          payload.position_key?.trim() || null,
          jobGradeKey,
          hireNorm,
          hireNorm === 'replace' ? payload.replace_employee_id : null,
          validated.out_of_plan_reason ??
            (typeof payload.out_of_plan_reason === 'string'
              ? payload.out_of_plan_reason.trim() || null
              : null),
          JSON.stringify(EMPTY_PIPELINE_FLAGS),
        ],
      );
      // Thành công: draft + JD soft FK — FORBIDDEN status open/open_for_hire (Y-S7).
      return this.mapRequisitionDisplay({
        ...res.rows[0],
        jd_code: jd.code,
        jd_title: jd.title,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('uq_job_requisitions_spawn_cell') ||
        msg.includes('duplicate key')
      ) {
        throw new ApiException(
          HRM_YCTD_SPAWN_DUP,
          'Ô này đã có YCTD trong ĐB — không tạo trùng (spawn UQ)',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  private pushRequisitionCompanyFilter(
    filters: string[],
    values: unknown[],
    companyIdsOrScope:
      | string[]
      | import('../common/hrm-list-scope').HrmListScope,
    alias = 'r',
  ): void {
    if (!Array.isArray(companyIdsOrScope)) {
      pushHrmTableScopeFilters(filters, values, companyIdsOrScope, {
        tableAlias: alias,
      });
      return;
    }
    const companyIds = companyIdsOrScope;
    if (companyIds.length === 1) {
      values.push(companyIds[0]);
      filters.push(`${alias}.company_id = $${values.length}::text`);
      return;
    }
    values.push(companyIds);
    filters.push(`${alias}.company_id = ANY($${values.length}::text[])`);
  }

  /**
   * F-REC-CMP-02 — map pool/eval neo ids → Lane A spine on one YCTD.
   * Scope via job_requisitions (parity listApplicationsByYctd).
   */
  private async resolveCompareSpineCandidateIdsForYctd(
    requisitionId: string,
    rawIds: string[],
    scope: import('../common/hrm-list-scope').HrmListScope,
  ): Promise<string[]> {
    if (rawIds.length === 0) return [];
    const filters: string[] = [];
    const values: unknown[] = [rawIds, requisitionId];
    this.pushRequisitionCompanyFilter(filters, values, scope, 'r');
    const scopeClause =
      filters.length > 0 ? ` AND ${filters.join(' AND ')}` : '';
    const mapRes = await this.db.query<{
      requested_id: string;
      spine_id: string | null;
    }>(
      `WITH requested AS (
         SELECT id::uuid AS requested_id, ord
         FROM unnest($1::uuid[]) WITH ORDINALITY AS t(id, ord)
       )
       SELECT req.requested_id::text AS requested_id,
              COALESCE(c_direct.id, c_eval.id)::text AS spine_id
       FROM requested req
       INNER JOIN public.job_requisitions r ON r.id = $2::uuid${scopeClause}
       LEFT JOIN public.recruitment_candidates c_direct
         ON c_direct.id = req.requested_id AND c_direct.requisition_id = r.id
       LEFT JOIN public.candidate_evaluations e
         ON e.candidate_id = req.requested_id
         OR e.recruitment_candidate_id = req.requested_id
         OR e.application_id = req.requested_id
       LEFT JOIN public.recruitment_candidates c_eval
         ON c_eval.id = COALESCE(e.recruitment_candidate_id, e.application_id)
         AND c_eval.requisition_id = r.id
       ORDER BY req.ord ASC;`,
      values,
    );
    const spineByRequested = new Map(
      mapRes.rows.map((row) => [row.requested_id, row.spine_id]),
    );
    const resolved: string[] = [];
    const mixRows: Array<{ id: string; requisition_id: string }> = [];
    for (const requestedId of rawIds) {
      const spineId = spineByRequested.get(requestedId);
      if (!spineId) continue;
      resolved.push(spineId);
      mixRows.push({ id: spineId, requisition_id: requisitionId });
    }
    assertCompareSameYctdOrThrow(requisitionId, mixRows, rawIds);
    return resolved;
  }

  async listJobRequisitions(
    query: ListJobRequisitionsQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const page = this.resolvePage(query.page, 1);
    const pageSize = this.resolvePageSize(
      query.page_size ?? query.pageSize,
      20,
    );
    const offset = (page - 1) * pageSize;
    const filters: string[] = [];
    const values: unknown[] = [];
    this.pushRequisitionCompanyFilter(filters, values, scope, 'r');
    // F-REC-UV-YCTD-01 — receivable picker (AS-IS open); empty → 200 [] (not 404).
    if (isUvReceivableListQuery(query)) {
      filters.push(`lower(r.status) IN ('open', 'approved', 'open_for_hire')`);
    }
    const q = query.q?.trim();
    if (q) {
      values.push(`%${q.toLowerCase()}%`);
      filters.push(
        `(lower(r.title) LIKE $${values.length} OR lower(COALESCE(t.code, '')) LIKE $${values.length} OR lower(COALESCE(t.position_name, '')) LIKE $${values.length})`,
      );
    }
    const whereClause = filters.length ? filters.join(' AND ') : 'TRUE';
    const countRes = await this.db.query<{ total: string }>(
      `SELECT COUNT(DISTINCT r.id)::text AS total
       FROM public.job_requisitions r
       LEFT JOIN public.job_description_templates t ON t.id::text = r.job_template_id
       WHERE ${whereClause};`,
      values,
    );
    const res = await this.db.query<JobRequisitionRow>(
      `${this.requisitionSelectSql()}
       WHERE ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2};`,
      [...values, pageSize, offset],
    );
    // Defense: one physical YCTD id → one picker row (join must not multiply).
    const seenIds = new Set<string>();
    const data = res.rows
      .filter((row) => {
        const id = String(row.id);
        if (seenIds.has(id)) return false;
        seenIds.add(id);
        return true;
      })
      .map((row) => this.mapRequisitionDisplay(row));
    const receivableMode = isUvReceivableListQuery(query);
    return {
      total: Number(countRes.rows[0]?.total ?? 0),
      page,
      page_size: pageSize,
      data,
      items: receivableMode
        ? data.map((row) =>
            toReceivableListItem(row as Record<string, unknown>),
          )
        : data,
    };
  }

  async getJobRequisitionById(
    requisitionId: string,
    query: GetJobRequisitionQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const filters: string[] = ['r.id = $1::uuid'];
    const values: unknown[] = [requisitionId];
    this.pushRequisitionCompanyFilter(filters, values, scope, 'r');
    const res = await this.db.query<JobRequisitionRow>(
      `${this.requisitionSelectSql()}
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    if (!res.rows[0]) {
      if (isUvYctdBindTargetQuery(query)) {
        throw new ApiException(
          HRM_REC_UV_YCTD_NOT_FOUND,
          'YCTD (job requisition) not found in scope',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new ApiException(
        'HRM-REC-404',
        'Job requisition not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const mapped = this.mapRequisitionDisplay(res.rows[0]);
    // F-REC-UV-YCTD-02 — bind-target STATUS gate.
    if (isUvYctdBindTargetQuery(query)) {
      assertUvYctdReceivableOrThrow(this.toReceivableRow(res.rows[0]));
      const position = toUvPositionDisplay(this.toReceivableRow(res.rows[0]));
      return {
        ...mapped,
        ...position,
        uv_position: position,
      };
    }
    return mapped;
  }

  async updateJobRequisition(
    requisitionId: string,
    payload: UpdateJobRequisitionDto,
    query: GetJobRequisitionQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const peek = await this.db.query<{
      company_id: string;
      status: string;
      workflow_instance_id: string | null;
      job_template_id: string | null;
      job_description: string | null;
      requirements: string | null;
      headcount: number;
      headcount_mode: string | null;
      headcount_cell_id: string | null;
      hire_reason: string | null;
      replace_employee_id: string | null;
      out_of_plan_reason: string | null;
    }>(
      `SELECT company_id::text AS company_id, status,
              workflow_instance_id::text AS workflow_instance_id,
              job_template_id, job_description, requirements, headcount,
              headcount_mode, headcount_cell_id::text AS headcount_cell_id,
              hire_reason, replace_employee_id::text AS replace_employee_id,
              out_of_plan_reason
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
    if (
      nextHeadcount !== null &&
      (!Number.isFinite(nextHeadcount) || nextHeadcount < 1)
    ) {
      throw new ApiException(
        'HRM-REC-400',
        'Requisition headcount must be an integer greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }
    const headcountForValidate =
      nextHeadcount ?? Math.trunc(Number(peek.rows[0].headcount ?? 1));
    if (!Number.isFinite(headcountForValidate) || headcountForValidate < 1) {
      // Peek missing headcount (legacy mock) — treat as 1 for gate only.
    }
    const effectiveHeadcount =
      Number.isFinite(headcountForValidate) && headcountForValidate >= 1
        ? headcountForValidate
        : 1;

    // FORBIDDEN: client patch status to receivable to skip WF/BOD (API-01 §5.5.2).
    if (payload.status !== undefined) {
      const want = String(payload.status).trim().toLowerCase();
      const prior = String(peek.rows[0].status ?? '')
        .trim()
        .toLowerCase();
      if ((want === 'open_for_hire' || want === 'open') && want !== prior) {
        throw new ApiException(
          HRM_YCTD_NOT_RECEIVABLE,
          'Không được PATCH status sang open_for_hire/open — dùng POST …/transitions sau duyệt',
          HttpStatus.CONFLICT,
        );
      }
    }

    // O4: legacy NULL mode — classify when client sends mode/cell/hire/out;
    // notes/status/JD patches remain allowed (CV/flags still blocked until classified).
    const modeIncoming =
      payload.headcount_mode !== undefined
        ? normalizeHeadcountMode(payload.headcount_mode)
        : normalizeHeadcountMode(peek.rows[0].headcount_mode);
    if (isLegacyUnclassifiedMode(peek.rows[0].headcount_mode)) {
      const classifyTouch =
        payload.headcount_mode !== undefined ||
        payload.headcount_cell_id !== undefined ||
        payload.hire_reason !== undefined ||
        payload.out_of_plan_reason !== undefined ||
        payload.replace_employee_id !== undefined;
      if (classifyTouch && !modeIncoming) {
        throw new ApiException(
          HRM_YCTD_MODE_REQUIRED,
          'YCTD legacy chưa phân loại — bắt buộc chọn headcount_mode trước khi lưu',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const cellIdIncoming =
      payload.headcount_cell_id !== undefined
        ? payload.headcount_cell_id
        : peek.rows[0].headcount_cell_id;
    const hireIncoming =
      payload.hire_reason !== undefined
        ? payload.hire_reason
        : peek.rows[0].hire_reason;
    const replaceIncoming =
      payload.replace_employee_id !== undefined
        ? payload.replace_employee_id
        : peek.rows[0].replace_employee_id;
    const outIncoming =
      payload.out_of_plan_reason !== undefined
        ? payload.out_of_plan_reason
        : peek.rows[0].out_of_plan_reason;

    let validatedMode = modeIncoming;
    let validatedCell: string | null = cellIdIncoming ?? null;
    let validatedHire: string | null = normalizeHireReason(hireIncoming);
    let validatedReplace: string | null =
      (replaceIncoming ?? '').trim() || null;
    let validatedOut: string | null =
      typeof outIncoming === 'string' ? outIncoming.trim() || null : null;

    if (modeIncoming === 'in_plan' || modeIncoming === 'out_of_plan') {
      const v = await this.validateYctdFieldsOrThrow({
        mode: modeIncoming,
        headcount: effectiveHeadcount,
        hire_reason: hireIncoming,
        replace_employee_id: replaceIncoming,
        out_of_plan_reason: outIncoming,
        headcount_cell_id: cellIdIncoming,
        companyIds: scope.companyIds,
        companyIdPersist: peek.rows[0].company_id,
        requireComplete: false,
        excludeRequisitionId: requisitionId,
      });
      validatedMode = v.mode;
      validatedCell = v.headcount_cell_id;
      validatedHire = v.hire_reason ?? validatedHire;
      validatedReplace = v.replace_employee_id;
      validatedOut = v.out_of_plan_reason ?? validatedOut;
      if (
        modeIncoming === 'out_of_plan' &&
        payload.out_of_plan_reason !== undefined
      ) {
        validatedOut =
          typeof payload.out_of_plan_reason === 'string'
            ? payload.out_of_plan_reason.trim() || null
            : null;
      }
    }

    // F-YCTD-JD-04 — optional re-bind soft FK (Hiệu lực only); approved+ → 409.
    let nextTemplateId: string | null | undefined;
    let nextDesc: string | null | undefined;
    let nextReq: string | null | undefined;
    let jdMeta: YctdJdTemplateBindRow | null = null;
    const aliasPresent =
      payload.job_template_id !== undefined ||
      payload.job_description_id !== undefined;
    if (aliasPresent) {
      assertYctdJdRebindAllowed(peek.rows[0]?.status);
      const resolved = resolveYctdJdTemplateId(payload);
      if (!resolved) {
        // Clear only when BR does not require — GĐ1 still requires JD → REQUIRED.
        requireYctdJdTemplateId(payload);
      }
      jdMeta = await this.resolveYctdBindTemplate(
        resolved as string,
        query.company_id ?? peek.rows[0].company_id,
        authorization,
      );
      nextTemplateId = jdMeta.id;
      nextDesc =
        payload.job_description?.trim() ||
        (jdMeta.job_description ?? '').trim() ||
        peek.rows[0]?.job_description ||
        null;
      nextReq =
        payload.requirements?.trim() ||
        (jdMeta.requirements ?? '').trim() ||
        peek.rows[0]?.requirements ||
        null;
    } else {
      if (payload.job_description !== undefined) {
        nextDesc = payload.job_description?.trim() || null;
      }
      if (payload.requirements !== undefined) {
        nextReq = payload.requirements?.trim() || null;
      }
    }

    const nextStatus = payload.status ?? peek.rows[0].status;
    const targetMonthTouched = payload.target_month !== undefined;
    const targetMonthNorm = targetMonthTouched
      ? normalizeTargetMonthOrThrow(payload.target_month)
      : null;

    let jobGradeTouch = 0;
    let jobGradeVal: string | null = null;
    if (payload.job_grade_key !== undefined) {
      jobGradeTouch = 1;
      jobGradeVal = await this.resolveJobGradeKeyForWrite(
        authorization,
        peek.rows[0].company_id,
        payload.job_grade_key,
      );
    }

    const values: unknown[] = [
      nextStatus,
      nextHeadcount,
      nextTemplateId === undefined ? null : nextTemplateId,
      nextTemplateId === undefined ? 0 : 1,
      nextDesc === undefined ? null : nextDesc,
      nextDesc === undefined ? 0 : 1,
      nextReq === undefined ? null : nextReq,
      nextReq === undefined ? 0 : 1,
      validatedMode,
      validatedCell,
      validatedHire,
      validatedReplace,
      validatedOut,
      targetMonthNorm,
      targetMonthTouched ? 1 : 0,
      jobGradeTouch,
      jobGradeVal,
      requisitionId,
    ];
    const filters: string[] = ['id = $18::uuid'];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query<JobRequisitionRow>(
      `UPDATE public.job_requisitions
       SET status = $1,
           headcount = COALESCE($2, headcount),
           job_template_id = CASE WHEN $4::int = 1 THEN $3 ELSE job_template_id END,
           job_description = CASE WHEN $6::int = 1 THEN $5 ELSE job_description END,
           requirements = CASE WHEN $8::int = 1 THEN $7 ELSE requirements END,
           headcount_mode = COALESCE($9, headcount_mode),
           headcount_cell_id = CASE
             WHEN $9 = 'out_of_plan' THEN NULL
             WHEN $10::text IS NOT NULL THEN $10::uuid
             ELSE headcount_cell_id
           END,
           hire_reason = COALESCE($11, hire_reason),
           replace_employee_id = CASE
             WHEN $11 = 'replace' THEN $12::uuid
             WHEN $11 = 'new' THEN NULL
             ELSE replace_employee_id
           END,
           out_of_plan_reason = CASE
             WHEN $9 = 'out_of_plan' THEN COALESCE($13, out_of_plan_reason)
             WHEN $9 = 'in_plan' THEN NULL
             ELSE COALESCE($13, out_of_plan_reason)
           END,
           target_month = CASE WHEN $15::int = 1 THEN $14::date ELSE target_month END,
           job_grade_key = CASE WHEN $16::int = 1 THEN $17 ELSE job_grade_key END,
           updated_at = NOW()
       WHERE ${filters.join(' AND ')}
       RETURNING id, company_id, title, department, employment_type, headcount, status,
                 job_description, requirements, job_template_id,
                 workflow_instance_id::text AS workflow_instance_id,
                 headcount_mode, headcount_cell_id::text AS headcount_cell_id,
                 target_month::text AS target_month,
                 hire_reason, replace_employee_id::text AS replace_employee_id,
                 out_of_plan_reason, approval_matrix_key, pipeline_flags_json,
                 job_grade_key,
                 created_at, updated_at;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-REC-404',
        'Job requisition not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (jdMeta) {
      return this.mapRequisitionDisplay({
        ...res.rows[0],
        jd_code: jdMeta.code,
        jd_title: jdMeta.title,
      });
    }
    // Status/headcount-only patch — display-ready jd_* filled on next list/get join.
    return this.mapRequisitionDisplay(res.rows[0]);
  }

  /**
   * UC-HRM-REC-WF-02 · F-REC-YCTD-01/02 submit — pending_approval + matrix snapshot + XBOS conditions.
   * UF-HRM-12: create without submit stays draft/unlocked (no auto WF).
   */
  async submitJobRequisitionForApproval(
    requisitionId: string,
    query: GetJobRequisitionQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    options?: {
      submitterUserId?: string;
      tenantId?: string;
      companySlug?: string;
    },
  ) {
    await this.ensureSchema();
    const existing = await this.getJobRequisitionById(
      requisitionId,
      query,
      authorization,
      scopeContext,
    );
    if (existing.workflow_instance_id) {
      return {
        ...existing,
        spawn: {
          workflowInstanceId: existing.workflow_instance_id,
          idempotent: true,
        },
      };
    }
    const scope = resolveHrmListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const companyIdPersist = String(
      existing.company_id ?? query.company_id ?? '',
    );
    const headcount = Math.trunc(Number(existing.headcount));
    const validated = await this.validateYctdFieldsOrThrow({
      mode: normalizeHeadcountMode(existing.headcount_mode),
      headcount,
      hire_reason: existing.hire_reason,
      replace_employee_id: existing.replace_employee_id,
      out_of_plan_reason: existing.out_of_plan_reason,
      headcount_cell_id: existing.headcount_cell_id,
      companyIds: scope.companyIds,
      companyIdPersist,
      requireComplete: true,
      excludeRequisitionId: requisitionId,
    });
    const mode = validated.mode as YctdHeadcountMode;
    const matrixKey = resolveApprovalMatrixKey(mode);
    assertMatrixMatchesModeOrThrow(mode, matrixKey);

    await this.db.query(
      `UPDATE public.job_requisitions
       SET hire_reason = $2,
           replace_employee_id = $3::uuid,
           out_of_plan_reason = $4,
           headcount_mode = $5,
           headcount_cell_id = $6::uuid,
           approval_matrix_key = $7,
           updated_at = NOW()
       WHERE id = $1::uuid`,
      [
        requisitionId,
        validated.hire_reason,
        validated.replace_employee_id,
        validated.out_of_plan_reason,
        mode,
        validated.headcount_cell_id,
        matrixKey,
      ],
    );

    const requisitionCompanyId = companyIdPersist;
    const spawn =
      await this.recruitmentWorkflowBridge.startRecruitmentWorkflowIfConfigured(
        {
          businessType: WF_BUSINESS_TYPE_HRM_REQUISITION,
          businessId: requisitionId,
          companyId: requisitionCompanyId,
          submitterUserId: options?.submitterUserId,
          tenantId: options?.tenantId,
          companySlug: options?.companySlug ?? requisitionCompanyId,
          conditions: {
            headcount_mode: mode,
            hire_reason: String(validated.hire_reason ?? ''),
          },
          approvalMatrixKey: matrixKey,
        },
      );
    const refreshed = await this.getJobRequisitionById(
      requisitionId,
      query,
      authorization,
      scopeContext,
    );
    return {
      ...refreshed,
      approval_matrix_key: matrixKey,
      requires_bod: mode === 'out_of_plan' ? true : undefined,
      spawn,
      spawnMissing: !spawn?.workflowInstanceId,
    };
  }

  /**
   * F-REC-YCTD-03 — thin transitions (approve → open_for_hire / reject).
   * Primary path remains XBOS callback; this is secondary for FE/UAT without inventing Campaign.
   */
  async transitionJobRequisition(
    requisitionId: string,
    payload: RequisitionTransitionDto,
    query: GetJobRequisitionQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    options?: { actorId?: string },
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const peek = await this.db.query<JobRequisitionRow>(
      `SELECT id, company_id::text AS company_id, status, headcount_mode,
              hire_reason, out_of_plan_reason, pipeline_flags_json,
              workflow_instance_id::text AS workflow_instance_id
       FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1`,
      [requisitionId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-REC-404',
      mismatchCode: 'HRM-REC-409',
    });
    const row = peek.rows[0];
    if (isLegacyUnclassifiedMode(row.headcount_mode)) {
      throw new ApiException(
        HRM_YCTD_MODE_REQUIRED,
        'Không thể duyệt receivable khi headcount_mode chưa phân loại (O4)',
        HttpStatus.BAD_REQUEST,
      );
    }
    const mode = requireModeOrThrow(row.headcount_mode);
    const status = String(row.status ?? '')
      .trim()
      .toLowerCase();

    if (payload.action === 'reject') {
      // No rejected_by column (DATA-01) — do NOT bind unused actorId as $2 (PG type error).
      // Approve path still binds actorId → approved_by via $2; reject only persists rejected_reason.
      const reason = requireRejectedReasonOrThrow(
        payload.rejected_reason ?? payload.comment,
      );
      const filters: string[] = ['id = $2::uuid'];
      const values: unknown[] = [reason, requisitionId];
      pushCompanyIdFilter(filters, values, scope);
      const res = await this.db.query<JobRequisitionRow>(
        `UPDATE public.job_requisitions
         SET status = 'rejected',
             rejected_reason = $1,
             updated_at = NOW()
         WHERE ${filters.join(' AND ')}
         RETURNING id, company_id, title, department, employment_type, headcount, status,
                   job_description, requirements, job_template_id,
                   headcount_mode, headcount_cell_id::text AS headcount_cell_id,
                   hire_reason, replace_employee_id::text AS replace_employee_id,
                   out_of_plan_reason, approval_matrix_key, pipeline_flags_json,
                   rejected_reason, created_at, updated_at`,
        values,
      );
      if (!res.rows[0]) {
        throw new ApiException(
          'HRM-REC-404',
          'Job requisition not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return this.mapRequisitionDisplay(res.rows[0]);
    }

    // approve
    const bodComplete = payload.bod_complete === true;
    let nextStatus: string;
    let unlockFlags = false;
    if (mode === 'in_plan') {
      if (status !== 'pending_approval' && status !== 'approved') {
        throw new ApiException(
          HRM_YCTD_NOT_RECEIVABLE,
          'Chỉ YCTD chờ duyệt/đã duyệt mới chuyển sang open_for_hire',
          HttpStatus.CONFLICT,
        );
      }
      nextStatus = 'open_for_hire';
      unlockFlags = true;
    } else {
      // out_of_plan — BOD gate (Y-S9)
      if (status === 'pending_approval' && !bodComplete) {
        nextStatus = 'approved';
        unlockFlags = false;
      } else if (
        (status === 'pending_approval' || status === 'approved') &&
        bodComplete
      ) {
        nextStatus = 'open_for_hire';
        unlockFlags = true;
      } else if (status === 'approved' && !bodComplete) {
        throw new ApiException(
          HRM_YCTD_BOD_REQUIRED,
          'YCTD ngoài ĐB cần BOD duyệt (bod_complete=true) trước khi open_for_hire',
          HttpStatus.CONFLICT,
        );
      } else {
        throw new ApiException(
          HRM_YCTD_NOT_RECEIVABLE,
          'Trạng thái hiện tại không cho phép approve transition',
          HttpStatus.CONFLICT,
        );
      }
    }

    const flags = parsePipelineFlags(row.pipeline_flags_json);
    if (unlockFlags) {
      flags.cv_intake_allowed = true;
    }
    const filters: string[] = ['id = $4::uuid'];
    const values: unknown[] = [
      nextStatus,
      options?.actorId ?? null,
      JSON.stringify(flags),
      requisitionId,
    ];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query<JobRequisitionRow>(
      `UPDATE public.job_requisitions
       SET status = $1,
           approved_at = CASE WHEN $1 = 'open_for_hire' THEN NOW() ELSE approved_at END,
           approved_by = CASE WHEN $1 IN ('open_for_hire', 'approved') THEN COALESCE($2, approved_by) ELSE approved_by END,
           pipeline_flags_json = $3::jsonb,
           updated_at = NOW()
       WHERE ${filters.join(' AND ')}
       RETURNING id, company_id, title, department, employment_type, headcount, status,
                 job_description, requirements, job_template_id,
                 headcount_mode, headcount_cell_id::text AS headcount_cell_id,
                 hire_reason, replace_employee_id::text AS replace_employee_id,
                 out_of_plan_reason, approval_matrix_key, pipeline_flags_json,
                 approved_at::text AS approved_at, approved_by,
                 created_at, updated_at`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-REC-404',
        'Job requisition not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapRequisitionDisplay(res.rows[0]);
  }

  /**
   * F-REC-YCTD-04 — PATCH pipeline flags on YCTD (REC-03 Campaign DENY).
   * UPGRADE REC-04: accept internal_scan_* + gate posted → HRM-REC-CV-SCAN-REQUIRED.
   */
  async patchRequisitionPipelineFlags(
    requisitionId: string,
    payload: PatchRequisitionPipelineFlagsDto,
    query: GetJobRequisitionQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const peek = await this.db.query<JobRequisitionRow>(
      `SELECT id, company_id::text AS company_id, status, headcount_mode, pipeline_flags_json
       FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1`,
      [requisitionId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-REC-404',
      mismatchCode: 'HRM-REC-409',
    });
    const row = peek.rows[0];
    const status = String(row.status ?? '')
      .trim()
      .toLowerCase();
    if (status === 'rejected' || status === 'cancelled') {
      throw new ApiException(
        HRM_YCTD_NOT_RECEIVABLE,
        'YCTD đã từ chối/huỷ — không cập nhật pipeline flags',
        HttpStatus.CONFLICT,
      );
    }
    if (payload.internal_scan_skipped === true) {
      assertInternalScanSkipActorOrThrow(authorization);
      requireInternalScanSkipReasonOrThrow(payload.internal_scan_skip_reason);
    }
    if (pipelineRequiresReceivableGate(payload)) {
      if (
        payload.internal_scan_done === true ||
        payload.internal_scan_skipped === true
      ) {
        assertYctdOpenForInternalScanOrThrow(row);
      } else {
        assertYctdReceivableForMutateOrThrow(row);
      }
    }
    const nowIso = new Date().toISOString();
    const merged = mergePipelineFlags(
      parsePipelineFlags(row.pipeline_flags_json),
      payload,
      nowIso,
    );
    if (payload.posted === true) {
      assertPostedAllowedOrThrow(merged);
    }
    const filters: string[] = ['id = $2::uuid'];
    const values: unknown[] = [JSON.stringify(merged), requisitionId];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query<JobRequisitionRow>(
      `UPDATE public.job_requisitions
       SET pipeline_flags_json = $1::jsonb, updated_at = NOW()
       WHERE ${filters.join(' AND ')}
       RETURNING id, company_id, title, department, employment_type, headcount, status,
                 job_description, requirements, job_template_id,
                 headcount_mode, headcount_cell_id::text AS headcount_cell_id,
                 hire_reason, replace_employee_id::text AS replace_employee_id,
                 out_of_plan_reason, approval_matrix_key, pipeline_flags_json,
                 created_at, updated_at`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-REC-404',
        'Job requisition not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapRequisitionDisplay(res.rows[0]);
  }

  /**
   * F-REC-CV-SCAN-02/03 — POST …/requisitions/:id/internal-scan (complete|skip).
   * Writes same pipeline_flags_json keys only — DENY scan-event sole SoT.
   */
  async postRequisitionInternalScan(
    requisitionId: string,
    payload: InternalScanDto,
    query: GetJobRequisitionQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const peek = await this.db.query<JobRequisitionRow>(
      `SELECT id, company_id::text AS company_id, status, headcount_mode, pipeline_flags_json
       FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1`,
      [requisitionId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-REC-404',
      mismatchCode: 'HRM-REC-409',
    });
    const row = peek.rows[0];
    assertYctdOpenForInternalScanOrThrow(row);
    const action = (payload.action ?? 'complete').trim().toLowerCase();
    const nowIso = new Date().toISOString();
    const current = parsePipelineFlags(row.pipeline_flags_json);
    let merged = current;
    if (action === 'skip') {
      assertInternalScanSkipActorOrThrow(authorization);
      const reason = requireInternalScanSkipReasonOrThrow(payload.skip_reason);
      merged = applyInternalScanSkip(current, reason, nowIso);
    } else if (action === 'complete') {
      merged = applyInternalScanComplete(current, nowIso);
    } else {
      throw new ApiException(
        'HRM-REC-400',
        'action phải là complete | skip',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Optional UX audit fields — stored under reserved keys without wiping RETAIN family.
    const jsonPayload: Record<string, unknown> = { ...merged };
    if (payload.hit_count !== undefined) {
      jsonPayload.internal_scan_hit_count = payload.hit_count;
    }
    if (
      payload.criteria_snapshot &&
      typeof payload.criteria_snapshot === 'object'
    ) {
      jsonPayload.internal_scan_criteria_snapshot = payload.criteria_snapshot;
    }
    const filters: string[] = ['id = $2::uuid'];
    const values: unknown[] = [JSON.stringify(jsonPayload), requisitionId];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query<JobRequisitionRow>(
      `UPDATE public.job_requisitions
       SET pipeline_flags_json = $1::jsonb, updated_at = NOW()
       WHERE ${filters.join(' AND ')}
       RETURNING id, company_id, title, department, employment_type, headcount, status,
                 job_description, requirements, job_template_id,
                 headcount_mode, headcount_cell_id::text AS headcount_cell_id,
                 hire_reason, replace_employee_id::text AS replace_employee_id,
                 out_of_plan_reason, approval_matrix_key, pipeline_flags_json,
                 created_at, updated_at`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-REC-404',
        'Job requisition not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapRequisitionDisplay(res.rows[0]);
  }

  /**
   * @CODE-MEMORY method · Lane A FR-HRM-RC-03 SoT — recruitment_candidates
   * Entry: POST /candidates + body.requisition_id → HRM-REC-202 (dual-route §17.6.1)
   * must_keep §17.6.4 — không ghi public.candidates · không FK cross-lane
   *
   * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-BE-01
   * F-REC-UV-YCTD-03: REQUIRED/STATUS/NOT-FOUND/MISMATCH · alias · position derive · no job_postings.
   */
  async createCandidate(
    payload: CreateCandidateDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      payload.company_id,
      scopeContext,
    );
    const requisitionId = requireUvYctdRequisitionId(payload);
    const reqFilters: string[] = ['r.id = $1::uuid'];
    const reqValues: unknown[] = [requisitionId];
    this.pushRequisitionCompanyFilter(reqFilters, reqValues, scope, 'r');
    const reqRes = await this.db.query<JobRequisitionRow>(
      `${this.requisitionSelectSql()}
       WHERE ${reqFilters.join(' AND ')}
       LIMIT 1;`,
      reqValues,
    );
    const yctd = assertUvYctdReceivableOrThrow(
      reqRes.rows[0] ? this.toReceivableRow(reqRes.rows[0]) : null,
    );
    // Free-text position is never SoT — ignore persist; optional position_key must match.
    const position = assertUvPositionKeyMatchesOrThrow(
      yctd,
      payload.position_key,
    );
    const tenantId = resolveHrmPersistTenantId(
      authorization,
      payload.company_id,
      scopeContext,
    );
    const res = await this.db.query<CandidateRow>(
      `INSERT INTO public.recruitment_candidates
        (id, tenant_id, company_id, requisition_id, full_name, email, source, status)
       VALUES ($1, $2::text, $3::text, $4::uuid, $5, $6, $7, 'new')
       RETURNING id, company_id, requisition_id, full_name, email, source, status, created_at, updated_at;`,
      [
        randomUUID(),
        tenantId,
        yctd.company_id,
        requisitionId,
        payload.full_name.trim(),
        payload.email?.toLowerCase().trim() ?? '',
        payload.source?.trim() ?? '',
      ],
    );
    const row = res.rows[0];
    return toCandidateUvDisplayReady(
      {
        ...row,
        candidate_id: row.id,
        application_id: row.id,
        stage: row.status,
        yctd_title: yctd.title,
      },
      position,
    );
  }

  async listCandidates(
    query: ListCandidatesQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    await materializeMissingSpineCandidatesFromPool(this.db, scope.companyIds);
    const page = this.resolvePage(query.page, 1);
    const pageSize = this.resolvePageSize(query.page_size, 20);
    const offset = (page - 1) * pageSize;
    const filters: string[] = [];
    const values: unknown[] = [];
    this.pushRequisitionCompanyFilter(filters, values, scope, 'c');
    const reqId = resolveUvYctdRequisitionId(query);
    if (reqId) {
      values.push(reqId);
      filters.push(`c.requisition_id = $${values.length}::uuid`);
    }
    const whereClause = filters.length ? filters.join(' AND ') : 'TRUE';
    const countRes = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.recruitment_candidates c WHERE ${whereClause};`,
      values,
    );
    const res = await this.db.query<
      CandidateListRow & {
        yctd_title: string | null;
        position_code: string | null;
        position_name: string | null;
        employee_id: string | null;
      }
    >(
      `SELECT c.id, c.company_id, c.requisition_id, c.full_name, c.email, c.source, c.status,
              c.employee_id::text AS employee_id,
              c.created_at, c.updated_at,
              r.title AS yctd_title,
              t.position_code AS position_code,
              t.position_name AS position_name,
              ai.id AS active_interview_id,
              ai.status AS active_interview_status,
              ai.scheduled_at AS active_interview_at
       FROM public.recruitment_candidates AS c
       LEFT JOIN public.job_requisitions r ON r.id = c.requisition_id
       LEFT JOIN public.job_description_templates t ON t.id::text = r.job_template_id
       LEFT JOIN LATERAL (
         SELECT id, status, scheduled_at
         FROM public.recruitment_interviews
         WHERE company_id = c.company_id
           AND candidate_id = c.id
           AND status IN ('scheduled', 'confirmed')
         ORDER BY scheduled_at DESC
         LIMIT 1
       ) ai ON TRUE
       WHERE ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2};`,
      [...values, pageSize, offset],
    );
    const data = res.rows.map((row) => {
      const position = toUvPositionDisplay({
        id: row.requisition_id,
        company_id: row.company_id,
        title: row.yctd_title ?? '',
        status: 'open',
        position_key: row.position_code,
        position_code: row.position_code,
        position_name: row.position_name,
      });
      const activeInterview = this.toActiveInterviewProjection(row);
      return {
        ...toCandidateUvDisplayReady(
          {
            id: row.id,
            company_id: row.company_id,
            requisition_id: row.requisition_id,
            full_name: row.full_name,
            email: row.email,
            source: row.source,
            status: row.status,
            employee_id: row.employee_id ?? null,
            created_at: row.created_at,
            updated_at: row.updated_at,
            yctd_title: row.yctd_title,
          },
          position,
        ),
        /** Flat id for FE getActiveInterviewId fallback (nested remains SoT). */
        active_interview_id: activeInterview.active_interview_id,
        active_interview: activeInterview,
      };
    });
    return {
      total: Number(countRes.rows[0]?.total ?? 0),
      page,
      page_size: pageSize,
      data,
    };
  }

  /**
   * @CODE-MEMORY method · Lane A GET candidates/:id — FR-HRM-RC-03 scope_parity với listCandidates
   * HTTP: GET …/candidates/:candidateId · table public.recruitment_candidates only (F1–F10)
   * ADR: group CEO main → company_id = ANY(GROUP_MEMBER_SLUGS) — không đọc public.candidates
   *
   * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-BE-01
   * F-REC-UV-YCTD-05 display-ready YCTD + position derived (scope_parity list↔get).
   *
   * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-02
   * F-REC-IV-04: LATERAL ACTIVE + toActiveInterviewProjection incl. active_interview_id
   * (list↔get parity for Manage PATCH id).
   *
   * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-02
   * Soft hire stamp employee_id display-ready (list↔get parity · R-REC-07-SOFT-LINK-PROJECTION).
   */
  async getCandidateById(
    candidateId: string,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId, scopeContext);
    const filters: string[] = ['c.id = $1::uuid'];
    const values: unknown[] = [candidateId];
    this.pushRequisitionCompanyFilter(filters, values, scope, 'c');
    const res = await this.db.query<
      CandidateListRow & {
        yctd_title: string | null;
        position_code: string | null;
        position_name: string | null;
        employee_id: string | null;
      }
    >(
      `SELECT c.id, c.company_id, c.requisition_id, c.full_name, c.email, c.source, c.status,
              c.employee_id::text AS employee_id,
              c.created_at, c.updated_at,
              r.title AS yctd_title,
              t.position_code AS position_code,
              t.position_name AS position_name,
              ai.id AS active_interview_id,
              ai.status AS active_interview_status,
              ai.scheduled_at AS active_interview_at
       FROM public.recruitment_candidates c
       LEFT JOIN public.job_requisitions r ON r.id = c.requisition_id
       LEFT JOIN public.job_description_templates t ON t.id::text = r.job_template_id
       LEFT JOIN LATERAL (
         SELECT id, status, scheduled_at
         FROM public.recruitment_interviews
         WHERE company_id = c.company_id
           AND candidate_id = c.id
           AND status IN ('scheduled', 'confirmed')
         ORDER BY scheduled_at DESC
         LIMIT 1
       ) ai ON TRUE
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-REC-404',
        'Candidate not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const row = res.rows[0];
    const position = toUvPositionDisplay({
      id: row.requisition_id,
      company_id: row.company_id,
      title: row.yctd_title ?? '',
      status: 'open',
      position_key: row.position_code,
      position_code: row.position_code,
      position_name: row.position_name,
    });
    const activeInterview = this.toActiveInterviewProjection(row);
    return {
      ...toCandidateUvDisplayReady(
        {
          id: row.id,
          company_id: row.company_id,
          requisition_id: row.requisition_id,
          full_name: row.full_name,
          email: row.email,
          source: row.source,
          status: row.status,
          employee_id: row.employee_id ?? null,
          created_at: row.created_at,
          updated_at: row.updated_at,
          yctd_title: row.yctd_title,
        },
        position,
      ),
      active_interview_id: activeInterview.active_interview_id,
      active_interview: activeInterview,
    };
  }

  /**
   * @CODE-MEMORY method · F-REC-APP-02 POST …/candidates/:id/transitions
   * WorkItem: PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01
   * SRS: FR-UC-BP-REC-05 Diễn biến #1 · BR-BP-CV-02 · VAL-REC-STG-03/08/09/24
   * Purpose: Atomic UPDATE Lane A status + INSERT rec_candidate_stage_history;
   *   EFF assert · reject note · reverse CFG · mint HRM-REC-STAGE-*.
   * must_keep: U19 scope_parity list=get=transition · DENY Nest /rec · pool/posting SoT
   */
  async transitionCandidateStage(
    candidateId: string,
    body: CandidateStageTransitionDto,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    opts?: { actorId?: string },
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId, scopeContext);
    const filters: string[] = ['c.id = $1::uuid'];
    const values: unknown[] = [candidateId];
    this.pushRequisitionCompanyFilter(filters, values, scope, 'c');
    const existingRes = await this.db.query<CandidateRow>(
      `SELECT c.id, c.company_id, c.requisition_id, c.full_name, c.email, c.source, c.status,
              c.created_at, c.updated_at
       FROM public.recruitment_candidates c
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    const existing = existingRes.rows[0];
    if (!existing) {
      throw new ApiException(
        'HRM-REC-404',
        'Candidate not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-404',
      mismatchCode: 'HRM-REC-409',
    });

    const toStage = (body.to_stage ?? '').trim().toLowerCase();
    if (!toStage) {
      throw new ApiException(
        HRM_REC_STAGE_UNKNOWN,
        'to_stage is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const fromStage = (existing.status ?? '').trim().toLowerCase() || null;

    // Same-key no-op — 2xx without new history (API-01 §4.1).
    if (fromStage === toStage) {
      return {
        id: existing.id,
        stage: existing.status,
        requisition_id: existing.requisition_id,
        company_id: existing.company_id,
        history_id: null,
        history: null,
      };
    }

    const stageCatalog = this.resolveRecPipelineStages();
    let toHit: RecPipelineStageDisplay | null = null;
    let fromHit: RecPipelineStageDisplay | null = null;
    if (stageCatalog) {
      const effective = await stageCatalog.listEffective(
        { company_id: existing.company_id },
        authorization,
        { tenantId: scopeContext?.tenantId },
      );
      if (effective.total === 0) {
        throw new ApiException(
          HRM_REC_STAGE_EMPTY_CATALOG,
          'Chưa có danh mục giai đoạn hiệu lực — vào Cài đặt pipeline',
          HttpStatus.BAD_REQUEST,
        );
      }
      toHit = effective.data.find((r) => r.stageKey === toStage) ?? null;
      if (!toHit) {
        throw new ApiException(
          HRM_REC_STAGE_UNKNOWN,
          `stage '${body.to_stage}' is not in effective pipeline catalog (free-text SoT forbidden)`,
          HttpStatus.BAD_REQUEST,
        );
      }
      fromHit = fromStage
        ? (effective.data.find((r) => r.stageKey === fromStage) ?? null)
        : null;
    }

    if (this.isRejectStageClass(toStage, toHit)) {
      const note = (body.note ?? '').trim();
      if (!note) {
        throw new ApiException(
          HRM_REC_STAGE_REJECT_REASON,
          'Nhập lý do từ chối khi chuyển sang giai đoạn từ chối',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const isReverse =
      body.is_reverse === true ||
      (fromHit != null &&
        toHit != null &&
        Number(toHit.sortOrder) < Number(fromHit.sortOrder));
    if (isReverse) {
      const allowReverse = await this.readInterviewCfgBoolean(
        existing.company_id,
        CFG_ALLOW_REVERSE_STAGE,
        true,
      );
      if (!allowReverse) {
        throw new ApiException(
          HRM_REC_STAGE_REVERSE_FORBIDDEN,
          'Không được đảo chiều giai đoạn theo chính sách pháp nhân',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const historyId = randomUUID();
    const noteValue = (body.note ?? '').trim() || null;
    const desiredSalary =
      typeof body.desired_salary === 'number' &&
      Number.isFinite(body.desired_salary)
        ? body.desired_salary
        : null;
    const changedBy = this.parseSoftUuid(opts?.actorId);

    try {
      const result = await this.db.withTransaction(async (query) => {
        const upd = await query<CandidateRow>(
          `UPDATE public.recruitment_candidates
           SET status = $2, updated_at = NOW()
           WHERE id = $1::uuid
           RETURNING id, company_id, requisition_id, full_name, email, source, status, created_at, updated_at;`,
          [candidateId, toStage],
        );
        const updated = upd.rows[0];
        if (!updated) {
          throw new ApiException(
            'HRM-REC-404',
            'Candidate not found',
            HttpStatus.NOT_FOUND,
          );
        }
        const hist = await query<{
          id: string;
          company_id: string;
          recruitment_candidate_id: string;
          application_id: string | null;
          from_stage: string | null;
          to_stage: string;
          note: string | null;
          desired_salary: string | number | null;
          changed_by: string | null;
          changed_at: string;
        }>(
          `INSERT INTO public.rec_candidate_stage_history
            (id, company_id, recruitment_candidate_id, application_id,
             from_stage, to_stage, note, desired_salary, changed_by, changed_at)
           VALUES ($1::uuid, $2::text, $3::uuid, NULL,
                   $4, $5, $6, $7, $8::uuid, NOW())
           RETURNING id, company_id, recruitment_candidate_id, application_id,
                     from_stage, to_stage, note, desired_salary, changed_by, changed_at;`,
          [
            historyId,
            updated.company_id,
            updated.id,
            fromStage,
            toStage,
            noteValue,
            desiredSalary,
            changedBy,
          ],
        );
        const historyRow = hist.rows[0];
        if (!historyRow) {
          throw new ApiException(
            HRM_REC_STAGE_HISTORY_FAIL,
            'Không lưu được lịch sử trạng thái — thử lại',
            HttpStatus.CONFLICT,
          );
        }
        return { updated, historyRow };
      });

      return {
        id: result.updated.id,
        stage: result.updated.status,
        requisition_id: result.updated.requisition_id,
        company_id: result.updated.company_id,
        history_id: result.historyRow.id,
        history: this.mapStageHistoryDisplay(result.historyRow),
      };
    } catch (err) {
      if (err instanceof ApiException) throw err;
      throw new ApiException(
        HRM_REC_STAGE_HISTORY_FAIL,
        'Không lưu được lịch sử trạng thái — thử lại',
        HttpStatus.CONFLICT,
        { cause: err instanceof Error ? err.message : String(err) },
      );
    }
  }

  /**
   * @CODE-MEMORY method · F-REC-APP-02-TL GET …/candidates/:id/stage-history
   * WorkItem: PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01
   * SRS: FR-UC-BP-REC-05 Diễn biến #2 · AC-REC-05-03/08 · VAL-REC-STG-06/07/17
   * Purpose: Display-ready append-only timeline; empty [] = 200; same scope as get-by-id.
   * must_keep: no DELETE/UPDATE history · retired keys allowed · U19
   * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-02
   * FIX resolveHrmListScope(query.company_id ?? '') — TS2345 optional→string
   */
  async listCandidateStageHistory(
    candidateId: string,
    query: ListCandidateStageHistoryQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    // BE-02: optional query.company_id → string for resolveHrmListScope (TS2345); controller may fill from X-Company-Id
    const scope = resolveHrmListScope(
      authorization,
      query.company_id ?? '',
      scopeContext,
    );
    const candFilters: string[] = ['c.id = $1::uuid'];
    const candValues: unknown[] = [candidateId];
    this.pushRequisitionCompanyFilter(candFilters, candValues, scope, 'c');
    const candRes = await this.db.query<CandidateRow>(
      `SELECT c.id, c.company_id, c.requisition_id, c.full_name, c.email, c.source, c.status,
              c.created_at, c.updated_at
       FROM public.recruitment_candidates c
       WHERE ${candFilters.join(' AND ')}
       LIMIT 1;`,
      candValues,
    );
    const candidate = candRes.rows[0];
    if (!candidate) {
      throw new ApiException(
        'HRM-REC-404',
        'Candidate not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(candidate, scope, {
      notFoundCode: 'HRM-REC-404',
      mismatchCode: 'HRM-REC-409',
    });
    if (query.requisition_id?.trim()) {
      const reqId = query.requisition_id.trim();
      if (reqId !== candidate.requisition_id) {
        throw new ApiException(
          'HRM-REC-404',
          'Candidate not bound to the requested requisition',
          HttpStatus.NOT_FOUND,
        );
      }
    }

    const limitRaw = Number(query.limit ?? 50);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(100, Math.max(1, Math.trunc(limitRaw)))
      : 50;
    const histValues: unknown[] = [candidateId];
    const histFilters: string[] = ['h.recruitment_candidate_id = $1::uuid'];
    histValues.push(candidate.company_id);
    histFilters.push(`h.company_id = $${histValues.length}::text`);
    if (query.cursor?.trim()) {
      histValues.push(query.cursor.trim());
      histFilters.push(`h.changed_at < $${histValues.length}::timestamptz`);
    }
    histValues.push(limit);
    const histRes = await this.db.query<{
      id: string;
      company_id: string;
      recruitment_candidate_id: string;
      application_id: string | null;
      from_stage: string | null;
      to_stage: string;
      note: string | null;
      desired_salary: string | number | null;
      changed_by: string | null;
      changed_at: string;
    }>(
      `SELECT h.id, h.company_id, h.recruitment_candidate_id, h.application_id,
              h.from_stage, h.to_stage, h.note, h.desired_salary, h.changed_by, h.changed_at
       FROM public.rec_candidate_stage_history h
       WHERE ${histFilters.join(' AND ')}
       ORDER BY h.changed_at DESC
       LIMIT $${histValues.length};`,
      histValues,
    );
    return {
      total: histRes.rows.length,
      candidate_id: candidate.id,
      stage: candidate.status,
      requisition_id: candidate.requisition_id,
      company_id: candidate.company_id,
      data: histRes.rows.map((row) => this.mapStageHistoryDisplay(row)),
    };
  }

  /**
   * @CODE-MEMORY method · F-REC-MAIL-01 POST …/candidates/:id/mail
   * WorkItem: PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01
   * SRS: FR-UC-BP-REC-06 Diễn biến #1 · BR-BP-MAIL-01 · VAL-REC-ME-01/03/08/09/22
   * Purpose: Enqueue mail on Lane A UV↔YCTD — INSERT outbox + APPEND log; never mutate stage.
   * must_keep: APP-02 sole stage · DENY Nest /rec · U19 · U65 no seed
   */
  async enqueueCandidateMail(
    candidateId: string,
    body: EnqueueCandidateMailDto,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      companyId ?? '',
      scopeContext,
    );
    const candFilters: string[] = ['c.id = $1::uuid'];
    const candValues: unknown[] = [candidateId];
    this.pushRequisitionCompanyFilter(candFilters, candValues, scope, 'c');
    const candRes = await this.db.query<CandidateRow>(
      `SELECT c.id, c.company_id, c.requisition_id, c.full_name, c.email, c.source, c.status,
              c.created_at, c.updated_at
       FROM public.recruitment_candidates c
       WHERE ${candFilters.join(' AND ')}
       LIMIT 1;`,
      candValues,
    );
    const candidate = candRes.rows[0];
    if (!candidate) {
      throw new ApiException(
        'HRM-REC-404',
        'Candidate not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(candidate, scope, {
      notFoundCode: 'HRM-REC-404',
      mismatchCode: 'HRM-REC-409',
    });

    const templateCode = (body.template_code ?? '').trim();
    if (!templateCode) {
      throw new ApiException(
        HRM_REC_MAIL_VAL_400,
        'template_code is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.assertMailTemplateActiveOrThrow(
      candidate.company_id,
      templateCode,
    );

    const toEmails = this.normalizeEmailList(body.to);
    if (toEmails.length === 0) {
      throw new ApiException(
        HRM_REC_MAIL_VAL_400,
        'to[] must contain at least one valid email',
        HttpStatus.BAD_REQUEST,
      );
    }
    const ccEmails = this.normalizeEmailList(body.cc_interviewers);
    if (
      templateCode === MAIL_TEMPLATE_INTERVIEW_INVITE &&
      ccEmails.length === 0
    ) {
      throw new ApiException(
        HRM_REC_MAIL_CC_REQUIRED,
        'Bắt buộc CC người phỏng vấn khi gửi thư mời PV',
        HttpStatus.BAD_REQUEST,
      );
    }

    const applicationId = body.application_id?.trim() || null;
    if (!candidate.id && !applicationId) {
      throw new ApiException(
        HRM_REC_MAIL_NEO_REQUIRED,
        'Mail requires YCTD neo (recruitment_candidate_id or application_id)',
        HttpStatus.BAD_REQUEST,
      );
    }

    const outboxId = randomUUID();
    const logId = randomUUID();
    const simulateFail = body.simulate_provider_fail === true;
    const attemptResult: 'sent' | 'failed' = simulateFail ? 'failed' : 'sent';
    const outboxStatus: 'sent' | 'failed' = attemptResult;
    const errorMessage = simulateFail
      ? 'Simulated provider failure (GĐ1)'
      : null;
    const providerRef = simulateFail ? null : `local-${outboxId.slice(0, 8)}`;
    const stageBefore = candidate.status;

    const outboxRow = await this.db.withTransaction(async (query) => {
      const inserted = await query<{
        id: string;
        company_id: string;
        recruitment_candidate_id: string | null;
        application_id: string | null;
        requisition_id: string | null;
        template_code: string;
        to_emails_json: unknown;
        cc_emails_json: unknown;
        payload_json: unknown;
        status: string;
        queued_at: string;
        sent_at: string | null;
        error_message: string | null;
      }>(
        `INSERT INTO public.rec_mail_outbox (
           id, company_id, recruitment_candidate_id, application_id, requisition_id,
           template_code, to_emails_json, cc_emails_json, payload_json,
           status, queued_at, sent_at, error_message, created_at, updated_at
         ) VALUES (
           $1::uuid, $2::text, $3::uuid, $4::uuid, $5::uuid,
           $6, $7::jsonb, $8::jsonb, $9::jsonb,
           $10, NOW(), $11::timestamptz, $12, NOW(), NOW()
         )
         RETURNING id, company_id, recruitment_candidate_id, application_id, requisition_id,
                   template_code, to_emails_json, cc_emails_json, payload_json,
                   status, queued_at, sent_at, error_message;`,
        [
          outboxId,
          candidate.company_id,
          candidate.id,
          applicationId,
          candidate.requisition_id,
          templateCode,
          JSON.stringify(toEmails),
          ccEmails.length > 0 ? JSON.stringify(ccEmails) : null,
          body.payload ? JSON.stringify(body.payload) : null,
          outboxStatus,
          attemptResult === 'sent' ? new Date().toISOString() : null,
          errorMessage,
        ],
      );
      await query(
        `INSERT INTO public.rec_mail_log (
           id, outbox_id, company_id, attempt_no, provider_ref, result, error_message, logged_at
         ) VALUES ($1::uuid, $2::uuid, $3::text, 1, $4, $5, $6, NOW());`,
        [
          logId,
          outboxId,
          candidate.company_id,
          providerRef,
          attemptResult,
          errorMessage,
        ],
      );
      return inserted.rows[0];
    });

    // O7/O8 — assert stage unchanged (DENY mail→stage side-effect).
    const stageCheck = await this.db.query<{ status: string }>(
      `SELECT status FROM public.recruitment_candidates WHERE id = $1::uuid LIMIT 1;`,
      [candidate.id],
    );
    if (stageCheck.rows[0]?.status !== stageBefore) {
      throw new ApiException(
        'HRM-SYS-001',
        'Invariant violation: mail must not mutate candidate stage',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const logRows = await this.loadMailLogs(outboxId);
    const dto = this.mapMailOutboxDto(outboxRow, logRows);
    if (simulateFail) {
      throw new ApiException(
        HRM_REC_MAIL_PROVIDER_FAIL,
        'Gửi thất bại — giữ trạng thái failed · không đổi giai đoạn',
        HttpStatus.BAD_REQUEST,
        { outbox: dto },
      );
    }
    return dto;
  }

  /**
   * @CODE-MEMORY method · F-REC-MAIL-01-R GET …/candidates/:id/mail
   * WorkItem: PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01
   * Purpose: Display-ready outbox+log for UV–YCTD; empty [] 200; U19 same as get-by-id.
   */
  async listCandidateMail(
    candidateId: string,
    query: ListCandidateMailQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      query.company_id ?? '',
      scopeContext,
    );
    const candFilters: string[] = ['c.id = $1::uuid'];
    const candValues: unknown[] = [candidateId];
    this.pushRequisitionCompanyFilter(candFilters, candValues, scope, 'c');
    const candRes = await this.db.query<CandidateRow>(
      `SELECT c.id, c.company_id, c.requisition_id, c.full_name, c.email, c.source, c.status,
              c.created_at, c.updated_at
       FROM public.recruitment_candidates c
       WHERE ${candFilters.join(' AND ')}
       LIMIT 1;`,
      candValues,
    );
    const candidate = candRes.rows[0];
    if (!candidate) {
      throw new ApiException(
        'HRM-REC-404',
        'Candidate not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(candidate, scope, {
      notFoundCode: 'HRM-REC-404',
      mismatchCode: 'HRM-REC-409',
    });

    const limitRaw = Number(query.limit ?? 50);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(100, Math.max(1, Math.trunc(limitRaw)))
      : 50;
    const values: unknown[] = [candidate.id];
    const filters: string[] = [
      'o.recruitment_candidate_id = $1::uuid',
      'o.archived_at IS NULL',
    ];
    values.push(candidate.company_id);
    filters.push(`o.company_id = $${values.length}::text`);
    if (query.status?.trim()) {
      values.push(query.status.trim());
      filters.push(`o.status = $${values.length}`);
    }
    values.push(limit);
    const res = await this.db.query<Record<string, unknown>>(
      `SELECT o.id, o.company_id, o.recruitment_candidate_id, o.application_id, o.requisition_id,
              o.template_code, o.to_emails_json, o.cc_emails_json, o.payload_json,
              o.status, o.queued_at, o.sent_at, o.error_message
       FROM public.rec_mail_outbox o
       WHERE ${filters.join(' AND ')}
       ORDER BY o.queued_at DESC
       LIMIT $${values.length};`,
      values,
    );
    // REC-PERF-BE-01: Batch-load all mail logs in 1 query (fix N+1 per outbox row).
    const outboxIds = res.rows.map((r) => String(r.id));
    const logsMap = await this.batchLoadMailLogs(outboxIds);
    const data = res.rows.map((row) =>
      this.mapMailOutboxDto(row, logsMap.get(String(row.id)) ?? []),
    );
    return { total: data.length, data };
  }

  /**
   * @CODE-MEMORY method · optional GET …/mail-outbox/:outboxId
   * WorkItem: PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01
   */
  async getMailOutboxById(
    outboxId: string,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      companyId ?? '',
      scopeContext,
    );
    const res = await this.db.query<Record<string, unknown>>(
      `SELECT o.id, o.company_id, o.recruitment_candidate_id, o.application_id, o.requisition_id,
              o.template_code, o.to_emails_json, o.cc_emails_json, o.payload_json,
              o.status, o.queued_at, o.sent_at, o.error_message, o.archived_at
       FROM public.rec_mail_outbox o
       WHERE o.id = $1::uuid
       LIMIT 1;`,
      [outboxId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_REC_MAIL_404,
        'Mail outbox not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope({ company_id: String(row.company_id) }, scope, {
      notFoundCode: HRM_REC_MAIL_404,
      mismatchCode: 'HRM-REC-409',
    });
    const logs = await this.loadMailLogs(outboxId);
    return this.mapMailOutboxDto(row, logs);
  }

  private normalizeEmailList(raw: string[] | undefined): string[] {
    if (!Array.isArray(raw)) return [];
    const out: string[] = [];
    const seen = new Set<string>();
    for (const item of raw) {
      const email = String(item ?? '')
        .trim()
        .toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
      if (seen.has(email)) continue;
      seen.add(email);
      out.push(email);
    }
    return out;
  }

  private async assertMailTemplateActiveOrThrow(
    companyId: string,
    templateCode: string,
  ): Promise<void> {
    let active = [...DEFAULT_MAIL_TEMPLATE_CODES] as string[];
    try {
      const res = await this.db.query<{ value_json: unknown }>(
        `SELECT value_json
         FROM public.hrm_company_settings
         WHERE company_id = $1::text
           AND setting_key = $2
           AND archived_at IS NULL
         ORDER BY updated_at DESC
         LIMIT 1;`,
        [companyId, CFG_MAIL_TEMPLATE_CODES],
      );
      const raw = res.rows[0]?.value_json;
      if (Array.isArray(raw)) {
        active = raw.map((x) => String(x).trim()).filter(Boolean);
      } else if (raw && typeof raw === 'object') {
        const codes = (raw as { codes?: unknown }).codes;
        if (Array.isArray(codes)) {
          active = codes.map((x) => String(x).trim()).filter(Boolean);
        }
      }
    } catch {
      // soft-fail → defaults
    }
    if (!active.includes(templateCode)) {
      throw new ApiException(
        HRM_REC_MAIL_TEMPLATE_INACTIVE,
        `Mẫu thư '${templateCode}' không hiệu lực / không tồn tại`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async loadMailLogs(outboxId: string): Promise<
    Array<{
      attempt_no: number;
      result: string;
      error_message: string | null;
      provider_ref: string | null;
      logged_at: string;
    }>
  > {
    const res = await this.db.query<{
      attempt_no: number;
      result: string;
      error_message: string | null;
      provider_ref: string | null;
      logged_at: string;
    }>(
      `SELECT attempt_no, result, error_message, provider_ref, logged_at
       FROM public.rec_mail_log
       WHERE outbox_id = $1::uuid
       ORDER BY attempt_no ASC;`,
      [outboxId],
    );
    return res.rows;
  }

  /** REC-PERF-BE-01: Batch variant of loadMailLogs — one query for N outbox ids. */
  private async batchLoadMailLogs(outboxIds: string[]): Promise<
    Map<
      string,
      Array<{
        attempt_no: number;
        result: string;
        error_message: string | null;
        provider_ref: string | null;
        logged_at: string;
      }>
    >
  > {
    if (outboxIds.length === 0) return new Map();
    const res = await this.db.query<{
      outbox_id: string;
      attempt_no: number;
      result: string;
      error_message: string | null;
      provider_ref: string | null;
      logged_at: string;
    }>(
      `SELECT outbox_id::text AS outbox_id, attempt_no, result, error_message, provider_ref, logged_at
       FROM public.rec_mail_log
       WHERE outbox_id = ANY($1::uuid[])
       ORDER BY outbox_id, attempt_no ASC;`,
      [outboxIds],
    );
    const map = new Map<
      string,
      Array<{
        attempt_no: number;
        result: string;
        error_message: string | null;
        provider_ref: string | null;
        logged_at: string;
      }>
    >();
    for (const row of res.rows) {
      const id = row.outbox_id;
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push({
        attempt_no: row.attempt_no,
        result: row.result,
        error_message: row.error_message,
        provider_ref: row.provider_ref,
        logged_at: row.logged_at,
      });
    }
    return map;
  }

  private mapMailOutboxDto(
    row: Record<string, unknown>,
    logs: Array<{
      attempt_no: number;
      result: string;
      error_message: string | null;
      provider_ref: string | null;
      logged_at: string;
    }>,
  ) {
    const parseEmails = (raw: unknown): string[] => {
      if (Array.isArray(raw)) return raw.map((x) => String(x));
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw) as unknown;
          return Array.isArray(parsed) ? parsed.map((x) => String(x)) : [];
        } catch {
          return [];
        }
      }
      return [];
    };
    return {
      outbox_id: String(row.id),
      recruitment_candidate_id: row.recruitment_candidate_id
        ? String(row.recruitment_candidate_id)
        : null,
      application_id: row.application_id ? String(row.application_id) : null,
      requisition_id: row.requisition_id ? String(row.requisition_id) : null,
      company_id: String(row.company_id),
      template_code: String(row.template_code),
      status: String(row.status),
      queued_at: String(row.queued_at),
      sent_at: row.sent_at ? String(row.sent_at) : null,
      error_message: row.error_message ? String(row.error_message) : null,
      to: parseEmails(row.to_emails_json),
      cc_interviewers: parseEmails(row.cc_emails_json),
      payload: row.payload_json ?? null,
      log: logs.map((l) => ({
        attempt_no: Number(l.attempt_no),
        result: l.result,
        error_message: l.error_message,
        provider_ref: l.provider_ref,
        logged_at: String(l.logged_at),
      })),
    };
  }

  private isRejectStageClass(
    stageKey: string,
    catalogHit: RecPipelineStageDisplay | null,
  ): boolean {
    if (catalogHit) return Boolean(catalogHit.isRejectOutcome);
    return (REC_STAGE_REJECT_KEY_FALLBACK as readonly string[]).includes(
      stageKey,
    );
  }

  private parseSoftUuid(value: string | undefined): string | null {
    const raw = (value ?? '').trim();
    if (!raw) return null;
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        raw,
      )
    ) {
      return null;
    }
    return raw;
  }

  private mapStageHistoryDisplay(row: {
    id: string;
    company_id: string;
    recruitment_candidate_id: string;
    application_id: string | null;
    from_stage: string | null;
    to_stage: string;
    note: string | null;
    desired_salary: string | number | null;
    changed_by: string | null;
    changed_at: string;
  }) {
    const salary =
      row.desired_salary == null || row.desired_salary === ''
        ? null
        : Number(row.desired_salary);
    return {
      id: row.id,
      recruitment_candidate_id: row.recruitment_candidate_id,
      application_id: row.application_id,
      company_id: row.company_id,
      from_stage: row.from_stage,
      to_stage: row.to_stage,
      note: row.note,
      desired_salary: Number.isFinite(salary) ? (salary as number) : null,
      changed_by: row.changed_by,
      changed_at: row.changed_at,
    };
  }

  /**
   * @CODE-MEMORY method · F-REC-HIRE-01 POST …/applications/:id/accept-offer
   * WorkItem: PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01
   * SRS: FR-UC-BP-REC-07 Diễn biến #1–#2 · BR-BP-LC-01 / BR-BP-ONB-01 · VAL-REC-HIRE-*
   * Purpose: CREATE/LINK hồ sơ NS từ UV↔YCTD prefill · soft stamp · reverse candidate_id ·
   *   idempotent 2xx · DENY silent stage (APP-02 sole hired-outcome) · DENY PAY.
   * must_keep: U19 · HIRE-400/409 · HTP-05 consume · DENY Nest /rec · hard FK · second hire SoT
   */
  async acceptOfferApplication(
    applicationId: string,
    body: AcceptOfferDto,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    opts?: { actorId?: string },
  ) {
    this.assertNoPayPayloadOrThrow(body as unknown as Record<string, unknown>);
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      companyId ?? '',
      scopeContext,
    );

    const filters: string[] = [
      'c.id = $1::uuid',
      'c.requisition_id IS NOT NULL',
    ];
    const values: unknown[] = [applicationId];
    this.pushRequisitionCompanyFilter(filters, values, scope, 'c');

    type AcceptAppRow = {
      id: string;
      company_id: string;
      requisition_id: string;
      full_name: string;
      email: string;
      source: string;
      status: string;
      employee_id: string | null;
      pool_candidate_id: string | null;
      offer_accepted_at: string | null;
      offer_accepted_by: string | null;
      accepted_application_id: string | null;
      offer_id: string | null;
      yctd_company_id: string;
      department_key: string | null;
      position_key: string | null;
      pool_phone: string | null;
    };

    const appRes = await this.db.query<AcceptAppRow>(
      `SELECT c.id, c.company_id, c.requisition_id::text AS requisition_id,
              c.full_name, c.email, c.source, c.status,
              c.employee_id::text AS employee_id,
              c.pool_candidate_id::text AS pool_candidate_id,
              c.offer_accepted_at::text AS offer_accepted_at,
              c.offer_accepted_by, c.accepted_application_id::text AS accepted_application_id,
              c.offer_id::text AS offer_id,
              r.company_id AS yctd_company_id,
              r.department_key, r.position_key,
              pool.phone AS pool_phone
       FROM public.recruitment_candidates c
       INNER JOIN public.job_requisitions r ON r.id = c.requisition_id
       LEFT JOIN public.candidates pool ON pool.id = c.pool_candidate_id
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    const app = appRes.rows[0];
    if (!app) {
      throw new ApiException(
        'HRM-REC-404',
        'Application not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(app, scope, {
      notFoundCode: 'HRM-REC-404',
      mismatchCode: 'HRM-REC-409',
    });

    const candCo = (app.company_id ?? '').trim().toLowerCase();
    const yctdCo = (app.yctd_company_id ?? '').trim().toLowerCase();
    if (candCo && yctdCo && candCo !== yctdCo) {
      throw new ApiException(
        HRM_REC_HIRE_409,
        'Candidate and requisition must belong to the same company',
        HttpStatus.CONFLICT,
      );
    }
    const persistCompany = (app.company_id || app.yctd_company_id).trim();
    if (!persistCompany) {
      throw new ApiException(
        HRM_REC_HIRE_PREFILL_FAIL,
        'Missing required prefill (company_id) — cannot create employee',
        HttpStatus.BAD_REQUEST,
      );
    }
    const stageKey = (app.status ?? '').trim().toLowerCase();
    if ((OFFER_CANCELLED_STAGES as readonly string[]).includes(stageKey)) {
      throw new ApiException(
        HRM_REC_HIRE_CANCELLED,
        'Offer đã bị hủy — không tạo hồ sơ nhân sự mới',
        HttpStatus.BAD_REQUEST,
      );
    }

    // R-REC-07-IDEMPOTENT-OFFER-GATE: soft/reverse BEFORE offer-ready.
    // After APP-02 hired-outcome, stage ≠ offer — re-accept must still HIRE-200.
    const reverseEmp =
      await this.findActiveEmployeeByCandidateId(applicationId);
    const softEmpId = app.employee_id?.trim() || null;
    const reverseId = reverseEmp?.id?.trim() || null;

    if (softEmpId && reverseId && softEmpId !== reverseId) {
      throw new ApiException(
        HRM_REC_HIRE_DUP,
        'Conflict: different employees linked to this application',
        HttpStatus.CONFLICT,
      );
    }

    const linkedEmpId = softEmpId || reverseId;
    if (linkedEmpId) {
      const emp = await this.loadActiveEmployeeOrThrow(linkedEmpId);
      const empCo = (emp.company_id ?? '').trim().toLowerCase();
      if (empCo && candCo && empCo !== candCo) {
        throw new ApiException(
          HRM_REC_HIRE_409,
          'Employee and candidate must belong to the same company',
          HttpStatus.CONFLICT,
        );
      }
      const stamped = await this.stampHireLinks({
        applicationId,
        employeeId: emp.id,
        companyId: persistCompany,
        poolCandidateId: app.pool_candidate_id,
        actorId: opts?.actorId,
        offerId: body.offer_id ?? app.offer_id,
        preserveAcceptedAt: app.offer_accepted_at,
        existingAcceptedBy: app.offer_accepted_by,
        existingAcceptedAppId: app.accepted_application_id,
        existingOfferId: app.offer_id,
      });
      await assertPersistedHireSoftLinkOrThrow(
        this.db,
        applicationId,
        persistCompany,
        emp.id,
      );
      return this.toAcceptOfferDisplay({
        applicationId,
        candidateId: applicationId,
        employee: emp,
        companyId: persistCompany,
        requisitionId: app.requisition_id,
        audit: stamped,
        mode: softEmpId && reverseId ? 'idempotent' : 'linked',
        positionKey: emp.job_title_key ?? app.position_key,
      });
    }

    // Unlinked CREATE — offer-ready gate applies only here.
    await this.assertOfferReadyOrThrow(persistCompany, stageKey, authorization);

    // CREATE path — M01/M02/M05 required
    const fullName = (app.full_name ?? '').trim();
    const email = (app.email ?? '').trim().toLowerCase();
    if (!fullName || !persistCompany || !email) {
      throw new ApiException(
        HRM_REC_HIRE_PREFILL_FAIL,
        'Missing required prefill (full_name / company_id / email) — cannot create employee',
        HttpStatus.BAD_REQUEST,
      );
    }

    const employeeId = randomUUID();
    const employeeCode = this.mintHireEmployeeCode(persistCompany);
    const customFields: Record<string, unknown> = {};
    const phone = (app.pool_phone ?? '').trim();
    if (phone) customFields.phone_number = phone;
    const deptKey = (app.department_key ?? '').trim();
    if (deptKey) customFields.department_key = deptKey;
    const hiredAt = (body.expected_start_date ?? '').trim() || null;
    const jobTitleKey = (app.position_key ?? '').trim() || null;

    try {
      const inserted = await this.db.withTransaction(async (query) => {
        const empIns = await query<{
          id: string;
          company_id: string;
          employee_code: string;
          email: string;
          full_name: string;
          job_title_key: string | null;
          status: string;
          hired_at: string | null;
          candidate_id: string | null;
          custom_fields: unknown;
        }>(
          `INSERT INTO public.employees (
             id, company_id, employee_code, email, full_name, job_title_key,
             status, hired_at, custom_fields, candidate_id
           ) VALUES (
             $1::uuid, $2::text, $3, $4, $5, $6,
             $7, $8::date, $9::jsonb, $10::uuid
           )
           RETURNING id::text AS id, company_id, employee_code, email, full_name,
                     job_title_key, status, hired_at::text AS hired_at,
                     candidate_id::text AS candidate_id, custom_fields;`,
          [
            employeeId,
            persistCompany,
            employeeCode,
            email,
            fullName,
            jobTitleKey,
            EMP_STATUS_PENDING_DOCS,
            hiredAt,
            JSON.stringify(customFields),
            applicationId,
          ],
        );
        const emp = empIns.rows[0];
        if (!emp) {
          throw new ApiException(
            HRM_REC_HIRE_PREFILL_FAIL,
            'Failed to create employee profile',
            HttpStatus.BAD_REQUEST,
          );
        }
        const audit = await this.stampHireLinksWithQuery(query, {
          applicationId,
          employeeId: emp.id,
          companyId: persistCompany,
          poolCandidateId: app.pool_candidate_id,
          actorId: opts?.actorId,
          offerId: body.offer_id ?? null,
          preserveAcceptedAt: null,
          existingAcceptedBy: null,
          existingAcceptedAppId: null,
          existingOfferId: null,
        });
        return { emp, audit };
      });

      await assertPersistedHireSoftLinkOrThrow(
        this.db,
        applicationId,
        persistCompany,
        inserted.emp.id,
      );

      return this.toAcceptOfferDisplay({
        applicationId,
        candidateId: applicationId,
        employee: inserted.emp,
        companyId: persistCompany,
        requisitionId: app.requisition_id,
        audit: inserted.audit,
        mode: 'created',
        positionKey: inserted.emp.job_title_key ?? app.position_key,
      });
    } catch (err) {
      if (err instanceof ApiException) throw err;
      const pg = err as { code?: string };
      if (pg.code === '23505') {
        throw new ApiException(
          HRM_REC_HIRE_DUP,
          'Conflict creating employee for this application (duplicate email/code or race)',
          HttpStatus.CONFLICT,
        );
      }
      throw new ApiException(
        HRM_REC_HIRE_PREFILL_FAIL,
        err instanceof Error
          ? err.message
          : 'Cannot create employee from offer',
        HttpStatus.BAD_REQUEST,
        { cause: err instanceof Error ? err.message : String(err) },
      );
    }
  }

  /**
   * @CODE-MEMORY method · F-REC-HIRE-01-A POST …/candidates/:id/accept-offer (thin alias)
   * WorkItem: PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01
   * Purpose: GĐ1 UV id = application neo when requisition_id set — same VAL as applications path.
   */
  async acceptOfferByCandidateId(
    candidateId: string,
    body: AcceptOfferDto,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    opts?: { actorId?: string },
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      companyId ?? '',
      scopeContext,
    );
    const filters: string[] = ['c.id = $1::uuid'];
    const values: unknown[] = [candidateId];
    this.pushRequisitionCompanyFilter(filters, values, scope, 'c');
    const res = await this.db.query<{
      id: string;
      requisition_id: string | null;
    }>(
      `SELECT c.id, c.requisition_id::text AS requisition_id
       FROM public.recruitment_candidates c
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-REC-404',
        'Candidate not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (!row.requisition_id) {
      throw new ApiException(
        HRM_REC_HIRE_OFFER_INVALID,
        'Candidate has no YCTD-bound application neo — use applications/:id/accept-offer',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.acceptOfferApplication(
      candidateId,
      body,
      companyId,
      authorization,
      scopeContext,
      opts,
    );
  }

  private assertNoPayPayloadOrThrow(
    body: Record<string, unknown> | null | undefined,
  ): void {
    if (!body || typeof body !== 'object') return;
    for (const key of Object.keys(body)) {
      const lk = key.trim().toLowerCase();
      if (!lk) continue;
      const forbidden =
        (PAY_FORBIDDEN_BODY_KEYS as readonly string[]).includes(lk) ||
        lk.startsWith('payslip') ||
        lk.startsWith('payroll') ||
        lk.startsWith('base_salary');
      if (forbidden) {
        throw new ApiException(
          HRM_REC_PAY_403,
          'Payroll / payslip / salary payload forbidden on accept-offer (REC ↛ PAY)',
          HttpStatus.FORBIDDEN,
        );
      }
    }
  }

  private async assertOfferReadyOrThrow(
    companyId: string,
    stageKey: string,
    authorization?: string,
  ): Promise<void> {
    const key = stageKey.trim().toLowerCase();
    if (!key) {
      throw new ApiException(
        HRM_REC_HIRE_OFFER_INVALID,
        'Application is not offer-ready',
        HttpStatus.BAD_REQUEST,
      );
    }
    const stageCatalog = this.resolveRecPipelineStages();
    if (stageCatalog) {
      const effective = await stageCatalog.listEffective(
        { company_id: companyId },
        authorization,
      );
      if (effective.total > 0) {
        const hit = effective.data.find(
          (r) => r.stageKey.trim().toLowerCase() === key,
        );
        if (!hit) {
          throw new ApiException(
            HRM_REC_HIRE_OFFER_INVALID,
            `stage '${stageKey}' is not offer-ready (not in effective catalog)`,
            HttpStatus.BAD_REQUEST,
          );
        }
        if (!this.isOfferReadyStage(hit)) {
          throw new ApiException(
            HRM_REC_HIRE_OFFER_INVALID,
            `stage '${stageKey}' is not offer-ready`,
            HttpStatus.BAD_REQUEST,
          );
        }
        return;
      }
    }
    // EFF empty — GĐ1 default: stage_key = offer
    if (key !== 'offer') {
      throw new ApiException(
        HRM_REC_HIRE_OFFER_INVALID,
        `stage '${stageKey}' is not offer-ready (default GĐ1 requires offer)`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private isOfferReadyStage(hit: RecPipelineStageDisplay): boolean {
    const key = hit.stageKey.trim().toLowerCase();
    if (key === 'offer') return true;
    const meta = hit.metadata ?? {};
    if (meta.allows_accept_offer === true || meta.allowsAcceptOffer === true) {
      return true;
    }
    return false;
  }

  private mintHireEmployeeCode(companyId: string): string {
    const slug = companyId
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
    const stamp = Date.now().toString(36).toUpperCase();
    const suffix = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
    return `HIRE-${slug || 'CT'}-${stamp}${suffix}`.slice(0, 32);
  }

  private async findActiveEmployeeByCandidateId(
    candidateId: string,
  ): Promise<{ id: string; company_id: string } | null> {
    try {
      const res = await this.db.query<{ id: string; company_id: string }>(
        `SELECT id::text AS id, company_id
         FROM public.employees
         WHERE candidate_id = $1::uuid AND archived_at IS NULL
         LIMIT 1;`,
        [candidateId],
      );
      return res.rows[0] ?? null;
    } catch {
      return null;
    }
  }

  private async loadActiveEmployeeOrThrow(employeeId: string) {
    const res = await this.db.query<{
      id: string;
      company_id: string;
      employee_code: string;
      email: string;
      full_name: string;
      job_title_key: string | null;
      status: string;
      hired_at: string | null;
      candidate_id: string | null;
      custom_fields: unknown;
    }>(
      `SELECT id::text AS id, company_id, employee_code, email, full_name, job_title_key,
              status, hired_at::text AS hired_at, candidate_id::text AS candidate_id, custom_fields
       FROM public.employees
       WHERE id = $1::uuid AND archived_at IS NULL
       LIMIT 1;`,
      [employeeId],
    );
    const emp = res.rows[0];
    if (!emp) {
      throw new ApiException(
        HRM_REC_HIRE_DUP,
        'Linked employee is archived or missing',
        HttpStatus.CONFLICT,
      );
    }
    return emp;
  }

  private async stampHireLinks(args: {
    applicationId: string;
    employeeId: string;
    companyId: string;
    poolCandidateId: string | null;
    actorId?: string;
    offerId?: string | null;
    preserveAcceptedAt: string | null;
    existingAcceptedBy: string | null;
    existingAcceptedAppId: string | null;
    existingOfferId: string | null;
  }) {
    return this.db.withTransaction(async (query) =>
      this.stampHireLinksWithQuery(query, args),
    );
  }

  private async stampHireLinksWithQuery(
    query: HrmDbQueryFn,
    args: {
      applicationId: string;
      employeeId: string;
      companyId: string;
      poolCandidateId: string | null;
      actorId?: string;
      offerId?: string | null;
      preserveAcceptedAt: string | null;
      existingAcceptedBy: string | null;
      existingAcceptedAppId: string | null;
      existingOfferId: string | null;
    },
  ) {
    const actor = (args.actorId ?? '').trim() || null;
    const offerId = (args.offerId ?? args.existingOfferId ?? '').trim() || null;
    const keepAt = Boolean(args.preserveAcceptedAt);
    const acceptedBy = keepAt ? args.existingAcceptedBy : actor;
    const acceptedAppId = keepAt
      ? (args.existingAcceptedAppId ?? args.applicationId)
      : args.applicationId;

    const upd = await query<{
      offer_accepted_at: string | null;
      offer_accepted_by: string | null;
      accepted_application_id: string | null;
      offer_id: string | null;
    }>(
      `UPDATE public.recruitment_candidates
       SET employee_id = $2::uuid,
           offer_accepted_at = COALESCE(offer_accepted_at, NOW()),
           offer_accepted_by = CASE
             WHEN offer_accepted_at IS NOT NULL THEN offer_accepted_by
             ELSE $3
           END,
           accepted_application_id = COALESCE(accepted_application_id, $4::uuid),
           offer_id = COALESCE(offer_id, $5::uuid),
           updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING offer_accepted_at::text AS offer_accepted_at,
                 offer_accepted_by,
                 accepted_application_id::text AS accepted_application_id,
                 offer_id::text AS offer_id;`,
      [args.applicationId, args.employeeId, acceptedBy, acceptedAppId, offerId],
    );

    await query(
      `UPDATE public.employees
       SET candidate_id = $2::uuid, updated_at = NOW()
       WHERE id = $1::uuid
         AND archived_at IS NULL
         AND (candidate_id IS NULL OR candidate_id = $2::uuid);`,
      [args.employeeId, args.applicationId],
    );

    if (args.poolCandidateId) {
      await query(
        `UPDATE public.candidates
         SET employee_id = $2::uuid, updated_at = NOW()
         WHERE id = $1::uuid;`,
        [args.poolCandidateId, args.employeeId],
      );
    }

    const row = upd.rows[0];
    return {
      offer_accepted_at: row?.offer_accepted_at ?? args.preserveAcceptedAt,
      offer_accepted_by: row?.offer_accepted_by ?? acceptedBy,
      accepted_application_id: row?.accepted_application_id ?? acceptedAppId,
      offer_id: row?.offer_id ?? offerId,
    };
  }

  private toAcceptOfferDisplay(args: {
    applicationId: string;
    candidateId: string;
    employee: {
      id: string;
      company_id: string;
      employee_code: string;
      email: string;
      full_name: string;
      job_title_key: string | null;
      status: string;
      hired_at: string | null;
      custom_fields?: unknown;
    };
    companyId: string;
    requisitionId: string;
    audit: {
      offer_accepted_at: string | null;
      offer_accepted_by: string | null;
      accepted_application_id: string | null;
      offer_id: string | null;
    };
    mode: 'created' | 'linked' | 'idempotent';
    positionKey: string | null;
  }) {
    const cf =
      args.employee.custom_fields &&
      typeof args.employee.custom_fields === 'object' &&
      !Array.isArray(args.employee.custom_fields)
        ? (args.employee.custom_fields as Record<string, unknown>)
        : {};
    const phone = typeof cf.phone_number === 'string' ? cf.phone_number : null;
    const departmentKey =
      typeof cf.department_key === 'string' ? cf.department_key : null;
    return {
      application_id: args.applicationId,
      candidate_id: args.candidateId,
      employee_id: args.employee.id,
      company_id: args.companyId,
      requisition_id: args.requisitionId,
      full_name: args.employee.full_name,
      email: args.employee.email,
      phone_number: phone,
      department_key: departmentKey,
      job_title_key: args.employee.job_title_key ?? args.positionKey,
      position_key: args.employee.job_title_key ?? args.positionKey,
      hired_at: args.employee.hired_at,
      expected_start_date: args.employee.hired_at,
      status: args.employee.status,
      employee_code: args.employee.employee_code,
      offer_accepted_at: args.audit.offer_accepted_at,
      offer_accepted_by: args.audit.offer_accepted_by,
      accepted_application_id: args.audit.accepted_application_id,
      offer_id: args.audit.offer_id,
      mode: args.mode,
      history_id: null as string | null,
      hired_outcome_stage: null as string | null,
      event: OFFER_ACCEPTED_EVENT,
    };
  }

  /**
   * F-REC-CMP-01 — applications (+ evals) by YCTD. Lane A spine = recruitment_candidates.
   * FORBIDDEN: filter via job_postings / job_posting_id.
   * Scope company via YCTD (r.company_id) so UV attached to an in-scope YCTD still list
   * when candidate.company_id differs from OU used on the picker (UV meta vs empty list).
   */
  async listApplicationsByYctd(
    query: ListApplicationsQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const requisitionId = requireUvYctdRequisitionId(query);
    const page = this.resolvePage(query.page, 1);
    const pageSize = this.resolvePageSize(query.page_size, 50);
    const offset = (page - 1) * pageSize;
    const includeEvals = String(query.include ?? '')
      .toLowerCase()
      .includes('eval');
    // Scope via YCTD (r.company_id), not UV partition — UV may share YCTD across OU
    // while candidate_count on picker counts all Lane A rows on requisition_id.
    const filters: string[] = ['c.requisition_id = $1::uuid'];
    const values: unknown[] = [requisitionId];
    this.pushRequisitionCompanyFilter(filters, values, scope, 'r');
    const whereClause = filters.length ? filters.join(' AND ') : 'TRUE';
    const countRes = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total
       FROM public.recruitment_candidates c
       INNER JOIN public.job_requisitions r ON r.id = c.requisition_id
       WHERE ${whereClause};`,
      values,
    );
    const res = await this.db.query<{
      id: string;
      company_id: string;
      requisition_id: string;
      full_name: string;
      email: string;
      status: string;
      created_at: string;
      position_key: string | null;
      position_name: string | null;
      yctd_title: string | null;
    }>(
      `SELECT c.id, c.company_id, c.requisition_id, c.full_name, c.email, c.status, c.created_at,
              COALESCE(NULLIF(r.position_key, ''), t.position_code, '') AS position_key,
              COALESCE(NULLIF(t.position_name, ''), NULLIF(r.title, ''), '') AS position_name,
              r.title AS yctd_title
       FROM public.recruitment_candidates c
       INNER JOIN public.job_requisitions r ON r.id = c.requisition_id
       LEFT JOIN public.job_description_templates t ON t.id::text = r.job_template_id
       WHERE ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2};`,
      [...values, pageSize, offset],
    );
    let evalByCandidate = new Map<
      string,
      {
        scores: ReturnType<typeof normalizeCompareScoreItems>;
        result: string | null;
        total_score: number | null;
        weighted_score: number | null;
        overall_feedback: string | null;
        recommendation: string | null;
      }
    >();
    if (includeEvals && res.rows.length > 0) {
      const ids = res.rows.map((r) => r.id);
      const evalRes = await this.db.query<{
        lane_candidate_id: string;
        scores: unknown;
        result: string | null;
        total_score: number | null;
        weighted_score: number | null;
        overall_feedback: string | null;
        recommendation: string | null;
      }>(
        `SELECT DISTINCT ON (${COMPARE_EVAL_LANE_A_ID_SQL})
            ${COMPARE_EVAL_LANE_A_ID_SQL}::text AS lane_candidate_id,
            e.scores,
            e.result,
            e.total_score,
            e.weighted_score,
            e.overall_feedback,
            e.recommendation
         FROM public.candidate_evaluations e
         WHERE ${COMPARE_EVAL_LANE_A_ID_SQL} = ANY($1::uuid[])
         ORDER BY ${COMPARE_EVAL_LANE_A_ID_SQL}, e.created_at DESC NULLS LAST;`,
        [ids],
      );
      evalByCandidate = new Map(
        evalRes.rows.map((e) => [
          e.lane_candidate_id,
          {
            scores: normalizeCompareScoreItems(e.scores),
            result: e.result,
            total_score: e.total_score,
            weighted_score: e.weighted_score,
            overall_feedback: e.overall_feedback,
            recommendation: e.recommendation,
          },
        ]),
      );
    }
    const items = res.rows.map((row) => {
      const ev = evalByCandidate.get(row.id);
      const evalStatus = ev ? 'scored' : 'none';
      const weighted =
        ev?.weighted_score != null && Number.isFinite(Number(ev.weighted_score))
          ? Number(ev.weighted_score)
          : ev?.total_score != null && Number.isFinite(Number(ev.total_score))
            ? Number(ev.total_score)
            : null;
      return {
        candidate_id: row.id,
        recruitment_candidate_id: row.id,
        application_id: row.id,
        full_name: row.full_name,
        email: row.email ?? null,
        stage: row.status,
        position_key: row.position_key || null,
        position_name: row.position_name || null,
        yctd_title: row.yctd_title || null,
        requisition_id: row.requisition_id,
        recruitment_request_id: row.requisition_id,
        eval_status: evalStatus,
        eval_label: evalStatus === 'none' ? 'chưa đánh giá' : undefined,
        scores: ev?.scores ?? [],
        result: ev?.result ?? null,
        recommendation: ev?.recommendation ?? null,
        overall_feedback: ev?.overall_feedback ?? null,
        total_score: ev?.total_score ?? null,
        weighted_score: weighted,
      };
    });
    return {
      total: Number(countRes.rows[0]?.total ?? 0),
      page,
      page_size: pageSize,
      data: items,
      items,
    };
  }

  /**
   * F-REC-CMP-02 — compare matrix ≤ N · BE authoritative MAX-N + YCTD-MIX.
   * FORBIDDEN: job_postings filter SoT.
   */
  async compareCandidatesByYctd(
    query: CompareCandidatesQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const requisitionId = requireUvYctdRequisitionId(query);
    const rawCandidateIds = parseCandidateIdList(
      query.candidate_ids ?? query.application_ids,
    );
    assertCompareMaxNOrThrow(rawCandidateIds);
    if (rawCandidateIds.length === 0) {
      return {
        requisition_id: requisitionId,
        recruitment_request_id: requisitionId,
        criteria: [],
        rows: [],
        items: [],
      };
    }
    const candidateIds = await this.resolveCompareSpineCandidateIdsForYctd(
      requisitionId,
      rawCandidateIds,
      scope,
    );
    const filters: string[] = [
      'c.id = ANY($1::uuid[])',
      'c.requisition_id = $2::uuid',
    ];
    const values: unknown[] = [candidateIds, requisitionId];
    this.pushRequisitionCompanyFilter(filters, values, scope, 'r');
    const res = await this.db.query<{
      id: string;
      requisition_id: string;
      full_name: string;
      status: string;
    }>(
      `SELECT c.id, c.requisition_id::text AS requisition_id, c.full_name, c.status
       FROM public.recruitment_candidates c
       INNER JOIN public.job_requisitions r ON r.id = c.requisition_id
       WHERE ${filters.join(' AND ')};`,
      values,
    );
    // YCTD-MIX: any requested id missing or wrong YCTD → MIX (also covers OOS).
    if (res.rows.length !== candidateIds.length) {
      // Distinguish mix vs not-found: load without YCTD filter for mix detection.
      const anyFilters: string[] = ['c.id = ANY($1::uuid[])'];
      const anyValues: unknown[] = [candidateIds];
      this.pushRequisitionCompanyFilter(anyFilters, anyValues, scope, 'r');
      const anyRes = await this.db.query<{
        id: string;
        requisition_id: string;
      }>(
        `SELECT c.id, c.requisition_id::text AS requisition_id
         FROM public.recruitment_candidates c
         INNER JOIN public.job_requisitions r ON r.id = c.requisition_id
         WHERE ${anyFilters.join(' AND ')};`,
        anyValues,
      );
      assertCompareSameYctdOrThrow(requisitionId, anyRes.rows, candidateIds);
      // Still missing after same-YCTD check → treat as mix/not in set.
      assertCompareSameYctdOrThrow(requisitionId, res.rows, candidateIds);
    } else {
      assertCompareSameYctdOrThrow(requisitionId, res.rows, candidateIds);
    }
    const evalRes = await this.db.query<{
      lane_candidate_id: string;
      scores: unknown;
      result: string | null;
      total_score: number | null;
      weighted_score: number | null;
      overall_feedback: string | null;
      recommendation: string | null;
    }>(
      `SELECT DISTINCT ON (${COMPARE_EVAL_LANE_A_ID_SQL})
          ${COMPARE_EVAL_LANE_A_ID_SQL}::text AS lane_candidate_id,
          e.scores,
          e.result,
          e.total_score,
          e.weighted_score,
          e.overall_feedback,
          e.recommendation
       FROM public.candidate_evaluations e
       WHERE ${COMPARE_EVAL_LANE_A_ID_SQL} = ANY($1::uuid[])
       ORDER BY ${COMPARE_EVAL_LANE_A_ID_SQL}, e.created_at DESC NULLS LAST;`,
      [candidateIds],
    );
    const evalMap = new Map(evalRes.rows.map((e) => [e.lane_candidate_id, e]));
    const criteriaKeys = new Set<string>();
    for (const e of evalRes.rows) {
      for (const s of normalizeCompareScoreItems(e.scores)) {
        criteriaKeys.add(s.criterion_name);
      }
    }
    let criteria: Array<{ id?: string; name: string; weight?: number }> = [
      ...criteriaKeys,
    ].map((name) => ({ name }));
    // TECH-01 §3.2 — when no stored scores, fall back to active eval template axes.
    if (criteria.length === 0) {
      const reqCompanyRes = await this.db.query<{ company_id: string }>(
        `SELECT company_id FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1;`,
        [requisitionId],
      );
      const candidateCompanyId = res.rows[0]
        ? (
            await this.db.query<{ company_id: string }>(
              `SELECT company_id FROM public.recruitment_candidates WHERE id = $1::uuid LIMIT 1;`,
              [res.rows[0].id],
            )
          ).rows[0]?.company_id
        : null;
      const templateCompanyIds = [
        reqCompanyRes.rows[0]?.company_id,
        candidateCompanyId,
        ...expandPayrollPeriodCompanyIds(scope),
      ]
        .map((id) => (id != null ? String(id).trim() : ''))
        .filter((id) => id.length > 0);
      const seenTemplateCompanies = new Set<string>();
      for (const companyId of templateCompanyIds) {
        if (seenTemplateCompanies.has(companyId)) continue;
        seenTemplateCompanies.add(companyId);
        const tplRes = await this.db.query<{
          id: string;
          name: string;
          weight: number | null;
        }>(
          `SELECT id::text AS id, name, weight
           FROM public.evaluation_criteria_templates
           WHERE company_id = $1 AND COALESCE(is_active, TRUE) = TRUE
           ORDER BY sort_order ASC, name ASC;`,
          [companyId],
        );
        if (tplRes.rows.length > 0) {
          criteria = tplRes.rows.map((t) => ({
            id: t.id,
            name: t.name,
            weight: t.weight != null ? Number(t.weight) : undefined,
          }));
          break;
        }
      }
    }
    const byId = new Map(res.rows.map((r) => [r.id, r]));
    const rows = candidateIds.map((id) => {
      const cand = byId.get(id)!;
      const ev = evalMap.get(id);
      const scoresArr = normalizeCompareScoreItems(ev?.scores);
      const scoresObj: Record<string, number | null> = {};
      for (const c of criteria) {
        scoresObj[c.name] = null;
        if (c.id) scoresObj[c.id] = null;
      }
      for (const s of scoresArr) {
        scoresObj[s.criterion_name] = s.actual_score;
      }
      const weighted =
        ev?.weighted_score != null && Number.isFinite(Number(ev.weighted_score))
          ? Number(ev.weighted_score)
          : ev?.total_score != null && Number.isFinite(Number(ev.total_score))
            ? Number(ev.total_score)
            : null;
      return {
        candidate_id: id,
        application_id: id,
        full_name: cand.full_name,
        stage: cand.status,
        eval_status: ev ? 'scored' : 'none',
        eval_label: ev ? undefined : 'chưa đánh giá',
        scores: scoresObj,
        result: ev?.result ?? null,
        recommendation: ev?.recommendation ?? null,
        overall_feedback: ev?.overall_feedback ?? null,
        total_score: ev?.total_score ?? null,
        weighted_score: weighted,
      };
    });
    return {
      requisition_id: requisitionId,
      recruitment_request_id: requisitionId,
      max_n: REC_COMPARE_MAX_N,
      criteria,
      rows,
      items: rows,
    };
  }

  /**
   * @CODE-MEMORY method · Lane A GET interviews list — FR-UC-BP-REC-06a §3.4
   * HTTP: GET …/interviews · SoT public.recruitment_interviews (+ candidate display)
   * DENY public.interviews catalog twin (Lane B) as list SoT for Quản lý lịch PV.
   * WorkItem: PO-HRM-REC-IV-LIST-LANE-A-01
   */
  async listRecruitmentInterviews(
    companyId: string,
    authorization?: string,
    options?: { candidateId?: string },
  ): Promise<{
    total: number;
    data: Array<
      InterviewRow & {
        candidate_name: string | null;
        candidate_email: string | null;
        position: string | null;
        scheduled_at_display_vi_vn: string | null;
      }
    >;
  }> {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    if (scope.companyIds.length === 1) {
      values.push(scope.companyIds[0]);
      filters.push(`i.company_id = $${values.length}::text`);
    } else {
      values.push(scope.companyIds);
      filters.push(`i.company_id = ANY($${values.length}::text[])`);
    }
    if (options?.candidateId?.trim()) {
      values.push(options.candidateId.trim());
      filters.push(`i.candidate_id = $${values.length}::uuid`);
    }
    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const countRes = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total
       FROM public.recruitment_interviews i
       ${where}`,
      values,
    );
    const res = await this.db.query<
      InterviewRow & {
        candidate_name: string | null;
        candidate_email: string | null;
        position: string | null;
      }
    >(
      `SELECT i.id, i.company_id, i.candidate_id::text AS candidate_id,
              i.scheduled_at::text AS scheduled_at, i.interviewer, i.status,
              i.cancel_reason, i.created_at::text AS created_at,
              i.updated_at::text AS updated_at,
              c.full_name AS candidate_name,
              c.email AS candidate_email,
              nullif(btrim(r.title), '') AS position
       FROM public.recruitment_interviews i
       LEFT JOIN public.recruitment_candidates c ON c.id = i.candidate_id
       LEFT JOIN public.job_requisitions r ON r.id = c.requisition_id
       ${where}
       ORDER BY
         CASE WHEN i.status IN ('scheduled','confirmed') THEN 0 ELSE 1 END,
         i.scheduled_at DESC NULLS LAST`,
      values,
    );
    const data = res.rows.map((row) => ({
      ...row,
      scheduled_at_display_vi_vn: this.toViVnDateTime(row.scheduled_at),
    }));
    return {
      total: Number(countRes.rows[0]?.total ?? 0),
      data,
    };
  }

  /**
   * @CODE-MEMORY method · Lane A FR-HRM-RC-05 SoT — recruitment_interviews
   * candidate_id → recruitment_candidates only (F4) · không public.interviews
   * must_keep §17.6.4
   *
   * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-01
   * ADD past-datetime CFG (O7 default BLOCK) · RETAIN 409 ACTIVE + soft-gate ≠ 409
   */
  async scheduleInterview(
    payload: ScheduleInterviewDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, payload.company_id);
    const candFilters: string[] = ['id = $1::uuid'];
    const candValues: unknown[] = [payload.candidate_id];
    pushCompanyIdFilter(candFilters, candValues, scope);
    const candRes = await this.db.query<{
      id: string;
      company_id: string;
      tenant_id: string | null;
      status: string | null;
    }>(
      `SELECT id, company_id, NULLIF(TRIM(tenant_id), '') AS tenant_id, status::text AS status
       FROM public.recruitment_candidates WHERE ${candFilters.join(' AND ')} LIMIT 1;`,
      candValues,
    );
    if (!candRes.rows[0]) {
      throw new ApiException(
        'HRM-REC-405',
        'Candidate not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const companyId = candRes.rows[0].company_id;
    const tenantId =
      candRes.rows[0].tenant_id?.trim() ||
      resolveHrmPersistTenantId(authorization, payload.company_id) ||
      masterTenantIdFromEnv();
    // VAL-REC-CNS-05 — soft-gate by current status ∈ EFF allows_interview_schedule (≠ one-active).
    const stageKey = candRes.rows[0].status?.trim();
    if (stageKey) {
      const stageCatalog = this.resolveRecPipelineStages();
      if (stageCatalog) {
        await stageCatalog.assertInterviewScheduleAllowed({
          companyId,
          stageKey,
          authorization,
        });
      }
    }
    const allowPast = await this.readInterviewCfgBoolean(
      companyId,
      CFG_ALLOW_PAST_INTERVIEW_SCHEDULE,
      false,
    );
    this.assertScheduledAtNotPastOrThrow(payload.scheduled_at, allowPast);
    const hasActiveRes = await this.db.query<{ id: string }>(
      `SELECT id
       FROM public.recruitment_interviews
       WHERE company_id = $1::text
         AND candidate_id = $2::uuid
         AND status IN ('scheduled', 'confirmed')
       LIMIT 1;`,
      [companyId, payload.candidate_id],
    );
    if (hasActiveRes.rows[0]) {
      await this.throwOneActiveConflict(companyId, payload.candidate_id);
    }
    try {
      const res = await this.db.query<InterviewRow>(
        `INSERT INTO public.recruitment_interviews
          (id, tenant_id, company_id, candidate_id, scheduled_at, interviewer, status)
         VALUES ($1, $2::text, $3::text, $4::uuid, $5::timestamptz, $6, 'scheduled')
         RETURNING ${INTERVIEW_RETURNING};`,
        [
          randomUUID(),
          tenantId,
          companyId,
          payload.candidate_id,
          payload.scheduled_at,
          payload.interviewer.trim(),
        ],
      );
      return res.rows[0];
    } catch (error) {
      if (this.isUniqueActiveInterviewViolation(error)) {
        await this.throwOneActiveConflict(companyId, payload.candidate_id);
      }
      throw error;
    }
  }

  /**
   * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-01
   * UPGRADE: transition matrix · no_show TERMINAL · cancel_reason CFG · soft status only
   */
  async updateInterviewStatus(
    interviewId: string,
    payload: UpdateInterviewStatusDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, requestedCompanyId);
    const peek = await this.db.query<{
      company_id: string;
      candidate_id: string;
      status: string;
    }>(
      `SELECT company_id::text AS company_id,
              candidate_id::text AS candidate_id,
              status::text AS status
       FROM public.recruitment_interviews WHERE id = $1::uuid LIMIT 1;`,
      [interviewId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-REC-406',
      mismatchCode: 'HRM-REC-409',
    });
    const targetRow = peek.rows[0];
    if (!targetRow) {
      throw new ApiException(
        'HRM-REC-406',
        'Interview not found',
        HttpStatus.NOT_FOUND,
      );
    }
    this.assertInterviewStatusTransitionOrThrow(
      targetRow.status,
      payload.status,
    );

    const cancelReason =
      typeof payload.cancel_reason === 'string'
        ? payload.cancel_reason.trim()
        : '';
    if (payload.status === 'cancelled') {
      const reasonRequired = await this.readInterviewCfgBoolean(
        targetRow.company_id,
        CFG_INTERVIEW_CANCEL_REASON_REQUIRED,
        false,
      );
      if (reasonRequired && !cancelReason) {
        throw new ApiException(
          'HRM-REC-IV-400-CANCEL-REASON',
          'Vui lòng nhập lý do hủy lịch phỏng vấn',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (this.isActiveInterviewStatus(payload.status)) {
      const conflict = await this.db.query<{ id: string }>(
        `SELECT id
         FROM public.recruitment_interviews
         WHERE company_id = $1::text
           AND candidate_id = $2::uuid
           AND status IN ('scheduled', 'confirmed')
           AND id <> $3::uuid
         LIMIT 1;`,
        [targetRow.company_id, targetRow.candidate_id, interviewId],
      );
      if (conflict.rows[0]) {
        await this.throwOneActiveConflict(
          targetRow.company_id,
          targetRow.candidate_id,
          'Không thể cập nhật vì ứng viên đã có lịch phỏng vấn đang hiệu lực khác',
        );
      }
    }

    const persistCancelReason =
      payload.status === 'cancelled' ? cancelReason || null : null;
    const values: unknown[] = [
      payload.status,
      persistCancelReason,
      interviewId,
    ];
    let res;
    try {
      res = await this.db.query<InterviewRow>(
        `UPDATE public.recruitment_interviews
         SET status = $1,
             cancel_reason = CASE WHEN $1 = 'cancelled' THEN $2 ELSE cancel_reason END,
             updated_at = NOW()
         WHERE id = $3::uuid
         RETURNING ${INTERVIEW_RETURNING};`,
        values,
      );
    } catch (error) {
      if (this.isUniqueActiveInterviewViolation(error)) {
        await this.throwOneActiveConflict(
          targetRow.company_id,
          targetRow.candidate_id,
          'Không thể cập nhật vì ứng viên đã có lịch phỏng vấn đang hiệu lực khác',
        );
      }
      throw error;
    }
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-REC-406',
        'Interview not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return res.rows[0];
  }

  /**
   * @CODE-MEMORY method · F-REC-IV-03 R-A reschedule — same ACTIVE id
   * WorkItem: PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-01
   * must_keep: never INSERT second ACTIVE · TERMINAL → INVALID-TRANSITION
   */
  async rescheduleInterview(
    interviewId: string,
    payload: RescheduleInterviewDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, requestedCompanyId);
    const peek = await this.db.query<{
      company_id: string;
      status: string;
      interviewer: string;
    }>(
      `SELECT company_id::text AS company_id,
              status::text AS status,
              interviewer
       FROM public.recruitment_interviews WHERE id = $1::uuid LIMIT 1;`,
      [interviewId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-REC-406',
      mismatchCode: 'HRM-REC-409',
    });
    const row = peek.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-REC-406',
        'Interview not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (!this.isActiveInterviewStatus(row.status)) {
      throw new ApiException(
        'HRM-REC-IV-400-INVALID-TRANSITION',
        'Chỉ được đổi lịch khi phỏng vấn đang hiệu lực',
        HttpStatus.BAD_REQUEST,
        { from_status: row.status },
      );
    }
    const allowPast = await this.readInterviewCfgBoolean(
      row.company_id,
      CFG_ALLOW_PAST_INTERVIEW_SCHEDULE,
      false,
    );
    this.assertScheduledAtNotPastOrThrow(payload.scheduled_at, allowPast);

    const interviewer =
      typeof payload.interviewer === 'string' && payload.interviewer.trim()
        ? payload.interviewer.trim()
        : row.interviewer;
    const values: unknown[] = [payload.scheduled_at, interviewer, interviewId];
    const res = await this.db.query<InterviewRow>(
      `UPDATE public.recruitment_interviews
       SET scheduled_at = $1::timestamptz,
           interviewer = $2,
           updated_at = NOW()
       WHERE id = $3::uuid
         AND status IN ('scheduled', 'confirmed')
       RETURNING ${INTERVIEW_RETURNING};`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-REC-IV-400-INVALID-TRANSITION',
        'Chỉ được đổi lịch khi phỏng vấn đang hiệu lực',
        HttpStatus.BAD_REQUEST,
      );
    }
    return res.rows[0];
  }
}
