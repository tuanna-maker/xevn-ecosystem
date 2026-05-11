import { useState } from 'react';
import { useDepartments } from '@/hooks/useDepartments';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Briefcase, 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Upload, 
  FileText,
  MoreHorizontal,
  Download,
  Eye,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ListTodo,
  Target,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';

interface WorkHistoryItem {
  id: string;
  company: string;
  position: string;
  department: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  fileUrl?: string;
  fileName?: string;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  project: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedDate: string;
  dueDate: string;
  completedDate?: string;
  assignedBy: string;
  progress: number;
}

const initialWorkHistory: WorkHistoryItem[] = [
  {
    id: '1',
    company: 'Công ty TNHH ABC',
    position: 'Nhân viên kế toán',
    department: 'Phòng Kế toán',
    startDate: '2020-01',
    endDate: '2022-12',
    isCurrent: false,
    description: 'Quản lý sổ sách kế toán, báo cáo tài chính hàng tháng',
  },
  {
    id: '2',
    company: 'Công ty TNHH XYZ',
    position: 'Trưởng phòng Kế toán',
    department: 'Phòng Kế toán',
    startDate: '2023-01',
    endDate: '',
    isCurrent: true,
    description: 'Quản lý đội ngũ kế toán, lập báo cáo tài chính',
  },
];

const initialTasks: TaskItem[] = [
  {
    id: '1',
    title: 'Lập báo cáo tài chính Q4/2025',
    description: 'Tổng hợp và lập báo cáo tài chính quý 4 năm 2025',
    project: 'Dự án Báo cáo Tài chính',
    priority: 'high',
    status: 'completed',
    assignedDate: '2025-10-01',
    dueDate: '2025-12-31',
    completedDate: '2025-12-28',
    assignedBy: 'Nguyễn Văn A',
    progress: 100,
  },
  {
    id: '2',
    title: 'Kiểm toán nội bộ',
    description: 'Thực hiện kiểm toán nội bộ theo quy trình',
    project: 'Dự án Kiểm toán 2026',
    priority: 'urgent',
    status: 'in_progress',
    assignedDate: '2026-01-02',
    dueDate: '2026-01-20',
    assignedBy: 'Trần Văn B',
    progress: 65,
  },
  {
    id: '3',
    title: 'Đào tạo nhân viên mới',
    description: 'Đào tạo quy trình kế toán cho nhân viên mới',
    project: 'Đào tạo Nội bộ',
    priority: 'medium',
    status: 'pending',
    assignedDate: '2026-01-05',
    dueDate: '2026-01-25',
    assignedBy: 'Lê Thị C',
    progress: 0,
  },
  {
    id: '4',
    title: 'Cập nhật hệ thống ERP',
    description: 'Hỗ trợ cập nhật module kế toán trong hệ thống ERP',
    project: 'Dự án ERP',
    priority: 'high',
    status: 'in_progress',
    assignedDate: '2025-12-15',
    dueDate: '2026-02-01',
    assignedBy: 'Phạm Văn D',
    progress: 40,
  },
  {
    id: '5',
    title: 'Xây dựng quy trình thanh toán',
    description: 'Xây dựng và chuẩn hóa quy trình thanh toán nội bộ',
    project: 'Dự án Quy trình',
    priority: 'low',
    status: 'cancelled',
    assignedDate: '2025-11-01',
    dueDate: '2025-12-15',
    assignedBy: 'Hoàng Văn E',
    progress: 20,
  },
  {
    id: '6',
    title: 'Báo cáo thuế tháng 12',
    description: 'Lập và nộp báo cáo thuế GTGT tháng 12/2025',
    project: 'Thuế & Pháp lý',
    priority: 'urgent',
    status: 'completed',
    assignedDate: '2025-12-20',
    dueDate: '2026-01-10',
    completedDate: '2026-01-08',
    assignedBy: 'Nguyễn Văn A',
    progress: 100,
  },
];

