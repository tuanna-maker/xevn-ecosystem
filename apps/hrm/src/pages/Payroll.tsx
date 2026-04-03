import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { PaymentBatchesTab } from '@/components/payroll/PaymentBatchesTab';
import { PayrollAttendanceTab } from '@/components/payroll/PayrollAttendanceTab';
import { TaxPolicyTab } from '@/components/payroll/TaxPolicyTab';
import { InsurancePolicyTab } from '@/components/payroll/InsurancePolicyTab';
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
  { id: 'overview', label: t('payroll.overview'), icon: LayoutGrid, color: 'bg-blue-500' },
  { id: 'components', label: t('payroll.components'), icon: ClipboardList, color: 'bg-orange-500' },
  { id: 'policy', label: t('payroll.policy'), icon: FileText, color: 'bg-green-500', hasDropdown: true },
  { id: 'data', label: t('payroll.data'), icon: FileSpreadsheet, color: 'bg-purple-500', hasDropdown: true },
  { id: 'calculate', label: t('payroll.calculate'), icon: Calculator, color: 'bg-cyan-500', hasDropdown: true },
  { id: 'payment', label: t('payroll.payment'), icon: CreditCard, color: 'bg-rose-500' },
  { id: 'reports', label: t('payroll.reports'), icon: BarChart3, color: 'bg-amber-500' },
];

