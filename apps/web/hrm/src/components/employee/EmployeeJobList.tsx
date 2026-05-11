import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parse } from 'date-fns';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import {
  Briefcase,
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  FileDown,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { EmployeeJobProgressChart } from './EmployeeJobProgressChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Job {
  id: string;
  title: string;
  project: string;
  department: string;
  priority: 'high' | 'medium' | 'low';
  status: 'completed' | 'in_progress' | 'pending' | 'overdue';
  startDate: string;
  dueDate: string;
  progress: number;
  assignedBy: string;
  description?: string;
}

const initialMockJobs: Job[] = [
  {
    id: '1',
    title: 'Báo cáo doanh số tháng 12',
    project: 'Dự án ABC',
    department: 'Kinh doanh',
    priority: 'high',
    status: 'in_progress',
    startDate: '01/12/2024',
    dueDate: '15/12/2024',
    progress: 60,
    assignedBy: 'Nguyễn Văn A',
    description: 'Tổng hợp và báo cáo doanh số bán hàng tháng 12',
  },
  {
    id: '2',
    title: 'Phân tích đối thủ cạnh tranh',
    project: 'Nghiên cứu thị trường',
    department: 'Marketing',
    priority: 'medium',
    status: 'completed',
    startDate: '15/11/2024',
    dueDate: '30/11/2024',
    progress: 100,
    assignedBy: 'Trần Thị B',
    description: 'Phân tích và đánh giá các đối thủ cạnh tranh trên thị trường',
  },
  {
    id: '3',
    title: 'Đào tạo nhân viên mới',
    project: 'Onboarding Q4',
    department: 'Nhân sự',
    priority: 'low',
    status: 'pending',
    startDate: '20/12/2024',
    dueDate: '25/12/2024',
    progress: 0,
    assignedBy: 'Lê Văn C',
    description: 'Đào tạo và hướng dẫn nhân viên mới về quy trình công việc',
  },
  {
    id: '4',
    title: 'Hoàn thiện hồ sơ dự án',
    project: 'Dự án XYZ',
    department: 'Kinh doanh',
    priority: 'high',
    status: 'overdue',
    startDate: '01/11/2024',
    dueDate: '10/11/2024',
    progress: 45,
    assignedBy: 'Phạm Văn D',
    description: 'Hoàn thiện và nộp hồ sơ dự án cho khách hàng',
  },
  {
    id: '5',
    title: 'Họp review sprint',
    project: 'Phát triển sản phẩm',
    department: 'Công nghệ',
    priority: 'medium',
    status: 'completed',
    startDate: '05/12/2024',
    dueDate: '05/12/2024',
    progress: 100,
    assignedBy: 'Hoàng Thị E',
    description: 'Tổ chức họp review sprint và đánh giá tiến độ',
  },
  {
    id: '6',
    title: 'Cập nhật tài liệu kỹ thuật',
    project: 'Documentation',
    department: 'Công nghệ',
    priority: 'low',
    status: 'in_progress',
    startDate: '10/12/2024',
    dueDate: '20/12/2024',
    progress: 30,
    assignedBy: 'Vũ Văn F',
    description: 'Cập nhật và hoàn thiện tài liệu kỹ thuật cho dự án',
  },
];

