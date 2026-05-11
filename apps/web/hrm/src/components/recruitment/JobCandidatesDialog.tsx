import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Plus,
  UserPlus,
  Mail,
  Phone,
  Star,
  Trash2,
  Calendar,
  Users,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string | null;
  stage: string | null;
  rating: number | null;
  avatar_url: string | null;
  applied_date: string | null;
  source: string | null;
}

interface CandidateApplication {
  id: string;
  candidate_id: string;
  job_posting_id: string;
  company_id: string;
  applied_date: string | null;
  stage: string | null;
  rating: number | null;
  notes: string | null;
  interview_date: string | null;
  interviewer: string | null;
  salary_expectation: number | null;
  created_at: string;
  candidates: Candidate;
}

interface JobCandidatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobPostingId: string;
  jobTitle: string;
}

const getStageOptions = (t: (k: string) => string) => [
  { value: 'applied', label: t('jobCand.stage.applied'), color: 'bg-blue-100 text-blue-700', icon: Clock },
  { value: 'screening', label: t('jobCand.stage.screening'), color: 'bg-amber-100 text-amber-700', icon: Users },
  { value: 'interview', label: t('jobCand.stage.interview'), color: 'bg-purple-100 text-purple-700', icon: Calendar },
  { value: 'offer', label: t('jobCand.stage.offer'), color: 'bg-cyan-100 text-cyan-700', icon: UserCheck },
  { value: 'hired', label: t('jobCand.stage.hired'), color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  { value: 'rejected', label: t('jobCand.stage.rejected'), color: 'bg-rose-100 text-rose-700', icon: XCircle },
];

export function JobCandidatesDialog({
  open,
  onOpenChange,
  jobPostingId,
  jobTitle,
}: JobCandidatesDialogProps) {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();
  const stageOptions = getStageOptions(t);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<CandidateApplication | null>(null);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');

  // Fetch applications for this job posting
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['candidate_applications', jobPostingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidate_applications')
        .select(`
          *,
          candidates (
            id,
            full_name,
            email,
            phone,
            position,
            stage,
            rating,
            avatar_url,
            applied_date,
            source
          )
        `)
        .eq('job_posting_id', jobPostingId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CandidateApplication[];
    },
    enabled: open && !!jobPostingId,
  });

  // Fetch all candidates not yet linked to this job
  const { data: availableCandidates = [] } = useQuery({
    queryKey: ['available_candidates', jobPostingId, currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      
      // Get IDs of candidates already linked
      const linkedIds = applications.map(a => a.candidate_id);
      
      let query = supabase
        .from('candidates')
        .select('*')
        .eq('company_id', currentCompanyId);
      
      if (linkedIds.length > 0) {
        query = query.not('id', 'in', `(${linkedIds.join(',')})`);
      }
      
      const { data, error } = await query.order('full_name');
      if (error) throw error;
      return data as Candidate[];
    },
    enabled: isAddDialogOpen && !!currentCompanyId,
  });

  // Add candidate to job
  const addCandidateMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const { error } = await supabase.from('candidate_applications').insert({
        candidate_id: candidateId,
        job_posting_id: jobPostingId,
        company_id: currentCompanyId!,
        stage: 'applied',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate_applications', jobPostingId] });
      queryClient.invalidateQueries({ queryKey: ['available_candidates', jobPostingId] });
      queryClient.invalidateQueries({ queryKey: ['job_postings'] });
      toast.success(t('jobCand.addedSuccess'));
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    },
  });

  // Update application stage
  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { error } = await supabase
        .from('candidate_applications')
        .update({ stage })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate_applications', jobPostingId] });
      toast.success(t('jobCand.stageUpdated'));
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    },
  });

  // Remove candidate from job
  const removeCandidateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('candidate_applications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate_applications', jobPostingId] });
      queryClient.invalidateQueries({ queryKey: ['available_candidates', jobPostingId] });
      queryClient.invalidateQueries({ queryKey: ['job_postings'] });
      toast.success(t('jobCand.removedSuccess'));
      setIsRemoveDialogOpen(false);
      setSelectedApplication(null);
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    },
  });

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const candidate = app.candidates;
    const matchesSearch = 
      candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (candidate.phone?.includes(searchQuery) ?? false);
    const matchesStage = stageFilter === 'all' || app.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Filter available candidates
  const filteredAvailableCandidates = availableCandidates.filter(c =>
    c.full_name.toLowerCase().includes(candidateSearchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(candidateSearchQuery.toLowerCase())
  );

  // Stats
  const stats = stageOptions.map(stage => ({
    ...stage,
    count: applications.filter(a => a.stage === stage.value).length,
  }));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {t('jobCand.title')} - {jobTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-6 gap-2">
              {stats.map(stat => (
                <Card key={stat.value} className="cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => setStageFilter(stageFilter === stat.value ? 'all' : stat.value)}>
                  <CardContent className="p-3 text-center">
                    <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color.split(' ')[1]}`} />
                    <p className="text-lg font-bold">{stat.count}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('jobCand.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="w-[150px]">
                     <SelectValue placeholder={t('jobCand.status')} />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">{t('common.all')}</SelectItem>
                    {stageOptions.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                {t('jobCand.addCandidate')}
              </Button>
            </div>

            {/* Candidates Table */}
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                   <p>{t('jobCand.noCandidates')}</p>
                   <Button variant="link" onClick={() => setIsAddDialogOpen(true)}>
                     {t('jobCand.addFirst')}
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                       <TableHead>{t('jobCand.col.candidate')}</TableHead>
                       <TableHead>{t('jobCand.col.contact')}</TableHead>
                       <TableHead>{t('jobCand.col.appliedDate')}</TableHead>
                       <TableHead>{t('jobCand.col.rating')}</TableHead>
                       <TableHead>{t('jobCand.col.stage')}</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarImage src={app.candidates.avatar_url || undefined} />
                              <AvatarFallback>
                                {app.candidates.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{app.candidates.full_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {app.candidates.position || t('jobCand.noPosition')}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {app.candidates.email}
                            </div>
                            {app.candidates.phone && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {app.candidates.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {app.applied_date ? format(new Date(app.applied_date), 'dd/MM/yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= (app.rating || 0)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={app.stage || 'applied'}
                            onValueChange={(value) => updateStageMutation.mutate({ id: app.id, stage: value })}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {stageOptions.map(s => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedApplication(app);
                              setIsRemoveDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Candidate Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('jobCand.addToJob')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('jobCand.searchByNameEmail')}
                value={candidateSearchQuery}
                onChange={(e) => setCandidateSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[400px]">
              {filteredAvailableCandidates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {t('jobCand.noAvailable')}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailableCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() => addCandidateMutation.mutate(candidate.id)}
                    >
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
                      <div className="flex items-center gap-2">
                        {candidate.position && (
                          <Badge variant="outline">{candidate.position}</Badge>
                        )}
                        <Button size="sm" disabled={addCandidateMutation.isPending}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
             <AlertDialogTitle>{t('jobCand.removeTitle')}</AlertDialogTitle>
             <AlertDialogDescription>
               {t('jobCand.removeConfirm', { name: selectedApplication?.candidates.full_name })}
             </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => selectedApplication && removeCandidateMutation.mutate(selectedApplication.id)}
             >
               {t('common.delete')}
             </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
