import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, Plus, RefreshCw, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import {
  createJobRequisition,
  getJobRequisition,
  listJobDescriptionTemplates,
  submitJobRequisitionWorkflow,
  updateJobRequisition,
  type HrmJobDescriptionTemplate,
  type HrmJobRequisition,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  EMPLOYMENT_TYPE_OPTIONS,
  isRequisitionJobTemplateSelected,
  REQUISITION_EMPTY_JD_LIBRARY_HINT_VI,
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
} from '@/lib/jobRequisitionUi';
import { resolveRequisitionMutateCompanyId } from '@/lib/jobRequisitionScope';
import {
  canSubmitRequisitionWorkflow,
  detectRecruitmentSpawnMissing,
  isRecruitmentWorkflowLocked,
  RECRUITMENT_WF_LOCKED_HINT_VI,
} from '@/lib/recruitmentWorkflowUi';
import { useJobRequisitions } from '@/hooks/useJobRequisitions';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { jobTitleOptionsFromCatalog } from '@/lib/catalogSearchPicker';
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

const createSchema = z.object({
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
  job_description: z.string().max(5000).optional(),
  requirements: z.string().max(5000).optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;

function statusBadgeVariant(status: HrmJobRequisition['status']) {
  if (status === 'open' || status === 'approved') return 'default';
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
};

export function JobRequisitionsTab({
  onOpenJdLibrary,
  jobTemplates: jobTemplatesProp = [],
  jobTemplatesLoading: jobTemplatesLoadingProp = false,
  refetchJobTemplates: refetchJobTemplatesProp,
  hydrateJobTemplates: hydrateJobTemplatesProp,
}: JobRequisitionsTabProps = {}) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId, operatingUnitLabelMap } = useHrmOperatingUnitFilter();
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

  const effectiveTemplates = useMemo(() => {
    const merged = resolveEffectiveJobTemplates(templates, dialogHydratedTemplates);
    if (merged.length > 0) return merged;
    if (openSyncTemplatesRef.current.length > 0) return openSyncTemplatesRef.current;
    return merged;
  }, [templates, dialogHydratedTemplates]);
  const effectiveTemplatesLoading = templatesLoading && effectiveTemplates.length === 0;
  const {
    catalogs,
    isLoading: catalogsLoading,
    isError: catalogsError,
  } = useSettingsCatalogsOverview({ enabled: true });
  const [editRow, setEditRow] = useState<HrmJobRequisition | null>(null);
  const [editStatus, setEditStatus] = useState<HrmJobRequisition['status']>('open');
  const [editHeadcount, setEditHeadcount] = useState(1);
  const [detailRow, setDetailRow] = useState<HrmJobRequisition | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [spawnMissingBanner, setSpawnMissingBanner] = useState(false);
  /** SoT S2 — after YCTD create, surface immediate «Gửi duyệt QT» (J-REC-WF-02). */
  const [postCreateSubmitRow, setPostCreateSubmitRow] = useState<HrmJobRequisition | null>(null);

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: '',
      department: '',
      employment_type: 'full_time',
      headcount: 1,
      job_template_id: '',
      job_description: '',
      requirements: '',
    },
  });

  const selectedTemplateId = createForm.watch('job_template_id');
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
        createForm.setValue('job_description', '');
        createForm.setValue('requirements', '');
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
      createForm.setValue('job_description', tpl.job_description ?? '');
      createForm.setValue('requirements', tpl.requirements ?? '');
    },
    [effectiveTemplates, departmentOptions, ouLabels, jobTitleOptions, createForm],
  );

  const handleOpenCreate = useCallback(() => {
    void (async () => {
      let activeTemplates = resolveEffectiveJobTemplates(templates, dialogHydratedTemplates);
      if (activeTemplates.length === 0 && openSyncTemplatesRef.current.length > 0) {
        activeTemplates = openSyncTemplatesRef.current;
      }

      if (
        activeTemplates.length === 0 &&
        !createDialogRefetchAttemptedRef.current &&
        effectiveCompanyId
      ) {
        createDialogRefetchAttemptedRef.current = true;
        let fetched = await refetchTemplates();
        if (fetched.length === 0) {
          /** FE-15 — direct GET when shared refetch still empty (unwrap envelope + sync parent). */
          try {
            const direct = await listJobDescriptionTemplates({
              company_id: effectiveCompanyId,
            });
            fetched = [...unwrapJobDescriptionTemplateRows<HrmJobDescriptionTemplate>(direct)];
          } catch {
            /* parent refetch error already surfaced on page hook */
          }
        }
        if (fetched.length > 0) {
          activeTemplates = fetched;
          openSyncTemplatesRef.current = fetched;
          setDialogHydratedTemplates(fetched);
          hydrateJobTemplatesProp?.(fetched);
        }
      } else if (activeTemplates.length > 0) {
        openSyncTemplatesRef.current = [...activeTemplates];
        setDialogHydratedTemplates([...activeTemplates]);
      }

      const defaults = buildRequisitionCreateFormDefaults({
        templates: activeTemplates,
        departmentOptions,
        ouLabels,
        jobTitleOptions,
      });
      if (defaults) {
        createForm.reset(defaults);
      } else {
        createForm.reset({
          title: '',
          department: '',
          employment_type: 'full_time',
          headcount: 1,
          job_template_id: '',
          job_description: '',
          requirements: '',
        });
      }
      setCreateOpen(true);
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
        createForm.reset(defaults);
      }
    }
  }, [
    createOpen,
    effectiveTemplatesLoading,
    effectiveTemplates,
    departmentOptions,
    ouLabels,
    jobTitleOptions,
    createForm,
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
  }, [createOpen, effectiveTemplates, departmentOptions, ouLabels, jobTitleOptions, createForm]);

  /** D-HDSD-MUTATE-FE-04 — department catalog may load after JD pick; backfill required field. */
  useEffect(() => {
    if (!createOpen) return;
    if (createForm.getValues('department')?.trim()) return;
    const firstDept = departmentOptions[0]?.value;
    if (firstDept) {
      createForm.setValue('department', firstDept, { shouldValidate: true });
    }
  }, [createOpen, departmentOptions, createForm]);

  useEffect(() => {
    if (!createOpen) {
      createDialogRefetchAttemptedRef.current = false;
      openSyncTemplatesRef.current = [];
      setDialogHydratedTemplates([]);
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
    setSubmitting(true);
    try {
      const created = await createJobRequisition({
        company_id: effectiveCompanyId,
        title: values.title.trim(),
        department: values.department.trim(),
        employment_type: values.employment_type,
        headcount,
        job_description: values.job_description?.trim() || undefined,
        requirements: values.requirements?.trim() || undefined,
        job_template_id: jobTemplateId,
      });
      toast({
        title: 'Đã tạo yêu cầu tuyển dụng',
        description: 'Đã chép mô tả công việc từ thư viện JD vào yêu cầu này (bản snapshot). Bấm «Gửi duyệt QT» để tạo task Inbox.',
      });
      setCreateOpen(false);
      createForm.reset({
        title: '',
        department: '',
        employment_type: 'full_time',
        headcount: 1,
        job_template_id: '',
        job_description: '',
        requirements: '',
      });
      if (canSubmitRequisitionWorkflow(created.workflow_instance_id, created.status)) {
        setPostCreateSubmitRow(created);
      } else {
        setPostCreateSubmitRow(null);
      }
      await refetch();
    } catch (error: unknown) {
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
      await updateJobRequisition(editRow.id, mutateCompanyId, {
        status: editStatus,
        headcount,
      });
      toast({ title: 'Đã cập nhật yêu cầu', description: 'Trạng thái và số lượng đã lưu — tải lại trang để xác nhận.' });
      setEditRow(null);
      await refetch();
    } catch (error: unknown) {
      toast({
        title: 'Không cập nhật được',
        description: toErrorMessage(error, 'Kiểm tra phạm vi công ty và quyền truy cập.'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitWorkflow = async (row: HrmJobRequisition) => {
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
    setEditStatus(row.status === 'pending_approval' ? 'open' : row.status);
    setEditHeadcount(normalizeRequisitionHeadcount(row.headcount) ?? 1);
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

  if (!useApiMode) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Yêu cầu tuyển dụng</h2>
          <p className="text-sm text-muted-foreground">
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
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {fetchError}
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
                <TableHead>Phòng/Ban</TableHead>
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead>Loại hình</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisitions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    Chưa có yêu cầu — bấm «Thêm yêu cầu» để tạo mới.
                  </TableCell>
                </TableRow>
              ) : (
                requisitions.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell className="text-center font-medium tabular-nums">
                      {normalizeRequisitionHeadcount(row.headcount) ?? '—'}
                    </TableCell>
                    <TableCell>{resolveEmploymentTypeDisplay(row.employment_type)}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(row.status)}>
                        {REQUISITION_STATUS_LABEL_VI[row.status]}
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
          className="max-h-[90vh] max-w-lg overflow-y-auto"
          data-testid={HDSD_MUTATE_TEST_IDS.requisitionFormDialog}
        >
          <DialogHeader>
            <DialogTitle>Tạo yêu cầu tuyển dụng</DialogTitle>
            <DialogDescription>
              Bắt buộc chọn JD từ thư viện — hệ thống chép mô tả/yêu cầu vào yêu cầu này (snapshot, không liên kết live).
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
              {isCreateFormReady ? (
                <span
                  data-testid={HDSD_MUTATE_TEST_IDS.requisitionFormReady}
                  className="sr-only"
                  aria-hidden
                >
                  Form ready
                </span>
              ) : null}
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
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
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
                  </FormItem>
                )}
              />
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
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <FormField
                control={createForm.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại hình *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid={HDSD_MUTATE_TEST_IDS.requisitionEmploymentType}>
                          <SelectValue placeholder="Chọn loại hình" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="job_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả công việc (snapshot từ JD)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        disabled={!jdSnapshotUnlocked}
                        placeholder={
                          jdSnapshotUnlocked
                            ? 'Chép từ JD — có thể chỉnh bản chép trên yêu cầu này'
                            : 'Chọn JD ở trên để điền mô tả'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yêu cầu (snapshot từ JD)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        disabled={!jdSnapshotUnlocked}
                        placeholder={
                          jdSnapshotUnlocked
                            ? 'Chép từ JD — có thể chỉnh bản chép trên yêu cầu này'
                            : 'Chọn JD ở trên để điền yêu cầu'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={editRow != null} onOpenChange={(open) => !open && setEditRow(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sửa yêu cầu tuyển dụng</DialogTitle>
            <DialogDescription>
              Cập nhật trạng thái và số lượng — sau 2xx danh sách làm mới; F5 để xác minh.
            </DialogDescription>
          </DialogHeader>
          {editRow ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{editRow.title}</span>
              </p>
              <div className="space-y-2">
                <FormLabel htmlFor="edit-requisition-headcount">Số lượng *</FormLabel>
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
              {requisitionLocked(editRow) ? (
                <p className="text-xs text-amber-800 dark:text-amber-200">{RECRUITMENT_WF_LOCKED_HINT_VI}</p>
              ) : null}
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
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={detailRow != null} onOpenChange={(open) => !open && setDetailRow(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu tuyển dụng</DialogTitle>
            <DialogDescription>Chi tiết yêu cầu tuyển dụng theo hồ sơ đã lưu.</DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Đang tải chi tiết…</p>
          ) : detailRow ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Tiêu đề</p>
                <p className="font-medium">{detailRow.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                  <p>{resolveEmploymentTypeDisplay(detailRow.employment_type)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trạng thái</p>
                  <Badge variant={statusBadgeVariant(detailRow.status)}>
                    {REQUISITION_STATUS_LABEL_VI[detailRow.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Đơn vị</p>
                  <p className="text-sm">{resolveHrmCompanyIdDisplay(detailRow.company_id, operatingUnitLabelMap)}</p>
                </div>
              </div>
              {detailRow.workflow_instance_id ? (
                <div>
                  <p className="text-xs text-muted-foreground">Quy trình</p>
                  <Badge variant="secondary">{resolveWorkflowInstanceDisplay(detailRow.workflow_instance_id)}</Badge>
                </div>
              ) : null}
              {requisitionLocked(detailRow) ? (
                <p className="text-xs text-amber-800 dark:text-amber-200">{RECRUITMENT_WF_LOCKED_HINT_VI}</p>
              ) : null}
              {detailRow.job_description ? (
                <div>
                  <p className="text-xs text-muted-foreground">Mô tả công việc (snapshot)</p>
                  <p className="whitespace-pre-wrap text-sm">{detailRow.job_description}</p>
                </div>
              ) : null}
              {detailRow.requirements ? (
                <div>
                  <p className="text-xs text-muted-foreground">Yêu cầu (snapshot)</p>
                  <p className="whitespace-pre-wrap text-sm">{detailRow.requirements}</p>
                </div>
              ) : null}
              <DialogFooter className="gap-2 sm:justify-end">
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
    </div>
  );
}
