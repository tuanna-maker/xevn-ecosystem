/**
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-REC-A
 * change_mode: UPGRADE
 * What: Precision Motion title ≥20 · sharp secondary copy (R02 YCTD spine)
 * Why: ADR §16 · inventory W3-REC-A R02
 * must_keep: Submit WF / JD template picker / list↔detail scope · U65 · no Nest invent
 * ADR: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-UI-P0-LOGO-FONT-TITLE-01
 * change_mode: FIX
 * What: Create YCTD form — `title` FormField first (before JD library picker)
 * Why: Sponsor — popup thêm mới: trường Tiêu đề đứng đầu form
 * must_keep: JD template required · applyTemplate snapshot · Submit WF · U65
 * LastVerified: docs/qa/evidence/po-hrm-ui-p0-logo-font-title-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-YCTD-REF-FE-01
 * change_mode: ADD
 * What: YCTD picker bindable=true only; preview title/short; STATUS/REQUIRED surface;
 *       list/detail jd_code·jd_title after 2xx+F5
 * Why: SRS FR-UC-BP-REC-02 Diễn biến 1a–1d · API-01 F-YCTD-JD-01..05 · J-HRM-JD-YCTD-01
 * must_keep: soft FK job_template_id · HDSD labels · empty CTA · no JobPostingsTab SoT · U65
 * LastVerified: docs/qa/evidence/po-hrm-jd-yctd-ref-fe-01.md
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01
 * change_mode: ADD
 * What: YCTD employment_type picker binds EMP effective catalog (F-EMP-CAT-EFF-02)
 * Why: AC-PLT-EMP-04/05 · R-PLT-EMP-FE — cấm EMPLOYMENT_TYPE_OPTIONS closed Select SoT
 * must_keep: JD template required · Submit WF · soft FK · U65 · recruitment_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Form forks in_plan/out_of_plan · hire_reason/replace · out_reason · O2 CELL-QTY toast ·
 *       O4 classify banner · transitions approve/reject · pipeline-flags when receivable ·
 *       list/detail F5 mode/JD/flags · proposals redirect CTA only (O5)
 * Why: UC-BP-REC-02/02b · API-01 F-REC-YCTD-01..04 · BA Diễn biến §3.4/§4.4 · U65
 * must_keep: UF-HRM-12 · J-HRM-JD-YCTD-01 soft FK · REC-01 Định biên · REC-03 OUT · honesty false
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-FE-01
 * change_mode: UPGRADE
 * What: Detail approval-chain SHORT/LONG + next approver + BOD step CTAs; reject reason +
 *       replace_employee visible; cell CatalogSearchPicker from REC-01 approved cells (deep-link keep)
 * Why: QC remain AC-02d / 02b-05 / ALT-01/02 · R-REC-02-CELL-PICKER · U65 FE-after-2xx+F5
 * must_keep: L1 tokens · O4 banner · O5 redirect · UF-HRM-12 · JD soft FK · REC-01 SoT · honesty false
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * change_mode: ADD
 * What: focusRequisitionId prop — open YCTD detail from Nest dashboard drill (J-HRM-05)
 * Why: UC-BP-REC-08 AC-REC-08-06 · DENY Campaign
 * must_keep: openDetail GET-by-id · Wave-2 forms · honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-04-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Quét kho CV dialog · complete|skip · posted gate UX · F5 internal_scan_* badge
 * Why: UC-BP-REC-04 · API-01 F-REC-CV-SCAN-01..03 · BR-BP-CV-01 · BA Diễn biến §3.4 · U65
 * must_keep: /recruitment/* only · UV-YCTD attach · REC-03 OUT · W2 flags · honesty false · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-REC-YCTD-CREATE-BLOCKER-01
 * change_mode: FIX
 * What: Lưu nháp validateYctdCreateForm draft_save; applyTemplate seeds out_of_plan_reason; WF complete gate
 * Why: U65 POST blocked — FE zod required out_of_plan_reason while BE draft optional (Y-S7)
 * must_keep: DEPTCONREG1 dept picker · complete on Gửi duyệt QT · U65
 */
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, Plus, RefreshCw, Pencil } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import {
  createJobRequisition,
  getJobDescriptionTemplateYctdPreview,
  getJobRequisition,
  listEmployees,
  listJobDescriptionTemplates,
  listRecruitmentPlans,
  patchJobRequisitionPipelineFlags,
  submitJobRequisitionWorkflow,
  transitionJobRequisition,
  updateJobRequisition,
  type HrmJobDescriptionTemplate,
  type HrmJobRequisition,
  type HrmJobRequisitionHeadcountMode,
  type HrmJobRequisitionHireReason,
  type HrmYctdJdPreview,
} from '@/integrations/hrmApi';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import {
  isRequisitionJobTemplateSelected,
  REQUISITION_EMPTY_JD_LIBRARY_HINT_VI,
  REQUISITION_JD_STATUS_BLOCKED_VI,
  REQUISITION_JD_TEMPLATE_REQUIRED_VI,
  REQUISITION_LOCAL_STATUSES,
  REQUISITION_OPEN_JD_LIBRARY_CTA_VI,
  REQUISITION_STATUS_LABEL_VI,
  normalizeRequisitionHeadcount,
  requisitionDepartmentPickerOptions,
  buildRequisitionCreateFormDefaults,
  isRequisitionCreateFormReady,
  resolveRequisitionDepartmentDefault,
  resolveEffectiveJobTemplates,
  unwrapJobDescriptionTemplateRows,
  filterBindableJobTemplates,
  composeLocalYctdPreview,
  resolveRequisitionJdDisplay,
} from '@/lib/jobRequisitionUi';
import {
  canMutateYctdPipelineFlags,
  collectApprovedNeedHireCellOptions,
  ensureHeadcountCellOptionPresent,
  isYctdClassificationRequired,
  normalizeYctdHeadcountMode,
  normalizeYctdHireReason,
  parseYctdCreatePresetFromSearch,
  resolvePipelineFlags,
  resolveYctdApprovalChainView,
  resolveYctdCellLabel,
  resolveYctdReplaceEmployeeDisplay,
  validateYctdCreateForm,
  YCTD_BOD_BLOCKED_CV_VI,
  YCTD_CELL_PICKER_EMPTY_VI,
  YCTD_CELL_PICKER_LABEL_VI,
  YCTD_CELL_QTY_HINT_VI,
  YCTD_CLASSIFY_BANNER_VI,
  YCTD_HIRE_REASON_LABEL_VI,
  YCTD_LONG_MATRIX_HINT_VI,
  YCTD_MODE_LABEL_VI,
  YCTD_NOT_RECEIVABLE_HINT_VI,
  YCTD_REJECT_REASON_REQUIRED_VI,
  yctdModeBadgeLabel,
  type YctdApprovedCellPickerOption,
} from '@/lib/jobRequisitionYctdWave2';
import {
  canSetYctdPostedFromScan,
  cvScanAuditBadgeLabel,
  formatCvScanAtVi,
  resolveCvScanAuditState,
  YCTD_CV_SCAN_HINT_VI,
  YCTD_CV_SCAN_POSTED_BLOCKED_VI,
  YCTD_CV_SCAN_TITLE_VI,
} from '@/lib/jobRequisitionCvScan';
import { InternalCvScanDialog } from '@/components/recruitment/InternalCvScanDialog';
import { parseMonthsData } from '@/lib/recruitmentPlanHeadcount';
import { resolveRequisitionMutateCompanyId } from '@/lib/jobRequisitionScope';
import {
  canSubmitRequisitionWorkflow,
  detectRecruitmentSpawnMissing,
  isRecruitmentWorkflowLocked,
  RECRUITMENT_WF_LOCKED_HINT_VI,
} from '@/lib/recruitmentWorkflowUi';
import { useJobRequisitions } from '@/hooks/useJobRequisitions';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import { useEmpEmploymentTypesEffective } from '@/hooks/useEmpEmploymentTypesEffective';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import {
  jobGradeOptionsFromCatalog,
  jobTitleOptionsFromCatalog,
  resolveJobGradeLabel,
} from '@/lib/catalogSearchPicker';
import { resolveEmpEmploymentTypeLabel } from '@/lib/empEmploymentTypeCatalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { RecruitmentWfSpawnBanner } from '@/components/recruitment/RecruitmentWfSpawnBanner';
import {
  HDSD_MUTATE_TEST_IDS,
  hdsdRequisitionSubmitWfTestId,
} from '@/lib/hdsdMutateTestIds';
import {
  resolveEmploymentTypeDisplay,
  resolveHrmCompanyIdDisplay,
  resolveWorkflowInstanceDisplay,
} from '@/lib/labelMaps';

const OUT_OF_PLAN_REASONS = [
  'Phát sinh dự án mới',
  'Mở rộng quy mô kinh doanh',
  'Thay thế nhân sự đột xuất',
  'Bổ sung định biên tạm thời',
  'Khác'
];

const createSchema = z
  .object({
    title: z.string().min(1, 'Nhập tiêu đề yêu cầu').max(200),
    department: z.string().min(1, 'Nhập phòng ban').max(50),
    employment_type: z.string().min(1, 'Chọn loại hình'),
    /** FR-HRM-RC-01 — số lượng cần tuyển ≥ 1 (integer). */
    headcount: z.coerce
      .number({ invalid_type_error: 'Nhập số lượng cần tuyển' })
      .int('Số lượng phải là số nguyên')
      .min(1, 'Số lượng phải lớn hơn 0'),
    /** BM-AC-05-02 / sponsor JD-only — bắt buộc chọn template từ thư viện. */
    job_template_id: z
      .string()
      .min(1, REQUISITION_JD_TEMPLATE_REQUIRED_VI)
      .refine((id) => isRequisitionJobTemplateSelected(id), {
        message: REQUISITION_JD_TEMPLATE_REQUIRED_VI,
      }),
    /** Snapshot từ JD (BR-CD-F6-02); được chỉnh bản chép sau khi chọn template. */
    headcount_mode: z.enum(['in_plan', 'out_of_plan'], {
      required_error: 'Chọn trong hoặc ngoài định biên',
    }),
    headcount_cell_id: z.string().max(120).optional(),
    hire_reason: z.enum(['new', 'replace'], {
      required_error: 'Chọn lý do tuyển',
    }),
    replace_employee_id: z.string().max(80).optional(),
    out_of_plan_reason: z.string().max(2000).optional(),
    /** Optional — catalog `job_grades` code when EFF>0 (AC-SET-CONSUMER-JG-REC-01). */
    job_grade_key: z.string().max(64).optional().or(z.literal('')),
  })
  .superRefine((values, ctx) => {
    const gate = validateYctdCreateForm(values, 'draft_save');
    if (!gate.ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: gate.message,
        path: [gate.field],
      });
    }
  });

type CreateFormValues = z.infer<typeof createSchema>;

function statusBadgeVariant(status: HrmJobRequisition['status']) {
  if (status === 'open' || status === 'approved' || status === 'open_for_hire') return 'default';
  if (status === 'on_hold' || status === 'pending_approval') return 'secondary';
  if (status === 'rejected') return 'destructive';
  return 'outline';
}

function requisitionLocked(row: HrmJobRequisition): boolean {
  return isRecruitmentWorkflowLocked(row.workflow_instance_id, row.status, 'requisition');
}

function canSubmitRequisitionRow(row: HrmJobRequisition): boolean {
  return canSubmitRequisitionWorkflow(row.workflow_instance_id, row.status);
}

