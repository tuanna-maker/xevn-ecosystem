/**
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-01-CLUSTER-FE-01
 * change_mode: ADD
 * What: PayrollPeriodTimesheetBindPanel on batch detail — G-PAY-01-BIND-FE
 * Why: AC-PAY-01-BIND-* · J-HRM-PAY-01-02/03 · U65 bind POST + F5
 * must_keep: payroll_e2e_ready=false · ATT11/12 seals · enroll eligibility unchanged
 */
/**
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SUMMARY-CARDS-01
 * change_mode: FIX
 * What: Header Gross/Net cards bind process payslip_summary or payslip line aggregate (display-ready)
 * Why: R-PAY-W3-FE-SUMMARY-ZERO — cards 0 ₫ while line 12.345.000 ₫ after process/F5
 * must_keep: no FE formula invent · payroll_e2e_ready=false · process-post GWC · TDZ · SRC-02 · period bind
 */
/**
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SHOWADD-TDZ-01
 * change_mode: FIX
 * What: Declare showAddDialog useState before usePaySheetTemplates({ enabled: showAddDialog })
 * Why: R-PAY-BATCHES-SHOWADD-TDZ — ReferenceError TDZ crash on mount blocks J-HRM-07
 * must_keep: pay-batches-precision · pay-batch-add-emp-btn · payroll_e2e_ready=false · U65 no seed
 */
/**
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-FE-01
 * change_mode: ADD
 * What: Tạo kỳ SELECT active pay-sheet-templates · POST paySheetTemplateId · hiển thị tên mẫu trên row
 * Why: AC-PAY-TPL-03 · cấm nhầm salary_templates enroll pack làm mẫu kỳ
 * must_keep: U65 no seed · payroll_e2e_ready=false · enroll tab pack≠mẫu unchanged
 */
/**
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-UI-BRAND-W4-PAY-A
 * change_mode: UPGRADE
 * What: Precision Motion P10 KPI cards + dialog titles ≥20 — kill purple/emerald AI →
 *       border-xevn + primary icon; locked badge → primary DNA; vi-VN money kept
 * Why: ADR §16 · FE-PAY P0 spine · B4 cấm purple AI palette
 * must_keep: create/update/delete batch API; formatCurrency vi-VN; no formula invent
 */
/**
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-02
 * change_mode: FIX
 * What: pay-batch-period-filter + pay-batch-row-{id} testids; URL deep-link pay_period_* / pay_batch_id;
 *       iframe portalScope on month filter; auto-open detail from URL; VN month filter sync
 * Why: R-PAY-PERIOD-ROW-NAV — default Tháng 8/2026 hid Jan draft; combobox click timeout in embed
 * must_keep: FE-02/03/04/05 eligibility fail-closed · enroll whitelist · BE-03 scope · U65 no seed
 */
/**
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-E2E-LINK-PAY-HIRE-FE-05
 * change_mode: FIX
 * What: Fail-closed eligibility checkbox — disable when not in BE items[] or eligible!==true
 * Why: R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH — 8 NV enabled while eligible_count=0
 * must_keep: FE-02/03/04 · enroll whitelist · batches surface · BE-03 scope
 */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDepartments } from '@/hooks/useDepartments';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Users,
  DollarSign,
  CheckCircle2,
  Lock,
  Eye,
  ArrowLeft,
  Download,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  usePayrollBatches,
  PayrollBatch,
  PayrollRecord,
  usePayrollPeriodEligibility,
  mapPayrollPeriodToBatch,
  resolvePayrollHeaderTotals,
} from '@/hooks/usePayrollBatches';
import {
  formatPayrollEligibilityReason,
  isPayrollEmployeeEligibleForEnroll,
  mapEligibilityByEmployeeId,
  resolvePayrollEligibilityDisplay,
} from '@/components/payroll/payrollDomainUi';
import { useEmployees } from '@/hooks/useEmployees';
import { usePaySheetTemplates } from '@/hooks/usePaySheetTemplates';
import { parsePayrollPeriodForm } from '@/components/payroll/payrollPeriodFormSchema';
import {
  PAY_SHEET_TPL_PERIOD_NONE_SENTINEL,
  formatPaySheetTemplatePickerLabel,
  paySheetTemplateApiValue,
  paySheetTemplateFormValue,
} from '@/components/payroll/payrollPaySheetTemplateSelect';
import { PAY_SHEET_TPL_PACK_ALIAS_NOTE } from '@/lib/paySheetTemplateCatalog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PayrollPeriodTimesheetBindPanel } from '@/components/payroll/PayrollPeriodTimesheetBindPanel';
import { PayrollPeriodGroupScopePanel } from '@/components/payroll/PayrollPeriodGroupScopePanel';
import { usePayrollGroups } from '@/hooks/usePayrollGroups';
import { useAuth } from '@/contexts/AuthContext';

