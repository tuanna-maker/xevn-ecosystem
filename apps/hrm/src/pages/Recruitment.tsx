import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Plus,
  Search,
  LayoutDashboard,
  Users,
  FileText,
  Megaphone,
  Video,
  ClipboardCheck,
  CalendarClock,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Star,
  Mail,
  Phone,
  UserCheck,
  Edit,
  Eye,
  CalendarIcon,
  MapPin,
  DollarSign,
  Building2,
  Trash2,
  GripVertical,
  Check,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
// Job postings are managed by JobPostingsTab component with real DB data
import { useKanbanCandidates, KanbanCandidate } from '@/hooks/useKanbanCandidates';
import { useRecruitmentPlans, RecruitmentPlan } from '@/hooks/useRecruitmentPlans';
import { useCandidateEvaluations, CandidateEvaluation } from '@/hooks/useCandidateEvaluations';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { RecruitmentLineChart } from '@/components/recruitment/RecruitmentLineChart';
import { RecruitmentPieChart } from '@/components/recruitment/RecruitmentPieChart';
import { RecruitmentBarChart } from '@/components/recruitment/RecruitmentBarChart';
import { CampaignsTab } from '@/components/recruitment/CampaignsTab';
import { CandidateEvaluationDialog } from '@/components/recruitment/CandidateEvaluationDialog';
import { CandidateComparisonDialog } from '@/components/recruitment/CandidateComparisonDialog';
import { CandidateDetailView } from '@/components/recruitment/CandidateDetailView';
import { HeadcountProposalTab } from '@/components/recruitment/HeadcountProposalTab';
import { JobPostingsTab } from '@/components/recruitment/JobPostingsTab';
import { CandidateSourceStats } from '@/components/recruitment/CandidateSourceStats';
import { CandidatesTab } from '@/components/recruitment/CandidatesTab';
import { InterviewsTab } from '@/components/recruitment/InterviewsTab';
import { RecruitmentReportsTab } from '@/components/recruitment/RecruitmentReportsTab';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';

// Recruitment plan form schema
const recruitmentPlanSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề').max(200, 'Tiêu đề không quá 200 ký tự'),
  startMonth: z.string().min(1, 'Vui lòng chọn tháng bắt đầu'),
  endMonth: z.string().min(1, 'Vui lòng chọn tháng kết thúc'),
  year: z.string().min(1, 'Vui lòng chọn năm'),
  note: z.string().optional(),
});

type RecruitmentPlanFormValues = z.infer<typeof recruitmentPlanSchema>;

interface PlanPosition {
  id: string;
  name: string;
  months: { ns: number; dx: number }[];
}

interface PlanDepartment {
  id: string;
  name: string;
  positions: PlanPosition[];
}

// Job posting form schema
const jobPostingSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề').max(200, 'Tiêu đề không quá 200 ký tự'),
  department: z.string().min(1, 'Vui lòng chọn phòng ban'),
  location: z.string().min(1, 'Vui lòng nhập địa điểm').max(100, 'Địa điểm không quá 100 ký tự'),
  type: z.string().min(1, 'Vui lòng chọn loại hình'),
  openings: z.string().min(1, 'Vui lòng nhập số lượng'),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  deadline: z.date({ required_error: 'Vui lòng chọn hạn nộp hồ sơ' }),
  description: z.string().min(1, 'Vui lòng nhập mô tả công việc').max(5000, 'Mô tả không quá 5000 ký tự'),
  requirements: z.string().min(1, 'Vui lòng nhập yêu cầu').max(3000, 'Yêu cầu không quá 3000 ký tự'),
  benefits: z.string().optional(),
});

type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

// Top navigation tabs with colored icons - now using translation function
const getTopNavTabs = (t: any) => [
  { id: 'dashboard', label: t('recruitment.tabs.dashboard'), icon: LayoutDashboard, color: 'bg-blue-500' },
  { id: 'jobs', label: t('recruitment.tabs.jobs'), icon: Briefcase, color: 'bg-orange-500', hasDropdown: true },
  { id: 'candidates', label: t('recruitment.tabs.candidates'), icon: Users, color: 'bg-green-500', hasDropdown: true },
  { id: 'proposals', label: t('recruitment.tabs.proposals'), icon: FileText, color: 'bg-purple-500' },
  { id: 'campaigns', label: t('recruitment.tabs.campaigns'), icon: Megaphone, color: 'bg-pink-500' },
  { id: 'interviews', label: t('recruitment.tabs.interviews'), icon: Video, color: 'bg-red-500', hasDropdown: true },
  { id: 'evaluations', label: t('recruitment.tabs.evaluations'), icon: ClipboardCheck, color: 'bg-teal-500' },
  { id: 'plans', label: t('recruitment.tabs.plans'), icon: CalendarClock, color: 'bg-indigo-500' },
  { id: 'reports', label: t('recruitment.tabs.reports'), icon: BarChart3, color: 'bg-cyan-500' },
];

// Jobs submenu items
const getJobsMenuItems = (t: any) => [
  { id: 'all', label: t('recruitment.jobsMenu.all') },
  { id: 'active', label: t('recruitment.jobsMenu.active') },
  { id: 'expired', label: t('recruitment.jobsMenu.expired') },
  { id: 'draft', label: t('recruitment.jobsMenu.draft') },
];

// Candidates submenu items
const getCandidatesMenuItems = (t: any) => [
  { id: 'all', label: t('recruitment.candidatesMenu.all') },
  { id: 'new', label: t('recruitment.candidatesMenu.new') },
  { id: 'screening', label: t('recruitment.candidatesMenu.screening') },
  { id: 'interview', label: t('recruitment.candidatesMenu.interview') },
  { id: 'hired', label: t('recruitment.candidatesMenu.hired') },
];

