import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  Linkedin,
  Globe,
  Users,
  Mail,
  Briefcase,
  Facebook,
  X,
  CalendarClock,
  RefreshCw,
  Loader2,
  Star,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Upload,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { ScheduleInterviewDialog } from './ScheduleInterviewDialog';
import { CandidateFormDialog } from './CandidateFormDialog';
import { CandidateDetailView } from './CandidateDetailView';
import { CandidateEvaluationDialog } from './CandidateEvaluationDialog';
import { CandidateImportDialog } from './CandidateImportDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Candidate {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  source?: string | null;
  stage?: string | null;
  rating?: number | null;
  applied_date?: string | null;
  expected_start_date?: string | null;
  nationality?: string | null;
  hometown?: string | null;
  marital_status?: string | null;
  notes?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

const getStageConfig = (t: any): Record<string, { label: string; color: string; icon: React.ReactNode }> => ({
  applied: { label: t('recruitment.ct.stages.applied'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Users className="w-4 h-4" /> },
  screening: { label: t('recruitment.ct.stages.screening'), color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="w-4 h-4" /> },
  interview: { label: t('recruitment.ct.stages.interview'), color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: <UserCheck className="w-4 h-4" /> },
  offer: { label: t('recruitment.ct.stages.offer'), color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: <CheckCircle className="w-4 h-4" /> },
  hired: { label: t('recruitment.ct.stages.hired'), color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-4 h-4" /> },
  rejected: { label: t('recruitment.ct.stages.rejected'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="w-4 h-4" /> },
});

const getSourceConfig = (source: string, t: any) => {
  const sourceConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
    'LinkedIn': { label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    'Website': { label: 'Website', icon: Globe, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    'Giới thiệu': { label: t('recruitment.ct.sources.referral'), icon: Users, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    'Referral': { label: t('recruitment.ct.sources.referral'), icon: Users, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    'Email': { label: 'Email', icon: Mail, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    'TopCV': { label: 'TopCV', icon: Briefcase, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    'VietnamWorks': { label: 'VietnamWorks', icon: Briefcase, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    'Facebook': { label: 'Facebook', icon: Facebook, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
    'Hội chợ việc làm': { label: t('recruitment.ct.sources.jobFair'), icon: Users, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  };
  return sourceConfig[source] || {
    label: source || t('recruitment.ct.sources.other'),
    icon: Briefcase,
    color: 'bg-muted text-muted-foreground',
  };
};

export function CandidatesTab() {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const stageConfig = getStageConfig(t);
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [activeStageTab, setActiveStageTab] = useState('all');
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCandidate, setDeletingCandidate] = useState<Candidate | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState<Candidate | null>(null);
  const [selectedCandidateForDetail, setSelectedCandidateForDetail] = useState<Candidate | null>(null);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [evaluatingCandidate, setEvaluatingCandidate] = useState<Candidate | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const fetchCandidates = async () => {
    if (!currentCompanyId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error: any) {
      console.error('Error fetching candidates:', error);
      toast({
        title: t('common.error'),
        description: t('recruitment.ct.errorLoad'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [currentCompanyId]);

  const handleDelete = async () => {
    if (!deletingCandidate) return;
    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', deletingCandidate.id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('recruitment.ct.deleteSuccess'),
      });

      fetchCandidates();
    } catch (error: any) {
      console.error('Error deleting candidate:', error);
      toast({
        title: t('common.error'),
        description: t('recruitment.ct.deleteError'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingCandidate(null);
    }
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsFormDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingCandidate(null);
    setIsFormDialogOpen(true);
  };

  const handleScheduleInterview = (candidate: Candidate) => {
    setSelectedCandidateForInterview(candidate);
    setIsScheduleDialogOpen(true);
  };

  const handleUpdateStage = async (candidateId: string, newStage: string) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ stage: newStage })
        .eq('id', candidateId);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('recruitment.ct.stageUpdateSuccess'),
      });

      fetchCandidates();
    } catch (error: any) {
      console.error('Error updating stage:', error);
      toast({
        title: t('common.error'),
        description: t('recruitment.ct.stageUpdateError'),
        variant: 'destructive',
      });
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredCandidates.map((candidate) => ({
      [t('recruitment.ct.exFullName')]: candidate.full_name,
      'Email': candidate.email,
      [t('recruitment.ct.exPhone')]: candidate.phone || '',
      [t('recruitment.ct.exPosition')]: candidate.position || '',
      [t('recruitment.ct.exSource')]: candidate.source || '',
      [t('recruitment.ct.exStage')]: stageConfig[candidate.stage || 'applied']?.label || '',
      [t('recruitment.ct.exRating')]: candidate.rating || '',
      [t('recruitment.ct.exAppliedDate')]: candidate.applied_date
        ? format(new Date(candidate.applied_date), 'dd/MM/yyyy', { locale: vi })
        : '',
      [t('recruitment.ct.exNationality')]: candidate.nationality || '',
      [t('recruitment.ct.exHometown')]: candidate.hometown || '',
      [t('recruitment.ct.exNotes')]: candidate.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('recruitment.ct.exSheetName'));

    worksheet['!cols'] = [
      { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 30 },
    ];

    XLSX.writeFile(workbook, `danh-sach-ung-vien-${format(new Date(), 'dd-MM-yyyy')}.xlsx`);

    toast({
      title: t('recruitment.ct.exportSuccess'),
      description: t('recruitment.ct.exportMsg', { count: exportData.length }),
    });
  };

  const uniqueSources = useMemo(() => {
    const sources = new Set<string>();
    candidates.forEach((c) => {
      if (c.source) sources.add(c.source);
    });
    return Array.from(sources).sort();
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        !searchQuery ||
        candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.position?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStageTab = activeStageTab === 'all' || candidate.stage === activeStageTab;
      const matchesStageFilter = stageFilter === 'all' || candidate.stage === stageFilter;
      const matchesSource = sourceFilter === 'all' || candidate.source === sourceFilter;

      return matchesSearch && matchesStageTab && matchesStageFilter && matchesSource;
    });
  }, [candidates, searchQuery, activeStageTab, stageFilter, sourceFilter]);

  const stageStats = useMemo(() => {
    return {
      all: candidates.length,
      applied: candidates.filter((c) => c.stage === 'applied').length,
      screening: candidates.filter((c) => c.stage === 'screening').length,
      interview: candidates.filter((c) => c.stage === 'interview').length,
      offer: candidates.filter((c) => c.stage === 'offer').length,
      hired: candidates.filter((c) => c.stage === 'hired').length,
      rejected: candidates.filter((c) => c.stage === 'rejected').length,
    };
  }, [candidates]);

  const renderStars = (rating: number | null | undefined) => {
    if (!rating) return <span className="text-muted-foreground text-sm">-</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const hasActiveFilters = stageFilter !== 'all' || sourceFilter !== 'all' || searchQuery;

  const clearFilters = () => {
    setSearchQuery('');
    setStageFilter('all');
    setSourceFilter('all');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('recruitment.ct.title')}</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            {t('recruitment.ct.importExcel')}
          </Button>
          <Button onClick={handleExportExcel} variant="outline" size="sm" disabled={filteredCandidates.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            {t('recruitment.ct.exportExcel')}
          </Button>
          <Button onClick={fetchCandidates} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('recruitment.ct.refresh')}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {t('recruitment.ct.addCandidate')}
          </Button>
        </div>
      </div>

      <Tabs value={activeStageTab} onValueChange={setActiveStageTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 w-full">
          <TabsTrigger value="all" className="gap-2">
            {t('recruitment.ct.all')}
            <Badge variant="secondary" className="ml-1">{stageStats.all}</Badge>
          </TabsTrigger>
          {Object.entries(stageConfig).map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="gap-1">
              {config.icon}
              <span className="hidden sm:inline">{config.label}</span>
              <Badge variant="secondary" className="ml-1">{stageStats[key as keyof typeof stageStats]}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeStageTab} className="mt-4">
          <Card>
            <div className="p-4 border-b">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('recruitment.ct.searchPlaceholder')}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <SelectValue placeholder={t('recruitment.ct.sourcePlaceholder')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('recruitment.ct.allSources')}</SelectItem>
                    {uniqueSources.map((source) => {
                      const config = getSourceConfig(source, t);
                      const Icon = config.icon;
                      return (
                        <SelectItem key={source} value={source}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                    <X className="w-4 h-4 mr-1" />
                    {t('recruitment.ct.clearFilters')}
                  </Button>
                )}
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
                  <span className="text-sm text-muted-foreground">{t('recruitment.ct.filtering')}</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {t('recruitment.ct.keyword')}: "{searchQuery}"
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                    </Badge>
                  )}
                  {sourceFilter !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {t('recruitment.ct.sourceLabel')}: {getSourceConfig(sourceFilter, t).label}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSourceFilter('all')} />
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground ml-auto">
                    {t('recruitment.ct.candidateCount', { count: filteredCandidates.length, total: candidates.length })}
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredCandidates.length === 0 ? (
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {candidates.length === 0
                    ? t('recruitment.ct.noCandidates')
                    : t('recruitment.ct.noFilterResult')}
                </p>
              </CardContent>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('recruitment.ct.thCandidate')}</TableHead>
                    <TableHead>{t('recruitment.ct.thPosition')}</TableHead>
                    <TableHead>{t('recruitment.ct.thSource')}</TableHead>
                    <TableHead>{t('recruitment.ct.thAppliedDate')}</TableHead>
                    <TableHead>{t('recruitment.ct.thStage')}</TableHead>
                    <TableHead>{t('recruitment.ct.thRating')}</TableHead>
                    <TableHead className="text-right">{t('recruitment.ct.thActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => {
                    const sourceConf = getSourceConfig(candidate.source || '', t);
                    const SourceIcon = sourceConf.icon;
                    return (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={candidate.avatar_url || undefined} />
                              <AvatarFallback>{candidate.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{candidate.full_name}</p>
                              <p className="text-sm text-muted-foreground">{candidate.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{candidate.position || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${sourceConf.color} border-0`}>
                            <SourceIcon className="w-3 h-3 mr-1" />
                            {sourceConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {candidate.applied_date
                            ? format(new Date(candidate.applied_date), 'dd/MM/yyyy', { locale: vi })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={candidate.stage || 'applied'}
                            onValueChange={(value) => handleUpdateStage(candidate.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <Badge className={stageConfig[candidate.stage || 'applied']?.color || 'bg-gray-100'}>
                                {stageConfig[candidate.stage || 'applied']?.label || candidate.stage}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(stageConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <Badge className={config.color}>{config.label}</Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{renderStars(candidate.rating)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedCandidateForDetail(candidate)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t('recruitment.ct.viewDetail')}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => handleScheduleInterview(candidate)}>
                                  <CalendarClock className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t('recruitment.ct.scheduleInterview')}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(candidate)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t('recruitment.ct.edit')}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setDeletingCandidate(candidate);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t('recruitment.ct.delete')}</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <CandidateFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        candidate={editingCandidate}
        companyId={currentCompanyId || ''}
        onSuccess={fetchCandidates}
      />

      <ScheduleInterviewDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        candidate={
          selectedCandidateForInterview
            ? {
                id: selectedCandidateForInterview.id,
                fullName: selectedCandidateForInterview.full_name,
                email: selectedCandidateForInterview.email,
                phone: selectedCandidateForInterview.phone || null,
                position: selectedCandidateForInterview.position || null,
              }
            : null
        }
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recruitment.ct.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('recruitment.ct.confirmDeleteMsg', { name: deletingCandidate?.full_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('recruitment.ct.cancelBtn')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('recruitment.ct.deleteBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedCandidateForDetail && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="h-full overflow-auto p-6">
            <CandidateDetailView
              candidate={selectedCandidateForDetail}
              onBack={() => setSelectedCandidateForDetail(null)}
              onEvaluate={() => {
                setEvaluatingCandidate(selectedCandidateForDetail);
                setIsEvaluationDialogOpen(true);
              }}
              onEdit={() => {
                setEditingCandidate(selectedCandidateForDetail);
                setIsFormDialogOpen(true);
              }}
            />
          </div>
        </div>
      )}

      <CandidateEvaluationDialog
        candidate={evaluatingCandidate ? {
          id: evaluatingCandidate.id,
          full_name: evaluatingCandidate.full_name,
          email: evaluatingCandidate.email,
          position: evaluatingCandidate.position || null,
        } : null}
        open={isEvaluationDialogOpen}
        onOpenChange={setIsEvaluationDialogOpen}
        onSaved={fetchCandidates}
      />

      <CandidateImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        companyId={currentCompanyId || ''}
        onImportSuccess={fetchCandidates}
      />
    </div>
  );
}