/**
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E2-01
 * change_mode: ADD
 * What: Zod parsePayrollPeriodForm trước createBatch (name + month/year)
 * Why: AC-E2-ZOD-01 · VAL-E2-03 — FE chặn trước Network
 * must_keep: createPayrollPeriod API path; U65 no seed
 */

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const PAY_PERIOD_MONTH_PARAM = 'pay_period_month';
const PAY_PERIOD_YEAR_PARAM = 'pay_period_year';
const PAY_BATCH_ID_PARAM = 'pay_batch_id';

function parsePayrollListUrlState(search: string) {
  const params = new URLSearchParams(search);
  const monthRaw = Number.parseInt(params.get(PAY_PERIOD_MONTH_PARAM) ?? '', 10);
  const yearRaw = Number.parseInt(params.get(PAY_PERIOD_YEAR_PARAM) ?? '', 10);
  const batchId = params.get(PAY_BATCH_ID_PARAM)?.trim() || null;
  return {
    periodMonth: monthRaw >= 1 && monthRaw <= 12 ? monthRaw : currentMonth,
    periodYear: yearRaw >= 2000 && yearRaw <= 2100 ? yearRaw : currentYear,
    batchId,
  };
}

function buildPayrollListSearch(
  baseSearch: string,
  periodMonth: number,
  periodYear: number,
  batchId: string | null,
) {
  const params = new URLSearchParams(baseSearch);
  params.set(PAY_PERIOD_MONTH_PARAM, String(periodMonth));
  params.set(PAY_PERIOD_YEAR_PARAM, String(periodYear));
  if (batchId) {
    params.set(PAY_BATCH_ID_PARAM, batchId);
  } else {
    params.delete(PAY_BATCH_ID_PARAM);
  }
  return params.toString();
}

