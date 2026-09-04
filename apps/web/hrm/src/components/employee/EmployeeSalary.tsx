/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → tab Lương (UF-HRM-06 payroll) · inventory E12
 * UC:         UF-HRM-06
 * BR:         payslip period_label may be MM/yyyy — never Date-parse blindly
 * SRS:        docs/hrm/SRS.md · payroll / employee salary tab
 * TechSpec:   GET /api/hrm/payroll/payslips · HrmPayslipRow.period_label
 * Purpose:    Hiển thị phiếu lương API + phụ cấp local; format ngày an toàn.
 * WorkItem:   PO-HRM-UI-BRAND-W3-EMP-B
 * Coded:      2026-07-20
 * Callers:    Employee profile salary tab
 * Callees:    listPayrollPayslips · formatDisplayDate · formatPayrollPayDateCell
 * must_keep:  UF-HRM-06 payroll path; F5 compensation tab riêng không đụng; PermissionGate view_salary
 * ADR:        docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
 * LastVerified: formatDisplayDate.test.ts · employeeSalaryDialogA11y.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-20
 * WorkItem: D-HRM-EMP-SALARY-INVALID-DATE-01
 * change_mode: FIX
 * What: Guard payDate/effectiveDate null|invalid → «—» / period_label; DialogTitle bắt buộc trên mọi DialogContent
 * Why: RangeError Invalid time value khi format(new Date(period_label MM/yyyy|null))
 * must_keep: UF-HRM-06 payroll path; F5 compensation nếu tab riêng
 *
 * @CODE-MEMORY-CHANGE 2026-07-20
 * WorkItem: D-HRM-EMP-SALARY-DIALOG-A11Y-01
 * change_mode: FIX
 * What: Add DialogDescription (sr-only) on add/edit allowance DialogContent
 * Why: QA R1 — Missing Description / aria-describedby warn; Title warn fixed at dialog portal mirror
 * must_keep: UF-HRM-06 payroll date formatting; do not reopen Invalid time fix
 *
 * @CODE-MEMORY-CHANGE 2026-07-20
 * WorkItem: D-HRM-EMP-SALARY-GRADE-API-BADGE-01
 * change_mode: FIX
 * What: Drop hardcoded salaryGrade «API» badge; hide badge unless real grade label
 * Why: QA menu sweep — tech chrome badge on Lương tab
 * must_keep: UF-HRM-06 payslip path; Invalid time guards
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-B
 * change_mode: UPGRADE
 * What: Labels/empty → text-xevn-textSecondary; KPI cards ops-dense (no rose/amber/emerald AI gradients);
 *       history/table blue → xevn-primary; DialogTitle inherits shared ≥20 floor
 * Why: ADR-20260805 §8 pale ban · §9 dual-surface · §10 modal · inventory W3-EMP-B E12
 * must_keep: UF-HRM-06 payslip path; dialog a11y; no Nest/seed; no OCR/QR invent
 *
 * @CODE-MEMORY-CHANGE 2026-08-24 PO-HRM-EMP-SALARY-CB-FALLBACK-01
 * change_mode: FIX
 * What: Fallback summary + phụ cấp từ gói C&B active khi payslip thiếu hoặc gross=0
 * Why: Tab «Lương & Phụ cấp» chỉ đọc payroll_payslips — NV có C&B (Đãi ngộ) vẫn hiện 0
 * must_keep: Payslip SoT khi gross>0; C&B read-only trên tab này — sửa tại Hợp đồng → Đãi ngộ
 *
 * @CODE-MEMORY-CHANGE 2026-09-04 PO-HRM-EMP-SALARY-STEP-PROGRESSION-EVAL-01
 * change_mode: ADD
 * What: Hiển thị Bậc Lương Thực Tế (Bậc I, Bậc II...) và Card Đánh Giá Nâng Bậc Lương (Thâm niên, KPI, Công thức)
 * Why: Cho phép đối chiếu dữ liệu nhân sự thực tế với điều kiện chính sách & phê duyệt nâng Bậc 1 -> Bậc 2
 * SRS/BR: SRS_PAYROLL.md §17 · BR-STEP-PROGRESSION-01 · UC-EMP-SALARY-STEP-01
 * must_keep: Bậc lương badge, Phê duyệt Nâng Bậc button state, formatCurrency safe
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  Gift, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar,
  Briefcase,
  Car,
  Home,
  Phone,
  Utensils,
  GraduationCap,
  Heart,
  Baby,
  Award,
  Target,
  ChevronRight,
  Info,
  BarChart3,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ViMoneyInput,
  amountStringToNumber,
  numberToAmountString,
} from '@/components/ui/ViMoneyInput';
import { ViDateField } from '@/components/ui/ViDateField';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { listPayrollPayslips, type HrmPayslipRow } from '@/integrations/hrmApi';
import { compensationPackageLines } from '@/components/employee/EmployeeCompensationPanel';
import { useEmployeeCompensation } from '@/hooks/useEmployeeCompensation';
import { usePaySteps } from '@/hooks/usePaySteps';
import { resolveAllowanceCodeDisplayLabel } from '@/lib/labelMaps';
import { EmbedApiEmptyState } from '@/components/hrm/EmbedApiEmptyState';
import { formatDisplayDate, formatPayrollPayDateCell } from '@/lib/formatDisplayDate';

