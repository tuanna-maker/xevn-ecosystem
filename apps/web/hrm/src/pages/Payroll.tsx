/**
 * @CODE-MEMORY
 * Screen:     /payroll ? B?ng l??ng (HR / payroll ops)
 * UC:         UC-HRM-PAY
 * Purpose:    Shell tab l??ng; live Th�nh ph?n l??ng = SalaryComponentsTab;
 *             quy?t to�n thu? edit NV d�ng taxSettlementFloatingUi (C1).
 * WorkItem:   D-UX-P0C-PAYROLL-REDUCER-01 � D-UX-D5-ZOD-LIVE-WIRE-01 � D-UX-C1-PAYROLL-FE-01
 * Callers:    App route /payroll � portal embed
 * Callees:    SalaryComponentsTab � taxSettlementFloatingUi � usePayrollDomainUi
 * must_keep:  taxSettlementFloatingUi C1; SalaryComponentsTab mount; kh�ng seed/deploy
 * LastVerified: docs/qa/evidence/d-ux-p0c-payroll-reducer-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-D5-ZOD-LIVE-WIRE-01
 * change_mode: FIX
 * What: G? orphan Dialog Th�m th�nh ph?n l??ng kh?i Payroll ? Zod+RHF live ?
 *       SalaryComponentsTab; gi? wire taxSettlementFloatingUi C1
 * Why: QA-UX-D5-01 ? Zod kh�ng n?m user-reachable path
 * must_keep: taxSettlementFloatingUi; Payroll mount; UX-03 debounce kh�ng ??ng
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-P0C-PAYROLL-REDUCER-01
 * change_mode: FIX/ADD
 * What: Gom race-prone tab/modal/form useState ? useReducer domain slices
 *       (shell/advance/taxUi/salaryComponent/batch) qua usePayrollDomainUi;
 *       atomic open/close; gi? taxSettlementFloatingUi C1 + SalaryComponentsTab D5
 * Why: UX-UI-ERP-ANALYSIS P0-c / UX-06 ? state proliferation ? race nested modal
 * must_keep: taxSettlementFloatingUi; SalaryComponentsTab Zod+RHF; Clock-In untouched
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-FE-ERP-E2-01
 * change_mode: ADD
 * What: X�a mock tax/insurance/advance islands; HIDE quy?t to�n thu? invent UI (AC-E2-P3-02);
 *       live Insurance/TaxPolicyTab API; nature SoT ? SalaryComponentsTab pay_types
 * Why: FR-HRM-PAY-CLEAN-E2-01 � sa-erp-e2-ack-01 tax HIDE � AC-E2-NOMOCK-01
 * must_keep: SalaryComponentsTab; E1-A/E1-B; taxSettlementFloatingUi module (kh�ng expose invent)
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-FE-ERP-E2-01-R2
 * change_mode: FIX
 * What: Khôi phục `const availableTaxPolicyEmployees = []` ra ngoài comment (DEF-E2-PAYROLL-CRASH);
 *       giữ mảng rỗng — không mock NV; tax settlement HIDE giữ nguyên
 * Why: QA-ERP-E2-01 — comment nuốt declaration → ReferenceError white-screen /hr/payroll
 * must_keep: E1 pickers; AC-E2-NOMOCK-01 empty array; AC-E2-P3-02 tax HIDE; SalaryComponentsTab
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: PO-E2E-SPINE-01-FE-VITE-PAY-CON-01
 * change_mode: FIX
 * What: Unblock Vite mount — restore taxSettlementFloatingUi + usePayrollDomainUi + payrollDomainUi + salaryComponentFormSchema chain (stash 43c479a)
 * Why: QA W5 HP-06 — CC Tiền lương blank · Payroll.tsx Vite 500
 * must_keep: EmbedApiEmptyState / overview empty path; Leave/LV-03/04 · AUTH/EMP/CAT · HP-03/04
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-UI-BRAND-W4-PAY-A
 * change_mode: UPGRADE
 * What: Precision Motion chrome P01 overview + top tabs — kill rainbow AI tab/step/chart colors →
 *       bg-xevn-primary / brand surface; title ≥20; vi-VN money formatCurrency kept
 * Why: ADR §16 LOCK · inventory FE-PAY P0 spine · B4 cấm purple/pink AI palette
 * must_keep: SalaryComponentsTab Zod; taxSettlementFloatingUi C1; formatCurrency vi-VN;
 *            no salary formula/API invent; Face HOLD; Attendance not CLOSED; remaster DONE false
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-UI-BRAND-W4-PAY-B-01
 * change_mode: UPGRADE
 * What: P05/P09 stub panels · P12 calc-template route · P14 reports tab · tax settlement honesty testid
 * Why: ADR §16 · W3-PAY-B chrome-only; preserve tax HIDE invent (AC-E2-P3-02)
 * must_keep: SalaryComponentsTab; taxSettlementFloatingUi C1; PAY-A P0 tabs unchanged logic
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-01
 * change_mode: ADD
 * What: Top tab «Công thức lương» → PayFormulaAuthorPanel (GĐ1 form, no DnD); wire Nest formulas*
 * Why: QC-01 GWC residual R-PAY-FE-FORM · API §4 AUTHOR/PUBLISH/LIST · honesty payroll_e2e_ready=false
 * must_keep: SalaryComponentsTab; taxSettlementFloatingUi C1; cấm FE evaluator / salary_components.formula SoT
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-EVAL-01
 * change_mode: ADD
 * What: Panel emit expression_json form=gd1_eval_v1 (staged subset) — preview Nest 200/412; no FE engine
 * Why: QC-EVAL optional residual R-PAY-FE-OPAQUE→EVAL
 * must_keep: payroll_e2e_ready=false · dual-control · immutable · cấm DnD / FE net calc
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-ESS-FE-01
 * change_mode: ADD
 * What: Top tab Phiếu của tôi → EssPayslipsPanel (GET/POST me/payslips* confirm)
 * Why: Close FE residual after L1 ESS GWC Step6
 * must_keep: own-only 403 · CEO 403 · F5 after confirm · payroll_e2e_ready=false · L1 SEAL · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: PAY-02 cluster — PayFormulaAuthorPanel COMP-01 block + preview lines table; must_keep PAY01QC1
 * Why: API-01 §9 FE-01 · BA J-HRM-PAY-02-* · ≠ PAY-02 DONE · payroll_e2e_ready=false
 * must_keep: SalaryComponentsTab N+1 admin; cấm DnD · cấm FE net SoT
 */
import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Download,
  Lock,
  FileText,
  Calculator,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Printer,
  LayoutGrid,
  Settings,
  BarChart3,
  Wallet,
  CreditCard,
  DollarSign,
  FunctionSquare,
  UserRound,
  ChevronDown,
  Users,
  TrendingUp,
  Play,
  FileSpreadsheet,
  ClipboardList,
  Coins,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Plus,
  Filter,
  ArrowLeft,
  Copy,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  XCircle,
  Send,
} from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  applyTaxEditDialogOpenChange,
  closeTaxEmployeeEditFloatingUi,
  createEmptyTaxSettlementFloatingUiState,
  employeeAvatarInitial,
  formatPayrollMoney,
  matchesTaxSettlementEmployeeSearch,
  normalizeTaxSettlementEmployee,
  openTaxEmployeeEditFloatingUi,
  patchTaxEmployeeEditForm,
  type TaxSettlementEmployeeRow,
} from '@/components/payroll/taxSettlementFloatingUi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ViMoneyInput } from '@/components/ui/ViMoneyInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { X, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Pencil, MoreHorizontal, Upload, Info } from 'lucide-react';
import { useEmployees, Employee as DBEmployee } from '@/hooks/useEmployees';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PayslipPrintDialog } from '@/components/payroll/PayslipPrintDialog';
import { FormulaInput } from '@/components/payroll/FormulaInput';
import { BonusPolicyTab } from '@/components/payroll/BonusPolicyTab';
import { SalesDataTab } from '@/components/payroll/SalesDataTab';
import { AdvanceRequestsTab } from '@/components/payroll/AdvanceRequestsTab';
import { PayrollBatchesTab } from '@/components/payroll/PayrollBatchesTab';
import { PayrollPayslipsApiTab } from '@/components/payroll/PayrollPayslipsApiTab';
import { PayrollGroupsCatalogTab } from '@/components/payroll/PayrollGroupsCatalogTab';
import { usePayrollPayslips } from '@/hooks/usePayrollPayslips';
import { PaymentBatchesTab } from '@/components/payroll/PaymentBatchesTab';
import { SalaryComponentsTab } from '@/components/payroll/SalaryComponentsTab';
import { PayFormulaAuthorPanel } from '@/components/payroll/PayFormulaAuthorPanel';
import { EssPayslipsPanel } from '@/components/payroll/EssPayslipsPanel';
import { PayrollAttendanceTab } from '@/components/payroll/PayrollAttendanceTab';
import { EmbedApiEmptyState } from '@/components/hrm/EmbedApiEmptyState';
import { TaxPolicyTab } from '@/components/payroll/TaxPolicyTab';
import { InsurancePolicyTab } from '@/components/payroll/InsurancePolicyTab';
import { SalaryTemplatesTab } from '@/components/payroll/SalaryTemplatesTab';
import { usePayrollDomainUi } from '@/hooks/usePayrollDomainUi';
import { resolveCalcListTabComponent } from '@/components/payroll/payrollDomainUi';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);

// Top navigation tabs - will use translations in component
const getTopTabs = (t: any) => [
  { id: 'overview', label: t('payroll.overview'), icon: LayoutGrid, color: 'bg-xevn-primary' },
  { id: 'components', label: t('payroll.components'), icon: ClipboardList, color: 'bg-xevn-primary', testId: 'payroll-tab-components' },
  {
    id: 'formulas',
    label: 'Công thức lương',
    icon: FunctionSquare,
    color: 'bg-xevn-primary',
    testId: 'payroll-tab-formulas',
  },
  { id: 'policy', label: t('payroll.policy'), icon: FileText, color: 'bg-xevn-primary', hasDropdown: true },
  { id: 'data', label: t('payroll.data'), icon: FileSpreadsheet, color: 'bg-xevn-primary', hasDropdown: true },
  { id: 'calculate', label: t('payroll.calculate'), icon: Calculator, color: 'bg-xevn-primary', hasDropdown: true },
  { id: 'payment', label: t('payroll.payment'), icon: CreditCard, color: 'bg-xevn-primary' },
  {
    id: 'ess',
    label: t('payroll.essTab', 'Phiếu của tôi'),
    icon: UserRound,
    color: 'bg-xevn-primary',
    testId: 'hdsd-pay-ess-tab',
  },
  { id: 'reports', label: t('payroll.reports'), icon: BarChart3, color: 'bg-xevn-primary' },
];

// Step cards for overview — Precision Motion brand chrome (no AI rainbow)
const getStepCards = (t: any) => [
  { 
    id: 1, 
    title: t('payroll.stepCards.step1'),
    subtitle: t('payroll.stepCards.watchVideo'),
    tone: 'bg-xevn-primary',
    icon: ClipboardList,
  },
  { 
    id: 2, 
    title: t('payroll.stepCards.step2'),
    subtitle: t('payroll.stepCards.watchVideo'),
    tone: 'bg-xevn-primary',
    icon: FileSpreadsheet,
  },
  { 
    id: 3, 
    title: t('payroll.stepCards.step3'),
    subtitle: t('payroll.stepCards.watchVideo'),
    tone: 'bg-xevn-primary',
    icon: FileText,
  },
  { 
    id: 4, 
    title: t('payroll.stepCards.step4'),
    subtitle: t('payroll.stepCards.watchVideo'),
    tone: 'bg-xevn-primary',
    icon: Calculator,
  },
  { 
    id: 5, 
    title: t('payroll.stepCards.step5'),
    subtitle: t('payroll.stepCards.watchVideo'),
    tone: 'bg-xevn-primary',
    icon: Wallet,
  },
];

// Salary distribution data - will use translations
const getSalaryDistributionData = (t: any) => [
  { range: t('payroll.salaryDistribution.above30'), count: 50 },
  { range: t('payroll.salaryDistribution.range20to30'), count: 120 },
  { range: t('payroll.salaryDistribution.range10to20'), count: 180 },
  { range: t('payroll.salaryDistribution.below10'), count: 80 },
];

// Income structure data - will use translations
const getIncomeStructureData = (t: any) => [
  { name: t('payroll.incomeStructure.baseSalary'), value: 54.6, color: '#1E40AF' },
  { name: t('payroll.incomeStructure.salesBonus'), value: 28.6, color: '#059669' },
  { name: t('payroll.incomeStructure.kpiBonus'), value: 14.3, color: '#D97706' },
  { name: t('payroll.incomeStructure.excellentBonus'), value: 1.8, color: '#2563EB' },
  { name: t('payroll.incomeStructure.occasionBonus'), value: 0.7, color: '#4B5563' },
];

// Policy dropdown items - will use translations
const getPolicyMenuItems = (t: any) => [
  { id: 'tax', label: t('payroll.taxPolicy.title') },
  { id: 'insurance', label: t('payroll.insurancePolicy.title') },
  { id: 'payroll-groups', label: 'Phân nhóm bảng lương' },
  { id: 'allowance', label: t('payroll.allowancePolicy') },
  { id: 'bonus', label: t('payroll.bonusPolicy') },
  { id: 'sales', label: t('payroll.salesSummary') },
];

// Data dropdown items - will use translations
const getDataMenuItems = (t: any) => [
  { id: 'data-attendance', label: t('payroll.dataAttendance') },
  { id: 'data-sales', label: t('payroll.dataSales') },
  { id: 'data-kpi', label: t('payroll.dataKpi') },
  { id: 'data-product', label: t('payroll.dataProduct') },
  { id: 'data-other-income', label: t('payroll.dataOtherIncome') },
  { id: 'data-deduction', label: t('payroll.dataDeduction') },
];

// Calculate dropdown items  

// Calculate dropdown items - will use translations
const getCalculateMenuItems = (t: any) => [
  { id: 'calc-create', label: t('payroll.createPayroll') },
  { id: 'calc-list', label: t('payroll.payrollList') },
  { id: 'calc-advance', label: t('payroll.advance') },
  { id: 'calc-template', label: t('payroll.template') },
  { id: 'calc-tax-settlement', label: t('payroll.taxSettlement.title') },
];

// Salary component interface
interface SalaryComponent {
  id: string;
  code: string;
  name: string;
  appliedUnit: string;
  componentType: string;
  nature: 'income' | 'deduction' | 'other';
  valueType: 'currency' | 'number' | 'percentage';
  formula?: string; // Excel-like formula, e.g., "=SUM(LUONG_THEO_CA,LUONG_THEO_GIO)"
}

// System salary components data (Danh m?c h? th?ng)
interface SystemSalaryComponent {
  id: string;
  code: string;
  name: string;
  componentType: string;
  nature: 'income' | 'deduction' | 'other';
  isTaxable: boolean;
}

const systemSalaryComponentsData: SystemSalaryComponent[] = [];

// Salary components ? API via SalaryComponentsTab (BR-EXEC-01)
const salaryComponentsData: SalaryComponent[] = [];


// Advance batch interface (B?ng t?m ?ng)
interface ApprovalStep {
  level: number;
  title: string;
  approverName: string;
  approverPosition: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  note?: string;
}

interface AdvanceBatch {
  id: string;
  createdDate: string;
  name: string;
  salaryPeriod: string;
  department: string;
  position: string;
  employeeCount: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  currentApprovalLevel: number;
  approvalSteps: ApprovalStep[];
}

// Advance employee interface
interface AdvanceEmployee {
  id: string;
  code: string;
  name: string;
  department: string;
  position: string;
  advanceAmount: number;
  note: string;
}

const advanceBatchesData: AdvanceBatch[] = [];


/** E2 ? advance employee mock removed (AC-E2-NOMOCK-01); live AdvanceRequestsTab. */
const advanceEmployeesData: AdvanceEmployee[] = [];