// Step cards for overview - will use translations
const getStepCards = (t: any) => [
  { 
    id: 1, 
    title: t('payroll.stepCards.step1'),
    subtitle: t('payroll.stepCards.watchVideo'),
    gradient: 'from-emerald-400 to-teal-500',
    icon: ClipboardList,
  },
  { 
    id: 2, 
    title: t('payroll.stepCards.step2'),
    subtitle: t('payroll.stepCards.watchVideo'),
    gradient: 'from-amber-400 to-orange-500',
    icon: FileSpreadsheet,
  },
  { 
    id: 3, 
    title: t('payroll.stepCards.step3'),
    subtitle: t('payroll.stepCards.watchVideo'),
    gradient: 'from-yellow-300 to-amber-400',
    icon: FileText,
  },
  { 
    id: 4, 
    title: t('payroll.stepCards.step4'),
    subtitle: t('payroll.stepCards.watchVideo'),
    gradient: 'from-pink-400 to-rose-500',
    icon: Calculator,
  },
  { 
    id: 5, 
    title: t('payroll.stepCards.step5'),
    subtitle: t('payroll.stepCards.watchVideo'),
    gradient: 'from-purple-400 to-violet-500',
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
  { name: t('payroll.incomeStructure.baseSalary'), value: 54.6, color: '#f59e0b' },
  { name: t('payroll.incomeStructure.salesBonus'), value: 28.6, color: '#10b981' },
  { name: t('payroll.incomeStructure.kpiBonus'), value: 14.3, color: '#8b5cf6' },
  { name: t('payroll.incomeStructure.excellentBonus'), value: 1.8, color: '#3b82f6' },
  { name: t('payroll.incomeStructure.occasionBonus'), value: 0.7, color: '#ec4899' },
];

// Policy dropdown items - will use translations
const getPolicyMenuItems = (t: any) => [
  { id: 'tax', label: t('payroll.taxPolicy.title') },
  { id: 'insurance', label: t('payroll.insurancePolicy.title') },
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

// System salary components data (Danh mục hệ thống)
interface SystemSalaryComponent {
  id: string;
  code: string;
  name: string;
  componentType: string;
  nature: 'income' | 'deduction' | 'other';
  isTaxable: boolean;
}

const systemSalaryComponentsData: SystemSalaryComponent[] = [
  { id: 's1', code: 'SO_NGAY_NGHI_BU', name: 'Số ngày nghỉ bù', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's2', code: 'SO_NGAY_NGHI_KHONG_LUONG', name: 'Số ngày nghỉ không lương', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's3', code: 'SO_GIO_NGHI_LE', name: 'Số giờ nghỉ lễ', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's4', code: 'SO_GIO_NGHI_BU', name: 'Số giờ nghỉ bù', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's5', code: 'SO_GIO_DI_CONG_TAC', name: 'Số giờ đi công tác', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's6', code: 'SO_GIO_NGHI_KHONG_LUONG', name: 'Số giờ nghỉ không lương', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's7', code: 'SO_CA_NGHI_PHEP', name: 'Số ca nghỉ phép', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's8', code: 'SO_CA_NGHI_LE', name: 'Số ca nghỉ lễ', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's9', code: 'SO_CA_NGHI_BU', name: 'Số ca nghỉ bù', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's10', code: 'SO_CA_DI_CONG_TAC', name: 'Số ca đi công tác', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's11', code: 'SO_NGAY_LAM_VIEC', name: 'Số ngày làm việc thực tế', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's12', code: 'SO_GIO_LAM_THEM', name: 'Số giờ làm thêm', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's13', code: 'SO_GIO_LAM_DEM', name: 'Số giờ làm đêm', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's14', code: 'SO_NGAY_CONG_CHUAN', name: 'Số ngày công chuẩn', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's15', code: 'SO_GIO_CONG_CHUAN', name: 'Số giờ công chuẩn', componentType: 'Chấm công', nature: 'other', isTaxable: false },
  { id: 's16', code: 'LUONG_CO_BAN', name: 'Lương cơ bản', componentType: 'Lương', nature: 'income', isTaxable: true },
  { id: 's17', code: 'LUONG_NGAY_CONG', name: 'Lương ngày công', componentType: 'Lương', nature: 'income', isTaxable: true },
  { id: 's18', code: 'LUONG_THEO_GIO_HT', name: 'Lương theo giờ', componentType: 'Lương', nature: 'income', isTaxable: true },
  { id: 's19', code: 'LUONG_LAM_THEM_HT', name: 'Lương làm thêm giờ', componentType: 'Lương', nature: 'income', isTaxable: true },
  { id: 's20', code: 'LUONG_LAM_DEM', name: 'Lương làm đêm', componentType: 'Lương', nature: 'income', isTaxable: true },
  { id: 's21', code: 'LUONG_KPI_HT', name: 'Lương KPI', componentType: 'Lương', nature: 'income', isTaxable: true },
  { id: 's22', code: 'LUONG_DOANH_SO', name: 'Lương doanh số', componentType: 'Lương', nature: 'income', isTaxable: true },
  { id: 's23', code: 'BHXH_NV', name: 'BHXH nhân viên', componentType: 'Bảo hiểm - Công đoàn', nature: 'deduction', isTaxable: false },
  { id: 's24', code: 'BHYT_NV', name: 'BHYT nhân viên', componentType: 'Bảo hiểm - Công đoàn', nature: 'deduction', isTaxable: false },
  { id: 's25', code: 'BHTN_NV', name: 'BHTN nhân viên', componentType: 'Bảo hiểm - Công đoàn', nature: 'deduction', isTaxable: false },
  { id: 's26', code: 'PHI_CONG_DOAN_NV', name: 'Phí công đoàn nhân viên', componentType: 'Bảo hiểm - Công đoàn', nature: 'deduction', isTaxable: false },
  { id: 's27', code: 'BHXH_DN', name: 'BHXH doanh nghiệp', componentType: 'Bảo hiểm - Công đoàn', nature: 'other', isTaxable: false },
  { id: 's28', code: 'BHYT_DN', name: 'BHYT doanh nghiệp', componentType: 'Bảo hiểm - Công đoàn', nature: 'other', isTaxable: false },
  { id: 's29', code: 'BHTN_DN', name: 'BHTN doanh nghiệp', componentType: 'Bảo hiểm - Công đoàn', nature: 'other', isTaxable: false },
  { id: 's30', code: 'PHU_CAP_AN_CA', name: 'Phụ cấp ăn ca', componentType: 'Phụ cấp', nature: 'income', isTaxable: false },
  { id: 's31', code: 'PHU_CAP_XANG_XE', name: 'Phụ cấp xăng xe', componentType: 'Phụ cấp', nature: 'income', isTaxable: false },
  { id: 's32', code: 'PHU_CAP_DIEN_THOAI_HT', name: 'Phụ cấp điện thoại', componentType: 'Phụ cấp', nature: 'income', isTaxable: false },
  { id: 's33', code: 'PHU_CAP_NHA_O', name: 'Phụ cấp nhà ở', componentType: 'Phụ cấp', nature: 'income', isTaxable: false },
  { id: 's34', code: 'PHU_CAP_TRACH_NHIEM', name: 'Phụ cấp trách nhiệm', componentType: 'Phụ cấp', nature: 'income', isTaxable: true },
  { id: 's35', code: 'PHU_CAP_CHUYEN_CAN', name: 'Phụ cấp chuyên cần', componentType: 'Phụ cấp', nature: 'income', isTaxable: true },
  { id: 's36', code: 'THUONG_THANG_HT', name: 'Thưởng tháng', componentType: 'Thưởng', nature: 'income', isTaxable: true },
  { id: 's37', code: 'THUONG_QUY_HT', name: 'Thưởng quý', componentType: 'Thưởng', nature: 'income', isTaxable: true },
  { id: 's38', code: 'THUONG_NAM', name: 'Thưởng năm', componentType: 'Thưởng', nature: 'income', isTaxable: true },
  { id: 's39', code: 'THUONG_LE_TET', name: 'Thưởng lễ tết', componentType: 'Thưởng', nature: 'income', isTaxable: true },
  { id: 's40', code: 'THUONG_NHAN_VIEN_XUAT_SAC', name: 'Thưởng nhân viên xuất sắc', componentType: 'Thưởng', nature: 'income', isTaxable: true },
  { id: 's41', code: 'THUONG_HIEU_HI_SINH_NHAT', name: 'Hiếu/Hỉ/Sinh nhật', componentType: 'Thưởng', nature: 'income', isTaxable: false },
  { id: 's42', code: 'THUE_TNCN_HT', name: 'Thuế TNCN', componentType: 'Thuế', nature: 'deduction', isTaxable: false },
  { id: 's43', code: 'GIAM_TRU_GIA_CANH', name: 'Giảm trừ gia cảnh', componentType: 'Thuế', nature: 'other', isTaxable: false },
  { id: 's44', code: 'GIAM_TRU_BAN_THAN', name: 'Giảm trừ bản thân', componentType: 'Thuế', nature: 'other', isTaxable: false },
  { id: 's45', code: 'SO_NGUOI_PHU_THUOC', name: 'Số người phụ thuộc', componentType: 'Thuế', nature: 'other', isTaxable: false },
  { id: 's46', code: 'TAM_UNG', name: 'Tạm ứng', componentType: 'Khấu trừ', nature: 'deduction', isTaxable: false },
  { id: 's47', code: 'KHAU_TRU_KHAC', name: 'Khấu trừ khác', componentType: 'Khấu trừ', nature: 'deduction', isTaxable: false },
  { id: 's48', code: 'THU_NHAP_KHAC', name: 'Thu nhập khác', componentType: 'Thu nhập khác', nature: 'income', isTaxable: true },
  { id: 's49', code: 'TRO_CAP_THAI_SAN', name: 'Trợ cấp thai sản', componentType: 'Trợ cấp', nature: 'income', isTaxable: false },
  { id: 's50', code: 'TRO_CAP_THAT_NGHIEP', name: 'Trợ cấp thất nghiệp', componentType: 'Trợ cấp', nature: 'income', isTaxable: false },
  { id: 's51', code: 'TRO_CAP_OM_DAU', name: 'Trợ cấp ốm đau', componentType: 'Trợ cấp', nature: 'income', isTaxable: false },
  { id: 's52', code: 'HOA_HONG', name: 'Hoa hồng', componentType: 'Doanh số', nature: 'income', isTaxable: true },
  { id: 's53', code: 'DOANH_SO_BAN_HANG', name: 'Doanh số bán hàng', componentType: 'Doanh số', nature: 'other', isTaxable: false },
  { id: 's54', code: 'DIEM_KPI', name: 'Điểm KPI', componentType: 'KPI', nature: 'other', isTaxable: false },
  { id: 's55', code: 'TY_LE_HOAN_THANH_KPI', name: 'Tỷ lệ hoàn thành KPI', componentType: 'KPI', nature: 'other', isTaxable: false },
  { id: 's56', code: 'SO_SAN_PHAM', name: 'Số sản phẩm', componentType: 'Sản phẩm', nature: 'other', isTaxable: false },
  { id: 's57', code: 'LUONG_SAN_PHAM', name: 'Lương sản phẩm', componentType: 'Sản phẩm', nature: 'income', isTaxable: true },
  { id: 's58', code: 'TONG_LUONG_GROSS', name: 'Tổng lương Gross', componentType: 'Tổng hợp', nature: 'other', isTaxable: false },
];

// Mock data for salary components
const salaryComponentsData: SalaryComponent[] = [
  { id: '1', code: 'LUONG_KPI', name: 'Lương KPI', appliedUnit: 'Phòng Kinh doanh', componentType: 'Lương', nature: 'income', valueType: 'currency', formula: '' },
  { id: '2', code: 'SO_NGAY_NGHI_PHEP', name: 'Số ngày nghỉ phép', appliedUnit: 'Phòng Kinh doanh', componentType: 'Chấm công', nature: 'other', valueType: 'number', formula: '' },
  { id: '3', code: 'SO_NGAY_DI_CONG_TAC', name: 'Số ngày đi công tác', appliedUnit: 'Phòng Kinh doanh', componentType: 'Chấm công', nature: 'other', valueType: 'number', formula: '' },
  { id: '4', code: 'THUONG_CA_GIO', name: 'Thưởng ca giờ', appliedUnit: 'Phòng Kinh doanh, Phòng Hành chính - Nhân sự', componentType: 'Thưởng', nature: 'income', valueType: 'currency', formula: '=SUM(LUONG_THEO_CA,LUONG_THEO_GIO)' },
  { id: '5', code: 'LUONG_NET_THEO_CA', name: 'Lương NET theo ca', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Lương', nature: 'income', valueType: 'number', formula: '' },
  { id: '6', code: 'SO_NGAY_NGHI_LE', name: 'Số ngày nghỉ lễ', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Chấm công', nature: 'other', valueType: 'number', formula: '' },
  { id: '7', code: 'SO_NGAY_NGHI_KHONG_LUONG', name: 'Số ngày nghỉ không lương', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Chấm công', nature: 'other', valueType: 'number', formula: '' },
  { id: '8', code: 'SO_GIO_NGHI_PHEP', name: 'Số giờ nghỉ phép', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Chấm công', nature: 'other', valueType: 'number', formula: '' },
  { id: '9', code: 'SO_GIO_NGHI_LE', name: 'Số giờ nghỉ lễ', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Chấm công', nature: 'other', valueType: 'number', formula: '' },
  { id: '10', code: 'LUONG_NGAY_CONG_CONG_CHUAN_CO_DINH', name: 'Lương ngày công (công chuẩn cố định)', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Lương', nature: 'income', valueType: 'currency', formula: '=(LUONG_CO_BAN*TY_LE_HUONG_LUONG*TONG_CONG_HUONG_LUONG)/CONG_CHUAN' },
  { id: '11', code: 'LUONG_NGAY_CONG_CONG_CHUAN_THEO_THANG', name: 'Lương ngày công (công chuẩn theo tháng)', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Lương', nature: 'income', valueType: 'currency', formula: '=(LUONG_CO_BAN*TY_LE_HUONG_LUONG*TONG_CONG_HUONG_LUONG)/CONG_CHUAN_THANG' },
  { id: '12', code: 'LUONG_THEO_GIO', name: 'Lương theo giờ', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Lương', nature: 'income', valueType: 'currency', formula: '' },
  { id: '13', code: 'LUONG_THEO_CA', name: 'Lương theo ca', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Lương', nature: 'income', valueType: 'currency', formula: '' },
  { id: '14', code: 'LUONG_LAM_THEM_CHIU_THUE', name: 'Lương làm thêm giờ (chịu thuế)', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Lương', nature: 'income', valueType: 'currency', formula: '=LUONG_CO_BAN/CONG_CHUAN*SO_GIO_LAM_THEM*1.5' },
  { id: '15', code: 'BHXH', name: 'BHXH', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Bảo hiểm - Công đoàn', nature: 'deduction', valueType: 'currency', formula: '=MUC_DONG_BHXH*0.08' },
  { id: '16', code: 'BHYT', name: 'BHYT', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Bảo hiểm - Công đoàn', nature: 'deduction', valueType: 'currency', formula: '=MUC_DONG_BHYT*0.015' },
  { id: '17', code: 'BHTN', name: 'BHTN', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Bảo hiểm - Công đoàn', nature: 'deduction', valueType: 'currency', formula: '=MUC_DONG_BHTN*0.01' },
  { id: '18', code: 'PHI_CONG_DOAN', name: 'Phí công đoàn', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Bảo hiểm - Công đoàn', nature: 'deduction', valueType: 'currency', formula: '' },
  { id: '19', code: 'PHU_CAP_AN_TRUA', name: 'Phụ cấp ăn trưa', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Phụ cấp', nature: 'income', valueType: 'currency', formula: '' },
  { id: '20', code: 'PHU_CAP_DIEN_THOAI', name: 'Phụ cấp điện thoại', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Phụ cấp', nature: 'income', valueType: 'currency', formula: '' },
  { id: '21', code: 'PHU_CAP_XE', name: 'Phụ cấp xăng xe', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Phụ cấp', nature: 'income', valueType: 'currency', formula: '' },
  { id: '22', code: 'THUONG_THANG', name: 'Thưởng tháng', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Thưởng', nature: 'income', valueType: 'currency', formula: '' },
  { id: '23', code: 'THUONG_QUY', name: 'Thưởng quý', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Thưởng', nature: 'income', valueType: 'currency', formula: '' },
  { id: '24', code: 'THUE_TNCN', name: 'Thuế TNCN', appliedUnit: 'Công ty TNHH Đại Thành', componentType: 'Thuế', nature: 'deduction', valueType: 'currency', formula: '=IF(THU_NHAP_CHIU_THUE>0,TIEN_THUE_TNCN,0)' },
];

// Advance batch interface (Bảng tạm ứng)
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

// Mock data for advance batches with multi-level approval
const advanceBatchesData: AdvanceBatch[] = [
  { 
    id: '1', 
    createdDate: '15/09/2021', 
    name: 'Bảng tạm ứng tháng 09/2021 - VP Cần Thơ', 
    salaryPeriod: 'Tháng 09/2021', 
    department: 'Văn phòng UNICOM Cần Thơ', 
    position: 'Tất cả các vị trí trong đơn vị', 
    employeeCount: 25, 
    totalAmount: 125000000, 
    status: 'paid',
    currentApprovalLevel: 3,
    approvalSteps: [
      { level: 1, title: 'Trưởng phòng', approverName: 'Nguyễn Văn An', approverPosition: 'Trưởng phòng Nhân sự', status: 'approved', approvedAt: '16/09/2021 08:30', note: 'Đã xác nhận số liệu' },
      { level: 2, title: 'Kế toán trưởng', approverName: 'Trần Thị Bình', approverPosition: 'Kế toán trưởng', status: 'approved', approvedAt: '16/09/2021 14:00', note: 'Đã kiểm tra ngân sách' },
      { level: 3, title: 'Giám đốc', approverName: 'Lê Văn Cường', approverPosition: 'Giám đốc', status: 'approved', approvedAt: '17/09/2021 09:15', note: 'Phê duyệt chi trả' }
    ]
  },
  { 
    id: '2', 
    createdDate: '15/09/2021', 
    name: 'Bảng tạm ứng tháng 09/2021 - VP Hà Nội', 
    salaryPeriod: 'Tháng 09/2021', 
    department: 'Văn phòng UNICOM Hà Nội', 
    position: 'Tất cả các vị trí trong đơn vị', 
    employeeCount: 45, 
    totalAmount: 225000000, 
    status: 'approved',
    currentApprovalLevel: 2,
    approvalSteps: [
      { level: 1, title: 'Trưởng phòng', approverName: 'Nguyễn Văn An', approverPosition: 'Trưởng phòng Nhân sự', status: 'approved', approvedAt: '16/09/2021 10:00', note: '' },
      { level: 2, title: 'Kế toán trưởng', approverName: 'Trần Thị Bình', approverPosition: 'Kế toán trưởng', status: 'approved', approvedAt: '17/09/2021 11:30', note: 'OK' },
      { level: 3, title: 'Giám đốc', approverName: '', approverPosition: 'Giám đốc', status: 'pending', note: '' }
    ]
  },
  { 
    id: '3', 
    createdDate: '15/08/2021', 
    name: 'Bảng tạm ứng tháng 08/2021 - VP Đà Nẵng', 
    salaryPeriod: 'Tháng 08/2021', 
    department: 'Văn phòng UNICOM Đà Nẵng', 
    position: 'Tất cả các vị trí trong đơn vị', 
    employeeCount: 18, 
    totalAmount: 90000000, 
    status: 'paid',
    currentApprovalLevel: 3,
    approvalSteps: [
      { level: 1, title: 'Trưởng phòng', approverName: 'Phạm Văn Dũng', approverPosition: 'Trưởng phòng', status: 'approved', approvedAt: '16/08/2021 09:00' },
      { level: 2, title: 'Kế toán trưởng', approverName: 'Hoàng Thị Em', approverPosition: 'Kế toán trưởng', status: 'approved', approvedAt: '16/08/2021 15:00' },
      { level: 3, title: 'Giám đốc', approverName: 'Lê Văn Cường', approverPosition: 'Giám đốc', status: 'approved', approvedAt: '17/08/2021 08:00' }
    ]
  },
  { 
    id: '4', 
    createdDate: '15/08/2021', 
    name: 'Bảng tạm ứng tháng 08/2021 - VP TP.HCM', 
    salaryPeriod: 'Tháng 08/2021', 
    department: 'Văn phòng UNICOM TP.HCM', 
    position: 'Tất cả các vị trí trong đơn vị', 
    employeeCount: 32, 
    totalAmount: 160000000, 
    status: 'rejected',
    currentApprovalLevel: 2,
    approvalSteps: [
      { level: 1, title: 'Trưởng phòng', approverName: 'Nguyễn Văn Phong', approverPosition: 'Trưởng phòng', status: 'approved', approvedAt: '16/08/2021 10:00' },
      { level: 2, title: 'Kế toán trưởng', approverName: 'Trần Thị Bình', approverPosition: 'Kế toán trưởng', status: 'rejected', approvedAt: '17/08/2021 09:00', note: 'Số liệu chưa khớp, cần kiểm tra lại' },
      { level: 3, title: 'Giám đốc', approverName: '', approverPosition: 'Giám đốc', status: 'pending' }
    ]
  },
  { 
    id: '5', 
    createdDate: '10/10/2021', 
    name: 'Bảng tạm ứng tháng 10/2021 - VP Hà Nội', 
    salaryPeriod: 'Tháng 10/2021', 
    department: 'Văn phòng UNICOM Hà Nội', 
    position: 'Tất cả các vị trí trong đơn vị', 
    employeeCount: 45, 
    totalAmount: 230000000, 
    status: 'pending',
    currentApprovalLevel: 1,
    approvalSteps: [
      { level: 1, title: 'Trưởng phòng', approverName: '', approverPosition: 'Trưởng phòng Nhân sự', status: 'pending' },
      { level: 2, title: 'Kế toán trưởng', approverName: '', approverPosition: 'Kế toán trưởng', status: 'pending' },
      { level: 3, title: 'Giám đốc', approverName: '', approverPosition: 'Giám đốc', status: 'pending' }
    ]
  },
];

// Mock data for advance employees detail
const advanceEmployeesData: AdvanceEmployee[] = [
  { id: '1', code: 'NV001', name: 'Đoàn Văn Đức', department: 'Phòng Kỹ thuật', position: 'Lập trình viên', advanceAmount: 5000000, note: '' },
  { id: '2', code: 'NV002', name: 'Nguyễn Thị Hồng', department: 'Phòng Nhân sự', position: 'Chuyên viên', advanceAmount: 4000000, note: '' },
  { id: '3', code: 'NV003', name: 'Nguyễn Diệu Quỳnh', department: 'Phòng Marketing', position: 'Trưởng phòng', advanceAmount: 8000000, note: 'Tạm ứng khẩn cấp' },
  { id: '4', code: 'NV004', name: 'Trần Văn Minh', department: 'Phòng Kế toán', position: 'Kế toán trưởng', advanceAmount: 6000000, note: '' },
  { id: '5', code: 'NV005', name: 'Nguyễn Hoàn Lan Anh', department: 'Phòng Kinh doanh', position: 'Nhân viên', advanceAmount: 3000000, note: '' },
  { id: '6', code: 'NV006', name: 'Nguyễn Đức Quảng', department: 'Phòng Kỹ thuật', position: 'Quản lý', advanceAmount: 10000000, note: '' },
  { id: '7', code: 'NV007', name: 'Nguyễn Quang Hoàng', department: 'Phòng Hành chính', position: 'Nhân viên', advanceAmount: 2500000, note: '' },
  { id: '8', code: 'NV008', name: 'Hoàng Minh Bảo', department: 'Phòng Kỹ thuật', position: 'Lập trình viên', advanceAmount: 4500000, note: '' },
];

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

// Mock data for payroll summary employees
const payrollSummaryEmployeesData: PayrollSummaryEmployee[] = [
  { id: '1', code: 'NV001', name: 'Đoàn Văn Đức', department: 'Phòng Kỹ thuật', position: 'Lập trình viên', baseSalary: 25000000, allowances: 2000000, bonus: 3000000, insurance: 2625000, tax: 1200000, deductions: 0, netSalary: 26175000 },
  { id: '2', code: 'NV002', name: 'Nguyễn Thị Hồng', department: 'Phòng Nhân sự', position: 'Chuyên viên', baseSalary: 18000000, allowances: 1500000, bonus: 1000000, insurance: 1890000, tax: 500000, deductions: 0, netSalary: 18110000 },
  { id: '3', code: 'NV003', name: 'Nguyễn Diệu Quỳnh', department: 'Phòng Marketing', position: 'Trưởng phòng', baseSalary: 35000000, allowances: 5000000, bonus: 5000000, insurance: 3675000, tax: 3500000, deductions: 500000, netSalary: 37325000 },
  { id: '4', code: 'NV004', name: 'Trần Văn Minh', department: 'Phòng Kế toán', position: 'Kế toán trưởng', baseSalary: 28000000, allowances: 3000000, bonus: 2000000, insurance: 2940000, tax: 1800000, deductions: 0, netSalary: 28260000 },
  { id: '5', code: 'NV005', name: 'Nguyễn Hoàn Lan Anh', department: 'Phòng Kinh doanh', position: 'Nhân viên', baseSalary: 15000000, allowances: 1000000, bonus: 2500000, insurance: 1575000, tax: 300000, deductions: 0, netSalary: 16625000 },
  { id: '6', code: 'NV006', name: 'Nguyễn Đức Quảng', department: 'Phòng Kỹ thuật', position: 'Quản lý', baseSalary: 40000000, allowances: 5000000, bonus: 8000000, insurance: 4200000, tax: 5000000, deductions: 0, netSalary: 43800000 },
  { id: '7', code: 'NV007', name: 'Nguyễn Quang Hoàng', department: 'Phòng Hành chính', position: 'Nhân viên', baseSalary: 12000000, allowances: 800000, bonus: 500000, insurance: 1260000, tax: 0, deductions: 0, netSalary: 12040000 },
  { id: '8', code: 'NV008', name: 'Hoàng Minh Bảo', department: 'Phòng Kỹ thuật', position: 'Lập trình viên', baseSalary: 22000000, allowances: 2000000, bonus: 2000000, insurance: 2310000, tax: 900000, deductions: 0, netSalary: 22790000 },
  { id: '9', code: 'NV009', name: 'Phạm Hoàng Lan', department: 'Phòng Marketing', position: 'Nhân viên', baseSalary: 16000000, allowances: 1200000, bonus: 1500000, insurance: 1680000, tax: 400000, deductions: 0, netSalary: 16620000 },
  { id: '10', code: 'NV010', name: 'Trần Văn Nam', department: 'Phòng Kinh doanh', position: 'Trưởng nhóm', baseSalary: 30000000, allowances: 3500000, bonus: 6000000, insurance: 3150000, tax: 2500000, deductions: 0, netSalary: 33850000 },
];

// Payroll summary batch mock data
const payrollSummaryBatches: PayrollSummaryBatch[] = [
  { id: '1', summaryDate: '07/10/2021', name: 'Bảng tổng hợp lương tháng 9/2021', salaryPeriod: 'Tháng 09/2021', department: 'Công ty cổ phần UNICOM', position: 'Tất cả các vị trí trong đơn vị' },
  { id: '2', summaryDate: '07/09/2021', name: 'Bảng tổng hợp lương tháng 8/2021', salaryPeriod: 'Tháng 08/2021', department: 'Công ty cổ phần UNICOM', position: 'Tất cả các vị trí trong đơn vị' },
  { id: '3', summaryDate: '07/08/2021', name: 'Bảng tổng hợp lương tháng 7/2021', salaryPeriod: 'Tháng 07/2021', department: 'Công ty cổ phần UNICOM', position: 'Tất cả các vị trí trong đơn vị' },
  { id: '4', summaryDate: '07/07/2021', name: 'Bảng tổng hợp lương tháng 6/2021', salaryPeriod: 'Tháng 06/2021', department: 'Công ty cổ phần UNICOM', position: 'Tất cả các vị trí trong đơn vị' },
  { id: '5', summaryDate: '07/06/2021', name: 'Bảng tổng hợp lương tháng 5/2021', salaryPeriod: 'Tháng 05/2021', department: 'Công ty cổ phần UNICOM', position: 'Tất cả các vị trí trong đơn vị' },
  { id: '6', summaryDate: '07/05/2021', name: 'Bảng tổng hợp lương tháng 4/2021', salaryPeriod: 'Tháng 04/2021', department: 'Công ty cổ phần UNICOM', position: 'Tất cả các vị trí trong đơn vị' },
  { id: '7', summaryDate: '07/04/2021', name: 'Bảng tổng hợp lương tháng 3/2021', salaryPeriod: 'Tháng 03/2021', department: 'Công ty cổ phần UNICOM', position: 'Tất cả các vị trí trong đơn vị' },
  { id: '8', summaryDate: '08/03/2021', name: 'Bảng tổng hợp lương tháng 2/2021', salaryPeriod: 'Tháng 02/2021', department: 'Công ty cổ phần UNICOM', position: 'Tất cả các vị trí trong đơn vị' },
  { id: '9', summaryDate: '08/02/2021', name: 'Bảng tổng hợp lương tháng 1/2021', salaryPeriod: 'Tháng 01/2021', department: 'Công ty cổ phần UNICOM', position: 'Tất cả các vị trí trong đơn vị' },
];

// Payroll feedback mock data
const payrollFeedbackData = [
  {
    id: '1',
    title: 'Bảng lương tháng 11 - 2020',
    department: 'Văn phòng MISA Hà Nội - Trung tâm kinh doanh DN',
    avatars: ['NT', 'VH', 'TL', 'HN', 'MT'],
    extraCount: 3,
  },
  {
    id: '2',
    title: 'Bảng lương tháng 11 - 2020',
    department: 'Văn phòng MISA Hà Nội - Trung tâm kinh doanh DN',
    avatars: ['LH', 'TM', 'VN', 'PH'],
    extraCount: 1,
  },
];

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
  'Văn phòng Tổng công ty',
  'Văn phòng UNICOM Hà Nội',
  'Văn phòng UNICOM Đà Nẵng',
  'Văn phòng UNICOM Tp Hồ Chí Minh',
  'Văn phòng UNICOM Cần Thơ',
  'Trung tâm Tư vấn & Hỗ trợ khách hàng',
];

// Tax settlement employee interface for detail view
interface TaxSettlementEmployee {
  id: string;
  code: string;
  name: string;
  avatar?: string;
  totalTaxableIncome: number;
  dependents: number;
  familyDeduction: number;
  unemploymentInsurance: number; // BHTN 1.0%
  socialInsurance: number; // BHXH 8.0%
  healthInsurance: number; // BHYT 1.5%
  totalDeduction: number;
  taxableIncomeAfterDeduction: number;
  taxPayable: number;
  taxPaid: number;
}

// Tax settlement employees data (empty - loaded from database)
const taxSettlementEmployeesData: TaxSettlementEmployee[] = [];

// Tax policy participant interface
interface TaxPolicyParticipant {
  id: string;
  code: string;
  name: string;
  avatar?: string;
  position: string;
  policyType: 'progressive' | 'flat'; // Thuế theo biểu lũy tiến / Thuế theo hệ số phần trăm cố định
  policyName: string;
  effectiveDate: string;
  status: 'active' | 'inactive'; // Khả dụng / Không khả dụng
  createdBy: string;
  createdByPosition: string;
}

// Mock data for tax policy participants
const taxPolicyParticipantsData: TaxPolicyParticipant[] = [
  { id: '1', code: 'BASE-069', name: 'Nguyễn Tuấn Dương', position: 'Trưởng phòng', policyType: 'progressive', policyName: 'Thuế theo biểu lũy tiến', effectiveDate: '01/07/2022', status: 'active', createdBy: 'Nguyễn Tuấn Dương', createdByPosition: 'Trưởng phòng' },
  { id: '2', code: 'BASE-069', name: 'Nguyễn Tuấn Dương', position: 'Trưởng phòng', policyType: 'flat', policyName: 'Thuế theo hệ số phần trăm cố định', effectiveDate: '01/05/2022', status: 'inactive', createdBy: 'Nguyễn Tuấn Dương', createdByPosition: 'Trưởng phòng' },
  { id: '3', code: 'BASE-0266', name: 'Trịnh Thảo', position: 'Nhân viên', policyType: 'progressive', policyName: 'Thuế theo biểu lũy tiến', effectiveDate: '01/03/2022', status: 'active', createdBy: 'Trịnh Thảo', createdByPosition: 'Nhân viên Hành chính' },
  { id: '4', code: 'BASE-9999', name: 'Hoàng Nguyễn', position: 'Chuyên viên', policyType: 'progressive', policyName: 'Thuế theo biểu lũy tiến', effectiveDate: '14/03/2020', status: 'active', createdBy: 'Hoàng Thanh Tùng', createdByPosition: 'Chuyên viên kỹ thuật' },
  { id: '5', code: 'MV009', name: 'Đình Tấn Cường', position: 'Trưởng Phòng', policyType: 'progressive', policyName: 'Thuế theo biểu lũy tiến', effectiveDate: '01/01/2021', status: 'active', createdBy: 'Hoàng Thanh Tùng', createdByPosition: 'Chuyên viên kỹ thuật' },
  { id: '6', code: 'MV009', name: 'Đình Tấn Cường', position: 'Trưởng Phòng', policyType: 'flat', policyName: 'Thuế theo hệ số phần trăm cố định', effectiveDate: '01/01/2021', status: 'inactive', createdBy: 'Hoàng Thanh Tùng', createdByPosition: 'Chuyên viên kỹ thuật' },
];

// Insurance policy participant interface
interface InsurancePolicyParticipant {
  id: string;
  code: string;
  name: string;
  avatar?: string;
  position: string;
  insuranceType: 'social' | 'health' | 'unemployment' | 'all'; // BHXH / BHYT / BHTN / Tất cả
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

// Mock data for insurance policy participants
const insurancePolicyParticipantsData: InsurancePolicyParticipant[] = [
  { id: 'ins1', code: 'NV001', name: 'Nguyễn Văn An', position: 'Lập trình viên', insuranceType: 'all', insuranceName: 'Bảo hiểm đầy đủ', effectiveDate: '01/01/2023', status: 'active', socialInsuranceNumber: 'SN123456789', healthInsuranceNumber: 'HN123456789', baseSalary: 15000000, createdBy: 'Trần Thị Bình', createdByPosition: 'HR Manager' },
  { id: 'ins2', code: 'NV002', name: 'Trần Thị Bình', position: 'Kế toán trưởng', insuranceType: 'all', insuranceName: 'Bảo hiểm đầy đủ', effectiveDate: '01/02/2023', status: 'active', socialInsuranceNumber: 'SN234567890', healthInsuranceNumber: 'HN234567890', baseSalary: 25000000, createdBy: 'Nguyễn Văn An', createdByPosition: 'Admin' },
  { id: 'ins3', code: 'NV003', name: 'Lê Văn Cường', position: 'Nhân viên kinh doanh', insuranceType: 'social', insuranceName: 'BHXH', effectiveDate: '15/03/2023', status: 'active', socialInsuranceNumber: 'SN345678901', baseSalary: 12000000, createdBy: 'Trần Thị Bình', createdByPosition: 'HR Manager' },
  { id: 'ins4', code: 'NV004', name: 'Phạm Thị Dung', position: 'Nhân viên nhân sự', insuranceType: 'all', insuranceName: 'Bảo hiểm đầy đủ', effectiveDate: '01/01/2022', expiryDate: '31/12/2023', status: 'expired', socialInsuranceNumber: 'SN456789012', healthInsuranceNumber: 'HN456789012', baseSalary: 14000000, createdBy: 'Nguyễn Văn An', createdByPosition: 'Admin' },
  { id: 'ins5', code: 'NV005', name: 'Hoàng Văn Em', position: 'Quản lý', insuranceType: 'health', insuranceName: 'BHYT', effectiveDate: '01/06/2023', status: 'active', healthInsuranceNumber: 'HN567890123', baseSalary: 30000000, createdBy: 'Trần Thị Bình', createdByPosition: 'HR Manager' },
  { id: 'ins6', code: 'NV006', name: 'Ngô Thị Phương', position: 'Marketing', insuranceType: 'all', insuranceName: 'Bảo hiểm đầy đủ', effectiveDate: '01/04/2023', status: 'active', socialInsuranceNumber: 'SN678901234', healthInsuranceNumber: 'HN678901234', baseSalary: 16000000, createdBy: 'Phạm Thị Dung', createdByPosition: 'Nhân sự' },
  { id: 'ins7', code: 'NV007', name: 'Đỗ Minh Quân', position: 'Lập trình viên Senior', insuranceType: 'unemployment', insuranceName: 'BHTN', effectiveDate: '01/05/2023', status: 'inactive', baseSalary: 35000000, createdBy: 'Trần Thị Bình', createdByPosition: 'HR Manager' },
  { id: 'ins8', code: 'NV008', name: 'Vũ Thị Hồng', position: 'Chuyên viên', insuranceType: 'all', insuranceName: 'Bảo hiểm đầy đủ', effectiveDate: '01/07/2023', status: 'active', socialInsuranceNumber: 'SN890123456', healthInsuranceNumber: 'HN890123456', baseSalary: 18000000, createdBy: 'Phạm Thị Dung', createdByPosition: 'Nhân sự' },
];

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

// Payment batch mock data
const paymentBatchesData: PaymentBatch[] = [
  {
    id: '1',
    name: 'Bảng chi trả lương tháng 9/2021 - VP Đà Nẵng',
    salaryPeriod: 'Tháng 09/2021',
    department: 'Văn phòng UNICOM Đà Nẵng',
    position: 'Tất cả các vị trí trong đơn vị',
    paymentMethod: 'Tiền mặt',
    status: 'pending',
  },
  {
    id: '2',
    name: 'Bảng chi trả lương tháng 9/2021 - VP Hà Nội',
    salaryPeriod: 'Tháng 09/2021',
    department: 'Văn phòng UNICOM Hà Nội',
    position: 'Tất cả các vị trí trong đơn vị',
    paymentMethod: 'Chuyển khoản',
    status: 'paid',
  },
  {
    id: '3',
    name: 'Bảng chi trả lương tháng 9/2021 - VP Buôn Ma Thuột',
    salaryPeriod: 'Tháng 09/2021',
    department: 'Văn phòng UNICOM Buôn Ma Thuột',
    position: 'Tất cả các vị trí trong đơn vị',
    paymentMethod: 'Chuyển khoản',
    status: 'paid',
  },
  {
    id: '4',
    name: 'Bảng chi trả lương tháng 09/2021 - TT TV&HTKH',
    salaryPeriod: 'Tháng 09/2021',
    department: 'Trung tâm Tư vấn & Hỗ trợ khách hàng',
    position: 'Tất cả các vị trí trong đơn vị',
    paymentMethod: 'Chuyển khoản',
    status: 'paid',
  },
  {
    id: '5',
    name: 'Bảng chi trả lương tháng 9/2021 - VP Cần Thơ',
    salaryPeriod: 'Tháng 09/2021',
    department: 'Văn phòng UNICOM Cần Thơ',
    position: 'Tất cả các vị trí trong đơn vị',
    paymentMethod: 'Tiền mặt',
    status: 'paid',
  },
];

export default function Payroll() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayroll, setSelectedPayroll] = useState<any | null>(null);
  const [monthFilter, setMonthFilter] = useState('2024-01');
  const [selectedPaymentBatch, setSelectedPaymentBatch] = useState<PaymentBatch | null>(null);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [selectedEmployeesToAdd, setSelectedEmployeesToAdd] = useState<string[]>([]);
  const [showAddPayrollSummaryDialog, setShowAddPayrollSummaryDialog] = useState(false);
  const [showDeletePayrollBatchDialog, setShowDeletePayrollBatchDialog] = useState(false);
  const [payrollBatchToDelete, setPayrollBatchToDelete] = useState<PayrollSummaryBatch | null>(null);
  const [selectedPayrollSummaryBatch, setSelectedPayrollSummaryBatch] = useState<PayrollSummaryBatch | null>(null);
  const [showPayslipPrintDialog, setShowPayslipPrintDialog] = useState(false);
  const [printEmployeeIndex, setPrintEmployeeIndex] = useState(0);
  
  // Sorting state for payroll summary detail
  const [sortField, setSortField] = useState<'name' | 'department' | 'baseSalary' | 'netSalary' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Department filter for payroll summary detail
  const [payrollDepartmentFilter, setPayrollDepartmentFilter] = useState('all');
  
  // Advance (Tạm ứng) state
  const [showAddAdvanceDialog, setShowAddAdvanceDialog] = useState(false);
  const [advanceFormData, setAdvanceFormData] = useState({
    payrollBatch: '',
    department: '',
    position: 'all',
    employeeType: 'all', // 'all' | 'selected'
    advanceName: '',
    description: ''
  });
  
  // Advance management states
  const [selectedAdvanceBatch, setSelectedAdvanceBatch] = useState<AdvanceBatch | null>(null);
  const [selectedAdvanceBatches, setSelectedAdvanceBatches] = useState<string[]>([]);
  const [showDeleteAdvanceDialog, setShowDeleteAdvanceDialog] = useState(false);
  const [advanceToDelete, setAdvanceToDelete] = useState<AdvanceBatch | null>(null);
  const [showEditAdvanceDialog, setShowEditAdvanceDialog] = useState(false);
  const [advanceToEdit, setAdvanceToEdit] = useState<AdvanceBatch | null>(null);
  
  // Approval workflow states
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNote, setApprovalNote] = useState('');
  
  // Tax settlement states
  const [taxSettlements, setTaxSettlements] = useState<TaxSettlement[]>(taxSettlementsData);
  const [taxSettlementSearch, setTaxSettlementSearch] = useState('');
  const [taxSettlementUnitFilter, setTaxSettlementUnitFilter] = useState('all');
  const [selectedTaxSettlements, setSelectedTaxSettlements] = useState<string[]>([]);
  const [showAddTaxSettlementDialog, setShowAddTaxSettlementDialog] = useState(false);
  const [taxSettlementFormData, setTaxSettlementFormData] = useState({
    year: new Date().getFullYear(),
    appliedUnits: [] as string[],
    name: '',
    monthlyTaxTables: {} as Record<number, string>,
  });
  const [selectedTaxSettlement, setSelectedTaxSettlement] = useState<TaxSettlement | null>(null);
  const [taxSettlementDetailSearch, setTaxSettlementDetailSearch] = useState('');
  const [taxSettlementDetailStatusFilter, setTaxSettlementDetailStatusFilter] = useState('all');
  const [taxSettlementDetailUnitFilter, setTaxSettlementDetailUnitFilter] = useState('all');
  const [selectedTaxSettlementEmployees, setSelectedTaxSettlementEmployees] = useState<string[]>([]);
  const [showEditTaxEmployeeDialog, setShowEditTaxEmployeeDialog] = useState(false);
  const [taxEmployeeToEdit, setTaxEmployeeToEdit] = useState<TaxSettlementEmployee | null>(null);
  const [taxEmployeeEditForm, setTaxEmployeeEditForm] = useState({
    totalTaxableIncome: 0,
    dependents: 0,
    familyDeduction: 0,
    unemploymentInsurance: 0,
    socialInsurance: 0,
    healthInsurance: 0,
    taxPayable: 0,
    taxPaid: 0,
  });
  const [taxSettlementEmployees, setTaxSettlementEmployees] = useState<TaxSettlementEmployee[]>(taxSettlementEmployeesData);
  
  // Tax refund (Hoàn thuế) states
  const [showTaxRefundDialog, setShowTaxRefundDialog] = useState(false);
  const [taxRefundFormData, setTaxRefundFormData] = useState({
    date: new Date(),
    appliedUnits: [] as string[],
    position: 'all',
    employeeType: 'all' as 'all' | 'selected',
    name: '',
    incomeType: 'Thuế TNCN được hoàn',
  });
  
  // Tax deduction (Khấu trừ thuế) states
  const [showTaxDeductionDialog, setShowTaxDeductionDialog] = useState(false);
  const [taxDeductionFormData, setTaxDeductionFormData] = useState({
    date: new Date(),
    appliedUnits: [] as string[],
    position: 'all',
    employeeType: 'all' as 'all' | 'selected',
    name: '',
    deductionType: 'Thuế TNCN khấu trừ',
  });
  
  // Delete tax settlement employee states
  const [showDeleteTaxEmployeeDialog, setShowDeleteTaxEmployeeDialog] = useState(false);
  const [taxEmployeeToDelete, setTaxEmployeeToDelete] = useState<TaxSettlementEmployee | null>(null);
  const [showBulkDeleteTaxEmployeeDialog, setShowBulkDeleteTaxEmployeeDialog] = useState(false);
  
  // Get unique departments from payroll data
  const payrollDepartments = [...new Set(payrollSummaryEmployeesData.map(emp => emp.department))];
  
  // Filtered advance batches
  const filteredAdvanceBatches = advanceBatchesData.filter(
    (batch) =>
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.department.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Toggle advance batch selection
  const toggleAdvanceBatchSelection = (batchId: string) => {
    setSelectedAdvanceBatches(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };
  
  // Toggle select all advance batches
  const toggleSelectAllAdvanceBatches = () => {
    if (selectedAdvanceBatches.length === filteredAdvanceBatches.length) {
      setSelectedAdvanceBatches([]);
    } else {
      setSelectedAdvanceBatches(filteredAdvanceBatches.map(b => b.id));
    }
  };
  
  // Get advance status badge
  const getAdvanceStatusBadge = (status: AdvanceBatch['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">{t('payroll.advanceList.paid')}</Badge>;
      case 'approved':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{t('payroll.advanceList.approved')}</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">{t('payroll.advanceList.pending')}</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">{t('payroll.advanceList.rejected')}</Badge>;
    }
  };
  
  // Get approval step status badge
  const getApprovalStepBadge = (status: ApprovalStep['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/10 text-success hover:bg-success/20 text-xs">{t('payroll.advanceList.approved')}</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs">{t('payroll.advanceList.rejected')}</Badge>;
      case 'pending':
        return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 text-xs">{t('payroll.advanceList.pending')}</Badge>;
    }
  };

  // Handle sorting
  const handleSort = (field: 'name' | 'department' | 'baseSalary' | 'netSalary') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: 'name' | 'department' | 'baseSalary' | 'netSalary') => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1 text-primary" />
      : <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
  };

  // Sorted and filtered employees for payroll summary
  const sortedPayrollSummaryEmployees = [...payrollSummaryEmployeesData]
    .filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = payrollDepartmentFilter === 'all' || emp.department === payrollDepartmentFilter;
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'vi');
          break;
        case 'department':
          comparison = a.department.localeCompare(b.department, 'vi');
          break;
        case 'baseSalary':
          comparison = a.baseSalary - b.baseSalary;
          break;
        case 'netSalary':
          comparison = a.netSalary - b.netSalary;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Mock employee list for adding to attendance
  const availableEmployees = [
    { id: 'nv011', code: 'NV011', name: 'Trần Minh Tuấn', department: 'Văn phòng tổng công ty', position: 'Nhân viên' },
    { id: 'nv012', code: 'NV012', name: 'Lê Thị Hương', department: 'Văn phòng UNICOM Hà Nội', position: 'Kế toán' },
    { id: 'nv013', code: 'NV013', name: 'Phạm Văn Đức', department: 'Văn phòng tổng công ty', position: 'Lập trình viên' },
    { id: 'nv014', code: 'NV014', name: 'Nguyễn Thị Mai', department: 'Văn phòng UNICOM Đà Nẵng', position: 'Nhân sự' },
    { id: 'nv015', code: 'NV015', name: 'Hoàng Văn Nam', department: 'Văn phòng tổng công ty', position: 'Quản lý' },
    { id: 'nv016', code: 'NV016', name: 'Vũ Thị Lan', department: 'Văn phòng UNICOM Hà Nội', position: 'Marketing' },
    { id: 'nv017', code: 'NV017', name: 'Đỗ Minh Quang', department: 'Văn phòng UNICOM TP.HCM', position: 'Kinh doanh' },
    { id: 'nv018', code: 'NV018', name: 'Bùi Thị Hoa', department: 'Văn phòng tổng công ty', position: 'Thư ký' },
  ];
  const [addEmployeeSearchQuery, setAddEmployeeSearchQuery] = useState('');
  const [addEmployeeDepartmentFilter, setAddEmployeeDepartmentFilter] = useState('all');

  const filteredAvailableEmployees = availableEmployees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(addEmployeeSearchQuery.toLowerCase()) ||
      emp.code.toLowerCase().includes(addEmployeeSearchQuery.toLowerCase());
    const matchesDepartment = addEmployeeDepartmentFilter === 'all' || emp.department === addEmployeeDepartmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const toggleEmployeeSelection = (empId: string) => {
    setSelectedEmployeesToAdd(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const toggleSelectAllEmployees = () => {
    if (selectedEmployeesToAdd.length === filteredAvailableEmployees.length) {
      setSelectedEmployeesToAdd([]);
    } else {
      setSelectedEmployeesToAdd(filteredAvailableEmployees.map(emp => emp.id));
    }
  };

  const filteredRecords: any[] = []; // Payroll records now managed via PayrollBatchesTab

  const filteredPaymentBatches = paymentBatchesData.filter(
    (batch) =>
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.department.toLowerCase().includes(searchQuery.toLowerCase())
  );


  // Active data sub-tab

  // Active data sub-tab
  const [activeDataSubTab, setActiveDataSubTab] = useState('data-attendance');
  
  // Active calculate sub-tab
  const [activeCalcSubTab, setActiveCalcSubTab] = useState('calc-list');
  
  // Active policy sub-tab
  const [activePolicySubTab, setActivePolicySubTab] = useState('tax');
  
  // Tax policy states
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
  
  // Available employees for adding to tax policy (mock data)
  const availableTaxPolicyEmployees = [
    { id: 'tp1', code: 'NV001', name: 'Nguyễn Văn An', position: 'Lập trình viên', department: 'Phòng Kỹ thuật', avatar: '' },
    { id: 'tp2', code: 'NV002', name: 'Trần Thị Bình', position: 'Kế toán trưởng', department: 'Phòng Kế toán', avatar: '' },
    { id: 'tp3', code: 'NV003', name: 'Lê Văn Cường', position: 'Nhân viên kinh doanh', department: 'Phòng Kinh doanh', avatar: '' },
    { id: 'tp4', code: 'NV004', name: 'Phạm Thị Dung', position: 'Nhân viên nhân sự', department: 'Phòng Nhân sự', avatar: '' },
    { id: 'tp5', code: 'NV005', name: 'Hoàng Văn Em', position: 'Quản lý', department: 'Phòng Hành chính', avatar: '' },
    { id: 'tp6', code: 'NV006', name: 'Ngô Thị Phương', position: 'Marketing', department: 'Phòng Marketing', avatar: '' },
    { id: 'tp7', code: 'NV007', name: 'Đỗ Minh Quân', position: 'Lập trình viên Senior', department: 'Phòng Kỹ thuật', avatar: '' },
    { id: 'tp8', code: 'NV008', name: 'Vũ Thị Hồng', position: 'Chuyên viên', department: 'Phòng Kế toán', avatar: '' },
    { id: 'tp9', code: 'NV009', name: 'Bùi Văn Tuấn', position: 'Trưởng nhóm', department: 'Phòng Kinh doanh', avatar: '' },
    { id: 'tp10', code: 'NV010', name: 'Mai Thị Lan', position: 'Thư ký', department: 'Phòng Hành chính', avatar: '' },
  ];
  
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
  
  // Selected payroll summary batches for bulk actions
  const [selectedPayrollBatches, setSelectedPayrollBatches] = useState<string[]>([]);
  

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
  const totalNet = filteredRecords.reduce((sum, r) => sum + r.netSalary, 0);
  const totalTax = filteredRecords.reduce((sum, r) => sum + r.tax, 0);
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
        className={cn(
          'flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all group touch-target',
          isActive
            ? 'bg-primary/10 text-foreground'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
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
                  tab.id === 'policy' && activePolicySubTab === item.id && 'text-emerald-600 font-medium',
                  tab.id === 'data' && activeDataSubTab === item.id && 'text-emerald-600 font-medium',
                  tab.id === 'calculate' && activeCalcSubTab === item.id && 'text-emerald-600 font-medium'
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
      <div className="space-y-6 p-3 md:p-6">
        {/* Welcome Banner */}
         <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-4 md:p-6">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
             <div>
               <h2 className="text-lg md:text-xl font-semibold">{t('payroll.overviewWelcome.greeting')}</h2>
               <p className="text-muted-foreground text-sm">
                 {t('payroll.overviewWelcome.description')}
               </p>
             </div>
             <Button variant="outline" className="gap-2 shrink-0 w-fit" size="sm">
               <Play className="w-4 h-4" />
               {t('payroll.overviewWelcome.beginnerGuide')}
             </Button>
           </div>

          {/* Step Cards */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {stepCards.map((step) => {
              const Icon = step.icon;
              return (
                 <Card 
                   key={step.id} 
                   className={cn(
                     'overflow-hidden cursor-pointer transition-transform hover:scale-105 min-w-[140px] sm:min-w-0 flex-1',
                     `bg-gradient-to-br ${step.gradient}`
                   )}
                 >
                  <CardContent className="p-4 text-white">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-tight">{step.id}. {step.title}</p>
                        <p className="text-xs opacity-80 mt-1">{step.subtitle}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main Grid */}
         <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Salary Summary Card */}
          <div className="md:col-span-5">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{t('payroll.salarySummary.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('payroll.salarySummary.officeThisMonth')}</p>
                    
                    <div className="grid grid-cols-3 gap-6 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">{t('payroll.salarySummary.totalSalary')}</p>
                        <p className="text-2xl font-bold text-primary">
                          {(totalNet / 1000000).toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">{t('payroll.salarySummary.millionVnd')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">{t('payroll.salarySummary.personalTax')}</p>
                        <p className="text-2xl font-bold text-amber-500">
                          {(totalTax / 1000000).toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">{t('payroll.salarySummary.millionVnd')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">{t('payroll.salarySummary.insurance')}</p>
                        <p className="text-2xl font-bold text-rose-500">
                          {(totalInsurance / 1000000).toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">{t('payroll.salarySummary.millionVnd')}</p>
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
              <CardContent className="space-y-4">
                {payrollFeedbackData.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.department}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {item.avatars.map((avatar, idx) => (
                          <Avatar key={idx} className="w-7 h-7 border-2 border-background">
                            <AvatarFallback className="text-xs bg-primary/10">{avatar}</AvatarFallback>
                          </Avatar>
                        ))}
                        {item.extraCount > 0 && (
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                            +{item.extraCount}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {t('payroll.feedback.detail')}
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="link" size="sm" className="w-full text-xs">
                  {t('payroll.feedback.viewMore')} (5)
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
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
                    <p className="text-xs text-muted-foreground">{t('payroll.quickStats.paid')}</p>
                    <p className="text-xl font-bold">{paidCount} / {filteredRecords.length}</p>
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
                    <p className="text-xs text-muted-foreground">{t('payroll.quickStats.pendingApproval')}</p>
                    <p className="text-xl font-bold">{filteredRecords.length - paidCount}</p>
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
                    <CardTitle className="text-base">{t('payroll.salaryAnalysis.title')}</CardTitle>
                    <p className="text-xs text-muted-foreground">{t('payroll.salaryAnalysis.subtitle')}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{t('payroll.salaryAnalysis.salaryLevel')}</span>
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
                  <CardTitle className="text-base">{t('payroll.incomeStructure.title')}</CardTitle>
                  <p className="text-xs text-muted-foreground">{t('payroll.salaryAnalysis.subtitle')}</p>
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

  // Render payment batches list (Chi trả lương)
  const renderPaymentBatches = () => {
    if (selectedPaymentBatch) {
      return renderPaymentBatchDetail();
    }

    return (
      <div className="space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('payroll.paymentTab.title')}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              {t('payroll.paymentTab.initialDebt')}
            </Button>
            <Button 
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => setShowAddPaymentDialog(true)}
            >
              <Plus className="w-4 h-4" />
              {t('payroll.common.addNew')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('payroll.common.search')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('payroll.paymentTab.allUnits')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('payroll.paymentTab.allUnits')}</SelectItem>
              <SelectItem value="hanoi">VP Hà Nội</SelectItem>
              <SelectItem value="danang">VP Đà Nẵng</SelectItem>
              <SelectItem value="hcm">VP TP.HCM</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-sm w-10">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                   <th className="text-left p-4 font-medium text-sm">{t('payroll.paymentTab.batchName')}</th>
                   <th className="text-left p-4 font-medium text-sm">{t('payroll.paymentTab.period')}</th>
                   <th className="text-left p-4 font-medium text-sm">{t('payroll.paymentTab.appliedUnit')}</th>
                   <th className="text-left p-4 font-medium text-sm">{t('payroll.paymentTab.appliedPosition')}</th>
                   <th className="text-left p-4 font-medium text-sm">{t('payroll.paymentTab.paymentMethod')}</th>
                   <th className="text-left p-4 font-medium text-sm">{t('payroll.paymentTab.status')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPaymentBatches.map((batch) => (
                  <tr 
                    key={batch.id} 
                    className="border-b hover:bg-muted/30 cursor-pointer"
                    onClick={() => setSelectedPaymentBatch(batch)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-primary">{batch.name}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{batch.salaryPeriod}</td>
                    <td className="p-4 text-muted-foreground">{batch.department}</td>
                    <td className="p-4 text-muted-foreground">{batch.position}</td>
                    <td className="p-4 text-muted-foreground">{batch.paymentMethod}</td>
                    <td className="p-4">
                      <span className={cn(
                        'flex items-center gap-1.5 text-sm',
                        batch.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                      )}>
                        <span className={cn(
                          'w-2 h-2 rounded-full',
                          batch.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                        )} />
                        {batch.status === 'paid' ? t('payroll.paymentTab.paid') : t('payroll.paymentTab.notPaid')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // Render payment batch detail (employee list)
  const renderPaymentBatchDetail = () => {
    if (!selectedPaymentBatch) return null;

    return (
      <div className="space-y-4 p-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPaymentBatch(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
             {t('payroll.common.back')}
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{selectedPaymentBatch.name}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedPaymentBatch.department} • {selectedPaymentBatch.salaryPeriod}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={selectedPaymentBatch.status} />
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
               {t('payroll.paymentTab.exportExcel')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                 placeholder={t('payroll.paymentTab.searchEmployee')}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-01">{t('payroll.month')} 01/2024</SelectItem>
                <SelectItem value="2023-12">{t('payroll.month')} 12/2023</SelectItem>
                <SelectItem value="2023-11">{t('payroll.month')} 11/2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Employee Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-sm">{t('nav.employees')}</th>
                  <th className="text-left p-4 font-medium text-sm">{t('payroll.baseSalary')}</th>
                  <th className="text-left p-4 font-medium text-sm">{t('payroll.allowances')}</th>
                  <th className="text-left p-4 font-medium text-sm">{t('payroll.bonus')}</th>
                  <th className="text-left p-4 font-medium text-sm">{t('payroll.deductions')}</th>
                  <th className="text-left p-4 font-medium text-sm">{t('payroll.netSalary')}</th>
                  <th className="text-left p-4 font-medium text-sm">{t('common.status')}</th>
                  <th className="text-left p-4 font-medium text-sm"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr 
                    key={record.id} 
                    className="border-b hover:bg-muted/30 cursor-pointer"
                    onClick={() => setSelectedPayroll(record)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {record.employeeName.split(' ').pop()?.charAt(0)}
                        </div>
                        <span className="font-medium">{record.employeeName}</span>
                      </div>
                    </td>
                    <td className="p-4">{formatCurrency(record.baseSalary)}</td>
                    <td className="p-4 text-success">+{formatCurrency(record.allowances)}</td>
                    <td className="p-4 text-success">+{formatCurrency(record.bonus)}</td>
                    <td className="p-4 text-destructive">
                      -{formatCurrency(record.deductions + record.insurance + record.tax)}
                    </td>
                    <td className="p-4 font-bold text-primary">{formatCurrency(record.netSalary)}</td>
                    <td className="p-4"><StatusBadge status={record.status} /></td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedPayroll(record); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // Salary components state
  const [selectedSalaryComponents, setSelectedSalaryComponents] = useState<string[]>([]);
  const [salaryComponentStatusFilter, setSalaryComponentStatusFilter] = useState('all');
  const [salaryComponentUnitFilter, setSalaryComponentUnitFilter] = useState('all');
  const [salaryComponentsPage, setSalaryComponentsPage] = useState(1);
  const salaryComponentsPerPage = 25;
  
  // Salary component edit/delete states
  const [showEditSalaryComponentDialog, setShowEditSalaryComponentDialog] = useState(false);
  const [showDeleteSalaryComponentDialog, setShowDeleteSalaryComponentDialog] = useState(false);
  const [showAddSalaryComponentDialog, setShowAddSalaryComponentDialog] = useState(false);
  const [salaryComponentToEdit, setSalaryComponentToEdit] = useState<SalaryComponent | null>(null);
  const [salaryComponentToDelete, setSalaryComponentToDelete] = useState<SalaryComponent | null>(null);
  const [editSalaryComponentForm, setEditSalaryComponentForm] = useState({
    code: '',
    name: '',
    appliedUnit: '',
    componentType: '',
    nature: 'other' as SalaryComponent['nature'],
    valueType: 'number' as SalaryComponent['valueType'],
    formula: '',
  });
  
  // Add salary component form state
  const [addSalaryComponentForm, setAddSalaryComponentForm] = useState({
    code: '',
    name: '',
    appliedUnits: [] as string[],
    componentType: '',
    nature: 'income' as SalaryComponent['nature'],
    valueType: 'currency' as SalaryComponent['valueType'],
    isTaxable: true,
    quota: '',
    allowExceedQuota: false,
    formula: '',
    description: '',
  });
  
  // Add salary component form errors
  const [addSalaryComponentErrors, setAddSalaryComponentErrors] = useState<{
    code?: string;
    name?: string;
    appliedUnits?: string;
    componentType?: string;
  }>({});
  
  // Available units for multi-select
  const availableUnits = [
    'Văn phòng Hà Nội',
    'Văn phòng Cà Mau',
    'Văn phòng TP.HCM',
    'Văn phòng Đà Nẵng',
    'Công ty TNHH Đại Thành',
  ];
  
  // System components dialog state
  const [showSystemComponentsDialog, setShowSystemComponentsDialog] = useState(false);
  const [systemComponentsSearch, setSystemComponentsSearch] = useState('');
  const [systemComponentsTypeFilter, setSystemComponentsTypeFilter] = useState('all');
  const [selectedSystemComponents, setSelectedSystemComponents] = useState<string[]>([]);
  const [systemComponentsPage, setSystemComponentsPage] = useState(1);
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
    setShowSystemComponentsDialog(false);
    setSelectedSystemComponents([]);
    setSystemComponentsSearch('');
    setSystemComponentsTypeFilter('all');
    setSystemComponentsPage(1);
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

  // Handle edit salary component
  const handleEditSalaryComponent = (component: SalaryComponent) => {
    setSalaryComponentToEdit(component);
    setEditSalaryComponentForm({
      code: component.code,
      name: component.name,
      appliedUnit: component.appliedUnit,
      componentType: component.componentType,
      nature: component.nature,
      valueType: component.valueType,
      formula: component.formula || '',
    });
    setShowEditSalaryComponentDialog(true);
  };

  // Handle delete salary component
  const handleDeleteSalaryComponent = (component: SalaryComponent) => {
    setSalaryComponentToDelete(component);
    setShowDeleteSalaryComponentDialog(true);
  };

  // Confirm delete salary component
  const confirmDeleteSalaryComponent = () => {
    // In real app, this would call API to delete
    console.log('Deleting salary component:', salaryComponentToDelete?.id);
    setShowDeleteSalaryComponentDialog(false);
    setSalaryComponentToDelete(null);
  };

  // Save edited salary component
  const saveEditedSalaryComponent = () => {
    // In real app, this would call API to update
    console.log('Saving salary component:', salaryComponentToEdit?.id, editSalaryComponentForm);
    setShowEditSalaryComponentDialog(false);
    setSalaryComponentToEdit(null);
  };

  // Validate add salary component form
  const validateAddSalaryComponentForm = () => {
    const errors: typeof addSalaryComponentErrors = {};
    
    if (!addSalaryComponentForm.code.trim()) {
      errors.code = t('payroll.salaryComponents.codeRequired');
    } else if (addSalaryComponentForm.code.length < 3) {
      errors.code = t('payroll.salaryComponents.codeMinLength');
    } else if (!/^[A-Z0-9_]+$/.test(addSalaryComponentForm.code)) {
      errors.code = t('payroll.salaryComponents.codeFormat');
    } else if (salaryComponentsData.some(c => c.code === addSalaryComponentForm.code)) {
      errors.code = t('payroll.salaryComponents.codeExists');
    }
    
    if (!addSalaryComponentForm.name.trim()) {
      errors.name = t('payroll.salaryComponents.nameRequired');
    } else if (addSalaryComponentForm.name.length < 3) {
      errors.name = t('payroll.salaryComponents.nameMinLength');
    } else if (addSalaryComponentForm.name.length > 100) {
      errors.name = t('payroll.salaryComponents.nameMaxLength');
    }
    
    if (addSalaryComponentForm.appliedUnits.length === 0) {
      errors.appliedUnits = t('payroll.salaryComponents.unitRequired');
    }
    
    if (!addSalaryComponentForm.componentType) {
      errors.componentType = t('payroll.salaryComponents.typeRequired');
    }
    
    setAddSalaryComponentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset add form
  const resetAddSalaryComponentForm = () => {
    setAddSalaryComponentForm({
      code: '',
      name: '',
      appliedUnits: [],
      componentType: '',
      nature: 'income',
      valueType: 'currency',
      isTaxable: true,
      quota: '',
      allowExceedQuota: false,
      formula: '',
      description: '',
    });
    setAddSalaryComponentErrors({});
  };

  // Toggle unit selection
  const toggleUnitSelection = (unit: string) => {
    setAddSalaryComponentForm(prev => ({
      ...prev,
      appliedUnits: prev.appliedUnits.includes(unit)
        ? prev.appliedUnits.filter(u => u !== unit)
        : [...prev.appliedUnits, unit]
    }));
    if (addSalaryComponentErrors.appliedUnits) {
      setAddSalaryComponentErrors(prev => ({ ...prev, appliedUnits: undefined }));
    }
  };

  // Remove unit from selection
  const removeUnitFromSelection = (unit: string) => {
    setAddSalaryComponentForm(prev => ({
      ...prev,
      appliedUnits: prev.appliedUnits.filter(u => u !== unit)
    }));
  };

  // Save new salary component
  const saveNewSalaryComponent = (): boolean => {
    if (!validateAddSalaryComponentForm()) {
      return false;
    }
    
    // In real app, this would call API to create
    console.log('Creating salary component:', addSalaryComponentForm);
    setShowAddSalaryComponentDialog(false);
    resetAddSalaryComponentForm();
    return true;
  };
  
  // Save and add another salary component
  const saveAndAddAnotherSalaryComponent = () => {
    if (!validateAddSalaryComponentForm()) {
      return;
    }
    
    // In real app, this would call API to create
    console.log('Creating salary component:', addSalaryComponentForm);
    // Reset form but keep dialog open
    resetAddSalaryComponentForm();
  };

  // Render salary components list (Thành phần lương)
  const renderSalaryComponents = () => {
    return (
      <div className="space-y-4 p-3 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg md:text-xl font-semibold">{t('payroll.salaryComponents.title')}</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1.5 text-xs md:text-sm"
              onClick={() => setShowSystemComponentsDialog(true)}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">{t('payroll.salaryComponents.systemCatalog')}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs md:text-sm">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('payroll.common.addNew')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border shadow-lg z-50">
                 <DropdownMenuItem onClick={() => setShowAddSalaryComponentDialog(true)}>
                   {t('payroll.salaryComponents.addNewComponent')}
                 </DropdownMenuItem>
                 <DropdownMenuItem>{t('payroll.salaryComponents.importExcel')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
               placeholder={t('payroll.common.search')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={salaryComponentStatusFilter} onValueChange={setSalaryComponentStatusFilter}>
              <SelectTrigger className="w-[130px] md:w-[160px]">
                 <SelectValue placeholder={t('payroll.salaryComponents.allStatuses')} />
               </SelectTrigger>
               <SelectContent className="bg-popover border shadow-lg z-50">
                 <SelectItem value="all">{t('payroll.salaryComponents.allStatuses')}</SelectItem>
                 <SelectItem value="active">{t('payroll.salaryComponents.active')}</SelectItem>
                 <SelectItem value="inactive">{t('payroll.salaryComponents.inactive')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={salaryComponentUnitFilter} onValueChange={setSalaryComponentUnitFilter}>
              <SelectTrigger className="w-[130px] md:w-[160px]">
                 <SelectValue placeholder={t('payroll.salaryComponents.allUnits')} />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg z-50">
                 <SelectItem value="all">{t('payroll.salaryComponents.allUnits')}</SelectItem>
                <SelectItem value="company1">Công ty TNHH Đại Thành</SelectItem>
                <SelectItem value="company2">Công ty ABC</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="shrink-0">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-xs w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedSalaryComponents.length === paginatedSalaryComponents.length && paginatedSalaryComponents.length > 0}
                      onChange={toggleSelectAllSalaryComponents}
                    />
                  </th>
                   <th className="text-left p-3 font-medium text-xs text-muted-foreground">{t('payroll.salaryComponents.componentCode')}</th>
                   <th className="text-left p-3 font-medium text-xs text-muted-foreground">{t('payroll.salaryComponents.componentName')}</th>
                   <th className="text-left p-3 font-medium text-xs text-muted-foreground">{t('payroll.salaryComponents.appliedUnit')}</th>
                   <th className="text-left p-3 font-medium text-xs text-muted-foreground">{t('payroll.salaryComponents.nature')}</th>
                   <th className="text-left p-3 font-medium text-xs text-muted-foreground">{t('payroll.salaryComponents.valueType')}</th>
                   <th className="text-left p-3 font-medium text-xs text-muted-foreground min-w-[200px]">{t('payroll.salaryComponents.value')}</th>
                   <th className="text-left p-3 font-medium text-xs text-muted-foreground w-20">{t('payroll.salaryComponents.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSalaryComponents.map((component) => (
                  <tr 
                    key={component.id} 
                    className="border-b hover:bg-muted/30 group"
                  >
                    <td className="p-3">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedSalaryComponents.includes(component.id)}
                        onChange={() => toggleSalaryComponentSelection(component.id)}
                      />
                    </td>
                    <td className="p-3 text-sm font-mono">{component.code}</td>
                    <td className="p-3 text-sm">{component.name}</td>
                    <td className="p-3 text-sm text-muted-foreground">{component.appliedUnit}</td>
                    <td className="p-3 text-sm">{getNatureBadge(component.nature)}</td>
                    <td className="p-3 text-sm text-muted-foreground">{getValueTypeDisplay(component.valueType)}</td>
                    <td className="p-3 text-sm">
                      {component.formula ? (
                        <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                          {component.formula}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => handleEditSalaryComponent(component)}
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSalaryComponent(component)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 md:p-4 border-t">
            <div className="text-sm text-muted-foreground">
               {t('payroll.salaryComponents.totalRecords')}: <span className="font-medium">{filteredSalaryComponents.length}</span>
             </div>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 text-sm">
                 <span className="text-muted-foreground">{t('payroll.salaryComponents.recordsPerPage')}</span>
                <Select value={String(salaryComponentsPerPage)} onValueChange={() => {}}>
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
                  {(salaryComponentsPage - 1) * salaryComponentsPerPage + 1} - {Math.min(salaryComponentsPage * salaryComponentsPerPage, filteredSalaryComponents.length)} {t('payroll.salaryComponents.records')}
                </span>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    disabled={salaryComponentsPage === 1}
                    onClick={() => setSalaryComponentsPage(prev => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    disabled={salaryComponentsPage === totalSalaryComponentsPages}
                    onClick={() => setSalaryComponentsPage(prev => Math.min(totalSalaryComponentsPages, prev + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };


  // Render data tab content
  const renderDataContent = () => {
    switch (activeDataSubTab) {
      case 'data-attendance':
        return <PayrollAttendanceTab />;
      case 'data-sales':
        return <SalesDataTab />;
      default:
        return (
          <div className="p-6">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {t('payroll.common.featureInDev', { name: dataMenuItems.find(m => m.id === activeDataSubTab)?.label })}
              </p>
            </Card>
          </div>
        );
    }
  };

  // Render payroll summary batch detail (employee salary list)
  const renderPayrollSummaryBatchDetail = () => {
    if (!selectedPayrollSummaryBatch) return null;

    // Calculate totals
    const totals = payrollSummaryEmployeesData.reduce((acc, emp) => ({
      baseSalary: acc.baseSalary + emp.baseSalary,
      allowances: acc.allowances + emp.allowances,
      bonus: acc.bonus + emp.bonus,
      insurance: acc.insurance + emp.insurance,
      tax: acc.tax + emp.tax,
      deductions: acc.deductions + emp.deductions,
      netSalary: acc.netSalary + emp.netSalary,
    }), { baseSalary: 0, allowances: 0, bonus: 0, insurance: 0, tax: 0, deductions: 0, netSalary: 0 });

    // Export to Excel function
    const handleExportExcel = () => {
      // Prepare data for Excel
      const excelData = payrollSummaryEmployeesData.map((emp, index) => ({
        'STT': index + 1,
        'Mã NV': emp.code,
        'Họ và tên': emp.name,
        'Phòng ban': emp.department,
        'Vị trí': emp.position,
        'Lương cơ bản': emp.baseSalary,
        'Phụ cấp': emp.allowances,
        'Thưởng': emp.bonus,
        'Tổng thu nhập': emp.baseSalary + emp.allowances + emp.bonus,
        'Bảo hiểm': emp.insurance,
        'Thuế TNCN': emp.tax,
        'Khấu trừ khác': emp.deductions,
        'Tổng khấu trừ': emp.insurance + emp.tax + emp.deductions,
        'Thực lãnh': emp.netSalary,
      }));

      // Add totals row
      excelData.push({
        'STT': '' as any,
        'Mã NV': '',
        'Họ và tên': 'TỔNG CỘNG',
        'Phòng ban': '',
        'Vị trí': '',
        'Lương cơ bản': totals.baseSalary,
        'Phụ cấp': totals.allowances,
        'Thưởng': totals.bonus,
        'Tổng thu nhập': totals.baseSalary + totals.allowances + totals.bonus,
        'Bảo hiểm': totals.insurance,
        'Thuế TNCN': totals.tax,
        'Khấu trừ khác': totals.deductions,
        'Tổng khấu trừ': totals.insurance + totals.tax + totals.deductions,
        'Thực lãnh': totals.netSalary,
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },   // STT
        { wch: 10 },  // Mã NV
        { wch: 25 },  // Họ và tên
        { wch: 20 },  // Phòng ban
        { wch: 18 },  // Vị trí
        { wch: 15 },  // Lương cơ bản
        { wch: 12 },  // Phụ cấp
        { wch: 12 },  // Thưởng
        { wch: 15 },  // Tổng thu nhập
        { wch: 12 },  // Bảo hiểm
        { wch: 12 },  // Thuế TNCN
        { wch: 12 },  // Khấu trừ khác
        { wch: 15 },  // Tổng khấu trừ
        { wch: 15 },  // Thực lãnh
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Bảng lương');

      // Generate filename
      const fileName = `${selectedPayrollSummaryBatch.name.replace(/[/\\?%*:|"<>]/g, '-')}.xlsx`;

      // Download file
      XLSX.writeFile(wb, fileName);
    };

    return (
      <div className="space-y-4 p-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPayrollSummaryBatch(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
             {t('payroll.common.back')}
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{selectedPayrollSummaryBatch.name}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedPayrollSummaryBatch.department} • {selectedPayrollSummaryBatch.salaryPeriod}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                setPrintEmployeeIndex(0);
                setShowPayslipPrintDialog(true);
              }}
            >
              <Printer className="w-4 h-4" />
               {t('payroll.payrollSummary.printPayslip')}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleExportExcel}
            >
              <Download className="w-4 h-4" />
               {t('payroll.paymentTab.exportExcel')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  className="gap-2 cursor-pointer"
                  onClick={() => {
                    setAdvanceFormData({
                      payrollBatch: selectedPayrollSummaryBatch?.name || '',
                      department: selectedPayrollSummaryBatch?.department || '',
                      position: 'all',
                      employeeType: 'all',
                      advanceName: `Bảng tạm ứng ${selectedPayrollSummaryBatch?.salaryPeriod || ''} - ${selectedPayrollSummaryBatch?.department || ''}`,
                      description: ''
                    });
                    setShowAddAdvanceDialog(true);
                  }}
                >
                  <Wallet className="w-4 h-4" />
                   {t('payroll.advance')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4" />
                  {t('payroll.payrollSummary.summarySalary')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Calculator className="w-4 h-4" />
                  {t('payroll.payrollSummary.allocateSalary')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Eye className="w-4 h-4" />
                   {t('payroll.payrollSummary.reference')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Printer className="w-4 h-4" />
                   {t('payroll.payrollSummary.printPayslip')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Pencil className="w-4 h-4" />
                   {t('payroll.payrollSummary.update')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-destructive">
                  <Trash2 className="w-4 h-4" />
                   {t('payroll.common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                 <p className="text-xs text-muted-foreground">{t('payroll.payrollSummary.employeeCount')}</p>
                <p className="text-xl font-bold">{payrollSummaryEmployeesData.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Coins className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('payroll.payrollSummary.totalGross')}</p>
                <p className="text-xl font-bold text-success">{formatCurrency(totals.baseSalary + totals.allowances + totals.bonus)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('payroll.payrollSummary.totalDeduction')}</p>
                <p className="text-xl font-bold text-destructive">{formatCurrency(totals.insurance + totals.tax + totals.deductions)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('payroll.payrollSummary.totalNet')}</p>
                <p className="text-xl font-bold text-amber-500">{formatCurrency(totals.netSalary)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('payroll.paymentTab.searchEmployee')}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={payrollDepartmentFilter} onValueChange={setPayrollDepartmentFilter}>
              <SelectTrigger className="w-[200px]">
                 <SelectValue placeholder={t('payroll.payrollSummary.allDepartments')} />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">{t('payroll.payrollSummary.allDepartments')}</SelectItem>
                {payrollDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Employee Salary Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                   <th className="text-left p-3 font-medium text-sm w-10">{t('payroll.common.stt')}</th>
                   <th className="text-left p-3 font-medium text-sm">{t('payroll.common.employeeCode')}</th>
                  <th 
                    className="text-left p-3 font-medium text-sm cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      {t('payroll.common.fullName')}
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="text-left p-3 font-medium text-sm cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center">
                      {t('payroll.common.department')}
                      {getSortIcon('department')}
                    </div>
                  </th>
                  <th className="text-left p-3 font-medium text-sm">{t('payroll.common.position')}</th>
                  <th 
                    className="text-right p-3 font-medium text-sm cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => handleSort('baseSalary')}
                  >
                    <div className="flex items-center justify-end">
                      {t('payroll.baseSalary')}
                      {getSortIcon('baseSalary')}
                    </div>
                  </th>
                  <th className="text-right p-3 font-medium text-sm">{t('payroll.allowances')}</th>
                  <th className="text-right p-3 font-medium text-sm">{t('payroll.bonus')}</th>
                  <th className="text-right p-3 font-medium text-sm">{t('payroll.insurance')}</th>
                  <th className="text-right p-3 font-medium text-sm">{t('payroll.tax')}</th>
                  <th 
                    className="text-right p-3 font-medium text-sm cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => handleSort('netSalary')}
                  >
                    <div className="flex items-center justify-end">
                      {t('payroll.netSalary')}
                      {getSortIcon('netSalary')}
                    </div>
                  </th>
                  <th className="text-left p-3 font-medium text-sm w-12"></th>
                </tr>
              </thead>
              <tbody>
                {sortedPayrollSummaryEmployees.map((emp, index) => (
                  <tr 
                    key={emp.id} 
                    className="border-b hover:bg-muted/30 cursor-pointer group"
                  >
                    <td className="p-3 text-muted-foreground">{index + 1}</td>
                    <td className="p-3 font-medium">{emp.code}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {emp.name.split(' ').pop()?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{emp.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{emp.department}</td>
                    <td className="p-3 text-muted-foreground">{emp.position}</td>
                    <td className="p-3 text-right">{formatCurrency(emp.baseSalary)}</td>
                    <td className="p-3 text-right text-success">+{formatCurrency(emp.allowances)}</td>
                    <td className="p-3 text-right text-success">+{formatCurrency(emp.bonus)}</td>
                    <td className="p-3 text-right text-destructive">-{formatCurrency(emp.insurance)}</td>
                    <td className="p-3 text-right text-destructive">-{formatCurrency(emp.tax)}</td>
                    <td className="p-3 text-right font-bold text-primary">{formatCurrency(emp.netSalary)}</td>
                    <td className="p-3">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        title={t('payroll.payrollSummary.printPayslip')}
                        onClick={() => {
                          setPrintEmployeeIndex(index);
                          setShowPayslipPrintDialog(true);
                        }}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Footer totals */}
              <tfoot>
                <tr className="bg-muted/50 font-semibold">
                  <td colSpan={5} className="p-4 text-right">{t('payroll.payrollSummary.total')}:</td>
                  <td className="p-4 text-right">{formatCurrency(totals.baseSalary)}</td>
                  <td className="p-4 text-right text-success">+{formatCurrency(totals.allowances)}</td>
                  <td className="p-4 text-right text-success">+{formatCurrency(totals.bonus)}</td>
                  <td className="p-4 text-right text-destructive">-{formatCurrency(totals.insurance)}</td>
                  <td className="p-4 text-right text-destructive">-{formatCurrency(totals.tax)}</td>
                  <td className="p-4 text-right text-primary">{formatCurrency(totals.netSalary)}</td>
                  <td className="p-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">
              {t('payroll.payrollSummary.totalEmployees', { count: payrollSummaryEmployeesData.length })}
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('payroll.common.recordsPerPage')}</span>
                <Select defaultValue="50">
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-muted-foreground">1 - {payrollSummaryEmployeesData.length} {t('payroll.common.records')}</span>
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
      </div>
    );
  };

  // Render payroll summary list (Danh sách bảng lương)
  const renderPayrollSummaryList = () => {
    // If a batch is selected, show detail view
    if (selectedPayrollSummaryBatch) {
      return renderPayrollSummaryBatchDetail();
    }

    return (
      <div className="space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('payroll.payrollSummary.title')}</h2>
          <Button 
            className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => setShowAddPayrollSummaryDialog(true)}
          >
            <Plus className="w-4 h-4" />
            {t('payroll.common.addNew')}
          </Button>
        </div>

        {/* Selection Actions Bar */}
        {selectedPayrollBatches.length > 0 && (
          <div className="flex items-center gap-3 py-2">
            <span className="text-sm">
              {t('payroll.common.selected')} <span className="font-semibold">{selectedPayrollBatches.length}</span>
            </span>
            <Button 
              variant="link" 
              size="sm" 
              className="text-primary p-0 h-auto"
              onClick={() => setSelectedPayrollBatches([])}
            >
              {t('payroll.common.deselect')}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground gap-1"
              onClick={() => {
                setPayrollBatchToDelete(null);
                setShowDeletePayrollBatchDialog(true);
              }}
            >
              <Trash2 className="w-4 h-4" />
              {t('payroll.common.delete')}
            </Button>
          </div>
        )}

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-sm w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedPayrollBatches.length === filteredPayrollSummaryBatches.length && filteredPayrollSummaryBatches.length > 0}
                      onChange={toggleSelectAllPayrollBatches}
                    />
                  </th>
                   <th className="text-left p-4 font-medium text-sm">{t('payroll.payrollSummary.summaryDate')}</th>
                   <th className="text-left p-4 font-medium text-sm">{t('payroll.payrollSummary.summaryName')}</th>
                   <th className="text-left p-4 font-medium text-sm">{t('payroll.salaryPeriod')}</th>
                   <th className="text-left p-4 font-medium text-sm">{t('payroll.common.appliedUnit')}</th>
                   <th className="text-left p-4 font-medium text-sm">{t('payroll.common.appliedPosition')}</th>
                   <th className="text-left p-4 font-medium text-sm w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrollSummaryBatches.map((batch) => (
                  <tr 
                    key={batch.id} 
                    className={cn(
                      "border-b hover:bg-muted/30 cursor-pointer group",
                      selectedPayrollBatches.includes(batch.id) && "bg-emerald-50 dark:bg-emerald-900/20"
                    )}
                    onClick={() => setSelectedPayrollSummaryBatch(batch)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedPayrollBatches.includes(batch.id)}
                        onChange={() => togglePayrollBatchSelection(batch.id)}
                      />
                    </td>
                    <td className="p-4 text-muted-foreground">{batch.summaryDate}</td>
                    <td className="p-4">
                      <span className="font-medium text-primary hover:underline">{batch.name}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{batch.salaryPeriod}</td>
                    <td className="p-4 text-muted-foreground">{batch.department}</td>
                    <td className="p-4">
                      <span className="text-primary">{batch.position}</span>
                    </td>
                    <td className="p-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        title={t('payroll.common.delete')}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPayrollBatchToDelete(batch);
                          setShowDeletePayrollBatchDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
             <span className="text-sm text-muted-foreground">
               {t('payroll.common.totalRecords')}: {filteredPayrollSummaryBatches.length} {t('payroll.common.records')}
             </span>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <span className="text-sm text-muted-foreground">{t('payroll.common.recordsPerPage')}</span>
                 <Select defaultValue="50">
                   <SelectTrigger className="w-20 h-8">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="20">20</SelectItem>
                     <SelectItem value="50">50</SelectItem>
                     <SelectItem value="100">100</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <span className="text-sm text-muted-foreground">1 - {filteredPayrollSummaryBatches.length} {t('payroll.common.records')}</span>
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
      </div>
    );
  };

  // Render advance batch detail
  const renderAdvanceBatchDetail = () => {
    if (!selectedAdvanceBatch) return null;

    const totalAdvance = advanceEmployeesData.reduce((sum, emp) => sum + emp.advanceAmount, 0);
    const currentStep = selectedAdvanceBatch.approvalSteps.find(s => s.status === 'pending');
    const canApprove = selectedAdvanceBatch.status === 'pending' && currentStep;

    return (
      <div className="space-y-4 p-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedAdvanceBatch(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('payroll.common.back')}
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{selectedAdvanceBatch.name}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedAdvanceBatch.department} • {selectedAdvanceBatch.salaryPeriod}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getAdvanceStatusBadge(selectedAdvanceBatch.status)}
            {canApprove && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    setApprovalAction('reject');
                    setApprovalNote('');
                    setShowApprovalDialog(true);
                  }}
                >
                  <XCircle className="w-4 h-4" />
                   {t('payroll.advanceList.reject')}
                </Button>
                <Button 
                  size="sm" 
                  className="gap-2 bg-success hover:bg-success/90 text-white"
                  onClick={() => {
                    setApprovalAction('approve');
                    setApprovalNote('');
                    setShowApprovalDialog(true);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                   {t('payroll.advanceList.approve')}
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                setAdvanceToEdit(selectedAdvanceBatch);
                setShowEditAdvanceDialog(true);
              }}
            >
              <Pencil className="w-4 h-4" />
               {t('payroll.common.edit')}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {t('payroll.exportExcel')}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                 <p className="text-xs text-muted-foreground">{t('payroll.advanceDetail.employeeCount')}</p>
                 <p className="text-xl font-bold">{advanceEmployeesData.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                 <p className="text-xs text-muted-foreground">{t('payroll.advanceDetail.totalAdvance')}</p>
                 <p className="text-xl font-bold text-amber-500">{formatCurrency(totalAdvance)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                 <p className="text-xs text-muted-foreground">{t('payroll.advanceDetail.statusLabel')}</p>
                 <p className="text-xl font-bold">
                   {selectedAdvanceBatch.status === 'paid' ? t('payroll.advanceList.paid') : 
                    selectedAdvanceBatch.status === 'approved' ? t('payroll.advanceList.approved') : 
                    selectedAdvanceBatch.status === 'rejected' ? t('payroll.advanceList.rejected') : t('payroll.advanceList.pending')}
                 </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('payroll.advanceDetail.approvalProgress')}</p>
                <p className="text-xl font-bold">
                  {selectedAdvanceBatch.approvalSteps.filter(s => s.status === 'approved').length}/{selectedAdvanceBatch.approvalSteps.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Approval Workflow Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
               <ClipboardList className="w-5 h-5" />
              {t('payroll.advanceList.approvalProcess')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-border" />
              
              <div className="space-y-6">
                {selectedAdvanceBatch.approvalSteps.map((step, index) => (
                  <div key={step.level} className="flex gap-4 relative">
                    {/* Step indicator */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10",
                      step.status === 'approved' && "bg-success text-white",
                      step.status === 'rejected' && "bg-destructive text-white",
                      step.status === 'pending' && "bg-muted border-2 border-border text-muted-foreground"
                    )}>
                      {step.status === 'approved' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : step.status === 'rejected' ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">{step.level}</span>
                      )}
                    </div>
                    
                    {/* Step content */}
                    <div className={cn(
                      "flex-1 rounded-lg p-4 border",
                      step.status === 'approved' && "bg-success/5 border-success/20",
                      step.status === 'rejected' && "bg-destructive/5 border-destructive/20",
                      step.status === 'pending' && "bg-muted/30 border-border"
                    )}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{step.title}</h4>
                            {getApprovalStepBadge(step.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {step.approverPosition}
                          </p>
                        </div>
                        {step.approvedAt && (
                          <span className="text-xs text-muted-foreground">
                            {step.approvedAt}
                          </span>
                        )}
                      </div>
                      
                      {step.approverName && (
                        <div className="flex items-center gap-2 mt-3">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {step.approverName.split(' ').pop()?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{step.approverName}</span>
                        </div>
                      )}
                      
                      {step.note && (
                        <div className={cn(
                          "mt-3 text-sm p-2 rounded",
                          step.status === 'approved' && "bg-success/10 text-success",
                          step.status === 'rejected' && "bg-destructive/10 text-destructive"
                        )}>
                          <span className="font-medium">{t('payroll.advanceDetail.noteLabel')}:</span> {step.note}
                        </div>
                      )}
                      
                      {step.status === 'pending' && index === selectedAdvanceBatch.currentApprovalLevel - 1 && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-warning">
                          <Clock className="w-4 h-4" />
                          <span>{t('payroll.advanceList.awaitingApproval')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">{t('payroll.advanceList.employeeList')}</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                   <th className="text-left p-3 font-medium text-sm w-10">{t('payroll.common.stt')}</th>
                   <th className="text-left p-3 font-medium text-sm">{t('payroll.common.employeeCode')}</th>
                   <th className="text-left p-3 font-medium text-sm">{t('payroll.common.fullName')}</th>
                   <th className="text-left p-3 font-medium text-sm">{t('payroll.common.department')}</th>
                   <th className="text-left p-3 font-medium text-sm">{t('payroll.common.position')}</th>
                   <th className="text-right p-3 font-medium text-sm">{t('payroll.advanceList.advanceAmount')}</th>
                   <th className="text-left p-3 font-medium text-sm">{t('payroll.advanceList.note')}</th>
                </tr>
              </thead>
              <tbody>
                {advanceEmployeesData.map((emp, index) => (
                  <tr key={emp.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 text-muted-foreground">{index + 1}</td>
                    <td className="p-3 font-medium">{emp.code}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {emp.name.split(' ').pop()?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{emp.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{emp.department}</td>
                    <td className="p-3 text-muted-foreground">{emp.position}</td>
                    <td className="p-3 text-right font-bold text-amber-600">{formatCurrency(emp.advanceAmount)}</td>
                    <td className="p-3 text-muted-foreground">{emp.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-semibold">
                  <td colSpan={5} className="p-3 text-right">{t('payroll.payrollSummary.total')}:</td>
                  <td className="p-3 text-right font-bold text-amber-600">{formatCurrency(totalAdvance)}</td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // Render advance list
  const renderAdvanceList = () => {
    // If a batch is selected, show detail view
    if (selectedAdvanceBatch) {
      return renderAdvanceBatchDetail();
    }

    return (
      <div className="space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('payroll.advanceList.title')}</h2>
          <Button 
            className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => {
              setAdvanceFormData({
                payrollBatch: '',
                department: '',
                position: 'all',
                employeeType: 'all',
                advanceName: '',
                description: ''
              });
              setShowAddAdvanceDialog(true);
            }}
          >
            <Plus className="w-4 h-4" />
            {t('payroll.common.addNew')}
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('payroll.advanceList.searchPlaceholder')}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Selection Actions Bar */}
        {selectedAdvanceBatches.length > 0 && (
          <div className="flex items-center gap-3 py-2">
             <span className="text-sm">
               {t('payroll.common.selected')} <span className="font-semibold">{selectedAdvanceBatches.length}</span>
             </span>
             <Button 
               variant="link" 
               size="sm" 
               className="text-primary p-0 h-auto"
               onClick={() => setSelectedAdvanceBatches([])}
             >
               {t('payroll.common.deselect')}
             </Button>
             <Button 
               variant="outline" 
               size="sm" 
               className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground gap-1"
               onClick={() => {
                 setAdvanceToDelete(null);
                 setShowDeleteAdvanceDialog(true);
               }}
             >
               <Trash2 className="w-4 h-4" />
               {t('payroll.common.delete')}
             </Button>
          </div>
        )}

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-sm w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedAdvanceBatches.length === filteredAdvanceBatches.length && filteredAdvanceBatches.length > 0}
                      onChange={toggleSelectAllAdvanceBatches}
                    />
                  </th>
                   <th className="text-left p-3 font-medium text-sm">{t('payroll.advanceList.createdDate')}</th>
                   <th className="text-left p-3 font-medium text-sm">{t('payroll.advanceList.advanceName')}</th>
                   <th className="text-left p-3 font-medium text-sm">{t('payroll.salaryPeriod')}</th>
                   <th className="text-left p-3 font-medium text-sm">{t('payroll.common.appliedUnit')}</th>
                   <th className="text-right p-3 font-medium text-sm">{t('payroll.advanceList.employeeCount')}</th>
                   <th className="text-right p-3 font-medium text-sm">{t('payroll.advanceList.totalAdvance')}</th>
                   <th className="text-center p-3 font-medium text-sm">{t('payroll.advanceList.status')}</th>
                   <th className="text-left p-3 font-medium text-sm w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAdvanceBatches.map((batch) => (
                  <tr 
                    key={batch.id} 
                    className={cn(
                      "border-b hover:bg-muted/30 cursor-pointer group",
                      selectedAdvanceBatches.includes(batch.id) && "bg-emerald-50 dark:bg-emerald-900/20"
                    )}
                    onClick={() => setSelectedAdvanceBatch(batch)}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedAdvanceBatches.includes(batch.id)}
                        onChange={() => toggleAdvanceBatchSelection(batch.id)}
                      />
                    </td>
                    <td className="p-3 text-muted-foreground">{batch.createdDate}</td>
                    <td className="p-3">
                      <span className="font-medium text-primary hover:underline">{batch.name}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">{batch.salaryPeriod}</td>
                    <td className="p-3 text-muted-foreground">{batch.department}</td>
                    <td className="p-3 text-right">{batch.employeeCount}</td>
                    <td className="p-3 text-right font-medium text-amber-600">{formatCurrency(batch.totalAmount)}</td>
                    <td className="p-3 text-center">{getAdvanceStatusBadge(batch.status)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          title={t('payroll.common.edit')}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdvanceToEdit(batch);
                            setShowEditAdvanceDialog(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title={t('payroll.common.delete')}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdvanceToDelete(batch);
                            setShowDeleteAdvanceDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">
              {t('payroll.common.totalRecords')}: {filteredAdvanceBatches.length} {t('payroll.common.records')}
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('payroll.common.recordsPerPage')}</span>
                <Select defaultValue="50">
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-muted-foreground">1 - {filteredAdvanceBatches.length} {t('payroll.common.records')}</span>
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
      </div>
    );
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

    setShowAddTaxSettlementDialog(false);
    setTaxSettlementFormData({
      year: new Date().getFullYear(),
      appliedUnits: [],
      name: '',
      monthlyTaxTables: {},
    });
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
              onClick={() => setShowAddTaxSettlementDialog(true)}
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
        <Dialog open={showAddTaxSettlementDialog} onOpenChange={setShowAddTaxSettlementDialog}>
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
               <Button variant="outline" onClick={() => setShowAddTaxSettlementDialog(false)}>
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

  // Filter tax settlement employees for detail view
  const filteredTaxSettlementEmployees = taxSettlementEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(taxSettlementDetailSearch.toLowerCase()) ||
      emp.code.toLowerCase().includes(taxSettlementDetailSearch.toLowerCase());
    return matchesSearch;
  });

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

  // Open edit tax employee dialog
  const openEditTaxEmployeeDialog = (employee: TaxSettlementEmployee) => {
    setTaxEmployeeToEdit(employee);
    setTaxEmployeeEditForm({
      totalTaxableIncome: employee.totalTaxableIncome,
      dependents: employee.dependents,
      familyDeduction: employee.familyDeduction,
      unemploymentInsurance: employee.unemploymentInsurance,
      socialInsurance: employee.socialInsurance,
      healthInsurance: employee.healthInsurance,
      taxPayable: employee.taxPayable,
      taxPaid: employee.taxPaid,
    });
    setShowEditTaxEmployeeDialog(true);
  };

  // Handle save tax employee edit
  const handleSaveTaxEmployeeEdit = () => {
    if (!taxEmployeeToEdit) return;

    const totalDeduction = taxEmployeeEditForm.familyDeduction + 
      taxEmployeeEditForm.unemploymentInsurance + 
      taxEmployeeEditForm.socialInsurance + 
      taxEmployeeEditForm.healthInsurance;
    
    const taxableIncomeAfterDeduction = Math.max(0, taxEmployeeEditForm.totalTaxableIncome - totalDeduction);

    setTaxSettlementEmployees(prev => prev.map(emp => 
      emp.id === taxEmployeeToEdit.id 
        ? {
            ...emp,
            ...taxEmployeeEditForm,
            totalDeduction,
            taxableIncomeAfterDeduction,
          }
        : emp
    ));

    setShowEditTaxEmployeeDialog(false);
    setTaxEmployeeToEdit(null);
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
                Chưa chuyển
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
                  <DropdownMenuItem onClick={() => setShowTaxRefundDialog(true)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t('payroll.taxSettlement.taxRefund')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowTaxDeductionDialog(true)}>
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
                onClick={() => setShowBulkDeleteTaxEmployeeDialog(true)}
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
                    <td className="p-3">{employee.code}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {employee.name.split(' ').pop()?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{employee.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">{employee.totalTaxableIncome.toLocaleString('vi-VN')}</td>
                    <td className="p-3 text-center">{employee.dependents}</td>
                    <td className="p-3 text-right font-mono">{employee.familyDeduction.toLocaleString('vi-VN')}</td>
                    <td className="p-3 text-right font-mono">{employee.unemploymentInsurance.toLocaleString('vi-VN')}</td>
                    <td className="p-3 text-right font-mono">{employee.socialInsurance.toLocaleString('vi-VN')}</td>
                    <td className="p-3 text-right font-mono">{employee.healthInsurance.toLocaleString('vi-VN')}</td>
                    <td className="p-3 text-right font-mono">{employee.totalDeduction.toLocaleString('vi-VN')}</td>
                    <td className="p-3 text-right font-mono">{employee.taxableIncomeAfterDeduction.toLocaleString('vi-VN')}</td>
                    <td className="p-3 text-right font-mono">{employee.taxPayable.toLocaleString('vi-VN')}</td>
                    <td className="p-3 text-right font-mono">{employee.taxPaid.toLocaleString('vi-VN')}</td>
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
                          onClick={() => {
                            setTaxEmployeeToDelete(employee);
                            setShowDeleteTaxEmployeeDialog(true);
                          }}
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
                  <td className="p-3 text-right font-mono">{taxSettlementTotals.totalTaxableIncome.toLocaleString('vi-VN')}</td>
                  <td className="p-3"></td>
                  <td className="p-3 text-right font-mono">{taxSettlementTotals.familyDeduction.toLocaleString('vi-VN')}</td>
                  <td className="p-3 text-right font-mono">{taxSettlementTotals.unemploymentInsurance.toLocaleString('vi-VN')}</td>
                  <td className="p-3 text-right font-mono">{taxSettlementTotals.socialInsurance.toLocaleString('vi-VN')}</td>
                  <td className="p-3 text-right font-mono">{taxSettlementTotals.healthInsurance.toLocaleString('vi-VN')}</td>
                  <td className="p-3 text-right font-mono">{taxSettlementTotals.totalDeduction.toLocaleString('vi-VN')}</td>
                  <td className="p-3 text-right font-mono">{taxSettlementTotals.taxableIncomeAfterDeduction.toLocaleString('vi-VN')}</td>
                  <td className="p-3 text-right font-mono">{taxSettlementTotals.taxPayable.toLocaleString('vi-VN')}</td>
                  <td className="p-3 text-right font-mono">{taxSettlementTotals.taxPaid.toLocaleString('vi-VN')}</td>
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

        {/* Edit Tax Employee Dialog */}
        <Dialog open={showEditTaxEmployeeDialog} onOpenChange={setShowEditTaxEmployeeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('payroll.taxSettlement.editTaxInfo')}</DialogTitle>
            </DialogHeader>
            {taxEmployeeToEdit && (
              <div className="space-y-4 py-4">
                {/* Employee Info */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {taxEmployeeToEdit.name.split(' ').pop()?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{taxEmployeeToEdit.name}</p>
                    <p className="text-sm text-muted-foreground">{taxEmployeeToEdit.code}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>{t('payroll.taxSettlement.totalTaxableIncome')}</Label>
                      <Input
                        type="number"
                        value={taxEmployeeEditForm.totalTaxableIncome}
                        onChange={(e) => setTaxEmployeeEditForm(prev => ({ ...prev, totalTaxableIncome: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t('payroll.taxSettlement.dependents')}</Label>
                      <Input
                        type="number"
                        value={taxEmployeeEditForm.dependents}
                        onChange={(e) => setTaxEmployeeEditForm(prev => ({ ...prev, dependents: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-3">
                     <p className="text-sm font-medium text-muted-foreground mb-3">{t('payroll.taxSettlement.deductions')}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>{t('payroll.taxSettlement.familyDeduction')}</Label>
                        <Input
                          type="number"
                          value={taxEmployeeEditForm.familyDeduction}
                          onChange={(e) => setTaxEmployeeEditForm(prev => ({ ...prev, familyDeduction: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>BHTN (1.0%)</Label>
                        <Input
                          type="number"
                          value={taxEmployeeEditForm.unemploymentInsurance}
                          onChange={(e) => setTaxEmployeeEditForm(prev => ({ ...prev, unemploymentInsurance: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>BHXH (8.0%)</Label>
                        <Input
                          type="number"
                          value={taxEmployeeEditForm.socialInsurance}
                          onChange={(e) => setTaxEmployeeEditForm(prev => ({ ...prev, socialInsurance: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>BHYT (1.5%)</Label>
                        <Input
                          type="number"
                          value={taxEmployeeEditForm.healthInsurance}
                          onChange={(e) => setTaxEmployeeEditForm(prev => ({ ...prev, healthInsurance: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Thuế TNCN</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                       <Label>{t('payroll.taxSettlement.taxPayable')}</Label>
                      <Input
                          type="number"
                          value={taxEmployeeEditForm.taxPayable}
                          onChange={(e) => setTaxEmployeeEditForm(prev => ({ ...prev, taxPayable: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                       <Label>{t('payroll.taxSettlement.taxPaid')}</Label>
                      <Input
                          type="number"
                          value={taxEmployeeEditForm.taxPaid}
                          onChange={(e) => setTaxEmployeeEditForm(prev => ({ ...prev, taxPaid: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditTaxEmployeeDialog(false)}>
                Hủy bỏ
              </Button>
              <Button onClick={handleSaveTaxEmployeeEdit}>
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Tax Employee Confirmation Dialog */}
        <Dialog open={showDeleteTaxEmployeeDialog} onOpenChange={setShowDeleteTaxEmployeeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa nhân viên</DialogTitle>
            </DialogHeader>
            {taxEmployeeToDelete && (
              <div className="py-4">
                <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg mb-4">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Cảnh báo</p>
                    <p className="text-sm text-muted-foreground">
                      Hành động này không thể hoàn tác
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Bạn có chắc chắn muốn xóa nhân viên sau khỏi bảng quyết toán thuế?
                </p>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {taxEmployeeToDelete.name.split(' ').pop()?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{taxEmployeeToDelete.name}</p>
                    <p className="text-sm text-muted-foreground">{taxEmployeeToDelete.code}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => {
                setShowDeleteTaxEmployeeDialog(false);
                setTaxEmployeeToDelete(null);
              }}>
                Hủy bỏ
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (taxEmployeeToDelete) {
                    setTaxSettlementEmployees(prev => prev.filter(emp => emp.id !== taxEmployeeToDelete.id));
                    setSelectedTaxSettlementEmployees(prev => prev.filter(id => id !== taxEmployeeToDelete.id));
                    setShowDeleteTaxEmployeeDialog(false);
                    setTaxEmployeeToDelete(null);
                  }
                }}
              >
                Xóa nhân viên
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Delete Tax Employees Confirmation Dialog */}
        <Dialog open={showBulkDeleteTaxEmployeeDialog} onOpenChange={setShowBulkDeleteTaxEmployeeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Xác nhận xóa nhiều nhân viên
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Cảnh báo</p>
                  <p className="text-sm text-muted-foreground">
                    Hành động này không thể hoàn tác
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Bạn có chắc chắn muốn xóa <span className="font-semibold text-foreground">{selectedTaxSettlementEmployees.length}</span> nhân viên đã chọn khỏi bảng quyết toán thuế?
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
              <Button variant="outline" onClick={() => setShowBulkDeleteTaxEmployeeDialog(false)}>
                Hủy bỏ
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  setTaxSettlementEmployees(prev => prev.filter(emp => !selectedTaxSettlementEmployees.includes(emp.id)));
                  setSelectedTaxSettlementEmployees([]);
                  setShowBulkDeleteTaxEmployeeDialog(false);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa {selectedTaxSettlementEmployees.length} nhân viên
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tax Refund Dialog (Hoàn thuế) */}
        <Dialog open={showTaxRefundDialog} onOpenChange={setShowTaxRefundDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm bảng thu nhập khác</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Time */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  Thời gian <span className="text-destructive">*</span>
                </Label>
                <div className="relative w-48">
                  <Input
                    type="text"
                    value={`Tháng ${String(taxRefundFormData.date.getMonth() + 1).padStart(2, '0')}, ${taxRefundFormData.date.getFullYear()}`}
                    readOnly
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Applied Units */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  Đơn vị áp dụng <span className="text-destructive">*</span>
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
                          name: `Bảng thu nhập khác tháng ${prev.date.getMonth() + 1}/${prev.date.getFullYear()} - ${[...prev.appliedUnits, value].join(', ')}`
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Chọn đơn vị" />
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
                <Label className="text-right">Vị trí áp dụng</Label>
                <Input
                  value="Tất cả các vị trí trong đơn vị"
                  readOnly
                  className="bg-muted/50"
                />
              </div>

              {/* Employees */}
              <div className="grid grid-cols-[150px_1fr] items-start gap-4">
                <Label className="text-right pt-2">Nhân viên áp dụng</Label>
                <RadioGroup 
                  value={taxRefundFormData.employeeType}
                  onValueChange={(value: 'all' | 'selected') => setTaxRefundFormData(prev => ({ ...prev, employeeType: value }))}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="tax-refund-all-employees" />
                    <Label htmlFor="tax-refund-all-employees" className="font-normal cursor-pointer">
                      Tất cả nhân viên
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selected" id="tax-refund-selected-employees" />
                    <Label htmlFor="tax-refund-selected-employees" className="font-normal cursor-pointer">
                      Nhân viên được chọn
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Name */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  Tên bảng thu nhập khác <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={taxRefundFormData.name || `Bảng thu nhập khác tháng ${taxRefundFormData.date.getMonth() + 1}/${taxRefundFormData.date.getFullYear()}${taxRefundFormData.appliedUnits.length > 0 ? ` - ${taxRefundFormData.appliedUnits.join(', ')}` : ''}`}
                  onChange={(e) => setTaxRefundFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tên bảng thu nhập khác"
                />
              </div>

              {/* Income Type */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  Khoản thu nhập khác <span className="text-destructive">*</span>
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
                setShowTaxRefundDialog(false);
                setTaxRefundFormData({
                  date: new Date(),
                  appliedUnits: [],
                  position: 'all',
                  employeeType: 'all',
                  name: '',
                  incomeType: 'Thuế TNCN được hoàn',
                });
              }}>
                Hủy bỏ
              </Button>
              <Button 
                className="bg-primary"
                onClick={() => {
                  // Handle save logic here
                  setShowTaxRefundDialog(false);
                  setTaxRefundFormData({
                    date: new Date(),
                    appliedUnits: [],
                    position: 'all',
                    employeeType: 'all',
                    name: '',
                    incomeType: 'Thuế TNCN được hoàn',
                  });
                }}
                disabled={taxRefundFormData.appliedUnits.length === 0}
              >
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tax Deduction Dialog */}
        <Dialog open={showTaxDeductionDialog} onOpenChange={setShowTaxDeductionDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm bảng khấu trừ khác</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Time */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  Thời gian <span className="text-destructive">*</span>
                </Label>
                <div className="relative w-48">
                  <Input
                    type="text"
                    value={`Tháng ${String(taxDeductionFormData.date.getMonth() + 1).padStart(2, '0')}, ${taxDeductionFormData.date.getFullYear()}`}
                    readOnly
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Applied Units */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  Đơn vị áp dụng <span className="text-destructive">*</span>
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
                          name: `Bảng khấu trừ khác tháng ${prev.date.getMonth() + 1}/${prev.date.getFullYear()} - ${[...prev.appliedUnits, value].join(', ')}`
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Chọn đơn vị" />
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
                <Label className="text-right">Vị trí áp dụng</Label>
                <Input
                  value="Tất cả các vị trí trong đơn vị"
                  readOnly
                  className="bg-muted/50"
                />
              </div>

              {/* Employees */}
              <div className="grid grid-cols-[150px_1fr] items-start gap-4">
                <Label className="text-right pt-2">Nhân viên áp dụng</Label>
                <RadioGroup 
                  value={taxDeductionFormData.employeeType}
                  onValueChange={(value: 'all' | 'selected') => setTaxDeductionFormData(prev => ({ ...prev, employeeType: value }))}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="tax-deduction-all-employees" />
                    <Label htmlFor="tax-deduction-all-employees" className="font-normal cursor-pointer">
                      Tất cả nhân viên
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selected" id="tax-deduction-selected-employees" />
                    <Label htmlFor="tax-deduction-selected-employees" className="font-normal cursor-pointer">
                      Nhân viên được chọn
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Name */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  Tên bảng khấu trừ khác <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={taxDeductionFormData.name || `Bảng khấu trừ khác tháng ${taxDeductionFormData.date.getMonth() + 1}/${taxDeductionFormData.date.getFullYear()}${taxDeductionFormData.appliedUnits.length > 0 ? ` - ${taxDeductionFormData.appliedUnits.join(', ')}` : ''}`}
                  onChange={(e) => setTaxDeductionFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tên bảng khấu trừ khác"
                />
              </div>

              {/* Deduction Type */}
              <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                <Label className="text-right">
                  Khoản khấu trừ khác <span className="text-destructive">*</span>
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
                setShowTaxDeductionDialog(false);
                setTaxDeductionFormData({
                  date: new Date(),
                  appliedUnits: [],
                  position: 'all',
                  employeeType: 'all',
                  name: '',
                  deductionType: 'Thuế TNCN khấu trừ',
                });
              }}>
                Hủy bỏ
              </Button>
              <Button 
                className="bg-primary"
                onClick={() => {
                  // Handle save logic here
                  setShowTaxDeductionDialog(false);
                  setTaxDeductionFormData({
                    date: new Date(),
                    appliedUnits: [],
                    position: 'all',
                    employeeType: 'all',
                    name: '',
                    deductionType: 'Thuế TNCN khấu trừ',
                  });
                }}
                disabled={taxDeductionFormData.appliedUnits.length === 0}
              >
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Filter tax policy participants
  const filteredTaxPolicyParticipants = taxPolicyParticipantsData.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(taxPolicySearch.toLowerCase()) ||
      participant.code.toLowerCase().includes(taxPolicySearch.toLowerCase());
    const matchesStatus = taxPolicyStatusFilter === 'all' || 
      (taxPolicyStatusFilter === 'active' && participant.status === 'active') ||
      (taxPolicyStatusFilter === 'inactive' && participant.status === 'inactive');
    const matchesType = taxPolicyTypeFilter === 'all' ||
      (taxPolicyTypeFilter === 'progressive' && participant.policyType === 'progressive') ||
      (taxPolicyTypeFilter === 'flat' && participant.policyType === 'flat');
    return matchesSearch && matchesStatus && matchesType;
  });

  // Toggle tax policy participant selection
  const toggleTaxPolicyEmployeeSelection = (employeeId: string) => {
    setSelectedTaxPolicyEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // Toggle select all tax policy participants
  const toggleSelectAllTaxPolicyEmployees = () => {
    if (selectedTaxPolicyEmployees.length === filteredTaxPolicyParticipants.length) {
      setSelectedTaxPolicyEmployees([]);
    } else {
      setSelectedTaxPolicyEmployees(filteredTaxPolicyParticipants.map(p => p.id));
    }
  };

  // Filter insurance policy participants
  const filteredInsurancePolicyParticipants = insurancePolicyParticipantsData.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(insurancePolicySearch.toLowerCase()) ||
      p.code.toLowerCase().includes(insurancePolicySearch.toLowerCase());
    const matchesStatus = insurancePolicyStatusFilter === 'all' || p.status === insurancePolicyStatusFilter;
    const matchesType = insurancePolicyTypeFilter === 'all' || p.insuranceType === insurancePolicyTypeFilter || p.insuranceType === 'all';
    return matchesSearch && matchesStatus && matchesType;
  });

  // Toggle insurance policy employee selection
  const toggleInsurancePolicyEmployeeSelection = (employeeId: string) => {
    setSelectedInsurancePolicyEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // Toggle select all insurance policy participants
  const toggleSelectAllInsurancePolicyEmployees = () => {
    if (selectedInsurancePolicyEmployees.length === filteredInsurancePolicyParticipants.length) {
      setSelectedInsurancePolicyEmployees([]);
    } else {
      setSelectedInsurancePolicyEmployees(filteredInsurancePolicyParticipants.map(p => p.id));
    }
  };

  // Filter available employees for insurance policy
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

  // Get insurance type display name
  const getInsuranceTypeName = (type: InsurancePolicyParticipant['insuranceType']) => {
    switch (type) {
      case 'social': return 'BHXH';
      case 'health': return 'BHYT';
      case 'unemployment': return 'BHTN';
      case 'all': return 'Đầy đủ';
      default: return type;
    }
  };

  // Get insurance status badge
  const getInsuranceStatusBadge = (status: InsurancePolicyParticipant['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-primary text-primary-foreground">Đang tham gia</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Không tham gia</Badge>;
      case 'expired':
        return <Badge variant="destructive">Hết hạn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Render tax policy content
  const renderTaxPolicy = () => {
    return (
      <div className="flex h-[calc(100vh-120px)]">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Chính sách thuế</h1>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm người tham gia"
                    className="pl-10 w-64"
                    value={taxPolicySearch}
                    onChange={(e) => setTaxPolicySearch(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-primary gap-2">
                      Thêm người tham gia
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowAddTaxPolicyParticipantDialog(true)}>
                      Thêm từ danh sách nhân viên
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Nhập từ Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 mt-4 border-b -mx-6 px-6">
              <button
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors",
                  taxPolicyTab === 'participants' 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setTaxPolicyTab('participants')}
              >
                {t('payroll.taxPolicy.participants')}
              </button>
              <button
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors",
                  taxPolicyTab === 'pending' 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setTaxPolicyTab('pending')}
              >
                {t('payroll.taxPolicy.pendingTab')}
              </button>
              <button
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1",
                  taxPolicyTab === 'settings' 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setTaxPolicyTab('settings')}
              >
                <Settings className="w-4 h-4" />
                {t('payroll.taxPolicy.settings')}
              </button>
            </div>
          </div>

          {/* Table */}
          {taxPolicyTab === 'participants' && (
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="w-10 p-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={selectedTaxPolicyEmployees.length === filteredTaxPolicyParticipants.length && filteredTaxPolicyParticipants.length > 0}
                        onChange={toggleSelectAllTaxPolicyEmployees}
                      />
                    </th>
                    <th className="w-12 p-3 text-center text-xs font-medium text-muted-foreground"></th>
                     <th className="p-3 text-left text-xs font-medium text-muted-foreground">{t('payroll.taxPolicy.personnel')}</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">{t('payroll.taxPolicy.policy')}</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground">{t('common.status')}</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">{t('payroll.taxPolicy.creator')}</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTaxPolicyParticipants.map((participant, index) => (
                    <tr key={participant.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          checked={selectedTaxPolicyEmployees.includes(participant.id)}
                          onChange={() => toggleTaxPolicyEmployeeSelection(participant.id)}
                        />
                      </td>
                      <td className="p-3 text-center text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              {participant.name.split(' ').pop()?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {participant.code} • {participant.position}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm">{participant.policyName.length > 20 ? participant.policyName.substring(0, 20) + '...' : participant.policyName}</p>
                          <p className="text-xs text-muted-foreground">{participant.effectiveDate}</p>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge 
                          variant={participant.status === 'active' ? 'default' : 'secondary'}
                          className={cn(
                            participant.status === 'active' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {participant.status === 'active' ? t('payroll.taxPolicy.available') : t('payroll.taxPolicy.unavailable')}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm">{participant.createdBy.length > 15 ? participant.createdBy.substring(0, 15) + '...' : participant.createdBy}</p>
                          <p className="text-xs text-muted-foreground">{participant.createdByPosition.length > 20 ? participant.createdByPosition.substring(0, 20) + '...' : participant.createdByPosition}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="sm" className="gap-1">
                              {t('payroll.common.edit')}
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Pencil className="w-4 h-4 mr-2" />
                              {t('payroll.common.editDetail')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('payroll.common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t bg-card sticky bottom-0">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="default" size="sm" className="h-8 w-8 p-0">
                    1
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Hiển thị kết quả 1 - {filteredTaxPolicyParticipants.length} của {filteredTaxPolicyParticipants.length}
                </span>
              </div>
            </div>
          )}

          {taxPolicyTab === 'pending' && (
            <div className="flex-1 flex items-center justify-center">
              <Card className="p-8 text-center">
                 <p className="text-muted-foreground">{t('payroll.taxPolicy.noPending')}</p>
              </Card>
            </div>
          )}

          {taxPolicyTab === 'settings' && (
            <div className="flex-1 flex items-center justify-center">
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">{t('payroll.taxPolicy.settingsInDev')}</p>
              </Card>
            </div>
          )}
        </div>

        {/* Right Sidebar Filters */}
        <div className="w-72 border-l p-4 bg-muted/30 overflow-y-auto">
          {/* Ngày áp dụng */}
          <Collapsible 
            open={showTaxPolicyDateFilter} 
            onOpenChange={setShowTaxPolicyDateFilter}
            className="mb-6"
          >
            <CollapsibleTrigger asChild>
              <button 
                className="flex items-center justify-between w-full text-sm font-medium mb-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>NGÀY ÁP DỤNG</span>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  showTaxPolicyDateFilter && "rotate-180"
                )} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Vui lòng chọn"
                  value={taxPolicyDateFilter}
                  onChange={(e) => setTaxPolicyDateFilter(e.target.value)}
                  className="pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Thứ tự hiển thị */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">THỨ TỰ HIỂN THỊ</h4>
            <RadioGroup 
              value={taxPolicySortOrder} 
              onValueChange={(value: 'newest' | 'effective-date' | 'employee-id-asc' | 'employee-id-desc') => setTaxPolicySortOrder(value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="newest" id="sort-newest" />
                <Label htmlFor="sort-newest" className="font-normal cursor-pointer text-sm">Mới tạo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="effective-date" id="sort-effective" />
                <Label htmlFor="sort-effective" className="font-normal cursor-pointer text-sm">Ngày hiệu lực</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employee-id-asc" id="sort-id-asc" />
                <Label htmlFor="sort-id-asc" className="font-normal cursor-pointer text-sm flex items-center gap-1">
                  ID nhân viên <ArrowUp className="w-3 h-3" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employee-id-desc" id="sort-id-desc" />
                <Label htmlFor="sort-id-desc" className="font-normal cursor-pointer text-sm flex items-center gap-1">
                  ID nhân viên <ArrowDown className="w-3 h-3" />
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Trạng thái tham gia */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">TRẠNG THÁI THAM GIA</h4>
            <RadioGroup 
              value={taxPolicyStatusFilter} 
              onValueChange={(value: 'all' | 'active' | 'inactive') => setTaxPolicyStatusFilter(value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="status-all" />
                <Label htmlFor="status-all" className="font-normal cursor-pointer text-sm">Tất cả</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="status-active" />
                <Label htmlFor="status-active" className="font-normal cursor-pointer text-sm">Đang tham gia</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="status-inactive" />
                <Label htmlFor="status-inactive" className="font-normal cursor-pointer text-sm">Phúc lợi cũ</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Chính sách thuế */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">CHÍNH SÁCH THUẾ</h4>
            <RadioGroup 
              value={taxPolicyTypeFilter} 
              onValueChange={(value: 'all' | 'progressive' | 'flat') => setTaxPolicyTypeFilter(value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="type-all" />
                <Label htmlFor="type-all" className="font-normal cursor-pointer text-sm">Tất cả chính sách</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="progressive" id="type-progressive" />
                <Label htmlFor="type-progressive" className="font-normal cursor-pointer text-sm">Thuế theo biểu lũy tiến</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="flat" id="type-flat" />
                <Label htmlFor="type-flat" className="font-normal cursor-pointer text-sm">Thuế theo hệ số phần trăm cố định...</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    );
  };

  // Render insurance policy content
  const renderInsurancePolicy = () => {
    return (
      <div className="flex h-[calc(100vh-120px)]">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Chính sách bảo hiểm</h1>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm người tham gia"
                    className="pl-10 w-64"
                    value={insurancePolicySearch}
                    onChange={(e) => setInsurancePolicySearch(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-primary gap-2">
                      Thêm người tham gia
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border shadow-lg z-50">
                    <DropdownMenuItem onClick={() => setShowAddInsurancePolicyParticipantDialog(true)}>
                      Thêm từ danh sách nhân viên
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Nhập từ Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 mt-4 border-b -mx-6 px-6">
              <button
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors",
                  insurancePolicyTab === 'participants' 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setInsurancePolicyTab('participants')}
              >
                NGƯỜI THAM GIA
              </button>
              <button
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors",
                  insurancePolicyTab === 'pending' 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setInsurancePolicyTab('pending')}
              >
                CHỜ XỬ LÝ
              </button>
              <button
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1",
                  insurancePolicyTab === 'settings' 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setInsurancePolicyTab('settings')}
              >
                <Settings className="w-4 h-4" />
                CÀI ĐẶT
              </button>
            </div>
          </div>

          {/* Table */}
          {insurancePolicyTab === 'participants' && (
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="w-10 p-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={selectedInsurancePolicyEmployees.length === filteredInsurancePolicyParticipants.length && filteredInsurancePolicyParticipants.length > 0}
                        onChange={toggleSelectAllInsurancePolicyEmployees}
                      />
                    </th>
                    <th className="w-12 p-3 text-center text-xs font-medium text-muted-foreground"></th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">NHÂN SỰ</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">LOẠI BẢO HIỂM</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">SỐ BẢO HIỂM</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">MỨC ĐÓNG</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground">TRẠNG THÁI</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">NGƯỜI TẠO</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInsurancePolicyParticipants.map((participant, index) => (
                    <tr key={participant.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          checked={selectedInsurancePolicyEmployees.includes(participant.id)}
                          onChange={() => toggleInsurancePolicyEmployeeSelection(participant.id)}
                        />
                      </td>
                      <td className="p-3 text-center text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              {participant.name.split(' ').pop()?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {participant.code} • {participant.position}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm font-medium">{getInsuranceTypeName(participant.insuranceType)}</p>
                          <p className="text-xs text-muted-foreground">{t('payroll.insurancePolicy.from')} {participant.effectiveDate}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {participant.socialInsuranceNumber && (
                            <p className="text-xs"><span className="text-muted-foreground">BHXH:</span> {participant.socialInsuranceNumber}</p>
                          )}
                          {participant.healthInsuranceNumber && (
                            <p className="text-xs"><span className="text-muted-foreground">BHYT:</span> {participant.healthInsuranceNumber}</p>
                          )}
                          {!participant.socialInsuranceNumber && !participant.healthInsuranceNumber && (
                            <p className="text-xs text-muted-foreground">{t('payroll.insurancePolicy.notAvailable')}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <p className="font-medium">{formatCurrency(participant.baseSalary)}</p>
                      </td>
                      <td className="p-3 text-center">
                        {getInsuranceStatusBadge(participant.status)}
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm">{participant.createdBy.length > 15 ? participant.createdBy.substring(0, 15) + '...' : participant.createdBy}</p>
                          <p className="text-xs text-muted-foreground">{participant.createdByPosition.length > 20 ? participant.createdByPosition.substring(0, 20) + '...' : participant.createdByPosition}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1">
                               {t('payroll.common.edit')}
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border shadow-lg z-50">
                            <DropdownMenuItem>
                              <Pencil className="w-4 h-4 mr-2" />
                              {t('payroll.common.editDetail')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                               {t('payroll.common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t bg-card sticky bottom-0">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="default" size="sm" className="h-8 w-8 p-0">
                    1
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {t('payroll.taxPolicy.showingResults', { from: 1, to: filteredInsurancePolicyParticipants.length, total: filteredInsurancePolicyParticipants.length })}
                </span>
              </div>
            </div>
          )}

          {insurancePolicyTab === 'pending' && (
            <div className="flex-1 flex items-center justify-center">
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">{t('payroll.taxPolicy.noPending')}</p>
              </Card>
            </div>
          )}

          {insurancePolicyTab === 'settings' && (
            <div className="flex-1 flex items-center justify-center">
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">{t('payroll.insurancePolicy.settingsInDev')}</p>
              </Card>
            </div>
          )}
        </div>

        {/* Right Sidebar Filters */}
        <div className="w-72 border-l p-4 bg-muted/30 overflow-y-auto">
          {/* Ngày áp dụng */}
          <Collapsible 
            open={showInsurancePolicyDateFilter} 
            onOpenChange={setShowInsurancePolicyDateFilter}
            className="mb-6"
          >
            <CollapsibleTrigger asChild>
              <button 
                className="flex items-center justify-between w-full text-sm font-medium mb-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                 <span>{t('payroll.taxPolicy.applicationDate')}</span>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  showInsurancePolicyDateFilter && "rotate-180"
                )} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
              <div className="relative">
                <Input
                  type="text"
                   placeholder={t('payroll.common.pleaseSelect')}
                  value={insurancePolicyDateFilter}
                  onChange={(e) => setInsurancePolicyDateFilter(e.target.value)}
                  className="pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Thứ tự hiển thị */}
          <div className="mb-6">
             <h4 className="text-sm font-medium mb-3 text-muted-foreground">{t('payroll.taxPolicy.displayOrder')}</h4>
            <RadioGroup 
              value={insurancePolicySortOrder} 
              onValueChange={(value: 'newest' | 'effective-date' | 'employee-id-asc' | 'employee-id-desc') => setInsurancePolicySortOrder(value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="newest" id="ins-sort-newest" />
                <Label htmlFor="ins-sort-newest" className="font-normal cursor-pointer text-sm">{t('payroll.taxPolicy.newest')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="effective-date" id="ins-sort-effective" />
                <Label htmlFor="ins-sort-effective" className="font-normal cursor-pointer text-sm">{t('payroll.taxPolicy.effectiveDate')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employee-id-asc" id="ins-sort-id-asc" />
                <Label htmlFor="ins-sort-id-asc" className="font-normal cursor-pointer text-sm flex items-center gap-1">
                   {t('payroll.taxPolicy.employeeIdAsc')} <ArrowUp className="w-3 h-3" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employee-id-desc" id="ins-sort-id-desc" />
                <Label htmlFor="ins-sort-id-desc" className="font-normal cursor-pointer text-sm flex items-center gap-1">
                   {t('payroll.taxPolicy.employeeIdAsc')} <ArrowDown className="w-3 h-3" />
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Trạng thái tham gia */}
          <div className="mb-6">
             <h4 className="text-sm font-medium mb-3 text-muted-foreground">{t('payroll.taxPolicy.participationStatus')}</h4>
            <RadioGroup 
              value={insurancePolicyStatusFilter} 
              onValueChange={(value: 'all' | 'active' | 'inactive' | 'expired') => setInsurancePolicyStatusFilter(value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="ins-status-all" />
                <Label htmlFor="ins-status-all" className="font-normal cursor-pointer text-sm">{t('common.all')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="ins-status-active" />
                <Label htmlFor="ins-status-active" className="font-normal cursor-pointer text-sm">{t('payroll.insurancePolicy.participating')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="ins-status-inactive" />
                <Label htmlFor="ins-status-inactive" className="font-normal cursor-pointer text-sm">{t('payroll.insurancePolicy.notParticipating')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expired" id="ins-status-expired" />
                <Label htmlFor="ins-status-expired" className="font-normal cursor-pointer text-sm">{t('payroll.insurancePolicy.expired')}</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Loại bảo hiểm */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">{t('payroll.insurancePolicy.insuranceType')}</h4>
            <RadioGroup 
              value={insurancePolicyTypeFilter} 
              onValueChange={(value: 'all' | 'social' | 'health' | 'unemployment') => setInsurancePolicyTypeFilter(value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="ins-type-all" />
                <Label htmlFor="ins-type-all" className="font-normal cursor-pointer text-sm">{t('payroll.insurancePolicy.allTypes')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="social" id="ins-type-social" />
                <Label htmlFor="ins-type-social" className="font-normal cursor-pointer text-sm">{t('payroll.insurancePolicy.social')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="health" id="ins-type-health" />
                <Label htmlFor="ins-type-health" className="font-normal cursor-pointer text-sm">{t('payroll.insurancePolicy.health')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unemployment" id="ins-type-unemployment" />
                <Label htmlFor="ins-type-unemployment" className="font-normal cursor-pointer text-sm">{t('payroll.insurancePolicy.unemployment')}</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    );
  };

  // Render policy tab content
  const renderPolicyContent = () => {
    switch (activePolicySubTab) {
      case 'tax':
        return <TaxPolicyTab />;
      case 'insurance':
        return <InsurancePolicyTab />;
      case 'bonus':
        return <BonusPolicyTab />;
      case 'sales':
        return <SalesDataTab />;
      default:
        return (
          <div className="p-6">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
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
        return <PayrollBatchesTab />;
      case 'calc-advance':
        return <AdvanceRequestsTab />;
      case 'calc-tax-settlement':
        if (selectedTaxSettlement) {
          return renderTaxSettlementDetail();
        }
        return renderTaxSettlementList();
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
      case 'data':
        return renderDataContent();
      case 'components':
        return renderSalaryComponents();
      case 'calculate':
        return renderCalcContent();
      case 'policy':
        return renderPolicyContent();
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
      <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('payroll.paymentForm.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* Bảng lương */}
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
                    <SelectItem value="salary-09-2021">Bảng lương tháng 9/2021 - VP Hà Nội</SelectItem>
                    <SelectItem value="salary-08-2021">Bảng lương tháng 8/2021 - VP Hà Nội</SelectItem>
                    <SelectItem value="salary-07-2021">Bảng lương tháng 7/2021 - VP Hà Nội</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Input 
                  value="Tháng 09/2021" 
                  readOnly 
                  className="bg-muted text-muted-foreground"
                />
              </div>
            </div>

            {/* Đơn vị áp dụng */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.common.appliedUnit')}
              </Label>
              <div className="col-span-9">
                <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md min-h-[40px] bg-background">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Văn phòng UNICOM Hà Nội
                    <button className="hover:bg-muted rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Vị trí áp dụng */}
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

            {/* Nhân viên áp dụng */}
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

            {/* Tên bảng chi trả lương */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                {t('payroll.paymentForm.paymentBatchName')} <span className="text-destructive">*</span>
              </Label>
              <div className="col-span-9">
                <Input 
                   defaultValue="Bảng chi trả lương Kỳ 1 - tháng 09/2021 lần 2 - Văn phòng UNICOM Hà Nội"
                   placeholder={t('payroll.paymentForm.paymentBatchNamePlaceholder')}
                />
              </div>
            </div>

            {/* Kỳ chi trả */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                {t('payroll.paymentForm.paymentPeriod')} <span className="text-destructive">*</span>
              </Label>
              <div className="col-span-4">
                <Select defaultValue="ky-2">
                  <SelectTrigger className="bg-primary text-primary-foreground border-primary">
                    <SelectValue placeholder="Chọn kỳ" />
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

            {/* Trả lương theo */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.paymentForm.payBy')}
              </Label>
              <div className="col-span-4">
                <Select defaultValue="percent">
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
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

            {/* Hình thức thanh toán */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.paymentForm.paymentMethodLabel')}
              </Label>
              <div className="col-span-9">
                <Select defaultValue="cash">
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hình thức" />
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
            <Button variant="outline" onClick={() => setShowAddPaymentDialog(false)}>
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={() => setShowAddPaymentDialog(false)}
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
            {/* Kỳ lương */}
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

            {/* Bảng lương */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.summaryForm.payrollTable')} <span className="text-destructive">*</span>
              </Label>
              <div className="col-span-9">
                <Button variant="link" className="text-emerald-600 p-0 h-auto gap-1">
                  <Plus className="w-4 h-4" />
                  {t('payroll.summaryForm.addPayrollTable')}
                </Button>
              </div>
            </div>

            {/* Đơn vị */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                 {t('payroll.summaryForm.unit')}
              </Label>
              <div className="col-span-9">
                <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md min-h-[40px] bg-background">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Công ty Cổ phần UNICOM
                    <button className="hover:bg-muted rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Vị trí */}
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

            {/* Tên bảng tổng hợp */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <Label className="col-span-3 text-sm font-medium pt-2">
                {t('payroll.summaryForm.summaryName')} <span className="text-destructive">*</span>
              </Label>
              <div className="col-span-9">
                <Input 
                  defaultValue="Bảng tổng hợp lương Tháng 5/2022 - Công ty Cổ phần UNICOM"
                  placeholder={t('payroll.summaryForm.summaryNamePlaceholder')}
                />
              </div>
            </div>

            {/* Ngày tổng hợp */}
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
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={() => setShowAddPayrollSummaryDialog(false)}
            >
               {t('payroll.agree')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Payroll Batch Confirmation Dialog */}
      <Dialog open={showDeletePayrollBatchDialog} onOpenChange={setShowDeletePayrollBatchDialog}>
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
              <p className="text-xs text-amber-700 dark:text-amber-400">
                 {t('payroll.deleteSummary.cannotUndo')}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeletePayrollBatchDialog(false);
                setPayrollBatchToDelete(null);
              }}
            >
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                // Handle delete logic here
                setShowDeletePayrollBatchDialog(false);
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
          onOpenChange={setShowPayslipPrintDialog}
          employees={payrollSummaryEmployeesData}
          batchName={selectedPayrollSummaryBatch.name}
          salaryPeriod={selectedPayrollSummaryBatch.salaryPeriod}
          companyName={selectedPayrollSummaryBatch.department}
          initialEmployeeIndex={printEmployeeIndex}
        />
      )}

      {/* Add Advance Dialog (Thêm bảng tạm ứng) */}
      <Dialog open={showAddAdvanceDialog} onOpenChange={setShowAddAdvanceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('payroll.advanceForm.addTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Bảng lương */}
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

            {/* Đơn vị áp dụng */}
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

            {/* Vị trí áp dụng */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
               <Label className="text-right">{t('payroll.common.appliedPosition')}</Label>
              <Input
                 value={t('payroll.common.allPositionsInUnit')}
                readOnly
                className="bg-muted/50"
              />
            </div>

            {/* Nhân viên áp dụng */}
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

            {/* Tên bảng tạm ứng */}
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

            {/* Diễn giải */}
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
             <Button variant="outline" onClick={() => setShowAddAdvanceDialog(false)}>
               {t('payroll.common.cancel')}
             </Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => {
                // Handle create advance logic here
                setShowAddAdvanceDialog(false);
              }}
            >
               {t('payroll.agree')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Advance Batch Confirmation Dialog */}
      <Dialog open={showDeleteAdvanceDialog} onOpenChange={setShowDeleteAdvanceDialog}>
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
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {t('payroll.deleteSummary.cannotUndo')}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteAdvanceDialog(false);
                setAdvanceToDelete(null);
              }}
            >
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                setShowDeleteAdvanceDialog(false);
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
      <Dialog open={showEditAdvanceDialog} onOpenChange={setShowEditAdvanceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('payroll.advanceForm.editTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Tên bảng tạm ứng */}
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

            {/* Đơn vị */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('payroll.summaryForm.unit')}</Label>
              <Input
                value={advanceToEdit?.department || ''}
                readOnly
                className="bg-muted/50"
              />
            </div>

            {/* Kỳ lương */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('payroll.salaryPeriod')}</Label>
              <Input
                value={advanceToEdit?.salaryPeriod || ''}
                readOnly
                className="bg-muted/50"
              />
            </div>

            {/* Trạng thái */}
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
              setShowEditAdvanceDialog(false);
              setAdvanceToEdit(null);
            }}>
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => {
                // Handle update advance logic here
                setShowEditAdvanceDialog(false);
                setAdvanceToEdit(null);
              }}
            >
               {t('payroll.advanceForm.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
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
                setShowApprovalDialog(false);
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
                setShowApprovalDialog(false);
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
      <Dialog open={showEditSalaryComponentDialog} onOpenChange={setShowEditSalaryComponentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('payroll.componentForm.editTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Mã thành phần */}
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

            {/* Tên thành phần */}
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

            {/* Đơn vị áp dụng */}
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
                  <SelectItem value="Công ty TNHH Đại Thành">Công ty TNHH Đại Thành</SelectItem>
                  <SelectItem value="Công ty ABC">Công ty ABC</SelectItem>
                  <SelectItem value="Công ty XYZ">Công ty XYZ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loại thành phần */}
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
                     <SelectItem value="Chấm công">{t('payroll.componentForm.attendance')}</SelectItem>
                     <SelectItem value="Lương">{t('payroll.componentForm.salary')}</SelectItem>
                     <SelectItem value="Bảo hiểm - Công đoàn">{t('payroll.componentForm.insuranceUnion')}</SelectItem>
                     <SelectItem value="Phụ cấp">{t('payroll.componentForm.allowance')}</SelectItem>
                     <SelectItem value="Thưởng">{t('payroll.componentForm.reward')}</SelectItem>
                     <SelectItem value="Thuế">{t('payroll.componentForm.taxType')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tính chất */}
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

            {/* Kiểu giá trị */}
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

            {/* Giá trị (Công thức) */}
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
            <Button variant="outline" onClick={() => {
              setShowEditSalaryComponentDialog(false);
              setSalaryComponentToEdit(null);
            }}>
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={saveEditedSalaryComponent}
              disabled={!editSalaryComponentForm.code.trim() || !editSalaryComponentForm.name.trim()}
            >
               {t('payroll.advanceForm.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Salary Component Confirmation Dialog */}
      <Dialog open={showDeleteSalaryComponentDialog} onOpenChange={setShowDeleteSalaryComponentDialog}>
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
              onClick={() => {
                setShowDeleteSalaryComponentDialog(false);
                setSalaryComponentToDelete(null);
              }}
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

      {/* Add Salary Component Dialog */}
      <Dialog open={showAddSalaryComponentDialog} onOpenChange={(open) => {
        setShowAddSalaryComponentDialog(open);
        if (!open) resetAddSalaryComponentForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" />
              {t('payroll.componentForm.addTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Mã thành phần */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">
                {t('payroll.componentForm.componentCode')} <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-1">
                <Input
                  value={addSalaryComponentForm.code}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
                    setAddSalaryComponentForm(prev => ({ ...prev, code: value }));
                    if (addSalaryComponentErrors.code) {
                      setAddSalaryComponentErrors(prev => ({ ...prev, code: undefined }));
                    }
                  }}
                  placeholder="VD: LUONG_CO_BAN"
                  className={addSalaryComponentErrors.code ? 'border-destructive' : ''}
                />
                {addSalaryComponentErrors.code && (
                  <p className="text-xs text-destructive">{addSalaryComponentErrors.code}</p>
                )}
                 <p className="text-xs text-muted-foreground">
                   {t('payroll.componentForm.codeHint')}
                </p>
              </div>
            </div>

            {/* Tên thành phần */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">
                {t('payroll.componentForm.componentName')} <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-1">
                <Input
                  value={addSalaryComponentForm.name}
                  onChange={(e) => {
                    setAddSalaryComponentForm(prev => ({ ...prev, name: e.target.value }));
                    if (addSalaryComponentErrors.name) {
                      setAddSalaryComponentErrors(prev => ({ ...prev, name: undefined }));
                    }
                  }}
                  placeholder="VD: Lương cơ bản"
                  className={addSalaryComponentErrors.name ? 'border-destructive' : ''}
                />
                {addSalaryComponentErrors.name && (
                  <p className="text-xs text-destructive">{addSalaryComponentErrors.name}</p>
                )}
              </div>
            </div>

            {/* Loại thành phần */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">
                {t('payroll.componentForm.componentType')} <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-1">
                <Select 
                  value={addSalaryComponentForm.componentType} 
                  onValueChange={(value) => {
                    setAddSalaryComponentForm(prev => ({ ...prev, componentType: value }));
                    if (addSalaryComponentErrors.componentType) {
                      setAddSalaryComponentErrors(prev => ({ ...prev, componentType: undefined }));
                    }
                  }}
                >
                  <SelectTrigger className={addSalaryComponentErrors.componentType ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('payroll.componentForm.selectType')} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-lg z-50">
                     <SelectItem value="Chấm công">{t('payroll.componentForm.attendance')}</SelectItem>
                     <SelectItem value="Lương">{t('payroll.componentForm.salary')}</SelectItem>
                     <SelectItem value="Bảo hiểm - Công đoàn">{t('payroll.componentForm.insuranceUnion')}</SelectItem>
                     <SelectItem value="Phụ cấp">{t('payroll.componentForm.allowance')}</SelectItem>
                     <SelectItem value="Thưởng">{t('payroll.componentForm.reward')}</SelectItem>
                     <SelectItem value="Thuế">{t('payroll.componentForm.taxType')}</SelectItem>
                     <SelectItem value="Khấu trừ khác">{t('payroll.componentForm.otherDeduction')}</SelectItem>
                  </SelectContent>
                </Select>
                {addSalaryComponentErrors.componentType && (
                  <p className="text-xs text-destructive">{addSalaryComponentErrors.componentType}</p>
                )}
              </div>
            </div>

            {/* Đơn vị áp dụng - Multi-select with tags */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">
                 {t('payroll.common.appliedUnit')} <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className={cn(
                      "flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer",
                      addSalaryComponentErrors.appliedUnits && "border-destructive"
                    )}>
                      {addSalaryComponentForm.appliedUnits.length > 0 ? (
                        addSalaryComponentForm.appliedUnits.map((unit) => (
                          <Badge 
                            key={unit} 
                            variant="secondary" 
                            className="gap-1 pr-1"
                          >
                            {unit}
                            <button
                              type="button"
                              className="ml-1 rounded-full hover:bg-muted-foreground/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeUnitFromSelection(unit);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">{t('payroll.componentForm.selectAppliedUnit')}</span>
                      )}
                      <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[400px] bg-popover border shadow-lg z-50">
                    {availableUnits.map((unit) => (
                      <DropdownMenuItem
                        key={unit}
                        onClick={() => toggleUnitSelection(unit)}
                        className="flex items-center gap-2"
                      >
                        <div className={cn(
                          "h-4 w-4 rounded border flex items-center justify-center",
                          addSalaryComponentForm.appliedUnits.includes(unit) 
                            ? "bg-primary border-primary" 
                            : "border-input"
                        )}>
                          {addSalaryComponentForm.appliedUnits.includes(unit) && (
                            <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        {unit}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {addSalaryComponentErrors.appliedUnits && (
                  <p className="text-xs text-destructive">{addSalaryComponentErrors.appliedUnits}</p>
                )}
              </div>
            </div>

            {/* Tính chất + Chịu thuế */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('payroll.componentForm.nature')}</Label>
              <div className="flex items-center gap-4">
                <Select 
                  value={addSalaryComponentForm.nature} 
                  onValueChange={(value: SalaryComponent['nature']) => setAddSalaryComponentForm(prev => ({ ...prev, nature: value }))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-lg z-50">
                     <SelectItem value="income">{t('payroll.salaryComponents.income')}</SelectItem>
                     <SelectItem value="deduction">{t('payroll.salaryComponents.deduction')}</SelectItem>
                     <SelectItem value="other">{t('payroll.salaryComponents.other')}</SelectItem>
                  </SelectContent>
                </Select>
                <RadioGroup 
                  value={addSalaryComponentForm.isTaxable ? 'taxable' : 'nontaxable'}
                  onValueChange={(value) => setAddSalaryComponentForm(prev => ({ ...prev, isTaxable: value === 'taxable' }))}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="taxable" id="taxable" />
                    <Label htmlFor="taxable" className="font-normal cursor-pointer">{t('payroll.componentForm.taxable')}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nontaxable" id="nontaxable" />
                    <Label htmlFor="nontaxable" className="font-normal cursor-pointer">{t('payroll.componentForm.nonTaxable')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Định mức + Cho phép vượt */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('payroll.componentForm.quota')}</Label>
              <div className="flex items-center gap-4">
                <Input
                  value={addSalaryComponentForm.quota}
                  onChange={(e) => setAddSalaryComponentForm(prev => ({ ...prev, quota: e.target.value }))}
                  placeholder={t('payroll.componentForm.quotaPlaceholder')}
                  className="w-[150px]"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowExceedQuota"
                    checked={addSalaryComponentForm.allowExceedQuota}
                    onChange={(e) => setAddSalaryComponentForm(prev => ({ ...prev, allowExceedQuota: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="allowExceedQuota" className="font-normal cursor-pointer flex items-center gap-1">
                    {t('payroll.componentForm.allowExceedQuota')}
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </Label>
                </div>
              </div>
            </div>

            {/* Kiểu giá trị */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">{t('payroll.componentForm.valueType')}</Label>
              <div className="space-y-2">
                <Select 
                  value={addSalaryComponentForm.valueType} 
                  onValueChange={(value: SalaryComponent['valueType']) => setAddSalaryComponentForm(prev => ({ ...prev, valueType: value }))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-lg z-50">
                     <SelectItem value="currency">{t('payroll.salaryComponents.currency')}</SelectItem>
                     <SelectItem value="number">{t('payroll.salaryComponents.number')}</SelectItem>
                     <SelectItem value="percentage">{t('payroll.salaryComponents.percentage')}</SelectItem>
                  </SelectContent>
                </Select>
                {/* Formula input with autocomplete */}
                <FormulaInput
                  value={addSalaryComponentForm.formula}
                  onChange={(value) => setAddSalaryComponentForm(prev => ({ ...prev, formula: value }))}
                  availableComponents={formulaAvailableComponents}
                  placeholder="VD: =SUM(LUONG_CO_BAN,PHU_CAP)"
                />
              </div>
            </div>

            {/* Mô tả */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">{t('payroll.componentForm.descriptionLabel')}</Label>
              <textarea
                value={addSalaryComponentForm.description}
                onChange={(e) => setAddSalaryComponentForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('payroll.componentForm.descriptionPlaceholder')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setShowAddSalaryComponentDialog(false);
              resetAddSalaryComponentForm();
            }}>
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              variant="outline"
              onClick={saveAndAddAnotherSalaryComponent}
            >
              {t('payroll.componentForm.saveAndAdd')}
            </Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={saveNewSalaryComponent}
            >
               {t('payroll.common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* System Salary Components Dialog */}
      <Dialog 
        open={showSystemComponentsDialog} 
        onOpenChange={(open) => {
          setShowSystemComponentsDialog(open);
          if (!open) {
            setSelectedSystemComponents([]);
            setSystemComponentsSearch('');
            setSystemComponentsTypeFilter('all');
            setSystemComponentsPage(1);
          }
        }}
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
                        selectedSystemComponents.includes(component.id) && "bg-emerald-50 dark:bg-emerald-950/20"
                      )}
                      onClick={() => toggleSystemComponentSelection(component.id)}
                    >
                      <td className="p-3">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
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
                setShowSystemComponentsDialog(false);
                setSelectedSystemComponents([]);
                setSystemComponentsSearch('');
                setSystemComponentsTypeFilter('all');
                setSystemComponentsPage(1);
              }}
            >
               {t('payroll.common.cancel')}
            </Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
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
