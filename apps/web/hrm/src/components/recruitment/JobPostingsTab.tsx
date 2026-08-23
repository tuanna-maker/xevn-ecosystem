/**
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E1A-PICKER-01
 * change_mode: ADD
 * What: position/department CatalogSearchPicker; Network position_key + department_key + snapshots
 * Why: AC-E1A-JP-01 · FR-HRM-MD-BIND-E1A-01 · U72
 * must_keep: JobRequisitions JD picker; JobTemplates; U65; HOLD_DEPLOY; not FR-RC-01 SoT
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-REC-A
 * change_mode: UPGRADE
 * What: Precision Motion — kill purple KPI; DNA priority chips; create/edit dialog glass+compact fields
 * Why: ADR §16 · inventory R04/R12 · B4 cấm AI purple · ui-neo field widths
 * must_keep: CatalogSearchPicker wires · ViMoneyInput · mutate create/update · U65 · no Nest invent
 * ADR: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-REC-A-FIX-01
 * change_mode: UPGRADE
 * What: Page title h2 «Tin tuyển dụng» inside rec-jobs-tab-precision — font-display text-[20px] + xevn-type-title
 * Why: QA DEF R04 — shell text-xl computed 17.5px Source Sans; harness measures h2 inside testid first
 * must_keep: CatalogSearchPicker · ViMoneyInput · R12 dialog chrome · Hire bind · U65 · tab ids
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-fix.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-UI-P0-LOGO-FONT-TITLE-01
 * change_mode: FIX
 * What: Create/edit job form — `title` FormField absolute first (before Basic Info h3)
 * Why: Sponsor — popup thêm mới: trường Tiêu đề đứng đầu form
 * must_keep: CatalogSearchPicker · ViMoneyInput · mutate create/update · U65 · dialog chrome
 * LastVerified: docs/qa/evidence/po-hrm-ui-p0-logo-font-title-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-15 REC-JOBPOST-DIALOG-FIX-FE-01
 * change_mode: UPGRADE
 * What: Form dialog 3-tab layout (Thông tin / JD & Yêu cầu / Đãi ngộ); JD template picker soft-ref; remove max-h scroll
 * Why: Bug1 layout scroll; Bug2 requirements no JD ref
 * must_keep: CatalogSearchPicker wires · ViMoneyInput · mutate create/update · U65 · dialog testid
 *
 * @CODE-MEMORY-CHANGE 2026-08-17 REC-JP-JD-LINK-FE-01
 * change_mode: REFACTOR
 * What: JD Template = SoT; bỏ textareas description/requirements/benefits; JdTemplateViewPanel inline; Tab Đãi ngộ salary-only; gửi jd_template_id thật lên API
 * Why: jd_template_id trước là UI-local, không gửi API; duplicate fields description/requirements
 * must_keep: CatalogSearchPicker wires · ViMoneyInput · mutate create/update · U65 · dialog testid · data-testid precision
 */
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import {
  buildDepartmentKeyFields,
  buildPositionKeyFields,
  departmentOptionsFromCatalog,
  jobTitleOptionsFromCatalog,
  resolveDepartmentLabel,
  resolvePositionDisplayLabel,
} from '@/lib/catalogSearchPicker';
import {
  ViMoneyInput,
  amountStringToNumber,
  numberToAmountString,
} from '@/components/ui/ViMoneyInput';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Edit,
  Eye,
  Trash2,
  CalendarIcon,
  Building2,
  Clock,
  LayoutGrid,
  List,
  UserPlus,
  X,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createJobPosting,
  deleteJobPosting,
  listJobPostings,
  updateJobPosting,
  listJobDescriptionTemplates,
  type HrmJobDescriptionTemplate,
} from '@/integrations/hrmApi';
import { cn } from '@/lib/utils';
import { resolveEmploymentTypeDisplay } from '@/lib/labelMaps';
import { JobCandidatesDialog } from './JobCandidatesDialog';
import { JdTemplateViewPanel } from '@/components/recruitment/JdTemplateViewPanel';

interface JobPosting {
  id: string;
  company_id: string;
  title: string;
  department: string | null;
  department_key?: string | null;
  position: string;
  position_key?: string | null;
  employment_type: string;
  work_location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  is_salary_visible: boolean | null;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  headcount: number;
  applied_count: number | null;
  status: string;
  deadline: string | null;
  priority: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  jd_template_id?: string | null;
  jd_content?: Record<string, unknown> | null;
  jd_code?: string | null;
  jd_title?: string | null;
}

const formatCurrency = (amount: number | null) => {
  if (!amount) return '';
  return new Intl.NumberFormat('vi-VN').format(amount);
};

