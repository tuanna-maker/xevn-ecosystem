import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Users,
  ClipboardCheck,
  Clock,
  FileText,
  Settings,
  CalendarIcon,
  UserCheck,
  Shield,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Settings2,
  GripVertical,
  Plus,
  Eye,
  RotateCcw,
  Copy,
  Info,
  Sparkles,
  Smartphone,
  MapPin,
  Wifi,
  QrCode,
  Pencil,
  Trash2,
  Check,
  LayoutGrid,
  BarChart3,
  CalendarOff,
  Loader2,
} from 'lucide-react';
import { LeaveTab } from '@/components/attendance/LeaveTab';
import { OvertimeRequestTab } from '@/components/attendance/OvertimeRequestTab';
import { BusinessTripRequestTab } from '@/components/attendance/BusinessTripRequestTab';
import { LateEarlyRequestTab } from '@/components/attendance/LateEarlyRequestTab';
import { AttendanceUpdateRequestTab } from '@/components/attendance/AttendanceUpdateRequestTab';
import { ShiftChangeRequestTab } from '@/components/attendance/ShiftChangeRequestTab';
import { CheckInOutWidget } from '@/components/attendance/CheckInOutWidget';
import { AttendanceRecordsTable } from '@/components/attendance/AttendanceRecordsTable';
import { QRCodeScanner } from '@/components/attendance/QRCodeScanner';
import { EmployeeQRCard } from '@/components/attendance/EmployeeQRCard';
import { FaceIDScanner } from '@/components/attendance/FaceIDScanner';
import { FaceRegistration } from '@/components/attendance/FaceRegistration';
import { GPSAttendance } from '@/components/attendance/GPSAttendance';
import { AttendanceReportsTab } from '@/components/attendance/AttendanceReportsTab';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useDepartments } from '@/hooks/useDepartments';
import { useEmployees } from '@/hooks/useEmployees';
import { cn } from '@/lib/utils';
import { useAttendanceSheets } from '@/hooks/useAttendanceSheets';
import { useWorkShifts } from '@/hooks/useWorkShifts';
import { useAttendanceRules } from '@/hooks/useAttendanceRules';
import { useAttendanceOverview } from '@/hooks/useAttendanceOverview';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Sidebar menu items - using translation keys
const getSidebarMenuItems = (t: any) => [
  { id: 'employees', label: t('attendance.settingsMenu.employees'), icon: Users },
  { id: 'rules', label: t('attendance.settingsMenu.rules'), icon: ClipboardCheck },
  { id: 'overtime', label: t('attendance.settingsMenu.overtime'), icon: Clock },
  { id: 'leave-rules', label: t('attendance.settingsMenu.leaveRules'), icon: FileText },
  { id: 'late-early', label: t('attendance.settingsMenu.lateEarly'), icon: Clock },
  { id: 'request-rules', label: t('attendance.settingsMenu.requestRules'), icon: FileText },
  { id: 'users', label: t('attendance.settingsMenu.users'), icon: UserCheck },
  { id: 'roles', label: t('attendance.settingsMenu.roles'), icon: Shield },
  { id: 'system', label: t('attendance.settingsMenu.system'), icon: Building2 },
];

// Attendance rules sub-tabs
const getAttendanceRulesTabs = (t: any) => [
  { id: 'general', label: t('attendance.rulesTabs.general') },
  { id: 'standard', label: t('attendance.rulesTabs.standard') },
  { id: 'customize', label: t('attendance.rulesTabs.customize') },
  { id: 'device', label: t('attendance.rulesTabs.device') },
  { id: 'app', label: t('attendance.rulesTabs.app') },
  { id: 'tablet', label: t('attendance.rulesTabs.tablet') },
  { id: 'proxy', label: t('attendance.rulesTabs.proxy') },
  { id: 'auto', label: t('attendance.rulesTabs.auto') },
];

// Attendance columns data
const getAttendanceColumnsData = (t: any) => [
  { id: '1', name: t('attendance.columns.holidayWork'), description: t('attendance.columns.holidayWork'), hasAdvanced: false },
  { id: '2', name: t('attendance.columns.paidOvertime'), description: t('attendance.columns.paidOvertime'), hasAdvanced: false },
  { id: '3', name: t('attendance.columns.compensatoryOvertime'), description: t('attendance.columns.compensatoryOvertime'), hasAdvanced: false },
  { id: '4', name: t('attendance.columns.annualLeave'), description: t('attendance.columns.annualLeave'), hasAdvanced: false },
  { id: '5', name: t('attendance.columns.holidayLeave'), description: t('attendance.columns.holidayLeave'), hasAdvanced: false },
  { id: '6', name: t('attendance.columns.businessTrip'), description: t('attendance.columns.businessTrip'), hasAdvanced: true },
  { id: '7', name: t('attendance.columns.unpaidLeave'), description: t('attendance.columns.unpaidLeave'), hasAdvanced: false },
  { id: '8', name: t('attendance.columns.mealAllowance'), description: t('attendance.columns.mealAllowance'), hasAdvanced: false },
  { id: '9', name: t('attendance.columns.totalPaidWork'), description: t('attendance.columns.totalPaidWork'), hasAdvanced: false },
  { id: '10', name: t('attendance.columns.totalOvertime'), description: t('attendance.columns.totalOvertime'), hasAdvanced: false },
];

// Top navigation tabs
const getTopTabs = (t: any) => [
  { id: 'overview', label: t('attendance.tabs.overview'), icon: LayoutGrid, color: 'bg-blue-500' },
  { id: 'attendance', label: t('attendance.tabs.attendance'), hasDropdown: true, icon: ClipboardCheck, color: 'bg-orange-500' },
  { id: 'shifts', label: t('attendance.tabs.shifts'), hasDropdown: true, icon: Clock, color: 'bg-green-500' },
  { id: 'requests', label: t('attendance.tabs.requests'), hasDropdown: true, icon: FileText, color: 'bg-purple-500' },
  { id: 'leave', label: t('attendance.tabs.leave'), icon: CalendarOff, color: 'bg-rose-500' },
  { id: 'reports', label: t('attendance.tabs.reports'), icon: BarChart3, color: 'bg-cyan-500' },
  { id: 'settings', label: t('attendance.tabs.settings'), icon: Settings, color: 'bg-gray-500' },
];

// Attendance submenu items
const getAttendanceMenuItems = (t: any) => [
  { id: 'checkinout', label: t('attendance.attendanceMenu.checkinout') },
  { id: 'qrcode', label: t('attendance.attendanceMenu.qrcode') },
  { id: 'faceid', label: t('attendance.attendanceMenu.faceid') },
  { id: 'gps', label: t('attendance.attendanceMenu.gps') },
  { id: 'sheets', label: t('attendance.attendanceMenu.sheets') },
  { id: 'records', label: t('attendance.attendanceMenu.records') },
  { id: 'weekly', label: t('attendance.attendanceMenu.weekly') },
  { id: 'summary', label: t('attendance.attendanceMenu.summary') },
];

// Shifts submenu items
const getShiftsMenuItems = (t: any) => [
  { id: 'list', label: t('attendance.shiftsMenu.list') },
  { id: 'schedule', label: t('attendance.shiftsMenu.schedule') },
  { id: 'overtime', label: t('attendance.shiftsMenu.overtime') },
];

// Request management dropdown items
const getRequestMenuItems = (t: any) => [
  { id: 'leave', label: t('attendance.requestsMenu.leave') },
  { id: 'late-early', label: t('attendance.requestsMenu.lateEarly') },
  { id: 'overtime', label: t('attendance.requestsMenu.overtime') },
  { id: 'business-trip', label: t('attendance.requestsMenu.businessTrip') },
  { id: 'update-attendance', label: t('attendance.requestsMenu.updateAttendance') },
  { id: 'change-shift', label: t('attendance.requestsMenu.changeShift') },
  { id: 'leave-summary', label: t('attendance.requestsMenu.leaveSummary') },
  { id: 'compensatory-summary', label: t('attendance.requestsMenu.compensatorySummary') },
  { id: 'leave-plan', label: t('attendance.requestsMenu.leavePlan') },
];

// Attendance sheets list data
const attendanceSheetsData = [
  { id: '1', period: '01/12/2021 - 31/12/2021', name: 'Bảng chấm công từ ngày 01/12/2021 đến ngày 31/12/2...', type: 'Theo giờ', unit: 'Chi nhánh Đà Nẵng', positions: 'nhân viên bán hàng; nhân viên hành chính; N' },
  { id: '2', period: '01/12/2021 - 31/12/2021', name: 'Bảng chấm công từ ngày 01/12/2021 đến ngày 31/12/2...', type: 'Theo giờ', unit: 'Phòng Kế toán', positions: 'quản lý kế toán; quản lý kỹ thuật; quản lý pr' },
  { id: '3', period: '01/11/2021 - 30/11/2021', name: 'Bảng chấm công từ ngày 01/11/2021 đến ngày 30/11/2...', type: 'Theo giờ', unit: 'Tất cả đơn vị', positions: 'Tất cả vị trí' },
  { id: '4', period: '01/10/2021 - 31/10/2021', name: 'Bảng chấm công từ ngày 01/10/2021 đến ngày 31/10/2...', type: 'Theo giờ', unit: 'Tất cả đơn vị', positions: 'Tất cả vị trí' },
  { id: '5', period: '25/08/2021 - 24/09/2021', name: 'Bảng chấm công từ ngày 25/08/2021 đến ngày 24/09/2...', type: 'Theo giờ', unit: 'Công ty cổ phần Trang Trí', positions: 'Tất cả vị trí' },
  { id: '6', period: '01/07/2021 - 31/07/2021', name: 'Bảng chấm công từ ngày 01/07/2021 đến ngày 31/07/2...', type: 'Theo ngày', unit: 'Tất cả đơn vị', positions: 'Mật cả vị trí' },
  { id: '7', period: '01/06/2021 - 30/06/2021', name: 'Bảng chấm công từ ngày 01/06/2021 đến ngày 30/06/2...', type: 'Theo ngày', unit: 'Tất cả đơn vị', positions: 'mất cả vị trí' },
  { id: '8', period: '01/05/2021 - 31/05/2021', name: 'Bảng chấm công từ ngày 01/05/2021 đến ngày 31/05/2...', type: 'Theo ngày', unit: 'Tất cả đơn vị', positions: 'quất cả vị trí' },
  { id: '9', period: '01/04/2021 - 30/04/2021', name: 'Bảng chấm công từ ngày 01/04/2021 đến ngày 30/04/2...', type: 'Theo ngày', unit: 'Tất cả đơn vị', positions: 'Tất cả vị trí' },
  { id: '10', period: '01/02/2021 - 28/02/2021', name: 'Bảng chấm công từ ngày 01/02/2021 đến ngày 28/02/2...', type: 'Theo ngày', unit: 'Tất cả đơn vị', positions: 'Tất cả vị trí' },
];