// Mock data for monthly/quarterly performance charts
const monthlyPerformanceData = [
  { month: 'T7/2025', assigned: 5, completed: 4, completionRate: 80, avgProgress: 85 },
  { month: 'T8/2025', assigned: 7, completed: 6, completionRate: 86, avgProgress: 88 },
  { month: 'T9/2025', assigned: 6, completed: 5, completionRate: 83, avgProgress: 82 },
  { month: 'T10/2025', assigned: 8, completed: 7, completionRate: 88, avgProgress: 90 },
  { month: 'T11/2025', assigned: 5, completed: 4, completionRate: 80, avgProgress: 78 },
  { month: 'T12/2025', assigned: 6, completed: 5, completionRate: 83, avgProgress: 85 },
  { month: 'T1/2026', assigned: 4, completed: 2, completionRate: 50, avgProgress: 65 },
];

const quarterlyPerformanceData = [
  { quarter: 'Q1/2025', assigned: 15, completed: 12, onTime: 10, late: 2, cancelled: 1, completionRate: 80 },
  { quarter: 'Q2/2025', assigned: 18, completed: 15, onTime: 13, late: 2, cancelled: 2, completionRate: 83 },
  { quarter: 'Q3/2025', assigned: 20, completed: 17, onTime: 15, late: 2, cancelled: 1, completionRate: 85 },
  { quarter: 'Q4/2025', assigned: 19, completed: 16, onTime: 14, late: 2, cancelled: 2, completionRate: 84 },
];

const priorityDistribution = [
  { name: 'Thấp', value: 15, color: 'hsl(var(--muted-foreground))' },
  { name: 'Trung bình', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Cao', value: 30, color: 'hsl(var(--chart-4))' },
  { name: 'Khẩn cấp', value: 20, color: 'hsl(var(--destructive))' },
];

const projectDistribution = [
  { name: 'Báo cáo Tài chính', tasks: 12, completed: 10 },
  { name: 'Kiểm toán', tasks: 8, completed: 6 },
  { name: 'Đào tạo', tasks: 5, completed: 4 },
  { name: 'ERP', tasks: 10, completed: 7 },
  { name: 'Thuế & Pháp lý', tasks: 6, completed: 5 },
];

// chartConfig will be built inside the component using t()

const formatMonthYear = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  return `${month}/${year}`;
};

