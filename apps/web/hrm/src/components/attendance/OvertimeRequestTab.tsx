/**
 * @CODE-MEMORY
 * Screen:     Attendance → Đơn từ → Tăng ca (S50–S51)
 * UC:         UC-HRM-ATT-OT
 * Purpose:    Overtime request list + add/detail/delete chrome
 * WorkItem:   PO-HRM-UI-BRAND-W3-ATT-D
 * Coded:      2026-08-05
 * must_keep:  create/approve/reject/delete wires; leave panel untouched; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-D
 * change_mode: UPGRADE
 * What: Remaster OT tab + modals → Precision Motion; ban orange/purple/blue chrome
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-D S50–S51
 * must_keep: mutate wires; Dialog title ≥20; no Nest/seed; no Attendance CLOSED; no LeaveTab fight
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-D (stall#2)
 * change_mode: FIX
 * What: Confirm remaster chrome + evidence/theme-contrast re-close after stall#2
 * Why: PM RE-DISPATCH evidence MISS — keep primary CTAs + DialogTitle ≥20; pending DNA amber only
 * must_keep: mutate wires; no Nest/seed; no Attendance CLOSED; no LeaveTab fight
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-FE-DIALOG-01
 * change_mode: ADD
 * What: Add OT dialog ~720 + compact date/time/select/reason (ui-neo dialog-ot)
 * Why: ADR §16 LOCKED Montserrat+Source Sans 3 · S3=A · §15.4 U3 field widths
 * must_keep: create/approve/reject/delete wires; Face HOLD; U65 no seed
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-fe-dialog-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT
 * change_mode: ADD
 * What: Detail + delete AlertDialog *dialog-precision testids (create already wired)
 * Why: ADR §16 LOCK · extend chrome honesty beyond Leave/OT create
 * must_keep: create/approve/reject/delete wires; Face HOLD; U65 no seed
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-FE-01
 * change_mode: ADD
 * What: Bind Select/filter/badge/hệ số loại tăng ca vào Nest GET ot-types/effective khi EFF>0;
 *       hardcode weekday|weekend|holiday + getCoefficient chỉ còn là bootstrap khi EFF=0.
 * Why: QC Condition R-PLT-ATT-OT-FE-01 · AC-PLT-ATT-OT-01 / 01c · VAL-ATT-OT-CNS-01 —
 *      consumer phải gửi Nest `code` (BE trả 400 HRM-ATT-OT-TYPE-KEY khi invent).
 * spec_ref: SRS/BA `…-OT-TYPE-CATALOG-BA-01.md` §3–§5 · SA Option B · QC `…-qc-01.md` Residual
 * must_keep: create/approve/reject/delete wires; defaultCoeff chỉ display-ready (KHÔNG formula LIVE);
 *            không invent panel admin FE (R-PLT-ATT-OT-FE-ADMIN NOTE/HOLD); U65 no seed;
 *            attendance_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-FE-01
 * change_mode: FIX
 * What: Bind Select hình thức bồi thường vào Nest GET ot-comp-types/effective khi EFF>0;
 *       hardcode salary|compensatory_leave chỉ còn bootstrap khi EFF=0; detail dùng nameVi
 *       (cấm binary invent salary?Salary:TimeOff).
 * Why: QC Condition R-PLT-ATT-OTC-03 · AC-PLT-ATT-COMP-01 / 01c · VAL-ATT-COMP-CNS-01 —
 *      consumer gửi Nest `code` (BE 400 HRM-ATT-OT-COMP-KEY khi invent).
 * spec_ref: BA/SA/DATA `…-ATT-COMP-TYPE-CATALOG-*-01.md` · QC `…-qc-01.md` OTC-03
 * must_keep: OT-TYPE FE bind RETAIN; create/approve/reject/delete; DENY invent FE-ADMIN;
 *            DENY fold vào att_ot_type picker; U65 no seed; attendance_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-01
 * change_mode: RETAIN cite
 * What: compensation_type EFF picker (R-ATT-06-OT-PICKER) — approve invalidate panel via useOvertimeRequests hook.
 * Why: J-HRM-ATT-06-02 · peer ATT-06 BE accrual on approve
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-02
 * change_mode: FIX
 * What: U65 ensure compensatory_leave EFF via Nest upsert on OT dialog open; prefer accrual-mappable picker;
 *       OU scope parity listCompanyId on effective hooks + create POST.
 * Why: QA D-ATT-06-QA-OT-POST · D-ATT-06-QA-CATALOG · J-HRM-ATT-06-02
 * must_keep: ATT05BQC1 · ATT09 · attLeave06Ring · ≠ FR-06 DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-03
 * change_mode: FIX
 * What: Default overtimeDate on OT dialog open; otAddSubmitReady gate (no catalogEnsuring block);
 *       data-att-ot-submit-ready + att-ot-date-trigger / att-ot-employee-select for U65 Playwright.
 * Why: QA D-ATT-06-QA-OT-POST — 0 POST when date unset / submit disabled during ensure
 * must_keep: FE-02 ensure · pickPreferredOtCompTypeCode · ≠ FR-06 DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-04
 * change_mode: FIX
 * What: att-ot-row-view + att-ot-approve-submit testids (checkbox≠first button); list stays mounted on refetch;
 *       refetch after create; detail dialog data-testid on approve.
 * Why: QA D-ATT-06-QA-APPROVE-CHAIN — Playwright clicked row checkbox instead of Eye → 0 approve POST
 * must_keep: create/approve wires · FE-03 submit gates · ≠ FR-06 DONE
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Eye,
  Check,
  X,
  Clock,
  CalendarIcon,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '@/hooks/useEmployees';
import { useOvertimeRequests, OvertimeRequest } from '@/hooks/useOvertimeRequests';
import {
  ATT_OT_TYPE_BOOTSTRAP_FALLBACK,
  ATT_OT_TYPE_FALLBACK_COEFF,
  resolveAttOtTypeCoefficient,
  resolveAttOtTypeLabel,
  useAttOtTypesEffective,
  type AttOtTypePickerOption,
} from '@/hooks/useAttOtTypesEffective';
import {
  ATT_OT_COMP_TYPE_BOOTSTRAP_FALLBACK,
  resolveAttOtCompTypeLabel,
  useAttOtCompTypesEffective,
  type AttOtCompTypePickerOption,
} from '@/hooks/useAttOtCompTypesEffective';
import { ensureAtt06OtCompTypeForAccrual } from '@/lib/att06CatalogEnsure';
import { pickPreferredOtCompTypeCode } from '@/lib/attLeave06Ring';

export function OvertimeRequestTab() {
  const { t } = useTranslation();
  const { employees } = useEmployees();
  const {
    requests,
    isLoading,
    fetchRequests,
    createRequest,
    approveRequest,
    rejectRequest,
    deleteRequest,
  } = useOvertimeRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [overtimeTypeFilter, setOvertimeTypeFilter] = useState('all');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null);

  const [formData, setFormData] = useState({
    employee: '',
    overtimeDate: undefined as Date | undefined,
    startTime: '18:00',
    endTime: '21:00',
    // Rỗng → tự chọn option đầu của catalog hiệu lực (tránh khóa cứng 'weekday').
    overtimeType: '' as string,
    reason: '',
    // Rỗng → tự chọn option đầu compensation catalog (tránh khóa cứng 'salary').
    compensationType: '' as string,
  });

  // VAL-ATT-OT-CNS-01 — bind catalog loại tăng ca hiệu lực của Nest.
  const {
    nestOptions,
    effectiveCount,
    isLoading: otTypesLoading,
    isError: otTypesError,
  } = useAttOtTypesEffective();

  // VAL-ATT-COMP-CNS-01 — bind catalog hình thức bồi thường hiệu lực (orthogonal ≠ OT-TYPE).
  const {
    nestOptions: nestCompOptions,
    effectiveCount: otCompEffectiveCount,
    isLoading: otCompTypesLoading,
    isError: otCompTypesError,
    companyId: otCompScopeCompanyId,
    invalidate: invalidateOtCompCatalog,
  } = useAttOtCompTypesEffective();

  const [catalogEnsuring, setCatalogEnsuring] = useState(false);

  const handleAddModalOpenChange = (open: boolean) => {
    setAddModalOpen(open);
    if (!open) {
      resetForm();
      return;
    }
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    setFormData((prev) => ({
      ...prev,
      employee: prev.employee,
      overtimeDate: prev.overtimeDate ?? today,
      startTime: prev.startTime || '18:00',
      endTime: prev.endTime || '21:00',
      reason: prev.reason,
      overtimeType: prev.overtimeType,
      compensationType: prev.compensationType,
    }));
  };

  useEffect(() => {
    if (!addModalOpen || !otCompScopeCompanyId) return;
    let cancelled = false;
    setCatalogEnsuring(true);
    void ensureAtt06OtCompTypeForAccrual(otCompScopeCompanyId)
      .then((created) => {
        if (created && !cancelled) invalidateOtCompCatalog();
      })
      .finally(() => {
        if (!cancelled) setCatalogEnsuring(false);
      });
    return () => {
      cancelled = true;
    };
  }, [addModalOpen, otCompScopeCompanyId, invalidateOtCompCatalog]);

  // Bootstrap CHỈ khi Nest EFF=0 (catalog rỗng — U65 no seed, không invent SoT).
  const bootstrapOtTypes = useMemo<AttOtTypePickerOption[]>(
    () =>
      ATT_OT_TYPE_BOOTSTRAP_FALLBACK.map((o) => ({
        code: o.code,
        name: t(o.i18nKey),
        defaultCoeff: o.defaultCoeff,
      })),
    [t],
  );

  const bootstrapOtCompTypes = useMemo<AttOtCompTypePickerOption[]>(
    () =>
      ATT_OT_COMP_TYPE_BOOTSTRAP_FALLBACK.map((o) => ({
        code: o.code,
        name: t(o.i18nKey),
      })),
    [t],
  );

  /** EFF>0 → picker Nest (code/nameVi/defaultCoeff); EFF=0 → bootstrap 3-id. */
  const otTypeCatalogBound = effectiveCount > 0;
  const otTypeOptions: AttOtTypePickerOption[] = otTypeCatalogBound
    ? nestOptions
    : bootstrapOtTypes;

  /** EFF>0 → Nest compensation; EFF=0 → bootstrap salary|compensatory_leave. */
  const otCompTypeCatalogBound = otCompEffectiveCount > 0;
  const otCompTypeOptions: AttOtCompTypePickerOption[] = otCompTypeCatalogBound
    ? nestCompOptions
    : bootstrapOtCompTypes;

  /** Giá trị đang chọn — tự khớp option đầu khi catalog nạp xong / value cũ đã ngừng. */
  const selectedOtType = otTypeOptions.some((o) => o.code === formData.overtimeType)
    ? formData.overtimeType
    : otTypeOptions[0]?.code ?? '';

  const selectedOtCompType = (() => {
    if (
      formData.compensationType &&
      otCompTypeOptions.some((o) => o.code === formData.compensationType)
    ) {
      return formData.compensationType;
    }
    const preferred = pickPreferredOtCompTypeCode(otCompTypeOptions.map((o) => o.code));
    if (preferred) return preferred;
    return otCompTypeOptions[0]?.code ?? '';
  })();

  useEffect(() => {
    if (!addModalOpen) return;
    setFormData((prev) => {
      let changed = false;
      const next = { ...prev };
      if (!prev.overtimeDate) {
        const today = new Date();
        today.setHours(12, 0, 0, 0);
        next.overtimeDate = today;
        changed = true;
      }
      const preferredComp = pickPreferredOtCompTypeCode(otCompTypeOptions.map((o) => o.code));
      if (preferredComp && !prev.compensationType) {
        next.compensationType = preferredComp;
        changed = true;
      }
      const firstOt = otTypeOptions[0]?.code;
      if (firstOt && !prev.overtimeType) {
        next.overtimeType = firstOt;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [addModalOpen, otCompTypeOptions, otTypeOptions]);

  /** Hệ số hiển thị + prefill từ defaultCoeff — display-ready, KHÔNG phải công thức lương. */
  const selectedOtCoefficient = resolveAttOtTypeCoefficient(
    otTypeOptions,
    selectedOtType,
    ATT_OT_TYPE_FALLBACK_COEFF,
  );

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    totalHours: requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.total_hours, 0),
  };

  /** Nhãn từ catalog hiệu lực; mã đã ngừng vẫn hiện nguyên trên dòng lịch sử. */
  const getOvertimeTypeLabel = (type: string) => resolveAttOtTypeLabel(otTypeOptions, type);

  const getOvertimeTypeBadge = (type: string) => {
    const label = getOvertimeTypeLabel(type);
    switch (type) {
      case 'weekday':
        return <Badge className="bg-xevn-primary/10 text-xevn-primary hover:bg-xevn-primary/10 border-0">{label}</Badge>;
      case 'weekend':
        return <Badge className="bg-xevn-textSecondary/15 text-xevn-text hover:bg-xevn-textSecondary/15 border-0">{label}</Badge>;
      case 'holiday':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">{label}</Badge>;
      default:
        return <Badge variant="secondary">{label}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">{t('status.approved')}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">{t('status.rejected')}</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">{t('status.pending')}</Badge>;
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.employee_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesType = overtimeTypeFilter === 'all' || req.overtime_type === overtimeTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const calculateHours = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return Math.max(0, (endMinutes - startMinutes) / 60);
  };

  const otAddSubmitReady =
    Boolean(formData.employee) &&
    Boolean(formData.overtimeDate) &&
    Boolean(formData.reason.trim()) &&
    Boolean(selectedOtType) &&
    Boolean(selectedOtCompType) &&
    !otTypesLoading &&
    !otCompTypesLoading;

  const handleAddRequest = async () => {
    if (!formData.employee || !formData.overtimeDate || !formData.reason) {
      return;
    }
    // Không gửi khi chưa có mã loại tăng ca — BE assert HRM-ATT-OT-TYPE-KEY khi EFF>0.
    if (!selectedOtType) {
      return;
    }
    // Không gửi khi chưa có mã hình thức bồi thường — BE assert HRM-ATT-OT-COMP-KEY khi EFF>0.
    if (!selectedOtCompType) {
      return;
    }

    const selectedEmployee = employees.find(e => e.id === formData.employee);
    if (!selectedEmployee) return;

    const result = await createRequest({
      employee_id: selectedEmployee.id,
      employee_code: selectedEmployee.employee_code,
      employee_name: selectedEmployee.full_name,
      department: selectedEmployee.department,
      position: selectedEmployee.position,
      overtime_date: format(formData.overtimeDate, 'yyyy-MM-dd'),
      start_time: formData.startTime,
      end_time: formData.endTime,
      total_hours: calculateHours(formData.startTime, formData.endTime),
      // Submit mã catalog (Nest code khi EFF>0; mã bootstrap khi EFF=0).
      overtime_type: selectedOtType,
      coefficient: selectedOtCoefficient,
      reason: formData.reason,
      compensation_type: selectedOtCompType,
    });

    if (result) {
      setAddModalOpen(false);
      resetForm();
      void fetchRequests();
    }
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      overtimeDate: undefined,
      startTime: '18:00',
      endTime: '21:00',
      overtimeType: '',
      reason: '',
      compensationType: '',
    });
  };

  const handleApprove = async (request: OvertimeRequest) => {
    await approveRequest(request.id);
    setDetailModalOpen(false);
  };

  const handleReject = async (request: OvertimeRequest) => {
    await rejectRequest(request.id, t('overtime.notEligible'));
    setDetailModalOpen(false);
  };

  const handleDelete = async () => {
    if (selectedRequest) {
      await deleteRequest(selectedRequest.id);
      setDeleteModalOpen(false);
    }
  };

  const showInitialLoading = isLoading && requests.length === 0;

  if (showInitialLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-[15px] text-xevn-textSecondary">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6" data-testid="att-ot-precision">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-xevn-text">{t('overtime.title')}</h2>
        <Button className="gap-2 bg-xevn-primary hover:bg-xevn-primaryPressed text-white" onClick={() => handleAddModalOpenChange(true)}>
          <Plus className="w-4 h-4" />
          {t('overtime.addRequest')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-xevn-primary/10"><Clock className="w-5 h-5 text-xevn-primary" /></div>
            <div><p className="text-2xl font-bold text-xevn-text">{stats.total}</p><p className="text-sm text-xevn-textSecondary">{t('overtime.totalRequests')}</p></div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-amber-100"><AlertCircle className="w-5 h-5 text-amber-700" /></div>
            <div><p className="text-2xl font-bold text-xevn-text">{stats.pending}</p><p className="text-sm text-xevn-textSecondary">{t('overtime.pendingApproval')}</p></div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-green-100"><Check className="w-5 h-5 text-green-700" /></div>
            <div><p className="text-2xl font-bold text-xevn-text">{stats.approved}</p><p className="text-sm text-xevn-textSecondary">{t('overtime.approved')}</p></div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-red-100"><X className="w-5 h-5 text-red-700" /></div>
            <div><p className="text-2xl font-bold text-xevn-text">{stats.rejected}</p><p className="text-sm text-xevn-textSecondary">{t('overtime.rejected')}</p></div>
          </div>
        </Card>
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-input bg-xevn-primary/10"><TrendingUp className="w-5 h-5 text-xevn-primary" /></div>
            <div><p className="text-2xl font-bold text-xevn-text">{stats.totalHours}h</p><p className="text-sm text-xevn-textSecondary">{t('overtime.totalApprovedHours')}</p></div>
          </div>
        </Card>
      </div>

      <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xevn-textMuted" />
            <Input placeholder={t('common.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder={t('common.status.label')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="pending">{t('status.pending')}</SelectItem>
              <SelectItem value="approved">{t('status.approved')}</SelectItem>
              <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={overtimeTypeFilter} onValueChange={setOvertimeTypeFilter}>
            <SelectTrigger className="w-[160px]" data-testid="att-ot-type-filter"><SelectValue placeholder={t('overtime.overtimeType')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {otTypeOptions.map((o) => (
                <SelectItem key={o.code} value={o.code}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon"><Download className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-card border-xevn-border bg-xevn-surface">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-xevn-border bg-xevn-background">
                <th className="p-3 text-left w-10"><Checkbox /></th>
                <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attendanceRecords.employee')}</th>
                <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attendanceRecords.department')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('overtime.overtimeDate')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('checkinout.time')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('overtime.totalHours')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('overtime.overtimeType')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('overtime.coefficient')}</th>
                <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('overtime.reason')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('common.status.label')}</th>
                <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-xevn-border hover:bg-xevn-primary/5 transition-colors"
                  data-testid={request.status === 'pending' ? 'att-ot-row-pending' : undefined}
                  data-att-ot-status={request.status}
                >
                  <td className="p-3"><Checkbox /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-xevn-primary/10 text-xevn-primary font-medium">
                          {request.employee_name.split(' ').pop()?.charAt(0) || 'N'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-xevn-text">{request.employee_name}</p>
                        <p className="text-xs text-xevn-textSecondary">{request.employee_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-xevn-textSecondary">{request.department || '-'}</td>
                  <td className="p-3 text-sm text-center text-xevn-text">{request.overtime_date}</td>
                  <td className="p-3 text-sm text-center text-xevn-text">{request.start_time} - {request.end_time}</td>
                  <td className="p-3 text-center">
                    <Badge variant="secondary">{request.total_hours}h</Badge>
                  </td>
                  <td className="p-3 text-center">{getOvertimeTypeBadge(request.overtime_type)}</td>
                  <td className="p-3 text-center font-medium text-xevn-primary">x{request.coefficient}</td>
                  <td className="p-3 text-sm text-xevn-text max-w-[200px] truncate">{request.reason}</td>
                  <td className="p-3 text-center">{getStatusBadge(request.status)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        data-testid="att-ot-row-view"
                        onClick={() => {
                          setSelectedRequest(request);
                          setDetailModalOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 text-xevn-textMuted" />
                      </Button>
                      {request.status === 'pending' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedRequest(request); setDeleteModalOpen(true); }}>
                          <Trash2 className="w-4 h-4 text-xevn-textMuted" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-[15px] text-xevn-textSecondary">
                    {t('overtime.noRequests')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-xevn-border">
          <div className="text-sm text-xevn-textSecondary">{t('overtime.totalCount')}: <span className="font-medium text-xevn-text">{filteredRequests.length}</span></div>
        </div>
      </Card>

      {/* Add Modal — S51 · FE-DIALOG-01 ui-neo wire */}
      <Dialog open={addModalOpen} onOpenChange={handleAddModalOpenChange}>
        <DialogContent
          className="sm:max-w-[920px]"
          data-testid="att-ot-add-dialog-precision"
          data-att-ot-catalog-ensuring={catalogEnsuring ? 'true' : 'false'}
        >
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-xevn-text">{t('overtime.addRequest')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xevn-text">{t('attendanceRecords.employee')} *</Label>
              <Select value={formData.employee} onValueChange={(v) => setFormData({ ...formData, employee: v })}>
                <SelectTrigger className="xevn-field-select-md" data-testid="att-ot-employee-select"><SelectValue placeholder={t('overtime.selectEmployee')} /></SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name} - {emp.employee_code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <Label className="text-xevn-text">{t('overtime.overtimeDate')} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="xevn-field-date justify-start text-left font-normal"
                      data-testid="att-ot-date-trigger"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-xevn-textMuted" />
                      {formData.overtimeDate ? format(formData.overtimeDate, 'dd/MM/yyyy', { locale: vi }) : t('overtime.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={formData.overtimeDate} onSelect={(d) => setFormData({ ...formData, overtimeDate: d })} /></PopoverContent>
                </Popover>
              </div>
              <div className="sm:col-span-4">
                <Label className="text-xevn-text">{t('overtime.startTime')}</Label>
                <Input className="xevn-field-time" type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
              </div>
              <div className="sm:col-span-4">
                <Label className="text-xevn-text">{t('overtime.endTime')}</Label>
                <Input className="xevn-field-time" type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <Label className="text-xevn-text">{t('overtime.overtimeType')}</Label>
                <Select
                  value={selectedOtType}
                  onValueChange={(v) => setFormData({ ...formData, overtimeType: v })}
                  disabled={otTypesLoading || otTypeOptions.length === 0}
                >
                  <SelectTrigger className="xevn-field-select-sm" data-testid="att-ot-type-select">
                    <SelectValue
                      placeholder={otTypesLoading ? t('common.loading') : t('overtime.overtimeType')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {otTypeOptions.map((o) => (
                      <SelectItem key={o.code} value={o.code}>
                        {o.name} (x{o.defaultCoeff})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {otTypesError ? (
                  <p className="mt-1 text-xs text-red-600" data-testid="att-ot-type-catalog-error">
                    {t('overtime.otTypeCatalogError')}
                  </p>
                ) : otTypesLoading ? (
                  <p className="mt-1 text-xs text-xevn-textSecondary">{t('common.loading')}</p>
                ) : (
                  <p className="mt-1 text-xs text-xevn-textSecondary" data-testid="att-ot-type-coeff-hint">
                    {otTypeCatalogBound
                      ? `${t('overtime.coefficient')}: x${selectedOtCoefficient}`
                      : t('overtime.otTypeCatalogBootstrapHint')}
                  </p>
                )}
              </div>
              <div className="sm:col-span-4">
                <Label className="text-xevn-text">{t('overtime.compensationType')}</Label>
                <Select
                  value={selectedOtCompType}
                  onValueChange={(v) => setFormData({ ...formData, compensationType: v })}
                  disabled={otCompTypesLoading || otCompTypeOptions.length === 0}
                >
                  <SelectTrigger className="xevn-field-select-sm" data-testid="att-ot-comp-type-select">
                    <SelectValue
                      placeholder={otCompTypesLoading ? t('common.loading') : t('overtime.compensationType')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {otCompTypeOptions.map((o) => (
                      <SelectItem key={o.code} value={o.code}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {otCompTypesError ? (
                  <p className="mt-1 text-xs text-red-600" data-testid="att-ot-comp-type-catalog-error">
                    {t('overtime.otCompTypeCatalogError')}
                  </p>
                ) : otCompTypesLoading ? (
                  <p className="mt-1 text-xs text-xevn-textSecondary">{t('common.loading')}</p>
                ) : !otCompTypeCatalogBound ? (
                  <p className="mt-1 text-xs text-xevn-textSecondary" data-testid="att-ot-comp-type-bootstrap-hint">
                    {t('overtime.otCompTypeCatalogBootstrapHint')}
                  </p>
                ) : null}
              </div>
            </div>
            <div>
              <Label className="text-xevn-text">{t('overtime.reason')} *</Label>
              <Textarea className="xevn-field-reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder={t('overtime.reason')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleAddModalOpenChange(false)}>{t('common.cancel')}</Button>
            <Button
              className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
              onClick={handleAddRequest}
              disabled={!otAddSubmitReady}
              data-testid="att-ot-add-submit"
              data-att-ot-submit-ready={otAddSubmitReady ? 'true' : 'false'}
            >
              {t('common.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal — S51 */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px]" data-testid="att-ot-detail-dialog-precision">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-xevn-text">{t('overtime.requestDetail')}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-card border border-xevn-border bg-xevn-background">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-xevn-primary/10 text-xevn-primary font-medium">
                    {selectedRequest.employee_name.split(' ').pop()?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-xevn-text">{selectedRequest.employee_name}</p>
                  <p className="text-sm text-xevn-textSecondary">{selectedRequest.employee_code} - {selectedRequest.position}</p>
                </div>
                <div className="ml-auto">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 rounded-card border border-xevn-border bg-xevn-background">
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('overtime.overtimeDate')}</p>
                  <p className="font-medium text-xevn-text">{selectedRequest.overtime_date}</p>
                </div>
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('checkinout.time')}</p>
                  <p className="font-medium text-xevn-text">{selectedRequest.start_time} - {selectedRequest.end_time}</p>
                </div>
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('overtime.totalHours')}</p>
                  <p className="font-medium text-xevn-text">{selectedRequest.total_hours}h</p>
                </div>
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('overtime.coefficient')}</p>
                  <p className="font-medium text-xevn-primary">x{selectedRequest.coefficient}</p>
                </div>
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('overtime.overtimeType')}</p>
                  <p>{getOvertimeTypeBadge(selectedRequest.overtime_type)}</p>
                </div>
                <div>
                  <p className="text-sm text-xevn-textSecondary">{t('overtime.compensationType')}</p>
                  <p className="font-medium text-xevn-text" data-testid="att-ot-comp-type-detail">
                    {resolveAttOtCompTypeLabel(otCompTypeOptions, selectedRequest.compensation_type)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary mb-1">{t('overtime.reason')}</p>
                <p className="text-sm text-xevn-text">{selectedRequest.reason}</p>
              </div>
              {selectedRequest.rejected_reason && (
                <div>
                  <p className="text-sm text-xevn-textSecondary mb-1">{t('leave.rejectReason')}</p>
                  <p className="text-sm text-red-600">{selectedRequest.rejected_reason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedRequest?.status === 'pending' && (
              <>
                <Button variant="outline" className="text-red-600" onClick={() => selectedRequest && handleReject(selectedRequest)}>
                  <X className="w-4 h-4 mr-2" />{t('leave.reject')}
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="att-ot-approve-submit"
                  onClick={() => selectedRequest && handleApprove(selectedRequest)}
                >
                  <Check className="w-4 h-4 mr-2" />{t('leave.approve')}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>{t('common.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation — S51 */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent data-testid="att-ot-delete-dialog-precision">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-bold text-xevn-text">{t('overtime.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-xevn-textSecondary">
              {t('overtime.deleteConfirmMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