// Weekly attendance summary data
const weeklyAttendanceData = [
  {
    id: '1',
    name: 'Lê Thúy Hạnh',
    code: 'LTHANH',
    days: [
      { dayLabel: 'Thứ 7', date: '01', shifts: [{ name: 'Quốc tế lao động', type: 'holiday' }, { shift: 'HC7', status: 'full', time: '' }] },
      { dayLabel: 'Chủ nhật', date: '02', shifts: [] },
      { dayLabel: 'Thứ 2', date: '03', shifts: [{ shift: 'HC', status: 'full', time: '' }] },
      { dayLabel: 'Thứ 3', date: '04', shifts: [{ shift: 'HC', status: 'full', time: '' }] },
      { dayLabel: 'Thứ 4', date: '05', shifts: [{ shift: 'HC', status: 'full', time: '' }, { name: 'Nghỉ không lương', type: 'leave' }] },
    ],
  },
  {
    id: '2',
    name: 'Nguyễn Hữu Hải',
    code: 'NHHAI',
    days: [
      { dayLabel: 'Thứ 7', date: '01', shifts: [{ name: 'Quốc tế lao động', type: 'holiday' }, { shift: 'HC7', status: 'full', time: '' }] },
      { dayLabel: 'Chủ nhật', date: '02', shifts: [] },
      { dayLabel: 'Thứ 2', date: '03', shifts: [{ shift: 'HC', status: 'full', time: '08:00 - 17:00' }] },
      { dayLabel: 'Thứ 3', date: '04', shifts: [{ shift: 'HC', status: 'full', time: '08:00 - 17:00' }] },
      { dayLabel: 'Thứ 4', date: '05', shifts: [{ shift: 'HC', status: 'full', time: '08:00 - 17:00' }] },
    ],
  },
  {
    id: '3',
    name: 'Nguyễn Thị Lan',
    code: 'NTLAN',
    days: [
      { dayLabel: 'Thứ 7', date: '01', shifts: [{ name: 'Quốc tế lao động', type: 'holiday' }, { shift: 'SANG', status: 'full', time: '' }, { shift: 'TOI', status: 'full', time: '' }] },
      { dayLabel: 'Chủ nhật', date: '02', shifts: [{ shift: 'CHIEU', status: 'half', time: '14:30 - --' }] },
      { dayLabel: 'Thứ 2', date: '03', shifts: [{ shift: 'TOI', status: 'full', time: '' }] },
      { dayLabel: 'Thứ 3', date: '04', shifts: [{ shift: 'TOI', status: 'half', time: '' }] },
      { dayLabel: 'Thứ 4', date: '05', shifts: [{ shift: 'SANG', status: 'full', time: '' }] },
    ],
  },
  {
    id: '4',
    name: 'Nguyễn Thùy Linh',
    code: 'NTLINH',
    days: [
      { dayLabel: 'Thứ 7', date: '01', shifts: [{ name: 'Quốc tế lao động', type: 'holiday' }, { shift: 'HC7', status: 'full', time: '' }] },
      { dayLabel: 'Chủ nhật', date: '02', shifts: [] },
      { dayLabel: 'Thứ 2', date: '03', shifts: [{ shift: 'HC', status: 'full', time: '08:01 - 17:40' }] },
      { dayLabel: 'Thứ 3', date: '04', shifts: [{ shift: 'HC', status: 'late', time: '08:07 - 17:30' }] },
      { dayLabel: 'Thứ 4', date: '05', shifts: [{ shift: 'HC', status: 'full', time: '08:23 - 17:21' }] },
    ],
  },
];

// Generate attendance code
const generateAttendanceCode = (index: number) => {
  const codes = ['C-0618', '1354', '1396', 'A19-0011', '1747', '494', 'C05-0009', '364', 'C09-0094'];
  return codes[index % codes.length];
};

// Mock data for overview charts
const monthlyLeaveData = [
  { month: 'Tháng 1', value: 50 },
  { month: 'Tháng 2', value: 80 },
  { month: 'Tháng 3', value: 120 },
  { month: 'Tháng 4', value: 200 },
  { month: 'Tháng 5', value: 350 },
  { month: 'Tháng 6', value: 500 },
  { month: 'Tháng 7', value: 700 },
  { month: 'Tháng 8', value: 1200 },
  { month: 'Tháng 9', value: 2200 },
  { month: 'Tháng 10', value: 2500 },
  { month: 'Tháng 11', value: 800 },
  { month: 'Tháng 12', value: 150 },
];

const departmentLeaveData = [
  { name: 'CÔNG TY DE...', value: 3276.5 },
  { name: 'Công ty cô...', value: 253 },
  { name: 'Phòng Kinh...', value: 214 },
  { name: 'CÔNG TY SA...', value: 169 },
  { name: 'Văn phòng...', value: 150 },
  { name: 'Văn phòng...', value: 145 },
  { name: 'Phòng KD', value: 93 },
  { name: 'CTY uniHRM', value: 87 },
  { name: 'Phòng kinh...', value: 87 },
  { name: 'Văn phòng...', value: 70.5 },
];

const leaveTypeData = [
  { name: 'Nghỉ phép', value: 4, color: '#3b82f6' },
  { name: 'Nghỉ thai sản', value: 2, color: '#10b981' },
  { name: 'Nghỉ con kết hôn', value: 1, color: '#f59e0b' },
  { name: 'Nghỉ kết hôn', value: 1, color: '#ef4444' },
];

const lateEarlyList = [
  { name: 'Lăng Hồng Sơn', dept: 'Công ty cổ phần dịch vụ tổng hợp De...', count: 9 },
  { name: 'Hoàng Thành Hà', dept: 'Văn phòng Tổng công ty', count: 7 },
  { name: 'Nguyễn Mạnh Hùng', dept: 'CÔNG TY DEMO', count: 7 },
  { name: 'Nguyễn Thùy Linh Nhi', dept: 'Phòng Marketing', count: 3 },
  { name: 'Đào Thị Nhinh', dept: 'CÔNG TY DEMO', count: 2 },
];

// Duplicate removed - using getRequestMenuItems(t) instead

// Leave request data removed - using real data from LeaveTab component