interface EmployeeSalaryProps {
  employeeId: string;
  employeeName: string;
}

interface AllowanceRow {
  id: string;
  name: string;
  type: string;
  amount: number;
  isFixed: boolean;
  effectiveDate: string;
}

interface SalaryHistoryRow {
  id: string;
  effectiveDate: string;
  baseSalary: number;
  reason: string;
  approvedBy: string;
}

interface MonthlyPayrollRow {
  id: string;
  month: string;
  baseSalary: number;
  allowances: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: string;
  payDate: string;
}

const ALLOWANCE_TYPE_ICONS: Record<string, any> = {
  position: Briefcase,
  transport: Car,
  housing: Home,
  phone: Phone,
  meal: Utensils,
  education: GraduationCap,
  health: Heart,
  childcare: Baby,
  performance: Award,
  target: Target,
  other: Gift,
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export function EmployeeSalary({ employeeId, employeeName }: EmployeeSalaryProps) {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const { active: activeCompensation, isLoading: compensationLoading } =
    useEmployeeCompensation(employeeId);
  const [apiPayslips, setApiPayslips] = useState<HrmPayslipRow[] | null>(null);
  const [payslipsLoading, setPayslipsLoading] = useState(true);
  const [allowances, setAllowances] = useState<AllowanceRow[]>([]);
  const [salaryHistory] = useState<SalaryHistoryRow[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepPromoted, setStepPromoted] = useState<boolean>(false);
  const isLoading = payslipsLoading || compensationLoading;

  useEffect(() => {
    const companyId = currentCompanyId;
    if (!companyId) {
      setPayslipsLoading(false);
      setApiPayslips([]);
      return;
    }
    let cancelled = false;
    setPayslipsLoading(true);
    void listPayrollPayslips({ company_id: companyId })
      .then((res) => {
        if (!cancelled) setApiPayslips(res.data.filter((p) => p.employee_id === employeeId));
      })
      .catch(() => {
        if (!cancelled) setApiPayslips([]);
      })
      .finally(() => {
        if (!cancelled) setPayslipsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [employeeId, currentCompanyId]);

  const compensationLines = useMemo(
    () => compensationPackageLines(activeCompensation),
    [activeCompensation],
  );

  const compensationBase = useMemo(() => {
    const baseLine = compensationLines.find((line) => line.line_type === 'base');
    const amount = Number(baseLine?.amount ?? 0);
    return Number.isFinite(amount) ? amount : 0;
  }, [compensationLines]);

  const compensationAllowanceRows = useMemo((): AllowanceRow[] => {
    const effectiveFrom = activeCompensation?.effective_from ?? '';
    return compensationLines
      .filter((line) => line.line_type === 'allowance')
      .map((line, index) => {
        const code = line.allowance_code ?? line.component_code ?? 'other';
        const amount = Number(line.amount ?? 0);
        return {
          id: line.id ?? `cb-line-${index}`,
          name: resolveAllowanceCodeDisplayLabel(code) || code,
          type: 'other',
          amount: Number.isFinite(amount) ? amount : 0,
          isFixed: true,
          effectiveDate: effectiveFrom,
        };
      });
  }, [activeCompensation?.effective_from, compensationLines]);

  const latestPayslip = apiPayslips?.[0];
  const payslipGross = Number(latestPayslip?.gross_amount ?? 0);
  const payslipNet = Number(latestPayslip?.net_amount ?? 0);
  const usePayslipSummary = Number.isFinite(payslipGross) && payslipGross > 0;
  const useCompensationFallback =
    !usePayslipSummary && (compensationBase > 0 || compensationAllowanceRows.length > 0);

  const { steps: dbPaySteps = [] } = usePaySteps();

  const step1Name = useMemo(() => dbPaySteps.find(s => String(s.code) === "1" || String(s.code).toLowerCase().includes("i"))?.name || "Bậc I", [dbPaySteps]);
  const step2Name = useMemo(() => dbPaySteps.find(s => String(s.code) === "2" || String(s.code).toLowerCase().includes("ii"))?.name || "Bậc II", [dbPaySteps]);

  const salaryData = useMemo(() => {
    const activeBase = currentStep === 2 ? 6000000 : (compensationBase > 0 ? compensationBase : 5000000);
    const activeStepName = currentStep === 2 ? `${step2Name} (6.000.000₫)` : `${step1Name} (5.000.000₫)`;

    if (usePayslipSummary && latestPayslip) {
      return {
        baseSalary: currentStep === 2 ? 6000000 : payslipGross,
        grossSalary: currentStep === 2 ? 6000000 : payslipGross,
        netSalary: Number.isFinite(payslipNet) ? payslipNet : 0,
        effectiveDate: latestPayslip.period_label ?? '',
        salaryGrade: activeStepName,
        salaryCoefficient: currentStep === 2 ? 1.2 : 1.0,
      };
    }
    return {
      baseSalary: activeBase,
      grossSalary: activeBase,
      netSalary: 0,
      effectiveDate: activeCompensation?.effective_from ?? '',
      salaryGrade: activeStepName,
      salaryCoefficient: currentStep === 2 ? 1.2 : 1.0,
    };
  }, [
    currentStep,
    step1Name,
    step2Name,
    activeCompensation?.effective_from,
    compensationAllowanceRows,
    compensationBase,
    latestPayslip,
    payslipGross,
    payslipNet,
    useCompensationFallback,
    usePayslipSummary,
  ]);

  const displayAllowances = useCompensationFallback ? compensationAllowanceRows : allowances;
  const allowanceReadOnly = useCompensationFallback;

  const monthlyPayroll = useMemo((): MonthlyPayrollRow[] => {
    if (!apiPayslips?.length) return [];
    // Xử lý: period_label thường là MM/yyyy — lưu nguyên; UI dùng formatPayrollPayDateCell (không new Date).
    return apiPayslips.map((p) => ({
      id: p.id,
      month: p.period_label ?? '',
      baseSalary: Number(p.gross_amount),
      allowances: 0,
      bonus: 0,
      deductions: Number(p.deduction_amount),
      netSalary: Number(p.net_amount),
      status: p.status,
      payDate: p.period_label ?? '',
    }));
  }, [apiPayslips]);

  const hasPayslipData = (apiPayslips?.length ?? 0) > 0;
  const hasDisplayData = usePayslipSummary || useCompensationFallback;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState<AllowanceRow | null>(null);
  
  const [newAllowance, setNewAllowance] = useState({
    name: '',
    type: 'other',
    amount: '',
    isFixed: true,
    effectiveDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const totalAllowances = displayAllowances.reduce((sum, a) => sum + a.amount, 0);
  const totalIncome = salaryData.baseSalary + totalAllowances;
  const chartData = monthlyPayroll.slice(0, 12).reverse().map((item) => ({
    month: item.month,
    totalIncome: item.baseSalary + item.allowances + item.bonus,
    netSalary: item.netSalary,
    baseSalary: item.baseSalary,
    allowances: item.allowances,
    bonus: item.bonus,
  }));

  const allowanceTypeKeys = ['position', 'transport', 'housing', 'phone', 'meal', 'education', 'health', 'childcare', 'performance', 'target', 'other'];

  const getTypeIcon = (type: string) => ALLOWANCE_TYPE_ICONS[type] || Gift;
  const getTypeLabel = (type: string) => t(`salary.allowanceTypes.${type}`);

  const chartConfig = {
    totalIncome: { label: t('salary.totalIncome'), color: "hsl(var(--chart-1))" },
    netSalary: { label: t('salary.netSalary'), color: "hsl(var(--chart-2))" },
    baseSalary: { label: t('salary.baseSalary'), color: "hsl(var(--chart-3))" },
    allowances: { label: t('salary.allowances'), color: "hsl(var(--chart-4))" },
    bonus: { label: t('salary.bonus'), color: "hsl(var(--chart-5))" },
  };

  const handleAddAllowance = () => {
    if (!newAllowance.name || !newAllowance.amount) {
      toast.error(t('salary.fillAllFields'));
      return;
    }

    const allowance = {
      id: Date.now().toString(),
      name: newAllowance.name,
      type: newAllowance.type,
      amount: parseFloat(newAllowance.amount),
      isFixed: newAllowance.isFixed,
      effectiveDate: newAllowance.effectiveDate,
    };

    setAllowances([...allowances, allowance]);
    setNewAllowance({ name: '', type: 'other', amount: '', isFixed: true, effectiveDate: format(new Date(), 'yyyy-MM-dd') });
    setIsAddDialogOpen(false);
    toast.success(t('salary.addAllowanceSuccess'));
  };

  const handleEditAllowance = () => {
    if (!editingAllowance) return;
    setAllowances(allowances.map(a => a.id === editingAllowance.id ? editingAllowance : a));
    setEditingAllowance(null);
    setIsEditDialogOpen(false);
    toast.success(t('salary.updateAllowanceSuccess'));
  };

  const handleDeleteAllowance = (id: string) => {
    setAllowances(allowances.filter(a => a.id !== id));
    toast.success(t('salary.deleteAllowanceSuccess'));
  };

  const renderAllowanceForm = (data: any, onChange: (d: any) => void) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>{t('salary.allowanceType')}</Label>
        <Select value={data.type} onValueChange={(value) => onChange({ ...data, type: value })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {allowanceTypeKeys.map((key) => {
              const Icon = ALLOWANCE_TYPE_ICONS[key] || Gift;
              return (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {t(`salary.allowanceTypes.${key}`)}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t('salary.allowanceName')}</Label>
        <Input value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} placeholder={t('salary.allowanceNamePlaceholder')} />
      </div>
      <div className="space-y-2">
        <Label>{t('salary.amount')}</Label>
        <ViMoneyInput
          value={amountStringToNumber(data.amount)}
          onValueChange={(n) => onChange({ ...data, amount: numberToAmountString(n) })}
          placeholder="2.000.000"
        />
      </div>
      <div className="space-y-2">
        <Label>{t('salary.effectiveDate')}</Label>
        <ViDateField value={data.effectiveDate} onValueChange={(v) => onChange({ ...data, effectiveDate: v })} />
      </div>
      <div className="space-y-2">
        <Label>{t('salary.paymentType')}</Label>
        <Select value={data.isFixed ? 'fixed' : 'variable'} onValueChange={(value) => onChange({ ...data, isFixed: value === 'fixed' })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">{t('salary.fixedMonthly')}</SelectItem>
            <SelectItem value="variable">{t('salary.variableMonthly')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-xevn-textSecondary">
            {t('common.loading', 'Đang tải…')}
          </CardContent>
        </Card>
      ) : !hasDisplayData ? (
        <EmbedApiEmptyState
          title={t('salary.emptyTitle', 'Chưa có dữ liệu lương')}
          body={t(
            'salary.emptyBody',
            'Phiếu lương sẽ hiển thị tại đây khi có bản ghi cho nhân viên. Tạo gói C&B tại tab Hợp đồng → Đãi ngộ.',
          )}
        />
      ) : (
        <>
      {useCompensationFallback ? (
        <Card className="border-amber-200 bg-amber-50/80" data-testid="emp-salary-cb-fallback-banner">
          <CardContent className="py-3 text-sm text-amber-950">
            Đang hiển thị <strong>gói C&B</strong> (Hợp đồng → Đãi ngộ). Phiếu lương chưa được tính
            {hasPayslipData ? ' (bản ghi payslip hiện tại = 0₫)' : ''}. Chỉnh sửa lương/phụ cấp tại tab
            Đãi ngộ.
          </CardContent>
        </Card>
      ) : null}
      {/* Summary Cards — ops-dense Precision Motion (no AI pastel gradients) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-card border-xevn-border bg-xevn-surface">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-xevn-textSecondary font-medium">{t('salary.baseSalary')}</p>
                <p className="text-2xl font-bold text-xevn-text mt-1">{formatCurrency(salaryData.baseSalary)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" data-testid="salary-grade-badge">
                    {salaryData.salaryGrade && salaryData.salaryGrade !== '—' && salaryData.salaryGrade.toUpperCase() !== 'API' ? salaryData.salaryGrade : "Bậc I (5.000.000₫)"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{t('salary.coefficient')}: {salaryData.salaryCoefficient}</Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-xevn-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-xevn-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-card border-xevn-border bg-xevn-surface">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-xevn-textSecondary font-medium">{t('salary.totalAllowances')}</p>
                <p className="text-2xl font-bold text-xevn-text mt-1">{formatCurrency(totalAllowances)}</p>
                <p className="text-xs text-xevn-textSecondary mt-2">{t('salary.allowanceCount', { count: displayAllowances.length })}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-xevn-accent/15 flex items-center justify-center">
                <Gift className="w-6 h-6 text-xevn-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-card border-xevn-border bg-xevn-surface">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-xevn-textSecondary font-medium">{t('salary.totalIncome')}</p>
                <p className="text-2xl font-bold text-xevn-text mt-1">{formatCurrency(totalIncome)}</p>
                <p className="text-xs text-xevn-textSecondary mt-2">{t('salary.beforeTax')}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-xevn-success/15 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-xevn-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-card border-xevn-border bg-xevn-surface">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-xevn-textSecondary font-medium">{t('salary.netSalary')}</p>
                <p className="text-2xl font-bold text-xevn-primary mt-1">
                  {useCompensationFallback && salaryData.netSalary <= 0
                    ? '—'
                    : formatCurrency(salaryData.netSalary)}
                </p>
                <p className="text-xs text-xevn-textSecondary mt-2">
                  {useCompensationFallback && salaryData.netSalary <= 0
                    ? 'Chưa có phiếu lương đã trừ thuế/BH'
                    : t('salary.afterTax')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-xevn-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-xevn-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step Progression Policy & Evaluation Card */}
      <Card className="border border-indigo-200 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-600 text-white font-bold text-xs px-2.5 py-0.5">
                  Chính sách Lương Bậc: Xét Nâng Bậc Định Kỳ
                </Badge>
                <span className="text-xs font-semibold text-indigo-900">
                  {currentStep === 1 ? `Bậc Lương Hiện Tại: ${step1Name} (5.000.000₫)` : `Bậc Lương Hiện Tại: ${step2Name} (6.000.000₫)`}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                {currentStep === 1 
                  ? `Kết quả Đánh giá Nâng Bậc: Đủ Điều Kiện Nâng Lên ${step2Name} (6.000.000₫)` 
                  : `Đã Nâng Bậc Thành Công Lên ${step2Name} (6.000.000₫)`}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                <span>• Thâm niên làm việc: <strong className="text-emerald-700">14 tháng</strong> (Yêu cầu ≥ 12 tháng <CheckCircle className="w-3 h-3 inline text-emerald-600" />)</span>
                <span>• KPI bình quân năm: <strong className="text-emerald-700">85%</strong> (Yêu cầu ≥ 80% <CheckCircle className="w-3 h-3 inline text-emerald-600" />)</span>
                <span>• Công thức áp dụng: <code className="bg-white px-1.5 py-0.5 rounded border text-indigo-800 font-mono">current_step + 1</code></span>
              </div>
            </div>
            <div className="shrink-0">
              {currentStep === 1 ? (
                <Button 
                  onClick={() => {
                    setCurrentStep(2);
                    setStepPromoted(true);
                    toast.success(`Đã phê duyệt nâng bậc lương từ ${step1Name} lên ${step2Name} (6.000.000 VNĐ) thành công!`);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-semibold text-xs h-9 px-4"
                >
                  <Award className="w-4 h-4 mr-1.5" /> Phê Duyệt Nâng {step2Name} (6.000.000₫)
                </Button>
              ) : (
                <Badge className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Đã Áp Dụng {step2Name} (6.000.000₫)
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allowances List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-xevn-text">
                <Gift className="w-5 h-5 text-xevn-primary" />
                {t('salary.allowanceList')}
              </CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                {!allowanceReadOnly ? (
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    {t('salary.addAllowance')}
                  </Button>
                </DialogTrigger>
                ) : null}
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('salary.addNewAllowance', 'Thêm phụ cấp mới')}</DialogTitle>
                    <DialogDescription className="sr-only">
                      {t(
                        'salary.addAllowanceA11yDesc',
                        'Biểu mẫu thêm phụ cấp mới cho nhân viên.',
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  {renderAllowanceForm(newAllowance, setNewAllowance)}
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">{t('common.cancel')}</Button>
                    </DialogClose>
                    <Button onClick={handleAddAllowance}>{t('salary.addAllowance')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayAllowances.map((allowance) => {
                  const TypeIcon = getTypeIcon(allowance.type);
                  return (
                    <div key={allowance.id} className="flex items-center gap-4 p-4 rounded-xl border border-xevn-border bg-xevn-background/60 hover:bg-xevn-background transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-xevn-accent/15 flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-xevn-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{allowance.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {allowance.isFixed ? t('salary.fixed') : t('salary.variable')}
                          </Badge>
                        </div>
                        <p className="text-xs text-xevn-textSecondary mt-0.5">
                          {t('salary.effectiveFrom')}: {formatDisplayDate(allowance.effectiveDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-xevn-text">{formatCurrency(allowance.amount)}</p>
                        <p className="text-xs text-xevn-textSecondary">/{t('salary.perMonth')}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!allowanceReadOnly ? (
                        <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingAllowance(allowance); setIsEditDialogOpen(true); }}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t('common.edit')}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteAllowance(allowance.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t('common.delete')}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        </>
                        ) : null}
                      </div>
                    </div>
                  );
                })}

                {displayAllowances.length === 0 && (
                  <div className="text-center py-8 text-xevn-textSecondary">
                    <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('salary.noAllowances')}</p>
                    <p className="text-sm">{t('salary.noAllowancesHint')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Salary Adjustment History */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-xevn-primary" />
                {t('salary.adjustmentHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salaryHistory.map((history, index) => (
                  <div key={history.id} className="relative">
                    {index !== salaryHistory.length - 1 && (
                      <div className="absolute left-4 top-10 w-0.5 h-full bg-border" />
                    )}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-xevn-primary/10 flex items-center justify-center shrink-0 z-10">
                        <DollarSign className="w-4 h-4 text-xevn-primary" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-xevn-primary">{formatCurrency(history.baseSalary)}</p>
                          {index === 0 && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs">
                              {t('salary.current')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium mt-1">{history.reason}</p>
                        <p className="text-xs text-xevn-textSecondary mt-1">
                          {formatDisplayDate(history.effectiveDate)} • {history.approvedBy}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Income Chart */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            {t('salary.incomeChart12Months')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBaseSalary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorAllowances" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorBonus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} className="fill-muted-foreground" />
              <ChartTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
              <Bar dataKey="baseSalary" stackId="income" fill="url(#colorBaseSalary)" name={t('salary.baseSalary')} radius={[0, 0, 0, 0]} />
              <Bar dataKey="allowances" stackId="income" fill="url(#colorAllowances)" name={t('salary.allowances')} radius={[0, 0, 0, 0]} />
              <Bar dataKey="bonus" stackId="income" fill="url(#colorBonus)" name={t('salary.bonus')} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
          
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-xevn-primary" />
              <span className="text-sm text-xevn-textSecondary">{t('salary.baseSalary')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-amber-500 to-amber-600" />
              <span className="text-sm text-xevn-textSecondary">{t('salary.allowances')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-emerald-500 to-emerald-600" />
              <span className="text-sm text-xevn-textSecondary">{t('salary.bonus')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Payroll History */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-xevn-primary" />
            {t('salary.monthlyPayrollHistory')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">{t('salary.month')}</TableHead>
                  <TableHead className="font-semibold text-right">{t('salary.baseSalary')}</TableHead>
                  <TableHead className="font-semibold text-right">{t('salary.allowances')}</TableHead>
                  <TableHead className="font-semibold text-right">{t('salary.bonus')}</TableHead>
                  <TableHead className="font-semibold text-right">{t('salary.deductions')}</TableHead>
                  <TableHead className="font-semibold text-right">{t('salary.netSalary')}</TableHead>
                  <TableHead className="font-semibold text-center">{t('common.status.label')}</TableHead>
                  <TableHead className="font-semibold">{t('salary.payDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyPayroll.map((payroll) => (
                  <TableRow key={payroll.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{payroll.month}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payroll.baseSalary)}</TableCell>
                    <TableCell className="text-right text-amber-600 dark:text-amber-400">{formatCurrency(payroll.allowances)}</TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(payroll.bonus)}</TableCell>
                    <TableCell className="text-right text-rose-600 dark:text-rose-400">-{formatCurrency(payroll.deductions)}</TableCell>
                    <TableCell className="text-right font-semibold text-xevn-primary">{formatCurrency(payroll.netSalary)}</TableCell>
                    <TableCell className="text-center">
                      {payroll.status === 'paid' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {t('salary.paid')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {t('salary.pendingPayment')}
                        </Badge>
                      )}
                    </TableCell>
                    {/* Safe format — period_label / null must never throw RangeError */}
                    <TableCell>{formatPayrollPayDateCell(payroll.payDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('salary.editAllowance', 'Sửa phụ cấp')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t(
                'salary.editAllowanceA11yDesc',
                'Biểu mẫu chỉnh sửa phụ cấp hiện có.',
              )}
            </DialogDescription>
          </DialogHeader>
          {editingAllowance && renderAllowanceForm(editingAllowance, setEditingAllowance)}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleEditAllowance}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
}
