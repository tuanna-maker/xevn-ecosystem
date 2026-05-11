import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { enUS, vi, zhCN } from 'date-fns/locale';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Building2,
  Users,
  CalendarIcon,
  MoreHorizontal,
  AlertCircle,
  Download,
  Briefcase,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface HeadcountProposal {
  id: string;
  title: string;
  department: string;
  position_name: string;
  current_headcount: number;
  requested_headcount: number;
  proposal_type: 'new' | 'replacement' | 'expansion';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  justification: string | null;
  expected_start_date: string | null;
  salary_budget_min: number | null;
  salary_budget_max: number | null;
  job_description: string | null;
  requirements: string | null;
  requested_by: string;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  pending: { labelKey: 'status.pending', icon: Clock, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  approved: { labelKey: 'status.approved', icon: CheckCircle, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  rejected: { labelKey: 'status.rejected', icon: XCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  cancelled: { labelKey: 'status.cancelled', icon: AlertCircle, color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
};

const priorityConfig = {
  high: { labelKey: 'priority.high', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  medium: { labelKey: 'priority.medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  low: { labelKey: 'priority.low', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

const proposalTypeConfig = {
  new: { labelKey: 'proposalType.new', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  replacement: { labelKey: 'proposalType.replacement', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  expansion: { labelKey: 'proposalType.expansion', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
};

interface LinkedJobPosting {
  id: string;
  title: string;
  status: string;
  applied_count: number | null;
  headcount: number;
}

export function HeadcountProposalTab() {
  const { t, i18n } = useTranslation();
  const hpFallbacks: Record<string, Record<string, string>> = {
    vi: {
      'status.pending': 'Chờ duyệt',
      'status.approved': 'Đã duyệt',
      'status.rejected': 'Từ chối',
      'status.cancelled': 'Đã hủy',
      'priority.high': 'Cao',
      'priority.medium': 'Trung bình',
      'priority.low': 'Thấp',
      'proposalType.new': 'Phát sinh mới',
      'proposalType.replacement': 'Thay thế nhân sự',
      'proposalType.expansion': 'Tăng cường đột xuất',
      'stats.total': 'Tổng đề xuất',
      'stats.totalRequested': 'Tổng nhân sự đề xuất',
      'list.title': 'Danh sách đề xuất ngoài định biên',
      'list.noData': 'Chưa có dữ liệu',
      'actions.exportExcel': 'Xuất Excel',
      'actions.createProposal': 'Tạo đề xuất',
      'filters.search': 'Tìm kiếm...',
      'filters.status': 'Trạng thái',
      'filters.all': 'Tất cả',
      'table.title': 'Tiêu đề',
      'table.department': 'Phòng ban',
      'table.position': 'Vị trí',
      'table.headcount': 'Số lượng',
      'table.type': 'Loại',
      'table.priority': 'Ưu tiên',
      'table.status': 'Trạng thái',
      'table.jobPosting': 'Tin tuyển dụng',
      'table.requestedBy': 'Người đề xuất',
      'validation.titleRequired': 'Tiêu đề không được để trống',
      'validation.departmentRequired': 'Phòng ban không được để trống',
      'validation.positionRequired': 'Vị trí không được để trống',
      'validation.requestedHeadcountMin': 'Số lượng phải lớn hơn 0',
      'validation.requestedByRequired': 'Người đề xuất không được để trống',
      'toast.fetchError': 'Không thể tải danh sách đề xuất tuyển dụng ngoài định biên',
    },
    en: {
      'status.pending': 'Pending',
      'status.approved': 'Approved',
      'status.rejected': 'Rejected',
      'status.cancelled': 'Cancelled',
      'priority.high': 'High',
      'priority.medium': 'Medium',
      'priority.low': 'Low',
      'proposalType.new': 'New Demand',
      'proposalType.replacement': 'Replacement',
      'proposalType.expansion': 'Urgent Expansion',
      'stats.total': 'Total proposals',
      'stats.totalRequested': 'Total requested headcount',
      'list.title': 'Out-of-plan proposal list',
      'list.noData': 'No data available',
      'actions.exportExcel': 'Export Excel',
      'actions.createProposal': 'Create proposal',
      'filters.search': 'Search...',
      'filters.status': 'Status',
      'filters.all': 'All',
      'table.title': 'Title',
      'table.department': 'Department',
      'table.position': 'Position',
      'table.headcount': 'Headcount',
      'table.type': 'Type',
      'table.priority': 'Priority',
      'table.status': 'Status',
      'table.jobPosting': 'Job posting',
      'table.requestedBy': 'Requested by',
      'validation.titleRequired': 'Title is required',
      'validation.departmentRequired': 'Department is required',
      'validation.positionRequired': 'Position is required',
      'validation.requestedHeadcountMin': 'Requested headcount must be greater than 0',
      'validation.requestedByRequired': 'Requester is required',
      'toast.fetchError': 'Failed to load out-of-plan proposals',
    },
    lo: {
      'status.pending': 'ລໍຖ້າອະນຸມັດ',
      'status.approved': 'ອະນຸມັດແລ້ວ',
      'status.rejected': 'ປະຕິເສດ',
      'status.cancelled': 'ຍົກເລີກ',
      'priority.high': 'ສູງ',
      'priority.medium': 'ກາງ',
      'priority.low': 'ຕ່ຳ',
      'proposalType.new': 'ຄວາມຕ້ອງການໃໝ່',
      'proposalType.replacement': 'ທົດແທນ',
      'proposalType.expansion': 'ເສີມດ່ວນ',
      'stats.total': 'ລວມຂໍ້ສະເໜີ',
      'stats.totalRequested': 'ລວມຈຳນວນທີ່ຂໍ',
      'list.title': 'ລາຍການຂໍ້ສະເໜີນອກແຜນ',
      'list.noData': 'ຍັງບໍ່ມີຂໍ້ມູນ',
      'actions.exportExcel': 'ສົ່ງອອກ Excel',
      'actions.createProposal': 'ສ້າງຂໍ້ສະເໜີ',
      'filters.search': 'ຄົ້ນຫາ...',
      'filters.status': 'ສະຖານະ',
      'filters.all': 'ທັງໝົດ',
      'table.title': 'ຫົວຂໍ້',
      'table.department': 'ພະແນກ',
      'table.position': 'ຕຳແໜ່ງ',
      'table.headcount': 'ຈຳນວນ',
      'table.type': 'ປະເພດ',
      'table.priority': 'ຄວາມສຳຄັນ',
      'table.status': 'ສະຖານະ',
      'table.jobPosting': 'ປະກາດຮັບສະໝັກ',
      'table.requestedBy': 'ຜູ້ສະເໜີ',
      'toast.fetchError': 'ບໍ່ສາມາດໂຫຼດລາຍການຂໍ້ສະເໜີໄດ້',
    },
    km: {
      'status.pending': 'រង់ចាំអនុម័ត',
      'status.approved': 'បានអនុម័ត',
      'status.rejected': 'បានបដិសេធ',
      'status.cancelled': 'បានបោះបង់',
      'priority.high': 'ខ្ពស់',
      'priority.medium': 'មធ្យម',
      'priority.low': 'ទាប',
      'proposalType.new': 'តម្រូវការថ្មី',
      'proposalType.replacement': 'ជំនួស',
      'proposalType.expansion': 'ពង្រីកបន្ទាន់',
      'toast.fetchError': 'មិនអាចផ្ទុកបញ្ជីសំណើបានទេ',
    },
    my: {
      'status.pending': 'အတည်ပြုရန်စောင့်',
      'status.approved': 'အတည်ပြုပြီး',
      'status.rejected': 'ပယ်ချ',
      'status.cancelled': 'ပယ်ဖျက်ပြီး',
      'priority.high': 'မြင့်',
      'priority.medium': 'အလယ်အလတ်',
      'priority.low': 'နိမ့်',
      'proposalType.new': 'လိုအပ်ချက်အသစ်',
      'proposalType.replacement': 'အစားထိုး',
      'proposalType.expansion': 'အရေးပေါ်တိုးချဲ့',
      'toast.fetchError': 'အဆိုပြုစာရင်းကို မဖတ်နိုင်ပါ',
    },
    zh: {
      'status.pending': '待审批',
      'status.approved': '已批准',
      'status.rejected': '已拒绝',
      'status.cancelled': '已取消',
      'priority.high': '高',
      'priority.medium': '中',
      'priority.low': '低',
      'proposalType.new': '新增需求',
      'proposalType.replacement': '人员替补',
      'proposalType.expansion': '紧急扩编',
      'toast.fetchError': '无法加载编外招聘提案列表',
    },
  };

  const hp = (key: string, options?: Record<string, any>) => {
    const fullKey = `recruitment.hp.${key}`;
    const translated = String(t(fullKey, options));
    if (translated !== fullKey) return translated;

    const currentLang = ['vi', 'en', 'lo', 'km', 'my', 'zh'].includes(i18n.language)
      ? i18n.language
      : i18n.language.split('-')[0];

    const fallback = hpFallbacks[currentLang]?.[key] || hpFallbacks.vi[key] || key;
    return fallback;
  };
  const [proposals, setProposals] = useState<HeadcountProposal[]>([]);
  const [linkedJobPostings, setLinkedJobPostings] = useState<Record<string, LinkedJobPosting>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<HeadcountProposal | null>(null);
  const [viewingProposal, setViewingProposal] = useState<HeadcountProposal | null>(null);

  const proposalFormSchema = useMemo(() => z.object({
    title: z.string().min(1, hp('validation.titleRequired')).max(200),
    department: z.string().min(1, hp('validation.departmentRequired')).max(100),
    position_name: z.string().min(1, hp('validation.positionRequired')).max(100),
    current_headcount: z.number().min(0),
    requested_headcount: z.number().min(1, hp('validation.requestedHeadcountMin')),
    proposal_type: z.enum(['new', 'replacement', 'expansion']),
    priority: z.enum(['high', 'medium', 'low']),
    justification: z.string().max(2000).optional(),
    expected_start_date: z.date().optional(),
    salary_budget_min: z.number().optional(),
    salary_budget_max: z.number().optional(),
    job_description: z.string().max(5000).optional(),
    requirements: z.string().max(3000).optional(),
    requested_by: z.string().min(1, hp('validation.requestedByRequired')).max(100),
    notes: z.string().max(1000).optional(),
  }), [t]);

  type ProposalFormValues = z.infer<typeof proposalFormSchema>;

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      title: '',
      department: '',
      position_name: '',
      current_headcount: 0,
      requested_headcount: 1,
      proposal_type: 'new',
      priority: 'medium',
      justification: '',
      requested_by: '',
      notes: '',
    },
  });

  const dateLocale = useMemo(() => {
    switch (i18n.language) {
      case 'vi':
        return vi;
      case 'zh':
        return zhCN;
      default:
        return enUS;
    }
  }, [i18n.language]);

  const formatNumber = (value: number | null | undefined) => {
    if (value == null) return '';
    return new Intl.NumberFormat(i18n.language).format(value);
  };

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('headcount_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals((data as HeadcountProposal[]) || []);

      // Fetch linked job postings
      if (data && data.length > 0) {
        const proposalIds = data.map((p) => p.id);
        const { data: jobPostingsData, error: jpError } = await supabase
          .from('job_postings')
          .select('id, title, status, applied_count, headcount, source_proposal_id')
          .in('source_proposal_id', proposalIds);

        if (!jpError && jobPostingsData) {
          const jobPostingsMap: Record<string, LinkedJobPosting> = {};
          jobPostingsData.forEach((jp: any) => {
            if (jp.source_proposal_id) {
              jobPostingsMap[jp.source_proposal_id] = {
                id: jp.id,
                title: jp.title,
                status: jp.status,
                applied_count: jp.applied_count,
                headcount: jp.headcount,
              };
            }
          });
          setLinkedJobPostings(jobPostingsMap);
        }
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast({
        title: t('common.error'),
        description: hp('toast.fetchError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.position_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: proposals.length,
    pending: proposals.filter((p) => p.status === 'pending').length,
    approved: proposals.filter((p) => p.status === 'approved').length,
    rejected: proposals.filter((p) => p.status === 'rejected').length,
    totalRequested: proposals.reduce((acc, p) => acc + p.requested_headcount, 0),
  };

  const handleExportExcel = () => {
    // Prepare main data sheet
    const mainData = proposals.map((p) => ({
      'Tiêu đề': p.title,
      'Phòng ban': p.department,
      'Vị trí': p.position_name,
      'Loại đề xuất': hp(proposalTypeConfig[p.proposal_type].labelKey),
      'Định biên hiện tại': p.current_headcount,
      'Số lượng đề xuất': p.requested_headcount,
      'Mức độ ưu tiên': hp(priorityConfig[p.priority].labelKey),
      'Trạng thái': hp(statusConfig[p.status].labelKey),
      'Người đề xuất': p.requested_by,
      'Ngày dự kiến': p.expected_start_date ? format(new Date(p.expected_start_date), 'dd/MM/yyyy') : '',
      'Ngân sách tối thiểu': p.salary_budget_min || '',
      'Ngân sách tối đa': p.salary_budget_max || '',
      'Lý do đề xuất': p.justification || '',
      'Người duyệt': p.approved_by || '',
      'Ngày duyệt': p.approved_at ? format(new Date(p.approved_at), 'dd/MM/yyyy HH:mm') : '',
      'Lý do từ chối': p.rejected_reason || '',
      'Ghi chú': p.notes || '',
      'Ngày tạo': format(new Date(p.created_at), 'dd/MM/yyyy HH:mm'),
    }));

    // Statistics by department
    const departmentStats: Record<string, { total: number; pending: number; approved: number; rejected: number; cancelled: number; totalHeadcount: number }> = {};
    proposals.forEach((p) => {
      if (!departmentStats[p.department]) {
        departmentStats[p.department] = { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0, totalHeadcount: 0 };
      }
      departmentStats[p.department].total++;
      departmentStats[p.department][p.status]++;
      departmentStats[p.department].totalHeadcount += p.requested_headcount;
    });

    const departmentData = Object.entries(departmentStats).map(([dept, stats]) => ({
      'Phòng ban': dept,
      'Tổng đề xuất': stats.total,
      'Chờ duyệt': stats.pending,
      'Đã duyệt': stats.approved,
      'Từ chối': stats.rejected,
      'Đã hủy': stats.cancelled,
      'Tổng nhân sự đề xuất': stats.totalHeadcount,
      'Tỷ lệ duyệt (%)': stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0,
    }));

    // Statistics by status
    const statusData = [
      { 'Trạng thái': 'Chờ duyệt', 'Số lượng': stats.pending, 'Tỷ lệ (%)': stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0 },
      { 'Trạng thái': 'Đã duyệt', 'Số lượng': stats.approved, 'Tỷ lệ (%)': stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0 },
      { 'Trạng thái': 'Từ chối', 'Số lượng': stats.rejected, 'Tỷ lệ (%)': stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0 },
      { 'Trạng thái': 'Đã hủy', 'Số lượng': proposals.filter(p => p.status === 'cancelled').length, 'Tỷ lệ (%)': stats.total > 0 ? Math.round((proposals.filter(p => p.status === 'cancelled').length / stats.total) * 100) : 0 },
    ];

    // Summary statistics
    const summaryData = [
      { 'Chỉ tiêu': 'Tổng số đề xuất ngoài định biên', 'Giá trị': stats.total },
      { 'Chỉ tiêu': 'Tổng nhân sự đề xuất', 'Giá trị': stats.totalRequested },
      { 'Chỉ tiêu': 'Số phòng ban có đề xuất', 'Giá trị': Object.keys(departmentStats).length },
      { 'Chỉ tiêu': 'Tỷ lệ duyệt tổng thể (%)', 'Giá trị': stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0 },
      { 'Chỉ tiêu': 'Ngày xuất báo cáo', 'Giá trị': format(new Date(), 'dd/MM/yyyy HH:mm') },
    ];

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    const ws1 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');
    
    const ws2 = XLSX.utils.json_to_sheet(statusData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Thống kê theo trạng thái');
    
    const ws3 = XLSX.utils.json_to_sheet(departmentData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Thống kê theo phòng ban');
    
    const ws4 = XLSX.utils.json_to_sheet(mainData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Chi tiết đề xuất');

    // Set column widths
    const setColWidths = (ws: XLSX.WorkSheet, widths: number[]) => {
      ws['!cols'] = widths.map(w => ({ wch: w }));
    };
    setColWidths(ws1, [35, 20]);
    setColWidths(ws2, [15, 12, 12]);
    setColWidths(ws3, [25, 12, 12, 12, 12, 12, 18, 15]);
    setColWidths(ws4, [30, 20, 20, 18, 15, 15, 15, 12, 20, 15, 18, 18, 40, 15, 18, 30, 30, 18]);

    // Download file
    XLSX.writeFile(wb, `Bao-cao-de-xuat-ngoai-dinh-bien_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
    
    toast({
      title: 'Thành công',
      description: 'Đã xuất báo cáo đề xuất ngoài định biên ra file Excel',
    });
  };

  const handleConvertToJobPosting = async (proposal: HeadcountProposal) => {
    if (proposal.status !== 'approved') {
      toast({
        title: 'Không thể chuyển đổi',
        description: 'Chỉ có thể chuyển đổi đề xuất đã được phê duyệt thành tin tuyển dụng',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Map priority from proposal to job posting
      const priorityMapping: Record<string, string> = {
        high: 'urgent',
        medium: 'normal',
        low: 'low',
      };

      // Get company_id from the proposal
      const { data: proposalData, error: fetchError } = await supabase
        .from('headcount_proposals')
        .select('company_id')
        .eq('id', proposal.id)
        .single();

      if (fetchError || !proposalData?.company_id) {
        throw new Error('Could not get company_id from proposal');
      }

      const jobPostingData = {
        title: `Tuyển dụng ${proposal.position_name} - ${proposal.department}`,
        position: proposal.position_name,
        department: proposal.department,
        headcount: proposal.requested_headcount,
        description: proposal.job_description || `Tuyển dụng ${proposal.position_name} cho ${proposal.department}. ${proposal.justification || ''}`,
        requirements: proposal.requirements || '',
        salary_min: proposal.salary_budget_min,
        salary_max: proposal.salary_budget_max,
        deadline: proposal.expected_start_date,
        priority: priorityMapping[proposal.priority] || 'normal',
        employment_type: 'full-time',
        status: 'active',
        is_salary_visible: true,
        company_id: proposalData.company_id,
        source_proposal_id: proposal.id,
      };

      const { error } = await supabase
        .from('job_postings')
        .insert([jobPostingData]);

      if (error) throw error;

      // Update linked job postings state
      await fetchProposals();

      toast({
        title: 'Thành công',
        description: `Đã tạo tin tuyển dụng "${jobPostingData.title}" từ đề xuất ngoài định biên`,
      });
    } catch (error) {
      console.error('Error converting to job posting:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo tin tuyển dụng từ đề xuất',
        variant: 'destructive',
      });
    }
  };

  const handleAddProposal = () => {
    setEditingProposal(null);
    form.reset({
      title: '',
      department: '',
      position_name: '',
      current_headcount: 0,
      requested_headcount: 1,
      proposal_type: 'new',
      priority: 'medium',
      justification: '',
      requested_by: '',
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleEditProposal = (proposal: HeadcountProposal) => {
    setEditingProposal(proposal);
    form.reset({
      title: proposal.title,
      department: proposal.department,
      position_name: proposal.position_name,
      current_headcount: proposal.current_headcount,
      requested_headcount: proposal.requested_headcount,
      proposal_type: proposal.proposal_type,
      priority: proposal.priority,
      justification: proposal.justification || '',
      expected_start_date: proposal.expected_start_date ? new Date(proposal.expected_start_date) : undefined,
      salary_budget_min: proposal.salary_budget_min || undefined,
      salary_budget_max: proposal.salary_budget_max || undefined,
      job_description: proposal.job_description || '',
      requirements: proposal.requirements || '',
      requested_by: proposal.requested_by,
      notes: proposal.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleViewProposal = (proposal: HeadcountProposal) => {
    setViewingProposal(proposal);
    setIsViewDialogOpen(true);
  };

  const handleDeleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('headcount_proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProposals(proposals.filter((p) => p.id !== id));
      toast({
        title: 'Thành công',
        description: 'Đã xóa đề xuất ngoài định biên',
      });
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa đề xuất',
        variant: 'destructive',
      });
    }
  };

  const handleApproveProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('headcount_proposals')
        .update({
          status: 'approved',
          approved_by: 'Admin',
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchProposals();
      toast({
        title: 'Thành công',
        description: 'Đã phê duyệt đề xuất ngoài định biên',
      });
    } catch (error) {
      console.error('Error approving proposal:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể phê duyệt đề xuất',
        variant: 'destructive',
      });
    }
  };

  const handleRejectProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('headcount_proposals')
        .update({
          status: 'rejected',
          approved_by: 'Admin',
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchProposals();
      toast({
        title: 'Thành công',
        description: 'Đã từ chối đề xuất ngoài định biên',
      });
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể từ chối đề xuất',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (values: ProposalFormValues) => {
    try {
      const proposalData = {
        title: values.title,
        department: values.department,
        position_name: values.position_name,
        current_headcount: values.current_headcount,
        requested_headcount: values.requested_headcount,
        proposal_type: values.proposal_type,
        priority: values.priority,
        justification: values.justification || null,
        expected_start_date: values.expected_start_date ? format(values.expected_start_date, 'yyyy-MM-dd') : null,
        salary_budget_min: values.salary_budget_min || null,
        salary_budget_max: values.salary_budget_max || null,
        job_description: values.job_description || null,
        requirements: values.requirements || null,
        requested_by: values.requested_by,
        notes: values.notes || null,
      };

      if (editingProposal) {
        const { error } = await supabase
          .from('headcount_proposals')
          .update(proposalData)
          .eq('id', editingProposal.id);

        if (error) throw error;

        toast({
          title: 'Thành công',
          description: 'Đã cập nhật đề xuất ngoài định biên',
        });
      } else {
        const { error } = await supabase
          .from('headcount_proposals')
          .insert([{ ...proposalData, status: 'pending' }]);

        if (error) throw error;

        toast({
          title: 'Thành công',
          description: 'Đã tạo đề xuất ngoài định biên mới',
        });
      }

      await fetchProposals();
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving proposal:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu đề xuất',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{hp('stats.total')}</p>
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
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">{hp('status.pending')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">{hp('status.approved')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">{hp('status.rejected')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRequested}</p>
                <p className="text-xs text-muted-foreground">{hp('stats.totalRequested')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proposal List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {hp('list.title')}
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2" onClick={handleExportExcel} disabled={proposals.length === 0}>
                <Download className="w-4 h-4" />
                {hp('actions.exportExcel')}
              </Button>
              <Button size="sm" className="gap-2" onClick={handleAddProposal}>
                <Plus className="w-4 h-4" />
                {hp('actions.createProposal')}
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
                placeholder={hp('filters.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder={hp('filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{hp('filters.all')}</SelectItem>
                <SelectItem value="pending">{hp('status.pending')}</SelectItem>
                <SelectItem value="approved">{hp('status.approved')}</SelectItem>
                <SelectItem value="rejected">{hp('status.rejected')}</SelectItem>
                <SelectItem value="cancelled">{hp('status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">{hp('table.title')}</TableHead>
                  <TableHead>{hp('table.department')}</TableHead>
                  <TableHead>{hp('table.position')}</TableHead>
                  <TableHead>{hp('table.headcount')}</TableHead>
                  <TableHead>{hp('table.type')}</TableHead>
                  <TableHead>{hp('table.priority')}</TableHead>
                  <TableHead>{hp('table.status')}</TableHead>
                  <TableHead>{hp('table.jobPosting')}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {t('common.loading')}
                    </TableCell>
                  </TableRow>
                ) : filteredProposals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {hp('list.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProposals.map((proposal) => {
                    const StatusIcon = statusConfig[proposal.status].icon;
                    return (
                      <TableRow key={proposal.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{proposal.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {hp('table.requestedBy')}: {proposal.requested_by}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {proposal.department}
                          </div>
                        </TableCell>
                        <TableCell>{proposal.position_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-primary">+{proposal.requested_headcount}</span>
                            <span className="text-xs text-muted-foreground">
                              (ĐB: {proposal.current_headcount})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs', proposalTypeConfig[proposal.proposal_type].color)}>
                            {hp(proposalTypeConfig[proposal.proposal_type].labelKey)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs', priorityConfig[proposal.priority].color)}>
                            {hp(priorityConfig[proposal.priority].labelKey)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={cn('w-4 h-4', 
                              proposal.status === 'approved' ? 'text-green-600' :
                              proposal.status === 'rejected' ? 'text-red-600' :
                              proposal.status === 'pending' ? 'text-yellow-600' : 'text-gray-500'
                            )} />
                            <Badge className={cn('text-xs', statusConfig[proposal.status].color)}>
                              {hp(statusConfig[proposal.status].labelKey)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {linkedJobPostings[proposal.id] ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-600" />
                                <Badge className={cn('text-xs',
                                  linkedJobPostings[proposal.id].status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  linkedJobPostings[proposal.id].status === 'closed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' :
                                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                )}>
                                  {linkedJobPostings[proposal.id].status === 'active' ? 'Đang tuyển' :
                                   linkedJobPostings[proposal.id].status === 'closed' ? 'Đã đóng' :
                                   linkedJobPostings[proposal.id].status === 'draft' ? 'Nháp' : linkedJobPostings[proposal.id].status}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {linkedJobPostings[proposal.id].applied_count || 0}/{linkedJobPostings[proposal.id].headcount} ứng viên
                              </div>
                            </div>
                          ) : proposal.status === 'approved' ? (
                            <span className="text-xs text-muted-foreground italic">Chưa tạo tin</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewProposal(proposal)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              {proposal.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEditProposal(proposal)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Chỉnh sửa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleApproveProposal(proposal.id)}>
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                    Phê duyệt
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRejectProposal(proposal.id)}>
                                    <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                    Từ chối
                                  </DropdownMenuItem>
                                </>
                              )}
                              {proposal.status === 'approved' && !linkedJobPostings[proposal.id] && (
                                <DropdownMenuItem onClick={() => handleConvertToJobPosting(proposal)}>
                                  <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                                  Tạo tin tuyển dụng
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDeleteProposal(proposal.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProposal ? 'Chỉnh sửa đề xuất ngoài định biên' : 'Tạo đề xuất tuyển dụng ngoài định biên'}
            </DialogTitle>
            <DialogDescription>
              Đề xuất này dành cho các nhu cầu tuyển dụng phát sinh ngoài kế hoạch định biên đã được phê duyệt
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tiêu đề đề xuất *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Đề xuất tuyển dụng ngoài kế hoạch - Nhân viên kinh doanh Q2/2026..." {...field} />
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
                      <FormLabel>Phòng ban *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Phòng Kinh doanh" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vị trí tuyển dụng *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Nhân viên kinh doanh" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="current_headcount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Định biên hiện tại (của vị trí)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0}
                          placeholder="Số định biên đã được phê duyệt"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requested_headcount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng tuyển thêm (ngoài định biên) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          placeholder="Số người cần tuyển thêm"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proposal_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại đề xuất *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại đề xuất" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">Phát sinh mới (chưa có định biên)</SelectItem>
                          <SelectItem value="replacement">Thay thế nhân sự (ngoài kế hoạch)</SelectItem>
                          <SelectItem value="expansion">Tăng cường đột xuất</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mức độ ưu tiên *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn mức độ ưu tiên" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">Cao</SelectItem>
                          <SelectItem value="medium">Trung bình</SelectItem>
                          <SelectItem value="low">Thấp</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expected_start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày bắt đầu dự kiến</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "dd/MM/yyyy") : "Chọn ngày"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
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
                  name="requested_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Người đề xuất *</FormLabel>
                      <FormControl>
                        <Input placeholder="Tên người đề xuất" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salary_budget_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngân sách lương (tối thiểu)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="VD: 10000000"
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salary_budget_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngân sách lương (tối đa)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="VD: 20000000"
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="justification"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Lý do đề xuất ngoài định biên *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Giải thích chi tiết lý do cần tuyển dụng phát sinh ngoài kế hoạch định biên đã được phê duyệt..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="job_description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Mô tả công việc</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Mô tả chi tiết công việc của vị trí này..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Yêu cầu ứng viên</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Các yêu cầu về kỹ năng, kinh nghiệm, bằng cấp..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ghi chú thêm..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">
                  {editingProposal ? 'Cập nhật' : 'Tạo đề xuất'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đề xuất định biên</DialogTitle>
          </DialogHeader>
          {viewingProposal && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{viewingProposal.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Đề xuất bởi: {viewingProposal.requested_by} • {format(new Date(viewingProposal.created_at), 'dd/MM/yyyy')}
                  </p>
                </div>
                <Badge className={cn('text-xs', statusConfig[viewingProposal.status].color)}>
                  {hp(statusConfig[viewingProposal.status].labelKey)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phòng ban</p>
                  <p className="font-medium">{viewingProposal.department}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Vị trí</p>
                  <p className="font-medium">{viewingProposal.position_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Số lượng đề xuất</p>
                  <p className="font-medium">{viewingProposal.requested_headcount} người</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Số lượng hiện tại</p>
                  <p className="font-medium">{viewingProposal.current_headcount} người</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Loại đề xuất</p>
                  <Badge className={cn('text-xs', proposalTypeConfig[viewingProposal.proposal_type].color)}>
                    {hp(proposalTypeConfig[viewingProposal.proposal_type].labelKey)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Mức độ ưu tiên</p>
                  <Badge className={cn('text-xs', priorityConfig[viewingProposal.priority].color)}>
                    {hp(priorityConfig[viewingProposal.priority].labelKey)}
                  </Badge>
                </div>
                {viewingProposal.expected_start_date && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Ngày bắt đầu dự kiến</p>
                    <p className="font-medium">{format(new Date(viewingProposal.expected_start_date), 'dd/MM/yyyy')}</p>
                  </div>
                )}
                {(viewingProposal.salary_budget_min || viewingProposal.salary_budget_max) && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Ngân sách lương</p>
                    <p className="font-medium">
                      {viewingProposal.salary_budget_min?.toLocaleString('vi-VN')} - {viewingProposal.salary_budget_max?.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                )}
              </div>

              {viewingProposal.justification && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Lý do đề xuất</p>
                  <p className="text-sm">{viewingProposal.justification}</p>
                </div>
              )}

              {viewingProposal.job_description && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Mô tả công việc</p>
                  <p className="text-sm whitespace-pre-wrap">{viewingProposal.job_description}</p>
                </div>
              )}

              {viewingProposal.requirements && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Yêu cầu ứng viên</p>
                  <p className="text-sm whitespace-pre-wrap">{viewingProposal.requirements}</p>
                </div>
              )}

              {viewingProposal.approved_by && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {viewingProposal.status === 'approved' ? 'Phê duyệt' : 'Xử lý'} bởi: {viewingProposal.approved_by}
                    {viewingProposal.approved_at && ` • ${format(new Date(viewingProposal.approved_at), 'dd/MM/yyyy HH:mm')}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
