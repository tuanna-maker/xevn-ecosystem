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
 * @CODE-MEMORY-CHANGE 2026-08-22 FIX-REC-EVAL-SCOPE-MAIN-HOLDING
 * change_mode: FIX
 * What: createCandidateEvaluation — resolveHrmListScope from requested company_id (main),
 *       not persist slug (holding); persist eval company_id = Lane A UV partition
 * Why: Group CEO Chốt Pass/Fail → 409 «Resource company_id is outside token scope» when UV on trsport
 * must_keep: neo recruitment_candidate_id · Pass/Fail · ROUND-GATE · U65
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
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 PO-E2E-SPINE-01-BE-CAND-DTO-01
 * ADD candidates pool columns + persist FE form fields (position, rating, expected_start_date,
 * nationality, hometown, marital_status) on createCandidatePool / updateCandidatePool.
 * Clears QA HP-04 HRM-VAL-001 forbidNonWhitelisted from CandidateFormDialog POST.
 * change_mode: ADD · must_keep G-DB-01 hire employee_id · dual catalog F1–F10 · LV/AUTH/EMP/CAT untouched · U65
 * Evidence: docs/qa/evidence/po-e2e-spine-01-be-cand-dto-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 D-U84-REC-REQ-TMDV-JD-CATALOG-ASSERT-01
 * change_mode: FIX
 * What: assertJdPositionCodeInCatalog uses resolveHrmSettingsCatalogCompanyId(+auth) so Group CEO
 *       persist company_id=trsport validates position_code against holding job_titles (picker parity).
 * Why:  QA U78-U84-PRIMARY-REC-REQ-TMDV — FE picker DRIVER_LEAD (holding) → POST 400 HRM-REC-JD-POS.
 * must_keep: JD row persist under member slug · invent-only reject · REC-PLAN WF · U65 no seed
 * Evidence: docs/qa/evidence/d-u84-rec-req-tmdv-jd-catalog-assert-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-DYNAMIC-BE-01
 * ADD GET job-templates/:id (F-JD-03) scope_parity with list; values_json + layout_snapshot_json v2;
 * bridge title/code/position/job_description/requirements from values; FORBIDDEN job_postings write.
 * change_mode: ADD · must_keep YCTD job_template_id · HRM-REC-JD-POS · U65 no UAT seed
 * TechSpec: ARCH-02 §2.10 · GROUP-ARCH snapshot v2 · Evidence: po-hrm-jd-dynamic-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-YCTD-REF-BE-01
 * ADD bindable=true / for=yctd list filter (Hiệu lực only) + preview=yctd STATUS gate.
 * change_mode: ADD · must_keep soft FK job_template_id · no job_postings JD SoT · U65 no seed
 * SRS: FR-UC-BP-REC-02 Diễn biến 1a–1d · API-01 F-YCTD-JD-01/02
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01
 * ADD F-REC-APP-02 consumer: to_stage ∈ F-REC-CAT-EFF-01 when catalog >0 → else HRM-REC-STAGE-UNKNOWN.
 * Hire target uses catalog isHiredOutcome / hiredOutcomeKey (compat `hired` when empty).
 * change_mode: ADD · must_keep JD DnD · IV one-active · hire→EMP soft · YCTD · U65 no seed
 * Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-BE-01
 * ADD VAL-REC-CNS-02: createCandidatePool + updateCandidatePool(stage) assert ∈ EFF when >0.
 * ADD VAL-REC-CNS-05 soft-gate createInterview via allows_interview_schedule (≠ UNKNOWN · ≠ one-active).
 * RETAIN VAL-REC-CNS-01 APP-02 / updateCandidatePoolStage assert + jest.
 * change_mode: ADD · must_keep JD DnD · IV one-active · hire→EMP · U65 · recruitment_uat_ready=false
 * Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01
 * ADD Option A physical: months_data cell projection (need_hire) · GET by id · PUT upsert ·
 * approve cell lock · POST spawn-requests (HC-S1..S7) · YCTD headcount_cell_id/mode/target_month + UQ ·
 * DENY ns/dx dual SoT · DENY invent /rec/headcount-plans · REC-03 OUT · honesty false · U65 no seed.
 * change_mode: ADD/UPGRADE · must_keep XBOS submit-workflow · job_requisitions YCTD/JD · UF-HRM-12 · soft-delete
 * Spec: API-01 + DATA-01 CONFIRMED · BA O1–O5 · SA Option A
 * Evidence: docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-02
 * change_mode: FIX (narrow)
 * What: Tách replacePlanDepartments thành buildPlanDepartmentWritePlan (validate, không ghi DB)
 *       + writePlanDepartments (ghi trong transaction). createRecruitmentPlan / upsertRecruitmentPlan
 *       validate trước, rồi ghi header + lưới trong một withTransaction.
 * Why:  Defect P0 R-REC-HC-PUT-LOCKED-WIPE — PUT sau khi duyệt trả 409 HRM-HC-CELL-LOCKED nhưng
 *       DELETE recruitment_plan_departments/positions đã chạy trước assert ⇒ mất toàn bộ lưới
 *       (ô need_hire_approved biến mất, spawn không còn nguồn).
 * Spec: AC-REC-HC-01-EX-04 · BR-REC-01-LOCK · API-01 F-REC-HC-01 bước (7) CELL-LOCKED
 * must_keep: BE-01 behavior (jest 50) · allow_override vẫn ghi được (BA O3) · spawn idempotency ·
 *   U19 scope parity · XBOS submit-workflow · soft-delete · REC-03 OUT · U65 no seed
 * Evidence: docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-be-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BE-01
 * change_mode: FIX (narrow)
 * What: buildPlanDepartmentWritePlan giờ defer mint (normalizeMonthsData mintWhenMissing:false),
 *       rồi reuse cell_id theo natural key kể cả khi payload omit cell_id; chỉ mint lần đầu cho NK
 *       chưa tồn tại. Payload cell_id lạ cùng NK ⇒ 409 HRM-HC-CELL-ID-MISMATCH.
 * Why:  Residual P2 R-REC-HC-OVERRIDE-CELLID — normalize mint-trước-reuse làm nhánh reuse chết,
 *       PUT allow_override omit cell_id sinh cell_id mới ⇒ YCTD headcount_cell_id mồ côi, gãy BR-BP-HC-04.
 * Spec: BA-01 Option A LOCKED · BR-REC-HC-CELL-STABLE / MINT-ONCE / ID-MISMATCH · AC-REC-HC-CELL-01*
 * must_keep: 409 HRM-HC-CELL-LOCKED + no-wipe (BE-02) · spawn idempotency BR-BP-HC-04 ·
 *   O3 no silent YCTD overwrite · U19 scope parity · REC-02 OUT · U65 no seed · honesty false
 * Evidence: docs/qa/evidence/po-hrm-mvp-gd1-rec-hc-override-cellid-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-BE-01
 * RETAIN spawn target_month = firstOfMonthIso (YYYY-MM-01) — aligned with
 * normalizeTargetMonthOrThrow on manual create; no client month string on spawn path.
 * change_mode: FIX (comment+align) · residual R-REC-02-TARGET-MONTH-DATE
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-00-CLUSTER-BE-01
 * UPGRADE job_description_templates Option A O2: ADD status draft|active|retired + CHK + bridge + backfill;
 * F-JD-01 list status/filter · bindable status=active∧is_active; F-JD-02 create force draft;
 * ADD POST publish required-on-layout PUB-* mint; DELETE soft-retire→retired; RETAIN CODE-DUP · YCTD-STATUS · U19.
 * change_mode: UPGRADE · must_keep soft FK · no Nest /rec dual · no second JD table · no seed · honesty false
 * Spec: API-01 + DATA-01 CONFIRMED · UC-BP-REC-00
 * Evidence: docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-04-CLUSTER-BE-01
 * UPGRADE GET candidates-pool F-REC-CV-SCAN-01 — YCTD context + title+skill/exp on LIVE fields;
 * DENY mega-EAV / second CV SoT · U19 list=get · empty 200.
 * change_mode: UPGRADE · UC-BP-REC-04 · API-01 §5.1
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01
 * UPGRADE candidate_evaluations YCTD neo + Pass/Fail + ROUND-GATE + soft archived_at;
 * UPGRADE evaluation_criteria_templates archived_at soft-retire; DENY hard wipe SoT;
 * mint HRM-REC-EVAL-* · RETAIN APP-02 sole stage · pool-only = FR06_LEGACY_POOL read-only.
 * change_mode: UPGRADE · UC-BP-REC-06 · API-01 F-REC-APP-03 · DATA-01 §5
 * DENY: Nest /rec · second eval SoT · Campaign · seed · honesty · claim pool DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-17 REC-JP-JD-LINK-BE-01
 * ADD jd_template_id UUID FK + jd_snapshot_json JSONB to job_postings (ALTER TABLE);
 * ADD createJobPosting JD load + snapshot; ADD getJobPosting(); UPGRADE listJobPostings LEFT JOIN JDT.
 * jd_template_id nullable — backward compat for existing postings without JD.
 * change_mode: ADD · must_keep description/requirements/benefits cols (nullable, backward compat) ·
 *   no FR-RC-01 rebind · U65 no seed · YCTD job_requisitions untouched
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandPayrollPeriodCompanyIds,
  MASTER_TENANT_ID,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  resolveHrmSettingsCatalogCompanyId,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbService, type HrmDbQueryFn } from '../db/hrm-db.service';
import { ensureHrmTenantIdColumns } from '../common/hrm-tenant-scope-schema';
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
  JdDynamicService,
  type JdLayoutSnapshotV2,
} from './jd-dynamic.service';
import { RecPipelineStageService } from './rec-pipeline-stage.service';
import {
  assertCellUnlockedForMutate,
  assertNoLegacyDualSotWriters,
  firstOfMonthIso,
  HRM_HC_ACTIVATION_CFG,
  HRM_HC_CELL_ID_MISMATCH,
  HRM_HC_KEY_UNKNOWN,
  HRM_HC_SPAWN_PLAN_NOT_APPROVED,
  HRM_HC_SPAWN_QTY_DRIFT,
  HRM_HC_VAL_400,
  isPlanApprovedStatus,
  lockNeedHireCells,
  normalizeMonthsData,
  projectMonthsForApi,
  toPersistCell,
  type HeadcountCell,
} from './recruitment-plan-headcount';
import {
  RecruitmentWorkflowBridge,
  WF_BUSINESS_TYPE_HRM_CANDIDATE,
  WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN,
} from './recruitment-workflow.bridge';
import {
  assertYctdJdBindableOrThrow,
  bridgeIsActiveForStatus,
  isYctdBindableListQuery,
  normalizeJdTemplateStatus,
  toYctdBindableListItem,
  toYctdJdPreview,
  type JdTemplateStatus,
  type YctdJdTemplateBindRow,
} from './yctd-jd-bind';
import {
  assertYctdOpenForInternalScanOrThrow,
  backfillLegacyYctdHeadcountMode,
} from './yctd-requisition-gates';
import { ensureSpineRecruitmentCandidateFromPool } from './pool-spine-bridge';
import {
  ACTIVE_IV_FOR_EVAL,
  CFG_EVAL_ALLOW_DRAFT,
  HRM_REC_EVAL_404,
  HRM_REC_EVAL_LEGACY_READONLY,
  HRM_REC_EVAL_NEO_REQUIRED,
  HRM_REC_EVAL_PASSFAIL_REQUIRED,
  HRM_REC_EVAL_ROUND_GATE,
  TERMINAL_IV_FOR_EVAL,
} from './rec-mail-eval.constants';
export const HRM_REC_JD_POS = 'HRM-REC-JD-POS';
/** E1-A MD-BIND — Lane B job_postings position_key (≠ FR-RC-01). */
export const HRM_JP_POS_KEY = 'HRM-JP-POS-KEY';
/** E1-A MD-BIND — Lane B headcount_proposals position_key (≠ FR-RC-01). */
export const HRM_HCP_POS_KEY = 'HRM-HCP-POS-KEY';

/** Validated position row ready to persist (no DB write happened yet). */
type PlanPositionWrite = {
  id: string;
  name: string;
  positionKey: string | null;
  cells: HeadcountCell[];
  sortOrder: number;
};

/** Validated department row ready to persist (no DB write happened yet). */
type PlanDepartmentWrite = {
  id: string;
  name: string;
  departmentKey: string | null;
  sortOrder: number;
  positions: PlanPositionWrite[];
};

@Injectable()
export class RecruitmentCatalogService {
  constructor(
    private readonly db: HrmDbService,
    private readonly recruitmentWorkflowBridge: RecruitmentWorkflowBridge,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
    @Optional() private readonly jdDynamic?: JdDynamicService,
    /** F-REC-CAT-EFF-01 — optional for legacy specs; production injects RecPipelineStageService. */
    @Optional() private readonly recPipelineStages?: RecPipelineStageService,
    @Optional() private readonly moduleRef?: ModuleRef,
  ) {}

  private resolveRecPipelineStages(): RecPipelineStageService | undefined {
    if (this.recPipelineStages) return this.recPipelineStages;
    if (!this.moduleRef) return undefined;
    try {
      return this.moduleRef.get(RecPipelineStageService, { strict: false });
    } catch {
      return undefined;
    }
  }

  private resolveCatalogTenantId(tenantId?: string): string {
    return tenantId?.trim() || masterTenantIdFromEnv() || MASTER_TENANT_ID;
  }