export function JobPostingsTab({ autoOpenCreate = false }: { autoOpenCreate?: boolean }) {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(autoOpenCreate);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isCandidatesOpen, setIsCandidatesOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);

  // JD template picker state
  const [isJdPickerOpen, setIsJdPickerOpen] = useState(false);
  const [jdSearch, setJdSearch] = useState('');
  const [selectedJdRef, setSelectedJdRef] = useState<{ id: string; code: string; title: string } | null>(null);
  const [selectedJdFullRow, setSelectedJdFullRow] = useState<HrmJobDescriptionTemplate | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    catalogs,
    isLoading: catalogsLoading,
    isError: catalogsError,
  } = useSettingsCatalogsOverview();
  const positionOptions = useMemo(
    () => jobTitleOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );

  const workflows = useMemo(() => {
    try {
      const saved = localStorage.getItem('hrm.workflow-configs.v3');
      if (saved) {
        const data = JSON.parse(saved);
        const configs = Array.isArray(data) ? data : (data?.workflows || []);
        return configs.filter((c: any) => c.typeId === 'type-recruitment' && c.status === 'active');
      }
    } catch (e) {
      console.error('Failed to load workflow configs', e);
    }
    return [];
  }, []);

  const workflowOptions = useMemo(() => {
    return workflows.map((w: any) => ({
      value: w.id,
      label: w.name,
      code: w.code,
    }));
  }, [workflows]);



  const departmentOptions = useMemo(
    () => departmentOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );

  const statusOptions = [
    { value: 'all', label: t('recruitment.jt.statuses.all') },
    { value: 'active', label: t('recruitment.jt.statuses.active') },
    { value: 'draft', label: t('recruitment.jt.statuses.draft') },
    { value: 'paused', label: t('recruitment.jt.statuses.paused') },
    { value: 'closed', label: t('recruitment.jt.statuses.closed') },
  ];

  const employmentTypes = [
    { value: 'full-time', label: t('recruitment.jt.employmentTypes.full-time') },
    { value: 'part-time', label: t('recruitment.jt.employmentTypes.part-time') },
    { value: 'contract', label: t('recruitment.jt.employmentTypes.contract') },
    { value: 'intern', label: t('recruitment.jt.employmentTypes.intern') },
    { value: 'freelance', label: t('recruitment.jt.employmentTypes.freelance') },
  ];

  const priorityOptions = [
    { value: 'low', label: t('recruitment.jt.priorities.low'), color: 'bg-xevn-neutral/15 text-xevn-textSecondary' },
    { value: 'medium', label: t('recruitment.jt.priorities.medium'), color: 'bg-warning/15 text-warning' },
    { value: 'high', label: t('recruitment.jt.priorities.high'), color: 'bg-warning/15 text-warning' },
    { value: 'urgent', label: t('recruitment.jt.priorities.urgent'), color: 'bg-destructive/15 text-destructive' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="border-0 bg-success/15 text-success hover:bg-success/15">{t('recruitment.jt.statuses.active')}</Badge>;
      case 'draft':
        return <Badge className="border-0 bg-xevn-neutral/15 text-xevn-textSecondary hover:bg-xevn-neutral/15">{t('recruitment.jt.statuses.draft')}</Badge>;
      case 'paused':
        return <Badge className="border-0 bg-warning/15 text-warning hover:bg-warning/15">{t('recruitment.jt.statuses.paused')}</Badge>;
      case 'closed':
        return <Badge className="border-0 bg-destructive/15 text-destructive hover:bg-destructive/15">{t('recruitment.jt.statuses.closed')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string | null) => {
    const option = priorityOptions.find(p => p.value === priority) || priorityOptions[1];
    return <Badge className={cn(option.color, 'hover:' + option.color, 'border-0')}>{option.label}</Badge>;
  };

  const jobPostingSchema = z.object({
    title: z.string().min(1, t('recruitment.form.titleRequired')).max(200, t('recruitment.form.titleMax')),
    department_key: z.string().optional(),
    position_key: z.string().min(1, t('recruitment.form.typeRequired')),
    employment_type: z.string().min(1, t('recruitment.form.typeRequired')),
    work_location: z.string().optional(),
    salary_min: z.string().optional(),
    salary_max: z.string().optional(),
    is_salary_visible: z.boolean().default(true),
    headcount: z.string().min(1, t('recruitment.form.openingsRequired')),
    deadline: z.date().optional(),
    priority: z.string().default('medium'),
    status: z.string().default('draft'),
    jd_template_id: z.string().optional(),
    workflow_id: z.string().optional(),
  });

  type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

  const form = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: '',
      department_key: '',
      position_key: '',
      employment_type: 'full-time',
      work_location: '',
      salary_min: '',
      salary_max: '',
      is_salary_visible: true,
      headcount: '1',
      priority: 'medium',
      status: 'draft',
      jd_template_id: '',
      workflow_id: '',
    },
  });

  const selectedWorkflowId = form.watch('workflow_id');

  const filteredPositionOptions = useMemo(() => {
    if (!selectedWorkflowId) return positionOptions;
    const workflow = workflows.find((w: any) => w.id === selectedWorkflowId);
    if (!workflow) return positionOptions;
    
    // Filter positionOptions to only include those configured in the workflow
    return positionOptions.filter(opt => 
      workflow.positions?.some((p: any) => p.positionName === opt.value)
    );
  }, [selectedWorkflowId, workflows, positionOptions]);

  // Fetch job postings with candidate count
  const { data: jobPostings = [], isLoading } = useQuery({
    queryKey: ['job_postings', currentCompanyId, statusFilter],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const res = await listJobPostings({
        company_id: currentCompanyId,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      const rows = res.data ?? [];
      return rows.map((job) => ({
        id: job.id,
        title: job.title,
        department: job.department,
        department_key: job.department_key ?? null,
        position: job.position,
        position_key: job.position_key ?? null,
        employment_type: job.employment_type,
        work_location: job.work_location,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        is_salary_visible: job.is_salary_visible,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        headcount: job.headcount,
        deadline: job.deadline,
        priority: job.priority,
        status: job.status,
        company_id: job.company_id,
        created_at: job.created_at,
        candidate_count: job.applied_count ?? 0,
      })) as (JobPosting & { candidate_count: number })[];
    },
    enabled: !!currentCompanyId,
    staleTime: 30_000,   // 30s — list does not change constantly
  });

  // Fetch active JD templates (for soft-ref picker in form — REC-JOBPOST-DIALOG-FIX-FE-01)
  const { data: jdTemplates = [] } = useQuery({
    queryKey: ['jd_templates_for_posting', currentCompanyId, jdSearch],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const res = await listJobDescriptionTemplates({
        company_id: currentCompanyId,
        status: 'active',
        q: jdSearch || undefined,
      });
      return res.data ?? [];
    },
    enabled: !!currentCompanyId && isFormOpen,
    staleTime: 120_000, // 2min — JD templates change infrequently
  });

  const parseOptionalNumber = (value: string | undefined): number | undefined => {
    if (value == null || value.trim() === '') return undefined;
    const n = amountStringToNumber(value);
    return Number.isFinite(n) ? n : undefined;
  };

  const buildCreatePayload = (values: JobPostingFormValues) => {
    if (!currentCompanyId) throw new Error('Missing company scope');
    const pos = buildPositionKeyFields(values.position_key, positionOptions);
    if (!pos) throw new Error('Chon vi tri tu danh muc');
    const dept = values.department_key?.trim()
      ? buildDepartmentKeyFields(values.department_key, departmentOptions)
      : null;
    return {
      company_id: currentCompanyId,
      title: values.title,
      position_key: pos.position_key,
      position: pos.position,
      department_key: dept?.department_key,
      department: dept?.department,
      employment_type: values.employment_type,
      work_location: values.work_location || undefined,
      salary_min: parseOptionalNumber(values.salary_min),
      salary_max: parseOptionalNumber(values.salary_max),
      is_salary_visible: values.is_salary_visible,
      headcount: Number(values.headcount) || 1,
      deadline: values.deadline ? format(values.deadline, 'yyyy-MM-dd') : undefined,
      priority: values.priority,
      status: values.status,
      jd_template_id: values.jd_template_id || undefined,
    };
  };

  const autoFillPositionData = async (workflow: any, positionName: string) => {
    const pos = workflow.positions?.find((p: any) => p.positionName === positionName);
    if (!pos) return;

    // Auto fill department
    if (pos.department && pos.department !== 'ALL_COMPANY') {
      form.setValue('department_key', pos.department, { shouldValidate: true });
    }
    // Auto fill headcount
    if (pos.quantity) {
      const qty = parseInt(pos.quantity, 10);
      if (!isNaN(qty) && qty > 0) {
        form.setValue('headcount', qty.toString(), { shouldValidate: true });
      }
    }
    // Auto fill employmentType
    if (pos.employmentType) {
      form.setValue('employment_type', pos.employmentType, { shouldValidate: true });
    }
    // Auto fill deadline
    if (pos.deadlineDate) {
      const d = new Date(pos.deadlineDate);
      if (!isNaN(d.getTime())) {
        form.setValue('deadline', d, { shouldValidate: true });
      }
    }
    // Auto fill salary from workflow position config
    if (pos.salaryMin) {
      form.setValue('salary_min', pos.salaryMin, { shouldValidate: true });
    }
    if (pos.salaryMax) {
      form.setValue('salary_max', pos.salaryMax, { shouldValidate: true });
    }

    // Auto fill title if empty
    const opt = positionOptions.find(o => o.value === positionName);
    if (opt && !form.getValues('title')) {
      form.setValue('title', `Tuyển dụng ${opt.label}`, { shouldValidate: true });
    }

    // Auto fill JD template
    if (pos.jdTemplateId) {
      const tpl = jdTemplates.find((t) => t.id === pos.jdTemplateId);
      if (tpl) {
        handleSelectJdTemplate(tpl);
      } else {
        // Fallback fetch if not in the cached list
        try {
          const { getJobDescriptionTemplate } = await import('@/integrations/hrmApi');
          const res = await getJobDescriptionTemplate(pos.jdTemplateId, currentCompanyId!);
          if (res.data) {
            handleSelectJdTemplate(res.data);
          } else {
            form.setValue('jd_template_id', pos.jdTemplateId, { shouldValidate: true });
          }
        } catch (e) {
          form.setValue('jd_template_id', pos.jdTemplateId, { shouldValidate: true });
        }
      }
    } else {
      handleClearJd();
    }
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: JobPostingFormValues) => {
      await createJobPosting(buildCreatePayload(values));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_postings'] });
      toast.success(t('recruitment.createJobSuccess'));
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: JobPostingFormValues & { id: string }) => {
      if (!currentCompanyId) throw new Error('Missing company scope');
      const payload = buildCreatePayload(values);
      await updateJobPosting(values.id, currentCompanyId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_postings'] });
      toast.success(t('recruitment.it.updateSuccess'));
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentCompanyId) throw new Error('Missing company scope');
      await deleteJobPosting(id, currentCompanyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_postings'] });
      toast.success(t('recruitment.it.deleteSuccess'));
      setIsDeleteOpen(false);
      setSelectedJob(null);
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!currentCompanyId) throw new Error('Missing company scope');
      await Promise.all(ids.map((id) => deleteJobPosting(id, currentCompanyId)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_postings'] });
      toast.success(t('recruitment.jt.deleteSelected', { count: selectedItems.length }));
      setIsBulkDeleteOpen(false);
      setSelectedItems([]);
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    },
  });

  // Filter by search
  const filteredList = jobPostings.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.department?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (job.work_location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingJob(null);
    setSelectedJdRef(null);
    setSelectedJdFullRow(null);
    setIsJdPickerOpen(false);
    setJdSearch('');
    form.reset();
  };

  // JD template = SoT; gửi jd_template_id thật lên API (REC-JP-JD-LINK-FE-01)
  const handleSelectJdTemplate = (tpl: HrmJobDescriptionTemplate) => {
    form.setValue('jd_template_id', tpl.id);
    setSelectedJdRef({ id: tpl.id, code: tpl.code, title: tpl.title });
    setSelectedJdFullRow(tpl);
    setIsJdPickerOpen(false);
  };

  const handleClearJd = () => {
    form.setValue('jd_template_id', '');
    setSelectedJdRef(null);
    setSelectedJdFullRow(null);
  };

  const handleOpenCreate = () => {
    setEditingJob(null);
    setSelectedJdRef(null);
    setSelectedJdFullRow(null);
    setIsJdPickerOpen(false);
    setJdSearch('');
    form.reset({
      title: '',
      department_key: '',
      position_key: '',
      employment_type: 'full-time',
      work_location: '',
      salary_min: '',
      salary_max: '',
      is_salary_visible: true,
      headcount: '1',
      priority: 'medium',
      status: 'draft',
      jd_template_id: '',
      workflow_id: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (job: JobPosting) => {
    setEditingJob(job);
    setSelectedJdRef(null);
    setSelectedJdFullRow(null);
    setIsJdPickerOpen(false);
    setJdSearch('');
    form.reset({
      title: job.title,
      department_key: job.department_key?.trim() || '',
      position_key: job.position_key?.trim() || '',
      employment_type: job.employment_type,
      work_location: job.work_location || '',
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
      is_salary_visible: job.is_salary_visible ?? true,
      headcount: job.headcount.toString(),
      deadline: job.deadline ? new Date(job.deadline) : undefined,
      priority: job.priority || 'medium',
      status: job.status,
      jd_template_id: '',
      workflow_id: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenView = (job: JobPosting) => {
    setSelectedJob(job);
    setIsViewOpen(true);
  };

  const handleOpenCandidates = (job: JobPosting) => {
    setSelectedJob(job);
    setIsCandidatesOpen(true);
  };

  const handleOpenDelete = (job: JobPosting) => {
    setSelectedJob(job);
    setIsDeleteOpen(true);
  };

  const onSubmit = (values: JobPostingFormValues) => {
    if (editingJob) {
      updateMutation.mutate({ ...values, id: editingJob.id });
    } else {
      createMutation.mutate(values);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedList.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedList.map((j) => j.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Stats
  const stats = {
    total: jobPostings.length,
    active: jobPostings.filter(j => j.status === 'active').length,
    draft: jobPostings.filter(j => j.status === 'draft').length,
    totalHeadcount: jobPostings.filter(j => j.status === 'active').reduce((sum, j) => sum + j.headcount, 0),
  };

  return (
    <div className="space-y-4" data-testid="rec-jobs-tab-precision">
      {/* R04 page title >=20 Montserrat */}
      <h2 className="xevn-type-title font-display text-[20px] font-bold tracking-tight text-xevn-text">
        {t('recruitment.jobPostings')}
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-xevn-border bg-xevn-surface">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('recruitment.jt.totalPosts')}</p>
                <p className="text-2xl font-bold text-xevn-text">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-xevn-border bg-xevn-surface">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/15 p-2">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('recruitment.jt.activeRecruitment')}</p>
                <p className="text-2xl font-bold text-xevn-text">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-xevn-border bg-xevn-surface">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-xevn-neutral/15 p-2">
                <Clock className="h-5 w-5 text-xevn-textSecondary" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('recruitment.jt.draftPosts')}</p>
                <p className="text-2xl font-bold text-xevn-text">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-xevn-border bg-xevn-surface">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-xevn-accent/15 p-2">
                <Users className="h-5 w-5 text-xevn-accent" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('recruitment.jt.needHire')}</p>
                <p className="text-2xl font-bold text-xevn-text">{stats.totalHeadcount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={handleOpenCreate} data-testid="rec-job-create-btn">
            <Plus className="w-4 h-4 mr-2" />
            {t('recruitment.jt.createPost')}
          </Button>
          {selectedItems.length > 0 && (
            <Button variant="destructive" onClick={() => setIsBulkDeleteOpen(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t('recruitment.jt.deleteSelected', { count: selectedItems.length })}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-xevn-textMuted" />
            <Input
              placeholder={t('recruitment.jt.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === 'list' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.length === paginatedList.length && paginatedList.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>{t('recruitment.jt.thTitle')}</TableHead>
                <TableHead>{t('recruitment.jt.thDepartment')}</TableHead>
                <TableHead>{t('recruitment.jt.thLocation')}</TableHead>
                <TableHead>{t('recruitment.jt.thType')}</TableHead>
                <TableHead className="text-center">{t('recruitment.jt.thHeadcount')}</TableHead>
                <TableHead className="text-center">{t('recruitment.jt.thCandidates')}</TableHead>
                <TableHead>{t('recruitment.jt.thSalary')}</TableHead>
                <TableHead>{t('recruitment.jt.thDeadline')}</TableHead>
                <TableHead>{t('recruitment.jt.thPriority')}</TableHead>
                <TableHead>{t('recruitment.jt.thStatus')}</TableHead>
                <TableHead className="w-28"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                    {t('recruitment.jt.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedList.map((job) => (
                  <TableRow key={job.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems.includes(job.id)}
                        onCheckedChange={() => toggleSelectItem(job.id)}
                      />
                    </TableCell>
                    <TableCell onClick={() => handleOpenView(job)}>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {resolvePositionDisplayLabel(positionOptions, job.position_key, job.position)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.department_key
                        ? resolveDepartmentLabel(departmentOptions, job.department_key)
                        : job.department || '—'}
                    </TableCell>
                    <TableCell>{job.work_location || '-'}</TableCell>
                    <TableCell>
                      {employmentTypes.find(t => t.value === job.employment_type)?.label
                        ?? resolveEmploymentTypeDisplay(job.employment_type)}
                    </TableCell>
                    <TableCell className="text-center">{job.headcount}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary"
                        onClick={(e) => { e.stopPropagation(); handleOpenCandidates(job); }}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        {(job as any).candidate_count || 0}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {job.salary_min || job.salary_max ? (
                        <span className="text-sm">
                          {job.salary_min ? formatCurrency(job.salary_min) : '...'} - {job.salary_max ? formatCurrency(job.salary_max) : '...'} d
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{t('recruitment.jt.negotiable')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.deadline ? format(new Date(job.deadline), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell>{getPriorityBadge(job.priority)}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenCandidates(job)} title={t('recruitment.jt.viewCandidates')}>
                          <UserPlus className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenView(job)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(job)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(job)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {paginatedList.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOpenView(job)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(job.priority)}
                    {getStatusBadge(job.status)}
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{job.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {resolvePositionDisplayLabel(positionOptions, job.position_key, job.position)}
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {(job.department_key || job.department) && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>
                        {job.department_key
                          ? resolveDepartmentLabel(departmentOptions, job.department_key)
                          : job.department}
                      </span>
                    </div>
                  )}
                  {job.work_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{job.work_location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{t('recruitment.jt.needPeople', { count: job.headcount })}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary p-0 h-auto"
                      onClick={(e) => { e.stopPropagation(); handleOpenCandidates(job); }}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      {t('recruitment.jt.candidateCount', { count: (job as any).candidate_count || 0 })}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="text-sm">
                    {job.salary_min || job.salary_max ? (
                      <span className="text-primary font-medium">
                        {formatCurrency(job.salary_min || 0)} - {formatCurrency(job.salary_max || 0)} d
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{t('recruitment.jt.negotiable')}</span>
                    )}
                  </div>
                  {job.deadline && (
                    <div className="text-xs text-muted-foreground">
                      {t('recruitment.jt.deadline', { date: format(new Date(job.deadline), 'dd/MM/yyyy') })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('recruitment.jt.showing', { from: (currentPage - 1) * itemsPerPage + 1, to: Math.min(currentPage * itemsPerPage, filteredList.length), total: filteredList.length })}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
              {t('recruitment.jt.prev')}
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, currentPage - 3),
              Math.min(totalPages, currentPage + 2)
            ).map((page) => (
              <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)}>
                {page}
              </Button>
            ))}
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
              {t('recruitment.jt.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Form Dialog — REC-JOBPOST-DIALOG-FIX-FE-01: 3-tab, no overflow, JD picker */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent
          className="sm:max-w-[960px]"
          data-testid="rec-job-create-edit-dialog-precision"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 shrink-0 text-primary" />
              {editingJob ? t('recruitment.jt.editPostTitle') : t('recruitment.jt.createPostTitle')}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Title field — full-width above tabs (PO-HRM-UI-P0-LOGO-FONT-TITLE-01) */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recruitment.jt.titleLabel')} <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        className="xevn-field-line"
                        placeholder={t('recruitment.jt.titlePlaceholder')}
                        data-testid="rec-job-form-title"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="info" data-testid="rec-job-tab-info">Thông tin</TabsTrigger>
                  <TabsTrigger value="jd" data-testid="rec-job-tab-jd">JD &amp; Yêu cầu</TabsTrigger>
                  <TabsTrigger value="benefit" data-testid="rec-job-tab-benefit">Đãi ngộ</TabsTrigger>
                </TabsList>

                {/* Tab 1 — Basic info */}
                <TabsContent value="info" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="workflow_id"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Quy trình tuyển dụng</FormLabel>
                          <FormControl>
                            <CatalogSearchPicker
                              options={workflowOptions}
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                                // Clear dependent fields
                                form.setValue('position_key', '', { shouldValidate: true });
                                form.setValue('department_key', '', { shouldValidate: true });
                                form.setValue('headcount', '1', { shouldValidate: true });
                                form.setValue('employment_type', 'full-time', { shouldValidate: true });
                                form.setValue('deadline', undefined, { shouldValidate: true });
                                form.setValue('jd_template_id', '', { shouldValidate: true });
                                form.setValue('salary_min', '', { shouldValidate: true });
                                form.setValue('salary_max', '', { shouldValidate: true });
                                setSelectedJdRef(null);
                                setSelectedJdFullRow(null);

                                // Auto-select position if the workflow has exactly 1 position
                                const workflow = workflows.find((w: any) => w.id === val);
                                if (workflow && workflow.positions?.length === 1) {
                                  const autoPos = workflow.positions[0].positionName;
                                  setTimeout(() => {
                                    form.setValue('position_key', autoPos, { shouldValidate: true });
                                    autoFillPositionData(workflow, autoPos);
                                  }, 0);
                                }
                              }}
                              placeholder="Chọn quy trình để tự động điền thông tin..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="position_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('recruitment.jt.positionLabel')} <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <CatalogSearchPicker
                              options={filteredPositionOptions}
                              value={field.value}
                              onValueChange={(val) => {
                                field.onChange(val);
                                // Auto-fill logic from Workflow configurations
                                if (selectedWorkflowId) {
                                  const workflow = workflows.find((w: any) => w.id === selectedWorkflowId);
                                  if (workflow) {
                                    autoFillPositionData(workflow, val);
                                  }
                                }
                              }}
                              placeholder={t('recruitment.jt.positionPlaceholder')}
                              loading={catalogsLoading}
                              errorText={catalogsError ? t('settings.catalogs.loadError') : undefined}
                              emptyHint={
                                <a href="/settings" className="text-primary underline text-xs font-medium">
                                  Mở Cài đặt → Danh mục nghiệp vụ
                                </a>
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('recruitment.jt.departmentLabel')}</FormLabel>
                          <FormControl>
                            <CatalogSearchPicker
                              options={departmentOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder={t('recruitment.jt.departmentPlaceholder')}
                              loading={catalogsLoading}
                              errorText={catalogsError ? t('settings.catalogs.loadError') : undefined}
                              emptyHint={
                                <a href="/settings" className="text-primary underline text-xs font-medium">
                                  Mở Cài đặt → Danh mục nghiệp vụ
                                </a>
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="employment_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('recruitment.jt.typeLabel')} <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="xevn-field-select-md">
                                <SelectValue placeholder={t('recruitment.jt.selectType')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employmentTypes.map((et) => (
                                <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="work_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('recruitment.jt.locationLabel')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-xevn-textMuted" />
                              <Input placeholder={t('recruitment.jt.locationPlaceholder')} className="xevn-field-line pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="headcount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('recruitment.jt.headcountLabel')} <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input type="number" min="1" className="xevn-field-num" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{t('recruitment.jt.deadlineLabel')}</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "xevn-field-date pl-3 text-left font-normal",
                                    !field.value && "text-xevn-textMuted"
                                  )}
                                >
                                  {field.value ? format(field.value, "dd/MM/yyyy") : t('recruitment.jt.selectDate')}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('recruitment.jt.priorityLabel')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="xevn-field-select-sm">
                                <SelectValue placeholder={t('recruitment.jt.selectPriority')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {priorityOptions.map((p) => (
                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('recruitment.jt.statusLabel')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="xevn-field-select-sm">
                                <SelectValue placeholder={t('recruitment.jt.selectStatus')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">{t('recruitment.jt.statuses.draft')}</SelectItem>
                              <SelectItem value="active">{t('recruitment.jt.statuses.active')}</SelectItem>
                              <SelectItem value="paused">{t('recruitment.jt.statuses.paused')}</SelectItem>
                              <SelectItem value="closed">{t('recruitment.jt.statuses.closed')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Tab 2 — JD & Requirements (REC-JP-JD-LINK-FE-01: JD = SoT, no textarea) */}
                <TabsContent value="jd" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mẫu JD tham chiếu</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Popover open={isJdPickerOpen} onOpenChange={setIsJdPickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            data-testid="rec-job-jd-picker-btn"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            {selectedJdRef ? 'Đổi JD' : 'Chọn từ thư viện JD'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-2" align="start">
                          <Input
                            placeholder="Tìm kiếm JD..."
                            value={jdSearch}
                            onChange={(e) => setJdSearch(e.target.value)}
                            className="mb-2"
                            data-testid="rec-job-jd-search-input"
                          />
                          <ScrollArea className="h-48">
                            {jdTemplates.length === 0 ? (
                              <p className="text-sm text-muted-foreground p-2">Không có JD template nào</p>
                            ) : (
                              <div data-testid="rec-job-jd-template-list">
                                {jdTemplates.map((tpl) => (
                                  <button
                                    key={tpl.id}
                                    type="button"
                                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted cursor-pointer block"
                                    data-testid={`rec-job-jd-item-${tpl.id}`}
                                    onClick={() => handleSelectJdTemplate(tpl)}
                                  >
                                    <span className="font-medium">{tpl.code}</span> — {tpl.title}
                                  </button>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                      {selectedJdRef && (
                        <div
                          className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs"
                          data-testid="rec-job-jd-ref-chip"
                        >
                          <span>{selectedJdRef.code} — {selectedJdRef.title}</span>
                          <button
                            type="button"
                            className="ml-1 rounded-full hover:bg-muted p-0.5"
                            data-testid="rec-job-jd-ref-clear"
                            onClick={handleClearJd}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* JdTemplateViewPanel inline khi đã chọn */}
                    {selectedJdRef && selectedJdFullRow && (
                      <div className="mt-3 rounded-lg border border-border/50 overflow-hidden">
                        <div className="bg-muted/40 px-3 py-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                          Nội dung JD tham chiếu (chỉ đọc)
                        </div>
                        <div className="max-h-[300px] overflow-y-auto p-1">
                          <JdTemplateViewPanel row={selectedJdFullRow} />
                        </div>
                      </div>
                    )}

                    {/* Empty state khi chưa chọn JD */}
                    {!selectedJdRef && (
                      <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                        Chọn mẫu JD để hiển thị yêu cầu công việc
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab 3 — Dai ngo */}
                <TabsContent value="benefit" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="salary_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('recruitment.jt.salaryMin')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                              <ViMoneyInput
                                placeholder="VD: 15.000.000"
                                className="pl-10"
                                value={amountStringToNumber(field.value)}
                                onValueChange={(n) => field.onChange(numberToAmountString(n))}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salary_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('recruitment.jt.salaryMax')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                              <ViMoneyInput
                                placeholder="VD: 25.000.000"
                                className="pl-10"
                                value={amountStringToNumber(field.value)}
                                onValueChange={(n) => field.onChange(numberToAmountString(n))}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="is_salary_visible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Hiển thị mức lương</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                </TabsContent>
              </Tabs>

              <div className="xevn-dialog-footer-sticky flex justify-end gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={handleCloseForm} data-testid="rec-job-cancel-btn">{t('recruitment.jt.cancelBtn')}</Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingJob ? t('recruitment.jt.updateBtn') : t('recruitment.jt.createBtn')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl">{selectedJob.title}</h2>
                    <p className="text-sm text-muted-foreground font-normal">
                      {resolvePositionDisplayLabel(positionOptions, selectedJob.position_key, selectedJob.position)}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  {getStatusBadge(selectedJob.status)}
                  {getPriorityBadge(selectedJob.priority)}
                  <Badge variant="outline">
                    {employmentTypes.find(et => et.value === selectedJob.employment_type)?.label
                      ?? resolveEmploymentTypeDisplay(selectedJob.employment_type)}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{selectedJob.headcount}</p>
                    <p className="text-xs text-muted-foreground">{t('recruitment.jt.headcountStat')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedJob.applied_count || 0}</p>
                    <p className="text-xs text-muted-foreground">{t('recruitment.jt.candidatesStat')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {selectedJob.salary_min || selectedJob.salary_max ? (
                        <span className="text-lg">{formatCurrency(selectedJob.salary_min || 0)}</span>
                      ) : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('recruitment.jt.minSalary')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {selectedJob.deadline ? (
                        Math.max(0, Math.ceil((new Date(selectedJob.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                      ) : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('recruitment.jt.daysLeft')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('recruitment.jt.departmentInfo')}</span>
                    <span>
                      {selectedJob.department_key
                        ? resolveDepartmentLabel(departmentOptions, selectedJob.department_key)
                        : selectedJob.department || '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('recruitment.jt.locationInfo')}</span>
                    <span>{selectedJob.work_location || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('recruitment.jt.deadlineInfo')}</span>
                    <span>{selectedJob.deadline ? format(new Date(selectedJob.deadline), 'dd/MM/yyyy') : '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('recruitment.jt.salaryInfo')}</span>
                    <span>
                      {selectedJob.salary_min || selectedJob.salary_max ? (
                        `${formatCurrency(selectedJob.salary_min || 0)} - ${formatCurrency(selectedJob.salary_max || 0)} VND`
                      ) : t('recruitment.jt.negotiable')}
                    </span>
                  </div>
                </div>
                {selectedJob.jd_template_id && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Mô tả công việc (JD)</h3>
                    {selectedJob.jd_content ? (
                      <JdTemplateViewPanel
                        row={{
                          id: selectedJob.jd_template_id,
                          code: selectedJob.jd_code ?? '',
                          title: selectedJob.jd_title ?? selectedJob.title,
                          values_json: selectedJob.jd_content,
                        } as HrmJobDescriptionTemplate}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        JD: {selectedJob.jd_code} — {selectedJob.jd_title}
                      </p>
                    )}
                  </div>
                )}
                {!selectedJob.jd_template_id && selectedJob.description && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('recruitment.jt.descriptionTitle')}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob.description}</p>
                  </div>
                )}
                {!selectedJob.jd_template_id && selectedJob.requirements && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('recruitment.jt.requirementsTitle')}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob.requirements}</p>
                  </div>
                )}
                {!selectedJob.jd_template_id && selectedJob.benefits && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('recruitment.jt.benefitsTitle')}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob.benefits}</p>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsViewOpen(false)}>{t('recruitment.jt.closeBtn')}</Button>
                  <Button onClick={() => { setIsViewOpen(false); handleOpenEdit(selectedJob); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t('recruitment.jt.editBtn')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recruitment.jt.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('recruitment.jt.confirmDeleteMsg', { title: selectedJob?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('recruitment.jt.cancelBtn')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => selectedJob && deleteMutation.mutate(selectedJob.id)}
            >
              {t('recruitment.it.deleteBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recruitment.jt.confirmBulkDelete', { count: selectedItems.length })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('recruitment.jt.confirmBulkDeleteMsg', { count: selectedItems.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('recruitment.jt.cancelBtn')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => bulkDeleteMutation.mutate(selectedItems)}
            >
              {t('recruitment.jt.deleteAll')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Candidates Dialog */}
      {selectedJob && (
        <JobCandidatesDialog
          open={isCandidatesOpen}
          onOpenChange={setIsCandidatesOpen}
          requisitionId={selectedJob.id}
          jobTitle={selectedJob.title}
        />
      )}
    </div>
  );
}
