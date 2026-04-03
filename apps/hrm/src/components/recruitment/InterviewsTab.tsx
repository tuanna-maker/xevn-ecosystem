import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Eye,
  Edit,
  X,
  Calendar,
  Clock,
  User,
  Video,
  Phone,
  MapPin,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  RefreshCw,
  List,
  CalendarDays,
  Download,
  Trash2,
  CheckCheck,
  CircleDot,
  MoreHorizontal,
  Link2,
  UserCheck,
  ClipboardList,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { supabase } from '@/integrations/supabase/client';
import { InterviewCalendarView } from './InterviewCalendarView';
import { CandidateEvaluationDialog } from './CandidateEvaluationDialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Interview {
  id: string;
  candidate_id: string | null;
  candidate_name: string;
  candidate_email: string | null;
  candidate_phone: string | null;
  job_posting_id: string | null;
  position: string | null;
  interview_date: string;
  interview_time: string;
  duration_minutes: number | null;
  interview_type: string | null;
  location: string | null;
  meeting_link: string | null;
  interviewer_name: string | null;
  interviewer_email: string | null;
  notes: string | null;
  status: string | null;
  feedback: string | null;
  rating: number | null;
  company_id: string;
  created_at: string;
  updated_at: string;
  interview_round: number | null;
  result: string | null;
  next_steps: string | null;
}

interface JobPosting {
  id: string;
  title: string;
  position: string;
}

interface Candidate {
  id: string;
  full_name: string;
  email: string;
}