// Interviews submenu items
const getInterviewsMenuItems = (t: any) => [
  { id: 'scheduled', label: t('recruitment.interviewsMenu.scheduled') },
  { id: 'completed', label: t('recruitment.interviewsMenu.completed') },
  { id: 'cancelled', label: t('recruitment.interviewsMenu.cancelled') },
];

// Mock data for staffing proposals
const staffingProposals = [
  {
    id: '1',
    title: 'Đề xuất định biên phòng kinh doanh 1 - HCM',
    period: '01/2023 - 12/2023',
    creator: 'Admin',
    createdDate: '11/09/2023',
    status: 'approved',
    departments: [
      {
        name: 'Phòng kinh doanh 1 - HCM',
        positions: [
          { name: 'Cố vấn cao cấp', data: [0, 1, 0, 2, 1, 0, 3, 0, 1, 0, 1, 0, 1] },
          { name: 'Bán hàng', data: [0, 1, 0, 2, 4, 0, 4, 0, 5, 0, 1, 0, 1] },
          { name: 'Nhân viên kinh doanh', data: [1, 4, 1, 1, 1, 1, 1, 1, 3, 1, 1, 2, 1] },
          { name: 'Chuyên viên Kinh doanh', data: [0, 15, 0, 21, 13, 0, 10, 0, 7, 0, 5, 0, 11] },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Đề xuất định biên phòng kỹ thuật - HN',
    period: '01/2024 - 06/2024',
    creator: 'HR Manager',
    createdDate: '15/01/2024',
    status: 'pending',
    departments: [],
  },
];

// Mock interview data
const interviewSchedules = [
  { id: '1', candidate: 'Nguyễn Văn A', position: 'Frontend Developer', date: '2024-01-15', time: '09:00', interviewer: 'Trần Thị B', status: 'scheduled' },
  { id: '2', candidate: 'Lê Văn C', position: 'Backend Developer', date: '2024-01-15', time: '14:00', interviewer: 'Phạm Văn D', status: 'completed' },
  { id: '3', candidate: 'Hoàng Thị E', position: 'UI/UX Designer', date: '2024-01-16', time: '10:00', interviewer: 'Nguyễn Văn F', status: 'scheduled' },
];

// Mock campaigns data
const recruitmentCampaigns = [
  { 
    id: '1', 
    name: 'Chiến dịch tuyển dụng 9/2023', 
    positions: 5, 
    applicants: 200, 
    status: 'active', 
    startDate: '01/09/2023', 
    endDate: '13/10/2023',
    owner: 'Lê Hoàng Nam',
    follower: 'Nguyễn Thị Diệp',
    description: 'Tìm nhân sự cho các phòng ban đang cần thêm người, để làm các dự án một cách kịp tiến độ. Đảm bảo các dự án đầu việc cần thực hiện trong các dự án này không bị chậm tiến độ.',
    position: 'Trưởng nhóm',
    title: 'Chuyên viên',
    department: 'HR',
    workType: 'Phỏng vấn Online',
    location: 'TP Hà Nội',
    evaluationCriteria: 'Chuyên viên',
    salaryLevel: 'Thỏa thuận',
    quantity: 'Không giới hạn',
    requirements: 'Tốt nghiệp đại học chuyên ngành liên quan',
    degree: 'Đại học',
    major: 'Chuyên ngành',
    funnelData: {
      total: 200,
      cvPass: 120,
      test: 20,
      cvFail: 80,
      interview: 40,
      hired: 15,
      hcns: 10
    },
    interviews: [
      { id: '1', date: '12/02/2023', time: '09:00 - 11:00', type: 'Phỏng vấn trưởng phòng', status: 'Lên kế hoạch', candidate: 'Nguyễn Văn A' },
      { id: '2', date: '11/02/2023', time: '09:00 - 11:00', type: 'Phỏng vấn nhân viên kinh doanh', status: 'Đã phỏng vấn', candidate: 'Trần Thị B' },
      { id: '3', date: '10/02/2023', time: '09:00 - 11:00', type: 'Phỏng vấn trưởng phòng thiết kế', status: 'Đã phỏng vấn', candidate: 'Lê Văn C' },
      { id: '4', date: '10/02/2023', time: '09:00 - 11:00', type: 'Phỏng vấn trưởng phòng', status: 'Hủy', candidate: 'Phạm Văn D' },
    ]
  },
  { 
    id: '2', 
    name: 'Chương trình Fresh Graduate', 
    positions: 10, 
    applicants: 120, 
    status: 'active', 
    startDate: '01/02/2024', 
    endDate: '30/04/2024',
    owner: 'Nguyễn Văn A',
    follower: 'Trần Thị B',
    description: 'Chương trình tuyển dụng sinh viên mới ra trường.',
    position: 'Nhân viên',
    title: 'Thực tập sinh',
    department: 'Kỹ thuật',
    workType: 'Phỏng vấn trực tiếp',
    location: 'TP HCM',
    evaluationCriteria: 'Nhân viên',
    salaryLevel: '8-12 triệu',
    quantity: '10',
    requirements: 'Sinh viên năm cuối hoặc mới tốt nghiệp',
    degree: 'Đại học',
    major: 'CNTT',
    funnelData: {
      total: 120,
      cvPass: 80,
      test: 15,
      cvFail: 40,
      interview: 30,
      hired: 10,
      hcns: 5
    },
    interviews: []
  },
  { 
    id: '3', 
    name: 'Tuyển dụng IT Senior', 
    positions: 3, 
    applicants: 15, 
    status: 'completed', 
    startDate: '01/11/2023', 
    endDate: '31/12/2023',
    owner: 'Phạm Văn C',
    follower: 'Hoàng Thị D',
    description: 'Tuyển dụng các vị trí IT Senior cho dự án mới.',
    position: 'Senior',
    title: 'Lập trình viên',
    department: 'Kỹ thuật',
    workType: 'Phỏng vấn Online',
    location: 'Remote',
    evaluationCriteria: 'Senior',
    salaryLevel: '30-50 triệu',
    quantity: '3',
    requirements: '5 năm kinh nghiệm trở lên',
    degree: 'Đại học',
    major: 'CNTT',
    funnelData: {
      total: 15,
      cvPass: 10,
      test: 5,
      cvFail: 5,
      interview: 8,
      hired: 3,
      hcns: 3
    },
    interviews: []
  },
];

// Mock recruitment plans data removed - now using useRecruitmentPlans hook


export default function Recruitment() {
  const location = useLocation();
  const portalEmbed = getHrmPortalMode(location.search);
  const { t } = useTranslation();
  const topNavTabs = getTopNavTabs(t);
  const jobsMenuItems = getJobsMenuItems(t);
  const candidatesMenuItems = getCandidatesMenuItems(t);
  const interviewsMenuItems = getInterviewsMenuItems(t);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeJobsType, setActiveJobsType] = useState('all');
  const [activeCandidatesType, setActiveCandidatesType] = useState('all');
  const [activeInterviewsType, setActiveInterviewsType] = useState('scheduled');
  const [selectedCandidate, setSelectedCandidate] = useState<KanbanCandidate | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<typeof staffingProposals[0] | null>(null);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<RecruitmentPlan | null>(null);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [isComparisonDialogOpen, setIsComparisonDialogOpen] = useState(false);
  const [evaluatingCandidate, setEvaluatingCandidate] = useState<KanbanCandidate | null>(null);
  const [planDepartments, setPlanDepartments] = useState<PlanDepartment[]>([
    {
      id: '1',
      name: 'Phòng Kinh doanh',
      positions: [
        { id: '1-1', name: 'Nhân viên kinh doanh', months: Array(12).fill({ ns: 0, dx: 0 }) },
      ],
    },
  ]);

  // Fetch candidates from Supabase for Dashboard Kanban
  const { 
    candidates, 
    loading: candidatesLoading, 
    updateCandidateStage,
    stats: candidateStats 
  } = useKanbanCandidates();

  // Fetch recruitment plans from Supabase
  const {
    plans: recruitmentPlans,
    loading: plansLoading,
    stats: planStats,
    createPlan,
  } = useRecruitmentPlans();

  // Fetch candidate evaluations from Supabase
  const {
    evaluations,
    loading: evaluationsLoading,
    stats: evaluationStats,
  } = useCandidateEvaluations();

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Find the candidate and update stage via Supabase
    const candidateId = draggableId;
    const newStage = destination.droppableId as KanbanCandidate['stage'];

    // Update candidate stage in Supabase
    updateCandidateStage(candidateId, newStage);
  };

  const form = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: '',
      department: '',
      location: '',
      type: '',
      openings: '1',
      salaryMin: '',
      salaryMax: '',
      description: '',
      requirements: '',
      benefits: '',
    },
  });

  const planForm = useForm<RecruitmentPlanFormValues>({
    resolver: zodResolver(recruitmentPlanSchema),
    defaultValues: {
      title: '',
      startMonth: '1',
      endMonth: '12',
      year: new Date().getFullYear().toString(),
      note: '',
    },
  });

  const onSubmitJob = (data: JobPostingFormValues) => {
    console.log('Job posting data:', data);
    toast({
      title: t('common.success'),
      description: t('recruitment.createJobSuccess'),
    });
    setIsJobDialogOpen(false);
    form.reset();
  };

  const onSubmitPlan = async (data: RecruitmentPlanFormValues) => {
    const success = await createPlan({
      title: data.title,
      startMonth: parseInt(data.startMonth),
      endMonth: parseInt(data.endMonth),
      year: parseInt(data.year),
      note: data.note,
      departments: planDepartments.map(dept => ({
        name: dept.name,
        positions: dept.positions.map(pos => ({
          name: pos.name,
          months: pos.months,
        })),
      })),
    });
    
    if (success) {
      setIsPlanDialogOpen(false);
      planForm.reset();
      setPlanDepartments([
        {
          id: '1',
          name: 'Phòng Kinh doanh',
          positions: [
            { id: '1-1', name: 'Nhân viên kinh doanh', months: Array(12).fill({ ns: 0, dx: 0 }) },
          ],
        },
      ]);
    }
  };

  const addDepartment = () => {
    const newId = (planDepartments.length + 1).toString();
    setPlanDepartments([
      ...planDepartments,
      {
        id: newId,
        name: '',
        positions: [
          { id: `${newId}-1`, name: '', months: Array(12).fill({ ns: 0, dx: 0 }) },
        ],
      },
    ]);
  };

  const addPosition = (deptId: string) => {
    setPlanDepartments(planDepartments.map(dept => {
      if (dept.id === deptId) {
        const newPosId = `${deptId}-${dept.positions.length + 1}`;
        return {
          ...dept,
          positions: [
            ...dept.positions,
            { id: newPosId, name: '', months: Array(12).fill({ ns: 0, dx: 0 }) },
          ],
        };
      }
      return dept;
    }));
  };

  const updateDepartmentName = (deptId: string, name: string) => {
    setPlanDepartments(planDepartments.map(dept =>
      dept.id === deptId ? { ...dept, name } : dept
    ));
  };

  const updatePositionName = (deptId: string, posId: string, name: string) => {
    setPlanDepartments(planDepartments.map(dept => {
      if (dept.id === deptId) {
        return {
          ...dept,
          positions: dept.positions.map(pos =>
            pos.id === posId ? { ...pos, name } : pos
          ),
        };
      }
      return dept;
    }));
  };

  const updateMonthValue = (deptId: string, posId: string, monthIdx: number, field: 'ns' | 'dx', value: number) => {
    setPlanDepartments(planDepartments.map(dept => {
      if (dept.id === deptId) {
        return {
          ...dept,
          positions: dept.positions.map(pos => {
            if (pos.id === posId) {
              const newMonths = [...pos.months];
              newMonths[monthIdx] = { ...newMonths[monthIdx], [field]: value };
              return { ...pos, months: newMonths };
            }
            return pos;
          }),
        };
      }
      return dept;
    }));
  };

  const removeDepartment = (deptId: string) => {
    if (planDepartments.length > 1) {
      setPlanDepartments(planDepartments.filter(dept => dept.id !== deptId));
    }
  };

  const removePosition = (deptId: string, posId: string) => {
    setPlanDepartments(planDepartments.map(dept => {
      if (dept.id === deptId && dept.positions.length > 1) {
        return {
          ...dept,
          positions: dept.positions.filter(pos => pos.id !== posId),
        };
      }
      return dept;
    }));
  };

  const getSelectedMonths = () => {
    const start = parseInt(planForm.watch('startMonth') || '1');
    const end = parseInt(planForm.watch('endMonth') || '12');
    const months = [];
    for (let i = start; i <= end; i++) {
      months.push(i);
    }
    return months;
  };

  const stages = [
    { id: 'applied', label: t('recruitment.applied'), color: 'bg-muted' },
    { id: 'screening', label: t('recruitment.screening'), color: 'bg-primary/20' },
    { id: 'interview', label: t('recruitment.interview'), color: 'bg-accent/20' },
    { id: 'offer', label: t('recruitment.offer'), color: 'bg-warning/20' },
    { id: 'hired', label: t('recruitment.hired'), color: 'bg-success/20' },
  ];

  const getCandidatesByStage = (stage: string) =>
    candidates.filter((c) => c.stage === stage);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          'w-3 h-3',
          i < rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'
        )}
      />
    ));
  };

  const months = Array.from({ length: 7 }, (_, i) => t('recruitment.month', { num: i + 1 }));

  return (
    <div
      className={cn(
        'flex w-full max-w-full flex-col animate-fade-in',
        portalEmbed
          ? 'min-h-0 min-w-0 flex-1'
          : 'h-[calc(100vh-120px)]',
      )}
    >
      {/* Top Navigation Bar with colored icons - Pill Style */}
      <div className="flex-shrink-0 border-b bg-background px-3 py-2 md:px-6 md:py-3">
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide pb-1">
          {topNavTabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            
            // Jobs dropdown
            if (tab.id === 'jobs') {
              return (
                <DropdownMenu key={tab.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "px-2.5 md:px-4 py-2 text-xs md:text-sm font-medium transition-all rounded-lg flex items-center gap-1.5 md:gap-2 whitespace-nowrap group",
                        isActive 
                          ? "bg-orange-500 text-white shadow-md" 
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
                        isActive ? 'bg-white/20' : tab.color
                      )}>
                        <TabIcon className={cn('w-3 h-3', isActive ? 'text-white' : 'text-white')} />
                      </div>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-popover">
                    {jobsMenuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => {
                          setActiveTab('jobs');
                          setActiveJobsType(item.id);
                        }}
                        className={cn(
                          "flex items-center justify-between cursor-pointer",
                          activeJobsType === item.id && activeTab === 'jobs' && "text-orange-600"
                        )}
                      >
                        {item.label}
                        {activeJobsType === item.id && activeTab === 'jobs' && (
                          <Check className="w-4 h-4 text-orange-500" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
            // Candidates dropdown
            if (tab.id === 'candidates') {
              return (
                <DropdownMenu key={tab.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "px-2.5 md:px-4 py-2 text-xs md:text-sm font-medium transition-all rounded-lg flex items-center gap-1.5 md:gap-2 whitespace-nowrap group",
                        isActive 
                          ? "bg-green-500 text-white shadow-md" 
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
                        isActive ? 'bg-white/20' : tab.color
                      )}>
                        <TabIcon className={cn('w-3 h-3', isActive ? 'text-white' : 'text-white')} />
                      </div>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-popover">
                    {candidatesMenuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => {
                          setActiveTab('candidates');
                          setActiveCandidatesType(item.id);
                        }}
                        className={cn(
                          "flex items-center justify-between cursor-pointer",
                          activeCandidatesType === item.id && activeTab === 'candidates' && "text-green-600"
                        )}
                      >
                        {item.label}
                        {activeCandidatesType === item.id && activeTab === 'candidates' && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
            // Interviews dropdown
            if (tab.id === 'interviews') {
              return (
                <DropdownMenu key={tab.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "px-2.5 md:px-4 py-2 text-xs md:text-sm font-medium transition-all rounded-lg flex items-center gap-1.5 md:gap-2 whitespace-nowrap group",
                        isActive 
                          ? "bg-red-500 text-white shadow-md" 
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
                        isActive ? 'bg-white/20' : tab.color
                      )}>
                        <TabIcon className={cn('w-3 h-3', isActive ? 'text-white' : 'text-white')} />
                      </div>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-popover">
                    {interviewsMenuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => {
                          setActiveTab('interviews');
                          setActiveInterviewsType(item.id);
                        }}
                        className={cn(
                          "flex items-center justify-between cursor-pointer",
                          activeInterviewsType === item.id && activeTab === 'interviews' && "text-red-600"
                        )}
                      >
                        {item.label}
                        {activeInterviewsType === item.id && activeTab === 'interviews' && (
                          <Check className="w-4 h-4 text-red-500" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
            // Get active background color based on tab color
            const getActiveBgColor = (color: string) => {
              const colorMap: Record<string, string> = {
                'bg-blue-500': 'bg-blue-500',
                'bg-orange-500': 'bg-orange-500',
                'bg-green-500': 'bg-green-500',
                'bg-purple-500': 'bg-purple-500',
                'bg-pink-500': 'bg-pink-500',
                'bg-red-500': 'bg-red-500',
                'bg-teal-500': 'bg-teal-500',
                'bg-indigo-500': 'bg-indigo-500',
                'bg-cyan-500': 'bg-cyan-500',
              };
              return colorMap[color] || 'bg-primary';
            };
            
            // Regular tabs without dropdown
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-2.5 md:px-4 py-2 text-xs md:text-sm font-medium transition-all rounded-lg flex items-center gap-1.5 md:gap-2 whitespace-nowrap group",
                  isActive 
                    ? `${getActiveBgColor(tab.color)} text-white shadow-md` 
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'bg-white/20' : tab.color
                )}>
                  <TabIcon className={cn('w-3 h-3', isActive ? 'text-white' : 'text-white')} />
                </div>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

        {/* Main Content — portal: chỉ cuộn dọc trong khung; tránh overflow-auto gây thanh ngang giữa trang */}
        <div
          className={cn(
            'min-w-0 flex-1 p-3 md:p-6',
            portalEmbed
              ? 'min-h-0 overflow-x-hidden overflow-y-auto'
              : 'overflow-auto',
          )}
        >
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold tracking-tight md:text-xl">{t('recruitment.dashboardTitle')}</h2>
              <PermissionGate module="recruitment" action="create">
                <Button size="sm" className="shrink-0">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  {t('recruitment.createJobPosting')}
                </Button>
              </PermissionGate>
            </div>

            {/* Sub Tabs */}
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList>
                <TabsTrigger value="dashboard">{t('recruitment.dashboardTab')}</TabsTrigger>
                <TabsTrigger value="board">{t('recruitment.boardTab')}</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-3 space-y-3">
                {/*
                  Bố cục kiểu analytics (Stripe / GA): KPI = một dải mỏng; metric cần nhãn dài = full width;
                  biểu đồ cần chiều ngang (bar ngang) = full width; pie + feed = một hàng 2 cột.
                */}
                <Card className="overflow-hidden shadow-sm">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-2 divide-x divide-border sm:grid-cols-4">
                      {(
                        [
                          {
                            label: t('recruitment.target'),
                            value: '86',
                            bar: 'bg-blue-500',
                            tint: 'bg-blue-500/[0.06]',
                            valueClass: 'text-blue-600',
                          },
                          {
                            label: t('recruitment.cvApplied'),
                            value: String(candidateStats.total),
                            bar: 'bg-purple-500',
                            tint: 'bg-purple-500/[0.06]',
                            valueClass: 'text-purple-600',
                          },
                          {
                            label: t('recruitment.interviewed'),
                            value: String(candidateStats.interview + candidateStats.offer + candidateStats.hired),
                            bar: 'bg-orange-500',
                            tint: 'bg-orange-500/[0.06]',
                            valueClass: 'text-orange-600',
                          },
                          {
                            label: t('recruitment.hired'),
                            value: String(candidateStats.hired),
                            bar: 'bg-green-500',
                            tint: 'bg-green-500/[0.06]',
                            valueClass: 'text-green-600',
                          },
                        ] as const
                      ).map((k) => (
                        <div
                          key={k.label}
                          className={cn('relative min-w-0 px-2.5 py-2 sm:px-3 sm:py-2.5', k.tint)}
                        >
                          <span
                            className={cn('absolute left-0 top-2 bottom-2 w-0.5 rounded-full sm:top-2.5 sm:bottom-2.5', k.bar)}
                            aria-hidden
                          />
                          <div className="pl-2">
                            <p className="line-clamp-2 text-[10px] font-medium leading-tight text-muted-foreground sm:line-clamp-1 sm:text-xs">
                              {k.label}
                            </p>
                            <p className={cn('text-lg font-bold tabular-nums leading-tight sm:text-xl', k.valueClass)}>
                              {k.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="p-0">
                    <div className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
                      <div className="flex gap-3 px-4 py-3 bg-purple-500/[0.05]">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500/15">
                          <DollarSign className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium leading-snug text-muted-foreground">
                            {t('recruitment.avgCostPerCandidate')}
                          </p>
                          <p className="text-base font-bold tabular-nums text-purple-600 sm:text-lg">990.000 đ</p>
                        </div>
                      </div>
                      <div className="flex gap-3 px-4 py-3 bg-orange-500/[0.05]">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/15">
                          <DollarSign className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium leading-snug text-muted-foreground">
                            {t('recruitment.costTopCV')}
                          </p>
                          <p className="text-base font-bold tabular-nums text-orange-600 sm:text-lg">13.395.000 đ</p>
                        </div>
                      </div>
                      <div className="flex gap-3 px-4 py-3 bg-cyan-500/[0.05]">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/15">
                          <DollarSign className="h-4 w-4 text-cyan-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium leading-snug text-muted-foreground">
                            {t('recruitment.cost24h')}
                          </p>
                          <p className="text-base font-bold tabular-nums text-cyan-600 sm:text-lg">2.756.804 đ</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="space-y-0 px-4 py-2 pb-0">
                    <CardTitle className="text-sm font-semibold">{t('recruitment.recruitmentChart')}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-1 sm:px-4">
                    <RecruitmentLineChart />
                  </CardContent>
                </Card>

                <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2">
                  <Card className="min-w-0 shadow-sm">
                    <CardHeader className="space-y-0 px-4 py-2 pb-0">
                      <CardTitle className="text-sm font-semibold">{t('recruitment.recruitmentChartByStatus')}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 pt-1 sm:px-4">
                      <RecruitmentPieChart candidates={candidates} />
                    </CardContent>
                  </Card>

                  <Card className="min-w-0 shadow-sm">
                    <CardHeader className="px-4 py-2">
                      <CardTitle className="text-sm font-semibold">{t('recruitment.recentActivity')}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 pt-0">
                      <div className="divide-y divide-border">
                        {candidates.slice(0, 5).map((candidate) => (
                          <div key={candidate.id} className="flex items-center gap-3 py-2.5 first:pt-0">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {candidate.fullName.split(' ').pop()?.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{candidate.fullName}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {t('recruitment.appliedForPosition', { position: candidate.position })}
                              </p>
                            </div>
                            <div className="shrink-0 text-xs text-muted-foreground">
                              {new Date(candidate.appliedDate).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="min-w-0 shadow-sm">
                  <CardHeader className="space-y-0 px-4 py-2 pb-0">
                    <CardTitle className="text-sm font-semibold">{t('recruitment.recruitmentChartByDept')}</CardTitle>
                  </CardHeader>
                  <CardContent className="min-w-0 px-2 pb-3 pt-1 sm:px-4">
                    <RecruitmentBarChart />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="board" className="mt-4">
                {/* Kanban Board with Drag and Drop */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="grid grid-cols-5 gap-4">
                    {stages.map((stage) => (
                      <div key={stage.id} className="kanban-column">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-sm">{stage.label}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {getCandidatesByStage(stage.id).length}
                          </Badge>
                        </div>
                        <Droppable droppableId={stage.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={cn(
                                "space-y-2 min-h-[200px] p-2 rounded-lg transition-colors",
                                snapshot.isDraggingOver ? "bg-primary/10" : "bg-transparent"
                              )}
                            >
                              {getCandidatesByStage(stage.id).map((candidate, index) => (
                                <Draggable
                                  key={candidate.id}
                                  draggableId={candidate.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={cn(
                                        "kanban-card group",
                                        snapshot.isDragging && "shadow-lg ring-2 ring-primary"
                                      )}
                                      onClick={() => setSelectedCandidate(candidate)}
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div
                                            {...provided.dragHandleProps}
                                            className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                                          </div>
                                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                                            {candidate.fullName.split(' ').pop()?.charAt(0)}
                                          </div>
                                        </div>
                                        <div className="flex">{renderStars(candidate.rating)}</div>
                                      </div>
                                      <p className="font-medium text-sm mb-1">{candidate.fullName}</p>
                                      <p className="text-xs text-muted-foreground mb-2">
                                        {candidate.position}
                                      </p>
                                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{candidate.source}</span>
                                        <span>{new Date(candidate.appliedDate).toLocaleDateString('vi-VN')}</span>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    ))}
                  </div>
                </DragDropContext>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">{t('recruitment.jobPostings')}</h2>
            <JobPostingsTab />
          </div>
        )}


        {activeTab === 'candidates' && <CandidatesTab />}

        {/* Proposals Tab */}
        {activeTab === 'proposals' && <HeadcountProposalTab />}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && <CampaignsTab />}

        {/* Interviews Tab */}
        {activeTab === 'interviews' && (
          <InterviewsTab />
        )}

        {/* Evaluations Tab */}
        {activeTab === 'evaluations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('recruitment.evaluateCandidate')}</h2>
              <Button onClick={() => setIsComparisonDialogOpen(true)}>
                <BarChart3 className="w-4 h-4 mr-2" />
                {t('recruitment.compareCandidates')}
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{t('recruitment.totalEvaluations')}</p>
                  <p className="text-3xl font-bold text-primary">{evaluationStats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{t('recruitment.pass')}</p>
                  <p className="text-3xl font-bold text-green-600">{evaluationStats.pass}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{t('recruitment.fail')}</p>
                  <p className="text-3xl font-bold text-red-600">{evaluationStats.fail}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{t('recruitment.pendingReview')}</p>
                  <p className="text-3xl font-bold text-orange-500">{evaluationStats.pending + evaluationStats.hold}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              {evaluationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : evaluations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ClipboardCheck className="w-12 h-12 mb-4 opacity-50" />
                  <p>{t('recruitment.noEvaluations')}</p>
                  <p className="text-sm">{t('recruitment.evaluationsAfterInterview')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('recruitment.candidate')}</TableHead>
                      <TableHead>{t('recruitment.position')}</TableHead>
                      <TableHead>{t('recruitment.evaluator')}</TableHead>
                      <TableHead>{t('recruitment.score')}</TableHead>
                      <TableHead>{t('recruitment.result')}</TableHead>
                      <TableHead>{t('recruitment.evaluationDate')}</TableHead>
                      <TableHead className="text-right">{t('recruitment.detail')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                              {evaluation.candidate_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{evaluation.candidate_name}</p>
                              <p className="text-xs text-muted-foreground">{evaluation.candidate_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{evaluation.candidate_position || '-'}</TableCell>
                        <TableCell>{evaluation.evaluator_name || evaluation.evaluator_email || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{evaluation.weighted_score?.toFixed(1) || '-'}</span>
                            <span className="text-xs text-muted-foreground">/5</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            evaluation.result === 'pass' ? 'default' : 
                            evaluation.result === 'fail' ? 'destructive' : 
                            'secondary'
                          }>
                            {evaluation.result === 'pass' ? t('recruitment.resultPass') : 
                             evaluation.result === 'fail' ? t('recruitment.resultFail') : 
                             evaluation.result === 'hold' ? t('recruitment.resultHold') : t('recruitment.resultPending')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(evaluation.created_at).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const candidateForEval = candidates.find(c => c.id === evaluation.candidate_id);
                              if (candidateForEval) {
                                setEvaluatingCandidate(candidateForEval);
                                setIsEvaluationDialogOpen(true);
                              }
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            {!selectedPlan ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{t('recruitment.recruitmentPlans')}</h2>
                  <PermissionGate module="recruitment" action="create">
                    <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                           {t('recruitment.createPlan')}
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <CalendarClock className="w-5 h-5 text-primary" />
                          {t('recruitment.createNewPlan')}
                        </DialogTitle>
                      </DialogHeader>
                      <Form {...planForm}>
                        <form onSubmit={planForm.handleSubmit(onSubmitPlan)} className="flex-1 flex flex-col overflow-hidden">
                          {/* Basic Info */}
                          <div className="space-y-4 pb-4 border-b">
                            <FormField
                              control={planForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                   <FormLabel>{t('recruitment.planTitle')} <span className="text-destructive">*</span></FormLabel>
                                  <FormControl>
                                    <Input placeholder={t('recruitment.planTitlePlaceholder')} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-4 gap-4">
                              <FormField
                                control={planForm.control}
                                name="year"
                                render={({ field }) => (
                                  <FormItem>
                                     <FormLabel>{t('recruitment.year')} <span className="text-destructive">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t('recruitment.selectYear')} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="2024">2024</SelectItem>
                                        <SelectItem value="2025">2025</SelectItem>
                                        <SelectItem value="2026">2026</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={planForm.control}
                                name="startMonth"
                                render={({ field }) => (
                                  <FormItem>
                                     <FormLabel>{t('recruitment.fromMonth')} <span className="text-destructive">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t('recruitment.selectMonth')} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => (
                                          <SelectItem key={i + 1} value={(i + 1).toString()}>{t('recruitment.month', { num: i + 1 })}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={planForm.control}
                                name="endMonth"
                                render={({ field }) => (
                                  <FormItem>
                                     <FormLabel>{t('recruitment.toMonth')} <span className="text-destructive">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t('recruitment.selectMonth')} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => (
                                          <SelectItem key={i + 1} value={(i + 1).toString()}>{t('recruitment.month', { num: i + 1 })}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={planForm.control}
                                name="note"
                                render={({ field }) => (
                                  <FormItem>
                                     <FormLabel>{t('recruitment.note')}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t('recruitment.notePlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Headcount Table */}
                          <div className="flex-1 overflow-hidden py-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                {t('recruitment.headcountTableTitle')}
                              </h3>
                              <Button type="button" variant="outline" size="sm" onClick={addDepartment}>
                                <Plus className="w-4 h-4 mr-1" />
                                {t('recruitment.addDepartment')}
                              </Button>
                            </div>

                            <ScrollArea className="h-[350px] border rounded-lg">
                              <Table>
                                <TableHeader className="sticky top-0 bg-background z-10">
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="min-w-[200px] sticky left-0 bg-muted/50">
                                       <div>{t('recruitment.department')} / {t('recruitment.position')}</div>
                                      <div className="flex gap-4 text-xs font-normal text-muted-foreground mt-1">
                                        <span>{t('recruitment.nsLabel')}</span>
                                        <span className="text-orange-500">{t('recruitment.dxLabel')}</span>
                                      </div>
                                    </TableHead>
                                    {getSelectedMonths().map((month) => (
                                      <TableHead key={month} className="text-center min-w-[100px]">
                                        <div>{t('recruitment.month', { num: month })}</div>
                                        <div className="flex justify-center gap-3 text-xs font-normal mt-1">
                                          <span className="text-muted-foreground">{t('recruitment.ns')}</span>
                                          <span className="text-orange-500">{t('recruitment.dx')}</span>
                                        </div>
                                      </TableHead>
                                    ))}
                                    <TableHead className="w-[50px]"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {planDepartments.map((dept) => (
                                    <>
                                      <TableRow key={`dept-${dept.id}`} className="bg-muted/30">
                                        <TableCell className="sticky left-0 bg-muted/30">
                                          <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-muted-foreground" />
                                            <Input
                                              value={dept.name}
                                              onChange={(e) => updateDepartmentName(dept.id, e.target.value)}
                                              placeholder={t('recruitment.departmentName')}
                                              className="h-8 w-[180px] font-semibold"
                                            />
                                          </div>
                                        </TableCell>
                                        {getSelectedMonths().map((month) => (
                                          <TableCell key={month} className="text-center text-muted-foreground">
                                            —
                                          </TableCell>
                                        ))}
                                        <TableCell>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeDepartment(dept.id)}
                                            className="text-destructive hover:text-destructive"
                                            disabled={planDepartments.length <= 1}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                      {dept.positions.map((pos) => (
                                        <TableRow key={`pos-${pos.id}`}>
                                          <TableCell className="pl-8 sticky left-0 bg-background">
                                            <Input
                                              value={pos.name}
                                              onChange={(e) => updatePositionName(dept.id, pos.id, e.target.value)}
                                              placeholder={t('recruitment.positionName')}
                                              className="h-8 w-[180px]"
                                            />
                                          </TableCell>
                                          {getSelectedMonths().map((month, monthIdx) => (
                                            <TableCell key={month} className="text-center">
                                              <div className="flex justify-center gap-1">
                                                <Input
                                                  type="number"
                                                  min={0}
                                                  value={pos.months[monthIdx]?.ns || 0}
                                                  onChange={(e) => updateMonthValue(dept.id, pos.id, monthIdx, 'ns', parseInt(e.target.value) || 0)}
                                                  className="h-7 w-12 text-center px-1"
                                                />
                                                <Input
                                                  type="number"
                                                  min={0}
                                                  value={pos.months[monthIdx]?.dx || 0}
                                                  onChange={(e) => updateMonthValue(dept.id, pos.id, monthIdx, 'dx', parseInt(e.target.value) || 0)}
                                                  className="h-7 w-12 text-center px-1 border-orange-300 focus:ring-orange-500"
                                                />
                                              </div>
                                            </TableCell>
                                          ))}
                                          <TableCell>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removePosition(dept.id, pos.id)}
                                              className="text-destructive hover:text-destructive"
                                              disabled={dept.positions.length <= 1}
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                      <TableRow key={`add-pos-${dept.id}`}>
                                        <TableCell className="pl-8 sticky left-0 bg-background" colSpan={getSelectedMonths().length + 2}>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => addPosition(dept.id)}
                                            className="text-muted-foreground hover:text-foreground"
                                          >
                                            <Plus className="w-4 h-4 mr-1" />
                                            {t('recruitment.addPosition')}
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    </>
                                  ))}
                                </TableBody>
                              </Table>
                            </ScrollArea>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-3 pt-4 border-t">
                             <Button type="button" variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
                              {t('recruitment.cancel')}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                toast({
                                  title: t('recruitment.savedDraft'),
                                  description: t('recruitment.planSavedDraft'),
                                });
                              }}
                            >
                              {t('recruitment.saveDraft')}
                            </Button>
                            <Button type="submit">
                              {t('recruitment.createPlan')}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  </PermissionGate>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                       <p className="text-sm text-muted-foreground">{t('recruitment.totalPlans')}</p>
                      <p className="text-3xl font-bold text-primary">{planStats.total}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">{t('recruitment.approved')}</p>
                      <p className="text-3xl font-bold text-green-600">
                        {planStats.approved}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">{t('recruitment.pending')}</p>
                      <p className="text-3xl font-bold text-orange-500">
                        {planStats.pending}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  {plansLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : recruitmentPlans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <CalendarClock className="w-12 h-12 mb-4 opacity-50" />
                       <p>{t('recruitment.noPlans')}</p>
                      <p className="text-sm">{t('recruitment.clickCreatePlan')}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('recruitment.planTitleCol')}</TableHead>
                          <TableHead>{t('recruitment.period')}</TableHead>
                          <TableHead>{t('recruitment.creator')}</TableHead>
                          <TableHead>{t('recruitment.createdDate')}</TableHead>
                          <TableHead>{t('recruitment.status')}</TableHead>
                          <TableHead className="text-right">{t('recruitment.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recruitmentPlans.map((plan) => (
                          <TableRow key={plan.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedPlan(plan)}>
                            <TableCell className="font-medium">{plan.title}</TableCell>
                            <TableCell>{plan.period}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                  {plan.creator.charAt(0)}
                                </div>
                                {plan.creator}
                              </div>
                            </TableCell>
                            <TableCell>{plan.createdDate}</TableCell>
                            <TableCell>
                              <Badge variant={plan.status === 'approved' ? 'default' : 'secondary'}>
                                {plan.status === 'approved' ? t('recruitment.statusApproved') : plan.status === 'draft' ? t('recruitment.statusDraft') : t('recruitment.statusPending')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan); }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </>
            ) : (
              <>
                {/* Plan Detail View - matching the reference image */}
                <div className="flex items-center gap-4 mb-4">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPlan(null)}>
                    ← {t('recruitment.back')}
                  </Button>
                  <h2 className="text-xl font-bold">{selectedPlan.title}</h2>
                </div>

                <Card>
                  <div className="border-b">
                    <div className="px-4 py-2">
                      <span className="text-sm font-medium text-primary border-b-2 border-primary pb-2">{t('recruitment.detailTab')}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-6">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t('recruitment.planTitleCol')}</p>
                          <p className="font-medium">{selectedPlan.title}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.period')}</p>
                        <p className="font-medium">{selectedPlan.period}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t('recruitment.creator')}</p>
                          <Badge variant="secondary" className="bg-primary/10 text-primary mt-1">
                            👤 {selectedPlan.creator}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.createdDate')}</p>
                        <p className="font-medium">{selectedPlan.createdDate}</p>
                      </div>
                    </div>

                    {/* Content Table */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                         {t('recruitment.proposalContent')}
                      </h3>

                      {selectedPlan.departments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                          <FileText className="w-8 h-8 mb-2 opacity-50" />
                          <p>{t('recruitment.noDepartmentData')}</p>
                        </div>
                      ) : (
                        <ScrollArea className="w-full">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="min-w-[200px]">
                                   <div>{t('recruitment.department')}</div>
                                  <div className="text-xs font-normal text-muted-foreground mt-1">{t('recruitment.nsLabel')}</div>
                                  <div className="text-xs font-normal text-muted-foreground">{t('recruitment.dxLabel')}</div>
                                </TableHead>
                                {(selectedPlan.departments[0]?.positions[0]?.months || []).map((_, i) => (
                                  <TableHead key={i} className="text-center min-w-[90px]">
                                    <div>{t('recruitment.month', { num: selectedPlan.startMonth + i })}</div>
                                    <div className="flex justify-center gap-3 text-xs font-normal mt-1">
                                      <span className="text-muted-foreground">{t('recruitment.ns')}</span>
                                      <span className="text-orange-500">{t('recruitment.dx')}</span>
                                    </div>
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedPlan.departments.map((dept, deptIdx) => (
                                <>
                                  <TableRow key={`dept-${deptIdx}`} className="bg-muted/30">
                                    <TableCell colSpan={(selectedPlan.departments[0]?.positions[0]?.months.length || 0) + 1} className="font-semibold">
                                      {dept.name}
                                    </TableCell>
                                  </TableRow>
                                  {dept.positions.map((pos, posIdx) => (
                                    <TableRow key={`pos-${deptIdx}-${posIdx}`}>
                                      <TableCell className="pl-8">{pos.name}</TableCell>
                                      {pos.months.map((month, monthIdx) => (
                                        <TableCell key={monthIdx} className="text-center">
                                          <div className="flex justify-center gap-4">
                                            <span className={month.ns > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                                              {month.ns}
                                            </span>
                                            <span className={month.dx > 0 ? 'text-orange-500 font-medium' : 'text-muted-foreground'}>
                                              {month.dx}
                                            </span>
                                          </div>
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        {t('common.edit')}
                      </Button>
                      {selectedPlan.status === 'pending' && (
                        <>
                          <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
                            {t('recruitment.reject')}
                          </Button>
                          <Button className="bg-green-600 hover:bg-green-700">
                            {t('recruitment.approvePlan')}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <RecruitmentReportsTab />
        )}
      </div>

      {/* Removed - CandidateDetailView is now handled in CandidatesTab */}

      {/* Candidate Evaluation Dialog */}
      <CandidateEvaluationDialog
        candidate={evaluatingCandidate ? {
          id: evaluatingCandidate.id,
          full_name: evaluatingCandidate.fullName,
          email: evaluatingCandidate.email,
          position: evaluatingCandidate.position || null,
        } : null}
        open={isEvaluationDialogOpen}
        onOpenChange={setIsEvaluationDialogOpen}
      />

      {/* Candidate Comparison Dialog */}
      <CandidateComparisonDialog
        open={isComparisonDialogOpen}
        onOpenChange={setIsComparisonDialogOpen}
      />
    </div>
  );
}