export function PayrollBatchesTab() {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initialUrlState = useMemo(() => parsePayrollListUrlState(location.search), []);
  const deepLinkBatchIdRef = useRef(initialUrlState.batchId);
  const { departments } = useDepartments();
  const [periodMonth, setPeriodMonth] = useState(initialUrlState.periodMonth);
  const [periodYear, setPeriodYear] = useState(initialUrlState.periodYear);

  const {
    batches,
    isLoading,
    refetch,
    fetchBatchRecords,
    createBatch,
    updateBatch,
    deleteBatch,
    lockBatch,
    addRecord,
    updateRecord,
    deleteRecord,
    isCreating,
  } = usePayrollBatches({ periodMonth, periodYear });

  const { employees } = useEmployees();

  // Dialog states — showAddDialog MUST precede usePaySheetTemplates(enabled) (TDZ)
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data: paySheetTemplates = [], isLoading: paySheetTemplatesLoading } = usePaySheetTemplates({
    activeOnly: true,
    enabled: showAddDialog,
  });
  const { groups: activePayrollGroups, isLoading: payrollGroupsLoading } = usePayrollGroups({
    status: 'active',
    enabled: showAddDialog,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<PayrollBatch | null>(null);
  const [batchRecords, setBatchRecords] = useState<PayrollRecord[]>([]);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<PayrollBatch | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    salary_period: `Tháng ${currentMonth}/${currentYear}`,
    period_month: currentMonth,
    period_year: currentYear,
    department: '',
    position: '',
    pay_sheet_template_id: PAY_SHEET_TPL_PERIOD_NONE_SENTINEL,
    payroll_group_id: '' as string,
  });

  // Add employee state
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedEmployeesToAdd, setSelectedEmployeesToAdd] = useState<string[]>([]);

  const {
    data: eligibilityData,
    isLoading: eligibilityLoading,
    isError: eligibilityError,
  } = usePayrollPeriodEligibility(selectedBatch?.id ?? null, showAddEmployeeDialog);

  const eligibilityByEmployeeId = useMemo(
    () => mapEligibilityByEmployeeId(eligibilityData?.items ?? []),
    [eligibilityData?.items],
  );

  const eligibilityReady = Boolean(
    showAddEmployeeDialog && !eligibilityLoading && !eligibilityError && eligibilityData,
  );

  const syncPayrollListUrl = useCallback(
    (next: { periodMonth: number; periodYear: number; batchId: string | null }) => {
      const search = buildPayrollListSearch(location.search, next.periodMonth, next.periodYear, next.batchId);
      if (search !== location.search.replace(/^\?/, '')) {
        navigate({ pathname: location.pathname, search }, { replace: true });
      }
    },
    [location.pathname, location.search, navigate],
  );

  const openBatchDetail = useCallback(
    (batch: PayrollBatch) => {
      setSelectedBatch(batch);
      setPeriodMonth(batch.period_month);
      setPeriodYear(batch.period_year);
      deepLinkBatchIdRef.current = batch.id;
      syncPayrollListUrl({
        periodMonth: batch.period_month,
        periodYear: batch.period_year,
        batchId: batch.id,
      });
    },
    [syncPayrollListUrl],
  );

  const closeBatchDetail = useCallback(() => {
    setSelectedBatch(null);
    deepLinkBatchIdRef.current = null;
    syncPayrollListUrl({ periodMonth, periodYear, batchId: null });
  }, [periodMonth, periodYear, syncPayrollListUrl]);

  useEffect(() => {
    syncPayrollListUrl({
      periodMonth,
      periodYear,
      batchId: selectedBatch?.id ?? deepLinkBatchIdRef.current,
    });
  }, [periodMonth, periodYear, selectedBatch?.id, syncPayrollListUrl]);

  useEffect(() => {
    const batchId = deepLinkBatchIdRef.current;
    if (!batchId || selectedBatch || isLoading) return;
    const match = batches.find((b) => b.id === batchId);
    if (match) {
      setSelectedBatch(match);
    }
  }, [batches, isLoading, selectedBatch]);

  useEffect(() => {
    if (!selectedBatch) return;
    const fresh = batches.find((b) => b.id === selectedBatch.id);
    if (fresh && fresh.updated_at !== selectedBatch.updated_at) {
      setSelectedBatch(fresh);
    }
  }, [batches, selectedBatch]);

  useEffect(() => {
    if (!eligibilityReady) return;
    setSelectedEmployeesToAdd((prev) =>
      prev.filter((id) => isPayrollEmployeeEligibleForEnroll(eligibilityByEmployeeId, id, { eligibilityReady: true })),
    );
  }, [eligibilityReady, eligibilityByEmployeeId]);

  // Load records when viewing batch detail
  useEffect(() => {
    if (selectedBatch) {
      fetchBatchRecords(selectedBatch.id).then(setBatchRecords);
    }
  }, [selectedBatch, fetchBatchRecords]);

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEmployeesToAdd = employees.filter(emp => {
    const matchesSearch = emp.full_name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(employeeSearchTerm.toLowerCase());
    const alreadyAdded = batchRecords.some(r => r.employee_id === emp.id);
    return matchesSearch && !alreadyAdded && emp.status === 'active';
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Đã thanh toán</Badge>;
      case 'locked':
        return <Badge className="bg-xevn-primary/10 text-xevn-primary hover:bg-xevn-primary/20">Đã khóa</Badge>;
      case 'approved':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Đã duyệt</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">{t('common.status.pending')}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{t('bonus.draft')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCreateBatch = async () => {
    const parsed = parsePayrollPeriodForm(
      {
        name: formData.name,
        period_month: formData.period_month,
        period_year: formData.period_year,
        pay_sheet_template_id: formData.pay_sheet_template_id,
      },
      {
        nameRequired: t('common.fillAllFields'),
        monthInvalid: t('common.fillAllFields'),
        yearInvalid: t('common.fillAllFields'),
        paySheetTemplateRequired: 'Vui lòng chọn mẫu bảng lương đang hiệu lực (Cài đặt → Mẫu bảng lương).',
      },
    );
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const first =
        flat.name?.[0] ||
        flat.period_month?.[0] ||
        flat.period_year?.[0] ||
        flat.pay_sheet_template_id?.[0] ||
        t('common.fillAllFields');
      toast.error(first);
      return;
    }

    const paySheetTemplateId = paySheetTemplateApiValue(formData.pay_sheet_template_id);
    if (!paySheetTemplateId) {
      toast.error('Vui lòng chọn mẫu bảng lương đang hiệu lực (Cài đặt → Mẫu bảng lương).');
      return;
    }

    try {
      const createdPeriod = await createBatch({
        name: parsed.data.name,
        salary_period: formData.salary_period || `Tháng ${parsed.data.period_month}/${parsed.data.period_year}`,
        period_month: parsed.data.period_month,
        period_year: parsed.data.period_year,
        department: formData.department || undefined,
        position: formData.position || undefined,
        pay_sheet_template_id: paySheetTemplateId,
        payroll_group_id: formData.payroll_group_id?.trim() || null,
      });
      setShowAddDialog(false);
      setPeriodMonth(parsed.data.period_month);
      setPeriodYear(parsed.data.period_year);
      openBatchDetail(mapPayrollPeriodToBatch(createdPeriod));
      setFormData({
        name: '',
        salary_period: `Tháng ${currentMonth}/${currentYear}`,
        period_month: currentMonth,
        period_year: currentYear,
        department: '',
        position: '',
        pay_sheet_template_id: PAY_SHEET_TPL_PERIOD_NONE_SENTINEL,
        payroll_group_id: '',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBatch = async () => {
    if (!batchToDelete) return;
    try {
      await deleteBatch(batchToDelete.id);
      setShowDeleteDialog(false);
      setBatchToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLockBatch = async () => {
    if (!selectedBatch) return;
    try {
      const batchId = selectedBatch.id;
      const processed = await lockBatch(batchId);
      const refreshed = await refetch();
      setShowLockDialog(false);
      const updatedRecords = await fetchBatchRecords(batchId);
      setBatchRecords(updatedRecords);
      const fromList = (refreshed.data ?? []).find((b) => b.id === batchId);
      const fromProcess = processed ? mapPayrollPeriodToBatch(processed) : null;
      if (fromList || fromProcess) {
        const merged: PayrollBatch = {
          ...(fromList ?? fromProcess!),
          total_gross: (fromList?.total_gross || 0) > 0 ? fromList!.total_gross : (fromProcess?.total_gross ?? 0),
          total_deduction:
            (fromList?.total_deduction || 0) > 0
              ? fromList!.total_deduction
              : (fromProcess?.total_deduction ?? 0),
          total_net: (fromList?.total_net || 0) > 0 ? fromList!.total_net : (fromProcess?.total_net ?? 0),
          employee_count: Math.max(
            fromList?.employee_count ?? 0,
            fromProcess?.employee_count ?? 0,
            updatedRecords.length,
          ),
          status: fromList?.status === 'locked' ? 'locked' : fromProcess?.status ?? fromList?.status ?? 'approved',
        };
        setSelectedBatch(merged);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddEmployees = async () => {
    if (!selectedBatch || selectedEmployeesToAdd.length === 0) return;

    try {
      await addRecord({
        batchId: selectedBatch.id,
        employeeIds: selectedEmployeesToAdd,
      });

      const updatedRecords = await fetchBatchRecords(selectedBatch.id);
      setBatchRecords(updatedRecords);
      const refreshed = await refetch();
      const updated = (refreshed.data ?? []).find((b) => b.id === selectedBatch.id);
      if (updated) setSelectedBatch(updated);

      setShowAddEmployeeDialog(false);
      setSelectedEmployeesToAdd([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveRecord = async (recordId: string) => {
    if (!selectedBatch) return;
    try {
      await deleteRecord({ id: recordId, batchId: selectedBatch.id });
      setBatchRecords(prev => prev.filter(r => r.id !== recordId));
    } catch (error) {
      console.error(error);
    }
  };

  const stats = {
    total: batches.length,
    draft: batches.filter(b => b.status === 'draft').length,
    locked: batches.filter(b => b.status === 'locked').length,
    totalNet: batches.reduce((sum, b) => sum + (b.total_net || 0), 0),
  };

  // Detail view
  if (selectedBatch) {
    const isEditable = selectedBatch.status === 'draft' || selectedBatch.status === 'pending';
    const headerTotals = resolvePayrollHeaderTotals(selectedBatch, batchRecords);

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={closeBatchDetail} data-testid="pay-batch-detail-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{selectedBatch.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedBatch.salary_period} • {selectedBatch.employee_count || 0} nhân viên
                {selectedBatch.pay_sheet_template_name && selectedBatch.pay_sheet_template_name !== '—' ? (
                  <> • Mẫu: {selectedBatch.pay_sheet_template_name}</>
                ) : null}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(selectedBatch.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Xuất
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Xuất Excel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="w-4 h-4 mr-2" />
                  In bảng lương
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isEditable && (
              <Button variant="destructive" onClick={() => setShowLockDialog(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Khóa bảng lương
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards — display-ready period/process totals or payslip line aggregate */}
        <div className="grid grid-cols-4 gap-4" data-testid="pay-batch-summary-cards" data-totals-source={headerTotals.source}>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Tổng lương Gross</p>
              <p className="text-xl font-bold text-blue-600" data-testid="pay-batch-summary-gross">
                {formatCurrency(headerTotals.total_gross)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Tổng khấu trừ</p>
              <p className="text-xl font-bold text-destructive" data-testid="pay-batch-summary-deduction">
                {formatCurrency(headerTotals.total_deduction)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Tổng lương Net</p>
              <p className="text-xl font-bold text-success" data-testid="pay-batch-summary-net">
                {formatCurrency(headerTotals.total_net)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Số nhân viên</p>
              <p className="text-xl font-bold" data-testid="pay-batch-summary-emp-count">
                {selectedBatch.employee_count || batchRecords.length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <PayrollPeriodTimesheetBindPanel periodId={selectedBatch.id} editable={isEditable} />

        {currentCompanyId ? (
          <PayrollPeriodGroupScopePanel
            periodId={selectedBatch.id}
            editable={isEditable}
            companyId={currentCompanyId}
            payrollGroupId={selectedBatch.payroll_group_id}
            payrollGroupCode={selectedBatch.payroll_group_code}
            payrollGroupNameVi={selectedBatch.payroll_group_name_vi}
          />
        ) : null}

        {/* Records Table */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Chi tiết lương nhân viên</h3>
              {isEditable && (
                <Button
                  size="sm"
                  data-testid="pay-batch-add-emp-btn"
                  onClick={() => setShowAddEmployeeDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm nhân viên
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã NV</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Phòng ban</TableHead>
                    <TableHead className="text-right">Lương cơ bản</TableHead>
                    <TableHead className="text-right">Phụ cấp</TableHead>
                    <TableHead className="text-right">Thưởng</TableHead>
                    <TableHead className="text-right">Khấu trừ</TableHead>
                    <TableHead className="text-right">Lương Net</TableHead>
                    {isEditable && <TableHead className="w-10"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Chưa có nhân viên nào trong bảng lương
                      </TableCell>
                    </TableRow>
                  ) : (
                    batchRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employee_code}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {record.employee_name.split(' ').pop()?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {record.employee_name}
                          </div>
                        </TableCell>
                        <TableCell>{record.department || '-'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.base_salary)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.allowances)}</TableCell>
                        <TableCell className="text-right text-success">{formatCurrency(record.bonus)}</TableCell>
                        <TableCell className="text-right text-destructive">
                          {formatCurrency(record.insurance_deduction + record.tax_deduction + record.other_deduction)}
                        </TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(record.net_salary)}</TableCell>
                        {isEditable && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveRecord(record.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add Employee Dialog */}
        <Dialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog}>
          <DialogContent className="sm:max-w-[920px]" data-testid="pay-batch-add-emp-dialog-precision">
            <DialogHeader>
              <DialogTitle className="text-[20px] font-bold font-display">Thêm nhân viên vào bảng lương</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm nhân viên..."
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-64 overflow-y-auto border rounded-lg">
                {eligibilityLoading && (
                  <div className="p-4 text-sm text-muted-foreground">Đang tải điều kiện đủ điều kiện…</div>
                )}
                {eligibilityError && (
                  <div className="p-4 text-sm text-destructive">
                    Không tải được điều kiện tính lương — thử lại sau khi API sẵn sàng.
                  </div>
                )}
                {filteredEmployeesToAdd.map(emp => {
                  const { isEligible, reasonCodes } = resolvePayrollEligibilityDisplay(
                    eligibilityByEmployeeId,
                    emp.id,
                    { eligibilityReady },
                  );
                  return (
                  <div
                    key={emp.id}
                    className={cn(
                      'flex items-center gap-3 p-3 border-b last:border-0',
                      isEligible ? 'hover:bg-muted/50' : 'bg-muted/30 opacity-80',
                    )}
                  >
                    <Checkbox
                      checked={selectedEmployeesToAdd.includes(emp.id)}
                      disabled={!isEligible}
                      onCheckedChange={(checked) => {
                        if (!isEligible) return;
                        if (checked) {
                          setSelectedEmployeesToAdd(prev => [...prev, emp.id]);
                        } else {
                          setSelectedEmployeesToAdd(prev => prev.filter(id => id !== emp.id));
                        }
                      }}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {emp.full_name.split(' ').pop()?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{emp.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {emp.employee_code} • {emp.department}
                      </p>
                      {reasonCodes.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {reasonCodes.map((code) => (
                            <Badge
                              key={`${emp.id}-${code}`}
                              variant={isEligible ? 'secondary' : 'destructive'}
                              className="text-xs font-normal"
                            >
                              {formatPayrollEligibilityReason(code)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium">{formatCurrency(emp.salary || 0)}</p>
                      <p className="text-xs text-muted-foreground">Lương cơ bản</p>
                    </div>
                  </div>
                );
                })}
                {filteredEmployeesToAdd.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    Không tìm thấy nhân viên phù hợp
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddEmployeeDialog(false)}>
                Hủy
              </Button>
              <Button 
                onClick={handleAddEmployees}
                disabled={selectedEmployeesToAdd.length === 0}
              >
                Thêm {selectedEmployeesToAdd.length} nhân viên
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lock Confirmation Dialog */}
        <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Khóa bảng lương
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Sau khi khóa, bảng lương sẽ không thể chỉnh sửa. Bạn có chắc chắn muốn khóa?
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLockDialog(false)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleLockBatch}>
                Khóa bảng lương
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // List view
  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards — Precision Motion brand chrome */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="pay-batches-precision">
        <Card className="rounded-card border border-xevn-border bg-xevn-surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-xevn-primary/10 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-xevn-primary" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">Tổng bảng lương</p>
                <p className="text-2xl font-bold text-xevn-text">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-card border border-xevn-border bg-xevn-surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Pencil className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">Đang soạn</p>
                <p className="text-2xl font-bold text-warning">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-card border border-xevn-border bg-xevn-surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-xevn-primary/10 rounded-lg">
                <Lock className="w-5 h-5 text-xevn-primary" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">Đã khóa</p>
                <p className="text-2xl font-bold text-xevn-primary">{stats.locked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-card border border-xevn-border bg-xevn-surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">Tổng lương Net</p>
                <p className="text-lg font-bold text-xevn-text">{formatCurrency(stats.totalNet)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bảng lương..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="locked">Đã khóa</SelectItem>
              <SelectItem value="paid">Đã thanh toán</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={`${periodMonth}-${periodYear}`} 
            onValueChange={(val) => {
              const [m, y] = val.split('-');
              const nextMonth = parseInt(m, 10);
              const nextYear = parseInt(y, 10);
              setPeriodMonth(nextMonth);
              setPeriodYear(nextYear);
              setSelectedBatch(null);
              deepLinkBatchIdRef.current = null;
            }}
          >
            <SelectTrigger className="w-48" data-testid="pay-batch-period-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent portalScope="iframe">
              {[currentYear - 1, currentYear, currentYear + 1].flatMap((year) =>
                Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  return (
                    <SelectItem
                      key={`${month}-${year}`}
                      value={`${month}-${year}`}
                      data-testid={`pay-batch-period-option-${month}-${year}`}
                    >
                      Tháng {month}/{year}
                    </SelectItem>
                  );
                }),
              )}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Lập bảng lương
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table data-testid="pay-batch-list-table">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedBatches.length === filteredBatches.length && filteredBatches.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBatches(filteredBatches.map(b => b.id));
                      } else {
                        setSelectedBatches([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Tên bảng lương</TableHead>
                <TableHead>Kỳ lương</TableHead>
                <TableHead>Mẫu bảng lương</TableHead>
                <TableHead className="text-center">Số NV</TableHead>
                <TableHead className="text-right">Tổng Gross</TableHead>
                <TableHead className="text-right">Tổng Net</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Chưa có bảng lương nào cho kỳ này
                  </TableCell>
                </TableRow>
              ) : (
                filteredBatches.map(batch => (
                  <TableRow 
                    key={batch.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    data-testid={`pay-batch-row-${batch.id}`}
                    onClick={() => openBatchDetail(batch)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedBatches.includes(batch.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedBatches(prev => [...prev, batch.id]);
                          } else {
                            setSelectedBatches(prev => prev.filter(id => id !== batch.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(batch.created_at)}</TableCell>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell>{batch.salary_period}</TableCell>
                    <TableCell data-testid={`pay-batch-row-tpl-${batch.id}`}>
                      {batch.pay_sheet_template_name && batch.pay_sheet_template_name !== '—' ? (
                        <span title={batch.pay_sheet_template_code ?? undefined}>
                          {batch.pay_sheet_template_name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{batch.employee_count || 0}</TableCell>
                    <TableCell className="text-right">{formatCurrency(batch.total_gross || 0)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(batch.total_net || 0)}</TableCell>
                    <TableCell>{getStatusBadge(batch.status)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openBatchDetail(batch)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {batch.status === 'draft' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setBatchToDelete(batch);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[920px]" data-testid="pay-batch-create-dialog-precision">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold font-display">Lập bảng lương mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên bảng lương <span className="text-destructive">*</span></Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="VD: Bảng lương tháng 01/2025 - VP Hà Nội"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pay-batch-create-month">Tháng</Label>
                <Select 
                  value={formData.period_month.toString()} 
                  onValueChange={(val) => {
                    const month = parseInt(val);
                    setFormData(prev => ({ 
                      ...prev, 
                      period_month: month,
                      salary_period: `Tháng ${month}/${prev.period_year}`
                    }));
                  }}
                >
                  <SelectTrigger id="pay-batch-create-month" data-testid="pay-batch-create-month-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent portalScope="iframe">
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem
                        key={i + 1}
                        value={(i + 1).toString()}
                        data-testid={`pay-batch-create-month-option-${i + 1}`}
                      >
                        Tháng {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-batch-create-year">Năm</Label>
                <Select 
                  value={formData.period_year.toString()} 
                  onValueChange={(val) => {
                    const year = parseInt(val);
                    setFormData(prev => ({ 
                      ...prev, 
                      period_year: year,
                      salary_period: `Tháng ${prev.period_month}/${year}`
                    }));
                  }}
                >
                  <SelectTrigger id="pay-batch-create-year" data-testid="pay-batch-create-year-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent portalScope="iframe">
                    {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                      <SelectItem
                        key={year}
                        value={year.toString()}
                        data-testid={`pay-batch-create-year-option-${year}`}
                      >
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2" data-testid="pay-period-pay-sheet-tpl-field">
              <Label>
                Mẫu bảng lương <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground" data-testid="pay-period-pay-sheet-tpl-alias-note">
                {PAY_SHEET_TPL_PACK_ALIAS_NOTE} Chọn mẫu từ{' '}
                <span className="font-medium">Cài đặt → Mẫu bảng lương</span> (/pay-sheet-templates), không phải gói
                enroll Tính lương.
              </p>
              <Select
                value={paySheetTemplateFormValue(formData.pay_sheet_template_id)}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, pay_sheet_template_id: val }))}
              >
                <SelectTrigger data-testid="pay-period-pay-sheet-tpl-select">
                  <SelectValue
                    placeholder={
                      paySheetTemplatesLoading
                        ? 'Đang tải mẫu…'
                        : paySheetTemplates.length === 0
                          ? 'Chưa có mẫu active — tạo tại Cài đặt'
                          : 'Chọn mẫu bảng lương'
                    }
                  />
                </SelectTrigger>
                <SelectContent portalScope="iframe">
                  {paySheetTemplates.length === 0 ? (
                    <SelectItem value={PAY_SHEET_TPL_PERIOD_NONE_SENTINEL} disabled>
                      Chưa có mẫu active
                    </SelectItem>
                  ) : (
                    paySheetTemplates.map((tpl) => (
                      <SelectItem
                        key={tpl.id}
                        value={tpl.id}
                        data-testid={`pay-period-pay-sheet-tpl-option-${tpl.code}`}
                      >
                        {formatPaySheetTemplatePickerLabel({ code: tpl.code, name: tpl.name })}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2" data-testid="pay-period-payroll-group-field">
              <Label>Phạm vi nhóm bảng lương (tùy chọn)</Label>
              <Select
                value={formData.payroll_group_id || '__none__'}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    payroll_group_id: val === '__none__' ? '' : val,
                  }))
                }
              >
                <SelectTrigger data-testid="pay-period-create-group-select">
                  <SelectValue
                    placeholder={
                      payrollGroupsLoading ? 'Đang tải nhóm…' : 'Không giới hạn nhóm'
                    }
                  />
                </SelectTrigger>
                <SelectContent portalScope="iframe">
                  <SelectItem value="__none__">Không giới hạn nhóm</SelectItem>
                  {activePayrollGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.code} — {g.name_vi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Đơn vị</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Để trống nếu áp dụng tất cả" />
                </SelectTrigger>
                <SelectContent portalScope="iframe">
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateBatch} disabled={isCreating || paySheetTemplatesLoading} data-testid="hdsd-pay-period-create-submit">
              {isCreating ? 'Đang tạo...' : 'Lập bảng lương'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Xác nhận xóa
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa bảng lương <strong>{batchToDelete?.name}</strong>?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteBatch}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