export default function Attendance() {
  const { t } = useTranslation();
  const { employees, isLoading: isLoadingEmployees } = useEmployees();
  const { departments } = useDepartments();
  // Initialize translation-based menu items
  const sidebarMenuItems = getSidebarMenuItems(t);
  const attendanceRulesTabs = getAttendanceRulesTabs(t);
  const attendanceColumnsData = getAttendanceColumnsData(t);
  const topTabs = getTopTabs(t);
  const attendanceMenuItems = getAttendanceMenuItems(t);
  const shiftsMenuItems = getShiftsMenuItems(t);
  const requestMenuItems = getRequestMenuItems(t);
  
  // Load data from database hooks
  const { sheets: attendanceSheetsDB, isLoading: isLoadingSheets, createSheet, deleteSheet: deleteSheetDB } = useAttendanceSheets();
  const { shifts: workShiftsDB, isLoading: isLoadingShifts, createShift, updateShift, deleteShift: deleteShiftDB } = useWorkShifts();
  const { rules: attendanceRulesDB, isLoading: isLoadingRules, saveRules } = useAttendanceRules();
  const { 
    stats: overviewStats, 
    monthlyLeaveData: monthlyLeaveDataDB, 
    departmentLeaveData: departmentLeaveDataDB,
    leaveTypeData: leaveTypeDataDB,
    lateEarlyList: lateEarlyListDB,
    isLoading: isLoadingOverview 
  } = useAttendanceOverview();

  const [activeTab, setActiveTab] = useState('overview');
  const [activeAttendanceType, setActiveAttendanceType] = useState('sheets');
  const [activeShiftType, setActiveShiftType] = useState('list');
  const [activeSidebarItem, setActiveSidebarItem] = useState('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [activeRulesTab, setActiveRulesTab] = useState('device');
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<{
    id?: string;
    code: string;
    name: string;
    unit: string;
    startTime: string;
    endTime: string;
    coefficient: number;
    hours: number;
    status: string;
  } | null>(null);
  const { toast } = useToast();

  // Transform DB data to display format
  const shiftsData = workShiftsDB.map(s => ({
    id: s.id,
    code: s.code,
    name: s.name,
    unit: s.department || t('attendance.sheetForm.allDepartments'),
    startTime: s.start_time,
    endTime: s.end_time,
    coefficient: s.coefficient || 1,
    hours: s.work_hours || 8,
    status: s.status,
  }));

  // Add default colors for leave types
  const LEAVE_TYPE_COLORS: Record<string, string> = {
    [t('attPage.annualLeave')]: '#3b82f6',
    [t('attPage.maternityLeave')]: '#10b981',
    [t('attPage.unpaidLeave')]: '#f59e0b',
    [t('attPage.sickLeave')]: '#ef4444',
    [t('attPage.weddingLeave')]: '#8b5cf6',
    [t('attPage.bereavementLeave')]: '#ec4899',
    [t('common.other', 'Khác')]: '#a3a3a3',
  };

  // Use DB data for overview or fallback to empty
  const monthlyLeaveData = monthlyLeaveDataDB.length > 0 ? monthlyLeaveDataDB : [];
  const departmentLeaveData = departmentLeaveDataDB.length > 0 ? departmentLeaveDataDB : [];
  const leaveTypeData = leaveTypeDataDB.length > 0 ? leaveTypeDataDB : [];
  const lateEarlyList = lateEarlyListDB.length > 0 ? lateEarlyListDB : [];

  // Edit attendance record state
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<{
    id: string;
    name: string;
    unit: string;
    date: string;
    time: string;
  } | null>(null);

  const openEditAttendanceModal = (record: typeof attendanceRecordsData[0]) => {
    setEditingAttendance({
      id: record.id,
      name: record.name,
      unit: record.unit,
      date: record.date,
      time: record.time,
    });
    setAttendanceModalOpen(true);
  };

  const handleSaveAttendance = () => {
    if (!editingAttendance?.date || !editingAttendance?.time) {
      toast({
        title: t('attendance.toast.error'),
        description: t('attendance.toast.fillTimeInfo'),
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: t('attendance.toast.updateSuccess'),
      description: t('attendance.toast.attendanceUpdated', { name: editingAttendance.name }),
    });
    setAttendanceModalOpen(false);
    setEditingAttendance(null);
  };

  // Attendance view mode: 'list' (sheets list), 'data' (records), or 'weekly' (weekly summary)
  const [attendanceViewMode, setAttendanceViewMode] = useState<'list' | 'data' | 'weekly'>('list');
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);

  // Add sheet modal state
  const [addSheetModalOpen, setAddSheetModalOpen] = useState(false);
  const [newSheetForm, setNewSheetForm] = useState({
    unit: '',
    positions: 'all',
    name: '',
    timePreset: 'this-month',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-GB'),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString('en-GB'),
    attendanceType: 'daily',
    standardType: 'fixed',
  });

  const handleOpenSheet = (sheetId: string) => {
    setSelectedSheetId(sheetId);
    setAttendanceViewMode('weekly');
  };

  const handleAddSheet = async () => {
    // Parse dates from form
    const [startDay, startMonth, startYear] = newSheetForm.startDate.split('/');
    const [endDay, endMonth, endYear] = newSheetForm.endDate.split('/');
    
    const result = await createSheet({
      name: newSheetForm.name || `Bảng chấm công từ ${newSheetForm.startDate} đến ${newSheetForm.endDate}`,
      start_date: `${startYear}-${startMonth}-${startDay}`,
      end_date: `${endYear}-${endMonth}-${endDay}`,
      attendance_type: newSheetForm.attendanceType,
      standard_type: newSheetForm.standardType,
      department: newSheetForm.unit || null,
      positions: newSheetForm.positions === 'all' ? null : newSheetForm.positions,
    });

    if (result) {
      setAddSheetModalOpen(false);
    }
  };

  // Delete sheet modal state
  const [deleteSheetModalOpen, setDeleteSheetModalOpen] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const openDeleteSheetModal = (sheet: { id: string; name: string }) => {
    setSheetToDelete(sheet);
    setDeleteSheetModalOpen(true);
  };

  const handleDeleteSheet = async () => {
    if (sheetToDelete) {
      await deleteSheetDB(sheetToDelete.id);
      setDeleteSheetModalOpen(false);
      setSheetToDelete(null);
    }
  };

  // Request management state
  const [activeRequestType, setActiveRequestType] = useState('leave');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [requestUnitFilter, setRequestUnitFilter] = useState('all');
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [requestCurrentPage, setRequestCurrentPage] = useState(1);

  // Leave request modal state
  const [leaveRequestModalOpen, setLeaveRequestModalOpen] = useState(false);
  const [leaveRequestForm, setLeaveRequestForm] = useState({
    employee: '',
    leaveType: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    reason: '',
  });

  const handleAddLeaveRequest = () => {
    if (!leaveRequestForm.employee || !leaveRequestForm.leaveType || !leaveRequestForm.startDate || !leaveRequestForm.endDate) {
      toast({
        title: t('attendance.toast.error'),
        description: t('attendance.toast.fillRequired'),
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: t('attendance.toast.addSuccess'),
      description: t('attendance.toast.leaveRequestCreated'),
    });
    setLeaveRequestModalOpen(false);
    setLeaveRequestForm({
      employee: '',
      leaveType: '',
      startDate: undefined,
      endDate: undefined,
      reason: '',
    });
  };

  // View/Edit leave request detail state (kept for compatibility but no longer uses mock data)
  const [leaveDetailModalOpen, setLeaveDetailModalOpen] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<{ id: string; name: string; avatar: string; position: string; unit: string; leaveType: string; days: number; approver: string; status: string } | null>(null);
  const [editLeaveForm, setEditLeaveForm] = useState({
    leaveType: '',
    days: 0,
    reason: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });
  const [isEditingLeave, setIsEditingLeave] = useState(false);

  const openLeaveDetailModal = (request: { id: string; name: string; avatar: string; position: string; unit: string; leaveType: string; days: number; approver: string; status: string }) => {
    setSelectedLeaveRequest(request);
    setEditLeaveForm({
      leaveType: request.leaveType,
      days: request.days,
      reason: '',
      startDate: undefined,
      endDate: undefined,
    });
    setIsEditingLeave(false);
    setLeaveDetailModalOpen(true);
  };

  const handleSaveLeaveEdit = () => {
    toast({
      title: t('attendance.toast.updateSuccess'),
      description: t('attendance.toast.leaveUpdated', { name: selectedLeaveRequest?.name }),
    });
    setIsEditingLeave(false);
    setLeaveDetailModalOpen(false);
  };

  // Approve/Reject state
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNote, setApprovalNote] = useState('');

  const openApprovalModal = (action: 'approve' | 'reject') => {
    setApprovalAction(action);
    setApprovalNote('');
    setApprovalModalOpen(true);
  };

  const handleApprovalSubmit = () => {
    if (approvalAction === 'approve') {
      toast({
        title: t('attendance.toast.approved'),
        description: t('attendance.toast.leaveApproved', { name: selectedLeaveRequest?.name }),
      });
    } else {
      toast({
        title: t('attendance.toast.rejected'),
        description: t('attendance.toast.leaveRejected', { name: selectedLeaveRequest?.name }),
        variant: "destructive",
      });
    }
    setApprovalModalOpen(false);
    setLeaveDetailModalOpen(false);
  };

  // Weekly cell detail modal state
  const [cellDetailModalOpen, setCellDetailModalOpen] = useState(false);
  const [selectedCellData, setSelectedCellData] = useState<{
    employeeName: string;
    employeeCode: string;
    dayLabel: string;
    date: string;
    shifts: Array<{
      shift?: string;
      name?: string;
      status?: string;
      time?: string;
      type?: string;
    }>;
  } | null>(null);

  const openCellDetailModal = (
    employee: { name: string; code: string },
    day: { dayLabel: string; date: string; shifts: any[] }
  ) => {
    setSelectedCellData({
      employeeName: employee.name,
      employeeCode: employee.code,
      dayLabel: day.dayLabel,
      date: day.date,
      shifts: day.shifts,
    });
    setCellDetailModalOpen(true);
  };

  const handleSaveCellDetail = () => {
    toast({
      title: t('attendance.toast.updateSuccess'),
      description: t('attendance.toast.cellUpdated', { name: selectedCellData?.employeeName, date: `${selectedCellData?.date}/05/2021` }),
    });
    setCellDetailModalOpen(false);
    setSelectedCellData(null);
  };

  // Default shift form values
  const defaultShiftForm = {
    code: '',
    name: '',
    unit: 'Công ty Cổ phần ABC',
    startTime: '08:00',
    endTime: '17:30',
    coefficient: 1,
    hours: 8,
    status: 'active',
  };

  const openAddShiftModal = () => {
    setEditingShift(defaultShiftForm);
    setShiftModalOpen(true);
  };

  const openEditShiftModal = (shift: typeof editingShift) => {
    setEditingShift(shift);
    setShiftModalOpen(true);
  };

  const handleSaveShift = async () => {
    if (!editingShift?.code || !editingShift?.name) {
      toast({
        title: t('attendance.toast.error'),
        description: t('attendance.toast.fillShiftInfo'),
        variant: "destructive",
      });
      return;
    }
    
    if (editingShift.id) {
      // Update existing shift
      await updateShift(editingShift.id, {
        code: editingShift.code,
        name: editingShift.name,
        department: editingShift.unit,
        start_time: editingShift.startTime,
        end_time: editingShift.endTime,
        coefficient: editingShift.coefficient,
        work_hours: editingShift.hours,
        status: editingShift.status,
      });
    } else {
      // Create new shift
      await createShift({
        code: editingShift.code,
        name: editingShift.name,
        department: editingShift.unit,
        start_time: editingShift.startTime,
        end_time: editingShift.endTime,
        coefficient: editingShift.coefficient,
        work_hours: editingShift.hours,
        status: editingShift.status || 'active',
      });
    }
    
    setShiftModalOpen(false);
    setEditingShift(null);
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const totalRecords = 2481;
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredEmployees.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredEmployees.map(emp => emp.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Time filter state for overview
  const [overviewTimeFilter, setOverviewTimeFilter] = useState('this-month');

  // Overview content
  const renderOverview = () => {
    if (isLoadingOverview) {
      return (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      );
    }

    return (
      <div className="space-y-4 md:space-y-6 p-3 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg md:text-xl font-semibold">{t('attendance.overview.title')}</h2>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Select value={overviewTimeFilter} onValueChange={setOverviewTimeFilter}>
              <SelectTrigger className="w-[150px] md:w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t('attendance.overview.selectTime')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">{t('attendance.overview.today')}</SelectItem>
                <SelectItem value="yesterday">{t('attendance.overview.yesterday')}</SelectItem>
                <SelectItem value="this-week">{t('attendance.overview.thisWeek')}</SelectItem>
                <SelectItem value="last-week">{t('attendance.overview.lastWeek')}</SelectItem>
                <SelectItem value="this-month">{t('attendance.overview.thisMonth')}</SelectItem>
                <SelectItem value="last-month">{t('attendance.overview.lastMonth')}</SelectItem>
                <SelectItem value="this-quarter">{t('attendance.overview.thisQuarter')}</SelectItem>
                <SelectItem value="this-year">{t('attendance.overview.thisYear')}</SelectItem>
                <SelectItem value="last-year">{t('attendance.overview.lastYear')}</SelectItem>
                <SelectItem value="custom">{t('attendance.overview.customRange')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 hidden sm:flex">
              <Settings2 className="w-4 h-4" />
              {t('attendance.overview.customize')}
            </Button>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {/* Late/Early Card */}
          <Card>
            <CardContent className="p-3 md:p-4">
              <h3 className="text-xs md:text-sm font-medium mb-1">{t('attendance.overview.lateEarly')}</h3>
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground mb-1">
                <span>{t('attendance.overview.today')}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <p className="text-2xl md:text-4xl font-bold mb-1">{overviewStats.lateEarlyToday}</p>
              <div className="flex items-center gap-1 text-emerald-500 text-xs mb-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>{overviewStats.lateEarlyChange}</span>
              </div>
              <Button variant="link" className="p-0 h-auto text-orange-500 text-xs">
                {t('attendance.overview.details')}
              </Button>
            </CardContent>
          </Card>

          {/* Actual Leave Card */}
          <Card>
            <CardContent className="p-3 md:p-4">
              <h3 className="text-xs md:text-sm font-medium mb-1">{t('attendance.overview.actualLeave')}</h3>
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground mb-1">
                <span>{t('attendance.overview.thisWeek')}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <p className="text-2xl md:text-4xl font-bold mb-1">{overviewStats.actualLeaveThisWeek}</p>
              <div className="flex items-center gap-1 text-emerald-500 text-xs mb-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>{overviewStats.actualLeaveChange}</span>
              </div>
              <Button variant="link" className="p-0 h-auto text-orange-500 text-xs">
                {t('attendance.overview.details')}
              </Button>
            </CardContent>
          </Card>

          {/* Planned Leave Card */}
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-3 md:p-4">
              <h3 className="text-xs md:text-sm font-medium mb-1">{t('attendance.overview.plannedLeave')}</h3>
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground mb-1">
                <span>{t('attendance.overview.nextWeek')}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <p className="text-2xl md:text-4xl font-bold mb-1">{overviewStats.plannedLeaveNextWeek}</p>
              <div className="flex items-center gap-1 text-emerald-500 text-xs mb-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>{overviewStats.plannedLeaveChange}</span>
              </div>
              <Button variant="link" className="p-0 h-auto text-orange-500 text-xs">
                {t('attendance.overview.details')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Leave by Time Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">{t('attendance.overview.leaveByTime')}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    CÔNG TY SAIGON NEWPORT<br />
                    (01/01/2021 - 31/12/2021)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyLeaveData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" fontSize={10} angle={-30} textAnchor="end" height={60} />
                        <YAxis fontSize={10} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Leave by Department Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">{t('attendance.overview.leaveByDepartment')}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {t('attendance.overview.allUnits')}<br />
                    (01/01/2021 - 31/12/2021)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentLeaveData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={9} angle={-30} textAnchor="end" height={70} interval={0} />
                        <YAxis fontSize={10} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Leave Type Analysis */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">{t('attendance.overview.leaveTypeAnalysis')}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {t('attendance.overview.allUnits')}<br />
                    (01/01/2021 - 31/12/2021)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leaveTypeData}
                          cx="35%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {leaveTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center text */}
                    <div className="absolute top-1/2 left-[35%] transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-xs text-muted-foreground">{t('attendance.overview.leaveRequests')}</p>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="space-y-2 mt-2">
                    {leaveTypeData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-3 h-3 rounded-sm" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Late/Early List */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">{t('attendance.overview.lateEarlyList')}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    CÔNG TY SAIGON NEWPORT<br />
                    (01/01/2021 - 31/12/2021)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lateEarlyList.map((person, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-medium">
                            {person.name.split(' ').slice(0, 2).map(n => n.charAt(0)).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{person.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{person.dept}</p>
                        </div>
                        <span className="text-sm font-semibold">{person.count} {t('attendance.overview.times')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Late/Early Frequency */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">{t('attendance.overview.lateEarlyFrequency')}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {t('attendance.overview.allUnits')}<br />
                    (30/11/2021 - )
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                    <div className="w-20 h-20 mb-4 opacity-30">
                      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="20" width="60" height="50" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M10 35 L70 35" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="25" cy="27" r="3" fill="currentColor" opacity="0.5"/>
                        <circle cx="40" cy="27" r="3" fill="currentColor" opacity="0.5"/>
                        <circle cx="55" cy="27" r="3" fill="currentColor" opacity="0.5"/>
                        <rect x="20" y="45" width="15" height="15" rx="2" fill="currentColor" opacity="0.2"/>
                        <rect x="45" y="45" width="15" height="15" rx="2" fill="currentColor" opacity="0.2"/>
                      </svg>
                    </div>
                    <p className="text-sm">{t('attendance.overview.noData')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    );
  };

  // Settings tab content with sidebar
  const renderSettingsContent = () => {
    if (activeSidebarItem === 'employees') {
      return (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
           <h2 className="text-xl font-semibold">{t('attPage.employees')}</h2>
            <div className="flex items-center gap-2">
              <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                <RefreshCw className="w-4 h-4" />
                {t('attPage.refreshData')}
              </Button>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                {t('attPage.import')}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('attPage.search')}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t('attPage.working')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('attPage.all')}</SelectItem>
                    <SelectItem value="active">{t('attPage.working')}</SelectItem>
                    <SelectItem value="inactive">{t('attPage.resigned')}</SelectItem>
                    <SelectItem value="probation">{t('attPage.probation')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('attPage.allUnits')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('attPage.allUnits')}</SelectItem>
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
          </Card>

          {/* Data Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-3 text-left w-10">
                      <Checkbox 
                        checked={selectedRows.length === filteredEmployees.length && filteredEmployees.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="p-3 text-left font-medium text-sm">{t('attPage.employeeCode')}</th>
                    <th className="p-3 text-left font-medium text-sm">{t('attPage.fullName')}</th>
                    <th className="p-3 text-left font-medium text-sm">{t('attPage.department')}</th>
                    <th className="p-3 text-right font-medium text-sm">{t('attPage.leaveDays')}</th>
                    <th className="p-3 text-left font-medium text-sm">{t('attPage.attendanceCode')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp, index) => (
                    <tr 
                      key={emp.id} 
                      className={cn(
                        "border-b hover:bg-muted/20 transition-colors cursor-pointer",
                        selectedRows.includes(emp.id) && "bg-primary/5"
                      )}
                    >
                      <td className="p-3">
                        <Checkbox 
                          checked={selectedRows.includes(emp.id)}
                          onCheckedChange={() => toggleSelectRow(emp.id)}
                        />
                      </td>
                      <td className="p-3 text-sm">{emp.employee_code}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {emp.full_name.split(' ').pop()?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-blue-600 hover:underline">
                            {emp.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{emp.department || '-'}</td>
                      <td className="p-3 text-sm text-right">12</td>
                      <td className="p-3 text-sm">{generateAttendanceCode(index)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                {t('attPage.totalRecords')}: <span className="font-medium text-foreground">{totalRecords.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-4">
                <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  {t('attPage.fromTo', { from: startRecord, to: endRecord })}
                </span>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Attendance rules content

    // Attendance rules content
    if (activeSidebarItem === 'rules') {
      // Tool versions data
      const toolVersions = [
        { version: 'Tool v1.0', description: t('attPage.toolV1Desc', 'Hỗ trợ .NET Framework 4.5.2'), isNew: true },
        { version: 'Tool v2.0', description: t('attPage.toolV2Desc', 'Hỗ trợ .NET Framework 4.8'), isNew: false },
      ];

      // FAQ items
      const faqItems = [
        t('attPage.faq1', 'Các loại máy chấm công có hỗ trợ kết nối với phần mềm'),
        t('attPage.faq2', 'Một số lỗi thường gặp khi kết nối máy chấm công và cách xử lý'),
        t('attPage.faq3', 'Cách khắc phục khi đồng bộ thiếu dữ liệu chấm công từ máy chấm công về công cụ'),
      ];

      // Login code
      const loginCode = 'npYvBqxfeCqNVQE9XRmp/7F261XVMQ68rv9jk0UccV9B/KJmum4Px9TswjaqxDSMqXlinsA6EghUqyyuKI1...';

      const handleCopyCode = () => {
        navigator.clipboard.writeText('npYvBqxfeCqNVQE9XRmp/7F261XVMQ68rv9jk0UccV9B/KJmum4Px9TswjaqxDSMqXlinsA6EghUqyyuKI1');
      };

      // Render device tab content
      const renderDeviceTabContent = () => (
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-medium">1</span>
                <span className="font-medium">{t('attPage.installTool')}</span>
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="p-3 text-left font-medium text-sm">{t('attPage.version')}</th>
                        <th className="p-3 text-left font-medium text-sm">{t('attPage.desc')}</th>
                        <th className="p-3 text-center font-medium text-sm">{t('attPage.download')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {toolVersions.map((tool, index) => (
                        <tr key={index} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{tool.version}</span>
                              {tool.isNew && (
                                <Sparkles className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">{tool.description}</td>
                          <td className="p-3 text-center">
                            <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600">
                              <Download className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-medium">2</span>
                <span className="font-medium">{t('attPage.loginTool')}</span>
              </div>
              <Card className="border-2 border-orange-200 bg-orange-50/30">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {t('attPage.loginHint')}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-background border rounded-md text-sm text-muted-foreground truncate">
                      {loginCode}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleCopyCode}
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-medium">3</span>
                <span className="font-medium">{t('attPage.connectSync')}</span>
                <button className="text-orange-500 text-sm hover:underline">
                  {t('attPage.viewGuide')}
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Sidebar */}
          <div className="w-72 shrink-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">{t('attPage.faq')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {faqItems.map((item, index) => (
                  <button 
                    key={index}
                    className="flex items-start gap-2 text-left text-sm text-orange-500 hover:underline"
                  >
                    <span className="shrink-0">○</span>
                    <span>{item}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
            {/* Illustration */}
            <div className="mt-6 flex justify-center">
              <div className="text-muted-foreground opacity-40 text-6xl">❓</div>
            </div>
          </div>
        </div>
      );

      // Render general tab content
      const renderGeneralTabContent = () => (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Time settings */}
              <div className="space-y-4">
                <h3 className="font-medium">{t('attPage.timeSettings')}</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">{t('attPage.startDay')}</label>
                    <Select defaultValue="1">
                      <SelectTrigger>
                        <SelectValue placeholder={t('attPage.selectDay')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{t('attPage.dayN', { n: i + 1 })}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">{t('attPage.endDay')}</label>
                    <Select defaultValue="31">
                      <SelectTrigger>
                        <SelectValue placeholder={t('attPage.selectDay')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{t('attPage.dayN', { n: i + 1 })}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Work day settings */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">{t('attPage.workDaySettings')}</h3>
                <div className="flex items-center gap-2">
                  {[
                    t('common.weekDays.mon', 'T2'), t('common.weekDays.tue', 'T3'), t('common.weekDays.wed', 'T4'), 
                    t('common.weekDays.thu', 'T5'), t('common.weekDays.fri', 'T6'), t('common.weekDays.sat', 'T7'), 
                    t('common.weekDays.sun', 'CN')
                  ].map((day, index) => (
                    <button
                      key={day}
                      className={cn(
                        "w-10 h-10 rounded-full text-sm font-medium transition-colors",
                        index < 5 
                          ? "bg-orange-500 text-white" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attendance rounding */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">{t('attPage.roundingTitle')}</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">{t('attPage.roundIn')}</label>
                    <Select defaultValue="none">
                      <SelectTrigger>
                        <SelectValue placeholder={t('attPage.selectRounding')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('attPage.noRounding')}</SelectItem>
                        <SelectItem value="5">{t('attPage.round5')}</SelectItem>
                        <SelectItem value="10">{t('attPage.round10')}</SelectItem>
                        <SelectItem value="15">{t('attPage.round15')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">{t('attPage.roundOut')}</label>
                    <Select defaultValue="none">
                      <SelectTrigger>
                        <SelectValue placeholder={t('attPage.selectRounding')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('attPage.noRounding')}</SelectItem>
                        <SelectItem value="5">{t('attPage.round5')}</SelectItem>
                        <SelectItem value="10">{t('attPage.round10')}</SelectItem>
                        <SelectItem value="15">{t('attPage.round15')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">{t('attPage.otherOptions')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox id="allow-multiple" defaultChecked />
                    <label htmlFor="allow-multiple" className="text-sm">{t('attPage.allowMultiple')}</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="auto-checkout" />
                    <label htmlFor="auto-checkout" className="text-sm">{t('attPage.autoCheckout')}</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="notify-late" defaultChecked />
                    <label htmlFor="notify-late" className="text-sm">{t('attPage.notifyLate')}</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              {t('attPage.saveChanges')}
            </Button>
          </div>
        </div>
      );

      // Render standard workdays tab content
      const renderStandardTabContent = () => (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Standard type */}
              <div className="space-y-4">
                <h3 className="font-medium">{t('attPage.standardType')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="standard-type" id="fixed" defaultChecked className="w-4 h-4 accent-orange-500" />
                    <label htmlFor="fixed" className="text-sm">{t('attPage.fixedStandard')}</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="standard-type" id="monthly" className="w-4 h-4 accent-orange-500" />
                    <label htmlFor="monthly" className="text-sm">{t('attPage.monthlyStandard')}</label>
                  </div>
                </div>
              </div>

              {/* Fixed standard */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">{t('attPage.fixedCount')}</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">{t('attPage.daysPerMonth')}</label>
                    <Input type="number" defaultValue="26" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">{t('attPage.hoursPerDay')}</label>
                    <Input type="number" defaultValue="8" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">{t('attPage.totalHoursMonth')}</label>
                    <Input type="number" defaultValue="208" disabled className="bg-muted" />
                  </div>
                </div>
              </div>

              {/* Workday calculation */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">{t('attPage.workdayConversion')}</h3>
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('attPage.fullDay')}</span>
                        <span className="text-sm font-medium">{t('attPage.oneDay')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('attPage.halfDay')}</span>
                        <span className="text-sm font-medium">{t('attPage.halfDayValue')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('attPage.noCount')}</span>
                        <span className="text-sm font-medium">{t('attPage.zeroDayValue')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              {t('attPage.saveChanges')}
            </Button>
          </div>
        </div>
      );

      // Render app attendance tab content
      const renderAppTabContent = () => {
        const appMethods = [
          { id: 'gps', icon: MapPin, title: 'GPS', description: t('attPage.gpsDesc'), enabled: true },
          { id: 'wifi', icon: Wifi, title: 'Wifi', description: t('attPage.wifiDesc'), enabled: true },
          { id: 'qr', icon: QrCode, title: 'QR Code', description: t('attPage.qrDesc'), enabled: false },
        ];

        return (
          <div className="space-y-6">
            {/* App download */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{t('attPage.appTitle')}</h3>
                    <p className="text-xs text-muted-foreground mb-1">UBOS EcoSystem</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('attPage.appDownloadDesc', 'Tải ứng dụng để nhân viên có thể chấm công trên điện thoại di động')}
                    </p>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        App Store
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Google Play
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('attPage.attendanceMethods')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        method.enabled ? "bg-orange-100" : "bg-muted"
                      )}>
                        <method.icon className={cn(
                          "w-5 h-5",
                          method.enabled ? "text-orange-500" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <h4 className="font-medium">{method.title}</h4>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {method.enabled && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">{t('attPage.enabled')}</span>
                      )}
                      <Button variant="outline" size="sm">
                        {method.enabled ? t('attPage.configure') : t('attPage.enable')}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* GPS locations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t('attPage.gpsLocations')}</CardTitle>
                <Button size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4" />
                  {t('attPage.addLocation')}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Trụ sở chính', address: '15 Duy Tân, Cầu Giấy, Hà Nội', radius: '100m' },
                    { name: 'Chi nhánh HCM', address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM', radius: '150m' },
                  ].map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium">{location.name}</p>
                          <p className="text-xs text-muted-foreground">{location.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{t('attPage.radius')}: {location.radius}</span>
                        <Button variant="ghost" size="sm">{t('attPage.edit')}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      };

      // Render customize tab content
      const renderCustomizeTabContent = () => (
        <>
          {/* Description and actions */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground italic">
              {t('attPage.customizeDesc')}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                {t('attPage.resetDefault')}
              </Button>
              <Button variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                {t('attPage.preview')}
              </Button>
            </div>
          </div>

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-3 text-left font-medium text-sm w-1/3">{t('attPage.columnName')}</th>
                    <th className="p-3 text-left font-medium text-sm">{t('attPage.desc')}</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceColumnsData.map((column) => (
                    <tr key={column.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                          <span className="text-sm font-medium">{column.name}</span>
                          {column.hasAdvanced && (
                            <button className="text-orange-500 text-sm hover:underline flex items-center gap-1">
                              {t('attPage.advancedSetup')}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {column.description}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add column button */}
            <div className="p-4 border-t">
              <Button variant="ghost" className="gap-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50">
                <Plus className="w-4 h-4" />
                {t('attPage.addColumn')}
              </Button>
            </div>
          </Card>
        </>
      );

      return (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('attPage.rulesTitle')}</h2>
            <Button variant="outline" className="gap-2 border-orange-500 text-orange-500 hover:bg-orange-50">
              <Sparkles className="w-4 h-4" />
              {t('attPage.suggestMethod')}
            </Button>
          </div>

          {/* Sub-tabs */}
          <div className="border-b overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {attendanceRulesTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRulesTab(tab.id)}
                  className={cn(
                    "px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap",
                    activeRulesTab === tab.id
                      ? "text-orange-600"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                  {activeRulesTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          {activeRulesTab === 'general' && renderGeneralTabContent()}
          {activeRulesTab === 'standard' && renderStandardTabContent()}
          {activeRulesTab === 'customize' && renderCustomizeTabContent()}
          {activeRulesTab === 'device' && renderDeviceTabContent()}
          {activeRulesTab === 'app' && renderAppTabContent()}
          {!['general', 'standard', 'customize', 'device', 'app'].includes(activeRulesTab) && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">{attendanceRulesTabs.find(tab => tab.id === activeRulesTab)?.label}</p>
                <p className="text-sm">{t('attPage.featureInDev')}</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Other sidebar items - placeholder content
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">{sidebarMenuItems.find(item => item.id === activeSidebarItem)?.label}</p>
          <p className="text-sm">{t('attPage.featureInDev')}</p>
        </div>
      </div>
    );
  };

  // Attendance records data
  const attendanceRecordsData = [
    { id: '1', attendanceCode: '13', employeeCode: 'NVTHANG', name: 'Nguyễn Văn Thắng', position: 'Công nhân nhà máy', unit: 'Nhà máy sản xuất', date: '31/05/2021', time: '22:12' },
    { id: '2', attendanceCode: '10', employeeCode: 'TDMANH', name: 'Trần Đức Mạnh', position: 'Nhân viên kinh doanh', unit: 'Văn phòng kinh doanh', date: '31/05/2021', time: '17:50' },
    { id: '3', attendanceCode: '4', employeeCode: 'NTLINH', name: 'Nguyễn Thùy Linh', position: 'Lễ tân', unit: 'Văn phòng tổng công ty', date: '31/05/2021', time: '17:00' },
    { id: '4', attendanceCode: '13', employeeCode: 'NVTHANG', name: 'Nguyễn Văn Thắng', position: 'Công nhân nhà máy', unit: 'Nhà máy sản xuất', date: '31/05/2021', time: '14:01' },
    { id: '5', attendanceCode: '10', employeeCode: 'TDMANH', name: 'Trần Đức Mạnh', position: 'Nhân viên kinh doanh', unit: 'Văn phòng kinh doanh', date: '30/05/2021', time: '17:04' },
    { id: '6', attendanceCode: '9', employeeCode: 'LTHANH', name: 'Lê Thúy Hạnh', position: 'Nhân viên kinh doanh', unit: 'Văn phòng kinh doanh', date: '30/05/2021', time: '17:04' },
    { id: '7', attendanceCode: '4', employeeCode: 'NTLINH', name: 'Nguyễn Thùy Linh', position: 'Lễ tân', unit: 'Văn phòng tổng công ty', date: '30/05/2021', time: '17:04' },
    { id: '8', attendanceCode: '13', employeeCode: 'NVTHANG', name: 'Nguyễn Văn Thắng', position: 'Công nhân nhà máy', unit: 'Nhà máy sản xuất', date: '30/05/2021', time: '14:23' },
    { id: '9', attendanceCode: '10', employeeCode: 'TDMANH', name: 'Trần Đức Mạnh', position: 'Nhân viên kinh doanh', unit: 'Văn phòng kinh doanh', date: '30/05/2021', time: '07:48' },
  ];

  // Get avatar initials
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0);
    }
    return parts[0].charAt(0);
  };

  // Get avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
      'bg-purple-100 text-purple-700',
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get status color for shift cell
  const getShiftStatusColor = (status: string) => {
    switch (status) {
      case 'full': return 'bg-green-500';
      case 'half': return 'bg-yellow-500';
      case 'late': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  // Render attendance sheets list
  const renderAttendanceSheetsList = () => {
    // Transform DB data to display format
    const sheetsDisplayData = attendanceSheetsDB.map(sheet => ({
      id: sheet.id,
      period: `${new Date(sheet.start_date).toLocaleDateString('vi-VN')} - ${new Date(sheet.end_date).toLocaleDateString('vi-VN')}`,
      name: sheet.name,
      type: sheet.attendance_type === 'hourly' ? t('attPage.byHour') : t('attPage.byDay'),
      unit: sheet.department || t('attPage.allUnits'),
      positions: sheet.positions || t('attPage.allPositions'),
    }));

    return (
      <div className="space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('attPage.sheetTitle')}</h2>
          <Button onClick={() => setAddSheetModalOpen(true)} className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4" />
            {t('attPage.add')}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t('attPage.search')} className="pl-10" />
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t('attPage.allUnits')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('attPage.allUnits')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          {isLoadingSheets ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-3 text-left w-10">
                      <Checkbox />
                    </th>
                     <th className="p-3 text-left font-medium text-sm">{t('attPage.time')}</th>
                    <th className="p-3 text-left font-medium text-sm">{t('attPage.sheetName')}</th>
                    <th className="p-3 text-left font-medium text-sm">{t('attPage.attendanceType')}</th>
                    <th className="p-3 text-left font-medium text-sm">{t('attPage.unit')}</th>
                    <th className="p-3 text-left font-medium text-sm">{t('attPage.position')}</th>
                    <th className="p-3 text-center font-medium text-sm w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {sheetsDisplayData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        {t('attPage.noSheets')}
                      </td>
                    </tr>
                  ) : sheetsDisplayData.map((sheet) => (
                    <tr 
                      key={sheet.id} 
                      className="border-b hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => handleOpenSheet(sheet.id)}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox />
                      </td>
                      <td className="p-3 text-sm text-blue-600 hover:underline">{sheet.period}</td>
                      <td className="p-3 text-sm text-blue-600 hover:underline max-w-[300px] truncate">{sheet.name}</td>
                      <td className="p-3 text-sm text-muted-foreground">{sheet.type}</td>
                      <td className="p-3 text-sm text-muted-foreground">{sheet.unit}</td>
                      <td className="p-3 text-sm text-muted-foreground max-w-[200px] truncate">{sheet.positions}</td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 text-muted-foreground hover:text-destructive"
                          onClick={() => openDeleteSheetModal({ id: sheet.id, name: sheet.name })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              {t('attPage.totalRecords')}: <span className="font-medium text-foreground">{sheetsDisplayData.length}</span>
            </div>
            <div className="flex items-center gap-4">
              <Select defaultValue="10">
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">{t('attPage.fromTo', { from: 1, to: 10 })}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Render weekly attendance summary
  const renderWeeklyAttendance = () => {
    const weekDays = [t('common.weekDays.sat', 'Thứ 7'), t('common.weekDays.sun', 'Chủ nhật'), t('common.weekDays.mon', 'Thứ 2'), t('common.weekDays.tue', 'Thứ 3'), t('common.weekDays.wed', 'Thứ 4')];
    const dates = ['01', '02', '03', '04', '05'];

    return (
      <div className="space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setAttendanceViewMode('list')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {t('attPage.weeklyTitle', { start: '01/05/2021', end: '31/05/2021' })}
              <span className="text-muted-foreground ml-2">({t('attPage.standardLabel')})</span>
            </h2>
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <Pencil className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="flex items-center gap-4 px-4 py-2 border rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm">{t('attPage.fullAttendance')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span className="text-sm">{t('attPage.halfAttendance')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-sm">{t('attPage.absent')}</span>
              </div>
            </div>
            <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
              <RotateCcw className="w-4 h-4" />
              {t('attPage.reload')}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t('attPage.search')} className="pl-10" />
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t('attPage.allUnits')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('attPage.allUnits')}</SelectItem>
                <SelectItem value="factory">{t('attPage.factory', 'Nhà máy sản xuất')}</SelectItem>
                <SelectItem value="office">{t('attPage.salesOffice', 'Văn phòng kinh doanh')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Weekly Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="p-3 text-left w-10">
                    <Checkbox />
                  </th>
                  <th className="p-3 text-left font-medium text-sm min-w-[180px]">{t('attPage.employee')}</th>
                  {weekDays.map((day, idx) => (
                    <th key={idx} className="p-3 text-center font-medium text-sm min-w-[140px]">
                      <div className="text-muted-foreground text-xs">{day}</div>
                      <div className="text-xl font-bold">{dates[idx]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklyAttendanceData.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-muted/10">
                    <td className="p-3">
                      <Checkbox />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className={cn("text-xs font-medium", getAvatarColor(employee.name))}>
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">{employee.code}</div>
                        </div>
                      </div>
                    </td>
                    {employee.days.map((day, dayIdx) => (
                      <td 
                        key={dayIdx} 
                        className="p-2 align-top cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => openCellDetailModal(employee, day)}
                      >
                        <div className="space-y-1">
                          {day.shifts.map((shift, shiftIdx) => (
                            <div key={shiftIdx} className="text-xs">
                              {'type' in shift ? (
                                <div className={cn(
                                  "px-2 py-1 rounded border",
                                  shift.type === 'holiday' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                  shift.type === 'leave' ? 'bg-red-50 border-red-200 text-red-700' :
                                  'bg-muted'
                                )}>
                                  {shift.name}
                                </div>
                              ) : (
                                <div className="flex items-start gap-1.5">
                                  <span className={cn("w-2 h-2 rounded-full mt-1 shrink-0", getShiftStatusColor(shift.status))}></span>
                                  <div>
                                    <div className="font-medium">{shift.shift}</div>
                                    {shift.time && (
                                      <div className={cn(
                                        "text-[10px]",
                                        shift.status === 'late' ? 'text-red-600' : 'text-muted-foreground'
                                      )}>
                                        {shift.time}
                                      </div>
                                    )}
                                    {!shift.time && <div className="text-[10px] text-muted-foreground">--:--</div>}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          {day.shifts.length === 0 && (
                            <div className="text-xs text-muted-foreground text-center py-2">-</div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              {t('attPage.total')}: <span className="font-medium text-foreground">12</span>
            </div>
            <div className="flex items-center gap-4">
              <Select defaultValue="15">
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">{t('attPage.fromTo', { from: 1, to: 12 })}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Render attendance content (Chấm công tab)
  const renderAttendanceContent = () => {
    // Show Check-in/Check-out widget
    if (activeAttendanceType === 'checkinout') {
      return (
        <div className="space-y-6 p-6">
          <h2 className="text-xl font-semibold">{t('attPage.checkinTitle')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CheckInOutWidget />
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('attPage.checkinGuide')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {t('attPage.checkinGuide1')}</li>
                <li>• {t('attPage.checkinGuide2')}</li>
                <li>• {t('attPage.checkinGuide3')}</li>
                <li>• {t('attPage.checkinGuide4')}</li>
                <li>• {t('attPage.checkinGuide5')}</li>
              </ul>
            </Card>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">{t('attPage.todayData')}</h3>
            <AttendanceRecordsTable />
          </div>
        </div>
      );
    }

    // Show QR Code Scanner
    if (activeAttendanceType === 'qrcode') {
      return (
        <div className="space-y-6 p-6">
          <h2 className="text-xl font-semibold">{t('attPage.qrTitle')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QRCodeScanner />
            <EmployeeQRCard />
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">{t('attPage.todayData')}</h3>
            <AttendanceRecordsTable />
          </div>
        </div>
      );
    }

    // Show Face ID Scanner
    if (activeAttendanceType === 'faceid') {
      return (
        <div className="space-y-6 p-6">
          <h2 className="text-xl font-semibold">{t('attPage.faceTitle')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FaceIDScanner />
            <FaceRegistration />
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">{t('attPage.todayData')}</h3>
            <AttendanceRecordsTable />
          </div>
        </div>
      );
    }

    // Show GPS Attendance
    if (activeAttendanceType === 'gps') {
      return (
        <div className="space-y-6 p-6">
          <h2 className="text-xl font-semibold">{t('attPage.gpsTitle')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GPSAttendance />
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('attPage.gpsGuide')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {t('attPage.gpsGuide1')}</li>
                <li>• {t('attPage.gpsGuide2')}</li>
                <li>• {t('attPage.gpsGuide3')}</li>
                <li>• {t('attPage.gpsGuide4')}</li>
                <li>• {t('attPage.gpsGuide5')}</li>
                <li>• {t('attPage.gpsGuide6')}</li>
              </ul>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">{t('attPage.accuracyNote')}</h4>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• &lt;10m: {t('attPage.accuracyVeryHigh', 'Rất chính xác (GPS mạnh)')}</li>
                  <li>• 10-50m: {t('attPage.accuracyHigh', 'Chính xác (GPS tốt)')}</li>
                  <li>• 50-100m: {t('attPage.accuracyMedium', 'Trung bình (có thể dùng)')}</li>
                  <li>• &gt;100m: {t('attPage.accuracyLow', 'Kém (nên thử lại)')}</li>
                </ul>
              </div>
            </Card>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">{t('attPage.todayData')}</h3>
            <AttendanceRecordsTable />
          </div>
        </div>
      );
    }

    // Show real records from database
    if (activeAttendanceType === 'records') {
      return (
        <div className="space-y-4 p-6">
           <h2 className="text-xl font-semibold">{t('attPage.recordsTitle')}</h2>
          <AttendanceRecordsTable />
        </div>
      );
    }

    // Show sheets list
    if (attendanceViewMode === 'list') {
      return renderAttendanceSheetsList();
    }
    
    // Show weekly view if selected
    if (attendanceViewMode === 'weekly') {
      return renderWeeklyAttendance();
    }

    return (
      <div className="space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('attPage.recordsTitle')}</h2>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setAttendanceViewMode('weekly')}
          >
            <Calendar className="w-4 h-4" />
            {t('attPage.viewWeekly')}
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('attPage.search')}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {/* Date navigation */}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              {/* Date range picker */}
              <Button variant="outline" className="gap-2 font-normal">
                <span>01/05/2021 - 31/05/2021</span>
                <Calendar className="w-4 h-4" />
              </Button>
              {/* Unit filter */}
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={t('attPage.allUnits')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('attPage.allUnits')}</SelectItem>
                  <SelectItem value="factory">{t('attPage.factory', 'Nhà máy sản xuất')}</SelectItem>
                  <SelectItem value="office">{t('attPage.salesOffice', 'Văn phòng kinh doanh')}</SelectItem>
                  <SelectItem value="hq">{t('attPage.hqOffice', 'Văn phòng tổng công ty')}</SelectItem>
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
        </Card>

        {/* Data Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="p-3 text-left w-10">
                    <Checkbox />
                  </th>
                   <th className="p-3 text-left font-medium text-sm">{t('attPage.attendanceCodeCol')}</th>
                  <th className="p-3 text-left font-medium text-sm">{t('attPage.employeeCodeCol')}</th>
                  <th className="p-3 text-left font-medium text-sm">{t('attPage.fullNameCol')}</th>
                  <th className="p-3 text-left font-medium text-sm">{t('attPage.positionCol')}</th>
                  <th className="p-3 text-left font-medium text-sm">{t('attPage.unitCol')}</th>
                  <th className="p-3 text-left font-medium text-sm">{t('attPage.dateCol')}</th>
                  <th className="p-3 text-right font-medium text-sm">{t('attPage.timeCol')}</th>
                  <th className="p-3 text-center font-medium text-sm w-20">{t('attPage.actionCol')}</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecordsData.map((record) => (
                  <tr 
                    key={record.id} 
                    className="border-b hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-3">
                      <Checkbox />
                    </td>
                    <td className="p-3 text-sm">{record.attendanceCode}</td>
                    <td className="p-3 text-sm font-medium">{record.employeeCode}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={cn("text-xs font-medium", getAvatarColor(record.name))}>
                            {getInitials(record.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{record.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{record.position}</td>
                    <td className="p-3 text-sm text-muted-foreground">{record.unit}</td>
                    <td className="p-3 text-sm">{record.date}</td>
                    <td className="p-3 text-sm text-right">{record.time}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditAttendanceModal(record)}
                          title={t('attPage.edit')}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 text-muted-foreground hover:text-destructive"
                          title={t('attPage.delete')}
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

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              {t('attPage.totalRecords')}: <span className="font-medium text-foreground">128</span>
            </div>
            <div className="flex items-center gap-4">
              <Select defaultValue="50">
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">{t('attPage.fromTo', { from: 1, to: 50 })}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Render shifts content
  const renderShiftsContent = () => {
    return (
      <div className="space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('attPage.shiftsTitle')}</h2>
          <div className="flex items-center gap-2">
            <Button onClick={openAddShiftModal} className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4" />
              {t('attPage.add')}
            </Button>
            <Button variant="outline" size="icon" className="border-orange-500 text-orange-500">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('attPage.search')}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{t('attPage.statusLabel')}:</span>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[100px] border-0 bg-transparent font-medium text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('attPage.all')}</SelectItem>
                    <SelectItem value="active">{t('attPage.inUse')}</SelectItem>
                    <SelectItem value="inactive">{t('attPage.stopped')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select defaultValue="hanoi">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('attPage.selectOffice')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hanoi">{t('attPage.officeHanoi', 'Văn phòng Hà Nội')}</SelectItem>
                  <SelectItem value="hcm">{t('attPage.officeHCM', 'Văn phòng TP.HCM')}</SelectItem>
                  <SelectItem value="all">{t('attPage.allOffices')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Data Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="p-3 text-left w-10">
                    <Checkbox />
                  </th>
                   <th className="p-3 text-left font-medium text-sm">{t('attPage.shiftCode')}</th>
                  <th className="p-3 text-left font-medium text-sm">{t('attPage.shiftName')}</th>
                  <th className="p-3 text-left font-medium text-sm">{t('attPage.appliedUnit')}</th>
                  <th className="p-3 text-center font-medium text-sm">{t('attPage.startTime')}</th>
                  <th className="p-3 text-center font-medium text-sm">{t('attPage.endTime')}</th>
                  <th className="p-3 text-center font-medium text-sm">{t('attPage.coefficient')}</th>
                  <th className="p-3 text-center font-medium text-sm">{t('attPage.workHours')}</th>
                  <th className="p-3 text-left font-medium text-sm">{t('attPage.statusLabel')}</th>
                </tr>
              </thead>
              <tbody>
                {shiftsData.map((shift, index) => (
                  <tr 
                    key={shift.id} 
                    className={cn(
                      "border-b hover:bg-muted/20 transition-colors group",
                      index === 2 && "bg-orange-50"
                    )}
                  >
                    <td className="p-3">
                      <Checkbox />
                    </td>
                    <td className="p-3 text-sm font-medium">{shift.code}</td>
                    <td className="p-3 text-sm">{shift.name}</td>
                    <td className="p-3 text-sm text-muted-foreground">{shift.unit}</td>
                    <td className="p-3 text-sm text-center">{shift.startTime}</td>
                    <td className="p-3 text-sm text-center">{shift.endTime}</td>
                    <td className="p-3 text-sm text-center">{shift.coefficient}</td>
                    <td className="p-3 text-sm text-center">{shift.hours}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "flex items-center gap-1.5 text-sm",
                          shift.status === 'active' ? "text-green-600" : "text-muted-foreground"
                        )}>
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            shift.status === 'active' ? "bg-green-500" : "bg-gray-400"
                          )} />
                          {shift.status === 'active' ? t('attPage.inUse') : t('attPage.stopped')}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditShiftModal(shift)}>
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              {t('attPage.total')}: <span className="font-medium text-foreground">120 {t('attPage.records', 'bản ghi')}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{t('attPage.recordsPerPage')}</span>
                <Select defaultValue="50">
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-muted-foreground">{t('attPage.fromTo', { from: 1, to: 50 })}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // renderRequestsContent removed - all leave request types now use LeaveTab with real data

  // Render main content based on active tab
  const renderMainContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'attendance':
        return renderAttendanceContent();
      case 'shifts':
        return renderShiftsContent();
      case 'requests':
        if (activeRequestType === 'overtime') return <OvertimeRequestTab />;
        if (activeRequestType === 'business-trip') return <BusinessTripRequestTab />;
        if (activeRequestType === 'late-early') return <LateEarlyRequestTab />;
        if (activeRequestType === 'update-attendance') return <AttendanceUpdateRequestTab />;
        if (activeRequestType === 'change-shift') return <ShiftChangeRequestTab />;
        // leave-request, leave-summary, compensatory-summary, leave-plan all use LeaveTab with real data
        return (
          <div className="p-6">
            <LeaveTab />
          </div>
        );
      case 'leave':
        return (
          <div className="p-6">
            <LeaveTab />
          </div>
        );
      case 'settings':
        return (
          <div className="flex min-h-[calc(100vh-180px)]">
            {/* Left Sidebar */}
            <div className="w-52 border-r bg-muted/20 p-2">
              <nav className="space-y-1">
                {sidebarMenuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSidebarItem(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                      activeSidebarItem === item.id
                        ? "bg-orange-500 text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-auto">
              {renderSettingsContent()}
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            <AttendanceReportsTab />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground p-6">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{topTabs.find(tab => tab.id === activeTab)?.label}</p>
              <p className="text-sm">{t('attPage.featureInDev')}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-0 animate-fade-in -mt-3 -mx-3 md:-mt-6 md:-mx-6">
      {/* Top Navigation Tabs - Pill Style */}
      <div className="bg-background border-b px-2 md:px-6 py-2 md:py-3">
        <div className="mobile-scroll-tabs">
          {topTabs.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            
            const getActiveBgColor = (color: string) => {
              const colorMap: Record<string, string> = {
                'bg-blue-500': 'bg-blue-500',
                'bg-orange-500': 'bg-orange-500',
                'bg-green-500': 'bg-green-500',
                'bg-purple-500': 'bg-purple-500',
                'bg-rose-500': 'bg-rose-500',
                'bg-cyan-500': 'bg-cyan-500',
                'bg-gray-500': 'bg-gray-500',
              };
              return colorMap[color] || 'bg-primary';
            };

            const tabButtonClass = cn(
              "px-2.5 md:px-3 py-2 text-xs md:text-sm font-medium transition-all rounded-lg flex items-center gap-1 md:gap-2 whitespace-nowrap group touch-target",
              isActive 
                ? `${getActiveBgColor(tab.color)} text-white shadow-md` 
                : "text-muted-foreground hover:bg-muted"
            );

            const iconBlock = (
              <div className={cn(
                'w-5 h-5 md:w-5 md:h-5 rounded flex items-center justify-center flex-shrink-0',
                isActive ? 'bg-white/20' : tab.color
              )}>
                <TabIcon className="w-3 h-3 text-white" />
              </div>
            );
            
            // Attendance dropdown
            if (tab.id === 'attendance') {
              return (
                <DropdownMenu key={tab.id}>
                  <DropdownMenuTrigger asChild>
                    <button className={tabButtonClass}>
                      {iconBlock}
                      <span className="hidden sm:inline">{tab.label}</span>
                      <ChevronDown className="w-3 h-3 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-popover">
                    {attendanceMenuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => {
                          setActiveTab('attendance');
                          setActiveAttendanceType(item.id);
                        }}
                        className={cn(
                          "flex items-center justify-between cursor-pointer",
                          activeAttendanceType === item.id && activeTab === 'attendance' && "text-orange-600"
                        )}
                      >
                        {item.label}
                        {activeAttendanceType === item.id && activeTab === 'attendance' && (
                          <Check className="w-4 h-4 text-orange-500" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
            // Shifts dropdown
            if (tab.id === 'shifts') {
              return (
                <DropdownMenu key={tab.id}>
                  <DropdownMenuTrigger asChild>
                    <button className={tabButtonClass}>
                      {iconBlock}
                      <span className="hidden sm:inline">{tab.label}</span>
                      <ChevronDown className="w-3 h-3 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-popover">
                    {shiftsMenuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => {
                          setActiveTab('shifts');
                          setActiveShiftType(item.id);
                        }}
                        className={cn(
                          "flex items-center justify-between cursor-pointer",
                          activeShiftType === item.id && activeTab === 'shifts' && "text-green-600"
                        )}
                      >
                        {item.label}
                        {activeShiftType === item.id && activeTab === 'shifts' && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
            // Requests dropdown
            if (tab.id === 'requests') {
              return (
                <DropdownMenu key={tab.id}>
                  <DropdownMenuTrigger asChild>
                    <button className={tabButtonClass}>
                      {iconBlock}
                      <span className="hidden sm:inline">{tab.label}</span>
                      <ChevronDown className="w-3 h-3 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-popover">
                    {requestMenuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => {
                          setActiveTab('requests');
                          setActiveRequestType(item.id);
                        }}
                        className={cn(
                          "flex items-center justify-between cursor-pointer",
                          activeRequestType === item.id && activeTab === 'requests' && "text-purple-600"
                        )}
                      >
                        {item.label}
                        {activeRequestType === item.id && activeTab === 'requests' && (
                          <Check className="w-4 h-4 text-purple-500" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
            // Regular tabs without dropdown
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={tabButtonClass}
              >
                {iconBlock}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      {renderMainContent()}

      {/* Shift Modal */}
      <Dialog open={shiftModalOpen} onOpenChange={setShiftModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingShift?.id ? t('attPage.editShift') : t('attPage.addShift')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Row 1: Code & Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shift-code">{t('attPage.shiftCodeLabel')} <span className="text-red-500">*</span></Label>
                <Input 
                  id="shift-code" 
                  placeholder="VD: HC1, CA_SANG..."
                  value={editingShift?.code || ''}
                  onChange={(e) => setEditingShift(prev => prev ? {...prev, code: e.target.value} : null)}
                  maxLength={20}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-name">{t('attPage.shiftNameLabel')} <span className="text-red-500">*</span></Label>
                <Input 
                  id="shift-name" 
                  placeholder="VD: Ca hành chính 1..."
                  value={editingShift?.name || ''}
                  onChange={(e) => setEditingShift(prev => prev ? {...prev, name: e.target.value} : null)}
                  maxLength={100}
                />
              </div>
            </div>

            {/* Row 2: Unit */}
            <div className="space-y-2">
              <Label htmlFor="shift-unit">{t('attPage.appliedUnitLabel')}</Label>
              <Select 
                value={editingShift?.unit || ''} 
                onValueChange={(value) => setEditingShift(prev => prev ? {...prev, unit: value} : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('attPage.selectUnit')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Công ty Cổ phần ABC">Công ty Cổ phần ABC</SelectItem>
                  <SelectItem value="Văn phòng Hà Nội">Văn phòng Hà Nội</SelectItem>
                  <SelectItem value="Chi nhánh TP.HCM">Chi nhánh TP.HCM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 3: Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shift-start">{t('attPage.startTime')}</Label>
                <Input 
                  id="shift-start" 
                  type="time"
                  value={editingShift?.startTime || '08:00'}
                  onChange={(e) => setEditingShift(prev => prev ? {...prev, startTime: e.target.value} : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-end">{t('attPage.endTime')}</Label>
                <Input 
                  id="shift-end" 
                  type="time"
                  value={editingShift?.endTime || '17:30'}
                  onChange={(e) => setEditingShift(prev => prev ? {...prev, endTime: e.target.value} : null)}
                />
              </div>
            </div>

            {/* Row 4: Coefficient & Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shift-coefficient">{t('attPage.coefficientLabel')}</Label>
                <Input 
                  id="shift-coefficient" 
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={editingShift?.coefficient || 1}
                  onChange={(e) => setEditingShift(prev => prev ? {...prev, coefficient: parseFloat(e.target.value) || 1} : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-hours">{t('attPage.workHoursLabel')}</Label>
                <Input 
                  id="shift-hours" 
                  type="number"
                  min="0"
                  max="24"
                  value={editingShift?.hours || 8}
                  onChange={(e) => setEditingShift(prev => prev ? {...prev, hours: parseInt(e.target.value) || 8} : null)}
                />
              </div>
            </div>

            {/* Row 5: Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="shift-status">{t('attPage.activeStatus')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('attPage.activeStatusDesc')}
                </p>
              </div>
              <Switch 
                id="shift-status"
                checked={editingShift?.status === 'active'}
                onCheckedChange={(checked) => setEditingShift(prev => prev ? {...prev, status: checked ? 'active' : 'inactive'} : null)}
              />
            </div>

            {/* Additional settings */}
            <div className="space-y-3 pt-2 border-t">
              <Label className="text-sm font-medium">{t('attPage.advancedSettings')}</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Checkbox id="allow-late" defaultChecked />
                  <label htmlFor="allow-late" className="text-sm">{t('attPage.allowLate')}</label>
                  <Input type="number" className="w-20" defaultValue="15" min="0" max="60" />
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="allow-early" defaultChecked />
                  <label htmlFor="allow-early" className="text-sm">{t('attPage.allowEarly')}</label>
                  <Input type="number" className="w-20" defaultValue="15" min="0" max="60" />
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="require-break" />
                  <label htmlFor="require-break" className="text-sm">{t('attPage.requireBreak')}</label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShiftModalOpen(false)}>
              {t('attPage.cancel')}
            </Button>
            <Button onClick={handleSaveShift} className="bg-orange-500 hover:bg-orange-600 text-white">
              {editingShift?.id ? t('common.update', 'Cập nhật') : t('common.addNew', 'Thêm mới')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Attendance Modal */}
      <Dialog open={attendanceModalOpen} onOpenChange={setAttendanceModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{t('attPage.editAttendance')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name - readonly */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm text-muted-foreground">{t('attPage.fullNameCol')}</Label>
              <Input 
                value={editingAttendance?.name || ''} 
                readOnly 
                className="col-span-2 bg-muted"
              />
            </div>

            {/* Unit - readonly */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm text-muted-foreground">{t('attPage.unitCol')}</Label>
              <Input 
                value={editingAttendance?.unit || ''} 
                readOnly 
                className="col-span-2 bg-muted"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm text-muted-foreground">{t('attPage.timeLabel')}</Label>
              <div className="col-span-2 flex items-center gap-2">
                <div className="relative flex-1">
                  <Input 
                    type="text"
                    value={editingAttendance?.date || ''} 
                    onChange={(e) => setEditingAttendance(prev => prev ? {...prev, date: e.target.value} : null)}
                    placeholder="DD/MM/YYYY"
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <div className="relative w-24">
                  <Input 
                    type="time"
                    value={editingAttendance?.time || ''} 
                    onChange={(e) => setEditingAttendance(prev => prev ? {...prev, time: e.target.value} : null)}
                    className="pr-10"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAttendanceModalOpen(false)}>
              {t('attPage.cancel')}
            </Button>
            <Button onClick={handleSaveAttendance} className="bg-orange-500 hover:bg-orange-600 text-white">
              {t('attPage.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Weekly Cell Detail Modal */}
      <Dialog open={cellDetailModalOpen} onOpenChange={setCellDetailModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-lg">{t('attPage.cellTitle', { date: `${selectedCellData?.date}/05` })}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t('attPage.shiftInfo')}
            </p>
          </DialogHeader>

          <div className="py-2">
            {/* Data Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/40">
                     <th className="p-3 text-left text-sm font-medium">{t('attPage.info')}</th>
                    <th className="p-3 text-right text-sm font-medium">{t('attPage.value')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        <span>{t('attPage.paidWorkdays')}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-right font-medium">1.00</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-sm pl-8">{t('attPage.clockIn')}</td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2 border rounded-md px-3 py-1.5 bg-background">
                        <Input type="text" defaultValue="08:07" className="w-14 text-sm border-0 p-0 h-auto focus-visible:ring-0 text-center" placeholder="HH:MM" />
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-sm pl-8">{t('attPage.clockOut')}</td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2 border rounded-md px-3 py-1.5 bg-background">
                        <Input type="text" defaultValue="17:30" className="w-14 text-sm border-0 p-0 h-auto focus-visible:ring-0 text-center" placeholder="HH:MM" />
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-sm">{t('attPage.lateMinutes')}</td>
                    <td className="p-3 text-sm text-right font-medium">2</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-sm">{t('attPage.earlyMinutes')}</td>
                    <td className="p-3 text-sm text-right font-medium">0</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-sm">{t('attPage.totalOvertimeHours')}</td>
                    <td className="p-3 text-sm text-right font-medium">0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCellDetailModalOpen(false)}>
              {t('attPage.cancel')}
            </Button>
            <Button onClick={handleSaveCellDetail} className="bg-orange-500 hover:bg-orange-600 text-white">
              {t('attPage.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Sheet Modal */}
      <Dialog open={addSheetModalOpen} onOpenChange={setAddSheetModalOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{t('attPage.addSheet')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Đơn vị công tác */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">{t('attPage.sheetUnit')}</Label>
              <div className="col-span-2">
                <Select 
                  value={newSheetForm.unit} 
                  onValueChange={(v) => setNewSheetForm(prev => ({...prev, unit: v}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('attPage.selectDepartment', 'Chọn phòng ban')} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vị trí công việc */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">{t('attPage.sheetPositions')}</Label>
              <div className="col-span-2">
                <Select 
                  value={newSheetForm.positions} 
                  onValueChange={(v) => setNewSheetForm(prev => ({...prev, positions: v}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('attPage.allPositions', 'Tất cả vị trí')}</SelectItem>
                    {[...new Set(employees.map(e => e.position).filter(Boolean))].map(pos => (
                      <SelectItem key={pos!} value={pos!}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tên bảng chấm công */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">{t('attPage.sheetNameLabel')}</Label>
              <div className="col-span-2">
                <Input 
                  value={newSheetForm.name}
                  onChange={(e) => setNewSheetForm(prev => ({...prev, name: e.target.value}))}
                  placeholder="Bảng chấm công từ ngày 01/01/2022 đến ngày 31/01/2022"
                />
              </div>
            </div>

            {/* Thời gian */}
            <div className="grid grid-cols-3 items-start gap-4">
              <Label className="text-sm pt-2">{t('attPage.timePeriod')}</Label>
              <div className="col-span-2 space-y-3">
                <Select 
                  value={newSheetForm.timePreset}
                  onValueChange={(v) => setNewSheetForm(prev => ({...prev, timePreset: v}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">{t('attPage.thisMonth')}</SelectItem>
                    <SelectItem value="last-month">{t('attPage.lastMonth')}</SelectItem>
                    <SelectItem value="custom">{t('attPage.custom')}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input 
                      value={newSheetForm.startDate}
                      onChange={(e) => setNewSheetForm(prev => ({...prev, startDate: e.target.value}))}
                      placeholder="DD/MM/YYYY"
                      className="pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <div className="relative flex-1">
                    <Input 
                      value={newSheetForm.endDate}
                      onChange={(e) => setNewSheetForm(prev => ({...prev, endDate: e.target.value}))}
                      placeholder="DD/MM/YYYY"
                      className="pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Hình thức chấm công */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">{t('attPage.attendanceMethod')}</Label>
              <div className="col-span-2">
                <Select 
                  value={newSheetForm.attendanceType}
                  onValueChange={(v) => setNewSheetForm(prev => ({...prev, attendanceType: v}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t('attPage.daily')}</SelectItem>
                    <SelectItem value="hourly">{t('attPage.hourly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Công chuẩn */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm"></Label>
              <div className="col-span-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="standardType" 
                    value="fixed"
                    checked={newSheetForm.standardType === 'fixed'}
                    onChange={() => setNewSheetForm(prev => ({...prev, standardType: 'fixed'}))}
                    className="w-4 h-4 text-orange-500"
                  />
                  <span className="text-sm">{t('attPage.fixedStandardShort')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="standardType" 
                    value="monthly"
                    checked={newSheetForm.standardType === 'monthly'}
                    onChange={() => setNewSheetForm(prev => ({...prev, standardType: 'monthly'}))}
                    className="w-4 h-4 text-orange-500"
                  />
                  <span className="text-sm">{t('attPage.monthlyStandardShort')}</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSheetModalOpen(false)}>
              {t('attPage.cancel')}
            </Button>
            <Button onClick={handleAddSheet} className="bg-orange-500 hover:bg-orange-600 text-white">
              {t('attPage.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Sheet Confirmation Dialog */}
      <AlertDialog open={deleteSheetModalOpen} onOpenChange={setDeleteSheetModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('attPage.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('attPage.deleteSheetConfirm', { name: sheetToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteSheetModalOpen(false)}>
              {t('attPage.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSheet}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('attPage.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Request Modal */}
      <Dialog open={leaveRequestModalOpen} onOpenChange={setLeaveRequestModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('attPage.addLeaveRequest')}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Employee */}
            <div className="space-y-2">
              <Label htmlFor="employee">{t('attPage.submitter')} <span className="text-red-500">*</span></Label>
              <Select 
                value={leaveRequestForm.employee} 
                onValueChange={(value) => setLeaveRequestForm(prev => ({...prev, employee: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('attPage.selectEmployee')} />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="tran-dang-trung">Trần Đăng Trung</SelectItem>
                  <SelectItem value="dang-thi-phuong-loan">Đặng Thị Phương Loan</SelectItem>
                  <SelectItem value="nguyen-hoang-son">Nguyễn Hoàng Sơn</SelectItem>
                  <SelectItem value="pham-quang-anh">Phạm Quang Anh</SelectItem>
                  <SelectItem value="pham-my-hanh">Phạm Mỹ Hạnh</SelectItem>
                  <SelectItem value="le-minh-nguyet">Lê Minh Nguyệt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leave Type */}
            <div className="space-y-2">
              <Label htmlFor="leaveType">{t('attPage.leaveType')} <span className="text-red-500">*</span></Label>
              <Select 
                value={leaveRequestForm.leaveType} 
                onValueChange={(value) => setLeaveRequestForm(prev => ({...prev, leaveType: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('attPage.selectLeaveType')} />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="nghi-phep">{t('attPage.annualLeave')}</SelectItem>
                  <SelectItem value="nghi-khong-huong-luong">{t('attPage.unpaidLeave')}</SelectItem>
                  <SelectItem value="nghi-thai-san">{t('attPage.maternityLeave')}</SelectItem>
                  <SelectItem value="nghi-om">{t('attPage.sickLeave')}</SelectItem>
                  <SelectItem value="nghi-ket-hon">{t('attPage.weddingLeave')}</SelectItem>
                  <SelectItem value="nghi-con-ket-hon">{t('attPage.childWeddingLeave', 'Nghỉ con kết hôn')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('attPage.startDate')} <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !leaveRequestForm.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {leaveRequestForm.startDate ? (
                        format(leaveRequestForm.startDate, "dd/MM/yyyy", { locale: vi })
                      ) : (
                        <span>{t('attPage.selectDay', 'Chọn ngày')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={leaveRequestForm.startDate}
                      onSelect={(date) => setLeaveRequestForm(prev => ({...prev, startDate: date}))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t('attPage.endDate')} <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !leaveRequestForm.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {leaveRequestForm.endDate ? (
                        format(leaveRequestForm.endDate, "dd/MM/yyyy", { locale: vi })
                      ) : (
                        <span>{t('attPage.selectDay', 'Chọn ngày')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={leaveRequestForm.endDate}
                      onSelect={(date) => setLeaveRequestForm(prev => ({...prev, endDate: date}))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">{t('attPage.reason')}</Label>
              <Textarea 
                id="reason"
                placeholder={t('attPage.reasonPlaceholder', 'Nhập lý do xin nghỉ...')}
                value={leaveRequestForm.reason}
                onChange={(e) => setLeaveRequestForm(prev => ({...prev, reason: e.target.value}))}
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveRequestModalOpen(false)}>
              {t('attPage.cancel')}
            </Button>
            <Button onClick={handleAddLeaveRequest} className="bg-orange-500 hover:bg-orange-600 text-white">
              {t('attPage.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Request Detail/Edit Modal */}
      <Dialog open={leaveDetailModalOpen} onOpenChange={setLeaveDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{t('attPage.leaveDetailTitle')}</DialogTitle>
              {selectedLeaveRequest?.status === 'pending' && !isEditingLeave && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setIsEditingLeave(true)}
                >
                  <Pencil className="w-4 h-4" />
                  {t('attPage.editInfo')}
                </Button>
              )}
            </div>
          </DialogHeader>
          
          {selectedLeaveRequest && (
            <div className="space-y-6 py-4">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="text-sm bg-orange-100 text-orange-600">
                    {selectedLeaveRequest.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedLeaveRequest.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedLeaveRequest.position}</p>
                  <p className="text-sm text-muted-foreground">{selectedLeaveRequest.unit}</p>
                </div>
                <div className="ml-auto">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    selectedLeaveRequest.status === 'approved' 
                      ? "bg-green-100 text-green-700" 
                      : selectedLeaveRequest.status === 'rejected'
                      ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                  )}>
                    {selectedLeaveRequest.status === 'approved' ? t('attPage.approved') : selectedLeaveRequest.status === 'rejected' ? t('attPage.rejected') : t('attPage.pending')}
                  </span>
                </div>
              </div>

              {/* Detail Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">{t('attPage.leaveType')}</Label>
                  {isEditingLeave ? (
                    <Select 
                      value={editLeaveForm.leaveType} 
                      onValueChange={(value) => setEditLeaveForm(prev => ({...prev, leaveType: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('attPage.selectLeaveType')} />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="Nghỉ phép">{t('attPage.annualLeave')}</SelectItem>
                        <SelectItem value="Nghỉ không hưởng lương">{t('attPage.unpaidLeave')}</SelectItem>
                        <SelectItem value="Nghỉ thai sản">{t('attPage.maternityLeave')}</SelectItem>
                        <SelectItem value="Nghỉ ốm">{t('attPage.sickLeave')}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium">{selectedLeaveRequest.leaveType}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">{t('attPage.leaveDaysCol')}</Label>
                  {isEditingLeave ? (
                    <Input 
                      type="number" 
                      step="0.5"
                      min="0.5"
                      value={editLeaveForm.days}
                      onChange={(e) => setEditLeaveForm(prev => ({...prev, days: parseFloat(e.target.value)}))}
                    />
                  ) : (
                    <p className="font-medium">{selectedLeaveRequest.days} {t('attPage.days')}</p>
                  )}
                </div>
              </div>

              {isEditingLeave && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('attPage.startDate')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !editLeaveForm.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editLeaveForm.startDate ? (
                            format(editLeaveForm.startDate, "dd/MM/yyyy", { locale: vi })
                          ) : (
                            <span>{t('attPage.selectDay', 'Chọn ngày')}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={editLeaveForm.startDate}
                          onSelect={(date) => setEditLeaveForm(prev => ({...prev, startDate: date}))}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('attPage.endDate')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !editLeaveForm.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editLeaveForm.endDate ? (
                            format(editLeaveForm.endDate, "dd/MM/yyyy", { locale: vi })
                          ) : (
                            <span>{t('attPage.selectDay', 'Chọn ngày')}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={editLeaveForm.endDate}
                          onSelect={(date) => setEditLeaveForm(prev => ({...prev, endDate: date}))}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-muted-foreground">{t('attPage.approver')}</Label>
                <p className="font-medium">{selectedLeaveRequest.approver}</p>
              </div>

              {isEditingLeave && (
                <div className="space-y-2">
                  <Label>{t('attPage.editReason', 'Lý do chỉnh sửa')}</Label>
                  <Textarea 
                    placeholder={t('attPage.editReasonPlaceholder', 'Nhập lý do chỉnh sửa...')}
                    value={editLeaveForm.reason}
                    onChange={(e) => setEditLeaveForm(prev => ({...prev, reason: e.target.value}))}
                    rows={3}
                    maxLength={500}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isEditingLeave ? (
              <>
                <Button variant="outline" onClick={() => setIsEditingLeave(false)}>
                  {t('attPage.cancelEdit', 'Hủy chỉnh sửa')}
                </Button>
                <Button onClick={handleSaveLeaveEdit} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {t('attPage.saveEdit')}
                </Button>
              </>
            ) : (
              <>
                {selectedLeaveRequest?.status === 'pending' && (
                  <div className="flex gap-2 mr-auto">
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => openApprovalModal('reject')}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('attPage.rejected')}
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => openApprovalModal('approve')}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {t('attPage.approve', 'Duyệt đơn')}
                    </Button>
                  </div>
                )}
                <Button variant="outline" onClick={() => setLeaveDetailModalOpen(false)}>
                  {t('common.close', 'Đóng')}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Modal */}
      <AlertDialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {approvalAction === 'approve' ? t('attPage.confirmApprove', 'Xác nhận duyệt đơn') : t('attPage.confirmReject', 'Xác nhận từ chối đơn')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {approvalAction === 'approve' 
                ? t('attPage.confirmApproveDesc', { name: selectedLeaveRequest?.name, defaultValue: `Bạn có chắc chắn muốn duyệt đơn xin nghỉ của "${selectedLeaveRequest?.name}"?` })
                : t('attPage.confirmRejectDesc', { name: selectedLeaveRequest?.name, defaultValue: `Bạn có chắc chắn muốn từ chối đơn xin nghỉ của "${selectedLeaveRequest?.name}"?` })
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="approval-note">{t('attPage.approvalNote', 'Ghi chú')} {approvalAction === 'reject' && <span className="text-red-500">*</span>}</Label>
            <Textarea 
              id="approval-note"
              placeholder={approvalAction === 'approve' ? t('attPage.approveNotePlaceholder', 'Nhập ghi chú (không bắt buộc)...') : t('attPage.rejectNotePlaceholder', 'Nhập lý do từ chối...')}
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              className="mt-2"
              rows={3}
              maxLength={500}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setApprovalModalOpen(false)}>
              {t('attPage.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleApprovalSubmit}
              className={cn(
                approvalAction === 'approve' 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
              disabled={approvalAction === 'reject' && !approvalNote.trim()}
            >
              {approvalAction === 'approve' ? t('attPage.approve', 'Duyệt đơn') : t('attPage.rejected')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