// Payroll summary batch interface
interface PayrollSummaryBatch {
  id: string;
  summaryDate: string;
  name: string;
  salaryPeriod: string;
  department: string;
  position: string;
}

// Payroll summary employee interface
interface PayrollSummaryEmployee {
  id: string;
  code: string;
  name: string;
  department: string;
  position: string;
  baseSalary: number;
  allowances: number;
  bonus: number;
  insurance: number;
  tax: number;
  deductions: number;
  netSalary: number;
}

// Payroll summary employee placeholders (legacy ? empty; live payslips via API)
const payrollSummaryEmployeesData: PayrollSummaryEmployee[] = [];

// Payroll summary batch placeholders (legacy dialogs ? live tab uses PayrollBatchesTab)
const payrollSummaryBatches: PayrollSummaryBatch[] = [];


// Tax Settlement interface
interface TaxSettlement {
  id: string;
  name: string;
  year: number;
  appliedUnit: string;
  monthlyTaxTables: { month: number; tableName: string }[];
  createdAt: string;
}

// Tax settlement data (empty - loaded from database)
const taxSettlementsData: TaxSettlement[] = [];

// Available units for tax settlement
const availableUnits = [
  'V?n ph�ng T?ng c�ng ty',
  'V?n ph�ng H� N?i',
  'V?n ph�ng ?� N?ng',
  'V?n ph�ng TP.HCM',
  'V?n ph�ng C?n Th?',
  'Trung t�m T? v?n & H? tr? kh�ch h�ng',
];

// Tax settlement employee row ? type + null-guards in taxSettlementFloatingUi (P0-b)
type TaxSettlementEmployee = TaxSettlementEmployeeRow;

// Tax settlement employees data (empty - loaded from database)
const taxSettlementEmployeesData: TaxSettlementEmployee[] = [];

// Tax policy participant interface
interface TaxPolicyParticipant {
  id: string;
  code: string;
  name: string;
  avatar?: string;
  position: string;
  policyType: 'progressive' | 'flat'; // Thu? theo bi?u l?y ti?n / Thu? theo h? s? ph?n tr?m c? ??nh
  policyName: string;
  effectiveDate: string;
  status: 'active' | 'inactive'; // Kh? d?ng / Kh�ng kh? d?ng
  createdBy: string;
  createdByPosition: string;
}

/** E2 ? tax policy mock removed; live path = TaxPolicyTab + API. */
const taxPolicyParticipantsData: TaxPolicyParticipant[] = [];

// Insurance policy participant interface
interface InsurancePolicyParticipant {
  id: string;
  code: string;
  name: string;
  avatar?: string;
  position: string;
  insuranceType: 'social' | 'health' | 'unemployment' | 'all'; // BHXH / BHYT / BHTN / T?t c?
  insuranceName: string;
  effectiveDate: string;
  expiryDate?: string;
  status: 'active' | 'inactive' | 'expired';
  socialInsuranceNumber?: string;
  healthInsuranceNumber?: string;
  baseSalary: number;
  createdBy: string;
  createdByPosition: string;
}

/** E2 ? insurance mock removed; live path = InsurancePolicyTab + API. */
const insurancePolicyParticipantsData: InsurancePolicyParticipant[] = [];

// Payment batch type
interface PaymentBatch {
  id: string;
  name: string;
  salaryPeriod: string;
  department: string;
  position: string;
  paymentMethod: string;
  status: 'paid' | 'pending';
}

const paymentBatchesData: PaymentBatch[] = [];