/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Yêu cầu tuyển dụng
 * UC:         UC-HRM-RC-08 · UC-HRM-22 · UC-HRM-REC-WF-02 · FR-HRM-RC-01
 * BR:         BR-CD-F6-02 · BR-REC-WF-02 · BR-REC-WF-08 · BR-REC-WF-09
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.7 FR-HRM-RC-01 · docs/hrm/SRS.md §13 UC-HRM-22
 * TechSpec:   docs/hrm/TECHSPEC.md §14.7 · §14.9 G-RC-01 · docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §6 AC-CD-F6-02 · BMINUTES BM-AC-05-02
 * DataContract: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §3–§6
 * Purpose:    Tạo/sửa/list YCTD; bắt buộc số lượng (headcount ≥1); bắt buộc chọn JD thư viện;
 *             snapshot mô tả/yêu cầu từ template (chỉnh bản chép OK); gửi WF; khóa PATCH khi WF active.
 * WorkItem:   BM-FE-JD-REQ-ONLY-01 · FE-HRM-G-RC-01 · CD-FB-09-RECRUIT · XHRM-REC-WF-FE-01
 * Coded:      2026-07-21
 * Callers:    pages/Recruitment.tsx tab Yêu cầu (onOpenJdLibrary → tab Thư viện JD)
 * Callees:    createJobRequisition · updateJobRequisition · getJobRequisition · submitJobRequisitionWorkflow
 * FEActions:  Thêm → chọn JD * → Lưu (POST job_template_id + headcount + snapshot) · Sửa · Chi tiết
 * BEChain:    POST/PATCH/GET /api/hrm/recruitment/requisitions → job_requisitions.headcount + job_template_id
 * Impact:     Thiếu JD template → chặn submit FE; thiếu headcount → BE 400; nhầm job_postings → sai nghiệp vụ
 * must_keep:  G-RC-01 headcount; snapshot JD (not live link); job_template_id; J-HRM-05; UF-HRM-12; WF LOCK; U65 no seed
 * SOLID:      Tab UI tách isRequisitionJobTemplateSelected / normalizeRequisitionHeadcount (jobRequisitionUi)
 * LastVerified: docs/qa/evidence/bm-fe-jd-req-only-01-20260722.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-FE-01
 * Wire POST submit-workflow; lock status edit; SPAWN-MISSING banner (U65 FE-only).
 *
 * @CODE-MEMORY-CHANGE 2026-07-21 FE-HRM-G-RC-01
 * ADD headcount create/edit/list/detail; zod min 1; Input type=number (count EXEMPT money group);
 * submit integer; must_keep WF LOCK + không đụng job_postings / headcount_proposals.
 *
 * @CODE-MEMORY-CHANGE 2026-07-23 D-HRM-SETTINGS-MD-CRUD-FE-01
 * change_mode: ADD
 * What: CatalogSearchPicker for JD template + department; AC-HRM-PICKER-01 search
 * Why: BR-HRM-MD-01 cấm free-text SoT trên YCTD
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-HRM-U72-LABEL-FE-01
 * change_mode: FIX
 * What: employment_type / company_id / workflow_instance_id qua labelMaps (F-07..F-09)
 * Why: BA U72 FAIL-LABEL-LEAK; unknown → «—»; không UUID full
 * SRS/BR: docs/hrm/SRS_FIELD_DISPLAY.md AC-FD-07..09 · FR-HRM-U72-LABEL-01
 * must_keep: WF LOCK + headcount integer; catalog pickers
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-07
 * change_mode: FIX
 * What: handleOpenCreate sync applyTemplate + buildRequisitionCreateFormDefaults; stop createOpen refetch storm
 * Why: QA RET-03-HRM-R4 — hdsd-requisition-form-ready timeout; job-templates GET storm
 * must_keep: G-RC-01 headcount; WF LOCK; TC-HDSD-08-02-01 leave regression untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-08
 * change_mode: FIX
 * What: resolveRequisitionDepartmentDefault + dept backfill when JD pre-selected; template hints in picker
 * Why: QA RET-03-HRM-R5 — form-ready false when dept empty despite JD row (applyTemplate skipped)
 * must_keep: FE-07 refetch storm guard; job-templates mount fetch keyed by companyId
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-09
 * change_mode: FIX
 * What: isRequisitionCreateFormReady — fallback title/dept từ templates[0] khi RHF watch chưa sync
 * Why: QA R6 — hdsd-requisition-form-ready absent dù pilot JD có title
 * must_keep: FE-07 refetch guard; G-RC-01 headcount
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-10
 * change_mode: FIX
 * What: fallback internal useJobTemplates when parent prop []; refetch on open create if library empty
 * Why: QA R7 — jd-library row visible but recruitmentJobTemplates prop [] → form-ready timeout
 * must_keep: FE-07 refetch storm guard; TC-HDSD-08-02-01 leave 🟢
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-11
 * change_mode: FIX
 * What: refetchTemplates follows internal vs parent source; one-shot create-dialog refetch guard
 * Why: QA R8 — 374 GET job-templates storm when parent [] + parent refetch did not hydrate internal templates
 * must_keep: FE-10 internal fetch when parent []; FE-07 in-flight guard in useJobTemplates
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-12
 * change_mode: FIX
 * What: parent template source only when length>0 (not loading+[]); await refetch before open defaults; dept OU/title mirror
 * Why: QA R9 — job-templates storm fixed but templates[] stayed empty (parent loading blocked internal); dept hydrate gap
 * must_keep: FE-11 one-shot refetch guard; FE-10 contract/leave regression paths untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-13
 * change_mode: FIX
 * What: dialogHydratedTemplates + resolveEffectiveJobTemplates; parent refetch returns rows; await in-flight GET (useJobTemplates)
 * Why: QA R10 — jd-library row visible but create dialog templates[] empty; refetch returned stale [] during mount fetch
 * must_keep: FE-11 one-shot guard; FE-12 parentHasTemplates; TC-06/08 regression untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-14
 * change_mode: FIX
 * What: page-level templates only (no internal hook); direct listJobDescriptionTemplates fallback on open; union merge effectiveTemplates
 * Why: QA R11 — jd-library tbody count=1 but create dialog effectiveTemplates=[] despite GET 200; dual hook desync vs JobTemplatesTab
 * must_keep: FE-11 one-shot refetch guard; TC-06/08 🟢; job-templates storm ≤1
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-15
 * change_mode: FIX
 * What: unwrapJobDescriptionTemplateRows; syncRef before setCreateOpen; single direct GET + hydrateJobTemplates
 * Why: QA R12 — GET 200 but effectiveTemplates=[]; form-ready blocked despite jd-library tbody count=1
 * must_keep: FE-14 shared page source; TC-06/08 🟢; storm ≤1 preferred
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-REC-13-S2-SUBMIT-INBOX-01
 * change_mode: ADD
 * What: Post-create «Gửi duyệt QT» strip + row/detail secondary CTA → POST submit-workflow;
 *       canSubmitRequisitionWorkflow; data-testid for harness (J-REC-WF-02/03 · UF-HRM-12)
 * Why: QC R-REC-13-S2-SUBMIT-INBOX — create+F5 OK nhưng submit CTA không visible / not clicked
 * must_keep: UF-HRM-12 create+F5; headcount/JD; WF LOCK; U65 no seed inbox
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-REC-A
 * change_mode: UPGRADE
 * What: Precision Motion title ≥20 Montserrat; error/WF-lock honesty → warning DNA; sharp secondary
 * Why: ADR §16 · inventory R02 · B4 cấm amber AI banners
 * must_keep: G-RC-01 headcount · JD picker · WF submit · U65 · no Nest invent
 * ADR: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 D-FE-HRM-REC-JOB-GRADE-CONSUMER-01
 * change_mode: ADD
 * What: Ngạch/bậc CatalogSearchPicker + jobGradeOptionsFromCatalog; POST/PATCH job_grade_key;
 *       list/detail resolveJobGradeLabel (AC-SET-CONSUMER-JG-REC-01)
 * Why: BR-SET-CONSUMER-JG-SOT-01 · FR-HRM-SC-GRADE-01 · VAL-JG-REC-FE-01
 * must_keep: RECCHQC1 · YCTD WF chain · settings_catalog_e2e_ready=false · U65 no seed
 */
export type JobRequisitionsTabProps = {
  /** Navigate parent Recruitment tab to «Thư viện JD» when library empty. */
  onOpenJdLibrary?: () => void;
  /** Shared page-level templates — same source as jd-library tab (D-HDSD-MUTATE-FE-14). */
  jobTemplates?: HrmJobDescriptionTemplate[];
  jobTemplatesLoading?: boolean;
  refetchJobTemplates?: () => Promise<HrmJobDescriptionTemplate[]>;
  /** Sync page-level hook after create-dialog direct prefetch (D-HDSD-MUTATE-FE-15). */
  hydrateJobTemplates?: (rows: readonly HrmJobDescriptionTemplate[]) => void;
  /** O5 / deep-link — preset create fork (in_plan cell or out_of_plan). */
  createPreset?: {
    headcount_mode?: HrmJobRequisitionHeadcountMode;
    headcount_cell_id?: string;
    headcount?: number;
    open?: boolean;
  };
  /** Clear parent preset after dialog consumes it. */
  onCreatePresetConsumed?: () => void;
  /** UC-BP-REC-08 drill → open YCTD detail (J-HRM-05). */
  focusRequisitionId?: string | null;
  onFocusRequisitionConsumed?: () => void;
};