  /**
   * FR-HRM-RC-JD-01 / BR-HRM-MD-01 — position_code ∈ job_titles (AC-SET-FS-03).
   * Returns catalog label for optional position_name denormalize.
   * Catalog partition = settings picker (resolveHrmSettingsCatalogCompanyId) — not persist slug alone.
   */
  private async assertJdPositionCodeInCatalog(opts: {
    /** Persist / OU company_id (may be member slug e.g. trsport). */
    companyId: string;
    positionCode: string;
    tenantId?: string;
    authorization?: string;
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
    const tenantId = this.resolveCatalogTenantId(opts.tenantId);
    // Xử lý: Group CEO OU=trsport → holding job_titles (parity FE settings overview U39).
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      opts.authorization,
      tenantId,
      opts.companyId,
    );
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId,
      companyId: catalogCompanyId,
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
    // PO-E2E-SPINE-01-BE-CAND-DTO-01 — HDSD CandidateFormDialog columns (Supabase Row parity).
    await this.db.query(`
      ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS position TEXT NULL;
      ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS rating INTEGER NULL DEFAULT 0;
      ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS expected_start_date DATE NULL;
      ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS nationality TEXT NULL;
      ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS hometown TEXT NULL;
      ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS marital_status TEXT NULL;
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
    // PO-HRM-JD-DYNAMIC-BE-01 — dynamic values + Q6 layout snapshot (ARCH-02 §3.4).
    await this.db.query(
      `ALTER TABLE public.job_description_templates ADD COLUMN IF NOT EXISTS values_json JSONB NULL`,
    );
    await this.db.query(
      `ALTER TABLE public.job_description_templates ADD COLUMN IF NOT EXISTS layout_snapshot_json JSONB NULL`,
    );
    await this.db.query(
      `ALTER TABLE public.job_description_templates ADD COLUMN IF NOT EXISTS layout_version INTEGER NOT NULL DEFAULT 1`,
    );
    // PO-HRM-MVP-GD1-REC-00-CLUSTER-BE-01 — O2 status + is_active bridge (DATA-01).
    await this.db.query(
      `ALTER TABLE public.job_description_templates ADD COLUMN IF NOT EXISTS status TEXT`,
    );
    await this.db.query(`
      UPDATE public.job_description_templates
         SET status = 'active'
       WHERE status IS NULL AND is_active IS TRUE
    `);
    await this.db.query(`
      UPDATE public.job_description_templates t
         SET status = 'retired'
       WHERE t.status IS NULL
         AND t.is_active IS FALSE
         AND EXISTS (
           SELECT 1 FROM public.job_requisitions r
            WHERE r.job_template_id = t.id::text
         )
    `);
    await this.db.query(`
      UPDATE public.job_description_templates
         SET status = 'draft'
       WHERE status IS NULL
    `);
    await this.db.query(`
      ALTER TABLE public.job_description_templates
        ALTER COLUMN status SET DEFAULT 'draft'
    `);
    await this.db.query(`
      ALTER TABLE public.job_description_templates
        ALTER COLUMN status SET NOT NULL
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.job_description_templates
          DROP CONSTRAINT IF EXISTS chk_job_description_templates_status;
        ALTER TABLE public.job_description_templates
          ADD CONSTRAINT chk_job_description_templates_status
          CHECK (status IN ('draft', 'active', 'retired'));
        ALTER TABLE public.job_description_templates
          DROP CONSTRAINT IF EXISTS chk_job_description_templates_status_active_bridge;
        ALTER TABLE public.job_description_templates
          ADD CONSTRAINT chk_job_description_templates_status_active_bridge
          CHECK (
            (status = 'active' AND is_active IS TRUE)
            OR (status IN ('draft', 'retired') AND is_active IS FALSE)
          );
      END $$;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_job_description_templates_company_status
        ON public.job_description_templates (company_id, status)
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_job_description_templates_bindable
        ON public.job_description_templates (company_id)
        WHERE status = 'active' AND is_active IS TRUE
    `);
    // E1-A MD-BIND Layer A — Lane B leftover position_key (not FR-RC-01 SoT).
    await this.db.query(`
      ALTER TABLE public.job_postings
        ADD COLUMN IF NOT EXISTS position_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_postings
        ADD COLUMN IF NOT EXISTS department_key TEXT NULL;
    `);
    // REC-JP-JD-LINK-BE-01 — link job_postings to JD template; snapshot captures JD at link time.
    // jd_template_id nullable: existing postings without JD remain valid (backward compat).
    await this.db.query(`
      ALTER TABLE public.job_postings
        ADD COLUMN IF NOT EXISTS jd_template_id UUID REFERENCES public.job_description_templates(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS jd_snapshot_json JSONB;
    `);
    await this.db.query(`
      ALTER TABLE public.headcount_proposals
        ADD COLUMN IF NOT EXISTS position_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.headcount_proposals
        ADD COLUMN IF NOT EXISTS department_key TEXT NULL;
    `);
    // PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01 — Option A ADD cols (DATA-01 §4–§5–§7).
    await this.db.query(`
      ALTER TABLE public.recruitment_plans
        ADD COLUMN IF NOT EXISTS submitted_by_dept_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.recruitment_plans
        ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.recruitment_plans
        ADD COLUMN IF NOT EXISTS approved_by TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.recruitment_plans
        ADD COLUMN IF NOT EXISTS activation_mode TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.recruitment_plan_departments
        ADD COLUMN IF NOT EXISTS department_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.recruitment_plan_positions
        ADD COLUMN IF NOT EXISTS position_key TEXT NULL;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_recruitment_plan_departments_plan_dept_key
      ON public.recruitment_plan_departments (plan_id, lower(department_key))
      WHERE department_key IS NOT NULL;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_recruitment_plan_positions_dept_pos_key
      ON public.recruitment_plan_positions (department_id, lower(position_key))
      WHERE position_key IS NOT NULL;
    `);
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
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_job_requisitions_headcount_mode
      ON public.job_requisitions (company_id, headcount_mode);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_job_requisitions_recruitment_plan_id
      ON public.job_requisitions (recruitment_plan_id)
      WHERE recruitment_plan_id IS NOT NULL;
    `);
    // PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01 — Wave-2 columns (shared with RecruitmentService.ensureSchema).
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
    // PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01 §7 — O4 legacy uplift (shared with RecruitmentService).
    await backfillLegacyYctdHeadcountMode(this.db);
    // PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01 — DATA-01 §5: YCTD neo + soft-delete on eval.
    await this.db.query(`
      ALTER TABLE public.candidate_evaluations
        ADD COLUMN IF NOT EXISTS recruitment_candidate_id UUID NULL;
    `);
    await this.db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'fk_cand_eval_recruitment_candidate'
        ) THEN
          ALTER TABLE public.candidate_evaluations
            ADD CONSTRAINT fk_cand_eval_recruitment_candidate
            FOREIGN KEY (recruitment_candidate_id)
            REFERENCES public.recruitment_candidates (id);
        END IF;
      EXCEPTION
        WHEN undefined_table THEN NULL;
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      ALTER TABLE public.candidate_evaluations
        ADD COLUMN IF NOT EXISTS application_id UUID NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.candidate_evaluations
        ADD COLUMN IF NOT EXISTS template_id UUID NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.candidate_evaluations
        ADD COLUMN IF NOT EXISTS salary_recommendation NUMERIC NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.candidate_evaluations
        ADD COLUMN IF NOT EXISTS evaluated_at TIMESTAMPTZ NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.candidate_evaluations
        ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.candidate_evaluations
        ALTER COLUMN candidate_id DROP NOT NULL;
    `);
    await this.db.query(`
      DO $$
      BEGIN
        ALTER TABLE public.candidate_evaluations
          DROP CONSTRAINT IF EXISTS chk_candidate_evaluations_yctd_or_legacy;
        ALTER TABLE public.candidate_evaluations
          ADD CONSTRAINT chk_candidate_evaluations_yctd_or_legacy CHECK (
            recruitment_candidate_id IS NOT NULL
            OR application_id IS NOT NULL
            OR candidate_id IS NOT NULL
          );
      EXCEPTION
        WHEN undefined_table THEN NULL;
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_cand_eval_rc_id
      ON public.candidate_evaluations (recruitment_candidate_id, evaluated_at DESC NULLS LAST)
      WHERE archived_at IS NULL AND recruitment_candidate_id IS NOT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_cand_eval_company_result
      ON public.candidate_evaluations (company_id, result)
      WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.evaluation_criteria_templates
        ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;
    `);
    await ensureHrmTenantIdColumns((sql) => this.db.query(sql));
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
    const code =
      typeof opts.positionKey === 'string' ? opts.positionKey.trim() : '';
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
    const tenantId = this.resolveCatalogTenantId(opts.tenantId);
    let hit: { code: string; label: string } | undefined;
    let lastError: unknown;
    for (const catalogKey of ['job_titles', 'positions', 'employee_positions']) {
      try {
        hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
          tenantId,
          companyId: opts.companyId,
          catalogKey,
          code,
          errorCode: opts.errorCode,
          errorMessage: `position_key '${code}' is not in ${catalogKey} catalog`,
        });
        break;
      } catch (err) {
        lastError = err;
      }
    }
    
    if (!hit) {
      throw new ApiException(
        opts.errorCode,
        `position_key '${code}' is not in job_titles, positions, or employee_positions catalog (free-text SoT forbidden)`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return { code: hit.code, label: hit.label };
  }

  /**
   * @CODE-MEMORY method · Lane B job_postings — KHÔNG FR-HRM-RC-01 SoT (F1/F6)
   * TechSpec: §17.6.1 · must_keep §17.6.4 · cấm bind headcount YCTD vào đây
   */
  async listJobPostings(
    query: ListJobPostingsQueryDto,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, query.company_id);
    const filters: string[] = [];
    const values: unknown[] = [];
    // Use jp. prefix to disambiguate after LEFT JOIN with jdt (both tables have company_id).
    if (scope.companyIds.length === 1) {
      values.push(scope.companyIds[0]);
      filters.push(`jp.company_id = $${values.length}::text`);
    } else {
      values.push(scope.companyIds);
      filters.push(`jp.company_id = ANY($${values.length}::text[])`);
    }
    if (query.status) {
      values.push(query.status);
      filters.push(`jp.status = $${values.length}`);
    }
    const res = await this.db.query(
      `SELECT jp.*,
        jdt.code AS jd_code,
        jdt.title AS jd_title,
        COALESCE(jp.jd_snapshot_json, jdt.values_json) AS jd_content
       FROM public.job_postings jp
       LEFT JOIN public.job_description_templates jdt ON jdt.id = jp.jd_template_id
       WHERE ${filters.join(' AND ')} ORDER BY jp.created_at DESC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  /**
   * @CODE-MEMORY method · Lane B GET job-postings/:id — scope_parity with listJobPostings
   * REC-JP-JD-LINK-BE-01: JOIN with JD template to return jd_code / jd_title / jd_content.
   */
  async getJobPosting(
    jobPostingId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['jp.id = $1::uuid'];
    const values: unknown[] = [jobPostingId];
    // Use jp. prefix to disambiguate after LEFT JOIN with jdt (both tables have company_id).
    if (scope.companyIds.length === 1) {
      values.push(scope.companyIds[0]);
      filters.push(`jp.company_id = $${values.length}::text`);
    } else {
      values.push(scope.companyIds);
      filters.push(`jp.company_id = ANY($${values.length}::text[])`);
    }
    const res = await this.db.query(
      `SELECT jp.*,
        jdt.code AS jd_code,
        jdt.title AS jd_title,
        COALESCE(jp.jd_snapshot_json, jdt.values_json) AS jd_content
       FROM public.job_postings jp
       LEFT JOIN public.job_description_templates jdt ON jdt.id = jp.jd_template_id
       WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-REC-JP-404', 'Job posting not found', 404);
    }
    return res.rows[0];
  }

  /**
   * @CODE-MEMORY method · Lane B create job_postings — menu JD leftover (F1/F6/F9)
   * must_keep §17.6.4 — FR-RC-01 chỉ job_requisitions
   */
  async createJobPosting(
    payload: CreateJobPostingDto & { jd_template_id?: string },
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
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
    // REC-JP-JD-LINK-BE-01 — load JD template and capture snapshot at link time.
    const jdTemplateId: string | null = payload.jd_template_id?.trim() || null;
    let jdSnapshot: Record<string, unknown> | null = null;
    if (jdTemplateId) {
      const jdRow = await this.db.queryOne<{
        id: string;
        code: string;
        title: string;
        values_json: unknown;
      }>(
        `SELECT id::text AS id, code, title, values_json
         FROM public.job_description_templates
         WHERE id = $1::uuid AND status <> 'retired'`,
        [jdTemplateId],
      );
      if (!jdRow) {
        throw new ApiException(
          'HRM-REC-JP-JD-404',
          `JD template not found: ${jdTemplateId}`,
          404,
        );
      }
      jdSnapshot = {
        id: jdTemplateId,
        code: jdRow.code,
        title: jdRow.title,
        values_json: jdRow.values_json,
      };
    }
    const id = randomUUID();
    const res = await this.db.query(
      `INSERT INTO public.job_postings (
        id, company_id, title, department, department_key, position, position_key, employment_type, work_location,
        salary_min, salary_max, is_salary_visible, description, requirements, benefits,
        headcount, deadline, priority, status, jd_template_id, jd_snapshot_json
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17::date, $18, $19, $20::uuid, $21::jsonb
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
        jdTemplateId,
        jdSnapshot !== null ? JSON.stringify(jdSnapshot) : null,
      ],
    );
    return res.rows[0];
  }

  async deleteJobPosting(
    id: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query(
      `DELETE FROM public.job_postings WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-REC-JP-404',
        'Job posting not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return { id };
  }

  /**
   * @CODE-MEMORY method · Lane B candidates pool — KHÔNG FR-HRM-RC-03 primary SoT (F2)
   * HTTP: GET …/candidates-pool · table public.candidates
   * INT-01 hire surface = pool stage (G-DB-01) — không đồng nghĩa FR-RC-03 spine
   * must_keep §17.6.4 — FR-RC-03→recruitment_candidates (+ requisition_id)
   *
   * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-04-CLUSTER-BE-01
   * UPGRADE F-REC-CV-SCAN-01: optional requisition_id / for=internal_scan → YCTD receivable;
   * title (position*) + skill/exp filters on LIVE position|notes; exact-title-only FAIL when scan search;
   * empty 200 hợp lệ; U19 same resolveHrmListScope as get-by-id.
   */
  async listCandidatesTable(
    query: ListCandidatesTableQueryDto,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, query.company_id);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope);

    const forInternalScan = query.for === 'internal_scan';
    const titleRaw =
      (query.position_code ?? '').trim() ||
      (query.position ?? '').trim() ||
      (query.q_position ?? '').trim();
    const skillRaw = (query.skill ?? '').trim() || (query.q_skill ?? '').trim();
    const experienceRaw = (query.experience ?? '').trim();
    const hasTitle = titleRaw.length > 0;
    const hasSkillExp =
      skillRaw.length > 0 ||
      experienceRaw.length > 0 ||
      query.experience_min_years !== undefined;
    const searchSubmitted = hasTitle || hasSkillExp;

    if (query.requisition_id || forInternalScan) {
      if (query.requisition_id) {
        const reqFilters: string[] = ['id = $1::uuid'];
        const reqValues: unknown[] = [query.requisition_id];
        pushCompanyIdFilter(reqFilters, reqValues, scope);
        const yctd = await this.db.query<{
          id: string;
          company_id: string;
          status: string | null;
          headcount_mode: string | null;
        }>(
          `SELECT id::text AS id, company_id::text AS company_id, status, headcount_mode
           FROM public.job_requisitions
           WHERE ${reqFilters.join(' AND ')}
           LIMIT 1`,
          reqValues,
        );
        assertResourceInHrmScope(yctd.rows[0], scope, {
          notFoundCode: 'HRM-REC-404',
          mismatchCode: 'HRM-REC-409',
        });
        assertYctdOpenForInternalScanOrThrow(yctd.rows[0]);
      }
    }

    if (forInternalScan && searchSubmitted && (!hasTitle || !hasSkillExp)) {
      throw new ApiException(
        'HRM-REC-400',
        'Quét kho cần tiêu chí chức danh và ít nhất một chiều kỹ năng hoặc kinh nghiệm',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (query.stage) {
      values.push(query.stage);
      filters.push(`stage = $${values.length}`);
    }
    if (hasTitle) {
      values.push(`%${titleRaw.toLowerCase()}%`);
      filters.push(`lower(COALESCE(position, '')) LIKE $${values.length}`);
    }
    if (skillRaw) {
      values.push(`%${skillRaw.toLowerCase()}%`);
      filters.push(
        `(lower(COALESCE(notes, '')) LIKE $${values.length} OR lower(COALESCE(position, '')) LIKE $${values.length})`,
      );
    }
    if (experienceRaw) {
      values.push(`%${experienceRaw.toLowerCase()}%`);
      filters.push(`lower(COALESCE(notes, '')) LIKE $${values.length}`);
    }
    if (query.experience_min_years !== undefined) {
      // LIVE fields have no years column — map onto notes text (Q-REC-CV-SKILL-FIELD).
      values.push(`%${String(query.experience_min_years)}%`);
      filters.push(`lower(COALESCE(notes, '')) LIKE $${values.length}`);
    }

    const where = filters.length > 0 ? filters.join(' AND ') : 'TRUE';
    const res = await this.db.query(
      `SELECT * FROM public.candidates WHERE ${where} ORDER BY created_at DESC;`,
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
  async getCandidatePoolById(
    candidateId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [candidateId];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query(
      `SELECT * FROM public.candidates WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-REC-CP-404',
        'Candidate not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return res.rows[0];
  }

  async listCandidateApplications(
    companyId: string,
    authorization?: string,
    jobPostingId?: string,
  ) {
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
    resolveHrmListScope(authorization, companyId);
    const company = resolveHrmPersistCompanyIdText(authorization, companyId);
    const stage = payload.stage ?? 'applied';
    // F-REC-APP-02 — when catalog >0, initial stage must ∈ effective.
    const stageCatalog = this.resolveRecPipelineStages();
    if (stageCatalog && payload.stage?.trim()) {
      await stageCatalog.assertStageInEffectiveCatalog({
        companyId: company,
        stageKey: stage,
        authorization,
      });
    }
    const res = await this.db.query(
      `INSERT INTO public.candidate_applications (id, candidate_id, job_posting_id, company_id, stage)
       VALUES ($1, $2::uuid, $3::uuid, $4, $5)
       ON CONFLICT (candidate_id, job_posting_id) DO UPDATE SET stage = EXCLUDED.stage, updated_at = NOW()
       RETURNING *;`,
      [
        randomUUID(),
        payload.candidate_id,
        payload.job_posting_id,
        company,
        stage,
      ],
    );
    return res.rows[0];
  }

  async deleteCandidateApplication(
    applicationId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [applicationId];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query(
      `DELETE FROM public.candidate_applications WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    if (!res.rows[0])
      throw new ApiException(
        'HRM-REC-CA-404',
        'Application not found',
        HttpStatus.NOT_FOUND,
      );
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
    pushCompanyIdFilter(peekFilters, peekValues, scope);
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
    if (!app)
      throw new ApiException(
        'HRM-REC-CA-404',
        'Application not found',
        HttpStatus.NOT_FOUND,
      );

    // F-REC-APP-02 / BR-PLT-02 — catalog >0 ⇒ to_stage ∈ effective else HRM-REC-STAGE-UNKNOWN.
    const stageCatalog = this.resolveRecPipelineStages();
    const catalogHit = stageCatalog
      ? await stageCatalog.assertStageInEffectiveCatalog({
          companyId: app.company_id || companyId,
          stageKey: stage,
          authorization,
        })
      : null;
    const hiredOutcomeKey = catalogHit?.isHiredOutcome
      ? catalogHit.stageKey
      : catalogHit
        ? null
        : undefined;
    const treatAsHired = catalogHit
      ? Boolean(catalogHit.isHiredOutcome)
      : isHiredStage(stage, hiredOutcomeKey);

    // FR-HRM-INT-01 #5 — application hired inherits candidate→employee soft link.
    if (treatAsHired) {
      const linkedEmployeeId = await assertHireEmployeeLinkOrThrow(
        this.db,
        app.candidate_id,
        app.cand_company_id,
        {
          existingEmployeeId: app.cand_employee_id,
          explicitEmployeeId: employeeId,
        },
      );
      const hiredKey = catalogHit?.stageKey ?? 'hired';
      await this.db.query(
        `UPDATE public.candidates
         SET stage = $2, employee_id = $3::uuid, updated_at = NOW()
         WHERE id = $1::uuid`,
        [app.candidate_id, hiredKey, linkedEmployeeId],
      );
    }

    const filters = ['id = $1::uuid'];
    const values: unknown[] = [applicationId, stage];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query(
      `UPDATE public.candidate_applications SET stage = $2, updated_at = NOW() WHERE ${filters.join(' AND ')} RETURNING *;`,
      values,
    );
    if (!res.rows[0])
      throw new ApiException(
        'HRM-REC-CA-404',
        'Application not found',
        HttpStatus.NOT_FOUND,
      );
    return res.rows[0];
  }

  async listRecruitmentPlans(
    companyId: string,
    authorization?: string,
    query?: { year?: number | string },
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope);
    const yearRaw =
      query?.year !== undefined && query?.year !== null && query?.year !== ''
        ? Number(query.year)
        : NaN;
    if (Number.isFinite(yearRaw) && yearRaw > 0) {
      values.push(Math.trunc(yearRaw));
      filters.push(`year = $${values.length}`);
    }
    const plansRes = await this.db.query(
      `SELECT * FROM public.recruitment_plans WHERE ${filters.join(' AND ')} ORDER BY created_at DESC;`,
      values,
    );
    const plans = plansRes.rows as Array<
      Record<string, unknown> & { id: string }
    >;
    if (plans.length === 0) {
      return { total: 0, data: [] };
    }
    const data = await this.hydrateRecruitmentPlans(plans);
    return { total: data.length, data };
  }

  /**
   * F-REC-HC-01 GET by id — same resolveHrmListScope as list (U19 scope_parity).
   */
  async getRecruitmentPlanById(
    planId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    const existingRes = await this.db.query(
      `SELECT * FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`,
      [planId],
    );
    const existing = existingRes.rows[0] as
      | (Record<string, unknown> & { id: string; company_id: string })
      | undefined;
    if (!existing) {
      throw new ApiException(
        'HRM-REC-PLAN-404',
        'Recruitment plan not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-PLAN-404',
      mismatchCode: 'HRM-REC-PLAN-409',
    });
    const [hydrated] = await this.hydrateRecruitmentPlans([existing]);
    return hydrated;
  }

  private async hydrateRecruitmentPlans(
    plans: Array<Record<string, unknown> & { id: string }>,
  ): Promise<Array<Record<string, unknown>>> {
    const planIds = plans.map((p) => p.id);
    const deptsRes = await this.db.query(
      `SELECT * FROM public.recruitment_plan_departments
       WHERE plan_id = ANY($1::uuid[]) ORDER BY sort_order ASC;`,
      [planIds],
    );
    const depts = deptsRes.rows as Array<
      Record<string, unknown> & { id: string; plan_id: string }
    >;
    const deptIds = depts.map((d) => d.id);
    let positions: Array<
      Record<string, unknown> & { department_id: string; months_data?: unknown }
    > = [];
    if (deptIds.length > 0) {
      const posRes = await this.db.query(
        `SELECT * FROM public.recruitment_plan_positions
         WHERE department_id = ANY($1::uuid[]) ORDER BY sort_order ASC;`,
        [deptIds],
      );
      positions = posRes.rows as Array<
        Record<string, unknown> & {
          department_id: string;
          months_data?: unknown;
        }
      >;
    }
    return plans.map((plan) => {
      const planApproved = isPlanApprovedStatus(plan.status);
      const planDepts = depts
        .filter((d) => d.plan_id === plan.id)
        .map((dept) => ({
          ...dept,
          positions: positions
            .filter((p) => p.department_id === dept.id)
            .map((pos) => {
              const months = projectMonthsForApi(pos.months_data, planApproved);
              return {
                ...pos,
                months,
                months_data: months.map(toPersistCell),
              };
            }),
        }));
      return { ...plan, departments: planDepts };
    });
  }

  private async assertPlanCatalogKeys(opts: {
    companyId: string;
    departmentKey?: string | null;
    positionKey?: string | null;
    authorization?: string;
  }): Promise<void> {
    if (!this.settingsCatalogs) return;
    const tenantId = this.resolveCatalogTenantId();
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      opts.authorization,
      tenantId,
      opts.companyId,
    );
    const deptKey = opts.departmentKey?.trim() || '';
    const posKey = opts.positionKey?.trim() || '';
    if (deptKey) {
      const deptItems = await this.settingsCatalogs.getEffectiveItemsForKey(
        tenantId,
        catalogCompanyId,
        'departments',
      );
      const activeDept = deptItems.filter((i) => i.status === 'active');
      if (activeDept.length > 0) {
        const hit = activeDept.find(
          (i) => i.code.toLowerCase() === deptKey.toLowerCase(),
        );
        if (!hit) {
          throw new ApiException(
            HRM_HC_KEY_UNKNOWN,
            `department_key '${deptKey}' không thuộc danh mục phòng ban hiệu lực`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }
    if (posKey) {
      const posItems = await this.settingsCatalogs.getEffectiveItemsForKey(
        tenantId,
        catalogCompanyId,
        'job_titles',
      );
      const activePos = posItems.filter((i) => i.status === 'active');
      if (activePos.length > 0) {
        const hit = activePos.find(
          (i) => i.code.toLowerCase() === posKey.toLowerCase(),
        );
        if (!hit) {
          throw new ApiException(
            HRM_HC_KEY_UNKNOWN,
            `position_key '${posKey}' không thuộc danh mục chức danh hiệu lực`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }
  }

  /**
   * Validate nested departments/positions and normalize months_data (O1) — **no DB write**.
   * Every reject (HRM-HC-CELL-LOCKED, HRM-HC-KEY-UNKNOWN, HRM-HC-VAL-400, HRM-HC-LEGACY-DUAL)
   * happens here, before the caller opens the replace transaction.
   */
  private async buildPlanDepartmentWritePlan(
    companyId: string,
    departments: Array<Record<string, unknown>>,
    opts: {
      planApproved?: boolean;
      allowOverride?: boolean;
      existingByNaturalKey?: Map<string, HeadcountCell>;
      authorization?: string;
      requireTwelve?: boolean;
    },
  ): Promise<PlanDepartmentWrite[]> {
    assertNoLegacyDualSotWriters({ departments });
    const writePlan: PlanDepartmentWrite[] = [];
    for (let i = 0; i < departments.length; i++) {
      const dept = departments[i];
      const departmentKey =
        typeof dept.department_key === 'string'
          ? dept.department_key.trim() || null
          : null;
      const deptName =
        (typeof dept.name === 'string' && dept.name.trim()) ||
        departmentKey ||
        `Phòng ${i + 1}`;
      await this.assertPlanCatalogKeys({
        companyId,
        departmentKey,
        authorization: opts.authorization,
      });
      const positions =
        (dept.positions as Array<Record<string, unknown>>) ?? [];
      const positionWrites: PlanPositionWrite[] = [];
      for (let j = 0; j < positions.length; j++) {
        const pos = positions[j];
        const positionKey =
          typeof pos.position_key === 'string'
            ? pos.position_key.trim() || null
            : null;
        const posName =
          (typeof pos.name === 'string' && pos.name.trim()) ||
          positionKey ||
          `Vị trí ${j + 1}`;
        await this.assertPlanCatalogKeys({
          companyId,
          positionKey,
          authorization: opts.authorization,
        });
        const monthsRaw = pos.months ?? pos.months_data ?? [];
        assertNoLegacyDualSotWriters(monthsRaw);
        const cells = normalizeMonthsData(monthsRaw, {
          planApproved: opts.planApproved,
          requireTwelve: opts.requireTwelve,
          // R-REC-HC-OVERRIDE-CELLID: defer surrogate mint so an existing cell_id is reused by
          // natural key first (BR-REC-HC-CELL-STABLE); mint only on first create (MINT-ONCE).
          mintWhenMissing: false,
        });
        for (const cell of cells) {
          const nk = `${departmentKey ?? deptName}|${positionKey ?? posName}|${cell.month}`;
          const prev = opts.existingByNaturalKey?.get(nk);
          if (prev) {
            // Lock guard first — RETAIN 409 HRM-HC-CELL-LOCKED, no grid wipe (must_keep BE-02).
            assertCellUnlockedForMutate(prev, cell, opts.allowOverride);
            // Explicit foreign cell_id for an existing natural key → reject; never re-mint identity.
            if (cell.cell_id && cell.cell_id !== prev.cell_id) {
              throw new ApiException(
                HRM_HC_CELL_ID_MISMATCH,
                'Ô định biên đã có định danh cố định — gửi đúng cell_id hoặc bỏ trống để hệ thống giữ nguyên',
                HttpStatus.CONFLICT,
              );
            }
            // Reuse stable identity (covers omit + explicit-match) so YCTD headcount_cell_id stays linked.
            cell.cell_id = prev.cell_id;
          } else if (!cell.cell_id) {
            // First persist for this natural key → mint surrogate once (DATA-01 §6.1).
            cell.cell_id = randomUUID();
          }
        }
        positionWrites.push({
          id: randomUUID(),
          name: posName,
          positionKey,
          cells,
          sortOrder: j,
        });
      }
      writePlan.push({
        id: randomUUID(),
        name: deptName,
        departmentKey,
        sortOrder: i,
        positions: positionWrites,
      });
    }
    return writePlan;
  }

  /**
   * Persist an already-validated write plan. Caller supplies a transactional query fn so the
   * DELETE + re-INSERT is atomic.
   */
  private async writePlanDepartments(
    query: HrmDbQueryFn,
    planId: string,
    companyId: string,
    writePlan: PlanDepartmentWrite[],
  ): Promise<void> {
    await query(
      `DELETE FROM public.recruitment_plan_departments WHERE plan_id = $1::uuid;`,
      [planId],
    );
    for (const dept of writePlan) {
      await query(
        `INSERT INTO public.recruitment_plan_departments
          (id, plan_id, company_id, name, department_key, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [
          dept.id,
          planId,
          companyId,
          dept.name,
          dept.departmentKey,
          dept.sortOrder,
        ],
      );
      for (const pos of dept.positions) {
        await query(
          `INSERT INTO public.recruitment_plan_positions
            (id, department_id, company_id, name, position_key, months_data, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7);`,
          [
            pos.id,
            dept.id,
            companyId,
            pos.name,
            pos.positionKey,
            JSON.stringify(pos.cells.map(toPersistCell)),
            pos.sortOrder,
          ],
        );
      }
    }
  }

  private async collectExistingCellMap(
    planId: string,
  ): Promise<Map<string, HeadcountCell>> {
    const map = new Map<string, HeadcountCell>();
    const depts = await this.db.query(
      `SELECT id, name, department_key FROM public.recruitment_plan_departments WHERE plan_id = $1::uuid`,
      [planId],
    );
    for (const dept of depts.rows as Array<{
      id: string;
      name: string;
      department_key: string | null;
    }>) {
      const posRes = await this.db.query(
        `SELECT name, position_key, months_data FROM public.recruitment_plan_positions WHERE department_id = $1::uuid`,
        [dept.id],
      );
      for (const pos of posRes.rows as Array<{
        name: string;
        position_key: string | null;
        months_data: unknown;
      }>) {
        const cells = projectMonthsForApi(pos.months_data, false);
        for (const cell of cells) {
          const nk = `${dept.department_key ?? dept.name}|${pos.position_key ?? pos.name}|${cell.month}`;
          map.set(nk, cell);
        }
      }
    }
    return map;
  }

  /**
   * Lock need_hire cells after approve (F-REC-HC-03) — used by PATCH status + WF callback.
   */
  async lockRecruitmentPlanNeedHireCells(planId: string): Promise<number> {
    await this.ensureWave2Schema();
    const depts = await this.db.query(
      `SELECT id FROM public.recruitment_plan_departments WHERE plan_id = $1::uuid`,
      [planId],
    );
    let locked = 0;
    for (const dept of depts.rows as Array<{ id: string }>) {
      const posRes = await this.db.query(
        `SELECT id, months_data FROM public.recruitment_plan_positions WHERE department_id = $1::uuid`,
        [dept.id],
      );
      for (const pos of posRes.rows as Array<{
        id: string;
        months_data: unknown;
      }>) {
        const cells = lockNeedHireCells(
          projectMonthsForApi(pos.months_data, true),
        );
        locked += cells.filter(
          (c) => c.lifecycle_status === 'need_hire_approved',
        ).length;
        await this.db.query(
          `UPDATE public.recruitment_plan_positions
           SET months_data = $2::jsonb, updated_at = NOW()
           WHERE id = $1::uuid`,
          [pos.id, JSON.stringify(cells.map(toPersistCell))],
        );
      }
    }
    return locked;
  }

  async createRecruitmentPlan(
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    assertNoLegacyDualSotWriters(payload);
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      String(payload.company_id ?? ''),
    );
    const planId = randomUUID();
    const departments =
      (payload.departments as Array<Record<string, unknown>>) ?? [];
    const statusRaw =
      typeof payload.status === 'string' ? payload.status : 'pending';
    // Validate grid before any INSERT so a reject never leaves an orphan plan header.
    const writePlan = await this.buildPlanDepartmentWritePlan(
      companyId,
      departments,
      {
        planApproved: false,
        authorization,
        requireTwelve: false,
      },
    );
    await this.db.withTransaction(async (query) => {
      await query(
        `INSERT INTO public.recruitment_plans (
          id, company_id, title, start_month, end_month, year, note, status, creator_name,
          submitted_by_dept_key
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          planId,
          companyId,
          String(payload.title ?? '').trim(),
          payload.start_month ?? 1,
          payload.end_month ?? 12,
          payload.year ?? new Date().getFullYear(),
          payload.note ?? null,
          statusRaw,
          payload.creator_name ?? null,
          typeof payload.submitted_by_dept_key === 'string'
            ? payload.submitted_by_dept_key.trim() || null
            : null,
        ],
      );
      await this.writePlanDepartments(query, planId, companyId, writePlan);
    });
    return this.getRecruitmentPlanById(planId, companyId, authorization);
  }

  /**
   * F-REC-HC-01 PUT upsert — replace grid cells; DENY dual ns/dx; lock after approve.
   */
  async upsertRecruitmentPlan(
    planId: string,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    assertNoLegacyDualSotWriters(payload);
    const existingRes = await this.db.query(
      `SELECT * FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`,
      [planId],
    );
    const existing = existingRes.rows[0] as
      | { id: string; company_id: string; status?: string }
      | undefined;
    if (!existing) {
      throw new ApiException(
        'HRM-REC-PLAN-404',
        'Recruitment plan not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      String(payload.company_id ?? existing.company_id),
    );
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-PLAN-404',
      mismatchCode: 'HRM-REC-PLAN-409',
    });
    const allowOverride = Boolean(
      payload.allow_override === true || payload.override === true,
    );
    const planApproved = isPlanApprovedStatus(existing.status);
    const existingMap = await this.collectExistingCellMap(planId);
    const departments =
      (payload.departments as Array<Record<string, unknown>>) ?? [];
    // R-REC-HC-PUT-LOCKED-WIPE: assert cell lock / catalog keys BEFORE any destructive write.
    const writePlan =
      departments.length > 0
        ? await this.buildPlanDepartmentWritePlan(
            existing.company_id,
            departments,
            {
              planApproved,
              allowOverride,
              existingByNaturalKey: existingMap,
              authorization,
              requireTwelve: Boolean(
                payload.require_twelve === true ||
                payload.submit_ready === true,
              ),
            },
          )
        : null;
    await this.db.withTransaction(async (query) => {
      await query(
        `UPDATE public.recruitment_plans SET
          title = COALESCE($2, title),
          start_month = COALESCE($3, start_month),
          end_month = COALESCE($4, end_month),
          year = COALESCE($5, year),
          note = COALESCE($6, note),
          submitted_by_dept_key = COALESCE($7, submitted_by_dept_key),
          updated_at = NOW()
         WHERE id = $1::uuid`,
        [
          planId,
          typeof payload.title === 'string' ? payload.title.trim() : null,
          payload.start_month ?? null,
          payload.end_month ?? null,
          payload.year ?? null,
          payload.note !== undefined ? payload.note : null,
          typeof payload.submitted_by_dept_key === 'string'
            ? payload.submitted_by_dept_key.trim() || null
            : null,
        ],
      );
      if (writePlan) {
        await this.writePlanDepartments(
          query,
          planId,
          existing.company_id,
          writePlan,
        );
      }
    });
    return this.getRecruitmentPlanById(planId, companyId, authorization);
  }

  async deleteRecruitmentPlan(
    planId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const existingRes = await this.db.query(
      `SELECT company_id FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`,
      [planId],
    );
    const existing = existingRes.rows[0] as { company_id: string } | undefined;
    if (!existing) {
      throw new ApiException(
        'HRM-REC-PLAN-404',
        'Recruitment plan not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-PLAN-404',
      mismatchCode: 'HRM-REC-PLAN-409',
    });
    await this.db.query(
      `DELETE FROM public.recruitment_plans WHERE id = $1::uuid;`,
      [planId],
    );
    return { id: planId };
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
      throw new ApiException(
        'HRM-REC-JP-404',
        'Job posting not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-JP-404',
      mismatchCode: 'HRM-REC-JP-409',
    });
    const hasPositionKey = Object.prototype.hasOwnProperty.call(
      payload,
      'position_key',
    );
    const hasPositionText = Object.prototype.hasOwnProperty.call(
      payload,
      'position',
    );
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
    const existing = existingRes.rows[0] as
      | {
          id: string;
          company_id: string;
          stage?: string;
          workflow_instance_id?: string | null;
          employee_id?: string | null;
        }
      | undefined;
    if (!existing) {
      throw new ApiException(
        'HRM-REC-CP-404',
        'Candidate not found',
        HttpStatus.NOT_FOUND,
      );
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
    // F-REC-APP-02 / BR-PLT-02 — catalog >0 ⇒ to_stage ∈ effective else HRM-REC-STAGE-UNKNOWN.
    const stageCatalog = this.resolveRecPipelineStages();
    const catalogHit = stageCatalog
      ? await stageCatalog.assertStageInEffectiveCatalog({
          companyId: existing.company_id || companyId,
          stageKey: stage,
          authorization,
        })
      : null;
    const treatAsHired = catalogHit
      ? Boolean(catalogHit.isHiredOutcome)
      : isHiredStage(stage);

    if (treatAsHired) {
      const linkedEmployeeId = await assertHireEmployeeLinkOrThrow(
        this.db,
        candidateId,
        existing.company_id,
        {
          existingEmployeeId: existing.employee_id,
          explicitEmployeeId: employeeId,
        },
      );
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
      phone?: string | null;
      position?: string | null;
      source?: string;
      stage?: string;
      employee_id?: string;
      rating?: number | null;
      applied_date?: string | null;
      expected_start_date?: string | null;
      nationality?: string | null;
      hometown?: string | null;
      marital_status?: string | null;
      notes?: string | null;
    },
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const stage = payload.stage ?? 'applied';
    // VAL-REC-CNS-02 / BR-PLT-REC-STAGE-06 — when EFF >0, initial stage must ∈ effective.
    const stageCatalog = this.resolveRecPipelineStages();
    const catalogHit = stageCatalog
      ? await stageCatalog.assertStageInEffectiveCatalog({
          companyId,
          stageKey: stage,
          authorization,
        })
      : null;
    let employeeId: string | null = payload.employee_id?.trim() || null;
    // FR-HRM-INT-01 #5 — không tạo thẳng hired thiếu khóa hồ sơ.
    const treatAsHired = catalogHit
      ? Boolean(catalogHit.isHiredOutcome)
      : isHiredStage(stage);
    if (treatAsHired) {
      if (!employeeId) {
        throw new ApiException(
          HRM_REC_HIRE_400,
          'Hire requires a linked employee profile (employee_id)',
          HttpStatus.BAD_REQUEST,
        );
      }
      employeeId = await assertEmployeeInCandidateCompany(
        this.db,
        employeeId,
        companyId,
      );
    }
    const rating =
      typeof payload.rating === 'number' && Number.isFinite(payload.rating)
        ? Math.max(0, Math.min(5, Math.trunc(payload.rating)))
        : 0;
    const res = await this.db.query(
      `INSERT INTO public.candidates (
        id, company_id, full_name, email, phone, position, stage, source, rating,
        applied_date, expected_start_date, nationality, hometown, marital_status, notes, employee_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        COALESCE($10::date, CURRENT_DATE), $11::date, $12, $13, $14, $15, $16::uuid
      )
      RETURNING *;`,
      [
        randomUUID(),
        companyId,
        payload.full_name.trim(),
        payload.email?.toLowerCase().trim() ?? null,
        payload.phone?.trim() || null,
        payload.position?.trim() || null,
        stage,
        payload.source?.trim() || null,
        rating,
        payload.applied_date || null,
        payload.expected_start_date || null,
        payload.nationality?.trim() || null,
        payload.hometown?.trim() || null,
        payload.marital_status?.trim() || null,
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
      phone?: string | null;
      position?: string | null;
      source?: string;
      stage?: string;
      employee_id?: string;
      rating?: number | null;
      applied_date?: string | null;
      expected_start_date?: string | null;
      nationality?: string | null;
      hometown?: string | null;
      marital_status?: string | null;
      notes?: string | null;
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
    const existing = existingRes.rows[0] as
      | {
          company_id: string;
          stage?: string;
          workflow_instance_id?: string | null;
          employee_id?: string | null;
        }
      | undefined;
    assertResourceInHrmScope(
      existing,
      resolveHrmListScope(authorization, companyId),
      {
        notFoundCode: 'HRM-REC-CP-404',
        mismatchCode: 'HRM-REC-CP-409',
      },
    );
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
    // VAL-REC-CNS-02 — update pool stage path assert ∈ EFF when stage provided + catalog >0.
    const stageCatalog = this.resolveRecPipelineStages();
    const catalogHit =
      stageCatalog && nextStage?.trim()
        ? await stageCatalog.assertStageInEffectiveCatalog({
            companyId: existing!.company_id || companyId,
            stageKey: nextStage,
            authorization,
          })
        : null;
    // Diễn biến #5/#7 — hired bắt buộc khóa hồ sơ; stamp soft employee_id.
    const treatAsHired = nextStage
      ? catalogHit
        ? Boolean(catalogHit.isHiredOutcome)
        : isHiredStage(nextStage)
      : false;
    if (treatAsHired) {
      nextEmployeeId = await assertHireEmployeeLinkOrThrow(
        this.db,
        candidateId,
        existing!.company_id,
        {
          existingEmployeeId: existing?.employee_id,
          explicitEmployeeId: payload.employee_id,
        },
      );
    } else if (payload.employee_id?.trim()) {
      nextEmployeeId = await assertEmployeeInCandidateCompany(
        this.db,
        payload.employee_id.trim(),
        existing!.company_id,
      );
    }

    const hasRating =
      typeof payload.rating === 'number' && Number.isFinite(payload.rating);
    const nextRating = hasRating
      ? Math.max(0, Math.min(5, Math.trunc(payload.rating as number)))
      : null;
    const res = await this.db.query(
      `UPDATE public.candidates SET
        full_name = COALESCE($2, full_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        position = COALESCE($5, position),
        source = COALESCE($6, source),
        stage = COALESCE($7, stage),
        rating = CASE WHEN $8::boolean THEN $9 ELSE rating END,
        applied_date = COALESCE($10::date, applied_date),
        expected_start_date = COALESCE($11::date, expected_start_date),
        nationality = COALESCE($12, nationality),
        hometown = COALESCE($13, hometown),
        marital_status = COALESCE($14, marital_status),
        notes = COALESCE($15, notes),
        employee_id = COALESCE($16::uuid, employee_id),
        updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING *;`,
      [
        candidateId,
        payload.full_name?.trim() ?? null,
        payload.email?.toLowerCase().trim() ?? null,
        payload.phone?.trim() || null,
        payload.position !== undefined
          ? payload.position?.trim() || null
          : null,
        payload.source?.trim() ?? null,
        nextStage,
        hasRating,
        nextRating,
        payload.applied_date || null,
        payload.expected_start_date || null,
        payload.nationality !== undefined
          ? payload.nationality?.trim() || null
          : null,
        payload.hometown !== undefined
          ? payload.hometown?.trim() || null
          : null,
        payload.marital_status !== undefined
          ? payload.marital_status?.trim() || null
          : null,
        payload.notes ?? null,
        nextEmployeeId,
      ],
    );
    return res.rows[0];
  }

  async deleteCandidatePool(
    candidateId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [candidateId];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query(
      `DELETE FROM public.candidates WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-REC-CP-404',
        'Candidate not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return { id: candidateId };
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
    pushCompanyIdFilter(filters, values, scope);
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
   *
   * VAL-REC-CNS-05 — soft-gate allows_interview_schedule on pool candidate.stage (≠ one-active).
   */
  async createInterview(
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureInterviewsSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      String(payload.company_id ?? ''),
    );
    const candidateId =
      typeof payload.candidate_id === 'string' && payload.candidate_id.trim()
        ? payload.candidate_id.trim()
        : null;
    if (candidateId) {
      const candRes = await this.db.query<{
        stage: string | null;
        company_id: string;
      }>(
        `SELECT stage::text AS stage, company_id::text AS company_id
         FROM public.candidates WHERE id = $1::uuid LIMIT 1;`,
        [candidateId],
      );
      const cand = candRes.rows[0];
      if (cand?.stage?.trim()) {
        const stageCatalog = this.resolveRecPipelineStages();
        if (stageCatalog) {
          await stageCatalog.assertInterviewScheduleAllowed({
            companyId: cand.company_id || companyId,
            stageKey: cand.stage,
            authorization,
          });
        }
      }
    }
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

  async updateInterview(
    id: string,
    payload: Record<string, unknown>,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureInterviewsSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query(
      `SELECT company_id FROM public.interviews WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-REC-INT-404',
      mismatchCode: 'HRM-REC-INT-409',
    });
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
    if (!res.rows[0])
      throw new ApiException(
        'HRM-REC-INT-404',
        'Interview not found',
        HttpStatus.NOT_FOUND,
      );
    return res.rows[0];
  }

  async deleteInterview(id: string, companyId: string, authorization?: string) {
    await this.ensureInterviewsSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query(
      `DELETE FROM public.interviews WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    if (!res.rows[0])
      throw new ApiException(
        'HRM-REC-INT-404',
        'Interview not found',
        HttpStatus.NOT_FOUND,
      );
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
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query(
      `SELECT * FROM public.headcount_proposals WHERE ${filters.join(' AND ')} ORDER BY created_at DESC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createHeadcountProposal(
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      String(payload.company_id ?? ''),
    );
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
      typeof payload.department_key === 'string'
        ? payload.department_key.trim() || null
        : null;
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
    const peek = await this.db.query(
      `SELECT company_id FROM public.headcount_proposals WHERE id = $1::uuid LIMIT 1;`,
      [proposalId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-REC-HC-404',
      mismatchCode: 'HRM-REC-HC-409',
    });
    const res = await this.db.query(
      `UPDATE public.headcount_proposals SET
        status = $2,
        rejected_reason = COALESCE($3, rejected_reason),
        approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE approved_at END,
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`,
      [proposalId, status, rejectedReason ?? null],
    );
    if (!res.rows[0])
      throw new ApiException(
        'HRM-REC-HC-404',
        'Headcount proposal not found',
        HttpStatus.NOT_FOUND,
      );
    return res.rows[0];
  }

  async listCandidateEvaluations(
    companyId: string,
    authorization?: string,
    opts?: {
      candidateId?: string;
      recruitmentCandidateId?: string;
      applicationId?: string;
      includeLegacy?: boolean;
    },
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const readCompanyIds = expandPayrollPeriodCompanyIds(scope);
    const filters: string[] = ['e.archived_at IS NULL'];
    const values: unknown[] = [];
    if (readCompanyIds.length === 1) {
      values.push(readCompanyIds[0]);
      filters.push(`e.company_id = $${values.length}::text`);
    } else {
      values.push(readCompanyIds);
      filters.push(`e.company_id = ANY($${values.length}::text[])`);
    }
    const recruitmentCandidateId = opts?.recruitmentCandidateId?.trim();
    const applicationId = opts?.applicationId?.trim();
    const candidateId = opts?.candidateId?.trim();
    if (recruitmentCandidateId) {
      values.push(recruitmentCandidateId);
      filters.push(`e.recruitment_candidate_id = $${values.length}::uuid`);
    }
    if (applicationId) {
      values.push(applicationId);
      filters.push(`e.application_id = $${values.length}::uuid`);
    }
    if (candidateId) {
      values.push(candidateId);
      filters.push(`e.candidate_id = $${values.length}::uuid`);
    }
    const includeLegacy = opts?.includeLegacy === true;
    if (!includeLegacy) {
      // FR-06 product list prefers YCTD neo; exclude FR06_LEGACY_POOL by default.
      filters.push(
        `(e.recruitment_candidate_id IS NOT NULL OR e.application_id IS NOT NULL)`,
      );
    }
    const res = await this.db.query(
      `SELECT e.*,
              rc.full_name AS lane_a_full_name,
              rc.email AS lane_a_email,
              rc.status AS lane_a_status,
              rc.requisition_id::text AS lane_a_requisition_id,
              r.title AS yctd_title,
              r.company_id AS yctd_company_id,
              COALESCE(NULLIF(r.position_key, ''), t.position_code, '') AS yctd_position_key,
              COALESCE(NULLIF(t.position_name, ''), NULLIF(r.title, ''), '') AS yctd_position_name,
              c.full_name AS candidate_name,
              c.email AS candidate_email,
              c.stage AS pool_stage
       FROM public.candidate_evaluations e
       LEFT JOIN public.recruitment_candidates rc
         ON rc.id = COALESCE(e.recruitment_candidate_id, e.application_id)
       LEFT JOIN public.job_requisitions r ON r.id = rc.requisition_id
       LEFT JOIN public.job_description_templates t ON t.id::text = r.job_template_id
       LEFT JOIN public.candidates c ON c.id = e.candidate_id
       WHERE ${filters.join(' AND ')}
       ORDER BY e.created_at DESC;`,
      values,
    );
    const data = res.rows.map((row: Record<string, unknown>) =>
      this.mapEvaluationDto(row),
    );
    return { total: data.length, data };
  }

  async createCandidateEvaluation(
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    // Scope MUST use the portal-requested company_id (e.g. main), NOT the persisted
    // partition slug (holding). Using holding here collapses group-CEO rollup →
    // HRM-REC-409 «outside token scope» for UV on member OUs (trsport, …).
    // Parity: createJobRequisition / jd-dynamic — persist vs list-scope split.
    const requestedCompanyId = String(payload.company_id ?? '').trim();
    const persistCompanyId = resolveHrmPersistCompanyIdText(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, requestedCompanyId);

    const recruitmentCandidateId =
      typeof payload.recruitment_candidate_id === 'string'
        ? payload.recruitment_candidate_id.trim()
        : '';
    const applicationId =
      typeof payload.application_id === 'string'
        ? payload.application_id.trim()
        : '';
    const poolCandidateId =
      typeof payload.candidate_id === 'string'
        ? payload.candidate_id.trim()
        : '';

    if (!recruitmentCandidateId && !applicationId) {
      throw new ApiException(
        HRM_REC_EVAL_NEO_REQUIRED,
        'Đánh giá phải gắn UV–YCTD (recruitment_candidate_id và/hoặc application_id)',
        HttpStatus.BAD_REQUEST,
      );
    }

    let laneA: { id: string; company_id: string; status: string } | null = null;
    if (recruitmentCandidateId) {
      const candRes = await this.db.query<{
        id: string;
        company_id: string;
        status: string;
      }>(
        `SELECT id, company_id, status FROM public.recruitment_candidates WHERE id = $1::uuid LIMIT 1;`,
        [recruitmentCandidateId],
      );
      laneA = candRes.rows[0] ?? null;
      if (!laneA) {
        throw new ApiException(
          'HRM-REC-404',
          'Candidate not found',
          HttpStatus.NOT_FOUND,
        );
      }
      assertResourceInHrmScope(laneA, scope, {
        notFoundCode: 'HRM-REC-404',
        mismatchCode: 'HRM-REC-409',
      });
    }

    // Keep eval row in the same company partition as Lane A UV when neo is present.
    const companyId = laneA?.company_id?.trim() || persistCompanyId;

    const interviewId =
      typeof payload.interview_id === 'string' && payload.interview_id.trim()
        ? payload.interview_id.trim()
        : null;
    await this.assertEvalRoundGateOrThrow({
      companyId: laneA?.company_id ?? companyId,
      recruitmentCandidateId: recruitmentCandidateId || null,
      interviewId,
    });

    const commit = payload.commit !== false;
    const allowDraft = await this.readEvalAllowDraft(
      laneA?.company_id ?? companyId,
    );
    let result =
      typeof payload.result === 'string'
        ? payload.result.trim().toLowerCase()
        : '';
    if (commit || !allowDraft) {
      if (result !== 'pass' && result !== 'fail') {
        throw new ApiException(
          HRM_REC_EVAL_PASSFAIL_REQUIRED,
          'Chọn Đạt hoặc Không đạt khi chốt đánh giá',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      if (!result) result = 'pending';
      if (result !== 'pass' && result !== 'fail' && result !== 'pending') {
        throw new ApiException(
          HRM_REC_EVAL_PASSFAIL_REQUIRED,
          'result must be pass|fail|pending',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (result === 'pending' && !allowDraft) {
        throw new ApiException(
          HRM_REC_EVAL_PASSFAIL_REQUIRED,
          'Chọn Đạt hoặc Không đạt khi chốt đánh giá',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const scores = payload.scores ?? payload.scores_json ?? [];
    const evaluatedAt =
      result === 'pass' || result === 'fail' ? new Date().toISOString() : null;
    const templateId =
      typeof payload.template_id === 'string' && payload.template_id.trim()
        ? payload.template_id.trim()
        : null;
    const salaryRec =
      typeof payload.salary_recommendation === 'number' &&
      Number.isFinite(payload.salary_recommendation)
        ? payload.salary_recommendation
        : null;

    const res = await this.db.query(
      `INSERT INTO public.candidate_evaluations (
        id, company_id, candidate_id, recruitment_candidate_id, application_id,
        interview_id, template_id, evaluator_name, evaluator_email,
        total_score, weighted_score, result, overall_feedback, recommendation,
        salary_recommendation, scores, evaluated_at
      ) VALUES (
        $1,$2,$3::uuid,$4::uuid,$5::uuid,
        $6::uuid,$7::uuid,$8,$9,
        $10,$11,$12,$13,$14,
        $15,$16::jsonb,$17::timestamptz
      )
      RETURNING *;`,
      [
        randomUUID(),
        companyId,
        poolCandidateId || null,
        recruitmentCandidateId || null,
        applicationId || null,
        interviewId,
        templateId,
        payload.evaluator_name ?? null,
        payload.evaluator_email ?? null,
        payload.total_score ?? null,
        payload.weighted_score ?? null,
        result,
        payload.overall_feedback ?? null,
        payload.recommendation ?? null,
        salaryRec,
        JSON.stringify(scores),
        evaluatedAt,
      ],
    );
    return this.mapEvaluationDto(res.rows[0]);
  }

  async deleteCandidateEvaluation(
    evaluationId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query<{
      id: string;
      company_id: string;
      recruitment_candidate_id: string | null;
      application_id: string | null;
      candidate_id: string | null;
      archived_at: string | null;
    }>(
      `SELECT id, company_id, recruitment_candidate_id, application_id, candidate_id, archived_at
       FROM public.candidate_evaluations WHERE id = $1::uuid LIMIT 1;`,
      [evaluationId],
    );
    const row = peek.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_REC_EVAL_404,
        'Evaluation not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_REC_EVAL_404,
      mismatchCode: 'HRM-REC-409',
    });
    const isLegacy =
      !row.recruitment_candidate_id &&
      !row.application_id &&
      Boolean(row.candidate_id);
    // Soft-archive allowed for legacy; other mutates denied elsewhere.
    if (isLegacy && row.archived_at) {
      throw new ApiException(
        HRM_REC_EVAL_LEGACY_READONLY,
        'Bản ghi đánh giá cũ (pool) chỉ đọc',
        HttpStatus.BAD_REQUEST,
      );
    }
    const res = await this.db.query<{ id: string; archived_at: string }>(
      `UPDATE public.candidate_evaluations
       SET archived_at = NOW(), updated_at = NOW()
       WHERE id = $1::uuid AND archived_at IS NULL
       RETURNING id, archived_at;`,
      [evaluationId],
    );
    if (!res.rows[0]) {
      throw new ApiException(
        HRM_REC_EVAL_404,
        'Evaluation not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return { id: res.rows[0].id, archived_at: res.rows[0].archived_at };
  }

  async listEvaluationCriteriaTemplates(
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['is_active = TRUE', 'archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query(
      `SELECT * FROM public.evaluation_criteria_templates WHERE ${filters.join(' AND ')} ORDER BY sort_order ASC, created_at ASC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async replaceEvaluationCriteriaTemplates(
    companyId: string,
    templates: Record<string, unknown>[],
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const resolved = resolveHrmPersistCompanyIdText(authorization, companyId);
    // Soft-retire existing active rows — DENY hard wipe as SoT (O11).
    await this.db.query(
      `UPDATE public.evaluation_criteria_templates
       SET is_active = FALSE, archived_at = COALESCE(archived_at, NOW()), updated_at = NOW()
       WHERE company_id = $1 AND is_active = TRUE AND archived_at IS NULL;`,
      [resolved],
    );
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

  private mapEvaluationDto(row: Record<string, unknown>) {
    const neoRc = row.recruitment_candidate_id
      ? String(row.recruitment_candidate_id)
      : null;
    const neoApp = row.application_id ? String(row.application_id) : null;
    const poolId = row.candidate_id ? String(row.candidate_id) : null;
    const rowClass =
      neoRc || neoApp ? 'FR06_YCTD' : poolId ? 'FR06_LEGACY_POOL' : 'FR06_YCTD';
    const scores = Array.isArray(row.scores) ? row.scores : (row.scores ?? []);
    return {
      id: String(row.id),
      company_id: String(row.company_id),
      recruitment_candidate_id: neoRc,
      application_id: neoApp,
      candidate_id: poolId,
      interview_id: row.interview_id ? String(row.interview_id) : null,
      template_id: row.template_id ? String(row.template_id) : null,
      result: String(row.result ?? 'pending'),
      scores,
      scores_json: scores,
      salary_recommendation:
        row.salary_recommendation != null
          ? Number(row.salary_recommendation)
          : null,
      overall_feedback:
        row.overall_feedback != null ? String(row.overall_feedback) : null,
      recommendation:
        row.recommendation != null ? String(row.recommendation) : null,
      evaluated_at: row.evaluated_at ? String(row.evaluated_at) : null,
      evaluator_name:
        row.evaluator_name != null ? String(row.evaluator_name) : null,
      evaluator_email:
        row.evaluator_email != null ? String(row.evaluator_email) : null,
      total_score: row.total_score != null ? Number(row.total_score) : null,
      weighted_score:
        row.weighted_score != null ? Number(row.weighted_score) : null,
      archived_at: row.archived_at ? String(row.archived_at) : null,
      row_class: rowClass,
      // display helpers — Vị trí = YCTD position/title (NOT pipeline stage)
      candidate_name: row.lane_a_full_name ?? row.candidate_name ?? null,
      candidate_email: row.lane_a_email ?? row.candidate_email ?? null,
      candidate_position:
        (row.yctd_position_name != null && String(row.yctd_position_name).trim()) ||
        (row.yctd_title != null && String(row.yctd_title).trim()) ||
        null,
      candidate_stage: row.lane_a_status ?? row.pool_stage ?? null,
      yctd_title: row.yctd_title != null ? String(row.yctd_title) : null,
      yctd_company_id:
        row.yctd_company_id != null
          ? String(row.yctd_company_id)
          : row.company_id != null
            ? String(row.company_id)
            : null,
      requisition_id: row.lane_a_requisition_id
        ? String(row.lane_a_requisition_id)
        : null,
      created_at: row.created_at ? String(row.created_at) : null,
      updated_at: row.updated_at ? String(row.updated_at) : null,
    };
  }

  private async readEvalAllowDraft(companyId: string): Promise<boolean> {
    try {
      const res = await this.db.query<{ value_json: unknown }>(
        `SELECT value_json
         FROM public.hrm_company_settings
         WHERE company_id = $1::text
           AND setting_key = $2
           AND archived_at IS NULL
         ORDER BY updated_at DESC
         LIMIT 1;`,
        [companyId, CFG_EVAL_ALLOW_DRAFT],
      );
      const raw = res.rows[0]?.value_json;
      if (raw == null) return false;
      if (typeof raw === 'boolean') return raw;
      if (typeof raw === 'string') {
        const n = raw.trim().toLowerCase();
        if (n === 'true' || n === '1') return true;
        if (n === 'false' || n === '0') return false;
      }
      if (typeof raw === 'object') {
        const obj = raw as Record<string, unknown>;
        const candidate = obj.value ?? obj.enabled;
        if (typeof candidate === 'boolean') return candidate;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async assertEvalRoundGateOrThrow(opts: {
    companyId: string;
    recruitmentCandidateId: string | null;
    interviewId: string | null;
  }): Promise<void> {
    if (opts.interviewId) {
      const iv = await this.db.query<{
        id: string;
        status: string;
        company_id: string;
      }>(
        `SELECT id, status, company_id FROM public.recruitment_interviews WHERE id = $1::uuid LIMIT 1;`,
        [opts.interviewId],
      );
      const row = iv.rows[0];
      if (!row) {
        throw new ApiException(
          HRM_REC_EVAL_404,
          'Interview not found for evaluation',
          HttpStatus.NOT_FOUND,
        );
      }
      if (!(TERMINAL_IV_FOR_EVAL as readonly string[]).includes(row.status)) {
        throw new ApiException(
          HRM_REC_EVAL_ROUND_GATE,
          'Kết thúc lịch phỏng vấn trước khi đánh giá vòng mới',
          HttpStatus.BAD_REQUEST,
        );
      }
      return;
    }
    if (!opts.recruitmentCandidateId) return;
    const active = await this.db.query<{ id: string }>(
      `SELECT id FROM public.recruitment_interviews
       WHERE company_id = $1::text
         AND candidate_id = $2::uuid
         AND status = ANY($3::text[])
       LIMIT 1;`,
      [opts.companyId, opts.recruitmentCandidateId, [...ACTIVE_IV_FOR_EVAL]],
    );
    if (active.rows[0]) {
      throw new ApiException(
        HRM_REC_EVAL_ROUND_GATE,
        'Kết thúc lịch phỏng vấn trước khi đánh giá vòng mới',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateRecruitmentPlanStatus(
    planId: string,
    companyId: string,
    status: string,
    authorization?: string,
    options?: {
      rejected_reason?: string;
      approved_by?: string;
      activation_mode?: string;
    },
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    const existingRes = await this.db.query(
      `SELECT * FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`,
      [planId],
    );
    const existing = existingRes.rows[0] as
      | {
          company_id: string;
          status?: string;
          workflow_instance_id?: string | null;
        }
      | undefined;
    if (!existing) {
      throw new ApiException(
        'HRM-REC-PLAN-404',
        'Recruitment plan not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-PLAN-404',
      mismatchCode: 'HRM-REC-PLAN-409',
    });
    const nextStatus = String(status ?? '')
      .trim()
      .toLowerCase();
    const mappedStatus =
      nextStatus === 'submitted'
        ? 'pending_approval'
        : nextStatus === 'draft'
          ? 'pending'
          : nextStatus;
    // F-REC-HC-03 — reject requires lý do (VAL-09).
    if (mappedStatus === 'rejected') {
      const reason = options?.rejected_reason?.trim();
      if (!reason) {
        throw new ApiException(
          HRM_HC_VAL_400,
          'Từ chối định biên yêu cầu lý do (rejected_reason)',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    // Approve / reject while WF instance active still allowed via bridge; local PATCH respects lock
    // except when moving to approved/rejected (bridge path mirrors).
    if (mappedStatus !== 'approved' && mappedStatus !== 'rejected') {
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
    }
    if (mappedStatus === 'approved') {
      const current = String(existing.status ?? '').toLowerCase();
      if (
        current !== 'pending_approval' &&
        current !== 'pending' &&
        current !== 'submitted'
      ) {
        // Soft allow approve from pending_approval preferred; still permit pending for AS-IS.
      }
    }
    const activationMode =
      options?.activation_mode?.trim() ||
      (mappedStatus === 'approved' ? 'on_approve' : null);
    const res = await this.db.query(
      `UPDATE public.recruitment_plans SET
        status = $2,
        rejected_reason = CASE WHEN $2 = 'rejected' THEN $3 ELSE rejected_reason END,
        approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE approved_at END,
        approved_by = CASE WHEN $2 = 'approved' THEN COALESCE($4, approved_by) ELSE approved_by END,
        activation_mode = CASE WHEN $2 = 'approved' THEN COALESCE($5, activation_mode, 'on_approve') ELSE activation_mode END,
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`,
      [
        planId,
        mappedStatus,
        options?.rejected_reason?.trim() ?? null,
        options?.approved_by?.trim() ?? null,
        activationMode,
      ],
    );
    let approved_cell_count = 0;
    if (mappedStatus === 'approved') {
      approved_cell_count = await this.lockRecruitmentPlanNeedHireCells(planId);
    }
    return {
      ...res.rows[0],
      planId,
      approved_cell_count:
        mappedStatus === 'approved' ? approved_cell_count : undefined,
      rejected_reason:
        mappedStatus === 'rejected'
          ? (options?.rejected_reason?.trim() ?? null)
          : undefined,
    };
  }

  /**
   * F-REC-HC-05 — Auto spawn YCTD from approved need_hire cells (HC-S1..S7).
   * FORBIDDEN: job_postings / Campaign · second YCTD per cell · silent qty overwrite.
   */
  async spawnRecruitmentPlanRequests(
    planId: string,
    companyId: string,
    authorization?: string,
    body?: { dry_run?: boolean; cell_ids?: string[] },
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    const existingRes = await this.db.query(
      `SELECT * FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`,
      [planId],
    );
    const existing = existingRes.rows[0] as
      | {
          id: string;
          company_id: string;
          status?: string;
          year?: number;
          title?: string;
          activation_mode?: string | null;
        }
      | undefined;
    if (!existing) {
      throw new ApiException(
        'HRM-REC-PLAN-404',
        'Recruitment plan not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-PLAN-404',
      mismatchCode: 'HRM-REC-PLAN-409',
    });
    // HC-S1
    if (!isPlanApprovedStatus(existing.status)) {
      throw new ApiException(
        HRM_HC_SPAWN_PLAN_NOT_APPROVED,
        'Chỉ định biên đã duyệt mới được sinh YCTD tự động',
        HttpStatus.CONFLICT,
      );
    }
    // HC-S6 / O2 — CFG unset ⇒ on_approve; calendar_month without schedule ⇒ block
    const mode =
      (existing.activation_mode ?? 'on_approve').trim().toLowerCase() ||
      'on_approve';
    if (mode === 'calendar_month') {
      throw new ApiException(
        HRM_HC_ACTIVATION_CFG,
        'Chế độ kích hoạt theo tháng lịch thiếu cấu hình lịch — không sinh YCTD',
        HttpStatus.CONFLICT,
      );
    }

    const plan = await this.getRecruitmentPlanById(
      planId,
      companyId,
      authorization,
    );
    const filterIds = Array.isArray(body?.cell_ids)
      ? new Set(body.cell_ids.map((x) => String(x).trim()).filter(Boolean))
      : null;
    type Eligible = {
      cell: HeadcountCell;
      department_key: string | null;
      department_name: string;
      position_key: string | null;
      position_name: string;
    };
    const eligible: Eligible[] = [];
    const departments =
      (plan.departments as Array<Record<string, unknown>>) ?? [];
    for (const dept of departments) {
      const positions =
        (dept.positions as Array<Record<string, unknown>>) ?? [];
      for (const pos of positions) {
        const months = (pos.months as HeadcountCell[]) ?? [];
        for (const cell of months) {
          // HC-S2
          if (
            cell.cell_status !== 'need_hire' ||
            cell.headcount_need_hire < 1 ||
            cell.lifecycle_status !== 'need_hire_approved'
          ) {
            continue;
          }
          if (filterIds && !filterIds.has(cell.cell_id)) continue;
          eligible.push({
            cell,
            department_key:
              typeof dept.department_key === 'string'
                ? dept.department_key
                : null,
            department_name: String(dept.name ?? ''),
            position_key:
              typeof pos.position_key === 'string' ? pos.position_key : null,
            position_name: String(pos.name ?? ''),
          });
        }
      }
    }

    const created: Array<{
      requisition_id: string;
      headcount_cell_id: string;
      headcount: number;
      target_month: string;
    }> = [];
    const skipped_duplicate: Array<{
      headcount_cell_id: string;
      existing_requisition_id: string;
    }> = [];
    const drift_warnings: Array<{
      headcount_cell_id: string;
      cell_need_hire: number;
      yctd_headcount: number;
      code: typeof HRM_HC_SPAWN_QTY_DRIFT;
    }> = [];
    const dryRun = body?.dry_run === true;
    const year = Number(existing.year) || new Date().getFullYear();

    for (const item of eligible) {
      const cellId = item.cell.cell_id;
      const existingYctd = await this.db.query(
        `SELECT id::text AS id, headcount
         FROM public.job_requisitions
         WHERE company_id = $1::text
           AND headcount_mode = 'in_plan'
           AND headcount_cell_id = $2::uuid
         LIMIT 1`,
        [existing.company_id, cellId],
      );
      const row = existingYctd.rows[0] as
        | { id: string; headcount: number }
        | undefined;
      if (row) {
        skipped_duplicate.push({
          headcount_cell_id: cellId,
          existing_requisition_id: row.id,
        });
        // HC-S5 — drift warn; do not overwrite YCTD qty
        if (Number(row.headcount) !== item.cell.headcount_need_hire) {
          drift_warnings.push({
            headcount_cell_id: cellId,
            cell_need_hire: item.cell.headcount_need_hire,
            yctd_headcount: Number(row.headcount),
            code: HRM_HC_SPAWN_QTY_DRIFT,
          });
        }
        continue;
      }
      if (dryRun) {
        created.push({
          requisition_id: 'dry-run',
          headcount_cell_id: cellId,
          headcount: item.cell.headcount_need_hire,
          target_month: firstOfMonthIso(year, item.cell.month),
        });
        continue;
      }
      const requisitionId = randomUUID();
      // Align with normalizeTargetMonthOrThrow — always first-of-month DATE (REC-01 spawn identity).
      const targetMonth = firstOfMonthIso(year, item.cell.month);
      const title =
        `${item.position_name || 'YCTD'} · T${item.cell.month}/${year}`.slice(
          0,
          200,
        ) || String(existing.title ?? 'YCTD định biên').slice(0, 200);
      try {
        await this.db.query(
          `INSERT INTO public.job_requisitions
            (id, company_id, title, department, employment_type, headcount, status,
             headcount_cell_id, headcount_mode, target_month, recruitment_plan_id,
             department_key, position_key)
           VALUES ($1, $2::text, $3, $4, 'full-time', $5, 'open',
                   $6::uuid, 'in_plan', $7::date, $8::uuid, $9, $10)`,
          [
            requisitionId,
            existing.company_id,
            title,
            item.department_name || item.department_key || '—',
            item.cell.headcount_need_hire,
            cellId,
            targetMonth,
            planId,
            item.department_key,
            item.position_key,
          ],
        );
        created.push({
          requisition_id: requisitionId,
          headcount_cell_id: cellId,
          headcount: item.cell.headcount_need_hire,
          target_month: targetMonth,
        });
      } catch (err: unknown) {
        // HC-S4 — partial UQ race → treat as skip
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('uq_job_requisitions_spawn_cell') ||
          msg.includes('duplicate key')
        ) {
          const again = await this.db.query(
            `SELECT id::text AS id FROM public.job_requisitions
             WHERE company_id = $1::text AND headcount_cell_id = $2::uuid AND headcount_mode = 'in_plan'
             LIMIT 1`,
            [existing.company_id, cellId],
          );
          skipped_duplicate.push({
            headcount_cell_id: cellId,
            existing_requisition_id: String(again.rows[0]?.id ?? ''),
          });
          continue;
        }
        throw err;
      }
    }

    return {
      created,
      skipped_duplicate,
      drift_warnings: drift_warnings.length ? drift_warnings : undefined,
    };
  }

  /**
   * UC-HRM-REC-WF-02 — submit plan for XBOS approval (SPAWN-MISSING keeps pending_approval).
   */
  async submitRecruitmentPlanForApproval(
    planId: string,
    companyId: string,
    authorization?: string,
    options?: {
      submitterUserId?: string;
      tenantId?: string;
      companySlug?: string;
    },
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    const existingRes = await this.db.query(
      `SELECT id, company_id, status, workflow_instance_id::text AS workflow_instance_id
       FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`,
      [planId],
    );
    const existing = existingRes.rows[0] as
      | {
          id: string;
          company_id: string;
          status: string;
          workflow_instance_id?: string | null;
        }
      | undefined;
    if (!existing) {
      throw new ApiException(
        'HRM-REC-PLAN-404',
        'Recruitment plan not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-PLAN-404',
      mismatchCode: 'HRM-REC-PLAN-409',
    });
    if (existing.workflow_instance_id) {
      return {
        ...existing,
        status:
          existing.status === 'pending' ? 'pending_approval' : existing.status,
        workflow_instance_id: existing.workflow_instance_id,
        spawn: {
          workflowInstanceId: existing.workflow_instance_id,
          idempotent: true,
        },
      };
    }
    const spawn =
      await this.recruitmentWorkflowBridge.startRecruitmentWorkflowIfConfigured(
        {
          businessType: WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN,
          businessId: planId,
          companyId: existing.company_id,
          submitterUserId: options?.submitterUserId,
          tenantId: options?.tenantId,
          companySlug: options?.companySlug ?? existing.company_id,
        },
      );
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
    options?: {
      submitterUserId?: string;
      tenantId?: string;
      companySlug?: string;
    },
  ) {
    await this.ensureWave2Schema();
    await this.recruitmentWorkflowBridge.ensureSchema();
    const existingRes = await this.db.query(
      `SELECT id, company_id, full_name, email, source, stage, workflow_instance_id::text AS workflow_instance_id
       FROM public.candidates WHERE id = $1::uuid LIMIT 1;`,
      [candidateId],
    );
    const existing = existingRes.rows[0] as
      | {
          id: string;
          company_id: string;
          full_name: string;
          email: string | null;
          source: string | null;
          stage: string;
          workflow_instance_id?: string | null;
        }
      | undefined;
    if (!existing) {
      throw new ApiException(
        'HRM-REC-CP-404',
        'Candidate not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-REC-CP-404',
      mismatchCode: 'HRM-REC-CP-409',
    });
    const spineLink = await ensureSpineRecruitmentCandidateFromPool(
      this.db,
      existing,
      scope.companyIds,
    );
    if (existing.workflow_instance_id) {
      return {
        ...existing,
        recruitment_candidate_id: spineLink?.id ?? null,
        spine_created: spineLink?.created ?? false,
        spawn: {
          workflowInstanceId: existing.workflow_instance_id,
          idempotent: true,
        },
      };
    }
    const spawn =
      await this.recruitmentWorkflowBridge.startRecruitmentWorkflowIfConfigured(
        {
          businessType: WF_BUSINESS_TYPE_HRM_CANDIDATE,
          businessId: candidateId,
          companyId: existing.company_id,
          submitterUserId: options?.submitterUserId,
          tenantId: options?.tenantId,
          companySlug: options?.companySlug ?? existing.company_id,
        },
      );
    const refreshed = await this.db.query(
      `SELECT * FROM public.candidates WHERE id = $1::uuid LIMIT 1;`,
      [candidateId],
    );
    return {
      ...refreshed.rows[0],
      recruitment_candidate_id: spineLink?.id ?? null,
      spine_created: spineLink?.created ?? false,
      spawn,
      spawnMissing: !spawn?.workflowInstanceId,
    };
  }

  /**
   * @CODE-MEMORY method · FR-HRM-SC-JT-01 / UC-HRM-RC-07 / UC-BP-REC-00 · F-YCTD-JD-01 · F-JD-01
   * AC-SET-FS / AC-HRM-PICKER-01 — list supports q + status/active filter
   * bindable=true / for=yctd → status=active AND is_active=TRUE; empty → 200 items=[] (Diễn biến 1a/1b)
   * TechSpec: API-01 §6.1 · DATA-01 O2
   */
  async listJobDescriptionTemplates(
    companyId: string,
    authorization?: string,
    query?: {
      q?: string;
      active?: string;
      status?: string;
      bindable?: string;
      for?: string;
    },
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope);
    if (query?.q?.trim()) {
      values.push(`%${query.q.trim().toLowerCase()}%`);
      filters.push(
        `(lower(code) LIKE $${values.length} OR lower(title) LIKE $${values.length} OR lower(COALESCE(position_name, '')) LIKE $${values.length} OR lower(COALESCE(position_code, '')) LIKE $${values.length})`,
      );
    }
    const bindable = isYctdBindableListQuery(query);
    const statusRaw = query?.status?.trim().toLowerCase();
    const activeRaw = query?.active?.trim().toLowerCase();
    if (bindable) {
      // Diễn biến 1a — picker YCTD: Hiệu lực only (BR-BP-JD-01 / BR-JD-BINDABLE-01).
      filters.push(`status = 'active' AND is_active = TRUE`);
    } else if (
      statusRaw === 'draft' ||
      statusRaw === 'active' ||
      statusRaw === 'retired'
    ) {
      filters.push(`status = '${statusRaw}'`);
    } else if (
      activeRaw === '1' ||
      activeRaw === 'true' ||
      activeRaw === 'active' ||
      activeRaw === 'yes'
    ) {
      filters.push(`status = 'active'`);
    } else if (
      activeRaw === '0' ||
      activeRaw === 'false' ||
      activeRaw === 'inactive' ||
      activeRaw === 'draft' ||
      activeRaw === 'no'
    ) {
      filters.push(`status IN ('draft', 'retired')`);
    }
    const whereClause = filters.length ? filters.join(' AND ') : 'TRUE';
    const res = await this.db.query(
      bindable
        ? `SELECT id, company_id, code, title, position_name, position_code, job_description, requirements,
                  status, is_active, created_at, updated_at
           FROM public.job_description_templates
           WHERE ${whereClause}
           ORDER BY updated_at DESC, created_at DESC;`
        : `SELECT id, company_id, code, title, position_name, position_code, job_description, requirements, notes,
              status, is_active, values_json, layout_snapshot_json, layout_version, created_at, updated_at,
              (values_json IS NOT NULL) AS has_dynamic_values
       FROM public.job_description_templates
       WHERE ${whereClause}
       ORDER BY updated_at DESC, created_at DESC;`,
      values,
    );
    if (bindable) {
      const items = res.rows.map((row) =>
        toYctdBindableListItem(row as Record<string, unknown>),
      );
      // Empty library = 200 + [] (DV-YCTD-JD-14) — not 404.
      return { total: items.length, data: items, items };
    }
    return {
      total: res.rows.length,
      data: res.rows.map((row) =>
        this.mapJdTemplateRow(row as Record<string, unknown>),
      ),
    };
  }

  /**
   * F-YCTD-JD-02 — preview title + short; STATUS if not Hiệu lực; no values_json persist contract.
   */
  async getYctdJdPreview(
    templateId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [templateId];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query<YctdJdTemplateBindRow>(
      `SELECT id::text AS id, code, title, job_description, requirements, status, is_active,
              position_code, position_name
       FROM public.job_description_templates
       WHERE ${filters.join(' AND ')} LIMIT 1`,
      values,
    );
    const row = assertYctdJdBindableOrThrow(res.rows[0]);
    return toYctdJdPreview(row);
  }

  /**
   * F-JD-03 — GET by id · same resolveHrmListScope + pushCompanyIdFilter as list (U19 scope_parity).
   * Display-ready sections from layout_snapshot × values (OS 28 — FE must not join).
   */
  async getJobDescriptionTemplateById(
    templateId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    if (this.jdDynamic) await this.jdDynamic.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [templateId];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query(
      `SELECT id, company_id, code, title, position_name, position_code, job_description, requirements, notes,
              status, is_active, values_json, layout_snapshot_json, layout_version, created_at, updated_at
       FROM public.job_description_templates
       WHERE ${filters.join(' AND ')} LIMIT 1`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-REC-JD-404',
        'JD template not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const row = res.rows[0] as Record<string, unknown>;
    const valuesJson =
      (row.values_json as Record<string, unknown> | null) ?? null;
    const snapshot = row.layout_snapshot_json;
    const sections = this.jdDynamic
      ? this.jdDynamic.buildDisplaySections(snapshot, valuesJson, {
          title: row.title as string,
          job_description: row.job_description as string | null,
          requirements: row.requirements as string | null,
        })
      : [];
    const mapped = this.mapJdTemplateRow(row);
    return {
      ...mapped,
      values: valuesJson,
      layout_snapshot: snapshot,
      sections,
      has_dynamic_values: valuesJson != null,
    };
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
      status?: string;
      values_json?: Record<string, unknown>;
      values?: Record<string, unknown>;
      layout_snapshot?: Record<string, unknown>;
      layout_snapshot_json?: Record<string, unknown>;
      layout_version?: number;
      job_family?: string;
      optional_group_codes?: string[];
    },
    authorization?: string,
    options?: { tenantId?: string },
  ) {
    await this.ensureWave2Schema();
    if (this.jdDynamic) await this.jdDynamic.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const code = payload.code.trim();
    let title = payload.title.trim();
    if (!code || !title) {
      throw new ApiException(
        'HRM-REC-JD-400',
        'code and title are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    // AC-SET-FS-03 / FR-HRM-RC-JD-01 — position_code catalog SoT (not free title/position_name alone).
    const catalogPos = await this.assertJdPositionCodeInCatalog({
      companyId,
      positionCode: payload.position_code ?? '',
      tenantId: options?.tenantId,
      authorization,
    });
    const positionName =
      payload.position_name?.trim() || catalogPos.label || null;
    const dup = await this.db.query(
      `SELECT id FROM public.job_description_templates WHERE company_id = $1 AND lower(code) = lower($2) LIMIT 1;`,
      [companyId, code],
    );
    if (dup.rows[0]) {
      throw new ApiException(
        'HRM-JD-CODE-DUP',
        'JD template code already exists for company',
        HttpStatus.CONFLICT,
      );
    }

    let valuesMap: Record<string, unknown> = {
      ...(payload.values_json ?? payload.values ?? {}),
    };
    if (!valuesMap.title) valuesMap.title = title;
    if (!valuesMap.code) valuesMap.code = code;
    if (!valuesMap.position_code) valuesMap.position_code = catalogPos.code;
    if (payload.job_description && !valuesMap.responsibilities) {
      valuesMap.responsibilities = payload.job_description;
    }
    if (payload.requirements && !valuesMap.requirements) {
      valuesMap.requirements = payload.requirements;
    }

    let snapshot = (payload.layout_snapshot_json ?? payload.layout_snapshot) as
      | JdLayoutSnapshotV2
      | undefined;
    let layoutVersion = payload.layout_version ?? 1;

    if (this.jdDynamic) {
      if (!snapshot) {
        snapshot = await this.jdDynamic.materializeSnapshotFromPack(
          companyId,
          authorization,
          {
            position_code: catalogPos.code,
            job_family: payload.job_family,
            optional_group_codes: payload.optional_group_codes,
          },
        );
      }
      // F-JD-02 save-as-draft — allow incomplete required; publish enforces O3.
      const validated = this.jdDynamic.validateSnapshotAndValues(
        snapshot,
        valuesMap,
        {
          enforceRequired: false,
        },
      );
      snapshot = validated.snapshot ?? snapshot;
      valuesMap = validated.values;
      layoutVersion = validated.layout_version;
    }

    // Bridge write — canonical columns for list/search + legacy readers (ARCH-02 §3.4).
    title = String(valuesMap.title ?? title).trim();
    const bridgedCode = String(valuesMap.code ?? code).trim();
    const bridgedDesc =
      payload.job_description?.trim() ||
      (typeof valuesMap.responsibilities === 'string'
        ? valuesMap.responsibilities
        : null);
    const bridgedReq =
      payload.requirements?.trim() ||
      (typeof valuesMap.requirements === 'string'
        ? valuesMap.requirements
        : null);

    // P04 / F-JD-02 — force draft + is_active=false; IGNORE client is_active=true / status=active.
    const status: JdTemplateStatus = 'draft';
    const isActive = false;

    const res = await this.db.query(
      `INSERT INTO public.job_description_templates
        (id, company_id, code, title, position_name, position_code, job_description, requirements, notes,
         status, is_active, values_json, layout_snapshot_json, layout_version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14)
       RETURNING id, company_id, code, title, position_name, position_code, job_description, requirements, notes,
                 status, is_active, values_json, layout_snapshot_json, layout_version, created_at, updated_at;`,
      [
        randomUUID(),
        companyId,
        bridgedCode,
        title,
        positionName,
        catalogPos.code,
        bridgedDesc,
        bridgedReq,
        payload.notes?.trim() || null,
        status,
        isActive,
        Object.keys(valuesMap).length ? JSON.stringify(valuesMap) : null,
        snapshot ? JSON.stringify(snapshot) : null,
        layoutVersion,
      ],
    );
    // FORBIDDEN: dual-write job_postings (Lane B ≠ FR-UC-BP-REC-00 SoT).
    return this.mapJdTemplateRow(res.rows[0]);
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
      status?: string;
      action?: string;
      values_json?: Record<string, unknown>;
      values?: Record<string, unknown>;
      layout_snapshot?: Record<string, unknown>;
      layout_snapshot_json?: Record<string, unknown>;
      layout_version?: number;
      job_family?: string;
    },
    authorization?: string,
    options?: { tenantId?: string },
  ) {
    await this.ensureWave2Schema();
    if (this.jdDynamic) await this.jdDynamic.ensureSchema();

    const actionRaw = payload.action?.trim().toLowerCase();
    const statusWant = payload.status?.trim().toLowerCase();
    // Optional synonym — primary path = POST …/publish (API-01 §6.4.2).
    if (actionRaw === 'publish' || statusWant === 'active') {
      return this.publishJobDescriptionTemplate(
        templateId,
        companyId,
        authorization,
      );
    }

    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query<{
      company_id: string;
      code: string;
      position_code: string | null;
      status: string | null;
      is_active: boolean;
      values_json: Record<string, unknown> | null;
      layout_snapshot_json: JdLayoutSnapshotV2 | null;
      layout_version: number;
    }>(
      `SELECT company_id::text AS company_id, code, position_code, status, is_active,
              values_json, layout_snapshot_json, layout_version
       FROM public.job_description_templates WHERE id = $1::uuid LIMIT 1;`,
      [templateId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-REC-JD-404',
      mismatchCode: 'HRM-REC-JD-409',
    });
    const existing = peek.rows[0];
    const currentStatus = normalizeJdTemplateStatus(existing);

    if (currentStatus === 'retired') {
      throw new ApiException(
        'HRM-REC-JD-RETIRED-LOCKED',
        'Retired JD template cannot be mutated — reactivate HOLD in MVP',
        HttpStatus.CONFLICT,
      );
    }

    // Boolean-only cannot publish (O3) — must use POST …/publish.
    if (payload.is_active === true) {
      throw new ApiException(
        'HRM-REC-JD-BRIDGE',
        'Cannot set is_active=true without publish — use POST …/job-templates/:id/publish',
        HttpStatus.BAD_REQUEST,
      );
    }

    const nextCode = payload.code?.trim();
    if (nextCode && nextCode.toLowerCase() !== existing.code.toLowerCase()) {
      const dup = await this.db.query(
        `SELECT id FROM public.job_description_templates
         WHERE company_id = $1 AND lower(code) = lower($2) AND id <> $3::uuid LIMIT 1;`,
        [existing.company_id, nextCode, templateId],
      );
      if (dup.rows[0]) {
        throw new ApiException(
          'HRM-JD-CODE-DUP',
          'JD template code already exists for company',
          HttpStatus.CONFLICT,
        );
      }
    }

    let nextPositionCode: string | undefined;
    let nextPositionName: string | null | undefined;
    if (payload.position_code !== undefined) {
      const catalogPos = await this.assertJdPositionCodeInCatalog({
        companyId: existing.company_id,
        positionCode: payload.position_code,
        tenantId: options?.tenantId,
        authorization,
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

    const incomingValues = payload.values_json ?? payload.values;
    const incomingSnapshot = (payload.layout_snapshot_json ??
      payload.layout_snapshot) as JdLayoutSnapshotV2 | undefined;

    let patchTitle =
      payload.title !== undefined ? payload.title.trim() : undefined;
    let patchCode =
      nextCode !== undefined && nextCode.length > 0 ? nextCode : undefined;
    let patchDesc =
      payload.job_description !== undefined
        ? payload.job_description.trim() || null
        : undefined;
    let patchReq =
      payload.requirements !== undefined
        ? payload.requirements.trim() || null
        : undefined;
    let patchValuesJson: string | undefined;
    let patchSnapshotJson: string | undefined;
    let patchLayoutVersion: number | undefined;

    if (
      this.jdDynamic &&
      (incomingValues !== undefined || incomingSnapshot !== undefined)
    ) {
      const mergedValues = {
        ...(existing.values_json ?? {}),
        ...(incomingValues ?? {}),
      };
      const snap =
        incomingSnapshot ?? existing.layout_snapshot_json ?? undefined;
      if (snap) {
        const validated = this.jdDynamic.validateSnapshotAndValues(
          snap,
          mergedValues,
          {
            enforceRequired: false,
          },
        );
        patchValuesJson = JSON.stringify(validated.values);
        patchSnapshotJson = JSON.stringify(validated.snapshot);
        patchLayoutVersion = payload.layout_version ?? validated.layout_version;
        if (typeof validated.values.title === 'string')
          patchTitle = validated.values.title;
        if (typeof validated.values.code === 'string')
          patchCode = validated.values.code;
        if (typeof validated.values.responsibilities === 'string') {
          patchDesc = validated.values.responsibilities;
        }
        if (typeof validated.values.requirements === 'string') {
          patchReq = validated.values.requirements;
        }
      } else if (incomingValues !== undefined) {
        patchValuesJson = JSON.stringify(mergedValues);
      }
    } else {
      if (incomingValues !== undefined)
        patchValuesJson = JSON.stringify(incomingValues);
      if (incomingSnapshot !== undefined) {
        patchSnapshotJson = JSON.stringify(incomingSnapshot);
        patchLayoutVersion =
          payload.layout_version ?? Math.max(existing.layout_version ?? 1, 2);
      }
    }

    const setParts: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    const pushSet = (col: string, value: unknown, cast?: string) => {
      values.push(value);
      setParts.push(
        cast
          ? `${col} = $${values.length}${cast}`
          : `${col} = $${values.length}`,
      );
    };
    if (patchCode !== undefined) pushSet('code', patchCode);
    if (patchTitle !== undefined) pushSet('title', patchTitle);
    if (payload.position_name !== undefined) {
      pushSet('position_name', payload.position_name.trim() || null);
    } else if (nextPositionName !== undefined) {
      pushSet('position_name', nextPositionName);
    }
    if (nextPositionCode !== undefined)
      pushSet('position_code', nextPositionCode);
    if (patchDesc !== undefined) pushSet('job_description', patchDesc);
    if (patchReq !== undefined) pushSet('requirements', patchReq);
    if (payload.notes !== undefined)
      pushSet('notes', payload.notes.trim() || null);
    // Soft-retire via PATCH status=retired | is_active=false (bridge both).
    if (statusWant === 'retired' || payload.is_active === false) {
      pushSet('status', 'retired');
      pushSet('is_active', false);
    }
    if (patchValuesJson !== undefined)
      pushSet('values_json', patchValuesJson, '::jsonb');
    if (patchSnapshotJson !== undefined)
      pushSet('layout_snapshot_json', patchSnapshotJson, '::jsonb');
    if (patchLayoutVersion !== undefined)
      pushSet('layout_version', patchLayoutVersion);

    values.push(templateId);
    const idParam = `$${values.length}`;
    const filters = [`id = ${idParam}::uuid`];
    pushCompanyIdFilter(filters, values, scope);

    const res = await this.db.query(
      `UPDATE public.job_description_templates SET ${setParts.join(', ')}
       WHERE ${filters.join(' AND ')}
       RETURNING id, company_id, code, title, position_name, position_code, job_description, requirements, notes,
                 status, is_active, values_json, layout_snapshot_json, layout_version, created_at, updated_at;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-REC-JD-404',
        'JD template not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapJdTemplateRow(res.rows[0]);
  }

  /**
   * F-JD-04 publish — Nháp → Hiệu lực · required-on-layout gate · mint HRM-REC-JD-PUB-*.
   */
  async publishJobDescriptionTemplate(
    templateId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    if (this.jdDynamic) await this.jdDynamic.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query<{
      company_id: string;
      status: string | null;
      is_active: boolean;
      values_json: Record<string, unknown> | null;
      layout_snapshot_json: JdLayoutSnapshotV2 | null;
    }>(
      `SELECT company_id::text AS company_id, status, is_active, values_json, layout_snapshot_json
       FROM public.job_description_templates WHERE id = $1::uuid LIMIT 1;`,
      [templateId],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-REC-JD-404',
      mismatchCode: 'HRM-REC-JD-409',
    });
    const row = peek.rows[0];
    const current = normalizeJdTemplateStatus(row);
    if (current === 'retired') {
      throw new ApiException(
        'HRM-REC-JD-REACTIVATE-HOLD',
        'Reactivate retired→active is HOLD in MVP',
        HttpStatus.CONFLICT,
      );
    }
    if (current !== 'draft') {
      throw new ApiException(
        'HRM-REC-JD-PUB-STATE',
        'Only draft JD templates can be published',
        HttpStatus.CONFLICT,
      );
    }

    const snapshot = row.layout_snapshot_json;
    if (
      !snapshot ||
      !Array.isArray(snapshot.groups) ||
      snapshot.groups.length === 0
    ) {
      throw new ApiException(
        'HRM-REC-JD-PUB-LAYOUT-EMPTY',
        'Effective layout_snapshot.groups required to publish',
        HttpStatus.BAD_REQUEST,
        { status: 'draft' },
      );
    }

    const valuesMap = row.values_json ?? {};
    const missing = this.jdDynamic
      ? this.jdDynamic.collectMissingRequiredKeys(snapshot, valuesMap)
      : [];
    if (missing.length > 0) {
      throw new ApiException(
        'HRM-REC-JD-PUB-REQUIRED',
        'Required fields missing for publish',
        HttpStatus.BAD_REQUEST,
        { missing_keys: missing, status: 'draft' },
      );
    }

    // Structure validate (unknown keys / title-first) with required already checked.
    if (this.jdDynamic) {
      this.jdDynamic.validateSnapshotAndValues(snapshot, valuesMap, {
        enforceRequired: true,
      });
    }

    const filters = ['id = $1::uuid'];
    const values: unknown[] = [templateId];
    pushCompanyIdFilter(filters, values, scope);
    const res = await this.db.query(
      `UPDATE public.job_description_templates
          SET status = 'active', is_active = TRUE, updated_at = NOW()
        WHERE ${filters.join(' AND ')}
        RETURNING id, company_id, code, title, position_name, position_code, job_description, requirements, notes,
                  status, is_active, values_json, layout_snapshot_json, layout_version, created_at, updated_at;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-REC-JD-404',
        'JD template not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapJdTemplateRow(res.rows[0]);
  }

  async deleteJobDescriptionTemplate(
    templateId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWave2Schema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [templateId];
    pushCompanyIdFilter(filters, values, scope);
    // Soft-retire — status=retired + is_active=false; keep history for YCTD soft FK (no CASCADE).
    const res = await this.db.query(
      `UPDATE public.job_description_templates
          SET status = 'retired', is_active = FALSE, updated_at = NOW()
        WHERE ${filters.join(' AND ')}
        RETURNING id, status, is_active;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-REC-JD-404',
        'JD template not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return { id: templateId, status: 'retired' as const, is_active: false };
  }

  /** Display-ready JD row — status + is_active bridge (DENY boolean-only). */
  private mapJdTemplateRow(row: Record<string, unknown>) {
    const status = normalizeJdTemplateStatus({
      status: row.status as string | null | undefined,
      is_active: row.is_active as boolean | null | undefined,
    });
    return {
      id: String(row.id),
      company_id: String(row.company_id),
      code: String(row.code ?? ''),
      title: String(row.title ?? ''),
      position_name: (row.position_name as string | null) ?? null,
      position_code: (row.position_code as string | null) ?? null,
      job_description: (row.job_description as string | null) ?? null,
      requirements: (row.requirements as string | null) ?? null,
      notes: (row.notes as string | null) ?? null,
      status,
      is_active: bridgeIsActiveForStatus(status),
      values_json: (row.values_json as Record<string, unknown> | null) ?? null,
      layout_snapshot_json: row.layout_snapshot_json ?? null,
      layout_version:
        row.layout_version != null ? Number(row.layout_version) : null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      has_dynamic_values:
        row.has_dynamic_values != null
          ? Boolean(row.has_dynamic_values)
          : row.values_json != null,
    };
  }
}