export default function Payroll() {
  const { t } = useTranslation();
  const { payslips: livePayslips, isLoading: livePayslipsLoading } = usePayrollPayslips();

  /** P0-c: race-prone tab/modal/form ? domain useReducer (shell/advance/taxUi/salary/batch). */
  const {
    payrollLiveBootstrapped,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedPayroll,
    setSelectedPayroll,
    monthFilter,
    setMonthFilter,
    selectedPaymentBatch,
    setSelectedPaymentBatch,
    showAddPaymentDialog,
    setShowAddPaymentDialog,
    selectedEmployeesToAdd,
    setSelectedEmployeesToAdd,
    showAddPayrollSummaryDialog,
    setShowAddPayrollSummaryDialog,
    showDeletePayrollBatchDialog,
    setShowDeletePayrollBatchDialog,
    payrollBatchToDelete,
    setPayrollBatchToDelete,
    selectedPayrollSummaryBatch,
    setSelectedPayrollSummaryBatch,
    showPayslipPrintDialog,
    setShowPayslipPrintDialog,
    printEmployeeIndex,
    setPrintEmployeeIndex,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    payrollDepartmentFilter,
    setPayrollDepartmentFilter,
    showAddAdvanceDialog,
    setShowAddAdvanceDialog,
    advanceFormData,
    setAdvanceFormData,
    selectedAdvanceBatch,
    setSelectedAdvanceBatch,
    selectedAdvanceBatches,
    setSelectedAdvanceBatches,
    showDeleteAdvanceDialog,
    setShowDeleteAdvanceDialog,
    advanceToDelete,
    setAdvanceToDelete,
    showEditAdvanceDialog,
    setShowEditAdvanceDialog,
    advanceToEdit,
    setAdvanceToEdit,
    showApprovalDialog,
    setShowApprovalDialog,
    approvalAction,
    setApprovalAction,
    approvalNote,
    setApprovalNote,
    taxSettlementSearch,
    setTaxSettlementSearch,
    taxSettlementUnitFilter,
    setTaxSettlementUnitFilter,
    selectedTaxSettlements,
    setSelectedTaxSettlements,
    showAddTaxSettlementDialog,
    setShowAddTaxSettlementDialog,
    taxSettlementFormData,
    setTaxSettlementFormData,
    selectedTaxSettlement,
    setSelectedTaxSettlement,
    taxSettlementDetailSearch,
    setTaxSettlementDetailSearch,
    taxSettlementDetailStatusFilter,
    setTaxSettlementDetailStatusFilter,
    taxSettlementDetailUnitFilter,
    setTaxSettlementDetailUnitFilter,
    selectedTaxSettlementEmployees,
    setSelectedTaxSettlementEmployees,
    showTaxRefundDialog,
    setShowTaxRefundDialog,
    taxRefundFormData,
    setTaxRefundFormData,
    showTaxDeductionDialog,
    setShowTaxDeductionDialog,
    taxDeductionFormData,
    setTaxDeductionFormData,
    showDeleteTaxEmployeeDialog,
    setShowDeleteTaxEmployeeDialog,
    taxEmployeeToDelete,
    setTaxEmployeeToDelete,
    showBulkDeleteTaxEmployeeDialog,
    setShowBulkDeleteTaxEmployeeDialog,
    activeDataSubTab,
    setActiveDataSubTab,
    activeCalcSubTab,
    setActiveCalcSubTab,
    activePolicySubTab,
    setActivePolicySubTab,
    selectedPayrollBatches,
    setSelectedPayrollBatches,
    selectedSalaryComponents,
    setSelectedSalaryComponents,
    salaryComponentStatusFilter,
    setSalaryComponentStatusFilter,
    salaryComponentUnitFilter,
    setSalaryComponentUnitFilter,
    salaryComponentsPage,
    setSalaryComponentsPage,
    showEditSalaryComponentDialog,
    setShowEditSalaryComponentDialog,
    showDeleteSalaryComponentDialog,
    setShowDeleteSalaryComponentDialog,
    salaryComponentToEdit,
    setSalaryComponentToEdit,
    salaryComponentToDelete,
    setSalaryComponentToDelete,
    editSalaryComponentForm,
    setEditSalaryComponentForm,
    showSystemComponentsDialog,
    setShowSystemComponentsDialog,
    systemComponentsSearch,
    setSystemComponentsSearch,
    systemComponentsTypeFilter,
    setSystemComponentsTypeFilter,
    selectedSystemComponents,
    setSelectedSystemComponents,
    systemComponentsPage,
    setSystemComponentsPage,
    bootstrapLivePayslips,
    openEditSalaryComponent,
    closeEditSalaryComponent,
    onEditSalaryComponentOpenChange,
    openDeleteSalaryComponent,
    closeDeleteSalaryComponent,
    onDeleteSalaryComponentOpenChange,
    closeSystemComponents,
    onSystemComponentsOpenChange,
    openAddTaxSettlement,
    closeAddTaxSettlement,
    onAddTaxSettlementOpenChange,
    openTaxRefund,
    closeTaxRefund,
    onTaxRefundOpenChange,
    openTaxDeduction,
    closeTaxDeduction,
    onTaxDeductionOpenChange,
    openDeleteTaxEmployee,
    closeDeleteTaxEmployee,
    onDeleteTaxEmployeeOpenChange,
    openBulkDeleteTaxEmployee,
    closeBulkDeleteTaxEmployee,
    onBulkDeleteTaxEmployeeOpenChange,
    closeAddAdvance,
    onAddAdvanceOpenChange,
    closeEditAdvance,
    onEditAdvanceOpenChange,
    closeDeleteAdvance,
    onDeleteAdvanceOpenChange,
    closeApproval,
    onApprovalOpenChange,
    closeAddPayment,
    onAddPaymentOpenChange,
    closeDeletePayrollBatch,
    onDeletePayrollBatchOpenChange,
    onPayslipPrintOpenChange,
  } = usePayrollDomainUi<
    AdvanceBatch,
    TaxSettlement,
    TaxSettlementEmployee,
    SalaryComponent,
    PaymentBatch,
    PayrollSummaryBatch
  >();

  useEffect(() => {
    if (payrollLiveBootstrapped || livePayslipsLoading) return;
    if (livePayslips.length > 0) {
      bootstrapLivePayslips();
    }
  }, [livePayslips.length, livePayslipsLoading, payrollLiveBootstrapped, bootstrapLivePayslips]);

  // Tax settlement data (list) ? kh�ng g?p v�o UI reducer
  const [taxSettlements, setTaxSettlements] = useState<TaxSettlement[]>(taxSettlementsData);
  /** Floating UI dialog s?a NV quy?t to�n thu? ? lu�n init object (UX-02 / P0-b / C1 must_keep). */
  const [taxSettlementFloatingUi, setTaxSettlementFloatingUi] = useState(
    createEmptyTaxSettlementFloatingUiState,
  );
  const showEditTaxEmployeeDialog = taxSettlementFloatingUi?.showEditDialog === true;
  const taxEmployeeToEdit = taxSettlementFloatingUi?.employeeToEdit ?? null;
  const taxEmployeeEditForm = taxSettlementFloatingUi?.editForm ?? createEmptyTaxSettlementFloatingUiState().editForm;
  const [taxSettlementEmployees, setTaxSettlementEmployees] = useState<TaxSettlementEmployee[]>(taxSettlementEmployeesData);

  // Advance dialog unit options (API-backed list deferred ? empty until wired)
  const payrollDepartments = [...new Set(payrollSummaryEmployeesData.map((emp) => emp.department))];

  const filteredRecords: any[] = []; // Payroll records now managed via PayrollBatchesTab / live payslips API

  const livePayslipNetTotal = livePayslips.reduce((sum, row) => {
    const n = Number.parseFloat(String(row.net_amount ?? 0));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
  const livePayslipTaxTotal = livePayslips.reduce((sum, row) => {
    const n = Number.parseFloat(String(row.deduction_amount ?? 0));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  const filteredPaymentBatches = paymentBatchesData.filter(
    (batch) =>
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tax policy states (mock policy tabs ? outside P0-c race clusters)
  const [taxPolicyTab, setTaxPolicyTab] = useState<'participants' | 'pending' | 'settings'>('participants');
  const [taxPolicySearch, setTaxPolicySearch] = useState('');
  const [taxPolicyDateFilter, setTaxPolicyDateFilter] = useState('');
  const [showTaxPolicyDateFilter, setShowTaxPolicyDateFilter] = useState(true);
  const [taxPolicySortOrder, setTaxPolicySortOrder] = useState<'newest' | 'effective-date' | 'employee-id-asc' | 'employee-id-desc'>('newest');
  const [taxPolicyStatusFilter, setTaxPolicyStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [taxPolicyTypeFilter, setTaxPolicyTypeFilter] = useState<'all' | 'progressive' | 'flat'>('all');
  const [selectedTaxPolicyEmployees, setSelectedTaxPolicyEmployees] = useState<string[]>([]);

  // Insurance policy states
  const [insurancePolicyTab, setInsurancePolicyTab] = useState<'participants' | 'pending' | 'settings'>('participants');
  const [insurancePolicySearch, setInsurancePolicySearch] = useState('');
  const [insurancePolicyDateFilter, setInsurancePolicyDateFilter] = useState('');
  const [showInsurancePolicyDateFilter, setShowInsurancePolicyDateFilter] = useState(true);
  const [insurancePolicySortOrder, setInsurancePolicySortOrder] = useState<'newest' | 'effective-date' | 'employee-id-asc' | 'employee-id-desc'>('newest');
  const [insurancePolicyStatusFilter, setInsurancePolicyStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [insurancePolicyTypeFilter, setInsurancePolicyTypeFilter] = useState<'all' | 'social' | 'health' | 'unemployment'>('all');
  const [selectedInsurancePolicyEmployees, setSelectedInsurancePolicyEmployees] = useState<string[]>([]);
  const [showAddInsurancePolicyParticipantDialog, setShowAddInsurancePolicyParticipantDialog] = useState(false);
  const [insurancePolicyParticipantSearch, setInsurancePolicyParticipantSearch] = useState('');
  const [selectedInsurancePolicyParticipantsToAdd, setSelectedInsurancePolicyParticipantsToAdd] = useState<string[]>([]);
  const [insurancePolicyParticipantDepartmentFilter, setInsurancePolicyParticipantDepartmentFilter] = useState('all');
  const [insurancePolicyParticipantInsuranceType, setInsurancePolicyParticipantInsuranceType] = useState<'social' | 'health' | 'unemployment' | 'all'>('all');
  const [insurancePolicyParticipantEffectiveDate, setInsurancePolicyParticipantEffectiveDate] = useState('');
  const [showAddTaxPolicyParticipantDialog, setShowAddTaxPolicyParticipantDialog] = useState(false);
  const [taxPolicyParticipantSearch, setTaxPolicyParticipantSearch] = useState('');
  const [selectedTaxPolicyParticipantsToAdd, setSelectedTaxPolicyParticipantsToAdd] = useState<string[]>([]);
  const [taxPolicyParticipantDepartmentFilter, setTaxPolicyParticipantDepartmentFilter] = useState('all');
  const [taxPolicyParticipantPolicyType, setTaxPolicyParticipantPolicyType] = useState<'progressive' | 'flat'>('progressive');
  const [taxPolicyParticipantEffectiveDate, setTaxPolicyParticipantEffectiveDate] = useState('');

  // E2 — orphan dialog mock emptied; live TaxPolicyTab uses useEmployees (no mock NV islands)
  const availableTaxPolicyEmployees: {
    id: string;
    code: string;
    name: string;
    position: string;
    department: string;
    avatar: string;
  }[] = [];

  // Filter available employees for tax policy
  const filteredTaxPolicyEmployeesToAdd = availableTaxPolicyEmployees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(taxPolicyParticipantSearch.toLowerCase()) ||
      emp.code.toLowerCase().includes(taxPolicyParticipantSearch.toLowerCase());
    const matchesDepartment = taxPolicyParticipantDepartmentFilter === 'all' || emp.department === taxPolicyParticipantDepartmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // Toggle tax policy employee selection
  const toggleTaxPolicyParticipantToAddSelection = (empId: string) => {
    setSelectedTaxPolicyParticipantsToAdd(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  // Toggle select all tax policy employees
  const toggleSelectAllTaxPolicyParticipantsToAdd = () => {
    if (selectedTaxPolicyParticipantsToAdd.length === filteredTaxPolicyEmployeesToAdd.length) {
      setSelectedTaxPolicyParticipantsToAdd([]);
    } else {
      setSelectedTaxPolicyParticipantsToAdd(filteredTaxPolicyEmployeesToAdd.map(emp => emp.id));
    }
  };

  // Confirm add tax policy participants
  const confirmAddTaxPolicyParticipants = () => {
    // In real app, this would call API to add selected employees to tax policy
    console.log('Adding employees to tax policy:', selectedTaxPolicyParticipantsToAdd, 'with policy type:', taxPolicyParticipantPolicyType, 'effective date:', taxPolicyParticipantEffectiveDate);
    setShowAddTaxPolicyParticipantDialog(false);
    setSelectedTaxPolicyParticipantsToAdd([]);
    setTaxPolicyParticipantSearch('');
    setTaxPolicyParticipantDepartmentFilter('all');
    setTaxPolicyParticipantPolicyType('progressive');
    setTaxPolicyParticipantEffectiveDate('');
  };

  // Get unique departments from available employees
  const taxPolicyDepartments = [...new Set(availableTaxPolicyEmployees.map(emp => emp.department))];

  const filteredPayrollSummaryBatches = payrollSummaryBatches.filter(
    (batch) =>
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePayrollBatchSelection = (batchId: string) => {
    setSelectedPayrollBatches(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };

  const toggleSelectAllPayrollBatches = () => {
    if (selectedPayrollBatches.length === filteredPayrollSummaryBatches.length) {
      setSelectedPayrollBatches([]);
    } else {
      setSelectedPayrollBatches(filteredPayrollSummaryBatches.map(b => b.id));
    }
  };
  // Stats
  const totalNet =
    livePayslips.length > 0
      ? livePayslipNetTotal
      : filteredRecords.reduce((sum, r) => sum + r.netSalary, 0);
  const totalTax =
    livePayslips.length > 0
      ? livePayslipTaxTotal
      : filteredRecords.reduce((sum, r) => sum + r.tax, 0);
  const totalInsurance = filteredRecords.reduce((sum, r) => sum + r.insurance, 0);

  const paidCount = filteredRecords.filter((r) => r.status === 'paid').length;

  // Memoized navigation items with translations
  const topTabs = getTopTabs(t);
  const stepCards = getStepCards(t);
  const policyMenuItems = getPolicyMenuItems(t);
  const dataMenuItems = getDataMenuItems(t);
  const calculateMenuItems = getCalculateMenuItems(t);
  const salaryDistributionData = getSalaryDistributionData(t);
  const incomeStructureData = getIncomeStructureData(t);

  // Render tab button
  const renderTabButton = (tab: typeof topTabs[0]) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;

    const button = (
      <button
        key={tab.id}
        onClick={() => !tab.hasDropdown && setActiveTab(tab.id)}
        data-testid={'testId' in tab && tab.testId ? String(tab.testId) : `payroll-tab-${tab.id}`}
        className={cn(
          'flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all group touch-target',
          isActive
            ? 'bg-xevn-primary/10 text-xevn-text'
            : 'text-xevn-textSecondary hover:bg-xevn-primary/5 hover:text-xevn-text'
        )}
      >
        <div className={cn(
          'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
          tab.color
        )}>
          <Icon className="w-3 h-3 text-white" />
        </div>
        <span className="hidden sm:inline">{tab.label}</span>
        {tab.hasDropdown && <ChevronDown className="w-3.5 h-3.5 hidden sm:block" />}
      </button>
    );

    if (tab.hasDropdown) {
      let menuItems: { id: string; label: string }[] = [];
      if (tab.id === 'policy') menuItems = policyMenuItems;
      else if (tab.id === 'data') menuItems = dataMenuItems;
      else if (tab.id === 'calculate') menuItems = calculateMenuItems;

      return (
        <DropdownMenu key={tab.id}>
          <DropdownMenuTrigger asChild>
            {button}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {menuItems.map(item => (
              <DropdownMenuItem 
                key={item.id}
                className={cn(
                  tab.id === 'policy' && activePolicySubTab === item.id && 'text-xevn-primary font-medium',
                  tab.id === 'data' && activeDataSubTab === item.id && 'text-xevn-primary font-medium',
                  tab.id === 'calculate' && activeCalcSubTab === item.id && 'text-xevn-primary font-medium'
                )}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'policy') {
                    setActivePolicySubTab(item.id);
                  }
                  if (tab.id === 'data') {
                    setActiveDataSubTab(item.id);
                  }
                  if (tab.id === 'calculate') {
                    setActiveCalcSubTab(item.id);
                  }
                }}
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return button;
  };

  // Render overview content
  const renderOverview = () => {
    return (
      <div className="space-y-6 p-3 md:p-6" data-testid="pay-overview-precision">
        {/* Welcome Banner — Precision Motion */}
         <div className="rounded-card border border-xevn-border bg-xevn-primary/5 p-4 md:p-6">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
             <div>
               <h2 className="text-[20px] font-bold font-display text-xevn-text">{t('payroll.overviewWelcome.greeting')}</h2>
               <p className="text-xevn-textSecondary text-sm">
                 {t('payroll.overviewWelcome.description')}
               </p>
             </div>
             <Button variant="outline" className="gap-2 shrink-0 w-fit border-xevn-border text-xevn-primary hover:bg-xevn-primary/5" size="sm">
               <Play className="w-4 h-4" />
               {t('payroll.overviewWelcome.beginnerGuide')}
             </Button>
           </div>

          {/* Step Cards — hide onboarding wizard when live payslips exist (D-HRM-PAY-EMPTY-01) */}
          {livePayslips.length === 0 ? (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {stepCards.map((step) => {
              const Icon = step.icon;
              return (
                 <Card 
                   key={step.id} 
                   className={cn(
                     'overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] min-w-[140px] sm:min-w-0 flex-1 border-0 shadow-soft',
                     step.tone
                   )}
                 >
                  <CardContent className="p-4 text-white">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-tight font-display">{step.id}. {step.title}</p>
                        <p className="text-xs text-white/90 mt-1">{step.subtitle}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          ) : (
            <p className="text-sm text-xevn-textSecondary">
              {livePayslips.length} {t('payroll.payslipCount', 'phiếu lương')} —{' '}
              <button
                type="button"
                className="text-xevn-primary underline-offset-2 hover:underline font-medium"
                onClick={() => {
                  setActiveTab('calculate');
                  setActiveCalcSubTab('calc-list');
                }}
              >
                {t('payroll.viewPayrollList', 'Xem danh sách')}
              </button>
            </p>
          )}
        </div>

        {/* Main Grid */}
         <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Salary Summary Card */}
          <div className="md:col-span-5">
            <Card className="rounded-card border border-xevn-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-xevn-primary flex items-center justify-center">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[20px] font-bold font-display text-xevn-text">{t('payroll.salarySummary.title')}</h3>
                    <p className="text-sm text-xevn-textSecondary">{t('payroll.salarySummary.officeThisMonth')}</p>
                    
                    <div className="grid grid-cols-3 gap-6 mt-4">
                      <div>
                        <p className="text-xs text-xevn-textSecondary uppercase">{t('payroll.salarySummary.totalSalary')}</p>
                        <p className="text-2xl font-bold text-xevn-primary">
                          {(totalNet / 1000000).toFixed(0)}
                        </p>
                        <p className="text-xs text-xevn-textSecondary">{t('payroll.salarySummary.millionVnd')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-xevn-textSecondary uppercase">{t('payroll.salarySummary.personalTax')}</p>
                        <p className="text-2xl font-bold text-warning">
                          {(totalTax / 1000000).toFixed(0)}
                        </p>
                        <p className="text-xs text-xevn-textSecondary">{t('payroll.salarySummary.millionVnd')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-xevn-textSecondary uppercase">{t('payroll.salarySummary.insurance')}</p>
                        <p className="text-2xl font-bold text-xevn-text">
                          {(totalInsurance / 1000000).toFixed(0)}
                        </p>
                        <p className="text-xs text-xevn-textSecondary">{t('payroll.salarySummary.millionVnd')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payroll Feedback Card */}
          <div className="md:col-span-4">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('payroll.feedback.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <EmbedApiEmptyState
                  title={t('payroll.feedback.emptyTitle', 'Ch?a c� ph?n h?i b?ng l??ng')}
                  body={t('payroll.feedback.emptyBody', 'Ph?n h?i nh�n vi�n s? hi?n th? khi c� d? li?u t? hrm-api.')}
                />
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="md:col-span-3 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-xevn-textSecondary">{t('payroll.quickStats.paid')}</p>
                    <p className="text-xl font-bold text-xevn-text">{paidCount} / {filteredRecords.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-xevn-textSecondary">{t('payroll.quickStats.pendingApproval')}</p>
                    <p className="text-xl font-bold text-xevn-text">{filteredRecords.length - paidCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Row */}
         <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
           {/* Salary Distribution Chart */}
           <div className="md:col-span-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[20px] font-bold font-display text-xevn-text">{t('payroll.salaryAnalysis.title')}</CardTitle>
                    <p className="text-xs text-xevn-textSecondary">{t('payroll.salaryAnalysis.subtitle')}</p>
                  </div>
                  <span className="text-xs text-xevn-textSecondary">{t('payroll.salaryAnalysis.salaryLevel')}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salaryDistributionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="range" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Income Structure Chart */}
          <div className="md:col-span-6">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-[20px] font-bold font-display text-xevn-text">{t('payroll.incomeStructure.title')}</CardTitle>
                  <p className="text-xs text-xevn-textSecondary">{t('payroll.salaryAnalysis.subtitle')}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="h-[200px] w-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomeStructureData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {incomeStructureData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {incomeStructureData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // Legacy salary-component dialogs ? state t? usePayrollDomainUi (SalaryComponentsTab = live Add D5)
  const salaryComponentsPerPage = 25;

  // Available units for multi-select (tax settlement / filters)
  const availableUnits = [
    'V?n ph�ng H� N?i',
    'V?n ph�ng C� Mau',
    'V?n ph�ng TP.HCM',
    'V?n ph�ng ?� N?ng',
    'C�ng ty TNHH ??i Th�nh',
  ];

  const systemComponentsPerPage = 25;
  
  // Filtered system components
  const filteredSystemComponents = systemSalaryComponentsData.filter((component) => {
    const matchesSearch = component.code.toLowerCase().includes(systemComponentsSearch.toLowerCase()) ||
      component.name.toLowerCase().includes(systemComponentsSearch.toLowerCase());
    const matchesType = systemComponentsTypeFilter === 'all' || component.componentType === systemComponentsTypeFilter;
    return matchesSearch && matchesType;
  });
  
  // Paginated system components
  const paginatedSystemComponents = filteredSystemComponents.slice(
    (systemComponentsPage - 1) * systemComponentsPerPage,
    systemComponentsPage * systemComponentsPerPage
  );
  
  const totalSystemComponentsPages = Math.ceil(filteredSystemComponents.length / systemComponentsPerPage);
  
  // Toggle system component selection
  const toggleSystemComponentSelection = (componentId: string) => {
    setSelectedSystemComponents(prev => 
      prev.includes(componentId) 
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };
  
  // Toggle select all system components
  const toggleSelectAllSystemComponents = () => {
    if (selectedSystemComponents.length === paginatedSystemComponents.length) {
      setSelectedSystemComponents([]);
    } else {
      setSelectedSystemComponents(paginatedSystemComponents.map(c => c.id));
    }
  };
  
  // Confirm add system components
  const confirmAddSystemComponents = () => {
    // In real app, this would call API to add selected components
    console.log('Adding system components:', selectedSystemComponents);
    closeSystemComponents();
  };
  
  // Get unique component types for filter
  const systemComponentTypes = [...new Set(systemSalaryComponentsData.map(c => c.componentType))];

  // Available components for formula autocomplete
  const formulaAvailableComponents = useMemo(() => 
    salaryComponentsData.map(c => ({ code: c.code, name: c.name })),
    []
  );

  // Filtered salary components
  const filteredSalaryComponents = salaryComponentsData.filter(
    (component) =>
      component.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginated salary components
  const paginatedSalaryComponents = filteredSalaryComponents.slice(
    (salaryComponentsPage - 1) * salaryComponentsPerPage,
    salaryComponentsPage * salaryComponentsPerPage
  );

  const totalSalaryComponentsPages = Math.ceil(filteredSalaryComponents.length / salaryComponentsPerPage);

  // Toggle salary component selection
  const toggleSalaryComponentSelection = (componentId: string) => {
    setSelectedSalaryComponents(prev => 
      prev.includes(componentId) 
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  // Toggle select all salary components
  const toggleSelectAllSalaryComponents = () => {
    if (selectedSalaryComponents.length === paginatedSalaryComponents.length) {
      setSelectedSalaryComponents([]);
    } else {
      setSelectedSalaryComponents(paginatedSalaryComponents.map(c => c.id));
    }
  };

  // Get nature badge for salary component
  const getNatureBadge = (nature: SalaryComponent['nature']) => {
    switch (nature) {
      case 'income':
        return <span className="text-primary">{t('payroll.salaryComponents.income')}</span>;
      case 'deduction':
        return <span className="text-destructive">{t('payroll.salaryComponents.deduction')}</span>;
      case 'other':
        return <span className="text-muted-foreground">{t('payroll.salaryComponents.other')}</span>;
    }
  };

  // Get value type display
  const getValueTypeDisplay = (valueType: SalaryComponent['valueType']) => {
    switch (valueType) {
      case 'currency':
        return t('payroll.salaryComponents.currency');
      case 'number':
        return t('payroll.salaryComponents.number');
      case 'percentage':
        return t('payroll.salaryComponents.percentage');
    }
  };

  // Handle edit salary component ? atomic OPEN (P0-c race fix)
  const handleEditSalaryComponent = (component: SalaryComponent) => {
    openEditSalaryComponent(component, {
      code: component.code,
      name: component.name,
      appliedUnit: component.appliedUnit,
      componentType: component.componentType,
      nature: component.nature,
      valueType: component.valueType,
      formula: component.formula || '',
    });
  };

  // Handle delete salary component ? atomic OPEN
  const handleDeleteSalaryComponent = (component: SalaryComponent) => {
    openDeleteSalaryComponent(component);
  };

  // Confirm delete salary component ? atomic CLOSE
  const confirmDeleteSalaryComponent = () => {
    // In real app, this would call API to delete
    console.log('Deleting salary component:', salaryComponentToDelete?.id);
    closeDeleteSalaryComponent();
  };

  // Save edited salary component ? atomic CLOSE (reset form)
  const saveEditedSalaryComponent = () => {
    // In real app, this would call API to update
    console.log('Saving salary component:', salaryComponentToEdit?.id, editSalaryComponentForm);
    closeEditSalaryComponent();
  };

  const renderDataContent = () => {
    switch (activeDataSubTab) {
      case 'data-attendance':
        return <PayrollAttendanceTab />;
      case 'data-sales':
        return <SalesDataTab />;
      default:
        return (
          <div className="p-6 xevn-safe-inline" data-testid="pay-data-stub-precision">
            <Card className="rounded-card border border-xevn-border bg-xevn-surface p-8 text-center space-y-3">
              <h2 className="text-[20px] font-bold font-display text-xevn-text">
                {dataMenuItems.find(m => m.id === activeDataSubTab)?.label}
              </h2>
              <p className="text-sm text-xevn-textSecondary max-w-lg mx-auto">
                {t('payroll.common.featureInDev', { name: dataMenuItems.find(m => m.id === activeDataSubTab)?.label })}
              </p>
            </Card>
          </div>
        );
    }
  };

  // Filter tax settlements
  const filteredTaxSettlements = taxSettlements.filter(ts => {
    const matchesSearch = ts.name.toLowerCase().includes(taxSettlementSearch.toLowerCase());
    const matchesUnit = taxSettlementUnitFilter === 'all' || ts.appliedUnit === taxSettlementUnitFilter;
    return matchesSearch && matchesUnit;
  });

  // Toggle tax settlement selection
  const toggleTaxSettlementSelection = (id: string) => {
    setSelectedTaxSettlements(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Toggle select all tax settlements
  const toggleSelectAllTaxSettlements = () => {
    if (selectedTaxSettlements.length === filteredTaxSettlements.length) {
      setSelectedTaxSettlements([]);
    } else {
      setSelectedTaxSettlements(filteredTaxSettlements.map(ts => ts.id));
    }
  };

  // Generate tax settlement name
  const generateTaxSettlementName = (year: number, units: string[]) => {
    if (units.length === 1) {
      return `${t('payroll.taxSettlement.title')} ${year} - ${units[0]}`;
    }
    return `${t('payroll.taxSettlement.title')} ${year} - ${units.length} ${t('payroll.common.appliedUnit').toLowerCase()}`;
  };

  // Handle add tax settlement
  const handleAddTaxSettlement = () => {
    const { year, appliedUnits, monthlyTaxTables } = taxSettlementFormData;
    
    appliedUnits.forEach((unit, index) => {
      const newSettlement: TaxSettlement = {
        id: `ts-${Date.now()}-${index}`,
        name: `${t('payroll.taxSettlement.title')} ${year} - ${unit}`,
        year,
        appliedUnit: unit,
        monthlyTaxTables: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          tableName: monthlyTaxTables[i + 1] || `${t('payroll.taxSettlement.monthlyTaxTable')} ${i + 1}/${year} - ${unit}`,
        })),
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTaxSettlements(prev => [newSettlement, ...prev]);
    });

    closeAddTaxSettlement();
  };

  // Remove unit from selection
  const removeAppliedUnit = (unit: string) => {
    setTaxSettlementFormData(prev => ({
      ...prev,
      appliedUnits: prev.appliedUnits.filter(u => u !== unit),
    }));
  };

  // Render tax settlement list
  const renderTaxSettlementList = () => {
    return (
      <div className="p-6">
        <Card>
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between gap-4">
             <h2 className="text-lg font-semibold">{t('payroll.taxSettlement.title')}</h2>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => openAddTaxSettlement()}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('payroll.common.addNew')}
            </Button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                 placeholder={t('payroll.common.search')}
                className="pl-9"
                value={taxSettlementSearch}
                onChange={(e) => setTaxSettlementSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={taxSettlementUnitFilter} onValueChange={setTaxSettlementUnitFilter}>
                <SelectTrigger className="w-[200px]">
                   <SelectValue placeholder={t('payroll.paymentTab.allUnits')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('payroll.paymentTab.allUnits')}</SelectItem>
                  {availableUnits.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-10 p-3">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={selectedTaxSettlements.length === filteredTaxSettlements.length && filteredTaxSettlements.length > 0}
                      onChange={toggleSelectAllTaxSettlements}
                    />
                  </th>
                   <th className="text-left p-3 font-medium text-xs text-muted-foreground">{t('payroll.taxSettlement.name')}</th>
                  <th className="text-left p-3 font-medium text-xs text-muted-foreground">{t('payroll.taxSettlement.year')}</th>
                  <th className="text-left p-3 font-medium text-xs text-muted-foreground">{t('payroll.taxSettlement.appliedUnit')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTaxSettlements.map((settlement) => (
                  <tr key={settlement.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={selectedTaxSettlements.includes(settlement.id)}
                        onChange={() => toggleTaxSettlementSelection(settlement.id)}
                      />
                    </td>
                    <td 
                      className="p-3 text-sm text-primary hover:underline cursor-pointer"
                      onClick={() => setSelectedTaxSettlement(settlement)}
                    >
                      {settlement.name}
                    </td>
                    <td className="p-3 text-sm">{settlement.year}</td>
                    <td className="p-3 text-sm text-muted-foreground">{settlement.appliedUnit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t flex items-center justify-end gap-4">
            <div className="flex items-center gap-2">
               <span className="text-sm text-muted-foreground">{t('payroll.common.recordsPerPage')}</span>
              <Select defaultValue="25">
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-muted-foreground">1 - {filteredTaxSettlements.length} {t('payroll.common.records')}</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Add Tax Settlement Dialog */}
        <Dialog open={showAddTaxSettlementDialog} onOpenChange={onAddTaxSettlementOpenChange}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('payroll.taxSettlement.addTitle')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Year */}
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right">
                  {t('payroll.taxSettlement.year')} <span className="text-destructive">*</span>
                </Label>
                <div className="col-span-2">
                  <div className="relative w-32">
                    <Input
                      type="number"
                      value={taxSettlementFormData.year}
                      onChange={(e) => setTaxSettlementFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                      className="pr-8"
                    />
                    <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Applied Units */}
              <div className="grid grid-cols-3 items-start gap-4">
                <Label className="text-right pt-2">
                   {t('payroll.taxSettlement.appliedUnit')} <span className="text-destructive">*</span>
                </Label>
                <div className="col-span-2 space-y-2">
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (!taxSettlementFormData.appliedUnits.includes(value)) {
                        setTaxSettlementFormData(prev => ({
                          ...prev,
                          appliedUnits: [...prev.appliedUnits, value],
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('payroll.taxSettlement.selectUnit')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.filter(u => !taxSettlementFormData.appliedUnits.includes(u)).map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    {taxSettlementFormData.appliedUnits.map(unit => (
                      <Badge key={unit} variant="secondary" className="flex items-center gap-1">
                        {unit}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeAppliedUnit(unit)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-right">
                  {t('payroll.taxSettlement.settlementName')} <span className="text-destructive">*</span>
                </Label>
                <div className="col-span-2">
                  <Input
                    value={taxSettlementFormData.name || generateTaxSettlementName(taxSettlementFormData.year, taxSettlementFormData.appliedUnits)}
                    onChange={(e) => setTaxSettlementFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('payroll.taxSettlement.settlementName')}
                  />
                </div>
              </div>

              {/* Monthly Tax Tables */}
              <div className="grid grid-cols-3 items-start gap-4">
                <Label className="text-right pt-2">
                  {t('payroll.taxSettlement.monthlyTaxTable')} <span className="text-destructive">*</span>
                </Label>
                <div className="col-span-2">
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                           <th className="text-left p-2 text-xs font-medium text-muted-foreground w-24">{t('payroll.taxSettlement.month')}</th>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">{t('payroll.taxSettlement.monthlyTaxTable')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <tr key={month} className="border-t">
                            <td className="p-2 text-sm">{t('payroll.taxSettlement.month')} {month}</td>
                            <td className="p-2">
                              <Select
                                value={taxSettlementFormData.monthlyTaxTables[month] || ''}
                                onValueChange={(value) => setTaxSettlementFormData(prev => ({
                                  ...prev,
                                  monthlyTaxTables: { ...prev.monthlyTaxTables, [month]: value },
                                }))}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder={`${t('payroll.taxSettlement.monthlyTaxTable')} ${month}/${taxSettlementFormData.year}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {taxSettlementFormData.appliedUnits.length > 0 ? (
                                    taxSettlementFormData.appliedUnits.map(unit => (
                                       <SelectItem 
                                        key={`${month}-${unit}`} 
                                        value={`${t('payroll.taxSettlement.monthlyTaxTable')} ${month}/${taxSettlementFormData.year} - ${unit}`}
                                      >
                                        {t('payroll.taxSettlement.monthlyTaxTable')} {month}/{taxSettlementFormData.year} - {unit}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="none" disabled>{t('payroll.taxSettlement.selectUnitFirst')}</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => closeAddTaxSettlement()}>
                {t('payroll.common.cancel')}
              </Button>
              <Button
                onClick={handleAddTaxSettlement}
                disabled={taxSettlementFormData.appliedUnits.length === 0}
              >
                {t('payroll.common.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Filter tax settlement employees for detail view (null-safe ? UX-02)
  const filteredTaxSettlementEmployees = taxSettlementEmployees
    .map((emp) => normalizeTaxSettlementEmployee(emp))
    .filter((emp): emp is TaxSettlementEmployee => emp != null)
    .filter((emp) => matchesTaxSettlementEmployeeSearch(emp, taxSettlementDetailSearch));

  // Toggle tax settlement employee selection
  const toggleTaxSettlementEmployeeSelection = (id: string) => {
    setSelectedTaxSettlementEmployees(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Toggle select all tax settlement employees
  const toggleSelectAllTaxSettlementEmployees = () => {
    if (selectedTaxSettlementEmployees.length === filteredTaxSettlementEmployees.length) {
      setSelectedTaxSettlementEmployees([]);
    } else {
      setSelectedTaxSettlementEmployees(filteredTaxSettlementEmployees.map(e => e.id));
    }
  };

  // Open edit tax employee dialog (safe init ? kh�ng crash khi row thi?u field)
  const openEditTaxEmployeeDialog = (employee: TaxSettlementEmployee | null | undefined) => {
    setTaxSettlementFloatingUi((prev) => openTaxEmployeeEditFloatingUi(prev, employee));
  };

  // Handle save tax employee edit
  const handleSaveTaxEmployeeEdit = () => {
    if (!taxEmployeeToEdit) return;

    const form = taxEmployeeEditForm;
    const totalDeduction =
      form.familyDeduction +
      form.unemploymentInsurance +
      form.socialInsurance +
      form.healthInsurance;

    const taxableIncomeAfterDeduction = Math.max(0, form.totalTaxableIncome - totalDeduction);

    setTaxSettlementEmployees((prev) =>
      prev.map((emp) =>
        emp.id === taxEmployeeToEdit.id
          ? {
              ...emp,
              ...form,
              totalDeduction,
              taxableIncomeAfterDeduction,
            }
          : emp,
      ),
    );

    setTaxSettlementFloatingUi(closeTaxEmployeeEditFloatingUi());
  };

  // Calculate totals for tax settlement detail
  const taxSettlementTotals = useMemo(() => {
    return filteredTaxSettlementEmployees.reduce((acc, emp) => ({
      totalTaxableIncome: acc.totalTaxableIncome + emp.totalTaxableIncome,
      familyDeduction: acc.familyDeduction + emp.familyDeduction,
      unemploymentInsurance: acc.unemploymentInsurance + emp.unemploymentInsurance,
      socialInsurance: acc.socialInsurance + emp.socialInsurance,
      healthInsurance: acc.healthInsurance + emp.healthInsurance,
      totalDeduction: acc.totalDeduction + emp.totalDeduction,
      taxableIncomeAfterDeduction: acc.taxableIncomeAfterDeduction + emp.taxableIncomeAfterDeduction,
      taxPayable: acc.taxPayable + emp.taxPayable,
      taxPaid: acc.taxPaid + emp.taxPaid,
    }), {
      totalTaxableIncome: 0,
      familyDeduction: 0,
      unemploymentInsurance: 0,
      socialInsurance: 0,
      healthInsurance: 0,
      totalDeduction: 0,
      taxableIncomeAfterDeduction: 0,
      taxPayable: 0,
      taxPaid: 0,
    });
  }, [filteredTaxSettlementEmployees]);

  // Render tax settlement detail view
  const renderTaxSettlementDetail = () => {
    if (!selectedTaxSettlement) return null;

    return (
      <div className="p-6">
        <Card>
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedTaxSettlement(null)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{selectedTaxSettlement.name}</h2>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Pencil className="w-3 h-3" />
                </Button>
              </div>
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                Ch?a chuy?n
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                {t('payroll.taxSettlement.selectEmployee')}
              </Button>
              <Button variant="outline">
                <Send className="w-4 h-4 mr-2" />
                {t('payroll.taxSettlement.transferToTax')}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => openTaxRefund()}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t('payroll.taxSettlement.taxRefund')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openTaxDeduction()}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t('payroll.taxSettlement.taxDeduction')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Info className="w-4 h-4 mr-2" />
                    {t('payroll.payrollSummary.reference')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pencil className="w-4 h-4 mr-2" />
                    {t('payroll.payrollSummary.update')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('payroll.common.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Selection Actions Bar */}
          {selectedTaxSettlementEmployees.length > 0 && (
            <div className="p-3 border-b bg-muted/30 flex items-center gap-3">
               <span className="text-sm">
                {t('payroll.common.selected')} <span className="font-semibold">{selectedTaxSettlementEmployees.length}</span>
              </span>
              <Button 
                variant="link" 
                size="sm" 
                className="text-primary p-0 h-auto"
                onClick={() => setSelectedTaxSettlementEmployees([])}
              >
                {t('payroll.common.deselect')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground gap-1"
                onClick={() => openBulkDeleteTaxEmployee()}
              >
                <Trash2 className="w-4 h-4" />
                {t('payroll.common.delete')} ({selectedTaxSettlementEmployees.length})
              </Button>
            </div>
          )}

          {/* Filters */}
          <div className="p-4 border-b flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                 placeholder={t('payroll.common.search')}
                className="pl-9"
                value={taxSettlementDetailSearch}
                onChange={(e) => setTaxSettlementDetailSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={taxSettlementDetailStatusFilter} onValueChange={setTaxSettlementDetailStatusFilter}>
                <SelectTrigger className="w-[150px]">
                   <SelectValue placeholder={t('payroll.salaryComponents.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('payroll.salaryComponents.allStatuses')}</SelectItem>
                  <SelectItem value="completed">{t('common.status.completed')}</SelectItem>
                  <SelectItem value="pending">{t('common.status.pending')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={taxSettlementDetailUnitFilter} onValueChange={setTaxSettlementDetailUnitFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t('payroll.paymentTab.allUnits')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('payroll.paymentTab.allUnits')}</SelectItem>
                  {availableUnits.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-10 p-3">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={selectedTaxSettlementEmployees.length === filteredTaxSettlementEmployees.length && filteredTaxSettlementEmployees.length > 0}
                      onChange={toggleSelectAllTaxSettlementEmployees}
                    />
                  </th>
                   <th className="text-center p-3 font-medium text-xs text-muted-foreground w-12">{t('payroll.common.stt')}</th>
                  <th className="text-left p-3 font-medium text-xs text-muted-foreground">{t('payroll.common.employeeCode')}</th>
                  <th className="text-left p-3 font-medium text-xs text-muted-foreground min-w-[180px]">{t('payroll.common.fullName')}</th>
                  <th className="text-right p-3 font-medium text-xs text-muted-foreground">{t('payroll.taxSettlement.totalTaxableIncome')}</th>
                  <th className="text-center p-3 font-medium text-xs text-muted-foreground">{t('payroll.taxSettlement.dependents')}</th>
                  <th className="text-right p-3 font-medium text-xs text-muted-foreground" colSpan={4}>
                    <div className="text-center mb-1">{t('payroll.taxSettlement.deductions')}</div>
                  </th>
                  <th className="text-right p-3 font-medium text-xs text-muted-foreground">{t('payroll.taxSettlement.totalDeduction')}</th>
                  <th className="text-right p-3 font-medium text-xs text-muted-foreground">{t('payroll.taxSettlement.taxableIncome')}</th>
                  <th className="text-right p-3 font-medium text-xs text-muted-foreground">{t('payroll.taxSettlement.taxPayable')}</th>
                  <th className="text-right p-3 font-medium text-xs text-muted-foreground">{t('payroll.taxSettlement.taxPaid')}</th>
                  <th className="text-center p-3 font-medium text-xs text-muted-foreground w-20">{t('payroll.salaryComponents.actions')}</th>
                </tr>
                <tr className="bg-muted/30">
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                   <th className="text-right p-2 font-medium text-xs text-muted-foreground">{t('payroll.taxSettlement.familyDeduction')}</th>
                  <th className="text-right p-2 font-medium text-xs text-muted-foreground">BHTN (1.0%)</th>
                  <th className="text-right p-2 font-medium text-xs text-muted-foreground">BHXH (8.0%)</th>
                  <th className="text-right p-2 font-medium text-xs text-muted-foreground">BHYT (1.5%)</th>
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTaxSettlementEmployees.map((employee, index) => (
                  <tr key={employee.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={selectedTaxSettlementEmployees.includes(employee.id)}
                        onChange={() => toggleTaxSettlementEmployeeSelection(employee.id)}
                      />
                    </td>
                    <td className="p-3 text-center">{index + 1}</td>
                    <td className="p-3">{employee.code || '?'}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {employeeAvatarInitial(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{employee.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">{formatPayrollMoney(employee.totalTaxableIncome)}</td>
                    <td className="p-3 text-center">{employee.dependents}</td>
                    <td className="p-3 text-right font-mono">{formatPayrollMoney(employee.familyDeduction)}</td>
                    <td className="p-3 text-right font-mono">{formatPayrollMoney(employee.unemploymentInsurance)}</td>
                    <td className="p-3 text-right font-mono">{formatPayrollMoney(employee.socialInsurance)}</td>
                    <td className="p-3 text-right font-mono">{formatPayrollMoney(employee.healthInsurance)}</td>
                    <td className="p-3 text-right font-mono">{formatPayrollMoney(employee.totalDeduction)}</td>
                    <td className="p-3 text-right font-mono">{formatPayrollMoney(employee.taxableIncomeAfterDeduction)}</td>
                    <td className="p-3 text-right font-mono">{formatPayrollMoney(employee.taxPayable)}</td>
                    <td className="p-3 text-right font-mono">{formatPayrollMoney(employee.taxPaid)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditTaxEmployeeDialog(employee)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => openDeleteTaxEmployee(employee)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="bg-muted/50 font-semibold">
                  <td className="p-3" colSpan={2}>
                    <div className="flex items-center gap-2">
                       <Settings className="w-4 h-4" />
                      {t('payroll.common.total')}
                    </div>
                  </td>
                  <td className="p-3" colSpan={2}></td>
                  <td className="p-3 text-right font-mono">{formatPayrollMoney(taxSettlementTotals.totalTaxableIncome)}</td>
                  <td className="p-3"></td>
                  <td className="p-3 text-right font-mono">{formatPayrollMoney(taxSettlementTotals.familyDeduction)}</td>
                  <td className="p-3 text-right font-mono">{formatPayrollMoney(taxSettlementTotals.unemploymentInsurance)}</td>
                  <td className="p-3 text-right font-mono">{formatPayrollMoney(taxSettlementTotals.socialInsurance)}</td>
                  <td className="p-3 text-right font-mono">{formatPayrollMoney(taxSettlementTotals.healthInsurance)}</td>
                  <td className="p-3 text-right font-mono">{formatPayrollMoney(taxSettlementTotals.totalDeduction)}</td>
                  <td className="p-3 text-right font-mono">{formatPayrollMoney(taxSettlementTotals.taxableIncomeAfterDeduction)}</td>
                  <td className="p-3 text-right font-mono">{formatPayrollMoney(taxSettlementTotals.taxPayable)}</td>
                  <td className="p-3 text-right font-mono">{formatPayrollMoney(taxSettlementTotals.taxPaid)}</td>
                  <td className="p-3"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t flex items-center justify-between">
             <span className="text-sm text-muted-foreground">{t('payroll.common.totalRecords')}: {filteredTaxSettlementEmployees.length}</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('payroll.common.recordsPerPage')}</span>
                <Select defaultValue="25">
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-muted-foreground">1 - 25 {t('payroll.common.records')}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Tax Employee Dialog ? floatingUiState null-guarded (P0-b) */}
        <Dialog
          open={showEditTaxEmployeeDialog}
          onOpenChange={(open) =>
            setTaxSettlementFloatingUi((prev) => applyTaxEditDialogOpenChange(prev, open))
          }
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('payroll.taxSettlement.editTaxInfo')}</DialogTitle>
            </DialogHeader>
            {taxEmployeeToEdit ? (
              <div className="space-y-4 py-4">
                {/* Employee Info */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {employeeAvatarInitial(taxEmployeeToEdit.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{taxEmployeeToEdit.name}</p>
                    <p className="text-sm text-muted-foreground">{taxEmployeeToEdit.code || '?'}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>{t('payroll.taxSettlement.totalTaxableIncome')}</Label>
                      <ViMoneyInput
                        value={taxEmployeeEditForm.totalTaxableIncome}
                        onValueChange={(n) =>
                          setTaxSettlementFloatingUi((prev) =>
                            patchTaxEmployeeEditForm(prev, { totalTaxableIncome: n }),
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t('payroll.taxSettlement.dependents')}</Label>
                      <Input
                        type="number"
                        value={taxEmployeeEditForm.dependents}
                        onChange={(e) =>
                          setTaxSettlementFloatingUi((prev) =>
                            patchTaxEmployeeEditForm(prev, {
                              dependents: Number.parseInt(e.target.value, 10) || 0,
                            }),
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="border-t pt-3">
                     <p className="text-sm font-medium text-muted-foreground mb-3">{t('payroll.taxSettlement.deductions')}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>{t('payroll.taxSettlement.familyDeduction')}</Label>
                        <ViMoneyInput
                          value={taxEmployeeEditForm.familyDeduction}
                          onValueChange={(n) =>
                            setTaxSettlementFloatingUi((prev) =>
                              patchTaxEmployeeEditForm(prev, { familyDeduction: n }),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>BHTN (1.0%)</Label>
                        <ViMoneyInput
                          value={taxEmployeeEditForm.unemploymentInsurance}
                          onValueChange={(n) =>
                            setTaxSettlementFloatingUi((prev) =>
                              patchTaxEmployeeEditForm(prev, { unemploymentInsurance: n }),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>BHXH (8.0%)</Label>
                        <ViMoneyInput
                          value={taxEmployeeEditForm.socialInsurance}
                          onValueChange={(n) =>
                            setTaxSettlementFloatingUi((prev) =>
                              patchTaxEmployeeEditForm(prev, { socialInsurance: n }),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>BHYT (1.5%)</Label>
                        <ViMoneyInput
                          value={taxEmployeeEditForm.healthInsurance}
                          onValueChange={(n) =>
                            setTaxSettlementFloatingUi((prev) =>
                              patchTaxEmployeeEditForm(prev, { healthInsurance: n }),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Thu? TNCN</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                       <Label>{t('payroll.taxSettlement.taxPayable')}</Label>
                      <ViMoneyInput
                          value={taxEmployeeEditForm.taxPayable}
                          onValueChange={(n) =>
                            setTaxSettlementFloatingUi((prev) =>
                              patchTaxEmployeeEditForm(prev, { taxPayable: n }),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                       <Label>{t('payroll.taxSettlement.taxPaid')}</Label>
                      <ViMoneyInput
                          value={taxEmployeeEditForm.taxPaid}
                          onValueChange={(n) =>
                            setTaxSettlementFloatingUi((prev) =>
                              patchTaxEmployeeEditForm(prev, { taxPaid: n }),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-4 text-sm text-muted-foreground">
                Kh�ng c� nh�n vi�n ?? s?a. ?�ng h?p tho?i v� ch?n l?i t? b?ng.
              </p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setTaxSettlementFloatingUi(closeTaxEmployeeEditFloatingUi())}
              >
                H?y b?
              </Button>
              <Button onClick={handleSaveTaxEmployeeEdit} disabled={!taxEmployeeToEdit}>
                L?u thay ??i
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Tax Employee Confirmation Dialog */}
        <Dialog open={showDeleteTaxEmployeeDialog} onOpenChange={onDeleteTaxEmployeeOpenChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>X�c nh?n x�a nh�n vi�n</DialogTitle>
            </DialogHeader>
            {taxEmployeeToDelete && (
              <div className="py-4">
                <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg mb-4">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">C?nh b�o</p>
                    <p className="text-sm text-muted-foreground">
                      H�nh ??ng n�y kh�ng th? ho�n t�c
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  B?n c� ch?c ch?n mu?n x�a nh�n vi�n sau kh?i b?ng quy?t to�n thu??
                </p>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {employeeAvatarInitial(taxEmployeeToDelete.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{taxEmployeeToDelete.name || '?'}</p>
                    <p className="text-sm text-muted-foreground">{taxEmployeeToDelete.code || '?'}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => {
                closeDeleteTaxEmployee();
                setTaxEmployeeToDelete(null);
              }}>
                H?y b?
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (taxEmployeeToDelete) {
                    setTaxSettlementEmployees(prev => prev.filter(emp => emp.id !== taxEmployeeToDelete.id));
                    setSelectedTaxSettlementEmployees(prev => prev.filter(id => id !== taxEmployeeToDelete.id));
                    closeDeleteTaxEmployee();
                    setTaxEmployeeToDelete(null);
                  }
                }}
              >
                X�a nh�n vi�n
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Delete Tax Employees Confirmation Dialog */}
        <Dialog open={showBulkDeleteTaxEmployeeDialog} onOpenChange={onBulkDeleteTaxEmployeeOpenChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                X�c nh?n x�a nhi?u nh�n vi�n
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">C?nh b�o</p>
                  <p className="text-sm text-muted-foreground">
                    H�nh ??ng n�y kh�ng th? ho�n t�c
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                B?n c� ch?c ch?n mu?n x�a <span className="font-semibold text-foreground">{selectedTaxSettlementEmployees.length}</span> nh�n vi�n ?� ch?n kh?i b?ng quy?t to�n thu??
              </p>
              <div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {selectedTaxSettlementEmployees.map(empId => {
                  const emp = taxSettlementEmployees.find(e => e.id === empId);
                  return emp ? (
                    <div key={emp.id} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {emp.name.split(' ').pop()?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.code}</p>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => closeBulkDeleteTaxEmployee()}>
                H?y b?
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  setTaxSettlementEmployees(prev => prev.filter(emp => !selectedTaxSettlementEmployees.includes(emp.id)));
                  setSelectedTaxSettlementEmployees([]);
                  closeBulkDeleteTaxEmployee();
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                X�a {selectedTaxSettlementEmployees.length} nh�n vi�n
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tax Refund Dialog (Ho�n thu?) */}
        <Dialog open={showTaxRefundDialog} onOpenChange={onTaxRefundOpenChange}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Th�m b?ng thu nh?p kh�c</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Time */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  Th?i gian <span className="text-destructive">*</span>
                </Label>
                <div className="relative w-48">
                  <Input
                    type="text"
                    value={`Th�ng ${String(taxRefundFormData.date.getMonth() + 1).padStart(2, '0')}, ${taxRefundFormData.date.getFullYear()}`}
                    readOnly
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Applied Units */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  ??n v? �p d?ng <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap items-center gap-2">
                  {taxRefundFormData.appliedUnits.length > 0 ? (
                    taxRefundFormData.appliedUnits.map(unit => (
                      <Badge key={unit} variant="secondary" className="flex items-center gap-1">
                        {unit}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-destructive"
                          onClick={() => setTaxRefundFormData(prev => ({
                            ...prev,
                            appliedUnits: prev.appliedUnits.filter(u => u !== unit)
                          }))}
                        />
                      </Badge>
                    ))
                  ) : null}
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (!taxRefundFormData.appliedUnits.includes(value)) {
                        setTaxRefundFormData(prev => ({
                          ...prev,
                          appliedUnits: [...prev.appliedUnits, value],
                          name: `B?ng thu nh?p kh�c th�ng ${prev.date.getMonth() + 1}/${prev.date.getFullYear()} - ${[...prev.appliedUnits, value].join(', ')}`
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Ch?n ??n v?" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.filter(u => !taxRefundFormData.appliedUnits.includes(u)).map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Position */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">V? tr� �p d?ng</Label>
                <Input
                  value="T?t c? c�c v? tr� trong ??n v?"
                  readOnly
                  className="bg-muted/50"
                />
              </div>

              {/* Employees */}
              <div className="grid grid-cols-[150px_1fr] items-start gap-4">
                <Label className="text-right pt-2">Nh�n vi�n �p d?ng</Label>
                <RadioGroup 
                  value={taxRefundFormData.employeeType}
                  onValueChange={(value: 'all' | 'selected') => setTaxRefundFormData(prev => ({ ...prev, employeeType: value }))}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="tax-refund-all-employees" />
                    <Label htmlFor="tax-refund-all-employees" className="font-normal cursor-pointer">
                      T?t c? nh�n vi�n
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selected" id="tax-refund-selected-employees" />
                    <Label htmlFor="tax-refund-selected-employees" className="font-normal cursor-pointer">
                      Nh�n vi�n ???c ch?n
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Name */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  T�n b?ng thu nh?p kh�c <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={taxRefundFormData.name || `B?ng thu nh?p kh�c th�ng ${taxRefundFormData.date.getMonth() + 1}/${taxRefundFormData.date.getFullYear()}${taxRefundFormData.appliedUnits.length > 0 ? ` - ${taxRefundFormData.appliedUnits.join(', ')}` : ''}`}
                  onChange={(e) => setTaxRefundFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="T�n b?ng thu nh?p kh�c"
                />
              </div>

              {/* Income Type */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  Kho?n thu nh?p kh�c <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {taxRefundFormData.incomeType}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => setTaxRefundFormData(prev => ({ ...prev, incomeType: '' }))}
                    />
                  </Badge>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => {
                closeTaxRefund();
                setTaxRefundFormData({
                  date: new Date(),
                  appliedUnits: [],
                  position: 'all',
                  employeeType: 'all',
                  name: '',
                  incomeType: 'Thu? TNCN ???c ho�n',
                });
              }}>
                H?y b?
              </Button>
              <Button 
                className="bg-primary"
                onClick={() => {
                  // Handle save logic here
                  closeTaxRefund();
                  setTaxRefundFormData({
                    date: new Date(),
                    appliedUnits: [],
                    position: 'all',
                    employeeType: 'all',
                    name: '',
                    incomeType: 'Thu? TNCN ???c ho�n',
                  });
                }}
                disabled={taxRefundFormData.appliedUnits.length === 0}
              >
                L?u
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tax Deduction Dialog */}
        <Dialog open={showTaxDeductionDialog} onOpenChange={onTaxDeductionOpenChange}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Th�m b?ng kh?u tr? kh�c</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Time */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  Th?i gian <span className="text-destructive">*</span>
                </Label>
                <div className="relative w-48">
                  <Input
                    type="text"
                    value={`Th�ng ${String(taxDeductionFormData.date.getMonth() + 1).padStart(2, '0')}, ${taxDeductionFormData.date.getFullYear()}`}
                    readOnly
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Applied Units */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  ??n v? �p d?ng <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap items-center gap-2">
                  {taxDeductionFormData.appliedUnits.length > 0 ? (
                    taxDeductionFormData.appliedUnits.map(unit => (
                      <Badge key={unit} variant="secondary" className="flex items-center gap-1">
                        {unit}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-destructive"
                          onClick={() => setTaxDeductionFormData(prev => ({
                            ...prev,
                            appliedUnits: prev.appliedUnits.filter(u => u !== unit)
                          }))}
                        />
                      </Badge>
                    ))
                  ) : null}
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (!taxDeductionFormData.appliedUnits.includes(value)) {
                        setTaxDeductionFormData(prev => ({
                          ...prev,
                          appliedUnits: [...prev.appliedUnits, value],
                          name: `B?ng kh?u tr? kh�c th�ng ${prev.date.getMonth() + 1}/${prev.date.getFullYear()} - ${[...prev.appliedUnits, value].join(', ')}`
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Ch?n ??n v?" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.filter(u => !taxDeductionFormData.appliedUnits.includes(u)).map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Position */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">V? tr� �p d?ng</Label>
                <Input
                  value="T?t c? c�c v? tr� trong ??n v?"
                  readOnly
                  className="bg-muted/50"
                />
              </div>

              {/* Employees */}
              <div className="grid grid-cols-[150px_1fr] items-start gap-4">
                <Label className="text-right pt-2">Nh�n vi�n �p d?ng</Label>
                <RadioGroup 
                  value={taxDeductionFormData.employeeType}
                  onValueChange={(value: 'all' | 'selected') => setTaxDeductionFormData(prev => ({ ...prev, employeeType: value }))}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="tax-deduction-all-employees" />
                    <Label htmlFor="tax-deduction-all-employees" className="font-normal cursor-pointer">
                      T?t c? nh�n vi�n
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selected" id="tax-deduction-selected-employees" />
                    <Label htmlFor="tax-deduction-selected-employees" className="font-normal cursor-pointer">
                      Nh�n vi�n ???c ch?n
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Name */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  T�n b?ng kh?u tr? kh�c <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={taxDeductionFormData.name || `B?ng kh?u tr? kh�c th�ng ${taxDeductionFormData.date.getMonth() + 1}/${taxDeductionFormData.date.getFullYear()}${taxDeductionFormData.appliedUnits.length > 0 ? ` - ${taxDeductionFormData.appliedUnits.join(', ')}` : ''}`}
                  onChange={(e) => setTaxDeductionFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="T�n b?ng kh?u tr? kh�c"
                />
              </div>

              {/* Deduction Type */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  Kho?n kh?u tr? kh�c <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {taxDeductionFormData.deductionType}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => setTaxDeductionFormData(prev => ({ ...prev, deductionType: '' }))}
                    />
                  </Badge>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => {
                closeTaxDeduction();
                setTaxDeductionFormData({
                  date: new Date(),
                  appliedUnits: [],
                  position: 'all',
                  employeeType: 'all',
                  name: '',
                  deductionType: 'Thu? TNCN kh?u tr?',
                });
              }}>
                H?y b?
              </Button>
              <Button 
                className="bg-primary"
                onClick={() => {
                  // Handle save logic here
                  closeTaxDeduction();
                  setTaxDeductionFormData({
                    date: new Date(),
                    appliedUnits: [],
                    position: 'all',
                    employeeType: 'all',
                    name: '',
                    deductionType: 'Thu? TNCN kh?u tr?',
                  });
                }}
                disabled={taxDeductionFormData.appliedUnits.length === 0}
              >
                L?u
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Filter available employees for insurance policy add dialog
  const filteredInsurancePolicyEmployeesToAdd = availableTaxPolicyEmployees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(insurancePolicyParticipantSearch.toLowerCase()) ||
      emp.code.toLowerCase().includes(insurancePolicyParticipantSearch.toLowerCase());
    const matchesDepartment = insurancePolicyParticipantDepartmentFilter === 'all' || emp.department === insurancePolicyParticipantDepartmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // Toggle insurance policy participant to add selection
  const toggleInsurancePolicyParticipantToAddSelection = (empId: string) => {
    setSelectedInsurancePolicyParticipantsToAdd(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  // Toggle select all insurance policy participants to add
  const toggleSelectAllInsurancePolicyParticipantsToAdd = () => {
    if (selectedInsurancePolicyParticipantsToAdd.length === filteredInsurancePolicyEmployeesToAdd.length) {
      setSelectedInsurancePolicyParticipantsToAdd([]);
    } else {
      setSelectedInsurancePolicyParticipantsToAdd(filteredInsurancePolicyEmployeesToAdd.map(emp => emp.id));
    }
  };

  // Confirm add insurance policy participants
  const confirmAddInsurancePolicyParticipants = () => {
    console.log('Adding employees to insurance policy:', selectedInsurancePolicyParticipantsToAdd, 'with insurance type:', insurancePolicyParticipantInsuranceType, 'effective date:', insurancePolicyParticipantEffectiveDate);
    setShowAddInsurancePolicyParticipantDialog(false);
    setSelectedInsurancePolicyParticipantsToAdd([]);
    setInsurancePolicyParticipantSearch('');
    setInsurancePolicyParticipantDepartmentFilter('all');
    setInsurancePolicyParticipantInsuranceType('all');
    setInsurancePolicyParticipantEffectiveDate('');
  };

  const renderPolicyContent = () => {
    switch (activePolicySubTab) {
      case 'tax':
        return <TaxPolicyTab />;
      case 'insurance':
        return <InsurancePolicyTab />;
      case 'payroll-groups':
        return <PayrollGroupsCatalogTab />;
      case 'bonus':
        return <BonusPolicyTab />;
      case 'sales':
        return <SalesDataTab />;
      default:
        return (
          <div
            className="p-6 xevn-safe-inline"
            data-testid={activePolicySubTab === 'allowance' ? 'pay-allowance-stub-precision' : 'pay-policy-stub-precision'}
          >
            <Card className="rounded-card border border-xevn-border bg-xevn-surface p-8 text-center space-y-3">
              <h2 className="text-[20px] font-bold font-display text-xevn-text">
                {policyMenuItems.find(m => m.id === activePolicySubTab)?.label}
              </h2>
              <p className="text-sm text-xevn-textSecondary max-w-lg mx-auto">
                {t('payroll.common.featureInDev', { name: policyMenuItems.find(m => m.id === activePolicySubTab)?.label })}
              </p>
            </Card>
          </div>
        );
    }
  };

  // Render calculate tab content
  const renderCalcContent = () => {
    switch (activeCalcSubTab) {
      case 'calc-list':
        // AC-PAY-HIRE-04: batch/enroll surface must stay reachable when global payslip count >= 1
        return resolveCalcListTabComponent(livePayslips.length) === 'payslips-api' ? (
          <PayrollPayslipsApiTab />
        ) : (
          <PayrollBatchesTab />
        );
      case 'calc-advance':
        return <AdvanceRequestsTab />;
      case 'calc-template':
        return <SalaryTemplatesTab />;
      case 'calc-tax-settlement':
        // E2 AC-E2-P3-02 / SA Q1 ? no tax-settlement BE ? HIDE invent mutate UI
        return (
          <div className="p-6 xevn-safe-inline" data-testid="pay-tax-settlement-honesty-precision">
            <Card className="rounded-card border border-xevn-border bg-xevn-surface p-8 text-center space-y-3">
              <h2 className="text-[20px] font-bold font-display text-xevn-text">
                {t('payroll.taxSettlement.title')}
              </h2>
              <p className="text-xevn-textSecondary text-sm max-w-lg mx-auto">
                Quyết toán thuế chưa có API — không tạo dữ liệu giả trên màn hình này.
                Khi có endpoint, sẽ mở lại form theo API_DESIGN (không invent).
              </p>
            </Card>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {t('payroll.common.featureInDev', { name: calculateMenuItems.find(m => m.id === activeCalcSubTab)?.label })}
              </p>
            </Card>
          </div>
        );
    }
  };

  // Render main content based on active tab
  const renderMainContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'payment':
        return <PaymentBatchesTab />;
      case 'ess':
        return <EssPayslipsPanel />;
      case 'data':
        return renderDataContent();
      case 'components':
        return <SalaryComponentsTab />;
      case 'formulas':
        return <PayFormulaAuthorPanel />;
      case 'calculate':
        return renderCalcContent();
      case 'policy':
        return renderPolicyContent();
      case 'reports':
        return (
          <div data-testid="pay-reports-precision" className="xevn-safe-inline">
            <PayrollPayslipsApiTab />
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-0 animate-fade-in">
      {/* Top Navigation Tabs */}
      <div className="border-b bg-card">
        <div className="mobile-scroll-tabs px-2 md:px-4 py-2">
          {topTabs.map(renderTabButton)}
        </div>
      </div>

      {/* Main Content */}
      {renderMainContent()}

      {/* Payslip Dialog */}
      <Dialog open={!!selectedPayroll} onOpenChange={() => setSelectedPayroll(null)}>
        <DialogContent className="max-w-2xl">
          {selectedPayroll && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{t('payroll.viewPayslip')} - {selectedPayroll.month}</span>
                  <StatusBadge status={selectedPayroll.status} />
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {selectedPayroll.employeeName.split(' ').pop()?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedPayroll.employeeName}</h3>
                    <p className="text-muted-foreground">{t('employees.employeeCode')}: {selectedPayroll.employeeId}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Income */}
                  <div>
                    <h4 className="font-semibold text-success mb-2">{t('payroll.baseSalary')}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('payroll.baseSalary')}</span>
                        <span>{formatCurrency(selectedPayroll.baseSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('payroll.allowances')}</span>
                        <span className="text-success">+{formatCurrency(selectedPayroll.allowances)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('payroll.bonus')}</span>
                        <span className="text-success">+{formatCurrency(selectedPayroll.bonus)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>{t('common.all')}</span>
                        <span>
                          {formatCurrency(
                            selectedPayroll.baseSalary +
                              selectedPayroll.allowances +
                              selectedPayroll.bonus
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h4 className="font-semibold text-destructive mb-2">{t('payroll.deductions')}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('payroll.insurance')}</span>
                        <span className="text-destructive">-{formatCurrency(selectedPayroll.insurance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('payroll.tax')}</span>
                        <span className="text-destructive">-{formatCurrency(selectedPayroll.tax)}</span>
                      </div>
                      {selectedPayroll.deductions > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('payroll.deductions')}</span>
                          <span className="text-destructive">-{formatCurrency(selectedPayroll.deductions)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>{t('payroll.deductions')}</span>
                        <span className="text-destructive">
                          -{formatCurrency(
                            selectedPayroll.insurance +
                              selectedPayroll.tax +
                              selectedPayroll.deductions
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Net */}
                  <div className="bg-primary/5 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">{t('payroll.netSalary')}</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(selectedPayroll.netSalary)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                   <Printer className="w-4 h-4 mr-2" />
                   {t('common.print')}
                 </Button>
                <Button onClick={() => setSelectedPayroll(null)}>
                  {t('common.close')}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Payment Batch Dialog */}
      <Dialog open={showAddPaymentDialog} onOpenChange={onAddPaymentOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('payroll.paymentForm.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* B?ng l??ng */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.paymentForm.payrollTable')} <span className="text-destructive">*</span>
              </Label>
              <div className="col-span-6">
                <Select defaultValue="salary-09-2021">
                  <SelectTrigger>
                    <SelectValue placeholder={t('payroll.paymentForm.selectPayroll')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary-09-2021">B?ng l??ng th�ng 9/2021 - VP H� N?i</SelectItem>
                    <SelectItem value="salary-08-2021">B?ng l??ng th�ng 8/2021 - VP H� N?i</SelectItem>
                    <SelectItem value="salary-07-2021">B?ng l??ng th�ng 7/2021 - VP H� N?i</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Input 
                  value="Th�ng 09/2021" 
                  readOnly 
                  className="bg-muted text-muted-foreground"
                />
              </div>
            </div>

            {/* ??n v? �p d?ng */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.common.appliedUnit')}
              </Label>
              <div className="col-span-9">
                <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md min-h-[40px] bg-background">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    V?n ph�ng H� N?i
                    <button className="hover:bg-muted rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </div>
              </div>
            </div>

            {/* V? tr� �p d?ng */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.common.appliedPosition')}
              </Label>
              <div className="col-span-9">
                <Input 
                   value={t('payroll.common.allPositionsInUnit')}
                  readOnly 
                  className="bg-muted/50"
                />
              </div>
            </div>

            {/* Nh�n vi�n �p d?ng */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.common.appliedEmployee')}
               </Label>
              <div className="col-span-9">
                <RadioGroup defaultValue="all" className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-employees" />
                    <Label htmlFor="all-employees" className="font-normal cursor-pointer">{t('common.all')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selected" id="selected-employees" />
                     <Label htmlFor="selected-employees" className="font-normal cursor-pointer">{t('payroll.common.selectedEmployees')}</Label>
                   </div>
                </RadioGroup>
              </div>
            </div>

            {/* T�n b?ng chi tr? l??ng */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                {t('payroll.paymentForm.paymentBatchName')} <span className="text-destructive">*</span>
              </Label>
              <div className="col-span-9">
                <Input 
                   defaultValue="B?ng chi tr? l??ng K? 1 - th�ng 09/2021 l?n 2 - V?n ph�ng H� N?i"
                   placeholder={t('payroll.paymentForm.paymentBatchNamePlaceholder')}
                />
              </div>
            </div>

            {/* K? chi tr? */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                {t('payroll.paymentForm.paymentPeriod')} <span className="text-destructive">*</span>
              </Label>
              <div className="col-span-4">
                <Select defaultValue="ky-2">
                  <SelectTrigger className="bg-primary text-primary-foreground border-primary">
                    <SelectValue placeholder="Ch?n k?" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="ky-1">{t('payroll.paymentForm.time1')}</SelectItem>
                     <SelectItem value="ky-2">{t('payroll.paymentForm.time2')}</SelectItem>
                     <SelectItem value="ky-3">{t('payroll.paymentForm.time3')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-5">
                <div className="relative">
                  <Input 
                    type="date"
                    defaultValue="2022-05-13"
                    className="pr-10"
                  />
                </div>
              </div>
            </div>

            {/* Tr? l??ng theo */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.paymentForm.payBy')}
              </Label>
              <div className="col-span-4">
                <Select defaultValue="percent">
                  <SelectTrigger>
                    <SelectValue placeholder="Ch?n lo?i" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="percent">{t('payroll.paymentForm.ratio')}</SelectItem>
                     <SelectItem value="fixed">{t('payroll.paymentForm.fixedAmount')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-5">
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    defaultValue="100"
                    className="text-right"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            {/* H�nh th?c thanh to�n */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.paymentForm.paymentMethodLabel')}
              </Label>
              <div className="col-span-9">
                <Select defaultValue="cash">
                  <SelectTrigger>
                    <SelectValue placeholder="Ch?n h�nh th?c" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="cash">{t('payroll.paymentForm.cash')}</SelectItem>
                     <SelectItem value="transfer">{t('payroll.paymentForm.transfer')}</SelectItem>
                     <SelectItem value="both">{t('payroll.paymentForm.cashAndTransfer')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => closeAddPayment()}>
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              className="bg-xevn-primary hover:bg-xevn-primary/90 text-white"
              onClick={() => closeAddPayment()}
            >
               {t('payroll.agree')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Add Payroll Summary Dialog */}
      <Dialog open={showAddPayrollSummaryDialog} onOpenChange={setShowAddPayrollSummaryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('payroll.summaryForm.addTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* K? l??ng */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                {t('payroll.salaryPeriod')} <span className="text-destructive">*</span>
              </Label>
              <div className="col-span-9">
                <div className="relative">
                  <Input 
                    type="month"
                    defaultValue="2022-05"
                    className="pr-10"
                  />
                </div>
              </div>
            </div>

            {/* B?ng l??ng */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.summaryForm.payrollTable')} <span className="text-destructive">*</span>
              </Label>
              <div className="col-span-9">
                <Button variant="link" className="text-xevn-primary p-0 h-auto gap-1">
                  <Plus className="w-4 h-4" />
                  {t('payroll.summaryForm.addPayrollTable')}
                </Button>
              </div>
            </div>

            {/* ??n v? */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.summaryForm.unit')}
              </Label>
              <div className="col-span-9">
                <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md min-h-[40px] bg-background">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    C�ng ty th�nh vi�n
                    <button className="hover:bg-muted rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </div>
              </div>
            </div>

            {/* V? tr� */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.summaryForm.position')}
              </Label>
              <div className="col-span-9">
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder={t('payroll.summaryForm.selectPosition')} />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">{t('payroll.summaryForm.allPositions')}</SelectItem>
                     <SelectItem value="manager">{t('payroll.summaryForm.manager')}</SelectItem>
                     <SelectItem value="staff">{t('payroll.summaryForm.staff')}</SelectItem>
                     <SelectItem value="intern">{t('payroll.summaryForm.intern')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* T�n b?ng t?ng h?p */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                {t('payroll.summaryForm.summaryName')} <span className="text-destructive">*</span>
              </Label>
              <div className="col-span-9">
                <Input 
                  defaultValue="B?ng t?ng h?p l??ng Th�ng 5/2022 - C�ng ty th�nh vi�n"
                  placeholder={t('payroll.summaryForm.summaryNamePlaceholder')}
                />
              </div>
            </div>

            {/* Ng�y t?ng h?p */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.summaryForm.summaryDate')}
              </Label>
              <div className="col-span-9">
                <div className="relative">
                  <Input 
                    type="date"
                    defaultValue="2022-05-10"
                    className="pr-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddPayrollSummaryDialog(false)}>
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              className="bg-xevn-primary hover:bg-xevn-primary/90 text-white"
              onClick={() => setShowAddPayrollSummaryDialog(false)}
            >
               {t('payroll.agree')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Payroll Batch Confirmation Dialog */}
      <Dialog open={showDeletePayrollBatchDialog} onOpenChange={onDeletePayrollBatchOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
               {t('payroll.deleteSummary.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {payrollBatchToDelete ? (
              // Delete single batch
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('payroll.deleteSummary.confirmSingle')}
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                     <span className="text-sm text-muted-foreground w-24 shrink-0">{t('payroll.deleteSummary.batchName')}</span>
                    <span className="text-sm font-medium">{payrollBatchToDelete.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                     <span className="text-sm text-muted-foreground w-24 shrink-0">{t('payroll.deleteSummary.salaryPeriod')}</span>
                    <span className="text-sm">{payrollBatchToDelete.salaryPeriod}</span>
                  </div>
                  <div className="flex items-start gap-2">
                     <span className="text-sm text-muted-foreground w-24 shrink-0">{t('payroll.deleteSummary.unit')}</span>
                    <span className="text-sm">{payrollBatchToDelete.department}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground w-24 shrink-0">{t('payroll.deleteSummary.position')}</span>
                    <span className="text-sm">{payrollBatchToDelete.position}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground w-24 shrink-0">{t('payroll.deleteSummary.summaryDate')}</span>
                    <span className="text-sm">{payrollBatchToDelete.summaryDate}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Delete multiple batches
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('payroll.deleteSummary.confirmMultiple', { count: selectedPayrollBatches.length })}
                </p>
                <div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                  {selectedPayrollBatches.map(batchId => {
                    const batch = payrollSummaryBatches.find(b => b.id === batchId);
                    return batch ? (
                      <div key={batch.id} className="flex items-center gap-2 text-sm py-1 border-b last:border-0">
                        <span className="font-medium">{batch.name}</span>
                        <span className="text-muted-foreground">- {batch.salaryPeriod}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs  hidden  dark:text-amber-400">
                 {t('payroll.deleteSummary.cannotUndo')}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                closeDeletePayrollBatch();
                setPayrollBatchToDelete(null);
              }}
            >
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                // Handle delete logic here
                closeDeletePayrollBatch();
                setPayrollBatchToDelete(null);
                setSelectedPayrollBatches([]);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
               {t('payroll.deleteSummary.confirmBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payslip Print Dialog */}
      {selectedPayrollSummaryBatch && (
        <PayslipPrintDialog
          open={showPayslipPrintDialog}
          onOpenChange={onPayslipPrintOpenChange}
          employees={payrollSummaryEmployeesData}
          batchName={selectedPayrollSummaryBatch.name}
          salaryPeriod={selectedPayrollSummaryBatch.salaryPeriod}
          companyName={selectedPayrollSummaryBatch.department}
          initialEmployeeIndex={printEmployeeIndex}
        />
      )}

      {/* Add Advance Dialog (Th�m b?ng t?m ?ng) */}
      <Dialog open={showAddAdvanceDialog} onOpenChange={onAddAdvanceOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('payroll.advanceForm.addTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* B?ng l??ng */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">
                {t('payroll.advanceForm.payrollTable')} <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={advanceFormData.payrollBatch}
                  onChange={(e) => setAdvanceFormData({ ...advanceFormData, payrollBatch: e.target.value })}
                  className="flex-1"
                  readOnly
                />
                <Button variant="outline" size="icon">
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* ??n v? �p d?ng */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
               <Label className="text-right">{t('payroll.common.appliedUnit')}</Label>
              <Select 
                value={advanceFormData.department} 
                onValueChange={(value) => setAdvanceFormData({ ...advanceFormData, department: value })}
              >
                <SelectTrigger>
                   <SelectValue placeholder={t('payroll.common.selectUnit')} />
                </SelectTrigger>
                <SelectContent>
                  {payrollDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* V? tr� �p d?ng */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
               <Label className="text-right">{t('payroll.common.appliedPosition')}</Label>
              <Input
                 value={t('payroll.common.allPositionsInUnit')}
                readOnly
                className="bg-muted/50"
              />
            </div>

            {/* Nh�n vi�n �p d?ng */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
               <Label className="text-right pt-2">{t('payroll.common.appliedEmployee')}</Label>
              <RadioGroup 
                value={advanceFormData.employeeType}
                onValueChange={(value) => setAdvanceFormData({ ...advanceFormData, employeeType: value })}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all-employees" />
                     <Label htmlFor="all-employees" className="font-normal cursor-pointer">
                     {t('payroll.advanceForm.allEmployeesOnPayroll')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selected" id="selected-employees" />
                     <Label htmlFor="selected-employees" className="font-normal cursor-pointer">
                     {t('payroll.common.selectedEmployees')}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* T�n b?ng t?m ?ng */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">
                 {t('payroll.advanceForm.advanceName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                value={advanceFormData.advanceName}
                onChange={(e) => setAdvanceFormData({ ...advanceFormData, advanceName: e.target.value })}
                 placeholder={t('payroll.advanceForm.advanceNamePlaceholder')}
              />
            </div>

            {/* Di?n gi?i */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">{t('payroll.advanceForm.description')}</Label>
              <textarea
                value={advanceFormData.description}
                onChange={(e) => setAdvanceFormData({ ...advanceFormData, description: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('payroll.advanceForm.descriptionPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
             <Button variant="outline" onClick={() => closeAddAdvance()}>
               {t('payroll.common.cancel')}
             </Button>
            <Button 
              className="bg-xevn-primary hover:bg-xevn-primary/90 text-white"
              onClick={() => {
                // Handle create advance logic here
                closeAddAdvance();
              }}
            >
               {t('payroll.agree')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Advance Batch Confirmation Dialog */}
      <Dialog open={showDeleteAdvanceDialog} onOpenChange={onDeleteAdvanceOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              {t('payroll.deleteAdvance.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {advanceToDelete ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('payroll.deleteAdvance.confirmSingle')}
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground w-24 shrink-0">{t('payroll.deleteAdvance.batchName')}</span>
                    <span className="text-sm font-medium">{advanceToDelete.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground w-24 shrink-0">{t('payroll.deleteSummary.salaryPeriod')}</span>
                    <span className="text-sm">{advanceToDelete.salaryPeriod}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground w-24 shrink-0">{t('payroll.deleteAdvance.unit')}</span>
                    <span className="text-sm">{advanceToDelete.department}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground w-24 shrink-0">{t('payroll.deleteAdvance.totalAdvance')}</span>
                    <span className="text-sm font-medium text-amber-600">{formatCurrency(advanceToDelete.totalAmount)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('payroll.deleteAdvance.confirmMultiple', { count: selectedAdvanceBatches.length })}
                </p>
                <div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                  {selectedAdvanceBatches.map(batchId => {
                    const batch = advanceBatchesData.find(b => b.id === batchId);
                    return batch ? (
                      <div key={batch.id} className="flex items-center gap-2 text-sm py-1 border-b last:border-0">
                        <span className="font-medium">{batch.name}</span>
                        <span className="text-muted-foreground">- {formatCurrency(batch.totalAmount)}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs  hidden  dark:text-amber-400">
                {t('payroll.deleteSummary.cannotUndo')}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                closeDeleteAdvance();
                setAdvanceToDelete(null);
              }}
            >
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                closeDeleteAdvance();
                setAdvanceToDelete(null);
                setSelectedAdvanceBatches([]);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
               {t('payroll.deleteAdvance.confirmBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Advance Batch Dialog */}
      <Dialog open={showEditAdvanceDialog} onOpenChange={onEditAdvanceOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('payroll.advanceForm.editTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* T�n b?ng t?m ?ng */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">
                {t('payroll.advanceForm.advanceName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                value={advanceToEdit?.name || ''}
                onChange={(e) => setAdvanceToEdit(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder={t('payroll.advanceForm.advanceNamePlaceholder')}
              />
            </div>

            {/* ??n v? */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('payroll.summaryForm.unit')}</Label>
              <Input
                value={advanceToEdit?.department || ''}
                readOnly
                className="bg-muted/50"
              />
            </div>

            {/* K? l??ng */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('payroll.salaryPeriod')}</Label>
              <Input
                value={advanceToEdit?.salaryPeriod || ''}
                readOnly
                className="bg-muted/50"
              />
            </div>

            {/* Tr?ng th�i */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('payroll.advanceDetail.statusLabel')}</Label>
              <Select 
                value={advanceToEdit?.status || 'pending'} 
                onValueChange={(value: 'pending' | 'approved' | 'paid') => 
                  setAdvanceToEdit(prev => prev ? { ...prev, status: value } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="pending">{t('payroll.advanceList.pending')}</SelectItem>
                   <SelectItem value="approved">{t('payroll.advanceList.approved')}</SelectItem>
                   <SelectItem value="paid">{t('payroll.advanceList.paid')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              closeEditAdvance();
              setAdvanceToEdit(null);
            }}>
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              className="bg-xevn-primary hover:bg-xevn-primary/90 text-white"
              onClick={() => {
                // Handle update advance logic here
                closeEditAdvance();
                setAdvanceToEdit(null);
              }}
            >
               {t('payroll.advanceForm.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={onApprovalOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className={cn(
              "flex items-center gap-2",
              approvalAction === 'approve' ? "text-success" : "text-destructive"
            )}>
              {approvalAction === 'approve' ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {t('payroll.advanceDetail.approveTitle')}
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  {t('payroll.advanceDetail.rejectTitle')}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedAdvanceBatch && (
              <>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground w-28 shrink-0">{t('payroll.advanceDetail.advanceBatch')}:</span>
                    <span className="text-sm font-medium">{selectedAdvanceBatch.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground w-28 shrink-0">{t('payroll.advanceDetail.totalAmount')}:</span>
                    <span className="text-sm font-semibold text-amber-600">{formatCurrency(selectedAdvanceBatch.totalAmount)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground w-28 shrink-0">{t('payroll.advanceDetail.approvalLevel')}:</span>
                    <span className="text-sm">
                      {selectedAdvanceBatch.approvalSteps.find(s => s.status === 'pending')?.title || 'N/A'} 
                      ({selectedAdvanceBatch.currentApprovalLevel}/{selectedAdvanceBatch.approvalSteps.length})
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>
                    {t('payroll.advanceDetail.noteLabel')} {approvalAction === 'reject' && <span className="text-destructive">*</span>}
                  </Label>
                  <textarea
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     placeholder={approvalAction === 'approve' 
                       ? t('payroll.advanceDetail.notePlaceholderApprove')
                       : t('payroll.advanceDetail.notePlaceholderReject')}
                  />
                </div>
                
                {approvalAction === 'approve' && (
                  <div className="flex items-start gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <p className="text-xs text-success">
                      {t('payroll.advanceDetail.approveInfo')}
                    </p>
                  </div>
                )}
                
                {approvalAction === 'reject' && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive">
                      {t('payroll.advanceDetail.rejectInfo')}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                closeApproval();
                setApprovalNote('');
              }}
            >
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              className={cn(
                approvalAction === 'approve' 
                  ? "bg-success hover:bg-success/90 text-white"
                  : "bg-destructive hover:bg-destructive/90 text-white"
              )}
              disabled={approvalAction === 'reject' && !approvalNote.trim()}
              onClick={() => {
                // Handle approval/rejection logic here
                closeApproval();
                setApprovalNote('');
              }}
            >
              {approvalAction === 'approve' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t('payroll.advanceDetail.confirmApprove')}
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  {t('payroll.advanceDetail.confirmReject')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Salary Component Dialog */}
      <Dialog
        open={showEditSalaryComponentDialog}
        onOpenChange={onEditSalaryComponentOpenChange}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('payroll.componentForm.editTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* M� th�nh ph?n */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">
                 {t('payroll.componentForm.componentCode')} <span className="text-destructive">*</span>
              </Label>
              <Input
                value={editSalaryComponentForm.code}
                onChange={(e) => setEditSalaryComponentForm(prev => ({ ...prev, code: e.target.value }))}
                placeholder={t('payroll.componentForm.componentCodePlaceholder')}
              />
            </div>

            {/* T�n th�nh ph?n */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">
                 {t('payroll.componentForm.componentName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                value={editSalaryComponentForm.name}
                onChange={(e) => setEditSalaryComponentForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('payroll.componentForm.componentNamePlaceholder')}
              />
            </div>

            {/* ??n v? �p d?ng */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('payroll.common.appliedUnit')}</Label>
              <Select 
                value={editSalaryComponentForm.appliedUnit} 
                onValueChange={(value) => setEditSalaryComponentForm(prev => ({ ...prev, appliedUnit: value }))}
              >
                <SelectTrigger>
                     <SelectValue placeholder={t('payroll.common.selectUnit')} />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                  <SelectItem value="C�ng ty TNHH ??i Th�nh">C�ng ty TNHH ??i Th�nh</SelectItem>
                  <SelectItem value="C�ng ty ABC">C�ng ty ABC</SelectItem>
                  <SelectItem value="C�ng ty XYZ">C�ng ty XYZ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lo?i th�nh ph?n */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('payroll.componentForm.componentType')}</Label>
              <Select 
                value={editSalaryComponentForm.componentType} 
                onValueChange={(value) => setEditSalaryComponentForm(prev => ({ ...prev, componentType: value }))}
              >
                <SelectTrigger>
                     <SelectValue placeholder={t('payroll.componentForm.selectType')} />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                  <SelectItem value="__use_live_tab__" disabled>
                    D�ng tab Th�nh ph?n l??ng (pay_types catalog)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* T�nh ch?t */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
               <Label className="text-right">{t('payroll.componentForm.nature')}</Label>
              <Select 
                value={editSalaryComponentForm.nature} 
                onValueChange={(value: SalaryComponent['nature']) => setEditSalaryComponentForm(prev => ({ ...prev, nature: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                     <SelectItem value="income">{t('payroll.salaryComponents.income')}</SelectItem>
                     <SelectItem value="deduction">{t('payroll.salaryComponents.deduction')}</SelectItem>
                     <SelectItem value="other">{t('payroll.salaryComponents.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ki?u gi� tr? */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('payroll.componentForm.valueType')}</Label>
              <Select 
                value={editSalaryComponentForm.valueType} 
                onValueChange={(value: SalaryComponent['valueType']) => setEditSalaryComponentForm(prev => ({ ...prev, valueType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                     <SelectItem value="currency">{t('payroll.salaryComponents.currency')}</SelectItem>
                     <SelectItem value="number">{t('payroll.salaryComponents.number')}</SelectItem>
                     <SelectItem value="percentage">{t('payroll.salaryComponents.percentage')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gi� tr? (C�ng th?c) */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">{t('payroll.componentForm.formula')}</Label>
              <FormulaInput
                value={editSalaryComponentForm.formula}
                onChange={(value) => setEditSalaryComponentForm(prev => ({ ...prev, formula: value }))}
                availableComponents={formulaAvailableComponents}
                placeholder="VD: =SUM(LUONG_CO_BAN,PHU_CAP)"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => closeEditSalaryComponent()}>
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              className="bg-xevn-primary hover:bg-xevn-primary/90 text-white"
              onClick={saveEditedSalaryComponent}
              disabled={!editSalaryComponentForm.code.trim() || !editSalaryComponentForm.name.trim()}
            >
               {t('payroll.advanceForm.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Salary Component Confirmation Dialog */}
      <Dialog
        open={showDeleteSalaryComponentDialog}
        onOpenChange={onDeleteSalaryComponentOpenChange}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              {t('payroll.deleteComponent.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-destructive">
                {t('payroll.deleteComponent.confirm')}
              </p>
            </div>
            {salaryComponentToDelete && (
              <div className="space-y-2 bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="text-sm text-muted-foreground w-32 shrink-0">{t('payroll.deleteComponent.componentCode')}</span>
                  <span className="text-sm font-medium text-primary">{salaryComponentToDelete.code}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm text-muted-foreground w-32 shrink-0">{t('payroll.deleteComponent.componentName')}</span>
                  <span className="text-sm font-medium">{salaryComponentToDelete.name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm text-muted-foreground w-32 shrink-0">{t('payroll.deleteComponent.type')}</span>
                  <span className="text-sm">{salaryComponentToDelete.componentType}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm text-muted-foreground w-32 shrink-0">{t('payroll.deleteComponent.nature')}</span>
                  <span className="text-sm">{getNatureBadge(salaryComponentToDelete.nature)}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => closeDeleteSalaryComponent()}
            >
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteSalaryComponent}
            >
              <Trash2 className="w-4 h-4 mr-2" />
               {t('payroll.deleteComponent.confirmBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* System Salary Components Dialog */}
      <Dialog 
        open={showSystemComponentsDialog} 
        onOpenChange={onSystemComponentsOpenChange}
      >
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('payroll.systemComponents.title')}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col gap-4 py-4 overflow-hidden">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('payroll.common.search')}
                  className="pl-10"
                  value={systemComponentsSearch}
                  onChange={(e) => {
                    setSystemComponentsSearch(e.target.value);
                    setSystemComponentsPage(1);
                  }}
                />
              </div>
              <Select 
                value={systemComponentsTypeFilter} 
                onValueChange={(value) => {
                  setSystemComponentsTypeFilter(value);
                  setSystemComponentsPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('payroll.systemComponents.allComponents')} />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                  <SelectItem value="all">{t('payroll.systemComponents.allComponents')}</SelectItem>
                  {systemComponentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto border rounded-lg">
              <table className="w-full">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedSystemComponents.length === paginatedSystemComponents.length && paginatedSystemComponents.length > 0}
                        onChange={toggleSelectAllSystemComponents}
                      />
                    </th>
                     <th className="text-left p-3 font-medium text-xs text-muted-foreground">{t('payroll.systemComponents.componentCode')}</th>
                     <th className="text-left p-3 font-medium text-xs text-muted-foreground">{t('payroll.systemComponents.componentName')}</th>
                     <th className="text-left p-3 font-medium text-xs text-muted-foreground">{t('payroll.systemComponents.componentType')}</th>
                     <th className="text-left p-3 font-medium text-xs text-muted-foreground">{t('payroll.systemComponents.nature')}</th>
                     <th className="text-left p-3 font-medium text-xs text-muted-foreground">{t('payroll.systemComponents.taxable')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSystemComponents.map((component) => (
                    <tr 
                      key={component.id} 
                      className={cn(
                        "border-b hover:bg-muted/30 cursor-pointer transition-colors",
                        selectedSystemComponents.includes(component.id) && "bg-xevn-primary/5"
                      )}
                      onClick={() => toggleSystemComponentSelection(component.id)}
                    >
                      <td className="p-3">
                        <input 
                          type="checkbox" 
                          className="rounded border-xevn-border text-xevn-primary focus:ring-xevn-primary"
                          checked={selectedSystemComponents.includes(component.id)}
                          onChange={() => toggleSystemComponentSelection(component.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-primary text-sm">{component.code}</span>
                      </td>
                      <td className="p-3 text-sm">{component.name}</td>
                      <td className="p-3 text-sm text-muted-foreground">{component.componentType}</td>
                      <td className="p-3 text-sm">
                         {component.nature === 'income' && <span className="text-primary">{t('payroll.salaryComponents.income')}</span>}
                         {component.nature === 'deduction' && <span className="text-destructive">{t('payroll.salaryComponents.deduction')}</span>}
                         {component.nature === 'other' && <span className="text-muted-foreground">{t('payroll.salaryComponents.other')}</span>}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {component.isTaxable ? t('payroll.systemComponents.yes') : '-'}
                      </td>
                    </tr>
                  ))}
                  {paginatedSystemComponents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        {t('payroll.systemComponents.noResults')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                {t('payroll.common.totalRecords')}: <span className="font-medium">{filteredSystemComponents.length}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{t('payroll.common.recordsPerPage')}</span>
                  <Select value={String(systemComponentsPerPage)} onValueChange={() => {}}>
                    <SelectTrigger className="w-[70px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border shadow-lg z-50">
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                     {filteredSystemComponents.length > 0 
                       ? `${(systemComponentsPage - 1) * systemComponentsPerPage + 1} - ${Math.min(systemComponentsPage * systemComponentsPerPage, filteredSystemComponents.length)} ${t('payroll.common.records')}`
                       : `0 ${t('payroll.common.records')}`
                     }
                  </span>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      disabled={systemComponentsPage === 1}
                      onClick={() => setSystemComponentsPage(prev => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      disabled={systemComponentsPage >= totalSystemComponentsPages}
                      onClick={() => setSystemComponentsPage(prev => Math.min(totalSystemComponentsPages, prev + 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                closeSystemComponents();
                setSelectedSystemComponents([]);
                setSystemComponentsSearch('');
                setSystemComponentsTypeFilter('all');
                setSystemComponentsPage(1);
              }}
            >
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              className="bg-xevn-primary hover:bg-xevn-primary/90 text-white"
              onClick={confirmAddSystemComponents}
              disabled={selectedSystemComponents.length === 0}
            >
              {t('payroll.systemComponents.agree')} {selectedSystemComponents.length > 0 && `(${selectedSystemComponents.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tax Policy Participant Dialog */}
      <Dialog open={showAddTaxPolicyParticipantDialog} onOpenChange={setShowAddTaxPolicyParticipantDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('payroll.addParticipant.taxTitle')}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
            {/* Policy Type and Effective Date Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('payroll.addParticipant.policyType')}</Label>
                <Select 
                  value={taxPolicyParticipantPolicyType} 
                  onValueChange={(value) => setTaxPolicyParticipantPolicyType(value as 'progressive' | 'flat')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('payroll.addParticipant.selectPolicyType')} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-lg z-50">
                     <SelectItem value="progressive">{t('payroll.taxPolicy.progressive')}</SelectItem>
                     <SelectItem value="flat">{t('payroll.taxPolicy.flat')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                 <Label>{t('payroll.addParticipant.effectiveDate')}</Label>
                <Input 
                  type="date" 
                  value={taxPolicyParticipantEffectiveDate}
                  onChange={(e) => setTaxPolicyParticipantEffectiveDate(e.target.value)}
                />
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                   placeholder={t('payroll.addParticipant.searchEmployee')}
                  className="pl-10"
                  value={taxPolicyParticipantSearch}
                  onChange={(e) => setTaxPolicyParticipantSearch(e.target.value)}
                />
              </div>
              <Select 
                value={taxPolicyParticipantDepartmentFilter} 
                onValueChange={setTaxPolicyParticipantDepartmentFilter}
              >
                <SelectTrigger className="w-[200px]">
                   <SelectValue placeholder={t('payroll.addParticipant.allDepartments')} />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                   <SelectItem value="all">{t('payroll.addParticipant.allDepartments')}</SelectItem>
                  {taxPolicyDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Selected Count */}
            {selectedTaxPolicyParticipantsToAdd.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">
                  {t('payroll.addParticipant.selectedCount', { count: selectedTaxPolicyParticipantsToAdd.length })}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTaxPolicyParticipantsToAdd([])}
                  className="ml-auto text-xs h-7"
                >
                   {t('payroll.addParticipant.deselectAll')}
                </Button>
              </div>
            )}
            
            {/* Employee Table */}
            <div className="flex-1 overflow-auto border rounded-lg">
              <table className="w-full">
                <thead className="sticky top-0 bg-muted">
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-sm w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedTaxPolicyParticipantsToAdd.length === filteredTaxPolicyEmployeesToAdd.length && filteredTaxPolicyEmployeesToAdd.length > 0}
                        onChange={toggleSelectAllTaxPolicyParticipantsToAdd}
                      />
                    </th>
                     <th className="text-left p-3 font-medium text-sm w-10">{t('payroll.common.stt')}</th>
                     <th className="text-left p-3 font-medium text-sm">{t('payroll.common.employeeCode')}</th>
                     <th className="text-left p-3 font-medium text-sm">{t('payroll.common.fullName')}</th>
                     <th className="text-left p-3 font-medium text-sm">{t('payroll.common.position')}</th>
                     <th className="text-left p-3 font-medium text-sm">{t('payroll.common.department')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTaxPolicyEmployeesToAdd.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                         {t('payroll.addParticipant.noEmployees')}
                      </td>
                    </tr>
                  ) : (
                    filteredTaxPolicyEmployeesToAdd.map((emp, index) => (
                      <tr 
                        key={emp.id} 
                        className={cn(
                          "border-b hover:bg-muted/30 cursor-pointer transition-colors",
                          selectedTaxPolicyParticipantsToAdd.includes(emp.id) && "bg-primary/5"
                        )}
                        onClick={() => toggleTaxPolicyParticipantToAddSelection(emp.id)}
                      >
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300"
                            checked={selectedTaxPolicyParticipantsToAdd.includes(emp.id)}
                            onChange={() => toggleTaxPolicyParticipantToAddSelection(emp.id)}
                          />
                        </td>
                        <td className="p-3 text-muted-foreground">{index + 1}</td>
                        <td className="p-3">
                          <span className="font-medium text-primary">{emp.code}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {emp.name.split(' ').pop()?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{emp.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{emp.position}</td>
                        <td className="p-3 text-muted-foreground">{emp.department}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Summary */}
            <div className="text-sm text-muted-foreground">
              {t('payroll.addParticipant.showing', { count: filteredTaxPolicyEmployeesToAdd.length })}
            </div>
          </div>

          <DialogFooter className="gap-2 border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddTaxPolicyParticipantDialog(false);
                setSelectedTaxPolicyParticipantsToAdd([]);
                setTaxPolicyParticipantSearch('');
                setTaxPolicyParticipantDepartmentFilter('all');
                setTaxPolicyParticipantPolicyType('progressive');
                setTaxPolicyParticipantEffectiveDate('');
              }}
            >
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              className="bg-primary"
              onClick={confirmAddTaxPolicyParticipants}
              disabled={selectedTaxPolicyParticipantsToAdd.length === 0}
            >
              {t('payroll.addParticipant.addBtn')} {selectedTaxPolicyParticipantsToAdd.length > 0 && `(${selectedTaxPolicyParticipantsToAdd.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Insurance Policy Participant Dialog */}
      <Dialog open={showAddInsurancePolicyParticipantDialog} onOpenChange={setShowAddInsurancePolicyParticipantDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('payroll.addParticipant.insuranceTitle')}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
            {/* Insurance Type and Effective Date Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('payroll.addParticipant.insuranceType')}</Label>
                <Select 
                  value={insurancePolicyParticipantInsuranceType} 
                  onValueChange={(value) => setInsurancePolicyParticipantInsuranceType(value as 'social' | 'health' | 'unemployment' | 'all')}
                >
                  <SelectTrigger>
                     <SelectValue placeholder={t('payroll.addParticipant.selectInsuranceType')} />
                   </SelectTrigger>
                   <SelectContent className="bg-popover border shadow-lg z-50">
                     <SelectItem value="all">{t('payroll.addParticipant.fullInsurance')}</SelectItem>
                     <SelectItem value="social">{t('payroll.insurancePolicy.social')}</SelectItem>
                     <SelectItem value="health">{t('payroll.insurancePolicy.health')}</SelectItem>
                     <SelectItem value="unemployment">{t('payroll.insurancePolicy.unemployment')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('payroll.addParticipant.effectiveDate')}</Label>
                <Input 
                  type="date" 
                  value={insurancePolicyParticipantEffectiveDate}
                  onChange={(e) => setInsurancePolicyParticipantEffectiveDate(e.target.value)}
                />
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('payroll.addParticipant.searchEmployee')}
                  className="pl-10"
                  value={insurancePolicyParticipantSearch}
                  onChange={(e) => setInsurancePolicyParticipantSearch(e.target.value)}
                />
              </div>
              <Select 
                value={insurancePolicyParticipantDepartmentFilter} 
                onValueChange={setInsurancePolicyParticipantDepartmentFilter}
              >
                <SelectTrigger className="w-[200px]">
                   <SelectValue placeholder={t('payroll.addParticipant.allDepartments')} />
                 </SelectTrigger>
                 <SelectContent className="bg-popover border shadow-lg z-50">
                   <SelectItem value="all">{t('payroll.addParticipant.allDepartments')}</SelectItem>
                  {taxPolicyDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Selected Count */}
            {selectedInsurancePolicyParticipantsToAdd.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">
                  {t('payroll.addParticipant.selectedCount', { count: selectedInsurancePolicyParticipantsToAdd.length })}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedInsurancePolicyParticipantsToAdd([])}
                  className="ml-auto text-xs h-7"
                >
                  {t('payroll.addParticipant.deselectAll')}
                </Button>
              </div>
            )}
            
            {/* Employee Table */}
            <div className="flex-1 overflow-auto border rounded-lg">
              <table className="w-full">
                <thead className="sticky top-0 bg-muted">
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-sm w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedInsurancePolicyParticipantsToAdd.length === filteredInsurancePolicyEmployeesToAdd.length && filteredInsurancePolicyEmployeesToAdd.length > 0}
                        onChange={toggleSelectAllInsurancePolicyParticipantsToAdd}
                      />
                    </th>
                     <th className="text-left p-3 font-medium text-sm w-10">{t('payroll.common.stt')}</th>
                     <th className="text-left p-3 font-medium text-sm">{t('payroll.common.employeeCode')}</th>
                     <th className="text-left p-3 font-medium text-sm">{t('payroll.common.fullName')}</th>
                     <th className="text-left p-3 font-medium text-sm">{t('payroll.common.position')}</th>
                     <th className="text-left p-3 font-medium text-sm">{t('payroll.common.department')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInsurancePolicyEmployeesToAdd.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        {t('payroll.addParticipant.noEmployees')}
                      </td>
                    </tr>
                  ) : (
                    filteredInsurancePolicyEmployeesToAdd.map((emp, index) => (
                      <tr 
                        key={emp.id} 
                        className={cn(
                          "border-b hover:bg-muted/30 cursor-pointer transition-colors",
                          selectedInsurancePolicyParticipantsToAdd.includes(emp.id) && "bg-primary/5"
                        )}
                        onClick={() => toggleInsurancePolicyParticipantToAddSelection(emp.id)}
                      >
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300"
                            checked={selectedInsurancePolicyParticipantsToAdd.includes(emp.id)}
                            onChange={() => toggleInsurancePolicyParticipantToAddSelection(emp.id)}
                          />
                        </td>
                        <td className="p-3 text-muted-foreground">{index + 1}</td>
                        <td className="p-3">
                          <span className="font-medium text-primary">{emp.code}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {emp.name.split(' ').pop()?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{emp.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{emp.position}</td>
                        <td className="p-3 text-muted-foreground">{emp.department}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Summary */}
            <div className="text-sm text-muted-foreground">
              {t('payroll.addParticipant.showing', { count: filteredInsurancePolicyEmployeesToAdd.length })}
            </div>
          </div>

          <DialogFooter className="gap-2 border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddInsurancePolicyParticipantDialog(false);
                setSelectedInsurancePolicyParticipantsToAdd([]);
                setInsurancePolicyParticipantSearch('');
                setInsurancePolicyParticipantDepartmentFilter('all');
                setInsurancePolicyParticipantInsuranceType('all');
                setInsurancePolicyParticipantEffectiveDate('');
              }}
            >
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              className="bg-primary"
              onClick={confirmAddInsurancePolicyParticipants}
              disabled={selectedInsurancePolicyParticipantsToAdd.length === 0}
            >
              {t('payroll.addParticipant.addBtn')} {selectedInsurancePolicyParticipantsToAdd.length > 0 && `(${selectedInsurancePolicyParticipantsToAdd.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