const getStatusConfig = (t: any) => ({
  scheduled: { label: t('recruitment.it.statuses.scheduled'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Calendar },
  confirmed: { label: t('recruitment.it.statuses.confirmed'), color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400', icon: CheckCheck },
  completed: { label: t('recruitment.it.statuses.completed'), color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  cancelled: { label: t('recruitment.it.statuses.cancelled'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  rescheduled: { label: t('recruitment.it.statuses.rescheduled'), color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle },
  no_show: { label: t('recruitment.it.statuses.no_show'), color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: XCircle },
});

const getTypeConfig = (t: any) => ({
  onsite: { label: t('recruitment.it.types.onsite'), icon: MapPin },
  online: { label: t('recruitment.it.types.online'), icon: Video },
  phone: { label: t('recruitment.it.types.phone'), icon: Phone },
});

const getResultConfig = (t: any) => ({
  pending: { label: t('recruitment.it.results.pending'), color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: CircleDot },
  pass: { label: t('recruitment.it.results.pass'), color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  fail: { label: t('recruitment.it.results.fail'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  hold: { label: t('recruitment.it.results.hold'), color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertCircle },
});

type UpdateInterviewFormValues = z.infer<ReturnType<typeof createUpdateSchema>>;

function createUpdateSchema(t: any) {
  return z.object({
    status: z.string().min(1, t('recruitment.it.statusRequired')),
    rating: z.string().optional(),
    feedback: z.string().optional(),
    result: z.string().optional(),
    next_steps: z.string().optional(),
    interview_round: z.number().min(1).max(10).optional(),
  });
}

export function InterviewsTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { currentCompanyId } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState<Interview | null>(null);
  const [isNextRoundDialogOpen, setIsNextRoundDialogOpen] = useState(false);
  const [interviewForNextRound, setInterviewForNextRound] = useState<Interview | null>(null);
  const [creatingNextRound, setCreatingNextRound] = useState(false);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [interviewForEvaluation, setInterviewForEvaluation] = useState<Interview | null>(null);

  const statusConfig = getStatusConfig(t);
  const typeConfig = getTypeConfig(t);
  const resultConfig = getResultConfig(t);

  const form = useForm<UpdateInterviewFormValues>({
    resolver: zodResolver(createUpdateSchema(t)),
    defaultValues: {
      status: '',
      rating: '',
      feedback: '',
      result: 'pending',
      next_steps: '',
      interview_round: 1,
    },
  });

  const fetchInterviews = async () => {
    if (!currentCompanyId) return;
    
    setLoading(true);
    try {
      const [interviewsRes, jobPostingsRes, candidatesRes] = await Promise.all([
        supabase
          .from('interviews')
          .select('*')
          .eq('company_id', currentCompanyId)
          .order('interview_date', { ascending: false }),
        supabase
          .from('job_postings')
          .select('id, title, position')
          .eq('company_id', currentCompanyId),
        supabase
          .from('candidates')
          .select('id, full_name, email')
          .eq('company_id', currentCompanyId),
      ]);

      if (interviewsRes.error) throw interviewsRes.error;
      setInterviews(interviewsRes.data || []);
      setJobPostings(jobPostingsRes.data || []);
      setCandidates(candidatesRes.data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast({
        title: t('common.error'),
        description: t('recruitment.it.errorLoad'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [currentCompanyId]);

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = !searchQuery || 
      interview.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.interviewer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    const matchesType = typeFilter === 'all' || interview.interview_type === typeFilter;
    const matchesResult = resultFilter === 'all' || interview.result === resultFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesResult;
  });

  const stats = {
    total: interviews.length,
    scheduled: interviews.filter(i => i.status === 'scheduled' || i.status === 'confirmed').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    pass: interviews.filter(i => i.result === 'pass').length,
  };

  const handleViewDetail = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsDetailDialogOpen(true);
  };

  const handleOpenUpdate = (interview: Interview) => {
    setSelectedInterview(interview);
    form.reset({
      status: interview.status || 'scheduled',
      rating: interview.rating?.toString() || '',
      feedback: interview.feedback || '',
      result: interview.result || 'pending',
      next_steps: interview.next_steps || '',
      interview_round: interview.interview_round || 1,
    });
    setIsUpdateDialogOpen(true);
  };

  const handleDeleteConfirm = (interview: Interview) => {
    setInterviewToDelete(interview);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!interviewToDelete) return;

    try {
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', interviewToDelete.id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('recruitment.it.deleteSuccess'),
      });
      setIsDeleteDialogOpen(false);
      setInterviewToDelete(null);
      fetchInterviews();
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast({
        title: t('common.error'),
        description: t('recruitment.it.deleteError'),
        variant: 'destructive',
      });
    }
  };

  const getJobPostingTitle = (jobPostingId: string | null) => {
    if (!jobPostingId) return null;
    const job = jobPostings.find(j => j.id === jobPostingId);
    return job ? job.title : null;
  };

  const getCandidateName = (candidateId: string | null) => {
    if (!candidateId) return null;
    const candidate = candidates.find(c => c.id === candidateId);
    return candidate ? candidate.full_name : null;
  };

  const createNextRoundInterview = async (interview: Interview) => {
    if (!currentCompanyId) return;

    setCreatingNextRound(true);
    try {
      const nextRound = (interview.interview_round || 1) + 1;
      
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 7);

      const { error } = await supabase
        .from('interviews')
        .insert({
          company_id: currentCompanyId,
          candidate_id: interview.candidate_id,
          candidate_name: interview.candidate_name,
          candidate_email: interview.candidate_email,
          candidate_phone: interview.candidate_phone,
          job_posting_id: interview.job_posting_id,
          position: interview.position,
          interview_date: format(nextDate, 'yyyy-MM-dd'),
          interview_time: interview.interview_time,
          duration_minutes: interview.duration_minutes,
          interview_type: interview.interview_type,
          location: interview.location,
          meeting_link: interview.meeting_link,
          interviewer_name: interview.interviewer_name,
          interviewer_email: interview.interviewer_email,
          interview_round: nextRound,
          status: 'scheduled',
          result: 'pending',
          notes: t('recruitment.it.nextRoundNote2', { num: nextRound, prev: interview.interview_round || 1 }),
        });

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('recruitment.it.nextRoundSuccess', { num: nextRound, name: interview.candidate_name }),
      });
      setIsNextRoundDialogOpen(false);
      setInterviewForNextRound(null);
      fetchInterviews();
    } catch (error) {
      console.error('Error creating next round interview:', error);
      toast({
        title: t('common.error'),
        description: t('recruitment.it.nextRoundError'),
        variant: 'destructive',
      });
    } finally {
      setCreatingNextRound(false);
    }
  };

  const onSubmitUpdate = async (data: UpdateInterviewFormValues) => {
    if (!selectedInterview) return;

    const isCompletingInterview = data.status === 'completed' && selectedInterview.status !== 'completed';
    const isPassingResult = data.result === 'pass' && selectedInterview.result !== 'pass';

    try {
      const { error } = await supabase
        .from('interviews')
        .update({
          status: data.status,
          rating: data.rating ? parseInt(data.rating) : null,
          feedback: data.feedback || null,
          result: data.result || 'pending',
          next_steps: data.next_steps || null,
          interview_round: data.interview_round || 1,
        })
        .eq('id', selectedInterview.id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('recruitment.it.updateSuccess'),
      });
      setIsUpdateDialogOpen(false);
      
      const updatedInterview = {
        ...selectedInterview,
        status: data.status,
        result: data.result || 'pending',
        interview_round: data.interview_round || selectedInterview.interview_round || 1,
      };
      
      if (isCompletingInterview && selectedInterview.candidate_id) {
        setInterviewForEvaluation(updatedInterview);
        setIsEvaluationDialogOpen(true);
      }
      else if (isPassingResult) {
        setInterviewForNextRound(updatedInterview);
        setIsNextRoundDialogOpen(true);
      }
      
      fetchInterviews();
    } catch (error) {
      console.error('Error updating interview:', error);
      toast({
        title: t('common.error'),
        description: t('recruitment.it.updateError'),
        variant: 'destructive',
      });
    }
  };

  const handleOpenEvaluation = (interview: Interview) => {
    if (interview.candidate_id) {
      setInterviewForEvaluation(interview);
      setIsEvaluationDialogOpen(true);
    } else {
      toast({
        title: t('recruitment.it.cannotEvaluate'),
        description: t('recruitment.it.notLinkedMsg'),
        variant: 'destructive',
      });
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground text-sm">{t('recruitment.it.noRating')}</span>;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
          />
        ))}
        <span className="text-sm ml-1">({rating}/5)</span>
      </div>
    );
  };

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || resultFilter !== 'all' || searchQuery;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setResultFilter('all');
  };

  const handleExportExcel = () => {
    const exportData = filteredInterviews.map((interview) => ({
      [t('recruitment.it.exCandidateName')]: interview.candidate_name,
      [t('recruitment.it.exCandidateEmail')]: interview.candidate_email || '',
      [t('recruitment.it.exCandidatePhone')]: interview.candidate_phone || '',
      [t('recruitment.it.exPosition')]: interview.position || '',
      [t('recruitment.it.exRound')]: interview.interview_round || 1,
      [t('recruitment.it.exDate')]: format(new Date(interview.interview_date), 'dd/MM/yyyy', { locale: vi }),
      [t('recruitment.it.exTime')]: interview.interview_time,
      [t('recruitment.it.exDuration')]: interview.duration_minutes || '',
      [t('recruitment.it.exType')]: typeConfig[interview.interview_type || 'onsite']?.label || '',
      [t('recruitment.it.exLocationLink')]: interview.interview_type === 'online' ? interview.meeting_link : interview.location || '',
      [t('recruitment.it.exInterviewer')]: interview.interviewer_name || '',
      [t('recruitment.it.exInterviewerEmail')]: interview.interviewer_email || '',
      [t('recruitment.it.exStatus')]: statusConfig[interview.status || 'scheduled']?.label || '',
      [t('recruitment.it.exResult')]: resultConfig[interview.result || 'pending']?.label || '',
      [t('recruitment.it.exRating')]: interview.rating || '',
      [t('recruitment.it.exFeedback')]: interview.feedback || '',
      [t('recruitment.it.exNextSteps')]: interview.next_steps || '',
      [t('recruitment.it.exNotes')]: interview.notes || '',
      [t('recruitment.it.exCreatedAt')]: format(new Date(interview.created_at), 'dd/MM/yyyy HH:mm', { locale: vi }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('recruitment.it.exSheetName'));
    
    worksheet['!cols'] = [
      { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 12 },
      { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 20 },
      { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 40 }, { wch: 30 }, { wch: 18 },
    ];

    XLSX.writeFile(workbook, `interviews-${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
    
    toast({
      title: t('recruitment.it.exportSuccess'),
      description: t('recruitment.it.exportMsg', { count: exportData.length }),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('recruitment.it.title')}</h2>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportExcel} variant="outline" size="sm" disabled={filteredInterviews.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            {t('recruitment.it.exportExcel')}
          </Button>
          <Button onClick={fetchInterviews} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('recruitment.it.refresh')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{t('recruitment.it.totalInterviews')}</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{t('recruitment.it.scheduled')}</p>
            <p className="text-3xl font-bold text-amber-600">{stats.scheduled}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{t('recruitment.it.completed')}</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{t('recruitment.it.passInterview')}</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.pass}</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            {t('recruitment.it.listView')}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {t('recruitment.it.calendarView')}
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="mt-0">
      <Card>
        <div className="p-4 border-b">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('recruitment.it.searchPlaceholder')}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t('recruitment.it.statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('recruitment.it.allStatuses')}</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="w-4 h-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder={t('recruitment.it.typePlaceholder')} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('recruitment.it.allTypes')}</SelectItem>
                {Object.entries(typeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="w-4 h-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('recruitment.it.resultPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('recruitment.it.allResults')}</SelectItem>
                {Object.entries(resultConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="w-4 h-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                {t('recruitment.it.clearFilters')}
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
              <span className="text-sm text-muted-foreground">{t('recruitment.it.filtering')}</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t('recruitment.it.keyword')}: "{searchQuery}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t('recruitment.it.statusLabel')}: {statusConfig[statusFilter]?.label}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
                </Badge>
              )}
              {typeFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t('recruitment.it.typeLabel')}: {typeConfig[typeFilter]?.label}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setTypeFilter('all')} />
                </Badge>
              )}
              {resultFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t('recruitment.it.resultLabel')}: {resultConfig[resultFilter]?.label}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setResultFilter('all')} />
                </Badge>
              )}
              <span className="text-sm text-muted-foreground ml-auto">
                {t('recruitment.it.interviewCount', { count: filteredInterviews.length, total: interviews.length })}
              </span>
            </div>
          )}
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('recruitment.it.thCandidate')}</TableHead>
              <TableHead>{t('recruitment.it.thPosition')}</TableHead>
              <TableHead>{t('recruitment.it.thRound')}</TableHead>
              <TableHead>{t('recruitment.it.thDateTime')}</TableHead>
              <TableHead>{t('recruitment.it.thType')}</TableHead>
              <TableHead>{t('recruitment.it.thInterviewer')}</TableHead>
              <TableHead>{t('recruitment.it.thStatus')}</TableHead>
              <TableHead>{t('recruitment.it.thResult')}</TableHead>
              <TableHead className="text-right">{t('recruitment.it.thActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {t('recruitment.it.loading')}
                </TableCell>
              </TableRow>
            ) : filteredInterviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {interviews.length === 0 
                    ? t('recruitment.it.noInterviews')
                    : t('recruitment.it.noFilterResult')}
                </TableCell>
              </TableRow>
            ) : (
              filteredInterviews.map((interview) => {
                const status = statusConfig[interview.status || 'scheduled'] || statusConfig.scheduled;
                const StatusIcon = status.icon;
                const type = typeConfig[interview.interview_type || 'onsite'] || typeConfig.onsite;
                const TypeIcon = type.icon;
                const result = resultConfig[interview.result || 'pending'] || resultConfig.pending;
                const ResultIcon = result.icon;

                return (
                  <TableRow key={interview.id}>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="font-medium">{interview.candidate_name}</p>
                          {interview.candidate_id && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Link2 className="w-3 h-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>{t('recruitment.it.linkedCandidate')}</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        {interview.candidate_email && (
                          <p className="text-xs text-muted-foreground">{interview.candidate_email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{interview.position || '-'}</p>
                        {interview.job_posting_id && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Link2 className="w-3 h-3" />
                            {getJobPostingTitle(interview.job_posting_id) || t('recruitment.it.jobPosting')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {t('recruitment.it.roundLabel', { num: interview.interview_round || 1 })}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {format(new Date(interview.interview_date), 'dd/MM/yyyy', { locale: vi })}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {interview.interview_time}
                            {interview.duration_minutes && ` (${t('recruitment.it.minuteLabel', { num: interview.duration_minutes })})`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-0 bg-muted">
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {type.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {interview.interviewer_name ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm">{interview.interviewer_name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${status.color} border-0`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${result.color} border-0`}>
                        <ResultIcon className="w-3 h-3 mr-1" />
                        {result.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetail(interview)}>
                            <Eye className="w-4 h-4 mr-2" />
                            {t('recruitment.it.viewDetail')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenUpdate(interview)}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('recruitment.it.update')}
                          </DropdownMenuItem>
                          {interview.candidate_id && (
                            <DropdownMenuItem onClick={() => handleOpenEvaluation(interview)}>
                              <ClipboardList className="w-4 h-4 mr-2" />
                              {t('recruitment.it.evaluateCandidate')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteConfirm(interview)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('recruitment.it.deleteBtn')}
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
      </Card>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-0">
          <InterviewCalendarView
            interviews={filteredInterviews}
            onViewDetail={handleViewDetail}
            onOpenUpdate={handleOpenUpdate}
          />
        </TabsContent>
      </Tabs>
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {t('recruitment.it.detailTitle')}
            </DialogTitle>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-6">
              {/* Candidate Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {t('recruitment.it.candidateInfo')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('recruitment.it.fullName')}</p>
                    <p className="font-medium">{selectedInterview.candidate_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('recruitment.it.appliedPosition')}</p>
                    <p className="font-medium">{selectedInterview.position || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('recruitment.it.email')}</p>
                    <p className="font-medium">{selectedInterview.candidate_email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('recruitment.it.phone')}</p>
                    <p className="font-medium">{selectedInterview.candidate_phone || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Interview Info */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {t('recruitment.it.interviewInfo')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('recruitment.it.interviewDate')}</p>
                    <p className="font-medium">
                      {format(new Date(selectedInterview.interview_date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('recruitment.it.time')}</p>
                    <p className="font-medium">
                      {selectedInterview.interview_time}
                      {selectedInterview.duration_minutes && ` (${t('recruitment.it.minuteLabel', { num: selectedInterview.duration_minutes })})`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('recruitment.it.format')}</p>
                    <p className="font-medium">
                      {typeConfig[selectedInterview.interview_type || 'onsite']?.label || t('recruitment.it.types.onsite')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('recruitment.it.locationLink')}</p>
                    <p className="font-medium">
                      {selectedInterview.location || selectedInterview.meeting_link || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('recruitment.it.interviewer')}</p>
                    <p className="font-medium">{selectedInterview.interviewer_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('recruitment.it.thStatus')}</p>
                    <Badge
                      variant="outline"
                      className={`${statusConfig[selectedInterview.status || 'scheduled']?.color || ''} border-0`}
                    >
                      {statusConfig[selectedInterview.status || 'scheduled']?.label || t('recruitment.it.statuses.scheduled')}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Rating & Feedback */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {t('recruitment.it.ratingFeedback')}
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{t('recruitment.it.rating')}</p>
                    {renderStars(selectedInterview.rating)}
                  </div>
                  {selectedInterview.feedback && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t('recruitment.it.feedback')}</p>
                      <p className="bg-muted p-3 rounded-md text-sm">{selectedInterview.feedback}</p>
                    </div>
                  )}
                  {selectedInterview.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t('recruitment.it.notes')}</p>
                      <p className="bg-muted p-3 rounded-md text-sm">{selectedInterview.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  {t('recruitment.it.close')}
                </Button>
                <Button onClick={() => {
                  setIsDetailDialogOpen(false);
                  handleOpenUpdate(selectedInterview);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  {t('recruitment.it.update')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              {t('recruitment.it.updateTitle')}
            </DialogTitle>
          </DialogHeader>
          {selectedInterview && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitUpdate)} className="space-y-6">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="font-medium">{selectedInterview.candidate_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedInterview.position} - {format(new Date(selectedInterview.interview_date), 'dd/MM/yyyy')} {selectedInterview.interview_time}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('recruitment.it.thStatus')} <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('recruitment.it.selectStatus')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <config.icon className="w-4 h-4" />
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('recruitment.it.ratingLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('recruitment.it.selectRating')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">{t('recruitment.it.noRating')}</SelectItem>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: rating }, (_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="result"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('recruitment.it.resultTitle')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('recruitment.it.selectResult')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(resultConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <config.icon className="w-4 h-4" />
                                  {config.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('recruitment.it.feedbackLabel')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('recruitment.it.feedbackPlaceholder')}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="next_steps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('recruitment.it.nextSteps')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('recruitment.it.nextStepsPlaceholder')}
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUpdateDialogOpen(false)}
                  >
                    {t('recruitment.it.cancelBtn')}
                  </Button>
                  <Button type="submit">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('recruitment.it.update')}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recruitment.it.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('recruitment.it.confirmDeleteMsg', { name: interviewToDelete?.candidate_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('recruitment.it.cancelBtn')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('recruitment.it.deleteBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Next Round Confirmation Dialog */}
      <AlertDialog open={isNextRoundDialogOpen} onOpenChange={setIsNextRoundDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              {t('recruitment.it.passTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                {t('recruitment.it.passMsg', { name: interviewForNextRound?.candidate_name, round: interviewForNextRound?.interview_round || 1 })}
              </p>
              <p>{t('recruitment.it.createNextRound')}</p>
              <p className="text-sm text-muted-foreground">
                {t('recruitment.it.nextRoundNote')}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setInterviewForNextRound(null)}>
              {t('recruitment.it.notNow')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => interviewForNextRound && createNextRoundInterview(interviewForNextRound)}
              disabled={creatingNextRound}
              className="bg-green-600 hover:bg-green-700"
            >
              {creatingNextRound ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t('recruitment.it.creating')}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('recruitment.it.createRound', { num: (interviewForNextRound?.interview_round || 1) + 1 })}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Candidate Evaluation Dialog */}
      {interviewForEvaluation && interviewForEvaluation.candidate_id && (
        <CandidateEvaluationDialog
          candidate={{
            id: interviewForEvaluation.candidate_id,
            full_name: interviewForEvaluation.candidate_name,
            email: interviewForEvaluation.candidate_email || '',
            position: interviewForEvaluation.position,
          }}
          interviewId={interviewForEvaluation.id}
          open={isEvaluationDialogOpen}
          onOpenChange={(open) => {
            setIsEvaluationDialogOpen(open);
            if (!open) setInterviewForEvaluation(null);
          }}
          onSaved={fetchInterviews}
        />
      )}
    </div>
  );
}