export function JobRequisitionsTab({
  onOpenJdLibrary,
  jobTemplates: jobTemplatesProp = [],
  jobTemplatesLoading: jobTemplatesLoadingProp = false,
  refetchJobTemplates: refetchJobTemplatesProp,
  hydrateJobTemplates: hydrateJobTemplatesProp,
  createPreset,
  onCreatePresetConsumed,
  focusRequisitionId,
  onFocusRequisitionConsumed,
}: JobRequisitionsTabProps = {}) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId, operatingUnitLabelMap } = useHrmOperatingUnitFilter();
  const location = useLocation();
  const effectiveCompanyId = listCompanyId || currentCompanyId;
  const { requisitions, isLoading, fetchError, refetch, useApiMode } = useJobRequisitions();
  /** D-HDSD-MUTATE-FE-14 — single page-level source (shared with jd-library tab). */
  const templates = jobTemplatesProp;
  const templatesLoading = jobTemplatesLoadingProp;
  const refetchTemplates = useCallback(async (): Promise<HrmJobDescriptionTemplate[]> => {
    if (refetchJobTemplatesProp) {
      const fetched = await refetchJobTemplatesProp();
      return [...unwrapJobDescriptionTemplateRows<HrmJobDescriptionTemplate>(fetched)];
    }
    return [...templates];
  }, [refetchJobTemplatesProp, templates]);
  const [createOpen, setCreateOpen] = useState(false);
  /** D-HDSD-MUTATE-FE-13 — rows from await-open refetch before hook state flushes. */
  const [dialogHydratedTemplates, setDialogHydratedTemplates] = useState<
    HrmJobDescriptionTemplate[]
  >([]);
  /** D-HDSD-MUTATE-FE-15 — sync rows for form-ready gate before React state flush. */
  const openSyncTemplatesRef = useRef<HrmJobDescriptionTemplate[]>([]);
  /** D-HDSD-MUTATE-FE-11 — at most one empty-library refetch per create-dialog open. */
  const createDialogRefetchAttemptedRef = useRef(false);

  /** F-YCTD-JD-01 — picker chỉ Hiệu lực (bindable); Nháp/Ngừng không vào options. */
  const effectiveTemplates = useMemo(() => {
    const merged = resolveEffectiveJobTemplates(templates, dialogHydratedTemplates);
    const raw =
      merged.length > 0
        ? merged
        : openSyncTemplatesRef.current.length > 0
          ? openSyncTemplatesRef.current
          : merged;
    return filterBindableJobTemplates(raw);
  }, [templates, dialogHydratedTemplates]);
  const effectiveTemplatesLoading = templatesLoading && effectiveTemplates.length === 0;
  const [jdPreview, setJdPreview] = useState<HrmYctdJdPreview | null>(null);
  const [jdPreviewLoading, setJdPreviewLoading] = useState(false);
  const {
    catalogs,
    isLoading: catalogsLoading,
    isError: catalogsError,
  } = useSettingsCatalogsOverview({ enabled: true });
  const [editRow, setEditRow] = useState<HrmJobRequisition | null>(null);
  const [editStatus, setEditStatus] = useState<HrmJobRequisition['status']>('open');
  const [editHeadcount, setEditHeadcount] = useState(1);
  const [editMode, setEditMode] = useState<HrmJobRequisitionHeadcountMode | ''>('');
  const [editCellId, setEditCellId] = useState('');
  const [editHireReason, setEditHireReason] = useState<HrmJobRequisitionHireReason | ''>('');
  const [editReplaceEmployeeId, setEditReplaceEmployeeId] = useState('');
  const [editOutReason, setEditOutReason] = useState('');
  const [editJobGradeKey, setEditJobGradeKey] = useState('');
  const [detailRow, setDetailRow] = useState<HrmJobRequisition | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [spawnMissingBanner, setSpawnMissingBanner] = useState(false);
  /** SoT S2 — after YCTD create, surface immediate «Gửi duyệt QT» (J-REC-WF-02). */
  const [postCreateSubmitRow, setPostCreateSubmitRow] = useState<HrmJobRequisition | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [employeeOptions, setEmployeeOptions] = useState<
    Array<{ value: string; label: string; code?: string }>
  >([]);
  const [pipelinePosted, setPipelinePosted] = useState(false);
  const [pipelineCvIntake, setPipelineCvIntake] = useState(false);
  const [cvScanOpen, setCvScanOpen] = useState(false);
  const [approvedCellOptions, setApprovedCellOptions] = useState<YctdApprovedCellPickerOption[]>(
    [],
  );
  const [approvedCellsLoading, setApprovedCellsLoading] = useState(false);
  const [approvedCellsError, setApprovedCellsError] = useState<string | null>(null);

  const searchPreset = useMemo(
    () => parseYctdCreatePresetFromSearch(location.search),
    [location.search],
  );

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: '',
      department: '',
      employment_type: 'full_time',
      headcount: 1,
      job_template_id: '',
      headcount_mode: 'out_of_plan',
      headcount_cell_id: '',
      hire_reason: 'new',
      replace_employee_id: '',
      out_of_plan_reason: '',
      job_grade_key: '',
    },
  });

  const selectedTemplateId = createForm.watch('job_template_id');
  const watchedEmploymentType = createForm.watch('employment_type');
  const watchedHeadcountMode = createForm.watch('headcount_mode');
  const watchedHireReason = createForm.watch('hire_reason');
  const {
    employmentTypeOptions,
    employmentTypeDisplayLabel,
    isLoading: employmentTypesLoading,
    isError: employmentTypesError,
  } = useEmpEmploymentTypesEffective({
    enabled: createOpen || Boolean(detailRow) || Boolean(editRow),
    currentValue: watchedEmploymentType,
  });
  const jdSnapshotUnlocked = isRequisitionJobTemplateSelected(selectedTemplateId);
  const libraryEmpty = !effectiveTemplatesLoading && effectiveTemplates.length === 0;

  const jobTemplateOptions = useMemo(
    () =>
      effectiveTemplates.map((tpl) => ({
        value: tpl.id,
        label: tpl.title,
        code: tpl.code,
      })),
    [effectiveTemplates],
  );

  const ouLabels = useMemo(
    () => Array.from(operatingUnitLabelMap.values()),
    [operatingUnitLabelMap],
  );

  const jobTitleOptions = useMemo(
    () => jobTitleOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );

  const jobGradeOptions = useMemo(
    () => jobGradeOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );

  const templateDeptHints = useMemo(
    () =>
      effectiveTemplates.flatMap((tpl) => {
        const hints: string[] = [];
        const resolved = resolveRequisitionDepartmentDefault({
          template: tpl,
          departmentOptions: [],
          ouLabels,
          jobTitleOptions,
        });
        if (resolved) hints.push(resolved);
        return hints;
      }),
    [effectiveTemplates, ouLabels, jobTitleOptions],
  );

  const departmentOptions = useMemo(
    () =>
      requisitionDepartmentPickerOptions(
        catalogs ?? [],
        requisitions.map((r) => r.department),
        ouLabels,
        templateDeptHints,
      ),
    [catalogs, requisitions, ouLabels, templateDeptHints],
  );

  const applyTemplate = useCallback(
    (templateId: string) => {
      if (!isRequisitionJobTemplateSelected(templateId)) {
        createForm.setValue('job_template_id', '', { shouldValidate: true });
        setJdPreview(null);
        return;
      }
      const tpl = effectiveTemplates.find((t) => t.id === templateId);
      if (!tpl) return;
      createForm.setValue('job_template_id', tpl.id, { shouldValidate: true });
      if (!createForm.getValues('title')?.trim() && tpl.title) {
        createForm.setValue('title', tpl.title, { shouldValidate: true });
      }
      if (!createForm.getValues('department')?.trim()) {
        const dept =
          resolveRequisitionDepartmentDefault({
            template: tpl,
            departmentOptions,
            ouLabels,
            jobTitleOptions,
          }) || tpl.title?.trim() || '';
        if (dept) {
          createForm.setValue('department', dept, { shouldValidate: true });
        }
      }
      if (!createForm.getValues('employment_type')?.trim()) {
        createForm.setValue('employment_type', 'full_time', { shouldValidate: true });
      }
      const hc = normalizeRequisitionHeadcount(createForm.getValues('headcount'));
      if (hc == null) {
        createForm.setValue('headcount', 1, { shouldValidate: true });
      }
      setJdPreview(composeLocalYctdPreview(tpl));
      if (
        createForm.getValues('headcount_mode') === 'out_of_plan' &&
        !createForm.getValues('out_of_plan_reason')?.trim()
      ) {
        createForm.setValue('out_of_plan_reason', 'Phát sinh nhu cầu tuyển dụng', {
          shouldValidate: true,
        });
      }
    },
    [effectiveTemplates, departmentOptions, ouLabels, jobTitleOptions, createForm],
  );

  const handleOpenCreate = useCallback(() => {
    void (async () => {
      setJdPreview(null);
      let activeTemplates = filterBindableJobTemplates(
        resolveEffectiveJobTemplates(templates, dialogHydratedTemplates),
      );
      if (activeTemplates.length === 0 && openSyncTemplatesRef.current.length > 0) {
        activeTemplates = filterBindableJobTemplates(openSyncTemplatesRef.current);
      }

      if (!createDialogRefetchAttemptedRef.current && effectiveCompanyId) {
        createDialogRefetchAttemptedRef.current = true;
        /** F-YCTD-JD-01 — bindable list for picker; do not replace Thư viện full list. */
        try {
          const bindableRes = await listJobDescriptionTemplates({
            company_id: effectiveCompanyId,
            bindable: true,
          });
          const bindableRows = filterBindableJobTemplates(
            unwrapJobDescriptionTemplateRows<HrmJobDescriptionTemplate>(bindableRes),
          );
          /** 200 [] = empty Hiệu lực (SRS 1b) — trust BE over parent full-library cache. */
          activeTemplates = [...bindableRows];
          openSyncTemplatesRef.current = [...bindableRows];
          setDialogHydratedTemplates([...bindableRows]);
        } catch {
          if (activeTemplates.length === 0) {
            let fetched = await refetchTemplates();
            if (fetched.length === 0) {
              try {
                const direct = await listJobDescriptionTemplates({
                  company_id: effectiveCompanyId,
                  bindable: true,
                });
                fetched = [
                  ...unwrapJobDescriptionTemplateRows<HrmJobDescriptionTemplate>(direct),
                ];
              } catch {
                /* parent refetch error already surfaced on page hook */
              }
            }
            const bindable = filterBindableJobTemplates(fetched);
            if (bindable.length > 0) {
              activeTemplates = [...bindable];
              openSyncTemplatesRef.current = [...bindable];
              setDialogHydratedTemplates([...bindable]);
              /** Only hydrate parent when fallback used full-library rows (not bindable-only wipe). */
              if (fetched.length === bindable.length) {
                hydrateJobTemplatesProp?.([...fetched]);
              }
            }
          }
        }
      } else if (activeTemplates.length > 0) {
        openSyncTemplatesRef.current = [...activeTemplates];
        setDialogHydratedTemplates([...activeTemplates]);
      }

      const presetMode =
        createPreset?.headcount_mode ??
        searchPreset.headcount_mode ??
        ('out_of_plan' as HrmJobRequisitionHeadcountMode);
      const presetCell =
        createPreset?.headcount_cell_id ?? searchPreset.headcount_cell_id ?? '';
      const presetHc =
        createPreset?.headcount ?? searchPreset.headcount ?? undefined;

      const defaults = buildRequisitionCreateFormDefaults({
        templates: activeTemplates,
        departmentOptions,
        ouLabels,
        jobTitleOptions,
      });
      if (defaults) {
        createForm.reset({
          ...defaults,
          headcount: presetHc ?? defaults.headcount,
          headcount_mode: presetMode,
          headcount_cell_id: presetCell,
          hire_reason: 'new',
          replace_employee_id: '',
          out_of_plan_reason: '',
        });
        const tpl = activeTemplates.find((t) => t.id === defaults.job_template_id);
        if (tpl) setJdPreview(composeLocalYctdPreview(tpl));
      } else {
        createForm.reset({
          title: '',
          department: '',
          employment_type: 'full_time',
          headcount: presetHc ?? 1,
          job_template_id: '',
          headcount_mode: presetMode,
          headcount_cell_id: presetCell,
          hire_reason: 'new',
          replace_employee_id: '',
          out_of_plan_reason: '',
        });
        setJdPreview(null);
      }
      setCreateOpen(true);
      onCreatePresetConsumed?.();
    })();
  }, [
    templates,
    dialogHydratedTemplates,
    effectiveCompanyId,
    departmentOptions,
    ouLabels,
    jobTitleOptions,
    createForm,
    refetchTemplates,
    hydrateJobTemplatesProp,
    createPreset,
    searchPreset,
    onCreatePresetConsumed,
  ]);

  /** D-HDSD-MUTATE-FE-12 — re-sync defaults when templates hydrate after async open refetch. */
  useEffect(() => {
    if (!createOpen || effectiveTemplatesLoading || effectiveTemplates.length === 0) return;
    if (!isRequisitionJobTemplateSelected(createForm.getValues('job_template_id'))) {
      const defaults = buildRequisitionCreateFormDefaults({
        templates: effectiveTemplates,
        departmentOptions,
        ouLabels,
        jobTitleOptions,
      });
      if (defaults) {
        const prev = createForm.getValues();
        createForm.reset({
          ...defaults,
          headcount_mode: prev.headcount_mode || 'out_of_plan',
          headcount_cell_id: prev.headcount_cell_id || '',
          hire_reason: prev.hire_reason || 'new',
          replace_employee_id: prev.replace_employee_id || '',
          out_of_plan_reason: prev.out_of_plan_reason || '',
          headcount: prev.headcount || defaults.headcount,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cấm deps createForm / array templates (reset Textarea khi gõ)
  }, [
    createOpen,
    effectiveTemplatesLoading,
    effectiveTemplates.length,
    effectiveTemplates[0]?.id,
    departmentOptions,
    ouLabels,
    jobTitleOptions,
  ]);

  /** D-HDSD-MUTATE-FE-08 — backfill dept when catalog/template hints arrive after open. */
  useEffect(() => {
    if (!createOpen) return;
    if (createForm.getValues('department')?.trim()) return;
    const tplId = createForm.getValues('job_template_id');
    const tpl =
      (isRequisitionJobTemplateSelected(tplId)
        ? effectiveTemplates.find((t) => t.id === tplId)
        : undefined) ?? effectiveTemplates[0];
    const dept = resolveRequisitionDepartmentDefault({
      template: tpl,
      departmentOptions,
      ouLabels,
      jobTitleOptions,
    });
    if (dept) {
      createForm.setValue('department', dept, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cấm deps createForm
  }, [createOpen, effectiveTemplates.length, effectiveTemplates[0]?.id, departmentOptions, ouLabels, jobTitleOptions]);

  /** D-HDSD-MUTATE-FE-04 — department catalog may load after JD pick; backfill required field. */
  useEffect(() => {
    if (!createOpen) return;
    if (createForm.getValues('department')?.trim()) return;
    const firstDept = departmentOptions[0]?.value;
    if (firstDept) {
      createForm.setValue('department', firstDept, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cấm deps createForm
  }, [createOpen, departmentOptions]);

  useEffect(() => {
    if (!createOpen) {
      createDialogRefetchAttemptedRef.current = false;
      openSyncTemplatesRef.current = [];
      setDialogHydratedTemplates([]);
      setJdPreview(null);
      setJdPreviewLoading(false);
    }
  }, [createOpen]);

  useEffect(() => {
    if (!createOpen || effectiveTemplatesLoading || effectiveTemplates.length === 0) return;
    const currentId = createForm.getValues('job_template_id');
    if (!isRequisitionJobTemplateSelected(currentId)) {
      applyTemplate(effectiveTemplates[0]!.id);
      return;
    }
    if (!createForm.getValues('department')?.trim()) {
      applyTemplate(currentId);
    }
  }, [createOpen, effectiveTemplatesLoading, effectiveTemplates, createForm, applyTemplate]);

  /** F-YCTD-JD-02 — preview title/short; STATUS clears selection (Diễn biến 1d). */
  useEffect(() => {
    if (!createOpen || !effectiveCompanyId) return;
    if (!isRequisitionJobTemplateSelected(selectedTemplateId)) {
      setJdPreview(null);
      setJdPreviewLoading(false);
      return;
    }
    const templateId = selectedTemplateId.trim();
    const localTpl = effectiveTemplates.find((t) => t.id === templateId);
    let cancelled = false;
    setJdPreviewLoading(true);
    void (async () => {
      try {
        const preview = await getJobDescriptionTemplateYctdPreview(templateId, effectiveCompanyId);
        if (cancelled) return;
        setJdPreview(preview);
        createForm.clearErrors('job_template_id');
      } catch (error: unknown) {
        if (cancelled) return;
        const code = error instanceof ApiClientError ? error.code : undefined;
        if (code === 'HRM-JD-YCTD-STATUS' || code === 'HRM-JD-YCTD-NOT-FOUND') {
          setJdPreview(null);
          createForm.setValue('job_template_id', '', { shouldValidate: true });
          createForm.setError('job_template_id', {
            message:
              code === 'HRM-JD-YCTD-STATUS'
                ? REQUISITION_JD_STATUS_BLOCKED_VI
                : toErrorMessage(error, REQUISITION_JD_STATUS_BLOCKED_VI),
          });
          toast({
            title: 'Không gắn được JD',
            description: toErrorMessage(error, REQUISITION_JD_STATUS_BLOCKED_VI),
            variant: 'destructive',
          });
          return;
        }
        if (localTpl) {
          setJdPreview(composeLocalYctdPreview(localTpl));
        }
      } finally {
        if (!cancelled) setJdPreviewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [createOpen, selectedTemplateId, effectiveCompanyId, effectiveTemplates, createForm]);

  const watchedCreate = createForm.watch([
    'title',
    'department',
    'employment_type',
    'headcount',
    'job_template_id',
  ]);

  const isCreateFormReady = useMemo(() => {
    const [title, department, employmentType, headcount, jobTemplateId] = watchedCreate;
    return isRequisitionCreateFormReady({
      watched: {
        title,
        department,
        employmentType,
        headcount,
        jobTemplateId,
      },
      templates: effectiveTemplates,
      departmentOptions,
      ouLabels,
      jobTitleOptions,
    });
  }, [watchedCreate, effectiveTemplates, departmentOptions, ouLabels, jobTitleOptions]);

  const goToJdLibrary = () => {
    setCreateOpen(false);
    onOpenJdLibrary?.();
  };

  /** Deep-link / parent preset — open create once when preset.open stamped. */
  const presetOpenConsumedRef = useRef(false);
  useEffect(() => {
    if (!createPreset?.open || presetOpenConsumedRef.current) return;
    presetOpenConsumedRef.current = true;
    handleOpenCreate();
  }, [createPreset?.open, createPreset?.headcount_cell_id, createPreset?.headcount_mode, handleOpenCreate]);

  useEffect(() => {
    if (!createPreset?.open) {
      presetOpenConsumedRef.current = false;
    }
  }, [createPreset?.open]);

  /** Replace picker — load employees when hire_reason=replace (create/edit/detail). */
  useEffect(() => {
    const needReplace =
      (createOpen && watchedHireReason === 'replace') ||
      (editRow != null && editHireReason === 'replace') ||
      (detailRow != null &&
        normalizeYctdHireReason(detailRow.hire_reason) === 'replace');
    if (!needReplace || !effectiveCompanyId) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await listEmployees({
          company_id: effectiveCompanyId,
          page: 1,
          page_size: 200,
        });
        if (cancelled) return;
        const rows = Array.isArray(res?.data) ? res.data : [];
        setEmployeeOptions(
          rows.map((e) => ({
            value: e.id,
            label: [e.full_name, e.employee_code].filter(Boolean).join(' · ') || e.id,
            code: e.employee_code ?? undefined,
          })),
        );
      } catch {
        if (!cancelled) setEmployeeOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [createOpen, watchedHireReason, editRow, editHireReason, detailRow, effectiveCompanyId]);

  /** CELL-PICKER — load approved Định biên cells (REC-01 SoT) when in_plan form/detail needs picker. */
  useEffect(() => {
    const needCells =
      (createOpen && watchedHeadcountMode === 'in_plan') ||
      (editRow != null && editMode === 'in_plan') ||
      (detailRow != null && Boolean(detailRow.headcount_cell_id));
    if (!needCells || !effectiveCompanyId) return;
    let cancelled = false;
    setApprovedCellsLoading(true);
    setApprovedCellsError(null);
    void (async () => {
      try {
        const res = await listRecruitmentPlans(effectiveCompanyId);
        if (cancelled) return;
        const rows = Array.isArray(res?.data) ? res.data : [];
        const opts = collectApprovedNeedHireCellOptions(rows, parseMonthsData);
        setApprovedCellOptions(opts);
      } catch (error: unknown) {
        if (!cancelled) {
          setApprovedCellOptions([]);
          setApprovedCellsError(toErrorMessage(error, 'Không tải được ô định biên đã duyệt.'));
        }
      } finally {
        if (!cancelled) setApprovedCellsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    createOpen,
    watchedHeadcountMode,
    editRow,
    editMode,
    detailRow,
    effectiveCompanyId,
  ]);

  const watchedCellId = createForm.watch('headcount_cell_id');
  const cellPickerOptions = useMemo(() => {
    const presetCell =
      createPreset?.headcount_cell_id ?? searchPreset.headcount_cell_id ?? watchedCellId ?? '';
    return ensureHeadcountCellOptionPresent(approvedCellOptions, presetCell);
  }, [
    approvedCellOptions,
    createPreset?.headcount_cell_id,
    searchPreset.headcount_cell_id,
    watchedCellId,
  ]);

  const editCellPickerOptions = useMemo(
    () => ensureHeadcountCellOptionPresent(approvedCellOptions, editCellId),
    [approvedCellOptions, editCellId],
  );

  const detailCellPickerOptions = useMemo(
    () =>
      ensureHeadcountCellOptionPresent(
        approvedCellOptions,
        detailRow?.headcount_cell_id,
      ),
    [approvedCellOptions, detailRow?.headcount_cell_id],
  );

  const detailApprovalChain = useMemo(
    () => (detailRow ? resolveYctdApprovalChainView(detailRow) : null),
    [detailRow],
  );

  const onCreate = async (values: CreateFormValues) => {
    if (!effectiveCompanyId) {
      toast({ title: 'Lỗi', description: 'Chưa xác định phạm vi công ty.', variant: 'destructive' });
      return;
    }
    if (!isRequisitionJobTemplateSelected(values.job_template_id)) {
      createForm.setError('job_template_id', { message: REQUISITION_JD_TEMPLATE_REQUIRED_VI });
      return;
    }
    const headcount = normalizeRequisitionHeadcount(values.headcount);
    if (headcount == null) {
      createForm.setError('headcount', { message: 'Số lượng phải lớn hơn 0' });
      return;
    }
    const jobTemplateId = values.job_template_id.trim();
    const mode = values.headcount_mode;
    setSubmitting(true);
    try {
      const created = await createJobRequisition({
        company_id: effectiveCompanyId,
        title: values.title.trim(),
        department: values.department.trim(),
        employment_type: values.employment_type,
        headcount,
        job_template_id: jobTemplateId,
        headcount_mode: mode,
        headcount_cell_id:
          mode === 'in_plan' ? values.headcount_cell_id?.trim() || undefined : undefined,
        hire_reason: values.hire_reason,
        replace_employee_id:
          values.hire_reason === 'replace'
            ? values.replace_employee_id?.trim() || undefined
            : undefined,
        out_of_plan_reason:
          mode === 'out_of_plan' ? values.out_of_plan_reason?.trim() || undefined : undefined,
        job_grade_key: values.job_grade_key?.trim() || undefined,
      });
      toast({
        title: 'Đã lưu nháp yêu cầu tuyển dụng',
        description:
          mode === 'out_of_plan'
            ? 'Ngoài ĐB — bấm «Gửi duyệt QT» (ma trận dài + BOD). Chưa mở nhận hồ sơ.'
            : 'Trong ĐB — bấm «Gửi duyệt QT». Chưa mở nhận hồ sơ đến khi duyệt xong.',
      });
      setCreateOpen(false);
      createForm.reset({
        title: '',
        department: '',
        employment_type: 'full_time',
        headcount: 1,
        job_template_id: '',
        headcount_mode: 'out_of_plan',
        headcount_cell_id: '',
        hire_reason: 'new',
        replace_employee_id: '',
        out_of_plan_reason: '',
        job_grade_key: '',
      });
      if (canSubmitRequisitionWorkflow(created.workflow_instance_id, created.status)) {
        setPostCreateSubmitRow(created);
      } else {
        setPostCreateSubmitRow(null);
      }
      await refetch();
    } catch (error: unknown) {
      const code = error instanceof ApiClientError ? error.code : undefined;
      if (code === 'HRM-JD-YCTD-REQUIRED') {
        createForm.setError('job_template_id', {
          message: toErrorMessage(error, REQUISITION_JD_TEMPLATE_REQUIRED_VI),
        });
      } else if (code === 'HRM-JD-YCTD-STATUS' || code === 'HRM-JD-YCTD-NOT-FOUND') {
        createForm.setError('job_template_id', {
          message: toErrorMessage(error, REQUISITION_JD_STATUS_BLOCKED_VI),
        });
      } else if (code === 'HRM-YCTD-CELL-QTY') {
        createForm.setError('headcount', {
          message: toErrorMessage(error, YCTD_CELL_QTY_HINT_VI),
        });
        toast({
          title: 'Vượt số lượng ô định biên',
          description: toErrorMessage(error, YCTD_CELL_QTY_HINT_VI),
          variant: 'destructive',
        });
        return;
      } else if (code === 'HRM-YCTD-OUT-REASON') {
        createForm.setError('out_of_plan_reason', {
          message: toErrorMessage(error),
        });
      } else if (code === 'HRM-YCTD-HIRE-REASON') {
        createForm.setError('hire_reason', { message: toErrorMessage(error) });
      } else if (code === 'HRM-YCTD-MODE-REQUIRED') {
        createForm.setError('headcount_mode', { message: toErrorMessage(error) });
      } else if (code?.startsWith('HRM-YCTD-CELL')) {
        createForm.setError('headcount_cell_id', { message: toErrorMessage(error) });
      }
      toast({
        title: 'Không tạo được yêu cầu',
        description: toErrorMessage(error, 'Kiểm tra kết nối và quyền truy cập.'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onUpdateStatus = async () => {
    if (!editRow) return;
    if (requisitionLocked(editRow)) {
      toast({
        title: 'Quy trình đang chạy',
        description: RECRUITMENT_WF_LOCKED_HINT_VI,
        variant: 'destructive',
      });
      return;
    }
    const headcount = normalizeRequisitionHeadcount(editHeadcount);
    if (headcount == null) {
      toast({
        title: 'Số lượng không hợp lệ',
        description: 'Số lượng phải lớn hơn 0.',
        variant: 'destructive',
      });
      return;
    }
    const classifyNeeded = isYctdClassificationRequired(editRow);
    if (classifyNeeded || editMode) {
      const gate = validateYctdCreateForm({
        headcount_mode: editMode || editRow.headcount_mode,
        headcount_cell_id: editCellId || editRow.headcount_cell_id,
        hire_reason: editHireReason || editRow.hire_reason || 'new',
        replace_employee_id: editReplaceEmployeeId || editRow.replace_employee_id,
        out_of_plan_reason: editOutReason || editRow.out_of_plan_reason,
      });
      if (!gate.ok) {
        toast({ title: 'Thiếu phân loại / trường bắt buộc', description: gate.message, variant: 'destructive' });
        return;
      }
    }
    const mutateCompanyId = resolveRequisitionMutateCompanyId(
      editRow.company_id,
      effectiveCompanyId,
      currentCompanyId,
    );
    if (!mutateCompanyId) {
      toast({ title: 'Lỗi', description: 'Chưa xác định phạm vi công ty.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const mode = normalizeYctdHeadcountMode(editMode || editRow.headcount_mode);
      const priorStatus = String(editRow.status ?? '')
        .trim()
        .toLowerCase();
      const wantStatus = String(editStatus ?? '')
        .trim()
        .toLowerCase();
      const statusIsLocal = REQUISITION_LOCAL_STATUSES.includes(
        editStatus as (typeof REQUISITION_LOCAL_STATUSES)[number],
      );
      // BE forbids PATCH → open/open_for_hire (use transitions). Never send that jump from Sửa.
      const statusJumpToReceivable =
        (wantStatus === 'open' || wantStatus === 'open_for_hire') && wantStatus !== priorStatus;
      const statusPayload =
        statusIsLocal && !statusJumpToReceivable && wantStatus !== priorStatus
          ? { status: editStatus }
          : {};
      if (statusJumpToReceivable) {
        toast({
          title: 'Không đổi trạng thái bằng Sửa',
          description:
            '«Đang tuyển / Mở nhận hồ sơ» chỉ sau Gửi duyệt → Duyệt (ngoài ĐB: + BOD). Form này chỉ lưu phân loại O4 + số lượng.',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }
      const updated = await updateJobRequisition(editRow.id, mutateCompanyId, {
        ...statusPayload,
        headcount,
        ...(mode
          ? {
              headcount_mode: mode,
              headcount_cell_id: mode === 'in_plan' ? editCellId.trim() || null : null,
              out_of_plan_reason: mode === 'out_of_plan' ? editOutReason.trim() || null : null,
            }
          : {}),
        ...(editHireReason
          ? {
              hire_reason: editHireReason,
              replace_employee_id:
                editHireReason === 'replace' ? editReplaceEmployeeId.trim() || null : null,
            }
          : {}),
        job_grade_key: editJobGradeKey.trim() || null,
      });
      toast({
        title: 'Đã cập nhật yêu cầu',
        description: 'Phân loại / số lượng đã lưu — F5 để xác nhận.',
      });
      setEditRow(null);
      await refetch();
      if (detailRow?.id === updated.id) setDetailRow(updated);
    } catch (error: unknown) {
      const code = error instanceof ApiClientError ? error.code : undefined;
      toast({
        title: 'Không cập nhật được',
        description:
          code === 'HRM-YCTD-CELL-QTY'
            ? toErrorMessage(error, YCTD_CELL_QTY_HINT_VI)
            : toErrorMessage(error, 'Kiểm tra phạm vi công ty và quyền truy cập.'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onTransition = async (row: HrmJobRequisition, action: 'approve' | 'reject') => {
    const mutateCompanyId = resolveRequisitionMutateCompanyId(
      row.company_id,
      effectiveCompanyId,
      currentCompanyId,
    );
    if (!mutateCompanyId) {
      toast({ title: 'Lỗi', description: 'Chưa xác định phạm vi công ty.', variant: 'destructive' });
      return;
    }
    if (action === 'reject' && !rejectReason.trim()) {
      toast({
        title: 'Thiếu lý do từ chối',
        description: YCTD_REJECT_REASON_REQUIRED_VI,
        variant: 'destructive',
      });
      return;
    }
    if (isYctdClassificationRequired(row)) {
      toast({
        title: 'Cần phân loại trước',
        description: YCTD_CLASSIFY_BANNER_VI,
        variant: 'destructive',
      });
      return;
    }
    const chain = resolveYctdApprovalChainView(row);
    setSubmitting(true);
    try {
      const result = await transitionJobRequisition(row.id, mutateCompanyId, {
        action,
        rejected_reason: action === 'reject' ? rejectReason.trim() : undefined,
        bod_complete:
          action === 'approve' && chain.approveSendsBodComplete ? true : undefined,
      });
      toast({
        title: action === 'approve' ? 'Đã duyệt YCTD' : 'Đã từ chối YCTD',
        description:
          action === 'approve'
            ? result.status === 'open_for_hire'
              ? 'Trạng thái: Mở nhận hồ sơ. F5 để xác nhận.'
              : result.status === 'approved'
                ? 'TP/HR đã duyệt — còn chờ BOD. Vẫn chặn nhận hồ sơ. F5 để xác nhận.'
                : `Trạng thái: ${REQUISITION_STATUS_LABEL_VI[result.status] ?? result.status}.`
            : `Đã từ chối. Lý do: ${result.rejected_reason?.trim() || rejectReason.trim()}. F5 còn lý do.`,
      });
      setRejectReason('');
      await refetch();
      if (detailRow?.id === row.id) setDetailRow(result);
    } catch (error: unknown) {
      toast({
        title: 'Không chuyển trạng thái được',
        description: toErrorMessage(error, 'Kiểm tra quyền duyệt và trạng thái hiện tại.'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onPatchPipelineFlags = async (row: HrmJobRequisition) => {
    if (!canMutateYctdPipelineFlags(row)) {
      toast({
        title: 'Chưa mở nhận hồ sơ',
        description: isYctdClassificationRequired(row)
          ? YCTD_CLASSIFY_BANNER_VI
          : YCTD_NOT_RECEIVABLE_HINT_VI,
        variant: 'destructive',
      });
      return;
    }
    const currentFlags = resolvePipelineFlags(row);
    if (pipelinePosted && !canSetYctdPostedFromScan(currentFlags)) {
      toast({
        title: 'Chặn đăng tin',
        description: YCTD_CV_SCAN_POSTED_BLOCKED_VI,
        variant: 'destructive',
      });
      setPipelinePosted(false);
      return;
    }
    const mutateCompanyId = resolveRequisitionMutateCompanyId(
      row.company_id,
      effectiveCompanyId,
      currentCompanyId,
    );
    if (!mutateCompanyId) {
      toast({ title: 'Lỗi', description: 'Chưa xác định phạm vi công ty.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const result = await patchJobRequisitionPipelineFlags(row.id, mutateCompanyId, {
        posted: pipelinePosted,
        cv_intake_allowed: pipelineCvIntake,
      });
      toast({
        title: 'Đã cập nhật cờ pipeline trên YCTD',
        description: 'Không tạo Campaign. F5 để xác nhận cờ còn.',
      });
      await refetch();
      if (detailRow?.id === row.id) setDetailRow(result);
    } catch (error: unknown) {
      toast({
        title: 'Không cập nhật cờ pipeline',
        description: toErrorMessage(error, YCTD_NOT_RECEIVABLE_HINT_VI),
        variant: 'destructive',
      });
      if (pipelinePosted) setPipelinePosted(false);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitWorkflow = async (row: HrmJobRequisition) => {
    const wfGate = validateYctdCreateForm(
      {
        headcount_mode: row.headcount_mode,
        headcount_cell_id: row.headcount_cell_id,
        hire_reason: row.hire_reason,
        replace_employee_id: row.replace_employee_id,
        out_of_plan_reason: row.out_of_plan_reason,
      },
      'complete',
    );
    if (!wfGate.ok) {
      toast({
        title: 'Chưa đủ thông tin phân loại',
        description: wfGate.message,
        variant: 'destructive',
      });
      if (wfGate.field === 'out_of_plan_reason') {
        openEdit(row);
      }
      return;
    }
    const mutateCompanyId = resolveRequisitionMutateCompanyId(
      row.company_id,
      effectiveCompanyId,
      currentCompanyId,
    );
    if (!mutateCompanyId) {
      toast({ title: 'Lỗi', description: 'Chưa xác định phạm vi công ty.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    setSpawnMissingBanner(false);
    try {
      const result = await submitJobRequisitionWorkflow(row.id, mutateCompanyId);
      const missing = detectRecruitmentSpawnMissing(result);
      setSpawnMissingBanner(missing);
      if (missing) {
        toast({
          title: 'Đã gửi nhưng thiếu instance QT',
          description: 'Chưa tạo được quy trình phê duyệt — kiểm tra mẫu QT tuyển dụng trên XBOS.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Đã gửi duyệt quy trình',
          description: 'Yêu cầu đã gửi vào Inbox phê duyệt.',
        });
      }
      if (postCreateSubmitRow?.id === row.id) {
        setPostCreateSubmitRow(missing ? { ...row, ...result } : null);
      }
      await refetch();
      if (detailRow?.id === row.id) {
        setDetailRow({
          ...detailRow,
          ...result,
          workflow_instance_id: result.workflow_instance_id ?? detailRow.workflow_instance_id,
          status: result.status ?? detailRow.status,
          headcount: result.headcount ?? detailRow.headcount,
        });
      }
    } catch (error: unknown) {
      toast({
        title: 'Không gửi được quy trình',
        description: toErrorMessage(error, 'Kiểm tra XBOS workflow-engine và quyền.'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (row: HrmJobRequisition) => {
    if (requisitionLocked(row)) {
      toast({
        title: 'Quy trình đang chạy',
        description: RECRUITMENT_WF_LOCKED_HINT_VI,
        variant: 'destructive',
      });
      return;
    }
    setEditRow(row);
    // Keep real status — never coerce draft/pending/open_for_hire → «open» (PATCH 409).
    setEditStatus(row.status);
    setEditHeadcount(normalizeRequisitionHeadcount(row.headcount) ?? 1);
    setEditMode(normalizeYctdHeadcountMode(row.headcount_mode) ?? '');
    setEditCellId(row.headcount_cell_id?.trim() ?? '');
    setEditHireReason(normalizeYctdHireReason(row.hire_reason) ?? 'new');
    setEditReplaceEmployeeId(row.replace_employee_id?.trim() ?? '');
    setEditOutReason(row.out_of_plan_reason?.trim() ?? '');
    setEditJobGradeKey(row.job_grade_key?.trim() ?? '');
  };

  /** J-HRM-05 list → detail: GET by id (not list-row-only). */
  const openDetail = async (row: HrmJobRequisition) => {
    const scopeId = resolveRequisitionMutateCompanyId(
      row.company_id,
      effectiveCompanyId,
      currentCompanyId,
    );
    if (!scopeId) {
      toast({ title: 'Lỗi', description: 'Chưa xác định phạm vi công ty.', variant: 'destructive' });
      return;
    }
    setDetailLoading(true);
    setDetailRow(row);
    try {
      const detail = await getJobRequisition(row.id, scopeId);
      setDetailRow(detail);
      const flags = resolvePipelineFlags(detail);
      setPipelinePosted(Boolean(flags.posted));
      setPipelineCvIntake(Boolean(flags.cv_intake_allowed));
      setRejectReason('');
    } catch (error: unknown) {
      toast({
        title: 'Không tải được chi tiết',
        description: toErrorMessage(error, 'Không tải được chi tiết yêu cầu tuyển dụng.'),
        variant: 'destructive',
      });
      setDetailRow(null);
    } finally {
      setDetailLoading(false);
    }
  };

  /** REC-08 dashboard drill → existing YCTD detail path (DENY Campaign). */
  useEffect(() => {
    const id = focusRequisitionId?.trim();
    if (!id || isLoading) return;
    const row = requisitions.find((r) => r.id === id);
    if (!row) {
      if (!isLoading && requisitions.length >= 0) {
        void getJobRequisition(id, effectiveCompanyId || currentCompanyId || '').then(
          (detail) => {
            void openDetail(detail);
            onFocusRequisitionConsumed?.();
          },
          (error: unknown) => {
            toast({
              title: 'Không mở được YCTD',
              description: toErrorMessage(error, 'Không tìm thấy yêu cầu tuyển từ dashboard.'),
              variant: 'destructive',
            });
            onFocusRequisitionConsumed?.();
          },
        );
      }
      return;
    }
    void openDetail(row);
    onFocusRequisitionConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once per focus id
  }, [focusRequisitionId, isLoading, requisitions]);

  if (!useApiMode) {
    return (
      <Card className="border-xevn-border bg-xevn-surface p-6 text-sm text-xevn-textSecondary">
        Chế độ kết nối chưa sẵn sàng — mở HRM từ Command Center để quản lý yêu cầu tuyển dụng.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <RecruitmentWfSpawnBanner visible={spawnMissingBanner} />
      {postCreateSubmitRow && canSubmitRequisitionRow(postCreateSubmitRow) ? (
        <Card
          className="flex flex-wrap items-center justify-between gap-3 border-primary/30 bg-primary/5 px-4 py-3"
          data-testid={HDSD_MUTATE_TEST_IDS.requisitionPostCreateSubmit}
        >
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-medium">
              Đã tạo «{postCreateSubmitRow.title}» — gửi duyệt quy trình để tạo task Inbox.
            </p>
            <p className="text-xs text-muted-foreground">
              SoT S2 / J-REC-WF-02: Lưu → Gửi duyệt QT → Inbox (không seed).
            </p>
          </div>
          <PermissionGate
            module="recruitment"
            anyOf={[
              { module: 'recruitment', action: 'update' },
              { module: 'recruitment', action: 'create' },
            ]}
          >
            <Button
              type="button"
              size="sm"
              disabled={submitting}
              data-testid={HDSD_MUTATE_TEST_IDS.requisitionSubmitWf}
              aria-label="Gửi duyệt QT"
              onClick={() => void onSubmitWorkflow(postCreateSubmitRow)}
            >
              Gửi duyệt QT
            </Button>
          </PermissionGate>
        </Card>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3" data-testid="rec-requisitions-tab-precision">
        <div>
          <h2 className="font-display text-[20px] font-bold tracking-tight text-xevn-text">Yêu cầu tuyển dụng</h2>
          <p className="text-sm text-xevn-textSecondary">
            Tạo và cập nhật trạng thái yêu cầu tuyển dụng; sau Lưu bấm «Gửi duyệt QT» để vào Inbox.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()} disabled={isLoading}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Làm mới
          </Button>
          <PermissionGate module="recruitment" action="create">
            <Button
              type="button"
              size="sm"
              data-testid={HDSD_MUTATE_TEST_IDS.requisitionCreateBtn}
              aria-label="Thêm yêu cầu"
              onClick={handleOpenCreate}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm yêu cầu
            </Button>
          </PermissionGate>
        </div>
      </div>

      {fetchError ? (
        <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          {fetchError}
        </div>
      ) : null}

      {requisitions.some((r) => isYctdClassificationRequired(r)) ? (
        <div
          className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning"
          data-testid="yctd-classify-banner"
        >
          {YCTD_CLASSIFY_BANNER_VI}
        </div>
      ) : null}

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Đang tải…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>JD gắn</TableHead>
                <TableHead>Trong/Ngoài ĐB</TableHead>
                <TableHead>Phòng/Ban</TableHead>
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead>Loại hình</TableHead>
                <TableHead>Ngạch/bậc</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisitions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                    Chưa có yêu cầu — bấm «Thêm yêu cầu» để tạo mới.
                  </TableCell>
                </TableRow>
              ) : (
                requisitions.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell
                      className="max-w-[12rem] truncate text-sm text-xevn-textSecondary"
                      data-testid={`yctd-jd-ref-${row.id}`}
                      title={resolveRequisitionJdDisplay(row, templates)}
                    >
                      {resolveRequisitionJdDisplay(row, templates)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isYctdClassificationRequired(row) ? 'destructive' : 'outline'}
                        data-testid={`yctd-mode-${row.id}`}
                      >
                        {yctdModeBadgeLabel(row.headcount_mode, isYctdClassificationRequired(row))}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell className="text-center font-medium tabular-nums">
                      {normalizeRequisitionHeadcount(row.headcount) ?? '—'}
                    </TableCell>
                    <TableCell>
                      {employmentTypeDisplayLabel(row.employment_type) !== '—'
                        ? employmentTypeDisplayLabel(row.employment_type)
                        : resolveEmploymentTypeDisplay(row.employment_type)}
                    </TableCell>
                    <TableCell
                      className="max-w-[10rem] truncate text-sm"
                      data-testid={`yctd-grade-label-${row.id}`}
                      title={resolveJobGradeLabel(jobGradeOptions, row.job_grade_key)}
                    >
                      {resolveJobGradeLabel(jobGradeOptions, row.job_grade_key)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(row.status)}>
                        {REQUISITION_STATUS_LABEL_VI[row.status] ?? row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <PermissionGate
                          module="recruitment"
                          anyOf={[
                            { module: 'recruitment', action: 'update' },
                            { module: 'recruitment', action: 'create' },
                          ]}
                        >
                          {canSubmitRequisitionRow(row) ? (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              disabled={submitting}
                              data-testid={hdsdRequisitionSubmitWfTestId(row.id)}
                              aria-label="Gửi duyệt QT"
                              onClick={() => void onSubmitWorkflow(row)}
                            >
                              Gửi duyệt QT
                            </Button>
                          ) : null}
                        </PermissionGate>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => void openDetail(row)}
                          disabled={detailLoading}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Chi tiết
                        </Button>
                        <PermissionGate module="recruitment" action="update">
                          {requisitionLocked(row) ? (
                            <span className="max-w-[9rem] text-left text-[10px] leading-tight text-muted-foreground">
                              QT XBOS đang chạy
                            </span>
                          ) : (
                            <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(row)}>
                              <Pencil className="mr-1 h-4 w-4" />
                              Sửa
                            </Button>
                          )}
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          className="max-h-[90vh] max-w-4xl overflow-y-auto"
          data-testid={HDSD_MUTATE_TEST_IDS.requisitionFormDialog}
        >
          <DialogHeader>
            <DialogTitle>Tạo yêu cầu tuyển dụng</DialogTitle>
            <DialogDescription>
              Chọn trong/ngoài định biên + JD Hiệu lực — lưu nháp rồi gửi duyệt (không mở nhận hồ sơ ngay).
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreate)} className="grid grid-cols-3 gap-4">
              {isCreateFormReady ? (
                <span
                  data-testid={HDSD_MUTATE_TEST_IDS.requisitionFormReady}
                  className="sr-only"
                  aria-hidden
                >
                  Form ready
                </span>
              ) : null}
              <div className="col-span-3">
                <FormField
                  control={createForm.control}
                  name="headcount_mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trong / ngoài định biên *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v as HrmJobRequisitionHeadcountMode);
                          if (v === 'in_plan') {
                            createForm.setValue('out_of_plan_reason', '');
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="yctd-headcount-mode">
                            <SelectValue placeholder="Chọn nhánh" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="in_plan">{YCTD_MODE_LABEL_VI.in_plan}</SelectItem>
                          <SelectItem value="out_of_plan">{YCTD_MODE_LABEL_VI.out_of_plan}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {watchedHeadcountMode === 'out_of_plan' ? (
                        <p className="text-xs text-warning" data-testid="yctd-long-matrix-hint">
                          {YCTD_LONG_MATRIX_HINT_VI}
                        </p>
                      ) : null}
                    </FormItem>
                  )}
                />
              </div>
              {watchedHeadcountMode === 'in_plan' ? (
                <div className="col-span-3">
                  <FormField
                    control={createForm.control}
                    name="headcount_cell_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{YCTD_CELL_PICKER_LABEL_VI}</FormLabel>
                        <FormControl>
                          <CatalogSearchPicker
                            options={cellPickerOptions}
                            value={field.value || ''}
                            onValueChange={(v) => {
                              field.onChange(v);
                              const hit = cellPickerOptions.find((o) => o.value === v);
                              if (hit && hit.need_hire >= 1) {
                                createForm.setValue('headcount', hit.need_hire);
                              }
                            }}
                            placeholder="Chọn ô Cần tuyển đã duyệt"
                            searchPlaceholder="Tìm phòng ban / chức danh / tháng…"
                            loading={approvedCellsLoading}
                            errorText={approvedCellsError ?? undefined}
                            emptyHint={
                              <p className="text-xs font-medium text-muted-foreground">
                                {YCTD_CELL_PICKER_EMPTY_VI}
                              </p>
                            }
                            data-testid="yctd-headcount-cell-id"
                          />
                        </FormControl>
                        <FormMessage />
                        {field.value ? (
                          <p className="text-[11px] text-muted-foreground font-mono" data-testid="yctd-cell-id-value">
                            {field.value}
                          </p>
                        ) : null}
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <div className="col-span-3">
                  <FormField
                    control={createForm.control}
                    name="out_of_plan_reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lý do ngoài định biên *</FormLabel>
                        <Select
                          value={OUT_OF_PLAN_REASONS.includes(field.value) ? field.value : field.value ? 'Khác' : ''}
                          onValueChange={(v) => {
                            field.onChange(v === 'Khác' ? '' : v);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="yctd-out-of-plan-reason-select">
                              <SelectValue placeholder="Chọn lý do" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {OUT_OF_PLAN_REASONS.map((r) => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {(!OUT_OF_PLAN_REASONS.includes(field.value) && field.value !== undefined) || field.value === '' ? (
                          <FormControl>
                            <Textarea
                              rows={2}
                              className="mt-2"
                              placeholder="VD: Nhập lý do khác..."
                              data-testid="yctd-out-of-plan-reason"
                              {...field}
                            />
                          </FormControl>
                        ) : null}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <FormField
                  control={createForm.control}
                  name="hire_reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lý do tuyển *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v as HrmJobRequisitionHireReason);
                          if (v === 'new') createForm.setValue('replace_employee_id', '');
                        }}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="yctd-hire-reason">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">{YCTD_HIRE_REASON_LABEL_VI.new}</SelectItem>
                          <SelectItem value="replace">{YCTD_HIRE_REASON_LABEL_VI.replace}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchedHireReason === 'replace' ? (
                  <div className="col-span-2">
                    <FormField
                      control={createForm.control}
                      name="replace_employee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NV thay thế *</FormLabel>
                        <FormControl>
                          <CatalogSearchPicker
                            options={employeeOptions}
                            value={field.value || ''}
                            onValueChange={field.onChange}
                            placeholder="Chọn nhân viên"
                            data-testid="yctd-replace-employee"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                ) : (
                  <div className="col-span-2" />
                )}
              <div className="col-span-3">
                <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Tuyển chuyên viên kinh doanh"
                        data-testid={HDSD_MUTATE_TEST_IDS.requisitionTitle}
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <div className="col-span-3">
                <FormField
                  control={createForm.control}
                  name="job_template_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>JD từ thư viện *</FormLabel>
                    <FormControl>
                      <CatalogSearchPicker
                        options={jobTemplateOptions}
                        value={
                          isRequisitionJobTemplateSelected(field.value) ? field.value : ''
                        }
                        onValueChange={(v) => {
                          field.onChange(v);
                          applyTemplate(v);
                        }}
                        disabled={effectiveTemplatesLoading || libraryEmpty}
                        loading={effectiveTemplatesLoading}
                        data-testid={HDSD_MUTATE_TEST_IDS.requisitionJobTemplate}
                        placeholder={
                          libraryEmpty
                            ? 'Chưa có JD — mở Thư viện JD'
                            : 'Chọn JD *'
                        }
                        searchPlaceholder="Tìm theo mã hoặc tiêu đề JD…"
                        emptyHint={
                          onOpenJdLibrary ? (
                            <Button type="button" size="sm" variant="secondary" onClick={goToJdLibrary}>
                              {REQUISITION_OPEN_JD_LIBRARY_CTA_VI}
                            </Button>
                          ) : (
                            <p className="font-medium">{REQUISITION_OPEN_JD_LIBRARY_CTA_VI}</p>
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                    {libraryEmpty ? (
                      <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                        <p className="mb-2">{REQUISITION_EMPTY_JD_LIBRARY_HINT_VI}</p>
                        {onOpenJdLibrary ? (
                          <Button type="button" size="sm" variant="secondary" onClick={goToJdLibrary}>
                            {REQUISITION_OPEN_JD_LIBRARY_CTA_VI}
                          </Button>
                        ) : (
                          <p className="font-medium">{REQUISITION_OPEN_JD_LIBRARY_CTA_VI}</p>
                        )}
                      </div>
                    ) : null}
                    {!libraryEmpty && (jdPreviewLoading || jdPreview) ? (
                      <div
                        className="rounded-lg border border-xevn-border bg-muted/40 px-3 py-2 text-xs"
                        data-testid="yctd-jd-preview"
                      >
                        {jdPreviewLoading && !jdPreview ? (
                          <p className="text-muted-foreground">Đang tải xem trước JD…</p>
                        ) : jdPreview ? (
                          <>
                            <p className="font-medium text-sm text-xevn-text">
                              {jdPreview.code ? `${jdPreview.code} · ` : ''}
                              {jdPreview.title}
                            </p>
                            {jdPreview.short_description ? (
                              <p className="mt-1 whitespace-pre-wrap text-xevn-textSecondary">
                                {jdPreview.short_description}
                              </p>
                            ) : (
                              <p className="mt-1 text-muted-foreground">Không có mô tả ngắn.</p>
                            )}
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </FormItem>
                )}
              />
              </div>
              <FormField
                  control={createForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phòng/Ban *</FormLabel>
                      <FormControl>
                        <CatalogSearchPicker
                          options={departmentOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Chọn phòng ban từ danh mục"
                          loading={catalogsLoading}
                          data-testid={HDSD_MUTATE_TEST_IDS.requisitionDepartment}
                          errorText={catalogsError ? 'Không tải được danh mục phòng ban' : undefined}
                          emptyHint={
                            <Link to="/settings" className="text-primary underline text-xs font-medium">
                              Mở Cài đặt → Danh mục nghiệp vụ / Phòng ban
                            </Link>
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="headcount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          inputMode="numeric"
                          placeholder="VD: 3"
                          data-testid={HDSD_MUTATE_TEST_IDS.requisitionHeadcount}
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={field.value === undefined || field.value === null ? '' : field.value}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '') {
                              field.onChange('');
                              return;
                            }
                            field.onChange(Number(raw));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={createForm.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại hình *</FormLabel>
                    <FormControl>
                      <CatalogSearchPicker
                        options={employmentTypeOptions}
                        value={field.value || ''}
                        onValueChange={field.onChange}
                        placeholder="Chọn loại hình"
                        loading={employmentTypesLoading}
                        errorText={
                          employmentTypesError ? 'Không tải được catalog loại hình thuê.' : undefined
                        }
                        emptyHint={
                          <a
                            href="/settings"
                            className="text-primary underline text-xs font-medium"
                            data-testid="hdsd-emp-open-employment-types-yctd"
                          >
                            Mở Cài đặt → Loại hình thuê EMP
                          </a>
                        }
                        data-testid={HDSD_MUTATE_TEST_IDS.requisitionEmploymentType}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="job_grade_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngạch/bậc</FormLabel>
                    <FormControl>
                      <CatalogSearchPicker
                        options={jobGradeOptions}
                        value={field.value || ''}
                        onValueChange={field.onChange}
                        placeholder="Chọn ngạch bậc"
                        loading={catalogsLoading}
                        errorText={catalogsError ? 'Không tải được danh mục ngạch bậc' : undefined}
                        emptyHint={
                          <Link
                            to="/settings"
                            className="text-primary underline text-xs font-medium"
                            data-testid="hdsd-rec-open-job-grades-yctd"
                          >
                            Mở Cài đặt → Danh mục nghiệp vụ / Ngạch bậc
                          </Link>
                        }
                        data-testid={HDSD_MUTATE_TEST_IDS.requisitionJobGrade}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-3">
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || libraryEmpty}
                    data-testid={HDSD_MUTATE_TEST_IDS.requisitionFormSubmit}
                    aria-label="Lưu"
                  >
                    Lưu yêu cầu
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={editRow != null} onOpenChange={(open) => !open && setEditRow(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sửa yêu cầu tuyển dụng</DialogTitle>
            <DialogDescription>
              Phân loại trong/ngoài ĐB (O4) + số lượng — cấm nhảy open_for_hire bằng PATCH.
            </DialogDescription>
          </DialogHeader>
          {editRow ? (
            <div className="grid grid-cols-3 gap-4">
              <p className="col-span-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{editRow.title}</span>
              </p>
              {isYctdClassificationRequired(editRow) ? (
                <div className="col-span-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                  {YCTD_CLASSIFY_BANNER_VI}
                </div>
              ) : null}
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium leading-none">Trong / ngoài định biên *</label>
                <Select
                  value={editMode || undefined}
                  onValueChange={(v) => setEditMode(v as HrmJobRequisitionHeadcountMode)}
                  disabled={requisitionLocked(editRow)}
                >
                  <SelectTrigger data-testid="yctd-edit-headcount-mode">
                    <SelectValue placeholder="Chọn chế độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_plan">{YCTD_MODE_LABEL_VI.in_plan}</SelectItem>
                    <SelectItem value="out_of_plan">{YCTD_MODE_LABEL_VI.out_of_plan}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editMode === 'in_plan' ? (
                <div className="col-span-3 space-y-2">
                  <label className="text-sm font-medium leading-none">{YCTD_CELL_PICKER_LABEL_VI}</label>
                  <CatalogSearchPicker
                    options={editCellPickerOptions}
                    value={editCellId}
                    onValueChange={(v) => {
                      setEditCellId(v);
                      const hit = editCellPickerOptions.find((o) => o.value === v);
                      if (hit && hit.need_hire >= 1) setEditHeadcount(hit.need_hire);
                    }}
                    placeholder="Chọn ô Cần tuyển đã duyệt"
                    searchPlaceholder="Tìm phòng ban / chức danh / tháng…"
                    loading={approvedCellsLoading}
                    errorText={approvedCellsError ?? undefined}
                    disabled={requisitionLocked(editRow)}
                    emptyHint={
                      <p className="text-xs font-medium text-muted-foreground">
                        {YCTD_CELL_PICKER_EMPTY_VI}
                      </p>
                    }
                    data-testid="yctd-edit-cell-id"
                  />
                  {editCellId ? (
                    <p className="text-[11px] text-muted-foreground font-mono">{editCellId}</p>
                  ) : null}
                </div>
              ) : null}
              {editMode === 'out_of_plan' ? (
                <div className="col-span-3 space-y-2">
                  <label className="text-sm font-medium leading-none" htmlFor="edit-out-reason">Lý do ngoài ĐB *</label>
                  <Select
                    value={OUT_OF_PLAN_REASONS.includes(editOutReason) ? editOutReason : editOutReason ? 'Khác' : ''}
                    onValueChange={(v) => {
                      setEditOutReason(v === 'Khác' ? '' : v);
                    }}
                    disabled={requisitionLocked(editRow)}
                  >
                    <SelectTrigger data-testid="yctd-edit-out-reason-select">
                      <SelectValue placeholder="Chọn lý do" />
                    </SelectTrigger>
                    <SelectContent>
                      {OUT_OF_PLAN_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {(!OUT_OF_PLAN_REASONS.includes(editOutReason) && editOutReason !== undefined) || editOutReason === '' ? (
                    <Textarea
                      id="edit-out-reason"
                      rows={2}
                      className="mt-2"
                      placeholder="Nhập lý do khác..."
                      value={editOutReason}
                      onChange={(e) => setEditOutReason(e.target.value)}
                      disabled={requisitionLocked(editRow)}
                      data-testid="yctd-edit-out-reason"
                    />
                  ) : null}
                </div>
              ) : null}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Lý do tuyển</label>
                <Select
                  value={editHireReason || 'new'}
                  onValueChange={(v) => setEditHireReason(v as HrmJobRequisitionHireReason)}
                  disabled={requisitionLocked(editRow)}
                >
                  <SelectTrigger data-testid="yctd-edit-hire-reason">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{YCTD_HIRE_REASON_LABEL_VI.new}</SelectItem>
                    <SelectItem value="replace">{YCTD_HIRE_REASON_LABEL_VI.replace}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editHireReason === 'replace' ? (
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium leading-none">NV thay thế *</label>
                  <CatalogSearchPicker
                    options={employeeOptions}
                    value={editReplaceEmployeeId}
                    onValueChange={setEditReplaceEmployeeId}
                    placeholder="Chọn nhân viên"
                    data-testid="yctd-edit-replace-employee"
                  />
                </div>
              ) : null}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Ngạch/bậc</label>
                <CatalogSearchPicker
                  options={jobGradeOptions}
                  value={editJobGradeKey}
                  onValueChange={setEditJobGradeKey}
                  placeholder="Chọn ngạch bậc"
                  loading={catalogsLoading}
                  errorText={catalogsError ? 'Không tải được danh mục ngạch bậc' : undefined}
                  disabled={requisitionLocked(editRow)}
                  emptyHint={
                    <Link
                      to="/settings"
                      className="text-primary underline text-xs font-medium"
                      data-testid="hdsd-rec-open-job-grades-yctd-edit"
                    >
                      Mở Cài đặt → Danh mục nghiệp vụ / Ngạch bậc
                    </Link>
                  }
                  data-testid="yctd-edit-job-grade"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="edit-requisition-headcount">Số lượng *</label>
                <Input
                  id="edit-requisition-headcount"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  disabled={requisitionLocked(editRow)}
                  value={editHeadcount}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') {
                      setEditHeadcount(0);
                      return;
                    }
                    setEditHeadcount(Number(raw));
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Trạng thái</label>
                {editRow &&
                REQUISITION_LOCAL_STATUSES.includes(
                  editRow.status as (typeof REQUISITION_LOCAL_STATUSES)[number],
                ) ? (
                  <Select
                    value={editStatus}
                    onValueChange={(v) => setEditStatus(v as HrmJobRequisition['status'])}
                    disabled={requisitionLocked(editRow)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REQUISITION_LOCAL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {REQUISITION_STATUS_LABEL_VI[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="rounded-md border px-3 py-2 text-sm bg-muted/40">
                    {REQUISITION_STATUS_LABEL_VI[editRow?.status ?? 'draft'] ?? editRow?.status}
                    <p className="text-xs text-muted-foreground mt-1">
                      Không đổi «Mở nhận hồ sơ / Đang tuyển» tại đây — dùng Gửi duyệt / Duyệt.
                    </p>
                  </div>
                )}
              </div>
              {requisitionLocked(editRow) ? (
                <p className="col-span-3 text-xs font-medium text-warning">{RECRUITMENT_WF_LOCKED_HINT_VI}</p>
              ) : null}
              <div className="col-span-3">
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditRow(null)}>
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void onUpdateStatus()}
                    disabled={submitting || requisitionLocked(editRow)}
                  >
                    Lưu thay đổi
                  </Button>
                </DialogFooter>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={detailRow != null} onOpenChange={(open) => !open && setDetailRow(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu tuyển dụng</DialogTitle>
            <DialogDescription>Chi tiết YCTD — mode / JD / cờ pipeline (F5 còn).</DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Đang tải chi tiết…</p>
          ) : detailRow ? (
            <div className="space-y-3 text-sm">
              {isYctdClassificationRequired(detailRow) ? (
                <div
                  className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning"
                  data-testid="yctd-detail-classify-banner"
                >
                  {YCTD_CLASSIFY_BANNER_VI}
                </div>
              ) : null}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                  <p className="text-xs text-muted-foreground">Tiêu đề</p>
                  <p className="font-medium">{detailRow.title}</p>
                </div>
                <div className="col-span-1" data-testid="yctd-jd-ref-detail">
                  <p className="text-xs text-muted-foreground">JD gắn</p>
                  <p className="font-medium">
                    {resolveRequisitionJdDisplay(detailRow, templates)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trong/Ngoài ĐB</p>
                  <Badge
                    variant={isYctdClassificationRequired(detailRow) ? 'destructive' : 'outline'}
                    data-testid="yctd-detail-mode"
                  >
                    {yctdModeBadgeLabel(
                      detailRow.headcount_mode,
                      isYctdClassificationRequired(detailRow),
                    )}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lý do tuyển</p>
                  <p data-testid="yctd-detail-hire-reason">
                    {detailRow.hire_reason
                      ? YCTD_HIRE_REASON_LABEL_VI[
                          normalizeYctdHireReason(detailRow.hire_reason) ?? 'new'
                        ]
                      : '—'}
                  </p>
                </div>
                {detailRow.headcount_cell_id ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Ô định biên</p>
                    <p className="text-sm font-medium" data-testid="yctd-detail-cell-label">
                      {resolveYctdCellLabel(
                        detailRow.headcount_cell_id,
                        detailCellPickerOptions,
                      )}
                    </p>
                  </div>
                ) : null}
                {normalizeYctdHireReason(detailRow.hire_reason) === 'replace' ? (
                  <div>
                    <p className="text-xs text-muted-foreground">NV thay thế</p>
                    <p data-testid="yctd-detail-replace-employee">
                      {resolveYctdReplaceEmployeeDisplay(
                        detailRow.replace_employee_id,
                        employeeOptions,
                      )}
                    </p>
                  </div>
                ) : null}
                {detailRow.out_of_plan_reason ? (
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-xs text-muted-foreground">Lý do ngoài ĐB</p>
                    <p data-testid="yctd-detail-out-reason">{detailRow.out_of_plan_reason}</p>
                  </div>
                ) : null}
                <div>
                  <p className="text-xs text-muted-foreground">Phòng/Ban</p>
                  <p>{detailRow.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Số lượng</p>
                  <p className="font-medium tabular-nums">
                    {normalizeRequisitionHeadcount(detailRow.headcount) ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Loại hình</p>
                  <p>
                    {resolveEmpEmploymentTypeLabel(employmentTypeOptions, detailRow.employment_type) !==
                    '—'
                      ? resolveEmpEmploymentTypeLabel(
                          employmentTypeOptions,
                          detailRow.employment_type,
                        )
                      : resolveEmploymentTypeDisplay(detailRow.employment_type)}
                  </p>
                </div>
                <div data-testid="yctd-detail-job-grade">
                  <p className="text-xs text-muted-foreground">Ngạch/bậc</p>
                  <p className="font-medium">
                    {resolveJobGradeLabel(jobGradeOptions, detailRow.job_grade_key)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trạng thái</p>
                  <Badge variant={statusBadgeVariant(detailRow.status)}>
                    {REQUISITION_STATUS_LABEL_VI[detailRow.status] ?? detailRow.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Đơn vị</p>
                  <p className="text-sm">{resolveHrmCompanyIdDisplay(detailRow.company_id, operatingUnitLabelMap)}</p>
                </div>
                {detailRow.approval_matrix_key || detailApprovalChain ? (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <p className="text-xs text-muted-foreground">Ma trận duyệt</p>
                    <p className="text-sm font-medium" data-testid="yctd-detail-matrix-label">
                      {detailApprovalChain?.matrixLabelVi ?? '—'}
                    </p>
                  </div>
                ) : null}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {detailApprovalChain &&
              (detailApprovalChain.chainSteps.length > 0 ||
                detailApprovalChain.nextApproverHintVi) ? (
                <div
                  className="space-y-2 rounded-lg border border-xevn-border bg-muted/20 p-2"
                  data-testid="yctd-approval-chain"
                >
                  <p className="text-xs font-medium text-xevn-text">Chuỗi duyệt (SHORT / LONG)</p>
                  {detailApprovalChain.chainSteps.length > 0 ? (
                    <ol className="flex flex-wrap gap-2" data-testid="yctd-approval-chain-steps">
                      {detailApprovalChain.chainSteps.map((step) => (
                        <li key={step.id}>
                          <Badge
                            variant={
                              step.state === 'done'
                                ? 'default'
                                : step.state === 'current'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            data-testid={`yctd-chain-step-${step.id}-${step.state}`}
                          >
                            {step.label}
                            {step.state === 'current' ? ' · đang chờ' : ''}
                            {step.state === 'pending' ? ' · tiếp theo' : ''}
                          </Badge>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  {detailApprovalChain.nextApproverHintVi ? (
                    <p className="text-xs text-xevn-textSecondary" data-testid="yctd-approval-next-hint">
                      {detailApprovalChain.nextApproverHintVi}
                    </p>
                  ) : null}
                  {detailApprovalChain.bodStepPending && detailApprovalChain.blockedFromCv ? (
                    <p className="text-xs font-medium text-warning" data-testid="yctd-bod-blocked-cv">
                      {YCTD_BOD_BLOCKED_CV_VI}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {detailRow.workflow_instance_id ? (
                <div>
                  <p className="text-xs text-muted-foreground">Quy trình</p>
                  <Badge variant="secondary">{resolveWorkflowInstanceDisplay(detailRow.workflow_instance_id)}</Badge>
                </div>
              ) : null}
              {detailRow.rejected_reason ? (
                <div
                  className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2"
                  data-testid="yctd-detail-rejected-reason"
                >
                  <p className="text-xs text-muted-foreground">Lý do từ chối</p>
                  <p className="text-sm font-medium text-destructive">{detailRow.rejected_reason}</p>
                </div>
              ) : null}
              {requisitionLocked(detailRow) ? (
                <p className="text-xs font-medium text-warning">{RECRUITMENT_WF_LOCKED_HINT_VI}</p>
              ) : null}

              {detailApprovalChain?.showTransitionActions ? (
                <div className="space-y-2 rounded-lg border border-xevn-border p-2" data-testid="yctd-transitions">
                  <p className="text-xs font-medium text-xevn-text">Duyệt / từ chối (transitions)</p>
                  <Textarea
                    rows={2}
                    placeholder="Lý do từ chối (bắt buộc khi Từ chối)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    data-testid="yctd-reject-reason"
                  />
                  <div className="flex flex-wrap gap-2">
                    <PermissionGate module="recruitment" action="update">
                      <Button
                        type="button"
                        size="sm"
                        disabled={submitting}
                        data-testid="yctd-transition-approve"
                        onClick={() => void onTransition(detailRow, 'approve')}
                      >
                        {detailApprovalChain.approveButtonLabelVi}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={submitting}
                        data-testid="yctd-transition-reject"
                        onClick={() => void onTransition(detailRow, 'reject')}
                      >
                        Từ chối
                      </Button>
                    </PermissionGate>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2 rounded-lg border border-xevn-border p-2" data-testid="yctd-internal-cv-scan">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium text-xevn-text">{YCTD_CV_SCAN_TITLE_VI}</p>
                  {(() => {
                    const scanFlags = resolvePipelineFlags(detailRow);
                    const scanState = resolveCvScanAuditState(scanFlags);
                    return (
                      <Badge
                        variant="outline"
                        data-testid="yctd-cv-scan-status-badge"
                        className={
                          scanState === 'done'
                            ? 'border-emerald-600 text-emerald-700'
                            : scanState === 'skipped'
                              ? 'border-amber-600 text-amber-700'
                              : 'border-xevn-border text-xevn-text-secondary'
                        }
                      >
                        {cvScanAuditBadgeLabel(scanState)}
                      </Badge>
                    );
                  })()}
                </div>
                <p className="text-xs text-xevn-text-secondary">{YCTD_CV_SCAN_HINT_VI}</p>
                {(() => {
                  const scanFlags = resolvePipelineFlags(detailRow);
                  if (scanFlags.internal_scan_at) {
                    return (
                      <p className="text-xs text-xevn-text-secondary" data-testid="yctd-cv-scan-detail-at">
                        Lúc {formatCvScanAtVi(scanFlags.internal_scan_at)}
                        {scanFlags.internal_scan_skipped && scanFlags.internal_scan_skip_reason
                          ? ` · Lý do: ${scanFlags.internal_scan_skip_reason}`
                          : ''}
                      </p>
                    );
                  }
                  return null;
                })()}
                {!canMutateYctdPipelineFlags(detailRow) ? (
                  <p className="text-xs text-warning">
                    {isYctdClassificationRequired(detailRow)
                      ? YCTD_CLASSIFY_BANNER_VI
                      : YCTD_NOT_RECEIVABLE_HINT_VI}
                  </p>
                ) : (
                  <PermissionGate module="recruitment" action="update">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={submitting}
                      data-testid="yctd-cv-scan-open"
                      onClick={() => setCvScanOpen(true)}
                    >
                      Mở quét kho
                    </Button>
                  </PermissionGate>
                )}
              </div>

              <div className="space-y-2 rounded-lg border border-xevn-border p-2" data-testid="yctd-pipeline-flags">
                <p className="text-xs font-medium text-xevn-text">Cờ pipeline trên YCTD (không Campaign)</p>
                {!canMutateYctdPipelineFlags(detailRow) ? (
                  <p className="text-xs text-warning" data-testid="yctd-pipeline-blocked-hint">
                    {isYctdClassificationRequired(detailRow)
                      ? YCTD_CLASSIFY_BANNER_VI
                      : detailApprovalChain?.bodStepPending
                        ? YCTD_BOD_BLOCKED_CV_VI
                        : YCTD_NOT_RECEIVABLE_HINT_VI}
                  </p>
                ) : (
                  <>
                    {!canSetYctdPostedFromScan(resolvePipelineFlags(detailRow)) ? (
                      <p className="text-xs text-warning" data-testid="yctd-posted-scan-gate-hint">
                        {YCTD_CV_SCAN_POSTED_BLOCKED_VI}
                      </p>
                    ) : null}
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={pipelinePosted}
                        onChange={(e) => {
                          const next = e.target.checked;
                          if (next && !canSetYctdPostedFromScan(resolvePipelineFlags(detailRow))) {
                            toast({
                              title: 'Chặn đăng tin',
                              description: YCTD_CV_SCAN_POSTED_BLOCKED_VI,
                              variant: 'destructive',
                            });
                            setPipelinePosted(false);
                            return;
                          }
                          setPipelinePosted(next);
                        }}
                        data-testid="yctd-flag-posted"
                      />
                      Đã đăng tin (kênh ngoài GĐ1 — không Campaign)
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={pipelineCvIntake}
                        onChange={(e) => setPipelineCvIntake(e.target.checked)}
                        data-testid="yctd-flag-cv-intake"
                      />
                      Cho nhận hồ sơ
                    </label>
                    <PermissionGate module="recruitment" action="update">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={submitting}
                        data-testid="yctd-pipeline-flags-save"
                        onClick={() => void onPatchPipelineFlags(detailRow)}
                      >
                        Lưu cờ pipeline
                      </Button>
                    </PermissionGate>
                  </>
                )}
              </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setDetailRow(null)}>
                  Đóng
                </Button>
                <PermissionGate
                  module="recruitment"
                  anyOf={[
                    { module: 'recruitment', action: 'update' },
                    { module: 'recruitment', action: 'create' },
                  ]}
                >
                  {canSubmitRequisitionRow(detailRow) ? (
                    <Button
                      type="button"
                      disabled={submitting}
                      data-testid={hdsdRequisitionSubmitWfTestId(detailRow.id)}
                      aria-label="Gửi duyệt QT"
                      onClick={() => void onSubmitWorkflow(detailRow)}
                    >
                      Gửi duyệt QT
                    </Button>
                  ) : null}
                </PermissionGate>
                <PermissionGate module="recruitment" action="update">
                  <Button
                    type="button"
                    disabled={requisitionLocked(detailRow)}
                    onClick={() => {
                      openEdit(detailRow);
                      setDetailRow(null);
                    }}
                  >
                    <Pencil className="mr-1.5 h-4 w-4" />
                    Sửa
                  </Button>
                </PermissionGate>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <InternalCvScanDialog
        open={cvScanOpen}
        onOpenChange={setCvScanOpen}
        requisition={detailRow}
        companyId={
          detailRow
            ? resolveRequisitionMutateCompanyId(
                detailRow.company_id,
                effectiveCompanyId,
                currentCompanyId,
              ) ||
              effectiveCompanyId ||
              currentCompanyId ||
              ''
            : ''
        }
        onCompleted={(updated) => {
          setDetailRow(updated);
          const flags = resolvePipelineFlags(updated);
          setPipelinePosted(Boolean(flags.posted));
          setPipelineCvIntake(Boolean(flags.cv_intake_allowed));
          void refetch();
        }}
      />
    </div>
  );
}
