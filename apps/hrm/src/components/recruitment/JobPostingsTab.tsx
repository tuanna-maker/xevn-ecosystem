import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Plus,
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Edit,
  Eye,
  Trash2,
  CalendarIcon,
  Building2,
  ChevronRight,
  Clock,
  Download,
  LayoutGrid,
  List,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { JobCandidatesDialog } from './JobCandidatesDialog';

interface JobPosting {
  id: string;
  company_id: string;
  title: string;
  department: string | null;
  position: string;
  employment_type: string;
  work_location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  is_salary_visible: boolean | null;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  headcount: number;
  applied_count: number | null;
  status: string;
  deadline: string | null;
  priority: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

const formatCurrency = (amount: number | null) => {
  if (!amount) return '';
  return new Intl.NumberFormat('vi-VN').format(amount);
};

export function JobPostingsTab() {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isCandidatesOpen, setIsCandidatesOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusOptions = [
    { value: 'all', label: t('recruitment.jt.statuses.all') },
    { value: 'active', label: t('recruitment.jt.statuses.active') },
    { value: 'draft', label: t('recruitment.jt.statuses.draft') },
    { value: 'paused', label: t('recruitment.jt.statuses.paused') },
    { value: 'closed', label: t('recruitment.jt.statuses.closed') },
  ];

  const employmentTypes = [
    { value: 'full-time', label: t('recruitment.jt.employmentTypes.full-time') },
    { value: 'part-time', label: t('recruitment.jt.employmentTypes.part-time') },
    { value: 'contract', label: t('recruitment.jt.employmentTypes.contract') },
    { value: 'intern', label: t('recruitment.jt.employmentTypes.intern') },
    { value: 'freelance', label: t('recruitment.jt.employmentTypes.freelance') },
  ];

  const priorityOptions = [
    { value: 'low', label: t('recruitment.jt.priorities.low'), color: 'bg-slate-100 text-slate-700' },
    { value: 'medium', label: t('recruitment.jt.priorities.medium'), color: 'bg-amber-100 text-amber-700' },
    { value: 'high', label: t('recruitment.jt.priorities.high'), color: 'bg-orange-100 text-orange-700' },
    { value: 'urgent', label: t('recruitment.jt.priorities.urgent'), color: 'bg-red-100 text-red-700' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">{t('recruitment.jt.statuses.active')}</Badge>;
      case 'draft':
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-0">{t('recruitment.jt.statuses.draft')}</Badge>;
      case 'paused':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">{t('recruitment.jt.statuses.paused')}</Badge>;
      case 'closed':
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">{t('recruitment.jt.statuses.closed')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string | null) => {
    const option = priorityOptions.find(p => p.value === priority) || priorityOptions[1];
    return <Badge className={cn(option.color, 'hover:' + option.color, 'border-0')}>{option.label}</Badge>;
  };

  const jobPostingSchema = z.object({
    title: z.string().min(1, t('recruitment.form.titleRequired')).max(200, t('recruitment.form.titleMax')),
    department: z.string().optional(),
    position: z.string().min(1, t('recruitment.form.typeRequired')),
    employment_type: z.string().min(1, t('recruitment.form.typeRequired')),
    work_location: z.string().optional(),
    salary_min: z.string().optional(),
    salary_max: z.string().optional(),
    is_salary_visible: z.boolean().default(true),
    description: z.string().optional(),
    requirements: z.string().optional(),
    benefits: z.string().optional(),
    headcount: z.string().min(1, t('recruitment.form.openingsRequired')),
    deadline: z.date().optional(),
    priority: z.string().default('medium'),
    status: z.string().default('draft'),
  });

  type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

  const form = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: '',
      department: '',
      position: '',
      employment_type: 'full-time',
      work_location: '',
      salary_min: '',
      salary_max: '',
      is_salary_visible: true,
      description: '',
      requirements: '',
      benefits: '',
      headcount: '1',
      priority: 'medium',
      status: 'draft',
    },
  });

  // Fetch job postings with candidate count
  const { data: jobPostings = [], isLoading } = useQuery({
    queryKey: ['job_postings', currentCompanyId, statusFilter],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      
      let query = supabase
        .from('job_postings')
        .select(`
          *,
          candidate_applications (count)
        `)
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data.map(job => ({
        ...job,
        candidate_count: job.candidate_applications?.[0]?.count || 0,
      })) as (JobPosting & { candidate_count: number })[];
    },
    enabled: !!currentCompanyId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: JobPostingFormValues) => {
      const { error } = await supabase.from('job_postings').insert({
        company_id: currentCompanyId!,
        title: values.title,
        department: values.department || null,
        position: values.position,
        employment_type: values.employment_type,
        work_location: values.work_location || null,
        salary_min: values.salary_min ? parseFloat(values.salary_min.replace(/,/g, '')) : null,
        salary_max: values.salary_max ? parseFloat(values.salary_max.replace(/,/g, '')) : null,
        is_salary_visible: values.is_salary_visible,
        description: values.description || null,
        requirements: values.requirements || null,
        benefits: values.benefits || null,
        headcount: parseInt(values.headcount),
        deadline: values.deadline ? format(values.deadline, 'yyyy-MM-dd') : null,
        priority: values.priority,
        status: values.status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_postings'] });
      toast.success(t('recruitment.createJobSuccess'));
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: JobPostingFormValues & { id: string }) => {
      const { error } = await supabase
        .from('job_postings')
        .update({
          title: values.title,
          department: values.department || null,
          position: values.position,
          employment_type: values.employment_type,
          work_location: values.work_location || null,
          salary_min: values.salary_min ? parseFloat(values.salary_min.replace(/,/g, '')) : null,
          salary_max: values.salary_max ? parseFloat(values.salary_max.replace(/,/g, '')) : null,
          is_salary_visible: values.is_salary_visible,
          description: values.description || null,
          requirements: values.requirements || null,
          benefits: values.benefits || null,
          headcount: parseInt(values.headcount),
          deadline: values.deadline ? format(values.deadline, 'yyyy-MM-dd') : null,
          priority: values.priority,
          status: values.status,
        })
        .eq('id', values.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_postings'] });
      toast.success(t('recruitment.it.updateSuccess'));
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('job_postings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_postings'] });
      toast.success(t('recruitment.it.deleteSuccess'));
      setIsDeleteOpen(false);
      setSelectedJob(null);
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('job_postings').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_postings'] });
      toast.success(t('recruitment.jt.deleteSelected', { count: selectedItems.length }));
      setIsBulkDeleteOpen(false);
      setSelectedItems([]);
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    },
  });

  // Filter by search
  const filteredList = jobPostings.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.department?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (job.work_location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingJob(null);
    form.reset();
  };

  const handleOpenCreate = () => {
    setEditingJob(null);
    form.reset({
      title: '',
      department: '',
      position: '',
      employment_type: 'full-time',
      work_location: '',
      salary_min: '',
      salary_max: '',
      is_salary_visible: true,
      description: '',
      requirements: '',
      benefits: '',
      headcount: '1',
      priority: 'medium',
      status: 'draft',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (job: JobPosting) => {
    setEditingJob(job);
    form.reset({
      title: job.title,
      department: job.department || '',
      position: job.position,
      employment_type: job.employment_type,
      work_location: job.work_location || '',
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
      is_salary_visible: job.is_salary_visible ?? true,
      description: job.description || '',
      requirements: job.requirements || '',
      benefits: job.benefits || '',
      headcount: job.headcount.toString(),
      deadline: job.deadline ? new Date(job.deadline) : undefined,
      priority: job.priority || 'medium',
      status: job.status,
    });
    setIsFormOpen(true);
  };

  const handleOpenView = (job: JobPosting) => {
    setSelectedJob(job);
    setIsViewOpen(true);
  };

  const handleOpenCandidates = (job: JobPosting) => {
    setSelectedJob(job);
    setIsCandidatesOpen(true);
  };

  const handleOpenDelete = (job: JobPosting) => {
    setSelectedJob(job);
    setIsDeleteOpen(true);
  };

  const onSubmit = (values: JobPostingFormValues) => {
    if (editingJob) {
      updateMutation.mutate({ ...values, id: editingJob.id });
    } else {
      createMutation.mutate(values);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedList.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedList.map((j) => j.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Stats
  const stats = {
    total: jobPostings.length,
    active: jobPostings.filter(j => j.status === 'active').length,
    draft: jobPostings.filter(j => j.status === 'draft').length,
    totalHeadcount: jobPostings.filter(j => j.status === 'active').reduce((sum, j) => sum + j.headcount, 0),
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('recruitment.jt.totalPosts')}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('recruitment.jt.activeRecruitment')}</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('recruitment.jt.draftPosts')}</p>
                <p className="text-2xl font-bold">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('recruitment.jt.needHire')}</p>
                <p className="text-2xl font-bold">{stats.totalHeadcount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {t('recruitment.jt.createPost')}
          </Button>
          {selectedItems.length > 0 && (
            <Button variant="destructive" onClick={() => setIsBulkDeleteOpen(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t('recruitment.jt.deleteSelected', { count: selectedItems.length })}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('recruitment.jt.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === 'list' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.length === paginatedList.length && paginatedList.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>{t('recruitment.jt.thTitle')}</TableHead>
                <TableHead>{t('recruitment.jt.thDepartment')}</TableHead>
                <TableHead>{t('recruitment.jt.thLocation')}</TableHead>
                <TableHead>{t('recruitment.jt.thType')}</TableHead>
                <TableHead className="text-center">{t('recruitment.jt.thHeadcount')}</TableHead>
                <TableHead className="text-center">{t('recruitment.jt.thCandidates')}</TableHead>
                <TableHead>{t('recruitment.jt.thSalary')}</TableHead>
                <TableHead>{t('recruitment.jt.thDeadline')}</TableHead>
                <TableHead>{t('recruitment.jt.thPriority')}</TableHead>
                <TableHead>{t('recruitment.jt.thStatus')}</TableHead>
                <TableHead className="w-28"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                    {t('recruitment.jt.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedList.map((job) => (
                  <TableRow key={job.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems.includes(job.id)}
                        onCheckedChange={() => toggleSelectItem(job.id)}
                      />
                    </TableCell>
                    <TableCell onClick={() => handleOpenView(job)}>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-xs text-muted-foreground">{job.position}</div>
                    </TableCell>
                    <TableCell>{job.department || '-'}</TableCell>
                    <TableCell>{job.work_location || '-'}</TableCell>
                    <TableCell>
                      {employmentTypes.find(t => t.value === job.employment_type)?.label || job.employment_type}
                    </TableCell>
                    <TableCell className="text-center">{job.headcount}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary"
                        onClick={(e) => { e.stopPropagation(); handleOpenCandidates(job); }}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        {(job as any).candidate_count || 0}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {job.salary_min || job.salary_max ? (
                        <span className="text-sm">
                          {job.salary_min ? formatCurrency(job.salary_min) : '...'} - {job.salary_max ? formatCurrency(job.salary_max) : '...'} đ
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{t('recruitment.jt.negotiable')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.deadline ? format(new Date(job.deadline), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell>{getPriorityBadge(job.priority)}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenCandidates(job)} title={t('recruitment.jt.viewCandidates')}>
                          <UserPlus className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenView(job)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(job)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(job)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {paginatedList.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOpenView(job)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(job.priority)}
                    {getStatusBadge(job.status)}
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{job.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{job.position}</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {job.department && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{job.department}</span>
                    </div>
                  )}
                  {job.work_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{job.work_location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{t('recruitment.jt.needPeople', { count: job.headcount })}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary p-0 h-auto"
                      onClick={(e) => { e.stopPropagation(); handleOpenCandidates(job); }}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      {t('recruitment.jt.candidateCount', { count: (job as any).candidate_count || 0 })}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="text-sm">
                    {job.salary_min || job.salary_max ? (
                      <span className="text-primary font-medium">
                        {formatCurrency(job.salary_min || 0)} - {formatCurrency(job.salary_max || 0)} đ
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{t('recruitment.jt.negotiable')}</span>
                    )}
                  </div>
                  {job.deadline && (
                    <div className="text-xs text-muted-foreground">
                      {t('recruitment.jt.deadline', { date: format(new Date(job.deadline), 'dd/MM/yyyy') })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('recruitment.jt.showing', { from: (currentPage - 1) * itemsPerPage + 1, to: Math.min(currentPage * itemsPerPage, filteredList.length), total: filteredList.length })}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              {t('recruitment.jt.prev')}
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, currentPage - 3),
              Math.min(totalPages, currentPage + 2)
            ).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              {t('recruitment.jt.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              {editingJob ? t('recruitment.jt.editPostTitle') : t('recruitment.jt.createPostTitle')}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('recruitment.jt.basicInfo')}</h3>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('recruitment.jt.titleLabel')} <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder={t('recruitment.jt.titlePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('recruitment.jt.positionLabel')} <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder={t('recruitment.jt.positionPlaceholder')} {...field} />
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
                        <FormLabel>{t('recruitment.jt.departmentLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('recruitment.jt.departmentPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="employment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('recruitment.jt.typeLabel')} <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('recruitment.jt.selectType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employmentTypes.map((et) => (
                              <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="work_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('recruitment.jt.locationLabel')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder={t('recruitment.jt.locationPlaceholder')} className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="headcount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('recruitment.jt.headcountLabel')} <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salary_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('recruitment.jt.salaryMin')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="VD: 15000000" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salary_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('recruitment.jt.salaryMax')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="VD: 25000000" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{t('recruitment.jt.deadlineLabel')}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "dd/MM/yyyy") : t('recruitment.jt.selectDate')}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
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
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('recruitment.jt.priorityLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('recruitment.jt.selectPriority')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priorityOptions.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
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
                        <FormLabel>{t('recruitment.jt.statusLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('recruitment.jt.selectStatus')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">{t('recruitment.jt.statuses.draft')}</SelectItem>
                            <SelectItem value="active">{t('recruitment.jt.statuses.active')}</SelectItem>
                            <SelectItem value="paused">{t('recruitment.jt.statuses.paused')}</SelectItem>
                            <SelectItem value="closed">{t('recruitment.jt.statuses.closed')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('recruitment.jt.jobDetails')}</h3>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('recruitment.jt.descriptionLabel')}</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder={t('recruitment.jt.descriptionPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('recruitment.jt.requirementsLabel')}</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder={t('recruitment.jt.requirementsPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('recruitment.jt.benefitsLabel')}</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder={t('recruitment.jt.benefitsPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCloseForm}>{t('recruitment.jt.cancelBtn')}</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingJob ? t('recruitment.jt.updateBtn') : t('recruitment.jt.createBtn')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl">{selectedJob.title}</h2>
                    <p className="text-sm text-muted-foreground font-normal">{selectedJob.position}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  {getStatusBadge(selectedJob.status)}
                  {getPriorityBadge(selectedJob.priority)}
                  <Badge variant="outline">
                    {employmentTypes.find(et => et.value === selectedJob.employment_type)?.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{selectedJob.headcount}</p>
                    <p className="text-xs text-muted-foreground">{t('recruitment.jt.headcountStat')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedJob.applied_count || 0}</p>
                    <p className="text-xs text-muted-foreground">{t('recruitment.jt.candidatesStat')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {selectedJob.salary_min || selectedJob.salary_max ? (
                        <span className="text-lg">{formatCurrency(selectedJob.salary_min || 0)}</span>
                      ) : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('recruitment.jt.minSalary')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {selectedJob.deadline ? (
                        Math.max(0, Math.ceil((new Date(selectedJob.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                      ) : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('recruitment.jt.daysLeft')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('recruitment.jt.departmentInfo')}</span>
                    <span>{selectedJob.department || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('recruitment.jt.locationInfo')}</span>
                    <span>{selectedJob.work_location || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('recruitment.jt.deadlineInfo')}</span>
                    <span>{selectedJob.deadline ? format(new Date(selectedJob.deadline), 'dd/MM/yyyy') : '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('recruitment.jt.salaryInfo')}</span>
                    <span>
                      {selectedJob.salary_min || selectedJob.salary_max ? (
                        `${formatCurrency(selectedJob.salary_min || 0)} - ${formatCurrency(selectedJob.salary_max || 0)} VNĐ`
                      ) : t('recruitment.jt.negotiable')}
                    </span>
                  </div>
                </div>

                {selectedJob.description && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('recruitment.jt.descriptionTitle')}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob.description}</p>
                  </div>
                )}

                {selectedJob.requirements && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('recruitment.jt.requirementsTitle')}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob.requirements}</p>
                  </div>
                )}

                {selectedJob.benefits && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('recruitment.jt.benefitsTitle')}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob.benefits}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsViewOpen(false)}>{t('recruitment.jt.closeBtn')}</Button>
                  <Button onClick={() => { setIsViewOpen(false); handleOpenEdit(selectedJob); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t('recruitment.jt.editBtn')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recruitment.jt.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('recruitment.jt.confirmDeleteMsg', { title: selectedJob?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('recruitment.jt.cancelBtn')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => selectedJob && deleteMutation.mutate(selectedJob.id)}
            >
              {t('recruitment.it.deleteBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recruitment.jt.confirmBulkDelete', { count: selectedItems.length })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('recruitment.jt.confirmBulkDeleteMsg', { count: selectedItems.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('recruitment.jt.cancelBtn')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => bulkDeleteMutation.mutate(selectedItems)}
            >
              {t('recruitment.jt.deleteAll')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Candidates Dialog */}
      {selectedJob && (
        <JobCandidatesDialog
          open={isCandidatesOpen}
          onOpenChange={setIsCandidatesOpen}
          jobPostingId={selectedJob.id}
          jobTitle={selectedJob.title}
        />
      )}
    </div>
  );
}