const priorityConfig = {
  high: { label: 'Cao', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  medium: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  low: { label: 'Thấp', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

const statusConfig = {
  completed: { label: 'Hoàn thành', icon: CheckCircle2, color: 'text-green-600' },
  in_progress: { label: 'Đang thực hiện', icon: Clock, color: 'text-blue-600' },
  pending: { label: 'Chờ xử lý', icon: Circle, color: 'text-gray-500' },
  overdue: { label: 'Quá hạn', icon: AlertCircle, color: 'text-red-600' },
};

const jobFormSchema = z.object({
  title: z.string().min(1, 'Tên công việc không được để trống').max(200),
  project: z.string().min(1, 'Tên dự án không được để trống').max(100),
  department: z.string().min(1, 'Phòng ban không được để trống').max(100),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['completed', 'in_progress', 'pending', 'overdue']),
  startDate: z.date({ required_error: 'Vui lòng chọn ngày bắt đầu' }),
  dueDate: z.date({ required_error: 'Vui lòng chọn hạn hoàn thành' }),
  progress: z.number().min(0).max(100),
  assignedBy: z.string().min(1, 'Người giao việc không được để trống').max(100),
  description: z.string().max(1000).optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export function EmployeeJobList() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>(initialMockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      project: '',
      department: '',
      priority: 'medium',
      status: 'pending',
      progress: 0,
      assignedBy: '',
      description: '',
    },
  });

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: jobs.length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    inProgress: jobs.filter((j) => j.status === 'in_progress').length,
    overdue: jobs.filter((j) => j.status === 'overdue').length,
  };

  const handleAddJob = () => {
    setEditingJob(null);
    form.reset({
      title: '',
      project: '',
      department: '',
      priority: 'medium',
      status: 'pending',
      progress: 0,
      assignedBy: '',
      description: '',
    });
    setIsDialogOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    form.reset({
      title: job.title,
      project: job.project,
      department: job.department,
      priority: job.priority,
      status: job.status,
      startDate: parse(job.startDate, 'dd/MM/yyyy', new Date()),
      dueDate: parse(job.dueDate, 'dd/MM/yyyy', new Date()),
      progress: job.progress,
      assignedBy: job.assignedBy,
      description: job.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleViewJob = (job: Job) => {
    setViewingJob(job);
    setIsViewDialogOpen(true);
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(jobs.filter((j) => j.id !== jobId));
    toast({
      title: t('employeeProfile.jobs.deleteSuccess'),
      description: t('employeeProfile.jobs.deleteSuccessDesc'),
    });
  };

  const onSubmit = (values: JobFormValues) => {
    const formattedJob: Job = {
      id: editingJob ? editingJob.id : crypto.randomUUID(),
      title: values.title,
      project: values.project,
      department: values.department,
      priority: values.priority,
      status: values.status,
      startDate: format(values.startDate, 'dd/MM/yyyy'),
      dueDate: format(values.dueDate, 'dd/MM/yyyy'),
      progress: values.progress,
      assignedBy: values.assignedBy,
      description: values.description,
    };

    if (editingJob) {
      setJobs(jobs.map((j) => (j.id === editingJob.id ? formattedJob : j)));
      toast({
        title: t('employeeProfile.jobs.updateSuccess'),
        description: t('employeeProfile.jobs.updateSuccessDesc'),
      });
    } else {
      setJobs([formattedJob, ...jobs]);
      toast({
        title: t('employeeProfile.jobs.addSuccess'),
        description: t('employeeProfile.jobs.addSuccessDesc'),
      });
    }

    setIsDialogOpen(false);
    form.reset();
  };

  const priorityLabels: Record<string, string> = {
    high: t('employeeProfile.jobs.priorityHigh'),
    medium: t('employeeProfile.jobs.priorityMedium'),
    low: t('employeeProfile.jobs.priorityLow'),
  };

  const statusLabels: Record<string, string> = {
    completed: t('employeeProfile.jobs.statusCompleted'),
    in_progress: t('employeeProfile.jobs.statusInProgress'),
    pending: t('employeeProfile.jobs.statusPending'),
    overdue: t('employeeProfile.jobs.statusOverdue'),
  };

  const handleExportExcel = () => {
    const exportData = filteredJobs.map((job) => ({
      [t('employeeProfile.jobs.jobTitle')]: job.title,
      [t('employeeProfile.jobs.project')]: job.project,
      [t('employeeProfile.jobs.department')]: job.department,
      [t('employeeProfile.jobs.priority')]: priorityLabels[job.priority],
      [t('employeeProfile.jobs.status')]: statusLabels[job.status],
      [t('employeeProfile.jobs.startDate')]: job.startDate,
      [t('employeeProfile.jobs.dueDate')]: job.dueDate,
      [t('employeeProfile.jobs.progress')]: `${job.progress}%`,
      [t('employeeProfile.jobs.assignedBy')]: job.assignedBy,
      [t('employeeProfile.jobs.description')]: job.description || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('employeeProfile.jobs.jobList'));
    
    // Auto-fit column widths
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length + 2, 15),
    }));
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `job-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({
      title: t('employeeProfile.jobs.exportSuccess'),
      description: t('employeeProfile.jobs.exportExcelSuccessDesc'),
    });
  };

  const handleExportPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="text-align: center; color: #1a1a1a; margin-bottom: 20px;">
          ${t('employeeProfile.jobs.jobList')}
        </h1>
        <p style="text-align: center; color: #666; margin-bottom: 30px;">
          ${t('employeeProfile.jobs.exportDate')}: ${format(new Date(), 'dd/MM/yyyy HH:mm')}
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left;">${t('employeeProfile.jobs.jobTitle')}</th>
              <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left;">${t('employeeProfile.jobs.project')}</th>
              <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left;">${t('employeeProfile.jobs.priority')}</th>
              <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left;">${t('employeeProfile.jobs.status')}</th>
              <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left;">${t('employeeProfile.jobs.dueDate')}</th>
              <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left;">${t('employeeProfile.jobs.progress')}</th>
            </tr>
          </thead>
          <tbody>
            ${filteredJobs.map((job) => `
              <tr>
                <td style="border: 1px solid #e5e7eb; padding: 8px;">
                  <strong>${job.title}</strong><br/>
                  <span style="color: #666; font-size: 10px;">${t('employeeProfile.jobs.assignedBy')}: ${job.assignedBy}</span>
                </td>
                <td style="border: 1px solid #e5e7eb; padding: 8px;">
                  ${job.project}<br/>
                  <span style="color: #666; font-size: 10px;">${job.department}</span>
                </td>
                <td style="border: 1px solid #e5e7eb; padding: 8px;">
                  <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; background-color: ${
                    job.priority === 'high' ? '#fee2e2' : job.priority === 'medium' ? '#fef3c7' : '#dcfce7'
                  }; color: ${
                    job.priority === 'high' ? '#dc2626' : job.priority === 'medium' ? '#d97706' : '#16a34a'
                  };">
                    ${priorityLabels[job.priority]}
                  </span>
                </td>
                <td style="border: 1px solid #e5e7eb; padding: 8px;">
                  <span style="color: ${
                    job.status === 'completed' ? '#16a34a' : 
                    job.status === 'in_progress' ? '#2563eb' : 
                    job.status === 'overdue' ? '#dc2626' : '#6b7280'
                  };">
                    ${statusLabels[job.status]}
                  </span>
                </td>
                <td style="border: 1px solid #e5e7eb; padding: 8px;">${job.dueDate}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="flex: 1; background-color: #e5e7eb; border-radius: 9999px; height: 8px;">
                      <div style="width: ${job.progress}%; background-color: ${
                        job.progress >= 80 ? '#16a34a' : job.progress >= 50 ? '#2563eb' : '#d97706'
                      }; height: 100%; border-radius: 9999px;"></div>
                    </div>
                    <span style="font-size: 11px;">${job.progress}%</span>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
          <h3 style="margin-bottom: 10px; color: #1a1a1a;">${t('employeeProfile.jobs.chartOverview')}</h3>
          <div style="display: flex; gap: 20px;">
            <div>
              <strong>${t('employeeProfile.jobs.totalJobs')}:</strong> ${stats.total}
            </div>
            <div>
              <strong>${t('employeeProfile.jobs.completed')}:</strong> ${stats.completed}
            </div>
            <div>
              <strong>${t('employeeProfile.jobs.inProgress')}:</strong> ${stats.inProgress}
            </div>
            <div>
              <strong>${t('employeeProfile.jobs.overdue')}:</strong> ${stats.overdue}
            </div>
          </div>
        </div>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `job-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'landscape' as const },
    };

    html2pdf().set(opt).from(element).save();
    toast({
      title: t('employeeProfile.jobs.exportSuccess'),
      description: t('employeeProfile.jobs.exportPdfSuccessDesc'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{t('employeeProfile.jobs.totalJobs')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">{t('employeeProfile.jobs.completed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">{t('employeeProfile.jobs.inProgress')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">{t('employeeProfile.jobs.overdue')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      <EmployeeJobProgressChart jobs={jobs} />

      {/* Job List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              {t('employeeProfile.jobs.jobList')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2">
                    <FileDown className="w-4 h-4" />
                    {t('common.export')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportExcel} className="gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    {t('employeeProfile.jobs.exportExcel')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF} className="gap-2">
                    <FileText className="w-4 h-4" />
                    {t('employeeProfile.jobs.exportPdf')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" className="gap-2" onClick={handleAddJob}>
                <Plus className="w-4 h-4" />
                {t('employeeProfile.jobs.addJob')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('employeeProfile.jobs.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder={t('employeeProfile.jobs.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('employeeProfile.jobs.allStatus')}</SelectItem>
                <SelectItem value="completed">{t('employeeProfile.jobs.statusCompleted')}</SelectItem>
                <SelectItem value="in_progress">{t('employeeProfile.jobs.statusInProgress')}</SelectItem>
                <SelectItem value="pending">{t('employeeProfile.jobs.statusPending')}</SelectItem>
                <SelectItem value="overdue">{t('employeeProfile.jobs.statusOverdue')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder={t('employeeProfile.jobs.priority')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('employeeProfile.jobs.allPriority')}</SelectItem>
                <SelectItem value="high">{t('employeeProfile.jobs.priorityHigh')}</SelectItem>
                <SelectItem value="medium">{t('employeeProfile.jobs.priorityMedium')}</SelectItem>
                <SelectItem value="low">{t('employeeProfile.jobs.priorityLow')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">{t('employeeProfile.jobs.jobTitle')}</TableHead>
                  <TableHead>{t('employeeProfile.jobs.project')}</TableHead>
                  <TableHead>{t('employeeProfile.jobs.priority')}</TableHead>
                  <TableHead>{t('employeeProfile.jobs.status')}</TableHead>
                  <TableHead>{t('employeeProfile.jobs.dueDate')}</TableHead>
                  <TableHead>{t('employeeProfile.jobs.progress')}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t('employeeProfile.jobs.noJobs')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => {
                    const StatusIcon = statusConfig[job.status].icon;
                    return (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{job.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {t('employeeProfile.jobs.assignedBy')}: {job.assignedBy}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{job.project}</p>
                            <p className="text-xs text-muted-foreground">{job.department}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs', priorityConfig[job.priority].color)}>
                            {priorityConfig[job.priority].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={cn('w-4 h-4', statusConfig[job.status].color)} />
                            <span className="text-sm">{statusConfig[job.status].label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            {job.dueDate}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  job.progress === 100
                                    ? 'bg-green-500'
                                    : job.status === 'overdue'
                                    ? 'bg-red-500'
                                    : 'bg-blue-500'
                                )}
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{job.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2" onClick={() => handleViewJob(job)}>
                                <Eye className="w-4 h-4" />
                                {t('employeeProfile.jobs.view')}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => handleEditJob(job)}>
                                <Edit className="w-4 h-4" />
                                {t('employeeProfile.jobs.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-red-600" onClick={() => handleDeleteJob(job.id)}>
                                <Trash2 className="w-4 h-4" />
                                {t('employeeProfile.jobs.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Job Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? t('employeeProfile.jobs.editJob') : t('employeeProfile.jobs.addJob')}
            </DialogTitle>
            <DialogDescription>
              {editingJob ? t('employeeProfile.jobs.editJobDesc') : t('employeeProfile.jobs.addJobDesc')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t('employeeProfile.jobs.jobTitle')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('employeeProfile.jobs.jobTitlePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="project"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('employeeProfile.jobs.project')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('employeeProfile.jobs.projectPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('employeeProfile.jobs.department')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('employeeProfile.jobs.departmentPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('employeeProfile.jobs.priority')} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('employeeProfile.jobs.selectPriority')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">{t('employeeProfile.jobs.priorityHigh')}</SelectItem>
                          <SelectItem value="medium">{t('employeeProfile.jobs.priorityMedium')}</SelectItem>
                          <SelectItem value="low">{t('employeeProfile.jobs.priorityLow')}</SelectItem>
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
                      <FormLabel>{t('employeeProfile.jobs.status')} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('employeeProfile.jobs.selectStatus')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">{t('employeeProfile.jobs.statusPending')}</SelectItem>
                          <SelectItem value="in_progress">{t('employeeProfile.jobs.statusInProgress')}</SelectItem>
                          <SelectItem value="completed">{t('employeeProfile.jobs.statusCompleted')}</SelectItem>
                          <SelectItem value="overdue">{t('employeeProfile.jobs.statusOverdue')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('employeeProfile.jobs.startDate')} *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'dd/MM/yyyy') : t('employeeProfile.jobs.pickDate')}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('employeeProfile.jobs.dueDate')} *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'dd/MM/yyyy') : t('employeeProfile.jobs.pickDate')}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('employeeProfile.jobs.assignedBy')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('employeeProfile.jobs.assignedByPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="progress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('employeeProfile.jobs.progress')}: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={5}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="mt-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t('employeeProfile.jobs.description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('employeeProfile.jobs.descriptionPlaceholder')}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">
                  {editingJob ? t('common.save') : t('common.add')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Job Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('employeeProfile.jobs.viewDetail')}</DialogTitle>
          </DialogHeader>

          {viewingJob && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{viewingJob.title}</h3>
                <p className="text-sm text-muted-foreground">{viewingJob.project} • {viewingJob.department}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('employeeProfile.jobs.priority')}</p>
                  <Badge className={cn('mt-1', priorityConfig[viewingJob.priority].color)}>
                    {priorityConfig[viewingJob.priority].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('employeeProfile.jobs.status')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const StatusIcon = statusConfig[viewingJob.status].icon;
                      return <StatusIcon className={cn('w-4 h-4', statusConfig[viewingJob.status].color)} />;
                    })()}
                    <span>{statusConfig[viewingJob.status].label}</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('employeeProfile.jobs.startDate')}</p>
                  <p className="font-medium">{viewingJob.startDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('employeeProfile.jobs.dueDate')}</p>
                  <p className="font-medium">{viewingJob.dueDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('employeeProfile.jobs.assignedBy')}</p>
                  <p className="font-medium">{viewingJob.assignedBy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('employeeProfile.jobs.progress')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          viewingJob.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        )}
                        style={{ width: `${viewingJob.progress}%` }}
                      />
                    </div>
                    <span className="text-sm">{viewingJob.progress}%</span>
                  </div>
                </div>
              </div>

              {viewingJob.description && (
                <div>
                  <p className="text-muted-foreground text-sm">{t('employeeProfile.jobs.description')}</p>
                  <p className="mt-1">{viewingJob.description}</p>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  {t('common.close')}
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEditJob(viewingJob);
                }}>
                  {t('employeeProfile.jobs.edit')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