export function EmployeeWorkHistory() {
  const { t } = useTranslation();
  const { departments } = useDepartments();
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>(initialWorkHistory);
  const [tasks] = useState<TaskItem[]>(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkHistoryItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [formData, setFormData] = useState<Omit<WorkHistoryItem, 'id'>>({
    company: '',
    position: '',
    department: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    fileUrl: '',
    fileName: '',
  });

  const chartConfig = {
    assigned: { label: t('workHistory.charts.assigned'), color: "hsl(var(--primary))" },
    completed: { label: t('workHistory.tasks.completed'), color: "hsl(var(--chart-2))" },
    completionRate: { label: t('workHistory.tasks.completionRate'), color: "hsl(var(--chart-1))" },
    avgProgress: { label: t('workHistory.tasks.avgProgress'), color: "hsl(var(--chart-3))" },
    onTime: { label: t('workHistory.charts.onTime'), color: "hsl(var(--chart-2))" },
    late: { label: t('workHistory.charts.late'), color: "hsl(var(--chart-4))" },
    cancelled: { label: t('workHistory.charts.cancelled'), color: "hsl(var(--muted-foreground))" },
  } satisfies ChartConfig;

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
    completionRate: tasks.length > 0 
      ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.filter(t => t.status !== 'cancelled').length) * 100) 
      : 0,
    avgProgress: tasks.length > 0 
      ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length) 
      : 0,
    urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed' && t.status !== 'cancelled').length,
    overdue: tasks.filter(t => {
      if (t.status === 'completed' || t.status === 'cancelled') return false;
      return new Date(t.dueDate) < new Date();
    }).length,
  };

  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'all') return true;
    return task.status === taskFilter;
  });

  const getPriorityBadge = (priority: TaskItem['priority']) => {
    const config = {
      low: { label: t('workHistory.tasks.priority.low'), variant: 'secondary' as const },
      medium: { label: t('workHistory.tasks.priority.medium'), variant: 'outline' as const },
      high: { label: t('workHistory.tasks.priority.high'), variant: 'default' as const },
      urgent: { label: t('workHistory.tasks.priority.urgent'), variant: 'destructive' as const },
    };
    return config[priority];
  };

  const getStatusBadge = (status: TaskItem['status']) => {
    const config = {
      pending: { label: t('workHistory.tasks.status.pending'), icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
      in_progress: { label: t('workHistory.tasks.status.inProgress'), icon: TrendingUp, color: 'text-blue-600 bg-blue-100' },
      completed: { label: t('workHistory.tasks.status.completed'), icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
      cancelled: { label: t('workHistory.tasks.status.cancelled'), icon: XCircle, color: 'text-gray-600 bg-gray-100' },
    };
    return config[status];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const handleOpenDialog = (item?: WorkHistoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        company: item.company,
        position: item.position,
        department: item.department,
        startDate: item.startDate,
        endDate: item.endDate,
        isCurrent: item.isCurrent,
        description: item.description,
        fileUrl: item.fileUrl || '',
        fileName: item.fileName || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        company: '',
        position: '',
        department: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
        fileUrl: '',
        fileName: '',
      });
    }
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('workHistory.dialog.fileSizeError'));
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSave = () => {
    if (!formData.company || !formData.position || !formData.startDate) {
      toast.error(t('workHistory.dialog.requiredError'));
      return;
    }

    let fileUrl = formData.fileUrl;
    let fileName = formData.fileName;

    if (selectedFile) {
      fileUrl = URL.createObjectURL(selectedFile);
      fileName = selectedFile.name;
    }

    if (editingItem) {
      setWorkHistory(workHistory.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData, fileUrl, fileName }
          : item
      ));
      toast.success(t('workHistory.toast.updated'));
    } else {
      const newItem: WorkHistoryItem = {
        id: Date.now().toString(),
        ...formData,
        fileUrl,
        fileName,
      };
      setWorkHistory([...workHistory, newItem]);
      toast.success(t('workHistory.toast.added'));
    }

    setIsDialogOpen(false);
    setSelectedFile(null);
  };

  const handleDelete = (id: string) => {
    setWorkHistory(workHistory.filter(item => item.id !== id));
    toast.success(t('workHistory.toast.deleted'));
  };

  // Sort by startDate descending (most recent first)
  const sortedHistory = [...workHistory].sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;
    return b.startDate.localeCompare(a.startDate);
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ListTodo className="w-4 h-4" />
            {t('workHistory.tabs.tasks')}
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {t('workHistory.tabs.charts')}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            {t('workHistory.tabs.history')}
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          {/* Task Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <ListTodo className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('workHistory.tasks.total')}</p>
                    <p className="text-2xl font-bold">{taskStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('workHistory.tasks.completed')}</p>
                    <p className="text-2xl font-bold">{taskStats.completed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('workHistory.tasks.inProgress')}</p>
                    <p className="text-2xl font-bold">{taskStats.inProgress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('workHistory.tasks.completionRate')}</p>
                    <p className="text-2xl font-bold">{taskStats.completionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">{t('workHistory.charts.progressOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('workHistory.charts.avgProgressLabel')}</span>
                    <span className="font-medium">{taskStats.avgProgress}%</span>
                  </div>
                  <Progress value={taskStats.avgProgress} className="h-2" />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">{t('workHistory.tasks.urgent')}: <span className="font-medium">{taskStats.urgent}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm">{t('workHistory.tasks.overdue')}: <span className="font-medium">{taskStats.overdue}</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="text-sm">{t('workHistory.tasks.pending')}: <span className="font-medium">{taskStats.pending}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <span className="text-sm">{t('workHistory.tasks.status.cancelled')}: <span className="font-medium">{taskStats.cancelled}</span></span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ListTodo className="w-4 h-4" />
                {t('workHistory.tasks.title')}
              </CardTitle>
              <Select value={taskFilter} onValueChange={setTaskFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('workHistory.tasks.filterAll')}</SelectItem>
                  <SelectItem value="pending">{t('workHistory.tasks.status.pending')}</SelectItem>
                  <SelectItem value="in_progress">{t('workHistory.tasks.status.inProgress')}</SelectItem>
                  <SelectItem value="completed">{t('workHistory.tasks.status.completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('workHistory.tasks.status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const priorityConfig = getPriorityBadge(task.priority);
                  const statusConfig = getStatusBadge(task.status);
                  const StatusIcon = statusConfig.icon;
                  const isOverdue = task.status !== 'completed' && task.status !== 'cancelled' && new Date(task.dueDate) < new Date();
                  
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border ${isOverdue ? 'border-red-300 bg-red-50/50' : 'bg-muted/30'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {t('workHistory.tasks.overdue')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Briefcase className="w-3 h-3" />
                              {task.project}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Users className="w-3 h-3" />
                              {t('workHistory.tasks.assignedBy')}: {task.assignedBy}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {formatDate(task.assignedDate)} - {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={priorityConfig.variant}>{priorityConfig.label}</Badge>
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{t('workHistory.tasks.avgProgress')}</span>
                          <span className="font-medium">{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-1.5" />
                      </div>
                      
                      {task.completedDate && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {t('workHistory.tasks.completedDate')}: {formatDate(task.completedDate)}
                        </p>
                      )}
                    </div>
                  );
                })}

                {filteredTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('workHistory.charts.noTasks')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-4">
          {/* Monthly Performance Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t('workHistory.charts.monthlyPerformance')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <ComposedChart data={monthlyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      yAxisId="left"
                      dataKey="assigned" 
                      fill="var(--color-assigned)" 
                      radius={[4, 4, 0, 0]} 
                      name={t('workHistory.charts.assigned')}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="completed" 
                      fill="var(--color-completed)" 
                      radius={[4, 4, 0, 0]} 
                      name={t('workHistory.tasks.completed')}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="completionRate" 
                      stroke="var(--color-completionRate)" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name={t('workHistory.charts.completionRatePercent')}
                    />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Quarterly Performance Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t('workHistory.charts.quarterlyPerformance')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <BarChart data={quarterlyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="quarter" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar 
                      dataKey="onTime" 
                      stackId="a"
                      fill="var(--color-onTime)" 
                      name={t('workHistory.charts.onTime')}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar 
                      dataKey="late" 
                      stackId="a"
                      fill="var(--color-late)" 
                      name={t('workHistory.charts.late')}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar 
                      dataKey="cancelled" 
                      stackId="a"
                      fill="var(--color-cancelled)" 
                      name={t('workHistory.charts.cancelled')}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Progress Trend & Priority Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {t('workHistory.charts.progressTrend')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <AreaChart data={monthlyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <defs>
                      <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="avgProgress" 
                      stroke="hsl(var(--chart-3))" 
                      fill="url(#colorProgress)"
                      strokeWidth={2}
                      name={t('workHistory.charts.avgProgressPercent')}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completionRate" 
                      stroke="hsl(var(--chart-1))" 
                      fill="url(#colorCompletion)"
                      strokeWidth={2}
                      name={t('workHistory.charts.completionRatePercent')}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {t('workHistory.charts.priorityDistribution')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {priorityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ payload }) => {
                          if (payload && payload[0]) {
                            return (
                              <div className="bg-background border rounded-lg p-2 shadow-md">
                                <p className="text-sm font-medium">{payload[0].name}</p>
                                <p className="text-sm text-muted-foreground">{payload[0].value} {t('workHistory.charts.tasks')}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {t('workHistory.charts.projectDistribution')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectDistribution.map((project) => {
                  const completionRate = Math.round((project.completed / project.tasks) * 100);
                  return (
                    <div key={project.name} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-muted-foreground">
                          {project.completed}/{project.tasks} ({completionRate}%)
                        </span>
                      </div>
                      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {t('workHistory.title')}
              </CardTitle>
              <Button size="sm" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-1" />
                {t('workHistory.addNew')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedHistory.map((item) => (
                  <div
                    key={item.id}
                    className="relative pl-6 pb-4 border-l-2 border-primary/30 last:border-l-0 last:pb-0 group"
                  >
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                    <div className="bg-muted/50 rounded-lg p-4 relative">
                      {/* Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(item)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              {t('workHistory.dialog.editAction')}
                            </DropdownMenuItem>
                            {item.fileUrl && (
                              <>
                                <DropdownMenuItem asChild>
                                  <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <Eye className="w-4 h-4 mr-2" />
                                    {t('workHistory.dialog.viewFile')}
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={item.fileUrl} download={item.fileName}>
                                    <Download className="w-4 h-4 mr-2" />
                                    {t('workHistory.dialog.download')}
                                  </a>
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('workHistory.dialog.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-start justify-between mb-2 pr-10">
                        <div>
                          <h4 className="font-semibold text-sm">{item.position}</h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            {item.company}
                          </div>
                        </div>
                        {item.isCurrent && (
                          <Badge variant="default" className="text-xs">
                            {t('workHistory.current')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.department} • {formatMonthYear(item.startDate)} - {item.isCurrent ? t('workHistory.current') : formatMonthYear(item.endDate)}
                      </p>
                      <p className="text-sm">{item.description}</p>
                      
                      {item.fileUrl && (
                        <div className="flex items-center gap-1 mt-2 text-xs">
                          <FileText className="w-3 h-3 text-blue-500" />
                          <a 
                            href={item.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline flex items-center gap-1"
                          >
                            {item.fileName || t('workHistory.dialog.viewAttachment')}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {workHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('workHistory.empty')}</p>
                    <p className="text-sm">{t('workHistory.emptyHint')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? t('workHistory.edit') : t('workHistory.addNew')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('workHistory.dialog.companyLabel')} <span className="text-destructive">*</span></Label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder={t('workHistory.dialog.companyPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('workHistory.position')} <span className="text-destructive">*</span></Label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder={t('workHistory.dialog.positionPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('workHistory.department')}</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('workHistory.dialog.departmentPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('workHistory.startDate')} <span className="text-destructive">*</span></Label>
                <Input
                  type="month"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('workHistory.endDate')}</Label>
                <Input
                  type="month"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={formData.isCurrent}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCurrent"
                checked={formData.isCurrent}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isCurrent: !!checked, endDate: checked ? '' : formData.endDate })
                }
              />
              <label
                htmlFor="isCurrent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('workHistory.dialog.isCurrentLabel')}
              </label>
            </div>

            <div className="space-y-2">
              <Label>{t('workHistory.description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('workHistory.dialog.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('workHistory.dialog.fileLabel')}</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="work-history-file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                />
                <label htmlFor="work-history-file" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  {selectedFile ? (
                    <p className="text-sm font-medium text-primary">{selectedFile.name}</p>
                  ) : formData.fileName ? (
                    <p className="text-sm font-medium text-primary">{formData.fileName}</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">{t('workHistory.dialog.fileHint')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('workHistory.dialog.fileFormat')}</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('workHistory.dialog.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleSave}>
              {editingItem ? t('workHistory.dialog.saveChanges') : t('workHistory.addNew')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}